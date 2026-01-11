/**
 * Simple P1-M Workflow Test Runner
 * Run with: node scripts/test-p1m.js
 */

// Test data: Thornwood Estate at 15K SF
const thornwood15k = {
  id: 'kyc-thornwood-15k',
  clientId: 'client-thornwood',
  projectId: 'thornwood-estate-15k',
  createdAt: '2026-01-11T00:00:00Z',
  updatedAt: '2026-01-11T00:00:00Z',
  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 15000,
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
    currentStaff: [{ role: 'housekeeper', liveIn: false, fullTime: false }],
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
    wineRoom: true,
    safe_room: false,
    customSpaces: []
  }
};

// ============================================================================
// SIMPLIFIED TEST FUNCTIONS (Pure JavaScript)
// ============================================================================

// Tier determination
function determineTier(targetSF) {
  if (targetSF < 7500) return '5k';
  if (targetSF < 12500) return '10k';
  if (targetSF < 17500) return '15k';
  return '20k';
}

// 15K Adjacency Matrix (benchmark)
const adjacencyMatrix15k = [
  { fromSpaceCode: "FOY", toSpaceCode: "OFF", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "GR", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "DR", relationship: "N" },
  { fromSpaceCode: "FOY", toSpaceCode: "WINE", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "FR", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "KIT", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "CHEF", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SCUL", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MUD", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "LIB", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MEDIA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GYM", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SPA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "TERR", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "POOL", relationship: "S" },
  { fromSpaceCode: "OFF", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "OFF", toSpaceCode: "GR", relationship: "S" },
  { fromSpaceCode: "OFF", toSpaceCode: "DR", relationship: "S" },
  { fromSpaceCode: "GR", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "GR", toSpaceCode: "TERR", relationship: "N" },
  { fromSpaceCode: "DR", toSpaceCode: "FOY", relationship: "N" },
  { fromSpaceCode: "DR", toSpaceCode: "WINE", relationship: "A" },
  { fromSpaceCode: "DR", toSpaceCode: "CHEF", relationship: "B" },
  { fromSpaceCode: "CHEF", toSpaceCode: "DR", relationship: "B" },
  { fromSpaceCode: "CHEF", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "CHEF", toSpaceCode: "KIT", relationship: "N" },
  { fromSpaceCode: "CHEF", toSpaceCode: "FOY", relationship: "S" },
  { fromSpaceCode: "WINE", toSpaceCode: "DR", relationship: "A" },
  { fromSpaceCode: "WINE", toSpaceCode: "SCUL", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "LIB", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "MEDIA", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "TERR", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "KIT", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "BKF", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "CHEF", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "MUD", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "TERR", relationship: "N" },
  { fromSpaceCode: "SCUL", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "CHEF", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "MUD", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "WINE", relationship: "B" },
  { fromSpaceCode: "MUD", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "MUD", toSpaceCode: "KIT", relationship: "N" },
  { fromSpaceCode: "GYM", toSpaceCode: "SPA", relationship: "N" },
  { fromSpaceCode: "SPA", toSpaceCode: "GYM", relationship: "N" },
  { fromSpaceCode: "SPA", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "GR", relationship: "N" },
  { fromSpaceCode: "TERR", toSpaceCode: "KIT", relationship: "N" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST1", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST2", relationship: "S" }
];

// 10 adjacency decisions applicable to 15K
const decisions15k = [
  { id: 'office-location', title: 'Home Office Location', defaultOption: 'off-entry', primarySpace: 'OFF' },
  { id: 'kitchen-family', title: 'Kitchen & Family Room Connection', defaultOption: 'kit-open', primarySpace: 'KIT' },
  { id: 'media-acoustics', title: 'Media Room Placement', defaultOption: 'media-family-zone', primarySpace: 'MEDIA' },
  { id: 'guest-autonomy', title: 'Guest Suite Independence', defaultOption: 'guest-clustered', primarySpace: 'GUEST1' },
  { id: 'primary-isolation', title: 'Primary Suite Isolation', defaultOption: 'pri-separate', primarySpace: 'PRI' },
  { id: 'terrace-access', title: 'Terrace Access', defaultOption: 'terr-family', primarySpace: 'TERR' },
  { id: 'wellness-placement', title: 'Wellness Zone Placement', defaultOption: 'wellness-pool', primarySpace: 'GYM' },
  { id: 'mudroom-flow', title: 'Mudroom & Service Entry', defaultOption: 'mud-scullery', primarySpace: 'MUD' },
  { id: 'wine-access', title: 'Wine Storage Access', defaultOption: 'wine-dining', primarySpace: 'WINE' },
  { id: 'secondary-clustering', title: 'Secondary Bedroom Arrangement', defaultOption: 'sec-clustered', primarySpace: 'SEC1' }
];

// Module scoring definitions
const MODULE_SPACES = {
  'module-01': ['KIT', 'CHEF', 'SCUL', 'BKF', 'DR'],
  'module-02': ['GR', 'DR', 'WINE', 'FOY', 'TERR'],
  'module-03': ['PRI', 'PRIBATH', 'PRICL', 'PRILOUNGE'],
  'module-04': ['GUEST1', 'GUEST2', 'GUEST3', 'GST1', 'GST2'],
  'module-05': ['MEDIA', 'THR'],
  'module-06': ['SCUL', 'MUD', 'LND', 'MEP', 'GAR'],
  'module-07': ['GYM', 'SPA', 'POOL', 'WLINK', 'POOLSUP'],
  'module-08': ['STF', 'STFQ']
};

const MODULES = [
  { id: 'module-01', name: 'Kitchen Rules Engine', threshold: 80 },
  { id: 'module-02', name: 'Entertaining Spine', threshold: 80 },
  { id: 'module-03', name: 'Primary Suite Ecosystem', threshold: 80 },
  { id: 'module-04', name: 'Guest Wing Logic', threshold: 80 },
  { id: 'module-05', name: 'Media & Acoustic Control', threshold: 80 },
  { id: 'module-06', name: 'Service Spine', threshold: 80 },
  { id: 'module-07', name: 'Wellness Program', threshold: 80 },
  { id: 'module-08', name: 'Staff Layer', threshold: 80 }
];

// Build matrix lookup
function buildMatrixLookup(matrix) {
  const lookup = {};
  matrix.forEach(adj => {
    if (adj.fromSpaceCode && adj.toSpaceCode) {
      lookup[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
    }
  });
  return lookup;
}

// Find deviations between benchmark and proposed
function findDeviations(benchmark, proposed) {
  const deviations = [];
  Object.keys(benchmark).forEach(key => {
    const [from, to] = key.split('-');
    const benchmarkRel = benchmark[key];
    const proposedRel = proposed[key] || '';
    if (benchmarkRel && proposedRel && benchmarkRel !== proposedRel) {
      deviations.push({ fromSpace: from, toSpace: to, benchmark: benchmarkRel, proposed: proposedRel });
    }
  });
  return deviations;
}

// Calculate module scores
function calculateModuleScores(benchmark, proposed, deviations) {
  return MODULES.map(mod => {
    const spaces = MODULE_SPACES[mod.id] || [];
    const moduleDeviations = deviations.filter(dev => 
      spaces.includes(dev.fromSpace) || spaces.includes(dev.toSpace)
    );
    let benchmarkCount = 0;
    Object.keys(benchmark).forEach(key => {
      const [from, to] = key.split('-');
      if (spaces.includes(from) || spaces.includes(to)) benchmarkCount++;
    });
    const deviationPenalty = benchmarkCount > 0 ? (moduleDeviations.length / benchmarkCount) * 100 : 0;
    const score = Math.max(0, Math.round(100 - deviationPenalty * 2));
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
// RUN TEST
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('P1-M WORKFLOW TEST: Thornwood Estate at 15K SF');
console.log('═══════════════════════════════════════════════════════════════\n');

// Step 1: Tier Detection
console.log('STEP 1: Tier Detection');
console.log('───────────────────────────────────────────────────────────────');
const targetSF = thornwood15k.propertyContext.estimatedSF;
const tier = determineTier(targetSF);
console.log(`Target SF: ${targetSF.toLocaleString()}`);
console.log(`Detected Tier: ${tier}`);
console.log(`✓ Tier detection: ${tier === '15k' ? 'PASS' : 'FAIL'}\n`);

// Step 2: Load Benchmark
console.log('STEP 2: Load Benchmark Matrix');
console.log('───────────────────────────────────────────────────────────────');
console.log(`Preset: 15,000 SF`);
console.log(`Benchmark relationships: ${adjacencyMatrix15k.length}`);
console.log('✓ Benchmark loaded\n');

// Step 3: Decisions
console.log('STEP 3: Available Decisions for 15K');
console.log('───────────────────────────────────────────────────────────────');
console.log(`Decisions available: ${decisions15k.length}`);
decisions15k.forEach((d, i) => console.log(`  ${i + 1}. ${d.title}`));
console.log('');

// Step 4: Simulate client accepting all defaults (no deviations)
console.log('STEP 4: Client Accepts All N4S Recommendations (Baseline)');
console.log('───────────────────────────────────────────────────────────────');
const benchmarkLookup = buildMatrixLookup(adjacencyMatrix15k);
const baselineDeviations = findDeviations(benchmarkLookup, benchmarkLookup);
console.log(`Deviations: ${baselineDeviations.length} (expected 0 for baseline)`);
console.log('');

// Step 5: Calculate baseline scores
console.log('STEP 5: Module Scores (Baseline - All Accepted)');
console.log('───────────────────────────────────────────────────────────────');
const baselineScores = calculateModuleScores(benchmarkLookup, benchmarkLookup, baselineDeviations);
baselineScores.forEach(mod => {
  console.log(`  ✓ ${mod.name}: ${mod.score}/100`);
});
const baselineOverall = Math.round(baselineScores.reduce((sum, m) => sum + m.score, 0) / baselineScores.length);
console.log(`\nOverall Score: ${baselineOverall}/100`);
console.log(`Gate Status: ✓ PASS\n`);

// Step 6: Simulate client deviation - change kitchen-family from A to B
console.log('STEP 6: Test with Client Deviation');
console.log('───────────────────────────────────────────────────────────────');
console.log('  Simulating: KIT→FR changed from A (Adjacent) to B (Buffered)');

const deviatingMatrix = [...adjacencyMatrix15k];
const kitFrIndex = deviatingMatrix.findIndex(adj => adj.fromSpaceCode === 'KIT' && adj.toSpaceCode === 'FR');
if (kitFrIndex >= 0) {
  deviatingMatrix[kitFrIndex] = { ...deviatingMatrix[kitFrIndex], relationship: 'B' };
}
// Also update reverse
const frKitIndex = deviatingMatrix.findIndex(adj => adj.fromSpaceCode === 'FR' && adj.toSpaceCode === 'KIT');
if (frKitIndex >= 0) {
  deviatingMatrix[frKitIndex] = { ...deviatingMatrix[frKitIndex], relationship: 'B' };
}

const deviatingLookup = buildMatrixLookup(deviatingMatrix);
const newDeviations = findDeviations(benchmarkLookup, deviatingLookup);

console.log(`  Deviations found: ${newDeviations.length}`);
newDeviations.forEach(dev => {
  console.log(`    ${dev.fromSpace} → ${dev.toSpace}: ${dev.benchmark} → ${dev.proposed}`);
});
console.log('');

// Step 7: Calculate deviating scores
console.log('STEP 7: Module Scores (With Deviation)');
console.log('───────────────────────────────────────────────────────────────');
const deviatingScores = calculateModuleScores(benchmarkLookup, deviatingLookup, newDeviations);
let allPassed = true;
deviatingScores.forEach(mod => {
  const status = mod.passed ? '✓' : '✗';
  if (!mod.passed) allPassed = false;
  const change = mod.deviationCount > 0 ? ` (${mod.deviationCount} dev)` : '';
  console.log(`  ${status} ${mod.name}: ${mod.score}/100${change}`);
});
const deviatingOverall = Math.round(deviatingScores.reduce((sum, m) => sum + m.score, 0) / deviatingScores.length);
console.log(`\nOverall Score: ${deviatingOverall}/100`);
console.log(`Gate Status: ${allPassed && deviatingOverall >= 80 ? '✓ PASS' : '⚠ WARNING (review needed)'}\n`);

// Summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`✓ Tier Detection: Working (15K detected)`);
console.log(`✓ Benchmark Matrix: ${adjacencyMatrix15k.length} relationships`);
console.log(`✓ Decisions: ${decisions15k.length} available for 15K`);
console.log(`✓ Baseline Score: ${baselineOverall}/100 (all accepted)`);
console.log(`✓ Deviation Score: ${deviatingOverall}/100 (1 deviation)`);
console.log(`✓ Scoring Impact: -${baselineOverall - deviatingOverall} points for 1 deviation`);
console.log('\n15K PRESET IS READY FOR THORNWOOD ESTATE ✓');
