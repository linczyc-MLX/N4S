/**
 * Adjacency Recommender Tests
 * 
 * Tests the recommendation engine with sample KYC profiles.
 */

import type { KYCResponse } from '../shared/kyc-schema';
import { 
  recommendAdjacencies,
  evaluateDecision,
  evaluatePersonalization,
  applyDecisionsToMatrix,
  deriveBridgeConfigFromChoices
} from '../server/adjacency-recommender';
import { 
  ADJACENCY_DECISIONS,
  getDecisionsForPreset,
  getDefaultOption
} from '../shared/adjacency-decisions';

// ============================================================================
// TEST KYC PROFILES
// ============================================================================

/**
 * Profile 1: Executive Family
 * - Works from home with client meetings
 * - Two children
 * - Entertains frequently
 * - Has pool and wellness interest
 */
export const executiveFamilyKYC: KYCResponse = {
  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 15000,
    numberOfLevels: 2,
    hasBasement: false
  },
  householdProfile: {
    composition: 'family_with_children',
    primaryResidents: 2,
    childrenCount: 2,
    pets: [{ type: 'dog', count: 1, size: 'large' }],
    elderlyResidents: false,
    mobilityConsiderations: false
  },
  entertainingProfile: {
    frequency: 'frequently',
    typicalScale: 'large',
    formalDiningImportance: 4,
    wineCollection: true,
    wineBottleCount: 300
  },
  staffingProfile: {
    preference: 'regular',
    securityRequirements: 'standard'
  },
  privacyProfile: {
    preference: 'selective',
    workFromHome: 'executive',
    clientMeetingsAtHome: true,
    lateNightMediaUse: true,
    guestStayFrequency: 'occasionally',
    multiGenerationalHosting: false
  },
  kitchenProfile: {
    cookingStyle: 'enthusiast',
    primaryCook: 'family',
    showKitchenImportance: 4
  },
  wellnessProfile: {
    interest: 'dedicated',
    poolDesired: true,
    poolType: 'lap',
    spaFeatures: ['sauna', 'steam'],
    fitnessRoutine: 'regular'
  }
};

/**
 * Profile 2: Empty Nesters
 * - No children at home
 * - Frequent extended guest stays (adult children visiting)
 * - Formal entertaining
 * - Full-service staffing
 */
export const emptyNestersKYC: KYCResponse = {
  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 12000,
    numberOfLevels: 2,
    hasBasement: true
  },
  householdProfile: {
    composition: 'couple',
    primaryResidents: 2,
    childrenCount: 0,
    pets: [],
    elderlyResidents: false,
    mobilityConsiderations: false
  },
  entertainingProfile: {
    frequency: 'frequently',
    typicalScale: 'moderate',
    formalDiningImportance: 5,
    wineCollection: true,
    wineBottleCount: 500
  },
  staffingProfile: {
    preference: 'full_service',
    securityRequirements: 'standard'
  },
  privacyProfile: {
    preference: 'formal',
    workFromHome: 'occasional',
    clientMeetingsAtHome: false,
    lateNightMediaUse: false,
    guestStayFrequency: 'frequently',
    typicalGuestStayDuration: 'extended',
    multiGenerationalHosting: true
  },
  kitchenProfile: {
    cookingStyle: 'casual',
    primaryCook: 'staff',
    showKitchenImportance: 3
  },
  wellnessProfile: {
    interest: 'casual',
    poolDesired: false,
    fitnessRoutine: 'occasional'
  }
};

/**
 * Profile 3: Multi-Gen Household
 * - Elderly parents living with family
 * - Mobility considerations
 * - Need for privacy AND proximity
 */
export const multiGenKYC: KYCResponse = {
  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 18000,
    numberOfLevels: 1, // Single level for accessibility
    hasBasement: false
  },
  householdProfile: {
    composition: 'multi_generational',
    primaryResidents: 4,
    childrenCount: 1,
    pets: [{ type: 'cat', count: 2 }],
    elderlyResidents: true,
    mobilityConsiderations: true
  },
  entertainingProfile: {
    frequency: 'occasionally',
    typicalScale: 'intimate',
    formalDiningImportance: 3
  },
  staffingProfile: {
    preference: 'regular',
    securityRequirements: 'enhanced'
  },
  privacyProfile: {
    preference: 'selective',
    workFromHome: 'primary',
    clientMeetingsAtHome: false,
    lateNightMediaUse: false,
    guestStayFrequency: 'rarely',
    multiGenerationalHosting: false
  },
  kitchenProfile: {
    cookingStyle: 'enthusiast',
    primaryCook: 'family',
    showKitchenImportance: 4
  },
  wellnessProfile: {
    interest: 'basic',
    poolDesired: false,
    fitnessRoutine: 'occasional'
  }
};

// ============================================================================
// TESTS
// ============================================================================

export function runTests(): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('ADJACENCY RECOMMENDER TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Decision library loaded
  console.log('TEST 1: Decision library loaded');
  const decisions = ADJACENCY_DECISIONS;
  if (decisions.length >= 10) {
    console.log(`  ✓ ${decisions.length} decisions defined`);
    passed++;
  } else {
    console.log(`  ✗ Expected 10+ decisions, got ${decisions.length}`);
    failed++;
  }
  
  // Test 2: All decisions have valid structure
  console.log('\nTEST 2: Decision structure validation');
  let structureValid = true;
  for (const decision of decisions) {
    if (!decision.id || !decision.title || !decision.options?.length) {
      console.log(`  ✗ Invalid decision: ${decision.id}`);
      structureValid = false;
    }
    for (const option of decision.options) {
      if (!option.id || !option.targetSpace || !option.relationship) {
        console.log(`  ✗ Invalid option in ${decision.id}: ${option.id}`);
        structureValid = false;
      }
    }
  }
  if (structureValid) {
    console.log('  ✓ All decisions have valid structure');
    passed++;
  } else {
    failed++;
  }
  
  // Test 3: Preset filtering
  console.log('\nTEST 3: Preset filtering');
  const decisions10k = getDecisionsForPreset('10k');
  const decisions15k = getDecisionsForPreset('15k');
  const decisions20k = getDecisionsForPreset('20k');
  console.log(`  10K preset: ${decisions10k.length} decisions`);
  console.log(`  15K preset: ${decisions15k.length} decisions`);
  console.log(`  20K preset: ${decisions20k.length} decisions`);
  if (decisions15k.length >= decisions10k.length) {
    console.log('  ✓ Larger presets have equal or more decisions');
    passed++;
  } else {
    console.log('  ✗ Preset filtering incorrect');
    failed++;
  }
  
  // Test 4: Executive Family recommendations
  console.log('\nTEST 4: Executive Family recommendations');
  const execRecs = recommendAdjacencies(executiveFamilyKYC, '15k');
  console.log(`  Generated ${execRecs.length} recommendations`);
  
  // Check office recommendation (should be near entry for client meetings)
  const officeRec = execRecs.find(r => r.decision.id === 'office-location');
  if (officeRec?.recommendedOption.id === 'off-entry') {
    console.log('  ✓ Office recommended near entry (client meetings)');
    passed++;
  } else {
    console.log(`  ✗ Office recommendation: ${officeRec?.recommendedOption.id}, expected off-entry`);
    failed++;
  }
  
  // Check media room recommendation (should be isolated for late-night use)
  const mediaRec = execRecs.find(r => r.decision.id === 'media-acoustics');
  if (mediaRec?.recommendedOption.id === 'media-isolated') {
    console.log('  ✓ Media room recommended isolated (late-night use)');
    passed++;
  } else {
    console.log(`  ✗ Media recommendation: ${mediaRec?.recommendedOption.id}, expected media-isolated`);
    failed++;
  }
  
  // Test 5: Empty Nesters recommendations
  console.log('\nTEST 5: Empty Nesters recommendations');
  const nesters = recommendAdjacencies(emptyNestersKYC, '10k');
  
  // Check guest suite (should be independent for extended stays)
  const guestRec = nesters.find(r => r.decision.id === 'guest-independence');
  if (guestRec?.recommendedOption.id === 'guest-independent') {
    console.log('  ✓ Guest suite recommended independent (extended stays)');
    passed++;
  } else {
    console.log(`  ✗ Guest recommendation: ${guestRec?.recommendedOption.id}, expected guest-independent`);
    failed++;
  }
  
  // Check dining (should be formal)
  const diningRec = nesters.find(r => r.decision.id === 'dining-formality');
  if (diningRec?.recommendedOption.id === 'dr-formal') {
    console.log('  ✓ Dining recommended formal (high importance)');
    passed++;
  } else {
    console.log(`  ✗ Dining recommendation: ${diningRec?.recommendedOption.id}, expected dr-formal`);
    failed++;
  }
  
  // Test 6: Multi-Gen recommendations
  console.log('\nTEST 6: Multi-Gen recommendations');
  const multiGen = recommendAdjacencies(multiGenKYC, '20k');
  
  // Check primary suite (should be wing for single-level/mobility)
  const primaryRec = multiGen.find(r => r.decision.id === 'primary-privacy');
  if (primaryRec?.recommendedOption.id === 'pri-wing') {
    console.log('  ✓ Primary suite recommended as wing (single-level/mobility)');
    passed++;
  } else {
    console.log(`  ✗ Primary recommendation: ${primaryRec?.recommendedOption.id}, expected pri-wing`);
    failed++;
  }
  
  // Test 7: Evaluation with warnings
  console.log('\nTEST 7: Evaluation with warnings');
  const officeDecision = ADJACENCY_DECISIONS.find(d => d.id === 'office-location')!;
  const evalResult = evaluateDecision(officeDecision, 'off-family');
  if (evalResult.warnings.length > 0) {
    console.log(`  ✓ Office near family generates ${evalResult.warnings.length} warning(s)`);
    console.log(`    - ${evalResult.warnings[0]}`);
    passed++;
  } else {
    console.log('  ✗ Expected warnings for office near family');
    failed++;
  }
  
  // Test 8: Bridge requirement detection
  console.log('\nTEST 8: Bridge requirement detection');
  const mediaDecision = ADJACENCY_DECISIONS.find(d => d.id === 'media-acoustics')!;
  const mediaEval = evaluateDecision(mediaDecision, 'media-isolated');
  if (mediaEval.bridgesRequired.includes('soundLock')) {
    console.log('  ✓ Isolated media requires soundLock bridge');
    passed++;
  } else {
    console.log('  ✗ Expected soundLock bridge requirement');
    failed++;
  }
  
  // Test 9: SF impact calculation
  console.log('\nTEST 9: SF impact calculation');
  const choices = [
    { decisionId: 'media-acoustics', selectedOptionId: 'media-isolated', isDefault: false, warnings: [] },
    { decisionId: 'guest-independence', selectedOptionId: 'guest-independent', isDefault: false, warnings: [] }
  ];
  const personalization = evaluatePersonalization(choices);
  const expectedSF = 60 + 150; // soundLock + guest autonomy
  if (personalization.totalSfImpact === expectedSF) {
    console.log(`  ✓ Total SF impact: ${personalization.totalSfImpact} SF`);
    passed++;
  } else {
    console.log(`  ✗ SF impact: ${personalization.totalSfImpact}, expected ${expectedSF}`);
    failed++;
  }
  
  // Test 10: Bridge config derivation
  console.log('\nTEST 10: Bridge config derivation');
  const bridgeConfig = deriveBridgeConfigFromChoices(choices);
  if (bridgeConfig.soundLock && bridgeConfig.guestAutonomy) {
    console.log('  ✓ Bridge config includes soundLock and guestAutonomy');
    passed++;
  } else {
    console.log('  ✗ Bridge config missing expected bridges');
    failed++;
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}
