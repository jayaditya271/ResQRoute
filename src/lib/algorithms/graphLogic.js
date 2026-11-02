/**
 * ============================================================================
 * RESQROUTE™ - EMERGENCY EVACUATION ROUTE ANALYSIS ENGINE
 * ============================================================================
 * Author: Jayaditya
 * Topic: Graph Representation & Breadth-First Search (BFS)
 * Description: Core graph representation data structures and Breadth-First Search
 * algorithm tailored for real-time architectural emergency evacuation analysis.
 * Keywords: emergency-evacuation, graph-representation, bfs, breadth-first-search
 * ============================================================================
 */

/**
 * Node types recognized by the evacuation analysis engine
 */
export const NODE_TYPES = {
  ROOM: 'room',             // Origin / Occupancy Zone (offices, wards, labs)
  CORRIDOR: 'corridor',     // Horizontal walkway connecting zones
  STAIRWELL: 'stairwell',   // Vertical egress route (fire-rated stairs)
  ATRIUM: 'atrium',         // Large open lobby / transit junction
  EXIT: 'exit',             // Primary exterior fire exit door
  ASSEMBLY: 'assembly',     // Outdoor safe assembly point
};

/**
 * Hazard conditions that dynamically affect nodes and edges
 */
export const HAZARD_TYPES = {
  NONE: 'none',
  SMOKE: 'smoke',       // Visibility reduction; slowed passage
  FIRE: 'fire',         // Active combustion; completely impassable
  BLOCKED: 'blocked',   // Structural debris / locked door; impassable
  CONGESTION: 'crowded' // High crowd density; mobility bottleneck
};

/**
 * Base walking speeds (meters/second) under varying conditions
 */
export const WALKING_SPEEDS = {
  NORMAL: 1.4,          // Standard brisk walking pace (m/s)
  SMOKE_IMPAIRED: 0.6,  // Reduced pace due to toxic smoke / low visibility
  STAIRS_DESCENT: 0.8,  // Cautious stairwell descent pace
};

/**
 * Breadth-First Search (BFS)
 * --------------------------
 * Algorithmic Characteristic: Unweighted, level-by-level shortest hop discovery.
 * Real-World Evacuation Application:
 * 1. Guarantees finding the route with the MINIMUM number of doorway / zone transitions.
 * 2. Simulates an expanding circular wavefront of emergency alarms radiating from the origin.
 * 3. Uses a First-In-First-Out (FIFO) Queue to explore adjacent corridors before moving deeper.
 *
 * Time Complexity:  O(V + E)  [V = Zones/Vertices, E = Corridors/Edges]
 * Space Complexity: O(V)      [FIFO Queue & Visited Set]
 *
 * @param {Object} graph - The evacuation graph with nodes and adjacencyList
 * @param {string} startId - Source room ID (occupant's current zone)
 * @param {string[]} exitIds - Array of candidate safe exterior exit IDs
 * @returns {Object} BFS evacuation outcome containing path, visited nodes, and queue trace
 */
export function breadthFirstSearch(graph, startId, exitIds) {
  const visited = new Set();
  const queue = [{ id: startId, level: 0 }];
  const parentMap = new Map();
  const explorationTrace = [];
  const exitSet = new Set(exitIds);
  let reachedExitId = null;

  visited.add(startId);

  // Initial exploration step
  explorationTrace.push({
    nodeId: startId,
    level: 0,
    queueSnapshot: [startId],
    type: 'visit_start',
    message: `Occupant emergency alert triggered in ${graph.nodes[startId]?.name || startId}`,
  });

  while (queue.length > 0) {
    // FIFO Queue Pop: Remove front node
    const current = queue.shift();
    const currentId = current.id;
    const currentLevel = current.level;
    const currentNode = graph.nodes[currentId];

    if (!currentNode) continue;

    // Check if target emergency exit is reached
    if (exitSet.has(currentId)) {
      reachedExitId = currentId;
      explorationTrace.push({
        nodeId: currentId,
        level: currentLevel,
        queueSnapshot: queue.map((q) => q.id),
        type: 'exit_found',
        message: `Safe exterior fire exit reached at ${currentNode.name}!`,
      });
      break;
    }

    // Traverse adjacent corridors in Adjacency List
    const neighbors = graph.adjacencyList[currentId] || [];

    for (const edge of neighbors) {
      const neighborId = edge.target;
      const neighborNode = graph.nodes[neighborId];

      // Safe traversal check: Node not visited, no active fire/blockage, corridor open
      const isPassable =
        neighborNode?.hazard !== HAZARD_TYPES.FIRE &&
        neighborNode?.hazard !== HAZARD_TYPES.BLOCKED &&
        !edge.isBlocked;

      if (!visited.has(neighborId) && isPassable) {
        visited.add(neighborId);
        parentMap.set(neighborId, currentId);

        // Enqueue next level vertex
        queue.push({ id: neighborId, level: currentLevel + 1 });

        explorationTrace.push({
          nodeId: neighborId,
          fromId: currentId,
          level: currentLevel + 1,
          queueSnapshot: queue.map((q) => q.id),
          type: 'enqueue',
          message: `BFS Wavefront advanced to ${neighborNode.name} (Wave Level ${currentLevel + 1})`,
        });

        // Terminate immediately when the first uncompromised exit is discovered
        if (exitSet.has(neighborId)) {
          reachedExitId = neighborId;
          break;
        }
      }
    }

    if (reachedExitId) break;
  }

  // Reconstruct shortest path by following parents back from exit to start
  const path = [];
  if (reachedExitId) {
    let curr = reachedExitId;
    while (curr) {
      path.unshift(curr);
      curr = parentMap.get(curr);
    }
  }

  return {
    algorithm: 'Breadth-First Search (BFS)',
    success: path.length > 0,
    path,
    visitedNodes: Array.from(visited),
    explorationTrace,
    targetReached: reachedExitId,
    totalHops: path.length > 0 ? path.length - 1 : 0,
    wavefrontLevels: path.length,
  };
}

/**
 * Computes life-safety performance metrics for a BFS computed route
 * @param {Object} graph - The evacuation graph
 * @param {string[]} path - Ordered array of zone IDs in the evacuation path
 * @returns {Object} Detailed evacuation metrics
 */
export function computeRouteSafetyMetrics(graph, path) {
  if (!path || path.length === 0) {
    return {
      totalDistanceMeters: 0,
      estimatedTimeSeconds: 0,
      safetyScore: 0,
      hazardRisk: 'CRITICAL',
      doorHops: 0,
      staircasesTraversed: 0,
    };
  }

  let totalDistanceMeters = 0;
  let estimatedTimeSeconds = 0;
  let penaltySum = 0;
  let staircasesTraversed = 0;

  for (let i = 0; i < path.length; i++) {
    const nodeId = path[i];
    const node = graph.nodes[nodeId];

    if (!node) continue;

    if (node.type === NODE_TYPES.STAIRWELL) {
      staircasesTraversed += 1;
    }

    if (node.hazard === HAZARD_TYPES.CONGESTION) {
      penaltySum += 12;
    }

    if (node.hazard === HAZARD_TYPES.SMOKE) {
      penaltySum += 22;
    }

    // Distance to next adjacent zone
    if (i < path.length - 1) {
      const nextId = path[i + 1];
      const edge = (graph.adjacencyList[nodeId] || []).find(
        (e) => e.target === nextId
      );
      const segmentDistance = edge?.distance || 12;
      totalDistanceMeters += segmentDistance;

      let speed = WALKING_SPEEDS.NORMAL;
      if (node.type === NODE_TYPES.STAIRWELL) {
        speed = WALKING_SPEEDS.STAIRS_DESCENT;
      }
      if (node.hazard === HAZARD_TYPES.SMOKE) {
        speed = WALKING_SPEEDS.SMOKE_IMPAIRED;
      }

      estimatedTimeSeconds += segmentDistance / speed;
    }
  }

  const baseSafety = 100 - penaltySum - staircasesTraversed * 4;
  const safetyScore = Math.max(15, Math.min(100, Math.round(baseSafety)));

  let hazardRisk = 'LOW';
  if (safetyScore < 50) hazardRisk = 'HIGH';
  else if (safetyScore < 75) hazardRisk = 'MODERATE';

  return {
    totalDistanceMeters: Math.round(totalDistanceMeters),
    estimatedTimeSeconds: Math.round(estimatedTimeSeconds),
    safetyScore,
    hazardRisk,
    doorHops: Math.max(0, path.length - 1),
    staircasesTraversed,
  };
}

/**
 * ============================================================================
 * PRESET ARCHITECTURAL BLUEPRINT SCENARIOS (GRAPH REPRESENTATIONS)
 * ============================================================================
 */

export const BLUEPRINT_SCENARIOS = {
  HIGH_RISE_OFFICE: {
    id: 'high-rise',
    name: 'Metropolis Corporate High-Rise',
    floor: 'Floor 14 Commercial Wing',
    description: 'High-density corporate floor with executive offices, software labs, sky lobby atrium, and dual fire exits.',
    defaultStart: 'ROOM_1402',
    defaultExits: ['STAIR_NORTH', 'STAIR_SOUTH'],
    graph: {
      nodes: {
        ROOM_1401: { id: 'ROOM_1401', name: 'Boardroom A', type: NODE_TYPES.ROOM, x: 120, y: 100, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 25 },
        ROOM_1402: { id: 'ROOM_1402', name: 'Software Lab 14B', type: NODE_TYPES.ROOM, x: 120, y: 220, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 40 },
        ROOM_1403: { id: 'ROOM_1403', name: 'Finance Suite', type: NODE_TYPES.ROOM, x: 120, y: 340, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 20 },
        CORR_WEST: { id: 'CORR_WEST', name: 'West Corridor', type: NODE_TYPES.CORRIDOR, x: 260, y: 220, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 100 },
        ATRIUM_MAIN: { id: 'ATRIUM_MAIN', name: 'Central Sky Lobby', type: NODE_TYPES.ATRIUM, x: 420, y: 220, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 150 },
        CORR_NORTH: { id: 'CORR_NORTH', name: 'North Hallway', type: NODE_TYPES.CORRIDOR, x: 420, y: 100, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 80 },
        CORR_SOUTH: { id: 'CORR_SOUTH', name: 'South Hallway', type: NODE_TYPES.CORRIDOR, x: 420, y: 340, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 80 },
        ROOM_1404: { id: 'ROOM_1404', name: 'Server & UPS Vault', type: NODE_TYPES.ROOM, x: 580, y: 100, floor: 14, hazard: HAZARD_TYPES.FIRE, capacity: 5 },
        ROOM_1405: { id: 'ROOM_1405', name: 'Cafeteria & Pantry', type: NODE_TYPES.ROOM, x: 580, y: 340, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 60 },
        CORR_EAST: { id: 'CORR_EAST', name: 'East Gallery', type: NODE_TYPES.CORRIDOR, x: 580, y: 220, floor: 14, hazard: HAZARD_TYPES.SMOKE, capacity: 80 },
        STAIR_NORTH: { id: 'STAIR_NORTH', name: 'Fire Exit Stair North', type: NODE_TYPES.EXIT, x: 740, y: 100, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 200 },
        STAIR_SOUTH: { id: 'STAIR_SOUTH', name: 'Emergency Stair South', type: NODE_TYPES.EXIT, x: 740, y: 340, floor: 14, hazard: HAZARD_TYPES.NONE, capacity: 200 },
      },
      adjacencyList: {
        ROOM_1401: [{ target: 'CORR_NORTH', distance: 15 }, { target: 'CORR_WEST', distance: 18 }],
        ROOM_1402: [{ target: 'CORR_WEST', distance: 12 }],
        ROOM_1403: [{ target: 'CORR_WEST', distance: 16 }, { target: 'CORR_SOUTH', distance: 20 }],
        CORR_WEST: [
          { target: 'ROOM_1401', distance: 18 },
          { target: 'ROOM_1402', distance: 12 },
          { target: 'ROOM_1403', distance: 16 },
          { target: 'ATRIUM_MAIN', distance: 22 },
        ],
        ATRIUM_MAIN: [
          { target: 'CORR_WEST', distance: 22 },
          { target: 'CORR_NORTH', distance: 16 },
          { target: 'CORR_SOUTH', distance: 16 },
          { target: 'CORR_EAST', distance: 20 },
        ],
        CORR_NORTH: [
          { target: 'ROOM_1401', distance: 15 },
          { target: 'ATRIUM_MAIN', distance: 16 },
          { target: 'ROOM_1404', distance: 18 },
          { target: 'STAIR_NORTH', distance: 28 },
        ],
        CORR_SOUTH: [
          { target: 'ROOM_1403', distance: 20 },
          { target: 'ATRIUM_MAIN', distance: 16 },
          { target: 'ROOM_1405', distance: 18 },
          { target: 'STAIR_SOUTH', distance: 24 },
        ],
        ROOM_1404: [
          { target: 'CORR_NORTH', distance: 18 },
          { target: 'STAIR_NORTH', distance: 14, isBlocked: true },
        ],
        ROOM_1405: [
          { target: 'CORR_SOUTH', distance: 18 },
          { target: 'CORR_EAST', distance: 14 },
          { target: 'STAIR_SOUTH', distance: 16 },
        ],
        CORR_EAST: [
          { target: 'ATRIUM_MAIN', distance: 20 },
          { target: 'ROOM_1405', distance: 14 },
          { target: 'STAIR_SOUTH', distance: 22 },
        ],
        STAIR_NORTH: [
          { target: 'CORR_NORTH', distance: 28 },
          { target: 'ROOM_1404', distance: 14, isBlocked: true },
        ],
        STAIR_SOUTH: [
          { target: 'CORR_SOUTH', distance: 24 },
          { target: 'ROOM_1405', distance: 16 },
          { target: 'CORR_EAST', distance: 22 },
        ],
      },
    },
  },

  HOSPITAL_TRAUMA_CENTER: {
    id: 'hospital',
    name: 'Saint Luke Regional Trauma Center',
    floor: 'Level 2 Acute Care & ICU',
    description: 'Critical medical facility with triage atrium, stretcher-wide corridors, pharmacy vault, and ramp egress.',
    defaultStart: 'ICU_ROOM_201',
    defaultExits: ['RAMP_EAST', 'FIRE_DOOR_WEST'],
    graph: {
      nodes: {
        ICU_ROOM_201: { id: 'ICU_ROOM_201', name: 'ICU Pod A (4 Beds)', type: NODE_TYPES.ROOM, x: 120, y: 120, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 10 },
        SURG_SUITE_B: { id: 'SURG_SUITE_B', name: 'Operating Theatre 3', type: NODE_TYPES.ROOM, x: 120, y: 280, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 15 },
        TRIAGE_HALL: { id: 'TRIAGE_HALL', name: 'Central Triage Hall', type: NODE_TYPES.ATRIUM, x: 300, y: 200, floor: 2, hazard: HAZARD_TYPES.CONGESTION, capacity: 120 },
        PHARM_VAULT: { id: 'PHARM_VAULT', name: 'Central Pharmacy', type: NODE_TYPES.ROOM, x: 300, y: 80, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 12 },
        CORR_ICU: { id: 'CORR_ICU', name: 'Sterile ICU Corridor', type: NODE_TYPES.CORRIDOR, x: 300, y: 330, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 60 },
        FIRE_DOOR_WEST: { id: 'FIRE_DOOR_WEST', name: 'West Fire Exit & Ramp', type: NODE_TYPES.EXIT, x: 120, y: 400, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 150 },
        MED_STAIR_CENTRAL: { id: 'MED_STAIR_CENTRAL', name: 'Staff Stairwell', type: NODE_TYPES.STAIRWELL, x: 480, y: 120, floor: 2, hazard: HAZARD_TYPES.SMOKE, capacity: 50 },
        CORR_EQUIPMENT: { id: 'CORR_EQUIPMENT', name: 'Medical Supply Corridor', type: NODE_TYPES.CORRIDOR, x: 500, y: 260, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 40 },
        RECOVERY_WARD: { id: 'RECOVERY_WARD', name: 'Post-Op Recovery', type: NODE_TYPES.ROOM, x: 680, y: 260, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 30 },
        RAMP_EAST: { id: 'RAMP_EAST', name: 'East Evacuation Ramp', type: NODE_TYPES.EXIT, x: 740, y: 120, floor: 2, hazard: HAZARD_TYPES.NONE, capacity: 250 },
      },
      adjacencyList: {
        ICU_ROOM_201: [{ target: 'TRIAGE_HALL', distance: 16 }, { target: 'PHARM_VAULT', distance: 18 }],
        SURG_SUITE_B: [{ target: 'TRIAGE_HALL', distance: 14 }, { target: 'CORR_ICU', distance: 12 }, { target: 'FIRE_DOOR_WEST', distance: 22 }],
        TRIAGE_HALL: [
          { target: 'ICU_ROOM_201', distance: 16 },
          { target: 'SURG_SUITE_B', distance: 14 },
          { target: 'PHARM_VAULT', distance: 14 },
          { target: 'CORR_ICU', distance: 15 },
          { target: 'CORR_EQUIPMENT', distance: 24 },
        ],
        PHARM_VAULT: [{ target: 'ICU_ROOM_201', distance: 18 }, { target: 'TRIAGE_HALL', distance: 14 }, { target: 'MED_STAIR_CENTRAL', distance: 20 }],
        CORR_ICU: [{ target: 'SURG_SUITE_B', distance: 12 }, { target: 'TRIAGE_HALL', distance: 15 }, { target: 'FIRE_DOOR_WEST', distance: 18 }],
        FIRE_DOOR_WEST: [{ target: 'SURG_SUITE_B', distance: 22 }, { target: 'CORR_ICU', distance: 18 }],
        MED_STAIR_CENTRAL: [{ target: 'PHARM_VAULT', distance: 20 }, { target: 'RAMP_EAST', distance: 24 }],
        CORR_EQUIPMENT: [{ target: 'TRIAGE_HALL', distance: 24 }, { target: 'RECOVERY_WARD', distance: 16 }, { target: 'RAMP_EAST', distance: 26 }],
        RECOVERY_WARD: [{ target: 'CORR_EQUIPMENT', distance: 16 }, { target: 'RAMP_EAST', distance: 18 }],
        RAMP_EAST: [
          { target: 'MED_STAIR_CENTRAL', distance: 24 },
          { target: 'CORR_EQUIPMENT', distance: 26 },
          { target: 'RECOVERY_WARD', distance: 18 },
        ],
      },
    },
  },

  UNDERGROUND_METRO: {
    id: 'metro',
    name: 'Grand Central Subsurface Metro Station',
    floor: 'Platform Concourse Level -2',
    description: 'Subterranean mass transit terminal with passenger platforms, turnstile concourse, and dual surface egress portals.',
    defaultStart: 'SUB_PLATFORM_3',
    defaultExits: ['SURFACE_EXIT_A', 'SURFACE_EXIT_B'],
    graph: {
      nodes: {
        SUB_PLATFORM_3: { id: 'SUB_PLATFORM_3', name: 'Platform 3 (Southbound)', type: NODE_TYPES.ROOM, x: 120, y: 150, floor: -2, hazard: HAZARD_TYPES.NONE, capacity: 300 },
        SUB_PLATFORM_4: { id: 'SUB_PLATFORM_4', name: 'Platform 4 (Express)', type: NODE_TYPES.ROOM, x: 120, y: 300, floor: -2, hazard: HAZARD_TYPES.NONE, capacity: 250 },
        CROSS_TUNNEL: { id: 'CROSS_TUNNEL', name: 'Underpass Concourse', type: NODE_TYPES.CORRIDOR, x: 280, y: 220, floor: -2, hazard: HAZARD_TYPES.NONE, capacity: 180 },
        CENTRAL_MEZZANINE: { id: 'CENTRAL_MEZZANINE', name: 'Turnstile Ticketing Hall', type: NODE_TYPES.ATRIUM, x: 440, y: 220, floor: -2, hazard: HAZARD_TYPES.NONE, capacity: 400 },
        TUNNEL_VENT_SHAFT: { id: 'TUNNEL_VENT_SHAFT', name: 'Auxiliary Vent Shaft', type: NODE_TYPES.CORRIDOR, x: 440, y: 90, floor: -2, hazard: HAZARD_TYPES.FIRE, capacity: 20 },
        ESCALATOR_SHAFT_A: { id: 'ESCALATOR_SHAFT_A', name: 'North Escalator Shaft', type: NODE_TYPES.STAIRWELL, x: 600, y: 120, floor: -1, hazard: HAZARD_TYPES.NONE, capacity: 150 },
        ESCALATOR_SHAFT_B: { id: 'ESCALATOR_SHAFT_B', name: 'South Stair Passage', type: NODE_TYPES.STAIRWELL, x: 600, y: 320, floor: -1, hazard: HAZARD_TYPES.SMOKE, capacity: 120 },
        SURFACE_EXIT_A: { id: 'SURFACE_EXIT_A', name: 'North Plaza Surface Portal', type: NODE_TYPES.EXIT, x: 760, y: 120, floor: 0, hazard: HAZARD_TYPES.NONE, capacity: 500 },
        SURFACE_EXIT_B: { id: 'SURFACE_EXIT_B', name: 'Avenue Promenade Exit', type: NODE_TYPES.EXIT, x: 760, y: 320, floor: 0, hazard: HAZARD_TYPES.NONE, capacity: 500 },
      },
      adjacencyList: {
        SUB_PLATFORM_3: [{ target: 'CROSS_TUNNEL', distance: 20 }, { target: 'TUNNEL_VENT_SHAFT', distance: 30 }],
        SUB_PLATFORM_4: [{ target: 'CROSS_TUNNEL', distance: 22 }],
        CROSS_TUNNEL: [
          { target: 'SUB_PLATFORM_3', distance: 20 },
          { target: 'SUB_PLATFORM_4', distance: 22 },
          { target: 'CENTRAL_MEZZANINE', distance: 25 },
        ],
        CENTRAL_MEZZANINE: [
          { target: 'CROSS_TUNNEL', distance: 25 },
          { target: 'TUNNEL_VENT_SHAFT', distance: 18 },
          { target: 'ESCALATOR_SHAFT_A', distance: 22 },
          { target: 'ESCALATOR_SHAFT_B', distance: 22 },
        ],
        TUNNEL_VENT_SHAFT: [
          { target: 'SUB_PLATFORM_3', distance: 30 },
          { target: 'CENTRAL_MEZZANINE', distance: 18 },
          { target: 'SURFACE_EXIT_A', distance: 35, isBlocked: true },
        ],
        ESCALATOR_SHAFT_A: [
          { target: 'CENTRAL_MEZZANINE', distance: 22 },
          { target: 'SURFACE_EXIT_A', distance: 18 },
        ],
        ESCALATOR_SHAFT_B: [
          { target: 'CENTRAL_MEZZANINE', distance: 22 },
          { target: 'SURFACE_EXIT_B', distance: 20 },
        ],
        SURFACE_EXIT_A: [{ target: 'ESCALATOR_SHAFT_A', distance: 18 }],
        SURFACE_EXIT_B: [{ target: 'ESCALATOR_SHAFT_B', distance: 20 }],
      },
    },
  },
};
