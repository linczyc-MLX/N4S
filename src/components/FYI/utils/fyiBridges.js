/**
 * FYI Bridge Functions
 * 
 * Handles data transformation between KYC → FYI and FYI → MVP modules.
 * Ensures consistent data flow across the N4S platform.
 */

import {
  spaceRegistry,
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
  const targetSF = kycData.projectParameters?.targetGSF || 15000;
  const hasBasement = kycData.projectParameters?.hasBasement || false;
  const bedroomCount = kycData.projectParameters?.bedroomCount || 4;
  const staffingLevel = kycData.familyHousehold?.staffingLevel || 'none';
  const entertainingFrequency = kycData.lifestyleLiving?.entertainingFrequency || 'monthly';
  
  // Determine program tier
  const programTier = determineTier(targetSF);
  
  // Build settings
  const settings = {
    targetSF,
    deltaPct: 10,
    circulationPct: getDefaultCirculation(programTier),
    lockToTarget: true,
    programTier,
    hasBasement
  };
  
  // Build initial selections
  const selections = buildInitialSelections(kycData, programTier, hasBasement);
  
  // Generate recommendations based on KYC responses
  const recommendations = generateRecommendations(kycData, selections);
  
  return {
    settings,
    selections,
    recommendations
  };
}

/**
 * Determine program tier from target SF
 */
function determineTier(targetSF) {
  if (targetSF < 12000) return '10k';
  if (targetSF < 18000) return '15k';
  return '20k';
}

/**
 * Get default circulation percentage for tier
 */
function getDefaultCirculation(tier) {
  const defaults = {
    '10k': 0.13,
    '15k': 0.14,
    '20k': 0.15
  };
  return defaults[tier] || 0.14;
}

/**
 * Get default settings
 */
function getDefaultSettings() {
  return {
    targetSF: 15000,
    deltaPct: 10,
    circulationPct: 0.14,
    lockToTarget: true,
    programTier: '15k',
    hasBasement: false
  };
}

/**
 * Build initial space selections from KYC data
 */
function buildInitialSelections(kycData, tier, hasBasement) {
  const selections = {};
  const availableSpaces = getSpacesForTier(tier);
  
  // Initialize all available spaces
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
  
  // Apply KYC must-have spaces (ensure they're included)
  const mustHaveSpaces = kycData.spaceRequirements?.mustHaveSpaces || [];
  mustHaveSpaces.forEach(legacyValue => {
    const code = legacyToCode(legacyValue);
    if (code && selections[code]) {
      selections[code].included = true;
      selections[code].kycSource = 'mustHave';
    }
  });
  
  // Apply KYC nice-to-have (mark but don't change inclusion)
  const niceToHaveSpaces = kycData.spaceRequirements?.niceToHaveSpaces || [];
  niceToHaveSpaces.forEach(legacyValue => {
    const code = legacyToCode(legacyValue);
    if (code && selections[code] && !selections[code].kycSource) {
      selections[code].kycSource = 'niceToHave';
    }
  });
  
  // Apply specific KYC flags
  
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
    if (selections['MDA']) {
      selections['MDA'].size = 'L';
      selections['MDA'].notes = 'Sound isolation required for late-night use';
      selections['MDA'].kycSource = 'lateNightMediaUse';
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

  // Staffing level affects staff spaces
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
  
  // Bedroom count affects guest suite inclusion
  const bedroomCount = kycData.projectParameters?.bedroomCount || 4;
  if (bedroomCount <= 3) {
    if (selections['GST2']) selections['GST2'].included = false;
    if (selections['GST3']) selections['GST3'].included = false;
    if (selections['GST4']) selections['GST4'].included = false;
  } else if (bedroomCount <= 4) {
    if (selections['GST3']) selections['GST3'].included = false;
    if (selections['GST4']) selections['GST4'].included = false;
  } else if (bedroomCount <= 5) {
    if (selections['GST4']) selections['GST4'].included = false;
  }
  
  // Kids count affects kids bedrooms
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
  
  // Wellness spaces based on priorities
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
  
  // Entertainment frequency affects entertainment zone
  const entertaining = kycData.lifestyleLiving?.entertainingFrequency;
  if (entertaining === 'rarely' || entertaining === 'never') {
    // Downsize entertainment spaces
    if (selections['GAM']) selections['GAM'].size = 'S';
    if (selections['BAR']) selections['BAR'].included = false;
    if (selections['GAME']) selections['GAME'].included = false;
  } else if (entertaining === 'weekly' || entertaining === 'daily') {
    // Upsize entertainment
    if (selections['GAM']) selections['GAM'].size = 'L';
    if (selections['BAR']) {
      selections['BAR'].included = true;
      selections['BAR'].size = 'L';
    }
  }
  
  // Basement eligible spaces - move to basement if hasBasement
  if (hasBasement) {
    // Consider moving these to basement
    const basementCandidates = ['THR', 'GAM', 'GAME', 'MUS', 'WIN', 'GYM', 'SPA', 'STR', 'MEP'];
    basementCandidates.forEach(code => {
      const space = getSpaceByCode(code);
      if (space?.basementEligible && selections[code]) {
        // Theater is best in basement for sound
        if (code === 'THR') {
          selections[code].level = -1;
          selections[code].notes = (selections[code].notes || '') + ' Basement location ideal for acoustics.';
        }
        // Wine cellar traditionally in basement
        if (code === 'WIN') {
          selections[code].level = -1;
        }
        // Storage and mechanical to basement
        if (code === 'STR' || code === 'MEP') {
          selections[code].level = -1;
        }
      }
    });
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
  if (kycData.lifestyleLiving?.noiseSensitivity >= 4 && selections['MDA']?.included) {
    recommendations.push({
      code: 'MDA',
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
 */
function getPresetHint(targetSF) {
  if (targetSF <= 10000) return '10k';
  if (targetSF <= 15000) return '15k';
  if (targetSF <= 20000) return '20k';
  return 'custom';
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
  
  if (variance > 20) {
    warnings.push({
      type: 'over_target',
      message: `Program is ${variance.toFixed(0)}% over target SF. Consider reducing sizes or removing spaces.`,
      value: estimatedTotal
    });
  }
  
  if (variance < -20) {
    warnings.push({
      type: 'under_target',
      message: `Program is ${Math.abs(variance).toFixed(0)}% under target SF. Consider adding spaces or increasing sizes.`,
      value: estimatedTotal
    });
  }
  
  // Check for required spaces
  const requiredCodes = ['FOY', 'KIT', 'FR', 'PRI', 'PRIBATH', 'PRICL'];
  requiredCodes.forEach(code => {
    if (!selections[code]?.included) {
      errors.push({
        type: 'missing_required',
        code,
        message: `${getSpaceByCode(code)?.name || code} is required for any residential program`
      });
    }
  });
  
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

export default {
  generateFYIFromKYC,
  generateMVPFromFYI,
  validateFYISelections
};
