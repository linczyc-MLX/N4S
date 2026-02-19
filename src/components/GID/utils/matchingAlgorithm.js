/**
 * matchingAlgorithm.js — GID Matching Engine
 *
 * Dual scoring system mirroring KYM/BAM v3.0.
 * Total 110 raw points normalized to 100.
 *
 * Dimensions:
 *  1. Geographic Relevance    (20 pts)
 *  2. Budget Alignment        (25 pts)
 *  3. Style Compatibility     (20 pts)
 *  4. Experience Tier         (15 pts)
 *  5. Quality Signal          (20 pts)
 *  6. Feature Specialization  (10 pts)
 *
 * Two Output Scores:
 *  - Client Fit Score: Weighted toward Style (×1.5), lifestyle, cultural alignment
 *  - Project Fit Score: Weighted toward Budget (×1.5), Geography (×1.2), Features, Scale
 *
 * Match Tiers:
 *  80–100  Top Match   — Present to client
 *  60–79   Good Fit    — Strong candidate, minor gaps
 *  40–59   Consider    — Worth discussion
 *  <40     Below       — Filtered out unless overridden
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const MATCH_TIERS = {
  TOP_MATCH:  { min: 80, label: 'Top Match',  color: '#c9a227', bgColor: '#fdf8e8' },
  GOOD_FIT:   { min: 60, label: 'Good Fit',   color: '#1e3a5f', bgColor: '#eef2f7' },
  CONSIDER:   { min: 40, label: 'Consider',    color: '#6b6b6b', bgColor: '#f5f5f5' },
  BELOW:      { min: 0,  label: 'Below Threshold', color: '#d32f2f', bgColor: '#fef0f0' },
};

export const SCORING_DIMENSIONS = {
  geographic:  { label: 'Geographic Relevance',   maxRaw: 20, icon: 'MapPin' },
  budget:      { label: 'Budget Alignment',        maxRaw: 25, icon: 'DollarSign' },
  style:       { label: 'Style Compatibility',     maxRaw: 20, icon: 'Palette' },
  experience:  { label: 'Experience Tier',         maxRaw: 15, icon: 'Award' },
  quality:     { label: 'Quality Signal',          maxRaw: 20, icon: 'Star' },
  features:    { label: 'Feature Specialization',  maxRaw: 10, icon: 'Layers' },
};

const TOTAL_RAW = 110; // Sum of all maxRaw

// Client Fit weights emphasize style/lifestyle
const CLIENT_FIT_WEIGHTS = {
  geographic:  1.0,
  budget:      1.0,
  style:       1.5,
  experience:  1.0,
  quality:     1.2,
  features:    1.0,
};

// Project Fit weights emphasize budget/geography/features
const PROJECT_FIT_WEIGHTS = {
  geographic:  1.2,
  budget:      1.5,
  style:       0.8,
  experience:  1.0,
  quality:     1.0,
  features:    1.2,
};

// US State adjacency groups for geographic scoring
const STATE_REGIONS = {
  northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  midatlantic: ['DE', 'MD', 'DC', 'VA', 'WV'],
  southeast: ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN'],
  midwest: ['IL', 'IN', 'IA', 'MI', 'MN', 'MO', 'OH', 'WI'],
  southwest: ['AZ', 'NM', 'OK', 'TX'],
  west: ['CA', 'CO', 'NV', 'OR', 'UT', 'WA'],
  mountain: ['ID', 'MT', 'WY'],
};

// Taste axis → specialty tag mapping (exported for Discovery Phase 4)
export const TASTE_STYLE_MAP = {
  axisContemporaryTraditional: {
    low:  ['Contemporary', 'Modern', 'Minimalist'],
    mid:  ['Transitional'],
    high: ['Traditional', 'Colonial', 'Georgian', 'Victorian'],
  },
  axisMinimalLayered: {
    low:  ['Minimalist', 'Scandinavian', 'Japanese'],
    mid:  ['Transitional', 'Coastal'],
    high: ['Maximalist', 'Eclectic', 'Bohemian', 'Art Deco'],
  },
  axisWarmCool: {
    low:  ['Industrial', 'Contemporary', 'Scandinavian'],
    mid:  ['Transitional', 'Modern'],
    high: ['Mediterranean', 'Tuscan', 'Rustic', 'Craftsman'],
  },
  axisOrganicGeometric: {
    low:  ['Organic', 'Rustic', 'Natural', 'Wabi-Sabi'],
    mid:  ['Transitional'],
    high: ['Art Deco', 'Geometric', 'Modern', 'Bauhaus'],
  },
  axisRefinedEclectic: {
    low:  ['Classic', 'Traditional', 'French Provincial'],
    mid:  ['Transitional'],
    high: ['Eclectic', 'Bohemian', 'Global', 'Maximalist'],
  },
  axisArchMinimalOrnate: {
    low:  ['Modern', 'Minimalist', 'Contemporary'],
    mid:  ['Transitional'],
    high: ['Art Deco', 'Craftsman', 'Victorian', 'Neoclassical'],
  },
  axisArchRegionalInternational: {
    low:  ['Coastal', 'Mountain', 'Ranch', 'Desert', 'Prairie'],
    mid:  ['Transitional', 'Farmhouse'],
    high: ['International', 'Contemporary', 'Modern', 'Bauhaus'],
  },
};


// =============================================================================
// PREREQUISITE GATES
// =============================================================================

/**
 * Check which KYC/FYI fields are required for matching and their fill status.
 * Returns { ready: bool, gates: [{ field, label, filled, required }] }
 */
export function checkMatchPrerequisites(kycData, fyiData) {
  const principal = kycData?.principal || {};
  const projectParams = principal?.projectParameters || {};
  const budgetFw = principal?.budgetFramework || {};
  const designId = principal?.designIdentity || {};

  const gates = [
    {
      field: 'projectCity',
      label: 'Project City',
      source: 'KYC',
      filled: !!projectParams.projectCity,
      required: true,
    },
    {
      field: 'totalProjectBudget',
      label: 'Total Project Budget',
      source: 'KYC',
      filled: budgetFw.totalProjectBudget > 0,
      required: true,
    },
    {
      field: 'tasteAxes',
      label: 'Design Identity (Taste Axes)',
      source: 'KYC',
      filled: !!(designId.axisContemporaryTraditional || designId.axisMinimalLayered),
      required: false,
    },
    {
      field: 'styleTags',
      label: 'Architecture / Interior Style Tags',
      source: 'KYC',
      filled: (designId.architectureStyleTags?.length > 0 || designId.interiorStyleTags?.length > 0),
      required: false,
    },
    {
      field: 'fyiSelections',
      label: 'Space Selections (FYI)',
      source: 'FYI',
      filled: fyiData?.selections && Object.keys(fyiData.selections).some(
        k => fyiData.selections[k]?.included
      ),
      required: false,
    },
    {
      field: 'targetSF',
      label: 'Target Square Footage',
      source: 'FYI',
      filled: !!(fyiData?.settings?.targetSF > 0),
      required: false,
    },
  ];

  const requiredMet = gates.filter(g => g.required).every(g => g.filled);
  const totalFilled = gates.filter(g => g.filled).length;

  return {
    ready: requiredMet,
    gates,
    completeness: Math.round((totalFilled / gates.length) * 100),
  };
}


// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Geographic Relevance (max 20)
 */
function scoreGeographic(consultant, projectCity, projectState) {
  if (!projectCity && !projectState) return 0;

  const serviceAreas = (consultant.service_areas || []).map(a => a.toUpperCase().trim());
  const hqState = (consultant.hq_state || '').toUpperCase().trim();
  const pState = (projectState || '').toUpperCase().trim();
  const pCity = (projectCity || '').toUpperCase().trim();

  // Exact state match in service areas
  if (serviceAreas.includes(pState)) return 20;

  // HQ in same state
  if (hqState === pState) return 20;

  // Check city name match in service areas
  if (serviceAreas.some(a => a.includes(pCity) || pCity.includes(a))) return 18;

  // Same region (within ~500mi proxy)
  const projectRegion = Object.entries(STATE_REGIONS).find(
    ([, states]) => states.includes(pState)
  );
  if (projectRegion) {
    const regionStates = projectRegion[1];
    if (regionStates.includes(hqState) || serviceAreas.some(a => regionStates.includes(a))) {
      return 12;
    }
  }

  // Partner exception (verified partners get baseline geographic credit)
  if (consultant.verification_status === 'partner') return 8;

  // Nationwide firms / large service area
  if (serviceAreas.includes('NATIONAL') || serviceAreas.includes('NATIONWIDE') || serviceAreas.length >= 5) {
    return 6;
  }

  return 0;
}

/**
 * Budget Alignment (max 25)
 */
function scoreBudget(consultant, totalBudget) {
  if (!totalBudget || totalBudget <= 0) return 0;

  const minB = Number(consultant.min_budget) || 0;
  const maxB = Number(consultant.max_budget) || Infinity;

  // Perfect range: project budget falls within consultant's range
  if (totalBudget >= minB && totalBudget <= maxB) return 25;

  // How far outside the range?
  let deviation;
  if (totalBudget < minB) {
    deviation = (minB - totalBudget) / totalBudget;
  } else {
    deviation = (totalBudget - maxB) / totalBudget;
  }

  if (deviation <= 0.10) return 22;  // Within ±10%
  if (deviation <= 0.25) return 18;  // Within ±25%
  if (deviation <= 0.50) return 12;  // Within ±50%
  if (deviation <= 0.75) return 6;

  return 0;
}

/**
 * Style Compatibility (max 20)
 */
function scoreStyle(consultant, designIdentity) {
  if (!designIdentity) return 0;

  const specialties = (consultant.specialties || []).map(s => s.toLowerCase().trim());
  if (specialties.length === 0) return 0;

  let matchedTags = new Set();
  let totalTags = new Set();

  // Map taste axes to expected specialties
  Object.entries(TASTE_STYLE_MAP).forEach(([axisKey, mapping]) => {
    const value = designIdentity[axisKey];
    if (value == null) return;

    let expectedStyles;
    if (value <= 3) expectedStyles = mapping.low;
    else if (value >= 7) expectedStyles = mapping.high;
    else expectedStyles = mapping.mid;

    expectedStyles.forEach(s => {
      totalTags.add(s.toLowerCase());
      if (specialties.includes(s.toLowerCase())) {
        matchedTags.add(s.toLowerCase());
      }
    });
  });

  // Direct match from style tags
  const archTags = (designIdentity.architectureStyleTags || []).map(t => t.toLowerCase());
  const intTags = (designIdentity.interiorStyleTags || []).map(t => t.toLowerCase());
  [...archTags, ...intTags].forEach(tag => {
    totalTags.add(tag);
    if (specialties.includes(tag)) {
      matchedTags.add(tag);
    }
  });

  if (totalTags.size === 0) return 5; // Baseline if no taste data

  const overlap = matchedTags.size / totalTags.size;
  return Math.round(overlap * 20);
}

/**
 * Experience Tier (max 15)
 */
function scoreExperience(consultant) {
  const yrs = Number(consultant.years_experience) || 0;
  if (yrs >= 20) return 15;
  if (yrs >= 12) return 12;
  if (yrs >= 8)  return 8;
  if (yrs >= 5)  return 4;
  return 2;
}

/**
 * Quality Signal (max 20)
 */
function scoreQuality(consultant) {
  const rating = Number(consultant.avg_rating) || 0;
  if (rating <= 0) return 10; // Unrated gets baseline
  return Math.min(20, Math.round(rating * 4));
}

/**
 * Feature Specialization (max 10)
 * Compare FYI space features against consultant portfolio features
 */
function scoreFeatures(consultant, fyiSelections) {
  if (!fyiSelections || !consultant.portfolio || consultant.portfolio.length === 0) return 0;

  // Collect all features from FYI included spaces
  const projectFeatures = new Set();
  Object.values(fyiSelections).forEach(space => {
    if (space?.included && space?.features) {
      (Array.isArray(space.features) ? space.features : []).forEach(f => {
        projectFeatures.add(f.toLowerCase().trim());
      });
    }
  });

  if (projectFeatures.size === 0) return 5; // Baseline when no feature data

  // Collect all features from consultant's portfolio
  const consultantFeatures = new Set();
  (consultant.portfolio || []).forEach(proj => {
    (proj.features || []).forEach(f => {
      consultantFeatures.add(f.toLowerCase().trim());
    });
  });

  if (consultantFeatures.size === 0) return 3;

  // Count overlaps
  let overlaps = 0;
  projectFeatures.forEach(f => {
    if (consultantFeatures.has(f)) overlaps++;
  });

  const ratio = overlaps / projectFeatures.size;
  return Math.round(ratio * 10);
}


// =============================================================================
// MAIN MATCHING FUNCTION
// =============================================================================

/**
 * Score a single consultant against project data.
 *
 * @param {Object} consultant - Consultant record (with portfolio array if fetched)
 * @param {Object} kycData    - kycData from AppContext
 * @param {Object} fyiData    - fyiData from AppContext
 * @returns {Object} Match result with scores and breakdown
 */
export function scoreConsultant(consultant, kycData, fyiData) {
  const principal = kycData?.principal || {};
  const projectParams = principal?.projectParameters || {};
  const budgetFw = principal?.budgetFramework || {};
  const designId = principal?.designIdentity || {};

  // Extract project state from city (simple heuristic: look for ", XX" pattern)
  const projectCity = projectParams.projectCity || '';
  const projectState = extractState(projectCity, projectParams.projectCountry);

  // Raw dimension scores
  const rawScores = {
    geographic:  scoreGeographic(consultant, projectCity, projectState),
    budget:      scoreBudget(consultant, Number(budgetFw.totalProjectBudget) || 0),
    style:       scoreStyle(consultant, designId),
    experience:  scoreExperience(consultant),
    quality:     scoreQuality(consultant),
    features:    scoreFeatures(consultant, fyiData?.selections),
  };

  // Normalize each dimension to 0-100 scale
  const normalizedScores = {};
  Object.entries(rawScores).forEach(([dim, raw]) => {
    normalizedScores[dim] = Math.round((raw / SCORING_DIMENSIONS[dim].maxRaw) * 100);
  });

  // Compute weighted scores
  const clientFitRaw = computeWeightedScore(rawScores, CLIENT_FIT_WEIGHTS);
  const projectFitRaw = computeWeightedScore(rawScores, PROJECT_FIT_WEIGHTS);

  // Normalize to 0-100
  const clientFitMax = computeWeightedMax(CLIENT_FIT_WEIGHTS);
  const projectFitMax = computeWeightedMax(PROJECT_FIT_WEIGHTS);

  const clientFitScore = Math.round((clientFitRaw / clientFitMax) * 100);
  const projectFitScore = Math.round((projectFitRaw / projectFitMax) * 100);

  // Combined score (average of both)
  const combinedScore = Math.round((clientFitScore + projectFitScore) / 2);

  // Determine tier
  const tier = getTier(combinedScore);

  return {
    consultantId: consultant.id,
    consultantName: consultant.firm_name,
    discipline: consultant.role,
    // Snapshot of consultant display data — persists across discipline switches
    consultantSnapshot: {
      id: consultant.id,
      firm_name: consultant.firm_name,
      first_name: consultant.first_name,
      last_name: consultant.last_name,
      role: consultant.role,
      hq_city: consultant.hq_city,
      hq_state: consultant.hq_state,
      years_experience: consultant.years_experience,
      avg_rating: consultant.avg_rating,
      specialties: consultant.specialties || [],
    },
    clientFitScore,
    projectFitScore,
    combinedScore,
    tier: tier.label,
    tierColor: tier.color,
    tierBgColor: tier.bgColor,
    rawScores,
    normalizedScores,
    breakdown: Object.entries(SCORING_DIMENSIONS).map(([key, dim]) => ({
      dimension: key,
      label: dim.label,
      icon: dim.icon,
      raw: rawScores[key],
      maxRaw: dim.maxRaw,
      normalized: normalizedScores[key],
      clientWeight: CLIENT_FIT_WEIGHTS[key],
      projectWeight: PROJECT_FIT_WEIGHTS[key],
    })),
    matchedAt: new Date().toISOString(),
  };
}

/**
 * Run matching for a specific discipline against all consultants.
 *
 * @param {Array}  consultants - Array of consultant records
 * @param {string} discipline  - 'architect' | 'interior_designer' | 'pm' | 'gc'
 * @param {Object} kycData     - kycData from AppContext
 * @param {Object} fyiData     - fyiData from AppContext
 * @param {Object} options     - { minScore, maxResults }
 * @returns {Array} Sorted match results
 */
export function runMatching(consultants, discipline, kycData, fyiData, options = {}) {
  const { minScore = 0, maxResults = 50 } = options;

  // Filter to correct discipline + active
  const eligible = consultants.filter(c =>
    c.role === discipline && c.active !== false && c.status !== 'archived'
  );

  // Score each
  const results = eligible.map(c => scoreConsultant(c, kycData, fyiData));

  // Filter by minimum score
  const filtered = minScore > 0
    ? results.filter(r => r.combinedScore >= minScore)
    : results;

  // Sort by combined score descending
  filtered.sort((a, b) => b.combinedScore - a.combinedScore);

  // Limit results
  return filtered.slice(0, maxResults);
}


// =============================================================================
// HELPERS
// =============================================================================

function computeWeightedScore(rawScores, weights) {
  return Object.entries(rawScores).reduce((sum, [dim, raw]) => {
    return sum + (raw * (weights[dim] || 1.0));
  }, 0);
}

function computeWeightedMax(weights) {
  return Object.entries(SCORING_DIMENSIONS).reduce((sum, [dim, info]) => {
    return sum + (info.maxRaw * (weights[dim] || 1.0));
  }, 0);
}

function getTier(score) {
  if (score >= MATCH_TIERS.TOP_MATCH.min) return MATCH_TIERS.TOP_MATCH;
  if (score >= MATCH_TIERS.GOOD_FIT.min)  return MATCH_TIERS.GOOD_FIT;
  if (score >= MATCH_TIERS.CONSIDER.min)   return MATCH_TIERS.CONSIDER;
  return MATCH_TIERS.BELOW;
}

/**
 * Extract state from a city string (e.g., "Greenwich, CT" → "CT")
 * Falls back to checking known city→state mappings for UHNW markets
 */
export function extractState(cityStr, country) {
  if (!cityStr) return '';

  // Check for "City, ST" or "City, State" pattern
  const parts = cityStr.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 1].toUpperCase();
    // If it's a 2-letter code, use it
    if (candidate.length === 2) return candidate;
    // Look up full state name
    const stateAbbr = FULL_STATE_NAMES[candidate];
    if (stateAbbr) return stateAbbr;
  }

  // Known UHNW market cities
  const cityLower = cityStr.toLowerCase().trim();
  const knownCities = {
    'greenwich': 'CT', 'westport': 'CT', 'new canaan': 'CT', 'darien': 'CT',
    'westchester': 'NY', 'bedford': 'NY', 'scarsdale': 'NY', 'rye': 'NY',
    'hamptons': 'NY', 'east hampton': 'NY', 'southampton': 'NY', 'sag harbor': 'NY',
    'manhattan': 'NY', 'new york': 'NY', 'brooklyn': 'NY', 'tribeca': 'NY',
    'palm beach': 'FL', 'miami beach': 'FL', 'fisher island': 'FL', 'naples': 'FL',
    'beverly hills': 'CA', 'bel air': 'CA', 'malibu': 'CA', 'pacific palisades': 'CA',
    'aspen': 'CO', 'vail': 'CO', 'telluride': 'CO',
    'nantucket': 'MA', 'martha\'s vineyard': 'MA', 'boston': 'MA', 'wellesley': 'MA',
    'jackson hole': 'WY', 'sun valley': 'ID', 'park city': 'UT',
    'atherton': 'CA', 'woodside': 'CA', 'palo alto': 'CA', 'hillsborough': 'CA',
    'montecito': 'CA', 'santa barbara': 'CA',
    'scottsdale': 'AZ', 'paradise valley': 'AZ',
    'lake tahoe': 'CA', 'big sky': 'MT',
  };

  return knownCities[cityLower] || '';
}

const FULL_STATE_NAMES = {
  'CONNECTICUT': 'CT', 'NEW YORK': 'NY', 'CALIFORNIA': 'CA', 'FLORIDA': 'FL',
  'MASSACHUSETTS': 'MA', 'COLORADO': 'CO', 'TEXAS': 'TX', 'WYOMING': 'WY',
  'IDAHO': 'ID', 'UTAH': 'UT', 'MONTANA': 'MT', 'NEW JERSEY': 'NJ',
  'PENNSYLVANIA': 'PA', 'VIRGINIA': 'VA', 'MARYLAND': 'MD', 'ARIZONA': 'AZ',
  'GEORGIA': 'GA', 'NORTH CAROLINA': 'NC', 'SOUTH CAROLINA': 'SC',
  'TENNESSEE': 'TN', 'ILLINOIS': 'IL', 'WASHINGTON': 'WA', 'OREGON': 'OR',
  'NEVADA': 'NV', 'HAWAII': 'HI',
};


// =============================================================================
// DISCOVERY HELPERS (Phase 4)
// =============================================================================

/**
 * Derive style keywords from a client's design identity (taste axes + style tags).
 * Used by AI Discovery to auto-populate style criteria from client profile.
 *
 * @param {Object} designIdentity - kycData.principal.designIdentity
 * @returns {string[]} Unique style keywords
 */
export function deriveStyleKeywords(designIdentity) {
  if (!designIdentity) return [];
  const keywords = new Set();

  // From taste axes — check both manual KYC sliders AND taste exploration results
  const getAxisValue = (axisKey) => {
    // FIRST: Direct KYC slider value
    const directVal = designIdentity?.[axisKey];
    if (directVal != null && directVal !== 5) return directVal;

    // SECOND: Derive from Taste Exploration profile scores (1–10 scale)
    const tasteResults = designIdentity?.principalTasteResults;
    const scores = tasteResults?.profile?.scores || tasteResults?.session?.profile?.scores;
    if (scores) {
      const scoreMap = {
        axisContemporaryTraditional: scores.tradition,
        axisMinimalLayered: scores.formality,
        axisWarmCool: scores.warmth,
        axisOrganicGeometric: scores.openness,
        axisRefinedEclectic: scores.drama,
        axisArchMinimalOrnate: scores.art_focus,
      };
      return scoreMap[axisKey] ?? null;
    }

    // THIRD: Try old LuXeBrief format (1–100 scale → convert to 1–10)
    const oldProfile = tasteResults?.profile;
    if (oldProfile) {
      const oldMap = {
        axisContemporaryTraditional: oldProfile.traditionScore ? oldProfile.traditionScore / 10 : null,
        axisMinimalLayered: oldProfile.formalityScore ? oldProfile.formalityScore / 10 : null,
        axisWarmCool: oldProfile.warmthScore ? oldProfile.warmthScore / 10 : null,
        axisOrganicGeometric: oldProfile.opennessScore ? oldProfile.opennessScore / 10 : null,
        axisRefinedEclectic: oldProfile.dramaScore ? oldProfile.dramaScore / 10 : null,
        axisArchMinimalOrnate: oldProfile.artFocusScore ? oldProfile.artFocusScore / 10 : null,
      };
      return oldMap[axisKey] ?? null;
    }

    return directVal; // return whatever we have, even default 5
  };

  Object.entries(TASTE_STYLE_MAP).forEach(([axisKey, mapping]) => {
    const value = getAxisValue(axisKey);
    if (value == null) return;
    let styles;
    if (value <= 3)       styles = mapping.low;
    else if (value >= 7)  styles = mapping.high;
    else                  styles = mapping.mid;
    styles.forEach(s => keywords.add(s));
  });

  // From direct style tags
  (designIdentity?.architectureStyleTags || []).forEach(t => keywords.add(t));
  (designIdentity?.interiorStyleTags || []).forEach(t => keywords.add(t));

  return Array.from(keywords);
}

/**
 * Derive budget tier from total project budget.
 * Returns a tier key matching BUDGET_TIERS in AIDiscoveryForm, or null if too low.
 *
 * @param {number|string} totalProjectBudget
 * @returns {string|null} 'ultra_luxury' | 'luxury' | 'high_end' | 'mid_range' | null
 */
export function deriveBudgetTier(totalProjectBudget) {
  const budget = Number(totalProjectBudget) || 0;
  if (budget >= 10000000) return 'ultra_luxury';
  if (budget >= 5000000)  return 'luxury';
  if (budget >= 2000000)  return 'high_end';
  if (budget >= 1000000)  return 'mid_range';
  return null;
}

// Architectural Style Spectrum (AS1–AS9) — labels must match tasteConfig.js
const AS_SPECTRUM = [
  { id: 'AS1', name: 'Avant-Contemporary' },
  { id: 'AS2', name: 'Architectural Modern' },
  { id: 'AS3', name: 'Curated Minimalism' },
  { id: 'AS4', name: 'Nordic Contemporary' },
  { id: 'AS5', name: 'Mid-Century Refined' },
  { id: 'AS6', name: 'Modern Classic' },
  { id: 'AS7', name: 'Classical Contemporary' },
  { id: 'AS8', name: 'Formal Classical' },
  { id: 'AS9', name: 'Heritage Estate' },
];

/**
 * Derive the 3 closest Architectural Style Spectrum categories from taste data.
 *
 * Pipeline:
 *  1. Extract tradition score (1–10) from principalTasteResults, or fall back
 *     to axisContemporaryTraditional from KYC sliders.
 *  2. Convert to continuous AS position (1–9):
 *       styleEra = tradition / 2          (1–5 scale)
 *       AS_pos   = (styleEra - 1) * 2 + 1 (1–9 scale)
 *  3. Find nearest integer AS, then pick that + 2 adjacent (always 3),
 *     biased toward the side the fractional part leans.
 *
 * @param {Object} designIdentity - kycData.principal.designIdentity
 * @returns {{ styles: { id: string, name: string, isPrimary: boolean }[], asPosition: number, source: string } | null}
 */
export function deriveArchitecturalStyles(designIdentity) {
  if (!designIdentity) return null;

  let traditionScore = null;
  let source = 'none';

  // FIRST: Try principalTasteResults (most accurate — from actual Taste Exploration)
  const tasteResults = designIdentity.principalTasteResults;
  if (tasteResults) {
    // New format: profile.scores.tradition (1–10)
    const scores = tasteResults?.profile?.scores || tasteResults?.session?.profile?.scores;
    if (scores?.tradition != null) {
      traditionScore = Number(scores.tradition);
      source = 'taste_exploration';
    }
    // Old LuXeBrief format: profile.traditionScore (1–100 → convert to 1–10)
    if (traditionScore == null) {
      const oldProfile = tasteResults?.profile;
      if (oldProfile?.traditionScore != null) {
        traditionScore = Number(oldProfile.traditionScore) / 10;
        source = 'taste_exploration';
      }
    }
  }

  // SECOND: Fall back to KYC axis slider (axisContemporaryTraditional, 1–10)
  if (traditionScore == null && designIdentity.axisContemporaryTraditional != null) {
    const axisVal = Number(designIdentity.axisContemporaryTraditional);
    // Only use if it's been moved from the default 5
    if (axisVal !== 5) {
      traditionScore = axisVal;
      source = 'kyc_slider';
    }
  }

  if (traditionScore == null) return null;

  // Clamp to valid range
  traditionScore = Math.max(1, Math.min(10, traditionScore));

  // Convert: tradition (1–10) → styleEra (1–5) → AS position (1–9)
  const styleEra = traditionScore / 2;
  const asPosition = (styleEra - 1) * 2 + 1;

  // Find nearest integer index (0-based for array access)
  const nearestIdx = Math.round(asPosition) - 1; // 0–8
  const clampedIdx = Math.max(0, Math.min(8, nearestIdx));

  // Pick 3 adjacent: primary + 2 neighbors
  let indices;
  if (clampedIdx === 0) {
    // At the Contemporary end — pick 0, 1, 2
    indices = [0, 1, 2];
  } else if (clampedIdx === 8) {
    // At the Traditional end — pick 6, 7, 8
    indices = [6, 7, 8];
  } else {
    // Middle — primary + both neighbors
    indices = [clampedIdx - 1, clampedIdx, clampedIdx + 1];
  }

  const styles = indices.map(i => ({
    id: AS_SPECTRUM[i].id,
    name: AS_SPECTRUM[i].name,
    isPrimary: i === clampedIdx,
  }));

  return {
    styles,
    asPosition: Math.round(asPosition * 10) / 10,
    source,
  };
}
