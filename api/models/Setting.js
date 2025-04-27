import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null
    },
    scaleValue: { type: Number },
    scaleX: { type: Number },
    scaleY: { type: Number },
    mapImage: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Setting', SettingSchema);
