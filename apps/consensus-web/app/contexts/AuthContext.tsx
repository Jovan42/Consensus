'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { getTestAccount, isTestAccount as checkIsTestAccount } from '@/lib/auth0';

export interface User {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'member';
  isTestAccount?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTestAccount: boolean;
  login: () => void;
  logout: () => void;
  testLogin: (email: string) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: auth0User, isLoading } = useUser();
  const [testUser, setTestUser] = useState<User | null>(null);

  // Check for test user or Auth0 user in localStorage on mount
  useEffect(() => {
    const storedTestUser = localStorage.getItem('testUser');
    const storedAuth0User = localStorage.getItem('auth0User');
    
    if (storedTestUser) {
      try {
        const parsedUser = JSON.parse(storedTestUser);
        setTestUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('testUser');
      }
    } else if (storedAuth0User) {
      try {
        const parsedUser = JSON.parse(storedAuth0User);
        setTestUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('auth0User');
      }
    }
  }, []);

  const user = testUser || auth0User;
  const isAuthenticated = !!user;
  const isTestAccount = !!testUser;

  const login = () => {
    // Redirect to Auth0 login
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    if (isTestAccount) {
      setTestUser(null);
      localStorage.removeItem('testUser');
      localStorage.removeItem('auth0User');
      window.location.href = '/';
    } else {
      // Auth0 logout
      window.location.href = '/api/auth/logout';
    }
  };

  const testLogin = async (email: string): Promise<boolean> => {
    if (!checkIsTestAccount(email)) {
      return false;
    }

    const testAccount = getTestAccount(email);
    if (testAccount) {
      const userData: User = {
        sub: testAccount.sub,
        email: testAccount.email,
        name: testAccount.name,
        picture: testAccount.picture,
        role: testAccount.role as 'admin' | 'member',
        isTestAccount: true
      };
      setTestUser(userData);
      localStorage.setItem('testUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user: user as User | null,
    isLoading,
    isAuthenticated,
    isTestAccount,
    login,
    logout,
    testLogin,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
