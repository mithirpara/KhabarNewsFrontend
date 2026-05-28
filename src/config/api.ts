import { Platform } from 'react-native';

const androidBaseUrl = 'https://khabarnew-api.onrender.com';
const iosSimulatorBaseUrl = 'https://khabarnew-api.onrender.com';
const androidAuthBaseUrl = 'https://khabarnew-api.onrender.com';
const iosSimulatorAuthBaseUrl = 'https://khabarnew-api.onrender.com';

export const API_BASE_URL =
  Platform.OS === 'android' ? androidBaseUrl : iosSimulatorBaseUrl;

export const AUTH_API_BASE_URL =
  Platform.OS === 'android' ? androidAuthBaseUrl : iosSimulatorAuthBaseUrl;

