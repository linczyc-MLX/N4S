/**
 * FYISpaceCard Component
 * 
 * Individual space card with S/M/L selection, image upload, and calculated SF.
 */

import React, { useRef, useState } from 'react';
import { getSpaceRenderUrl, getFloorPlanUrl } from '../../../shared/space-registry';

const FYISpaceCard = ({
  space,
  selection,
  calculatedArea,
  settings,
  onSizeChange,
  onToggleIncluded,
  onImageUpload,
  onLevelChange,
  onNotesChange
}) => {
  const fileInputRef = useRef(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const { included, size, level, imageUrl, notes, kycSource } = selection;
  const isOutdoor = space.outdoorSpace;
  
  // Calculate S/M/L areas for display
  const delta = settings.deltaPct / 100;
  const baseArea = space.baseSF[settings.programTier] || 0;
  const areas = {
    S: Math.round(baseArea * (1 - delta)),
    M: baseArea,
    L: Math.round(baseArea * (1 + delta))
  };
  
  // Determine image source
  const displayImage = imageUrl || getSpaceRenderUrl(space.code, size);
  
  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      onImageUpload(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // KYC source badge
  const getKYCBadge = () => {
    if (!kycSource) return null;
    const badges = {
      mustHave: { label: 'Must Have', className: 'fyi-space-card__badge--must' },
      niceToHave: { label: 'Nice to Have', className: 'fyi-space-card__badge--nice' },
      petGroomingRoom: { label: 'Pet', className: 'fyi-space-card__badge--kyc' },
      lateNightMediaUse: { label: 'Sound', className: 'fyi-space-card__badge--kyc' },
      wantsBar: { label: 'KYC', className: 'fyi-space-card__badge--kyc' },
      wantsBunkRoom: { label: 'KYC', className: 'fyi-space-card__badge--kyc' },
      wantsBreakfastNook: { label: 'KYC', className: 'fyi-space-card__badge--kyc' },
      staffingLevel: { label: 'Staff', className: 'fyi-space-card__badge--kyc' },
      staffingWithKids: { label: 'Nanny', className: 'fyi-space-card__badge--kyc' },
    };
    const badge = badges[kycSource];
    if (!badge) return null;
    return (
      <span className={`fyi-space-card__badge ${badge.className}`}>
        {badge.label}
      </span>
    );
  };
  
  // Level options
  const levelOptions = settings.hasBasement 
    ? [{ value: 2, label: 'L2' }, { value: 1, label: 'L1' }, { value: -1, label: 'L-1' }]
    : [{ value: 2, label: 'L2' }, { value: 1, label: 'L1' }];
  
  // Filter level options for basement-eligible spaces
  const availableLevels = space.basementEligible 
    ? levelOptions 
    : levelOptions.filter(l => l.value > 0);

  return (
    <div className={`fyi-space-card ${!included ? 'fyi-space-card--excluded' : ''} ${isOutdoor ? 'fyi-space-card--outdoor' : ''}`}>
      {/* Image area */}
      <div className="fyi-space-card__image-container">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={space.name}
            className="fyi-space-card__image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="fyi-space-card__image-placeholder"
          style={{ display: displayImage ? 'none' : 'flex' }}
        >
          <svg className="fyi-space-card__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Add Image</span>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="fyi-space-card__file-input"
          onChange={handleFileSelect}
        />
        
        <button 
          className="fyi-space-card__upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          {imageUrl ? 'Change' : displayImage ? 'Replace' : 'Upload'}
        </button>
        
        {getKYCBadge()}
      </div>
      
      {/* Header with name and toggle */}
      <div className="fyi-space-card__header">
        <h4 className="fyi-space-card__name">{space.abbrev}</h4>
        <label className="fyi-space-card__toggle">
          <input
            type="checkbox"
            checked={included}
            onChange={() => onToggleIncluded()}
          />
          <span className="fyi-space-card__toggle-slider" />
        </label>
      </div>
      
      {/* Full name if different */}
      {space.abbrev !== space.name && (
        <p className="fyi-space-card__fullname">{space.name}</p>
      )}
      
      {/* Size selector */}
      {included && (
        <>
          <div className="fyi-space-card__size-selector">
            {['S', 'M', 'L'].map((s) => (
              <button
                key={s}
                className={`fyi-space-card__size-btn ${size === s ? 'fyi-space-card__size-btn--active' : ''}`}
                onClick={() => onSizeChange(s)}
              >
                <span className="fyi-space-card__size-letter">{s}</span>
                <span className="fyi-space-card__size-sf">{areas[s].toLocaleString()}</span>
              </button>
            ))}
          </div>
          
          {/* Calculated area display */}
          <div className="fyi-space-card__area">
            <span className="fyi-space-card__area-value">
              {calculatedArea.toLocaleString()}
            </span>
            <span className="fyi-space-card__area-unit">
              {isOutdoor ? 'SF (exterior)' : 'SF'}
            </span>
          </div>
          
          {/* Expandable details */}
          <button 
            className="fyi-space-card__details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'More Options'}
            <svg 
              className={`fyi-space-card__chevron ${showDetails ? 'fyi-space-card__chevron--open' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          
          {showDetails && (
            <div className="fyi-space-card__details">
              {/* Level selector */}
              {!isOutdoor && availableLevels.length > 1 && (
                <div className="fyi-space-card__detail-row">
                  <label>Level</label>
                  <select 
                    value={level}
                    onChange={(e) => onLevelChange(parseInt(e.target.value))}
                    className="fyi-space-card__level-select"
                  >
                    {availableLevels.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Notes */}
              <div className="fyi-space-card__detail-row">
                <label>Notes</label>
                <textarea
                  value={notes || ''}
                  onChange={(e) => onNotesChange(e.target.value)}
                  className="fyi-space-card__notes"
                  placeholder="Add notes..."
                  rows={2}
                />
              </div>
              
              {/* Space info */}
              {space.notes && (
                <p className="fyi-space-card__space-notes">
                  <em>{space.notes}</em>
                </p>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Excluded state */}
      {!included && (
        <div className="fyi-space-card__excluded-overlay">
          <span>Not Included</span>
          <button 
            className="fyi-space-card__include-btn"
            onClick={() => onToggleIncluded()}
          >
            Add to Program
          </button>
        </div>
      )}
    </div>
  );
};

export default FYISpaceCard;
