/**
 * GIDAssemblyScreen.jsx — Team Assembly Screen
 *
 * Final tab of GID module. Manages the engagement pipeline for shortlisted consultants.
 * 
 * Features:
 * - Team Composition Summary (4 discipline slots, readiness %)
 * - Discipline-grouped engagement rows with pipeline status
 * - Status progression through 7 stages with auto-dated milestones
 * - Expandable detail: team notes, client feedback, chemistry score, project outcome
 * - Remove/archive action
 *
 * Data source: gid_engagements table (records created by Matchmaking shortlist action)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Users, Briefcase, ChevronDown, ChevronUp, X, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, ArrowRight, Phone,
  MessageSquare, Calendar, FileText, UserCheck, Shield,
  MapPin, Star, Edit2, Save, Trash2, Award,
  ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';

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

// Discipline definitions (matching GIDModule.jsx)
const DISCIPLINES = {
  architect:          { label: 'Architect',          color: '#315098', icon: '🏛',  slot: 'architect' },
  interior_designer:  { label: 'Interior Designer',  color: '#8CA8BE', icon: '🎨',  slot: 'interiorDesigner' },
  pm:                 { label: 'PM / Owner\'s Rep',  color: '#AFBDB0', icon: '📋',  slot: 'projectManager' },
  gc:                 { label: 'General Contractor', color: '#C4A484', icon: '🔨',  slot: 'generalContractor' },
};

// Pipeline stages with metadata
const PIPELINE_STAGES = [
  { key: 'shortlisted',  label: 'Shortlisted',  icon: Star,         dateField: 'date_shortlisted', color: COLORS.textMuted },
  { key: 'contacted',    label: 'Contacted',     icon: Phone,        dateField: 'date_contacted',   color: COLORS.info },
  { key: 'responded',    label: 'Responded',     icon: MessageSquare, dateField: 'date_responded',   color: '#5c6bc0' },
  { key: 'meeting',      label: 'Meeting',       icon: Calendar,     dateField: 'date_meeting',     color: COLORS.warning },
  { key: 'proposal',     label: 'Proposal',      icon: FileText,     dateField: 'date_proposal',    color: '#7b1fa2' },
  { key: 'engaged',      label: 'Engaged',       icon: UserCheck,    dateField: 'date_engaged',     color: COLORS.success },
  { key: 'contracted',   label: 'Contracted',    icon: Shield,       dateField: 'date_contracted',  color: COLORS.gold },
];

const PROJECT_OUTCOMES = [
  { value: 'pending',      label: 'Pending' },
  { value: 'active',       label: 'Active' },
  { value: 'completed',    label: 'Completed' },
  { value: 'on_hold',      label: 'On Hold' },
  { value: 'withdrawn',    label: 'Withdrawn' },
  { value: 'declined',     label: 'Declined' },
];

// API base URL
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';


// =============================================================================
// ENGAGEMENT API HELPERS
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

const TeamCompositionSummary = ({ engagementsByDiscipline }) => {
  // For each discipline, find the most advanced engagement
  const slots = Object.entries(DISCIPLINES).map(([key, disc]) => {
    const engagements = engagementsByDiscipline[key] || [];
    const mostAdvanced = engagements.reduce((best, eng) => {
      const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === eng.contact_status);
      const bestIdx = best ? PIPELINE_STAGES.findIndex(s => s.key === best.contact_status) : -1;
      return stageIdx > bestIdx ? eng : best;
    }, null);

    const isFilled = mostAdvanced && ['engaged', 'contracted'].includes(mostAdvanced.contact_status);
    const isInProgress = mostAdvanced && !isFilled;

    return {
      key,
      disc,
      count: engagements.length,
      mostAdvanced,
      isFilled,
      isInProgress,
      status: isFilled ? 'filled' : isInProgress ? 'in_progress' : 'open',
    };
  });

  const filledCount = slots.filter(s => s.isFilled).length;
  const inProgressCount = slots.filter(s => s.isInProgress).length;
  const readiness = Math.round((filledCount / 4) * 100);

  return (
    <div className="gid-assembly-composition">
      <div className="gid-assembly-composition__header">
        <div className="gid-assembly-composition__title-row">
          <h3 className="gid-assembly-composition__title">Team Composition</h3>
          <div className="gid-assembly-composition__readiness">
            <div className="gid-assembly-composition__readiness-bar">
              <div
                className="gid-assembly-composition__readiness-fill"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <span className="gid-assembly-composition__readiness-label">
              {filledCount}/4 roles filled ({readiness}%)
            </span>
          </div>
        </div>
        {inProgressCount > 0 && (
          <span className="gid-assembly-composition__progress-note">
            {inProgressCount} role{inProgressCount > 1 ? 's' : ''} in pipeline
          </span>
        )}
      </div>

      <div className="gid-assembly-composition__slots">
        {slots.map(slot => {
          const stageInfo = slot.mostAdvanced
            ? PIPELINE_STAGES.find(s => s.key === slot.mostAdvanced.contact_status)
            : null;
          const StageIcon = stageInfo?.icon || Clock;

          return (
            <div
              key={slot.key}
              className={`gid-assembly-slot gid-assembly-slot--${slot.status}`}
              style={{ borderTopColor: slot.disc.color }}
            >
              <div className="gid-assembly-slot__icon">{slot.disc.icon}</div>
              <div className="gid-assembly-slot__info">
                <span className="gid-assembly-slot__discipline">{slot.disc.label}</span>
                {slot.mostAdvanced ? (
                  <>
                    <span className="gid-assembly-slot__firm">
                      {slot.mostAdvanced.firm_name || 'Unknown Firm'}
                    </span>
                    <span
                      className="gid-assembly-slot__status"
                      style={{ color: stageInfo?.color }}
                    >
                      <StageIcon size={12} />
                      {stageInfo?.label || slot.mostAdvanced.contact_status}
                    </span>
                  </>
                ) : (
                  <span className="gid-assembly-slot__empty">No candidates yet</span>
                )}
              </div>
              {slot.count > 1 && (
                <span className="gid-assembly-slot__count">
                  +{slot.count - 1} more
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// =============================================================================
// PIPELINE PROGRESS BAR
// =============================================================================

const PipelineProgress = ({ currentStatus, compact = false }) => {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStatus);

  return (
    <div className={`gid-pipeline-progress ${compact ? 'gid-pipeline-progress--compact' : ''}`}>
      {PIPELINE_STAGES.map((stage, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const StageIcon = stage.icon;

        return (
          <React.Fragment key={stage.key}>
            <div
              className={`gid-pipeline-step ${isComplete ? 'gid-pipeline-step--complete' : ''} ${isCurrent ? 'gid-pipeline-step--current' : ''}`}
              title={stage.label}
            >
              <div
                className="gid-pipeline-step__dot"
                style={{
                  backgroundColor: isComplete || isCurrent ? stage.color : COLORS.border,
                  borderColor: isCurrent ? stage.color : 'transparent',
                }}
              >
                {isComplete ? (
                  <CheckCircle2 size={compact ? 10 : 12} color="#fff" />
                ) : (
                  <StageIcon size={compact ? 10 : 12} color={isCurrent ? '#fff' : COLORS.textMuted} />
                )}
              </div>
              {!compact && (
                <span
                  className="gid-pipeline-step__label"
                  style={{ color: isComplete || isCurrent ? COLORS.text : COLORS.textMuted }}
                >
                  {stage.label}
                </span>
              )}
            </div>
            {idx < PIPELINE_STAGES.length - 1 && (
              <div
                className="gid-pipeline-connector"
                style={{
                  backgroundColor: idx < currentIdx ? PIPELINE_STAGES[idx + 1].color : COLORS.border,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


// =============================================================================
// ENGAGEMENT CARD
// =============================================================================

const EngagementCard = ({ engagement, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    team_notes: engagement.team_notes || '',
    client_feedback: engagement.client_feedback || '',
    chemistry_score: engagement.chemistry_score || '',
    project_outcome: engagement.project_outcome || 'pending',
  });
  const [saving, setSaving] = useState(false);

  const currentStageIdx = PIPELINE_STAGES.findIndex(s => s.key === engagement.contact_status);
  const currentStage = PIPELINE_STAGES[currentStageIdx];
  const nextStage = currentStageIdx < PIPELINE_STAGES.length - 1
    ? PIPELINE_STAGES[currentStageIdx + 1]
    : null;

  // Score color
  const scoreColor = (engagement.match_score || 0) >= 80
    ? COLORS.gold
    : (engagement.match_score || 0) >= 60
      ? COLORS.navy
      : COLORS.textMuted;

  // Advance to next stage
  const handleAdvanceStage = useCallback(async () => {
    if (!nextStage) return;
    const now = new Date().toISOString();
    await onUpdate(engagement.id, {
      contact_status: nextStage.key,
      [nextStage.dateField]: now,
    });
  }, [engagement.id, nextStage, onUpdate]);

  // Save edits
  const handleSaveEdits = useCallback(async () => {
    setSaving(true);
    try {
      const updatePayload = {};
      if (editData.team_notes !== (engagement.team_notes || '')) {
        updatePayload.team_notes = editData.team_notes;
      }
      if (editData.client_feedback !== (engagement.client_feedback || '')) {
        updatePayload.client_feedback = editData.client_feedback;
      }
      if (editData.chemistry_score !== (engagement.chemistry_score || '')) {
        updatePayload.chemistry_score = editData.chemistry_score ? parseInt(editData.chemistry_score) : null;
      }
      if (editData.project_outcome !== (engagement.project_outcome || 'pending')) {
        updatePayload.project_outcome = editData.project_outcome;
      }

      if (Object.keys(updatePayload).length > 0) {
        await onUpdate(engagement.id, updatePayload);
      }
      setEditing(false);
    } catch (err) {
      console.error('[Assembly] Save error:', err);
    } finally {
      setSaving(false);
    }
  }, [editData, engagement, onUpdate]);

  // Remove engagement
  const handleRemove = useCallback(() => {
    if (!window.confirm(`Remove ${engagement.firm_name || 'this consultant'} from the team assembly?`)) return;
    onRemove(engagement.id);
  }, [engagement, onRemove]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`gid-engagement-card ${expanded ? 'gid-engagement-card--expanded' : ''}`}>
      {/* Card Header */}
      <div className="gid-engagement-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="gid-engagement-card__left">
          <div className="gid-engagement-card__score" style={{ borderColor: scoreColor }}>
            <span style={{ color: scoreColor }}>{engagement.match_score || '—'}</span>
          </div>
          <div className="gid-engagement-card__info">
            <h4 className="gid-engagement-card__firm">{engagement.firm_name || 'Unknown Firm'}</h4>
            {(engagement.first_name || engagement.last_name) && (
              <span className="gid-engagement-card__name">
                {engagement.first_name} {engagement.last_name}
              </span>
            )}
            <div className="gid-engagement-card__meta">
              {engagement.hq_city && (
                <span className="gid-meta-item">
                  <MapPin size={11} />
                  {engagement.hq_city}{engagement.hq_state ? `, ${engagement.hq_state}` : ''}
                </span>
              )}
              <span className="gid-meta-item" style={{ color: currentStage?.color }}>
                {currentStage?.icon && React.createElement(currentStage.icon, { size: 11 })}
                {currentStage?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="gid-engagement-card__right">
          <PipelineProgress currentStatus={engagement.contact_status} compact />
          <span className="gid-engagement-card__expand-icon">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="gid-engagement-card__detail">
          {/* Full pipeline with dates */}
          <div className="gid-engagement-card__pipeline-full">
            <PipelineProgress currentStatus={engagement.contact_status} />
            <div className="gid-engagement-card__dates">
              {PIPELINE_STAGES.map(stage => {
                const dateVal = engagement[stage.dateField];
                const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === stage.key);
                const isReached = stageIdx <= currentStageIdx;
                return (
                  <div
                    key={stage.key}
                    className={`gid-engagement-card__date-item ${isReached ? 'gid-engagement-card__date-item--reached' : ''}`}
                  >
                    <span className="gid-engagement-card__date-label">{stage.label}</span>
                    <span className="gid-engagement-card__date-value">
                      {dateVal ? formatDate(dateVal) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scores */}
          <div className="gid-engagement-card__scores-row">
            <div className="gid-engagement-card__score-item">
              <span className="gid-engagement-card__score-label">Combined</span>
              <span className="gid-engagement-card__score-value" style={{ color: scoreColor }}>
                {engagement.match_score || '—'}
              </span>
            </div>
            <div className="gid-engagement-card__score-item">
              <span className="gid-engagement-card__score-label">Client Fit</span>
              <span className="gid-engagement-card__score-value">
                {engagement.client_fit_score || '—'}
              </span>
            </div>
            <div className="gid-engagement-card__score-item">
              <span className="gid-engagement-card__score-label">Project Fit</span>
              <span className="gid-engagement-card__score-value">
                {engagement.project_fit_score || '—'}
              </span>
            </div>
            {engagement.chemistry_score && (
              <div className="gid-engagement-card__score-item">
                <span className="gid-engagement-card__score-label">Chemistry</span>
                <span className="gid-engagement-card__score-value" style={{ color: COLORS.gold }}>
                  {engagement.chemistry_score}/10
                </span>
              </div>
            )}
          </div>

          {/* Notes & Feedback — View/Edit Mode */}
          {!editing ? (
            <div className="gid-engagement-card__notes-section">
              {engagement.team_notes && (
                <div className="gid-engagement-card__note-block">
                  <span className="gid-engagement-card__note-label">Team Notes</span>
                  <p className="gid-engagement-card__note-text">{engagement.team_notes}</p>
                </div>
              )}
              {engagement.client_feedback && (
                <div className="gid-engagement-card__note-block">
                  <span className="gid-engagement-card__note-label">Client Feedback</span>
                  <p className="gid-engagement-card__note-text">{engagement.client_feedback}</p>
                </div>
              )}
              {engagement.project_outcome && engagement.project_outcome !== 'pending' && (
                <div className="gid-engagement-card__note-block">
                  <span className="gid-engagement-card__note-label">Outcome</span>
                  <span className="gid-engagement-card__outcome-badge">
                    {PROJECT_OUTCOMES.find(o => o.value === engagement.project_outcome)?.label || engagement.project_outcome}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="gid-engagement-card__edit-section">
              <div className="gid-engagement-card__edit-field">
                <label>Team Notes</label>
                <textarea
                  value={editData.team_notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, team_notes: e.target.value }))}
                  placeholder="Internal notes about this engagement..."
                  rows={3}
                />
              </div>
              <div className="gid-engagement-card__edit-field">
                <label>Client Feedback</label>
                <textarea
                  value={editData.client_feedback}
                  onChange={(e) => setEditData(prev => ({ ...prev, client_feedback: e.target.value }))}
                  placeholder="Client's feedback after meetings..."
                  rows={3}
                />
              </div>
              <div className="gid-engagement-card__edit-row">
                <div className="gid-engagement-card__edit-field gid-engagement-card__edit-field--half">
                  <label>Chemistry Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editData.chemistry_score}
                    onChange={(e) => setEditData(prev => ({ ...prev, chemistry_score: e.target.value }))}
                    placeholder="—"
                  />
                </div>
                <div className="gid-engagement-card__edit-field gid-engagement-card__edit-field--half">
                  <label>Project Outcome</label>
                  <select
                    value={editData.project_outcome}
                    onChange={(e) => setEditData(prev => ({ ...prev, project_outcome: e.target.value }))}
                  >
                    {PROJECT_OUTCOMES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="gid-engagement-card__actions">
            {!editing ? (
              <>
                <button
                  className="gid-btn gid-btn--ghost gid-btn--sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                >
                  <Edit2 size={14} /> Edit Notes
                </button>
                {nextStage && (
                  <button
                    className="gid-btn gid-btn--primary gid-btn--sm"
                    onClick={(e) => { e.stopPropagation(); handleAdvanceStage(); }}
                  >
                    <ArrowRight size={14} /> Move to {nextStage.label}
                  </button>
                )}
                {engagement.contact_status === 'contracted' && (
                  <span className="gid-engagement-card__contracted-badge">
                    <Shield size={14} /> Contracted
                  </span>
                )}
                <button
                  className="gid-btn gid-btn--ghost gid-btn--sm gid-btn--danger"
                  onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </>
            ) : (
              <>
                <button
                  className="gid-btn gid-btn--ghost gid-btn--sm"
                  onClick={(e) => { e.stopPropagation(); setEditing(false); }}
                  disabled={saving}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  className="gid-btn gid-btn--primary gid-btn--sm"
                  onClick={(e) => { e.stopPropagation(); handleSaveEdits(); }}
                  disabled={saving}
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// =============================================================================
// DISCIPLINE GROUP
// =============================================================================

const DisciplineGroup = ({ disciplineKey, engagements, onUpdate, onRemove }) => {
  const disc = DISCIPLINES[disciplineKey];
  const [collapsed, setCollapsed] = useState(false);

  if (!disc) return null;

  // Sort engagements: contracted first, then by score desc
  const sorted = [...engagements].sort((a, b) => {
    const stageOrder = { contracted: 7, engaged: 6, proposal: 5, meeting: 4, responded: 3, contacted: 2, shortlisted: 1 };
    const aOrder = stageOrder[a.contact_status] || 0;
    const bOrder = stageOrder[b.contact_status] || 0;
    if (aOrder !== bOrder) return bOrder - aOrder;
    return (b.match_score || 0) - (a.match_score || 0);
  });

  return (
    <div className="gid-assembly-discipline-group">
      <div
        className="gid-assembly-discipline-group__header"
        onClick={() => setCollapsed(!collapsed)}
        style={{ borderLeftColor: disc.color }}
      >
        <div className="gid-assembly-discipline-group__title-row">
          <span className="gid-assembly-discipline-group__icon">{disc.icon}</span>
          <h3 className="gid-assembly-discipline-group__title">{disc.label}</h3>
          <span className="gid-assembly-discipline-group__count">{engagements.length} candidate{engagements.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="gid-assembly-discipline-group__toggle">
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {!collapsed && (
        <div className="gid-assembly-discipline-group__body">
          {sorted.length === 0 ? (
            <div className="gid-assembly-discipline-group__empty">
              <span>No candidates shortlisted. Use Matchmaking to add {disc.label.toLowerCase()} candidates.</span>
            </div>
          ) : (
            sorted.map(eng => (
              <EngagementCard
                key={eng.id}
                engagement={eng}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};


// =============================================================================
// MAIN ASSEMBLY SCREEN
// =============================================================================

const GIDAssemblyScreen = () => {
  const { activeProjectId } = useAppContext();

  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load engagements from API
  const loadEngagements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await engagementApi.fetchAll(activeProjectId || 'default');
      setEngagements(data.engagements || []);
    } catch (err) {
      console.error('[Assembly] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadEngagements();
  }, [loadEngagements]);

  // Group by discipline
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

  // Update engagement
  const handleUpdate = useCallback(async (engagementId, updateData) => {
    try {
      await engagementApi.update(engagementId, updateData);
      // Refresh from API to get clean state
      await loadEngagements();
    } catch (err) {
      console.error('[Assembly] Update error:', err);
      alert('Failed to update engagement: ' + err.message);
    }
  }, [loadEngagements]);

  // Remove engagement
  const handleRemove = useCallback(async (engagementId) => {
    try {
      await engagementApi.remove(engagementId);
      setEngagements(prev => prev.filter(e => e.id !== engagementId));
    } catch (err) {
      console.error('[Assembly] Remove error:', err);
      alert('Failed to remove engagement: ' + err.message);
    }
  }, []);

  // Stats
  const totalEngagements = engagements.length;
  const contractedCount = engagements.filter(e => e.contact_status === 'contracted').length;
  const engagedCount = engagements.filter(e => e.contact_status === 'engaged').length;

  return (
    <div className="gid-assembly-screen">

      {/* Team Composition Summary */}
      <TeamCompositionSummary engagementsByDiscipline={engagementsByDiscipline} />

      {/* Quick Stats Bar */}
      {totalEngagements > 0 && (
        <div className="gid-assembly-stats-bar">
          <div className="gid-assembly-stat">
            <span className="gid-assembly-stat__value">{totalEngagements}</span>
            <span className="gid-assembly-stat__label">Total Candidates</span>
          </div>
          <div className="gid-assembly-stat">
            <span className="gid-assembly-stat__value" style={{ color: COLORS.gold }}>
              {contractedCount}
            </span>
            <span className="gid-assembly-stat__label">Contracted</span>
          </div>
          <div className="gid-assembly-stat">
            <span className="gid-assembly-stat__value" style={{ color: COLORS.success }}>
              {engagedCount}
            </span>
            <span className="gid-assembly-stat__label">Engaged</span>
          </div>
          <button
            className="gid-btn gid-btn--ghost gid-btn--sm"
            onClick={loadEngagements}
            title="Refresh"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="gid-loading">
          <RefreshCw size={24} className="spinning" />
          <p>Loading team assembly...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="gid-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button className="gid-btn gid-btn--primary" onClick={loadEngagements}>Retry</button>
        </div>
      )}

      {/* Discipline Groups */}
      {!loading && !error && (
        <div className="gid-assembly-groups">
          {Object.keys(DISCIPLINES).map(key => (
            <DisciplineGroup
              key={key}
              disciplineKey={key}
              engagements={engagementsByDiscipline[key]}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Empty State (only if no engagements at all) */}
      {!loading && !error && totalEngagements === 0 && (
        <div className="gid-empty" style={{ marginTop: '1rem' }}>
          <Briefcase size={48} />
          <h3>No Team Members Yet</h3>
          <p>
            Use the Matchmaking tab to run the matching algorithm and shortlist consultants.
            Shortlisted candidates will appear here for pipeline management.
          </p>
        </div>
      )}
    </div>
  );
};

export default GIDAssemblyScreen;
