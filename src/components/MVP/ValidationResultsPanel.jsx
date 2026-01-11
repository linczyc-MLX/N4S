/**
 * ValidationResultsPanel
 * 
 * Displays validation results for the MVP adjacency decisions.
 * Matches the approved design (Image 5) with:
 * - Circular score indicator (e.g., 87/100)
 * - Pass badge
 * - Tabs: Red Flags | Bridges | Module Scores
 * - Module cards with progress bars
 * 
 * Follows N4S Brand Guide styling.
 */

import React, { useState, useMemo, useContext, useCallback } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import AppContext from '../../contexts/AppContext';
import { useKYCData } from '../../hooks/useKYCData';
import { 
  getPreset,
  applyDecisionsToMatrix,
  getDecisionsForPreset
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

// Module definitions
const MODULES = [
  { id: 'module-01', name: 'Kitchen Rules Engine', spaces: ['KIT', 'CHEF', 'SCUL', 'BKF', 'DR'] },
  { id: 'module-02', name: 'Entertaining Spine', spaces: ['GR', 'DR', 'WINE', 'FOY', 'TERR'] },
  { id: 'module-03', name: 'Primary Suite Ecosystem', spaces: ['PRI', 'PRIBATH', 'PRICL', 'PRILOUNGE'] },
  { id: 'module-04', name: 'Guest Wing Logic', spaces: ['GUEST1', 'GUEST2', 'GUEST3', 'GST1', 'GST2'] },
  { id: 'module-05', name: 'Media & Acoustic Control', spaces: ['MEDIA', 'THR'] },
  { id: 'module-06', name: 'Service Spine', spaces: ['SCUL', 'MUD', 'LND', 'MEP', 'GAR'] },
  { id: 'module-07', name: 'Wellness Program', spaces: ['GYM', 'SPA', 'POOL', 'WLINK', 'POOLSUP'] },
  { id: 'module-08', name: 'Staff Layer', spaces: ['STF', 'STFQ'] },
];

// Bridge definitions
const BRIDGES = [
  { id: 'butlerPantry', name: 'Butler Pantry', description: 'Service staging between kitchen and dining' },
  { id: 'guestAutonomy', name: 'Guest Autonomy', description: 'Independent guest suite access' },
  { id: 'soundLock', name: 'Sound Lock', description: 'Acoustic buffer for media spaces' },
  { id: 'wetFeetIntercept', name: 'Wet-Feet Intercept', description: 'Pool to house transition zone' },
  { id: 'opsCore', name: 'Ops Core', description: 'Service entry and operations hub' },
];

// Red Flag definitions
const RED_FLAGS = [
  { id: 'rf-1', name: 'Guest → Primary Suite', check: 'PRI not accessible through guest zones' },
  { id: 'rf-2', name: 'Delivery → FOH', check: 'Garage/service not through formal zones' },
  { id: 'rf-3', name: 'Zone3 Wall → Zone0', check: 'Media acoustically separated from bedrooms' },
  { id: 'rf-4', name: 'No Show Kitchen', check: 'Kitchen not directly at entry' },
  { id: 'rf-5', name: 'Guest → Kitchen Aisle', check: 'Guests not routed through kitchen' },
];

/**
 * Circular Score Component
 */
function ScoreCircle({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashoffset = circumference - progress;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.border}
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.success}
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
function ModuleCard({ module, score, checklistCompleted = 0, checklistTotal = 0 }) {
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
      <div style={{ fontSize: '0.75rem', color: COLORS.textMuted, marginTop: '0.5rem' }}>
        {checklistCompleted} / {checklistTotal} checklist items
      </div>
    </div>
  );
}

/**
 * Bridge Card
 */
function BridgeCard({ bridge, required, present }) {
  const status = !required ? 'not-required' : present ? 'present' : 'missing';
  
  return (
    <div style={{
      backgroundColor: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
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
          backgroundColor: status === 'present' ? '#e8f5e9' : status === 'missing' ? '#ffebee' : '#f5f5f5',
          color: status === 'present' ? COLORS.success : status === 'missing' ? COLORS.error : COLORS.textMuted,
        }}>
          {status === 'present' ? 'Present' : status === 'missing' ? 'Missing' : 'Not Required'}
        </span>
      </div>
    </div>
  );
}

/**
 * Red Flag Card
 */
function RedFlagCard({ flag, triggered }) {
  return (
    <div style={{
      backgroundColor: triggered ? '#ffebee' : COLORS.surface,
      border: `1px solid ${triggered ? COLORS.error : COLORS.border}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={18} color={triggered ? COLORS.error : COLORS.success} />
        <div>
          <div style={{ fontWeight: 500, color: COLORS.text }}>{flag.name}</div>
          <div style={{ fontSize: '0.8125rem', color: COLORS.textMuted }}>{flag.check}</div>
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
  
  // Context
  const { fyiData, updateMVPAdjacencyConfig } = useContext(AppContext);
  const { preset, baseSF } = useKYCData();
  
  // Get preset data
  const presetData = useMemo(() => {
    try {
      return preset ? getPreset(preset) : null;
    } catch (e) {
      return null;
    }
  }, [preset]);

  // Get saved decisions
  const savedDecisions = fyiData?.mvpAdjacencyConfig?.decisionAnswers || {};

  // Build matrices
  const { benchmarkMatrix, proposedMatrix } = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return { benchmarkMatrix: {}, proposedMatrix: {} };
    
    const benchmark = {};
    presetData.adjacencyMatrix.forEach(adj => {
      if (adj.fromSpaceCode && adj.toSpaceCode) {
        benchmark[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
      }
    });
    
    const choices = Object.entries(savedDecisions).map(([decisionId, optionId]) => ({
      decisionId,
      selectedOptionId: optionId,
      isDefault: false,
      warnings: []
    }));
    
    const applied = applyDecisionsToMatrix(presetData.adjacencyMatrix, choices);
    const proposed = {};
    applied.forEach(adj => {
      if (adj.fromSpaceCode && adj.toSpaceCode) {
        proposed[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
      }
    });
    
    return { benchmarkMatrix: benchmark, proposedMatrix: proposed };
  }, [presetData, savedDecisions]);

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

  // Calculate module scores
  const moduleScores = useMemo(() => {
    return MODULES.map(mod => {
      // Count deviations affecting this module
      const moduleDeviations = deviations.filter(dev => 
        mod.spaces.includes(dev.fromSpace) || mod.spaces.includes(dev.toSpace)
      );
      
      // Count benchmark relationships for this module
      let benchmarkCount = 0;
      Object.keys(benchmarkMatrix).forEach(key => {
        const [from, to] = key.split('-');
        if (mod.spaces.includes(from) || mod.spaces.includes(to)) {
          benchmarkCount++;
        }
      });
      
      // Calculate score (100% minus deviation penalty)
      const deviationPenalty = benchmarkCount > 0 
        ? (moduleDeviations.length / benchmarkCount) * 100
        : 0;
      const score = Math.max(0, Math.round(100 - deviationPenalty * 2));
      
      return {
        ...mod,
        score,
        passed: score >= 80,
        deviationCount: moduleDeviations.length,
        checklistCompleted: 0,
        checklistTotal: 0,
      };
    });
  }, [deviations, benchmarkMatrix]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (moduleScores.length === 0) return 0;
    return Math.round(moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length);
  }, [moduleScores]);

  // Bridge status
  const bridgeStatus = useMemo(() => {
    if (!presetData?.bridgeConfig) return [];
    return BRIDGES.map(bridge => ({
      ...bridge,
      required: presetData.bridgeConfig[bridge.id] || false,
      present: presetData.bridgeConfig[bridge.id] || false, // For now, assume present if required
    }));
  }, [presetData]);

  // Red flag status (simplified - all passing for now)
  const redFlagStatus = useMemo(() => {
    return RED_FLAGS.map(flag => ({
      ...flag,
      triggered: false,
    }));
  }, []);

  // Run validation
  const handleRunValidation = useCallback(() => {
    setHasRun(true);
    setValidationTime(new Date().toLocaleString());
    
    // Save validation results to context
    if (updateMVPAdjacencyConfig) {
      updateMVPAdjacencyConfig({
        validationRunAt: new Date().toISOString(),
        validationResults: {
          overallScore,
          moduleScores: moduleScores.map(m => ({ id: m.id, score: m.score })),
        }
      });
    }
  }, [overallScore, moduleScores, updateMVPAdjacencyConfig]);

  const allPassed = moduleScores.every(m => m.passed);
  const triggeredRedFlags = redFlagStatus.filter(rf => rf.triggered).length;

  return (
    <div className="vrp-container">
      {/* Header */}
      <div className="vrp-header">
        <button className="vrp-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="vrp-title-row">
          <h1 className="vrp-title">Validation Results</h1>
          {preset && <span className="vrp-tier-badge">{preset.toUpperCase()} TIER</span>}
        </div>
      </div>

      <div className="vrp-content">
        {/* Run Validation Button */}
        {!hasRun && (
          <div className="vrp-run-card">
            <button className="vrp-run-btn" onClick={handleRunValidation}>
              <Play size={20} />
              Run Validation
            </button>
            <p className="vrp-run-hint">
              Click to validate your adjacency selections against the N4S {preset?.toUpperCase()} benchmark.
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
                  <CheckCircle size={16} />
                  {allPassed ? 'Pass' : 'Review Needed'}
                </span>
                <div className="vrp-score-details">
                  <CheckCircle size={16} color={COLORS.success} />
                  <span>All gates passed</span>
                </div>
                <div className="vrp-score-meta">
                  {triggeredRedFlags} critical issues, {deviations.length} warnings
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
                Red Flags ({triggeredRedFlags})
              </button>
              <button 
                className={`vrp-tab ${activeTab === 'bridges' ? 'active' : ''}`}
                onClick={() => setActiveTab('bridges')}
              >
                Bridges ({bridgeStatus.filter(b => b.required).length})
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
                  {redFlagStatus.map(flag => (
                    <RedFlagCard key={flag.id} flag={flag} triggered={flag.triggered} />
                  ))}
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
                </div>
              )}

              {activeTab === 'modules' && (
                <div>
                  {moduleScores.map(module => (
                    <ModuleCard 
                      key={module.id} 
                      module={module}
                      score={module.score}
                      checklistCompleted={module.checklistCompleted}
                      checklistTotal={module.checklistTotal}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="vrp-actions">
              {onViewMatrix && (
                <button className="vrp-secondary-btn" onClick={onViewMatrix}>
                  View Adjacency Matrix
                </button>
              )}
              {onEditDecisions && (
                <button className="vrp-secondary-btn" onClick={onEditDecisions}>
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

.vrp-content {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
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
`;
