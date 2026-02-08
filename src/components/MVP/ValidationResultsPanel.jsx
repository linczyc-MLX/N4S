/**
 * ValidationResultsPanel
 * 
 * Displays validation results for the MVP adjacency decisions.
 * 
 * DATA FLOW:
 * 1. User answers Layout Questions → saved to fyiData.mvpAdjacencyConfig.decisionAnswers
 * 2. Each decision answer may enable bridges (via bridgeRequired field)
 * 3. ValidationResultsPanel derives:
 *    - REQUIRED bridges: From 15K benchmark preset (what this tier typically needs)
 *    - PRESENT bridges: From user's actual decision answers (what they selected)
 * 4. Red Flags are computed by checking adjacency matrix for violations
 * 
 * BRIDGES ARE DERIVED FROM DECISIONS, NOT MANUALLY TOGGLED
 * 
 * Follows N4S Brand Guide styling.
 */

import React, { useState, useMemo, useContext, useCallback } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Play, XCircle, Info, FileDown } from 'lucide-react';
import AppContext from '../../contexts/AppContext';
import { useKYCData } from '../../hooks/useKYCData';
import { generateMVPValidationReport } from './MVPValidationReport';
import { 
  getPreset,
  applyDecisionsToMatrix,
  ADJACENCY_DECISIONS
} from '../../mansion-program';

// N4S Brand Colors (from Brand Guide)
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
};

// Module definitions - which spaces belong to each validation module
const MODULES = [
  { id: 'module-01', name: 'Kitchen Rules Engine', spaces: ['KIT', 'CHEF', 'SCUL', 'BKF', 'DR'] },
  { id: 'module-02', name: 'Entertaining Spine', spaces: ['GR', 'DR', 'WINE', 'FOY', 'TERR'] },
  { id: 'module-03', name: 'Primary Suite Ecosystem', spaces: ['PRI', 'PRIBATH', 'PRICL', 'PRILOUNGE'] },
  { id: 'module-04', name: 'Guest Wing Logic', spaces: ['GUEST1', 'GUEST2', 'GUEST3', 'GST1', 'GST2'] },
  { id: 'module-05', name: 'Media & Acoustic Control', spaces: ['MEDIA', 'THR', 'FR'] },
  { id: 'module-06', name: 'Service Spine', spaces: ['SCUL', 'MUD', 'LND', 'MEP', 'GAR'] },
  { id: 'module-07', name: 'Wellness Program', spaces: ['GYM', 'SPA', 'POOL', 'WLINK', 'POOLSUP'] },
  { id: 'module-08', name: 'Staff Layer', spaces: ['STF', 'STFQ', 'OPSCORE'] },
];

// Bridge definitions with decision mappings
const BRIDGES = [
  { 
    id: 'butlerPantry', 
    name: 'Butler Pantry', 
    description: 'Service staging between kitchen and dining',
    enabledBy: ['kitchen-family-connect', 'dining-entertaining']
  },
  { 
    id: 'guestAutonomy', 
    name: 'Guest Autonomy', 
    description: 'Independent guest suite access',
    enabledBy: ['guest-independence']
  },
  { 
    id: 'soundLock', 
    name: 'Sound Lock', 
    description: 'Acoustic buffer for media spaces',
    enabledBy: ['media-bedroom-separation']
  },
  { 
    id: 'wetFeetIntercept', 
    name: 'Wet-Feet Intercept', 
    description: 'Pool to house transition zone',
    enabledBy: ['wellness-placement']
  },
  { 
    id: 'opsCore', 
    name: 'Ops Core', 
    description: 'Service entry and operations hub',
    enabledBy: ['service-access']
  },
];

// Red Flag definitions with actual matrix checks
const RED_FLAGS = [
  { 
    id: 'rf-1', 
    name: 'Guest → Primary Suite', 
    description: 'Primary suite should not be directly accessible from guest areas',
    check: (matrix) => {
      // PRI should be B or S from GUEST1
      const rel = matrix['GUEST1-PRI'] || matrix['PRI-GUEST1'];
      return rel === 'A' || rel === 'N';
    }
  },
  { 
    id: 'rf-2', 
    name: 'Delivery → Front of House', 
    description: 'Service/garage should not connect through formal areas',
    check: (matrix) => {
      // GAR should be S from FOY, GR, DR
      const garFoy = matrix['GAR-FOY'] || matrix['FOY-GAR'];
      const garGr = matrix['GAR-GR'] || matrix['GR-GAR'];
      return garFoy === 'A' || garFoy === 'N' || garGr === 'A';
    }
  },
  { 
    id: 'rf-3', 
    name: 'Media → Bedroom Bleed', 
    description: 'Media room should be acoustically separated from bedrooms',
    check: (matrix) => {
      // MEDIA should be S from PRI, GUEST1
      const mediaPri = matrix['MEDIA-PRI'] || matrix['PRI-MEDIA'];
      const mediaGuest = matrix['MEDIA-GUEST1'] || matrix['GUEST1-MEDIA'];
      return mediaPri === 'A' || mediaPri === 'N' || mediaGuest === 'A' || mediaGuest === 'N';
    }
  },
  { 
    id: 'rf-4', 
    name: 'Kitchen at Entry', 
    description: 'Kitchen should not be the first thing visible from entry',
    check: (matrix) => {
      // KIT should be B or S from FOY
      const kitFoy = matrix['KIT-FOY'] || matrix['FOY-KIT'];
      return kitFoy === 'A';
    }
  },
  { 
    id: 'rf-5', 
    name: 'Guest Through Kitchen', 
    description: 'Guest circulation should not route through kitchen work zones',
    check: (matrix) => {
      // GUEST should be S from KIT
      const guestKit = matrix['GUEST1-KIT'] || matrix['KIT-GUEST1'];
      return guestKit === 'A' || guestKit === 'N';
    }
  },
];

/**
 * Circular Score Component
 */
function ScoreCircle({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashoffset = circumference - progress;
  const scoreColor = score >= 80 ? COLORS.success : score >= 60 ? COLORS.warning : COLORS.error;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 600, color: COLORS.text }}>{score}</div>
        <div style={{ fontSize: '0.875rem', color: COLORS.textMuted }}>/ 100</div>
      </div>
    </div>
  );
}

/**
 * Progress Bar Component
 */
function ProgressBar({ score, threshold = 80 }) {
  const passed = score >= threshold;
  const fillColor = passed ? COLORS.success : COLORS.warning;
  
  return (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: COLORS.border,
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${score}%`,
        height: '100%',
        backgroundColor: fillColor,
        borderRadius: '4px',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

/**
 * Module Score Card
 */
function ModuleCard({ module, score, deviationCount = 0 }) {
  const passed = score >= 80;
  
  return (
    <div style={{
      backgroundColor: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} color={passed ? COLORS.success : COLORS.warning} />
          <span style={{ fontWeight: 500, color: COLORS.text }}>{module.name}</span>
        </div>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: 600, 
          color: passed ? COLORS.success : COLORS.warning 
        }}>
          {score} / 100
        </span>
      </div>
      <ProgressBar score={score} />
      {deviationCount > 0 && (
        <div style={{ fontSize: '0.75rem', color: COLORS.warning, marginTop: '0.5rem' }}>
          {deviationCount} deviation{deviationCount !== 1 ? 's' : ''} from benchmark
        </div>
      )}
    </div>
  );
}

/**
 * Bridge Card with actual status
 */
function BridgeCard({ bridge, required, present }) {
  let status, statusColor, statusBg;
  
  if (!required) {
    status = 'Not Required';
    statusColor = COLORS.textMuted;
    statusBg = '#f5f5f5';
  } else if (present) {
    status = 'Present';
    statusColor = COLORS.success;
    statusBg = '#e8f5e9';
  } else {
    status = 'Missing';
    statusColor = COLORS.error;
    statusBg = '#ffebee';
  }
  
  return (
    <div style={{
      backgroundColor: COLORS.surface,
      border: `1px solid ${required && !present ? COLORS.error : COLORS.border}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 500, color: COLORS.text }}>{bridge.name}</div>
          <div style={{ fontSize: '0.8125rem', color: COLORS.textMuted }}>{bridge.description}</div>
        </div>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: statusBg,
          color: statusColor,
        }}>
          {status}
        </span>
      </div>
      {required && !present && (
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.75rem', 
          color: COLORS.error,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Info size={12} />
          Enable via Layout Questions to add this bridge
        </div>
      )}
    </div>
  );
}

/**
 * Red Flag Card
 */
function RedFlagCard({ flag, triggered }) {
  return (
    <div style={{
      backgroundColor: triggered ? '#ffebee' : '#e8f5e9',
      border: `1px solid ${triggered ? COLORS.error : COLORS.success}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {triggered ? (
          <XCircle size={20} color={COLORS.error} style={{ flexShrink: 0 }} />
        ) : (
          <CheckCircle size={20} color={COLORS.success} style={{ flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontWeight: 500, color: COLORS.text }}>{flag.name}</div>
          <div style={{ fontSize: '0.8125rem', color: COLORS.textMuted }}>{flag.description}</div>
          {triggered && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.75rem', 
              color: COLORS.error,
              fontWeight: 500
            }}>
              ⚠ Resolve via Edit Decisions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main ValidationResultsPanel component
 */
export default function ValidationResultsPanel({ onBack, onViewMatrix, onEditDecisions }) {
  const [activeTab, setActiveTab] = useState('modules');
  const [hasRun, setHasRun] = useState(false);
  const [validationTime, setValidationTime] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Context
  const { fyiData, kycData, updateMVPAdjacencyConfig } = useContext(AppContext);
  const { preset, baseSF } = useKYCData();
  
  // Get preset data
  const presetData = useMemo(() => {
    try {
      return preset ? getPreset(preset) : null;
    } catch (e) {
      return null;
    }
  }, [preset]);

  // Get saved decision answers from user's Layout Questions
  const savedDecisions = useMemo(() => {
    return fyiData?.mvpAdjacencyConfig?.decisionAnswers || {};
  }, [fyiData?.mvpAdjacencyConfig?.decisionAnswers]);
  
  const hasDecisions = Object.keys(savedDecisions).length > 0;

  // Build benchmark matrix lookup
  const benchmarkMatrix = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return {};
    const lookup = {};
    presetData.adjacencyMatrix.forEach(adj => {
      if (adj.fromSpaceCode && adj.toSpaceCode) {
        lookup[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
      }
    });
    return lookup;
  }, [presetData]);

  // Build proposed matrix from user's decisions
  const proposedMatrix = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return benchmarkMatrix;
    if (!hasDecisions) return benchmarkMatrix; // No decisions = use benchmark
    
    const choices = Object.entries(savedDecisions).map(([decisionId, optionId]) => ({
      decisionId,
      selectedOptionId: optionId,
      isDefault: false,
      warnings: []
    }));
    
    const applied = applyDecisionsToMatrix(presetData.adjacencyMatrix, choices);
    const lookup = {};
    applied.forEach(adj => {
      if (adj.fromSpaceCode && adj.toSpaceCode) {
        lookup[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
      }
    });
    return lookup;
  }, [presetData, savedDecisions, hasDecisions, benchmarkMatrix]);

  // Find deviations
  const deviations = useMemo(() => {
    const devs = [];
    Object.keys(benchmarkMatrix).forEach(key => {
      const benchmarkRel = benchmarkMatrix[key];
      const proposedRel = proposedMatrix[key];
      if (benchmarkRel && proposedRel && benchmarkRel !== proposedRel) {
        const [from, to] = key.split('-');
        devs.push({ fromSpace: from, toSpace: to, desired: benchmarkRel, proposed: proposedRel });
      }
    });
    return devs;
  }, [benchmarkMatrix, proposedMatrix]);

  // Derive enabled bridges from user's actual decision selections
  const enabledBridges = useMemo(() => {
    if (!hasDecisions) return new Set();
    
    const enabled = new Set();
    
    // Check each saved decision for bridgeRequired
    Object.entries(savedDecisions).forEach(([decisionId, optionId]) => {
      // Find the decision
      const decision = ADJACENCY_DECISIONS?.find(d => d.id === decisionId);
      if (decision) {
        // Find the selected option
        const option = decision.options.find(o => o.id === optionId);
        if (option?.bridgeRequired) {
          enabled.add(option.bridgeRequired);
        }
      }
    });
    
    return enabled;
  }, [savedDecisions, hasDecisions]);

  // Bridge status - compare benchmark requirement vs user's selections
  const bridgeStatus = useMemo(() => {
    return BRIDGES.map(bridge => ({
      ...bridge,
      required: presetData?.bridgeConfig?.[bridge.id] || false,
      present: enabledBridges.has(bridge.id),
    }));
  }, [presetData, enabledBridges]);

  // Red flag detection - check actual adjacency matrix
  const redFlagStatus = useMemo(() => {
    return RED_FLAGS.map(flag => ({
      ...flag,
      triggered: flag.check(proposedMatrix),
    }));
  }, [proposedMatrix]);

  // Calculate module scores
  const moduleScores = useMemo(() => {
    return MODULES.map(mod => {
      const moduleDeviations = deviations.filter(dev => 
        mod.spaces.includes(dev.fromSpace) || mod.spaces.includes(dev.toSpace)
      );
      
      let benchmarkCount = 0;
      Object.keys(benchmarkMatrix).forEach(key => {
        const [from, to] = key.split('-');
        if (mod.spaces.includes(from) || mod.spaces.includes(to)) {
          benchmarkCount++;
        }
      });
      
      const deviationPenalty = benchmarkCount > 0 
        ? (moduleDeviations.length / benchmarkCount) * 50
        : 0;
      const score = Math.max(0, Math.round(100 - deviationPenalty));
      
      return {
        ...mod,
        score,
        passed: score >= 80,
        deviationCount: moduleDeviations.length,
      };
    });
  }, [deviations, benchmarkMatrix]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (moduleScores.length === 0) return 100;
    const base = Math.round(moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length);
    // Penalty for triggered red flags
    const flagPenalty = redFlagStatus.filter(rf => rf.triggered).length * 5;
    return Math.max(0, base - flagPenalty);
  }, [moduleScores, redFlagStatus]);

  // Run validation
  const handleRunValidation = useCallback(() => {
    setHasRun(true);
    setValidationTime(new Date().toLocaleString());
    
    if (updateMVPAdjacencyConfig) {
      updateMVPAdjacencyConfig({
        validationRunAt: new Date().toISOString(),
        validationResults: {
          overallScore,
          moduleScores: moduleScores.map(m => ({ id: m.id, score: m.score })),
          redFlagsTriggered: redFlagStatus.filter(rf => rf.triggered).map(rf => rf.id),
          bridgesEnabled: Array.from(enabledBridges),
        }
      });
    }
  }, [overallScore, moduleScores, redFlagStatus, enabledBridges, updateMVPAdjacencyConfig]);

  // Export compact validation PDF
  const handleExportValidation = useCallback(async () => {
    setIsExporting(true);
    try {
      const pc = kycData?.principal?.portfolioContext || {};
      const clientName = [pc.principalFirstName, pc.principalLastName].filter(Boolean).join(' ') || 'Client';
      const projectName = kycData?.principal?.projectParameters?.projectName || 'Project';

      // Determine tier label
      const tierLabel = preset === '20k' ? { tier: '20K', label: 'Estate' }
        : preset === '15k' ? { tier: '15K', label: 'Grand' }
        : preset === '10k' ? { tier: '10K', label: 'Signature' }
        : { tier: preset || 'Custom', label: 'Custom' };

      await generateMVPValidationReport({
        clientName,
        projectName,
        estimatedTier: tierLabel,
        presetData,
        benchmarkMatrix,
        proposedMatrix,
        deviations,
        bridgeConfig: presetData?.bridgeConfig || {},
        enabledBridges,
      });
    } catch (err) {
      console.error('[Validation Report] Export failed:', err);
      alert('Validation report export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  }, [kycData, preset, presetData, benchmarkMatrix, proposedMatrix, deviations, enabledBridges]);

  const triggeredRedFlags = redFlagStatus.filter(rf => rf.triggered);
  const missingBridges = bridgeStatus.filter(b => b.required && !b.present);
  const allPassed = triggeredRedFlags.length === 0 && overallScore >= 80;

  return (
    <div className="vrp-container">
      {/* Header */}
      <div className="vrp-header">
        <button className="vrp-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to MVP Overview
        </button>
        <div className="vrp-title-row">
          <h1 className="vrp-title">Validation Results</h1>
          {preset && <span className="vrp-tier-badge">{preset.toUpperCase()} TIER</span>}
        </div>
        {baseSF && (
          <p className="vrp-subtitle">Target: {baseSF.toLocaleString()} SF</p>
        )}
      </div>

      <div className="vrp-content">
        {/* No decisions warning */}
        {!hasDecisions && (
          <div className="vrp-warning-card">
            <AlertTriangle size={20} color={COLORS.warning} />
            <div>
              <strong>No Layout Decisions Found</strong>
              <p>Complete the Layout Questions to personalize your adjacency matrix. Currently showing benchmark defaults.</p>
              <button className="vrp-link-btn" onClick={onEditDecisions}>
                Answer Layout Questions →
              </button>
            </div>
          </div>
        )}

        {/* Run Validation Button */}
        {!hasRun && (
          <div className="vrp-run-card">
            <button className="vrp-run-btn" onClick={handleRunValidation}>
              <Play size={20} />
              Run Validation
            </button>
            <p className="vrp-run-hint">
              Validate your adjacency selections against the N4S {preset?.toUpperCase()} benchmark.
            </p>
          </div>
        )}

        {/* Results Card */}
        {hasRun && (
          <div className="vrp-results-card">
            {/* Score Section */}
            <div className="vrp-score-section">
              <ScoreCircle score={overallScore} />
              <div className="vrp-score-info">
                <span className={`vrp-pass-badge ${allPassed ? 'pass' : 'warning'}`}>
                  {allPassed ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  {allPassed ? 'Pass' : 'Review Needed'}
                </span>
                <div className="vrp-score-details">
                  {allPassed ? (
                    <>
                      <CheckCircle size={16} color={COLORS.success} />
                      <span>All gates passed</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} color={COLORS.warning} />
                      <span>Some items need attention</span>
                    </>
                  )}
                </div>
                <div className="vrp-score-meta">
                  {triggeredRedFlags.length} red flag{triggeredRedFlags.length !== 1 ? 's' : ''}, 
                  {' '}{deviations.length} deviation{deviations.length !== 1 ? 's' : ''}
                </div>
                {validationTime && (
                  <div className="vrp-timestamp">Validated at {validationTime}</div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="vrp-tabs">
              <button 
                className={`vrp-tab ${activeTab === 'redflags' ? 'active' : ''}`}
                onClick={() => setActiveTab('redflags')}
              >
                Red Flags ({triggeredRedFlags.length})
              </button>
              <button 
                className={`vrp-tab ${activeTab === 'bridges' ? 'active' : ''}`}
                onClick={() => setActiveTab('bridges')}
              >
                Bridges ({enabledBridges.size}/{bridgeStatus.filter(b => b.required).length})
              </button>
              <button 
                className={`vrp-tab ${activeTab === 'modules' ? 'active' : ''}`}
                onClick={() => setActiveTab('modules')}
              >
                Module Scores
              </button>
            </div>

            {/* Tab Content */}
            <div className="vrp-tab-content">
              {activeTab === 'redflags' && (
                <div>
                  {redFlagStatus.length === 0 ? (
                    <p className="vrp-empty">No red flag rules defined.</p>
                  ) : (
                    redFlagStatus.map(flag => (
                      <RedFlagCard 
                        key={flag.id} 
                        flag={flag} 
                        triggered={flag.triggered} 
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'bridges' && (
                <div>
                  {bridgeStatus.map(bridge => (
                    <BridgeCard 
                      key={bridge.id} 
                      bridge={bridge} 
                      required={bridge.required}
                      present={bridge.present}
                    />
                  ))}
                  {missingBridges.length > 0 && (
                    <div className="vrp-bridge-hint">
                      <Info size={14} />
                      <span>
                        Missing bridges can be enabled by selecting appropriate options in Layout Questions.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'modules' && (
                <div>
                  {moduleScores.map(module => (
                    <ModuleCard 
                      key={module.id} 
                      module={module}
                      score={module.score}
                      deviationCount={module.deviationCount}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="vrp-actions">
              <button
                className="vrp-secondary-btn"
                onClick={handleExportValidation}
                disabled={isExporting}
                title="Export Validation Summary PDF"
              >
                <FileDown size={16} className={isExporting ? 'spinning' : ''} />
                {isExporting ? 'Exporting...' : 'Export Validation PDF'}
              </button>
              {onViewMatrix && (
                <button className="vrp-secondary-btn" onClick={onViewMatrix}>
                  View Adjacency Matrix
                </button>
              )}
              {onEditDecisions && (
                <button className="vrp-primary-btn" onClick={onEditDecisions}>
                  Edit Decisions
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{componentStyles}</style>
    </div>
  );
}

// CSS following N4S Brand Guide
const componentStyles = `
.vrp-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.vrp-header {
  background-color: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem;
}

.vrp-back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.15s ease;
}

.vrp-back-btn:hover {
  border-color: ${COLORS.navy};
  color: ${COLORS.navy};
}

.vrp-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vrp-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0;
}

.vrp-tier-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: ${COLORS.navy};
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.vrp-subtitle {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin-top: 0.25rem;
}

.vrp-content {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.vrp-warning-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #fff8e1;
  border: 1px solid ${COLORS.warning};
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.vrp-warning-card strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.vrp-warning-card p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0 0 0.5rem 0;
}

.vrp-link-btn {
  background: none;
  border: none;
  color: ${COLORS.navy};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.vrp-link-btn:hover {
  text-decoration: underline;
}

.vrp-run-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.vrp-run-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background-color: ${COLORS.navy};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vrp-run-btn:hover {
  opacity: 0.9;
}

.vrp-run-hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
}

.vrp-results-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
}

.vrp-score-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  margin-bottom: 1.5rem;
}

.vrp-score-info {
  flex: 1;
}

.vrp-pass-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.vrp-pass-badge.pass {
  background-color: #e8f5e9;
  color: ${COLORS.success};
}

.vrp-pass-badge.warning {
  background-color: #fff3e0;
  color: ${COLORS.warning};
}

.vrp-score-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.vrp-score-meta {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.vrp-timestamp {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  margin-top: 0.5rem;
}

.vrp-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  overflow: hidden;
}

.vrp-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: ${COLORS.background};
  border: none;
  border-right: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  transition: all 0.15s ease;
}

.vrp-tab:last-child {
  border-right: none;
}

.vrp-tab:hover {
  background-color: ${COLORS.surface};
}

.vrp-tab.active {
  background-color: ${COLORS.surface};
  color: ${COLORS.navy};
  box-shadow: inset 0 -2px 0 ${COLORS.navy};
}

.vrp-tab-content {
  min-height: 300px;
}

.vrp-empty {
  text-align: center;
  color: ${COLORS.textMuted};
  padding: 2rem;
}

.vrp-bridge-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 0.8125rem;
  color: #1565c0;
  margin-top: 0.5rem;
}

.vrp-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${COLORS.border};
}

.vrp-secondary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: ${COLORS.navy};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vrp-secondary-btn:hover {
  border-color: ${COLORS.navy};
}

.vrp-primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background-color: ${COLORS.navy};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vrp-primary-btn:hover {
  opacity: 0.9;
}
`;
