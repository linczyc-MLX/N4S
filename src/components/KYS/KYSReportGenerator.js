/**
 * KYSReportGenerator.js
 *
 * Generates Site Assessment PDF reports following N4S brand standards.
 * Uses jsPDF for PDF generation with consistent styling.
 *
 * Report Sections:
 * 1. Cover Page - N4S branded with project/site info
 * 2. Executive Summary - Overall GO/NO-GO with traffic light
 * 3. Site Information - Property details
 * 4. Category Assessments - 7 categories with scores and notes
 * 5. Deal-Breaker Analysis - Triggered vs clear flags
 * 6. Multi-Site Comparison - Side-by-side ranking (if applicable)
 * 7. Handoff Notes - Constraints and insights for next modules
 *
 * "You make your money on the buy" — Arvin
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CATEGORIES, DEAL_BREAKERS, calculateOverallAssessment,
  getTrafficLight, getTrafficLightColor, compareSites
} from './KYSScoringEngine';

// =============================================================================
// N4S BRAND CONSTANTS
// =============================================================================

const COLORS = {
  navy: [30, 58, 95],          // #1e3a5f
  gold: [201, 162, 39],        // #c9a227
  copper: [196, 164, 132],     // #C4A484 - KYS module color
  text: [26, 26, 26],          // #1a1a1a
  textMuted: [107, 107, 107],  // #6b6b6b
  background: [250, 250, 248], // #fafaf8
  border: [229, 229, 224],     // #e5e5e0
  accentLight: [245, 240, 232],// #f5f0e8
  success: [46, 125, 50],      // #2e7d32 - GREEN
  warning: [245, 124, 0],      // #f57c00 - AMBER
  error: [211, 47, 47],        // #d32f2f - RED
  white: [255, 255, 255],
};

const FONTS = {
  heading: 'helvetica',
  body: 'helvetica',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatCurrency = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns RGB color array based on traffic light
 */
const getTrafficLightRGB = (light) => {
  switch (light) {
    case 'green': return COLORS.success;
    case 'amber': return COLORS.warning;
    case 'red': return COLORS.error;
    default: return COLORS.textMuted;
  }
};

/**
 * Returns label text for traffic light
 */
const getTrafficLightLabel = (light) => {
  switch (light) {
    case 'green': return 'PROCEED';
    case 'amber': return 'CAUTION';
    case 'red': return 'DO NOT PROCEED';
    default: return 'INCOMPLETE';
  }
};

/**
 * Returns recommendation label for traffic light
 */
const getRecommendationText = (light) => {
  switch (light) {
    case 'green': return 'Proceed with acquisition';
    case 'amber': return 'Proceed only with documented mitigation strategy';
    case 'red': return 'Do not acquire this site for this vision';
    default: return 'Assessment incomplete';
  }
};

// =============================================================================
// PDF GENERATION
// =============================================================================

/**
 * Generate KYS Site Assessment Report
 *
 * @param {object} data - Report data
 * @param {object} data.kycData - Client profile (for names, project info)
 * @param {object} data.kysData - KYS assessment data with sites array
 * @param {object} data.fyiData - FYI data (for target SF, program info)
 * @param {object} data.mvpData - MVP data (for validated tier)
 * @param {string} data.siteId - ID of the site to report on (null = all sites)
 */
export const generateKYSReport = async (data) => {
  const {
    kycData,
    kysData,
    fyiData,
    mvpData,
    siteId = null,
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 0;

  // ---------------------------------------------------------------------------
  // Extract client info from KYC (same pattern as KYM)
  // ---------------------------------------------------------------------------
  const principalFirstName = kycData?.principal?.portfolioContext?.principalFirstName || '';
  const principalLastName = kycData?.principal?.portfolioContext?.principalLastName || '';
  const secondaryFirstName = kycData?.principal?.portfolioContext?.secondaryFirstName || '';
  const secondaryLastName = kycData?.principal?.portfolioContext?.secondaryLastName || '';

  let clientName = 'Client';
  if (principalFirstName && principalLastName) {
    if (secondaryFirstName && secondaryLastName === principalLastName) {
      clientName = `${principalFirstName} & ${secondaryFirstName} ${principalLastName}`;
    } else if (secondaryFirstName && secondaryLastName) {
      clientName = `${principalFirstName} ${principalLastName} & ${secondaryFirstName} ${secondaryLastName}`;
    } else {
      clientName = `${principalFirstName} ${principalLastName}`;
    }
  } else if (principalFirstName) {
    clientName = principalFirstName;
  }

  const projectName = kycData?.principal?.projectParameters?.projectName || 'Luxury Residence';
  const projectCity = kycData?.principal?.projectParameters?.projectCity || '';
  const projectState = kycData?.principal?.projectParameters?.projectState || '';

  // ---------------------------------------------------------------------------
  // Get sites to report on
  // ---------------------------------------------------------------------------
  const allSites = kysData?.sites || [];
  const reportSites = siteId
    ? allSites.filter(s => s.id === siteId)
    : allSites;

  if (reportSites.length === 0) {
    console.warn('[KYS Report] No sites to report on');
    return null;
  }

  // Calculate assessments for all report sites
  const siteAssessments = reportSites.map(site => ({
    site,
    assessment: calculateOverallAssessment(site.scores),
  }));

  // Get program info from FYI/MVP
  const targetSF = fyiData?.totalSquareFootage || mvpData?.totalSquareFootage || null;
  const validatedTier = mvpData?.validatedTier || null;

  // Page tracking
  let pageNumber = 1;

  // ==========================================================================
  // HEADER & FOOTER FUNCTIONS
  // ==========================================================================

  const addHeader = () => {
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, pageWidth, 8, 'F');
  };

  const addFooter = (pageNum) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('(C) 2026 Not4Sale LLC - Luxury Residential Advisory', margin, footerY + 5);
    doc.text(`Page ${pageNum}`, pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text(formatDate(new Date()), pageWidth - margin, footerY + 5, { align: 'right' });
  };

  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    return 25;
  };

  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 25) {
      currentY = addNewPage();
    }
    return currentY;
  };

  // ==========================================================================
  // SECTION HEADING HELPER
  // ==========================================================================

  const drawSectionHeading = (title) => {
    currentY = checkPageBreak(20);
    doc.setFillColor(...COLORS.navy);
    doc.rect(margin, currentY, contentWidth, 8, 'F');
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.white);
    doc.text(title, margin + 4, currentY + 5.5);
    currentY += 14;
  };

  // ==========================================================================
  // TRAFFIC LIGHT DOT HELPER
  // ==========================================================================

  const drawTrafficDot = (x, y, light, radius = 4) => {
    const color = getTrafficLightRGB(light);
    doc.setFillColor(...color);
    doc.circle(x, y, radius, 'F');
  };

  // ==========================================================================
  // SCORE BAR HELPER
  // ==========================================================================

  const drawScoreBar = (x, y, width, score, maxScore = 5) => {
    const barHeight = 5;
    const fillPct = Math.min((score || 0) / maxScore, 1);
    const light = getTrafficLight(score);
    const color = getTrafficLightRGB(light);

    // Track background
    doc.setFillColor(...COLORS.border);
    doc.roundedRect(x, y, width, barHeight, 1.5, 1.5, 'F');

    // Filled portion
    if (fillPct > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(x, y, width * fillPct, barHeight, 1.5, 1.5, 'F');
    }

    return barHeight;
  };

  // ==========================================================================
  // COVER PAGE
  // ==========================================================================

  addHeader();

  // N4S branding
  currentY = 50;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.navy);
  doc.text('N4S', margin, currentY);

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Luxury Residential Advisory', margin, currentY + 7);

  // Report type
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text('Site Assessment Report', pageWidth - margin, currentY, { align: 'right' });

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(formatDate(new Date()), pageWidth - margin, currentY + 7, { align: 'right' });

  // Main title
  currentY = 100;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.navy);
  doc.text('Site Assessment', margin, currentY);
  doc.text('Report', margin, currentY + 12);

  // Site subtitle (or multi-site label)
  currentY += 30;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  if (reportSites.length === 1) {
    const siteName = reportSites[0].basicInfo.name || 'Unnamed Site';
    doc.text(siteName, margin, currentY);
    const siteLocation = [reportSites[0].basicInfo.city, reportSites[0].basicInfo.state]
      .filter(Boolean).join(', ');
    if (siteLocation) {
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(siteLocation, margin, currentY + 8);
    }
  } else {
    doc.text(`${reportSites.length} Sites Evaluated`, margin, currentY);
    if (projectCity) {
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(`${projectCity}${projectState ? `, ${projectState}` : ''}`, margin, currentY + 8);
    }
  }

  // Client info box
  currentY = 160;
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, 'F');

  currentY += 10;
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('PREPARED FOR', margin + 8, currentY);

  currentY += 7;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text(clientName, margin + 8, currentY);

  currentY += 7;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text(projectName, margin + 8, currentY);

  // Program summary box
  if (targetSF || validatedTier) {
    currentY = 210;
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('VALIDATED PROGRAM', margin, currentY);
    currentY += 5;
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const programParts = [];
    if (targetSF) programParts.push(`${formatNumber(targetSF)} SF`);
    if (validatedTier) programParts.push(`${validatedTier} Tier`);
    doc.text(programParts.join(' | '), margin, currentY);
  }

  // Arvin quote
  currentY = 240;
  doc.setFont(FONTS.body, 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('"You make your money on the buy"', margin, currentY);
  doc.setFont(FONTS.body, 'normal');
  doc.text('— Arvin', margin + 85, currentY);

  addFooter(1);

  // ==========================================================================
  // GENERATE PAGES FOR EACH SITE
  // ==========================================================================

  for (let sIdx = 0; sIdx < siteAssessments.length; sIdx++) {
    const { site, assessment } = siteAssessments[sIdx];
    const info = site.basicInfo;

    // ========================================================================
    // EXECUTIVE SUMMARY PAGE
    // ========================================================================

    currentY = addNewPage();

    // Site title banner
    doc.setFillColor(...COLORS.copper);
    doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.white);
    const siteTitle = reportSites.length > 1
      ? `Site ${sIdx + 1} of ${reportSites.length}: ${info.name || 'Unnamed Site'}`
      : (info.name || 'Site Assessment');
    doc.text(siteTitle, margin + 5, currentY + 8);
    currentY += 18;

    // Overall verdict box
    const verdictBoxHeight = 40;
    const light = assessment.trafficLight;
    const verdictColor = getTrafficLightRGB(light);

    doc.setFillColor(...COLORS.accentLight);
    doc.roundedRect(margin, currentY, contentWidth, verdictBoxHeight, 3, 3, 'F');

    // Left: traffic dot + verdict
    drawTrafficDot(margin + 16, currentY + verdictBoxHeight / 2, light, 8);

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...verdictColor);
    doc.text(getTrafficLightLabel(light), margin + 30, currentY + 15);

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const recText = doc.splitTextToSize(getRecommendationText(light), contentWidth - 80);
    doc.text(recText, margin + 30, currentY + 23);

    // Right: score display
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...verdictColor);
    const scoreText = assessment.overallScore !== null ? assessment.overallScore.toFixed(1) : '—';
    doc.text(scoreText, pageWidth - margin - 20, currentY + 16, { align: 'center' });

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('/ 5.0', pageWidth - margin - 20, currentY + 23, { align: 'center' });
    doc.text(`${assessment.completionPct || 0}% Complete`, pageWidth - margin - 20, currentY + 30, { align: 'center' });

    currentY += verdictBoxHeight + 8;

    // Deal-breaker alert (if any)
    if (assessment.triggeredDealBreakers && assessment.triggeredDealBreakers.length > 0) {
      const dbCount = assessment.triggeredDealBreakers.length;
      doc.setFillColor(255, 235, 235); // Light red background
      doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.error);
      doc.text(`WARNING: ${dbCount} Deal-Breaker${dbCount > 1 ? 's' : ''} Triggered — Automatic RED Override`, margin + 4, currentY + 6.5);
      currentY += 14;
    }

    // ========================================================================
    // SITE INFORMATION
    // ========================================================================

    drawSectionHeading('Site Information');

    const siteInfoData = [];
    if (info.name) siteInfoData.push(['Site Name', info.name]);
    if (info.address) siteInfoData.push(['Address', info.address]);
    const cityState = [info.city, info.state].filter(Boolean).join(', ');
    if (cityState) siteInfoData.push(['City / State', cityState]);
    if (info.zipCode) siteInfoData.push(['ZIP Code', info.zipCode]);
    if (info.askingPrice) siteInfoData.push(['Asking Price', formatCurrency(info.askingPrice)]);
    if (info.lotSizeSF) siteInfoData.push(['Lot Size', `${formatNumber(info.lotSizeSF)} SF`]);
    if (info.lotSizeAcres) siteInfoData.push(['Lot Size (Acres)', `${info.lotSizeAcres} ac`]);
    if (info.lotWidth && info.lotDepth) siteInfoData.push(['Lot Dimensions', `${info.lotWidth}' W × ${info.lotDepth}' D`]);
    if (info.zoning) siteInfoData.push(['Zoning', info.zoning]);
    if (info.mlsNumber) siteInfoData.push(['MLS #', info.mlsNumber]);

    if (siteInfoData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [],
        body: siteInfoData,
        theme: 'plain',
        styles: {
          font: FONTS.body,
          fontSize: 9,
          cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45, textColor: COLORS.textMuted },
          1: { cellWidth: contentWidth - 45 },
        },
        margin: { left: margin, right: margin },
      });
      currentY = doc.lastAutoTable.finalY + 8;
    }

    // Site notes
    if (info.notes) {
      doc.setFont(FONTS.body, 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);
      const noteLines = doc.splitTextToSize(`Notes: ${info.notes}`, contentWidth);
      doc.text(noteLines, margin, currentY);
      currentY += noteLines.length * 4 + 6;
    }

    // ========================================================================
    // CATEGORY ASSESSMENTS
    // ========================================================================

    drawSectionHeading('Category Assessment Scores');

    // Category summary table
    const catSummaryData = Object.entries(CATEGORIES).map(([catId, cat]) => {
      const score = assessment.categoryScores[catId];
      const catLight = assessment.categoryLights[catId];
      const lightLabel = catLight ? catLight.toUpperCase() : '—';
      const weightPct = `${(cat.weight * 100).toFixed(0)}%`;
      return [
        cat.name,
        weightPct,
        score !== null ? score.toFixed(1) : '—',
        lightLabel,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Category', 'Weight', 'Score', 'Status']],
      body: catSummaryData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3,
      },
      styles: {
        font: FONTS.body,
        fontSize: 9,
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
        textColor: COLORS.text,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        // Color the Status column based on traffic light
        if (data.section === 'body' && data.column.index === 3) {
          const label = data.cell.raw;
          if (label === 'GREEN') data.cell.styles.textColor = COLORS.success;
          else if (label === 'AMBER') data.cell.styles.textColor = COLORS.warning;
          else if (label === 'RED') data.cell.styles.textColor = COLORS.error;
        }
        // Bold the score column and color it
        if (data.section === 'body' && data.column.index === 2) {
          const scoreVal = parseFloat(data.cell.raw);
          if (!isNaN(scoreVal)) {
            const sLight = getTrafficLight(scoreVal);
            data.cell.styles.textColor = getTrafficLightRGB(sLight);
          }
        }
      },
    });
    currentY = doc.lastAutoTable.finalY + 8;

    // ========================================================================
    // DETAILED CATEGORY BREAKDOWN
    // ========================================================================

    Object.entries(CATEGORIES).forEach(([catId, cat]) => {
      currentY = checkPageBreak(45);

      // Category sub-heading
      doc.setFont(FONTS.heading, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.navy);
      const catScore = assessment.categoryScores[catId];
      const catLight = assessment.categoryLights[catId];
      const catScoreStr = catScore !== null ? ` — ${catScore.toFixed(1)}/5.0` : '';
      doc.text(`${cat.name}${catScoreStr}`, margin, currentY);

      // Traffic dot next to category name
      if (catLight) {
        const textWidth = doc.getTextWidth(`${cat.name}${catScoreStr}`);
        drawTrafficDot(margin + textWidth + 5, currentY - 1.5, catLight, 2.5);
      }

      currentY += 3;

      // Weight label
      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(`Weight: ${(cat.weight * 100).toFixed(0)}% | ${cat.description}`, margin, currentY);
      currentY += 5;

      // Factor detail table
      const factorData = cat.factors.map(factor => {
        const fScore = site.scores[factor.id];
        const scoreVal = fScore?.score;
        const notes = fScore?.notes || '';
        return [
          factor.id,
          factor.name,
          scoreVal !== null && scoreVal !== undefined ? scoreVal.toFixed(1) : '—',
          notes || '—',
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Factor', 'Score', 'Notes']],
        body: factorData,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.accentLight,
          textColor: COLORS.navy,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2,
        },
        styles: {
          font: FONTS.body,
          fontSize: 8,
          cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center', textColor: COLORS.textMuted },
          1: { cellWidth: 55 },
          2: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: contentWidth - 83, fontSize: 7.5, textColor: COLORS.textMuted },
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const val = parseFloat(data.cell.raw);
            if (!isNaN(val)) {
              const fLight = getTrafficLight(val);
              data.cell.styles.textColor = getTrafficLightRGB(fLight);
            }
          }
        },
      });
      currentY = doc.lastAutoTable.finalY + 6;
    });

    // ========================================================================
    // DEAL-BREAKER ANALYSIS
    // ========================================================================

    currentY = checkPageBreak(50);
    drawSectionHeading('Deal-Breaker Analysis');

    const triggered = (assessment.dealBreakers || []).filter(db => db.triggered);
    const clear = (assessment.dealBreakers || []).filter(db => !db.triggered);

    if (triggered.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.error);
      doc.text(`Triggered (${triggered.length})`, margin, currentY);
      currentY += 5;

      const triggeredData = triggered.map(db => [
        db.id,
        db.name,
        db.description || '',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Flag', 'Deal-Breaker', 'Description']],
        body: triggeredData,
        theme: 'plain',
        headStyles: {
          fillColor: [255, 235, 235],
          textColor: COLORS.error,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2,
        },
        styles: {
          font: FONTS.body,
          fontSize: 8,
          cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center', fontStyle: 'bold', textColor: COLORS.error },
          1: { cellWidth: 60, fontStyle: 'bold' },
          2: { cellWidth: contentWidth - 75, textColor: COLORS.textMuted, fontSize: 7.5 },
        },
        margin: { left: margin, right: margin },
      });
      currentY = doc.lastAutoTable.finalY + 6;
    }

    if (clear.length > 0) {
      currentY = checkPageBreak(20);
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.success);
      doc.text(`Clear (${clear.length})`, margin, currentY);
      currentY += 5;

      const clearData = clear.map(db => [db.id, db.name]);

      autoTable(doc, {
        startY: currentY,
        head: [['Flag', 'Deal-Breaker']],
        body: clearData,
        theme: 'plain',
        headStyles: {
          fillColor: [235, 255, 235],
          textColor: COLORS.success,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2,
        },
        styles: {
          font: FONTS.body,
          fontSize: 8,
          cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 },
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center', textColor: COLORS.success },
          1: { cellWidth: contentWidth - 15 },
        },
        margin: { left: margin, right: margin },
      });
      currentY = doc.lastAutoTable.finalY + 6;
    }

    if (triggered.length === 0 && clear.length === 0) {
      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('No deal-breakers evaluated. Complete all factor scores to enable deal-breaker detection.', margin, currentY);
      currentY += 8;
    }

    // ========================================================================
    // DETAILED RECOMMENDATION
    // ========================================================================

    currentY = checkPageBreak(35);
    drawSectionHeading('Recommendation');

    doc.setFillColor(...COLORS.accentLight);
    doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'F');

    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...getTrafficLightRGB(light));
    doc.text(getTrafficLightLabel(light), margin + 5, currentY + 7);

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    const fullRec = doc.splitTextToSize(assessment.recommendation || getRecommendationText(light), contentWidth - 10);
    doc.text(fullRec, margin + 5, currentY + 13);
    currentY += 26;

    // ========================================================================
    // HANDOFF NOTES
    // ========================================================================

    const hasHandoff = site.handoffNotes?.siteConstraints || site.handoffNotes?.insightsForKYM;
    if (hasHandoff) {
      currentY = checkPageBreak(30);
      drawSectionHeading('Handoff Notes');

      if (site.handoffNotes.siteConstraints) {
        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.navy);
        doc.text('Site Constraints (for Documentation)', margin, currentY);
        currentY += 4;

        doc.setFont(FONTS.body, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        const constraintLines = doc.splitTextToSize(site.handoffNotes.siteConstraints, contentWidth);
        doc.text(constraintLines, margin, currentY);
        currentY += constraintLines.length * 4 + 6;
      }

      if (site.handoffNotes.insightsForKYM) {
        currentY = checkPageBreak(15);
        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.navy);
        doc.text('Insights for Market Analysis (KYM)', margin, currentY);
        currentY += 4;

        doc.setFont(FONTS.body, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        const insightLines = doc.splitTextToSize(site.handoffNotes.insightsForKYM, contentWidth);
        doc.text(insightLines, margin, currentY);
        currentY += insightLines.length * 4 + 6;
      }
    }
  }

  // ==========================================================================
  // MULTI-SITE COMPARISON (if more than one site)
  // ==========================================================================

  if (siteAssessments.length > 1) {
    currentY = addNewPage();

    drawSectionHeading('Multi-Site Comparison');

    // Ranking table
    const ranked = compareSites(reportSites);

    const rankingData = ranked.map((item, index) => {
      const a = item.assessment;
      const bi = item.site.basicInfo;
      return [
        `#${index + 1}`,
        bi.name || 'Unnamed',
        a.overallScore !== null ? a.overallScore.toFixed(1) : '—',
        a.trafficLight ? a.trafficLight.toUpperCase() : '—',
        a.triggeredDealBreakers?.length || 0,
        bi.askingPrice ? formatCurrency(bi.askingPrice) : '—',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Site', 'Score', 'Status', 'Deal-Breakers', 'Price']],
      body: rankingData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3,
      },
      styles: {
        font: FONTS.body,
        fontSize: 9,
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
        textColor: COLORS.text,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 28, halign: 'center' },
        5: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const label = data.cell.raw;
          if (label === 'GREEN') data.cell.styles.textColor = COLORS.success;
          else if (label === 'AMBER') data.cell.styles.textColor = COLORS.warning;
          else if (label === 'RED') data.cell.styles.textColor = COLORS.error;
        }
        if (data.section === 'body' && data.column.index === 4) {
          const count = parseInt(data.cell.raw);
          if (count > 0) data.cell.styles.textColor = COLORS.error;
          else data.cell.styles.textColor = COLORS.success;
        }
      },
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Category-by-category comparison
    currentY = checkPageBreak(30);
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);
    doc.text('Category Comparison', margin, currentY);
    currentY += 6;

    const catCompareHead = ['Category', ...ranked.map((r, i) => r.site.basicInfo.name || `Site ${i + 1}`)];
    const catCompareBody = Object.entries(CATEGORIES).map(([catId, cat]) => {
      const row = [cat.name];
      ranked.forEach(r => {
        const score = r.assessment.categoryScores[catId];
        row.push(score !== null ? score.toFixed(1) : '—');
      });
      return row;
    });

    // Add overall row
    catCompareBody.push([
      'OVERALL',
      ...ranked.map(r => r.assessment.overallScore !== null ? r.assessment.overallScore.toFixed(1) : '—'),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [catCompareHead],
      body: catCompareBody,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2.5,
      },
      styles: {
        font: FONTS.body,
        fontSize: 8,
        cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
        textColor: COLORS.text,
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 55, fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        // Color score cells
        if (data.section === 'body' && data.column.index > 0) {
          const val = parseFloat(data.cell.raw);
          if (!isNaN(val)) {
            const sLight = getTrafficLight(val);
            data.cell.styles.textColor = getTrafficLightRGB(sLight);
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Bold the overall row
        if (data.section === 'body' && data.row.index === catCompareBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 9;
        }
      },
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // ==========================================================================
  // SAVE PDF
  // ==========================================================================

  const siteSuffix = reportSites.length === 1
    ? (reportSites[0].basicInfo.name || 'Site').replace(/\s+/g, '-')
    : `${reportSites.length}-Sites`;
  const projectSuffix = projectName ? `-${projectName.replace(/\s+/g, '-')}` : '';
  const filename = `N4S-Site-Assessment${projectSuffix}-${siteSuffix}-${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(filename);
  return filename;
};

export default generateKYSReport;
