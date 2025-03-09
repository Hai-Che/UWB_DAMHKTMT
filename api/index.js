import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import deviceRoute from './routes/device.js';
import locationRoute from './routes/location.js';
import http from 'http';
import bodyParser from 'body-parser';
import { Server as SocketIOServer } from 'socket.io';

import Device from './models/Device.js';
const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cors());
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

  socket.on('tag_data', (data) => {
    if (!data || !data.data || !data.data.Position) {
      console.error('Invalid tag data format:', data);
      return;
    }
    console.log('Tag Data:', data);
    const transferData = {
      location: {
        x: data.data.Position.X,
        y: data.data.Position.Y,
        z: data.data.Position.Z
      }
    };
    io.emit('updateData', transferData);
  });

  socket.on('enable_tracking', () => {
    io.emit('start_tracking');
    console.log('Bắt đầu tracking!');
  });

  socket.on('disable_tracking', () => {
    io.emit('stop_tracking');
    console.log('Dừng tracking!');
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
  });
});

app.use('/api/device', deviceRoute);
app.use('/api/location', locationRoute);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Node.js server!' });
});

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
