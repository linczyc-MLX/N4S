/**
 * FYIModule - Find Your Inspiration
 *
 * ALL DATA LIVES IN AppContext. This component:
 * 1. Reads fyiData from AppContext
 * 2. Uses useFYIState for calculations only
 * 3. Updates go directly to AppContext
 * 4. SAVE button persists to server
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Save, FileDown } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import useFYIState, { initializeSelectionsForTier } from './hooks/useFYIState';
import { generateMVPFromFYI } from './utils/fyiBridges';
import {
  buildAvailableLevels,
  getZonesForStructure,
} from '../../shared/space-registry';

// Components
import FYIZoneStepper from './components/FYIZoneStepper';
import FYISpaceCard from './components/FYISpaceCard';
import FYITotalsPanel from './components/FYITotalsPanel';
import LevelDiagram from './components/LevelDiagram';
import StructureSelector from './components/StructureSelector';
import FYIDocumentation from './FYIDocumentation';

import { generateFYIPDF, buildFYIPDFData } from './utils/fyi-pdf-export';

import './FYIModule.css';

const FYIModule = ({ showDocs, onCloseDocs }) => {
  // ---------------------------------------------------------------------------
  // GET EVERYTHING FROM APPCONTEXT
  // ---------------------------------------------------------------------------
  const {
    kycData,
    clientData,
    fyiData,
    updateFYISelection,
    updateFYISettings,
    updateFYIData,
    initializeFYISelections,
    saveNow,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    isLoading,
  } = useAppContext();

  // ---------------------------------------------------------------------------
  // LOCAL UI STATE (not persisted)
  // ---------------------------------------------------------------------------
  const [isExporting, setIsExporting] = useState(false);
  const [activeStructure, setActiveStructure] = useState('main');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ---------------------------------------------------------------------------
  // CONSOLIDATED KYC DATA
  // ---------------------------------------------------------------------------
  const consolidatedKYC = useMemo(() => {
    const principal = kycData?.principal || {};
    const secondary = kycData?.secondary || {};
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

  // Build available levels
  const availableLevels = useMemo(() => {
    const projectParams = consolidatedKYC?.projectParameters || {};
    const levelsAbove = projectParams.levelsAboveArrival ?? 1;
    const levelsBelow = projectParams.levelsBelowArrival ?? 0;
    return buildAvailableLevels(levelsAbove, levelsBelow);
  }, [consolidatedKYC]);

  // ---------------------------------------------------------------------------
  // USE FYI STATE (CALCULATION ONLY - NO LOCAL STATE)
  // ---------------------------------------------------------------------------
  const {
    settings,
    selections,
    activeZone,
    setActiveZone,
    hasSelections,
    totals,
    zonesWithCounts,
    structureTotals,
    updateSettings,
    updateSpaceSelection,
    toggleSpaceIncluded,
    setSpaceSize,
    setSpaceLevel,
    resetToDefaults,
    getSpaceSelection,
    getSpacesForZone,
    calculateArea,
    generateMVPBrief,
  } = useFYIState(fyiData, updateFYISelection, updateFYISettings, initializeFYISelections);

  // ---------------------------------------------------------------------------
  // INITIALIZE SELECTIONS IF EMPTY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isLoading || initialized) return;

    // Only initialize once, and only if no existing selections
    if (!hasSelections) {
      console.log('[FYI] No selections found, initializing defaults');

      // Determine tier from KYC target SF (internal algorithm)
      // Client does not see tier labels - this is purely for algorithm
      const targetSF = consolidatedKYC?.projectParameters?.targetGSF || 10000;
      let tier = '10k';
      if (targetSF < 7500) tier = '5k';
      else if (targetSF < 12500) tier = '10k';
      else if (targetSF < 17500) tier = '15k';
      else tier = '20k';

      // Get default circulation for tier
      const circulationDefaults = {
        '5k': 0.12,
        '10k': 0.13,
        '15k': 0.14,
        '20k': 0.15
      };

      // Initialize settings
      updateFYISettings({
        targetSF,
        programTier: tier,
        circulationPct: circulationDefaults[tier],
        hasBasement: consolidatedKYC?.projectParameters?.hasBasement || false,
      });

      // Initialize selections - pass KYC spaceRequirements for LuXeBrief Living sync
      // This pre-selects spaces based on client's mustHaveSpaces/niceToHaveSpaces from Living questionnaire
      const kycSpaceRequirements = consolidatedKYC?.spaceRequirements || null;
      if (kycSpaceRequirements?.mustHaveSpaces?.length || kycSpaceRequirements?.niceToHaveSpaces?.length) {
        console.log('[FYI] Using KYC spaceRequirements from LuXeBrief Living sync:', {
          mustHave: kycSpaceRequirements.mustHaveSpaces,
          niceToHave: kycSpaceRequirements.niceToHaveSpaces
        });
      }
      const newSelections = initializeSelectionsForTier(tier, false, kycSpaceRequirements);
      initializeFYISelections(newSelections);
    }

    setInitialized(true);
  }, [isLoading, initialized, hasSelections, consolidatedKYC, updateFYISettings, initializeFYISelections]);

  // ---------------------------------------------------------------------------
  // SAVE HANDLER
  // ---------------------------------------------------------------------------
  const handleSave = useCallback(async () => {
    const success = await saveNow();

    if (success) {
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage('Save failed - please try again');
      setTimeout(() => setSaveMessage(null), 5000);
    }
  }, [saveNow]);

  // ---------------------------------------------------------------------------
  // ZONE/STRUCTURE NAVIGATION
  // ---------------------------------------------------------------------------
  const activeZones = useMemo(() => {
    return getZonesForStructure(activeStructure);
  }, [activeStructure]);

  const filteredZonesWithCounts = useMemo(() => {
    const structureZoneCodes = activeZones.map(z => z.code);
    return zonesWithCounts.filter(z => structureZoneCodes.includes(z.code));
  }, [zonesWithCounts, activeZones]);

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

  const handleStructureChange = useCallback((structure) => {
    setActiveStructure(structure);
    setSelectedLevel(null);
    const newZones = getZonesForStructure(structure);
    if (newZones.length > 0) {
      setActiveZone(newZones[0].code);
    }
  }, [setActiveZone]);

  const handleLevelSelect = useCallback((level) => {
    setSelectedLevel(level);
  }, []);

  // ---------------------------------------------------------------------------
  // PDF EXPORT
  // ---------------------------------------------------------------------------
  const handleExportPDF = useCallback(async (mode = 'zone') => {
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

      await generateFYIPDF(pdfData, mode);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [settings, selections, totals, structureTotals, availableLevels, getSpacesForZone, calculateArea, clientData, consolidatedKYC]);

  // ---------------------------------------------------------------------------
  // PROCEED TO MVP
  // ---------------------------------------------------------------------------
  const handleProceedToMVP = useCallback(async () => {
    const mvpBrief = generateMVPFromFYI(generateMVPBrief(), availableLevels);

    updateFYIData({
      brief: mvpBrief,
      completedAt: new Date().toISOString()
    });

    await handleSave();

    console.log('MVP Brief generated:', mvpBrief);
    alert('Brief saved! Navigate to MVP module to validate adjacencies.');
  }, [generateMVPBrief, updateFYIData, availableLevels, handleSave]);

  // ---------------------------------------------------------------------------
  // RESET
  // ---------------------------------------------------------------------------
  const handleReset = () => {
    if (window.confirm('Reset all selections to defaults? This cannot be undone.')) {
      resetToDefaults();
      setInitialized(false);
    }
  };

  // ---------------------------------------------------------------------------
  // DISPLAY STRUCTURE TOTALS
  // ---------------------------------------------------------------------------
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
        enabled: (structureTotals?.guestHouse?.spaceCount || 0) > 0,
        total: structureTotals?.guestHouse?.total || 0,
        spaceCount: structureTotals?.guestHouse?.spaceCount || 0
      },
      poolHouse: {
        enabled: (structureTotals?.poolHouse?.spaceCount || 0) > 0,
        total: structureTotals?.poolHouse?.total || 0,
        spaceCount: structureTotals?.poolHouse?.spaceCount || 0
      }
    };
  }, [structureTotals, totals]);

  const sfByLevel = useMemo(() => {
    const byLevel = {};
    availableLevels.forEach(level => {
      const key = level.value === 1 ? 'L1' : `L${level.value}`;
      byLevel[key] = totals.byLevel?.[level.value] || 0;
    });
    return byLevel;
  }, [availableLevels, totals.byLevel]);

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="fyi-module fyi-module--loading">
        <div className="fyi-module__loader">Loading from server...</div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className={`n4s-docs-layout ${showDocs ? 'n4s-docs-layout--with-docs' : ''}`}>
      <div className="n4s-docs-layout__main">
        <div className="fyi-module">
      {/* Header */}
      <header className="fyi-module__header">
        <div className="fyi-module__header-content">
          <div className="fyi-module__title-group">
            <h1 className="fyi-module__title">FYI – Find Your Inspiration</h1>
            <p className="fyi-module__subtitle">Lifestyle Requirements Refinement</p>
          </div>

          {/* PDF DOWNLOADS + SAVE */}
          <div className="fyi-module__save-area">
            <button
              className="fyi-module__pdf-btn"
              onClick={() => handleExportPDF('zone')}
              disabled={isExporting}
              title="Download Space Program PDF"
            >
              <FileDown size={16} />
              Space Program
            </button>
            <button
              className="fyi-module__pdf-btn"
              onClick={() => handleExportPDF('level')}
              disabled={isExporting}
              title="Download Zone Breakdown PDF"
            >
              <FileDown size={16} />
              Zone Breakdown
            </button>
            <button
              className={`btn ${hasUnsavedChanges ? 'btn--primary' : 'btn--success'}`}
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
            {lastSaved && !hasUnsavedChanges && (
              <span className="fyi-module__last-saved">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>

          <button className="fyi-module__reset-btn" onClick={handleReset}>
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
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="fyi-module__content">
        {/* Left Sidebar */}
        <aside className="fyi-module__sidebar fyi-module__sidebar--left">
          <LevelDiagram
            levels={availableLevels}
            sfByLevel={sfByLevel}
            totalSF={totals.net}
            targetSF={settings.targetSF}
            selectedLevel={selectedLevel}
            onLevelSelect={handleLevelSelect}
            structure={activeStructure}
          />

          {(displayStructureTotals.guestHouse.enabled || displayStructureTotals.poolHouse.enabled) && (
            <StructureSelector
              activeStructure={activeStructure}
              onStructureChange={handleStructureChange}
              structures={displayStructureTotals}
            />
          )}

          <FYIZoneStepper
            zones={filteredZonesWithCounts}
            activeZone={activeZone}
            onZoneChange={setActiveZone}
            totals={totals}
          />
        </aside>

        {/* Center Content */}
        <main className="fyi-module__main">
          <div className="fyi-module__zone-header">
            <h2 className="fyi-module__zone-title">{activeZoneInfo?.name}</h2>
            <p className="fyi-module__zone-stats">
              {activeZoneInfo?.includedCount} of {activeZoneInfo?.spaceCount} spaces •
              {activeZoneInfo?.totalSF?.toLocaleString()} SF
              {selectedLevel !== null && (
                <span className="fyi-module__level-filter">
                  {' '}• Filtered to L{selectedLevel}
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
                <p>No spaces on this level. <button onClick={() => setSelectedLevel(null)}>Show all</button></p>
              ) : (
                <p>No spaces available for this zone.</p>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
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
      </div>
      {showDocs && (
        <div className="n4s-docs-layout__docs">
          <FYIDocumentation onClose={onCloseDocs} />
        </div>
      )}
    </div>
  );
};

export default FYIModule;
