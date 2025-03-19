import { Router } from 'express';
import { checkIn } from '../controllers/attendance.controller';

const router = Router();

router.post('/check-in', checkIn);

export default router;
