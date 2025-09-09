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
  const { socket, isConnected } = useSocket();
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

  // Listen for real-time online/offline events
  useEffect(() => {
    if (!socket || !isConnected || !clubId) return;

    const handleUserOnline = (event: any) => {
      if (event.clubId === clubId) {
        // Refresh the online users list
        mutate();
      }
    };

    const handleUserOffline = (event: any) => {
      if (event.clubId === clubId) {
        // Refresh the online users list
        mutate();
      }
    };

    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket, isConnected, clubId, mutate]);

  return {
    onlineUsers: data?.data?.onlineUsers || [],
    count: data?.data?.count || 0,
    error,
    isLoading,
    mutate
  };
}
