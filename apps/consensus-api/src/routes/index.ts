import { Router } from 'express';
import clubsRouter from './clubs';
import membersRouter from './members';

const router = Router();

// API routes
router.use('/clubs', clubsRouter);
router.use('/', membersRouter);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Consensus API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
