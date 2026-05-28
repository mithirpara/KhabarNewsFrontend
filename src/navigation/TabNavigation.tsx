import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import HomeScreen from '../screens/home/home';
import ExploreScreen from '../screens/home/Explore';
import BookmarkScreen from '../screens/home/Bookmark';
import ProfileScreen from '../screens/home/Profile';
import { getThemeColors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const themeMode = useSelector((state: any) => state.theme.mode);
  const colors = getThemeColors(themeMode);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          height: 70,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={styles.container}
            >
              <Image
                source={focused ? require('../assets/png/Icon4.png') : require('../assets/png/home.png')}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? undefined : colors.icon,
                }}
              />
              <Text
                style={{
                  width: 100,
                  color: focused ? '#2F80ED' : '#888',
                  textAlign: 'center',
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={styles.container}
            >
              <Image
                source={focused ? require('../assets/png/Icon2.png') : require('../assets/png/Explore.png')}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? undefined : colors.icon,
                }}
              />
              <Text
                style={{
                  width: 100,
                  color: focused ? '#2F80ED' : '#888',
                  textAlign: 'center',
                }}
              >
                Explore
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Bookmark"
        component={BookmarkScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={styles.container}
            >
              <Image
                source={focused ? require('../assets/png/Icon1.png') : require('../assets/png/Bookmark.png')}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? undefined : colors.icon,
                }}
              />
              <Text
                style={{
                  width: 100,
                  color: focused ? '#2F80ED' : '#888',
                  textAlign: 'center',
                }}
              >
                Bookmark
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.container}>
              <Image
                source={focused ? require('../assets/png/Icon3.png') : require('../assets/png/Icon5.png') }
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? undefined : colors.icon,
                  
                }}
              />
              <Text
                style={{
                  width: 100,
                  color: focused ? '#2F80ED' : '#888',
                  textAlign: 'center',
                }}
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 40,
    height: '100%',
  },
  text: {
    width: 25,
    height: 25,
  },
});
