/**
 * docsPdfExport.js
 *
 * Shared utility for exporting N4S documentation panels as branded PDFs.
 * Uses html2canvas + jsPDF with PER-CARD capture — each doc-card is captured
 * individually and placed using a layout engine that never splits cards across pages.
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

// A4 Portrait for documentation
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
  cardGap: 4, // mm gap between cards
};

const formatDate = (d) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// =============================================================================
// HEADER & FOOTER — N4S STANDARD
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
// NEW PAGE HELPER
// =============================================================================

const startNewPage = (doc, state, reportLabel) => {
  doc.addPage();
  state.pageNumber++;
  addHeader(doc, reportLabel);
  addFooter(doc, state.pageNumber);
  state.currentY = PAGE.contentTop + 2;
};

// =============================================================================
// COVER PAGE
// =============================================================================

const addCoverPage = (doc, moduleName, moduleSubtitle) => {
  addHeader(doc, `${moduleName} Documentation`);
  addFooter(doc, 1);

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

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text('Contents', PAGE.margin, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const sections = ['1.  Overview', '2.  Workflow', '3.  Gates & Validation', '4.  Reference'];
  sections.forEach((s) => {
    doc.text(s, PAGE.margin + 4, y);
    y += 6;
  });
};

// =============================================================================
// SECTION DIVIDER — starts each tab on a new page
// =============================================================================

const addSectionDivider = (doc, state, reportLabel, sectionTitle) => {
  startNewPage(doc, state, reportLabel);
  state.currentY = PAGE.contentTop + 6;

  // Section title in navy
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.navy);
  doc.text(sectionTitle, PAGE.margin, state.currentY);
  state.currentY += 4;

  // Gold rule
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.line(PAGE.margin, state.currentY, PAGE.margin + 50, state.currentY);
  state.currentY += 8;
};

// =============================================================================
// PER-CARD CAPTURE & LAYOUT ENGINE
// =============================================================================

/**
 * Captures a single DOM element as a canvas.
 */
const captureCard = async (el) => {
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
 * Converts canvas to JPEG data URL.
 */
const canvasToJpeg = (canvas) => canvas.toDataURL('image/jpeg', 0.75);

/**
 * Places a single captured card on the PDF.
 * - If it fits the remaining page space -> place it here
 * - If it doesn't fit -> new page, place at top
 * - If taller than a full page -> scale down to fit one page
 *
 * NEVER splits a card across pages.
 */
const placeCard = (doc, canvas, state, reportLabel) => {
  const pxPerMm = canvas.width / PAGE.contentWidth;
  const cardHeightMm = canvas.height / pxPerMm;
  const availableHeight = PAGE.contentBottom - state.currentY;
  const maxH = PAGE.usableHeight - 4; // 4mm breathing room

  // Does the card fit on this page?
  if (cardHeightMm <= availableHeight) {
    const imgData = canvasToJpeg(canvas);
    doc.addImage(imgData, 'JPEG', PAGE.margin, state.currentY, PAGE.contentWidth, cardHeightMm);
    state.currentY += cardHeightMm + PAGE.cardGap;
    return;
  }

  // Card doesn't fit current page -> start a new page
  startNewPage(doc, state, reportLabel);

  if (cardHeightMm <= maxH) {
    // Fits on a fresh page
    const imgData = canvasToJpeg(canvas);
    doc.addImage(imgData, 'JPEG', PAGE.margin, state.currentY, PAGE.contentWidth, cardHeightMm);
    state.currentY += cardHeightMm + PAGE.cardGap;
  } else {
    // Card is taller than a full page -> scale down to fit
    const scaleFactor = maxH / cardHeightMm;
    const renderHeight = maxH;
    const renderWidth = PAGE.contentWidth * scaleFactor;
    const xOffset = PAGE.margin + (PAGE.contentWidth - renderWidth) / 2;

    const imgData = canvasToJpeg(canvas);
    doc.addImage(imgData, 'JPEG', xOffset, state.currentY, renderWidth, renderHeight);
    state.currentY += renderHeight + PAGE.cardGap;
  }
};

// =============================================================================
// EXPAND ALL COLLAPSIBLE SECTIONS
// =============================================================================

/**
 * Forces all ExpandableSection components open for PDF capture.
 * These use conditional React rendering ({isOpen && <content>}),
 * so we must click the header buttons to toggle React state.
 * Returns a restore function that clicks back any we opened.
 */
const expandAllSections = async (containerEl) => {
  const expandables = containerEl.querySelectorAll('.doc-expandable');
  const headersWeOpened = [];

  expandables.forEach((el) => {
    const content = el.querySelector('.doc-expandable-content');
    const header = el.querySelector('.doc-expandable-header');
    // If there's no content div, the section is collapsed (conditional render)
    if (!content && header) {
      header.click();
      headersWeOpened.push(header);
    }
  });

  // Wait for React to re-render after clicks
  if (headersWeOpened.length > 0) {
    await new Promise((r) => setTimeout(r, 200));
  }

  return () => {
    // Click them back to collapse
    headersWeOpened.forEach((h) => h.click());
  };
};

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Exports a documentation panel as a branded PDF using per-card capture.
 * Each [data-pdf-card] element is captured individually and placed using
 * a layout engine that keeps cards intact across page boundaries.
 *
 * @param {Object} options
 * @param {Object} options.contentRef - React ref to the .doc-content div
 * @param {Function} options.setActiveTab - Function to switch tabs
 * @param {string[]} options.tabIds - Array of tab IDs
 * @param {string} options.moduleName - e.g. 'KYC', 'VMX'
 * @param {string} options.moduleSubtitle - e.g. 'Know Your Client Guide'
 * @param {string} options.currentTab - Current active tab to restore
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
  const tabLabels = {
    overview: 'Overview',
    workflow: 'Workflow',
    gates: 'Gates & Validation',
    reference: 'Reference',
  };

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const state = { currentY: PAGE.contentTop, pageNumber: 1 };

    // ---- Cover page ----
    addCoverPage(doc, moduleName, moduleSubtitle);

    // ---- Process each tab ----
    for (let t = 0; t < tabIds.length; t++) {
      const tabId = tabIds[t];

      // Switch tab and wait for React render
      setActiveTab(tabId);
      await new Promise((r) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 200)));
      });

      const contentEl = contentRef.current || contentRef;
      if (!contentEl) continue;

      // Expand all collapsible sections for full capture
      const restoreExpand = await expandAllSections(contentEl);
      await new Promise((r) => setTimeout(r, 100));

      // Section divider page
      addSectionDivider(doc, state, reportLabel, tabLabels[tabId] || tabId);

      // Find all cards in this tab via data-pdf-card attribute
      const cards = contentEl.querySelectorAll('[data-pdf-card]');
      console.log(`[Docs PDF] Tab "${tabId}": found ${cards.length} cards`);

      // Capture and place each card individually
      for (let c = 0; c < cards.length; c++) {
        const cardEl = cards[c];
        const cardId = cardEl.getAttribute('data-pdf-card');
        console.log(`[Docs PDF]   Capturing card: ${cardId}`);

        try {
          const canvas = await captureCard(cardEl);
          placeCard(doc, canvas, state, reportLabel);
        } catch (err) {
          console.error(`[Docs PDF]   Failed to capture card ${cardId}:`, err);
        }
      }

      // Restore collapsed state
      restoreExpand();
    }

    // ---- Update all footers with total page count ----
    updateAllFooters(doc, state.pageNumber);

    // ---- Restore original tab ----
    setActiveTab(currentTab);

    // ---- Save ----
    const filename = `N4S-${moduleName}-Documentation.pdf`;
    doc.save(filename);
    console.log(`[Docs PDF] Generated: ${filename} (${state.pageNumber} pages)`);

  } catch (err) {
    console.error(`[Docs PDF] Export failed for ${moduleName}:`, err);
    setActiveTab(currentTab);
  }

  if (onComplete) onComplete();
}
