import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNotifications } from '@/app/contexts/NotificationContext';

interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'user';
  banned: boolean;
  banReason?: string;
  bannedAt?: string;
  emailVerified: boolean;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUserResponse {
  success: boolean;
  data: CurrentUserData;
}

export function useCurrentUser() {
  const { user, isAuthenticated } = useAuth();
  const { notifications } = useNotifications();
  
  const { data, error, isLoading, mutate } = useSWR<CurrentUserResponse>(
    isAuthenticated && user?.email ? `/users/current` : null,
    (url) => fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${url}`, {
      headers: {
        'x-user-email': user?.email || '',
        'x-user-name': user?.name || '',
        'x-user-role': user?.role || '',
        'x-user-sub': user?.sub || '',
        'x-user-type': 'test'
      }
    }).then(res => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0
    }
  );

  // Refresh user data when ban/unban notifications are received
  React.useEffect(() => {
    console.log('useCurrentUser: notifications changed:', notifications);
    
    const hasBanNotification = notifications.some(notification => {
      console.log('useCurrentUser: checking notification type:', notification.type);
      return notification.type === 'user_banned' || notification.type === 'user_unbanned';
    });
    
    if (hasBanNotification) {
      console.log('useCurrentUser: Ban notification detected, refreshing user data');
      mutate(); // Refresh user data
    }
  }, [notifications, mutate]);

  return {
    currentUser: data?.data,
    isLoading,
    error,
    mutate
  };
}
