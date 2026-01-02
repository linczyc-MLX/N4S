import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import TasteExploration from '../../TasteExploration/TasteExploration';

// ============================================
// CONFIGURATION
// ============================================

const PROFILE_STORAGE_PREFIX = 'n4s_taste_profile_';

// Architectural Styles Data with correct Cloudinary URLs
const ARCH_STYLES = [
  { id: 'AS1', name: 'Avant-Contemporary', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS1_tpnuxa.png',
    features: ['Sculptural, experimental massing; asymmetry and bold cantilevers.', 'Parametric or faceted façade moves; deep reveals and dramatic shadow play.', 'High-contrast material palette (metal, glass, monolithic stone/concrete).', '"Statement" architecture: kinetic screens, expressive structure, theatrical lighting.'],
    appeal: 'Appeals to clients who want an unmistakable statement home—architectural as art, engineered to impress and differentiate.' },
  { id: 'AS2', name: 'Architectural Modern', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS2_ty6rnh.png',
    features: ['Rational, rectilinear volumes; clean lines and disciplined proportions.', 'Flat roofs, crisp parapets, minimal ornamentation.', 'Large-format glazing and clear structural logic (steel/concrete expression).', 'Restrained palette and detailing; emphasis on function and clarity.'],
    appeal: 'Appeals to clients who value clarity, performance, and a disciplined aesthetic—modernity expressed through structure and proportion.' },
  { id: 'AS3', name: 'Curated Minimalism', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS3_vwoca5.png',
    features: ['Minimal forms with highly refined proportions and junctions (shadow gaps, knife edges).', 'Warm, tactile materials used sparingly (limestone, plaster, pale timber, bronze).', 'Calm compositions with controlled openings; negative space as a design tool.', 'Landscape and hardscape treated as quiet, edited extensions of the architecture.'],
    appeal: 'Appeals to clients who prize calm luxury—quiet confidence, impeccable detailing, and "nothing extra" done exceptionally well.' },
  { id: 'AS4', name: 'Nordic Contemporary', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS4_kdptrm.png',
    features: ['Simplified archetypes (often gables) reinterpreted in modern, crisp geometry.', 'Light timber cladding paired with dark accents; standing-seam metal roofs common.', 'Practical, climate-driven envelopes: deep eaves, sheltered thresholds, robust materials.', 'Soft, natural palettes and a strong indoor–outdoor relationship to landscape.'],
    appeal: 'Appeals to clients who want warm modern living with pragmatic comfort—clean design rooted in nature, light, and livability.' },
  { id: 'AS5', name: 'Mid-Century Refined', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS5_b5xgik.png',
    features: ['Strong horizontality: low-slung pavilions, broad overhangs, post-and-beam rhythm.', 'Indoor–outdoor continuity via terraces, sliders, courtyards, and glazing.', 'Signature elements: clerestories, breeze-block screens, thin columns, warm wood ceilings.', 'Updated finishes and detailing (more tailored, less nostalgic).'],
    appeal: 'Appeals to clients drawn to iconic indoor–outdoor ease—timeless mid-century DNA, updated with sharper tailoring and quality.' },
  { id: 'AS6', name: 'Modern Classic', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS6_kdudr2.png',
    features: ['Classical proportion and symmetry distilled into clean, simplified forms.', 'Subtle references (pared pilasters/cornices) without heavy ornamentation.', 'Stone-forward elegance with contemporary window scale and crisp detailing.', 'Overall effect: composed, formal, and timeless—yet clearly modern.'],
    appeal: 'Appeals to clients who want timeless elegance without ostentation—classical balance translated into a contemporary lifestyle.' },
  { id: 'AS7', name: 'Classical Contemporary', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045987/AS7_csfm3r.png',
    features: ['Classical massing and order combined with contemporary transparency and scale shifts.', 'Selective ornament: traditional motifs simplified and used as accents, not wallpaper.', 'Stone/brick paired with modern bronze/steel and large glazed openings.', 'A "hybrid" identity: heritage cues with modern lightness and openness.'],
    appeal: 'Appeals to clients who want tradition with openness—heritage cues paired with modern scale, light, and glass-forward living.' },
  { id: 'AS8', name: 'Formal Classical', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS8_emtr7x.png',
    features: ['Strict symmetry, axial planning, and hierarchical façade composition.', 'Prominent columns, entablatures, pediments, and richly articulated moldings.', 'High craftsmanship: carved stone, ornate ironwork, formal courtyards/approaches.', 'Monumental presence; architecture as ceremony and status.'],
    appeal: 'Appeals to clients who seek prestige and ceremony—formal symmetry, grand arrival, and legacy craftsmanship.' },
  { id: 'AS9', name: 'Heritage Estate', 
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS9_s3btos.png',
    features: ['Estate scale and layered historic character (manor, chateau, country house cues).', 'Deep-set windows, steep roofs, chimneys; materials with patina (stone, slate, brick).', 'Picturesque composition: wings, garden walls, service elements, inherited complexity.', 'Landscape is integral—drives, hedges, gardens—projecting longevity and legacy.'],
    appeal: 'Appeals to clients who want generational gravitas—an estate that feels established, storied, and permanently valuable.' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function loadProfileFromStorage(clientId) {
  if (!clientId) return null;
  const key = `${PROFILE_STORAGE_PREFIX}${clientId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

function saveProfileToStorage(clientId, profileData) {
  if (!clientId || !profileData) return;
  const key = `${PROFILE_STORAGE_PREFIX}${clientId}`;
  const profile = {
    clientId,
    ...profileData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(profile));
  return profile;
}

function getProfileStatus(profile) {
  if (!profile) return 'not-started';
  if (profile.completedAt) return 'complete';
  if (profile.selections && Object.keys(profile.selections).length > 0) return 'pending';
  return 'not-started';
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Design DNA Slider (Gold-to-Navy gradient)
const DesignDNASlider = ({ label, value, leftLabel, rightLabel }) => {
  const percentage = ((value - 1) / 9) * 100; // 1-10 scale
  
  return (
    <div className="dna-slider">
      <div className="dna-slider__header">
        <span className="dna-slider__label">{label}</span>
        <span className="dna-slider__value">{value.toFixed(1)}</span>
      </div>
      <div className="dna-slider__track-row">
        <span className="dna-slider__endpoint dna-slider__endpoint--left">{leftLabel}</span>
        <div className="dna-slider__track">
          <div className="dna-slider__fill" style={{ width: `${percentage}%` }} />
          <div className="dna-slider__thumb" style={{ left: `${percentage}%` }} />
        </div>
        <span className="dna-slider__endpoint dna-slider__endpoint--right">{rightLabel}</span>
      </div>
    </div>
  );
};

// Comparison Slider for Partner View
const ComparisonSlider = ({ label, valueP, valueS, leftLabel, rightLabel, principalName, secondaryName }) => {
  const percentageP = ((valueP - 1) / 9) * 100;
  const percentageS = ((valueS - 1) / 9) * 100;
  
  return (
    <div className="comparison-slider">
      <div className="comparison-slider__header">
        <span className="comparison-slider__label">{label}</span>
      </div>
      <div className="comparison-slider__track-row">
        <span className="comparison-slider__endpoint">{leftLabel}</span>
        <div className="comparison-slider__track">
          <div 
            className="comparison-slider__marker comparison-slider__marker--p" 
            style={{ left: `${percentageP}%` }}
            title={`${principalName || 'Principal'}: ${valueP.toFixed(1)}`}
          />
          <div 
            className="comparison-slider__marker comparison-slider__marker--s" 
            style={{ left: `${percentageS}%` }}
            title={`${secondaryName || 'Secondary'}: ${valueS.toFixed(1)}`}
          />
        </div>
        <span className="comparison-slider__endpoint">{rightLabel}</span>
      </div>
    </div>
  );
};

// Style Card for Carousel - Vertical layout with image on top
const StyleCard = ({ style }) => {
  // Split features into two columns
  const midpoint = Math.ceil(style.features.length / 2);
  const leftFeatures = style.features.slice(0, midpoint);
  const rightFeatures = style.features.slice(midpoint);
  
  return (
    <div className="arch-style-card">
      <div className="arch-style-card__image">
        <img src={style.image} alt={style.name} loading="lazy" />
      </div>
      <div className="arch-style-card__content">
        <h4 className="arch-style-card__title">{style.name}</h4>
        <div className="arch-style-card__features-grid">
          <ul className="arch-style-card__features">
            {leftFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <ul className="arch-style-card__features">
            {rightFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <p className="arch-style-card__appeal">{style.appeal}</p>
      </div>
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status, name }) => (
  <span className={`taste-status-badge taste-status-badge--${status}`}>
    {status === 'complete' ? '✓' : status === 'pending' ? '◐' : '○'}
    <span>{name}: {status === 'complete' ? 'Complete' : status === 'pending' ? 'In Progress' : 'Not Started'}</span>
  </span>
);

// ============================================
// WELCOME VIEW (Before Taste Exploration)
// ============================================

const WelcomeView = ({ 
  clientType, setClientType,
  clientBaseName, setClientBaseName,
  principalName, setPrincipalName,
  secondaryName, setSecondaryName,
  clientIdP, clientIdS,
  statusP, statusS,
  onLaunch, onRefresh
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const goToPrev = () => setCarouselIndex(i => i === 0 ? ARCH_STYLES.length - 2 : i - 1);
  const goToNext = () => setCarouselIndex(i => i >= ARCH_STYLES.length - 2 ? 0 : i + 1);
  
  const visibleStyles = [
    ARCH_STYLES[carouselIndex],
    ARCH_STYLES[(carouselIndex + 1) % ARCH_STYLES.length]
  ];

  return (
    <div className="design-prefs-welcome">
      {/* Introduction */}
      <div className="taste-intro-banner">
        <h3>Discover Your Aesthetic DNA</h3>
        <p>
          The <strong>Taste Exploration</strong> assessment reveals your unique design preferences through 
          a series of visual choices. By selecting images that resonate with you across nine residential 
          space categories, we create a detailed profile of your aesthetic sensibilities—helping us match 
          you with designers who share your vision.
        </p>
        <p>
          The assessment takes approximately <strong>10-15 minutes</strong> to complete. Before you begin, 
          explore the architectural styles below to familiarize yourself with the spectrum of design languages.
        </p>
      </div>

      {/* Client Configuration */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Client Configuration</h3>
        
        <div className="client-type-toggle">
          <button
            className={`client-type-btn ${clientType === 'individual' ? 'client-type-btn--active' : ''}`}
            onClick={() => setClientType('individual')}
          >
            <span className="client-type-btn__icon">👤</span>
            Individual
          </button>
          <button
            className={`client-type-btn ${clientType === 'couple' ? 'client-type-btn--active' : ''}`}
            onClick={() => setClientType('couple')}
          >
            <span className="client-type-btn__icon">👥</span>
            Couple
          </button>
        </div>

        <div className="client-name-fields">
          <div className="form-field">
            <label className="form-field__label">Client Family Name</label>
            <input
              type="text"
              className="form-field__input"
              placeholder="e.g., Thornwood"
              value={clientBaseName}
              onChange={(e) => setClientBaseName(e.target.value)}
            />
            <span className="form-field__hint">Used to generate client IDs</span>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label">
                {clientType === 'couple' ? 'Principal Name' : 'Client Name'}
              </label>
              <input
                type="text"
                className="form-field__input"
                placeholder="First name"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
              />
            </div>
            {clientType === 'couple' && (
              <div className="form-field">
                <label className="form-field__label">Secondary Name</label>
                <input
                  type="text"
                  className="form-field__input"
                  placeholder="Spouse/Partner"
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                />
              </div>
            )}
          </div>

          {clientBaseName && (
            <div className="client-ids-display">
              <span className="client-ids-display__label">Generated IDs:</span>
              <code className="client-ids-display__id">{clientIdP}</code>
              {clientType === 'couple' && clientIdS && (
                <code className="client-ids-display__id">{clientIdS}</code>
              )}
            </div>
          )}

          {clientType === 'couple' && clientBaseName && (
            <div className="taste-status-row">
              <StatusBadge status={statusP} name={principalName || 'Principal'} />
              <StatusBadge status={statusS} name={secondaryName || 'Secondary'} />
              <button className="refresh-btn" onClick={onRefresh} title="Refresh status">↻</button>
            </div>
          )}
        </div>
      </div>

      {/* Architectural Styles Carousel */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Architectural Style Spectrum</h3>
        <p className="kyc-section__group-description">
          From avant-garde contemporary to heritage estate—explore the range of architectural expressions 
          to understand where your preferences might fall.
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
          {ARCH_STYLES.map((_, idx) => (
            <button
              key={idx}
              className={`arch-carousel__dot ${idx === carouselIndex || idx === carouselIndex + 1 ? 'arch-carousel__dot--active' : ''}`}
              onClick={() => setCarouselIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* Launch Buttons */}
      <div className="taste-launch-section">
        {clientType === 'couple' ? (
          <div className="taste-launch-buttons">
            <button 
              className="taste-launch-btn taste-launch-btn--primary"
              onClick={() => onLaunch('principal')}
              disabled={!clientIdP}
            >
              Start Taste Exploration — {principalName || 'Principal'}
            </button>
            <button 
              className="taste-launch-btn taste-launch-btn--secondary"
              onClick={() => onLaunch('secondary')}
              disabled={!clientIdS}
            >
              Start Taste Exploration — {secondaryName || 'Secondary'}
            </button>
          </div>
        ) : (
          <button 
            className="taste-launch-btn taste-launch-btn--primary"
            onClick={() => onLaunch('principal')}
            disabled={!clientIdP}
          >
            Start Taste Exploration
          </button>
        )}
        {!clientBaseName && (
          <p className="taste-launch-hint">Please enter a client name above to enable the assessment.</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPLETED VIEW (After Taste Exploration)
// ============================================

const CompletedView = ({ profileP, profileS, clientType, principalName, secondaryName, onRetake, onRefresh, onLaunchSecondary }) => {
  const profile = profileP?.profile || profileP || {};
  const scores = profile.scores || {};
  
  // Get top materials
  const materialPreferences = profile.topMaterials || [];

  // Calculate alignment percentage for couples
  const alignmentPercentage = profileS ? (() => {
    const scoresS = profileS?.profile?.scores || profileS?.scores || {};
    const axes = ['warmth', 'formality', 'drama', 'tradition', 'openness', 'art_focus'];
    let totalDiff = 0;
    let count = 0;
    axes.forEach(axis => {
      if (scores[axis] && scoresS[axis]) {
        totalDiff += Math.abs(scores[axis] - scoresS[axis]);
        count++;
      }
    });
    const avgDiff = count > 0 ? totalDiff / count : 0;
    return Math.max(0, Math.round(100 - (avgDiff / 10 * 100)));
  })() : null;

  return (
    <div className="design-prefs-complete">
      {/* Taste Exploration Complete Notice */}
      <div className="taste-complete-banner">
        <span className="taste-complete-banner__check">✓</span>
        <div>
          <strong>Taste Exploration Complete</strong>
          <p>Your design preferences have been derived from your visual selections.</p>
        </div>
      </div>

      {/* Design DNA Section */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Design DNA</h3>
        <p className="kyc-section__group-description">
          Your position on each spectrum, derived from Taste Exploration.
        </p>

        <div className="design-dna-sliders">
          <DesignDNASlider 
            label="Warmth" 
            value={scores.warmth || 5} 
            leftLabel="Cool" 
            rightLabel="Warm" 
          />
          <DesignDNASlider 
            label="Formality" 
            value={scores.formality || 5} 
            leftLabel="Casual" 
            rightLabel="Formal" 
          />
          <DesignDNASlider 
            label="Tradition" 
            value={scores.tradition || 5} 
            leftLabel="Contemporary" 
            rightLabel="Traditional" 
          />
          <DesignDNASlider 
            label="Drama" 
            value={scores.drama || 5} 
            leftLabel="Subtle" 
            rightLabel="Bold" 
          />
          <DesignDNASlider 
            label="Openness" 
            value={scores.openness || 5} 
            leftLabel="Enclosed" 
            rightLabel="Open" 
          />
          <DesignDNASlider 
            label="Art Focus" 
            value={scores.art_focus || 5} 
            leftLabel="Understated" 
            rightLabel="Gallery-like" 
          />
        </div>
      </div>

      {/* Material Preferences */}
      {materialPreferences.length > 0 && (
        <div className="kyc-section__group">
          <div className="prefs-card">
            <h4 className="prefs-card__title">Material Affinities</h4>
            <div className="prefs-card__chips">
              {materialPreferences.map((material, idx) => (
                <span key={idx} className="prefs-chip">
                  {material.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partner Comparison (for couples with both profiles complete) */}
      {clientType === 'couple' && profileS && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Partner Alignment</h3>
          <p className="kyc-section__group-description">
            Comparison of {principalName || 'Principal'} and {secondaryName || 'Secondary'} preferences.
          </p>
          
          <div className="partner-comparison">
            {/* Alignment Score */}
            <div className="alignment-score">
              <span className="alignment-score__label">Overall Alignment</span>
              <span className={`alignment-score__value ${
                alignmentPercentage >= 70 ? 'alignment-score__value--good' : 
                alignmentPercentage >= 50 ? 'alignment-score__value--moderate' : 
                'alignment-score__value--low'
              }`}>
                {alignmentPercentage}%
              </span>
            </div>

            <div className="comparison-legend">
              <span className="comparison-legend__item comparison-legend__item--p">● {principalName || 'Principal'}</span>
              <span className="comparison-legend__item comparison-legend__item--s">● {secondaryName || 'Secondary'}</span>
            </div>
            
            {/* Comparison Sliders */}
            <div className="comparison-sliders">
              <ComparisonSlider
                label="Warmth"
                valueP={scores.warmth || 5}
                valueS={profileS?.profile?.scores?.warmth || profileS?.scores?.warmth || 5}
                leftLabel="Cool"
                rightLabel="Warm"
                principalName={principalName}
                secondaryName={secondaryName}
              />
              <ComparisonSlider
                label="Tradition"
                valueP={scores.tradition || 5}
                valueS={profileS?.profile?.scores?.tradition || profileS?.scores?.tradition || 5}
                leftLabel="Contemporary"
                rightLabel="Traditional"
                principalName={principalName}
                secondaryName={secondaryName}
              />
              <ComparisonSlider
                label="Formality"
                valueP={scores.formality || 5}
                valueS={profileS?.profile?.scores?.formality || profileS?.scores?.formality || 5}
                leftLabel="Casual"
                rightLabel="Formal"
                principalName={principalName}
                secondaryName={secondaryName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Partner Pending Notice (for couples with only one profile) */}
      {clientType === 'couple' && !profileS && (
        <div className="kyc-section__group">
          <div className="partner-pending-notice">
            <span className="partner-pending-notice__icon">◐</span>
            <div>
              <strong>Partner Profile Pending</strong>
              <p>
                Once {secondaryName || 'Secondary'} completes their Taste Exploration, 
                a Partner Alignment Analysis will be available showing where your preferences 
                align and diverge.
              </p>
              <button 
                className="taste-launch-btn taste-launch-btn--secondary"
                onClick={onLaunchSecondary}
                style={{ marginTop: '12px' }}
              >
                Start Taste Exploration — {secondaryName || 'Secondary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retake Option */}
      <div className="retake-section">
        <button className="retake-btn" onClick={onRetake}>
          ↻ Retake Taste Exploration
        </button>
        <span className="retake-hint">This will reset your design preferences.</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const DesignIdentitySection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent]?.designIdentity || {};

  // Client configuration state
  const [clientType, setClientType] = useState(data.clientType || 'couple');
  const [clientBaseName, setClientBaseName] = useState(data.clientBaseName || '');
  const [principalName, setPrincipalName] = useState(data.principalName || '');
  const [secondaryName, setSecondaryName] = useState(data.secondaryName || '');
  
  // Taste profiles from localStorage
  const [profileP, setProfileP] = useState(null);
  const [profileS, setProfileS] = useState(null);
  
  // *** KEY CHANGE: Track active exploration instead of opening external URL ***
  // null = not in exploration, 'principal' = P doing exploration, 'secondary' = S doing exploration
  const [activeExploration, setActiveExploration] = useState(null);

  // Generate client IDs
  const clientIdP = clientBaseName ? `${clientBaseName}-P` : null;
  const clientIdS = clientType === 'couple' && clientBaseName ? `${clientBaseName}-S` : null;

  // Load profiles
  const refreshProfiles = useCallback(() => {
    if (clientIdP) {
      setProfileP(loadProfileFromStorage(clientIdP));
    }
    if (clientIdS) {
      setProfileS(loadProfileFromStorage(clientIdS));
    }
  }, [clientIdP, clientIdS]);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  // Listen for storage events (profile updates from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshProfiles();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshProfiles]);

  // Save client config to KYC data
  useEffect(() => {
    updateKYCData(respondent, 'designIdentity', {
      clientType,
      clientBaseName,
      principalName,
      secondaryName
    });
  }, [clientType, clientBaseName, principalName, secondaryName, updateKYCData, respondent]);

  // Get status
  const statusP = getProfileStatus(profileP);
  const statusS = getProfileStatus(profileS);
  
  // Determine if we should show completed view
  const showCompletedView = statusP === 'complete' && !activeExploration;

  // *** KEY CHANGE: Launch exploration INTERNALLY instead of opening URL ***
  const handleLaunch = (who) => {
    if (who === 'principal' && !clientIdP) {
      alert('Please enter a client name first');
      return;
    }
    if (who === 'secondary' && !clientIdS) {
      alert('Please enter a client name first');
      return;
    }
    setActiveExploration(who);
  };

  // Handle completion of Taste Exploration
  const handleExplorationComplete = (result) => {
    const clientId = activeExploration === 'principal' ? clientIdP : clientIdS;
    const name = activeExploration === 'principal' ? principalName : secondaryName;
    
    // Save profile to localStorage
    const savedProfile = saveProfileToStorage(clientId, {
      ...result,
      clientName: name,
      respondentType: activeExploration
    });
    
    // Update local state
    if (activeExploration === 'principal') {
      setProfileP(savedProfile);
    } else {
      setProfileS(savedProfile);
    }
    
    // Exit exploration mode
    setActiveExploration(null);
  };

  // Handle back/exit from exploration
  const handleExplorationBack = () => {
    setActiveExploration(null);
  };

  // Handle retake - clear profile and show welcome view
  const handleRetake = () => {
    if (window.confirm('This will reset your Taste Exploration results. Are you sure?')) {
      if (clientIdP) {
        localStorage.removeItem(`${PROFILE_STORAGE_PREFIX}${clientIdP}`);
      }
      if (clientIdS) {
        localStorage.removeItem(`${PROFILE_STORAGE_PREFIX}${clientIdS}`);
      }
      setProfileP(null);
      setProfileS(null);
    }
  };

  // *** KEY CHANGE: If exploration is active, render TasteExploration component ***
  if (activeExploration) {
    const clientId = activeExploration === 'principal' ? clientIdP : clientIdS;
    const clientName = activeExploration === 'principal' ? principalName : secondaryName;
    
    return (
      <div className="kyc-section design-identity-section design-identity-section--exploration">
        <TasteExploration
          clientName={clientName || clientId}
          respondentType={activeExploration}
          onComplete={handleExplorationComplete}
          onBack={handleExplorationBack}
        />
      </div>
    );
  }

  return (
    <div className="kyc-section design-identity-section">
      {showCompletedView ? (
        <CompletedView 
          profileP={profileP}
          profileS={profileS}
          clientType={clientType}
          principalName={principalName}
          secondaryName={secondaryName}
          onRetake={handleRetake}
          onRefresh={refreshProfiles}
          onLaunchSecondary={() => handleLaunch('secondary')}
        />
      ) : (
        <WelcomeView
          clientType={clientType}
          setClientType={setClientType}
          clientBaseName={clientBaseName}
          setClientBaseName={setClientBaseName}
          principalName={principalName}
          setPrincipalName={setPrincipalName}
          secondaryName={secondaryName}
          setSecondaryName={setSecondaryName}
          clientIdP={clientIdP}
          clientIdS={clientIdS}
          statusP={statusP}
          statusS={statusS}
          onLaunch={handleLaunch}
          onRefresh={refreshProfiles}
        />
      )}
    </div>
  );
};

export default DesignIdentitySection;
