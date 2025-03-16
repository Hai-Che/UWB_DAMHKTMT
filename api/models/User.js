import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String
    },
    username: {
      type: String
    },
    password: {
      type: String
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      default: 'User',
      enum: ['User', 'Admin']
    },
    deviceId: {
      type: mongoose.Types.ObjectId,
      ref: 'Device',
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
