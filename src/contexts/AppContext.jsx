import React, { createContext, useContext, useState, useCallback } from 'react';

// Initial KYC data structure based on v2 specification
const initialKYCData = {
  // Section 1: Client & Portfolio Context
  portfolioContext: {
    principalFirstName: '',
    principalLastName: '',
    principalEmail: '',
    principalPhone: '',
    secondaryFirstName: '',
    secondaryLastName: '',
    secondaryEmail: '',
    familyOfficeContact: '',
    familyOfficeAuthorityLevel: null, // 1-4: 1=Advisory, 2=Limited, 3=Full, 4=Fiduciary
    authorityLevelConfirmed: false,   // Gate confirmation for Level 3+
    domainDelegationNotes: '',
    currentPropertyCount: null,
    primaryResidences: [],            // Array of {country, city} for multiple properties
    thisPropertyRole: '', // Primary/Secondary/Vacation/Investment/Legacy
    investmentHorizon: '', // Forever/5yr/10yr/Generational
    exitStrategy: '', // Personal/Rental/Sale/Inheritance
    lifeStage: '', // Building family/Empty nest/Retirement/Multi-gen
    decisionTimeline: '', // Urgent/Standard/Flexible
  },

  // Section 2: Family & Household
  familyHousehold: {
    familyMembers: [], // Array of {name, age, role, specialNeeds}
    pets: '',
    petGroomingRoom: false,           // MVP: Triggers pet washing/grooming room
    petDogRun: false,                 // MVP: Triggers outdoor dog run
    staffingLevel: '',            // MVP: none/part_time/full_time/live_in
    liveInStaff: null,
    staffAccommodationRequired: false,
    multigenerationalNeeds: false,
    anticipatedFamilyChanges: '',
  },

  // Section 3: Project Parameters
  projectParameters: {
    projectCity: '',
    projectCountry: '',
    specificAddress: '',
    propertyType: '', // New build/Renovation/Addition
    targetGSF: null,
    bedroomCount: null,
    bathroomCount: null,
    floors: null,
    hasBasement: false,           // MVP: Basement level included
    sfCapConstraint: null,        // MVP: Optional SF budget cap (Discovery mode if null)
    timeline: '', // Urgent/12-18mo/18-24mo/24+mo
    complexityFactors: [], // Historic/Regulatory/Phased/Remote
    architecturalIntegration: '', // ID only/Shell coord/Full Arch
    localKnowledgeCritical: '', // Critical/Standard/Not needed
  },

  // Section 4: Budget Framework
  budgetFramework: {
    totalProjectBudget: null,
    interiorBudget: null,
    perSFExpectation: null,
    budgetFlexibility: '', // Fixed ceiling/Flexible/Investment-appropriate
    architectFeeStructure: '',        // Fixed/Percentage/Hourly/Hybrid
    interiorDesignerFeeStructure: '', // Fixed/Percentage/Hourly/Hybrid/Cost-Plus
    interiorQualityTier: '',          // Select/Reserve/Signature/Legacy
    artBudgetSeparate: false,
    artBudgetAmount: null,
  },

  // Section 5: Design Identity
  designIdentity: {
    // Style axes (1-10 scale)
    axisContemporaryTraditional: 5,
    axisMinimalLayered: 5,
    axisWarmCool: 5,
    axisOrganicGeometric: 5,
    axisRefinedEclectic: 5,
    // Architecture-specific axes
    axisArchMinimalOrnate: 5,
    axisArchRegionalInternational: 5,
    // Tags and preferences
    inspirationImages: [],
    aspirationKeywords: [],
    antiInspiration: '',
    benchmarkProperties: [],
    architectureStyleTags: [],
    interiorStyleTags: [],
    materialAffinities: [],
    materialAversions: [],
    colorPreferences: '',
    // Architecture-specific
    exteriorMaterialPreferences: [],
    massingPreference: '',
    roofFormPreference: '',
    structuralAmbition: '',
  },

  // Section 6: Lifestyle & Living
  lifestyleLiving: {
    dailyRoutinesSummary: '',
    workFromHome: '', // Never/Sometimes/Always
    wfhPeopleCount: null,
    hobbies: [],
    hobbyDetails: '',
    entertainingFrequency: '', // Rarely/Monthly/Weekly/Daily
    typicalGuestCount: '',
    entertainingStyle: '', // Formal/Casual/Both
    wellnessPriorities: [],
    lateNightMediaUse: false,     // MVP: Late-night movie watching (triggers Sound Lock)
    privacyLevelRequired: 3, // 1-5
    noiseSensitivity: 3, // 1-5
    indoorOutdoorLiving: 3, // 1-5
  },

  // Section 7: Space Requirements
  spaceRequirements: {
    mustHaveSpaces: [],
    niceToHaveSpaces: [],
    currentSpacePainPoints: '',
    viewPriorityRooms: [],
    adjacencyRequirements: '',
    storageNeeds: '', // Standard/Above average/Extensive
    accessibilityRequirements: '',
    technologyRequirements: [],
    sustainabilityPriorities: [],
    // MVP-specific amenity flags
    wantsSeparateFamilyRoom: false,   // MVP: Separate from Great Room
    wantsSecondFormalLiving: false,   // MVP: Salon (15K+ tier only)
    wantsBar: false,                  // MVP: Built-in bar (15K+ tier only)
    wantsBunkRoom: false,             // MVP: Kids bunk room (additive)
    wantsBreakfastNook: false,        // MVP: Breakfast nook in kitchen
  },

  // Section 8: Cultural Context
  culturalContext: {
    culturalBackground: '',
    regionalSensibilities: [],
    religiousObservances: '',
    entertainingCulturalNorms: '',
    crossCulturalRequirements: '',
    languagesPreferred: [],
  },

  // Section 9: Working Preferences
  workingPreferences: {
    communicationStyle: '', // Direct/Relational/Visual
    decisionCadence: '', // Weekly/Milestone/Hands-off
    collaborationStyle: '', // Directive/Consultative/Delegative
    principalInvolvementRequired: '', // Must have/Nice to have/Not important
    presentationFormat: '', // In-person/Virtual/Hybrid
    previousDesignerExperience: '',
    redFlagsToAvoid: '',
    existingIndustryConnections: '',
    celebrityVsQuietProfessional: 3, // 1-5
    // Architecture-specific
    caRequirement: '', // Full CA/Limited CA/None
    contractorRelationshipPreference: '', // Design-Bid-Build/Design-Build/CM at Risk
    earlyContractorInvolvement: false,    // ECI - contractor input from concept stage
    starchitectPreference: 3, // 1-5
  },

  // Advisor-Assessed Fields
  advisorAssessed: {
    visionFlexibilityIndex: null, // 1-5
    profileCompleteness: 0, // Auto-calculated
    dataConfidenceScore: null, // 1-5
    divergenceLog: [], // Array of divergence records
    sessionNotes: '',
  },
};

// Initial FYI data
const initialFYIData = {
  architectShortlist: [],
  idShortlist: [],
  compatibilityMatrix: {},
  selectedArchitect: null,
  selectedID: null,
};

// Create context
const AppContext = createContext(null);

// localStorage keys
const STORAGE_KEYS = {
  clientData: 'n4s_client_data',
  kycData: 'n4s_kyc_data',
  fyiData: 'n4s_fyi_data',
  activeRespondent: 'n4s_active_respondent',
  disclosureTier: 'n4s_disclosure_tier',
};

// Required fields for completion status (section-based)
const REQUIRED_FIELDS = {
  portfolioContext: ['principalFirstName', 'principalLastName', 'thisPropertyRole'],
  familyHousehold: [], // No required fields
  projectParameters: ['projectCity', 'projectCountry', 'propertyType', 'targetGSF', 'bedroomCount'],
  budgetFramework: ['totalProjectBudget'],
  designIdentity: [],
  lifestyleLiving: [],
  spaceRequirements: [],
  culturalContext: [],
  workingPreferences: [],
};

// Load from localStorage helper
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return defaultValue;
  }
};

// Save to localStorage helper
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

export const AppProvider = ({ children }) => {
  // Client data state - with localStorage persistence
  const [clientData, setClientData] = useState(() => 
    loadFromStorage(STORAGE_KEYS.clientData, {
      projectName: '',
      projectCode: '',
      createdAt: null,
      lastUpdated: null,
    })
  );

  // KYC data with multi-respondent support - with localStorage persistence
  const [kycData, setKYCData] = useState(() => 
    loadFromStorage(STORAGE_KEYS.kycData, {
      principal: { ...initialKYCData },
      secondary: { ...initialKYCData },
      advisor: { ...initialKYCData },
      consolidated: { ...initialKYCData },
    })
  );

  // Active respondent tab
  const [activeRespondent, setActiveRespondent] = useState(() =>
    loadFromStorage(STORAGE_KEYS.activeRespondent, 'principal')
  );

  // FYI data
  const [fyiData, setFYIData] = useState(() =>
    loadFromStorage(STORAGE_KEYS.fyiData, initialFYIData)
  );

  // Current KYC section
  const [currentKYCSection, setCurrentKYCSection] = useState(0);

  // Progressive disclosure tier
  const [disclosureTier, setDisclosureTier] = useState(() =>
    loadFromStorage(STORAGE_KEYS.disclosureTier, 'mvp')
  );

  // Auto-save to localStorage when data changes
  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.clientData, clientData);
  }, [clientData]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.kycData, kycData);
  }, [kycData]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.fyiData, fyiData);
  }, [fyiData]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.activeRespondent, activeRespondent);
  }, [activeRespondent]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.disclosureTier, disclosureTier);
  }, [disclosureTier]);

  // Update client data
  const updateClientData = useCallback((updates) => {
    setClientData(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
      createdAt: prev.createdAt || new Date().toISOString(),
    }));
  }, []);

  // Update KYC data for specific respondent and section
  const updateKYCData = useCallback((respondent, section, data) => {
    setKYCData(prev => ({
      ...prev,
      [respondent]: {
        ...prev[respondent],
        [section]: {
          ...prev[respondent][section],
          ...data,
        },
      },
    }));
  }, []);

  // Update FYI data
  const updateFYIData = useCallback((updates) => {
    setFYIData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Check if a section has required fields completed
  const getSectionCompletionStatus = useCallback((respondent, sectionId) => {
    const sectionData = kycData[respondent]?.[sectionId];
    if (!sectionData) return 'empty';
    
    const requiredFields = REQUIRED_FIELDS[sectionId] || [];
    
    // If no required fields, check if ANY field has data
    if (requiredFields.length === 0) {
      const values = Object.values(sectionData);
      const hasAnyData = values.some(v => 
        v !== '' && v !== null && v !== undefined && 
        !(Array.isArray(v) && v.length === 0) &&
        v !== 3 && v !== 5 // Exclude default slider values
      );
      return hasAnyData ? 'complete' : 'empty';
    }
    
    // Check required fields
    const filledRequired = requiredFields.filter(field => {
      const value = sectionData[field];
      return value !== '' && value !== null && value !== undefined &&
             !(Array.isArray(value) && value.length === 0);
    });
    
    if (filledRequired.length === 0) return 'empty';
    if (filledRequired.length === requiredFields.length) return 'complete';
    return 'partial';
  }, [kycData]);

  // Calculate overall profile completeness (percentage of required fields)
  const calculateCompleteness = useCallback((respondent = 'principal') => {
    const data = kycData[respondent];
    if (!data) return 0;
    
    let totalRequired = 0;
    let filledRequired = 0;
    
    Object.entries(REQUIRED_FIELDS).forEach(([sectionId, fields]) => {
      const sectionData = data[sectionId];
      if (!sectionData || fields.length === 0) return;
      
      totalRequired += fields.length;
      fields.forEach(field => {
        const value = sectionData[field];
        if (value !== '' && value !== null && value !== undefined &&
            !(Array.isArray(value) && value.length === 0)) {
          filledRequired++;
        }
      });
    });
    
    return totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;
  }, [kycData]);

  // Reset all data (also clears localStorage)
  const resetAllData = useCallback(() => {
    const newClientData = {
      projectName: '',
      projectCode: '',
      createdAt: null,
      lastUpdated: null,
    };
    const newKycData = {
      principal: { ...initialKYCData },
      secondary: { ...initialKYCData },
      advisor: { ...initialKYCData },
      consolidated: { ...initialKYCData },
    };
    
    setClientData(newClientData);
    setKYCData(newKycData);
    setFYIData(initialFYIData);
    setCurrentKYCSection(0);
    setActiveRespondent('principal');
    setDisclosureTier('mvp');
    
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  const value = {
    // Client data
    clientData,
    updateClientData,
    
    // KYC data
    kycData,
    updateKYCData,
    activeRespondent,
    setActiveRespondent,
    currentKYCSection,
    setCurrentKYCSection,
    
    // FYI data
    fyiData,
    updateFYIData,
    
    // Disclosure tier
    disclosureTier,
    setDisclosureTier,
    
    // Utilities
    calculateCompleteness,
    getSectionCompletionStatus,
    resetAllData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
