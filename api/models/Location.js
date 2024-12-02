import mongoose from "mongoose";
const LocationSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
    },
    x: {
      type: String,
      required: true,
    },
    y: {
      type: String,
      required: true,
    },
    z: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Location", LocationSchema);
