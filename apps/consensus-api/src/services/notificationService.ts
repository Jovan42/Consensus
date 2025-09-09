import { AppDataSource } from '../config/database';
import { Notification, NotificationType, NotificationStatus } from '../entities/Notification';
import { Member } from '../entities/Member';
import { Club } from '../entities/Club';
import { Round } from '../entities/Round';
import { getSocketManager } from '../utils/socket';
import { Request } from 'express';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  clubId: string;
  roundId?: string;
  userEmail?: string; // If not provided, will notify all club members
}

export class NotificationService {
  /**
   * Create and save a notification for a specific user
   */
  static async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = new Notification();
    notification.type = data.type;
    notification.title = data.title;
    notification.message = data.message;
    notification.data = data.data || {};
    notification.userEmail = data.userEmail!;
    notification.clubId = data.clubId;
    notification.roundId = data.roundId || null;
    notification.status = NotificationStatus.UNREAD;

    return await AppDataSource.getRepository(Notification).save(notification);
  }

  /**
   * Create notifications for all members in a club
   */
  static async createClubNotification(data: Omit<CreateNotificationData, 'userEmail'>): Promise<Notification[]> {
    const members = await AppDataSource.getRepository(Member).find({
      where: { clubId: data.clubId }
    });

    const notifications: Notification[] = [];
    
    for (const member of members) {
      const notification = new Notification();
      notification.type = data.type;
      notification.title = data.title;
      notification.message = data.message;
      notification.data = data.data || {};
      notification.userEmail = member.email;
      notification.clubId = data.clubId;
      notification.roundId = data.roundId || null;
      notification.status = NotificationStatus.UNREAD;

      const savedNotification = await AppDataSource.getRepository(Notification).save(notification);
      notifications.push(savedNotification);
    }

    return notifications;
  }

  /**
   * Create notification and emit real-time event
   */
  static async createAndEmitNotification(
    req: Request,
    data: CreateNotificationData
  ): Promise<Notification> {
    const notification = await this.createNotification(data);
    
    // Emit real-time notification to the specific user
    const socketManager = getSocketManager(req);
    
    // Convert email to userId format that socket manager expects
    const userId = `test-user-${data.userEmail}`;
    
    console.log('NotificationService: Creating and emitting notification:', {
      userId,
      userEmail: data.userEmail,
      type: data.type,
      title: data.title
    });
    
    socketManager.emitToUser(userId, 'notification_created', {
      type: data.type,
      title: data.title,
      message: data.message,
      clubId: data.clubId,
      roundId: data.roundId,
      notificationCount: 1
    });

    console.log('NotificationService: Notification emitted successfully');

    return notification;
  }

  /**
   * Create club-wide notification and emit real-time event
   */
  static async createAndEmitClubNotification(
    req: Request,
    data: Omit<CreateNotificationData, 'userEmail'>
  ): Promise<Notification[]> {
    const notifications = await this.createClubNotification(data);
    
    // Emit a specific event for database notifications being created
    const socketManager = getSocketManager(req);
    socketManager.emitToClub(data.clubId, 'notification_created', {
      type: data.type,
      title: data.title,
      message: data.message,
      clubId: data.clubId,
      roundId: data.roundId,
      notificationCount: notifications.length
    });

    return notifications;
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnreadNotifications(userEmail: string): Promise<Notification[]> {
    return await AppDataSource.getRepository(Notification)
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.club', 'club')
      .leftJoinAndSelect('notification.round', 'round')
      .where('notification.userEmail = :userEmail', { userEmail })
      .andWhere('notification.status = :status', { status: NotificationStatus.UNREAD })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }


  /**
   * Get all notifications for a user (with pagination)
   */
  static async getNotifications(
    userEmail: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [notifications, total] = await AppDataSource.getRepository(Notification)
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.club', 'club')
      .leftJoinAndSelect('notification.round', 'round')
      .where('notification.userEmail = :userEmail', { userEmail })
      .orderBy('notification.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      notifications,
      total,
      hasMore: offset + notifications.length < total
    };
  }


  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userEmail: string): Promise<Notification | null> {
    const notification = await AppDataSource.getRepository(Notification).findOne({
      where: { id: notificationId, userEmail }
    });

    if (!notification) {
      return null;
    }

    notification.status = NotificationStatus.READ;
    return await AppDataSource.getRepository(Notification).save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userEmail: string): Promise<void> {
    await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .update(Notification)
      .set({ status: NotificationStatus.READ })
      .where('userEmail = :userEmail', { userEmail })
      .andWhere('status = :status', { status: NotificationStatus.UNREAD })
      .execute();
  }


  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userEmail: string): Promise<number> {
    return await AppDataSource.getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.userEmail = :userEmail', { userEmail })
      .andWhere('notification.status = :status', { status: NotificationStatus.UNREAD })
      .getCount();
  }


  /**
   * Delete old notifications (cleanup)
   */
  static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await AppDataSource.getRepository(Notification)
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
