/**
 * UsersPanel - User Management (Admin Only)
 *
 * Features:
 * - List all users with role, status, last login
 * - Create new users with role assignment
 * - Edit user details and role
 * - Reset passwords
 * - Deactivate/reactivate users
 *
 * Access: Admin role only (enforced by parent + API)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Shield, Eye, Edit2, Key, XCircle, CheckCircle,
  X, AlertTriangle, Save, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_LABELS = {
  admin: { label: 'Admin', color: '#1e3a5f', bg: '#e8eef5' },
  advisor: { label: 'Advisor', color: '#2e7d32', bg: '#e8f5e9' },
  client: { label: 'Client', color: '#6d4c00', bg: '#fff8e1' },
  visitor: { label: 'Visitor', color: '#6b6b6b', bg: '#f0f0f0' },
};

const UsersPanel = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ username: '', password: '', display_name: '', role: 'visitor' });
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Auto-clear success message
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // ====================================================================
  // CREATE USER
  // ====================================================================
  const handleCreate = async () => {
    setFormError('');
    if (!formData.username.trim()) return setFormError('Username is required');
    if (formData.username.trim().length < 3) return setFormError('Username must be at least 3 characters');
    if (!formData.password) return setFormError('Password is required');
    if (formData.password.length < 8) return setFormError('Password must be at least 8 characters');

    setSaving(true);
    try {
      await api.createUser({
        username: formData.username.trim(),
        password: formData.password,
        display_name: formData.display_name.trim() || formData.username.trim(),
        role: formData.role,
      });
      setShowCreateModal(false);
      setFormData({ username: '', password: '', display_name: '', role: 'visitor' });
      setSuccessMsg('User created successfully');
      loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ====================================================================
  // UPDATE USER
  // ====================================================================
  const handleUpdate = async () => {
    setFormError('');
    if (!formData.display_name.trim()) return setFormError('Display name is required');

    setSaving(true);
    try {
      await api.updateUser(editingUser.id, {
        display_name: formData.display_name.trim(),
        role: formData.role,
        username: formData.username.trim(),
      });
      setEditingUser(null);
      setSuccessMsg('User updated successfully');
      loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ====================================================================
  // RESET PASSWORD
  // ====================================================================
  const handleResetPassword = async () => {
    setFormError('');
    if (!newPassword || newPassword.length < 8) return setFormError('Password must be at least 8 characters');

    setSaving(true);
    try {
      await api.resetUserPassword(resetPasswordUser.id, newPassword);
      setResetPasswordUser(null);
      setNewPassword('');
      setSuccessMsg('Password reset successfully');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ====================================================================
  // TOGGLE ACTIVE
  // ====================================================================
  const handleToggleActive = async (u) => {
    if (u.id === currentUser.id) return;
    try {
      await api.updateUser(u.id, { is_active: !Number(u.is_active) });
      setSuccessMsg(Number(u.is_active) ? 'User deactivated' : 'User reactivated');
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (u) => {
    setFormData({ username: u.username, display_name: u.display_name, role: u.role, password: '' });
    setFormError('');
    setEditingUser(u);
  };

  const openResetPassword = (u) => {
    setNewPassword('');
    setFormError('');
    setResetPasswordUser(u);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  };

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <div className="users-panel">
      {/* Header */}
      <div className="users-panel__header">
        <div className="users-panel__header-left">
          <Users size={20} />
          <h2>User Management</h2>
        </div>
        <div className="users-panel__header-actions">
          <button className="btn btn--ghost" onClick={loadUsers} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="btn btn--primary" onClick={() => {
            setFormData({ username: '', password: '', display_name: '', role: 'visitor' });
            setFormError('');
            setShowCreateModal(true);
          }}>
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="users-panel__msg users-panel__msg--error">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="users-panel__msg users-panel__msg--success">
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      {/* Users list */}
      {loading ? (
        <div className="users-panel__loading">Loading users…</div>
      ) : (
        <div className="users-panel__table-wrap">
          <table className="users-panel__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.visitor;
                const isActive = Number(u.is_active);
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={!isActive ? 'users-panel__row--inactive' : ''}>
                    <td>
                      <div className="users-panel__user-cell">
                        <span className="users-panel__display-name">{u.display_name}</span>
                        <span className="users-panel__username">@{u.username}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="users-panel__role-badge"
                        style={{ color: roleInfo.color, background: roleInfo.bg }}
                      >
                        <Shield size={12} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className={`users-panel__status ${isActive ? 'users-panel__status--active' : 'users-panel__status--inactive'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="users-panel__date">{formatDate(u.last_login)}</td>
                    <td>
                      <div className="users-panel__actions">
                        <button className="btn btn--icon" onClick={() => openEdit(u)} title="Edit user">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn--icon" onClick={() => openResetPassword(u)} title="Reset password">
                          <Key size={14} />
                        </button>
                        {!isSelf && (
                          <button
                            className="btn btn--icon"
                            onClick={() => handleToggleActive(u)}
                            title={isActive ? 'Deactivate' : 'Reactivate'}
                          >
                            {isActive ? <XCircle size={14} color="#d32f2f" /> : <CheckCircle size={14} color="#2e7d32" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={5} className="users-panel__empty">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================================================================
          CREATE USER MODAL
          ================================================================ */}
      {showCreateModal && (
        <div className="users-modal__overlay" onClick={() => setShowCreateModal(false)}>
          <div className="users-modal" onClick={e => e.stopPropagation()}>
            <div className="users-modal__header">
              <h3><UserPlus size={18} /> Create New User</h3>
              <button className="btn btn--icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            {formError && <div className="users-modal__error">{formError}</div>}
            <div className="users-modal__body">
              <label className="users-modal__label">
                Username *
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. jsmith"
                  autoFocus
                />
              </label>
              <label className="users-modal__label">
                Display Name
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={e => setFormData(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                />
              </label>
              <label className="users-modal__label">
                Password *
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                />
              </label>
              <label className="users-modal__label">
                Role
                <select
                  value={formData.role}
                  onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="admin">Admin — Full access, user management</option>
                  <option value="advisor">Advisor — Module read/write, reports</option>
                  <option value="client">Client — View own project data</option>
                  <option value="visitor">Visitor — Read-only access</option>
                </select>
              </label>
            </div>
            <div className="users-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleCreate} disabled={saving}>
                <Save size={14} /> {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          EDIT USER MODAL
          ================================================================ */}
      {editingUser && (
        <div className="users-modal__overlay" onClick={() => setEditingUser(null)}>
          <div className="users-modal" onClick={e => e.stopPropagation()}>
            <div className="users-modal__header">
              <h3><Edit2 size={18} /> Edit User</h3>
              <button className="btn btn--icon" onClick={() => setEditingUser(null)}><X size={18} /></button>
            </div>
            {formError && <div className="users-modal__error">{formError}</div>}
            <div className="users-modal__body">
              <label className="users-modal__label">
                Username
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                />
              </label>
              <label className="users-modal__label">
                Display Name
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={e => setFormData(f => ({ ...f, display_name: e.target.value }))}
                />
              </label>
              <label className="users-modal__label">
                Role
                <select
                  value={formData.role}
                  onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                  disabled={editingUser.id === currentUser?.id}
                >
                  <option value="admin">Admin</option>
                  <option value="advisor">Advisor</option>
                  <option value="client">Client</option>
                  <option value="visitor">Visitor</option>
                </select>
                {editingUser.id === currentUser?.id && (
                  <span className="users-modal__hint">Cannot change your own role</span>
                )}
              </label>
            </div>
            <div className="users-modal__footer">
              <button className="btn btn--ghost" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleUpdate} disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          RESET PASSWORD MODAL
          ================================================================ */}
      {resetPasswordUser && (
        <div className="users-modal__overlay" onClick={() => setResetPasswordUser(null)}>
          <div className="users-modal" onClick={e => e.stopPropagation()}>
            <div className="users-modal__header">
              <h3><Key size={18} /> Reset Password</h3>
              <button className="btn btn--icon" onClick={() => setResetPasswordUser(null)}><X size={18} /></button>
            </div>
            <p className="users-modal__description">
              Setting a new password for <strong>{resetPasswordUser.display_name}</strong> (@{resetPasswordUser.username})
            </p>
            {formError && <div className="users-modal__error">{formError}</div>}
            <div className="users-modal__body">
              <label className="users-modal__label">
                New Password *
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  autoFocus
                />
              </label>
            </div>
            <div className="users-modal__footer">
              <button className="btn btn--ghost" onClick={() => setResetPasswordUser(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleResetPassword} disabled={saving}>
                <Key size={14} /> {saving ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
