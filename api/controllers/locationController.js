import Location from "../models/Location.js";

export const getAllLocation = async (req, res) => {
  const locations = await Location.find();
  res.status(200).json(locations);
};
