/**
 * N4S Mansion Program Validation Engine
 * 
 * Enhanced with graph-based path tracing for the 5 Critical Red Flags:
 * 1. Guest circulation crosses primary suite threshold
 * 2. Deliveries/refuse routes pass through FOH rooms
 * 3. Zone 3 functions share walls/ceilings with Zone 0 bedrooms
 * 4. No principal-level show kitchen
 * 5. Guest route to dining/terrace crosses kitchen work aisle
 * 
 * @module validation-engine
 */

import type {
  ValidationResult,
  RedFlag,
  RequiredBridge,
  ModuleScore,
  OperatingModel,
  LifestylePriorities,
  GateStatus,
  PlanBrief,
  PlanGraph,
  Room,
  NamedPath,
  SharedWall,
  AcousticZone
} from "../shared/schema";

// Browser-compatible UUID generator
function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// TYPES
// ============================================================================

interface ValidationInput {
  projectId?: string;
  operatingModel: OperatingModel;
  lifestylePriorities: LifestylePriorities;
  planBrief?: PlanBrief;
  planGraph?: PlanGraph;
}

interface PathTraceResult {
  pathName: string;
  pathType: string;
  roomsTraversed: string[];
  violations: PathViolation[];
}

interface PathViolation {
  type: 'foh_crossing' | 'primary_threshold' | 'kitchen_aisle' | 'zone_conflict';
  room: string;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const moduleNames: Record<string, string> = {
  "module-01": "Kitchen Rules Engine",
  "module-02": "Entertaining Spine",
  "module-03": "Primary Suite Ecosystem",
  "module-04": "Guest Wing Logic",
  "module-05": "Media & Acoustic Control",
  "module-06": "Service Spine",
  "module-07": "Wellness Program",
  "module-08": "Staff Layer"
};

// Front-of-house rooms that service routes must never cross
const FOH_ROOMS = new Set([
  'FOY', 'GR', 'DR', 'FR', 'LIB', 'OFF',  // By code
  'Foyer', 'Gallery', 'Great Room', 'Dining', 'Dining Room', 'Family Room', 
  'Library', 'Office', 'Living Room', 'Salon', 'Drawing Room'  // By name
]);

// Primary suite threshold rooms
const PRIMARY_SUITE_ROOMS = new Set([
  'PRI', 'PRIBATH', 'PRICL', 'PRILOUNGE', 'PRISIT',  // By code
  'Primary Bedroom', 'Primary Bath', 'Primary Closet', 'Primary Lounge',
  'Primary Sitting', 'Master Bedroom', 'Master Bath', 'Master Closet'  // By name
]);

// Kitchen work aisle rooms
const KITCHEN_WORK_ROOMS = new Set([
  'KIT', 'CHEF', 'SCUL',  // By code
  'Kitchen', 'Show Kitchen', 'Chef\'s Kitchen', 'Scullery', 'Prep Kitchen'  // By name
]);

// Show kitchen identifiers (for red flag #4)
const SHOW_KITCHEN_CODES = new Set(['KIT']);
const SHOW_KITCHEN_NAMES = new Set([
  'Kitchen', 'Show Kitchen', 'Principal Kitchen', 'Main Kitchen'
]);

// Acoustic zone numeric values for comparison
const ACOUSTIC_ZONE_VALUES: Record<string, number> = {
  'zone_0': 0,
  'zone_1': 1,
  'zone_2': 2,
  'zone_3': 3
};

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

export function runValidation(input: ValidationInput): ValidationResult {
  const { operatingModel, lifestylePriorities, planBrief, planGraph } = input;
  
  // Collect all red flags
  const redFlags: RedFlag[] = [];
  
  // 1. Heuristic-based flags (operating model conflicts)
  const heuristicFlags = detectHeuristicRedFlags(operatingModel, lifestylePriorities);
  redFlags.push(...heuristicFlags);
  
  // 2. Graph-based path tracing flags (if plan graph provided)
  if (planGraph && planGraph.rooms.length > 0) {
    const pathTracingFlags = detectPathTracingRedFlags(planGraph);
    redFlags.push(...pathTracingFlags);
    
    // 3. Acoustic zone violations (shared walls)
    const acousticFlags = detectAcousticZoneViolations(planGraph);
    redFlags.push(...acousticFlags);
    
    // 4. Show kitchen presence check
    const kitchenFlag = detectMissingShowKitchen(planGraph);
    if (kitchenFlag) {
      redFlags.push(kitchenFlag);
    }
  }
  
  // 5. Adjacency matrix validation (if plan brief provided)
  if (planBrief && planBrief.adjacencyMatrix && planBrief.adjacencyMatrix.length > 0) {
    const adjacencyFlags = validateAdjacencyRequirements(planBrief);
    redFlags.push(...adjacencyFlags);
  }
  
  // Detect required bridges
  const requiredBridges = detectRequiredBridges(operatingModel, lifestylePriorities, planBrief);
  
  // Calculate module scores
  let moduleScores = calculateModuleScores(operatingModel, lifestylePriorities);
  
  // Adjust scores based on violations
  if (planBrief) {
    moduleScores = adjustScoresForViolations(moduleScores, redFlags, planBrief);
  }
  
  // Determine gate status
  const criticalFlagCount = redFlags.filter(f => f.severity === "critical").length;
  const missingBridgeCount = requiredBridges.filter(b => !b.isPresent).length;
  const overallScore = Math.round(
    moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length
  );
  
  let gateStatus: GateStatus = "pass";
  if (criticalFlagCount > 0) {
    gateStatus = "fail";
  } else if (missingBridgeCount > 0 || overallScore < 80 || redFlags.length > 0) {
    gateStatus = "warning";
  }
  
  return {
    id: randomUUID(),
    projectId: input.projectId || "",
    timestamp: new Date().toISOString(),
    gateStatus,
    redFlags,
    requiredBridges,
    moduleScores,
    overallScore
  };
}

// ============================================================================
// PATH TRACING - CRITICAL RED FLAGS
// ============================================================================

/**
 * Detect red flags by tracing named paths through the plan graph.
 * 
 * Red Flag #1: Guest circulation crosses primary suite threshold
 * Red Flag #2: Deliveries/refuse routes pass through FOH rooms
 * Red Flag #5: Guest route to dining/terrace crosses kitchen work aisle
 */
function detectPathTracingRedFlags(planGraph: PlanGraph): RedFlag[] {
  const flags: RedFlag[] = [];
  const roomMap = buildRoomMap(planGraph.rooms);
  
  for (const path of planGraph.namedPaths) {
    const traceResult = tracePath(path, roomMap);
    
    for (const violation of traceResult.violations) {
      flags.push(createPathViolationFlag(path, violation, traceResult.roomsTraversed));
    }
  }
  
  return flags;
}

/**
 * Build a lookup map from room ID to room object
 */
function buildRoomMap(rooms: Room[]): Map<string, Room> {
  const map = new Map<string, Room>();
  for (const room of rooms) {
    map.set(room.id, room);
  }
  return map;
}

/**
 * Trace a named path through rooms and detect violations
 */
function tracePath(path: NamedPath, roomMap: Map<string, Room>): PathTraceResult {
  const violations: PathViolation[] = [];
  const roomsTraversed: string[] = [];
  
  for (const roomId of path.roomIds) {
    const room = roomMap.get(roomId);
    if (!room) continue;
    
    roomsTraversed.push(room.name);
    
    // Check violations based on path type
    switch (path.type) {
      case 'delivery_route':
      case 'refuse_route':
        // Red Flag #2: Service routes must not cross FOH
        if (isRoomFOH(room)) {
          violations.push({
            type: 'foh_crossing',
            room: room.name,
            description: `${path.type === 'delivery_route' ? 'Delivery' : 'Refuse'} route passes through front-of-house room: ${room.name}`
          });
        }
        break;
        
      case 'guest_circulation':
        // Red Flag #1: Guest circulation must not cross primary suite threshold
        if (isRoomPrimarySuite(room)) {
          violations.push({
            type: 'primary_threshold',
            room: room.name,
            description: `Guest circulation crosses primary suite threshold at: ${room.name}`
          });
        }
        break;
        
      case 'foh_to_terrace':
        // Red Flag #5: Guest route to terrace must not cross kitchen work aisle
        if (isRoomKitchenWork(room)) {
          violations.push({
            type: 'kitchen_aisle',
            room: room.name,
            description: `Guest route to terrace crosses kitchen work aisle at: ${room.name}`
          });
        }
        break;
    }
  }
  
  return {
    pathName: path.name,
    pathType: path.type,
    roomsTraversed,
    violations
  };
}

/**
 * Check if a room is front-of-house
 */
function isRoomFOH(room: Room): boolean {
  // Check by tags first (most reliable)
  if (room.tags.includes('foh') || room.tags.includes('front_of_house')) {
    return true;
  }
  // Check by zone
  if (room.zone === 'formal' || room.zone === 'entertaining' || room.zone === 'arrival') {
    return true;
  }
  // Check by code/name
  const identifier = room.name.toUpperCase();
  for (const foh of FOH_ROOMS) {
    if (identifier.includes(foh.toUpperCase())) {
      return true;
    }
  }
  return FOH_ROOMS.has(room.name);
}

/**
 * Check if a room is part of the primary suite
 */
function isRoomPrimarySuite(room: Room): boolean {
  // Check by tags
  if (room.tags.includes('primary_suite') || room.tags.includes('master_suite')) {
    return true;
  }
  // Check by zone
  if (room.zone === 'primary' || room.zone === 'primary_suite' || room.zone === 'master') {
    return true;
  }
  // Check by code/name
  const identifier = room.name.toUpperCase();
  for (const pri of PRIMARY_SUITE_ROOMS) {
    if (identifier.includes(pri.toUpperCase())) {
      return true;
    }
  }
  return PRIMARY_SUITE_ROOMS.has(room.name);
}

/**
 * Check if a room is a kitchen work zone
 */
function isRoomKitchenWork(room: Room): boolean {
  // Check by tags
  if (room.tags.includes('kitchen_work') || room.tags.includes('work_aisle')) {
    return true;
  }
  // Check by code/name
  const identifier = room.name.toUpperCase();
  for (const kit of KITCHEN_WORK_ROOMS) {
    if (identifier.includes(kit.toUpperCase())) {
      return true;
    }
  }
  return KITCHEN_WORK_ROOMS.has(room.name);
}

/**
 * Create a RedFlag from a path violation
 */
function createPathViolationFlag(path: NamedPath, violation: PathViolation, roomsTraversed: string[]): RedFlag {
  const ruleIdMap: Record<string, string> = {
    'foh_crossing': 'critical-002',
    'primary_threshold': 'critical-001',
    'kitchen_aisle': 'critical-005',
    'zone_conflict': 'critical-003'
  };
  
  const correctiveActionMap: Record<string, string> = {
    'foh_crossing': 'Reroute service circulation through back-of-house areas. Consider adding a dedicated service corridor.',
    'primary_threshold': 'Redesign guest circulation to approach guest wing without crossing primary suite threshold. Add a buffer zone or redirect via common areas.',
    'kitchen_aisle': 'Provide an alternate guest route to terrace that bypasses the kitchen work triangle. Consider a butler pantry pass-through or gallery bypass.',
    'zone_conflict': 'Add acoustic buffer (vestibule, corridor, or solid partition) between conflicting zones.'
  };
  
  return {
    id: randomUUID(),
    ruleId: ruleIdMap[violation.type] || 'path-violation',
    severity: "critical",
    description: violation.description,
    affectedRooms: roomsTraversed,
    correctiveAction: correctiveActionMap[violation.type] || 'Review circulation path and eliminate violation.'
  };
}

// ============================================================================
// ACOUSTIC ZONE VALIDATION - RED FLAG #3
// ============================================================================

/**
 * Red Flag #3: Zone 3 functions share walls/ceilings with Zone 0 bedrooms
 * 
 * Checks shared wall declarations for acoustic zone conflicts.
 */
function detectAcousticZoneViolations(planGraph: PlanGraph): RedFlag[] {
  const flags: RedFlag[] = [];
  const roomMap = buildRoomMap(planGraph.rooms);
  
  for (const wall of planGraph.sharedWalls) {
    const room1 = roomMap.get(wall.room1Id);
    const room2 = roomMap.get(wall.room2Id);
    
    if (!room1 || !room2) continue;
    if (!room1.acousticZone || !room2.acousticZone) continue;
    
    const zone1 = ACOUSTIC_ZONE_VALUES[room1.acousticZone];
    const zone2 = ACOUSTIC_ZONE_VALUES[room2.acousticZone];
    
    // Critical violation: Zone 3 (high noise) adjacent to Zone 0 (silent/bedrooms)
    if ((zone1 === 3 && zone2 === 0) || (zone1 === 0 && zone2 === 3)) {
      const zone3Room = zone1 === 3 ? room1 : room2;
      const zone0Room = zone1 === 0 ? room1 : room2;
      const adjacencyType = wall.isFloor ? 'floor/ceiling' : 'wall';
      
      flags.push({
        id: randomUUID(),
        ruleId: 'critical-003',
        severity: "critical",
        description: `Acoustic conflict: Zone 3 room (${zone3Room.name}) shares ${adjacencyType} with Zone 0 bedroom (${zone0Room.name}). High-noise functions must not be adjacent to sleeping areas.`,
        affectedRooms: [zone3Room.name, zone0Room.name],
        correctiveAction: `Relocate ${zone3Room.name} away from ${zone0Room.name}, or insert a buffer zone (corridor, closet, or storage) between them. If structural constraints prevent relocation, specify enhanced acoustic construction (STC 60+ wall assembly).`
      });
    }
    
    // Warning: Zone 3 adjacent to Zone 1 (living areas) - less critical but noteworthy
    if ((zone1 === 3 && zone2 === 1) || (zone1 === 1 && zone2 === 3)) {
      const zone3Room = zone1 === 3 ? room1 : room2;
      const zone1Room = zone1 === 1 ? room1 : room2;
      
      flags.push({
        id: randomUUID(),
        ruleId: 'acoustic-002',
        severity: "warning",
        description: `Acoustic concern: Zone 3 room (${zone3Room.name}) is adjacent to Zone 1 living area (${zone1Room.name}). Consider acoustic treatment.`,
        affectedRooms: [zone3Room.name, zone1Room.name],
        correctiveAction: `Add sound lock vestibule at ${zone3Room.name} entry, or specify enhanced wall construction.`
      });
    }
  }
  
  return flags;
}

// ============================================================================
// SHOW KITCHEN CHECK - RED FLAG #4
// ============================================================================

/**
 * Red Flag #4: No principal-level show kitchen
 * 
 * Verifies that the plan includes a show kitchen on the principal level (Level 1).
 */
function detectMissingShowKitchen(planGraph: PlanGraph): RedFlag | null {
  // Look for a show kitchen on Level 1
  const hasShowKitchen = planGraph.rooms.some(room => {
    // Check by tags
    if (room.tags.includes('show_kitchen') || room.tags.includes('principal_kitchen')) {
      return true;
    }
    // Check by code
    if (SHOW_KITCHEN_CODES.has(room.id.toUpperCase()) || SHOW_KITCHEN_CODES.has(room.name.toUpperCase().replace(/\s+/g, ''))) {
      return true;
    }
    // Check by name
    for (const kitName of SHOW_KITCHEN_NAMES) {
      if (room.name.toLowerCase().includes(kitName.toLowerCase())) {
        return true;
      }
    }
    return false;
  });
  
  if (!hasShowKitchen) {
    return {
      id: randomUUID(),
      ruleId: 'critical-004',
      severity: "critical",
      description: "No principal-level show kitchen detected. Luxury residences require a presentation kitchen on the main living level, not hidden or basement-only.",
      affectedRooms: [],
      correctiveAction: "Add a show kitchen to Level 1 with island, tall glazing, and guest-appropriate finishes. The show kitchen should be adjacent to the family hub and have visual connection to entertaining areas."
    };
  }
  
  return null;
}

// ============================================================================
// ADJACENCY MATRIX VALIDATION
// ============================================================================

const relationshipDescriptions: Record<string, string> = {
  "A": "Adjacent (direct connection required)",
  "N": "Near (close proximity needed)",
  "B": "Buffered (buffer zone required)",
  "S": "Separate (isolation required)"
};

function validateAdjacencyRequirements(planBrief: PlanBrief): RedFlag[] {
  const flags: RedFlag[] = [];
  const spaceMap = new Map(planBrief.spaces.map(s => [s.code, s.name]));
  
  // Build bidirectional adjacency map from brief requirements
  const adjacencyMap = new Map<string, Map<string, string>>();
  
  for (const adj of planBrief.adjacencyMatrix) {
    // Add forward direction
    if (!adjacencyMap.has(adj.fromSpaceCode)) {
      adjacencyMap.set(adj.fromSpaceCode, new Map());
    }
    adjacencyMap.get(adj.fromSpaceCode)!.set(adj.toSpaceCode, adj.relationship);
    
    // Add reverse direction for consistency checking
    if (!adjacencyMap.has(adj.toSpaceCode)) {
      adjacencyMap.set(adj.toSpaceCode, new Map());
    }
    const existing = adjacencyMap.get(adj.toSpaceCode)!.get(adj.fromSpaceCode);
    if (!existing) {
      adjacencyMap.get(adj.toSpaceCode)!.set(adj.fromSpaceCode, adj.relationship);
    }
  }
  
  // Check for conflicting requirements
  const checkedPairs = new Set<string>();
  
  for (const adj of planBrief.adjacencyMatrix) {
    const pairKey = [adj.fromSpaceCode, adj.toSpaceCode].sort().join("-");
    if (checkedPairs.has(pairKey)) continue;
    checkedPairs.add(pairKey);
    
    const forwardRel = adj.relationship;
    const reverseRel = adjacencyMap.get(adj.toSpaceCode)?.get(adj.fromSpaceCode);
    
    // Separation conflicts with adjacency are critical
    if (reverseRel && forwardRel !== reverseRel) {
      if ((forwardRel === "S" && reverseRel === "A") || (forwardRel === "A" && reverseRel === "S")) {
        const fromName = spaceMap.get(adj.fromSpaceCode) || adj.fromSpaceCode;
        const toName = spaceMap.get(adj.toSpaceCode) || adj.toSpaceCode;
        
        flags.push({
          id: randomUUID(),
          ruleId: `adjacency-conflict-${adj.fromSpaceCode}-${adj.toSpaceCode}`,
          severity: "critical",
          description: `Conflicting requirements: ${fromName} and ${toName} have incompatible adjacency requirements (${relationshipDescriptions[forwardRel]} vs ${relationshipDescriptions[reverseRel]})`,
          affectedRooms: [fromName, toName],
          correctiveAction: "Resolve the conflicting adjacency requirements in the program"
        });
      }
    }
    
    // Validate separation requirements are not violated by node grouping
    if (forwardRel === "S") {
      const fromNode = planBrief.nodes.find(n => n.spaceCodes.includes(adj.fromSpaceCode));
      const toNode = planBrief.nodes.find(n => n.spaceCodes.includes(adj.toSpaceCode));
      
      if (fromNode && toNode && fromNode.id === toNode.id) {
        const fromName = spaceMap.get(adj.fromSpaceCode) || adj.fromSpaceCode;
        const toName = spaceMap.get(adj.toSpaceCode) || adj.toSpaceCode;
        
        flags.push({
          id: randomUUID(),
          ruleId: `adjacency-${adj.fromSpaceCode}-${adj.toSpaceCode}`,
          severity: "warning",
          description: `${fromName} and ${toName} require separation but are grouped in the same circulation node (${fromNode.name})`,
          affectedRooms: [fromName, toName],
          correctiveAction: "Consider relocating one space to a different circulation node or ensure adequate acoustic/visual buffering"
        });
      }
    }
  }
  
  // Validate critical adjacency requirements have both spaces present
  for (const adj of planBrief.adjacencyMatrix) {
    if (adj.relationship === "A") {
      const fromExists = spaceMap.has(adj.fromSpaceCode);
      const toExists = spaceMap.has(adj.toSpaceCode);
      
      if (!fromExists || !toExists) {
        const missingCode = !fromExists ? adj.fromSpaceCode : adj.toSpaceCode;
        const presentCode = fromExists ? adj.fromSpaceCode : adj.toSpaceCode;
        const presentName = spaceMap.get(presentCode) || presentCode;
        
        flags.push({
          id: randomUUID(),
          ruleId: `adjacency-missing-${adj.fromSpaceCode}-${adj.toSpaceCode}`,
          severity: "warning",
          description: `${presentName} requires adjacency to ${missingCode} but that space is not included in the program`,
          affectedRooms: [presentName],
          correctiveAction: `Consider adding ${missingCode} to the program or removing this adjacency requirement`
        });
      }
    }
  }
  
  return flags;
}

// ============================================================================
// HEURISTIC RED FLAGS (Operating Model Conflicts)
// ============================================================================

function detectHeuristicRedFlags(
  operatingModel: OperatingModel, 
  lifestylePriorities: LifestylePriorities
): RedFlag[] {
  const flags: RedFlag[] = [];
  
  if (lifestylePriorities.lateNightMedia && operatingModel.privacyPosture === "private") {
    flags.push({
      id: randomUUID(),
      ruleId: "acoustic-001",
      severity: "warning",
      description: "Late-night media use may conflict with private posture - ensure sound isolation",
      affectedRooms: ["Media Room", "Primary Suite"],
      correctiveAction: "Add sound lock vestibule between media and sleeping zones"
    });
  }
  
  if (operatingModel.entertainingLoad === "weekly" && operatingModel.staffingLevel === "none") {
    flags.push({
      id: randomUUID(),
      ruleId: "service-001",
      severity: "warning",
      description: "Weekly entertaining without staff may create service bottlenecks",
      affectedRooms: ["Kitchen", "Dining", "Service Areas"],
      correctiveAction: "Consider part-time staffing or enhanced self-service design"
    });
  }
  
  if (operatingModel.wetProgram === "full_wellness" && operatingModel.typology === "winter") {
    flags.push({
      id: randomUUID(),
      ruleId: "wellness-001",
      severity: "warning",
      description: "Full wellness program in winter residence requires enhanced humidity control",
      affectedRooms: ["Spa", "Steam Room", "Pool Area"],
      correctiveAction: "Confirm MEP dehumidification strategy for cold climate operation"
    });
  }
  
  if (lifestylePriorities.multiFamilyHosting && operatingModel.privacyPosture === "private") {
    flags.push({
      id: randomUUID(),
      ruleId: "privacy-001",
      severity: "warning", // Changed from critical - let path tracing catch actual violations
      description: "Multi-family hosting with private posture requires careful circulation design",
      affectedRooms: ["Primary Suite", "Guest Wing", "Common Areas"],
      correctiveAction: "Verify guest circulation does not cross primary suite threshold"
    });
  }
  
  if (lifestylePriorities.chefLedCooking && operatingModel.staffingLevel === "live_in") {
    flags.push({
      id: randomUUID(),
      ruleId: "kitchen-001",
      severity: "warning",
      description: "Chef-led cooking with live-in staff requires clear kitchen territory boundaries",
      affectedRooms: ["Show Kitchen", "Scullery", "Staff Kitchen"],
      correctiveAction: "Define primary cook zones and service support areas"
    });
  }
  
  return flags;
}

// ============================================================================
// BRIDGE DETECTION
// ============================================================================

function detectRequiredBridges(
  operatingModel: OperatingModel, 
  lifestylePriorities: LifestylePriorities,
  planBrief?: PlanBrief
): RequiredBridge[] {
  const bridges: RequiredBridge[] = [];
  const bridgeConfig = planBrief?.bridgeConfig;
  const hasBridgeConfig = bridgeConfig !== undefined;
  
  // Butler Pantry
  const needsButlerPantry = 
    (operatingModel.entertainingLoad === "monthly" || operatingModel.entertainingLoad === "weekly") &&
    (operatingModel.privacyPosture === "balanced" || operatingModel.privacyPosture === "formal");
  
  if (needsButlerPantry) {
    bridges.push({
      id: randomUUID(),
      name: "Butler Pantry Bridge",
      trigger: `${capitalize(operatingModel.entertainingLoad)} entertaining + ${capitalize(operatingModel.privacyPosture)} posture`,
      description: "Service corridor between kitchen and formal dining for seamless staff operation.",
      isPresent: hasBridgeConfig ? bridgeConfig.butlerPantry : true
    });
  }
  
  // Guest Autonomy Node
  const needsAutonomyNode = 
    lifestylePriorities.multiFamilyHosting ||
    operatingModel.typology === "vacation" ||
    operatingModel.typology === "winter";
  
  if (needsAutonomyNode) {
    bridges.push({
      id: randomUUID(),
      name: "Guest Autonomy Node",
      trigger: lifestylePriorities.multiFamilyHosting 
        ? "Multi-family hosting enabled"
        : `${capitalize(operatingModel.typology)} typology`,
      description: "Self-contained guest zone with independent entry, kitchenette, and living area.",
      isPresent: hasBridgeConfig ? bridgeConfig.guestAutonomy : true
    });
  }
  
  // Sound Lock Vestibule
  if (lifestylePriorities.lateNightMedia) {
    bridges.push({
      id: randomUUID(),
      name: "Sound Lock Vestibule",
      trigger: "Late-night media use enabled",
      description: "Acoustic buffer zone (double-door vestibule) between media room and bedroom wing.",
      isPresent: hasBridgeConfig ? bridgeConfig.soundLock : true
    });
  }
  
  // Wet-Feet Intercept
  const needsWetFeet = 
    operatingModel.wetProgram !== "none" ||
    lifestylePriorities.poolEntertainment;
  
  if (needsWetFeet) {
    bridges.push({
      id: randomUUID(),
      name: "Wet-Feet Intercept",
      trigger: operatingModel.wetProgram !== "none"
        ? `${formatWetProgram(operatingModel.wetProgram)} program`
        : "Pool entertainment enabled",
      description: "Transition zone with drainage, towel storage, and outdoor shower between pool and main house.",
      isPresent: hasBridgeConfig ? bridgeConfig.wetFeetIntercept : true
    });
  }
  
  // Ops Core
  if (operatingModel.staffingLevel !== "none") {
    bridges.push({
      id: randomUUID(),
      name: "Ops Core",
      trigger: `${formatStaffing(operatingModel.staffingLevel)} staffing`,
      description: "Dedicated operations hub for staff including secure package receipt and deliveries staging.",
      isPresent: hasBridgeConfig ? bridgeConfig.opsCore : true
    });
  }
  
  return bridges;
}

// ============================================================================
// MODULE SCORING
// ============================================================================

function calculateModuleScores(
  operatingModel: OperatingModel, 
  lifestylePriorities: LifestylePriorities
): ModuleScore[] {
  const baseScore = 75;
  
  return [
    {
      moduleId: "module-01",
      moduleName: moduleNames["module-01"],
      score: calculateKitchenScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-02",
      moduleName: moduleNames["module-02"],
      score: calculateEntertainingScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-03",
      moduleName: moduleNames["module-03"],
      score: calculatePrimarySuiteScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-04",
      moduleName: moduleNames["module-04"],
      score: calculateGuestWingScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-05",
      moduleName: moduleNames["module-05"],
      score: calculateMediaScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-06",
      moduleName: moduleNames["module-06"],
      score: calculateServiceScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-07",
      moduleName: moduleNames["module-07"],
      score: calculateWellnessScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    },
    {
      moduleId: "module-08",
      moduleName: moduleNames["module-08"],
      score: calculateStaffScore(baseScore, operatingModel, lifestylePriorities),
      threshold: 80,
      checklistItems: []
    }
  ];
}

function calculateKitchenScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (lp.chefLedCooking) score += 10;
  if (om.entertainingLoad === "weekly") score += 5;
  if (om.staffingLevel !== "none") score += 5;
  return Math.min(100, score);
}

function calculateEntertainingScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (om.entertainingLoad === "weekly" || om.entertainingLoad === "monthly") score += 10;
  if (lp.poolEntertainment) score += 5;
  if (om.privacyPosture === "open" || om.privacyPosture === "balanced") score += 5;
  return Math.min(100, score);
}

function calculatePrimarySuiteScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (om.privacyPosture === "private" || om.privacyPosture === "formal") score += 10;
  if (om.staffingLevel !== "none") score += 5;
  return Math.min(100, score);
}

function calculateGuestWingScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (lp.multiFamilyHosting) score += 10;
  if (om.typology === "vacation" || om.typology === "winter") score += 5;
  return Math.min(100, score);
}

function calculateMediaScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (lp.lateNightMedia) score += 5;
  if (om.privacyPosture === "private") score -= 5;
  return Math.min(100, Math.max(50, score));
}

function calculateServiceScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (om.staffingLevel === "full_time" || om.staffingLevel === "live_in") score += 10;
  if (om.entertainingLoad === "weekly") score += 5;
  return Math.min(100, score);
}

function calculateWellnessScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (om.wetProgram === "full_wellness") score += 15;
  else if (om.wetProgram === "pool_spa") score += 10;
  else if (om.wetProgram === "pool_only") score += 5;
  if (lp.fitnessRecovery) score += 5;
  return Math.min(100, score);
}

function calculateStaffScore(base: number, om: OperatingModel, lp: LifestylePriorities): number {
  let score = base;
  if (om.staffingLevel === "live_in") score += 15;
  else if (om.staffingLevel === "full_time") score += 10;
  else if (om.staffingLevel === "part_time") score += 5;
  return Math.min(100, score);
}

// ============================================================================
// SCORE ADJUSTMENTS
// ============================================================================

function adjustScoresForViolations(
  moduleScores: ModuleScore[], 
  redFlags: RedFlag[],
  planBrief: PlanBrief
): ModuleScore[] {
  const spaceToModule: Record<string, string> = {
    "KIT": "module-01", "SCUL": "module-01", "BKFST": "module-01", "CHEF": "module-01",
    "FOY": "module-02", "GR": "module-02", "FDR": "module-02", "TERR": "module-02", "DR": "module-02",
    "PRI": "module-03", "PRIBATH": "module-03", "PRICL": "module-03", "PRILOUNGE": "module-03",
    "GUEST1": "module-04", "GUEST2": "module-04", "GSL1": "module-04", "SEC1": "module-04",
    "MEDIA": "module-05", "LIB": "module-05",
    "MUD": "module-06", "LAUN": "module-06", "MEP": "module-06", "GAR": "module-06",
    "GYM": "module-07", "SPA": "module-07", "POOL": "module-07",
    "STAFF": "module-08"
  };
  
  const violationsPerModule: Record<string, number> = {};
  
  for (const flag of redFlags) {
    const penalty = flag.severity === "critical" ? 3 : 1;
    
    // Try to map affected rooms to modules
    for (const room of flag.affectedRooms) {
      const upperRoom = room.toUpperCase().replace(/\s+/g, '');
      
      // Direct code match
      if (spaceToModule[upperRoom]) {
        const moduleId = spaceToModule[upperRoom];
        violationsPerModule[moduleId] = (violationsPerModule[moduleId] || 0) + penalty;
        continue;
      }
      
      // Partial match
      for (const [code, moduleId] of Object.entries(spaceToModule)) {
        if (upperRoom.includes(code) || code.includes(upperRoom.slice(0, 3))) {
          violationsPerModule[moduleId] = (violationsPerModule[moduleId] || 0) + penalty;
          break;
        }
      }
    }
  }
  
  return moduleScores.map(score => {
    const violations = violationsPerModule[score.moduleId] || 0;
    if (violations > 0) {
      const deduction = violations * 5;
      return {
        ...score,
        score: Math.max(40, score.score - deduction)
      };
    }
    return score;
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

function formatWetProgram(program: string): string {
  const labels: Record<string, string> = {
    none: "None",
    pool_only: "Pool only",
    pool_spa: "Pool + Spa",
    full_wellness: "Full wellness"
  };
  return labels[program] || program;
}

function formatStaffing(level: string): string {
  const labels: Record<string, string> = {
    none: "No",
    part_time: "Part-time",
    full_time: "Full-time",
    live_in: "Live-in"
  };
  return labels[level] || level;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  detectPathTracingRedFlags,
  detectAcousticZoneViolations,
  detectMissingShowKitchen,
  detectHeuristicRedFlags,
  validateAdjacencyRequirements,
  tracePath,
  buildRoomMap
};
