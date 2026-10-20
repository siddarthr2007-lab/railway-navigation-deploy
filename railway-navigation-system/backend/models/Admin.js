const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // will store a HASHED password, not plain text (Phase 8)
    email: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
