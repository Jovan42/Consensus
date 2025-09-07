'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { Bell, Check, CheckCheck, Clock, Users, Trophy, Lightbulb, Settings, Trash2, ArrowLeft } from 'lucide-react';
import { useConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';

export default function NotificationsPage() {
  // Try to use optimized notifications first, fallback to regular
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    totalCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications
  } = useNotifications();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { showDialog, ConfirmationDialog } = useConfirmationDialog();

  const loadMoreNotifications = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      await fetchNotifications(nextPage, 20, true);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchNotifications]);

  // Load initial notifications
  useEffect(() => {
    refreshNotifications();
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreNotifications();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMoreNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    showDialog({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => deleteNotification(notificationId)
    });
  };

  const handleDeleteAllRead = async () => {
    const readCount = notifications.filter(n => n.status === 'read').length;
    if (readCount === 0) {
      showDialog({
        title: 'No Read Notifications',
        message: 'There are no read notifications to delete.',
        confirmText: 'OK',
        type: 'info',
        onConfirm: () => {}
      });
      return;
    }
    
    showDialog({
      title: 'Delete All Read Notifications',
      message: `Are you sure you want to delete all ${readCount} read notifications? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => deleteAllRead()
    });
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return notification.status === 'unread';
    if (selectedFilter === 'read') return notification.status === 'read';
    return notification.type === selectedFilter;
  });

  // Get unique notification types for filter options
  const notificationTypes = Array.from(new Set(notifications.map(n => n.type)));

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vote_cast':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'voting_completed':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'recommendation_added':
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      case 'round_started':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'round_completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'member_added':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'member_removed':
        return <Users className="h-5 w-5 text-red-500" />;
      case 'member_role_changed':
        return <Settings className="h-5 w-5 text-orange-500" />;
      case 'club_updated':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'vote_cast':
        return 'Vote Cast';
      case 'voting_completed':
        return 'Voting Completed';
      case 'recommendation_added':
        return 'Recommendation Added';
      case 'round_started':
        return 'Round Started';
      case 'round_completed':
        return 'Round Completed';
      case 'member_added':
        return 'Member Added';
      case 'member_removed':
        return 'Member Removed';
      case 'member_role_changed':
        return 'Role Changed';
      case 'club_updated':
        return 'Club Updated';
      default:
        return 'Notification';
    }
  };


  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {notifications.filter(n => n.status === 'read').length > 0 && (
              <Button
                onClick={handleDeleteAllRead}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete all read</span>
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mark all as read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Unread ({notifications.filter(n => n.status === 'unread').length})
            </button>
            <button
              onClick={() => handleFilterChange('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Read ({notifications.filter(n => n.status === 'read').length})
            </button>
            {notificationTypes.map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getNotificationTypeLabel(type)} ({notifications.filter(n => n.type === type).length})
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedFilter === 'all' ? 'No notifications yet' : `No ${selectedFilter} notifications`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedFilter === 'all' 
                ? "You'll see notifications here when club members take actions."
                : `No notifications match the "${selectedFilter}" filter.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 ${
                  notification.status === 'unread'
                    ? 'border-blue-200 dark:border-blue-800 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {notification.club && (
                          <span>in {notification.club.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll trigger */}
        {hasMore && filteredNotifications.length > 0 && selectedFilter === 'all' && (
          <div ref={loadMoreRef} className="text-center mt-8 py-4">
            {isLoadingMore ? (
              <div className="text-gray-500 dark:text-gray-400">Loading more notifications...</div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500">Scroll down to load more</div>
            )}
          </div>
        )}

        {/* End of notifications */}
        {!hasMore && filteredNotifications.length > 0 && selectedFilter === 'all' && (
          <div className="text-center mt-8 py-4 text-gray-500 dark:text-gray-400">
            You've reached the end of your notifications
          </div>
        )}
      </div>
      
      {/* Custom Confirmation Dialog */}
      <ConfirmationDialog />
    </Layout>
  );
}
