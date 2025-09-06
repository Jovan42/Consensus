'use client';

import useSWR from 'swr';
import { Club, Member, Round, Recommendation, Vote, Completion } from '../context/AppContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic API functions
const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  post: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  put: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  delete: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// Club hooks
export function useClubs() {
  const { data, error, isLoading, mutate } = useSWR('/clubs', api.get);
  return {
    clubs: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useClub(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/clubs/${id}` : null,
    api.get
  );
  return {
    club: data?.data,
    error,
    isLoading,
    mutate,
  };
}

export function useCreateClub() {
  return async (clubData: Partial<Club>) => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  };
}

export function useUpdateClub() {
  return async (id: string, clubData: Partial<Club>) => {
    const response = await api.put(`/clubs/${id}`, clubData);
    return response.data;
  };
}

export function useDeleteClub() {
  return async (id: string) => {
    await api.delete(`/clubs/${id}`);
  };
}

// Member hooks
export function useClubMembers(clubId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    clubId ? `/clubs/${clubId}/members` : null,
    api.get
  );
  return {
    members: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useMember(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/members/${id}` : null,
    api.get
  );
  return {
    member: data?.data,
    error,
    isLoading,
    mutate,
  };
}

export function useAddMember() {
  return async (clubId: string, memberData: Partial<Member>) => {
    const response = await api.post(`/clubs/${clubId}/members`, memberData);
    return response.data;
  };
}

export function useUpdateMember() {
  return async (id: string, memberData: Partial<Member>) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  };
}

export function useRemoveMember() {
  return async (clubId: string, memberId: string) => {
    await api.delete(`/clubs/${clubId}/members/${memberId}`);
  };
}

// Round hooks
export function useClubRounds(clubId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    clubId ? `/clubs/${clubId}/rounds` : null,
    api.get
  );
  return {
    rounds: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useRound(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/rounds/${id}` : null,
    api.get
  );
  return {
    round: data?.data,
    error,
    isLoading,
    mutate,
  };
}

export function useStartRound() {
  return async (clubId: string, currentRecommenderId: string) => {
    const response = await api.post(`/clubs/${clubId}/rounds`, {
      currentRecommenderId,
    });
    return response.data;
  };
}

export function useUpdateRoundStatus() {
  return async (id: string, status: string) => {
    const response = await api.put(`/rounds/${id}/status`, { status });
    return response.data;
  };
}

export function useCloseVoting() {
  return async (roundId: string) => {
    const response = await api.post(`/rounds/${roundId}/close-voting`);
    return response.data;
  };
}

export function useFinishRound() {
  return async (id: string) => {
    const response = await api.post(`/rounds/${id}/finish`);
    return response;
  };
}

// Recommendation hooks
export function useRoundRecommendations(roundId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    roundId ? `/rounds/${roundId}/recommendations` : null,
    api.get
  );
  return {
    recommendations: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAddRecommendations() {
  return async (roundId: string, recommendations: Partial<Recommendation>[]) => {
    const response = await api.post(`/rounds/${roundId}/recommendations`, {
      recommendations,
    });
    return response.data;
  };
}

export function useUpdateRecommendation() {
  return async (id: string, recommendationData: Partial<Recommendation>) => {
    const response = await api.put(`/recommendations/${id}`, recommendationData);
    return response.data;
  };
}

// Vote hooks
export function useRoundVotes(roundId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    roundId ? `/rounds/${roundId}/votes` : null,
    api.get
  );
  return {
    votes: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useSubmitVote() {
  return async (roundId: string, memberId: string, votes: { recommendationId: string; points: number }[]) => {
    const response = await api.post(`/rounds/${roundId}/votes`, { memberId, votes });
    return response.data;
  };
}

// Completion hooks
export function useRoundCompletions(roundId: string, hasWinningRecommendation: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR(
    roundId && hasWinningRecommendation ? `/rounds/${roundId}/completion-status` : null,
    api.get
  );
  return {
    completions: data?.data?.completionStatus || [],
    summary: data?.data?.summary || null,
    error,
    isLoading,
    mutate,
  };
}

export function useRecommendationCompletions(recommendationId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    recommendationId ? `/recommendations/${recommendationId}/completions` : null,
    api.get
  );
  return {
    completions: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useUpdateCompletion() {
  return async (roundId: string, memberId: string, recommendationId: string, isCompleted: boolean) => {
    const response = await api.post(`/rounds/${roundId}/completions`, {
      memberId,
      recommendationId,
      isCompleted,
    });
    return response.data;
  };
}
