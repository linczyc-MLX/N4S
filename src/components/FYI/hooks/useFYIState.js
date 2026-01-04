/**
 * useFYIState Hook
 * 
 * Manages FYI module state including space selections, settings, and calculations.
 * Integrates with the shared space-registry for consistent zone/space definitions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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

const STORAGE_KEY = 'n4s_fyi_state';

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

export function useFYIState(initialKYCData = null) {
  // Settings state
  const [settings, setSettings] = useState(defaultSettings);
  
  // Space selections: { [spaceCode]: { included, size, level, customSF, imageUrl, notes } }
  const [selections, setSelections] = useState(() => 
    initializeSelections(defaultSettings.programTier, defaultSettings.hasBasement)
  );
  
  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Active zone for navigation
  const [activeZone, setActiveZone] = useState('Z1_APB');

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.settings) {
          setSettings(prev => ({ ...prev, ...parsed.settings }));
        }
        if (parsed.selections) {
          setSelections(parsed.selections);
        }
        if (parsed.activeZone) {
          setActiveZone(parsed.activeZone);
        }
      }
    } catch (e) {
      console.error('Failed to load FYI state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings,
        selections,
        activeZone
      }));
    } catch (e) {
      console.error('Failed to save FYI state:', e);
    }
  }, [settings, selections, activeZone, isLoaded]);

  // Apply KYC data to pre-populate selections
  useEffect(() => {
    if (initialKYCData && isLoaded) {
      applyKYCDefaults(initialKYCData);
    }
  }, [initialKYCData, isLoaded]);

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

  // Set space image
  const setSpaceImage = useCallback((code, imageUrl) => {
    setSelections(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        imageUrl
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
    const byLevel = { 2: 0, 1: 0, '-1': 0, '-2': 0 };
    
    conditionedSpaces.forEach(space => {
      const selection = selections[space.code];
      if (selection?.included) {
        const area = calculateArea(space.code);
        net += area;
        
        // Sum by zone
        if (!byZone[space.zone]) byZone[space.zone] = 0;
        byZone[space.zone] += area;
        
        // Sum by level
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
    
    // Setters
    setActiveZone,
    updateSettings,
    updateSpaceSelection,
    toggleSpaceIncluded,
    setSpaceSize,
    setSpaceLevel,
    setSpaceImage,
    
    // Helpers
    getSpaceSelection,
    getSpacesForZone,
    calculateArea,
    resetToDefaults,
    applyKYCDefaults,
    generateMVPBrief
  };
}

export default useFYIState;
