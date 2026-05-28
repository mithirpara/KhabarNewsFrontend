import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { API_BASE_URL } from '../config/api';
import { getSavedAuthUser } from './authStorage';

type RegisterTokenPayload = {
  userId: string;
  fcmToken: string;
  platform: string;
};

const postJson = async (path: string, body: unknown) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

export const getCurrentUserId = async () => {
  const savedUser = await getSavedAuthUser();
  return savedUser?.userId || auth().currentUser?.uid || '';
};

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const createNotificationChannel = async () => {
  if (Platform.OS !== 'android') {
    return 'default';
  }

  return notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
};

export const registerPushToken = async (userId?: string) => {
  const resolvedUserId = userId || (await getCurrentUserId());

  if (!resolvedUserId) {
    return null;
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  await createNotificationChannel();
  await messaging().registerDeviceForRemoteMessages();
  const fcmToken = await messaging().getToken();

  const payload: RegisterTokenPayload = {
    userId: resolvedUserId,
    fcmToken,
    platform: Platform.OS,
  };

  await postJson('/api/notifications/register-token', payload);

  return fcmToken;
};

export const listenForPushTokenRefresh = (userId?: string) =>
  messaging().onTokenRefresh(async fcmToken => {
    const resolvedUserId = userId || (await getCurrentUserId());

    if (!resolvedUserId) {
      return;
    }

    await postJson('/api/notifications/register-token', {
      userId: resolvedUserId,
      fcmToken,
      platform: Platform.OS,
    });
  });

export const listenForForegroundNotifications = () =>
  messaging().onMessage(async remoteMessage => {
    const channelId = await createNotificationChannel();

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Khabar News',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  });

export const sendFollowNotification = async (authorId: string) => {
  const followerId = await getCurrentUserId();

  if (!followerId) {
    throw new Error('Please login before following.');
  }

  return postJson('/api/notifications/follow', {
    followerId,
    followingId: authorId,
  });
};
