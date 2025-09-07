'use client';

import { useCallback, useRef } from 'react';
import { mutate } from 'swr';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for targeted updates based on notification types
 * Instead of refreshing all data, we update only the relevant parts
 */
export function useTargetedUpdates() {
  const { user } = useAuth();
  const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Debounced mutate function to prevent rapid successive calls
  const debouncedMutate = useCallback((key: string, delay: number = 1000) => {
    // Clear existing timeout for this key
    const existingTimeout = debounceTimeouts.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout with longer delay to prevent excessive calls
    const timeout = setTimeout(() => {
      mutate(key);
      debounceTimeouts.current.delete(key);
    }, delay);

    debounceTimeouts.current.set(key, timeout);
  }, []);

  // Update club member counts and basic info - only update the specific club
  const updateClubMembers = useCallback((clubId: string) => {
    if (!user) return;
    
    // Only update the specific club data - this will refresh member count
    debouncedMutate(`/clubs/${clubId}`);
  }, [user, debouncedMutate]);

  // Update round status and voting progress - only update the specific round
  const updateRoundStatus = useCallback((clubId: string, roundId?: string) => {
    if (!user) return;
    
    // Only update the specific round if provided, otherwise update club
    if (roundId) {
      debouncedMutate(`/clubs/${clubId}/rounds/${roundId}`);
    } else {
      debouncedMutate(`/clubs/${clubId}`);
    }
  }, [user, debouncedMutate]);

  // Update votes for a specific round - only update votes
  const updateRoundVotes = useCallback((clubId: string, roundId: string) => {
    if (!user) return;
    
    // Only update round votes - use the correct cache key that matches useRoundVotes
    debouncedMutate(`/rounds/${roundId}/votes`);
  }, [user, debouncedMutate]);

  // Update recommendations for a specific round - only update recommendations
  const updateRoundRecommendations = useCallback((clubId: string, roundId: string) => {
    if (!user) return;
    
    // Only update round recommendations - use the correct cache key that matches useRoundRecommendations
    debouncedMutate(`/rounds/${roundId}/recommendations`);
  }, [user, debouncedMutate]);

  // Update club members list - only update members
  const updateClubMembersList = useCallback((clubId: string) => {
    if (!user) return;
    
    // Only update club members - the club data will be updated when needed
    debouncedMutate(`/clubs/${clubId}/members`);
  }, [user, debouncedMutate]);

  // Update club settings/info - only update the specific club
  const updateClubInfo = useCallback((clubId: string) => {
    if (!user) return;
    
    // Only update the specific club data
    debouncedMutate(`/clubs/${clubId}`);
  }, [user, debouncedMutate]);

  // Handle notification-based targeted updates
  const handleNotificationUpdate = useCallback((notification: any) => {
    if (!user || !notification) return;

    const { type, clubId, roundId } = notification;

    switch (type) {
      case 'MEMBER_ADDED':
      case 'MEMBER_REMOVED':
        updateClubMembers(clubId);
        break;
        
      case 'MEMBER_ROLE_CHANGED':
        updateClubMembersList(clubId);
        break;
        
      case 'ROUND_STARTED':
      case 'ROUND_COMPLETED':
        updateRoundStatus(clubId, roundId);
        break;
        
      case 'VOTE_CAST':
        if (roundId) {
          updateRoundVotes(clubId, roundId);
        }
        break;
        
      case 'VOTING_COMPLETED':
        if (roundId) {
          updateRoundStatus(clubId, roundId);
        }
        break;
        
      case 'RECOMMENDATION_ADDED':
        if (roundId) {
          updateRoundRecommendations(clubId, roundId);
        }
        break;
        
      case 'CLUB_UPDATED':
        updateClubInfo(clubId);
        break;
        
      default:
        // For unknown types, do a minimal update
        if (clubId) {
          debouncedMutate(`/clubs/${clubId}`);
        }
        break;
    }
  }, [user, updateClubMembers, updateRoundStatus, updateRoundVotes, updateRoundRecommendations, updateClubMembersList, updateClubInfo, debouncedMutate]);

  return {
    updateClubMembers,
    updateRoundStatus,
    updateRoundVotes,
    updateRoundRecommendations,
    updateClubMembersList,
    updateClubInfo,
    handleNotificationUpdate,
  };
}
