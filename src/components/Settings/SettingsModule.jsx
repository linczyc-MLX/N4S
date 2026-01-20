import React, { useState } from 'react';
import {
  Settings, FolderPlus, Users, Building2, Trash2, CheckCircle2,
  ChevronDown, ChevronRight, AlertTriangle, Save, UserPlus, Briefcase
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import './SettingsModule.css';

/**
 * SettingsModule - Global Configuration Hub
 *
 * This module centralizes:
 * 1. Project Management (create, select, delete projects)
 * 2. Stakeholder Configuration (Principal, Secondary, Family Office Advisor)
 * 3. Future: Default settings, export options, etc.
 */

const SettingsModule = () => {
  const {
    projects,
    activeProjectId,
    createProject,
    deleteProject,
    setActiveProjectId,
    clientData,
    updateClientData,
    kycData,
    updateKYCData,
    hasUnsavedChanges,
    saveNow,
    isSaving,
  } = useAppContext();

  // Local state
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState('stakeholders');
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [pendingAuthorityLevel, setPendingAuthorityLevel] = useState(null);

  // Get stakeholder data from principal's portfolioContext
  const stakeholderData = kycData?.principal?.portfolioContext || {};

  // Stakeholder configuration type detection
  const getStakeholderConfig = () => {
    const hasSecondary = stakeholderData.secondaryFirstName || stakeholderData.secondaryLastName || stakeholderData.secondaryEmail;
    const hasAdvisor = stakeholderData.familyOfficeContact || stakeholderData.familyOfficeAuthorityLevel;

    if (hasSecondary && hasAdvisor) return 'principal-secondary-advisor';
    if (hasSecondary) return 'principal-secondary';
    if (hasAdvisor) return 'principal-advisor';
    return 'principal-only';
  };

  const stakeholderConfig = getStakeholderConfig();

  // Handle stakeholder field changes
  const handleStakeholderChange = (field, value) => {
    updateKYCData('principal', 'portfolioContext', { [field]: value });
  };

  // Handle authority level selection with confirmation for Level 3+
  const handleAuthorityLevelChange = (value) => {
    const level = parseInt(value);
    if (level >= 3) {
      setPendingAuthorityLevel(level);
      setShowAuthorityModal(true);
    } else {
      handleStakeholderChange('familyOfficeAuthorityLevel', level);
      handleStakeholderChange('authorityLevelConfirmed', false);
    }
  };

  const confirmAuthorityLevel = () => {
    handleStakeholderChange('familyOfficeAuthorityLevel', pendingAuthorityLevel);
    handleStakeholderChange('authorityLevelConfirmed', true);
    setShowAuthorityModal(false);
    setPendingAuthorityLevel(null);
  };

  // Project management handlers
  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      await createProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProjectForm(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Delete "${projectName}"? This cannot be undone.`)) {
      await deleteProject(projectId);
    }
  };

  const familyOfficeAuthorityOptions = [
    { value: 1, label: 'Level 1: Advisory Only' },
    { value: 2, label: 'Level 2: Veto Power on Budget/Timeline' },
    { value: 3, label: 'Level 3: Co-Signatory on Stage Gates' },
    { value: 4, label: 'Level 4: Full Authority Delegated' },
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="settings-module">
      {/* Authority Level Confirmation Modal */}
      {showAuthorityModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <AlertTriangle size={24} className="modal__icon modal__icon--warning" />
              <h3>Confirm Authority Level</h3>
            </div>
            <div className="modal__body">
              <p>
                You are granting <strong>
                  {pendingAuthorityLevel === 3 ? 'Level 3: Co-Signatory on Stage Gates' : 'Level 4: Full Authority Delegated'}
                </strong> to your Family Office/Advisor.
              </p>
              <p className="modal__warning">
                This means they will {pendingAuthorityLevel === 3
                  ? 'need to co-sign all stage gate approvals'
                  : 'have full authority to make decisions on your behalf'}.
              </p>
              <p>Are you sure you want to proceed?</p>
            </div>
            <div className="modal__actions">
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setShowAuthorityModal(false);
                  setPendingAuthorityLevel(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={confirmAuthorityLevel}
              >
                Confirm Authority Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="settings-module__header">
        <div className="settings-module__title-row">
          <Settings size={28} className="settings-module__icon" />
          <div>
            <h1 className="settings-module__title">Settings</h1>
            <p className="settings-module__subtitle">Global configuration and project management</p>
          </div>
        </div>
        {hasUnsavedChanges && (
          <button
            className="btn btn--primary"
            onClick={saveNow}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Project Management Section */}
      <section className="settings-section">
        <div
          className="settings-section__header"
          onClick={() => toggleSection('projects')}
        >
          <div className="settings-section__header-left">
            <Building2 size={20} />
            <h2>Project Management</h2>
          </div>
          {expandedSection === 'projects' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>

        {expandedSection === 'projects' && (
          <div className="settings-section__content">
            <p className="settings-section__description">
              Create and manage your N4S projects. Each project contains its own client data, space program, and market analysis.
            </p>

            {/* New Project Form */}
            {showNewProjectForm ? (
              <div className="new-project-form">
                <input
                  type="text"
                  className="new-project-form__input"
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  autoFocus
                />
                <div className="new-project-form__actions">
                  <button className="btn btn--primary" onClick={handleCreateProject}>
                    Create Project
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={() => { setShowNewProjectForm(false); setNewProjectName(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn--secondary new-project-btn"
                onClick={() => setShowNewProjectForm(true)}
              >
                <FolderPlus size={18} />
                Create New Project
              </button>
            )}

            {/* Project List */}
            <div className="project-list">
              <h3 className="project-list__title">Your Projects ({projects.length})</h3>
              {projects.length === 0 ? (
                <div className="project-list__empty">
                  <p>No projects yet. Create your first project above.</p>
                </div>
              ) : (
                <div className="project-list__items">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`project-list__item ${project.id === activeProjectId ? 'project-list__item--active' : ''}`}
                    >
                      <div
                        className="project-list__item-main"
                        onClick={() => setActiveProjectId(project.id)}
                      >
                        <div className="project-list__item-info">
                          <span className="project-list__item-name">{project.name}</span>
                          <span className="project-list__item-date">
                            Created: {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {project.id === activeProjectId && (
                          <CheckCircle2 size={18} className="project-list__item-check" />
                        )}
                      </div>
                      {projects.length > 1 && (
                        <button
                          className="project-list__item-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id, project.name);
                          }}
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Project Name Edit */}
            {activeProjectId && (
              <div className="active-project-edit">
                <label className="form-field__label">Active Project Name</label>
                <input
                  type="text"
                  className="form-field__input"
                  value={clientData.projectName || ''}
                  onChange={(e) => updateClientData({ projectName: e.target.value })}
                  placeholder="Enter project name..."
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Stakeholder Configuration Section */}
      <section className="settings-section">
        <div
          className="settings-section__header"
          onClick={() => toggleSection('stakeholders')}
        >
          <div className="settings-section__header-left">
            <Users size={20} />
            <h2>Stakeholder Configuration</h2>
          </div>
          <div className="settings-section__header-right">
            <span className="settings-section__badge">
              {stakeholderConfig === 'principal-only' && 'Principal Only'}
              {stakeholderConfig === 'principal-secondary' && 'Principal + Secondary'}
              {stakeholderConfig === 'principal-advisor' && 'Principal + Advisor'}
              {stakeholderConfig === 'principal-secondary-advisor' && 'Principal + Secondary + Advisor'}
            </span>
            {expandedSection === 'stakeholders' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expandedSection === 'stakeholders' && (
          <div className="settings-section__content">
            {!activeProjectId ? (
              <div className="settings-section__notice">
                <AlertTriangle size={18} />
                <span>Please create or select a project first to configure stakeholders.</span>
              </div>
            ) : (
              <>
                <p className="settings-section__description">
                  Configure the stakeholders for this project. The Principal is the contractual decision-maker.
                  Secondary stakeholders and Family Office Advisors can be added based on your project structure.
                </p>

                {/* Principal Designation */}
                <div className="stakeholder-group">
                  <div className="stakeholder-group__header">
                    <UserPlus size={18} />
                    <h3>Principal Designation</h3>
                    <span className="stakeholder-group__required">Required</span>
                  </div>
                  <p className="stakeholder-group__description">
                    The Principal is the contractual decision-maker who signs all agreements and has final authority on Hard Stop decisions.
                  </p>

                  <div className="form-grid form-grid--2col">
                    <div className="form-field">
                      <label className="form-field__label">First Name *</label>
                      <input
                        type="text"
                        className="form-field__input"
                        value={stakeholderData.principalFirstName || ''}
                        onChange={(e) => handleStakeholderChange('principalFirstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Last Name *</label>
                      <input
                        type="text"
                        className="form-field__input"
                        value={stakeholderData.principalLastName || ''}
                        onChange={(e) => handleStakeholderChange('principalLastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="form-grid form-grid--2col">
                    <div className="form-field">
                      <label className="form-field__label">Email *</label>
                      <input
                        type="email"
                        className="form-field__input"
                        value={stakeholderData.principalEmail || ''}
                        onChange={(e) => handleStakeholderChange('principalEmail', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Phone</label>
                      <input
                        type="tel"
                        className="form-field__input"
                        value={stakeholderData.principalPhone || ''}
                        onChange={(e) => handleStakeholderChange('principalPhone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Stakeholder */}
                <div className="stakeholder-group">
                  <div className="stakeholder-group__header">
                    <Users size={18} />
                    <h3>Secondary Stakeholder</h3>
                    <span className="stakeholder-group__optional">Optional</span>
                  </div>
                  <p className="stakeholder-group__description">
                    Spouse or co-decision-maker (if applicable). Secondary stakeholders complete their own taste profile and lifestyle preferences.
                  </p>

                  <div className="form-grid form-grid--2col">
                    <div className="form-field">
                      <label className="form-field__label">First Name</label>
                      <input
                        type="text"
                        className="form-field__input"
                        value={stakeholderData.secondaryFirstName || ''}
                        onChange={(e) => handleStakeholderChange('secondaryFirstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Last Name</label>
                      <input
                        type="text"
                        className="form-field__input"
                        value={stakeholderData.secondaryLastName || ''}
                        onChange={(e) => handleStakeholderChange('secondaryLastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-field__label">Email</label>
                    <input
                      type="email"
                      className="form-field__input"
                      value={stakeholderData.secondaryEmail || ''}
                      onChange={(e) => handleStakeholderChange('secondaryEmail', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Family Office / Advisor */}
                <div className="stakeholder-group">
                  <div className="stakeholder-group__header">
                    <Briefcase size={18} />
                    <h3>Family Office / Advisor</h3>
                    <span className="stakeholder-group__optional">Optional</span>
                  </div>
                  <p className="stakeholder-group__description">
                    Family office representative or advisor who may have delegated authority on certain decisions.
                  </p>

                  <div className="form-grid form-grid--2col">
                    <div className="form-field">
                      <label className="form-field__label">Contact Name & Firm</label>
                      <input
                        type="text"
                        className="form-field__input"
                        value={stakeholderData.familyOfficeContact || ''}
                        onChange={(e) => handleStakeholderChange('familyOfficeContact', e.target.value)}
                        placeholder="Name and firm (if applicable)"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Authority Level</label>
                      <select
                        className="form-field__select"
                        value={stakeholderData.familyOfficeAuthorityLevel || ''}
                        onChange={(e) => handleAuthorityLevelChange(e.target.value)}
                      >
                        <option value="">Select authority level...</option>
                        {familyOfficeAuthorityOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p className="form-field__help">Principal must formally designate this</p>
                    </div>
                  </div>

                  {stakeholderData.familyOfficeAuthorityLevel >= 3 && stakeholderData.authorityLevelConfirmed && (
                    <div className="settings-section__notice settings-section__notice--info">
                      <AlertTriangle size={16} />
                      <span>
                        Authority Level {stakeholderData.familyOfficeAuthorityLevel} confirmed.
                        Stage gates will require {stakeholderData.familyOfficeAuthorityLevel === 3 ? 'co-signature' : 'advisor approval'}.
                      </span>
                    </div>
                  )}

                  <div className="form-field">
                    <label className="form-field__label">Domain Delegation Notes</label>
                    <textarea
                      className="form-field__textarea"
                      value={stakeholderData.domainDelegationNotes || ''}
                      onChange={(e) => handleStakeholderChange('domainDelegationNotes', e.target.value)}
                      placeholder="Document any specific authority delegations (e.g., 'Secondary has authority over children's spaces and her closet')"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Stakeholder Summary */}
                <div className="stakeholder-summary">
                  <h4>Current Configuration</h4>
                  <div className="stakeholder-summary__grid">
                    <div className={`stakeholder-summary__item ${stakeholderData.principalFirstName ? 'stakeholder-summary__item--complete' : ''}`}>
                      <CheckCircle2 size={16} />
                      <span>Principal: {stakeholderData.principalFirstName ? `${stakeholderData.principalFirstName} ${stakeholderData.principalLastName}` : 'Not configured'}</span>
                    </div>
                    <div className={`stakeholder-summary__item ${stakeholderData.secondaryFirstName ? 'stakeholder-summary__item--complete' : 'stakeholder-summary__item--empty'}`}>
                      {stakeholderData.secondaryFirstName ? <CheckCircle2 size={16} /> : <span className="stakeholder-summary__dash">—</span>}
                      <span>Secondary: {stakeholderData.secondaryFirstName ? `${stakeholderData.secondaryFirstName} ${stakeholderData.secondaryLastName}` : 'Not configured'}</span>
                    </div>
                    <div className={`stakeholder-summary__item ${stakeholderData.familyOfficeContact ? 'stakeholder-summary__item--complete' : 'stakeholder-summary__item--empty'}`}>
                      {stakeholderData.familyOfficeContact ? <CheckCircle2 size={16} /> : <span className="stakeholder-summary__dash">—</span>}
                      <span>Advisor: {stakeholderData.familyOfficeContact || 'Not configured'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Future sections placeholder */}
      <section className="settings-section settings-section--disabled">
        <div className="settings-section__header">
          <div className="settings-section__header-left">
            <Settings size={20} />
            <h2>Application Defaults</h2>
          </div>
          <span className="settings-section__coming-soon">Coming Soon</span>
        </div>
      </section>
    </div>
  );
};

export default SettingsModule;
