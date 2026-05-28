import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_FOLLOW_IDS_KEY = 'SAVED_FOLLOW_IDS';

const normalizeFollowId = (authorId: string) => String(authorId || '').trim();

export async function getSavedFollowIds() {
  const savedIds = await AsyncStorage.getItem(SAVED_FOLLOW_IDS_KEY);

  if (!savedIds) {
    return [];
  }

  return JSON.parse(savedIds) as string[];
}

export async function isAuthorFollowed(authorId: string) {
  const normalizedId = normalizeFollowId(authorId);
  const savedIds = await getSavedFollowIds();

  return savedIds.includes(normalizedId);
}

export async function saveFollowId(authorId: string) {
  const normalizedId = normalizeFollowId(authorId);

  if (!normalizedId) {
    return;
  }

  const savedIds = await getSavedFollowIds();

  if (savedIds.includes(normalizedId)) {
    return;
  }

  await AsyncStorage.setItem(
    SAVED_FOLLOW_IDS_KEY,
    JSON.stringify([...savedIds, normalizedId]),
  );
}

export async function removeFollowId(authorId: string) {
  const normalizedId = normalizeFollowId(authorId);
  const savedIds = await getSavedFollowIds();

  await AsyncStorage.setItem(
    SAVED_FOLLOW_IDS_KEY,
    JSON.stringify(savedIds.filter(id => id !== normalizedId)),
  );
}

export async function clearSavedFollowIds() {
  await AsyncStorage.removeItem(SAVED_FOLLOW_IDS_KEY);
}
