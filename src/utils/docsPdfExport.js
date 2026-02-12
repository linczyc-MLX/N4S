/**
 * docsPdfExport.js
 *
 * Shared utility for exporting N4S documentation panels as branded PDFs.
 * Uses html2canvas + jsPDF. Called from each module's Documentation component.
 *
 * Standard footer: (C) 2026 Not4Sale LLC - Luxury Residential Advisory | Page X of Y | Date
 * Standard header: Navy bar with "N4S" left, report type right.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// =============================================================================
// N4S BRAND CONSTANTS
// =============================================================================

const COLORS = {
  navy: [30, 58, 95],
  gold: [201, 162, 39],
  text: [26, 26, 26],
  textMuted: [107, 107, 107],
  border: [229, 229, 224],
  white: [255, 255, 255],
};

// A4 Portrait for documentation (text-heavy, easier to read)
const PAGE = {
  width: 210,
  height: 297,
  margin: 15,
  headerBarHeight: 8,
  footerHeight: 12,
  get contentWidth() { return this.width - (this.margin * 2); },
  get contentTop() { return this.margin + this.headerBarHeight + 4; },
  get contentBottom() { return this.height - this.margin - this.footerHeight; },
  get usableHeight() { return this.contentBottom - this.contentTop; },
};

const formatDate = (d) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// =============================================================================
// HEADER & FOOTER
// =============================================================================

const addHeader = (doc, reportLabel) => {
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, PAGE.width, PAGE.headerBarHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('N4S', PAGE.margin, PAGE.headerBarHeight - 2);
  doc.setFont('helvetica', 'normal');
  doc.text(reportLabel, PAGE.width - PAGE.margin, PAGE.headerBarHeight - 2, { align: 'right' });
};

const addFooter = (doc, pageNum) => {
  const footerY = PAGE.height - PAGE.margin - 2;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin, footerY - 3, PAGE.width - PAGE.margin, footerY - 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('(C) 2026 Not4Sale LLC - Luxury Residential Advisory', PAGE.margin, footerY);
  doc.text(`Page ${pageNum}`, PAGE.width / 2, footerY, { align: 'center' });
  doc.text(formatDate(new Date()), PAGE.width - PAGE.margin, footerY, { align: 'right' });
};

const updateAllFooters = (doc, totalPages) => {
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = PAGE.height - PAGE.margin - 2;
    doc.setFillColor(...COLORS.white);
    doc.rect(PAGE.width / 2 - 20, footerY - 4, 40, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Page ${i} of ${totalPages}`, PAGE.width / 2, footerY, { align: 'center' });
  }
};

// =============================================================================
// COVER PAGE
// =============================================================================

const addCoverPage = (doc, moduleName, moduleSubtitle, pageNum) => {
  addHeader(doc, `${moduleName} Documentation`);
  addFooter(doc, pageNum);

  // Gold accent line
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1);
  doc.line(PAGE.margin, PAGE.headerBarHeight + 4, PAGE.width - PAGE.margin, PAGE.headerBarHeight + 4);

  let y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.navy);
  doc.text(`N4S ${moduleName}`, PAGE.margin, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(moduleSubtitle, PAGE.margin, y);

  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Generated: ${formatDate(new Date())}`, PAGE.margin, y);

  y += 7;
  doc.text('Sections: Overview \u2022 Workflow \u2022 Gates & Validation \u2022 Reference', PAGE.margin, y);
};

// =============================================================================
// CAPTURE & PLACE
// =============================================================================

const captureElement = async (el) => {
  const canvas = await html2canvas(el, {
    scale: 1.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 800,
  });
  return canvas;
};

/**
 * Places a captured canvas across one or more PDF pages.
 * Splits tall content across pages rather than scaling.
 */
const placeCanvasOnPages = (doc, canvas, state, reportLabel) => {
  const pxPerMm = canvas.width / PAGE.contentWidth;
  const totalHeightMm = canvas.height / pxPerMm;
  const usable = PAGE.usableHeight;

  if (totalHeightMm <= usable) {
    const imgData = canvas.toDataURL('image/jpeg', 0.75);
    doc.addImage(imgData, 'JPEG', PAGE.margin, state.currentY, PAGE.contentWidth, totalHeightMm);
    state.currentY += totalHeightMm + 4;
    return;
  }

  // Split across multiple pages by slicing the canvas
  let srcYPx = 0;
  const canvasW = canvas.width;
  const canvasH = canvas.height;

  while (srcYPx < canvasH) {
    const availH = PAGE.contentBottom - state.currentY;
    const availHPx = availH * pxPerMm;
    const sliceHPx = Math.min(availHPx, canvasH - srcYPx);
    const sliceHMm = sliceHPx / pxPerMm;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvasW;
    sliceCanvas.height = Math.ceil(sliceHPx);
    const ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, srcYPx, canvasW, sliceHPx, 0, 0, canvasW, sliceHPx);

    const imgData = sliceCanvas.toDataURL('image/jpeg', 0.75);
    doc.addImage(imgData, 'JPEG', PAGE.margin, state.currentY, PAGE.contentWidth, sliceHMm);

    srcYPx += sliceHPx;
    state.currentY += sliceHMm + 2;

    if (srcYPx < canvasH - 1) {
      doc.addPage();
      state.pageNumber++;
      addHeader(doc, reportLabel);
      addFooter(doc, state.pageNumber);
      state.currentY = PAGE.contentTop + 4;
    }
  }
};

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Exports a documentation panel as a branded PDF.
 *
 * @param {Object} options
 * @param {Object} options.contentRef - React ref to the .doc-content div
 * @param {Function} options.setActiveTab - Function to switch tabs
 * @param {string[]} options.tabIds - Array of tab IDs
 * @param {string} options.moduleName - e.g. 'KYC', 'VMX', 'FYI'
 * @param {string} options.moduleSubtitle - e.g. 'Know Your Client Guide'
 * @param {string} options.currentTab - Current active tab to restore after export
 * @param {Function} [options.onStart] - Called when export starts
 * @param {Function} [options.onComplete] - Called when export finishes
 */
export async function exportDocumentationPdf({
  contentRef,
  setActiveTab,
  tabIds = ['overview', 'workflow', 'gates', 'reference'],
  moduleName,
  moduleSubtitle,
  currentTab,
  onStart,
  onComplete,
}) {
  if (onStart) onStart();

  const reportLabel = `${moduleName} Documentation`;

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const state = { currentY: PAGE.contentTop, pageNumber: 1 };

    // --- Cover page ---
    addCoverPage(doc, moduleName, moduleSubtitle, 1);

    // --- Capture each tab ---
    const tabLabels = { overview: 'Overview', workflow: 'Workflow', gates: 'Gates & Validation', reference: 'Reference' };

    for (let i = 0; i < tabIds.length; i++) {
      const tabId = tabIds[i];

      // Switch to this tab and wait for render
      setActiveTab(tabId);
      await new Promise((r) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)));
      });

      // New page for each section
      doc.addPage();
      state.pageNumber++;
      addHeader(doc, reportLabel);
      addFooter(doc, state.pageNumber);
      state.currentY = PAGE.contentTop + 4;

      // Add section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.navy);
      doc.text(tabLabels[tabId] || tabId, PAGE.margin, state.currentY);
      state.currentY += 8;

      // Gold divider
      doc.setDrawColor(...COLORS.gold);
      doc.setLineWidth(0.5);
      doc.line(PAGE.margin, state.currentY, PAGE.margin + 40, state.currentY);
      state.currentY += 6;

      // Capture content
      const el = contentRef.current || contentRef;
      if (el) {
        const canvas = await captureElement(el);
        placeCanvasOnPages(doc, canvas, state, reportLabel);
      }
    }

    // --- Update all footers with total page count ---
    updateAllFooters(doc, state.pageNumber);

    // --- Restore original tab ---
    setActiveTab(currentTab);

    // --- Save ---
    const filename = `N4S-${moduleName}-Documentation.pdf`;
    doc.save(filename);

  } catch (err) {
    console.error(`[Docs PDF] Export failed for ${moduleName}:`, err);
    setActiveTab(currentTab);
  }

  if (onComplete) onComplete();
}
