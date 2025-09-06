'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useClub, useClubMembers, useClubRounds, useStartRound } from '../../hooks/useApi';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Play, 
  Settings, 
  Calendar,
  Trophy,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function ClubDetail() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const { setCurrentClub } = useApp();
  const [isStartingRound, setIsStartingRound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { club, isLoading: clubLoading, error: clubError } = useClub(clubId);
  const { members, isLoading: membersLoading } = useClubMembers(clubId);
  const { rounds, isLoading: roundsLoading } = useClubRounds(clubId);
  const startRound = useStartRound();

  React.useEffect(() => {
    if (club) {
      setCurrentClub(club);
    }
  }, [club, setCurrentClub]);

  const handleStartRound = async () => {
    if (!members || members.length === 0) {
      setError('You need at least one member to start a round');
      return;
    }

    setIsStartingRound(true);
    setError(null);

    try {
      // For now, use the first member as the recommender
      // In a real app, you'd have logic to determine the next recommender
      const firstMember = members[0];
      const newRound = await startRound(clubId, firstMember.id);
      router.push(`/clubs/${clubId}/rounds/${newRound.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start round');
    } finally {
      setIsStartingRound(false);
    }
  };

  const getCurrentRound = () => {
    return rounds?.find((round: any) => round.status !== 'finished');
  };

  const getCompletedRounds = () => {
    return rounds?.filter((round: any) => round.status === 'finished') || [];
  };

  if (clubLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (clubError || !club) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h2>
          <p className="text-gray-600 mb-6">The club you're looking for doesn't exist or has been deleted.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const currentRound = getCurrentRound();
  const completedRounds = getCompletedRounds();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
              <p className="text-gray-600 capitalize">{club.type} club</p>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {membersLoading ? '...' : members?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rounds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roundsLoading ? '...' : rounds?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roundsLoading ? '...' : completedRounds.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Round */}
        {currentRound ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Current Round</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentRound.status === 'recommending' ? 'bg-blue-100 text-blue-800' :
                  currentRound.status === 'voting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentRound.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  Current recommender: {currentRound.currentRecommender?.name || 'Unknown'}
                </div>
                
                <div className="flex space-x-4">
                  <Link href={`/clubs/${clubId}/rounds/${currentRound.id}`}>
                    <Button>
                      View Round
                    </Button>
                  </Link>
                  
                  {currentRound.status === 'recommending' && (
                    <Link href={`/clubs/${clubId}/rounds/${currentRound.id}/recommendations`}>
                      <Button variant="outline">
                        Add Recommendations
                      </Button>
                    </Link>
                  )}
                  
                  {currentRound.status === 'voting' && (
                    <Link href={`/clubs/${clubId}/rounds/${currentRound.id}/voting`}>
                      <Button variant="outline">
                        Vote Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Start New Round</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  {members && members.length > 0 
                    ? 'Ready to start a new round? The first member will be the recommender.'
                    : 'Add at least one member to start a round.'
                  }
                </p>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleStartRound}
                    loading={isStartingRound}
                    disabled={!members || members.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start New Round
                  </Button>
                  
                  <Link href={`/clubs/${clubId}/members`}>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Rounds */}
        {completedRounds.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Rounds</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedRounds.slice(0, 5).map((round: any) => (
                  <div key={round.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">
                              Round by {round.currentRecommender?.name || 'Unknown'}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </div>
                          
                          {round.winningRecommendation ? (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                🏆 Winner: {round.winningRecommendation.title}
                              </p>
                              {round.winningRecommendation.description && (
                                <p className="text-sm text-gray-600 truncate">
                                  {round.winningRecommendation.description}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-2">
                              No winner selected
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(round.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Finished {new Date(round.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        <Link href={`/clubs/${clubId}/rounds/${round.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
