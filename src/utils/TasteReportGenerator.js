// ============================================
// N4S TASTE PROFILE REPORT GENERATOR
// PDF Generation using jsPDF
// Version: 3.0 - New Design Specifications
// ============================================

import jsPDF from 'jspdf';
import { quads, categories as quadCategories } from '../data/tasteQuads';

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
  const flatSelections = profile.selections || profile.session?.selections || {};
  const categoryQuads = quads.filter(q => q.category === categoryId);

  for (const quad of categoryQuads) {
    const sel = flatSelections[quad.quadId];
    if (sel && sel.favorites && sel.favorites.length > 0) {
      return { quadId: quad.quadId, positionIndex: sel.favorites[0] };
    }
  }

  // Fallback to nested structure
  const nestedSelections = profile.session?.progress?.[categoryId]?.selections || [];
  for (const sel of nestedSelections) {
    if (sel.selectedIndex >= 0 && sel.selectedIndex <= 3) {
      return { quadId: sel.quadId, positionIndex: sel.selectedIndex };
    }
  }

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

    // Pagination
    this.currentPage = 1;
    this.totalPages = 4;

    // Pre-calculate all category selections and metrics
    this.categoryData = this.calculateAllCategoryData();
  }

  calculateAllCategoryData() {
    const data = {};
    let totalStyleEra = 0;
    let totalMaterialComplexity = 0;
    let totalMoodPalette = 0;
    let count = 0;

    CATEGORY_ORDER.forEach(cat => {
      const selection = getSelectionForCategory(this.profileP, cat.id);
      if (selection) {
        const metrics = getCategoryMetricsFromSelection(selection.quadId, selection.positionIndex);
        data[cat.id] = {
          ...cat,
          selection,
          metrics,
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
          hasSelection: false
        };
      }
    });

    // Calculate overall averages
    this.overallMetrics = count > 0 ? {
      styleEra: totalStyleEra / count,
      materialComplexity: totalMaterialComplexity / count,
      moodPalette: totalMoodPalette / count,
      styleLabel: getStyleLabel(totalStyleEra / count)
    } : {
      styleEra: 2.5,
      materialComplexity: 2.5,
      moodPalette: 2.5,
      styleLabel: 'Transitional'
    };

    return data;
  }

  async generate() {
    // Page 1: Cover/Overview
    this.addPage1Cover();

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

    return this.doc;
  }

  // Get client info from various sources
  getClientName() {
    const kyc = this.kycData?.principal?.portfolioContext;
    if (kyc?.firstName || kyc?.lastName) {
      return `${kyc.firstName || ''} ${kyc.lastName || ''}`.trim();
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

  drawSlider5(x, y, width, value, label) {
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
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    const clientName = this.getClientName();
    const projectName = this.getProjectName();
    const location = this.getLocation();

    let infoText = `Client: ${clientName}`;
    if (projectName) infoText += `    Project: ${projectName}`;
    if (location) infoText += `    Location: ${location}`;
    this.doc.text(infoText, this.margin, y);

    y += 25;

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
    y = this.drawSlider5(this.margin, y, sliderWidth, this.overallMetrics.styleEra, 'Style Era');
    y += 5;
    y = this.drawSlider5(this.margin, y, sliderWidth, this.overallMetrics.materialComplexity, 'Material Complexity');
    y += 5;
    y = this.drawSlider5(this.margin, y, sliderWidth, this.overallMetrics.moodPalette, 'Mood Palette');

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
      { label: 'Tradition', value: this.overallMetrics.styleEra },
      { label: 'Formality', value: 2.8 },
      { label: 'Warmth', value: 3.5 },
      { label: 'Drama', value: 2.2 },
      { label: 'Openness', value: 3.8 },
      { label: 'Art Focus', value: 3.0 }
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

      // Mini slider
      const sliderY = by + 28;
      const sliderW = metricBoxWidth - 16;
      const fillW = ((metric.value - 1) / 4) * sliderW;

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
    const cardHeight = imageHeight + 100; // Image + title bar + sliders

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

      // Design DNA subtitle
      let sliderY = titleBarY + 32;
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.text('Design DNA', cardX + 12, sliderY);
      sliderY += 12;

      // 3 sliders with per-category values
      const sliderWidth = cardWidth - 60;
      const metrics = catData.metrics;

      // Style Era
      this.drawCategorySlider(cardX + 12, sliderY, sliderWidth, metrics.styleEra, 'Style Era');
      sliderY += 18;

      // Material Complexity
      this.drawCategorySlider(cardX + 12, sliderY, sliderWidth, metrics.materialComplexity, 'Material Complexity');
      sliderY += 18;

      // Mood Palette
      this.drawCategorySlider(cardX + 12, sliderY, sliderWidth, metrics.moodPalette, 'Mood Palette');
    }

    this.addPageFooter();
  }

  drawCategorySlider(x, y, width, value, label) {
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
    return [
      family.householdSize ? `${family.householdSize} People` : '',
      family.childrenCount ? `${family.childrenCount} Children` : '',
      family.staffCount ? `${family.staffCount} Staff` : ''
    ].filter(Boolean);
  }

  getLifestyleItems() {
    const lifestyle = this.kycData?.principal?.lifestyleLiving;
    if (!lifestyle) return ['No data'];
    return [
      lifestyle.entertainingStyle || '',
      lifestyle.cookingLevel || '',
      lifestyle.workFromHome ? 'Works from Home' : ''
    ].filter(Boolean);
  }

  getWellnessItems() {
    const wellness = this.kycData?.principal?.lifestyleLiving;
    if (!wellness) return ['No data'];
    return [
      wellness.fitnessLevel || '',
      wellness.spaAmenities ? 'Spa Amenities' : '',
      wellness.meditationSpace ? 'Meditation Space' : ''
    ].filter(Boolean);
  }

  getSelectedAmenities() {
    const space = this.kycData?.principal?.spaceRequirements;
    if (!space?.amenities) return [];
    return space.amenities.slice(0, 6);
  }

  download(filename) {
    const name = filename || `N4S-Design-Profile-${this.getClientName().replace(/\s+/g, '-')}.pdf`;
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

export async function downloadTasteReport(profileP, profileS = null, options = {}) {
  const generator = new TasteReportGenerator(profileP, profileS, options);
  await generator.generate();
  generator.download();
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
