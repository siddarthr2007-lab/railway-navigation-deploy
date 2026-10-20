/**
 * Google Maps-style Turn-by-Turn Instruction Generator
 * Analyzes route geometry, vector heading changes, and path types
 * to produce accurate, contextual directions.
 */

function getCompassHeading(dx, dy) {
  const rad = Math.atan2(dy, dx);
  const deg = (rad * 180) / Math.PI; // -180 to 180 (SVG: y is down)

  if (deg >= -22.5 && deg < 22.5) return "East";
  if (deg >= 22.5 && deg < 67.5) return "Southeast";
  if (deg >= 67.5 && deg < 112.5) return "South";
  if (deg >= 112.5 && deg < 157.5) return "Southwest";
  if (deg >= 157.5 || deg < -157.5) return "West";
  if (deg >= -157.5 && deg < -112.5) return "Northwest";
  if (deg >= -112.5 && deg < -67.5) return "North";
  if (deg >= -67.5 && deg < -22.5) return "Northeast";
  return "ahead";
}

function calculateTurn(v1, v2) {
  // In SVG coordinates, y is down, so:
  // theta1 = atan2(v1.y, v1.x)
  // theta2 = atan2(v2.y, v2.x)
  const theta1 = (Math.atan2(v1.y, v1.x) * 180) / Math.PI;
  const theta2 = (Math.atan2(v2.y, v2.x) * 180) / Math.PI;

  let diff = theta2 - theta1;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  // diff > 0 -> clockwise in screen coords -> RIGHT turn
  // diff < 0 -> counter-clockwise in screen coords -> LEFT turn
  if (Math.abs(diff) <= 25) {
    return { action: "straight", turnText: "Continue straight", angle: diff };
  } else if (diff > 25 && diff <= 65) {
    return { action: "slight-right", turnText: "Turn slight right", angle: diff };
  } else if (diff > 65 && diff <= 125) {
    return { action: "turn-right", turnText: "Turn right", angle: diff };
  } else if (diff > 125 && diff <= 165) {
    return { action: "sharp-right", turnText: "Make a sharp right", angle: diff };
  } else if (diff < -25 && diff >= -65) {
    return { action: "slight-left", turnText: "Turn slight left", angle: diff };
  } else if (diff < -65 && diff >= -125) {
    return { action: "turn-left", turnText: "Turn left", angle: diff };
  } else if (diff < -125 && diff >= -165) {
    return { action: "sharp-left", turnText: "Make a sharp left", angle: diff };
  } else {
    return { action: "u-turn", turnText: "Make a U-turn", angle: diff };
  }
}

/**
 * Builds Google Maps style step-by-step instructions from route nodes and edges.
 * @param {Array} routeNodes Array of node documents in traversal order
 * @param {Array} edgeSequence Array of edge objects traversed
 * @param {Object} options { fromFacilityName, toFacilityName, wheelchair }
 */
function generateNavigationSteps(routeNodes, edgeSequence, options = {}) {
  const { fromFacilityName, toFacilityName, wheelchair = false } = options;
  const steps = [];

  if (!routeNodes || routeNodes.length < 2) {
    return {
      steps: [],
      instructions: ["You have reached your destination"],
      formattedTotalDistance: "0 m",
      estimatedWalkingTime: "0 min",
    };
  }

  let cumulativeDistance = 0;

  for (let i = 0; i < edgeSequence.length; i++) {
    const currentNode = routeNodes[i];
    const nextNode = routeNodes[i + 1];
    const edge = edgeSequence[i];
    const distanceMeters = edge.distance || 10;
    cumulativeDistance += distanceMeters;

    const dx = nextNode.position.x - currentNode.position.x;
    const dy = nextNode.position.y - currentNode.position.y;
    const vCurrent = { x: dx, y: dy };

    let action = "straight";
    let instruction = "";
    let detail = "";
    const targetName = nextNode.nodeName || `Node ${i + 1}`;
    const sourceName = currentNode.nodeName || `Node ${i}`;

    // Path type special handling (lift, stairs, escalator, ramp)
    if (edge.pathType === "lift") {
      action = "lift";
      instruction = `Take the passenger elevator / lift to ${targetName}`;
      detail = wheelchair
        ? "Wheelchair accessible lift between concourse and platforms"
        : "Elevator access";
    } else if (edge.pathType === "stairs") {
      action = "stairs";
      instruction = `Take the stairs towards ${targetName}`;
      detail = "Standard pedestrian stairway";
    } else if (edge.pathType === "escalator") {
      action = "escalator";
      instruction = `Take the escalator towards ${targetName}`;
      detail = "Moving escalator";
    } else if (edge.pathType === "ramp") {
      action = "ramp";
      instruction = `Follow the accessible ramp towards ${targetName}`;
      detail = "Wheelchair accessible gentle incline ramp";
    } else {
      // Walkway: evaluate direction / turn
      if (i === 0) {
        // First step (departure)
        const heading = getCompassHeading(dx, dy);
        action = "depart";
        const startLabel = fromFacilityName || sourceName;
        instruction = `Head ${heading} from ${startLabel} towards ${targetName}`;
        detail = `Walk ${distanceMeters} meters along the main pathway`;
      } else {
        // Subsequent steps: compute relative turn from previous vector
        const prevNode = routeNodes[i - 1];
        const vPrev = {
          x: currentNode.position.x - prevNode.position.x,
          y: currentNode.position.y - prevNode.position.y,
        };
        const turnInfo = calculateTurn(vPrev, vCurrent);
        action = turnInfo.action;

        if (action === "straight") {
          instruction = `Continue straight towards ${targetName}`;
          detail = `Proceed ${distanceMeters} meters`;
        } else {
          instruction = `${turnInfo.turnText} towards ${targetName}`;
          detail = `Walk ${distanceMeters} meters after the turn`;
        }
      }
    }

    steps.push({
      stepNumber: i + 1,
      action,
      icon: action,
      instruction,
      detail,
      distance: distanceMeters,
      formattedDistance: `${distanceMeters} m`,
      fromNodeName: sourceName,
      toNodeName: targetName,
      fromNodeId: currentNode._id,
      toNodeId: nextNode._id,
      fromPosition: currentNode.position,
      toPosition: nextNode.position,
      pathType: edge.pathType || "walkway",
      isWheelchairAccessible: edge.isWheelchairAccessible !== false,
      nodeIndex: i,
    });
  }

  // Final destination arrival step
  const finalDestName = toFacilityName || routeNodes[routeNodes.length - 1].nodeName;
  steps.push({
    stepNumber: steps.length + 1,
    action: "destination",
    icon: "destination",
    instruction: `Arrive at ${finalDestName}`,
    detail: "Destination reached",
    distance: 0,
    formattedDistance: "0 m",
    fromNodeName: routeNodes[routeNodes.length - 1].nodeName,
    toNodeName: finalDestName,
    fromNodeId: routeNodes[routeNodes.length - 1]._id,
    toNodeId: routeNodes[routeNodes.length - 1]._id,
    fromPosition: routeNodes[routeNodes.length - 1].position,
    toPosition: routeNodes[routeNodes.length - 1].position,
    pathType: "destination",
    isWheelchairAccessible: true,
    nodeIndex: routeNodes.length - 1,
  });

  // Estimated walking time: average human walking speed is ~1.2 m/s (~72 m/min)
  const walkingMinutes = Math.max(1, Math.round(cumulativeDistance / 65));
  const estimatedWalkingTime =
    walkingMinutes === 1 ? "~1 min walk" : `~${walkingMinutes} min walk`;

  return {
    steps,
    instructions: steps.map((s) => s.instruction),
    totalDistance: cumulativeDistance,
    formattedTotalDistance: `${cumulativeDistance} m`,
    estimatedWalkingTime,
  };
}

module.exports = {
  getCompassHeading,
  calculateTurn,
  generateNavigationSteps,
};
