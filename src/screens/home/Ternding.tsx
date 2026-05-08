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

const Trending = (props: any) => {
  const [trendingData, setTrendingData] = useState([]);

  const getTrendingNews = async () => {
    try {
      const response = await fetch(
        'http://192.168.1.71:5000/api/trending?limit=10',
      );
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.category}>{item.category}</Text>

        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.bottomRow}>
          <Image
            source={{ uri: item.newsLogo }}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
          <Text style={styles.source}>{item.source}</Text>
          <Text style={styles.time}> ⏱ {item.time}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menu}>
        <Image source={require('../../assets/png/dots.png')} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image source={require('../../assets/png/backAerro.png')} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Trending</Text>

          <Image source={require('../../assets/png/menu.png')} />
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
