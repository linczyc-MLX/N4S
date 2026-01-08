/**
 * N4S Validation Engine Test Cases
 * 
 * Demonstrates path tracing validation with sample plan graphs.
 * Run with: npx ts-node test/validation-test.ts
 */

import { 
  runValidation,
  detectPathTracingRedFlags,
  detectAcousticZoneViolations,
  detectMissingShowKitchen
} from '../server/validation-engine-v2';

import type {
  PlanGraph,
  OperatingModel,
  LifestylePriorities
} from '../shared/schema';

// ============================================================================
// SAMPLE PLAN GRAPHS
// ============================================================================

/**
 * PASSING PLAN: Correct circulation, no violations
 */
const passingPlanGraph: PlanGraph = {
  rooms: [
    // Front of House
    { id: 'foy', name: 'Foyer', zone: 'formal', acousticZone: 'zone_1', tags: ['foh'], moduleId: 'module-02' },
    { id: 'gr', name: 'Great Room', zone: 'formal', acousticZone: 'zone_1', tags: ['foh'], moduleId: 'module-02' },
    { id: 'dr', name: 'Dining Room', zone: 'formal', acousticZone: 'zone_1', tags: ['foh'], moduleId: 'module-02' },
    { id: 'terr', name: 'Terrace', zone: 'outdoor', acousticZone: 'zone_2', tags: ['outdoor'], moduleId: 'module-02' },
    
    // Kitchen Zone
    { id: 'kit', name: 'Kitchen', zone: 'family', acousticZone: 'zone_2', tags: ['show_kitchen'], moduleId: 'module-01' },
    { id: 'scul', name: 'Scullery', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-01' },
    { id: 'butler', name: 'Butler Pantry', zone: 'service', acousticZone: 'zone_2', tags: ['bridge'], moduleId: 'module-01' },
    
    // Family Zone
    { id: 'fr', name: 'Family Room', zone: 'family', acousticZone: 'zone_1', tags: [], moduleId: 'module-02' },
    
    // Primary Suite (Level 2)
    { id: 'pri', name: 'Primary Bedroom', zone: 'primary', acousticZone: 'zone_0', tags: ['primary_suite'], moduleId: 'module-03' },
    { id: 'pribath', name: 'Primary Bath', zone: 'primary', acousticZone: 'zone_0', tags: ['primary_suite'], moduleId: 'module-03' },
    
    // Guest Wing
    { id: 'guest1', name: 'Guest Suite 1', zone: 'guest', acousticZone: 'zone_0', tags: ['guest'], moduleId: 'module-04' },
    { id: 'guestliv', name: 'Guest Living', zone: 'guest', acousticZone: 'zone_1', tags: ['guest'], moduleId: 'module-04' },
    
    // Media (properly isolated)
    { id: 'media', name: 'Media Room', zone: 'entertainment', acousticZone: 'zone_3', tags: [], moduleId: 'module-05' },
    { id: 'soundlock', name: 'Sound Lock', zone: 'buffer', acousticZone: 'zone_2', tags: ['bridge'], moduleId: 'module-05' },
    
    // Service
    { id: 'mud', name: 'Mudroom', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-06' },
    { id: 'gar', name: 'Garage', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-06' },
    { id: 'serv', name: 'Service Corridor', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-06' }
  ],
  edges: [
    { id: 'e1', fromRoomId: 'foy', toRoomId: 'gr', type: 'opening' },
    { id: 'e2', fromRoomId: 'gr', toRoomId: 'dr', type: 'opening' },
    { id: 'e3', fromRoomId: 'gr', toRoomId: 'terr', type: 'door' },
    { id: 'e4', fromRoomId: 'dr', toRoomId: 'butler', type: 'door' },
    { id: 'e5', fromRoomId: 'butler', toRoomId: 'kit', type: 'door' },
    { id: 'e6', fromRoomId: 'kit', toRoomId: 'scul', type: 'opening' },
    { id: 'e7', fromRoomId: 'scul', toRoomId: 'mud', type: 'door' },
    { id: 'e8', fromRoomId: 'mud', toRoomId: 'gar', type: 'door' }
  ],
  namedPaths: [
    // CORRECT: Delivery route through BOH only
    {
      id: 'delivery',
      name: 'Delivery Route',
      type: 'delivery_route',
      roomIds: ['gar', 'mud', 'serv', 'scul']
    },
    // CORRECT: Guest circulation avoids primary suite
    {
      id: 'guest-circ',
      name: 'Guest Circulation',
      type: 'guest_circulation',
      roomIds: ['foy', 'guestliv', 'guest1']
    },
    // CORRECT: Terrace access bypasses kitchen work
    {
      id: 'terrace-route',
      name: 'Guest to Terrace',
      type: 'foh_to_terrace',
      roomIds: ['foy', 'gr', 'terr']
    }
  ],
  sharedWalls: [
    // Media room properly buffered - shares wall with sound lock, not bedrooms
    { id: 'sw1', room1Id: 'media', room2Id: 'soundlock', isFloor: false },
    { id: 'sw2', room1Id: 'soundlock', room2Id: 'fr', isFloor: false }
  ]
};

/**
 * FAILING PLAN: Multiple critical violations
 */
const failingPlanGraph: PlanGraph = {
  rooms: [
    // Front of House
    { id: 'foy', name: 'Foyer', zone: 'formal', acousticZone: 'zone_1', tags: ['foh'], moduleId: 'module-02' },
    { id: 'gr', name: 'Great Room', zone: 'formal', acousticZone: 'zone_1', tags: ['foh'], moduleId: 'module-02' },
    { id: 'dr', name: 'Dining Room', zone: 'formal', acousticZone: 'zone_1', tags: ['foh'], moduleId: 'module-02' },
    { id: 'terr', name: 'Terrace', zone: 'outdoor', acousticZone: 'zone_2', tags: [], moduleId: 'module-02' },
    
    // Kitchen Zone - NO SHOW KITCHEN TAG (Red Flag #4)
    { id: 'scul', name: 'Basement Kitchen', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-01' },
    
    // Primary Suite
    { id: 'pri', name: 'Primary Bedroom', zone: 'primary', acousticZone: 'zone_0', tags: ['primary_suite'], moduleId: 'module-03' },
    
    // Guest Wing - poor layout
    { id: 'guest1', name: 'Guest Suite 1', zone: 'guest', acousticZone: 'zone_0', tags: ['guest'], moduleId: 'module-04' },
    
    // Media Room - WRONG PLACEMENT (adjacent to bedroom)
    { id: 'media', name: 'Media Room', zone: 'entertainment', acousticZone: 'zone_3', tags: [], moduleId: 'module-05' },
    
    // Service
    { id: 'mud', name: 'Mudroom', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-06' },
    { id: 'gar', name: 'Garage', zone: 'service', acousticZone: 'zone_2', tags: ['boh'], moduleId: 'module-06' }
  ],
  edges: [],
  namedPaths: [
    // VIOLATION: Delivery route passes through Great Room (FOH)
    {
      id: 'delivery-bad',
      name: 'Delivery Route',
      type: 'delivery_route',
      roomIds: ['gar', 'gr', 'scul']  // Goes through Great Room!
    },
    // VIOLATION: Guest circulation crosses primary suite
    {
      id: 'guest-circ-bad',
      name: 'Guest Circulation',
      type: 'guest_circulation',
      roomIds: ['foy', 'pri', 'guest1']  // Goes through Primary!
    },
    // VIOLATION: Terrace route crosses kitchen work
    {
      id: 'terrace-bad',
      name: 'Guest to Terrace',
      type: 'foh_to_terrace',
      roomIds: ['foy', 'gr', 'scul', 'terr']  // Goes through Scullery!
    }
  ],
  sharedWalls: [
    // VIOLATION: Media room shares wall directly with bedroom (Zone 3 / Zone 0)
    { id: 'sw-bad', room1Id: 'media', room2Id: 'pri', isFloor: false }
  ]
};

// ============================================================================
// TEST RUNNER
// ============================================================================

function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('N4S VALIDATION ENGINE - PATH TRACING TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const operatingModel: OperatingModel = {
    typology: 'single_family',
    entertainingLoad: 'monthly',
    staffingLevel: 'part_time',
    privacyPosture: 'balanced',
    wetProgram: 'pool_spa'
  };

  const lifestylePriorities: LifestylePriorities = {
    chefLedCooking: true,
    multiFamilyHosting: false,
    lateNightMedia: true,
    homeOffice: true,
    fitnessRecovery: true,
    poolEntertainment: true
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: PASSING PLAN
  // ─────────────────────────────────────────────────────────────────────────
  console.log('TEST 1: PASSING PLAN (Correct Circulation)');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const passingResult = runValidation({
    projectId: 'test-passing',
    operatingModel,
    lifestylePriorities,
    planGraph: passingPlanGraph
  });

  console.log(`Gate Status: ${passingResult.gateStatus.toUpperCase()}`);
  console.log(`Overall Score: ${passingResult.overallScore}`);
  console.log(`Critical Flags: ${passingResult.redFlags.filter(f => f.severity === 'critical').length}`);
  console.log(`Warning Flags: ${passingResult.redFlags.filter(f => f.severity === 'warning').length}`);
  
  if (passingResult.redFlags.length > 0) {
    console.log('\nFlags:');
    passingResult.redFlags.forEach(f => {
      console.log(`  [${f.severity.toUpperCase()}] ${f.description}`);
    });
  } else {
    console.log('\n✓ No path tracing violations detected');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: FAILING PLAN
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n\nTEST 2: FAILING PLAN (Multiple Violations)');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const failingResult = runValidation({
    projectId: 'test-failing',
    operatingModel,
    lifestylePriorities,
    planGraph: failingPlanGraph
  });

  console.log(`Gate Status: ${failingResult.gateStatus.toUpperCase()}`);
  console.log(`Overall Score: ${failingResult.overallScore}`);
  console.log(`Critical Flags: ${failingResult.redFlags.filter(f => f.severity === 'critical').length}`);
  console.log(`Warning Flags: ${failingResult.redFlags.filter(f => f.severity === 'warning').length}`);
  
  console.log('\nCritical Violations:');
  failingResult.redFlags
    .filter(f => f.severity === 'critical')
    .forEach((f, i) => {
      console.log(`\n  ${i + 1}. [${f.ruleId}] ${f.description}`);
      console.log(`     Affected: ${f.affectedRooms.join(', ')}`);
      console.log(`     Action: ${f.correctiveAction}`);
    });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: ISOLATED PATH TRACING
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n\nTEST 3: ISOLATED PATH TRACING');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const pathFlags = detectPathTracingRedFlags(failingPlanGraph);
  console.log(`Path violations detected: ${pathFlags.length}`);
  pathFlags.forEach(f => {
    console.log(`  - ${f.description}`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: ACOUSTIC ZONE VIOLATIONS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n\nTEST 4: ACOUSTIC ZONE VIOLATIONS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const acousticFlags = detectAcousticZoneViolations(failingPlanGraph);
  console.log(`Acoustic violations detected: ${acousticFlags.length}`);
  acousticFlags.forEach(f => {
    console.log(`  - ${f.description}`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: SHOW KITCHEN CHECK
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n\nTEST 5: SHOW KITCHEN CHECK');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const passingKitchen = detectMissingShowKitchen(passingPlanGraph);
  const failingKitchen = detectMissingShowKitchen(failingPlanGraph);
  
  console.log(`Passing plan has show kitchen: ${passingKitchen === null ? '✓ YES' : '✗ NO'}`);
  console.log(`Failing plan has show kitchen: ${failingKitchen === null ? '✓ YES' : '✗ NO'}`);
  
  if (failingKitchen) {
    console.log(`  Violation: ${failingKitchen.description}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const allTests = [
    { name: 'Passing Plan Gate Status', pass: passingResult.gateStatus !== 'fail' },
    { name: 'Failing Plan Gate Status', pass: failingResult.gateStatus === 'fail' },
    { name: 'Path Tracing Detects FOH Crossing', pass: pathFlags.some(f => f.ruleId === 'critical-002') },
    { name: 'Path Tracing Detects Primary Threshold', pass: pathFlags.some(f => f.ruleId === 'critical-001') },
    { name: 'Path Tracing Detects Kitchen Aisle', pass: pathFlags.some(f => f.ruleId === 'critical-005') },
    { name: 'Acoustic Check Detects Zone Conflict', pass: acousticFlags.length > 0 },
    { name: 'Kitchen Check Passes Good Plan', pass: passingKitchen === null },
    { name: 'Kitchen Check Fails Bad Plan', pass: failingKitchen !== null }
  ];

  let passed = 0;
  allTests.forEach(t => {
    const status = t.pass ? '✓' : '✗';
    console.log(`  ${status} ${t.name}`);
    if (t.pass) passed++;
  });

  console.log(`\n  PASSED: ${passed}/${allTests.length}`);
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
runTests();

export { passingPlanGraph, failingPlanGraph, runTests };
