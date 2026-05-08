import { API_BASE_URL } from '../config/api';

type SaveProfilePayload = {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  website: string;
  profileImage: string;
};

export async function saveProfile(payload: SaveProfilePayload) {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to save profile');
  }

  return data;
}

export async function getProfile(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch profile');
  }

  return data;
}