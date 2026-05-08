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
import { updateProfileData } from '../../redux/Slices/profileSlice';
import { getProfile } from '../../services/profileApi';

const Profile = (props: any) => {
  const [activeTab, setActiveTab] = useState('recent');
  const profileData = useSelector((state: any) => state.profile);
  const authData = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const data =
    activeTab === 'news' ? profileData.newsData : profileData.recentData;
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

      loadProfile();

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
    <View style={{ flexDirection: 'row', marginBottom: 15, gap: 10, width: '100%' }}>
      <Image source={item.image} />

      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          {item.category}
        </Text>
        <Text
          numberOfLines={2}
          style={{ fontSize: 16, color: '#333', marginTop: 5 }}
        >
          {item.title}
        </Text>

        <Text style={{ fontSize: 12, color: '#777', marginTop: 5 }}>
          {name} - {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View>
          <View style={styles.header}>
            <Text>Profile</Text>
            <TouchableOpacity
              style={{ position: 'absolute', right: 15 }}
              onPress={() => props.navigation.navigate('SettingScreen')}
            >
              <Image source={require('../../assets/png/setting.png')} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileView}>
            <Image source={profileImageSource} style={styles.profileImage} />
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statNumber}>{profileData.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View>
                <Text style={styles.statNumber}>{profileData.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>

              <View>
                <Text style={styles.statNumber}>{profileData.news}</Text>
                <Text style={styles.statLabel}>News</Text>
              </View>
            </View>
          </View>
          <View>
            <Text>{name}</Text>
            <Text>{bio}</Text>

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

            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setActiveTab('news')}>
                <Text
                  style={[
                    styles.tabText,
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


