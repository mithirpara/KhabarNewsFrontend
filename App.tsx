import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import MainStack from './src/navigation/MainNavigation';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { updateProfileData } from './src/redux/Slices/profileSlice';
import { getProfile } from './src/services/profileApi';

const AppBootstrap = () => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (!user?.uid) {
        return;
      }

      try {
        const response = await getProfile(user.uid);
        const savedProfile = response?.data || {};

        store.dispatch(
          updateProfileData({
            username: savedProfile.username || '',
            fullName: savedProfile.fullName || '',
            email: savedProfile.email || '',
            phoneNumber: savedProfile.phoneNumber || '',
            bio: savedProfile.bio || '',
            website: savedProfile.website || '',
            image:
              savedProfile.profileImage ||
              require('./src/assets/png/profile-1.png'),
          }),
        );
      } catch (error: any) {
        if (error?.message !== 'Profile not found') {
          console.log('Profile bootstrap failed:', error?.message || error);
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      <MainStack />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  );
};

export default App;
