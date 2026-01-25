// ============================================
// N4S TASTE PROFILE REPORT GENERATOR
// PDF Generation using jsPDF
// Version: 3.0 - New Design Specifications
// ============================================

import jsPDF from 'jspdf';
import { quads } from '../data/tasteQuads';

// ============================================
// CONSTANTS
// ============================================

// N4S Brand Colors (RGB values for jsPDF)
const NAVY = { r: 30, g: 58, b: 95 };
const GOLD = { r: 201, g: 162, b: 39 };
const CREAM = { r: 254, g: 249, b: 231 }; // #FEF9E7
const CARD_BG = { r: 248, g: 250, b: 252 }; // #F8FAFC
const LIGHT_GRAY = { r: 100, g: 116, b: 139 }; // #64748B
const DARK_TEXT = { r: 45, g: 55, b: 72 };
const WHITE = { r: 255, g: 255, b: 255 };
const SUCCESS_GREEN = { r: 34, g: 197, b: 94 };

// Category mapping with order
const CATEGORY_ORDER = [
  { id: 'exterior_architecture', code: 'EA', name: 'Exterior Architecture' },
  { id: 'living_spaces', code: 'LS', name: 'Living Spaces' },
  { id: 'dining_spaces', code: 'DS', name: 'Dining Spaces' },
  { id: 'kitchens', code: 'KT', name: 'Kitchens' },
  { id: 'family_areas', code: 'FA', name: 'Family Areas' },
  { id: 'primary_bedrooms', code: 'PB', name: 'Primary Bedrooms' },
  { id: 'primary_bathrooms', code: 'PBT', name: 'Primary Bathrooms' },
  { id: 'guest_bedrooms', code: 'GB', name: 'Guest Bedrooms' },
  { id: 'outdoor_living', code: 'OL', name: 'Outdoor Living' }
];

// Architectural Style labels (AS1-AS9)
const AS_LABELS = {
  1: 'Avant-Contemporary',
  2: 'Architectural Modern',
  3: 'Curated Minimalism',
  4: 'Nordic Contemporary',
  5: 'Mid-Century Refined',
  6: 'Modern Classic',
  7: 'Classical Contemporary',
  8: 'Formal Classical',
  9: 'Heritage Estate'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Get image URL from quads data
function getSelectionImageUrl(quadId, positionIndex) {
  const quad = quads.find(q => q.quadId === quadId);
  if (!quad || !quad.images || !quad.images[positionIndex]) {
    return null;
  }
  return quad.images[positionIndex];
}

// Extract AS/VD/MP codes from image filename
// Format: LS-001_0_AS1_VD1_MP1.png
function extractCodesFromFilename(imageUrl) {
  if (!imageUrl) return null;

  const filename = imageUrl.split('/').pop();
  const asMatch = filename.match(/AS(\d)/);
  const vdMatch = filename.match(/VD(\d)/);
  const mpMatch = filename.match(/MP(\d)/);

  if (!asMatch || !vdMatch || !mpMatch) return null;

  return {
    as: parseInt(asMatch[1]),
    vd: parseInt(vdMatch[1]),
    mp: parseInt(mpMatch[1])
  };
}

// Normalize 1-9 scale to 1-5 scale
function normalize9to5(value) {
  return ((value - 1) / 8) * 4 + 1;
}

// Calculate per-category metrics from selected image
function getCategoryMetricsFromSelection(quadId, positionIndex) {
  const imageUrl = getSelectionImageUrl(quadId, positionIndex);
  const codes = extractCodesFromFilename(imageUrl);

  if (!codes) {
    return { styleEra: 2.5, materialComplexity: 2.5, moodPalette: 2.5 };
  }

  return {
    styleEra: normalize9to5(codes.as),
    materialComplexity: normalize9to5(codes.vd),
    moodPalette: normalize9to5(codes.mp)
  };
}

// Calculate overall style label from average style era
function getStyleLabel(avgStyleEra) {
  if (avgStyleEra < 2.5) return 'Contemporary';
  if (avgStyleEra > 3.5) return 'Traditional';
  return 'Transitional';
}

// Load image as base64 for PDF embedding
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
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

// Get selection for a category from profile
function getSelectionForCategory(profile, categoryId) {
  const categoryQuads = quads.filter(q => q.category === categoryId);

  // FIRST: Try dictionary format (profile.selections or profile.session.selections)
  const flatSelections = profile.selections || profile.session?.selections || {};

  // Check if flatSelections is a dictionary (object with quadId keys)
  if (flatSelections && typeof flatSelections === 'object' && !Array.isArray(flatSelections)) {
    for (const quad of categoryQuads) {
      const sel = flatSelections[quad.quadId];
      if (sel && sel.favorites && sel.favorites.length > 0) {
        console.log('[PDF-SELECTIONS] Found dictionary selection for', categoryId, ':', quad.quadId);
        return { quadId: quad.quadId, positionIndex: sel.favorites[0] };
      }
    }
  }

  // SECOND: Try array format from LuXeBrief (selections as array)
  // LuXeBrief format: [{quadId, favorite1, favorite2, leastFavorite}]
  const arraySelections = Array.isArray(profile.selections) ? profile.selections :
                          Array.isArray(profile.session?.selections) ? profile.session.selections : [];

  for (const sel of arraySelections) {
    if (categoryQuads.some(q => q.quadId === sel.quadId)) {
      // Found a selection for this category
      const positionIndex = sel.favorite1 !== undefined ? sel.favorite1 :
                           sel.favorites?.[0] !== undefined ? sel.favorites[0] :
                           sel.selectedIndex;
      if (positionIndex !== undefined && positionIndex >= 0 && positionIndex <= 3) {
        console.log('[PDF-SELECTIONS] Found array selection for', categoryId, ':', sel.quadId);
        return { quadId: sel.quadId, positionIndex };
      }
    }
  }

  // THIRD: Fallback to nested structure (progress-based)
  const nestedSelections = profile.session?.progress?.[categoryId]?.selections || [];
  for (const sel of nestedSelections) {
    if (sel.selectedIndex >= 0 && sel.selectedIndex <= 3) {
      console.log('[PDF-SELECTIONS] Found nested selection for', categoryId, ':', sel.quadId);
      return { quadId: sel.quadId, positionIndex: sel.selectedIndex };
    }
  }

  console.log('[PDF-SELECTIONS] No selection found for category:', categoryId);
  return null;
}

// ============================================
// MAIN REPORT GENERATOR CLASS
// ============================================

export class TasteReportGenerator {
  constructor(profileP, profileS = null, options = {}) {
    this.doc = new jsPDF('p', 'pt', 'letter');
    this.profileP = profileP;
    this.profileS = profileS;
    this.options = options;
    this.kycData = options.kycData || null;

    // Page dimensions
    this.pageWidth = 612;
    this.pageHeight = 792;
    this.margin = 36;
    this.contentWidth = this.pageWidth - (this.margin * 2);

    // Pre-calculate category selections and metrics for principal
    const { data: categoryDataP, metrics: metricsP } = this.calculateCategoryDataFor(this.profileP);
    this.categoryData = categoryDataP;
    this.overallMetrics = metricsP;

    // Extract profile scores (attribute-based: formality, warmth, etc.)
    // These come from calculateProfileFromSelections() in TasteExploration
    // Scale: 1-10 (native) - but LuXeBrief may send 1-100 scale in old format
    const extractScores = (profile) => {
      // FIRST: Try new nested format (profile.profile.scores or session.profile.scores)
      const scores = profile?.session?.profile?.scores || profile?.profile?.scores;
      if (scores && (scores.tradition !== undefined || scores.warmth !== undefined)) {
        console.log('[PDF-SCORES] Using nested profile scores (1-10 scale):', scores);
        return {
          formality: scores.formality || 5,
          warmth: scores.warmth || 5,
          drama: scores.drama || 5,
          tradition: scores.tradition || 5,
          openness: scores.openness || 5,
          art_focus: scores.art_focus || 5
        };
      }

      // SECOND: Try old LuXeBrief format (flat *Score properties at 1-100 scale)
      const oldProfile = profile?.profile;
      if (oldProfile && (oldProfile.warmthScore !== undefined || oldProfile.traditionScore !== undefined)) {
        console.log('[PDF-SCORES] Using old LuXeBrief format (1-100 scale), converting:', oldProfile);
        return {
          formality: oldProfile.formalityScore ? oldProfile.formalityScore / 10 : 5,
          warmth: oldProfile.warmthScore ? oldProfile.warmthScore / 10 : 5,
          drama: oldProfile.dramaScore ? oldProfile.dramaScore / 10 : 5,
          tradition: oldProfile.traditionScore ? oldProfile.traditionScore / 10 : 5,
          openness: oldProfile.opennessScore ? oldProfile.opennessScore / 10 : 5,
          art_focus: oldProfile.artFocusScore ? oldProfile.artFocusScore / 10 : 5
        };
      }

      // THIRD: Try even older format where profile IS the scores directly
      if (profile?.warmthScore !== undefined || profile?.traditionScore !== undefined) {
        console.log('[PDF-SCORES] Using direct profile scores format (1-100 scale), converting:', profile);
        return {
          formality: profile.formalityScore ? profile.formalityScore / 10 : 5,
          warmth: profile.warmthScore ? profile.warmthScore / 10 : 5,
          drama: profile.dramaScore ? profile.dramaScore / 10 : 5,
          tradition: profile.traditionScore ? profile.traditionScore / 10 : 5,
          openness: profile.opennessScore ? profile.opennessScore / 10 : 5,
          art_focus: profile.artFocusScore ? profile.artFocusScore / 10 : 5
        };
      }

      console.log('[PDF-SCORES] No profile scores found, using defaults');
      return {
        formality: 5,
        warmth: 5,
        drama: 5,
        tradition: 5,
        openness: 5,
        art_focus: 5
      };
    };
    this.profileScoresP = extractScores(this.profileP);

    // Calculate for secondary if exists
    this.categoryDataS = null;
    this.overallMetricsS = null;
    this.profileScoresS = null;
    this.hasPartnerData = false;

    if (this.profileS) {
      const { data: categoryDataS, metrics: metricsS } = this.calculateCategoryDataFor(this.profileS);
      // Check if secondary has any actual selections
      const hasSelections = Object.values(categoryDataS).some(cat => cat.hasSelection);
      if (hasSelections) {
        this.categoryDataS = categoryDataS;
        this.overallMetricsS = metricsS;
        this.profileScoresS = extractScores(this.profileS);
        this.hasPartnerData = true;
      }
    }

    // Pagination - adjust based on whether we have partner data
    this.currentPage = 1;
    this.totalPages = this.hasPartnerData ? 5 : 4;
  }

  calculateCategoryDataFor(profile) {
    const data = {};
    let totalStyleEra = 0;
    let totalMaterialComplexity = 0;
    let totalMoodPalette = 0;
    let count = 0;

    if (!profile) {
      console.log('[PDF-CALC] No profile provided, returning defaults');
      return {
        data: {},
        metrics: { styleEra: 2.5, materialComplexity: 2.5, moodPalette: 2.5, styleLabel: 'Transitional' }
      };
    }

    console.log('[PDF-CALC] Calculating category data for profile:', {
      hasSelections: !!profile.selections,
      selectionsType: Array.isArray(profile.selections) ? 'array' : typeof profile.selections,
      hasSession: !!profile.session,
      hasProfileScores: !!(profile.profile?.scores || profile.session?.profile?.scores)
    });

    CATEGORY_ORDER.forEach(cat => {
      const selection = getSelectionForCategory(profile, cat.id);
      if (selection) {
        const imageUrl = getSelectionImageUrl(selection.quadId, selection.positionIndex);
        const codes = extractCodesFromFilename(imageUrl);
        const metrics = getCategoryMetricsFromSelection(selection.quadId, selection.positionIndex);
        console.log('[PDF-CALC] Category', cat.id, 'found selection:', selection, 'metrics:', metrics);
        data[cat.id] = {
          ...cat,
          selection,
          metrics,
          asCode: codes?.as || 5,
          hasSelection: true
        };
        totalStyleEra += metrics.styleEra;
        totalMaterialComplexity += metrics.materialComplexity;
        totalMoodPalette += metrics.moodPalette;
        count++;
      } else {
        data[cat.id] = {
          ...cat,
          selection: null,
          metrics: { styleEra: 2.5, materialComplexity: 2.5, moodPalette: 2.5 },
          asCode: 5,
          hasSelection: false
        };
      }
    });

    console.log('[PDF-CALC] Found', count, 'categories with selections');

    // If we found selections, calculate from them
    if (count > 0) {
      const avgStyleEra = totalStyleEra / count;
      const metrics = {
        styleEra: avgStyleEra,
        materialComplexity: totalMaterialComplexity / count,
        moodPalette: totalMoodPalette / count,
        styleLabel: getStyleLabel(avgStyleEra)
      };
      console.log('[PDF-CALC] Calculated metrics from selections:', metrics);
      return { data, metrics };
    }

    // FALLBACK: If no selections found but we have profile scores, use those
    const scores = profile?.profile?.scores || profile?.session?.profile?.scores;
    if (scores && scores.tradition !== undefined) {
      // Convert tradition score (1-10) to styleEra (1-5)
      const styleEra = scores.tradition ? scores.tradition / 2 : 2.5;
      const metrics = {
        styleEra,
        materialComplexity: scores.formality ? scores.formality / 2 : 2.5,
        moodPalette: scores.warmth ? (10 - scores.warmth) / 2 + 1 : 2.5,
        styleLabel: getStyleLabel(styleEra)
      };
      console.log('[PDF-CALC] Using profile scores as fallback:', metrics);
      return { data, metrics };
    }

    // FALLBACK 2: Old LuXeBrief format (1-100 scale)
    const oldScores = profile?.profile;
    if (oldScores && (oldScores.traditionScore !== undefined || oldScores.warmthScore !== undefined)) {
      const styleEra = oldScores.traditionScore ? oldScores.traditionScore / 20 : 2.5;
      const metrics = {
        styleEra,
        materialComplexity: oldScores.formalityScore ? oldScores.formalityScore / 20 : 2.5,
        moodPalette: oldScores.warmthScore ? (100 - oldScores.warmthScore) / 20 + 1 : 2.5,
        styleLabel: getStyleLabel(styleEra)
      };
      console.log('[PDF-CALC] Using old LuXeBrief scores as fallback:', metrics);
      return { data, metrics };
    }

    console.log('[PDF-CALC] No data found, using defaults');
    return {
      data,
      metrics: { styleEra: 2.5, materialComplexity: 2.5, moodPalette: 2.5, styleLabel: 'Transitional' }
    };
  }

  // Calculate alignment score between partners (0-100%)
  // Uses the same formula as the dashboard (DesignIdentitySection.jsx)
  // Based on 3 DNA axes: styleEra (ct), materialComplexity (ml), moodPalette (mp)
  calculateAlignmentScore() {
    if (!this.hasPartnerData) return null;
    if (!this.overallMetrics || !this.overallMetricsS) return null;

    // Get metrics from principal and secondary (1-5 scale)
    const metricsP = this.overallMetrics;
    const metricsS = this.overallMetricsS;

    // Calculate differences on each DNA axis (same as dashboard)
    const ctDiff = Math.abs((metricsP.styleEra || 2.5) - (metricsS.styleEra || 2.5));
    const mlDiff = Math.abs((metricsP.materialComplexity || 2.5) - (metricsS.materialComplexity || 2.5));
    const mpDiff = Math.abs((metricsP.moodPalette || 2.5) - (metricsS.moodPalette || 2.5));

    // Average difference across 3 axes
    const avgDiff = (ctDiff + mlDiff + mpDiff) / 3;

    // Convert to percentage (same formula as dashboard)
    // Max difference on 1-5 scale is 4, so divide by 5 (scale range) to normalize
    const alignment = Math.max(0, Math.round(100 - (avgDiff / 5 * 100)));

    console.log('[PDF-ALIGNMENT] Calculated alignment:', {
      metricsP: { ct: metricsP.styleEra, ml: metricsP.materialComplexity, mp: metricsP.moodPalette },
      metricsS: { ct: metricsS.styleEra, ml: metricsS.materialComplexity, mp: metricsS.moodPalette },
      diffs: { ct: ctDiff, ml: mlDiff, mp: mpDiff },
      avgDiff,
      alignment
    });

    return alignment;
  }

  // Find significant divergences between partners
  findDivergences() {
    if (!this.hasPartnerData) return [];

    const divergences = [];

    CATEGORY_ORDER.forEach(cat => {
      const pData = this.categoryData[cat.id];
      const sData = this.categoryDataS[cat.id];

      if (pData?.hasSelection && sData?.hasSelection) {
        const diff = Math.abs(pData.asCode - sData.asCode);

        if (diff >= 3) {
          divergences.push({
            category: cat.name,
            categoryCode: cat.code,
            principalAS: pData.asCode,
            secondaryAS: sData.asCode,
            principalLabel: AS_LABELS[pData.asCode] || `AS${pData.asCode}`,
            secondaryLabel: AS_LABELS[sData.asCode] || `AS${sData.asCode}`,
            difference: diff,
            severity: diff >= 5 ? 'significant' : 'notable'
          });
        }
      }
    });

    return divergences;
  }

  async generate() {
    // Page 1: Cover/Overview
    this.addPage1Cover();

    // If we have partner data, add alignment analysis page
    if (this.hasPartnerData) {
      // Page 2: Partner Alignment Analysis
      this.doc.addPage();
      this.currentPage = 2;
      this.addPartnerAlignmentPage();

      // Page 3: Categories 1-4 (EA, LS, DS, KT)
      this.doc.addPage();
      this.currentPage = 3;
      await this.addSelectionsPage([0, 1, 2, 3]);

      // Page 4: Categories 5-8 (FA, PB, PBT, GB)
      this.doc.addPage();
      this.currentPage = 4;
      await this.addSelectionsPage([4, 5, 6, 7]);

      // Page 5: Category 9 (OL)
      this.doc.addPage();
      this.currentPage = 5;
      await this.addSelectionsPage([8]);
    } else {
      // No partner - original 4-page layout
      // Page 2: Categories 1-4 (EA, LS, DS, KT)
      this.doc.addPage();
      this.currentPage = 2;
      await this.addSelectionsPage([0, 1, 2, 3]);

      // Page 3: Categories 5-8 (FA, PB, PBT, GB)
      this.doc.addPage();
      this.currentPage = 3;
      await this.addSelectionsPage([4, 5, 6, 7]);

      // Page 4: Category 9 (OL)
      this.doc.addPage();
      this.currentPage = 4;
      await this.addSelectionsPage([8]);
    }

    return this.doc;
  }

  // Get client info from various sources
  getClientName() {
    // Use explicitly provided clientName first (for secondary/partner reports)
    if (this.options.clientName) {
      return this.options.clientName;
    }
    // Fall back to KYC data
    const kyc = this.kycData?.principal?.portfolioContext;
    if (kyc?.principalFirstName || kyc?.principalLastName) {
      return `${kyc.principalFirstName || ''} ${kyc.principalLastName || ''}`.trim();
    }
    return this.profileP.clientId || this.profileP.clientName || 'Client';
  }

  getProjectName() {
    return this.kycData?.principal?.projectParameters?.projectName || '';
  }

  getLocation() {
    const params = this.kycData?.principal?.projectParameters;
    if (params?.projectCity || params?.projectCountry) {
      return `${params.projectCity || ''}, ${params.projectCountry || ''}`.replace(/^, |, $/g, '');
    }
    return this.options.location || '';
  }

  getSecondaryName() {
    const kyc = this.kycData?.principal?.portfolioContext;
    if (kyc?.secondaryFirstName || kyc?.secondaryLastName) {
      return `${kyc.secondaryFirstName || ''} ${kyc.secondaryLastName || ''}`.trim();
    }
    return this.profileS?.clientId || 'Partner';
  }

  // Partner Alignment Analysis page
  addPartnerAlignmentPage() {
    let y = this.margin;

    // Title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Partner Alignment Analysis', this.margin, y);
    y += 25;

    // Subtitle with names
    const principalName = this.getClientName();
    const secondaryName = this.getSecondaryName();
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text(`Comparing design preferences: ${principalName} & ${secondaryName}`, this.margin, y);
    y += 30;

    // Overall Alignment Score
    const alignmentScore = this.calculateAlignmentScore();

    // Score box
    this.doc.setFillColor(CREAM.r, CREAM.g, CREAM.b);
    this.doc.roundedRect(this.margin, y, this.contentWidth, 60, 8, 8, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Overall Design Alignment', this.margin + 20, y + 25);

    // Score percentage
    this.doc.setFontSize(28);
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(`${alignmentScore || 0}%`, this.pageWidth - this.margin - 20, y + 35, { align: 'right' });

    // Score interpretation
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    const interpretation = alignmentScore >= 80 ? 'Strong alignment - minimal compromise needed' :
                          alignmentScore >= 60 ? 'Good alignment - some areas for discussion' :
                          alignmentScore >= 40 ? 'Moderate alignment - focused discussions recommended' :
                          'Significant divergence - detailed mediation advised';
    this.doc.text(interpretation, this.margin + 20, y + 45);

    y += 80;

    // DNA Axis Comparison section
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('DNA Axis Comparison', this.margin, y);
    y += 15;

    // Legend
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);

    // Principal legend dot
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.circle(this.margin + 5, y - 3, 4, 'F');
    this.doc.text(`P = ${principalName}`, this.margin + 15, y);

    // Secondary legend dot
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(this.margin + 150, y - 3, 4, 'F');
    this.doc.text(`S = ${secondaryName}`, this.margin + 160, y);

    y += 25;

    // Dual sliders
    const sliderWidth = this.contentWidth - 100;

    // Style Era dual slider
    y = this.drawDualSlider(this.margin, y, sliderWidth,
      this.overallMetrics.styleEra, this.overallMetricsS.styleEra,
      'Style Era', 'Contemporary', 'Traditional');
    y += 30;

    // Material Complexity dual slider
    y = this.drawDualSlider(this.margin, y, sliderWidth,
      this.overallMetrics.materialComplexity, this.overallMetricsS.materialComplexity,
      'Material Complexity', 'Minimal', 'Layered');
    y += 30;

    // Mood Palette dual slider
    y = this.drawDualSlider(this.margin, y, sliderWidth,
      this.overallMetrics.moodPalette, this.overallMetricsS.moodPalette,
      'Mood Palette', 'Warm', 'Cool');
    y += 40;

    // Flagged Divergences section
    const divergences = this.findDivergences();

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Flagged Divergences', this.margin, y);
    y += 8;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text('Categories where partners differ by 3+ style positions', this.margin, y);
    y += 20;

    if (divergences.length === 0) {
      // No divergences message
      this.doc.setFillColor(SUCCESS_GREEN.r, SUCCESS_GREEN.g, SUCCESS_GREEN.b);
      this.doc.roundedRect(this.margin, y, this.contentWidth, 40, 6, 6, 'F');
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
      this.doc.text('No significant divergences detected', this.margin + 20, y + 25);
    } else {
      // List divergences
      divergences.forEach((div, index) => {
        if (y > this.pageHeight - 100) return; // Don't overflow page

        const cardHeight = 55;
        const severityColor = div.severity === 'significant'
          ? { r: 220, g: 38, b: 38 }  // Red
          : { r: 234, g: 179, b: 8 };  // Yellow/Orange

        // Card background
        this.doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
        this.doc.roundedRect(this.margin, y, this.contentWidth, cardHeight, 6, 6, 'F');

        // Severity indicator bar
        this.doc.setFillColor(severityColor.r, severityColor.g, severityColor.b);
        this.doc.rect(this.margin, y, 4, cardHeight, 'F');

        // Category name
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
        this.doc.text(div.category, this.margin + 15, y + 18);

        // Positions apart badge
        this.doc.setFillColor(severityColor.r, severityColor.g, severityColor.b);
        this.doc.roundedRect(this.pageWidth - this.margin - 80, y + 8, 70, 18, 9, 9, 'F');
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
        this.doc.text(`${div.difference} positions`, this.pageWidth - this.margin - 45, y + 20, { align: 'center' });

        // Style labels
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
        this.doc.text(`${principalName}: ${div.principalLabel}`, this.margin + 15, y + 32);
        this.doc.text(`${secondaryName}: ${div.secondaryLabel}`, this.margin + 15, y + 44);

        y += cardHeight + 10;
      });
    }

    this.addPageFooter();
  }

  // Draw dual-marker slider showing both P and S positions
  drawDualSlider(x, y, width, valueP, valueS, label, leftLabel, rightLabel) {
    const trackHeight = 10;
    const normalizedP = Math.max(1, Math.min(5, valueP));
    const normalizedS = Math.max(1, Math.min(5, valueS));
    const posP = ((normalizedP - 1) / 4) * width;
    const posS = ((normalizedS - 1) / 4) * width;

    // Label
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text(label, x, y);
    y += 12;

    // Track background
    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(x, y, width, trackHeight, 5, 5, 'F');

    // Principal marker (Gold) - circle with P
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.circle(x + posP, y + trackHeight / 2, 8, 'F');
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('P', x + posP, y + trackHeight / 2 + 2.5, { align: 'center' });

    // Secondary marker (Navy) - circle with S
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(x + posS, y + trackHeight / 2, 8, 'F');
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('S', x + posS, y + trackHeight / 2 + 2.5, { align: 'center' });

    // Endpoint labels
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text(leftLabel, x, y + trackHeight + 12);
    this.doc.text(rightLabel, x + width, y + trackHeight + 12, { align: 'right' });

    return y + trackHeight + 20;
  }

  addPageFooter() {
    const footerY = this.pageHeight - 25;

    this.doc.setFontSize(8);
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text(formatDate(new Date()), this.margin, footerY);
    this.doc.text(
      `Page ${this.currentPage} of ${this.totalPages}`,
      this.pageWidth - this.margin,
      footerY,
      { align: 'right' }
    );
  }

  drawSlider5(x, y, width, value, label, leftLabel = '', rightLabel = '') {
    const trackHeight = 8;
    const normalizedValue = Math.max(1, Math.min(5, value));
    const fillWidth = ((normalizedValue - 1) / 4) * width;

    // Label
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text(label, x, y);

    // Value
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(normalizedValue.toFixed(1), x + width + 10, y);

    y += 6;

    // Track background
    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(x, y, width, trackHeight, 4, 4, 'F');

    // Filled portion
    if (fillWidth > 0) {
      this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
      this.doc.roundedRect(x, y, fillWidth, trackHeight, 4, 4, 'F');
    }

    // Marker
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(x + fillWidth, y + trackHeight / 2, 6, 'F');

    // Endpoint labels below slider
    if (leftLabel || rightLabel) {
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      if (leftLabel) {
        this.doc.text(leftLabel, x, y + trackHeight + 10);
      }
      if (rightLabel) {
        this.doc.text(rightLabel, x + width, y + trackHeight + 10, { align: 'right' });
      }
      return y + trackHeight + 18;
    }

    return y + trackHeight + 8;
  }

  addPage1Cover() {
    let y = 0;

    // Navy header bar
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');

    // Header text
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('N4S Your Design Profile', this.margin, 32);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Taste Exploration', this.pageWidth / 2, 32, { align: 'center' });

    y = 65;

    // Client info line
    const clientName = this.getClientName();
    const projectName = this.getProjectName();
    const location = this.getLocation();

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    // Build info parts
    const clientPrefix = 'Client:  ';
    let infoText = `${clientPrefix}${clientName}`;
    if (projectName) infoText += `     Project: ${projectName}`;
    if (location) infoText += `     Location: ${location}`;
    this.doc.text(infoText, this.margin, y);

    // If partner exists, show secondary name on next line aligned under principal
    if (this.hasPartnerData) {
      const secondaryName = this.getSecondaryName();
      y += 14;
      // Measure "Client:  " width to align secondary name under principal name
      const prefixWidth = this.doc.getTextWidth(clientPrefix);
      this.doc.text(secondaryName, this.margin + prefixWidth, y);
    }

    y += 20;

    // Cream banner with style label
    this.doc.setFillColor(CREAM.r, CREAM.g, CREAM.b);
    this.doc.roundedRect(this.margin, y, this.contentWidth, 50, 6, 6, 'F');

    this.doc.setFontSize(9);
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text('Your overall design aesthetic', this.margin + 12, y + 18);

    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(this.overallMetrics.styleLabel, this.pageWidth / 2, y + 35, { align: 'center' });

    y += 65;

    // Design DNA: Style Axes section
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Design DNA: Style Axes', this.margin, y);
    y += 25;

    const sliderWidth = 200;
    y = this.drawSlider5(this.margin, y, sliderWidth, this.overallMetrics.styleEra, 'Style Era', 'Contemporary', 'Traditional');
    y += 5;
    y = this.drawSlider5(this.margin, y, sliderWidth, this.overallMetrics.materialComplexity, 'Material Complexity', 'Minimal', 'Layered');
    y += 5;
    y = this.drawSlider5(this.margin, y, sliderWidth, this.overallMetrics.moodPalette, 'Mood Palette', 'Warm', 'Cool');

    y += 15;

    // Style Preferences section (two columns)
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Style Preferences', this.margin, y);
    y += 18;

    const colWidth = this.contentWidth / 2 - 20;

    // Regional Influences
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text('Regional Influences', this.margin, y);
    this.doc.text('Material Preferences', this.margin + colWidth + 40, y);
    y += 14;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    const regionItems = ['European Contemporary', 'California Modern', 'Mediterranean'];
    const materialItems = ['Natural Stone', 'Warm Woods', 'Organic Textures'];

    regionItems.forEach((item, i) => {
      this.doc.text(`• ${item}`, this.margin, y + (i * 12));
    });
    materialItems.forEach((item, i) => {
      this.doc.text(`• ${item}`, this.margin + colWidth + 40, y + (i * 12));
    });

    y += 50;

    // Design Preferences card
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.roundedRect(this.margin, y, this.contentWidth, 24, 4, 4, 'F');
    this.doc.rect(this.margin, y + 16, this.contentWidth, 8, 'F');

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('Design Preferences', this.margin + 10, y + 16);

    y += 28;

    // Card body
    this.doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
    this.doc.roundedRect(this.margin, y, this.contentWidth, 180, 4, 4, 'F');

    // Top row: Style Direction, Formality, Mood
    const boxY = y + 10;
    const boxWidth = (this.contentWidth - 30) / 3;

    this.doc.setFontSize(9);
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text('Style Direction', this.margin + 15, boxY + 12);
    this.doc.text('Formality', this.margin + boxWidth + 20, boxY + 12);
    this.doc.text('Mood', this.margin + boxWidth * 2 + 25, boxY + 12);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(this.overallMetrics.styleLabel, this.margin + 15, boxY + 28);
    this.doc.text('Relaxed', this.margin + boxWidth + 20, boxY + 28);
    this.doc.text('Warm', this.margin + boxWidth * 2 + 25, boxY + 28);

    // 2x3 DNA metric boxes
    const metricStartY = boxY + 50;
    const metricBoxWidth = (this.contentWidth - 40) / 3;
    const metricBoxHeight = 50;

    const dnaMetrics = [
      // Tradition: prefer profile scores (1-10), fallback to styleEra converted to 1-10
      { label: 'Tradition', value: this.profileScoresP.tradition || ((this.overallMetrics.styleEra - 1) / 4 * 9 + 1) },
      { label: 'Formality', value: this.profileScoresP.formality },
      { label: 'Warmth', value: this.profileScoresP.warmth },
      { label: 'Drama', value: this.profileScoresP.drama },
      { label: 'Openness', value: this.profileScoresP.openness },
      { label: 'Art Focus', value: this.profileScoresP.art_focus }
    ];

    dnaMetrics.forEach((metric, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bx = this.margin + 10 + col * (metricBoxWidth + 10);
      const by = metricStartY + row * (metricBoxHeight + 10);

      this.doc.setFillColor(WHITE.r, WHITE.g, WHITE.b);
      this.doc.roundedRect(bx, by, metricBoxWidth, metricBoxHeight, 4, 4, 'F');

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
      this.doc.text(metric.label, bx + 8, by + 14);

      this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
      this.doc.text(metric.value.toFixed(1), bx + metricBoxWidth - 25, by + 14);

      // Mini slider - values are 1-10 scale
      const sliderY = by + 28;
      const sliderW = metricBoxWidth - 16;
      const fillW = ((metric.value - 1) / 9) * sliderW;

      this.doc.setFillColor(226, 232, 240);
      this.doc.roundedRect(bx + 8, sliderY, sliderW, 6, 3, 3, 'F');
      this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
      this.doc.roundedRect(bx + 8, sliderY, fillW, 6, 3, 3, 'F');
      this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.circle(bx + 8 + fillW, sliderY + 3, 4, 'F');
    });

    y = metricStartY + 130;

    // Partner note if not completed
    if (this.profileS === null && this.options.partnerName) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(221, 107, 32); // Warning orange
      this.doc.text(`Note: ${this.options.partnerName} has not completed Taste Exploration...`, this.margin, y);
      y += 20;
    }

    // Bottom section: 4 MVP cards
    y += 10;
    const cardWidth = (this.contentWidth - 30) / 4;
    const cardHeight = 70;

    const mvpCards = [
      { title: 'Property Configuration', items: this.getPropertyConfigItems() },
      { title: 'Household Composition', items: this.getHouseholdItems() },
      { title: 'Lifestyle', items: this.getLifestyleItems() },
      { title: 'Wellness Program', items: this.getWellnessItems() }
    ];

    mvpCards.forEach((card, i) => {
      const cx = this.margin + i * (cardWidth + 10);

      this.doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
      this.doc.roundedRect(cx, y, cardWidth, cardHeight, 4, 4, 'F');

      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.text(card.title, cx + 6, y + 14);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7);
      this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
      card.items.slice(0, 3).forEach((item, j) => {
        this.doc.text(item, cx + 6, y + 28 + j * 12);
      });
    });

    y += cardHeight + 15;

    // Selected Amenities as green chips
    const amenities = this.getSelectedAmenities();
    if (amenities.length > 0) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.text('Selected Amenities', this.margin, y);
      y += 14;

      let chipX = this.margin;
      amenities.forEach(amenity => {
        const chipWidth = this.doc.getTextWidth(amenity) + 16;
        if (chipX + chipWidth > this.pageWidth - this.margin) {
          chipX = this.margin;
          y += 20;
        }

        this.doc.setFillColor(SUCCESS_GREEN.r, SUCCESS_GREEN.g, SUCCESS_GREEN.b);
        this.doc.roundedRect(chipX, y - 10, chipWidth, 16, 8, 8, 'F');
        this.doc.setFontSize(8);
        this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
        this.doc.text(amenity, chipX + 8, y);

        chipX += chipWidth + 8;
      });
    }

    this.addPageFooter();
  }

  async addSelectionsPage(categoryIndices) {
    // Light blue-gray page background (#F8FAFC)
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    let y = this.margin;

    // Title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('Your Selections', this.margin, y);
    y += 14;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text('The images you selected during Taste Exploration', this.margin, y);
    y += 25;

    // Calculate card dimensions for 2x2 grid
    const cardWidth = (this.contentWidth - 20) / 2;
    const imageHeight = cardWidth * 0.625; // 16:10 aspect ratio
    const cardHeight = imageHeight + 130; // Image + title bar + padding + sliders with labels

    // Handle single card centering (for page 4 with only OL)
    const isSingleCard = categoryIndices.length === 1;

    for (let i = 0; i < categoryIndices.length; i++) {
      const catIndex = categoryIndices[i];
      if (catIndex >= CATEGORY_ORDER.length) continue;

      const cat = CATEGORY_ORDER[catIndex];
      const catData = this.categoryData[cat.id];

      let col, row, cardX, cardY;

      if (isSingleCard) {
        // Center single card horizontally
        cardX = (this.pageWidth - cardWidth) / 2;
        cardY = y;
      } else {
        col = i % 2;
        row = Math.floor(i / 2);
        cardX = this.margin + col * (cardWidth + 20);
        cardY = y + row * (cardHeight + 20);
      }

      // Card background
      this.doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
      this.doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'F');

      // Image area
      this.doc.setFillColor(226, 232, 240);
      this.doc.roundedRect(cardX + 8, cardY + 8, cardWidth - 16, imageHeight, 4, 4, 'F');

      // Try to load image
      if (catData.selection) {
        const imageUrl = getSelectionImageUrl(catData.selection.quadId, catData.selection.positionIndex);
        if (imageUrl) {
          try {
            const imgData = await loadImageAsBase64(imageUrl);
            if (imgData) {
              this.doc.addImage(imgData, 'JPEG', cardX + 8, cardY + 8, cardWidth - 16, imageHeight);
            }
          } catch (e) {
            // Keep placeholder
          }
        }
      }

      // Navy title bar below image
      const titleBarY = cardY + 8 + imageHeight;
      this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.rect(cardX + 8, titleBarY, cardWidth - 16, 24, 'F');

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
      this.doc.text(cat.name, cardX + cardWidth / 2, titleBarY + 16, { align: 'center' });

      // Design DNA subtitle (with extra padding from title bar)
      let sliderY = titleBarY + 42;
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.text('Design DNA', cardX + 12, sliderY);
      sliderY += 12;

      // 3 sliders with per-category values
      const sliderWidth = cardWidth - 60;
      const metrics = catData.metrics;

      // Style Era
      this.drawCategorySlider(cardX + 12, sliderY, sliderWidth, metrics.styleEra, 'Style Era', 'Contemporary', 'Traditional');
      sliderY += 24;

      // Material Complexity
      this.drawCategorySlider(cardX + 12, sliderY, sliderWidth, metrics.materialComplexity, 'Material Complexity', 'Minimal', 'Layered');
      sliderY += 24;

      // Mood Palette
      this.drawCategorySlider(cardX + 12, sliderY, sliderWidth, metrics.moodPalette, 'Mood Palette', 'Warm', 'Cool');
    }

    this.addPageFooter();
  }

  drawCategorySlider(x, y, width, value, label, leftLabel = '', rightLabel = '') {
    const normalizedValue = Math.max(1, Math.min(5, value));
    const fillWidth = ((normalizedValue - 1) / 4) * width;

    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text(label, x, y);

    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(normalizedValue.toFixed(1), x + width + 8, y);

    const trackY = y + 4;
    this.doc.setFillColor(226, 232, 240);
    this.doc.roundedRect(x, trackY, width, 4, 2, 2, 'F');

    if (fillWidth > 0) {
      this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
      this.doc.roundedRect(x, trackY, fillWidth, 4, 2, 2, 'F');
    }

    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.circle(x + fillWidth, trackY + 2, 3, 'F');

    // Endpoint labels below slider
    if (leftLabel || rightLabel) {
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      if (leftLabel) {
        this.doc.text(leftLabel, x, trackY + 12);
      }
      if (rightLabel) {
        this.doc.text(rightLabel, x + width, trackY + 12, { align: 'right' });
      }
    }
  }

  // Helper methods to get MVP data
  getPropertyConfigItems() {
    const params = this.kycData?.principal?.projectParameters;
    if (!params) return ['No data'];
    return [
      params.targetGSF ? `${params.targetGSF.toLocaleString()} SF` : '',
      params.bedroomCount ? `${params.bedroomCount} Bedrooms` : '',
      params.bathroomCount ? `${params.bathroomCount} Bathrooms` : ''
    ].filter(Boolean);
  }

  getHouseholdItems() {
    const family = this.kycData?.principal?.familyHousehold;
    if (!family) return ['No data'];
    const items = [];
    // Count family members
    if (family.familyMembers && family.familyMembers.length > 0) {
      items.push(`${family.familyMembers.length} Family Members`);
      // Count children (roles: child, young-child, teenager)
      const children = family.familyMembers.filter(m =>
        ['child', 'young-child', 'teenager'].includes(m.role)
      );
      if (children.length > 0) items.push(`${children.length} Children`);
    }
    // Staff info
    if (family.staffingLevel && family.staffingLevel !== 'none') {
      const staffLabel = family.staffingLevel === 'live_in'
        ? `${family.liveInStaff || 1} Live-in Staff`
        : family.staffingLevel === 'full_time' ? 'Full-Time Staff' : 'Part-Time Staff';
      items.push(staffLabel);
    }
    if (family.pets) items.push('Has Pets');
    return items.length > 0 ? items : ['No data'];
  }

  getLifestyleItems() {
    const lifestyle = this.kycData?.principal?.lifestyleLiving;
    if (!lifestyle) return ['No data'];
    const items = [];
    // Entertaining style with proper label
    if (lifestyle.entertainingStyle) {
      const styleLabels = { formal: 'Formal Entertaining', casual: 'Casual Entertaining', both: 'Both Formal & Casual' };
      items.push(styleLabels[lifestyle.entertainingStyle] || lifestyle.entertainingStyle);
    }
    if (lifestyle.entertainingFrequency) {
      const freqLabels = { rarely: 'Entertains Rarely', monthly: 'Entertains Monthly', weekly: 'Entertains Weekly', daily: 'Entertains Daily' };
      items.push(freqLabels[lifestyle.entertainingFrequency] || '');
    }
    // Work from home
    if (lifestyle.workFromHome && lifestyle.workFromHome !== 'never') {
      const wfhLabels = { sometimes: 'WFH 1-2 days', often: 'WFH 3-4 days', always: 'Full Remote' };
      items.push(wfhLabels[lifestyle.workFromHome] || 'Works from Home');
    }
    return items.length > 0 ? items : ['No data'];
  }

  getWellnessItems() {
    const lifestyle = this.kycData?.principal?.lifestyleLiving;
    if (!lifestyle?.wellnessPriorities || lifestyle.wellnessPriorities.length === 0) return ['No data'];
    // Map wellness codes to labels
    const wellnessLabels = {
      gym: 'Home Gym', pool: 'Pool', spa: 'Spa/Sauna', yoga: 'Yoga Studio',
      massage: 'Massage Room', meditation: 'Meditation Space', 'cold-plunge': 'Cold Plunge'
    };
    return lifestyle.wellnessPriorities.slice(0, 3).map(w => wellnessLabels[w] || w);
  }

  getSelectedAmenities() {
    const space = this.kycData?.principal?.spaceRequirements;
    if (!space?.amenities) return [];
    return space.amenities.slice(0, 6);
  }

  download(filename, clientName) {
    const displayName = clientName || this.getClientName();
    const name = filename || `N4S-Design-Profile-${displayName.replace(/\s+/g, '-')}.pdf`;
    this.doc.save(name);
  }

  openInNewTab() {
    const blob = this.doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  getBlob() {
    return this.doc.output('blob');
  }

  getBase64() {
    return this.doc.output('datauristring');
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export async function downloadTasteReport(profileP, profileS = null, options = {}, clientName = null) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  generator.download(null, clientName);
}

export async function viewTasteReport(profileP, profileS = null, options = {}) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  generator.openInNewTab();
}

export async function getTasteReportBlob(profileP, profileS = null, options = {}) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  return generator.getBlob();
}

export default TasteReportGenerator;
