import { Router } from 'express';
import { checkIn, checkOut, getAll } from '../controllers/attendance.controller.js';

const router = Router();

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/', getAll);

export default router;
