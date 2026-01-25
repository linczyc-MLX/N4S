import React, { useState, useCallback } from 'react';
import {
  Monitor, Power, PowerOff, Key, Copy, Eye, EyeOff, RefreshCw,
  Mail, Bell, BellOff, Send, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Clock, AlertTriangle, ExternalLink,
  Users, FileText, Map, MapPin, DollarSign, Search, ClipboardCheck,
  Save, Activity
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import './LCDModule.css';

/**
 * LCDModule - LuXeBrief Client Dashboard Control Panel
 *
 * Admin interface for managing client portal at [project].luxebrief.not-4.sale
 *
 * Features:
 * - Portal activation/deactivation
 * - Password generation (Secret Service codenames)
 * - Content visibility controls
 * - Milestone tracking
 * - Notification settings
 * - Parker (PANDA) configuration
 */

// Secret Service codenames for password generation
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
  const number = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${codename}${number}`;
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
};

const LCDModule = () => {
  const {
    activeProjectId,
    clientData,
    kycData,
    lcdData,
    updateLCDData,
    hasUnsavedChanges,
    saveNow,
    isSaving,
    calculateCompleteness,
  } = useAppContext();

  // Local state
  const [expandedSection, setExpandedSection] = useState('status');
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [showAdvisorPassword, setShowAdvisorPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Get stakeholder names for display
  const principalName = `${kycData?.principal?.portfolioContext?.principalFirstName || ''} ${kycData?.principal?.portfolioContext?.principalLastName || ''}`.trim() || 'Principal';
  const secondaryName = `${kycData?.principal?.portfolioContext?.secondaryFirstName || ''} ${kycData?.principal?.portfolioContext?.secondaryLastName || ''}`.trim();
  const projectName = clientData?.projectName || 'Untitled Project';

  // Default slug from project name
  const defaultSlug = generateSlug(projectName);
  const portalSlug = lcdData?.portalSlug || defaultSlug;
  const portalUrl = `https://${portalSlug}.luxebrief.not-4.sale`;
  const advisorUrl = `${portalUrl}/advisor`;

  // Module completion status
  const getModuleStatus = (moduleId) => {
    const completion = calculateCompleteness('principal');
    // Simplified status check - in real implementation, check actual module data
    switch (moduleId) {
      case 'kyc': return completion > 0 ? (completion >= 100 ? 'complete' : 'in_progress') : 'not_started';
      case 'fyi': return 'not_started'; // Check FYI data
      case 'mvp': return 'not_started';
      case 'kym': return 'not_started';
      case 'kys': return 'not_started';
      case 'vmx': return 'not_started';
      default: return 'not_started';
    }
  };

  // Copy to clipboard handler
  const copyToClipboard = useCallback((text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Handle portal activation
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
      // In production, these would be hashed server-side
      clientPasswordHash: clientPassword,
      advisorPasswordHash: advisorPassword,
    });
  };

  // Handle portal deactivation
  const handleDeactivatePortal = () => {
    if (window.confirm('Are you sure you want to deactivate the client portal? Clients will no longer be able to access their dashboard.')) {
      updateLCDData({
        portalActive: false,
      });
    }
  };

  // Reset password handlers
  const handleResetClientPassword = () => {
    const newPassword = generatePassword();
    updateLCDData({
      clientPasswordPlain: newPassword,
      clientPasswordHash: newPassword,
    });
  };

  const handleResetAdvisorPassword = () => {
    const newPassword = generatePassword();
    updateLCDData({
      advisorPasswordPlain: newPassword,
      advisorPasswordHash: newPassword,
    });
  };

  // Visibility toggle handler
  const handleVisibilityToggle = (module, field) => {
    const currentVisibility = lcdData?.visibility?.[module] || {};
    updateLCDData({
      visibility: {
        [module]: {
          ...currentVisibility,
          [field]: !currentVisibility[field],
        },
      },
    });
  };

  // Notification toggle handler
  const handleNotificationToggle = (field) => {
    const currentNotifications = lcdData?.notifications || {};
    updateLCDData({
      notifications: {
        [field]: !currentNotifications[field],
      },
    });
  };

  // Parker settings handler
  const handleParkerChange = (field, value) => {
    updateLCDData({
      parker: {
        [field]: value,
      },
    });
  };

  // Module icons mapping
  const moduleIcons = {
    kyc: Users,
    fyi: Search,
    mvp: ClipboardCheck,
    kym: Map,
    kys: MapPin,
    vmx: DollarSign,
  };

  // Module names mapping
  const moduleNames = {
    kyc: 'KYC - Know Your Client',
    fyi: 'FYI - Find Your Inspiration',
    mvp: 'MVP - Mansion Validation',
    kym: 'KYM - Know Your Market',
    kys: 'KYS - Know Your Site',
    vmx: 'VMX - Vision Matrix',
  };

  if (!activeProjectId) {
    return (
      <div className="lcd-module">
        <div className="lcd-module__header">
          <div className="lcd-module__title-row">
            <Monitor size={28} className="lcd-module__icon" />
            <div>
              <h1 className="lcd-module__title">LuXeBrief Portal</h1>
              <p className="lcd-module__subtitle">Client Dashboard Control Panel</p>
            </div>
          </div>
        </div>
        <div className="lcd-module__no-project">
          <AlertTriangle size={48} />
          <h2>No Project Selected</h2>
          <p>Please create or select a project in Settings to configure the client portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lcd-module">
      {/* Header */}
      <div className="lcd-module__header">
        <div className="lcd-module__title-row">
          <Monitor size={28} className="lcd-module__icon" />
          <div>
            <h1 className="lcd-module__title">LuXeBrief Portal</h1>
            <p className="lcd-module__subtitle">Client Dashboard Control Panel</p>
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

      {/* Portal Status Section */}
      <section className="lcd-section">
        <div
          className="lcd-section__header"
          onClick={() => toggleSection('status')}
        >
          <div className="lcd-section__header-left">
            {lcdData?.portalActive ? <Power size={20} className="lcd-section__icon--active" /> : <PowerOff size={20} />}
            <h2>Portal Status</h2>
          </div>
          <div className="lcd-section__header-right">
            <span className={`lcd-section__status-badge ${lcdData?.portalActive ? 'lcd-section__status-badge--active' : 'lcd-section__status-badge--inactive'}`}>
              {lcdData?.portalActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
            {expandedSection === 'status' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expandedSection === 'status' && (
          <div className="lcd-section__content">
            {lcdData?.portalActive ? (
              <div className="portal-status portal-status--active">
                <div className="portal-status__info">
                  <div className="portal-status__url">
                    <ExternalLink size={16} />
                    <a href={portalUrl} target="_blank" rel="noopener noreferrer">{portalUrl}</a>
                  </div>
                  <div className="portal-status__meta">
                    <span>Activated: {new Date(lcdData.activatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="portal-status__actions">
                  <button className="btn btn--danger-outline" onClick={handleDeactivatePortal}>
                    <PowerOff size={16} />
                    Deactivate Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="portal-status portal-status--inactive">
                <div className="portal-status__info">
                  <p>The client portal is not yet active. Activate it to give your client access to their dashboard.</p>
                  <div className="portal-status__preview">
                    <span className="portal-status__preview-label">Portal URL will be:</span>
                    <code>{portalUrl}</code>
                  </div>
                </div>
                <div className="portal-status__actions">
                  <button className="btn btn--primary" onClick={handleActivatePortal}>
                    <Power size={16} />
                    Activate Portal
                  </button>
                </div>
              </div>
            )}

            {/* Portal Slug Configuration */}
            <div className="form-field">
              <label className="form-field__label">Portal Subdomain</label>
              <div className="slug-input">
                <input
                  type="text"
                  className="form-field__input"
                  value={lcdData?.portalSlug || defaultSlug}
                  onChange={(e) => updateLCDData({ portalSlug: generateSlug(e.target.value) })}
                  placeholder="project-name"
                  disabled={lcdData?.portalActive}
                />
                <span className="slug-input__suffix">.luxebrief.not-4.sale</span>
              </div>
              {lcdData?.portalActive && (
                <p className="form-field__help">Deactivate portal to change subdomain</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Access Credentials Section */}
      <section className="lcd-section">
        <div
          className="lcd-section__header"
          onClick={() => toggleSection('credentials')}
        >
          <div className="lcd-section__header-left">
            <Key size={20} />
            <h2>Access Credentials</h2>
          </div>
          {expandedSection === 'credentials' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>

        {expandedSection === 'credentials' && (
          <div className="lcd-section__content">
            {!lcdData?.portalActive ? (
              <div className="lcd-section__notice">
                <AlertTriangle size={18} />
                <span>Activate the portal first to generate access credentials.</span>
              </div>
            ) : (
              <div className="credentials-grid">
                {/* Client Access */}
                <div className="credential-card">
                  <h3 className="credential-card__title">
                    <Users size={18} />
                    Client Access
                  </h3>
                  <p className="credential-card__description">For {principalName}{secondaryName ? ` and ${secondaryName}` : ''}</p>

                  <div className="credential-field">
                    <label>URL</label>
                    <div className="credential-field__value">
                      <code>{portalUrl}</code>
                      <button
                        className="btn btn--icon"
                        onClick={() => copyToClipboard(portalUrl, 'clientUrl')}
                        title="Copy URL"
                      >
                        {copiedField === 'clientUrl' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="credential-field">
                    <label>Password</label>
                    <div className="credential-field__value">
                      <code>{showClientPassword ? (lcdData?.clientPasswordPlain || '••••••••') : '••••••••'}</code>
                      <button
                        className="btn btn--icon"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        title={showClientPassword ? 'Hide' : 'Show'}
                      >
                        {showClientPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="btn btn--icon"
                        onClick={() => copyToClipboard(lcdData?.clientPasswordPlain || '', 'clientPwd')}
                        title="Copy password"
                      >
                        {copiedField === 'clientPwd' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <button className="btn btn--secondary btn--sm" onClick={handleResetClientPassword}>
                    <RefreshCw size={14} />
                    Reset Password
                  </button>
                </div>

                {/* Advisor Access */}
                <div className="credential-card">
                  <h3 className="credential-card__title">
                    <Activity size={18} />
                    Advisor Access
                  </h3>
                  <p className="credential-card__description">For LRA team members</p>

                  <div className="credential-field">
                    <label>URL</label>
                    <div className="credential-field__value">
                      <code>{advisorUrl}</code>
                      <button
                        className="btn btn--icon"
                        onClick={() => copyToClipboard(advisorUrl, 'advisorUrl')}
                        title="Copy URL"
                      >
                        {copiedField === 'advisorUrl' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="credential-field">
                    <label>Password</label>
                    <div className="credential-field__value">
                      <code>{showAdvisorPassword ? (lcdData?.advisorPasswordPlain || '••••••••') : '••••••••'}</code>
                      <button
                        className="btn btn--icon"
                        onClick={() => setShowAdvisorPassword(!showAdvisorPassword)}
                        title={showAdvisorPassword ? 'Hide' : 'Show'}
                      >
                        {showAdvisorPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="btn btn--icon"
                        onClick={() => copyToClipboard(lcdData?.advisorPasswordPlain || '', 'advisorPwd')}
                        title="Copy password"
                      >
                        {copiedField === 'advisorPwd' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <button className="btn btn--secondary btn--sm" onClick={handleResetAdvisorPassword}>
                    <RefreshCw size={14} />
                    Reset Password
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Content Visibility Section */}
      <section className="lcd-section">
        <div
          className="lcd-section__header"
          onClick={() => toggleSection('visibility')}
        >
          <div className="lcd-section__header-left">
            <Eye size={20} />
            <h2>Content Visibility</h2>
          </div>
          {expandedSection === 'visibility' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>

        {expandedSection === 'visibility' && (
          <div className="lcd-section__content">
            <p className="lcd-section__description">
              Control what content the client can see in their portal. Toggle individual items on/off.
            </p>

            <div className="visibility-modules">
              {Object.entries(moduleNames).map(([moduleId, moduleName]) => {
                const Icon = moduleIcons[moduleId];
                const moduleVisibility = lcdData?.visibility?.[moduleId] || {};
                const status = getModuleStatus(moduleId);

                return (
                  <div key={moduleId} className="visibility-module">
                    <div className="visibility-module__header">
                      <Icon size={18} />
                      <span className="visibility-module__name">{moduleName}</span>
                      <span className={`visibility-module__status visibility-module__status--${status}`}>
                        {status === 'complete' && <CheckCircle2 size={14} />}
                        {status === 'in_progress' && <Clock size={14} />}
                        {status === 'not_started' && <Circle size={14} />}
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="visibility-module__items">
                      {moduleId === 'kyc' && (
                        <>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.profileReport !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'profileReport')}
                            />
                            <span>Client Profile Report (PDF)</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.luxebriefPrincipal !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'luxebriefPrincipal')}
                            />
                            <span>LuXeBrief Questionnaire (Principal)</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.luxebriefSecondary !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'luxebriefSecondary')}
                            />
                            <span>LuXeBrief Questionnaire (Secondary)</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.partnerAlignment !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'partnerAlignment')}
                            />
                            <span>Partner Alignment Score</span>
                          </label>
                        </>
                      )}
                      {moduleId === 'fyi' && (
                        <>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.spaceProgram !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'spaceProgram')}
                            />
                            <span>Space Program Summary (PDF)</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.zoneBreakdown !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'zoneBreakdown')}
                            />
                            <span>Zone Breakdown (Visual)</span>
                          </label>
                        </>
                      )}
                      {moduleId === 'mvp' && (
                        <>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.validationResults !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'validationResults')}
                            />
                            <span>Validation Results</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.designBrief !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'designBrief')}
                            />
                            <span>Design Brief Summary</span>
                          </label>
                        </>
                      )}
                      {moduleId === 'kym' && (
                        <>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.propertyShortlist !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'propertyShortlist')}
                            />
                            <span>Curated Property Shortlist</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.marketSnapshot !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'marketSnapshot')}
                            />
                            <span>Market Snapshot</span>
                          </label>
                        </>
                      )}
                      {moduleId === 'kys' && (
                        <>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.recommendedSites !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'recommendedSites')}
                            />
                            <span>Recommended Sites</span>
                          </label>
                          <label className="visibility-item">
                            <input
                              type="checkbox"
                              checked={moduleVisibility.siteComparison !== false}
                              onChange={() => handleVisibilityToggle(moduleId, 'siteComparison')}
                            />
                            <span>Site Comparison View</span>
                          </label>
                        </>
                      )}
                      {moduleId === 'vmx' && (
                        <label className="visibility-item">
                          <input
                            type="checkbox"
                            checked={moduleVisibility.budgetSummary !== false}
                            onChange={() => handleVisibilityToggle(moduleId, 'budgetSummary')}
                          />
                          <span>Budget Summary (Range Only)</span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Milestone Tracking Section */}
      <section className="lcd-section">
        <div
          className="lcd-section__header"
          onClick={() => toggleSection('milestones')}
        >
          <div className="lcd-section__header-left">
            <CheckCircle2 size={20} />
            <h2>Milestone Tracking</h2>
          </div>
          {expandedSection === 'milestones' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>

        {expandedSection === 'milestones' && (
          <div className="lcd-section__content">
            <p className="lcd-section__description">
              Track client sign-offs for each module. Clients must sign off to progress through phases.
            </p>

            <table className="milestone-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Status</th>
                  <th>Client Sign-off</th>
                  <th>Signed Date</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(moduleNames).map(([moduleId, moduleName]) => {
                  const milestone = lcdData?.milestones?.[moduleId] || {};
                  const status = getModuleStatus(moduleId);

                  return (
                    <tr key={moduleId}>
                      <td>
                        <span className="milestone-table__module">{moduleId.toUpperCase()}</span>
                      </td>
                      <td>
                        <span className={`milestone-table__status milestone-table__status--${status}`}>
                          {status === 'complete' && 'Complete'}
                          {status === 'in_progress' && 'In Progress'}
                          {status === 'not_started' && 'Not Started'}
                        </span>
                      </td>
                      <td>
                        {milestone.signed ? (
                          <span className="milestone-table__signed">
                            <CheckCircle2 size={16} />
                            Signed
                          </span>
                        ) : (
                          <span className="milestone-table__pending">
                            <Circle size={16} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        {milestone.signedAt ? new Date(milestone.signedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Notifications Section */}
      <section className="lcd-section">
        <div
          className="lcd-section__header"
          onClick={() => toggleSection('notifications')}
        >
          <div className="lcd-section__header-left">
            <Bell size={20} />
            <h2>Notifications</h2>
          </div>
          {expandedSection === 'notifications' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>

        {expandedSection === 'notifications' && (
          <div className="lcd-section__content">
            <div className="notification-emails">
              <div className="form-field">
                <label className="form-field__label">Client Email</label>
                <input
                  type="email"
                  className="form-field__input"
                  value={lcdData?.clientEmail || kycData?.principal?.portfolioContext?.principalEmail || ''}
                  onChange={(e) => updateLCDData({ clientEmail: e.target.value })}
                  placeholder="client@email.com"
                />
              </div>
              <div className="form-field">
                <label className="form-field__label">Secondary Email</label>
                <input
                  type="email"
                  className="form-field__input"
                  value={lcdData?.secondaryEmail || kycData?.principal?.portfolioContext?.secondaryEmail || ''}
                  onChange={(e) => updateLCDData({ secondaryEmail: e.target.value })}
                  placeholder="secondary@email.com"
                />
              </div>
            </div>

            <div className="notification-toggles">
              <h4>Auto-notify when:</h4>
              <label className="notification-toggle">
                <input
                  type="checkbox"
                  checked={lcdData?.notifications?.onNewDocument !== false}
                  onChange={() => handleNotificationToggle('onNewDocument')}
                />
                <span>New document available</span>
              </label>
              <label className="notification-toggle">
                <input
                  type="checkbox"
                  checked={lcdData?.notifications?.onMilestoneReady !== false}
                  onChange={() => handleNotificationToggle('onMilestoneReady')}
                />
                <span>Milestone ready for sign-off</span>
              </label>
              <label className="notification-toggle">
                <input
                  type="checkbox"
                  checked={lcdData?.notifications?.onQuestionnaireReminder !== false}
                  onChange={() => handleNotificationToggle('onQuestionnaireReminder')}
                />
                <span>Questionnaire reminder (after 7 days)</span>
              </label>
              <label className="notification-toggle">
                <input
                  type="checkbox"
                  checked={lcdData?.notifications?.weeklyProgress === true}
                  onChange={() => handleNotificationToggle('weeklyProgress')}
                />
                <span>Weekly progress summary</span>
              </label>
            </div>

            <div className="notification-actions">
              <button className="btn btn--secondary">
                <Send size={16} />
                Send Test Email
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Parker Settings Section */}
      <section className="lcd-section">
        <div
          className="lcd-section__header"
          onClick={() => toggleSection('parker')}
        >
          <div className="lcd-section__header-left">
            <span className="lcd-section__parker-icon">🐼</span>
            <h2>Parker Settings</h2>
          </div>
          {expandedSection === 'parker' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>

        {expandedSection === 'parker' && (
          <div className="lcd-section__content">
            <div className="parker-intro">
              <div className="parker-intro__avatar">🐼</div>
              <div className="parker-intro__text">
                <h3>Parker - Your Personal Panda</h3>
                <p>PANDA: Personal Asset Networked Development Agent</p>
                <p className="parker-intro__desc">Parker guides clients through their luxury residential journey with helpful insights and status updates.</p>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Greeting Style</label>
              <select
                className="form-field__select"
                value={lcdData?.parker?.greetingStyle || 'professional'}
                onChange={(e) => handleParkerChange('greetingStyle', e.target.value)}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-field__label">Custom Welcome Message</label>
              <textarea
                className="form-field__textarea"
                value={lcdData?.parker?.customWelcome || ''}
                onChange={(e) => handleParkerChange('customWelcome', e.target.value)}
                placeholder="Welcome to your LuXeBrief portal! I'm Parker, and I'll be your guide through this exciting journey..."
                rows={4}
              />
              <p className="form-field__help">Leave blank to use the default welcome message</p>
            </div>

            <button className="btn btn--secondary">
              <ExternalLink size={16} />
              Preview Client Portal
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default LCDModule;
