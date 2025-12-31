import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import TasteExploration from '../../TasteExploration/TasteExploration';
import { 
  Palette, Play, Check, Users, User, ChevronRight,
  BarChart3, RefreshCw
} from 'lucide-react';

// ============================================
// CONFIGURATION
// ============================================

// Architectural Styles Data for preview carousel
const ARCH_STYLES = [
  { id: 'AS1', name: 'Avant-Contemporary', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS1_tpnuxa.png',
    description: 'Sculptural, experimental forms with bold cantilevers and dramatic expression.' },
  { id: 'AS2', name: 'Architectural Modern', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS2_ty6rnh.png',
    description: 'Rational volumes, clean lines, flat roofs, large-format glazing.' },
  { id: 'AS3', name: 'Curated Minimalism', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS3_vwoca5.png',
    description: 'Refined proportions, warm tactile materials, calm compositions.' },
  { id: 'AS4', name: 'Nordic Contemporary', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS4_kdptrm.png',
    description: 'Simplified archetypes, light timber, strong indoor-outdoor relationship.' },
  { id: 'AS5', name: 'Mid-Century Refined', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS5_b5xgik.png',
    description: 'Strong horizontality, post-and-beam rhythm, indoor-outdoor continuity.' },
  { id: 'AS6', name: 'Modern Classic', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS6_kdudr2.png',
    description: 'Classical proportion distilled into clean, simplified forms.' },
  { id: 'AS7', name: 'Classical Contemporary', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045987/AS7_csfm3r.png',
    description: 'Traditional motifs simplified as accents with modern transparency.' },
  { id: 'AS8', name: 'Formal Classical', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS8_emtr7x.png',
    description: 'Strict symmetry, prominent columns, ceremonial presence.' },
  { id: 'AS9', name: 'Heritage Estate', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS9_s3btos.png',
    description: 'Estate scale with layered historic character and legacy gravitas.' },
];

// ============================================
// STYLE CARD COMPONENT
// ============================================
const StyleCard = ({ style }) => (
  <div className="arch-style-card">
    <img 
      src={style.image} 
      alt={style.name}
      className="arch-style-card__image"
    />
    <div className="arch-style-card__content">
      <h4 className="arch-style-card__name">{style.name}</h4>
      <p className="arch-style-card__description">{style.description}</p>
    </div>
  </div>
);

// ============================================
// STATUS BADGE COMPONENT
// ============================================
const StatusBadge = ({ status, name }) => {
  const statusConfig = {
    'complete': { label: 'Complete', color: 'success', icon: Check },
    'in-progress': { label: 'In Progress', color: 'warning', icon: BarChart3 },
    'not-started': { label: 'Not Started', color: 'gray', icon: null }
  };
  
  const config = statusConfig[status] || statusConfig['not-started'];
  const Icon = config.icon;
  
  return (
    <div className={`taste-status-badge taste-status-badge--${config.color}`}>
      {Icon && <Icon size={14} />}
      <span className="taste-status-badge__name">{name}</span>
      <span className="taste-status-badge__status">{config.label}</span>
    </div>
  );
};

// ============================================
// WELCOME VIEW (Before starting exploration)
// ============================================
const WelcomeView = ({ 
  clientType, 
  setClientType, 
  principalFirstName,
  principalLastName,
  secondaryFirstName,
  secondaryLastName,
  principalStatus,
  secondaryStatus,
  onStartExploration,
  carouselIndex,
  setCarouselIndex
}) => {
  const goToNext = () => setCarouselIndex((prev) => (prev + 1) % (ARCH_STYLES.length - 1));
  const goToPrev = () => setCarouselIndex((prev) => (prev - 1 + ARCH_STYLES.length - 1) % (ARCH_STYLES.length - 1));
  const visibleStyles = [ARCH_STYLES[carouselIndex], ARCH_STYLES[carouselIndex + 1]].filter(Boolean);

  const principalDisplayName = principalFirstName || 'Principal';
  const secondaryDisplayName = secondaryFirstName || 'Secondary';
  const familyName = principalLastName || secondaryLastName || 'Client';

  return (
    <div className="design-prefs-welcome">
      {/* Introduction */}
      <div className="taste-intro-banner">
        <div className="taste-intro-banner__icon">
          <Palette size={32} />
        </div>
        <h3>Discover Your Aesthetic DNA</h3>
        <p>
          The <strong>Taste Exploration</strong> assessment reveals your unique design preferences through 
          a series of visual choices. By selecting images that resonate with you across residential 
          space categories, we create a detailed profile of your aesthetic sensibilities—helping us match 
          you with designers who share your vision.
        </p>
        <p className="taste-intro-banner__duration">
          ⏱️ Approximately <strong>10-15 minutes</strong> to complete
        </p>
      </div>

      {/* Client Configuration */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Assessment Configuration</h3>
        
        <div className="client-info-display">
          <div className="client-info-display__header">
            <span className="client-info-display__label">Client Family</span>
            <span className="client-info-display__name">{familyName}</span>
          </div>
          <p className="client-info-display__note">
            Names are automatically populated from your Portfolio Context (P1.A.1)
          </p>
        </div>
        
        <div className="client-type-toggle">
          <button
            className={`client-type-btn ${clientType === 'individual' ? 'client-type-btn--active' : ''}`}
            onClick={() => setClientType('individual')}
          >
            <User size={20} />
            <span>Individual</span>
            <small>Single decision-maker</small>
          </button>
          <button
            className={`client-type-btn ${clientType === 'couple' ? 'client-type-btn--active' : ''}`}
            onClick={() => setClientType('couple')}
          >
            <Users size={20} />
            <span>Couple</span>
            <small>Partner alignment analysis</small>
          </button>
        </div>

        {/* Status Display */}
        <div className="taste-status-section">
          <h4>Assessment Status</h4>
          <div className="taste-status-row">
            <StatusBadge status={principalStatus} name={principalDisplayName} />
            {clientType === 'couple' && (
              <StatusBadge status={secondaryStatus} name={secondaryDisplayName} />
            )}
          </div>
        </div>
      </div>

      {/* Architectural Styles Preview */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Architectural Style Spectrum</h3>
        <p className="kyc-section__group-description">
          From avant-garde contemporary to heritage estate—explore the range of architectural expressions.
        </p>

        <div className="arch-carousel">
          <button className="arch-carousel__nav arch-carousel__nav--prev" onClick={goToPrev}>
            ‹
          </button>
          
          <div className="arch-carousel__track">
            {visibleStyles.map((style) => (
              <StyleCard key={style.id} style={style} />
            ))}
          </div>
          
          <button className="arch-carousel__nav arch-carousel__nav--next" onClick={goToNext}>
            ›
          </button>
        </div>

        <div className="arch-carousel__dots">
          {ARCH_STYLES.slice(0, -1).map((_, idx) => (
            <button
              key={idx}
              className={`arch-carousel__dot ${idx === carouselIndex ? 'arch-carousel__dot--active' : ''}`}
              onClick={() => setCarouselIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* Launch Buttons */}
      <div className="taste-launch-section">
        <h3 className="taste-launch-section__title">Start Taste Exploration</h3>
        
        {clientType === 'couple' ? (
          <div className="taste-launch-buttons">
            <button 
              className="taste-launch-btn taste-launch-btn--primary"
              onClick={() => onStartExploration('principal')}
            >
              <Play size={20} />
              <span>Begin as {principalDisplayName}</span>
              <ChevronRight size={20} />
            </button>
            <button 
              className="taste-launch-btn taste-launch-btn--secondary"
              onClick={() => onStartExploration('secondary')}
            >
              <Play size={20} />
              <span>Begin as {secondaryDisplayName}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <button 
            className="taste-launch-btn taste-launch-btn--primary taste-launch-btn--full"
            onClick={() => onStartExploration('principal')}
          >
            <Play size={20} />
            <span>Start Taste Exploration</span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// RESULTS VIEW (After completion)
// ============================================
const ResultsView = ({ 
  principalResults, 
  secondaryResults, 
  clientType,
  principalFirstName,
  secondaryFirstName,
  onRestart
}) => {
  const principalDisplayName = principalFirstName || 'Principal';
  const secondaryDisplayName = secondaryFirstName || 'Secondary';

  const getScoreLabel = (score) => {
    if (score >= 8) return 'High';
    if (score >= 6) return 'Moderate-High';
    if (score >= 4) return 'Moderate';
    if (score >= 2) return 'Moderate-Low';
    return 'Low';
  };

  const ScoreBar = ({ label, value }) => (
    <div className="results-score-bar">
      <div className="results-score-bar__header">
        <span className="results-score-bar__label">{label}</span>
        <span className="results-score-bar__value">{value}/10</span>
      </div>
      <div className="results-score-bar__track">
        <div 
          className="results-score-bar__fill" 
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="results-score-bar__level">{getScoreLabel(value)}</span>
    </div>
  );

  return (
    <div className="design-prefs-results">
      <div className="results-header">
        <Check size={48} className="results-header__icon" />
        <h2>Taste Exploration Complete</h2>
        <p>Your aesthetic preferences have been captured and saved.</p>
      </div>

      <div className="results-profiles">
        {/* Principal Results */}
        {principalResults && (
          <div className="results-profile-card">
            <h3>{principalDisplayName}'s Profile</h3>
            
            <div className="results-stats">
              <div className="results-stat">
                <span className="results-stat__value">
                  {Object.keys(principalResults.rankings || {}).length}
                </span>
                <span className="results-stat__label">Quads Ranked</span>
              </div>
              <div className="results-stat">
                <span className="results-stat__value">
                  {principalResults.skipped?.length || 0}
                </span>
                <span className="results-stat__label">Skipped</span>
              </div>
            </div>

            {principalResults.profile && (
              <div className="results-axes">
                {Object.entries(principalResults.profile.scores || {}).map(([axis, score]) => (
                  <ScoreBar 
                    key={axis} 
                    label={axis.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    value={score}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Secondary Results (if couple) */}
        {clientType === 'couple' && secondaryResults && (
          <div className="results-profile-card">
            <h3>{secondaryDisplayName}'s Profile</h3>
            
            <div className="results-stats">
              <div className="results-stat">
                <span className="results-stat__value">
                  {Object.keys(secondaryResults.rankings || {}).length}
                </span>
                <span className="results-stat__label">Quads Ranked</span>
              </div>
              <div className="results-stat">
                <span className="results-stat__value">
                  {secondaryResults.skipped?.length || 0}
                </span>
                <span className="results-stat__label">Skipped</span>
              </div>
            </div>

            {secondaryResults.profile && (
              <div className="results-axes">
                {Object.entries(secondaryResults.profile.scores || {}).map(([axis, score]) => (
                  <ScoreBar 
                    key={axis} 
                    label={axis.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    value={score}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button className="results-restart-btn" onClick={onRestart}>
        <RefreshCw size={16} /> Restart Taste Exploration
      </button>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const DesignIdentitySection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent]?.designIdentity || {};
  const portfolioData = kycData[respondent]?.portfolioContext || {};

  // Get names from Portfolio Context
  const principalFirstName = portfolioData.principalFirstName || '';
  const principalLastName = portfolioData.principalLastName || '';
  const secondaryFirstName = portfolioData.secondaryFirstName || '';
  const secondaryLastName = portfolioData.secondaryLastName || '';

  // Local state
  const [clientType, setClientType] = useState(data.clientType || 'couple');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeExploration, setActiveExploration] = useState(null); // null | 'principal' | 'secondary'
  
  // Results from KYC data
  const principalResults = data.principalTasteResults || null;
  const secondaryResults = data.secondaryTasteResults || null;

  // Determine status
  const principalStatus = useMemo(() => {
    if (principalResults?.completedAt) return 'complete';
    if (principalResults?.rankings && Object.keys(principalResults.rankings).length > 0) return 'in-progress';
    return 'not-started';
  }, [principalResults]);

  const secondaryStatus = useMemo(() => {
    if (secondaryResults?.completedAt) return 'complete';
    if (secondaryResults?.rankings && Object.keys(secondaryResults.rankings).length > 0) return 'in-progress';
    return 'not-started';
  }, [secondaryResults]);

  // Save client type to KYC
  useEffect(() => {
    if (data.clientType !== clientType) {
      updateKYCData(respondent, 'designIdentity', { clientType });
    }
  }, [clientType, data.clientType, updateKYCData, respondent]);

  // Handle exploration completion
  const handleExplorationComplete = (results) => {
    const fieldName = activeExploration === 'principal' 
      ? 'principalTasteResults' 
      : 'secondaryTasteResults';
    
    updateKYCData(respondent, 'designIdentity', {
      [fieldName]: results
    });
    
    setActiveExploration(null);
  };

  // Handle restart
  const handleRestart = () => {
    updateKYCData(respondent, 'designIdentity', {
      principalTasteResults: null,
      secondaryTasteResults: null
    });
  };

  // Determine which view to show
  const showResults = principalStatus === 'complete' || 
    (clientType === 'couple' && secondaryStatus === 'complete');

  // Active exploration mode
  if (activeExploration) {
    const clientName = activeExploration === 'principal' 
      ? `${principalFirstName} ${principalLastName}`.trim() || 'Principal'
      : `${secondaryFirstName} ${secondaryLastName}`.trim() || 'Secondary';

    return (
      <div className="kyc-section design-identity-section design-identity-section--exploring">
        <TasteExploration
          clientName={clientName}
          respondentType={activeExploration}
          onComplete={handleExplorationComplete}
          onBack={() => setActiveExploration(null)}
        />
      </div>
    );
  }

  return (
    <div className="kyc-section design-identity-section">
      {showResults ? (
        <ResultsView
          principalResults={principalResults}
          secondaryResults={secondaryResults}
          clientType={clientType}
          principalFirstName={principalFirstName}
          secondaryFirstName={secondaryFirstName}
          onRestart={handleRestart}
        />
      ) : (
        <WelcomeView
          clientType={clientType}
          setClientType={setClientType}
          principalFirstName={principalFirstName}
          principalLastName={principalLastName}
          secondaryFirstName={secondaryFirstName}
          secondaryLastName={secondaryLastName}
          principalStatus={principalStatus}
          secondaryStatus={secondaryStatus}
          onStartExploration={setActiveExploration}
          carouselIndex={carouselIndex}
          setCarouselIndex={setCarouselIndex}
        />
      )}
    </div>
  );
};

export default DesignIdentitySection;
