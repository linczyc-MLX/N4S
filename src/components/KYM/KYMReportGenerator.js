/**
 * KYMReportGenerator.js
 *
 * Generates Market Intelligence PDF reports following N4S brand standards.
 * Uses jspdf for PDF generation with consistent styling.
 *
 * Updated for BAM v3.0 Dual Scoring System
 * - Client Satisfaction Score (does design serve client needs?)
 * - Market Appeal Score (will design appeal to buyers?)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// =============================================================================
// N4S BRAND CONSTANTS
// =============================================================================

const COLORS = {
  navy: [30, 58, 95],        // #1e3a5f
  gold: [201, 162, 39],      // #c9a227
  text: [26, 26, 26],        // #1a1a1a
  textMuted: [107, 107, 107], // #6b6b6b
  background: [250, 250, 248], // #fafaf8
  border: [229, 229, 224],   // #e5e5e0
  accentLight: [245, 240, 232], // #f5f0e8
  success: [46, 125, 50],    // #2e7d32 - PASS
  warning: [245, 124, 0],    // #f57c00 - CAUTION
  error: [211, 47, 47],      // #d32f2f - FAIL
  white: [255, 255, 255],
};

const FONTS = {
  // Using Helvetica as fallback (built into jsPDF)
  // For production, would register Inter and Playfair Display
  heading: 'helvetica',
  body: 'helvetica',
};

// =============================================================================
// PORTFOLIO CONTEXT WEIGHTS
// =============================================================================

const PORTFOLIO_WEIGHTS = {
  'forever-home': { client: 0.70, market: 0.30, label: 'Forever Home (15+ years)' },
  'primary-residence': { client: 0.60, market: 0.40, label: 'Primary Residence (10-15 years)' },
  'medium-term': { client: 0.50, market: 0.50, label: 'Medium-Term (5-10 years)' },
  'investment': { client: 0.30, market: 0.70, label: 'Investment Property (<5 years)' },
  'spec-build': { client: 0.10, market: 0.90, label: 'Spec Development (Build to Sell)' },
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

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value}%`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// =============================================================================
// BAM v3.0 HELPER FUNCTIONS
// =============================================================================

/**
 * Returns RGB color array based on status
 * @param {string} status - 'PASS', 'CAUTION', or 'FAIL'
 * @returns {number[]} RGB array
 */
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PASS':
      return COLORS.success;
    case 'CAUTION':
      return COLORS.warning;
    case 'FAIL':
      return COLORS.error;
    default:
      return COLORS.textMuted;
  }
};

/**
 * Returns the status based on score percentage
 * @param {number} score - Score percentage (0-100)
 * @returns {string} Status string
 */
const getScoreStatus = (score) => {
  if (score >= 80) return 'PASS';
  if (score >= 65) return 'CAUTION';
  return 'FAIL';
};

/**
 * Returns formatted label with weights for portfolio context
 * @param {string} context - Portfolio context key
 * @returns {object} Object with label, clientWeight, marketWeight
 */
const getPortfolioContextLabel = (context) => {
  const config = PORTFOLIO_WEIGHTS[context] || PORTFOLIO_WEIGHTS['primary-residence'];
  return {
    label: config.label,
    clientWeight: Math.round(config.client * 100),
    marketWeight: Math.round(config.market * 100),
  };
};

/**
 * Draws a horizontal score bar with label
 * @param {jsPDF} doc - PDF document instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Bar width
 * @param {string} label - Label text
 * @param {number} score - Current score
 * @param {number} max - Maximum score
 * @returns {number} Height consumed by this element
 */
const drawScoreBar = (doc, x, y, width, label, score, max) => {
  const barHeight = 6;
  const labelHeight = 10;
  const fillPercent = Math.min(score / max, 1);

  // Draw label
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(label, x, y);

  // Draw score text right-aligned
  doc.setFont(FONTS.body, 'bold');
  doc.text(`${score}/${max}`, x + width, y, { align: 'right' });

  // Draw track background
  doc.setFillColor(...COLORS.border);
  doc.roundedRect(x, y + 3, width, barHeight, 2, 2, 'F');

  // Draw filled portion
  const fillWidth = width * fillPercent;
  if (fillWidth > 0) {
    // Color based on percentage
    const percent = (score / max) * 100;
    const color = percent >= 80 ? COLORS.success : percent >= 65 ? COLORS.warning : COLORS.error;
    doc.setFillColor(...color);
    doc.roundedRect(x, y + 3, fillWidth, barHeight, 2, 2, 'F');
  }

  return labelHeight + barHeight;
};

/**
 * Draws a circular gauge for score display
 * @param {jsPDF} doc - PDF document
 * @param {number} x - Center X
 * @param {number} y - Center Y
 * @param {number} radius - Circle radius
 * @param {number} score - Score percentage
 * @param {string} label - Label below gauge
 */
const drawScoreGauge = (doc, x, y, radius, score, label) => {
  const status = getScoreStatus(score);
  const color = getStatusColor(status);

  // Draw outer circle (track)
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(3);
  doc.circle(x, y, radius, 'S');

  // Draw filled arc (simplified as colored circle for PDF)
  doc.setDrawColor(...color);
  doc.setLineWidth(3);
  // Draw partial arc based on score (approximated)
  const endAngle = (score / 100) * 360 - 90;
  // For simplicity, draw full colored border if high score
  if (score > 0) {
    doc.setFillColor(...COLORS.white);
    doc.circle(x, y, radius - 2, 'F');
  }

  // Draw score text in center
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...color);
  doc.text(`${score}%`, x, y + 2, { align: 'center' });

  // Draw status below
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(8);
  doc.text(status, x, y + radius + 5, { align: 'center' });

  // Draw label
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(label, x, y + radius + 12, { align: 'center' });
};

/**
 * Gets the match status symbol
 * @param {string} status - 'full', 'partial', 'none', 'penalty'
 * @returns {string} Symbol character
 */
const getMatchSymbol = (status) => {
  switch (status?.toLowerCase()) {
    case 'full':
      return '✓';
    case 'partial':
      return '◐';
    case 'none':
      return '✗';
    case 'penalty':
      return '!';
    default:
      return '-';
  }
};

// =============================================================================
// PDF GENERATION
// =============================================================================

/**
 * Generate KYM Market Intelligence Report
 *
 * BAM v3.0 Dual Scoring System:
 * - Client Satisfaction: Does this design serve the client's needs?
 * - Market Appeal: Will this design appeal to buyers when it's time to sell?
 *
 * @param {object} data - Report data
 * @param {object} data.kycData - Client profile and preferences
 * @param {object} data.locationData - Location information
 * @param {object} data.marketData - Market statistics
 * @param {array} data.properties - Comparable properties
 * @param {object} data.demographics - Demographic data
 * @param {array} data.personaResults - Legacy persona results (deprecated)
 * @param {object} data.fyiData - Space programming data
 * @param {object} data.mvpData - Adjacency and layout data
 * @param {object} data.bamResults - BAM v3.0 dual scoring results
 * @param {string} data.portfolioContext - Portfolio context for weighting
 */
export const generateKYMReport = async (data) => {
  const {
    kycData,
    locationData,
    marketData,
    properties,
    demographics,
    personaResults,
    fyiData,
    mvpData,
    bamResults,
    portfolioContext = 'primary-residence',
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

  // Get client info from KYC
  // KYC structure: kycData.principal.portfolioContext contains client names
  const principalFirstName = kycData?.principal?.portfolioContext?.principalFirstName || '';
  const principalLastName = kycData?.principal?.portfolioContext?.principalLastName || '';
  const secondaryFirstName = kycData?.principal?.portfolioContext?.secondaryFirstName || '';
  const secondaryLastName = kycData?.principal?.portfolioContext?.secondaryLastName || '';
  
  // Format client name - use portfolioContext names
  let clientName = 'Client';
  if (principalFirstName && principalLastName) {
    // Check if there's a secondary/partner
    if (secondaryFirstName && secondaryLastName === principalLastName) {
      // Same last name - "John & Jane Smith"
      clientName = `${principalFirstName} & ${secondaryFirstName} ${principalLastName}`;
    } else if (secondaryFirstName && secondaryLastName) {
      // Different last names - "John Smith & Jane Doe"
      clientName = `${principalFirstName} ${principalLastName} & ${secondaryFirstName} ${secondaryLastName}`;
    } else {
      // Single principal - "John Smith"
      clientName = `${principalFirstName} ${principalLastName}`;
    }
  } else if (principalFirstName) {
    clientName = principalFirstName;
  }
  
  // Project parameters - kycData.principal.projectParameters
  const projectName = kycData?.principal?.projectParameters?.projectName || 'Luxury Residence';
  const projectCity = kycData?.principal?.projectParameters?.projectCity || locationData?.location?.city || '';
  const projectState = kycData?.principal?.projectParameters?.projectState || locationData?.location?.state || '';

  // Page tracking
  let pageNumber = 1;
  let totalPages = 0; // Will be calculated at end

  // ==========================================================================
  // HEADER & FOOTER FUNCTIONS
  // ==========================================================================

  const addHeader = () => {
    // Navy header bar
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, pageWidth, 8, 'F');
  };

  const addFooter = (pageNum) => {
    const footerY = pageHeight - 10;
    
    // Footer line
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    // Footer text
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('© 2026 N4S Luxury Residential Advisory', margin, footerY + 5);
    doc.text(`Page ${pageNum}`, pageWidth - margin, footerY + 5, { align: 'right' });
  };

  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    return 25; // Reset Y position after header
  };

  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 25) {
      currentY = addNewPage();
    }
    return currentY;
  };

  // ==========================================================================
  // COVER PAGE
  // ==========================================================================

  addHeader();
  
  // Title area
  currentY = 50;
  
  // N4S Logo text
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
  doc.text('Market Intelligence Report', pageWidth - margin, currentY, { align: 'right' });
  
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(formatDate(new Date()), pageWidth - margin, currentY + 7, { align: 'right' });

  // Main title
  currentY = 100;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.navy);
  doc.text('Market Intelligence', margin, currentY);
  doc.text('Report', margin, currentY + 12);

  // Location subtitle
  currentY += 30;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  const locationTitle = `${projectCity}, ${projectState}`;
  doc.text(locationTitle, margin, currentY);
  
  if (locationData?.location?.zipCode) {
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`ZIP Code: ${locationData.location.zipCode}`, margin, currentY + 8);
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

  // Data source note
  currentY = 220;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  const dataSourceNote = properties && properties.length > 0
    ? 'Data sourced from live Realtor.com API'
    : 'Market estimates based on regional data';
  doc.text(dataSourceNote, margin, currentY);

  addFooter(pageNumber);

  // ==========================================================================
  // EXECUTIVE SUMMARY
  // ==========================================================================

  currentY = addNewPage();

  // Section title
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.navy);
  doc.text('Executive Summary', margin, currentY);
  currentY += 15;

  // Market Overview
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Market Overview', margin, currentY);
  currentY += 7;

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  
  const marketOverview = `The ${projectCity} luxury real estate market presents ${
    properties?.length > 10 ? 'significant' : properties?.length > 5 ? 'moderate' : 'limited'
  } inventory at the ultra-luxury level. ${
    marketData?.medianPrice 
      ? `The median listing price of ${formatCurrency(marketData.medianPrice)} reflects the area's positioning as a premier luxury market.`
      : 'Market analysis is based on regional data and comparable market trends.'
  }`;
  
  const splitOverview = doc.splitTextToSize(marketOverview, contentWidth);
  doc.text(splitOverview, margin, currentY);
  currentY += splitOverview.length * 5 + 10;

  // Key Metrics Table
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Key Market Metrics', margin, currentY);
  currentY += 5;

  const metricsData = [
    ['Total Active Listings', formatNumber(properties?.filter(p => p.status === 'active').length || 0)],
    ['Median Listing Price', formatCurrency(marketData?.medianPrice || 0)],
    ['Avg Price per SF', formatCurrency(marketData?.avgPricePerSqFt || 0)],
    ['Avg Days on Market', `${marketData?.avgDaysOnMarket || 'N/A'} days`],
    ['Inventory Range', `${formatCurrency(marketData?.minPrice || 0)} – ${formatCurrency(marketData?.maxPrice || 0)}`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: metricsData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: COLORS.text,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 70 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // ==========================================================================
  // BAM SUMMARY BOX (BAM v3.0)
  // ==========================================================================

  if (bamResults) {
    const clientScore = bamResults.clientSatisfaction?.percentage || 0;
    const marketScore = bamResults.marketAppeal?.percentage || 0;
    const combinedScore = bamResults.combined?.score || 0;

    const clientStatus = getScoreStatus(clientScore);
    const marketStatus = getScoreStatus(marketScore);
    const combinedStatus = getScoreStatus(combinedScore);

    const portfolioInfo = getPortfolioContextLabel(portfolioContext);

    // BAM Summary Box background
    doc.setFillColor(...COLORS.accentLight);
    doc.roundedRect(margin, currentY, contentWidth, 55, 3, 3, 'F');

    // Title
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.navy);
    doc.text('BAM Alignment Summary', margin + 5, currentY + 8);

    // Three score columns
    const colWidth = (contentWidth - 20) / 3;
    const scoreY = currentY + 20;

    // Client Satisfaction Score
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Client Satisfaction', margin + 5 + colWidth / 2, scoreY, { align: 'center' });

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...getStatusColor(clientStatus));
    doc.text(`${clientScore}%`, margin + 5 + colWidth / 2, scoreY + 10, { align: 'center' });

    doc.setFontSize(8);
    doc.text(clientStatus, margin + 5 + colWidth / 2, scoreY + 17, { align: 'center' });

    // Market Appeal Score
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Market Appeal', margin + 5 + colWidth * 1.5, scoreY, { align: 'center' });

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...getStatusColor(marketStatus));
    doc.text(`${marketScore}%`, margin + 5 + colWidth * 1.5, scoreY + 10, { align: 'center' });

    doc.setFontSize(8);
    doc.text(marketStatus, margin + 5 + colWidth * 1.5, scoreY + 17, { align: 'center' });

    // Combined Score
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Combined Score', margin + 5 + colWidth * 2.5, scoreY, { align: 'center' });

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...getStatusColor(combinedStatus));
    doc.text(`${combinedScore}%`, margin + 5 + colWidth * 2.5, scoreY + 10, { align: 'center' });

    doc.setFontSize(8);
    doc.text(combinedStatus, margin + 5 + colWidth * 2.5, scoreY + 17, { align: 'center' });

    // Portfolio Context line
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      `Portfolio: ${portfolioInfo.label} • Weighting: ${portfolioInfo.clientWeight}% Client / ${portfolioInfo.marketWeight}% Market`,
      margin + 5,
      currentY + 50
    );

    currentY += 65;
  }

  // Top Buyer Archetypes (BAM v3.0) or Legacy Personas
  if (bamResults?.marketAppeal?.archetypes?.length > 0) {
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text('Top Buyer Archetypes', margin, currentY);
    currentY += 5;

    const topArchetypes = bamResults.marketAppeal.archetypes.slice(0, 3).map((a, i) => [
      `${i + 1}. ${a.name}`,
      `${a.score?.percentage || a.score || 0}%`,
      `${Math.round(a.share * 100)}% share`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Archetype', 'Match', 'Market Share']],
      body: topArchetypes,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;
  } else if (personaResults && personaResults.length > 0) {
    // Legacy persona support
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text('Top Buyer Personas', margin, currentY);
    currentY += 5;

    const topPersonas = personaResults.slice(0, 3).map((p, i) => [
      `${i + 1}. ${p.name}`,
      `${p.scoring.score}%`,
      p.scoring.matchLevel,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Persona', 'Match', 'Level']],
      body: topPersonas,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // ==========================================================================
  // MARKET ANALYSIS
  // ==========================================================================

  currentY = checkPageBreak(80);
  
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.navy);
  doc.text('Market Analysis', margin, currentY);
  currentY += 15;

  // Pricing Overview
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Pricing Overview', margin, currentY);
  currentY += 7;

  if (marketData) {
    const pricingData = [
      ['Median Listing Price', formatCurrency(marketData.medianPrice)],
      ['Average Listing Price', formatCurrency(marketData.avgPrice)],
      ['Price Range', `${formatCurrency(marketData.minPrice)} – ${formatCurrency(marketData.maxPrice)}`],
      ['Average Price/SF', formatCurrency(marketData.avgPricePerSqFt)],
    ];

    autoTable(doc, {
      startY: currentY,
      body: pricingData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 70 },
      },
      margin: { left: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Inventory Analysis
  currentY = checkPageBreak(60);
  
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Inventory Analysis', margin, currentY);
  currentY += 7;

  const activeCount = properties?.filter(p => p.status === 'active').length || 0;
  const pendingCount = properties?.filter(p => p.status === 'pending').length || 0;
  const soldCount = properties?.filter(p => p.status === 'sold').length || 0;

  const inventoryData = [
    ['Active Listings', formatNumber(activeCount)],
    ['Pending Sales', pendingCount > 0 ? formatNumber(pendingCount) : 'N/A'],
    ['Recently Sold', formatNumber(soldCount)],
    ['Total Properties Analyzed', formatNumber(properties?.length || 0)],
    ['Avg Days on Market', `${marketData?.avgDaysOnMarket || 'N/A'} days`],
  ];

  autoTable(doc, {
    startY: currentY,
    body: inventoryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 70 },
    },
    margin: { left: margin },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // ==========================================================================
  // COMPARABLE PROPERTIES
  // ==========================================================================

  if (properties && properties.length > 0) {
    currentY = addNewPage();

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.navy);
    doc.text('Comparable Properties', margin, currentY);
    currentY += 10;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${properties.length} properties analyzed in the target market area`, margin, currentY);
    currentY += 10;

    // Property table
    const propertyTableData = properties.slice(0, 15).map(p => [
      p.address?.substring(0, 30) || 'N/A',
      formatCurrency(p.askingPrice),
      formatNumber(p.sqft) + ' SF',
      formatCurrency(p.pricePerSqFt) + '/SF',
      `${p.beds}/${p.baths}`,
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Address', 'Price', 'Size', 'Price/SF', 'Bed/Bath', 'Status']],
      body: propertyTableData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { halign: 'right', cellWidth: 28 },
        2: { halign: 'right', cellWidth: 22 },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 20 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Feature Analysis
    currentY = checkPageBreak(60);
    
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text('Feature Analysis', margin, currentY);
    currentY += 7;

    // Count features across properties
    const featureCounts = {};
    properties.forEach(p => {
      (p.features || []).forEach(f => {
        featureCounts[f] = (featureCounts[f] || 0) + 1;
      });
    });

    const featureData = Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([feature, count]) => [
        feature,
        formatNumber(count),
        `${Math.round((count / properties.length) * 100)}%`,
      ]);

    if (featureData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Feature', 'Count', '% of Listings']],
        body: featureData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.navy,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 30 },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.6,
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }
  }

  // ==========================================================================
  // BUYER ALIGNMENT ANALYSIS (BAM v3.0 - Dual Scoring System)
  // ==========================================================================

  if (bamResults || (personaResults && personaResults.length > 0)) {
    currentY = addNewPage();

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.navy);
    doc.text('Buyer Alignment Analysis', margin, currentY);
    currentY += 10;

    // Methodology note
    doc.setFont(FONTS.body, 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    const methodNote = bamResults
      ? 'BAM v3.0 Dual Scoring: Client Satisfaction measures how well this design serves YOUR needs. Market Appeal measures how well it will appeal to BUYERS when you sell.'
      : 'Analysis based on design decisions captured in KYC, FYI, and MVP modules. Scores reflect alignment between the planned property program and typical buyer persona preferences.';
    const splitMethod = doc.splitTextToSize(methodNote, contentWidth);
    doc.text(splitMethod, margin, currentY);
    currentY += splitMethod.length * 4 + 10;

    // ==========================================================================
    // BAM v3.0 DUAL SCORE DISPLAY
    // ==========================================================================

    if (bamResults) {
      const clientScore = bamResults.clientSatisfaction?.percentage || 0;
      const marketScore = bamResults.marketAppeal?.percentage || 0;
      const combinedScore = bamResults.combined?.score || 0;

      // Dual Score Bars
      const barWidth = (contentWidth - 20) / 2;

      // Client Satisfaction Score Bar
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.text);
      doc.text('Client Satisfaction', margin, currentY);

      const clientStatus = getScoreStatus(clientScore);
      doc.setTextColor(...getStatusColor(clientStatus));
      doc.text(`${clientScore}% - ${clientStatus}`, margin + barWidth - 5, currentY, { align: 'right' });
      currentY += 5;

      // Draw client score bar
      doc.setFillColor(...COLORS.border);
      doc.roundedRect(margin, currentY, barWidth - 10, 8, 2, 2, 'F');
      if (clientScore > 0) {
        doc.setFillColor(...getStatusColor(clientStatus));
        doc.roundedRect(margin, currentY, (barWidth - 10) * (clientScore / 100), 8, 2, 2, 'F');
      }
      currentY += 12;

      // Market Appeal Score Bar
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.text);
      doc.text('Market Appeal', margin, currentY);

      const marketStatus = getScoreStatus(marketScore);
      doc.setTextColor(...getStatusColor(marketStatus));
      doc.text(`${marketScore}% - ${marketStatus}`, margin + barWidth - 5, currentY, { align: 'right' });
      currentY += 5;

      // Draw market score bar
      doc.setFillColor(...COLORS.border);
      doc.roundedRect(margin, currentY, barWidth - 10, 8, 2, 2, 'F');
      if (marketScore > 0) {
        doc.setFillColor(...getStatusColor(marketStatus));
        doc.roundedRect(margin, currentY, (barWidth - 10) * (marketScore / 100), 8, 2, 2, 'F');
      }
      currentY += 15;

      // ==========================================================================
      // CLIENT SATISFACTION BREAKDOWN (5 Categories)
      // ==========================================================================

      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.navy);
      doc.text('Client Satisfaction Breakdown', margin, currentY);
      currentY += 8;

      const clientBreakdown = bamResults.clientSatisfaction?.breakdown || {};
      const categoryWidth = contentWidth - 20;

      // Spatial Requirements (XX/25)
      const spatialScore = clientBreakdown.spatial || 0;
      currentY += drawScoreBar(doc, margin, currentY, categoryWidth, 'Spatial Requirements', spatialScore, 25);
      currentY += 3;

      // Lifestyle Alignment (XX/25)
      const lifestyleScore = clientBreakdown.lifestyle || 0;
      currentY += drawScoreBar(doc, margin, currentY, categoryWidth, 'Lifestyle Alignment', lifestyleScore, 25);
      currentY += 3;

      // Design Aesthetic (XX/20)
      const designScore = clientBreakdown.design || 0;
      currentY += drawScoreBar(doc, margin, currentY, categoryWidth, 'Design Aesthetic', designScore, 20);
      currentY += 3;

      // Location Context (XX/15)
      const locationScore = clientBreakdown.location || 0;
      currentY += drawScoreBar(doc, margin, currentY, categoryWidth, 'Location Context', locationScore, 15);
      currentY += 3;

      // Future-Proofing (XX/15)
      const futureScore = clientBreakdown.futureProofing || 0;
      currentY += drawScoreBar(doc, margin, currentY, categoryWidth, 'Future-Proofing', futureScore, 15);
      currentY += 15;

      // ==========================================================================
      // MARKET APPEAL - TOP 3 ARCHETYPES
      // ==========================================================================

      currentY = checkPageBreak(120);

      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.navy);
      doc.text('Market Appeal - Buyer Archetype Analysis', margin, currentY);
      currentY += 10;

      const archetypes = bamResults.marketAppeal?.archetypes || [];
      const topArchetypes = archetypes.slice(0, 3);

      for (let i = 0; i < topArchetypes.length; i++) {
        const archetype = topArchetypes[i];

        currentY = checkPageBreak(80);

        // Archetype header
        doc.setFillColor(...COLORS.accentLight);
        doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');

        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.navy);
        doc.text(`${i + 1}. ${archetype.name}`, margin + 5, currentY + 9);

        // Score and market share
        const archetypeScore = archetype.score?.percentage || archetype.score || 0;
        const archetypeStatus = getScoreStatus(archetypeScore);
        doc.setTextColor(...getStatusColor(archetypeStatus));
        doc.text(
          `${archetypeScore}% Match | ${Math.round((archetype.share || 0) * 100)}% Market Share`,
          pageWidth - margin - 5,
          currentY + 9,
          { align: 'right' }
        );

        currentY += 20;

        // Must Have / Nice to Have / Avoid Tables
        // Data comes from score.breakdown, not the raw persona definitions
        const breakdown = archetype.score?.breakdown || {};
        const mustHaveItems = breakdown.mustHaves?.items || [];
        const niceToHaveItems = breakdown.niceToHaves?.items || [];
        const avoidItems = breakdown.avoids?.items || [];

        if (mustHaveItems.length > 0 || niceToHaveItems.length > 0 || avoidItems.length > 0) {

          // Must Haves Table
          if (mustHaveItems.length > 0) {
            doc.setFont(FONTS.body, 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.text);
            doc.text('MUST HAVES (50 points)', margin, currentY);
            currentY += 4;

            const mustHaveData = mustHaveItems.slice(0, 5).map(item => [
              getMatchSymbol(item.match),
              item.label || item.requirement || item.name || '-',
              item.match === 'full' ? `+${item.pointsEarned || item.points || 10}` : item.match === 'partial' ? `+${item.pointsEarned || Math.round((item.points || 10) / 2)}` : '0',
            ]);

            autoTable(doc, {
              startY: currentY,
              head: [],
              body: mustHaveData,
              theme: 'plain',
              styles: { fontSize: 8, cellPadding: 2 },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 90 },
                2: { cellWidth: 20, halign: 'right' },
              },
              margin: { left: margin },
              tableWidth: contentWidth * 0.7,
            });

            currentY = doc.lastAutoTable.finalY + 5;
          }

          // Nice to Haves Table
          if (niceToHaveItems.length > 0) {
            doc.setFont(FONTS.body, 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.text);
            doc.text('NICE TO HAVES (35 points)', margin, currentY);
            currentY += 4;

            const niceToHaveData = niceToHaveItems.slice(0, 5).map(item => [
              getMatchSymbol(item.match),
              item.label || item.feature || item.name || '-',
              item.match === 'full' ? `+${item.pointsEarned || item.points || 7}` : item.match === 'partial' ? `+${item.pointsEarned || Math.round((item.points || 7) / 2)}` : '0',
            ]);

            autoTable(doc, {
              startY: currentY,
              head: [],
              body: niceToHaveData,
              theme: 'plain',
              styles: { fontSize: 8, cellPadding: 2 },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 90 },
                2: { cellWidth: 20, halign: 'right' },
              },
              margin: { left: margin },
              tableWidth: contentWidth * 0.7,
            });

            currentY = doc.lastAutoTable.finalY + 5;
          }

          // Avoids Table (Penalties)
          if (avoidItems.length > 0) {
            const triggeredAvoids = avoidItems.filter(a => a.triggered);
            if (triggeredAvoids.length > 0) {
              doc.setFont(FONTS.body, 'bold');
              doc.setFontSize(9);
              doc.setTextColor(...COLORS.error);
              doc.text('PENALTIES', margin, currentY);
              currentY += 4;

              const avoidData = triggeredAvoids.slice(0, 3).map(item => [
                '!',
                item.antiPattern || item.name,
                `${item.penalty || -10}`,
              ]);

              autoTable(doc, {
                startY: currentY,
                head: [],
                body: avoidData,
                theme: 'plain',
                styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.error },
                columnStyles: {
                  0: { cellWidth: 10, halign: 'center' },
                  1: { cellWidth: 90 },
                  2: { cellWidth: 20, halign: 'right' },
                },
                margin: { left: margin },
                tableWidth: contentWidth * 0.7,
              });

              currentY = doc.lastAutoTable.finalY + 5;
            }
          }
        }

        // Path to 80% Recommendations (if below threshold)
        if (archetypeScore < 80 && archetype.recommendations?.length > 0) {
          doc.setFont(FONTS.body, 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...COLORS.gold);
          doc.text(`PATH TO 80% (+${80 - archetypeScore} points needed)`, margin, currentY);
          currentY += 4;

          doc.setFont(FONTS.body, 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.text);

          archetype.recommendations.slice(0, 3).forEach((rec, idx) => {
            const recText = `${idx + 1}. ${rec.action || rec} (+${rec.impact || '?'} pts)`;
            doc.text(recText, margin + 3, currentY);
            currentY += 4;
          });
          currentY += 5;
        }

        currentY += 8;
      }

    } else if (personaResults && personaResults.length > 0) {
      // ==========================================================================
      // LEGACY PERSONA SUPPORT (for backward compatibility)
      // ==========================================================================

      const topThree = personaResults.slice(0, 3);

      for (let i = 0; i < topThree.length; i++) {
        const persona = topThree[i];

        currentY = checkPageBreak(70);

        // Persona header
        doc.setFillColor(...COLORS.accentLight);
        doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');

        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.navy);
        doc.text(`${i + 1}. ${persona.name}`, margin + 5, currentY + 8);

        // Score badge
        const scoreColor = persona.scoring.matchLevel === 'Strong' ? COLORS.success
          : persona.scoring.matchLevel === 'Moderate' ? COLORS.warning
          : COLORS.textMuted;
        doc.setTextColor(...scoreColor);
        doc.text(`${persona.scoring.score}% - ${persona.scoring.matchLevel} Match`, pageWidth - margin - 5, currentY + 8, { align: 'right' });

        currentY += 18;

        // Description
        doc.setFont(FONTS.body, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        const descSplit = doc.splitTextToSize(persona.fullDesc || persona.shortDesc, contentWidth);
        doc.text(descSplit, margin, currentY);
        currentY += descSplit.length * 4 + 5;

        // Demographics
        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.textMuted);
        doc.text('TYPICAL DEMOGRAPHICS', margin, currentY);
        currentY += 4;

        doc.setFont(FONTS.body, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        doc.text(`Age: ${persona.demographics?.ageRange || 'N/A'}  |  Net Worth: ${persona.demographics?.netWorth || 'N/A'}`, margin, currentY);
        currentY += 10;
      }
    }
  }

  // ==========================================================================
  // FEATURE CLASSIFICATION (BAM v3.0)
  // ==========================================================================

  if (bamResults?.featureClassification) {
    currentY = checkPageBreak(120);

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.navy);
    doc.text('Feature Classification', margin, currentY);
    currentY += 8;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Features classified by client value vs. market value', margin, currentY);
    currentY += 10;

    const fc = bamResults.featureClassification;

    // Essential Features (High Client + High Market)
    if (fc.essential?.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.success);
      doc.text('ESSENTIAL (High Client + High Market)', margin, currentY);
      currentY += 5;

      const essentialData = fc.essential.slice(0, 6).map(f => [
        '✓',
        f.name || f,
        f.included ? 'Included' : 'Missing',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [],
        body: essentialData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', textColor: COLORS.success },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.7,
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }

    // Differentiating Features (Medium Client + High Market)
    if (fc.differentiating?.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.navy);
      doc.text('DIFFERENTIATING (Premium Value-Add)', margin, currentY);
      currentY += 5;

      const diffData = fc.differentiating.slice(0, 5).map(f => [
        '◆',
        f.name || f,
        f.included ? 'Included' : 'Opportunity',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [],
        body: diffData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', textColor: COLORS.navy },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.7,
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }

    // Personal Features (High Client + Low Market)
    if (fc.personal?.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.warning);
      doc.text('PERSONAL (Client Value, Limited Market)', margin, currentY);
      currentY += 5;

      const personalData = fc.personal.slice(0, 4).map(f => [
        '▲',
        f.name || f,
        'Aware',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [],
        body: personalData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', textColor: COLORS.warning },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.7,
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }

    // Risky Features (Low Both)
    if (fc.risky?.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.error);
      doc.text('RISKY (Reconsider — May Hurt Resale)', margin, currentY);
      currentY += 5;

      const riskyData = fc.risky.slice(0, 3).map(f => [
        '⚠',
        f.name || f,
        'Review',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [],
        body: riskyData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', textColor: COLORS.error },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.7,
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }
  }

  // ==========================================================================
  // DESIGN ALIGNMENT INSIGHTS
  // ==========================================================================

  if (fyiData || mvpData) {
    currentY = checkPageBreak(100);
    
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);
    doc.text('Design Alignment Insights', margin, currentY);
    currentY += 6;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('How your design decisions align with buyer expectations in this market.', margin, currentY);
    currentY += 10;

    // Space Program from MVP/FYI
    if (mvpData?.totalSquareFootage || fyiData?.selectedSpaces) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('Space Program Summary', margin, currentY);
      currentY += 7;

      const programData = [];
      
      if (mvpData?.totalSquareFootage) {
        programData.push(['Total Square Footage', formatNumber(mvpData.totalSquareFootage) + ' SF']);
      }
      if (mvpData?.selectedTier) {
        programData.push(['Size Tier', mvpData.selectedTier.name || 'Custom']);
      }
      if (fyiData?.selectedSpaces?.length) {
        programData.push(['Selected Spaces', `${fyiData.selectedSpaces.length} spaces defined`]);
      }

      // Compare to market
      if (marketData?.avgSqFt && mvpData?.totalSquareFootage) {
        const sizeDiff = mvpData.totalSquareFootage - marketData.avgSqFt;
        const sizeComparison = sizeDiff > 2000 ? 'Larger than market average' 
          : sizeDiff < -2000 ? 'Smaller than market average'
          : 'In line with market average';
        programData.push(['Market Comparison', sizeComparison]);
      }

      autoTable(doc, {
        startY: currentY,
        body: programData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 55 },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.6,
      });

      currentY = doc.lastAutoTable.finalY + 6;
    }

    // Key Spaces and Buyer Appeal
    if (fyiData?.selectedSpaces?.length > 0) {
      currentY = checkPageBreak(60);
      
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('Key Spaces & Buyer Appeal', margin, currentY);
      currentY += 5;

      // Map spaces to buyer appeal
      const spaceAppeal = {
        'Home Office': ['Tech Executive', 'Finance Executive', 'Medical/Biotech'],
        'Home Theater': ['Entertainment Industry', 'Sports Professional'],
        'Theater': ['Entertainment Industry', 'Sports Professional'],
        'Wine Cellar': ['Finance Executive', 'Entertainment Industry', 'Generational Wealth'],
        'Gym': ['Sports Professional', 'Medical/Biotech', 'Tech Executive'],
        'Spa': ['Sports Professional', 'Medical/Biotech'],
        'Pool': ['All Personas'],
        'Swimming Pool': ['All Personas'],
        'Guest House': ['Generational Wealth', 'International Investor'],
        'Guest Suite': ['Entertainment Industry', 'Generational Wealth'],
        'Staff Quarters': ['International Investor', 'Generational Wealth', 'Family Office'],
        'Car Gallery': ['Tech Executive', 'Sports Professional'],
        'Studio': ['Creative Entrepreneur'],
        'Den or Office': ['Finance Executive', 'Tech Executive', 'Family Office'],
      };

      const spaceData = fyiData.selectedSpaces.slice(0, 8).map(space => {
        const spaceName = typeof space === 'string' ? space : space.name;
        const appeal = spaceAppeal[spaceName] || ['Various'];
        return [spaceName, appeal.slice(0, 2).join(', ')];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Space', 'Primary Buyer Appeal']],
        body: spaceData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.navy,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 50 },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.7,
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }
  }

  // ==========================================================================
  // STRATEGIC RECOMMENDATIONS (BAM v3.0 Priority System)
  // ==========================================================================

  currentY = checkPageBreak(120);

  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text('Strategic Recommendations', margin, currentY);
  currentY += 8;

  // Market Positioning
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text('Market Positioning', margin, currentY);
  currentY += 5;

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);

  const positioningText = mvpData?.totalSquareFootage
    ? `Based on the planned ${formatNumber(mvpData.totalSquareFootage)} SF program, this property will compete in the ${
        mvpData.totalSquareFootage > 20000 ? 'ultra-luxury estate'
        : mvpData.totalSquareFootage > 15000 ? 'large luxury residence'
        : mvpData.totalSquareFootage > 10000 ? 'substantial luxury residence'
        : 'boutique luxury residence'
      } segment of the ${projectCity} market.`
    : `This property will compete in the luxury segment of the ${projectCity} market.`;

  const posSplit = doc.splitTextToSize(positioningText, contentWidth);
  doc.text(posSplit, margin, currentY);
  currentY += posSplit.length * 4 + 8;

  // ==========================================================================
  // PRIORITY-BASED RECOMMENDATIONS (BAM v3.0)
  // ==========================================================================

  if (bamResults?.gapAnalysis || bamResults?.tradeOffAnalysis) {
    // Priority 1: Quick Wins
    const quickWins = bamResults.gapAnalysis?.quickWins || [];
    if (quickWins.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.success);
      doc.text('PRIORITY 1: Quick Wins', margin, currentY);
      currentY += 4;

      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('High impact, low effort changes', margin, currentY);
      currentY += 5;

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);

      quickWins.slice(0, 4).forEach((item, idx) => {
        const itemText = `${idx + 1}. ${item.action || item} ${item.impact ? `(+${item.impact} pts)` : ''}`;
        doc.text(itemText, margin + 3, currentY);
        currentY += 4;
      });

      currentY += 6;
    }

    // Priority 2: Strategic Enhancements
    const strategicEnhancements = bamResults.gapAnalysis?.strategic || [];
    if (strategicEnhancements.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.navy);
      doc.text('PRIORITY 2: Strategic Enhancements', margin, currentY);
      currentY += 4;

      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('Significant improvements requiring investment', margin, currentY);
      currentY += 5;

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);

      strategicEnhancements.slice(0, 4).forEach((item, idx) => {
        const itemText = `${idx + 1}. ${item.action || item} ${item.impact ? `(+${item.impact} pts)` : ''}`;
        doc.text(itemText, margin + 3, currentY);
        currentY += 4;
      });

      currentY += 6;
    }

    // Priority 3: Risk Mitigation
    const riskMitigation = bamResults.gapAnalysis?.riskMitigation || [];
    if (riskMitigation.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.warning);
      doc.text('PRIORITY 3: Risk Mitigation', margin, currentY);
      currentY += 4;

      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('Address potential resale concerns', margin, currentY);
      currentY += 5;

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);

      riskMitigation.slice(0, 3).forEach((item, idx) => {
        const itemText = `${idx + 1}. ${item.action || item} ${item.impact ? `(removes ${item.impact} penalty)` : ''}`;
        doc.text(itemText, margin + 3, currentY);
        currentY += 4;
      });

      currentY += 6;
    }
  } else {
    // Legacy recommendations (fallback when BAM results not available)

    // Target Buyer Strategy
    if (bamResults?.marketAppeal?.archetypes?.length > 0 || personaResults?.length > 0) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('Target Buyer Strategy', margin, currentY);
      currentY += 5;

      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);

      let strategyText = '';
      if (bamResults?.marketAppeal?.archetypes?.length > 0) {
        const topArchetype = bamResults.marketAppeal.archetypes[0];
        const archetypeScore = topArchetype.score?.percentage || topArchetype.score || 0;
        strategyText = `Primary target: ${topArchetype.name} (${archetypeScore}% alignment, ${Math.round((topArchetype.share || 0) * 100)}% market share).`;
        if (bamResults.marketAppeal.archetypes[1]) {
          const secondArchetype = bamResults.marketAppeal.archetypes[1];
          const secondScore = secondArchetype.score?.percentage || secondArchetype.score || 0;
          strategyText += ` Secondary opportunity: ${secondArchetype.name} (${secondScore}% alignment).`;
        }
      } else if (personaResults?.length > 0) {
        const topPersona = personaResults[0];
        strategyText = `Primary target: ${topPersona.name} (${topPersona.scoring.score}% alignment).`;
        if (personaResults[1]) {
          strategyText += ` Secondary opportunity: ${personaResults[1].name} (${personaResults[1].scoring.score}% alignment).`;
        }
      }

      const stratSplit = doc.splitTextToSize(strategyText, contentWidth);
      doc.text(stratSplit, margin, currentY);
      currentY += stratSplit.length * 4 + 8;
    }

    // Generate contextual recommendations
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text('Key Recommendations', margin, currentY);
    currentY += 5;

    const recommendations = [];

    if (bamResults?.featureClassification?.risky?.length > 0) {
      const riskyFeature = bamResults.featureClassification.risky[0];
      recommendations.push(`Review "${riskyFeature.name || riskyFeature}" - may limit buyer pool`);
    }

    if (bamResults?.featureClassification?.essential) {
      const missingEssentials = bamResults.featureClassification.essential.filter(f => !f.included);
      if (missingEssentials.length > 0) {
        recommendations.push(`Add essential features: ${missingEssentials.slice(0, 2).map(f => f.name || f).join(', ')}`);
      }
    }

    if (personaResults?.[0]?.scoring?.negativeFactors?.length > 0) {
      const topConcern = personaResults[0].scoring.negativeFactors[0];
      recommendations.push(`Consider adjusting ${topConcern.factor.toLowerCase()} to improve buyer alignment`);
    }

    if (properties?.length > 0) {
      const featureCounts = {};
      properties.forEach(p => (p.features || []).forEach(f => featureCounts[f] = (featureCounts[f] || 0) + 1));
      const topFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0];
      if (topFeature) {
        recommendations.push(`${topFeature[0]} appears in ${Math.round(topFeature[1] / properties.length * 100)}% of comparable listings`);
      }
    }

    recommendations.push('Review buyer archetype alignment before finalizing architectural program');
    recommendations.push('Consider market velocity when determining project timeline and pricing');

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);

    recommendations.slice(0, 6).forEach((rec, i) => {
      doc.text(`${i + 1}. ${rec}`, margin + 3, currentY);
      currentY += 5;
    });
  }

  // Combined Score Projection (if changes implemented)
  if (bamResults?.gapAnalysis?.projectedScore) {
    currentY = checkPageBreak(40);

    doc.setFillColor(...COLORS.accentLight);
    doc.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'F');

    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);
    doc.text('Score Projection (If All Recommendations Implemented)', margin + 5, currentY + 8);

    const currentCombined = bamResults.combined?.score || 0;
    const projectedScore = bamResults.gapAnalysis.projectedScore;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(`Current Combined: ${currentCombined}% → Projected: ${projectedScore}% (+${projectedScore - currentCombined} pts)`, margin + 5, currentY + 18);

    currentY += 30;
  }

  // ==========================================================================
  // SAVE PDF
  // ==========================================================================

  // Generate filename
  const filename = `N4S-Market-Intelligence-${projectCity.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Save
  doc.save(filename);
  
  return filename;
};

export default generateKYMReport;
