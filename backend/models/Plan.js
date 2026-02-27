const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    ram: { type: Number, required: true, min: 512 },
    maxPlayers: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Plan", planSchema);
