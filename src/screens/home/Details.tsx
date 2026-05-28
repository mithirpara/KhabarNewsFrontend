import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config/api';
import { isBookmarkSaved, saveBookmarkId } from '../../services/bookmarkStorage';
import {
  isAuthorFollowed,
  removeFollowId,
  saveFollowId,
} from '../../services/followStorage';
import { isArticleLiked, saveLikeId } from '../../services/likeStorage';
import { sendFollowNotification } from '../../services/pushNotificationService';
import { useSelector } from 'react-redux';
import { getThemeColors } from '../../constants/theme';

const newsImageFallback = require('../../assets/png/NewsImages.png');
const logoFallback = require('../../assets/png/BCClogo.png');

const fallbackArticle = {
  id: 'bbc-europe-default',
  category: 'Europe',
  title:
    "Ukraine's President Zelensky to BBC: Blood money being paid for Russian oil",
  description:
    "Ukrainian President Volodymyr Zelensky has accused European countries that continue to buy Russian oil of earning their money in other people's blood.",
  source: 'BBC News',
  time: '14m ago',
  image: '',
  newsLogo: '',
};

const normalizeArticle = (item: any) => ({
  ...fallbackArticle,
  ...(item || {}),
  id: item?.articleId || item?.id || fallbackArticle.id,
  articleId: item?.articleId || item?.id || fallbackArticle.id,
  title: item?.title || item?.bio || fallbackArticle.title,
  description:
    item?.description || item?.summary || item?.content || fallbackArticle.description,
  source: item?.sourceName || item?.source || item?.newsName || fallbackArticle.source,
  image: item?.image || item?.imageUrl || item?.urlToImage || item?.image1 || '',
  newsLogo: item?.newsLogo || item?.newsLogoUrl || item?.image2 || '',
});

const getSourceFollowId = (item: any) =>
  String(
    item?.authorId ||
      item?.sourceId ||
      item?.userId ||
      item?.source ||
      item?.newsName ||
      '',
  );

const getImageSource = (image: any, hasError: boolean, fallback: any) => {
  if (hasError || !image) {
    return fallback;
  }

  return typeof image === 'string' ? { uri: image } : image;
};

const NewsDetails = (props: any) => {
  const themeMode = useSelector((state: any) => state.theme.mode);
  const colors = getThemeColors(themeMode);
  const routeArticle = props.route?.params?.article;
  const routeArticleId =
    props.route?.params?.articleId || routeArticle?.articleId || routeArticle?.id;
  const [article, setArticle] = useState(normalizeArticle(routeArticle));
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookmarked, setBookmarked] = useState(Boolean(routeArticle?.saved));
  const [liked, setLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setArticle(normalizeArticle(routeArticle));
    setImageError(false);
    setLogoError(false);
    setBookmarked(Boolean(routeArticle?.saved));
    setLiked(false);

    const loadArticle = async () => {
      if (!routeArticleId) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/news/details?id=${encodeURIComponent(routeArticleId)}`,
        );
        const json = await response.json();
        const detail = json?.data || json?.article || json?.news;

        if (response.ok && json?.success && detail) {
          setArticle(normalizeArticle(detail));
        }
      } catch (error) {
        console.warn('Failed to load news detail', error);
      }
    };

    loadArticle();
  }, [routeArticle, routeArticleId]);

  const imageSource = getImageSource(article.image, imageError, newsImageFallback);
  const logoSource = getImageSource(article.newsLogo, logoError, logoFallback);
  const currentArticleId = article.articleId || article.id;
  const sourceFollowId = getSourceFollowId(article);

  useEffect(() => {
    let isActive = true;

    const loadSavedBookmark = async () => {
      if (!currentArticleId) {
        return;
      }

      try {
        const isSaved = await isBookmarkSaved(currentArticleId);

        if (isActive && isSaved) {
          setBookmarked(true);
        }
      } catch (error) {
        console.warn('Failed to load saved bookmark state', error);
      }
    };

    loadSavedBookmark();

    return () => {
      isActive = false;
    };
  }, [currentArticleId]);

  useEffect(() => {
    let isActive = true;

    const loadFollowState = async () => {
      if (!sourceFollowId) {
        return;
      }

      try {
        const saved = await isAuthorFollowed(sourceFollowId);

        if (isActive) {
          setIsFollowing(saved);
        }
      } catch (error) {
        console.warn('Failed to load source follow state', error);
      }
    };

    loadFollowState();

    return () => {
      isActive = false;
    };
  }, [sourceFollowId]);

  useEffect(() => {
    let isActive = true;

    const loadSavedLike = async () => {
      if (!currentArticleId) {
        return;
      }

      try {
        const isLiked = await isArticleLiked(currentArticleId);

        if (isActive && isLiked) {
          setLiked(true);
        }
      } catch (error) {
        console.warn('Failed to load saved like state', error);
      }
    };

    loadSavedLike();

    return () => {
      isActive = false;
    };
  }, [currentArticleId]);

  const handleLike = async () => {
    if (!currentArticleId || liked) {
      return;
    }

    try {
      setLiked(true);
      await saveLikeId(currentArticleId);
    } catch (error) {
      setLiked(false);
      console.warn('Like save failed', error);
    }
  };

  const saveBookmark = async () => {
    try {
      setSaving(true);
      setBookmarked(true);

      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: currentArticleId,
          category: article.category,
          title: article.title,
          description: article.description,
          source: article.source,
          time: article.time,
          image: article.image,
          newsLogo: article.newsLogo,
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message || 'Bookmark save failed');
      }

      await saveBookmarkId(currentArticleId);
    } catch (error) {
      setBookmarked(false);
      console.warn('Bookmark save failed', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleFollow = async () => {
    if (!sourceFollowId) {
      return;
    }

    const willFollow = !isFollowing;
    setIsFollowing(willFollow);

    try {
      if (willFollow) {
        await saveFollowId(sourceFollowId);
        await sendFollowNotification(sourceFollowId);
      } else {
        await removeFollowId(sourceFollowId);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image
              source={require('../../assets/png/backAerro.png')}
              style={[styles.icon, { tintColor: colors.icon }]}
            />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <Image
              source={require('../../assets/png/shere.png')}
              style={[styles.icon, { tintColor: colors.icon }]}
            />
            <Image
              source={require('../../assets/png/menu.png')}
              style={[styles.icon, { tintColor: colors.icon }]}
            />
          </View>
        </View>

        <View style={styles.authorContainer}>
          <Image
            source={logoSource}
            style={styles.authorImage}
            onError={() => setLogoError(true)}
          />

          <View style={{ flex: 1 }}>
            <Text style={[styles.authorName, { color: colors.text }]}>{article.source}</Text>
            <Text style={[styles.time, { color: colors.mutedText }]}>{article.time}</Text>
          </View>

          <TouchableOpacity
            onPress={toggleFollow}
            style={[styles.followBtn, !isFollowing && styles.followOutlineBtn]}
          >
            <Text
              style={[
                styles.followText,
                !isFollowing && styles.followOutlineText,
              ]}
            >
              {isFollowing ? 'Following' : '+ Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        <Image
          source={imageSource}
          style={styles.newsImage}
          onError={() => setImageError(true)}
        />

        <Text style={[styles.category, { color: colors.mutedText }]}>{article.category}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
        <Text style={[styles.description, { color: colors.mutedText }]}>{article.description}</Text>
      </ScrollView>

      <View style={[styles.bottomBar, { borderColor: colors.border }]}>
        <View style={styles.action}>
          <TouchableOpacity onPress={handleLike} disabled={liked}>
            <Image
              source={
                liked
                  ? require('../../assets/png/Like.png')
                  : require('../../assets/png/blankLike.png')
              }
              style={[styles.heart, !liked && { tintColor: colors.icon }]}
            />
          </TouchableOpacity>
          <Text style={[styles.count, { color: colors.text }]}>24.5K</Text>

          <TouchableOpacity
            onPress={() => props.navigation.navigate('CommentScreen')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginLeft: 20,
            }}
          >
            <Image
              source={require('../../assets/png/Comment.png')}
              style={[styles.comment, { tintColor: colors.icon }]}
            />
            <Text style={[styles.count, { color: colors.text }]}>1K</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={saveBookmark} disabled={saving}>
          <Image
            source={
              bookmarked
                ? require('../../assets/png/Bookmark1.png')
                : require('../../assets/png/Bookmark.png')
            }
            style={[styles.bookmark, !bookmarked && { tintColor: colors.icon }]}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewsDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 15,
  },

  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 15,
  },

  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },

  time: {
    color: 'gray',
  },

  followBtn: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2979ff',
  },

  followOutlineBtn: {
    backgroundColor: 'transparent',
  },

  followText: {
    color: '#fff',
    fontWeight: '600',
  },

  followOutlineText: {
    color: '#2979ff',
  },

  newsImage: {
    width: '92%',
    height: 220,
    alignSelf: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },

  category: {
    color: 'gray',
    marginHorizontal: 15,
    marginTop: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 15,
    marginVertical: 8,
  },

  description: {
    fontSize: 15,
    color: '#555',
    marginHorizontal: 15,
    marginBottom: 10,
    lineHeight: 22,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 10,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  heart: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  comment: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  count: {
    fontSize: 14,
    color: '#050505',
  },

  bookmark: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
