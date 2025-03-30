import { Router } from 'express';
import {
  addDevice,
  anchorSetUp,
  deleteDeviceByMacAddress,
  getAllAnchorDevice,
  getAllDevice,
  getAllTagDevice,
  getDeviceByMacAddress,
  updateDevice,
  updateDeviceLocation
} from '../controllers/deviceController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = Router();

router.get('/', asyncHandler(getAllDevice));
router.get('/get-tags', asyncHandler(getAllTagDevice));
router.get('/get-anchors', asyncHandler(getAllAnchorDevice));
router.get('/:macAddress', asyncHandler(getDeviceByMacAddress));
router.put('/location', asyncHandler(updateDeviceLocation));
router.put('/', verifyToken, asyncHandler(updateDevice));
router.post('/', verifyToken, asyncHandler(addDevice));
router.delete('/:macAddress', verifyToken, asyncHandler(deleteDeviceByMacAddress));
router.post('/anchor-setup', verifyToken, asyncHandler(anchorSetUp));

export default router;
