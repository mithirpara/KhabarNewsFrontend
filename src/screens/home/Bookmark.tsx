import React, { useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { setSearchText } from '../../redux/Slices/newcSlices';

const Bookmark = (props:any) => {
  const dispatch = useDispatch();

  const newsList = useSelector(state => state.news.newsList);
  const searchText = useSelector(state => state.news.searchText);

  const filteredNews = newsList.filter(item =>
    item.category.toLowerCase().includes(searchText.toLowerCase()),
  );
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.headertext}>Bookmark</Text>

        <View style={styles.inputContainer}>
          <Image source={require('../../assets/png/search.png')} />

          <TextInput
            placeholder="Search"
            value={searchText}
            onChangeText={text => dispatch(setSearchText(text))}
            placeholderTextColor={'#A0A3BD'}
            style={styles.input}
          />
          <TouchableOpacity>
            <Image source={require('../../assets/png/options.png')} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredNews}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => props.navigation.navigate("DetailsScreen")}>
              <View style={styles.card}>
                <Image source={item.image1} style={styles.image} />
                <View style={styles.content}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 6,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={styles.bottomRow}>
                      <Image
                        source={item.image2}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={styles.source}>{item.source}</Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <TouchableOpacity>
                      <Image source={require('../../assets/png/dots.png')} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Bookmark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    width: '100%',
  },
  headertext: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
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
  card: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
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
