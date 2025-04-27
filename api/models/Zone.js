import mongoose from 'mongoose';
const ZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    type: {
      type: String,
      enum: ['Forbidden', 'Work']
    },
    locations: {
      type: Array
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);
export default mongoose.model('Zone', ZoneSchema);
