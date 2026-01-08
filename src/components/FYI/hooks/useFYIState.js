/**
 * useFYIState Hook
 *
 * Manages FYI module state including space selections, settings, and calculations.
 * Integrates with the shared space-registry for consistent zone/space definitions.
 *
 * NOTE: This hook does NOT persist to localStorage. All persistence is handled
 * by AppContext which saves to the database. Pass initialData from AppContext.fyiData.
 *
 * IMPORTANT: Data flows ONE DIRECTION only:
 *   - On mount: initialData (from API via AppContext) → useFYIState
 *   - After mount: useFYIState → AppContext (via updateFYIData callback)
 *   - We do NOT continuously sync FROM initialData to avoid infinite loops
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  zones,
  spaceRegistry,
  getSpacesForTier,
  getConditionedSpaces,
  calculateSpaceArea,
  circulationDefaults,
  calculateCirculation,
  getSpaceByCode,
  getZonesInOrder
} from '../../../shared/space-registry';

// Default FYI settings
const defaultSettings = {
  targetSF: 15000,
  deltaPct: 10,
  circulationPct: 0.14,
  lockToTarget: true,
  programTier: '15k',
  hasBasement: false
};

// Initialize selections with all available spaces for tier set to 'M'
const initializeSelections = (tier, hasBasement) => {
  const availableSpaces = getSpacesForTier(tier);
  const selections = {};

  availableSpaces.forEach(space => {
    // Only include spaces that have SF defined for this tier
    if (space.baseSF[tier] !== null) {
      selections[space.code] = {
        included: true,
        size: 'M',
        level: space.defaultLevel,
        customSF: null,
        imageUrl: null,
        notes: ''
      };
    }
  });

  return selections;
};

export function useFYIState(initialData = null) {
  // Track if we've loaded initial data from API (only do this ONCE)
  const hasLoadedFromAPI = useRef(false);

  // Initialize from passed data (from AppContext.fyiData) or defaults
  const [settings, setSettings] = useState(() => {
    if (initialData?.settings && Object.keys(initialData.settings).length > 0) {
      hasLoadedFromAPI.current = true;
      return { ...defaultSettings, ...initialData.settings };
    }
    return defaultSettings;
  });

  // Space selections: { [spaceCode]: { included, size, level, customSF, imageUrl, notes } }
  const [selections, setSelections] = useState(() => {
    if (initialData?.selections && Object.keys(initialData.selections).length > 0) {
      hasLoadedFromAPI.current = true;
      return initialData.selections;
    }
    return initializeSelections(defaultSettings.programTier, defaultSettings.hasBasement);
  });

  // Loading state - immediate since we initialize from props
  const [isLoaded, setIsLoaded] = useState(true);

  // Active zone for navigation
  const [activeZone, setActiveZone] = useState('Z1_APB');

  // Load from API data ONCE when it becomes available (if not already loaded on mount)
  // This handles the case where AppContext loads from API after component mounts
  useEffect(() => {
    // Only load from initialData ONCE, and only if we haven't loaded yet
    if (hasLoadedFromAPI.current) {
      return; // Already loaded, don't sync again (prevents infinite loop)
    }

    // Check if initialData has meaningful data (not just defaults)
    const hasSelectionsData = initialData?.selections && Object.keys(initialData.selections).length > 0;
    const hasCustomSelections = hasSelectionsData &&
      Object.values(initialData.selections).some(s => s.size !== 'M' || s.notes || s.customSF);

    if (hasCustomSelections) {
      setSelections(initialData.selections);
      if (initialData.settings && Object.keys(initialData.settings).length > 0) {
        setSettings(prev => ({ ...prev, ...initialData.settings }));
      }
      hasLoadedFromAPI.current = true;
    }
  }, [initialData]);

  // Apply KYC defaults to FYI selections
  const applyKYCDefaults = useCallback((kycData) => {
    // Extract relevant KYC values
    const targetSF = kycData?.projectParameters?.targetGSF || 15000;
    const hasBasement = kycData?.projectParameters?.hasBasement || false;
    const bedroomCount = kycData?.projectParameters?.bedroomCount || 4;
    
    // Determine tier based on target SF
    let tier = '15k';
    if (targetSF <= 12000) tier = '10k';
    else if (targetSF >= 18000) tier = '20k';
    
    // Update settings
    setSettings(prev => ({
      ...prev,
      targetSF,
      hasBasement,
      programTier: tier
    }));
    
    // Re-initialize selections for new tier
    const newSelections = initializeSelections(tier, hasBasement);
    
    // Apply KYC must-have spaces
    const mustHaveSpaces = kycData?.spaceRequirements?.mustHaveSpaces || [];
    const niceToHaveSpaces = kycData?.spaceRequirements?.niceToHaveSpaces || [];
    
    // Mark nice-to-have spaces as included but smaller
    // (They start included anyway, but this could be used for recommendations)
    
    // Apply specific KYC flags
    if (kycData?.familyHousehold?.petGroomingRoom) {
      // Ensure mudroom is sized up for pet washing
      if (newSelections['MUD']) {
        newSelections['MUD'].size = 'L';
        newSelections['MUD'].notes = 'Sized for pet grooming station';
      }
    }
    
    if (kycData?.lifestyleLiving?.lateNightMediaUse) {
      // Ensure media room is included and sized appropriately
      if (newSelections['MDA']) {
        newSelections['MDA'].size = 'L';
        newSelections['MDA'].notes = 'Sound isolation required for late-night use';
      }
    }
    
    if (kycData?.spaceRequirements?.wantsBar && newSelections['BAR']) {
      newSelections['BAR'].included = true;
      newSelections['BAR'].size = 'M';
    }
    
    if (kycData?.spaceRequirements?.wantsBunkRoom && newSelections['BNK']) {
      newSelections['BNK'].included = true;
      newSelections['BNK'].size = 'M';
    }
    
    if (kycData?.spaceRequirements?.wantsBreakfastNook && newSelections['BKF']) {
      newSelections['BKF'].included = true;
      newSelections['BKF'].size = 'M';
    }
    
    // Adjust guest suite count based on bedroom count
    if (bedroomCount <= 4) {
      if (newSelections['GST3']) newSelections['GST3'].included = false;
      if (newSelections['GST4']) newSelections['GST4'].included = false;
    } else if (bedroomCount <= 5) {
      if (newSelections['GST4']) newSelections['GST4'].included = false;
    }
    
    setSelections(newSelections);
  }, []);

  // Get space selection
  const getSpaceSelection = useCallback((code) => {
    return selections[code] || { included: false, size: 'M', level: 1 };
  }, [selections]);

  // Update space selection
  const updateSpaceSelection = useCallback((code, updates) => {
    setSelections(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        ...updates
      }
    }));
  }, []);

  // Toggle space inclusion
  const toggleSpaceIncluded = useCallback((code) => {
    setSelections(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        included: !prev[code]?.included
      }
    }));
  }, []);

  // Set space size (S/M/L)
  const setSpaceSize = useCallback((code, size) => {
    setSelections(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        size
      }
    }));
  }, []);

  // Set space level
  const setSpaceLevel = useCallback((code, level) => {
    setSelections(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        level
      }
    }));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // If tier changed, re-initialize selections
      if (updates.programTier && updates.programTier !== prev.programTier) {
        const newSelections = initializeSelections(
          updates.programTier, 
          updates.hasBasement ?? prev.hasBasement
        );
        setSelections(newSelections);
      }
      
      return newSettings;
    });
  }, []);

  // Calculate area for a specific space
  const calculateArea = useCallback((code) => {
    const space = getSpaceByCode(code);
    const selection = selections[code];
    
    if (!space || !selection || !selection.included) return 0;
    
    // Use custom SF if provided
    if (selection.customSF) return selection.customSF;
    
    return calculateSpaceArea(
      space,
      settings.programTier,
      selection.size,
      settings.deltaPct
    );
  }, [selections, settings.programTier, settings.deltaPct]);

  // Calculate totals
  const totals = useMemo(() => {
    const conditionedSpaces = getConditionedSpaces();
    
    // Calculate net SF (sum of all included conditioned spaces)
    let net = 0;
    const byZone = {};
    const byLevel = {};
    
    conditionedSpaces.forEach(space => {
      const selection = selections[space.code];
      if (selection?.included) {
        const area = calculateArea(space.code);
        net += area;
        
        // Sum by zone
        if (!byZone[space.zone]) byZone[space.zone] = 0;
        byZone[space.zone] += area;
        
        // Sum by level (using actual selection level, not space.defaultLevel)
        const level = selection.level || space.defaultLevel;
        byLevel[level] = (byLevel[level] || 0) + area;
      }
    });
    
    // Calculate circulation
    const circulation = calculateCirculation(
      net,
      settings.targetSF,
      settings.lockToTarget,
      settings.circulationPct,
      settings.programTier
    );
    
    const circulationPct = net > 0 ? (circulation / net) * 100 : 0;
    const total = net + circulation;
    const deltaFromTarget = total - settings.targetSF;
    
    // Outdoor spaces (tracked separately)
    let outdoorTotal = 0;
    spaceRegistry.filter(s => s.outdoorSpace).forEach(space => {
      const selection = selections[space.code];
      if (selection?.included) {
        outdoorTotal += calculateArea(space.code);
      }
    });
    
    return {
      net,
      circulation,
      circulationPct: circulationPct.toFixed(1),
      total,
      deltaFromTarget,
      byZone,
      byLevel,
      outdoorTotal,
      targetSF: settings.targetSF
    };
  }, [selections, settings, calculateArea]);

  // Calculate structure-specific totals
  const structureTotals = useMemo(() => {
    const results = {
      main: { enabled: true, net: 0, circulation: 0, total: 0, byLevel: {}, spaceCount: 0 },
      guestHouse: { enabled: false, net: 0, total: 0, spaceCount: 0 },
      poolHouse: { enabled: false, net: 0, total: 0, spaceCount: 0 }
    };
    
    spaceRegistry.forEach(space => {
      const selection = selections[space.code];
      if (!selection?.included) return;
      if (space.outdoorSpace) return; // Skip outdoor spaces
      
      const area = calculateArea(space.code);
      const structure = space.structure || 'main';
      
      if (structure === 'main') {
        results.main.net += area;
        results.main.spaceCount++;
        const level = selection.level || space.defaultLevel;
        results.main.byLevel[level] = (results.main.byLevel[level] || 0) + area;
      } else if (structure === 'guestHouse') {
        results.guestHouse.enabled = true;
        results.guestHouse.net += area;
        results.guestHouse.total += area;
        results.guestHouse.spaceCount++;
      } else if (structure === 'poolHouse') {
        results.poolHouse.enabled = true;
        results.poolHouse.net += area;
        results.poolHouse.total += area;
        results.poolHouse.spaceCount++;
      }
    });
    
    // Apply circulation only to main residence
    const mainCirculation = calculateCirculation(
      results.main.net,
      settings.targetSF,
      settings.lockToTarget,
      settings.circulationPct,
      settings.programTier
    );
    results.main.circulation = mainCirculation;
    results.main.total = results.main.net + mainCirculation;
    
    return results;
  }, [selections, settings, calculateArea]);

  // Get spaces for current zone
  const getSpacesForZone = useCallback((zoneCode) => {
    return spaceRegistry.filter(s => {
      if (s.zone !== zoneCode) return false;
      // Only show spaces available for current tier
      if (s.baseSF[settings.programTier] === null) return false;
      return true;
    });
  }, [settings.programTier]);

  // Get all zones with their space counts
  const zonesWithCounts = useMemo(() => {
    return getZonesInOrder().map(zone => {
      const spaces = getSpacesForZone(zone.code);
      const includedCount = spaces.filter(s => selections[s.code]?.included).length;
      const totalSF = spaces.reduce((sum, s) => {
        if (selections[s.code]?.included) {
          return sum + calculateArea(s.code);
        }
        return sum;
      }, 0);
      
      return {
        ...zone,
        spaceCount: spaces.length,
        includedCount,
        totalSF
      };
    });
  }, [getSpacesForZone, selections, calculateArea]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    setSelections(initializeSelections(defaultSettings.programTier, defaultSettings.hasBasement));
    setActiveZone('Z1_APB');
  }, []);

  // Load state from AppContext (database sync)
  // This allows FYI to initialize from shared database data
  const loadFromContext = useCallback((contextData) => {
    if (!contextData) return false;

    let loaded = false;
    if (contextData.selections && Object.keys(contextData.selections).length > 0) {
      setSelections(contextData.selections);
      loaded = true;
    }
    if (contextData.settings) {
      setSettings(prev => ({ ...prev, ...contextData.settings }));
      loaded = true;
    }
    return loaded;
  }, []);

  // Generate brief for MVP
  const generateMVPBrief = useCallback(() => {
    const spaces = [];
    
    Object.entries(selections).forEach(([code, selection]) => {
      if (selection.included) {
        const spaceDef = getSpaceByCode(code);
        if (spaceDef) {
          spaces.push({
            code,
            name: spaceDef.name,
            zone: spaceDef.zone,
            targetSF: calculateArea(code),
            level: selection.level || spaceDef.defaultLevel,
            size: selection.size,
            notes: selection.notes
          });
        }
      }
    });
    
    return {
      settings: {
        targetSF: settings.targetSF,
        programTier: settings.programTier,
        hasBasement: settings.hasBasement,
        circulationPct: parseFloat(totals.circulationPct) / 100
      },
      spaces,
      totals: {
        net: totals.net,
        circulation: totals.circulation,
        total: totals.total
      }
    };
  }, [selections, settings, totals, calculateArea]);

  return {
    // State
    settings,
    selections,
    activeZone,
    isLoaded,
    totals,
    zonesWithCounts,
    structureTotals,
    
    // Setters
    setActiveZone,
    updateSettings,
    updateSpaceSelection,
    toggleSpaceIncluded,
    setSpaceSize,
    setSpaceLevel,

    // Helpers
    getSpaceSelection,
    getSpacesForZone,
    calculateArea,
    resetToDefaults,
    applyKYCDefaults,
    generateMVPBrief,
    loadFromContext
  };
}

export default useFYIState;
