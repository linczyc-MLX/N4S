import React, { useState } from 'react';
import { 
  Building2, Palette, GitCompare, Search, Filter, 
  ChevronRight, Star, MapPin, DollarSign, Users,
  CheckCircle2, AlertTriangle, XCircle
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const FYIModule = () => {
  const [activeTab, setActiveTab] = useState('architects');
  const { fyiData, updateFYIData, kycData } = useAppContext();

  const tabs = [
    { id: 'architects', label: 'Architect Matching', icon: Building2, color: 'blue' },
    { id: 'designers', label: 'ID Matching', icon: Palette, color: 'purple' },
    { id: 'compatibility', label: 'Team Compatibility', icon: GitCompare, color: 'gold' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'architects':
        return <ArchitectMatchingTab />;
      case 'designers':
        return <DesignerMatchingTab />;
      case 'compatibility':
        return <CompatibilityTab />;
      default:
        return null;
    }
  };

  return (
    <div className="fyi-module">
      {/* Header */}
      <div className="fyi-module__header">
        <h2 className="fyi-module__title">Find Your Inspiration</h2>
        <p className="fyi-module__subtitle">
          Three-dimensional matching: Client ↔ Architect ↔ Interior Designer
        </p>
      </div>

      {/* Tabs */}
      <div className="fyi-module__tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`fyi-tab fyi-tab--${tab.color} ${isActive ? 'fyi-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="fyi-module__content">
        {renderTab()}
      </div>
    </div>
  );
};

// Architect Matching Tab
const ArchitectMatchingTab = () => {
  const { fyiData, updateFYIData, kycData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    style: [],
    location: '',
    budgetMin: '',
  });

  // Sample architect data (would come from database)
  const sampleArchitects = [
    {
      id: 1,
      name: 'Studio Collective',
      location: 'Los Angeles, USA',
      styleMatch: 92,
      scaleMatch: 88,
      budgetMatch: 95,
      overallScore: 91,
      styles: ['Contemporary', 'Minimalist'],
      typicalBudget: '$15M - $50M',
      mediaPresence: 3,
      status: 'green',
    },
    {
      id: 2,
      name: 'Horizon Architecture',
      location: 'Dubai, UAE',
      styleMatch: 88,
      scaleMatch: 95,
      budgetMatch: 90,
      overallScore: 89,
      styles: ['Desert Modern', 'Contemporary'],
      typicalBudget: '$20M - $100M',
      mediaPresence: 4,
      status: 'green',
    },
    {
      id: 3,
      name: 'Classic Design Partners',
      location: 'London, UK',
      styleMatch: 75,
      scaleMatch: 85,
      budgetMatch: 88,
      overallScore: 78,
      styles: ['Traditional', 'European Classical'],
      typicalBudget: '$10M - $40M',
      mediaPresence: 2,
      status: 'amber',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="status-icon--green" size={20} />;
      case 'amber': return <AlertTriangle className="status-icon--amber" size={20} />;
      case 'red': return <XCircle className="status-icon--red" size={20} />;
      default: return null;
    }
  };

  const addToShortlist = (architect) => {
    if (!fyiData.architectShortlist.find(a => a.id === architect.id)) {
      updateFYIData({
        architectShortlist: [...fyiData.architectShortlist, architect]
      });
    }
  };

  return (
    <div className="matching-tab">
      <div className="matching-tab__intro">
        <h3>Step 1: Find Your Architect</h3>
        <p>Based on your KYC profile, we've scored architects across 7 categories. Select up to 5 for your shortlist.</p>
      </div>

      {/* Search & Filters */}
      <div className="matching-tab__controls">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            placeholder="Search architects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn--secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Shortlist Summary */}
      {fyiData.architectShortlist.length > 0 && (
        <div className="shortlist-summary">
          <span className="shortlist-summary__count">
            {fyiData.architectShortlist.length}/5 architects shortlisted
          </span>
          <div className="shortlist-summary__chips">
            {fyiData.architectShortlist.map(arch => (
              <span key={arch.id} className="shortlist-chip">
                {arch.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="matching-results">
        {sampleArchitects.map(architect => (
          <div key={architect.id} className="match-card">
            <div className="match-card__header">
              <div className="match-card__status">
                {getStatusIcon(architect.status)}
                <span className="match-card__score">{architect.overallScore}% Match</span>
              </div>
              <Building2 className="match-card__type-icon" size={24} />
            </div>

            <h4 className="match-card__name">{architect.name}</h4>
            <p className="match-card__location">
              <MapPin size={14} />
              {architect.location}
            </p>

            <div className="match-card__styles">
              {architect.styles.map(style => (
                <span key={style} className="style-tag">{style}</span>
              ))}
            </div>

            <div className="match-card__scores">
              <div className="score-bar">
                <span className="score-bar__label">Design DNA</span>
                <div className="score-bar__track">
                  <div className="score-bar__fill" style={{ width: `${architect.styleMatch}%` }} />
                </div>
                <span className="score-bar__value">{architect.styleMatch}%</span>
              </div>
              <div className="score-bar">
                <span className="score-bar__label">Scale & Scope</span>
                <div className="score-bar__track">
                  <div className="score-bar__fill" style={{ width: `${architect.scaleMatch}%` }} />
                </div>
                <span className="score-bar__value">{architect.scaleMatch}%</span>
              </div>
              <div className="score-bar">
                <span className="score-bar__label">Budget Caliber</span>
                <div className="score-bar__track">
                  <div className="score-bar__fill" style={{ width: `${architect.budgetMatch}%` }} />
                </div>
                <span className="score-bar__value">{architect.budgetMatch}%</span>
              </div>
            </div>

            <div className="match-card__meta">
              <span><DollarSign size={14} /> {architect.typicalBudget}</span>
              <span><Star size={14} /> Profile: {architect.mediaPresence}/5</span>
            </div>

            <button 
              className="btn btn--primary btn--full"
              onClick={() => addToShortlist(architect)}
              disabled={fyiData.architectShortlist.find(a => a.id === architect.id) || fyiData.architectShortlist.length >= 5}
            >
              {fyiData.architectShortlist.find(a => a.id === architect.id) 
                ? 'Added to Shortlist' 
                : 'Add to Shortlist'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Designer Matching Tab (similar structure)
const DesignerMatchingTab = () => {
  const { fyiData, updateFYIData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const sampleDesigners = [
    {
      id: 1,
      name: 'Atelier Moderne',
      location: 'New York, USA',
      styleMatch: 94,
      scaleMatch: 90,
      budgetMatch: 92,
      overallScore: 93,
      styles: ['Contemporary', 'Organic Modern'],
      typicalBudget: '$5M - $20M Interior',
      mediaPresence: 4,
      status: 'green',
    },
    {
      id: 2,
      name: 'Desert Interiors Co.',
      location: 'Dubai, UAE',
      styleMatch: 91,
      scaleMatch: 95,
      budgetMatch: 88,
      overallScore: 90,
      styles: ['Desert Modern', 'Minimalist'],
      typicalBudget: '$8M - $30M Interior',
      mediaPresence: 3,
      status: 'green',
    },
    {
      id: 3,
      name: 'Heritage Design Studio',
      location: 'Paris, France',
      styleMatch: 78,
      scaleMatch: 85,
      budgetMatch: 90,
      overallScore: 81,
      styles: ['Traditional', 'Art Deco'],
      typicalBudget: '$3M - $15M Interior',
      mediaPresence: 2,
      status: 'amber',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="status-icon--green" size={20} />;
      case 'amber': return <AlertTriangle className="status-icon--amber" size={20} />;
      case 'red': return <XCircle className="status-icon--red" size={20} />;
      default: return null;
    }
  };

  const addToShortlist = (designer) => {
    if (!fyiData.idShortlist.find(d => d.id === designer.id)) {
      updateFYIData({
        idShortlist: [...fyiData.idShortlist, designer]
      });
    }
  };

  return (
    <div className="matching-tab">
      <div className="matching-tab__intro">
        <h3>Step 2: Find Your Interior Designer</h3>
        <p>Based on your KYC profile, we've scored interior designers across 7 categories. Select up to 5 for your shortlist.</p>
      </div>

      {/* Search */}
      <div className="matching-tab__controls">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            placeholder="Search interior designers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn--secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Shortlist Summary */}
      {fyiData.idShortlist.length > 0 && (
        <div className="shortlist-summary shortlist-summary--purple">
          <span className="shortlist-summary__count">
            {fyiData.idShortlist.length}/5 designers shortlisted
          </span>
          <div className="shortlist-summary__chips">
            {fyiData.idShortlist.map(designer => (
              <span key={designer.id} className="shortlist-chip shortlist-chip--purple">
                {designer.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="matching-results">
        {sampleDesigners.map(designer => (
          <div key={designer.id} className="match-card match-card--purple">
            <div className="match-card__header">
              <div className="match-card__status">
                {getStatusIcon(designer.status)}
                <span className="match-card__score">{designer.overallScore}% Match</span>
              </div>
              <Palette className="match-card__type-icon" size={24} />
            </div>

            <h4 className="match-card__name">{designer.name}</h4>
            <p className="match-card__location">
              <MapPin size={14} />
              {designer.location}
            </p>

            <div className="match-card__styles">
              {designer.styles.map(style => (
                <span key={style} className="style-tag">{style}</span>
              ))}
            </div>

            <div className="match-card__scores">
              <div className="score-bar">
                <span className="score-bar__label">Design DNA</span>
                <div className="score-bar__track">
                  <div className="score-bar__fill score-bar__fill--purple" style={{ width: `${designer.styleMatch}%` }} />
                </div>
                <span className="score-bar__value">{designer.styleMatch}%</span>
              </div>
              <div className="score-bar">
                <span className="score-bar__label">Scale & Scope</span>
                <div className="score-bar__track">
                  <div className="score-bar__fill score-bar__fill--purple" style={{ width: `${designer.scaleMatch}%` }} />
                </div>
                <span className="score-bar__value">{designer.scaleMatch}%</span>
              </div>
              <div className="score-bar">
                <span className="score-bar__label">Budget Caliber</span>
                <div className="score-bar__track">
                  <div className="score-bar__fill score-bar__fill--purple" style={{ width: `${designer.budgetMatch}%` }} />
                </div>
                <span className="score-bar__value">{designer.budgetMatch}%</span>
              </div>
            </div>

            <div className="match-card__meta">
              <span><DollarSign size={14} /> {designer.typicalBudget}</span>
              <span><Star size={14} /> Profile: {designer.mediaPresence}/5</span>
            </div>

            <button 
              className="btn btn--primary btn--full"
              onClick={() => addToShortlist(designer)}
              disabled={fyiData.idShortlist.find(d => d.id === designer.id) || fyiData.idShortlist.length >= 5}
            >
              {fyiData.idShortlist.find(d => d.id === designer.id) 
                ? 'Added to Shortlist' 
                : 'Add to Shortlist'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Compatibility Tab
const CompatibilityTab = () => {
  const { fyiData } = useAppContext();

  const hasShortlists = fyiData.architectShortlist.length > 0 && fyiData.idShortlist.length > 0;

  // Sample compatibility data
  const sampleCompatibility = [
    { archId: 1, idId: 1, score: 88, status: 'green', factors: { aesthetic: 92, process: 85, ego: 90, history: 'New' } },
    { archId: 1, idId: 2, score: 72, status: 'amber', factors: { aesthetic: 78, process: 70, ego: 65, history: 'None' } },
    { archId: 2, idId: 1, score: 85, status: 'green', factors: { aesthetic: 88, process: 82, ego: 85, history: 'Proven' } },
    { archId: 2, idId: 2, score: 94, status: 'green', factors: { aesthetic: 95, process: 92, ego: 95, history: 'Proven' } },
  ];

  if (!hasShortlists) {
    return (
      <div className="matching-tab">
        <div className="compatibility-empty">
          <GitCompare size={48} />
          <h3>Build Your Shortlists First</h3>
          <p>
            Select at least one architect and one interior designer to see compatibility analysis.
          </p>
          <div className="compatibility-empty__status">
            <span className={fyiData.architectShortlist.length > 0 ? 'status--complete' : 'status--pending'}>
              Architects: {fyiData.architectShortlist.length}/5
            </span>
            <span className={fyiData.idShortlist.length > 0 ? 'status--complete' : 'status--pending'}>
              Interior Designers: {fyiData.idShortlist.length}/5
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matching-tab">
      <div className="matching-tab__intro">
        <h3>Step 3: Assess Team Compatibility</h3>
        <p>
          Not all excellent professionals work well together. This matrix shows how each Architect + Interior Designer 
          pairing scores across 8 compatibility factors.
        </p>
      </div>

      {/* Compatibility Matrix */}
      <div className="compatibility-matrix">
        <table className="matrix-table">
          <thead>
            <tr>
              <th></th>
              {fyiData.idShortlist.map(designer => (
                <th key={designer.id} className="matrix-header--designer">
                  <Palette size={16} />
                  {designer.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fyiData.architectShortlist.map(architect => (
              <tr key={architect.id}>
                <td className="matrix-header--architect">
                  <Building2 size={16} />
                  {architect.name}
                </td>
                {fyiData.idShortlist.map(designer => {
                  const compat = sampleCompatibility.find(
                    c => c.archId === architect.id && c.idId === designer.id
                  ) || { score: 75, status: 'amber', factors: {} };
                  
                  return (
                    <td key={`${architect.id}-${designer.id}`} className="matrix-cell">
                      <div className={`matrix-cell__score matrix-cell__score--${compat.status}`}>
                        {compat.score}
                        {compat.factors.history === 'Proven' && <span className="proven-badge">P</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="compatibility-legend">
        <div className="legend-item">
          <span className="legend-color legend-color--green"></span>
          <span>≥75: Recommended</span>
        </div>
        <div className="legend-item">
          <span className="legend-color legend-color--amber"></span>
          <span>60-74: Workable</span>
        </div>
        <div className="legend-item">
          <span className="legend-color legend-color--red"></span>
          <span>&lt;60: Not Recommended</span>
        </div>
        <div className="legend-item">
          <span className="proven-badge">P</span>
          <span>Proven Partnership</span>
        </div>
      </div>

      {/* Warning */}
      <div className="compatibility-warning">
        <AlertTriangle size={20} />
        <div>
          <strong>Starchitect + Star ID Alert</strong>
          <p>High-profile pairings without collaboration history may have ego collision risk.</p>
        </div>
      </div>
    </div>
  );
};

export default FYIModule;
