/**
 * N4S Mansion Program Validation Module
 * 
 * Core validation engine for luxury residential floor plans.
 * Validates against N4S methodology: adjacency rules, circulation logic,
 * acoustic zoning, and 8-module scoring system.
 * 
 * @module mansion-program
 */

// Schema exports - type definitions and Zod validators
export * from './shared/schema';
export * from './shared/kyc-schema';

// Validation engine (v2 with path tracing)
export { 
  runValidation,
  detectPathTracingRedFlags,
  detectAcousticZoneViolations,
  detectMissingShowKitchen,
  detectHeuristicRedFlags,
  validateAdjacencyRequirements,
  tracePath,
  buildRoomMap
} from './server/validation-engine-v2';

// KYC Integration
export {
  mapKYCToValidation,
  deriveOperatingModel,
  deriveLifestylePriorities,
  deriveBridgeConfig,
  extractUniqueRequirements,
  recommendPreset,
  calculateConfidenceScore,
  detectConflicts,
  type UniqueRequirement,
  type ValidationContext
} from './server/kyc-integration';

// Module definitions and adjacency data
export { 
  modulesData, 
  getModuleById, 
  getModuleByNumber,
  adjacencyRelations 
} from './server/modules-data';

// Baseline program presets (10K, 15K, 20K SF models)
export { 
  programPresets, 
  getPreset,
  type ProgramPreset 
} from './client/data/program-presets';

// Test utilities
export { 
  passingPlanGraph, 
  failingPlanGraph, 
  runTests as runValidationTests
} from './test/validation-test';

export {
  thornwoodEstate,
  multiGenCompound,
  executiveRetreat,
  runTests as runKYCTests
} from './test/kyc-integration-test';
