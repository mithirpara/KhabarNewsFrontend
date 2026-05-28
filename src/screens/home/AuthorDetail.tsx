import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../config/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import RemoteImage from '../../component/RemoteImage';
import {
  isAuthorFollowed,
  removeFollowId,
  saveFollowId,
} from '../../services/followStorage';
import { sendFollowNotification } from '../../services/pushNotificationService';

const categories = ['News', 'Recent'];

type AuthorFeedItem = {
  id: string;
  articleId?: string;
  category: string;
  title: string;
  source?: string;
  time: string;
  image: string;
  imageUrl?: string;
};

type AuthorDetailRoute = {
  params: {
    author: {
      id?: string;
      name: string;
      image: string | number;
      followers: string;
      following: string;
      newsCount: number | string;
      isFollowing?: boolean;
      bio?: string;
      website?: string;
    };
  };
};

const FALLBACK_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80';
const newsImageFallback = require('../../assets/png/NewsImages.png');

const getPayloadArray = (json: any, key: 'news' | 'recent') => {
  if (Array.isArray(json?.data)) {
    return json.data;
  }

  if (Array.isArray(json?.[key])) {
    return json[key];
  }

  if (Array.isArray(json?.data?.[key])) {
    return json.data[key];
  }

  return [];
};

const normalizeFeedItem = (item: any, index: number): AuthorFeedItem => {
  const id = String(item?.id || item?.articleId || `author-feed-${index}`);
  const image = String(item?.image || item?.imageUrl || item?.urlToImage || FALLBACK_NEWS_IMAGE);

  return {
    ...item,
    id,
    articleId: item?.articleId || id,
    category: String(item?.category || item?.countryName || 'News'),
    title: String(item?.title || item?.bio || 'Untitled news'),
    source: item?.source || item?.newsName,
    time: String(item?.time || 'Just now'),
    image,
    imageUrl: image,
  };
};

const buildAuthorQuery = (author: AuthorDetailRoute['params']['author']) => {
  const authorValue = author.id || author.name || 'BBC News';
  return encodeURIComponent(String(authorValue));
};

const AuthorDetailScreen = ({ route, navigation }: any) => {
  const { colors } = useAppTheme();
  const { author } = route.params;
  const [active, setActive] = useState('News');
  const [newsData, setNewsData] = useState<AuthorFeedItem[]>([]);
  const [recentData, setRecentData] = useState<AuthorFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(author.isFollowing));
  const data = active === 'News' ? newsData : recentData;
  const authorId = String(author.id || author.name || '');
  const authorImageSource =
    typeof author.image === 'string' ? { uri: author.image } : author.image;

  const loadFollowState = useCallback(async () => {
    if (!authorId) {
      return;
    }

    try {
      const saved = await isAuthorFollowed(authorId);
      setIsFollowing(saved);
    } catch (error) {
      console.warn('Failed to load author follow state', error);
    }
  }, [author.isFollowing, authorId]);

  useFocusEffect(
    useCallback(() => {
      loadFollowState();
    }, [loadFollowState]),
  );

  useEffect(() => {
    const fetchAuthorFeeds = async () => {
      try {
        setLoading(true);
        const authorName = buildAuthorQuery(author);
        const [newsResponse, recentResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/author/news?name=${authorName}`),
          fetch(`${API_BASE_URL}/api/author/recent?name=${authorName}`),
        ]);
        const [newsJson, recentJson] = await Promise.all([
          newsResponse.json(),
          recentResponse.json(),
        ]);
        let nextNewsData = getPayloadArray(newsJson, 'news');
        let nextRecentData = getPayloadArray(recentJson, 'recent');

        if (nextNewsData.length === 0 || nextRecentData.length === 0) {
          const [profileNewsResponse, profileRecentResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/profile/news`),
            fetch(`${API_BASE_URL}/api/profile/recent`),
          ]);
          const [profileNewsJson, profileRecentJson] = await Promise.all([
            profileNewsResponse.json(),
            profileRecentResponse.json(),
          ]);

          if (nextNewsData.length === 0) {
            nextNewsData = getPayloadArray(profileNewsJson, 'news');
          }

          if (nextRecentData.length === 0) {
            nextRecentData = getPayloadArray(profileRecentJson, 'recent');
          }
        }

        setNewsData(nextNewsData.map(normalizeFeedItem));
        setRecentData(nextRecentData.map(normalizeFeedItem));
      } catch (error) {
        console.warn('Failed to fetch author feeds', error);
        setNewsData([]);
        setRecentData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorFeeds();
  }, [author.id, author.name]);

  const renderItem = ({ item }: { item: AuthorFeedItem }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.newsCard}
      onPress={() =>
        navigation.navigate('DetailsScreen', {
          article: item,
          articleId: item.articleId || item.id,
        })
      }
    >
      <RemoteImage
        uri={item.image || item.imageUrl}
        fallbackSource={newsImageFallback}
        style={styles.newsImage}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.category, { color: colors.mutedText }]}>{item.category}</Text>
        <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.time, { color: colors.mutedText }]}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleCategoryPress = (category: string) => {
    setActive(category);
  };

  const toggleFollow = async () => {
    if (!authorId) {
      return;
    }

    const willFollow = !isFollowing;
    setIsFollowing(willFollow);

    try {
      if (willFollow) {
        await saveFollowId(authorId);
        await sendFollowNotification(authorId);
      } else {
        await removeFollowId(authorId);
      }
    } catch (error: any) {
      setIsFollowing(!willFollow);
      Alert.alert(
        'Notification failed',
        error?.message || 'Follow ho gaya, lekin notification send nahi hui.',
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack('SearchScreen')}>
              <Image source={require('../../assets/png/backAerro.png')} style={{ tintColor: colors.icon }} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image source={require('../../assets/png/menu.png')} style={{ tintColor: colors.icon }} />
            </TouchableOpacity>
          </View>

          <View style={styles.authorSection}>
            <Image source={authorImageSource} style={styles.authorImage} />

            <View style={styles.statsRow}>
              <View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{author.followers}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Followers</Text>
              </View>

              <View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{author.following}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Following</Text>
              </View>

              <View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{author.newsCount}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>News</Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>{author.name}</Text>

            <Text style={[styles.bio, { color: colors.mutedText }]}>
              {author.bio ||
                'is an operational business division of the British Broadcasting Corporation responsible for the gathering and broadcasting of news and current affairs.'}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={toggleFollow}
                style={[
                  styles.followBtn,
                  !isFollowing && styles.followOutlineBtn,
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    !isFollowing && styles.followOutlineText,
                  ]}
                >
                  {isFollowing ? 'Following' : '+ Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.websiteBtn}>
                <Text style={styles.btnText}>Website</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.scroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleCategoryPress(item)}
                  style={styles.tab}
                >
                  <Text
                    style={[styles.text, { color: colors.mutedText }, active === item && styles.activeText]}
                  >
                    {item}
                  </Text>
                  {active === item && <View style={styles.underline} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>Loading...</Text>
          ) : (
            <FlatList
              data={data}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.mutedText }]}>No {active} Found</Text>
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  authorSection: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 15,
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    width: 65,
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  bio: {
    // textAlign: 'center',
    color: '#666',
    marginVertical: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  followBtn: {
    backgroundColor: '#2979FF',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2979FF',
  },
  followOutlineBtn: {
    backgroundColor: 'transparent',
  },
  websiteBtn: {
    backgroundColor: '#2979FF',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    width: 80,
    textAlign: 'center',
    fontWeight: '600',
  },
  followOutlineText: {
    color: '#2979FF',
  },
  newsCard: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  category: {
    fontSize: 12,
    color: '#777',
  },
  title: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  tab: {
    marginRight: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },

  activeText: {
    color: '#2979FF',
    fontWeight: 'bold',
  },

  underline: {
    height: 3,
    width: '100%',
    backgroundColor: '#2979FF',
    marginTop: 4,
    borderRadius: 5,
    marginBottom: 10,
  },
  scroll: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },
});
