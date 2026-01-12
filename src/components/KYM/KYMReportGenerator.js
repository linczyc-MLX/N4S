/**
 * KYMReportGenerator.js
 * 
 * Generates Market Intelligence PDF reports following N4S brand standards.
 * Uses jspdf for PDF generation with consistent styling.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// =============================================================================
// N4S BRAND CONSTANTS
// =============================================================================

const COLORS = {
  navy: [30, 58, 95],        // #1e3a5f
  gold: [201, 162, 39],      // #c9a227
  text: [26, 26, 26],        // #1a1a1a
  textMuted: [107, 107, 107], // #6b6b6b
  background: [250, 250, 248], // #fafaf8
  border: [229, 229, 224],   // #e5e5e0
  accentLight: [245, 240, 232], // #f5f0e8
  success: [46, 125, 50],    // #2e7d32
  warning: [245, 124, 0],    // #f57c00
  error: [211, 47, 47],      // #d32f2f
  white: [255, 255, 255],
};

const FONTS = {
  // Using Helvetica as fallback (built into jsPDF)
  // For production, would register Inter and Playfair Display
  heading: 'helvetica',
  body: 'helvetica',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatCurrency = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value}%`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// =============================================================================
// PDF GENERATION
// =============================================================================

/**
 * Generate KYM Market Intelligence Report
 */
export const generateKYMReport = async (data) => {
  const {
    kycData,
    locationData,
    marketData,
    properties,
    demographics,
    personaResults,
    fyiData,
    mvpData,
  } = data;

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

  // Get client info from KYC
  // Principal name is stored in designIdentity section
  const principalFirstName = kycData?.principal?.designIdentity?.principalName || '';
  const secondaryName = kycData?.principal?.designIdentity?.secondaryName || '';
  // Build full client name: "FirstName LastName" or "FirstName & SecondaryName LastName" for couples
  const clientBaseName = kycData?.principal?.designIdentity?.clientBaseName || '';
  const clientType = kycData?.principal?.designIdentity?.clientType || '';
  
  // Format client name based on client type
  let clientName = 'Client';
  if (principalFirstName && clientBaseName) {
    if (clientType === 'couple' && secondaryName) {
      clientName = `${principalFirstName} & ${secondaryName} ${clientBaseName}`;
    } else {
      clientName = `${principalFirstName} ${clientBaseName}`;
    }
  } else if (principalFirstName) {
    clientName = principalFirstName;
  }
  
  const projectName = kycData?.principal?.projectParameters?.projectName || 'Luxury Residence';
  const projectCity = kycData?.principal?.projectParameters?.projectCity || locationData?.location?.city || '';
  const projectState = kycData?.principal?.projectParameters?.projectState || locationData?.location?.state || '';

  // Page tracking
  let pageNumber = 1;
  let totalPages = 0; // Will be calculated at end

  // ==========================================================================
  // HEADER & FOOTER FUNCTIONS
  // ==========================================================================

  const addHeader = () => {
    // Navy header bar
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, pageWidth, 8, 'F');
  };

  const addFooter = (pageNum) => {
    const footerY = pageHeight - 10;
    
    // Footer line
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    // Footer text
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('© 2026 N4S Luxury Residential Advisory', margin, footerY + 5);
    doc.text(`Page ${pageNum}`, pageWidth - margin, footerY + 5, { align: 'right' });
  };

  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    addHeader();
    addFooter(pageNumber);
    return 25; // Reset Y position after header
  };

  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 25) {
      currentY = addNewPage();
    }
    return currentY;
  };

  // ==========================================================================
  // COVER PAGE
  // ==========================================================================

  addHeader();
  
  // Title area
  currentY = 50;
  
  // N4S Logo text
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.navy);
  doc.text('N4S', margin, currentY);
  
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Luxury Residential Advisory', margin, currentY + 7);

  // Report type
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text('Market Intelligence Report', pageWidth - margin, currentY, { align: 'right' });
  
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(formatDate(new Date()), pageWidth - margin, currentY + 7, { align: 'right' });

  // Main title
  currentY = 100;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.navy);
  doc.text('Market Intelligence', margin, currentY);
  doc.text('Report', margin, currentY + 12);

  // Location subtitle
  currentY += 30;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  const locationTitle = `${projectCity}, ${projectState}`;
  doc.text(locationTitle, margin, currentY);
  
  if (locationData?.location?.zipCode) {
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`ZIP Code: ${locationData.location.zipCode}`, margin, currentY + 8);
  }

  // Client info box
  currentY = 160;
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, 'F');
  
  currentY += 10;
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('PREPARED FOR', margin + 8, currentY);
  
  currentY += 7;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text(clientName, margin + 8, currentY);
  
  currentY += 7;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text(projectName, margin + 8, currentY);

  // Data source note
  currentY = 220;
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  const dataSourceNote = properties && properties.length > 0
    ? 'Data sourced from live Realtor.com API'
    : 'Market estimates based on regional data';
  doc.text(dataSourceNote, margin, currentY);

  addFooter(pageNumber);

  // ==========================================================================
  // EXECUTIVE SUMMARY
  // ==========================================================================

  currentY = addNewPage();

  // Section title
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.navy);
  doc.text('Executive Summary', margin, currentY);
  currentY += 15;

  // Market Overview
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Market Overview', margin, currentY);
  currentY += 7;

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  
  const marketOverview = `The ${projectCity} luxury real estate market presents ${
    properties?.length > 10 ? 'significant' : properties?.length > 5 ? 'moderate' : 'limited'
  } inventory at the ultra-luxury level. ${
    marketData?.medianPrice 
      ? `The median listing price of ${formatCurrency(marketData.medianPrice)} reflects the area's positioning as a premier luxury market.`
      : 'Market analysis is based on regional data and comparable market trends.'
  }`;
  
  const splitOverview = doc.splitTextToSize(marketOverview, contentWidth);
  doc.text(splitOverview, margin, currentY);
  currentY += splitOverview.length * 5 + 10;

  // Key Metrics Table
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Key Market Metrics', margin, currentY);
  currentY += 5;

  const metricsData = [
    ['Total Active Listings', formatNumber(properties?.filter(p => p.status === 'active').length || 0)],
    ['Median Listing Price', formatCurrency(marketData?.medianPrice || 0)],
    ['Avg Price per SF', formatCurrency(marketData?.avgPricePerSqFt || 0)],
    ['Avg Days on Market', `${marketData?.avgDaysOnMarket || 'N/A'} days`],
    ['Inventory Range', `${formatCurrency(marketData?.minPrice || 0)} – ${formatCurrency(marketData?.maxPrice || 0)}`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: metricsData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: COLORS.text,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 70 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Top Buyer Personas
  if (personaResults && personaResults.length > 0) {
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text('Top Buyer Personas', margin, currentY);
    currentY += 5;

    const topPersonas = personaResults.slice(0, 3).map((p, i) => [
      `${i + 1}. ${p.name}`,
      `${p.scoring.score}%`,
      p.scoring.matchLevel,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Persona', 'Match', 'Level']],
      body: topPersonas,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // ==========================================================================
  // MARKET ANALYSIS
  // ==========================================================================

  currentY = checkPageBreak(80);
  
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.navy);
  doc.text('Market Analysis', margin, currentY);
  currentY += 15;

  // Pricing Overview
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Pricing Overview', margin, currentY);
  currentY += 7;

  if (marketData) {
    const pricingData = [
      ['Median Listing Price', formatCurrency(marketData.medianPrice)],
      ['Average Listing Price', formatCurrency(marketData.avgPrice)],
      ['Price Range', `${formatCurrency(marketData.minPrice)} – ${formatCurrency(marketData.maxPrice)}`],
      ['Average Price/SF', formatCurrency(marketData.avgPricePerSqFt)],
    ];

    autoTable(doc, {
      startY: currentY,
      body: pricingData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 70 },
      },
      margin: { left: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Inventory Analysis
  currentY = checkPageBreak(60);
  
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('Inventory Analysis', margin, currentY);
  currentY += 7;

  const activeCount = properties?.filter(p => p.status === 'active').length || 0;
  const pendingCount = properties?.filter(p => p.status === 'pending').length || 0;
  const soldCount = properties?.filter(p => p.status === 'sold').length || 0;

  const inventoryData = [
    ['Active Listings', formatNumber(activeCount)],
    ['Pending Sales', pendingCount > 0 ? formatNumber(pendingCount) : 'N/A'],
    ['Recently Sold', formatNumber(soldCount)],
    ['Total Properties Analyzed', formatNumber(properties?.length || 0)],
    ['Avg Days on Market', `${marketData?.avgDaysOnMarket || 'N/A'} days`],
  ];

  autoTable(doc, {
    startY: currentY,
    body: inventoryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 70 },
    },
    margin: { left: margin },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // ==========================================================================
  // COMPARABLE PROPERTIES
  // ==========================================================================

  if (properties && properties.length > 0) {
    currentY = addNewPage();

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.navy);
    doc.text('Comparable Properties', margin, currentY);
    currentY += 10;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${properties.length} properties analyzed in the target market area`, margin, currentY);
    currentY += 10;

    // Property table
    const propertyTableData = properties.slice(0, 15).map(p => [
      p.address?.substring(0, 30) || 'N/A',
      formatCurrency(p.askingPrice),
      formatNumber(p.sqft) + ' SF',
      formatCurrency(p.pricePerSqFt) + '/SF',
      `${p.beds}/${p.baths}`,
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Address', 'Price', 'Size', 'Price/SF', 'Bed/Bath', 'Status']],
      body: propertyTableData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { halign: 'right', cellWidth: 28 },
        2: { halign: 'right', cellWidth: 22 },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 20 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Feature Analysis
    currentY = checkPageBreak(60);
    
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text('Feature Analysis', margin, currentY);
    currentY += 7;

    // Count features across properties
    const featureCounts = {};
    properties.forEach(p => {
      (p.features || []).forEach(f => {
        featureCounts[f] = (featureCounts[f] || 0) + 1;
      });
    });

    const featureData = Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([feature, count]) => [
        feature,
        formatNumber(count),
        `${Math.round((count / properties.length) * 100)}%`,
      ]);

    if (featureData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Feature', 'Count', '% of Listings']],
        body: featureData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.navy,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 30 },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.6,
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }
  }

  // ==========================================================================
  // BUYER ALIGNMENT ANALYSIS (BAM)
  // ==========================================================================

  if (personaResults && personaResults.length > 0) {
    currentY = addNewPage();

    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.navy);
    doc.text('Buyer Alignment Analysis', margin, currentY);
    currentY += 10;

    // Methodology note
    doc.setFont(FONTS.body, 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    const methodNote = 'Analysis based on design decisions captured in KYC, FYI, and MVP modules. Scores reflect alignment between the planned property program and typical buyer persona preferences.';
    const splitMethod = doc.splitTextToSize(methodNote, contentWidth);
    doc.text(splitMethod, margin, currentY);
    currentY += splitMethod.length * 4 + 10;

    // Top 3 Personas - Detailed
    const topThree = personaResults.slice(0, 3);
    
    for (let i = 0; i < topThree.length; i++) {
      const persona = topThree[i];
      
      currentY = checkPageBreak(70);
      
      // Persona header
      doc.setFillColor(...COLORS.accentLight);
      doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
      
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.navy);
      doc.text(`${i + 1}. ${persona.name}`, margin + 5, currentY + 8);
      
      // Score badge
      const scoreColor = persona.scoring.matchLevel === 'Strong' ? COLORS.success 
        : persona.scoring.matchLevel === 'Moderate' ? COLORS.warning 
        : COLORS.textMuted;
      doc.setTextColor(...scoreColor);
      doc.text(`${persona.scoring.score}% - ${persona.scoring.matchLevel} Match`, pageWidth - margin - 5, currentY + 8, { align: 'right' });
      
      currentY += 18;
      
      // Description
      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      const descSplit = doc.splitTextToSize(persona.fullDesc || persona.shortDesc, contentWidth);
      doc.text(descSplit, margin, currentY);
      currentY += descSplit.length * 4 + 5;
      
      // Demographics
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('TYPICAL DEMOGRAPHICS', margin, currentY);
      currentY += 4;
      
      doc.setFont(FONTS.body, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.text(`Age: ${persona.demographics?.ageRange || 'N/A'}  |  Net Worth: ${persona.demographics?.netWorth || 'N/A'}`, margin, currentY);
      currentY += 8;

      // Alignment Factors
      if (persona.scoring.positiveFactors?.length > 0) {
        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.success);
        doc.text('ALIGNMENT FACTORS', margin, currentY);
        currentY += 4;
        
        doc.setFont(FONTS.body, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        
        persona.scoring.positiveFactors.slice(0, 4).forEach(factor => {
          doc.text(`✓ ${factor.factor} (+${factor.impact})`, margin + 3, currentY);
          currentY += 4;
        });
        currentY += 3;
      }

      // Potential Concerns
      if (persona.scoring.negativeFactors?.length > 0) {
        doc.setFont(FONTS.body, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.warning);
        doc.text('POTENTIAL CONCERNS', margin, currentY);
        currentY += 4;
        
        doc.setFont(FONTS.body, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        
        persona.scoring.negativeFactors.slice(0, 3).forEach(factor => {
          doc.text(`⚠ ${factor.factor} (${factor.impact})`, margin + 3, currentY);
          currentY += 4;
        });
        currentY += 3;
      }

      currentY += 10;
    }

    // All Personas Summary Table
    currentY = checkPageBreak(60);
    
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text('All Personas Summary', margin, currentY);
    currentY += 5;

    const allPersonasData = personaResults.map((p, i) => [
      `${i + 1}`,
      p.name,
      `${p.scoring.score}%`,
      p.scoring.matchLevel,
      p.scoring.confidence,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Persona', 'Score', 'Match Level', 'Confidence']],
      body: allPersonasData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 28 },
        4: { halign: 'center', cellWidth: 25 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // ==========================================================================
  // DESIGN ALIGNMENT INSIGHTS
  // ==========================================================================

  if (fyiData || mvpData) {
    currentY = checkPageBreak(100);
    
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);
    doc.text('Design Alignment Insights', margin, currentY);
    currentY += 6;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('How your design decisions align with buyer expectations in this market.', margin, currentY);
    currentY += 10;

    // Space Program from MVP/FYI
    if (mvpData?.totalSquareFootage || fyiData?.selectedSpaces) {
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('Space Program Summary', margin, currentY);
      currentY += 7;

      const programData = [];
      
      if (mvpData?.totalSquareFootage) {
        programData.push(['Total Square Footage', formatNumber(mvpData.totalSquareFootage) + ' SF']);
      }
      if (mvpData?.selectedTier) {
        programData.push(['Size Tier', mvpData.selectedTier.name || 'Custom']);
      }
      if (fyiData?.selectedSpaces?.length) {
        programData.push(['Selected Spaces', `${fyiData.selectedSpaces.length} spaces defined`]);
      }

      // Compare to market
      if (marketData?.avgSqFt && mvpData?.totalSquareFootage) {
        const sizeDiff = mvpData.totalSquareFootage - marketData.avgSqFt;
        const sizeComparison = sizeDiff > 2000 ? 'Larger than market average' 
          : sizeDiff < -2000 ? 'Smaller than market average'
          : 'In line with market average';
        programData.push(['Market Comparison', sizeComparison]);
      }

      autoTable(doc, {
        startY: currentY,
        body: programData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 55 },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.6,
      });

      currentY = doc.lastAutoTable.finalY + 6;
    }

    // Key Spaces and Buyer Appeal
    if (fyiData?.selectedSpaces?.length > 0) {
      currentY = checkPageBreak(60);
      
      doc.setFont(FONTS.body, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('Key Spaces & Buyer Appeal', margin, currentY);
      currentY += 5;

      // Map spaces to buyer appeal
      const spaceAppeal = {
        'Home Office': ['Tech Executive', 'Finance Executive', 'Medical/Biotech'],
        'Home Theater': ['Entertainment Industry', 'Sports Professional'],
        'Theater': ['Entertainment Industry', 'Sports Professional'],
        'Wine Cellar': ['Finance Executive', 'Entertainment Industry', 'Generational Wealth'],
        'Gym': ['Sports Professional', 'Medical/Biotech', 'Tech Executive'],
        'Spa': ['Sports Professional', 'Medical/Biotech'],
        'Pool': ['All Personas'],
        'Swimming Pool': ['All Personas'],
        'Guest House': ['Generational Wealth', 'International Investor'],
        'Guest Suite': ['Entertainment Industry', 'Generational Wealth'],
        'Staff Quarters': ['International Investor', 'Generational Wealth', 'Family Office'],
        'Car Gallery': ['Tech Executive', 'Sports Professional'],
        'Studio': ['Creative Entrepreneur'],
        'Den or Office': ['Finance Executive', 'Tech Executive', 'Family Office'],
      };

      const spaceData = fyiData.selectedSpaces.slice(0, 8).map(space => {
        const spaceName = typeof space === 'string' ? space : space.name;
        const appeal = spaceAppeal[spaceName] || ['Various'];
        return [spaceName, appeal.slice(0, 2).join(', ')];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Space', 'Primary Buyer Appeal']],
        body: spaceData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.navy,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 50 },
        },
        margin: { left: margin },
        tableWidth: contentWidth * 0.7,
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }
  }

  // ==========================================================================
  // STRATEGIC RECOMMENDATIONS
  // ==========================================================================

  currentY = checkPageBreak(80);

  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text('Strategic Recommendations', margin, currentY);
  currentY += 8;

  // Market Positioning
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text('Market Positioning', margin, currentY);
  currentY += 5;

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);

  const positioningText = mvpData?.totalSquareFootage 
    ? `Based on the planned ${formatNumber(mvpData.totalSquareFootage)} SF program, this property will compete in the ${
        mvpData.totalSquareFootage > 20000 ? 'ultra-luxury estate' 
        : mvpData.totalSquareFootage > 15000 ? 'large luxury residence'
        : mvpData.totalSquareFootage > 10000 ? 'substantial luxury residence'
        : 'boutique luxury residence'
      } segment of the ${projectCity} market.`
    : `This property will compete in the luxury segment of the ${projectCity} market.`;
  
  const posSplit = doc.splitTextToSize(positioningText, contentWidth);
  doc.text(posSplit, margin, currentY);
  currentY += posSplit.length * 4 + 5;

  // Target Buyer Strategy
  if (personaResults?.length > 0) {
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text('Target Buyer Strategy', margin, currentY);
    currentY += 5;

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);

    const topPersona = personaResults[0];
    const strategyText = `Primary target: ${topPersona.name} (${topPersona.scoring.score}% alignment). ${
      topPersona.scoring.positiveFactors?.length > 0 
        ? `Key selling points include ${topPersona.scoring.positiveFactors.slice(0, 2).map(f => f.factor).join(' and ')}.`
        : ''
    } ${
      personaResults[1] 
        ? `Secondary opportunity: ${personaResults[1].name} (${personaResults[1].scoring.score}% alignment).`
        : ''
    }`;

    const stratSplit = doc.splitTextToSize(strategyText, contentWidth);
    doc.text(stratSplit, margin, currentY);
    currentY += stratSplit.length * 4 + 5;
  }

  // Recommendations
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text('Key Recommendations', margin, currentY);
  currentY += 5;

  const recommendations = [];
  
  // Generate contextual recommendations
  if (personaResults?.[0]?.scoring?.negativeFactors?.length > 0) {
    const topConcern = personaResults[0].scoring.negativeFactors[0];
    recommendations.push(`Consider adjusting ${topConcern.factor.toLowerCase()} to better align with ${personaResults[0].name} preferences.`);
  }
  
  if (properties?.length > 0) {
    const featureCounts = {};
    properties.forEach(p => (p.features || []).forEach(f => featureCounts[f] = (featureCounts[f] || 0) + 1));
    const topFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0];
    if (topFeature) {
      recommendations.push(`${topFeature[0]} appears in ${Math.round(topFeature[1] / properties.length * 100)}% of comparable listings - ensure competitive offering.`);
    }
  }
  
  recommendations.push('Review buyer persona alignment before finalizing architectural program.');
  recommendations.push('Consider market velocity when determining project timeline and pricing strategy.');

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  
  recommendations.forEach((rec, i) => {
    doc.text(`${i + 1}. ${rec}`, margin + 3, currentY);
    currentY += 4;
  });

  // ==========================================================================
  // SAVE PDF
  // ==========================================================================

  // Generate filename
  const filename = `N4S-Market-Intelligence-${projectCity.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Save
  doc.save(filename);
  
  return filename;
};

export default generateKYMReport;
