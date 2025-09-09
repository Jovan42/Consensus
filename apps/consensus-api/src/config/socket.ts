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
  
  notification_created: {
    type: string;
    title: string;
    message: string;
    clubId: string;
    roundId?: string;
    notificationCount: number;
  };
  
  // Online status events
  user_online: {
    clubId: string;
    userId: string;
    userEmail: string;
    userName: string;
    timestamp: string;
  };
  
  user_offline: {
    clubId: string;
    userId: string;
    userEmail: string;
    userName: string;
    timestamp: string;
  };
}

export class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private clubMembers: Map<string, Set<string>> = new Map(); // clubId -> Set of userIds
  private userInfo: Map<string, { email: string; name: string; role: string }> = new Map(); // userId -> user info

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
      
      // Store user info
      this.userInfo.set(userId, {
        email: userEmail,
        name: this.getUserNameFromEmail(userEmail),
        role: userRole
      });

      // Join user to their clubs
      socket.on('join_clubs', (clubIds: string[]) => {
        console.log(`User ${userEmail} (${userId}) joining clubs:`, clubIds);
        clubIds.forEach(clubId => {
          socket.join(`club:${clubId}`);
          
          // Track club membership
          if (!this.clubMembers.has(clubId)) {
            this.clubMembers.set(clubId, new Set());
          }
          
          const wasAlreadyInClub = this.clubMembers.get(clubId)!.has(userId);
          this.clubMembers.get(clubId)!.add(userId);
          
          console.log(`Club ${clubId} now has members:`, Array.from(this.clubMembers.get(clubId)!));
          
          // Emit user_online event if this is a new connection to the club
          if (!wasAlreadyInClub) {
            const userName = this.getUserNameFromEmail(userEmail);
            this.io.to(`club:${clubId}`).emit('user_online', {
              clubId,
              userId,
              userEmail,
              userName,
              timestamp: new Date().toISOString()
            });
            console.log(`Emitted user_online event for ${userEmail} in club ${clubId}`);
          }
        });
        
        console.log(`User ${userEmail} joined clubs: ${clubIds.join(', ')}`);
      });

      // Leave clubs
      socket.on('leave_clubs', (clubIds: string[]) => {
        clubIds.forEach(clubId => {
          socket.leave(`club:${clubId}`);
          this.clubMembers.get(clubId)?.delete(userId);
          
          // Emit user_offline event
          const userName = this.getUserNameFromEmail(userEmail);
          this.io.to(`club:${clubId}`).emit('user_offline', {
            clubId,
            userId,
            userEmail,
            userName,
            timestamp: new Date().toISOString()
          });
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userEmail} disconnected`);
        
        // Remove socket from user's connections
        this.userSockets.get(userId)?.delete(socket.id);
        
        // If no more sockets for this user, remove from club memberships and emit offline events
        if (this.userSockets.get(userId)?.size === 0) {
          this.userSockets.delete(userId);
          const userInfo = this.userInfo.get(userId);
          const userName = userInfo?.name || this.getUserNameFromEmail(userEmail);
          
          this.clubMembers.forEach((members, clubId) => {
            if (members.has(userId)) {
              members.delete(userId);
              
              // Emit user_offline event
              this.io.to(`club:${clubId}`).emit('user_offline', {
                clubId,
                userId,
                userEmail,
                userName,
                timestamp: new Date().toISOString()
              });
            }
          });
          
          // Clean up user info
          this.userInfo.delete(userId);
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
    console.log(`SocketManager: Attempting to emit ${event} to user ${userId}`);
    console.log('SocketManager: Available user sockets:', Array.from(this.userSockets.keys()));
    console.log('SocketManager: User info map:', Array.from(this.userInfo.keys()));
    
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      console.log(`SocketManager: Found ${userSockets.size} sockets for user ${userId}:`, Array.from(userSockets));
      userSockets.forEach(socketId => {
        console.log(`SocketManager: Emitting ${event} to socket ${socketId}`);
        this.io.to(socketId).emit(event, data);
      });
    } else {
      console.log(`SocketManager: No sockets found for user ${userId}`);
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

  // Get online users for a specific club
  public getClubOnlineUsers(clubId: string): Array<{ userId: string; userEmail: string; userName: string }> {
    const onlineUsers: Array<{ userId: string; userEmail: string; userName: string }> = [];
    const clubMembers = this.clubMembers.get(clubId);
    
    console.log(`Getting online users for club ${clubId}`);
    console.log(`Club members:`, clubMembers ? Array.from(clubMembers) : 'No members');
    console.log(`All user sockets:`, Array.from(this.userSockets.keys()));
    console.log(`All user info:`, Array.from(this.userInfo.entries()));
    
    if (clubMembers) {
      clubMembers.forEach(userId => {
        // Check if user has active sockets
        if (this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0) {
          // Get user info from stored data
          const userInfo = this.userInfo.get(userId);
          if (userInfo) {
            onlineUsers.push({ 
              userId, 
              userEmail: userInfo.email, 
              userName: userInfo.name 
            });
          }
        }
      });
    }
    
    console.log(`Returning online users:`, onlineUsers);
    return onlineUsers;
  }

  // Get all online users across all clubs
  public getAllOnlineUsers(): Array<{ userId: string; userEmail: string; userName: string; clubs: string[] }> {
    const onlineUsers: Array<{ userId: string; userEmail: string; userName: string; clubs: string[] }> = [];
    
    this.userSockets.forEach((sockets, userId) => {
      if (sockets.size > 0) {
        const userInfo = this.userInfo.get(userId);
        if (userInfo) {
          const clubs: string[] = [];
          
          // Find which clubs this user is in
          this.clubMembers.forEach((members, clubId) => {
            if (members.has(userId)) {
              clubs.push(clubId);
            }
          });
          
          onlineUsers.push({ 
            userId, 
            userEmail: userInfo.email, 
            userName: userInfo.name, 
            clubs 
          });
        }
      }
    });
    
    return onlineUsers;
  }

  private getUserEmailFromId(userId: string): string {
    // Extract email from userId (assuming format: test-user-email@example.com)
    if (userId.startsWith('test-user-')) {
      return userId.replace('test-user-', '');
    }
    // For other formats, return a default
    return 'user@example.com';
  }

  private getUserNameFromEmail(email: string): string {
    // Extract name from email (simple implementation)
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

export default SocketManager;
