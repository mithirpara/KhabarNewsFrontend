import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/home';
import TabNavigation from './TabNavigation';
import TerndingScreen from '../screens/home/Ternding';
import NotificationScreen from '../screens/home/Notification';
import SearchScreen from '../screens/home/Search';
import AuthorDetailScreen from '../screens/home/AuthorDetail';
import DetailsScreen from '../screens/home/Details';
import CommentScreen from '../screens/home/comment';
import SettingScreen from '../screens/home/setting';
import EditProfileScreen from '../screens/home/editProfile';
import { useAppTheme } from '../hooks/useAppTheme';

const Stack = createNativeStackNavigator();

const HomeNavigation = () => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="TabNavigation" component={TabNavigation} />
      <Stack.Screen name="TerndingScreen" component={TerndingScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="AuthorDetailScreen" component={AuthorDetailScreen} />
      <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
      <Stack.Screen name="CommentScreen" component={CommentScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigation;
