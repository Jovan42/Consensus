import { Router } from 'express';
import { markCompletion, getCompletionsByRound, getCompletionStatus } from '../controllers/completionController';
import { validateDto } from '../middleware/validation.middleware';
import { MarkCompletionDto } from '../dto/completion.dto';

const router = Router();

// POST /api/rounds/:roundId/completions - Mark completion for a member
router.post('/:roundId/completions', validateDto(MarkCompletionDto), markCompletion);

// GET /api/rounds/:roundId/completions - Get all completions for a round
router.get('/:roundId/completions', getCompletionsByRound);

// GET /api/rounds/:roundId/completion-status - Get completion status summary
router.get('/:roundId/completion-status', getCompletionStatus);

export default router;
