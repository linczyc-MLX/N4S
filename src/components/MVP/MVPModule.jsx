import React, { useMemo, useState } from 'react';
import { 
  ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, 
  Home, Users, ChefHat, Dumbbell, Wine, Tv, BookOpen,
  Sofa, Gamepad2, Beer, BedDouble, Coffee, TreePine,
  Building, Layers, ArrowRight, RefreshCw
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { transformKYCToMVPBrief, getMVPBriefSummary, countSelectedAmenities } from '../../lib/mvp-bridge';

const MVPModule = () => {
  const { kycData, activeRespondent } = useAppContext();
  const [showRawData, setShowRawData] = useState(false);
  
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

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="mvp-card">
      <div className="mvp-card__header">
        <Icon size={20} className="mvp-card__icon" />
        <h3 className="mvp-card__title">{title}</h3>
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
              <StatusBadge active={summary?.household.hasChildren} label={summary?.household.hasChildren ? 'Yes' : 'No'} />
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
              <span className="mvp-field__value">{summary?.household.staffing || 'None'}</span>
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
          {showRawData ? 'Hide' : 'Show'} Raw Brief Data
        </button>
        
        {showRawData && (
          <pre className="mvp-debug__code">
            {JSON.stringify(briefInputs, null, 2)}
          </pre>
        )}
      </div>

      {/* Next Steps */}
      <div className="mvp-next-steps">
        <h3>
          <ArrowRight size={20} />
          Next: Full Validation Engine
        </h3>
        <p>
          The complete MVP validation engine will generate your detailed area program, 
          run adjacency validation, and produce pass/fail gates. This preview shows 
          how your KYC inputs translate to MVP brief parameters.
        </p>
      </div>
    </div>
  );
};

export default MVPModule;
