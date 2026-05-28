import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../constants/theme';

const THEME_MODE_KEY = 'THEME_MODE';

export async function saveThemeMode(mode: ThemeMode) {
  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}

export async function getSavedThemeMode() {
  const mode = await AsyncStorage.getItem(THEME_MODE_KEY);

  return mode === 'dark' ? 'dark' : 'light';
}
