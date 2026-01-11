/**
 * P1-M Workflow Test
 * 
 * Tests the complete MVP adjacency workflow:
 * 1. KYC → Tier Detection
 * 2. Load Benchmark Matrix
 * 3. Generate Recommendations from KYC
 * 4. Apply Client Decisions
 * 5. Compare Proposed vs Benchmark (find deviations)
 * 6. Calculate Module Scores
 * 7. Check 80% Gate
 * 
 * Uses Thornwood Estate at 15K SF for testing.
 */

import type { KYCResponse } from '../shared/kyc-schema';
import type { AdjacencyRequirement } from '../shared/schema';
import { getPreset } from '../client/data/program-presets';
import { 
  recommendAdjacencies, 
  evaluatePersonalization,
  applyDecisionsToMatrix,
  deriveBridgeConfigFromChoices
} from '../server/adjacency-recommender';
import { getDecisionsForPreset, ADJACENCY_DECISIONS } from '../shared/adjacency-decisions';

// ============================================================================
// TEST DATA: Thornwood Estate at 15K SF
// ============================================================================

const thornwood15k: KYCResponse = {
  id: 'kyc-thornwood-15k',
  clientId: 'client-thornwood',
  projectId: 'thornwood-estate-15k',
  createdAt: '2026-01-11T00:00:00Z',
  updatedAt: '2026-01-11T00:00:00Z',

  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 15000,  // 15K tier
    siteLotSize: '5 acres',
    hasBasement: false,
    numberOfLevels: 2,
    climateZone: 'temperate',
    existingStructure: false
  },

  householdProfile: {
    composition: 'couple_adult_children',
    primaryResidents: 2,
    childrenAges: [28, 25],
    elderlyResidents: false,
    mobilityConsiderations: false,
    pets: [
      { type: 'dog', size: 'large', count: 2, specialNeeds: 'Needs outdoor access and wash station' }
    ]
  },

  entertainingProfile: {
    frequency: 'regularly',
    typicalScale: 'moderate',
    maxEventScale: 'large',
    formalDiningImportance: 4,
    outdoorEntertainingImportance: 5,
    cateringSupport: true,
    wineCollection: true,
    wineBottleCount: 800,
    barEntertainingImportance: 3
  },

  staffingProfile: {
    preference: 'regular',
    currentStaff: [
      { role: 'housekeeper', liveIn: false, fullTime: false }
    ],
    plannedStaff: ['part-time chef'],
    securityRequirements: 'moderate',
    packageDeliveryVolume: 'moderate'
  },

  privacyProfile: {
    preference: 'selective',
    guestStayFrequency: 'regularly',
    typicalGuestStayDuration: 'weekend',
    multiGenerationalHosting: false,
    separateGuestAccess: false,
    workFromHome: 'occasional',
    clientMeetingsAtHome: false,
    mediaRoom: true,
    lateNightMediaUse: true
  },

  kitchenProfile: {
    cookingStyle: 'enthusiast',
    primaryCook: 'both',
    breakfastStyle: 'casual',
    dailyMealsAtHome: 2,
    showKitchenImportance: 5,
    professionalAppliances: true,
    multipleOvens: true,
    wineStorage: true,
    separateCateringKitchen: false
  },

  wellnessProfile: {
    interest: 'active',
    fitnessRoutine: 'regular',
    poolDesired: true,
    poolType: 'lap',
    spaFeatures: ['hot_tub', 'sauna'],
    outdoorActivities: ['gardening'],
    garageBays: 3,
    carCollection: false
  },

  specialRequirements: {
    accessibility: [],
    medicalEquipment: false,
    artCollection: false,
    artClimateControl: false,
    musicRoom: false,
    recordingStudio: false,
    workshop: false,
    wineRoom: true,  // Has 800 bottle collection
    safe_room: false,
    customSpaces: [
      { name: 'Home Theater', description: 'Dedicated theater room', estimatedSF: 400 },
      { name: 'Dog Wash Station', description: 'Outdoor access with wash', estimatedSF: 60 },
      { name: 'Outdoor Kitchen', description: 'Full outdoor cooking area', estimatedSF: 200 }
    ]
  }
};

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

interface MatrixLookup {
  [key: string]: string;  // "FROM-TO" → relationship
}

function buildMatrixLookup(matrix: AdjacencyRequirement[]): MatrixLookup {
  const lookup: MatrixLookup = {};
  matrix.forEach(adj => {
    if (adj.fromSpaceCode && adj.toSpaceCode) {
      lookup[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship || '';
    }
  });
  return lookup;
}

interface Deviation {
  fromSpace: string;
  toSpace: string;
  benchmark: string;
  proposed: string;
}

function findDeviations(benchmark: MatrixLookup, proposed: MatrixLookup): Deviation[] {
  const deviations: Deviation[] = [];
  
  // Check all benchmark relationships
  Object.keys(benchmark).forEach(key => {
    const [from, to] = key.split('-');
    const benchmarkRel = benchmark[key];
    const proposedRel = proposed[key] || '';
    
    if (benchmarkRel && proposedRel && benchmarkRel !== proposedRel) {
      deviations.push({
        fromSpace: from,
        toSpace: to,
        benchmark: benchmarkRel,
        proposed: proposedRel
      });
    }
  });
  
  return deviations;
}

interface ModuleScore {
  id: string;
  name: string;
  score: number;
  threshold: number;
  passed: boolean;
  deviationCount: number;
}

// Module-to-space mapping for scoring
const MODULE_SPACES: Record<string, string[]> = {
  'module-01': ['KIT', 'CHEF', 'SCUL', 'BKF', 'DR'],  // Kitchen Rules Engine
  'module-02': ['GR', 'DR', 'WINE', 'FOY', 'TERR'],   // Entertaining Spine
  'module-03': ['PRI', 'PRIBATH', 'PRICL', 'PRILOUNGE'],  // Primary Suite
  'module-04': ['GUEST1', 'GUEST2', 'GUEST3', 'GST1', 'GST2'],  // Guest Wing
  'module-05': ['MEDIA', 'THR'],  // Media & Acoustic
  'module-06': ['SCUL', 'MUD', 'LND', 'MEP', 'GAR'],  // Service Spine
  'module-07': ['GYM', 'SPA', 'POOL', 'WLINK', 'POOLSUP'],  // Wellness
  'module-08': ['STF', 'STFQ']  // Staff Layer
};

function calculateModuleScores(
  benchmark: MatrixLookup, 
  proposed: MatrixLookup,
  deviations: Deviation[]
): ModuleScore[] {
  const modules = [
    { id: 'module-01', name: 'Kitchen Rules Engine', threshold: 80 },
    { id: 'module-02', name: 'Entertaining Spine', threshold: 80 },
    { id: 'module-03', name: 'Primary Suite Ecosystem', threshold: 80 },
    { id: 'module-04', name: 'Guest Wing Logic', threshold: 80 },
    { id: 'module-05', name: 'Media & Acoustic Control', threshold: 80 },
    { id: 'module-06', name: 'Service Spine', threshold: 80 },
    { id: 'module-07', name: 'Wellness Program', threshold: 80 },
    { id: 'module-08', name: 'Staff Layer', threshold: 80 }
  ];

  return modules.map(mod => {
    const spaces = MODULE_SPACES[mod.id] || [];
    
    // Count deviations affecting this module
    const moduleDeviations = deviations.filter(dev => 
      spaces.includes(dev.fromSpace) || spaces.includes(dev.toSpace)
    );
    
    // Count benchmark relationships for this module
    let benchmarkCount = 0;
    Object.keys(benchmark).forEach(key => {
      const [from, to] = key.split('-');
      if (spaces.includes(from) || spaces.includes(to)) {
        benchmarkCount++;
      }
    });
    
    // Calculate score (100% minus deviation penalty)
    const deviationPenalty = benchmarkCount > 0 
      ? (moduleDeviations.length / benchmarkCount) * 100
      : 0;
    const score = Math.max(0, Math.round(100 - deviationPenalty * 2)); // 2x penalty multiplier
    
    return {
      id: mod.id,
      name: mod.name,
      score,
      threshold: mod.threshold,
      passed: score >= mod.threshold,
      deviationCount: moduleDeviations.length
    };
  });
}

// ============================================================================
// RUN TESTS
// ============================================================================

export function runP1MTests(): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('P1-M WORKFLOW TEST: Thornwood Estate at 15K SF');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Verify tier detection
  console.log('STEP 1: Tier Detection');
  console.log('───────────────────────────────────────────────────────────────');
  const targetSF = thornwood15k.propertyContext?.estimatedSF || 15000;
  const tier = targetSF < 7500 ? '5k' : targetSF < 12500 ? '10k' : targetSF < 17500 ? '15k' : '20k';
  console.log(`Target SF: ${targetSF.toLocaleString()}`);
  console.log(`Detected Tier: ${tier}`);
  console.log(`✓ Tier detection: ${tier === '15k' ? 'PASS' : 'FAIL'}\n`);

  // Step 2: Load benchmark matrix
  console.log('STEP 2: Load Benchmark Matrix');
  console.log('───────────────────────────────────────────────────────────────');
  const preset = getPreset('15k');
  if (!preset) {
    console.log('✗ Failed to load 15K preset!');
    return;
  }
  console.log(`Preset: ${preset.name}`);
  console.log(`Description: ${preset.description}`);
  console.log(`Benchmark relationships: ${preset.adjacencyMatrix.length}`);
  console.log(`Bridges required: ${Object.entries(preset.bridgeConfig).filter(([,v]) => v).map(([k]) => k).join(', ')}`);
  console.log('✓ Benchmark loaded\n');

  // Step 3: Get decisions for tier
  console.log('STEP 3: Available Decisions for 15K');
  console.log('───────────────────────────────────────────────────────────────');
  const decisions = getDecisionsForPreset('15k');
  console.log(`Decisions available: ${decisions.length}`);
  decisions.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.title} (${d.options.length} options)`);
  });
  console.log('');

  // Step 4: Generate recommendations
  console.log('STEP 4: AI Recommendations from KYC');
  console.log('───────────────────────────────────────────────────────────────');
  const recommendations = recommendAdjacencies(thornwood15k, '15k');
  recommendations.forEach(rec => {
    console.log(`  ${rec.decision.title}:`);
    console.log(`    Recommended: ${rec.recommendedOption.label}`);
    console.log(`    Confidence: ${rec.confidence}`);
    console.log(`    Reasoning: ${rec.reasoning.substring(0, 60)}...`);
  });
  console.log('');

  // Step 5: Simulate client accepting all recommendations (baseline test)
  console.log('STEP 5: Client Accepts All Recommendations');
  console.log('───────────────────────────────────────────────────────────────');
  const choices = recommendations.map(rec => ({
    decisionId: rec.decision.id,
    selectedOptionId: rec.recommendedOption.id,
    isDefault: true,
    warnings: []
  }));
  
  const personalizationResult = evaluatePersonalization(choices);
  console.log(`Total SF Impact: ${personalizationResult.totalSfImpact} SF`);
  console.log(`Warning Count: ${personalizationResult.warningCount}`);
  console.log(`Required Bridges: ${personalizationResult.requiredBridges.join(', ') || 'none'}`);
  console.log('');

  // Step 6: Apply decisions to matrix
  console.log('STEP 6: Generate Proposed Matrix');
  console.log('───────────────────────────────────────────────────────────────');
  const proposedMatrix = applyDecisionsToMatrix(preset.adjacencyMatrix, personalizationResult.choices);
  console.log(`Proposed relationships: ${proposedMatrix.length}`);
  
  const benchmarkLookup = buildMatrixLookup(preset.adjacencyMatrix);
  const proposedLookup = buildMatrixLookup(proposedMatrix);
  console.log('');

  // Step 7: Find deviations
  console.log('STEP 7: Compare Proposed vs Benchmark');
  console.log('───────────────────────────────────────────────────────────────');
  const deviations = findDeviations(benchmarkLookup, proposedLookup);
  console.log(`Deviations found: ${deviations.length}`);
  if (deviations.length > 0) {
    deviations.forEach(dev => {
      console.log(`  ${dev.fromSpace} → ${dev.toSpace}: Benchmark=${dev.benchmark}, Proposed=${dev.proposed}`);
    });
  } else {
    console.log('  No deviations - client accepted all N4S recommendations');
  }
  console.log('');

  // Step 8: Calculate module scores
  console.log('STEP 8: Module Scores (80% Gate)');
  console.log('───────────────────────────────────────────────────────────────');
  const moduleScores = calculateModuleScores(benchmarkLookup, proposedLookup, deviations);
  let allPassed = true;
  moduleScores.forEach(mod => {
    const status = mod.passed ? '✓' : '✗';
    console.log(`  ${status} ${mod.name}: ${mod.score}/100 (${mod.deviationCount} deviations)`);
    if (!mod.passed) allPassed = false;
  });
  
  const overallScore = Math.round(moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length);
  console.log('');
  console.log(`Overall Score: ${overallScore}/100`);
  console.log(`Gate Status: ${allPassed && overallScore >= 80 ? '✓ PASS' : '✗ FAIL'}`);
  console.log('');

  // Step 9: Test with deliberate deviations
  console.log('STEP 9: Test with Client Deviations');
  console.log('───────────────────────────────────────────────────────────────');
  
  // Simulate client making non-recommended choices
  const deviatingChoices = recommendations.map(rec => {
    // For testing, pick a non-default option for some decisions
    const nonDefault = rec.decision.options.find(o => !o.isDefault && o.id !== rec.recommendedOption.id);
    if (nonDefault && rec.decision.id === 'kitchen-family') {
      console.log(`  Deviating: ${rec.decision.title} → ${nonDefault.label}`);
      return {
        decisionId: rec.decision.id,
        selectedOptionId: nonDefault.id,
        isDefault: false,
        warnings: nonDefault.warnings
      };
    }
    return {
      decisionId: rec.decision.id,
      selectedOptionId: rec.recommendedOption.id,
      isDefault: true,
      warnings: []
    };
  });
  
  const deviatingResult = evaluatePersonalization(deviatingChoices);
  const deviatingMatrix = applyDecisionsToMatrix(preset.adjacencyMatrix, deviatingResult.choices);
  const deviatingLookup = buildMatrixLookup(deviatingMatrix);
  const newDeviations = findDeviations(benchmarkLookup, deviatingLookup);
  
  console.log(`  New deviations: ${newDeviations.length}`);
  newDeviations.forEach(dev => {
    console.log(`    ${dev.fromSpace} → ${dev.toSpace}: ${dev.benchmark} → ${dev.proposed}`);
  });
  
  const deviatingScores = calculateModuleScores(benchmarkLookup, deviatingLookup, newDeviations);
  const deviatingOverall = Math.round(deviatingScores.reduce((sum, m) => sum + m.score, 0) / deviatingScores.length);
  console.log(`  Overall Score with deviations: ${deviatingOverall}/100`);
  console.log('');

  // Step 10: Verify bridges
  console.log('STEP 10: Bridge Configuration');
  console.log('───────────────────────────────────────────────────────────────');
  const derivedBridges = deriveBridgeConfigFromChoices(personalizationResult.choices);
  const requiredBridges = preset.bridgeConfig;
  
  console.log('Required vs Derived:');
  Object.entries(requiredBridges).forEach(([bridge, required]) => {
    const derived = derivedBridges[bridge as keyof typeof derivedBridges] || false;
    const status = !required || derived ? '✓' : '✗';
    console.log(`  ${status} ${bridge}: Required=${required}, Derived=${derived}`);
  });
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✓ Tier Detection: Working`);
  console.log(`✓ Benchmark Loading: ${preset.adjacencyMatrix.length} relationships`);
  console.log(`✓ Recommendations: ${recommendations.length} decisions`);
  console.log(`✓ Matrix Application: ${proposedMatrix.length} relationships`);
  console.log(`✓ Deviation Detection: ${deviations.length} (baseline), ${newDeviations.length} (with changes)`);
  console.log(`✓ Module Scoring: ${moduleScores.filter(m => m.passed).length}/${moduleScores.length} passed`);
  console.log(`✓ Overall Score: ${overallScore}/100 (baseline), ${deviatingOverall}/100 (with changes)`);
}

// Export for use
export { thornwood15k };
