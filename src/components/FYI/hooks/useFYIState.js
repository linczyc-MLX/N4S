/**
 * useFYIState Hook - CALCULATION ONLY
 *
 * This hook does NOT maintain its own state.
 * All data lives in AppContext. This hook:
 * 1. Reads fyiData from AppContext
 * 2. Computes derived values (totals, zones, etc.)
 * 3. Returns wrapped action functions that update AppContext directly
 *
 * THERE IS NO LOCAL STATE FOR SELECTIONS OR SETTINGS.
 * 
 * UPDATED: Added 5K tier support
 */

import { useState, useCallback, useMemo } from 'react';
import {
  spaceRegistry,
  getSpacesForTier,
  getConditionedSpaces,
  calculateSpaceArea,
  calculateCirculation,
  getSpaceByCode,
  getZonesInOrder
} from '../../../shared/space-registry';

// Default FYI settings
const defaultSettings = {
  targetSF: 10000,
  deltaPct: 10,
  circulationPct: 0.13,
  lockToTarget: true,
  programTier: '10k',
  hasBasement: false
};

// Initialize selections with all available spaces for tier set to 'M'
// If kycSpaceRequirements is provided, use mustHaveSpaces/niceToHaveSpaces to set inclusion
export const initializeSelectionsForTier = (tier, hasBasement = false, kycSpaceRequirements = null) => {
  const availableSpaces = getSpacesForTier(tier);
  const selections = {};

  // Extract KYC space requirements if provided (from LuXeBrief Living sync)
  const mustHaveSpaces = kycSpaceRequirements?.mustHaveSpaces || [];
  const niceToHaveSpaces = kycSpaceRequirements?.niceToHaveSpaces || [];
  const hasKYCData = mustHaveSpaces.length > 0 || niceToHaveSpaces.length > 0;

  availableSpaces.forEach(space => {
    if (space.baseSF[tier] !== null) {
      // Determine inclusion based on KYC data if available
      let included = true; // Default: include all spaces
      let notes = '';

      if (hasKYCData) {
        // If we have KYC data, use it to drive inclusion
        const isMustHave = mustHaveSpaces.includes(space.code) || mustHaveSpaces.includes(space.name);
        const isNiceToHave = niceToHaveSpaces.includes(space.code) || niceToHaveSpaces.includes(space.name);

        if (isMustHave) {
          included = true;
          notes = 'Must have (from LuXeBrief Living)';
        } else if (isNiceToHave) {
          included = true; // Include nice-to-have but mark them
          notes = 'Nice to have (from LuXeBrief Living)';
        } else {
          // If KYC data exists but this space isn't in either list, exclude by default
          // This ensures FYI reflects the client's actual selections
          included = false;
        }
      }

      selections[space.code] = {
        included,
        size: 'M',
        level: space.defaultLevel,
        customSF: null,
        imageUrl: null,
        notes
      };
    }
  });

  return selections;
};

/**
 * Determine program tier from target SF
 * This is internal algorithm logic - not exposed to client
 * 
 * @param {number} targetSF - Target square footage
 * @returns {string} - Internal tier identifier ('5k', '10k', '15k', '20k')
 */
function determineTier(targetSF) {
  if (targetSF < 7500) return '5k';
  if (targetSF < 12500) return '10k';
  if (targetSF < 17500) return '15k';
  return '20k';
}

/**
 * useFYIState - Calculation-only hook
 *
 * @param {Object} fyiData - fyiData from AppContext
 * @param {Function} updateFYISelection - from AppContext
 * @param {Function} updateFYISettings - from AppContext
 * @param {Function} initializeFYISelections - from AppContext
 */
export function useFYIState(fyiData, updateFYISelection, updateFYISettings, initializeFYISelections) {
  // Read settings and selections from AppContext's fyiData
  const settings = fyiData?.settings || defaultSettings;
  // Wrap in useMemo to ensure stable reference when selections is empty
  const selections = useMemo(() => fyiData?.selections || {}, [fyiData?.selections]);

  // Local UI state (not persisted)
  const [activeZone, setActiveZone] = useState('Z1_APB');

  // Check if we have any selections loaded
  const hasSelections = Object.keys(selections).length > 0;

  // ---------------------------------------------------------------------------
  // ACTION FUNCTIONS - These call AppContext directly
  // ---------------------------------------------------------------------------

  // Update a single space selection field
  const updateSpaceSelection = useCallback((code, updates) => {
    if (updateFYISelection) {
      updateFYISelection(code, updates);
    }
  }, [updateFYISelection]);

  // Toggle space inclusion
  const toggleSpaceIncluded = useCallback((code) => {
    const current = selections[code];
    if (updateFYISelection) {
      updateFYISelection(code, { included: !current?.included });
    }
  }, [selections, updateFYISelection]);

  // Set space size
  const setSpaceSize = useCallback((code, size) => {
    if (updateFYISelection) {
      updateFYISelection(code, { size });
    }
  }, [updateFYISelection]);

  // Set space level
  const setSpaceLevel = useCallback((code, level) => {
    if (updateFYISelection) {
      updateFYISelection(code, { level });
    }
  }, [updateFYISelection]);

  // Update settings
  const updateSettings = useCallback((updates) => {
    if (updateFYISettings) {
      updateFYISettings(updates);
    }
  }, [updateFYISettings]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (updateFYISettings) {
      updateFYISettings(defaultSettings);
    }
    if (initializeFYISelections) {
      const newSelections = initializeSelectionsForTier(defaultSettings.programTier, defaultSettings.hasBasement);
      initializeFYISelections(newSelections);
    }
    setActiveZone('Z1_APB');
  }, [updateFYISettings, initializeFYISelections]);

  // Apply KYC defaults
  const applyKYCDefaults = useCallback((kycData) => {
    const targetSF = kycData?.projectParameters?.targetGSF || 10000;
    const hasBasement = kycData?.projectParameters?.hasBasement || false;

    // Determine tier from target SF (internal algorithm)
    const tier = determineTier(targetSF);

    if (updateFYISettings) {
      updateFYISettings({
        targetSF,
        hasBasement,
        programTier: tier,
        circulationPct: getDefaultCirculation(tier)
      });
    }

    if (initializeFYISelections) {
      const newSelections = initializeSelectionsForTier(tier, hasBasement);
      initializeFYISelections(newSelections);
    }
  }, [updateFYISettings, initializeFYISelections]);

  // ---------------------------------------------------------------------------
  // CALCULATION FUNCTIONS - Pure computations from current data
  // ---------------------------------------------------------------------------

  // Get space selection
  const getSpaceSelection = useCallback((code) => {
    return selections[code] || { included: false, size: 'M', level: 1 };
  }, [selections]);

  // Calculate area for a specific space
  const calculateArea = useCallback((code) => {
    const space = getSpaceByCode(code);
    const selection = selections[code];

    if (!space || !selection || !selection.included) return 0;

    if (selection.customSF) return selection.customSF;

    return calculateSpaceArea(
      space,
      settings.programTier,
      selection.size,
      settings.deltaPct
    );
  }, [selections, settings.programTier, settings.deltaPct]);

  // Get spaces for a zone
  const getSpacesForZone = useCallback((zoneCode) => {
    return spaceRegistry.filter(s => {
      if (s.zone !== zoneCode) return false;
      if (s.baseSF[settings.programTier] === null) return false;
      return true;
    });
  }, [settings.programTier]);

  // ---------------------------------------------------------------------------
  // COMPUTED VALUES - Memoized calculations
  // ---------------------------------------------------------------------------

  // Calculate totals
  const totals = useMemo(() => {
    const conditionedSpaces = getConditionedSpaces();

    let net = 0;
    const byZone = {};
    const byLevel = {};

    conditionedSpaces.forEach(space => {
      const selection = selections[space.code];
      if (selection?.included) {
        const area = calculateArea(space.code);
        net += area;

        if (!byZone[space.zone]) byZone[space.zone] = 0;
        byZone[space.zone] += area;

        const level = selection.level || space.defaultLevel;
        byLevel[level] = (byLevel[level] || 0) + area;
      }
    });

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
      main: { enabled: true, net: 0, circulation: 0, total: 0, byLevel: {}, spaceCount: 0, circulationPct: 0 },
      guestHouse: { enabled: false, net: 0, total: 0, spaceCount: 0 },
      poolHouse: { enabled: false, net: 0, total: 0, spaceCount: 0 }
    };

    spaceRegistry.forEach(space => {
      const selection = selections[space.code];
      if (!selection?.included) return;
      if (space.outdoorSpace) return;

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

    const mainCirculation = calculateCirculation(
      results.main.net,
      settings.targetSF,
      settings.lockToTarget,
      settings.circulationPct,
      settings.programTier
    );
    results.main.circulation = mainCirculation;
    results.main.total = results.main.net + mainCirculation;
    results.main.circulationPct = results.main.net > 0 
      ? ((mainCirculation / results.main.net) * 100).toFixed(0) 
      : 0;

    return results;
  }, [selections, settings, calculateArea]);

  // Get all zones with counts
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

  // Generate MVP brief
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

  // ---------------------------------------------------------------------------
  // RETURN VALUES
  // ---------------------------------------------------------------------------
  return {
    // Data (from AppContext)
    settings,
    selections,

    // UI state
    activeZone,
    setActiveZone,

    // Status
    isLoaded: true,
    hasSelections,

    // Computed values
    totals,
    zonesWithCounts,
    structureTotals,

    // Action functions (update AppContext)
    updateSettings,
    updateSpaceSelection,
    toggleSpaceIncluded,
    setSpaceSize,
    setSpaceLevel,
    resetToDefaults,
    applyKYCDefaults,

    // Helpers
    getSpaceSelection,
    getSpacesForZone,
    calculateArea,
    generateMVPBrief,
  };
}

/**
 * Get default circulation percentage for tier
 */
function getDefaultCirculation(tier) {
  const defaults = {
    '5k': 0.12,
    '10k': 0.13,
    '15k': 0.14,
    '20k': 0.15
  };
  return defaults[tier] || 0.13;
}

export default useFYIState;
