/**
 * BAMScoring.js
 * 
 * Buyer Alignment Module - Scoring Engine
 * Calculates buyer persona matches based on client's design decisions
 */

// =============================================================================
// PERSONA DEFINITIONS
// =============================================================================

export const PERSONAS = {
  techExecutive: {
    id: 'techExecutive',
    name: 'Tech Executive',
    shortDesc: 'Technology leaders seeking modern, connected estates',
    fullDesc: 'Successful technology industry leaders, startup founders, and C-suite executives who value innovation, privacy, and modern design. They prioritize smart home integration and functional spaces over traditional opulence.',
    demographics: {
      ageRange: '35-55',
      netWorth: '$20M - $200M',
      occupation: 'Tech CEO / Founder / CTO / VP Engineering',
    },
    icon: 'cpu', // Lucide icon name
    
    // Scoring weights
    spaceScoring: {
      'Home Office': 20,
      'Smart Home Integration': 25,
      'EV Garage': 15,
      'Car Gallery': 12,
      'Home Theater': 12,
      'Gym': 10,
      'Wine Cellar': 5,
      'Pool': 8,
      'Pool House': 8,
      'Covered Terrace': 5,
      'Staff Quarters': -10,
      'Kids Bunk Room': -5,
      'Guest Suite': -3,
    },
    tasteScoring: {
      'Modern': 20,
      'Contemporary': 15,
      'Minimalist': 18,
      'Industrial': 10,
      'Scandinavian': 12,
      'Traditional': -15,
      'Mediterranean': -10,
      'Colonial': -12,
      'Coastal': 5,
    },
    sizeScoring: {
      '6000-8000': 10,
      '8000-12000': 20,
      '12000-15000': 15,
      '15000-18000': 5,
      '18000-25000': -10,
      '25000+': -20,
    },
    locationScoring: {
      'CA': 15, 'WA': 20, 'TX': 12, 'CO': 15, 'MA': 10,
      'NY': 5, 'FL': 0, 'CT': -5, 'NJ': 0,
    },
    familyScoring: {
      'single': 15, 'couple': 15, 'youngFamily': 5,
      'establishedFamily': 0, 'emptyNesters': 10, 'multiGen': -15,
    },
    bedroomScoring: {
      '2': 15, '3': 12, '4': 8, '5': 0, '6': -5, '7+': -15,
    },
  },

  entertainment: {
    id: 'entertainment',
    name: 'Entertainment Industry',
    shortDesc: 'Film producers and studio executives seeking prestige addresses',
    fullDesc: 'Film producers, studio executives, talent agents, and content creators who require prestigious addresses, exceptional privacy, and spaces designed for high-profile entertaining and screening events.',
    demographics: {
      ageRange: '40-65',
      netWorth: '$30M - $500M',
      occupation: 'Producer / Studio Executive / Talent / Agent',
    },
    icon: 'film',
    
    spaceScoring: {
      'Home Theater': 25,
      'Screening Room': 30,
      'Guest Suite': 15,
      'Pool': 12,
      'Pool House': 15,
      'Wine Cellar': 18,
      'Chef\'s Kitchen': 15,
      'Great Room': 12,
      'Covered Terrace': 10,
      'Staff Quarters': 10,
      'Home Office': 8,
      'Gym': 5,
    },
    tasteScoring: {
      'Contemporary': 15,
      'Modern': 10,
      'Hollywood Regency': 20,
      'Traditional': 8,
      'Mediterranean': 12,
      'Minimalist': -5,
      'Industrial': -10,
    },
    sizeScoring: {
      '6000-8000': -10,
      '8000-12000': 5,
      '12000-15000': 15,
      '15000-18000': 20,
      '18000-25000': 15,
      '25000+': 10,
    },
    locationScoring: {
      'CA': 25, 'NY': 15, 'FL': 5, 'CO': -5,
      'TX': -5, 'CT': 0, 'NJ': -5,
    },
    familyScoring: {
      'single': 10, 'couple': 15, 'youngFamily': 5,
      'establishedFamily': 10, 'emptyNesters': 15, 'multiGen': 5,
    },
    bedroomScoring: {
      '2': -10, '3': 0, '4': 10, '5': 15, '6': 15, '7+': 10,
    },
  },

  finance: {
    id: 'finance',
    name: 'Finance Executive',
    shortDesc: 'Investment professionals valuing traditional elegance',
    fullDesc: 'Investment bankers, hedge fund managers, and private equity principals who appreciate traditional elegance, quality construction, and proximity to financial centers. They value discretion and conservative design choices.',
    demographics: {
      ageRange: '45-65',
      netWorth: '$50M - $500M',
      occupation: 'Managing Director / Partner / Fund Manager',
    },
    icon: 'landmark',
    
    spaceScoring: {
      'Wine Cellar': 25,
      'Home Office': 20,
      'Library': 20,
      'Chef\'s Kitchen': 12,
      'Formal Dining': 15,
      'Guest Suite': 10,
      'Pool': 8,
      'Gym': 8,
      'Home Theater': 10,
      'Staff Quarters': 5,
      'Kids Bunk Room': 5,
    },
    tasteScoring: {
      'Traditional': 20,
      'Georgian': 18,
      'Colonial': 15,
      'Transitional': 12,
      'Contemporary': 5,
      'Modern': -5,
      'Minimalist': -10,
      'Industrial': -15,
    },
    sizeScoring: {
      '6000-8000': -5,
      '8000-12000': 10,
      '12000-15000': 20,
      '15000-18000': 15,
      '18000-25000': 10,
      '25000+': 5,
    },
    locationScoring: {
      'NY': 20, 'CT': 25, 'NJ': 15, 'FL': 10,
      'MA': 12, 'CA': 5, 'TX': 0, 'CO': -5,
    },
    familyScoring: {
      'single': 5, 'couple': 12, 'youngFamily': 10,
      'establishedFamily': 15, 'emptyNesters': 15, 'multiGen': 10,
    },
    bedroomScoring: {
      '2': -10, '3': 0, '4': 10, '5': 15, '6': 12, '7+': 5,
    },
  },

  international: {
    id: 'international',
    name: 'International Investor',
    shortDesc: 'Global wealth holders seeking US trophy properties',
    fullDesc: 'International ultra-high-net-worth individuals seeking trophy properties in premier US markets for investment diversification, family use, and wealth preservation. They prioritize security, privacy, and turnkey condition.',
    demographics: {
      ageRange: '45-70',
      netWorth: '$100M+',
      occupation: 'International Business / Investment / Family Office',
    },
    icon: 'globe',
    
    spaceScoring: {
      'Staff Quarters': 25,
      'Security Room': 20,
      'Guest Suite': 20,
      'Wine Cellar': 15,
      'Pool': 12,
      'Home Theater': 10,
      'Gym': 10,
      'Spa': 15,
      'Car Gallery': 15,
      'Home Office': 8,
    },
    tasteScoring: {
      'Contemporary': 15,
      'Modern': 12,
      'Traditional': 10,
      'Mediterranean': 15,
      'Transitional': 10,
      'Minimalist': 5,
    },
    sizeScoring: {
      '6000-8000': -15,
      '8000-12000': -5,
      '12000-15000': 10,
      '15000-18000': 15,
      '18000-25000': 20,
      '25000+': 25,
    },
    locationScoring: {
      'FL': 20, 'NY': 20, 'CA': 15, 'TX': 5,
      'CT': 5, 'NJ': 5, 'CO': 0,
    },
    familyScoring: {
      'single': 5, 'couple': 10, 'youngFamily': 10,
      'establishedFamily': 15, 'emptyNesters': 15, 'multiGen': 20,
    },
    bedroomScoring: {
      '2': -15, '3': -10, '4': 0, '5': 10, '6': 15, '7+': 20,
    },
  },

  generational: {
    id: 'generational',
    name: 'Generational Wealth',
    shortDesc: 'Multi-generational families building legacy estates',
    fullDesc: 'Multi-generational families and legacy wealth holders seeking compound-style estates for extended family use. They prioritize multiple structures, staff accommodations, and timeless design that will serve generations.',
    demographics: {
      ageRange: '55-75',
      netWorth: '$200M+',
      occupation: 'Family Office / Inherited Wealth / Trust Beneficiary',
    },
    icon: 'castle',
    
    spaceScoring: {
      'Guest House': 25,
      'Staff Quarters': 25,
      'Guest Suite': 20,
      'Kids Bunk Room': 15,
      'Pool House': 15,
      'Wine Cellar': 15,
      'Library': 12,
      'Formal Dining': 12,
      'Chef\'s Kitchen': 10,
      'Home Office': 8,
      'Gym': 5,
    },
    tasteScoring: {
      'Traditional': 25,
      'Georgian': 20,
      'Colonial': 18,
      'Mediterranean': 15,
      'Transitional': 10,
      'Contemporary': 0,
      'Modern': -10,
      'Minimalist': -15,
    },
    sizeScoring: {
      '6000-8000': -20,
      '8000-12000': -10,
      '12000-15000': 0,
      '15000-18000': 10,
      '18000-25000': 20,
      '25000+': 25,
    },
    locationScoring: {
      'CT': 20, 'MA': 18, 'FL': 15, 'NY': 10,
      'CA': 10, 'CO': 5, 'TX': 0,
    },
    familyScoring: {
      'single': -15, 'couple': -5, 'youngFamily': 5,
      'establishedFamily': 15, 'emptyNesters': 15, 'multiGen': 25,
    },
    bedroomScoring: {
      '2': -20, '3': -15, '4': -5, '5': 5, '6': 15, '7+': 25,
    },
  },

  sports: {
    id: 'sports',
    name: 'Sports Professional',
    shortDesc: 'Athletes and team owners seeking performance estates',
    fullDesc: 'Professional athletes, team owners, and sports executives who prioritize fitness facilities, recovery amenities, and spaces for team gatherings. They value privacy and often seek properties that can accommodate training needs.',
    demographics: {
      ageRange: '30-55',
      netWorth: '$20M - $300M',
      occupation: 'Professional Athlete / Team Owner / Sports Executive',
    },
    icon: 'trophy',
    
    spaceScoring: {
      'Gym': 30,
      'Spa': 25,
      'Pool': 20,
      'Indoor Sports Court': 30,
      'Pool House': 15,
      'Home Theater': 15,
      'Guest Suite': 12,
      'Great Room': 15,
      'Car Gallery': 15,
      'Staff Quarters': 10,
    },
    tasteScoring: {
      'Modern': 15,
      'Contemporary': 18,
      'Transitional': 10,
      'Traditional': 5,
      'Mediterranean': 10,
      'Minimalist': 5,
    },
    sizeScoring: {
      '6000-8000': -10,
      '8000-12000': 5,
      '12000-15000': 15,
      '15000-18000': 20,
      '18000-25000': 20,
      '25000+': 15,
    },
    locationScoring: {
      'FL': 25, 'TX': 20, 'CA': 15, 'AZ': 15,
      'NY': 5, 'NJ': 5, 'CO': 10,
    },
    familyScoring: {
      'single': 15, 'couple': 15, 'youngFamily': 15,
      'establishedFamily': 10, 'emptyNesters': 5, 'multiGen': 0,
    },
    bedroomScoring: {
      '2': -5, '3': 5, '4': 10, '5': 15, '6': 15, '7+': 10,
    },
  },

  medical: {
    id: 'medical',
    name: 'Medical/Biotech Executive',
    shortDesc: 'Healthcare leaders seeking wellness-focused estates',
    fullDesc: 'Healthcare executives, biotech founders, and prominent medical professionals who value wellness-focused design, clean aesthetics, and sophisticated home office setups. They appreciate quality and evidence-based design choices.',
    demographics: {
      ageRange: '45-65',
      netWorth: '$30M - $150M',
      occupation: 'CEO / CMO / Biotech Founder / Specialist Physician',
    },
    icon: 'heart-pulse',
    
    spaceScoring: {
      'Gym': 20,
      'Spa': 20,
      'Pool': 15,
      'Home Office': 20,
      'Meditation Room': 15,
      'Chef\'s Kitchen': 12,
      'Wine Cellar': 10,
      'Guest Suite': 8,
      'Home Theater': 8,
      'Smart Home Integration': 15,
    },
    tasteScoring: {
      'Modern': 18,
      'Contemporary': 15,
      'Minimalist': 20,
      'Scandinavian': 15,
      'Transitional': 10,
      'Traditional': 0,
      'Mediterranean': 5,
    },
    sizeScoring: {
      '6000-8000': 10,
      '8000-12000': 20,
      '12000-15000': 15,
      '15000-18000': 5,
      '18000-25000': -5,
      '25000+': -15,
    },
    locationScoring: {
      'MA': 25, 'CA': 20, 'NJ': 15, 'NC': 15,
      'MD': 12, 'NY': 10, 'TX': 10, 'CT': 10,
    },
    familyScoring: {
      'single': 10, 'couple': 15, 'youngFamily': 10,
      'establishedFamily': 10, 'emptyNesters': 15, 'multiGen': 0,
    },
    bedroomScoring: {
      '2': 10, '3': 15, '4': 15, '5': 10, '6': 0, '7+': -10,
    },
  },

  developer: {
    id: 'developer',
    name: 'Real Estate Developer',
    shortDesc: 'Industry professionals seeking personal masterpieces',
    fullDesc: 'Successful commercial and residential developers seeking personal residences that showcase design innovation and construction excellence. They understand value engineering and prioritize both livability and future resale.',
    demographics: {
      ageRange: '45-65',
      netWorth: '$50M - $300M',
      occupation: 'Developer / Builder / Real Estate Principal',
    },
    icon: 'building-2',
    
    spaceScoring: {
      'Staff Quarters': 15,
      'Guest Suite': 12,
      'Pool': 15,
      'Pool House': 15,
      'Home Office': 15,
      'Wine Cellar': 15,
      'Chef\'s Kitchen': 12,
      'Home Theater': 12,
      'Gym': 10,
      'Smart Home Integration': 15,
      'Car Gallery': 12,
    },
    tasteScoring: {
      'Modern': 15,
      'Contemporary': 18,
      'Transitional': 15,
      'Traditional': 10,
      'Mediterranean': 10,
      'Minimalist': 10,
    },
    sizeScoring: {
      '6000-8000': -5,
      '8000-12000': 10,
      '12000-15000': 20,
      '15000-18000': 20,
      '18000-25000': 15,
      '25000+': 10,
    },
    locationScoring: {
      'FL': 15, 'CA': 15, 'NY': 15, 'TX': 15,
      'CO': 12, 'AZ': 12, 'NV': 10, 'CT': 10,
    },
    familyScoring: {
      'single': 5, 'couple': 15, 'youngFamily': 10,
      'establishedFamily': 15, 'emptyNesters': 15, 'multiGen': 10,
    },
    bedroomScoring: {
      '2': -5, '3': 5, '4': 15, '5': 15, '6': 10, '7+': 5,
    },
  },

  creative: {
    id: 'creative',
    name: 'Creative Entrepreneur',
    shortDesc: 'Fashion and design leaders seeking unique spaces',
    fullDesc: 'Fashion designers, artists, creative directors, and luxury brand founders who seek architecturally distinctive properties that inspire creativity. They value unique design, studio spaces, and impressive entertaining areas.',
    demographics: {
      ageRange: '35-55',
      netWorth: '$15M - $100M',
      occupation: 'Designer / Artist / Creative Director / Brand Founder',
    },
    icon: 'palette',
    
    spaceScoring: {
      'Studio': 25,
      'Gallery': 20,
      'Pool': 15,
      'Great Room': 15,
      'Chef\'s Kitchen': 15,
      'Wine Cellar': 12,
      'Covered Terrace': 15,
      'Home Office': 10,
      'Guest Suite': 10,
      'Home Theater': 8,
    },
    tasteScoring: {
      'Modern': 20,
      'Contemporary': 18,
      'Minimalist': 15,
      'Industrial': 15,
      'Art Deco': 18,
      'Eclectic': 20,
      'Traditional': -10,
      'Colonial': -15,
    },
    sizeScoring: {
      '6000-8000': 15,
      '8000-12000': 20,
      '12000-15000': 15,
      '15000-18000': 5,
      '18000-25000': -5,
      '25000+': -15,
    },
    locationScoring: {
      'NY': 25, 'CA': 20, 'FL': 15, 'CO': 5,
      'TX': 5, 'CT': 0, 'NJ': 0,
    },
    familyScoring: {
      'single': 20, 'couple': 18, 'youngFamily': 5,
      'establishedFamily': 0, 'emptyNesters': 10, 'multiGen': -10,
    },
    bedroomScoring: {
      '2': 15, '3': 15, '4': 10, '5': 0, '6': -10, '7+': -15,
    },
  },

  familyOffice: {
    id: 'familyOffice',
    name: 'Family Office Principal',
    shortDesc: 'Wealth managers prioritizing security and discretion',
    fullDesc: 'Professional wealth managers and family office principals who prioritize security, privacy, and conservative design choices. They seek properties suitable for multi-generational family gatherings while maintaining discretion.',
    demographics: {
      ageRange: '50-70',
      netWorth: '$100M+',
      occupation: 'Family Office Director / Wealth Manager / Trust Officer',
    },
    icon: 'shield-check',
    
    spaceScoring: {
      'Security Room': 25,
      'Home Office': 20,
      'Library': 18,
      'Staff Quarters': 20,
      'Guest Suite': 15,
      'Wine Cellar': 15,
      'Formal Dining': 12,
      'Pool': 10,
      'Gym': 8,
      'Home Theater': 8,
    },
    tasteScoring: {
      'Traditional': 20,
      'Transitional': 18,
      'Georgian': 15,
      'Colonial': 12,
      'Contemporary': 5,
      'Modern': 0,
      'Minimalist': -5,
      'Industrial': -15,
    },
    sizeScoring: {
      '6000-8000': -10,
      '8000-12000': 0,
      '12000-15000': 10,
      '15000-18000': 20,
      '18000-25000': 20,
      '25000+': 15,
    },
    locationScoring: {
      'CT': 20, 'NY': 15, 'FL': 15, 'CA': 10,
      'MA': 15, 'TX': 10, 'CO': 5,
    },
    familyScoring: {
      'single': -5, 'couple': 10, 'youngFamily': 10,
      'establishedFamily': 15, 'emptyNesters': 15, 'multiGen': 20,
    },
    bedroomScoring: {
      '2': -15, '3': -5, '4': 5, '5': 15, '6': 20, '7+': 15,
    },
  },
};

// =============================================================================
// SCORING ENGINE
// =============================================================================

/**
 * Get size tier from square footage
 */
const getSizeTier = (sqft) => {
  if (!sqft) return null;
  if (sqft < 8000) return '6000-8000';
  if (sqft < 12000) return '8000-12000';
  if (sqft < 15000) return '12000-15000';
  if (sqft < 18000) return '15000-18000';
  if (sqft < 25000) return '18000-25000';
  return '25000+';
};

/**
 * Get bedroom count tier
 */
const getBedroomTier = (count) => {
  if (!count) return null;
  if (count <= 2) return '2';
  if (count <= 3) return '3';
  if (count <= 4) return '4';
  if (count <= 5) return '5';
  if (count <= 6) return '6';
  return '7+';
};

/**
 * Calculate match score for a single persona
 */
export const calculatePersonaScore = (persona, clientData) => {
  let score = 50; // Base score
  const factors = [];
  
  const {
    spaces = [],
    tasteStyle = null,
    totalSqFt = null,
    state = null,
    familyType = null,
    bedroomCount = null,
  } = clientData;

  // 1. Space Selection Scoring
  spaces.forEach(space => {
    const spaceName = typeof space === 'string' ? space : space.name;
    const impact = persona.spaceScoring[spaceName];
    if (impact) {
      score += impact;
      factors.push({
        category: 'Space',
        factor: spaceName,
        impact,
        description: impact > 0 
          ? `${spaceName} aligns with this buyer profile`
          : `${spaceName} is less common for this buyer profile`,
      });
    }
  });

  // 2. Taste/Style Scoring
  if (tasteStyle && persona.tasteScoring[tasteStyle]) {
    const impact = persona.tasteScoring[tasteStyle];
    score += impact;
    factors.push({
      category: 'Design Style',
      factor: tasteStyle,
      impact,
      description: impact > 0
        ? `${tasteStyle} design resonates with this buyer`
        : `${tasteStyle} design is not typical for this buyer`,
    });
  }

  // 3. Size Tier Scoring
  const sizeTier = getSizeTier(totalSqFt);
  if (sizeTier && persona.sizeScoring[sizeTier]) {
    const impact = persona.sizeScoring[sizeTier];
    score += impact;
    factors.push({
      category: 'Size',
      factor: `${totalSqFt?.toLocaleString()} SF`,
      impact,
      description: impact > 0
        ? `Size matches typical ${persona.name} preferences`
        : `Size is ${impact < -10 ? 'significantly ' : ''}outside typical range`,
    });
  }

  // 4. Location Scoring
  if (state && persona.locationScoring[state]) {
    const impact = persona.locationScoring[state];
    score += impact;
    factors.push({
      category: 'Location',
      factor: state,
      impact,
      description: impact > 0
        ? `${state} is a preferred market for this buyer`
        : `${state} is not a primary market for this buyer`,
    });
  }

  // 5. Family Composition Scoring
  if (familyType && persona.familyScoring[familyType]) {
    const impact = persona.familyScoring[familyType];
    score += impact;
    factors.push({
      category: 'Family',
      factor: familyType,
      impact,
      description: impact > 0
        ? `Family profile matches typical ${persona.name}`
        : `Family profile differs from typical ${persona.name}`,
    });
  }

  // 6. Bedroom Count Scoring
  const bedroomTier = getBedroomTier(bedroomCount);
  if (bedroomTier && persona.bedroomScoring[bedroomTier]) {
    const impact = persona.bedroomScoring[bedroomTier];
    score += impact;
    factors.push({
      category: 'Bedrooms',
      factor: `${bedroomCount} bedrooms`,
      impact,
      description: impact > 0
        ? `Bedroom count aligns with typical needs`
        : `Bedroom count differs from typical requirements`,
    });
  }

  // Clamp score to 5-95 range
  const finalScore = Math.min(95, Math.max(5, score));
  
  // Determine match level
  let matchLevel;
  if (finalScore >= 75) matchLevel = 'Strong';
  else if (finalScore >= 55) matchLevel = 'Moderate';
  else matchLevel = 'Weak';

  // Calculate confidence based on data completeness
  const maxFactors = 6; // Max scoring categories
  const confidence = factors.length >= 5 ? 'High' 
    : factors.length >= 3 ? 'Medium' 
    : 'Low';

  return {
    personaId: persona.id,
    score: finalScore,
    matchLevel,
    confidence,
    positiveFactors: factors.filter(f => f.impact > 0).sort((a, b) => b.impact - a.impact),
    negativeFactors: factors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact),
    allFactors: factors,
  };
};

/**
 * Calculate scores for all personas and return sorted results
 */
export const calculateAllPersonaScores = (clientData) => {
  const results = Object.values(PERSONAS).map(persona => ({
    ...persona,
    scoring: calculatePersonaScore(persona, clientData),
  }));

  // Sort by score descending
  return results.sort((a, b) => b.scoring.score - a.scoring.score);
};

/**
 * Extract client data from KYC, FYI, MVP modules
 */
export const extractClientData = (kycData, fyiData, mvpData, kymLocation) => {
  const data = {
    spaces: [],
    tasteStyle: null,
    totalSqFt: null,
    state: null,
    familyType: null,
    bedroomCount: 0,
  };

  // From FYI: Selected spaces
  if (fyiData?.selectedSpaces) {
    data.spaces = fyiData.selectedSpaces.map(s => s.name || s);
  }

  // From KYC: Taste/Design style
  if (kycData?.principal?.designIdentity?.primaryStyle) {
    data.tasteStyle = kycData.principal.designIdentity.primaryStyle;
  }

  // From MVP: Total square footage
  if (mvpData?.totalSquareFootage) {
    data.totalSqFt = mvpData.totalSquareFootage;
  } else if (mvpData?.selectedTier?.maxSF) {
    data.totalSqFt = mvpData.selectedTier.maxSF;
  }

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

  // From FYI: Bedroom count
  if (fyiData?.selectedSpaces) {
    const bedrooms = fyiData.selectedSpaces.filter(s => 
      s.name?.includes('Primary') || 
      s.name?.includes('Guest Suite') || 
      s.name?.includes('Jr Primary') ||
      s.name?.includes('Kids')
    );
    data.bedroomCount = bedrooms.length || 4; // Default to 4 if not specified
  }

  return data;
};

export default {
  PERSONAS,
  calculatePersonaScore,
  calculateAllPersonaScores,
  extractClientData,
};
