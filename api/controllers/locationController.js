import Location from '../models/Location.js';

export const getAllLocation = async (req, res) => {
  try {
    const locations = await Location.aggregate([
      {
        $group: {
          _id: '$macAddress',
          locations: {
            $push: {
              time: '$time',
              location: '$location'
            }
          }
        }
      }
    ]);

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
