import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export interface AuthenticatedSocket extends SocketIOServer {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

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

export class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private clubMembers: Map<string, Set<string>> = new Map(); // clubId -> Set of userIds

  constructor(server: HTTPServer) {
    console.log('Initializing SocketManager...');
    console.log('Frontend URL:', process.env.FRONTEND_URL || "http://localhost:3000");
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    console.log('Socket.io server created');
    this.setupMiddleware();
    this.setupEventHandlers();
    console.log('SocketManager initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      console.log('Socket middleware - Token:', token);
      console.log('Socket middleware - Handshake auth:', socket.handshake.auth);
      
      if (!token) {
        console.log('Socket middleware - No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // TODO: Verify JWT token and extract user info
      // For now, we'll use a simple approach with the token
      try {
        // In a real implementation, you'd verify the JWT here
        // For now, we'll extract user info from the token
        const userInfo = this.extractUserFromToken(token);
        console.log('Socket middleware - Extracted user info:', userInfo);
        if (userInfo) {
          (socket as any).userId = userInfo.userId;
          (socket as any).userEmail = userInfo.email;
          (socket as any).userRole = userInfo.role;
          next();
        } else {
          console.log('Socket middleware - Invalid token');
          next(new Error('Authentication error: Invalid token'));
        }
      } catch (error) {
        console.log('Socket middleware - Token verification failed:', error);
        next(new Error('Authentication error: Token verification failed'));
      }
    });
  }

  private extractUserFromToken(token: string): { userId: string; email: string; role: string } | null {
    // Handle test tokens for development
    if (token.startsWith('test-token-')) {
      const email = token.replace('test-token-', '');
      return {
        userId: `test-user-${email}`,
        email: email,
        role: email.includes('admin') ? 'admin' : 'member'
      };
    }
    
    // TODO: Implement proper JWT verification for production
    // For now, return mock data for development
    return {
      userId: 'mock-user-id',
      email: 'user@example.com',
      role: 'member'
    };
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = (socket as any).userId;
      const userEmail = (socket as any).userEmail;
      const userRole = (socket as any).userRole;

      console.log(`User ${userEmail} (${userRole}) connected with socket ${socket.id}`);
      console.log('Socket handshake:', socket.handshake);

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user to their clubs
      socket.on('join_clubs', (clubIds: string[]) => {
        clubIds.forEach(clubId => {
          socket.join(`club:${clubId}`);
          
          // Track club membership
          if (!this.clubMembers.has(clubId)) {
            this.clubMembers.set(clubId, new Set());
          }
          this.clubMembers.get(clubId)!.add(userId);
        });
        
        console.log(`User ${userEmail} joined clubs: ${clubIds.join(', ')}`);
      });

      // Leave clubs
      socket.on('leave_clubs', (clubIds: string[]) => {
        clubIds.forEach(clubId => {
          socket.leave(`club:${clubId}`);
          this.clubMembers.get(clubId)?.delete(userId);
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userEmail} disconnected`);
        
        // Remove socket from user's connections
        this.userSockets.get(userId)?.delete(socket.id);
        
        // If no more sockets for this user, remove from club memberships
        if (this.userSockets.get(userId)?.size === 0) {
          this.userSockets.delete(userId);
          this.clubMembers.forEach((members, clubId) => {
            members.delete(userId);
          });
        }
      });
    });
  }

  // Emit events to specific clubs
  public emitToClub<T extends keyof SocketEvents>(
    clubId: string, 
    event: T, 
    data: SocketEvents[T]
  ) {
    this.io.to(`club:${clubId}`).emit(event, data);
  }

  // Emit events to specific users
  public emitToUser<T extends keyof SocketEvents>(
    userId: string, 
    event: T, 
    data: SocketEvents[T]
  ) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  // Emit events to club managers only
  public emitToClubManagers<T extends keyof SocketEvents>(
    clubId: string, 
    event: T, 
    data: SocketEvents[T]
  ) {
    // TODO: Implement manager-only notifications
    // For now, emit to all club members
    this.emitToClub(clubId, event, data);
  }

  // Emit events to all connected users
  public emitToAll<T extends keyof SocketEvents>(
    event: T, 
    data: SocketEvents[T]
  ) {
    this.io.emit(event, data);
  }

  // Get connected users count for a club
  public getClubConnectedUsers(clubId: string): number {
    return this.clubMembers.get(clubId)?.size || 0;
  }

  // Get total connected users
  public getTotalConnectedUsers(): number {
    return this.userSockets.size;
  }
}

export default SocketManager;
