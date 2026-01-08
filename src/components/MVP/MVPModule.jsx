import React, { useMemo, useState, useEffect } from 'react';
import {
  ClipboardCheck, AlertTriangle, CheckCircle2, XCircle,
  Home, Users, Dumbbell,
  Building, Layers, ArrowRight, Palette, FileText, Sparkles
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import BriefingBuilderView from './BriefingBuilderView';
import AdjacencyPersonalizationView from './AdjacencyPersonalizationView';
import { transformKYCToMVPBrief, getMVPBriefSummary, countSelectedAmenities } from '../../lib/mvp-bridge';
import { quads, categoryOrder } from '../../data/tasteQuads';

// ============================================
// TASTE PROFILE INTEGRATION
// ============================================

const PROFILE_STORAGE_PREFIX = 'n4s_taste_profile_';

function loadTasteProfile(clientId) {
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
// MAIN MVP MODULE COMPONENT
// ============================================

const MVPModule = () => {
  const { kycData, activeRespondent } = useAppContext();
  const [showRawData, setShowRawData] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'builder'
  
  // Get design identity config from KYC
  const designIdentity = kycData[activeRespondent]?.designIdentity || {};
  const clientBaseName = designIdentity.clientBaseName || '';
  const clientType = designIdentity.clientType || 'individual';
  const principalName = designIdentity.principalName || '';
  const secondaryName = designIdentity.secondaryName || '';
  
  // Generate client IDs
  const clientIdP = clientBaseName ? `${clientBaseName}-P` : null;
  const clientIdS = clientType === 'couple' && clientBaseName ? `${clientBaseName}-S` : null;
  
  // Load taste profiles from localStorage
  const [tasteProfileP, setTasteProfileP] = useState(null);
  const [tasteProfileS, setTasteProfileS] = useState(null);
  
  useEffect(() => {
    if (clientIdP) {
      setTasteProfileP(loadTasteProfile(clientIdP));
    }
    if (clientIdS) {
      setTasteProfileS(loadTasteProfile(clientIdS));
    }
  }, [clientIdP, clientIdS]);
  
  // Extract scores from profiles
  const scoresP = tasteProfileP?.profile?.scores || {};
  // Secondary scores/materials available for future divergence analysis
  // const scoresS = tasteProfileS?.profile?.scores || {};
  const materialsP = tasteProfileP?.profile?.topMaterials || [];
  // const materialsS = tasteProfileS?.profile?.topMaterials || [];

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
  
  // Estimate tier based on amenity count
  const estimatedTier = useMemo(() => {
    if (amenityCount >= 12) return { tier: '20K+', label: 'Estate (20,000+ SF)', color: 'gold' };
    if (amenityCount >= 8) return { tier: '15K', label: 'Grand (15,000 SF)', color: 'teal' };
    if (amenityCount >= 4) return { tier: '10K', label: 'Signature (10,000 SF)', color: 'blue' };
    return { tier: 'Custom', label: 'Custom Compact', color: 'gray' };
  }, [amenityCount]);

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
            Area program derived from KYC inputs • {activeRespondent.charAt(0).toUpperCase() + activeRespondent.slice(1)} respondent
          </p>
        </div>
        
        {/* Tier Estimate Badge */}
        <div className={`mvp-tier-badge mvp-tier-badge--${estimatedTier.color}`}>
          <span className="mvp-tier-badge__tier">{estimatedTier.tier}</span>
          <span className="mvp-tier-badge__label">{estimatedTier.label}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mvp-stats-row">
        <div className="mvp-stat">
          <span className="mvp-stat__value">{summary?.household.totalBedrooms || 0}</span>
          <span className="mvp-stat__label">Total Bedrooms</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">{summary?.household.guestBedrooms || 0}</span>
          <span className="mvp-stat__label">Guest Suites</span>
        </div>
        <div className="mvp-stat">
          <span className="mvp-stat__value">{amenityCount}</span>
          <span className="mvp-stat__label">Amenities</span>
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

      {/* Main Content Grid */}
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

