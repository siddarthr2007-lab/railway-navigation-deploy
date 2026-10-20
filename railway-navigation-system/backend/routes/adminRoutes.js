const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");

router.post("/login", ctrl.loginAdmin);

module.exports = router;
