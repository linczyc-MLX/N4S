import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Save, RotateCcw, RefreshCw, AlertTriangle, CheckCircle,
  ChevronDown, CheckSquare, Lock, Eye
} from 'lucide-react';
import api from '../../services/api';
import './PermissionsPanel.css';

// ── Constants ──────────────────────────────────────────────

const ROLES = ['admin', 'advisor', 'client', 'visitor'];

const MODULE_META = [
  { id: 'dashboard', label: 'Dashboard', fullName: 'Dashboard',              color: '#1e3a5f' },
  { id: 'kyc',       label: 'KYC',       fullName: 'Know Your Client',       color: '#315098' },
  { id: 'fyi',       label: 'FYI',       fullName: 'Find Your Inspiration',  color: '#8CA8BE' },
  { id: 'mvp',       label: 'MVP',       fullName: 'Mansion Validation',     color: '#AFBDB0' },
  { id: 'kym',       label: 'KYM',       fullName: 'Know Your Market',       color: '#E4C0BE' },
  { id: 'kys',       label: 'KYS',       fullName: 'Know Your Site',         color: '#C4A484' },
  { id: 'vmx',       label: 'VMX',       fullName: 'Vision Matrix',          color: '#FBD0E0' },
  { id: 'byt',       label: 'BYT',       fullName: 'Build Your Team',            color: '#D4A574' },
  { id: 'lcd',       label: 'LCD',       fullName: 'LuXeBrief Portal',       color: '#1a1a1a' },
  { id: 'settings',  label: 'Settings',  fullName: 'App Configuration',      color: '#374151' },
];

const MODULE_CAPABILITIES = {
  dashboard: [
    { key: 'viewWelcome',         label: 'View Welcome Bar & Task Matrix' },
    { key: 'viewQuickStats',      label: 'View Quick Stats (KYC %, Spaces, SF, Tier)' },
    { key: 'createProject',       label: 'Project Configuration \u2014 Create Project' },
    { key: 'switchDeleteProject', label: 'Project Configuration \u2014 Switch/Delete Project' },
    { key: 'editStakeholders',    label: 'Stakeholder Configuration \u2014 Edit Principal/Secondary/Advisor' },
    { key: 'portalActivate',      label: 'LuXeBrief Portal \u2014 Activate/Deactivate' },
    { key: 'portalViewStatus',    label: 'LuXeBrief Portal \u2014 View Status & URL' },
    { key: 'saveChanges',         label: 'Save Changes' },
  ],
  kyc: [
    { key: 'viewProgress',          label: 'View Section Progress & Navigation' },
    { key: 'editPortfolioFamily',   label: 'Edit Portfolio Context & Family Data' },
    { key: 'editProjectBudget',     label: 'Edit Project Parameters & Budget' },
    { key: 'editDesignCultural',    label: 'Edit Design Preferences & Cultural Context' },
    { key: 'sendIntakeQuestionnaire', label: 'Send Client Intake Questionnaire' },
    { key: 'generateReport',        label: 'Generate KYC Report (PDF)' },
    { key: 'saveChanges',           label: 'Save Changes' },
  ],
  fyi: [
    { key: 'viewProgram',       label: 'View Space Program Overview' },
    { key: 'selectSpaces',      label: 'Select/Deselect Spaces' },
    { key: 'configSizeLevel',   label: 'Configure Space Size & Level' },
    { key: 'navigateZones',     label: 'Navigate Zones & Structures' },
    { key: 'adjustCirculation', label: 'Adjust Circulation & Target SF' },
    { key: 'exportPDF',         label: 'Export Space Program PDF' },
    { key: 'mvpHandoff',        label: 'Proceed to MVP Handoff' },
    { key: 'saveChanges',       label: 'Save Changes' },
  ],
  mvp: [
    { key: 'viewWorkflow',    label: 'View Deployment Workflow & Gates' },
    { key: 'reviewModules',   label: 'Review Module Library & Checklists' },
    { key: 'configAdjacency', label: 'Configure Adjacency Personalization' },
    { key: 'viewComparison',  label: 'View Adjacency Comparison' },
    { key: 'runValidation',   label: 'Run Validation & View Results' },
    { key: 'exportReport',    label: 'Export MVP Report (PDF)' },
    { key: 'saveChanges',     label: 'Save Changes' },
  ],
  kym: [
    { key: 'selectLocation',   label: 'Select Location & View Market Analysis' },
    { key: 'browseComps',      label: 'Browse & Filter Comparable Properties' },
    { key: 'viewLand',         label: 'View Land Acquisition Parcels' },
    { key: 'viewDemographics', label: 'View Demographics Data' },
    { key: 'runBAM',           label: 'Run Buyer Alignment (BAM) Analysis' },
    { key: 'exportReport',     label: 'Export Market Report (PDF)' },
  ],
  kys: [
    { key: 'manageSites',    label: 'Add/Delete/Duplicate Sites' },
    { key: 'editSiteInfo',   label: 'Edit Site Information' },
    { key: 'scoreFactors',   label: 'Score Assessment Factors' },
    { key: 'viewComparison', label: 'View Site Comparison' },
    { key: 'manageNotes',    label: 'Manage Handoff Notes' },
    { key: 'exportReport',   label: 'Export Assessment Report (PDF)' },
  ],
  vmx: [
    { key: 'configScenario',  label: 'Configure Scenario Parameters' },
    { key: 'editCostMatrix',  label: 'View & Edit Cost Matrix' },
    { key: 'compareMode',     label: 'Enable Compare Mode (A vs B)' },
    { key: 'manageSnapshots', label: 'Manage Snapshots' },
    { key: 'configSoftCosts', label: 'Configure Soft Costs & Cashflow' },
    { key: 'proModeAdmin',    label: 'Access Pro Mode Admin Tools' },
    { key: 'exportReport',    label: 'Export Report & Client Pack' },
  ],
  lcd: [
    { key: 'activatePortal',      label: 'Activate/Deactivate Portal' },
    { key: 'manageCredentials',    label: 'Manage Access Credentials' },
    { key: 'configVisibility',     label: 'Configure Document Visibility' },
    { key: 'viewMilestones',       label: 'View Milestone Tracking & Sign-offs' },
    { key: 'configNotifications',  label: 'Configure Notification Settings' },
    { key: 'configParker',         label: 'Configure Parker (PANDA) Settings' },
    { key: 'saveChanges',          label: 'Save Changes' },
  ],
  settings: [
    { key: 'launchTasteExploration', label: 'Launch Taste Exploration Manager' },
    { key: 'addEditUsers',           label: 'Add/Edit Users' },
    { key: 'resetPasswords',         label: 'Reset Passwords & Deactivate Users' },
    { key: 'configPermissions',      label: 'Configure Role Permissions' },
    { key: 'saveChanges',            label: 'Save Changes' },
  ],
};

const ACCESS_LEVELS = ['full', 'own', 'read', 'none'];

const STATE_KEY = 'role_permissions';

// ── Default Permissions ────────────────────────────────────

const buildModuleDefaults = () => ({
  dashboard: {
    admin:   { viewWelcome: 'full', viewQuickStats: 'full', createProject: 'full', switchDeleteProject: 'full', editStakeholders: 'full', portalActivate: 'full', portalViewStatus: 'full', saveChanges: 'full' },
    advisor: { viewWelcome: 'full', viewQuickStats: 'full', createProject: 'none', switchDeleteProject: 'none', editStakeholders: 'full', portalActivate: 'none', portalViewStatus: 'full', saveChanges: 'full' },
    client:  { viewWelcome: 'own',  viewQuickStats: 'own',  createProject: 'none', switchDeleteProject: 'none', editStakeholders: 'none', portalActivate: 'none', portalViewStatus: 'none', saveChanges: 'none' },
    visitor: { viewWelcome: 'read', viewQuickStats: 'read', createProject: 'none', switchDeleteProject: 'none', editStakeholders: 'none', portalActivate: 'none', portalViewStatus: 'none', saveChanges: 'none' },
  },
  kyc: {
    admin:   { viewProgress: 'full', editPortfolioFamily: 'full', editProjectBudget: 'full', editDesignCultural: 'full', sendIntakeQuestionnaire: 'full', generateReport: 'full', saveChanges: 'full' },
    advisor: { viewProgress: 'full', editPortfolioFamily: 'full', editProjectBudget: 'full', editDesignCultural: 'full', sendIntakeQuestionnaire: 'none', generateReport: 'full', saveChanges: 'full' },
    client:  { viewProgress: 'own',  editPortfolioFamily: 'none', editProjectBudget: 'none', editDesignCultural: 'none', sendIntakeQuestionnaire: 'none', generateReport: 'none', saveChanges: 'none' },
    visitor: { viewProgress: 'read', editPortfolioFamily: 'none', editProjectBudget: 'none', editDesignCultural: 'none', sendIntakeQuestionnaire: 'none', generateReport: 'none', saveChanges: 'none' },
  },
  fyi: {
    admin:   { viewProgram: 'full', selectSpaces: 'full', configSizeLevel: 'full', navigateZones: 'full', adjustCirculation: 'full', exportPDF: 'full', mvpHandoff: 'full', saveChanges: 'full' },
    advisor: { viewProgram: 'full', selectSpaces: 'full', configSizeLevel: 'full', navigateZones: 'full', adjustCirculation: 'full', exportPDF: 'full', mvpHandoff: 'none', saveChanges: 'full' },
    client:  { viewProgram: 'read', selectSpaces: 'none', configSizeLevel: 'none', navigateZones: 'read', adjustCirculation: 'none', exportPDF: 'none', mvpHandoff: 'none', saveChanges: 'none' },
    visitor: { viewProgram: 'read', selectSpaces: 'none', configSizeLevel: 'none', navigateZones: 'read', adjustCirculation: 'none', exportPDF: 'none', mvpHandoff: 'none', saveChanges: 'none' },
  },
  mvp: {
    admin:   { viewWorkflow: 'full', reviewModules: 'full', configAdjacency: 'full', viewComparison: 'full', runValidation: 'full', exportReport: 'full', saveChanges: 'full' },
    advisor: { viewWorkflow: 'full', reviewModules: 'full', configAdjacency: 'full', viewComparison: 'full', runValidation: 'full', exportReport: 'full', saveChanges: 'full' },
    client:  { viewWorkflow: 'read', reviewModules: 'read', configAdjacency: 'none', viewComparison: 'read', runValidation: 'none', exportReport: 'none', saveChanges: 'none' },
    visitor: { viewWorkflow: 'read', reviewModules: 'none', configAdjacency: 'none', viewComparison: 'none', runValidation: 'none', exportReport: 'none', saveChanges: 'none' },
  },
  kym: {
    admin:   { selectLocation: 'full', browseComps: 'full', viewLand: 'full', viewDemographics: 'full', runBAM: 'full', exportReport: 'full' },
    advisor: { selectLocation: 'full', browseComps: 'full', viewLand: 'full', viewDemographics: 'full', runBAM: 'full', exportReport: 'full' },
    client:  { selectLocation: 'read', browseComps: 'read', viewLand: 'read', viewDemographics: 'read', runBAM: 'none', exportReport: 'none' },
    visitor: { selectLocation: 'read', browseComps: 'read', viewLand: 'none', viewDemographics: 'read', runBAM: 'none', exportReport: 'none' },
  },
  kys: {
    admin:   { manageSites: 'full', editSiteInfo: 'full', scoreFactors: 'full', viewComparison: 'full', manageNotes: 'full', exportReport: 'full' },
    advisor: { manageSites: 'full', editSiteInfo: 'full', scoreFactors: 'full', viewComparison: 'full', manageNotes: 'full', exportReport: 'full' },
    client:  { manageSites: 'none', editSiteInfo: 'none', scoreFactors: 'none', viewComparison: 'read', manageNotes: 'none', exportReport: 'none' },
    visitor: { manageSites: 'none', editSiteInfo: 'none', scoreFactors: 'none', viewComparison: 'read', manageNotes: 'none', exportReport: 'none' },
  },
  vmx: {
    admin:   { configScenario: 'full', editCostMatrix: 'full', compareMode: 'full', manageSnapshots: 'full', configSoftCosts: 'full', proModeAdmin: 'full', exportReport: 'full' },
    advisor: { configScenario: 'full', editCostMatrix: 'full', compareMode: 'full', manageSnapshots: 'full', configSoftCosts: 'full', proModeAdmin: 'none', exportReport: 'full' },
    client:  { configScenario: 'none', editCostMatrix: 'read', compareMode: 'none', manageSnapshots: 'none', configSoftCosts: 'none', proModeAdmin: 'none', exportReport: 'none' },
    visitor: { configScenario: 'none', editCostMatrix: 'none', compareMode: 'none', manageSnapshots: 'none', configSoftCosts: 'none', proModeAdmin: 'none', exportReport: 'none' },
  },
  lcd: {
    admin:   { activatePortal: 'full', manageCredentials: 'full', configVisibility: 'full', viewMilestones: 'full', configNotifications: 'full', configParker: 'full', saveChanges: 'full' },
    advisor: { activatePortal: 'none', manageCredentials: 'full', configVisibility: 'full', viewMilestones: 'full', configNotifications: 'none', configParker: 'none', saveChanges: 'full' },
    client:  { activatePortal: 'none', manageCredentials: 'none', configVisibility: 'none', viewMilestones: 'read', configNotifications: 'none', configParker: 'none', saveChanges: 'none' },
    visitor: { activatePortal: 'none', manageCredentials: 'none', configVisibility: 'none', viewMilestones: 'none', configNotifications: 'none', configParker: 'none', saveChanges: 'none' },
  },
  settings: {
    admin:   { launchTasteExploration: 'full', addEditUsers: 'full', resetPasswords: 'full', configPermissions: 'full', saveChanges: 'full' },
    advisor: { launchTasteExploration: 'none', addEditUsers: 'none', resetPasswords: 'none', configPermissions: 'none', saveChanges: 'none' },
    client:  { launchTasteExploration: 'none', addEditUsers: 'none', resetPasswords: 'none', configPermissions: 'none', saveChanges: 'none' },
    visitor: { launchTasteExploration: 'none', addEditUsers: 'none', resetPasswords: 'none', configPermissions: 'none', saveChanges: 'none' },
  },
});

const buildSidebarDefaults = () => ({
  admin:   { dashboard: true, kyc: true, fyi: true, mvp: true, kym: true, kys: true, vmx: true, lcd: true, settings: true },
  advisor: { dashboard: true, kyc: true, fyi: true, mvp: true, kym: true, kys: true, vmx: true, lcd: true, settings: false },
  client:  { dashboard: true, kyc: true, fyi: true, mvp: true, kym: true, kys: true, vmx: true, lcd: false, settings: false },
  visitor: { dashboard: true, kyc: true, fyi: true, mvp: true, kym: true, kys: true, vmx: true, lcd: false, settings: false },
});

const buildDefaults = () => ({
  sidebarVisibility: buildSidebarDefaults(),
  moduleCapabilities: buildModuleDefaults(),
});

const clonePerms = (p) => JSON.parse(JSON.stringify(p));

// ── Access-level badge helper ──────────────────────────────

const AccessBadge = ({ level, locked, onClick }) => {
  const config = {
    full: { icon: <CheckSquare size={12} />, label: 'Full Access', cls: 'permissions-badge--full' },
    own:  { icon: <Lock size={12} />,        label: 'Own Project',  cls: 'permissions-badge--own' },
    read: { icon: <Eye size={12} />,         label: 'Read Only',   cls: 'permissions-badge--read' },
    none: { icon: null,                      label: 'No Access',   cls: 'permissions-badge--none' },
  };
  const c = config[level] || config.none;

  if (locked) {
    return (
      <span className={`permissions-badge ${c.cls} permissions-badge--locked`}>
        {c.icon} {c.label}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`permissions-badge ${c.cls}`}
      onClick={onClick}
      title={`Click to change (current: ${c.label})`}
    >
      {c.icon}
      {level === 'none' ? <span className="permissions-badge__dash">&mdash;</span> : null}
      {' '}{c.label}
    </button>
  );
};

// Visibility pill
const VisibilityPill = ({ visible, locked, onClick, moduleColor }) => {
  if (locked) {
    return (
      <span
        className="permissions-vis-pill permissions-vis-pill--visible permissions-vis-pill--locked"
        style={{ background: moduleColor, borderColor: moduleColor }}
      >
        Visible
      </span>
    );
  }
  if (visible) {
    return (
      <button
        type="button"
        className="permissions-vis-pill permissions-vis-pill--visible"
        style={{ background: moduleColor, borderColor: moduleColor }}
        onClick={onClick}
      >
        Visible
      </button>
    );
  }
  return (
    <button
      type="button"
      className="permissions-vis-pill permissions-vis-pill--hidden"
      onClick={onClick}
    >
      Hidden
    </button>
  );
};

// ── Main Component ─────────────────────────────────────────

const PermissionsPanel = () => {
  const [permissions, setPermissions] = useState(buildDefaults);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedModule, setExpandedModule] = useState('dashboard');

  // ── Load ──────────────────────────────────────────────

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getState(STATE_KEY);
      const value = data?.value;
      if (value && value.moduleCapabilities && value.sidebarVisibility) {
        setPermissions(clonePerms(value));
        setSavedSnapshot(clonePerms(value));
      } else {
        const defs = buildDefaults();
        setPermissions(defs);
        setSavedSnapshot(clonePerms(defs));
      }
    } catch {
      const defs = buildDefaults();
      setPermissions(defs);
      setSavedSnapshot(clonePerms(defs));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPermissions(); }, [loadPermissions]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const isDirty = savedSnapshot
    ? JSON.stringify(permissions) !== JSON.stringify(savedSnapshot)
    : false;

  // ── Sidebar visibility handlers ───────────────────────

  const toggleVisibility = (role, moduleId) => {
    if (role === 'admin') return;
    setPermissions(prev => {
      const next = clonePerms(prev);
      next.sidebarVisibility[role][moduleId] = !next.sidebarVisibility[role][moduleId];
      return next;
    });
  };

  // ── Capability cycle handler ──────────────────────────

  const cycleCapability = (moduleId, role, capKey) => {
    if (role === 'admin') return;
    setPermissions(prev => {
      const next = clonePerms(prev);
      const current = next.moduleCapabilities[moduleId][role][capKey];
      const idx = ACCESS_LEVELS.indexOf(current);
      next.moduleCapabilities[moduleId][role][capKey] = ACCESS_LEVELS[(idx + 1) % ACCESS_LEVELS.length];
      return next;
    });
  };

  // ── Save / Reset ──────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.setState(STATE_KEY, permissions);
      setSavedSnapshot(clonePerms(permissions));
      setSuccessMsg('Permissions saved successfully');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Reset all permissions to factory defaults? This cannot be undone after saving.')) return;
    setPermissions(buildDefaults());
  };

  // ── Render ────────────────────────────────────────────

  if (loading) {
    return <div className="permissions-panel__loading">Loading permissions\u2026</div>;
  }

  return (
    <div className="permissions-panel">
      {/* Header */}
      <div className="permissions-panel__header">
        <div className="permissions-panel__header-left">
          <Shield size={20} />
          <h2>Role Permissions Matrix</h2>
        </div>
        <div className="permissions-panel__header-actions">
          <button className="btn btn--ghost" onClick={loadPermissions} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="permissions-panel__msg permissions-panel__msg--error">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="permissions-panel__msg permissions-panel__msg--success">
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      {/* ═══ Sidebar Navigation Visibility ═══ */}
      <h3 className="permissions-panel__section-title">Sidebar Navigation Visibility</h3>
      <div className="permissions-panel__table-wrap">
        <table className="permissions-panel__table">
          <thead>
            <tr>
              <th className="permissions-panel__th-label">Module</th>
              {ROLES.map(r => (
                <th key={r} className="permissions-panel__th-role">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_META.map(mod => (
              <tr key={mod.id}>
                <td className="permissions-panel__td-label">
                  <span className="permissions-panel__module-name">{mod.label}</span>
                </td>
                {ROLES.map(role => {
                  const visible = permissions.sidebarVisibility[role]?.[mod.id] ?? true;
                  return (
                    <td key={role} className="permissions-panel__td-vis">
                      <VisibilityPill
                        visible={visible}
                        locked={role === 'admin'}
                        moduleColor={mod.color}
                        onClick={() => toggleVisibility(role, mod.id)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ Detailed Capability Matrix ═══ */}
      <h3 className="permissions-panel__section-title" style={{ marginTop: 32 }}>Detailed Capability Matrix</h3>

      <div className="permissions-accordion-list">
        {MODULE_META.map(mod => {
          const caps = MODULE_CAPABILITIES[mod.id] || [];
          const isExpanded = expandedModule === mod.id;

          return (
            <div key={mod.id} className={`permissions-accordion ${isExpanded ? 'permissions-accordion--open' : ''}`}>
              {/* Accordion header */}
              <button
                type="button"
                className="permissions-accordion__header"
                onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
              >
                <div className="permissions-accordion__header-left">
                  <span
                    className="permissions-accordion__dot"
                    style={{ background: mod.color }}
                  />
                  <span className="permissions-accordion__title">
                    {mod.label} &mdash; {mod.fullName}
                  </span>
                </div>
                <div className="permissions-accordion__header-right">
                  <span className="permissions-accordion__count">
                    {caps.length} capabilities
                  </span>
                  <ChevronDown
                    size={16}
                    className={`permissions-accordion__chevron ${isExpanded ? 'permissions-accordion__chevron--open' : ''}`}
                  />
                </div>
              </button>

              {/* Accordion body */}
              {isExpanded && (
                <div className="permissions-accordion__body">
                  <table className="permissions-panel__table permissions-panel__table--caps">
                    <thead>
                      <tr>
                        <th className="permissions-panel__th-label">Capability</th>
                        {ROLES.map(r => (
                          <th key={r} className="permissions-panel__th-role">{r}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {caps.map(cap => (
                        <tr key={cap.key}>
                          <td className="permissions-panel__td-cap-label">{cap.label}</td>
                          {ROLES.map(role => {
                            const level = permissions.moduleCapabilities[mod.id]?.[role]?.[cap.key] ?? 'none';
                            return (
                              <td key={role} className="permissions-panel__td-badge">
                                <AccessBadge
                                  level={level}
                                  locked={role === 'admin'}
                                  onClick={() => cycleCapability(mod.id, role, cap.key)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ Footer ═══ */}
      <div className="permissions-panel__footer">
        <button className="btn btn--ghost" onClick={handleReset} disabled={saving}>
          <RotateCcw size={16} />
          Reset Defaults
        </button>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving || !isDirty}>
          <Save size={16} />
          {saving ? 'Saving\u2026' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default PermissionsPanel;
