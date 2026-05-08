import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const API_BASE_URL = 'http://10.0.2.2:5000/api';

const getTrendingEndpoint = (category = 'All') =>
  category === 'All'
    ? `${API_BASE_URL}/trending?limit=10`
    : `${API_BASE_URL}/trending/${encodeURIComponent(
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

const RemoteNewsImage = ({ uri, style }: any) => {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      source={hasError || !uri ? newsImageFallback : { uri }}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

const HomeScreen = (props: any) => {
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

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <RemoteNewsImage uri={item.image} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.category}>{item.category}</Text>

        <Text style={styles.title} numberOfLines={2}>
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
            <Image
              source={{ uri: item.newsLogo }}
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.time}> ⏱ {item.time}</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 6 }}>
            <Image source={require('../../assets/png/dots.png')} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleCategory = (category: string) => {
    setActive(category);
    getLatestNews(category);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainView}>
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
              style={{ height: 24, width: 24 }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('SearchScreen')}
        >
          <View style={styles.inputContainer}>
            <Image source={require('../../assets/png/search.png')} />
            <View style={styles.input} />

            <Image source={require('../../assets/png/options.png')} />
          </View>
        </TouchableOpacity>

        <View style={styles.terndingView}>
          <Text style={styles.Trendingtext}>Trending</Text>
          <TouchableOpacity
            onPress={() => props.navigation.navigate('TerndingScreen')}
          >
            <Text style={styles.seeAlltext}>See all</Text>
          </TouchableOpacity>
        </View>
        {trendingItem && (
          <View>
            {' '}
            <View style={{ alignItems: 'center', marginTop: 5 }}>
              <RemoteNewsImage
                uri={trendingItem.image}
                style={{ width: '100%', height: 200, borderRadius: 10 }}
              />
            </View>
            <View>
              <Text
                style={{ color: '#4E4B66', fontWeight: '400', marginTop: 5 }}
              >
                {trendingItem.category}
              </Text>

              <Text
                style={{ color: '#000000', fontWeight: '400', marginTop: 5 }}
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
                  <Image
                    source={{ uri: trendingItem.newsLogo }}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                  />

                  <Text
                    style={{
                      marginRight: 15,
                      color: '#4E4B66',
                      fontWeight: '600',
                    }}
                  >
                    {trendingItem.source}
                  </Text>

                  <Image source={require('../../assets/png/clock.png')} />

                  <Text
                    style={{ width: 50, color: '#4E4B66', fontWeight: '400' }}
                  >
                    {trendingItem.time}
                  </Text>
                </View>

                <Image source={require('../../assets/png/dots.png')} />
              </View>
            </View>
          </View>
        )}
      <View style={styles.TerndingView}>
        <Text style={styles.Trendingtext}>Latest</Text>
        <Text style={styles.seeAlltext}>See all</Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCategory(item)}
              style={styles.tab}
            >
              <Text style={[styles.text, active === item && styles.activeText]}>
                {item}
              </Text>

              {active === item && <View style={styles.underline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        {latestLoading && <Text style={styles.loadingText}>Loading...</Text>}
        {!latestLoading && latestData.length === 0 && (
          <Text style={styles.loadingText}>No news found</Text>
        )}
        <FlatList
          data={latestData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  scroll: {
    paddingHorizontal: 10,
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
