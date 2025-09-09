'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { useNotifications } from '@/app/contexts/NotificationContext';
import UserProfile from '../auth/UserProfile';
import { SimpleThemeToggle } from '../ThemeToggle';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { SoundToggle } from '../notifications/SoundToggle';
import { RealtimeStatus } from '../ui/RealtimeStatus';
import { Home, Users, BookOpen, Settings, AlertTriangle } from 'lucide-react';

const Navigation: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const { currentUser, mutate: refreshCurrentUser } = useCurrentUser();
  const { notifications } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const isBanned = currentUser?.banned || false;

  // Refresh user data when ban/unban notifications are received
  useEffect(() => {
    console.log('Navigation: notifications changed:', notifications);
    
    const hasBanNotification = notifications.some(notification => {
      console.log('Navigation: checking notification type:', notification.type);
      return notification.type === 'user_banned' || notification.type === 'user_unbanned';
    });
    
    if (hasBanNotification) {
      console.log('Navigation: Ban notification detected, refreshing user data');
      refreshCurrentUser(); // Refresh user data
    }
  }, [notifications, refreshCurrentUser]);

  // Redirect banned users to profile page if they try to access other pages
  useEffect(() => {
    if (isAuthenticated && currentUser && isBanned) {
      // Only redirect if not already on profile page
      if (pathname !== '/profile') {
        router.push('/profile');
      }
    }
  }, [isAuthenticated, currentUser, isBanned, pathname, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground hidden sm:block">Consensus</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isBanned ? (
                // Banned user navigation - only profile link
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Account Restricted</span>
                </div>
              ) : (
                // Normal navigation
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/clubs"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Clubs</span>
                  </Link>
                  
                  {hasRole('admin') && (
                    <>
                      <Link
                        href="/demo"
                        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Demo</span>
                      </Link>
                      
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Navigation - Icon Only */}
            <div className="flex md:hidden items-center space-x-3">
              {isBanned ? (
                // Banned user mobile navigation - show restriction indicator
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              ) : (
                // Normal mobile navigation
                <>
                  <Link
                    href="/dashboard"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Dashboard"
                  >
                    <Home className="w-5 h-5" />
                  </Link>
                  
                  <Link
                    href="/clubs"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Clubs"
                  >
                    <Users className="w-5 h-5" />
                  </Link>
                  
                  {hasRole('admin') && (
                    <>
                      <Link
                        href="/admin"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Admin"
                      >
                        <Settings className="w-5 h-5" />
                      </Link>
                      
                      <Link
                        href="/demo"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Demo"
                      >
                        <Settings className="w-5 h-5" />
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Socket Connection & Notifications Group - disabled for banned users */}
            {!isBanned && (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <RealtimeStatus showText={false} showForAdminsOnly={false} />
                <SoundToggle />
                <NotificationIcon />
              </div>
            )}
            <SimpleThemeToggle />
            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
