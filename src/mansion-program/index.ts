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
  adjacencyMatrix
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

// Briefing Builder utilities
export {
  type BriefingBuilderState,
  type AppliedChange,
  loadPreset,
  applyUniqueRequirements,
  applyBridgeConfig,
  updateSpace,
  addCustomSpace,
  removeSpace,
  updateAdjacency,
  exportToPlanBrief,
  initializeFromKYC
} from './client/utils/briefing-builder-utils';

// Briefing Builder React hook
export {
  useBriefingBuilder,
  type UseBriefingBuilderOptions,
  type UseBriefingBuilderReturn,
  type ValidationPreview
} from './client/hooks/useBriefingBuilder';

// Briefing Builder React components
export { BriefingBuilder, type BriefingBuilderProps } from './client/components/BriefingBuilder';
export { SpaceEditor, type SpaceEditorProps } from './client/components/SpaceEditor';
export { AdjacencyMatrix, type AdjacencyMatrixProps } from './client/components/AdjacencyMatrix';
export { BridgePanel, type BridgePanelProps } from './client/components/BridgePanel';
export { ValidationPanel, type ValidationPanelProps } from './client/components/ValidationPanel';
export { ChangesLog, type ChangesLogProps } from './client/components/ChangesLog';

// Mermaid diagram generation
export {
  generateMermaidDiagram,
  generateBubbleDiagram,
  generateCirculationDiagram,
  generateSeparationDiagram,
  type MermaidOptions
} from './client/utils/mermaid-generator';

export { DiagramView, type DiagramViewProps } from './client/components/DiagramView';

// Adjacency Decisions
export {
  ADJACENCY_DECISIONS,
  getDecisionById,
  getDecisionsForPreset,
  getDefaultOption,
  getOptionById,
  type AdjacencyDecision,
  type DecisionOption,
  type PersonalizationChoice,
  type PersonalizationResult
} from './shared/adjacency-decisions';

// Adjacency Recommender
export {
  recommendAdjacencies,
  evaluateDecision,
  evaluatePersonalization,
  applyDecisionsToMatrix,
  deriveBridgeConfigFromChoices,
  type RecommendedDecision,
  type EvaluationResult
} from './server/adjacency-recommender';

// Adjacency test utilities
export {
  executiveFamilyKYC,
  emptyNestersKYC,
  multiGenKYC,
  runTests as runAdjacencyTests
} from './test/adjacency-recommender-test';

// Adjacency Personalization UI Components
export {
  AdjacencyPersonalization,
  type AdjacencyPersonalizationProps,
  type PersonalizationOutput
} from './client/components/AdjacencyPersonalization';

export {
  DecisionCard,
  type DecisionCardProps
} from './client/components/DecisionCard';

export {
  RecommendationsSummary,
  type RecommendationsSummaryProps
} from './client/components/RecommendationsSummary';

export {
  DecisionDetail,
  type DecisionDetailProps
} from './client/components/DecisionDetail';

export {
  PersonalizationResult,
  type PersonalizationResultProps
} from './client/components/PersonalizationResult';
