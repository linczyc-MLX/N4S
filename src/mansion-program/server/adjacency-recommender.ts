/**
 * Adjacency Recommender
 * 
 * Maps KYC responses to recommended adjacency decisions.
 * Evaluates choices and generates warnings.
 * 
 * @module adjacency-recommender
 */

import type { KYCResponse } from '../shared/kyc-schema';
import type { AdjacencyRequirement, BridgeConfig } from '../shared/schema';
import type { 
  AdjacencyDecision, 
  DecisionOption,
  PersonalizationChoice,
  PersonalizationResult 
} from '../shared/adjacency-decisions';
import {
  ADJACENCY_DECISIONS,
  getDecisionsForPreset,
  getOptionById
} from '../shared/adjacency-decisions';

// ============================================================================
// TYPES
// ============================================================================

export interface RecommendedDecision {
  decision: AdjacencyDecision;
  recommendedOption: DecisionOption;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  alternativeOptionIds: string[];  // Other reasonable choices
}

export interface EvaluationResult {
  isValid: boolean;
  warnings: string[];
  redFlags: string[];
  sfImpact: number;
  bridgesRequired: string[];
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

/**
 * Generate recommended adjacencies based on KYC responses
 */
export function recommendAdjacencies(
  kyc: KYCResponse,
  preset: '5k' | '10k' | '15k' | '20k'
): RecommendedDecision[] {
  const decisions = getDecisionsForPreset(preset);
  const recommendations: RecommendedDecision[] = [];
  
  for (const decision of decisions) {
    const recommendation = recommendForDecision(decision, kyc);
    recommendations.push(recommendation);
  }
  
  return recommendations;
}

/**
 * Recommend an option for a single decision based on KYC
 */
function recommendForDecision(
  decision: AdjacencyDecision,
  kyc: KYCResponse
): RecommendedDecision {
  const scores: { option: DecisionOption; score: number; reasons: string[] }[] = [];
  
  for (const option of decision.options) {
    const { score, reasons } = scoreOption(option, kyc);
    scores.push({ option, score, reasons });
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  const best = scores[0];
  const alternatives = scores
    .slice(1)
    .filter(s => s.score > 0)
    .map(s => s.option.id);
  
  // Determine confidence based on score differential
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (best.score >= 3) {
    confidence = 'high';
  } else if (best.score <= 1 || (scores[1] && scores[1].score >= best.score - 1)) {
    confidence = 'low';
  }
  
  return {
    decision,
    recommendedOption: best.option,
    confidence,
    reasoning: best.reasons.join('. ') || 'Default recommendation based on baseline preset.',
    alternativeOptionIds: alternatives
  };
}

/**
 * Score an option based on how well it matches KYC responses
 */
function scoreOption(
  option: DecisionOption,
  kyc: KYCResponse
): { score: number; reasons: string[] } {
  let score = option.isDefault ? 1 : 0;  // Default gets baseline score
  const reasons: string[] = [];
  
  for (const condition of option.triggerConditions) {
    const { matches, reason } = evaluateCondition(condition, kyc);
    if (matches) {
      score += 2;
      if (reason) reasons.push(reason);
    }
  }
  
  // Penalize options with warnings unless strongly triggered
  if (option.warnings.length > 0 && score < 3) {
    score -= 1;
  }
  
  return { score, reasons };
}

/**
 * Evaluate a trigger condition against KYC data
 */
function evaluateCondition(
  condition: string,
  kyc: KYCResponse
): { matches: boolean; reason: string } {
  // Parse and evaluate condition
  // Format: "field === value" or "field >= value" or "field.length > 0"
  
  try {
    // Handle specific known conditions
    
    // Work from home
    if (condition === 'workFromHome === "executive"') {
      if (kyc.privacyProfile?.workFromHome === 'executive') {
        return { matches: true, reason: 'You have an executive home office' };
      }
    }
    if (condition === 'workFromHome === "primary"') {
      if (kyc.privacyProfile?.workFromHome === 'primary') {
        return { matches: true, reason: 'You work from home primarily' };
      }
    }
    if (condition === 'workFromHome === "occasional"') {
      if (kyc.privacyProfile?.workFromHome === 'occasional') {
        return { matches: true, reason: 'You work from home occasionally' };
      }
    }
    
    // Client meetings
    if (condition === 'clientMeetingsAtHome === true') {
      if (kyc.privacyProfile?.clientMeetingsAtHome) {
        return { matches: true, reason: 'You host client meetings at home' };
      }
    }
    if (condition === 'clientMeetingsAtHome === false') {
      if (!kyc.privacyProfile?.clientMeetingsAtHome) {
        return { matches: true, reason: 'No client meetings at home' };
      }
    }
    
    // Children
    if (condition === 'childrenCount > 0') {
      if ((kyc.householdProfile?.childrenAges?.length || 0) > 0) {
        return { matches: true, reason: 'You have children' };
      }
    }
    if (condition === 'childrenCount >= 2') {
      if ((kyc.householdProfile?.childrenAges?.length || 0) >= 2) {
        return { matches: true, reason: 'You have multiple children' };
      }
    }
    
    // Privacy preference
    if (condition === 'privacyPreference === "sanctuary"') {
      if (kyc.privacyProfile?.preference === 'sanctuary') {
        return { matches: true, reason: 'You prefer maximum privacy' };
      }
    }
    if (condition === 'privacyPreference === "selective"') {
      if (kyc.privacyProfile?.preference === 'selective') {
        return { matches: true, reason: 'You prefer selective privacy' };
      }
    }
    if (condition === 'privacyPreference === "formal"') {
      if (kyc.privacyProfile?.preference === 'formal') {
        return { matches: true, reason: 'You prefer formal separation' };
      }
    }
    
    // Cooking style
    if (condition === 'cookingStyle === "enthusiast"') {
      if (kyc.kitchenProfile?.cookingStyle === 'enthusiast') {
        return { matches: true, reason: 'You\'re an enthusiast cook' };
      }
    }
    if (condition === 'cookingStyle === "casual"') {
      if (kyc.kitchenProfile?.cookingStyle === 'casual') {
        return { matches: true, reason: 'You have a casual cooking style' };
      }
    }
    if (condition === 'cookingStyle === "professional"') {
      if (kyc.kitchenProfile?.cookingStyle === 'professional') {
        return { matches: true, reason: 'You cook at a professional level' };
      }
    }
    if (condition === 'cookingStyle === "serious"') {
      if (kyc.kitchenProfile?.cookingStyle === 'serious') {
        return { matches: true, reason: 'You\'re a serious home cook' };
      }
    }
    
    // Primary cook
    if (condition === 'primaryCook === "family"') {
      const cook = kyc.kitchenProfile?.primaryCook;
      if (cook === 'self' || cook === 'spouse' || cook === 'both') {
        return { matches: true, reason: 'Family members do the cooking' };
      }
    }
    if (condition === 'primaryCook === "staff"') {
      if (kyc.kitchenProfile?.primaryCook === 'staff') {
        return { matches: true, reason: 'Staff handles cooking' };
      }
    }
    
    // Staffing
    if (condition === 'staffingPreference === "full_service"') {
      if (kyc.staffingProfile?.preference === 'full_service') {
        return { matches: true, reason: 'You have full-service staffing' };
      }
    }
    if (condition === 'staffingPreference === "estate"') {
      if (kyc.staffingProfile?.preference === 'estate') {
        return { matches: true, reason: 'You have estate-level staffing' };
      }
    }
    if (condition === 'staffingPreference === "self_sufficient"') {
      if (kyc.staffingProfile?.preference === 'self_sufficient') {
        return { matches: true, reason: 'You prefer self-sufficient living' };
      }
    }
    
    // Late night media
    if (condition === 'lateNightMediaUse === true') {
      if (kyc.privacyProfile?.lateNightMediaUse) {
        return { matches: true, reason: 'You use media late at night' };
      }
    }
    if (condition === 'lateNightMediaUse === false') {
      if (!kyc.privacyProfile?.lateNightMediaUse) {
        return { matches: true, reason: 'No late-night media use' };
      }
    }
    
    // Guest frequency
    if (condition === 'guestStayFrequency === "frequently"') {
      if (kyc.privacyProfile?.guestStayFrequency === 'frequently') {
        return { matches: true, reason: 'You host guests frequently' };
      }
    }
    if (condition === 'guestStayFrequency === "occasionally"') {
      if (kyc.privacyProfile?.guestStayFrequency === 'occasionally') {
        return { matches: true, reason: 'You host guests occasionally' };
      }
    }
    if (condition === 'guestStayFrequency === "rarely"') {
      if (kyc.privacyProfile?.guestStayFrequency === 'rarely') {
        return { matches: true, reason: 'You rarely host overnight guests' };
      }
    }
    
    // Guest duration
    if (condition === 'typicalGuestStayDuration === "extended"') {
      if (kyc.privacyProfile?.typicalGuestStayDuration === 'extended') {
        return { matches: true, reason: 'Guests stay for extended periods' };
      }
    }
    if (condition === 'typicalGuestStayDuration === "week"') {
      if (kyc.privacyProfile?.typicalGuestStayDuration === 'week') {
        return { matches: true, reason: 'Guests typically stay a week' };
      }
    }
    
    // Multi-generational
    if (condition === 'multiGenerationalHosting === true') {
      if (kyc.privacyProfile?.multiGenerationalHosting) {
        return { matches: true, reason: 'You host multi-generational gatherings' };
      }
    }
    if (condition === 'multiGenerationalHosting === false') {
      if (!kyc.privacyProfile?.multiGenerationalHosting) {
        return { matches: true, reason: 'Single-generation household' };
      }
    }
    
    // Elderly residents
    if (condition === 'elderlyResidents === true') {
      if (kyc.householdProfile?.elderlyResidents) {
        return { matches: true, reason: 'You have elderly residents' };
      }
    }
    
    // Mobility
    if (condition === 'mobilityConsiderations === true') {
      if (kyc.householdProfile?.mobilityConsiderations) {
        return { matches: true, reason: 'Mobility considerations apply' };
      }
    }
    
    // Formal dining
    if (condition === 'formalDiningImportance >= 4') {
      if ((kyc.entertainingProfile?.formalDiningImportance || 0) >= 4) {
        return { matches: true, reason: 'Formal dining is important to you' };
      }
    }
    if (condition === 'formalDiningImportance <= 3') {
      if ((kyc.entertainingProfile?.formalDiningImportance || 3) <= 3) {
        return { matches: true, reason: 'Casual dining preference' };
      }
    }
    
    // Entertaining frequency
    if (condition === 'entertainingFrequency === "frequently"') {
      if (kyc.entertainingProfile?.frequency === 'frequently') {
        return { matches: true, reason: 'You entertain frequently' };
      }
    }
    if (condition === 'entertainingFrequency === "occasionally"') {
      if (kyc.entertainingProfile?.frequency === 'occasionally') {
        return { matches: true, reason: 'You entertain occasionally' };
      }
    }
    
    // Entertaining scale
    if (condition === 'typicalScale === "grand"') {
      if (kyc.entertainingProfile?.typicalScale === 'grand') {
        return { matches: true, reason: 'You host grand-scale events' };
      }
    }
    
    // Wellness
    if (condition === 'fitnessRoutine === "intensive"') {
      if (kyc.wellnessProfile?.fitnessRoutine === 'intensive') {
        return { matches: true, reason: 'You have an intensive fitness routine' };
      }
    }
    if (condition === 'fitnessRoutine === "regular"') {
      if (kyc.wellnessProfile?.fitnessRoutine === 'regular') {
        return { matches: true, reason: 'You exercise regularly' };
      }
    }
    if (condition === 'wellnessInterest === "resort"') {
      if (kyc.wellnessProfile?.interest === 'resort') {
        return { matches: true, reason: 'You want resort-level wellness' };
      }
    }
    if (condition === 'wellnessInterest === "dedicated"') {
      if (kyc.wellnessProfile?.interest === 'dedicated') {
        return { matches: true, reason: 'You want dedicated wellness facilities' };
      }
    }
    if (condition === 'wellnessInterest === "casual"') {
      if (kyc.wellnessProfile?.interest === 'basic') {
        return { matches: true, reason: 'You have basic wellness interest' };
      }
    }
    if (condition === 'poolDesired === true') {
      if (kyc.wellnessProfile?.poolDesired) {
        return { matches: true, reason: 'You want a pool' };
      }
    }
    
    // Wine collection
    if (condition === 'wineBottleCount >= 200') {
      if ((kyc.entertainingProfile?.wineBottleCount || 0) >= 200) {
        return { matches: true, reason: 'You have a significant wine collection' };
      }
    }
    
    // Pets
    if (condition === 'pets.length > 0') {
      if ((kyc.householdProfile?.pets?.length || 0) > 0) {
        return { matches: true, reason: 'You have pets' };
      }
    }
    
    // Levels
    if (condition === 'numberOfLevels >= 2') {
      if ((kyc.propertyContext?.numberOfLevels || 2) >= 2) {
        return { matches: true, reason: 'Multi-level home' };
      }
    }
    if (condition === 'numberOfLevels === 1') {
      if (kyc.propertyContext?.numberOfLevels === 1) {
        return { matches: true, reason: 'Single-level home' };
      }
    }
    
    // Basement
    if (condition === 'hasBasement === true') {
      if (kyc.propertyContext?.hasBasement) {
        return { matches: true, reason: 'Home has basement' };
      }
    }
    
    // Composition
    if (condition === 'composition === "family_with_children"') {
      const comp = kyc.householdProfile?.composition;
      if (comp === 'couple_young_children' || comp === 'couple_teenagers' || comp === 'blended_family') {
        return { matches: true, reason: 'Family with children' };
      }
    }
    if (condition === 'composition === "multi_generational"') {
      if (kyc.householdProfile?.composition === 'multi_generational') {
        return { matches: true, reason: 'Multi-generational household' };
      }
    }
    if (condition === 'composition === "blended_family"') {
      if (kyc.householdProfile?.composition === 'blended_family') {
        return { matches: true, reason: 'Blended family' };
      }
    }
    
    // Package delivery
    if (condition === 'packageDeliveryVolume === "heavy"') {
      if (kyc.staffingProfile?.securityRequirements === 'enhanced') {
        return { matches: true, reason: 'Heavy package delivery volume' };
      }
    }
    
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
  }
  
  return { matches: false, reason: '' };
}

// ============================================================================
// EVALUATION ENGINE
// ============================================================================

/**
 * Evaluate a personalization choice
 */
export function evaluateDecision(
  decision: AdjacencyDecision,
  selectedOptionId: string
): EvaluationResult {
  const option = getOptionById(decision, selectedOptionId);
  
  if (!option) {
    return {
      isValid: false,
      warnings: ['Invalid option selected'],
      redFlags: [],
      sfImpact: 0,
      bridgesRequired: []
    };
  }
  
  const warnings: string[] = [...option.warnings];
  const redFlags: string[] = [];
  const bridgesRequired: string[] = [];
  
  // Check for red flag conditions
  if (option.warnings.some(w => w.toLowerCase().includes('acoustic conflict'))) {
    redFlags.push('Potential acoustic issues');
  }
  if (option.warnings.some(w => w.toLowerCase().includes('circulation conflict'))) {
    redFlags.push('Circulation path concerns');
  }
  
  // Track required bridges
  if (option.bridgeRequired) {
    bridgesRequired.push(option.bridgeRequired);
  }
  
  return {
    isValid: true,
    warnings,
    redFlags,
    sfImpact: option.sfImpact || 0,
    bridgesRequired
  };
}

/**
 * Evaluate all personalization choices
 */
export function evaluatePersonalization(
  choices: PersonalizationChoice[]
): PersonalizationResult {
  let totalSfImpact = 0;
  const requiredBridges: string[] = [];
  let warningCount = 0;
  let redFlagCount = 0;
  
  for (const choice of choices) {
    const decision = ADJACENCY_DECISIONS.find(d => d.id === choice.decisionId);
    if (!decision) continue;
    
    const evaluation = evaluateDecision(decision, choice.selectedOptionId);
    
    totalSfImpact += evaluation.sfImpact;
    requiredBridges.push(...evaluation.bridgesRequired);
    warningCount += evaluation.warnings.length;
    redFlagCount += evaluation.redFlags.length;
    
    // Update choice with warnings
    choice.warnings = evaluation.warnings;
  }
  
  return {
    choices,
    totalSfImpact,
    requiredBridges: [...new Set(requiredBridges)],
    warningCount,
    redFlagCount
  };
}

// ============================================================================
// MATRIX APPLICATION
// ============================================================================

/**
 * Apply personalization choices to a base adjacency matrix
 */
export function applyDecisionsToMatrix(
  baseMatrix: AdjacencyRequirement[],
  choices: PersonalizationChoice[]
): AdjacencyRequirement[] {
  const matrix = [...baseMatrix];
  
  for (const choice of choices) {
    const decision = ADJACENCY_DECISIONS.find(d => d.id === choice.decisionId);
    if (!decision) continue;
    
    const option = getOptionById(decision, choice.selectedOptionId);
    if (!option) continue;
    
    // Find and update the relationship in the matrix
    const existingIndex = matrix.findIndex(
      a => a.fromSpaceCode === decision.primarySpace && a.toSpaceCode === option.targetSpace
    );
    
    const newRelation: AdjacencyRequirement = {
      fromSpaceCode: decision.primarySpace,
      toSpaceCode: option.targetSpace,
      relationship: option.relationship
    };
    
    if (existingIndex >= 0) {
      matrix[existingIndex] = newRelation;
    } else {
      matrix.push(newRelation);
    }
    
    // Also add reverse relationship for symmetry
    const reverseIndex = matrix.findIndex(
      a => a.fromSpaceCode === option.targetSpace && a.toSpaceCode === decision.primarySpace
    );
    
    const reverseRelation: AdjacencyRequirement = {
      fromSpaceCode: option.targetSpace,
      toSpaceCode: decision.primarySpace,
      relationship: option.relationship
    };
    
    if (reverseIndex >= 0) {
      matrix[reverseIndex] = reverseRelation;
    } else {
      matrix.push(reverseRelation);
    }
  }
  
  return matrix;
}

/**
 * Derive required bridge configuration from choices
 */
export function deriveBridgeConfigFromChoices(
  choices: PersonalizationChoice[]
): Partial<BridgeConfig> {
  const config: Partial<BridgeConfig> = {};
  
  for (const choice of choices) {
    const decision = ADJACENCY_DECISIONS.find(d => d.id === choice.decisionId);
    if (!decision) continue;
    
    const option = getOptionById(decision, choice.selectedOptionId);
    if (!option?.bridgeRequired) continue;
    
    switch (option.bridgeRequired) {
      case 'butlerPantry':
        config.butlerPantry = true;
        break;
      case 'soundLock':
        config.soundLock = true;
        break;
      case 'guestAutonomy':
        config.guestAutonomy = true;
        break;
      case 'wetFeetIntercept':
        config.wetFeetIntercept = true;
        break;
      case 'opsCore':
        config.opsCore = true;
        break;
    }
  }
  
  return config;
}

