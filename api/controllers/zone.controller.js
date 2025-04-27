import Zone from '../models/Zone.js';

function sortPointsToFormPolygon(points) {
  if (!Array.isArray(points) || points.length < 3) {
    console.warn('Dữ liệu không hợp lệ:', points);
    return [];
  }

  // Tính trọng tâm (center)
  const center = points.reduce(
    (acc, p) => ({
      x: acc.x + p.x / points.length,
      y: acc.y + p.y / points.length
    }),
    { x: 0, y: 0 }
  );

  // Sắp xếp theo góc so với trọng tâm
  points.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });

  return points;
}

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

export const getZoneUser = async (req, res) => {
  const userId = req.userId;
  try {
    const zone = await Zone.findOne({ userId }).lean();
    if (!zone) {
      return res.status(200).json({});
    }
    zone.locations = sortPointsToFormPolygon(zone.locations);
    return res.status(200).json(zone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get zone' });
  }
};

export const updateZoneUser = async (req, res) => {
  const userId = req.userId;
  try {
    let zone = await Zone.findOne({ userId });
    if (!zone) {
      zone = new Zone({
        userId,
        locations: req.body.locations
      });
      await zone.save();
      return res.status(200).json(zone);
    }
    zone.locations = req.body.locations;
    await zone.save();
    return res.status(200).json(zone);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to get zone' });
  }
};
