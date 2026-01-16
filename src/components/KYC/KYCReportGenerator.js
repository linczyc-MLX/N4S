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
  green: [76, 175, 80],      // Success green for alignment
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

// FIX 1: Quality Tier labels with EXACT descriptions from UI
const QUALITY_TIERS = {
  'select': {
    label: 'I - Select: The Curated Standard',
    description: 'Every material and finish selected for aesthetic harmony and durability. A sophisticated, complete experience for those who value refined design without extensive customization.'
  },
  'reserve': {
    label: 'II - Reserve: Exceptional Materials',
    description: 'Features finishes sourced from specialized production—hand-selected stone and artisanal millwork chosen for unique qualities. For clients who desire a distinctly personal home.'
  },
  'signature': {
    label: 'III - Signature: Bespoke Design',
    description: 'Custom-engineered solutions and unique design elements tailored to a specific lifestyle. Each space features hallmarks of world-class craftsmanship.'
  },
  'legacy': {
    label: 'IV - Legacy: Enduring Heritage',
    description: 'The pinnacle of the program. High-quality sustainable materials and advanced technologies. Designed to endure as a generational asset maintaining prestige for the future.'
  }
};

const getQualityTierLabel = (tier) => {
  return QUALITY_TIERS[tier]?.label || tier || 'Not specified';
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
  const secondary = kycData?.secondary || null;

  // P1.A.1 - Portfolio Context
  const portfolioContext = principal.portfolioContext || {};
  const principalFirstName = portfolioContext.principalFirstName || '';
  const principalLastName = portfolioContext.principalLastName || '';
  const clientName = [principalFirstName, principalLastName].filter(Boolean).join(' ') || 'Client';
  const thisPropertyRole = portfolioContext.thisPropertyRole;
  const investmentHorizon = portfolioContext.investmentHorizon;
  const landAcquisitionCost = portfolioContext.landAcquisitionCost || 0;

  // Secondary stakeholder info
  const secondaryFirstName = portfolioContext.secondaryFirstName || '';
  const secondaryLastName = portfolioContext.secondaryLastName || '';
  const secondaryName = [secondaryFirstName, secondaryLastName].filter(Boolean).join(' ') || null;

  // P1.A.2 - Family & Household
  const familyHousehold = principal.familyHousehold || {};
  const familyMembers = familyHousehold.familyMembers || [];

  // FIX 2: Adults Count - Simple check: if secondary exists, 2 adults, else 1
  const adultsCount = secondary ? 2 : (secondaryName ? 2 : 1);

  // Children count from familyMembers
  const childrenCount = familyMembers.filter(m =>
    m.role === 'teenager' || m.role === 'child' || m.role === 'young-child'
  ).length;
  const staffingLevel = familyHousehold.staffingLevel;

  // P1.A.3 - Project Parameters
  const projectParameters = principal.projectParameters || {};
  const projectName = projectParameters.projectName || 'Luxury Residence Project';
  const bedroomCount = projectParameters.bedroomCount;

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

  // Extract taste results - data comes from DesignIdentitySection
  // Structure: { clientId, selections, profile: { scores: {...} }, completedAt }
  const principalTasteResults = designIdentity.principalTasteResults || null;
  const secondaryTasteResults = designIdentity.secondaryTasteResults || null;

  // Check if we have actual completed taste data
  const hasPrincipalTaste = !!(principalTasteResults?.completedAt);
  const hasSecondaryTaste = !!(secondaryTasteResults?.completedAt);
  const hasTasteData = hasPrincipalTaste || hasSecondaryTaste;

  // Get style label from tradition score (1-10 scale)
  // Low tradition = Contemporary, High tradition = Traditional
  const getStyleLabelFromTradition = (tradition) => {
    if (!tradition) return null;
    if (tradition < 4) return 'Contemporary';
    if (tradition > 6) return 'Traditional';
    return 'Transitional';
  };

  // Get profile scores (6 FYI dimensions, 1-10 scale)
  const getProfileScores = (tasteResults) => {
    if (!tasteResults?.profile?.scores) return null;
    return tasteResults.profile.scores;
  };

  const principalScores = hasPrincipalTaste ? getProfileScores(principalTasteResults) : null;
  const secondaryScores = hasSecondaryTaste ? getProfileScores(secondaryTasteResults) : null;

  // Calculate alignment percentage from all 6 dimensions
  const calculateAlignment = () => {
    if (!principalScores || !secondaryScores) return null;
    const dimensions = ['tradition', 'formality', 'warmth', 'drama', 'openness', 'art_focus'];
    let totalDiff = 0;

    dimensions.forEach(dim => {
      const p = principalScores[dim] || 5;
      const s = secondaryScores[dim] || 5;
      totalDiff += Math.abs(p - s);
    });

    const avgDiff = totalDiff / dimensions.length;
    // Max diff is 9 (1 to 10 scale), convert to percentage
    return Math.max(0, Math.round(100 - (avgDiff / 9 * 100)));
  };
  const alignmentScore = (hasPrincipalTaste && hasSecondaryTaste) ? calculateAlignment() : null;

  // Get combined DNA scores from profile.scores (1-10 scale, averaged)
  const getCombinedDNA = () => {
    if (!hasPrincipalTaste || !hasSecondaryTaste) return null;
    const pScores = principalScores || {};
    const sScores = secondaryScores || {};

    const getCombined = (attr) => {
      const p = pScores[attr] || 5;
      const s = sScores[attr] || 5;
      return Math.round(((p + s) / 2) * 10) / 10;
    };

    return {
      tradition: getCombined('tradition'),
      formality: getCombined('formality'),
      warmth: getCombined('warmth'),
      drama: getCombined('drama'),
      openness: getCombined('openness'),
      artFocus: getCombined('art_focus')
    };
  };
  const combinedDNA = getCombinedDNA();

  // Log extracted values for debugging
  console.log('[KYC Report] Extracted values:', {
    clientName,
    secondaryName: secondaryName,
    projectName,
    thisPropertyRole,
    investmentHorizon,
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
  });
  console.log('[KYC Report] Design Identity:', {
    hasPrincipalTaste,
    hasSecondaryTaste,
    hasTasteData,
    principalTasteResults,
    secondaryTasteResults,
    principalScores,
    secondaryScores,
    alignmentScore,
    combinedDNA,
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

  // Helper for multi-line label/value with description
  const addLabelValueWithDescription = (label, value, description, indent = 0) => {
    currentY = checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(label, margin + indent, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const displayValue = value !== undefined && value !== null && value !== '' ? String(value) : 'Not specified';
    doc.text(displayValue, margin + indent + 55, currentY);
    currentY += 6;

    if (description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      const descLines = doc.splitTextToSize(description, contentWidth - indent);
      doc.text(descLines, margin + indent, currentY);
      currentY += descLines.length * 3.5 + 4;
    }
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
      const displayItem = getSpaceLabel(item);
      const lines = doc.splitTextToSize(String(displayItem), contentWidth - indent - 8);
      doc.text(lines, margin + indent + 5, currentY);
      currentY += lines.length * 4 + 2;
    });
    currentY += 2;
  };

  // Helper to add DNA score bar visualization (0-10 scale)
  const addDNAScoreBar = (label, score, leftLabel, rightLabel, maxScore = 10) => {
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

    // Score marker
    const markerPos = barX + (score / maxScore) * barWidth;
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

  // Helper to add alignment score badge
  const addAlignmentBadge = (score) => {
    if (score === undefined || score === null) return;

    currentY = checkPageBreak(30);

    // Background box
    doc.setFillColor(...COLORS.accentLight);
    doc.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);
    doc.text('PARTNER ALIGNMENT', margin + 8, currentY + 10);

    // Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.green);
    doc.text(`${Math.round(score)}%`, pageWidth - margin - 8, currentY + 15, { align: 'right' });

    currentY += 30;
  };

  // Helper to add combined DNA scores grid
  const addCombinedDNAGrid = (dna) => {
    if (!dna) return;

    currentY = checkPageBreak(50);

    addSubsectionTitle('Combined Design DNA');

    const dimensions = [
      { key: 'tradition', label: 'Tradition' },
      { key: 'formality', label: 'Formality' },
      { key: 'warmth', label: 'Warmth' },
      { key: 'drama', label: 'Drama' },
      { key: 'openness', label: 'Openness' },
      { key: 'artFocus', label: 'Art Focus' },
    ];

    dimensions.forEach(dim => {
      const value = dna[dim.key];
      if (value !== undefined && value !== null) {
        addDNAScoreBar(dim.label, value, '0', '10', 10);
      }
    });
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

  // FIX 1: Quality Tier with EXACT descriptions from UI
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
  // PAGE 5 - DESIGN IDENTITY
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Design Identity');

  // Design Identity section - display 6-dimension DNA scores
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
    // Principal Design Profile
    if (hasPrincipalTaste && principalScores) {
      addSubsectionTitle(`Principal Design Profile${principalFirstName ? ` (${principalFirstName})` : ''}`);

      // Style Label (derived from tradition score)
      const principalStyleLabel = getStyleLabelFromTradition(principalScores.tradition);
      if (principalStyleLabel) {
        addLabelValue('Style', principalStyleLabel);
      }

      currentY += 3;

      // 6-Dimension DNA Score Bars (1-10 scale)
      if (principalScores.tradition !== undefined) {
        addDNAScoreBar('Tradition', principalScores.tradition, 'Contemporary', 'Traditional', 10);
      }
      if (principalScores.formality !== undefined) {
        addDNAScoreBar('Formality', principalScores.formality, 'Casual', 'Formal', 10);
      }
      if (principalScores.warmth !== undefined) {
        addDNAScoreBar('Warmth', principalScores.warmth, 'Cool', 'Warm', 10);
      }
      if (principalScores.drama !== undefined) {
        addDNAScoreBar('Drama', principalScores.drama, 'Subtle', 'Bold', 10);
      }
      if (principalScores.openness !== undefined) {
        addDNAScoreBar('Openness', principalScores.openness, 'Enclosed', 'Open', 10);
      }
      if (principalScores.art_focus !== undefined) {
        addDNAScoreBar('Art Focus', principalScores.art_focus, 'Understated', 'Gallery-like', 10);
      }
    }

    // Partner Design Profile (Secondary)
    if (hasSecondaryTaste && secondaryScores) {
      currentY += 8;
      addSubsectionTitle(`Partner Design Profile${secondaryFirstName ? ` (${secondaryFirstName})` : ''}`);

      // Style Label
      const secondaryStyleLabel = getStyleLabelFromTradition(secondaryScores.tradition);
      if (secondaryStyleLabel) {
        addLabelValue('Style', secondaryStyleLabel);
      }

      currentY += 3;

      // 6-Dimension DNA Score Bars
      if (secondaryScores.tradition !== undefined) {
        addDNAScoreBar('Tradition', secondaryScores.tradition, 'Contemporary', 'Traditional', 10);
      }
      if (secondaryScores.formality !== undefined) {
        addDNAScoreBar('Formality', secondaryScores.formality, 'Casual', 'Formal', 10);
      }
      if (secondaryScores.warmth !== undefined) {
        addDNAScoreBar('Warmth', secondaryScores.warmth, 'Cool', 'Warm', 10);
      }
      if (secondaryScores.drama !== undefined) {
        addDNAScoreBar('Drama', secondaryScores.drama, 'Subtle', 'Bold', 10);
      }
      if (secondaryScores.openness !== undefined) {
        addDNAScoreBar('Openness', secondaryScores.openness, 'Enclosed', 'Open', 10);
      }
      if (secondaryScores.art_focus !== undefined) {
        addDNAScoreBar('Art Focus', secondaryScores.art_focus, 'Understated', 'Gallery-like', 10);
      }
    }

    // Partner Alignment Score
    if (alignmentScore !== null) {
      currentY += 8;
      addAlignmentBadge(alignmentScore);
    }

    // Combined Design DNA (6 dimensions averaged)
    if (combinedDNA) {
      addCombinedDNAGrid(combinedDNA);
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
