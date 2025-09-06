import { Router } from 'express';
import {
  startNewRound,
  getRoundById,
  getClubRounds,
  updateRoundStatus,
  finishRound
} from '../controllers/roundController';

const router = Router();

// Round management routes
router.post('/', startNewRound); // Start new round
router.get('/:id', getRoundById); // Get round by ID
router.get('/club/:clubId', getClubRounds); // Get all rounds for a club
router.put('/:id/status', updateRoundStatus); // Update round status
router.post('/:roundId/finish', finishRound); // Finish round

export default router;
