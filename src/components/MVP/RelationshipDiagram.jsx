/**
 * RelationshipDiagram
 * 
 * Interactive force-directed bubble diagram for adjacency visualization.
 * Uses D3 force simulation for physics-based layout with React SVG rendering.
 * 
 * Features:
 * - Bubble sizing by square footage (architectural convention)
 * - Zone clustering with soft background hulls
 * - Edge styling by relationship type (A/N/B/S)
 * - Dual-mode: Desired (benchmark) vs Proposed (client decisions)
 * - Deviation highlighting with animated transitions
 * - Red flag overlay on violated adjacencies
 * - Interactive hover to highlight connections
 * 
 * Follows N4S Brand Guide styling.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

// ============================================================================
// N4S BRAND COLORS
// ============================================================================
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

// Zone color palette - soft, sophisticated, distinct
const ZONE_COLORS = {
  'Entry + Formal':    { fill: '#e8edf3', stroke: '#8da4c4', text: '#3a5a8a' },
  'Arrival + Formal':  { fill: '#e8edf3', stroke: '#8da4c4', text: '#3a5a8a' },
  'Family Hub':        { fill: '#eef3e8', stroke: '#a4c48d', text: '#4a6a3a' },
  'Service':           { fill: '#f0ece4', stroke: '#c4b48d', text: '#6a5a3a' },
  'Service Core':      { fill: '#f0ece4', stroke: '#c4b48d', text: '#6a5a3a' },
  'Wellness':          { fill: '#e4f0ef', stroke: '#8dc4bd', text: '#3a6a64' },
  'Outdoor':           { fill: '#e8f2e4', stroke: '#8dc48d', text: '#3a6a3a' },
  'Primary Wing':      { fill: '#f0e8ef', stroke: '#c48dbc', text: '#6a3a64' },
  'Guest Wing':        { fill: '#f0ece8', stroke: '#c4a48d', text: '#6a5a4a' },
  'Guest Wing Node':   { fill: '#f0ece8', stroke: '#c4a48d', text: '#6a5a4a' },
  'Hospitality':       { fill: '#f0ece8', stroke: '#c4a48d', text: '#6a5a4a' },
  'Circulation':       { fill: '#ececec', stroke: '#b0b0b0', text: '#6b6b6b' },
  'Support':           { fill: '#ececec', stroke: '#b0b0b0', text: '#6b6b6b' },
};

const DEFAULT_ZONE_COLOR = { fill: '#f0f0f0', stroke: '#b0b0b0', text: '#6b6b6b' };

// Relationship edge styles
const EDGE_STYLES = {
  A: { color: '#4caf50', width: 3, dash: 'none',    label: 'Adjacent',  opacity: 0.8 },
  N: { color: '#2196f3', width: 2, dash: 'none',    label: 'Near',      opacity: 0.6 },
  B: { color: '#ff9800', width: 2, dash: '6,4',     label: 'Buffered',  opacity: 0.5 },
  S: { color: '#f44336', width: 1.5, dash: '3,3',   label: 'Separate',  opacity: 0.4 },
};

// ============================================================================
// ZONE LAYOUT POSITIONS - semantic spatial arrangement
// ============================================================================
const ZONE_POSITIONS = {
  'Entry + Formal':    { x: 0.25, y: 0.2 },
  'Arrival + Formal':  { x: 0.25, y: 0.2 },
  'Family Hub':        { x: 0.55, y: 0.3 },
  'Service':           { x: 0.85, y: 0.55 },
  'Service Core':      { x: 0.85, y: 0.55 },
  'Wellness':          { x: 0.7, y: 0.75 },
  'Outdoor':           { x: 0.45, y: 0.85 },
  'Primary Wing':      { x: 0.15, y: 0.6 },
  'Guest Wing':        { x: 0.35, y: 0.75 },
  'Guest Wing Node':   { x: 0.35, y: 0.75 },
  'Hospitality':       { x: 0.35, y: 0.75 },
  'Circulation':       { x: 0.5, y: 0.5 },
  'Support':           { x: 0.75, y: 0.8 },
};

// ============================================================================
// UTILITY: Convex hull with padding
// ============================================================================
function computeHull(points, padding = 30) {
  if (points.length < 2) {
    // Single point: return circle approximation
    const p = points[0];
    const steps = 12;
    return Array.from({ length: steps }, (_, i) => {
      const angle = (2 * Math.PI * i) / steps;
      return [p[0] + padding * Math.cos(angle), p[1] + padding * Math.sin(angle)];
    });
  }
  if (points.length === 2) {
    // Two points: return capsule shape
    const [a, b] = points;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len * padding;
    const ny = dx / len * padding;
    const steps = 6;
    const result = [];
    for (let i = 0; i <= steps; i++) {
      const angle = Math.PI / 2 + (Math.PI * i) / steps;
      result.push([a[0] + padding * Math.cos(angle + Math.atan2(dy, dx)), 
                    a[1] + padding * Math.sin(angle + Math.atan2(dy, dx))]);
    }
    for (let i = 0; i <= steps; i++) {
      const angle = -Math.PI / 2 + (Math.PI * i) / steps;
      result.push([b[0] + padding * Math.cos(angle + Math.atan2(dy, dx)), 
                    b[1] + padding * Math.sin(angle + Math.atan2(dy, dx))]);
    }
    return result;
  }

  // For 3+ points: compute convex hull then expand
  const hull = d3.polygonHull(points);
  if (!hull) return points.map(p => [p[0], p[1]]);

  // Compute centroid
  const cx = d3.mean(hull, d => d[0]);
  const cy = d3.mean(hull, d => d[1]);

  // Expand hull outward from centroid
  return hull.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + (dx / dist) * padding, y + (dy / dist) * padding];
  });
}

// Smooth path for hull
function hullPath(hullPoints) {
  if (!hullPoints || hullPoints.length < 3) return '';
  // Use a cardinal closed curve for smoothness
  const line = d3.line().curve(d3.curveCatmullRomClosed.alpha(0.5));
  return line(hullPoints);
}


// ============================================================================
// RED FLAG DEFINITIONS (matching ValidationResultsPanel)
// ============================================================================
const RED_FLAG_CHECKS = [
  {
    id: 'rf-1',
    name: 'Guest → Primary Suite',
    description: 'Guest areas directly access primary suite',
    check: (matrix) => {
      const rel = matrix['GUEST1-PRI'] || matrix['PRI-GUEST1'] || matrix['GST1-PRI'] || matrix['PRI-GST1'];
      return rel === 'A' || rel === 'N';
    },
    edges: [['GUEST1', 'PRI'], ['GST1', 'PRI']],
  },
  {
    id: 'rf-2',
    name: 'Delivery → Front of House',
    description: 'Service connects through formal areas',
    check: (matrix) => {
      const garFoy = matrix['GAR-FOY'] || matrix['FOY-GAR'];
      const garGr = matrix['GAR-GR'] || matrix['GR-GAR'];
      return garFoy === 'A' || garFoy === 'N' || garGr === 'A';
    },
    edges: [['GAR', 'FOY'], ['GAR', 'GR']],
  },
  {
    id: 'rf-3',
    name: 'Media → Bedroom Bleed',
    description: 'Media not acoustically separated from bedrooms',
    check: (matrix) => {
      const mediaPri = matrix['MEDIA-PRI'] || matrix['PRI-MEDIA'];
      const mediaGuest = matrix['MEDIA-GUEST1'] || matrix['GUEST1-MEDIA'] || matrix['MEDIA-GST1'] || matrix['GST1-MEDIA'];
      return mediaPri === 'A' || mediaPri === 'N' || mediaGuest === 'A' || mediaGuest === 'N';
    },
    edges: [['MEDIA', 'PRI'], ['MEDIA', 'GUEST1'], ['MEDIA', 'GST1']],
  },
  {
    id: 'rf-4',
    name: 'Kitchen at Entry',
    description: 'Kitchen visible from entry',
    check: (matrix) => {
      const kitFoy = matrix['KIT-FOY'] || matrix['FOY-KIT'];
      return kitFoy === 'A';
    },
    edges: [['KIT', 'FOY']],
  },
  {
    id: 'rf-5',
    name: 'Guest Through Kitchen',
    description: 'Guest circulation routes through kitchen',
    check: (matrix) => {
      const guestKit = matrix['GUEST1-KIT'] || matrix['KIT-GUEST1'] || matrix['GST1-KIT'] || matrix['KIT-GST1'];
      return guestKit === 'A' || guestKit === 'N';
    },
    edges: [['GUEST1', 'KIT'], ['GST1', 'KIT']],
  },
];


// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RelationshipDiagram({
  spaces,
  benchmarkMatrix,
  proposedMatrix,
  deviations,
  view = 'desired',
  width = 900,
  height = 650,
}) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [isSimulationReady, setIsSimulationReady] = useState(false);

  // Current matrix based on view mode
  const currentMatrix = view === 'desired' ? benchmarkMatrix : proposedMatrix;

  // Determine which red flags are triggered in proposed view
  const triggeredRedFlags = useMemo(() => {
    if (view !== 'proposed') return [];
    return RED_FLAG_CHECKS.filter(rf => rf.check(proposedMatrix));
  }, [view, proposedMatrix]);

  // Collect red-flagged edge keys for highlighting
  const redFlagEdgeKeys = useMemo(() => {
    const keys = new Set();
    triggeredRedFlags.forEach(rf => {
      rf.edges.forEach(([from, to]) => {
        keys.add(`${from}-${to}`);
        keys.add(`${to}-${from}`);
      });
    });
    return keys;
  }, [triggeredRedFlags]);

  // Build edges from current matrix
  const edges = useMemo(() => {
    if (!currentMatrix) return [];
    const edgeList = [];
    const seen = new Set();
    const spaceCodeSet = new Set(spaces.map(s => s.code));

    Object.entries(currentMatrix).forEach(([key, relationship]) => {
      const [from, to] = key.split('-');
      if (!spaceCodeSet.has(from) || !spaceCodeSet.has(to)) return;
      const canonical = [from, to].sort().join('-');
      if (seen.has(canonical)) return;
      seen.add(canonical);

      // Check if this edge is a deviation
      const benchRel = benchmarkMatrix[key] || benchmarkMatrix[`${to}-${from}`];
      const propRel = proposedMatrix[key] || proposedMatrix[`${to}-${from}`];
      const isDeviation = view === 'proposed' && benchRel && propRel && benchRel !== propRel;

      // Check if red-flagged
      const isRedFlag = redFlagEdgeKeys.has(key) || redFlagEdgeKeys.has(`${to}-${from}`);

      edgeList.push({
        source: from,
        target: to,
        relationship,
        isDeviation,
        isRedFlag: isRedFlag && view === 'proposed',
        benchmarkRel: benchRel,
      });
    });
    return edgeList;
  }, [currentMatrix, benchmarkMatrix, proposedMatrix, spaces, view, redFlagEdgeKeys]);

  // Build zones for hull rendering
  const zones = useMemo(() => {
    const zoneMap = {};
    spaces.forEach(s => {
      if (!zoneMap[s.zone]) zoneMap[s.zone] = [];
      zoneMap[s.zone].push(s.code);
    });
    return zoneMap;
  }, [spaces]);

  // ========================================================================
  // D3 FORCE SIMULATION
  // ========================================================================
  useEffect(() => {
    if (!spaces || spaces.length === 0) return;

    const margin = 60;
    const simWidth = width - margin * 2;
    const simHeight = height - margin * 2;

    // Build node objects
    const nodeData = spaces
      .filter(s => s.code !== 'CIRC1' && s.code !== 'CIRC2' && s.code !== 'CORE2') // Skip circulation
      .map(s => {
        const zonePos = ZONE_POSITIONS[s.zone] || { x: 0.5, y: 0.5 };
        const radius = Math.max(14, Math.min(32, Math.sqrt(s.targetSF || 100) * 0.9));
        return {
          id: s.code,
          name: s.name,
          zone: s.zone,
          level: s.level,
          targetSF: s.targetSF,
          radius,
          // Initialize near zone position with some jitter
          x: margin + zonePos.x * simWidth + (Math.random() - 0.5) * 40,
          y: margin + zonePos.y * simHeight + (Math.random() - 0.5) * 40,
          fx: null,
          fy: null,
        };
      });

    // Build link objects for simulation
    const nodeIds = new Set(nodeData.map(n => n.id));
    const linkData = edges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map(e => ({
        source: e.source,
        target: e.target,
        relationship: e.relationship,
        // Stronger attraction for A, weaker for S
        strength: e.relationship === 'A' ? 0.8 : 
                  e.relationship === 'N' ? 0.4 : 
                  e.relationship === 'B' ? 0.15 : 0.05,
        // Shorter distance for A, longer for S
        distance: e.relationship === 'A' ? 55 : 
                  e.relationship === 'N' ? 90 : 
                  e.relationship === 'B' ? 130 : 170,
      }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink(linkData)
        .id(d => d.id)
        .distance(d => d.distance)
        .strength(d => d.strength)
      )
      .force('charge', d3.forceManyBody()
        .strength(-200)
        .distanceMax(300)
      )
      .force('collision', d3.forceCollide()
        .radius(d => d.radius + 6)
        .strength(0.8)
      )
      // Zone clustering forces - pull nodes toward their zone center
      .force('x', d3.forceX()
        .x(d => {
          const pos = ZONE_POSITIONS[d.zone] || { x: 0.5 };
          return margin + pos.x * simWidth;
        })
        .strength(0.12)
      )
      .force('y', d3.forceY()
        .y(d => {
          const pos = ZONE_POSITIONS[d.zone] || { y: 0.5 };
          return margin + pos.y * simHeight;
        })
        .strength(0.12)
      )
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.02))
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    simulationRef.current = simulation;

    // Run simulation ticks
    simulation.on('tick', () => {
      // Constrain nodes within bounds
      nodeData.forEach(d => {
        d.x = Math.max(margin + d.radius, Math.min(width - margin - d.radius, d.x));
        d.y = Math.max(margin + d.radius, Math.min(height - margin - d.radius, d.y));
      });
      setNodes([...nodeData]);
    });

    // Mark ready after simulation settles
    simulation.on('end', () => {
      setIsSimulationReady(true);
    });

    // Also mark ready after some ticks if it hasn't ended
    setTimeout(() => setIsSimulationReady(true), 2000);

    return () => {
      simulation.stop();
    };
  }, [spaces, edges, width, height]);

  // ========================================================================
  // NODE LOOKUP for edge rendering
  // ========================================================================
  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [nodes]);

  // ========================================================================
  // ZONE HULLS
  // ========================================================================
  const zoneHulls = useMemo(() => {
    if (nodes.length === 0) return [];
    const hulls = [];
    Object.entries(zones).forEach(([zoneName, spaceCodes]) => {
      const zoneNodes = spaceCodes
        .filter(code => code !== 'CIRC1' && code !== 'CIRC2' && code !== 'CORE2')
        .map(code => nodeMap[code])
        .filter(Boolean);
      if (zoneNodes.length === 0) return;

      const points = zoneNodes.map(n => [n.x, n.y]);
      const maxRadius = Math.max(...zoneNodes.map(n => n.radius));
      const hullPoints = computeHull(points, maxRadius + 18);
      const color = ZONE_COLORS[zoneName] || DEFAULT_ZONE_COLOR;

      hulls.push({
        zone: zoneName,
        path: hullPath(hullPoints),
        color,
        labelX: d3.mean(zoneNodes, n => n.x),
        labelY: Math.min(...zoneNodes.map(n => n.y)) - maxRadius - 22,
      });
    });
    return hulls;
  }, [nodes, zones, nodeMap]);

  // ========================================================================
  // HOVER INTERACTION
  // ========================================================================
  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return new Set();
    const connected = new Set([hoveredNode]);
    edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      if (src === hoveredNode) connected.add(tgt);
      if (tgt === hoveredNode) connected.add(src);
    });
    return connected;
  }, [hoveredNode, edges]);

  const handleNodeEnter = useCallback((node, event) => {
    setHoveredNode(node.id);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setTooltipData({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top,
        node,
      });
    }
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipData(null);
  }, []);

  // ========================================================================
  // EDGE RENDERING HELPERS
  // ========================================================================
  const getEdgeOpacity = useCallback((edge) => {
    if (!hoveredNode) return EDGE_STYLES[edge.relationship]?.opacity || 0.5;
    const src = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const tgt = typeof edge.target === 'object' ? edge.target.id : edge.target;
    if (connectedNodes.has(src) && connectedNodes.has(tgt)) return 1;
    return 0.06;
  }, [hoveredNode, connectedNodes]);

  const getNodeOpacity = useCallback((node) => {
    if (!hoveredNode) return 1;
    return connectedNodes.has(node.id) ? 1 : 0.15;
  }, [hoveredNode, connectedNodes]);

  // ========================================================================
  // RENDER
  // ========================================================================
  if (!spaces || spaces.length === 0) return null;

  return (
    <div className="rd-container" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="rd-svg"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: height,
          background: COLORS.background,
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Definitions for markers and filters */}
        <defs>
          {/* Red flag glow filter */}
          <filter id="red-flag-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Deviation pulse filter */}
          <filter id="deviation-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Zone background hulls */}
        {zoneHulls.map(hull => (
          <g key={hull.zone} className="rd-zone-hull">
            <path
              d={hull.path}
              fill={hull.color.fill}
              stroke={hull.color.stroke}
              strokeWidth={1}
              opacity={hoveredNode ? 0.4 : 0.7}
              style={{ transition: 'opacity 0.3s ease' }}
            />
            <text
              x={hull.labelX}
              y={hull.labelY}
              textAnchor="middle"
              fill={hull.color.text}
              fontSize="10"
              fontWeight="600"
              fontFamily="Inter, -apple-system, sans-serif"
              letterSpacing="0.04em"
              opacity={hoveredNode ? 0.3 : 0.7}
              style={{ textTransform: 'uppercase', transition: 'opacity 0.3s ease' }}
            >
              {hull.zone}
            </text>
          </g>
        ))}

        {/* Edges */}
        {edges.map((edge, i) => {
          const src = nodeMap[typeof edge.source === 'object' ? edge.source.id : edge.source];
          const tgt = nodeMap[typeof edge.target === 'object' ? edge.target.id : edge.target];
          if (!src || !tgt) return null;

          const style = EDGE_STYLES[edge.relationship] || EDGE_STYLES.N;
          const opacity = getEdgeOpacity(edge);
          const isHighlighted = edge.isDeviation || edge.isRedFlag;

          return (
            <g key={`edge-${i}`}>
              {/* Red flag glow underlay */}
              {edge.isRedFlag && (
                <line
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke={COLORS.error}
                  strokeWidth={style.width + 6}
                  opacity={0.25}
                  filter="url(#red-flag-glow)"
                  className="rd-edge-redflag-glow"
                />
              )}
              {/* Deviation glow underlay */}
              {edge.isDeviation && !edge.isRedFlag && (
                <line
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke={COLORS.warning}
                  strokeWidth={style.width + 4}
                  opacity={0.2}
                  filter="url(#deviation-glow)"
                  className="rd-edge-deviation-glow"
                />
              )}
              {/* Main edge */}
              <line
                x1={src.x} y1={src.y}
                x2={tgt.x} y2={tgt.y}
                stroke={edge.isRedFlag ? COLORS.error : style.color}
                strokeWidth={isHighlighted ? style.width + 1 : style.width}
                strokeDasharray={style.dash}
                opacity={opacity}
                strokeLinecap="round"
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {/* Deviation indicator: small diamond at midpoint */}
              {edge.isDeviation && (
                <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2})`}>
                  <polygon
                    points="0,-5 5,0 0,5 -5,0"
                    fill={edge.isRedFlag ? COLORS.error : COLORS.warning}
                    opacity={opacity}
                  />
                  {/* Show what changed: benchmark → proposed */}
                  {hoveredNode && connectedNodes.has(src.id) && connectedNodes.has(tgt.id) && (
                    <text
                      y={-10}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill={COLORS.warning}
                      fontFamily="Inter, -apple-system, sans-serif"
                    >
                      {edge.benchmarkRel} → {edge.relationship}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const opacity = getNodeOpacity(node);
          const zoneColor = ZONE_COLORS[node.zone] || DEFAULT_ZONE_COLOR;
          const isHovered = hoveredNode === node.id;

          return (
            <g
              key={node.id}
              className="rd-node"
              style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
              opacity={opacity}
              onMouseEnter={(e) => handleNodeEnter(node, e)}
              onMouseLeave={handleNodeLeave}
            >
              {/* Hover ring */}
              {isHovered && (
                <circle
                  cx={node.x} cy={node.y}
                  r={node.radius + 5}
                  fill="none"
                  stroke={COLORS.gold}
                  strokeWidth={2}
                  opacity={0.8}
                />
              )}
              {/* Node circle */}
              <circle
                cx={node.x} cy={node.y}
                r={node.radius}
                fill={COLORS.surface}
                stroke={isHovered ? COLORS.navy : zoneColor.stroke}
                strokeWidth={isHovered ? 2.5 : 1.5}
              />
              {/* Node label */}
              <text
                x={node.x} y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.radius > 22 ? '10' : '8'}
                fontWeight="600"
                fill={COLORS.text}
                fontFamily="Inter, -apple-system, sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {node.id}
              </text>
            </g>
          );
        })}

        {/* Red flag badges - show count on affected nodes */}
        {view === 'proposed' && triggeredRedFlags.length > 0 && nodes.map(node => {
          // Check if this node is involved in any red flag
          const involvedFlags = triggeredRedFlags.filter(rf =>
            rf.edges.some(([from, to]) => from === node.id || to === node.id)
          );
          if (involvedFlags.length === 0) return null;

          return (
            <g key={`rf-badge-${node.id}`}>
              <circle
                cx={node.x + node.radius * 0.7}
                cy={node.y - node.radius * 0.7}
                r={7}
                fill={COLORS.error}
              />
              <text
                x={node.x + node.radius * 0.7}
                y={node.y - node.radius * 0.7}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
                fontWeight="700"
                fill="#fff"
                fontFamily="Inter, sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                !
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="rd-tooltip"
          style={{
            position: 'absolute',
            left: Math.min(tooltipData.x + 12, width - 200),
            top: Math.max(tooltipData.y - 60, 10),
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontFamily: 'Inter, -apple-system, sans-serif',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            minWidth: '140px',
          }}
        >
          <div style={{ fontWeight: 600, color: COLORS.text, marginBottom: '4px' }}>
            {tooltipData.node.name}
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: '11px' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '1px 6px',
              borderRadius: '3px',
              backgroundColor: (ZONE_COLORS[tooltipData.node.zone] || DEFAULT_ZONE_COLOR).fill,
              color: (ZONE_COLORS[tooltipData.node.zone] || DEFAULT_ZONE_COLOR).text,
              fontSize: '10px',
              fontWeight: 500,
              marginBottom: '3px',
            }}>
              {tooltipData.node.zone}
            </span>
          </div>
          {tooltipData.node.targetSF > 0 && (
            <div style={{ color: COLORS.text, fontSize: '11px', marginTop: '2px' }}>
              {tooltipData.node.targetSF.toLocaleString()} SF
            </div>
          )}
          {/* Show connections */}
          <div style={{ marginTop: '4px', borderTop: `1px solid ${COLORS.border}`, paddingTop: '4px' }}>
            {edges
              .filter(e => {
                const src = typeof e.source === 'object' ? e.source.id : e.source;
                const tgt = typeof e.target === 'object' ? e.target.id : e.target;
                return src === tooltipData.node.id || tgt === tooltipData.node.id;
              })
              .slice(0, 5)
              .map((e, i) => {
                const src = typeof e.source === 'object' ? e.source.id : e.source;
                const tgt = typeof e.target === 'object' ? e.target.id : e.target;
                const other = src === tooltipData.node.id ? tgt : src;
                const style = EDGE_STYLES[e.relationship];
                return (
                  <div key={i} style={{ fontSize: '10px', color: COLORS.textMuted, lineHeight: '1.6' }}>
                    <span style={{ color: style.color, fontWeight: 600 }}>{e.relationship}</span>
                    {' → '}
                    <span style={{ fontWeight: 500 }}>{other}</span>
                    {e.isDeviation && (
                      <span style={{ color: COLORS.warning, marginLeft: '3px', fontSize: '9px' }}>
                        (changed)
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rd-legend" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 16px',
        marginTop: '8px',
        background: '#f8f9fa',
        borderRadius: '6px',
        border: `1px solid ${COLORS.border}`,
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: COLORS.textMuted,
          marginRight: '4px',
        }}>
          Relationships
        </span>
        {Object.entries(EDGE_STYLES).map(([key, style]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="24" height="10">
              <line
                x1="0" y1="5" x2="24" y2="5"
                stroke={style.color}
                strokeWidth={style.width}
                strokeDasharray={style.dash}
              />
            </svg>
            <span style={{ fontSize: '11px', color: COLORS.text, fontWeight: 500 }}>
              {key}
            </span>
            <span style={{ fontSize: '10px', color: COLORS.textMuted }}>
              {style.label}
            </span>
          </div>
        ))}
        {view === 'proposed' && deviations.length > 0 && (
          <>
            <span style={{ 
              width: '1px', height: '16px', background: COLORS.border, 
              display: 'inline-block', margin: '0 4px' 
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="10" height="10">
                <polygon points="5,0 10,5 5,10 0,5" fill={COLORS.warning} />
              </svg>
              <span style={{ fontSize: '10px', color: COLORS.warning, fontWeight: 500 }}>
                Deviation
              </span>
            </div>
          </>
        )}
        {triggeredRedFlags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="10" height="10">
              <circle cx="5" cy="5" r="5" fill={COLORS.error} />
              <text x="5" y="5.5" textAnchor="middle" dominantBaseline="central" 
                    fill="#fff" fontSize="7" fontWeight="700">!</text>
            </svg>
            <span style={{ fontSize: '10px', color: COLORS.error, fontWeight: 500 }}>
              Red Flag ({triggeredRedFlags.length})
            </span>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        .rd-edge-redflag-glow {
          animation: rd-pulse-red 2s ease-in-out infinite;
        }
        .rd-edge-deviation-glow {
          animation: rd-pulse-amber 2.5s ease-in-out infinite;
        }
        @keyframes rd-pulse-red {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes rd-pulse-amber {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.25; }
        }
        .rd-node:hover circle {
          filter: brightness(0.97);
        }
      `}</style>
    </div>
  );
}
