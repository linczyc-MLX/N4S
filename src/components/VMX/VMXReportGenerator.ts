/**
 * VMXReportGenerator.ts
 *
 * Generates VMX PDF reports using html2canvas (DOM → canvas) + jsPDF (canvas → PDF).
 * Follows N4S brand standards: navy header bar, standard footer with copyright + page numbering.
 *
 * A4 Landscape orientation for optimal table/matrix readability.
 *
 * Works for all three export formats:
 *   1. Lite (single + compare)
 *   2. Pro (single scenario)
 *   3. Pro Compare (dual scenario)
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// =============================================================================
// N4S BRAND CONSTANTS (matching KYC/KYM generators)
// =============================================================================

const COLORS = {
  navy: [30, 58, 95] as [number, number, number],       // #1e3a5f
  gold: [201, 162, 39] as [number, number, number],      // #c9a227
  text: [26, 26, 26] as [number, number, number],
  textMuted: [107, 107, 107] as [number, number, number],
  border: [229, 229, 224] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// =============================================================================
// PAGE LAYOUT CONSTANTS — A4 LANDSCAPE
// =============================================================================

const PAGE = {
  // A4 landscape dimensions in mm
  width: 297,
  height: 210,
  margin: 15,
  // Navy header bar height
  headerBarHeight: 8,
  // Footer area (line + text)
  footerHeight: 12,
  // Content area
  get contentWidth() { return this.width - (this.margin * 2); },
  // Usable height between header bar bottom and footer line
  get contentTop() { return this.margin + this.headerBarHeight + 4; }, // 4mm gap after header
  get contentBottom() { return this.height - this.margin - this.footerHeight; },
  get usableHeight() { return this.contentBottom - this.contentTop; },
  // Padding at top of new pages (breathing room per user request)
  pageTopPadding: 4, // mm
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// =============================================================================
// PDF HEADER & FOOTER — N4S STANDARD
// =============================================================================

const addHeader = (doc: jsPDF, reportLabel: string) => {
  // Navy bar across full page width
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, PAGE.width, PAGE.headerBarHeight, 'F');

  // "N4S" left-aligned in the bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('N4S', PAGE.margin, PAGE.headerBarHeight - 2);

  // Report type right-aligned
  doc.setFont('helvetica', 'normal');
  doc.text(reportLabel, PAGE.width - PAGE.margin, PAGE.headerBarHeight - 2, { align: 'right' });
};

const addFooter = (doc: jsPDF, pageNum: number) => {
  const footerY = PAGE.height - PAGE.margin - 2;

  // Footer line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin, footerY - 3, PAGE.width - PAGE.margin, footerY - 3);

  // Footer text: copyright left, page center, date right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('\u00A9 2026 N4S Luxury Residential Advisory', PAGE.margin, footerY);
  doc.text(`Page ${pageNum}`, PAGE.width / 2, footerY, { align: 'center' });
  doc.text(formatDate(new Date()), PAGE.width - PAGE.margin, footerY, { align: 'right' });
};

const updateAllFooters = (doc: jsPDF, totalPages: number) => {
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = PAGE.height - PAGE.margin - 2;

    // White-out the old page text
    doc.setFillColor(...COLORS.white);
    doc.rect(PAGE.width / 2 - 20, footerY - 4, 40, 6, 'F');

    // Rewrite with "Page X of Y"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Page ${i} of ${totalPages}`, PAGE.width / 2, footerY, { align: 'center' });
  }
};

// =============================================================================
// SECTION CAPTURE — html2canvas
// =============================================================================

interface CapturedSection {
  canvas: HTMLCanvasElement;
  /** Width in mm when scaled to fit content width */
  widthMm: number;
  /** Height in mm when scaled to fit content width */
  heightMm: number;
  /** Original element data-pdf-section value */
  sectionId: string;
  /** If true, always start on a new page */
  pageBreak: boolean;
}

/**
 * Captures a DOM element as a canvas image and calculates its
 * dimensions in mm when scaled to fit the PDF content width.
 */
const captureSection = async (
  el: HTMLElement,
  sectionId: string,
  pageBreak: boolean = false,
): Promise<CapturedSection> => {
  // Temporarily ensure element is visible and full-width
  const origDisplay = el.style.display;
  const origVisibility = el.style.visibility;
  el.style.display = '';
  el.style.visibility = 'visible';

  const canvas = await html2canvas(el, {
    scale: 2, // 2x for crisp rendering
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    // Landscape A4 at 96dpi ≈ 1123px, at 2x scale we capture at native resolution
    windowWidth: 1200,
  });

  el.style.display = origDisplay;
  el.style.visibility = origVisibility;

  // Calculate scaled dimensions to fit content width
  const pxPerMm = canvas.width / PAGE.contentWidth; // pixels per mm at this scale
  const heightMm = canvas.height / pxPerMm;

  return {
    canvas,
    widthMm: PAGE.contentWidth,
    heightMm,
    sectionId,
    pageBreak,
  };
};

// =============================================================================
// PAGE LAYOUT ENGINE
// =============================================================================

interface LayoutState {
  doc: jsPDF;
  currentY: number;
  pageNumber: number;
  reportLabel: string;
}

const newPage = (state: LayoutState): void => {
  state.doc.addPage();
  state.pageNumber++;
  addHeader(state.doc, state.reportLabel);
  addFooter(state.doc, state.pageNumber);
  state.currentY = PAGE.contentTop + PAGE.pageTopPadding;
};

const placeSection = (state: LayoutState, section: CapturedSection): void => {
  const { doc } = state;
  const availableHeight = PAGE.contentBottom - state.currentY;

  // Force new page if section requires it or won't fit
  if (section.pageBreak || section.heightMm > availableHeight) {
    // If we're not at the very top of a fresh page, add a new page
    if (state.currentY > PAGE.contentTop + PAGE.pageTopPadding + 2) {
      newPage(state);
    }
  }

  // If section is taller than usable page height, scale it down to fit one page
  let renderWidth = section.widthMm;
  let renderHeight = section.heightMm;
  const maxH = PAGE.usableHeight - PAGE.pageTopPadding;

  if (renderHeight > maxH) {
    const scaleFactor = maxH / renderHeight;
    renderHeight = maxH;
    renderWidth = section.widthMm * scaleFactor;
  }

  // Center horizontally if scaled down
  const xOffset = PAGE.margin + (PAGE.contentWidth - renderWidth) / 2;

  // Place the image
  const imgData = section.canvas.toDataURL('image/png');
  doc.addImage(imgData, 'PNG', xOffset, state.currentY, renderWidth, renderHeight);

  state.currentY += renderHeight + 4; // 4mm gap between sections
};

// =============================================================================
// COVER PAGE (Page 1)
// =============================================================================

const addCoverPage = (
  state: LayoutState,
  meta: {
    clientName: string;
    projectName: string;
    datasetName: string;
    tier: string;
    areaSqft: number;
    scenarioA: string;
    scenarioB?: string;
    compareMode: boolean;
  },
): void => {
  const { doc } = state;

  // Gold accent line under header
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1);
  doc.line(PAGE.margin, PAGE.headerBarHeight + 4, PAGE.width - PAGE.margin, PAGE.headerBarHeight + 4);

  // Report title
  let y = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.navy);
  doc.text('VMX \u2014 Visual Matrix Report', PAGE.margin, y);

  // Metadata block — left column
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);

  const leftMeta = [
    ['Dataset:', meta.datasetName],
    ['Updated:', formatDate(new Date())],
    ['Area:', `${meta.areaSqft.toLocaleString()} sq ft`],
    ['Tier:', meta.tier],
  ];

  const rightMeta = [
    ['Client:', meta.clientName],
    ['Project:', meta.projectName],
    ['Scenario A:', meta.scenarioA],
    ...(meta.compareMode && meta.scenarioB ? [['Scenario B:', meta.scenarioB]] : []),
  ];

  for (const [label, value] of leftMeta) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, PAGE.margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, PAGE.margin + 28, y);
    y += 7;
  }

  // Right column
  let yR = 56;
  for (const [label, value] of rightMeta) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, PAGE.width / 2, yR);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), PAGE.width / 2 + 30, yR);
    yR += 7;
  }

  state.currentY = Math.max(y, yR) + 10;
};

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

export interface VMXExportMeta {
  clientName: string;
  projectName: string;
  datasetName: string;
  tier: string;
  areaSqft: number;
  scenarioA: string;
  scenarioB?: string;
  compareMode: boolean;
  uiMode: 'lite' | 'pro';
}

/**
 * Generates a VMX PDF report by capturing DOM sections as images
 * and placing them on A4 landscape pages with N4S standard header/footer.
 *
 * Sections are identified by `data-pdf-section` attributes on DOM elements.
 * The attribute value also determines page break behavior via a known list.
 */
export const generateVMXReport = async (
  containerEl: HTMLElement,
  meta: VMXExportMeta,
): Promise<string> => {
  console.log('[VMX Report] Starting PDF generation...');

  const reportLabel = meta.uiMode === 'lite'
    ? 'VMX Lite Report'
    : meta.compareMode
      ? 'VMX Pro Compare Report'
      : 'VMX Pro Report';

  // ---- 0. Hide interactive/noPrint elements during capture ----
  const noPrintEls = containerEl.querySelectorAll<HTMLElement>('.noPrint, .footerActions, .adminHeaderBtns, .modePills, .topBarActions, .docsBtn, select, input[type="number"]');
  const noPrintOrigStyles: string[] = [];
  noPrintEls.forEach((el, i) => {
    noPrintOrigStyles[i] = el.style.cssText;
    el.style.visibility = 'hidden';
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.style.margin = '0';
    el.style.padding = '0';
  });

  // ---- 1. Create PDF document ----
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const state: LayoutState = {
    doc,
    currentY: PAGE.contentTop,
    pageNumber: 1,
    reportLabel,
  };

  // ---- 2. Page 1: Header + Cover ----
  addHeader(doc, reportLabel);
  addFooter(doc, 1);
  addCoverPage(state, meta);

  // ---- 3. Find all PDF sections in DOM order ----
  const sectionEls = containerEl.querySelectorAll<HTMLElement>('[data-pdf-section]');
  console.log(`[VMX Report] Found ${sectionEls.length} sections to capture`);

  if (sectionEls.length === 0) {
    console.warn('[VMX Report] No sections found! Check data-pdf-section attributes.');
    doc.save('VMX-Report-empty.pdf');
    return 'VMX-Report-empty.pdf';
  }

  // Sections that always start on a new page
  const PAGE_BREAK_SECTIONS = new Set([
    'scenario',
    'scenario-a',
    'scenario-b',
    'delta-heat',
    'advisory-readout',
    'benchmark-admin',
    'benchmark-table',
    'indirects',
    'soft-costs',
    'key-drivers',
    'grand-total',
  ]);

  // ---- 4. Capture and place each section ----
  for (let i = 0; i < sectionEls.length; i++) {
    const el = sectionEls[i];
    const sectionId = el.getAttribute('data-pdf-section') || `section-${i}`;
    const forceBreak = PAGE_BREAK_SECTIONS.has(sectionId);

    console.log(`[VMX Report] Capturing section: ${sectionId}${forceBreak ? ' (page break)' : ''}`);

    try {
      // For the first page-break section, always start new page
      // For non-page-break sections (kyc-budget, pro-controls), try to fit on current page
      const shouldBreak = forceBreak || (i > 0 && sectionId !== 'kyc-budget' && sectionId !== 'pro-controls');

      const section = await captureSection(el, sectionId, shouldBreak);
      placeSection(state, section);
    } catch (err) {
      console.error(`[VMX Report] Failed to capture section ${sectionId}:`, err);
    }
  }

  // ---- 5. Update all footers with "Page X of Y" ----
  updateAllFooters(doc, state.pageNumber);

  // ---- 6. Restore hidden elements ----
  noPrintEls.forEach((el, i) => {
    el.style.cssText = noPrintOrigStyles[i];
  });

  // ---- 7. Save ----
  const safeClient = meta.clientName.replace(/[^a-zA-Z0-9]/g, '-') || 'Client';
  const modeTag = meta.uiMode === 'lite' ? 'Lite' : meta.compareMode ? 'Compare' : 'Pro';
  const filename = `N4S-VMX-${modeTag}-${safeClient}-${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(filename);
  console.log(`[VMX Report] Generated: ${filename} (${state.pageNumber} pages)`);
  return filename;
};
