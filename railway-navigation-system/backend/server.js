require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const stationRoutes = require("./routes/stationRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const navigationRoutes = require("./routes/navigationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Health check
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "not connected";
  res.json({
    status: "ok",
    message: "Railway Navigation API is running",
    database: dbStatus,
  });
});

// 4. Feature routes
app.use("/api/stations", stationRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/navigation", navigationRoutes); // nodes, paths, /route
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// 5. Catch-all for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
