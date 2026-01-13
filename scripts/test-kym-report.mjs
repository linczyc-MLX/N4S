/**
 * Test script for KYM Report Generator
 * Run with: node scripts/test-kym-report.mjs
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// MOCK DATA FOR TESTING
// =============================================================================

const mockKycData = {
  principal: {
    designIdentity: {
      principalName: 'William',
      secondaryName: 'Margaret',
      clientBaseName: 'Thornwood',
      clientType: 'couple',
    },
    projectParameters: {
      projectName: 'Thornwood Estate',
      projectCity: 'Greenwich',
      projectState: 'CT',
    },
  },
};

const mockLocationData = {
  location: {
    city: 'Greenwich',
    state: 'CT',
    zipCode: '06830',
    county: 'Fairfield County',
    coordinates: { lat: 41.0262, lng: -73.6282 },
  },
  demographics: {
    totalPopulation: 62396,
    medianAge: 43.2,
    medianIncome: 156890,
    householdCount: 23456,
    avgHouseholdSize: 2.8,
    educationBachelorsPlus: 72.5,
  },
};

const mockMarketData = {
  medianPrice: 4250000,
  avgPrice: 5125000,
  minPrice: 1850000,
  maxPrice: 28500000,
  avgPricePerSqFt: 685,
  avgSqFt: 7485,
  avgDaysOnMarket: 92,
  totalListings: 47,
  priceChange12Month: 8.2,
};

const mockProperties = [
  {
    id: 1,
    address: '125 Round Hill Road',
    city: 'Greenwich',
    state: 'CT',
    askingPrice: 8950000,
    sqft: 12500,
    bedrooms: 7,
    bathrooms: 9,
    yearBuilt: 2018,
    lotSize: '4.2 acres',
    status: 'Active',
    daysOnMarket: 45,
    features: ['Pool', 'Wine Cellar', 'Home Theater', 'Guest House'],
  },
  {
    id: 2,
    address: '88 Conyers Farm Drive',
    city: 'Greenwich',
    state: 'CT',
    askingPrice: 12500000,
    sqft: 15800,
    bedrooms: 8,
    bathrooms: 12,
    yearBuilt: 2020,
    lotSize: '6.5 acres',
    status: 'Active',
    daysOnMarket: 78,
    features: ['Pool', 'Spa', 'Tennis Court', 'Staff Quarters'],
  },
  {
    id: 3,
    address: '45 Khakum Wood Road',
    city: 'Greenwich',
    state: 'CT',
    askingPrice: 5250000,
    sqft: 8200,
    bedrooms: 6,
    bathrooms: 7,
    yearBuilt: 2015,
    lotSize: '2.8 acres',
    status: 'Pending',
    daysOnMarket: 32,
    features: ['Pool', 'Home Office', 'Gym'],
  },
  {
    id: 4,
    address: '200 Lake Avenue',
    city: 'Greenwich',
    state: 'CT',
    askingPrice: 4100000,
    sqft: 6800,
    bedrooms: 5,
    bathrooms: 6,
    yearBuilt: 2012,
    lotSize: '1.9 acres',
    status: 'Sold',
    daysOnMarket: 67,
    salePrice: 3950000,
    features: ['Pool', 'Wine Cellar'],
  },
];

const mockPersonaResults = [
  {
    id: 'tech-executive',
    name: 'Tech Executive',
    scoring: { score: 92, matchLevel: 'excellent' },
    description: 'High-net-worth tech industry leaders seeking smart homes with premium amenities.',
  },
  {
    id: 'finance-executive',
    name: 'Finance Executive',
    scoring: { score: 88, matchLevel: 'excellent' },
    description: 'Wall Street executives and hedge fund managers valuing privacy and prestige.',
  },
  {
    id: 'generational-wealth',
    name: 'Generational Wealth',
    scoring: { score: 85, matchLevel: 'good' },
    description: 'Multi-generational families preserving and growing inherited wealth.',
  },
  {
    id: 'entertainment-industry',
    name: 'Entertainment Industry',
    scoring: { score: 78, matchLevel: 'good' },
    description: 'Media executives and celebrities seeking privacy and entertainment spaces.',
  },
];

const mockFyiData = {
  selectedSpaces: [
    { name: 'Home Office', sqft: 400 },
    { name: 'Wine Cellar', sqft: 600 },
    { name: 'Home Theater', sqft: 800 },
    { name: 'Gym', sqft: 500 },
    { name: 'Spa', sqft: 350 },
    { name: 'Pool', sqft: 1200 },
    { name: 'Guest Suite', sqft: 600 },
    { name: 'Staff Quarters', sqft: 400 },
  ],
};

const mockMvpData = {
  totalSquareFootage: 15000,
  selectedTier: { id: '15k', name: '15,000 SF Estate' },
};

// =============================================================================
// COPY OF GENERATOR (modified for Node.js)
// =============================================================================

const COLORS = {
  navy: [30, 58, 95],
  gold: [201, 162, 39],
  text: [26, 26, 26],
  textMuted: [107, 107, 107],
  background: [250, 250, 248],
  border: [229, 229, 224],
  accentLight: [245, 240, 232],
  success: [46, 125, 50],
  warning: [245, 124, 0],
  error: [211, 47, 47],
  white: [255, 255, 255],
};

const FONTS = {
  heading: 'helvetica',
  body: 'helvetica',
};

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

// Dynamically import the actual generator
async function generateTestReport() {
  const data = {
    kycData: mockKycData,
    locationData: mockLocationData,
    marketData: mockMarketData,
    properties: mockProperties,
    demographics: mockLocationData.demographics,
    personaResults: mockPersonaResults,
    fyiData: mockFyiData,
    mvpData: mockMvpData,
  };

  // Import the actual generator from src
  const generatorPath = path.join(__dirname, '..', 'src', 'components', 'KYM', 'KYMReportGenerator.js');

  // Read and modify the generator for Node.js compatibility
  let generatorCode = fs.readFileSync(generatorPath, 'utf8');

  // Replace imports with our already-imported modules
  generatorCode = generatorCode
    .replace("import jsPDF from 'jspdf';", '')
    .replace("import autoTable from 'jspdf-autotable';", '')
    .replace('export const generateKYMReport', 'const generateKYMReport')
    .replace('export default generateKYMReport;', '');

  // Create a function that includes jsPDF and autoTable in scope
  const wrappedCode = `
    const jsPDF = jsPDFModule.jsPDF;
    ${generatorCode}
    return generateKYMReport;
  `;

  // Execute the code to get the function
  const generateKYMReport = new Function('jsPDFModule', 'autoTable', wrappedCode)({ jsPDF }, autoTable);

  console.log('Generating KYM Report with test data...\n');
  console.log('Test Data Summary:');
  console.log(`  Client: ${mockKycData.principal.designIdentity.principalName} & ${mockKycData.principal.designIdentity.secondaryName} ${mockKycData.principal.designIdentity.clientBaseName}`);
  console.log(`  Project: ${mockKycData.principal.projectParameters.projectName}`);
  console.log(`  Location: ${mockLocationData.location.city}, ${mockLocationData.location.state}`);
  console.log(`  Market Median: ${formatCurrency(mockMarketData.medianPrice)}`);
  console.log(`  Properties: ${mockProperties.length} listings`);
  console.log(`  Personas: ${mockPersonaResults.length} matched`);
  console.log(`  Spaces: ${mockFyiData.selectedSpaces.length} selected`);
  console.log(`  Total SF: ${formatNumber(mockMvpData.totalSquareFootage)}\n`);

  try {
    await generateKYMReport(data);
    console.log('✓ PDF generated successfully!');
    console.log('  Check your Downloads folder for the report.');
  } catch (error) {
    console.error('✗ Error generating PDF:', error.message);
    console.error(error.stack);
  }
}

generateTestReport();
