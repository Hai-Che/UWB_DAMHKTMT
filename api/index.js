import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import deviceRoute from './routes/device.js';
import locationRoute from './routes/location.js';
import authRoute from './routes/auth.js';
import userRoute from './routes/user.js';
import zoneRoute from './routes/zone.js';
import attendanceRoute from './routes/attendance.js';

import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';

import { Server as SocketIOServer } from 'socket.io';

import Device from './models/Device.js';
import Location from './models/Location.js';
import moment from 'moment';
const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
mongoose
  .connect('mongodb://127.0.0.1:27017/uwb')
  .then(() => {
    console.log('Connect database successfully');
  })
  .catch((err) => {
    console.log(err);
  });

io.on('connection', (socket) => {
  console.log('Gateway connected');

  socket.on('anchor_data', async (data) => {
    console.log('Received Anchor Data:', data);

    const { mac, data: locationData, operation_mode_data } = data;
    try {
      const timeNow = moment();
      await Location.create({
        time: timeNow.format('YYYY-MM-DD HH:mm:ss'),
        timestamp: {
          day: timeNow.format('YYYY-MM-DD'),
          week: timeNow.format('YYYY-WW'),
          month: timeNow.format('YYYY-MM'),
          year: timeNow.format('YYYY'),
          time: timeNow.format('HH:mm:ss')
        },
        macAddress: mac,
        location: {
          x: locationData.Position.X || 0,
          y: locationData.Position.Y || 0,
          z: locationData.Position.Z || 0
        }
      });
      await Device.findOneAndUpdate(
        { macAddress: mac },
        {
          location: {
            x: locationData.Position.X || 0,
            y: locationData.Position.Y || 0,
            z: locationData.Position.Z || 0
          },
          operationMode: operation_mode_data
        },
        { upsert: true, new: true }
      );

      console.log(`Updated location for device: ${mac}`);
    } catch (error) {
      console.error('Error updating device:', error);
    }
  });

  socket.on('tag_data', async (data) => {
    if (!data || !data.data || !data.data.Position) {
      console.error('Invalid tag data format:', data);
      return;
    }
    console.log('Tag Data:', data);
    const timeNow = moment();
    try {
      await Location.create({
        time: timeNow.format('YYYY-MM-DD HH:mm:ss'),
        timestamp: {
          day: timeNow.format('YYYY-MM-DD'),
          week: timeNow.format('YYYY-WW'),
          month: timeNow.format('YYYY-MM'),
          year: timeNow.format('YYYY'),
          time: timeNow.format('HH:mm:ss')
        },
        macAddress: data.mac,
        location: {
          x: data.data.Position.X || 0,
          y: data.data.Position.Y || 0,
          z: data.data.Position.Z || 0
        }
      });
    } catch (error) {
      console.error('Error updating device:', error);
    }
    const transferData = {
      location: {
        x: Math.round(data.data.Position.X * 10) / 10,
        y: Math.round(data.data.Position.Y * 10) / 10,
        z: Math.round(data.data.Position.Z * 10) / 10
      }
    };
    io.emit('updateData', { macAddress: data.mac, transferData });
  });

  socket.on('enable_tracking', () => {
    io.emit('start_tracking');
    console.log('Bắt đầu tracking!');
  });

  socket.on('disable_tracking', () => {
    io.emit('stop_tracking');
    console.log('Dừng tracking!');
  });
  socket.on('speaker-forbidden', async (data) => {
    io.emit('play_sound1', { msg: `Cảnh báo ${data.username} vào khu vực cấm`, level: 'urgent' });
  });
  socket.on('disconnect', () => {
    console.log('disconnect');
  });
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mocung9723@gmail.com',
    pass: process.env.NODEMAILER_APP_PASS
  }
});

app.post('/api/send-alert-email', async (req, res) => {
  const { location, email } = req.body;
  if (!location) return res.status(400).json({ message: 'Thiếu dữ liệu vị trí' });

  const mailOptions = {
    from: 'mocung9723@gmail.com',
    to: `${email}`,
    subject: 'Cảnh báo: Bạn đã tiến vào khu vực không được cho phép!',
    text: `Bạn đã vào khu vực không được cho phép tại tọa độ: x=${location.x}, y=${location.y}. Vui lòng rời khỏi khu vực này!`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email cảnh báo đã được gửi thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi email', error });
  }
});

app.post('/api/send-alert-emails', async (req, res) => {
  const { email } = req.body;
  const mailOptions = {
    from: 'mocung9723@gmail.com',
    to: `${email}`,
    subject: 'Cảnh báo: Trường hợp khẩn cấp, vui lòng rời khỏi khu vực làm việc!',
    text: `Trường hợp khẩn cấp, vui lòng rời khỏi khu vực làm việc!`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email cảnh báo đã được gửi thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi email', error });
  }
});

app.use('/api/auth', authRoute);
app.use('/api/device', deviceRoute);
app.use('/api/location', locationRoute);
app.use('/api/users', userRoute);
app.use('/api/zone', zoneRoute);
app.use('/api/attendance', attendanceRoute);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal server error'
  });
});
server.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Backend server is running!');
});
