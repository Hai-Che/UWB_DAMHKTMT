import { Router } from "express";
import {
  addDevice,
  deleteDeviceByName,
  getAllDevice,
  getDeviceByName,
  updateDevice,
  updateDeviceLocation,
} from "../controllers/deviceController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = Router();

router.get("/", asyncHandler(getAllDevice));
router.get("/:name", asyncHandler(getDeviceByName));
router.put("/location", asyncHandler(updateDeviceLocation));
router.put("/", asyncHandler(updateDevice));
router.post("/", asyncHandler(addDevice));
router.delete("/:name", asyncHandler(deleteDeviceByName));

export default router;
