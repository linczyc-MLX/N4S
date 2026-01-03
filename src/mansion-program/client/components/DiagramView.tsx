/**
 * DiagramView Component
 *
 * Renders Mermaid.js diagrams for space adjacency visualization.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { BriefSpace, AdjacencyRequirement } from '../../shared/schema';
import {
  generateMermaidDiagram,
  generateBubbleDiagram,
  generateCirculationDiagram,
  generateSeparationDiagram
} from '../utils/mermaid-generator';

export interface DiagramViewProps {
  spaces: BriefSpace[];
  adjacencyMatrix: AdjacencyRequirement[];
}

type DiagramType = 'full' | 'bubble' | 'circulation' | 'separation';

declare global {
  interface Window {
    mermaid: {
      initialize: (config: object) => void;
      render: (id: string, code: string) => Promise<{ svg: string }>;
      contentLoaded: () => void;
    };
  }
}

export function DiagramView({ spaces, adjacencyMatrix }: DiagramViewProps) {
  const [diagramType, setDiagramType] = useState<DiagramType>('full');
  const [filterZone, setFilterZone] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [showLabels, setShowLabels] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get unique zones and levels
  const zones = useMemo(() =>
    [...new Set(spaces.map(s => s.zone))].filter(Boolean).sort(),
    [spaces]
  );

  const levels = useMemo(() =>
    [...new Set(spaces.map(s => s.level))].sort(),
    [spaces]
  );

  // Generate Mermaid code
  const mermaidCode = useMemo(() => {
    const options = {
      showLabels,
      filterZone: filterZone || undefined,
      filterLevel: filterLevel ? parseInt(filterLevel) : undefined
    };

    switch (diagramType) {
      case 'bubble':
        return generateBubbleDiagram(spaces, adjacencyMatrix);
      case 'circulation':
        return generateCirculationDiagram(spaces, adjacencyMatrix);
      case 'separation':
        return generateSeparationDiagram(spaces, adjacencyMatrix);
      default:
        return generateMermaidDiagram(spaces, adjacencyMatrix, options);
    }
  }, [spaces, adjacencyMatrix, diagramType, filterZone, filterLevel, showLabels]);

  // Render Mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (!window.mermaid) {
        setError('Mermaid library not loaded');
        return;
      }

      try {
        setError(null);
        const id = `mermaid-${Date.now()}`;
        const { svg } = await window.mermaid.render(id, mermaidCode);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  const handleExportSVG = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adjacency-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mermaidCode);
  };

  return (
    <div className="diagram-view">
      <div className="diagram-controls">
        <div className="control-group">
          <label>Diagram Type:</label>
          <select
            value={diagramType}
            onChange={e => setDiagramType(e.target.value as DiagramType)}
          >
            <option value="full">Full Adjacency</option>
            <option value="bubble">Bubble (Zones)</option>
            <option value="circulation">Circulation (A/N)</option>
            <option value="separation">Separation (S/B)</option>
          </select>
        </div>

        <div className="control-group">
          <label>Filter Zone:</label>
          <select
            value={filterZone}
            onChange={e => setFilterZone(e.target.value)}
          >
            <option value="">All Zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Filter Level:</label>
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>

        <div className="control-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={e => setShowLabels(e.target.checked)}
            />
            Show Labels
          </label>
        </div>
      </div>

      <div className="diagram-legend">
        <div className="legend-item">
          <div className="legend-line adjacent"></div>
          <span>Adjacent (A)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line near"></div>
          <span>Near (N)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line buffered"></div>
          <span>Buffered (B)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line separate"></div>
          <span>Separate (S)</span>
        </div>
      </div>

      <div className="diagram-container" ref={containerRef}>
        {error ? (
          <div className="mermaid-placeholder">
            <p>{error}</p>
            <p className="hint">Check that Mermaid.js is loaded correctly.</p>
          </div>
        ) : svgContent ? (
          <div
            className="mermaid"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="mermaid-placeholder">
            <p>Loading diagram...</p>
          </div>
        )}
      </div>

      <div className="diagram-actions">
        <button className="btn-secondary" onClick={handleExportSVG}>
          Export SVG
        </button>
        <button className="btn-secondary" onClick={handleCopyCode}>
          Copy Mermaid Code
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowCode(!showCode)}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
      </div>

      {showCode && (
        <details className="code-preview" open>
          <summary>Mermaid Code</summary>
          <pre>{mermaidCode}</pre>
        </details>
      )}
    </div>
  );
}

export default DiagramView;
