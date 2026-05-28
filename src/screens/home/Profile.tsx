import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import { API_BASE_URL } from '../../config/api';
import { updateProfileData } from '../../redux/Slices/profileSlice';
import { getProfile } from '../../services/profileApi';
import { useAppTheme } from '../../hooks/useAppTheme';
import RemoteImage from '../../component/RemoteImage';

type ProfileFeedItem = {
  id: string;
  category: string;
  title: string;
  time: string;
  image?: string | ImageSourcePropType;
  imageUrl?: string;
  urlToImage?: string;
};

const getImageSource = (
  image?: string | ImageSourcePropType,
): ImageSourcePropType => {
  if (!image) {
    return require('../../assets/png/NewsImage.png');
  }

  return typeof image === 'string' ? { uri: image } : image;
};

const newsImageFallback = require('../../assets/png/NewsImage.png');

const getFeedImageUri = (item: any) => item?.image || item?.imageUrl || item?.urlToImage || item?.image1 || '';

const Profile = (props: any) => {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState('recent');
  const [newsData, setNewsData] = useState<ProfileFeedItem[]>([]);
  const [recentData, setRecentData] = useState<ProfileFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const profileData = useSelector((state: any) => state.profile);
  const authData = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const data = activeTab === 'news' ? newsData : recentData;
  const name = profileData.fullName;
  const bio = profileData.bio;
  const image = profileData.image;
  const website = profileData.website;
  const profileImageSource: ImageSourcePropType =
    typeof image === 'string' && image
      ? { uri: image }
      : image || require('../../assets/png/profile-1.png');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadProfile = async () => {
        try {
          const userId = auth().currentUser?.uid || authData?.userId;

          if (!userId) {
            return;
          }

          const response = await getProfile(userId);
          const savedProfile = response?.data || {};

          if (!isMounted) {
            return;
          }

          dispatch(
            updateProfileData({
              username: savedProfile.username || '',
              fullName: savedProfile.fullName || '',
              email: savedProfile.email || '',
              phoneNumber: savedProfile.phoneNumber || '',
              bio: savedProfile.bio || '',
              website: savedProfile.website || '',
              image:
                savedProfile.profileImage ||
                require('../../assets/png/profile-1.png'),
            }),
          );
        } catch (error: any) {
          const message = error?.message || '';
          if (message && message !== 'Profile not found') {
            Alert.alert('Profile load failed', message);
          }
        }
      };

      const loadProfileFeeds = async () => {
        try {
          setFeedLoading(true);
          const [newsResponse, recentResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/profile/news`),
            fetch(`${API_BASE_URL}/api/profile/recent`),
          ]);
          const [newsJson, recentJson] = await Promise.all([
            newsResponse.json(),
            recentResponse.json(),
          ]);

          if (!isMounted) {
            return;
          }

          setNewsData(Array.isArray(newsJson?.data) ? newsJson.data : []);
          setRecentData(
            Array.isArray(recentJson?.data) ? recentJson.data : [],
          );
        } catch (error) {
          console.log('Profile feed load failed:', error);
        } finally {
          if (isMounted) {
            setFeedLoading(false);
          }
        }
      };

      loadProfile();
      loadProfileFeeds();

      return () => {
        isMounted = false;
      };
    }, [authData?.userId, dispatch]),
  );

  const openWebsite = () => {
    if (!website) {
      console.log('No website found');
      return;
    }

    let url = website;

    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    Linking.openURL(url).catch(err => console.log('Failed to open URL:', err));
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        props.navigation.navigate('DetailsScreen', {
          article: item,
          articleId: item.articleId || item.id,
        })
      }
      style={{ flexDirection: 'row', marginBottom: 15, gap: 10, width: '100%' }}
    >
      {typeof item.image === 'string' || item.imageUrl || item.urlToImage ? (
        <RemoteImage
          uri={getFeedImageUri(item)}
          fallbackSource={newsImageFallback}
          style={styles.feedImage}
        />
      ) : (
        <Image source={getImageSource(item.image)} style={styles.feedImage} />
      )}

      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>
          {item.category}
        </Text>
        <Text
          numberOfLines={2}
          style={{ fontSize: 16, color: colors.text, marginTop: 5 }}
        >
          {item.title}
        </Text>

        <Text style={{ fontSize: 12, color: colors.mutedText, marginTop: 5 }}>
          {name} - {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View>
          <View style={styles.header}>
            <Text style={{ color: colors.text }}>Profile</Text>
            <TouchableOpacity
              style={{ position: 'absolute', right: 15 }}
              onPress={() => props.navigation.navigate('SettingScreen')}
            >
              <Image
                source={require('../../assets/png/setting.png')}
                style={{ tintColor: colors.icon }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.profileView}>
            <Image source={profileImageSource} style={styles.profileImage} />
            <View style={styles.statsRow}>
              <View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.followers}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Followers</Text>
              </View>

              <View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.following}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>Following</Text>
              </View>

              <View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.news}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>News</Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={{ color: colors.text }}>{name}</Text>
            <Text style={{ color: colors.mutedText }}>{bio}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.followBtn}
                onPress={() => props.navigation.navigate('EditProfileScreen')}
              >
                <Text style={styles.btnText}>Edit profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.websiteBtn, { opacity: website ? 1 : 0.5 }]}
                onPress={openWebsite}
                disabled={!website}
              >
                <Text style={styles.btnText}>Website</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.tabRow, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => setActiveTab('news')}>
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.mutedText },
                    activeTab === 'news' && styles.activeTab,
                  ]}
                >
                  News
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setActiveTab('recent')}>
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.mutedText },
                    activeTab === 'recent' && styles.activeTab,
                  ]}
                >
                  Recent
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={{ marginTop: 10, width: '100%' }}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                  {feedLoading ? 'Loading...' : 'No data found'}
                </Text>
              }
            />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Image source={require('../../assets/png/Add1.png')} style={styles.fabIcon} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  feedImage: {
    width: 96,
    height: 72,
    borderRadius: 8,
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    marginTop: 25,
    textAlign: 'center',
  },
  profileView: {
    alignItems: 'center',
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    gap: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  followBtn: {
    backgroundColor: '#1877F2',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 8,
    width: '48%',
  },
  websiteBtn: {
    backgroundColor: '#1877F2',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 8,
    width: '48%',
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    height: 18,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tabText: {
    marginRight: 20,
    paddingBottom: 8,
    color: '#888',
    fontSize: 14,
  },
  activeTab: {
    color: '#2979FF',
    borderBottomWidth: 2,
    borderColor: '#2979FF',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    zIndex: 10,
    elevation: 8,
  },
  fabIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
});


