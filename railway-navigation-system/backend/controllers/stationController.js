const Station = require("../models/Station");

exports.getAllStations = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.region) {
      filter.region = req.query.region;
    }
    if (req.query.division) {
      filter.division = req.query.division.toUpperCase();
    }
    const stations = await Station.find(filter).sort({ stationName: 1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ message: "Station not found" });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStation = async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!station) return res.status(404).json({ message: "Station not found" });
    res.json(station);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: "Station not found" });
    res.json({ message: "Station deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
