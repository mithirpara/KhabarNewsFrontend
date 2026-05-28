import { Platform } from 'react-native';

const androidBaseUrl = 'http://192.168.1.71:5000';
const iosSimulatorBaseUrl = 'http://localhost:5000';
const androidAuthBaseUrl = 'http://192.168.1.71:5001';
const iosSimulatorAuthBaseUrl = 'http://localhost:5001';

export const API_BASE_URL =
  Platform.OS === 'android' ? androidBaseUrl : iosSimulatorBaseUrl;

export const AUTH_API_BASE_URL =
  Platform.OS === 'android' ? androidAuthBaseUrl : iosSimulatorAuthBaseUrl;


