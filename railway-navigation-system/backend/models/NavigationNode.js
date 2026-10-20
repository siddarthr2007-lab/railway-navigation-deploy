const mongoose = require("mongoose");

const navigationNodeSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    nodeName: { type: String, required: true },   // "Entrance", "Junction-1", "Platform 5 Node"
    floor: { type: Number, default: 0 },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    isAccessible: { type: Boolean, default: true }, // false if this point itself is unreachable by wheelchair
  },
  { timestamps: true }
);

module.exports = mongoose.model("NavigationNode", navigationNodeSchema);
