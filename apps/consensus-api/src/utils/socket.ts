import { Request } from 'express';
import SocketManager from '../config/socket';

export function getSocketManager(req: Request): SocketManager {
  return req.app.get('socketManager');
}

export function emitVoteCast(
  socketManager: SocketManager,
  clubId: string,
  roundId: string,
  memberId: string,
  memberName: string,
  recommendationId: string,
  points: number
) {
  socketManager.emitToClub(clubId, 'vote_cast', {
    clubId,
    roundId,
    memberId,
    memberName,
    recommendationId,
    points
  });
}

export function emitCompletionUpdated(
  socketManager: SocketManager,
  clubId: string,
  roundId: string,
  memberId: string,
  memberName: string,
  completed: boolean
) {
  socketManager.emitToClub(clubId, 'completion_updated', {
    clubId,
    roundId,
    memberId,
    memberName,
    completed
  });
}

export function emitRoundStatusChanged(
  socketManager: SocketManager,
  clubId: string,
  roundId: string,
  status: 'active' | 'voting' | 'completed',
  winnerId?: string,
  winnerTitle?: string
) {
  socketManager.emitToClub(clubId, 'round_status_changed', {
    clubId,
    roundId,
    status,
    winnerId,
    winnerTitle
  });
}

export function emitTurnChanged(
  socketManager: SocketManager,
  clubId: string,
  roundId: string,
  newRecommenderId: string,
  newRecommenderName: string,
  previousRecommenderId?: string,
  previousRecommenderName?: string
) {
  socketManager.emitToClub(clubId, 'turn_changed', {
    clubId,
    roundId,
    newRecommenderId,
    newRecommenderName,
    previousRecommenderId,
    previousRecommenderName
  });
}

export function emitMemberAdded(
  socketManager: SocketManager,
  clubId: string,
  memberId: string,
  memberName: string,
  memberEmail: string,
  role: 'member' | 'manager'
) {
  socketManager.emitToClub(clubId, 'member_added', {
    clubId,
    memberId,
    memberName,
    memberEmail,
    role
  });
}

export function emitMemberRemoved(
  socketManager: SocketManager,
  clubId: string,
  memberId: string,
  memberName: string
) {
  socketManager.emitToClub(clubId, 'member_removed', {
    clubId,
    memberId,
    memberName
  });
}

export function emitMemberRoleChanged(
  socketManager: SocketManager,
  clubId: string,
  memberId: string,
  memberName: string,
  oldRole: 'member' | 'manager',
  newRole: 'member' | 'manager'
) {
  socketManager.emitToClub(clubId, 'member_role_changed', {
    clubId,
    memberId,
    memberName,
    oldRole,
    newRole
  });
}

export function emitClubUpdated(
  socketManager: SocketManager,
  clubId: string,
  changes: {
    name?: string;
    description?: string;
    type?: string;
    settings?: any;
  }
) {
  socketManager.emitToClub(clubId, 'club_updated', {
    clubId,
    changes
  });
}

export function emitRecommendationAdded(
  socketManager: SocketManager,
  clubId: string,
  roundId: string,
  recommendationId: string,
  title: string,
  description: string,
  recommenderId: string,
  recommenderName: string
) {
  socketManager.emitToClub(clubId, 'recommendation_added', {
    clubId,
    roundId,
    recommendationId,
    title,
    description,
    recommenderId,
    recommenderName
  });
}

export function emitRecommendationRemoved(
  socketManager: SocketManager,
  clubId: string,
  roundId: string,
  recommendationId: string,
  title: string
) {
  socketManager.emitToClub(clubId, 'recommendation_removed', {
    clubId,
    roundId,
    recommendationId,
    title
  });
}

export function emitNotification(
  socketManager: SocketManager,
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  clubId?: string,
  roundId?: string
) {
  const notification = {
    type,
    title,
    message,
    clubId,
    roundId,
    timestamp: new Date().toISOString()
  };

  if (clubId) {
    socketManager.emitToClub(clubId, 'notification', notification);
  } else {
    socketManager.emitToAll('notification', notification);
  }
}
