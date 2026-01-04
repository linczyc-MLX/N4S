/**
 * FYIModule - Find Your Inspiration
 * 
 * Luxury residence interior area brief application.
 * Allows clients to define their conditioned interior space requirements
 * by selecting S/M/L sizes for each space with automatic circulation calculations.
 * 
 * Position in N4S workflow: KYC → FYI → MVP → VMX
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import useFYIState from './hooks/useFYIState';
import { generateFYIFromKYC, generateMVPFromFYI } from './utils/fyiBridges';
import { getSpaceByCode } from '../../shared/space-registry';

// Components
import FYIZoneStepper from './components/FYIZoneStepper';
import FYISpaceCard from './components/FYISpaceCard';
import FYITotalsPanel from './components/FYITotalsPanel';

import { generateFYIPDF, buildFYIPDFData } from './utils/fyi-pdf-export';

import './FYIModule.css';

const FYIModule = () => {
  const { kycData, activeRespondent, updateFYIData, clientData } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Get consolidated KYC data
  const consolidatedKYC = kycData?.consolidated || kycData?.[activeRespondent] || null;
  
  // Initialize FYI state
  const {
    settings,
    selections,
    activeZone,
    isLoaded,
    totals,
    zonesWithCounts,
    setActiveZone,
    updateSettings,
    updateSpaceSelection,
    toggleSpaceIncluded,
    setSpaceSize,
    setSpaceLevel,
    setSpaceImage,
    getSpaceSelection,
    getSpacesForZone,
    calculateArea,
    resetToDefaults,
    applyKYCDefaults,
    generateMVPBrief
  } = useFYIState();
  
  // Apply KYC defaults on first load
  useEffect(() => {
    if (isLoaded && consolidatedKYC && !initialized) {
      const { settings: kycSettings, selections: kycSelections } = generateFYIFromKYC(consolidatedKYC);
      
      // Only apply if we don't have existing selections
      const hasExistingSelections = Object.keys(selections).length > 0;
      if (!hasExistingSelections) {
        updateSettings(kycSettings);
        // Note: applyKYCDefaults will be called by useFYIState internally
      }
      setInitialized(true);
    }
  }, [isLoaded, consolidatedKYC, initialized]);
  
  // Get spaces for active zone
  const activeSpaces = getSpacesForZone(activeZone);
  const activeZoneInfo = zonesWithCounts.find(z => z.code === activeZone);
  
  // Handle PDF export
  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      // Get client/project info
      const projectName = clientData?.projectName || 
        consolidatedKYC?.projectParameters?.projectName || '';
      const clientName = consolidatedKYC?.portfolioContext 
        ? `${consolidatedKYC.portfolioContext.principalFirstName || ''} ${consolidatedKYC.portfolioContext.principalLastName || ''}`.trim()
        : '';
      
      // Build PDF data
      const pdfData = buildFYIPDFData(
        settings,
        selections,
        totals,
        getSpacesForZone,
        calculateArea,
        projectName,
        clientName
      );
      
      // Generate PDF
      await generateFYIPDF(pdfData);
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback to text summary
      generateClientSideSummary();
    } finally {
      setIsExporting(false);
    }
  }, [settings, selections, totals, getSpacesForZone, calculateArea, clientData, consolidatedKYC]);
  
  // Client-side summary fallback
  const generateClientSideSummary = () => {
    const summary = [];
    summary.push('FYI - Interior Brief Summary');
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
            summary.push(`  • ${space.abbrev} [${sel.size}]: ${area.toLocaleString()} SF`);
          }
        });
      }
    });
    
    // Create text file download
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
    const mvpBrief = generateMVPFromFYI(generateMVPBrief());
    
    // Save to context for MVP to pick up
    if (updateFYIData) {
      updateFYIData({
        brief: mvpBrief,
        completedAt: new Date().toISOString()
      });
    }
    
    // Navigate to MVP (this would typically be handled by parent/router)
    console.log('MVP Brief generated:', mvpBrief);
    alert('Brief saved! Navigate to MVP module to validate adjacencies.');
  }, [generateMVPBrief, updateFYIData]);
  
  // Handle reset
  const handleReset = () => {
    if (window.confirm('Reset all selections to defaults? This cannot be undone.')) {
      resetToDefaults();
      setInitialized(false);
    }
  };
  
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
            <p className="fyi-module__subtitle">Luxury Residence Interior Area Brief</p>
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
            {consolidatedKYC.projectParameters.hasBasement && (
              <span className="fyi-module__kyc-value">
                Basement included
              </span>
            )}
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <div className="fyi-module__content">
        {/* Left: Zone Stepper */}
        <aside className="fyi-module__sidebar fyi-module__sidebar--left">
          <FYIZoneStepper
            zones={zonesWithCounts}
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
                  onSizeChange={(size) => setSpaceSize(space.code, size)}
                  onToggleIncluded={() => toggleSpaceIncluded(space.code)}
                  onImageUpload={(url) => setSpaceImage(space.code, url)}
                  onLevelChange={(level) => setSpaceLevel(space.code, level)}
                  onNotesChange={(notes) => updateSpaceSelection(space.code, { notes })}
                />
              );
            })}
          </div>
          
          {activeSpaces.length === 0 && (
            <div className="fyi-module__empty">
              <p>No spaces available for this zone at the {settings.programTier} tier.</p>
            </div>
          )}
        </main>
        
        {/* Right: Totals Panel */}
        <aside className="fyi-module__sidebar fyi-module__sidebar--right">
          <FYITotalsPanel
            settings={settings}
            totals={totals}
            selections={selections}
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
