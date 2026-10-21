const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    preferredAccessibility: {
      type: Boolean,
      default: false, // Default route preference: wheelchair/step-free
    },
    savedStations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
