/**
 * useKYCData Hook
 * 
 * Connects to the app's context and provides KYC data in a standardized format
 * for the Adjacency Personalization module.
 * 
 * Place this in: src/hooks/useKYCData.js
 */

import { useContext, useMemo } from 'react';
import AppContext from '../contexts/AppContext';

/**
 * KYC Section completion status
 */
export function useKYCCompleteness() {
  const context = useContext(AppContext);
  const { kycData, mvpConfig } = context || {};

  // Get designIdentity from kycData.principal (where taste results are stored)
  const designIdentity = kycData?.principal?.designIdentity;

  const sections = useMemo(() => {
    return {
      familyHousehold: checkFamilyHousehold(kycData),
      lifestyleLiving: checkLifestyleLiving(kycData),
      workingPreferences: checkWorkingPreferences(kycData),
      projectParameters: checkProjectParameters(mvpConfig),
      spaceRequirements: checkSpaceRequirements(mvpConfig),
      designIdentity: checkDesignIdentity(designIdentity),
      budgetFramework: checkBudgetFramework(kycData),
      culturalContext: checkCulturalContext(kycData),
      portfolioContext: checkPortfolioContext(kycData)
    };
  }, [kycData, mvpConfig, designIdentity]);
  
  const completedCount = Object.values(sections).filter(Boolean).length;
  const totalCount = Object.keys(sections).length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  // Minimum sections needed for personalization
  const requiredSections = ['familyHousehold', 'projectParameters', 'lifestyleLiving'];
  const hasMinimumData = requiredSections.every(key => sections[key]);
  
  return {
    sections,
    completedCount,
    totalCount,
    percentage,
    hasMinimumData,
    missingRequired: requiredSections.filter(key => !sections[key])
  };
}

/**
 * Main hook - provides KYC data formatted for personalization
 */
export function useKYCData() {
  const context = useContext(AppContext);
  const { kycData, mvpConfig, projectId, projectName } = context || {};
  const completeness = useKYCCompleteness();

  // Get taste profile from kycData.principal.designIdentity (new location)
  const tasteProfile = useMemo(() => {
    const results = kycData?.principal?.designIdentity?.principalTasteResults;
    if (!results || !results.selections) return null;
    return results;
  }, [kycData?.principal?.designIdentity?.principalTasteResults]);

  // Convert to KYC Response format expected by recommender
  const kycResponse = useMemo(() => {
    return convertToKYCResponse(kycData, mvpConfig, tasteProfile);
  }, [kycData, mvpConfig, tasteProfile]);

  // Determine preset from SF
  const preset = useMemo(() => {
    const sf = mvpConfig?.sfCap || 15000;
    if (sf <= 12000) return '10k';
    if (sf <= 17000) return '15k';
    return '20k';
  }, [mvpConfig?.sfCap]);

  return {
    kycResponse,
    preset,
    baseSF: mvpConfig?.sfCap || 15000,
    projectId,
    projectName,
    completeness,
    rawData: {
      kycData,
      mvpConfig,
      tasteProfile
    }
  };
}

/**
 * Convert app data to KYC Response format
 */
function convertToKYCResponse(kycData, mvpConfig, tasteProfile) {
  // Safely access nested data with defaults
  const kyc = kycData || {};
  const mvp = mvpConfig || {};
  const taste = tasteProfile || {};
  
  return {
    propertyContext: {
      residenceType: mvp.residenceType || 'primary',
      estimatedSF: mvp.sfCap || 15000,
      numberOfLevels: mvp.levels || 2,
      hasBasement: mvp.basement || false,
      lotSize: mvp.lotSize || null,
      climate: mvp.climate || null,
      viewOrientation: mvp.viewOrientation || null
    },
    
    householdProfile: {
      composition: deriveComposition(kyc, mvp),
      primaryResidents: mvp.primaryResidents || kyc.primaryResidents || 2,
      childrenCount: mvp.children || kyc.childrenCount || 0,
      childrenAges: kyc.childrenAges || [],
      pets: derivePets(kyc, mvp),
      elderlyResidents: kyc.elderlyResidents || mvp.elderlyResidents || false,
      mobilityConsiderations: kyc.mobilityNeeds || mvp.mobilityNeeds || false,
      frequentOvernightGuests: kyc.frequentGuests || mvp.frequentGuests || false
    },
    
    entertainingProfile: {
      frequency: mapFrequency(kyc.entertainingFrequency || mvp.entertaining),
      typicalScale: kyc.typicalEventScale || mvp.typicalEventScale || 'moderate',
      maxEventScale: kyc.maxEventScale || mvp.maxEventScale || 'large',
      formalDiningImportance: kyc.formalDining || mvp.formalDining || 3,
      outdoorEntertainingImportance: kyc.outdoorEntertaining || 3,
      cateringSupport: kyc.cateringSupport || mvp.cateringSupport || false,
      wineCollection: kyc.wineCollection || mvp.wineCollection || false,
      wineBottleCount: kyc.wineBottles || mvp.wineBottles || 0
    },
    
    staffingProfile: {
      preference: mapStaffing(kyc.staffing || mvp.staffing),
      currentStaff: kyc.currentStaff || [],
      plannedStaff: kyc.plannedStaff || [],
      staffQuarters: kyc.staffQuarters || mvp.staffQuarters || false,
      securityRequirements: kyc.security || mvp.security || 'minimal'
    },
    
    privacyProfile: {
      preference: mapPrivacy(kyc.privacy || mvp.privacy),
      separateGuestAccess: kyc.separateGuestAccess || mvp.separateGuestAccess || false,
      guestStayFrequency: kyc.guestFrequency || mvp.guestFrequency || 'occasionally',
      typicalGuestStayDuration: kyc.guestDuration || mvp.guestDuration || 'weekend',
      multiGenerationalHosting: kyc.multiGen || mvp.multiGen || false,
      workFromHome: mapWorkFromHome(kyc.workFromHome || mvp.workFromHome),
      clientMeetingsAtHome: kyc.clientMeetings || mvp.clientMeetings || false,
      lateNightMediaUse: kyc.lateNightMedia || mvp.lateNightMedia || false
    },
    
    kitchenProfile: {
      cookingStyle: mapCooking(kyc.cooking || mvp.cooking),
      primaryCook: kyc.primaryCook || mvp.primaryCook || 'family',
      showKitchenImportance: kyc.showKitchen || mvp.showKitchen || 4,
      separateCateringKitchen: kyc.cateringKitchen || mvp.cateringKitchen || false,
      professionalAppliances: kyc.proAppliances || mvp.proAppliances || false,
      multipleRefrigeration: kyc.multipleRefrig || mvp.multipleRefrig || false
    },
    
    wellnessProfile: {
      interest: deriveWellnessInterest(kyc, mvp),
      poolDesired: kyc.pool || mvp.pool || false,
      poolType: kyc.poolType || mvp.poolType || 'lap',
      spaFeatures: deriveSpaFeatures(kyc, mvp),
      fitnessRoutine: kyc.fitness || mvp.fitness || 'occasional',
      garageBays: kyc.garageBays || mvp.garageBays || 3,
      evCharging: kyc.evCharging || mvp.evCharging || false
    },
    
    specialRequirements: {
      artCollection: kyc.artCollection || mvp.artCollection || false,
      artClimateControl: kyc.artClimate || mvp.artClimate || false,
      safe_room: kyc.safeRoom || mvp.safeRoom || false,
      elevator: kyc.elevator || mvp.elevator || false,
      musicRoom: kyc.musicRoom || mvp.musicRoom || false,
      recordingStudio: kyc.recordingStudio || mvp.recordingStudio || false,
      workshop: kyc.workshop || mvp.workshop || false,
      customSpaces: kyc.customSpaces || mvp.customSpaces || []
    },
    
    budgetProfile: {
      constructionBudgetRange: kyc.budget || mvp.budget || 'premium',
      ffeBudgetRange: kyc.ffeBudget || null
    },
    
    // Include taste profile data
    tasteProfile: taste
  };
}

// ============================================================================
// SECTION COMPLETENESS CHECKERS
// ============================================================================

function checkFamilyHousehold(kycData) {
  if (!kycData?.principal?.familyHousehold) return false;
  const section = kycData.principal.familyHousehold;
  return !!(section.primaryResidents || section.childrenCount !== undefined);
}

function checkLifestyleLiving(kycData) {
  if (!kycData?.principal?.lifestyleLiving) return false;
  const section = kycData.principal.lifestyleLiving;
  return !!(section.entertainingFrequency || section.privacy);
}

function checkWorkingPreferences(kycData) {
  if (!kycData?.principal?.workingPreferences) return false;
  const section = kycData.principal.workingPreferences;
  return !!(section.workFromHome);
}

function checkProjectParameters(mvp) {
  if (!mvp) return false;
  return !!(mvp.sfCap && mvp.levels);
}

function checkSpaceRequirements(mvp) {
  if (!mvp) return false;
  return !!(mvp.bedrooms || mvp.garageBays);
}

function checkDesignIdentity(designIdentity) {
  if (!designIdentity) return false;
  // Check for taste exploration results in the new kycData structure
  const principal = designIdentity.principalTasteResults;
  if (principal && principal.completedAt) return true;
  // Fallback: check for old taste profile format
  return !!(designIdentity.styleEra || designIdentity.formality || designIdentity.warmth);
}

function checkBudgetFramework(kycData) {
  if (!kycData?.principal?.budgetFramework) return false;
  const section = kycData.principal.budgetFramework;
  return !!(section.budget);
}

function checkCulturalContext(kycData) {
  // Optional section
  return true;
}

function checkPortfolioContext(kycData) {
  // Optional section
  return true;
}

// ============================================================================
// DATA MAPPING HELPERS
// ============================================================================

function deriveComposition(kyc, mvp) {
  if (kyc.multiGen || mvp.multiGen) return 'multi_generational';
  if (kyc.blendedFamily) return 'blended_family';
  const children = mvp.children || kyc.childrenCount || 0;
  if (children > 0) return 'family_with_children';
  const residents = mvp.primaryResidents || kyc.primaryResidents || 2;
  if (residents === 1) return 'single';
  return 'couple';
}

function derivePets(kyc, mvp) {
  const pets = [];
  const dogs = mvp.dogs || kyc.dogs || 0;
  const cats = mvp.cats || kyc.cats || 0;
  
  if (dogs > 0) {
    pets.push({ 
      type: 'dog', 
      count: dogs, 
      size: mvp.dogSize || kyc.dogSize || 'medium' 
    });
  }
  if (cats > 0) {
    pets.push({ type: 'cat', count: cats });
  }
  
  // Handle other pets from KYC
  if (kyc.otherPets) {
    pets.push(...kyc.otherPets);
  }
  
  return pets;
}

function deriveWellnessInterest(kyc, mvp) {
  const hasPool = kyc.pool || mvp.pool;
  const hasSpa = kyc.spa || mvp.spa;
  const hasGym = kyc.gym || mvp.gym;
  
  if (hasSpa && hasGym && hasPool) return 'resort';
  if (hasSpa || hasGym) return 'dedicated';
  if (hasPool) return 'casual';
  return 'basic';
}

function deriveSpaFeatures(kyc, mvp) {
  const features = [];
  if (kyc.sauna || mvp.sauna) features.push('sauna');
  if (kyc.steam || mvp.steam) features.push('steam');
  if (kyc.hotTub || mvp.hotTub) features.push('hot_tub');
  if (kyc.coldPlunge || mvp.coldPlunge) features.push('cold_plunge');
  if (kyc.massage || mvp.massage) features.push('massage_room');
  return features;
}

function mapFrequency(value) {
  const map = {
    'never': 'rarely',
    'rarely': 'rarely',
    'occasionally': 'occasionally',
    'monthly': 'regularly',
    'weekly': 'frequently',
    'frequently': 'frequently'
  };
  return map[value] || 'occasionally';
}

function mapStaffing(value) {
  const map = {
    'none': 'self_sufficient',
    'occasional': 'occasional',
    'part-time': 'regular',
    'regular': 'regular',
    'full-time': 'full_service',
    'full_service': 'full_service',
    'estate': 'estate'
  };
  return map[value] || 'self_sufficient';
}

function mapPrivacy(value) {
  const map = {
    'open': 'welcoming',
    'welcoming': 'welcoming',
    'balanced': 'selective',
    'selective': 'selective',
    'formal': 'formal',
    'private': 'sanctuary',
    'sanctuary': 'sanctuary'
  };
  return map[value] || 'selective';
}

function mapWorkFromHome(value) {
  const map = {
    'no': 'no',
    'none': 'no',
    'occasional': 'occasional',
    'regular': 'regular',
    'primary': 'primary',
    'executive': 'executive',
    'full-time': 'primary'
  };
  return map[value] || 'occasional';
}

function mapCooking(value) {
  const map = {
    'none': 'minimal',
    'minimal': 'minimal',
    'basic': 'casual',
    'casual': 'casual',
    'enthusiast': 'enthusiast',
    'serious': 'serious',
    'professional': 'professional'
  };
  return map[value] || 'enthusiast';
}

export default useKYCData;
