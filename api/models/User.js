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
      default: 'User'
    },
    deviceId: {
      type: mongoose.Types.ObjectId,
      ref: 'Device'
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
