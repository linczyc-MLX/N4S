/**
 * N4S KYC Integration Test Cases
 * 
 * Demonstrates KYC-to-Validation mapping with sample client profiles.
 * Run with: npx ts-node test/kyc-integration-test.ts
 */

import {
  mapKYCToValidation,
  deriveOperatingModel,
  deriveLifestylePriorities,
  deriveBridgeConfig,
  extractUniqueRequirements,
  recommendPreset,
  detectConflicts,
  type UniqueRequirement
} from '../server/kyc-integration';

import type { KYCResponse } from '../shared/kyc-schema';
import { runValidation } from '../server/validation-engine-v2';

// ============================================================================
// SAMPLE CLIENT PROFILES
// ============================================================================

/**
 * Profile 1: The Thornwood Estate
 * Affluent couple, serious entertainers, dog owners, wants wellness
 */
const thornwoodEstate: KYCResponse = {
  id: 'kyc-001',
  clientId: 'client-thornwood',
  projectId: 'thornwood-estate',
  createdAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',

  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 12000,
    siteLotSize: '3 acres',
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
    wineRoom: true,
    safe_room: false,
    customSpaces: []
  }
};

/**
 * Profile 2: The Multi-Gen Compound
 * Multi-generational family, privacy concerns, accessibility needs
 */
const multiGenCompound: KYCResponse = {
  id: 'kyc-002',
  clientId: 'client-multigen',
  projectId: 'multi-gen-compound',
  createdAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',

  propertyContext: {
    residenceType: 'primary',
    estimatedSF: 18000,
    siteLotSize: '5 acres',
    hasBasement: false,
    numberOfLevels: 2,
    climateZone: 'temperate',
    existingStructure: false
  },

  householdProfile: {
    composition: 'multi_generational',
    primaryResidents: 6,
    childrenAges: [12, 8],
    elderlyResidents: true,
    mobilityConsiderations: true,
    pets: []
  },

  entertainingProfile: {
    frequency: 'occasionally',
    typicalScale: 'intimate',
    maxEventScale: 'moderate',
    formalDiningImportance: 3,
    outdoorEntertainingImportance: 3,
    cateringSupport: false,
    wineCollection: false,
    barEntertainingImportance: 2
  },

  staffingProfile: {
    preference: 'full_service',
    currentStaff: [
      { role: 'housekeeper', liveIn: true, fullTime: true },
      { role: 'caregiver', liveIn: false, fullTime: true }
    ],
    plannedStaff: [],
    securityRequirements: 'enhanced',
    packageDeliveryVolume: 'heavy'
  },

  privacyProfile: {
    preference: 'sanctuary',
    guestStayFrequency: 'rarely',
    typicalGuestStayDuration: 'weekend',
    multiGenerationalHosting: true,
    separateGuestAccess: true,
    workFromHome: 'primary',
    clientMeetingsAtHome: true,
    mediaRoom: true,
    lateNightMediaUse: false
  },

  kitchenProfile: {
    cookingStyle: 'casual',
    primaryCook: 'staff',
    breakfastStyle: 'casual',
    dailyMealsAtHome: 3,
    showKitchenImportance: 3,
    professionalAppliances: true,
    multipleOvens: false,
    wineStorage: false,
    separateCateringKitchen: true
  },

  wellnessProfile: {
    interest: 'dedicated',
    fitnessRoutine: 'light',
    poolDesired: true,
    poolType: 'recreational',
    spaFeatures: ['hot_tub', 'steam', 'massage_room'],
    outdoorActivities: [],
    garageBays: 4,
    carCollection: false
  },

  specialRequirements: {
    accessibility: ['elevator', 'wide_doorways', 'grab_bars'],
    medicalEquipment: true,
    artCollection: true,
    artClimateControl: true,
    musicRoom: false,
    recordingStudio: false,
    workshop: false,
    wineRoom: false,
    safe_room: true,
    customSpaces: [
      {
        name: 'Meditation Garden',
        description: 'Enclosed courtyard garden for quiet reflection',
        estimatedSF: 200,
        adjacencyNeeds: 'SPA'
      }
    ]
  }
};

/**
 * Profile 3: The Executive Retreat
 * High-powered executive, maximum privacy, serious car collector
 */
const executiveRetreat: KYCResponse = {
  id: 'kyc-003',
  clientId: 'client-exec',
  projectId: 'executive-retreat',
  createdAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',

  propertyContext: {
    residenceType: 'secondary',
    estimatedSF: 15000,
    siteLotSize: '10 acres',
    hasBasement: false,
    numberOfLevels: 2,
    climateZone: 'temperate',
    existingStructure: false
  },

  householdProfile: {
    composition: 'couple_no_children',
    primaryResidents: 2,
    childrenAges: [],
    elderlyResidents: false,
    mobilityConsiderations: false,
    pets: [
      { type: 'dog', size: 'medium', count: 1 }
    ]
  },

  entertainingProfile: {
    frequency: 'rarely',
    typicalScale: 'intimate',
    maxEventScale: 'moderate',
    formalDiningImportance: 4,
    outdoorEntertainingImportance: 3,
    cateringSupport: true,
    wineCollection: true,
    wineBottleCount: 2500,
    barEntertainingImportance: 4
  },

  staffingProfile: {
    preference: 'estate',
    currentStaff: [],
    plannedStaff: ['estate manager', 'chef', 'housekeeper'],
    securityRequirements: 'comprehensive',
    packageDeliveryVolume: 'heavy'
  },

  privacyProfile: {
    preference: 'sanctuary',
    guestStayFrequency: 'occasionally',
    typicalGuestStayDuration: 'weekend',
    multiGenerationalHosting: false,
    separateGuestAccess: true,
    workFromHome: 'executive',
    clientMeetingsAtHome: true,
    mediaRoom: true,
    lateNightMediaUse: true
  },

  kitchenProfile: {
    cookingStyle: 'serious',
    primaryCook: 'mixed',
    breakfastStyle: 'formal',
    dailyMealsAtHome: 2,
    showKitchenImportance: 5,
    professionalAppliances: true,
    multipleOvens: true,
    wineStorage: true,
    separateCateringKitchen: true
  },

  wellnessProfile: {
    interest: 'resort',
    fitnessRoutine: 'intensive',
    poolDesired: true,
    poolType: 'infinity',
    spaFeatures: ['sauna', 'steam', 'cold_plunge', 'massage_room'],
    outdoorActivities: ['tennis'],
    garageBays: 8,
    carCollection: true
  },

  specialRequirements: {
    accessibility: [],
    medicalEquipment: false,
    artCollection: true,
    artClimateControl: true,
    musicRoom: true,
    recordingStudio: false,
    workshop: false,
    wineRoom: true,
    safe_room: true,
    customSpaces: [
      {
        name: 'Trophy Room',
        description: 'Display room for awards and memorabilia',
        estimatedSF: 200
      }
    ]
  }
};

// ============================================================================
// TEST RUNNER
// ============================================================================

function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('N4S KYC INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const profiles = [
    { name: 'Thornwood Estate', kyc: thornwoodEstate },
    { name: 'Multi-Gen Compound', kyc: multiGenCompound },
    { name: 'Executive Retreat', kyc: executiveRetreat }
  ];

  for (const profile of profiles) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log(`PROFILE: ${profile.name}`);
    console.log(`${'─'.repeat(65)}\n`);

    const context = mapKYCToValidation(profile.kyc);

    // Operating Model
    console.log('OPERATING MODEL:');
    console.log(`  Typology:        ${context.operatingModel.typology}`);
    console.log(`  Entertaining:    ${context.operatingModel.entertainingLoad}`);
    console.log(`  Staffing:        ${context.operatingModel.staffingLevel}`);
    console.log(`  Privacy:         ${context.operatingModel.privacyPosture}`);
    console.log(`  Wet Program:     ${context.operatingModel.wetProgram}`);

    // Lifestyle Priorities
    console.log('\nLIFESTYLE PRIORITIES:');
    console.log(`  Chef-Led Cooking:      ${context.lifestylePriorities.chefLedCooking}`);
    console.log(`  Multi-Family Hosting:  ${context.lifestylePriorities.multiFamilyHosting}`);
    console.log(`  Late-Night Media:      ${context.lifestylePriorities.lateNightMedia}`);
    console.log(`  Home Office:           ${context.lifestylePriorities.homeOffice}`);
    console.log(`  Fitness/Recovery:      ${context.lifestylePriorities.fitnessRecovery}`);
    console.log(`  Pool Entertainment:    ${context.lifestylePriorities.poolEntertainment}`);

    // Bridge Config
    console.log('\nBRIDGE REQUIREMENTS:');
    console.log(`  Butler Pantry:     ${context.bridgeConfig.butlerPantry ? '✓' : '–'}`);
    console.log(`  Guest Autonomy:    ${context.bridgeConfig.guestAutonomy ? '✓' : '–'}`);
    console.log(`  Sound Lock:        ${context.bridgeConfig.soundLock ? '✓' : '–'}`);
    console.log(`  Wet-Feet Intercept:${context.bridgeConfig.wetFeetIntercept ? '✓' : '–'}`);
    console.log(`  Ops Core:          ${context.bridgeConfig.opsCore ? '✓' : '–'}`);

    // Unique Requirements
    if (context.uniqueRequirements.length > 0) {
      console.log('\nUNIQUE REQUIREMENTS:');
      for (const req of context.uniqueRequirements) {
        console.log(`  • [${req.priority.toUpperCase()}] ${req.description}`);
        if (req.spaceCode) console.log(`    Space: ${req.spaceCode} (${req.estimatedSF || '?'} SF)`);
        if (req.adjacencyNeeds) console.log(`    Adjacent to: ${req.adjacencyNeeds.join(', ')}`);
      }
    }

    // Recommendations
    console.log('\nRECOMMENDATIONS:');
    console.log(`  Preset:           ${context.recommendedPreset.toUpperCase()}`);
    console.log(`  Confidence:       ${context.confidenceScore}%`);

    // Warnings
    if (context.warnings.length > 0) {
      console.log('\nWARNINGS:');
      for (const warning of context.warnings) {
        console.log(`  ⚠ ${warning}`);
      }
    }

    // Run validation with derived context
    console.log('\n--- VALIDATION RESULT ---');
    const validationResult = runValidation({
      projectId: profile.kyc.projectId,
      operatingModel: context.operatingModel,
      lifestylePriorities: context.lifestylePriorities
    });

    console.log(`  Gate Status:      ${validationResult.gateStatus.toUpperCase()}`);
    console.log(`  Overall Score:    ${validationResult.overallScore}`);
    console.log(`  Red Flags:        ${validationResult.redFlags.length}`);
    console.log(`  Missing Bridges:  ${validationResult.requiredBridges.filter(b => !b.isPresent).length}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('KYC INTEGRATION TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const tests = [
    { name: 'Thornwood → monthly entertaining', pass: mapKYCToValidation(thornwoodEstate).operatingModel.entertainingLoad === 'monthly' },
    { name: 'Thornwood → pool_spa wet program', pass: mapKYCToValidation(thornwoodEstate).operatingModel.wetProgram === 'pool_spa' },
    { name: 'Thornwood → dog wash extracted', pass: extractUniqueRequirements(thornwoodEstate).some(r => r.id.includes('dog')) },
    { name: 'Thornwood → wine expansion extracted', pass: extractUniqueRequirements(thornwoodEstate).some(r => r.id === 'wine-expansion') },
    { name: 'MultiGen → private posture', pass: mapKYCToValidation(multiGenCompound).operatingModel.privacyPosture === 'private' },
    { name: 'MultiGen → multi-family hosting flag', pass: mapKYCToValidation(multiGenCompound).lifestylePriorities.multiFamilyHosting === true },
    { name: 'MultiGen → accessibility extracted', pass: extractUniqueRequirements(multiGenCompound).some(r => r.id === 'accessibility') },
    { name: 'MultiGen → safe room extracted', pass: extractUniqueRequirements(multiGenCompound).some(r => r.id === 'safe-room') },
    { name: 'MultiGen → 20k preset recommended', pass: recommendPreset(multiGenCompound) === '20k' },
    { name: 'Executive → live-in staffing', pass: mapKYCToValidation(executiveRetreat).operatingModel.staffingLevel === 'live_in' },
    { name: 'Executive → full_wellness', pass: mapKYCToValidation(executiveRetreat).operatingModel.wetProgram === 'full_wellness' },
    { name: 'Executive → car collection garage', pass: extractUniqueRequirements(executiveRetreat).some(r => r.id === 'car-collection') },
    { name: 'Executive → executive office', pass: extractUniqueRequirements(executiveRetreat).some(r => r.id === 'executive-office') },
    { name: 'Executive → late-night media warning', pass: detectConflicts(executiveRetreat, deriveOperatingModel(executiveRetreat), deriveLifestylePriorities(executiveRetreat)).some(w => w.includes('media')) }
  ];

  let passed = 0;
  for (const test of tests) {
    const status = test.pass ? '✓' : '✗';
    console.log(`  ${status} ${test.name}`);
    if (test.pass) passed++;
  }

  console.log(`\n  PASSED: ${passed}/${tests.length}`);
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

// Run tests
runTests();

export { thornwoodEstate, multiGenCompound, executiveRetreat, runTests };
