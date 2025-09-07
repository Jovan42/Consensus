import { io, Socket } from 'socket.io-client';

export interface SocketEvents {
  // Voting events
  vote_cast: {
    clubId: string;
    roundId: string;
    memberId: string;
    memberName: string;
    recommendationId: string;
    points: number;
  };
  
  // Completion events
  completion_updated: {
    clubId: string;
    roundId: string;
    memberId: string;
    memberName: string;
    completed: boolean;
  };
  
  // Round status events
  round_status_changed: {
    clubId: string;
    roundId: string;
    status: 'active' | 'voting' | 'completed';
    winnerId?: string;
    winnerTitle?: string;
  };
  
  // Turn change events
  turn_changed: {
    clubId: string;
    roundId: string;
    newRecommenderId: string;
    newRecommenderName: string;
    previousRecommenderId?: string;
    previousRecommenderName?: string;
  };
  
  // Member events
  member_added: {
    clubId: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    role: 'member' | 'manager';
  };
  
  member_removed: {
    clubId: string;
    memberId: string;
    memberName: string;
  };
  
  member_role_changed: {
    clubId: string;
    memberId: string;
    memberName: string;
    oldRole: 'member' | 'manager';
    newRole: 'member' | 'manager';
  };
  
  // Club events
  club_updated: {
    clubId: string;
    changes: {
      name?: string;
      description?: string;
      type?: string;
      settings?: any;
    };
  };
  
  // Recommendation events
  recommendation_added: {
    clubId: string;
    roundId: string;
    recommendationId: string;
    title: string;
    description: string;
    recommenderId: string;
    recommenderName: string;
  };
  
  recommendation_removed: {
    clubId: string;
    roundId: string;
    recommendationId: string;
    title: string;
  };
  
  // Notification events
  notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    clubId?: string;
    roundId?: string;
    timestamp: string;
  };
}

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string, clubIds: string[] = []) {
    if (this.socket?.connected) {
      return;
    }

    // Socket.io should connect to the server root, not the /api path
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const SOCKET_URL = API_BASE_URL.replace('/api', '');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join clubs if provided
      if (clubIds.length > 0) {
        this.joinClubs(clubIds);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.error('Connection URL:', SOCKET_URL);
      console.error('Token:', token);
      this.handleReconnect();
    });

    return this.socket;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinClubs(clubIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('join_clubs', clubIds);
    }
  }

  leaveClubs(clubIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('leave_clubs', clubIds);
    }
  }

  // Event listeners
  onVoteCast(callback: (data: SocketEvents['vote_cast']) => void) {
    this.socket?.on('vote_cast', callback);
  }

  onCompletionUpdated(callback: (data: SocketEvents['completion_updated']) => void) {
    this.socket?.on('completion_updated', callback);
  }

  onRoundStatusChanged(callback: (data: SocketEvents['round_status_changed']) => void) {
    this.socket?.on('round_status_changed', callback);
  }

  onTurnChanged(callback: (data: SocketEvents['turn_changed']) => void) {
    this.socket?.on('turn_changed', callback);
  }

  onMemberAdded(callback: (data: SocketEvents['member_added']) => void) {
    this.socket?.on('member_added', callback);
  }

  onMemberRemoved(callback: (data: SocketEvents['member_removed']) => void) {
    this.socket?.on('member_removed', callback);
  }

  onMemberRoleChanged(callback: (data: SocketEvents['member_role_changed']) => void) {
    this.socket?.on('member_role_changed', callback);
  }

  onClubUpdated(callback: (data: SocketEvents['club_updated']) => void) {
    this.socket?.on('club_updated', callback);
  }

  onRecommendationAdded(callback: (data: SocketEvents['recommendation_added']) => void) {
    this.socket?.on('recommendation_added', callback);
  }

  onRecommendationRemoved(callback: (data: SocketEvents['recommendation_removed']) => void) {
    this.socket?.on('recommendation_removed', callback);
  }

  onNotification(callback: (data: SocketEvents['notification']) => void) {
    this.socket?.on('notification', callback);
  }

  // Remove event listeners
  offVoteCast(callback?: (data: SocketEvents['vote_cast']) => void) {
    this.socket?.off('vote_cast', callback);
  }

  offCompletionUpdated(callback?: (data: SocketEvents['completion_updated']) => void) {
    this.socket?.off('completion_updated', callback);
  }

  offRoundStatusChanged(callback?: (data: SocketEvents['round_status_changed']) => void) {
    this.socket?.off('round_status_changed', callback);
  }

  offTurnChanged(callback?: (data: SocketEvents['turn_changed']) => void) {
    this.socket?.off('turn_changed', callback);
  }

  offMemberAdded(callback?: (data: SocketEvents['member_added']) => void) {
    this.socket?.off('member_added', callback);
  }

  offMemberRemoved(callback?: (data: SocketEvents['member_removed']) => void) {
    this.socket?.off('member_removed', callback);
  }

  offMemberRoleChanged(callback?: (data: SocketEvents['member_role_changed']) => void) {
    this.socket?.off('member_role_changed', callback);
  }

  offClubUpdated(callback?: (data: SocketEvents['club_updated']) => void) {
    this.socket?.off('club_updated', callback);
  }

  offRecommendationAdded(callback?: (data: SocketEvents['recommendation_added']) => void) {
    this.socket?.off('recommendation_added', callback);
  }

  offRecommendationRemoved(callback?: (data: SocketEvents['recommendation_removed']) => void) {
    this.socket?.off('recommendation_removed', callback);
  }

  offNotification(callback?: (data: SocketEvents['notification']) => void) {
    this.socket?.off('notification', callback);
  }

  get connected() {
    return this.isConnected;
  }

  get socketId() {
    return this.socket?.id;
  }
}

// Create a singleton instance
export const socketManager = new SocketManager();
export default socketManager;
