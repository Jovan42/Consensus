import { Router } from 'express';
import { submitVotes, closeVoting, getVotesByRound } from '../controllers/voteController';

const router = Router();

// POST /api/rounds/:roundId/votes - Submit votes for a round
router.post('/:roundId/votes', submitVotes);

// POST /api/rounds/:roundId/close-voting - Close voting and determine winner
router.post('/:roundId/close-voting', closeVoting);

// GET /api/rounds/:roundId/votes - Get all votes for a round
router.get('/:roundId/votes', getVotesByRound);

export default router;
