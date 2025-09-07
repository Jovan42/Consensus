'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export interface Notification {
  id: string;
  type: string;
  status: 'unread' | 'read';
  title: string;
  message: string;
  data?: any;
  memberId: string;
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
  const { onNotification, onNotificationCreated, onVoteCast, onMemberAdded, onMemberRemoved, onMemberRoleChanged, onRecommendationAdded } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchNotifications = async (page: number = 1, limit: number = 20, append: boolean = false) => {
    if (!user || authLoading || !isAuthenticated) return { hasMore: false, total: 0 };

    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`);

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

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/unread`);

      if (!response.ok) {
        throw new Error('Failed to fetch unread notifications');
      }

      const result = await response.json();
      if (result.success) {
        setUnreadNotifications(result.data);
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

      const response = await authenticatedFetch(`${API_BASE_URL}/notifications/unread/count`);

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

  // Set up periodic refresh for unread count (every 30 seconds)
  useEffect(() => {
    if (!user || authLoading || !isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, authLoading, isAuthenticated]);

  // Set up socket event listeners to refresh notifications in real-time
  useEffect(() => {
    if (!user || authLoading || !isAuthenticated) return;

    const handleNotification = (data: any) => {
      // Refresh notifications when a new notification is received
      console.log('Notification event received:', data);
      refreshNotifications();
    };

    const handleNotificationCreated = (data: any) => {
      // Refresh notifications when a database notification is created
      console.log('Notification created event received:', data);
      refreshNotifications();
    };

    const handleVoteCast = (data: any) => {
      // Refresh notifications when a vote is cast
      console.log('Vote cast event received:', data);
      refreshNotifications();
    };

    const handleMemberAdded = (data: any) => {
      // Refresh notifications when a member is added
      console.log('Member added event received:', data);
      refreshNotifications();
    };

    const handleMemberRemoved = (data: any) => {
      // Refresh notifications when a member is removed
      console.log('Member removed event received:', data);
      refreshNotifications();
    };

    const handleMemberRoleChanged = (data: any) => {
      // Refresh notifications when a member role is changed
      console.log('Member role changed event received:', data);
      refreshNotifications();
    };

    const handleRecommendationAdded = (data: any) => {
      // Refresh notifications when a recommendation is added
      console.log('Recommendation added event received:', data);
      refreshNotifications();
    };

    // Set up event listeners
    onNotification(handleNotification);
    onNotificationCreated(handleNotificationCreated);
    onVoteCast(handleVoteCast);
    onMemberAdded(handleMemberAdded);
    onMemberRemoved(handleMemberRemoved);
    onMemberRoleChanged(handleMemberRoleChanged);
    onRecommendationAdded(handleRecommendationAdded);

    // Cleanup function to remove listeners
    return () => {
      // Note: The socket manager should handle cleanup, but we can't easily remove specific callbacks
      // The socket manager will clean up when the component unmounts
    };
  }, [user, authLoading, isAuthenticated, onNotification, onNotificationCreated, onVoteCast, onMemberAdded, onMemberRemoved, onMemberRoleChanged, onRecommendationAdded]);

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
