// Run with: npm run seed
// Seeds comprehensive, authentic data and full navigation graphs for 26 Major Railway Stations across Tamil Nadu:
// Covering all 4 railway divisions (Chennai MAS, Salem SA, Madurai MDU, Tiruchirappalli TPJ) + border gateways.

require("dotenv").config();
const mongoose = require("mongoose");

const Station = require("../models/Station");
const Facility = require("../models/Facility");
const NavigationNode = require("../models/NavigationNode");
const NavigationPath = require("../models/NavigationPath");
const Admin = require("../models/Admin");

const stationsData = [
  // --- CHENNAI & NORTHERN TAMIL NADU ---
  {
    stationCode: "MAS",
    stationName: "Dr. M.G. Ramachandran Central (Chennai Central)",
    city: "Chennai",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "Terminal Hub",
    description: "Grand historic railway terminus and the busiest station in Tamil Nadu, serving long-distance Vande Bharat, Rajdhani, and Superfast express trains.",
    totalPlatforms: 12,
  },
  {
    stationCode: "MS",
    stationName: "Chennai Egmore",
    city: "Chennai",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "Terminal Hub",
    description: "Iconic Gothic-style heritage terminal in Chennai, primarily serving central, delta, and southern Tamil Nadu express routes.",
    totalPlatforms: 11,
  },
  {
    stationCode: "TBM",
    stationName: "Tambaram Junction",
    city: "Chennai",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "Suburban & Express Terminal",
    description: "Major southern gateway terminal of Chennai metropolis, handling high-density suburban EMU traffic and southern express services.",
    totalPlatforms: 8,
  },
  {
    stationCode: "MSB",
    stationName: "Chennai Beach Junction",
    city: "Chennai",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "Coastal & Suburban Terminal",
    description: "Historic coastal terminal near Chennai Port, serving the MRTS elevated rail line and north-south suburban corridors.",
    totalPlatforms: 8,
  },
  {
    stationCode: "KPD",
    stationName: "Katpadi Junction (Vellore)",
    city: "Vellore",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "Major Junction",
    description: "Premier junction station serving Vellore metropolitan area, CMC Hospital, and VIT University, linking Chennai, Bengaluru, and Tirupati.",
    totalPlatforms: 5,
  },
  {
    stationCode: "VM",
    stationName: "Villupuram Junction",
    city: "Villupuram",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "TPJ",
    category: "Major Junction",
    description: "Strategic 5-line rail junction linking Chennai with Tiruchirappalli, Madurai, Puducherry, and Katpadi/Tiruvannamalai.",
    totalPlatforms: 6,
  },
  {
    stationCode: "JTJ",
    stationName: "Jolarpettai Junction",
    city: "Tirupattur",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "Major Tri-Junction",
    description: "Crucial inter-state railway tri-junction facilitating high-speed traffic between Tamil Nadu, Karnataka (Bengaluru), and Kerala.",
    totalPlatforms: 5,
  },
  {
    stationCode: "CUPJ",
    stationName: "Cuddalore Port Junction",
    city: "Cuddalore",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "TPJ",
    category: "Coastal Junction",
    description: "Historic coastal junction serving the industrial district of Cuddalore, port terminals, and the Chidambaram pilgrimage corridor.",
    totalPlatforms: 3,
  },
  {
    stationCode: "VLR",
    stationName: "Vellore Cantonment",
    city: "Vellore",
    state: "Tamil Nadu",
    region: "Chennai & Northern TN",
    division: "MAS",
    category: "City Station",
    description: "Urban station located near the historic Vellore Fort and Sripuram Golden Temple, providing direct city access.",
    totalPlatforms: 3,
  },

  // --- KONGU & WESTERN TAMIL NADU ---
  {
    stationCode: "CBE",
    stationName: "Coimbatore Junction",
    city: "Coimbatore",
    state: "Tamil Nadu",
    region: "Kongu & Western TN",
    division: "SA",
    category: "Premier Junction",
    description: "Premier railway junction and top revenue-earner of Salem division, connecting the textile and industrial hub of Kongu Nadu.",
    totalPlatforms: 6,
  },
  {
    stationCode: "SA",
    stationName: "Salem Junction",
    city: "Salem",
    state: "Tamil Nadu",
    region: "Kongu & Western TN",
    division: "SA",
    category: "Divisional Headquarters",
    description: "Divisional railway headquarters and crucial central junction connecting Bengaluru, Chennai, Erode, Karur, and Mettur Dam.",
    totalPlatforms: 6,
  },
  {
    stationCode: "ED",
    stationName: "Erode Junction",
    city: "Erode",
    state: "Tamil Nadu",
    region: "Kongu & Western TN",
    division: "SA",
    category: "Major Junction & Loco Hub",
    description: "High-density rail junction housing historic Diesel and Electric Locomotive Sheds, linking northern, western, and southern lines.",
    totalPlatforms: 5,
  },
  {
    stationCode: "TUP",
    stationName: "Tiruppur Railway Station",
    city: "Tiruppur",
    state: "Tamil Nadu",
    region: "Kongu & Western TN",
    division: "SA",
    category: "Industrial Hub",
    description: "Key station serving India's cotton knitwear export capital with heavy daily passenger footfall between Coimbatore and Erode.",
    totalPlatforms: 4,
  },
  {
    stationCode: "KRR",
    stationName: "Karur Junction",
    city: "Karur",
    state: "Tamil Nadu",
    region: "Kongu & Western TN",
    division: "SA",
    category: "Junction Station",
    description: "Centrally positioned junction in the textile and coach-building basin, linking Salem, Erode, Tiruchirappalli, and Dindigul.",
    totalPlatforms: 5,
  },
  {
    stationCode: "HSUR",
    stationName: "Hosur Railway Station",
    city: "Krishnagiri / Hosur",
    state: "Tamil Nadu",
    region: "Kongu & Western TN",
    division: "SWR",
    category: "Border Industrial Station",
    description: "Rapidly expanding manufacturing gateway on the TN-Karnataka border, connecting major automobile clusters with Bengaluru.",
    totalPlatforms: 3,
  },

  // --- CENTRAL & CAUVERY DELTA ---
  {
    stationCode: "TPJ",
    stationName: "Tiruchirappalli Junction (Trichy)",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    region: "Central & Cauvery Delta",
    division: "TPJ",
    category: "Divisional Headquarters",
    description: "Massive central railway junction and divisional headquarters, connecting Cauvery Delta districts with southern cities and Chennai.",
    totalPlatforms: 8,
  },
  {
    stationCode: "TJ",
    stationName: "Thanjavur Junction",
    city: "Thanjavur",
    state: "Tamil Nadu",
    region: "Central & Cauvery Delta",
    division: "TPJ",
    category: "Heritage Junction",
    description: "Gateway to the UNESCO World Heritage Brihadisvara Great Living Chola Temple and the cultural heartland of Cauvery Delta.",
    totalPlatforms: 5,
  },
  {
    stationCode: "KMU",
    stationName: "Kumbakonam Railway Station",
    city: "Kumbakonam",
    state: "Tamil Nadu",
    region: "Central & Cauvery Delta",
    division: "TPJ",
    category: "Pilgrim Centre",
    description: "Renowned temple town railway station catering to millions of Mahamaham and Navagraha temple pilgrims in the Delta region.",
    totalPlatforms: 3,
  },
  {
    stationCode: "MV",
    stationName: "Mayiladuthurai Junction",
    city: "Mayiladuthurai",
    state: "Tamil Nadu",
    region: "Central & Cauvery Delta",
    division: "TPJ",
    category: "Delta Junction",
    description: "Historic junction linking Main Line routes through Chidambaram, Villupuram, Thiruvarur, and Thanjavur.",
    totalPlatforms: 5,
  },

  // --- SOUTHERN TAMIL NADU ---
  {
    stationCode: "MDU",
    stationName: "Madurai Junction",
    city: "Madurai",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "MDU",
    category: "Divisional Headquarters",
    description: "Historic divisional headquarters in the ancient temple city of Madurai, welcoming millions of Meenakshi Temple pilgrims and travelers.",
    totalPlatforms: 8,
  },
  {
    stationCode: "TEN",
    stationName: "Tirunelveli Junction (Nellai)",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "MDU",
    category: "Major Junction",
    description: "Premier junction of deep southern Tamil Nadu situated on the Thamirabarani River, connecting Tenkasi, Thoothukudi, and Cape Comorin.",
    totalPlatforms: 5,
  },
  {
    stationCode: "DG",
    stationName: "Dindigul Junction",
    city: "Dindigul",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "MDU",
    category: "Strategic Junction",
    description: "Strategic multi-line junction connecting Madurai, Karur, Tiruchirappalli, and Pollachi/Palani lines in the historic rockfort city.",
    totalPlatforms: 5,
  },
  {
    stationCode: "NCJ",
    stationName: "Nagercoil Junction",
    city: "Kanyakumari / Nagercoil",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "TVC",
    category: "Southern Terminus",
    description: "Crucial southern junction and passenger terminus connecting Kanyakumari district with Thiruvananthapuram and Tirunelveli.",
    totalPlatforms: 4,
  },
  {
    stationCode: "CAPE",
    stationName: "Kanniyakumari Railway Station",
    city: "Kanyakumari",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "TVC",
    category: "Land's End Terminus",
    description: "The iconic southernmost railway terminus of the Indian subcontinent, where three oceans meet at Vivekananda Rock Memorial.",
    totalPlatforms: 4,
  },
  {
    stationCode: "RMM",
    stationName: "Rameswaram Railway Station",
    city: "Ramanathapuram / Rameswaram",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "MDU",
    category: "Island Pilgrimage Terminus",
    description: "Island railway terminal reached via the historic Pamban Sea Bridge, serving Ramanathaswamy Temple pilgrims from all across India.",
    totalPlatforms: 4,
  },
  {
    stationCode: "TN",
    stationName: "Tuticorin (Thoothukudi)",
    city: "Thoothukudi",
    state: "Tamil Nadu",
    region: "Southern TN",
    division: "MDU",
    category: "Port Terminus",
    description: "Historic Pearl City sea port rail terminus serving heavy commercial industry, salt pans, and container harbor.",
    totalPlatforms: 3,
  },
];

/**
 * Builds a complete facility, node, and path graph for a given station.
 * Canvas layout: 920 x 620
 */
async function buildFullStationGraph(station) {
  const stationId = station._id;
  const platformCount = station.totalPlatforms || 4;

  // 1. Define Core Navigation Nodes
  const nodeDefs = [
    { key: "Entrance_Main", nodeName: "Main Entrance Portico", position: { x: 450, y: 530 }, isAccessible: true },
    { key: "Entrance_West", nodeName: "West Entrance Gate", position: { x: 140, y: 530 }, isAccessible: true },
    { key: "Entrance_East", nodeName: "East / Suburban Entrance", position: { x: 760, y: 530 }, isAccessible: true },
    { key: "Ramp_Entrance", nodeName: "Main Entrance Accessible Ramp", position: { x: 380, y: 485 }, isAccessible: true },

    { key: "Concourse_Lobby", nodeName: "Main Booking Concourse", position: { x: 450, y: 440 }, isAccessible: true },
    { key: "Ticket_Counter", nodeName: "Ticket Booking Office & ATVM", position: { x: 300, y: 440 }, isAccessible: true },
    { key: "ATM", nodeName: "Multi-Bank ATM Centre", position: { x: 180, y: 440 }, isAccessible: true },
    { key: "Info_Counter", nodeName: "Help Desk & Information Counter", position: { x: 600, y: 440 }, isAccessible: true },
    { key: "First_Aid", nodeName: "Medical Booth & First Aid", position: { x: 720, y: 440 }, isAccessible: true },

    { key: "Concourse_Central", nodeName: "Central Concourse Hall", position: { x: 450, y: 350 }, isAccessible: true },
    { key: "Waiting_AC", nodeName: "AC Executive Lounge", position: { x: 300, y: 350 }, isAccessible: true },
    { key: "Food_Canteen", nodeName: "IRCTC Food Court & Canteen", position: { x: 180, y: 350 }, isAccessible: true },
    { key: "Waiting_General", nodeName: "General Passenger Waiting Hall", position: { x: 600, y: 350 }, isAccessible: true },
    { key: "Restroom", nodeName: "Accessible Restroom Complex", position: { x: 720, y: 350 }, isAccessible: true },
    { key: "Drinking_Water", nodeName: "Pure RO Drinking Water Station", position: { x: 450, y: 290 }, isAccessible: true },

    { key: "FOB_Stairs_Lower", nodeName: "Central Overbridge Stairs (Concourse)", position: { x: 350, y: 260 }, isAccessible: false },
    { key: "FOB_Lift_Lower", nodeName: "Central Overbridge Passenger Lift (Concourse)", position: { x: 550, y: 260 }, isAccessible: true },
    { key: "FOB_Stairs_Upper", nodeName: "Central Overbridge Stairs (FOB Level)", position: { x: 350, y: 190 }, isAccessible: false },
    { key: "FOB_Lift_Upper", nodeName: "Central Overbridge Lift (FOB Level)", position: { x: 550, y: 190 }, isAccessible: true },
  ];

  // Add platform nodes and bridge connectors
  const platformXPositions = [];
  for (let i = 1; i <= platformCount; i++) {
    const xPos = 120 + Math.round((i - 1) * (680 / Math.max(platformCount - 1, 1)));
    platformXPositions.push({ index: i, x: xPos });
    nodeDefs.push(
      { key: `Plat_${i}`, nodeName: `Platform ${i}`, position: { x: xPos, y: 90 }, isAccessible: true },
      { key: `FOB_Plat_${i}`, nodeName: `FOB Connector to Platform ${i}`, position: { x: xPos, y: 190 }, isAccessible: true },
      { key: `FOB_Plat_${i}_Lift`, nodeName: `Platform ${i} Elevator / Ramp`, position: { x: xPos + 18, y: 140 }, isAccessible: true }
    );
  }

  // Insert all navigation nodes
  const insertedNodes = await NavigationNode.insertMany(
    nodeDefs.map((n) => ({
      stationId,
      nodeName: n.nodeName,
      position: n.position,
      isAccessible: n.isAccessible,
    }))
  );

  const nodeKeyMap = {};
  nodeDefs.forEach((def, index) => {
    nodeKeyMap[def.key] = insertedNodes[index];
  });

  // 2. Define Facilities and link each to its NavigationNode
  const facilityDefs = [
    {
      name: "Main Entrance Portico",
      type: "entrance",
      nodeKey: "Entrance_Main",
      wheelchairAccessible: true,
      rampAvailable: true,
      description: "Primary station entrance with tactile pathways and wheelchair access ramp.",
    },
    {
      name: "West Entrance Gate",
      type: "entrance",
      nodeKey: "Entrance_West",
      wheelchairAccessible: true,
      description: "Secondary entrance with direct connectivity to city bus stand and parking.",
    },
    {
      name: "East / Suburban Entrance",
      type: "entrance",
      nodeKey: "Entrance_East",
      wheelchairAccessible: true,
      description: "Eastern gate providing swift passenger entry to concourse.",
    },
    {
      name: "Main Entrance Accessible Ramp",
      type: "ramp",
      nodeKey: "Ramp_Entrance",
      wheelchairAccessible: true,
      rampAvailable: true,
      description: "Gentle incline wheelchair ramp connecting portico to ticket lobby.",
    },
    {
      name: "Ticket Booking Office & ATVM",
      type: "ticket_counter",
      nodeKey: "Ticket_Counter",
      wheelchairAccessible: true,
      description: "Unreserved ticketing counters and Automated Ticket Vending Machines (ATVM).",
    },
    {
      name: "Multi-Bank ATM Centre",
      type: "atm",
      nodeKey: "ATM",
      wheelchairAccessible: true,
      description: "24/7 Nationalized & Commercial Bank Cash Dispenser Kiosks.",
    },
    {
      name: "Help Desk & Information Counter",
      type: "information_counter",
      nodeKey: "Info_Counter",
      wheelchairAccessible: true,
      description: "Rail enquiry counter for train status, coach positions, and passenger assistance.",
    },
    {
      name: "Medical Booth & First Aid",
      type: "first_aid",
      nodeKey: "First_Aid",
      wheelchairAccessible: true,
      description: "Emergency healthcare booth with stretcher and basic medical support.",
    },
    {
      name: "AC Executive Lounge",
      type: "waiting_hall",
      nodeKey: "Waiting_AC",
      wheelchairAccessible: true,
      description: "Comfortable air-conditioned waiting lounge with cushioned seating and WiFi.",
    },
    {
      name: "IRCTC Food Court & Canteen",
      type: "food_canteen",
      nodeKey: "Food_Canteen",
      wheelchairAccessible: true,
      description: "Multi-cuisine refreshments, hot meals, South Indian filter coffee, and packaged drinking water.",
    },
    {
      name: "General Passenger Waiting Hall",
      type: "waiting_hall",
      nodeKey: "Waiting_General",
      wheelchairAccessible: true,
      description: "Spacious waiting hall with digital train indicator displays.",
    },
    {
      name: "Accessible Restroom Complex",
      type: "restroom",
      nodeKey: "Restroom",
      wheelchairAccessible: true,
      description: "Clean gents, ladies, and Divyangjan accessible toilet facilities.",
    },
    {
      name: "Pure RO Drinking Water Station",
      type: "drinking_water",
      nodeKey: "Drinking_Water",
      wheelchairAccessible: true,
      description: "Free reverse osmosis drinking water refill unit.",
    },
    {
      name: "Central Overbridge Stairs",
      type: "stairs",
      nodeKey: "FOB_Stairs_Lower",
      wheelchairAccessible: false,
      description: "Pedestrian stairs connecting ground concourse to the Central Foot Overbridge.",
    },
    {
      name: "Central Overbridge Passenger Lift",
      type: "lift",
      nodeKey: "FOB_Lift_Lower",
      wheelchairAccessible: true,
      liftAvailable: true,
      description: "Wheelchair-accessible elevator providing barrier-free vertical transit to the bridge.",
    },
  ];

  // Add platform facilities
  for (let i = 1; i <= platformCount; i++) {
    facilityDefs.push({
      name: `Platform ${i}`,
      type: "platform",
      nodeKey: `Plat_${i}`,
      wheelchairAccessible: true,
      liftAvailable: true,
      rampAvailable: i === 1,
      description: `Platform ${i} serving express, superfast, and passenger train arrivals and departures.`,
    });
  }

  // Insert all facilities with navigationNodeId linked
  const facilitiesToInsert = facilityDefs.map((f) => {
    const matchingNode = nodeKeyMap[f.nodeKey];
    return {
      stationId,
      name: f.name,
      type: f.type,
      position: matchingNode.position,
      wheelchairAccessible: f.wheelchairAccessible,
      liftAvailable: f.liftAvailable || false,
      rampAvailable: f.rampAvailable || false,
      description: f.description,
      navigationNodeId: matchingNode._id,
      floor: 0,
      operatingHours: "24 Hours",
    };
  });

  await Facility.insertMany(facilitiesToInsert);

  // 3. Define Navigation Paths (Edges)
  const pathDefs = [
    // Entrance connections
    { from: "Entrance_Main", to: "Concourse_Lobby", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk to Main Booking Concourse" },
    { from: "Entrance_Main", to: "Ramp_Entrance", distance: 10, pathType: "ramp", isWheelchairAccessible: true, instruction: "Take the accessible entrance ramp" },
    { from: "Ramp_Entrance", to: "Concourse_Lobby", distance: 10, pathType: "ramp", isWheelchairAccessible: true, instruction: "Follow the ramp into Main Booking Concourse" },
    { from: "Entrance_West", to: "ATM", distance: 18, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk past the West Gate towards ATM" },
    { from: "ATM", to: "Ticket_Counter", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Proceed towards Ticket Booking Office" },
    { from: "Ticket_Counter", to: "Concourse_Lobby", distance: 18, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk into Main Booking Concourse" },
    { from: "Concourse_Lobby", to: "Info_Counter", distance: 18, pathType: "walkway", isWheelchairAccessible: true, instruction: "Proceed towards Information Counter" },
    { from: "Info_Counter", to: "First_Aid", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Continue towards Medical Booth" },
    { from: "First_Aid", to: "Entrance_East", distance: 18, pathType: "walkway", isWheelchairAccessible: true, instruction: "Proceed towards East / Suburban Entrance" },

    // Concourse Hall connections
    { from: "Concourse_Lobby", to: "Concourse_Central", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk into Central Concourse Hall" },
    { from: "Concourse_Central", to: "Waiting_AC", distance: 18, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk towards AC Executive Lounge" },
    { from: "Waiting_AC", to: "Food_Canteen", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Proceed towards Food Court" },
    { from: "Concourse_Central", to: "Waiting_General", distance: 18, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk towards General Waiting Hall" },
    { from: "Waiting_General", to: "Restroom", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Proceed towards Accessible Restrooms" },
    { from: "Concourse_Central", to: "Drinking_Water", distance: 10, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk towards RO Water Station" },

    // Direct ground-level connection to Platform 1
    { from: "Concourse_Central", to: "Plat_1", distance: 25, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk directly to Platform 1 concourse" },

    // Vertical transit to Central Foot Overbridge (FOB)
    { from: "Concourse_Central", to: "FOB_Stairs_Lower", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk towards Overbridge Stairs" },
    { from: "FOB_Stairs_Lower", to: "FOB_Stairs_Upper", distance: 12, pathType: "stairs", isWheelchairAccessible: false, instruction: "Take the stairs up to the Central Foot Overbridge" },
    { from: "Concourse_Central", to: "FOB_Lift_Lower", distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk towards Central Overbridge Passenger Lift" },
    { from: "FOB_Lift_Lower", to: "FOB_Lift_Upper", distance: 10, pathType: "lift", isWheelchairAccessible: true, instruction: "Take the passenger elevator / lift up to Foot Overbridge Level" },
    { from: "FOB_Stairs_Upper", to: "FOB_Lift_Upper", distance: 20, pathType: "walkway", isWheelchairAccessible: true, instruction: "Walk across the Foot Overbridge landing" },
  ];

  // Find nearest platforms to stairs (x=350) and lift (x=550)
  let closestStairPlat = 1;
  let closestLiftPlat = 1;
  let minDistStairs = Infinity;
  let minDistLift = Infinity;

  for (const p of platformXPositions) {
    const distS = Math.abs(p.x - 350);
    if (distS < minDistStairs) {
      minDistStairs = distS;
      closestStairPlat = p.index;
    }
    const distL = Math.abs(p.x - 550);
    if (distL < minDistLift) {
      minDistLift = distL;
      closestLiftPlat = p.index;
    }
  }

  // Connect bridge spine to FOB stairs & lift upper deck
  pathDefs.push(
    { from: "FOB_Stairs_Upper", to: `FOB_Plat_${closestStairPlat}`, distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: `Proceed along FOB towards Platform ${closestStairPlat}` },
    { from: "FOB_Lift_Upper", to: `FOB_Plat_${closestLiftPlat}`, distance: 15, pathType: "walkway", isWheelchairAccessible: true, instruction: `Proceed along FOB towards Platform ${closestLiftPlat}` }
  );

  if (closestStairPlat !== 1 && closestLiftPlat !== 1) {
    pathDefs.push(
      { from: "FOB_Stairs_Upper", to: "FOB_Plat_1", distance: 20, pathType: "walkway", isWheelchairAccessible: true, instruction: "Proceed along FOB towards Platform 1" }
    );
  }

  // Connect adjacent platform FOB nodes along the spine: Plat 1 <-> Plat 2 <-> ...
  for (let i = 1; i <= platformCount; i++) {
    // Overbridge spine connection
    if (i < platformCount) {
      pathDefs.push({
        from: `FOB_Plat_${i}`,
        to: `FOB_Plat_${i + 1}`,
        distance: 15,
        pathType: "walkway",
        isWheelchairAccessible: true,
        instruction: `Walk along the Foot Overbridge towards Platform ${i + 1}`,
      });
    }

    // Connection from Overbridge down to Platform i:
    // 1. Via Stairs (faster, non-accessible)
    pathDefs.push({
      from: `FOB_Plat_${i}`,
      to: `Plat_${i}`,
      distance: 14,
      pathType: "stairs",
      isWheelchairAccessible: false,
      instruction: `Take the stairs down to Platform ${i}`,
    });

    // 2. Via Elevator / Accessible Ramp (barrier-free, wheelchair accessible)
    pathDefs.push({
      from: `FOB_Plat_${i}`,
      to: `FOB_Plat_${i}_Lift`,
      distance: 5,
      pathType: "walkway",
      isWheelchairAccessible: true,
      instruction: `Move towards Platform ${i} Elevator / Ramp`,
    });
    pathDefs.push({
      from: `FOB_Plat_${i}_Lift`,
      to: `Plat_${i}`,
      distance: 14,
      pathType: "lift",
      isWheelchairAccessible: true,
      instruction: `Take the elevator down to Platform ${i}`,
    });
  }

  // Insert all navigation paths
  const pathsToInsert = pathDefs.map((p) => ({
    stationId,
    fromNode: nodeKeyMap[p.from]._id,
    toNode: nodeKeyMap[p.to]._id,
    distance: p.distance,
    pathType: p.pathType,
    isWheelchairAccessible: p.isWheelchairAccessible !== false,
    instruction: p.instruction,
  }));

  await NavigationPath.insertMany(pathsToInsert);
}

async function seed(disconnectOnFinish = false) {
  let memoryServer = null;
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/railway_navigation", {
        serverSelectionTimeoutMS: 2000,
      });
      console.log("Connected to MongoDB for seeding...");
    } catch (err) {
      console.log("Local MongoDB not available. Starting in-memory MongoDB for seeding...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri());
      console.log("Connected to in-memory MongoDB for seeding...");
    }
  }

  // 1. Clear old data
  await NavigationPath.deleteMany({});
  await NavigationNode.deleteMany({});
  await Facility.deleteMany({});
  await Station.deleteMany({});
  console.log("Old station and navigation data cleared.");

  // 2. Insert stations
  const stations = await Station.insertMany(stationsData);
  console.log(`${stations.length} major Tamil Nadu stations inserted.`);

  // 3. Build rich navigation graphs and link facilities for EVERY station
  for (const station of stations) {
    await buildFullStationGraph(station);
    console.log(`✓ Seeded ${station.stationName} (${station.stationCode}) - ${station.totalPlatforms} platforms`);
  }

  // 4. Create default admin login
  await Admin.deleteMany({});
  await Admin.create({
    username: "admin",
    password: "admin123",
    email: "admin@railnav.local",
  });
  console.log("Default admin created -> username: admin, password: admin123");

  console.log("\n========================================================");
  console.log(`Seeding complete! All ${stations.length} Tamil Nadu stations now have:`);
  console.log("- Full facility sets with linked navigation nodes");
  console.log("- Bidirectional walkway, stair, and elevator path graphs");
  console.log("- Wheelchair-accessible alternatives for every route");
  console.log("- Complete regional coverage: Chennai/North, Kongu/West, Delta, South TN");
  console.log("========================================================\n");

  if (disconnectOnFinish) {
    await mongoose.disconnect();
    if (memoryServer) await memoryServer.stop();
    process.exit(0);
  }
}

if (require.main === module) {
  seed(true).catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}

module.exports = seed;
