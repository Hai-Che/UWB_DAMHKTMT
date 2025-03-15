import { Router } from 'express';
import {
  addDevice,
  deleteDeviceByMacAddress,
  getAllDevice,
  getAllTagDevice,
  getDeviceByMacAddress,
  updateDevice,
  updateDeviceLocation
} from '../controllers/deviceController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();

router.get('/', asyncHandler(getAllDevice));
router.get('/get-tags', asyncHandler(getAllTagDevice));
router.get('/:macAddress', asyncHandler(getDeviceByMacAddress));
router.put('/location', asyncHandler(updateDeviceLocation));
router.put('/', asyncHandler(updateDevice));
router.post('/', asyncHandler(addDevice));
router.delete('/:macAddress', asyncHandler(deleteDeviceByMacAddress));

export default router;
