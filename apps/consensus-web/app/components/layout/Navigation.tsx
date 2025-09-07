'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import UserProfile from '../auth/UserProfile';
import { SimpleThemeToggle } from '../ThemeToggle';
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
              <span className="text-xl font-bold text-foreground">Consensus</span>
            </Link>
            
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
                    href="/theme-demo"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Theme Demo</span>
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
          </div>
          
          <div className="flex items-center space-x-4">
            <SimpleThemeToggle />
            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
