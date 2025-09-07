'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { User, LogOut, Settings, Shield, Crown, TestTube } from 'lucide-react';
import { getRoleColors } from '@/lib/color-utils';

const UserProfile: React.FC = () => {
  const { user, logout, isTestAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const getRoleColor = (role: string) => {
    const colors = getRoleColors(role);
    return `bg-[${colors.background}] text-[${colors.text}]`;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'member':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
        title={`${user.name} (${user.email})`}
      >
        {/* Desktop: Show full user info */}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        
        {/* Mobile: Show only icon */}
        <div className="relative sm:hidden">
          <User className="w-6 h-6 text-foreground" />
          {isTestAccount && (
            <div className="absolute -top-1 -right-1">
              <TestTube className="w-3 h-3 text-warning-600" />
            </div>
          )}
        </div>
        
        {/* Desktop: Show test account indicator separately */}
        {isTestAccount && (
          <div className="hidden sm:block" title="Test Account">
            <TestTube className="w-4 h-4 text-warning-600" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background rounded-lg shadow-lg border border-border z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span>{user.role}</span>
                  </span>
                  {isTestAccount && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                      <TestTube className="w-3 h-3" />
                      <span>Test</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
