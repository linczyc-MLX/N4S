/**
 * KYCReportGenerator.js
 *
 * Generates comprehensive KYC PDF reports following N4S brand standards.
 * AUDIT COMPLETE: All data paths verified against actual kycData structure.
 *
 * DATA STRUCTURE (from AppContext.jsx):
 * kycData.principal.portfolioContext - P1.A.1
 * kycData.principal.familyHousehold - P1.A.2
 * kycData.principal.projectParameters - P1.A.3
 * kycData.principal.budgetFramework - P1.A.4
 * kycData.principal.designIdentity - P1.A.5
 * kycData.principal.lifestyleLiving - P1.A.6
 * kycData.principal.spaceRequirements - P1.A.7
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

// Property Role labels (thisPropertyRole values from PortfolioContextSection)
const getPropertyRoleLabel = (role) => {
  const labels = {
    'primary': 'Primary Residence',
    'secondary': 'Secondary/Vacation Home',
    'vacation': 'Vacation Property',
    'investment': 'Investment Property',
    'legacy': 'Legacy/Generational Asset',
  };
  return labels[role] || role || 'Not specified';
};

// Investment Horizon labels (investmentHorizon values)
const getInvestmentHorizonLabel = (horizon) => {
  const labels = {
    'forever': 'Forever Home',
    '10yr': '10+ Years',
    '5yr': '5-10 Years',
    'generational': 'Generational (Multi-decade)',
  };
  return labels[horizon] || horizon || 'Not specified';
};

// Staffing Level labels (from FamilyHouseholdSection)
const getStaffingLevelLabel = (level) => {
  const labels = {
    'none': 'No Staff',
    'part_time': 'Part-Time Staff (cleaning, etc.)',
    'full_time': 'Full-Time Staff (daily presence)',
    'live_in': 'Live-In Staff (requires quarters)',
  };
  return labels[level] || level || 'Not specified';
};

// Quality Tier labels with FULL descriptions (interiorQualityTier from BudgetFrameworkSection)
const QUALITY_TIERS = {
  'select': {
    title: 'I - Select: The Curated Standard',
    description: 'High-quality materials, established brands, professional-grade finishes'
  },
  'reserve': {
    title: 'II - Reserve: Exceptional Materials',
    description: 'Premium natural stones, custom millwork, designer fixtures, bespoke elements'
  },
  'signature': {
    title: 'III - Signature: Bespoke Design',
    description: 'Rare materials, master artisan work, one-of-a-kind commissions'
  },
  'legacy': {
    title: 'IV - Legacy: Heirloom Standard',
    description: 'Antique integrations, heritage materials, generational craftsmanship'
  }
};

const getQualityTierLabel = (tier) => {
  return QUALITY_TIERS[tier]?.title || tier || 'Not specified';
};

const getQualityTierDescription = (tier) => {
  return QUALITY_TIERS[tier]?.description || '';
};

// Work From Home labels (from LifestyleLivingSection)
const getWorkFromHomeLabel = (value) => {
  const labels = {
    'never': 'Never',
    'sometimes': 'Sometimes (1-2 days/week)',
    'often': 'Often (3-4 days/week)',
    'always': 'Always (Full Remote)',
  };
  return labels[value] || value || 'Not specified';
};

// Entertainment Style labels (from LifestyleLivingSection)
const getEntertainingStyleLabel = (value) => {
  const labels = {
    'formal': 'Formal (Seated dinners)',
    'casual': 'Casual (Relaxed gatherings)',
    'both': 'Both Formal & Casual',
  };
  return labels[value] || value || 'Not specified';
};

// Entertainment Frequency labels (from LifestyleLivingSection)
const getEntertainingFrequencyLabel = (value) => {
  const labels = {
    'rarely': 'Rarely (Few times/year)',
    'monthly': 'Monthly',
    'weekly': 'Weekly',
    'daily': 'Daily/Constantly',
  };
  return labels[value] || value || 'Not specified';
};

// Space label mappings (from SpaceRequirementsSection)
const getSpaceLabel = (spaceCode) => {
  const labels = {
    'primary-suite': 'Primary Suite',
    'secondary-suites': 'Guest Suites',
    'kids-bedrooms': "Children's Bedrooms",
    'great-room': 'Great Room/Living',
    'formal-living': 'Formal Living Room',
    'family-room': 'Family Room',
    'formal-dining': 'Formal Dining',
    'casual-dining': 'Casual Dining/Breakfast',
    'chef-kitchen': "Chef's Kitchen",
    'catering-kitchen': 'Catering Kitchen',
    'home-office': 'Home Office',
    'library': 'Library',
    'media-room': 'Media Room/Theater',
    'game-room': 'Game Room',
    'wine-cellar': 'Wine Cellar',
    'gym': 'Home Gym',
    'spa-wellness': 'Spa/Wellness Suite',
    'pool-indoor': 'Indoor Pool',
    'sauna': 'Sauna',
    'steam-room': 'Steam Room',
    'staff-quarters': 'Staff Quarters',
    'mudroom': 'Mudroom',
    'laundry': 'Laundry Room',
    'art-gallery': 'Art Gallery',
    'music-room': 'Music Room',
    'safe-room': 'Safe Room/Panic Room',
  };
  return labels[spaceCode] || spaceCode;
};

// DNA Score labels (0-5 scale from Taste Exploration)
const getDNAScoreLabel = (dimension, score) => {
  if (score === undefined || score === null) return 'Not assessed';

  const labels = {
    styleEra: {
      low: 'Contemporary',
      mid: 'Transitional',
      high: 'Traditional'
    },
    visualDensity: {
      low: 'Minimal',
      mid: 'Balanced',
      high: 'Layered'
    },
    moodPalette: {
      low: 'Cool',
      mid: 'Neutral',
      high: 'Warm'
    }
  };

  const dimLabels = labels[dimension] || { low: 'Low', mid: 'Mid', high: 'High' };

  // Score is 0-5 scale
  if (score <= 1.5) return `${dimLabels.low} (${score.toFixed(1)})`;
  if (score >= 3.5) return `${dimLabels.high} (${score.toFixed(1)})`;
  return `${dimLabels.mid} (${score.toFixed(1)})`;
};

/**
 * Generate KYC Report PDF
 * @param {object} kycData - Full KYC data from AppContext (contains principal, secondary, advisor)
 */
export const generateKYCReport = async (kycData) => {
  // DEBUG: Log full kycData to verify all paths
  console.log('=== KYC REPORT DATA AUDIT ===');
  console.log('[KYC Report] Full kycData:', JSON.stringify(kycData, null, 2));
  console.log('[KYC Report] portfolioContext:', kycData?.principal?.portfolioContext);
  console.log('[KYC Report] familyHousehold:', kycData?.principal?.familyHousehold);
  console.log('[KYC Report] projectParameters:', kycData?.principal?.projectParameters);
  console.log('[KYC Report] budgetFramework:', kycData?.principal?.budgetFramework);
  console.log('[KYC Report] lifestyleLiving:', kycData?.principal?.lifestyleLiving);
  console.log('[KYC Report] spaceRequirements:', kycData?.principal?.spaceRequirements);
  console.log('[KYC Report] designIdentity:', kycData?.principal?.designIdentity);

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
  // EXTRACT DATA FROM CORRECT PATHS (verified against AppContext.jsx)
  // ==========================================================================

  const principal = kycData?.principal || {};
  const secondary = kycData?.secondary || {};

  // P1.A.1 - Portfolio Context
  const portfolioContext = principal.portfolioContext || {};
  const principalFirstName = portfolioContext.principalFirstName || '';
  const principalLastName = portfolioContext.principalLastName || '';
  const clientName = [principalFirstName, principalLastName].filter(Boolean).join(' ') || 'Client';
  const thisPropertyRole = portfolioContext.thisPropertyRole;
  const investmentHorizon = portfolioContext.investmentHorizon;
  const landAcquisitionCost = portfolioContext.landAcquisitionCost || 0;

  // Check if secondary stakeholder exists
  const secondaryFirstName = portfolioContext.secondaryFirstName || '';
  const secondaryLastName = portfolioContext.secondaryLastName || '';
  const hasSecondary = !!(secondaryFirstName || secondaryLastName);

  // P1.A.2 - Family & Household
  const familyHousehold = principal.familyHousehold || {};
  const familyMembers = familyHousehold.familyMembers || [];

  // FIX 1: Adults Count - Principal always = 1, Secondary = +1 if exists, plus additional adults from familyMembers
  const additionalAdults = familyMembers.filter(m => m.role === 'adult' || m.role === 'elderly').length;
  const adultsCount = 1 + (hasSecondary ? 1 : 0) + additionalAdults;

  // Children count from familyMembers
  const childrenCount = familyMembers.filter(m =>
    m.role === 'teenager' || m.role === 'child' || m.role === 'young-child'
  ).length;
  const staffingLevel = familyHousehold.staffingLevel;

  // P1.A.3 - Project Parameters
  const projectParameters = principal.projectParameters || {};
  const projectName = projectParameters.projectName || 'Luxury Residence Project';
  const bedroomCount = projectParameters.bedroomCount;
  const targetGSF = projectParameters.targetGSF;

  // P1.A.4 - Budget Framework
  const budgetFramework = principal.budgetFramework || {};
  const totalProjectBudget = budgetFramework.totalProjectBudget || 0;
  const interiorBudget = budgetFramework.interiorBudget || 0;
  const grandTotal = landAcquisitionCost + totalProjectBudget;
  const interiorQualityTier = budgetFramework.interiorQualityTier;

  // P1.A.6 - Lifestyle & Living
  const lifestyleLiving = principal.lifestyleLiving || {};
  const workFromHome = lifestyleLiving.workFromHome;

  // FIX 3: Dedicated Offices - Read wfhPeopleCount directly
  const dedicatedOffices = lifestyleLiving.wfhPeopleCount || 0;

  const entertainingStyle = lifestyleLiving.entertainingStyle;
  const entertainingFrequency = lifestyleLiving.entertainingFrequency;

  // P1.A.7 - Space Requirements
  const spaceRequirements = principal.spaceRequirements || {};
  const mustHaveSpaces = spaceRequirements.mustHaveSpaces || [];
  const niceToHaveSpaces = spaceRequirements.niceToHaveSpaces || [];

  // P1.A.5 - Design Identity
  const designIdentity = principal.designIdentity || {};

  // FIX 4: Extract taste results correctly
  const principalTasteResults = designIdentity.principalTasteResults || null;
  const secondaryTasteResults = designIdentity.secondaryTasteResults || null;
  const hasTasteData = !!(principalTasteResults || secondaryTasteResults);

  // Log extracted values for debugging
  console.log('[KYC Report] Extracted values:', {
    clientName,
    projectName,
    thisPropertyRole,
    investmentHorizon,
    hasSecondary,
    adultsCount,
    childrenCount,
    staffingLevel,
    landAcquisitionCost,
    totalProjectBudget,
    interiorBudget,
    grandTotal,
    interiorQualityTier,
    workFromHome,
    dedicatedOffices,
    entertainingStyle,
    entertainingFrequency,
    bedroomCount,
    mustHaveSpaces,
    niceToHaveSpaces,
    principalTasteResults,
    secondaryTasteResults,
    hasTasteData,
  });

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

  // FIX 2: Add helper for multi-line label/value with description
  const addLabelValueWithDescription = (label, value, description, indent = 0) => {
    currentY = checkPageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(label, margin + indent, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const displayValue = value !== undefined && value !== null && value !== '' ? String(value) : 'Not specified';
    doc.text(displayValue, margin + indent + 55, currentY);
    currentY += 5;

    if (description) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      const descLines = doc.splitTextToSize(description, contentWidth - indent - 55);
      doc.text(descLines, margin + indent + 55, currentY);
      currentY += descLines.length * 3.5 + 2;
    }
    currentY += 2;
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
      // Convert space codes to labels
      const displayItem = getSpaceLabel(item);
      const lines = doc.splitTextToSize(String(displayItem), contentWidth - indent - 8);
      doc.text(lines, margin + indent + 5, currentY);
      currentY += lines.length * 4 + 2;
    });
    currentY += 2;
  };

  // Helper to add DNA score bar visualization
  const addDNAScoreBar = (label, score, leftLabel, rightLabel) => {
    if (score === undefined || score === null) return;

    currentY = checkPageBreak(18);

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(label, margin, currentY);
    currentY += 5;

    // Bar background
    const barWidth = contentWidth - 40;
    const barHeight = 6;
    const barX = margin + 20;

    doc.setFillColor(...COLORS.border);
    doc.roundedRect(barX, currentY, barWidth, barHeight, 2, 2, 'F');

    // Score marker (score is 0-5, convert to percentage)
    const markerPos = barX + (score / 5) * barWidth;
    doc.setFillColor(...COLORS.kycBlue);
    doc.circle(markerPos, currentY + barHeight / 2, 4, 'F');

    // Score text in marker
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.white);
    doc.text(score.toFixed(1), markerPos, currentY + barHeight / 2 + 1.5, { align: 'center' });

    // Left/Right labels
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(leftLabel, barX, currentY + barHeight + 4);
    doc.text(rightLabel, barX + barWidth, currentY + barHeight + 4, { align: 'right' });

    currentY += barHeight + 10;
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
  addLabelValue("This Property's Role", getPropertyRoleLabel(thisPropertyRole));
  addLabelValue('Investment Horizon', getInvestmentHorizonLabel(investmentHorizon));

  currentY += 5;
  addSubsectionTitle('Household Composition');
  addLabelValue('Adults', adultsCount);
  addLabelValue('Children', childrenCount);
  addLabelValue('Staffing Level', getStaffingLevelLabel(staffingLevel));

  // ==========================================================================
  // PAGE 2 - BUDGET PARAMETERS
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Budget Parameters');

  addLabelValue('Land Acquisition Cost', formatCurrency(landAcquisitionCost));
  addLabelValue('Total Project Budget', formatCurrency(totalProjectBudget));
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

  // FIX 2: Quality Tier with full description
  addSubsectionTitle('Quality Standards');
  addLabelValueWithDescription(
    'Quality Tier',
    getQualityTierLabel(interiorQualityTier),
    getQualityTierDescription(interiorQualityTier)
  );

  // ==========================================================================
  // PAGE 3 - LIFESTYLE & WORKING
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Lifestyle & Working');

  addSubsectionTitle('Work From Home');
  addLabelValue('WFH Frequency', getWorkFromHomeLabel(workFromHome));
  addLabelValue('Dedicated Offices', dedicatedOffices > 0 ? dedicatedOffices : 'Not specified');

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
  addLabelValue('Bedroom Count', bedroomCount !== undefined && bedroomCount !== null ? bedroomCount : 'Not specified');

  currentY += 5;
  addSubsectionTitle('Must-Have Spaces');
  addBulletList(mustHaveSpaces);

  currentY += 5;
  addSubsectionTitle('Nice-to-Have Spaces');
  addBulletList(niceToHaveSpaces);

  // ==========================================================================
  // PAGE 5 - DESIGN IDENTITY (always show, with "not completed" if no data)
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Design Identity');

  // FIX 4: Always show Design Identity section, with proper handling of missing data
  if (!hasTasteData) {
    // No taste data - show message
    currentY = checkPageBreak(20);
    doc.setFillColor(...COLORS.accentLight);
    doc.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'F');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Taste Exploration not yet completed', margin + 8, currentY + 10);
    doc.setFontSize(8);
    doc.text('Complete the FYI module to generate Design DNA profile', margin + 8, currentY + 18);
    currentY += 35;
  } else {
    // Principal Taste Results
    if (principalTasteResults) {
      addSubsectionTitle('Principal Design DNA');

      // Style Label
      const principalStyleLabel = principalTasteResults.styleLabel || principalTasteResults.dominant || null;
      if (principalStyleLabel) {
        addLabelValue('Style Profile', principalStyleLabel);
      }

      // DNA Scores
      const principalDNA = principalTasteResults.dnaScores || principalTasteResults;

      currentY += 5;

      if (principalDNA.styleEra !== undefined) {
        addDNAScoreBar('Style Era', principalDNA.styleEra, 'Contemporary', 'Traditional');
      }

      if (principalDNA.visualDensity !== undefined) {
        addDNAScoreBar('Visual Density', principalDNA.visualDensity, 'Minimal', 'Layered');
      }

      if (principalDNA.moodPalette !== undefined) {
        addDNAScoreBar('Mood Palette', principalDNA.moodPalette, 'Cool', 'Warm');
      }
    }

    // Secondary Taste Results (if exists)
    if (secondaryTasteResults) {
      currentY += 10;
      addSubsectionTitle('Secondary Design DNA');

      const secondaryStyleLabel = secondaryTasteResults.styleLabel || secondaryTasteResults.dominant || null;
      if (secondaryStyleLabel) {
        addLabelValue('Style Profile', secondaryStyleLabel);
      }

      const secondaryDNA = secondaryTasteResults.dnaScores || secondaryTasteResults;

      currentY += 5;

      if (secondaryDNA.styleEra !== undefined) {
        addDNAScoreBar('Style Era', secondaryDNA.styleEra, 'Contemporary', 'Traditional');
      }

      if (secondaryDNA.visualDensity !== undefined) {
        addDNAScoreBar('Visual Density', secondaryDNA.visualDensity, 'Minimal', 'Layered');
      }

      if (secondaryDNA.moodPalette !== undefined) {
        addDNAScoreBar('Mood Palette', secondaryDNA.moodPalette, 'Cool', 'Warm');
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
