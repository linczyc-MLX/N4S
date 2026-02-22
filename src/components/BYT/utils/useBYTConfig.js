/**
 * useBYTConfig.js — Shared hook for BYT configuration resolution
 * 
 * Loads global config from byt_global_config table, merges with project-level
 * overrides from bytData.adminConfig, and returns the fully resolved effective
 * configuration via configResolver.
 * 
 * Used by: BYTDiscoveryScreen, BYTMatchmakingScreen, BYTShortlistScreen, etc.
 * 
 * Usage:
 *   const { config, globalConfig, loading } = useBYTConfig();
 *   // config.discovery.model → effective AI model
 *   // config.scoring.weights → effective scoring weights
 *   // config.scoring.tiers → effective tier thresholds
 */

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { resolveConfig, FACTORY_DEFAULTS } from './configResolver';

// API base
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';

// Module-level cache to avoid refetching global config on every screen switch
let _globalConfigCache = null;
let _globalConfigLoadedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadGlobalConfig(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _globalConfigCache && (now - _globalConfigLoadedAt) < CACHE_TTL) {
    return _globalConfigCache;
  }
  try {
    const res = await fetch(`${API_BASE}/gid.php?entity=admin_config&scope=global`, { credentials: 'include' });
    if (!res.ok) return _globalConfigCache || {};
    const data = await res.json();
    _globalConfigCache = data.config || {};
    _globalConfigLoadedAt = now;
    return _globalConfigCache;
  } catch {
    return _globalConfigCache || {};
  }
}

/**
 * Hook: useBYTConfig
 * 
 * Returns { config, globalConfig, loading, refresh }
 * - config: fully resolved (global + project overrides merged)
 * - globalConfig: raw global config (for UI that needs to show inheritance)
 * - loading: true while initial load in progress
 * - refresh: function to force-reload global config
 */
export function useBYTConfig() {
  const { bytData } = useAppContext();
  const [globalConfig, setGlobalConfig] = useState(_globalConfigCache || {});
  const [loading, setLoading] = useState(!_globalConfigCache);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      const gc = await loadGlobalConfig();
      if (mountedRef.current) {
        setGlobalConfig(gc);
        setLoading(false);
      }
    })();
    return () => { mountedRef.current = false; };
  }, []);

  const projectOverrides = bytData?.adminConfig || {};
  const config = resolveConfig(globalConfig, projectOverrides);

  const refresh = async () => {
    setLoading(true);
    const gc = await loadGlobalConfig(true);
    if (mountedRef.current) {
      setGlobalConfig(gc);
      setLoading(false);
    }
  };

  return { config, globalConfig, loading, refresh };
}

/**
 * Helper: Get effective discipline guidance text.
 * Returns admin-configured guidance if set, otherwise the built-in default.
 * 
 * @param {string} discipline - 'architect' | 'interior_designer' | 'pm' | 'gc'
 * @param {string} budgetLabel - Human-readable budget tier label
 * @param {Object} config - Resolved config from useBYTConfig
 * @returns {string} Guidance text for the AI prompt
 */
export function getEffectiveGuidance(discipline, budgetLabel, config) {
  // Check if admin has configured custom guidance
  const adminGuidance = config?.discovery?.disciplineGuidance?.[discipline];
  if (adminGuidance) return adminGuidance;

  // Fall back to built-in defaults
  return getBuiltInGuidance(discipline, budgetLabel);
}

/**
 * Helper: Get effective exemplar firms for a discipline.
 * Returns merged list (global + project) with source tracking.
 * 
 * @param {string} discipline - 'architect' | 'interior_designer' | 'pm' | 'gc'
 * @param {Object} config - Resolved config from useBYTConfig
 * @returns {Array} Array of { name, source } objects
 */
export function getEffectiveExemplars(discipline, config) {
  const firms = config?.discovery?.exemplarFirms?.[discipline] || [];
  // Normalize to array of strings (strip source tracking for prompt injection)
  return firms.map(f => typeof f === 'string' ? f : f.name).filter(Boolean);
}

/**
 * Helper: Get effective exclusion list.
 * Returns flat array of firm names that should be excluded.
 * 
 * @param {Object} config - Resolved config from useBYTConfig
 * @returns {Array<string>} Array of excluded firm names
 */
export function getEffectiveExclusions(config) {
  return (config?.discovery?.exclusionList || []).map(f => typeof f === 'string' ? f : f.name);
}

// ============================================================================
// BUILT-IN DEFAULT GUIDANCE (moved from BYTDiscoveryScreen.jsx)
// These are the factory defaults when no admin guidance is configured.
// ============================================================================

function getBuiltInGuidance(discipline, budgetLabel) {
  const guidance = {
    architect: `
DISCIPLINE CONTEXT — Architecture:
Search for licensed architecture firms (AIA members preferred) with a demonstrated 
luxury residential portfolio. Prioritize firms whose BUILT WORK (not just renderings) 
includes completed private residences at the ${budgetLabel} scale. Consider both 
established practices and emerging studios with exceptional design recognition.
Look for: Design awards (AIA Honor Awards, AD100, Architectural Record Houses), 
published residential work, and evidence of bespoke single-family commissions.
`,
    interior_designer: `
DISCIPLINE CONTEXT — Interior Design:
Search for interior design firms specializing in LUXURY RESIDENTIAL interiors — not 
commercial hospitality, not retail, not corporate. Prioritize firms whose portfolio 
shows completed private residences at the ${budgetLabel} scale with evidence of 
bespoke furniture specification, custom millwork, and curated art programs.
Look for: AD100 listings, ELLE DECOR A-List, Architectural Digest features, Luxe 
Interiors + Design Gold List, and evidence of ongoing high-net-worth private client 
relationships. Prefer principals who are personally involved in residential projects.
`,
    pm: `
DISCIPLINE CONTEXT — Project Management / Owner's Representative:
THIS IS A SPECIALIZED NICHE. You are NOT looking for generic construction companies 
or large commercial builders. You are searching for BOUTIQUE FIRMS that serve as the 
OWNER'S ADVOCATE during luxury residential construction.

KEY DISTINCTIONS:
- "Owner's Representative" / "Owner's Rep" — a consultant who represents the 
  homeowner's interests, NOT a contractor who builds
- "Development Manager" — manages the entire development process on behalf of 
  the owner, from design through construction
- "Construction Consultant" — independent advisory, NOT a builder
- These firms are typically SMALL (5–25 people), work on 2–5 projects at a time, 
  and charge professional fees, not construction markups

WHAT TO LOOK FOR:
- Firms that explicitly identify as "Owner's Representative" or "Development Manager"
- Principals with backgrounds in architecture, real estate development, or 
  construction management (often MBA + technical degree)
- Demonstrated experience managing $10M+ RESIDENTIAL projects specifically 
  (not commercial, not institutional, not infrastructure)
- CMAA (Construction Management Association of America) certification
- Memberships: ULI, NAHB Custom Builder Council, ICAA
- Firms known in luxury markets: Hamptons, Palm Beach, Aspen, Beverly Hills, 
  Greenwich, Manhattan penthouses, Malibu, etc.

EXCLUDE:
- Large commercial general contractors (Turner, Skanska, etc.)
- National homebuilders (Toll Brothers, Lennar)
- Construction companies that "also do" residential
- Firms whose primary business is commercial or institutional
- Property management companies (they manage EXISTING buildings, not construction)

The right candidates will have LinkedIn profiles mentioning: "Owner's Representative", 
"private residence", "estate construction", "UHNW", "family office", "bespoke", 
"ground-up luxury residential", or "custom home development management."
`,
    gc: `
DISCIPLINE CONTEXT — General Contractor (Luxury Residential):
You are NOT looking for commercial construction companies. You are searching for 
LUXURY RESIDENTIAL BUILDERS who specialize in bespoke, architect-designed homes 
at the ${budgetLabel} scale.

KEY DISTINCTIONS:
- "Custom Home Builder" or "Luxury Residential Builder" — NOT tract housing
- These firms build 3–10 homes per year, each highly customized
- They work closely with architects and interior designers on complex detailing
- They employ or subcontract specialized craft trades: custom millwork, stone 
  masonry, ornamental metalwork, imported materials, smart home systems

WHAT TO LOOK FOR:
- Firms whose portfolio shows COMPLETED architect-designed residences at $10M+
- Experience with complex structural systems (cantilevers, large-span glass, 
  infinity edges, underground construction)
- Relationships with recognized luxury architects (evidence of repeat collaboration)
- NAHB Custom Builder Council membership
- Custom Builder of the Year awards, local HBA awards
- Firms known in luxury markets: Hamptons, Palm Beach, Aspen, Bel Air, 
  Greenwich, Napa Valley, etc.
- Evidence of handling imported materials, European fixtures, museum-grade 
  environmental controls

EXCLUDE:
- Commercial general contractors
- National production homebuilders
- Remodeling/renovation-only firms (unless they also do ground-up at scale)
- Firms whose largest project is under $5M
- Design-build firms that impose their own design (we need builders who execute 
  an architect's vision)
`
  };

  return guidance[discipline] || '';
}
