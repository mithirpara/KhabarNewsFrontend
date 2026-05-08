import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../../redux/Slices/authSlice';
import { getSavedAuthUser } from '../../services/authStorage';

const SplashScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const savedUser = await getSavedAuthUser();

      if (savedUser?.userId) {
        dispatch(setAuthUser(savedUser));
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeNavigation' }],
        });
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'BannerScreen1' }],
      });
    };

    const timer = setTimeout(() => {
      bootstrapAuth();
    }, 1200);

    return () => clearTimeout(timer);
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image source={require('../../assets/png/Frame.png')} />
        <ActivityIndicator color="#2563eb" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  logoWrapper: {
    marginVertical: 250,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  loader: {
    marginTop: 24,
  },
});
