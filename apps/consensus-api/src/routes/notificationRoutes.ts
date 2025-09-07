import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getUnreadNotificationsWithCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticateUser);

// GET /api/notifications - Get all notifications for user (with pagination)
router.get('/', getNotifications);

// GET /api/notifications/unread - Get unread notifications for user
router.get('/unread', getUnreadNotifications);

// GET /api/notifications/unread/count - Get unread notification count
router.get('/unread/count', getUnreadCount);

// GET /api/notifications/unread/combined - Get unread notifications and count in one request
router.get('/unread/combined', getUnreadNotificationsWithCount);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// DELETE /api/notifications/delete-read - Delete all read notifications (must come before /:notificationId)
router.delete('/delete-read', deleteAllRead);

// PUT /api/notifications/:notificationId/read - Mark specific notification as read
router.put('/:notificationId/read', markAsRead);

// DELETE /api/notifications/:notificationId - Delete specific notification
router.delete('/:notificationId', deleteNotification);

export default router;
