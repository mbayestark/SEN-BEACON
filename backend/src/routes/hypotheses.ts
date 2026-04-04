import { Router } from 'express';
import {
  getAllHypotheses,
  getHypothesisById,
  evaluateHypothesis,
  getHypothesisStats
} from '../controllers/hypothesisController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getAllHypotheses);
router.get('/stats', requireAuth, getHypothesisStats);
router.get('/:id', requireAuth, getHypothesisById);
router.put('/:id/evaluate', requireAuth, evaluateHypothesis);

export default router;
