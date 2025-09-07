'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../contexts/NotificationContext';

interface NotificationIconProps {
  className?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ className = '' }) => {
  // Try to use optimized notifications first, fallback to regular
  const { unreadCount, unreadNotifications, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    setIsDropdownOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsDropdownOpen(false);
  };

  const handleNotificationIconClick = () => {
    // Check if we're on mobile (screen width < 640px)
    if (window.innerWidth < 640) {
      // Mobile behavior
      if (window.location.pathname === '/notifications') {
        // If we're on the notifications page, go back to previous page
        router.back();
      } else {
        // Redirect to notifications page on mobile
        router.push('/notifications');
      }
    } else {
      // Desktop behavior - always show dropdown (unchanged)
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vote_cast':
        return '🗳️';
      case 'voting_completed':
        return '🏆';
      case 'recommendation_added':
        return '💡';
      case 'round_started':
        return '🚀';
      case 'round_completed':
        return '✅';
      case 'member_added':
        return '👋';
      case 'member_removed':
        return '👋';
      case 'member_role_changed':
        return '🔄';
      case 'club_updated':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        onClick={handleNotificationIconClick}
        className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - Only show on desktop */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 hidden sm:block">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No unread notifications
              </div>
            ) : (
              unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.club && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.club.name}
                        </div>
                      )}
                    </div>
                    {notification.status === 'unread' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href="/notifications"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
