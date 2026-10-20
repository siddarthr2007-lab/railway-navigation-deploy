const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/facilityController");

router.get("/station/:stationId", ctrl.getFacilitiesByStation);
router.get("/:id", ctrl.getFacilityById);
router.post("/", ctrl.createFacility);
router.put("/:id", ctrl.updateFacility);
router.delete("/:id", ctrl.deleteFacility);

module.exports = router;
