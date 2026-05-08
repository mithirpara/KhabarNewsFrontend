import { Platform } from 'react-native';

const androidEmulatorBaseUrl = 'http://192.168.1.71:5000';
const iosSimulatorBaseUrl = 'http://localhost:5000';

export const API_BASE_URL =
  Platform.OS === 'android' ? androidEmulatorBaseUrl : iosSimulatorBaseUrl;



