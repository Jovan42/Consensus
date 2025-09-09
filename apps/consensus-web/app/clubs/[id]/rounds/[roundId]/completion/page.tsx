'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Alert } from '../../../../../components/ui/Alert';
import { useRound, useRoundRecommendations, useRoundCompletions, useUpdateCompletion, useClubMembers, useFinishRound } from '../../../../../hooks/useApi';
import { Recommendation, Completion, Member } from '../../../../../context/AppContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useSocket } from '../../../../../contexts/SocketContext';
import { useNotificationHandler } from '../../../../../hooks/useNotificationHandler';
import { CompletionProgress } from '../../../../../components/ui/CompletionProgress';
import { useOptimisticCompletion } from '../../../../../hooks/useOptimisticCompletion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle,
  Trophy,
  User,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function CompletionTracking() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const roundId = params.roundId as string;
  const { user, hasRole } = useAuth();
  const [updatingCompletion, setUpdatingCompletion] = useState<string | null>(null);
  const [isFinishingRound, setIsFinishingRound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { round, isLoading: roundLoading, mutate: mutateRound } = useRound(roundId);
  const { recommendations, isLoading: recommendationsLoading, mutate: mutateRecommendations } = useRoundRecommendations(roundId);
  const { members, isLoading: membersLoading, mutate: mutateMembers } = useClubMembers(clubId);
  const updateCompletion = useUpdateCompletion();
  const finishRound = useFinishRound();
  const { optimisticUpdateCompletion } = useOptimisticCompletion();
  
  // Connect to socket for real-time updates
  const { isConnected, joinClubs } = useSocket();
  
  // Join the club for real-time updates
  React.useEffect(() => {
    if (isConnected && clubId) {
      joinClubs([clubId]);
      console.log('🔌 Joined club for completion tracking:', clubId);
    }
  }, [isConnected, clubId, joinClubs]);

  // Get current user's member info
  const currentUserMember = members?.find((member: Member) => member.email === user?.email);

  // Get the winning recommendation
  const getWinner = () => {
    if (!recommendations || !round?.winningRecommendationId) return null;
    
    // Find the winning recommendation by ID
    return recommendations.find((rec: Recommendation) => rec.id === round.winningRecommendationId);
  };

  const winner = getWinner();
  
  // Get completion data for the round (only if there's a winning recommendation)
  const hasWinningRecommendation = !!round?.winningRecommendationId;
  const { completions, summary, isLoading: completionsLoading, mutate: mutateCompletions } = useRoundCompletions(roundId, hasWinningRecommendation);
  console.log('Round data:', { round, hasWinningRecommendation, roundId });

  // Register notification handler specifically for completion updates
  useNotificationHandler({
    component: 'CompletionTrackingPage',
    notificationTypes: ['completion_updated'],
    handler: (event) => {
      console.log('🔔 Completion tracking page received completion update:', event);
      console.log('🔔 Event data:', event.data);
      console.log('🔔 Current roundId:', roundId);
      console.log('🔔 Event roundId:', event.data?.roundId);
      
      // Only handle events for this specific round
      if (event.data?.roundId === roundId) {
        console.log('✅ Refreshing completion data for this round');
        // Only refresh completion-related data, not everything
        mutateCompletions();
      } else {
        console.log('❌ Event not for this round, ignoring');
      }
    },
    priority: 10 // High priority for completion events
  });

  // Check if current user can mark completion for a specific member
  const canMarkCompletionForMember = (member: Member) => {
    if (!user) return false;
    
    // User can always mark completion for themselves
    if (user.email === member.email) return true;
    
    // Admins can mark completion for anyone
    if (hasRole('admin')) return true;
    
    return false;
  };

  // Check if current user is marking completion for someone else (admin action)
  const isMarkingCompletionForSomeoneElse = (member: Member) => {
    if (!user) return false;
    return user.email !== member.email && hasRole('admin');
  };

  const handleToggleCompletion = async (memberId: string, recommendationId: string, isCompleted: boolean) => {
    setUpdatingCompletion(`${memberId}-${recommendationId}`);
    setError(null);

    try {
      // Use optimistic update for instant UI feedback
      await optimisticUpdateCompletion(roundId, memberId, recommendationId, !isCompleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update completion status');
    } finally {
      setUpdatingCompletion(null);
    }
  };

  const handleFinishAndStartNew = async () => {
    setIsFinishingRound(true);
    setError(null);

    try {
      // Finish the current round (this automatically starts a new round)
      const result = await finishRound(roundId);
      
      // Navigate to the new round if one was created
      if (result.nextRound && result.nextRound.id) {
        router.push(`/clubs/${clubId}/rounds/${result.nextRound.id}`);
      } else {
        // If no new round was created, go back to club page
        router.push(`/clubs/${clubId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finish round and start new one');
    } finally {
      setIsFinishingRound(false);
    }
  };

  if (roundLoading || recommendationsLoading || membersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!round) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Round Not Found</h2>
          <p className="text-muted-foreground mb-6">The round you're looking for doesn't exist.</p>
          <Link href={`/clubs/${clubId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Club</span>
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!winner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Winner Selected</h2>
          <p className="text-muted-foreground mb-6">
            This round doesn't have a winning recommendation yet.
          </p>
          <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Round
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getCompletionStatus = (memberId: string) => {
    if (!completions || !winner) return false;
    const completion = completions.find((c: Completion) => c.memberId === memberId);
    return completion ? completion.isCompleted : false;
  };

  // Use summary data if available, otherwise calculate from completions
  const completedCount = summary ? summary.completed : (completions ? completions.filter((c: Completion) => c.isCompleted).length : 0);
  const totalCount = summary ? summary.total : (members ? members.length : 0);
  const completionPercentage = summary ? Math.round(summary.percentage) : (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  // Debug logging
  console.log('Completion data:', { 
    completions, 
    summary, 
    completedCount, 
    totalCount, 
    completionPercentage,
    completionsLoading,
    hasWinningRecommendation,
    round: round?.winningRecommendationId
  });

  // Debug alert to make sure we can see the data
  if (completions && completions.length > 0) {
    console.log('COMPLETIONS FOUND:', completions);
  } else {
    console.log('NO COMPLETIONS FOUND');
  }
  
  if (summary) {
    console.log('SUMMARY FOUND:', summary);
  } else {
    console.log('NO SUMMARY FOUND');
  }

  if (!members || members.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Members Found</h2>
          <p className="text-muted-foreground mb-6">This club doesn't have any members yet.</p>
          <Link href={`/clubs/${clubId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Club</span>
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Round</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Completion Tracking</h1>
            <p className="text-muted-foreground">
              Track who has completed the winning recommendation
            </p>
          </div>
        </div>

        {/* Winner Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <Trophy className="h-8 w-8 text-warning" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {winner.title}
                </h2>
                {winner.description && (
                  <p className="text-muted-foreground mb-3">{winner.description}</p>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  Recommended by {winner.recommender?.name || 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Progress */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Completion Progress</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-lg font-medium text-foreground">
                    {completedCount} of {totalCount} members completed
                  </span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {completionPercentage}%
                </span>
              </div>
              
              <div className="w-full bg-muted-foreground/20 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Admin/Club Manager Warning */}
        {(hasRole('admin') || currentUserMember?.isClubManager) && (
          <Alert variant="warning">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {hasRole('admin') ? 'Admin Mode' : 'Club Manager Mode'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You can mark completion for any member. This is an administrative action that will be recorded in the system.
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Member Completion Status</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member: Member) => {
                const isCompleted = getCompletionStatus(member.id);
                const isUpdating = updatingCompletion === `${member.id}-${winner.id}`;
                const canMarkCompletion = canMarkCompletionForMember(member);
                const isAdminAction = isMarkingCompletionForSomeoneElse(member);

                return (
                  <div
                    key={member.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg gap-3 ${
                      canMarkCompletion ? 'bg-muted' : 'bg-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-1">
                          <p className="font-medium text-foreground truncate">{member.name}</p>
                          {isAdminAction && (
                            <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full self-start">
                              Admin Action
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        {!canMarkCompletion && (
                          <p className="text-xs text-error mt-1 line-clamp-2">
                            You can only mark completion for yourself
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {isCompleted ? 'Completed' : 'Not completed'}
                        </span>
                      </div>
                      
                      {canMarkCompletion ? (
                        <Button
                          variant={isCompleted ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleCompletion(member.id, winner.id, isCompleted)}
                          loading={isUpdating}
                        >
                          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {completionPercentage === 100 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  All Members Completed!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Everyone has completed the winning recommendation. You can now finish this round and start a new one.
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 gap-3">
                  <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <span className="hidden sm:inline">Back to Round</span>
                      <span className="sm:hidden">Back</span>
                    </Button>
                  </Link>
                  {(hasRole('admin') || (user && round?.currentRecommender && user.email === round.currentRecommender.email)) ? (
                    <Button 
                      onClick={handleFinishAndStartNew}
                      loading={isFinishingRound}
                      className="w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Start New Round</span>
                      <span className="sm:hidden">New Round</span>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Only {round?.currentRecommender?.name || 'the current recommender'} or admins can start a new round.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
