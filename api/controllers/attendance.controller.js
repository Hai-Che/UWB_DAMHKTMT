import Zone from '../models/Zone.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import moment from 'moment';

export const checkIn = async (req, res) => {
  try {
    const { username, email } = req.body;
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }
    const nowDay = moment().format('YYYY-MM-DD');
    const timeNow = moment().format('YYYY-MM-DD HH:mm:ss');
    const lateTime = moment().startOf('day').add(8, 'hours');
    const checkAttendance = await Attendance.findOne({ userId: checkUser, day: nowDay });
    if (checkAttendance) {
      return res.status(204).json({ message: 'Người dùng đã check in' });
    }
    const diffMinutes = timeNow.diff(lateTime, 'minutes');

    let status, message;
    if (diffMinutes > 0) {
      status = 'Late';
      message = `${username} đã check in trễ ${diffMinutes} phút!`;
    } else {
      status = 'Present';
      message = `${username} đã check in sớm ${Math.abs(diffMinutes)} phút!`;
    }
    const newAttendance = new Attendance({
      userId: checkUser._id,
      day: nowDay,
      checkIn: timeNow,
      status: status
    });
    await newAttendance.save();

    res.status(200).json({ message: `${username} đã check in thành công` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create zone' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const zones = await Zone.find().lean();
    res.status(200).json(zones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create zone' });
  }
};
