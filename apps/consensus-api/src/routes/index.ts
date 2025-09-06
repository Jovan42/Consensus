import { Router } from 'express';
import clubsRouter from './clubs';

const router = Router();

// API routes
router.use('/clubs', clubsRouter);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Consensus API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
