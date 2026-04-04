import { Router } from 'express';
import {
  getRiskZones,
  getRiskMap,
  getTrends,
  getDiseases,
  getDiseaseRisk,
  getDiseaseHotspots,
  getOvercrowdedFacilities,
  getUnderutilizedFacilities,
  getRecommendations
} from '../controllers/analyticsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/risk-zones', requireAuth, getRiskZones);
router.get('/risk-map', requireAuth, getRiskMap);
router.get('/trends', requireAuth, getTrends);

router.get('/diseases', requireAuth, getDiseases);
router.get('/diseases/:id/risk', requireAuth, getDiseaseRisk);
router.get('/diseases/:id/hotspots', requireAuth, getDiseaseHotspots);

router.get('/healthcare/overcrowded', requireAuth, getOvercrowdedFacilities);
router.get('/healthcare/underutilized', requireAuth, getUnderutilizedFacilities);
router.get('/healthcare/recommendations', requireAuth, getRecommendations);

export default router;
