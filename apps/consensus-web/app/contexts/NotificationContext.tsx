'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useTargetedUpdates } from '../hooks/useTargetedUpdates';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { playNotificationSoundIfEnabled } from '../utils/notificationSound';

export interface Notification {
  id: string;
  type: string;
  status: 'unread' | 'read';
  title: string;
  message: string;
  data?: any;
  userEmail: string;
  clubId: string;
  roundId?: string;
  createdAt: string;
  updatedAt: string;
  club?: {
    id: string;
    name: string;
    type: string;
  };
  round?: {
    id: string;
    status: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadNotifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  fetchNotifications: (page?: number, limit?: number, append?: boolean) => Promise<{hasMore: boolean, total: number}>;
  fetchUnreadNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { onNotificationCreated, onVoteCast, onMemberAdded, onMemberRemoved, onMemberRoleChanged, onRecommendationAdded, onCompletionUpdated } = useSocket();
  const { handleNotificationUpdate } = useTargetedUpdates();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchNotifications = async (page: number = 1, limit: number = 20, append: boolean = false) => {
    if (!user || authLoading || !isAuthenticated) return { hasMore: false, total: 0 };

    try {
      setLoading(true);
      setError(null);

      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await authenticatedFetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}&_t=${cacheBuster}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      if (result.success) {
        const newNotifications = result.data.notifications;
        const total = result.data.total;
        const hasMoreData = result.data.hasMore;

        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setTotalCount(total);
        setHasMore(hasMoreData);
        
        return { hasMore: hasMoreData, total };
      } else {
        throw new Error(result.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      return { hasMore: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    if (!user || authLoading || !isAuthenticated) return;

    try {
      setError(null);

      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/unread?_t=${cacheBuster}`);

      if (!response.ok) {
        throw new Error('Failed to fetch unread notifications');
      }

      const result = await response.json();
      if (result.success) {
        const newCount = result.data.length;
        const previousCount = unreadCount;
        
        setUnreadNotifications(result.data);
        setUnreadCount(newCount);
        
        // Only play sound if we have new notifications (count increased)
        // Skip sound on initial load to avoid playing sound when user first logs in
        if (newCount > previousCount && !isInitialLoad) {
          console.log('🔔 Playing notification sound - new count:', newCount, 'previous count:', previousCount);
          playNotificationSoundIfEnabled();
        } else {
          console.log('🔇 Not playing sound - new count:', newCount, 'previous count:', previousCount, 'isInitialLoad:', isInitialLoad);
        }
        
        // Mark that initial load is complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch unread notifications');
      }
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch unread notifications');
    }
  };

  const fetchUnreadCount = async () => {
    if (!user || authLoading || !isAuthenticated) return;

    try {
      setError(null);

      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/unread/count?_t=${cacheBuster}`);

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const result = await response.json();
      if (result.success) {
        setUnreadCount(result.data.count);
      } else {
        throw new Error(result.message || 'Failed to fetch unread count');
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch unread count');
    }
  };

  // Debounced version to prevent excessive API calls
  const debouncedFetchUnreadCount = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchUnreadNotifications(); // This now also updates the count
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [user, authLoading, isAuthenticated]);

  const markAsRead = async (notificationId: string) => {
    if (!user || authLoading || !isAuthenticated) return;

    try {
      setError(null);

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' as const }
              : notification
          )
        );
        setUnreadNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(result.message || 'Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user || authLoading || !isAuthenticated) return;

    try {
      setError(null);

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read' as const }))
        );
        setUnreadNotifications([]);
        setUnreadCount(0);
      } else {
        throw new Error(result.message || 'Failed to mark all notifications as read');
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user || authLoading || !isAuthenticated) return;

    try {
      setError(null);

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && deletedNotification.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        throw new Error(result.message || 'Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    if (!user || authLoading || !isAuthenticated) return;

    try {
      setError(null);

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/delete-read`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete all read notifications');
      }

      const result = await response.json();
      if (result.success) {
        // Remove all read notifications from local state
        setNotifications(prev => prev.filter(n => n.status === 'unread'));
        // Unread notifications remain unchanged
        // Unread count remains unchanged
      } else {
        throw new Error(result.message || 'Failed to delete all read notifications');
      }
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete all read notifications');
    }
  };

  const refreshNotifications = async () => {
    await Promise.all([
      fetchUnreadCount(),
      fetchUnreadNotifications(),
      fetchNotifications(1, 20)
    ]);
  };

  // Initial load when user is authenticated
  useEffect(() => {
    if (user && !authLoading && isAuthenticated) {
      refreshNotifications();
    }
  }, [user, authLoading, isAuthenticated]);

  // Set up periodic refresh for unread count (every 2 minutes)
  useEffect(() => {
    if (!user || authLoading || !isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 120000); // 2 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [user, authLoading, isAuthenticated]);

  // Set up socket event listeners to refresh notifications in real-time
  useEffect(() => {
    if (!user || authLoading || !isAuthenticated) return;

    const handleNotificationCreated = (data: any) => {
      console.log('Notification created event received:', data);
      
      // Use debounced fetch to prevent excessive requests
      // Sound will be played in fetchUnreadNotifications if count increases
      debouncedFetchUnreadCount();
    };

    const handleVoteCast = (data: any) => {
      // Use targeted updates instead of full refresh
      console.log('Vote cast event received:', data);
      handleNotificationUpdate(data);
      // No need to fetch count for vote events
    };

    const handleMemberAdded = (data: any) => {
      // Use targeted updates instead of full refresh
      console.log('Member added event received:', data);
      handleNotificationUpdate(data);
      // No need to fetch count for member events
    };

    const handleMemberRemoved = (data: any) => {
      // Use targeted updates instead of full refresh
      console.log('Member removed event received:', data);
      handleNotificationUpdate(data);
      // No need to fetch count for member events
    };

    const handleMemberRoleChanged = (data: any) => {
      // Use targeted updates instead of full refresh
      console.log('Member role changed event received:', data);
      handleNotificationUpdate(data);
      // No need to fetch count for member events
    };

    const handleRecommendationAdded = (data: any) => {
      // Use targeted updates instead of full refresh
      console.log('Recommendation added event received:', data);
      handleNotificationUpdate(data);
      // No need to fetch count for recommendation events
    };

    const handleCompletionUpdated = (data: any) => {
      // Use targeted updates instead of full refresh
      console.log('Completion updated event received:', data);
      handleNotificationUpdate(data);
      // No need to fetch count for completion events
    };

    // Set up event listeners
    onNotificationCreated(handleNotificationCreated);
    onVoteCast(handleVoteCast);
    onMemberAdded(handleMemberAdded);
    onMemberRemoved(handleMemberRemoved);
    onMemberRoleChanged(handleMemberRoleChanged);
    onRecommendationAdded(handleRecommendationAdded);
    onCompletionUpdated(handleCompletionUpdated);

    // Cleanup function to remove listeners
    return () => {
      // Note: The socket manager should handle cleanup, but we can't easily remove specific callbacks
      // The socket manager will clean up when the component unmounts
    };
  }, [user, authLoading, isAuthenticated, onNotificationCreated, onVoteCast, onMemberAdded, onMemberRemoved, onMemberRoleChanged, onRecommendationAdded, onCompletionUpdated, handleNotificationUpdate, debouncedFetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    hasMore,
    totalCount,
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
