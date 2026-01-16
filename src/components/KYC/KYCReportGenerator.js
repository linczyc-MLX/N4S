/**
 * KYCReportGenerator.js
 *
 * Generates comprehensive KYC PDF reports following N4S brand standards.
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
  if (!value) return 'Not specified';
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

const getPortfolioContextLabel = (context) => {
  const labels = {
    'forever-home': 'Forever Home (15+ years)',
    'primary-residence': 'Primary Residence (10-15 years)',
    'medium-term': 'Medium-Term (5-10 years)',
    'investment': 'Investment Property (<5 years)',
    'spec-build': 'Spec Development (Build to Sell)',
  };
  return labels[context] || context || 'Not specified';
};

const getQualityTierLabel = (tier) => {
  const labels = {
    'select': 'I - Select (The Curated Standard)',
    'reserve': 'II - Reserve (Exceptional Materials)',
    'signature': 'III - Signature (Bespoke Design)',
    'legacy': 'IV - Legacy (Enduring Heritage)',
  };
  return labels[tier] || tier || 'Not specified';
};

/**
 * Generate KYC Report PDF
 * @param {object} kycData - Full KYC data from AppContext
 */
export const generateKYCReport = async (kycData) => {
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
  let totalPages = 7; // Estimate, will be updated

  // Extract data
  const principal = kycData?.principal || {};
  const portfolioContext = principal.portfolioContext || {};
  const projectParams = principal.projectParameters || {};
  const budgetFramework = principal.budgetFramework || {};
  const siteRequirements = principal.siteRequirements || {};
  const operatingModel = principal.operatingModel || {};
  const lifestyle = principal.lifestyle || {};
  const designIdentity = principal.designIdentity || {};

  // Build client name
  let clientName = 'Client';
  if (portfolioContext.principalFirstName && portfolioContext.principalLastName) {
    if (portfolioContext.secondaryFirstName && portfolioContext.secondaryLastName === portfolioContext.principalLastName) {
      clientName = `${portfolioContext.principalFirstName} & ${portfolioContext.secondaryFirstName} ${portfolioContext.principalLastName}`;
    } else if (portfolioContext.secondaryFirstName && portfolioContext.secondaryLastName) {
      clientName = `${portfolioContext.principalFirstName} ${portfolioContext.principalLastName} & ${portfolioContext.secondaryFirstName} ${portfolioContext.secondaryLastName}`;
    } else {
      clientName = `${portfolioContext.principalFirstName} ${portfolioContext.principalLastName}`;
    }
  }

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
    doc.text(String(value || 'Not specified'), margin + indent + 50, currentY);
    currentY += 6;
  };

  const addParagraph = (text, indent = 0) => {
    if (!text) return;
    currentY = checkPageBreak(15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, currentY);
    currentY += lines.length * 4 + 4;
  };

  const addBulletList = (items, indent = 5) => {
    if (!items || items.length === 0) return;
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
  // PAGE 1 - CLIENT OVERVIEW
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
  doc.roundedRect(margin, currentY, contentWidth, 45, 3, 3, 'F');

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
  doc.text(projectParams.projectName || 'Luxury Residence Project', margin + 8, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  const locationText = [projectParams.projectCity, projectParams.projectState].filter(Boolean).join(', ') || 'Location TBD';
  doc.text(locationText, margin + 8, currentY);

  currentY += 20;

  // Project Details
  addSubsectionTitle('Project Overview');
  addLabelValue('Project Type', getPortfolioContextLabel(portfolioContext.portfolioContext));
  addLabelValue('Planning Horizon', portfolioContext.planningHorizon ? `${portfolioContext.planningHorizon} years` : 'Not specified');
  addLabelValue('Target Size', projectParams.targetGSF ? `${projectParams.targetGSF.toLocaleString()} SF` : 'Not specified');
  addLabelValue('Stories', projectParams.stories || 'Not specified');

  currentY += 5;
  addSubsectionTitle('Household Composition');
  addLabelValue('Adults', portfolioContext.adultsCount || 'Not specified');
  addLabelValue('Children', portfolioContext.childrenCount || '0');
  addLabelValue('Live-in Staff', portfolioContext.liveInStaff || '0');

  // ==========================================================================
  // PAGE 2 - BUDGET FRAMEWORK
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Budget Framework');

  const landCost = portfolioContext.landAcquisitionCost || 0;
  const totalBudget = budgetFramework.totalProjectBudget || 0;
  const grandTotal = landCost + totalBudget;

  addLabelValue('Land Acquisition Cost', formatCurrency(landCost));
  addLabelValue('Total Project Budget', formatCurrency(totalBudget));
  addLabelValue('Interior Budget (ID + FF&E)', formatCurrency(budgetFramework.interiorBudget));

  currentY += 5;

  // Grand Total highlight box
  doc.setFillColor(...COLORS.kycBlue);
  doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text('GRAND TOTAL (All-in Project Cost)', margin + 8, currentY + 8);

  doc.setFontSize(14);
  doc.text(formatCurrency(grandTotal), pageWidth - margin - 8, currentY + 12, { align: 'right' });

  currentY += 30;

  addSubsectionTitle('Budget Philosophy');
  const flexibilityLabels = {
    'fixed': 'Fixed Ceiling - Cannot Exceed',
    'flexible': 'Flexible - Some Room for Quality',
    'investment': 'Investment-Appropriate - Value Matters More Than Cost',
  };
  addLabelValue('Flexibility', flexibilityLabels[budgetFramework.budgetFlexibility] || budgetFramework.budgetFlexibility);

  currentY += 5;
  addSubsectionTitle('Quality Standards');
  addLabelValue('Interior Quality Tier', getQualityTierLabel(budgetFramework.interiorQualityTier));

  if (budgetFramework.artBudgetSeparate) {
    addLabelValue('Separate Art Budget', formatCurrency(budgetFramework.artBudgetAmount));
  }

  // ==========================================================================
  // PAGE 3 - SITE REQUIREMENTS
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Site Requirements');

  addSubsectionTitle('Location Preferences');
  addLabelValue('Climate', siteRequirements.climate || 'Not specified');
  addLabelValue('Terrain', siteRequirements.terrain || 'Not specified');
  addLabelValue('Setting', siteRequirements.setting || 'Not specified');

  currentY += 5;
  addSubsectionTitle('Privacy & Views');
  addLabelValue('Privacy Level', siteRequirements.privacyLevel || 'Not specified');

  if (siteRequirements.viewPriorities && siteRequirements.viewPriorities.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('View Priorities:', margin, currentY);
    currentY += 5;
    addBulletList(siteRequirements.viewPriorities);
  }

  currentY += 5;
  addSubsectionTitle('Lot Requirements');
  addLabelValue('Minimum Lot Size', siteRequirements.minLotSize ? `${siteRequirements.minLotSize.toLocaleString()} SF` : 'Not specified');
  addLabelValue('Gated Community', siteRequirements.gatedCommunity ? 'Yes' : 'No preference');
  addLabelValue('HOA Acceptable', siteRequirements.hoaAcceptable === false ? 'No' : 'Yes');

  // ==========================================================================
  // PAGE 4 - OPERATING MODEL
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Operating Model');

  addSubsectionTitle('Staffing');
  addLabelValue('Live-in Staff Count', operatingModel.liveInStaffCount || '0');
  addLabelValue('Daily Staff Count', operatingModel.dailyStaffCount || '0');

  if (operatingModel.staffTypes && operatingModel.staffTypes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Staff Types:', margin, currentY);
    currentY += 5;
    addBulletList(operatingModel.staffTypes);
  }

  currentY += 5;
  addSubsectionTitle('Security');
  addLabelValue('Security Level', operatingModel.securityLevel || 'Standard');
  addLabelValue('24/7 Security Staff', operatingModel.has24HourSecurity ? 'Yes' : 'No');
  addLabelValue('Safe Room Required', operatingModel.safeRoomRequired ? 'Yes' : 'No');

  currentY += 5;
  addSubsectionTitle('Service Expectations');
  addLabelValue('Housekeeping', operatingModel.housekeepingFrequency || 'Not specified');
  addLabelValue('Grounds Maintenance', operatingModel.groundsMaintenanceFrequency || 'Not specified');

  // ==========================================================================
  // PAGE 5 - LIFESTYLE & LIVING
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Lifestyle & Living');

  addSubsectionTitle('Work From Home');
  addLabelValue('WFH Frequency', lifestyle.workFromHomeFrequency || 'Not specified');
  addLabelValue('Dedicated Office Required', lifestyle.dedicatedOffice ? 'Yes' : 'No');
  addLabelValue('Video Conferencing', lifestyle.videoConferencing ? 'Professional setup needed' : 'Standard');

  currentY += 5;
  addSubsectionTitle('Entertainment');
  addLabelValue('Entertaining Style', lifestyle.entertainingStyle || 'Not specified');
  addLabelValue('Frequency', lifestyle.entertainingFrequency || 'Not specified');
  addLabelValue('Typical Guest Count', lifestyle.typicalGuestCount || 'Not specified');

  currentY += 5;
  addSubsectionTitle('Wellness & Recreation');
  if (lifestyle.wellnessActivities && lifestyle.wellnessActivities.length > 0) {
    addBulletList(lifestyle.wellnessActivities);
  } else {
    addParagraph('No specific wellness activities indicated');
  }

  currentY += 5;
  addSubsectionTitle('Pets');
  addLabelValue('Has Pets', lifestyle.hasPets ? 'Yes' : 'No');
  if (lifestyle.hasPets && lifestyle.petTypes) {
    addLabelValue('Pet Types', lifestyle.petTypes);
  }

  currentY += 5;
  addSubsectionTitle('Accessibility');
  addLabelValue('Accessibility Required', lifestyle.accessibilityRequired ? 'Yes' : 'No');
  addLabelValue('Aging-in-Place', lifestyle.agingInPlace ? 'Yes' : 'No');

  // ==========================================================================
  // PAGE 6 - SPACE REQUIREMENTS
  // ==========================================================================

  currentY = addNewPage();

  addSectionTitle('Space Requirements');

  addSubsectionTitle('Bedrooms & Suites');
  addLabelValue('Primary Suite', 'Required');
  addLabelValue('Family Bedrooms', projectParams.bedroomCount || 'Not specified');
  addLabelValue('Guest Suites', projectParams.guestSuiteCount || 'Not specified');

  const spaceRequirements = principal.spaceRequirements || {};

  currentY += 5;
  if (spaceRequirements.mustHaveSpaces && spaceRequirements.mustHaveSpaces.length > 0) {
    addSubsectionTitle('Must-Have Spaces');
    addBulletList(spaceRequirements.mustHaveSpaces);
  }

  if (spaceRequirements.niceToHaveSpaces && spaceRequirements.niceToHaveSpaces.length > 0) {
    addSubsectionTitle('Nice-to-Have Spaces');
    addBulletList(spaceRequirements.niceToHaveSpaces);
  }

  if (spaceRequirements.excludedSpaces && spaceRequirements.excludedSpaces.length > 0) {
    addSubsectionTitle('Excluded Spaces');
    addBulletList(spaceRequirements.excludedSpaces);
  }

  // ==========================================================================
  // PAGE 7+ - DESIGN IDENTITY
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

      // Style Era slider
      if (tasteResults.styleEra !== undefined) {
        addLabelValue('Style Era', tasteResults.styleEra < 40 ? 'Classic/Traditional' : tasteResults.styleEra > 60 ? 'Contemporary/Modern' : 'Transitional');
      }

      // Visual Density
      if (tasteResults.visualDensity !== undefined) {
        addLabelValue('Visual Density', tasteResults.visualDensity < 40 ? 'Minimal/Clean' : tasteResults.visualDensity > 60 ? 'Layered/Rich' : 'Balanced');
      }

      // Mood Palette
      if (tasteResults.moodPalette !== undefined) {
        addLabelValue('Mood Palette', tasteResults.moodPalette < 40 ? 'Cool/Serene' : tasteResults.moodPalette > 60 ? 'Warm/Inviting' : 'Neutral');
      }

      // Category breakdowns
      const categories = ['living', 'kitchen', 'bedroom', 'bath', 'outdoor'];
      const categoryLabels = {
        living: 'Living Spaces',
        kitchen: 'Kitchen',
        bedroom: 'Bedrooms',
        bath: 'Bathrooms',
        outdoor: 'Outdoor',
      };

      currentY += 5;
      categories.forEach(cat => {
        const catData = tasteResults[cat];
        if (catData && catData.style) {
          currentY = checkPageBreak(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...COLORS.text);
          doc.text(`${categoryLabels[cat]}:`, margin, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(catData.style, margin + 35, currentY);
          currentY += 5;
        }
      });
    }

    // Partner alignment
    const secondaryResults = designIdentity.secondaryTasteResults;
    if (secondaryResults) {
      currentY += 10;
      addSubsectionTitle('Partner Alignment');

      // Calculate alignment score (simplified)
      let alignmentScore = 0;
      let comparisons = 0;

      if (tasteResults?.styleEra !== undefined && secondaryResults?.styleEra !== undefined) {
        alignmentScore += 100 - Math.abs(tasteResults.styleEra - secondaryResults.styleEra);
        comparisons++;
      }
      if (tasteResults?.visualDensity !== undefined && secondaryResults?.visualDensity !== undefined) {
        alignmentScore += 100 - Math.abs(tasteResults.visualDensity - secondaryResults.visualDensity);
        comparisons++;
      }
      if (tasteResults?.moodPalette !== undefined && secondaryResults?.moodPalette !== undefined) {
        alignmentScore += 100 - Math.abs(tasteResults.moodPalette - secondaryResults.moodPalette);
        comparisons++;
      }

      if (comparisons > 0) {
        const avgAlignment = Math.round(alignmentScore / comparisons);
        addLabelValue('Overall Alignment', `${avgAlignment}%`);
        addParagraph(avgAlignment >= 80 ? 'Strong alignment between partners on design preferences.' :
                     avgAlignment >= 60 ? 'Moderate alignment with some areas for discussion.' :
                     'Significant differences that should be addressed in design process.');
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
    // Redraw footer with correct total
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

  const filename = `N4S-KYC-Report-${clientName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  return filename;
};

export default generateKYCReport;
