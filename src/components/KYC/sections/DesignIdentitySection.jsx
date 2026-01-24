// ============================================
// N4S KYC DESIGN IDENTITY SECTION (P1.A.5)
// Design Preferences with Taste Exploration
// Version 3.0 - Email-based workflow (mirrors P1.A.6)
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Send, Clock, CheckCircle, ExternalLink, Mail, RefreshCw, Users, Palette } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import {
  viewTasteReport,
  downloadTasteReport
} from '../../../utils/TasteReportGenerator';
import TasteExploration from '../../TasteExploration/TasteExploration';
import { quads, categoryOrder } from '../../../data/tasteQuads';

// ============================================
// TEMPORARY DEV FLAG - Set to true to hide completed data for UI design
// Set to false to restore normal behavior
// ============================================
const DEV_HIDE_COMPLETED_DATA = false;

// ============================================
// CONFIGURATION
// ============================================

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

// Get profile status from kycData
const getProfileStatus = (tasteResults) => {
  if (DEV_HIDE_COMPLETED_DATA) return 'not_started'; // DEV: Force pre-completion UI
  if (!tasteResults) return 'not_started';
  if (tasteResults.completedAt) return 'complete';
  return 'not_started';
};

// Get taste exploration status (email workflow)
const getTasteExplorationStatus = (data) => {
  if (DEV_HIDE_COMPLETED_DATA) return 'not_sent'; // DEV: Force pre-completion UI
  return data?.tasteExplorationStatus || 'not_sent';
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
// TASTE EXPLORATION CARD COMPONENT (mirrors LuXeBrief card)
// ============================================

const TasteExplorationCard = ({
  target,
  targetName,
  targetEmail,
  status,
  sentAt,
  completedAt,
  sessionId,
  canSend,
  loading,
  error,
  isConfirmed,
  onConfirm,
  onSend,
  onRefresh,
  onViewReport,
  isCompact = false
}) => {
  return (
    <div className={`luxebrief-card ${isCompact ? 'luxebrief-card--compact' : ''}`}>
      <div className="luxebrief-card__header">
        <span className="luxebrief-card__role">{target === 'principal' ? 'Principal' : 'Secondary'}</span>
        {/* Status Badge - State 4: Completed */}
        {status === 'completed' && (
          <span className="luxebrief-panel__badge luxebrief-panel__badge--complete">
            <CheckCircle size={12} /> Completed
          </span>
        )}
        {/* Status Badge - State 3: Awaiting */}
        {status === 'sent' && (
          <span className="luxebrief-panel__badge luxebrief-panel__badge--pending">
            <Clock size={12} /> Awaiting
          </span>
        )}
        {/* Status Badge - State 2: Ready to Send (Secondary confirmed) */}
        {status === 'not_sent' && isConfirmed && (
          <span className="luxebrief-panel__badge luxebrief-panel__badge--ready">
            Ready to Send
          </span>
        )}
        {/* Toggle Badge - State 1: Complete toggle (Secondary not confirmed) */}
        {status === 'not_sent' && !isConfirmed && target === 'secondary' && canSend && (
          <button
            className="luxebrief-panel__badge luxebrief-panel__badge--toggle"
            onClick={onConfirm}
          >
            <span className="toggle-circle"></span> Complete
          </button>
        )}
      </div>

      {/* Not Sent State */}
      {status === 'not_sent' && (
        <div className="luxebrief-card__content">
          {!canSend ? (
            <div className="luxebrief-panel__notice luxebrief-panel__notice--sm">
              <AlertTriangle size={14} />
              <span>Configure {target === 'principal' ? 'Principal' : 'Secondary'} in Settings</span>
            </div>
          ) : (
            <>
              <div className="luxebrief-card__recipient">
                <span className="luxebrief-card__name">{targetName}</span>
                <span className="luxebrief-card__email">{targetEmail}</span>
              </div>
              {/* State 1: Secondary Not Confirmed - Empty placeholder */}
              {target === 'secondary' && !isConfirmed && (
                <div className="luxebrief-card__placeholder"></div>
              )}
              {/* Principal shows Send directly */}
              {target === 'principal' && (
                <button
                  className="btn btn--primary"
                  onClick={() => onSend(target)}
                  disabled={loading}
                >
                  {loading ? (
                    <><RefreshCw size={14} className="spin" /> Sending...</>
                  ) : (
                    <><Send size={14} /> Send</>
                  )}
                </button>
              )}
              {/* State 2: Secondary Confirmed - Show "Send" button */}
              {target === 'secondary' && isConfirmed && (
                <button
                  className="btn btn--primary"
                  onClick={() => onSend(target)}
                  disabled={loading}
                >
                  {loading ? (
                    <><RefreshCw size={14} className="spin" /> Sending...</>
                  ) : (
                    <><Send size={14} /> Send</>
                  )}
                </button>
              )}
            </>
          )}
          {error && (
            <div className="luxebrief-panel__error luxebrief-panel__error--sm">
              <AlertTriangle size={12} /> {error}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Sent/Awaiting State */}
      {status === 'sent' && (
        <div className="luxebrief-card__content">
          <div className="luxebrief-card__recipient">
            <span className="luxebrief-card__name">{targetName}</span>
            <span className="luxebrief-card__meta">Sent {sentAt ? new Date(sentAt).toLocaleDateString() : ''}</span>
          </div>
          <button
            className="btn btn--secondary"
            onClick={() => onRefresh(target)}
            disabled={loading}
          >
            {loading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
          </button>
        </div>
      )}

      {/* Step 4: Completed State */}
      {status === 'completed' && (
        <div className="luxebrief-card__content">
          <div className="luxebrief-card__recipient">
            <span className="luxebrief-card__name">{targetName}</span>
            <span className="luxebrief-card__meta">Completed {completedAt ? new Date(completedAt).toLocaleDateString() : ''}</span>
          </div>
          <button
            onClick={() => onViewReport(target)}
            className="btn btn--primary"
          >
            <ExternalLink size={14} /> Report
          </button>
        </div>
      )}
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

  // Calculate metrics from profile - USE PROFILE SCORES DIRECTLY
  const getMetrics = (profile) => {
    if (!profile) return { ct: 3, ml: 3, mp: 3 };

    // FIRST: Use converted profile scores from LuXeBrief (new format)
    // These are stored in profile.profile.scores with 1-10 scale
    const scores = profile.profile?.scores;
    if (scores && (scores.tradition !== undefined || scores.warmth !== undefined)) {
      console.log('[METRICS] Using converted profile scores:', scores);
      // Map 1-10 scale to 1-5 scale for display
      return {
        ct: scores.tradition ? scores.tradition / 2 : 2.5,
        ml: scores.formality ? scores.formality / 2 : 2.5,
        mp: scores.warmth ? (10 - scores.warmth) / 2 + 1 : 2.5
      };
    }

    // SECOND: Try old LuXeBrief format (stored directly on profile)
    // Old format: profile.profile = { warmthScore: 65, formalityScore: 55, ... } (1-100 scale)
    const oldProfile = profile.profile;
    if (oldProfile && (oldProfile.warmthScore !== undefined || oldProfile.traditionScore !== undefined)) {
      console.log('[METRICS] Using old LuXeBrief profile format:', oldProfile);
      // Convert 1-100 scale to 1-5 scale for display
      return {
        ct: oldProfile.traditionScore ? oldProfile.traditionScore / 20 : 2.5,
        ml: oldProfile.formalityScore ? oldProfile.formalityScore / 20 : 2.5,
        mp: oldProfile.warmthScore ? (100 - oldProfile.warmthScore) / 20 + 1 : 2.5
      };
    }

    // THIRD: Try even older format where profile IS the scores object directly
    // Format: profile = { warmthScore: 65, ... }
    if (profile.warmthScore !== undefined || profile.traditionScore !== undefined) {
      console.log('[METRICS] Using direct profile scores format:', profile);
      return {
        ct: profile.traditionScore ? profile.traditionScore / 20 : 2.5,
        ml: profile.formalityScore ? profile.formalityScore / 20 : 2.5,
        mp: profile.warmthScore ? (100 - profile.warmthScore) / 20 + 1 : 2.5
      };
    }

    // FALLBACK: Calculate from image codes (for locally-completed sessions)
    console.log('[METRICS] No profile scores found, falling back to image code calculation');

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

  // Debug: Log profile data for Partner Alignment
  console.log('[COMPLETED-VIEW] profileP:', profileP ? { completedAt: profileP.completedAt, hasProfile: !!profileP.profile, hasSelections: !!profileP.selections } : null);
  console.log('[COMPLETED-VIEW] profileS:', profileS ? { completedAt: profileS.completedAt, hasProfile: !!profileS.profile, hasSelections: !!profileS.selections } : null);
  console.log('[COMPLETED-VIEW] metricsP:', metricsP);
  console.log('[COMPLETED-VIEW] metricsS:', metricsS);

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
        await downloadTasteReport(profileS, null, { ...buildReportOptions(), clientName: partnerName }, partnerName);
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
// MAIN COMPONENT
// ============================================

const DesignIdentitySection = ({ respondent, tier }) => {
  const { kycData, updateKYCData, calculateCompleteness, saveNow, clientData } = useAppContext();
  const data = kycData[respondent]?.designIdentity || {};

  // Calculate KYC completion for report button styling
  const kycComplete = calculateCompleteness(respondent) === 100;

  // Loading and error states for taste exploration
  const [tasteLoading, setTasteLoading] = useState({ principal: false, secondary: false });
  const [tasteError, setTasteError] = useState({ principal: null, secondary: null });

  // Track if user has confirmed they want to send Secondary questionnaire
  const [secondaryConfirmed, setSecondaryConfirmed] = useState(false);

  // State for embedded Taste Exploration (fallback mode)
  const [activeExploration, setActiveExploration] = useState(null);

  // Get stakeholder data
  const portfolioContext = kycData.principal?.portfolioContext || {};

  // Check questionnaire respondent preference (from Settings)
  const questionnaireRespondent = portfolioContext.questionnaireRespondent || 'principal_only';
  const isDualRespondent = questionnaireRespondent === 'principal_and_secondary';

  // Get both Principal and Secondary data for dual-respondent mode
  const principalName = `${portfolioContext.principalFirstName || ''} ${portfolioContext.principalLastName || ''}`.trim();
  const principalEmail = portfolioContext.principalEmail;
  const secondaryName = `${portfolioContext.secondaryFirstName || ''} ${portfolioContext.secondaryLastName || ''}`.trim();
  const secondaryEmail = portfolioContext.secondaryEmail;
  const projectName = clientData?.projectName || 'Untitled Project';

  // Get taste exploration status for both respondents
  const principalDesignData = kycData.principal?.designIdentity || {};
  const secondaryDesignData = kycData.secondary?.designIdentity || {};

  // Check if we can send (need name and email)
  const canSendPrincipal = principalName && principalEmail;
  const canSendSecondary = secondaryName && secondaryEmail;

  // Get taste exploration status
  const principalStatus = getTasteExplorationStatus(principalDesignData);
  const secondaryStatus = getTasteExplorationStatus(secondaryDesignData);

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

  // Handle sending Taste Exploration invitation
  const handleSendTasteExploration = async (target) => {
    const targetName = target === 'principal' ? principalName : secondaryName;
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;

    if (!targetName || !targetEmail) return;

    setTasteLoading(prev => ({ ...prev, [target]: true }));
    setTasteError(prev => ({ ...prev, [target]: null }));

    try {
      // Generate subdomain from name (e.g., "Peter Thornwood" → "pthornwood")
      const nameParts = targetName.split(' ');
      const subdomain = nameParts.length >= 2
        ? `${nameParts[0].charAt(0).toLowerCase()}${nameParts[nameParts.length - 1].toLowerCase()}`
        : targetName.toLowerCase().replace(/\s+/g, '');

      // Call LuXeBrief API to create taste session and send email
      const LUXEBRIEF_API = 'https://luxebrief.not-4.sale';
      const ADMIN_TOKEN = 'luxebrief-admin-2024'; // Matches LuXeBrief server/routes.ts

      console.log(`[TASTE-SEND] Sending to: ${targetName} (${targetEmail})`);
      console.log(`[TASTE-SEND] Project: ${projectName}, Subdomain: ${subdomain}, SessionType: taste`);

      const response = await fetch(`${LUXEBRIEF_API}/api/sessions/from-n4s`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify({
          n4sProjectId: clientData?.id || `n4s_${Date.now()}`,
          principalType: target,
          clientName: targetName,
          clientEmail: targetEmail,
          projectName: projectName,
          subdomain: subdomain,
          sessionType: 'taste' // Key: Request taste exploration type
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create session`);
      }

      const result = await response.json();
      console.log(`[TASTE-SEND] Session created:`, result);

      // Data to save for this target
      const tasteData = {
        tasteExplorationStatus: 'sent',
        tasteExplorationSessionId: result.sessionId,
        tasteExplorationAccessToken: result.accessToken,
        tasteExplorationSentAt: new Date().toISOString(),
        tasteExplorationSubdomain: subdomain,
        tasteExplorationInvitationUrl: result.invitationUrl,
        tasteExplorationEmailSent: result.emailSent
      };

      // Update status in KYC data for the target respondent
      updateKYCData(target, 'designIdentity', tasteData);

      // Persist to server immediately with the data (fixes race condition)
      if (saveNow) {
        saveNow({
          kycData: {
            [target]: {
              designIdentity: tasteData
            }
          }
        });
      }

      // Show success/warning based on email status
      if (!result.emailSent) {
        console.warn(`[TASTE-SEND] Email was not sent. Invitation URL: ${result.invitationUrl}`);
      }

    } catch (error) {
      console.error('Taste Exploration send error:', error);
      setTasteError(prev => ({ ...prev, [target]: error.message || 'Failed to send Taste Exploration invitation' }));
    } finally {
      setTasteLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Handle checking Taste Exploration status
  const handleRefreshStatus = async (target) => {
    const targetData = target === 'principal' ? principalDesignData : secondaryDesignData;
    const accessToken = targetData.tasteExplorationAccessToken;
    const sessionId = targetData.tasteExplorationSessionId;

    if (!accessToken && !sessionId) {
      console.log(`[TASTE-REFRESH] No session token found for ${target}`);
      return;
    }

    setTasteLoading(prev => ({ ...prev, [target]: true }));
    try {
      const LUXEBRIEF_API = 'https://luxebrief.not-4.sale';

      console.log(`[TASTE-REFRESH] Checking status for session: ${sessionId}, token: ${accessToken}`);

      // Fetch session status from LuXeBrief
      const response = await fetch(`${LUXEBRIEF_API}/api/taste/session/${accessToken}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch session status: ${response.status}`);
      }

      const sessionData = await response.json();
      console.log(`[TASTE-REFRESH] Session data:`, sessionData);

      // Check if session is completed
      if (sessionData.status === 'completed' || sessionData.profile) {
        // Convert selections array to dictionary format expected by TasteReportGenerator
        // LuXeBrief returns: [{quadId, favorite1, favorite2, leastFavorite}, ...]
        // N4S expects: {quadId: {favorites: [idx, idx], least: idx}, ...}
        const selectionsDict = {};
        if (Array.isArray(sessionData.selections)) {
          sessionData.selections.forEach(sel => {
            if (sel.quadId && !sel.isSkipped) {
              selectionsDict[sel.quadId] = {
                favorites: [sel.favorite1, sel.favorite2].filter(f => f !== null && f !== undefined),
                least: sel.leastFavorite
              };
            }
          });
        }
        console.log(`[TASTE-REFRESH] Converted selections:`, selectionsDict);

        // Convert LuXeBrief profile format to N4S TasteReportGenerator format
        // LuXeBrief stores: { warmthScore: 65, formalityScore: 55, ... } (1-100 scale)
        // N4S expects: { profile: { scores: { warmth: 6.5, formality: 5.5, ... } } } (1-10 scale)
        const luxeProfile = sessionData.profile || {};
        const convertedProfile = {
          scores: {
            warmth: (luxeProfile.warmthScore || 50) / 10,
            formality: (luxeProfile.formalityScore || 50) / 10,
            drama: (luxeProfile.dramaScore || 50) / 10,
            tradition: (luxeProfile.traditionScore || 50) / 10,
            openness: (luxeProfile.opennessScore || 50) / 10,
            art_focus: (luxeProfile.artFocusScore || 50) / 10
          }
        };
        console.log(`[TASTE-REFRESH] Converted profile scores:`, convertedProfile);

        // Update KYC data with completed status and profile
        const tasteData = {
          tasteExplorationStatus: 'completed',
          tasteExplorationCompletedAt: sessionData.completedAt || new Date().toISOString(),
          // Store the profile results for use in reports
          [`${target}TasteResults`]: {
            completedAt: sessionData.completedAt || new Date().toISOString(),
            profile: convertedProfile,  // Converted to N4S format with nested scores
            selections: selectionsDict  // Store as dictionary for TasteReportGenerator
          }
        };

        updateKYCData(target, 'designIdentity', tasteData);

        if (saveNow) {
          saveNow({
            kycData: {
              [target]: {
                designIdentity: tasteData
              }
            }
          });
        }

        console.log(`[TASTE-REFRESH] Session completed! Profile saved.`);
      } else {
        console.log(`[TASTE-REFRESH] Session still in progress. Status: ${sessionData.status}`);
      }

    } catch (error) {
      console.error('Status refresh error:', error);
      setTasteError(prev => ({ ...prev, [target]: error.message || 'Failed to check status' }));
    } finally {
      setTasteLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Handle viewing report
  const handleViewReport = (target) => {
    const targetData = target === 'principal' ? principalDesignData : secondaryDesignData;
    const tasteResults = targetData.principalTasteResults || targetData.secondaryTasteResults;

    if (tasteResults) {
      viewTasteReport(tasteResults, null, { location, kycData });
    }
  };

  // Get completed profiles for CompletedView
  // Principal results are stored in principalDesignData.principalTasteResults
  // Secondary results are stored in secondaryDesignData (from kycData.secondary.designIdentity)
  const profileP = principalDesignData.principalTasteResults;
  // Secondary taste results come from secondary's own designIdentity data
  const profileS = secondaryDesignData?.principalTasteResults || secondaryDesignData?.secondaryTasteResults || null;

  // Debug: Log profile data
  console.log('[DESIGN-IDENTITY] profileP:', profileP ? { completedAt: profileP.completedAt } : null);
  console.log('[DESIGN-IDENTITY] profileS:', profileS ? { completedAt: profileS.completedAt } : null);
  console.log('[DESIGN-IDENTITY] secondaryDesignData keys:', Object.keys(secondaryDesignData || {}));

  // Determine if we should show completed view
  const principalComplete = profileP?.completedAt && !DEV_HIDE_COMPLETED_DATA;
  const secondaryComplete = profileS?.completedAt && !DEV_HIDE_COMPLETED_DATA;
  const showCompletedView = principalComplete;

  // Handle retake
  const handleRetake = () => {
    if (window.confirm('This will reset your Taste Exploration results. Are you sure?')) {
      // Clear kycData taste results (syncs to backend)
      console.log('[TASTE-RESET] Clearing taste results from kycData');
      updateKYCData('principal', 'designIdentity', {
        principalTasteResults: null,
        secondaryTasteResults: null,
        tasteExplorationStatus: 'not_sent',
        tasteExplorationSessionId: null,
        tasteExplorationSentAt: null,
        tasteExplorationCompletedAt: null
      });
      updateKYCData('secondary', 'designIdentity', {
        tasteExplorationStatus: 'not_sent',
        tasteExplorationSessionId: null,
        tasteExplorationSentAt: null,
        tasteExplorationCompletedAt: null
      });
    }
  };

  // Refresh profiles callback for CompletedView - actually re-fetch from LuXeBrief
  const refreshProfiles = useCallback(() => {
    console.log('[TASTE-REFRESH] Re-fetching profiles from LuXeBrief');
    // Re-fetch from LuXeBrief to get fresh data with proper format conversion
    handleRefreshStatus('principal');
    if (isDualRespondent) {
      handleRefreshStatus('secondary');
    }
  }, [isDualRespondent]);

  // REMOVED: Early return that replaced entire layout
  // CompletedView now shows BELOW the questionnaire panel, not instead of it

  // Main view - always shows questionnaire panel, plus CompletedView when principal is done
  return (
    <div className="kyc-section design-identity-section">
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

      {/* Taste Exploration Panel (mirrors LuXeBrief panel) */}
      <div className="kyc-section__group luxebrief-panel">
        <div className="luxebrief-panel__header">
          <div className="luxebrief-panel__title">
            <Palette size={20} />
            <h3>Taste Exploration Questionnaire</h3>
          </div>
          {isDualRespondent && (
            <span className="luxebrief-panel__mode-badge">
              <Users size={14} /> Principal + Secondary
            </span>
          )}
        </div>

        <p className="luxebrief-panel__description">
          {isDualRespondent
            ? 'Send visual preference questionnaires to both Principal and Secondary for individual insights into their architectural and interior design tastes.'
            : `Send a visual preference questionnaire to ${principalName || 'the client'} to discover their architectural and interior design aesthetic.`
          }
        </p>

        {/* Dual Respondent Mode - Show two cards side by side */}
        {isDualRespondent ? (
          <div className="luxebrief-panel__dual-cards">
            <TasteExplorationCard
              target="principal"
              targetName={principalName}
              targetEmail={principalEmail}
              status={principalStatus}
              sentAt={principalDesignData.tasteExplorationSentAt}
              completedAt={principalDesignData.tasteExplorationCompletedAt}
              sessionId={principalDesignData.tasteExplorationSessionId}
              canSend={canSendPrincipal}
              loading={tasteLoading.principal}
              error={tasteError.principal}
              isConfirmed={true}
              onConfirm={() => {}}
              onSend={handleSendTasteExploration}
              onRefresh={handleRefreshStatus}
              onViewReport={handleViewReport}
              isCompact={true}
            />
            <TasteExplorationCard
              target="secondary"
              targetName={secondaryName}
              targetEmail={secondaryEmail}
              status={secondaryStatus}
              sentAt={secondaryDesignData.tasteExplorationSentAt}
              completedAt={secondaryDesignData.tasteExplorationCompletedAt}
              sessionId={secondaryDesignData.tasteExplorationSessionId}
              canSend={canSendSecondary}
              loading={tasteLoading.secondary}
              error={tasteError.secondary}
              isConfirmed={secondaryConfirmed}
              onConfirm={() => setSecondaryConfirmed(true)}
              onSend={handleSendTasteExploration}
              onRefresh={handleRefreshStatus}
              onViewReport={handleViewReport}
              isCompact={true}
            />
          </div>
        ) : (
          /* Single Respondent Mode */
          <>
            {/* Not Sent State */}
            {principalStatus === 'not_sent' && (
              <div className="luxebrief-panel__actions">
                {!canSendPrincipal ? (
                  <div className="luxebrief-panel__notice">
                    <AlertTriangle size={16} />
                    <span>
                      Please configure Principal name and email in <strong>Settings</strong> before sending.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="luxebrief-panel__recipient">
                      <span className="luxebrief-panel__recipient-label">Send to:</span>
                      <span className="luxebrief-panel__recipient-value">{principalName}</span>
                      <span className="luxebrief-panel__recipient-email">{principalEmail}</span>
                    </div>
                    <button
                      className="btn btn--primary luxebrief-panel__send-btn"
                      onClick={() => handleSendTasteExploration('principal')}
                      disabled={tasteLoading.principal}
                    >
                      {tasteLoading.principal ? (
                        <>
                          <RefreshCw size={16} className="spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Send Taste Exploration
                        </>
                      )}
                    </button>
                  </>
                )}
                {tasteError.principal && (
                  <div className="luxebrief-panel__error">
                    <AlertTriangle size={14} /> {tasteError.principal}
                  </div>
                )}
              </div>
            )}

            {/* Sent State */}
            {principalStatus === 'sent' && (
              <div className="luxebrief-panel__status">
                <div className="luxebrief-panel__status-info">
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Sent to:</span>
                    <span>{principalName} ({principalEmail})</span>
                  </div>
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Sent:</span>
                    <span>{principalDesignData.tasteExplorationSentAt ? new Date(principalDesignData.tasteExplorationSentAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                  {principalDesignData.tasteExplorationSubdomain && (
                    <div className="luxebrief-panel__status-row">
                      <span className="luxebrief-panel__status-label">Link:</span>
                      <span className="luxebrief-panel__link-placeholder">
                        Taste Exploration site coming soon (ITR-002)
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleRefreshStatus('principal')}
                  disabled={tasteLoading.principal}
                >
                  {tasteLoading.principal ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                  Check Status
                </button>
              </div>
            )}

            {/* Completed State */}
            {principalStatus === 'completed' && (
              <div className="luxebrief-panel__status luxebrief-panel__status--complete">
                <div className="luxebrief-panel__status-info">
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Completed by:</span>
                    <span>{principalName}</span>
                  </div>
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Completed:</span>
                    <span>{principalDesignData.tasteExplorationCompletedAt ? new Date(principalDesignData.tasteExplorationCompletedAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleViewReport('principal')}
                  className="btn btn--primary btn--sm"
                >
                  <ExternalLink size={14} /> View Report
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dev Mode Notice */}
      {DEV_HIDE_COMPLETED_DATA && (
        <div className="kyc-section__group" style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '16px' }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            <strong>⚠️ DEV MODE:</strong> Completed taste data is hidden. Set <code>DEV_HIDE_COMPLETED_DATA = false</code> to restore.
          </p>
        </div>
      )}

      {/* Taste Profile Complete - Shows BELOW questionnaire panel when Principal is complete */}
      {principalComplete && (
        <CompletedView
          profileP={profileP}
          profileS={profileS}
          clientType={isDualRespondent ? 'couple' : 'individual'}
          principalName={principalName || portfolioContext.principalFirstName || 'Principal'}
          secondaryName={secondaryName || portfolioContext.secondaryFirstName || 'Secondary'}
          location={location}
          kycData={kycData}
          kycComplete={kycComplete}
          onRetake={handleRetake}
          onRefresh={refreshProfiles}
          onLaunchSecondary={() => handleSendTasteExploration('secondary')}
        />
      )}
    </div>
  );
};

export default DesignIdentitySection;
