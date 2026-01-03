import type {
  ValidationResult,
  RedFlag,
  RequiredBridge,
  ModuleScore,
  OperatingModel,
  LifestylePriorities,
  GateStatus,
  PlanBrief,
  AdjacencyRequirement
} from "../shared/schema";

// Browser-compatible UUID generator
function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ValidationInput {
  projectId?: string;
  operatingModel: OperatingModel;
  lifestylePriorities: LifestylePriorities;
  planBrief?: PlanBrief;
}

interface AdjacencyViolation {
  fromSpace: string;
  toSpace: string;
  required: string;
  reason: string;
}

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

export function runValidation(input: ValidationInput): ValidationResult {
  const { operatingModel, lifestylePriorities, planBrief } = input;
  
  const redFlags = detectRedFlags(operatingModel, lifestylePriorities);
  const requiredBridges = detectRequiredBridges(operatingModel, lifestylePriorities, planBrief);
  let moduleScores = calculateModuleScores(operatingModel, lifestylePriorities);
  
  // Validate adjacency requirements from plan brief
  if (planBrief && planBrief.adjacencyMatrix && planBrief.adjacencyMatrix.length > 0) {
    const adjacencyFlags = validateAdjacencyRequirements(planBrief);
    redFlags.push(...adjacencyFlags);
    
    // Adjust module scores based on adjacency violations
    moduleScores = adjustScoresForAdjacencyViolations(moduleScores, adjacencyFlags, planBrief);
  }
  
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

// Relationship priority: A (Adjacent) is strongest, S (Separate) is most restrictive
const relationshipStrength: Record<string, number> = { "A": 4, "N": 3, "B": 2, "S": 1 };

// Descriptions for adjacency relationships
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
  
  // Check for conflicting requirements (e.g., A-B says Adjacent but B-A says Separate)
  const checkedPairs = new Set<string>();
  
  for (const adj of planBrief.adjacencyMatrix) {
    const pairKey = [adj.fromSpaceCode, adj.toSpaceCode].sort().join("-");
    if (checkedPairs.has(pairKey)) continue;
    checkedPairs.add(pairKey);
    
    const forwardRel = adj.relationship;
    const reverseRel = adjacencyMap.get(adj.toSpaceCode)?.get(adj.fromSpaceCode);
    
    // Check if there's a conflicting relationship in the reverse direction
    if (reverseRel && forwardRel !== reverseRel) {
      // Separation conflicts with adjacency are critical
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
    
    // Validate separation requirements are not violated by proximity
    if (forwardRel === "S") {
      // Check if there's a cross-link or node grouping that violates separation
      const fromNode = planBrief.nodes.find(n => n.spaceCodes.includes(adj.fromSpaceCode));
      const toNode = planBrief.nodes.find(n => n.spaceCodes.includes(adj.toSpaceCode));
      
      // Spaces in the same node but requiring separation is a warning
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
  
  // Validate critical adjacency requirements (A relationships should have corresponding spaces in brief)
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

function adjustScoresForAdjacencyViolations(
  moduleScores: ModuleScore[], 
  adjacencyFlags: RedFlag[],
  planBrief: PlanBrief
): ModuleScore[] {
  // Map space codes to their module associations
  const spaceToModule: Record<string, string> = {
    "KIT": "module-01", "SCUL": "module-01", "BKFST": "module-01",
    "FOY": "module-02", "GR": "module-02", "FDR": "module-02", "TERR": "module-02",
    "PBED": "module-03", "PBATH": "module-03", "PCLOS": "module-03", "PSIT": "module-03",
    "GUEST1": "module-04", "GUEST2": "module-04", "GUEST3": "module-04", "GUEST4": "module-04",
    "MEDIA": "module-05", "LIB": "module-05",
    "GAR": "module-06", "MUD": "module-06", "LAUN": "module-06", "MECH": "module-06",
    "GYM": "module-07", "SPA": "module-07", "POOL": "module-07", "WLINK": "module-07",
    "STAFF": "module-08"
  };
  
  // Build name to code map for reverse lookup from plan brief
  const nameToCode = new Map(planBrief.spaces.map(s => [s.name, s.code]));
  
  // Count violations per module using space codes
  const violationsPerModule: Record<string, number> = {};
  const processedFlags = new Set<string>();
  
  for (const flag of adjacencyFlags) {
    // Skip duplicate processing
    if (processedFlags.has(flag.ruleId)) continue;
    processedFlags.add(flag.ruleId);
    
    // Extract space codes from various ruleId formats
    const rulePatterns = [
      /^adjacency-(\w+)-(\w+)$/,
      /^adjacency-conflict-(\w+)-(\w+)$/,
      /^adjacency-missing-(\w+)-(\w+)$/
    ];
    
    let matched = false;
    for (const pattern of rulePatterns) {
      const match = flag.ruleId.match(pattern);
      if (match) {
        const [, code1, code2] = match;
        const moduleId1 = spaceToModule[code1];
        const moduleId2 = spaceToModule[code2];
        
        // Apply penalty based on severity
        const penalty = flag.severity === "critical" ? 2 : 1;
        
        if (moduleId1) {
          violationsPerModule[moduleId1] = (violationsPerModule[moduleId1] || 0) + penalty;
        }
        if (moduleId2 && moduleId2 !== moduleId1) {
          violationsPerModule[moduleId2] = (violationsPerModule[moduleId2] || 0) + penalty;
        }
        matched = true;
        break;
      }
    }
    
    // Fallback: look up by room name
    if (!matched) {
      for (const room of flag.affectedRooms) {
        const code = nameToCode.get(room);
        if (code) {
          const moduleId = spaceToModule[code];
          if (moduleId) {
            const penalty = flag.severity === "critical" ? 2 : 1;
            violationsPerModule[moduleId] = (violationsPerModule[moduleId] || 0) + penalty;
          }
        }
      }
    }
  }
  
  // Adjust scores based on violations - 5 points per violation count, minimum score of 40
  return moduleScores.map(score => {
    const violations = violationsPerModule[score.moduleId] || 0;
    if (violations > 0) {
      const penalty = violations * 5;
      return {
        ...score,
        score: Math.max(40, score.score - penalty)
      };
    }
    return score;
  });
}

function detectRedFlags(
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
      severity: "critical",
      description: "Multi-family hosting conflicts with private posture - guest circulation may cross primary threshold",
      affectedRooms: ["Primary Suite", "Guest Wing", "Common Areas"],
      correctiveAction: "Redesign guest circulation to avoid primary suite threshold"
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

function detectRequiredBridges(
  operatingModel: OperatingModel, 
  lifestylePriorities: LifestylePriorities,
  planBrief?: PlanBrief
): RequiredBridge[] {
  const bridges: RequiredBridge[] = [];
  
  // Use explicit bridgeConfig if available - this is the authoritative source
  const bridgeConfig = planBrief?.bridgeConfig;
  const hasBridgeConfig = bridgeConfig !== undefined;
  
  const needsButlerPantry = 
    (operatingModel.entertainingLoad === "monthly" || operatingModel.entertainingLoad === "weekly") &&
    (operatingModel.privacyPosture === "balanced" || operatingModel.privacyPosture === "formal");
  
  if (needsButlerPantry) {
    // Use explicit config if available, otherwise default to true (assume compliant)
    const hasButlerPantry = hasBridgeConfig ? bridgeConfig.butlerPantry : true;
    bridges.push({
      id: randomUUID(),
      name: "Butler Pantry Bridge",
      trigger: `${capitalize(operatingModel.entertainingLoad)} entertaining + ${capitalize(operatingModel.privacyPosture)} posture`,
      description: "A service corridor or staging area between the kitchen and formal dining that allows staff to plate, garnish, and serve without crossing guest sightlines. Essential for seamless formal entertaining.",
      isPresent: hasButlerPantry
    });
  }
  
  const needsAutonomyNode = 
    lifestylePriorities.multiFamilyHosting ||
    operatingModel.typology === "vacation" ||
    operatingModel.typology === "winter";
  
  if (needsAutonomyNode) {
    // Use explicit config if available, otherwise default to true (assume compliant)
    const hasGuestAutonomy = hasBridgeConfig ? bridgeConfig.guestAutonomy : true;
    bridges.push({
      id: randomUUID(),
      name: "Guest Autonomy Node",
      trigger: lifestylePriorities.multiFamilyHosting 
        ? "Multi-family hosting enabled"
        : `${capitalize(operatingModel.typology)} typology`,
      description: "A self-contained guest zone with independent entry, kitchenette, and living area that allows extended-stay guests or family members to operate on their own schedule without impacting the primary household.",
      isPresent: hasGuestAutonomy
    });
  }
  
  if (lifestylePriorities.lateNightMedia) {
    // Use explicit config if available, otherwise default to true (assume compliant)
    const hasSoundLock = hasBridgeConfig ? bridgeConfig.soundLock : true;
    bridges.push({
      id: randomUUID(),
      name: "Sound Lock Vestibule",
      trigger: "Late-night media use enabled",
      description: "An acoustic buffer zone (typically a double-door vestibule) between the media room and bedroom wing that prevents sound transmission during late-night movie or gaming sessions.",
      isPresent: hasSoundLock
    });
  }
  
  const needsWetFeet = 
    operatingModel.wetProgram !== "none" ||
    lifestylePriorities.poolEntertainment;
  
  if (needsWetFeet) {
    // Use explicit config if available, otherwise default to true (assume compliant)
    const hasWetFeetIntercept = hasBridgeConfig ? bridgeConfig.wetFeetIntercept : true;
    bridges.push({
      id: randomUUID(),
      name: "Wet-Feet Intercept",
      trigger: operatingModel.wetProgram !== "none"
        ? `${formatWetProgram(operatingModel.wetProgram)} program`
        : "Pool entertainment enabled",
      description: "A transition zone between pool/spa areas and the main house with drainage, towel storage, outdoor shower, and changing space. Prevents wet feet and chlorine from tracking into finished interior spaces.",
      isPresent: hasWetFeetIntercept
    });
  }
  
  if (operatingModel.staffingLevel !== "none") {
    // Use explicit config if available, otherwise default to true (assume compliant)
    const hasOpsCore = hasBridgeConfig ? bridgeConfig.opsCore : true;
    bridges.push({
      id: randomUUID(),
      name: "Ops Core",
      trigger: `${formatStaffing(operatingModel.staffingLevel)} staffing`,
      description: "A dedicated operations hub for household staff including secure package receipt, deliveries staging, back-of-house access, staff break area, and building systems monitoring. Keeps service functions invisible to family and guests.",
      isPresent: hasOpsCore
    });
  }
  
  return bridges;
}

function calculateModuleScores(
  operatingModel: OperatingModel, 
  lifestylePriorities: LifestylePriorities
): ModuleScore[] {
  const baseScore = 75;
  
  const scores: ModuleScore[] = [
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
  
  return scores;
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
