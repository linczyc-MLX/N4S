import React, { useState } from 'react';
import {
  Settings, AlertTriangle, Palette, ExternalLink, Users, Shield
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import UsersPanel from './UsersPanel';
import PermissionsPanel from './PermissionsPanel';
import './UsersPanel.css';
import './SettingsModule.css';

// Taste Exploration App URL
const TASTE_EXPLORATION_URL = 'https://tasteexploration.not-4.sale';

/**
 * SettingsModule - Admin Tools & Application Defaults
 *
 * Project Management, Stakeholder Configuration, and Portal Activation
 * have moved to the Dashboard as the natural starting point for workflows.
 * This module now retains:
 * 1. Admin Tools (Taste Exploration Manager)
 * 2. Future: Application Defaults, export options, etc.
 */

const SettingsModule = () => {
  const {
    projects,
    activeProjectId,
    kycData,
  } = useAppContext();
  const { isAdmin } = useAuth();

  const [expandedSection, setExpandedSection] = useState(isAdmin ? 'users' : 'admin-tools');

  // Get stakeholder data for app integration
  const stakeholderData = kycData?.principal?.portfolioContext || {};
  const currentProject = projects.find(p => p.id === activeProjectId);
  const currentProjectName = currentProject?.name || 'Unknown Project';

  // Launch Taste Exploration with project context
  const launchTasteExploration = (respondentType = 'principal') => {
    const clientName = respondentType === 'secondary'
      ? `${stakeholderData.secondaryFirstName || ''} ${stakeholderData.secondaryLastName || ''}`.trim()
      : `${stakeholderData.principalFirstName || ''} ${stakeholderData.principalLastName || ''}`.trim();

    const url = `${TASTE_EXPLORATION_URL}?projectId=${encodeURIComponent(activeProjectId)}&projectName=${encodeURIComponent(currentProjectName)}&respondentType=${encodeURIComponent(respondentType)}&clientName=${encodeURIComponent(clientName || 'Client')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="settings-module">
      {/* Header */}
      <div className="settings-module__header">
        <div className="settings-module__title-row">
          <Settings size={28} className="settings-module__icon" />
          <div>
            <h1 className="settings-module__title">Settings</h1>
            <p className="settings-module__subtitle">Admin tools and application configuration</p>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="settings-section__notice settings-section__notice--info" style={{ margin: '0 0 24px 0' }}>
        <AlertTriangle size={16} />
        <span>
          Project configuration, stakeholder setup, and portal activation are now managed from the <strong>Dashboard</strong>.
        </span>
      </div>

      {/* Users Section — Admin Only */}
      {isAdmin && (
        <section className="settings-section">
          <div
            className="settings-section__header settings-section__header--clickable"
            onClick={() => toggleSection('users')}
          >
            <div className="settings-section__header-left">
              <Users size={20} />
              <h2>Users</h2>
            </div>
          </div>

          {expandedSection === 'users' && (
            <div className="settings-section__content">
              <UsersPanel />
            </div>
          )}
        </section>
      )}

      {/* Admin Tools Section */}
      <section className="settings-section">
        <div
          className="settings-section__header settings-section__header--clickable"
          onClick={() => toggleSection('admin-tools')}
        >
          <div className="settings-section__header-left">
            <Palette size={20} />
            <h2>Admin Tools</h2>
          </div>
        </div>

        {expandedSection === 'admin-tools' && (
          <div className="settings-section__content">
            <div className="settings-section__notice settings-section__notice--info">
              <AlertTriangle size={16} />
              <span>
                External applications for advanced project configuration. Changes made in these tools
                are project-specific and stored on the server.
              </span>
            </div>

            {/* Taste Exploration Manager */}
            <div className="admin-tool-card">
              <div className="admin-tool-card__header">
                <Palette size={24} className="admin-tool-card__icon" />
                <div>
                  <h3>Taste Exploration Manager</h3>
                  <p className="admin-tool-card__description">
                    Configure image quads and manage client taste exploration sessions for {currentProjectName}
                  </p>
                </div>
              </div>
              <div className="admin-tool-card__details">
                <ul className="admin-tool-card__features">
                  <li>Enable/disable specific design quads</li>
                  <li>Review client selections and taste profiles</li>
                  <li>Export design preference reports</li>
                  <li>Manage Principal and Secondary assessments</li>
                </ul>
                <p className="admin-tool-card__note">
                  <strong>Note:</strong> All configurations are specific to {currentProjectName} and won't affect other projects.
                </p>
              </div>
              <div className="admin-tool-card__actions">
                <button
                  className="btn btn--primary"
                  onClick={launchTasteExploration}
                  disabled={!activeProjectId}
                >
                  <ExternalLink size={16} />
                  Launch Taste Exploration Manager
                </button>
                {!activeProjectId && (
                  <p className="admin-tool-card__warning">Please select a project first</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Application Defaults — Admin Only */}
      {isAdmin && (
        <section className="settings-section">
          <div
            className="settings-section__header settings-section__header--clickable"
            onClick={() => toggleSection('app-defaults')}
          >
            <div className="settings-section__header-left">
              <Shield size={20} />
              <h2>Application Defaults</h2>
            </div>
          </div>

          {expandedSection === 'app-defaults' && (
            <div className="settings-section__content">
              <PermissionsPanel />
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SettingsModule;
