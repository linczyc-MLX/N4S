/**
 * KYSModule.jsx - Know Your Site
 * 
 * Site-Vision Compatibility Assessment module that evaluates potential sites
 * against client vision BEFORE capital commitment.
 * 
 * Features:
 * 1. Site List - Dashboard of all evaluated sites
 * 2. Site Assessment - 7-category scoring interface
 * 3. Comparison View - Side-by-side multi-site comparison
 * 4. Report Export - PDF dashboard generation
 * 
 * "You make your money on the buy" — Arvin
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  MapPin, Plus, Trash2, Edit2, Eye, Copy, ArrowLeft, ChevronRight, ChevronDown,
  Home, Sun, Shield, Users, TrendingUp, Target, FileText, Download, RefreshCw,
  AlertTriangle, CheckCircle2, XCircle, HelpCircle, BarChart2, Grid, List,
  DollarSign, Maximize, Building2, Info, Save
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import KYSDocumentation from './KYSDocumentation';
import {
  CATEGORIES, DEAL_BREAKERS, calculateOverallAssessment, createEmptySiteAssessment,
  getTrafficLight, getTrafficLightColor, compareSites, getAllFactors
} from './KYSScoringEngine';
import './KYSModule.css';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  copper: '#C4A484',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
};

// Category icons
const CATEGORY_ICONS = {
  physicalCapacity: Maximize,
  viewsAspect: Sun,
  privacyBoundaries: Shield,
  adjacenciesContext: Users,
  marketAlignment: TrendingUp,
  visionCompatibility: Target,
  regulatoryPractical: FileText,
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const TrafficLightBadge = ({ light, size = 'medium', showLabel = false }) => {
  const color = getTrafficLightColor(light);
  const sizes = {
    small: 12,
    medium: 16,
    large: 24,
  };
  const labels = {
    green: 'Proceed',
    amber: 'Caution',
    red: 'Do Not Proceed',
  };

  return (
    <div className={`kys-traffic-light kys-traffic-light--${size}`} style={{ color }}>
      <span
        className="kys-traffic-light__dot"
        style={{ background: color, width: sizes[size], height: sizes[size] }}
      />
      {showLabel && light && (
        <span className="kys-traffic-light__label">{labels[light]}</span>
      )}
    </div>
  );
};

const ScoreSlider = ({ value, onChange, disabled }) => {
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return COLORS.border;
    if (score >= 4) return COLORS.success;
    if (score >= 2.5) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <div className="kys-score-slider">
      <div className="kys-score-slider__labels">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="0.5"
        value={value || 3}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="kys-score-slider__input"
        style={{
          '--slider-color': getScoreColor(value),
          '--slider-pct': value ? ((value - 1) / 4) * 100 : 50,
        }}
      />
      <div className="kys-score-slider__value" style={{ color: getScoreColor(value) }}>
        {value !== null ? value.toFixed(1) : '—'}
      </div>
    </div>
  );
};

const SiteCard = ({ site, assessment, onSelect, onEdit, onDelete, onDuplicate, isActive }) => {
  const formatPrice = (value) => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const { basicInfo } = site;

  return (
    <div className={`kys-site-card ${isActive ? 'kys-site-card--active' : ''}`}>
      <div className="kys-site-card__header">
        <div className="kys-site-card__title-row">
          <h3 className="kys-site-card__title">{basicInfo.name || 'Unnamed Site'}</h3>
          <TrafficLightBadge light={assessment?.trafficLight} size="medium" />
        </div>
        <p className="kys-site-card__address">
          {basicInfo.address ? `${basicInfo.address}, ` : ''}{basicInfo.city}, {basicInfo.state}
        </p>
      </div>

      <div className="kys-site-card__stats">
        <div className="kys-site-card__stat">
          <DollarSign size={14} />
          <span>{formatPrice(basicInfo.askingPrice)}</span>
        </div>
        <div className="kys-site-card__stat">
          <Maximize size={14} />
          <span>{basicInfo.lotSizeAcres ? `${basicInfo.lotSizeAcres} ac` : '—'}</span>
        </div>
        <div className="kys-site-card__stat">
          <span className="kys-site-card__score">
            Score: {assessment?.overallScore?.toFixed(1) || '—'}
          </span>
        </div>
      </div>

      {assessment?.triggeredDealBreakers?.length > 0 && (
        <div className="kys-site-card__dealbreakers">
          <AlertTriangle size={14} />
          <span>{assessment.triggeredDealBreakers.length} Deal-Breaker(s)</span>
        </div>
      )}

      <div className="kys-site-card__progress">
        <div className="kys-site-card__progress-label">
          Assessment: {assessment?.completionPct || 0}% complete
        </div>
        <div className="kys-site-card__progress-bar">
          <div
            className="kys-site-card__progress-fill"
            style={{ width: `${assessment?.completionPct || 0}%` }}
          />
        </div>
      </div>

      <div className="kys-site-card__actions">
        <button className="kys-btn kys-btn--primary" onClick={() => onSelect(site)}>
          <Eye size={14} />
          Assess
        </button>
        <button className="kys-btn kys-btn--ghost" onClick={() => onDuplicate(site)}>
          <Copy size={14} />
        </button>
        <button className="kys-btn kys-btn--ghost kys-btn--danger" onClick={() => onDelete(site)}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const CategorySection = ({ category, scores, onScoreChange, expanded, onToggle }) => {
  const Icon = CATEGORY_ICONS[category.id] || FileText;
  const categoryScore = useMemo(() => {
    const factorScores = category.factors
      .map(f => scores[f.id]?.score)
      .filter(s => s !== null && s !== undefined);
    if (factorScores.length === 0) return null;
    return factorScores.reduce((sum, s) => sum + s, 0) / factorScores.length;
  }, [category.factors, scores]);

  const light = getTrafficLight(categoryScore);

  return (
    <div className={`kys-category ${expanded ? 'kys-category--expanded' : ''}`}>
      <button className="kys-category__header" onClick={onToggle}>
        <div className="kys-category__title-row">
          <Icon size={20} className="kys-category__icon" />
          <div className="kys-category__title">
            <h3>{category.name}</h3>
            <span className="kys-category__weight">Weight: {(category.weight * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="kys-category__status">
          {categoryScore !== null && (
            <span className="kys-category__score" style={{ color: getTrafficLightColor(light) }}>
              {categoryScore.toFixed(1)}
            </span>
          )}
          <TrafficLightBadge light={light} size="small" />
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {expanded && (
        <div className="kys-category__content">
          <p className="kys-category__description">{category.description}</p>
          
          <div className="kys-factors">
            {category.factors.map(factor => (
              <div key={factor.id} className="kys-factor">
                <div className="kys-factor__header">
                  <span className="kys-factor__id">{factor.id}</span>
                  <span className="kys-factor__name">{factor.name}</span>
                </div>
                <p className="kys-factor__description">{factor.description}</p>
                
                <ScoreSlider
                  value={scores[factor.id]?.score}
                  onChange={(value) => onScoreChange(factor.id, 'score', value)}
                />
                
                <p className="kys-factor__guide">{factor.guide}</p>
                
                <textarea
                  className="kys-factor__notes"
                  placeholder="Notes (optional)..."
                  value={scores[factor.id]?.notes || ''}
                  onChange={(e) => onScoreChange(factor.id, 'notes', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DealBreakerPanel = ({ dealBreakers }) => {
  const triggered = dealBreakers.filter(db => db.triggered);
  const clear = dealBreakers.filter(db => !db.triggered);

  return (
    <div className="kys-dealbreakers-panel">
      <h3 className="kys-panel-title">
        <AlertTriangle size={18} />
        Deal-Breaker Flags
      </h3>

      {triggered.length > 0 && (
        <div className="kys-dealbreakers__section kys-dealbreakers__section--triggered">
          <h4>Triggered ({triggered.length})</h4>
          {triggered.map(db => (
            <div key={db.id} className="kys-dealbreaker kys-dealbreaker--triggered">
              <XCircle size={16} />
              <div>
                <span className="kys-dealbreaker__name">{db.name}</span>
                <p className="kys-dealbreaker__desc">{db.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {clear.length > 0 && (
        <div className="kys-dealbreakers__section kys-dealbreakers__section--clear">
          <h4>Clear ({clear.length})</h4>
          {clear.map(db => (
            <div key={db.id} className="kys-dealbreaker kys-dealbreaker--clear">
              <CheckCircle2 size={16} />
              <span className="kys-dealbreaker__name">{db.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AssessmentSummary = ({ assessment }) => {
  if (!assessment) return null;

  return (
    <div className="kys-summary">
      <div className="kys-summary__header">
        <h3>Assessment Summary</h3>
      </div>

      <div className="kys-summary__overall">
        <div className="kys-summary__score-circle" style={{ borderColor: getTrafficLightColor(assessment.trafficLight) }}>
          <span className="kys-summary__score-value">{assessment.overallScore?.toFixed(1) || '—'}</span>
          <span className="kys-summary__score-label">/ 5.0</span>
        </div>
        <TrafficLightBadge light={assessment.trafficLight} size="large" showLabel />
      </div>

      <div className="kys-summary__categories">
        {Object.entries(CATEGORIES).map(([catId, cat]) => (
          <div key={catId} className="kys-summary__category">
            <span className="kys-summary__category-name">{cat.name}</span>
            <div className="kys-summary__category-bar">
              <div
                className="kys-summary__category-fill"
                style={{
                  width: `${((assessment.categoryScores[catId] || 0) / 5) * 100}%`,
                  background: getTrafficLightColor(assessment.categoryLights[catId]),
                }}
              />
            </div>
            <span className="kys-summary__category-score">
              {assessment.categoryScores[catId]?.toFixed(1) || '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="kys-summary__recommendation">
        <h4>Recommendation</h4>
        <p>{assessment.recommendation}</p>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN VIEWS
// =============================================================================

const SiteListView = ({ sites, onSelectSite, onCreateSite, onDeleteSite, onDuplicateSite }) => {
  const sitesWithAssessments = useMemo(() => {
    return sites.map(site => ({
      site,
      assessment: calculateOverallAssessment(site.scores),
    }));
  }, [sites]);

  const rankedSites = useMemo(() => compareSites(sites), [sites]);

  return (
    <div className="kys-site-list">
      <div className="kys-site-list__header">
        <div>
          <h2>Site Evaluations</h2>
          <p className="kys-site-list__subtitle">
            Evaluate potential sites against your client's vision
          </p>
        </div>
        <button className="kys-btn kys-btn--primary" onClick={onCreateSite}>
          <Plus size={16} />
          Add Site
        </button>
      </div>

      {sites.length === 0 ? (
        <div className="kys-empty-state">
          <MapPin size={48} />
          <h3>No Sites Evaluated Yet</h3>
          <p>Add a site to begin the Site-Vision Compatibility Assessment</p>
          <button className="kys-btn kys-btn--primary" onClick={onCreateSite}>
            <Plus size={16} />
            Add First Site
          </button>
        </div>
      ) : (
        <>
          {rankedSites.length > 1 && (
            <div className="kys-ranking">
              <h3>Site Ranking</h3>
              <div className="kys-ranking__list">
                {rankedSites.map((item, index) => (
                  <div
                    key={item.site.id}
                    className="kys-ranking__item"
                    onClick={() => onSelectSite(item.site)}
                  >
                    <span className="kys-ranking__position">#{index + 1}</span>
                    <span className="kys-ranking__name">{item.site.basicInfo.name || 'Unnamed'}</span>
                    <TrafficLightBadge light={item.assessment.trafficLight} size="small" />
                    <span className="kys-ranking__score">{item.assessment.overallScore?.toFixed(1) || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="kys-site-grid">
            {sitesWithAssessments.map(({ site, assessment }) => (
              <SiteCard
                key={site.id}
                site={site}
                assessment={assessment}
                onSelect={onSelectSite}
                onDelete={onDeleteSite}
                onDuplicate={onDuplicateSite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SiteAssessmentView = ({ site, onUpdateSite, onBack }) => {
  const [expandedCategory, setExpandedCategory] = useState('physicalCapacity');
  const [showSummary, setShowSummary] = useState(true);

  const assessment = useMemo(() => calculateOverallAssessment(site.scores), [site.scores]);

  const handleBasicInfoChange = useCallback((field, value) => {
    onUpdateSite({
      ...site,
      basicInfo: { ...site.basicInfo, [field]: value },
      updatedAt: new Date().toISOString(),
    });
  }, [site, onUpdateSite]);

  const handleScoreChange = useCallback((factorId, field, value) => {
    onUpdateSite({
      ...site,
      scores: {
        ...site.scores,
        [factorId]: { ...site.scores[factorId], [field]: value },
      },
      updatedAt: new Date().toISOString(),
    });
  }, [site, onUpdateSite]);

  const handleHandoffChange = useCallback((field, value) => {
    onUpdateSite({
      ...site,
      handoffNotes: { ...site.handoffNotes, [field]: value },
      updatedAt: new Date().toISOString(),
    });
  }, [site, onUpdateSite]);

  return (
    <div className="kys-assessment">
      <div className="kys-assessment__header">
        <button className="kys-btn kys-btn--ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Sites
        </button>
        <h2>{site.basicInfo.name || 'Site Assessment'}</h2>
        <div className="kys-assessment__completion">
          {assessment.completionPct}% Complete
        </div>
      </div>

      <div className="kys-assessment__layout">
        {/* Left: Site Info */}
        <div className="kys-assessment__sidebar">
          <div className="kys-panel">
            <h3 className="kys-panel-title">
              <Building2 size={18} />
              Site Information
            </h3>
            
            <div className="kys-form">
              <div className="kys-form__field">
                <label>Site Name</label>
                <input
                  type="text"
                  value={site.basicInfo.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  placeholder="e.g., Ocean Drive Parcel"
                />
              </div>

              <div className="kys-form__field">
                <label>Address</label>
                <input
                  type="text"
                  value={site.basicInfo.address}
                  onChange={(e) => handleBasicInfoChange('address', e.target.value)}
                  placeholder="123 Ocean Drive"
                />
              </div>

              <div className="kys-form__row">
                <div className="kys-form__field">
                  <label>City</label>
                  <input
                    type="text"
                    value={site.basicInfo.city}
                    onChange={(e) => handleBasicInfoChange('city', e.target.value)}
                    placeholder="Palm Beach"
                  />
                </div>
                <div className="kys-form__field kys-form__field--small">
                  <label>State</label>
                  <input
                    type="text"
                    value={site.basicInfo.state}
                    onChange={(e) => handleBasicInfoChange('state', e.target.value)}
                    placeholder="FL"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="kys-form__field">
                <label>Asking Price</label>
                <input
                  type="number"
                  value={site.basicInfo.askingPrice || ''}
                  onChange={(e) => handleBasicInfoChange('askingPrice', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="25000000"
                />
              </div>

              <div className="kys-form__row">
                <div className="kys-form__field">
                  <label>Lot Size (SF)</label>
                  <input
                    type="number"
                    value={site.basicInfo.lotSizeSF || ''}
                    onChange={(e) => handleBasicInfoChange('lotSizeSF', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="kys-form__field">
                  <label>Acres</label>
                  <input
                    type="number"
                    step="0.01"
                    value={site.basicInfo.lotSizeAcres || ''}
                    onChange={(e) => handleBasicInfoChange('lotSizeAcres', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="kys-form__row">
                <div className="kys-form__field">
                  <label>Lot Width (ft)</label>
                  <input
                    type="number"
                    value={site.basicInfo.lotWidth || ''}
                    onChange={(e) => handleBasicInfoChange('lotWidth', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="kys-form__field">
                  <label>Lot Depth (ft)</label>
                  <input
                    type="number"
                    value={site.basicInfo.lotDepth || ''}
                    onChange={(e) => handleBasicInfoChange('lotDepth', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="kys-form__field">
                <label>Zoning</label>
                <input
                  type="text"
                  value={site.basicInfo.zoning}
                  onChange={(e) => handleBasicInfoChange('zoning', e.target.value)}
                  placeholder="R-1"
                />
              </div>

              <div className="kys-form__field">
                <label>MLS Number</label>
                <input
                  type="text"
                  value={site.basicInfo.mlsNumber}
                  onChange={(e) => handleBasicInfoChange('mlsNumber', e.target.value)}
                />
              </div>

              <div className="kys-form__field">
                <label>Notes</label>
                <textarea
                  value={site.basicInfo.notes}
                  onChange={(e) => handleBasicInfoChange('notes', e.target.value)}
                  rows={3}
                  placeholder="General observations..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Assessment Categories */}
        <div className="kys-assessment__main">
          <div className="kys-categories">
            {Object.values(CATEGORIES).map(category => (
              <CategorySection
                key={category.id}
                category={category}
                scores={site.scores}
                onScoreChange={handleScoreChange}
                expanded={expandedCategory === category.id}
                onToggle={() => setExpandedCategory(
                  expandedCategory === category.id ? null : category.id
                )}
              />
            ))}
          </div>

          {/* Handoff Notes */}
          <div className="kys-panel kys-handoff">
            <h3 className="kys-panel-title">
              <ChevronRight size={18} />
              Handoff Notes
            </h3>
            <p className="kys-handoff__description">
              These notes will be carried forward to KYM module if this site is selected.
            </p>

            <div className="kys-form">
              <div className="kys-form__field">
                <label>Site Constraints (for documentation)</label>
                <textarea
                  value={site.handoffNotes.siteConstraints || ''}
                  onChange={(e) => handleHandoffChange('siteConstraints', e.target.value)}
                  rows={2}
                  placeholder="e.g., Max footprint 8,000 SF due to setbacks, north orientation required..."
                />
              </div>
              <div className="kys-form__field">
                <label>Insights for KYM (Market Analysis)</label>
                <textarea
                  value={site.handoffNotes.insightsForKYM || ''}
                  onChange={(e) => handleHandoffChange('insightsForKYM', e.target.value)}
                  rows={2}
                  placeholder="e.g., Market expects contemporary, not traditional..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary & Deal-Breakers */}
        <div className="kys-assessment__results">
          <AssessmentSummary assessment={assessment} />
          <DealBreakerPanel dealBreakers={assessment.dealBreakers} />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN MODULE
// =============================================================================

const KYSModule = ({ showDocs, onCloseDocs }) => {
  const { kysData, updateKYSData } = useAppContext();
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'assessment' | 'comparison'

  // Get sites from context or initialize empty
  const sites = kysData?.sites || [];

  const selectedSite = useMemo(() => {
    return sites.find(s => s.id === selectedSiteId);
  }, [sites, selectedSiteId]);

  const handleCreateSite = useCallback(() => {
    const newSite = createEmptySiteAssessment();
    const updatedSites = [...sites, newSite];
    updateKYSData({ sites: updatedSites });
    setSelectedSiteId(newSite.id);
    setViewMode('assessment');
  }, [sites, updateKYSData]);

  const handleSelectSite = useCallback((site) => {
    setSelectedSiteId(site.id);
    setViewMode('assessment');
  }, []);

  const handleUpdateSite = useCallback((updatedSite) => {
    const updatedSites = sites.map(s => s.id === updatedSite.id ? updatedSite : s);
    updateKYSData({ sites: updatedSites });
  }, [sites, updateKYSData]);

  const handleDeleteSite = useCallback((site) => {
    if (!window.confirm(`Delete "${site.basicInfo.name || 'this site'}"? This cannot be undone.`)) {
      return;
    }
    const updatedSites = sites.filter(s => s.id !== site.id);
    updateKYSData({ sites: updatedSites });
    if (selectedSiteId === site.id) {
      setSelectedSiteId(null);
      setViewMode('list');
    }
  }, [sites, selectedSiteId, updateKYSData]);

  const handleDuplicateSite = useCallback((site) => {
    const duplicate = {
      ...JSON.parse(JSON.stringify(site)),
      id: `site_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`,
      basicInfo: {
        ...site.basicInfo,
        name: `${site.basicInfo.name || 'Site'} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedSites = [...sites, duplicate];
    updateKYSData({ sites: updatedSites });
  }, [sites, updateKYSData]);

  const handleBackToList = useCallback(() => {
    setSelectedSiteId(null);
    setViewMode('list');
  }, []);

  // Show documentation if requested
  if (showDocs) {
    return <KYSDocumentation onClose={onCloseDocs} />;
  }

  return (
    <div className="kys-module">
      {viewMode === 'list' && (
        <SiteListView
          sites={sites}
          onSelectSite={handleSelectSite}
          onCreateSite={handleCreateSite}
          onDeleteSite={handleDeleteSite}
          onDuplicateSite={handleDuplicateSite}
        />
      )}

      {viewMode === 'assessment' && selectedSite && (
        <SiteAssessmentView
          site={selectedSite}
          onUpdateSite={handleUpdateSite}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default KYSModule;
