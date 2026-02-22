/**
 * BYTMatchmakingScreen.jsx — Deep Matchmaking & Scoring Screen
 *
 * Tab 4 of BYT module. Combines:
 * 1. VPS scoring engine results (quantitative + qualitative from RFQ responses)
 * 2. IONOS engagement pipeline tracking (shortlisted → contracted)
 *
 * CONFIG WIRING (Feb 2026):
 * - Scoring dimension weights from Admin config (scoring.weights)
 * - Tier thresholds from Admin config (scoring.tiers)
 * - Tier labels/colors use getTierLabel/getTierColor from configResolver
 * - Score breakdown displays effective (not hardcoded) weight percentages
 *
 * Data flow:
 *   IONOS gid_engagements (pipeline) + VPS rfq scoring (match scores) → merged view
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Users, Briefcase, ChevronDown, ChevronUp, X, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, ArrowRight, Phone,
  MessageSquare, Calendar, FileText, UserCheck, Shield,
  MapPin, Star, Edit2, Save, Trash2, Award, Zap,
  ChevronRight, BarChart3, Target, Play, Eye
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import {
  rfqGetScores, rfqComputeAllScores, rfqComputeScore,
  rfqListInvitations, rfqGetInvitationResponses
} from '../../../services/rfqApi';
import { useBYTConfig } from '../utils/useBYTConfig';
import { getTierLabel, getTierColor } from '../utils/configResolver';

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

// Discipline definitions
const DISCIPLINES = {
  architect:          { label: 'Architect',          color: '#315098', icon: '🏛' },
  interior_designer:  { label: 'Interior Designer',  color: '#8CA8BE', icon: '🎨' },
  pm:                 { label: "PM / Owner's Rep",   color: '#AFBDB0', icon: '📋' },
  gc:                 { label: 'General Contractor',  color: '#C4A484', icon: '🔨' },
};

// Pipeline stages
const PIPELINE_STAGES = [
  { key: 'shortlisted',              label: 'Shortlisted',          icon: Star,           dateField: 'date_shortlisted',           color: COLORS.textMuted },
  { key: 'contacted',                label: 'Contacted',            icon: Phone,          dateField: 'date_contacted',             color: COLORS.info },
  { key: 'questionnaire_sent',       label: 'RFQ Sent',             icon: FileText,       dateField: 'questionnaire_sent_at',      color: '#5c6bc0' },
  { key: 'questionnaire_received',   label: 'Response In',          icon: MessageSquare,  dateField: 'questionnaire_received_at',  color: COLORS.warning },
  { key: 'under_review',             label: 'Under Review',         icon: Calendar,       dateField: 'date_meeting',               color: '#7b1fa2' },
  { key: 'proposal',                 label: 'Proposal',             icon: FileText,       dateField: 'date_proposal',              color: '#7b1fa2' },
  { key: 'engaged',                  label: 'Engaged',              icon: UserCheck,      dateField: 'date_engaged',               color: COLORS.success },
  { key: 'contracted',               label: 'Contracted',           icon: Shield,         dateField: 'date_contracted',            color: COLORS.gold },
];

const PROJECT_OUTCOMES = [
  { value: 'pending',      label: 'Pending' },
  { value: 'active',       label: 'Active' },
  { value: 'completed',    label: 'Completed' },
  { value: 'on_hold',      label: 'On Hold' },
  { value: 'withdrawn',    label: 'Withdrawn' },
  { value: 'declined',     label: 'Declined' },
];

// Scoring dimension definitions (static metadata — weights come from config)
const SCORE_DIMENSION_META = {
  scale_match:            { label: 'Scale Match',           icon: Target },
  financial_resilience:   { label: 'Financial Resilience',  icon: Shield },
  geographic_alignment:   { label: 'Geographic Alignment',  icon: MapPin },
  capability_coverage:    { label: 'Capability Coverage',   icon: CheckCircle2 },
  portfolio_relevance:    { label: 'Portfolio Relevance',   icon: Briefcase },
  tech_compatibility:     { label: 'Tech Compatibility',    icon: Zap },
  credentials:            { label: 'Credentials',           icon: Award },
  philosophy_alignment:   { label: 'Philosophy Alignment',  icon: Star },
  methodology_fit:        { label: 'Methodology Fit',       icon: Calendar },
  collaboration_maturity: { label: 'Collaboration',         icon: Users },
};

// API base URL
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';


// =============================================================================
// ENGAGEMENT API HELPERS (IONOS)
// =============================================================================

const engagementApi = {
  async fetchAll(projectId) {
    const params = new URLSearchParams({ entity: 'engagements' });
    if (projectId) params.set('project_id', projectId);
    const res = await fetch(`${API_BASE}/gid.php?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE}/gid.php?entity=engagements&id=${id}&action=update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`${API_BASE}/gid.php?entity=engagements&id=${id}&action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};


// =============================================================================
// TEAM COMPOSITION SUMMARY
// =============================================================================

const TeamCompositionSummary = ({ engagementsByDiscipline, scoreMap, tiers }) => {
  const slots = Object.entries(DISCIPLINES).map(([key, disc]) => {
    const engagements = engagementsByDiscipline[key] || [];
    const mostAdvanced = engagements.reduce((best, eng) => {
      const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === eng.contact_status);
      const bestIdx = best ? PIPELINE_STAGES.findIndex(s => s.key === best.contact_status) : -1;
      return stageIdx > bestIdx ? eng : best;
    }, null);

    const isFilled = mostAdvanced && ['engaged', 'contracted'].includes(mostAdvanced.contact_status);
    const isInProgress = mostAdvanced && !isFilled;
    const score = mostAdvanced ? scoreMap[mostAdvanced.consultant_id] : null;

    return { key, disc, count: engagements.length, mostAdvanced, isFilled, isInProgress, score,
      status: isFilled ? 'filled' : isInProgress ? 'in_progress' : 'open' };
  });

  const filledCount = slots.filter(s => s.isFilled).length;
  const readiness = Math.round((filledCount / 4) * 100);

  return (
    <div className="byt-assembly-composition">
      <div className="byt-assembly-composition__header">
        <div className="byt-assembly-composition__title-row">
          <h3 className="byt-assembly-composition__title">Team Composition</h3>
          <div className="byt-assembly-composition__readiness">
            <div className="byt-assembly-composition__readiness-bar">
              <div className="byt-assembly-composition__readiness-fill" style={{ width: `${readiness}%` }} />
            </div>
            <span className="byt-assembly-composition__readiness-label">
              {filledCount}/4 roles filled ({readiness}%)
            </span>
          </div>
        </div>
      </div>

      <div className="byt-assembly-composition__slots">
        {slots.map(slot => {
          const stageInfo = slot.mostAdvanced
            ? PIPELINE_STAGES.find(s => s.key === slot.mostAdvanced.contact_status)
            : null;
          const StageIcon = stageInfo?.icon || Clock;

          return (
            <div key={slot.key} className={`byt-assembly-slot byt-assembly-slot--${slot.status}`}
              style={{ borderTopColor: slot.disc.color }}>
              <div className="byt-assembly-slot__icon">{slot.disc.icon}</div>
              <div className="byt-assembly-slot__info">
                <span className="byt-assembly-slot__discipline">{slot.disc.label}</span>
                {slot.mostAdvanced ? (
                  <>
                    <span className="byt-assembly-slot__firm">
                      {slot.mostAdvanced.firm_name || 'Unknown Firm'}
                    </span>
                    <span className="byt-assembly-slot__status" style={{ color: stageInfo?.color }}>
                      <StageIcon size={12} />
                      {stageInfo?.label || slot.mostAdvanced.contact_status}
                    </span>
                    {slot.score && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: getTierColor(slot.score.overall_score || 0, tiers) }}>
                        Score: {Math.round(slot.score.overall_score || 0)}
                      </span>
                    )}
                    {!slot.score && slot.mostAdvanced?.ai_confidence && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: getTierColor(slot.mostAdvanced.ai_confidence, tiers) }}>
                        AI: {Math.round(slot.mostAdvanced.ai_confidence)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="byt-assembly-slot__empty">No candidates yet</span>
                )}
              </div>
              {slot.count > 1 && (
                <span className="byt-assembly-slot__count">+{slot.count - 1} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// =============================================================================
// SCORE BREAKDOWN PANEL — CONFIG-DRIVEN WEIGHTS
// =============================================================================

const ScoreBreakdown = ({ score, configWeights, tiers }) => {
  if (!score || !score.dimensions) return null;
  const dims = score.dimensions;

  // Build ordered dimension list from config weights
  const dimensionList = Object.entries(configWeights || {}).map(([key, weight]) => ({
    key,
    label: SCORE_DIMENSION_META[key]?.label || key,
    icon: SCORE_DIMENSION_META[key]?.icon || Target,
    weight,
  }));

  return (
    <div className="byt-mm-breakdown">
      <div className="byt-mm-breakdown__header">
        <BarChart3 size={14} />
        <span>Score Breakdown</span>
        <span className="byt-mm-breakdown__split">
          Quantitative {Math.round(score.quantitative_score || 0)} · Qualitative {Math.round(score.qualitative_score || 0)}
        </span>
      </div>

      <div className="byt-mm-breakdown__dims">
        {dimensionList.map(dim => {
          const val = dims[dim.key];
          if (val === undefined || val === null) return null;
          const normalizedVal = Math.min(100, Math.max(0, Number(val)));
          const DimIcon = dim.icon;
          return (
            <div key={dim.key} className="byt-mm-dim">
              <div className="byt-mm-dim__label">
                <DimIcon size={12} />
                <span>{dim.label}</span>
                <span className="byt-mm-dim__weight">{dim.weight}%</span>
              </div>
              <div className="byt-mm-dim__bar">
                <div className="byt-mm-dim__fill"
                  style={{ width: `${normalizedVal}%`, background: getTierColor(normalizedVal, tiers) }} />
              </div>
              <div className="byt-mm-dim__value" style={{ color: getTierColor(normalizedVal, tiers) }}>
                {Math.round(normalizedVal)}
              </div>
            </div>
          );
        })}
      </div>

      {score.match_tier && (
        <div className="byt-mm-breakdown__tier" style={{ color: getTierColor(score.overall_score || 0, tiers) }}>
          <Award size={14} /> {score.match_tier}
        </div>
      )}

      {score.notes && (
        <div className="byt-mm-breakdown__notes">
          <span style={{ fontWeight: 600, fontSize: 12 }}>Scoring Notes:</span>
          <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0' }}>{score.notes}</p>
        </div>
      )}
    </div>
  );
};


// =============================================================================
// RESPONSE VIEWER — Displays full RFQ questionnaire responses
// =============================================================================

const SECTION_LABELS = {
  baseline: 'Firm Profile',
  discipline_architect: 'Design Philosophy & Process',
  discipline_interior_designer: 'Design Philosophy & Process',
  discipline_pm: 'Management Approach',
  discipline_gc: 'Construction Approach',
  synergy: 'Synergy & Collaboration',
  capabilities: 'Project Capabilities',
};

const SECTION_ORDER = ['baseline', 'discipline_architect', 'discipline_interior_designer', 'discipline_pm', 'discipline_gc', 'synergy', 'capabilities'];

const ResponseViewer = ({ invitationId, firmName, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (!invitationId) return;
    let mounted = true;
    setLoading(true);
    rfqGetInvitationResponses(invitationId)
      .then(result => {
        if (!mounted) return;
        setData(result);
        // Auto-select first section that has responses
        const responses = result.responses || [];
        const sections = [...new Set(responses.map(r => r.section_key).filter(Boolean))];
        const ordered = SECTION_ORDER.filter(s => sections.includes(s));
        if (ordered.length > 0) setActiveSection(ordered[0]);
        else if (sections.length > 0) setActiveSection(sections[0]);
      })
      .catch(err => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [invitationId]);

  if (loading) {
    return (
      <div className="byt-response-viewer">
        <div className="byt-response-viewer__header">
          <span><Eye size={14} /> Loading responses...</span>
          <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={onClose}><X size={14} /></button>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="byt-response-viewer">
        <div className="byt-response-viewer__header">
          <span style={{ color: COLORS.error }}><AlertTriangle size={14} /> {error}</span>
          <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={onClose}><X size={14} /></button>
        </div>
      </div>
    );
  }

  const responses = data?.responses || [];
  const portfolio = data?.portfolio || [];
  const sections = [...new Set(responses.map(r => r.section_key).filter(Boolean))];
  const orderedSections = SECTION_ORDER.filter(s => sections.includes(s));
  // Add any sections not in our predefined order
  sections.forEach(s => { if (!orderedSections.includes(s)) orderedSections.push(s); });

  const sectionResponses = responses.filter(r => r.section_key === activeSection);

  const formatResponseValue = (val, inputType) => {
    if (!val) return '—';
    // Try parsing JSON arrays
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch { /* not JSON */ }
    return val;
  };

  return (
    <div className="byt-response-viewer">
      <div className="byt-response-viewer__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eye size={14} style={{ color: COLORS.navy }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.navy }}>
            RFQ Responses — {firmName}
          </span>
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>
            {responses.length} answers · {portfolio.filter(p => p.project_name && p.project_name !== 'Project 1').length} portfolio projects
          </span>
        </div>
        <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={onClose}><X size={14} /> Close</button>
      </div>

      {/* Section tabs */}
      <div className="byt-response-viewer__tabs">
        {orderedSections.map(sKey => (
          <button key={sKey}
            className={`byt-response-viewer__tab ${activeSection === sKey ? 'byt-response-viewer__tab--active' : ''}`}
            onClick={() => setActiveSection(sKey)}>
            {SECTION_LABELS[sKey] || sKey}
            <span className="byt-response-viewer__tab-count">
              {responses.filter(r => r.section_key === sKey).length}
            </span>
          </button>
        ))}
        {portfolio.filter(p => p.project_name && p.project_name !== 'Project 1').length > 0 && (
          <button
            className={`byt-response-viewer__tab ${activeSection === '_portfolio' ? 'byt-response-viewer__tab--active' : ''}`}
            onClick={() => setActiveSection('_portfolio')}>
            Portfolio
            <span className="byt-response-viewer__tab-count">
              {portfolio.filter(p => p.project_name && p.project_name !== 'Project 1').length}
            </span>
          </button>
        )}
      </div>

      {/* Response content */}
      <div className="byt-response-viewer__content">
        {activeSection === '_portfolio' ? (
          <div className="byt-response-viewer__portfolio">
            {portfolio.filter(p => p.project_name && p.project_name !== 'Project 1').map((proj, idx) => (
              <div key={proj.id || idx} className="byt-response-viewer__portfolio-card">
                <div className="byt-response-viewer__portfolio-name">{proj.project_name}</div>
                <div className="byt-response-viewer__portfolio-meta">
                  {proj.location && <span><MapPin size={11} /> {proj.location}</span>}
                  {proj.budget_range && <span>Budget: ${proj.budget_range}</span>}
                  {proj.square_footage && <span>{Number(proj.square_footage).toLocaleString()} SF</span>}
                  {proj.completion_year && <span>Completed: {proj.completion_year}</span>}
                </div>
                {proj.architectural_style && (
                  <div className="byt-response-viewer__qa">
                    <span className="byt-response-viewer__q">Style</span>
                    <span className="byt-response-viewer__a">{proj.architectural_style}</span>
                  </div>
                )}
                {proj.role_scope && (
                  <div className="byt-response-viewer__qa">
                    <span className="byt-response-viewer__q">Scope</span>
                    <span className="byt-response-viewer__a">{proj.role_scope}</span>
                  </div>
                )}
                {proj.key_features && proj.key_features.length > 0 && (
                  <div className="byt-response-viewer__qa">
                    <span className="byt-response-viewer__q">Features</span>
                    <span className="byt-response-viewer__a">
                      {(Array.isArray(proj.key_features) ? proj.key_features : []).join(', ')}
                    </span>
                  </div>
                )}
                {proj.publications && (
                  <div className="byt-response-viewer__qa">
                    <span className="byt-response-viewer__q">Publications</span>
                    <span className="byt-response-viewer__a">{proj.publications}</span>
                  </div>
                )}
                <div className="byt-response-viewer__portfolio-footer">
                  {proj.client_reference_available && (
                    <span style={{ color: COLORS.success, fontSize: 11 }}>
                      <CheckCircle2 size={11} /> Client reference available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="byt-response-viewer__responses">
            {sectionResponses.map((r, idx) => (
              <div key={r.id || idx} className="byt-response-viewer__qa">
                <span className="byt-response-viewer__q">
                  {r.question_text}
                  {r.question_help && (
                    <span className="byt-response-viewer__help" title={r.question_help}> ⓘ</span>
                  )}
                </span>
                <span className="byt-response-viewer__a">
                  {formatResponseValue(r.response_value, r.input_type)}
                </span>
              </div>
            ))}
            {sectionResponses.length === 0 && (
              <div style={{ padding: 16, color: COLORS.textMuted, fontSize: 12, textAlign: 'center' }}>
                No responses in this section.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// =============================================================================
// PIPELINE PROGRESS BAR
// =============================================================================

const PipelineProgress = ({ currentStatus, compact = false }) => {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStatus);

  if (compact) {
    return (
      <div className="byt-pipeline-progress byt-pipeline-progress--compact">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const StageIcon = stage.icon;
          return (
            <React.Fragment key={stage.key}>
              <div
                className={`byt-pipeline-step ${isComplete ? 'byt-pipeline-step--complete' : ''} ${isCurrent ? 'byt-pipeline-step--current' : ''}`}
                title={stage.label}
              >
                <div className="byt-pipeline-step__dot"
                  style={{
                    backgroundColor: isComplete || isCurrent ? stage.color : COLORS.border,
                    borderColor: isCurrent ? stage.color : 'transparent',
                  }}>
                  {isComplete ? (
                    <CheckCircle2 size={10} color="#fff" />
                  ) : (
                    <StageIcon size={10} color={isCurrent ? '#fff' : COLORS.textMuted} />
                  )}
                </div>
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="byt-pipeline-connector"
                  style={{ backgroundColor: idx < currentIdx ? PIPELINE_STAGES[idx + 1].color : COLORS.border }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="byt-pipeline-full-grid">
      <div className="byt-pipeline-full-grid__line">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isComplete = idx < currentIdx;
          return (
            <React.Fragment key={stage.key}>
              <div className="byt-pipeline-full-grid__dot-cell" />
              {idx < PIPELINE_STAGES.length - 1 && (
                <div className="byt-pipeline-full-grid__connector"
                  style={{ backgroundColor: isComplete ? PIPELINE_STAGES[idx + 1].color : COLORS.border }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="byt-pipeline-full-grid__icons">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const StageIcon = stage.icon;
          return (
            <div key={stage.key} className="byt-pipeline-full-grid__col">
              <div className={`byt-pipeline-full-grid__dot ${isComplete ? 'byt-pipeline-full-grid__dot--complete' : ''} ${isCurrent ? 'byt-pipeline-full-grid__dot--current' : ''}`}
                style={{
                  backgroundColor: isComplete || isCurrent ? stage.color : COLORS.border,
                  borderColor: isCurrent ? stage.color : 'transparent',
                }}>
                {isComplete ? (
                  <CheckCircle2 size={14} color="#fff" />
                ) : (
                  <StageIcon size={14} color={isCurrent ? '#fff' : COLORS.textMuted} />
                )}
              </div>
              <span className="byt-pipeline-full-grid__label"
                style={{ color: isComplete || isCurrent ? COLORS.text : COLORS.textMuted,
                         fontWeight: isCurrent ? 600 : 400 }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// =============================================================================
// ENGAGEMENT CARD (with config-driven scoring)
// =============================================================================

const EngagementCard = ({ engagement, score, onUpdate, onRemove, onComputeScore, configWeights, tiers }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    team_notes: engagement.team_notes || '',
    client_feedback: engagement.client_feedback || '',
    chemistry_score: engagement.chemistry_score || '',
    project_outcome: engagement.project_outcome || 'pending',
  });
  const [saving, setSaving] = useState(false);
  const [computing, setComputing] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [responseInvitationId, setResponseInvitationId] = useState(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);

  const currentStageIdx = PIPELINE_STAGES.findIndex(s => s.key === engagement.contact_status);
  const currentStage = PIPELINE_STAGES[currentStageIdx];
  const nextStage = currentStageIdx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[currentStageIdx + 1] : null;

  // Score priority: VPS overall_score > AI confidence > legacy match_score
  const displayScore = score?.overall_score || engagement.ai_confidence || engagement.match_score || null;
  const scoreSource = score?.overall_score ? 'match' : (engagement.ai_confidence ? 'ai' : 'legacy');
  const scoreColor = displayScore ? getTierColor(displayScore, tiers) : COLORS.textMuted;

  const hasResponse = ['questionnaire_received', 'under_review', 'proposal', 'engaged', 'contracted']
    .includes(engagement.contact_status);

  const handleAdvanceStage = useCallback(async () => {
    if (!nextStage) return;
    const now = new Date().toISOString();
    await onUpdate(engagement.id, { contact_status: nextStage.key, [nextStage.dateField]: now });
  }, [engagement.id, nextStage, onUpdate]);

  const handleSaveEdits = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {};
      if (editData.team_notes !== (engagement.team_notes || '')) payload.team_notes = editData.team_notes;
      if (editData.client_feedback !== (engagement.client_feedback || '')) payload.client_feedback = editData.client_feedback;
      if (editData.chemistry_score !== (engagement.chemistry_score || '')) {
        payload.chemistry_score = editData.chemistry_score ? parseInt(editData.chemistry_score) : null;
      }
      if (editData.project_outcome !== (engagement.project_outcome || 'pending')) {
        payload.project_outcome = editData.project_outcome;
      }
      if (Object.keys(payload).length > 0) await onUpdate(engagement.id, payload);
      setEditing(false);
    } catch (err) {
      console.error('[Matchmaking] Save error:', err);
    } finally { setSaving(false); }
  }, [editData, engagement, onUpdate]);

  const handleComputeScore = useCallback(async () => {
    if (!onComputeScore) return;
    setComputing(true);
    try { await onComputeScore(engagement); }
    finally { setComputing(false); }
  }, [engagement, onComputeScore]);

  const handleRemove = useCallback(() => {
    if (!window.confirm(`Remove ${engagement.firm_name || 'this consultant'} from the matchmaking pipeline?`)) return;
    onRemove(engagement.id);
  }, [engagement, onRemove]);

  const handleViewResponses = useCallback(async () => {
    if (showResponses) { setShowResponses(false); return; }
    if (responseInvitationId) { setShowResponses(true); return; }
    // Find the invitation for this engagement's consultant
    setLoadingInvitation(true);
    try {
      const invData = await rfqListInvitations({
        project_id: engagement.n4s_project_id || 'proj_thornwood_001',
        consultant_id: String(engagement.consultant_id)
      }).catch(() => ({ invitations: [] }));
      const inv = (invData.invitations || []).find(
        i => String(i.consultant_id) === String(engagement.consultant_id)
          && ['submitted', 'questionnaire_received'].includes(i.status)
      );
      if (inv) {
        setResponseInvitationId(inv.id);
        setShowResponses(true);
      } else {
        alert('No submitted RFQ response found for this consultant.');
      }
    } catch (err) {
      console.error('[Matchmaking] Fetch invitation error:', err);
      alert('Failed to load responses: ' + err.message);
    } finally { setLoadingInvitation(false); }
  }, [engagement, showResponses, responseInvitationId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`byt-engagement-card ${expanded ? 'byt-engagement-card--expanded' : ''}`}>
      {/* Card Header */}
      <div className="byt-engagement-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="byt-engagement-card__left">
          <div className="byt-engagement-card__score-wrapper">
            <div className="byt-engagement-card__score" style={{ borderColor: scoreColor }}>
              <span style={{ color: scoreColor, fontSize: displayScore ? 16 : 12 }}>
                {displayScore ? Math.round(displayScore) : '—'}
              </span>
            </div>
            {displayScore && (
              <span className="byt-engagement-card__score-tier" style={{ color: scoreColor }}>
                {getTierLabel(displayScore, tiers)}
              </span>
            )}
            {displayScore && scoreSource === 'ai' && (
              <span className="byt-engagement-card__score-source">AI Confidence</span>
            )}
          </div>
          <div className="byt-engagement-card__info">
            <h4 className="byt-engagement-card__firm">{engagement.firm_name || 'Unknown Firm'}</h4>
            {(engagement.first_name || engagement.last_name) && (
              <span className="byt-engagement-card__name">
                {engagement.first_name} {engagement.last_name}
              </span>
            )}
            <div className="byt-engagement-card__meta">
              {engagement.hq_city && (
                <span className="byt-meta-item">
                  <MapPin size={11} /> {engagement.hq_city}{engagement.hq_state ? `, ${engagement.hq_state}` : ''}
                </span>
              )}
              <span className="byt-meta-item" style={{ color: currentStage?.color }}>
                {currentStage?.icon && React.createElement(currentStage.icon, { size: 11 })}
                {currentStage?.label}
              </span>
              {hasResponse && !score && (
                <span className="byt-meta-item" style={{ color: COLORS.warning }}>
                  <Zap size={11} /> Score pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="byt-engagement-card__right">
          <PipelineProgress currentStatus={engagement.contact_status} compact />
          <span className="byt-engagement-card__expand-icon">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="byt-engagement-card__detail">
          {/* CONFIG-DRIVEN Score Breakdown */}
          {score && <ScoreBreakdown score={score} configWeights={configWeights} tiers={tiers} />}

          {hasResponse && !score && (
            <div style={{ padding: '12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: COLORS.warning }} />
                <span style={{ fontSize: 13, color: '#92400e' }}>
                  RFQ response received — ready for scoring
                </span>
                <button className="byt-btn byt-btn--gold byt-btn--sm"
                  onClick={(e) => { e.stopPropagation(); handleComputeScore(); }}
                  disabled={computing} style={{ marginLeft: 'auto' }}>
                  <Play size={13} /> {computing ? 'Computing...' : 'Compute Score'}
                </button>
              </div>
            </div>
          )}

          {/* Full pipeline with dates */}
          <div className="byt-engagement-card__pipeline-full">
            <div className="byt-pipeline-dated-grid">
              {PIPELINE_STAGES.map((stage, idx) => {
                const stageIdx = idx;
                const isComplete = stageIdx < currentStageIdx;
                const isCurrent = stageIdx === currentStageIdx;
                const isReached = stageIdx <= currentStageIdx;
                const StageIcon = stage.icon;
                const dateVal = engagement[stage.dateField];

                return (
                  <div key={stage.key} className="byt-pipeline-dated-grid__col">
                    <div className="byt-pipeline-dated-grid__dot-row">
                      {idx > 0 && (
                        <div className="byt-pipeline-dated-grid__connector-left"
                          style={{ backgroundColor: isComplete || isCurrent ? stage.color : COLORS.border }} />
                      )}
                      <div className={`byt-pipeline-dated-grid__dot ${isComplete ? 'byt-pipeline-dated-grid__dot--complete' : ''} ${isCurrent ? 'byt-pipeline-dated-grid__dot--current' : ''}`}
                        style={{
                          backgroundColor: isComplete || isCurrent ? stage.color : COLORS.border,
                          borderColor: isCurrent ? stage.color : 'transparent',
                        }}>
                        {isComplete ? (
                          <CheckCircle2 size={14} color="#fff" />
                        ) : (
                          <StageIcon size={14} color={isCurrent ? '#fff' : COLORS.textMuted} />
                        )}
                      </div>
                      {idx < PIPELINE_STAGES.length - 1 && (
                        <div className="byt-pipeline-dated-grid__connector-right"
                          style={{ backgroundColor: isComplete ? PIPELINE_STAGES[idx + 1].color : COLORS.border }} />
                      )}
                    </div>
                    <span className="byt-pipeline-dated-grid__label"
                      style={{ color: isReached ? COLORS.text : COLORS.textMuted,
                               fontWeight: isCurrent ? 600 : 400 }}>
                      {stage.label}
                    </span>
                    <span className="byt-pipeline-dated-grid__date"
                      style={{ color: isReached ? COLORS.text : COLORS.textMuted }}>
                      {dateVal ? formatDate(dateVal) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legacy scores */}
          {(engagement.client_fit_score || engagement.project_fit_score || engagement.chemistry_score) && (
            <div className="byt-engagement-card__scores-row">
              {engagement.client_fit_score && (
                <div className="byt-engagement-card__score-item">
                  <span className="byt-engagement-card__score-label">Client Fit</span>
                  <span className="byt-engagement-card__score-value">{engagement.client_fit_score}</span>
                </div>
              )}
              {engagement.project_fit_score && (
                <div className="byt-engagement-card__score-item">
                  <span className="byt-engagement-card__score-label">Project Fit</span>
                  <span className="byt-engagement-card__score-value">{engagement.project_fit_score}</span>
                </div>
              )}
              {engagement.chemistry_score && (
                <div className="byt-engagement-card__score-item">
                  <span className="byt-engagement-card__score-label">Chemistry</span>
                  <span className="byt-engagement-card__score-value" style={{ color: COLORS.gold }}>
                    {engagement.chemistry_score}/10
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes & Feedback */}
          {!editing ? (
            <div className="byt-engagement-card__notes-section">
              {engagement.team_notes && (
                <div className="byt-engagement-card__note-block">
                  <span className="byt-engagement-card__note-label">Team Notes</span>
                  <p className="byt-engagement-card__note-text">{engagement.team_notes}</p>
                </div>
              )}
              {engagement.client_feedback && (
                <div className="byt-engagement-card__note-block">
                  <span className="byt-engagement-card__note-label">Client Feedback</span>
                  <p className="byt-engagement-card__note-text">{engagement.client_feedback}</p>
                </div>
              )}
              {engagement.project_outcome && engagement.project_outcome !== 'pending' && (
                <div className="byt-engagement-card__note-block">
                  <span className="byt-engagement-card__note-label">Outcome</span>
                  <span className="byt-engagement-card__outcome-badge">
                    {PROJECT_OUTCOMES.find(o => o.value === engagement.project_outcome)?.label || engagement.project_outcome}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="byt-engagement-card__edit-section">
              <div className="byt-engagement-card__edit-field">
                <label>Team Notes</label>
                <textarea value={editData.team_notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, team_notes: e.target.value }))}
                  placeholder="Internal notes about this engagement..." rows={3} />
              </div>
              <div className="byt-engagement-card__edit-field">
                <label>Client Feedback</label>
                <textarea value={editData.client_feedback}
                  onChange={(e) => setEditData(prev => ({ ...prev, client_feedback: e.target.value }))}
                  placeholder="Client's feedback after meetings..." rows={3} />
              </div>
              <div className="byt-engagement-card__edit-row">
                <div className="byt-engagement-card__edit-field byt-engagement-card__edit-field--half">
                  <label>Chemistry Score (1-10)</label>
                  <input type="number" min="1" max="10" value={editData.chemistry_score}
                    onChange={(e) => setEditData(prev => ({ ...prev, chemistry_score: e.target.value }))}
                    placeholder="—" />
                </div>
                <div className="byt-engagement-card__edit-field byt-engagement-card__edit-field--half">
                  <label>Project Outcome</label>
                  <select value={editData.project_outcome}
                    onChange={(e) => setEditData(prev => ({ ...prev, project_outcome: e.target.value }))}>
                    {PROJECT_OUTCOMES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="byt-engagement-card__actions">
            {!editing ? (
              <>
                <button className="byt-btn byt-btn--ghost byt-btn--sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
                  <Edit2 size={14} /> Edit Notes
                </button>
                {hasResponse && (
                  <button className="byt-btn byt-btn--ghost byt-btn--sm"
                    onClick={(e) => { e.stopPropagation(); handleViewResponses(); }}
                    disabled={loadingInvitation}
                    style={{ color: showResponses ? COLORS.navy : undefined }}>
                    <Eye size={14} /> {loadingInvitation ? 'Loading...' : showResponses ? 'Hide Responses' : 'View Responses'}
                  </button>
                )}
                {nextStage && (
                  <button className="byt-btn byt-btn--primary byt-btn--sm"
                    onClick={(e) => { e.stopPropagation(); handleAdvanceStage(); }}>
                    <ArrowRight size={14} /> Move to {nextStage.label}
                  </button>
                )}
                {engagement.contact_status === 'contracted' && (
                  <span className="byt-engagement-card__contracted-badge">
                    <Shield size={14} /> Contracted
                  </span>
                )}
                <button className="byt-btn byt-btn--ghost byt-btn--sm byt-btn--danger"
                  onClick={(e) => { e.stopPropagation(); handleRemove(); }}>
                  <Trash2 size={14} /> Remove
                </button>
              </>
            ) : (
              <>
                <button className="byt-btn byt-btn--ghost byt-btn--sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(false); }} disabled={saving}>
                  <X size={14} /> Cancel
                </button>
                <button className="byt-btn byt-btn--primary byt-btn--sm"
                  onClick={(e) => { e.stopPropagation(); handleSaveEdits(); }} disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>

          {/* RFQ Response Viewer */}
          {showResponses && responseInvitationId && (
            <ResponseViewer
              invitationId={responseInvitationId}
              firmName={engagement.firm_name || 'Consultant'}
              onClose={() => setShowResponses(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};


// =============================================================================
// DISCIPLINE GROUP
// =============================================================================

const DisciplineGroup = ({ disciplineKey, engagements, scoreMap, onUpdate, onRemove, onComputeScore, configWeights, tiers }) => {
  const disc = DISCIPLINES[disciplineKey];
  const [collapsed, setCollapsed] = useState(false);
  if (!disc) return null;

  const stageOrder = { contracted: 7, engaged: 6, proposal: 5, under_review: 4, questionnaire_received: 3, questionnaire_sent: 2, contacted: 1, shortlisted: 0 };
  const sorted = [...engagements].sort((a, b) => {
    const aScore = scoreMap[a.consultant_id]?.overall_score || a.ai_confidence || 0;
    const bScore = scoreMap[b.consultant_id]?.overall_score || b.ai_confidence || 0;
    if (aScore && !bScore) return -1;
    if (!aScore && bScore) return 1;
    if (aScore && bScore) return bScore - aScore;
    return (stageOrder[b.contact_status] || 0) - (stageOrder[a.contact_status] || 0);
  });

  const scoredCount = sorted.filter(e => scoreMap[e.consultant_id]).length;
  const responseCount = sorted.filter(e =>
    ['questionnaire_received', 'under_review', 'proposal', 'engaged', 'contracted'].includes(e.contact_status)
  ).length;

  return (
    <div className="byt-assembly-discipline-group">
      <div className="byt-assembly-discipline-group__header"
        onClick={() => setCollapsed(!collapsed)} style={{ borderLeftColor: disc.color }}>
        <div className="byt-assembly-discipline-group__title-row">
          <span className="byt-assembly-discipline-group__icon">{disc.icon}</span>
          <h3 className="byt-assembly-discipline-group__title">{disc.label}</h3>
          <span className="byt-assembly-discipline-group__count">
            {engagements.length} candidate{engagements.length !== 1 ? 's' : ''}
            {scoredCount > 0 && (
              <span style={{ color: COLORS.gold, marginLeft: 8 }}>· {scoredCount} scored</span>
            )}
            {responseCount > scoredCount && (
              <span style={{ color: COLORS.warning, marginLeft: 8 }}>
                · {responseCount - scoredCount} awaiting score
              </span>
            )}
          </span>
        </div>
        <span className="byt-assembly-discipline-group__toggle">
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {!collapsed && (
        <div className="byt-assembly-discipline-group__body">
          {sorted.length === 0 ? (
            <div className="byt-assembly-discipline-group__empty">
              <span>No candidates shortlisted. Use the Shortlist tab to curate {disc.label.toLowerCase()} candidates.</span>
            </div>
          ) : (
            sorted.map(eng => (
              <EngagementCard key={eng.id} engagement={eng}
                score={scoreMap[eng.consultant_id] || null}
                onUpdate={onUpdate} onRemove={onRemove} onComputeScore={onComputeScore}
                configWeights={configWeights} tiers={tiers} />
            ))
          )}
        </div>
      )}
    </div>
  );
};


// =============================================================================
// MAIN MATCHMAKING SCREEN — CONFIG-DRIVEN
// =============================================================================

const BYTMatchmakingScreen = () => {
  const { activeProjectId } = useAppContext();
  const projectId = activeProjectId;

  // CONFIG WIRING: Load resolved configuration
  const { config: effectiveConfig } = useBYTConfig();
  const configWeights = effectiveConfig?.scoring?.weights || {};
  const tiers = effectiveConfig?.scoring?.tiers || null;

  const [engagements, setEngagements] = useState([]);
  const [vpsScores, setVpsScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoringAll, setScoringAll] = useState(false);
  const [error, setError] = useState(null);
  const [scoringError, setScoringError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [engData, scoreData] = await Promise.all([
        engagementApi.fetchAll(projectId || 'default'),
        projectId
          ? rfqGetScores(projectId).catch(() => ({ scores: [] }))
          : Promise.resolve({ scores: [] })
      ]);
      setEngagements((engData.engagements || []).map(eng => ({
        ...eng,
        // Map IONOS date fields to pipeline-expected fields
        questionnaire_sent_at: eng.questionnaire_sent_at || eng.date_contacted || null,
        questionnaire_received_at: eng.questionnaire_received_at || eng.date_responded || null,
      })));
      setVpsScores(scoreData.scores || []);
    } catch (err) {
      console.error('[Matchmaking] Load error:', err);
      setError(err.message);
    } finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const scoreMap = useMemo(() => {
    const map = {};
    for (const s of vpsScores) {
      if (!s.consultant_id) continue;
      // Transform flat VPS score fields into dimensions object for ScoreBreakdown
      map[s.consultant_id] = {
        ...s,
        quantitative_score: Number(s.quantitative_total) || 0,
        qualitative_score: Number(s.qualitative_total) || 0,
        dimensions: {
          scale_match:            Number(s.scale_match_score) || 0,
          financial_resilience:   Number(s.financial_resilience_score) || 0,
          geographic_alignment:   Number(s.geographic_score) || 0,
          capability_coverage:    Number(s.capability_coverage_score) || 0,
          portfolio_relevance:    Number(s.portfolio_relevance_score) || 0,
          tech_compatibility:     Number(s.tech_compatibility_score) || 0,
          credentials:            Number(s.credentials_score) || 0,
          philosophy_alignment:   Number(s.philosophy_alignment_score) || 0,
          methodology_fit:        Number(s.methodology_fit_score) || 0,
          collaboration_maturity: Number(s.collaboration_maturity_score) || 0,
        },
      };
    }
    return map;
  }, [vpsScores]);

  const engagementsByDiscipline = useMemo(() => {
    const groups = {};
    Object.keys(DISCIPLINES).forEach(key => { groups[key] = []; });
    engagements.forEach(eng => {
      const disc = eng.discipline || 'architect';
      if (!groups[disc]) groups[disc] = [];
      groups[disc].push(eng);
    });
    return groups;
  }, [engagements]);

  const handleUpdate = useCallback(async (engagementId, updateData) => {
    try {
      await engagementApi.update(engagementId, updateData);
      await loadData();
    } catch (err) {
      console.error('[Matchmaking] Update error:', err);
      alert('Failed to update engagement: ' + err.message);
    }
  }, [loadData]);

  const handleRemove = useCallback(async (engagementId) => {
    try {
      await engagementApi.remove(engagementId);
      setEngagements(prev => prev.filter(e => e.id !== engagementId));
    } catch (err) {
      console.error('[Matchmaking] Remove error:', err);
      alert('Failed to remove engagement: ' + err.message);
    }
  }, []);

  const handleComputeAllScores = useCallback(async () => {
    if (!projectId) return;
    setScoringAll(true);
    setScoringError(null);
    try {
      await rfqComputeAllScores(projectId);
      const scoreData = await rfqGetScores(projectId).catch(() => ({ scores: [] }));
      setVpsScores(scoreData.scores || []);
    } catch (err) {
      console.error('[Matchmaking] Score all error:', err);
      setScoringError(err.message);
    } finally { setScoringAll(false); }
  }, [projectId]);

  const handleComputeScore = useCallback(async (engagement) => {
    if (!projectId) return;
    try {
      const invData = await rfqListInvitations({
        project_id: projectId,
        consultant_id: String(engagement.consultant_id)
      }).catch(() => ({ invitations: [] }));

      const invitation = (invData.invitations || []).find(
        inv => String(inv.consultant_id) === String(engagement.consultant_id) && inv.status === 'submitted'
      );

      if (!invitation) {
        alert('No submitted RFQ response found for this consultant.');
        return;
      }
      await rfqComputeScore(invitation.id);
      const scoreData = await rfqGetScores(projectId).catch(() => ({ scores: [] }));
      setVpsScores(scoreData.scores || []);
    } catch (err) {
      console.error('[Matchmaking] Single score error:', err);
      alert('Scoring failed: ' + err.message);
    }
  }, [projectId]);

  // Stats
  const totalEngagements = engagements.length;
  const contractedCount = engagements.filter(e => e.contact_status === 'contracted').length;
  const engagedCount = engagements.filter(e => e.contact_status === 'engaged').length;
  const scoredCount = Object.keys(scoreMap).length;
  const responseCount = engagements.filter(e =>
    ['questionnaire_received', 'under_review', 'proposal', 'engaged', 'contracted'].includes(e.contact_status)
  ).length;

  return (
    <div className="byt-assembly-screen">

      {/* Team Composition Summary — CONFIG-DRIVEN tiers */}
      <TeamCompositionSummary engagementsByDiscipline={engagementsByDiscipline} scoreMap={scoreMap} tiers={tiers} />

      {/* Stats + Scoring Controls */}
      <div className="byt-assembly-stats-bar">
        <div className="byt-assembly-stat">
          <span className="byt-assembly-stat__value">{totalEngagements}</span>
          <span className="byt-assembly-stat__label">Total</span>
        </div>
        <div className="byt-assembly-stat">
          <span className="byt-assembly-stat__value" style={{ color: COLORS.gold }}>{scoredCount}</span>
          <span className="byt-assembly-stat__label">Scored</span>
        </div>
        <div className="byt-assembly-stat">
          <span className="byt-assembly-stat__value" style={{ color: COLORS.warning }}>{responseCount}</span>
          <span className="byt-assembly-stat__label">Responses</span>
        </div>
        <div className="byt-assembly-stat">
          <span className="byt-assembly-stat__value" style={{ color: COLORS.success }}>{engagedCount}</span>
          <span className="byt-assembly-stat__label">Engaged</span>
        </div>
        <div className="byt-assembly-stat">
          <span className="byt-assembly-stat__value" style={{ color: COLORS.gold }}>{contractedCount}</span>
          <span className="byt-assembly-stat__label">Contracted</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {responseCount > scoredCount && (
            <button className="byt-btn byt-btn--gold byt-btn--sm"
              onClick={handleComputeAllScores} disabled={scoringAll}
              title="Score all candidates with submitted RFQ responses">
              <Zap size={14} />
              {scoringAll ? 'Scoring...' : `Score All (${responseCount - scoredCount} pending)`}
            </button>
          )}
          <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={loadData} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {scoringError && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#d32f2f', borderRadius: 6, fontSize: 13, margin: '0 0 12px' }}>
          <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Scoring error: {scoringError}
        </div>
      )}

      {loading && (
        <div className="byt-loading">
          <RefreshCw size={24} className="spinning" />
          <p>Loading matchmaking pipeline...</p>
        </div>
      )}

      {error && (
        <div className="byt-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button className="byt-btn byt-btn--primary" onClick={loadData}>Retry</button>
        </div>
      )}

      {/* CONFIG-DRIVEN Discipline Groups — weights + tiers passed through */}
      {!loading && !error && (
        <div className="byt-assembly-groups">
          {Object.keys(DISCIPLINES).map(key => (
            <DisciplineGroup key={key} disciplineKey={key}
              engagements={engagementsByDiscipline[key]} scoreMap={scoreMap}
              onUpdate={handleUpdate} onRemove={handleRemove} onComputeScore={handleComputeScore}
              configWeights={configWeights} tiers={tiers} />
          ))}
        </div>
      )}

      {!loading && !error && totalEngagements === 0 && (
        <div className="byt-empty" style={{ marginTop: '1rem' }}>
          <Briefcase size={48} />
          <h3>No Team Members Yet</h3>
          <p>
            Use the Shortlist tab to curate candidates from Discovery, then send RFQ questionnaires.
            Once responses are received, scoring becomes available here.
          </p>
        </div>
      )}

      <style>{mmStyles}</style>
    </div>
  );
};


// =============================================================================
// SCORING BREAKDOWN STYLES
// =============================================================================

const mmStyles = `
.byt-pipeline-dated-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  width: 100%;
  margin: 8px 0;
}
.byt-pipeline-dated-grid__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}
.byt-pipeline-dated-grid__dot-row {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  height: 32px;
  position: relative;
}
.byt-pipeline-dated-grid__connector-left {
  position: absolute;
  left: 0;
  right: 50%;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
}
.byt-pipeline-dated-grid__connector-right {
  position: absolute;
  left: 50%;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
}
.byt-pipeline-dated-grid__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  flex-shrink: 0;
}
.byt-pipeline-dated-grid__dot--current {
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.15);
}
.byt-pipeline-dated-grid__label {
  font-size: 11px;
  margin-top: 6px;
  line-height: 1.2;
  white-space: nowrap;
}
.byt-pipeline-dated-grid__date {
  font-size: 10px;
  margin-top: 2px;
  opacity: 0.7;
}
.byt-pipeline-full-grid__icons {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  width: 100%;
}
.byt-pipeline-full-grid__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.byt-pipeline-full-grid__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}
.byt-pipeline-full-grid__dot--current {
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.15);
}
.byt-pipeline-full-grid__label {
  font-size: 11px;
  margin-top: 4px;
  line-height: 1.2;
  white-space: nowrap;
}
.byt-mm-breakdown {
  background: #fafaf8;
  border: 1px solid #e5e5e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.byt-mm-breakdown__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 10px;
}
.byt-mm-breakdown__split {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: #6b6b6b;
}
.byt-mm-breakdown__dims {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.byt-mm-dim {
  display: grid;
  grid-template-columns: 180px 1fr 36px;
  gap: 8px;
  align-items: center;
}
.byt-mm-dim__label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1a1a1a;
}
.byt-mm-dim__weight {
  font-size: 10px;
  color: #999;
  margin-left: auto;
}
.byt-mm-dim__bar {
  height: 6px;
  background: #e5e5e0;
  border-radius: 3px;
  overflow: hidden;
}
.byt-mm-dim__fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.byt-mm-dim__value {
  font-size: 12px;
  font-weight: 700;
  text-align: right;
}
.byt-mm-breakdown__tier {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #e5e5e0;
}
.byt-mm-breakdown__notes {
  margin-top: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e5e5e0;
}
@media (max-width: 768px) {
  .byt-mm-dim { grid-template-columns: 1fr; gap: 2px; }
  .byt-pipeline-dated-grid { grid-template-columns: repeat(4, 1fr); row-gap: 12px; }
  .byt-pipeline-full-grid__icons { grid-template-columns: repeat(4, 1fr); row-gap: 8px; }
  .byt-pipeline-dated-grid__connector-left,
  .byt-pipeline-dated-grid__connector-right { display: none; }
}
.byt-engagement-card__score-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 56px;
  flex-shrink: 0;
}
.byt-engagement-card__score-tier {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.byt-engagement-card__score-source {
  font-size: 9px;
  color: #999;
  line-height: 1;
  white-space: nowrap;
}
`;


export default BYTMatchmakingScreen;
