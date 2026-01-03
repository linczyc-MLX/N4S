/**
 * AdjacencyPersonalizationView
 * 
 * JSX wrapper that connects the MVP module to the TypeScript Adjacency Personalization.
 * Converts app context data to KYC format and handles the personalization flow.
 */

import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';

// Import from mansion-program TypeScript module
import { 
  AdjacencyPersonalization,
  getPreset
} from '../../mansion-program';

/**
 * Convert app's KYC/MVP data format to the kyc-schema format
 */
function convertToKYCResponse(kycData, mvpData, tasteProfile) {
  return {
    propertyContext: {
      residenceType: mvpData?.residenceType || 'primary',
      estimatedSF: mvpData?.sfCap || 15000,
      numberOfLevels: mvpData?.levels || 2,
      hasBasement: mvpData?.basement || false,
      lotSize: null,
      climate: null,
      viewOrientation: null
    },
    householdProfile: {
      composition: mapComposition(mvpData),
      primaryResidents: mvpData?.primaryResidents || 2,
      childrenCount: mvpData?.children || 0,
      childrenAges: [],
      pets: mapPets(mvpData),
      elderlyResidents: mvpData?.elderlyResidents || false,
      mobilityConsiderations: mvpData?.mobilityNeeds || false,
      frequentOvernightGuests: mvpData?.frequentGuests || false
    },
    entertainingProfile: {
      frequency: mapEntertainingFrequency(mvpData?.entertaining),
      typicalScale: mvpData?.typicalEventScale || 'moderate',
      maxEventScale: mvpData?.maxEventScale || 'large',
      formalDiningImportance: mvpData?.formalDining || 3,
      outdoorEntertainingImportance: mvpData?.outdoorEntertaining || 3,
      cateringSupport: mvpData?.cateringSupport || false,
      wineCollection: mvpData?.wineCollection || false,
      wineBottleCount: mvpData?.wineBottles || 0
    },
    staffingProfile: {
      preference: mapStaffingPreference(mvpData?.staffing),
      currentStaff: [],
      plannedStaff: [],
      staffQuarters: mvpData?.staffQuarters || false,
      securityRequirements: mvpData?.security || 'minimal'
    },
    privacyProfile: {
      preference: mapPrivacyPreference(mvpData?.privacy),
      separateGuestAccess: mvpData?.separateGuestAccess || false,
      guestStayFrequency: mvpData?.guestFrequency || 'occasionally',
      typicalGuestStayDuration: mvpData?.guestDuration || 'weekend',
      multiGenerationalHosting: mvpData?.multiGen || false,
      workFromHome: mapWorkFromHome(mvpData?.workFromHome),
      clientMeetingsAtHome: mvpData?.clientMeetings || false,
      lateNightMediaUse: mvpData?.lateNightMedia || false
    },
    kitchenProfile: {
      cookingStyle: mapCookingStyle(mvpData?.cooking),
      primaryCook: mvpData?.primaryCook || 'family',
      showKitchenImportance: mvpData?.showKitchen || 4,
      separateCateringKitchen: mvpData?.cateringKitchen || false,
      professionalAppliances: mvpData?.proAppliances || false,
      multipleRefrigeration: mvpData?.multipleRefrig || false
    },
    wellnessProfile: {
      interest: mapWellnessInterest(mvpData),
      poolDesired: mvpData?.pool || false,
      poolType: mvpData?.poolType || 'lap',
      spaFeatures: mapSpaFeatures(mvpData),
      fitnessRoutine: mvpData?.fitness || 'occasional',
      garageBays: mvpData?.garageBays || 3,
      evCharging: mvpData?.evCharging || false
    },
    specialRequirements: {
      artCollection: mvpData?.artCollection || false,
      artClimateControl: mvpData?.artClimate || false,
      safe_room: mvpData?.safeRoom || false,
      elevator: mvpData?.elevator || false,
      musicRoom: mvpData?.musicRoom || false,
      recordingStudio: mvpData?.recordingStudio || false,
      workshop: mvpData?.workshop || false,
      customSpaces: mvpData?.customSpaces || []
    },
    budgetProfile: {
      constructionBudgetRange: mvpData?.budget || 'premium',
      ffeBudgetRange: mvpData?.ffeBudget || null
    }
  };
}

// Helper mappers
function mapComposition(mvpData) {
  if (mvpData?.multiGen) return 'multi_generational';
  if (mvpData?.children > 0) return 'family_with_children';
  return 'couple';
}

function mapPets(mvpData) {
  const pets = [];
  if (mvpData?.dogs) {
    pets.push({ type: 'dog', count: mvpData.dogs, size: mvpData.dogSize || 'medium' });
  }
  if (mvpData?.cats) {
    pets.push({ type: 'cat', count: mvpData.cats });
  }
  return pets;
}

function mapEntertainingFrequency(value) {
  const map = {
    'rarely': 'rarely',
    'occasionally': 'occasionally', 
    'monthly': 'regularly',
    'weekly': 'frequently',
    'frequently': 'frequently'
  };
  return map[value] || 'occasionally';
}

function mapStaffingPreference(value) {
  const map = {
    'none': 'self_sufficient',
    'occasional': 'occasional',
    'part-time': 'regular',
    'full-time': 'full_service',
    'estate': 'estate'
  };
  return map[value] || 'self_sufficient';
}

function mapPrivacyPreference(value) {
  const map = {
    'open': 'welcoming',
    'balanced': 'selective',
    'formal': 'formal',
    'private': 'sanctuary'
  };
  return map[value] || 'selective';
}

function mapWorkFromHome(value) {
  const map = {
    'no': 'no',
    'occasional': 'occasional',
    'regular': 'regular',
    'primary': 'primary',
    'executive': 'executive'
  };
  return map[value] || 'occasional';
}

function mapCookingStyle(value) {
  const map = {
    'minimal': 'minimal',
    'basic': 'casual',
    'enthusiast': 'enthusiast',
    'serious': 'serious',
    'professional': 'professional'
  };
  return map[value] || 'enthusiast';
}

function mapWellnessInterest(mvpData) {
  if (mvpData?.spa && mvpData?.gym && mvpData?.pool) return 'resort';
  if (mvpData?.spa || mvpData?.gym) return 'dedicated';
  if (mvpData?.pool) return 'casual';
  return 'basic';
}

function mapSpaFeatures(mvpData) {
  const features = [];
  if (mvpData?.sauna) features.push('sauna');
  if (mvpData?.steam) features.push('steam');
  if (mvpData?.hotTub) features.push('hot_tub');
  if (mvpData?.coldPlunge) features.push('cold_plunge');
  if (mvpData?.massage) features.push('massage_room');
  return features;
}

/**
 * Determine preset from SF cap
 */
function determinePreset(sfCap) {
  if (sfCap <= 12000) return '10k';
  if (sfCap <= 17000) return '15k';
  return '20k';
}

/**
 * AdjacencyPersonalizationView Component
 */
export default function AdjacencyPersonalizationView({ 
  kycData, 
  mvpData, 
  tasteProfile,
  projectId,
  projectName,
  onBack,
  onComplete,
  onViewDiagram
}) {
  // Convert app data to KYC response format
  const kycResponse = useMemo(() => 
    convertToKYCResponse(kycData, mvpData, tasteProfile),
    [kycData, mvpData, tasteProfile]
  );
  
  // Determine preset based on SF
  const preset = useMemo(() => 
    determinePreset(mvpData?.sfCap || 15000),
    [mvpData?.sfCap]
  );
  
  // Get base preset data
  const presetData = useMemo(() => 
    getPreset(preset),
    [preset]
  );
  
  const baseSF = presetData?.targetSF || 15000;
  const baseMatrix = presetData?.adjacencyMatrix || [];
  
  // Handle completion
  const handleComplete = (result) => {
    console.log('Personalization complete:', result);
    if (onComplete) {
      onComplete(result);
    }
  };
  
  // If preset data failed, show error
  if (!presetData) {
    return (
      <div className="p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Unable to load Personalization</h3>
          <p className="text-red-600 text-sm mt-1">
            Please ensure property configuration is complete.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <AdjacencyPersonalization
      kyc={kycResponse}
      preset={preset}
      baseSF={baseSF}
      baseMatrix={baseMatrix}
      onComplete={handleComplete}
      onCancel={onBack}
      onViewDiagram={onViewDiagram}
    />
  );
}
