'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '../../../../../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Select } from '../../../../../components/ui/Select';
import { Alert } from '../../../../../components/ui/Alert';
import { useRound, useRoundRecommendations, useSubmitVote, useClubMembers, useRoundVotes } from '../../../../../hooks/useApi';
import { Recommendation, Vote, Member } from '../../../../../context/AppContext';
import { 
  ArrowLeft, 
  Vote as VoteIcon, 
  Star,
  User,
  Trophy,
  Medal,
  Award,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const votingSchema = z.object({
  votes: z.array(z.object({
    recommendationId: z.string(),
    points: z.number().min(1).max(10),
  })).min(1, 'You must vote on at least one recommendation')
  .refine((votes) => {
    // Check for duplicate points
    const points = votes.map(v => v.points);
    const uniquePoints = [...new Set(points)];
    return points.length === uniquePoints.length;
  }, {
    message: 'Each recommendation must have different points (no duplicates allowed)',
  }),
});

type VotingForm = z.infer<typeof votingSchema>;

export default function Voting() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const roundId = params.roundId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const { round, isLoading: roundLoading } = useRound(roundId);
  const { recommendations, isLoading: recommendationsLoading } = useRoundRecommendations(roundId);
  const { members, isLoading: membersLoading } = useClubMembers(clubId);
  const { votes, isLoading: votesLoading, mutate: mutateVotes } = useRoundVotes(roundId);
  const submitVote = useSubmitVote();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<VotingForm>({
    resolver: zodResolver(votingSchema),
    defaultValues: {
      votes: [],
    },
  });

  // Watch form values for real-time validation
  const watchedVotes = watch('votes');
  
  // Real-time validation for duplicate points
  React.useEffect(() => {
    if (watchedVotes && watchedVotes.length > 0) {
      trigger('votes');
    }
  }, [watchedVotes, trigger]);

  // Helper function to check for duplicate points
  const hasDuplicatePoints = () => {
    if (!watchedVotes || watchedVotes.length === 0) return false;
    const points = watchedVotes.map(v => v.points).filter(p => p !== undefined && p !== null);
    const uniquePoints = [...new Set(points)];
    return points.length > 0 && points.length !== uniquePoints.length;
  };

  // Calculate current rankings
  const getCurrentRankings = () => {
    if (!recommendations || !votes) return [];
    
    const voteCounts = recommendations.map((rec: Recommendation) => {
      const recVotes = votes.filter((vote: Vote) => vote.recommendationId === rec.id);
      const totalPoints = recVotes.reduce((sum: number, vote: Vote) => sum + vote.points, 0);
      return { 
        recommendation: rec, 
        totalPoints,
        voteCount: recVotes.length
      };
    });

    return voteCounts.sort((a: any, b: any) => b.totalPoints - a.totalPoints);
  };

  // Check if member has voted
  const hasMemberVoted = (memberId: string) => {
    if (!votes) return false;
    return votes.some((vote: Vote) => vote.memberId === memberId);
  };

  // Generate voting options based on the number of recommendations
  const getVotingOptions = (numRecommendations: number) => {
    const options = [];
    if (numRecommendations <= 2) {
      options.push({ value: '2', label: '2 points' }, { value: '1', label: '1 point' });
    } else if (numRecommendations <= 3) {
      options.push({ value: '3', label: '3 points' }, { value: '2', label: '2 points' }, { value: '1', label: '1 point' });
    } else if (numRecommendations <= 4) {
      options.push({ value: '4', label: '4 points' }, { value: '3', label: '3 points' }, { value: '2', label: '2 points' }, { value: '1', label: '1 point' });
    } else {
      options.push({ value: '5', label: '5 points' }, { value: '4', label: '4 points' }, { value: '3', label: '3 points' }, { value: '2', label: '2 points' }, { value: '1', label: '1 point' });
    }
    return options;
  };

  const onSubmit = async (data: VotingForm) => {
    if (!selectedMember) {
      setError('Please select a member to vote');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitVote(roundId, selectedMember, data.votes);
      // Refresh votes data to show updated voting status
      await mutateVotes();
      setSelectedMember(null); // Go back to member list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (roundLoading || recommendationsLoading || membersLoading || votesLoading) {
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

  if (round.status !== 'voting') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Voting Not Available</h2>
          <p className="text-gray-600 mb-6">
            This round is currently in the {round.status} phase and voting is not available.
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

  if (!recommendations || recommendations.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations</h2>
          <p className="text-gray-600 mb-6">
            There are no recommendations to vote on yet.
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

  const votingOptions = getVotingOptions(recommendations.length);
  const rankings = getCurrentRankings();

  // If a member is selected, show their voting interface
  if (selectedMember) {
    const member = members?.find((m: Member) => m.id === selectedMember);
    const memberVotes = votes?.filter((v: Vote) => v.memberId === selectedMember) || [];
    const hasVoted = memberVotes.length > 0;
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {member?.name}'s Vote
              </h1>
              <p className="text-gray-600">
                {hasVoted ? 'View your submitted votes' : 'Assign points to each recommendation'}
              </p>
              {hasVoted && (
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Vote submitted</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Voting Form */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {hasVoted ? 'Your Submitted Votes' : 'Your Votes'}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {recommendations.map((rec: Recommendation, index: number) => {
                  const existingVote = memberVotes.find((v: Vote) => v.recommendationId === rec.id);
                  
                  return (
                    <div key={rec.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {rec.title}
                          </h3>
                          {rec.description && (
                            <p className="text-gray-600 mb-3">{rec.description}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            Recommended by {rec.recommender?.name || 'Unknown'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <Select
                            label="Points"
                            options={votingOptions}
                            error={errors.votes?.[index]?.points?.message}
                            defaultValue={existingVote?.points?.toString() || ''}
                            disabled={hasVoted}
                            {...register(`votes.${index}.points`, { 
                              valueAsNumber: true,
                              setValueAs: (value) => parseInt(value)
                            })}
                          />
                          <input
                            type="hidden"
                            {...register(`votes.${index}.recommendationId`)}
                            value={rec.id}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {errors.votes && (
                  <Alert variant="error">
                    {errors.votes.message}
                  </Alert>
                )}

                {/* Duplicate points warning */}
                {hasDuplicatePoints() && (
                  <Alert variant="error">
                    ⚠️ You have assigned the same points to multiple recommendations. Each recommendation must have different points.
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button variant="outline" type="button" onClick={() => setSelectedMember(null)}>
                    {hasVoted ? 'Back to Members' : 'Cancel'}
                  </Button>
                  {!hasVoted && (
                    <Button 
                      type="submit" 
                      loading={isSubmitting}
                      disabled={hasDuplicatePoints() || Object.keys(errors).length > 0}
                    >
                      <VoteIcon className="h-4 w-4 mr-2" />
                      Submit Vote
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
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
            <h1 className="text-3xl font-bold text-gray-900">Voting</h1>
            <p className="text-gray-600">
              Current standings and member voting
            </p>
          </div>
        </div>

        {/* Current Rankings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Current Rankings
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.map((item: any, index: number) => {
                const getRankIcon = (rank: number) => {
                  if (rank === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
                  if (rank === 1) return <Medal className="h-5 w-5 text-gray-400" />;
                  if (rank === 2) return <Award className="h-5 w-5 text-amber-600" />;
                  return <span className="text-lg font-bold text-gray-500">#{rank + 1}</span>;
                };

                return (
                  <div key={item.recommendation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.recommendation.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Recommended by {item.recommendation.recommender?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {item.totalPoints} points
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.voteCount} vote{item.voteCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Members
            </h2>
            <p className="text-gray-600">
              Click on a member to cast your vote or view your submitted vote
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members?.map((member: Member) => {
                const hasVoted = hasMemberVoted(member.id);
                
                return (
                  <div
                    key={member.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      hasVoted 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMember(member.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          hasVoted ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <User className={`h-5 w-5 ${hasVoted ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasVoted ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Voted</span>
                          </>
                        ) : (
                          <VoteIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
