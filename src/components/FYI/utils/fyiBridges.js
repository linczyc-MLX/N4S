/**
 * FYI Bridge Functions
 * 
 * Handles data transformation between KYC → FYI and FYI → MVP modules.
 * Ensures consistent data flow across the N4S platform.
 * 
 * UPDATED: 
 * - Added 5K tier support
 * - Would-likes are now pre-selected (included) in template
 * - Improved bedroom count logic
 * - Tier determination is internal algorithm only
 */

import {
  getSpaceByCode,
  getSpacesForTier,
  legacyToCode,
  zones
} from '../../../shared/space-registry';

/**
 * Transform KYC data into FYI initial state
 * 
 * @param {Object} kycData - Consolidated KYC data from AppContext
 * @returns {Object} - FYI settings and initial selections
 */
export function generateFYIFromKYC(kycData) {
  if (!kycData) {
    return {
      settings: getDefaultSettings(),
      selections: {},
      recommendations: []
    };
  }

  // Extract key KYC values
  const targetSF = kycData.projectParameters?.targetGSF || 10000;
  const hasBasement = kycData.projectParameters?.hasBasement || false;
  const bedroomCount = kycData.projectParameters?.bedroomCount || 4;

  // Determine internal program tier (not exposed to client)
  const programTier = determineTier(targetSF);
  
  // Build settings
  const settings = {
    targetSF,
    deltaPct: 10,
    circulationPct: getDefaultCirculation(programTier),
    lockToTarget: true,
    programTier,  // Internal only - not shown to client
    hasBasement
  };
  
  // Build initial selections
  const selections = buildInitialSelections(kycData, programTier, hasBasement, bedroomCount);
  
  // Generate recommendations based on KYC responses
  const recommendations = generateRecommendations(kycData, selections);
  
  return {
    settings,
    selections,
    recommendations
  };
}

/**
 * Determine internal program tier from target SF
 * This is used by the algorithm only - clients don't see tier labels
 * 
 * @param {number} targetSF - Target square footage
 * @returns {string} - Internal tier identifier ('5k', '10k', '15k', '20k')
 */
function determineTier(targetSF) {
  if (targetSF < 7500) return '5k';
  if (targetSF < 12500) return '10k';
  if (targetSF < 17500) return '15k';
  return '20k';
}

/**
 * Get default circulation percentage for tier
 */
function getDefaultCirculation(tier) {
  const defaults = {
    '5k': 0.12,
    '10k': 0.13,
    '15k': 0.14,
    '20k': 0.15
  };
  return defaults[tier] || 0.13;
}

/**
 * Get default settings
 */
function getDefaultSettings() {
  return {
    targetSF: 10000,
    deltaPct: 10,
    circulationPct: 0.13,
    lockToTarget: true,
    programTier: '10k',
    hasBasement: false
  };
}

/**
 * Build initial space selections from KYC data
 * 
 * Logic:
 * 1. Start with spaces available for the tier
 * 2. Include all tier-appropriate spaces by default
 * 3. Apply bedroom count adjustments
 * 4. Apply must-have spaces (ensure included)
 * 5. Apply would-like spaces (pre-select them - INCLUDED)
 * 6. Apply other KYC flags (staffing, wellness, etc.)
 */
function buildInitialSelections(kycData, tier, hasBasement, bedroomCount) {
  const selections = {};
  const availableSpaces = getSpacesForTier(tier);
  
  // Initialize all available spaces for tier
  availableSpaces.forEach(space => {
    if (space.baseSF[tier] !== null) {
      selections[space.code] = {
        included: true, // Start with all included
        size: 'M',
        level: space.defaultLevel,
        customSF: null,
        imageUrl: null,
        notes: '',
        kycSource: null // Track which KYC field influenced this
      };
    }
  });
  
  // ---------------------------------------------------------------------------
  // BEDROOM COUNT LOGIC
  // ---------------------------------------------------------------------------
  // Bedrooms available: PRI (always), GST1, GST2, GST3, GST4, JRPRI, BNK
  // At 5K tier: PRI + GST1 + GST2 + GST3 available (GST3 has 5K baseSF)
  // At 10K tier: PRI + GST1 + GST2 available
  // At 15K+ tier: All including JRPRI, GST3, BNK
  
  // Primary bedroom always included
  // Calculate how many guest suites based on bedroom count
  const guestBedroomsNeeded = Math.max(0, bedroomCount - 1); // -1 for primary
  
  // Guest suite inclusion based on count
  if (selections['GST1']) {
    selections['GST1'].included = guestBedroomsNeeded >= 1;
    if (selections['GST1'].included) selections['GST1'].kycSource = 'bedroomCount';
  }
  if (selections['GST2']) {
    selections['GST2'].included = guestBedroomsNeeded >= 2;
    if (selections['GST2'].included) selections['GST2'].kycSource = 'bedroomCount';
  }
  if (selections['GST3']) {
    selections['GST3'].included = guestBedroomsNeeded >= 3;
    if (selections['GST3'].included) selections['GST3'].kycSource = 'bedroomCount';
  }
  if (selections['GST4']) {
    selections['GST4'].included = guestBedroomsNeeded >= 4;
    if (selections['GST4'].included) selections['GST4'].kycSource = 'bedroomCount';
  }
  
  // Jr. Primary for higher bedroom counts at 15K+
  if (selections['JRPRI'] && guestBedroomsNeeded >= 3) {
    selections['JRPRI'].included = true;
    selections['JRPRI'].kycSource = 'bedroomCount';
    if (selections['JRPRIBATH']) {
      selections['JRPRIBATH'].included = true;
      selections['JRPRIBATH'].kycSource = 'bedroomCount';
    }
    if (selections['JRPRICL']) {
      selections['JRPRICL'].included = true;
      selections['JRPRICL'].kycSource = 'bedroomCount';
    }
  } else {
    // Not enough bedrooms for Jr. Primary
    if (selections['JRPRI']) selections['JRPRI'].included = false;
    if (selections['JRPRIBATH']) selections['JRPRIBATH'].included = false;
    if (selections['JRPRICL']) selections['JRPRICL'].included = false;
  }
  
  // ---------------------------------------------------------------------------
  // MUST-HAVE SPACES (ensure included)
  // ---------------------------------------------------------------------------
  const mustHaveSpaces = kycData.spaceRequirements?.mustHaveSpaces || [];
  mustHaveSpaces.forEach(legacyValue => {
    const code = legacyToCode(legacyValue);
    if (code && selections[code]) {
      selections[code].included = true;
      selections[code].kycSource = 'mustHave';
    }
  });
  
  // ---------------------------------------------------------------------------
  // WOULD-LIKE SPACES (pre-select them - INCLUDED)
  // Per Michael's guidance: Include would-likes in the template
  // ---------------------------------------------------------------------------
  const niceToHaveSpaces = kycData.spaceRequirements?.niceToHaveSpaces || [];
  niceToHaveSpaces.forEach(legacyValue => {
    const code = legacyToCode(legacyValue);
    if (code && selections[code]) {
      selections[code].included = true;
      if (!selections[code].kycSource) {
        selections[code].kycSource = 'niceToHave';
      }
    }
  });
  
  // ---------------------------------------------------------------------------
  // SPECIFIC KYC FLAGS
  // ---------------------------------------------------------------------------
  
  // Pet grooming - upsize mudroom
  if (kycData.familyHousehold?.petGroomingRoom) {
    if (selections['MUD']) {
      selections['MUD'].size = 'L';
      selections['MUD'].notes = 'Includes pet grooming station per KYC';
      selections['MUD'].kycSource = 'petGroomingRoom';
    }
  }
  
  // Late night media use - ensure sound isolation
  if (kycData.lifestyleLiving?.lateNightMediaUse) {
    if (selections['MEDIA']) {
      selections['MEDIA'].size = 'L';
      selections['MEDIA'].notes = 'Sound isolation required for late-night use';
      selections['MEDIA'].kycSource = 'lateNightMediaUse';
    }
    // If theater exists, also note
    if (selections['THR']) {
      selections['THR'].notes = 'Sound isolation required';
      selections['THR'].kycSource = 'lateNightMediaUse';
    }
  }
  
  // Bar requested
  if (kycData.spaceRequirements?.wantsBar) {
    if (selections['BAR']) {
      selections['BAR'].included = true;
      selections['BAR'].kycSource = 'wantsBar';
    }
  }
  
  // Bunk room requested
  if (kycData.spaceRequirements?.wantsBunkRoom) {
    if (selections['BNK']) {
      selections['BNK'].included = true;
      selections['BNK'].kycSource = 'wantsBunkRoom';
    }
  }
  
  // Breakfast nook requested
  if (kycData.spaceRequirements?.wantsBreakfastNook) {
    if (selections['BKF']) {
      selections['BKF'].included = true;
      selections['BKF'].size = 'M';
      selections['BKF'].kycSource = 'wantsBreakfastNook';
    }
  }

  // ---------------------------------------------------------------------------
  // STAFFING LEVEL
  // ---------------------------------------------------------------------------
  const staffing = kycData.familyHousehold?.staffingLevel;
  if (staffing === 'live_in' || staffing === 'full_time') {
    if (selections['STF']) {
      selections['STF'].included = true;
      selections['STF'].kycSource = 'staffingLevel';
    }
    // 20k tier gets staff kitchen/lounge
    if (tier === '20k') {
      if (selections['SKT']) selections['SKT'].included = true;
      if (selections['SLG']) selections['SLG'].included = true;
    }
  } else {
    // No live-in staff, exclude staff-only spaces
    if (selections['STF']) selections['STF'].included = false;
    if (selections['SKT']) selections['SKT'].included = false;
    if (selections['SLG']) selections['SLG'].included = false;
  }
  
  // ---------------------------------------------------------------------------
  // KIDS AND NANNY
  // ---------------------------------------------------------------------------
  const familyMembers = kycData.familyHousehold?.familyMembers || [];
  const kidsCount = familyMembers.filter(m => {
    const age = parseInt(m.age);
    return !isNaN(age) && age < 18;
  }).length;
  
  if (kidsCount === 0) {
    if (selections['BNK']) selections['BNK'].included = false;
    if (selections['PLY']) selections['PLY'].included = false;
  } else {
    if (selections['BNK']) {
      selections['BNK'].included = true;
      selections['BNK'].kycSource = 'kidsCount';
    }
  }
  
  // Nanny suite based on kids + staffing
  if (kidsCount > 0 && (staffing === 'live_in' || staffing === 'full_time')) {
    if (selections['NNY']) {
      selections['NNY'].included = true;
      selections['NNY'].kycSource = 'staffingWithKids';
    }
  } else {
    if (selections['NNY']) selections['NNY'].included = false;
  }
  
  // ---------------------------------------------------------------------------
  // WELLNESS
  // ---------------------------------------------------------------------------
  const wellnessPriorities = kycData.lifestyleLiving?.wellnessPriorities || [];
  if (!wellnessPriorities.includes('gym') && !wellnessPriorities.includes('fitness')) {
    if (selections['GYM']) {
      selections['GYM'].size = 'S'; // Downsize but keep
    }
  }
  if (!wellnessPriorities.includes('spa') && !wellnessPriorities.includes('sauna')) {
    if (selections['SPA']) {
      selections['SPA'].size = 'S';
    }
    if (selections['MAS']) {
      selections['MAS'].included = false;
    }
  }
  
  // ---------------------------------------------------------------------------
  // ENTERTAINING FREQUENCY
  // ---------------------------------------------------------------------------
  const entertaining = kycData.lifestyleLiving?.entertainingFrequency;
  if (entertaining === 'rarely' || entertaining === 'never') {
    // Downsize entertainment spaces
    if (selections['GAME']) selections['GAME'].included = false;
    if (selections['BAR'] && !selections['BAR'].kycSource) selections['BAR'].included = false;
  } else if (entertaining === 'weekly' || entertaining === 'daily') {
    // Upsize entertainment
    if (selections['GR']) selections['GR'].size = 'L';
    if (selections['BAR']) {
      selections['BAR'].included = true;
      selections['BAR'].size = 'L';
    }
  }
  
  // ---------------------------------------------------------------------------
  // BASEMENT PLACEMENT
  // ---------------------------------------------------------------------------
  if (hasBasement) {
    // Consider moving these to basement
    const basementCandidates = ['THR', 'GAME', 'MUS', 'WINE', 'GYM', 'SPA', 'STR', 'MEP'];
    basementCandidates.forEach(code => {
      const space = getSpaceByCode(code);
      if (space?.basementEligible && selections[code]) {
        // Theater is best in basement for sound
        if (code === 'THR') {
          selections[code].level = -1;
          selections[code].notes = (selections[code].notes || '') + ' Basement location ideal for acoustics.';
        }
        // Wine cellar traditionally in basement
        if (code === 'WINE') {
          selections[code].level = -1;
        }
        // Storage and mechanical to basement
        if (code === 'STR' || code === 'MEP') {
          selections[code].level = -1;
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // DEFAULT POWDER ROOMS BY ZONE
  // ---------------------------------------------------------------------------
  // PWD (Z1_APB) - already handled as core space
  // PWD2 (Z2_FAM) - always included (core tier, family zone)
  if (selections['PWD2']) {
    selections['PWD2'].included = true;
    selections['PWD2'].kycSource = 'default_family_zone';
  }

  // PWD3 (Z3_ENT) - included if any entertainment spaces are selected (15k+ tier)
  const hasEntertainment = selections['MEDIA']?.included || selections['THR']?.included ||
                           selections['BAR']?.included || selections['GAME']?.included;
  if (hasEntertainment && selections['PWD3']) {
    selections['PWD3'].included = true;
    selections['PWD3'].kycSource = 'entertainment_zone';
  }

  // PWD4 (Z4_WEL) - always included (core tier, wellness zone)
  if (selections['PWD4']) {
    selections['PWD4'].included = true;
    selections['PWD4'].kycSource = 'default_wellness_zone';
  }

  // POOL_BATH (Z8_OUT) - included if outdoor pool is selected
  const hasPool = selections['POOL']?.included;
  if (hasPool && selections['POOL_BATH']) {
    selections['POOL_BATH'].included = true;
    selections['POOL_BATH'].kycSource = 'pool_selected';
  }

  // ---------------------------------------------------------------------------
  // 5K TIER SPECIFIC ADJUSTMENTS
  // ---------------------------------------------------------------------------
  if (tier === '5k') {
    // At 5K, media room is optional (great room serves entertainment)
    if (selections['MEDIA'] && !selections['MEDIA'].kycSource) {
      selections['MEDIA'].included = false;
    }
    
    // At 5K, family room may be combined with great room concept
    // Keep both but downsize
    if (selections['FR']) {
      selections['FR'].size = 'S';
    }
  }

  return selections;
}

/**
 * Generate recommendations based on KYC data and selections
 */
function generateRecommendations(kycData, selections) {
  const recommendations = [];
  
  // Check for potential conflicts or optimizations
  
  // Large household may need larger kitchen
  const familySize = (kycData.familyHousehold?.familyMembers || []).length;
  if (familySize >= 6 && selections['KIT']?.size !== 'L') {
    recommendations.push({
      code: 'KIT',
      type: 'upsize',
      reason: `Family of ${familySize} may benefit from larger kitchen`,
      action: 'Consider sizing Kitchen to Large'
    });
  }
  
  // Frequent entertainers need larger great room
  if (kycData.lifestyleLiving?.entertainingFrequency === 'weekly' && selections['GR']?.size !== 'L') {
    recommendations.push({
      code: 'GR',
      type: 'upsize',
      reason: 'Weekly entertaining suggests need for larger formal space',
      action: 'Consider sizing Great Room to Large'
    });
  }
  
  // Work from home needs proper office
  if (kycData.lifestyleLiving?.workFromHome === 'always' && kycData.lifestyleLiving?.wfhPeopleCount >= 2) {
    recommendations.push({
      code: 'OFF',
      type: 'upsize',
      reason: `${kycData.lifestyleLiving.wfhPeopleCount} people work from home`,
      action: 'Consider adding second office or upsizing primary office'
    });
  }
  
  // High noise sensitivity needs media room buffering
  if (kycData.lifestyleLiving?.noiseSensitivity >= 4 && selections['MEDIA']?.included) {
    recommendations.push({
      code: 'MEDIA',
      type: 'adjacency',
      reason: 'High noise sensitivity indicated',
      action: 'Ensure Media Room has acoustic buffering from bedrooms'
    });
  }
  
  return recommendations;
}

/**
 * Transform FYI brief into MVP-compatible format
 * 
 * @param {Object} fyiBrief - Output from useFYIState.generateMVPBrief()
 * @returns {Object} - MVP BriefSpace[] compatible format
 */
export function generateMVPFromFYI(fyiBrief) {
  const { settings, spaces, totals } = fyiBrief;
  
  // Transform spaces into MVP BriefSpace format
  const briefSpaces = spaces.map((space, index) => {
    const spaceDef = getSpaceByCode(space.code);
    const zoneDef = zones.find(z => z.code === space.zone);
    
    return {
      id: `s${index + 1}`,
      code: space.code,
      name: space.name,
      targetSF: space.targetSF,
      zone: zoneDef?.name || space.zone,
      level: space.level,
      rationale: space.notes || spaceDef?.notes || ''
    };
  });
  
  // Group by zone for adjacency validation
  const spacesByZone = {};
  briefSpaces.forEach(space => {
    if (!spacesByZone[space.zone]) {
      spacesByZone[space.zone] = [];
    }
    spacesByZone[space.zone].push(space);
  });
  
  return {
    programTier: settings.programTier,
    targetSF: settings.targetSF,
    hasBasement: settings.hasBasement,
    spaces: briefSpaces,
    spacesByZone,
    totals: {
      net: totals.net,
      circulation: totals.circulation,
      total: totals.total
    },
    // MVP will use this to select appropriate preset or validate custom
    presetHint: getPresetHint(settings.targetSF)
  };
}

/**
 * Get preset hint for MVP based on target SF
 * This determines which adjacency matrix to use
 */
function getPresetHint(targetSF) {
  if (targetSF < 7500) return '5k';
  if (targetSF < 12500) return '10k';
  if (targetSF < 17500) return '15k';
  return '20k';
}

/**
 * Validate FYI selections against basic rules
 * 
 * @param {Object} selections - FYI space selections
 * @param {Object} settings - FYI settings
 * @returns {Object} - Validation results with warnings and errors
 */
export function validateFYISelections(selections, settings) {
  const errors = [];
  const warnings = [];
  
  // Calculate total conditioned SF
  let totalSF = 0;
  Object.entries(selections).forEach(([code, selection]) => {
    if (selection.included) {
      const space = getSpaceByCode(code);
      if (space && !space.outdoorSpace && space.baseSF[settings.programTier]) {
        // Rough calculation for validation
        const base = space.baseSF[settings.programTier];
        const delta = settings.deltaPct / 100;
        let sf = base;
        if (selection.size === 'S') sf = Math.round(base * (1 - delta));
        if (selection.size === 'L') sf = Math.round(base * (1 + delta));
        if (selection.customSF) sf = selection.customSF;
        totalSF += sf;
      }
    }
  });
  
  // Check if total is within reasonable range of target
  const targetWithCirc = settings.targetSF;
  const estimatedTotal = totalSF * (1 + settings.circulationPct);
  const variance = ((estimatedTotal - targetWithCirc) / targetWithCirc) * 100;
  
  // Note: We don't error on over/under target - client has flexibility
  // Only warn for extreme cases
  if (variance > 50) {
    warnings.push({
      type: 'over_target',
      message: `Program is significantly over target (${variance.toFixed(0)}%). Consider reviewing selections.`,
      value: estimatedTotal
    });
  }
  
  if (variance < -50) {
    warnings.push({
      type: 'under_target',
      message: `Program is significantly under target (${Math.abs(variance).toFixed(0)}%). Consider adding spaces.`,
      value: estimatedTotal
    });
  }
  
  // Check for required spaces
  const requiredCodes = ['FOY', 'KIT', 'FR', 'PRI', 'PRIBATH'];
  requiredCodes.forEach(code => {
    if (!selections[code]?.included) {
      errors.push({
        type: 'missing_required',
        code,
        message: `${getSpaceByCode(code)?.name || code} is required for any residential program`
      });
    }
  });

  // Check for primary closets (his/her are separate codes)
  if (!selections['PRICL_HIS']?.included && !selections['PRICL_HER']?.included) {
    errors.push({
      type: 'missing_required',
      code: 'PRICL',
      message: `Primary Closet is required for any residential program`
    });
  }
  
  // Check basement space placement
  if (!settings.hasBasement) {
    Object.entries(selections).forEach(([code, selection]) => {
      if (selection.included && selection.level < 0) {
        errors.push({
          type: 'invalid_level',
          code,
          message: `${getSpaceByCode(code)?.name || code} is placed in basement but project has no basement`
        });
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    estimatedTotal: Math.round(estimatedTotal)
  };
}

/**
 * Transform LIVE FYI data into MVP program format
 *
 * This function reads directly from fyiData (AppContext) and transforms
 * selections into a structured program view with zone/level breakdown.
 * Used by MVPModule for instant reactive updates.
 *
 * @param {Object} fyiData - Live fyiData from AppContext
 * @returns {Object} - Structured program with zones, levels, and totals
 */
export function transformFYIToMVPProgram(fyiData) {
  if (!fyiData || !fyiData.selections) {
    return null;
  }

  const { settings, selections } = fyiData;
  const tier = settings?.programTier || '10k';
  const deltaPct = settings?.deltaPct || 10;

  // Build spaces array with zone info from space-registry
  const spaces = [];
  const zoneBreakdown = {};
  const levelBreakdown = {};

  Object.entries(selections).forEach(([code, selection]) => {
    if (!selection.included) return;

    const spaceDef = getSpaceByCode(code);
    if (!spaceDef) {
      console.warn(`[FYI→MVP] Unknown space code: ${code} - skipping`);
      return;
    }

    // Calculate SF
    const baseSF = spaceDef.baseSF[tier];
    if (baseSF === null) return; // Not available for this tier

    let targetSF = baseSF;
    if (selection.customSF) {
      targetSF = selection.customSF;
    } else {
      const delta = deltaPct / 100;
      if (selection.size === 'S') targetSF = Math.round(baseSF * (1 - delta));
      if (selection.size === 'L') targetSF = Math.round(baseSF * (1 + delta));
    }

    const space = {
      code,
      name: spaceDef.name,
      abbrev: spaceDef.abbrev,
      zone: spaceDef.zone,
      level: selection.level ?? spaceDef.defaultLevel,
      size: selection.size || 'M',
      targetSF,
      isOutdoor: spaceDef.outdoorSpace || false,
      notes: selection.notes || ''
    };

    spaces.push(space);

    // Aggregate by zone
    if (!zoneBreakdown[spaceDef.zone]) {
      const zoneDef = zones.find(z => z.code === spaceDef.zone);
      zoneBreakdown[spaceDef.zone] = {
        code: spaceDef.zone,
        name: zoneDef?.name || spaceDef.zone,
        order: zoneDef?.order || 99,
        spaces: [],
        totalSF: 0,
        conditionedSF: 0
      };
    }
    zoneBreakdown[spaceDef.zone].spaces.push(space);
    zoneBreakdown[spaceDef.zone].totalSF += targetSF;
    if (!spaceDef.outdoorSpace) {
      zoneBreakdown[spaceDef.zone].conditionedSF += targetSF;
    }

    // Aggregate by level
    const levelKey = space.level;
    if (!levelBreakdown[levelKey]) {
      levelBreakdown[levelKey] = {
        level: levelKey,
        label: levelKey === 1 ? 'L1 (Arrival)' : levelKey > 0 ? `L${levelKey}` : `L${levelKey}`,
        spaces: [],
        totalSF: 0,
        conditionedSF: 0
      };
    }
    levelBreakdown[levelKey].spaces.push(space);
    levelBreakdown[levelKey].totalSF += targetSF;
    if (!spaceDef.outdoorSpace) {
      levelBreakdown[levelKey].conditionedSF += targetSF;
    }
  });

  // Sort zones by order
  const sortedZones = Object.values(zoneBreakdown).sort((a, b) => a.order - b.order);

  // Sort levels (descending: L3, L2, L1, L-1, L-2)
  const sortedLevels = Object.values(levelBreakdown).sort((a, b) => b.level - a.level);

  // Calculate totals
  const conditionedSpaces = spaces.filter(s => !s.isOutdoor);
  const netSF = conditionedSpaces.reduce((sum, s) => sum + s.targetSF, 0);
  const circulationSF = Math.round(netSF * (settings?.circulationPct || 0.13));
  const totalConditionedSF = netSF + circulationSF;
  const outdoorSF = spaces.filter(s => s.isOutdoor).reduce((sum, s) => sum + s.targetSF, 0);

  return {
    settings: {
      programTier: tier,
      targetSF: settings?.targetSF || 10000,
      deltaPct,
      circulationPct: settings?.circulationPct || 0.13,
      hasBasement: settings?.hasBasement || false
    },
    spaces,
    zones: sortedZones,
    levels: sortedLevels,
    totals: {
      spaceCount: spaces.length,
      conditionedSpaceCount: conditionedSpaces.length,
      netSF,
      circulationSF,
      totalConditionedSF,
      outdoorSF,
      variance: totalConditionedSF - (settings?.targetSF || 10000),
      variancePercent: ((totalConditionedSF - (settings?.targetSF || 10000)) / (settings?.targetSF || 10000)) * 100
    }
  };
}

const fyiBridges = {
  generateFYIFromKYC,
  generateMVPFromFYI,
  transformFYIToMVPProgram,
  validateFYISelections
};

export default fyiBridges;
