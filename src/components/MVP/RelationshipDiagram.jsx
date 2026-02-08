/**
 * RelationshipDiagram — N4S Architectural Bubble Diagram (v2)
 * 
 * Interactive force-directed visualization of spatial adjacency relationships.
 * D3 force simulation for physics layout, React SVG for rendering.
 * 
 * v2 Improvements:
 * - Simulation pre-computed (no flicker) and stable across view toggle
 * - Sqrt-scaled bubble sizing proportional to space SF
 * - Zone clustering with convex hull backgrounds + zone tinted nodes
 * - Deviation diamonds with benchmark→proposed annotation on hover
 * - Red flag halos, badges, and summary panel
 * - Rich tooltips with zone badge, SF, and connection list
 * - Abbreviation index
 * 
 * Follows N4S Brand Guide — no gradients, no drop shadows, warm palette.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  accentLight: '#f5f0e8',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
};

// Zone visual styling — soft, warm, distinct per zone
const ZONE_COLORS = {
  'Entry + Formal':   { fill: '#e8edf3', stroke: '#8da4c4', text: '#3a5a8a', node: '#d4dde9' },
  'Arrival + Formal': { fill: '#e8edf3', stroke: '#8da4c4', text: '#3a5a8a', node: '#d4dde9' },
  'Family Hub':       { fill: '#eef3e8', stroke: '#a4c48d', text: '#4a6a3a', node: '#dde9d4' },
  'Service':          { fill: '#f0ece4', stroke: '#c4b48d', text: '#6a5a3a', node: '#e5ddd0' },
  'Service Core':     { fill: '#f0ece4', stroke: '#c4b48d', text: '#6a5a3a', node: '#e5ddd0' },
  'Wellness':         { fill: '#e4f0ef', stroke: '#8dc4bd', text: '#3a6a64', node: '#d0e5e2' },
  'Outdoor':          { fill: '#e8f2e4', stroke: '#8dc48d', text: '#3a6a3a', node: '#d4e9d0' },
  'Primary Wing':     { fill: '#f0e8ef', stroke: '#c48dbc', text: '#6a3a64', node: '#e5d4e2' },
  'Guest Wing':       { fill: '#f0ece8', stroke: '#c4a48d', text: '#6a5a4a', node: '#e5ddd4' },
  'Guest Wing Node':  { fill: '#f0ece8', stroke: '#c4a48d', text: '#6a5a4a', node: '#e5ddd4' },
  'Hospitality':      { fill: '#f0ece8', stroke: '#c4a48d', text: '#6a5a4a', node: '#e5ddd4' },
  'Circulation':      { fill: '#ececec', stroke: '#b0b0b0', text: '#6b6b6b', node: '#e0e0e0' },
  'Support':          { fill: '#ececec', stroke: '#b0b0b0', text: '#6b6b6b', node: '#e0e0e0' },
};
const DEFAULT_ZONE = { fill: '#f0f0f0', stroke: '#b0b0b0', text: '#6b6b6b', node: '#e8e8e8' };

// Edge rendering per relationship type
const EDGE_STYLES = {
  A: { color: '#4caf50', width: 3,   dash: 'none', label: 'Adjacent',  baseOpacity: 0.8 },
  N: { color: '#2196f3', width: 2,   dash: 'none', label: 'Near',      baseOpacity: 0.55 },
  B: { color: '#ff9800', width: 1.5, dash: '6,4',  label: 'Buffered',  baseOpacity: 0.5 },
  S: { color: '#f44336', width: 1.5, dash: '3,3',  label: 'Separate',  baseOpacity: 0.35 },
};

// Semantic zone anchor positions — approximate where zones sit in a real mansion plan
const ZONE_POSITIONS = {
  'Entry + Formal':   { x: 0.22, y: 0.18 },
  'Arrival + Formal': { x: 0.22, y: 0.18 },
  'Family Hub':       { x: 0.52, y: 0.30 },
  'Service':          { x: 0.85, y: 0.50 },
  'Service Core':     { x: 0.85, y: 0.50 },
  'Wellness':         { x: 0.72, y: 0.75 },
  'Outdoor':          { x: 0.48, y: 0.82 },
  'Primary Wing':     { x: 0.15, y: 0.60 },
  'Guest Wing':       { x: 0.38, y: 0.72 },
  'Guest Wing Node':  { x: 0.38, y: 0.72 },
  'Hospitality':      { x: 0.38, y: 0.72 },
  'Circulation':      { x: 0.50, y: 0.50 },
  'Support':          { x: 0.78, y: 0.78 },
};

// Red flag definitions — matching ValidationResultsPanel
const RED_FLAG_CHECKS = [
  {
    id: 'rf-1', name: 'Guest → Primary Suite',
    description: 'Guest areas directly access primary suite',
    edges: [['GUEST1', 'PRI'], ['GST1', 'PRI']],
    check: (m) => {
      const r = m['GUEST1-PRI'] || m['PRI-GUEST1'] || m['GST1-PRI'] || m['PRI-GST1'];
      return r === 'A' || r === 'N';
    },
  },
  {
    id: 'rf-2', name: 'Delivery → Front of House',
    description: 'Service connects through formal areas',
    edges: [['GAR', 'FOY'], ['GAR', 'GR']],
    check: (m) => {
      const a = m['GAR-FOY'] || m['FOY-GAR'];
      const b = m['GAR-GR'] || m['GR-GAR'];
      return a === 'A' || a === 'N' || b === 'A';
    },
  },
  {
    id: 'rf-3', name: 'Media → Bedroom Bleed',
    description: 'Media not acoustically separated from bedrooms',
    edges: [['MEDIA', 'PRI'], ['MEDIA', 'GUEST1'], ['MEDIA', 'GST1']],
    check: (m) => {
      const a = m['MEDIA-PRI'] || m['PRI-MEDIA'];
      const b = m['MEDIA-GUEST1'] || m['GUEST1-MEDIA'] || m['MEDIA-GST1'] || m['GST1-MEDIA'];
      return a === 'A' || a === 'N' || b === 'A' || b === 'N';
    },
  },
  {
    id: 'rf-4', name: 'Kitchen at Entry',
    description: 'Kitchen visible from entry',
    edges: [['KIT', 'FOY']],
    check: (m) => (m['KIT-FOY'] || m['FOY-KIT']) === 'A',
  },
  {
    id: 'rf-5', name: 'Guest Through Kitchen',
    description: 'Guest circulation routes through kitchen',
    edges: [['GUEST1', 'KIT'], ['GST1', 'KIT']],
    check: (m) => {
      const r = m['GUEST1-KIT'] || m['KIT-GUEST1'] || m['GST1-KIT'] || m['KIT-GST1'];
      return r === 'A' || r === 'N';
    },
  },
];


// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function computeHull(points, padding = 30) {
  if (points.length < 2) {
    const p = points[0];
    return Array.from({ length: 12 }, (_, i) => {
      const a = (2 * Math.PI * i) / 12;
      return [p[0] + padding * Math.cos(a), p[1] + padding * Math.sin(a)];
    });
  }
  if (points.length === 2) {
    const [a, b] = points;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const angle = Math.atan2(dy, dx);
    const result = [];
    for (let i = 0; i <= 6; i++) {
      const t = Math.PI / 2 + (Math.PI * i) / 6;
      result.push([a[0] + padding * Math.cos(t + angle), a[1] + padding * Math.sin(t + angle)]);
    }
    for (let i = 0; i <= 6; i++) {
      const t = -Math.PI / 2 + (Math.PI * i) / 6;
      result.push([b[0] + padding * Math.cos(t + angle), b[1] + padding * Math.sin(t + angle)]);
    }
    return result;
  }

  const hull = d3.polygonHull(points);
  if (!hull) return points.map(p => [p[0], p[1]]);
  const cx = d3.mean(hull, d => d[0]);
  const cy = d3.mean(hull, d => d[1]);
  return hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + (dx / dist) * padding, y + (dy / dist) * padding];
  });
}

function hullPath(pts) {
  if (!pts || pts.length < 3) return '';
  return d3.line().curve(d3.curveCatmullRomClosed.alpha(0.5))(pts);
}


// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function RelationshipDiagram({
  spaces,
  benchmarkMatrix,
  proposedMatrix,
  deviations = [],
  view = 'desired',
  width = 900,
  height = 650,
}) {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  const currentMatrix = view === 'desired' ? benchmarkMatrix : proposedMatrix;

  // ── Radius scale (sqrt of SF) ───────────────────────────────────────────
  const radiusScale = useMemo(() => {
    if (!spaces?.length) return () => 14;
    const maxSF = Math.max(...spaces.map(s => s.targetSF || 0), 100);
    return (sf) => {
      if (!sf || sf <= 0) return 13;
      return 13 + 19 * Math.sqrt(sf / maxSF);
    };
  }, [spaces]);

  // ── Red flags (proposed view) ───────────────────────────────────────────
  const triggeredRedFlags = useMemo(() => {
    if (view !== 'proposed' || !proposedMatrix) return [];
    return RED_FLAG_CHECKS.filter(rf => rf.check(proposedMatrix));
  }, [view, proposedMatrix]);

  const redFlagEdgeKeys = useMemo(() => {
    const keys = new Set();
    triggeredRedFlags.forEach(rf => {
      rf.edges.forEach(([from, to]) => { keys.add(`${from}-${to}`); keys.add(`${to}-${from}`); });
    });
    return keys;
  }, [triggeredRedFlags]);

  // ── Build edges from CURRENT matrix (re-computes on view toggle) ────────
  const edges = useMemo(() => {
    if (!currentMatrix || !spaces?.length) return [];
    const seen = new Set();
    const codeSet = new Set(spaces.map(s => s.code));
    const result = [];

    Object.entries(currentMatrix).forEach(([key, rel]) => {
      const [from, to] = key.split('-');
      if (!codeSet.has(from) || !codeSet.has(to)) return;
      const canonical = [from, to].sort().join('-');
      if (seen.has(canonical)) return;
      seen.add(canonical);

      const benchRel = benchmarkMatrix[key] || benchmarkMatrix[`${to}-${from}`];
      const propRel = proposedMatrix[key] || proposedMatrix[`${to}-${from}`];
      const isDeviation = view === 'proposed' && benchRel && propRel && benchRel !== propRel;
      const isRedFlag = (redFlagEdgeKeys.has(key) || redFlagEdgeKeys.has(`${to}-${from}`)) && view === 'proposed';

      result.push({ source: from, target: to, relationship: rel, isDeviation, isRedFlag, benchmarkRel: benchRel });
    });
    return result;
  }, [currentMatrix, benchmarkMatrix, proposedMatrix, spaces, view, redFlagEdgeKeys]);

  // ── SIMULATION — runs ONCE on spaces, pre-computed to completion ────────
  // Key: does NOT depend on edges/view, so layout is stable across toggle
  useEffect(() => {
    if (!spaces?.length) return;

    const margin = 60;
    const simW = width - margin * 2;
    const simH = height - margin * 2;

    // Build nodes (skip circulation/core nodes)
    const skipCodes = new Set(['CIRC1', 'CIRC2', 'CORE2']);
    const nodeData = spaces
      .filter(s => !skipCodes.has(s.code))
      .map(s => {
        const pos = ZONE_POSITIONS[s.zone] || { x: 0.5, y: 0.5 };
        return {
          id: s.code,
          name: s.name,
          zone: s.zone,
          level: s.level,
          targetSF: s.targetSF,
          radius: radiusScale(s.targetSF),
          x: margin + pos.x * simW + (Math.random() - 0.5) * 40,
          y: margin + pos.y * simH + (Math.random() - 0.5) * 40,
        };
      });

    // Use BENCHMARK matrix for layout links (stable regardless of view)
    const nodeIds = new Set(nodeData.map(n => n.id));
    const seen = new Set();
    const linkData = [];
    Object.entries(benchmarkMatrix).forEach(([key, rel]) => {
      const [from, to] = key.split('-');
      if (!nodeIds.has(from) || !nodeIds.has(to)) return;
      const can = [from, to].sort().join('-');
      if (seen.has(can)) return;
      seen.add(can);
      linkData.push({
        source: from, target: to, relationship: rel,
        distance: rel === 'A' ? 55 : rel === 'N' ? 90 : rel === 'B' ? 130 : 170,
        strength: rel === 'A' ? 0.7 : rel === 'N' ? 0.35 : rel === 'B' ? 0.12 : 0.05,
      });
    });

    const sim = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink(linkData).id(d => d.id).distance(d => d.distance).strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(-220).distanceMax(320))
      .force('collision', d3.forceCollide().radius(d => d.radius + 5).strength(0.8))
      .force('x', d3.forceX(d => { const p = ZONE_POSITIONS[d.zone] || { x: 0.5 }; return margin + p.x * simW; }).strength(0.12))
      .force('y', d3.forceY(d => { const p = ZONE_POSITIONS[d.zone] || { y: 0.5 }; return margin + p.y * simH; }).strength(0.12))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.015))
      .alphaDecay(0.025)
      .velocityDecay(0.35)
      .stop();

    // Pre-compute to completion — NO flicker
    for (let i = 0; i < 250; i++) {
      sim.tick();
      // Constrain bounds
      nodeData.forEach(d => {
        d.x = Math.max(margin + d.radius, Math.min(width - margin - d.radius, d.x));
        d.y = Math.max(margin + d.radius, Math.min(height - margin - d.radius, d.y));
      });
    }

    setNodes([...nodeData]);
    return () => sim.stop();
  }, [spaces, benchmarkMatrix, width, height, radiusScale]);

  // ── Derived lookups ─────────────────────────────────────────────────────
  const nodeMap = useMemo(() => {
    const m = {};
    nodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [nodes]);

  const zones = useMemo(() => {
    const m = {};
    (spaces || []).forEach(s => { if (!m[s.zone]) m[s.zone] = []; m[s.zone].push(s.code); });
    return m;
  }, [spaces]);

  const zoneHulls = useMemo(() => {
    if (!nodes.length) return [];
    const skip = new Set(['CIRC1', 'CIRC2', 'CORE2']);
    return Object.entries(zones).map(([zone, codes]) => {
      const zn = codes.filter(c => !skip.has(c)).map(c => nodeMap[c]).filter(Boolean);
      if (!zn.length) return null;
      const pts = zn.map(n => [n.x, n.y]);
      const maxR = Math.max(...zn.map(n => n.radius));
      const color = ZONE_COLORS[zone] || DEFAULT_ZONE;
      return {
        zone, path: hullPath(computeHull(pts, maxR + 18)), color,
        labelX: d3.mean(zn, n => n.x),
        labelY: Math.min(...zn.map(n => n.y)) - maxR - 20,
      };
    }).filter(Boolean);
  }, [nodes, zones, nodeMap]);

  // ── Hover helpers ───────────────────────────────────────────────────────
  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return new Set();
    const s = new Set([hoveredNode]);
    edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      if (src === hoveredNode) s.add(tgt);
      if (tgt === hoveredNode) s.add(src);
    });
    return s;
  }, [hoveredNode, edges]);

  const handleNodeEnter = useCallback((node, event) => {
    setHoveredNode(node.id);
    const r = svgRef.current?.getBoundingClientRect();
    if (r) setTooltipData({ x: event.clientX - r.left, y: event.clientY - r.top, node });
  }, []);

  const handleNodeLeave = useCallback(() => { setHoveredNode(null); setTooltipData(null); }, []);

  const getNodeOpacity = useCallback((id) => {
    if (!hoveredNode) return 1;
    return connectedNodes.has(id) ? 1 : 0.15;
  }, [hoveredNode, connectedNodes]);

  const getEdgeOpacity = useCallback((edge) => {
    const base = EDGE_STYLES[edge.relationship]?.baseOpacity || 0.5;
    if (!hoveredNode) return base;
    const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
    return (connectedNodes.has(s) && connectedNodes.has(t)) ? Math.min(base + 0.35, 1) : 0.05;
  }, [hoveredNode, connectedNodes]);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!spaces?.length || !nodes.length) return null;

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="rd-container" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="rd-svg"
        style={{ width: '100%', height: 'auto', maxHeight: height, background: COLORS.background, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}
      >
        <defs>
          <filter id="rd-glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rd-glow-amber" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Zone hulls */}
        {zoneHulls.map(h => (
          <g key={h.zone}>
            <path d={h.path} fill={h.color.fill} stroke={h.color.stroke} strokeWidth={1}
              opacity={hoveredNode ? 0.35 : 0.65} style={{ transition: 'opacity 0.2s ease' }} />
            <text x={h.labelX} y={h.labelY} textAnchor="middle" fill={h.color.text}
              fontSize="10" fontWeight="600" fontFamily="Inter, -apple-system, sans-serif"
              letterSpacing="0.04em" opacity={hoveredNode ? 0.25 : 0.65}
              style={{ textTransform: 'uppercase', transition: 'opacity 0.2s ease' }}>
              {h.zone}
            </text>
          </g>
        ))}

        {/* Edges */}
        {edges.map((edge, i) => {
          const src = nodeMap[typeof edge.source === 'object' ? edge.source.id : edge.source];
          const tgt = nodeMap[typeof edge.target === 'object' ? edge.target.id : edge.target];
          if (!src || !tgt) return null;
          const st = EDGE_STYLES[edge.relationship] || EDGE_STYLES.N;
          const op = getEdgeOpacity(edge);
          const hiSrc = typeof edge.source === 'object' ? edge.source.id : edge.source;
          const hiTgt = typeof edge.target === 'object' ? edge.target.id : edge.target;
          const isHoverEdge = hoveredNode && connectedNodes.has(hiSrc) && connectedNodes.has(hiTgt);

          return (
            <g key={`e-${i}`}>
              {/* Red flag glow */}
              {edge.isRedFlag && (
                <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke={COLORS.error} strokeWidth={st.width + 6} opacity={0.25}
                  filter="url(#rd-glow-red)" className="rd-glow-red" />
              )}
              {/* Deviation glow */}
              {edge.isDeviation && !edge.isRedFlag && (
                <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke={COLORS.warning} strokeWidth={st.width + 4} opacity={0.2}
                  filter="url(#rd-glow-amber)" className="rd-glow-amber" />
              )}
              {/* Main line */}
              <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                stroke={edge.isRedFlag ? COLORS.error : st.color}
                strokeWidth={(edge.isDeviation || edge.isRedFlag) ? st.width + 1 : st.width}
                strokeDasharray={st.dash} opacity={op} strokeLinecap="round"
                style={{ transition: 'opacity 0.2s ease' }} />
              {/* Deviation diamond at midpoint */}
              {edge.isDeviation && (
                <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2})`}>
                  <polygon points="0,-5 5,0 0,5 -5,0"
                    fill={edge.isRedFlag ? COLORS.error : COLORS.warning} opacity={op} />
                  {isHoverEdge && (
                    <text y={-10} textAnchor="middle" fontSize="9" fontWeight="600"
                      fill={edge.isRedFlag ? COLORS.error : COLORS.warning}
                      fontFamily="Inter, -apple-system, sans-serif">
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
          const op = getNodeOpacity(node.id);
          const zc = ZONE_COLORS[node.zone] || DEFAULT_ZONE;
          const isHov = hoveredNode === node.id;
          const involvedInFlag = view === 'proposed' && triggeredRedFlags.some(rf =>
            rf.edges.some(([a, b]) => a === node.id || b === node.id)
          );

          return (
            <g key={node.id} className="rd-node" opacity={op}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
              onMouseEnter={(e) => handleNodeEnter(node, e)} onMouseLeave={handleNodeLeave}>
              {/* Red flag halo */}
              {involvedInFlag && (
                <circle cx={node.x} cy={node.y} r={node.radius + 6}
                  fill="none" stroke={COLORS.error} strokeWidth={2}
                  opacity={0.4} className="rd-glow-red" />
              )}
              {/* Gold hover ring */}
              {isHov && (
                <circle cx={node.x} cy={node.y} r={node.radius + 4}
                  fill="none" stroke={COLORS.gold} strokeWidth={2} opacity={0.8} />
              )}
              {/* Outer circle */}
              <circle cx={node.x} cy={node.y} r={node.radius}
                fill={COLORS.surface}
                stroke={isHov ? COLORS.navy : zc.stroke}
                strokeWidth={isHov ? 2.5 : 1.5} />
              {/* Inner zone tint */}
              <circle cx={node.x} cy={node.y} r={node.radius - 3}
                fill={zc.node} opacity={0.45} />
              {/* Label */}
              <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="central"
                fontSize={node.radius > 22 ? '10' : '8'} fontWeight="600"
                fill={COLORS.text} fontFamily="Inter, -apple-system, sans-serif"
                style={{ pointerEvents: 'none' }}>
                {node.id}
              </text>
            </g>
          );
        })}

        {/* Red flag badges (! markers on nodes) */}
        {view === 'proposed' && triggeredRedFlags.length > 0 && nodes.map(node => {
          const flags = triggeredRedFlags.filter(rf =>
            rf.edges.some(([a, b]) => a === node.id || b === node.id)
          );
          if (!flags.length) return null;
          const bx = node.x + node.radius * 0.7;
          const by = node.y - node.radius * 0.7;
          return (
            <g key={`rfb-${node.id}`}>
              <circle cx={bx} cy={by} r={7} fill={COLORS.error} />
              <text x={bx} y={by} textAnchor="middle" dominantBaseline="central"
                fontSize="8" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif"
                style={{ pointerEvents: 'none' }}>!</text>
            </g>
          );
        })}
      </svg>

      {/* ── Tooltip ──────────────────────────────────────────────────────── */}
      {tooltipData && (
        <div className="rd-tooltip" style={{
          position: 'absolute',
          left: Math.min(tooltipData.x + 14, width - 210),
          top: Math.max(tooltipData.y - 70, 8),
        }}>
          <div className="rd-tooltip__name">{tooltipData.node.name}</div>
          <div className="rd-tooltip__badges">
            <span className="rd-tooltip__zone" style={{
              backgroundColor: (ZONE_COLORS[tooltipData.node.zone] || DEFAULT_ZONE).fill,
              color: (ZONE_COLORS[tooltipData.node.zone] || DEFAULT_ZONE).text,
            }}>
              {tooltipData.node.zone}
            </span>
            <span className="rd-tooltip__code">{tooltipData.node.id}</span>
          </div>
          {tooltipData.node.targetSF > 0 && (
            <div className="rd-tooltip__sf">{tooltipData.node.targetSF.toLocaleString()} SF target</div>
          )}
          <div className="rd-tooltip__connections">
            {edges
              .filter(e => {
                const s = typeof e.source === 'object' ? e.source.id : e.source;
                const t = typeof e.target === 'object' ? e.target.id : e.target;
                return s === tooltipData.node.id || t === tooltipData.node.id;
              })
              .slice(0, 6)
              .map((e, i) => {
                const s = typeof e.source === 'object' ? e.source.id : e.source;
                const t = typeof e.target === 'object' ? e.target.id : e.target;
                const other = s === tooltipData.node.id ? t : s;
                const est = EDGE_STYLES[e.relationship];
                return (
                  <div key={i} className="rd-tooltip__conn-row">
                    <span style={{ color: est.color, fontWeight: 600, minWidth: '12px' }}>{e.relationship}</span>
                    <span className="rd-tooltip__conn-arrow">→</span>
                    <span style={{ fontWeight: 500 }}>{other}</span>
                    {e.isDeviation && <span className="rd-tooltip__changed">(changed)</span>}
                    {e.isRedFlag && <span className="rd-tooltip__flag">⚠</span>}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Legend Bar ────────────────────────────────────────────────────── */}
      <div className="rd-legend">
        <div className="rd-legend__section">
          <span className="rd-legend__title">Relationships</span>
          <div className="rd-legend__items">
            {Object.entries(EDGE_STYLES).map(([key, st]) => (
              <div key={key} className="rd-legend__item">
                <svg width="24" height="10">
                  <line x1="0" y1="5" x2="24" y2="5" stroke={st.color} strokeWidth={st.width} strokeDasharray={st.dash} />
                </svg>
                <span className="rd-legend__code">{key}</span>
                <span className="rd-legend__label">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
        {view === 'proposed' && deviations.length > 0 && (
          <div className="rd-legend__section">
            <span className="rd-legend__divider" />
            <div className="rd-legend__items">
              <div className="rd-legend__item">
                <svg width="12" height="12"><polygon points="6,1 11,6 6,11 1,6" fill={COLORS.warning} /></svg>
                <span className="rd-legend__label" style={{ color: COLORS.warning }}>Deviation from benchmark</span>
              </div>
              {triggeredRedFlags.length > 0 && (
                <div className="rd-legend__item">
                  <svg width="12" height="12"><circle cx="6" cy="6" r="6" fill={COLORS.error} /><text x="6" y="6.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="8" fontWeight="700">!</text></svg>
                  <span className="rd-legend__label" style={{ color: COLORS.error }}>Red flag ({triggeredRedFlags.length})</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="rd-legend__section rd-legend__size">
          <span className="rd-legend__title">Bubble Size</span>
          <span className="rd-legend__note">∝ target square footage</span>
        </div>
      </div>

      {/* ── Abbreviation Index ───────────────────────────────────────────── */}
      <div className="rd-abbrev">
        <span className="rd-abbrev__title">Abbreviation Index</span>
        <div className="rd-abbrev__grid">
          {nodes.slice().sort((a, b) => a.id.localeCompare(b.id)).map(n => (
            <span key={n.id} className="rd-abbrev__item">
              <strong>{n.id}</strong> {n.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Red Flag Summary ─────────────────────────────────────────────── */}
      {view === 'proposed' && triggeredRedFlags.length > 0 && (
        <div className="rd-flags">
          <div className="rd-flags__header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>{triggeredRedFlags.length} Red Flag{triggeredRedFlags.length !== 1 ? 's' : ''} Detected</span>
          </div>
          <div className="rd-flags__list">
            {triggeredRedFlags.map(f => (
              <div key={f.id} className="rd-flags__item">
                <span className="rd-flags__name">{f.name}</span>
                <span className="rd-flags__desc">{f.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Styles ───────────────────────────────────────────────────────── */}
      <style>{styles}</style>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════════════════

const styles = `
/* Glow animations */
@keyframes rd-pulse-red  { 0%,100%{opacity:0.15} 50%{opacity:0.4} }
@keyframes rd-pulse-gold { 0%,100%{opacity:0.10} 50%{opacity:0.25} }
.rd-glow-red  { animation: rd-pulse-red 2s ease-in-out infinite; }
.rd-glow-amber { animation: rd-pulse-gold 2.5s ease-in-out infinite; }
.rd-node:hover circle { filter: brightness(0.97); }

/* Tooltip */
.rd-tooltip {
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Inter', -apple-system, sans-serif;
  pointer-events: none;
  z-index: 10;
  min-width: 160px;
  max-width: 240px;
}
.rd-tooltip__name { font-size: 13px; font-weight: 600; color: ${COLORS.text}; margin-bottom: 4px; }
.rd-tooltip__badges { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.rd-tooltip__zone { padding: 1px 7px; border-radius: 3px; font-size: 10px; font-weight: 500; }
.rd-tooltip__code { font-family: 'SF Mono', Monaco, monospace; font-size: 10px; font-weight: 600; color: ${COLORS.navy}; }
.rd-tooltip__sf { font-size: 11px; color: ${COLORS.textMuted}; margin-bottom: 4px; }
.rd-tooltip__connections { border-top: 1px solid ${COLORS.border}; padding-top: 5px; margin-top: 2px; }
.rd-tooltip__conn-row { display: flex; align-items: center; gap: 4px; font-size: 10px; color: ${COLORS.textMuted}; line-height: 1.7; }
.rd-tooltip__conn-arrow { opacity: 0.4; }
.rd-tooltip__changed { color: ${COLORS.warning}; font-size: 9px; }
.rd-tooltip__flag { color: ${COLORS.error}; font-size: 10px; }

/* Legend */
.rd-legend {
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  padding: 10px 16px; margin-top: 8px;
  background: #f8f9fa; border-radius: 6px; border: 1px solid ${COLORS.border};
  font-family: 'Inter', -apple-system, sans-serif;
}
.rd-legend__section { display: flex; align-items: center; gap: 8px; }
.rd-legend__title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: ${COLORS.textMuted}; }
.rd-legend__items { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.rd-legend__item { display: flex; align-items: center; gap: 4px; }
.rd-legend__code { font-size: 11px; font-weight: 600; color: ${COLORS.text}; }
.rd-legend__label { font-size: 10px; color: ${COLORS.textMuted}; }
.rd-legend__divider { width: 1px; height: 16px; background: ${COLORS.border}; }
.rd-legend__size { margin-left: auto; gap: 6px; }
.rd-legend__note { font-size: 10px; color: ${COLORS.textMuted}; font-style: italic; }

/* Abbreviation Index */
.rd-abbrev {
  margin-top: 8px; padding: 10px 16px;
  background: #f8f9fa; border-radius: 6px; border: 1px solid ${COLORS.border};
}
.rd-abbrev__title {
  display: block; font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.04em; color: ${COLORS.textMuted}; margin-bottom: 6px;
  font-family: 'Inter', -apple-system, sans-serif;
}
.rd-abbrev__grid { display: flex; flex-wrap: wrap; gap: 3px 14px; }
.rd-abbrev__item { font-size: 11px; color: #495057; white-space: nowrap; font-family: 'Inter', -apple-system, sans-serif; }
.rd-abbrev__item strong { color: ${COLORS.navy}; font-family: 'SF Mono', Monaco, monospace; font-size: 10px; margin-right: 3px; }

/* Red Flag Summary */
.rd-flags {
  margin-top: 8px; padding: 12px 16px;
  background: #fff5f5; border: 1px solid #f5c6c6; border-radius: 6px;
  font-family: 'Inter', -apple-system, sans-serif;
}
.rd-flags__header {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: ${COLORS.error}; margin-bottom: 8px;
}
.rd-flags__list { display: flex; flex-direction: column; gap: 6px; }
.rd-flags__item { display: flex; flex-direction: column; gap: 1px; padding: 6px 10px; background: rgba(211,47,47,0.04); border-radius: 4px; }
.rd-flags__name { font-size: 12px; font-weight: 600; color: ${COLORS.error}; }
.rd-flags__desc { font-size: 11px; color: ${COLORS.textMuted}; }
`;
