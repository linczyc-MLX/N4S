import React, { useState, useCallback } from 'react';
import { 
  Home, Users, Search, GitCompare, Settings, Menu, X,
  ChevronRight, Building2, Palette, CheckCircle2
} from 'lucide-react';

// Import modules
import Dashboard from './components/Dashboard';
import KYCModule from './components/KYC/KYCModule';
import FYIModule from './components/FYI/FYIModule';

// Import context provider
import { AppProvider, useAppContext } from './contexts/AppContext';

const AppContent = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { clientData, updateClientData } = useAppContext();

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Progress' },
    { id: 'kyc', label: 'KYC', icon: Users, description: 'Know Your Client' },
    { id: 'fyi', label: 'FYI', icon: Search, description: 'Find Your Inspiration' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'kyc':
        return <KYCModule />;
      case 'fyi':
        return <FYIModule />;
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
              {clientData.principalName ? (
                <>
                  <span className="sidebar__client-name">{clientData.principalName}</span>
                  <span className="sidebar__client-project">{clientData.projectName || 'New Project'}</span>
                </>
              ) : (
                <span className="sidebar__client-placeholder">No client loaded</span>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="main-header__breadcrumb">
            <span className="main-header__module">
              {modules.find(m => m.id === activeModule)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="main-header__actions">
            <button className="btn btn--ghost" title="Settings">
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
