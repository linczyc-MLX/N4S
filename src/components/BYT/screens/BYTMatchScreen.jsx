/**
 * BYTMatchScreen.jsx — Matchmaking Screen
 *
 * Phase 2 of BYT module. Allows LRA team to:
 * 1. Select a discipline (Architect / ID / PM / GC)
 * 2. See prerequisite gate status
 * 3. Run the matching algorithm against the consultant registry
 * 4. View ranked results with dual scores and breakdowns
 * 5. Compare 2-3 consultants side by side
 * 6. Shortlist top picks (creates gid_engagements records)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Target, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Users, MapPin, Briefcase, Star, Eye, Plus, Minus, Award, X,
  Filter as FilterIcon, ArrowRight, Check, Clock, Zap,
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import { MatchScoreInline, MatchScoreExpanded, MatchComparisonTable } from '../components/MatchScoreBreakdown';
import { checkMatchPrerequisites, runMatching, MATCH_TIERS, SCORING_DIMENSIONS } from '../utils/matchingAlgorithm';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  warmEarth: '#D4A574',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
};

const DISCIPLINES = {
  architect:          { label: 'Architect',          color: '#315098', icon: '🏛' },
  interior_designer:  { label: 'Interior Designer',  color: '#8CA8BE', icon: '🎨' },
  pm:                 { label: 'Project Manager',    color: '#AFBDB0', icon: '📋' },
  gc:                 { label: 'General Contractor', color: '#C4A484', icon: '🔨' },
};

// API base URL
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';


// =============================================================================
// PREREQUISITE GATES PANEL
// =============================================================================

const PrerequisiteGates = ({ prerequisites }) => {
  if (!prerequisites) return null;

  return (
    <div className="byt-match-prereqs">
      <div className="byt-match-prereqs__header">
        <h3 className="byt-match-prereqs__title">
          {prerequisites.ready
            ? <><CheckCircle2 size={16} style={{ color: COLORS.success }} /> Ready to Match</>
            : <><AlertTriangle size={16} style={{ color: COLORS.warning }} /> Prerequisites Needed</>
          }
        </h3>
        <span className="byt-match-prereqs__completeness">
          {prerequisites.completeness}% data available
        </span>
      </div>

      <div className="byt-match-prereqs__gates">
        {prerequisites.gates.map((gate) => (
          <div
            key={gate.field}
            className={`byt-match-prereq-item ${gate.filled ? 'byt-match-prereq-item--filled' : ''} ${gate.required ? 'byt-match-prereq-item--required' : ''}`}
          >
            <span className="byt-match-prereq-item__icon">
              {gate.filled
                ? <CheckCircle2 size={14} style={{ color: COLORS.success }} />
                : gate.required
                  ? <AlertTriangle size={14} style={{ color: COLORS.error }} />
                  : <Clock size={14} style={{ color: COLORS.textMuted }} />
              }
            </span>
            <span className="byt-match-prereq-item__label">{gate.label}</span>
            <span className="byt-match-prereq-item__source">{gate.source}</span>
            {gate.required && !gate.filled && (
              <span className="byt-match-prereq-item__required-badge">Required</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


// =============================================================================
// MATCH RESULT CARD
// =============================================================================

const MatchResultCard = ({
  matchResult, consultant, rank, isSelected, isComparing, isShortlisted,
  onToggleCompare, onShortlist, onViewDetail, onExpandScore,
}) => {
  const [expanded, setExpanded] = useState(false);
  // Use consultant prop if available, fall back to embedded snapshot
  const c = consultant || matchResult?.consultantSnapshot || {};
  const discipline = DISCIPLINES[c?.role] || {};

  return (
    <div className={`byt-match-result-card ${isSelected ? 'byt-match-result-card--selected' : ''} ${isShortlisted ? 'byt-match-result-card--shortlisted' : ''}`}>
      {/* Rank badge */}
      <div className="byt-match-result-card__rank" style={{ backgroundColor: matchResult.tierBgColor, color: matchResult.tierColor }}>
        #{rank}
      </div>

      <div className="byt-match-result-card__content">
        {/* Header row */}
        <div className="byt-match-result-card__header">
          <div className="byt-match-result-card__info">
            <h3 className="byt-match-result-card__firm">{c?.firm_name}</h3>
            {(c?.first_name || c?.last_name) && (
              <p className="byt-match-result-card__name">
                {c?.first_name} {c?.last_name}
              </p>
            )}
            <div className="byt-match-result-card__meta">
              {c?.hq_city && (
                <span className="byt-meta-item">
                  <MapPin size={12} />
                  {c.hq_city}{c.hq_state ? `, ${c.hq_state}` : ''}
                </span>
              )}
              {c?.years_experience && (
                <span className="byt-meta-item">
                  <Briefcase size={12} />
                  {c.years_experience} yrs
                </span>
              )}
              {c?.avg_rating > 0 && (
                <span className="byt-meta-item">
                  <Star size={12} />
                  {Number(c.avg_rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Inline scores */}
          <MatchScoreInline matchResult={matchResult} />
        </div>

        {/* Specialty tags */}
        {c?.specialties?.length > 0 && (
          <div className="byt-match-result-card__tags">
            {c.specialties.slice(0, 5).map((s, i) => (
              <span key={i} className="byt-tag">{s}</span>
            ))}
            {c.specialties.length > 5 && (
              <span className="byt-tag byt-tag--more">+{c.specialties.length - 5}</span>
            )}
          </div>
        )}

        {/* Expanded breakdown */}
        {expanded && (
          <div className="byt-match-result-card__expanded">
            <MatchScoreExpanded matchResult={matchResult} showWeights />
          </div>
        )}

        {/* Actions */}
        <div className="byt-match-result-card__actions">
          <button
            className="byt-btn byt-btn--ghost byt-btn--sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Breakdown' : 'Score Breakdown'}
          </button>

          <button
            className={`byt-btn byt-btn--sm ${isComparing ? 'byt-btn--active' : 'byt-btn--ghost'}`}
            onClick={() => onToggleCompare(matchResult.consultantId)}
            title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isComparing ? <Minus size={14} /> : <Plus size={14} />}
            Compare
          </button>

          <button
            className={`byt-btn byt-btn--sm ${isShortlisted ? 'byt-btn--success' : 'byt-btn--primary'}`}
            onClick={() => onShortlist(matchResult)}
            disabled={isShortlisted}
          >
            {isShortlisted ? <Check size={14} /> : <ArrowRight size={14} />}
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </button>
        </div>
      </div>
    </div>
  );
};


// =============================================================================
// MAIN MATCH SCREEN
// =============================================================================

const BYTMatchScreen = () => {
  const { kycData, fyiData, bytData, updateBYTData, activeProjectId } = useAppContext();

  // State
  const [selectedDiscipline, setSelectedDiscipline] = useState('architect');
  const [matchResults, setMatchResults] = useState([]);
  const [allConsultants, setAllConsultants] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState(null);

  // Comparison selection (max 3)
  const [compareIds, setCompareIds] = useState([]);

  // Shortlisted consultant IDs for this discipline
  const [shortlistedIds, setShortlistedIds] = useState(new Set());

  // Filter
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Check prerequisites
  const prerequisites = useMemo(
    () => checkMatchPrerequisites(kycData, fyiData),
    [kycData, fyiData]
  );

  // Load existing match results from bytData if available
  useEffect(() => {
    const existing = bytData?.currentMatches?.[selectedDiscipline];
    if (existing && existing.length > 0) {
      setMatchResults(existing);
      setHasRun(true);
    } else {
      setMatchResults([]);
      setHasRun(false);
    }
    setCompareIds([]);
  }, [selectedDiscipline, bytData?.currentMatches]);

  // Load existing shortlisted IDs
  useEffect(() => {
    const engagements = bytData?.engagements || [];
    const ids = new Set(
      engagements
        .filter(e => e.discipline === selectedDiscipline)
        .map(e => e.consultantId)
    );
    setShortlistedIds(ids);
  }, [selectedDiscipline, bytData?.engagements]);

  // --------------------------------------------------
  // Run matching
  // --------------------------------------------------
  const handleRunMatch = useCallback(async () => {
    if (!prerequisites.ready) return;

    setIsRunning(true);
    setError(null);

    try {
      // Fetch all consultants for the discipline (with portfolio)
      const params = new URLSearchParams({ entity: 'consultants', role: selectedDiscipline });
      const res = await fetch(`${API_BASE}/gid.php?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const consultants = data.consultants || [];

      if (consultants.length === 0) {
        setError(`No ${DISCIPLINES[selectedDiscipline]?.label || selectedDiscipline} consultants in registry. Add some first.`);
        setIsRunning(false);
        return;
      }

      // For each consultant, fetch full detail (includes portfolio for feature scoring)
      const fullConsultants = await Promise.all(
        consultants.map(async (c) => {
          try {
            const detailRes = await fetch(`${API_BASE}/gid.php?entity=consultants&id=${c.id}`, { credentials: 'include' });
            if (detailRes.ok) return detailRes.json();
          } catch { /* fall through */ }
          return c; // Fallback to list data
        })
      );

      setAllConsultants(fullConsultants);

      // Run matching algorithm
      const results = runMatching(fullConsultants, selectedDiscipline, kycData, fyiData, { minScore });

      setMatchResults(results);
      setHasRun(true);

      // Persist to AppContext (merge with existing disciplines)
      updateBYTData({
        currentMatches: {
          ...(bytData?.currentMatches || {}),
          [selectedDiscipline]: results,
        },
        lastMatchRun: new Date().toISOString(),
      });

    } catch (err) {
      console.error('[BYT Match] Error:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }, [prerequisites.ready, selectedDiscipline, kycData, fyiData, minScore, bytData?.currentMatches, updateBYTData]);

  // --------------------------------------------------
  // Comparison toggle
  // --------------------------------------------------
  const handleToggleCompare = useCallback((consultantId) => {
    setCompareIds(prev => {
      if (prev.includes(consultantId)) {
        return prev.filter(id => id !== consultantId);
      }
      if (prev.length >= 3) {
        // Replace oldest
        return [...prev.slice(1), consultantId];
      }
      return [...prev, consultantId];
    });
  }, []);

  // --------------------------------------------------
  // Shortlist
  // --------------------------------------------------
  const handleShortlist = useCallback(async (matchResult) => {
    try {
      // Create engagement record via API
      const engagementData = {
        n4s_project_id: activeProjectId || 'default',
        consultant_id: matchResult.consultantId,
        discipline: selectedDiscipline,
        match_score: matchResult.combinedScore,
        client_fit_score: matchResult.clientFitScore,
        project_fit_score: matchResult.projectFitScore,
        match_breakdown: JSON.stringify(matchResult.breakdown),
        recommended_by: 'matching_algorithm',
        contact_status: 'shortlisted',
      };

      const res = await fetch(`${API_BASE}/gid.php?entity=engagements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(engagementData),
      });

      if (!res.ok) {
        console.warn('[BYT] Engagement API not yet available, saving locally only');
      }

      // Update local state
      setShortlistedIds(prev => new Set([...prev, matchResult.consultantId]));

      // Persist to AppContext
      const currentEngagements = bytData?.engagements || [];
      updateBYTData({
        engagements: [
          ...currentEngagements,
          {
            consultantId: matchResult.consultantId,
            consultantName: matchResult.consultantName,
            discipline: selectedDiscipline,
            combinedScore: matchResult.combinedScore,
            clientFitScore: matchResult.clientFitScore,
            projectFitScore: matchResult.projectFitScore,
            shortlistedAt: new Date().toISOString(),
          },
        ],
      });

    } catch (err) {
      console.error('[BYT] Shortlist error:', err);
      // Still save locally even if API fails
      setShortlistedIds(prev => new Set([...prev, matchResult.consultantId]));
    }
  }, [activeProjectId, selectedDiscipline, bytData?.engagements, updateBYTData]);

  // Build consultant lookup
  const consultantMap = useMemo(() => {
    const map = {};
    allConsultants.forEach(c => { map[c.id] = c; });
    return map;
  }, [allConsultants]);

  // Comparison data
  const comparisonResults = useMemo(
    () => matchResults.filter(r => compareIds.includes(r.consultantId)),
    [matchResults, compareIds]
  );

  // Summary stats
  const resultStats = useMemo(() => {
    if (matchResults.length === 0) return null;
    const topMatch = matchResults.filter(r => r.combinedScore >= 80).length;
    const goodFit = matchResults.filter(r => r.combinedScore >= 60 && r.combinedScore < 80).length;
    const consider = matchResults.filter(r => r.combinedScore >= 40 && r.combinedScore < 60).length;
    const below = matchResults.filter(r => r.combinedScore < 40).length;
    return { total: matchResults.length, topMatch, goodFit, consider, below };
  }, [matchResults]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="byt-match-screen">

      {/* Discipline selector */}
      <div className="byt-match-disciplines">
        {Object.entries(DISCIPLINES).map(([key, disc]) => (
          <button
            key={key}
            className={`byt-match-discipline-btn ${selectedDiscipline === key ? 'byt-match-discipline-btn--active' : ''}`}
            style={selectedDiscipline === key ? { borderColor: disc.color, backgroundColor: disc.color + '10' } : {}}
            onClick={() => setSelectedDiscipline(key)}
          >
            <span className="byt-match-discipline-btn__icon">{disc.icon}</span>
            <span className="byt-match-discipline-btn__label">{disc.label}</span>
            {bytData?.currentMatches?.[key]?.length > 0 && (
              <span className="byt-match-discipline-btn__count">
                {bytData.currentMatches[key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Prerequisites + Run button */}
      <div className="byt-match-control-panel">
        <PrerequisiteGates prerequisites={prerequisites} />

        <div className="byt-match-run-section">
          {/* Filters toggle */}
          <div className="byt-match-filters-row">
            <button
              className="byt-btn byt-btn--ghost byt-btn--sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon size={14} />
              Filters
              {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showFilters && (
              <div className="byt-match-filters-panel">
                <label className="byt-match-filter-label">
                  Minimum Score:
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="byt-filter-select byt-filter-select--sm"
                  >
                    <option value={0}>Show All</option>
                    <option value={40}>40+ (Consider & above)</option>
                    <option value={60}>60+ (Good Fit & above)</option>
                    <option value={80}>80+ (Top Match only)</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          <button
            className="byt-btn byt-btn--primary byt-btn--run-match"
            onClick={handleRunMatch}
            disabled={!prerequisites.ready || isRunning}
          >
            {isRunning
              ? <><RefreshCw size={16} className="spinning" /> Running Match...</>
              : <><Zap size={16} /> Run {DISCIPLINES[selectedDiscipline]?.label} Match</>
            }
          </button>

          {bytData?.lastMatchRun && hasRun && (
            <span className="byt-match-last-run">
              Last run: {new Date(bytData.lastMatchRun).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="byt-error">
          <AlertTriangle size={18} />
          <p>{error}</p>
          <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={() => setError(null)}>
            <X size={14} /> Dismiss
          </button>
        </div>
      )}

      {/* Results summary */}
      {hasRun && resultStats && (
        <div className="byt-match-summary">
          <div className="byt-match-summary__stat">
            <span className="byt-match-summary__value">{resultStats.total}</span>
            <span className="byt-match-summary__label">Matched</span>
          </div>
          <div className="byt-match-summary__stat" style={{ color: MATCH_TIERS.TOP_MATCH.color }}>
            <span className="byt-match-summary__value">{resultStats.topMatch}</span>
            <span className="byt-match-summary__label">Top Match</span>
          </div>
          <div className="byt-match-summary__stat" style={{ color: MATCH_TIERS.GOOD_FIT.color }}>
            <span className="byt-match-summary__value">{resultStats.goodFit}</span>
            <span className="byt-match-summary__label">Good Fit</span>
          </div>
          <div className="byt-match-summary__stat" style={{ color: COLORS.textMuted }}>
            <span className="byt-match-summary__value">{resultStats.consider}</span>
            <span className="byt-match-summary__label">Consider</span>
          </div>
          {compareIds.length > 0 && (
            <div className="byt-match-summary__compare-badge">
              <Users size={14} />
              Comparing {compareIds.length}
            </div>
          )}
        </div>
      )}

      {/* Comparison panel */}
      {compareIds.length >= 2 && (
        <div className="byt-match-comparison-panel">
          <div className="byt-match-comparison-panel__header">
            <h3>Side-by-Side Comparison</h3>
            <button
              className="byt-btn byt-btn--ghost byt-btn--sm"
              onClick={() => setCompareIds([])}
            >
              <X size={14} /> Clear
            </button>
          </div>
          <MatchComparisonTable
            matchResults={comparisonResults}
            consultants={allConsultants}
          />
        </div>
      )}

      {/* Match results list */}
      {hasRun && matchResults.length > 0 && (
        <div className="byt-match-results">
          {matchResults.map((result, index) => (
            <MatchResultCard
              key={result.consultantId}
              matchResult={result}
              consultant={consultantMap[result.consultantId]}
              rank={index + 1}
              isSelected={compareIds.includes(result.consultantId)}
              isComparing={compareIds.includes(result.consultantId)}
              isShortlisted={shortlistedIds.has(result.consultantId)}
              onToggleCompare={handleToggleCompare}
              onShortlist={handleShortlist}
              onViewDetail={() => {}}
              onExpandScore={() => {}}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {hasRun && matchResults.length === 0 && !error && (
        <div className="byt-empty">
          <Target size={48} />
          <h3>No Matches Found</h3>
          <p>
            No {DISCIPLINES[selectedDiscipline]?.label?.toLowerCase()} consultants matched the current criteria.
            Try lowering the minimum score or adding more consultants to the registry.
          </p>
        </div>
      )}

      {/* Not yet run */}
      {!hasRun && !isRunning && (
        <div className="byt-match-placeholder">
          <Target size={48} style={{ color: COLORS.border }} />
          <h3>Ready to Match</h3>
          <p>
            Select a discipline above and run the matching algorithm to find the best
            {' '}{DISCIPLINES[selectedDiscipline]?.label?.toLowerCase()} candidates for this project.
          </p>
        </div>
      )}
    </div>
  );
};

export default BYTMatchScreen;
