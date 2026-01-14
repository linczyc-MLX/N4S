/**
 * BAMScoring.js
 *
 * Buyer Alignment Module - v3.0 Dual Scoring Engine
 *
 * Features:
 * - Client Satisfaction Score (0-100): Does the design serve the client's needs?
 * - Market Appeal Score (0-100): Will the design appeal to buyers?
 * - Portfolio Context weighting (Forever Home → Spec Build)
 * - Must Have / Nice to Have / Avoid scoring structure
 * - Path to 80% recommendations
 * - Feature classification (Essential/Differentiating/Personal/Risky)
 */

// =============================================================================
// PORTFOLIO CONTEXT WEIGHTS
// =============================================================================

export const PORTFOLIO_WEIGHTS = {
  'forever-home': { client: 0.70, market: 0.30, label: 'Forever Home', desc: '15+ year hold' },
  'primary-residence': { client: 0.60, market: 0.40, label: 'Primary Residence', desc: '10-15 years' },
  'medium-term': { client: 0.50, market: 0.50, label: 'Medium Term', desc: '5-10 years' },
  'investment': { client: 0.30, market: 0.70, label: 'Investment', desc: '<5 years' },
  'spec-build': { client: 0.10, market: 0.90, label: 'Spec Build', desc: 'Build to sell' },
};

// =============================================================================
// MARKET BUYER POOLS
// =============================================================================

export const MARKET_BUYER_POOLS = {
  'malibu': {
    name: 'Malibu, CA',
    state: 'CA',
    priceRange: '$8M - $80M',
    typicalSize: '8,000 - 18,000 SF',
    archetypes: [
      { id: 'entertainment', share: 0.35 },
      { id: 'techExecutive', share: 0.28 },
      { id: 'sports', share: 0.18 },
      { id: 'international', share: 0.12 },
      { id: 'other', share: 0.07 },
    ],
  },
  'beverly-hills': {
    name: 'Beverly Hills, CA',
    state: 'CA',
    priceRange: '$10M - $100M',
    typicalSize: '10,000 - 25,000 SF',
    archetypes: [
      { id: 'entertainment', share: 0.30 },
      { id: 'techExecutive', share: 0.25 },
      { id: 'international', share: 0.20 },
      { id: 'finance', share: 0.15 },
      { id: 'other', share: 0.10 },
    ],
  },
  'aspen': {
    name: 'Aspen, CO',
    state: 'CO',
    priceRange: '$10M - $75M',
    typicalSize: '8,000 - 15,000 SF',
    archetypes: [
      { id: 'generational', share: 0.30 },
      { id: 'finance', share: 0.25 },
      { id: 'sports', share: 0.20 },
      { id: 'techExecutive', share: 0.15 },
      { id: 'other', share: 0.10 },
    ],
  },
  'greenwich': {
    name: 'Greenwich, CT',
    state: 'CT',
    priceRange: '$5M - $50M',
    typicalSize: '8,000 - 20,000 SF',
    archetypes: [
      { id: 'finance', share: 0.40 },
      { id: 'familyOffice', share: 0.25 },
      { id: 'generational', share: 0.20 },
      { id: 'techExecutive', share: 0.10 },
      { id: 'other', share: 0.05 },
    ],
  },
  'palm-beach': {
    name: 'Palm Beach, FL',
    state: 'FL',
    priceRange: '$8M - $100M',
    typicalSize: '8,000 - 25,000 SF',
    archetypes: [
      { id: 'international', share: 0.35 },
      { id: 'finance', share: 0.30 },
      { id: 'generational', share: 0.25 },
      { id: 'familyOffice', share: 0.05 },
      { id: 'other', share: 0.05 },
    ],
  },
  'hamptons': {
    name: 'Hamptons, NY',
    state: 'NY',
    priceRange: '$5M - $75M',
    typicalSize: '6,000 - 15,000 SF',
    archetypes: [
      { id: 'finance', share: 0.35 },
      { id: 'entertainment', share: 0.25 },
      { id: 'techExecutive', share: 0.20 },
      { id: 'creative', share: 0.10 },
      { id: 'other', share: 0.10 },
    ],
  },
  'miami-beach': {
    name: 'Miami Beach, FL',
    state: 'FL',
    priceRange: '$5M - $50M',
    typicalSize: '6,000 - 15,000 SF',
    archetypes: [
      { id: 'international', share: 0.40 },
      { id: 'entertainment', share: 0.25 },
      { id: 'sports', share: 0.20 },
      { id: 'creative', share: 0.10 },
      { id: 'other', share: 0.05 },
    ],
  },
  'scottsdale': {
    name: 'Scottsdale, AZ',
    state: 'AZ',
    priceRange: '$3M - $30M',
    typicalSize: '6,000 - 12,000 SF',
    archetypes: [
      { id: 'sports', share: 0.30 },
      { id: 'techExecutive', share: 0.25 },
      { id: 'medical', share: 0.20 },
      { id: 'developer', share: 0.15 },
      { id: 'other', share: 0.10 },
    ],
  },
};

// Helper to normalize market name to key
export const normalizeMarketName = (location) => {
  if (!location) return 'malibu';
  const name = (location.city || location.name || location || '').toLowerCase();

  if (name.includes('malibu')) return 'malibu';
  if (name.includes('beverly') || name.includes('90210')) return 'beverly-hills';
  if (name.includes('aspen') || name.includes('81611')) return 'aspen';
  if (name.includes('greenwich') || name.includes('06830')) return 'greenwich';
  if (name.includes('palm beach') || name.includes('33480')) return 'palm-beach';
  if (name.includes('hamptons') || name.includes('southampton') || name.includes('11932')) return 'hamptons';
  if (name.includes('miami') || name.includes('33139')) return 'miami-beach';
  if (name.includes('scottsdale') || name.includes('85251')) return 'scottsdale';

  return 'malibu'; // Default
};

// =============================================================================
// BUYER ARCHETYPE DEFINITIONS - Must Have / Nice to Have / Avoid
// =============================================================================

export const PERSONAS = {
  techExecutive: {
    id: 'techExecutive',
    name: 'Tech Executive',
    shortDesc: 'Technology leaders seeking modern, connected estates',
    fullDesc: 'Successful technology industry leaders, startup founders, and C-suite executives who value innovation, privacy, and modern design.',
    demographics: {
      ageRange: '35-55',
      netWorth: '$20M - $200M',
      occupation: 'Tech CEO / Founder / CTO / VP Engineering',
    },
    icon: 'cpu',

    mustHaves: [
      { id: 'smart-home', label: 'Smart Home Infrastructure', points: 10,
        matchField: 'hasSmartHome', suggestion: 'Add whole-home automation system with centralized control' },
      { id: 'home-office', label: 'Dedicated Home Office', points: 10,
        matchField: 'hasHomeOffice', suggestion: 'Include dedicated home office with video conferencing capability (min 350 SF)' },
      { id: 'contemporary', label: 'Contemporary/Modern Design', points: 10,
        matchField: 'isModernStyle', suggestion: 'Consider contemporary or modern design aesthetic' },
      { id: 'privacy', label: 'Privacy from Neighbors', points: 10,
        matchField: 'hasPrivacy', suggestion: 'Consider gated entry, perimeter landscaping, or setback adjustments' },
      { id: 'ev-charging', label: 'EV Charging + Tech Garage', points: 10,
        matchField: 'hasEvCharging', suggestion: 'Add EV charging provisions and tech-ready garage' },
    ],

    niceToHaves: [
      { id: 'wellness', label: 'Wellness Suite', points: 7,
        matchField: 'hasWellnessSuite', suggestion: 'Add gym with spa/steam/sauna capabilities' },
      { id: 'indoor-outdoor', label: 'Indoor-Outdoor Living', points: 7,
        matchField: 'hasIndoorOutdoor', suggestion: 'Enhance living-to-terrace connection' },
      { id: 'guest-autonomy', label: 'Guest Autonomy', points: 7,
        matchField: 'hasGuestAutonomy', suggestion: 'Add guest suite with private entry' },
      { id: 'theater', label: 'Home Theater', points: 7,
        matchField: 'hasTheater', suggestion: 'Include dedicated theater/media room' },
      { id: 'wine', label: 'Wine Storage', points: 7,
        matchField: 'hasWineCellar', suggestion: 'Add wine cellar or conditioned storage' },
    ],

    avoids: [
      { id: 'traditional', label: 'Traditional/Ornate Styling', penalty: 15,
        matchField: 'isTraditionalStyle', remediation: 'Consider transitional design that bridges traditional and contemporary' },
      { id: 'high-maintenance', label: 'High-Maintenance Grounds', penalty: 10,
        matchField: 'hasHighMaintenanceGrounds', remediation: 'Include estate manager quarters or reduce landscape complexity' },
      { id: 'visible', label: 'Visible from Street', penalty: 10,
        matchField: 'isVisibleFromStreet', remediation: 'Add privacy screening with mature plantings' },
      { id: 'hoa', label: 'HOA Restrictions', penalty: 10,
        matchField: 'hasRestrictiveHoa', remediation: 'Consider properties without restrictive HOA rules' },
    ],
  },

  entertainment: {
    id: 'entertainment',
    name: 'Entertainment Executive',
    shortDesc: 'Film producers and studio executives seeking prestige addresses',
    fullDesc: 'Film producers, studio executives, talent agents, and content creators who require prestigious addresses, exceptional privacy, and spaces designed for high-profile entertaining.',
    demographics: {
      ageRange: '40-65',
      netWorth: '$30M - $500M',
      occupation: 'Producer / Studio Executive / Talent Agent',
    },
    icon: 'film',

    mustHaves: [
      { id: 'screening', label: 'Screening Room/Theater', points: 10,
        matchField: 'hasTheater', suggestion: 'Add dedicated theater/screening room (min 400 SF)' },
      { id: 'privacy', label: 'Exceptional Privacy', points: 10,
        matchField: 'hasMaximumPrivacy', suggestion: 'Ensure gated compound with maximum privacy features' },
      { id: 'chefs-kitchen', label: "Chef's Kitchen", points: 10,
        matchField: 'hasChefsKitchen', suggestion: 'Include show kitchen with catering prep capabilities' },
      { id: 'prestige', label: 'Prestigious Address', points: 10,
        matchField: 'isPremiumLocation', suggestion: 'Ensure location in recognized luxury enclave' },
      { id: 'terrace', label: 'Entertainment Terrace', points: 10,
        matchField: 'hasEntertainmentTerrace', suggestion: 'Add covered terrace (min 800 SF) for outdoor entertaining' },
    ],

    niceToHaves: [
      { id: 'guest-suites', label: 'Multiple Guest Suites', points: 7,
        matchField: 'hasMultipleGuestSuites', suggestion: 'Add 3+ guest suites for visiting guests' },
      { id: 'wine-cellar', label: 'Wine Cellar', points: 7,
        matchField: 'hasWineCellar', suggestion: 'Include wine cellar (500+ bottle capacity)' },
      { id: 'pool-house', label: 'Pool + Pool House', points: 7,
        matchField: 'hasPoolHouse', suggestion: 'Add pool house with full amenities' },
      { id: 'staff', label: 'Staff Quarters', points: 7,
        matchField: 'hasStaffQuarters', suggestion: 'Include staff suite with separate entry' },
      { id: 'car-gallery', label: 'Car Gallery', points: 7,
        matchField: 'hasCarGallery', suggestion: 'Add car gallery for 4+ vehicles' },
    ],

    avoids: [
      { id: 'minimalist', label: 'Minimalist/Industrial', penalty: 15,
        matchField: 'isMinimalistStyle', remediation: 'Choose warmer, more expressive design style' },
      { id: 'compact', label: 'Compact Footprint', penalty: 10,
        matchField: 'isCompactSize', remediation: 'Target minimum 10,000 SF for entertainment-ready home' },
      { id: 'limited-parking', label: 'Limited Parking', penalty: 10,
        matchField: 'hasLimitedParking', remediation: 'Ensure 4+ vehicle capacity for events' },
      { id: 'visible-entry', label: 'Street-Visible Entry', penalty: 10,
        matchField: 'isVisibleFromStreet', remediation: 'Add gated/private approach' },
    ],
  },

  finance: {
    id: 'finance',
    name: 'Finance Executive',
    shortDesc: 'Investment professionals valuing traditional elegance',
    fullDesc: 'Investment bankers, hedge fund managers, and private equity principals who appreciate traditional elegance, quality construction, and proximity to financial centers.',
    demographics: {
      ageRange: '45-65',
      netWorth: '$50M - $500M',
      occupation: 'Managing Director / Partner / Fund Manager',
    },
    icon: 'landmark',

    mustHaves: [
      { id: 'traditional', label: 'Traditional/Transitional Design', points: 10,
        matchField: 'isTraditionalStyle', suggestion: 'Consider traditional, Georgian, or transitional design' },
      { id: 'library', label: 'Library/Study', points: 10,
        matchField: 'hasLibrary', suggestion: 'Include library or formal study' },
      { id: 'formal-dining', label: 'Formal Dining', points: 10,
        matchField: 'hasFormalDining', suggestion: 'Add formal dining room (16+ seats capacity)' },
      { id: 'quality', label: 'Quality Construction', points: 10,
        matchField: 'isExceptionalQuality', suggestion: 'Specify exceptional or ultra-premium construction tier' },
      { id: 'proximity', label: 'Proximity to Financial Center', points: 10,
        matchField: 'nearFinancialCenter', suggestion: 'Location within 90min of NYC, Boston, Chicago, or SF' },
    ],

    niceToHaves: [
      { id: 'wine-cellar', label: 'Wine Cellar', points: 7,
        matchField: 'hasLargeWineCellar', suggestion: 'Add wine cellar (1000+ bottle capacity)' },
      { id: 'office-suite', label: 'Home Office Suite', points: 7,
        matchField: 'hasHomeOffice', suggestion: 'Include office with conference capability' },
      { id: 'pool', label: 'Pool', points: 7,
        matchField: 'hasPool', suggestion: 'Add pool appropriate for property' },
      { id: 'tennis', label: 'Tennis Court', points: 7,
        matchField: 'hasTennis', suggestion: 'Include tennis court if lot permits' },
      { id: 'guest-wing', label: 'Guest Wing', points: 7,
        matchField: 'hasGuestAutonomy', suggestion: 'Add 2+ guest suites with separate access' },
    ],

    avoids: [
      { id: 'modern', label: 'Modern/Contemporary', penalty: 15,
        matchField: 'isModernStyle', remediation: 'Consider transitional design as middle ground' },
      { id: 'tech-forward', label: 'Tech-Forward Aesthetic', penalty: 10,
        matchField: 'hasExposedTech', remediation: 'Conceal smart home infrastructure' },
      { id: 'casual', label: 'Overly Casual Design', penalty: 10,
        matchField: 'isCasualDesign', remediation: 'Include formal living/dining spaces' },
      { id: 'remote', label: 'Remote Location', penalty: 10,
        matchField: 'isRemoteLocation', remediation: 'Choose location closer to financial centers' },
    ],
  },

  international: {
    id: 'international',
    name: 'International Investor',
    shortDesc: 'Global wealth holders seeking US trophy properties',
    fullDesc: 'International ultra-high-net-worth individuals seeking trophy properties in premier US markets for investment diversification and family use.',
    demographics: {
      ageRange: '45-70',
      netWorth: '$100M+',
      occupation: 'International Business / Investment / Family Office',
    },
    icon: 'globe',

    mustHaves: [
      { id: 'security', label: 'Security Infrastructure', points: 10,
        matchField: 'hasSecurityRoom', suggestion: 'Add security room with perimeter systems' },
      { id: 'staff', label: 'Staff Quarters', points: 10,
        matchField: 'hasStaffQuarters', suggestion: 'Include staff suite with separate entry' },
      { id: 'turnkey', label: 'Turnkey Condition', points: 10,
        matchField: 'isTurnkey', suggestion: 'Plan for FF&E inclusion, move-in ready' },
      { id: 'guest-suites', label: 'Multiple Guest Suites', points: 10,
        matchField: 'hasMultipleGuestSuites', suggestion: 'Include 4+ guest suites' },
      { id: 'prestige', label: 'Prestigious Location', points: 10,
        matchField: 'isPremiumLocation', suggestion: 'Ensure recognized international luxury market' },
    ],

    niceToHaves: [
      { id: 'spa', label: 'Spa/Wellness', points: 7,
        matchField: 'hasWellnessSuite', suggestion: 'Add spa with sauna and steam' },
      { id: 'wine', label: 'Wine Cellar', points: 7,
        matchField: 'hasWineCellar', suggestion: 'Include wine cellar' },
      { id: 'car-gallery', label: 'Car Gallery', points: 7,
        matchField: 'hasCarGallery', suggestion: 'Add car gallery for 6+ vehicles' },
      { id: 'pool-house', label: 'Pool + Pool House', points: 7,
        matchField: 'hasPoolHouse', suggestion: 'Include pool with pool house' },
      { id: 'theater', label: 'Home Theater', points: 7,
        matchField: 'hasTheater', suggestion: 'Add dedicated theater' },
    ],

    avoids: [
      { id: 'compact', label: 'Compact Size', penalty: 15,
        matchField: 'isCompactSize', remediation: 'Target minimum 12,000 SF' },
      { id: 'remote', label: 'Remote Location', penalty: 10,
        matchField: 'isSecondaryMarket', remediation: 'Focus on primary international markets' },
      { id: 'limited-privacy', label: 'Limited Privacy', penalty: 10,
        matchField: 'hasLimitedPrivacy', remediation: 'Enhance privacy features' },
      { id: 'high-maintenance', label: 'High Maintenance Required', penalty: 10,
        matchField: 'hasHighMaintenanceGrounds', remediation: 'Include staff quarters or simplify grounds' },
    ],
  },

  sports: {
    id: 'sports',
    name: 'Sports Professional',
    shortDesc: 'Athletes and team owners seeking performance estates',
    fullDesc: 'Professional athletes, team owners, and sports executives who prioritize fitness facilities, recovery amenities, and spaces for team gatherings.',
    demographics: {
      ageRange: '30-55',
      netWorth: '$20M - $300M',
      occupation: 'Professional Athlete / Team Owner / Sports Executive',
    },
    icon: 'trophy',

    mustHaves: [
      { id: 'gym', label: 'Professional Gym', points: 10,
        matchField: 'hasLargeGym', suggestion: 'Include gym (min 1,000 SF) with pro equipment' },
      { id: 'recovery', label: 'Recovery Suite', points: 10,
        matchField: 'hasRecoverySuite', suggestion: 'Add spa/steam/sauna/cold plunge' },
      { id: 'privacy', label: 'Privacy', points: 10,
        matchField: 'hasPrivacy', suggestion: 'Ensure high privacy from neighbors' },
      { id: 'entertainment', label: 'Entertainment Space', points: 10,
        matchField: 'hasGameRoom', suggestion: 'Include game room or sports bar' },
      { id: 'property', label: 'Large Property', points: 10,
        matchField: 'hasLargeProperty', suggestion: 'Target 1+ acre or include sports court' },
    ],

    niceToHaves: [
      { id: 'basketball', label: 'Basketball Court', points: 7,
        matchField: 'hasSportsCourt', suggestion: 'Add basketball/sport court' },
      { id: 'lap-pool', label: 'Pool (Lap)', points: 7,
        matchField: 'hasPool', suggestion: 'Include pool with lap capability' },
      { id: 'theater', label: 'Home Theater', points: 7,
        matchField: 'hasTheater', suggestion: 'Add dedicated theater' },
      { id: 'car-gallery', label: 'Car Gallery', points: 7,
        matchField: 'hasCarGallery', suggestion: 'Include car gallery for 4+ vehicles' },
      { id: 'guest-suites', label: 'Guest Suites', points: 7,
        matchField: 'hasMultipleGuestSuites', suggestion: 'Add 3+ guest suites' },
    ],

    avoids: [
      { id: 'small-gym', label: 'Small Gym', penalty: 15,
        matchField: 'hasSmallOrNoGym', remediation: 'Increase gym size to professional standard' },
      { id: 'traditional', label: 'Traditional/Formal', penalty: 10,
        matchField: 'isTraditionalStyle', remediation: 'Consider contemporary or transitional design' },
      { id: 'high-maintenance', label: 'High-Maintenance Design', penalty: 10,
        matchField: 'hasHighMaintenanceFinishes', remediation: 'Choose durable, low-maintenance materials' },
      { id: 'limited-parking', label: 'Limited Parking', penalty: 10,
        matchField: 'hasLimitedParking', remediation: 'Ensure 4+ vehicle capacity' },
    ],
  },

  generational: {
    id: 'generational',
    name: 'Generational Wealth',
    shortDesc: 'Multi-generational families building legacy estates',
    fullDesc: 'Multi-generational families and legacy wealth holders seeking compound-style estates for extended family use across generations.',
    demographics: {
      ageRange: '55-75',
      netWorth: '$200M+',
      occupation: 'Family Office / Inherited Wealth / Trust Beneficiary',
    },
    icon: 'castle',

    mustHaves: [
      { id: 'guest-house', label: 'Guest House', points: 10,
        matchField: 'hasGuestHouse', suggestion: 'Include separate guest house' },
      { id: 'bedrooms', label: 'Multiple Bedrooms', points: 10,
        matchField: 'hasMultipleBedrooms', suggestion: 'Include 6+ bedrooms' },
      { id: 'staff', label: 'Staff Quarters', points: 10,
        matchField: 'hasStaffQuarters', suggestion: 'Add staff suite' },
      { id: 'traditional', label: 'Traditional/Timeless Design', points: 10,
        matchField: 'isTraditionalStyle', suggestion: 'Consider traditional, Georgian, or transitional style' },
      { id: 'estate', label: 'Estate Property', points: 10,
        matchField: 'isEstateProperty', suggestion: 'Target 2+ acres' },
    ],

    niceToHaves: [
      { id: 'pool-house', label: 'Pool House', points: 7,
        matchField: 'hasPoolHouse', suggestion: 'Add pool house' },
      { id: 'tennis', label: 'Tennis Court', points: 7,
        matchField: 'hasTennis', suggestion: 'Include tennis court' },
      { id: 'wine', label: 'Wine Cellar', points: 7,
        matchField: 'hasLargeWineCellar', suggestion: 'Add wine cellar (1000+ bottles)' },
      { id: 'kids', label: "Kids' Spaces", points: 7,
        matchField: 'hasKidsSpaces', suggestion: 'Include bunk room or playroom' },
      { id: 'library', label: 'Library', points: 7,
        matchField: 'hasLibrary', suggestion: 'Add library' },
    ],

    avoids: [
      { id: 'modern', label: 'Modern/Minimalist', penalty: 15,
        matchField: 'isModernStyle', remediation: 'Choose traditional or transitional design' },
      { id: 'compact-property', label: 'Compact Property', penalty: 10,
        matchField: 'isSmallProperty', remediation: 'Target larger acreage (2+)' },
      { id: 'single-structure', label: 'Single Structure', penalty: 10,
        matchField: 'isSingleStructure', remediation: 'Include guest house or secondary structures' },
      { id: 'limited-bedrooms', label: 'Limited Bedrooms', penalty: 10,
        matchField: 'hasLimitedBedrooms', remediation: 'Increase to 5+ bedrooms' },
    ],
  },

  medical: {
    id: 'medical',
    name: 'Medical/Biotech Executive',
    shortDesc: 'Healthcare leaders seeking wellness-focused estates',
    fullDesc: 'Healthcare executives, biotech founders, and prominent medical professionals who value wellness-focused design and clean aesthetics.',
    demographics: {
      ageRange: '45-65',
      netWorth: '$30M - $150M',
      occupation: 'CEO / CMO / Biotech Founder / Specialist Physician',
    },
    icon: 'heart-pulse',

    mustHaves: [
      { id: 'wellness', label: 'Wellness Suite', points: 10,
        matchField: 'hasWellnessSuite', suggestion: 'Include gym + spa + sauna + steam' },
      { id: 'clean-design', label: 'Clean/Natural Materials', points: 10,
        matchField: 'hasNaturalMaterials', suggestion: 'Emphasize organic/natural materials' },
      { id: 'outdoor', label: 'Indoor-Outdoor Connection', points: 10,
        matchField: 'hasIndoorOutdoor', suggestion: 'Create strong indoor-outdoor flow' },
      { id: 'air-water', label: 'Clean Air/Water Systems', points: 10,
        matchField: 'hasAirWaterSystems', suggestion: 'Include air filtration and water purification' },
      { id: 'privacy', label: 'Privacy for Retreat', points: 10,
        matchField: 'hasPrivacy', suggestion: 'Ensure high privacy setting' },
    ],

    niceToHaves: [
      { id: 'lap-pool', label: 'Lap Pool', points: 7,
        matchField: 'hasPool', suggestion: 'Include pool suitable for exercise' },
      { id: 'meditation', label: 'Meditation Space', points: 7,
        matchField: 'hasMeditationSpace', suggestion: 'Add meditation room or yoga studio' },
      { id: 'kitchen', label: "Chef's Kitchen", points: 7,
        matchField: 'hasChefsKitchen', suggestion: 'Design kitchen for healthy food prep' },
      { id: 'guest', label: 'Guest Suite', points: 7,
        matchField: 'hasGuestSuite', suggestion: 'Include guest suite for wellness visitors' },
      { id: 'gardens', label: 'Gardens', points: 7,
        matchField: 'hasGardens', suggestion: 'Add kitchen garden or landscaped grounds' },
    ],

    avoids: [
      { id: 'urban', label: 'Urban Location', penalty: 15,
        matchField: 'isUrbanLocation', remediation: 'Choose suburban or rural setting' },
      { id: 'limited-outdoor', label: 'Limited Outdoor Space', penalty: 10,
        matchField: 'hasLimitedOutdoor', remediation: 'Target 0.5+ acres' },
      { id: 'heavy-design', label: 'Traditional Heavy Design', penalty: 10,
        matchField: 'isHeavyTraditional', remediation: 'Lighten design approach' },
      { id: 'artificial', label: 'Artificial Materials', penalty: 10,
        matchField: 'hasArtificialMaterials', remediation: 'Emphasize natural materials' },
    ],
  },

  developer: {
    id: 'developer',
    name: 'Real Estate Developer',
    shortDesc: 'Industry professionals seeking personal masterpieces',
    fullDesc: 'Successful commercial and residential developers seeking personal residences that showcase design innovation and construction excellence.',
    demographics: {
      ageRange: '45-65',
      netWorth: '$50M - $300M',
      occupation: 'Developer / Builder / Real Estate Principal',
    },
    icon: 'building-2',

    mustHaves: [
      { id: 'quality', label: 'Quality Construction', points: 10,
        matchField: 'isExceptionalQuality', suggestion: 'Specify exceptional or higher tier' },
      { id: 'innovative', label: 'Innovative Design', points: 10,
        matchField: 'hasInnovativeDesign', suggestion: 'Include unique architectural features' },
      { id: 'resale', label: 'Resale Positioning', points: 10,
        matchField: 'hasResaleConsiderations', suggestion: 'Make design decisions with marketability in mind' },
      { id: 'layout', label: 'Efficient Layout', points: 10,
        matchField: 'hasEfficientLayout', suggestion: 'Optimize circulation and flow' },
      { id: 'location', label: 'Prime Location', points: 10,
        matchField: 'isPremiumLocation', suggestion: 'Choose established luxury market' },
    ],

    niceToHaves: [
      { id: 'smart', label: 'Smart Home Tech', points: 7,
        matchField: 'hasSmartHome', suggestion: 'Include modern infrastructure' },
      { id: 'flexible', label: 'Flexible Spaces', points: 7,
        matchField: 'hasFlexibleSpaces', suggestion: 'Design rooms for multiple purposes' },
      { id: 'outdoor', label: 'Outdoor Living', points: 7,
        matchField: 'hasIndoorOutdoor', suggestion: 'Create strong indoor-outdoor connection' },
      { id: 'guest', label: 'Guest Accommodations', points: 7,
        matchField: 'hasGuestSuite', suggestion: 'Include at least 2 guest suites' },
      { id: 'pool', label: 'Pool', points: 7,
        matchField: 'hasPool', suggestion: 'Add pool (expected in luxury markets)' },
    ],

    avoids: [
      { id: 'over-personal', label: 'Over-Personalization', penalty: 15,
        matchField: 'isOverPersonalized', remediation: 'Make design choices with broader appeal' },
      { id: 'poor-flow', label: 'Poor Flow', penalty: 10,
        matchField: 'hasPoorCirculation', remediation: 'Optimize layout and circulation' },
      { id: 'dated', label: 'Dated Design', penalty: 10,
        matchField: 'isDatedDesign', remediation: 'Choose timeless or trending styles' },
      { id: 'over-improved', label: 'Over-Improved', penalty: 10,
        matchField: 'isOverImproved', remediation: 'Keep costs aligned with market ceiling' },
    ],
  },

  creative: {
    id: 'creative',
    name: 'Creative Entrepreneur',
    shortDesc: 'Fashion and design leaders seeking unique spaces',
    fullDesc: 'Fashion designers, artists, creative directors, and luxury brand founders who seek architecturally distinctive properties that inspire creativity.',
    demographics: {
      ageRange: '35-55',
      netWorth: '$15M - $100M',
      occupation: 'Designer / Artist / Creative Director / Brand Founder',
    },
    icon: 'palette',

    mustHaves: [
      { id: 'studio', label: 'Studio Space', points: 10,
        matchField: 'hasStudio', suggestion: 'Include dedicated studio or creative workspace' },
      { id: 'architectural', label: 'Architectural Distinction', points: 10,
        matchField: 'hasArchitecturalDistinction', suggestion: 'Choose distinctive architectural style' },
      { id: 'light', label: 'Natural Light', points: 10,
        matchField: 'hasNaturalLight', suggestion: 'Maximize natural light throughout' },
      { id: 'entertaining', label: 'Entertaining Spaces', points: 10,
        matchField: 'hasEntertainingSpaces', suggestion: 'Include impressive entertaining areas' },
      { id: 'modern', label: 'Modern/Contemporary Design', points: 10,
        matchField: 'isModernStyle', suggestion: 'Choose modern, contemporary, or eclectic style' },
    ],

    niceToHaves: [
      { id: 'gallery', label: 'Gallery Space', points: 7,
        matchField: 'hasGallery', suggestion: 'Include gallery or art display areas' },
      { id: 'pool', label: 'Pool', points: 7,
        matchField: 'hasPool', suggestion: 'Add architecturally interesting pool' },
      { id: 'terrace', label: 'Covered Terrace', points: 7,
        matchField: 'hasEntertainmentTerrace', suggestion: 'Include covered outdoor entertaining' },
      { id: 'wine', label: 'Wine Cellar', points: 7,
        matchField: 'hasWineCellar', suggestion: 'Add wine storage' },
      { id: 'guest', label: 'Guest Suite', points: 7,
        matchField: 'hasGuestSuite', suggestion: 'Include guest accommodations' },
    ],

    avoids: [
      { id: 'traditional', label: 'Traditional/Colonial', penalty: 15,
        matchField: 'isTraditionalStyle', remediation: 'Choose contemporary or eclectic design' },
      { id: 'cookie-cutter', label: 'Cookie-Cutter Design', penalty: 10,
        matchField: 'isGenericDesign', remediation: 'Add distinctive architectural elements' },
      { id: 'dark', label: 'Dark Interiors', penalty: 10,
        matchField: 'hasDarkInteriors', remediation: 'Maximize natural light' },
      { id: 'suburban', label: 'Suburban Tract', penalty: 10,
        matchField: 'isSuburbanTract', remediation: 'Choose architecturally interesting location' },
    ],
  },

  familyOffice: {
    id: 'familyOffice',
    name: 'Family Office Principal',
    shortDesc: 'Wealth managers prioritizing security and discretion',
    fullDesc: 'Professional wealth managers and family office principals who prioritize security, privacy, and conservative design choices.',
    demographics: {
      ageRange: '50-70',
      netWorth: '$100M+',
      occupation: 'Family Office Director / Wealth Manager / Trust Officer',
    },
    icon: 'shield-check',

    mustHaves: [
      { id: 'security', label: 'Security Infrastructure', points: 10,
        matchField: 'hasSecurityRoom', suggestion: 'Add security room and monitoring systems' },
      { id: 'office', label: 'Home Office', points: 10,
        matchField: 'hasHomeOffice', suggestion: 'Include professional home office' },
      { id: 'library', label: 'Library', points: 10,
        matchField: 'hasLibrary', suggestion: 'Add library or study' },
      { id: 'staff', label: 'Staff Quarters', points: 10,
        matchField: 'hasStaffQuarters', suggestion: 'Include staff accommodations' },
      { id: 'privacy', label: 'Privacy/Discretion', points: 10,
        matchField: 'hasMaximumPrivacy', suggestion: 'Ensure maximum privacy and discretion' },
    ],

    niceToHaves: [
      { id: 'guest-suites', label: 'Guest Suites', points: 7,
        matchField: 'hasMultipleGuestSuites', suggestion: 'Include multiple guest suites' },
      { id: 'wine', label: 'Wine Cellar', points: 7,
        matchField: 'hasWineCellar', suggestion: 'Add wine storage' },
      { id: 'formal-dining', label: 'Formal Dining', points: 7,
        matchField: 'hasFormalDining', suggestion: 'Include formal dining room' },
      { id: 'pool', label: 'Pool', points: 7,
        matchField: 'hasPool', suggestion: 'Add pool' },
      { id: 'gym', label: 'Gym', points: 7,
        matchField: 'hasGym', suggestion: 'Include fitness area' },
    ],

    avoids: [
      { id: 'modern', label: 'Ultra-Modern/Industrial', penalty: 15,
        matchField: 'isUltraModern', remediation: 'Choose traditional or transitional design' },
      { id: 'flashy', label: 'Flashy/Ostentatious', penalty: 10,
        matchField: 'isFlashyDesign', remediation: 'Opt for understated elegance' },
      { id: 'compact', label: 'Compact Size', penalty: 10,
        matchField: 'isCompactSize', remediation: 'Target larger home appropriate for entertaining' },
      { id: 'limited-security', label: 'Limited Security', penalty: 10,
        matchField: 'hasLimitedSecurity', remediation: 'Enhance security infrastructure' },
    ],
  },
};

// =============================================================================
// CLIENT SATISFACTION SCORING
// =============================================================================

/**
 * Client Satisfaction Score Categories
 * Total: 100 points
 */
const CLIENT_SATISFACTION_CATEGORIES = {
  spatial: { max: 25, label: 'Spatial Requirements' },
  lifestyle: { max: 25, label: 'Lifestyle Alignment' },
  design: { max: 20, label: 'Design Aesthetic' },
  location: { max: 15, label: 'Location Context' },
  futureProofing: { max: 15, label: 'Future-Proofing' },
};

/**
 * Calculate Client Satisfaction Score
 * Measures how well the design serves the client's stated needs
 */
export const calculateClientSatisfaction = (clientData) => {
  const scores = {
    spatial: 0,
    lifestyle: 0,
    design: 0,
    location: 0,
    futureProofing: 0,
  };
  const details = [];

  // Spatial Requirements (25 points max)
  // Room count match (0-5)
  if (clientData.bedroomCount >= 4) {
    scores.spatial += 5;
    details.push({ category: 'spatial', item: 'Room count', points: 5, status: 'full' });
  } else if (clientData.bedroomCount >= 3) {
    scores.spatial += 3;
    details.push({ category: 'spatial', item: 'Room count', points: 3, status: 'partial' });
  }

  // Square footage match (0-5)
  if (clientData.totalSqFt >= 10000) {
    scores.spatial += 5;
    details.push({ category: 'spatial', item: 'Square footage', points: 5, status: 'full' });
  } else if (clientData.totalSqFt >= 6000) {
    scores.spatial += 3;
    details.push({ category: 'spatial', item: 'Square footage', points: 3, status: 'partial' });
  }

  // Flow/adjacencies (0-5)
  if (clientData.hasGoodCirculation) {
    scores.spatial += 5;
    details.push({ category: 'spatial', item: 'Flow/adjacencies', points: 5, status: 'full' });
  } else {
    scores.spatial += 3; // Default partial score
    details.push({ category: 'spatial', item: 'Flow/adjacencies', points: 3, status: 'partial' });
  }

  // Indoor-outdoor (0-5)
  if (clientData.hasIndoorOutdoor) {
    scores.spatial += 5;
    details.push({ category: 'spatial', item: 'Indoor-outdoor connection', points: 5, status: 'full' });
  } else {
    scores.spatial += 2;
    details.push({ category: 'spatial', item: 'Indoor-outdoor connection', points: 2, status: 'partial' });
  }

  // Storage (0-5)
  scores.spatial += 5; // Default full score for storage
  details.push({ category: 'spatial', item: 'Storage adequacy', points: 5, status: 'full' });

  // Lifestyle Alignment (25 points max)
  // Entertainment spaces (0-5)
  if (clientData.hasEntertainingSpaces || clientData.hasTheater || clientData.hasGameRoom) {
    scores.lifestyle += 5;
    details.push({ category: 'lifestyle', item: 'Entertainment spaces', points: 5, status: 'full' });
  } else {
    scores.lifestyle += 2;
    details.push({ category: 'lifestyle', item: 'Entertainment spaces', points: 2, status: 'partial' });
  }

  // Work-from-home (0-5)
  if (clientData.hasHomeOffice) {
    scores.lifestyle += 5;
    details.push({ category: 'lifestyle', item: 'Work-from-home capability', points: 5, status: 'full' });
  } else {
    scores.lifestyle += 1;
    details.push({ category: 'lifestyle', item: 'Work-from-home capability', points: 1, status: 'none' });
  }

  // Hobbies (0-5) - based on specialty spaces
  const hobbySpaces = ['hasTheater', 'hasWineCellar', 'hasCarGallery', 'hasStudio', 'hasGallery', 'hasSportsCourt'];
  const hobbyCount = hobbySpaces.filter(s => clientData[s]).length;
  const hobbyPoints = Math.min(5, hobbyCount * 2);
  scores.lifestyle += hobbyPoints;
  details.push({ category: 'lifestyle', item: 'Hobby spaces', points: hobbyPoints, status: hobbyPoints >= 4 ? 'full' : 'partial' });

  // Privacy/acoustics (0-5)
  if (clientData.hasPrivacy || clientData.hasMaximumPrivacy) {
    scores.lifestyle += 5;
    details.push({ category: 'lifestyle', item: 'Privacy/acoustics', points: 5, status: 'full' });
  } else {
    scores.lifestyle += 2;
    details.push({ category: 'lifestyle', item: 'Privacy/acoustics', points: 2, status: 'partial' });
  }

  // Wellness (0-5)
  if (clientData.hasWellnessSuite || (clientData.hasGym && clientData.hasSpa)) {
    scores.lifestyle += 5;
    details.push({ category: 'lifestyle', item: 'Wellness facilities', points: 5, status: 'full' });
  } else if (clientData.hasGym || clientData.hasPool) {
    scores.lifestyle += 3;
    details.push({ category: 'lifestyle', item: 'Wellness facilities', points: 3, status: 'partial' });
  } else {
    scores.lifestyle += 1;
    details.push({ category: 'lifestyle', item: 'Wellness facilities', points: 1, status: 'none' });
  }

  // Design Aesthetic (20 points max)
  // Architectural style match (0-5)
  if (clientData.tasteStyle) {
    scores.design += 5;
    details.push({ category: 'design', item: 'Architectural style defined', points: 5, status: 'full' });
  } else {
    scores.design += 2;
    details.push({ category: 'design', item: 'Architectural style defined', points: 2, status: 'partial' });
  }

  // Interior design (0-5)
  scores.design += 4; // Default good score
  details.push({ category: 'design', item: 'Interior design coherence', points: 4, status: 'full' });

  // Material quality (0-5)
  if (clientData.isExceptionalQuality || clientData.qualityTier === 'exceptional' || clientData.qualityTier === 'ultra-premium') {
    scores.design += 5;
    details.push({ category: 'design', item: 'Material quality', points: 5, status: 'full' });
  } else {
    scores.design += 3;
    details.push({ category: 'design', item: 'Material quality', points: 3, status: 'partial' });
  }

  // Light/views (0-5)
  if (clientData.hasNaturalLight || clientData.hasIndoorOutdoor) {
    scores.design += 5;
    details.push({ category: 'design', item: 'Natural light/views', points: 5, status: 'full' });
  } else {
    scores.design += 3;
    details.push({ category: 'design', item: 'Natural light/views', points: 3, status: 'partial' });
  }

  // Location Context (15 points max)
  // Commute (0-5)
  scores.location += 4; // Default reasonable
  details.push({ category: 'location', item: 'Commute considerations', points: 4, status: 'partial' });

  // Schools/amenities (0-5)
  if (clientData.isPremiumLocation) {
    scores.location += 5;
    details.push({ category: 'location', item: 'Premium location amenities', points: 5, status: 'full' });
  } else {
    scores.location += 3;
    details.push({ category: 'location', item: 'Location amenities', points: 3, status: 'partial' });
  }

  // Neighborhood (0-5)
  scores.location += 4; // Default good
  details.push({ category: 'location', item: 'Neighborhood quality', points: 4, status: 'partial' });

  // Future-Proofing (15 points max)
  // Adaptability (0-5)
  if (clientData.hasFlexibleSpaces) {
    scores.futureProofing += 5;
    details.push({ category: 'futureProofing', item: 'Space adaptability', points: 5, status: 'full' });
  } else {
    scores.futureProofing += 3;
    details.push({ category: 'futureProofing', item: 'Space adaptability', points: 3, status: 'partial' });
  }

  // Technology (0-5)
  if (clientData.hasSmartHome) {
    scores.futureProofing += 5;
    details.push({ category: 'futureProofing', item: 'Technology infrastructure', points: 5, status: 'full' });
  } else {
    scores.futureProofing += 2;
    details.push({ category: 'futureProofing', item: 'Technology infrastructure', points: 2, status: 'partial' });
  }

  // Sustainability (0-5)
  if (clientData.hasAirWaterSystems || clientData.hasSustainableFeatures) {
    scores.futureProofing += 5;
    details.push({ category: 'futureProofing', item: 'Sustainability features', points: 5, status: 'full' });
  } else {
    scores.futureProofing += 2;
    details.push({ category: 'futureProofing', item: 'Sustainability features', points: 2, status: 'partial' });
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    percentage: total,
    status: total >= 80 ? 'PASS' : total >= 65 ? 'CAUTION' : 'FAIL',
    breakdown: scores,
    details,
    categories: CLIENT_SATISFACTION_CATEGORIES,
  };
};

// =============================================================================
// ARCHETYPE SCORING (Market Appeal)
// =============================================================================

/**
 * Evaluate if a client data field matches an archetype requirement
 */
const evaluateMatch = (clientData, matchField) => {
  const value = clientData[matchField];

  if (value === true) return 'full';
  if (value === false || value === undefined || value === null) return 'none';
  if (typeof value === 'number' && value > 0) return 'full';
  if (typeof value === 'string' && value.length > 0) return 'full';

  return 'none';
};

/**
 * Calculate score for a single archetype
 */
export const calculateArchetypeScore = (archetype, clientData) => {
  const results = {
    mustHaves: { earned: 0, max: 50, items: [] },
    niceToHaves: { earned: 0, max: 35, items: [] },
    avoids: { penalty: 0, items: [] },
  };

  // Score Must Haves (50 points max)
  archetype.mustHaves.forEach(req => {
    const match = evaluateMatch(clientData, req.matchField);
    const points = match === 'full' ? req.points : match === 'partial' ? req.points * 0.5 : 0;
    results.mustHaves.earned += points;
    results.mustHaves.items.push({
      ...req,
      match,
      pointsEarned: points,
    });
  });

  // Score Nice to Haves (35 points max)
  archetype.niceToHaves.forEach(feature => {
    const match = evaluateMatch(clientData, feature.matchField);
    const points = match === 'full' ? feature.points : match === 'partial' ? feature.points * 0.5 : 0;
    results.niceToHaves.earned += points;
    results.niceToHaves.items.push({
      ...feature,
      match,
      pointsEarned: points,
    });
  });

  // Apply Avoid Penalties
  archetype.avoids.forEach(avoid => {
    const triggered = evaluateMatch(clientData, avoid.matchField) === 'full';
    if (triggered) {
      results.avoids.penalty += avoid.penalty;
      results.avoids.items.push({ ...avoid, triggered: true });
    } else {
      results.avoids.items.push({ ...avoid, triggered: false });
    }
  });

  const earned = results.mustHaves.earned + results.niceToHaves.earned;
  const penalty = results.avoids.penalty;
  const max = results.mustHaves.max + results.niceToHaves.max;

  const rawScore = earned - penalty;
  const percentage = Math.max(0, Math.min(100, Math.round((rawScore / max) * 100)));

  return {
    percentage,
    status: percentage >= 80 ? 'PASS' : percentage >= 65 ? 'CAUTION' : 'FAIL',
    breakdown: results,
    gaps: identifyGaps(results),
    pathTo80: calculatePathTo80(percentage, results),
  };
};

/**
 * Identify gaps (missing requirements and triggered avoids)
 */
const identifyGaps = (results) => {
  const gaps = [];

  // Missing Must Haves
  results.mustHaves.items
    .filter(item => item.match !== 'full')
    .forEach(item => {
      gaps.push({
        category: 'Must Have',
        item: item.label,
        currentStatus: item.match,
        pointsAvailable: item.points - item.pointsEarned,
        priority: 'High',
        suggestion: item.suggestion,
      });
    });

  // Missing Nice to Haves
  results.niceToHaves.items
    .filter(item => item.match !== 'full')
    .forEach(item => {
      gaps.push({
        category: 'Nice to Have',
        item: item.label,
        currentStatus: item.match,
        pointsAvailable: item.points - item.pointsEarned,
        priority: 'Medium',
        suggestion: item.suggestion,
      });
    });

  // Triggered Avoids
  results.avoids.items
    .filter(item => item.triggered)
    .forEach(item => {
      gaps.push({
        category: 'Avoid',
        item: item.label,
        penaltyApplied: item.penalty,
        priority: 'High',
        suggestion: item.remediation,
      });
    });

  // Sort by potential impact
  return gaps.sort((a, b) =>
    (b.pointsAvailable || b.penaltyApplied || 0) -
    (a.pointsAvailable || a.penaltyApplied || 0)
  );
};

/**
 * Calculate recommendations to reach 80%
 */
const calculatePathTo80 = (currentScore, results) => {
  const pointsNeeded = 80 - currentScore;

  if (pointsNeeded <= 0) {
    return { achieved: true, pointsNeeded: 0, recommendations: [] };
  }

  const recommendations = [];
  let pointsAccumulated = 0;

  // Collect all improvement opportunities
  const opportunities = [];

  // Avoids to remove (highest priority - removing penalties)
  results.avoids.items
    .filter(item => item.triggered)
    .forEach(item => {
      opportunities.push({
        action: item.remediation,
        points: item.penalty,
        type: 'avoid',
        difficulty: 'Moderate',
        priority: 1,
      });
    });

  // Missing Must Haves
  results.mustHaves.items
    .filter(item => item.match !== 'full')
    .forEach(item => {
      opportunities.push({
        action: item.suggestion,
        points: item.points - item.pointsEarned,
        type: 'mustHave',
        difficulty: item.points >= 10 ? 'Significant' : 'Moderate',
        priority: 2,
      });
    });

  // Missing Nice to Haves
  results.niceToHaves.items
    .filter(item => item.match !== 'full')
    .forEach(item => {
      opportunities.push({
        action: item.suggestion,
        points: item.points - item.pointsEarned,
        type: 'niceToHave',
        difficulty: 'Easy',
        priority: 3,
      });
    });

  // Sort by priority then by points
  opportunities.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.points - a.points;
  });

  // Select recommendations until we reach 80%
  for (const opp of opportunities) {
    if (pointsAccumulated >= pointsNeeded) break;

    recommendations.push({
      action: opp.action,
      points: opp.points,
      difficulty: opp.difficulty,
      type: opp.type,
    });
    pointsAccumulated += opp.points;
  }

  // Mark the easiest recommendation
  if (recommendations.length > 0) {
    const easiest = recommendations.reduce((prev, curr) =>
      curr.difficulty === 'Easy' && curr.points >= prev.points ? curr : prev,
      { points: 0 }
    );
    if (easiest.action) {
      const idx = recommendations.findIndex(r => r.action === easiest.action);
      if (idx >= 0) recommendations[idx].isEasiest = true;
    }
  }

  return {
    achieved: false,
    pointsNeeded,
    recommendations,
    totalAvailable: pointsAccumulated,
  };
};

// =============================================================================
// FEATURE CLASSIFICATION
// =============================================================================

/**
 * Classify features into Essential/Differentiating/Personal/Risky quadrants
 */
export const classifyFeatures = (clientData, archetypeScores) => {
  const classification = {
    essential: [],      // Must include - high value across multiple archetypes
    differentiating: [], // Premium value - appeals strongly to top archetypes
    personal: [],       // Limited market - benefits client but narrows buyer pool
    risky: [],          // Reconsider - triggers avoids or limits appeal
  };

  // Get top 3 archetypes by score
  const topArchetypes = archetypeScores.slice(0, 3);

  // Features we're tracking - comprehensive list
  const featureChecks = [
    { id: 'smart-home', label: 'Smart Home', field: 'hasSmartHome' },
    { id: 'home-office', label: 'Home Office', field: 'hasHomeOffice' },
    { id: 'theater', label: 'Home Theater', field: 'hasTheater' },
    { id: 'gym', label: 'Gym', field: 'hasGym' },
    { id: 'wine-cellar', label: 'Wine Cellar', field: 'hasWineCellar' },
    { id: 'pool', label: 'Pool', field: 'hasPool' },
    { id: 'pool-house', label: 'Pool House', field: 'hasPoolHouse' },
    { id: 'staff-quarters', label: 'Staff Quarters', field: 'hasStaffQuarters' },
    { id: 'guest-suite', label: 'Guest Suite', field: 'hasGuestSuite' },
    { id: 'multiple-guest-suites', label: 'Multiple Guest Suites', field: 'hasMultipleGuestSuites' },
    { id: 'car-gallery', label: 'Car Gallery', field: 'hasCarGallery' },
    { id: 'sports-court', label: 'Sports Court', field: 'hasSportsCourt' },
    { id: 'spa', label: 'Spa/Wellness', field: 'hasWellnessSuite' },
    { id: 'spa-only', label: 'Spa (Steam/Sauna)', field: 'hasSpa' },
    { id: 'library', label: 'Library', field: 'hasLibrary' },
    { id: 'formal-dining', label: 'Formal Dining', field: 'hasFormalDining' },
    { id: 'chefs-kitchen', label: "Chef's Kitchen", field: 'hasChefsKitchen' },
    { id: 'security-room', label: 'Security Room', field: 'hasSecurityRoom' },
    { id: 'game-room', label: 'Game Room', field: 'hasGameRoom' },
    { id: 'entertainment-terrace', label: 'Entertainment Terrace', field: 'hasEntertainmentTerrace' },
    { id: 'guest-house', label: 'Guest House', field: 'hasGuestHouse' },
    { id: 'ev-charging', label: 'EV Charging', field: 'hasEvCharging' },
  ];

  console.log('[BAM classifyFeatures] Client features:',
    featureChecks.filter(f => clientData[f.field]).map(f => f.label)
  );

  featureChecks.forEach(feature => {
    if (!clientData[feature.field]) return; // Skip if client doesn't have this feature

    // Count how many archetypes want this as Must Have vs Nice to Have vs Avoid
    let mustHaveCount = 0;
    let niceToHaveCount = 0;
    let avoidCount = 0;

    topArchetypes.forEach(arch => {
      const persona = PERSONAS[arch.id];
      if (!persona) return;

      const isMustHave = persona.mustHaves?.some(m => m.matchField === feature.field);
      const isNiceToHave = persona.niceToHaves?.some(n => n.matchField === feature.field);
      const isAvoid = persona.avoids?.some(a => a.matchField === feature.field);

      if (isMustHave) mustHaveCount++;
      if (isNiceToHave) niceToHaveCount++;
      if (isAvoid) avoidCount++;
    });

    // Classify based on archetype preferences
    if (mustHaveCount >= 2) {
      classification.essential.push({ ...feature, reason: 'Required by multiple buyer types' });
    } else if (mustHaveCount === 1 || niceToHaveCount >= 2) {
      classification.differentiating.push({ ...feature, reason: 'Adds premium value' });
    } else if (avoidCount > 0) {
      classification.risky.push({ ...feature, reason: `May limit appeal (${avoidCount} archetype avoids)` });
    } else {
      classification.personal.push({ ...feature, reason: 'Personal preference, limited market impact' });
    }
  });

  return classification;
};

// =============================================================================
// MAIN BAM CALCULATION
// =============================================================================

/**
 * Calculate complete BAM scores
 */
export const calculateBAMScores = (clientData, marketLocation, portfolioContext = 'primary-residence') => {
  // 1. Client Satisfaction Score
  const clientScore = calculateClientSatisfaction(clientData);

  // 2. Get buyer pool for market
  const marketKey = normalizeMarketName(marketLocation);
  const buyerPool = MARKET_BUYER_POOLS[marketKey] || MARKET_BUYER_POOLS['malibu'];

  // 3. Score each archetype in the market
  const archetypeScores = buyerPool.archetypes.map(arch => {
    const persona = PERSONAS[arch.id];
    if (!persona) {
      return {
        ...arch,
        name: 'Other',
        score: { percentage: 50, status: 'CAUTION' },
        weightedContribution: 50 * arch.share,
      };
    }

    const score = calculateArchetypeScore(persona, clientData);
    return {
      ...arch,
      ...persona,
      score,
      weightedContribution: score.percentage * arch.share,
    };
  });

  // 4. Market Appeal = weighted average
  const marketPercentage = Math.round(
    archetypeScores.reduce((sum, a) => sum + a.weightedContribution, 0)
  );

  // 5. Combined score based on portfolio context
  const weights = PORTFOLIO_WEIGHTS[portfolioContext] || PORTFOLIO_WEIGHTS['primary-residence'];
  const combinedScore = Math.round(
    (clientScore.percentage * weights.client) + (marketPercentage * weights.market)
  );

  // 6. Feature classification
  const featureClassification = classifyFeatures(clientData, archetypeScores);

  return {
    clientSatisfaction: clientScore,
    marketAppeal: {
      percentage: marketPercentage,
      status: marketPercentage >= 80 ? 'PASS' : marketPercentage >= 65 ? 'CAUTION' : 'FAIL',
      archetypes: archetypeScores.sort((a, b) => b.score.percentage - a.score.percentage),
      market: buyerPool,
    },
    combined: {
      score: combinedScore,
      status: combinedScore >= 80 ? 'PASS' : combinedScore >= 65 ? 'CAUTION' : 'FAIL',
      clientContribution: Math.round(clientScore.percentage * weights.client),
      marketContribution: Math.round(marketPercentage * weights.market),
      weights,
    },
    portfolioContext,
    featureClassification,
  };
};

// =============================================================================
// CLIENT DATA EXTRACTION (Enhanced)
// =============================================================================

/**
 * Extract client data from KYC, FYI, MVP modules
 * Enhanced for v3.0 Must Have/Nice to Have/Avoid evaluation
 *
 * IMPORTANT DATA PATHS:
 * - FYI spaces: fyiData.brief.spaces (array) OR fyiData.selections (object keyed by space code)
 * - Privacy: kycData.principal.lifestyleLiving.privacyLevelRequired (1-5 scale)
 * - Taste: kycData.principal.designIdentity.principalTasteResults.dominant
 */
export const extractClientData = (kycData, fyiData, mvpData, kymLocation) => {
  // Debug logging to help identify data issues
  console.log('[BAM extractClientData] Input data:', {
    hasKycData: !!kycData,
    hasFyiData: !!fyiData,
    hasMvpData: !!mvpData,
    hasKymLocation: !!kymLocation,
    fyiDataKeys: fyiData ? Object.keys(fyiData) : [],
    fyiBriefSpaces: fyiData?.brief?.spaces?.length || 0,
    fyiSelectionsCount: fyiData?.selections ? Object.keys(fyiData.selections).length : 0,
    kycPrivacyLevel: kycData?.principal?.lifestyleLiving?.privacyLevelRequired,
    kycTasteResults: kycData?.principal?.designIdentity?.principalTasteResults?.dominant,
  });

  const data = {
    // Basic info
    spaces: [],
    tasteStyle: null,
    totalSqFt: null,
    state: null,
    familyType: null,
    bedroomCount: 0,

    // Feature flags for archetype matching
    hasSmartHome: false,
    hasHomeOffice: false,
    hasTheater: false,
    hasGym: false,
    hasWineCellar: false,
    hasPool: false,
    hasPoolHouse: false,
    hasStaffQuarters: false,
    hasGuestSuite: false,
    hasGuestHouse: false,
    hasCarGallery: false,
    hasSportsCourt: false,
    hasWellnessSuite: false,
    hasSpa: false,
    hasLibrary: false,
    hasFormalDining: false,
    hasSecurityRoom: false,
    hasChefsKitchen: false,
    hasStudio: false,
    hasGallery: false,
    hasMeditationSpace: false,
    hasGameRoom: false,
    hasKidsSpaces: false,
    hasRecoverySuite: false,
    hasLargeGym: false,
    hasEntertainmentTerrace: false,
    hasEvCharging: false,

    // Style flags
    isModernStyle: false,
    isTraditionalStyle: false,
    isMinimalistStyle: false,

    // Property flags
    hasPrivacy: false,
    hasMaximumPrivacy: false,
    hasIndoorOutdoor: false,
    hasGuestAutonomy: false,
    hasMultipleGuestSuites: false,
    hasMultipleBedrooms: false,
    isEstateProperty: false,
    isCompactSize: false,
    hasLargeProperty: false,
    isPremiumLocation: false,
    isExceptionalQuality: false,
    hasNaturalLight: true, // Default true
    hasGoodCirculation: true, // Default true
    hasFlexibleSpaces: false,
    hasEntertainingSpaces: false,
    qualityTier: null,
  };

  // ==========================================================================
  // From FYI: Selected spaces
  // Data can come from:
  //   1. fyiData.brief.spaces - Array of { code, name, zone, targetSF, level, size, notes }
  //   2. fyiData.selections - Object { [spaceCode]: { included, size, level, customSF, ... } }
  // ==========================================================================
  let selectedSpaces = [];

  // Option 1: Use brief.spaces if available (preferred - has processed space info)
  if (fyiData?.brief?.spaces && Array.isArray(fyiData.brief.spaces)) {
    selectedSpaces = fyiData.brief.spaces;
    console.log('[BAM] Using fyiData.brief.spaces:', selectedSpaces.length, 'spaces');
  }
  // Option 2: Convert selections object to array (fallback)
  else if (fyiData?.selections && typeof fyiData.selections === 'object') {
    // Comprehensive space code to name mapping (from space-registry.js)
    const spaceCodeToName = {
      // Zone 1: Arrival + Public
      'FOY': 'Foyer / Gallery', 'PWD': 'Powder Room', 'OFF': 'Private Office',
      'GR': 'Great Room', 'DR': 'Formal Dining', 'WINE': 'Wine Room', 'LIB': 'Library',
      // Zone 2: Family + Kitchen
      'FR': 'Family Room', 'KIT': 'Kitchen (Show)', 'BKF': 'Breakfast Area',
      'SCUL': 'Scullery', 'CHEF': "Chef's Kitchen",
      // Zone 3: Entertainment
      'MEDIA': 'Media Room', 'BAR': 'Bar', 'GAME': 'Game Room',
      'THR': 'Theater', 'MUS': 'Music Room', 'ART': 'Art Studio',
      // Zone 4: Wellness
      'GYM': 'Gym', 'SPA': 'Spa', 'MAS': 'Massage Room',
      'PLH': 'Pool House', 'POOLSUP': 'Pool Support',
      // Zone 5: Primary Suite
      'PRI': 'Primary Suite', 'PRIBATH': 'Primary Bath',
      'PRICL_HIS': 'His Closet', 'PRICL_HER': 'Her Closet',
      'PRILNG': 'Primary Lounge', 'POF': 'Private Office (Primary)',
      // Zone 6: Guest + Secondary
      'JRPRI': 'Jr Primary Suite', 'JRPRIBATH': 'Jr Primary Bath', 'JRPRICL': 'Jr Primary Closet',
      'GST1': 'Guest Suite 1', 'GST2': 'Guest Suite 2',
      'GST3': 'Guest Suite 3', 'GST4': 'Guest Suite 4',
      'BNK': 'Bunk Room', 'PLY': 'Playroom', 'HWK': 'Homework Room',
      'NNY': 'Nanny Suite', 'STF': 'Staff Suite',
      // Zone 7: Service + BOH
      'MUD': 'Mudroom', 'LND': 'Laundry', 'MEP': 'Mechanical',
      'STR': 'Storage', 'GAR': 'Garage', 'WRK': 'Workshop',
      'SKT': 'Staff Kitchen', 'SLG': 'Staff Lounge', 'COR': 'Corridor',
      // Zone 8: Outdoor
      'TERR': 'Covered Terrace', 'POOL': 'Pool + Deck', 'OKT': 'Outdoor Kitchen',
      'FPT': 'Fire Pit', 'ODN': 'Outdoor Dining', 'CTY': 'Courtyard', 'POOL_BATH': 'Pool Bathroom',
      // Zone 9: Guest House
      'GH_PWD': 'Guest House Powder', 'GH_LIV': 'Guest House Living',
      'GH_KIT': 'Guest House Kitchen', 'GH_DIN': 'Guest House Dining',
      'GH_GST1': 'Guest House Suite 1', 'GH_GST2': 'Guest House Suite 2', 'GH_GST3': 'Guest House Suite 3',
      // Zone 10: Pool House
      'PH_SHW': 'Pool House Shower', 'PH_CHG': 'Pool House Changing',
      'PH_BATH': 'Pool House Bath', 'PH_ENT': 'Pool House Entertainment',
      'PH_KIT': 'Pool House Kitchen', 'PH_DIN': 'Pool House Dining',
    };

    Object.entries(fyiData.selections).forEach(([code, selection]) => {
      if (selection.included) {
        selectedSpaces.push({
          code,
          name: spaceCodeToName[code] || code,
          targetSF: selection.customSF || 0,
          level: selection.level,
          size: selection.size,
        });
      }
    });
    console.log('[BAM] Converted fyiData.selections to', selectedSpaces.length, 'spaces');
  }

  // Process selected spaces to set feature flags
  if (selectedSpaces.length > 0) {
    data.spaces = selectedSpaces.map(s => s.name || s.code || s);

    // Set feature flags based on spaces
    const spaceNames = data.spaces.map(s => (s || '').toLowerCase());
    console.log('[BAM] Space names for matching:', spaceNames);

    data.hasHomeOffice = spaceNames.some(s => s.includes('office'));
    data.hasTheater = spaceNames.some(s => s.includes('theater') || s.includes('screening'));
    data.hasGym = spaceNames.some(s => s.includes('gym') || s.includes('fitness'));
    data.hasLargeGym = selectedSpaces.some(s => {
      const name = (s.name || s.code || '').toLowerCase();
      return name.includes('gym') && (s.targetSF || 0) >= 1000;
    });
    data.hasWineCellar = spaceNames.some(s => s.includes('wine'));
    data.hasPool = spaceNames.some(s => s.includes('pool') && !s.includes('pool house'));
    data.hasPoolHouse = spaceNames.some(s => s.includes('pool house'));
    data.hasStaffQuarters = spaceNames.some(s => s.includes('staff'));
    data.hasGuestSuite = spaceNames.some(s => s.includes('guest suite'));
    data.hasCarGallery = spaceNames.some(s => s.includes('car gallery') || s.includes('garage'));
    data.hasSportsCourt = spaceNames.some(s => s.includes('sport') || s.includes('basketball') || s.includes('tennis'));
    data.hasSpa = spaceNames.some(s => s.includes('spa') || s.includes('steam') || s.includes('sauna'));
    data.hasWellnessSuite = data.hasGym && data.hasSpa;
    data.hasRecoverySuite = data.hasSpa;
    data.hasLibrary = spaceNames.some(s => s.includes('library') || s.includes('study'));
    data.hasFormalDining = spaceNames.some(s => s.includes('formal dining') || s.includes('dining'));
    data.hasSecurityRoom = spaceNames.some(s => s.includes('security'));
    data.hasChefsKitchen = spaceNames.some(s => s.includes('chef') || s.includes('prep kitchen'));
    data.hasStudio = spaceNames.some(s => s.includes('studio') || s.includes('art'));
    data.hasGallery = spaceNames.some(s => s.includes('gallery') && !s.includes('car'));
    data.hasMeditationSpace = spaceNames.some(s => s.includes('meditation') || s.includes('yoga'));
    data.hasGameRoom = spaceNames.some(s => s.includes('game') || s.includes('billiard') || s.includes('rec'));
    data.hasKidsSpaces = spaceNames.some(s => s.includes('kid') || s.includes('bunk') || s.includes('playroom'));
    data.hasEntertainmentTerrace = spaceNames.some(s => s.includes('terrace') || s.includes('covered outdoor') || s.includes('outdoor kitchen'));
    data.hasEntertainingSpaces = data.hasTheater || data.hasGameRoom || data.hasEntertainmentTerrace;

    // Count guest suites
    const guestSuiteCount = spaceNames.filter(s => s.includes('guest suite')).length;
    data.hasMultipleGuestSuites = guestSuiteCount >= 3;

    console.log('[BAM] Feature flags set:', {
      hasTheater: data.hasTheater,
      hasWineCellar: data.hasWineCellar,
      hasPool: data.hasPool,
      hasPoolHouse: data.hasPoolHouse,
      hasChefsKitchen: data.hasChefsKitchen,
      hasStaffQuarters: data.hasStaffQuarters,
      guestSuiteCount,
    });
  }

  // ==========================================================================
  // From KYC: Taste/Design style
  // Check multiple possible locations for taste data
  // ==========================================================================
  if (kycData?.principal?.designIdentity?.primaryStyle) {
    data.tasteStyle = kycData.principal.designIdentity.primaryStyle;
  } else if (kycData?.principal?.designIdentity?.principalTasteResults?.dominant) {
    // New path: principalTasteResults from Taste Exploration
    data.tasteStyle = kycData.principal.designIdentity.principalTasteResults.dominant;
  } else if (kycData?.principal?.designIdentity?.tasteResults?.dominant) {
    // Legacy path
    data.tasteStyle = kycData.principal.designIdentity.tasteResults.dominant;
  }

  // Set style flags
  if (data.tasteStyle) {
    const style = data.tasteStyle.toLowerCase();
    data.isModernStyle = ['modern', 'contemporary', 'minimalist', 'scandinavian'].some(s => style.includes(s));
    data.isTraditionalStyle = ['traditional', 'colonial', 'georgian', 'mediterranean'].some(s => style.includes(s));
    data.isMinimalistStyle = style.includes('minimal') || style.includes('industrial');
  }

  // From MVP or FYI: Total square footage
  if (mvpData?.totalSquareFootage) {
    data.totalSqFt = mvpData.totalSquareFootage;
  } else if (mvpData?.selectedTier?.maxSF) {
    data.totalSqFt = mvpData.selectedTier.maxSF;
  } else if (fyiData?.totalSquareFootage) {
    data.totalSqFt = fyiData.totalSquareFootage;
  }

  data.isCompactSize = data.totalSqFt && data.totalSqFt < 10000;

  // From KYM or KYC: State
  if (kymLocation?.state) {
    data.state = kymLocation.state;
  } else if (kycData?.principal?.projectParameters?.projectState) {
    data.state = kycData.principal.projectParameters.projectState;
  }

  // From KYC: Family composition
  if (kycData?.principal?.household) {
    const hh = kycData.principal.household;
    if (hh.children === 0 && !hh.hasPartner) {
      data.familyType = 'single';
    } else if (hh.children === 0) {
      data.familyType = 'couple';
    } else if (hh.childrenAges?.some(age => age < 12)) {
      data.familyType = 'youngFamily';
    } else if (hh.childrenAges?.some(age => age >= 12 && age < 18)) {
      data.familyType = 'establishedFamily';
    } else if (hh.children > 0) {
      data.familyType = 'emptyNesters';
    }
    if (hh.multiGenerational) {
      data.familyType = 'multiGen';
    }
  }

  // ==========================================================================
  // From FYI or KYC: Bedroom count
  // ==========================================================================
  if (fyiData?.rooms?.bedrooms?.count) {
    data.bedroomCount = fyiData.rooms.bedrooms.count;
  } else if (kycData?.principal?.projectParameters?.bedroomCount) {
    // From KYC project parameters
    data.bedroomCount = kycData.principal.projectParameters.bedroomCount;
  } else if (selectedSpaces.length > 0) {
    // Count bedrooms from selected FYI spaces
    const bedrooms = selectedSpaces.filter(s => {
      const name = (s.name || s.code || '').toLowerCase();
      return name.includes('primary') || name.includes('guest suite') ||
             name.includes('jr primary') || name.includes('bedroom');
    });
    data.bedroomCount = bedrooms.length || 4;
  }
  data.hasMultipleBedrooms = data.bedroomCount >= 6;

  // ==========================================================================
  // From KYC: Privacy level
  // Check lifestyleLiving.privacyLevelRequired (1-5 scale) AND siteRequirements
  // ==========================================================================
  // First check lifestyleLiving (primary source for privacy preference)
  if (kycData?.principal?.lifestyleLiving?.privacyLevelRequired) {
    const privacyLevel = kycData.principal.lifestyleLiving.privacyLevelRequired;
    // Scale: 1 = Low, 3 = Moderate, 5 = Maximum
    data.hasPrivacy = privacyLevel >= 4;
    data.hasMaximumPrivacy = privacyLevel >= 5;
    console.log('[BAM] Privacy from lifestyleLiving:', privacyLevel, '-> hasPrivacy:', data.hasPrivacy);
  }

  // Also check siteRequirements for additional property info
  if (kycData?.principal?.siteRequirements) {
    const site = kycData.principal.siteRequirements;
    // Only override if not already set from lifestyleLiving
    if (!data.hasPrivacy && site.privacy) {
      data.hasPrivacy = site.privacy === 'High' || site.privacy === 'Maximum';
      data.hasMaximumPrivacy = site.privacy === 'Maximum';
    }
    data.hasGuestHouse = site.hasGuestHouse;
    data.hasPool = data.hasPool || site.hasPool;
    data.hasTennis = site.hasTennis;
    data.hasLargeProperty = site.acreage && site.acreage >= 1;
    data.isEstateProperty = site.acreage && site.acreage >= 2;
  }

  // Also check projectParameters for guest house / pool house
  if (kycData?.principal?.projectParameters) {
    const params = kycData.principal.projectParameters;
    data.hasGuestHouse = data.hasGuestHouse || params.hasGuestHouse;
    data.hasPoolHouse = data.hasPoolHouse || params.hasPoolHouse;
  }

  // From KYC: Quality tier
  if (kycData?.principal?.portfolioContext?.qualityTier) {
    data.qualityTier = kycData.principal.portfolioContext.qualityTier;
    data.isExceptionalQuality = ['exceptional', 'ultra-premium'].includes(data.qualityTier.toLowerCase());
  }

  // From MVP: Adjacencies and flow
  if (mvpData?.adjacencies) {
    data.hasIndoorOutdoor = mvpData.adjacencies.some(a => a.outdoor || a.type === 'outdoor');
    data.hasGoodCirculation = mvpData.validation?.moduleScores?.circulation >= 70;
  }

  // From KYC: Smart home and EV
  if (kycData?.principal?.technologyPreferences) {
    data.hasSmartHome = kycData.principal.technologyPreferences.smartHome;
    data.hasEvCharging = kycData.principal.technologyPreferences.evCharging;
  }

  // Default smart home from spaces
  if (!data.hasSmartHome && data.spaces.some(s => (s || '').toLowerCase().includes('smart'))) {
    data.hasSmartHome = true;
  }

  // Check for premium location
  if (kymLocation) {
    const premiumMarkets = ['malibu', 'beverly hills', 'aspen', 'greenwich', 'palm beach', 'hamptons', 'miami beach'];
    const locationName = (kymLocation.city || kymLocation.name || '').toLowerCase();
    data.isPremiumLocation = premiumMarkets.some(m => locationName.includes(m));
  }

  // Guest autonomy from MVP
  if (mvpData?.features?.guestAutonomy) {
    data.hasGuestAutonomy = mvpData.features.guestAutonomy === 'Full' || mvpData.features.guestAutonomy === 'Partial';
  }

  // Flexible spaces
  data.hasFlexibleSpaces = data.spaces.some(s => {
    const name = (s || '').toLowerCase();
    return name.includes('flex') || name.includes('bonus') || name.includes('multi');
  });

  // Final summary log for debugging
  console.log('[BAM extractClientData] Final extracted data summary:', {
    spacesCount: data.spaces.length,
    bedroomCount: data.bedroomCount,
    totalSqFt: data.totalSqFt,
    tasteStyle: data.tasteStyle,
    isPremiumLocation: data.isPremiumLocation,
    // Key features for Entertainment Executive
    hasTheater: data.hasTheater,
    hasWineCellar: data.hasWineCellar,
    hasPool: data.hasPool,
    hasPoolHouse: data.hasPoolHouse,
    hasChefsKitchen: data.hasChefsKitchen,
    hasPrivacy: data.hasPrivacy,
    hasMaximumPrivacy: data.hasMaximumPrivacy,
    hasStaffQuarters: data.hasStaffQuarters,
    hasMultipleGuestSuites: data.hasMultipleGuestSuites,
    hasEntertainmentTerrace: data.hasEntertainmentTerrace,
  });

  return data;
};

// =============================================================================
// LEGACY SCORING (Backward Compatibility)
// =============================================================================

/**
 * Calculate match score for a single persona (legacy format)
 * Kept for backward compatibility with existing components
 */
export const calculatePersonaScore = (persona, clientData) => {
  // Use new archetype scoring
  const score = calculateArchetypeScore(persona, clientData);

  return {
    personaId: persona.id,
    score: score.percentage,
    matchLevel: score.status === 'PASS' ? 'Strong' : score.status === 'CAUTION' ? 'Moderate' : 'Weak',
    confidence: 'High',
    positiveFactors: score.breakdown.mustHaves.items
      .filter(i => i.match === 'full')
      .map(i => ({ category: 'Must Have', factor: i.label, impact: i.points, description: 'Meets requirement' })),
    negativeFactors: score.breakdown.avoids.items
      .filter(i => i.triggered)
      .map(i => ({ category: 'Avoid', factor: i.label, impact: -i.penalty, description: i.remediation })),
    allFactors: [],
  };
};

/**
 * Calculate scores for all personas (legacy format)
 */
export const calculateAllPersonaScores = (clientData) => {
  const results = Object.values(PERSONAS).map(persona => ({
    ...persona,
    scoring: calculatePersonaScore(persona, clientData),
  }));

  return results.sort((a, b) => b.scoring.score - a.scoring.score);
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  PERSONAS,
  PORTFOLIO_WEIGHTS,
  MARKET_BUYER_POOLS,
  normalizeMarketName,
  calculateClientSatisfaction,
  calculateArchetypeScore,
  calculateBAMScores,
  classifyFeatures,
  extractClientData,
  calculatePersonaScore,
  calculateAllPersonaScores,
};
