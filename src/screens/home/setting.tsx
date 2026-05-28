import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthUser } from '../../redux/Slices/authSlice';
import { clearSavedBookmarkIds } from '../../services/bookmarkStorage';
import { clearSavedAuthUser } from '../../services/authStorage';
import { clearSavedLikeIds } from '../../services/likeStorage';
import { getThemeColors, ThemeMode } from '../../constants/theme';
import { setThemeMode } from '../../redux/Slices/themeSlice';
import { saveThemeMode } from '../../services/themeStorage';

const Setting = (props: any) => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: any) => state.theme.mode);
  const colors = getThemeColors(themeMode);
  const isDarkMode = themeMode === 'dark';

  const handleThemeToggle = async (value: boolean) => {
    const nextMode: ThemeMode = value ? 'dark' : 'light';

    dispatch(setThemeMode(nextMode));
    await saveThemeMode(nextMode);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearSavedAuthUser();
          await clearSavedBookmarkIds();
          await clearSavedLikeIds();
          dispatch(clearAuthUser());
          props.navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack('ProfileScreen')}
          >
            <Image source={require('../../assets/png/backAerro.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>
          <Text style={[styles.settingText, { color: colors.text }]}>Setting</Text>
        </View>
        <View style={styles.mainView}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => props.navigation.navigate('NotificationScreen')}
          >
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/Bell.png')} style={{ tintColor: colors.icon }} />
              <Text style={[styles.iconText, { color: colors.text }]}>Notification</Text>
            </View>
            <Image source={require('../../assets/png/rightArrow.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/lockIcon.png')} style={{ tintColor: colors.icon }} />
              <Text style={[styles.iconText, { color: colors.text }]}>Security</Text>
            </View>
            <Image source={require('../../assets/png/rightArrow.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/helpIcon.png')} style={{ tintColor: colors.icon }} />
              <Text style={[styles.iconText, { color: colors.text }]}>Help</Text>
            </View>
            <Image source={require('../../assets/png/rightArrow.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/darkmode.png')} style={{ tintColor: colors.icon }} />
              <Text style={[styles.iconText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={isDarkMode ? '#2F80ED' : '#F9FAFB'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/logout.png')} style={{ tintColor: colors.icon }} />
              <Text style={[styles.iconText, { color: colors.text }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainView: {
    marginTop: 20,
    gap: 20,
  },
  settingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
    flex: 1,
    marginRight: 25,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconText: {
    fontSize: 16,
    color: '#333',
  },
});
