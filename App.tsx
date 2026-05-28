import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import MainStack from './src/navigation/MainNavigation';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import { updateProfileData } from './src/redux/Slices/profileSlice';
import { getProfile } from './src/services/profileApi';
import { getThemeColors } from './src/constants/theme';
import { getSavedThemeMode } from './src/services/themeStorage';
import { setThemeMode } from './src/redux/Slices/themeSlice';
import {
  listenForForegroundNotifications,
  listenForPushTokenRefresh,
  registerPushToken,
} from './src/services/pushNotificationService';

const AppBootstrap = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: any) => state.theme.mode);
  const colors = getThemeColors(themeMode);

  useEffect(() => {
    const loadTheme = async () => {
      const savedThemeMode = await getSavedThemeMode();
      dispatch(setThemeMode(savedThemeMode));
    };

    loadTheme();
  }, [dispatch]);

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

      try {
        await registerPushToken(user.uid);
      } catch (error: any) {
        console.log('Push token registration failed:', error?.message || error);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    registerPushToken().catch((error: any) => {
      console.log('Saved user push token registration failed:', error?.message || error);
    });
  }, []);

  useEffect(() => {
    const unsubscribeTokenRefresh = listenForPushTokenRefresh();
    const unsubscribeForeground = listenForForegroundNotifications();

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.statusBar}
      />
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
