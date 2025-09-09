'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useSWRConfig } from 'swr';

interface VoteCounts {
  totalVotes: number;
  votedMembers: string[];
  hasVoted: { [memberId: string]: boolean };
}

export function useVoteCounts(roundId: string, members: any[] = []) {
  const { isConnected, onVoteCast, offVoteCast } = useSocket();
  const { mutate } = useSWRConfig();
  
  // Local state for vote counts - no API calls needed
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({
    totalVotes: 0,
    votedMembers: [],
    hasVoted: {}
  });

  // Initialize vote counts from current data
  useEffect(() => {
    if (members.length > 0) {
      // This will be populated when we get initial vote data
      setVoteCounts(prev => ({
        ...prev,
        hasVoted: members.reduce((acc, member) => ({
          ...acc,
          [member.id]: false
        }), {})
      }));
    }
  }, [members]);

  // Update vote counts when vote data changes (from SWR)
  const updateVoteCounts = useCallback((votes: any[] = []) => {
    const votedMembers = [...new Set(votes.map(vote => vote.memberId))];
    const hasVoted = members.reduce((acc, member) => ({
      ...acc,
      [member.id]: votedMembers.includes(member.id)
    }), {});

    setVoteCounts({
      totalVotes: votedMembers.length,
      votedMembers,
      hasVoted
    });
  }, [members]);

  // Listen for real-time vote events
  useEffect(() => {
    if (!isConnected || !roundId) return;

    const handleVoteCast = (event: any) => {
      if (event.roundId === roundId) {
        console.log('🎯 Vote cast received, updating vote counts locally');
        
        // Optimistically update local state
        setVoteCounts(prev => {
          const newVotedMembers = [...new Set([...prev.votedMembers, event.memberId])];
          const newHasVoted = {
            ...prev.hasVoted,
            [event.memberId]: true
          };

          return {
            totalVotes: newVotedMembers.length,
            votedMembers: newVotedMembers,
            hasVoted: newHasVoted
          };
        });

        // Only refresh the specific vote data, not everything
        mutate(`/rounds/${roundId}/votes`, undefined, { revalidate: true });
      }
    };

    onVoteCast(handleVoteCast);
    return () => offVoteCast(handleVoteCast);
  }, [isConnected, roundId, mutate, onVoteCast, offVoteCast]);

  return {
    voteCounts,
    updateVoteCounts,
    // Helper functions
    getVoteProgress: () => {
      const totalMembers = members.length;
      const votedCount = voteCounts.totalVotes;
      return totalMembers > 0 ? (votedCount / totalMembers) * 100 : 0;
    },
    getVoteStatus: (memberId: string) => voteCounts.hasVoted[memberId] || false,
    getVotedCount: () => voteCounts.totalVotes,
    getTotalMembers: () => members.length
  };
}
