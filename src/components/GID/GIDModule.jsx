/**
 * GIDModule.jsx — Get It Done
 * 
 * Curate and match creative, project management, and delivery team consultants.
 * Phase 1: Consultant Registry CRUD + Portfolio management.
 * 
 * Screens:
 * 1. Registry — Master consultant database with CRUD
 * 2. Discovery — Search & discover (Phase 3)
 * 3. Match — Run matching algorithm (Phase 2)
 * 4. Assembly — Team assembly + tracking (Phase 4)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Users, Plus, Search, Filter, Save, FileDown, Edit2, Trash2, Eye,
  Star, MapPin, Briefcase, Award, ChevronDown, ChevronRight, X,
  Building2, CheckCircle2, Clock, AlertTriangle, RefreshCw, Upload
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import GIDDocumentation from './GIDDocumentation';
import AddConsultantForm from './components/AddConsultantForm';
import ConsultantDetailModal from './components/ConsultantDetailModal';
import GIDMatchScreen from './screens/GIDMatchScreen';
import './GIDModule.css';

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

// Discipline labels & icons
const DISCIPLINES = {
  architect: { label: 'Architect', color: '#315098' },
  interior_designer: { label: 'Interior Designer', color: '#8CA8BE' },
  pm: { label: 'Project Manager', color: '#AFBDB0' },
  gc: { label: 'General Contractor', color: '#C4A484' },
};

const VERIFICATION_BADGES = {
  pending: { label: 'Pending', color: COLORS.textMuted, icon: Clock },
  verified: { label: 'Verified', color: COLORS.success, icon: CheckCircle2 },
  partner: { label: 'Partner', color: COLORS.gold, icon: Award },
};

// API base URL (same pattern as api.js)
const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';

// ============================================================================
// API HELPERS
// ============================================================================

const gidApi = {
  async fetchConsultants(filters = {}) {
    const params = new URLSearchParams({ entity: 'consultants', ...filters });
    const res = await fetch(`${API_BASE}/gid.php?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async fetchConsultant(id) {
    const res = await fetch(`${API_BASE}/gid.php?entity=consultants&id=${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async createConsultant(data) {
    const res = await fetch(`${API_BASE}/gid.php?entity=consultants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateConsultant(id, data) {
    const res = await fetch(`${API_BASE}/gid.php?entity=consultants&id=${id}&action=update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async archiveConsultant(id) {
    const res = await fetch(`${API_BASE}/gid.php?entity=consultants&id=${id}&action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async createPortfolioProject(data) {
    const res = await fetch(`${API_BASE}/gid.php?entity=portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updatePortfolioProject(id, data) {
    const res = await fetch(`${API_BASE}/gid.php?entity=portfolio&id=${id}&action=update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deletePortfolioProject(id) {
    const res = await fetch(`${API_BASE}/gid.php?entity=portfolio&id=${id}&action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async createReview(data) {
    const res = await fetch(`${API_BASE}/gid.php?entity=reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async fetchStats() {
    const res = await fetch(`${API_BASE}/gid.php?entity=stats`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};

// ============================================================================
// CONSULTANT CARD COMPONENT
// ============================================================================

const ConsultantCard = ({ consultant, onView, onEdit, onArchive }) => {
  const discipline = DISCIPLINES[consultant.role] || { label: consultant.role, color: COLORS.textMuted };
  const verification = VERIFICATION_BADGES[consultant.verification_status] || VERIFICATION_BADGES.pending;
  const VerifIcon = verification.icon;

  return (
    <div className="gid-consultant-card">
      <div className="gid-consultant-card__header">
        <div className="gid-consultant-card__discipline" style={{ background: discipline.color }}>
          {discipline.label}
        </div>
        <div className="gid-consultant-card__verification" style={{ color: verification.color }}>
          <VerifIcon size={14} />
          <span>{verification.label}</span>
        </div>
      </div>

      <div className="gid-consultant-card__body">
        <h3 className="gid-consultant-card__firm">{consultant.firm_name}</h3>
        {(consultant.first_name || consultant.last_name) && (
          <p className="gid-consultant-card__name">
            {consultant.first_name} {consultant.last_name}
          </p>
        )}

        <div className="gid-consultant-card__meta">
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
          {consultant.avg_rating > 0 && (
            <span className="gid-meta-item">
              <Star size={12} />
              {Number(consultant.avg_rating).toFixed(1)} ({consultant.review_count})
            </span>
          )}
        </div>

        {consultant.specialties && consultant.specialties.length > 0 && (
          <div className="gid-consultant-card__tags">
            {consultant.specialties.slice(0, 4).map((s, i) => (
              <span key={i} className="gid-tag">{s}</span>
            ))}
            {consultant.specialties.length > 4 && (
              <span className="gid-tag gid-tag--more">+{consultant.specialties.length - 4}</span>
            )}
          </div>
        )}

        {(consultant.min_budget || consultant.max_budget) && (
          <p className="gid-consultant-card__budget">
            Budget range: ${((consultant.min_budget || 0) / 1e6).toFixed(1)}M – ${((consultant.max_budget || 0) / 1e6).toFixed(1)}M
          </p>
        )}
      </div>

      <div className="gid-consultant-card__actions">
        <button className="gid-btn gid-btn--ghost" onClick={() => onView(consultant)} title="View details">
          <Eye size={14} /> View
        </button>
        <button className="gid-btn gid-btn--ghost" onClick={() => onEdit(consultant)} title="Edit">
          <Edit2 size={14} /> Edit
        </button>
        <button className="gid-btn gid-btn--ghost gid-btn--danger" onClick={() => onArchive(consultant)} title="Archive">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STATS BAR
// ============================================================================

const StatsBar = ({ stats }) => {
  if (!stats) return null;

  const roleMap = {};
  (stats.byRole || []).forEach(r => { roleMap[r.role] = parseInt(r.count); });

  return (
    <div className="gid-stats-bar">
      <div className="gid-stat">
        <span className="gid-stat__value">{stats.totalActive || 0}</span>
        <span className="gid-stat__label">Total Active</span>
      </div>
      <div className="gid-stat">
        <span className="gid-stat__value">{roleMap.architect || 0}</span>
        <span className="gid-stat__label">Architects</span>
      </div>
      <div className="gid-stat">
        <span className="gid-stat__value">{roleMap.interior_designer || 0}</span>
        <span className="gid-stat__label">Interior Designers</span>
      </div>
      <div className="gid-stat">
        <span className="gid-stat__value">{roleMap.pm || 0}</span>
        <span className="gid-stat__label">Project Managers</span>
      </div>
      <div className="gid-stat">
        <span className="gid-stat__value">{roleMap.gc || 0}</span>
        <span className="gid-stat__label">Gen. Contractors</span>
      </div>
      <div className="gid-stat">
        <span className="gid-stat__value">{stats.totalProjects || 0}</span>
        <span className="gid-stat__label">Portfolio Projects</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MODULE COMPONENT
// ============================================================================

const GIDModule = ({ showDocs, onCloseDocs }) => {
  const { hasUnsavedChanges, saveNow, isSaving, lastSaved } = useAppContext();

  // Local state
  const [consultants, setConsultants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state
  const [viewMode, setViewMode] = useState('registry'); // 'registry' | 'add' | 'edit'
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load consultants
  const loadConsultants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (roleFilter) filters.role = roleFilter;
      if (verificationFilter) filters.verification = verificationFilter;
      if (searchQuery) filters.search = searchQuery;

      const [consultantData, statsData] = await Promise.all([
        gidApi.fetchConsultants(filters),
        gidApi.fetchStats(),
      ]);
      setConsultants(consultantData.consultants || []);
      setStats(statsData);
    } catch (err) {
      console.error('[GID] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, verificationFilter, searchQuery]);

  useEffect(() => {
    loadConsultants();
  }, [loadConsultants]);

  // Handlers
  const handleViewConsultant = useCallback(async (consultant) => {
    try {
      const full = await gidApi.fetchConsultant(consultant.id);
      setSelectedConsultant(full);
      setDetailModalOpen(true);
    } catch (err) {
      console.error('[GID] Fetch detail error:', err);
    }
  }, []);

  const handleEditConsultant = useCallback(async (consultant) => {
    try {
      const full = await gidApi.fetchConsultant(consultant.id);
      setSelectedConsultant(full);
      setViewMode('edit');
    } catch (err) {
      console.error('[GID] Fetch for edit error:', err);
    }
  }, []);

  const handleArchiveConsultant = useCallback(async (consultant) => {
    if (!window.confirm(`Archive "${consultant.firm_name}"? They will be hidden from searches but data is preserved.`)) return;
    try {
      await gidApi.archiveConsultant(consultant.id);
      loadConsultants();
    } catch (err) {
      console.error('[GID] Archive error:', err);
    }
  }, [loadConsultants]);

  const handleSaveConsultant = useCallback(async (data, portfolioProjects) => {
    try {
      let consultantId;

      if (viewMode === 'edit' && selectedConsultant) {
        await gidApi.updateConsultant(selectedConsultant.id, data);
        consultantId = selectedConsultant.id;
      } else {
        const result = await gidApi.createConsultant(data);
        consultantId = result.id;
      }

      // Save portfolio projects (new ones only for create, all for edit)
      if (portfolioProjects && portfolioProjects.length > 0) {
        for (const project of portfolioProjects) {
          if (project.id && project._existing) {
            await gidApi.updatePortfolioProject(project.id, project);
          } else {
            await gidApi.createPortfolioProject({ ...project, consultant_id: consultantId });
          }
        }
      }

      setViewMode('registry');
      setSelectedConsultant(null);
      loadConsultants();
    } catch (err) {
      console.error('[GID] Save error:', err);
      alert('Failed to save consultant: ' + err.message);
    }
  }, [viewMode, selectedConsultant, loadConsultants]);

  const handleCancelForm = useCallback(() => {
    setViewMode('registry');
    setSelectedConsultant(null);
  }, []);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className={`n4s-docs-layout ${showDocs ? 'n4s-docs-layout--with-docs' : ''}`}>
      <div className="n4s-docs-layout__main">
        <div className="gid-module">

          {/* Module Header */}
          <header className="module-header">
            <div className="module-header__content">
              <div className="module-header__title-group">
                <h1 className="module-header__title">GID – Get It Done</h1>
                <p className="module-header__subtitle">Curate and match your creative and delivery team</p>
              </div>

              <div className="module-header__actions">
                <button
                  className="kyc-export-btn"
                  onClick={() => {/* Phase 4: Export team brief */}}
                  disabled
                  title="Export Team Brief (Phase 4)"
                >
                  <FileDown size={16} />
                  Export Brief
                </button>
                <button
                  className={`btn ${hasUnsavedChanges ? 'btn--primary' : 'btn--success'}`}
                  onClick={saveNow}
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </button>
                {lastSaved && !hasUnsavedChanges && (
                  <span className="module-header__last-saved">
                    Last saved: {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Screen Tabs (Phase 1: only Registry active) */}
          <div className="gid-screen-tabs">
            <button
              className={`gid-screen-tab ${viewMode === 'registry' || viewMode === 'add' || viewMode === 'edit' ? 'gid-screen-tab--active' : ''}`}
              onClick={() => { setViewMode('registry'); setSelectedConsultant(null); }}
            >
              <Users size={16} />
              Registry
            </button>
            <button className="gid-screen-tab gid-screen-tab--disabled" disabled title="Phase 3">
              <Search size={16} />
              Discovery
            </button>
            <button
              className={`gid-screen-tab ${viewMode === 'match' ? 'gid-screen-tab--active' : ''}`}
              onClick={() => { setViewMode('match'); setSelectedConsultant(null); }}
            >
              <Filter size={16} />
              Matchmaking
            </button>
            <button className="gid-screen-tab gid-screen-tab--disabled" disabled title="Phase 4">
              <Briefcase size={16} />
              Assembly
            </button>
          </div>

          {/* Stats Bar */}
          <StatsBar stats={stats} />

          {/* Registry Screen */}
          {viewMode === 'registry' && (
            <div className="gid-registry">
              {/* Toolbar */}
              <div className="gid-toolbar">
                <div className="gid-toolbar__search">
                  <Search size={16} className="gid-toolbar__search-icon" />
                  <input
                    type="text"
                    placeholder="Search firms, names..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="gid-toolbar__search-input"
                  />
                  {searchInput && (
                    <button className="gid-toolbar__search-clear" onClick={() => setSearchInput('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="gid-toolbar__filters">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="gid-filter-select"
                  >
                    <option value="">All Disciplines</option>
                    <option value="architect">Architects</option>
                    <option value="interior_designer">Interior Designers</option>
                    <option value="pm">Project Managers</option>
                    <option value="gc">General Contractors</option>
                  </select>

                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="gid-filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div className="gid-toolbar__actions">
                  <button className="gid-btn gid-btn--ghost" onClick={loadConsultants} title="Refresh">
                    <RefreshCw size={16} />
                  </button>
                  <button className="gid-btn gid-btn--primary" onClick={() => setViewMode('add')}>
                    <Plus size={16} />
                    Add Consultant
                  </button>
                </div>
              </div>

              {/* Content */}
              {loading && (
                <div className="gid-loading">
                  <RefreshCw size={24} className="spinning" />
                  <p>Loading consultant registry...</p>
                </div>
              )}

              {error && (
                <div className="gid-error">
                  <AlertTriangle size={20} />
                  <p>{error}</p>
                  <button className="gid-btn gid-btn--primary" onClick={loadConsultants}>Retry</button>
                </div>
              )}

              {!loading && !error && consultants.length === 0 && (
                <div className="gid-empty">
                  <Users size={48} />
                  <h3>No Consultants Yet</h3>
                  <p>Start building your consultant registry by adding architects, designers, project managers, and contractors.</p>
                  <button className="gid-btn gid-btn--primary" onClick={() => setViewMode('add')}>
                    <Plus size={16} /> Add First Consultant
                  </button>
                </div>
              )}

              {!loading && !error && consultants.length > 0 && (
                <div className="gid-consultant-grid">
                  {consultants.map(c => (
                    <ConsultantCard
                      key={c.id}
                      consultant={c}
                      onView={handleViewConsultant}
                      onEdit={handleEditConsultant}
                      onArchive={handleArchiveConsultant}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add / Edit Form */}
          {(viewMode === 'add' || viewMode === 'edit') && (
            <AddConsultantForm
              consultant={viewMode === 'edit' ? selectedConsultant : null}
              onSave={handleSaveConsultant}
              onCancel={handleCancelForm}
              isEditing={viewMode === 'edit'}
            />
          )}

          {/* Matchmaking Screen */}
          {viewMode === 'match' && (
            <GIDMatchScreen />
          )}

          {/* Detail Modal */}
          {detailModalOpen && selectedConsultant && (
            <ConsultantDetailModal
              consultant={selectedConsultant}
              onClose={() => { setDetailModalOpen(false); setSelectedConsultant(null); }}
              onEdit={(c) => { setDetailModalOpen(false); handleEditConsultant(c); }}
            />
          )}

        </div>
      </div>

      {showDocs && (
        <div className="n4s-docs-layout__docs">
          <GIDDocumentation onClose={onCloseDocs} />
        </div>
      )}
    </div>
  );
};

export default GIDModule;
