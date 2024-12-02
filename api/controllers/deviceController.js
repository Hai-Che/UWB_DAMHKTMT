import Device from "../models/Device.js";
import { io } from "../index.js";

export const getAllDevice = async (req, res) => {
  const devices = await Device.find();
  res.status(200).json(devices);
};

export const getDeviceByName = async (req, res) => {
  const device = await Device.findOne({ name: req.params.name });
  res.status(200).json(device);
};

export const updateDeviceLocation = async (req, res) => {
  const { name, location } = req.body;
  const device = await Device.findOneAndUpdate(
    { name },
    { location },
    { new: true }
  );
  io.emit("updateData", device);
  res.status(200).json({ message: "Update successfully!" });
};

export const updateDevice = async (req, res) => {
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
};

export const addDevice = async (req, res) => {
  const device = new Device(req.body);
  const newDevice = await device.save();
  res.status(200).json(newDevice);
};

export const deleteDeviceByName = async (req, res) => {
  await Device.findOneAndDelete({ name: req.params.name });
  res.status(200).json({ message: "Delete successfully!" });
};
