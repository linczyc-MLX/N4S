// ============================================
// N4S FYI SPACE PROGRAM REPORT GENERATOR
// PDF Generation using jsPDF
// Version: 3.0 - Multi-structure, Level+Zone format
// Updated: February 5, 2026
// ============================================

import jsPDF from 'jspdf';
import { zones } from '../../../shared/space-registry';

// ============================================
// CONSTANTS (N4S Brand Guide compliant)
// ============================================

// N4S Brand Colors (RGB values for jsPDF)
const NAVY = { r: 30, g: 58, b: 95 };           // #1e3a5f
const GOLD = { r: 201, g: 162, b: 39 };         // #c9a227
const BACKGROUND = { r: 250, g: 250, b: 248 };  // #fafaf8
const TABLE_HEADER = { r: 245, g: 240, b: 232 }; // #f5f0e8 - per brand guide
const LIGHT_GRAY = { r: 107, g: 107, b: 107 };  // #6b6b6b - text muted
const DARK_TEXT = { r: 26, g: 26, b: 26 };      // #1a1a1a - primary text
const WHITE = { r: 255, g: 255, b: 255 };
const SUCCESS_GREEN = { r: 46, g: 125, b: 50 }; // #2e7d32
const ERROR_RED = { r: 211, g: 47, b: 47 };     // #d32f2f
const BORDER = { r: 229, g: 229, b: 224 };      // #e5e5e0

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatNumber(num) {
  return num.toLocaleString();
}

// ============================================
// FYI REPORT GENERATOR CLASS
// ============================================

export class FYIReportGenerator {
  constructor(data, mode = 'full') {
    this.data = data;
    this.mode = mode; // 'full' (Level+Zone), 'zone', or 'level'
    this.doc = null;

    // Page dimensions (letter size in points)
    this.pageWidth = 612;
    this.pageHeight = 792;
    this.margin = 40;
    this.contentWidth = this.pageWidth - (this.margin * 2);

    // Tighter spacing per brand guide - limit white space
    this.sectionGap = 15;  // Reduced from 20
    this.rowHeight = 12;   // Compact rows

    // Pagination
    this.currentPage = 1;
    this.totalPages = 1;
    this.y = 0;
  }

  async generate() {
    this.doc = new jsPDF('p', 'pt', 'letter');

    // Generate report content (without footers)
    this.addHeader();
    this.addClientInfo();
    this.addSummaryBox();

    // FULL MODE: Level view first, then Zone view (matching FYI UI)
    if (this.mode === 'full') {
      this.addSpacesByLevel();
      this.checkPageBreak(100);
      this.addSpacesByZone();
    } else if (this.mode === 'level') {
      this.addSpacesByLevel();
    } else {
      this.addSpacesByZone();
    }

    // Calculate total pages
    this.totalPages = this.currentPage;

    // Add footers to all pages
    this.addAllFooters();

    return this.doc;
  }

  calculateTotalPages() {
    // This will be updated after rendering is complete
    // Return 1 as placeholder - actual count happens in generate()
    return 1;
  }

  // ============================================
  // HEADER
  // ============================================

  addHeader() {
    this.y = 0;

    // Navy header bar (full width)
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');

    // Left text: "N4S Space Program"
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('N4S Space Program', this.margin, 32);

    // Right text: "FYI Report" in gold
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FYI Report', this.pageWidth - this.margin, 32, { align: 'right' });

    this.y = 65;
  }

  // ============================================
  // CLIENT INFO
  // ============================================

  addClientInfo() {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    let infoText = '';
    if (this.data.projectName) {
      infoText += `Project: ${this.data.projectName}`;
    }
    if (this.data.clientName) {
      if (infoText) infoText += '     ';
      infoText += `Client: ${this.data.clientName}`;
    }

    if (infoText) {
      this.doc.text(infoText, this.margin, this.y);
      this.y += 12;
    }

    // Generated date
    this.doc.setFontSize(9);
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text(`Generated: ${this.data.generatedAt}`, this.margin, this.y);
    this.y += 25;
  }

  // ============================================
  // SUMMARY BOX
  // ============================================

  addSummaryBox() {
    // Check if we have multiple structures
    const hasGuestHouse = this.data.structures?.guestHouse?.enabled;
    const hasPoolHouse = this.data.structures?.poolHouse?.enabled;
    const hasMultiStructure = hasGuestHouse || hasPoolHouse;

    const boxHeight = hasMultiStructure ? 145 : 100; // Tighter height
    const boxY = this.y;

    // Background with gold left border
    this.doc.setFillColor(BACKGROUND.r, BACKGROUND.g, BACKGROUND.b);
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxHeight, 4, 4, 'F');

    // Gold left border (4px)
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.rect(this.margin, boxY, 4, boxHeight, 'F');

    // Border
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxHeight, 4, 4, 'S');

    // Three columns for compact layout
    const col1X = this.margin + 15;
    const col2X = this.margin + 180;
    const col3X = this.margin + 360;
    let rowY = boxY + 16;

    // Column 1: Program Settings
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('PROGRAM SETTINGS', col1X, rowY);
    rowY += 12;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    const settings = this.data.settings;
    this.addSummaryRow(col1X, rowY, 'Target SF', formatNumber(settings.targetSF), 140);
    rowY += 11;
    this.addSummaryRow(col1X, rowY, 'Program Tier', settings.programTier.toUpperCase(), 140);
    rowY += 11;
    this.addSummaryRow(col1X, rowY, 'Size Delta', `±${settings.deltaPct}%`, 140);
    rowY += 11;
    this.addSummaryRow(col1X, rowY, 'Basement', settings.hasBasement ? 'Yes' : 'No', 140);

    // Column 2: Main Residence Totals
    rowY = boxY + 16;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('MAIN RESIDENCE', col2X, rowY);
    rowY += 12;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    const totals = this.data.totals;
    const mainTotal = this.data.structures?.main?.total || totals.total;
    const mainNet = this.data.structures?.main?.net || totals.net;
    const mainCirc = this.data.structures?.main?.circulation || totals.circulation;

    this.addSummaryRow(col2X, rowY, 'Net Program', `${formatNumber(mainNet)} SF`, 150);
    rowY += 11;
    this.addSummaryRow(col2X, rowY, `Circulation (${totals.circulationPct}%)`, `${formatNumber(mainCirc)} SF`, 150);
    rowY += 11;
    this.doc.setFont('helvetica', 'bold');
    this.addSummaryRow(col2X, rowY, 'Total', `${formatNumber(mainTotal)} SF`, 150);

    // Column 3: Grand Total + Delta
    rowY = boxY + 16;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('GRAND TOTAL', col3X, rowY);
    rowY += 12;

    // Calculate grand total across all structures
    const ghTotal = hasGuestHouse ? (this.data.structures.guestHouse.total || 0) : 0;
    const phTotal = hasPoolHouse ? (this.data.structures.poolHouse.total || 0) : 0;
    const grandTotal = mainTotal + ghTotal + phTotal;
    const delta = grandTotal - settings.targetSF;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(`${formatNumber(grandTotal)} SF`, col3X, rowY + 4);
    rowY += 18;

    // Delta from target (colored)
    this.doc.setFontSize(10);
    const deltaText = `${delta >= 0 ? '+' : ''}${formatNumber(delta)} SF from target`;
    if (delta > 0) {
      this.doc.setTextColor(ERROR_RED.r, ERROR_RED.g, ERROR_RED.b);
    } else if (delta < 0) {
      this.doc.setTextColor(SUCCESS_GREEN.r, SUCCESS_GREEN.g, SUCCESS_GREEN.b);
    } else {
      this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    }
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(deltaText, col3X, rowY);

    // Structure Breakdown row (if multiple structures)
    if (hasMultiStructure) {
      rowY = boxY + 90;

      // Divider line
      this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin + 10, rowY, this.margin + this.contentWidth - 10, rowY);
      rowY += 12;

      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      this.doc.text('STRUCTURE BREAKDOWN:', col1X, rowY);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

      let structX = col1X + 120;
      this.doc.text(`Main: ${formatNumber(mainTotal)} SF`, structX, rowY);
      structX += 100;

      if (hasGuestHouse) {
        this.doc.text(`Guest House: ${formatNumber(ghTotal)} SF`, structX, rowY);
        structX += 120;
      }
      if (hasPoolHouse) {
        this.doc.text(`Pool House: ${formatNumber(phTotal)} SF`, structX, rowY);
      }
    }

    // Outdoor total if applicable
    if (totals.outdoorTotal > 0) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      this.doc.text(`+ ${formatNumber(totals.outdoorTotal)} SF outdoor (not conditioned)`, col3X, boxY + boxHeight - 10);
    }

    this.y = boxY + boxHeight + this.sectionGap;
  }

  addSummaryRow(x, y, label, value, width = 180) {
    this.doc.text(label, x, y);
    this.doc.text(String(value), x + width, y, { align: 'right' });
  }

  // ============================================
  // SPACES BY ZONE
  // ============================================

  addSpacesByZone() {
    // Part 2 header
    this.addSectionHeader('PART 2: SPACES BY ZONE');

    // Main Residence zones
    this.addStructureSubheader('Main Residence');
    this.data.zonesData.forEach(zone => {
      if (zone.spaces.length === 0) return;
      this.checkPageBreak(60);
      this.addZoneSection(zone);
    });

    // Guest House (if enabled)
    if (this.data.structures?.guestHouse?.enabled && this.data.guestHouseZonesData?.length > 0) {
      const ghHasSpaces = this.data.guestHouseZonesData.some(z => z.spaces.length > 0);
      if (ghHasSpaces) {
        this.checkPageBreak(80);
        this.addStructureSubheader('Guest House');
        this.data.guestHouseZonesData.forEach(zone => {
          if (zone.spaces.length === 0) return;
          this.checkPageBreak(60);
          this.addZoneSection(zone);
        });
      }
    }

    // Pool House (if enabled)
    if (this.data.structures?.poolHouse?.enabled && this.data.poolHouseZonesData?.length > 0) {
      const phHasSpaces = this.data.poolHouseZonesData.some(z => z.spaces.length > 0);
      if (phHasSpaces) {
        this.checkPageBreak(80);
        this.addStructureSubheader('Pool House');
        this.data.poolHouseZonesData.forEach(zone => {
          if (zone.spaces.length === 0) return;
          this.checkPageBreak(60);
          this.addZoneSection(zone);
        });
      }
    }
  }

  addStructureSubheader(title) {
    // Navy bar for structure divider
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.rect(this.margin, this.y, this.contentWidth, 20, 'F');

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text(title.toUpperCase(), this.margin + 10, this.y + 14);

    // Show structure total on right
    let structTotal = 0;
    if (title === 'Main Residence') {
      structTotal = this.data.structures?.main?.total || 0;
    } else if (title === 'Guest House') {
      structTotal = this.data.structures?.guestHouse?.total || 0;
    } else if (title === 'Pool House') {
      structTotal = this.data.structures?.poolHouse?.total || 0;
    }

    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${formatNumber(structTotal)} SF`, this.pageWidth - this.margin - 10, this.y + 14, { align: 'right' });

    this.y += 25;
  }

  addZoneSection(zone) {
    // Zone header - lighter styling (not full navy bar)
    this.doc.setFillColor(TABLE_HEADER.r, TABLE_HEADER.g, TABLE_HEADER.b);
    this.doc.rect(this.margin, this.y, this.contentWidth, 18, 'F');

    // Zone name
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(zone.name, this.margin + 8, this.y + 12);

    // Zone total SF in gold
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(`${formatNumber(zone.totalSF)} SF`, this.pageWidth - this.margin - 8, this.y + 12, { align: 'right' });

    this.y += 20;

    // Table header
    this.addTableHeader();

    // Spaces
    zone.spaces.forEach(space => {
      this.checkPageBreak(16);
      this.addSpaceRow(space);
    });

    this.y += 10; // Reduced gap between zones
  }

  // ============================================
  // SPACES BY LEVEL
  // ============================================

  addSpacesByLevel() {
    // Part 1 header
    this.addSectionHeader('PART 1: SPACES BY LEVEL');

    // Main Residence by level
    this.addStructureSubheader('Main Residence');
    const mainLevelGroups = this.groupSpacesByLevel(this.data.zonesData);
    const levelOrder = [2, 1, -1, 0];
    const mainSortedLevels = Object.keys(mainLevelGroups)
      .map(Number)
      .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

    mainSortedLevels.forEach(level => {
      const spaces = mainLevelGroups[level];
      if (!spaces || spaces.length === 0) return;
      this.checkPageBreak(60);
      this.addLevelSection(level, spaces);
    });

    // Guest House by level (if enabled)
    if (this.data.structures?.guestHouse?.enabled && this.data.guestHouseZonesData?.length > 0) {
      const ghHasSpaces = this.data.guestHouseZonesData.some(z => z.spaces.length > 0);
      if (ghHasSpaces) {
        this.checkPageBreak(80);
        this.addStructureSubheader('Guest House');
        const ghLevelGroups = this.groupSpacesByLevel(this.data.guestHouseZonesData);
        const ghSortedLevels = Object.keys(ghLevelGroups)
          .map(Number)
          .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

        ghSortedLevels.forEach(level => {
          const spaces = ghLevelGroups[level];
          if (!spaces || spaces.length === 0) return;
          this.checkPageBreak(60);
          this.addLevelSection(level, spaces);
        });
      }
    }

    // Pool House by level (if enabled)
    if (this.data.structures?.poolHouse?.enabled && this.data.poolHouseZonesData?.length > 0) {
      const phHasSpaces = this.data.poolHouseZonesData.some(z => z.spaces.length > 0);
      if (phHasSpaces) {
        this.checkPageBreak(80);
        this.addStructureSubheader('Pool House');
        const phLevelGroups = this.groupSpacesByLevel(this.data.poolHouseZonesData);
        const phSortedLevels = Object.keys(phLevelGroups)
          .map(Number)
          .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

        phSortedLevels.forEach(level => {
          const spaces = phLevelGroups[level];
          if (!spaces || spaces.length === 0) return;
          this.checkPageBreak(60);
          this.addLevelSection(level, spaces);
        });
      }
    }
  }

  groupSpacesByLevel(zonesData) {
    const groups = {};

    zonesData.forEach(zone => {
      zone.spaces.forEach(space => {
        const level = space.level || 1;
        if (!groups[level]) {
          groups[level] = [];
        }
        groups[level].push({
          ...space,
          zoneName: zone.name,
          zoneCode: zone.code
        });
      });
    });

    return groups;
  }

  addLevelSection(level, spaces) {
    const levelName = level === -1 ? 'Basement' :
                      level === 0 ? 'Lower Level' :
                      `Level ${level}`;
    const levelLabel = level === 1 ? ' (Arrival)' : '';
    const totalSF = spaces.reduce((sum, s) => sum + s.area, 0);

    // Level header - lighter styling (not full navy bar)
    this.doc.setFillColor(TABLE_HEADER.r, TABLE_HEADER.g, TABLE_HEADER.b);
    this.doc.rect(this.margin, this.y, this.contentWidth, 18, 'F');

    // Level name
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(`${levelName}${levelLabel}`, this.margin + 8, this.y + 12);

    // Level total SF in gold
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(`${formatNumber(totalSF)} SF`, this.pageWidth - this.margin - 8, this.y + 12, { align: 'right' });

    this.y += 20;

    // Table header (with Zone column for level view)
    this.addTableHeaderForLevel();

    // Spaces
    spaces.forEach(space => {
      this.checkPageBreak(16);
      this.addSpaceRowForLevel(space);
    });

    this.y += 10; // Reduced gap between levels
  }

  // ============================================
  // TABLE COMPONENTS
  // ============================================

  addSectionHeader(title) {
    // 14pt SemiBold per brand guide for Section Header
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(title, this.margin, this.y);
    this.y += 16; // Reduced gap
  }

  addTableHeader() {
    const y = this.y;

    // Header background - per brand guide #f5f0e8
    this.doc.setFillColor(TABLE_HEADER.r, TABLE_HEADER.g, TABLE_HEADER.b);
    this.doc.rect(this.margin, y - 4, this.contentWidth, 14, 'F');

    // Header text - 10pt SemiBold per brand guide
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    this.doc.text('SPACE', this.margin + 5, y + 5);
    this.doc.text('SIZE', this.margin + 220, y + 5);
    this.doc.text('AREA', this.margin + 270, y + 5);
    this.doc.text('LEVEL', this.margin + 340, y + 5);
    this.doc.text('NOTES', this.margin + 390, y + 5);

    // Bottom border
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y + 10, this.margin + this.contentWidth, y + 10);

    this.y += 14;
  }

  addTableHeaderForLevel() {
    const y = this.y;

    // Header background - per brand guide #f5f0e8
    this.doc.setFillColor(TABLE_HEADER.r, TABLE_HEADER.g, TABLE_HEADER.b);
    this.doc.rect(this.margin, y - 4, this.contentWidth, 14, 'F');

    // Header text - 10pt SemiBold per brand guide
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    this.doc.text('SPACE', this.margin + 5, y + 5);
    this.doc.text('ZONE', this.margin + 200, y + 5);
    this.doc.text('SIZE', this.margin + 300, y + 5);
    this.doc.text('AREA', this.margin + 350, y + 5);
    this.doc.text('NOTES', this.margin + 420, y + 5);

    // Bottom border
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y + 10, this.margin + this.contentWidth, y + 10);

    this.y += 14;
  }

  addSpaceRow(space) {
    const y = this.y;

    // 10pt body text per brand guide
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    // Space name (truncate if too long)
    const name = space.name.length > 32 ? space.name.substring(0, 30) + '...' : space.name;
    this.doc.text(name, this.margin + 5, y);

    // Size
    this.doc.text(space.size, this.margin + 220, y);

    // Area
    this.doc.text(`${formatNumber(space.area)} SF`, this.margin + 270, y);

    // Level
    const levelText = space.level === -1 ? 'B' : `L${space.level}`;
    this.doc.text(levelText, this.margin + 340, y);

    // Notes (truncate if too long)
    if (space.notes) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      const notes = space.notes.length > 20 ? space.notes.substring(0, 18) + '...' : space.notes;
      this.doc.text(notes, this.margin + 390, y);
    }

    // Row separator - per brand guide 1px #e5e5e0
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y + 5, this.margin + this.contentWidth, y + 5);

    this.y += 12; // Compact row height
  }

  addSpaceRowForLevel(space) {
    const y = this.y;

    // 10pt body text per brand guide
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    // Space name
    const name = space.name.length > 28 ? space.name.substring(0, 26) + '...' : space.name;
    this.doc.text(name, this.margin + 5, y);

    // Zone (abbreviated)
    this.doc.setFontSize(9);
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    const zoneName = space.zoneName.length > 14 ? space.zoneName.substring(0, 12) + '...' : space.zoneName;
    this.doc.text(zoneName, this.margin + 200, y);

    // Size
    this.doc.setFontSize(10);
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text(space.size, this.margin + 300, y);

    // Area
    this.doc.text(`${formatNumber(space.area)} SF`, this.margin + 350, y);

    // Notes
    if (space.notes) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      const notes = space.notes.length > 15 ? space.notes.substring(0, 13) + '...' : space.notes;
      this.doc.text(notes, this.margin + 420, y);
    }

    // Row separator - per brand guide 1px #e5e5e0
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y + 5, this.margin + this.contentWidth, y + 5);

    this.y += 12; // Compact row height
  }

  // ============================================
  // PAGINATION & FOOTER
  // ============================================

  checkPageBreak(neededSpace = 50) {
    if (this.y > this.pageHeight - this.margin - neededSpace) {
      // Don't add footer here - will be added at the end
      this.doc.addPage();
      this.currentPage++;
      this.y = this.margin;
      this.addPageHeader();
    }
  }

  addPageHeader() {
    // Smaller header for continuation pages
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text('N4S Space Program', this.margin, 20);

    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text('FYI Report (continued)', this.pageWidth - this.margin, 20, { align: 'right' });

    this.y = 45;
  }

  addAllFooters() {
    // Add footers to all pages with correct page numbers
    for (let page = 1; page <= this.totalPages; page++) {
      this.doc.setPage(page);
      this.addFooterToPage(page);
    }
  }

  addFooterToPage(pageNum) {
    const footerY = this.pageHeight - 25;

    // Footer line per brand guide
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 8, this.pageWidth - this.margin, footerY - 8);

    // Footer text - 8pt per brand guide
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);

    // Left: Copyright per brand guide format
    this.doc.text(`© 2026 N4S Luxury Residential Advisory`, this.margin, footerY);

    // Right: Page number per brand guide format
    this.doc.text(`Page ${pageNum} of ${this.totalPages}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  // ============================================
  // SAVE
  // ============================================

  save() {
    const modeLabel = this.mode === 'full' ? 'Complete' : (this.mode === 'level' ? 'ByLevel' : 'ByZone');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = this.data.projectName
      ? `FYI-Space-Program-${this.data.projectName.replace(/\s+/g, '-')}-${dateStr}.pdf`
      : `FYI-Space-Program-${modeLabel}-${dateStr}.pdf`;
    this.doc.save(filename);
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Generate FYI Space Program PDF
 * @param {Object} data - PDF data from buildFYIPDFData
 * @param {string} mode - 'full' (Level+Zone), 'zone', or 'level'
 */
export async function generateFYIPDF(data, mode = 'full') {
  try {
    const generator = new FYIReportGenerator(data, mode);
    await generator.generate();
    generator.save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    // Fallback to printable HTML
    generatePrintableHTML(data, mode);
  }
}

/**
 * Build PDF data from FYI state (Enhanced for multi-structure support)
 */
export function buildFYIPDFData(
  settings,
  selections,
  totals,
  structureTotals,
  availableLevels,
  getSpacesForZone,
  calculateArea,
  projectName,
  clientName
) {
  // Helper to build zone data for a set of zones
  const buildZoneData = (zoneList) => {
    return zoneList.map(zone => {
      const zoneSpaces = getSpacesForZone(zone.code);
      const includedSpaces = zoneSpaces
        .filter(s => selections[s.code]?.included)
        .map(s => ({
          code: s.code,
          name: s.name,
          size: selections[s.code].size,
          area: calculateArea(s.code),
          level: selections[s.code].level || s.defaultLevel,
          notes: selections[s.code].notes
        }));

      return {
        code: zone.code,
        name: zone.name,
        spaces: includedSpaces,
        totalSF: includedSpaces.reduce((sum, s) => sum + s.area, 0)
      };
    });
  };

  // Main Residence zones (exclude Z9_GH and Z10_PH)
  const mainResidenceZones = zones.filter(z =>
    z.code !== 'Z9_GH' && z.code !== 'Z10_PH'
  );
  const zonesData = buildZoneData(mainResidenceZones);

  // Guest House zones
  const guestHouseZones = zones.filter(z => z.code === 'Z9_GH');
  const guestHouseZonesData = buildZoneData(guestHouseZones);
  const hasGuestHouseSpaces = guestHouseZonesData.some(z => z.spaces.length > 0);

  // Pool House zones
  const poolHouseZones = zones.filter(z => z.code === 'Z10_PH');
  const poolHouseZonesData = buildZoneData(poolHouseZones);
  const hasPoolHouseSpaces = poolHouseZonesData.some(z => z.spaces.length > 0);

  // Use Main Residence totals from structureTotals
  const mainTotals = structureTotals?.main || totals;
  const pdfTotals = {
    net: mainTotals.net,
    circulation: mainTotals.circulation,
    circulationPct: mainTotals.net > 0
      ? ((mainTotals.circulation / mainTotals.net) * 100).toFixed(1)
      : '0.0',
    total: mainTotals.total,
    deltaFromTarget: mainTotals.total - settings.targetSF,
    byLevel: mainTotals.byLevel || {},
    outdoorTotal: totals.outdoorTotal || 0,
    targetSF: settings.targetSF
  };

  // Build structures object with enabled flags based on actual data
  const structures = {
    main: {
      enabled: true,
      net: mainTotals.net || 0,
      circulation: mainTotals.circulation || 0,
      total: mainTotals.total || 0,
      spaceCount: structureTotals?.main?.spaceCount || 0
    },
    guestHouse: {
      enabled: hasGuestHouseSpaces || (structureTotals?.guestHouse?.spaceCount || 0) > 0,
      net: structureTotals?.guestHouse?.net || 0,
      total: structureTotals?.guestHouse?.total || 0,
      spaceCount: structureTotals?.guestHouse?.spaceCount || 0
    },
    poolHouse: {
      enabled: hasPoolHouseSpaces || (structureTotals?.poolHouse?.spaceCount || 0) > 0,
      net: structureTotals?.poolHouse?.net || 0,
      total: structureTotals?.poolHouse?.total || 0,
      spaceCount: structureTotals?.poolHouse?.spaceCount || 0
    }
  };

  return {
    settings,
    selections,
    totals: pdfTotals,
    structureTotals,
    structures,
    availableLevels,
    zonesData,
    guestHouseZonesData,
    poolHouseZonesData,
    projectName,
    clientName,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Fallback: Generate printable HTML
 */
function generatePrintableHTML(data, mode = 'zone') {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>N4S FYI Space Program</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1a1a1a;
      background: white;
    }
    .header-bar {
      background: #1e3a5f;
      padding: 15px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-bar .left { color: white; font-size: 14px; }
    .header-bar .right { color: #c9a227; font-weight: 600; font-size: 14px; }
    .content { padding: 20px 40px; }
    .client-info { margin-bottom: 10px; color: #2d3748; font-size: 10px; }
    .generated { color: #64748b; font-size: 9px; margin-bottom: 20px; }
    .summary-box {
      background: #fafaf8;
      border: 1px solid #e5e5e0;
      border-left: 4px solid #c9a227;
      border-radius: 4px;
      padding: 15px 20px;
      margin-bottom: 25px;
      display: flex;
      gap: 60px;
    }
    .summary-section h3 {
      font-size: 9px;
      font-weight: 600;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 10px;
    }
    .summary-row.total { font-weight: 600; }
    .summary-row.over { color: #d32f2f; }
    .summary-row.under { color: #2e7d32; }
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      color: #1e3a5f;
      margin-bottom: 15px;
    }
    .zone-header {
      background: #1e3a5f;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .zone-header h2 { font-size: 12px; font-weight: 600; }
    .zone-header .sf { color: #c9a227; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th {
      text-align: left;
      padding: 6px 8px;
      background: #fafaf8;
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      border-bottom: 1px solid #e5e5e0;
    }
    td {
      padding: 6px 8px;
      font-size: 9px;
      border-bottom: 1px solid #f0f0f0;
    }
    td.notes { color: #64748b; font-style: italic; }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e5e0;
      font-size: 8px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      .zone { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <span class="left">N4S Space Program</span>
    <span class="right">FYI Report</span>
  </div>
  <div class="content">
    <div class="client-info">
      ${data.projectName ? `Project: ${data.projectName}` : ''}
      ${data.projectName && data.clientName ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : ''}
      ${data.clientName ? `Client: ${data.clientName}` : ''}
    </div>
    <div class="generated">Generated: ${data.generatedAt}</div>

    <div class="summary-box">
      <div class="summary-section">
        <h3>Program Settings</h3>
        <div class="summary-row"><span>Target SF</span><strong>${data.settings.targetSF.toLocaleString()}</strong></div>
        <div class="summary-row"><span>Program Tier</span><span>${data.settings.programTier.toUpperCase()}</span></div>
        <div class="summary-row"><span>Size Delta</span><span>±${data.settings.deltaPct}%</span></div>
        <div class="summary-row"><span>Basement</span><span>${data.settings.hasBasement ? 'Yes' : 'No'}</span></div>
      </div>
      <div class="summary-section">
        <h3>Totals</h3>
        <div class="summary-row"><span>Net Conditioned</span><span>${data.totals.net.toLocaleString()} SF</span></div>
        <div class="summary-row"><span>Circulation (${data.totals.circulationPct}%)</span><span>${data.totals.circulation.toLocaleString()} SF</span></div>
        <div class="summary-row total"><span>Total</span><strong>${data.totals.total.toLocaleString()} SF</strong></div>
        <div class="summary-row ${data.totals.deltaFromTarget > 0 ? 'over' : data.totals.deltaFromTarget < 0 ? 'under' : ''}">
          <span>Delta from Target</span>
          <span>${data.totals.deltaFromTarget > 0 ? '+' : ''}${data.totals.deltaFromTarget.toLocaleString()} SF</span>
        </div>
        ${data.totals.outdoorTotal > 0 ? `<div class="summary-row"><span>Outdoor (exterior)</span><span>${data.totals.outdoorTotal.toLocaleString()} SF</span></div>` : ''}
      </div>
    </div>

    <h1 class="section-title">Spaces by ${mode === 'level' ? 'Level' : 'Zone'}</h1>

    ${data.zonesData.filter(z => z.spaces.length > 0).map(zone => `
    <div class="zone">
      <div class="zone-header">
        <h2>${zone.name}</h2>
        <span class="sf">${zone.totalSF.toLocaleString()} SF</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:35%">Space</th>
            <th style="width:10%">Size</th>
            <th style="width:15%">Area</th>
            <th style="width:10%">Level</th>
            <th style="width:30%">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${zone.spaces.map(space => `
          <tr>
            <td>${space.name}</td>
            <td>${space.size}</td>
            <td>${space.area.toLocaleString()} SF</td>
            <td>${space.level === -1 ? 'B' : 'L' + space.level}</td>
            <td class="notes">${space.notes || '—'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `).join('')}

    <div class="footer">
      <span>${formatDate(new Date())}</span>
      <span>N4S - Not For Sale | Luxury Residential Advisory</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>
  `.trim();

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

const fyiPdfExport = {
  FYIReportGenerator,
  generateFYIPDF,
  buildFYIPDFData
};

export default fyiPdfExport;
