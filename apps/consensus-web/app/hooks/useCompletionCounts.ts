'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useSWRConfig } from 'swr';

interface CompletionCounts {
  totalCompletions: number;
  completedMembers: string[];
  isCompleted: { [memberId: string]: boolean };
}

export function useCompletionCounts(roundId: string, members: any[] = []) {
  const { isConnected, onCompletionUpdated, offCompletionUpdated } = useSocket();
  const { mutate } = useSWRConfig();
  
  // Local state for completion counts - no API calls needed
  const [completionCounts, setCompletionCounts] = useState<CompletionCounts>({
    totalCompletions: 0,
    completedMembers: [],
    isCompleted: {}
  });

  // Initialize completion counts from current data
  useEffect(() => {
    if (members.length > 0) {
      setCompletionCounts(prev => ({
        ...prev,
        isCompleted: members.reduce((acc, member) => ({
          ...acc,
          [member.id]: false
        }), {})
      }));
    }
  }, [members]);

  // Update completion counts when completion data changes (from SWR)
  const updateCompletionCounts = useCallback((completions: any[] = []) => {
    const completedMembers = completions
      .filter(completion => completion.completed)
      .map(completion => completion.memberId);
    
    const isCompleted = members.reduce((acc, member) => ({
      ...acc,
      [member.id]: completedMembers.includes(member.id)
    }), {});

    setCompletionCounts({
      totalCompletions: completedMembers.length,
      completedMembers,
      isCompleted
    });
  }, [members]);

  // Listen for real-time completion events
  useEffect(() => {
    if (!isConnected || !roundId) return;

    const handleCompletionUpdated = (event: any) => {
      if (event.roundId === roundId) {
        console.log('🎯 Completion updated received, updating completion counts locally');
        
        // Optimistically update local state
        setCompletionCounts(prev => {
          let newCompletedMembers = [...prev.completedMembers];
          let newIsCompleted = { ...prev.isCompleted };

          if (event.completed) {
            // Mark as completed
            if (!newCompletedMembers.includes(event.memberId)) {
              newCompletedMembers.push(event.memberId);
            }
            newIsCompleted[event.memberId] = true;
          } else {
            // Mark as not completed
            newCompletedMembers = newCompletedMembers.filter(id => id !== event.memberId);
            newIsCompleted[event.memberId] = false;
          }

          return {
            totalCompletions: newCompletedMembers.length,
            completedMembers: newCompletedMembers,
            isCompleted: newIsCompleted
          };
        });

        // Only refresh the specific completion data, not everything
        mutate(`/rounds/${roundId}/completion-status`, undefined, { revalidate: true });
      }
    };

    onCompletionUpdated(handleCompletionUpdated);
    return () => offCompletionUpdated(handleCompletionUpdated);
  }, [isConnected, roundId, mutate, onCompletionUpdated, offCompletionUpdated]);

  return {
    completionCounts,
    updateCompletionCounts,
    // Helper functions
    getCompletionProgress: () => {
      const totalMembers = members.length;
      const completedCount = completionCounts.totalCompletions;
      return totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0;
    },
    getCompletionStatus: (memberId: string) => completionCounts.isCompleted[memberId] || false,
    getCompletedCount: () => completionCounts.totalCompletions,
    getTotalMembers: () => members.length
  };
}
