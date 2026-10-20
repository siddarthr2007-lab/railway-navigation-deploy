// Simple Dijkstra's shortest path implementation.
// Paths are stored one-directional in DB (fromNode -> toNode) but we treat the
// station corridors as walkable both ways, so we build the adjacency list both ways.
//
// wheelchairMode = true  -> paths with isWheelchairAccessible:false (e.g. stairs) are skipped entirely.

function buildGraph(paths, wheelchairMode) {
  const graph = {}; // { nodeId: [ { to, distance, pathType, instruction, pathId }, ... ] }

  for (const p of paths) {
    if (wheelchairMode && p.isWheelchairAccessible === false) continue;

    const from = String(p.fromNode);
    const to = String(p.toNode);

    if (!graph[from]) graph[from] = [];
    if (!graph[to]) graph[to] = [];

    graph[from].push({ to, distance: p.distance, pathType: p.pathType, instruction: p.instruction, pathId: p._id });
    // reverse direction — same corridor, walkable both ways
    graph[to].push({ to: from, distance: p.distance, pathType: p.pathType, instruction: p.instruction, pathId: p._id });
  }

  return graph;
}

function dijkstra(paths, startNodeId, endNodeId, wheelchairMode = false) {
  const graph = buildGraph(paths, wheelchairMode);
  const start = String(startNodeId);
  const end = String(endNodeId);

  const distances = {};
  const previous = {}; // nodeId -> { from, edge }
  const visited = new Set();
  const unvisited = new Set(Object.keys(graph));

  if (!graph[start]) unvisited.add(start);
  if (!graph[end]) unvisited.add(end);

  for (const node of unvisited) distances[node] = Infinity;
  distances[start] = 0;

  while (unvisited.size > 0) {
    // pick the unvisited node with the smallest known distance
    let currentNode = null;
    let smallest = Infinity;
    for (const node of unvisited) {
      if (distances[node] < smallest) {
        smallest = distances[node];
        currentNode = node;
      }
    }

    if (currentNode === null) break; // remaining nodes are unreachable
    if (currentNode === end) break; // reached destination

    unvisited.delete(currentNode);
    visited.add(currentNode);

    const neighbors = graph[currentNode] || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;
      const newDist = distances[currentNode] + edge.distance;
      if (newDist < (distances[edge.to] ?? Infinity)) {
        distances[edge.to] = newDist;
        previous[edge.to] = { from: currentNode, edge };
      }
    }
  }

  if (distances[end] === undefined || distances[end] === Infinity) {
    return null; // no route found (e.g. wheelchair mode blocked every path)
  }

  // walk backwards from end to start to rebuild the path
  const nodeSequence = [end];
  const edgeSequence = [];
  let cursor = end;
  while (cursor !== start) {
    const step = previous[cursor];
    if (!step) return null;
    edgeSequence.unshift(step.edge);
    nodeSequence.unshift(step.from);
    cursor = step.from;
  }

  return {
    totalDistance: distances[end],
    nodeSequence,   // ordered array of node IDs from start to end
    edgeSequence,   // ordered array of { to, distance, pathType, instruction }
  };
}

module.exports = { dijkstra };
