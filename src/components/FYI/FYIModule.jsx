/**
 * FYIModule - Find Your Inspiration
 * 
 * Lifestyle Requirements Refinement module.
 * Allows clients to:
 * - Confirm all spaces and amenities they want
 * - Assign each space to a level (L2, L1, L-1, etc.)
 * - Track SF against budget in real-time
 * - Handle multiple structures (Main, Guest House, Pool House)
 * - Consolidate Principal + Secondary selections
 * 
 * Position in N4S workflow: KYC → FYI → MVP → KYM → VMX
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import useFYIState from './hooks/useFYIState';
import { generateFYIFromKYC, generateMVPFromFYI } from './utils/fyiBridges';
import { 
  buildAvailableLevels, 
  getZonesForStructure,
  getSpacesForStructure 
} from '../../shared/space-registry';

// Components
import FYIZoneStepper from './components/FYIZoneStepper';
import FYISpaceCard from './components/FYISpaceCard';
import FYITotalsPanel from './components/FYITotalsPanel';
import LevelDiagram from './components/LevelDiagram';
import StructureSelector from './components/StructureSelector';

import { generateFYIPDF, buildFYIPDFData } from './utils/fyi-pdf-export';

import './FYIModule.css';

const FYIModule = () => {
  const { kycData, activeRespondent, updateFYIData, clientData } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeStructure, setActiveStructure] = useState('main');
  const [selectedLevel, setSelectedLevel] = useState(null); // For level filtering
  
  // Get consolidated KYC data (merge Principal + Secondary)
  const consolidatedKYC = useMemo(() => {
    const principal = kycData?.principal || {};
    const secondary = kycData?.secondary || {};
    
    // Merge Secondary's additive selections into Principal
    return {
      ...principal,
      spaceRequirements: {
        ...principal.spaceRequirements,
        mustHaveSpaces: [
          ...(principal.spaceRequirements?.mustHaveSpaces || []),
          ...(secondary.spaceRequirements?.mustHaveSpaces || [])
        ],
        niceToHaveSpaces: [
          ...(principal.spaceRequirements?.niceToHaveSpaces || []),
          ...(secondary.spaceRequirements?.niceToHaveSpaces || [])
        ]
      }
    };
  }, [kycData]);
  
  // Build available levels from KYC configuration
  const availableLevels = useMemo(() => {
    const projectParams = consolidatedKYC?.projectParameters || {};
    const levelsAbove = projectParams.levelsAboveArrival ?? 1;
    const levelsBelow = projectParams.levelsBelowArrival ?? 0;
    return buildAvailableLevels(levelsAbove, levelsBelow);
  }, [consolidatedKYC]);
  
  // Check for additional structures from KYC
  const structureConfig = useMemo(() => {
    const projectParams = consolidatedKYC?.projectParameters || {};
    return {
      main: { enabled: true },
      guestHouse: { enabled: projectParams.hasGuestHouse || false },
      poolHouse: { enabled: projectParams.hasPoolHouse || false }
    };
  }, [consolidatedKYC]);

  // Memoize the config object to prevent new reference on every render
  const fyiStateConfig = useMemo(() => ({
    availableLevels,
    structureConfig
  }), [availableLevels, structureConfig]);

  // Initialize FYI state
  const {
    settings,
    selections,
    activeZone,
    isLoaded,
    totals,
    zonesWithCounts,
    structureTotals,
    setActiveZone,
    updateSettings,
    updateSpaceSelection,
    toggleSpaceIncluded,
    setSpaceSize,
    setSpaceLevel,
    getSpaceSelection,
    getSpacesForZone,
    calculateArea,
    resetToDefaults,
    applyKYCDefaults,
    generateMVPBrief
  } = useFYIState(fyiStateConfig);
  
  // Apply KYC defaults on first load
  useEffect(() => {
    if (isLoaded && consolidatedKYC && !initialized) {
      const { settings: kycSettings, selections: kycSelections } = generateFYIFromKYC(
        consolidatedKYC,
        availableLevels
      );
      
      // Only apply if we don't have existing selections
      const hasExistingSelections = Object.keys(selections).length > 0;
      if (!hasExistingSelections) {
        updateSettings({
          ...kycSettings,
          levelsAboveArrival: consolidatedKYC?.projectParameters?.levelsAboveArrival ?? 1,
          levelsBelowArrival: consolidatedKYC?.projectParameters?.levelsBelowArrival ?? 0
        });
      }
      setInitialized(true);
    }
  }, [isLoaded, consolidatedKYC, initialized, availableLevels]);
  
  // Get zones for active structure
  const activeZones = useMemo(() => {
    return getZonesForStructure(activeStructure);
  }, [activeStructure]);
  
  // Filter zonesWithCounts to active structure
  const filteredZonesWithCounts = useMemo(() => {
    const structureZoneCodes = activeZones.map(z => z.code);
    return zonesWithCounts.filter(z => structureZoneCodes.includes(z.code));
  }, [zonesWithCounts, activeZones]);
  
  // Get spaces for active zone, optionally filtered by level
  const activeSpaces = useMemo(() => {
    let spaces = getSpacesForZone(activeZone);
    if (selectedLevel !== null) {
      spaces = spaces.filter(space => {
        const sel = getSpaceSelection(space.code);
        return sel.level === selectedLevel;
      });
    }
    return spaces;
  }, [activeZone, selectedLevel, getSpacesForZone, getSpaceSelection]);
  
  const activeZoneInfo = filteredZonesWithCounts.find(z => z.code === activeZone);
  
  // Handle structure change
  const handleStructureChange = useCallback((structure) => {
    setActiveStructure(structure);
    setSelectedLevel(null);
    // Set first zone of new structure as active
    const newZones = getZonesForStructure(structure);
    if (newZones.length > 0) {
      setActiveZone(newZones[0].code);
    }
  }, [setActiveZone]);
  
  // Handle level selection (for filtering)
  const handleLevelSelect = useCallback((level) => {
    setSelectedLevel(level);
  }, []);
  
  // Handle PDF export
  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const projectName = clientData?.projectName || 
        consolidatedKYC?.projectParameters?.projectName || '';
      const clientName = consolidatedKYC?.portfolioContext 
        ? `${consolidatedKYC.portfolioContext.principalFirstName || ''} ${consolidatedKYC.portfolioContext.principalLastName || ''}`.trim()
        : '';
      
      const pdfData = buildFYIPDFData(
        settings,
        selections,
        totals,
        structureTotals,
        availableLevels,
        getSpacesForZone,
        calculateArea,
        projectName,
        clientName
      );
      
      await generateFYIPDF(pdfData);
    } catch (error) {
      console.error('Export failed:', error);
      generateClientSideSummary();
    } finally {
      setIsExporting(false);
    }
  }, [settings, selections, totals, structureTotals, availableLevels, getSpacesForZone, calculateArea, clientData, consolidatedKYC]);
  
  // Client-side summary fallback
  const generateClientSideSummary = () => {
    const summary = [];
    summary.push('FYI - Lifestyle Requirements Summary');
    summary.push('=' .repeat(40));
    summary.push(`Target SF: ${settings.targetSF.toLocaleString()}`);
    summary.push(`Program Tier: ${settings.programTier}`);
    summary.push('');
    summary.push('TOTALS');
    summary.push(`Net Program: ${totals.net.toLocaleString()} SF`);
    summary.push(`Circulation (${totals.circulationPct}%): ${totals.circulation.toLocaleString()} SF`);
    summary.push(`Total: ${totals.total.toLocaleString()} SF`);
    summary.push(`Delta: ${totals.deltaFromTarget > 0 ? '+' : ''}${totals.deltaFromTarget.toLocaleString()} SF`);
    summary.push('');
    summary.push('SPACES BY ZONE');
    
    zonesWithCounts.forEach(zone => {
      if (zone.includedCount > 0) {
        summary.push('');
        summary.push(`${zone.name} (${zone.totalSF.toLocaleString()} SF)`);
        const spaces = getSpacesForZone(zone.code);
        spaces.forEach(space => {
          const sel = getSpaceSelection(space.code);
          if (sel.included) {
            const area = calculateArea(space.code);
            const levelLabel = sel.level === 1 ? 'L1' : `L${sel.level}`;
            summary.push(`  • ${space.abbrev} [${sel.size}] @ ${levelLabel}: ${area.toLocaleString()} SF`);
          }
        });
      }
    });
    
    const blob = new Blob([summary.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FYI-Brief-Summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Handle proceed to MVP
  const handleProceedToMVP = useCallback(() => {
    const mvpBrief = generateMVPFromFYI(generateMVPBrief(), availableLevels);
    
    if (updateFYIData) {
      updateFYIData({
        brief: mvpBrief,
        completedAt: new Date().toISOString()
      });
    }
    
    console.log('MVP Brief generated:', mvpBrief);
    alert('Brief saved! Navigate to MVP module to validate adjacencies.');
  }, [generateMVPBrief, updateFYIData, availableLevels]);
  
  // Handle reset
  const handleReset = () => {
    if (window.confirm('Reset all selections to defaults? This cannot be undone.')) {
      resetToDefaults();
      setInitialized(false);
    }
  };
  
  // Build structure totals for display
  const displayStructureTotals = useMemo(() => {
    return {
      main: {
        enabled: true,
        total: structureTotals?.main?.total || totals.total,
        net: structureTotals?.main?.net || totals.net,
        circulation: structureTotals?.main?.circulation || totals.circulation,
        circulationPct: totals.circulationPct,
        byLevel: structureTotals?.main?.byLevel || totals.byLevel,
        spaceCount: structureTotals?.main?.spaceCount || 0
      },
      guestHouse: {
        enabled: structureConfig.guestHouse.enabled,
        total: structureTotals?.guestHouse?.total || 0,
        spaceCount: structureTotals?.guestHouse?.spaceCount || 0
      },
      poolHouse: {
        enabled: structureConfig.poolHouse.enabled,
        total: structureTotals?.poolHouse?.total || 0,
        spaceCount: structureTotals?.poolHouse?.spaceCount || 0
      }
    };
  }, [structureTotals, totals, structureConfig]);
  
  // Calculate SF by level for diagram
  const sfByLevel = useMemo(() => {
    const byLevel = {};
    availableLevels.forEach(level => {
      const key = level.value === 1 ? 'L1' : `L${level.value}`;
      byLevel[key] = totals.byLevel?.[level.value] || 0;
    });
    return byLevel;
  }, [availableLevels, totals.byLevel]);
  
  // Loading state
  if (!isLoaded) {
    return (
      <div className="fyi-module fyi-module--loading">
        <div className="fyi-module__loader">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="fyi-module">
      {/* Header */}
      <header className="fyi-module__header">
        <div className="fyi-module__header-content">
          <div className="fyi-module__title-group">
            <h1 className="fyi-module__title">FYI – Find Your Inspiration</h1>
            <p className="fyi-module__subtitle">Lifestyle Requirements Refinement</p>
          </div>
          <button 
            className="fyi-module__reset-btn"
            onClick={handleReset}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reset
          </button>
        </div>
        
        {/* KYC Context Banner */}
        {consolidatedKYC?.projectParameters?.targetGSF && (
          <div className="fyi-module__kyc-banner">
            <span className="fyi-module__kyc-label">From KYC:</span>
            <span className="fyi-module__kyc-value">
              {consolidatedKYC.projectParameters.targetGSF.toLocaleString()} SF target
            </span>
            {consolidatedKYC.projectParameters.bedroomCount && (
              <span className="fyi-module__kyc-value">
                {consolidatedKYC.projectParameters.bedroomCount} bedrooms
              </span>
            )}
            {availableLevels.length > 2 && (
              <span className="fyi-module__kyc-value">
                {availableLevels.length} levels ({availableLevels[0]?.label} to {availableLevels[availableLevels.length - 1]?.label})
              </span>
            )}
            {structureConfig.guestHouse.enabled && (
              <span className="fyi-module__kyc-value">
                Guest House
              </span>
            )}
            {structureConfig.poolHouse.enabled && (
              <span className="fyi-module__kyc-value">
                Pool House
              </span>
            )}
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <div className="fyi-module__content">
        {/* Left: Level Diagram + Structure Selector + Zone Stepper */}
        <aside className="fyi-module__sidebar fyi-module__sidebar--left">
          {/* Level Diagram */}
          <LevelDiagram
            levels={availableLevels}
            sfByLevel={sfByLevel}
            totalSF={totals.net}
            targetSF={settings.targetSF}
            selectedLevel={selectedLevel}
            onLevelSelect={handleLevelSelect}
            structure={activeStructure}
          />
          
          {/* Structure Selector (if multiple structures) */}
          {(structureConfig.guestHouse.enabled || structureConfig.poolHouse.enabled) && (
            <StructureSelector
              activeStructure={activeStructure}
              onStructureChange={handleStructureChange}
              structures={displayStructureTotals}
            />
          )}
          
          {/* Zone Stepper */}
          <FYIZoneStepper
            zones={filteredZonesWithCounts}
            activeZone={activeZone}
            onZoneChange={setActiveZone}
            totals={totals}
          />
        </aside>
        
        {/* Center: Space Cards */}
        <main className="fyi-module__main">
          <div className="fyi-module__zone-header">
            <h2 className="fyi-module__zone-title">{activeZoneInfo?.name}</h2>
            <p className="fyi-module__zone-stats">
              {activeZoneInfo?.includedCount} of {activeZoneInfo?.spaceCount} spaces • 
              {activeZoneInfo?.totalSF.toLocaleString()} SF
              {selectedLevel !== null && (
                <span className="fyi-module__level-filter">
                  {' '}• Filtered to {selectedLevel === 1 ? 'L1' : `L${selectedLevel}`}
                  <button onClick={() => setSelectedLevel(null)}>Clear</button>
                </span>
              )}
            </p>
          </div>
          
          <div className="fyi-module__cards-grid">
            {activeSpaces.map(space => {
              const selection = getSpaceSelection(space.code);
              const area = calculateArea(space.code);
              return (
                <FYISpaceCard
                  key={space.code}
                  space={space}
                  selection={selection}
                  calculatedArea={area}
                  settings={settings}
                  availableLevels={availableLevels}
                  onSizeChange={(size) => setSpaceSize(space.code, size)}
                  onToggleIncluded={() => toggleSpaceIncluded(space.code)}
                  onLevelChange={(level) => setSpaceLevel(space.code, level)}
                  onNotesChange={(notes) => updateSpaceSelection(space.code, { notes })}
                />
              );
            })}
          </div>
          
          {activeSpaces.length === 0 && (
            <div className="fyi-module__empty">
              {selectedLevel !== null ? (
                <p>No spaces on this level in the current zone. <button onClick={() => setSelectedLevel(null)}>Show all levels</button></p>
              ) : (
                <p>No spaces available for this zone at the {settings.programTier} tier.</p>
              )}
            </div>
          )}
        </main>
        
        {/* Right: Totals Panel */}
        <aside className="fyi-module__sidebar fyi-module__sidebar--right">
          <FYITotalsPanel
            settings={settings}
            totals={totals}
            selections={selections}
            structureTotals={displayStructureTotals}
            availableLevels={availableLevels}
            onSettingsChange={updateSettings}
            onExportPDF={handleExportPDF}
            onProceedToMVP={handleProceedToMVP}
            isExporting={isExporting}
          />
        </aside>
      </div>
    </div>
  );
};

export default FYIModule;
