/**
 * N4S KYC Integration Module
 * 
 * Maps KYC (Know Your Client) responses to validation engine inputs:
 * - OperatingModel
 * - LifestylePriorities
 * - UniqueRequirements (for Briefing Builder)
 * - BridgeConfig recommendations
 * 
 * @module kyc-integration
 */

import type { 
  OperatingModel, 
  LifestylePriorities, 
  BridgeConfig,
  ProjectTypology,
  EntertainingLoad,
  StaffingLevel,
  PrivacyPosture,
  WetProgram
} from "../shared/schema";

import type {
  KYCResponse,
  EntertainingFrequency,
  EntertainingScale,
  StaffingPreference,
  PrivacyPreference,
  CookingStyle,
  WellnessInterest,
  ResidenceType
} from "../shared/kyc-schema";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Unique requirements extracted from KYC that modify baseline presets
 */
export interface UniqueRequirement {
  id: string;
  type: 'addition' | 'modification' | 'deletion' | 'adjacency';
  category: string;  // e.g., "pets", "wellness", "entertaining"
  description: string;
  spaceCode?: string;
  estimatedSF?: number;
  adjacencyNeeds?: string[];
  priority: 'required' | 'preferred' | 'optional';
  sourceQuestion: string;  // Which KYC field triggered this
}

/**
 * Complete validation context derived from KYC
 */
export interface ValidationContext {
  operatingModel: OperatingModel;
  lifestylePriorities: LifestylePriorities;
  bridgeConfig: BridgeConfig;
  uniqueRequirements: UniqueRequirement[];
  recommendedPreset: '10k' | '15k' | '20k' | 'custom';
  confidenceScore: number;  // 0-100, how complete the KYC data is
  warnings: string[];  // Any concerns or conflicts detected
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Main entry point: Transform KYC response into validation context
 */
export function mapKYCToValidation(kyc: KYCResponse): ValidationContext {
  const operatingModel = deriveOperatingModel(kyc);
  const lifestylePriorities = deriveLifestylePriorities(kyc);
  const bridgeConfig = deriveBridgeConfig(kyc, operatingModel, lifestylePriorities);
  const uniqueRequirements = extractUniqueRequirements(kyc);
  const recommendedPreset = recommendPreset(kyc);
  const confidenceScore = calculateConfidenceScore(kyc);
  const warnings = detectConflicts(kyc, operatingModel, lifestylePriorities);

  return {
    operatingModel,
    lifestylePriorities,
    bridgeConfig,
    uniqueRequirements,
    recommendedPreset,
    confidenceScore,
    warnings
  };
}

// ============================================================================
// OPERATING MODEL DERIVATION
// ============================================================================

function deriveOperatingModel(kyc: KYCResponse): OperatingModel {
  return {
    typology: mapTypology(kyc.propertyContext.residenceType),
    entertainingLoad: mapEntertainingLoad(kyc.entertainingProfile.frequency),
    staffingLevel: mapStaffingLevel(kyc.staffingProfile.preference),
    privacyPosture: mapPrivacyPosture(kyc.privacyProfile.preference),
    wetProgram: mapWetProgram(kyc.wellnessProfile)
  };
}

function mapTypology(residenceType: ResidenceType): ProjectTypology {
  const mapping: Record<ResidenceType, ProjectTypology> = {
    'primary': 'single_family',
    'secondary': 'single_family',
    'vacation': 'vacation',
    'winter': 'winter',
    'investment': 'multi_family'
  };
  return mapping[residenceType] || 'single_family';
}

function mapEntertainingLoad(frequency: EntertainingFrequency): EntertainingLoad {
  const mapping: Record<EntertainingFrequency, EntertainingLoad> = {
    'rarely': 'rare',
    'occasionally': 'quarterly',
    'regularly': 'monthly',
    'frequently': 'weekly'
  };
  return mapping[frequency] || 'monthly';
}

function mapStaffingLevel(preference: StaffingPreference): StaffingLevel {
  const mapping: Record<StaffingPreference, StaffingLevel> = {
    'self_sufficient': 'none',
    'occasional': 'none',
    'regular': 'part_time',
    'full_service': 'full_time',
    'estate': 'live_in'
  };
  return mapping[preference] || 'none';
}

function mapPrivacyPosture(preference: PrivacyPreference): PrivacyPosture {
  const mapping: Record<PrivacyPreference, PrivacyPosture> = {
    'welcoming': 'open',
    'selective': 'balanced',
    'formal': 'formal',
    'sanctuary': 'private'
  };
  return mapping[preference] || 'balanced';
}

function mapWetProgram(wellness: typeof KYCResponse.prototype.wellnessProfile): WetProgram {
  const { interest, poolDesired, spaFeatures } = wellness;
  
  if (interest === 'resort' || interest === 'dedicated') {
    return 'full_wellness';
  }
  
  if (poolDesired && spaFeatures.length > 0) {
    return 'pool_spa';
  }
  
  if (poolDesired) {
    return 'pool_only';
  }
  
  return 'none';
}

// ============================================================================
// LIFESTYLE PRIORITIES DERIVATION
// ============================================================================

function deriveLifestylePriorities(kyc: KYCResponse): LifestylePriorities {
  return {
    chefLedCooking: isChefLedCooking(kyc.kitchenProfile),
    multiFamilyHosting: isMultiFamilyHosting(kyc),
    lateNightMedia: kyc.privacyProfile.lateNightMediaUse,
    homeOffice: isSignificantHomeOffice(kyc.privacyProfile.workFromHome),
    fitnessRecovery: isSignificantFitness(kyc.wellnessProfile),
    poolEntertainment: isPoolEntertainment(kyc)
  };
}

function isChefLedCooking(kitchen: typeof KYCResponse.prototype.kitchenProfile): boolean {
  return kitchen.cookingStyle === 'serious' || 
         kitchen.cookingStyle === 'professional' ||
         kitchen.separateCateringKitchen ||
         kitchen.primaryCook === 'staff';
}

function isMultiFamilyHosting(kyc: KYCResponse): boolean {
  return kyc.privacyProfile.multiGenerationalHosting ||
         kyc.householdProfile.composition === 'multi_generational' ||
         kyc.householdProfile.composition === 'blended_family' ||
         (kyc.privacyProfile.guestStayFrequency === 'frequently' && 
          kyc.privacyProfile.typicalGuestStayDuration !== 'overnight');
}

function isSignificantHomeOffice(workLevel: typeof KYCResponse.prototype.privacyProfile.workFromHome): boolean {
  return workLevel === 'primary' || workLevel === 'executive';
}

function isSignificantFitness(wellness: typeof KYCResponse.prototype.wellnessProfile): boolean {
  return wellness.fitnessRoutine === 'regular' || 
         wellness.fitnessRoutine === 'intensive' ||
         wellness.spaFeatures.length >= 2;
}

function isPoolEntertainment(kyc: KYCResponse): boolean {
  return kyc.wellnessProfile.poolDesired && 
         kyc.entertainingProfile.outdoorEntertainingImportance >= 4;
}

// ============================================================================
// BRIDGE CONFIG DERIVATION
// ============================================================================

function deriveBridgeConfig(
  kyc: KYCResponse, 
  operatingModel: OperatingModel,
  lifestylePriorities: LifestylePriorities
): BridgeConfig {
  return {
    butlerPantry: needsButlerPantry(kyc, operatingModel),
    guestAutonomy: needsGuestAutonomy(kyc, lifestylePriorities),
    soundLock: needsSoundLock(kyc, lifestylePriorities),
    wetFeetIntercept: needsWetFeetIntercept(kyc, operatingModel),
    opsCore: needsOpsCore(kyc, operatingModel)
  };
}

function needsButlerPantry(kyc: KYCResponse, om: OperatingModel): boolean {
  // Butler pantry needed for formal entertaining or catering support
  return kyc.entertainingProfile.cateringSupport ||
         kyc.entertainingProfile.formalDiningImportance >= 4 ||
         kyc.kitchenProfile.separateCateringKitchen ||
         (om.entertainingLoad === 'weekly' && om.privacyPosture !== 'open');
}

function needsGuestAutonomy(kyc: KYCResponse, lp: LifestylePriorities): boolean {
  // Guest autonomy for extended stays or multi-generational hosting
  return lp.multiFamilyHosting ||
         kyc.privacyProfile.separateGuestAccess ||
         kyc.privacyProfile.typicalGuestStayDuration === 'extended' ||
         kyc.privacyProfile.typicalGuestStayDuration === 'week';
}

function needsSoundLock(kyc: KYCResponse, lp: LifestylePriorities): boolean {
  // Sound lock for media room with late-night use
  return lp.lateNightMedia ||
         kyc.privacyProfile.mediaRoom ||
         kyc.specialRequirements.recordingStudio ||
         kyc.specialRequirements.musicRoom;
}

function needsWetFeetIntercept(kyc: KYCResponse, om: OperatingModel): boolean {
  // Wet-feet intercept for any pool/spa program
  return om.wetProgram !== 'none' ||
         kyc.wellnessProfile.poolDesired ||
         kyc.wellnessProfile.spaFeatures.includes('hot_tub');
}

function needsOpsCore(kyc: KYCResponse, om: OperatingModel): boolean {
  // Ops core for staffed households or heavy delivery volume
  return om.staffingLevel !== 'none' ||
         kyc.staffingProfile.packageDeliveryVolume === 'heavy' ||
         kyc.staffingProfile.securityRequirements !== 'minimal';
}

// ============================================================================
// UNIQUE REQUIREMENTS EXTRACTION
// ============================================================================

function extractUniqueRequirements(kyc: KYCResponse): UniqueRequirement[] {
  const requirements: UniqueRequirement[] = [];

  // Pet-related requirements
  for (const pet of kyc.householdProfile.pets) {
    if (pet.type.toLowerCase() === 'dog' && pet.size !== 'small') {
      requirements.push({
        id: `pet-${pet.type}-wash`,
        type: 'addition',
        category: 'pets',
        description: `Dog wash station for ${pet.size || 'medium/large'} ${pet.type}`,
        spaceCode: 'DOGWASH',
        estimatedSF: 40,
        adjacencyNeeds: ['MUD', 'GAR'],
        priority: 'preferred',
        sourceQuestion: 'householdProfile.pets'
      });
      
      requirements.push({
        id: `pet-${pet.type}-run`,
        type: 'addition',
        category: 'pets',
        description: `Dog run access from mudroom`,
        priority: 'preferred',
        sourceQuestion: 'householdProfile.pets'
      });
    }
  }

  // Wine collection requirements
  if (kyc.entertainingProfile.wineCollection && kyc.entertainingProfile.wineBottleCount) {
    const bottles = kyc.entertainingProfile.wineBottleCount;
    let wineSF = 110;  // Default
    if (bottles > 500) wineSF = 200;
    if (bottles > 1000) wineSF = 350;
    if (bottles > 2000) wineSF = 500;

    requirements.push({
      id: 'wine-expansion',
      type: 'modification',
      category: 'entertaining',
      description: `Expanded wine storage for ${bottles} bottles`,
      spaceCode: 'WINE',
      estimatedSF: wineSF,
      adjacencyNeeds: ['DR', 'SCUL'],
      priority: 'required',
      sourceQuestion: 'entertainingProfile.wineBottleCount'
    });
  }

  // Art collection requirements
  if (kyc.specialRequirements.artCollection) {
    requirements.push({
      id: 'art-gallery',
      type: 'modification',
      category: 'special',
      description: 'Gallery-quality wall space and lighting for art collection',
      adjacencyNeeds: ['FOY', 'GR'],
      priority: kyc.specialRequirements.artClimateControl ? 'required' : 'preferred',
      sourceQuestion: 'specialRequirements.artCollection'
    });

    if (kyc.specialRequirements.artClimateControl) {
      requirements.push({
        id: 'art-climate',
        type: 'addition',
        category: 'special',
        description: 'Climate-controlled art storage',
        spaceCode: 'ARTSTORE',
        estimatedSF: 150,
        priority: 'required',
        sourceQuestion: 'specialRequirements.artClimateControl'
      });
    }
  }

  // Music/recording studio
  if (kyc.specialRequirements.musicRoom) {
    requirements.push({
      id: 'music-room',
      type: 'addition',
      category: 'special',
      description: 'Sound-isolated music room',
      spaceCode: 'MUSIC',
      estimatedSF: 250,
      adjacencyNeeds: ['MEDIA'],  // Near but acoustically separate
      priority: 'required',
      sourceQuestion: 'specialRequirements.musicRoom'
    });
  }

  if (kyc.specialRequirements.recordingStudio) {
    requirements.push({
      id: 'recording-studio',
      type: 'addition',
      category: 'special',
      description: 'Professional recording studio with control room',
      spaceCode: 'STUDIO',
      estimatedSF: 400,
      priority: 'required',
      sourceQuestion: 'specialRequirements.recordingStudio'
    });
  }

  // Workshop
  if (kyc.specialRequirements.workshop) {
    requirements.push({
      id: 'workshop',
      type: 'addition',
      category: 'special',
      description: 'Workshop/maker space',
      spaceCode: 'WORKSHOP',
      estimatedSF: 300,
      adjacencyNeeds: ['GAR'],
      priority: 'preferred',
      sourceQuestion: 'specialRequirements.workshop'
    });
  }

  // Car collection / expanded garage
  if (kyc.wellnessProfile.carCollection) {
    const bays = kyc.wellnessProfile.garageBays;
    if (bays > 4) {
      requirements.push({
        id: 'car-collection',
        type: 'modification',
        category: 'automotive',
        description: `Expanded garage for ${bays} vehicles with display area`,
        spaceCode: 'GAR',
        estimatedSF: bays * 250,
        priority: 'required',
        sourceQuestion: 'wellnessProfile.garageBays'
      });
    }
  }

  // Safe room
  if (kyc.specialRequirements.safe_room) {
    requirements.push({
      id: 'safe-room',
      type: 'addition',
      category: 'security',
      description: 'Secure safe room / panic room',
      spaceCode: 'SAFE',
      estimatedSF: 100,
      adjacencyNeeds: ['PRI'],  // Near primary suite
      priority: 'required',
      sourceQuestion: 'specialRequirements.safe_room'
    });
  }

  // Accessibility modifications
  if (kyc.householdProfile.mobilityConsiderations || kyc.householdProfile.elderlyResidents) {
    requirements.push({
      id: 'accessibility',
      type: 'modification',
      category: 'accessibility',
      description: 'Elevator and accessible design throughout',
      priority: 'required',
      sourceQuestion: 'householdProfile.mobilityConsiderations'
    });

    requirements.push({
      id: 'main-level-suite',
      type: 'modification',
      category: 'accessibility',
      description: 'Full suite capability on main level',
      adjacencyNeeds: ['GYM', 'WELLNESS'],
      priority: 'required',
      sourceQuestion: 'householdProfile.elderlyResidents'
    });
  }

  // Custom spaces from free-form input
  for (const custom of kyc.specialRequirements.customSpaces) {
    requirements.push({
      id: `custom-${custom.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'addition',
      category: 'custom',
      description: custom.description,
      estimatedSF: custom.estimatedSF,
      adjacencyNeeds: custom.adjacencyNeeds ? [custom.adjacencyNeeds] : undefined,
      priority: 'preferred',
      sourceQuestion: 'specialRequirements.customSpaces'
    });
  }

  // Executive office with client meetings
  if (kyc.privacyProfile.clientMeetingsAtHome) {
    requirements.push({
      id: 'executive-office',
      type: 'modification',
      category: 'work',
      description: 'Executive office with separate visitor access',
      spaceCode: 'OFF',
      estimatedSF: 300,
      adjacencyNeeds: ['FOY'],  // Near entry, separate from family
      priority: 'required',
      sourceQuestion: 'privacyProfile.clientMeetingsAtHome'
    });
  }

  return requirements;
}

// ============================================================================
// PRESET RECOMMENDATION
// ============================================================================

function recommendPreset(kyc: KYCResponse): '10k' | '15k' | '20k' | 'custom' {
  const sf = kyc.propertyContext.estimatedSF;
  const complexity = calculateComplexity(kyc);

  // Size-based recommendation with complexity adjustment
  if (sf <= 12000 && complexity <= 3) {
    return '10k';
  } else if (sf <= 17000 && complexity <= 4) {
    return '15k';
  } else if (sf <= 22000) {
    return '20k';
  } else {
    return 'custom';
  }
}

function calculateComplexity(kyc: KYCResponse): number {
  let score = 0;

  // Household complexity
  if (kyc.householdProfile.composition === 'multi_generational') score += 2;
  if (kyc.householdProfile.composition === 'blended_family') score += 1;
  if (kyc.householdProfile.elderlyResidents) score += 1;
  if (kyc.householdProfile.pets.length > 1) score += 1;

  // Entertaining complexity
  if (kyc.entertainingProfile.frequency === 'frequently') score += 2;
  if (kyc.entertainingProfile.maxEventScale === 'grand') score += 2;
  if (kyc.entertainingProfile.wineCollection) score += 1;

  // Staff complexity
  if (kyc.staffingProfile.preference === 'estate') score += 2;
  if (kyc.staffingProfile.preference === 'full_service') score += 1;

  // Wellness complexity
  if (kyc.wellnessProfile.interest === 'resort') score += 2;
  if (kyc.wellnessProfile.spaFeatures.length >= 3) score += 1;

  // Special requirements
  if (kyc.specialRequirements.artClimateControl) score += 1;
  if (kyc.specialRequirements.recordingStudio) score += 2;
  if (kyc.specialRequirements.safe_room) score += 1;
  score += kyc.specialRequirements.customSpaces.length;

  return score;
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

function calculateConfidenceScore(kyc: KYCResponse): number {
  let completed = 0;
  let total = 0;

  // Check each major section for completeness
  const sections = [
    kyc.propertyContext,
    kyc.householdProfile,
    kyc.entertainingProfile,
    kyc.staffingProfile,
    kyc.privacyProfile,
    kyc.kitchenProfile,
    kyc.wellnessProfile,
    kyc.specialRequirements
  ];

  for (const section of sections) {
    const keys = Object.keys(section);
    total += keys.length;
    for (const key of keys) {
      const value = (section as any)[key];
      if (value !== undefined && value !== null && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        completed++;
      }
    }
  }

  return Math.round((completed / total) * 100);
}

// ============================================================================
// CONFLICT DETECTION
// ============================================================================

function detectConflicts(
  kyc: KYCResponse, 
  om: OperatingModel, 
  lp: LifestylePriorities
): string[] {
  const warnings: string[] = [];

  // Privacy vs hosting conflict
  if (om.privacyPosture === 'private' && lp.multiFamilyHosting) {
    warnings.push(
      'Private posture conflicts with multi-family hosting. ' +
      'Consider redesigning guest circulation to maintain primary suite sanctuary.'
    );
  }

  // Entertaining scale vs staffing
  if (kyc.entertainingProfile.maxEventScale === 'grand' && om.staffingLevel === 'none') {
    warnings.push(
      'Grand-scale entertaining (50+ guests) without staff may create service bottlenecks. ' +
      'Consider at least part-time staff or enhanced self-service design.'
    );
  }

  // Late-night media vs bedroom acoustics
  if (lp.lateNightMedia && om.privacyPosture === 'private') {
    warnings.push(
      'Late-night media use requires sound lock vestibule to protect bedroom acoustics. ' +
      'Ensure media room is not adjacent to primary suite.'
    );
  }

  // Full wellness in cold climate
  if (om.wetProgram === 'full_wellness' && om.typology === 'winter') {
    warnings.push(
      'Full wellness program in winter residence requires enhanced MEP for humidity control. ' +
      'Budget for dedicated dehumidification systems.'
    );
  }

  // Accessibility without elevator
  if ((kyc.householdProfile.elderlyResidents || kyc.householdProfile.mobilityConsiderations) &&
      kyc.propertyContext.numberOfLevels > 1) {
    warnings.push(
      'Multi-level home with accessibility needs requires elevator. ' +
      'Also ensure main-level suite capability.'
    );
  }

  // Car collection without adequate garage
  if (kyc.wellnessProfile.carCollection && kyc.wellnessProfile.garageBays < 4) {
    warnings.push(
      'Car collection indicated but garage bays seem insufficient. ' +
      'Recommend minimum 4+ bays with climate control.'
    );
  }

  // Art collection without climate control
  if (kyc.specialRequirements.artCollection && !kyc.specialRequirements.artClimateControl) {
    warnings.push(
      'Significant art collection may require climate control for preservation. ' +
      'Consider adding climate-controlled storage.'
    );
  }

  // Executive office without separate access
  if (kyc.privacyProfile.clientMeetingsAtHome && !kyc.privacyProfile.separateGuestAccess) {
    warnings.push(
      'Client meetings at home should have separate visitor routing. ' +
      'Office should connect to foyer without crossing family spaces.'
    );
  }

  return warnings;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  mapKYCToValidation,
  deriveOperatingModel,
  deriveLifestylePriorities,
  deriveBridgeConfig,
  extractUniqueRequirements,
  recommendPreset,
  calculateConfidenceScore,
  detectConflicts
};
