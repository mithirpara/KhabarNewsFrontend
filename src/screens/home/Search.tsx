import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../config/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import RemoteImage from '../../component/RemoteImage';
import { sendFollowNotification } from '../../services/pushNotificationService';
import { getSavedAuthUser } from '../../services/authStorage';
import {
  getSavedFollowIds,
  removeFollowId,
  saveFollowId,
} from '../../services/followStorage';

type NewsItem = {
  id: string;
  articleId?: string;
  category: string;
  title: string;
  source: string;
  time: string;
  image: string;
  imageUrl?: string;
  urlToImage?: string;
};

type TopicItem = {
  id: string;
  title: string;
  description: string;
  saved: boolean;
  image: string;
  imageUrl?: string;
};

type AuthorItem = {
  id: string;
  name: string;
  followers: string;
  following: string;
  isFollowing: boolean;
  newsCount: number;
  image: string | number;
  newsLogo?: string;
};

const getAuthorImageSource = (image: string | number) =>
  typeof image === 'string' ? { uri: image } : image;

const newsImageFallback = require('../../assets/png/NewsImages.png');
const authorImageFallback = require('../../assets/png/BCClogo.png');

const normalizeNewsItem = (item: any, index: number): NewsItem => {
  const id = String(item?.id || item?.articleId || `search-news-${index}`);
  const image = String(item?.image || item?.imageUrl || item?.urlToImage || item?.image1 || '');

  return {
    ...item,
    id,
    articleId: item?.articleId || id,
    category: String(item?.category || item?.countryName || 'News'),
    title: String(item?.title || item?.bio || 'Untitled news'),
    source: String(item?.source || item?.newsName || 'Khabar News'),
    time: String(item?.time || 'Just now'),
    image,
    imageUrl: image,
  };
};

const normalizeTopicItem = (item: any, index: number): TopicItem => ({
  ...item,
  id: String(item?.id || item?.topicId || `search-topic-${index}`),
  title: String(item?.title || item?.category || 'Topic'),
  description: String(item?.description || ''),
  saved: Boolean(item?.saved),
  image: String(item?.image || item?.imageUrl || ''),
});

const fallbackAuthors: AuthorItem[] = [
  {
    id: 'bbc',
    name: 'BBC News',
    followers: '1.2M',
    following: '124K',
    isFollowing: true,
    newsCount: 1200,
    image: require('../../assets/png/BCClogo.png'),
  },
  {
    id: 'cnn',
    name: 'CNN',
    followers: '959K',
    following: '102K',
    isFollowing: false,
    newsCount: 980,
    image: require('../../assets/png/CNNlogo.png'),
  },
  {
    id: 'vox',
    name: 'Vox',
    followers: '452K',
    following: '45K',
    isFollowing: true,
    newsCount: 450,
    image: require('../../assets/png/VOXlogo.png'),
  },
  {
    id: 'usa-today',
    name: 'USA Today',
    followers: '325K',
    following: '31K',
    isFollowing: true,
    newsCount: 325,
    image: require('../../assets/png/BCClogo.png'),
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    followers: '21K',
    following: '12K',
    isFollowing: false,
    newsCount: 210,
    image: require('../../assets/png/CNNlogo.png'),
  },
  {
    id: 'cnet',
    name: 'CNET',
    followers: '18K',
    following: '8K',
    isFollowing: false,
    newsCount: 180,
    image: require('../../assets/png/VOXlogo.png'),
  },
  {
    id: 'msn',
    name: 'MSN',
    followers: '15K',
    following: '6K',
    isFollowing: false,
    newsCount: 150,
    image: require('../../assets/png/BCClogo.png'),
  },
  {
    id: 'reuters',
    name: 'Reuters',
    followers: '14K',
    following: '5K',
    isFollowing: true,
    newsCount: 140,
    image: require('../../assets/png/CNNlogo.png'),
  },
  {
    id: 'ap-news',
    name: 'AP News',
    followers: '12K',
    following: '4K',
    isFollowing: false,
    newsCount: 120,
    image: require('../../assets/png/VOXlogo.png'),
  },
  {
    id: 'the-guardian',
    name: 'The Guardian',
    followers: '10K',
    following: '3K',
    isFollowing: true,
    newsCount: 100,
    image: require('../../assets/png/BCClogo.png'),
  },
];

const SearchScreen = (props: any) => {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState('News');
  const [searchText, setSearchText] = useState('');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [topicsData, setTopicsData] = useState<TopicItem[]>([]);
  const [authorData, setAuthorData] = useState<AuthorItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSavedAuthUser()
      .then(user => setCurrentUserId(user?.userId || ''))
      .catch(() => setCurrentUserId(''));
  }, []);

  const loadFollowedIds = useCallback(async () => {
    try {
      const savedIds = await getSavedFollowIds();
      setFollowedIds(savedIds);
      setAuthorData(previousData =>
        previousData.map(item => ({
          ...item,
          isFollowing: savedIds.includes(item.id),
        })),
      );
    } catch (error) {
      console.warn('Failed to load follow state', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFollowedIds();
    }, [loadFollowedIds]),
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const query = searchText.trim();
        const url = query
          ? `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&limit=10`
          : `${API_BASE_URL}/api/search?limit=10`;
        const response = await fetch(url);
        const json = await response.json();

        setNewsData(
          Array.isArray(json?.data?.news)
            ? json.data.news.map(normalizeNewsItem)
            : [],
        );
        setTopicsData(
          Array.isArray(json?.data?.topics)
            ? json.data.topics.map(normalizeTopicItem)
            : [],
        );
        const savedFollowIds = await getSavedFollowIds();
        setFollowedIds(savedFollowIds);

        const authors = Array.isArray(json?.data?.author)
          ? json.data.author.map((item: AuthorItem) => ({
                ...item,
                followers: String(item.followers || '0'),
                following: String(item.following || '0'),
                isFollowing: savedFollowIds.includes(String(item.id)),
                image: item.image || item.newsLogo || '',
              }))
          : [];

        const visibleAuthors = authors.filter(
          (item: AuthorItem) => item.id !== currentUserId,
        );

        setAuthorData(
          visibleAuthors.length > 0
            ? visibleAuthors.slice(0, 10)
            : query
              ? []
              : fallbackAuthors.map(item => ({
                  ...item,
                  isFollowing: savedFollowIds.includes(item.id),
                })),
        );
      } catch (error) {
        console.warn('Failed to fetch search data', error);
        setNewsData([]);
        setTopicsData([]);
        setAuthorData([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentUserId, searchText]);

  const toggleSave = async (id: string) => {
    const selectedTopic = topicsData.find(item => item.id === id);

    if (!selectedTopic || selectedTopic.saved) {
      return;
    }

    setTopicsData(
      topicsData.map(item =>
        item.id === id ? { ...item, saved: true } : item,
      ),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: selectedTopic.id,
          category: 'Topic',
          title: selectedTopic.title,
          description: selectedTopic.description,
          source: 'Khabar News',
          time: 'Just now',
          image: selectedTopic.image || selectedTopic.imageUrl,
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message || 'Topic bookmark save failed');
      }
    } catch (error) {
      setTopicsData(
        topicsData.map(item =>
          item.id === id ? { ...item, saved: false } : item,
        ),
      );
      console.warn('Topic bookmark save failed', error);
      Alert.alert('Save failed', 'Topic bookmark me save nahi ho paya.');
    }
  };

  const toggleFollow = async (id: string) => {
    const selectedAuthor = authorData.find(item => item.id === id);
    const willFollow = !selectedAuthor?.isFollowing;

    setAuthorData(
      authorData.map(item =>
        item.id === id ? { ...item, isFollowing: !item.isFollowing } : item,
      ),
    );
    setFollowedIds(previousIds =>
      willFollow
        ? Array.from(new Set([...previousIds, id]))
        : previousIds.filter(item => item !== id),
    );

    try {
      if (willFollow) {
        await saveFollowId(id);
        await sendFollowNotification(id);
      } else {
        await removeFollowId(id);
      }
    } catch (error: any) {
      Alert.alert(
        'Notification failed',
        error?.message || 'Follow ho gaya, lekin notification send nahi hui.',
      );
    }
  };

  const renderNews = () => (
    <FlatList
      data={newsData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.newsCard}
          activeOpacity={0.85}
          onPress={() =>
            props.navigation.navigate('DetailsScreen', {
              article: item,
              articleId: item.articleId || item.id,
            })
          }
        >
          <RemoteImage
            uri={item.image || item.imageUrl || item.urlToImage}
            fallbackSource={newsImageFallback}
            style={styles.newsImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.smallCategory, { color: colors.mutedText }]}>{item.category}</Text>
            <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={[styles.meta, { color: colors.mutedText }]}>
                {item.source} • {item.time}
              </Text>
              <Image source={require('../../assets/png/dots.png')} style={{ tintColor: colors.icon }} />
            </View>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50, color: colors.mutedText }}>
          No News Found
        </Text>
      }
    />
  );

  const renderTopics = () => (
    <FlatList
      data={topicsData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        
        <View style={styles.topicCard}>
          <RemoteImage
            uri={item.image || item.imageUrl}
            fallbackSource={newsImageFallback}
            style={styles.topicImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.topicTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.topicDesc, { color: colors.mutedText }]}>{item.description}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => toggleSave(item.id)}
            style={[styles.saveBtn, item.saved && styles.savedBtn]}
          >
            <Text style={[styles.saveText, item.saved && { color: '#fff' }]}>
              {item.saved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50, color: colors.mutedText }}>
          No Topics Found
        </Text>
      }
    />
  );

  const renderAuthors = () => (
    <FlatList
      data={authorData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('AuthorDetailScreen', { author: item })
          }
        >
          <View style={styles.authorCard}>
            {typeof item.image === 'string' ? (
              <RemoteImage
                uri={item.image}
                fallbackSource={authorImageFallback}
                style={styles.authorImage}
              />
            ) : (
              <Image
                source={getAuthorImageSource(item.image)}
                style={styles.authorImage}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.followers, { color: colors.mutedText }]}>
                {item.followers} Followers
              </Text>
            </View>
            <TouchableOpacity
              onPress={event => {
                event.stopPropagation();
                toggleFollow(item.id);
              }}
              style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
            >
              <Text
                style={[
                  styles.followText,
                  item.isFollowing && { color: '#fff' },
                ]}
              >
                {item.isFollowing ? 'Following' : '+ Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50, color: colors.mutedText }}>
          No Authors Found
        </Text>
      }
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.containerView}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
          <Image source={require('../../assets/png/search.png')} style={{ tintColor: colors.icon }} />
          <TextInput
            placeholder="Search news, topics, authors..."
            placeholderTextColor={colors.mutedText}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.input, { color: colors.text }]}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Image source={require('../../assets/png/Wrong.png')} style={{ tintColor: colors.icon }} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          {['News', 'Topics', 'Author'].map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => setActiveTab(item)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.mutedText },
                  activeTab === item && styles.activeText,
                ]}
              >
                {item}
              </Text>
              {activeTab === item && <View style={styles.indicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {loading ? (
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>Loading...</Text>
          ) : (
            <>
              {activeTab === 'News' && renderNews()}
              {activeTab === 'Topics' && renderTopics()}
              {activeTab === 'Author' && renderAuthors()}
            </>
          )}
        </View>


      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  containerView: { flex: 1 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4E4B66',
  },

  input: { flex: 1, marginHorizontal: 8, color: 'black' },

  tabContainer: {
    flexDirection: 'row',
    marginVertical: 18,
    justifyContent: 'center',
  },

  tab: { marginRight: 20 },

  tabText: { fontSize: 15, color: '#777', textAlign: 'center' },

  activeText: { color: '#2979FF', fontWeight: '600' },

  indicator: {
    height: 3,
    backgroundColor: '#2979FF',
    marginTop: 5,
    borderRadius: 5,
  },

  newsCard: { flexDirection: 'row', marginBottom: 20 },

  newsImage: { width: 80, height: 80, borderRadius: 12, marginRight: 10 },

  smallCategory: { fontSize: 12, color: '#888' },

  title: { fontSize: 14, fontWeight: '600', marginVertical: 4 },

  meta: { fontSize: 12, color: '#777' },

  topicCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },

  topicImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },

  topicTitle: { fontWeight: '600' },

  topicDesc: { fontSize: 12, color: '#777' },

  saveBtn: {
    borderWidth: 1,
    borderColor: '#2979FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  savedBtn: { backgroundColor: '#2979FF' },

  saveText: { color: '#2979FF', fontWeight: '600' },

  authorCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },

  authorImage: { width: 55, height: 55, borderRadius: 27, marginRight: 10 },

  authorName: { fontWeight: '600' },

  followers: { fontSize: 12, color: '#777' },

  followBtn: {
    borderWidth: 1,
    borderColor: '#2979FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  followingBtn: { backgroundColor: '#2979FF' },

  followText: { color: '#2979FF', fontWeight: '600' },

  emptyText: { textAlign: 'center', marginTop: 50 },
});
