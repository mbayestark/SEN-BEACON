import { Router } from 'express';
import authRoutes from './auth';
import iotRoutes from './iot';
import healthcareRoutes from './healthcare';
import hypothesesRoutes from './hypotheses';
import analyticsRoutes from './analytics';
import publicRoutes from './public';

const router = Router();

router.use('/auth', authRoutes);
router.use('/iot', iotRoutes);
router.use('/healthcare', healthcareRoutes);
router.use('/hypotheses', hypothesesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/public', publicRoutes);

export default router;
