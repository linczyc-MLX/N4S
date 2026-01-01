// ============================================
// N4S TASTE PROFILE REPORT GENERATOR
// PDF Generation using jsPDF
// Location: src/utils/TasteReportGenerator.js
// ============================================

import jsPDF from 'jspdf';

// ============================================
// CONSTANTS
// ============================================

// N4S Brand Colors
const NAVY = '#1e3a5f';
const GOLD = '#c9a227';
const LIGHT_GOLD = '#f5f0e1';
const DARK_TEXT = '#2d3748';
const LIGHT_TEXT = '#718096';
const FLAG_RED = '#c53030';
const LIGHT_BORDER = '#e2e8f0';
const SUCCESS_GREEN = '#38a169';

// Style Labels (AS1-AS9)
const AS_LABELS = {
  'AS1': 'Avant-Contemporary',
  'AS2': 'Architectural Modern',
  'AS3': 'Curated Minimalism',
  'AS4': 'Nordic Contemporary',
  'AS5': 'Mid-Century Refined',
  'AS6': 'Modern Classic',
  'AS7': 'Classical Contemporary',
  'AS8': 'Formal Classical',
  'AS9': 'Heritage Estate',
};

const AS_ORDER = ['AS1', 'AS2', 'AS3', 'AS4', 'AS5', 'AS6', 'AS7', 'AS8', 'AS9'];

// Category display info
const CATEGORY_INFO = {
  'exterior_architecture': { code: 'EA', name: 'Exterior Architecture' },
  'living_spaces': { code: 'LS', name: 'Living Spaces' },
  'dining_spaces': { code: 'DS', name: 'Dining Spaces' },
  'kitchens': { code: 'KT', name: 'Kitchens' },
  'family_areas': { code: 'FA', name: 'Family Areas' },
  'primary_bedrooms': { code: 'PB', name: 'Primary Bedrooms' },
  'primary_bathrooms': { code: 'PBT', name: 'Primary Bathrooms' },
  'guest_bedrooms': { code: 'GB', name: 'Guest Bedrooms' },
  'outdoor_living': { code: 'OL', name: 'Outdoor Living' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse clientId to extract base name and role
 */
export function parseClientId(clientId) {
  const match = clientId.match(/^(.+)-([PS])$/);
  if (match) {
    return {
      baseName: match[1],
      role: match[2],
      isCouple: true
    };
  }
  return {
    baseName: clientId,
    role: null,
    isCouple: false
  };
}

/**
 * Get the partner's clientId
 */
export function getPartnerClientId(clientId) {
  const parsed = parseClientId(clientId);
  if (!parsed.isCouple || !parsed.role) return null;
  const partnerRole = parsed.role === 'P' ? 'S' : 'P';
  return `${parsed.baseName}-${partnerRole}`;
}

/**
 * Check if this is a couple assessment
 */
export function isCoupleAssessment(clientId) {
  return parseClientId(clientId).isCouple;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Get style position on 1-9 scale
 */
function getStylePosition(styleCode) {
  const idx = AS_ORDER.indexOf(styleCode);
  return idx >= 0 ? idx + 1 : 5;
}

/**
 * Calculate divergence between two style codes
 */
function calculateDivergence(styleP, styleS) {
  return Math.abs(getStylePosition(styleP) - getStylePosition(styleS));
}

/**
 * Get dominant style from region preferences
 */
function getDominantStyleFromRegion(regionPreferences) {
  if (!regionPreferences || Object.keys(regionPreferences).length === 0) {
    return { code: 'AS6', label: 'Modern Classic' };
  }
  
  // Map region names to AS codes
  const regionToAS = {
    'Avant-Contemporary': 'AS1',
    'Architectural Modern': 'AS2',
    'Curated Minimalism': 'AS3',
    'Nordic Contemporary': 'AS4',
    'Mid-Century Refined': 'AS5',
    'Modern Classic': 'AS6',
    'Classical Contemporary': 'AS7',
    'Formal Classical': 'AS8',
    'Heritage Estate': 'AS9',
  };
  
  const sorted = Object.entries(regionPreferences).sort((a, b) => b[1] - a[1]);
  const topRegion = sorted[0][0];
  const code = regionToAS[topRegion] || 'AS6';
  
  return { code, label: topRegion };
}

/**
 * Calculate per-category metrics from session progress
 */
function getCategoryMetrics(progress, categoryId) {
  if (!progress || !progress[categoryId]) {
    return { ct: 2.5, ml: 2.5, mp: 2.5 };
  }
  
  const catProgress = progress[categoryId];
  if (!catProgress.selections || catProgress.selections.length === 0) {
    return { ct: 2.5, ml: 2.5, mp: 2.5 };
  }
  
  // For now, use the overall metrics scaled down
  // In a full implementation, this would calculate per-category from QUAD_MATRIX
  return { ct: 2.5, ml: 2.5, mp: 2.5 };
}

// ============================================
// PDF DRAWING HELPERS
// ============================================

/**
 * Draw a horizontal slider
 */
function drawSlider(doc, x, y, width, value, maxVal, leftLabel, rightLabel) {
  const trackHeight = 4;
  const fillWidth = (value / maxVal) * width;
  
  // Track background
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(x, y, width, trackHeight, 2, 2, 'F');
  
  // Filled portion (gold)
  doc.setFillColor(201, 162, 39);
  doc.roundedRect(x, y, fillWidth, trackHeight, 2, 2, 'F');
  
  // Indicator dot (navy)
  doc.setFillColor(30, 58, 95);
  doc.circle(x + fillWidth, y + trackHeight / 2, 4, 'F');
  
  // Labels
  doc.setFontSize(6);
  doc.setTextColor(113, 128, 150);
  doc.text(leftLabel, x, y + trackHeight + 8);
  doc.text(rightLabel, x + width, y + trackHeight + 8, { align: 'right' });
}

/**
 * Draw a comparison slider with P and S indicators
 */
function drawComparisonSlider(doc, x, y, width, valueP, valueS, maxVal, leftLabel, rightLabel) {
  const trackHeight = 4;
  const dotPosP = (valueP / maxVal) * width;
  const dotPosS = (valueS / maxVal) * width;
  
  // Track background
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(x, y, width, trackHeight, 2, 2, 'F');
  
  // Principal dot (gold)
  doc.setFillColor(201, 162, 39);
  doc.circle(x + dotPosP, y + trackHeight / 2, 5, 'F');
  doc.setFontSize(5);
  doc.setTextColor(30, 58, 95);
  doc.text('P', x + dotPosP - 1.5, y - 3);
  
  // Secondary dot (navy)
  doc.setFillColor(30, 58, 95);
  doc.circle(x + dotPosS, y + trackHeight / 2, 5, 'F');
  doc.text('S', x + dotPosS - 1.5, y + trackHeight + 10);
  
  // Labels
  doc.setFontSize(6);
  doc.setTextColor(113, 128, 150);
  doc.text(leftLabel, x, y + trackHeight / 2 + 1);
  doc.text(rightLabel, x + width + 5, y + trackHeight / 2 + 1);
}

// ============================================
// MAIN REPORT GENERATOR CLASS
// ============================================

export class TasteReportGenerator {
  constructor(dataP, dataS = null) {
    this.doc = new jsPDF('p', 'pt', 'letter');
    this.dataP = dataP;
    this.dataS = dataS;
    this.pageWidth = 612;
    this.pageHeight = 792;
    this.margin = 40;
    this.currentPage = 1;
    
    // Partner detection
    this.isCouple = isCoupleAssessment(dataP.clientId);
    this.partnerClientId = getPartnerClientId(dataP.clientId);
    this.partnerPending = this.isCouple && !dataS;
    
    // Calculate total pages
    if (this.isCouple && this.dataS) {
      this.totalPages = 4; // With partner alignment
    } else {
      this.totalPages = 3; // Without partner alignment (or partner pending)
    }
  }
  
  /**
   * Generate the complete report
   */
  async generate() {
    // Page 1: Profile overview + first 4 categories
    this.addPage1();
    
    // Page 2: Remaining 5 categories
    this.doc.addPage();
    this.currentPage = 2;
    this.addPage2();
    
    // Page 3: Partner Alignment (if we have partner data)
    if (this.isCouple && this.dataS) {
      this.doc.addPage();
      this.currentPage = 3;
      this.addPage3Alignment();
    }
    
    // Final Page: Selection gallery placeholder
    this.doc.addPage();
    this.currentPage = this.totalPages;
    this.addPageGallery();
    
    return this.doc;
  }
  
  /**
   * Add page footer
   */
  addPageFooter(isLastPage = false) {
    const footerY = this.pageHeight - 30;
    
    // Date (left)
    this.doc.setFontSize(7);
    this.doc.setTextColor(113, 128, 150);
    this.doc.text(formatDate(new Date()), this.margin, footerY);
    
    // Page number (right)
    this.doc.text(
      `Page ${this.currentPage} of ${this.totalPages}`,
      this.pageWidth - this.margin,
      footerY,
      { align: 'right' }
    );
    
    // Disclaimer and copyright (only on last page)
    if (isLastPage) {
      this.doc.setFontSize(7);
      this.doc.setTextColor(113, 128, 150);
      const disclaimer = 'This report was generated by the N4S Taste Exploration system. Use this profile as a starting point for discussions with your design team.';
      this.doc.text(disclaimer, this.pageWidth / 2, footerY - 20, { align: 'center', maxWidth: this.pageWidth - 80 });
      this.doc.text('© 2026 Not4Sale Luxury Residential Advisory', this.pageWidth / 2, footerY - 8, { align: 'center' });
    }
  }
  
  /**
   * Page 1: Header, style label, DNA axes, preferences, first 4 categories
   */
  addPage1() {
    let y = this.margin;
    
    // Header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('N4S', this.margin, y + 12);
    
    this.doc.setFontSize(20);
    this.doc.text('Your Design Profile', this.pageWidth / 2, y + 12, { align: 'center' });
    
    // Client info (stacked)
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(113, 128, 150);
    this.doc.text('Client:', this.pageWidth - this.margin, y + 5, { align: 'right' });
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text(this.dataP.clientId, this.pageWidth - this.margin, y + 18, { align: 'right' });
    
    y += 40;
    
    // Style label box
    const boxWidth = this.pageWidth - 2 * this.margin;
    const boxHeight = 50;
    this.doc.setFillColor(245, 240, 225);
    this.doc.roundedRect(this.margin, y, boxWidth, boxHeight, 4, 4, 'F');
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(201, 162, 39);
    this.doc.text(this.dataP.metrics.styleLabel || 'Transitional', this.pageWidth / 2, y + 25, { align: 'center' });
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(113, 128, 150);
    this.doc.text('Your overall design aesthetic', this.pageWidth / 2, y + 40, { align: 'center' });
    
    y += boxHeight + 20;
    
    // Design DNA section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Design DNA: Style Axes', this.margin, y);
    y += 20;
    
    const metrics = this.dataP.metrics;
    
    // Style Era slider
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(45, 55, 72);
    this.doc.text(`Style Era — ${(metrics.ctScale5 || 2.5).toFixed(1)}`, this.margin, y);
    drawSlider(this.doc, this.margin + 150, y - 5, 200, metrics.ctScale5 || 2.5, 5, 'Contemporary', 'Traditional');
    y += 25;
    
    // Material Complexity slider
    this.doc.text(`Material Complexity — ${(metrics.mlScale5 || 2.5).toFixed(1)}`, this.margin, y);
    drawSlider(this.doc, this.margin + 150, y - 5, 200, metrics.mlScale5 || 2.5, 5, 'Minimal', 'Layered');
    y += 25;
    
    // Mood Palette slider
    this.doc.text(`Mood Palette — ${(metrics.wcScale5 || 2.5).toFixed(1)}`, this.margin, y);
    drawSlider(this.doc, this.margin + 150, y - 5, 200, metrics.wcScale5 || 2.5, 5, 'Warm', 'Cool');
    y += 30;
    
    // Style Preferences
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Style Preferences', this.margin, y);
    y += 15;
    
    // Regional influences (left column)
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Regional Influences', this.margin, y);
    
    const regional = Object.entries(metrics.regionPreferences || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    this.doc.setFont('helvetica', 'normal');
    regional.forEach((r, i) => {
      this.doc.text(`• ${r[0]}`, this.margin, y + 12 + i * 10);
    });
    
    // Material preferences (right column)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Material Preferences', this.pageWidth / 2, y);
    
    const materials = Object.entries(metrics.materialPreferences || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    this.doc.setFont('helvetica', 'normal');
    materials.forEach((m, i) => {
      this.doc.text(`• ${m[0]}`, this.pageWidth / 2, y + 12 + i * 10);
    });
    
    y += 50;
    
    // Per-Category Design Profile (first 4)
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Per-Category Design Profile', this.margin, y);
    y += 25;
    
    const categories = Object.keys(CATEGORY_INFO);
    const firstFour = categories.slice(0, 4);
    
    this.drawCategoryCards(firstFour, y, 2);
    
    this.addPageFooter();
  }
  
  /**
   * Page 2: Remaining 5 categories
   */
  addPage2() {
    let y = this.margin;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Per-Category Design Profile', this.margin, y);
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(113, 128, 150);
    this.doc.text('(continued)', this.margin, y + 12);
    
    y += 35;
    
    const categories = Object.keys(CATEGORY_INFO);
    const remaining = categories.slice(4);
    
    this.drawCategoryCards(remaining, y, 2);
    
    // If partner is pending, add note at bottom
    if (this.isCouple && this.partnerPending && this.partnerClientId) {
      const noteY = this.pageHeight - 80;
      this.doc.setFillColor(245, 240, 225);
      this.doc.roundedRect(this.margin, noteY, this.pageWidth - 2 * this.margin, 40, 4, 4, 'F');
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(201, 162, 39);
      this.doc.text('Partner Alignment Analysis', this.margin + 10, noteY + 15);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(113, 128, 150);
      this.doc.text(
        `Will be available once ${this.partnerClientId} completes their Taste Exploration.`,
        this.margin + 10,
        noteY + 28
      );
    }
    
    this.addPageFooter();
  }
  
  /**
   * Draw category cards in a grid
   */
  drawCategoryCards(categoryIds, startY, cols) {
    const cardWidth = 220;
    const cardHeight = 95;
    const gapX = 30;
    const gapY = 15;
    
    const startX = (this.pageWidth - (cardWidth * cols + gapX * (cols - 1))) / 2;
    
    categoryIds.forEach((catId, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);
      
      const catInfo = CATEGORY_INFO[catId];
      const progress = this.dataP.session?.progress;
      const catMetrics = getCategoryMetrics(progress, catId);
      
      // Card background with border
      this.doc.setFillColor(255, 255, 255);
      this.doc.setDrawColor(226, 232, 240);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'FD');
      
      // Category header
      this.doc.setFillColor(30, 58, 95);
      this.doc.roundedRect(x, y, cardWidth, 18, 4, 4, 'F');
      this.doc.rect(x, y + 10, cardWidth, 8, 'F');
      
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(catInfo.name, x + cardWidth / 2, y + 12, { align: 'center' });
      
      // Design DNA label
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(30, 58, 95);
      this.doc.text('Design DNA', x + cardWidth / 2, y + 28, { align: 'center' });
      
      // Mini sliders
      const sliderX = x + 10;
      const sliderWidth = 150;
      let sliderY = y + 38;
      
      // Style Era
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(45, 55, 72);
      this.doc.text('Style Era', sliderX, sliderY);
      this.doc.setTextColor(201, 162, 39);
      this.doc.text(catMetrics.ct.toFixed(1), sliderX + sliderWidth + 15, sliderY);
      
      this.doc.setFillColor(226, 232, 240);
      this.doc.roundedRect(sliderX, sliderY + 3, sliderWidth, 3, 1, 1, 'F');
      this.doc.setFillColor(201, 162, 39);
      this.doc.roundedRect(sliderX, sliderY + 3, (catMetrics.ct / 5) * sliderWidth, 3, 1, 1, 'F');
      this.doc.setFillColor(30, 58, 95);
      this.doc.circle(sliderX + (catMetrics.ct / 5) * sliderWidth, sliderY + 4.5, 3, 'F');
      
      this.doc.setFontSize(5);
      this.doc.setTextColor(113, 128, 150);
      this.doc.text('Contemporary', sliderX, sliderY + 12);
      this.doc.text('Traditional', sliderX + sliderWidth - 20, sliderY + 12);
      
      sliderY += 18;
      
      // Material Complexity
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(45, 55, 72);
      this.doc.text('Material Complexity', sliderX, sliderY);
      this.doc.setTextColor(201, 162, 39);
      this.doc.text(catMetrics.ml.toFixed(1), sliderX + sliderWidth + 15, sliderY);
      
      this.doc.setFillColor(226, 232, 240);
      this.doc.roundedRect(sliderX, sliderY + 3, sliderWidth, 3, 1, 1, 'F');
      this.doc.setFillColor(201, 162, 39);
      this.doc.roundedRect(sliderX, sliderY + 3, (catMetrics.ml / 5) * sliderWidth, 3, 1, 1, 'F');
      this.doc.setFillColor(30, 58, 95);
      this.doc.circle(sliderX + (catMetrics.ml / 5) * sliderWidth, sliderY + 4.5, 3, 'F');
      
      this.doc.setFontSize(5);
      this.doc.setTextColor(113, 128, 150);
      this.doc.text('Minimal', sliderX, sliderY + 12);
      this.doc.text('Layered', sliderX + sliderWidth - 15, sliderY + 12);
      
      sliderY += 18;
      
      // Mood Palette
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(45, 55, 72);
      this.doc.text('Mood Palette', sliderX, sliderY);
      this.doc.setTextColor(201, 162, 39);
      this.doc.text(catMetrics.mp.toFixed(1), sliderX + sliderWidth + 15, sliderY);
      
      this.doc.setFillColor(226, 232, 240);
      this.doc.roundedRect(sliderX, sliderY + 3, sliderWidth, 3, 1, 1, 'F');
      this.doc.setFillColor(201, 162, 39);
      this.doc.roundedRect(sliderX, sliderY + 3, (catMetrics.mp / 5) * sliderWidth, 3, 1, 1, 'F');
      this.doc.setFillColor(30, 58, 95);
      this.doc.circle(sliderX + (catMetrics.mp / 5) * sliderWidth, sliderY + 4.5, 3, 'F');
      
      this.doc.setFontSize(5);
      this.doc.setTextColor(113, 128, 150);
      this.doc.text('Warm', sliderX, sliderY + 12);
      this.doc.text('Cool', sliderX + sliderWidth - 10, sliderY + 12);
    });
  }
  
  /**
   * Page 3: Partner Alignment Analysis
   */
  addPage3Alignment() {
    if (!this.dataS) return;
    
    let y = this.margin;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Partner Alignment Analysis', this.margin, y);
    y += 25;
    
    // Calculate alignment percentage
    const metricsP = this.dataP.metrics;
    const metricsS = this.dataS.metrics;
    
    const ctDiff = Math.abs((metricsP.ctScale5 || 2.5) - (metricsS.ctScale5 || 2.5));
    const mlDiff = Math.abs((metricsP.mlScale5 || 2.5) - (metricsS.mlScale5 || 2.5));
    const mpDiff = Math.abs((metricsP.wcScale5 || 2.5) - (metricsS.wcScale5 || 2.5));
    const avgDiff = (ctDiff + mlDiff + mpDiff) / 3;
    const alignmentPct = Math.max(0, Math.round(100 - (avgDiff / 5 * 100)));
    
    const alignColor = alignmentPct >= 70 ? SUCCESS_GREEN : alignmentPct >= 50 ? '#dd6b20' : FLAG_RED;
    
    this.doc.setFontSize(16);
    this.doc.text('Overall Alignment: ', this.margin, y);
    const textWidth = this.doc.getTextWidth('Overall Alignment: ');
    this.doc.setTextColor(alignColor);
    this.doc.text(`${alignmentPct}%`, this.margin + textWidth, y);
    y += 35;
    
    // DNA Axis Comparison
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('DNA Axis Comparison', this.margin, y);
    y += 12;
    
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(113, 128, 150);
    this.doc.text('P = Principal (gold)   S = Secondary (navy)', this.margin, y);
    y += 30;
    
    // Comparison sliders
    const labelX = this.margin;
    const sliderStartX = this.margin + 140;
    const sliderWidth = 200;
    
    // Style Era
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(45, 55, 72);
    this.doc.text('Style Era', labelX, y);
    drawComparisonSlider(this.doc, sliderStartX, y - 5, sliderWidth, metricsP.ctScale5 || 2.5, metricsS.ctScale5 || 2.5, 5, 'Contemporary', 'Traditional');
    y += 40;
    
    // Material Complexity
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(45, 55, 72);
    this.doc.text('Material Complexity', labelX, y);
    drawComparisonSlider(this.doc, sliderStartX, y - 5, sliderWidth, metricsP.mlScale5 || 2.5, metricsS.mlScale5 || 2.5, 5, 'Minimal', 'Layered');
    y += 40;
    
    // Mood Palette
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(45, 55, 72);
    this.doc.text('Mood Palette', labelX, y);
    drawComparisonSlider(this.doc, sliderStartX, y - 5, sliderWidth, metricsP.wcScale5 || 2.5, metricsS.wcScale5 || 2.5, 5, 'Warm', 'Cool');
    y += 50;
    
    // Flagged Divergences
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Flagged Divergences', this.margin, y);
    y += 12;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(113, 128, 150);
    this.doc.text('Categories where preferences differ significantly (more than one style position apart):', this.margin, y);
    y += 20;
    
    // Find flagged divergences based on regional preferences
    const flagged = [];
    
    const styleP = getDominantStyleFromRegion(metricsP.regionPreferences);
    const styleS = getDominantStyleFromRegion(metricsS.regionPreferences);
    const overallGap = calculateDivergence(styleP.code, styleS.code);
    
    if (overallGap > 2) {
      flagged.push({
        catName: 'Overall Style Direction',
        styleP: styleP.label,
        codeP: styleP.code,
        styleS: styleS.label,
        codeS: styleS.code,
        gap: overallGap
      });
    }
    
    // Check DNA axis divergences
    if (ctDiff > 1) {
      flagged.push({
        catName: 'Style Era Preference',
        styleP: metricsP.ctScale5 < 2.5 ? 'Contemporary' : 'Traditional',
        codeP: '',
        styleS: metricsS.ctScale5 < 2.5 ? 'Contemporary' : 'Traditional',
        codeS: '',
        gap: Math.round(ctDiff * 2)
      });
    }
    
    if (mlDiff > 1) {
      flagged.push({
        catName: 'Material Complexity',
        styleP: metricsP.mlScale5 < 2.5 ? 'Minimal' : 'Layered',
        codeP: '',
        styleS: metricsS.mlScale5 < 2.5 ? 'Minimal' : 'Layered',
        codeS: '',
        gap: Math.round(mlDiff * 2)
      });
    }
    
    if (mpDiff > 1) {
      flagged.push({
        catName: 'Mood Palette',
        styleP: metricsP.wcScale5 < 2.5 ? 'Warm' : 'Cool',
        codeP: '',
        styleS: metricsS.wcScale5 < 2.5 ? 'Warm' : 'Cool',
        codeS: '',
        gap: Math.round(mpDiff * 2)
      });
    }
    
    if (flagged.length > 0) {
      flagged.forEach(f => {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(45, 55, 72);
        this.doc.text(f.catName, this.margin, y);
        y += 10;
        
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(113, 128, 150);
        const detail = f.codeP ? `Principal: ${f.styleP} (${f.codeP})  |  Secondary: ${f.styleS} (${f.codeS})` : `Principal: ${f.styleP}  |  Secondary: ${f.styleS}`;
        this.doc.text(detail, this.margin, y);
        y += 10;
        
        const prompt = f.gap >= 4
          ? `Significant divergence (${f.gap} positions apart). This warrants detailed discussion about design direction.`
          : `Notable difference (${f.gap} positions apart). Consider discussing preferences to find common ground.`;
        
        this.doc.setTextColor(197, 48, 48);
        this.doc.text(`■ ${prompt}`, this.margin + 10, y, { maxWidth: this.pageWidth - 2 * this.margin - 20 });
        y += 20;
      });
    } else {
      this.doc.setFontSize(10);
      this.doc.setTextColor(56, 161, 105);
      this.doc.text('✓ No significant divergences detected.', this.margin, y);
      y += 14;
      this.doc.text('Your style preferences are well-aligned across all categories.', this.margin + 12, y);
    }
    
    this.addPageFooter();
  }
  
  /**
   * Final Page: Selection Gallery
   */
  addPageGallery() {
    let y = this.margin + 20;
    
    // Title
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 95);
    this.doc.text('Your Selections', this.pageWidth / 2, y, { align: 'center' });
    y += 12;
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(113, 128, 150);
    this.doc.text('The images you selected during Taste Exploration', this.pageWidth / 2, y, { align: 'center' });
    y += 35;
    
    // Grid of selection cards (3x3)
    const cardWidth = 140;
    const cardHeight = 120;
    const gapX = 25;
    const gapY = 20;
    const cols = 3;
    
    const startX = (this.pageWidth - (cardWidth * cols + gapX * (cols - 1))) / 2;
    
    const categories = Object.entries(CATEGORY_INFO);
    
    categories.forEach(([catId, catInfo], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gapX);
      const cardY = y + row * (cardHeight + gapY);
      
      // Image placeholder box
      this.doc.setFillColor(241, 245, 249);
      this.doc.setDrawColor(226, 232, 240);
      this.doc.roundedRect(x + 5, cardY, cardWidth - 10, 85, 4, 4, 'FD');
      
      // Placeholder icon
      this.doc.setFontSize(24);
      this.doc.setTextColor(203, 213, 224);
      this.doc.text('■■', x + cardWidth / 2 - 12, cardY + 50);
      
      // Category label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(30, 58, 95);
      this.doc.text(`${catInfo.code}  ${catInfo.name}`, x + cardWidth / 2, cardY + 100, { align: 'center' });
    });
    
    this.addPageFooter(true);
  }
  
  /**
   * Download the PDF
   */
  download(filename) {
    const name = filename || `N4S-Design-Profile-${this.dataP.clientId}.pdf`;
    this.doc.save(name);
  }
  
  /**
   * Open PDF in new tab
   */
  openInNewTab() {
    const blob = this.doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
  
  /**
   * Get PDF as blob for email attachment
   */
  getBlob() {
    return this.doc.output('blob');
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Generate and download a taste profile report
 */
export async function downloadTasteReport(dataP, dataS = null) {
  const generator = new TasteReportGenerator(dataP, dataS);
  await generator.generate();
  generator.download();
}

/**
 * Generate and open report in new tab
 */
export async function viewTasteReport(dataP, dataS = null) {
  const generator = new TasteReportGenerator(dataP, dataS);
  await generator.generate();
  generator.openInNewTab();
}

/**
 * Generate report and return blob for email
 */
export async function getTasteReportBlob(dataP, dataS = null) {
  const generator = new TasteReportGenerator(dataP, dataS);
  await generator.generate();
  return generator.getBlob();
}
