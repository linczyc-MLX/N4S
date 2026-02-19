/**
 * GIDDiscoveryScreen.jsx — Discovery Screen (Phase 3)
 *
 * AI-assisted consultant sourcing tool with three sub-modes:
 * 1. Manual Search — Quick lookup + pre-fill AddConsultantForm
 * 2. AI Discovery — Criteria-based AI search using Claude
 * 3. Import Queue — Review, approve, and import candidates to registry
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Search, Zap, Inbox, RefreshCw, AlertTriangle, Filter, Check, X,
  Upload, Trash2, ChevronDown, Eye, Users, MapPin, Globe,
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import CandidateCard from '../components/CandidateCard';
import AIDiscoveryForm from '../components/AIDiscoveryForm';

// API base
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';

// AI key (loaded once from server, cached)
let GID_AI_KEY = null;
async function getAIKey() {
  if (GID_AI_KEY) return GID_AI_KEY;
  const res = await fetch(`${API_BASE}/gid-ai-config.php`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load AI configuration');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  GID_AI_KEY = data.key;
  return GID_AI_KEY;
}

// ============================================================================
// API HELPERS
// ============================================================================

const discoveryApi = {
  async fetchCandidates(filters = {}) {
    const params = new URLSearchParams({ entity: 'discovery', ...filters });
    const res = await fetch(`${API_BASE}/gid.php?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async fetchQueueStats() {
    const res = await fetch(`${API_BASE}/gid.php?entity=discovery&action=queue_stats`, { credentials: 'include' });
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

  async importCandidate(id) {
    const res = await fetch(`${API_BASE}/gid.php?entity=discovery&id=${id}&action=import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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

  async runAISearch(criteria) {
    // Load API key from server
    await getAIKey();

    const { discipline, states, budgetTier, styleKeywords, limit } = criteria;

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
    const discoveryQuery = `Find ${limit} ${disciplineLabel} firms | Geo: ${geoFocus} | Budget: ${budgetLabel} | Style: ${styleFocus}`;

    const systemPrompt = `You are a luxury residential consultant researcher for N4S (Not-4-Sale), an advisory platform serving ultra-high-net-worth families and family offices.

Your task is to identify real, verifiable ${disciplineLabel} firms matching these criteria:
- Geographic focus: ${geoFocus}
- Budget tier: ${budgetLabel}
- Style specialization: ${styleFocus}
- Number of results requested: ${limit}

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
5. Confidence scores: 90+ = perfect match, 70-89 = strong match, 50-69 = possible match, <50 = stretch.`;

    // Call Anthropic API client-side
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GID_AI_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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

    // Strip markdown fencing if present
    textContent = textContent.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const candidates = JSON.parse(textContent);
    if (!Array.isArray(candidates)) throw new Error('AI returned invalid format');

    // Save each candidate to backend
    const insertedCandidates = [];
    const duplicatesSkipped = [];

    for (const c of candidates) {
      const candidateData = {
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
        source_name: 'Claude Sonnet',
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
        console.error('[GID Discovery] Save candidate error:', c.firm_name, err);
      }
    }

    return {
      success: true,
      candidates: insertedCandidates,
      inserted: insertedCandidates.length,
      duplicates_skipped: duplicatesSkipped,
      query: discoveryQuery,
    };
  },
};

// ============================================================================
// SUB-MODE TAB BAR
// ============================================================================

const SubModeTabs = ({ subMode, setSubMode, queueStats }) => {
  const queueCount = queueStats?.queue || 0;

  return (
    <div className="gid-discovery-subtabs">
      <button
        className={`gid-discovery-subtab ${subMode === 'manual' ? 'gid-discovery-subtab--active' : ''}`}
        onClick={() => setSubMode('manual')}
      >
        <Search size={14} />
        Manual Search
      </button>
      <button
        className={`gid-discovery-subtab ${subMode === 'ai' ? 'gid-discovery-subtab--active' : ''}`}
        onClick={() => setSubMode('ai')}
      >
        <Zap size={14} />
        AI Discovery
      </button>
      <button
        className={`gid-discovery-subtab ${subMode === 'queue' ? 'gid-discovery-subtab--active' : ''}`}
        onClick={() => setSubMode('queue')}
      >
        <Inbox size={14} />
        Import Queue
        {queueCount > 0 && <span className="gid-queue-badge">{queueCount}</span>}
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
    <div className="gid-discovery-manual">
      <div className="gid-discovery-manual__info">
        <h3>Manual Consultant Search</h3>
        <p>Use this to quickly add a consultant you already know about. Enter their details and they'll be added directly to the Registry via the Add Consultant form.</p>
      </div>

      <div className="gid-discovery-manual__form">
        <div className="gid-discovery-manual__row">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Firm name or principal name..."
            className="gid-discovery-manual__input"
          />
          <select
            value={searchDiscipline}
            onChange={(e) => setSearchDiscipline(e.target.value)}
            className="gid-filter-select"
          >
            <option value="">All Disciplines</option>
            <option value="architect">Architect</option>
            <option value="interior_designer">Interior Designer</option>
            <option value="pm">Project Manager</option>
            <option value="gc">General Contractor</option>
          </select>
        </div>

        <button
          className="gid-btn gid-btn--primary"
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

      <div className="gid-discovery-manual__tips">
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
  <div className="gid-discovery-filters">
    <div className="gid-discovery-filters__group">
      <label>Status:</label>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="gid-filter-select">
        <option value="pending,reviewing,approved">Queue (active)</option>
        <option value="pending">Pending ({queueStats?.pending || 0})</option>
        <option value="reviewing">Reviewing ({queueStats?.reviewing || 0})</option>
        <option value="approved">Approved ({queueStats?.approved || 0})</option>
        <option value="dismissed">Dismissed ({queueStats?.dismissed || 0})</option>
        <option value="imported">Imported ({queueStats?.imported || 0})</option>
        <option value="">All</option>
      </select>
    </div>
    <div className="gid-discovery-filters__group">
      <label>Discipline:</label>
      <select value={disciplineFilter} onChange={(e) => setDisciplineFilter(e.target.value)} className="gid-filter-select">
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
    <div className="gid-batch-actions">
      <span className="gid-batch-actions__count">{selectedCount} selected</span>
      <div className="gid-batch-actions__buttons">
        <button className="gid-btn gid-btn--success-sm" onClick={onBatchApprove}>
          <Check size={14} /> Approve All
        </button>
        <button className="gid-btn gid-btn--ghost gid-btn--danger" onClick={onBatchDismiss}>
          <X size={14} /> Dismiss All
        </button>
        <button className="gid-btn gid-btn--ghost" onClick={onClearSelection}>
          Clear
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DISCOVERY SCREEN
// ============================================================================

const GIDDiscoveryScreen = ({ onImportComplete, onQuickAdd }) => {
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

  // Load queue stats
  const loadQueueStats = useCallback(async () => {
    try {
      const stats = await discoveryApi.fetchQueueStats();
      setQueueStats(stats);
    } catch (err) {
      console.error('[GID Discovery] Stats error:', err);
    }
  }, []);

  // Load candidates for queue
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (disciplineFilter) filters.discipline = disciplineFilter;
      const data = await discoveryApi.fetchCandidates(filters);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('[GID Discovery] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, disciplineFilter]);

  // Initial load
  useEffect(() => {
    loadQueueStats();
  }, [loadQueueStats]);

  // Load candidates when switching to queue or changing filters
  useEffect(() => {
    if (subMode === 'queue') {
      loadCandidates();
    }
  }, [subMode, statusFilter, disciplineFilter, loadCandidates]);

  // Handlers
  const handleAISearch = useCallback(async (criteria) => {
    setAiSearching(true);
    setError(null);
    setAiResults(null);
    try {
      const result = await discoveryApi.runAISearch(criteria);
      setAiResults(result);

      // Track recent search
      setRecentSearches(prev => [{
        ...criteria,
        query: result.query,
        resultCount: result.inserted,
        timestamp: Date.now(),
      }, ...prev].slice(0, 5));

      // Refresh queue stats
      loadQueueStats();
    } catch (err) {
      console.error('[GID Discovery] AI search error:', err);
      setError(err.message);
    } finally {
      setAiSearching(false);
    }
  }, [loadQueueStats]);

  const handleApprove = useCallback(async (candidate) => {
    try {
      await discoveryApi.reviewCandidate(candidate.id, 'approved');
      // Update local state
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'approved' } : c));
      if (aiResults?.candidates) {
        setAiResults(prev => ({
          ...prev,
          candidates: prev.candidates.map(c => c.id === candidate.id ? { ...c, status: 'approved' } : c),
        }));
      }
      loadQueueStats();
    } catch (err) {
      console.error('[GID Discovery] Approve error:', err);
      alert('Failed to approve: ' + err.message);
    }
  }, [aiResults, loadQueueStats]);

  const handleDismiss = useCallback(async (candidate) => {
    const notes = window.prompt('Dismissal notes (optional):');
    if (notes === null) return; // cancelled
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
      console.error('[GID Discovery] Dismiss error:', err);
      alert('Failed to dismiss: ' + err.message);
    }
  }, [aiResults, loadQueueStats]);

  const handleImport = useCallback(async (candidate) => {
    if (!window.confirm(`Import "${candidate.firm_name}" to the GID Registry?`)) return;
    try {
      const result = await discoveryApi.importCandidate(candidate.id);
      setCandidates(prev => prev.map(c =>
        c.id === candidate.id ? { ...c, status: 'imported', imported_consultant_id: result.consultant_id } : c
      ));
      loadQueueStats();
      if (onImportComplete) onImportComplete();
    } catch (err) {
      console.error('[GID Discovery] Import error:', err);
      alert('Failed to import: ' + err.message);
    }
  }, [loadQueueStats, onImportComplete]);

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

  return (
    <div className="gid-discovery">
      <SubModeTabs subMode={subMode} setSubMode={setSubMode} queueStats={queueStats} />

      {/* Error display */}
      {error && (
        <div className="gid-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button className="gid-btn gid-btn--ghost" onClick={() => setError(null)}>
            <X size={14} /> Dismiss
          </button>
        </div>
      )}

      {/* Manual Search */}
      {subMode === 'manual' && (
        <ManualSearchPanel onQuickAdd={onQuickAdd} />
      )}

      {/* AI Discovery */}
      {subMode === 'ai' && (
        <div className="gid-discovery-ai">
          <AIDiscoveryForm
            onSearch={handleAISearch}
            isSearching={aiSearching}
            recentSearches={recentSearches}
          />

          {/* AI Results */}
          {aiResults && (
            <div className="gid-discovery-ai__results">
              <div className="gid-discovery-ai__results-header">
                <h3>
                  Discovery Results
                  <span className="gid-discovery-ai__results-count">
                    {aiResults.inserted} new candidate{aiResults.inserted !== 1 ? 's' : ''} found
                  </span>
                </h3>
                {aiResults.duplicates_skipped?.length > 0 && (
                  <p className="gid-discovery-ai__duplicates">
                    {aiResults.duplicates_skipped.length} duplicate{aiResults.duplicates_skipped.length !== 1 ? 's' : ''} skipped: {aiResults.duplicates_skipped.join(', ')}
                  </p>
                )}
              </div>

              {(aiResults.candidates || []).length === 0 && (
                <div className="gid-empty gid-empty--compact">
                  <p>No new candidates found. Try broadening your criteria.</p>
                </div>
              )}

              <div className="gid-candidate-grid">
                {(aiResults.candidates || []).map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onApprove={handleApprove}
                    onDismiss={handleDismiss}
                    onImport={handleImport}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Queue */}
      {subMode === 'queue' && (
        <div className="gid-discovery-queue">
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
            <div className="gid-loading">
              <RefreshCw size={24} className="spinning" />
              <p>Loading discovery queue...</p>
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div className="gid-empty">
              <Inbox size={48} />
              <h3>Import Queue Empty</h3>
              <p>Run an AI Discovery search to find consultant candidates, or add candidates manually.</p>
              <button className="gid-btn gid-btn--primary" onClick={() => setSubMode('ai')}>
                <Zap size={16} /> Start AI Discovery
              </button>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <>
              <div className="gid-discovery-queue__summary">
                Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                <button className="gid-btn gid-btn--ghost" onClick={loadCandidates}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <div className="gid-candidate-grid">
                {candidates.map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selected={selectedIds.has(candidate.id)}
                    onSelect={handleSelectCandidate}
                    onApprove={handleApprove}
                    onDismiss={handleDismiss}
                    onImport={handleImport}
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

export default GIDDiscoveryScreen;
