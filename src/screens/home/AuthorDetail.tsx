import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['News', 'Recent'];

const newsData = [
  {
    id: '1',
    category: 'Europe',
    title: "Ukraine's President Zelensky to BBC...",
    time: '14m ago',
    image: 'https://picsum.photos/200/200?7',
  },
  {
    id: '2',
    category: 'Sport',
    title: 'Frankfurt stun Barcelona to reach semi-finals',
    time: '1h ago',
    image: 'https://picsum.photos/200/200?8',
  },
];

const AuthorDetailScreen = ({ route, navigation }) => {
  const { author } = route.params;
  const [active, setActive] = useState('News');
  const [filteredData, setFilteredData] = useState(newsData);

  const renderItem = ({ item }) => (
    <View style={styles.newsCard}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.category}>{item.category}</Text>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  const handleCategoryPress = category => {
    setActive(category);
    if (category === 'News') {
      setFilteredData(newsData);
    } else {
      setFilteredData(newsData.filter(item => item.category === category));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack('SearchScreen')}>
              <Image source={require('../../assets/png/backAerro.png')} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image source={require('../../assets/png/menu.png')} />
            </TouchableOpacity>
          </View>

          <View style={styles.authorSection}>
            <Image source={author.image} style={styles.authorImage} />

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statNumber}>{author.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View>
                <Text style={styles.statNumber}>{author.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>

              <View>
                <Text style={styles.statNumber}>{author.newsCount}</Text>
                <Text style={styles.statLabel}>News</Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.authorName}>{author.name}</Text>

            <Text style={styles.bio}>
              is an operational business division of the British Broadcasting
              Corporation responsible for the gathering and broadcasting of news
              and current affairs.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.btnText}>Following</Text>
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
                    style={[styles.text, active === item && styles.activeText]}
                  >
                    {item}
                  </Text>
                  {active === item && <View style={styles.underline} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
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
});
