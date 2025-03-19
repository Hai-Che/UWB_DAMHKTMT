import { Router } from 'express';
import { createZone, getAllZone } from '../controllers/zone.controller.js';

const router = Router();

router.post('/create', createZone);
router.get('/', getAllZone);

export default router;
