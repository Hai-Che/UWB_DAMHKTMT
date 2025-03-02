import Device from '../models/Device.js';
import { io } from '../index.js';

export const getAllDevice = async (req, res) => {
  const devices = await Device.find().lean();
  res.status(200).json(devices);
};

export const getDeviceByMacAddress = async (req, res) => {
  const device = await Device.findOne({ name: req.params.macAddress });
  res.status(200).json(device);
};

export const updateDeviceLocation = async (req, res) => {
  const { macAddress, location } = req.body;
  const device = await Device.findOneAndUpdate({ macAddress }, { location }, { new: true });
  // io.emit('updateData', device);
  res.status(200).json({ message: 'Update successfully!' });
};

export const updateDevice = async (req, res) => {
  try {
    const { _id, ...others } = req.body;
    const othersArray = Object.entries(others);
    const filtered = othersArray.filter(([key, value]) => value !== '');
    const filteredOthers = Object.fromEntries(filtered);
    const findDevice = await Device.findById(_id);
    let operationMode = findDevice.operationMode;
    if (filteredOthers.hasOwnProperty('ledStatus') && filteredOthers.ledStatus !== findDevice.ledStatus.toString()) {
      const ledBit = findDevice.ledStatus ? '0' : '1';
      operationMode = operationMode.substring(0, 5) + ledBit + operationMode.substring(6);
    }
    if (filteredOthers.ledStatus) {
      filteredOthers.ledStatus = filteredOthers.ledStatus === 'true';
    }
    if (filteredOthers.isInitiator) {
      filteredOthers.isInitiator = filteredOthers.isInitiator === 'true';
    }

    const device = await Device.findByIdAndUpdate({ _id }, { ...filteredOthers, operationMode }, { new: true });
    io.emit('updateOperationMode', { data: { macAddress: findDevice.macAddress, operationMode } });

    res.status(200).json(device);
  } catch (error) {
    console.error(error);
  }
};

export const addDevice = async (req, res) => {
  const parsedBody = {
    ...req.body,
    ledStatus: req.body.ledStatus === '1',
    isInitiator: req.body.isInitiator === '1'
  };
  const device = new Device(parsedBody);
  const newDevice = await device.save();
  res.status(200).json(newDevice);
};

export const deleteDeviceByMacAddress = async (req, res) => {
  await Device.findOneAndDelete({ macAddress: req.params.macAddress });
  res.status(200).json({ message: 'Delete successfully!' });
};
