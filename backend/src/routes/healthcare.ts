import { Router } from 'express';
import {
  registerFacility,
  getAllFacilities,
  getFacilityById,
  ingestHealthcareData,
  getHealthcareData,
  getCurrentCapacity
} from '../controllers/healthcareController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/facilities/register', registerFacility);
router.get('/facilities', requireAuth, getAllFacilities);
router.get('/facilities/:id', requireAuth, getFacilityById);

router.post('/data', ingestHealthcareData);
router.get('/data', requireAuth, getHealthcareData);
router.get('/data/current', requireAuth, getCurrentCapacity);

export default router;
