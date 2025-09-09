import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserSettings,
  updateUserSettings,
  getCurrentUser,
  getCurrentUserSettings,
  updateCurrentUserSettings,
  banUser,
  unbanUser
} from '../controllers/userController';

const router = Router();

// Public route for getting all users (for login page)
router.get('/', getAllUsers);

// Apply authentication middleware to all other routes
router.use(authenticateUser);

// Current user routes (by email from header) - must come before /:id routes
router.get('/current', getCurrentUser);
router.get('/settings', getCurrentUserSettings);
router.put('/settings', updateCurrentUserSettings);

// User CRUD routes
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User ban/unban routes
router.post('/:id/ban', banUser);
router.post('/:id/unban', unbanUser);

// User settings routes
router.get('/:userId/settings', getUserSettings);
router.put('/:userId/settings', updateUserSettings);

export default router;
