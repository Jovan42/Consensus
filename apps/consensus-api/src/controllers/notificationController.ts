import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notificationService';
import { AppDataSource } from '../config/database';
import { Member } from '../entities/Member';
import { Notification, NotificationStatus } from '../entities/Notification';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const result = await NotificationService.getNotifications(member.id, pageNum, limitNum);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUnreadNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const notifications = await NotificationService.getUnreadNotifications(member.id);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const count = await NotificationService.getUnreadCount(member.id);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
    }

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const notification = await NotificationService.markAsRead(notificationId, member.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await NotificationService.markAllAsRead(member.id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { notificationId } = req.params;

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Find the notification and verify ownership
    const notification = await AppDataSource.getRepository(Notification).findOne({
      where: { 
        id: notificationId,
        memberId: member.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Delete the notification
    await AppDataSource.getRepository(Notification).remove(notification);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAllRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's member record
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { email: req.user.email }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Delete all read notifications for this member
    const result = await AppDataSource.getRepository(Notification)
      .delete({
        memberId: member.id,
        status: NotificationStatus.READ
      });

    res.json({
      success: true,
      message: 'All read notifications deleted successfully',
      deletedCount: result.affected || 0
    });
  } catch (error) {
    console.error('Error deleting all read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};
