import React from 'react';
import { 
  Users, Search, CheckCircle2, AlertCircle, Clock, 
  ArrowRight, Building2, Palette, GitCompare, Map, Zap
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

// N4S Task Matrix Configuration
const N4S_MODULES = {
  A: { id: 'kyc', name: 'KYC', fullName: 'Know Your Client', icon: Users, color: 'blue' },
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
  const { clientData, kycData, fyiData, calculateCompleteness } = useAppContext();
  
  const kycProgress = calculateCompleteness('principal');
  const hasSecondary = kycData.secondary.portfolioContext.secondaryName !== '';
  const secondaryProgress = hasSecondary ? calculateCompleteness('secondary') : 0;

  // Module status calculation
  const getModuleStatus = (moduleCode) => {
    switch (moduleCode) {
      case 'A': // KYC
        return kycProgress === 0 ? 'not-started' : kycProgress < 100 ? 'in-progress' : 'complete';
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

  const getPhaseStatus = (phaseCode, moduleCode) => {
    // Simplified status for now - can be expanded with actual task tracking
    const moduleStatus = getModuleStatus(moduleCode);
    if (moduleStatus === 'not-started') return 'pending';
    if (moduleStatus === 'complete') return 'complete';
    
    // For in-progress modules, determine phase status based on module
    if (moduleCode === 'A') { // KYC
      if (phaseCode === 'P1') return kycProgress > 30 ? 'complete' : 'in-progress';
      if (phaseCode === 'P2') return kycProgress > 60 ? 'in-progress' : 'pending';
      if (phaseCode === 'P3') return kycProgress > 90 ? 'in-progress' : 'pending';
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
      {/* Welcome Section */}
      <section className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h1 className="dashboard__title">
            {clientData.principalName 
              ? `Welcome back` 
              : 'Welcome to N4S'}
          </h1>
          <p className="dashboard__subtitle">
            {clientData.projectName 
              ? `Managing: ${clientData.projectName}`
              : 'Ultra-Luxury Residential Advisory Platform'}
          </p>
        </div>
        {!clientData.principalName && (
          <button 
            className="btn btn--primary"
            onClick={() => onNavigate('kyc')}
          >
            Start New Client <ArrowRight size={18} />
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
