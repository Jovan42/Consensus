'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import Link from 'next/link';
import { Users, BookOpen, Calendar } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-page-background">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-background shadow-sm rounded-lg px-4 py-6 sm:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your clubs and track your reading progress.
              </p>
            </div>


            {/* Quick Actions */}
            <div className="bg-background shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href="/clubs/create-club"
                    className="relative group bg-card p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring rounded-lg border border-border hover:border-border/80 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-info-50 text-info-700 ring-4 ring-background">
                        <Users className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Create New Club
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Start a new book club or activity group.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/clubs"
                    className="relative group bg-card p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring rounded-lg border border-border hover:border-border/80 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-success-50 text-success-700 ring-4 ring-background">
                        <BookOpen className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Browse Clubs
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Join existing clubs and discover new ones.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/profile"
                    className="relative group bg-card p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring rounded-lg border border-border hover:border-border/80 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-primary/10 text-primary ring-4 ring-background">
                        <Calendar className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        View Profile
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Manage your profile and preferences.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
