import { Router } from 'express';
import clubsRouter from './clubs';
import membersRouter from './members';
import roundsRouter from './rounds';
import recommendationsRouter from './recommendations';
import votesRouter from './votes';
import completionsRouter from './completions';
import { startNewRound } from '../controllers/roundController';
import { addRecommendation, getRecommendationsByRound } from '../controllers/recommendationController';

const router = Router();

// API routes - order matters! More specific routes first
router.post('/clubs/:clubId/rounds', startNewRound); // Nested route for starting rounds
router.post('/rounds/:roundId/recommendations', addRecommendation); // Nested route for adding recommendations
router.get('/rounds/:roundId/recommendations', getRecommendationsByRound); // Nested route for getting recommendations
router.use('/clubs', clubsRouter);
router.use('/', membersRouter);
router.use('/rounds', roundsRouter);
router.use('/rounds', votesRouter); // Voting routes
router.use('/rounds', completionsRouter); // Completion routes
router.use('/recommendations', recommendationsRouter);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Consensus API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
