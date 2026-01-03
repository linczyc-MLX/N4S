/**
 * INDEX.TS ADDITIONS
 * 
 * Add these exports to the existing src/mansion-program/index.ts file
 * after the existing exports.
 */

// ============================================================================
// ADD THESE LINES TO src/mansion-program/index.ts
// ============================================================================

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

// Test utilities - add to existing test exports section
export {
  executiveFamilyKYC,
  emptyNestersKYC,
  multiGenKYC,
  runTests as runAdjacencyTests
} from './test/adjacency-recommender-test';
