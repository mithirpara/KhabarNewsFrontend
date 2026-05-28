import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_LIKE_IDS_KEY = 'SAVED_LIKE_IDS';

async function getSavedLikeIds() {
  const savedIds = await AsyncStorage.getItem(SAVED_LIKE_IDS_KEY);

  if (!savedIds) {
    return [];
  }

  return JSON.parse(savedIds) as string[];
}

export async function isArticleLiked(articleId: string) {
  const savedIds = await getSavedLikeIds();

  return savedIds.includes(articleId);
}

export async function saveLikeId(articleId: string) {
  const savedIds = await getSavedLikeIds();

  if (savedIds.includes(articleId)) {
    return;
  }

  await AsyncStorage.setItem(
    SAVED_LIKE_IDS_KEY,
    JSON.stringify([...savedIds, articleId]),
  );
}

export async function clearSavedLikeIds() {
  await AsyncStorage.removeItem(SAVED_LIKE_IDS_KEY);
}
