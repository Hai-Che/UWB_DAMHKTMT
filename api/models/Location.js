import mongoose from 'mongoose';
const LocationSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true
    },
    macAddress: {
      type: String
    },
    location: {
      x: Number,
      y: Number,
      z: Number
    }
  },
  { timestamps: true }
);
export default mongoose.model('Location', LocationSchema);
