import Location from '../models/Location.js';

export const getAllLocation = async (req, res) => {
  try {
    const locations = await Location.aggregate([
      {
        $sort: { time: -1 } // Sắp xếp theo thời gian giảm dần
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
          locations: { $slice: ['$locations', 5] } // Chỉ lấy 10 phần tử đầu tiên (mới nhất)
        }
      }
    ]);

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
