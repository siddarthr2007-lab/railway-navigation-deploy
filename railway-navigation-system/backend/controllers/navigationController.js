const NavigationNode = require("../models/NavigationNode");
const NavigationPath = require("../models/NavigationPath");
const { dijkstra } = require("../utils/dijkstra");

// ---- NODES ----
exports.getNodesByStation = async (req, res) => {
  try {
    const nodes = await NavigationNode.find({ stationId: req.params.stationId });
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNode = async (req, res) => {
  try {
    const node = await NavigationNode.create(req.body);
    res.status(201).json(node);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateNode = async (req, res) => {
  try {
    const node = await NavigationNode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!node) return res.status(404).json({ message: "Node not found" });
    res.json(node);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteNode = async (req, res) => {
  try {
    const node = await NavigationNode.findByIdAndDelete(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });
    res.json({ message: "Node deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- PATHS ----
exports.getPathsByStation = async (req, res) => {
  try {
    const paths = await NavigationPath.find({ stationId: req.params.stationId });
    res.json(paths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPath = async (req, res) => {
  try {
    const path = await NavigationPath.create(req.body);
    res.status(201).json(path);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePath = async (req, res) => {
  try {
    const path = await NavigationPath.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!path) return res.status(404).json({ message: "Path not found" });
    res.json(path);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePath = async (req, res) => {
  try {
    const path = await NavigationPath.findByIdAndDelete(req.params.id);
    if (!path) return res.status(404).json({ message: "Path not found" });
    res.json({ message: "Path deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Facility = require("../models/Facility");
const { generateNavigationSteps } = require("../utils/navigationHelper");

// ---- ROUTE CALCULATION (Google Maps style) ----
// POST /api/navigation/route  body: { stationId, fromNodeId, toNodeId, wheelchair: true/false }
exports.calculateRoute = async (req, res) => {
  try {
    const { stationId, fromNodeId, toNodeId, wheelchair } = req.body;

    if (!stationId || !fromNodeId || !toNodeId) {
      return res.status(400).json({ message: "stationId, fromNodeId and toNodeId are required" });
    }

    const paths = await NavigationPath.find({ stationId });
    const result = dijkstra(paths, fromNodeId, toNodeId, !!wheelchair);

    if (!result) {
      return res.status(404).json({
        message: wheelchair
          ? "No wheelchair-accessible route found between these points."
          : "No route found between these points.",
      });
    }

    // Fetch node details for display (names/positions along the route)
    const nodes = await NavigationNode.find({ _id: { $in: result.nodeSequence } });
    const nodeMap = {};
    nodes.forEach((n) => { nodeMap[String(n._id)] = n; });

    const routeNodes = result.nodeSequence.map((id) => nodeMap[id]);

    // Fetch linked facility names for start and destination if available
    const [fromFacility, toFacility] = await Promise.all([
      Facility.findOne({ stationId, navigationNodeId: fromNodeId }),
      Facility.findOne({ stationId, navigationNodeId: toNodeId }),
    ]);

    // Build Google Maps style turn-by-turn navigation steps
    const navResult = generateNavigationSteps(routeNodes, result.edgeSequence, {
      fromFacilityName: fromFacility ? fromFacility.name : routeNodes[0]?.nodeName,
      toFacilityName: toFacility ? toFacility.name : routeNodes[routeNodes.length - 1]?.nodeName,
      wheelchair: !!wheelchair,
    });

    res.json({
      wheelchairMode: !!wheelchair,
      totalDistance: navResult.totalDistance,
      formattedTotalDistance: navResult.formattedTotalDistance,
      estimatedWalkingTime: navResult.estimatedWalkingTime,
      routeNodes,          // ordered list of node documents (has position for drawing on map)
      steps: navResult.steps, // rich Google Maps style step objects
      instructions: navResult.instructions, // ordered list of turn-by-turn text strings
      edgeTypes: result.edgeSequence.map((e) => e.pathType),
      fromFacility: fromFacility ? { _id: fromFacility._id, name: fromFacility.name, type: fromFacility.type } : null,
      toFacility: toFacility ? { _id: toFacility._id, name: toFacility.name, type: toFacility.type } : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/navigation/reseed
exports.reseedData = async (req, res) => {
  try {
    const seed = require("../utils/seedData");
    await seed(false);
    res.json({ message: "All station graphs and facilities reseeded successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

