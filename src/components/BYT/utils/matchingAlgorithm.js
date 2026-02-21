/**
 * matchingAlgorithm.js — BYT Matching Engine v2.0
 *
 * 8-dimension scoring with discipline-specific weight matrices.
 *
 * Dimensions:
 *  1. Geographic Reach        (15 pts)  — Service area alignment
 *  2. Budget Scale            (15 pts)  — Budget range overlap
 *  3. Style DNA               (20 pts)  — Design aesthetic alignment
 *  4. Portfolio Evidence       (20 pts)  — Demonstrated built work at scale
 *  5. Credentials & Track Rec  (15 pts)  — Certifications, awards, publications
 *  6. Specialty Fit            (15 pts)  — Feature/space program match
 *  7. Firm Profile             (10 pts)  — Team size, years, capacity
 *  8. Quality Signal           (10 pts)  — Ratings, reviews, verification
 *
 * Two Output Scores:
 *  - Client Fit Score: Weighted toward Style, credentials, quality (who the client trusts)
 *  - Project Fit Score: Weighted toward Budget, geography, features, portfolio (who can deliver)
 *
 * Weights vary by discipline:
 *  - Architect/ID: Style DNA dominant (×2.0 Client Fit)
 *  - PM/Owner's Rep: Credentials dominant (×1.8 CF), Geography + Budget (×2.0 PF)
 *  - GC: Specialty Fit dominant (×2.0 PF), Geography critical (×2.0 PF)
 *
 * Match Tiers:
 *  70–100  Top Match   — Present to client
 *  50–69   Good Fit    — Strong candidate, minor gaps
 *  30–49   Consider    — Worth discussion
 *  <30     Below       — Filtered out unless overridden
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const MATCH_TIERS = {
  TOP_MATCH:  { min: 70, label: 'Top Match',  color: '#c9a227', bgColor: '#fdf8e8' },
  GOOD_FIT:   { min: 50, label: 'Good Fit',   color: '#1e3a5f', bgColor: '#eef2f7' },
  CONSIDER:   { min: 30, label: 'Consider',    color: '#6b6b6b', bgColor: '#f5f5f5' },
  BELOW:      { min: 0,  label: 'Below Threshold', color: '#d32f2f', bgColor: '#fef0f0' },
};

export const SCORING_DIMENSIONS = {
  geographic:   { label: 'Geographic Reach',           maxRaw: 15, icon: 'MapPin' },
  budget:       { label: 'Budget Scale',               maxRaw: 15, icon: 'DollarSign' },
  style:        { label: 'Style DNA',                  maxRaw: 20, icon: 'Palette' },
  portfolio:    { label: 'Portfolio Evidence',          maxRaw: 20, icon: 'Briefcase' },
  credentials:  { label: 'Credentials & Track Record', maxRaw: 15, icon: 'Award' },
  specialty:    { label: 'Specialty Fit',               maxRaw: 15, icon: 'Layers' },
  firmProfile:  { label: 'Firm Profile',                maxRaw: 10, icon: 'Users' },
  quality:      { label: 'Quality Signal',              maxRaw: 10, icon: 'Star' },
};

const TOTAL_RAW = 120; // Sum of all maxRaw

// =============================================================================
// DISCIPLINE-SPECIFIC WEIGHT MATRICES
// =============================================================================

const DISCIPLINE_WEIGHTS = {
  architect: {
    clientFit: {
      geographic: 0.6, budget: 0.8, style: 2.0, portfolio: 1.5,
      credentials: 1.0, specialty: 1.0, firmProfile: 0.5, quality: 1.2,
    },
    projectFit: {
      geographic: 0.8, budget: 1.2, style: 1.5, portfolio: 1.8,
      credentials: 0.8, specialty: 1.2, firmProfile: 0.7, quality: 0.8,
    },
  },
  interior_designer: {
    clientFit: {
      geographic: 0.5, budget: 0.8, style: 2.0, portfolio: 1.5,
      credentials: 0.8, specialty: 1.2, firmProfile: 0.5, quality: 1.5,
    },
    projectFit: {
      geographic: 0.7, budget: 1.2, style: 1.5, portfolio: 1.5,
      credentials: 0.6, specialty: 1.5, firmProfile: 0.7, quality: 0.8,
    },
  },
  pm: {
    clientFit: {
      geographic: 1.5, budget: 1.5, style: 0.2, portfolio: 1.2,
      credentials: 1.8, specialty: 0.8, firmProfile: 1.5, quality: 1.0,
    },
    projectFit: {
      geographic: 1.8, budget: 2.0, style: 0.2, portfolio: 1.8,
      credentials: 1.5, specialty: 1.2, firmProfile: 1.5, quality: 0.8,
    },
  },
  gc: {
    clientFit: {
      geographic: 1.8, budget: 1.5, style: 0.5, portfolio: 1.2,
      credentials: 1.0, specialty: 1.5, firmProfile: 1.5, quality: 1.2,
    },
    projectFit: {
      geographic: 2.0, budget: 1.8, style: 0.5, portfolio: 1.8,
      credentials: 1.2, specialty: 2.0, firmProfile: 1.5, quality: 1.0,
    },
  },
};

// Fallback for unknown disciplines
const DEFAULT_WEIGHTS = DISCIPLINE_WEIGHTS.architect;

// =============================================================================
// REFERENCE DATA
// =============================================================================

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

// Specialty keyword → AS position mapping (1–9 scale)
// Each keyword maps to a SINGLE best-fit position on the AS spectrum.
// This enables position-based distance scoring instead of binary matching.
const SPECIALTY_AS_POSITION = {
  'avant-garde': 1, 'deconstructivist': 1,
  'contemporary': 2, 'modern': 2.5, 'architectural modern': 2, 'international style': 2,
  'minimalist': 3, 'scandinavian': 3.5, 'japanese': 3, 'nordic': 3.5,
  'mid-century modern': 5, 'mid-century': 5,
  'transitional': 6, 'modern classic': 6, 'eclectic': 5.5,
  'classical': 7, 'colonial': 7.5, 'georgian': 8,
  'traditional': 8, 'neoclassical': 8, 'formal': 8, 'formal classical': 8,
  'victorian': 9, 'historic': 9, 'heritage': 9, 'estate': 8.5,
  'craftsman': 7, 'art deco': 5, 'coastal': 4.5, 'mountain': 5,
  'ranch': 5.5, 'farmhouse': 6.5, 'mediterranean': 7, 'tuscan': 7.5,
  'bohemian': 5, 'industrial': 2.5, 'rustic': 6, 'organic': 4,
  'sustainable': 3.5, 'passive house': 3, 'luxury hospitality': 5,
  'luxury residential': 5, 'custom homes': 5, 'new construction': 5,
};

// FYI space code → feature keyword mapping
const FYI_SPACE_TO_FEATURE = {
  // Standard complexity (1pt)
  'LIB':      { keyword: 'library', complexity: 1 },
  'GYM':      { keyword: 'gym', complexity: 1 },
  'BAR':      { keyword: 'bar', complexity: 1 },
  'MEDIA':    { keyword: 'media room', complexity: 1 },
  'GAME':     { keyword: 'game room', complexity: 1 },
  'MUS':      { keyword: 'music room', complexity: 1 },
  'OFF':      { keyword: 'home office', complexity: 1 },
  'CHEF':     { keyword: 'chef kitchen', complexity: 1 },
  'SCUL':     { keyword: 'scullery', complexity: 1 },
  // Complex (2pts)
  'WINE':     { keyword: 'wine cellar', complexity: 2 },
  'THR':      { keyword: 'home theater', complexity: 2 },
  'ART':      { keyword: 'art gallery', complexity: 2 },
  'SPA':      { keyword: 'spa', complexity: 2 },
  'PLH':      { keyword: 'pool house', complexity: 2 },
  'POOLSUP':  { keyword: 'pool', complexity: 2 },
  // Estate-scale (3pts)
  'Z9_GH':    { keyword: 'guest house', complexity: 3 },
};

// Consultant specialty tags that map to project features
const SPECIALTY_FEATURE_MAP = {
  'pool & outdoor': ['pool house', 'pool', 'spa'],
  'pool': ['pool house', 'pool'],
  'wine cellar': ['wine cellar'],
  'wine': ['wine cellar'],
  'smart home': ['smart home'],
  'smart home integration': ['smart home'],
  'home theater': ['home theater'],
  'spa/sauna': ['spa'],
  'staff quarters': ['staff quarters'],
  'guest house': ['guest house'],
  'art gallery': ['art gallery'],
  'library': ['library'],
  'gym': ['gym'],
  'indoor pool': ['pool house', 'pool'],
  'sustainable': ['sustainable'],
  'sustainable building': ['sustainable'],
  'historic preservation': ['historic restoration'],
  'historic restoration': ['historic restoration'],
  'luxury residential': ['luxury residential'],
  'custom homes': ['luxury residential'],
  'new construction': ['new construction'],
  'renovation': ['renovation'],
};

// Expected certifications by discipline (for scoring)
const EXPECTED_CERTIFICATIONS = {
  architect: ['AIA', 'NCARB', 'LEED AP', 'PASSIVE HOUSE', 'NAHB'],
  interior_designer: ['ASID', 'IIDA', 'NCIDQ', 'LEED AP', 'WELL AP'],
  pm: ['CMAA', 'CCM', 'PMP', 'LEED AP', 'AIA ASSOCIATE', 'NAHB CGP'],
  gc: ['NAHB', 'ICC', 'OSHA 30', 'EPA LEAD-SAFE', 'LEED AP'],
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
// SCORING FUNCTIONS — 8 DIMENSIONS
// =============================================================================

/**
 * 1. Geographic Reach (max 15)
 */
function scoreGeographic(consultant, projectCity, projectState) {
  if (!projectCity && !projectState) return 0;

  const serviceAreas = (consultant.service_areas || []).map(a => a.toUpperCase().trim());
  const hqState = (consultant.hq_state || '').toUpperCase().trim();
  const pState = (projectState || '').toUpperCase().trim();
  const pCity = (projectCity || '').toUpperCase().trim();

  let score = 0;

  // HQ in same state or service areas include project state
  if (hqState === pState) score = 15;
  else if (serviceAreas.includes(pState)) score = 13;
  // City name match in service areas
  else if (serviceAreas.some(a => a.includes(pCity) || pCity.includes(a))) score = 12;
  // Same region
  else {
    const projectRegion = Object.entries(STATE_REGIONS).find(
      ([, states]) => states.includes(pState)
    );
    if (projectRegion) {
      const regionStates = projectRegion[1];
      if (regionStates.includes(hqState) || serviceAreas.some(a => regionStates.includes(a))) {
        score = 8;
      }
    }
  }

  // Nationwide firms get partial credit if no better match
  if (score === 0) {
    if (serviceAreas.includes('NATIONAL') || serviceAreas.includes('NATIONWIDE') || serviceAreas.length >= 5) {
      score = 5;
    }
    if (consultant.verification_status === 'partner') score = Math.max(score, 6);
  }

  return score;
}

/**
 * 2. Budget Scale (max 15)
 */
function scoreBudget(consultant, totalBudget) {
  if (!totalBudget || totalBudget <= 0) return 0;

  const minB = Number(consultant.min_budget) || 0;
  const maxB = Number(consultant.max_budget) || Infinity;

  // No budget data = partial credit (common for AI imports)
  if (minB === 0 && maxB === Infinity) return 5;

  // Perfect range
  if (totalBudget >= minB && totalBudget <= maxB) return 15;

  // Deviation
  let deviation;
  if (totalBudget < minB) {
    deviation = (minB - totalBudget) / totalBudget;
  } else {
    deviation = (totalBudget - maxB) / totalBudget;
  }

  if (deviation <= 0.10) return 13;
  if (deviation <= 0.25) return 10;
  if (deviation <= 0.50) return 6;
  if (deviation <= 0.75) return 3;

  return 0;
}

/**
 * 3. Style DNA (max 20) — Position-based distance scoring
 *
 * For design disciplines (Architect, Interior Designer):
 *   Derives consultant's estimated AS position from their specialties,
 *   then scores based on DISTANCE to client's AS position.
 *   A Contemporary firm (position ~2) scores LOW against a Traditional client (position ~8).
 *   Also adds points for direct style tag matches.
 *
 * For non-design disciplines (PM, GC):
 *   Reduced scoring — luxury alignment baseline only.
 */
function scoreStyle(consultant, designIdentity, discipline) {
  if (!designIdentity) return 0;

  const specialties = (consultant.specialties || []).map(s => s.toLowerCase().trim());
  if (specialties.length === 0) return 0;

  // PM/GC: style nearly irrelevant — luxury focus baseline
  if (discipline === 'pm' || discipline === 'gc') {
    const luxuryTerms = ['luxury residential', 'luxury', 'custom homes', 'custom', 'high-end', 'estate'];
    const hasLuxuryFocus = specialties.some(s => luxuryTerms.some(t => s.includes(t)));
    return hasLuxuryFocus ? 10 : 3;
  }

  let score = 0;

  // --- Position-based AS Spectrum matching (up to 16 pts) ---
  const asResult = deriveArchitecturalStyles(designIdentity);
  if (asResult) {
    const clientASPosition = asResult.asPosition; // 1–9 scale

    // Derive consultant's estimated AS position from their specialties
    const consultantPosition = deriveConsultantASPosition(specialties);

    if (consultantPosition !== null && clientASPosition > 0) {
      // Distance on 1–9 scale
      const distance = Math.abs(clientASPosition - consultantPosition);

      // Score: 16 at distance 0, dropping to 0 at distance 5+
      // Scale: each 1.0 distance costs ~3.2 points
      if (distance <= 0.5)      score += 16;  // Near-perfect match
      else if (distance <= 1.0) score += 14;  // Excellent match
      else if (distance <= 1.5) score += 12;  // Strong match
      else if (distance <= 2.0) score += 9;   // Good match
      else if (distance <= 3.0) score += 6;   // Moderate match
      else if (distance <= 4.0) score += 3;   // Weak match
      else                      score += 0;   // Style mismatch
    }
  }

  // --- Direct style tag matching (up to 4 pts) ---
  const archTags = (designIdentity.architectureStyleTags || []).map(t => t.toLowerCase());
  const intTags = (designIdentity.interiorStyleTags || []).map(t => t.toLowerCase());
  const directTags = [...new Set([...archTags, ...intTags])];

  if (directTags.length > 0) {
    const directMatches = directTags.filter(tag =>
      specialties.some(s => s.includes(tag) || tag.includes(s))
    );
    if (directMatches.length >= 2) score += 4;
    else if (directMatches.length === 1) score += 2;
  }

  // --- Fallback: if no AS data, use dominant taste axis ---
  if (!asResult && score === 0) {
    const dominantAxis = getDominantTasteAxis(designIdentity);
    if (dominantAxis) {
      const matches = dominantAxis.keywords.filter(k =>
        specialties.some(s => s.includes(k.toLowerCase()) || k.toLowerCase().includes(s))
      );
      score = Math.min(12, matches.length * 4);
    }
  }

  return Math.min(20, score);
}

/**
 * 4. Portfolio Evidence (max 20) — Demonstrated built work at scale
 */
function scorePortfolio(consultant, totalBudget, targetSF, projectState) {
  const portfolio = consultant.portfolio || [];
  if (portfolio.length === 0) return 0;

  let score = 0;

  // Has portfolio projects (3 pts)
  score += 3;

  // Projects at similar budget scale (5 pts)
  if (totalBudget > 0) {
    const budgetAligned = portfolio.some(p => {
      const pMin = Number(p.budget_min) || 0;
      const pMax = Number(p.budget_max) || Infinity;
      return (totalBudget >= pMin * 0.5 && totalBudget <= pMax * 2);
    });
    if (budgetAligned) score += 5;
  }

  // Projects at similar square footage (3 pts)
  if (targetSF > 0) {
    const sfAligned = portfolio.some(p => {
      const pSF = Number(p.square_footage) || 0;
      if (pSF === 0) return false;
      const ratio = pSF / targetSF;
      return ratio >= 0.5 && ratio <= 2.0;
    });
    if (sfAligned) score += 3;
  }

  // Projects in same region (3 pts)
  if (projectState) {
    const pStateUpper = projectState.toUpperCase();
    const regionStates = getRegionStates(pStateUpper);
    const regionalProject = portfolio.some(p => {
      const pLocState = (p.location_state || '').toUpperCase();
      return pLocState === pStateUpper || regionStates.includes(pLocState);
    });
    if (regionalProject) score += 3;
  }

  // Award-winning projects (3 pts)
  const hasAwards = portfolio.some(p => p.award_winner || p.award_details);
  if (hasAwards) score += 3;

  // Published in recognized media (3 pts)
  const hasPublications = portfolio.some(p =>
    p.featured_in_publications && p.featured_in_publications.length > 0
  );
  if (hasPublications) score += 3;

  return Math.min(20, score);
}

/**
 * 5. Credentials & Track Record (max 15)
 */
function scoreCredentials(consultant, discipline) {
  let score = 0;

  const certs = (consultant.certifications || []).map(c => c.toUpperCase().trim());
  const expectedCerts = EXPECTED_CERTIFICATIONS[discipline] || [];

  // Has certifications (3 pts)
  if (certs.length > 0) score += 3;

  // Discipline-relevant certifications (5 pts)
  if (certs.length > 0 && expectedCerts.length > 0) {
    const relevantCount = certs.filter(c =>
      expectedCerts.some(e => c.includes(e) || e.includes(c))
    ).length;
    if (relevantCount >= 2) score += 5;
    else if (relevantCount === 1) score += 3;
  }

  // Awards from AI Discovery source attribution (4 pts)
  const sourceAttrib = parseSourceAttribution(consultant);
  if (sourceAttrib.awards && sourceAttrib.awards.length > 0) {
    score += Math.min(4, sourceAttrib.awards.length * 2);
  }

  // Publications (3 pts)
  if (sourceAttrib.publications && sourceAttrib.publications.length > 0) {
    score += Math.min(3, sourceAttrib.publications.length);
  }

  return Math.min(15, score);
}

/**
 * 6. Specialty Fit (max 15)
 *
 * For GC: Direct feature-keyword matching (they build wine cellars, pools, etc.)
 * For Architect/ID: Project complexity scoring based on luxury feature count + scale
 * For PM: Hybrid — complexity + management scope
 */
function scoreSpecialty(consultant, fyiSelections, discipline) {
  // Derive project features from FYI space selections
  const projectFeatures = [];
  let totalComplexity = 0;
  let includedSpaceCount = 0;

  if (fyiSelections) {
    Object.entries(fyiSelections).forEach(([code, space]) => {
      if (!space?.included) return;
      includedSpaceCount++;
      const mapping = FYI_SPACE_TO_FEATURE[code];
      if (mapping) {
        projectFeatures.push(mapping.keyword);
        totalComplexity += mapping.complexity;
      }
    });
  }

  // No FYI data at all = small baseline
  if (includedSpaceCount === 0) return 3;

  const specialties = (consultant.specialties || []).map(s => s.toLowerCase().trim());

  // --- GC: Feature-keyword matching (they actually BUILD these features) ---
  if (discipline === 'gc') {
    return scoreSpecialtyByFeatureMatch(consultant, projectFeatures, totalComplexity);
  }

  // --- Architect / Interior Designer: Complexity alignment scoring ---
  // Architects don't specialize in "wine cellars" — they specialize in styles.
  // But complex programs (theater + wine cellar + pool house + guest house) require
  // architects experienced with estate-scale luxury projects.
  if (discipline === 'architect' || discipline === 'interior_designer') {
    let score = 0;

    // Project complexity tier (based on luxury feature count and complexity weight)
    // Complex programs favor experienced luxury firms
    if (totalComplexity >= 10) score += 6;        // Estate-scale complexity
    else if (totalComplexity >= 6) score += 4;    // Significant complexity
    else if (totalComplexity >= 3) score += 2;    // Moderate complexity

    // Luxury residential experience alignment
    const luxuryTerms = ['luxury', 'custom', 'estate', 'high-end', 'luxury residential', 'luxury hospitality'];
    const hasLuxuryExp = specialties.some(s => luxuryTerms.some(t => s.includes(t)));
    if (hasLuxuryExp) score += 4;

    // Space count alignment (20+ spaces = full estate, needs capacity)
    if (includedSpaceCount >= 25) score += 3;
    else if (includedSpaceCount >= 15) score += 2;
    else if (includedSpaceCount >= 8) score += 1;

    // Any direct feature matches from portfolio are bonus
    const portfolioBonus = scoreSpecialtyByFeatureMatch(consultant, projectFeatures, totalComplexity);
    if (portfolioBonus > 3) score += 2; // Bonus for portfolio evidence of specific features

    return Math.min(15, score);
  }

  // --- PM: Hybrid — complexity + management scope ---
  if (discipline === 'pm') {
    let score = 0;

    // Complexity = harder to manage
    if (totalComplexity >= 10) score += 5;
    else if (totalComplexity >= 6) score += 3;
    else if (totalComplexity >= 3) score += 2;

    // Multi-property / estate management experience
    const pmTerms = ['multi-property', 'estate management', 'luxury residential', 'new construction'];
    const hasPMExp = specialties.some(s => pmTerms.some(t => s.includes(t)));
    if (hasPMExp) score += 4;

    // Space count = project scale = management complexity
    if (includedSpaceCount >= 25) score += 4;
    else if (includedSpaceCount >= 15) score += 3;
    else if (includedSpaceCount >= 8) score += 2;

    return Math.min(15, score);
  }

  // Fallback
  return scoreSpecialtyByFeatureMatch(consultant, projectFeatures, totalComplexity);
}

/**
 * Feature-keyword matching helper (used by GC and as bonus for others)
 */
function scoreSpecialtyByFeatureMatch(consultant, projectFeatures, totalComplexity) {
  if (projectFeatures.length === 0) return 3;

  const consultantFeatures = new Set();

  (consultant.portfolio || []).forEach(proj => {
    (proj.features || []).forEach(f => {
      consultantFeatures.add(f.toLowerCase().trim());
    });
  });

  (consultant.specialties || []).forEach(spec => {
    const mapped = SPECIALTY_FEATURE_MAP[spec.toLowerCase().trim()];
    if (mapped) {
      mapped.forEach(f => consultantFeatures.add(f));
    }
    consultantFeatures.add(spec.toLowerCase().trim());
  });

  if (consultantFeatures.size === 0) return 2;

  let matchedComplexity = 0;
  projectFeatures.forEach(feature => {
    const mapping = Object.values(FYI_SPACE_TO_FEATURE).find(
      m => m.keyword === feature
    );
    const complexity = mapping?.complexity || 1;

    const matched = [...consultantFeatures].some(cf =>
      cf.includes(feature) || feature.includes(cf)
    );
    if (matched) matchedComplexity += complexity;
  });

  if (totalComplexity === 0) return 3;

  const ratio = matchedComplexity / totalComplexity;
  return Math.min(15, Math.round(ratio * 15));
}

/**
 * 7. Firm Profile (max 10)
 */
function scoreFirmProfile(consultant) {
  let score = 0;

  // Years of experience
  const yrs = Number(consultant.years_experience) || 0;
  if (yrs >= 20) score += 4;
  else if (yrs >= 12) score += 3;
  else if (yrs >= 8) score += 2;
  else if (yrs >= 3) score += 1;

  // Team size
  const teamSize = Number(consultant.team_size) || 0;
  if (teamSize >= 20) score += 3;
  else if (teamSize >= 10) score += 2;
  else if (teamSize >= 3) score += 1;

  // Firm established year
  const estYear = Number(consultant.firm_established_year) || 0;
  if (estYear > 0) {
    const age = new Date().getFullYear() - estYear;
    if (age >= 15) score += 3;
    else if (age >= 8) score += 2;
    else if (age >= 3) score += 1;
  }

  return Math.min(10, score);
}

/**
 * 8. Quality Signal (max 10) — Earned, not given
 *
 * For AI Discovery imports: uses confidence_score (50–95) as a quality proxy.
 * For manually added: uses verification, ratings, reviews.
 */
function scoreQuality(consultant) {
  let score = 0;

  // Verification status
  if (consultant.verification_status === 'partner') score += 4;
  else if (consultant.verification_status === 'verified') score += 2;

  // Rating (must have actual reviews)
  const rating = Number(consultant.avg_rating) || 0;
  const reviewCount = Number(consultant.review_count) || 0;

  if (rating > 0 && reviewCount > 0) {
    if (rating >= 4.5) score += 3;
    else if (rating >= 3.5) score += 2;
    else if (rating >= 2.5) score += 1;
  }

  // Review volume
  if (reviewCount >= 3) score += 2;
  else if (reviewCount >= 1) score += 1;

  // AI Discovery confidence score (for unrated imports — provides differentiation)
  if (score < 3) {
    const sourceAttrib = parseSourceAttribution(consultant);
    const confidence = Number(sourceAttrib.confidenceScore) || 0;
    if (confidence >= 90) score += 4;
    else if (confidence >= 80) score += 3;
    else if (confidence >= 70) score += 2;
    else if (confidence >= 50) score += 1;
  }

  return Math.min(10, score);
}


// =============================================================================
// MAIN MATCHING FUNCTION
// =============================================================================

/**
 * Score a single consultant against project data.
 *
 * @param {Object} consultant - Consultant record (with portfolio array if fetched)
 * @param {string} discipline - 'architect' | 'interior_designer' | 'pm' | 'gc'
 * @param {Object} kycData    - kycData from AppContext
 * @param {Object} fyiData    - fyiData from AppContext
 * @returns {Object} Match result with scores and breakdown
 */
export function scoreConsultant(consultant, discipline, kycData, fyiData) {
  const principal = kycData?.principal || {};
  const projectParams = principal?.projectParameters || {};
  const budgetFw = principal?.budgetFramework || {};
  const designId = principal?.designIdentity || {};

  const projectCity = projectParams.projectCity || '';
  const projectState = extractState(projectCity, projectParams.projectCountry);
  const totalBudget = Number(budgetFw.totalProjectBudget) || 0;
  const targetSF = Number(fyiData?.settings?.targetSF) || 0;

  // Get discipline-specific weights
  const weights = DISCIPLINE_WEIGHTS[discipline] || DEFAULT_WEIGHTS;

  // Raw dimension scores
  const rawScores = {
    geographic:   scoreGeographic(consultant, projectCity, projectState),
    budget:       scoreBudget(consultant, totalBudget),
    style:        scoreStyle(consultant, designId, discipline),
    portfolio:    scorePortfolio(consultant, totalBudget, targetSF, projectState),
    credentials:  scoreCredentials(consultant, discipline),
    specialty:    scoreSpecialty(consultant, fyiData?.selections, discipline),
    firmProfile:  scoreFirmProfile(consultant),
    quality:      scoreQuality(consultant),
  };

  // Normalize each dimension to 0-100 scale
  const normalizedScores = {};
  Object.entries(rawScores).forEach(([dim, raw]) => {
    normalizedScores[dim] = Math.round((raw / SCORING_DIMENSIONS[dim].maxRaw) * 100);
  });

  // Compute weighted scores
  const clientFitRaw = computeWeightedScore(rawScores, weights.clientFit);
  const projectFitRaw = computeWeightedScore(rawScores, weights.projectFit);

  const clientFitMax = computeWeightedMax(weights.clientFit);
  const projectFitMax = computeWeightedMax(weights.projectFit);

  const clientFitScore = Math.round((clientFitRaw / clientFitMax) * 100);
  const projectFitScore = Math.round((projectFitRaw / projectFitMax) * 100);

  // Combined score (average of both)
  const combinedScore = Math.round((clientFitScore + projectFitScore) / 2);

  // Determine tier
  const tier = getTier(combinedScore);

  return {
    consultantId: consultant.id,
    consultantName: consultant.firm_name,
    discipline: consultant.role || discipline,
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
      clientWeight: weights.clientFit[key],
      projectWeight: weights.projectFit[key],
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

  const eligible = consultants.filter(c =>
    c.role === discipline && c.active !== false && c.status !== 'archived'
  );

  // Score each — passes discipline for weight selection
  const results = eligible.map(c => scoreConsultant(c, discipline, kycData, fyiData));

  const filtered = minScore > 0
    ? results.filter(r => r.combinedScore >= minScore)
    : results;

  filtered.sort((a, b) => b.combinedScore - a.combinedScore);

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

function getRegionStates(stateCode) {
  for (const [, states] of Object.entries(STATE_REGIONS)) {
    if (states.includes(stateCode)) return states;
  }
  return [];
}

/**
 * Derive a consultant's estimated AS position (1–9) from their specialties.
 * Averages the positions of all mappable specialties.
 * Returns null if no specialties can be mapped.
 */
function deriveConsultantASPosition(specialties) {
  let totalPos = 0;
  let count = 0;

  specialties.forEach(spec => {
    // Try exact match first
    let pos = SPECIALTY_AS_POSITION[spec];
    if (pos != null) {
      totalPos += pos;
      count++;
      return;
    }
    // Try partial match (e.g., "mid-century modern" inside "Mid-Century Modern Residential")
    for (const [keyword, position] of Object.entries(SPECIALTY_AS_POSITION)) {
      if (spec.includes(keyword) || keyword.includes(spec)) {
        totalPos += position;
        count++;
        return;
      }
    }
  });

  if (count === 0) return null;
  return totalPos / count;
}

function getDominantTasteAxis(designIdentity) {
  if (!designIdentity) return null;

  let maxDeviation = 0;
  let dominantKey = null;
  let dominantValue = 5;

  Object.keys(TASTE_STYLE_MAP).forEach(axisKey => {
    const val = designIdentity[axisKey];
    if (val == null) return;
    const deviation = Math.abs(val - 5);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      dominantKey = axisKey;
      dominantValue = val;
    }
  });

  if (!dominantKey || maxDeviation < 1) return null;

  const mapping = TASTE_STYLE_MAP[dominantKey];
  let keywords;
  if (dominantValue <= 3) keywords = mapping.low;
  else if (dominantValue >= 7) keywords = mapping.high;
  else keywords = mapping.mid;

  return { axisKey: dominantKey, value: dominantValue, keywords };
}

function parseSourceAttribution(consultant) {
  if (!consultant.source_attribution) return {};

  try {
    const data = typeof consultant.source_attribution === 'string'
      ? JSON.parse(consultant.source_attribution)
      : consultant.source_attribution;
    return {
      awards: data.awards || [],
      publications: data.publications || [],
      confidenceScore: data.confidence_score || 0,
      sourceType: data.source_type || '',
    };
  } catch {
    return {};
  }
}

/**
 * Extract state from a city string (e.g., "Greenwich, CT" → "CT")
 */
export function extractState(cityStr, country) {
  if (!cityStr) return '';

  const parts = cityStr.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 1].toUpperCase();
    if (candidate.length === 2) return candidate;
    const stateAbbr = FULL_STATE_NAMES[candidate];
    if (stateAbbr) return stateAbbr;
  }

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
 */
export function deriveStyleKeywords(designIdentity) {
  if (!designIdentity) return [];
  const keywords = new Set();

  const getAxisValue = (axisKey) => {
    const directVal = designIdentity?.[axisKey];
    if (directVal != null && directVal !== 5) return directVal;

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

    return directVal;
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

  (designIdentity?.architectureStyleTags || []).forEach(t => keywords.add(t));
  (designIdentity?.interiorStyleTags || []).forEach(t => keywords.add(t));

  return Array.from(keywords);
}

/**
 * Derive budget tier from total project budget.
 */
export function deriveBudgetTier(totalProjectBudget) {
  const budget = Number(totalProjectBudget) || 0;
  if (budget >= 10000000) return 'ultra_luxury';
  if (budget >= 5000000)  return 'luxury';
  if (budget >= 2000000)  return 'high_end';
  if (budget >= 1000000)  return 'mid_range';
  return null;
}

/**
 * Derive the 3 closest Architectural Style Spectrum categories from taste data.
 */
export function deriveArchitecturalStyles(designIdentity) {
  if (!designIdentity) return null;

  let traditionScore = null;
  let source = 'none';

  const tasteResults = designIdentity.principalTasteResults;
  if (tasteResults) {
    const scores = tasteResults?.profile?.scores || tasteResults?.session?.profile?.scores;
    if (scores?.tradition != null) {
      traditionScore = Number(scores.tradition);
      source = 'taste_exploration';
    }
    if (traditionScore == null) {
      const oldProfile = tasteResults?.profile;
      if (oldProfile?.traditionScore != null) {
        traditionScore = Number(oldProfile.traditionScore) / 10;
        source = 'taste_exploration';
      }
    }
  }

  if (traditionScore == null && designIdentity.axisContemporaryTraditional != null) {
    const axisVal = Number(designIdentity.axisContemporaryTraditional);
    if (axisVal !== 5) {
      traditionScore = axisVal;
      source = 'kyc_slider';
    }
  }

  if (traditionScore == null) return null;

  traditionScore = Math.max(1, Math.min(10, traditionScore));

  const styleEra = traditionScore / 2;
  const asPosition = (styleEra - 1) * 2 + 1;

  const nearestIdx = Math.round(asPosition) - 1;
  const clampedIdx = Math.max(0, Math.min(8, nearestIdx));

  let indices;
  if (clampedIdx === 0) {
    indices = [0, 1, 2];
  } else if (clampedIdx === 8) {
    indices = [6, 7, 8];
  } else {
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
