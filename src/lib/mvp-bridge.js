/**
 * MVP Bridge - Transforms KYC and FYI data into MVP-compatible formats
 *
 * This module bridges:
 * - KYC (Know Your Client) → MVP brief generator input format
 * - FYI (Find Your Inspiration) → MVP space program (LIVE data)
 *
 * CRITICAL: FYI data is read directly from context for LIVE reactivity.
 * Any change in FYI immediately reflects in MVP - NO COPIES, NO SNAPSHOTS.
 *
 * CIRCULATION RULE: Only Main Residence gets circulation added.
 * Guest House and Pool House are reported as net SF only.
 * This matches FYI's structureTotals calculation exactly.
 */

import {
  getSpaceByCode,
  calculateSpaceArea,
  calculateCirculation,
  zones as zoneDefinitions
} from '../shared/space-registry';

// ============================================================================
// FYI → MVP TRANSFORMATION (LIVE DATA)
// ============================================================================

/**
 * Transform FYI selections into MVP space program
 *
 * This function is called within a useMemo with fyiData as dependency.
 * When fyiData changes (any FYI edit), this recomputes immediately.
 *
 * CRITICAL MATCHING FYI CALCULATION:
 * - Circulation is ONLY applied to Main Residence
 * - Guest House and Pool House are net SF only (no circulation)
 * - Uses calculateCirculation() with lockToTarget logic
 *
 * ZONE HANDLING: Zone comes from space-registry.js (single source of truth)
 * - Registry spaces have their zone pre-assigned
 * - Custom spaces (future) will require zone assignment in admin panel
 * - Unknown space codes are SKIPPED with warning
 *
 * @param {Object} fyiData - fyiData from AppContext (LIVE reference)
 * @returns {Object|null} MVP-compatible space program or null if no FYI data
 */
export function transformFYIToMVPProgram(fyiData) {
  // Guard: Check if FYI has been initialized
  if (!fyiData?.selections || Object.keys(fyiData.selections).length === 0) {
    return null;
  }

  const settings = fyiData.settings || {};
  const selections = fyiData.selections;
  const programTier = settings.programTier || '15k';
  const deltaPct = settings.deltaPct || 10;
  const targetSF = settings.targetSF || 15000;
  const lockToTarget = settings.lockToTarget !== false; // Default true
  const circulationPct = settings.circulationPct || 0.14;

  // Build space array from selections
  const spaces = [];
  const spacesByZone = {};
  let totalOutdoorSF = 0;

  // Track by structure - CRITICAL for correct circulation calculation
  const byStructure = {
    main: { spaces: [], netSF: 0, circulationSF: 0, totalSF: 0, byLevel: {}, spaceCount: 0 },
    guestHouse: { spaces: [], netSF: 0, totalSF: 0, spaceCount: 0 },
    poolHouse: { spaces: [], netSF: 0, totalSF: 0, spaceCount: 0 }
  };

  Object.entries(selections).forEach(([code, selection]) => {
    // Only include selected spaces
    if (!selection.included) return;

    // Get space definition from registry (source of truth for zone)
    const spaceDef = getSpaceByCode(code);
    if (!spaceDef) {
      console.warn(`[MVP Bridge] Unknown space code: ${code} - skipping (not in registry)`);
      return;
    }

    // Calculate SF using the same logic as FYI
    let spaceSF;
    if (selection.customSF) {
      spaceSF = selection.customSF;
    } else {
      spaceSF = calculateSpaceArea(spaceDef, programTier, selection.size, deltaPct);
    }

    // Get zone info from registry
    const zoneDef = zoneDefinitions.find(z => z.code === spaceDef.zone);
    const zoneName = zoneDef?.name || spaceDef.zone;

    // Determine structure
    const structure = spaceDef.structure || 'main';
    const level = selection.level ?? spaceDef.defaultLevel;

    // Build space entry
    const spaceEntry = {
      id: `fyi-${code}`,
      code: code,
      name: spaceDef.name,
      targetSF: spaceSF,
      zone: spaceDef.zone,
      zoneName: zoneName,
      level: level,
      size: selection.size || 'M',
      rationale: selection.notes || '',
      kycSource: selection.kycSource || null,
      isOutdoor: spaceDef.outdoorSpace || false,
      acousticZone: spaceDef.acousticZone || null,
      structure: structure
    };

    spaces.push(spaceEntry);

    // Group by zone for adjacency analysis
    if (!spacesByZone[spaceDef.zone]) {
      spacesByZone[spaceDef.zone] = {
        code: spaceDef.zone,
        name: zoneName,
        spaces: [],
        totalSF: 0
      };
    }
    spacesByZone[spaceDef.zone].spaces.push(spaceEntry);
    spacesByZone[spaceDef.zone].totalSF += spaceSF;

    // Track by structure - matches FYI's structureTotals calculation
    if (spaceDef.outdoorSpace) {
      totalOutdoorSF += spaceSF;
    } else {
      // Add to appropriate structure
      if (byStructure[structure]) {
        byStructure[structure].spaces.push(spaceEntry);
        byStructure[structure].netSF += spaceSF;
        byStructure[structure].spaceCount++;

        // Track by level for main structure only
        if (structure === 'main') {
          byStructure.main.byLevel[level] = (byStructure.main.byLevel[level] || 0) + spaceSF;
        }
      }
    }
  });

  // CRITICAL: Calculate circulation ONLY for Main Residence
  // This matches FYI's structureTotals calculation exactly
  const mainCirculationSF = calculateCirculation(
    byStructure.main.netSF,
    targetSF,
    lockToTarget,
    circulationPct,
    programTier
  );
  byStructure.main.circulationSF = mainCirculationSF;
  byStructure.main.totalSF = byStructure.main.netSF + mainCirculationSF;

  // Guest House and Pool House: net only, NO circulation
  byStructure.guestHouse.totalSF = byStructure.guestHouse.netSF;
  byStructure.poolHouse.totalSF = byStructure.poolHouse.netSF;

  // Calculate grand totals matching FYI exactly
  const totalNetSF = byStructure.main.netSF + byStructure.guestHouse.netSF + byStructure.poolHouse.netSF;
  const totalCirculationSF = mainCirculationSF; // Only main gets circulation
  const totalConditionedSF = byStructure.main.totalSF + byStructure.guestHouse.totalSF + byStructure.poolHouse.totalSF;

  // Build level breakdown (main structure only, matches FYI sidebar)
  const byLevel = byStructure.main.byLevel;

  // Calculate circulation percentage for display
  const circulationPctActual = byStructure.main.netSF > 0
    ? (mainCirculationSF / byStructure.main.netSF * 100).toFixed(1)
    : '0.0';

  return {
    // Source indicator - tells MVP this is FYI data
    source: 'FYI',
    timestamp: new Date().toISOString(),

    // Settings from FYI
    settings: {
      programTier,
      targetSF,
      hasBasement: settings.hasBasement || false,
      circulationPct,
      lockToTarget,
      deltaPct
    },

    // Space program
    spaces,
    spacesByZone,
    byLevel,
    byStructure,

    // Totals - now matches FYI exactly
    totals: {
      spaceCount: spaces.length,
      // Main Residence breakdown (for display)
      mainNetSF: byStructure.main.netSF,
      mainCirculationSF: mainCirculationSF,
      mainTotalSF: byStructure.main.totalSF,
      // Other structures (net only, no circulation)
      guestHouseSF: byStructure.guestHouse.totalSF,
      poolHouseSF: byStructure.poolHouse.totalSF,
      // Grand totals
      netSF: totalNetSF,
      circulationSF: totalCirculationSF,
      circulationPct: circulationPctActual,
      totalConditionedSF,
      outdoorSF: totalOutdoorSF,
      deltaFromTarget: totalConditionedSF - targetSF
    },

    // For preset selection in validation
    presetHint: programTier
  };
}

/**
 * Get summary of FYI program for display
 *
 * @param {Object} fyiProgram - Output from transformFYIToMVPProgram
 * @returns {Object} Summary for UI display
 */
export function getFYIProgramSummary(fyiProgram) {
  if (!fyiProgram) return null;

  const { spaces, totals, settings, spacesByZone, byLevel, byStructure } = fyiProgram;

  // Count spaces by type
  const bedroomCodes = ['PRI', 'JRPRI', 'GST1', 'GST2', 'GST3', 'GST4', 'BNK'];
  const bedroomCount = spaces.filter(s => bedroomCodes.includes(s.code)).length;

  const wellnessCodes = ['GYM', 'SPA', 'MAS', 'PLH', 'POOL', 'POOLSUP'];
  const wellnessCount = spaces.filter(s => wellnessCodes.includes(s.code)).length;

  const entertainmentCodes = ['BAR', 'GAME', 'THR', 'MUS', 'MEDIA'];
  const entertainmentCount = spaces.filter(s => entertainmentCodes.includes(s.code)).length;

  // Build structures array for display
  const structures = [];

  // Main Residence always first
  structures.push({
    name: 'Main Residence',
    key: 'main',
    netSF: totals.mainNetSF,
    circulationSF: totals.mainCirculationSF,
    totalSF: totals.mainTotalSF,
    spaceCount: byStructure.main.spaceCount,
    hasCirculation: true,
    byLevel: byLevel
  });

  // Guest House if present
  if (totals.guestHouseSF > 0) {
    structures.push({
      name: 'Guest House',
      key: 'guestHouse',
      netSF: totals.guestHouseSF,
      circulationSF: 0,
      totalSF: totals.guestHouseSF,
      spaceCount: byStructure.guestHouse.spaceCount,
      hasCirculation: false
    });
  }

  // Pool House if present
  if (totals.poolHouseSF > 0) {
    structures.push({
      name: 'Pool House',
      key: 'poolHouse',
      netSF: totals.poolHouseSF,
      circulationSF: 0,
      totalSF: totals.poolHouseSF,
      spaceCount: byStructure.poolHouse.spaceCount,
      hasCirculation: false
    });
  }

  return {
    programTier: settings.programTier,
    targetSF: settings.targetSF,

    // Structure breakdown (matches FYI sidebar)
    structures,

    // Grand totals
    totals: {
      spaces: totals.spaceCount,
      netSF: totals.netSF,
      circulationSF: totals.circulationSF,
      circulationPct: totals.circulationPct,
      totalSF: totals.totalConditionedSF,
      outdoorSF: totals.outdoorSF,
      delta: totals.deltaFromTarget,
      deltaPercent: ((totals.deltaFromTarget / settings.targetSF) * 100).toFixed(1)
    },

    counts: {
      bedrooms: bedroomCount,
      wellness: wellnessCount,
      entertainment: entertainmentCount
    },

    zones: Object.values(spacesByZone).map(zone => ({
      name: zone.name,
      spaceCount: zone.spaces.length,
      totalSF: zone.totalSF
    })),

    levels: Object.entries(byLevel).map(([level, sf]) => ({
      level: parseInt(level),
      label: level === '1' ? 'L1 (Arrival)' : `L${level}`,
      sf
    })).sort((a, b) => b.level - a.level)
  };
}

// ============================================================================
// KYC → MVP TRANSFORMATION (existing functions)
// ============================================================================

/**
 * Check if household has children (any age under 18)
 */
function hasChildrenInHousehold(familyMembers) {
  if (!familyMembers || familyMembers.length === 0) return false;
  return familyMembers.some(member => {
    const age = parseInt(member.age);
    if (!isNaN(age) && age < 18) return true;
    const role = member.role || '';
    return ['child', 'young-child', 'teenager'].includes(role);
  });
}

/**
 * Check if household has school-age children (ages 5-18)
 */
function hasSchoolAgeChildren(familyMembers) {
  if (!familyMembers || familyMembers.length === 0) return false;
  return familyMembers.some(member => {
    const age = parseInt(member.age);
    if (!isNaN(age) && age >= 5 && age <= 18) return true;
    const role = member.role || '';
    return ['child', 'teenager'].includes(role);
  });
}

/**
 * Get count of children in household
 */
function getChildrenCount(familyMembers) {
  if (!familyMembers || !Array.isArray(familyMembers)) return 0;
  return familyMembers.filter(member => {
    const age = parseInt(member.age);
    if (!isNaN(age) && age < 18) return true;
    const role = member.role || '';
    return ['child', 'young-child', 'teenager'].includes(role);
  }).length;
}

/**
 * Map KYC staffing fields to MVP staffingLevel enum
 */
function mapStaffingLevel(familyHousehold) {
  if (familyHousehold.staffingLevel) {
    return familyHousehold.staffingLevel;
  }
  if (familyHousehold.liveInStaff && familyHousehold.liveInStaff > 0) {
    return 'live_in';
  }
  if (familyHousehold.staffAccommodationRequired) {
    return 'live_in';
  }
  return 'none';
}

/**
 * Map KYC entertaining frequency to MVP entertainingLoad enum
 */
function mapEntertainingLoad(frequency) {
  const mapping = {
    'rarely': 'rare',
    'monthly': 'monthly',
    'weekly': 'weekly',
    'daily': 'weekly',
  };
  return mapping[frequency] || 'rare';
}

/**
 * Derive wellness program tier from selected priorities
 */
function deriveWellnessProgram(priorities) {
  if (!priorities || priorities.length === 0) return 'none';

  const wetElements = ['pool', 'spa', 'cold-plunge'].filter(e => priorities.includes(e));
  const totalElements = priorities.length;

  if (wetElements.length >= 2 && totalElements >= 4) return 'resort_level';
  if (wetElements.length >= 1 && totalElements >= 3) return 'comprehensive';
  if (totalElements >= 1) return 'basic';

  return 'none';
}

/**
 * Check for outdoor entertaining requirements
 */
function hasOutdoorEntertaining(spaceRequirements) {
  const outdoorSpaces = [
    'outdoor-kitchen', 'outdoor-dining', 'bar-lounge',
    'event-lawn', 'covered-outdoor', 'pergola-pavilion'
  ];

  const mustHave = spaceRequirements.mustHaveOutdoorLiving || [];
  const wouldLike = spaceRequirements.wouldLikeOutdoorLiving || [];

  return outdoorSpaces.some(space =>
    mustHave.includes(space) || wouldLike.includes(space)
  );
}

/**
 * Calculate guest bedroom count from total bedroom count
 */
function calculateGuestBedrooms(bedroomCount) {
  if (!bedroomCount || bedroomCount < 1) return 3;
  return Math.max(0, bedroomCount - 1);
}

/**
 * Determine number of home offices needed
 */
function calculateHomeOfficeCount(lifestyleLiving) {
  const wfhCount = lifestyleLiving.wfhPeopleCount || 0;
  const wfhFrequency = lifestyleLiving.workFromHome || '';

  if (wfhFrequency === 'never' || wfhFrequency === '') return 0;
  if (wfhCount >= 2) return 2;
  if (wfhCount === 1 || wfhFrequency !== 'never') return 1;
  return 0;
}

/**
 * Transform KYC data into MVP KYCBriefInputs format
 *
 * @param {Object} kycData - The full KYC data object from AppContext
 * @param {string} respondent - Which respondent's data to use
 * @returns {Object} KYCBriefInputs compatible object
 */
export function transformKYCToMVPBrief(kycData, respondent = 'principal') {
  const data = kycData[respondent];

  if (!data) {
    console.warn(`No KYC data found for respondent: ${respondent}`);
    return null;
  }

  const {
    projectParameters = {},
    familyHousehold = {},
    lifestyleLiving = {},
    spaceRequirements = {}
  } = data;

  return {
    // Property Configuration
    sfCapConstraint: projectParameters.sfCapConstraint || null,
    hasBasement: projectParameters.hasBasement || false,
    levelsAboveGrade: projectParameters.floors || 2,

    // Bedroom Configuration
    totalBedroomCount: projectParameters.bedroomCount || 0,
    guestBedroomCount: calculateGuestBedrooms(projectParameters.bedroomCount),

    // Household Composition
    hasChildren: hasChildrenInHousehold(familyHousehold.familyMembers),
    childrenCount: getChildrenCount(familyHousehold.familyMembers),
    hasSchoolAgeChildren: hasSchoolAgeChildren(familyHousehold.familyMembers),

    // Pets
    hasPets: !!(familyHousehold.pets && familyHousehold.pets.trim()),
    petsDescription: familyHousehold.pets || '',

    // Staffing
    staffingLevel: mapStaffingLevel(familyHousehold),

    // Entertaining
    entertainingLoad: mapEntertainingLoad(lifestyleLiving.entertainingFrequency),
    formalEntertainingRequired:
      lifestyleLiving.entertainingStyle === 'formal' ||
      lifestyleLiving.entertainingStyle === 'both',

    // Culinary
    professionalChefAccess:
      (spaceRequirements.mustHaveSpaces || []).includes('catering-kitchen') ||
      (spaceRequirements.mustHaveSpaces || []).includes('chef-kitchen'),

    // Work
    workFromHomeRequired:
      lifestyleLiving.workFromHome !== 'never' &&
      lifestyleLiving.workFromHome !== '',
    homeOfficeCount: calculateHomeOfficeCount(lifestyleLiving),
    wantsSecondOffice: calculateHomeOfficeCount(lifestyleLiving) >= 2,

    // Pet Amenities
    wantsPetGroomingRoom: familyHousehold.petGroomingRoom || false,
    wantsDogRun: familyHousehold.petDogRun || false,

    // Wellness Program
    wellnessProgram: deriveWellnessProgram(lifestyleLiving.wellnessPriorities),
    wantsGym:
      (lifestyleLiving.wellnessPriorities || []).includes('gym') ||
      (lifestyleLiving.wellnessPriorities || []).includes('fitness') ||
      (spaceRequirements.mustHaveSpaces || []).includes('gym'),
    wantsSpa:
      (lifestyleLiving.wellnessPriorities || []).includes('spa') ||
      (lifestyleLiving.wellnessPriorities || []).includes('sauna') ||
      (spaceRequirements.mustHaveSpaces || []).includes('spa-wellness') ||
      (spaceRequirements.mustHaveSpaces || []).includes('sauna') ||
      (spaceRequirements.mustHaveSpaces || []).includes('steam-room'),
    wantsPool:
      (lifestyleLiving.wellnessPriorities || []).includes('pool') ||
      (spaceRequirements.mustHaveSpaces || []).includes('pool-indoor') ||
      (spaceRequirements.mustHavePoolWater || []).includes('swimming-pool'),

    // Amenities
    wantsWineRoom:
      (spaceRequirements.mustHaveSpaces || []).includes('wine-cellar') ||
      (lifestyleLiving.hobbies || []).includes('wine'),
    wantsMediaRoom:
      (spaceRequirements.mustHaveSpaces || []).includes('media-room'),
    lateNightMediaUse: lifestyleLiving.lateNightMediaUse || false,
    wantsLibrary:
      (spaceRequirements.mustHaveSpaces || []).includes('library') ||
      (lifestyleLiving.hobbies || []).includes('reading'),
    wantsSeparateFamilyRoom: spaceRequirements.wantsSeparateFamilyRoom || false,
    wantsSecondFormalLiving: spaceRequirements.wantsSecondFormalLiving || false,
    wantsGameRoom:
      (spaceRequirements.mustHaveSpaces || []).includes('game-room'),
    wantsBar: spaceRequirements.wantsBar || false,
    wantsBunkRoom: spaceRequirements.wantsBunkRoom || false,
    wantsBreakfastNook: spaceRequirements.wantsBreakfastNook || false,
    wantsOutdoorEntertaining: hasOutdoorEntertaining(spaceRequirements),
  };
}

/**
 * Get a summary of the MVP brief inputs for display
 */
export function getMVPBriefSummary(briefInputs) {
  if (!briefInputs) return null;

  return {
    propertyConfig: {
      sfCap: briefInputs.sfCapConstraint ? `${briefInputs.sfCapConstraint.toLocaleString()} SF` : 'Discovery Mode',
      basement: briefInputs.hasBasement ? 'Yes' : 'No',
      levels: briefInputs.levelsAboveGrade,
    },
    household: {
      totalBedrooms: briefInputs.totalBedroomCount,
      guestBedrooms: briefInputs.guestBedroomCount,
      hasChildren: briefInputs.hasChildren,
      childrenCount: briefInputs.childrenCount,
      hasSchoolAge: briefInputs.hasSchoolAgeChildren,
      hasPets: briefInputs.hasPets,
      petsDescription: briefInputs.petsDescription,
      staffing: briefInputs.staffingLevel,
    },
    lifestyle: {
      entertaining: briefInputs.entertainingLoad,
      formalEntertaining: briefInputs.formalEntertainingRequired,
      workFromHome: briefInputs.workFromHomeRequired,
      homeOfficeCount: briefInputs.homeOfficeCount,
      wantsSecondOffice: briefInputs.wantsSecondOffice,
      lateNightMedia: briefInputs.lateNightMediaUse,
    },
    wellness: {
      program: briefInputs.wellnessProgram,
      gym: briefInputs.wantsGym,
      spa: briefInputs.wantsSpa,
      pool: briefInputs.wantsPool,
    },
    amenities: {
      wine: briefInputs.wantsWineRoom,
      media: briefInputs.wantsMediaRoom,
      library: briefInputs.wantsLibrary,
      familyRoom: briefInputs.wantsSeparateFamilyRoom,
      salon: briefInputs.wantsSecondFormalLiving,
      gameRoom: briefInputs.wantsGameRoom,
      bar: briefInputs.wantsBar,
      bunkRoom: briefInputs.wantsBunkRoom,
      breakfastNook: briefInputs.wantsBreakfastNook,
      outdoorEntertaining: briefInputs.wantsOutdoorEntertaining,
      petGroomingRoom: briefInputs.wantsPetGroomingRoom,
      dogRun: briefInputs.wantsDogRun,
    },
  };
}

/**
 * Count the number of selected amenities (for tier estimation)
 */
export function countSelectedAmenities(briefInputs) {
  if (!briefInputs) return 0;

  const amenityFlags = [
    briefInputs.wantsWineRoom,
    briefInputs.wantsMediaRoom,
    briefInputs.wantsLibrary,
    briefInputs.wantsSeparateFamilyRoom,
    briefInputs.wantsSecondFormalLiving,
    briefInputs.wantsGameRoom,
    briefInputs.wantsBar,
    briefInputs.wantsBunkRoom,
    briefInputs.wantsBreakfastNook,
    briefInputs.wantsGym,
    briefInputs.wantsSpa,
    briefInputs.wantsPool,
    briefInputs.wantsOutdoorEntertaining,
    briefInputs.professionalChefAccess,
    briefInputs.formalEntertainingRequired,
  ];

  return amenityFlags.filter(Boolean).length;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const mvpBridge = {
  // FYI → MVP (LIVE)
  transformFYIToMVPProgram,
  getFYIProgramSummary,
  // KYC → MVP
  transformKYCToMVPBrief,
  getMVPBriefSummary,
  countSelectedAmenities,
};

export default mvpBridge;
