import useSWR from 'swr';
import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export interface OnlineUser {
  userId: string;
  userEmail: string;
  userName: string;
}

export interface OnlineUsersResponse {
  success: boolean;
  data: {
    clubId: string;
    onlineUsers: OnlineUser[];
    count: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useOnlineUsers(clubId: string) {
  const { isConnected } = useSocket();
  const { data, error, isLoading, mutate } = useSWR<OnlineUsersResponse>(
    clubId ? `/clubs/${clubId}/online-users` : null,
    async (url: string) => {
      const response = await authenticatedFetch(`${API_BASE_URL}${url}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds (less frequent since we have real-time updates)
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Note: Real-time online/offline events are not yet implemented in SocketContext
  // For now, we rely on SWR's automatic revalidation and polling

  return {
    onlineUsers: data?.data?.onlineUsers || [],
    count: data?.data?.count || 0,
    error,
    isLoading,
    mutate
  };
}
