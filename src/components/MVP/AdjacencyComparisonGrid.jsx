/**
 * AdjacencyComparisonGrid
 * 
 * Read-only adjacency matrix grid with Desired/Proposed toggle.
 * Shows N4S benchmark (Desired) vs client's selections (Proposed).
 * Highlights deviations and shows warning summary.
 * 
 * NO interactive editing - grid cells are display-only.
 * Client makes decisions via the questionnaire, not by clicking cells.
 */

import React, { useState, useMemo, useContext } from 'react';
import { AlertTriangle, CheckCircle, Eye, GitCompare } from 'lucide-react';
import AppContext from '../../contexts/AppContext';
import { useKYCData } from '../../hooks/useKYCData';
import { 
  getPreset,
  applyDecisionsToMatrix,
  getDecisionsForPreset,
  getOptionById
} from '../../mansion-program';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  adjacent: '#22c55e',    // Green - A
  near: '#3b82f6',        // Blue - N
  buffered: '#f59e0b',    // Orange - B
  separate: '#ef4444',    // Red - S
  deviation: '#fef3c7',   // Light amber background for deviations
  deviationBorder: '#f59e0b',
};

// Relationship display config
const RELATIONSHIP_CONFIG = {
  A: { label: 'A', name: 'Adjacent', color: COLORS.adjacent, description: 'Direct connection required' },
  N: { label: 'N', name: 'Near', color: COLORS.near, description: 'Close proximity needed' },
  B: { label: 'B', name: 'Buffered', color: COLORS.buffered, description: 'Buffer zone required' },
  S: { label: 'S', name: 'Separate', color: COLORS.separate, description: 'Isolation required' },
};

/**
 * Legend component
 */
function AdjacencyLegend() {
  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Adjacency Legend:</span>
      {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
        <div key={key} className="flex items-center gap-2">
          <span 
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: config.color }}
          >
            {config.label}
          </span>
          <span className="text-sm text-gray-600">{config.name}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Toggle switch for Desired/Proposed view
 */
function ViewToggle({ view, onViewChange, deviationCount }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
        <button
          onClick={() => onViewChange('desired')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            view === 'desired' 
              ? 'bg-navy text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={view === 'desired' ? { backgroundColor: COLORS.navy } : {}}
        >
          <Eye className="w-4 h-4" />
          Desired (N4S Standard)
        </button>
        <button
          onClick={() => onViewChange('proposed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            view === 'proposed' 
              ? 'bg-navy text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={view === 'proposed' ? { backgroundColor: COLORS.navy } : {}}
        >
          <GitCompare className="w-4 h-4" />
          Proposed (Your Selections)
          {deviationCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
              {deviationCount} {deviationCount === 1 ? 'deviation' : 'deviations'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Filter controls
 */
function FilterControls({ zones, selectedZone, onZoneChange, levels, selectedLevel, onLevelChange, spaceCount }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Filter by Zone:</label>
        <select 
          value={selectedZone}
          onChange={(e) => onZoneChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Zones</option>
          {zones.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Filter by Level:</label>
        <select 
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Levels</option>
          {levels.map(level => (
            <option key={level} value={level}>Level {level}</option>
          ))}
        </select>
      </div>
      <span className="text-sm text-gray-500">
        Showing {spaceCount} of {spaceCount} spaces
      </span>
    </div>
  );
}

/**
 * Matrix cell component
 */
function MatrixCell({ relationship, isDeviation, desiredRelationship }) {
  if (!relationship) {
    return (
      <td className="border border-gray-200 w-10 h-10 text-center text-gray-300">
        ·
      </td>
    );
  }

  const config = RELATIONSHIP_CONFIG[relationship];
  const deviationStyle = isDeviation ? {
    boxShadow: `inset 0 0 0 2px ${COLORS.deviationBorder}`,
    backgroundColor: COLORS.deviation,
  } : {};

  return (
    <td 
      className="border border-gray-200 w-10 h-10 text-center relative"
      style={deviationStyle}
      title={isDeviation ? `Deviation: Desired ${desiredRelationship}, Proposed ${relationship}` : config?.description}
    >
      <span 
        className="inline-flex items-center justify-center w-8 h-8 rounded text-white text-xs font-bold"
        style={{ backgroundColor: config?.color || '#gray' }}
      >
        {relationship}
      </span>
      {isDeviation && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
      )}
    </td>
  );
}

/**
 * Deviation warnings summary
 */
function DeviationSummary({ deviations, decisions }) {
  if (deviations.length === 0) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 font-medium">
          All adjacencies match N4S recommendations
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span className="text-amber-800 font-medium">
          {deviations.length} {deviations.length === 1 ? 'Deviation' : 'Deviations'} from N4S Standard
        </span>
      </div>
      <ul className="space-y-2">
        {deviations.map((dev, idx) => {
          // Find which decision caused this deviation
          const relatedDecision = decisions?.find(d => 
            d.primarySpace === dev.fromSpace || d.primarySpace === dev.toSpace
          );
          
          return (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-amber-600 mt-0.5">•</span>
              <div>
                <span className="font-medium text-amber-900">
                  {dev.fromSpace} → {dev.toSpace}:
                </span>
                <span className="text-amber-700 ml-2">
                  Desired <span className="font-mono bg-amber-100 px-1 rounded">{dev.desired}</span>,
                  Proposed <span className="font-mono bg-amber-100 px-1 rounded">{dev.proposed}</span>
                </span>
                {relatedDecision && (
                  <span className="text-amber-600 ml-2 text-xs">
                    (from: {relatedDecision.title})
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Main AdjacencyComparisonGrid component
 */
export default function AdjacencyComparisonGrid({ onBack }) {
  // State
  const [view, setView] = useState('desired'); // 'desired' | 'proposed'
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Context
  const { fyiData } = useContext(AppContext);
  const { preset } = useKYCData();
  
  // Get preset data
  const presetData = useMemo(() => {
    try {
      return getPreset(preset);
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
        const key = `${adj.fromSpaceCode}-${adj.toSpaceCode}`;
        lookup[key] = adj.relationship;
      }
    });
    return lookup;
  }, [presetData]);

  // Build proposed matrix (benchmark + decision modifications)
  const proposedMatrix = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return {};
    
    // Convert saved decisions to choices format
    const choices = Object.entries(savedDecisions).map(([decisionId, optionId]) => ({
      decisionId,
      selectedOptionId: optionId,
      isDefault: false,
      warnings: []
    }));

    // Apply decisions to get proposed matrix
    const updatedMatrix = applyDecisionsToMatrix(presetData.adjacencyMatrix, choices);
    
    const lookup = {};
    updatedMatrix.forEach(adj => {
      if (adj.fromSpaceCode && adj.toSpaceCode) {
        const key = `${adj.fromSpaceCode}-${adj.toSpaceCode}`;
        lookup[key] = adj.relationship;
      }
    });
    return lookup;
  }, [presetData, savedDecisions]);

  // Calculate deviations
  const deviations = useMemo(() => {
    const devList = [];
    const allKeys = new Set([...Object.keys(benchmarkMatrix), ...Object.keys(proposedMatrix)]);
    
    allKeys.forEach(key => {
      const desired = benchmarkMatrix[key];
      const proposed = proposedMatrix[key];
      if (desired && proposed && desired !== proposed) {
        const [fromSpace, toSpace] = key.split('-');
        devList.push({ fromSpace, toSpace, desired, proposed });
      }
    });
    
    return devList;
  }, [benchmarkMatrix, proposedMatrix]);

  // Get spaces for grid
  const spaces = useMemo(() => {
    if (!presetData?.spaces) return [];
    let filtered = [...presetData.spaces].filter(s => s.targetSF > 0); // Exclude outdoor/0 SF
    
    if (selectedZone !== 'all') {
      filtered = filtered.filter(s => s.zone === selectedZone);
    }
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(s => s.level === parseInt(selectedLevel));
    }
    
    return filtered;
  }, [presetData, selectedZone, selectedLevel]);

  // Get unique zones and levels
  const zones = useMemo(() => {
    if (!presetData?.spaces) return [];
    return [...new Set(presetData.spaces.map(s => s.zone))].filter(Boolean);
  }, [presetData]);

  const levels = useMemo(() => {
    if (!presetData?.spaces) return [];
    return [...new Set(presetData.spaces.map(s => s.level))].filter(Boolean).sort();
  }, [presetData]);

  // Get space codes for grid
  const spaceCodes = spaces.map(s => s.code);

  // Current matrix based on view
  const currentMatrix = view === 'desired' ? benchmarkMatrix : proposedMatrix;

  // Check if cell is a deviation
  const isDeviation = (fromCode, toCode) => {
    if (view !== 'proposed') return false;
    const key = `${fromCode}-${toCode}`;
    return benchmarkMatrix[key] && proposedMatrix[key] && benchmarkMatrix[key] !== proposedMatrix[key];
  };

  if (!presetData) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800">Please complete FYI configuration first to view adjacency matrix.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ color: COLORS.navy }}>
          Adjacency Matrix Comparison
        </h2>
        <p className="text-gray-600 mt-1">
          Compare N4S recommended adjacencies with your personalized selections
        </p>
      </div>

      {/* Legend */}
      <AdjacencyLegend />

      {/* Toggle */}
      <ViewToggle 
        view={view} 
        onViewChange={setView} 
        deviationCount={deviations.length}
      />

      {/* Filters */}
      <FilterControls
        zones={zones}
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        levels={levels}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        spaceCount={spaces.length}
      />

      {/* Grid */}
      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-gray-100 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                From / To
              </th>
              {spaceCodes.map(code => (
                <th 
                  key={code} 
                  className="bg-gray-100 border border-gray-200 px-2 py-2 text-xs font-medium text-gray-700 min-w-[40px]"
                >
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spaceCodes.map(fromCode => (
              <tr key={fromCode}>
                <td className="sticky left-0 z-10 bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                  {fromCode}
                </td>
                {spaceCodes.map(toCode => {
                  if (fromCode === toCode) {
                    return (
                      <td key={toCode} className="border border-gray-200 w-10 h-10 bg-gray-100 text-center text-gray-400">
                        –
                      </td>
                    );
                  }
                  
                  const key = `${fromCode}-${toCode}`;
                  const relationship = currentMatrix[key];
                  const deviation = isDeviation(fromCode, toCode);
                  const desiredRel = benchmarkMatrix[key];
                  
                  return (
                    <MatrixCell
                      key={toCode}
                      relationship={relationship}
                      isDeviation={deviation}
                      desiredRelationship={desiredRel}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deviation Summary */}
      <DeviationSummary deviations={deviations} decisions={decisions} />

      {/* Info text */}
      <p className="mt-4 text-sm text-gray-500">
        <strong>Note:</strong> This grid is read-only. To modify adjacencies, use the Layout Questionnaire.
      </p>
    </div>
  );
}
