import useSWR from 'swr';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { useAuth } from '../contexts/AuthContext';

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  showOnlineStatus: boolean;
  enableNotifications: boolean;
  enableNotificationSound: boolean;
  notificationSound: 'default' | 'bell' | 'chime' | 'none';
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

export interface UserSettingsResponse {
  success: boolean;
  data: UserSettings;
}

export function useCurrentUserSettings() {
  const { user } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR<UserSettingsResponse>(
    user ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/settings` : null,
    async (url: string) => {
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  );

  const updateSettings = async (settingsData: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }

    // Revalidate the data after successful update
    mutate();
    return response.json();
  };

  return {
    settings: data?.data,
    error,
    isLoading,
    mutate,
    updateSettings
  };
}
