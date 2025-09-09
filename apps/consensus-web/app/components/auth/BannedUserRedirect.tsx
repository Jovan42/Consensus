'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { useAuth } from '@/app/contexts/AuthContext';
import { Alert, AlertDescription } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { Loader2, AlertTriangle, User } from 'lucide-react';

interface BannedUserRedirectProps {
  children: React.ReactNode;
}

export default function BannedUserRedirect({ children }: BannedUserRedirectProps) {
  const { user, isAuthenticated } = useAuth();
  const { currentUser, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && currentUser && currentUser.banned) {
      // Only redirect if not already on profile page
      if (window.location.pathname !== '/profile') {
        router.push('/profile');
      }
    }
  }, [isAuthenticated, user, currentUser, router]);

  // Show loading while fetching user data
  if (isAuthenticated && user && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading user data...</span>
        </div>
      </div>
    );
  }

  // Don't show the full-screen ban message if user is on profile page
  // Let the profile page handle the ban display

  // Show normal content for non-banned users or when not on profile page
  return <>{children}</>;
}
