/**
 * MVPValidationReport.js
 *
 * Compact MVP Validation PDF — focused deliverable containing:
 * 1. Relationship Diagrams (Desired + Proposed)
 * 2. Adjacency Deviations Matrix
 * 3. Validation Scorecard with module scores, red flags, bridges
 *
 * Designed as a standalone handoff document for architects & designers.
 * Follows N4S brand standards.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND CONSTANTS (shared with MVPReportGenerator)
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  navy:       [30, 58, 95],
  gold:       [201, 162, 39],
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

const ZONE_POS = {
  // Preset zone names
  'Entry + Formal': { x: 0.22, y: 0.18 }, 'Arrival + Formal': { x: 0.22, y: 0.18 },
  'Family Hub': { x: 0.52, y: 0.30 }, 'Service': { x: 0.85, y: 0.50 },
  'Service Core': { x: 0.85, y: 0.50 }, 'Wellness': { x: 0.72, y: 0.75 },
  'Outdoor': { x: 0.48, y: 0.82 }, 'Primary Wing': { x: 0.15, y: 0.60 },
  'Guest Wing': { x: 0.38, y: 0.72 }, 'Guest Wing Node': { x: 0.38, y: 0.72 },
  'Hospitality': { x: 0.38, y: 0.72 }, 'Circulation': { x: 0.50, y: 0.50 },
  'Support': { x: 0.78, y: 0.78 },
  // FYI zone names (from space-registry.js)
  'Arrival + Public': { x: 0.22, y: 0.18 }, 'Family + Kitchen': { x: 0.52, y: 0.30 },
  'Entertainment': { x: 0.62, y: 0.18 }, 'Primary Suite': { x: 0.15, y: 0.60 },
  'Guest + Secondary': { x: 0.38, y: 0.72 }, 'Service + BOH': { x: 0.85, y: 0.50 },
  'Outdoor Spaces': { x: 0.48, y: 0.82 }, 'Guest House': { x: 0.30, y: 0.88 },
  'Pool House': { x: 0.55, y: 0.88 },
};

const EDGE_DRAW = {
  A: { color: C.adjA, width: 0.7, dash: [] },
  N: { color: C.adjN, width: 0.5, dash: [] },
  B: { color: C.adjB, width: 0.4, dash: [1.5, 1] },
  S: { color: C.adjS, width: 0.3, dash: [0.8, 0.8] },
};

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


// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAM DRAWING
// ═══════════════════════════════════════════════════════════════════════════════

function layoutNodes(spaces, matrix, boxW, boxH, offsetX, offsetY) {
  const m = 12, w = boxW - m*2, h = boxH - m*2;
  const skip = new Set(['CIRC1','CIRC2','CORE2']);
  const maxSF = Math.max(...spaces.map(s => s.targetSF || 0), 100);
  const nodes = spaces.filter(s => !skip.has(s.code)).map(s => {
    const pos = ZONE_POS[s.zoneName] || ZONE_POS[s.zone] || { x: 0.5, y: 0.5 };
    return {
      id: s.code, name: s.name, zone: s.zoneName || s.zone, targetSF: s.targetSF,
      r: 2.5 + 4.5 * Math.sqrt((s.targetSF || 100) / maxSF),
      x: offsetX + m + pos.x * w + (Math.random()-0.5)*8,
      y: offsetY + m + pos.y * h + (Math.random()-0.5)*8,
    };
  });
  const nodeIds = new Set(nodes.map(n => n.id));
  const seen = new Set();
  const links = [];
  Object.entries(matrix).forEach(([key, rel]) => {
    const [from, to] = key.split('-');
    if (!nodeIds.has(from) || !nodeIds.has(to)) return;
    const can = [from, to].sort().join('-');
    if (seen.has(can)) return; seen.add(can);
    links.push({ source: from, target: to, rel });
  });
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });
  for (let iter = 0; iter < 150; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x-a.x, dy = b.y-a.y;
        const dist = Math.sqrt(dx*dx+dy*dy) || 0.1;
        if (dist < 40) { const f = 1.2/(dist*dist); a.x -= dx*f; a.y -= dy*f; b.x += dx*f; b.y += dy*f; }
      }
    }
    links.forEach(l => {
      const a = nodeMap[l.source], b = nodeMap[l.target];
      if (!a || !b) return;
      const ideal = l.rel==='A'?12:l.rel==='N'?20:l.rel==='B'?30:40;
      let dx = b.x-a.x, dy = b.y-a.y;
      const dist = Math.sqrt(dx*dx+dy*dy) || 0.1;
      const f = (dist-ideal)*0.02;
      a.x += (dx/dist)*f; a.y += (dy/dist)*f;
      b.x -= (dx/dist)*f; b.y -= (dy/dist)*f;
    });
    nodes.forEach(n => {
      const pos = ZONE_POS[n.zone] || { x: 0.5, y: 0.5 };
      n.x += (offsetX+m+pos.x*w-n.x)*0.04;
      n.y += (offsetY+m+pos.y*h-n.y)*0.04;
      n.x = Math.max(offsetX+m+n.r, Math.min(offsetX+boxW-m-n.r, n.x));
      n.y = Math.max(offsetY+m+n.r, Math.min(offsetY+boxH-m-n.r, n.y));
    });
  }
  return { nodes, links, nodeMap };
}

function drawDiagram(doc, layout, matrix, options = {}) {
  const { nodes, links, nodeMap } = layout;
  const { showDeviations, benchmarkMatrix, redFlagEdgeKeys, boxX, boxY, boxW, boxH } = options;

  doc.setFillColor(...C.background);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'S');

  // Zone hulls
  const zoneGroups = {};
  nodes.forEach(n => { if (!zoneGroups[n.zone]) zoneGroups[n.zone] = []; zoneGroups[n.zone].push(n); });
  Object.entries(zoneGroups).forEach(([zone, zns]) => {
    const zc = ZONE_RGB[zone] || DEFAULT_ZONE_RGB;
    const cx = zns.reduce((s,n) => s+n.x, 0)/zns.length;
    const cy = zns.reduce((s,n) => s+n.y, 0)/zns.length;
    let maxD = 0;
    zns.forEach(n => { const d = Math.sqrt((n.x-cx)**2+(n.y-cy)**2)+n.r; if(d>maxD) maxD=d; });
    doc.setFillColor(...zc.fill);
    doc.ellipse(cx, cy, Math.max(maxD+6,15), Math.max(maxD+4,12), 'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(4.5); doc.setTextColor(...zc.stroke);
    doc.text(zone.toUpperCase(), cx, cy-Math.max(maxD+4,12)-1.5, { align:'center' });
  });

  // Edges
  links.forEach(l => {
    const a = nodeMap[l.source], b = nodeMap[l.target];
    if (!a || !b) return;
    const rel = matrix[`${l.source}-${l.target}`] || matrix[`${l.target}-${l.source}`] || l.rel;
    const st = EDGE_DRAW[rel] || EDGE_DRAW.N;
    const k1 = `${l.source}-${l.target}`, k2 = `${l.target}-${l.source}`;
    const isRF = redFlagEdgeKeys && (redFlagEdgeKeys.has(k1) || redFlagEdgeKeys.has(k2));
    const isDev = showDeviations && benchmarkMatrix && (benchmarkMatrix[k1]||benchmarkMatrix[k2]) !== rel;

    if (isRF) { doc.setDrawColor(...C.error); doc.setLineWidth(st.width+0.6); }
    else if (isDev) { doc.setDrawColor(...C.warning); doc.setLineWidth(st.width+0.3); }
    else { doc.setDrawColor(...st.color); doc.setLineWidth(st.width); }
    doc.setLineDashPattern(st.dash.length ? st.dash : [], 0);
    doc.line(a.x, a.y, b.x, b.y);

    if (isDev) {
      const mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
      doc.setFillColor(...(isRF ? C.error : C.warning));
      doc.setLineDashPattern([], 0);
      doc.triangle(mx, my-1.2, mx+1.2, my, mx, my+1.2, 'F');
      doc.triangle(mx, my-1.2, mx-1.2, my, mx, my+1.2, 'F');
    }
  });
  doc.setLineDashPattern([], 0);

  // Nodes
  nodes.forEach(n => {
    const zc = ZONE_RGB[n.zone] || DEFAULT_ZONE_RGB;
    doc.setFillColor(...C.white); doc.setDrawColor(...zc.stroke); doc.setLineWidth(0.3);
    doc.circle(n.x, n.y, n.r, 'FD');
    doc.setFillColor(...zc.node); doc.circle(n.x, n.y, n.r*0.75, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(n.r>5?4:3); doc.setTextColor(...C.text);
    doc.text(n.id, n.x, n.y+0.8, { align:'center' });
  });
}

function drawLegend(doc, x, y) {
  doc.setFont('helvetica','bold'); doc.setFontSize(5); doc.setTextColor(...C.textMuted);
  doc.text('RELATIONSHIPS', x, y);
  let lx = x + 22;
  const labels = { A:'Adjacent', N:'Near', B:'Buffered', S:'Separate' };
  Object.entries(EDGE_DRAW).forEach(([key, st]) => {
    doc.setDrawColor(...st.color); doc.setLineWidth(st.width);
    doc.setLineDashPattern(st.dash.length ? st.dash : [], 0);
    doc.line(lx, y-1, lx+6, y-1);
    doc.setLineDashPattern([], 0);
    doc.setFont('helvetica','bold'); doc.setFontSize(5); doc.setTextColor(...C.text);
    doc.text(key, lx+8, y);
    doc.setFont('helvetica','normal'); doc.setTextColor(...C.textMuted);
    doc.text(labels[key], lx+12, y);
    lx += 28;
  });
  // Symbols
  doc.setFillColor(...C.warning);
  doc.triangle(lx+4, y-2, lx+5.5, y, lx+4, y+0.5, 'F');
  doc.triangle(lx+4, y-2, lx+2.5, y, lx+4, y+0.5, 'F');
  doc.setFontSize(5); doc.setTextColor(...C.warning); doc.text('Deviation', lx+7, y);
  doc.setFillColor(...C.error); doc.circle(lx+26, y-0.8, 1.5, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(3.5); doc.setTextColor(...C.white);
  doc.text('!', lx+26, y-0.3, { align:'center' });
  doc.setFont('helvetica','normal'); doc.setFontSize(5); doc.setTextColor(...C.error);
  doc.text('Red Flag', lx+29, y);
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate compact Validation Report PDF
 *
 * @param {Object} config — same shape as MVPReportGenerator but only uses
 *   clientName, projectName, estimatedTier, presetData, benchmarkMatrix,
 *   proposedMatrix, deviations, bridgeConfig, enabledBridges
 */
export async function generateMVPValidationReport(config) {
  const {
    clientName = 'Client',
    projectName = 'Luxury Residence',
    estimatedTier = { tier: '15K', label: 'Grand (15,000 SF)' },
    presetData,
    fyiProgram,
    benchmarkMatrix = {},
    proposedMatrix = {},
    deviations = [],
    bridgeConfig = {},
    enabledBridges = new Set(),
  } = config;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const cw = pw - margin * 2;
  let y = 0;
  let pageNum = 1;

  // GOLDEN RULE: Use FYI live data for spaces when available, preset as fallback
  const spaces = (fyiProgram?.spaces?.length > 0) ? fyiProgram.spaces : (presetData?.spaces || []);
  const triggeredFlags = RED_FLAGS.filter(rf => rf.check(proposedMatrix));
  const redFlagEdgeKeys = new Set();
  triggeredFlags.forEach(rf => rf.edges.forEach(([a, b]) => { redFlagEdgeKeys.add(`${a}-${b}`); redFlagEdgeKeys.add(`${b}-${a}`); }));
  const moduleScores = computeModuleScores(deviations, benchmarkMatrix);
  const overallScore = (() => {
    if (!moduleScores.length) return 100;
    const base = Math.round(moduleScores.reduce((s, m) => s + m.score, 0) / moduleScores.length);
    return Math.max(0, base - triggeredFlags.length * 5);
  })();
  const allPassed = triggeredFlags.length === 0 && overallScore >= 80;
  const statusLabel = allPassed ? 'PASS' : overallScore >= 60 ? 'REVIEW' : 'ATTENTION';
  const statusColor = allPassed ? C.success : overallScore >= 60 ? C.warning : C.error;

  // Header / Footer
  const addHeader = () => {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, pw, 10, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...C.white);
    doc.text('N4S', margin, 7);
    doc.setFont('helvetica', 'normal');
    doc.text('Validation Summary', pw - margin, 7, { align: 'right' });
  };
  const addFooter = (pn) => {
    const fy = ph - 8;
    doc.setDrawColor(...C.border); doc.setLineWidth(0.2);
    doc.line(margin, fy-2, pw-margin, fy-2);
    doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...C.textMuted);
    doc.text('(C) 2026 Not4Sale LLC - Confidential', margin, fy);
    doc.text(`Page ${pn}`, pw/2, fy, { align:'center' });
    doc.text(fmtDate(new Date()), pw-margin, fy, { align:'right' });
  };
  const newPage = () => { doc.addPage(); pageNum++; addHeader(); addFooter(pageNum); return 18; };
  const checkBreak = (needed) => { if (y + needed > ph - 15) y = newPage(); return y; };
  const sectionHead = (title, min = 20) => {
    y = checkBreak(8 + min);
    doc.setFillColor(...C.navy);
    doc.roundedRect(margin, y, cw, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...C.white);
    doc.text(title, margin+3, y+5.5);
    y += 12;
  };


  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 1 — TITLE + DIAGRAMS
  // ═══════════════════════════════════════════════════════════════════════

  addHeader();
  addFooter(pageNum);
  y = 16;

  // Compact title bar
  doc.setFillColor(...C.accentLight);
  doc.roundedRect(margin, y, cw, 14, 2, 2, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...C.navy);
  doc.text('Validation Summary', margin + 4, y + 6);
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...C.textMuted);
  doc.text(`${projectName}  ·  ${estimatedTier.tier}  ·  ${fmtDate(new Date())}`, margin + 4, y + 11);
  // Score badge
  doc.setFillColor(...statusColor);
  doc.roundedRect(pw - margin - 25, y + 3, 22, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...C.white);
  doc.text(`${overallScore}`, pw - margin - 14, y + 8.5, { align:'center' });
  y += 20;

  // Desired diagram
  sectionHead('Desired (Benchmark)', 100);
  const diagH = 100;
  const benchLayout = layoutNodes(spaces, benchmarkMatrix, cw, diagH, margin, y);
  drawDiagram(doc, benchLayout, benchmarkMatrix, { showDeviations: false, boxX: margin, boxY: y, boxW: cw, boxH: diagH });
  y += diagH + 3;
  drawLegend(doc, margin + 2, y);
  y += 6;

  // Proposed diagram
  sectionHead('Proposed (Client)', 100);
  const propLayout = layoutNodes(spaces, proposedMatrix, cw, diagH, margin, y);
  drawDiagram(doc, propLayout, proposedMatrix, { showDeviations: true, benchmarkMatrix, redFlagEdgeKeys, boxX: margin, boxY: y, boxW: cw, boxH: diagH });
  y += diagH + 3;
  drawLegend(doc, margin + 2, y);
  y += 4;

  // Abbreviation index
  y = checkBreak(18);
  doc.setFont('helvetica','bold'); doc.setFontSize(5); doc.setTextColor(...C.textMuted);
  doc.text('ABBREVIATION INDEX', margin+2, y);
  y += 3;
  const sorted = [...spaces].filter(s => !['CIRC1','CIRC2','CORE2'].includes(s.code)).sort((a,b) => a.code.localeCompare(b.code));
  const cols = 4, colW = cw / cols;
  let col = 0, rowY = y;
  sorted.forEach(s => {
    doc.setFont('helvetica','bold'); doc.setFontSize(5); doc.setTextColor(...C.navy);
    doc.text(s.code, margin+2+col*colW, rowY);
    doc.setFont('helvetica','normal'); doc.setTextColor(...C.text);
    doc.text(` ${s.name}`, margin+2+col*colW+doc.getTextWidth(s.code+' '), rowY);
    col++; if (col >= cols) { col = 0; rowY += 3.2; }
  });
  y = rowY + 5;


  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 2 — MATRIX + SCORECARD
  // ═══════════════════════════════════════════════════════════════════════

  y = newPage();

  // Deviations table
  if (deviations.length > 0) {
    sectionHead('Adjacency Deviations');
    const relLabels = { A:'Adjacent', N:'Near', B:'Buffered', S:'Separate' };
    const devRows = deviations.map(d => [
      d.fromSpace, d.toSpace,
      `${d.desired} (${relLabels[d.desired]||d.desired})`,
      `${d.proposed} (${relLabels[d.proposed]||d.proposed})`,
    ]);
    autoTable(doc, {
      startY: y,
      head: [['From', 'To', 'Benchmark', 'Proposed']],
      body: devRows,
      theme: 'grid',
      headStyles: { fillColor: C.navy, textColor: C.white, fontSize: 7, fontStyle:'bold', cellPadding: 2.5 },
      bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
      alternateRowStyles: { fillColor: [248,248,246] },
      columnStyles: { 0: { cellWidth: 25, fontStyle:'bold' }, 1: { cellWidth: 25, fontStyle:'bold' }, 2: { cellWidth: 55 }, 3: { cellWidth: 55 } },
      didParseCell: (data) => { if (data.section==='body' && data.column.index===3) { data.cell.styles.textColor = C.warning; data.cell.styles.fontStyle = 'bold'; } },
      margin: { left: margin, right: margin }, tableWidth: cw,
    });
    y = doc.lastAutoTable.finalY + 8;
  } else {
    sectionHead('Adjacency Deviations');
    doc.setFont('helvetica','italic'); doc.setFontSize(8); doc.setTextColor(...C.success);
    doc.text('No deviations from benchmark - all relationships match the N4S standard.', margin + 2, y);
    y += 8;
  }

  // Scorecard
  sectionHead('Module Scores');
  const scoreRows = moduleScores.map(m => [
    m.name, `${m.score} / 100`, m.passed ? 'Pass' : 'Review',
    m.deviationCount > 0 ? `${m.deviationCount}` : '-',
  ]);
  autoTable(doc, {
    startY: y,
    head: [['Module', 'Score', 'Status', 'Dev.']],
    body: scoreRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: C.white, fontSize: 7, fontStyle:'bold', cellPadding: 2.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2, textColor: C.text },
    alternateRowStyles: { fillColor: [248,248,246] },
    columnStyles: { 0: { cellWidth: 55, fontStyle:'bold' }, 1: { cellWidth: 25, halign:'center' }, 2: { cellWidth: 25, halign:'center' }, 3: { cellWidth: 18, halign:'center' } },
    didParseCell: (data) => { if (data.section==='body' && data.column.index===2) { data.cell.styles.textColor = data.cell.raw === 'Pass' ? C.success : C.warning; data.cell.styles.fontStyle = 'bold'; } },
    margin: { left: margin, right: margin }, tableWidth: cw,
  });
  y = doc.lastAutoTable.finalY + 5;

  // Overall score bar
  doc.setFillColor(...C.accentLight);
  doc.roundedRect(margin, y, cw, 10, 2, 2, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...C.navy);
  doc.text(`Overall: ${overallScore} / 100`, margin+4, y+6.5);
  doc.setFillColor(...statusColor);
  doc.roundedRect(pw-margin-20, y+2, 16, 6, 1, 1, 'F');
  doc.setFontSize(6); doc.setTextColor(...C.white);
  doc.text(statusLabel, pw-margin-12, y+6, { align:'center' });
  y += 16;

  // Red flags
  y = checkBreak(35);
  sectionHead('Red Flags');
  RED_FLAGS.forEach(flag => {
    y = checkBreak(8);
    const triggered = triggeredFlags.some(t => t.id === flag.id);
    const color = triggered ? C.error : C.success;
    doc.setFillColor(...color);
    doc.circle(margin + 3.5, y - 1.2, 1.8, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(4);
    doc.setTextColor(...C.white);
    doc.text(triggered ? 'X' : 'OK', margin + 3.5, y - 0.8, { align: 'center' });
    doc.setFont('helvetica','bold'); doc.setFontSize(7);
    doc.setTextColor(...C.text);
    doc.text(flag.name, margin+8, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...C.textMuted);
    doc.text(flag.desc, margin+55, y);
    y += 5;
  });
  y += 4;

  // Bridges
  y = checkBreak(35);
  sectionHead('Bridges');
  BRIDGES.forEach(bridge => {
    y = checkBreak(8);
    const required = bridgeConfig[bridge.id] || false;
    const present = enabledBridges.has ? enabledBridges.has(bridge.id) : false;
    let status, color;
    if (!required) { status = 'Not Required'; color = C.textMuted; }
    else if (present) { status = 'Present'; color = C.success; }
    else { status = 'Missing'; color = C.error; }
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...C.text);
    doc.text(bridge.name, margin+2, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...C.textMuted);
    doc.text(bridge.desc, margin+38, y);
    doc.setFont('helvetica','bold'); doc.setTextColor(...color);
    doc.text(status, pw-margin, y, { align:'right' });
    y += 5;
  });

  // Finalize page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...C.textMuted);
    doc.setFillColor(...C.white); doc.rect(pw/2-10, ph-10, 20, 5, 'F');
    doc.text(`Page ${i} of ${totalPages}`, pw/2, ph-8, { align:'center' });
  }

  const safeName = projectName.replace(/[^a-z0-9]/gi, '-').substring(0, 30);
  doc.save(`N4S-Validation-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default generateMVPValidationReport;
