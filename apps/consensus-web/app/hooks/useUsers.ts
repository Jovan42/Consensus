import useSWR from 'swr';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  emailVerified: boolean;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  showOnlineStatus: boolean;
  enableNotifications: boolean;
  enableNotificationSound: boolean;
  notificationSound: string;
  notificationDuration: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  itemsPerPage: number;
  showProfilePicture: boolean;
  showEmailInProfile: boolean;
  autoJoinClubs: boolean;
  showVoteProgress: boolean;
  showCompletionProgress: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UserSettingsResponse {
  success: boolean;
  data: UserSettings;
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users`,
    async (url: string) => {
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  );


  return {
    users: data?.data || [],
    error,
    isLoading,
    mutate
  };
}

export function useUser(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    userId ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}` : null,
    async (url: string) => {
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  );

  return {
    user: data?.data,
    error,
    isLoading,
    mutate
  };
}

export function useUserSettings(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<UserSettingsResponse>(
    userId ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/settings` : null,
    async (url: string) => {
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  );

  return {
    settings: data?.data,
    error,
    isLoading,
    mutate
  };
}

export async function createUser(userData: Partial<User>) {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }

  return response.json();
}

export async function updateUser(userId: string, userData: Partial<User>) {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }

  return response.json();
}

export async function deleteUser(userId: string) {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }

  return response.json();
}

export async function updateUserSettings(userId: string, settingsData: Partial<UserSettings>) {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user settings');
  }

  return response.json();
}
