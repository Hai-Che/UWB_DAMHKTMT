import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "Anchor",
      enum: ["Anchor", "Tag"],
    },
    location: {
      x: Number,
      y: Number,
      z: Number,
    },
    operation: String,
    status: {
      type: String,
      default: "available",
      enum: ["available", "connect"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Device", DeviceSchema);
