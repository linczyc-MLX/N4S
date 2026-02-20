/**
 * GIDShortlistScreen.jsx — Shortlist Curation Screen
 *
 * Phase 1 of GID Restructure. Replaces the old Matchmaking tab.
 *
 * Philosophy: Trust Discovery's intelligence. Don't re-score — curate.
 * The AI already evaluated candidates with deep context. This screen presents
 * Discovery's reasoning, lets Michael make quick decisions, and manages
 * the outreach pipeline.
 *
 * Features:
 * - Discipline filter tabs
 * - Discovery candidates with AI confidence + rationale
 * - Alignment badges (Style / Budget / Geographic / Scale)
 * - Shortlist / Pass / Request More Info actions
 * - Drag-to-rank within shortlisted candidates
 * - Pipeline status tracking (shortlisted → contacted → questionnaire_sent → ...)
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2, X, AlertTriangle, RefreshCw, ChevronDown, ChevronUp,
  MapPin, Briefcase, Star, Award, MessageSquare, GripVertical,
  FileText, Search as SearchIcon, Zap, Eye, ArrowRight,
  Clipboard, Clock, Filter as FilterIcon, Users, Globe,
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import AlignmentBadges, { computeAlignmentBadges } from '../components/AlignmentBadges';

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
  info: '#1976d2',
};

const DISCIPLINES = {
  architect:          { label: 'Architect',          color: '#315098', icon: '🏛' },
  interior_designer:  { label: 'Interior Designer',  color: '#8CA8BE', icon: '🎨' },
  pm:                 { label: 'Project Manager',    color: '#AFBDB0', icon: '📋' },
  gc:                 { label: 'General Contractor', color: '#C4A484', icon: '🔨' },
};

// Pipeline stages for shortlist (expanded from handover doc)
const PIPELINE_STAGES = [
  { key: 'shortlisted',            label: 'Shortlisted',          color: COLORS.textMuted, icon: Star },
  { key: 'contacted',              label: 'Contacted',            color: COLORS.info,      icon: MessageSquare },
  { key: 'questionnaire_sent',     label: 'Questionnaire Sent',   color: '#5c6bc0',        icon: FileText },
  { key: 'questionnaire_received', label: 'Response Received',    color: COLORS.warning,   icon: Clipboard },
  { key: 'under_review',           label: 'Under Review',         color: '#7b1fa2',        icon: Eye },
];

// API base URL
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';


// =============================================================================
// SHORTLIST CANDIDATE CARD
// =============================================================================

const ShortlistCandidateCard = ({
  consultant, discoveryData, engagement, kycData, fyiData,
  isShortlisted, isPassed, rank,
  onShortlist, onPass, onRequestInfo, onExpand,
  dragHandlers,
}) => {
  const [expanded, setExpanded] = useState(false);
  const discipline = DISCIPLINES[consultant.role] || {};

  // Parse source_attribution for AI rationale
  const attribution = useMemo(() => {
    if (consultant.source_attribution) {
      try {
        return typeof consultant.source_attribution === 'string'
          ? JSON.parse(consultant.source_attribution)
          : consultant.source_attribution;
      } catch { return null; }
    }
    return null;
  }, [consultant.source_attribution]);

  // Discovery confidence
  const confidence = discoveryData?.confidence_score || attribution?.confidence_score || null;

  // Notable projects from discovery
  const notableProjects = useMemo(() => {
    if (discoveryData?.notable_projects) {
      try {
        return typeof discoveryData.notable_projects === 'string'
          ? JSON.parse(discoveryData.notable_projects)
          : discoveryData.notable_projects;
      } catch { return []; }
    }
    return [];
  }, [discoveryData]);

  // Awards
  const awards = useMemo(() => {
    if (discoveryData?.awards) {
      try {
        return typeof discoveryData.awards === 'string'
          ? JSON.parse(discoveryData.awards)
          : discoveryData.awards;
      } catch { return []; }
    }
    return [];
  }, [discoveryData]);

  // Specialties from consultant record
  const specialties = useMemo(() => {
    if (consultant.specialties) {
      try {
        return typeof consultant.specialties === 'string'
          ? JSON.parse(consultant.specialties)
          : consultant.specialties;
      } catch { return []; }
    }
    return [];
  }, [consultant.specialties]);

  // Pipeline stage for shortlisted candidates
  const currentStage = engagement?.contact_status || null;
  const stageInfo = PIPELINE_STAGES.find(s => s.key === currentStage);

  return (
    <div
      className={`gid-shortlist-card ${isShortlisted ? 'gid-shortlist-card--shortlisted' : ''} ${isPassed ? 'gid-shortlist-card--passed' : ''}`}
      {...(dragHandlers || {})}
    >
      {/* Drag handle + rank (only for shortlisted) */}
      {isShortlisted && rank && (
        <div className="gid-shortlist-card__rank-handle">
          <GripVertical size={16} className="gid-shortlist-card__grip" />
          <span className="gid-shortlist-card__rank">#{rank}</span>
        </div>
      )}

      <div className="gid-shortlist-card__content">
        {/* Header row */}
        <div className="gid-shortlist-card__header">
          <div className="gid-shortlist-card__info">
            <div className="gid-shortlist-card__title-row">
              <h3 className="gid-shortlist-card__firm">{consultant.firm_name}</h3>
              {stageInfo && (
                <span
                  className="gid-shortlist-card__pipeline-badge"
                  style={{ color: stageInfo.color, backgroundColor: stageInfo.color + '15' }}
                >
                  {React.createElement(stageInfo.icon, { size: 12 })}
                  {stageInfo.label}
                </span>
              )}
            </div>
            {(consultant.first_name || consultant.last_name) && (
              <p className="gid-shortlist-card__name">
                {consultant.first_name} {consultant.last_name}
              </p>
            )}
            <div className="gid-shortlist-card__meta">
              {consultant.hq_city && (
                <span className="gid-meta-item">
                  <MapPin size={12} />
                  {consultant.hq_city}{consultant.hq_state ? `, ${consultant.hq_state}` : ''}
                </span>
              )}
              {consultant.years_experience && (
                <span className="gid-meta-item">
                  <Briefcase size={12} />
                  {consultant.years_experience} yrs
                </span>
              )}
              {consultant.website && (
                <span className="gid-meta-item">
                  <Globe size={12} />
                  <a href={consultant.website} target="_blank" rel="noopener noreferrer" className="gid-shortlist-card__link">
                    Website
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Discovery confidence gauge */}
          {confidence && (
            <div className="gid-shortlist-card__confidence">
              <div className="gid-confidence-ring" title={`Discovery confidence: ${confidence}%`}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e5e0" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke={confidence >= 80 ? COLORS.gold : confidence >= 60 ? COLORS.navy : COLORS.textMuted}
                    strokeWidth="4"
                    strokeDasharray={`${(confidence / 100) * 150.8} 150.8`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                  />
                  <text x="28" y="28" textAnchor="middle" dominantBaseline="central"
                    fontSize="14" fontWeight="600" fill={COLORS.text}>
                    {confidence}
                  </text>
                </svg>
              </div>
              <span className="gid-confidence-label">AI Confidence</span>
            </div>
          )}
        </div>

        {/* Alignment badges */}
        <AlignmentBadges consultant={consultant} kycData={kycData} fyiData={fyiData} />

        {/* Specialties tags */}
        {specialties.length > 0 && (
          <div className="gid-shortlist-card__tags">
            {specialties.slice(0, 5).map((s, i) => (
              <span key={i} className="gid-tag">{s}</span>
            ))}
            {specialties.length > 5 && (
              <span className="gid-tag gid-tag--more">+{specialties.length - 5}</span>
            )}
          </div>
        )}

        {/* AI Rationale (collapsed by default) */}
        {(attribution?.rationale || discoveryData?.ai_summary) && (
          <div className="gid-shortlist-card__rationale-toggle">
            <button
              className="gid-btn gid-btn--ghost gid-btn--sm"
              onClick={() => setExpanded(!expanded)}
            >
              <Zap size={12} />
              {expanded ? 'Hide AI Rationale' : 'View AI Rationale'}
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        )}

        {expanded && (
          <div className="gid-shortlist-card__rationale">
            {attribution?.rationale && (
              <p className="gid-shortlist-card__rationale-text">{attribution.rationale}</p>
            )}
            {discoveryData?.ai_summary && (
              <p className="gid-shortlist-card__rationale-text">{discoveryData.ai_summary}</p>
            )}

            {/* Notable projects */}
            {notableProjects.length > 0 && (
              <div className="gid-shortlist-card__notable">
                <h4>Notable Projects</h4>
                <ul>
                  {notableProjects.map((p, i) => (
                    <li key={i}>
                      <strong>{p.name || p}</strong>
                      {p.location && <span> — {p.location}</span>}
                      {p.year && <span> ({p.year})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <div className="gid-shortlist-card__awards">
                <h4>Awards & Recognition</h4>
                <div className="gid-shortlist-card__award-tags">
                  {awards.map((a, i) => (
                    <span key={i} className="gid-tag gid-tag--award">
                      <Award size={10} /> {typeof a === 'string' ? a : a.name || a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget range */}
        {(consultant.min_budget || consultant.max_budget) && (
          <p className="gid-shortlist-card__budget">
            Budget: ${((consultant.min_budget || 0) / 1e6).toFixed(1)}M – ${((consultant.max_budget || 0) / 1e6).toFixed(1)}M
          </p>
        )}

        {/* Actions */}
        {!isPassed && (
          <div className="gid-shortlist-card__actions">
            {!isShortlisted ? (
              <>
                <button
                  className="gid-btn gid-btn--primary gid-btn--sm"
                  onClick={() => onShortlist(consultant)}
                >
                  <CheckCircle2 size={14} /> Shortlist
                </button>
                <button
                  className="gid-btn gid-btn--ghost gid-btn--sm"
                  onClick={() => onPass(consultant)}
                >
                  <X size={14} /> Pass
                </button>
                <button
                  className="gid-btn gid-btn--ghost gid-btn--sm"
                  onClick={() => onRequestInfo(consultant)}
                  title="Flag for manual research"
                >
                  <SearchIcon size={14} /> More Info
                </button>
              </>
            ) : (
              <span className="gid-shortlist-card__status-label" style={{ color: COLORS.success }}>
                <CheckCircle2 size={14} /> Shortlisted
              </span>
            )}
          </div>
        )}

        {/* Pass reason display */}
        {isPassed && (
          <div className="gid-shortlist-card__passed-notice">
            <X size={14} />
            <span>Passed</span>
            <button
              className="gid-btn gid-btn--ghost gid-btn--xs"
              onClick={() => onShortlist(consultant)}
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// =============================================================================
// MAIN SHORTLIST SCREEN
// =============================================================================

const GIDShortlistScreen = () => {
  const { kycData, fyiData, gidData, updateGIDData, activeProjectId } = useAppContext();

  // State
  const [selectedDiscipline, setSelectedDiscipline] = useState('architect');
  const [consultants, setConsultants] = useState([]);
  const [discoveryMap, setDiscoveryMap] = useState({}); // consultant_id → discovery candidate data
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Curation state
  const [passedIds, setPassedIds] = useState(new Set());
  const [shortlistOrder, setShortlistOrder] = useState([]); // ordered consultant IDs
  const [requestInfoIds, setRequestInfoIds] = useState(new Set());

  // Filter
  const [showPassed, setShowPassed] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Drag state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch consultants for selected discipline (all, not just discovery-sourced)
      const consultantRes = await fetch(
        `${API_BASE}/gid.php?entity=consultants&role=${selectedDiscipline}`,
        { credentials: 'include' }
      );
      if (!consultantRes.ok) throw new Error(`Failed to load consultants: ${consultantRes.status}`);
      const consultantData = await consultantRes.json();
      const allConsultants = consultantData.consultants || [];

      // 2. Fetch discovery candidates for this discipline (to get AI rationale, confidence)
      const discoveryRes = await fetch(
        `${API_BASE}/gid.php?entity=discovery&discipline=${selectedDiscipline}&status=imported&limit=100`,
        { credentials: 'include' }
      );
      let discoveryData = {};
      if (discoveryRes.ok) {
        const dData = await discoveryRes.json();
        const candidates = dData.candidates || [];
        // Build lookup by imported_consultant_id
        candidates.forEach(c => {
          if (c.imported_consultant_id) {
            discoveryData[c.imported_consultant_id] = c;
          }
          // Also try matching by firm_name as fallback
          const firmKey = (c.firm_name || '').toLowerCase().trim();
          if (firmKey) discoveryData[`firm:${firmKey}`] = c;
        });
      }

      // 3. Fetch existing engagements for this project + discipline
      const engRes = await fetch(
        `${API_BASE}/gid.php?entity=engagements&project_id=${activeProjectId || 'default'}`,
        { credentials: 'include' }
      );
      let engagementList = [];
      if (engRes.ok) {
        const eData = await engRes.json();
        engagementList = (eData.engagements || []).filter(e => e.discipline === selectedDiscipline);
      }

      setConsultants(allConsultants);
      setDiscoveryMap(discoveryData);
      setEngagements(engagementList);

      // Build initial shortlist order from existing engagements
      const shortlistedIds = engagementList
        .filter(e => e.contact_status !== 'passed' && e.contact_status !== 'archived')
        .sort((a, b) => (a.shortlist_rank || 999) - (b.shortlist_rank || 999))
        .map(e => e.consultant_id);
      setShortlistOrder(shortlistedIds);

      // Build passed set
      const passed = new Set(
        engagementList
          .filter(e => e.contact_status === 'passed' || e.contact_status === 'archived')
          .map(e => e.consultant_id)
      );
      setPassedIds(passed);

    } catch (err) {
      console.error('[Shortlist] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDiscipline, activeProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --------------------------------------------------
  // Engagement lookup
  // --------------------------------------------------
  const engagementMap = useMemo(() => {
    const map = {};
    engagements.forEach(e => { map[e.consultant_id] = e; });
    return map;
  }, [engagements]);

  // --------------------------------------------------
  // Discovery data lookup for a consultant
  // --------------------------------------------------
  const getDiscoveryData = useCallback((consultant) => {
    return discoveryMap[consultant.id] ||
      discoveryMap[`firm:${(consultant.firm_name || '').toLowerCase().trim()}`] ||
      null;
  }, [discoveryMap]);

  // --------------------------------------------------
  // Categorize candidates
  // --------------------------------------------------
  const { shortlisted, unreviewed, passed, filteredCount } = useMemo(() => {
    const shortlistedSet = new Set(shortlistOrder);
    const searchLower = searchInput.toLowerCase().trim();

    const filterFn = (c) => {
      if (!searchLower) return true;
      return (c.firm_name || '').toLowerCase().includes(searchLower) ||
        (c.first_name || '').toLowerCase().includes(searchLower) ||
        (c.last_name || '').toLowerCase().includes(searchLower) ||
        (c.hq_city || '').toLowerCase().includes(searchLower);
    };

    const shortlisted = shortlistOrder
      .map(id => consultants.find(c => c.id === id))
      .filter(c => c && filterFn(c));

    const unreviewed = consultants.filter(c =>
      !shortlistedSet.has(c.id) && !passedIds.has(c.id) && filterFn(c)
    );

    const passed = consultants.filter(c =>
      passedIds.has(c.id) && filterFn(c)
    );

    return {
      shortlisted,
      unreviewed,
      passed,
      filteredCount: shortlisted.length + unreviewed.length + passed.length,
    };
  }, [consultants, shortlistOrder, passedIds, searchInput]);

  // --------------------------------------------------
  // Actions
  // --------------------------------------------------
  const handleShortlist = useCallback(async (consultant) => {
    try {
      // Remove from passed if it was there
      setPassedIds(prev => {
        const next = new Set(prev);
        next.delete(consultant.id);
        return next;
      });

      // Add to shortlist order
      setShortlistOrder(prev => {
        if (prev.includes(consultant.id)) return prev;
        return [...prev, consultant.id];
      });

      // Create or update engagement record
      const existing = engagementMap[consultant.id];
      if (existing) {
        // Update status back to shortlisted
        await fetch(`${API_BASE}/gid.php?entity=engagements&id=${existing.id}&action=update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ contact_status: 'shortlisted' }),
        });
      } else {
        // Create new engagement
        const discovery = getDiscoveryData(consultant);
        await fetch(`${API_BASE}/gid.php?entity=engagements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            n4s_project_id: activeProjectId || 'default',
            consultant_id: consultant.id,
            discipline: selectedDiscipline,
            match_score: discovery?.confidence_score || null,
            recommended_by: consultant.source_of_discovery === 'gid_discovery' ? 'ai_discovery' : 'team_curation',
            contact_status: 'shortlisted',
          }),
        });
      }

      // Refresh engagements
      const engRes = await fetch(
        `${API_BASE}/gid.php?entity=engagements&project_id=${activeProjectId || 'default'}`,
        { credentials: 'include' }
      );
      if (engRes.ok) {
        const eData = await engRes.json();
        setEngagements((eData.engagements || []).filter(e => e.discipline === selectedDiscipline));
      }

    } catch (err) {
      console.error('[Shortlist] Shortlist error:', err);
      // Still update UI even if API fails
    }
  }, [engagementMap, getDiscoveryData, activeProjectId, selectedDiscipline]);

  const handlePass = useCallback(async (consultant) => {
    // Remove from shortlist order
    setShortlistOrder(prev => prev.filter(id => id !== consultant.id));
    // Add to passed
    setPassedIds(prev => new Set([...prev, consultant.id]));

    // Update engagement if exists
    const existing = engagementMap[consultant.id];
    if (existing) {
      try {
        await fetch(`${API_BASE}/gid.php?entity=engagements&id=${existing.id}&action=update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ contact_status: 'passed' }),
        });
      } catch (err) {
        console.error('[Shortlist] Pass error:', err);
      }
    }
  }, [engagementMap]);

  const handleRequestInfo = useCallback((consultant) => {
    setRequestInfoIds(prev => new Set([...prev, consultant.id]));
    // Could trigger a notification or flag — for now just visual indicator
  }, []);

  // --------------------------------------------------
  // Drag-to-rank handlers
  // --------------------------------------------------
  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set minimal drag image
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    setShortlistOrder(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });

    setDragIndex(null);
    setDragOverIndex(null);

    // TODO Phase 2: Persist rank order to API
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------
  const stats = useMemo(() => ({
    total: consultants.length,
    shortlisted: shortlistOrder.length,
    unreviewed: consultants.length - shortlistOrder.length - passedIds.size,
    passed: passedIds.size,
    withDiscovery: consultants.filter(c => c.source_of_discovery === 'gid_discovery').length,
  }), [consultants, shortlistOrder, passedIds]);

  // Alignment summary for shortlisted candidates
  const alignmentSummary = useMemo(() => {
    if (shortlisted.length === 0) return null;
    let styleCount = 0, budgetCount = 0, geoCount = 0, scaleCount = 0;
    shortlisted.forEach(c => {
      const badges = computeAlignmentBadges(c, kycData, fyiData);
      badges.forEach(b => {
        if (b.aligned) {
          if (b.key === 'style') styleCount++;
          if (b.key === 'budget') budgetCount++;
          if (b.key === 'geographic') geoCount++;
          if (b.key === 'scale') scaleCount++;
        }
      });
    });
    return { styleCount, budgetCount, geoCount, scaleCount, total: shortlisted.length };
  }, [shortlisted, kycData, fyiData]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="gid-shortlist-screen">

      {/* Discipline selector */}
      <div className="gid-match-disciplines">
        {Object.entries(DISCIPLINES).map(([key, disc]) => {
          const discCount = consultants.filter(c => c.role === key).length;
          return (
            <button
              key={key}
              className={`gid-match-discipline-btn ${selectedDiscipline === key ? 'gid-match-discipline-btn--active' : ''}`}
              style={selectedDiscipline === key ? { borderColor: disc.color, backgroundColor: disc.color + '10' } : {}}
              onClick={() => setSelectedDiscipline(key)}
            >
              <span className="gid-match-discipline-btn__icon">{disc.icon}</span>
              <span className="gid-match-discipline-btn__label">{disc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="gid-shortlist-stats">
        <div className="gid-shortlist-stat">
          <span className="gid-shortlist-stat__value">{stats.total}</span>
          <span className="gid-shortlist-stat__label">Total</span>
        </div>
        <div className="gid-shortlist-stat">
          <span className="gid-shortlist-stat__value" style={{ color: COLORS.success }}>
            {stats.shortlisted}
          </span>
          <span className="gid-shortlist-stat__label">Shortlisted</span>
        </div>
        <div className="gid-shortlist-stat">
          <span className="gid-shortlist-stat__value">{stats.unreviewed}</span>
          <span className="gid-shortlist-stat__label">To Review</span>
        </div>
        <div className="gid-shortlist-stat">
          <span className="gid-shortlist-stat__value" style={{ color: COLORS.textMuted }}>
            {stats.passed}
          </span>
          <span className="gid-shortlist-stat__label">Passed</span>
        </div>
        {stats.withDiscovery > 0 && (
          <div className="gid-shortlist-stat">
            <span className="gid-shortlist-stat__value" style={{ color: COLORS.info }}>
              <Zap size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {stats.withDiscovery}
            </span>
            <span className="gid-shortlist-stat__label">AI Sourced</span>
          </div>
        )}

        {/* Search + filter controls */}
        <div className="gid-shortlist-controls">
          <div className="gid-shortlist-search">
            <SearchIcon size={14} />
            <input
              type="text"
              placeholder="Search firms..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="gid-shortlist-search__input"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="gid-shortlist-search__clear">
                <X size={12} />
              </button>
            )}
          </div>
          <button
            className={`gid-btn gid-btn--ghost gid-btn--sm ${showPassed ? 'gid-btn--active' : ''}`}
            onClick={() => setShowPassed(!showPassed)}
          >
            {showPassed ? 'Hide' : 'Show'} Passed ({stats.passed})
          </button>
          <button
            className="gid-btn gid-btn--ghost gid-btn--sm"
            onClick={loadData}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="gid-loading">
          <RefreshCw size={24} className="spinning" />
          <p>Loading {DISCIPLINES[selectedDiscipline]?.label} candidates...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="gid-error">
          <AlertTriangle size={18} />
          <p>{error}</p>
          <button className="gid-btn gid-btn--primary gid-btn--sm" onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && consultants.length === 0 && (
        <div className="gid-empty">
          <Users size={48} />
          <h3>No {DISCIPLINES[selectedDiscipline]?.label} Candidates</h3>
          <p>
            Use the Discovery tab to find and import qualified {DISCIPLINES[selectedDiscipline]?.label?.toLowerCase()} candidates,
            or add them manually via the Registry.
          </p>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && consultants.length > 0 && (
        <div className="gid-shortlist-content">

          {/* SHORTLISTED SECTION */}
          {shortlisted.length > 0 && (
            <div className="gid-shortlist-section">
              <div className="gid-shortlist-section__header">
                <h3 className="gid-shortlist-section__title">
                  <CheckCircle2 size={18} style={{ color: COLORS.success }} />
                  Shortlisted ({shortlisted.length})
                </h3>
                <span className="gid-shortlist-section__hint">
                  Drag to reorder priority
                </span>
              </div>

              {/* Alignment summary */}
              {alignmentSummary && (
                <div className="gid-shortlist-alignment-summary">
                  <span title="Style Aligned">🎨 {alignmentSummary.styleCount}/{alignmentSummary.total}</span>
                  <span title="Budget Aligned">💰 {alignmentSummary.budgetCount}/{alignmentSummary.total}</span>
                  <span title="Geographic Aligned">📍 {alignmentSummary.geoCount}/{alignmentSummary.total}</span>
                  <span title="Scale Aligned">📐 {alignmentSummary.scaleCount}/{alignmentSummary.total}</span>
                </div>
              )}

              <div className="gid-shortlist-list">
                {shortlisted.map((consultant, index) => (
                  <div
                    key={consultant.id}
                    className={`gid-shortlist-drag-wrapper ${dragOverIndex === index ? 'gid-shortlist-drag-wrapper--over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <ShortlistCandidateCard
                      consultant={consultant}
                      discoveryData={getDiscoveryData(consultant)}
                      engagement={engagementMap[consultant.id]}
                      kycData={kycData}
                      fyiData={fyiData}
                      isShortlisted={true}
                      isPassed={false}
                      rank={index + 1}
                      onShortlist={handleShortlist}
                      onPass={handlePass}
                      onRequestInfo={handleRequestInfo}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UNREVIEWED SECTION */}
          {unreviewed.length > 0 && (
            <div className="gid-shortlist-section">
              <div className="gid-shortlist-section__header">
                <h3 className="gid-shortlist-section__title">
                  <Clock size={18} style={{ color: COLORS.warning }} />
                  To Review ({unreviewed.length})
                </h3>
              </div>

              <div className="gid-shortlist-list">
                {unreviewed.map(consultant => (
                  <ShortlistCandidateCard
                    key={consultant.id}
                    consultant={consultant}
                    discoveryData={getDiscoveryData(consultant)}
                    engagement={engagementMap[consultant.id]}
                    kycData={kycData}
                    fyiData={fyiData}
                    isShortlisted={false}
                    isPassed={false}
                    rank={null}
                    onShortlist={handleShortlist}
                    onPass={handlePass}
                    onRequestInfo={handleRequestInfo}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PASSED SECTION */}
          {showPassed && passed.length > 0 && (
            <div className="gid-shortlist-section gid-shortlist-section--passed">
              <div className="gid-shortlist-section__header">
                <h3 className="gid-shortlist-section__title">
                  <X size={18} style={{ color: COLORS.textMuted }} />
                  Passed ({passed.length})
                </h3>
              </div>

              <div className="gid-shortlist-list">
                {passed.map(consultant => (
                  <ShortlistCandidateCard
                    key={consultant.id}
                    consultant={consultant}
                    discoveryData={getDiscoveryData(consultant)}
                    engagement={engagementMap[consultant.id]}
                    kycData={kycData}
                    fyiData={fyiData}
                    isShortlisted={false}
                    isPassed={true}
                    rank={null}
                    onShortlist={handleShortlist}
                    onPass={handlePass}
                    onRequestInfo={handleRequestInfo}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GIDShortlistScreen;
