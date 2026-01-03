/**
 * AdjacencyMatrix Component
 */

import React, { useState, useMemo } from 'react';
import type { BriefSpace, AdjacencyRequirement, AdjacencyType } from '../../shared/schema';

export interface AdjacencyMatrixProps {
  spaces: BriefSpace[];
  adjacencyMatrix: AdjacencyRequirement[];
  onUpdate: (fromCode: string, toCode: string, relationship: AdjacencyType | null) => void;
  getAdjacency: (fromCode: string, toCode: string) => AdjacencyType | null;
}

type RelationshipType = 'A' | 'N' | 'B' | 'S' | null;

const RELATIONSHIP_LABELS: Record<string, { label: string; color: string; description: string }> = {
  'A': { label: 'A', color: '#4caf50', description: 'Adjacent - Direct connection required' },
  'N': { label: 'N', color: '#2196f3', description: 'Near - Close proximity needed' },
  'B': { label: 'B', color: '#ff9800', description: 'Buffered - Buffer zone required' },
  'S': { label: 'S', color: '#f44336', description: 'Separate - Isolation required' }
};

export function AdjacencyMatrix({ spaces, adjacencyMatrix, onUpdate, getAdjacency }: AdjacencyMatrixProps) {
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ from: string; to: string } | null>(null);

  const zones = useMemo(() =>
    [...new Set(spaces.map(s => s.zone))].sort(),
    [spaces]
  );

  const levels = useMemo(() =>
    [...new Set(spaces.map(s => s.level))].sort(),
    [spaces]
  );

  const filteredSpaces = useMemo(() => {
    return spaces.filter(s => {
      if (filterZone && s.zone !== filterZone) return false;
      if (filterLevel !== null && s.level !== filterLevel) return false;
      return true;
    });
  }, [spaces, filterZone, filterLevel]);

  const handleCellClick = (fromCode: string, toCode: string) => {
    if (fromCode === toCode) return;

    const current = getAdjacency(fromCode, toCode);
    const cycle: (RelationshipType)[] = [null, 'A', 'N', 'B', 'S'];
    const currentIndex = cycle.indexOf(current);
    const nextIndex = (currentIndex + 1) % cycle.length;

    onUpdate(fromCode, toCode, cycle[nextIndex]);
  };

  const renderCell = (fromCode: string, toCode: string) => {
    if (fromCode === toCode) {
      return <td key={`${fromCode}-${toCode}`} className="cell diagonal">–</td>;
    }

    const relationship = getAdjacency(fromCode, toCode);
    const isHovered = hoveredCell?.from === fromCode && hoveredCell?.to === toCode;
    const info = relationship ? RELATIONSHIP_LABELS[relationship] : null;

    return (
      <td
        key={`${fromCode}-${toCode}`}
        className={`cell ${relationship || 'empty'} ${isHovered ? 'hovered' : ''}`}
        style={info ? { backgroundColor: info.color, color: 'white' } : undefined}
        onClick={() => handleCellClick(fromCode, toCode)}
        onMouseEnter={() => setHoveredCell({ from: fromCode, to: toCode })}
        onMouseLeave={() => setHoveredCell(null)}
        title={info?.description}
      >
        {relationship || '·'}
      </td>
    );
  };

  return (
    <div className="adjacency-matrix">
      <div className="matrix-legend">
        <h3>Adjacency Legend</h3>
        <div className="legend-items">
          {Object.entries(RELATIONSHIP_LABELS).map(([key, { label, color, description }]) => (
            <div key={key} className="legend-item">
              <span className="legend-badge" style={{ backgroundColor: color }}>{label}</span>
              <span className="legend-text">{description}</span>
            </div>
          ))}
        </div>
        <p className="legend-hint">Click cells to cycle through relationships</p>
      </div>

      <div className="matrix-filters">
        <label>
          Filter by Zone:
          <select
            value={filterZone || ''}
            onChange={e => setFilterZone(e.target.value || null)}
          >
            <option value="">All Zones</option>
            {zones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>

        <label>
          Filter by Level:
          <select
            value={filterLevel ?? ''}
            onChange={e => setFilterLevel(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Levels</option>
            {levels.map(l => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </label>

        <span className="space-count">
          Showing {filteredSpaces.length} of {spaces.length} spaces
        </span>
      </div>

      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="corner"></th>
              {filteredSpaces.map(s => (
                <th key={s.code} className="col-header" title={s.name}>
                  {s.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSpaces.map(fromSpace => (
              <tr key={fromSpace.code}>
                <th className="row-header" title={fromSpace.name}>
                  {fromSpace.code}
                </th>
                {filteredSpaces.map(toSpace =>
                  renderCell(fromSpace.code, toSpace.code)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="matrix-stats">
        <div className="stat">
          <strong>{adjacencyMatrix.filter(a => a.relationship === 'A').length}</strong>
          <span>Adjacent (A)</span>
        </div>
        <div className="stat">
          <strong>{adjacencyMatrix.filter(a => a.relationship === 'N').length}</strong>
          <span>Near (N)</span>
        </div>
        <div className="stat">
          <strong>{adjacencyMatrix.filter(a => a.relationship === 'B').length}</strong>
          <span>Buffered (B)</span>
        </div>
        <div className="stat">
          <strong>{adjacencyMatrix.filter(a => a.relationship === 'S').length}</strong>
          <span>Separate (S)</span>
        </div>
      </div>
    </div>
  );
}

export default AdjacencyMatrix;
