import Device from '../models/Device.js';
import Location from '../models/Location.js';

export const getAllLocation = async (req, res) => {
  try {
    const locations = await Location.aggregate([
      {
        $sort: { time: -1 }
      },
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
      },
      {
        $project: {
          _id: 1,
          locations: { $slice: ['$locations', 10] }
        }
      }
    ]);
    const filteredLocations = await Promise.all(
      locations.map(async (loc) => {
        const device = await Device.findOne({ macAddress: loc._id });
        return device && device.type === 'Tag' ? loc : null;
      })
    );

    const result = filteredLocations.filter(Boolean);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
