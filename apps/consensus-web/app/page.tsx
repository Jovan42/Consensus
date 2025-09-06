'use client';

import React from 'react';
import { Layout } from './components/layout/Layout';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { useClubs } from './hooks/useApi';
import { useApp } from './context/AppContext';
import { Plus, Users, BookOpen, Film, Utensils, MapPin, Gamepad2, GraduationCap, Calendar, Mic, Tv, Music, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const clubTypeIcons = {
  book: BookOpen,
  movie: Film,
  restaurant: Utensils,
  travel: MapPin,
  gaming: Gamepad2,
  learning: GraduationCap,
  event: Calendar,
  podcast: Mic,
  tv: Tv,
  music: Music,
  other: MoreHorizontal,
};

export default function Home() {
  const { clubs, isLoading, error } = useClubs();
  const { setCurrentClub } = useApp();

  // Clear current club when on dashboard
  React.useEffect(() => {
    setCurrentClub(null);
  }, [setCurrentClub]);

  const handleClubSelect = (club: any) => {
    setCurrentClub(club);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Clubs</h2>
          <p className="text-gray-600 mb-6">There was an error loading your clubs. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Clubs</h1>
            <p className="mt-2 text-gray-600">
              Manage your book clubs, movie nights, and other group activities
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/clubs/create">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create New Club
              </Button>
            </Link>
          </div>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first club to organize group activities
              </p>
              <Link href="/clubs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Club
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club: any) => {
              const IconComponent = clubTypeIcons[club.type as keyof typeof clubTypeIcons] || MoreHorizontal;
              
              return (
                <Card key={club.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {club.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {club.type} club
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {club.members?.length || 0} members
                      </div>

                      <div className="pt-3">
                        <Link href={`/clubs/${club.id}`}>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleClubSelect(club)}
                          >
                            View Club
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}