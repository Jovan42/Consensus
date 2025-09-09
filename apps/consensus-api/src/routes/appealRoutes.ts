import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { 
  createAppeal, 
  getMyAppeal, 
  getAllAppeals, 
  updateAppealStatus, 
  deleteAppeal 
} from '../controllers/appealController';

const router = Router();

// Public routes (for banned users)
router.post('/', authenticateUser, createAppeal);
router.get('/my', authenticateUser, getMyAppeal);

// Admin routes
router.get('/all', authenticateUser, getAllAppeals);
router.patch('/:id/status', authenticateUser, updateAppealStatus);
router.delete('/user/:userId', authenticateUser, deleteAppeal);

export default router;
