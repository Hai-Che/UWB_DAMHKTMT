import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    macAddress: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'Anchor',
      enum: ['Anchor', 'Tag']
    },
    location: {
      x: Number,
      y: Number,
      z: Number
    },
    operationMode: String,
    status: {
      type: String,
      default: 'active',
      enum: ['off', 'passive', 'active']
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ledStatus: {
      type: Boolean,
      default: false
    },
    isInitiator: {
      type: Boolean,
      default: false
    },
    nodeId: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Device', DeviceSchema);
