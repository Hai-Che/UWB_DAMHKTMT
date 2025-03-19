import mongoose from 'mongoose';
const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null
    },
    checkIn: {
      type: String,
      default: null
    },
    checkOut: {
      type: String,
      default: null
    },
    day: {
      type: String
    },
    workDuration: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['Present', 'Late']
    }
  },
  { timestamps: true }
);
export default mongoose.model('Attendance', AttendanceSchema);
