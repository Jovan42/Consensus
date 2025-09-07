'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import socketManager, { SocketEvents } from '../../lib/socket';

interface SocketContextType {
  isConnected: boolean;
  socketId: string | undefined;
  joinClubs: (clubIds: string[]) => void;
  leaveClubs: (clubIds: string[]) => void;
  
  // Event listeners
  onVoteCast: (callback: (data: SocketEvents['vote_cast']) => void) => void;
  onCompletionUpdated: (callback: (data: SocketEvents['completion_updated']) => void) => void;
  onRoundStatusChanged: (callback: (data: SocketEvents['round_status_changed']) => void) => void;
  onTurnChanged: (callback: (data: SocketEvents['turn_changed']) => void) => void;
  onMemberAdded: (callback: (data: SocketEvents['member_added']) => void) => void;
  onMemberRemoved: (callback: (data: SocketEvents['member_removed']) => void) => void;
  onMemberRoleChanged: (callback: (data: SocketEvents['member_role_changed']) => void) => void;
  onClubUpdated: (callback: (data: SocketEvents['club_updated']) => void) => void;
  onRecommendationAdded: (callback: (data: SocketEvents['recommendation_added']) => void) => void;
  onRecommendationRemoved: (callback: (data: SocketEvents['recommendation_removed']) => void) => void;
  onNotification: (callback: (data: SocketEvents['notification']) => void) => void;
  
  // Remove event listeners
  offVoteCast: (callback?: (data: SocketEvents['vote_cast']) => void) => void;
  offCompletionUpdated: (callback?: (data: SocketEvents['completion_updated']) => void) => void;
  offRoundStatusChanged: (callback?: (data: SocketEvents['round_status_changed']) => void) => void;
  offTurnChanged: (callback?: (data: SocketEvents['turn_changed']) => void) => void;
  offMemberAdded: (callback?: (data: SocketEvents['member_added']) => void) => void;
  offMemberRemoved: (callback?: (data: SocketEvents['member_removed']) => void) => void;
  offMemberRoleChanged: (callback?: (data: SocketEvents['member_role_changed']) => void) => void;
  offClubUpdated: (callback?: (data: SocketEvents['club_updated']) => void) => void;
  offRecommendationAdded: (callback?: (data: SocketEvents['recommendation_added']) => void) => void;
  offRecommendationRemoved: (callback?: (data: SocketEvents['recommendation_removed']) => void) => void;
  offNotification: (callback?: (data: SocketEvents['notification']) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket when user is authenticated
      // For now, we'll use a mock token since we're using test accounts
      const mockToken = `test-token-${user.email}`;
      socketManager.connect(mockToken);
      
      // Set up connection status listeners
      const checkConnection = () => {
        setIsConnected(socketManager.connected);
        setSocketId(socketManager.socketId);
      };

      // Check connection status periodically
      const interval = setInterval(checkConnection, 1000);
      
      // Initial check
      checkConnection();

      return () => {
        clearInterval(interval);
        socketManager.disconnect();
        setIsConnected(false);
        setSocketId(undefined);
      };
    } else {
      // Disconnect when user is not authenticated
      socketManager.disconnect();
      setIsConnected(false);
      setSocketId(undefined);
    }
  }, [isAuthenticated, user]);

  const contextValue: SocketContextType = {
    isConnected,
    socketId,
    joinClubs: socketManager.joinClubs.bind(socketManager),
    leaveClubs: socketManager.leaveClubs.bind(socketManager),
    
    // Event listeners
    onVoteCast: socketManager.onVoteCast.bind(socketManager),
    onCompletionUpdated: socketManager.onCompletionUpdated.bind(socketManager),
    onRoundStatusChanged: socketManager.onRoundStatusChanged.bind(socketManager),
    onTurnChanged: socketManager.onTurnChanged.bind(socketManager),
    onMemberAdded: socketManager.onMemberAdded.bind(socketManager),
    onMemberRemoved: socketManager.onMemberRemoved.bind(socketManager),
    onMemberRoleChanged: socketManager.onMemberRoleChanged.bind(socketManager),
    onClubUpdated: socketManager.onClubUpdated.bind(socketManager),
    onRecommendationAdded: socketManager.onRecommendationAdded.bind(socketManager),
    onRecommendationRemoved: socketManager.onRecommendationRemoved.bind(socketManager),
    onNotification: socketManager.onNotification.bind(socketManager),
    
    // Remove event listeners
    offVoteCast: socketManager.offVoteCast.bind(socketManager),
    offCompletionUpdated: socketManager.offCompletionUpdated.bind(socketManager),
    offRoundStatusChanged: socketManager.offRoundStatusChanged.bind(socketManager),
    offTurnChanged: socketManager.offTurnChanged.bind(socketManager),
    offMemberAdded: socketManager.offMemberAdded.bind(socketManager),
    offMemberRemoved: socketManager.offMemberRemoved.bind(socketManager),
    offMemberRoleChanged: socketManager.offMemberRoleChanged.bind(socketManager),
    offClubUpdated: socketManager.offClubUpdated.bind(socketManager),
    offRecommendationAdded: socketManager.offRecommendationAdded.bind(socketManager),
    offRecommendationRemoved: socketManager.offRecommendationRemoved.bind(socketManager),
    offNotification: socketManager.offNotification.bind(socketManager),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
