import React, { useState, useCallback } from 'react';
import {
  Users, Search, CheckCircle2, AlertCircle, Clock,
  ArrowRight, Building2, Palette, GitCompare, Map, Zap,
  ClipboardCheck, ChevronDown, ChevronRight, Trash2, FolderOpen,
  FolderPlus, UserPlus, Briefcase, AlertTriangle, Save,
  Power, PowerOff, ExternalLink, Copy, Home
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import DashboardDocumentation from './DashboardDocumentation';

// ============================================================================
// CONSTANTS
// ============================================================================

// Secret Service codenames for portal password generation (from LCD)
const SECRET_SERVICE_CODENAMES = [
  'Searchlight', 'Timberwolf', 'Renegade', 'Rainbow', 'Rawhide',
  'Deacon', 'Dasher', 'Mogul', 'Celtic', 'Eagle',
  'Volunteer', 'Tumbler', 'Passkey', 'Lancer', 'Scorecard',
  'Sundance', 'Radiance', 'Renaissance', 'Rosebud', 'Tempo',
  'Angler', 'Kittyhawk', 'Evergreen', 'Tranquility', 'Capricorn',
  'Pioneer', 'Phoenix', 'Atlas', 'Mercury', 'Apollo'
];

const generatePassword = () => {
  const codename = SECRET_SERVICE_CODENAMES[Math.floor(Math.random() * SECRET_SERVICE_CODENAMES.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${codename}${number}`;
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
};

const FAMILY_OFFICE_AUTHORITY_OPTIONS = [
  { value: 1, label: 'Level 1: Advisory Only' },
  { value: 2, label: 'Level 2: Veto Power on Budget/Timeline' },
  { value: 3, label: 'Level 3: Co-Signatory on Stage Gates' },
  { value: 4, label: 'Level 4: Full Authority Delegated' },
];

// N4S Task Matrix Configuration
const N4S_MODULES = {
  A: { id: 'kyc', name: 'KYC', fullName: 'Know Your Client', icon: Users, color: 'blue' },
  C: { id: 'fyi', name: 'FYI', fullName: 'Find Your Inspiration', icon: Search, color: 'purple' },
  M: { id: 'mvp', name: 'MVP', fullName: 'Mansion Validation', icon: ClipboardCheck, color: 'green' },
  B: { id: 'kym', name: 'KYM', fullName: 'Know Your Market', icon: Map, color: 'teal' },
  D: { id: 'vmx', name: 'VMX', fullName: 'Vision Matrix', icon: Zap, color: 'gold' },
};

const N4S_PHASES = {
  P1: { name: 'Ask the Right Questions', description: 'Discovery & Requirements' },
  P2: { name: 'Have a Story to Tell', description: 'Analysis & Synthesis' },
  P3: { name: 'Get It Done', description: 'Execution & Delivery' },
};

// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================

const Dashboard = ({ onNavigate, showDocs, onCloseDocs }) => {
  const {
    clientData, updateClientData, kycData, updateKYCData, fyiData,
    calculateCompleteness, lcdData, updateLCDData,
    projects, activeProjectId, createProject, setActiveProjectId, deleteProject,
    hasUnsavedChanges, saveNow, isSaving,
  } = useAppContext();

  // ---------------------------------------------------------------------------
  // LOCAL STATE
  // ---------------------------------------------------------------------------
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(
    !activeProjectId ? 'project' : 'stakeholders'
  );
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [pendingAuthorityLevel, setPendingAuthorityLevel] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // ---------------------------------------------------------------------------
  // DERIVED DATA
  // ---------------------------------------------------------------------------

  // Stakeholder data from portfolioContext
  const stakeholderData = kycData?.principal?.portfolioContext || {};

  const principalName = stakeholderData.principalFirstName
    ? `${stakeholderData.principalFirstName} ${stakeholderData.principalLastName || ''}`.trim()
    : '';
  const secondaryName = stakeholderData.secondaryFirstName
    ? `${stakeholderData.secondaryFirstName} ${stakeholderData.secondaryLastName || ''}`.trim()
    : '';

  // Client type detection
  const clientType = kycData.principal.designIdentity?.clientType || 'individual';
  const hasSecondary = clientType === 'couple';

  // Stakeholder config type
  const getStakeholderConfig = () => {
    const hasSec = stakeholderData.secondaryFirstName || stakeholderData.secondaryLastName || stakeholderData.secondaryEmail;
    const hasAdv = stakeholderData.familyOfficeContact || stakeholderData.familyOfficeAuthorityLevel;
    if (hasSec && hasAdv) return 'principal-secondary-advisor';
    if (hasSec) return 'principal-secondary';
    if (hasAdv) return 'principal-advisor';
    return 'principal-only';
  };
  const stakeholderConfig = getStakeholderConfig();

  // Portal data
  const defaultSlug = generateSlug(clientData?.projectName || 'project');
  const portalSlug = lcdData?.portalSlug || defaultSlug;
  const portalUrl = `https://${portalSlug}.luxebrief.not-4.sale`;

  // Progress calculations
  const principalProgress = calculateCompleteness('principal');
  const secondaryProgress = hasSecondary ? calculateCompleteness('secondary') : 100;
  const kycProgress = hasSecondary
    ? Math.round((principalProgress + secondaryProgress) / 2)
    : principalProgress;

  const fyiSelections = fyiData.selections || {};
  const fyiSelectionCount = Object.values(fyiSelections).filter(s => s?.included).length;
  const fyiProgress = fyiData.completedAt ? 100 :
    fyiSelectionCount >= 20 ? 100 :
    fyiSelectionCount >= 10 ? 75 :
    fyiSelectionCount > 0 ? 50 : 0;

  const mvpProgress = 0;

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const togglePanel = (panel) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  // Project management
  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      await createProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProjectForm(false);
      setExpandedPanel('stakeholders');
    }
  };

  // Stakeholder changes
  const handleStakeholderChange = (field, value) => {
    updateKYCData('principal', 'portfolioContext', { [field]: value });
  };

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

  // Portal activation
  const handleActivatePortal = () => {
    const clientPassword = generatePassword();
    const advisorPassword = generatePassword();
    const slug = lcdData?.portalSlug || defaultSlug;

    updateLCDData({
      portalActive: true,
      portalSlug: slug,
      activatedAt: new Date().toISOString(),
      clientPasswordPlain: clientPassword,
      advisorPasswordPlain: advisorPassword,
      clientPasswordHash: clientPassword,
      advisorPasswordHash: advisorPassword,
    });
  };

  const handleDeactivatePortal = () => {
    if (window.confirm('Are you sure you want to deactivate the client portal? Clients will no longer be able to access their dashboard.')) {
      updateLCDData({ portalActive: false });
    }
  };

  // Clipboard
  const copyToClipboard = useCallback((text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // Module status calculation
  const getModuleStatus = (moduleCode) => {
    switch (moduleCode) {
      case 'A':
        return kycProgress === 0 ? 'not-started' : kycProgress < 100 ? 'in-progress' : 'complete';
      case 'C':
        if (kycProgress < 30) return 'locked';
        return fyiProgress >= 100 ? 'complete' :
          fyiProgress > 0 ? 'in-progress' : 'not-started';
      case 'M':
        if (fyiProgress < 50) return 'locked';
        return mvpProgress === 0 ? 'not-started' : mvpProgress < 100 ? 'in-progress' : 'complete';
      case 'B': return 'not-started';
      case 'D': return 'not-started';
      default: return 'not-started';
    }
  };

  const getPhaseStatus = (phaseCode, moduleCode) => {
    const moduleStatus = getModuleStatus(moduleCode);
    if (moduleStatus === 'not-started') return 'pending';
    if (moduleStatus === 'locked') return 'locked';
    if (moduleStatus === 'complete') return 'complete';

    if (moduleCode === 'A') {
      if (phaseCode === 'P1') return kycProgress > 30 ? 'complete' : 'in-progress';
      if (phaseCode === 'P2') return kycProgress > 60 ? 'in-progress' : 'pending';
      if (phaseCode === 'P3') return kycProgress > 90 ? 'in-progress' : 'pending';
    }
    if (moduleCode === 'C') {
      if (phaseCode === 'P1') return fyiProgress > 30 ? 'complete' : 'in-progress';
      if (phaseCode === 'P2') return fyiProgress > 60 ? 'in-progress' : 'pending';
      if (phaseCode === 'P3') return fyiProgress > 90 ? 'in-progress' : 'pending';
    }
    if (moduleCode === 'M') {
      if (phaseCode === 'P1') return mvpProgress > 30 ? 'complete' : 'in-progress';
      if (phaseCode === 'P2') return mvpProgress > 60 ? 'in-progress' : 'pending';
      if (phaseCode === 'P3') return mvpProgress > 90 ? 'in-progress' : 'pending';
    }
    return 'pending';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'complete': return 'task-cell--complete';
      case 'in-progress': return 'task-cell--active';
      case 'pending': return 'task-cell--pending';
      default: return 'task-cell--locked';
    }
  };

  // Module card data
  const modules = [
    { code: 'A', id: 'kyc', title: 'Module A: KYC', subtitle: 'Know Your Client',
      description: '9-section client profile with multi-stakeholder intake and governance framework',
      icon: Users, progress: kycProgress, status: getModuleStatus('A'), color: 'blue', enabled: true },
    { code: 'C', id: 'fyi', title: 'Module C: FYI', subtitle: 'Find Your Inspiration',
      description: 'Space program with floor assignments and lifestyle requirements',
      icon: Search, progress: fyiProgress,
      status: getModuleStatus('C'), color: 'purple', enabled: kycProgress >= 30 },
    { code: 'M', id: 'mvp', title: 'Module M: MVP', subtitle: 'Mansion Validation',
      description: 'Adjacency validation with red flags and bridges',
      icon: ClipboardCheck, progress: mvpProgress, status: getModuleStatus('M'), color: 'green',
      enabled: fyiProgress >= 50 },
    { code: 'B', id: 'kym', title: 'Module B: KYM', subtitle: 'Know Your Market',
      description: 'Market analysis, comparable properties, and demographics',
      icon: Map, progress: 0, status: getModuleStatus('B'), color: 'teal', enabled: true },
    { code: 'D', id: 'vmx', title: 'Module D: VMX', subtitle: 'Vision Matrix',
      description: 'Budget allocation and project delivery',
      icon: Zap, progress: 0, status: 'not-started', color: 'gold', enabled: false, comingSoon: true },
  ];

  const getStatusBadge = (status, comingSoon) => {
    if (comingSoon) return <span className="badge badge--neutral"><Clock size={14} /> Coming Soon</span>;
    switch (status) {
      case 'complete': return <span className="badge badge--success"><CheckCircle2 size={14} /> Complete</span>;
      case 'in-progress': return <span className="badge badge--warning"><Clock size={14} /> In Progress</span>;
      case 'locked': return <span className="badge badge--neutral"><AlertCircle size={14} /> Locked</span>;
      default: return <span className="badge badge--neutral"><AlertCircle size={14} /> Not Started</span>;
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER — DOCUMENTATION MODE
  // ---------------------------------------------------------------------------
  if (showDocs) {
    return <DashboardDocumentation onClose={onCloseDocs} />;
  }

  // ---------------------------------------------------------------------------
  // RENDER — MAIN DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="dashboard">
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
              <button className="btn btn--secondary" onClick={() => { setShowAuthorityModal(false); setPendingAuthorityLevel(null); }}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={confirmAuthorityLevel}>
                Confirm Authority Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button — top right when unsaved changes */}
      {hasUnsavedChanges && (
        <div className="dashboard__save-bar">
          <button
            className={`btn ${hasUnsavedChanges ? 'btn--primary' : 'btn--success'}`}
            onClick={saveNow}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* ===================================================================
          PANEL 1: PROJECT CONFIGURATION
          =================================================================== */}
      <section className="settings-section">
        <div
          className="settings-section__header settings-section__header--clickable"
          onClick={() => togglePanel('project')}
        >
          <div className="settings-section__header-left">
            <Building2 size={20} />
            <h2>Project Configuration</h2>
          </div>
          <div className="settings-section__header-right">
            {activeProjectId && (
              <span className="settings-section__badge">{clientData.projectName || 'Untitled'}</span>
            )}
            {expandedPanel === 'project' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expandedPanel === 'project' && (
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
                  <button className="btn btn--primary" onClick={handleCreateProject}>Create Project</button>
                  <button className="btn btn--ghost" onClick={() => { setShowNewProjectForm(false); setNewProjectName(''); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn--secondary new-project-btn" onClick={() => setShowNewProjectForm(true)}>
                <FolderPlus size={18} /> Create New Project
              </button>
            )}

            {/* Project List */}
            <div className="project-list">
              <h3 className="project-list__title">Your Projects ({projects.length})</h3>
              {projects.length === 0 ? (
                <div className="project-list__empty"><p>No projects yet. Create your first project above.</p></div>
              ) : (
                <div className="project-list__items">
                  {projects.map(project => (
                    <div key={project.id}
                      className={`project-list__item ${project.id === activeProjectId ? 'project-list__item--active' : ''}`}>
                      <div className="project-list__item-main" onClick={() => setActiveProjectId(project.id)}>
                        <div className="project-list__item-info">
                          <span className="project-list__item-name">{project.name}</span>
                          <span className="project-list__item-date">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        {project.id === activeProjectId && <CheckCircle2 size={18} className="project-list__item-check" />}
                      </div>
                      {projects.length > 1 && (
                        <button className="project-list__item-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) deleteProject(project.id);
                          }}
                          title="Delete project"><Trash2 size={16} /></button>
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
                  type="text" className="form-field__input"
                  value={clientData.projectName || ''}
                  onChange={(e) => updateClientData({ projectName: e.target.value })}
                  placeholder="Enter project name..."
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===================================================================
          PANEL 2: STAKEHOLDER CONFIGURATION
          =================================================================== */}
      <section className="settings-section">
        <div
          className="settings-section__header settings-section__header--clickable"
          onClick={() => togglePanel('stakeholders')}
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
            {expandedPanel === 'stakeholders' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expandedPanel === 'stakeholders' && (
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
                      <input type="text" className="form-field__input" value={stakeholderData.principalFirstName || ''}
                        onChange={(e) => handleStakeholderChange('principalFirstName', e.target.value)} placeholder="First name" />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Last Name *</label>
                      <input type="text" className="form-field__input" value={stakeholderData.principalLastName || ''}
                        onChange={(e) => handleStakeholderChange('principalLastName', e.target.value)} placeholder="Last name" />
                    </div>
                  </div>
                  <div className="form-grid form-grid--2col">
                    <div className="form-field">
                      <label className="form-field__label">Email *</label>
                      <input type="email" className="form-field__input" value={stakeholderData.principalEmail || ''}
                        onChange={(e) => handleStakeholderChange('principalEmail', e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Phone</label>
                      <input type="tel" className="form-field__input" value={stakeholderData.principalPhone || ''}
                        onChange={(e) => handleStakeholderChange('principalPhone', e.target.value)} placeholder="+1 (555) 000-0000" />
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
                      <input type="text" className="form-field__input" value={stakeholderData.secondaryFirstName || ''}
                        onChange={(e) => handleStakeholderChange('secondaryFirstName', e.target.value)} placeholder="First name" />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Last Name</label>
                      <input type="text" className="form-field__input" value={stakeholderData.secondaryLastName || ''}
                        onChange={(e) => handleStakeholderChange('secondaryLastName', e.target.value)} placeholder="Last name" />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-field__label">Email</label>
                    <input type="email" className="form-field__input" value={stakeholderData.secondaryEmail || ''}
                      onChange={(e) => handleStakeholderChange('secondaryEmail', e.target.value)} placeholder="email@example.com" />
                  </div>

                  {/* Respondent Preference */}
                  {(stakeholderData.secondaryFirstName || stakeholderData.secondaryEmail) && (
                    <div className="respondent-preference">
                      <div className="respondent-preference__header">
                        <ClipboardCheck size={16} />
                        <h4>Questionnaire Respondents</h4>
                      </div>
                      <p className="respondent-preference__description">
                        Choose who completes the Design Preferences (P1.A.5) and Lifestyle & Living (P1.A.6) questionnaires.
                      </p>
                      <div className="respondent-preference__options">
                        <label className="respondent-preference__option">
                          <input type="radio" name="questionnaireRespondent" value="principal_only"
                            checked={stakeholderData.questionnaireRespondent !== 'principal_and_secondary'}
                            onChange={() => handleStakeholderChange('questionnaireRespondent', 'principal_only')} />
                          <div className="respondent-preference__option-content">
                            <span className="respondent-preference__option-label">Principal Only</span>
                            <span className="respondent-preference__option-desc">
                              Only {stakeholderData.principalFirstName || 'Principal'} completes the design and lifestyle questionnaires
                            </span>
                          </div>
                        </label>
                        <label className="respondent-preference__option">
                          <input type="radio" name="questionnaireRespondent" value="principal_and_secondary"
                            checked={stakeholderData.questionnaireRespondent === 'principal_and_secondary'}
                            onChange={() => handleStakeholderChange('questionnaireRespondent', 'principal_and_secondary')} />
                          <div className="respondent-preference__option-content">
                            <span className="respondent-preference__option-label">Principal + Secondary</span>
                            <span className="respondent-preference__option-desc">
                              Both {stakeholderData.principalFirstName || 'Principal'} and {stakeholderData.secondaryFirstName || 'Secondary'} complete separate questionnaires
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
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
                      <input type="text" className="form-field__input" value={stakeholderData.familyOfficeContact || ''}
                        onChange={(e) => handleStakeholderChange('familyOfficeContact', e.target.value)}
                        placeholder="Name and firm (if applicable)" />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Authority Level</label>
                      <select className="form-field__select" value={stakeholderData.familyOfficeAuthorityLevel || ''}
                        onChange={(e) => handleAuthorityLevelChange(e.target.value)}>
                        <option value="">Select authority level...</option>
                        {FAMILY_OFFICE_AUTHORITY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p className="form-field__help">Principal must formally designate this</p>
                    </div>
                  </div>
                  <div className="form-grid form-grid--2col">
                    <div className="form-field">
                      <label className="form-field__label">Email</label>
                      <input type="email" className="form-field__input" value={stakeholderData.familyOfficeEmail || ''}
                        onChange={(e) => handleStakeholderChange('familyOfficeEmail', e.target.value)}
                        placeholder="advisor@familyoffice.com" />
                    </div>
                    <div className="form-field">
                      <label className="form-field__label">Phone</label>
                      <input type="tel" className="form-field__input" value={stakeholderData.familyOfficePhone || ''}
                        onChange={(e) => handleStakeholderChange('familyOfficePhone', e.target.value)}
                        placeholder="+1 (555) 000-0000" />
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
                    <textarea className="form-field__textarea" value={stakeholderData.domainDelegationNotes || ''}
                      onChange={(e) => handleStakeholderChange('domainDelegationNotes', e.target.value)}
                      placeholder="Document any specific authority delegations (e.g., 'Secondary has authority over children's spaces and her closet')"
                      rows={3} />
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

      {/* ===================================================================
          PANEL 3: PORTAL ACTIVATION
          =================================================================== */}
      <section className="settings-section">
        <div
          className="settings-section__header settings-section__header--clickable"
          onClick={() => togglePanel('portal')}
        >
          <div className="settings-section__header-left">
            {lcdData?.portalActive ? <Power size={20} style={{ color: '#34d399' }} /> : <PowerOff size={20} />}
            <h2>LuXeBrief Portal</h2>
          </div>
          <div className="settings-section__header-right">
            <span className={`settings-section__badge ${lcdData?.portalActive ? 'settings-section__badge--active' : ''}`}>
              {lcdData?.portalActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
            {expandedPanel === 'portal' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expandedPanel === 'portal' && (
          <div className="settings-section__content">
            {!activeProjectId ? (
              <div className="settings-section__notice">
                <AlertTriangle size={18} />
                <span>Please create a project and configure stakeholders before activating the portal.</span>
              </div>
            ) : !stakeholderData.principalFirstName ? (
              <div className="settings-section__notice">
                <AlertTriangle size={18} />
                <span>Please configure the Principal stakeholder above before activating the portal.</span>
              </div>
            ) : (
              <>
                {lcdData?.portalActive ? (
                  <div className="portal-activation portal-activation--active">
                    <div className="portal-activation__status">
                      <Power size={18} style={{ color: '#34d399' }} />
                      <div className="portal-activation__info">
                        <span className="portal-activation__url">
                          <a href={portalUrl} target="_blank" rel="noopener noreferrer">{portalUrl}</a>
                          <button className="btn btn--icon" onClick={() => copyToClipboard(portalUrl, 'portalUrl')} title="Copy URL">
                            {copiedField === 'portalUrl' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          </button>
                        </span>
                        <span className="portal-activation__meta">
                          Activated {new Date(lcdData.activatedAt).toLocaleDateString()} · Client password: {lcdData.clientPasswordPlain || '••••••'}
                        </span>
                      </div>
                    </div>
                    <div className="portal-activation__actions">
                      <button className="btn btn--secondary btn--sm" onClick={() => onNavigate('lcd')}>
                        Manage Portal <ArrowRight size={14} />
                      </button>
                      <button className="btn btn--danger-outline btn--sm" onClick={handleDeactivatePortal}>
                        <PowerOff size={14} /> Deactivate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="portal-activation portal-activation--inactive">
                    <p className="settings-section__description">
                      Activate the LuXeBrief client portal to give your client access to their dashboard and questionnaires.
                      The portal URL is derived from the project name.
                    </p>

                    {/* Portal Slug Configuration */}
                    <div className="form-field">
                      <label className="form-field__label">Portal Address</label>
                      <div className="slug-input">
                        <input type="text" className="form-field__input"
                          value={lcdData?.portalSlug || defaultSlug}
                          onChange={(e) => updateLCDData({ portalSlug: generateSlug(e.target.value) })}
                          placeholder="project-name" />
                        <span className="slug-input__suffix">.luxebrief.not-4.sale</span>
                      </div>
                      <p className="form-field__help">
                        This will be the address for all client access — intake questionnaire, taste exploration, and portal dashboard.
                      </p>
                    </div>

                    <button className="btn btn--primary" onClick={handleActivatePortal}>
                      <Power size={16} /> Activate Portal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* ===================================================================
          WELCOME SECTION
          =================================================================== */}
      <section className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h1 className="dashboard__title">{principalName ? 'Welcome back' : 'Welcome to N4S'}</h1>
          <p className="dashboard__subtitle">
            {clientData.projectName ? `Managing: ${clientData.projectName}` : 'Ultra-Luxury Residential Advisory Platform'}
          </p>
        </div>
        {activeProjectId && !principalName && (
          <button className="btn btn--primary" onClick={() => togglePanel('stakeholders')}>
            Configure Stakeholders <ArrowRight size={18} />
          </button>
        )}
      </section>

      {/* ===================================================================
          TASK MATRIX
          =================================================================== */}
      <section className="dashboard__matrix">
        <h2 className="dashboard__section-title">N4S Task Matrix</h2>
        <div className="task-matrix">
          <div className="task-matrix__header">
            <div className="task-matrix__corner"></div>
            {Object.entries(N4S_MODULES).map(([code, module]) => (
              <div key={code} className={`task-matrix__module-header task-matrix__module-header--${module.color}`}>
                <span className="task-matrix__code">{code}</span>
                <span className="task-matrix__name">{module.name}</span>
              </div>
            ))}
          </div>
          {Object.entries(N4S_PHASES).map(([phaseCode, phase]) => (
            <div key={phaseCode} className="task-matrix__row">
              <div className="task-matrix__phase-header">
                <span className="task-matrix__phase-code">{phaseCode}</span>
                <span className="task-matrix__phase-name">{phase.name}</span>
              </div>
              {Object.entries(N4S_MODULES).map(([moduleCode, module]) => {
                const status = getPhaseStatus(phaseCode, moduleCode);
                const taskCode = `${phaseCode}.${moduleCode}`;
                return (
                  <div key={taskCode} className={`task-cell ${getStatusClass(status)}`}
                    title={`${taskCode}: ${phase.name} - ${module.fullName}`}>
                    <span className="task-cell__code">{taskCode}</span>
                    {status === 'complete' && <CheckCircle2 size={14} />}
                    {status === 'in-progress' && <Clock size={14} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="task-matrix__legend">
          <span className="legend-item"><span className="legend-dot legend-dot--complete"></span> Complete</span>
          <span className="legend-item"><span className="legend-dot legend-dot--active"></span> In Progress</span>
          <span className="legend-item"><span className="legend-dot legend-dot--pending"></span> Pending</span>
          <span className="legend-item"><span className="legend-dot legend-dot--locked"></span> Locked</span>
        </div>
      </section>

      {/* Quick Stats */}
      {principalName && (
        <section className="dashboard__stats">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--blue"><Users size={24} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{kycProgress}%</span>
              <span className="stat-card__label">KYC Complete</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--purple"><Building2 size={24} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{fyiSelectionCount}</span>
              <span className="stat-card__label">Spaces Selected</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--teal"><Palette size={24} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{fyiData.settings?.targetSF ? fyiData.settings.targetSF.toLocaleString() : '—'}</span>
              <span className="stat-card__label">Target SF</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--gold"><GitCompare size={24} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{fyiData.settings?.programTier?.toUpperCase() || '—'}</span>
              <span className="stat-card__label">Program Tier</span>
            </div>
          </div>
        </section>
      )}

      {/* Module Cards */}
      <section className="dashboard__modules">
        <h2 className="dashboard__section-title">Modules</h2>
        <div className="dashboard__module-grid">
          {modules.map(module => {
            const Icon = module.icon;
            return (
              <div key={module.id}
                className={`module-card module-card--${module.color} ${module.comingSoon ? 'module-card--disabled' : ''} ${module.status === 'locked' ? 'module-card--locked' : ''}`}
                onClick={() => module.enabled && onNavigate(module.id)}>
                <div className="module-card__header">
                  <div className="module-card__icon"><Icon size={28} /></div>
                  {getStatusBadge(module.status, module.comingSoon)}
                </div>
                <h3 className="module-card__title">{module.title}</h3>
                <p className="module-card__subtitle">{module.subtitle}</p>
                <p className="module-card__description">{module.description}</p>
                {!module.comingSoon && module.status !== 'locked' && (
                  <>
                    <div className="module-card__progress">
                      <div className="progress-bar">
                        <div className="progress-bar__fill" style={{ width: `${module.progress}%` }} />
                      </div>
                      <span className="progress-bar__label">{module.progress}% Complete</span>
                    </div>
                    <button className="module-card__cta">
                      {module.status === 'not-started' ? 'Begin' : 'Continue'} <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Overview */}
      <section className="dashboard__workflow">
        <h2 className="dashboard__section-title">N4S Methodology</h2>
        <div className="workflow-phases">
          {Object.entries(N4S_PHASES).map(([code, phase], index) => (
            <React.Fragment key={code}>
              <div className="workflow-phase">
                <div className="workflow-phase__code">{code}</div>
                <div className="workflow-phase__content">
                  <h4>{phase.name}</h4>
                  <p>{phase.description}</p>
                </div>
              </div>
              {index < Object.entries(N4S_PHASES).length - 1 && <div className="workflow-phase__connector" />}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
