import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getUserSetting, updateUserSetting, uploadFileUserSetting } from '../controllers/setting.controller.js';
import { upload } from '../middleware/upload.js';
const router = Router();

router.get('/', verifyToken, getUserSetting);
router.post('/', verifyToken, updateUserSetting);
router.post('/upload-image', verifyToken, upload.single('image'), uploadFileUserSetting);

export default router;
