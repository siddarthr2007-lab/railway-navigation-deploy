const Admin = require("../models/Admin");

// NOTE: For a beginner student project we compare passwords directly.
// In a production app you would hash passwords with bcrypt and use JWT tokens.
// This is intentionally kept simple — mention this as a "future improvement" in your viva.
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
