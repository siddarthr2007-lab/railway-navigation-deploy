const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userController");

// User Auth
router.post("/register", userCtrl.registerUser);
router.post("/login", userCtrl.loginUser);

// Profile
router.get("/profile/:id", userCtrl.getProfile);
router.put("/profile/:id", userCtrl.updateProfile);

// Favorites / Saved Stations
router.post("/favorites/toggle", userCtrl.toggleFavoriteStation);
router.get("/favorites/:id", userCtrl.getFavorites);

module.exports = router;
