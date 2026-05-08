import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER_STORAGE_KEY = 'AUTH_USER';

export type StoredAuthUser = {
  userId: string;
  email: string;
  username: string;
  fullName: string;
};

export async function saveAuthUser(user: StoredAuthUser) {
  await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export async function getSavedAuthUser() {
  const savedUser = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!savedUser) {
    return null;
  }

  return JSON.parse(savedUser) as StoredAuthUser;
}

export async function clearSavedAuthUser() {
  await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
