/**
 * KYSScoringEngine.js - Site-Vision Compatibility Assessment Logic
 * 
 * Implements the 7-category assessment framework with:
 * - 32 sub-factors across categories
 * - Weighted scoring
 * - Deal-breaker detection
 * - Traffic light calculations
 * 
 * Based on Arvin's "You make your money on the buy" methodology
 */

// =============================================================================
// ASSESSMENT CATEGORIES
// =============================================================================

export const CATEGORIES = {
  physicalCapacity: {
    id: 'physicalCapacity',
    name: 'Physical Site Capacity',
    weight: 0.15,
    description: 'Evaluates whether the lot can physically accommodate the vision',
    factors: [
      { id: '1.1', name: 'Lot dimensions & geometry', description: 'Width-to-depth ratio and overall shape', guide: '5=Ideal proportions, 3=Workable with design adjustments, 1=Severely constrained' },
      { id: '1.2', name: 'Buildable area vs total', description: 'Percentage of lot that can be built upon', guide: '5=≥80% buildable, 3=60-79% buildable, 1=<50% buildable' },
      { id: '1.3', name: 'Topography and grade', description: 'Slope, drainage, and level changes', guide: '5=Level/gently sloped, 3=Moderate grade requiring engineering, 1=Severe grade issues' },
      { id: '1.4', name: 'Orientation flexibility', description: 'Options for building placement and orientation', guide: '5=Multiple optimal orientations, 3=One good orientation, 1=Single forced orientation' },
      { id: '1.5', name: 'Geotechnical conditions', description: 'Soil stability, rock, water table issues', guide: '5=Standard foundation, 3=Some engineering required, 1=Major engineering required' },
    ],
  },
  viewsAspect: {
    id: 'viewsAspect',
    name: 'Views & Aspect',
    weight: 0.18,
    description: 'Assesses view quality and distribution potential',
    factors: [
      { id: '2.1', name: 'Primary view quality & permanence', description: 'Quality and protection of main views', guide: '5=Premium protected views, 3=Good views with some risk, 1=No significant views' },
      { id: '2.2', name: 'View breadth', description: 'Percentage of principal rooms that can have views', guide: '5=≥80% of rooms, 3=50-79% of rooms, 1=<30% of rooms (The Palazzo Problem)' },
      { id: '2.3', name: 'Solar orientation', description: 'Sun exposure for key living spaces', guide: '5=Optimal for lifestyle, 3=Acceptable with design, 1=Poor orientation' },
      { id: '2.4', name: 'Exposure to elements', description: 'Wind, weather, and climate factors', guide: '5=Naturally protected, 3=Manageable exposure, 1=Severe exposure concerns' },
    ],
  },
  privacyBoundaries: {
    id: 'privacyBoundaries',
    name: 'Privacy & Boundaries',
    weight: 0.15,
    description: 'Evaluates privacy potential and boundary conditions',
    factors: [
      { id: '3.1', name: 'Setbacks from boundaries', description: 'Distance from property lines', guide: '5=Generous setbacks (>50ft), 3=Standard setbacks, 1=Minimal setbacks (<15ft)' },
      { id: '3.2', name: 'Visual screening potential', description: 'Natural or achievable privacy screening', guide: '5=Natural screening exists, 3=Can be created, 1=Fully exposed, difficult to screen' },
      { id: '3.3', name: 'Acoustic separation', description: 'Sound isolation from neighbors/roads', guide: '5=Quiet/isolated, 3=Some noise, manageable, 1=Significant noise concerns' },
      { id: '3.4', name: 'Elevation relative to neighbors', description: 'Height relationship to surrounding properties', guide: '5=Commanding position, 3=Level with neighbors, 1=Overlooked by neighbors' },
      { id: '3.5', name: 'Entry sequence potential', description: 'Ability to create a private arrival experience', guide: '5=Long private drive possible, 3=Modest entry sequence, 1=Street-facing entry only' },
    ],
  },
  adjacenciesContext: {
    id: 'adjacenciesContext',
    name: 'Adjacencies & Context',
    weight: 0.15,
    description: 'Evaluates neighborhood context and surrounding properties',
    factors: [
      { id: '4.1', name: 'Neighboring property values', description: 'Value alignment with target investment', guide: '5=Comparable values ($50M+), 3=Within 30% of target, 1=Value mismatch >50%' },
      { id: '4.2', name: 'Stylistic harmony', description: 'Architectural compatibility with surroundings', guide: '5=Compatible context, 3=Acceptable contrast, 1=Severe stylistic clash' },
      { id: '4.3', name: 'Commercial/institutional proximity', description: 'Distance from non-residential uses', guide: '5=None visible/adjacent, 3=Some commercial nearby, 1=Adjacent commercial/hotel' },
      { id: '4.4', name: 'Road noise & traffic', description: 'Traffic volume and noise exposure', guide: '5=Private/quiet road, 3=Moderate traffic, 1=Major thoroughfare' },
      { id: '4.5', name: 'Future development risk', description: 'Risk of unwanted development nearby', guide: '5=Protected/unlikely, 3=Some risk, 1=High development risk' },
    ],
  },
  marketAlignment: {
    id: 'marketAlignment',
    name: 'Market & Demographic Alignment',
    weight: 0.15,
    description: 'Assesses market fit for the intended product',
    factors: [
      { id: '5.1', name: 'Style resonance with buyers', description: 'Market demand for intended style', guide: '5=Strong demand, 3=Moderate demand, 1=No market for this style' },
      { id: '5.2', name: 'Price positioning', description: 'Target price vs comparable sales', guide: '5=In-line with market, 3=10-25% premium, 1=>50% above comps' },
      { id: '5.3', name: 'Absorption history', description: 'Sales velocity for similar product', guide: '5=Quick sales (<6 mo), 3=Normal (6-18 mo), 1=No comparable sales/4+ years' },
      { id: '5.4', name: 'Buyer demographic match', description: 'Alignment with likely buyer profile', guide: '5=Perfect match, 3=Reasonable alignment, 1=Misaligned demographics' },
    ],
  },
  visionCompatibility: {
    id: 'visionCompatibility',
    name: 'Vision Compatibility',
    weight: 0.12,
    description: 'Evaluates alignment between client vision and site constraints',
    factors: [
      { id: '6.1', name: 'Vision manifestation potential', description: 'Can the vision physically be built here?', guide: '5=Fully achievable, 3=Achievable with modifications, 1=Impossible on this site' },
      { id: '6.2', name: 'Required compromises', description: 'Severity of needed vision adjustments', guide: '5=Minor/none, 3=Moderate compromises, 1=Vision-breaking compromises' },
      { id: '6.3', name: 'Client flexibility index', description: 'Client willingness to adapt (from KYC)', guide: '5=Highly adaptable, 3=Somewhat flexible, 1=Fixed vision (will not change)' },
    ],
  },
  regulatoryPractical: {
    id: 'regulatoryPractical',
    name: 'Regulatory & Practical',
    weight: 0.10,
    description: 'Assesses regulatory constraints and practical considerations',
    factors: [
      { id: '7.1', name: 'Zoning & FAR constraints', description: 'Building rights and density limits', guide: '5=Favorable for vision, 3=Workable with variance, 1=Prohibitive' },
      { id: '7.2', name: 'Height & envelope restrictions', description: 'Building height and massing limits', guide: '5=Accommodates vision, 3=Minor adjustments needed, 1=Blocks key elements' },
      { id: '7.3', name: 'Historic/design review', description: 'Review board requirements', guide: '5=None/favorable, 3=Manageable review, 1=Restrictive review likely to block' },
      { id: '7.4', name: 'Permitting complexity', description: 'Expected approval timeline', guide: '5=Standard process (<12 mo), 3=Extended (12-24 mo), 1=>24 month risk' },
      { id: '7.5', name: 'HOA/community covenants', description: 'Private restrictions on design', guide: '5=None/favorable, 3=Minor restrictions, 1=Prohibits vision' },
    ],
  },
};

// =============================================================================
// DEAL-BREAKERS
// =============================================================================

export const DEAL_BREAKERS = [
  {
    id: 'DB1',
    name: 'Lot geometry incompatible with vision massing',
    category: 'physicalCapacity',
    triggerCondition: (scores) => scores['1.1']?.score <= 1,
    description: 'The lot shape fundamentally cannot accommodate the intended building form',
  },
  {
    id: 'DB2',
    name: 'Primary views cannot be achieved for principal rooms',
    category: 'viewsAspect',
    triggerCondition: (scores) => scores['2.2']?.score <= 1,
    description: 'Less than 30% of principal rooms can have views (The Palazzo Problem)',
  },
  {
    id: 'DB3',
    name: 'Adjacent commercial/institutional creates context mismatch',
    category: 'adjacenciesContext',
    triggerCondition: (scores) => scores['4.3']?.score <= 1,
    description: 'Commercial or institutional adjacency incompatible with luxury residential',
  },
  {
    id: 'DB4',
    name: 'Neighboring values create price ceiling below target',
    category: 'adjacenciesContext',
    triggerCondition: (scores) => scores['4.1']?.score <= 1.5,
    description: 'Surrounding property values cannot support target finished value',
  },
  {
    id: 'DB5',
    name: 'Style vision has no absorption history in market',
    category: 'marketAlignment',
    triggerCondition: (scores) => scores['5.3']?.score <= 1,
    description: 'No comparable product has sold in this micro-market in recent years',
  },
  {
    id: 'DB6',
    name: 'Fixed vision client with site requiring major compromises',
    category: 'visionCompatibility',
    triggerCondition: (scores) => scores['6.3']?.score <= 2 && scores['6.2']?.score <= 2,
    description: 'Client will not adapt, but site requires vision-breaking changes',
  },
  {
    id: 'DB7',
    name: 'Zoning prohibits intended use or scale',
    category: 'regulatoryPractical',
    triggerCondition: (scores) => scores['7.1']?.score <= 1,
    description: 'Zoning fundamentally prevents the intended development',
  },
  {
    id: 'DB8',
    name: 'Historic/design review would block key design elements',
    category: 'regulatoryPractical',
    triggerCondition: (scores) => scores['7.3']?.score <= 1,
    description: 'Review board likely to reject core vision elements',
  },
  {
    id: 'DB9',
    name: 'Geotechnical conditions make construction infeasible',
    category: 'physicalCapacity',
    triggerCondition: (scores) => scores['1.5']?.score <= 1,
    description: 'Soil or geological conditions prevent practical construction',
  },
  {
    id: 'DB10',
    name: 'HOA covenants prohibit intended style or features',
    category: 'regulatoryPractical',
    triggerCondition: (scores) => scores['7.5']?.score <= 1,
    description: 'Community restrictions fundamentally block the vision',
  },
];

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate average score for a category
 */
export const calculateCategoryScore = (categoryId, scores) => {
  const category = CATEGORIES[categoryId];
  if (!category) return null;

  const factorScores = category.factors
    .map(f => scores[f.id]?.score)
    .filter(s => s !== null && s !== undefined);

  if (factorScores.length === 0) return null;

  return factorScores.reduce((sum, s) => sum + s, 0) / factorScores.length;
};

/**
 * Get traffic light for a score
 */
export const getTrafficLight = (score) => {
  if (score === null || score === undefined) return null;
  if (score >= 4.0) return 'green';
  if (score >= 2.5) return 'amber';
  return 'red';
};

/**
 * Get traffic light color hex
 */
export const getTrafficLightColor = (light) => {
  switch (light) {
    case 'green': return '#2e7d32';
    case 'amber': return '#f57c00';
    case 'red': return '#d32f2f';
    default: return '#6b6b6b';
  }
};

/**
 * Check which deal-breakers are triggered
 */
export const checkDealBreakers = (scores) => {
  return DEAL_BREAKERS.map(db => ({
    ...db,
    triggered: db.triggerCondition(scores),
  }));
};

/**
 * Calculate overall site assessment
 */
export const calculateOverallAssessment = (scores) => {
  // Calculate category scores
  const categoryScores = {};
  Object.keys(CATEGORIES).forEach(catId => {
    categoryScores[catId] = calculateCategoryScore(catId, scores);
  });

  // Calculate weighted overall score
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(CATEGORIES).forEach(([catId, cat]) => {
    const score = categoryScores[catId];
    if (score !== null) {
      weightedSum += score * cat.weight;
      totalWeight += cat.weight;
    }
  });

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : null;

  // Check deal-breakers
  const dealBreakers = checkDealBreakers(scores);
  const triggeredDealBreakers = dealBreakers.filter(db => db.triggered);

  // Count category traffic lights
  const categoryLights = Object.values(categoryScores).map(s => getTrafficLight(s)).filter(Boolean);
  const redCount = categoryLights.filter(l => l === 'red').length;
  const amberCount = categoryLights.filter(l => l === 'amber').length;

  // Determine overall traffic light with overrides
  let trafficLight = getTrafficLight(overallScore);

  // Override rules
  if (triggeredDealBreakers.length > 0) {
    trafficLight = 'red';
  } else if (redCount >= 2) {
    trafficLight = 'red';
  } else if (amberCount >= 3 && trafficLight === 'green') {
    trafficLight = 'amber';
  }

  // Generate recommendation
  let recommendation = '';
  if (trafficLight === 'green') {
    recommendation = 'Proceed with acquisition. Site can accommodate the validated program.';
  } else if (trafficLight === 'amber') {
    recommendation = 'Proceed only with documented mitigation strategy addressing identified concerns.';
  } else {
    if (triggeredDealBreakers.length > 0) {
      recommendation = `Do not acquire this site for this program. ${triggeredDealBreakers.length} deal-breaker(s) identified: ${triggeredDealBreakers.map(db => db.name).join('; ')}.`;
    } else {
      recommendation = 'Do not acquire this site for this program. Fundamental misalignment across multiple categories.';
    }
  }

  return {
    categoryScores,
    overallScore: overallScore ? Math.round(overallScore * 10) / 10 : null,
    trafficLight,
    recommendation,
    dealBreakers,
    triggeredDealBreakers,
    categoryLights: Object.fromEntries(
      Object.entries(categoryScores).map(([k, v]) => [k, getTrafficLight(v)])
    ),
    completionPct: calculateCompletionPercentage(scores),
  };
};

/**
 * Calculate assessment completion percentage
 */
export const calculateCompletionPercentage = (scores) => {
  const allFactors = Object.values(CATEGORIES).flatMap(c => c.factors);
  const scoredCount = allFactors.filter(f => scores[f.id]?.score !== null && scores[f.id]?.score !== undefined).length;
  return Math.round((scoredCount / allFactors.length) * 100);
};

/**
 * Get all factors as flat array
 */
export const getAllFactors = () => {
  return Object.values(CATEGORIES).flatMap(c => 
    c.factors.map(f => ({ ...f, categoryId: c.id, categoryName: c.name }))
  );
};

/**
 * Create empty scores object
 */
export const createEmptyScores = () => {
  const scores = {};
  getAllFactors().forEach(f => {
    scores[f.id] = { score: null, notes: '' };
  });
  return scores;
};

/**
 * Create empty site assessment
 */
export const createEmptySiteAssessment = () => ({
  id: `site_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  basicInfo: {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    askingPrice: null,
    lotSizeSF: null,
    lotSizeAcres: null,
    lotWidth: null,
    lotDepth: null,
    zoning: '',
    mlsNumber: '',
    notes: '',
  },
  
  scores: createEmptyScores(),
  
  handoffNotes: {
    siteConstraints: '',
    insightsForKYM: '',
    waivedDealBreakers: [],
  },
});

// =============================================================================
// COMPARISON FUNCTIONS
// =============================================================================

/**
 * Compare multiple sites and rank them
 */
export const compareSites = (sites) => {
  if (!sites || sites.length === 0) return [];

  const assessments = sites.map(site => ({
    site,
    assessment: calculateOverallAssessment(site.scores),
  }));

  // Sort by overall score (highest first), then by deal-breaker count (lowest first)
  return assessments.sort((a, b) => {
    // Sites without deal-breakers rank higher
    const aDB = a.assessment.triggeredDealBreakers.length;
    const bDB = b.assessment.triggeredDealBreakers.length;
    if (aDB !== bDB) return aDB - bDB;

    // Then by overall score
    const aScore = a.assessment.overallScore || 0;
    const bScore = b.assessment.overallScore || 0;
    return bScore - aScore;
  });
};

/**
 * Get best site for each category
 */
export const getBestPerCategory = (sites) => {
  const best = {};

  Object.keys(CATEGORIES).forEach(catId => {
    let bestSite = null;
    let bestScore = -1;

    sites.forEach(site => {
      const score = calculateCategoryScore(catId, site.scores);
      if (score !== null && score > bestScore) {
        bestScore = score;
        bestSite = site;
      }
    });

    best[catId] = bestSite ? { site: bestSite, score: bestScore } : null;
  });

  return best;
};
