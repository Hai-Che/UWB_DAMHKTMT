import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAllLocation } from "../controllers/locationController.js";
const router = Router();
router.get("/", asyncHandler(getAllLocation));

export default router;
