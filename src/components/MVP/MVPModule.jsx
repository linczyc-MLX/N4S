import React, { useMemo, useState, useCallback } from 'react';
import {
  ClipboardCheck, CheckCircle2, XCircle,
  Home, Users, Dumbbell, LayoutGrid,
  Building, Layers, ArrowRight, Sparkles, BookOpen,
  GitCompare, Play, Database, List, FileText, FileDown,
  ChevronRight, ChevronDown, Save
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useKYCData } from '../../hooks/useKYCData';
import AdjacencyPersonalizationView from './AdjacencyPersonalizationView';
import ModuleLibraryView from './ModuleLibraryView';
import AdjacencyComparisonGrid from './AdjacencyComparisonGrid';
import ValidationResultsPanel from './ValidationResultsPanel';
import TierDataAdmin from './TierDataAdmin';
import ProgramSummaryView from './ProgramSummaryView';
import MVPDocumentation from './MVPDocumentation';
import { generateMVPReport } from './MVPReportGenerator';
import { 
  getPreset,
  applyDecisionsToMatrix,
  ADJACENCY_DECISIONS,
} from '../../mansion-program';
import { 
  transformKYCToMVPBrief, 
  getMVPBriefSummary, 
  countSelectedAmenities,
  transformFYIToMVPProgram,
  getFYIProgramSummary
} from '../../lib/mvp-bridge';

// ============================================
// TIER BENCHMARK DROPDOWN COMPONENT
// ============================================

const TierBenchmarkDropdown = ({ estimatedTier, isOpen, onToggle }) => {
  const tiers = [
    { id: '5K', label: '5K', range: '< 7,500 SF' },
    { id: '10K', label: '10K', range: '7,500 - 12,500 SF' },
    { id: '15K', label: '15K', range: '12,500 - 17,500 SF' },
    { id: '20K', label: '20K', range: '17,500+ SF' },
  ];

  return (
    <div className="tier-benchmark" style={{ position: 'relative' }}>
      <div
        className={`mvp-tier-badge mvp-tier-badge--${estimatedTier.color}`}
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <span className="mvp-tier-badge__overline">Benchmark Tier</span>
        <span className="mvp-tier-badge__tier">{estimatedTier.tier}</span>
        <span className="mvp-tier-badge__label">{estimatedTier.label}</span>
      </div>
      {isOpen && (
        <div className="tier-benchmark__dropdown">
          <h4 className="tier-benchmark__title">Tiered Benchmarks</h4>
          <p className="tier-benchmark__desc">
            MVP automatically detects your project tier based on target square footage and applies the appropriate
            benchmark relationships. Larger homes require more sophisticated adjacency logic to maintain privacy
            and operational efficiency at scale.
          </p>
          <div className="tier-benchmark__cards">
            {tiers.map(tier => (
              <div
                key={tier.id}
                className={`tier-benchmark__card ${estimatedTier.tier === tier.id ? 'tier-benchmark__card--active' : ''}`}
              >
                <span className="tier-benchmark__card-tier">{tier.label}</span>
                <span className="tier-benchmark__card-range">{tier.range}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
              <div
                className={`deployment-workflow__gate deployment-workflow__gate--${status} ${isExpanded ? 'deployment-workflow__gate--expanded' : ''}`}
                onClick={() => handleGateClick(gate.id)}
              >
                <div className="deployment-workflow__badge">{gate.id}</div>
                <div className="deployment-workflow__content">
                  <div className="deployment-workflow__name">{gate.name}</div>
                </div>
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

      {/* Full-width explanation bar below gates */}
      {expandedGate && (
        <div className={`deployment-workflow__explanation deployment-workflow__explanation--${getGateStatus(expandedGate)}`}>
          <div className="deployment-workflow__explanation-badge">{expandedGate}</div>
          <div className="deployment-workflow__explanation-text">
            {gates.find(g => g.id === expandedGate)?.description}
          </div>
          <ChevronDown size={20} className="deployment-workflow__collapse-icon" />
        </div>
      )}
    </div>
  );
};

// ============================================
// FYI SPACE PROGRAM DISPLAY COMPONENT
// ============================================

const FYISpaceProgramCard = ({ fyiProgram, fyiSummary }) => {
  const [expanded, setExpanded] = useState(false);
  const [zonesExpanded, setZonesExpanded] = useState(false);

  if (!fyiProgram || !fyiSummary) return null;

  const deltaColor = fyiSummary.totals.delta > 0 ? 'text-amber-600' :
                     fyiSummary.totals.delta < -500 ? 'text-red-600' : 'text-green-600';

  return (
    <div className="mvp-card mvp-card--full mvp-card--fyi">
      <div className="mvp-card__header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <LayoutGrid size={20} className="mvp-card__icon" />
        <h3 className="mvp-card__title">FYI Space Program</h3>
        <span className="mvp-card__summary-text">
          {fyiSummary.totals.totalSF.toLocaleString()} SF · {fyiSummary.counts.bedrooms} Bed · {fyiSummary.structures.length} Structure{fyiSummary.structures.length > 1 ? 's' : ''}
        </span>
        {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>
      {expanded && (
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
                {structure.byLevel && Object.keys(structure.byLevel).length > 0 && (
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
          onClick={() => setZonesExpanded(!zonesExpanded)}
          style={{ marginTop: '12px' }}
        >
          {zonesExpanded ? 'Hide' : 'Show'} Zone Details ({fyiSummary.zones.length} zones)
        </button>
        
        {zonesExpanded && (
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
      )}
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
  const { kycData, fyiData, activeRespondent, updateMVPChecklistItem, updateMVPModuleReviewStatus, hasUnsavedChanges, saveNow, isSaving, lastSaved } = useAppContext();
  const { preset, baseSF } = useKYCData();
  
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'modules' | 'personalization' | 'comparison' | 'validation' | 'program' | 'admin'
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Module review status from fyiData (persisted)
  const moduleReviewStatus = useMemo(() => {
    return fyiData?.mvpModuleReviewStatus || {};
  }, [fyiData?.mvpModuleReviewStatus]);
  
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

    // Stage C: Module reviews completed (8 modules)
    const reviewedCount = Object.values(moduleReviewStatus).filter(s => s?.reviewed).length;
    const modulesComplete = reviewedCount >= 8;
    const modulesReviewed = reviewedCount > 0;

    // Stage D: All adjacency decisions answered (or questionnaire marked complete)
    const decisionAnswers = fyiData?.mvpAdjacencyConfig?.decisionAnswers || {};
    const decisionCount = Object.keys(decisionAnswers).length;
    const questionnaireCompleted = !!fyiData?.mvpAdjacencyConfig?.questionnaireCompletedAt;
    const decisionsComplete = questionnaireCompleted || decisionCount >= 10;
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
  }, [kycData, fyiData, moduleChecklistState, moduleReviewStatus]);
  
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

  // ── Export MVP Report ─────────────────────────────────────────────────
  const handleExportReport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Resolve preset data
      const presetData = preset ? getPreset(preset) : null;
      if (!presetData) { alert('No tier data available. Please set a program tier in FYI.'); return; }

      // Build matrices
      const benchmarkMatrix = {};
      (presetData.adjacencyMatrix || []).forEach(adj => {
        if (adj.fromSpaceCode && adj.toSpaceCode) benchmarkMatrix[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
      });

      const savedDecisions = fyiData?.mvpAdjacencyConfig?.decisionAnswers || {};
      let proposedMatrix = { ...benchmarkMatrix };
      if (Object.keys(savedDecisions).length > 0) {
        const choices = Object.entries(savedDecisions).map(([decisionId, optionId]) => ({
          decisionId, selectedOptionId: optionId, isDefault: false, warnings: []
        }));
        const applied = applyDecisionsToMatrix(presetData.adjacencyMatrix, choices);
        proposedMatrix = {};
        applied.forEach(adj => {
          if (adj.fromSpaceCode && adj.toSpaceCode) proposedMatrix[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
        });
      }

      // Deviations
      const deviations = [];
      Object.keys(benchmarkMatrix).forEach(key => {
        const bm = benchmarkMatrix[key], pm = proposedMatrix[key];
        if (bm && pm && bm !== pm) {
          const [from, to] = key.split('-');
          deviations.push({ fromSpace: from, toSpace: to, desired: bm, proposed: pm });
        }
      });

      // Enabled bridges
      const enabledBridges = new Set();
      Object.entries(savedDecisions).forEach(([decisionId, optionId]) => {
        const dec = ADJACENCY_DECISIONS?.find(d => d.id === decisionId);
        if (dec) {
          const opt = dec.options.find(o => o.id === optionId);
          if (opt?.bridgeRequired) enabledBridges.add(opt.bridgeRequired);
        }
      });

      // Client info
      const pc = kycData?.principal?.portfolioContext || {};
      const clientName = [pc.principalFirstName, pc.principalLastName].filter(Boolean).join(' ') || 'Client';
      const secondaryName = [pc.secondaryFirstName, pc.secondaryLastName].filter(Boolean).join(' ') || null;

      await generateMVPReport({
        clientName,
        secondaryName,
        projectName,
        estimatedTier,
        presetData,
        fyiProgram,
        benchmarkMatrix,
        proposedMatrix,
        deviations,
        decisionAnswers: savedDecisions,
        decisions: ADJACENCY_DECISIONS || [],
        bridgeConfig: presetData.bridgeConfig || {},
        enabledBridges,
      });
    } catch (err) {
      console.error('[MVP Report] Export failed:', err);
      alert('Report export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  }, [preset, fyiData, kycData, activeRespondent, estimatedTier, projectName]);

  // ============================================
  // CONTENT RENDERER (enables split-screen docs)
  // ============================================
  const renderContent = () => {
    if (viewMode === 'modules') {
      return (
        <ModuleLibraryView
          onBack={() => setViewMode('overview')}
          onProceedToValidation={() => setViewMode('personalization')}
          gateStatus={gateStatus}
          checklistState={moduleChecklistState}
          onChecklistChange={handleModuleChecklistChange}
          moduleReviewStatus={moduleReviewStatus}
          onModuleReviewComplete={updateMVPModuleReviewStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={saveNow}
        />
      );
    }

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

    if (viewMode === 'program') {
      return <ProgramSummaryView onBack={() => setViewMode('overview')} />;
    }

    if (viewMode === 'comparison') {
      return (
        <AdjacencyComparisonGrid
          onBack={() => setViewMode('overview')}
          onRunValidation={() => setViewMode('validation')}
        />
      );
    }

    if (viewMode === 'validation') {
      return (
        <ValidationResultsPanel
          onBack={() => setViewMode('overview')}
          onViewMatrix={() => setViewMode('comparison')}
          onEditDecisions={() => setViewMode('personalization')}
        />
      );
    }

    if (viewMode === 'admin') {
      return <TierDataAdmin onBack={() => setViewMode('overview')} />;
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

    // Module review progress for overview display
    const reviewedModuleCount = Object.values(moduleReviewStatus).filter(s => s?.reviewed).length;

    // ============================================
    // OVERVIEW (default view)
    // ============================================
    return (
      <div className="mvp-module">
        {/* Top Action Bar — Save on right, matching KYC pattern */}
        <div className="kyc-module__top-bar">
          <div className="kyc-module__save-area">
            <button
              className={`btn ${hasUnsavedChanges ? 'btn--primary' : 'btn--success'}`}
              onClick={saveNow}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
            {lastSaved && !hasUnsavedChanges && (
              <span className="kyc-save-time">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Module Header — title + Export + Tier badge */}
        <div className="mvp-module__header">
          <div className="mvp-module__title-group">
            <h1 className="mvp-module__title">
              <ClipboardCheck size={28} />
              Mansion Validation Program
            </h1>
            <p className="mvp-module__subtitle">
              {hasFYIData ? (
                <>Space program from FYI</>
              ) : (
                <>Area program derived from KYC inputs • {activeRespondent.charAt(0).toUpperCase() + activeRespondent.slice(1)} respondent</>
              )}
            </p>
          </div>

          <div className="mvp-module__header-right">
            <button
              onClick={handleExportReport}
              disabled={isExporting || !preset}
              className="kyc-export-btn"
              title="Export comprehensive MVP Report PDF"
            >
              <FileDown size={16} className={isExporting ? 'spinning' : ''} />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
            <TierBenchmarkDropdown
              estimatedTier={estimatedTier}
              isOpen={tierDropdownOpen}
              onToggle={() => setTierDropdownOpen(!tierDropdownOpen)}
            />
          </div>
        </div>

        {/* DEPLOYMENT WORKFLOW */}
        <DeploymentWorkflow gateStatus={gateStatus} onNavigate={onNavigate} />

        {/* ITR #7: MVP Workflow — moved up, renamed */}
        <div className="mvp-workflow">
          <h3 className="mvp-workflow__title">
            <ArrowRight size={20} />
            MVP Workflow
          </h3>
          <p className="mvp-workflow__desc">
            Review modules, answer layout questions, review the adjacency matrix, and run validation.
          </p>
          {reviewedModuleCount > 0 && (
            <div className="mvp-workflow__review-tracker">
              <span className="mvp-workflow__review-count">
                {reviewedModuleCount} of 8 Modules Reviewed
              </span>
              <div className="mvp-workflow__review-bar">
                <div className="mvp-workflow__review-fill" style={{ width: `${(reviewedModuleCount / 8) * 100}%` }} />
              </div>
            </div>
          )}
          <div className="mvp-workflow__buttons">
            <button onClick={() => setViewMode('modules')} className={`n4s-btn n4s-btn--secondary ${gateStatus.C === 'complete' ? 'n4s-btn--done' : ''}`}>
              <BookOpen size={16} /> Module Library
              {gateStatus.C === 'complete' && <CheckCircle2 size={14} className="mvp-workflow__check" />}
            </button>
            <button onClick={() => setViewMode('personalization')} className={`n4s-btn n4s-btn--secondary ${gateStatus.D === 'complete' ? 'n4s-btn--done' : ''}`}>
              <Sparkles size={16} /> Answer Layout Questions
              {gateStatus.D === 'complete' && <CheckCircle2 size={14} className="mvp-workflow__check" />}
            </button>
            <button onClick={() => setViewMode('comparison')} className={`n4s-btn n4s-btn--secondary ${gateStatus.D === 'complete' ? 'n4s-btn--done' : ''}`}>
              <GitCompare size={16} /> View Adjacency Matrix
              {gateStatus.D === 'complete' && <CheckCircle2 size={14} className="mvp-workflow__check" />}
            </button>
            <button onClick={() => setViewMode('validation')} className={`n4s-btn n4s-btn--secondary ${gateStatus.E === 'complete' ? 'n4s-btn--done' : ''}`}>
              <Play size={16} /> Run Validation
              {gateStatus.E === 'complete' && <CheckCircle2 size={14} className="mvp-workflow__check" />}
            </button>
            <button onClick={() => setViewMode('program')} className={`n4s-btn n4s-btn--secondary ${gateStatus.B === 'complete' ? 'n4s-btn--done' : ''}`}>
              <List size={16} /> Program Summary
              {gateStatus.B === 'complete' && <CheckCircle2 size={14} className="mvp-workflow__check" />}
            </button>
            <button onClick={() => setViewMode('admin')} className="n4s-btn n4s-btn--ghost">
              <Database size={16} /> Tier Data Admin
            </button>
          </div>
        </div>

        {/* ITR #3: FYI SPACE PROGRAM — collapsible */}
        {hasFYIData ? (
          <FYISpaceProgramCard fyiProgram={fyiProgram} fyiSummary={fyiSummary} />
        ) : (
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
                  The space program will appear here as you make selections in FYI.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
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

        {/* KYC Summary Cards */}
        <div className="mvp-grid">
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
      </div>
    );
  };

  // ============================================
  // ITR #5: SPLIT-SCREEN LAYOUT — docs panel on right
  // ============================================
  // Context-aware docs tab based on current view
  const docsTab = (() => {
    switch (viewMode) {
      case 'modules': return 'reference';
      case 'personalization': return 'workflow';
      case 'comparison': return 'gates';
      case 'validation': return 'gates';
      default: return 'overview';
    }
  })();

  return (
    <div className={`mvp-layout ${showDocs ? 'mvp-layout--with-docs' : ''}`}>
      <div className="mvp-layout__main">
        {renderContent()}
      </div>
      {showDocs && (
        <div className="mvp-layout__docs">
          <MVPDocumentation
            onClose={onCloseDocs}
            initialTab={docsTab}
          />
        </div>
      )}
    </div>
  );
};

export default MVPModule;
