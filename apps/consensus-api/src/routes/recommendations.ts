import { Router } from 'express';
import {
  addRecommendation,
  getRecommendationsByRound,
  getRecommendationById,
  updateRecommendation,
  deleteRecommendation,
  startVoting
} from '../controllers/recommendationController';
import { validateDto } from '../middleware/validation.middleware';
import { AddRecommendationDto, UpdateRecommendationDto } from '../dto/recommendation.dto';

const router = Router();

// Recommendation management routes
router.post('/', validateDto(AddRecommendationDto), addRecommendation); // Add new recommendation
router.get('/round/:roundId', getRecommendationsByRound); // Get recommendations by round
router.get('/:id', getRecommendationById); // Get recommendation by ID
router.put('/:id', validateDto(UpdateRecommendationDto), updateRecommendation); // Update recommendation
router.delete('/:id', deleteRecommendation); // Delete recommendation
router.post('/round/:roundId/start-voting', startVoting); // Start voting for round

export default router;
