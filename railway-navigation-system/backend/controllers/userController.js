const User = require("../models/User");
const Station = require("../models/Station");

// Helper to sanitize user object for client
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  preferredAccessibility: Boolean(user.preferredAccessibility),
  savedStations: user.savedStations || [],
  createdAt: user.createdAt,
});

// Register new passenger / user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, preferredAccessibility } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(), // Note: Keeping consistent with beginner academic structure in adminController
      phone: phone ? phone.trim() : "",
      preferredAccessibility: Boolean(preferredAccessibility),
      savedStations: [],
    });

    res.status(201).json({
      message: "Account created successfully",
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create account" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Support logging in with email or username if name matches
    const user = await User.findOne({
      $or: [{ email: cleanEmail }, { name: email.trim() }],
    }).populate("savedStations");

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed" });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("savedStations");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, preferredAccessibility } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (preferredAccessibility !== undefined) updates.preferredAccessibility = Boolean(preferredAccessibility);

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("savedStations");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle station in user's saved stations
exports.toggleFavoriteStation = async (req, res) => {
  try {
    const { userId, stationId } = req.body;
    if (!userId || !stationId) {
      return res.status(400).json({ message: "userId and stationId are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    const index = user.savedStations.findIndex((id) => id.toString() === stationId.toString());
    let isFavorited = false;

    if (index > -1) {
      user.savedStations.splice(index, 1);
      isFavorited = false;
    } else {
      user.savedStations.push(stationId);
      isFavorited = true;
    }

    await user.save();
    await user.populate("savedStations");

    res.json({
      message: isFavorited ? "Added to saved stations" : "Removed from saved stations",
      isFavorited,
      savedStations: user.savedStations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get favorite stations of user
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("savedStations");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.savedStations || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
