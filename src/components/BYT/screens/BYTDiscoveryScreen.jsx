/**
 * BYTDiscoveryScreen.jsx — Discovery Screen (Phase 3 + Config Wiring)
 *
 * AI-assisted consultant sourcing tool with three sub-modes:
 * 1. Manual Search — Quick lookup + pre-fill AddConsultantForm
 * 2. AI Discovery — Criteria-based AI search using Claude
 * 3. Import Queue — Review, approve, and import candidates to registry
 *
 * CONFIG WIRING (Feb 2026):
 * - AI model from Admin config (discovery.model)
 * - Discipline guidance from Admin config (discovery.disciplineGuidance)
 * - Exemplar firms injected into prompts (discovery.exemplarFirms)
 * - Exclusion list filters AI results (discovery.exclusionList)
 * - Confidence threshold from Admin config (discovery.confidenceThreshold)
 * - Results per search default from Admin config (discovery.resultsPerSearch)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Search, Zap, Inbox, RefreshCw, AlertTriangle, Filter, Check, X,
  Upload, Trash2, ChevronDown, Eye, Users, MapPin, Globe,
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import CandidateCard from '../components/CandidateCard';
import AIDiscoveryForm from '../components/AIDiscoveryForm';
import { useBYTConfig, getEffectiveGuidance, getEffectiveExemplars, getEffectiveExclusions } from '../utils/useBYTConfig';

// API base
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';

// AI key (loaded once from server, cached in memory only)
let BYT_AI_KEY = null;
async function getAIKey() {
  if (BYT_AI_KEY) return BYT_AI_KEY;
  const res = await fetch(`${API_BASE}/byt-ai-config.php`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load AI configuration');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  BYT_AI_KEY = data.key;
  return BYT_AI_KEY;
}

// ============================================================================
// API HELPERS
// ============================================================================

const discoveryApi = {
  async fetchCandidates(filters = {}) {
    const params = new URLSearchParams({ entity: 'discovery' });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await fetch(`${API_BASE}/gid.php?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async fetchQueueStats(projectId) {
    const params = new URLSearchParams({ entity: 'discovery', action: 'queue_stats' });
    if (projectId) params.set('project_id', projectId);
    const res = await fetch(`${API_BASE}/gid.php?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async reviewCandidate(id, status, reviewNotes = '') {
    const res = await fetch(`${API_BASE}/gid.php?entity=discovery&id=${id}&action=review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, review_notes: reviewNotes, reviewed_by: 'LRA Team' }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async importCandidate(id, projectId) {
    const res = await fetch(`${API_BASE}/gid.php?entity=discovery&id=${id}&action=import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ project_id: projectId }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async batchReview(ids, status) {
    const res = await fetch(`${API_BASE}/gid.php?entity=discovery&action=batch_review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids, status, reviewed_by: 'LRA Team' }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  /**
   * Run AI Discovery search — CONFIG-DRIVEN
   *
   * @param {Object} criteria - Search criteria from AIDiscoveryForm
   * @param {Object} effectiveConfig - Resolved config from useBYTConfig
   */
  async runAISearch(criteria, effectiveConfig) {
    await getAIKey();

    const { discipline, states, budgetTier, styleKeywords, limit, useClientProfile, profileData } = criteria;

    const disciplineLabels = {
      architect: 'architecture',
      interior_designer: 'interior design',
      pm: 'project management (luxury residential)',
      gc: 'general contracting (luxury residential)',
    };
    const disciplineLabel = disciplineLabels[discipline] || discipline;
    const geoFocus = states?.length > 0 ? states.join(', ') : 'Nationwide (USA)';
    const styleFocus = styleKeywords?.length > 0 ? styleKeywords.join(', ') : 'Contemporary, Traditional, Transitional';
    const budgetLabels = {
      ultra_luxury: 'Ultra-Luxury ($10M+ projects)',
      luxury: 'Luxury ($5M–$15M projects)',
      high_end: 'High-End ($2M–$8M projects)',
      mid_range: 'Mid-Range ($1M–$3M projects)',
    };
    const budgetLabel = budgetLabels[budgetTier] || budgetTier;
    const discoveryQuery = `Find ${limit} ${disciplineLabel} firms | Geo: ${geoFocus} | Budget: ${budgetLabel} | Style: ${styleFocus}${useClientProfile ? ' | Profile-Aware' : ''}`;

    // =====================================================================
    // CONFIG-DRIVEN: guidance, exemplars, exclusions, model from Admin
    // =====================================================================
    const guidanceText = getEffectiveGuidance(discipline, budgetLabel, effectiveConfig);
    const exemplarFirms = getEffectiveExemplars(discipline, effectiveConfig);
    const exclusionList = getEffectiveExclusions(effectiveConfig);
    const aiModel = effectiveConfig?.discovery?.model || 'claude-sonnet-4-20250514';

    // Exemplar firms prompt block
    let exemplarBlock = '';
    if (exemplarFirms.length > 0) {
      exemplarBlock = `\n\nEXEMPLAR FIRMS (calibration anchors — include if they match geography):
${exemplarFirms.map(f => `- ${f}`).join('\n')}
Use these as calibration for the quality level expected.`;
    }

    // Exclusion prompt block
    let exclusionBlock = '';
    if (exclusionList.length > 0) {
      exclusionBlock = `\n\nEXCLUDED FIRMS (NEVER include in results):
${exclusionList.map(f => `- ${f}`).join('\n')}`;
    }

    // Build enriched client context when profile is active
    let enrichedContext = '';
    if (useClientProfile && profileData) {
      const di = profileData.designIdentity || {};
      const ls = profileData.lifestyle || {};

      const axisDescriptions = [];
      if (di.axisContemporaryTraditional != null) axisDescriptions.push(`  Contemporary ↔ Traditional: ${di.axisContemporaryTraditional} ${di.axisContemporaryTraditional <= 3 ? '(leans contemporary)' : di.axisContemporaryTraditional >= 7 ? '(leans traditional)' : '(balanced)'}`);
      if (di.axisMinimalLayered != null) axisDescriptions.push(`  Minimal ↔ Layered: ${di.axisMinimalLayered} ${di.axisMinimalLayered <= 3 ? '(leans minimal)' : di.axisMinimalLayered >= 7 ? '(leans layered)' : '(balanced)'}`);
      if (di.axisWarmCool != null) axisDescriptions.push(`  Warm ↔ Cool: ${di.axisWarmCool} ${di.axisWarmCool <= 3 ? '(cool)' : di.axisWarmCool >= 7 ? '(warm)' : '(neutral)'}`);
      if (di.axisOrganicGeometric != null) axisDescriptions.push(`  Organic ↔ Geometric: ${di.axisOrganicGeometric} ${di.axisOrganicGeometric <= 3 ? '(organic/natural)' : di.axisOrganicGeometric >= 7 ? '(geometric)' : '(balanced)'}`);
      if (di.axisRefinedEclectic != null) axisDescriptions.push(`  Refined ↔ Eclectic: ${di.axisRefinedEclectic} ${di.axisRefinedEclectic <= 3 ? '(refined)' : di.axisRefinedEclectic >= 7 ? '(eclectic)' : '(balanced)'}`);
      if (di.axisArchMinimalOrnate != null) axisDescriptions.push(`  Arch Minimal ↔ Ornate: ${di.axisArchMinimalOrnate} ${di.axisArchMinimalOrnate <= 3 ? '(minimal)' : di.axisArchMinimalOrnate >= 7 ? '(ornate)' : '(moderate)'}`);
      if (di.axisArchRegionalInternational != null) axisDescriptions.push(`  Regional ↔ International: ${di.axisArchRegionalInternational} ${di.axisArchRegionalInternational <= 3 ? '(regional/contextual)' : di.axisArchRegionalInternational >= 7 ? '(international)' : '(balanced)'}`);

      const sections = [];
      sections.push(`Project Location: ${profileData.projectCity || 'Not specified'}${profileData.state ? ', ' + profileData.state : ''}`);
      if (profileData.propertyType) sections.push(`Property Type: ${profileData.propertyType}`);
      if (profileData.targetGSF) sections.push(`Target Size: ${Number(profileData.targetGSF).toLocaleString()} SF`);
      if (profileData.totalBudget) sections.push(`Total Project Budget: $${Number(profileData.totalBudget).toLocaleString()}`);
      sections.push(`Budget Tier: ${budgetLabel}`);

      if (axisDescriptions.length > 0) {
        sections.push(`\nDesign Identity (Taste Axes — scale 1-10):\n${axisDescriptions.join('\n')}`);
      }

      if (di.architectureStyleTags?.length > 0) sections.push(`Architecture Style Tags: [${di.architectureStyleTags.join(', ')}]`);
      if (di.interiorStyleTags?.length > 0) sections.push(`Interior Style Tags: [${di.interiorStyleTags.join(', ')}]`);

      if (profileData.architecturalStyles) {
        const as = profileData.architecturalStyles;
        const primary = as.styles.find(s => s.isPrimary);
        const others = as.styles.filter(s => !s.isPrimary);
        sections.push(`\nArchitectural Style Spectrum Position: ${as.asPosition.toFixed(1)} / 9.0`);
        sections.push(`Primary Style: ${primary?.name || 'Unknown'} (${primary?.id || ''})`);
        sections.push(`Adjacent Styles: ${others.map(s => s.name + ' (' + s.id + ')').join(', ')}`);
        sections.push(`Source: ${as.source === 'taste_exploration' ? 'Taste Exploration (high confidence)' : 'KYC Slider (indicative)'}`);
      }

      if (di.materialAffinities?.length > 0) sections.push(`Material Affinities: [${di.materialAffinities.join(', ')}]`);
      if (di.materialAversions?.length > 0) sections.push(`Material Aversions: [${di.materialAversions.join(', ')}]`);
      if (di.massingPreference) sections.push(`Massing Preference: ${di.massingPreference}`);
      if (di.roofFormPreference) sections.push(`Roof Form: ${di.roofFormPreference}`);
      if (di.structuralAmbition) sections.push(`Structural Ambition: ${di.structuralAmbition}`);

      const lifestyleSignals = [];
      if (ls.entertainingFrequency) lifestyleSignals.push(`Entertaining: ${ls.entertainingFrequency}${ls.typicalGuestCount ? ', ' + ls.typicalGuestCount + ' guests' : ''}`);
      if (ls.wellnessPriorities?.length > 0) lifestyleSignals.push(`Wellness: ${ls.wellnessPriorities.join(', ')}`);
      if (ls.indoorOutdoorLiving) lifestyleSignals.push(`Indoor-Outdoor: ${ls.indoorOutdoorLiving}/10`);
      if (ls.privacyLevelRequired) lifestyleSignals.push(`Privacy: ${ls.privacyLevelRequired}/10`);
      if (lifestyleSignals.length > 0) {
        sections.push(`\nLifestyle Signals:\n  ${lifestyleSignals.join('\n  ')}`);
      }

      if (profileData.includedSpaces.length > 0) {
        sections.push(`\nSpace Program (from FYI):\n  Included: ${profileData.includedSpaces.join(', ')}`);
        if (profileData.targetGSF) sections.push(`  Target SF: ${Number(profileData.targetGSF).toLocaleString()}`);
      }

      let matchingPriority = `\n\nMATCHING PRIORITY:\nFind firms whose portfolio demonstrates ALIGNMENT with this specific client's\ndesign identity — not just the style keywords, but the full sensibility\n(warmth level, material language, massing approach, lifestyle integration).`;

      if (profileData.architecturalStyles) {
        const as = profileData.architecturalStyles;
        const primary = as.styles.find(s => s.isPrimary);
        const others = as.styles.filter(s => !s.isPrimary);
        matchingPriority += `\n\nARCHITECTURAL STYLE SPECTRUM MATCH (Critical):\nThe client's Taste Exploration places them at position ${as.asPosition.toFixed(1)} on the AS1–AS9 spectrum.\nPrimary style category: ${primary?.name} (${primary?.id})\nAdjacent categories: ${others.map(s => s.name + ' (' + s.id + ')').join(', ')}\nStrongly prefer firms whose built work falls within these three categories.\nDo NOT recommend firms primarily known for styles outside this range\n(e.g., do NOT suggest Classical or Heritage firms for a Contemporary client).`;
      }

      matchingPriority += `\nPrioritize firms with verified luxury residential experience at ${budgetLabel} scale${profileData.state ? '\nin the ' + profileData.state + ' region and surrounding areas' : ''}.`;

      enrichedContext = `\n\nENRICHED CLIENT CONTEXT (Profile-Aware Mode):\n${'—'.repeat(60)}\n${sections.join('\n')}${matchingPriority}`;
    }

    const systemPrompt = `You are a luxury residential consultant researcher for N4S (Not-4-Sale), an advisory platform serving ultra-high-net-worth families and family offices.

Your task is to identify real, verifiable ${disciplineLabel} firms matching these criteria:
- Geographic focus: ${geoFocus}
- Budget tier: ${budgetLabel}
- Style specialization: ${styleFocus}
- Number of results requested: ${limit}${enrichedContext}
${guidanceText}${exemplarBlock}${exclusionBlock}
For each firm, provide:
- firm_name (official business name — must be a real, verifiable firm)
- principal_name (lead partner/principal)
- hq_city (headquarters city)
- hq_state (headquarters state abbreviation, e.g., "CT", "NY")
- website (URL — must be a real URL you are confident exists)
- specialties (array of 3–5 style/specialty tags)
- service_areas (array of states where they actively work)
- years_experience (estimated years the firm has been operating)
- notable_projects (array of objects: [{name, location, year}] — real projects only)
- awards (array of objects: [{name, year}] — real awards only)
- publications (array of objects: [{publication, year}] — real publications only)
- estimated_budget_tier (one of: ultra_luxury, luxury, high_end, mid_range)
- confidence_score (0–100, your confidence this firm genuinely matches the criteria)
- source_rationale (1–2 sentences explaining why this firm was identified)

CRITICAL RULES:
1. Every firm MUST be real and verifiable. Do not fabricate firm names, projects, or awards.
2. If you cannot find ${limit} qualifying firms, return fewer. Quality over quantity.
3. Return ONLY a valid JSON array. No markdown, no backticks, no explanatory text.
4. Prioritize firms with demonstrated luxury residential experience.
5. Confidence scores: 90+ = perfect match, 70-89 = strong match, 50-69 = possible match, <50 = stretch.${useClientProfile ? '\n6. Weight firms that demonstrate alignment with the FULL client design identity above, not just keyword overlap.' : ''}`;

    // Call Anthropic API — MODEL IS CONFIG-DRIVEN
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': BYT_AI_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: aiModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Find ${limit} ${disciplineLabel} firms matching: Geographic focus: ${geoFocus}, Budget tier: ${budgetLabel}, Style: ${styleFocus}. Return only the JSON array.` }
        ],
      }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `AI API error: ${apiRes.status}`);
    }

    const apiResult = await apiRes.json();
    let textContent = (apiResult.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    textContent = textContent.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const candidates = JSON.parse(textContent);
    if (!Array.isArray(candidates)) throw new Error('AI returned invalid format');

    // =====================================================================
    // CONFIG-DRIVEN: Filter out excluded firms from AI results
    // =====================================================================
    const exclusionSet = new Set(exclusionList.map(f => f.toLowerCase()));
    const confidenceThreshold = effectiveConfig?.discovery?.confidenceThreshold ?? 0;

    const filteredCandidates = candidates.filter(c => {
      const firmLower = (c.firm_name || '').toLowerCase();
      if (exclusionSet.has(firmLower)) return false;
      for (const excluded of exclusionSet) {
        if (firmLower.includes(excluded) || excluded.includes(firmLower)) return false;
      }
      return true;
    });

    const excludedByFilter = candidates.length - filteredCandidates.length;

    // Save each candidate to backend
    const insertedCandidates = [];
    const duplicatesSkipped = [];
    const belowThreshold = [];

    for (const c of filteredCandidates) {
      const isBelowThreshold = confidenceThreshold > 0 && (c.confidence_score || 0) < confidenceThreshold;
      if (isBelowThreshold) belowThreshold.push(c.firm_name);

      const candidateData = {
        project_id: criteria.project_id || null,
        discipline,
        firm_name: c.firm_name || 'Unknown',
        principal_name: c.principal_name || null,
        hq_city: c.hq_city || null,
        hq_state: c.hq_state || null,
        hq_country: 'USA',
        website: c.website || null,
        specialties: c.specialties || [],
        service_areas: c.service_areas || [],
        estimated_budget_tier: c.estimated_budget_tier || budgetTier,
        years_experience: c.years_experience || null,
        notable_projects: c.notable_projects || [],
        awards: c.awards || [],
        publications: c.publications || [],
        source_tier: 3,
        source_type: 'ai_discovery',
        source_url: c.website || null,
        source_name: `Claude (${aiModel})`,
        discovery_query: discoveryQuery,
        confidence_score: c.confidence_score || null,
        source_rationale: c.source_rationale || null,
        discovered_by: 'LRA Team',
        project_context: criteria.projectContext || null,
      };

      try {
        const saveRes = await fetch(`${API_BASE}/gid.php?entity=discovery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(candidateData),
        });
        const saveData = await saveRes.json();
        if (saveData.warning) {
          duplicatesSkipped.push(c.firm_name + (saveData.warning === 'already_in_registry' ? ' (already in registry)' : ''));
        } else if (saveData.id) {
          insertedCandidates.push({ ...candidateData, id: saveData.id, status: 'pending' });
        }
      } catch (err) {
        console.error('[BYT Discovery] Save candidate error:', c.firm_name, err);
      }
    }

    return {
      success: true,
      candidates: insertedCandidates,
      inserted: insertedCandidates.length,
      duplicates_skipped: duplicatesSkipped,
      excluded_by_filter: excludedByFilter,
      below_threshold: belowThreshold,
      query: discoveryQuery,
      model_used: aiModel,
    };
  },
};

// ============================================================================
// SUB-MODE TAB BAR
// ============================================================================

const SubModeTabs = ({ subMode, setSubMode, queueStats }) => {
  const queueCount = queueStats?.queue || 0;

  return (
    <div className="byt-discovery-subtabs">
      <button
        className={`byt-discovery-subtab ${subMode === 'manual' ? 'byt-discovery-subtab--active' : ''}`}
        onClick={() => setSubMode('manual')}
      >
        <Search size={14} />
        Manual Search
      </button>
      <button
        className={`byt-discovery-subtab ${subMode === 'ai' ? 'byt-discovery-subtab--active' : ''}`}
        onClick={() => setSubMode('ai')}
      >
        <Zap size={14} />
        AI Discovery
      </button>
      <button
        className={`byt-discovery-subtab ${subMode === 'queue' ? 'byt-discovery-subtab--active' : ''}`}
        onClick={() => setSubMode('queue')}
      >
        <Inbox size={14} />
        Import Queue
        {queueCount > 0 && <span className="byt-queue-badge">{queueCount}</span>}
      </button>
    </div>
  );
};

// ============================================================================
// MANUAL SEARCH PANEL
// ============================================================================

const ManualSearchPanel = ({ onQuickAdd }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchDiscipline, setSearchDiscipline] = useState('');

  return (
    <div className="byt-discovery-manual">
      <div className="byt-discovery-manual__info">
        <h3>Manual Consultant Search</h3>
        <p>Use this to quickly add a consultant you already know about. Enter their details and they'll be added directly to the Registry via the Add Consultant form.</p>
      </div>

      <div className="byt-discovery-manual__form">
        <div className="byt-discovery-manual__row">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Firm name or principal name..."
            className="byt-discovery-manual__input"
          />
          <select
            value={searchDiscipline}
            onChange={(e) => setSearchDiscipline(e.target.value)}
            className="byt-filter-select"
          >
            <option value="">All Disciplines</option>
            <option value="architect">Architect</option>
            <option value="interior_designer">Interior Designer</option>
            <option value="pm">Project Manager</option>
            <option value="gc">General Contractor</option>
          </select>
        </div>

        <button
          className="byt-btn byt-btn--primary"
          onClick={() => onQuickAdd({
            firm_name: searchInput,
            role: searchDiscipline || 'architect',
          })}
          disabled={!searchInput.trim()}
        >
          <Users size={14} />
          Quick Add to Registry
        </button>
      </div>

      <div className="byt-discovery-manual__tips">
        <h4>Discovery Tips</h4>
        <p>For comprehensive discovery, use the <strong>AI Discovery</strong> tab to find qualified firms based on your project criteria. The AI will search for real, verifiable firms and provide confidence scores.</p>
        <p>For known firms, use <strong>Quick Add</strong> above to go directly to the Add Consultant form with pre-filled information.</p>
      </div>
    </div>
  );
};

// ============================================================================
// QUEUE FILTER BAR
// ============================================================================

const QueueFilterBar = ({ statusFilter, setStatusFilter, disciplineFilter, setDisciplineFilter, queueStats }) => (
  <div className="byt-discovery-filters">
    <div className="byt-discovery-filters__group">
      <label>Status:</label>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="byt-filter-select">
        <option value="pending,reviewing,approved">Queue (active)</option>
        <option value="pending">Pending ({queueStats?.pending || 0})</option>
        <option value="reviewing">Reviewing ({queueStats?.reviewing || 0})</option>
        <option value="approved">Approved ({queueStats?.approved || 0})</option>
        <option value="dismissed">Dismissed ({queueStats?.dismissed || 0})</option>
        <option value="imported">Imported ({queueStats?.imported || 0})</option>
        <option value="">All</option>
      </select>
    </div>
    <div className="byt-discovery-filters__group">
      <label>Discipline:</label>
      <select value={disciplineFilter} onChange={(e) => setDisciplineFilter(e.target.value)} className="byt-filter-select">
        <option value="">All</option>
        <option value="architect">Architects</option>
        <option value="interior_designer">Interior Designers</option>
        <option value="pm">Project Managers</option>
        <option value="gc">General Contractors</option>
      </select>
    </div>
  </div>
);

// ============================================================================
// BATCH ACTIONS BAR
// ============================================================================

const BatchActionsBar = ({ selectedCount, onBatchApprove, onBatchDismiss, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="byt-batch-actions">
      <span className="byt-batch-actions__count">{selectedCount} selected</span>
      <div className="byt-batch-actions__buttons">
        <button className="byt-btn byt-btn--success-sm" onClick={onBatchApprove}>
          <Check size={14} /> Approve All
        </button>
        <button className="byt-btn byt-btn--ghost byt-btn--danger" onClick={onBatchDismiss}>
          <X size={14} /> Dismiss All
        </button>
        <button className="byt-btn byt-btn--ghost" onClick={onClearSelection}>
          Clear
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DISCOVERY SCREEN
// ============================================================================

const BYTDiscoveryScreen = ({ onImportComplete, onQuickAdd }) => {
  const { kycData, fyiData, activeProjectId } = useAppContext();

  // CONFIG WIRING: Load resolved configuration
  const { config: effectiveConfig } = useBYTConfig();

  // Sub-mode
  const [subMode, setSubMode] = useState('ai');

  // Data state
  const [candidates, setCandidates] = useState([]);
  const [queueStats, setQueueStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI search state
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Queue filters
  const [statusFilter, setStatusFilter] = useState('pending,reviewing,approved');
  const [disciplineFilter, setDisciplineFilter] = useState('');

  // Selection for batch operations
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Load queue stats (project-scoped)
  const loadQueueStats = useCallback(async () => {
    try {
      const stats = await discoveryApi.fetchQueueStats(activeProjectId);
      setQueueStats(stats);
    } catch (err) {
      console.error('[BYT Discovery] Stats error:', err);
    }
  }, [activeProjectId]);

  // Load candidates for queue (project-scoped)
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (activeProjectId) filters.project_id = activeProjectId;
      if (statusFilter) filters.status = statusFilter;
      if (disciplineFilter) filters.discipline = disciplineFilter;
      const data = await discoveryApi.fetchCandidates(filters);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('[BYT Discovery] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, disciplineFilter, activeProjectId]);

  useEffect(() => { loadQueueStats(); }, [loadQueueStats]);

  useEffect(() => {
    if (subMode === 'queue') loadCandidates();
  }, [subMode, statusFilter, disciplineFilter, loadCandidates]);

  // Handlers
  const handleAISearch = useCallback(async (criteria) => {
    setAiSearching(true);
    setError(null);
    setAiResults(null);
    try {
      // CONFIG WIRING: Pass effective config to runAISearch
      const result = await discoveryApi.runAISearch(
        { ...criteria, project_id: activeProjectId },
        effectiveConfig
      );
      setAiResults(result);

      setRecentSearches(prev => [{
        ...criteria,
        query: result.query,
        resultCount: result.inserted,
        modelUsed: result.model_used,
        timestamp: Date.now(),
      }, ...prev].slice(0, 5));

      loadQueueStats();
    } catch (err) {
      console.error('[BYT Discovery] AI search error:', err);
      setError(err.message);
    } finally {
      setAiSearching(false);
    }
  }, [loadQueueStats, activeProjectId, effectiveConfig]);

  const handleApprove = useCallback(async (candidate) => {
    try {
      await discoveryApi.reviewCandidate(candidate.id, 'approved');
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'approved' } : c));
      if (aiResults?.candidates) {
        setAiResults(prev => ({
          ...prev,
          candidates: prev.candidates.map(c => c.id === candidate.id ? { ...c, status: 'approved' } : c),
        }));
      }
      loadQueueStats();
    } catch (err) {
      console.error('[BYT Discovery] Approve error:', err);
      alert('Failed to approve: ' + err.message);
    }
  }, [aiResults, loadQueueStats]);

  const handleDismiss = useCallback(async (candidate) => {
    const notes = window.prompt('Dismissal notes (optional):');
    if (notes === null) return;
    try {
      await discoveryApi.reviewCandidate(candidate.id, 'dismissed', notes);
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'dismissed' } : c));
      if (aiResults?.candidates) {
        setAiResults(prev => ({
          ...prev,
          candidates: prev.candidates.map(c => c.id === candidate.id ? { ...c, status: 'dismissed' } : c),
        }));
      }
      loadQueueStats();
    } catch (err) {
      console.error('[BYT Discovery] Dismiss error:', err);
      alert('Failed to dismiss: ' + err.message);
    }
  }, [aiResults, loadQueueStats]);

  const handleImport = useCallback(async (candidate) => {
    if (!window.confirm(`Import "${candidate.firm_name}" to the BYT Registry?`)) return;
    try {
      const result = await discoveryApi.importCandidate(candidate.id, activeProjectId);
      setCandidates(prev => prev.map(c =>
        c.id === candidate.id ? { ...c, status: 'imported', imported_consultant_id: result.consultant_id } : c
      ));
      loadQueueStats();
      if (onImportComplete) onImportComplete();
    } catch (err) {
      console.error('[BYT Discovery] Import error:', err);
      alert('Failed to import: ' + err.message);
    }
  }, [loadQueueStats, onImportComplete, activeProjectId]);

  const handleSelectCandidate = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBatchApprove = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await discoveryApi.batchReview(ids, 'approved');
      setCandidates(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'approved' } : c));
      setSelectedIds(new Set());
      loadQueueStats();
    } catch (err) {
      alert('Batch approve failed: ' + err.message);
    }
  }, [selectedIds, loadQueueStats]);

  const handleBatchDismiss = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await discoveryApi.batchReview(ids, 'dismissed');
      setCandidates(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'dismissed' } : c));
      setSelectedIds(new Set());
      loadQueueStats();
    } catch (err) {
      alert('Batch dismiss failed: ' + err.message);
    }
  }, [selectedIds, loadQueueStats]);

  // CONFIG-DRIVEN: confidence threshold for display
  const confidenceThreshold = effectiveConfig?.discovery?.confidenceThreshold ?? 0;

  return (
    <div className="byt-discovery">
      <SubModeTabs subMode={subMode} setSubMode={setSubMode} queueStats={queueStats} />

      {error && (
        <div className="byt-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button className="byt-btn byt-btn--ghost" onClick={() => setError(null)}>
            <X size={14} /> Dismiss
          </button>
        </div>
      )}

      {subMode === 'manual' && (
        <ManualSearchPanel onQuickAdd={onQuickAdd} />
      )}

      {subMode === 'ai' && (
        <div className="byt-discovery-ai">
          <AIDiscoveryForm
            onSearch={handleAISearch}
            isSearching={aiSearching}
            recentSearches={recentSearches}
            kycData={kycData}
            fyiData={fyiData}
          />

          {aiResults && (
            <div className="byt-discovery-ai__results">
              <div className="byt-discovery-ai__results-header">
                <h3>
                  Discovery Results
                  <span className="byt-discovery-ai__results-count">
                    {aiResults.inserted} new candidate{aiResults.inserted !== 1 ? 's' : ''} found
                  </span>
                </h3>
                {/* CONFIG WIRING: Show model + filter metadata */}
                {aiResults.model_used && (
                  <p style={{ fontSize: 11, color: '#6b6b6b', margin: '2px 0 0' }}>
                    Model: {aiResults.model_used}
                    {aiResults.excluded_by_filter > 0 && (
                      <span style={{ color: '#d32f2f', marginLeft: 8 }}>
                        · {aiResults.excluded_by_filter} excluded (exclusion list)
                      </span>
                    )}
                    {aiResults.below_threshold?.length > 0 && (
                      <span style={{ color: '#f57c00', marginLeft: 8 }}>
                        · {aiResults.below_threshold.length} below confidence threshold ({confidenceThreshold})
                      </span>
                    )}
                  </p>
                )}
                {aiResults.duplicates_skipped?.length > 0 && (
                  <p className="byt-discovery-ai__duplicates">
                    {aiResults.duplicates_skipped.length} duplicate{aiResults.duplicates_skipped.length !== 1 ? 's' : ''} skipped: {aiResults.duplicates_skipped.join(', ')}
                  </p>
                )}
              </div>

              {(aiResults.candidates || []).length === 0 && (
                <div className="byt-empty byt-empty--compact">
                  <p>No new candidates found. Try broadening your criteria.</p>
                </div>
              )}

              <div className="byt-candidate-grid">
                {(aiResults.candidates || []).map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onApprove={handleApprove}
                    onDismiss={handleDismiss}
                    onImport={handleImport}
                    confidenceThreshold={confidenceThreshold}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subMode === 'queue' && (
        <div className="byt-discovery-queue">
          <QueueFilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            disciplineFilter={disciplineFilter}
            setDisciplineFilter={setDisciplineFilter}
            queueStats={queueStats}
          />

          <BatchActionsBar
            selectedCount={selectedIds.size}
            onBatchApprove={handleBatchApprove}
            onBatchDismiss={handleBatchDismiss}
            onClearSelection={() => setSelectedIds(new Set())}
          />

          {loading && (
            <div className="byt-loading">
              <RefreshCw size={24} className="spinning" />
              <p>Loading discovery queue...</p>
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div className="byt-empty">
              <Inbox size={48} />
              <h3>Import Queue Empty</h3>
              <p>Run an AI Discovery search to find consultant candidates, or add candidates manually.</p>
              <button className="byt-btn byt-btn--primary" onClick={() => setSubMode('ai')}>
                <Zap size={16} /> Start AI Discovery
              </button>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <>
              <div className="byt-discovery-queue__summary">
                Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                <button className="byt-btn byt-btn--ghost" onClick={loadCandidates}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <div className="byt-candidate-grid">
                {candidates.map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selected={selectedIds.has(candidate.id)}
                    onSelect={handleSelectCandidate}
                    onApprove={handleApprove}
                    onDismiss={handleDismiss}
                    onImport={handleImport}
                    confidenceThreshold={confidenceThreshold}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BYTDiscoveryScreen;
