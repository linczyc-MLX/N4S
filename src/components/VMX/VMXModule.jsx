/**
 * VMXModule - N4S Host Wrapper for VMX (Vision Matrix)
 *
 * This component:
 * 1. Reads project data from AppContext
 * 2. Sets window.__N4S_VMX_* globals before VMX mounts
 * 3. Writes FYI zone totals to localStorage for smart weighting
 * 4. Renders the VMX application
 *
 * Integration Spec: N4S → VMX Data Handoff (Phase A + Phase B1)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useFYIState } from '../FYI/hooks/useFYIState';

// Import VMX App and styles
import VMXApp from './VMXApp';
import './vmx-index.css';
import './vmx-ui-overrides.css';

// Region mapping from N4S project location to VMX region IDs
const mapLocationToRegionId = (city, state, country) => {
  if (!country || (country.toLowerCase() !== 'usa' && country.toLowerCase() !== 'united states')) {
    return 'national_avg';
  }

  const stateUpper = (state || '').toUpperCase();
  const cityLower = (city || '').toLowerCase();

  // Florida
  if (stateUpper === 'FL' || stateUpper === 'FLORIDA') {
    return 'fl_miami_palmbeach';
  }

  // Colorado
  if (stateUpper === 'CO' || stateUpper === 'COLORADO') {
    if (cityLower.includes('aspen') || cityLower.includes('vail')) {
      return 'co_aspen_vail';
    }
    return 'co_denver';
  }

  // California
  if (stateUpper === 'CA' || stateUpper === 'CALIFORNIA') {
    return 'ca_la_oc';
  }

  // New York
  if (stateUpper === 'NY' || stateUpper === 'NEW YORK') {
    return 'ny_nyc_hamptons';
  }

  return 'national_avg';
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

        // Get area from FYI settings or KYC
        const areaSqft = fyiData?.settings?.targetSF || projectParams.targetGSF || 15000;

        // Get tier
        const tier = mapQualityTierToVmxTier(budgetFramework.interiorQualityTier);

        // Get region from project location
        const city = projectParams.projectCity || '';
        const state = projectParams.projectState || '';
        const country = projectParams.projectCountry || 'USA';
        const regionId = mapLocationToRegionId(city, state, country);

        // Get typology from KYS if available
        const selectedSite = kysData?.sites?.find(s => s.id === kysData?.selectedSiteId);
        const typologyId = mapSiteTypology(selectedSite?.typology || projectParams.propertyType);

        // Get land cost - prioritize KYC Budget Framework, fallback to KYS site
        const landCost = portfolioContext.landAcquisitionCost || selectedSite?.landCost || 0;

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
            scenarioA: {
              areaSqft,
              tier,
              locationPreset: 'national',
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

  // Set up VMX globals and localStorage before rendering
  useEffect(() => {
    // 1. Set project list for dropdown
    window.__N4S_VMX_PROJECTS__ = vmxProjects;

    // 2. Set current project context for auto-population
    window.__N4S_VMX_CONTEXT__ = currentContext;

    // 3. Set Pro mode access (could be based on user role)
    window.__N4S_VMX_ALLOW_PRO__ = true; // TODO: Wire to user permissions

    // 4. Write FYI zone totals to localStorage for smart weighting
    if (programProfile) {
      try {
        localStorage.setItem('vmx_program_profile_v1', JSON.stringify(programProfile));
        console.log('[VMX] Set program profile:', programProfile);
      } catch (e) {
        console.warn('[VMX] Failed to set program profile:', e);
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
      {/* Project Info Header - view toggle removed (VMX has its own) */}
      {currentContext && (
        <div className="vmx-module__header">
          <div className="vmx-module__project-info">
            <span className="vmx-project-label">Project:</span>
            <span className="vmx-project-name">{currentContext.projectName}</span>
            {currentContext.clientName && (
              <span className="vmx-project-client">({currentContext.clientName})</span>
            )}
          </div>
        </div>
      )}

      {/* VMX Content Area */}
      <div className="vmx-module__content">
        <VMXApp />
      </div>

      <style>{`
        .vmx-module {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fafaf8;
        }

        .vmx-module__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .vmx-module__view-toggle {
          display: flex;
          gap: 8px;
        }

        .vmx-view-btn {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .vmx-view-btn:hover:not(:disabled) {
          border-color: #1e3a5f;
        }

        .vmx-view-btn--active {
          background: #1e3a5f;
          color: white;
          border-color: #1e3a5f;
        }

        .vmx-view-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .vmx-module__project-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .vmx-project-label {
          color: #6b6b6b;
        }

        .vmx-project-name {
          font-weight: 600;
          color: #1e3a5f;
        }

        .vmx-project-client {
          color: #6b6b6b;
        }

        .vmx-module__content {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        .vmx-placeholder {
          background: white;
          border-radius: 8px;
          padding: 32px;
          border: 2px dashed #e0e0e0;
        }

        .vmx-placeholder h3 {
          margin: 0 0 8px;
          color: #1e3a5f;
        }

        .vmx-placeholder p {
          margin: 0 0 24px;
          color: #6b6b6b;
        }

        .vmx-debug {
          background: #f5f5f5;
          border-radius: 6px;
          padding: 16px;
        }

        .vmx-debug h4 {
          margin: 0 0 8px;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b6b6b;
        }

        .vmx-debug pre {
          margin: 0 0 16px;
          padding: 12px;
          background: white;
          border-radius: 4px;
          font-size: 12px;
          overflow: auto;
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
