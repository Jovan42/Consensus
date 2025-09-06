'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Alert } from '../../../../../components/ui/Alert';
import { useRound, useRoundRecommendations, useRoundCompletions, useUpdateCompletion, useClubMembers, useFinishRound } from '../../../../../hooks/useApi';
import { Recommendation } from '../../../../../context/AppContext';
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
  const [updatingCompletion, setUpdatingCompletion] = useState<string | null>(null);
  const [isFinishingRound, setIsFinishingRound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { round, isLoading: roundLoading } = useRound(roundId);
  const { recommendations, isLoading: recommendationsLoading } = useRoundRecommendations(roundId);
  const { members, isLoading: membersLoading } = useClubMembers(clubId);
  const updateCompletion = useUpdateCompletion();
  const finishRound = useFinishRound();

  // Get the winning recommendation
  const getWinner = () => {
    if (!recommendations || !round?.winningRecommendationId) return null;
    
    // Find the winning recommendation by ID
    return recommendations.find((rec: Recommendation) => rec.id === round.winningRecommendationId);
  };

  const winner = getWinner();
  
  // Get completion data for the round (only if there's a winning recommendation)
  const { completions, summary, isLoading: completionsLoading, mutate: mutateCompletions } = useRoundCompletions(roundId, !!round?.winningRecommendationId);

  const handleToggleCompletion = async (memberId: string, recommendationId: string, isCompleted: boolean) => {
    setUpdatingCompletion(`${memberId}-${recommendationId}`);
    setError(null);

    try {
      await updateCompletion(roundId, memberId, recommendationId, !isCompleted);
      // Refresh completion data to show updated status
      await mutateCompletions();
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!round) {
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

  if (!winner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Winner Selected</h2>
          <p className="text-gray-600 mb-6">
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
    const completion = completions.find(c => c.memberId === memberId);
    return completion ? completion.isCompleted : false;
  };

  // Use summary data if available, otherwise calculate from completions
  const completedCount = summary ? summary.completed : (completions ? completions.filter(c => c.isCompleted).length : 0);
  const totalCount = summary ? summary.total : (members ? members.length : 0);
  const completionPercentage = summary ? Math.round(summary.percentage) : (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  if (!members || members.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Members Found</h2>
          <p className="text-gray-600 mb-6">This club doesn't have any members yet.</p>
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Round
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Completion Tracking</h1>
            <p className="text-gray-600">
              Track who has completed the winning recommendation
            </p>
          </div>
        </div>

        {/* Winner Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {winner.title}
                </h2>
                {winner.description && (
                  <p className="text-gray-600 mb-3">{winner.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
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
                  <Users className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-medium text-gray-900">
                    {completedCount} of {totalCount} members completed
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {completionPercentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
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

        {/* Members List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Member Completion Status</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => {
                const isCompleted = getCompletionStatus(member.id);
                const isUpdating = updatingCompletion === `${member.id}-${winner.id}`;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {isCompleted ? 'Completed' : 'Not completed'}
                        </span>
                      </div>
                      
                      <Button
                        variant={isCompleted ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleCompletion(member.id, winner.id, isCompleted)}
                        loading={isUpdating}
                      >
                        {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
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
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  All Members Completed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Everyone has completed the winning recommendation. You can now finish this round and start a new one.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href={`/clubs/${clubId}/rounds/${roundId}`}>
                    <Button variant="outline">
                      Back to Round
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleFinishAndStartNew}
                    loading={isFinishingRound}
                  >
                    Start New Round
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
