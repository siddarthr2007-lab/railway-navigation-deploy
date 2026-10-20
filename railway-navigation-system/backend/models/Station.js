const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    stationCode: { type: String, required: true, unique: true }, // e.g. "MAS"
    stationName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, default: "Tamil Nadu" },
    region: { type: String, default: "Tamil Nadu" }, // e.g. "Chennai & Northern TN", "Kongu & Western TN", "Central & Cauvery Delta", "Southern TN"
    division: { type: String, default: "" }, // e.g. "MAS", "SA", "TPJ", "MDU", "TVC"
    category: { type: String, default: "Major Junction" }, // e.g. "Terminal Hub", "Premier Junction", "Industrial Hub"
    description: { type: String, default: "" },
    totalPlatforms: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // admin can disable a station without deleting it
  },
  { timestamps: true }
);

module.exports = mongoose.model("Station", stationSchema);
