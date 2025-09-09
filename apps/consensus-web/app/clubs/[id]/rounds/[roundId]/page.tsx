'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '../../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Alert } from '../../../../components/ui/Alert';
import { useRound, useRoundRecommendations, useRoundVotes, useUpdateRoundStatus, useCloseVoting, useRoundCompletions, useClubMembers } from '../../../../hooks/useApi';
import { NotesSection } from '../../../../components/ui/NotesSection';
import { Recommendation, Vote, Completion, Member } from '../../../../context/AppContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRealtimeUpdates } from '../../../../hooks/useRealtimeUpdates';
import { useNotificationHandler } from '../../../../hooks/useNotificationHandler';
import { 
  ArrowLeft, 
  User, 
  Calendar,
  Trophy,
  CheckCircle,
  Clock,
  Users,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function RoundDetail() {
  const params = useParams();
  const clubId = params.id as string;
  const roundId = params.roundId as string;
  const { user, hasRole } = useAuth();
  
  // Enable real-time updates for this page
  useRealtimeUpdates({ clubId, roundId });

  const { round, isLoading: roundLoading, error: roundError, mutate: mutateRound } = useRound(roundId);
  const { recommendations, isLoading: recommendationsLoading, mutate: mutateRecommendations } = useRoundRecommendations(roundId);
  const { votes, isLoading: votesLoading, mutate: mutateVotes } = useRoundVotes(roundId);
  const hasWinningRecommendation = !!round?.winningRecommendationId;
  const { completions } = useRoundCompletions(roundId, hasWinningRecommendation);
  const { members } = useClubMembers(clubId);
  
  const updateRoundStatus = useUpdateRoundStatus();
  const closeVoting = useCloseVoting();

  // Register notification handler for voting events
  useNotificationHandler({
    component: 'RoundDetailsPage',
    notificationTypes: ['round_status_changed', 'notification_created'],
    handler: (event) => {
      console.log('Round details page received notification:', event);
      
      // Only handle events for this specific round
      if (event.data.roundId === roundId) {
        switch (event.type) {
          case 'round_status_changed':
            console.log('Round status changed, refreshing round data');
            // Refresh round data to show updated status
            mutateRound();
            mutateRecommendations();
            mutateVotes();
            break;
          case 'notification_created':
            // Check if this is a voting-related notification
            if (event.data.type === 'VOTING_STARTED') {
              console.log('Voting started notification received, refreshing round data');
              // Refresh round data to show voting state
              mutateRound();
              mutateRecommendations();
              mutateVotes();
            }
            break;
        }
      }
    },
    priority: 10 // High priority for round-related events
  });

  // Check if current user is the recommender
  const isCurrentRecommender = user && round?.currentRecommender && 
    user.email === round.currentRecommender.email;

  // Check if current user is a member of the club
  const currentUserMember = members?.find((member: Member) => member.email === user?.email);
  const isMember = !!currentUserMember || hasRole('admin');

  // Check if current user can add recommendations (recommender or admin)
  const canAddRecommendations = isCurrentRecommender || hasRole('admin');

  const getWinner = () => {
    if (!recommendations || !votes || recommendations.length === 0) return null;
    
    const voteCounts = recommendations.map((rec: Recommendation) => {
      const recVotes = votes.filter((vote: Vote) => vote.recommendationId === rec.id);
      const totalPoints = recVotes.reduce((sum: number, vote: Vote) => sum + vote.points, 0);
      return { recommendation: rec, totalPoints };
    });

    if (voteCounts.length === 0) return null;

    return voteCounts.reduce((winner: any, current: any) =>
      current.totalPoints > winner.totalPoints ? current : winner
    );
  };

  const getCompletionProgress = () => {
    if (!completions || !members || !winner) {
      return { completed: 0, total: 0, percentage: 0, missingMembers: [] };
    }

    // The completions array from the API contains completion status for the winning recommendation
    // Each completion object has: memberId, memberName, isCompleted, completedAt
    const completedCount = completions.filter((c: any) => c.isCompleted).length;
    
    const totalCount = members.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Find members who haven't completed
    const completedMemberIds = completions
      .filter((c: any) => c.isCompleted)
      .map((c: any) => c.memberId);
    
    const missingMembers = members.filter((member: Member) => 
      !completedMemberIds.includes(member.id)
    );

    return { completed: completedCount, total: totalCount, percentage, missingMembers };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommending': return 'bg-primary/10 text-primary';
      case 'voting': return 'bg-warning/10 text-warning';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-muted text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recommending': return Clock;
      case 'voting': return Users;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  if (roundLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (roundError || !round) {
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

  const StatusIcon = getStatusIcon(round.status);
  const winner = getWinner();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href={`/clubs/${clubId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Club</span>
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Round Details</h1>
              <p className="text-muted-foreground">
                Started {new Date(round.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <StatusIcon className="h-5 w-5" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(round.status)}`}>
              {round.status}
            </span>
          </div>
        </div>

        {/* Round Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Recommender</p>
                  <p className="text-lg font-semibold text-foreground">
                    {round.currentRecommender?.name || 'Unknown'}
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
                  <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                  <p className="text-2xl font-bold text-foreground">
                    {recommendationsLoading ? '...' : recommendations?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Votes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {votesLoading ? '...' : votes?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recommendations</h2>
              {round.status === 'recommending' && canAddRecommendations && (
                <Link href={`/clubs/${clubId}/rounds/${roundId}/recommendations`}>
                  <Button variant="outline">
                    Add Recommendations
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec: Recommendation, index: number) => {
                  const recVotes = votes?.filter((vote: Vote) => vote.recommendationId === rec.id) || [];
                  const totalPoints = recVotes.reduce((sum: number, vote: Vote) => sum + vote.points, 0);
                  const isWinner = winner && winner.recommendation.id === rec.id;

                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-lg border-2 ${
                        isWinner ? 'border-warning bg-warning/10' : 'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`text-lg font-semibold ${isWinner ? 'text-foreground' : 'text-foreground'}`}>
                              {rec.title}
                            </h3>
                            {isWinner && (
                              <div className="flex items-center text-warning">
                                <Trophy className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">Winner</span>
                              </div>
                            )}
                          </div>
                          
                          {rec.description && (
                            <p className={`mb-3 ${isWinner ? 'text-foreground' : 'text-muted-foreground'}`}>{rec.description}</p>
                          )}
                          
                          <div className={`flex items-center space-x-4 text-sm ${isWinner ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                            <span>By {rec.recommender?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{totalPoints} points</span>
                            <span>•</span>
                            <span>{recVotes.length} votes</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  );
                })}
                
                {/* Single Vote Button */}
                {round.status === 'voting' && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-center">
                      <Link href={`/clubs/${clubId}/rounds/${roundId}/voting`}>
                        <Button>
                          <Users className="h-4 w-4 mr-2" />
                          Vote on Recommendations
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  {round.currentRecommender?.name || 'The recommender'} hasn't added any recommendations yet.
                </p>
                {round.status === 'recommending' && canAddRecommendations && (
                  <Link href={`/clubs/${clubId}/rounds/${roundId}/recommendations`}>
                    <Button>
                      Add Recommendations
                    </Button>
                  </Link>
                )}
                {round.status === 'recommending' && !canAddRecommendations && (
                  <div className="text-sm text-muted-foreground">
                    Only {round.currentRecommender?.name || 'the current recommender'} can add recommendations.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {round.status === 'recommending' && recommendations && recommendations.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Ready to start voting?
                </h3>
                <p className="text-muted-foreground mb-4">
                  All recommendations have been added. You can now start the voting phase.
                </p>
                {(hasRole('admin') || isCurrentRecommender) ? (
                  <Button
                    onClick={async () => {
                      try {
                        await updateRoundStatus(roundId, 'voting');
                        // Refresh round data to show updated status
                        await mutateRound();
                      } catch (error) {
                        console.error('Failed to update round status:', error);
                      }
                    }}
                  >
                    Start Voting
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only {round.currentRecommender?.name || 'the current recommender'} or admins can start voting.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {round.status === 'voting' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Voting in progress
                </h3>
                <p className="text-muted-foreground mb-4">
                  {votes && votes.length > 0 
                    ? `${votes.length} vote(s) have been cast. Continue voting or close the round when ready.`
                    : 'Voting is now open. Members can cast their votes.'
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href={`/clubs/${clubId}/rounds/${roundId}/voting`}>
                    <Button variant="outline">
                      {votes && votes.length > 0 ? 'Continue Voting' : 'Start Voting'}
                    </Button>
                  </Link>
                  {(hasRole('admin') || isCurrentRecommender) && (
                    <Button
                      onClick={async () => {
                        try {
                          await closeVoting(roundId);
                          // Refresh round data to show the new status
                          await mutateRound();
                        } catch (error) {
                          console.error('Failed to close voting:', error);
                        }
                      }}
                    >
                      Close Voting
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {round.status === 'completing' && winner && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-12 w-12 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Voting Complete!
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>{winner.recommendation.title}</strong> won with {winner.totalPoints} points.
                  <br />
                  Now everyone can track their completion of this item.
                </p>
                
                {/* Completion Progress Summary */}
                {(() => {
                  const progress = getCompletionProgress();
                  return (
                    <div className="mb-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Completion Progress</span>
                        <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted-foreground/20 rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {progress.completed} of {progress.total} members completed
                      </p>
                      
                      
                      {/* Show missing members if 3 or fewer */}
                      {progress.missingMembers.length > 0 && progress.missingMembers.length <= 3 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm font-medium text-foreground mb-2">Still waiting for:</p>
                          <div className="space-y-1">
                            {progress.missingMembers.map((member: Member) => (
                              <div key={member.id} className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                <Link href={`/clubs/${clubId}/rounds/${roundId}/completion`}>
                  <Button>
                    Track Completion
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Private Notes Section */}
        {isMember && (
          <Card>
            <CardContent className="p-6">
              <NotesSection
                roundId={roundId}
                roundTitle={round?.title || 'Round'}
                isMember={isMember}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
