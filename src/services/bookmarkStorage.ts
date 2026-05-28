import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_BOOKMARK_IDS_KEY = 'SAVED_BOOKMARK_IDS';

async function getSavedBookmarkIds() {
  const savedIds = await AsyncStorage.getItem(SAVED_BOOKMARK_IDS_KEY);

  if (!savedIds) {
    return [];
  }

  return JSON.parse(savedIds) as string[];
}

export async function isBookmarkSaved(articleId: string) {
  const savedIds = await getSavedBookmarkIds();

  return savedIds.includes(articleId);
}

export async function saveBookmarkId(articleId: string) {
  const savedIds = await getSavedBookmarkIds();

  if (savedIds.includes(articleId)) {
    return;
  }

  await AsyncStorage.setItem(
    SAVED_BOOKMARK_IDS_KEY,
    JSON.stringify([...savedIds, articleId]),
  );
}

export async function clearSavedBookmarkIds() {
  await AsyncStorage.removeItem(SAVED_BOOKMARK_IDS_KEY);
}
