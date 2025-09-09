'use client';

import UserManagementSection from '../components/admin/UserManagementSection';
import SystemSettingsSection from '../components/admin/SystemSettingsSection';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !hasRole('admin')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasRole, router]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage users and configure system settings
            </p>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="space-y-6">
          <UserManagementSection />
          <SystemSettingsSection />
        </div>
      </div>
    </ProtectedRoute>
  );
}
