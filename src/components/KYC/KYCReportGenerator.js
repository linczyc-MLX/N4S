/**
 * KYCReportGenerator.js
 *
 * Generates comprehensive KYC PDF reports following N4S brand standards.
 * AUDIT: All data paths verified against actual kycData structure.
 */

import jsPDF from 'jspdf';

// N4S Brand Colors (RGB)
const COLORS = {
  navy: [30, 58, 95],        // #1e3a5f
  gold: [201, 162, 39],      // #c9a227
  kycBlue: [49, 80, 152],    // #315098
  text: [26, 26, 26],        // #1a1a1a
  textMuted: [107, 107, 107], // #6b6b6b
  background: [250, 250, 248], // #fafaf8
  border: [229, 229, 224],   // #e5e5e0
  accentLight: [245, 240, 232], // #f5f0e8
  white: [255, 255, 255],
};

// Helper functions
const formatCurrency = (value) => {
  if (!value && value !== 0) return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Property Role labels
const getPropertyRoleLabel = (role) => {
  const labels = {
    'forever-home': 'Forever Home (15+ years)',
    'primary-residence': 'Primary Residence (10-15 years)',
    'medium-term': 'Medium-Term Hold (5-10 years)',
    'investment': 'Investment Property (<5 years)',
    'spec-build': 'Spec Development (Build to Sell)',
  };
  return labels[role] || role || 'Not specified';
};

// Staffing Level labels
const getStaffingLevelLabel = (level) => {
  const labels = {
    'minimal': 'Minimal (occasional services)',
    'part-time': 'Part-Time Staff (weekly presence)',
    'full-time': 'Full-Time Staff (daily presence)',
    'estate': 'Estate Level (multiple full-time staff)',
    'compound': 'Compound Level (dedicated estate manager)',
  };
  return labels[level] || level || 'Not specified';
};

// Quality Tier labels
const getQualityTierLabel = (tier) => {
  const labels = {
    'select': 'I - Select: The Curated Standard',
    'reserve': 'II - Reserve: Exceptional Materials',
    'signature': 'III - Signature: Bespoke Design',
    'legacy': 'IV - Legacy: Enduring Heritage',
  };
  return labels[tier] || tier || 'Not specified';
};

// Work From Home labels
const getWorkFromHomeLabel = (value) => {
  const labels = {
    'never': 'Never / Rarely',
    'occasionally': 'Occasionally (1-2 days/week)',
    'frequently': 'Frequently (3-4 days/week)',
    'primarily': 'Primarily Work From Home',
    'full-time': 'Full-Time Remote',
  };
  return labels[value] || value || 'Not specified';
};

// Entertainment Style labels
const getEntertainingStyleLabel = (value) => {
  const labels = {
    'intimate': 'Intimate Gatherings (2-6 guests)',
    'moderate': 'Moderate Entertaining (6-20 guests)',
    'large': 'Large Events (20-50 guests)',
    'grand': 'Grand Scale (50+ guests)',
    'none': 'Minimal Entertaining',
  };
  return labels[value] || value || 'Not specified';
};

// Entertainment Frequency labels
const getEntertainingFrequencyLabel = (value) => {
  const labels = {
    'rarely': 'Rarely (few times per year)',
    'monthly': 'Monthly',
    'weekly': 'Weekly',
    'frequently': 'Multiple times per week',
  };
  return labels[value] || value || 'Not specified';
};

/**
 * Generate KYC Report PDF
 * @param {object} kycData - Full KYC data from AppContext
 */
export const generateKYCReport = async (kycData) => {
  // DEBUG: Log full kycData to verify paths
  console.log('[KYC Report] Full kycData:', JSON.stringify(kycData, null, 2));
  console.log('[KYC Report] portfolioContext:', kycData?.principal?.portfolioContext);
  console.log('[KYC Report] lifestyleLiving:', kycData?.principal?.lifestyleLiving);
  console.log('[KYC Report] spaceRequirements:', kycData?.principal?.spaceRequirements);
  console.log('[KYC Report] operatingModel:', kycData?.principal?.operatingModel);

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
  let pageNumber = 1;
  let totalPages = 5;

  // ==========================================================================
  // EXTRACT DATA FROM CORRECT PATHS
  // ==========================================================================

  const principal = kycData?.principal || {};

  // P1.A.1 - Portfolio Context
  const portfolioContext = principal.portfolioContext || {};
  const clientName = portfolioContext.clientName || 'Client';
  const projectName = portfolioContext.projectName || 'Luxury Residence Project';
  const propertyRole = portfolioContext.propertyRole;
  const planningHorizon = portfolioContext.planningHorizon;

  // P1.A.2 - Family & Household
  const familyComposition = portfolioContext.familyComposition || {};
  const adults = familyComposition.adults;
  const children = familyComposition.children;

  // P1.A.3 - Operating Model
  const operatingModel = principal.operatingModel || {};
  const staffingLevel = operatingModel.staffingLevel;

  // P1.A.4 - Budget Parameters (stored in portfolioContext)
  const landAcquisitionCost = portfolioContext.landAcquisitionCost || 0;
  const totalBudget = portfolioContext.totalBudget || 0;
  const interiorBudget = portfolioContext.interiorBudget || 0;
  const grandTotal = landAcquisitionCost + totalBudget;
  const qualityTier = portfolioContext.qualityTier;

  // P1.A.6 - Lifestyle & Living
  const lifestyleLiving = principal.lifestyleLiving || {};
  const workFromHome = lifestyleLiving.workFromHome;
  const officeCount = lifestyleLiving.officeCount;
  const entertainingStyle = lifestyleLiving.entertainingStyle;
  const entertainingFrequency = lifestyleLiving.entertainingFrequency;

  // P1.A.7 - Space Requirements
  const spaceRequirements = principal.spaceRequirements || {};
  const bedroomCount = spaceRequirements.bedroomCount;
  const mustHaveSpaces = spaceRequirements.mustHaveSpaces || [];
  const niceToHaveSpaces = spaceRequirements.niceToHaveSpaces || [];

  // Design Identity
  const designIdentity = principal.designIdentity || {};

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const addHeader = () => {
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, pageWidth, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text('N4S', margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Know Your Client Report', pageWidth - margin, 8, { align: 'right' });
  };

  const addFooter = (pageNum) => {
    const footerY = pageHeight - 10;

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('N4S Advisory — KYC Report — Confidential', margin, footerY + 4);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text(formatDate(new Date()), pageWidth - margin, footerY + 4, { align: 'right' });
  };

  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    return 25;
  };

  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 20) {
      currentY = addNewPage();
    }
    return currentY;
  };

  const addSectionTitle = (title) => {
    currentY = checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.navy);
    doc.text(title, margin, currentY);
    currentY += 8;
  };

  const addSubsectionTitle = (title) => {
    currentY = checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.kycBlue);
    doc.text(title, margin, currentY);
    currentY += 6;
  };

  const addLabelValue = (label, value, indent = 0) => {
    currentY = checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(label, margin + indent, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const displayValue = value !== undefined && value !== null && value !== '' ? String(value) : 'Not specified';
    doc.text(displayValue, margin + indent + 55, currentY);
    currentY += 6;
  };

  const addBulletList = (items, indent = 5) => {
    if (!items || items.length === 0) {
      currentY = checkPageBreak(6);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('None specified', margin + indent, currentY);
      currentY += 5;
      return;
    }
    items.forEach(item => {
      currentY = checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.text('•', margin + indent, currentY);
      const lines = doc.splitTextToSize(String(item), contentWidth - indent - 8);
      doc.text(lines, margin + indent + 5, currentY);
      currentY += lines.length * 4 + 2;
    });
    currentY += 2;
  };

  // ==========================================================================
  // PAGE 1 - CLIENT PROFILE
  // ==========================================================================

  addHeader();
  addFooter(pageNumber);
  currentY = 30;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.navy);
  doc.text('Client Profile', margin, currentY);
  currentY += 15;

  // Client info box
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(margin, currentY, contentWidth, 40, 3, 3, 'F');

  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('CLIENT', margin + 8, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.navy);
  doc.text(clientName, margin + 8, currentY);

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text(projectName, margin + 8, currentY);

  currentY += 20;

  // Project Details
  addSubsectionTitle('Project Overview');
  addLabelValue("This Property's Role", getPropertyRoleLabel(propertyRole));
  addLabelValue('Investment Horizon', planningHorizon ? `${planningHorizon} years` : 'Not specified');

  currentY += 5;
  addSubsectionTitle('Household Composition');
  addLabelValue('Adults', adults !== undefined ? adults : 'Not specified');
  addLabelValue('Children', children !== undefined ? children : '0');
  addLabelValue('Staffing Level', getStaffingLevelLabel(staffingLevel));

  // ==========================================================================
  // PAGE 2 - BUDGET PARAMETERS
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Budget Parameters');

  addLabelValue('Land Acquisition Cost', formatCurrency(landAcquisitionCost));
  addLabelValue('Total Project Budget', formatCurrency(totalBudget));
  addLabelValue('Interior Budget', formatCurrency(interiorBudget));

  currentY += 5;

  // Grand Total highlight box
  doc.setFillColor(...COLORS.kycBlue);
  doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('GRAND TOTAL (Land + Total Project Budget)', margin + 8, currentY + 8);

  doc.setFontSize(14);
  doc.text(formatCurrency(grandTotal), pageWidth - margin - 8, currentY + 12, { align: 'right' });

  currentY += 30;

  addSubsectionTitle('Quality Standards');
  addLabelValue('Quality Tier', getQualityTierLabel(qualityTier));

  // ==========================================================================
  // PAGE 3 - LIFESTYLE & WORKING
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Lifestyle & Working');

  addSubsectionTitle('Work From Home');
  addLabelValue('WFH Frequency', getWorkFromHomeLabel(workFromHome));
  addLabelValue('Dedicated Offices', officeCount !== undefined ? officeCount : 'Not specified');

  currentY += 5;
  addSubsectionTitle('Entertainment');
  addLabelValue('Entertaining Style', getEntertainingStyleLabel(entertainingStyle));
  addLabelValue('Frequency', getEntertainingFrequencyLabel(entertainingFrequency));

  // ==========================================================================
  // PAGE 4 - SPACE REQUIREMENTS
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Space Requirements');

  addSubsectionTitle('Bedrooms');
  addLabelValue('Bedroom Count', bedroomCount !== undefined ? bedroomCount : 'Not specified');

  currentY += 5;
  addSubsectionTitle('Must-Have Spaces');
  addBulletList(mustHaveSpaces);

  currentY += 5;
  addSubsectionTitle('Nice-to-Have Spaces');
  addBulletList(niceToHaveSpaces);

  // ==========================================================================
  // PAGE 5 - DESIGN IDENTITY (if available)
  // ==========================================================================

  if (designIdentity.principalTasteResults || designIdentity.tasteStyle) {
    currentY = addNewPage();

    addSectionTitle('Design Identity');

    if (designIdentity.tasteStyle) {
      addSubsectionTitle('Style Profile');
      addLabelValue('Primary Style', designIdentity.tasteStyle);
    }

    const tasteResults = designIdentity.principalTasteResults;
    if (tasteResults) {
      currentY += 5;
      addSubsectionTitle('Design DNA');

      if (tasteResults.styleEra !== undefined) {
        const eraLabel = tasteResults.styleEra < 40 ? 'Classic/Traditional' :
                         tasteResults.styleEra > 60 ? 'Contemporary/Modern' : 'Transitional';
        addLabelValue('Style Era', `${eraLabel} (${tasteResults.styleEra})`);
      }

      if (tasteResults.visualDensity !== undefined) {
        const densityLabel = tasteResults.visualDensity < 40 ? 'Minimal/Clean' :
                             tasteResults.visualDensity > 60 ? 'Layered/Rich' : 'Balanced';
        addLabelValue('Visual Density', `${densityLabel} (${tasteResults.visualDensity})`);
      }

      if (tasteResults.moodPalette !== undefined) {
        const moodLabel = tasteResults.moodPalette < 40 ? 'Cool/Serene' :
                          tasteResults.moodPalette > 60 ? 'Warm/Inviting' : 'Neutral';
        addLabelValue('Mood Palette', `${moodLabel} (${tasteResults.moodPalette})`);
      }
    }
  }

  // ==========================================================================
  // UPDATE TOTAL PAGES
  // ==========================================================================

  totalPages = pageNumber;

  // Update all footers with correct total
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 10;
    doc.setFillColor(...COLORS.white);
    doc.rect(pageWidth / 2 - 20, footerY + 1, 40, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY + 4, { align: 'center' });
  }

  // ==========================================================================
  // SAVE PDF
  // ==========================================================================

  const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = `N4S-KYC-Report-${safeClientName}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  console.log('[KYC Report] Generated:', filename);
  return filename;
};

export default generateKYCReport;
