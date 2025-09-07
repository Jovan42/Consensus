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

    // Get notifications for the user by email
    const result = await NotificationService.getNotifications(req.user.email, pageNum, limitNum);

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

    // Get unread notifications for the user by email
    const notifications = await NotificationService.getUnreadNotifications(req.user.email);

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

    // Get unread count for the user by email
    const count = await NotificationService.getUnreadCount(req.user.email);

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

// Combined endpoint for unread notifications and count
export const getUnreadNotificationsWithCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get both unread notifications and count in one request
    const [notifications, count] = await Promise.all([
      NotificationService.getUnreadNotifications(req.user.email),
      NotificationService.getUnreadCount(req.user.email)
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        count
      }
    });
  } catch (error) {
    console.error('Error getting unread notifications with count:', error);
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

    // Mark notification as read for the user
    const notification = await NotificationService.markAsRead(notificationId, req.user.email);

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

    // Mark all notifications as read for the user
    await NotificationService.markAllAsRead(req.user.email);

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

    // Find the notification and verify ownership for the user
    const notification = await AppDataSource.getRepository(Notification).findOne({
      where: { 
        id: notificationId,
        userEmail: req.user.email
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

    // Delete all read notifications for the user
    const result = await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .where('userEmail = :userEmail', { userEmail: req.user.email })
      .andWhere('status = :status', { status: NotificationStatus.READ })
      .execute();

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
