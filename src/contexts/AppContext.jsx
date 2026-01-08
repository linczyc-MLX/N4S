import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

// Generate unique project ID
const generateProjectId = () => {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Initial KYC data structure
const initialKYCData = {
  portfolioContext: {
    principalFirstName: '',
    principalLastName: '',
    principalEmail: '',
    principalPhone: '',
    secondaryFirstName: '',
    secondaryLastName: '',
    secondaryEmail: '',
    familyOfficeContact: '',
    familyOfficeAuthorityLevel: null,
    authorityLevelConfirmed: false,
    domainDelegationNotes: '',
    currentPropertyCount: null,
    primaryResidences: [],
    thisPropertyRole: '',
    investmentHorizon: '',
    exitStrategy: '',
    lifeStage: '',
    decisionTimeline: '',
  },
  familyHousehold: {
    familyMembers: [],
    pets: '',
    petGroomingRoom: false,
    petDogRun: false,
    staffingLevel: '',
    liveInStaff: null,
    staffAccommodationRequired: false,
    multigenerationalNeeds: false,
    anticipatedFamilyChanges: '',
  },
  projectParameters: {
    projectCity: '',
    projectCountry: '',
    specificAddress: '',
    propertyType: '',
    targetGSF: null,
    bedroomCount: null,
    bathroomCount: null,
    floors: null,
    hasBasement: false,
    sfCapConstraint: null,
    timeline: '',
    complexityFactors: [],
    architecturalIntegration: '',
    localKnowledgeCritical: '',
  },
  budgetFramework: {
    totalProjectBudget: null,
    interiorBudget: null,
    perSFExpectation: null,
    budgetFlexibility: '',
    architectFeeStructure: '',
    interiorDesignerFeeStructure: '',
    interiorQualityTier: '',
    artBudgetSeparate: false,
    artBudgetAmount: null,
  },
  designIdentity: {
    axisContemporaryTraditional: 5,
    axisMinimalLayered: 5,
    axisWarmCool: 5,
    axisOrganicGeometric: 5,
    axisRefinedEclectic: 5,
    axisArchMinimalOrnate: 5,
    axisArchRegionalInternational: 5,
    inspirationImages: [],
    aspirationKeywords: [],
    antiInspiration: '',
    benchmarkProperties: [],
    architectureStyleTags: [],
    interiorStyleTags: [],
    materialAffinities: [],
    materialAversions: [],
    colorPreferences: '',
    exteriorMaterialPreferences: [],
    massingPreference: '',
    roofFormPreference: '',
    structuralAmbition: '',
  },
  lifestyleLiving: {
    dailyRoutinesSummary: '',
    workFromHome: '',
    wfhPeopleCount: null,
    hobbies: [],
    hobbyDetails: '',
    entertainingFrequency: '',
    typicalGuestCount: '',
    entertainingStyle: '',
    wellnessPriorities: [],
    lateNightMediaUse: false,
    privacyLevelRequired: 3,
    noiseSensitivity: 3,
    indoorOutdoorLiving: 3,
  },
  spaceRequirements: {
    mustHaveSpaces: [],
    niceToHaveSpaces: [],
    currentSpacePainPoints: '',
    viewPriorityRooms: [],
    adjacencyRequirements: '',
    storageNeeds: '',
    accessibilityRequirements: '',
    technologyRequirements: [],
    sustainabilityPriorities: [],
    wantsSeparateFamilyRoom: false,
    wantsSecondFormalLiving: false,
    wantsBar: false,
    wantsBunkRoom: false,
    wantsBreakfastNook: false,
  },
  culturalContext: {
    culturalBackground: '',
    regionalSensibilities: [],
    religiousObservances: '',
    entertainingCulturalNorms: '',
    crossCulturalRequirements: '',
    languagesPreferred: [],
  },
  workingPreferences: {
    communicationStyle: '',
    decisionCadence: '',
    collaborationStyle: '',
    principalInvolvementRequired: '',
    presentationFormat: '',
    previousDesignerExperience: '',
    redFlagsToAvoid: '',
    existingIndustryConnections: '',
    architectCelebrityPreference: 3,
    interiorDesignerCelebrityPreference: 3,
    caRequirement: '',
    contractorRelationshipPreference: '',
    earlyContractorInvolvement: false,
  },
  advisorAssessed: {
    visionFlexibilityIndex: null,
    profileCompleteness: 0,
    dataConfidenceScore: null,
    divergenceLog: [],
    sessionNotes: '',
  },
};

// Initial FYI data
const initialFYIData = {
  brief: null,
  completedAt: null,
  settings: {
    targetSF: 15000,
    deltaPct: 10,
    circulationPct: 0.14,
    lockToTarget: true,
    programTier: '15k',
    hasBasement: false
  },
  selections: {},
  architectShortlist: [],
  idShortlist: [],
  compatibilityMatrix: {},
  selectedArchitect: null,
  selectedID: null,
};

// Create context
const AppContext = createContext(null);

// Sections available to Secondary respondent
const SECONDARY_SECTIONS = ['designIdentity', 'lifestyleLiving', 'spaceRequirements'];

// Required fields for completion status
const REQUIRED_FIELDS = {
  portfolioContext: ['principalFirstName', 'principalLastName', 'thisPropertyRole'],
  familyHousehold: [],
  projectParameters: ['projectCity', 'projectCountry', 'propertyType', 'targetGSF', 'bedroomCount'],
  budgetFramework: ['totalProjectBudget'],
  designIdentity: [],
  lifestyleLiving: [],
  spaceRequirements: [],
  culturalContext: [],
  workingPreferences: [],
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
  // Loading/saving state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Projects list
  const [projects, setProjects] = useState([]);

  // Active project ID
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Project data - ALL DATA COMES FROM SERVER
  const [projectData, setProjectData] = useState(() => getEmptyProjectData());

  // Destructure project data
  const { clientData, kycData, fyiData, activeRespondent: storedRespondent } = projectData;

  // Active respondent
  const [activeRespondent, setActiveRespondent] = useState(storedRespondent || 'principal');

  // Current KYC section
  const [currentKYCSection, setCurrentKYCSection] = useState(0);

  // Progressive disclosure tier
  const [disclosureTier, setDisclosureTier] = useState('mvp');

  // Load initial data from API on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load projects list from API
        const projectsList = await api.getProjects();
        setProjects(Array.isArray(projectsList) ? projectsList : []);

        // Load app state from API
        const state = await api.getState();
        const activeId = state?.activeProjectId || null;
        const tier = state?.disclosureTier || 'mvp';

        setDisclosureTier(tier);

        // If we have an active project, load it
        if (activeId) {
          try {
            const data = await api.getProject(activeId);
            if (data) {
              console.log('[APP] Loaded project from API:', activeId);
              console.log('[APP] FYI selections FOY:', data?.fyiData?.selections?.FOY);
              setActiveProjectId(activeId);
              setProjectData(data);
              setActiveRespondent(data.activeRespondent || 'principal');
            }
          } catch (err) {
            console.error('Failed to load active project:', err);
          }
        }
      } catch (error) {
        console.error('Failed to load initial data from API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // MANUAL SAVE - saves current project to API
  const saveNow = useCallback(async () => {
    if (!activeProjectId) {
      console.warn('[APP] No active project to save');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    const dataToSave = {
      ...projectData,
      activeRespondent,
    };

    console.log('[APP] Saving to API:', activeProjectId);
    console.log('[APP] FYI selections being saved:', dataToSave?.fyiData?.selections);

    try {
      await api.updateProject(activeProjectId, dataToSave);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      console.log('[APP] Save successful!');
      return true;
    } catch (error) {
      console.error('[APP] Save failed:', error);
      setSaveError(error.message || 'Failed to save');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [activeProjectId, projectData, activeRespondent]);

  // Mark data as changed (for UI indicator)
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Create new project
  const createProject = useCallback(async (name = '') => {
    const newId = generateProjectId();
    const now = new Date().toISOString();

    const newProject = {
      id: newId,
      name: name || 'Untitled Project',
      createdAt: now,
      lastUpdated: now,
    };

    const newProjectData = {
      id: newId,
      clientData: {
        projectName: name || 'Untitled Project',
        projectCode: newId.substring(5, 10).toUpperCase(),
        createdAt: now,
        lastUpdated: now,
      },
      kycData: {
        principal: { ...initialKYCData },
        secondary: { ...initialKYCData },
        advisor: { ...initialKYCData },
        consolidated: { ...initialKYCData },
      },
      fyiData: { ...initialFYIData },
      activeRespondent: 'principal',
    };

    try {
      // Save to API first
      await api.createProject(newProjectData);
      await api.setState('activeProjectId', newId);

      // Update local state
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newId);
      setProjectData(newProjectData);
      setActiveRespondent('principal');
      setCurrentKYCSection(0);
      setHasUnsavedChanges(false);

      return newId;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, []);

  // Switch to existing project - loads from API
  const switchProject = useCallback(async (projectId) => {
    if (!projectId || projectId === activeProjectId) return;

    setIsLoading(true);
    setHasUnsavedChanges(false);

    try {
      const data = await api.getProject(projectId);
      if (data) {
        console.log('[APP] Switched to project:', projectId);
        console.log('[APP] FYI selections loaded:', data?.fyiData?.selections);

        await api.setState('activeProjectId', projectId);

        setActiveProjectId(projectId);
        setProjectData(data);
        setActiveRespondent(data.activeRespondent || 'principal');
        setCurrentKYCSection(0);
      }
    } catch (error) {
      console.error('Failed to switch project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  // Reload current project from API (discard unsaved changes)
  const reloadProject = useCallback(async () => {
    if (!activeProjectId) return;

    setIsLoading(true);
    try {
      const data = await api.getProject(activeProjectId);
      if (data) {
        setProjectData(data);
        setActiveRespondent(data.activeRespondent || 'principal');
        setHasUnsavedChanges(false);
        console.log('[APP] Reloaded project from API');
      }
    } catch (error) {
      console.error('Failed to reload project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  // Delete project
  const deleteProject = useCallback(async (projectId) => {
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));

      if (projectId === activeProjectId) {
        const remaining = projects.filter(p => p.id !== projectId);
        if (remaining.length > 0) {
          await switchProject(remaining[0].id);
        } else {
          setActiveProjectId(null);
          setProjectData(getEmptyProjectData());
          await api.setState('activeProjectId', null);
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, [activeProjectId, projects, switchProject]);

  // Update client data - local only, marks as changed
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
    markAsChanged();
  }, [markAsChanged]);

  // Update KYC data - local only, marks as changed
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
    markAsChanged();
  }, [markAsChanged]);

  // Update FYI data - local only, marks as changed
  const updateFYIData = useCallback((updates) => {
    console.log('[APP] updateFYIData called with:', updates);
    console.log('[APP] FOY in updates:', updates?.selections?.FOY);

    setProjectData(prev => {
      const newFyiData = {
        ...prev.fyiData,
        ...updates,
      };

      // If updates include selections, merge them properly
      if (updates.selections) {
        newFyiData.selections = {
          ...prev.fyiData?.selections,
          ...updates.selections,
        };
      }

      // If updates include settings, merge them properly
      if (updates.settings) {
        newFyiData.settings = {
          ...prev.fyiData?.settings,
          ...updates.settings,
        };
      }

      console.log('[APP] New fyiData:', newFyiData);

      return {
        ...prev,
        fyiData: newFyiData,
      };
    });
    markAsChanged();
  }, [markAsChanged]);

  // Check section completion status
  const getSectionCompletionStatus = useCallback((respondent, sectionId) => {
    const sectionData = kycData[respondent]?.[sectionId];
    if (!sectionData) return 'empty';

    const requiredFields = REQUIRED_FIELDS[sectionId] || [];

    if (requiredFields.length === 0) {
      const values = Object.values(sectionData);
      const hasAnyData = values.some(v =>
        v !== '' && v !== null && v !== undefined &&
        !(Array.isArray(v) && v.length === 0) &&
        v !== 3 && v !== 5
      );
      return hasAnyData ? 'complete' : 'empty';
    }

    const filledRequired = requiredFields.filter(field => {
      const value = sectionData[field];
      return value !== '' && value !== null && value !== undefined &&
             !(Array.isArray(value) && value.length === 0);
    });

    if (filledRequired.length === 0) return 'empty';
    if (filledRequired.length === requiredFields.length) return 'complete';
    return 'partial';
  }, [kycData]);

  // Calculate profile completeness
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
        totalRequired += fields.length;
        fields.forEach(field => {
          const value = sectionData[field];
          if (value !== '' && value !== null && value !== undefined &&
              !(Array.isArray(value) && value.length === 0)) {
            filledRequired++;
          }
        });
      } else {
        const values = Object.values(sectionData);
        const hasData = values.some(v =>
          v !== '' && v !== null && v !== undefined &&
          !(Array.isArray(v) && v.length === 0) &&
          v !== 3 && v !== 5 && v !== 'moderate'
        );
        totalRequired += 1;
        if (hasData) filledRequired += 1;
      }
    });

    return totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;
  }, [kycData]);

  // Reset current project
  const resetCurrentProject = useCallback(() => {
    if (!activeProjectId) return;
    setProjectData(getEmptyProjectData());
    setActiveRespondent('principal');
    setCurrentKYCSection(0);
    markAsChanged();
  }, [activeProjectId, markAsChanged]);

  // Reset all data
  const resetAllData = useCallback(async () => {
    for (const p of projects) {
      try {
        await api.deleteProject(p.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }

    setProjects([]);
    setActiveProjectId(null);
    setProjectData(getEmptyProjectData());
    setCurrentKYCSection(0);
    setActiveRespondent('principal');
    setDisclosureTier('mvp');
    setHasUnsavedChanges(false);

    await api.setState('activeProjectId', null);
  }, [projects]);

  const value = {
    // Loading/saving state
    isLoading,
    isSaving,
    lastSaved,
    saveError,
    hasUnsavedChanges,
    saveNow,
    reloadProject,

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
