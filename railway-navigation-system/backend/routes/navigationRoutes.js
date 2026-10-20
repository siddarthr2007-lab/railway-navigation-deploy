const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/navigationController");

// Nodes
router.get("/nodes/station/:stationId", ctrl.getNodesByStation);
router.post("/nodes", ctrl.createNode);
router.put("/nodes/:id", ctrl.updateNode);
router.delete("/nodes/:id", ctrl.deleteNode);

// Paths
router.get("/paths/station/:stationId", ctrl.getPathsByStation);
router.post("/paths", ctrl.createPath);
router.put("/paths/:id", ctrl.updatePath);
router.delete("/paths/:id", ctrl.deletePath);

// Route calculation
router.post("/route", ctrl.calculateRoute);

// Reseed data
router.post("/reseed", ctrl.reseedData);
router.get("/reseed", ctrl.reseedData);

module.exports = router;
