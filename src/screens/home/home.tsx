import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import RemoteImage from '../../component/RemoteImage';

const categories = [
  'All',
  'Sports',
  'Politics',
  'Business',
  'Health',
  'Travel',
  'Science',
  'Money',
  'Life',
  'Technology',
];

const getTrendingEndpoint = (category = 'All') =>
  category === 'All'
    ? `${API_BASE_URL}/api/trending?limit=10`
    : `${API_BASE_URL}/api/trending/${encodeURIComponent(
        category.toLowerCase(),
      )}?limit=10`;

const newsData = [
  {
    id: '1',
    category: 'Business',
    title: "Ukraine's President Zelensky to BBC: Blood money being paid...",
    source: 'BBC News',
    time: '14m ago',
    image: require('../../assets/png/News1.png'),
  },
  {
    id: '2',
    category: 'Travel',
    title: 'Her train broke down. Her phone died. And then she met her...',
    source: 'CNN',
    time: '1h ago',
    image: require('../../assets/png/News2.png'),
  },
  {
    id: '3',
    category: 'Europe',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/News3.png'),
  },
  {
    id: '4',
    category: 'Money',
    title: 'Wind power produced more electricity than coal and nucle...',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/News4.png'),
  },
  {
    id: '5',
    category: 'Life',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/News3.png'),
  },
  {
    id: '6',
    category: 'Sports',
    title: 'Wind power produced more electricity than coal and nucle...',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/News4.png'),
  },
  {
    id: '7',
    category: 'Technology',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/News3.png'),
  },
];

const newsImageFallback = require('../../assets/png/NewsImages.png');
const logoImageFallback = require('../../assets/png/BCClogo.png');

const getImageUri = (item: any) => item?.image || item?.imageUrl || item?.urlToImage || item?.image1 || '';
const getLogoUri = (item: any) => item?.newsLogo || item?.newsLogoUrl || item?.image2 || '';
const latestHeaderItem = { id: 'latest-header', type: 'latest-header' };

const HomeScreen = (props: any) => {
  const { colors } = useAppTheme();
  const [active, setActive] = useState('All');
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [latestData, setLatestData] = useState<any[]>([]);
  const [latestLoading, setLatestLoading] = useState(false);

  const getTrendingNews = async () => {
    try {
      const response = await fetch(getTrendingEndpoint());
      const json = await response.json();
      console.log('Trending response:', json);

      if (json.success) {
        setTrendingData(json.data || []);
      }
    } catch (error) {
      console.log('Trending API error:', error);
    }
  };

  const getLatestNews = async (category = 'All') => {
    try {
      setLatestLoading(true);

      const response = await fetch(getTrendingEndpoint(category));
      const json = await response.json();
      console.log('Latest response:', category, json);

      if (json.success) {
        setLatestData(json.data || []);
      } else {
        setLatestData([]);
      }
    } catch (error) {
      console.log('Latest API error:', error);
      setLatestData([]);
    } finally {
      setLatestLoading(false);
    }
  };

  useEffect(() => {
    getTrendingNews();
    getLatestNews('All');
  }, []);

  const trendingItem = trendingData[0];

  const openDetails = (item: any) => {
    props.navigation.navigate('DetailsScreen', {
      article: item,
      articleId: item.articleId || item.id,
    });
  };

  function renderLatestHeader() {
    return (
      <View style={[styles.stickyLatestHeader, { backgroundColor: colors.background }]}>
        <View style={styles.TerndingView}>
          <Text style={[styles.Trendingtext, { color: colors.text }]}>Latest</Text>
          <Text style={[styles.seeAlltext, { color: colors.mutedText }]}>See all</Text>
        </View>
        <View style={{ marginTop: 10, backgroundColor: colors.background }}>
          <FlatList
            data={categories}
            horizontal
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
            contentContainerStyle={styles.categoryListContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCategory(item)}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Text style={[styles.text, { color: colors.mutedText }, active === item && styles.activeText]}>
                  {item}
                </Text>

                {active === item && <View style={styles.underline} />}
              </TouchableOpacity>
            )}
          />
        </View>
        {latestLoading && <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading...</Text>}
        {!latestLoading && latestData.length === 0 && (
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>No news found</Text>
        )}
      </View>
    );
  }

  const renderItem = ({ item }: any) => item.type === 'latest-header' ? renderLatestHeader() : (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background }]}
      activeOpacity={0.85}
      onPress={() => openDetails(item)}
    >
      <RemoteImage uri={getImageUri(item)} fallbackSource={newsImageFallback} style={styles.image} />

      <View style={styles.content}>
        <Text style={[styles.category, { color: colors.mutedText }]}>{item.category}</Text>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={styles.bottomRow}>
            <RemoteImage
              uri={getLogoUri(item)}
              fallbackSource={logoImageFallback}
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
            <Text style={styles.source}>{item.source}</Text>
            <Text style={[styles.time, { color: colors.mutedText }]}> ⏱ {item.time}</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 6 }}>
            <Image source={require('../../assets/png/dots.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleCategory = (category: string) => {
    setActive(category);
    getLatestNews(category);
  };

  const renderListHeader = () => (
    <>
      <TouchableOpacity
        onPress={() => props.navigation.navigate('SearchScreen')}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
          <Image source={require('../../assets/png/search.png')} style={{ tintColor: colors.icon }} />
          <View style={styles.input} />

          <Image source={require('../../assets/png/options.png')} style={{ tintColor: colors.icon }} />
        </View>
      </TouchableOpacity>

      <View style={styles.terndingView}>
        <Text style={[styles.Trendingtext, { color: colors.text }]}>Trending</Text>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('TerndingScreen')}
        >
          <Text style={[styles.seeAlltext, { color: colors.mutedText }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {trendingItem && (
        <TouchableOpacity activeOpacity={0.85} onPress={() => openDetails(trendingItem)}>
          <View style={{ alignItems: 'center', marginTop: 5 }}>
            <RemoteImage
              uri={getImageUri(trendingItem)}
              fallbackSource={newsImageFallback}
              style={{ width: '100%', height: 200, borderRadius: 10 }}
            />
          </View>
          <View style={{ backgroundColor: colors.background }}>
            <Text
              style={{ color: colors.mutedText, fontWeight: '400', marginTop: 5 }}
            >
              {trendingItem.category}
            </Text>

            <Text
              style={{ color: colors.text, fontWeight: '400', marginTop: 5 }}
            >
              {trendingItem.title}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <RemoteImage
                  uri={getLogoUri(trendingItem)}
                  fallbackSource={logoImageFallback}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                />

                <Text
                  style={{
                    marginRight: 15,
                    color: colors.mutedText,
                    fontWeight: '600',
                  }}
                >
                  {trendingItem.source}
                </Text>

                <Image source={require('../../assets/png/clock.png')} style={{ tintColor: colors.icon }} />

                <Text
                  style={{ width: 60, color: colors.mutedText, fontWeight: '400' }}
                >
                  {trendingItem.time}
                </Text>
              </View>

              <Image source={require('../../assets/png/dots.png')} style={{ tintColor: colors.icon }} />
            </View>
          </View>
        </TouchableOpacity>
      )}

    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.mainView, { backgroundColor: colors.background }]}>
        <View style={styles.imageView}>
          <Image
            source={require('../../assets/png/logoKhabar.png')}
            style={{ height: 30, width: 100 }}
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate('NotificationScreen')}
          >
            <Image
              source={require('../../assets/png/notification.png')}
              style={{ height: 24, width: 24, tintColor: colors.icon }}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={[latestHeaderItem, ...latestData]}
          keyExtractor={item => String(item.articleId || item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          stickyHeaderIndices={[1]}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={[
            styles.newsListContent,
            { backgroundColor: colors.background },
          ]}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  mainView: {
    flex: 1,
  },
  imageView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4E4B66',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#fff',
    marginTop: 15,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 15,
    color: '#111827',
  },
  Trendingtext: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAlltext: {
    fontSize: 12,
    fontWeight: '400',
  },
  terndingView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  TerndingView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stickyLatestHeader: {
    backgroundColor: '#fff',
    paddingBottom: 4,
  },
  categoryList: {
    flexGrow: 0,
  },
  
  categoryListContent: {
    paddingHorizontal: 10,
    paddingRight: 20,
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
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 15,
  },

  image: {
    width: 95,
    height: 95,
    borderRadius: 12,
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  category: {
    fontSize: 12,
    color: '#888',
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

  loadingText: {
    color: '#4E4B66',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  newsListContent: {
    paddingBottom: 15,
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
