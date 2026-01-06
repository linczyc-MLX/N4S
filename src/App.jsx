import React, { useState, useCallback } from 'react';
import { 
  Home, Users, Search, GitCompare, Settings, Menu, X,
  ChevronRight, Building2, Palette, CheckCircle2, ClipboardCheck
} from 'lucide-react';

// Import modules
import Dashboard from './components/Dashboard';
import KYCModule from './components/KYC/KYCModule';
import MVPModule from './components/MVP/MVPModule';
import FYIModule from './components/FYI/FYIModule';

// Import context provider
import { AppProvider, useAppContext } from './contexts/AppContext';

// Module color mapping (matches Task Matrix)
// A=KYC (Navy), C=FYI (Teal), M=MVP (Green), B=KYM (Purple), D=VMX (Gold)
const moduleColors = {
  dashboard: { bg: 'transparent', text: 'inherit' },
  kyc: { bg: 'rgba(26, 54, 93, 0.1)', text: '#1a365d', accent: '#1a365d' },      // Navy - A
  fyi: { bg: 'rgba(49, 151, 149, 0.15)', text: '#285e61', accent: '#319795' },   // Teal - C
  mvp: { bg: 'rgba(72, 187, 120, 0.15)', text: '#276749', accent: '#48bb78' },   // Green - M
  kym: { bg: 'rgba(128, 90, 213, 0.1)', text: '#553c9a', accent: '#805ad5' },    // Purple - B
  vmx: { bg: 'rgba(201, 169, 98, 0.15)', text: '#8b7355', accent: '#c9a962' },   // Gold - D
  settings: { bg: 'transparent', text: 'inherit' },
};

// Simple Settings Panel component
const SettingsPanel = () => (
  <div className="settings-panel">
    <div className="settings-panel__header">
      <h2>Settings</h2>
      <p>Application settings and configuration</p>
    </div>
    <div className="settings-panel__content">
      <div className="settings-section">
        <h3>Project Settings</h3>
        <p className="settings-section__description">
          Configure project defaults and preferences.
        </p>
        <div className="settings-placeholder">
          Settings options coming soon...
        </div>
      </div>
      <div className="settings-section">
        <h3>Export & Data</h3>
        <p className="settings-section__description">
          Export project data or manage backups.
        </p>
        <div className="settings-placeholder">
          Export options coming soon...
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { clientData, kycData } = useAppContext();

  // Module order: Dashboard, KYC, FYI (before MVP), MVP, Settings
  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Progress' },
    { id: 'kyc', label: 'KYC', icon: Users, description: 'Know Your Client' },
    { id: 'fyi', label: 'FYI', icon: Search, description: 'Find Your Inspiration' },
    { id: 'mvp', label: 'MVP', icon: ClipboardCheck, description: 'Mansion Validation' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'App Configuration' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'kyc':
        return <KYCModule />;
      case 'mvp':
        return <MVPModule />;
      case 'fyi':
        return <FYIModule />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <Building2 className="sidebar__logo-icon" />
            {sidebarOpen && <span className="sidebar__logo-text">N4S</span>}
          </div>
          <button 
            className="sidebar__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar__nav">
          {modules.map(module => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={() => setActiveModule(module.id)}
                title={!sidebarOpen ? module.label : undefined}
              >
                <Icon className="sidebar__nav-icon" />
                {sidebarOpen && (
                  <div className="sidebar__nav-content">
                    <span className="sidebar__nav-label">{module.label}</span>
                    <span className="sidebar__nav-description">{module.description}</span>
                  </div>
                )}
                {isActive && sidebarOpen && <ChevronRight className="sidebar__nav-arrow" />}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="sidebar__footer">
            <div className="sidebar__client-info">
              {(() => {
                const firstName = kycData?.principal?.portfolioContext?.principalFirstName || '';
                const lastName = kycData?.principal?.portfolioContext?.principalLastName || '';
                const clientName = `${firstName} ${lastName}`.trim();
                const projectName = kycData?.principal?.projectParameters?.projectName || clientData?.projectName || '';

                if (clientName || projectName) {
                  return (
                    <>
                      <span className="sidebar__client-name">{clientName || 'Client'}</span>
                      <span className="sidebar__client-project">{projectName || 'New Project'}</span>
                    </>
                  );
                }
                return <span className="sidebar__client-placeholder">No client loaded</span>;
              })()}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header 
          className="main-header"
          style={{
            background: moduleColors[activeModule]?.bg || 'transparent',
            borderBottom: moduleColors[activeModule]?.accent 
              ? `2px solid ${moduleColors[activeModule].accent}` 
              : '1px solid var(--gray-200)'
          }}
        >
          <h1 
            className="main-header__title"
            style={{ color: moduleColors[activeModule]?.text || 'inherit' }}
          >
            {modules.find(m => m.id === activeModule)?.label}
          </h1>
          <div className="main-header__actions">
            <button className="header-btn" title="Settings">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <div className="main-body">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
