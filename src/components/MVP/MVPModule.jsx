import React, { useMemo, useState } from 'react';
import {
  ClipboardCheck, CheckCircle2, XCircle,
  Home, Users, Dumbbell, LayoutGrid, RefreshCw,
  Building, Layers, ArrowRight, Sparkles, BookOpen,
  GitCompare, Play, Database, List, FileText,
  ChevronRight, ChevronDown, Save
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import AdjacencyPersonalizationView from './AdjacencyPersonalizationView';
import ModuleLibraryView from './ModuleLibraryView';
import AdjacencyComparisonGrid from './AdjacencyComparisonGrid';
import ValidationResultsPanel from './ValidationResultsPanel';
import TierDataAdmin from './TierDataAdmin';
import ProgramSummaryView from './ProgramSummaryView';
import MVPDocumentation from './MVPDocumentation';
import { 
  transformKYCToMVPBrief, 
  getMVPBriefSummary, 
  countSelectedAmenities,
  transformFYIToMVPProgram,
  getFYIProgramSummary
} from '../../lib/mvp-bridge';

// ============================================
// DEPLOYMENT WORKFLOW COMPONENT (horizontal expandable)
// ============================================

const DeploymentWorkflow = ({ gateStatus, onNavigate }) => {
  const [expandedGate, setExpandedGate] = useState(null);

  const gates = [
    {
      id: 'A',
      name: 'Profile Complete',
      description: 'Capture operating parameters in KYC',
      actionTarget: 'kyc'
    },
    {
      id: 'B',
      name: 'Space Program',
      description: 'Draft 8-zone configuration in FYI',
      actionTarget: 'fyi'
    },
    {
      id: 'C',
      name: 'Module Validation',
      description: 'Run module-level validation checks',
      actionTarget: 'modules'
    },
    {
      id: 'D',
      name: 'Adjacency Lock',
      description: 'Translate intent into spatial logic',
      actionTarget: 'personalization'
    },
    {
      id: 'E',
      name: 'Brief Ready',
      description: 'Final validation complete for handoff',
      actionTarget: 'validation'
    }
  ];

  const getGateStatus = (gateId) => {
    if (gateStatus[gateId] === 'complete') return 'complete';
    if (gateStatus[gateId] === 'current') return 'current';
    if (gateStatus[gateId] === 'warning') return 'warning';
    return 'locked';
  };

  const handleGateClick = (gateId) => {
    setExpandedGate(expandedGate === gateId ? null : gateId);
  };

  return (
    <div className="deployment-workflow">
      <h3 className="deployment-workflow__title">Deployment Workflow</h3>
      <p className="deployment-workflow__subtitle">
        Progress through five stages to complete your mansion validation. Click any stage to see what's required.
      </p>

      <div className="deployment-workflow__gates">
        {gates.map((gate, index) => {
          const status = getGateStatus(gate.id);
          const isExpanded = expandedGate === gate.id;
          return (
            <React.Fragment key={gate.id}>
              <div className="deployment-workflow__gate-wrapper">
                <div
                  className={`deployment-workflow__gate deployment-workflow__gate--${status} ${isExpanded ? 'deployment-workflow__gate--expanded' : ''}`}
                  onClick={() => handleGateClick(gate.id)}
                >
                  <div className="deployment-workflow__badge">{gate.id}</div>
                  <div className="deployment-workflow__content">
                    <div className="deployment-workflow__name">{gate.name}</div>
                  </div>
                </div>

                {/* Expandable Description */}
                {isExpanded && (
                  <div className={`deployment-workflow__explanation deployment-workflow__explanation--${status}`}>
                    <div className="deployment-workflow__explanation-content">
                      <span className="deployment-workflow__explanation-badge">{gate.id}</span>
                      <span className="deployment-workflow__explanation-text">{gate.description}</span>
                    </div>
                    <ChevronDown size={20} className="deployment-workflow__collapse-icon" />
                  </div>
                )}
              </div>
              {index < gates.length - 1 && (
                <div className="deployment-workflow__connector">
                  <ChevronRight size={20} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// FYI SPACE PROGRAM DISPLAY COMPONENT
// ============================================

const FYISpaceProgramCard = ({ fyiProgram, fyiSummary }) => {
  const [expanded, setExpanded] = useState(false);
  const showStructures = true;

  if (!fyiProgram || !fyiSummary) return null;

  const deltaColor = fyiSummary.totals.delta > 0 ? 'text-amber-600' :
                     fyiSummary.totals.delta < -500 ? 'text-red-600' : 'text-green-600';

  return (
    <div className="mvp-card mvp-card--full mvp-card--fyi">
      <div className="mvp-card__header">
        <LayoutGrid size={20} className="mvp-card__icon" />
        <h3 className="mvp-card__title">FYI Space Program</h3>
        <span className="mvp-card__status mvp-card__status--live">
          <RefreshCw size={12} className="animate-spin-slow" />
          LIVE
        </span>
      </div>
      <div className="mvp-card__content">
        {/* Structure Breakdown - matches FYI sidebar exactly */}
        <div className="fyi-structures">
          {fyiSummary.structures.map((structure, idx) => (
            <div key={structure.key} className={`fyi-structure ${idx === 0 ? 'fyi-structure--main' : ''}`}>
              <div className="fyi-structure__header">
                <span className="fyi-structure__name">{structure.name}</span>
                <span className="fyi-structure__total">{structure.totalSF.toLocaleString()} SF</span>
              </div>
              <div className="fyi-structure__details">
                <div className="fyi-structure__row">
                  <span>Net Program</span>
                  <span>{structure.netSF.toLocaleString()} SF</span>
                </div>
                {structure.hasCirculation && (
                  <div className="fyi-structure__row fyi-structure__row--indent">
                    <span>Circulation ({fyiSummary.totals.circulationPct}%)</span>
                    <span>{structure.circulationSF.toLocaleString()} SF</span>
                  </div>
                )}
                {structure.byLevel && showStructures && Object.keys(structure.byLevel).length > 0 && (
                  <div className="fyi-structure__levels">
                    <div className="fyi-structure__levels-label">BY LEVEL</div>
                    {Object.entries(structure.byLevel)
                      .sort(([a], [b]) => parseInt(b) - parseInt(a))
                      .map(([level, sf]) => (
                        <div key={level} className="fyi-structure__row fyi-structure__row--level">
                          <span>{level === '1' ? 'L1 (Arrival)' : `L${level}`}</span>
                          <span>{sf.toLocaleString()} SF</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total Box - matches FYI navy/gold box */}
        <div className="fyi-grand-total">
          <div className="fyi-grand-total__row fyi-grand-total__row--main">
            <span>Grand Total</span>
            <span>{fyiSummary.totals.totalSF.toLocaleString()} SF</span>
          </div>
          <div className={`fyi-grand-total__row fyi-grand-total__row--delta ${deltaColor}`}>
            <span>Delta from Target</span>
            <span>{fyiSummary.totals.delta > 0 ? '+' : ''}{fyiSummary.totals.delta.toLocaleString()} SF</span>
          </div>
          <div className="fyi-grand-total__row fyi-grand-total__row--outdoor">
            <span>Outdoor (not conditioned)</span>
            <span>{fyiSummary.totals.outdoorSF.toLocaleString()} SF</span>
          </div>
        </div>

        {/* Counts Row */}
        <div className="fyi-program-counts">
          <span className="fyi-count-chip">
            <strong>{fyiSummary.counts.bedrooms}</strong> Bedrooms
          </span>
          <span className="fyi-count-chip">
            <strong>{fyiSummary.counts.wellness}</strong> Wellness
          </span>
          <span className="fyi-count-chip">
            <strong>{fyiSummary.counts.entertainment}</strong> Entertainment
          </span>
        </div>

        {/* Zone Breakdown (expandable) */}
        <button 
          className="n4s-btn n4s-btn--secondary"
          onClick={() => setExpanded(!expanded)}
          style={{ marginTop: '12px' }}
        >
          {expanded ? 'Hide' : 'Show'} Zone Details ({fyiSummary.zones.length} zones)
        </button>
        
        {expanded && (
          <div className="fyi-program-zones">
            {fyiSummary.zones.map(zone => (
              <div key={zone.name} className="fyi-zone-row">
                <span className="fyi-zone-name">{zone.name}</span>
                <span className="fyi-zone-count">{zone.spaceCount} spaces</span>
                <span className="fyi-zone-sf">{zone.totalSF.toLocaleString()} SF</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN MVP MODULE COMPONENT
// ============================================

const MVPModule = ({ onNavigate, showDocs, onCloseDocs }) => {
  // ============================================
  // CONTEXT ACCESS - LIVE DATA
  // ============================================
  // CRITICAL: Both kycData and fyiData come directly from context.
  // Any changes to these in other modules trigger re-render here.
  // MVP checklist state is stored in fyiData (PHP backend only saves clientData, kycData, fyiData)
  const { kycData, fyiData, activeRespondent, updateMVPChecklistItem, hasUnsavedChanges, saveNow, isSaving, lastSaved } = useAppContext();
  
  const [showRawData, setShowRawData] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'modules' | 'personalization' | 'comparison' | 'validation' | 'program' | 'admin'
  
  // Module checklist state comes from fyiData (persisted)
  // Memoize to avoid re-renders
  const moduleChecklistState = useMemo(() => {
    return fyiData?.mvpChecklistState || {};
  }, [fyiData?.mvpChecklistState]);
  
  // Handle module checklist changes - saves to fyiData via context
  const handleModuleChecklistChange = (itemId, checked) => {
    updateMVPChecklistItem(itemId, checked);
  };
  
  // Calculate gate status based on completion
  // Deployment Workflow: A (Profile) → B (Space Program) → C (Module Validation) → D (Adjacency Lock) → E (Brief Ready)
  const gateStatus = useMemo(() => {
    // Stage A: KYC Profile has target GSF defined
    const kycComplete = kycData?.principal?.projectParameters?.targetGSF > 0;

    // Stage B: FYI Space Program has selections
    const fyiComplete = fyiData?.selections && Object.keys(fyiData.selections).length > 0;

    // Stage C: Module checklists reviewed (40 items total across 8 modules)
    // Require at least 24 items (60%) for completion, any checked items for 'current'
    const checklistCount = Object.values(moduleChecklistState).filter(Boolean).length;
    const modulesComplete = checklistCount >= 24;  // 60% threshold for full completion
    const modulesReviewed = checklistCount > 0;

    // Stage D: All 10 adjacency decisions answered
    const decisionAnswers = fyiData?.mvpAdjacencyConfig?.decisionAnswers || {};
    const decisionCount = Object.keys(decisionAnswers).length;
    const decisionsComplete = decisionCount >= 10;
    const decisionsStarted = decisionCount > 0;

    // Stage E: Validation passed (no critical red flags and score >= 80)
    const validationResults = fyiData?.mvpAdjacencyConfig?.validationResults;
    const hasValidation = validationResults && validationResults.overallScore !== undefined;
    const criticalFlags = validationResults?.redFlags?.filter(f => f.severity === 'critical')?.length || 0;
    const validationPassed = hasValidation &&
                             validationResults.overallScore >= 80 &&
                             criticalFlags === 0;
    const validationWarning = hasValidation && !validationPassed;

    return {
      A: kycComplete ? 'complete' : 'current',
      B: fyiComplete ? 'complete' : (kycComplete ? 'current' : 'locked'),
      C: modulesComplete ? 'complete' : (modulesReviewed || fyiComplete ? 'current' : 'locked'),
      D: decisionsComplete ? 'complete' : (decisionsStarted || modulesComplete ? 'current' : (modulesReviewed ? 'current' : 'locked')),
      E: validationPassed ? 'complete' : (validationWarning ? 'warning' : (decisionsComplete ? 'current' : 'locked'))
    };
  }, [kycData, fyiData, moduleChecklistState]);
  
  // Get design identity config from KYC
  const designIdentity = kycData[activeRespondent]?.designIdentity || {};
  const clientBaseName = designIdentity.clientBaseName || '';
  const clientType = designIdentity.clientType || 'individual';

  // Generate client IDs (still needed for display purposes)
  const clientIdP = clientBaseName ? `${clientBaseName}-P` : null;
  const clientIdS = clientType === 'couple' && clientBaseName ? `${clientBaseName}-S` : null;

  // Load taste profiles from kycData (synced to backend)
  const principalDesignIdentity = kycData?.principal?.designIdentity || {};

  // Normalize taste profile data to expected format
  const tasteProfileP = useMemo(() => {
    const data = principalDesignIdentity.principalTasteResults;
    if (!data || !data.selections) return null;
    return {
      clientId: data.clientId || clientIdP,
      session: data,
      selections: data.selections,
      profile: data.profile,
      completedAt: data.completedAt
    };
  }, [principalDesignIdentity.principalTasteResults, clientIdP]);

  const tasteProfileS = useMemo(() => {
    const data = principalDesignIdentity.secondaryTasteResults;
    if (!data || !data.selections) return null;
    return {
      clientId: data.clientId || clientIdS,
      session: data,
      selections: data.selections,
      profile: data.profile,
      completedAt: data.completedAt
    };
  }, [principalDesignIdentity.secondaryTasteResults, clientIdS]);

  // ============================================
  // FYI DATA - LIVE TRANSFORMATION
  // ============================================
  // CRITICAL: This useMemo has fyiData as dependency.
  // When fyiData changes (any FYI edit), this recomputes IMMEDIATELY.
  // NO COPIES, NO SNAPSHOTS - direct context reference.
  const fyiProgram = useMemo(() => {
    return transformFYIToMVPProgram(fyiData);
  }, [fyiData]);

  // FYI summary for display
  const fyiSummary = useMemo(() => {
    return getFYIProgramSummary(fyiProgram);
  }, [fyiProgram]);

  // Flag: Do we have FYI data?
  const hasFYIData = !!fyiProgram;

  // ============================================
  // KYC DATA - FALLBACK WHEN NO FYI
  // ============================================
  // Transform KYC data to MVP brief inputs
  const briefInputs = useMemo(() => {
    return transformKYCToMVPBrief(kycData, activeRespondent);
  }, [kycData, activeRespondent]);
  
  // Get summary for display
  const summary = useMemo(() => {
    return getMVPBriefSummary(briefInputs);
  }, [briefInputs]);
  
  // Count amenities for tier estimation
  const amenityCount = useMemo(() => {
    return countSelectedAmenities(briefInputs);
  }, [briefInputs]);
  
  // ============================================
  // TIER ESTIMATION
  // ============================================
  // Use FYI data if available, otherwise estimate from KYC amenities
  const estimatedTier = useMemo(() => {
    if (hasFYIData && fyiProgram?.settings?.programTier) {
      const tier = fyiProgram.settings.programTier;
      if (tier === '20k') return { tier: '20K', label: 'Estate (20,000 SF)', color: 'gold' };
      if (tier === '15k') return { tier: '15K', label: 'Grand (15,000 SF)', color: 'teal' };
      if (tier === '10k') return { tier: '10K', label: 'Signature (10,000 SF)', color: 'blue' };
    }
    // Fallback to amenity-based estimation
    if (amenityCount >= 12) return { tier: '20K+', label: 'Estate (20,000+ SF)', color: 'gold' };
    if (amenityCount >= 8) return { tier: '15K', label: 'Grand (15,000 SF)', color: 'teal' };
    if (amenityCount >= 4) return { tier: '10K', label: 'Signature (10,000 SF)', color: 'blue' };
    return { tier: 'Custom', label: 'Custom Compact', color: 'gray' };
  }, [hasFYIData, fyiProgram, amenityCount]);

  // Derive project info for BriefingBuilderView
  const projectId = clientBaseName || 'project-001';
  const projectName = kycData[activeRespondent]?.projectParameters?.projectName || 'New Project';

  // If in modules mode, show Module Library
  if (viewMode === 'modules') {
    return (
      <ModuleLibraryView
        onBack={() => setViewMode('overview')}
        onProceedToValidation={() => setViewMode('personalization')}
        gateStatus={gateStatus}
        checklistState={moduleChecklistState}
        onChecklistChange={handleModuleChecklistChange}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={saveNow}
      />
    );
  }

  // If in personalization mode, show Adjacency Personalization
  if (viewMode === 'personalization') {
    return (
      <AdjacencyPersonalizationView
        kycData={kycData}
        mvpData={briefInputs}
        fyiProgram={fyiProgram}
        tasteProfile={tasteProfileP}
        projectId={projectId}
        projectName={projectName}
        onBack={() => setViewMode('overview')}
        onGoToKYC={() => onNavigate && onNavigate('kyc')}
        onComplete={(result) => {
          console.log('Personalization result:', result);
          setViewMode('overview');
        }}
        onViewDiagram={() => {
          setViewMode('builder');
        }}
      />
    );
  }

  // If in program summary mode, show Program Summary View
  if (viewMode === 'program') {
    return (
      <ProgramSummaryView
        onBack={() => setViewMode('overview')}
      />
    );
  }

  // If in comparison mode, show read-only Adjacency Comparison Grid
  if (viewMode === 'comparison') {
    return (
      <AdjacencyComparisonGrid
        onBack={() => setViewMode('overview')}
        onRunValidation={() => setViewMode('validation')}
      />
    );
  }

  // If in validation mode, show Validation Results Panel
  if (viewMode === 'validation') {
    return (
      <ValidationResultsPanel
        onBack={() => setViewMode('overview')}
        onViewMatrix={() => setViewMode('comparison')}
        onEditDecisions={() => setViewMode('personalization')}
      />
    );
  }

  // If in admin mode, show Tier Data Admin
  if (viewMode === 'admin') {
    return (
      <TierDataAdmin
        onBack={() => setViewMode('overview')}
      />
    );
  }

  // If in docs mode, show MVP Documentation
  if (showDocs) {
    return (
      <MVPDocumentation
        onClose={onCloseDocs}
      />
    );
  }

  if (!briefInputs) {
    return (
      <div className="mvp-module">
        <div className="mvp-module__empty">
          <ClipboardCheck size={48} className="mvp-module__empty-icon" />
          <h2>No KYC Data Available</h2>
          <p>Complete the KYC module first to generate your MVP brief.</p>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ active, label }) => (
    <span className={`status-badge ${active ? 'status-badge--active' : 'status-badge--inactive'}`}>
      {active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {label}
    </span>
  );

  const SectionCard = ({ title, icon: Icon, children, status, fullWidth }) => (
    <div className={`mvp-card ${fullWidth ? 'mvp-card--full' : ''}`}>
      <div className="mvp-card__header">
        <Icon size={20} className="mvp-card__icon" />
        <h3 className="mvp-card__title">{title}</h3>
        {status && <span className={`mvp-card__status mvp-card__status--${status}`}>{status}</span>}
      </div>
      <div className="mvp-card__content">
        {children}
      </div>
    </div>
  );

  return (
    <div className="mvp-module">
      {/* Header */}
      <div className="mvp-module__header">
        <div className="mvp-module__title-group">
          <h1 className="mvp-module__title">
            <ClipboardCheck size={28} />
            Mansion Validation Program
          </h1>
          <p className="mvp-module__subtitle">
            {hasFYIData ? (
              <>Space program from FYI • <span className="text-green-600 font-medium">LIVE</span></>
            ) : (
              <>Area program derived from KYC inputs • {activeRespondent.charAt(0).toUpperCase() + activeRespondent.slice(1)} respondent</>
            )}
          </p>
        </div>
        
        {/* Save Status */}
        <div className="mvp-module__save-area">
          <button
            className={`btn ${hasUnsavedChanges ? 'btn--primary' : 'btn--success'}`}
            onClick={saveNow}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
          {lastSaved && !hasUnsavedChanges && (
            <span className="mvp-module__save-time">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {/* Tier Estimate Badge */}
        <div className={`mvp-tier-badge mvp-tier-badge--${estimatedTier.color}`}>
          <span className="mvp-tier-badge__tier">{estimatedTier.tier}</span>
          <span className="mvp-tier-badge__label">{estimatedTier.label}</span>
        </div>
      </div>

      {/* ============================================ */}
      {/* DEPLOYMENT WORKFLOW - TOP OF PAGE */}
      {/* ============================================ */}
      <DeploymentWorkflow
        gateStatus={gateStatus}
        onNavigate={onNavigate}
      />

      {/* ============================================ */}
      {/* FYI SPACE PROGRAM - LIVE DATA */}
      {/* ============================================ */}
      {hasFYIData ? (
        <FYISpaceProgramCard fyiProgram={fyiProgram} fyiSummary={fyiSummary} />
      ) : (
        /* No FYI Data - Show prompt */
        <div className="mvp-card mvp-card--full mvp-card--fyi-empty">
          <div className="mvp-card__header">
            <LayoutGrid size={20} className="mvp-card__icon" />
            <h3 className="mvp-card__title">Space Program</h3>
            <span className="mvp-card__status mvp-card__status--pending">Not Started</span>
          </div>
          <div className="mvp-card__content">
            <div className="fyi-empty-prompt">
              <p>Complete the FYI module to confirm your space program.</p>
              <p className="fyi-empty-hint">
                The space program will appear here with LIVE updates as you make selections in FYI.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats - Show FYI or KYC-derived */}
      <div className="mvp-stats-row">
        <div className="mvp-stat">
          <span className="mvp-stat__value">
            {hasFYIData ? fyiSummary.counts.bedrooms : (summary?.household.totalBedrooms || 0)}
          </span>
          <span className="mvp-stat__label">Bedrooms</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">
            {hasFYIData ? fyiSummary.totals.spaces : (summary?.household.guestBedrooms || 0)}
          </span>
          <span className="mvp-stat__label">{hasFYIData ? 'Total Spaces' : 'Guest Suites'}</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">
            {hasFYIData ? fyiSummary.counts.wellness : amenityCount}
          </span>
          <span className="mvp-stat__label">{hasFYIData ? 'Wellness' : 'Amenities'}</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">{summary?.propertyConfig.levels || 2}</span>
          <span className="mvp-stat__label">Levels</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">{summary?.propertyConfig.basement === 'Yes' ? '+B' : '—'}</span>
          <span className="mvp-stat__label">Basement</span>
        </div>
      </div>

      {/* Main Content Grid - KYC Summary (shown regardless of FYI status) */}
      <div className="mvp-grid">
        {/* Property Configuration */}
        <SectionCard title="Property Configuration" icon={Building}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">SF Constraint</span>
              <span className="mvp-field__value">{summary?.propertyConfig.sfCap}</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Basement</span>
              <span className="mvp-field__value">{summary?.propertyConfig.basement}</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Levels</span>
              <span className="mvp-field__value">{summary?.propertyConfig.levels}</span>
            </div>
          </div>
        </SectionCard>

        {/* Household */}
        <SectionCard title="Household Composition" icon={Users}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">Bedrooms</span>
              <span className="mvp-field__value">{summary?.household.totalBedrooms} total ({summary?.household.guestBedrooms} guest)</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Children</span>
              <span className="mvp-field__value">
                {summary?.household.childrenCount > 0 ? summary.household.childrenCount : 'None'}
              </span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">School-Age</span>
              <StatusBadge active={summary?.household.hasSchoolAge} label={summary?.household.hasSchoolAge ? 'Yes' : 'No'} />
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Pets</span>
              {summary?.household.hasPets ? (
                <span className="mvp-field__value mvp-field__value--small">{summary?.household.petsDescription}</span>
              ) : (
                <StatusBadge active={false} label="None" />
              )}
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Staffing</span>
              <span className="mvp-field__value mvp-field__value--small">
                {(summary?.household.staffing || 'none').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Lifestyle */}
        <SectionCard title="Lifestyle" icon={Home}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">Entertaining</span>
              <span className="mvp-field__value">{summary?.lifestyle.entertaining || 'Rare'}</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Formal Dining</span>
              <StatusBadge active={summary?.lifestyle.formalEntertaining} label={summary?.lifestyle.formalEntertaining ? 'Required' : 'Optional'} />
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Work From Home</span>
              <StatusBadge active={summary?.lifestyle.workFromHome} label={summary?.lifestyle.workFromHome ? 'Yes' : 'No'} />
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Late Night Media</span>
              <StatusBadge active={summary?.lifestyle.lateNightMedia} label={summary?.lifestyle.lateNightMedia ? 'Yes' : 'No'} />
            </div>
          </div>
        </SectionCard>

        {/* Wellness */}
        <SectionCard title="Wellness Program" icon={Dumbbell}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">Program Tier</span>
              <span className="mvp-field__value mvp-field__value--highlight">{summary?.wellness.program || 'None'}</span>
            </div>
          </div>
          <div className="mvp-badge-row">
            <StatusBadge active={summary?.wellness.gym} label="Gym" />
            <StatusBadge active={summary?.wellness.spa} label="Spa" />
            <StatusBadge active={summary?.wellness.pool} label="Pool" />
          </div>
        </SectionCard>

        {/* Amenities - Full Width */}
        <div className="mvp-card mvp-card--full">
          <div className="mvp-card__header">
            <Layers size={20} className="mvp-card__icon" />
            <h3 className="mvp-card__title">Selected Amenities</h3>
            <span className="mvp-card__count">{amenityCount} selected</span>
          </div>
          <div className="mvp-card__content">
            <div className="mvp-amenity-grid">
              <StatusBadge active={summary?.amenities.wine} label="Wine Room" />
              <StatusBadge active={summary?.amenities.media} label="Media Room" />
              <StatusBadge active={summary?.amenities.library} label="Library" />
              <StatusBadge active={summary?.amenities.familyRoom} label="Family Room" />
              <StatusBadge active={summary?.amenities.salon} label="Salon" />
              <StatusBadge active={summary?.amenities.gameRoom} label="Game Room" />
              <StatusBadge active={summary?.amenities.bar} label="Bar" />
              <StatusBadge active={summary?.amenities.bunkRoom} label="Bunk Room" />
              <StatusBadge active={summary?.amenities.breakfastNook} label="Breakfast Nook" />
              <StatusBadge active={summary?.amenities.outdoorEntertaining} label="Outdoor Entertaining" />
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data Toggle (for debugging) */}
      <div className="mvp-debug">
        <button 
          className="n4s-btn n4s-btn--ghost"
          onClick={() => setShowRawData(!showRawData)}
        >
          {showRawData ? 'Hide' : 'Show'} Raw Data
        </button>
        
        {showRawData && (
          <pre className="mvp-debug__code">
            {JSON.stringify({
              dataSource: hasFYIData ? 'FYI (LIVE)' : 'KYC (derived)',
              fyiProgram: fyiProgram ? {
                source: fyiProgram.source,
                timestamp: fyiProgram.timestamp,
                spaceCount: fyiProgram.totals?.spaceCount,
                totalSF: fyiProgram.totals?.totalConditionedSF
              } : null,
              briefInputs,
              tasteProfileP: tasteProfileP ? {
                clientId: tasteProfileP.clientId,
                completedAt: tasteProfileP.completedAt,
                profile: tasteProfileP.profile
              } : null,
              tasteProfileS: tasteProfileS ? {
                clientId: tasteProfileS.clientId,
                completedAt: tasteProfileS.completedAt,
                profile: tasteProfileS.profile
              } : null
            }, null, 2)}
          </pre>
        )}
      </div>

      {/* Next Steps - MVP Workflow */}
      <div className="mvp-next-steps">
        <h3>
          <ArrowRight size={20} />
          MVP P1-M Workflow
        </h3>
        <p>
          Answer layout questions, review the adjacency matrix comparison, run validation, then generate your brief.
        </p>
        <div className="mvp-next-steps__buttons">
          <button
            onClick={() => setViewMode('modules')}
            className="n4s-btn n4s-btn--secondary"
          >
            <BookOpen />
            Module Library
          </button>
          <button
            onClick={() => setViewMode('personalization')}
            className="n4s-btn n4s-btn--primary"
          >
            <Sparkles />
            Answer Layout Questions
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className="n4s-btn n4s-btn--secondary"
          >
            <GitCompare />
            View Adjacency Matrix
          </button>
          <button
            onClick={() => setViewMode('validation')}
            className="n4s-btn n4s-btn--secondary"
          >
            <Play />
            Run Validation
          </button>
          <button
            onClick={() => setViewMode('program')}
            className="n4s-btn n4s-btn--secondary"
          >
            <List />
            Program Summary
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className="n4s-btn n4s-btn--ghost"
          >
            <Database />
            Tier Data Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default MVPModule;
