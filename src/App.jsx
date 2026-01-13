import React, { useState } from 'react';
import {
  Home, Users, Search, Settings, Menu, X,
  ChevronRight, Building2, ClipboardCheck, FileText, Map, MapPin
} from 'lucide-react';

// Import modules
import Dashboard from './components/Dashboard';
import KYCModule from './components/KYC/KYCModule';
import KYSModule from './components/KYS/KYSModule';
import MVPModule from './components/MVP/MVPModule';
import FYIModule from './components/FYI/FYIModule';
import KYMModule from './components/KYM/KYMModule';

// Import context provider
import { AppProvider, useAppContext } from './contexts/AppContext';

// Module color mapping (SOLID backgrounds - Soft Pillow palette)
const moduleColors = {
  dashboard: { bg: '#1e3a5f', text: '#ffffff', accent: '#c9a227' },             // Navy (brand primary) - KEEP
  kyc: { bg: '#315098', text: '#ffffff', accent: '#315098' },                   // Deep Blue (Soft Pillow 1)
  kys: { bg: '#C4A484', text: '#1a1a1a', accent: '#C4A484' },                   // Copper (Site Assessment)
  fyi: { bg: '#8CA8BE', text: '#1a1a1a', accent: '#8CA8BE' },                   // Steel Blue (Soft Pillow 2)
  mvp: { bg: '#AFBDB0', text: '#1a1a1a', accent: '#AFBDB0' },                   // Sage Green (Soft Pillow 3)
  kym: { bg: '#E4C0BE', text: '#1a1a1a', accent: '#E4C0BE' },                   // Dusty Rose (Soft Pillow 4)
  vmx: { bg: '#FBD0E0', text: '#1a1a1a', accent: '#FBD0E0' },                   // Light Pink (Soft Pillow 5)
  settings: { bg: '#374151', text: '#ffffff', accent: '#9ca3af' },              // Gray (utility) - KEEP
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
  // Persist activeModule to localStorage so it survives page refresh
  const [activeModule, setActiveModule] = useState(() => {
    try {
      const saved = localStorage.getItem('n4s_active_module');
      return saved || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  const { clientData, kycData } = useAppContext();

  // Save activeModule to localStorage when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('n4s_active_module', activeModule);
    } catch (e) {
      console.warn('Failed to save active module:', e);
    }
  }, [activeModule]);

  // Close docs when switching modules
  React.useEffect(() => {
    setShowDocs(false);
  }, [activeModule]);

  // Module order: Dashboard, KYC, FYI, MVP, KYM, KYS, Settings
  // KYS after KYM because site assessment needs validated program AND market context
  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Progress' },
    { id: 'kyc', label: 'KYC', icon: Users, description: 'Know Your Client' },
    { id: 'fyi', label: 'FYI', icon: Search, description: 'Find Your Inspiration' },
    { id: 'mvp', label: 'MVP', icon: ClipboardCheck, description: 'Mansion Validation' },
    { id: 'kym', label: 'KYM', icon: Map, description: 'Know Your Market' },
    { id: 'kys', label: 'KYS', icon: MapPin, description: 'Know Your Site' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'App Configuration' },
  ];

  // Modules that have documentation
  const modulesWithDocs = ['dashboard', 'kyc', 'fyi', 'mvp', 'kym', 'kys'];

  const renderModule = () => {
    switch (activeModule) {
      case 'kyc':
        return <KYCModule showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
      case 'kys':
        return <KYSModule showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
      case 'mvp':
        return <MVPModule onNavigate={setActiveModule} showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
      case 'fyi':
        return <FYIModule showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
      case 'kym':
        return <KYMModule showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard onNavigate={setActiveModule} showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
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
            background: moduleColors[activeModule]?.bg || '#1e3a5f',
            borderBottom: moduleColors[activeModule]?.accent 
              ? `2px solid ${moduleColors[activeModule].accent}` 
              : '1px solid var(--gray-200)',
            '--header-text-color': moduleColors[activeModule]?.text || '#ffffff'
          }}
        >
          <div className="main-header__breadcrumb">
            <span 
              className="main-header__module"
              style={{ color: moduleColors[activeModule]?.text || '#ffffff' }}
            >
              {modules.find(m => m.id === activeModule)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="main-header__actions">
            {modulesWithDocs.includes(activeModule) && (
              <button
                className="main-header__docs-btn"
                onClick={() => setShowDocs(true)}
                title="View Documentation"
                style={{ 
                  color: moduleColors[activeModule]?.text || '#ffffff',
                  borderColor: moduleColors[activeModule]?.text === '#1a1a1a' 
                    ? 'rgba(0, 0, 0, 0.2)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  background: moduleColors[activeModule]?.text === '#1a1a1a'
                    ? 'rgba(0, 0, 0, 0.1)'
                    : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <FileText size={16} />
                <span>Documentation</span>
              </button>
            )}
            <button
              className="main-header__settings-btn"
              title="Settings"
              onClick={() => setActiveModule('settings')}
              style={{ 
                color: moduleColors[activeModule]?.text || '#ffffff',
                borderColor: moduleColors[activeModule]?.text === '#1a1a1a' 
                  ? 'rgba(0, 0, 0, 0.2)' 
                  : 'rgba(255, 255, 255, 0.2)',
                background: moduleColors[activeModule]?.text === '#1a1a1a'
                  ? 'rgba(0, 0, 0, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <Settings size={20} />
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

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
