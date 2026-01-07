// ============================================
// N4S FYI SPACE PROGRAM REPORT GENERATOR
// PDF Generation using jsPDF
// Version: 2.0 - Class-based architecture
// ============================================

import jsPDF from 'jspdf';
import { zones } from '../../../shared/space-registry';

// ============================================
// CONSTANTS
// ============================================

// N4S Brand Colors (RGB values for jsPDF)
const NAVY = { r: 30, g: 58, b: 95 };
const GOLD = { r: 201, g: 162, b: 39 };
const CREAM = { r: 254, g: 249, b: 231 };
const BACKGROUND = { r: 250, g: 250, b: 248 };
const CARD_BG = { r: 248, g: 250, b: 252 };
const LIGHT_GRAY = { r: 100, g: 116, b: 139 };
const DARK_TEXT = { r: 45, g: 55, b: 72 };
const WHITE = { r: 255, g: 255, b: 255 };
const SUCCESS_GREEN = { r: 46, g: 125, b: 50 };
const ERROR_RED = { r: 211, g: 47, b: 47 };
const BORDER = { r: 229, g: 229, b: 224 };

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
  constructor(data, mode = 'zone') {
    this.data = data;
    this.mode = mode; // 'zone' or 'level'
    this.doc = null;

    // Page dimensions (letter size in points)
    this.pageWidth = 612;
    this.pageHeight = 792;
    this.margin = 40;
    this.contentWidth = this.pageWidth - (this.margin * 2);

    // Pagination
    this.currentPage = 1;
    this.totalPages = 1; // Will be calculated
    this.y = 0;
  }

  async generate() {
    this.doc = new jsPDF('p', 'pt', 'letter');

    // Calculate total pages based on content
    this.totalPages = this.calculateTotalPages();

    // Generate report
    this.addHeader();
    this.addClientInfo();
    this.addSummaryBox();

    if (this.mode === 'level') {
      this.addSpacesByLevel();
    } else {
      this.addSpacesByZone();
    }

    this.addFooter();

    return this.doc;
  }

  calculateTotalPages() {
    // Estimate pages based on number of zones/spaces
    const spaceCount = this.data.zonesData.reduce((sum, z) => sum + z.spaces.length, 0);
    // Roughly 15 spaces per page after header
    return Math.max(1, Math.ceil(spaceCount / 15));
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
    const boxHeight = 110;
    const boxY = this.y;

    // Background with gold left border
    this.doc.setFillColor(BACKGROUND.r, BACKGROUND.g, BACKGROUND.b);
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxHeight, 4, 4, 'F');

    // Gold left border
    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.rect(this.margin, boxY, 4, boxHeight, 'F');

    // Border
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, boxHeight, 4, 4, 'S');

    // Two columns
    const col1X = this.margin + 20;
    const col2X = this.margin + this.contentWidth / 2 + 10;
    let rowY = boxY + 20;

    // Column 1: Program Settings
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('PROGRAM SETTINGS', col1X, rowY);
    rowY += 15;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    const settings = this.data.settings;
    this.addSummaryRow(col1X, rowY, 'Target SF', formatNumber(settings.targetSF));
    rowY += 14;
    this.addSummaryRow(col1X, rowY, 'Program Tier', settings.programTier.toUpperCase());
    rowY += 14;
    this.addSummaryRow(col1X, rowY, 'Size Delta', `±${settings.deltaPct}%`);
    rowY += 14;
    this.addSummaryRow(col1X, rowY, 'Basement', settings.hasBasement ? 'Yes' : 'No');

    // Column 2: Totals
    rowY = boxY + 20;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text('TOTALS', col2X, rowY);
    rowY += 15;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    const totals = this.data.totals;
    this.addSummaryRow(col2X, rowY, 'Net Conditioned', `${formatNumber(totals.net)} SF`);
    rowY += 14;
    this.addSummaryRow(col2X, rowY, `Circulation (${totals.circulationPct}%)`, `${formatNumber(totals.circulation)} SF`);
    rowY += 14;

    // Total row (bold)
    this.doc.setFont('helvetica', 'bold');
    this.addSummaryRow(col2X, rowY, 'Total', `${formatNumber(totals.total)} SF`);
    rowY += 14;

    // Delta from target (colored)
    const delta = totals.deltaFromTarget;
    const deltaText = `${delta >= 0 ? '+' : ''}${formatNumber(delta)} SF`;
    if (delta > 0) {
      this.doc.setTextColor(ERROR_RED.r, ERROR_RED.g, ERROR_RED.b);
    } else if (delta < 0) {
      this.doc.setTextColor(SUCCESS_GREEN.r, SUCCESS_GREEN.g, SUCCESS_GREEN.b);
    }
    this.doc.setFont('helvetica', 'normal');
    this.addSummaryRow(col2X, rowY, 'Delta from Target', deltaText);

    // Outdoor total if applicable
    if (totals.outdoorTotal > 0) {
      rowY += 14;
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      this.addSummaryRow(col2X, rowY, 'Outdoor (exterior)', `${formatNumber(totals.outdoorTotal)} SF`);
    }

    this.y = boxY + boxHeight + 20;
  }

  addSummaryRow(x, y, label, value) {
    const valueWidth = this.doc.getTextWidth(value);
    this.doc.text(label, x, y);
    this.doc.text(value, x + 180, y, { align: 'right' });
  }

  // ============================================
  // SPACES BY ZONE
  // ============================================

  addSpacesByZone() {
    // Section header
    this.addSectionHeader('Spaces by Zone');

    this.data.zonesData.forEach(zone => {
      if (zone.spaces.length === 0) return;

      this.checkPageBreak(80);
      this.addZoneSection(zone);
    });
  }

  addZoneSection(zone) {
    // Zone header bar
    const headerHeight = 24;
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, headerHeight, 3, 3, 'F');

    // Zone name
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text(zone.name, this.margin + 10, this.y + 16);

    // Zone total SF
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(`${formatNumber(zone.totalSF)} SF`, this.pageWidth - this.margin - 10, this.y + 16, { align: 'right' });

    this.y += headerHeight + 8;

    // Table header
    this.addTableHeader();

    // Spaces
    zone.spaces.forEach(space => {
      this.checkPageBreak(20);
      this.addSpaceRow(space);
    });

    this.y += 15;
  }

  // ============================================
  // SPACES BY LEVEL
  // ============================================

  addSpacesByLevel() {
    // Section header
    this.addSectionHeader('Spaces by Level');

    // Group spaces by level
    const levelGroups = this.groupSpacesByLevel();

    // Sort levels: L2, L1, B (basement)
    const levelOrder = [2, 1, -1, 0];
    const sortedLevels = Object.keys(levelGroups)
      .map(Number)
      .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

    sortedLevels.forEach(level => {
      const spaces = levelGroups[level];
      if (!spaces || spaces.length === 0) return;

      this.checkPageBreak(80);
      this.addLevelSection(level, spaces);
    });
  }

  groupSpacesByLevel() {
    const groups = {};

    this.data.zonesData.forEach(zone => {
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
    const levelLabel = level === 1 ? '(Arrival Level)' : '';
    const totalSF = spaces.reduce((sum, s) => sum + s.area, 0);

    // Level header bar
    const headerHeight = 24;
    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, headerHeight, 3, 3, 'F');

    // Level name
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(WHITE.r, WHITE.g, WHITE.b);
    this.doc.text(`${levelName} ${levelLabel}`, this.margin + 10, this.y + 16);

    // Level total SF
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    this.doc.text(`${formatNumber(totalSF)} SF`, this.pageWidth - this.margin - 10, this.y + 16, { align: 'right' });

    this.y += headerHeight + 8;

    // Table header (with Zone column for level view)
    this.addTableHeaderForLevel();

    // Spaces
    spaces.forEach(space => {
      this.checkPageBreak(20);
      this.addSpaceRowForLevel(space);
    });

    this.y += 15;
  }

  // ============================================
  // TABLE COMPONENTS
  // ============================================

  addSectionHeader(title) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    this.doc.text(title, this.margin, this.y);
    this.y += 20;
  }

  addTableHeader() {
    const y = this.y;

    // Header background
    this.doc.setFillColor(BACKGROUND.r, BACKGROUND.g, BACKGROUND.b);
    this.doc.rect(this.margin, y - 4, this.contentWidth, 16, 'F');

    // Header text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);

    this.doc.text('SPACE', this.margin + 5, y + 6);
    this.doc.text('SIZE', this.margin + 200, y + 6);
    this.doc.text('AREA', this.margin + 250, y + 6);
    this.doc.text('LEVEL', this.margin + 310, y + 6);
    this.doc.text('NOTES', this.margin + 360, y + 6);

    // Bottom border
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y + 12, this.margin + this.contentWidth, y + 12);

    this.y += 18;
  }

  addTableHeaderForLevel() {
    const y = this.y;

    // Header background
    this.doc.setFillColor(BACKGROUND.r, BACKGROUND.g, BACKGROUND.b);
    this.doc.rect(this.margin, y - 4, this.contentWidth, 16, 'F');

    // Header text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);

    this.doc.text('SPACE', this.margin + 5, y + 6);
    this.doc.text('ZONE', this.margin + 180, y + 6);
    this.doc.text('SIZE', this.margin + 280, y + 6);
    this.doc.text('AREA', this.margin + 330, y + 6);
    this.doc.text('NOTES', this.margin + 400, y + 6);

    // Bottom border
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y + 12, this.margin + this.contentWidth, y + 12);

    this.y += 18;
  }

  addSpaceRow(space) {
    const y = this.y;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    // Space name (truncate if too long)
    const name = space.name.length > 28 ? space.name.substring(0, 26) + '...' : space.name;
    this.doc.text(name, this.margin + 5, y);

    // Size
    this.doc.text(space.size, this.margin + 200, y);

    // Area
    this.doc.text(`${formatNumber(space.area)} SF`, this.margin + 250, y);

    // Level
    const levelText = space.level === -1 ? 'B' : `L${space.level}`;
    this.doc.text(levelText, this.margin + 310, y);

    // Notes (truncate if too long)
    if (space.notes) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      const notes = space.notes.length > 25 ? space.notes.substring(0, 23) + '...' : space.notes;
      this.doc.text(notes, this.margin + 360, y);
    }

    // Row separator
    this.doc.setDrawColor(240, 240, 240);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, y + 6, this.margin + this.contentWidth, y + 6);

    this.y += 14;
  }

  addSpaceRowForLevel(space) {
    const y = this.y;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);

    // Space name
    const name = space.name.length > 24 ? space.name.substring(0, 22) + '...' : space.name;
    this.doc.text(name, this.margin + 5, y);

    // Zone (abbreviated)
    this.doc.setFontSize(8);
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    const zoneName = space.zoneName.length > 15 ? space.zoneName.substring(0, 13) + '...' : space.zoneName;
    this.doc.text(zoneName, this.margin + 180, y);

    // Size
    this.doc.setFontSize(9);
    this.doc.setTextColor(DARK_TEXT.r, DARK_TEXT.g, DARK_TEXT.b);
    this.doc.text(space.size, this.margin + 280, y);

    // Area
    this.doc.text(`${formatNumber(space.area)} SF`, this.margin + 330, y);

    // Notes
    if (space.notes) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      const notes = space.notes.length > 20 ? space.notes.substring(0, 18) + '...' : space.notes;
      this.doc.text(notes, this.margin + 400, y);
    }

    // Row separator
    this.doc.setDrawColor(240, 240, 240);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, y + 6, this.margin + this.contentWidth, y + 6);

    this.y += 14;
  }

  // ============================================
  // PAGINATION & FOOTER
  // ============================================

  checkPageBreak(neededSpace = 50) {
    if (this.y > this.pageHeight - this.margin - neededSpace) {
      this.addFooter();
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

  addFooter() {
    const footerY = this.pageHeight - 25;

    // Footer line
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);

    // Date (left)
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
    this.doc.text(formatDate(new Date()), this.margin, footerY);

    // N4S branding (center)
    this.doc.text('N4S - Not For Sale | Luxury Residential Advisory', this.pageWidth / 2, footerY, { align: 'center' });

    // Page number (right)
    this.doc.text(`Page ${this.currentPage} of ${this.totalPages}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  // ============================================
  // SAVE
  // ============================================

  save() {
    const modeLabel = this.mode === 'level' ? 'ByLevel' : 'ByZone';
    const filename = this.data.projectName
      ? `FYI-Space-Program-${modeLabel}-${this.data.projectName.replace(/\s+/g, '-')}.pdf`
      : `FYI-Space-Program-${modeLabel}.pdf`;
    this.doc.save(filename);
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Generate FYI Space Program PDF
 * @param {Object} data - PDF data from buildFYIPDFData
 * @param {string} mode - 'zone' or 'level'
 */
export async function generateFYIPDF(data, mode = 'zone') {
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
 * Build PDF data from FYI state
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
  const zonesData = zones.map(zone => {
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

  return {
    settings,
    selections,
    totals,
    structureTotals,
    availableLevels,
    zonesData,
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

export default {
  FYIReportGenerator,
  generateFYIPDF,
  buildFYIPDFData
};
