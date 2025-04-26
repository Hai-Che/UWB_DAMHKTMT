import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('Setting', SettingSchema);
