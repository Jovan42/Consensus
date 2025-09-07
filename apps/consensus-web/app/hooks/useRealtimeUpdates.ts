'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useSWRConfig } from 'swr';

interface UseRealtimeUpdatesOptions {
  clubId?: string;
  roundId?: string;
  enabled?: boolean;
}

export function useRealtimeUpdates({ 
  clubId, 
  roundId, 
  enabled = true 
}: UseRealtimeUpdatesOptions = {}) {
  const { 
    isConnected, 
    joinClubs, 
    leaveClubs,
    onVoteCast,
    onCompletionUpdated,
    onRoundStatusChanged,
    onTurnChanged,
    onMemberAdded,
    onMemberRemoved,
    onMemberRoleChanged,
    onClubUpdated,
    onRecommendationAdded,
    onRecommendationRemoved,
    onNotification,
    offVoteCast,
    offCompletionUpdated,
    offRoundStatusChanged,
    offTurnChanged,
    offMemberAdded,
    offMemberRemoved,
    offMemberRoleChanged,
    offClubUpdated,
    offRecommendationAdded,
    offRecommendationRemoved,
    offNotification,
  } = useSocket();
  
  const { mutate } = useSWRConfig();

  // Join/leave clubs when clubId changes
  useEffect(() => {
    if (!enabled || !isConnected) return;

    if (clubId) {
      joinClubs([clubId]);
    }

    return () => {
      if (clubId) {
        leaveClubs([clubId]);
      }
    };
  }, [clubId, enabled, isConnected, joinClubs, leaveClubs]);

  // Generic cache invalidation function
  const invalidateCache = useCallback((pattern: string) => {
    mutate(
      (key) => {
        if (typeof key === 'string') {
          return key.includes(pattern);
        }
        return false;
      },
      undefined,
      { revalidate: true }
    );
  }, [mutate]);

  // Force refresh main data function
  const forceRefreshMainData = useCallback(() => {
    if (clubId) {
      // Force refresh club data
      mutate(`/clubs/${clubId}`, undefined, { revalidate: true });
      // Force refresh club members
      mutate(`/clubs/${clubId}/members`, undefined, { revalidate: true });
      // Force refresh club rounds
      mutate(`/clubs/${clubId}/rounds`, undefined, { revalidate: true });
    }
    if (roundId) {
      // Force refresh round data
      mutate(`/rounds/${roundId}`, undefined, { revalidate: true });
      // Force refresh round recommendations
      mutate(`/rounds/${roundId}/recommendations`, undefined, { revalidate: true });
      // Force refresh round votes
      mutate(`/rounds/${roundId}/votes`, undefined, { revalidate: true });
    }
  }, [mutate, clubId, roundId]);

  // Vote cast handler
  useEffect(() => {
    if (!enabled) return;

    const handleVoteCast = (data: any) => {
      if (clubId && data.clubId === clubId) {
        console.log('Vote cast event received, refreshing voting data');
        // Force refresh votes specifically
        if (roundId) {
          mutate(`/rounds/${roundId}/votes`, undefined, { revalidate: true });
        }
        // Also invalidate other related cache with correct keys (SWR keys, not API URLs)
        invalidateCache(`/rounds/${roundId}/votes`);
        invalidateCache(`/rounds/${roundId}`);
        invalidateCache(`/clubs/${clubId}/rounds`);
        // Refresh member data since voting status changes
        mutate(`/clubs/${clubId}/members`, undefined, { revalidate: true });
      }
    };

    onVoteCast(handleVoteCast);
    return () => offVoteCast(handleVoteCast);
  }, [enabled, clubId, roundId, onVoteCast, offVoteCast, invalidateCache, mutate]);

  // Completion updated handler
  useEffect(() => {
    if (!enabled) return;

    const handleCompletionUpdated = (data: any) => {
      if (clubId && data.clubId === clubId) {
        console.log('Completion updated event received, refreshing completion data');
        // Invalidate completion-related cache with correct key (SWR key, not API URL)
        invalidateCache(`/rounds/${roundId}/completion-status`);
        invalidateCache(`/rounds/${roundId}`);
      }
    };

    onCompletionUpdated(handleCompletionUpdated);
    return () => offCompletionUpdated(handleCompletionUpdated);
  }, [enabled, clubId, roundId, onCompletionUpdated, offCompletionUpdated, invalidateCache]);

  // Round status changed handler
  useEffect(() => {
    if (!enabled) return;

    const handleRoundStatusChanged = (data: any) => {
      if (clubId && data.clubId === clubId) {
        // Invalidate round-related cache with correct keys (SWR keys, not API URLs)
        invalidateCache(`/rounds/${data.roundId}`);
        invalidateCache(`/clubs/${clubId}/rounds`);
        invalidateCache(`/clubs/${clubId}`);
      }
    };

    onRoundStatusChanged(handleRoundStatusChanged);
    return () => offRoundStatusChanged(handleRoundStatusChanged);
  }, [enabled, clubId, onRoundStatusChanged, offRoundStatusChanged, invalidateCache]);

  // Turn changed handler
  useEffect(() => {
    if (!enabled) return;

    const handleTurnChanged = (data: any) => {
      if (clubId && data.clubId === clubId) {
        // Invalidate round-related cache with correct keys (SWR keys, not API URLs)
        invalidateCache(`/rounds/${data.roundId}`);
        invalidateCache(`/clubs/${clubId}/rounds`);
      }
    };

    onTurnChanged(handleTurnChanged);
    return () => offTurnChanged(handleTurnChanged);
  }, [enabled, clubId, onTurnChanged, offTurnChanged, invalidateCache]);

  // Member added handler
  useEffect(() => {
    if (!enabled) return;

    const handleMemberAdded = (data: any) => {
      if (clubId && data.clubId === clubId) {
        console.log('Member added event received, refreshing members list');
        // Force refresh members list specifically
        mutate(`/clubs/${clubId}/members`, undefined, { revalidate: true });
        // Also invalidate other related cache
        invalidateCache(`/clubs/${clubId}/members`);
        invalidateCache(`/clubs/${clubId}`);
      }
    };

    onMemberAdded(handleMemberAdded);
    return () => offMemberAdded(handleMemberAdded);
  }, [enabled, clubId, onMemberAdded, offMemberAdded, invalidateCache, mutate]);

  // Member removed handler
  useEffect(() => {
    if (!enabled) return;

    const handleMemberRemoved = (data: any) => {
      if (clubId && data.clubId === clubId) {
        console.log('Member removed event received, refreshing members list');
        // Force refresh members list specifically
        mutate(`/clubs/${clubId}/members`, undefined, { revalidate: true });
        // Also invalidate other related cache
        invalidateCache(`/clubs/${clubId}/members`);
        invalidateCache(`/clubs/${clubId}`);
      }
    };

    onMemberRemoved(handleMemberRemoved);
    return () => offMemberRemoved(handleMemberRemoved);
  }, [enabled, clubId, onMemberRemoved, offMemberRemoved, invalidateCache, mutate]);

  // Member role changed handler
  useEffect(() => {
    if (!enabled) return;

    const handleMemberRoleChanged = (data: any) => {
      if (clubId && data.clubId === clubId) {
        // Invalidate member-related cache with correct keys (SWR keys, not API URLs)
        invalidateCache(`/clubs/${clubId}/members`);
        invalidateCache(`/clubs/${clubId}`);
      }
    };

    onMemberRoleChanged(handleMemberRoleChanged);
    return () => offMemberRoleChanged(handleMemberRoleChanged);
  }, [enabled, clubId, onMemberRoleChanged, offMemberRoleChanged, invalidateCache]);

  // Club updated handler
  useEffect(() => {
    if (!enabled) return;

    const handleClubUpdated = (data: any) => {
      if (clubId && data.clubId === clubId) {
        // Invalidate club-related cache
        invalidateCache(`/clubs/${clubId}`);
        invalidateCache('/clubs');
      }
    };

    onClubUpdated(handleClubUpdated);
    return () => offClubUpdated(handleClubUpdated);
  }, [enabled, clubId, onClubUpdated, offClubUpdated, invalidateCache]);

  // Recommendation added handler
  useEffect(() => {
    if (!enabled) return;

    const handleRecommendationAdded = (data: any) => {
      if (clubId && data.clubId === clubId) {
        console.log('Recommendation added event received, refreshing recommendations list');
        // Force refresh recommendations list specifically
        if (roundId && data.roundId === roundId) {
          mutate(`/rounds/${roundId}/recommendations`, undefined, { revalidate: true });
        }
        // Also invalidate other related cache
        invalidateCache(`/rounds/${data.roundId}/recommendations`);
        invalidateCache(`/clubs/${clubId}/rounds`);
      }
    };

    onRecommendationAdded(handleRecommendationAdded);
    return () => offRecommendationAdded(handleRecommendationAdded);
  }, [enabled, clubId, roundId, onRecommendationAdded, offRecommendationAdded, invalidateCache, mutate]);

  // Recommendation removed handler
  useEffect(() => {
    if (!enabled) return;

    const handleRecommendationRemoved = (data: any) => {
      if (clubId && data.clubId === clubId) {
        console.log('Recommendation removed event received, refreshing recommendations list');
        // Force refresh recommendations list specifically
        if (roundId && data.roundId === roundId) {
          mutate(`/rounds/${roundId}/recommendations`, undefined, { revalidate: true });
        }
        // Also invalidate other related cache
        invalidateCache(`/rounds/${data.roundId}/recommendations`);
        invalidateCache(`/clubs/${clubId}/rounds`);
      }
    };

    onRecommendationRemoved(handleRecommendationRemoved);
    return () => offRecommendationRemoved(handleRecommendationRemoved);
  }, [enabled, clubId, roundId, onRecommendationRemoved, offRecommendationRemoved, invalidateCache, mutate]);


  // Notification handler - force refresh main data when notifications are received
  useEffect(() => {
    if (!enabled) return;

    const handleNotification = (data: any) => {
      console.log('Real-time notification received:', data);
      console.log('Current clubId:', clubId);
      console.log('Notification clubId:', data.clubId);
      
      if (clubId && data.clubId === clubId) {
        console.log('Club IDs match, forcing data refresh');
        // Force refresh all main data when any notification is received
        forceRefreshMainData();
      } else {
        console.log('Club IDs do not match, skipping refresh');
      }
    };

    onNotification(handleNotification);
    return () => offNotification(handleNotification);
  }, [enabled, clubId, onNotification, offNotification, forceRefreshMainData]);

  return {
    isConnected,
    invalidateCache,
    forceRefreshMainData
  };
}
