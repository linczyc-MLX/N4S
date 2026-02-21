/**
 * AppContext - SINGLE SOURCE OF TRUTH
 *
 * ALL application data lives here. No other component maintains its own copy.
 * Data flows: Server → AppContext → Components → AppContext → Server
 *
 * Components READ from context and WRITE via update functions.
 * SAVE button triggers saveNow() which persists to server.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

// ============================================================================
// INITIAL DATA STRUCTURES
// ============================================================================

const generateProjectId = () => {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Initial KYC data structure (per respondent)
const initialKYCData = {
  portfolioContext: {
    principalFirstName: '', principalLastName: '', principalEmail: '', principalPhone: '',
    secondaryFirstName: '', secondaryLastName: '', secondaryEmail: '',
    familyOfficeContact: '', familyOfficeAuthorityLevel: null, authorityLevelConfirmed: false,
    domainDelegationNotes: '', currentPropertyCount: null, primaryResidences: [],
    thisPropertyRole: '', investmentHorizon: '', exitStrategy: '', lifeStage: '', decisionTimeline: '',
  },
  familyHousehold: {
    familyMembers: [], pets: '', petGroomingRoom: false, petDogRun: false,
    staffingLevel: '', liveInStaff: null, staffAccommodationRequired: false,
    multigenerationalNeeds: false, anticipatedFamilyChanges: '',
  },
  projectParameters: {
    projectCity: '', projectCountry: '', specificAddress: '', propertyType: '',
    targetGSF: null, bedroomCount: null, bathroomCount: null, floors: null,
    hasBasement: false, sfCapConstraint: null, timeline: '', complexityFactors: [],
    architecturalIntegration: '', localKnowledgeCritical: '',
    levelsAboveArrival: 1, levelsBelowArrival: 0, hasGuestHouse: false, hasPoolHouse: false,
  },
  budgetFramework: {
    totalProjectBudget: null, interiorBudget: null, perSFExpectation: null,
    budgetFlexibility: '', architectFeeStructure: '', interiorDesignerFeeStructure: '',
    interiorQualityTier: '', artBudgetSeparate: false, artBudgetAmount: null,
  },
  designIdentity: {
    axisContemporaryTraditional: 5, axisMinimalLayered: 5, axisWarmCool: 5,
    axisOrganicGeometric: 5, axisRefinedEclectic: 5, axisArchMinimalOrnate: 5,
    axisArchRegionalInternational: 5, inspirationImages: [], aspirationKeywords: [],
    antiInspiration: '', benchmarkProperties: [], architectureStyleTags: [],
    interiorStyleTags: [], materialAffinities: [], materialAversions: [], colorPreferences: '',
    exteriorMaterialPreferences: [], massingPreference: '', roofFormPreference: '', structuralAmbition: '',
    // Client configuration for Taste Exploration
    clientType: '', clientBaseName: '', principalName: '', secondaryName: '',
    // Taste Exploration Results (synced to backend)
    principalTasteResults: null, secondaryTasteResults: null,
  },
  lifestyleLiving: {
    dailyRoutinesSummary: '', workFromHome: '', wfhPeopleCount: null, hobbies: [],
    hobbyDetails: '', entertainingFrequency: '', typicalGuestCount: '', entertainingStyle: '',
    wellnessPriorities: [], lateNightMediaUse: false,
    privacyLevelRequired: 3, noiseSensitivity: 3, indoorOutdoorLiving: 3,
  },
  spaceRequirements: {
    mustHaveSpaces: [], niceToHaveSpaces: [], currentSpacePainPoints: '',
    viewPriorityRooms: [], adjacencyRequirements: '', storageNeeds: '',
    accessibilityRequirements: '', technologyRequirements: [], sustainabilityPriorities: [],
    wantsSeparateFamilyRoom: false, wantsSecondFormalLiving: false, wantsBar: false,
    wantsBunkRoom: false, wantsBreakfastNook: false,
  },
  culturalContext: {
    culturalBackground: '', regionalSensibilities: [], religiousObservances: '',
    entertainingCulturalNorms: '', crossCulturalRequirements: '', languagesPreferred: [],
  },
  workingPreferences: {
    communicationStyle: '', decisionCadence: '', collaborationStyle: '',
    principalInvolvementRequired: '', presentationFormat: '', previousDesignerExperience: '',
    redFlagsToAvoid: '', existingIndustryConnections: '',
    architectCelebrityPreference: 3, interiorDesignerCelebrityPreference: 3,
    caRequirement: '', contractorRelationshipPreference: '', earlyContractorInvolvement: false,
  },
  advisorAssessed: {
    visionFlexibilityIndex: null, profileCompleteness: 0, dataConfidenceScore: null,
    divergenceLog: [], sessionNotes: '',
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
    hasBasement: false,
  },
  selections: {},  // { [spaceCode]: { included, size, level, customSF, imageUrl, notes } }
  // MVP data stored here because PHP backend only saves known fields (clientData, kycData, fyiData)
  mvpChecklistState: {},  // { [checklistItemId]: boolean }
  mvpModuleReviewStatus: {},  // { [moduleId]: { reviewed: boolean, reviewedAt: timestamp } }
  mvpAdjacencyDecisions: {},  // DEPRECATED - use mvpAdjacencyConfig
  // Full MVP adjacency configuration
  mvpAdjacencyConfig: {
    tier: null,                    // '5k' | '10k' | '15k' | '20k' - auto-detected from FYI
    decisionAnswers: {},           // { [decisionId]: optionId }
    questionnaireCompletedAt: null,
    validationRunAt: null,
    validationResults: null,       // Cached validation results
  },
};

// Initial MVP data
const initialMVPData = {
  moduleChecklistState: {},  // { [checklistItemId]: boolean }
  adjacencyDecisions: {},    // { [decisionKey]: value }
  briefGenerated: null,      // timestamp when brief was generated
  validationResults: null,   // cached validation results
  completedAt: null,
};

// Initial KYS data (Site-Vision Compatibility Assessment)
const initialKYSData = {
  sites: [],                 // Array of site assessments
  selectedSiteId: null,      // Currently selected site
  comparisonEnabled: false,  // Multi-site comparison mode
};

// Initial BYT data (Build Your Team — per-project team assembly)
// Consultant registry lives in its own DB tables; this tracks project-specific selections
const initialBYTData = {
  currentMatches: {},          // { architect: [...], interior_designer: [...], pm: [...], gc: [...] }
  engagements: [],             // Active engagements for this project
  teamAssembly: {
    architect: null,
    interiorDesigner: null,
    projectManager: null,
    generalContractor: null,
  },
  filters: {},
  lastMatchRun: null,
};

// Initial LCD data (LuXeBrief Client Dashboard)
const initialLCDData = {
  // Portal activation
  portalActive: false,
  portalSlug: '',                    // e.g., 'thornwood' → thornwood.luxebrief.not-4.sale
  activatedAt: null,

  // Access credentials (stored hashed on server)
  clientPasswordHash: '',
  advisorPasswordHash: '',
  // Plain passwords shown once on generation, then cleared
  clientPasswordPlain: '',
  advisorPasswordPlain: '',

  // Client contact info
  clientEmail: '',
  secondaryEmail: '',

  // Content visibility toggles
  visibility: {
    kyc: {
      enabled: true,
      profileReport: true,
      luxebriefPrincipal: true,
      luxebriefSecondary: true,
      partnerAlignment: true,
    },
    fyi: {
      enabled: true,
      spaceProgram: true,
      zoneBreakdown: true,
    },
    mvp: {
      enabled: true,
      validationResults: true,
      designBrief: true,
    },
    kym: {
      enabled: true,
      propertyShortlist: true,
      marketSnapshot: true,
    },
    kys: {
      enabled: true,
      recommendedSites: true,
      siteComparison: true,
    },
    vmx: {
      enabled: true,
      budgetSummary: true,
    },
  },

  // Milestone sign-offs (client approval at each module)
  milestones: {
    kyc: { signed: false, signedAt: null, signedBy: null },
    fyi: { signed: false, signedAt: null, signedBy: null },
    mvp: { signed: false, signedAt: null, signedBy: null },
    kym: { signed: false, signedAt: null, signedBy: null },
    kys: { signed: false, signedAt: null, signedBy: null },
    vmx: { signed: false, signedAt: null, signedBy: null },
  },

  // Phase gating
  phases: {
    p1Complete: false,    // All P1 milestones signed
    p2Unlocked: false,
    p3Unlocked: false,
  },

  // Notification settings
  notifications: {
    onNewDocument: true,
    onMilestoneReady: true,
    onQuestionnaireReminder: true,
    weeklyProgress: false,
  },

  // Parker (PANDA) settings
  parker: {
    greetingStyle: 'professional',  // 'professional' | 'friendly' | 'formal'
    customWelcome: '',
  },

  // Client activity log (for advisor visibility)
  clientActivity: [],
  // Format: { timestamp: ISO8601, action: 'login'|'view_document'|'sign_off'|'questionnaire_complete', details: string }
};

// Initial VMX data (Vision Matrix cost estimation)
// ALL VMX state persisted server-side — NO localStorage
const initialVMXData = {
  // === Scenario configuration ===
  tier: 'reserve',                    // TierId: select/reserve/signature/legacy
  regionAId: 'us',                    // Primary region
  regionBId: 'me',                    // Compare region
  compareMode: false,                 // Whether compare mode is active
  areaSqft: 15000,                    // Project area

  // Location multipliers
  locationAPreset: 'national',        // Location preset for scenario A
  locationACustom: 1.0,               // Custom multiplier if preset is 'custom'
  locationBPreset: 'national',
  locationBCustom: 1.0,

  // Typology
  typologyA: 'suburban',
  typologyB: 'suburban',

  // Land costs
  landCostA: 0,
  landCostB: 0,

  // KYC tier lock flag
  tierLockedFromKYC: false,

  // Interior tier override (for Interiors + FF&E only)
  interiorTierOverride: 'match',      // 'match' or a TierId

  // Band selections per category (LOW/MEDIUM/HIGH)
  selectionsA: {
    FACILITATING: 'MEDIUM',
    SUBSTRUCTURE: 'MEDIUM',
    SUPERSTRUCTURE: 'MEDIUM',
    INTERNAL_FINISHES: 'MEDIUM',
    FF_E: 'MEDIUM',
    SERVICES: 'MEDIUM',
    EXTERNAL_WORKS: 'MEDIUM',
  },
  selectionsB: {
    FACILITATING: 'MEDIUM',
    SUBSTRUCTURE: 'MEDIUM',
    SUPERSTRUCTURE: 'MEDIUM',
    INTERNAL_FINISHES: 'MEDIUM',
    FF_E: 'MEDIUM',
    SERVICES: 'MEDIUM',
    EXTERNAL_WORKS: 'MEDIUM',
  },

  // UI mode
  uiMode: 'lite',                     // 'lite' or 'pro'

  // === Benchmark Library (was vmx_benchmark_library_v2 in localStorage) ===
  benchmarkLibrary: null,             // Full BenchmarkLibrary object; null = use demo defaults

  // === Snapshots (was vmx_snapshots_v1 in localStorage) ===
  snapshots: [],                      // Array of Snapshot objects (frozen scenario results)

  // === Soft Costs Config (was vmx_soft_costs_config_v1 in localStorage) ===
  softCostsConfig: null,              // SoftCostsConfig object; null = use defaults

  // === Construction Indirects (was vmx_construction_indirects_v1 in localStorage) ===
  constructionIndirectsConfig: null,  // ConstructionIndirectsConfigV1; null = use defaults

  // === Baseline Settings for Key Drivers (was vmx_baseline_* in localStorage) ===
  baselineLocationPreset: 'national',
  baselineLocationCustom: 1.0,
  baselineTypology: 'suburban',

  // === Delta Analysis Settings (was vmx_delta_* in localStorage) ===
  deltaMediumThreshold: 0.015,
  deltaHighThreshold: 0.03,
  deltaSort: 'category',             // 'category' or 'impact'
  deltaDriversOnly: false,

  // === Driver Settings (was vmx_driver_* in localStorage) ===
  driverMode: 'topN',                // 'topN' or 'pct'
  driverTopN: 3,
  driverPctThreshold: 0.02,
  driverPctCap: 7,

  // === Dataset Metadata (was vmx_dataset_* in localStorage) ===
  datasetName: '',
  datasetLastUpdated: '',
  datasetAssumptions: '',
  datasetAutoStamp: true,

  // === Program Profile from FYI zones (was vmx_program_profile_v1 in localStorage) ===
  programProfile: null,               // { totalSF, byZoneSF } or null

  // === KYC Budget Constraints (linked from KYC budgetFramework) ===
  kycBudgetConstraints: null,         // { totalBudget, constructionBudget, budgetPerSF }
};

// Empty project template
const getEmptyProjectData = () => ({
  id: null,
  clientData: {
    projectName: '',
    projectCode: '',
    createdAt: null,
    lastUpdated: null,
  },
  kycData: {
    principal: JSON.parse(JSON.stringify(initialKYCData)),
    secondary: JSON.parse(JSON.stringify(initialKYCData)),
    advisor: JSON.parse(JSON.stringify(initialKYCData)),
  },
  fyiData: JSON.parse(JSON.stringify(initialFYIData)),
  mvpData: JSON.parse(JSON.stringify(initialMVPData)),
  kysData: JSON.parse(JSON.stringify(initialKYSData)),
  vmxData: JSON.parse(JSON.stringify(initialVMXData)),
  bytData: JSON.parse(JSON.stringify(initialBYTData)),
  lcdData: JSON.parse(JSON.stringify(initialLCDData)),
  activeRespondent: 'principal',
});

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AppContext = createContext(null);

// Sections available to Secondary respondent (P1.A.6 now includes Space Requirements)
const SECONDARY_SECTIONS = ['designIdentity', 'lifestyleLiving'];

// Required fields for completion calculation
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

// ============================================================================
// APP PROVIDER
// ============================================================================

export const AppProvider = ({ children }) => {
  // ---------------------------------------------------------------------------
  // LOADING & SAVING STATE
  // ---------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ---------------------------------------------------------------------------
  // PROJECT LIST
  // ---------------------------------------------------------------------------
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectIdState] = useState(null);

  // ---------------------------------------------------------------------------
  // THE SINGLE SOURCE OF TRUTH - PROJECT DATA
  // ---------------------------------------------------------------------------
  const [projectData, setProjectData] = useState(getEmptyProjectData);

  // ---------------------------------------------------------------------------
  // UI STATE (not persisted to server)
  // ---------------------------------------------------------------------------
  const [activeRespondent, setActiveRespondent] = useState('principal');
  const [currentKYCSection, setCurrentKYCSection] = useState(0);
  const [disclosureTier, setDisclosureTier] = useState('enhanced');

  // ---------------------------------------------------------------------------
  // DERIVED VALUES (read-only extractions from projectData)
  // ---------------------------------------------------------------------------
  const clientData = projectData.clientData;
  const kycData = projectData.kycData;
  const fyiData = projectData.fyiData;
  const mvpData = projectData.mvpData || initialMVPData;
  const kysData = projectData.kysData || initialKYSData;
  const vmxData = projectData.vmxData || initialVMXData;
  const bytData = projectData.bytData || initialBYTData;
  const lcdData = projectData.lcdData || initialLCDData;

  // ---------------------------------------------------------------------------
  // LOAD INITIAL DATA FROM SERVER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const loadFromServer = async () => {
      setIsLoading(true);
      console.log('[APP] Loading data from server...');

      try {
        // 1. Load project list
        const projectsList = await api.getProjects();
        if (!isMounted) return;
        // Map API response (snake_case) to expected format (camelCase)
        const mappedProjects = (Array.isArray(projectsList) ? projectsList : []).map(p => ({
          id: p.id,
          name: p.project_name || p.name || 'Untitled',
          code: p.project_code || p.code,
          createdAt: p.created_at || p.createdAt,
          lastUpdated: p.updated_at || p.lastUpdated
        }));
        setProjects(mappedProjects);
        console.log('[APP] Loaded projects:', mappedProjects?.length || 0);

        // 2. Load app state (activeProjectId, disclosureTier)
        let state = {};
        try {
          state = await api.getState() || {};
        } catch (e) {
          console.warn('[APP] Could not load state:', e);
        }

        if (!isMounted) return;

        if (state.disclosureTier) {
          setDisclosureTier(state.disclosureTier);
        }

        // 3. Load active project if exists
        // Guard against "null" string stored in state
        const activeId = state.activeProjectId;
        if (activeId && activeId !== 'null' && activeId !== 'undefined') {
          try {
            const data = await api.getProject(activeId);
            if (!isMounted) return;

            if (data) {
              console.log('[APP] Loaded project:', activeId);
              console.log('[APP] FYI selections:', data.fyiData?.selections);
              console.log('[APP] MVP checklist:', data.fyiData?.mvpChecklistState);
              console.log('[APP] KYS data from fyiData:', data.fyiData?.kysData);
              console.log('[APP] VMX data (first-class):', data.vmxData);
              setActiveProjectIdState(activeId);
              // Merge with defaults to handle old projects missing new fields
              // Extract kysData from fyiData where it's stored for backend compatibility
              const loadedKysData = data.fyiData?.kysData || initialKYSData;
              // VMX data: first-class data type, with migration fallback from fyiData
              const loadedVmxData = data.vmxData || data.fyiData?.vmxData || initialVMXData;
              // Load lcdData directly (first-class data type)
              const loadedLcdData = data.lcdData || initialLCDData;
              // Load bytData (per-project team assembly)
              const loadedBytData = data.bytData || initialBYTData;
              setProjectData({
                ...getEmptyProjectData(),
                ...data,
                fyiData: {
                  ...initialFYIData,
                  ...data.fyiData,
                },
                mvpData: {
                  ...initialMVPData,
                  ...data.mvpData,
                },
                // Ensure kysData is available at top level for component access
                kysData: loadedKysData,
                // Ensure vmxData is available at top level for component access
                vmxData: loadedVmxData,
                // Ensure bytData is available at top level for component access
                bytData: loadedBytData,
                // Ensure lcdData is available at top level for component access
                lcdData: loadedLcdData,
              });
              setActiveRespondent(data.activeRespondent || 'principal');
            }
          } catch (e) {
            console.error('[APP] Failed to load project:', e);
          }
        }
      } catch (error) {
        console.error('[APP] Failed to load from server:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('[APP] Initial load complete');
        }
      }
    };

    loadFromServer();
    return () => { isMounted = false; };
  }, []);

  // ---------------------------------------------------------------------------
  // SAVE TO SERVER (MANUAL)
  // ---------------------------------------------------------------------------
  // saveNow accepts optional immediate updates to merge before saving
  // This fixes the race condition where React state hasn't updated yet
  const saveNow = useCallback(async (immediateUpdates = null) => {
    if (!activeProjectId) {
      console.warn('[APP] No project to save');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    // Start with current projectData
    let dataToSave = {
      ...projectData,
      id: activeProjectId,
      activeRespondent,
    };

    // If immediate updates provided, merge them in (fixes race condition)
    if (immediateUpdates?.kycData) {
      dataToSave = {
        ...dataToSave,
        kycData: {
          ...dataToSave.kycData,
          ...immediateUpdates.kycData,
          // Deep merge each respondent
          principal: {
            ...dataToSave.kycData?.principal,
            ...immediateUpdates.kycData?.principal,
            lifestyleLiving: {
              ...dataToSave.kycData?.principal?.lifestyleLiving,
              ...immediateUpdates.kycData?.principal?.lifestyleLiving,
            },
          },
          secondary: {
            ...dataToSave.kycData?.secondary,
            ...immediateUpdates.kycData?.secondary,
            lifestyleLiving: {
              ...dataToSave.kycData?.secondary?.lifestyleLiving,
              ...immediateUpdates.kycData?.secondary?.lifestyleLiving,
            },
          },
        },
      };
    }

    // Ensure vmxData is sent as first-class data type (not nested in fyiData)
    if (dataToSave.vmxData) {
      // Remove stale vmxData from fyiData if it exists (migration cleanup)
      if (dataToSave.fyiData?.vmxData) {
        const { vmxData: _discardNested, ...cleanFyiData } = dataToSave.fyiData;
        dataToSave.fyiData = cleanFyiData;
      }
    }

    console.log('[APP] Saving to server...');
    console.log('[APP] FYI selections being saved:', dataToSave.fyiData?.selections);
    console.log('[APP] MVP checklist being saved:', dataToSave.fyiData?.mvpChecklistState);
    console.log('[APP] KYS data being saved (in fyiData):', dataToSave.fyiData?.kysData);
    console.log('[APP] VMX data being saved (first-class):', dataToSave.vmxData);

    try {
      await api.updateProject(activeProjectId, dataToSave);
      // Also save disclosureTier to app state so it persists on refresh
      await api.setState('disclosureTier', disclosureTier);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      console.log('[APP] Save successful!');
      return true;
    } catch (error) {
      console.error('[APP] Save failed:', error);
      setSaveError(error.message || 'Save failed');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [activeProjectId, projectData, activeRespondent, disclosureTier]);

  // ---------------------------------------------------------------------------
  // PROJECT MANAGEMENT
  // ---------------------------------------------------------------------------
  const setActiveProjectId = useCallback(async (projectId) => {
    if (projectId === activeProjectId) return;

    setIsLoading(true);
    setHasUnsavedChanges(false);

    if (!projectId) {
      setActiveProjectIdState(null);
      setProjectData(getEmptyProjectData());
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getProject(projectId);
      if (data) {
        console.log('[APP] Switched to project:', projectId);
        console.log('[APP] MVP data:', data.mvpData);
        console.log('[APP] MVP checklist:', data.fyiData?.mvpChecklistState);
        console.log('[APP] KYS data from fyiData:', data.fyiData?.kysData);
        console.log('[APP] LCD data:', data.lcdData);
        setActiveProjectIdState(projectId);
        // Merge with defaults to handle old projects missing new fields
        // Extract kysData from fyiData where it's stored for backend compatibility
        const loadedKysData = data.fyiData?.kysData || initialKYSData;
        // VMX data: first-class data type, with migration fallback from fyiData
        const loadedVmxData = data.vmxData || data.fyiData?.vmxData || initialVMXData;
        // Load lcdData directly (first-class data type)
        const loadedLcdData = data.lcdData || initialLCDData;
        // Load bytData (per-project team assembly)
        const loadedBytData = data.bytData || initialBYTData;
        setProjectData({
          ...getEmptyProjectData(),
          ...data,
          fyiData: {
            ...initialFYIData,
            ...data.fyiData,
          },
          mvpData: {
            ...initialMVPData,
            ...data.mvpData,
          },
          // Ensure kysData is available at top level for component access
          kysData: loadedKysData,
          // Ensure vmxData is available at top level for component access
          vmxData: loadedVmxData,
          // Ensure bytData is available at top level for component access
          bytData: loadedBytData,
          // Ensure lcdData is available at top level for component access
          lcdData: loadedLcdData,
        });
        setActiveRespondent(data.activeRespondent || 'principal');
        await api.setState('activeProjectId', projectId);
      }
    } catch (error) {
      console.error('[APP] Failed to load project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  const createProject = useCallback(async (name = '') => {
    const newId = generateProjectId();
    const now = new Date().toISOString();

    const newProjectData = {
      ...getEmptyProjectData(),
      id: newId,
      clientData: {
        projectName: name || 'Untitled Project',
        projectCode: newId.substring(5, 10).toUpperCase(),
        createdAt: now,
        lastUpdated: now,
      },
    };

    try {
      await api.createProject(newProjectData);
      await api.setState('activeProjectId', newId);

      setProjects(prev => [...prev, { id: newId, name: name || 'Untitled Project', createdAt: now }]);
      setActiveProjectIdState(newId);
      setProjectData(newProjectData);
      setActiveRespondent('principal');
      setHasUnsavedChanges(false);

      console.log('[APP] Created project:', newId);
      return newId;
    } catch (error) {
      console.error('[APP] Failed to create project:', error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));

      if (projectId === activeProjectId) {
        const remaining = projects.filter(p => p.id !== projectId);
        if (remaining.length > 0) {
          await setActiveProjectId(remaining[0].id);
        } else {
          setActiveProjectIdState(null);
          setProjectData(getEmptyProjectData());
          // Clear from server state (don't store "null" string)
          await api.deleteState('activeProjectId');
        }
      }
    } catch (error) {
      console.error('[APP] Failed to delete project:', error);
    }
  }, [activeProjectId, projects, setActiveProjectId]);

  // ---------------------------------------------------------------------------
  // DATA UPDATE FUNCTIONS - ALL UPDATES GO THROUGH THESE
  // ---------------------------------------------------------------------------

  // Mark data as changed
  const markChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Update client data
  const updateClientData = useCallback((updates) => {
    setProjectData(prev => ({
      ...prev,
      clientData: {
        ...prev.clientData,
        ...updates,
        lastUpdated: new Date().toISOString(),
      },
    }));
    markChanged();
  }, [markChanged]);

  // Update KYC data for a specific respondent and section
  const updateKYCData = useCallback((respondent, section, data) => {
    console.log('[APP] updateKYCData:', respondent, section, data);
    setProjectData(prev => ({
      ...prev,
      kycData: {
        ...prev.kycData,
        [respondent]: {
          ...prev.kycData[respondent],
          [section]: {
            ...prev.kycData[respondent]?.[section],
            ...data,
          },
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Update FYI data (settings, selections, or other fields)
  const updateFYIData = useCallback((updates) => {
    console.log('[APP] updateFYIData:', updates);
    setProjectData(prev => {
      const newFyiData = { ...prev.fyiData };

      // Handle selections update with proper merge
      if (updates.selections !== undefined) {
        newFyiData.selections = {
          ...prev.fyiData.selections,
          ...updates.selections,
        };
      }

      // Handle settings update with proper merge
      if (updates.settings !== undefined) {
        newFyiData.settings = {
          ...prev.fyiData.settings,
          ...updates.settings,
        };
      }

      // Handle other fields (brief, completedAt, etc.)
      Object.keys(updates).forEach(key => {
        if (key !== 'selections' && key !== 'settings') {
          newFyiData[key] = updates[key];
        }
      });

      return { ...prev, fyiData: newFyiData };
    });
    markChanged();
  }, [markChanged]);

  // Update a single FYI space selection
  const updateFYISelection = useCallback((spaceCode, selectionData) => {
    console.log('[APP] updateFYISelection:', spaceCode, selectionData);
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        selections: {
          ...prev.fyiData.selections,
          [spaceCode]: {
            ...prev.fyiData.selections[spaceCode],
            ...selectionData,
          },
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Update FYI settings
  const updateFYISettings = useCallback((settingsUpdates) => {
    console.log('[APP] updateFYISettings:', settingsUpdates);
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        settings: {
          ...prev.fyiData.settings,
          ...settingsUpdates,
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Initialize FYI selections with defaults for a tier
  const initializeFYISelections = useCallback((selections) => {
    console.log('[APP] initializeFYISelections with', Object.keys(selections).length, 'spaces');
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        selections: selections,
      },
    }));
    markChanged();
  }, [markChanged]);

  // ---------------------------------------------------------------------------
  // MVP DATA UPDATES
  // ---------------------------------------------------------------------------

  // Update MVP data (stored in fyiData because PHP backend only saves known fields)
  const updateMVPData = useCallback((updates) => {
    console.log('[APP] updateMVPData:', updates);
    setProjectData(prev => {
      const newFyiData = { ...prev.fyiData };

      // Handle mvpChecklistState update with proper merge
      if (updates.mvpChecklistState !== undefined) {
        newFyiData.mvpChecklistState = {
          ...prev.fyiData?.mvpChecklistState,
          ...updates.mvpChecklistState,
        };
      }

      // Handle mvpAdjacencyDecisions update with proper merge
      if (updates.mvpAdjacencyDecisions !== undefined) {
        newFyiData.mvpAdjacencyDecisions = {
          ...prev.fyiData?.mvpAdjacencyDecisions,
          ...updates.mvpAdjacencyDecisions,
        };
      }

      return { ...prev, fyiData: newFyiData };
    });
    markChanged();
  }, [markChanged]);

  // Update a single module checklist item
  // NOTE: Stored in fyiData because PHP backend only saves clientData, kycData, fyiData
  const updateMVPChecklistItem = useCallback((itemId, checked) => {
    console.log('[APP] updateMVPChecklistItem:', itemId, checked);
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        mvpChecklistState: {
          ...prev.fyiData?.mvpChecklistState,
          [itemId]: checked,
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Update module review status (mark individual modules as reviewed)
  const updateMVPModuleReviewStatus = useCallback((moduleId, reviewed) => {
    console.log('[APP] updateMVPModuleReviewStatus:', moduleId, reviewed);
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        mvpModuleReviewStatus: {
          ...prev.fyiData?.mvpModuleReviewStatus,
          [moduleId]: { reviewed, reviewedAt: reviewed ? new Date().toISOString() : null },
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Update MVP adjacency configuration (decisions, validation results, etc.)
  // NOTE: Stored in fyiData because PHP backend only saves clientData, kycData, fyiData
  const updateMVPAdjacencyConfig = useCallback((updates) => {
    console.log('[APP] updateMVPAdjacencyConfig:', updates);
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        mvpAdjacencyConfig: {
          ...prev.fyiData?.mvpAdjacencyConfig,
          ...updates,
          // Deep merge decisionAnswers if provided
          ...(updates.decisionAnswers && {
            decisionAnswers: {
              ...prev.fyiData?.mvpAdjacencyConfig?.decisionAnswers,
              ...updates.decisionAnswers,
            },
          }),
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Save a single adjacency decision answer
  const updateMVPDecisionAnswer = useCallback((decisionId, optionId) => {
    console.log('[APP] updateMVPDecisionAnswer:', decisionId, optionId);
    setProjectData(prev => ({
      ...prev,
      fyiData: {
        ...prev.fyiData,
        mvpAdjacencyConfig: {
          ...prev.fyiData?.mvpAdjacencyConfig,
          decisionAnswers: {
            ...prev.fyiData?.mvpAdjacencyConfig?.decisionAnswers,
            [decisionId]: optionId,
          },
        },
      },
    }));
    markChanged();
  }, [markChanged]);

  // Update KYS data (Site-Vision Compatibility Assessment)
  // NOTE: Stored in fyiData because PHP backend only saves clientData, kycData, fyiData
  const updateKYSData = useCallback((updates) => {
    console.log('[APP] updateKYSData:', updates);
    setProjectData(prev => {
      // KYS data is stored in fyiData.kysData for backend compatibility
      const currentKysData = prev.fyiData?.kysData || initialKYSData;
      
      return {
        ...prev,
        fyiData: {
          ...prev.fyiData,
          kysData: {
            ...currentKysData,
            ...updates,
            // Deep merge sites if provided
            ...(updates.sites && {
              sites: updates.sites,
            }),
          },
        },
        // Also store at top level for easy access
        kysData: {
          ...currentKysData,
          ...updates,
          ...(updates.sites && {
            sites: updates.sites,
          }),
        },
      };
    });
    markChanged();
  }, [markChanged]);

  // Update VMX data (Vision Matrix cost estimation)
  // First-class data type — persisted directly as vmxData in project_data table
  const updateVMXData = useCallback((updates) => {
    console.log('[APP] updateVMXData:', updates);
    setProjectData(prev => {
      const currentVmxData = prev.vmxData || initialVMXData;

      const mergedVmxData = {
        ...currentVmxData,
        ...updates,
        // Deep merge selectionsA if provided
        ...(updates.selectionsA && {
          selectionsA: {
            ...currentVmxData.selectionsA,
            ...updates.selectionsA,
          },
        }),
        // Deep merge selectionsB if provided
        ...(updates.selectionsB && {
          selectionsB: {
            ...currentVmxData.selectionsB,
            ...updates.selectionsB,
          },
        }),
      };

      return {
        ...prev,
        vmxData: mergedVmxData,
      };
    });
    markChanged();
  }, [markChanged]);

  // Update BYT data (Build Your Team — per-project team assembly)
  const updateBYTData = useCallback((updates) => {
    console.log('[APP] updateBYTData:', updates);
    setProjectData(prev => {
      const currentBytData = prev.bytData || initialBYTData;
      return {
        ...prev,
        bytData: {
          ...currentBytData,
          ...updates,
          // Deep merge teamAssembly if provided
          ...(updates.teamAssembly && {
            teamAssembly: {
              ...currentBytData.teamAssembly,
              ...updates.teamAssembly,
            },
          }),
          // Deep merge currentMatches if provided
          ...(updates.currentMatches && {
            currentMatches: {
              ...currentBytData.currentMatches,
              ...updates.currentMatches,
            },
          }),
        },
      };
    });
    markChanged();
  }, [markChanged]);

  // Update LCD data (LuXeBrief Client Dashboard)
  // NOTE: Stored in lcdData for PHP backend persistence
  const updateLCDData = useCallback((updates) => {
    console.log('[APP] updateLCDData:', updates);
    setProjectData(prev => {
      const currentLcdData = prev.lcdData || initialLCDData;

      return {
        ...prev,
        lcdData: {
          ...currentLcdData,
          ...updates,
          // Deep merge visibility if provided
          ...(updates.visibility && {
            visibility: {
              ...currentLcdData.visibility,
              ...updates.visibility,
              // Deep merge each module's visibility
              ...(updates.visibility.kyc && {
                kyc: { ...currentLcdData.visibility?.kyc, ...updates.visibility.kyc },
              }),
              ...(updates.visibility.fyi && {
                fyi: { ...currentLcdData.visibility?.fyi, ...updates.visibility.fyi },
              }),
              ...(updates.visibility.mvp && {
                mvp: { ...currentLcdData.visibility?.mvp, ...updates.visibility.mvp },
              }),
              ...(updates.visibility.kym && {
                kym: { ...currentLcdData.visibility?.kym, ...updates.visibility.kym },
              }),
              ...(updates.visibility.kys && {
                kys: { ...currentLcdData.visibility?.kys, ...updates.visibility.kys },
              }),
              ...(updates.visibility.vmx && {
                vmx: { ...currentLcdData.visibility?.vmx, ...updates.visibility.vmx },
              }),
            },
          }),
          // Deep merge milestones if provided
          ...(updates.milestones && {
            milestones: {
              ...currentLcdData.milestones,
              ...updates.milestones,
            },
          }),
          // Deep merge phases if provided
          ...(updates.phases && {
            phases: {
              ...currentLcdData.phases,
              ...updates.phases,
            },
          }),
          // Deep merge notifications if provided
          ...(updates.notifications && {
            notifications: {
              ...currentLcdData.notifications,
              ...updates.notifications,
            },
          }),
          // Deep merge parker if provided
          ...(updates.parker && {
            parker: {
              ...currentLcdData.parker,
              ...updates.parker,
            },
          }),
          // Append to clientActivity if provided
          ...(updates.clientActivity && {
            clientActivity: [
              ...(currentLcdData.clientActivity || []),
              ...updates.clientActivity,
            ],
          }),
        },
      };
    });
    markChanged();
  }, [markChanged]);

  // ---------------------------------------------------------------------------
  // COMPLETION CALCULATIONS
  // ---------------------------------------------------------------------------
  const getSectionCompletionStatus = useCallback((respondent, sectionId) => {
    const sectionData = kycData[respondent]?.[sectionId];
    if (!sectionData) return 'empty';

    // Special handling for designIdentity - requires taste profile completion
    if (sectionId === 'designIdentity') {
      if (respondent === 'principal') {
        // Principal's results are in kycData.principal.designIdentity.principalTasteResults
        const tasteResults = kycData.principal?.designIdentity?.principalTasteResults;
        return tasteResults?.completedAt ? 'complete' : 'empty';
      } else {
        // Secondary's results are in kycData.secondary.designIdentity
        const secondaryDesignData = kycData.secondary?.designIdentity;
        const tasteResults = secondaryDesignData?.principalTasteResults || secondaryDesignData?.secondaryTasteResults;
        return tasteResults?.completedAt ? 'complete' : 'empty';
      }
    }

    const requiredFields = REQUIRED_FIELDS[sectionId] || [];

    if (requiredFields.length === 0) {
      const values = Object.values(sectionData);
      const hasAnyData = values.some(v =>
        v !== '' && v !== null && v !== undefined && v !== false &&
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

      // Special handling for designIdentity - requires taste profile completion
      if (sectionKey === 'designIdentity') {
        totalRequired += 1;
        // Check for completed taste profile based on respondent type
        // Principal's results are in kycData.principal.designIdentity.principalTasteResults
        // Secondary's results are in kycData.secondary.designIdentity (principalTasteResults or secondaryTasteResults)
        if (respondent === 'principal') {
          const tasteResults = kycData.principal?.designIdentity?.principalTasteResults;
          if (tasteResults?.completedAt) {
            filledRequired += 1;
          }
        } else {
          // Secondary's taste results are stored in their own designIdentity data
          const secondaryDesignData = kycData.secondary?.designIdentity;
          const tasteResults = secondaryDesignData?.principalTasteResults || secondaryDesignData?.secondaryTasteResults;
          if (tasteResults?.completedAt) {
            filledRequired += 1;
          }
        }
        return;
      }

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
          v !== '' && v !== null && v !== undefined && v !== false &&
          !(Array.isArray(v) && v.length === 0) &&
          v !== 3 && v !== 5 && v !== 'moderate'
        );
        totalRequired += 1;
        if (hasData) filledRequired += 1;
      }
    });

    return totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0;
  }, [kycData]);

  // ---------------------------------------------------------------------------
  // RESET FUNCTIONS
  // ---------------------------------------------------------------------------
  const resetCurrentProject = useCallback(() => {
    if (!activeProjectId) return;
    setProjectData(prev => ({
      ...getEmptyProjectData(),
      id: prev.id,
      clientData: prev.clientData,
    }));
    markChanged();
  }, [activeProjectId, markChanged]);

  const resetAllData = useCallback(async () => {
    for (const p of projects) {
      try {
        await api.deleteProject(p.id);
      } catch (e) {
        console.error('[APP] Failed to delete:', e);
      }
    }
    setProjects([]);
    setActiveProjectIdState(null);
    setProjectData(getEmptyProjectData());
    setHasUnsavedChanges(false);
  }, [projects]);

  // ---------------------------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------------------------
  const value = {
    // Loading/saving
    isLoading,
    isSaving,
    lastSaved,
    saveError,
    hasUnsavedChanges,
    saveNow,

    // Project management
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    deleteProject,

    // Data (read-only access)
    clientData,
    kycData,
    fyiData,
    mvpData,
    kysData,
    vmxData,
    bytData,
    lcdData,

    // Data updates
    updateClientData,
    updateKYCData,
    updateFYIData,
    updateFYISelection,
    updateFYISettings,
    initializeFYISelections,
    updateMVPData,
    updateMVPChecklistItem,
    updateMVPModuleReviewStatus,
    updateMVPAdjacencyConfig,
    updateMVPDecisionAnswer,
    updateKYSData,
    updateVMXData,
    updateBYTData,
    updateLCDData,

    // UI state
    activeRespondent,
    setActiveRespondent,
    currentKYCSection,
    setCurrentKYCSection,
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

// ============================================================================
// HOOK
// ============================================================================

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
