/**
 * GIDMatchScreen.jsx — Matchmaking Screen
 *
 * Phase 2 of GID module. Allows LRA team to:
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
    <div className="gid-match-prereqs">
      <div className="gid-match-prereqs__header">
        <h3 className="gid-match-prereqs__title">
          {prerequisites.ready
            ? <><CheckCircle2 size={16} style={{ color: COLORS.success }} /> Ready to Match</>
            : <><AlertTriangle size={16} style={{ color: COLORS.warning }} /> Prerequisites Needed</>
          }
        </h3>
        <span className="gid-match-prereqs__completeness">
          {prerequisites.completeness}% data available
        </span>
      </div>

      <div className="gid-match-prereqs__gates">
        {prerequisites.gates.map((gate) => (
          <div
            key={gate.field}
            className={`gid-match-prereq-item ${gate.filled ? 'gid-match-prereq-item--filled' : ''} ${gate.required ? 'gid-match-prereq-item--required' : ''}`}
          >
            <span className="gid-match-prereq-item__icon">
              {gate.filled
                ? <CheckCircle2 size={14} style={{ color: COLORS.success }} />
                : gate.required
                  ? <AlertTriangle size={14} style={{ color: COLORS.error }} />
                  : <Clock size={14} style={{ color: COLORS.textMuted }} />
              }
            </span>
            <span className="gid-match-prereq-item__label">{gate.label}</span>
            <span className="gid-match-prereq-item__source">{gate.source}</span>
            {gate.required && !gate.filled && (
              <span className="gid-match-prereq-item__required-badge">Required</span>
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
  const discipline = DISCIPLINES[consultant?.role] || {};

  return (
    <div className={`gid-match-result-card ${isSelected ? 'gid-match-result-card--selected' : ''} ${isShortlisted ? 'gid-match-result-card--shortlisted' : ''}`}>
      {/* Rank badge */}
      <div className="gid-match-result-card__rank" style={{ backgroundColor: matchResult.tierBgColor, color: matchResult.tierColor }}>
        #{rank}
      </div>

      <div className="gid-match-result-card__content">
        {/* Header row */}
        <div className="gid-match-result-card__header">
          <div className="gid-match-result-card__info">
            <h3 className="gid-match-result-card__firm">{consultant?.firm_name}</h3>
            {(consultant?.first_name || consultant?.last_name) && (
              <p className="gid-match-result-card__name">
                {consultant?.first_name} {consultant?.last_name}
              </p>
            )}
            <div className="gid-match-result-card__meta">
              {consultant?.hq_city && (
                <span className="gid-meta-item">
                  <MapPin size={12} />
                  {consultant.hq_city}{consultant.hq_state ? `, ${consultant.hq_state}` : ''}
                </span>
              )}
              {consultant?.years_experience && (
                <span className="gid-meta-item">
                  <Briefcase size={12} />
                  {consultant.years_experience} yrs
                </span>
              )}
              {consultant?.avg_rating > 0 && (
                <span className="gid-meta-item">
                  <Star size={12} />
                  {Number(consultant.avg_rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Inline scores */}
          <MatchScoreInline matchResult={matchResult} />
        </div>

        {/* Specialty tags */}
        {consultant?.specialties?.length > 0 && (
          <div className="gid-match-result-card__tags">
            {consultant.specialties.slice(0, 5).map((s, i) => (
              <span key={i} className="gid-tag">{s}</span>
            ))}
            {consultant.specialties.length > 5 && (
              <span className="gid-tag gid-tag--more">+{consultant.specialties.length - 5}</span>
            )}
          </div>
        )}

        {/* Expanded breakdown */}
        {expanded && (
          <div className="gid-match-result-card__expanded">
            <MatchScoreExpanded matchResult={matchResult} showWeights />
          </div>
        )}

        {/* Actions */}
        <div className="gid-match-result-card__actions">
          <button
            className="gid-btn gid-btn--ghost gid-btn--sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Breakdown' : 'Score Breakdown'}
          </button>

          <button
            className={`gid-btn gid-btn--sm ${isComparing ? 'gid-btn--active' : 'gid-btn--ghost'}`}
            onClick={() => onToggleCompare(matchResult.consultantId)}
            title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isComparing ? <Minus size={14} /> : <Plus size={14} />}
            Compare
          </button>

          <button
            className={`gid-btn gid-btn--sm ${isShortlisted ? 'gid-btn--success' : 'gid-btn--primary'}`}
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

const GIDMatchScreen = () => {
  const { kycData, fyiData, gidData, updateGIDData, activeProjectId } = useAppContext();

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

  // Load existing match results from gidData if available
  useEffect(() => {
    const existing = gidData?.currentMatches?.[selectedDiscipline];
    if (existing && existing.length > 0) {
      setMatchResults(existing);
      setHasRun(true);
    } else {
      setMatchResults([]);
      setHasRun(false);
    }
    setCompareIds([]);
  }, [selectedDiscipline, gidData?.currentMatches]);

  // Load existing shortlisted IDs
  useEffect(() => {
    const engagements = gidData?.engagements || [];
    const ids = new Set(
      engagements
        .filter(e => e.discipline === selectedDiscipline)
        .map(e => e.consultantId)
    );
    setShortlistedIds(ids);
  }, [selectedDiscipline, gidData?.engagements]);

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

      // Persist to AppContext
      updateGIDData({
        currentMatches: { [selectedDiscipline]: results },
        lastMatchRun: new Date().toISOString(),
      });

    } catch (err) {
      console.error('[GID Match] Error:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }, [prerequisites.ready, selectedDiscipline, kycData, fyiData, minScore, updateGIDData]);

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
        console.warn('[GID] Engagement API not yet available, saving locally only');
      }

      // Update local state
      setShortlistedIds(prev => new Set([...prev, matchResult.consultantId]));

      // Persist to AppContext
      const currentEngagements = gidData?.engagements || [];
      updateGIDData({
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
      console.error('[GID] Shortlist error:', err);
      // Still save locally even if API fails
      setShortlistedIds(prev => new Set([...prev, matchResult.consultantId]));
    }
  }, [activeProjectId, selectedDiscipline, gidData?.engagements, updateGIDData]);

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
    <div className="gid-match-screen">

      {/* Discipline selector */}
      <div className="gid-match-disciplines">
        {Object.entries(DISCIPLINES).map(([key, disc]) => (
          <button
            key={key}
            className={`gid-match-discipline-btn ${selectedDiscipline === key ? 'gid-match-discipline-btn--active' : ''}`}
            style={selectedDiscipline === key ? { borderColor: disc.color, backgroundColor: disc.color + '10' } : {}}
            onClick={() => setSelectedDiscipline(key)}
          >
            <span className="gid-match-discipline-btn__icon">{disc.icon}</span>
            <span className="gid-match-discipline-btn__label">{disc.label}</span>
            {gidData?.currentMatches?.[key]?.length > 0 && (
              <span className="gid-match-discipline-btn__count">
                {gidData.currentMatches[key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Prerequisites + Run button */}
      <div className="gid-match-control-panel">
        <PrerequisiteGates prerequisites={prerequisites} />

        <div className="gid-match-run-section">
          {/* Filters toggle */}
          <div className="gid-match-filters-row">
            <button
              className="gid-btn gid-btn--ghost gid-btn--sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon size={14} />
              Filters
              {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showFilters && (
              <div className="gid-match-filters-panel">
                <label className="gid-match-filter-label">
                  Minimum Score:
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="gid-filter-select gid-filter-select--sm"
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
            className="gid-btn gid-btn--primary gid-btn--run-match"
            onClick={handleRunMatch}
            disabled={!prerequisites.ready || isRunning}
          >
            {isRunning
              ? <><RefreshCw size={16} className="spinning" /> Running Match...</>
              : <><Zap size={16} /> Run {DISCIPLINES[selectedDiscipline]?.label} Match</>
            }
          </button>

          {gidData?.lastMatchRun && hasRun && (
            <span className="gid-match-last-run">
              Last run: {new Date(gidData.lastMatchRun).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="gid-error">
          <AlertTriangle size={18} />
          <p>{error}</p>
          <button className="gid-btn gid-btn--ghost gid-btn--sm" onClick={() => setError(null)}>
            <X size={14} /> Dismiss
          </button>
        </div>
      )}

      {/* Results summary */}
      {hasRun && resultStats && (
        <div className="gid-match-summary">
          <div className="gid-match-summary__stat">
            <span className="gid-match-summary__value">{resultStats.total}</span>
            <span className="gid-match-summary__label">Matched</span>
          </div>
          <div className="gid-match-summary__stat" style={{ color: MATCH_TIERS.TOP_MATCH.color }}>
            <span className="gid-match-summary__value">{resultStats.topMatch}</span>
            <span className="gid-match-summary__label">Top Match</span>
          </div>
          <div className="gid-match-summary__stat" style={{ color: MATCH_TIERS.GOOD_FIT.color }}>
            <span className="gid-match-summary__value">{resultStats.goodFit}</span>
            <span className="gid-match-summary__label">Good Fit</span>
          </div>
          <div className="gid-match-summary__stat" style={{ color: COLORS.textMuted }}>
            <span className="gid-match-summary__value">{resultStats.consider}</span>
            <span className="gid-match-summary__label">Consider</span>
          </div>
          {compareIds.length > 0 && (
            <div className="gid-match-summary__compare-badge">
              <Users size={14} />
              Comparing {compareIds.length}
            </div>
          )}
        </div>
      )}

      {/* Comparison panel */}
      {compareIds.length >= 2 && (
        <div className="gid-match-comparison-panel">
          <div className="gid-match-comparison-panel__header">
            <h3>Side-by-Side Comparison</h3>
            <button
              className="gid-btn gid-btn--ghost gid-btn--sm"
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
        <div className="gid-match-results">
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
        <div className="gid-empty">
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
        <div className="gid-match-placeholder">
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

export default GIDMatchScreen;
