import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Save, RotateCcw, RefreshCw, AlertTriangle, CheckCircle, Lock
} from 'lucide-react';
import api from '../../services/api';
import './PermissionsPanel.css';

// ── Constants ──────────────────────────────────────────────

const ROLES = ['admin', 'advisor', 'client', 'visitor'];

const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'kyc',       label: 'KYC' },
  { id: 'fyi',       label: 'FYI' },
  { id: 'mvp',       label: 'MVP' },
  { id: 'kym',       label: 'KYM' },
  { id: 'kys',       label: 'KYS' },
  { id: 'vmx',       label: 'VMX' },
  { id: 'lcd',       label: 'LCD' },
  { id: 'settings',  label: 'Settings' },
];

const CAPABILITIES = [
  { key: 'editProjects',    label: 'Edit Projects' },
  { key: 'manageUsers',     label: 'Manage Users' },
  { key: 'generateReports', label: 'Generate Reports' },
  { key: 'manageSettings',  label: 'Manage Settings' },
  { key: 'viewFinancials',  label: 'View Financials' },
  { key: 'exportData',      label: 'Export Data' },
];

const ACCESS_LEVELS = ['full', 'own', 'read', 'none'];

const ACCESS_LABELS = {
  full: 'Full',
  own:  'Own',
  read: 'Read',
  none: 'None',
};

const STATE_KEY = 'role_permissions';

// ── Default seed data ──────────────────────────────────────

const DEFAULT_PERMISSIONS = {
  sidebarVisibility: {
    admin:   { dashboard: true, kyc: true, fyi: true, mvp: true, kym: true, kys: true, vmx: true, lcd: true, settings: true },
    advisor: { dashboard: true, kyc: true, fyi: true, mvp: true, kym: true, kys: true, vmx: true, lcd: true, settings: false },
    client:  { dashboard: true, kyc: false, fyi: false, mvp: false, kym: false, kys: false, vmx: false, lcd: true, settings: false },
    visitor: { dashboard: true, kyc: false, fyi: false, mvp: false, kym: false, kys: false, vmx: false, lcd: false, settings: false },
  },
  capabilities: {
    admin:   { editProjects: 'full', manageUsers: 'full', generateReports: 'full', manageSettings: 'full', viewFinancials: 'full', exportData: 'full' },
    advisor: { editProjects: 'own',  manageUsers: 'none', generateReports: 'full', manageSettings: 'none', viewFinancials: 'read', exportData: 'full' },
    client:  { editProjects: 'none', manageUsers: 'none', generateReports: 'none', manageSettings: 'none', viewFinancials: 'none', exportData: 'none' },
    visitor: { editProjects: 'none', manageUsers: 'none', generateReports: 'none', manageSettings: 'none', viewFinancials: 'none', exportData: 'none' },
  },
};

// Deep-clone helper
const clonePerms = (p) => JSON.parse(JSON.stringify(p));

// ── Component ──────────────────────────────────────────────

const PermissionsPanel = () => {
  const [permissions, setPermissions] = useState(clonePerms(DEFAULT_PERMISSIONS));
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── Load ────────────────────────────────────────────────

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getState(STATE_KEY);
      const value = data?.value;
      if (value && value.sidebarVisibility && value.capabilities) {
        setPermissions(clonePerms(value));
        setSavedSnapshot(clonePerms(value));
      } else {
        // First load — seed defaults
        setPermissions(clonePerms(DEFAULT_PERMISSIONS));
        setSavedSnapshot(clonePerms(DEFAULT_PERMISSIONS));
      }
    } catch {
      // State key doesn't exist yet — use defaults
      setPermissions(clonePerms(DEFAULT_PERMISSIONS));
      setSavedSnapshot(clonePerms(DEFAULT_PERMISSIONS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPermissions(); }, [loadPermissions]);

  // Auto-clear success messages
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // ── Dirty check ─────────────────────────────────────────

  const isDirty = savedSnapshot
    ? JSON.stringify(permissions) !== JSON.stringify(savedSnapshot)
    : false;

  // ── Handlers ────────────────────────────────────────────

  const toggleVisibility = (role, moduleId) => {
    if (role === 'admin') return; // admin always full access
    setPermissions(prev => {
      const next = clonePerms(prev);
      next.sidebarVisibility[role][moduleId] = !next.sidebarVisibility[role][moduleId];
      return next;
    });
  };

  const changeCapability = (role, capKey, value) => {
    if (role === 'admin') return;
    setPermissions(prev => {
      const next = clonePerms(prev);
      next.capabilities[role][capKey] = value;
      return next;
    });
  };

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
    setPermissions(clonePerms(DEFAULT_PERMISSIONS));
  };

  // ── Render ──────────────────────────────────────────────

  if (loading) {
    return <div className="permissions-panel__loading">Loading permissions…</div>;
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

      {/* ── Sidebar Visibility Matrix ── */}
      <h3 className="permissions-panel__section-title">Sidebar Visibility</h3>
      <p className="permissions-panel__section-desc">
        Control which modules appear in the sidebar for each role.
      </p>
      <div className="permissions-panel__table-wrap">
        <table className="permissions-panel__table">
          <thead>
            <tr>
              <th className="permissions-panel__th-label">Module</th>
              {ROLES.map(role => (
                <th key={role} className={role === 'admin' ? 'permissions-panel__th-role permissions-panel__th-role--locked' : 'permissions-panel__th-role'}>
                  {role}
                  {role === 'admin' && <Lock size={10} className="permissions-panel__lock-icon" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map(mod => (
              <tr key={mod.id}>
                <td className="permissions-panel__td-label">{mod.label}</td>
                {ROLES.map(role => {
                  const visible = permissions.sidebarVisibility[role]?.[mod.id] ?? false;
                  const isLocked = role === 'admin';
                  return (
                    <td
                      key={role}
                      className={`permissions-panel__td-toggle ${isLocked ? 'permissions-panel__td--locked' : ''}`}
                    >
                      <label className="permissions-panel__toggle">
                        <input
                          type="checkbox"
                          checked={visible}
                          disabled={isLocked}
                          onChange={() => toggleVisibility(role, mod.id)}
                        />
                        <span className="permissions-panel__toggle-track">
                          <span className="permissions-panel__toggle-thumb" />
                        </span>
                        <span className={`permissions-panel__toggle-label ${visible ? 'permissions-panel__toggle-label--on' : ''}`}>
                          {visible ? 'Visible' : 'Hidden'}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Capability Access Matrix ── */}
      <h3 className="permissions-panel__section-title" style={{ marginTop: 28 }}>Capability Access</h3>
      <p className="permissions-panel__section-desc">
        Set access level per capability for each role.
      </p>
      <div className="permissions-panel__table-wrap">
        <table className="permissions-panel__table">
          <thead>
            <tr>
              <th className="permissions-panel__th-label">Capability</th>
              {ROLES.map(role => (
                <th key={role} className={role === 'admin' ? 'permissions-panel__th-role permissions-panel__th-role--locked' : 'permissions-panel__th-role'}>
                  {role}
                  {role === 'admin' && <Lock size={10} className="permissions-panel__lock-icon" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map(cap => (
              <tr key={cap.key}>
                <td className="permissions-panel__td-label">{cap.label}</td>
                {ROLES.map(role => {
                  const level = permissions.capabilities[role]?.[cap.key] ?? 'none';
                  const isLocked = role === 'admin';
                  return (
                    <td
                      key={role}
                      className={`permissions-panel__td-select ${isLocked ? 'permissions-panel__td--locked' : ''}`}
                    >
                      <select
                        className={`permissions-panel__select permissions-panel__select--${level}`}
                        value={level}
                        disabled={isLocked}
                        onChange={(e) => changeCapability(role, cap.key, e.target.value)}
                      >
                        {ACCESS_LEVELS.map(lv => (
                          <option key={lv} value={lv}>{ACCESS_LABELS[lv]}</option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer Actions ── */}
      <div className="permissions-panel__footer">
        <button
          className="btn btn--ghost"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw size={16} />
          Reset Defaults
        </button>
        <button
          className="btn btn--primary"
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default PermissionsPanel;
