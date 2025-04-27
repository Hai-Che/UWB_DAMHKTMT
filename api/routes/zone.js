import { Router } from 'express';
import { createZone, getZoneUser, updateZoneUser } from '../controllers/zone.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.post('/create', createZone);
router.get('/', verifyToken, getZoneUser);
router.post('/', verifyToken, updateZoneUser);

export default router;
