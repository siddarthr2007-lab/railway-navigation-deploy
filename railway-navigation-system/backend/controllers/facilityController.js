const Facility = require("../models/Facility");

exports.getFacilitiesByStation = async (req, res) => {
  try {
    const facilities = await Facility.find({ stationId: req.params.stationId });
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFacility = async (req, res) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json(facility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    res.json(facility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    res.json({ message: "Facility deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
