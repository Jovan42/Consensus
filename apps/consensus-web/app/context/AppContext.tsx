'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Types
export interface Club {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: {
    minRecommendations: number;
    maxRecommendations: number;
    votingPoints: number[];
    turnOrder: string;
    tieBreakingMethod: string;
    minimumParticipation: number;
  };
  createdAt: string;
  updatedAt: string;
  members?: Member[];
  rounds?: Round[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  clubId: string;
  isClubManager: boolean;
  createdAt: string;
  updatedAt: string;
  club?: Club;
}

export interface Round {
  id: string;
  clubId: string;
  currentRecommenderId: string;
  status: 'recommending' | 'voting' | 'completed';
  createdAt: string;
  updatedAt: string;
  club?: Club;
  currentRecommender?: Member;
  recommendations?: Recommendation[];
  votes?: Vote[];
}

export interface Recommendation {
  id: string;
  roundId: string;
  recommenderId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  round?: Round;
  recommender?: Member;
  votes?: Vote[];
  completions?: Completion[];
}

export interface Vote {
  id: string;
  roundId: string;
  memberId: string;
  recommendationId: string;
  points: number;
  createdAt: string;
  updatedAt: string;
  round?: Round;
  member?: Member;
  recommendation?: Recommendation;
}

export interface Completion {
  id: string;
  memberId: string;
  recommendationId: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  member?: Member;
  recommendation?: Recommendation;
}

// State
interface AppState {
  currentClub: Club | null;
  currentRound: Round | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
type AppAction =
  | { type: 'SET_CURRENT_CLUB'; payload: Club | null }
  | { type: 'SET_CURRENT_ROUND'; payload: Round | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AppState = {
  currentClub: null,
  currentRound: null,
  isLoading: false,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_CLUB':
      return { ...state, currentClub: action.payload };
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setCurrentClub: (club: Club | null) => void;
  setCurrentRound: (round: Round | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setCurrentClub = useCallback((club: Club | null) => {
    dispatch({ type: 'SET_CURRENT_CLUB', payload: club });
  }, []);

  const setCurrentRound = useCallback((round: Round | null) => {
    dispatch({ type: 'SET_CURRENT_ROUND', payload: round });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    setCurrentClub,
    setCurrentRound,
    setLoading,
    setError,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
