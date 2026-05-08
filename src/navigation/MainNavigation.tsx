import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/Splash';
import BannerScreen1 from '../screens/auth/Banner-1';
import LoginScreen from '../screens/auth/Login';
import SignUPScreen from '../screens/auth/SignUP';
import HomeNavigation from './HomeNavigation';
import ForgotPasswordScreen from '../screens/auth/ForgotPassword';
import ForgetPassInputScreen from '../screens/auth/ForgetPassInput';
import OTPScreen from '../screens/auth/OTP';
import ResetPasswordScreen from '../screens/auth/ResetPassword';
import CongratulationScreen from '../screens/auth/Congratulation';
import TabNavigation from './TabNavigation';
const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="BannerScreen1" component={BannerScreen1} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUPScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name="ForgetPassInputScreen"
        component={ForgetPassInputScreen}
      />

      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
      <Stack.Screen
        name="CongratulationScreen"
        component={CongratulationScreen}
      />
      <Stack.Screen name="HomeNavigation" component={HomeNavigation} />
    </Stack.Navigator>
  );
};

export default MainStack;
