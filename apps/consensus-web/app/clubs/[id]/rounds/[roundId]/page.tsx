'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '../../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Alert } from '../../../../components/ui/Alert';
import { useRound, useRoundRecommendations, useRoundVotes, useUpdateRoundStatus, useCloseVoting, useRoundCompletions, useClubMembers } from '../../../../hooks/useApi';
import { Recommendation, Vote, Completion, Member } from '../../../../context/AppContext';
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

  const { round, isLoading: roundLoading, error: roundError, mutate: mutateRound } = useRound(roundId);
  const { recommendations, isLoading: recommendationsLoading } = useRoundRecommendations(roundId);
  const { votes, isLoading: votesLoading } = useRoundVotes(roundId);
  const { completions } = useRoundCompletions(roundId, !!round?.winningRecommendationId);
  const { members } = useClubMembers(clubId);
  const updateRoundStatus = useUpdateRoundStatus();
  const closeVoting = useCloseVoting();

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

    const completedCount = completions.filter((c: Completion) => 
      c.isCompleted && c.recommendationId === winner.recommendation.id
    ).length;
    
    const totalCount = members.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Find members who haven't completed
    const completedMemberIds = completions
      .filter((c: Completion) => c.isCompleted && c.recommendationId === winner.recommendation.id)
      .map((c: Completion) => c.memberId);
    
    const missingMembers = members.filter((member: Member) => 
      !completedMemberIds.includes(member.id)
    );

    return { completed: completedCount, total: totalCount, percentage, missingMembers };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommending': return 'bg-blue-100 text-blue-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (roundError || !round) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Round Not Found</h2>
          <p className="text-gray-600 mb-6">The round you're looking for doesn't exist.</p>
          <Link href={`/clubs/${clubId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Club
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/clubs/${clubId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Club
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Round Details</h1>
              <p className="text-gray-600">
                Started {new Date(round.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recommender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {round.currentRecommender?.name || 'Unknown'}
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
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendationsLoading ? '...' : recommendations?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Votes</p>
                  <p className="text-2xl font-bold text-gray-900">
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
              {round.status === 'recommending' && (
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
                        isWinner ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {rec.title}
                            </h3>
                            {isWinner && (
                              <div className="flex items-center text-yellow-600">
                                <Trophy className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">Winner</span>
                              </div>
                            )}
                          </div>
                          
                          {rec.description && (
                            <p className="text-gray-600 mb-3">{rec.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                  <div className="pt-4 border-t border-gray-200">
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
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600 mb-4">
                  {round.currentRecommender?.name || 'The recommender'} hasn't added any recommendations yet.
                </p>
                {round.status === 'recommending' && (
                  <Link href={`/clubs/${clubId}/rounds/${roundId}/recommendations`}>
                    <Button>
                      Add Recommendations
                    </Button>
                  </Link>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to start voting?
                </h3>
                <p className="text-gray-600 mb-4">
                  All recommendations have been added. You can now start the voting phase.
                </p>
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
              </div>
            </CardContent>
          </Card>
        )}

        {round.status === 'voting' && votes && votes.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Voting in progress
                </h3>
                <p className="text-gray-600 mb-4">
                  {votes.length} vote(s) have been cast. Continue voting or close the round when ready.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href={`/clubs/${clubId}/rounds/${roundId}/voting`}>
                    <Button variant="outline">
                      Continue Voting
                    </Button>
                  </Link>
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
                  <Trophy className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Voting Complete!
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>{winner.recommendation.title}</strong> won with {winner.totalPoints} points.
                  <br />
                  Now everyone can track their completion of this item.
                </p>
                
                {/* Completion Progress Summary */}
                {(() => {
                  const progress = getCompletionProgress();
                  return (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                        <span className="text-sm text-gray-600">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {progress.completed} of {progress.total} members completed
                      </p>
                      
                      {/* Show missing members if 3 or fewer */}
                      {progress.missingMembers.length > 0 && progress.missingMembers.length <= 3 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Still waiting for:</p>
                          <div className="space-y-1">
                            {progress.missingMembers.map((member: Member) => (
                              <div key={member.id} className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{member.name}</span>
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
      </div>
    </Layout>
  );
}
