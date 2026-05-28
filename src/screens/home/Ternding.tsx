import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../config/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import RemoteImage from '../../component/RemoteImage';

const DATA = [
  {
    id: '1',
    category: 'Europe',
    title: 'Russian warship: Moskva sinks in Black Sea',
    source: 'BBC News',
    time: '4h ago',
    image: require('../../assets/png/News1.png'),
  },
  {
    id: '2',
    category: 'Europe',
    title:
      "Ukraine's President Zelensky to BBC: Blood money being paid for Russian oil",
    source: 'BBC News',
    time: '14m ago',
    image: require('../../assets/png/News2.png'),
  },
  {
    id: '3',
    category: 'Travel',
    title: 'Her train broke down. Her phone died. And then she met her...',
    source: 'CNN',
    time: '1h ago',
    image: require('../../assets/png/News3.png'),
  },
];

const newsImageFallback = require('../../assets/png/NewsImages.png');
const logoImageFallback = require('../../assets/png/BCClogo.png');

const getImageUri = (item: any) => item?.image || item?.imageUrl || item?.urlToImage || item?.image1 || '';
const getLogoUri = (item: any) => item?.newsLogo || item?.newsLogoUrl || item?.image2 || '';

const Trending = (props: any) => {
  const { colors } = useAppTheme();
  const [trendingData, setTrendingData] = useState([]);

  const getTrendingNews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trending?limit=10`);
      const json = await response.json();

      if (json.success) {
        setTrendingData(json.data);
      }
    } catch (error) {
      console.log('Trending API error:', error);
    }
  };

  useEffect(() => {
    getTrendingNews();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background }]}
      activeOpacity={0.85}
      onPress={() =>
        props.navigation.navigate('DetailsScreen', {
          article: item,
          articleId: item.articleId || item.id,
        })
      }
    >
      <RemoteImage uri={getImageUri(item)} fallbackSource={newsImageFallback} style={styles.image} />

      <View style={styles.content}>
        <Text style={[styles.category, { color: colors.mutedText }]}>{item.category}</Text>

        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>

        <View style={styles.bottomRow}>
          <RemoteImage
            uri={getLogoUri(item)}
            fallbackSource={logoImageFallback}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
          <Text style={styles.source}>{item.source}</Text>
          <Text style={[styles.time, { color: colors.mutedText }]}> ⏱ {item.time}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menu}>
        <Image source={require('../../assets/png/dots.png')} style={{ tintColor: colors.icon }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image source={require('../../assets/png/backAerro.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Trending</Text>

          <Image source={require('../../assets/png/menu.png')} style={{ tintColor: colors.icon }} />
        </View>

        <FlatList
          data={trendingData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{ bottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Trending;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },

  content: {
    padding: 12,
  },

  category: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
  },

  title: {
    fontSize: 16,
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
    marginLeft: 5,
  },

  time: {
    fontSize: 12,
    color: '#777',
    marginLeft: 8,
  },

  menu: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});
