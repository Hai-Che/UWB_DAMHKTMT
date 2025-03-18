import Device from '../models/Device.js';
import Location from '../models/Location.js';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

function calculateDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

const width = 500;
const height = 500;
const chartCallback = (ChartJS) => {
  ChartJS.defaults.responsive = true;
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

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
    const distances = {};

    result.forEach((device) => {
      if (!device._id || !Array.isArray(device.locations)) {
        distances[device._id || 'unknown'] = 'Invalid data format';
        return;
      }

      let totalDistance = 0;
      for (let i = 1; i < device.locations.length; i++) {
        totalDistance += calculateDistance(device.locations[i - 1].location, device.locations[i].location);
      }

      distances[device._id] = Math.round(totalDistance * 100) / 100;
    });
    res.status(200).json({ result, distances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const exportExcel = async (req, res) => {
  try {
    const result = await Location.aggregate([
      {
        $sort: { time: -1 }
      },
      {
        $lookup: {
          from: 'devices', // Collection của DeviceSchema
          localField: 'macAddress',
          foreignField: 'macAddress',
          as: 'deviceInfo'
        }
      },
      {
        $unwind: '$deviceInfo'
      },
      {
        $match: {
          'deviceInfo.type': 'Tag'
        }
      },
      {
        $project: {
          macAddress: 1,
          location: 1,
          _id: 0
        }
      },
      {
        $group: {
          _id: '$macAddress',
          locations: {
            $push: {
              location: '$location'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          locations: { $slice: ['$locations', 500] }
        }
      }
    ]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Thư mục lưu file Excel
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Lưu danh sách file Excel
    let files = [];

    for (const device of result) {
      const mac = device._id.replace(/:/g, '-');
      const filePath = path.join(exportDir, `${mac}.xlsx`);

      files.push(filePath);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Location Data');

      // Tạo tiêu đề cột
      worksheet.columns = [
        { header: 'X', key: 'x', width: 10 },
        { header: 'Y', key: 'y', width: 10 },
        { header: 'Z', key: 'z', width: 10 }
      ];

      // Ghi dữ liệu vào file Excel
      device.locations.forEach((location) => {
        worksheet.addRow({
          x: location.location.x,
          y: location.location.y,
          z: location.location.z
        });
      });

      // Lưu file Excel
      await workbook.xlsx.writeFile(filePath);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const exportScatterPlot = async (req, res) => {
  try {
    const macAddress = req.body.macAddress;
    const result = await Location.aggregate([
      {
        $sort: { time: -1 }
      },
      {
        $lookup: {
          from: 'devices', // Collection của DeviceSchema
          localField: 'macAddress',
          foreignField: 'macAddress',
          as: 'deviceInfo'
        }
      },
      {
        $unwind: '$deviceInfo'
      },
      {
        $match: {
          'deviceInfo.type': 'Tag'
        }
      },
      {
        $project: {
          macAddress: 1,
          location: 1,
          _id: 0
        }
      },
      {
        $group: {
          _id: '$macAddress',
          locations: {
            $push: {
              location: '$location'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          locations: { $slice: ['$locations', 500] }
        }
      },
      {
        $match: { _id: { $eq: macAddress } }
      }
    ]);
    if (!result.length) {
      return res.status(404).json({ error: 'No data found for this macAddress' });
    }

    // Chuyển đổi dữ liệu để vẽ scatter plot
    const locations = result[0].locations;
    const xData = locations.map((loc) => loc.location.x);
    const yData = locations.map((loc) => loc.location.y);
    const configuration = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: `Scatter Plot - ${macAddress}`,
            data: xData.map((x, i) => ({ x: x, y: yData[i] })),
            backgroundColor: 'blue',
            pointRadius: 5
          }
        ]
      },
      options: {
        scales: {
          x: { min: -2, max: 15 },
          y: { min: -2, max: 15 }
        }
      }
    };

    // Render ảnh Scatter Plot
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Trả về ảnh PNG
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
