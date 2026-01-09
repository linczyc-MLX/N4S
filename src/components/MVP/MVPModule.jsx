import React, { useMemo, useState } from 'react';
import {
  ClipboardCheck, AlertTriangle, CheckCircle2, XCircle,
  Home, Users, Dumbbell, LayoutGrid, RefreshCw,
  Building, Layers, ArrowRight, Palette, FileText, Sparkles
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import BriefingBuilderView from './BriefingBuilderView';
import AdjacencyPersonalizationView from './AdjacencyPersonalizationView';
import {
  transformKYCToMVPBrief,
  getMVPBriefSummary,
  countSelectedAmenities,
  transformFYIToMVPProgram,
  getFYIProgramSummary
} from '../../lib/mvp-bridge';
import { quads, categoryOrder } from '../../data/tasteQuads';

// ============================================
// TASTE PROFILE INTEGRATION
// ============================================
// Taste profiles are now stored in kycData.principal.designIdentity
// as principalTasteResults and secondaryTasteResults, synced to backend

// ============================================
// STYLE ERA CALCULATION (matches Report algorithm)
// ============================================

// Extract AS/VD/MP codes from image filename
function extractCodesFromFilename(imageUrl) {
  if (!imageUrl) return null;
  const filename = imageUrl.split('/').pop();
  const asMatch = filename.match(/AS(\d)/);
  if (!asMatch) return null;
  return { as: parseInt(asMatch[1]) };
}

// Normalize 1-9 scale to 1-5 scale
function normalize9to5(value) {
  return ((value - 1) / 8) * 4 + 1;
}

// Get selection for a category from profile
function getSelectionForCategory(profile, categoryId) {
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
}

// Calculate styleEra from profile selections (same algorithm as Report)
function calculateStyleEraFromProfile(profile) {
  if (!profile) return null;

  let totalStyleEra = 0;
  let count = 0;

  categoryOrder.forEach(categoryId => {
    const imageUrl = getSelectionForCategory(profile, categoryId);
    if (imageUrl) {
      const codes = extractCodesFromFilename(imageUrl);
      if (codes) {
        totalStyleEra += normalize9to5(codes.as);
        count++;
      }
    }
  });

  return count > 0 ? totalStyleEra / count : null;
}

// Get style direction label from styleEra (1-5 scale, matches Report)
function getStyleDirection(styleEra) {
  if (!styleEra) return 'Not assessed';
  if (styleEra < 2.5) return 'Contemporary';
  if (styleEra <= 3.5) return 'Transitional';
  return 'Traditional';
}

// Get formality label
function getFormalityLabel(formalityScore) {
  if (!formalityScore) return 'Not assessed';
  if (formalityScore <= 3) return 'Casual / Relaxed';
  if (formalityScore <= 5) return 'Relaxed Elegance';
  if (formalityScore <= 7) return 'Refined';
  return 'Formal';
}

// Get warmth label
function getWarmthLabel(warmthScore) {
  if (!warmthScore) return 'Not assessed';
  if (warmthScore <= 3) return 'Cool / Crisp';
  if (warmthScore <= 5) return 'Balanced';
  if (warmthScore <= 7) return 'Warm';
  return 'Very Warm';
}

// ============================================
// DESIGN DNA SLIDER COMPONENT
// ============================================

const DesignDNASlider = ({ label, value, leftLabel, rightLabel }) => {
  const percentage = value ? ((value - 1) / 9) * 100 : 50;

  return (
    <div className="mvp-dna-slider">
      <div className="mvp-dna-slider__header">
        <span className="mvp-dna-slider__label">{label}</span>
        <span className="mvp-dna-slider__value">{value ? value.toFixed(1) : '—'}</span>
      </div>
      <div className="mvp-dna-slider__track-row">
        <span className="mvp-dna-slider__endpoint">{leftLabel}</span>
        <div className="mvp-dna-slider__track">
          <div className="mvp-dna-slider__fill" style={{ width: `${percentage}%` }} />
          <div className="mvp-dna-slider__thumb" style={{ left: `${percentage}%` }} />
        </div>
        <span className="mvp-dna-slider__endpoint">{rightLabel}</span>
      </div>
    </div>
  );
};

// ============================================
// FYI SPACE PROGRAM DISPLAY COMPONENT
// ============================================

const FYISpaceProgramCard = ({ fyiProgram, fyiSummary }) => {
  const [expanded, setExpanded] = useState(false);
  const [showStructures, setShowStructures] = useState(true);

  if (!fyiProgram || !fyiSummary) return null;

  const deltaColor = fyiSummary.totals.delta > 0 ? 'text-amber-600' :
                     fyiSummary.totals.delta < -500 ? 'text-red-600' : 'text-green-600';

  // Check if we have multiple structures
  const hasMultipleStructures = fyiSummary.structures.length > 1;

  return (
    <div className="mvp-card mvp-card--full mvp-card--fyi">
      <div className="mvp-card__header">
        <LayoutGrid size={20} className="mvp-card__icon" />
        <h3 className="mvp-card__title">FYI Space Program</h3>
        <span className="mvp-card__status mvp-card__status--live">
          <RefreshCw size={12} className="animate-spin-slow" />
          LIVE
        </span>
      </div>
      <div className="mvp-card__content">
        {/* Structure Breakdown - matches FYI sidebar exactly */}
        <div className="fyi-structures">
          {fyiSummary.structures.map((structure, idx) => (
            <div key={structure.key} className={`fyi-structure ${idx === 0 ? 'fyi-structure--main' : ''}`}>
              <div className="fyi-structure__header">
                <span className="fyi-structure__name">{structure.name}</span>
                <span className="fyi-structure__total">{structure.totalSF.toLocaleString()} SF</span>
              </div>
              <div className="fyi-structure__details">
                <div className="fyi-structure__row">
                  <span>Net Program</span>
                  <span>{structure.netSF.toLocaleString()} SF</span>
                </div>
                {structure.hasCirculation && (
                  <div className="fyi-structure__row fyi-structure__row--indent">
                    <span>Circulation ({fyiSummary.totals.circulationPct}%)</span>
                    <span>{structure.circulationSF.toLocaleString()} SF</span>
                  </div>
                )}
                {structure.byLevel && showStructures && Object.keys(structure.byLevel).length > 0 && (
                  <div className="fyi-structure__levels">
                    <div className="fyi-structure__levels-label">BY LEVEL</div>
                    {Object.entries(structure.byLevel)
                      .sort(([a], [b]) => parseInt(b) - parseInt(a))
                      .map(([level, sf]) => (
                        <div key={level} className="fyi-structure__row fyi-structure__row--level">
                          <span>{level === '1' ? 'L1 (Arrival)' : `L${level}`}</span>
                          <span>{sf.toLocaleString()} SF</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total Box - matches FYI navy/gold box */}
        <div className="fyi-grand-total">
          <div className="fyi-grand-total__row fyi-grand-total__row--main">
            <span>Grand Total</span>
            <span>{fyiSummary.totals.totalSF.toLocaleString()} SF</span>
          </div>
          <div className={`fyi-grand-total__row fyi-grand-total__row--delta ${deltaColor}`}>
            <span>Delta from Target</span>
            <span>{fyiSummary.totals.delta > 0 ? '+' : ''}{fyiSummary.totals.delta.toLocaleString()} SF</span>
          </div>
          <div className="fyi-grand-total__row fyi-grand-total__row--outdoor">
            <span>Outdoor (not conditioned)</span>
            <span>{fyiSummary.totals.outdoorSF.toLocaleString()} SF</span>
          </div>
        </div>

        {/* Counts Row */}
        <div className="fyi-program-counts">
          <span className="fyi-count-chip">
            <strong>{fyiSummary.counts.bedrooms}</strong> Bedrooms
          </span>
          <span className="fyi-count-chip">
            <strong>{fyiSummary.counts.wellness}</strong> Wellness
          </span>
          <span className="fyi-count-chip">
            <strong>{fyiSummary.counts.entertainment}</strong> Entertainment
          </span>
        </div>

        {/* Zone Breakdown (expandable) */}
        <button
          className="fyi-expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show'} Zone Details ({fyiSummary.zones.length} zones)
        </button>

        {expanded && (
          <div className="fyi-program-zones">
            {fyiSummary.zones.map(zone => (
              <div key={zone.name} className="fyi-zone-row">
                <span className="fyi-zone-name">{zone.name}</span>
                <span className="fyi-zone-count">{zone.spaceCount} spaces</span>
                <span className="fyi-zone-sf">{zone.totalSF.toLocaleString()} SF</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN MVP MODULE COMPONENT
// ============================================

const MVPModule = () => {
  // ============================================
  // CONTEXT ACCESS - LIVE DATA
  // ============================================
  // CRITICAL: Both kycData and fyiData come directly from context.
  // Any changes to these in other modules trigger re-render here.
  const { kycData, fyiData, activeRespondent } = useAppContext();

  const [showRawData, setShowRawData] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'builder'

  // Get design identity config from KYC
  const designIdentity = kycData[activeRespondent]?.designIdentity || {};
  const clientBaseName = designIdentity.clientBaseName || '';
  const clientType = designIdentity.clientType || 'individual';
  const principalName = designIdentity.principalName || '';
  const secondaryName = designIdentity.secondaryName || '';

  // Generate client IDs (still needed for display purposes)
  const clientIdP = clientBaseName ? `${clientBaseName}-P` : null;
  const clientIdS = clientType === 'couple' && clientBaseName ? `${clientBaseName}-S` : null;

  // Load taste profiles from kycData (synced to backend)
  const principalDesignIdentity = kycData?.principal?.designIdentity || {};

  // Normalize taste profile data to expected format
  const tasteProfileP = useMemo(() => {
    const data = principalDesignIdentity.principalTasteResults;
    if (!data || !data.selections) return null;
    return {
      clientId: data.clientId || clientIdP,
      session: data,
      selections: data.selections,
      profile: data.profile,
      completedAt: data.completedAt
    };
  }, [principalDesignIdentity.principalTasteResults, clientIdP]);

  const tasteProfileS = useMemo(() => {
    const data = principalDesignIdentity.secondaryTasteResults;
    if (!data || !data.selections) return null;
    return {
      clientId: data.clientId || clientIdS,
      session: data,
      selections: data.selections,
      profile: data.profile,
      completedAt: data.completedAt
    };
  }, [principalDesignIdentity.secondaryTasteResults, clientIdS]);

  // Extract scores from profiles
  const scoresP = tasteProfileP?.profile?.scores || {};
  const materialsP = tasteProfileP?.profile?.topMaterials || [];

  // Always use principal's scores only - partner data is for divergence analysis only
  const combinedScores = useMemo(() => {
    return scoresP || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(scoresP)]);

  // Calculate styleEra from selections (matches Report algorithm)
  const styleEraP = useMemo(() => {
    return calculateStyleEraFromProfile(tasteProfileP);
  }, [tasteProfileP]);

  const styleEraS = useMemo(() => {
    return calculateStyleEraFromProfile(tasteProfileS);
  }, [tasteProfileS]);

  // ============================================
  // FYI DATA - LIVE TRANSFORMATION
  // ============================================
  // CRITICAL: This useMemo has fyiData as dependency.
  // When fyiData changes (any FYI edit), this recomputes IMMEDIATELY.
  // NO COPIES, NO SNAPSHOTS - direct context reference.
  const fyiProgram = useMemo(() => {
    return transformFYIToMVPProgram(fyiData);
  }, [fyiData]);

  // FYI summary for display
  const fyiSummary = useMemo(() => {
    return getFYIProgramSummary(fyiProgram);
  }, [fyiProgram]);

  // Flag: Do we have FYI data?
  const hasFYIData = !!fyiProgram;

  // ============================================
  // KYC DATA - FALLBACK WHEN NO FYI
  // ============================================
  // Transform KYC data to MVP brief inputs
  const briefInputs = useMemo(() => {
    return transformKYCToMVPBrief(kycData, activeRespondent);
  }, [kycData, activeRespondent]);

  // Get summary for display
  const summary = useMemo(() => {
    return getMVPBriefSummary(briefInputs);
  }, [briefInputs]);

  // Count amenities for tier estimation
  const amenityCount = useMemo(() => {
    return countSelectedAmenities(briefInputs);
  }, [briefInputs]);

  // ============================================
  // TIER ESTIMATION
  // ============================================
  // Use FYI data if available, otherwise estimate from KYC amenities
  const estimatedTier = useMemo(() => {
    if (hasFYIData && fyiProgram?.settings?.programTier) {
      const tier = fyiProgram.settings.programTier;
      if (tier === '20k') return { tier: '20K', label: 'Estate (20,000 SF)', color: 'gold' };
      if (tier === '15k') return { tier: '15K', label: 'Grand (15,000 SF)', color: 'teal' };
      if (tier === '10k') return { tier: '10K', label: 'Signature (10,000 SF)', color: 'blue' };
    }
    // Fallback to amenity-based estimation
    if (amenityCount >= 12) return { tier: '20K+', label: 'Estate (20,000+ SF)', color: 'gold' };
    if (amenityCount >= 8) return { tier: '15K', label: 'Grand (15,000 SF)', color: 'teal' };
    if (amenityCount >= 4) return { tier: '10K', label: 'Signature (10,000 SF)', color: 'blue' };
    return { tier: 'Custom', label: 'Custom Compact', color: 'gray' };
  }, [hasFYIData, fyiProgram, amenityCount]);

  // Check if taste exploration is complete
  const hasTasteProfile = !!tasteProfileP;
  const hasBothProfiles = clientType === 'couple' ? (!!tasteProfileP && !!tasteProfileS) : !!tasteProfileP;

  // Derive project info for BriefingBuilderView
  const projectId = clientBaseName || 'project-001';
  const projectName = kycData[activeRespondent]?.projectParameters?.projectName || 'New Project';

  // If in personalization mode, show Adjacency Personalization
  if (viewMode === 'personalization') {
    return (
      <AdjacencyPersonalizationView
        kycData={kycData}
        mvpData={briefInputs}
        fyiProgram={fyiProgram}
        tasteProfile={tasteProfileP}
        projectId={projectId}
        projectName={projectName}
        onBack={() => setViewMode('overview')}
        onComplete={(result) => {
          console.log('Personalization result:', result);
          setViewMode('overview');
        }}
        onViewDiagram={() => {
          setViewMode('builder');
        }}
      />
    );
  }

  // If in builder mode, show Briefing Builder
  if (viewMode === 'builder') {
    return (
      <BriefingBuilderView
        kycData={kycData}
        mvpData={briefInputs}
        fyiProgram={fyiProgram}
        tasteProfile={tasteProfileP}
        projectId={projectId}
        projectName={projectName}
        onBack={() => setViewMode('overview')}
        onSave={(brief) => {
          console.log('Brief saved:', brief);
          setViewMode('overview');
        }}
      />
    );
  }

  if (!briefInputs) {
    return (
      <div className="mvp-module">
        <div className="mvp-module__empty">
          <ClipboardCheck size={48} className="mvp-module__empty-icon" />
          <h2>No KYC Data Available</h2>
          <p>Complete the KYC module first to generate your MVP brief.</p>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ active, label }) => (
    <span className={`status-badge ${active ? 'status-badge--active' : 'status-badge--inactive'}`}>
      {active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {label}
    </span>
  );

  const SectionCard = ({ title, icon: Icon, children, status, fullWidth }) => (
    <div className={`mvp-card ${fullWidth ? 'mvp-card--full' : ''}`}>
      <div className="mvp-card__header">
        <Icon size={20} className="mvp-card__icon" />
        <h3 className="mvp-card__title">{title}</h3>
        {status && <span className={`mvp-card__status mvp-card__status--${status}`}>{status}</span>}
      </div>
      <div className="mvp-card__content">
        {children}
      </div>
    </div>
  );

  return (
    <div className="mvp-module">
      {/* Header */}
      <div className="mvp-module__header">
        <div className="mvp-module__title-group">
          <h1 className="mvp-module__title">
            <ClipboardCheck size={28} />
            Mansion Validation Program
          </h1>
          <p className="mvp-module__subtitle">
            {hasFYIData ? (
              <>Space program from FYI • <span className="text-green-600 font-medium">LIVE</span></>
            ) : (
              <>Area program derived from KYC inputs • {activeRespondent.charAt(0).toUpperCase() + activeRespondent.slice(1)} respondent</>
            )}
          </p>
        </div>

        {/* Tier Estimate Badge */}
        <div className={`mvp-tier-badge mvp-tier-badge--${estimatedTier.color}`}>
          <span className="mvp-tier-badge__tier">{estimatedTier.tier}</span>
          <span className="mvp-tier-badge__label">{estimatedTier.label}</span>
        </div>
      </div>

      {/* ============================================ */}
      {/* FYI SPACE PROGRAM - LIVE DATA */}
      {/* ============================================ */}
      {hasFYIData ? (
        <FYISpaceProgramCard fyiProgram={fyiProgram} fyiSummary={fyiSummary} />
      ) : (
        /* No FYI Data - Show prompt */
        <div className="mvp-card mvp-card--full mvp-card--fyi-empty">
          <div className="mvp-card__header">
            <LayoutGrid size={20} className="mvp-card__icon" />
            <h3 className="mvp-card__title">Space Program</h3>
            <span className="mvp-card__status mvp-card__status--pending">Not Started</span>
          </div>
          <div className="mvp-card__content">
            <div className="fyi-empty-prompt">
              <p>Complete the FYI module to confirm your space program.</p>
              <p className="fyi-empty-hint">
                The space program will appear here with LIVE updates as you make selections in FYI.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats - Show FYI or KYC-derived */}
      <div className="mvp-stats-row">
        <div className="mvp-stat">
          <span className="mvp-stat__value">
            {hasFYIData ? fyiSummary.counts.bedrooms : (summary?.household.totalBedrooms || 0)}
          </span>
          <span className="mvp-stat__label">Bedrooms</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">
            {hasFYIData ? fyiSummary.totals.spaces : (summary?.household.guestBedrooms || 0)}
          </span>
          <span className="mvp-stat__label">{hasFYIData ? 'Total Spaces' : 'Guest Suites'}</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">
            {hasFYIData ? fyiSummary.counts.wellness : amenityCount}
          </span>
          <span className="mvp-stat__label">{hasFYIData ? 'Wellness' : 'Amenities'}</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">{summary?.propertyConfig.levels || 2}</span>
          <span className="mvp-stat__label">Levels</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">{summary?.propertyConfig.basement === 'Yes' ? '+B' : '—'}</span>
          <span className="mvp-stat__label">Basement</span>
        </div>
      </div>

      {/* ============================================ */}
      {/* DESIGN PREFERENCES FROM TASTE EXPLORATION */}
      {/* ============================================ */}
      <div className="mvp-card mvp-card--full mvp-card--design">
        <div className="mvp-card__header">
          <Palette size={20} className="mvp-card__icon" />
          <h3 className="mvp-card__title">Design Preferences</h3>
          <span className={`mvp-card__status mvp-card__status--${hasTasteProfile ? 'complete' : 'pending'}`}>
            {hasTasteProfile ? (hasBothProfiles ? 'Complete' : 'Principal Only') : 'Not Started'}
          </span>
        </div>
        <div className="mvp-card__content">
          {hasTasteProfile ? (
            <>
              {/* Style Direction Summary */}
              <div className="mvp-design-summary">
                <div className="mvp-design-summary__item">
                  <span className="mvp-design-summary__label">Style Direction</span>
                  <span className="mvp-design-summary__value mvp-design-summary__value--highlight">
                    {getStyleDirection(styleEraP)}
                  </span>
                </div>
                <div className="mvp-design-summary__item">
                  <span className="mvp-design-summary__label">Formality</span>
                  <span className="mvp-design-summary__value">
                    {getFormalityLabel(combinedScores?.formality)}
                  </span>
                </div>
                <div className="mvp-design-summary__item">
                  <span className="mvp-design-summary__label">Mood</span>
                  <span className="mvp-design-summary__value">
                    {getWarmthLabel(combinedScores?.warmth)}
                  </span>
                </div>
              </div>

              {/* Design DNA Sliders */}
              <div className="mvp-design-dna">
                <h4 className="mvp-design-dna__title">
                  Design DNA {clientType === 'couple' && hasBothProfiles ? '(Combined)' : ''}
                </h4>
                <div className="mvp-design-dna__sliders">
                  <DesignDNASlider
                    label="Tradition"
                    value={styleEraP ? (styleEraP - 1) * 2.25 + 1 : null}
                    leftLabel="Contemporary"
                    rightLabel="Traditional"
                  />
                  <DesignDNASlider
                    label="Formality"
                    value={combinedScores?.formality}
                    leftLabel="Casual"
                    rightLabel="Formal"
                  />
                  <DesignDNASlider
                    label="Warmth"
                    value={combinedScores?.warmth}
                    leftLabel="Cool"
                    rightLabel="Warm"
                  />
                  <DesignDNASlider
                    label="Drama"
                    value={combinedScores?.drama}
                    leftLabel="Subtle"
                    rightLabel="Bold"
                  />
                  <DesignDNASlider
                    label="Openness"
                    value={combinedScores?.openness}
                    leftLabel="Enclosed"
                    rightLabel="Open"
                  />
                  <DesignDNASlider
                    label="Art Focus"
                    value={combinedScores?.art_focus}
                    leftLabel="Understated"
                    rightLabel="Gallery-like"
                  />
                </div>
              </div>

              {/* Material Affinities */}
              {materialsP.length > 0 && (
                <div className="mvp-design-materials">
                  <h4 className="mvp-design-materials__title">Material Affinities</h4>
                  <div className="mvp-design-materials__chips">
                    {materialsP.map((material, idx) => (
                      <span key={idx} className="mvp-material-chip">
                        {material.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Partner Comparison (if couple with both profiles) */}
              {clientType === 'couple' && hasBothProfiles && (
                <div className="mvp-design-comparison">
                  <h4 className="mvp-design-comparison__title">Partner Alignment</h4>
                  <div className="mvp-design-comparison__grid">
                    <div className="mvp-design-comparison__col">
                      <span className="mvp-design-comparison__name">{principalName || 'Principal'}</span>
                      <span className="mvp-design-comparison__style">{getStyleDirection(styleEraP)}</span>
                    </div>
                    <div className="mvp-design-comparison__col">
                      <span className="mvp-design-comparison__name">{secondaryName || 'Secondary'}</span>
                      <span className="mvp-design-comparison__style">{getStyleDirection(styleEraS)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Partner Notice */}
              {clientType === 'couple' && !hasBothProfiles && (
                <div className="mvp-design-pending">
                  <AlertTriangle size={16} />
                  <span>{secondaryName || 'Secondary'} has not completed Taste Exploration. Combined scores will update when both partners complete.</span>
                </div>
              )}
            </>
          ) : (
            <div className="mvp-design-empty">
              <Palette size={32} className="mvp-design-empty__icon" />
              <p>Design preferences will appear here after completing Taste Exploration in the KYC module.</p>
              <p className="mvp-design-empty__hint">Navigate to KYC → Design Preferences to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid - KYC Summary (shown regardless of FYI status) */}
      <div className="mvp-grid">
        {/* Property Configuration */}
        <SectionCard title="Property Configuration" icon={Building}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">SF Constraint</span>
              <span className="mvp-field__value">{summary?.propertyConfig.sfCap}</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Basement</span>
              <span className="mvp-field__value">{summary?.propertyConfig.basement}</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Levels</span>
              <span className="mvp-field__value">{summary?.propertyConfig.levels}</span>
            </div>
          </div>
        </SectionCard>

        {/* Household */}
        <SectionCard title="Household Composition" icon={Users}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">Bedrooms</span>
              <span className="mvp-field__value">{summary?.household.totalBedrooms} total ({summary?.household.guestBedrooms} guest)</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Children</span>
              <span className="mvp-field__value">
                {summary?.household.childrenCount > 0 ? summary.household.childrenCount : 'None'}
              </span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">School-Age</span>
              <StatusBadge active={summary?.household.hasSchoolAge} label={summary?.household.hasSchoolAge ? 'Yes' : 'No'} />
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Pets</span>
              {summary?.household.hasPets ? (
                <span className="mvp-field__value mvp-field__value--small">{summary?.household.petsDescription}</span>
              ) : (
                <StatusBadge active={false} label="None" />
              )}
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Staffing</span>
              <span className="mvp-field__value mvp-field__value--small">
                {(summary?.household.staffing || 'none').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Lifestyle */}
        <SectionCard title="Lifestyle" icon={Home}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">Entertaining</span>
              <span className="mvp-field__value">{summary?.lifestyle.entertaining || 'Rare'}</span>
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Formal Dining</span>
              <StatusBadge active={summary?.lifestyle.formalEntertaining} label={summary?.lifestyle.formalEntertaining ? 'Required' : 'Optional'} />
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Work From Home</span>
              <StatusBadge active={summary?.lifestyle.workFromHome} label={summary?.lifestyle.workFromHome ? 'Yes' : 'No'} />
            </div>
            <div className="mvp-field">
              <span className="mvp-field__label">Late Night Media</span>
              <StatusBadge active={summary?.lifestyle.lateNightMedia} label={summary?.lifestyle.lateNightMedia ? 'Yes' : 'No'} />
            </div>
          </div>
        </SectionCard>

        {/* Wellness */}
        <SectionCard title="Wellness Program" icon={Dumbbell}>
          <div className="mvp-field-list">
            <div className="mvp-field">
              <span className="mvp-field__label">Program Tier</span>
              <span className="mvp-field__value mvp-field__value--highlight">{summary?.wellness.program || 'None'}</span>
            </div>
          </div>
          <div className="mvp-badge-row">
            <StatusBadge active={summary?.wellness.gym} label="Gym" />
            <StatusBadge active={summary?.wellness.spa} label="Spa" />
            <StatusBadge active={summary?.wellness.pool} label="Pool" />
          </div>
        </SectionCard>

        {/* Amenities - Full Width */}
        <div className="mvp-card mvp-card--full">
          <div className="mvp-card__header">
            <Layers size={20} className="mvp-card__icon" />
            <h3 className="mvp-card__title">Selected Amenities</h3>
            <span className="mvp-card__count">{amenityCount} selected</span>
          </div>
          <div className="mvp-card__content">
            <div className="mvp-amenity-grid">
              <StatusBadge active={summary?.amenities.wine} label="Wine Room" />
              <StatusBadge active={summary?.amenities.media} label="Media Room" />
              <StatusBadge active={summary?.amenities.library} label="Library" />
              <StatusBadge active={summary?.amenities.familyRoom} label="Family Room" />
              <StatusBadge active={summary?.amenities.salon} label="Salon" />
              <StatusBadge active={summary?.amenities.gameRoom} label="Game Room" />
              <StatusBadge active={summary?.amenities.bar} label="Bar" />
              <StatusBadge active={summary?.amenities.bunkRoom} label="Bunk Room" />
              <StatusBadge active={summary?.amenities.breakfastNook} label="Breakfast Nook" />
              <StatusBadge active={summary?.amenities.outdoorEntertaining} label="Outdoor Entertaining" />
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data Toggle (for debugging) */}
      <div className="mvp-debug">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => setShowRawData(!showRawData)}
        >
          {showRawData ? 'Hide' : 'Show'} Raw Data
        </button>

        {showRawData && (
          <pre className="mvp-debug__code">
            {JSON.stringify({
              dataSource: hasFYIData ? 'FYI (LIVE)' : 'KYC (derived)',
              fyiProgram: fyiProgram ? {
                source: fyiProgram.source,
                timestamp: fyiProgram.timestamp,
                spaceCount: fyiProgram.totals?.spaceCount,
                totalSF: fyiProgram.totals?.totalConditionedSF
              } : null,
              briefInputs,
              tasteProfileP: tasteProfileP ? {
                clientId: tasteProfileP.clientId,
                completedAt: tasteProfileP.completedAt,
                profile: tasteProfileP.profile
              } : null,
              tasteProfileS: tasteProfileS ? {
                clientId: tasteProfileS.clientId,
                completedAt: tasteProfileS.completedAt,
                profile: tasteProfileS.profile
              } : null
            }, null, 2)}
          </pre>
        )}
      </div>

      {/* Next Steps */}
      <div className="mvp-next-steps">
        <h3>
          <ArrowRight size={20} />
          Next: Briefing Builder
        </h3>
        <p>
          Open the Briefing Builder to configure spaces, adjacencies, and operational bridges.
          Run validation preview and export your completed PlanBrief.
        </p>
        <button
          onClick={() => setViewMode('personalization')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Personalize Your Layout
        </button>
        <button
          onClick={() => setViewMode('builder')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Open Briefing Builder
        </button>
      </div>
    </div>
  );
};

export default MVPModule;
