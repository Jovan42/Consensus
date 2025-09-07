'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useClub, useClubMembers, useClubRounds, useStartRound } from '../../hooks/useApi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Member } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Users, 
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
  const { user, hasRole } = useAuth();
  const [isStartingRound, setIsStartingRound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { club, isLoading: clubLoading, error: clubError } = useClub(clubId);
  const { members, isLoading: membersLoading } = useClubMembers(clubId);
  const { rounds, isLoading: roundsLoading } = useClubRounds(clubId);
  const startRound = useStartRound();

  // Get current user's member info
  const currentUserMember = members?.find((member: Member) => member.email === user?.email);

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (clubError || !club) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Club Not Found</h2>
          <p className="text-muted-foreground mb-6">The club you're looking for doesn't exist or has been deleted.</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{club.name}</h1>
              <p className="text-muted-foreground capitalize">{club.type} club</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Members button - visible to all members */}
            <Link href={`/clubs/${clubId}/members`}>
              <Button variant="outline">
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {hasRole('admin') || currentUserMember?.isClubManager ? 'Manage Members' : 'View Members'}
                </span>
              </Button>
            </Link>
            
            {/* Settings button - only for managers and admins */}
            {(hasRole('admin') || currentUserMember?.isClubManager) && (
              <Link href={`/clubs/${clubId}/settings`}>
                <Button variant="outline">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
            )}
          </div>
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
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold text-foreground">
                    {membersLoading ? '...' : members?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Rounds</p>
                  <p className="text-2xl font-bold text-foreground">
                    {roundsLoading ? '...' : rounds?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-warning" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">
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
                  currentRound.status === 'recommending' ? 'bg-primary/10 text-primary' :
                  currentRound.status === 'voting' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  {currentRound.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
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
                    (user?.email === currentRound.currentRecommender?.email || 
                     hasRole('admin') || 
                     currentUserMember?.isClubManager) && (
                      <Link href={`/clubs/${clubId}/rounds/${currentRound.id}/recommendations`}>
                        <Button variant="outline">
                          Add Recommendations
                        </Button>
                      </Link>
                    )
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
                <p className="text-muted-foreground">
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
                  <div key={round.id} className="p-4 bg-muted rounded-lg border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1">
                            <p className="font-medium text-foreground truncate">
                              Round by {round.currentRecommender?.name || 'Unknown'}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success self-start">
                              Completed
                            </span>
                          </div>
                          
                          {round.winningRecommendation ? (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-foreground mb-1 truncate">
                                🏆 Winner: {round.winningRecommendation.title}
                              </p>
                              {round.winningRecommendation.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {round.winningRecommendation.description}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mb-2">
                              No winner selected
                            </p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-muted-foreground gap-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              {new Date(round.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline">Finished </span>{new Date(round.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 sm:ml-4">
                        <Link href={`/clubs/${clubId}/rounds/${round.id}`}>
                          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
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
