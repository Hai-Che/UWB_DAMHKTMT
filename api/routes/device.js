import { Router } from "express";
import { io } from "../index.js";
import Device from "../models/Device.js";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:name", async (req, res) => {
  try {
    const device = await Device.findOne({ name: req.params.name });
    res.status(200).json(device);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/location", async (req, res) => {
  try {
    const { name, location } = req.body;
    const device = await Device.findOneAndUpdate(
      { name },
      { location },
      { new: true }
    );
    io.emit("updateData", device);
    res.status(200).json({ message: "Update successfully!" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/", async (req, res) => {
  try {
    const { _id, ...others } = req.body;
    const othersArray = Object.entries(others);
    const filtered = othersArray.filter(([key, value]) => value !== "");
    const filteredOthers = Object.fromEntries(filtered);
    const device = await Device.findByIdAndUpdate(
      { _id },
      { ...filteredOthers },
      { new: true }
    );
    res.status(200).json(device);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const device = new Device(req.body);
    const newDevice = await device.save();
    res.status(200).json(newDevice);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/:name", async (req, res) => {
  try {
    await Device.findOneAndDelete({ name: req.params.name });
    res.status(200).json({ message: "Delete successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
export default router;
