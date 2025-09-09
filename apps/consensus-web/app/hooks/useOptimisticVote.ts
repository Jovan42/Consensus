'use client';

import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useSubmitVote } from './useApi';

export function useOptimisticVote() {
  const { mutate } = useSWRConfig();
  const submitVote = useSubmitVote();

  const optimisticVote = useCallback(async (
    roundId: string, 
    memberId: string, 
    votes: Array<{ recommendationId: string; points: number }>
  ) => {
    // Optimistically update the cache
    const cacheKey = `/rounds/${roundId}/votes`;
    
    // Get current votes
    const currentVotes = mutate(cacheKey, undefined, { revalidate: false });
    
    // Create optimistic vote entries
    const optimisticVotes = votes.map(vote => ({
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
      roundId,
      memberId,
      recommendationId: vote.recommendationId,
      points: vote.points,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mark as optimistic
      _optimistic: true
    }));

    // Optimistically update the cache
    mutate(cacheKey, (current: any) => {
      if (!current) return optimisticVotes;
      
      // Remove any existing votes for this member
      const filteredVotes = current.filter((vote: any) => vote.memberId !== memberId);
      
      // Add new optimistic votes
      return [...filteredVotes, ...optimisticVotes];
    }, { revalidate: false });

    try {
      // Submit the actual vote
      const result = await submitVote(roundId, memberId, votes);
      
      // Revalidate to get the real data
      mutate(cacheKey, undefined, { revalidate: true });
      
      return result;
    } catch (error) {
      // On error, revert the optimistic update
      mutate(cacheKey, undefined, { revalidate: true });
      throw error;
    }
  }, [mutate, submitVote]);

  return { optimisticVote };
}
