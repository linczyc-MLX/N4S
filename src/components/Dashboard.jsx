import React, { useState } from 'react';
import { 
  Users, Search, CheckCircle2, AlertCircle, Clock, 
  ArrowRight, Building2, Palette, GitCompare, Map, Zap,
  ClipboardCheck, Plus, ChevronDown, Trash2, FolderOpen
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

// N4S Task Matrix Configuration - Added MVP between KYC and KYM
const N4S_MODULES = {
  A: { id: 'kyc', name: 'KYC', fullName: 'Know Your Client', icon: Users, color: 'blue' },
  M: { id: 'mvp', name: 'MVP', fullName: 'Mansion Validation', icon: ClipboardCheck, color: 'green' },
  B: { id: 'kym', name: 'KYM', fullName: 'Know Your Market', icon: Map, color: 'teal' },
  C: { id: 'fyi', name: 'FYI', fullName: 'Find Your Inspiration', icon: Search, color: 'purple' },
  D: { id: 'vmx', name: 'VMX', fullName: 'Vision Matrix', icon: Zap, color: 'gold' },
};

const N4S_PHASES = {
  P1: { name: 'Ask the Right Questions', description: 'Discovery & Requirements' },
  P2: { name: 'Have a Story to Tell', description: 'Analysis & Synthesis' },
  P3: { name: 'Get It Done', description: 'Execution & Delivery' },
};

const Dashboard = ({ onNavigate }) => {
  const { 
    clientData, updateClientData, kycData, fyiData, calculateCompleteness,
    projects, activeProjectId, createProject, switchProject, deleteProject
  } = useAppContext();
  
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  
  const kycProgress = calculateCompleteness('principal');
  const principalData = kycData.principal.portfolioContext;
  const principalName = principalData.principalFirstName 
    ? `${principalData.principalFirstName} ${principalData.principalLastName || ''}`.trim()
    : '';
  const hasSecondary = kycData.secondary.portfolioContext.secondaryFirstName !== '';
  const secondaryProgress = hasSecondary ? calculateCompleteness('secondary') : 0;

  // MVP progress based on KYC completion and project parameters
  const mvpProgress = kycData.principal.projectParameters.targetGSF && 
                      kycData.principal.projectParameters.bedroomCount ? 
                      Math.min(100, kycProgress + 20) : 0;

  // Module status calculation
  const getModuleStatus = (moduleCode) => {
    switch (moduleCode) {
      case 'A': // KYC
        return kycProgress === 0 ? 'not-started' : kycProgress < 100 ? 'in-progress' : 'complete';
      case 'M': // MVP
        if (kycProgress < 50) return 'locked';
        return mvpProgress === 0 ? 'not-started' : mvpProgress < 100 ? 'in-progress' : 'complete';
      case 'B': // KYM
        return 'not-started'; // Coming soon
      case 'C': // FYI
        return fyiData.selectedArchitect && fyiData.selectedID ? 'complete' : 
               fyiData.architectShortlist.length > 0 ? 'in-progress' : 'not-started';
      case 'D': // VMX
        return 'not-started'; // Coming soon
      default:
        return 'not-started';
    }
  };

  // Handle creating new project
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProjectInput(false);
      setShowProjectDropdown(false);
    }
  };

  // Handle project switch
  const handleSwitchProject = (projectId) => {
    switchProject(projectId);
    setShowProjectDropdown(false);
  };

  const getPhaseStatus = (phaseCode, moduleCode) => {
    // Simplified status for now - can be expanded with actual task tracking
    const moduleStatus = getModuleStatus(moduleCode);
    if (moduleStatus === 'not-started') return 'pending';
    if (moduleStatus === 'locked') return 'locked';
    if (moduleStatus === 'complete') return 'complete';
    
    // For in-progress modules, determine phase status based on module
    if (moduleCode === 'A') { // KYC
      if (phaseCode === 'P1') return kycProgress > 30 ? 'complete' : 'in-progress';
      if (phaseCode === 'P2') return kycProgress > 60 ? 'in-progress' : 'pending';
      if (phaseCode === 'P3') return kycProgress > 90 ? 'in-progress' : 'pending';
    }
    if (moduleCode === 'M') { // MVP
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

  const modules = [
    {
      code: 'A',
      id: 'kyc',
      title: 'Module A: KYC',
      subtitle: 'Know Your Client',
      description: '9-section client profile with multi-stakeholder intake and governance framework',
      icon: Users,
      progress: kycProgress,
      status: getModuleStatus('A'),
      color: 'blue',
      enabled: true,
    },
    {
      code: 'M',
      id: 'mvp',
      title: 'Module M: MVP',
      subtitle: 'Mansion Validation',
      description: 'Area program generation and validation from KYC inputs',
      icon: ClipboardCheck,
      progress: mvpProgress,
      status: getModuleStatus('M'),
      color: 'green',
      enabled: kycProgress >= 50,
      requiresKYC: true,
    },
    {
      code: 'C',
      id: 'fyi',
      title: 'Module C: FYI',
      subtitle: 'Find Your Inspiration',
      description: 'Architect & Interior Designer matchmaking with compatibility assessment',
      icon: Search,
      progress: fyiData.selectedArchitect && fyiData.selectedID ? 100 : 
               fyiData.architectShortlist.length > 0 ? 50 : 0,
      status: getModuleStatus('C'),
      color: 'purple',
      enabled: true,
    },
    {
      code: 'B',
      id: 'kym',
      title: 'Module B: KYM',
      subtitle: 'Know Your Market',
      description: 'Site-Vision assessment and market alignment',
      icon: Map,
      progress: 0,
      status: 'not-started',
      color: 'teal',
      enabled: false,
      comingSoon: true,
    },
    {
      code: 'D',
      id: 'vmx',
      title: 'Module D: VMX',
      subtitle: 'Vision Matrix',
      description: 'Project delivery and stakeholder alignment',
      icon: Zap,
      progress: 0,
      status: 'not-started',
      color: 'gold',
      enabled: false,
      comingSoon: true,
    },
  ];

  const getStatusBadge = (status, comingSoon) => {
    if (comingSoon) {
      return <span className="badge badge--neutral"><Clock size={14} /> Coming Soon</span>;
    }
    switch (status) {
      case 'complete':
        return <span className="badge badge--success"><CheckCircle2 size={14} /> Complete</span>;
      case 'in-progress':
        return <span className="badge badge--warning"><Clock size={14} /> In Progress</span>;
      default:
        return <span className="badge badge--neutral"><AlertCircle size={14} /> Not Started</span>;
    }
  };

  return (
    <div className="dashboard">
      {/* Project Selector Section */}
      <section className="dashboard__project-selector">
        <div className="project-selector">
          <div className="project-selector__current" onClick={() => setShowProjectDropdown(!showProjectDropdown)}>
            <FolderOpen size={20} className="project-selector__icon" />
            <div className="project-selector__info">
              <span className="project-selector__label">Current Project</span>
              <span className="project-selector__name">
                {clientData.projectName || 'No Project Selected'}
              </span>
            </div>
            <ChevronDown size={20} className={`project-selector__chevron ${showProjectDropdown ? 'project-selector__chevron--open' : ''}`} />
          </div>
          
          {showProjectDropdown && (
            <div className="project-dropdown">
              <div className="project-dropdown__header">
                <span>Your Projects ({projects.length})</span>
              </div>
              
              <div className="project-dropdown__list">
                {projects.length === 0 ? (
                  <div className="project-dropdown__empty">
                    No projects yet. Create your first project below.
                  </div>
                ) : (
                  projects.map(project => (
                    <div 
                      key={project.id}
                      className={`project-dropdown__item ${project.id === activeProjectId ? 'project-dropdown__item--active' : ''}`}
                      onClick={() => handleSwitchProject(project.id)}
                    >
                      <div className="project-dropdown__item-info">
                        <span className="project-dropdown__item-name">{project.name}</span>
                        <span className="project-dropdown__item-date">
                          {new Date(project.lastUpdated || project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {project.id === activeProjectId && (
                        <CheckCircle2 size={16} className="project-dropdown__item-check" />
                      )}
                      {projects.length > 1 && project.id !== activeProjectId && (
                        <button 
                          className="project-dropdown__item-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                              deleteProject(project.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="project-dropdown__footer">
                {showNewProjectInput ? (
                  <div className="project-dropdown__new-input">
                    <input
                      type="text"
                      placeholder="Project name..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                      autoFocus
                    />
                    <button className="btn btn--primary btn--sm" onClick={handleCreateProject}>
                      Create
                    </button>
                    <button 
                      className="btn btn--ghost btn--sm" 
                      onClick={() => {
                        setShowNewProjectInput(false);
                        setNewProjectName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    className="project-dropdown__new-btn"
                    onClick={() => setShowNewProjectInput(true)}
                  >
                    <Plus size={16} /> New Project
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {activeProjectId && (
          <div className="project-name-edit">
            <input
              type="text"
              className="project-name-edit__input"
              value={clientData.projectName || ''}
              onChange={(e) => updateClientData({ projectName: e.target.value })}
              placeholder="Enter project name..."
            />
            {clientData.lastUpdated && (
              <span className="project-name-edit__saved">
                Saved {new Date(clientData.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </section>

      {/* Welcome Section */}
      <section className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h1 className="dashboard__title">
            {principalName 
              ? `Welcome back` 
              : 'Welcome to N4S'}
          </h1>
          <p className="dashboard__subtitle">
            {clientData.projectName 
              ? `Managing: ${clientData.projectName}`
              : 'Ultra-Luxury Residential Advisory Platform'}
          </p>
        </div>
        {!activeProjectId ? (
          <button 
            className="btn btn--primary"
            onClick={() => {
              createProject('New Project');
              onNavigate('kyc');
            }}
          >
            Start New Project <ArrowRight size={18} />
          </button>
        ) : !principalName && (
          <button 
            className="btn btn--primary"
            onClick={() => onNavigate('kyc')}
          >
            Continue KYC <ArrowRight size={18} />
          </button>
        )}
      </section>

      {/* Task Matrix */}
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
                  <div 
                    key={taskCode}
                    className={`task-cell ${getStatusClass(status)}`}
                    title={`${taskCode}: ${phase.name} - ${module.fullName}`}
                  >
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
      {clientData.principalName && (
        <section className="dashboard__stats">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--blue">
              <Users size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{kycProgress}%</span>
              <span className="stat-card__label">Module A Complete</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--purple">
              <Building2 size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{fyiData.architectShortlist.length}</span>
              <span className="stat-card__label">Architects Shortlisted</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--teal">
              <Palette size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{fyiData.idShortlist.length}</span>
              <span className="stat-card__label">IDs Shortlisted</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--gold">
              <GitCompare size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">
                {Object.keys(fyiData.compatibilityMatrix).length}
              </span>
              <span className="stat-card__label">Pairings Assessed</span>
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
              <div 
                key={module.id}
                className={`module-card module-card--${module.color} ${module.comingSoon ? 'module-card--disabled' : ''}`}
                onClick={() => module.enabled && onNavigate(module.id)}
              >
                <div className="module-card__header">
                  <div className="module-card__icon">
                    <Icon size={28} />
                  </div>
                  {getStatusBadge(module.status, module.comingSoon)}
                </div>
                
                <h3 className="module-card__title">{module.title}</h3>
                <p className="module-card__subtitle">{module.subtitle}</p>
                <p className="module-card__description">{module.description}</p>
                
                {!module.comingSoon && (
                  <>
                    <div className="module-card__progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-bar__fill"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                      <span className="progress-bar__label">{module.progress}% Complete</span>
                    </div>
                    
                    <button className="module-card__cta">
                      {module.status === 'not-started' ? 'Begin' : 'Continue'}
                      <ArrowRight size={16} />
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
              {index < Object.entries(N4S_PHASES).length - 1 && (
                <div className="workflow-phase__connector" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
