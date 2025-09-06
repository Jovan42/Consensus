import { Router } from 'express';
import {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub
} from '../controllers/clubController';

const router = Router();

// Club CRUD routes
router.post('/', createClub);
router.get('/', getAllClubs);
router.get('/:id', getClubById);
router.put('/:id', updateClub);
router.delete('/:id', deleteClub);

export default router;
