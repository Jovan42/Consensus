import { Router } from 'express';
import { getClubOnlineUsers, getAllOnlineUsers } from '../controllers/onlineStatusController';

const router = Router();

// GET /api/clubs/:clubId/online-users - Get online users for a specific club
router.get('/:clubId/online-users', getClubOnlineUsers);

// GET /api/online-users - Get all online users across all clubs
router.get('/', getAllOnlineUsers);

export default router;
