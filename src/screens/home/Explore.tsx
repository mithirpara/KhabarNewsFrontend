import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { topicsData } from '../../data/topicdata';

const newsData = [
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

const Explore = () => {
  const [topics, setTopics] = useState(topicsData);

  const toggleSave = id => {
    setTopics(
      topics.map(item =>
        item.id === id ? { ...item, saved: !item.saved } : item,
      ),
    );
  };

  if (!topics) return;
  const RenderItem = ({ item }) => (
    <View style={styles.topicCard}>
      <Image source={{ uri: item.image }} style={styles.topicImage} />

      <View style={{ flex: 1 }}>
        <Text style={styles.topicTitle}>{item.title}</Text>
        <Text style={styles.topicDesc}>{item.description}</Text>
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

  const renderItem = ({ item }) => (
    <View>
      <Image source={item.image} />

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '400' }}>{item.category}</Text>

        <Text numberOfLines={2}>{item.title}</Text>
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
            <Text>{item.source}</Text>
            <Text> ⏱ {item.time}</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 6 }}>
            <Image source={require('../../assets/png/dots.png')} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.exploretext}>Explore</Text>

        <View style={styles.topicview}>
          <Text style={styles.topictext}>Topic</Text>
          <Text style={styles.seealltext}>See all</Text>
        </View>

        <FlatList
          data={topics}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={RenderItem}
        />

        <Text style={styles.popularTitle}>Popular Topic</Text>

        <FlatList
          data={newsData}
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
