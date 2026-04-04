import { Router } from 'express';
import {
  registerDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  ingestMosquitoData,
  getMosquitoData,
  getMosquitoStats
} from '../controllers/iotController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/devices/register', registerDevice);
router.get('/devices', requireAuth, getAllDevices);
router.get('/devices/:id', requireAuth, getDeviceById);
router.put('/devices/:id', requireAuth, updateDevice);

router.post('/mosquito-data', ingestMosquitoData);
router.get('/mosquito-data', requireAuth, getMosquitoData);
router.get('/mosquito-data/stats', requireAuth, getMosquitoStats);

export default router;
