import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { clearAuthUser } from '../../redux/Slices/authSlice';
import { clearSavedAuthUser } from '../../services/authStorage';

const Setting = (props: any) => {
  const dispatch = useDispatch();

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
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack('ProfileScreen')}
          >
            <Image source={require('../../assets/png/backAerro.png')} />
          </TouchableOpacity>
          <Text style={styles.settingText}>Setting</Text>
        </View>
        <View style={styles.mainView}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => props.navigation.navigate('NotificationScreen')}
          >
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/Bell.png')} />
              <Text style={styles.iconText}>Notification</Text>
            </View>
            <Image source={require('../../assets/png/rightArrow.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/lockIcon.png')} />
              <Text style={styles.iconText}>Security</Text>
            </View>
            <Image source={require('../../assets/png/rightArrow.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/helpIcon.png')} />
              <Text style={styles.iconText}>Help</Text>
            </View>
            <Image source={require('../../assets/png/rightArrow.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/darkmode.png')} />
              <Text style={styles.iconText}>Dark Mode</Text>
            </View>
            <Image source={require('../../assets/png/Toggle.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.iconView}>
              <Image source={require('../../assets/png/logout.png')} />
              <Text style={styles.iconText}>Logout</Text>
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
