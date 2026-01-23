/**
 * KYCReportGenerator.js
 *
 * Generates comprehensive KYC PDF reports following N4S brand standards.
 * COMPREHENSIVE REPORT: All 9 sections with compact formatting.
 *
 * Sections included:
 * P1.A.1 - Portfolio Context
 * P1.A.2 - Family & Household
 * P1.A.3 - Project Parameters
 * P1.A.4 - Budget Framework
 * P1.A.5 - Design Identity (includes Taste Profile)
 * P1.A.6 - Lifestyle & Living (includes LuXeBrief data)
 * P1.A.7 - Space Requirements
 * P1.A.8 - Cultural Context
 * P1.A.9 - Working Preferences
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
  green: [76, 175, 80],      // Success green
  teal: [49, 151, 149],      // Secondary color
};

// ==========================================================================
// LABEL MAPPINGS
// ==========================================================================

const PROPERTY_ROLE_LABELS = {
  'primary': 'Primary Residence',
  'secondary': 'Secondary/Vacation Home',
  'vacation': 'Vacation Property',
  'investment': 'Investment Property',
  'legacy': 'Legacy/Generational Asset',
};

const INVESTMENT_HORIZON_LABELS = {
  'forever': 'Forever Home',
  '10yr': '10+ Years',
  '5yr': '5-10 Years',
  'generational': 'Generational (Multi-decade)',
};

const EXIT_STRATEGY_LABELS = {
  'personal': 'Personal Use Only',
  'rental': 'Rental Potential',
  'sale': 'Future Sale',
  'inheritance': 'Family Inheritance',
};

const LIFE_STAGE_LABELS = {
  'building': 'Building Career/Family',
  'established': 'Established',
  'empty-nest': 'Empty Nest',
  'retirement': 'Retirement',
  'multi-gen': 'Multi-Generational',
};

const STAFFING_LEVEL_LABELS = {
  'none': 'No Staff',
  'part_time': 'Part-Time Staff',
  'full_time': 'Full-Time Staff',
  'live_in': 'Live-In Staff',
};

const SITE_TYPOLOGY_LABELS = {
  'hillside': 'Hillside',
  'waterfront': 'Waterfront',
  'urban': 'Urban',
  'suburban': 'Suburban',
  'rural': 'Rural',
  'desert': 'Desert',
};

const PROPERTY_TYPE_LABELS = {
  'new-build': 'New Construction',
  'renovation': 'Renovation',
  'addition': 'Addition',
  'interior-only': 'Interior Only',
};

const TIMELINE_LABELS = {
  'urgent': 'Urgent (< 12 months)',
  '12-18mo': '12-18 Months',
  '18-24mo': '18-24 Months',
  '24plus': '24+ Months',
};

const BUDGET_FLEXIBILITY_LABELS = {
  'fixed': 'Fixed Budget',
  'flexible': 'Flexible (+/- 15%)',
  'investment': 'Investment Grade (No Cap)',
};

const QUALITY_TIERS = {
  'select': { label: 'I - Select', short: 'The Curated Standard' },
  'reserve': { label: 'II - Reserve', short: 'Exceptional Materials' },
  'signature': { label: 'III - Signature', short: 'Bespoke Design' },
  'legacy': { label: 'IV - Legacy', short: 'Enduring Heritage' },
};

const WFH_LABELS = {
  'never': 'Never',
  'sometimes': '1-2 Days/Week',
  'often': '3-4 Days/Week',
  'always': 'Full Remote',
};

const ENTERTAINING_FREQ_LABELS = {
  'rarely': 'Rarely',
  'monthly': 'Monthly',
  'weekly': 'Weekly',
  'daily': 'Daily',
};

const ENTERTAINING_STYLE_LABELS = {
  'formal': 'Formal',
  'casual': 'Casual',
  'both': 'Both',
};

const GARAGE_SIZE_LABELS = {
  '2-car': '2-Car',
  '3-car': '3-Car',
  '4-car': '4-Car',
  '6-car': '6-Car',
  '8-car': '8-Car Gallery',
  '10-car': '10-Car Gallery',
  '12+-car': '12+ Car Gallery',
};

const COMMUNICATION_STYLE_LABELS = {
  'direct': 'Direct & Efficient',
  'relational': 'Relational & Collaborative',
  'visual': 'Visual-First',
};

const DECISION_CADENCE_LABELS = {
  'weekly': 'Weekly Check-ins',
  'milestone': 'Milestone-Based',
  'hands-off': 'Hands-Off (Results Only)',
};

const SPACE_LABELS = {
  'primary-suite': 'Primary Suite',
  'secondary-suites': 'Guest Suites',
  'kids-bedrooms': "Children's Bedrooms",
  'great-room': 'Great Room/Living',
  'formal-living': 'Formal Living',
  'family-room': 'Family Room',
  'formal-dining': 'Formal Dining',
  'casual-dining': 'Casual Dining',
  'chef-kitchen': "Chef's Kitchen",
  'catering-kitchen': 'Catering Kitchen',
  'home-office': 'Home Office',
  'library': 'Library',
  'media-room': 'Media Room',
  'game-room': 'Game Room',
  'wine-cellar': 'Wine Cellar',
  'gym': 'Home Gym',
  'spa-wellness': 'Spa/Wellness',
  'pool-indoor': 'Indoor Pool',
  'sauna': 'Sauna',
  'steam-room': 'Steam Room',
  'staff-quarters': 'Staff Quarters',
  'mudroom': 'Mudroom',
  'laundry': 'Laundry',
  'art-gallery': 'Art Gallery',
  'music-room': 'Music Room',
  'safe-room': 'Safe Room',
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

const formatCurrency = (value) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatNumber = (value) => {
  if (value === undefined || value === null || value === '') return '—';
  return new Intl.NumberFormat('en-US').format(value);
};

const getLabel = (map, value, fallback = '—') => {
  return map[value] || value || fallback;
};

const formatArray = (arr, labelMap = null) => {
  if (!arr || arr.length === 0) return '—';
  if (labelMap) {
    return arr.map(v => labelMap[v] || v).join(', ');
  }
  return arr.join(', ');
};

/**
 * Generate comprehensive KYC Report PDF
 */
export const generateKYCReport = async (kycData) => {
  console.log('[KYC Report] Generating comprehensive report...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 0;
  let pageNumber = 1;
  let totalPages = 1;

  // Extract data
  const principal = kycData?.principal || {};
  const secondary = kycData?.secondary || {};

  // Section data
  const portfolioContext = principal.portfolioContext || {};
  const familyHousehold = principal.familyHousehold || {};
  const projectParameters = principal.projectParameters || {};
  const budgetFramework = principal.budgetFramework || {};
  const designIdentity = principal.designIdentity || {};
  const lifestyleLiving = principal.lifestyleLiving || {};
  const spaceRequirements = principal.spaceRequirements || {};
  const culturalContext = principal.culturalContext || {};
  const workingPreferences = principal.workingPreferences || {};

  // Secondary respondent data (for P1.A.5, 6, 7)
  const secondaryDesignIdentity = secondary.designIdentity || {};
  const secondaryLifestyleLiving = secondary.lifestyleLiving || {};
  const secondarySpaceRequirements = secondary.spaceRequirements || {};

  // Client info
  const clientName = [portfolioContext.principalFirstName, portfolioContext.principalLastName].filter(Boolean).join(' ') || 'Client';
  const secondaryClientName = [portfolioContext.secondaryFirstName, portfolioContext.secondaryLastName].filter(Boolean).join(' ') || null;
  const projectName = projectParameters.projectName || 'Luxury Residence';

  // ==========================================================================
  // HELPER FUNCTIONS FOR LAYOUT
  // ==========================================================================

  const addHeader = () => {
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, pageWidth, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.white);
    doc.text('N4S', margin, 7);
    doc.setFont('helvetica', 'normal');
    doc.text('Know Your Client Report', pageWidth - margin, 7, { align: 'right' });
  };

  const addFooter = (pageNum) => {
    const footerY = pageHeight - 8;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${clientName} — ${projectName}`, margin, footerY);
    doc.text(`Page ${pageNum}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(formatDate(new Date()), pageWidth - margin, footerY, { align: 'right' });
  };

  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    return 18;
  };

  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 15) {
      currentY = addNewPage();
    }
    return currentY;
  };

  const addSectionHeader = (code, title) => {
    currentY = checkPageBreak(12);
    doc.setFillColor(...COLORS.kycBlue);
    doc.roundedRect(margin, currentY, contentWidth, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.white);
    doc.text(`${code}  ${title}`, margin + 3, currentY + 5.5);
    currentY += 11;
  };

  const addSubsection = (title) => {
    currentY = checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.navy);
    doc.text(title, margin, currentY);
    currentY += 4;
  };

  const addRow = (label, value, indent = 0) => {
    currentY = checkPageBreak(5);
    const labelWidth = 50;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(label, margin + indent, currentY);
    doc.setTextColor(...COLORS.text);
    const displayValue = value !== undefined && value !== null && value !== '' ? String(value) : '—';
    const lines = doc.splitTextToSize(displayValue, contentWidth - labelWidth - indent);
    doc.text(lines, margin + labelWidth + indent, currentY);
    currentY += Math.max(lines.length * 3.5, 4);
  };

  const addCompactRow = (label, value) => {
    currentY = checkPageBreak(4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${label}: `, margin, currentY);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setTextColor(...COLORS.text);
    const displayValue = value !== undefined && value !== null && value !== '' ? String(value) : '—';
    doc.text(displayValue, margin + labelWidth, currentY);
    currentY += 3.5;
  };

  const addTwoColumn = (label1, value1, label2, value2) => {
    currentY = checkPageBreak(5);
    const colWidth = contentWidth / 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    // Column 1
    doc.setTextColor(...COLORS.textMuted);
    doc.text(label1, margin, currentY);
    doc.setTextColor(...COLORS.text);
    doc.text(String(value1 || '—'), margin + 35, currentY);

    // Column 2
    doc.setTextColor(...COLORS.textMuted);
    doc.text(label2, margin + colWidth, currentY);
    doc.setTextColor(...COLORS.text);
    doc.text(String(value2 || '—'), margin + colWidth + 35, currentY);

    currentY += 4;
  };

  const addBulletList = (items, labelMap = null) => {
    if (!items || items.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('None specified', margin + 3, currentY);
      currentY += 3.5;
      return;
    }
    const displayItems = labelMap ? items.map(i => labelMap[i] || i) : items;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.text);
    // Compact: show as comma-separated on one line if short
    const text = displayItems.join(', ');
    const lines = doc.splitTextToSize(text, contentWidth - 5);
    doc.text(lines, margin + 3, currentY);
    currentY += lines.length * 3.5 + 1;
  };

  const addSpacer = (height = 3) => {
    currentY += height;
  };

  // ==========================================================================
  // PAGE 1 - COVER + CLIENT PROFILE
  // ==========================================================================

  addHeader();
  addFooter(pageNumber);
  currentY = 20;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.navy);
  doc.text('Know Your Client', margin, currentY);
  currentY += 6;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.kycBlue);
  doc.text('Module A — Comprehensive Report', margin, currentY);
  currentY += 10;

  // Client Info Box
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(margin, currentY, contentWidth, secondaryClientName ? 22 : 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text(clientName, margin + 5, currentY + 7);
  if (secondaryClientName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.teal);
    doc.text(`& ${secondaryClientName}`, margin + 5, currentY + 13);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(projectName, margin + 5, secondaryClientName ? currentY + 19 : currentY + 14);
  currentY += secondaryClientName ? 28 : 24;

  // ==========================================================================
  // P1.A.1 - PORTFOLIO CONTEXT
  // ==========================================================================

  addSectionHeader('P1.A.1', 'Portfolio Context');
  addTwoColumn('Property Role', getLabel(PROPERTY_ROLE_LABELS, portfolioContext.thisPropertyRole),
               'Investment Horizon', getLabel(INVESTMENT_HORIZON_LABELS, portfolioContext.investmentHorizon));
  addTwoColumn('Exit Strategy', getLabel(EXIT_STRATEGY_LABELS, portfolioContext.exitStrategy),
               'Life Stage', getLabel(LIFE_STAGE_LABELS, portfolioContext.lifeStage));
  addTwoColumn('Current Properties', portfolioContext.currentPropertyCount || '—',
               'Decision Timeline', portfolioContext.decisionTimeline || '—');
  if (portfolioContext.landAcquisitionCost) {
    addRow('Land Acquisition Cost', formatCurrency(portfolioContext.landAcquisitionCost));
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.2 - FAMILY & HOUSEHOLD
  // ==========================================================================

  addSectionHeader('P1.A.2', 'Family & Household');

  // Family Members
  const familyMembers = familyHousehold.familyMembers || [];
  const adults = familyMembers.filter(m => m.role === 'adult').length || (secondaryClientName ? 2 : 1);
  const children = familyMembers.filter(m => ['teenager', 'child', 'young-child'].includes(m.role)).length;

  addTwoColumn('Adults', adults, 'Children', children);
  addTwoColumn('Staffing Level', getLabel(STAFFING_LEVEL_LABELS, familyHousehold.staffingLevel),
               'Live-In Staff', familyHousehold.liveInStaff || '0');

  if (familyHousehold.pets) {
    addRow('Pets', familyHousehold.pets);
  }
  if (familyHousehold.anticipatedFamilyChanges) {
    addRow('Anticipated Changes', familyHousehold.anticipatedFamilyChanges);
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.3 - PROJECT PARAMETERS
  // ==========================================================================

  addSectionHeader('P1.A.3', 'Project Parameters');

  const location = [projectParameters.projectCity, projectParameters.projectCountry].filter(Boolean).join(', ');
  addTwoColumn('Location', location || '—', 'Site Type', getLabel(SITE_TYPOLOGY_LABELS, projectParameters.siteTypology));
  addTwoColumn('Property Type', getLabel(PROPERTY_TYPE_LABELS, projectParameters.propertyType),
               'Timeline', getLabel(TIMELINE_LABELS, projectParameters.timeline));
  addTwoColumn('Target SF', formatNumber(projectParameters.targetGSF) + (projectParameters.targetGSF ? ' sf' : ''),
               'Bedrooms', projectParameters.bedroomCount || '—');
  addTwoColumn('Bathrooms', projectParameters.bathroomCount || '—',
               'Levels Above', projectParameters.levelsAboveArrival || '—');

  if (projectParameters.hasGuestHouse) {
    addRow('Guest House', `Yes — ${projectParameters.guestHouseBedrooms || '?'} bedrooms`);
  }
  if (projectParameters.hasPoolHouse) {
    addRow('Pool House', `Yes — ${projectParameters.poolHouseLocation || 'Location TBD'}`);
  }
  if (projectParameters.complexityFactors?.length > 0) {
    addRow('Complexity Factors', projectParameters.complexityFactors.join(', '));
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.4 - BUDGET FRAMEWORK
  // ==========================================================================

  addSectionHeader('P1.A.4', 'Budget Framework');

  // Budget highlight box
  const totalBudget = budgetFramework.totalProjectBudget || 0;
  const landCost = portfolioContext.landAcquisitionCost || 0;
  const grandTotal = totalBudget + landCost;

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  doc.text('GRAND TOTAL (Land + Project)', margin + 4, currentY + 5);
  doc.setFontSize(11);
  doc.text(formatCurrency(grandTotal), pageWidth - margin - 4, currentY + 8, { align: 'right' });
  currentY += 15;

  addTwoColumn('Project Budget', formatCurrency(totalBudget), 'Interior Budget', formatCurrency(budgetFramework.interiorBudget));
  addTwoColumn('Per SF Target', budgetFramework.perSFExpectation ? `$${budgetFramework.perSFExpectation}/sf` : '—',
               'Flexibility', getLabel(BUDGET_FLEXIBILITY_LABELS, budgetFramework.budgetFlexibility));

  const tier = QUALITY_TIERS[budgetFramework.interiorQualityTier];
  if (tier) {
    addRow('Quality Tier', `${tier.label} — ${tier.short}`);
  }

  if (budgetFramework.artBudgetSeparate && budgetFramework.artBudgetAmount) {
    addRow('Art Budget', formatCurrency(budgetFramework.artBudgetAmount) + ' (separate)');
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.5 - DESIGN IDENTITY
  // ==========================================================================

  addSectionHeader('P1.A.5', 'Design Identity');

  const principalTaste = designIdentity.principalTasteResults;
  const secondaryTaste = designIdentity.secondaryTasteResults;

  if (principalTaste?.completedAt) {
    addSubsection(`Principal Taste Profile${portfolioContext.principalFirstName ? ` (${portfolioContext.principalFirstName})` : ''}`);
    const pScores = principalTaste.profile?.scores || {};
    if (pScores.tradition !== undefined) {
      const style = pScores.tradition < 4 ? 'Contemporary' : pScores.tradition > 6 ? 'Traditional' : 'Transitional';
      addCompactRow('Style', style);
    }
    const dims = ['tradition', 'formality', 'warmth', 'drama', 'openness', 'art_focus'];
    const dimLabels = ['Tradition', 'Formality', 'Warmth', 'Drama', 'Openness', 'Art Focus'];
    dims.forEach((dim, i) => {
      if (pScores[dim] !== undefined) {
        addCompactRow(dimLabels[i], `${pScores[dim].toFixed(1)}/10`);
      }
    });
    addSpacer(2);
  }

  if (secondaryTaste?.completedAt) {
    addSubsection(`Secondary Taste Profile${portfolioContext.secondaryFirstName ? ` (${portfolioContext.secondaryFirstName})` : ''}`);
    const sScores = secondaryTaste.profile?.scores || {};
    if (sScores.tradition !== undefined) {
      const style = sScores.tradition < 4 ? 'Contemporary' : sScores.tradition > 6 ? 'Traditional' : 'Transitional';
      addCompactRow('Style', style);
    }
    const dims = ['tradition', 'formality', 'warmth', 'drama', 'openness', 'art_focus'];
    const dimLabels = ['Tradition', 'Formality', 'Warmth', 'Drama', 'Openness', 'Art Focus'];
    dims.forEach((dim, i) => {
      if (sScores[dim] !== undefined) {
        addCompactRow(dimLabels[i], `${sScores[dim].toFixed(1)}/10`);
      }
    });
    addSpacer(2);
  }

  if (!principalTaste?.completedAt && !secondaryTaste?.completedAt) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Taste Exploration not yet completed', margin + 3, currentY);
    currentY += 4;
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.6 - LIFESTYLE & LIVING
  // ==========================================================================

  addSectionHeader('P1.A.6', 'Lifestyle & Living');

  // LuXeBrief Status
  addSubsection('LuXeBrief Questionnaires');
  const pLifestyleStatus = lifestyleLiving.luxeBriefStatus || 'not_sent';
  const pLivingStatus = lifestyleLiving.luxeLivingStatus || 'not_sent';
  addTwoColumn('Principal Lifestyle', pLifestyleStatus === 'completed' ? 'Completed' : pLifestyleStatus === 'sent' ? 'Awaiting' : 'Not Sent',
               'Principal Living', pLivingStatus === 'completed' ? 'Completed' : pLivingStatus === 'sent' ? 'Awaiting' : 'Not Sent');

  if (secondaryLifestyleLiving.luxeBriefStatus || secondaryLifestyleLiving.luxeLivingStatus) {
    const sLifestyleStatus = secondaryLifestyleLiving.luxeBriefStatus || 'not_sent';
    const sLivingStatus = secondaryLifestyleLiving.luxeLivingStatus || 'not_sent';
    addTwoColumn('Secondary Lifestyle', sLifestyleStatus === 'completed' ? 'Completed' : sLifestyleStatus === 'sent' ? 'Awaiting' : 'Not Sent',
                 'Secondary Living', sLivingStatus === 'completed' ? 'Completed' : sLivingStatus === 'sent' ? 'Awaiting' : 'Not Sent');
  }
  addSpacer(2);

  // Work From Home
  addSubsection('Work & Office');
  addTwoColumn('WFH Frequency', getLabel(WFH_LABELS, lifestyleLiving.workFromHome),
               'Dedicated Offices', lifestyleLiving.wfhPeopleCount || '0');
  if (lifestyleLiving.officeRequirements) {
    addRow('Office Needs', lifestyleLiving.officeRequirements);
  }

  // Entertainment
  addSubsection('Entertainment');
  addTwoColumn('Frequency', getLabel(ENTERTAINING_FREQ_LABELS, lifestyleLiving.entertainingFrequency),
               'Style', getLabel(ENTERTAINING_STYLE_LABELS, lifestyleLiving.entertainingStyle));
  if (lifestyleLiving.typicalGuestCount) {
    addRow('Typical Guests', lifestyleLiving.typicalGuestCount);
  }

  // Wellness
  if (lifestyleLiving.wellnessPriorities?.length > 0) {
    addSubsection('Wellness Priorities');
    addBulletList(lifestyleLiving.wellnessPriorities);
  }

  // Hobbies
  if (lifestyleLiving.hobbies?.length > 0) {
    addSubsection('Hobbies & Interests');
    addBulletList(lifestyleLiving.hobbies);
  }

  // Lifestyle scales
  if (lifestyleLiving.privacyLevelRequired || lifestyleLiving.noiseSensitivity || lifestyleLiving.indoorOutdoorLiving) {
    addSubsection('Lifestyle Preferences');
    if (lifestyleLiving.privacyLevelRequired) addCompactRow('Privacy Level', `${lifestyleLiving.privacyLevelRequired}/5`);
    if (lifestyleLiving.noiseSensitivity) addCompactRow('Noise Sensitivity', `${lifestyleLiving.noiseSensitivity}/5`);
    if (lifestyleLiving.indoorOutdoorLiving) addCompactRow('Indoor/Outdoor', `${lifestyleLiving.indoorOutdoorLiving}/5`);
  }

  if (lifestyleLiving.dailyRoutinesSummary) {
    addSubsection('Daily Routines');
    addRow('Summary', lifestyleLiving.dailyRoutinesSummary);
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.7 - SPACE REQUIREMENTS
  // ==========================================================================

  addSectionHeader('P1.A.7', 'Space Requirements');

  // Interior Spaces
  addSubsection('Interior Spaces');
  if (spaceRequirements.mustHaveSpaces?.length > 0) {
    addCompactRow('Must Have', '');
    addBulletList(spaceRequirements.mustHaveSpaces, SPACE_LABELS);
  }
  if (spaceRequirements.niceToHaveSpaces?.length > 0) {
    addCompactRow('Nice to Have', '');
    addBulletList(spaceRequirements.niceToHaveSpaces, SPACE_LABELS);
  }

  // Additional room questions
  const additionalRooms = [];
  if (spaceRequirements.wantsSeparateFamilyRoom) additionalRooms.push('Separate Family Room');
  if (spaceRequirements.wantsSecondFormalLiving) additionalRooms.push('Second Formal Living');
  if (spaceRequirements.wantsBar) additionalRooms.push('Bar');
  if (spaceRequirements.wantsBunkRoom) additionalRooms.push('Bunk Room');
  if (spaceRequirements.wantsBreakfastNook) additionalRooms.push('Breakfast Nook');
  if (additionalRooms.length > 0) {
    addRow('Additional Rooms', additionalRooms.join(', '));
  }

  // Garage
  if (spaceRequirements.garageSize) {
    addSubsection('Garage');
    addRow('Size', getLabel(GARAGE_SIZE_LABELS, spaceRequirements.garageSize));
    if (spaceRequirements.garageFeatures?.length > 0) {
      addRow('Features', spaceRequirements.garageFeatures.join(', '));
    }
  }

  // Exterior Amenities - Compact format
  const exteriorCategories = [
    { key: 'PoolWater', label: 'Pool & Water' },
    { key: 'Sport', label: 'Sports & Rec' },
    { key: 'OutdoorLiving', label: 'Outdoor Living' },
    { key: 'Garden', label: 'Gardens' },
    { key: 'Structures', label: 'Structures' },
    { key: 'Access', label: 'Access Features' },
  ];

  let hasExterior = false;
  exteriorCategories.forEach(cat => {
    const mustHave = spaceRequirements[`mustHave${cat.key}`] || [];
    const wouldLike = spaceRequirements[`wouldLike${cat.key}`] || [];
    if (mustHave.length > 0 || wouldLike.length > 0) {
      if (!hasExterior) {
        addSubsection('Exterior Amenities');
        hasExterior = true;
      }
      const all = [...mustHave.map(i => `${i} (M)`), ...wouldLike.map(i => `${i} (W)`)];
      addRow(cat.label, all.join(', '));
    }
  });

  // Technology & Sustainability
  if (spaceRequirements.technologyRequirements?.length > 0) {
    addSubsection('Technology');
    addBulletList(spaceRequirements.technologyRequirements);
  }
  if (spaceRequirements.sustainabilityPriorities?.length > 0) {
    addSubsection('Sustainability');
    addBulletList(spaceRequirements.sustainabilityPriorities);
  }

  // View & Privacy
  if (spaceRequirements.viewPriorityRooms?.length > 0) {
    addRow('View Priority Rooms', formatArray(spaceRequirements.viewPriorityRooms, SPACE_LABELS));
  }
  if (spaceRequirements.minimumLotSize || spaceRequirements.minimumSetback) {
    addTwoColumn('Min Lot Size', spaceRequirements.minimumLotSize || '—',
                 'Min Setback', spaceRequirements.minimumSetback || '—');
  }

  // Pain Points
  if (spaceRequirements.currentSpacePainPoints) {
    addSubsection('Current Pain Points');
    addRow('', spaceRequirements.currentSpacePainPoints);
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.8 - CULTURAL CONTEXT
  // ==========================================================================

  addSectionHeader('P1.A.8', 'Cultural Context');

  if (culturalContext.culturalBackground) {
    addRow('Cultural Background', culturalContext.culturalBackground);
  }
  if (culturalContext.regionalSensibilities?.length > 0) {
    addRow('Regional Sensibilities', culturalContext.regionalSensibilities.join(', '));
  }
  if (culturalContext.religiousObservances) {
    addRow('Religious Observances', culturalContext.religiousObservances);
  }
  if (culturalContext.entertainingCulturalNorms) {
    addRow('Cultural Entertaining Norms', culturalContext.entertainingCulturalNorms);
  }
  if (culturalContext.crossCulturalRequirements) {
    addRow('Cross-Cultural Requirements', culturalContext.crossCulturalRequirements);
  }
  if (culturalContext.languagesPreferred?.length > 0) {
    addRow('Preferred Languages', culturalContext.languagesPreferred.join(', '));
  }

  // If nothing in cultural context
  if (!culturalContext.culturalBackground && !culturalContext.regionalSensibilities?.length &&
      !culturalContext.religiousObservances && !culturalContext.entertainingCulturalNorms) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('No cultural context specified', margin + 3, currentY);
    currentY += 4;
  }
  addSpacer(2);

  // ==========================================================================
  // P1.A.9 - WORKING PREFERENCES
  // ==========================================================================

  addSectionHeader('P1.A.9', 'Working Preferences');

  addTwoColumn('Communication Style', getLabel(COMMUNICATION_STYLE_LABELS, workingPreferences.communicationStyle),
               'Decision Cadence', getLabel(DECISION_CADENCE_LABELS, workingPreferences.decisionCadence));

  if (workingPreferences.collaborationStyle) {
    addRow('Collaboration Style', workingPreferences.collaborationStyle);
  }
  if (workingPreferences.presentationFormat) {
    addRow('Presentation Format', workingPreferences.presentationFormat);
  }
  if (workingPreferences.architectCelebrityPreference) {
    addTwoColumn('Architect Celebrity Pref', `${workingPreferences.architectCelebrityPreference}/5`,
                 'Designer Celebrity Pref', `${workingPreferences.interiorDesignerCelebrityPreference || '—'}/5`);
  }
  if (workingPreferences.previousDesignerExperience) {
    addRow('Previous Experience', workingPreferences.previousDesignerExperience);
  }
  if (workingPreferences.redFlagsToAvoid) {
    addRow('Red Flags to Avoid', workingPreferences.redFlagsToAvoid);
  }

  // If nothing in working preferences
  if (!workingPreferences.communicationStyle && !workingPreferences.decisionCadence) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('No working preferences specified', margin + 3, currentY);
    currentY += 4;
  }

  // ==========================================================================
  // UPDATE TOTAL PAGES & SAVE
  // ==========================================================================

  totalPages = pageNumber;

  // Update all footers with correct total
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 8;
    doc.setFillColor(...COLORS.white);
    doc.rect(pageWidth / 2 - 15, footerY - 3, 30, 5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
  }

  // Save
  const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = `N4S-KYC-Report-${safeClientName}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  console.log('[KYC Report] Generated:', filename, `(${totalPages} pages)`);
  return filename;
};

export default generateKYCReport;
