import { z } from "zod";

// Enums for various properties
export const ProjectTypology = z.enum([
  "single_family",
  "multi_family",
  "vacation",
  "winter"
]);

export const EntertainingLoad = z.enum([
  "rare",
  "quarterly",
  "monthly",
  "weekly"
]);

export const StaffingLevel = z.enum([
  "none",
  "part_time",
  "full_time",
  "live_in"
]);

export const PrivacyPosture = z.enum([
  "open",
  "balanced",
  "formal",
  "private"
]);

export const WetProgram = z.enum([
  "none",
  "pool_only",
  "pool_spa",
  "full_wellness"
]);

export const GateStatus = z.enum([
  "pass",
  "warning",
  "fail",
  "pending"
]);

export const ProjectPhase = z.enum([
  "kickoff",
  "concept",
  "schematic",
  "development"
]);

export const AcousticZone = z.enum([
  "zone_0",
  "zone_1",
  "zone_2",
  "zone_3"
]);

export const RedFlagSeverity = z.enum([
  "critical",
  "warning"
]);

// Room schema
export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  zone: z.string(),
  acousticZone: AcousticZone.optional(),
  tags: z.array(z.string()).default([]),
  moduleId: z.string().optional()
});

// Edge schema (connections between rooms)
export const edgeSchema = z.object({
  id: z.string(),
  fromRoomId: z.string(),
  toRoomId: z.string(),
  type: z.enum(["door", "opening", "passage"]).default("door")
});

// Named path schema
export const namedPathSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["delivery_route", "refuse_route", "foh_to_terrace", "guest_circulation", "service_circulation"]),
  roomIds: z.array(z.string())
});

// Shared wall declaration
export const sharedWallSchema = z.object({
  id: z.string(),
  room1Id: z.string(),
  room2Id: z.string(),
  isFloor: z.boolean().default(false)
});

// Plan graph containing rooms, edges, paths, and walls
export const planGraphSchema = z.object({
  rooms: z.array(roomSchema).default([]),
  edges: z.array(edgeSchema).default([]),
  namedPaths: z.array(namedPathSchema).default([]),
  sharedWalls: z.array(sharedWallSchema).default([])
});

// Red flag schema
export const redFlagSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  severity: RedFlagSeverity,
  description: z.string(),
  affectedRooms: z.array(z.string()).default([]),
  correctiveAction: z.string()
});

// Required bridge schema
export const requiredBridgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: z.string(),
  description: z.string().optional(),
  isPresent: z.boolean().default(false)
});

// Module score schema
export const moduleScoreSchema = z.object({
  moduleId: z.string(),
  moduleName: z.string(),
  score: z.number().min(0).max(100),
  threshold: z.number().default(80),
  checklistItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    completed: z.boolean().default(false)
  })).default([])
});

// Validation result schema
export const validationResultSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  timestamp: z.string(),
  gateStatus: GateStatus,
  redFlags: z.array(redFlagSchema).default([]),
  requiredBridges: z.array(requiredBridgeSchema).default([]),
  moduleScores: z.array(moduleScoreSchema).default([]),
  overallScore: z.number().min(0).max(100)
});

// Project operating model inputs
export const operatingModelSchema = z.object({
  typology: ProjectTypology.default("single_family"),
  entertainingLoad: EntertainingLoad.default("monthly"),
  staffingLevel: StaffingLevel.default("none"),
  privacyPosture: PrivacyPosture.default("balanced"),
  wetProgram: WetProgram.default("none")
});

// Project lifestyle priorities
export const lifestylePrioritiesSchema = z.object({
  chefLedCooking: z.boolean().default(false),
  multiFamilyHosting: z.boolean().default(false),
  lateNightMedia: z.boolean().default(false),
  homeOffice: z.boolean().default(false),
  fitnessRecovery: z.boolean().default(false),
  poolEntertainment: z.boolean().default(false)
});

// Active preset type
export const ActivePreset = z.enum(["10k", "15k", "20k", "custom"]);

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  phase: ProjectPhase.default("kickoff"),
  activePreset: ActivePreset.optional(),
  operatingModel: operatingModelSchema.default({}),
  lifestylePriorities: lifestylePrioritiesSchema.default({}),
  scoreThreshold: z.number().min(0).max(100).default(80),
  planGraph: planGraphSchema.optional(),
  latestValidation: validationResultSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Insert schemas (for creating new records)
export const insertProjectSchema = projectSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  latestValidation: true 
});

export const insertRoomSchema = roomSchema.omit({ id: true });
export const insertEdgeSchema = edgeSchema.omit({ id: true });

// Module definition (static data)
export const moduleDefinitionSchema = z.object({
  id: z.string(),
  number: z.number().min(1).max(8),
  name: z.string(),
  shortName: z.string(),
  description: z.string(),
  primaryFocus: z.string(),
  gateDeliverables: z.array(z.string()),
  checklistItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional()
  }))
});

// Type exports
/* eslint-disable @typescript-eslint/no-redeclare */
export type ProjectTypology = z.infer<typeof ProjectTypology>;
export type EntertainingLoad = z.infer<typeof EntertainingLoad>;
export type StaffingLevel = z.infer<typeof StaffingLevel>;
export type PrivacyPosture = z.infer<typeof PrivacyPosture>;
export type WetProgram = z.infer<typeof WetProgram>;
export type GateStatus = z.infer<typeof GateStatus>;
export type ProjectPhase = z.infer<typeof ProjectPhase>;
export type AcousticZone = z.infer<typeof AcousticZone>;
export type RedFlagSeverity = z.infer<typeof RedFlagSeverity>;
export type ActivePreset = z.infer<typeof ActivePreset>;
/* eslint-enable @typescript-eslint/no-redeclare */

export type Room = z.infer<typeof roomSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type NamedPath = z.infer<typeof namedPathSchema>;
export type SharedWall = z.infer<typeof sharedWallSchema>;
export type PlanGraph = z.infer<typeof planGraphSchema>;

export type RedFlag = z.infer<typeof redFlagSchema>;
export type RequiredBridge = z.infer<typeof requiredBridgeSchema>;
export type ModuleScore = z.infer<typeof moduleScoreSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;

export type OperatingModel = z.infer<typeof operatingModelSchema>;
export type LifestylePriorities = z.infer<typeof lifestylePrioritiesSchema>;
export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertEdge = z.infer<typeof insertEdgeSchema>;

export type ModuleDefinition = z.infer<typeof moduleDefinitionSchema>;

// ============================================
// PLAN BRIEF SCHEMAS (for importing briefing documents)
// ============================================

// Adjacency relationship types: Adjacent, Near, Buffered, Separate
export const AdjacencyType = z.enum(["A", "N", "B", "S"]);

// Space definition in a plan brief (area program)
export const briefSpaceSchema = z.object({
  id: z.string(),
  code: z.string(), // Short code like FOY, GR, KIT
  name: z.string(),
  targetSF: z.number().min(0),
  zone: z.string(), // Zone grouping like "Front gallery + showcase"
  level: z.number().min(1).default(1), // Floor level
  bubbleId: z.string().optional(), // Reference to bubble diagram (A, B, C, etc.)
  rationale: z.string().optional()
});

// Adjacency requirement between two spaces
export const adjacencyRequirementSchema = z.object({
  fromSpaceCode: z.string(),
  toSpaceCode: z.string(),
  relationship: AdjacencyType // A, N, B, or S
});

// Circulation node (e.g., Front Gallery, Family Hub)
export const circulationNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  spaceCodes: z.array(z.string()) // Which spaces belong to this node
});

// Cross-link between nodes
export const crossLinkSchema = z.object({
  id: z.string(),
  number: z.number(), // 1, 2, 3
  name: z.string(),
  description: z.string(),
  fromSpaceCode: z.string(),
  toSpaceCode: z.string(),
  purpose: z.string().optional() // e.g., "Formal view axis", "Service link"
});

// Bridge configuration - explicit declaration of which operational bridges are included
export const bridgeConfigSchema = z.object({
  butlerPantry: z.boolean().default(false),    // Service staging between kitchen/dining
  guestAutonomy: z.boolean().default(false),   // Self-contained guest zone
  soundLock: z.boolean().default(false),       // Acoustic vestibule for media
  wetFeetIntercept: z.boolean().default(false), // Pool/spa transition zone
  opsCore: z.boolean().default(false)          // Staff operations hub
});

// Complete plan brief container
export const planBriefSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  totalSF: z.number().min(0),
  levels: z.number().min(1).default(2),
  hasBasement: z.boolean().default(false),
  bedrooms: z.number().min(0).default(5),
  executiveSummary: z.string().optional(),
  spaces: z.array(briefSpaceSchema).default([]),
  adjacencyMatrix: z.array(adjacencyRequirementSchema).default([]),
  nodes: z.array(circulationNodeSchema).default([]),
  crossLinks: z.array(crossLinkSchema).default([]),
  bridgeConfig: bridgeConfigSchema.optional(), // Explicit bridge presence declarations
  mermaidCode: z.string().optional(), // Raw Mermaid diagram code
  createdAt: z.string(),
  updatedAt: z.string()
});

// Insert schema for plan brief
export const insertPlanBriefSchema = planBriefSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type exports for plan brief
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AdjacencyType = z.infer<typeof AdjacencyType>;
export type BriefSpace = z.infer<typeof briefSpaceSchema>;
export type AdjacencyRequirement = z.infer<typeof adjacencyRequirementSchema>;
export type CirculationNode = z.infer<typeof circulationNodeSchema>;
export type CrossLink = z.infer<typeof crossLinkSchema>;
export type BridgeConfig = z.infer<typeof bridgeConfigSchema>;
export type PlanBrief = z.infer<typeof planBriefSchema>;
export type InsertPlanBrief = z.infer<typeof insertPlanBriefSchema>;

// ============================================
// PLAN BRIEF VERSION CONTROL
// ============================================

// Version snapshot of a plan brief
export const planBriefVersionSchema = z.object({
  id: z.string(),
  briefId: z.string(),
  versionNumber: z.number().min(1),
  name: z.string(),
  description: z.string().optional(),
  snapshot: planBriefSchema, // Full copy of the brief at this version
  createdAt: z.string()
});

export const insertPlanBriefVersionSchema = planBriefVersionSchema.omit({
  id: true,
  createdAt: true
});

export type PlanBriefVersion = z.infer<typeof planBriefVersionSchema>;
export type InsertPlanBriefVersion = z.infer<typeof insertPlanBriefVersionSchema>;
