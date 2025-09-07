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
import { useRound, useRoundRecommendations, useSubmitVote, useClubMembers, useRoundVotes, useClub } from '../../../../../hooks/useApi';
import { Recommendation, Vote, Member } from '../../../../../context/AppContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useRealtimeUpdates } from '../../../../../hooks/useRealtimeUpdates';
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
    points: z.union([z.number().min(1).max(10), z.literal('')]),
  }))
  .refine((votes) => {
    // Filter out empty votes and check if at least one vote is cast
    const validVotes = votes.filter(v => v.points !== '');
    return validVotes.length > 0;
  }, {
    message: 'You must vote on at least one recommendation',
  })
  .refine((votes) => {
    // Check for duplicate points (only among non-empty votes)
    const validVotes = votes.filter(v => v.points !== '');
    const points = validVotes.map(v => v.points);
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
  const { user, hasRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  
  // Enable real-time updates for this page
  useRealtimeUpdates({ clubId, roundId });

  const { round, isLoading: roundLoading } = useRound(roundId);
  const { recommendations, isLoading: recommendationsLoading } = useRoundRecommendations(roundId);
  const { members, isLoading: membersLoading } = useClubMembers(clubId);
  const { votes, isLoading: votesLoading, mutate: mutateVotes } = useRoundVotes(roundId);
  const { club } = useClub(clubId);
  const submitVote = useSubmitVote();

  // Get current user's member info
  const currentUserMember = members?.find((member: Member) => member.email === user?.email);

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
    // Filter out empty votes (empty string or null/undefined)
    const validVotes = watchedVotes.filter(v => v.points !== '' && v.points !== undefined && v.points !== null);
    const points = validVotes.map(v => v.points);
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

  // Check if current user can vote for a specific member
  const canVoteForMember = (member: Member) => {
    if (!user) return false;
    
    // User can always vote for themselves
    if (user.email === member.email) return true;
    
    // Admins and club managers can vote for anyone
    if (hasRole('admin') || currentUserMember?.isClubManager) return true;
    
    return false;
  };

  // Check if current user can view voting results for a specific member
  const canViewVotingForMember = (member: Member) => {
    if (!user) return false;
    
    // User can always view their own votes
    if (user.email === member.email) return true;
    
    // Admins can view anyone's votes
    if (hasRole('admin')) return true;
    
    // Non-admins can view voting results (but not vote) for others
    return true;
  };

  // Check if current user is voting for someone else (admin/club manager action)
  const isVotingForSomeoneElse = (member: Member) => {
    if (!user) return false;
    const isAdmin = hasRole('admin');
    const isClubManager = currentUserMember?.isClubManager || false;
    return user.email !== member.email && (isAdmin || isClubManager);
  };

  // Generate voting options based on the club's voting points configuration
  const getVotingOptions = () => {
    // Use club's configured voting points, fallback to [3, 2, 1] if not configured
    const votingPoints = club?.config?.votingPoints || [3, 2, 1];
    
    const options = votingPoints.map((points: number) => ({
      value: points.toString(),
      label: `${points} point${points !== 1 ? 's' : ''}`
    }));
    
    // Add "No vote" option at the beginning
    options.unshift({
      value: '',
      label: 'No vote (skip)'
    });
    
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
      // Filter out empty votes (where points is empty string)
      const validVotes = data.votes
        .filter(vote => vote.points !== '')
        .map(vote => ({
          recommendationId: vote.recommendationId,
          points: vote.points as number
        }));
      
      if (validVotes.length === 0) {
        setError('You must vote on at least one recommendation');
        return;
      }

      await submitVote(roundId, selectedMember, validVotes);
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Voting Not Available</h2>
          <p className="text-muted-foreground mb-6">
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
          <h2 className="text-2xl font-bold text-foreground mb-4">No Recommendations</h2>
          <p className="text-muted-foreground mb-6">
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

  const votingOptions = getVotingOptions();
  const rankings = getCurrentRankings();

  // If a member is selected, show their voting interface
  if (selectedMember) {
    const member = members?.find((m: Member) => m.id === selectedMember);
    const memberVotes = votes?.filter((v: Vote) => v.memberId === selectedMember) || [];
    const hasVoted = memberVotes.length > 0;
    const canVote = member ? canVoteForMember(member) : false;
    const isViewOnly = member ? (canViewVotingForMember(member) && !canVote) : false;
    
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
              <h1 className="text-3xl font-bold text-foreground">
                {member?.name}'s Vote
              </h1>
              <p className="text-muted-foreground">
                {isViewOnly 
                  ? 'View voting results (read-only)' 
                  : hasVoted 
                    ? 'View your submitted votes' 
                    : 'Assign points to each recommendation'
                }
              </p>
              {hasVoted && (
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-success mr-1" />
                  <span className="text-sm text-success font-medium">Vote submitted</span>
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

          {/* Admin Warning */}
          {member && isVotingForSomeoneElse(member) && (
            <Alert variant="warning">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {hasRole('admin') ? 'Admin Action' : 'Club Manager Action'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You are casting a vote on behalf of <strong>{member.name}</strong>. This is an administrative action that will be recorded in the system.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          {/* Voting Form */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {isViewOnly 
                  ? 'Voting Results' 
                  : hasVoted 
                    ? 'Your Submitted Votes' 
                    : 'Your Votes'
                }
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {recommendations.map((rec: Recommendation, index: number) => {
                  const existingVote = memberVotes.find((v: Vote) => v.recommendationId === rec.id);
                  
                  return (
                    <div key={rec.id} className="p-4 border border-border rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {rec.title}
                          </h3>
                          {rec.description && (
                            <p className="text-muted-foreground mb-3">{rec.description}</p>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-1" />
                            Recommended by {rec.recommender?.name || 'Unknown'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Star className="h-5 w-5 text-warning" />
                          <Select
                            label="Points"
                            options={votingOptions}
                            error={errors.votes?.[index]?.points?.message}
                            defaultValue={existingVote?.points?.toString() || ''}
                            disabled={hasVoted || isViewOnly}
                            {...register(`votes.${index}.points`, { 
                              setValueAs: (value) => value === '' ? '' : parseInt(value)
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
                <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setSelectedMember(null)}>
                    {isViewOnly ? 'Back to Members' : hasVoted ? 'Back to Members' : 'Cancel'}
                  </Button>
                  {!hasVoted && !isViewOnly && (
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
            <h1 className="text-3xl font-bold text-foreground">Voting</h1>
            <p className="text-muted-foreground">
              Current standings and member voting
            </p>
          </div>
        </div>

        {/* Current Rankings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-warning" />
              Current Rankings
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.map((item: any, index: number) => {
                const getRankIcon = (rank: number) => {
                  if (rank === 0) return <Trophy className="h-5 w-5 text-warning" />;
                  if (rank === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
                  if (rank === 2) return <Award className="h-5 w-5 text-warning" />;
                  return <span className="text-lg font-bold text-muted-foreground">#{rank + 1}</span>;
                };

                return (
                  <div key={item.recommendation.id} className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index)}
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.recommendation.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Recommended by {item.recommendation.recommender?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {item.totalPoints} points
                      </div>
                      <div className="text-sm text-muted-foreground">
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
              <User className="h-5 w-5 mr-2 text-primary" />
              Members
            </h2>
            <p className="text-muted-foreground">
              Click on a member to cast your vote, view your submitted vote, or view voting results
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members?.map((member: Member) => {
                const hasVoted = hasMemberVoted(member.id);
                const canVote = canVoteForMember(member);
                const canView = canViewVotingForMember(member);
                const isAdminAction = isVotingForSomeoneElse(member);
                const isViewOnly = canView && !canVote;
                
                return (
                  <div
                    key={member.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !canView
                        ? 'border-border bg-muted cursor-not-allowed opacity-60'
                        : hasVoted 
                          ? 'border-success/20 bg-success/10 hover:bg-success/20 cursor-pointer' 
                          : 'border-border bg-card hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => canView && setSelectedMember(member.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          hasVoted ? 'bg-success/10' : 'bg-muted'
                        }`}>
                          <User className={`h-5 w-5 ${hasVoted ? 'text-success' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">{member.name}</h3>
                            {isAdminAction && (
                              <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full">
                                Admin Action
                              </span>
                            )}
                            {isViewOnly && hasVoted && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                View Only
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {!canVote && !hasVoted && (
                            <p className="text-xs text-error mt-1">
                              You can only vote for yourself
                            </p>
                          )}
                          {isViewOnly && hasVoted && (
                            <p className="text-xs text-primary mt-1">
                              View voting results
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasVoted ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-success" />
                            <span className="text-sm text-success font-medium">Voted</span>
                          </>
                        ) : canVote ? (
                          <VoteIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <VoteIcon className="h-5 w-5 text-muted-foreground" />
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
