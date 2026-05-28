import { API_BASE_URL } from '../config/api';

export type NotificationItem = {
  id: string;
  sectionTitle?: string;
  type?: string;
  name: string;
  message: string;
  time: string;
  createdAt?: string;
  date?: string;
  image?: string;
  avatar?: string;
  follow?: boolean;
  authorId?: string;
  sourceId?: string;
  userId?: string;
};

type NotificationsResponse = {
  success?: boolean;
  data?: NotificationItem[];
  notifications?: NotificationItem[];
  message?: string;
};

export async function getNotifications(limit = 10) {
  const response = await fetch(`${API_BASE_URL}/api/notifications?limit=${limit}`);
  const data: NotificationsResponse = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data?.message || 'Failed to fetch notifications');
  }

  return data.data || data.notifications || [];
}
