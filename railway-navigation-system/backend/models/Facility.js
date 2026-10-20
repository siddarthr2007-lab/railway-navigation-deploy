const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    name: { type: String, required: true },        // "Platform 5", "Ticket Counter"
    type: {
      type: String,
      required: true,
      enum: [
        "platform", "ticket_counter", "waiting_hall", "restroom",
        "drinking_water", "food_canteen", "atm", "lift", "escalator",
        "stairs", "parking", "information_counter", "first_aid",
        "ramp", "entrance", "other",
      ],
    },
    floor: { type: Number, default: 0 },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    description: { type: String, default: "" },
    operatingHours: { type: String, default: "24 Hours" },
    wheelchairAccessible: { type: Boolean, default: false },
    liftAvailable: { type: Boolean, default: false },
    rampAvailable: { type: Boolean, default: false },
    navigationNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "NavigationNode" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);
