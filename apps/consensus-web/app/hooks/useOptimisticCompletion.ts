'use client';

import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useUpdateCompletion } from './useApi';

export function useOptimisticCompletion() {
  const { mutate } = useSWRConfig();
  const updateCompletion = useUpdateCompletion();

  const optimisticUpdateCompletion = useCallback(async (
    roundId: string,
    memberId: string,
    recommendationId: string,
    completed: boolean
  ) => {
    // Optimistically update the cache
    const cacheKey = `/rounds/${roundId}/completion-status`;
    
    // Optimistically update the cache
    mutate(cacheKey, (current: any) => {
      // Handle different data structures from the API
      let completions = current;
      
      // If current is the API response object, extract the data
      if (current && typeof current === 'object' && current.data) {
        completions = current.data.completionStatus || current.data.completions || [];
      }
      
      // If current is still not an array, return as is
      if (!Array.isArray(completions)) {
        console.warn('Completion data is not an array:', completions);
        return current;
      }
      
      let found = false;
      const updatedCompletions = completions.map((completion: any) => {
        // Match by memberId AND recommendationId for precise targeting
        if (completion.memberId === memberId && completion.recommendationId === recommendationId) {
          found = true;
          return { ...completion, isCompleted: completed, _optimistic: true };
        }
        return completion;
      });
      
      // If the member's completion for this recommendation was not found, add a new optimistic entry
      if (!found) {
        updatedCompletions.push({
          id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
          roundId,
          memberId,
          recommendationId,
          isCompleted: completed,
          _optimistic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      // Return the data in the same structure as the original
      if (current && typeof current === 'object' && current.data) {
        return {
          ...current,
          data: {
            ...current.data,
            completionStatus: updatedCompletions
          }
        };
      }
      
      return updatedCompletions;
    }, { revalidate: false });

    try {
      // Submit the actual completion update
      const result = await updateCompletion(roundId, memberId, recommendationId, completed);
      
      // Revalidate to get the real data
      mutate(cacheKey, undefined, { revalidate: true });
      
      return result;
    } catch (error) {
      // On error, revert the optimistic update
      mutate(cacheKey, undefined, { revalidate: true });
      throw error;
    }
  }, [mutate, updateCompletion]);

  return { optimisticUpdateCompletion };
}
