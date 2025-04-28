import { Router } from 'express';
import { createZone, getZoneUser, updateZoneUser, deleteZoneUser } from '../controllers/zone.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.post('/create', createZone);
router.get('/', verifyToken, getZoneUser);
router.post('/', verifyToken, updateZoneUser);
router.delete('/', verifyToken, deleteZoneUser);

export default router;
