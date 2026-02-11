/**
 * AuthContext - Authentication & Role-Based Access
 *
 * Manages:
 * - Login/logout flow
 * - Session persistence (server-side PHP sessions)
 * - Current user state + role
 * - Role permission helpers
 *
 * Roles (highest → lowest):
 *   admin   — Full access, user management
 *   advisor — Module read/write, reports, no user mgmt
 *   client  — View own project, taste exploration
 *   visitor — Read-only everything
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Permission definitions per role
const ROLE_PERMISSIONS = {
  admin: {
    canEdit: true,
    canManageUsers: true,
    canManageProjects: true,
    canGenerateReports: true,
    canAccessSettings: true,
    canAccessAllModules: true,
  },
  advisor: {
    canEdit: true,
    canManageUsers: false,
    canManageProjects: false,
    canGenerateReports: true,
    canAccessSettings: false,
    canAccessAllModules: true,
  },
  client: {
    canEdit: false,
    canManageUsers: false,
    canManageProjects: false,
    canGenerateReports: false,
    canAccessSettings: false,
    canAccessAllModules: false,
  },
  visitor: {
    canEdit: false,
    canManageUsers: false,
    canManageProjects: false,
    canGenerateReports: false,
    canAccessSettings: false,
    canAccessAllModules: false,
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await api.checkSession();
        if (result.authenticated && result.user) {
          setUser(result.user);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (username, password) => {
    setLoginError('');
    try {
      const result = await api.login(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }
      setLoginError('Login failed');
      return false;
    } catch (err) {
      const msg = err.message || 'Login failed';
      setLoginError(msg);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    }
    setUser(null);
  }, []);

  // Permission helpers
  const permissions = user ? (ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.visitor) : ROLE_PERMISSIONS.visitor;

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isAdvisor = user?.role === 'advisor';
  const isClient = user?.role === 'client';
  const isVisitor = user?.role === 'visitor';

  const value = {
    user,
    loading,
    loginError,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isAdvisor,
    isClient,
    isVisitor,
    permissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
