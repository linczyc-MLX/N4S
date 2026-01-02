// ============================================
// N4S TASTE PROFILE REPORT GENERATOR
// PDF Generation using jsPDF
// Version: FINAL - Matches approved PDF format
// ============================================

import jsPDF from 'jspdf';
import {
  QUAD_MATRIX,
  CATEGORIES,
  CATEGORY_ORDER,
  AS_LABELS,
  AS_ORDER,
  VD_LABELS,
  MP_LABELS,
  getCodeValue,
  getQuadPosition
} from '../data/tasteConfig';
import { quads } from '../data/tasteQuads';

// Helper to get correct image URL from quads data
const getSelectionImageUrl = (quadId, positionIndex) => {
  const quad = quads.find(q => q.quadId === quadId);
  if (!quad || !quad.images || !quad.images[positionIndex]) {
    return null;
  }
  return quad.images[positionIndex];
};

// ============================================
// CONSTANTS
// ============================================

// N4S Brand Colors (RGB values for jsPDF)
const NAVY = { r: 30, g: 58, b: 95 };
const GOLD = { r: 201, g: 162, b: 39 };
const LIGHT_GOLD = { r: 245, g: 240, b: 225 };
const DARK_TEXT = { r: 45, g: 55, b: 72 };
const LIGHT_TEXT = { r: 113, g: 128, b: 150 };
const WARM_GRAY = { r: 248, g: 250, b: 252 };
const WHITE = { r: 255, g: 255, b: 255 };
const SUCCESS_GREEN = { r: 56, g: 161, b: 105 };
const WARNING_ORANGE = { r: 221, g: 107, b: 32 };
const ERROR_RED = { r: 197, g: 48, b: 48 };

// Category mapping
const CATEGORY_MAP = {
  'exterior_architecture': { code: 'EA', name: 'Exterior Architecture' },
  'living_spaces': { code: 'LS', name: 'Living Spaces' },
  'dining_spaces': { code: 'DS', name: 'Dining Spaces' },
  'kitchens': { code: 'KT', name: 'Kitchens' },
  'family_areas': { code: 'FA', name: 'Family Areas' },
  'primary_bedrooms': { code: 'PB', name: 'Primary Bedrooms' },
  'primary_bathrooms': { code: 'PBT', name: 'Primary Bathrooms' },
  'guest_bedrooms': { code: 'GB', name: 'Guest Bedrooms' },
  'outdoor_living': { code: 'OL', name: 'Outdoor Living' }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display
 */
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get style position on 1-9 scale
 */
function getStylePosition(styleCode) {
  const idx = AS_ORDER.indexOf(styleCode);
  return idx >= 0 ? idx + 1 : 5;
}

/**
 * Calculate metrics for a specific category
 */
function getCategoryMetrics(selections) {
  if (!selections || selections.length === 0) {
    return { ct: 2.5, ml: 2.5, mp: 2.5, dominantStyle: 'AS5' };
  }

  let totalCT = 0, totalML = 0, totalMP = 0, count = 0;
  const styleCounts = {};

  selections.forEach(sel => {
    if (sel.selectedIndex >= 0 && sel.selectedIndex <= 3) {
      const quadData = getQuadPosition(sel.quadId, sel.selectedIndex);
      if (quadData) {
        const ctVal = getCodeValue(quadData.style);
        const mlVal = getCodeValue(quadData.vd);
        const mpVal = getCodeValue(quadData.mp);

        totalCT += ctVal;
        totalML += mlVal;
        totalMP += mpVal;
        count++;

        styleCounts[quadData.style] = (styleCounts[quadData.style] || 0) + 1;
      }
    }
  });

  if (count === 0) {
    return { ct: 2.5, ml: 2.5, mp: 2.5, dominantStyle: 'AS5' };
  }

  // Find dominant style
  let dominantStyle = 'AS5';
  let maxCount = 0;
  Object.entries(styleCounts).forEach(([style, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      dominantStyle = style;
    }
  });

  return {
    ct: totalCT / count,
    ml: totalML / count,
    mp: totalMP / count,
    dominantStyle
  };
}

/**
 * Calculate overall metrics from profile
 */
function calculateOverallMetrics(profile) {
  if (!profile?.session?.progress) return null;

  let totalCT = 0, totalML = 0, totalMP = 0, count = 0;
  const styleCounts = {};
  const materialCounts = {};

  Object.values(profile.session.progress).forEach(catProgress => {
    if (catProgress.selections) {
      catProgress.selections.forEach(sel => {
        if (sel.selectedIndex >= 0 && sel.selectedIndex <= 3) {
          const quadData = getQuadPosition(sel.quadId, sel.selectedIndex);
          if (quadData) {
            totalCT += getCodeValue(quadData.style);
            totalML += getCodeValue(quadData.vd);
            totalMP += getCodeValue(quadData.mp);
            count++;

            styleCounts[quadData.style] = (styleCounts[quadData.style] || 0) + 1;
            materialCounts[quadData.mp] = (materialCounts[quadData.mp] || 0) + 1;
          }
        }
      });
    }
  });

  if (count === 0) return null;

  const avgCT = totalCT / count;
  const avgML = totalML / count;
  const avgMP = totalMP / count;

  // Convert to 5-point scale
  const ctScale5 = ((avgCT - 1) / 8) * 4 + 1;
  const mlScale5 = avgML;
  const mpScale5 = avgMP;

  // Determine style label
  let styleLabel = 'Transitional';
  if (avgCT < 4) styleLabel = 'Contemporary';
  else if (avgCT > 6) styleLabel = 'Traditional';

  // Get top preferences
  const sortedStyles = Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code]) => AS_LABELS[code] || code);

  const sortedMaterials = Object.entries(materialCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code]) => MP_LABELS[code] || code);

  return {
    avgCT, avgML, avgMP,
    ctScale5, mlScale5, mpScale5,
    styleLabel,
    regionalPreferences: sortedStyles,
    materialPreferences: sortedMaterials
  };
}

/**
 * Calculate alignment percentage between two profiles
 */
function calculateAlignment(metricsP, metricsS) {
  if (!metricsP || !metricsS) return 0;

  const ctDiff = Math.abs(metricsP.ctScale5 - metricsS.ctScale5) / 4;
  const mlDiff = Math.abs(metricsP.mlScale5 - metricsS.mlScale5) / 4;
  const mpDiff = Math.abs(metricsP.mpScale5 - metricsS.mpScale5) / 4;

  const avgDiff = (ctDiff + mlDiff + mpDiff) / 3;
  return Math.round((1 - avgDiff) * 100);
}

/**
 * Find flagged divergences between partners
 */
function findDivergences(profileP, profileS) {
  const flagged = [];

  if (!profileP?.session?.progress || !profileS?.session?.progress) {
    return flagged;
  }

  Object.entries(CATEGORY_MAP).forEach(([catId, catInfo]) => {
    const selectionsP = profileP.session.progress[catId]?.selections || [];
    const selectionsS = profileS.session.progress[catId]?.selections || [];

    const metricsP = getCategoryMetrics(selectionsP);
    const metricsS = getCategoryMetrics(selectionsS);

    const posP = getStylePosition(metricsP.dominantStyle);
    const posS = getStylePosition(metricsS.dominantStyle);
    const gap = Math.abs(posP - posS);

    if (gap > 2) {
      flagged.push({
        category: catInfo.name,
        styleP: AS_LABELS[metricsP.dominantStyle] || metricsP.dominantStyle,
        codeP: metricsP.dominantStyle,
        styleS: AS_LABELS[metricsS.dominantStyle] || metricsS.dominantStyle,
        codeS: metricsS.dominantStyle,
        gap
      });
    }
  });

  return flagged;
}

/**
 * Load image as base64 for PDF embedding
 */
async function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (e) {
        console.warn('Could not load image:', url);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn('Image load error:', url);
      resolve(null);
    };
    img.src = url;
  });
}

// ============================================
// MAIN REPORT GENERATOR CLASS
// ============================================

export class TasteReportGenerator {
  constructor(profileP, profileS = null, options = {}) {
    this.doc = new jsPDF('p', 'pt', 'letter');
    this.profileP = profileP;
    this.profileS = profileS;
    this.isCouple = !!profileS;
    this.options = options;

    // Page dimensions
    this.pageWidth = 612;
    this.pageHeight = 792;
    this.margin = 40;
    this.contentWidth = this.pageWidth - (this.margin * 2);

    // Pagination
    this.currentPage = 1;
    this.totalPages = this.isCouple ? 4 : 3;

    // Calculate metrics
    this.metricsP = calculateOverallMetrics(profileP);
    this.metricsS = profileS ? calculateOverallMetrics(profileS) : null;
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

    // Page 3: Partner Alignment (if couple)
    if (this.isCouple && this.profileS) {
      this.doc.addPage();
      this.currentPage = 3;
      this.addPage3Alignment();
    }

    // Final Page: Selection gallery
    this.doc.addPage();
    this.currentPage = this.totalPages;
    await this.addPageGallery();

    return this.doc;
  }

  /**
   * Add page footer
   */
  addPageFooter(isLastPage = false) {
    const footerY = this.pageHeight - 30;

    // Date (left)
    this.doc.setFontSize(7);
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text(formatDate(new Date()), this.margin, footerY);

    // Page number (right)
    this.doc.text(
      `Page ${this.currentPage} of ${this.totalPages}`,
      this.pageWidth - this.margin,
      footerY,
      { align: 'right' }
    );

    // Copyright (only on last page)
    if (isLastPage) {
      this.doc.setFontSize(7);
      this.doc.text(
        'This report was generated by the N4S Taste Exploration system. Use this profile as a starting point for discussions with your design team.',
        this.margin,
        footerY - 25
      );
      this.doc.text(
        '© 2026 Not4Sale Luxury Residential Advisory',
        this.pageWidth / 2,
        footerY - 12,
        { align: 'center' }
      );
    }
  }

  /**
   * Draw a slider with marker
   */
  drawSlider(x, y, width, value, maxVal, leftLabel, rightLabel, showValue = true) {
    const trackHeight = 6;
    const markerPos = ((value - 1) / (maxVal - 1)) * width;

    // Track background
    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(x, y, width, trackHeight, 3, 3, 'F');

    // Filled portion (gold)
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.roundedRect(x, y, markerPos, trackHeight, 3, 3, 'F');

    // Marker dot (navy)
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(x + markerPos, y + trackHeight / 2, 5, 'F');

    // Labels
    this.doc.setFontSize(6);
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text(leftLabel, x, y + trackHeight + 10);
    this.doc.text(rightLabel, x + width, y + trackHeight + 10, { align: 'right' });

    // Value display
    if (showValue) {
      this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
      this.doc.text(value.toFixed(1), x + width + 10, y + trackHeight / 2 + 2);
    }
  }

  /**
   * Draw comparison slider with P and S markers
   */
  drawComparisonSlider(x, y, width, valueP, valueS, maxVal, leftLabel, rightLabel) {
    const trackHeight = 6;
    const posP = ((valueP - 1) / (maxVal - 1)) * width;
    const posS = ((valueS - 1) / (maxVal - 1)) * width;

    // Track background
    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(x, y, width, trackHeight, 3, 3, 'F');

    // Principal marker (gold) with P label
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.circle(x + posP, y + trackHeight / 2, 6, 'F');
    this.doc.setFontSize(6);
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('P', x + posP - 2, y + trackHeight / 2 + 2);

    // Secondary marker (navy) with S label
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(x + posS, y + trackHeight / 2, 6, 'F');
    this.doc.text('S', x + posS - 2, y + trackHeight / 2 + 2);

    // Labels
    this.doc.setFontSize(6);
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text(leftLabel, x, y + trackHeight + 10);
    this.doc.text(rightLabel, x + width, y + trackHeight + 10, { align: 'right' });
  }

  /**
   * Draw a category card with 3 DNA sliders
   */
  drawCategoryCard(x, y, catName, metrics) {
    const cardWidth = 170;
    const cardHeight = 95;

    // Card background
    this.doc.setFillColor(WARM_GRAY.r, WARM_GRAY.g, WARM_GRAY.b);
    this.doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'F');

    // Category header bar
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.roundedRect(x, y, cardWidth, 18, 4, 4, 'F');
    this.doc.rect(x, y + 10, cardWidth, 8, 'F'); // Fill bottom corners

    // Category name
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text(catName, x + cardWidth / 2, y + 12, { align: 'center' });

    // DNA label
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Design DNA', x + cardWidth / 2, y + 30, { align: 'center' });

    const sliderX = x + 8;
    const sliderWidth = cardWidth - 45;
    let sliderY = y + 38;

    // Style Era slider
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('Style Era', sliderX, sliderY);
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(metrics.ct.toFixed(1), sliderX + sliderWidth + 8, sliderY);

    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(sliderX, sliderY + 3, sliderWidth, 3, 1, 1, 'F');
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.roundedRect(sliderX, sliderY + 3, (metrics.ct / 5) * sliderWidth, 3, 1, 1, 'F');
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(sliderX + (metrics.ct / 5) * sliderWidth, sliderY + 4.5, 3, 'F');

    this.doc.setFontSize(5);
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('Contemporary', sliderX, sliderY + 12);
    this.doc.text('Traditional', sliderX + sliderWidth - 22, sliderY + 12);

    sliderY += 18;

    // Material Complexity slider
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('Material Complexity', sliderX, sliderY);
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(metrics.ml.toFixed(1), sliderX + sliderWidth + 8, sliderY);

    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(sliderX, sliderY + 3, sliderWidth, 3, 1, 1, 'F');
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.roundedRect(sliderX, sliderY + 3, (metrics.ml / 5) * sliderWidth, 3, 1, 1, 'F');
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(sliderX + (metrics.ml / 5) * sliderWidth, sliderY + 4.5, 3, 'F');

    this.doc.setFontSize(5);
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('Minimal', sliderX, sliderY + 12);
    this.doc.text('Layered', sliderX + sliderWidth - 15, sliderY + 12);

    sliderY += 18;

    // Mood Palette slider
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('Mood Palette', sliderX, sliderY);
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(metrics.mp.toFixed(1), sliderX + sliderWidth + 8, sliderY);

    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(sliderX, sliderY + 3, sliderWidth, 3, 1, 1, 'F');
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.roundedRect(sliderX, sliderY + 3, (metrics.mp / 5) * sliderWidth, 3, 1, 1, 'F');
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(sliderX + (metrics.mp / 5) * sliderWidth, sliderY + 4.5, 3, 'F');

    this.doc.setFontSize(5);
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('Warm', sliderX, sliderY + 12);
    this.doc.text('Cool', sliderX + sliderWidth - 10, sliderY + 12);
  }

  /**
   * Page 1: Profile Overview
   */
  addPage1() {
    let y = this.margin;

    // Header
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');

    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.rect(0, 45, this.pageWidth, 3, 'F');

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('N4S', this.margin, 28);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Your Design Profile', this.margin + 40, 28);

    y = 65;

    // Client info
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('Client:', this.margin, y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.profileP.clientName || this.profileP.clientId || 'Unknown', this.margin + 40, y);

    // Location from P1.A.3 (if available)
    if (this.options.location) {
      y += 12;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Location:', this.margin, y);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.options.location, this.margin + 50, y);
    }

    y += 25;

    // Style Label (large, centered)
    this.doc.setFillColor(LIGHT_GOLD.r, LIGHT_GOLD.g, LIGHT_GOLD.b);
    this.doc.roundedRect(this.margin, y, this.contentWidth, 35, 4, 4, 'F');

    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(this.metricsP?.styleLabel || 'Transitional', this.pageWidth / 2, y + 22, { align: 'center' });

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('Your overall design aesthetic', this.pageWidth / 2, y + 32, { align: 'center' });

    y += 50;

    // Design DNA Section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Design DNA: Style Axes', this.margin, y);
    y += 18;

    // Three main sliders
    const sliderWidth = 250;

    // Style Era
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text(`Style Era — ${(this.metricsP?.ctScale5 || 2.5).toFixed(1)}`, this.margin, y);
    y += 8;
    this.drawSlider(this.margin, y, sliderWidth, this.metricsP?.ctScale5 || 2.5, 5, 'Contemporary', 'Traditional', false);
    y += 25;

    // Material Complexity
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Material Complexity — ${(this.metricsP?.mlScale5 || 2.5).toFixed(1)}`, this.margin, y);
    y += 8;
    this.drawSlider(this.margin, y, sliderWidth, this.metricsP?.mlScale5 || 2.5, 5, 'Minimal', 'Layered', false);
    y += 25;

    // Mood Palette
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Mood Palette — ${(this.metricsP?.mpScale5 || 2.5).toFixed(1)}`, this.margin, y);
    y += 8;
    this.drawSlider(this.margin, y, sliderWidth, this.metricsP?.mpScale5 || 2.5, 5, 'Warm', 'Cool', false);
    y += 30;

    // Style Preferences (two columns)
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Style Preferences', this.margin, y);
    y += 15;

    const colWidth = this.contentWidth / 2 - 10;

    // Regional Influences
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('Regional Influences', this.margin, y);

    // Material Preferences
    this.doc.text('Material Preferences', this.margin + colWidth + 20, y);
    y += 12;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);

    const regional = this.metricsP?.regionalPreferences || ['Contemporary', 'Modern'];
    const materials = this.metricsP?.materialPreferences || ['Natural', 'Neutral'];

    regional.forEach((item, i) => {
      this.doc.text(`• ${item}`, this.margin, y + (i * 10));
    });

    materials.forEach((item, i) => {
      this.doc.text(`• ${item}`, this.margin + colWidth + 20, y + (i * 10));
    });

    y += Math.max(regional.length, materials.length) * 10 + 15;

    // Per-Category Design Profile
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Per-Category Design Profile', this.margin, y);
    y += 15;

    // First 4 category cards (2x2 grid)
    const cardSpacing = 10;
    const cardWidth = 170;
    const categories = Object.entries(CATEGORY_MAP).slice(0, 4);

    categories.forEach((entry, i) => {
      const [catId, catInfo] = entry;
      const selections = this.profileP.session?.progress?.[catId]?.selections || [];
      const catMetrics = getCategoryMetrics(selections);

      const col = i % 2;
      const row = Math.floor(i / 2);
      const cardX = this.margin + (col * (cardWidth + cardSpacing));
      const cardY = y + (row * 100);

      this.drawCategoryCard(cardX, cardY, catInfo.name, catMetrics);
    });

    this.addPageFooter();
  }

  /**
   * Page 2: Remaining Categories
   */
  addPage2() {
    let y = this.margin;

    // Header
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Per-Category Design Profile', this.margin, y);

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('(continued)', this.margin + 165, y);
    y += 20;

    // Remaining 5 category cards (3 + 2 layout)
    const cardSpacing = 10;
    const cardWidth = 170;
    const categories = Object.entries(CATEGORY_MAP).slice(4);

    categories.forEach((entry, i) => {
      const [catId, catInfo] = entry;
      const selections = this.profileP.session?.progress?.[catId]?.selections || [];
      const catMetrics = getCategoryMetrics(selections);

      const col = i % 3;
      const row = Math.floor(i / 3);
      const cardX = this.margin + (col * (cardWidth + cardSpacing));
      const cardY = y + (row * 105);

      this.drawCategoryCard(cardX, cardY, catInfo.name, catMetrics);
    });

    this.addPageFooter();
  }

  /**
   * Page 3: Partner Alignment Analysis
   */
  addPage3Alignment() {
    if (!this.profileS || !this.metricsS) return;

    let y = this.margin;

    // Title
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Partner Alignment Analysis', this.margin, y);
    y += 25;

    // Overall alignment percentage
    const alignmentPct = calculateAlignment(this.metricsP, this.metricsS);
    let alignColor = SUCCESS_GREEN;
    if (alignmentPct < 70) alignColor = WARNING_ORANGE;
    if (alignmentPct < 50) alignColor = ERROR_RED;

    this.doc.setFontSize(16);
    this.doc.setTextColor(alignColor.r, alignColor.g, alignColor.b);
    this.doc.text(`Overall Alignment: ${alignmentPct}%`, this.margin, y);
    y += 30;

    // DNA Axis Comparison
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('DNA Axis Comparison', this.margin, y);
    y += 15;

    // Legend
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('P = Principal (gold)    S = Secondary (navy)', this.margin, y);
    y += 20;

    const sliderWidth = 300;

    // Style Era comparison
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Style Era', this.margin, y);
    y += 12;
    this.drawComparisonSlider(this.margin, y, sliderWidth, this.metricsP.ctScale5, this.metricsS.ctScale5, 5, 'Contemporary', 'Traditional');
    y += 30;

    // Material Complexity comparison
    this.doc.text('Material Complexity', this.margin, y);
    y += 12;
    this.drawComparisonSlider(this.margin, y, sliderWidth, this.metricsP.mlScale5, this.metricsS.mlScale5, 5, 'Minimal', 'Layered');
    y += 30;

    // Mood Palette comparison
    this.doc.text('Mood Palette', this.margin, y);
    y += 12;
    this.drawComparisonSlider(this.margin, y, sliderWidth, this.metricsP.mpScale5, this.metricsS.mpScale5, 5, 'Warm', 'Cool');
    y += 40;

    // Flagged Divergences
    const divergences = findDivergences(this.profileP, this.profileS);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Flagged Divergences', this.margin, y);
    y += 12;

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('Categories where preferences differ significantly (more than one style position apart):', this.margin, y);
    y += 18;

    if (divergences.length === 0) {
      this.doc.setTextColor(SUCCESS_GREEN.r, SUCCESS_GREEN.g, SUCCESS_GREEN.b);
      this.doc.text('✓ No significant divergences detected. Your style preferences are well-aligned across all categories.', this.margin, y);
    } else {
      divergences.forEach(div => {
        // Category name
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
        this.doc.text(div.category, this.margin, y);
        y += 12;

        // Principal vs Secondary
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(7);
        this.doc.text(`Principal: ${div.styleP} (${div.codeP}) | Secondary: ${div.styleS} (${div.codeS})`, this.margin, y);
        y += 10;

        // Discussion prompt
        const prompt = div.gap >= 4
          ? `■ Significant divergence (${div.gap} positions apart). This warrants detailed discussion about design direction for this space.`
          : `■ Notable difference (${div.gap} positions apart). Consider discussing preferences to find common ground.`;

        this.doc.setTextColor(WARNING_ORANGE.r, WARNING_ORANGE.g, WARNING_ORANGE.b);
        this.doc.text(prompt, this.margin, y);
        y += 18;

        this.doc.setFontSize(8);
      });
    }

    this.addPageFooter();
  }

  /**
   * Final Page: Selection Gallery with Images
   */
  async addPageGallery() {
    let y = this.margin;

    // Title
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Your Selections', this.margin, y);
    y += 12;

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
    this.doc.text('The images you selected during Taste Exploration', this.margin, y);
    y += 20;

    // Grid of selection images (3x3)
    const thumbSize = 140;
    const thumbSpacing = 15;
    const categories = Object.entries(CATEGORY_MAP);

    for (let i = 0; i < categories.length; i++) {
      const [catId, catInfo] = categories[i];
      const col = i % 3;
      const row = Math.floor(i / 3);

      const thumbX = this.margin + (col * (thumbSize + thumbSpacing));
      const thumbY = y + (row * (thumbSize + 35));

      // Get first valid selection for this category
      const selections = this.profileP.session?.progress?.[catId]?.selections || [];
      let selectedImage = null;
      let quadId = null;
      let position = null;

      for (const sel of selections) {
        if (sel.selectedIndex >= 0 && sel.selectedIndex <= 3) {
          quadId = sel.quadId;
          position = sel.selectedIndex + 1; // 1-indexed for filename
          break;
        }
      }

      // Placeholder box
      this.doc.setFillColor(WARM_GRAY.r, WARM_GRAY.g, WARM_GRAY.b);
      this.doc.setDrawColor(226, 232, 240);
      this.doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4, 4, 'FD');

      // Try to load and embed the image
      const imageUrl = quadId && position ? getSelectionImageUrl(quadId, position - 1) : null;

      if (imageUrl) {
        try {
          const imgData = await loadImageAsBase64(imageUrl);
          if (imgData) {
            this.doc.addImage(imgData, 'JPEG', thumbX + 2, thumbY + 2, thumbSize - 4, thumbSize - 4);
          } else {
            // Show placeholder text if image fails
            this.doc.setFontSize(10);
            this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
            this.doc.text('■■', thumbX + thumbSize/2, thumbY + thumbSize/2, { align: 'center' });
          }
        } catch (e) {
          // Show placeholder on error
          this.doc.setFontSize(10);
          this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
          this.doc.text('■■', thumbX + thumbSize/2, thumbY + thumbSize/2, { align: 'center' });
        }
      } else {
        // No selection or no image URL - show placeholder
        this.doc.setFontSize(10);
        this.doc.setTextColor(LIGHT_TEXT.r, LIGHT_TEXT.g, LIGHT_TEXT.b);
        this.doc.text('■■', thumbX + thumbSize/2, thumbY + thumbSize/2, { align: 'center' });
      }

      // Category label (code + name)
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.text(`${catInfo.code}`, thumbX, thumbY + thumbSize + 12);

      this.doc.setFont('helvetica', 'normal');
      this.doc.text(catInfo.name, thumbX + 25, thumbY + thumbSize + 12);
    }

    this.addPageFooter(true);
  }

  /**
   * Download PDF
   */
  download(filename) {
    const name = filename || `N4S-Taste-Profile-${this.profileP.clientId || 'Report'}.pdf`;
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
   * Get PDF as blob
   */
  getBlob() {
    return this.doc.output('blob');
  }

  /**
   * Get PDF as base64
   */
  getBase64() {
    return this.doc.output('datauristring');
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Generate and download report
 */
export async function downloadTasteReport(profileP, profileS = null, options = {}) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  generator.download();
}

/**
 * Generate and view report in new tab
 */
export async function viewTasteReport(profileP, profileS = null, options = {}) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  generator.openInNewTab();
}

/**
 * Generate and return blob for email
 */
export async function getTasteReportBlob(profileP, profileS = null, options = {}) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  return generator.getBlob();
}

export default TasteReportGenerator;
