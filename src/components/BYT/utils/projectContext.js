/**
 * projectContext.js — BYT Project Context Abstraction
 * 
 * Single point of access for project data across all BYT screens.
 * In N4S mode: reads from KYC + FYI via AppContext.
 * In standalone mode: reads from Admin Panel → Project Brief.
 * 
 * All BYT screens should import getProjectContext() instead of reading
 * kycData/fyiData directly. This is the extraction point for standalone deployment.
 */

/**
 * Derive style keywords from KYC designIdentity taste axes.
 */
function deriveStyleKeywords(designIdentity) {
  if (!designIdentity) return [];
  const keywords = [];
  const axes = designIdentity.tasteAxes || designIdentity.axes || {};
  
  // Extract descriptive labels from taste axis positions
  Object.entries(axes).forEach(([key, val]) => {
    if (val?.selectedLabel) keywords.push(val.selectedLabel);
    if (val?.tags) keywords.push(...val.tags);
  });

  // Add style tags if present
  if (designIdentity.styleTags) {
    keywords.push(...designIdentity.styleTags);
  }

  return [...new Set(keywords.filter(Boolean))];
}

/**
 * Derive included spaces list from FYI selections.
 */
function deriveIncludedSpaces(fyiData) {
  if (!fyiData?.selections) return [];
  return Object.entries(fyiData.selections)
    .filter(([, space]) => space?.included)
    .map(([code, space]) => ({
      code,
      name: space.displayName || space.name || code,
      zone: space.zone || space.zoneName || null,
      baseSF: space.baseSF || space.sf || 0,
    }));
}

/**
 * Extract state abbreviation from city/country string.
 */
function extractState(projectCity, projectCountry) {
  if (!projectCity) return '';
  // Check for "City, ST" pattern
  const match = projectCity.match(/,\s*([A-Z]{2})$/);
  if (match) return match[1];
  // Check for state names
  const states = {
    'california': 'CA', 'new york': 'NY', 'texas': 'TX', 'florida': 'FL',
    'connecticut': 'CT', 'massachusetts': 'MA', 'colorado': 'CO', 'georgia': 'GA',
    'new jersey': 'NJ', 'illinois': 'IL', 'virginia': 'VA', 'maryland': 'MD',
    'north carolina': 'NC', 'south carolina': 'SC', 'arizona': 'AZ', 'nevada': 'NV',
    'washington': 'WA', 'oregon': 'OR', 'hawaii': 'HI', 'montana': 'MT',
    'wyoming': 'WY', 'idaho': 'ID', 'utah': 'UT', 'tennessee': 'TN',
    'pennsylvania': 'PA', 'ohio': 'OH', 'michigan': 'MI', 'minnesota': 'MN',
  };
  const lower = projectCity.toLowerCase();
  for (const [name, abbrev] of Object.entries(states)) {
    if (lower.includes(name)) return abbrev;
  }
  return '';
}

/**
 * Get project context from the appropriate source.
 * 
 * Priority: Manual overrides (projectBrief) > KYC/FYI data > empty defaults
 * 
 * @param {Object} appContext - The full AppContext value
 * @returns {Object} Normalized project context
 */
export function getProjectContext(appContext) {
  const overrides = appContext?.bytData?.projectBrief || {};
  const hasOverrides = Object.keys(overrides).length > 0;

  const kycPrincipal = appContext?.kycData?.principal || {};
  const projectParams = kycPrincipal.projectParameters || {};
  const budgetFw = kycPrincipal.budgetFramework || {};
  const portfolioCtx = kycPrincipal.portfolioContext || {};
  const designId = kycPrincipal.designIdentity || {};

  // --- Project Name: robust fallback chain ---
  // 1. Manual override (standalone mode)
  // 2. clientData.projectName (Dashboard-level, synced with projects DB table)
  // 3. Active project from projects list (DB project_name column)
  // 4. KYC project parameters
  const activeProject = (appContext?.projects || []).find(p => p.id === appContext?.activeProjectId);
  const projectName = overrides.projectName
    || appContext?.clientData?.projectName
    || activeProject?.name
    || projectParams.projectName
    || '';

  // --- Location: extract city and state without duplication ---
  const rawCity = overrides.projectCity || projectParams.projectCity || '';
  const rawState = overrides.projectState || extractState(rawCity, projectParams.projectCountry || '');
  // Strip state from city string if city already contains it (e.g., "Malibu, CA" → "Malibu")
  const projectCity = rawState && rawCity.endsWith(`, ${rawState}`)
    ? rawCity.slice(0, -(rawState.length + 2))
    : rawCity;
  const projectState = rawState;

  return {
    // Core identifiers
    projectName,
    projectCity,
    projectState,
    projectCountry: overrides.projectCountry || projectParams.projectCountry || '',

    // Financials
    totalBudget: overrides.totalBudget || Number(budgetFw.totalProjectBudget) || 0,
    constructionBudget: overrides.constructionBudget
      || Number(appContext?.fyiData?.budgetRange?.constructionBudget)
      || Number(budgetFw.constructionBudget)
      || 0,

    // Scale
    targetSF: overrides.targetSF || appContext?.fyiData?.settings?.targetSF || null,
    propertyType: overrides.propertyType || projectParams.propertyType || '',

    // Design context
    styleKeywords: overrides.styleKeywords || deriveStyleKeywords(designId),
    includedSpaces: overrides.includedSpaces || deriveIncludedSpaces(appContext?.fyiData),

    // Client identity
    clientName: overrides.clientName || [portfolioCtx.principalFirstName, portfolioCtx.principalLastName]
      .filter(Boolean).join(' ') || '',

    // Budget tier derivation
    budgetTier: deriveBudgetTier(overrides.totalBudget || Number(budgetFw.totalProjectBudget) || 0),

    // Source tracking
    source: hasOverrides ? 'manual' : (appContext?.kycData ? 'n4s' : 'empty'),

    // Project identity (for API calls that need project scoping)
    activeProjectId: appContext?.activeProjectId || null,

    // Raw references (for N4S mode - used by components that need full KYC/FYI data)
    _raw: {
      kycData: appContext?.kycData || null,
      fyiData: appContext?.fyiData || null,
    },
  };
}

/**
 * Derive budget tier label from total project budget.
 */
function deriveBudgetTier(totalBudget) {
  if (!totalBudget || totalBudget <= 0) return 'unknown';
  if (totalBudget >= 50000000) return 'ultra_luxury';
  if (totalBudget >= 15000000) return 'luxury';
  if (totalBudget >= 5000000) return 'high_end';
  return 'mid_range';
}

/**
 * Format budget for display.
 */
export function formatBudget(amount) {
  if (!amount || amount <= 0) return '—';
  if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(0) + 'K';
  return '$' + amount.toLocaleString();
}

/**
 * Check if project context has minimum required data for BYT operations.
 */
export function validateProjectContext(ctx) {
  const issues = [];
  if (!ctx.projectCity) issues.push('Project city is required for geographic scoring');
  if (!ctx.totalBudget) issues.push('Project budget is required for scale matching');
  return { valid: issues.length === 0, issues };
}
