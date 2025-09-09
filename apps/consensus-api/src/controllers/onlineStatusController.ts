import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Member } from '../entities/Member';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getSocketManager } from '../utils/socket';

export const getClubOnlineUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clubId } = req.params;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    // Get socket manager from request
    const socketManager = getSocketManager(req);
    
    // Get online users for the club
    const onlineUsers = socketManager.getClubOnlineUsers(clubId);
    console.log(`Online users for club ${clubId}:`, onlineUsers);

    // Get member information from database to get proper names
    const memberRepository = AppDataSource.getRepository(Member);
    const members = await memberRepository.find({
      where: { clubId },
      select: ['id', 'name', 'email']
    });
    console.log(`Members in club ${clubId}:`, members);

    // Map online users with proper member names
    const enrichedOnlineUsers = onlineUsers.map(onlineUser => {
      const member = members.find(m => m.email === onlineUser.userEmail);
      return {
        ...onlineUser,
        userName: member?.name || onlineUser.userName
      };
    });

    res.json({
      success: true,
      data: {
        clubId,
        onlineUsers: enrichedOnlineUsers,
        count: enrichedOnlineUsers.length
      }
    });
  } catch (error) {
    console.error('Error getting club online users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllOnlineUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get socket manager from request
    const socketManager = getSocketManager(req);
    
    // Get all online users
    const onlineUsers = socketManager.getAllOnlineUsers();

    res.json({
      success: true,
      data: {
        onlineUsers,
        totalCount: onlineUsers.length
      }
    });
  } catch (error) {
    console.error('Error getting all online users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
