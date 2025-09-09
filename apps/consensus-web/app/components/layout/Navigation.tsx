'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import UserProfile from '../auth/UserProfile';
import { SimpleThemeToggle } from '../ThemeToggle';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { SoundToggle } from '../notifications/SoundToggle';
import { RealtimeStatus } from '../ui/RealtimeStatus';
import { Home, Users, BookOpen, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();

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
            </div>

            {/* Mobile Navigation - Icon Only */}
            <div className="flex md:hidden items-center space-x-3">
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
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Socket Connection & Notifications Group */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <RealtimeStatus showText={false} showForAdminsOnly={false} />
              <SoundToggle />
              <NotificationIcon />
            </div>
            <SimpleThemeToggle />
            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
