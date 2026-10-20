const mongoose = require("mongoose");

const navigationPathSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    fromNode: { type: mongoose.Schema.Types.ObjectId, ref: "NavigationNode", required: true },
    toNode: { type: mongoose.Schema.Types.ObjectId, ref: "NavigationNode", required: true },
    distance: { type: Number, required: true }, // "weight" used by Dijkstra in Phase 6
    pathType: {
      type: String,
      enum: ["walkway", "stairs", "lift", "escalator", "ramp"],
      default: "walkway",
    },
    isWheelchairAccessible: { type: Boolean, default: true }, // false for "stairs"
    instruction: { type: String, default: "Go straight" }, // "Turn left", "Take the lift"
  },
  { timestamps: true }
);

module.exports = mongoose.model("NavigationPath", navigationPathSchema);
