// ============================================
// N4S KYC DESIGN IDENTITY SECTION (P1.A.5)
// Design Preferences with Taste Exploration
// Version 2.5 - FINAL with Location & Enhanced Reports
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import {
  viewTasteReport,
  downloadTasteReport
} from '../../../utils/TasteReportGenerator';
import TasteExploration from '../../TasteExploration/TasteExploration';
import { quads, categoryOrder } from '../../../data/tasteQuads';

// ============================================
// CONFIGURATION
// ============================================

const PROFILE_STORAGE_PREFIX = 'n4s_taste_profile_';

// Architectural Styles Data with Cloudinary URLs
const ARCH_STYLES = [
  { id: 'AS1', name: 'Avant-Contemporary',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS1_tpnuxa.png',
    features: ['Sculptural, experimental massing; asymmetry and bold cantilevers.', 'Parametric or faceted façade moves; deep reveals and dramatic shadow play.', 'High-contrast material palette (metal, glass, monolithic stone/concrete).', '"Statement" architecture: kinetic screens, expressive structure, theatrical lighting.'],
    appeal: 'Attracts clients drawn to bold artistic expression, avant-garde culture, and design as spectacle.' },
  { id: 'AS2', name: 'Architectural Modern',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS2_ty6rnh.png',
    features: ['Clean, minimalist volumetric forms, often flat roofs and ribbon glazing.', 'Refined material joints—flush details, frameless glass, concealed flashings.', 'Emphasis on "honest" structure (exposed steel, board-formed concrete, natural wood).', 'Landscape seamlessly merges with architecture via courtyards and indoor-outdoor flow.'],
    appeal: 'Speaks to clients who value intellectual rigor, craftsmanship transparency, and edited, gallery-like interiors.' },
  { id: 'AS3', name: 'Curated Minimalism',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS3_vwoca5.png',
    features: ['Simple rectilinear massing with low-profile roofs or subtle flat roof parapets.', 'White/off-white palette with textured plaster, lime wash, bleached wood, or matte stone.', 'Furniture and décor as focal points; architecture recedes to a serene backdrop.', 'Light-wells, internal courtyards, and tranquil water features enhance calm ambience.'],
    appeal: 'Resonates with clients seeking sanctuary from visual noise—wellness-minded, art collectors, or contemplative personalities.' },
  { id: 'AS4', name: 'Nordic Contemporary',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS4_kdptrm.png',
    features: ['Warm-wood cladding combined with dark metal or stone accents; pitched or shed roofs.', 'Large, carefully placed windows framing views; deep eaves and sheltered entries.', 'Cozy, "hygge-inspired" interiors—tactile textiles, fireplaces, natural light modulation.', 'Integration with landscape: timber terraces, evergreen planting, stone pathways.'],
    appeal: 'Attracts those who want warmth without fuss—nature lovers, families desiring comfort, and clients from colder climates.' },
  { id: 'AS5', name: 'Mid-Century Refined',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS5_b5xgik.png',
    features: ['Low-slung profiles, butterfly/gable roofs, and rhythmic post-and-beam structure.', 'Floor-to-ceiling glass walls blurring inside-out; open-plan living.', 'Mix of natural materials (teak, walnut, stone, leather) with period-correct detailing.', 'Restored or reimagined vintage furniture; curated art pieces from the 1950s–70s.'],
    appeal: 'Draws collectors and design-history enthusiasts who appreciate authenticity, vintage provenance, and understated glamour.' },
  { id: 'AS6', name: 'Modern Classic',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS6_kdudr2.png',
    features: ['Symmetrical façades with simplified classical proportions—no heavy ornamentation.', 'Warm whites, limestones, and metal accents; standing-seam roofs or simple parapets.', 'Interiors balance traditional layouts with contemporary finishes.', 'Timeless elegance: paneled walls meet sleek cabinetry and curated antiques.'],
    appeal: 'Appeals to clients who want enduring elegance without flash—often older wealth, diplomats, or those comfortable in traditional social settings.' },
  { id: 'AS7', name: 'Classical Contemporary',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045987/AS7_csfm3r.png',
    features: ['Classical motifs (columns, pediments, cornices) rendered in stone or stucco; updated scale.', 'Grand entry sequences with proportioned doors, sidelights, and fanlights.', 'Formal interiors—high ceilings, crown moldings, wainscoting—paired with current fabrics.', 'Gardens reference classical landscape traditions: symmetry, hedges, sculpture.'],
    appeal: 'Resonates with clients who value tradition, family heritage, and a visible sense of status rooted in historical continuity.' },
  { id: 'AS8', name: 'Formal Classical',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS8_emtr7x.png',
    features: ['Full classical vocabulary: Doric/Ionic columns, entablatures, balustrades, hipped slate roofs.', 'Limestone, brick, or rendered masonry; ornate ironwork and stately porte-cochères.', 'Enfilade room sequences; grand staircases, paneled libraries, and ballroom-scale spaces.', 'Formal gardens with parterre beds, fountains, and axial sight lines.'],
    appeal: 'Attracts those seeking overt prestige—Old World aristocracy, philanthropists, or clients who host grand social and ceremonial events.' },
  { id: 'AS9', name: 'Heritage Estate',
    image: 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS9_s3btos.png',
    features: ['Estate scale and layered historic character (manor, chateau, country house cues).', 'Deep-set windows, steep roofs, chimneys; materials with patina (stone, slate, brick).', 'Picturesque composition: wings, garden walls, service elements, inherited complexity.', 'Landscape is integral—drives, hedges, gardens—projecting longevity and legacy.'],
    appeal: 'Appeals to clients who want generational gravitas—an estate that feels established, storied, and permanently valuable.' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Load profile from localStorage
const loadProfileFromStorage = (clientId) => {
  if (!clientId) return null;
  try {
    const stored = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${clientId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Error loading profile:', e);
    return null;
  }
};

// Save profile to localStorage
const saveProfileToStorage = (clientId, profile) => {
  if (!clientId) return null;
  try {
    const toSave = {
      ...profile,
      clientId,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${clientId}`, JSON.stringify(toSave));
    return toSave;
  } catch (e) {
    console.error('Error saving profile:', e);
    return null;
  }
};

// Extract profile from URL (when redirecting back from Taste app)
const extractProfileFromURL = () => {
  try {
    const hash = window.location.hash;
    if (hash && hash.includes('tasteProfile=')) {
      const encoded = hash.split('tasteProfile=')[1];
      if (encoded) {
        const decoded = JSON.parse(atob(decodeURIComponent(encoded)));
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return decoded;
      }
    }
  } catch (e) {
    console.error('Error extracting profile from URL:', e);
  }
  return null;
};

// Get profile status
const getProfileStatus = (profile) => {
  if (!profile) return 'not_started';
  // Check for completedAt at top level OR inside session
  if (profile.completedAt || profile.session?.completedAt) return 'complete';
  if (profile.session?.progress) {
    const cats = Object.values(profile.session.progress);
    const hasAnyProgress = cats.some(c => c.completedQuads > 0);
    return hasAnyProgress ? 'in_progress' : 'not_started';
  }
  // Also check for selections directly (old format)
  if (profile.selections && Object.keys(profile.selections).length > 0) return 'complete';
  return 'not_started';
};

// ============================================
// ARCHITECTURAL STYLE CAROUSEL COMPONENT
// ============================================

const ArchStyleCarousel = () => {
  const [pairIndex, setPairIndex] = useState(0);
  const totalPairs = Math.ceil(ARCH_STYLES.length / 2);

  const next = () => setPairIndex((pairIndex + 1) % totalPairs);
  const prev = () => setPairIndex((pairIndex - 1 + totalPairs) % totalPairs);

  const leftStyle = ARCH_STYLES[pairIndex * 2];
  const rightStyle = ARCH_STYLES[pairIndex * 2 + 1];

  const StyleCard = ({ style }) => {
    if (!style) return null;
    const midpoint = Math.ceil(style.features.length / 2);
    const leftFeatures = style.features.slice(0, midpoint);
    const rightFeatures = style.features.slice(midpoint);

    return (
      <div className="style-card">
        <div className="style-card__image-container">
          <img src={style.image} alt={style.name} className="style-card__image" />
        </div>
        <h4 className="style-card__title">{style.name}</h4>
        <div className="style-card__features">
          <ul className="style-card__feature-list">
            {leftFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <ul className="style-card__feature-list">
            {rightFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <p className="style-card__appeal">{style.appeal}</p>
      </div>
    );
  };

  return (
    <div className="arch-carousel">
      <button onClick={prev} className="arch-carousel__btn arch-carousel__btn--prev">‹</button>

      <div className="arch-carousel__cards">
        <StyleCard style={leftStyle} />
        <StyleCard style={rightStyle} />
      </div>

      <button onClick={next} className="arch-carousel__btn arch-carousel__btn--next">›</button>

      <div className="arch-carousel__dots">
        {ARCH_STYLES.map((_, i) => (
          <span
            key={i}
            className={`arch-carousel__dot ${i >= pairIndex * 2 && i < pairIndex * 2 + 2 ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// PROFILE STATUS CARD COMPONENT
// ============================================

const ProfileCard = ({ clientId, name, profile, status, onLaunch, isPrimary }) => {
  const statusLabels = {
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'complete': 'Complete'
  };

  const statusColors = {
    'not_started': '#94a3b8',
    'in_progress': '#f59e0b',
    'complete': '#10b981'
  };

  return (
    <div className={`profile-card ${isPrimary ? 'profile-card--primary' : 'profile-card--secondary'}`}>
      <div className="profile-card__header">
        <span className="profile-card__badge">{isPrimary ? 'P' : 'S'}</span>
        <span className="profile-card__name">{name || clientId}</span>
      </div>
      <div className="profile-card__status" style={{ color: statusColors[status] }}>
        {statusLabels[status]}
      </div>
      {status !== 'complete' && (
        <button
          className="profile-card__btn"
          onClick={() => onLaunch(isPrimary ? 'principal' : 'secondary')}
        >
          {status === 'in_progress' ? 'Continue' : 'Start'} Taste Exploration
        </button>
      )}
      {status === 'complete' && profile?.session && (
        <div className="profile-card__summary">
          <small>Completed {new Date(profile.session.completedAt).toLocaleDateString()}</small>
        </div>
      )}
    </div>
  );
};

// ============================================
// DESIGN DNA SLIDER COMPONENT
// ============================================

const DesignDNASlider = ({ label, value, leftLabel, rightLabel, max = 5 }) => {
  const percentage = ((value - 1) / (max - 1)) * 100;

  return (
    <div className="dna-slider">
      <div className="dna-slider__label">{label}</div>
      <div className="dna-slider__track">
        <div
          className="dna-slider__marker"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="dna-slider__labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

// ============================================
// COMPARISON SLIDER COMPONENT (for Partner Alignment)
// ============================================

const ComparisonSlider = ({ label, valueP, valueS, leftLabel, rightLabel, principalName, secondaryName }) => {
  const positionP = ((valueP || 2.5) / 5) * 100;
  const positionS = ((valueS || 2.5) / 5) * 100;

  return (
    <div className="comparison-slider">
      <div className="comparison-slider__header">
        <span className="comparison-slider__label">{label}</span>
      </div>
      <div className="comparison-slider__track-container">
        <div className="comparison-slider__track">
          <div
            className="comparison-slider__marker comparison-slider__marker--principal"
            style={{ left: `${positionP}%` }}
            title={`${principalName || 'Principal'}: ${valueP?.toFixed(1)}`}
          />
          <div
            className="comparison-slider__marker comparison-slider__marker--secondary"
            style={{ left: `${positionS}%` }}
            title={`${secondaryName || 'Secondary'}: ${valueS?.toFixed(1)}`}
          />
        </div>
        <div className="comparison-slider__labels">
          <span className="comparison-slider__left-label">{leftLabel}</span>
          <span className="comparison-slider__right-label">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPLETED VIEW COMPONENT (with Report Buttons)
// ============================================

const CompletedView = ({
  profileP,
  profileS,
  clientType,
  principalName,
  secondaryName,
  location,
  kycData,
  kycComplete,
  onRetake,
  onRefresh,
  onLaunchSecondary
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  // Handle refresh with visual feedback
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshMessage('');
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshMessage('Profiles refreshed!');
      setTimeout(() => setRefreshMessage(''), 2000);
    }, 500);
  };

  // Calculate metrics from profile (same algorithm as TasteReportGenerator)
  const getMetrics = (profile) => {
    if (!profile) return { ct: 3, ml: 3, mp: 3 };

    // Helper to extract AS/VD/MP codes from image filename
    const extractCodes = (imageUrl) => {
      if (!imageUrl) return null;
      const filename = imageUrl.split('/').pop();
      const asMatch = filename.match(/AS(\d)/);
      const vdMatch = filename.match(/VD(\d)/);
      const mpMatch = filename.match(/MP(\d)/);
      if (!asMatch || !vdMatch || !mpMatch) return null;
      return {
        as: parseInt(asMatch[1]),
        vd: parseInt(vdMatch[1]),
        mp: parseInt(mpMatch[1])
      };
    };

    // Helper to get selection for a category
    const getSelectionForCategory = (categoryId) => {
      const flatSelections = profile.selections || profile.session?.selections || {};
      const categoryQuads = quads.filter(q => q.category === categoryId);

      for (const quad of categoryQuads) {
        const sel = flatSelections[quad.quadId];
        if (sel && sel.favorites && sel.favorites.length > 0) {
          const quadData = quads.find(q => q.quadId === quad.quadId);
          if (quadData && quadData.images && quadData.images[sel.favorites[0]]) {
            return quadData.images[sel.favorites[0]];
          }
        }
      }
      return null;
    };

    // Normalize 1-9 scale to 1-5 scale
    const normalize9to5 = (value) => ((value - 1) / 8) * 4 + 1;

    let totalAS = 0, totalVD = 0, totalMP = 0, count = 0;

    categoryOrder.forEach(categoryId => {
      const imageUrl = getSelectionForCategory(categoryId);
      if (imageUrl) {
        const codes = extractCodes(imageUrl);
        if (codes) {
          totalAS += normalize9to5(codes.as);
          totalVD += normalize9to5(codes.vd);
          totalMP += normalize9to5(codes.mp);
          count++;
        }
      }
    });

    if (count === 0) return { ct: 3, ml: 3, mp: 3 };

    return {
      ct: totalAS / count,
      ml: totalVD / count,
      mp: totalMP / count
    };
  };

  const metricsP = getMetrics(profileP);
  const metricsS = profileS ? getMetrics(profileS) : null;

  // Calculate alignment percentage between Principal and Secondary
  const calculateAlignment = () => {
    if (!metricsP || !metricsS) return 0;
    const ctDiff = Math.abs((metricsP.ct || 2.5) - (metricsS.ct || 2.5));
    const mlDiff = Math.abs((metricsP.ml || 2.5) - (metricsS.ml || 2.5));
    const mpDiff = Math.abs((metricsP.mp || 2.5) - (metricsS.mp || 2.5));
    const avgDiff = (ctDiff + mlDiff + mpDiff) / 3;
    return Math.max(0, Math.round(100 - (avgDiff / 5 * 100)));
  };
  const alignmentPercentage = calculateAlignment();

  // Get style label
  const getStyleLabel = (ctValue) => {
    if (ctValue < 2.5) return 'Contemporary';
    if (ctValue > 3.5) return 'Traditional';
    return 'Transitional';
  };

  // Build report options with location and kycData
  const buildReportOptions = () => {
    return {
      location: location || null,
      kycData: kycData
    };
  };

  // Report handlers
  const handleViewReport = async () => {
    setIsGenerating(true);
    try {
      await viewTasteReport(profileP, profileS, buildReportOptions());
    } catch (e) {
      console.error('Error generating report:', e);
      alert('Error generating report. Please try again.');
    }
    setIsGenerating(false);
  };

  const handleDownloadReport = async () => {
    setIsGenerating(true);
    try {
      await downloadTasteReport(profileP, profileS, buildReportOptions());
    } catch (e) {
      console.error('Error downloading report:', e);
      alert('Error downloading report. Please try again.');
    }
    setIsGenerating(false);
  };

  const handleEmailReport = async () => {
    setIsGenerating(true);
    setEmailStatus('Downloading reports...');
    try {
      const projectName = kycData?.principal?.projectParameters?.projectName || 'Project';
      const clientName = principalName || 'Client';
      const partnerName = secondaryName || 'Partner';
      const hasPartner = profileS && profileS.completedAt;

      // Download principal's report (includes partner alignment if both completed)
      await downloadTasteReport(profileP, profileS, buildReportOptions());

      // If partner exists, also download their individual report
      if (hasPartner) {
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
        await downloadTasteReport(profileS, null, buildReportOptions());
      }

      // Compose email
      const subject = encodeURIComponent(`${projectName} - Design Preferences Report`);
      const body = encodeURIComponent(
        `Please find attached the Design Preferences Report for ${projectName}.\n\n` +
        `The PDF report(s) have been downloaded to your computer. Please attach them to this email.\n\n` +
        `Reports included:\n` +
        `- ${clientName}'s Design Profile${hasPartner ? `\n- ${partnerName}'s Design Profile` : ''}\n\n` +
        `Best regards`
      );

      // Open email client
      setTimeout(() => {
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        setEmailStatus(`${hasPartner ? '2 PDFs' : 'PDF'} downloaded - please attach to email`);
      }, 300);

    } catch (e) {
      console.error('Error preparing email:', e);
      setEmailStatus('Error preparing email');
    }
    setIsGenerating(false);
  };

  return (
    <div className="completed-view">
      <div className="completed-view__header">
        <h3>✅ Taste Profile Complete</h3>
        <p className="completed-view__subtitle">
          {principalName || 'Principal'}'s design preferences have been captured
        </p>
        {location && (
          <p className="completed-view__location">📍 {location}</p>
        )}
      </div>

      {/* Design DNA Summary */}
      <div className="completed-view__dna">
        <h4>Design DNA</h4>
        <div className="dna-label">
          <span className="dna-label__style">{getStyleLabel(metricsP.ct)}</span>
        </div>

        <DesignDNASlider
          label="Style Era"
          value={metricsP.ct}
          leftLabel="Contemporary"
          rightLabel="Traditional"
        />
        <DesignDNASlider
          label="Material Complexity"
          value={metricsP.ml}
          leftLabel="Minimal"
          rightLabel="Layered"
        />
        <DesignDNASlider
          label="Mood Palette"
          value={metricsP.mp}
          leftLabel="Warm"
          rightLabel="Cool"
        />
      </div>

      {/* Partner Alignment Section */}
      {profileP && profileS && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Partner Alignment</h3>
          <p className="kyc-section__group-description">
            Comparison of {principalName || 'Principal'} and {secondaryName || 'Secondary'} preferences.
          </p>

          <div className="partner-comparison">
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

            <div className="comparison-sliders">
              <ComparisonSlider
                label="Style Era"
                valueP={metricsP?.ct}
                valueS={metricsS?.ct}
                leftLabel="Contemporary"
                rightLabel="Traditional"
                principalName={principalName}
                secondaryName={secondaryName}
              />
              <ComparisonSlider
                label="Material Complexity"
                valueP={metricsP?.ml}
                valueS={metricsS?.ml}
                leftLabel="Minimal"
                rightLabel="Layered"
                principalName={principalName}
                secondaryName={secondaryName}
              />
              <ComparisonSlider
                label="Mood Palette"
                valueP={metricsP?.mp}
                valueS={metricsS?.mp}
                leftLabel="Warm"
                rightLabel="Cool"
                principalName={principalName}
                secondaryName={secondaryName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Partner Pending Notice */}
      {profileP && !profileS && (
        <div className="kyc-section__group">
          <div className="partner-pending-notice">
            <span className="partner-pending-notice__icon">◐</span>
            <div>
              <strong>Partner Profile Pending</strong>
              <p>
                Once {secondaryName || 'Secondary'} completes their Taste Exploration,
                a Partner Alignment Analysis will be available.
              </p>
              <button className="refresh-btn refresh-btn--inline" onClick={onRefresh}>
                ↻ Check for Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Buttons */}
      <div className="completed-view__reports">
        <h4>📄 Taste Profile Report</h4>
        <div className="report-buttons">
          <button
            className={`report-btn report-btn--view ${kycComplete ? 'report-btn--complete' : 'report-btn--incomplete'}`}
            onClick={handleViewReport}
            disabled={isGenerating}
          >
            <span className="report-btn__icon">👁️</span>
            <span className="report-btn__text">View Report</span>
          </button>

          <button
            className={`report-btn report-btn--download ${kycComplete ? 'report-btn--complete' : 'report-btn--incomplete'}`}
            onClick={handleDownloadReport}
            disabled={isGenerating}
          >
            <span className="report-btn__icon">📥</span>
            <span className="report-btn__text">Download PDF</span>
          </button>

          <button
            className={`report-btn report-btn--email ${kycComplete ? 'report-btn--complete' : 'report-btn--incomplete'}`}
            onClick={handleEmailReport}
            disabled={isGenerating}
          >
            <span className="report-btn__icon">✉️</span>
            <span className="report-btn__text">Email Report</span>
          </button>
        </div>
        {emailStatus && <p className="report-status">{emailStatus}</p>}
        {isGenerating && <p className="report-status">Generating report...</p>}
      </div>

      {/* Secondary Partner Section */}
      {clientType === 'couple' && (
        <div className="completed-view__partner">
          <h4>Partner Profile</h4>
          {profileS ? (
            <div className="partner-summary">
              <p>✅ {secondaryName || 'Secondary'} has completed their Taste Exploration</p>
              <DesignDNASlider
                label="Style Era"
                value={metricsS.ct}
                leftLabel="Contemporary"
                rightLabel="Traditional"
              />
              <DesignDNASlider
                label="Material Complexity"
                value={metricsS.ml}
                leftLabel="Minimal"
                rightLabel="Layered"
              />
              <DesignDNASlider
                label="Mood Palette"
                value={metricsS.mp}
                leftLabel="Warm"
                rightLabel="Cool"
              />
              <p className="comparison-note">
                Full partner alignment analysis is included in the PDF report above.
              </p>
              <div className="partner-report-buttons" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button
                  className="report-btn report-btn--view"
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      await viewTasteReport(profileS, null, buildReportOptions());
                    } catch (e) {
                      console.error('Error generating report:', e);
                    }
                    setIsGenerating(false);
                  }}
                  disabled={isGenerating}
                >
                  <span className="report-btn__icon">👁️</span>
                  <span className="report-btn__text">View {secondaryName || 'Partner'}'s Report</span>
                </button>
                <button
                  className="report-btn report-btn--download"
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      await downloadTasteReport(profileS, null, buildReportOptions(), secondaryName || 'Partner');
                    } catch (e) {
                      console.error('Error downloading report:', e);
                    }
                    setIsGenerating(false);
                  }}
                  disabled={isGenerating}
                >
                  <span className="report-btn__icon">📥</span>
                  <span className="report-btn__text">Download {secondaryName || 'Partner'}'s PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="partner-pending">
              <p>⏳ Waiting for {secondaryName || 'Secondary'} to complete their Taste Exploration</p>
              <button className="btn-launch-secondary" onClick={onLaunchSecondary}>
                Start {secondaryName || 'Secondary'}'s Exploration
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="completed-view__actions">
        <button
          className={`btn-refresh ${isRefreshing ? 'btn-refresh--loading' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh Profiles'}
        </button>
        {refreshMessage && <span className="refresh-message">{refreshMessage}</span>}
        <button className="btn-retake" onClick={onRetake}>
          ↩️ Retake Exploration
        </button>
      </div>
    </div>
  );
};

// ============================================
// WELCOME VIEW COMPONENT
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
  return (
    <div className="welcome-view">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header__icon">🎨</div>
        <div className="section-header__text">
          <h2>P1.A.5 Design Preferences</h2>
          <p>Discover your client's architectural and interior design aesthetic through the Taste Exploration experience.</p>
        </div>
      </div>

      {/* Architectural Style Reference */}
      <div className="style-reference">
        <h3>Architectural Style Spectrum</h3>
        <p>The 9-point scale from Avant-Contemporary (AS1) to Heritage Estate (AS9):</p>
        <ArchStyleCarousel />
      </div>

      {/* Client Configuration */}
      <div className="client-config">
        <h3>Client Configuration</h3>

        <div className="client-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${clientType === 'individual' ? 'active' : ''}`}
            onClick={() => setClientType('individual')}
          >
            👤 Individual
          </button>
          <button
            type="button"
            className={`toggle-btn ${clientType === 'couple' ? 'active' : ''}`}
            onClick={() => setClientType('couple')}
          >
            👥 Couple
          </button>
        </div>

        <div className="client-names">
          <div className="name-field">
            <label>Family Name</label>
            <input
              type="text"
              value={clientBaseName}
              onChange={(e) => setClientBaseName(e.target.value)}
              placeholder="e.g. Thornwood"
            />
            {clientBaseName && <small>IDs: {clientIdP}{clientType === 'couple' && `, ${clientIdS}`}</small>}
          </div>

          <div className="name-field">
            <label>{clientType === 'couple' ? 'Principal Name' : 'Client Name'}</label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              placeholder="e.g. Peter"
            />
          </div>

          {clientType === 'couple' && (
            <div className="name-field">
              <label>Secondary Name</label>
              <input
                type="text"
                value={secondaryName}
                onChange={(e) => setSecondaryName(e.target.value)}
                placeholder="e.g. Mary"
              />
            </div>
          )}
        </div>
      </div>

      {/* Launch Cards */}
      {clientBaseName && (
        <div className="launch-section">
          <h3>Taste Exploration</h3>
          <p>Launch the visual preference discovery experience for your client(s).</p>

          <div className="profile-cards">
            <ProfileCard
              clientId={clientIdP}
              name={principalName}
              profile={null}
              status={statusP}
              onLaunch={onLaunch}
              isPrimary={true}
            />

            {clientType === 'couple' && (
              <ProfileCard
                clientId={clientIdS}
                name={secondaryName}
                profile={null}
                status={statusS}
                onLaunch={onLaunch}
                isPrimary={false}
              />
            )}
          </div>

          <button className="btn-refresh-small" onClick={onRefresh}>
            🔄 Refresh Status
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const DesignIdentitySection = ({ respondent, tier }) => {
  const { kycData, updateKYCData, calculateCompleteness } = useAppContext();
  const data = kycData[respondent]?.designIdentity || {};

  // Calculate KYC completion for report button styling
  const kycComplete = calculateCompleteness(respondent) === 100;

  // Client configuration state
  const [clientType, setClientType] = useState(data.clientType || 'couple');
  const [clientBaseName, setClientBaseName] = useState(data.clientBaseName || '');
  const [principalName, setPrincipalName] = useState(data.principalName || '');
  const [secondaryName, setSecondaryName] = useState(data.secondaryName || '');

  // Taste profiles from localStorage
  const [profileP, setProfileP] = useState(null);
  const [profileS, setProfileS] = useState(null);
  const [activeExploration, setActiveExploration] = useState(null);

  // Generate client IDs
  const clientIdP = clientBaseName ? `${clientBaseName}-P` : null;
  const clientIdS = clientType === 'couple' && clientBaseName ? `${clientBaseName}-S` : null;

  // Get location from P1.A.3 (Lifestyle Geography Section)
  const getLocationFromKYC = () => {
    const lifestyleData = kycData[respondent]?.lifestyleGeography || {};
    const city = lifestyleData.primaryCity || lifestyleData.city || '';
    const country = lifestyleData.primaryCountry || lifestyleData.country || '';

    if (city && country) {
      return `${city}, ${country}`;
    } else if (city) {
      return city;
    } else if (country) {
      return country;
    }
    return null;
  };

  const location = getLocationFromKYC();

  // Check URL for returned profile data on mount
  useEffect(() => {
    const urlProfile = extractProfileFromURL();
    if (urlProfile && urlProfile.clientId) {
      saveProfileToStorage(urlProfile.clientId, urlProfile);
      window.dispatchEvent(new Event('storage'));
    }
  }, []);

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

  // Listen for storage events
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
  const currentStatus = respondent === 'principal' ? statusP : statusS;
  const showCompletedView = currentStatus === 'complete';

  // Launch Taste Exploration
  const handleLaunch = (who) => {
    const clientId = who === 'principal' ? clientIdP : clientIdS;
    if (!clientId) {
      alert('Please enter a client name first');
      return;
    }
    setActiveExploration(who);
  };

  const handleExplorationComplete = (result) => {
    const clientId = activeExploration === 'principal' ? clientIdP : clientIdS;
    if (result && clientId) {
      saveProfileToStorage(clientId, {
        clientId,
        session: result,
        completedAt: new Date().toISOString()
      });
    }
    refreshProfiles();
    setActiveExploration(null);
  };

  const handleExplorationBack = () => {
    setActiveExploration(null);
  };

  // Handle retake
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

  if (activeExploration) {
    const clientId = activeExploration === 'principal' ? clientIdP : clientIdS;
    const clientName = activeExploration === 'principal' ? principalName : secondaryName;
    return (
      <div className="kyc-section design-identity-section">
        <TasteExploration
          clientId={clientId}
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
          location={location}
          kycData={kycData}
          kycComplete={kycComplete}
          onRetake={handleRetake}
          onRefresh={refreshProfiles}
          onLaunchSecondary={() => handleLaunch(clientIdS)}
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
