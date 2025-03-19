import Zone from '../models/Zone.js';

export const createZone = async (req, res) => {
  try {
    const { name, type, locations } = req.body;

    if (!Array.isArray(locations) || locations.length < 3) {
      return res.status(400).json({ message: 'Locations must have at least 3 points' });
    }

    const newZone = new Zone({ name, type, locations });
    await newZone.save();

    res.status(201).json({ message: 'Create zone successfully', zone: newZone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create zone' });
  }
};

export const getAllZone = async (req, res) => {
  try {
    const zones = await Zone.find().lean();
    res.status(200).json(zones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create zone' });
  }
};
