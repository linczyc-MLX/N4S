/**
 * VMXModule - N4S Host Wrapper for VMX (Vision Matrix)
 *
 * This component:
 * 1. Reads project data from AppContext
 * 2. Sets window.__N4S_VMX_* globals before VMX mounts
 * 3. Writes FYI zone totals to vmxData for smart weighting
 * 4. Renders the VMX application
 *
 * Integration Spec: N4S → VMX Data Handoff (Phase A + Phase B1)
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Save, FileDown, Archive } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFYIState } from '../FYI/hooks/useFYIState';

// Import VMX App, Documentation, and styles
import VMXApp from './VMXApp';
import VMXDocumentation from './VMXDocumentation';
import './vmx-index.css';
import './vmx-ui-overrides.css';

// Map N4S project location to VMX benchmark region ID
// NOTE: The default benchmark library only has 'us' and 'me' regions.
// Location-specific cost adjustments are handled via LOCATION_PRESETS, not regions.
const mapLocationToRegionId = (city, state, country) => {
  if (!country) return 'us';
  const countryLower = country.toLowerCase();
  // Middle East projects use 'me' benchmark set
  if (['uae', 'united arab emirates', 'saudi arabia', 'qatar', 'bahrain', 'kuwait', 'oman'].includes(countryLower)) {
    return 'me';
  }
  // Everything else uses 'us' benchmark set
  return 'us';
};

// Map N4S quality tier to VMX tier (VMX uses lowercase tier IDs)
const mapQualityTierToVmxTier = (qualityTier) => {
  const tierMap = {
    'standard': 'select',
    'premium': 'reserve',
    'luxury': 'signature',
    'ultra': 'legacy',
    // Direct mappings if already in VMX format (case-insensitive)
    'select': 'select',
    'reserve': 'reserve',
    'signature': 'signature',
    'legacy': 'legacy',
    'Select': 'select',
    'Reserve': 'reserve',
    'Signature': 'signature',
    'Legacy': 'legacy',
  };
  return tierMap[qualityTier] || 'reserve'; // Default to reserve
};

// Map KYS site typology to VMX typology
const mapSiteTypology = (kysTypology) => {
  const typologyMap = {
    'suburban': 'suburban',
    'hillside': 'hillside',
    'waterfront': 'waterfront',
    'urban': 'urban',
    'rural': 'rural',
    'desert': 'desert',
    // Common variations
    'coastal': 'waterfront',
    'mountain': 'hillside',
    'city': 'urban',
    'country': 'rural',
  };
  return typologyMap[(kysTypology || '').toLowerCase()] || 'suburban';
};

// Map N4S project location to VMX location preset ID
const mapLocationToPreset = (city, state, country) => {
  if (!country || (country.toLowerCase() !== 'usa' && country.toLowerCase() !== 'united states')) {
    return 'national';
  }

  const stateUpper = (state || '').toUpperCase();
  const cityLower = (city || '').toLowerCase();

  // Florida
  if (stateUpper === 'FL' || stateUpper === 'FLORIDA') {
    return 'florida';
  }

  // Colorado
  if (stateUpper === 'CO' || stateUpper === 'COLORADO') {
    if (cityLower.includes('aspen') || cityLower.includes('vail')) {
      return 'co_aspen';
    }
    return 'co_denver';
  }

  // California
  if (stateUpper === 'CA' || stateUpper === 'CALIFORNIA') {
    return 'ca_la';
  }

  // New York
  if (stateUpper === 'NY' || stateUpper === 'NEW YORK') {
    return 'ny_hamptons';
  }

  return 'national';
};

// Zone code mapping (FYI uses same codes as VMX - direct passthrough)
const FYI_TO_VMX_ZONE_MAP = {
  'Z1_APB': 'Z1_APB',
  'Z2_FAM': 'Z2_FAM',
  'Z3_ENT': 'Z3_ENT',
  'Z4_WEL': 'Z4_WEL',
  'Z5_PRI': 'Z5_PRI',
  'Z6_GST': 'Z6_GST',
  'Z7_SVC': 'Z7_SVC',
  'Z8_OUT': 'Z8_OUT',
};

const VMXModule = ({ showDocs, onCloseDocs }) => {
  const {
    projects,
    activeProjectId,
    clientData,
    kycData,
    fyiData,
    kysData,
    vmxData,
    updateVMXData,
    saveNow,
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    updateFYISelection,
    updateFYISettings,
    initializeFYISelections,
  } = useAppContext();

  // Use FYI state hook to get calculated zone totals
  const fyiState = useFYIState(
    fyiData,
    updateFYISelection,
    updateFYISettings,
    initializeFYISelections
  );

  const [vmxReady, setVmxReady] = useState(false);
  const [viewMode, setViewMode] = useState('lite'); // 'lite' or 'pro'

  // Build project list for VMX dropdown
  const vmxProjects = useMemo(() => {
    return projects.map(project => {
      // For active project, build full context
      if (project.id === activeProjectId) {
        const principal = kycData?.principal || {};
        const portfolioContext = principal.portfolioContext || {};
        const projectParams = principal.projectParameters || {};
        const budgetFramework = principal.budgetFramework || {};

        // Get client name
        const firstName = portfolioContext.principalFirstName || '';
        const lastName = portfolioContext.principalLastName || '';
        const clientName = `${firstName} ${lastName}`.trim() || 'Client';

        // Get project name
        const projectName = clientData?.projectName || projectParams.projectName || project.name || 'Untitled Project';

        // Get area: KYC targetGSF is authoritative (set by client in intake),
        // FYI targetSF is only used if KYC hasn't set a value yet
        const areaSqft = projectParams.targetGSF || fyiData?.settings?.targetSF || 15000;

        // Get tier
        const tier = mapQualityTierToVmxTier(budgetFramework.interiorQualityTier);

        // Get region from project location
        const city = projectParams.projectCity || '';
        const country = projectParams.projectCountry || 'USA';

        // Extract state: try propertyLocation first (e.g. "Malibu, CA, USA"),
        // then fall back to projectState if it ever gets added
        const locationStr = projectParams.propertyLocation || '';
        const locParts = locationStr.split(',').map(s => s.trim());
        const state = (locParts.length >= 3 ? locParts[1] : '') || projectParams.projectState || '';

        const regionId = mapLocationToRegionId(city, state, country);
        const locationPreset = mapLocationToPreset(city, state, country);

        // Get typology from KYS if available
        const selectedSite = kysData?.sites?.find(s => s.id === kysData?.selectedSiteId);
        const typologyId = mapSiteTypology(selectedSite?.typology || projectParams.siteTypology);

        // Get land cost - prioritize KYC Budget Framework, fallback to KYS site
        const landCost = portfolioContext.landAcquisitionCost || selectedSite?.landCost || 0;

        // Flag if tier was set from KYC (should be locked in VMX)
        const tierLockedFromKYC = !!budgetFramework.interiorQualityTier;

        // Build KYC budget constraints for VMX guardrails
        const kycBudgetConstraints = {
          totalBudget: budgetFramework.totalProjectBudget || null,
          constructionBudget: budgetFramework.interiorBudget || null,
          budgetPerSF: budgetFramework.perSFExpectation || null,
          budgetFlexibility: budgetFramework.budgetFlexibility || '',
          artBudgetSeparate: budgetFramework.artBudgetSeparate || false,
          artBudgetAmount: budgetFramework.artBudgetAmount || null,
          landAcquisitionCost: portfolioContext.landAcquisitionCost || null,
          targetGSF: projectParams.targetGSF || null,
        };

        return {
          id: project.id,
          label: projectName,
          updatedAtISO: project.lastUpdated || new Date().toISOString(),
          context: {
            version: 1,  // Must be number, not string
            projectId: project.id,
            clientName,
            projectName,
            compareMode: false,  // VMX expects 'compareMode', not 'compareModeEnabled'
            tierLockedFromKYC,  // If true, VMX should not allow tier changes
            kycBudgetConstraints, // Budget data from KYC for VMX guardrails
            scenarioA: {
              areaSqft,
              tier,
              locationPreset,
              regionId,
              typology: typologyId,  // VMX expects 'typology', not 'typologyId'
              landCost,
            },
          },
        };
      }

      // For non-active projects, just provide basic info
      return {
        id: project.id,
        label: project.name || 'Untitled',
        updatedAtISO: project.lastUpdated,
        context: null, // Will be loaded when selected
      };
    });
  }, [projects, activeProjectId, clientData, kycData, fyiData, kysData]);

  // Get current project context
  const currentContext = useMemo(() => {
    const activeProject = vmxProjects.find(p => p.id === activeProjectId);
    return activeProject?.context || null;
  }, [vmxProjects, activeProjectId]);

  // Build FYI zone totals for smart weighting
  const programProfile = useMemo(() => {
    if (!fyiState.zonesWithCounts || fyiState.zonesWithCounts.length === 0) {
      return null;
    }

    const byZoneSF = {};
    let totalSF = 0;

    fyiState.zonesWithCounts.forEach(zone => {
      const vmxZoneCode = FYI_TO_VMX_ZONE_MAP[zone.code];
      if (vmxZoneCode && zone.totalSF > 0) {
        byZoneSF[vmxZoneCode] = Math.round(zone.totalSF);
        totalSF += zone.totalSF;
      }
    });

    // Only return if we have meaningful data
    if (totalSF === 0) return null;

    return {
      totalSF: Math.round(totalSF),
      byZoneSF,
    };
  }, [fyiState.zonesWithCounts]);

  // Set up VMX globals and sync program profile to vmxData
  useEffect(() => {
    // 1. Set project list for dropdown
    window.__N4S_VMX_PROJECTS__ = vmxProjects;

    // 2. Set current project context for auto-population
    window.__N4S_VMX_CONTEXT__ = currentContext;

    // 3. Set Pro mode access (could be based on user role)
    window.__N4S_VMX_ALLOW_PRO__ = true; // TODO: Wire to user permissions

    // 4. Write FYI zone totals to vmxData (server-persisted)
    if (programProfile) {
      updateVMXData({ programProfile });
    }

    // 5. Seed KYC-derived values into vmxData ONLY when vmxData doesn't
    //    already have a user-set value. This prevents overwriting advisor
    //    adjustments made in VMX. Identity fields and budget constraints
    //    are always synced (they're reference data, not user-editable in VMX).
    if (currentContext) {
      const kycSync = {};

      // Identity fields — always sync (not user-editable in VMX)
      if (currentContext.clientName) kycSync.n4sClientName = currentContext.clientName;
      if (currentContext.projectName) kycSync.n4sProjectName = currentContext.projectName;
      if (currentContext.projectId) kycSync.n4sProjectId = currentContext.projectId;

      // Tier lock flag — always sync (metadata, not a user value)
      if (typeof currentContext.tierLockedFromKYC === 'boolean') {
        kycSync.tierLockedFromKYC = currentContext.tierLockedFromKYC;
      }

      // Budget constraints — always sync (read-only reference in VMX)
      if (currentContext.kycBudgetConstraints) {
        kycSync.kycBudgetConstraints = currentContext.kycBudgetConstraints;
      }

      // Scenario A values — areaSqft + landCostA always sync (live from KYC),
      // other fields seed-once (don't overwrite user-set values)
      const a = currentContext.scenarioA;
      if (a) {
        // Always sync from KYC (fields are locked in VMX UI)
        if (typeof a.areaSqft === 'number' && a.areaSqft > 0) {
          kycSync.areaSqft = a.areaSqft;
        }
        if (typeof a.landCost === 'number' && a.landCost >= 0) {
          kycSync.landCostA = a.landCost;
        }

        // Seed-once (don't overwrite user-set values)
        if (a.tier && !vmxData?.tier) {
          kycSync.tier = a.tier;
        }
        if (a.regionId && !vmxData?.regionAId) {
          kycSync.regionAId = a.regionId;
        }
        if (a.locationPreset && (!vmxData?.locationAPreset || vmxData.locationAPreset === 'national')) {
          kycSync.locationAPreset = a.locationPreset;
        }
        if (a.typology && (!vmxData?.typologyA || vmxData.typologyA === 'suburban')) {
          kycSync.typologyA = a.typology;
        }
      }

      // Write seeded values
      if (Object.keys(kycSync).length > 0) {
        updateVMXData(kycSync);
        console.log('[VMX] Seeded KYC values to vmxData (seed-once):', kycSync);
      }
    }

    console.log('[VMX] Context set:', {
      projects: vmxProjects.length,
      context: currentContext,
      programProfile,
    });

    setVmxReady(true);

    // Cleanup on unmount
    return () => {
      delete window.__N4S_VMX_PROJECTS__;
      delete window.__N4S_VMX_CONTEXT__;
      delete window.__N4S_VMX_ALLOW_PRO__;
    };
  }, [vmxProjects, currentContext, programProfile]);

  // View mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Update URL if using react-router
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode);
    window.history.replaceState({}, '', url.toString());
  };

  // SAVE HANDLER (FYI pattern)
  const [saveMessage, setSaveMessage] = useState(null);
  const handleSave = useCallback(async () => {
    const success = await saveNow();
    if (success) {
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  }, [saveNow]);

  // Receive export functions from VMXApp
  const vmxExportsRef = useRef({});
  const handleRegisterExports = useCallback((fns) => {
    vmxExportsRef.current = fns;
  }, []);

  if (showDocs) {
    return <VMXDocumentation onClose={onCloseDocs} />;
  }

  if (!vmxReady) {
    return (
      <div className="vmx-loading">
        <div className="vmx-loading__spinner" />
        <p>Loading VMX...</p>
      </div>
    );
  }

  return (
    <div className="vmx-module">
      {/* Module Header (universal pattern) */}
      <header className="module-header">
        <div className="module-header__content">
          <div className="module-header__title-group">
            <h1 className="module-header__title">VMX – Vision Matrix</h1>
            <p className="module-header__subtitle">Project Cost Analysis</p>
          </div>

          <div className="module-header__actions">
            <button
              className="btn btn--outline"
              onClick={() => vmxExportsRef.current?.exportPdf?.()}
              title="Export PDF Report"
            >
              <FileDown size={16} />
              Export PDF
            </button>
            <button
              className="btn btn--outline"
              onClick={() => vmxExportsRef.current?.exportClientPack?.()}
              title="Export Client Pack (.zip)"
            >
              <Archive size={16} />
              Client Pack
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
              <span className="module-header__last-saved">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Project context banner */}
        {currentContext && (
          <div className="module-header__banner">
            <span className="module-header__banner-label">Project:</span>
            <span className="module-header__banner-value">{currentContext.projectName}</span>
            {currentContext.clientName && (
              <span className="module-header__banner-value">{currentContext.clientName}</span>
            )}
            {currentContext.scenarioA?.areaSqft && (
              <span className="module-header__banner-value">
                {currentContext.scenarioA.areaSqft.toLocaleString()} SF
              </span>
            )}
          </div>
        )}
      </header>

      {/* VMX Content Area */}
      <div className="vmx-module__content">
        <VMXApp
          vmxData={vmxData}
          updateVMXData={updateVMXData}
          saveNow={saveNow}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onRegisterExports={handleRegisterExports}
        />
      </div>

      <style>{`
        .vmx-module {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--gray-50, #f7fafc);
        }

        .vmx-module__content {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        .vmx-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
        }

        .vmx-loading__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e0e0e0;
          border-top-color: #1e3a5f;
          border-radius: 50%;
          animation: vmx-spin 1s linear infinite;
        }

        @keyframes vmx-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VMXModule;
