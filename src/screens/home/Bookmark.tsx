import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../config/api';
import { useSelector } from 'react-redux';
import { getThemeColors } from '../../constants/theme';

type BookmarkItem = {
  id: string;
  articleId?: string;
  bookmarkId?: string;
  category: string;
  title: string;
  source: string;
  time: string;
  image?: string;
  image1?: string | ImageSourcePropType;
  image2?: string | ImageSourcePropType;
};

const getImageSource = (
  image?: string | ImageSourcePropType,
  fallback?: ImageSourcePropType,
) => {
  if (!image) {
    return fallback;
  }

  return typeof image === 'string' ? { uri: image } : image;
};

const Bookmark = (props: any) => {
  const themeMode = useSelector((state: any) => state.theme.mode);
  const colors = getThemeColors(themeMode);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBookmarks = useCallback(async (queryText = searchText) => {
    try {
      setLoading(true);
      const query = queryText.trim();
      const url = query
        ? `${API_BASE_URL}/api/bookmarks?q=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/bookmarks`;
      const response = await fetch(url);
      const json = await response.json();

      setBookmarks(Array.isArray(json?.data) ? json.data : []);
    } catch (error) {
      console.warn('Failed to fetch bookmarks', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookmarks(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadBookmarks, searchText]);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks]),
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrapper}>
        <Text style={[styles.headertext, { color: colors.text }]}>Bookmark</Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Image source={require('../../assets/png/search.png')} style={{ tintColor: colors.icon }} />

          <TextInput
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={'#A0A3BD'}
            style={[styles.input, { color: colors.text }]}
          />
          <TouchableOpacity>
            <Image source={require('../../assets/png/options.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.bookmarkId || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate('DetailsScreen', {
                  article: item,
                  articleId: item.articleId || item.bookmarkId || item.id,
                })
              }
            >
              <View style={[styles.card, { backgroundColor: colors.background }]}>
                <Image
                  source={getImageSource(
                    item.image1 || item.image,
                    require('../../assets/png/News1.png'),
                  )}
                  style={styles.image}
                />
                <View style={styles.content}>
                  <Text style={[styles.category, { color: colors.mutedText }]}>{item.category}</Text>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
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
                        source={getImageSource(
                          item.image2,
                          require('../../assets/png/BCClogo2.png'),
                        )}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={styles.source}>{item.source}</Text>
                      <Text style={[styles.time, { color: colors.mutedText }]}>{item.time}</Text>
                    </View>
                    <TouchableOpacity>
                      <Image source={require('../../assets/png/dots.png')} style={{ tintColor: colors.icon }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              {loading ? 'Loading...' : 'No bookmark found'}
            </Text>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  contentWrapper: {
    flex: 1,
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
  emptyText: {
    color: '#888',
    fontSize: 14,
    marginTop: 40,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 90,
  },
});
