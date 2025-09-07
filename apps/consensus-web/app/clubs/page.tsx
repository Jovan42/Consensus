'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useClubs } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { Club } from '../context/AppContext';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Film, 
  Gamepad2,
  Plus,
  Calendar,
  User,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

const getClubTypeIcon = (type: string) => {
  switch (type) {
    case 'book':
      return <BookOpen className="h-5 w-5" />;
    case 'movie':
      return <Film className="h-5 w-5" />;
    case 'game':
      return <Gamepad2 className="h-5 w-5" />;
    default:
      return <Users className="h-5 w-5" />;
  }
};

const getClubTypeColor = (type: string) => {
  switch (type) {
    case 'book':
      return 'text-info-600 bg-info-50';
    case 'movie':
      return 'text-error-600 bg-error-50';
    case 'game':
      return 'text-success-600 bg-success-50';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export default function ClubsPage() {
  const { clubs, isLoading, error } = useClubs();
  const { user, hasRole } = useAuth();
  const [showOnlyMyClubs, setShowOnlyMyClubs] = useState(false);

  // Check if user is admin (only admins need the filter since they can see all clubs)
  const isAdmin = hasRole('admin');

  // Filter clubs based on user's membership (only for admins)
  const filteredClubs = useMemo(() => {
    if (!clubs || !user) return clubs || [];
    
    // Only apply frontend filtering for admins (since regular users already get filtered data from backend)
    if (isAdmin && showOnlyMyClubs) {
      return clubs.filter((club: any) => 
        club.members?.some((member: any) => member.email === user.email)
      );
    }
    
    return clubs;
  }, [clubs, user, showOnlyMyClubs, isAdmin]);

  // Calculate stats for filtered clubs
  const stats = useMemo(() => {
    const total = filteredClubs?.length || 0;
    const bookClubs = filteredClubs?.filter((club: Club) => club.type === 'book').length || 0;
    const movieClubs = filteredClubs?.filter((club: Club) => club.type === 'movie').length || 0;
    
    return { total, bookClubs, movieClubs };
  }, [filteredClubs]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Clubs</h2>
          <p className="text-muted-foreground mb-6">There was an error loading the clubs. Please try again.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isAdmin && showOnlyMyClubs ? 'My Clubs' : 'Browse Clubs'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdmin && showOnlyMyClubs 
                ? 'View clubs you are a member of'
                : isAdmin 
                  ? 'View all clubs or filter to see only your clubs'
                  : 'View clubs you are a member of'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Filter Toggle - Only show for admins */}
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setShowOnlyMyClubs(!showOnlyMyClubs)}
                className="flex items-center space-x-2"
              >
                {showOnlyMyClubs ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Show All</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>My Clubs</span>
                  </>
                )}
              </Button>
            )}
            
            <Link href="/clubs/create-club">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Club
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Clubs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Book Clubs</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.bookClubs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Film className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Movie Clubs</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.movieClubs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clubs Grid */}
        {filteredClubs && filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club: any) => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getClubTypeColor(club.type)}`}>
                        {getClubTypeIcon(club.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-foreground">{club.name}</h3>
                          {user && club.members?.some((member: any) => member.email === user.email) && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Member
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{club.type} Club</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{club.members?.length || 0} members</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created {new Date(club.createdAt).toLocaleDateString()}</span>
                    </div>

                    {club.config && (
                      <div className="text-sm text-muted-foreground">
                        <p>Min: {club.config.minRecommendations} recs</p>
                        <p>Max: {club.config.maxRecommendations} recs</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href={`/clubs/${club.id}`}>
                      <Button className="w-full">
                        View Club
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {isAdmin && showOnlyMyClubs ? 'No Clubs Found' : 'No Clubs Available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isAdmin && showOnlyMyClubs 
                  ? "You're not a member of any clubs yet. Join a club or create your own!"
                  : isAdmin
                    ? "There are no clubs available at the moment. Be the first to create one!"
                    : "You're not a member of any clubs yet. Create your own club to get started!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isAdmin && showOnlyMyClubs && (
                  <Button
                    variant="outline"
                    onClick={() => setShowOnlyMyClubs(false)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Browse All Clubs
                  </Button>
                )}
                <Link href="/clubs/create-club">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {isAdmin && showOnlyMyClubs ? 'Create Club' : 'Create First Club'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
