import { Router } from 'express';
import clubsRouter from './clubs';
import membersRouter from './members';
import roundsRouter from './rounds';
import recommendationsRouter from './recommendations';
import votesRouter from './votes';
import completionsRouter from './completions';
import memberNoteRouter from './memberNoteRoutes';
import notificationRouter from './notificationRoutes';
import onlineStatusRouter from './onlineStatus';
import userRouter from './userRoutes';
import { startNewRound, getClubRounds } from '../controllers/roundController';
import { addRecommendation, getRecommendationsByRound } from '../controllers/recommendationController';
import { validateDto } from '../middleware/validation.middleware';
import { StartRoundDto } from '../dto/round.dto';
import { AddRecommendationDto } from '../dto/recommendation.dto';

const router = Router();

// API routes - order matters! More specific routes first
router.post('/clubs/:clubId/rounds', validateDto(StartRoundDto), startNewRound); // Nested route for starting rounds
router.get('/clubs/:clubId/rounds', getClubRounds); // Nested route for getting club rounds
router.post('/rounds/:roundId/recommendations', validateDto(AddRecommendationDto), addRecommendation); // Nested route for adding recommendations
router.get('/rounds/:roundId/recommendations', getRecommendationsByRound); // Nested route for getting recommendations
router.use('/clubs', clubsRouter);
router.use('/', membersRouter);
router.use('/rounds', roundsRouter);
router.use('/rounds', votesRouter); // Voting routes
router.use('/rounds', completionsRouter); // Completion routes
router.use('/recommendations', recommendationsRouter);
router.use('/member-notes', memberNoteRouter); // Member notes routes
router.use('/notifications', notificationRouter); // Notification routes
router.use('/clubs', onlineStatusRouter); // Online status routes (nested under clubs)
router.use('/users', userRouter); // User management routes

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    success: true,
    message: 'Consensus API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
