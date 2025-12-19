import React, { createContext, useContext, useState, useCallback } from 'react';

// Initial KYC data structure based on v2 specification
const initialKYCData = {
  // Section 1: Client & Portfolio Context
  portfolioContext: {
    principalName: '',
    principalEmail: '',
    principalPhone: '',
    secondaryName: '',
    secondaryEmail: '',
    familyOfficeContact: '',
    familyOfficeAuthorityLevel: null, // 1-4
    domainDelegationNotes: '',
    currentPropertyCount: null,
    primaryResidenceLocation: '',
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
    feeStructurePreference: '', // Fixed/Percentage/Hourly/Hybrid
    customVsSourcedRatio: 3, // 1-5 scale
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

export const AppProvider = ({ children }) => {
  // Client data state
  const [clientData, setClientData] = useState({
    principalName: '',
    projectName: '',
    createdAt: null,
    lastUpdated: null,
  });

  // KYC data with multi-respondent support
  const [kycData, setKYCData] = useState({
    principal: { ...initialKYCData },
    secondary: { ...initialKYCData },
    advisor: { ...initialKYCData },
    consolidated: { ...initialKYCData },
  });

  // Active respondent tab
  const [activeRespondent, setActiveRespondent] = useState('principal');

  // FYI data
  const [fyiData, setFYIData] = useState(initialFYIData);

  // Current KYC section
  const [currentKYCSection, setCurrentKYCSection] = useState(0);

  // Progressive disclosure tier
  const [disclosureTier, setDisclosureTier] = useState('mvp'); // mvp, enhanced, fyi-extended

  // Update client data
  const updateClientData = useCallback((updates) => {
    setClientData(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
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

  // Calculate profile completeness
  const calculateCompleteness = useCallback((respondent = 'principal') => {
    const data = kycData[respondent];
    let totalFields = 0;
    let filledFields = 0;

    const countFields = (obj) => {
      Object.values(obj).forEach(value => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          countFields(value);
        } else {
          totalFields++;
          if (value !== '' && value !== null && value !== undefined && 
              !(Array.isArray(value) && value.length === 0)) {
            filledFields++;
          }
        }
      });
    };

    countFields(data);
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }, [kycData]);

  // Reset all data
  const resetAllData = useCallback(() => {
    setClientData({
      principalName: '',
      projectName: '',
      createdAt: null,
      lastUpdated: null,
    });
    setKYCData({
      principal: { ...initialKYCData },
      secondary: { ...initialKYCData },
      advisor: { ...initialKYCData },
      consolidated: { ...initialKYCData },
    });
    setFYIData(initialFYIData);
    setCurrentKYCSection(0);
    setActiveRespondent('principal');
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
