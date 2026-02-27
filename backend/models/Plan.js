import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    ram: {
      type: Number, // MB
      required: true,
      min: 512,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: Number, // Days
      required: true,
      min: 1,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Plan", planSchema);