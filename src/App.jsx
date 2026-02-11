import React, { useState } from 'react';
import {
  Home, Users, Search, Settings, Menu, X,
  ChevronRight, Building2, ClipboardCheck, FileText, Map, MapPin, DollarSign, Monitor, LogOut
} from 'lucide-react';

// Import modules
import Dashboard from './components/Dashboard';
import KYCModule from './components/KYC/KYCModule';
import KYSModule from './components/KYS/KYSModule';
import MVPModule from './components/MVP/MVPModule';
import FYIModule from './components/FYI/FYIModule';
import KYMModule from './components/KYM/KYMModule';
import VMXModule from './components/VMX/VMXModule';
import LCDModule from './components/LCD/LCDModule';
import SettingsModule from './components/Settings/SettingsModule';
import LoginPage from './components/LoginPage';

// Import context providers
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Error Boundary — catches runtime errors and displays them instead of white screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff5f5', minHeight: '50vh' }}>
          <h2 style={{ color: '#c53030', marginBottom: '1rem' }}>⚠ Module Error</h2>
          <p style={{ color: '#742a2a', marginBottom: '0.5rem' }}>
            <strong>{this.state.error?.toString()}</strong>
          </p>
          <pre style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'pre-wrap', maxHeight: '300px', overflow: 'auto' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Module color mapping (SOLID backgrounds - Soft Pillow palette)
const moduleColors = {
  dashboard: { bg: '#1e3a5f', text: '#ffffff', accent: '#c9a227' },             // Navy (brand primary) - KEEP
  kyc: { bg: '#315098', text: '#ffffff', accent: '#315098' },                   // Deep Blue (Soft Pillow 1)
  kys: { bg: '#C4A484', text: '#1a1a1a', accent: '#C4A484' },                   // Copper (Site Assessment)
  fyi: { bg: '#8CA8BE', text: '#1a1a1a', accent: '#8CA8BE' },                   // Steel Blue (Soft Pillow 2)
  mvp: { bg: '#AFBDB0', text: '#1a1a1a', accent: '#AFBDB0' },                   // Sage Green (Soft Pillow 3)
  kym: { bg: '#E4C0BE', text: '#1a1a1a', accent: '#E4C0BE' },                   // Dusty Rose (Soft Pillow 4)
  vmx: { bg: '#FBD0E0', text: '#1a1a1a', accent: '#FBD0E0' },                   // Light Pink (Soft Pillow 5)
  lcd: { bg: '#1a1a1a', text: '#ffffff', accent: '#c9a227' },                   // Black/Gold (PANDA branding)
  settings: { bg: '#374151', text: '#ffffff', accent: '#9ca3af' },              // Gray (utility) - KEEP
};

const AppContent = () => {
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();

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

  // Module order: Dashboard, KYC, FYI, MVP, KYM, KYS, VMX, Settings
  // KYS after KYM because site assessment needs validated program AND market context
  // VMX after KYS because cost estimation uses program (FYI) + site (KYS) data
  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Progress' },
    { id: 'kyc', label: 'KYC', icon: Users, description: 'Know Your Client' },
    { id: 'fyi', label: 'FYI', icon: Search, description: 'Find Your Inspiration' },
    { id: 'mvp', label: 'MVP', icon: ClipboardCheck, description: 'Mansion Validation' },
    { id: 'kym', label: 'KYM', icon: Map, description: 'Know Your Market' },
    { id: 'kys', label: 'KYS', icon: MapPin, description: 'Know Your Site' },
    { id: 'vmx', label: 'VMX', icon: DollarSign, description: 'Vision Matrix' },
    { id: 'lcd', label: 'LCD', icon: Monitor, description: 'LuXeBrief Portal' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'App Configuration' },
  ];

  // Modules that have documentation
  const modulesWithDocs = ['dashboard', 'kyc', 'fyi', 'mvp', 'kym', 'kys', 'vmx'];

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
      case 'vmx':
        return <VMXModule showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
      case 'lcd':
        return <LCDModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard onNavigate={setActiveModule} showDocs={showDocs} onCloseDocs={() => setShowDocs(false)} />;
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#1e3a5f', color: '#ffffff',
        fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '0.875rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Building2 size={40} style={{ marginBottom: '12px', opacity: 0.7 }} />
          <div>Loading…</div>
        </div>
      </div>
    );
  }

  // Login gate
  if (!isAuthenticated) {
    return <LoginPage />;
  }

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
            <div className="sidebar__user-bar">
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{user?.display_name || user?.username}</span>
                <span className="sidebar__user-role">{user?.role}</span>
              </div>
              <button
                className="sidebar__logout-btn"
                onClick={logout}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
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
          <ErrorBoundary key={activeModule}>
            {renderModule()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
