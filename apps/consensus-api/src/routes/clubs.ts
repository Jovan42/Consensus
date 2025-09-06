import { Router } from 'express';
import {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub
} from '../controllers/clubController';
import { validateDto } from '../middleware/validation.middleware';
import { CreateClubDto, UpdateClubDto } from '../dto/club.dto';

const router = Router();

// Club CRUD routes
router.post('/', validateDto(CreateClubDto), createClub);
router.get('/', getAllClubs);
router.get('/:id', getClubById);
router.put('/:id', validateDto(UpdateClubDto), updateClub);
router.delete('/:id', deleteClub);

export default router;
