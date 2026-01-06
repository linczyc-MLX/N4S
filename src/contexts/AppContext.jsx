import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Generate unique project ID
const generateProjectId = () => {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

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
    architectCelebrityPreference: 3,      // 1-5: 1=Starchitect, 5=Quiet Professional
    interiorDesignerCelebrityPreference: 3, // 1-5: 1=Celebrity, 5=Quiet Professional
    // Architecture-specific
    caRequirement: '', // Full CA/Limited CA/None
    contractorRelationshipPreference: '', // Design-Bid-Build/Design-Build/CM at Risk
    earlyContractorInvolvement: false,    // ECI - contractor input from concept stage
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
  // Brief data from FYI module
  brief: null,
  completedAt: null,

  // Settings used to generate the brief
  settings: {
    targetSF: 15000,
    deltaPct: 10,
    circulationPct: 0.14,
    lockToTarget: true,
    programTier: '15k',
    hasBasement: false
  },

  // Space selections
  selections: {},

  // Legacy fields (preserved for backward compatibility)
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
  projects: 'n4s_projects',           // List of all projects
  activeProjectId: 'n4s_active_project', // Current active project ID
  disclosureTier: 'n4s_disclosure_tier',
};

// Get project-specific storage key
const getProjectKey = (projectId) => `n4s_project_${projectId}`;

// Sections available to Secondary respondent
const SECONDARY_SECTIONS = ['designIdentity', 'lifestyleLiving', 'spaceRequirements'];

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

// Default empty project data
const getEmptyProjectData = () => ({
  clientData: {
    projectName: '',
    projectCode: '',
    createdAt: null,
    lastUpdated: null,
  },
  kycData: {
    principal: { ...initialKYCData },
    secondary: { ...initialKYCData },
    advisor: { ...initialKYCData },
    consolidated: { ...initialKYCData },
  },
  fyiData: { ...initialFYIData },
  activeRespondent: 'principal',
});

export const AppProvider = ({ children }) => {
  // Projects list
  const [projects, setProjects] = useState(() => 
    loadFromStorage(STORAGE_KEYS.projects, [])
  );
  
  // Active project ID
  const [activeProjectId, setActiveProjectId] = useState(() => 
    loadFromStorage(STORAGE_KEYS.activeProjectId, null)
  );

  // Load active project data
  const loadProjectData = useCallback((projectId) => {
    if (!projectId) return getEmptyProjectData();
    return loadFromStorage(getProjectKey(projectId), getEmptyProjectData());
  }, []);

  // Initialize project data from active project
  const [projectData, setProjectData] = useState(() => {
    const activeId = loadFromStorage(STORAGE_KEYS.activeProjectId, null);
    return loadProjectData(activeId);
  });

  // Destructure project data for easier access
  const { clientData, kycData, fyiData, activeRespondent: storedRespondent } = projectData;
  
  // Active respondent
  const [activeRespondent, setActiveRespondent] = useState(storedRespondent || 'principal');

  // Current KYC section
  const [currentKYCSection, setCurrentKYCSection] = useState(0);

  // Progressive disclosure tier (global, not per-project)
  const [disclosureTier, setDisclosureTier] = useState(() =>
    loadFromStorage(STORAGE_KEYS.disclosureTier, 'mvp')
  );

  // Save projects list when it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.projects, projects);
  }, [projects]);

  // Save active project ID when it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.activeProjectId, activeProjectId);
  }, [activeProjectId]);

  // Save disclosure tier when it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.disclosureTier, disclosureTier);
  }, [disclosureTier]);

  // Save project data when it changes
  useEffect(() => {
    if (activeProjectId) {
      saveToStorage(getProjectKey(activeProjectId), {
        ...projectData,
        activeRespondent,
      });
      
      // Update project metadata in projects list
      setProjects(prev => prev.map(p => 
        p.id === activeProjectId 
          ? { ...p, name: projectData.clientData.projectName, lastUpdated: new Date().toISOString() }
          : p
      ));
    }
  }, [projectData, activeRespondent, activeProjectId]);

  // Create new project
  const createProject = useCallback((name = '') => {
    const newId = generateProjectId();
    const now = new Date().toISOString();
    
    const newProject = {
      id: newId,
      name: name || 'Untitled Project',
      createdAt: now,
      lastUpdated: now,
    };
    
    // Add to projects list
    setProjects(prev => [...prev, newProject]);
    
    // Initialize project data
    const newProjectData = {
      ...getEmptyProjectData(),
      clientData: {
        projectName: name || 'Untitled Project',
        projectCode: newId.substring(5, 10).toUpperCase(),
        createdAt: now,
        lastUpdated: now,
      },
    };
    
    saveToStorage(getProjectKey(newId), newProjectData);
    
    // Switch to new project
    setActiveProjectId(newId);
    setProjectData(newProjectData);
    setActiveRespondent('principal');
    setCurrentKYCSection(0);
    
    return newId;
  }, []);

  // Switch to existing project
  const switchProject = useCallback((projectId) => {
    if (!projectId || projectId === activeProjectId) return;
    
    const data = loadProjectData(projectId);
    setActiveProjectId(projectId);
    setProjectData(data);
    setActiveRespondent(data.activeRespondent || 'principal');
    setCurrentKYCSection(0);
  }, [activeProjectId, loadProjectData]);

  // Delete project
  const deleteProject = useCallback((projectId) => {
    // Remove from projects list
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    // Remove from localStorage
    localStorage.removeItem(getProjectKey(projectId));
    
    // If deleting active project, switch to another or create new
    if (projectId === activeProjectId) {
      const remaining = projects.filter(p => p.id !== projectId);
      if (remaining.length > 0) {
        switchProject(remaining[0].id);
      } else {
        setActiveProjectId(null);
        setProjectData(getEmptyProjectData());
      }
    }
  }, [activeProjectId, projects, switchProject]);

  // Update client data
  const updateClientData = useCallback((updates) => {
    setProjectData(prev => ({
      ...prev,
      clientData: {
        ...prev.clientData,
        ...updates,
        lastUpdated: new Date().toISOString(),
        createdAt: prev.clientData.createdAt || new Date().toISOString(),
      },
    }));
  }, []);

  // Update KYC data for specific respondent and section
  const updateKYCData = useCallback((respondent, section, data) => {
    setProjectData(prev => ({
      ...prev,
      kycData: {
        ...prev.kycData,
        [respondent]: {
          ...prev.kycData[respondent],
          [section]: {
            ...prev.kycData[respondent][section],
            ...data,
          },
        },
      },
    }));
  }, []);

  // Update FYI data
  const updateFYIData = useCallback((updates) => {
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        ...updates,
      },
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
    
    const sectionsToCount = respondent === 'secondary' ? SECONDARY_SECTIONS : Object.keys(REQUIRED_FIELDS);
    sectionsToCount.forEach(sectionKey => {
      const fields = REQUIRED_FIELDS[sectionKey] || [];
      const sectionData = data[sectionKey];
      if (!sectionData) return;

      if (fields.length > 0) {
        // Section has required fields - count those
        totalRequired += fields.length;
        fields.forEach(field => {
          const value = sectionData[field];
          if (value !== '' && value !== null && value !== undefined &&
              !(Array.isArray(value) && value.length === 0)) {
            filledRequired++;
          }
        });
      } else {
        // Section has NO required fields - check if ANY meaningful data exists
        const values = Object.values(sectionData);
        const hasData = values.some(v =>
          v !== '' && v !== null && v !== undefined &&
          !(Array.isArray(v) && v.length === 0) &&
          v !== 3 && v !== 5 && v !== 'moderate' // Exclude default values
        );
        totalRequired += 1;
        if (hasData) filledRequired += 1;
      }
    });
    
    return totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;
  }, [kycData]);

  // Reset current project data
  const resetCurrentProject = useCallback(() => {
    if (!activeProjectId) return;
    
    const emptyData = getEmptyProjectData();
    setProjectData(emptyData);
    setActiveRespondent('principal');
    setCurrentKYCSection(0);
  }, [activeProjectId]);

  // Reset all data (clears all projects)
  const resetAllData = useCallback(() => {
    // Clear all project data from localStorage
    projects.forEach(p => {
      localStorage.removeItem(getProjectKey(p.id));
    });
    
    // Clear project list and active project
    setProjects([]);
    setActiveProjectId(null);
    setProjectData(getEmptyProjectData());
    setCurrentKYCSection(0);
    setActiveRespondent('principal');
    setDisclosureTier('mvp');
    
    // Clear storage keys
    localStorage.removeItem(STORAGE_KEYS.projects);
    localStorage.removeItem(STORAGE_KEYS.activeProjectId);
  }, [projects]);

  const value = {
    // Project management
    projects,
    activeProjectId,
    createProject,
    switchProject,
    deleteProject,
    
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
    resetCurrentProject,
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
