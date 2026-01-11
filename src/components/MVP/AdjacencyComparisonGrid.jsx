/**
 * AdjacencyComparisonGrid
 * 
 * Read-only adjacency matrix grid with Desired/Proposed toggle.
 * Shows N4S benchmark (Desired) vs client's selections (Proposed).
 * Follows N4S Brand Guide styling.
 * 
 * NO interactive editing - grid cells are display-only.
 * Client makes decisions via the questionnaire, not by clicking cells.
 */

import React, { useState, useMemo, useContext } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
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

// Relationship display config (matching BriefingBuilder matrix)
const RELATIONSHIP_CONFIG = {
  A: { label: 'A', color: '#4caf50', description: 'Adjacent - Direct connection required' },
  N: { label: 'N', color: '#2196f3', description: 'Near - Close proximity needed' },
  B: { label: 'B', color: '#ff9800', description: 'Buffered - Buffer zone required' },
  S: { label: 'S', color: '#f44336', description: 'Separate - Isolation required' },
};

/**
 * Main AdjacencyComparisonGrid component
 */
export default function AdjacencyComparisonGrid({ onBack, onRunValidation }) {
  // State
  const [view, setView] = useState('desired'); // 'desired' | 'proposed'
  const [filterZone, setFilterZone] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  // Context
  const { fyiData } = useContext(AppContext);
  const { preset, baseSF } = useKYCData();
  
  // Get preset data
  const presetData = useMemo(() => {
    try {
      return preset ? getPreset(preset) : null;
    } catch (e) {
      console.error('Failed to get preset:', e);
      return null;
    }
  }, [preset]);

  // Get decisions for this preset
  const decisions = useMemo(() => {
    if (!preset) return [];
    try {
      return getDecisionsForPreset(preset);
    } catch (e) {
      return [];
    }
  }, [preset]);

  // Get saved decision answers
  const savedDecisions = fyiData?.mvpAdjacencyConfig?.decisionAnswers || {};

  // Build benchmark (desired) matrix lookup
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

  // Build proposed matrix with client decisions applied
  const proposedMatrix = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return {};
    
    // Build choices array from saved decisions
    const choices = Object.entries(savedDecisions).map(([decisionId, optionId]) => ({
      decisionId,
      selectedOptionId: optionId,
      isDefault: false,
      warnings: []
    }));
    
    // Apply decisions to get proposed matrix
    const applied = applyDecisionsToMatrix(presetData.adjacencyMatrix, choices);
    
    const lookup = {};
    applied.forEach(adj => {
      if (adj.fromSpaceCode && adj.toSpaceCode) {
        lookup[`${adj.fromSpaceCode}-${adj.toSpaceCode}`] = adj.relationship;
      }
    });
    return lookup;
  }, [presetData, savedDecisions]);

  // Get current matrix based on view
  const currentMatrix = view === 'desired' ? benchmarkMatrix : proposedMatrix;

  // Find deviations between benchmark and proposed
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

  // Extract unique space codes from matrix
  const spaceCodes = useMemo(() => {
    const codes = new Set();
    Object.keys(benchmarkMatrix).forEach(key => {
      const [from, to] = key.split('-');
      codes.add(from);
      codes.add(to);
    });
    return Array.from(codes).sort();
  }, [benchmarkMatrix]);

  // Filter spaces
  const filteredSpaces = useMemo(() => {
    return spaceCodes;
  }, [spaceCodes]);

  // Check if a cell is a deviation
  const isDeviation = (from, to) => {
    return deviations.some(d => d.fromSpace === from && d.toSpace === to);
  };

  if (!presetData) {
    return (
      <div className="acg-container">
        <div className="acg-header">
          <button className="acg-back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="acg-title">Adjacency Matrix</h1>
        </div>
        <div className="acg-content">
          <div className="acg-card">
            <p>No preset data available. Please complete the FYI module first.</p>
          </div>
        </div>
        <style>{componentStyles}</style>
      </div>
    );
  }

  return (
    <div className="acg-container">
      {/* Header */}
      <div className="acg-header">
        <button className="acg-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="acg-title-row">
          <h1 className="acg-title">Adjacency Matrix</h1>
          <span className="acg-tier-badge">{preset?.toUpperCase()} TIER</span>
        </div>
        <p className="acg-subtitle">
          Zone adjacency relationships for mansion program validation
          {baseSF && ` • ${baseSF.toLocaleString()} SF Target`}
        </p>
      </div>

      <div className="acg-content">
        <div className="acg-card">
          {/* Toggle and Legend Row */}
          <div className="acg-controls-row">
            <div className="acg-legend">
              {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
                <div key={key} className="acg-legend-item">
                  <span 
                    className="acg-legend-badge" 
                    style={{ backgroundColor: config.color }}
                  >
                    {config.label}
                  </span>
                  <span className="acg-legend-text">{config.description}</span>
                </div>
              ))}
            </div>

            {/* Toggle Switch - Matching Image 4 style */}
            <div className="acg-toggle-wrapper">
              <div className="acg-toggle">
                <button
                  className={`acg-toggle-option ${view === 'desired' ? 'active' : ''}`}
                  onClick={() => setView('desired')}
                >
                  Desired
                </button>
                <button
                  className={`acg-toggle-option ${view === 'proposed' ? 'active' : ''}`}
                  onClick={() => setView('proposed')}
                >
                  Achieved
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="acg-filters-row">
            <label className="acg-filter">
              <span>Filter by Zone:</span>
              <select value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                <option value="all">All Zones</option>
              </select>
            </label>
            <label className="acg-filter">
              <span>Filter by Level:</span>
              <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="all">All Levels</option>
              </select>
            </label>
            <span className="acg-space-count">
              Showing {filteredSpaces.length} of {filteredSpaces.length} spaces
            </span>
          </div>

          {/* Matrix Table */}
          <div className="acg-matrix-wrapper">
            <table className="acg-matrix-table">
              <thead>
                <tr>
                  <th className="acg-corner-cell"></th>
                  {filteredSpaces.map(code => (
                    <th key={code} className="acg-header-cell">{code}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSpaces.map(fromCode => (
                  <tr key={fromCode}>
                    <th className="acg-row-header">{fromCode}</th>
                    {filteredSpaces.map(toCode => {
                      if (fromCode === toCode) {
                        return <td key={`${fromCode}-${toCode}`} className="acg-cell acg-cell--diagonal">–</td>;
                      }
                      const key = `${fromCode}-${toCode}`;
                      const relationship = currentMatrix[key];
                      const deviation = view === 'proposed' && isDeviation(fromCode, toCode);
                      const config = relationship ? RELATIONSHIP_CONFIG[relationship] : null;
                      
                      return (
                        <td 
                          key={`${fromCode}-${toCode}`} 
                          className={`acg-cell ${deviation ? 'acg-cell--deviation' : ''}`}
                          style={config ? { backgroundColor: config.color, color: '#fff' } : {}}
                          title={config?.description}
                        >
                          {relationship || '·'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deviation Summary */}
          {deviations.length > 0 && (
            <div className="acg-deviation-summary">
              <div className="acg-deviation-header">
                <AlertTriangle size={18} color={COLORS.warning} />
                <span>
                  {deviations.length} Deviation{deviations.length !== 1 ? 's' : ''} from N4S Standard
                </span>
              </div>
              <ul className="acg-deviation-list">
                {deviations.slice(0, 5).map((dev, idx) => (
                  <li key={idx}>
                    <strong>{dev.fromSpace} → {dev.toSpace}:</strong>{' '}
                    Desired <code>{dev.desired}</code>, Proposed <code>{dev.proposed}</code>
                  </li>
                ))}
                {deviations.length > 5 && (
                  <li className="acg-deviation-more">...and {deviations.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="acg-action-row">
            <span className="acg-note">
              This grid is read-only. To modify adjacencies, use the Layout Questionnaire.
            </span>
            {onRunValidation && (
              <button className="acg-primary-btn" onClick={onRunValidation}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Validation
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{componentStyles}</style>
    </div>
  );
}

// CSS following N4S Brand Guide
const componentStyles = `
.acg-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.acg-header {
  background-color: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem;
}

.acg-back-btn {
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

.acg-back-btn:hover {
  border-color: ${COLORS.navy};
  color: ${COLORS.navy};
}

.acg-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.acg-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0;
}

.acg-tier-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: ${COLORS.navy};
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.acg-subtitle {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin-top: 0.25rem;
}

.acg-content {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.acg-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
}

.acg-controls-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.acg-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.acg-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.acg-legend-badge {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
}

.acg-legend-text {
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

.acg-toggle-wrapper {
  display: flex;
  align-items: center;
}

.acg-toggle {
  display: flex;
  background-color: ${COLORS.border};
  border-radius: 20px;
  padding: 4px;
}

.acg-toggle-option {
  padding: 0.5rem 1.25rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  background-color: transparent;
  color: ${COLORS.textMuted};
}

.acg-toggle-option.active {
  background-color: ${COLORS.navy};
  color: #ffffff;
}

.acg-filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.acg-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.acg-filter select {
  padding: 0.5rem 0.75rem;
  border: 1px solid ${COLORS.border};
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: ${COLORS.surface};
  color: ${COLORS.text};
}

.acg-space-count {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin-left: auto;
}

.acg-matrix-wrapper {
  overflow-x: auto;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
}

.acg-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.acg-corner-cell,
.acg-header-cell {
  padding: 0.5rem;
  background-color: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.border};
  border-right: 1px solid ${COLORS.border};
  font-weight: 600;
  text-align: center;
  min-width: 45px;
  color: ${COLORS.text};
}

.acg-corner-cell {
  position: sticky;
  left: 0;
  z-index: 2;
}

.acg-row-header {
  padding: 0.5rem;
  background-color: ${COLORS.background};
  border-right: 1px solid ${COLORS.border};
  font-weight: 600;
  text-align: left;
  color: ${COLORS.text};
  position: sticky;
  left: 0;
  z-index: 1;
}

.acg-cell {
  padding: 0.5rem;
  text-align: center;
  border-right: 1px solid ${COLORS.border};
  border-bottom: 1px solid ${COLORS.border};
  font-weight: 600;
  min-width: 45px;
  cursor: default;
  color: ${COLORS.textMuted};
}

.acg-cell--diagonal {
  background-color: #f0f0f0;
  color: ${COLORS.textMuted};
}

.acg-cell--deviation {
  outline: 2px solid ${COLORS.warning};
  outline-offset: -2px;
}

.acg-deviation-summary {
  background-color: #fff8e1;
  border: 1px solid ${COLORS.warning};
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
}

.acg-deviation-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.warning};
}

.acg-deviation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.acg-deviation-list li {
  font-size: 0.8125rem;
  color: ${COLORS.text};
  padding: 0.25rem 0;
}

.acg-deviation-list code {
  background-color: #f5f0e8;
  padding: 0 4px;
  border-radius: 2px;
}

.acg-deviation-more {
  color: ${COLORS.textMuted} !important;
}

.acg-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${COLORS.border};
}

.acg-note {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.acg-primary-btn {
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

.acg-primary-btn:hover {
  opacity: 0.9;
}
`;
