import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const SearchScreen = (props: any) => {
  const [activeTab, setActiveTab] = useState('News');
  const [search, setSearch] = useState('');
  const [searchText, setSearchText] = useState('');


  const [topicsData, setTopicsData] = useState([
    {
      id: '1',
      title: 'Health',
      description: 'Latest health news...',
      saved: false,
      image: 'https://picsum.photos/100/100?1',
    },
    {
      id: '2',
      title: 'Technology',
      description: 'Tech updates...',
      saved: true,
      image: 'https://picsum.photos/100/100?2',
    },
    {
      id: '3',
      title: 'Politics',
      description: 'Political analysis...',
      saved: false,
      image: 'https://picsum.photos/100/100?3',
    },
  ]);

  const [authorData, setAuthorData] = useState([
    {
      id: '1',
      name: 'BBC News',
      followers: '1.2M',
      following: '124k',
      newsCount: 1200,
      image: require('../../assets/png/BCClogo.png'),
    },
    {
      id: '2',
      name: 'CNN',
      followers: '959K',
      following: '102k',
      newsCount: 980,
      image: require('../../assets/png/CNNlogo.png'),
    },
    {
      id: '3',
      name: 'VOX',
      followers: '452K',
      following: '45k',
      newsCount: 450,
      image: require('../../assets/png/VOXlogo.png'),
    },
  ]);

  const newsData = [
    {
      id: '1',
      category: 'Europe',
      title: "Ukraine's President Zelensky to BBC...",
      source: 'BBC News',
      time: '14m ago',
      image: 'https://picsum.photos/200/200?7',
    },
    {
      id: '2',
      category: 'Travel',
      title: 'Russian warship: Moskva sinks in Black Sea',
      source: 'BBC News',
      time: '1h ago',
      image: 'https://picsum.photos/200/200?8',
    },
  ];

  const toggleSave = id => {
    setTopicsData(
      topicsData.map(item =>
        item.id === id ? { ...item, saved: !item.saved } : item,
      ),
    );
  };

  const toggleFollow = id => {
    setAuthorData(
      authorData.map(item =>
        item.id === id ? { ...item, following: !item.following } : item,
      ),
    );
  };

  const filteredNews = newsData.filter(item =>
    item.category.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredTopics = topicsData.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredAuthors = authorData.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderNews = () => (
    <FlatList
      data={filteredNews}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.newsCard}>
          <Image source={{ uri: item.image }} style={styles.newsImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.smallCategory}>{item.category}</Text>
            <Text numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={styles.meta}>
                {item.source} • {item.time}
              </Text>
              <Image source={require('../../assets/png/dots.png')} />
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          No News Found
        </Text>
      }
    />
  );

  const renderTopics = () => (
    <FlatList
      data={filteredTopics}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        
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
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          No Topics Found
        </Text>
      }
    />
  );

  const renderAuthors = () => (
    <FlatList
      data={filteredAuthors}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('AuthorDetailScreen', { author: item })
          }
        >
          <View style={styles.authorCard}>
            <Image source={item.image} style={styles.authorImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{item.name}</Text>
              <Text style={styles.followers}>{item.followers} Followers</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFollow(item.id)}
              style={[styles.followBtn, item.following && styles.followingBtn]}
            >
              <Text
                style={[styles.followText, item.following && { color: '#fff' }]}
              >
                {item.following ? 'Following' : '+ Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          No Authors Found
        </Text>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerView}>
        <View style={styles.searchContainer}>
          <Image source={require('../../assets/png/search.png')} />
          <TextInput
            placeholder="Search news, topics, authors..."
            placeholderTextColor={'#000'}
            value={searchText}
            onChangeText={setSearchText}
            style={styles.input}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Image source={require('../../assets/png/Wrong.png')} />
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
          {activeTab === 'News' && renderNews()}
          {activeTab === 'Topics' && renderTopics()}
          {activeTab === 'Author' && renderAuthors()}
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

  authorCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },

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
});
