import React from 'react';
import { 
  Users, Search, CheckCircle2, AlertCircle, Clock, 
  ArrowRight, Building2, Palette, GitCompare
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const Dashboard = ({ onNavigate }) => {
  const { clientData, kycData, fyiData, calculateCompleteness } = useAppContext();
  
  const kycProgress = calculateCompleteness('principal');
  const hasSecondary = kycData.secondary.portfolioContext.secondaryName !== '';
  const secondaryProgress = hasSecondary ? calculateCompleteness('secondary') : 0;

  const modules = [
    {
      id: 'kyc',
      title: 'KYC Module',
      subtitle: 'Know Your Client',
      description: '9-section client profile with multi-stakeholder intake and governance framework',
      icon: Users,
      progress: kycProgress,
      status: kycProgress === 0 ? 'not-started' : kycProgress < 100 ? 'in-progress' : 'complete',
      color: 'blue',
    },
    {
      id: 'fyi',
      title: 'FYI Module',
      subtitle: 'Find Your Inspiration',
      description: 'Architect & Interior Designer matchmaking with compatibility assessment',
      icon: Search,
      progress: fyiData.selectedArchitect && fyiData.selectedID ? 100 : 
               fyiData.architectShortlist.length > 0 ? 50 : 0,
      status: !fyiData.selectedArchitect ? 'not-started' : 
              fyiData.selectedID ? 'complete' : 'in-progress',
      color: 'purple',
    },
  ];

  const getStatusBadge = (status) => {
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

      {/* Quick Stats */}
      {clientData.principalName && (
        <section className="dashboard__stats">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--blue">
              <Users size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{kycProgress}%</span>
              <span className="stat-card__label">KYC Complete</span>
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
                className={`module-card module-card--${module.color}`}
                onClick={() => onNavigate(module.id)}
              >
                <div className="module-card__header">
                  <div className="module-card__icon">
                    <Icon size={28} />
                  </div>
                  {getStatusBadge(module.status)}
                </div>
                
                <h3 className="module-card__title">{module.title}</h3>
                <p className="module-card__subtitle">{module.subtitle}</p>
                <p className="module-card__description">{module.description}</p>
                
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
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Overview */}
      <section className="dashboard__workflow">
        <h2 className="dashboard__section-title">N4S Methodology</h2>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="workflow-step__number">1</div>
            <div className="workflow-step__content">
              <h4>KYC: Know Your Client</h4>
              <p>Multi-stakeholder preference capture with governance framework</p>
            </div>
          </div>
          <div className="workflow-step__connector" />
          <div className="workflow-step">
            <div className="workflow-step__number">2</div>
            <div className="workflow-step__content">
              <h4>FYI: Find Your Inspiration</h4>
              <p>Three-dimensional matching: Client ↔ Architect ↔ Interior Designer</p>
            </div>
          </div>
          <div className="workflow-step__connector" />
          <div className="workflow-step">
            <div className="workflow-step__number">3</div>
            <div className="workflow-step__content">
              <h4>KYM: Know Your Market</h4>
              <p>Site-Vision assessment and market alignment (Coming Soon)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
