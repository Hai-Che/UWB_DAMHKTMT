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
    const timeNow = moment();
    const lateTime = moment().startOf('day').add(8, 'hours');
    const checkAttendance = await Attendance.findOne({ userId: checkUser, day: nowDay });
    if (checkAttendance) {
      return res.status(204).json({ message: 'Người dùng đã check in' });
    }
    const diffMinutes = timeNow.diff(lateTime, 'minutes');
    const diffHours = Math.floor(Math.abs(diffMinutes) / 60);
    const remainingMinutes = Math.abs(diffMinutes) % 60;

    let status, message;
    if (diffMinutes > 0) {
      status = 'Late';
      message = `${username} đã check in trễ ${diffHours > 0 ? `${diffHours} giờ ${remainingMinutes} phút` : `${diffMinutes} phút`}!`;
    } else {
      status = 'Present';
      message = `${username} đã check in sớm ${diffHours > 0 ? `${diffHours} giờ ${remainingMinutes} phút` : `${Math.abs(diffMinutes)} phút`}!`;
    }
    const newAttendance = new Attendance({
      userId: checkUser._id,
      day: nowDay,
      checkIn: timeNow.format('YYYY-MM-DD HH:mm:ss'),
      status: status
    });
    await newAttendance.save();

    res.status(200).json({ message, checkInTime: timeNow.format('YYYY-MM-DD HH:mm:ss'), status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check in' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { username, email } = req.body;
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    const nowDay = moment().format('YYYY-MM-DD');
    const timeNow = moment();
    const minCheckOutTime = moment().startOf('day').add(17, 'hours');

    const attendance = await Attendance.findOne({ userId: checkUser._id, day: nowDay });
    if (!attendance) {
      return res.status(400).json({ message: 'Bạn chưa check in, không thể check out!' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Bạn đã check out trước đó!' });
    }
    if (timeNow.isBefore(minCheckOutTime)) {
      return res.status(400).json({ message: `Chỉ có thể check out sau 17:00!` });
    }

    const workDuration = timeNow.diff(moment(attendance.checkIn, 'YYYY-MM-DD HH:mm:ss'), 'minutes');

    attendance.checkOut = timeNow.format('YYYY-MM-DD HH:mm:ss');
    attendance.workDuration = workDuration;
    await attendance.save();

    res.status(200).json({
      message: `${username} đã check out thành công.`,
      checkOutTime: attendance.checkOut
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to check out' });
  }
};
