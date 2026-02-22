/**
 * BYTLibraryScreen.jsx — Library Tab (Tab 6)
 *
 * Two views:
 * 1. Project Responses — All RFQ responses received for the active project
 * 2. Consultant Library — Cross-project consultant database with import controls
 *
 * Features:
 * - Pipeline status bar (compact) per consultant showing shortlist→contracted progress
 * - Add to Shortlist button for consultants not yet in the active project's pipeline
 * - Side-by-side list + detail viewer for full questionnaire responses
 *
 * Data sources:
 *   VPS /api/admin/invitations?project_id=X → project responses
 *   VPS /api/library → cross-project consultant library
 *   VPS /api/admin/invitations/:id/responses → full response detail
 *   IONOS gid.php?entity=engagements → pipeline status per consultant
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  BookOpen, Users, ChevronDown, ChevronUp, Eye, X, Search,
  MapPin, Briefcase, Award, CheckCircle2, AlertTriangle,
  Star, Shield, FileText, Clock, RefreshCw, Filter,
  Phone, MessageSquare, Calendar, UserCheck, UserPlus, Zap
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import {
  rfqListInvitations, rfqGetInvitationResponses,
  rfqBrowseLibrary, rfqGetConsultantHistory
} from '../../../services/rfqApi';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
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

const DISCIPLINE_LABELS = {
  architect: 'Architect',
  interior_designer: 'Interior Designer',
  pm: "PM / Owner's Rep",
  gc: 'General Contractor',
};

const DISCIPLINE_COLORS = {
  architect: '#315098',
  interior_designer: '#8CA8BE',
  pm: '#AFBDB0',
  gc: '#C4A484',
};

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

// Pipeline stages (mirrors BYTMatchmakingScreen)
const PIPELINE_STAGES = [
  { key: 'shortlisted',            label: 'Shortlisted',   icon: Star,           color: '#6b6b6b' },
  { key: 'contacted',              label: 'Contacted',     icon: Phone,          color: '#1976d2' },
  { key: 'questionnaire_sent',     label: 'RFQ Sent',      icon: FileText,       color: '#5c6bc0' },
  { key: 'questionnaire_received', label: 'Response In',   icon: MessageSquare,  color: '#f57c00' },
  { key: 'under_review',           label: 'Under Review',  icon: Calendar,       color: '#7b1fa2' },
  { key: 'proposal',               label: 'Proposal',      icon: FileText,       color: '#7b1fa2' },
  { key: 'engaged',                label: 'Engaged',       icon: UserCheck,      color: '#2e7d32' },
  { key: 'contracted',             label: 'Contracted',    icon: Shield,         color: '#c9a227' },
];

// IONOS API base
const API_BASE = window.location.hostname.includes('ionos.space')
  ? '' : (window.location.hostname === 'localhost' ? 'http://localhost:3000' : '');


// =============================================================================
// PIPELINE MINI — Compact status bar for library rows
// =============================================================================

const PipelineMini = ({ currentStatus }) => {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStatus);
  if (currentIdx < 0) return null;

  return (
    <div className="byt-library-pipeline">
      {PIPELINE_STAGES.map((stage, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const StageIcon = stage.icon;
        return (
          <React.Fragment key={stage.key}>
            <div className="byt-library-pipeline__step" title={stage.label}>
              <div className="byt-library-pipeline__dot"
                style={{
                  backgroundColor: isComplete || isCurrent ? stage.color : COLORS.border,
                  borderColor: isCurrent ? stage.color : 'transparent',
                }}>
                {isComplete ? (
                  <CheckCircle2 size={8} color="#fff" />
                ) : (
                  <StageIcon size={8} color={isCurrent ? '#fff' : COLORS.textMuted} />
                )}
              </div>
            </div>
            {idx < PIPELINE_STAGES.length - 1 && (
              <div className="byt-library-pipeline__line"
                style={{ backgroundColor: idx < currentIdx ? PIPELINE_STAGES[idx + 1].color : COLORS.border }} />
            )}
          </React.Fragment>
        );
      })}
      <span className="byt-library-pipeline__label"
        style={{ color: PIPELINE_STAGES[currentIdx]?.color || COLORS.textMuted }}>
        {PIPELINE_STAGES[currentIdx]?.label}
      </span>
    </div>
  );
};


// =============================================================================
// RESPONSE DETAIL PANEL — Full questionnaire viewer
// =============================================================================

const ResponseDetailPanel = ({ invitationId, firmName, onClose }) => {
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
      <div className="byt-library-detail">
        <div className="byt-library-detail__header">
          <span><Clock size={14} /> Loading responses for {firmName}...</span>
          <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={onClose}><X size={14} /> Close</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="byt-library-detail">
        <div className="byt-library-detail__header">
          <span style={{ color: COLORS.error }}><AlertTriangle size={14} /> {error}</span>
          <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={onClose}><X size={14} /> Close</button>
        </div>
      </div>
    );
  }

  const responses = data?.responses || [];
  const portfolio = data?.portfolio || [];
  const invitation = data?.invitation || {};
  const sections = [...new Set(responses.map(r => r.section_key).filter(Boolean))];
  const orderedSections = SECTION_ORDER.filter(s => sections.includes(s));
  sections.forEach(s => { if (!orderedSections.includes(s)) orderedSections.push(s); });

  const sectionResponses = responses.filter(r => r.section_key === activeSection);
  const validPortfolio = portfolio.filter(p => p.project_name && p.project_name !== 'Project 1');

  const formatValue = (val) => {
    if (!val) return '—';
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch { /* not JSON */ }
    return val;
  };

  return (
    <div className="byt-library-detail">
      <div className="byt-library-detail__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Eye size={15} style={{ color: COLORS.navy }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.navy }}>{firmName}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {responses.length} responses · {validPortfolio.length} portfolio projects
              {invitation.discipline && <> · {DISCIPLINE_LABELS[invitation.discipline] || invitation.discipline}</>}
            </div>
          </div>
        </div>
        <button className="byt-btn byt-btn--ghost byt-btn--sm" onClick={onClose}><X size={14} /> Close</button>
      </div>

      {/* Section tabs */}
      <div className="byt-library-detail__tabs">
        {orderedSections.map(sKey => (
          <button key={sKey}
            className={`byt-library-detail__tab ${activeSection === sKey ? 'byt-library-detail__tab--active' : ''}`}
            onClick={() => setActiveSection(sKey)}>
            {SECTION_LABELS[sKey] || sKey}
            <span className="byt-library-detail__tab-count">
              {responses.filter(r => r.section_key === sKey).length}
            </span>
          </button>
        ))}
        {validPortfolio.length > 0 && (
          <button
            className={`byt-library-detail__tab ${activeSection === '_portfolio' ? 'byt-library-detail__tab--active' : ''}`}
            onClick={() => setActiveSection('_portfolio')}>
            Portfolio
            <span className="byt-library-detail__tab-count">{validPortfolio.length}</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="byt-library-detail__content">
        {activeSection === '_portfolio' ? (
          <div className="byt-library-detail__portfolio">
            {validPortfolio.map((proj, idx) => (
              <div key={proj.id || idx} className="byt-library-detail__portfolio-card">
                <div className="byt-library-detail__portfolio-name">{proj.project_name}</div>
                <div className="byt-library-detail__portfolio-meta">
                  {proj.location && <span><MapPin size={11} /> {proj.location}</span>}
                  {proj.budget_range && <span>Budget: ${proj.budget_range}</span>}
                  {proj.square_footage && <span>{Number(proj.square_footage).toLocaleString()} SF</span>}
                  {proj.completion_year && <span>Completed: {proj.completion_year}</span>}
                </div>
                {proj.architectural_style && (
                  <div className="byt-library-detail__qa">
                    <span className="byt-library-detail__q">Style</span>
                    <span className="byt-library-detail__a">{proj.architectural_style}</span>
                  </div>
                )}
                {proj.role_scope && (
                  <div className="byt-library-detail__qa">
                    <span className="byt-library-detail__q">Scope</span>
                    <span className="byt-library-detail__a">{proj.role_scope}</span>
                  </div>
                )}
                {proj.key_features && proj.key_features.length > 0 && (
                  <div className="byt-library-detail__qa">
                    <span className="byt-library-detail__q">Features</span>
                    <span className="byt-library-detail__a">
                      {(Array.isArray(proj.key_features) ? proj.key_features : []).join(', ')}
                    </span>
                  </div>
                )}
                {proj.publications && (
                  <div className="byt-library-detail__qa">
                    <span className="byt-library-detail__q">Publications</span>
                    <span className="byt-library-detail__a">{proj.publications}</span>
                  </div>
                )}
                {proj.client_reference_available && (
                  <div style={{ marginTop: 6, fontSize: 11, color: COLORS.success }}>
                    <CheckCircle2 size={11} /> Client reference available
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="byt-library-detail__responses">
            {sectionResponses.map((r, idx) => (
              <div key={r.id || idx} className="byt-library-detail__qa">
                <span className="byt-library-detail__q">{r.question_text}</span>
                <span className="byt-library-detail__a">{formatValue(r.response_value)}</span>
              </div>
            ))}
            {sectionResponses.length === 0 && (
              <div style={{ padding: 20, color: COLORS.textMuted, fontSize: 12, textAlign: 'center' }}>
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
// PROJECT RESPONSE CARD
// =============================================================================

const ProjectResponseCard = ({ invitation, engagement, onViewDetail, onAddToShortlist, adding }) => {
  const disc = invitation.discipline || 'architect';
  const discColor = DISCIPLINE_COLORS[disc] || COLORS.navy;
  const submitted = invitation.submitted_at || invitation.updated_at;
  const pipelineStatus = engagement?.contact_status;

  return (
    <div className="byt-library-row">
      <div className="byt-library-row__disc-bar" style={{ backgroundColor: discColor }} />
      <div className="byt-library-row__body">
        <div className="byt-library-row__main">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="byt-library-row__firm">{invitation.firm_name || 'Unknown Firm'}</div>
            <div className="byt-library-row__meta">
              <span className="byt-library-row__disc-label" style={{ color: discColor }}>
                {DISCIPLINE_LABELS[disc] || disc}
              </span>
              {invitation.contact_name && <span>{invitation.contact_name}</span>}
              <span style={{ color: COLORS.textMuted }}>
                <Clock size={10} /> {submitted ? new Date(submitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
          <div className="byt-library-row__actions">
            <button className="byt-btn byt-btn--ghost byt-btn--sm"
              onClick={() => onViewDetail(invitation.id, invitation.firm_name)}>
              <Eye size={14} /> View
            </button>
            {!engagement && (
              <button className="byt-btn byt-btn--gold byt-btn--sm"
                onClick={() => onAddToShortlist(invitation)}
                disabled={adding}>
                <UserPlus size={13} /> {adding ? 'Adding...' : 'Add to Shortlist'}
              </button>
            )}
          </div>
        </div>
        {pipelineStatus && (
          <PipelineMini currentStatus={pipelineStatus} />
        )}
      </div>
    </div>
  );
};


// =============================================================================
// LIBRARY CONSULTANT CARD
// =============================================================================

const LibraryConsultantCard = ({ consultant, engagement, onViewSubmission, onAddToShortlist, adding }) => {
  const [expanded, setExpanded] = useState(false);
  const submissions = consultant.submissions || [];
  const disc = consultant.discipline || 'architect';
  const discColor = DISCIPLINE_COLORS[disc] || COLORS.navy;
  const pipelineStatus = engagement?.contact_status;

  return (
    <div className="byt-library-row">
      <div className="byt-library-row__disc-bar" style={{ backgroundColor: discColor }} />
      <div className="byt-library-row__body">
        <div className="byt-library-row__main" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="byt-library-row__firm">{consultant.firm_name || 'Unknown Firm'}</div>
            <div className="byt-library-row__meta">
              <span className="byt-library-row__disc-label" style={{ color: discColor }}>
                {DISCIPLINE_LABELS[disc] || disc}
              </span>
              {consultant.consultant_name && <span>{consultant.consultant_name}</span>}
              <span style={{ color: COLORS.textMuted }}>
                <FileText size={10} /> {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="byt-library-row__actions" onClick={e => e.stopPropagation()}>
            {!engagement && (
              <button className="byt-btn byt-btn--gold byt-btn--sm"
                onClick={() => onAddToShortlist(consultant)}
                disabled={adding}>
                <UserPlus size={13} /> {adding ? 'Adding...' : 'Shortlist'}
              </button>
            )}
            <span style={{ color: COLORS.textMuted, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </div>

        {/* Pipeline bar for active project */}
        {pipelineStatus && (
          <PipelineMini currentStatus={pipelineStatus} />
        )}

        {expanded && submissions.length > 0 && (
          <div className="byt-library-row__submissions">
            {submissions.map((sub, idx) => (
              <div key={sub.invitation_id || idx} className="byt-library-row__submission">
                <div className="byt-library-row__submission-info">
                  <span style={{ fontWeight: 600, fontSize: 12, color: COLORS.navy }}>
                    {sub.project_name || sub.n4s_project_id || 'Unknown Project'}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {sub.submitted_at
                      ? new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </span>
                  <span style={{ fontSize: 11, color: sub.status === 'submitted' ? COLORS.success : COLORS.textMuted }}>
                    {sub.status}
                  </span>
                  {sub.overall_score && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: Number(sub.overall_score) >= 60 ? COLORS.info : COLORS.warning }}>
                      Score: {sub.overall_score}
                    </span>
                  )}
                </div>
                <button className="byt-btn byt-btn--ghost byt-btn--sm"
                  onClick={() => onViewSubmission(sub.invitation_id, consultant.firm_name)}>
                  <Eye size={13} /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// =============================================================================
// MAIN LIBRARY SCREEN
// =============================================================================

const BYTLibraryScreen = () => {
  const { activeProjectId } = useAppContext();
  const projectId = activeProjectId;

  const [viewMode, setViewMode] = useState('project');
  const [invitations, setInvitations] = useState([]);
  const [loadingProject, setLoadingProject] = useState(false);
  const [libraryData, setLibraryData] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [detailInvitationId, setDetailInvitationId] = useState(null);
  const [detailFirmName, setDetailFirmName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('all');

  // Engagements for active project (pipeline status)
  const [engagements, setEngagements] = useState([]);
  const [addingId, setAddingId] = useState(null);

  // Engagement map: consultant_id → engagement (also index by firm_name for fallback)
  const engagementMap = useMemo(() => {
    const map = {};
    engagements.forEach(eng => {
      if (eng.consultant_id) map[`id:${eng.consultant_id}`] = eng;
      if (eng.firm_name) map[`fn:${eng.firm_name}:${eng.discipline}`] = eng;
    });
    return map;
  }, [engagements]);

  // Load IONOS engagements
  const loadEngagements = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(
        `${API_BASE}/gid.php?entity=engagements&project_id=${projectId}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setEngagements(data.engagements || []);
      }
    } catch (err) {
      console.error('[Library] Load engagements error:', err);
    }
  }, [projectId]);

  // Load project invitations
  const loadProjectData = useCallback(async () => {
    if (!projectId) return;
    setLoadingProject(true);
    try {
      const data = await rfqListInvitations({ project_id: projectId });
      setInvitations((data.invitations || []).filter(inv =>
        ['submitted', 'questionnaire_received'].includes(inv.status)
      ));
    } catch (err) {
      console.error('[Library] Load project invitations error:', err);
    } finally { setLoadingProject(false); }
  }, [projectId]);

  // Load cross-project library
  const loadLibraryData = useCallback(async () => {
    setLoadingLibrary(true);
    try {
      const data = await rfqBrowseLibrary();
      setLibraryData(data.consultants || []);
    } catch (err) {
      console.error('[Library] Load library error:', err);
    } finally { setLoadingLibrary(false); }
  }, []);

  useEffect(() => { loadEngagements(); }, [loadEngagements]);

  useEffect(() => {
    if (viewMode === 'project') loadProjectData();
    else loadLibraryData();
  }, [viewMode, loadProjectData, loadLibraryData]);

  // Add to shortlist — creates IONOS engagement + registry stub if needed
  const handleAddToShortlist = useCallback(async (consultantData) => {
    const consultantId = consultantData.consultant_id || consultantData.id;
    const discipline = consultantData.discipline || 'architect';
    const firmName = consultantData.firm_name || 'Unknown';

    if (!consultantId) return;
    setAddingId(consultantId);

    try {
      // Check if already in registry
      const regRes = await fetch(
        `${API_BASE}/gid.php?entity=consultants&project_id=${projectId || 'default'}`,
        { credentials: 'include' }
      );
      let registryId = null;
      if (regRes.ok) {
        const regData = await regRes.json();
        const match = (regData.consultants || []).find(c =>
          c.firm_name === firmName || String(c.id) === String(consultantId)
        );
        if (match) registryId = match.id;
      }

      // Create registry stub if not found
      if (!registryId) {
        const createRes = await fetch(`${API_BASE}/gid.php?entity=consultants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            n4s_project_id: projectId || 'default',
            firm_name: firmName,
            contact_name: consultantData.consultant_name || consultantData.contact_name || '',
            discipline: discipline,
            source_of_discovery: 'library_import',
            status: 'active',
          }),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          registryId = created.consultant?.id || created.id;
        }
      }

      // Create engagement
      await fetch(`${API_BASE}/gid.php?entity=engagements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          n4s_project_id: projectId || 'default',
          consultant_id: registryId || consultantId,
          discipline: discipline,
          recommended_by: 'library_import',
          contact_status: 'shortlisted',
        }),
      });

      // Refresh
      await loadEngagements();
    } catch (err) {
      console.error('[Library] Add to shortlist error:', err);
      alert('Failed to add to shortlist: ' + err.message);
    } finally { setAddingId(null); }
  }, [projectId, loadEngagements]);

  const handleViewDetail = useCallback((invId, firmName) => {
    setDetailInvitationId(invId);
    setDetailFirmName(firmName);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailInvitationId(null);
    setDetailFirmName('');
  }, []);

  // Helper: find engagement for invitation
  const getEngagement = (firmName, discipline, consultantId) => {
    if (consultantId) {
      const byId = engagementMap[`id:${consultantId}`];
      if (byId) return byId;
    }
    if (firmName && discipline) {
      return engagementMap[`fn:${firmName}:${discipline}`] || null;
    }
    return null;
  };

  // Filtered lists
  const filteredInvitations = useMemo(() => {
    let items = invitations;
    if (filterDiscipline !== 'all') items = items.filter(inv => inv.discipline === filterDiscipline);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(inv =>
        (inv.firm_name || '').toLowerCase().includes(q) ||
        (inv.contact_name || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [invitations, filterDiscipline, searchTerm]);

  const filteredLibrary = useMemo(() => {
    let items = libraryData;
    if (filterDiscipline !== 'all') items = items.filter(c => c.discipline === filterDiscipline);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(c =>
        (c.firm_name || '').toLowerCase().includes(q) ||
        (c.consultant_name || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [libraryData, filterDiscipline, searchTerm]);

  return (
    <div className="byt-library">
      {/* Controls */}
      <div className="byt-library__controls">
        <div className="byt-library__toggle">
          <button
            className={`byt-library__toggle-btn ${viewMode === 'project' ? 'byt-library__toggle-btn--active' : ''}`}
            onClick={() => { setViewMode('project'); handleCloseDetail(); }}>
            <FileText size={14} />
            Project Responses
            {invitations.length > 0 && <span className="byt-library__count">{invitations.length}</span>}
          </button>
          <button
            className={`byt-library__toggle-btn ${viewMode === 'library' ? 'byt-library__toggle-btn--active' : ''}`}
            onClick={() => { setViewMode('library'); handleCloseDetail(); }}>
            <BookOpen size={14} />
            Consultant Library
            {libraryData.length > 0 && <span className="byt-library__count">{libraryData.length}</span>}
          </button>
        </div>

        <div className="byt-library__filters">
          <div className="byt-library__search">
            <Search size={14} />
            <input type="text" placeholder="Search firms..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)}
            className="byt-library__filter-select">
            <option value="all">All Disciplines</option>
            <option value="architect">Architect</option>
            <option value="interior_designer">Interior Designer</option>
            <option value="pm">PM / Owner's Rep</option>
            <option value="gc">General Contractor</option>
          </select>
          <button className="byt-btn byt-btn--ghost byt-btn--sm"
            onClick={() => { (viewMode === 'project' ? loadProjectData : loadLibraryData)(); loadEngagements(); }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="byt-library__body">
        <div className={`byt-library__list ${detailInvitationId ? 'byt-library__list--narrow' : ''}`}>
          {viewMode === 'project' ? (
            <>
              {loadingProject && <div className="byt-library__loading"><Clock size={16} /> Loading responses...</div>}
              {!loadingProject && filteredInvitations.length === 0 && (
                <div className="byt-library__empty">
                  <FileText size={24} style={{ color: COLORS.border }} />
                  <p>No submitted RFQ responses for this project yet.</p>
                </div>
              )}
              {filteredInvitations.map(inv => (
                <ProjectResponseCard
                  key={inv.id}
                  invitation={inv}
                  engagement={getEngagement(inv.firm_name, inv.discipline, inv.consultant_id)}
                  onViewDetail={handleViewDetail}
                  onAddToShortlist={handleAddToShortlist}
                  adding={addingId === (inv.consultant_id || inv.id)}
                />
              ))}
            </>
          ) : (
            <>
              {loadingLibrary && <div className="byt-library__loading"><Clock size={16} /> Loading consultant library...</div>}
              {!loadingLibrary && filteredLibrary.length === 0 && (
                <div className="byt-library__empty">
                  <BookOpen size={24} style={{ color: COLORS.border }} />
                  <p>No consultants in library yet.</p>
                </div>
              )}
              {filteredLibrary.map(consultant => (
                <LibraryConsultantCard
                  key={consultant.consultant_id}
                  consultant={consultant}
                  engagement={getEngagement(consultant.firm_name, consultant.discipline, consultant.consultant_id)}
                  onViewSubmission={handleViewDetail}
                  onAddToShortlist={handleAddToShortlist}
                  adding={addingId === consultant.consultant_id}
                />
              ))}
            </>
          )}
        </div>

        {detailInvitationId && (
          <div className="byt-library__detail-panel">
            <ResponseDetailPanel
              invitationId={detailInvitationId}
              firmName={detailFirmName}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BYTLibraryScreen;
