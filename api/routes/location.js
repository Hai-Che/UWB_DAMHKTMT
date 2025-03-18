import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { exportExcel, getAllLocation, exportScatterPlot } from '../controllers/locationController.js';
const router = Router();

router.post('/export-excel', asyncHandler(exportExcel));
router.post('/export-scatter-plot', asyncHandler(exportScatterPlot));
router.get('/', asyncHandler(getAllLocation));
export default router;
