/**
 * MVPReportGenerator.js
 *
 * Generates comprehensive MVP Report PDF following N4S brand standards.
 * Uses jsPDF + jspdf-autotable for tables and direct drawing for diagrams.
 *
 * Report Sections:
 * 1. Cover Page — branding, project info, validation score, status
 * 2. Executive Summary — narrative overview
 * 3. Space Program Overview — zone summary table
 * 4. Layout Decisions — 10 adjacency decisions table
 * 5. Relationship Diagram (Desired) — benchmark bubble diagram
 * 6. Relationship Diagram (Proposed) — with deviations & red flags
 * 7. Adjacency Matrix — compact comparison
 * 8. Validation Scorecard — overall + 8 module scores
 * 9. Red Flags & Bridges — assessment panels
 * 10. Deviations Register — full change list
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ═══════════════════════════════════════════════════════════════════════════════
// N4S BRAND CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  navy:       [30, 58, 95],
  gold:       [201, 162, 39],
  mvpGreen:   [175, 189, 176],  // #AFBDB0 MVP header
  text:       [26, 26, 26],
  textMuted:  [107, 107, 107],
  background: [250, 250, 248],
  border:     [229, 229, 224],
  accentLight:[245, 240, 232],
  white:      [255, 255, 255],
  success:    [46, 125, 50],
  warning:    [245, 124, 0],
  error:      [211, 47, 47],
  adjA:       [76, 175, 80],
  adjN:       [33, 150, 243],
  adjB:       [255, 152, 0],
  adjS:       [244, 67, 54],
};

// Zone colors for diagram rendering (RGB)
const ZONE_RGB = {
  'Entry + Formal':   { fill: [232,237,243], stroke: [141,164,196], node: [212,221,233] },
  'Arrival + Formal': { fill: [232,237,243], stroke: [141,164,196], node: [212,221,233] },
  'Family Hub':       { fill: [238,243,232], stroke: [164,196,141], node: [221,233,212] },
  'Service':          { fill: [240,236,228], stroke: [196,180,141], node: [229,221,208] },
  'Service Core':     { fill: [240,236,228], stroke: [196,180,141], node: [229,221,208] },
  'Wellness':         { fill: [228,240,239], stroke: [141,196,189], node: [208,229,226] },
  'Outdoor':          { fill: [232,242,228], stroke: [141,196,141], node: [212,233,208] },
  'Primary Wing':     { fill: [240,232,239], stroke: [196,141,188], node: [229,212,226] },
  'Guest Wing':       { fill: [240,236,232], stroke: [196,164,141], node: [229,221,212] },
  'Guest Wing Node':  { fill: [240,236,232], stroke: [196,164,141], node: [229,221,212] },
  'Hospitality':      { fill: [240,236,232], stroke: [196,164,141], node: [229,221,212] },
  'Circulation':      { fill: [236,236,236], stroke: [176,176,176], node: [224,224,224] },
  'Support':          { fill: [236,236,236], stroke: [176,176,176], node: [224,224,224] },
};
const DEFAULT_ZONE_RGB = { fill: [240,240,240], stroke: [176,176,176], node: [232,232,232] };

// Zone anchor positions for diagram layout
const ZONE_POS = {
  // Preset zone names
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
  // FYI zone names (from space-registry.js)
  'Arrival + Public':  { x: 0.22, y: 0.18 },
  'Family + Kitchen':  { x: 0.52, y: 0.30 },
  'Entertainment':     { x: 0.62, y: 0.18 },
  'Primary Suite':     { x: 0.15, y: 0.60 },
  'Guest + Secondary': { x: 0.38, y: 0.72 },
  'Service + BOH':     { x: 0.85, y: 0.50 },
  'Outdoor Spaces':    { x: 0.48, y: 0.82 },
  'Guest House':       { x: 0.30, y: 0.88 },
  'Pool House':        { x: 0.55, y: 0.88 },
};

// Edge styles for diagram
const EDGE_DRAW = {
  A: { color: C.adjA, width: 0.7, dash: [] },
  N: { color: C.adjN, width: 0.5, dash: [] },
  B: { color: C.adjB, width: 0.4, dash: [1.5, 1] },
  S: { color: C.adjS, width: 0.3, dash: [0.8, 0.8] },
};

// Red flag definitions
const RED_FLAGS = [
  { id: 'rf-1', name: 'Guest > Primary Suite', desc: 'Primary suite directly accessible from guest areas',
    check: m => { const r = m['GUEST1-PRI']||m['PRI-GUEST1']||m['GST1-PRI']||m['PRI-GST1']; return r==='A'||r==='N'; },
    edges: [['GUEST1','PRI'],['GST1','PRI']] },
  { id: 'rf-2', name: 'Delivery > Front of House', desc: 'Service connects through formal areas',
    check: m => { const a=m['GAR-FOY']||m['FOY-GAR'], b=m['GAR-GR']||m['GR-GAR']; return a==='A'||a==='N'||b==='A'; },
    edges: [['GAR','FOY'],['GAR','GR']] },
  { id: 'rf-3', name: 'Media > Bedroom Bleed', desc: 'Media not acoustically separated from bedrooms',
    check: m => { const a=m['MEDIA-PRI']||m['PRI-MEDIA'], b=m['MEDIA-GUEST1']||m['GUEST1-MEDIA']||m['MEDIA-GST1']||m['GST1-MEDIA']; return a==='A'||a==='N'||b==='A'||b==='N'; },
    edges: [['MEDIA','PRI'],['MEDIA','GUEST1']] },
  { id: 'rf-4', name: 'Kitchen at Entry', desc: 'Kitchen visible from entry',
    check: m => (m['KIT-FOY']||m['FOY-KIT'])==='A',
    edges: [['KIT','FOY']] },
  { id: 'rf-5', name: 'Guest Through Kitchen', desc: 'Guest circulation routes through kitchen',
    check: m => { const r=m['GUEST1-KIT']||m['KIT-GUEST1']||m['GST1-KIT']||m['KIT-GST1']; return r==='A'||r==='N'; },
    edges: [['GUEST1','KIT'],['GST1','KIT']] },
];

// Module definitions
const MODULES = [
  { id: 'module-01', name: 'Kitchen Rules Engine', spaces: ['KIT','CHEF','SCUL','BKF','DR'] },
  { id: 'module-02', name: 'Entertaining Spine', spaces: ['GR','DR','WINE','FOY','TERR'] },
  { id: 'module-03', name: 'Primary Suite Ecosystem', spaces: ['PRI','PRIBATH','PRICL','PRILOUNGE'] },
  { id: 'module-04', name: 'Guest Wing Logic', spaces: ['GUEST1','GUEST2','GUEST3','GST1','GST2'] },
  { id: 'module-05', name: 'Media & Acoustic Control', spaces: ['MEDIA','THR','FR'] },
  { id: 'module-06', name: 'Service Spine', spaces: ['SCUL','MUD','LND','MEP','GAR'] },
  { id: 'module-07', name: 'Wellness Program', spaces: ['GYM','SPA','POOL','WLINK','POOLSUP'] },
  { id: 'module-08', name: 'Staff Layer', spaces: ['STF','STFQ','OPSCORE'] },
];

// Bridge definitions
const BRIDGES = [
  { id: 'butlerPantry', name: 'Butler Pantry', desc: 'Service staging between kitchen and dining' },
  { id: 'guestAutonomy', name: 'Guest Autonomy', desc: 'Independent guest suite access' },
  { id: 'soundLock', name: 'Sound Lock', desc: 'Acoustic buffer for media spaces' },
  { id: 'wetFeetIntercept', name: 'Wet-Feet Intercept', desc: 'Pool to house transition zone' },
  { id: 'opsCore', name: 'Ops Core', desc: 'Service entry and operations hub' },
];


// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const fmtDate = (d) => new Date(d || Date.now()).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
const fmtNum = (n) => (n || 0).toLocaleString();

function computeModuleScores(deviations, benchmarkMatrix) {
  return MODULES.map(mod => {
    const modDevs = deviations.filter(d => mod.spaces.includes(d.fromSpace) || mod.spaces.includes(d.toSpace));
    let benchCount = 0;
    Object.keys(benchmarkMatrix).forEach(k => {
      const [f, t] = k.split('-');
      if (mod.spaces.includes(f) || mod.spaces.includes(t)) benchCount++;
    });
    const penalty = benchCount > 0 ? (modDevs.length / benchCount) * 50 : 0;
    const score = Math.max(0, Math.round(100 - penalty));
    return { ...mod, score, passed: score >= 80, deviationCount: modDevs.length };
  });
}

function computeOverallScore(moduleScores, triggeredFlags) {
  if (!moduleScores.length) return 100;
  const base = Math.round(moduleScores.reduce((s, m) => s + m.score, 0) / moduleScores.length);
  return Math.max(0, base - triggeredFlags.length * 5);
}


// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAM DRAWING (vector, directly into jsPDF)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pre-compute node layout using a simple force-directed approach.
 * This is a lightweight version for PDF — doesn't need D3.
 */
function layoutNodes(spaces, matrix, boxW, boxH, offsetX, offsetY) {
  const margin = 12;
  const w = boxW - margin * 2;
  const h = boxH - margin * 2;
  const skip = new Set(['CIRC1','CIRC2','CORE2']);

  // Build nodes with initial zone-anchored positions
  const nodes = spaces.filter(s => !skip.has(s.code)).map(s => {
    const pos = ZONE_POS[s.zoneName] || ZONE_POS[s.zone] || { x: 0.5, y: 0.5 };
    const maxSF = Math.max(...spaces.map(sp => sp.targetSF || 0), 100);
    const r = 2.5 + 4.5 * Math.sqrt((s.targetSF || 100) / maxSF);
    return {
      id: s.code, name: s.name, zone: s.zoneName || s.zone, targetSF: s.targetSF, r,
      x: offsetX + margin + pos.x * w + (Math.random() - 0.5) * 8,
      y: offsetY + margin + pos.y * h + (Math.random() - 0.5) * 8,
    };
  });

  // Build links
  const nodeIds = new Set(nodes.map(n => n.id));
  const seen = new Set();
  const links = [];
  Object.entries(matrix).forEach(([key, rel]) => {
    const [from, to] = key.split('-');
    if (!nodeIds.has(from) || !nodeIds.has(to)) return;
    const can = [from, to].sort().join('-');
    if (seen.has(can)) return;
    seen.add(can);
    links.push({ source: from, target: to, rel });
  });

  // Simple iterative layout (150 iterations)
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  for (let iter = 0; iter < 150; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
        if (dist < 40) {
          const force = 1.2 / (dist * dist);
          dx *= force; dy *= force;
          a.x -= dx; a.y -= dy;
          b.x += dx; b.y += dy;
        }
      }
    }
    // Attraction along links
    links.forEach(l => {
      const a = nodeMap[l.source], b = nodeMap[l.target];
      if (!a || !b) return;
      const idealDist = l.rel === 'A' ? 12 : l.rel === 'N' ? 20 : l.rel === 'B' ? 30 : 40;
      let dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 0.1;
      const force = (dist - idealDist) * 0.02;
      dx = (dx / dist) * force;
      dy = (dy / dist) * force;
      a.x += dx; a.y += dy;
      b.x -= dx; b.y -= dy;
    });
    // Zone pull
    nodes.forEach(n => {
      const pos = ZONE_POS[n.zone] || { x: 0.5, y: 0.5 };
      const tx = offsetX + margin + pos.x * w;
      const ty = offsetY + margin + pos.y * h;
      n.x += (tx - n.x) * 0.04;
      n.y += (ty - n.y) * 0.04;
    });
    // Bound
    nodes.forEach(n => {
      n.x = Math.max(offsetX + margin + n.r, Math.min(offsetX + boxW - margin - n.r, n.x));
      n.y = Math.max(offsetY + margin + n.r, Math.min(offsetY + boxH - margin - n.r, n.y));
    });
  }

  return { nodes, links, nodeMap };
}

function drawDiagram(doc, layout, matrix, options = {}) {
  const { nodes, links, nodeMap } = layout;
  const { showDeviations, benchmarkMatrix, redFlagEdgeKeys, boxX, boxY, boxW, boxH } = options;

  // Background
  doc.setFillColor(...C.background);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'S');

  // Zone hulls (simple: draw filled ellipses around zone clusters)
  const zoneGroups = {};
  nodes.forEach(n => {
    if (!zoneGroups[n.zone]) zoneGroups[n.zone] = [];
    zoneGroups[n.zone].push(n);
  });
  Object.entries(zoneGroups).forEach(([zone, zns]) => {
    if (zns.length === 0) return;
    const zc = ZONE_RGB[zone] || DEFAULT_ZONE_RGB;
    const cx = zns.reduce((s, n) => s + n.x, 0) / zns.length;
    const cy = zns.reduce((s, n) => s + n.y, 0) / zns.length;
    let maxDist = 0;
    zns.forEach(n => {
      const d = Math.sqrt((n.x-cx)**2 + (n.y-cy)**2) + n.r;
      if (d > maxDist) maxDist = d;
    });
    const rx = Math.max(maxDist + 6, 15);
    const ry = Math.max(maxDist + 4, 12);
    doc.setFillColor(...zc.fill);
    doc.ellipse(cx, cy, rx, ry, 'F');

    // Zone label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.setTextColor(...zc.stroke);
    doc.text(zone.toUpperCase(), cx, cy - ry - 1.5, { align: 'center' });
  });

  // Edges
  links.forEach(l => {
    const a = nodeMap[l.source], b = nodeMap[l.target];
    if (!a || !b) return;
    const rel = matrix[`${l.source}-${l.target}`] || matrix[`${l.target}-${l.source}`] || l.rel;
    const style = EDGE_DRAW[rel] || EDGE_DRAW.N;
    const edgeKey1 = `${l.source}-${l.target}`;
    const edgeKey2 = `${l.target}-${l.source}`;
    const isRedFlag = redFlagEdgeKeys && (redFlagEdgeKeys.has(edgeKey1) || redFlagEdgeKeys.has(edgeKey2));
    const isDeviation = showDeviations && benchmarkMatrix && (
      (benchmarkMatrix[edgeKey1] || benchmarkMatrix[edgeKey2]) !== rel
    );

    if (isRedFlag) {
      doc.setDrawColor(...C.error);
      doc.setLineWidth(style.width + 0.6);
    } else if (isDeviation) {
      doc.setDrawColor(...C.warning);
      doc.setLineWidth(style.width + 0.3);
    } else {
      doc.setDrawColor(...style.color);
      doc.setLineWidth(style.width);
    }

    if (style.dash.length > 0) {
      doc.setLineDashPattern(style.dash, 0);
    } else {
      doc.setLineDashPattern([], 0);
    }
    doc.line(a.x, a.y, b.x, b.y);

    // Deviation diamond
    if (isDeviation) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      doc.setFillColor(...(isRedFlag ? C.error : C.warning));
      doc.setLineDashPattern([], 0);
      const d = 1.2;
      // Draw diamond manually via triangle pairs
      doc.triangle(mx, my - d, mx + d, my, mx, my + d, 'F');
      doc.triangle(mx, my - d, mx - d, my, mx, my + d, 'F');
    }
  });
  doc.setLineDashPattern([], 0);

  // Nodes
  nodes.forEach(n => {
    const zc = ZONE_RGB[n.zone] || DEFAULT_ZONE_RGB;
    // Outer circle
    doc.setFillColor(...C.white);
    doc.setDrawColor(...zc.stroke);
    doc.setLineWidth(0.3);
    doc.circle(n.x, n.y, n.r, 'FD');
    // Inner tint
    doc.setFillColor(...zc.node);
    doc.circle(n.x, n.y, n.r * 0.75, 'F');
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(n.r > 5 ? 4 : 3);
    doc.setTextColor(...C.text);
    doc.text(n.id, n.x, n.y + 0.8, { align: 'center' });
  });
}

function drawDiagramLegend(doc, x, y, w) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(...C.textMuted);
  doc.text('RELATIONSHIPS', x, y);
  let lx = x + 22;
  Object.entries(EDGE_DRAW).forEach(([key, st]) => {
    doc.setDrawColor(...st.color);
    doc.setLineWidth(st.width);
    if (st.dash.length) doc.setLineDashPattern(st.dash, 0);
    else doc.setLineDashPattern([], 0);
    doc.line(lx, y - 1, lx + 6, y - 1);
    doc.setLineDashPattern([], 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(...C.text);
    doc.text(key, lx + 8, y);
    const labels = { A: 'Adjacent', N: 'Near', B: 'Buffered', S: 'Separate' };
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textMuted);
    doc.text(labels[key], lx + 12, y);
    lx += 28;
  });
  // Deviation + Red flag symbols
  doc.setFillColor(...C.warning);
  const symX = lx + 4;
  doc.triangle(symX, y - 2, symX + 1.5, y, symX, y + 0.5, 'F');
  doc.triangle(symX, y - 2, symX - 1.5, y, symX, y + 0.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(...C.warning);
  doc.text('Deviation', symX + 3, y);

  doc.setFillColor(...C.error);
  doc.circle(symX + 22, y - 0.8, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.5);
  doc.setTextColor(...C.white);
  doc.text('!', symX + 22, y - 0.3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(...C.error);
  doc.text('Red Flag', symX + 25, y);
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate comprehensive MVP Report PDF
 *
 * @param {Object} config
 * @param {string} config.clientName - Principal client name
 * @param {string} config.secondaryName - Secondary client name (optional)
 * @param {string} config.projectName - Project name
 * @param {Object} config.estimatedTier - { tier, label, color }
 * @param {Object} config.presetData - From getPreset() — adjacencyMatrix, bridgeConfig, etc.
 * @param {Object} config.fyiProgram - From transformFYIToMVPProgram — live FYI spaces + totals
 * @param {Object} config.benchmarkMatrix - Lookup { 'FROM-TO': 'A' }
 * @param {Object} config.proposedMatrix - After decisions applied
 * @param {Array}  config.deviations - [{ fromSpace, toSpace, desired, proposed }]
 * @param {Object} config.decisionAnswers - { decisionId: optionId }
 * @param {Array}  config.decisions - ADJACENCY_DECISIONS array
 * @param {Object} config.bridgeConfig - Preset bridge requirements
 * @param {Set}    config.enabledBridges - Bridges enabled by decisions
 */
export async function generateMVPReport(config) {
  const {
    clientName = 'Client',
    secondaryName,
    projectName = 'Luxury Residence',
    estimatedTier = { tier: '15K', label: 'Grand (15,000 SF)' },
    presetData,
    fyiProgram,
    benchmarkMatrix = {},
    proposedMatrix = {},
    deviations = [],
    decisionAnswers = {},
    decisions = [],
    bridgeConfig = {},
    enabledBridges = new Set(),
  } = config;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();   // 210
  const ph = doc.internal.pageSize.getHeight();   // 297
  const margin = 15;
  const cw = pw - margin * 2;
  let y = 0;
  let pageNum = 1;

  // GOLDEN RULE: Use FYI live data for spaces/SF when available, preset as fallback
  const spaces = (fyiProgram?.spaces?.length > 0) ? fyiProgram.spaces : (presetData?.spaces || []);
  const totalSFFromFYI = fyiProgram?.totals?.totalConditionedSF || null;
  const totalSF = totalSFFromFYI || spaces.reduce((s, sp) => s + (sp.targetSF || 0), 0);
  const triggeredFlags = RED_FLAGS.filter(rf => rf.check(proposedMatrix));
  const redFlagEdgeKeys = new Set();
  triggeredFlags.forEach(rf => rf.edges.forEach(([a, b]) => { redFlagEdgeKeys.add(`${a}-${b}`); redFlagEdgeKeys.add(`${b}-${a}`); }));
  const moduleScores = computeModuleScores(deviations, benchmarkMatrix);
  const overallScore = computeOverallScore(moduleScores, triggeredFlags);
  const allPassed = triggeredFlags.length === 0 && overallScore >= 80;
  const statusLabel = allPassed ? 'PASS - Brief Ready' : overallScore >= 60 ? 'REVIEW RECOMMENDED' : 'ATTENTION REQUIRED';
  const statusColor = allPassed ? C.success : overallScore >= 60 ? C.warning : C.error;

  // ── Header / Footer helpers ─────────────────────────────────────────────
  const addHeader = () => {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, pw, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text('N4S', margin, 7);
    doc.setFont('helvetica', 'normal');
    doc.text('Mansion Validation Report', pw - margin, 7, { align: 'right' });
  };

  const addFooter = (pn) => {
    const fy = ph - 8;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(margin, fy - 2, pw - margin, fy - 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    doc.text('(C) 2026 Not4Sale LLC - Confidential', margin, fy);
    doc.text(`Page ${pn}`, pw / 2, fy, { align: 'center' });
    doc.text(fmtDate(new Date()), pw - margin, fy, { align: 'right' });
  };

  const newPage = () => {
    doc.addPage();
    pageNum++;
    addHeader();
    addFooter(pageNum);
    return 18;
  };

  const checkBreak = (needed) => {
    if (y + needed > ph - 15) y = newPage();
    return y;
  };

  const sectionHeader = (title, minContent = 20) => {
    y = checkBreak(8 + minContent);
    doc.setFillColor(...C.navy);
    doc.roundedRect(margin, y, cw, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(title, margin + 3, y + 5.5);
    y += 12;
  };


  // ═════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═════════════════════════════════════════════════════════════════════════

  addHeader();
  addFooter(pageNum);
  y = 30;

  // Title block
  doc.setFillColor(...C.accentLight);
  doc.roundedRect(margin, y, cw, 48, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.navy);
  doc.text('Mansion Validation Report', margin + 8, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C.text);
  doc.text(projectName, margin + 8, y + 26);

  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  const clientLine = secondaryName ? `${clientName} & ${secondaryName}` : clientName;
  doc.text(clientLine, margin + 8, y + 33);
  doc.text(fmtDate(new Date()), margin + 8, y + 39);

  // Tier badge
  doc.setFillColor(...C.navy);
  doc.roundedRect(pw - margin - 38, y + 6, 33, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text(`${estimatedTier.tier} TIER`, pw - margin - 21.5, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.textMuted);
  doc.text(estimatedTier.label, pw - margin - 21.5, y + 25, { align: 'center' });

  y += 56;

  // Score circle
  const scoreX = pw / 2;
  const scoreY = y + 30;
  const scoreR = 22;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(2);
  doc.circle(scoreX, scoreY, scoreR, 'S');
  doc.setDrawColor(...statusColor);
  doc.setLineWidth(2.5);
  // Draw arc (approximate with thick circle overlay)
  const arcEnd = (overallScore / 100) * 360;
  // For simplicity, draw the colored arc using a series of small line segments
  for (let angle = -90; angle < -90 + arcEnd; angle += 3) {
    const rad1 = (angle * Math.PI) / 180;
    const rad2 = ((angle + 3) * Math.PI) / 180;
    doc.line(
      scoreX + scoreR * Math.cos(rad1), scoreY + scoreR * Math.sin(rad1),
      scoreX + scoreR * Math.cos(rad2), scoreY + scoreR * Math.sin(rad2)
    );
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...C.text);
  doc.text(String(overallScore), scoreX, scoreY + 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text('/ 100', scoreX, scoreY + 8, { align: 'center' });

  // Status badge
  doc.setFillColor(...statusColor);
  const badgeW = doc.getTextWidth(statusLabel) * 0.38 + 10;
  doc.roundedRect(scoreX - badgeW / 2, scoreY + 14, badgeW, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text(statusLabel, scoreX, scoreY + 19, { align: 'center' });

  y = scoreY + 30;

  // Summary stats row
  const statsData = [
    ['Spaces', String(spaces.length)],
    ['Program SF', fmtNum(totalSF)],
    ['Decisions', `${Object.keys(decisionAnswers).length} / 10`],
    ['Deviations', String(deviations.length)],
    ['Red Flags', String(triggeredFlags.length)],
  ];
  const statW = cw / statsData.length;
  doc.setFillColor(...C.background);
  doc.roundedRect(margin, y, cw, 16, 2, 2, 'F');
  statsData.forEach(([label, value], i) => {
    const sx = margin + i * statW + statW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.navy);
    doc.text(value, sx, y + 7, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    doc.text(label, sx, y + 12, { align: 'center' });
  });

  y += 22;


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 2 — EXECUTIVE SUMMARY
  // ═════════════════════════════════════════════════════════════════════════

  sectionHeader('Executive Summary');

  // totalSF already computed at top of function from FYI data
  const decCount = Object.keys(decisionAnswers).length;
  const nonDefault = decisions.filter(d => {
    const ans = decisionAnswers[d.id];
    if (!ans) return false;
    const defaultOpt = d.options.find(o => o.isDefault);
    return defaultOpt && ans !== defaultOpt.id;
  }).length;

  let summary = `This ${estimatedTier.tier} ${fmtNum(totalSF)} SF program comprises ${spaces.length} spaces organized across `;
  const zoneCount = [...new Set(spaces.map(s => s.zoneName || s.zone))].length;
  summary += `${zoneCount} functional zones. `;
  summary += `Of ${decCount} layout decisions addressed, ${nonDefault} deviate from the N4S benchmark, generating ${deviations.length} adjacency change${deviations.length !== 1 ? 's' : ''}. `;
  if (triggeredFlags.length > 0) {
    summary += `${triggeredFlags.length} red flag${triggeredFlags.length !== 1 ? 's' : ''} require attention before handoff. `;
  } else {
    summary += 'No red flags were triggered - the layout passes all critical adjacency checks. ';
  }
  summary += `Overall validation score: ${overallScore}/100 (${statusLabel}).`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  const summaryLines = doc.splitTextToSize(summary, cw - 4);
  summaryLines.forEach(line => {
    y = checkBreak(4);
    doc.text(line, margin + 2, y);
    y += 3.8;
  });
  y += 4;


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 3 — SPACE PROGRAM OVERVIEW
  // ═════════════════════════════════════════════════════════════════════════

  sectionHeader('Space Program Overview');

  // Group spaces by zone (use zoneName for FYI spaces, zone for preset)
  const zoneMap = {};
  spaces.forEach(s => {
    const zoneLabel = s.zoneName || s.zone;
    if (!zoneMap[zoneLabel]) zoneMap[zoneLabel] = { count: 0, sf: 0 };
    zoneMap[zoneLabel].count++;
    zoneMap[zoneLabel].sf += s.targetSF || 0;
  });

  // When using FYI data, circulation is computed separately (not in spaces array)
  // Add it as a zone entry so the table totals match totalSF
  if (fyiProgram?.totals?.circulationSF > 0) {
    zoneMap['Circulation'] = { count: 0, sf: fyiProgram.totals.circulationSF };
  }

  const zoneRows = Object.entries(zoneMap)
    .sort((a, b) => b[1].sf - a[1].sf)
    .map(([zone, data]) => [
      zone,
      data.count > 0 ? String(data.count) : '—',
      fmtNum(data.sf) + ' SF',
      Math.round((data.sf / totalSF) * 100) + '%',
    ]);

  autoTable(doc, {
    startY: y,
    head: [['Zone', 'Spaces', 'Total SF', '% of Program']],
    body: zoneRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: C.white, fontSize: 7, fontStyle: 'bold', cellPadding: 2.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: margin, right: margin },
    tableWidth: cw,
  });

  y = doc.lastAutoTable.finalY + 5;

  // Totals row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.navy);
  doc.text(`Total: ${spaces.length} spaces - ${fmtNum(totalSF)} SF`, margin + 2, y);
  y += 8;


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 4 — LAYOUT DECISIONS
  // ═════════════════════════════════════════════════════════════════════════

  sectionHeader('Layout Decisions', 30);

  const decisionRows = decisions.map(d => {
    const ansId = decisionAnswers[d.id];
    const selectedOpt = d.options.find(o => o.id === ansId);
    const defaultOpt = d.options.find(o => o.isDefault);
    const isNonDefault = selectedOpt && defaultOpt && ansId !== defaultOpt.id;
    return [
      d.title || d.id,
      selectedOpt?.label || 'Not answered',
      selectedOpt ? `${d.primarySpace} > ${selectedOpt.targetSpace} (${selectedOpt.relationship})` : '-',
      isNonDefault ? '* Custom' : 'Default',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Decision', 'Selection', 'Relationship', 'Status']],
    body: decisionRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: C.white, fontSize: 6.5, fontStyle: 'bold', cellPadding: 2 },
    bodyStyles: { fontSize: 6.5, cellPadding: 2, textColor: C.text },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50, fontStyle: 'italic', textColor: C.textMuted },
      3: { cellWidth: 25, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = data.cell.raw;
        if (val.startsWith('*')) {
          data.cell.styles.textColor = C.warning;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = C.success;
        }
      }
    },
    margin: { left: margin, right: margin },
    tableWidth: cw,
  });

  y = doc.lastAutoTable.finalY + 8;


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 5 & 6 — RELATIONSHIP DIAGRAMS
  // ═════════════════════════════════════════════════════════════════════════

  y = newPage();

  sectionHeader('Relationship Diagram - Desired (Benchmark)');

  const diagH = 95;
  const benchLayout = layoutNodes(spaces, benchmarkMatrix, cw, diagH, margin, y);
  drawDiagram(doc, benchLayout, benchmarkMatrix, {
    showDeviations: false,
    boxX: margin, boxY: y, boxW: cw, boxH: diagH,
  });
  y += diagH + 3;
  drawDiagramLegend(doc, margin + 2, y, cw);
  y += 8;

  sectionHeader('Relationship Diagram - Proposed (Client)', 95);

  const propLayout = layoutNodes(spaces, proposedMatrix, cw, diagH, margin, y);
  drawDiagram(doc, propLayout, proposedMatrix, {
    showDeviations: true,
    benchmarkMatrix,
    redFlagEdgeKeys,
    boxX: margin, boxY: y, boxW: cw, boxH: diagH,
  });
  y += diagH + 3;
  drawDiagramLegend(doc, margin + 2, y, cw);
  y += 4;

  // Abbreviation index
  y = checkBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(...C.textMuted);
  doc.text('ABBREVIATION INDEX', margin + 2, y);
  y += 3;
  const sortedNodes = [...spaces].filter(s => !['CIRC1','CIRC2','CORE2'].includes(s.code)).sort((a, b) => a.code.localeCompare(b.code));
  const cols = 4;
  const colW = cw / cols;
  let col = 0, rowY = y;
  sortedNodes.forEach((s, i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(...C.navy);
    doc.text(s.code, margin + 2 + col * colW, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    doc.text(` ${s.name}`, margin + 2 + col * colW + doc.getTextWidth(s.code + ' '), rowY);
    col++;
    if (col >= cols) { col = 0; rowY += 3.2; }
  });
  y = rowY + 5;


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 7 — ADJACENCY MATRIX (deviations only)
  // ═════════════════════════════════════════════════════════════════════════

  if (deviations.length > 0) {
    y = checkBreak(30);
    sectionHeader('Adjacency Deviations Matrix');

    const devRows = deviations.map(d => {
      const bmStyle = { A: 'Adjacent', N: 'Near', B: 'Buffered', S: 'Separate' };
      return [d.fromSpace, d.toSpace, `${d.desired} (${bmStyle[d.desired] || d.desired})`, `${d.proposed} (${bmStyle[d.proposed] || d.proposed})`];
    });

    autoTable(doc, {
      startY: y,
      head: [['From', 'To', 'Benchmark', 'Proposed']],
      body: devRows,
      theme: 'grid',
      headStyles: { fillColor: C.navy, textColor: C.white, fontSize: 7, fontStyle: 'bold', cellPadding: 2.5 },
      bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 25, fontStyle: 'bold' },
        2: { cellWidth: 55 },
        3: { cellWidth: 55 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          data.cell.styles.textColor = C.warning;
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: margin, right: margin },
      tableWidth: cw,
    });

    y = doc.lastAutoTable.finalY + 8;
  }


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 8 — VALIDATION SCORECARD
  // ═════════════════════════════════════════════════════════════════════════

  y = checkBreak(60);
  sectionHeader('Validation Scorecard');

  // Module scores table
  const scoreRows = moduleScores.map(m => [
    m.name,
    `${m.score} / 100`,
    m.passed ? 'Pass' : 'Review',
    m.deviationCount > 0 ? `${m.deviationCount} deviation${m.deviationCount !== 1 ? 's' : ''}` : '-',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Module', 'Score', 'Status', 'Deviations']],
    body: scoreRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: C.white, fontSize: 7, fontStyle: 'bold', cellPadding: 2.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 40 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        data.cell.styles.textColor = data.cell.raw === 'Pass' ? C.success : C.warning;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: margin, right: margin },
    tableWidth: cw,
  });

  y = doc.lastAutoTable.finalY + 5;

  // Overall score summary
  doc.setFillColor(...C.accentLight);
  doc.roundedRect(margin, y, cw, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.navy);
  doc.text(`Overall Score: ${overallScore} / 100`, margin + 4, y + 6.5);
  doc.setFillColor(...statusColor);
  const sBadgeW = 28;
  doc.roundedRect(pw - margin - sBadgeW - 4, y + 2, sBadgeW, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...C.white);
  doc.text(statusLabel, pw - margin - sBadgeW / 2 - 4, y + 6, { align: 'center' });

  y += 16;


  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 9 — RED FLAGS & BRIDGES
  // ═════════════════════════════════════════════════════════════════════════

  y = checkBreak(50);
  sectionHeader('Red Flag Assessment');

  RED_FLAGS.forEach(flag => {
    y = checkBreak(10);
    const triggered = triggeredFlags.some(t => t.id === flag.id);
    const color = triggered ? C.error : C.success;
    // Draw status circle
    doc.setFillColor(...color);
    doc.circle(margin + 3.5, y - 1.2, 1.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4);
    doc.setTextColor(...C.white);
    doc.text(triggered ? 'X' : 'OK', margin + 3.5, y - 0.8, { align: 'center' });
    // Flag name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.text);
    doc.text(flag.name, margin + 8, y);
    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(flag.desc, margin + 55, y);
    y += 5;
  });

  y += 4;
  y = checkBreak(40);
  sectionHeader('Bridge Assessment');

  BRIDGES.forEach(bridge => {
    y = checkBreak(10);
    const required = bridgeConfig[bridge.id] || false;
    const present = enabledBridges.has ? enabledBridges.has(bridge.id) : false;
    let status, color;
    if (!required) { status = 'Not Required'; color = C.textMuted; }
    else if (present) { status = 'Present'; color = C.success; }
    else { status = 'Missing'; color = C.error; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.text);
    doc.text(bridge.name, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(bridge.desc, margin + 38, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(status, pw - margin, y, { align: 'right' });
    y += 5;
  });

  y += 6;


  // ═════════════════════════════════════════════════════════════════════════
  // FINALIZE — update page numbers
  // ═════════════════════════════════════════════════════════════════════════

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    // Overwrite page number area
    doc.setFillColor(...C.white);
    doc.rect(pw / 2 - 10, ph - 10, 20, 5, 'F');
    doc.text(`Page ${i} of ${totalPages}`, pw / 2, ph - 8, { align: 'center' });
  }

  // Save
  const safeName = projectName.replace(/[^a-z0-9]/gi, '-').substring(0, 30);
  doc.save(`N4S-MVP-Report-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default generateMVPReport;
