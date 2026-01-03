/**
 * MVP Bridge - Transforms KYC data into KYCBriefInputs format for MVP validation
 * 
 * This module bridges the KYC (Know Your Client) data structure to the
 * MVP (Mansion Validation Program) brief generator input format.
 */

/**
 * Check if household has children (any age under 18)
 */
function hasChildrenInHousehold(familyMembers) {
  if (!familyMembers || familyMembers.length === 0) return false;
  return familyMembers.some(member => {
    const age = parseInt(member.age);
    if (!isNaN(age) && age < 18) return true;
    // Also check role-based detection
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
    // Also check role-based detection
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
  // If explicit staffingLevel is set, use it
  if (familyHousehold.staffingLevel) {
    return familyHousehold.staffingLevel;
  }
  
  // Legacy fallback: derive from liveInStaff count
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
    'daily': 'weekly', // Map daily to weekly for MVP purposes
  };
  return mapping[frequency] || 'rare';
}

/**
 * Derive wellness program tier from selected priorities
 */
function deriveWellnessProgram(priorities) {
  if (!priorities || priorities.length === 0) return 'none';
  
  // Count wet vs dry wellness elements
  const wetElements = ['pool', 'spa', 'cold-plunge'].filter(e => priorities.includes(e));
  const dryElements = ['gym', 'yoga', 'meditation', 'massage'].filter(e => priorities.includes(e));
  
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
 * Assumes 1 primary suite, rest are guest suites
 */
function calculateGuestBedrooms(bedroomCount) {
  if (!bedroomCount || bedroomCount < 1) return 3; // Default
  return Math.max(0, bedroomCount - 1); // Subtract 1 for primary
}

/**
 * Determine number of home offices needed
 * If WFH count >= 2, need a second office
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
 * @param {string} respondent - Which respondent's data to use ('principal', 'secondary', 'advisor')
 * @returns {Object} KYCBriefInputs compatible object for MVP brief generator
 */
export function transformKYCToMVPBrief(kycData, respondent = 'principal') {
  const data = kycData[respondent];
  
  if (!data) {
    console.warn(`No KYC data found for respondent: ${respondent}`);
    return null;
  }
  
  const { 
    projectParameters, 
    familyHousehold, 
    lifestyleLiving, 
    spaceRequirements 
  } = data;
  
  // Build the KYCBriefInputs object
  return {
    // Property Configuration
    sfCapConstraint: projectParameters.sfCapConstraint || null,
    hasBasement: projectParameters.hasBasement || false,
    levelsAboveGrade: projectParameters.floors || 2,
    
    // Bedroom Configuration
    totalBedroomCount: projectParameters.bedroomCount || 0,
    guestBedroomCount: calculateGuestBedrooms(projectParameters.bedroomCount),
    
    // Household Composition (derived)
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
    
    // Work - with second office trigger
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
    
    // Amenities - from space requirements
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
  
  const summary = {
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
  
  return summary;
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

export default {
  transformKYCToMVPBrief,
  getMVPBriefSummary,
  countSelectedAmenities,
};
