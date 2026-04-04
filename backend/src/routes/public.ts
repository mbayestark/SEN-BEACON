import { Router } from 'express';
import {
  checkRisk,
  findNearestFacilities
} from '../controllers/publicController';

const router = Router();

router.get('/risk-check', checkRisk);
router.get('/healthcare/nearest', findNearestFacilities);

export default router;
