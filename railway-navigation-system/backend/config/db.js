const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Station = require("../models/Station");

let mongodInstance = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    const count = await Station.countDocuments();
    if (count < 20) {
      console.log("Seeding complete Tamil Nadu station and navigation network...");
      const seed = require("../utils/seedData");
      await seed(false);
    }
  } catch (error) {
    console.warn("Notice: Local MongoDB server is not running on port 27017.");
    console.log("Starting in-memory MongoDB server so you can use the system without manual DB setup...");
    try {
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);

      // Auto-seed if database has less than 20 stations
      const count = await Station.countDocuments();
      if (count < 20) {
        console.log("Database needs seeding. Automatically seeding complete Tamil Nadu station network...");
        const seed = require("../utils/seedData");
        await seed(false);
      }
    } catch (inMemErr) {
      console.error("Failed to start in-memory MongoDB:", inMemErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

