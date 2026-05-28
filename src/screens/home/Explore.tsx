import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config/api';
import { topicsData } from '../../data/topicdata';
import { useAppTheme } from '../../hooks/useAppTheme';
import RemoteImage from '../../component/RemoteImage';
import { isBookmarkSaved, saveBookmarkId } from '../../services/bookmarkStorage';

type Topic = {
  id: string;
  title: string;
  description: string;
  saved: boolean;
  image: string | ImageSourcePropType;
  imageUrl?: string;
};

type PopularTopic = {
  id: string;
  articleId?: string;
  category: string;
  title: string;
  source: string;
  time: string;
  image: string | ImageSourcePropType;
  imageUrl?: string;
  urlToImage?: string;
};

const fallbackPopularTopics: PopularTopic[] = [
  {
    id: '1',
    category: 'Business',
    title: "Ukraine's President Zelensky to BBC: Blood money being paid...",
    source: 'BBC News',
    time: '14m ago',
    image: require('../../assets/png/NewsImages.png'),
  },
  {
    id: '2',
    category: 'Travel',
    title: 'Her train broke down. Her phone died. And then she met her...',
    source: 'CNN',
    time: '1h ago',
    image: require('../../assets/png/NewsImages.png'),
  },
  {
    id: '3',
    category: 'Europe',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/NewsImages.png'),
  },
  {
    id: '4',
    category: 'Money',
    title: 'Wind power produced more electricity than coal and nucle...',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/NewsImages.png'),
  },
  {
    id: '5',
    category: 'Life',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/NewsImages.png'),
  },
  {
    id: '6',
    category: 'Sports',
    title: 'Wind power produced more electricity than coal and nucle...',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/NewsImages.png'),
  },
  {
    id: '7',
    category: 'Technology',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/NewsImages.png'),
  },
];

const getImageSource = (image: string | ImageSourcePropType) =>
  typeof image === 'string' ? { uri: image } : image;

const newsImageFallback = require('../../assets/png/NewsImages.png');

const getRemoteUri = (item: any) => item?.image || item?.imageUrl || item?.urlToImage || item?.image1 || '';

const getBookmarkImage = (item: Topic) =>
  typeof item.image === 'string' ? item.image : item.imageUrl || '';

const Explore = (props: any) => {
  const { colors } = useAppTheme();
  const [topics, setTopics] = useState<Topic[]>(topicsData);
  const [popularTopics, setPopularTopics] =
    useState<PopularTopic[]>(fallbackPopularTopics);

  useEffect(() => {
    const loadExplore = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/explore?limit=7`);

        if (!res.ok) {
          return;
        }

        const json = await res.json();

        if (Array.isArray(json?.data?.topics)) {
          const nextTopics = await Promise.all(
            json.data.topics.map(async (item: Topic) => ({
              ...item,
              saved: Boolean(item.saved) || (await isBookmarkSaved(String(item.id))),
            })),
          );
          setTopics(nextTopics);
        }

        if (Array.isArray(json?.data?.popularTopics)) {
          setPopularTopics(json.data.popularTopics);
        }
      } catch (error) {
        console.warn('Failed to load explore data', error);
      }
    };

    loadExplore();
  }, []);

  const toggleSave = async (id: string) => {
    const selectedTopic = topics.find(item => item.id === id);

    if (!selectedTopic || selectedTopic.saved) {
      return;
    }

    setTopics(
      topics.map(item =>
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
          image: getBookmarkImage(selectedTopic),
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.message || 'Explore topic bookmark save failed');
      }

      await saveBookmarkId(selectedTopic.id);
    } catch (error) {
      setTopics(
        topics.map(item =>
          item.id === id ? { ...item, saved: false } : item,
        ),
      );
      console.warn('Explore topic bookmark save failed', error);
      Alert.alert('Save failed', 'Topic bookmark me save nahi ho paya.');
    }
  };

  const RenderItem = ({ item }: { item: Topic }) => (
    <View style={[styles.topicCard, { backgroundColor: colors.background }]}>
      {typeof item.image === 'string' ? (
        <RemoteImage
          uri={getRemoteUri(item)}
          fallbackSource={newsImageFallback}
          style={styles.topicImage}
        />
      ) : (
        <Image source={getImageSource(item.image)} style={styles.topicImage} />
      )}

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
  );

  const renderItem = ({ item }: { item: PopularTopic }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        props.navigation.navigate('DetailsScreen', {
          article: item,
          articleId: item.articleId || item.id,
        })
      }
    >
      {typeof item.image === 'string' ? (
        <RemoteImage
          uri={getRemoteUri(item)}
          fallbackSource={newsImageFallback}
          style={styles.image}
        />
      ) : (
        <Image source={getImageSource(item.image)} style={styles.image} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '400', color: colors.mutedText }}>{item.category}</Text>

        <Text numberOfLines={2} style={{ color: colors.text }}>{item.title}</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
              marginBottom: 15,
            }}
          >
            <Image source={require('../../assets/png/Ellipse.png')} />
            <Text style={{ color: colors.text }}>{item.source}</Text>
            <Text style={{ color: colors.mutedText }}> ⏱ {item.time}</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 6 }}>
            <Image source={require('../../assets/png/dots.png')} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.exploretext, { color: colors.text }]}>Explore</Text>

        <View style={styles.topicview}>
          <Text style={[styles.topictext, { color: colors.text }]}>Topic</Text>
          <Text style={[styles.seealltext, { color: colors.mutedText }]}>See all</Text>
        </View>

        <FlatList
          data={topics}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={RenderItem}
        />

        <Text style={[styles.popularTitle, { color: colors.text }]}>Popular Topic</Text>

        <FlatList
          data={popularTopics}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  exploretext: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
  },
  topictext: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seealltext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4E4B66',
  },
  topicview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
  },

  topicImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },

  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },

  topicDesc: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  saveBtn: {
    borderWidth: 1,
    borderColor: '#2979FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  savedBtn: { backgroundColor: '#2979FF' },

  saveText: { color: '#2979FF', fontWeight: '600' },

  popularTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 30,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 15,
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  category: {
    fontSize: 12,
    color: '#4E4B66',
    marginBottom: 5,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  bottomRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },

  source: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53935',
  },

  time: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
});
