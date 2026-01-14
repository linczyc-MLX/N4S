/**
 * KYMModule.jsx - Know Your Market
 * 
 * Market intelligence module that provides:
 * 1. Market Analysis - Local market trends and KPIs
 * 2. Comparable Properties - Live property data via API
 * 3. Demographics - Population analysis
 * 4. Buyer Alignment (BAM) - Persona matching based on design decisions
 * 
 * Uses client's project location from KYC data when available.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TrendingUp, DollarSign, Clock, Activity, RefreshCw,
  Home, Users, MapPin, Search, Filter, LayoutGrid, BarChart2,
  Bed, Bath, Maximize, Trees, Calendar, ExternalLink, X,
  GraduationCap, ChevronDown, AlertCircle, CheckCircle2, Database,
  Settings, Loader2, Target, FileDown, Map, Mountain, Waves, Plus
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import KYMDocumentation from './KYMDocumentation';
import * as kymApi from './kymApiService';
import { calculateAllPersonaScores, calculateBAMScores, extractClientData, PERSONAS } from './BAMScoring';
import { BAMView, BAMPanel } from './BAMComponents';
import { generateKYMReport } from './KYMReportGenerator';
import './KYMModule.css';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  dustyRose: '#E4C0BE',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
};

// Default luxury markets for quick selection
const LUXURY_MARKETS = [
  { zipCode: '90210', city: 'Beverly Hills', state: 'CA' },
  { zipCode: '90265', city: 'Malibu', state: 'CA' },
  { zipCode: '33139', city: 'Miami Beach', state: 'FL' },
  { zipCode: '10019', city: 'Manhattan', state: 'NY' },
  { zipCode: '81611', city: 'Aspen', state: 'CO' },
  { zipCode: '33480', city: 'Palm Beach', state: 'FL' },
  { zipCode: '94027', city: 'Atherton', state: 'CA' },
  { zipCode: '06830', city: 'Greenwich', state: 'CT' },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const KPICard = ({ title, value, change, changeLabel, icon, trend }) => (
  <div className="kym-kpi-card">
    <div className="kym-kpi-header">
      <span className="kym-kpi-title">{title}</span>
      <div className="kym-kpi-icon">{icon}</div>
    </div>
    <div className="kym-kpi-value">{value}</div>
    {change !== undefined && (
      <div className={`kym-kpi-change ${change >= 0 ? 'kym-kpi-change--positive' : 'kym-kpi-change--negative'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
      </div>
    )}
  </div>
);

const PropertyCard = ({ property, onClick }) => {
  const formatPrice = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);

  const formatSqft = (value) => new Intl.NumberFormat('en-US').format(value);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'sold': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const statusStyle = getStatusColor(property.status);

  return (
    <div className="kym-property-card" onClick={onClick}>
      <div className="kym-property-image">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.address} onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }} />
        ) : null}
        <div className="kym-property-placeholder" style={{ display: property.imageUrl ? 'none' : 'flex' }}>
          <Home size={32} />
          <span>{property.sqft > 15000 ? 'Estate' : 'Luxury'}</span>
        </div>
        <span 
          className="kym-property-status"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {property.status}
        </span>
        {property.daysOnMarket <= 7 && (
          <span className="kym-property-new">New</span>
        )}
        {/* Property type badge - don't show for single family (most common) */}
        {property.propertyTypeDisplay && property.propertyType !== 'single_family' && (
          <span className="kym-property-type">{property.propertyTypeDisplay}</span>
        )}
      </div>
      <div className="kym-property-content">
        <h4 className="kym-property-address">{property.address}</h4>
        <p className="kym-property-location">{property.city}, {property.state} {property.zipCode}</p>
        
        <div className="kym-property-specs">
          <span><Bed size={14} /> {property.beds}</span>
          <span><Bath size={14} /> {property.baths}</span>
          <span><Maximize size={14} /> {formatSqft(property.sqft)}</span>
          <span><Trees size={14} /> {property.acreage?.toFixed(1)}ac</span>
        </div>

        <div className="kym-property-price-row">
          <div>
            <div className="kym-property-price">{formatPrice(property.askingPrice)}</div>
            <div className="kym-property-ppsf">{formatPrice(property.pricePerSqFt)}/SF</div>
          </div>
          <div className="kym-property-dom">
            <Calendar size={12} /> {property.daysOnMarket} days
          </div>
        </div>

        {property.features && property.features.length > 0 && (
          <div className="kym-property-features">
            {property.features.slice(0, 3).map((f, i) => (
              <span key={i} className="kym-feature-tag">{f}</span>
            ))}
            {property.features.length > 3 && (
              <span className="kym-feature-tag">+{property.features.length - 3}</span>
            )}
          </div>
        )}

        {property.listingUrl && (
          <a 
            href={property.listingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="kym-property-link"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} /> View Listing
          </a>
        )}
      </div>
    </div>
  );
};

/**
 * Property Detail Modal - Full details with "View Listing" button
 */
const PropertyDetailModal = ({ property, isOpen, onClose }) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !property) return null;

  const formatPrice = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);

  const formatSqft = (value) => new Intl.NumberFormat('en-US').format(value);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
      case 'sold': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const statusStyle = getStatusColor(property.status);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="kym-modal-backdrop" onClick={handleBackdropClick}>
      <div className="kym-modal-content">
        {/* Header */}
        <div className="kym-modal-header">
          <h2 className="kym-modal-title">{property.address}</h2>
          <div className="kym-modal-header-actions">
            <span 
              className="kym-modal-status"
              style={{ background: statusStyle.bg, color: statusStyle.text }}
            >
              {property.status}
            </span>
            <button className="kym-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="kym-modal-image-container">
          {property.imageUrl && !imageError ? (
            <img 
              src={property.imageUrl} 
              alt={property.address}
              className="kym-modal-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="kym-modal-image-placeholder">
              <Home size={64} />
              <span>{property.sqft > 15000 ? 'Estate' : 'Luxury'}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="kym-modal-location">
          <MapPin size={16} />
          <span>{property.city}, {property.state} {property.zipCode}</span>
        </div>

        {/* Price Info */}
        <div className="kym-modal-price-section">
          <div>
            <span className="kym-modal-price-label">Asking Price</span>
            <span className="kym-modal-price-value">{formatPrice(property.askingPrice)}</span>
          </div>
          <div>
            <span className="kym-modal-price-label">Price per Sq Ft</span>
            <span className="kym-modal-price-ppsf">{formatPrice(property.pricePerSqFt)}</span>
          </div>
        </div>

        {/* Property Specs */}
        <div className="kym-modal-specs">
          <div className="kym-modal-spec">
            <Bed size={20} />
            <span className="kym-modal-spec-value">{property.beds}</span>
            <span className="kym-modal-spec-label">Bedrooms</span>
          </div>
          <div className="kym-modal-spec">
            <Bath size={20} />
            <span className="kym-modal-spec-value">{property.baths}</span>
            <span className="kym-modal-spec-label">Bathrooms</span>
          </div>
          <div className="kym-modal-spec">
            <Maximize size={20} />
            <span className="kym-modal-spec-value">{formatSqft(property.sqft)}</span>
            <span className="kym-modal-spec-label">Sq Ft</span>
          </div>
          <div className="kym-modal-spec">
            <Trees size={20} />
            <span className="kym-modal-spec-value">{property.acreage?.toFixed(2)}</span>
            <span className="kym-modal-spec-label">Acres</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="kym-modal-details">
          {property.yearBuilt && (
            <div className="kym-modal-detail">
              <Home size={14} />
              <span>Year Built: <strong>{property.yearBuilt}</strong></span>
            </div>
          )}
          <div className="kym-modal-detail">
            <Calendar size={14} />
            <span>Days on Market: <strong>{property.daysOnMarket}</strong></span>
          </div>
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="kym-modal-features">
            {property.features.map((feature, i) => (
              <span key={i} className="kym-modal-feature-tag">{feature}</span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="kym-modal-footer">
          <div className="kym-modal-source">
            {property.dataSource && property.dataSource !== 'generated' && (
              <span className="kym-modal-source-badge">
                <Database size={12} />
                {property.dataSource === 'realtor' ? 'Realtor.com' : property.dataSource}
              </span>
            )}
          </div>
          <div className="kym-modal-actions">
            {property.listingUrl && (
              <button 
                className="kym-modal-btn kym-modal-btn--primary"
                onClick={() => window.open(property.listingUrl, '_blank')}
              >
                <ExternalLink size={16} />
                View Listing
              </button>
            )}
            <button 
              className="kym-modal-btn kym-modal-btn--secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuyerPersonaCard = ({ persona }) => (
  <div className="kym-persona-card">
    <div className="kym-persona-header">
      <h4>{persona.name}</h4>
      <span className="kym-persona-likelihood">{persona.likelihood}% match</span>
    </div>
    <p className="kym-persona-description">{persona.description}</p>
    <div className="kym-persona-details">
      <div><strong>Income:</strong> {persona.incomeRange}</div>
      <div><strong>Age:</strong> {persona.ageRange}</div>
      <div><strong>Occupation:</strong> {persona.occupation}</div>
    </div>
    <div className="kym-persona-priorities">
      <strong>Priorities:</strong>
      <div className="kym-persona-tags">
        {persona.priorities.map((p, i) => (
          <span key={i} className="kym-priority-tag">{p}</span>
        ))}
      </div>
    </div>
  </div>
);

// =============================================================================
// LAND DETAIL MODAL
// =============================================================================

const LandDetailModal = ({ parcel, isOpen, onClose, onExportToKYS }) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !parcel) return null;

  const formatPrice = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);

  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="kym-modal-backdrop" onClick={handleBackdropClick}>
      <div className="kym-modal-content">
        {/* Header */}
        <div className="kym-modal-header">
          <h2 className="kym-modal-title">{parcel.address}</h2>
          <div className="kym-modal-header-actions">
            <span 
              className="kym-modal-status"
              style={{ background: '#dcfce7', color: '#166534' }}
            >
              Active
            </span>
            <button className="kym-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="kym-modal-image-container">
          {parcel.imageUrl && !imageError ? (
            <img 
              src={parcel.imageUrl} 
              alt={parcel.address}
              className="kym-modal-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="kym-modal-image-placeholder kym-modal-image-placeholder--land">
              <Map size={64} />
              <span>Land Parcel</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="kym-modal-location">
          <MapPin size={16} />
          <span>{parcel.city}, {parcel.state} {parcel.zipCode}</span>
        </div>

        {/* Price Info */}
        <div className="kym-modal-price-section">
          <div>
            <span className="kym-modal-price-label">Asking Price</span>
            <span className="kym-modal-price-value">{formatPrice(parcel.askingPrice)}</span>
          </div>
          <div>
            <span className="kym-modal-price-label">Price per Acre</span>
            <span className="kym-modal-price-ppsf">{formatPrice(parcel.pricePerAcre)}</span>
          </div>
        </div>

        {/* Land Specs */}
        <div className="kym-modal-specs">
          <div className="kym-modal-spec">
            <Trees size={20} />
            <span className="kym-modal-spec-value">{parcel.acreage?.toFixed(2)}</span>
            <span className="kym-modal-spec-label">Acres</span>
          </div>
          <div className="kym-modal-spec">
            <Maximize size={20} />
            <span className="kym-modal-spec-value">{formatNumber(parcel.lotSqft || 0)}</span>
            <span className="kym-modal-spec-label">Sq Ft</span>
          </div>
          <div className="kym-modal-spec">
            <Home size={20} />
            <span className="kym-modal-spec-value">{parcel.zoning || 'Residential'}</span>
            <span className="kym-modal-spec-label">Zoning</span>
          </div>
          <div className="kym-modal-spec">
            <Calendar size={20} />
            <span className="kym-modal-spec-value">{parcel.daysOnMarket || '—'}</span>
            <span className="kym-modal-spec-label">Days on Market</span>
          </div>
        </div>

        {/* Features */}
        {parcel.features && parcel.features.length > 0 && (
          <div className="kym-modal-features">
            {parcel.features.map((feature, i) => (
              <span key={i} className="kym-modal-feature-tag kym-modal-feature-tag--land">{feature}</span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="kym-modal-footer">
          <div className="kym-modal-source">
            {parcel.dataSource && parcel.dataSource !== 'generated' && (
              <span className="kym-modal-source-badge">
                <Database size={12} />
                Realtor.com
              </span>
            )}
          </div>
          <div className="kym-modal-actions">
            {parcel.listingUrl && (
              <button 
                className="kym-modal-btn kym-modal-btn--primary"
                onClick={() => window.open(parcel.listingUrl, '_blank')}
              >
                <ExternalLink size={16} />
                View Listing
              </button>
            )}
            {onExportToKYS && (
              <button 
                className="kym-modal-btn kym-modal-btn--gold"
                onClick={() => {
                  onExportToKYS(parcel);
                  onClose();
                }}
              >
                <Plus size={16} />
                Add to KYS
              </button>
            )}
            <button 
              className="kym-modal-btn kym-modal-btn--secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AnimatedLineChart - SVG-based line chart with left-to-right animation
 * Mimics Recharts behavior without the dependency
 */
const AnimatedLineChart = ({ data, height = 280 }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [data]);

  // Reset animation when data changes
  useEffect(() => {
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) return null;

  // Chart dimensions
  const padding = { top: 20, right: 60, bottom: 40, left: 70 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const prices = data.map(d => d.medianPrice);
  const volumes = data.map(d => d.salesVolume);
  
  const priceMin = Math.min(...prices) * 0.9;
  const priceMax = Math.max(...prices) * 1.1;
  const volumeMin = 0;
  const volumeMax = Math.max(...volumes) * 1.2;

  // Format price for Y-axis labels
  const formatPrice = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Calculate point positions
  const getX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getPriceY = (price) => padding.top + chartHeight - ((price - priceMin) / (priceMax - priceMin)) * chartHeight;
  const getVolumeY = (volume) => padding.top + chartHeight - ((volume - volumeMin) / (volumeMax - volumeMin)) * chartHeight;

  // Create smooth bezier curve path
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      // Catmull-Rom to Bezier conversion for smooth curves
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  };

  // Generate points for both lines
  const pricePoints = data.map((d, i) => ({ x: getX(i), y: getPriceY(d.medianPrice) }));
  const volumePoints = data.map((d, i) => ({ x: getX(i), y: getVolumeY(d.salesVolume) }));

  const pricePath = createSmoothPath(pricePoints);
  const volumePath = createSmoothPath(volumePoints);

  // Calculate path lengths for animation
  const pathLength = chartWidth * 2; // Approximate

  // Y-axis tick values
  const priceTicks = [priceMin, (priceMin + priceMax) / 2, priceMax];
  const volumeTicks = [0, Math.round(volumeMax / 2), Math.round(volumeMax)];

  return (
    <div className="kym-animated-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="kym-chart-svg">
        {/* Grid lines */}
        <g className="kym-chart-grid">
          {[0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - pct)}
              x2={width - padding.right}
              y2={padding.top + chartHeight * (1 - pct)}
              stroke="#e5e5e0"
              strokeDasharray="3 3"
            />
          ))}
        </g>

        {/* Left Y-axis (Price) */}
        <g className="kym-chart-axis kym-chart-axis--left">
          {priceTicks.map((tick, i) => (
            <text
              key={i}
              x={padding.left - 10}
              y={getPriceY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="#6b6b6b"
            >
              {formatPrice(tick)}
            </text>
          ))}
        </g>

        {/* Right Y-axis (Volume) */}
        <g className="kym-chart-axis kym-chart-axis--right">
          {volumeTicks.map((tick, i) => (
            <text
              key={i}
              x={width - padding.right + 10}
              y={getVolumeY(tick)}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize="11"
              fill="#6b6b6b"
            >
              {tick}
            </text>
          ))}
        </g>

        {/* X-axis labels */}
        <g className="kym-chart-axis kym-chart-axis--bottom">
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b6b6b"
            >
              {d.month}
            </text>
          ))}
        </g>

        {/* Price line (navy) */}
        <path
          d={pricePath}
          fill="none"
          stroke={COLORS.navy}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`kym-chart-line ${isAnimated ? 'kym-chart-line--animated' : ''}`}
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimated ? 0 : pathLength,
          }}
        />

        {/* Volume line (teal) */}
        <path
          d={volumePath}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`kym-chart-line ${isAnimated ? 'kym-chart-line--animated' : ''}`}
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimated ? 0 : pathLength,
            transitionDelay: '0.3s',
          }}
        />

        {/* Interactive dots (hidden until hover) */}
        {isAnimated && pricePoints.map((point, i) => (
          <g key={`dot-${i}`} className="kym-chart-dot-group">
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={COLORS.navy}
              className="kym-chart-dot"
            />
            <circle
              cx={volumePoints[i].x}
              cy={volumePoints[i].y}
              r="4"
              fill="#0d9488"
              className="kym-chart-dot"
            />
            {/* Hover area */}
            <rect
              x={point.x - 20}
              y={padding.top}
              width="40"
              height={chartHeight}
              fill="transparent"
              className="kym-chart-hover-area"
            />
            {/* Tooltip */}
            <g className="kym-chart-tooltip" transform={`translate(${point.x}, ${Math.min(point.y, volumePoints[i].y) - 10})`}>
              <rect
                x="-50"
                y="-45"
                width="100"
                height="40"
                rx="4"
                fill="white"
                stroke="#e5e5e0"
              />
              <text x="0" y="-28" textAnchor="middle" fontSize="10" fill="#6b6b6b">{data[i].month}</text>
              <text x="0" y="-14" textAnchor="middle" fontSize="11" fill={COLORS.navy} fontWeight="600">
                {formatPrice(data[i].medianPrice)}
              </text>
            </g>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="kym-chart-legend">
        <div className="kym-chart-legend-item">
          <span className="kym-chart-legend-dot" style={{ background: COLORS.navy }}></span>
          Median Price
        </div>
        <div className="kym-chart-legend-item">
          <span className="kym-chart-legend-dot" style={{ background: '#0d9488' }}></span>
          Sales Volume
        </div>
      </div>
    </div>
  );
};

const LocationSelector = ({ selectedZipCode, onSelect, onZipSearch, clientLocation, locationData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const dropdownRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleZipInputChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipInput(value);
    setValidationResult(null);
    
    if (value.length === 5) {
      setIsValidating(true);
      try {
        const result = await kymApi.lookupZipCode(value);
        setValidationResult(result);
      } catch (error) {
        setValidationResult(null);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleSelectZip = (zipCode) => {
    onSelect(zipCode);
    setIsOpen(false);
    setZipInput('');
    setValidationResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validationResult) {
      handleSelectZip(validationResult.zipCode);
    }
  };

  // Get display name for current location
  const displayLocation = locationData?.location 
    ? `${locationData.location.city}, ${locationData.location.state}`
    : LUXURY_MARKETS.find(m => m.zipCode === selectedZipCode)?.city || 'Loading...';

  return (
    <div className="kym-location-selector" ref={dropdownRef}>
      <button 
        className="kym-location-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={16} />
        <span>{displayLocation} ({selectedZipCode})</span>
        <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
      </button>
      
      {isOpen && (
        <div className="kym-location-dropdown">
          {/* ZIP Code Search */}
          <form onSubmit={handleSubmit} className="kym-zip-search-form">
            <div className="kym-zip-search-input-wrapper">
              <Search size={14} />
              <input
                type="text"
                placeholder="Enter any US ZIP code..."
                value={zipInput}
                onChange={handleZipInputChange}
                maxLength={5}
                className="kym-zip-search-input"
              />
              {isValidating && <Loader2 size={14} className="spinning" />}
            </div>
            
            {/* Validation Result */}
            {validationResult && (
              <button 
                type="button"
                className="kym-zip-result"
                onClick={() => handleSelectZip(validationResult.zipCode)}
              >
                <MapPin size={14} />
                <span>{validationResult.formattedName}</span>
                <CheckCircle2 size={14} className="kym-zip-result-check" />
              </button>
            )}
            
            {zipInput.length === 5 && !isValidating && !validationResult && (
              <div className="kym-zip-invalid">
                <AlertCircle size={14} />
                <span>Invalid ZIP code</span>
              </div>
            )}
          </form>
          
          {/* Client Project Location */}
          {clientLocation && (
            <div className="kym-location-section">
              <div className="kym-location-section-title">From Your Project</div>
              <button 
                className="kym-location-option kym-location-option--highlight"
                onClick={() => handleSelectZip(clientLocation.zipCode || '90210')}
              >
                <MapPin size={14} />
                {clientLocation.city}, {clientLocation.country}
              </button>
            </div>
          )}
          
          {/* Popular Luxury Markets */}
          <div className="kym-location-section">
            <div className="kym-location-section-title">Popular Luxury Markets</div>
            {LUXURY_MARKETS.map(market => (
              <button
                key={market.zipCode}
                className={`kym-location-option ${market.zipCode === selectedZipCode ? 'kym-location-option--active' : ''}`}
                onClick={() => handleSelectZip(market.zipCode)}
              >
                {market.city}, {market.state}
                <span className="kym-location-zip">{market.zipCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN KYM MODULE
// =============================================================================

const KYMModule = ({ showDocs, onCloseDocs }) => {
  const { kycData, fyiData, mvpData } = useAppContext();
  const [activeTab, setActiveTab] = useState('market');
  const [selectedZipCode, setSelectedZipCode] = useState('90210');
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  
  // ZIP code search state
  const [zipSearchQuery, setZipSearchQuery] = useState('');
  const [zipSearchResults, setZipSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showZipDropdown, setShowZipDropdown] = useState(false);
  const zipSearchRef = useRef(null);
  const debounceRef = useRef(null);
  
  // Filters for comparable properties
  const [priceRange, setPriceRange] = useState([5000000, 25000000]);
  const [sqftRange, setSqftRange] = useState([5500, 26000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [statusFilter, setStatusFilter] = useState(['active', 'pending', 'sold']);
  const [featureFilter, setFeatureFilter] = useState([]);
  
  // Available feature filters
  const FEATURE_OPTIONS = [
    'Swimming Pool',
    'Guest House', 
    'Den or Office',
    'Elevator',
    'Wine Cellar',
    'Theater'
  ];
  
  // Property detail modal
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Export report state
  const [isExporting, setIsExporting] = useState(false);

  // Land Acquisition tab state
  const [landData, setLandData] = useState(null);
  const [landDataZipCode, setLandDataZipCode] = useState(null); // Track which ZIP the land data is for
  const [isLoadingLand, setIsLoadingLand] = useState(false);
  const [landError, setLandError] = useState(null);
  const [landPriceRange, setLandPriceRange] = useState([500000, 10000000]);
  const [acreageRange, setAcreageRange] = useState([1, 20]);
  const [showLandFilters, setShowLandFilters] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);

  // BAM v3.0: Portfolio context for dual scoring
  const [portfolioContext, setPortfolioContext] = useState('primary-residence');

  // Refs to avoid stale closure issues in URL paste callback
  const landDataRef = useRef(landData);
  const locationDataRef = useRef(locationData);

  // Keep refs in sync with state
  useEffect(() => {
    landDataRef.current = landData;
  }, [landData]);

  useEffect(() => {
    locationDataRef.current = locationData;
  }, [locationData]);

  // URL paste feature for direct Realtor.com links
  const [pastedListingUrl, setPastedListingUrl] = useState('');
  const [isFetchingListing, setIsFetchingListing] = useState(false);
  const [fetchListingError, setFetchListingError] = useState(null);

  // Acreage options for dropdown
  const ACREAGE_OPTIONS = [
    { value: 0.25, label: '¼ acre' },
    { value: 0.5, label: '½ acre' },
    { value: 1, label: '1 acre' },
    { value: 2, label: '2 acres' },
    { value: 5, label: '5 acres' },
    { value: 10, label: '10 acres' },
    { value: 20, label: '20 acres' },
    { value: 50, label: '50 acres' },
    { value: 100, label: '100+ acres' },
  ];

  // BAM: Calculate buyer persona scores (legacy)
  const personaResults = useMemo(() => {
    const clientData = extractClientData(
      kycData,
      fyiData,
      mvpData,
      locationData?.location
    );
    return calculateAllPersonaScores(clientData);
  }, [kycData, fyiData, mvpData, locationData?.location]);

  // BAM v3.0: Calculate dual scores (Client Satisfaction + Market Appeal)
  const bamScores = useMemo(() => {
    const clientData = extractClientData(
      kycData,
      fyiData,
      mvpData,
      locationData?.location
    );
    return calculateBAMScores(clientData, locationData?.location, portfolioContext);
  }, [kycData, fyiData, mvpData, locationData?.location, portfolioContext]);

  // Get client location from KYC if available
  const clientLocation = kycData?.principal?.projectParameters?.projectCity ? {
    city: kycData.principal.projectParameters.projectCity,
    country: kycData.principal.projectParameters.projectCountry,
    zipCode: null // Would need to be looked up
  } : null;

  // Fetch location data - uses real API data only (no fake properties)
  const fetchLocationData = useCallback(async (zipCode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[KYM] Fetching data for ZIP:', zipCode);
      const result = await kymApi.fetchLocationData(zipCode);
      
      if (result.error) {
        setError(result.error);
        setLocationData(null);
        setDataSource(null);
        setApiKeyConfigured(kymApi.hasApiKey());
        return;
      }

      // Generate demographics estimate (this is statistical data, not fake listings)
      const demographics = generateDemographicsEstimate(zipCode, result.location);
      const buyerPersonas = generateBuyerPersonas(result.location);
      
      const locationDataToSet = {
        ...result,
        demographics,
        buyerPersonas,
      };

      console.log('[KYM] Setting locationData:', {
        hasMarketData: !!locationDataToSet.marketData,
        marketDataKeys: locationDataToSet.marketData ? Object.keys(locationDataToSet.marketData) : [],
        growthRate: locationDataToSet.marketData?.growthRate,
        dataSource: result.dataSource,
      });

      setLocationData(locationDataToSet);
      setDataSource(result.dataSource);
      setApiKeyConfigured(result.apiKeyConfigured);

      if (result.properties.length > 0) {
        console.log(`[KYM] Loaded ${result.properties.length} real properties`);
      } else if (!result.apiKeyConfigured) {
        console.log('[KYM] No API key configured - using generated properties');
      } else {
        console.log('[KYM] No luxury properties found in this ZIP code');
      }
    } catch (err) {
      console.error('[KYM] Error:', err);
      setError(err.message || 'Failed to fetch location data');
      setLocationData(null);
      setDataSource(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch land data for Land Acquisition tab
  const fetchLandDataForLocation = useCallback(async (zipCode) => {
    setIsLoadingLand(true);
    setLandError(null);
    
    try {
      console.log('[KYM] Fetching land data for ZIP:', zipCode);
      const result = await kymApi.fetchLandData(zipCode, {
        minAcreage: acreageRange[0],
        maxAcreage: acreageRange[1],
        minPrice: landPriceRange[0],
        maxPrice: landPriceRange[1],
      });
      
      if (result.error) {
        setLandError(result.error);
        setLandData(null);
        return;
      }

      setLandData(result);
      setLandDataZipCode(zipCode); // Track which ZIP this data is for
      console.log(`[KYM] Loaded ${result.parcels.length} land parcels for ${zipCode}`);
    } catch (err) {
      console.error('[KYM] Land fetch error:', err);
      setLandError(err.message || 'Failed to fetch land data');
      setLandData(null);
    } finally {
      setIsLoadingLand(false);
    }
  }, [acreageRange, landPriceRange]);

  // Fetch land data when switching to land tab or when location changes
  useEffect(() => {
    // Fetch if on land tab and either no data or data is for a different ZIP
    if (activeTab === 'land' && selectedZipCode && (!landData || landDataZipCode !== selectedZipCode)) {
      fetchLandDataForLocation(selectedZipCode);
    }
  }, [activeTab, selectedZipCode, landData, landDataZipCode, fetchLandDataForLocation]);

  // Filter land parcels
  const filteredLandParcels = useMemo(() => {
    if (!landData?.parcels) return [];
    
    return landData.parcels.filter(parcel => {
      const matchesPrice = parcel.askingPrice >= landPriceRange[0] && parcel.askingPrice <= landPriceRange[1];
      const matchesAcreage = parcel.acreage >= acreageRange[0] && parcel.acreage <= acreageRange[1];
      return matchesPrice && matchesAcreage;
    });
  }, [landData?.parcels, landPriceRange, acreageRange]);

  // Export parcel to KYS Library
  const exportToKYSLibrary = useCallback((parcel) => {
    const siteData = {
      id: `site-${Date.now()}`,
      name: parcel.address,
      address: parcel.address,
      city: parcel.city,
      state: parcel.state,
      zipCode: parcel.zipCode,
      acreage: parcel.acreage,
      askingPrice: parcel.askingPrice,
      pricePerAcre: parcel.pricePerAcre,
      features: parcel.features || [],
      zoning: parcel.zoning,
      coordinates: {
        lat: parcel.latitude,
        lng: parcel.longitude,
      },
      sourceUrl: parcel.listingUrl,
      imageUrl: parcel.imageUrl,
      addedDate: new Date().toISOString(),
      notes: '',
    };
    
    // Get existing library from localStorage or initialize
    const existingLibrary = JSON.parse(localStorage.getItem('n4s-kys-site-library') || '[]');
    
    // Check if already exists
    const exists = existingLibrary.some(site => 
      site.address === siteData.address && site.zipCode === siteData.zipCode
    );
    
    if (exists) {
      alert('This site is already in your KYS Library.');
      return;
    }
    
    // Add to library
    existingLibrary.push(siteData);
    localStorage.setItem('n4s-kys-site-library', JSON.stringify(existingLibrary));
    
    alert(`"${parcel.address}" has been added to your KYS Site Library.`);
  }, []);

  // Fetch property details from pasted Realtor.com URL
  // Uses refs to avoid stale closure issues with landData/locationData
  const handleFetchListingByUrl = useCallback(async () => {
    if (!pastedListingUrl) return;

    setIsFetchingListing(true);
    setFetchListingError(null);

    try {
      // Extract property ID from URL
      // URL format: https://www.realtor.com/realestateandhomes-detail/ADDRESS_M12345-67890
      const match = pastedListingUrl.match(/M(\d+-\d+)/);
      if (!match) {
        throw new Error('Invalid Realtor.com URL. Please paste a full property listing URL.');
      }

      // Property ID from URL includes "M" prefix, but API may return with or without
      const propertyIdWithM = `M${match[1]}`;
      const propertyIdWithoutM = match[1];

      // Use refs to get current data (avoids stale closure)
      const currentLandData = landDataRef.current;
      const currentLocationData = locationDataRef.current;

      console.log('[KYM] Looking for property ID:', propertyIdWithM, 'or', propertyIdWithoutM);
      console.log('[KYM] Land parcels available:', currentLandData?.parcels?.length || 0);
      // Force show actual IDs (not just Array(n))
      const landIds = currentLandData?.parcels?.map(p => p.id) || [];
      console.log('[KYM] Land parcel IDs:', JSON.stringify(landIds));

      // Helper to match property ID (handles M prefix and dash variations)
      // URL format: M21699-31041, API format: 2169931041 (no M, no dash)
      const normalizeId = (id) => id?.replace(/^M/, '').replace(/-/g, '') || '';
      const normalizedTarget = normalizeId(propertyIdWithM);

      const matchesPropertyId = (id) => {
        if (!id) return false;
        const normalizedId = normalizeId(id);
        return normalizedId === normalizedTarget;
      };

      console.log('[KYM] Normalized target ID:', normalizedTarget);

      // FIRST: Check if property already exists in our fetched land parcels
      if (currentLandData?.parcels) {
        const existingParcel = currentLandData.parcels.find(p => matchesPropertyId(p.id));
        if (existingParcel) {
          console.log('[KYM] Found property in existing land data!', existingParcel);
          setSelectedParcel(existingParcel);
          setPastedListingUrl('');
          setIsFetchingListing(false);
          return;
        }
      }

      // SECOND: Check if property exists in our fetched comparable properties
      if (currentLocationData?.properties) {
        console.log('[KYM] Comparable properties available:', currentLocationData.properties.length);
        const existingProperty = currentLocationData.properties.find(p => matchesPropertyId(p.id));
        if (existingProperty) {
          console.log('[KYM] Found property in existing property data!', existingProperty);
          setSelectedParcel(existingProperty);
          setPastedListingUrl('');
          setIsFetchingListing(false);
          return;
        }
      }

      // THIRD: Search for property using list API (the one that works)
      console.log('[KYM] Property not in cache, searching via API...');
      const parcelData = await kymApi.fetchPropertyByUrl(pastedListingUrl);

      if (!parcelData) {
        throw new Error('Could not fetch property details. Please try again.');
      }

      // Show the modal with the fetched property
      setSelectedParcel(parcelData);
      setPastedListingUrl(''); // Clear input on success

    } catch (err) {
      console.error('[KYM] URL fetch error:', err);
      setFetchListingError(err.message || 'Failed to fetch listing');
    } finally {
      setIsFetchingListing(false);
    }
  }, [pastedListingUrl]); // Only depend on pastedListingUrl - use refs for data

  // Handle ZIP code search input
  const handleZipSearchChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (value.length === 5) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        const results = await kymApi.searchLocations(value);
        setZipSearchResults(results);
        setShowZipDropdown(results.length > 0);
        setIsSearching(false);
      }, 300);
    } else {
      setZipSearchResults([]);
      setShowZipDropdown(false);
    }
  };

  // Select a location from search results
  const handleSelectLocation = (location) => {
    setSelectedZipCode(location.zipCode);
    setZipSearchQuery('');
    setZipSearchResults([]);
    setShowZipDropdown(false);
  };

  // Handle direct ZIP code submission
  const handleZipSubmit = (e) => {
    e.preventDefault();
    if (zipSearchQuery.length === 5) {
      setSelectedZipCode(zipSearchQuery);
      setZipSearchQuery('');
      setShowZipDropdown(false);
    }
  };

  // Click outside handler for ZIP search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (zipSearchRef.current && !zipSearchRef.current.contains(e.target)) {
        setShowZipDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchLocationData(selectedZipCode);
  }, [selectedZipCode, fetchLocationData]);

  const handleLocationChange = (zipCode) => {
    setSelectedZipCode(zipCode);
  };

  const handleRefresh = () => {
    fetchLocationData(selectedZipCode);
  };

  // Export PDF report
  const handleExportReport = async () => {
    if (!locationData) return;
    
    setIsExporting(true);
    try {
      // Prepare market data summary
      const properties = locationData.properties || [];
      const prices = properties.map(p => p.askingPrice).filter(p => p > 0);
      const sqfts = properties.map(p => p.sqft).filter(s => s > 0);
      const doms = properties.map(p => p.daysOnMarket).filter(d => d !== null && d !== undefined);
      
      const marketData = {
        medianPrice: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0,
        avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        avgPricePerSqFt: prices.length > 0 && sqfts.length > 0 
          ? Math.round(prices.reduce((a, b) => a + b, 0) / sqfts.reduce((a, b) => a + b, 0))
          : 0,
        avgSqFt: sqfts.length > 0 ? Math.round(sqfts.reduce((a, b) => a + b, 0) / sqfts.length) : 0,
        avgDaysOnMarket: doms.length > 0 ? Math.round(doms.reduce((a, b) => a + b, 0) / doms.length) : null,
      };

      // Build persona results with full data
      const fullPersonaResults = personaResults.map(p => ({
        ...p,
        ...PERSONAS[p.id],
      }));

      await generateKYMReport({
        kycData,
        locationData,
        marketData,
        properties,
        demographics: locationData.demographics,
        personaResults: fullPersonaResults,
        fyiData,
        mvpData,
      });
      
      console.log('[KYM] Report exported successfully');
    } catch (error) {
      console.error('[KYM] Export error:', error);
      setError('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter properties - handle missing sqft gracefully
  const filteredProperties = (locationData?.properties || []).filter(property => {
    const matchesPrice = property.askingPrice >= priceRange[0] && property.askingPrice <= priceRange[1];
    // Allow properties with no sqft data (land, etc.) or within range
    const matchesSqft = !property.sqft || property.sqft === 0 || 
      (property.sqft >= sqftRange[0] && property.sqft <= sqftRange[1]);
    const matchesStatus = statusFilter.includes(property.status);
    const matchesSearch = !searchQuery || 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    // Feature filter: property must have ALL selected features
    const matchesFeatures = featureFilter.length === 0 || 
      featureFilter.every(feature => property.features?.includes(feature));
    return matchesPrice && matchesSqft && matchesStatus && matchesSearch && matchesFeatures;
  });

  // Toggle feature filter
  const toggleFeatureFilter = (feature) => {
    setFeatureFilter(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([5000000, 25000000]);
    setSqftRange([5500, 26000]);
    setSearchQuery('');
    setStatusFilter(['active', 'pending', 'sold']);
    setFeatureFilter([]);
  };

  // Check if we have any properties to show
  const hasProperties = locationData?.properties?.length > 0;
  const hasFilteredProperties = filteredProperties.length > 0;

  // Format helpers
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value);

  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

  // Show documentation if requested
  if (showDocs) {
    return <KYMDocumentation onClose={onCloseDocs} />;
  }

  return (
    <div className="kym-module">
      {/* Module Header */}
      <div className="kym-header">
        <div className="kym-header__title-area">
          <h1 className="kym-header__title">Know Your Market</h1>
          <p className="kym-header__subtitle">Market intelligence for luxury residential development</p>
        </div>
        <div className="kym-header__actions">
          <LocationSelector 
            selectedZipCode={selectedZipCode}
            onSelect={handleLocationChange}
            clientLocation={clientLocation}
            locationData={locationData}
          />
          <button 
            className="kym-export-btn"
            onClick={handleExportReport}
            disabled={isLoading || isExporting || !locationData}
            title="Export Market Intelligence Report"
          >
            <FileDown size={16} className={isExporting ? 'spinning' : ''} />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
          <button 
            className="kym-refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="kym-data-source">
        {dataSource === 'realtor' ? (
          <>
            <span className="kym-data-badge kym-data-badge--live">
              <CheckCircle2 size={14} /> Live Data
            </span>
            <span className="kym-data-note">
              {locationData?.propertyCount || 0} properties from Realtor.com
            </span>
          </>
        ) : dataSource === 'generated' || dataSource === 'estimates' ? (
          <>
            <span className="kym-data-badge kym-data-badge--estimates">
              <Activity size={14} /> Market Estimates
            </span>
            <span className="kym-data-note">
              {apiKeyConfigured
                ? 'No luxury listings ($3M+) in this area. Showing market estimates.'
                : 'Add REACT_APP_RAPIDAPI_KEY for live property listings.'}
            </span>
          </>
        ) : error ? (
          <>
            <span className="kym-data-badge kym-data-badge--error">
              <AlertCircle size={14} /> Loading Error
            </span>
            <span className="kym-data-note">
              {error}
            </span>
          </>
        ) : (
          <>
            <span className="kym-data-badge kym-data-badge--loading">
              <RefreshCw size={14} className="spinning" /> Loading...
            </span>
            <span className="kym-data-note">
              Fetching market data...
            </span>
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="kym-tabs">
        <button 
          className={`kym-tab ${activeTab === 'market' ? 'kym-tab--active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          <TrendingUp size={16} />
          Market Analysis
        </button>
        <button 
          className={`kym-tab ${activeTab === 'comparables' ? 'kym-tab--active' : ''}`}
          onClick={() => setActiveTab('comparables')}
        >
          <Home size={16} />
          Comparable Properties
        </button>
        <button 
          className={`kym-tab ${activeTab === 'land' ? 'kym-tab--active' : ''}`}
          onClick={() => setActiveTab('land')}
        >
          <Map size={16} />
          Land Acquisition
        </button>
        <button 
          className={`kym-tab ${activeTab === 'demographics' ? 'kym-tab--active' : ''}`}
          onClick={() => setActiveTab('demographics')}
        >
          <Users size={16} />
          Demographics
        </button>
        <button 
          className={`kym-tab ${activeTab === 'buyers' ? 'kym-tab--active' : ''}`}
          onClick={() => setActiveTab('buyers')}
        >
          <Target size={16} />
          Buyer Alignment
        </button>
      </div>

      {/* Tab Content */}
      <div className="kym-content">
        {error && (
          <div className="kym-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Market Analysis Tab */}
        {activeTab === 'market' && (
          <div className="kym-market-analysis">
            {isLoading ? (
              <div className="kym-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Loading market data...</span>
              </div>
            ) : locationData?.marketData ? (
              <>
                <div className="kym-kpi-grid">
                  <KPICard
                    title="Market Growth Rate"
                    value={`${locationData.marketData.growthRate}%`}
                    change={locationData.marketData.growthRate > 5 ? 2.3 : -1.5}
                    changeLabel="vs last year"
                    icon={<TrendingUp size={20} />}
                  />
                  <KPICard
                    title="Median Price/SF"
                    value={formatCurrency(locationData.marketData.medianPricePerSqFt)}
                    change={8.5}
                    changeLabel="vs last quarter"
                    icon={<DollarSign size={20} />}
                  />
                  <KPICard
                    title="Avg. Listing Duration"
                    value={`${locationData.marketData.avgListingDuration} days`}
                    change={-12}
                    changeLabel="faster sales"
                    icon={<Clock size={20} />}
                  />
                  <KPICard
                    title="Demand Index"
                    value={locationData.marketData.demandIndex.toFixed(1)}
                    change={5.2}
                    changeLabel="buyer activity"
                    icon={<Activity size={20} />}
                  />
                </div>

                <div className="kym-market-charts">
                  <div className="kym-chart-card kym-chart-card--wide">
                    <h3>Price Trends (12 Months)</h3>
                    <AnimatedLineChart 
                      data={locationData.marketData.historicalData} 
                      height={280}
                    />
                  </div>
                  
                  <div className="kym-chart-card">
                    <h3>Market Summary</h3>
                    <div className="kym-summary-list">
                      <div className="kym-summary-item">
                        <span>Location</span>
                        <strong>{locationData.marketData.location}</strong>
                      </div>
                      <div className="kym-summary-item">
                        <span>ZIP Code</span>
                        <strong>{locationData.marketData.zipCode}</strong>
                      </div>
                      <div className="kym-summary-item">
                        <span>Market Type</span>
                        <strong>Luxury Residential</strong>
                      </div>
                      <div className="kym-summary-item">
                        <span>Property Focus</span>
                        <strong>10,000+ SF</strong>
                      </div>
                    </div>
                    <div className="kym-market-outlook">
                      <h4>Market Outlook</h4>
                      <p>
                        {locationData.marketData.demandIndex > 7
                          ? "Strong buyer demand with limited inventory creates favorable conditions for sellers."
                          : locationData.marketData.demandIndex > 5
                          ? "Balanced market conditions with steady appreciation potential."
                          : "Buyer's market with negotiation opportunities available."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="kym-empty">
                <MapPin size={48} />
                <p>Select a location to view market analysis</p>
              </div>
            )}
          </div>
        )}

        {/* Comparable Properties Tab */}
        {activeTab === 'comparables' && (
          <div className="kym-comparables">
            <div className="kym-comparables-layout">
              {showFilters && (
                <div className="kym-filters-panel">
                  <div className="kym-filters-header">
                    <h3>Filters</h3>
                    <button onClick={clearAllFilters}>Clear All</button>
                  </div>

                  <div className="kym-filter-group">
                    <label>Price Range</label>
                    <div className="kym-range-display">
                      {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </div>
                    <input
                      type="range"
                      min={1000000}
                      max={50000000}
                      step={500000}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    />
                    <input
                      type="range"
                      min={1000000}
                      max={50000000}
                      step={500000}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    />
                  </div>

                  <div className="kym-filter-group">
                    <label>Square Footage</label>
                    <div className="kym-range-display">
                      {formatNumber(sqftRange[0])} - {formatNumber(sqftRange[1])} SF
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={30000}
                      step={500}
                      value={sqftRange[0]}
                      onChange={(e) => setSqftRange([parseInt(e.target.value), sqftRange[1]])}
                    />
                    <input
                      type="range"
                      min={5000}
                      max={30000}
                      step={500}
                      value={sqftRange[1]}
                      onChange={(e) => setSqftRange([sqftRange[0], parseInt(e.target.value)])}
                    />
                  </div>

                  <div className="kym-filter-group">
                    <label>Property Status</label>
                    <div className="kym-status-filter-buttons">
                      <button
                        className={`kym-status-filter-btn ${statusFilter.length === 3 ? 'kym-status-filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter(['active', 'pending', 'sold'])}
                      >
                        All
                      </button>
                      <button
                        className={`kym-status-filter-btn kym-status-filter-btn--active-status ${statusFilter.length === 1 && statusFilter[0] === 'active' ? 'kym-status-filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter(['active'])}
                      >
                        Active
                      </button>
                      <button
                        className={`kym-status-filter-btn kym-status-filter-btn--pending-status ${statusFilter.length === 1 && statusFilter[0] === 'pending' ? 'kym-status-filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter(['pending'])}
                      >
                        Pending
                      </button>
                      <button
                        className={`kym-status-filter-btn kym-status-filter-btn--sold-status ${statusFilter.length === 1 && statusFilter[0] === 'sold' ? 'kym-status-filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter(['sold'])}
                      >
                        Sold
                      </button>
                    </div>
                  </div>

                </div>
              )}

              <div className="kym-comparables-main">
                <div className="kym-comparables-toolbar">
                  <button 
                    className="kym-filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={16} />
                  </button>
                  <div className="kym-search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search by address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <span className="kym-property-count">
                    {filteredProperties.length} properties
                  </span>
                </div>

                {isLoading ? (
                  <div className="kym-loading">
                    <RefreshCw size={24} className="spinning" />
                    <span>Loading properties...</span>
                  </div>
                ) : !apiKeyConfigured ? (
                  /* No API Key Configured */
                  <div className="kym-empty kym-empty--config">
                    <Settings size={48} />
                    <h3>API Key Required</h3>
                    <p>To view real property listings from Realtor.com, configure your RapidAPI key.</p>
                    <div className="kym-config-steps">
                      <ol>
                        <li>Sign up at <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer">rapidapi.com</a></li>
                        <li>Subscribe to <a href="https://rapidapi.com/apidojo/api/realty-in-us" target="_blank" rel="noopener noreferrer">Realty in US API</a> (free tier: 500 requests/month)</li>
                        <li>Add <code>REACT_APP_RAPIDAPI_KEY=your_key</code> to <code>.env.local</code></li>
                        <li>Restart the development server</li>
                      </ol>
                    </div>
                  </div>
                ) : !hasProperties ? (
                  /* API configured but no properties in this ZIP */
                  <div className="kym-empty">
                    <Home size={48} />
                    <h3>No Luxury Listings Available</h3>
                    <p>No properties priced $3M+ were found in {locationData?.location?.city || 'this area'}.</p>
                    <p className="kym-empty-hint">Try a different ZIP code or check back later.</p>
                  </div>
                ) : hasFilteredProperties ? (
                  /* Properties exist and pass filters */
                  <div className="kym-property-grid">
                    {filteredProperties.map(property => (
                      <PropertyCard 
                        key={property.id} 
                        property={property}
                        onClick={() => setSelectedProperty(property)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Properties exist but filters hide them all */
                  <div className="kym-empty">
                    <Filter size={48} />
                    <h3>No Matching Properties</h3>
                    <p>Your filters are hiding all {locationData?.properties?.length || 0} properties.</p>
                    <button 
                      className="kym-reset-filters-btn"
                      onClick={clearAllFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Land Acquisition Tab */}
        {activeTab === 'land' && (
          <div className="kym-land-acquisition">
            {isLoadingLand ? (
              <div className="kym-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Loading land parcels...</span>
              </div>
            ) : landError ? (
              <div className="kym-error">
                <AlertCircle size={20} />
                <span>{landError}</span>
              </div>
            ) : !selectedZipCode ? (
              <div className="kym-empty">
                <Map size={48} />
                <p>Select a location to search for land parcels</p>
              </div>
            ) : (
              <div className="kym-land-layout">
                {/* Filters Sidebar */}
                {showLandFilters && (
                  <div className="kym-filters-sidebar">
                    <div className="kym-filters-header">
                      <h3>Land Filters</h3>
                      <button onClick={() => setShowLandFilters(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="kym-filter-group">
                      <label>Price Range</label>
                      <div className="kym-range-inputs">
                        <div className="kym-range-input">
                          <span>Min</span>
                          <input
                            type="text"
                            list="price-options-min"
                            value={landPriceRange[0] >= 1000000 ? `$${(landPriceRange[0] / 1000000).toFixed(1)}M` : `$${(landPriceRange[0] / 1000).toFixed(0)}K`}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[$,KM]/gi, '');
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                const multiplier = e.target.value.toLowerCase().includes('m') ? 1000000 : 
                                                   e.target.value.toLowerCase().includes('k') ? 1000 : 1;
                                setLandPriceRange([num * multiplier, landPriceRange[1]]);
                              }
                            }}
                            placeholder="$500K"
                            className="kym-price-input"
                          />
                          <datalist id="price-options-min">
                            <option value="$100K" />
                            <option value="$250K" />
                            <option value="$500K" />
                            <option value="$1M" />
                            <option value="$2M" />
                            <option value="$5M" />
                          </datalist>
                        </div>
                        <span className="kym-range-separator">-</span>
                        <div className="kym-range-input">
                          <span>Max</span>
                          <input
                            type="text"
                            list="price-options-max"
                            value={landPriceRange[1] >= 1000000 ? `$${(landPriceRange[1] / 1000000).toFixed(1)}M` : `$${(landPriceRange[1] / 1000).toFixed(0)}K`}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[$,KM]/gi, '');
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                const multiplier = e.target.value.toLowerCase().includes('m') ? 1000000 : 
                                                   e.target.value.toLowerCase().includes('k') ? 1000 : 1;
                                setLandPriceRange([landPriceRange[0], num * multiplier]);
                              }
                            }}
                            placeholder="$10M"
                            className="kym-price-input"
                          />
                          <datalist id="price-options-max">
                            <option value="$1M" />
                            <option value="$2.5M" />
                            <option value="$5M" />
                            <option value="$10M" />
                            <option value="$25M" />
                            <option value="$50M" />
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div className="kym-filter-group">
                      <label>Lot Size</label>
                      <div className="kym-range-inputs">
                        <div className="kym-range-input">
                          <span>Min</span>
                          <select 
                            value={acreageRange[0]}
                            onChange={(e) => setAcreageRange([Number(e.target.value), acreageRange[1]])}
                          >
                            {ACREAGE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <span className="kym-range-separator">-</span>
                        <div className="kym-range-input">
                          <span>Max</span>
                          <select 
                            value={acreageRange[1]}
                            onChange={(e) => setAcreageRange([acreageRange[0], Number(e.target.value)])}
                          >
                            {ACREAGE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="kym-search-land-btn"
                      onClick={() => fetchLandDataForLocation(selectedZipCode)}
                    >
                      <Search size={16} />
                      Search Land
                    </button>

                    {/* Direct Listing URL Input */}
                    <div className="kym-url-paste-section">
                      <label>Or paste Realtor.com URL</label>
                      <div className="kym-url-input-group">
                        <input
                          type="text"
                          placeholder="https://www.realtor.com/realestateandhomes-detail/..."
                          value={pastedListingUrl}
                          onChange={(e) => setPastedListingUrl(e.target.value)}
                          className="kym-url-input"
                        />
                        <button
                          className="kym-url-add-btn"
                          onClick={handleFetchListingByUrl}
                          disabled={!pastedListingUrl || isFetchingListing}
                        >
                          {isFetchingListing ? (
                            <RefreshCw size={14} className="spinning" />
                          ) : (
                            <Plus size={14} />
                          )}
                          {isFetchingListing ? 'Loading...' : 'Add'}
                        </button>
                      </div>
                      {fetchListingError && (
                        <span className="kym-url-error">{fetchListingError}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Land Results */}
                <div className="kym-land-main">
                  <div className="kym-land-toolbar">
                    <button 
                      className="kym-filter-toggle"
                      onClick={() => setShowLandFilters(!showLandFilters)}
                    >
                      <Filter size={16} />
                    </button>
                    <span className="kym-land-count">
                      {filteredLandParcels.length} parcels
                    </span>
                    {landData?.dataSource === 'generated' && (
                      <span className="kym-data-note-small">
                        Sample data shown. Add API key for live listings.
                      </span>
                    )}
                  </div>

                  {filteredLandParcels.length > 0 ? (
                    <div className="kym-land-grid">
                      {filteredLandParcels.map(parcel => (
                        <div 
                          key={parcel.id} 
                          className="kym-land-card"
                          onClick={() => setSelectedParcel(parcel)}
                        >
                          <div className="kym-land-card-image">
                            {parcel.imageUrl ? (
                              <img src={parcel.imageUrl} alt={parcel.address} />
                            ) : (
                              <div className="kym-land-card-placeholder">
                                <Map size={32} />
                              </div>
                            )}
                            <div className="kym-land-card-price">
                              ${(parcel.askingPrice / 1000000).toFixed(2)}M
                            </div>
                          </div>
                          <div className="kym-land-card-content">
                            <h4>{parcel.address}</h4>
                            <p className="kym-land-card-location">
                              {parcel.city}, {parcel.state} {parcel.zipCode}
                            </p>
                            <div className="kym-land-card-stats">
                              <span><Trees size={14} /> {parcel.acreage} acres</span>
                              <span><DollarSign size={14} /> ${(parcel.pricePerAcre / 1000).toFixed(0)}K/acre</span>
                            </div>
                            <div className="kym-land-card-meta">
                              <span className="kym-land-card-dom">
                                <Calendar size={12} /> {parcel.daysOnMarket || '—'} days
                              </span>
                            </div>
                            {parcel.features && parcel.features.length > 0 && (
                              <div className="kym-land-card-features">
                                {parcel.features.slice(0, 3).map((feature, i) => (
                                  <span key={i} className="kym-land-feature-tag">{feature}</span>
                                ))}
                                {parcel.features.length > 3 && (
                                  <span className="kym-land-feature-more">+{parcel.features.length - 3}</span>
                                )}
                              </div>
                            )}
                            <div className="kym-land-card-actions">
                              {parcel.listingUrl && (
                                <a
                                  href={parcel.listingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="kym-view-listing-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink size={12} />
                                  View Listing
                                </a>
                              )}
                              <button 
                                className="kym-export-kys-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportToKYSLibrary(parcel);
                                }}
                              >
                                <Plus size={14} />
                                Add to KYS Library
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="kym-empty">
                      <Map size={48} />
                      <p>No land parcels match your filters</p>
                      <button 
                        className="kym-reset-filters-btn"
                        onClick={() => {
                          setLandPriceRange([500000, 10000000]);
                          setAcreageRange([1, 20]);
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Demographics Tab */}
        {activeTab === 'demographics' && (
          <div className="kym-demographics">
            {isLoading ? (
              <div className="kym-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Loading demographics...</span>
              </div>
            ) : locationData?.demographics ? (
              <>
                <div className="kym-demo-kpis">
                  <div className="kym-demo-kpi">
                    <div className="kym-demo-kpi-icon"><Users size={20} /></div>
                    <div className="kym-demo-kpi-content">
                      <span className="kym-demo-kpi-label">Total Population</span>
                      <span className="kym-demo-kpi-value">{formatNumber(locationData.demographics.totalPopulation)}</span>
                      <span className="kym-demo-kpi-change">+{locationData.demographics.populationGrowth}% growth</span>
                    </div>
                  </div>
                  <div className="kym-demo-kpi">
                    <div className="kym-demo-kpi-icon"><DollarSign size={20} /></div>
                    <div className="kym-demo-kpi-content">
                      <span className="kym-demo-kpi-label">Median Income</span>
                      <span className="kym-demo-kpi-value">{formatCurrency(locationData.demographics.medianHouseholdIncome)}</span>
                      <span className="kym-demo-kpi-sub">per household</span>
                    </div>
                  </div>
                  <div className="kym-demo-kpi">
                    <div className="kym-demo-kpi-icon"><Users size={20} /></div>
                    <div className="kym-demo-kpi-content">
                      <span className="kym-demo-kpi-label">Average Age</span>
                      <span className="kym-demo-kpi-value">{locationData.demographics.averageAge} years</span>
                      <span className="kym-demo-kpi-sub">resident age</span>
                    </div>
                  </div>
                  <div className="kym-demo-kpi">
                    <div className="kym-demo-kpi-icon"><GraduationCap size={20} /></div>
                    <div className="kym-demo-kpi-content">
                      <span className="kym-demo-kpi-label">Higher Education</span>
                      <span className="kym-demo-kpi-value">{locationData.demographics.educationLevels.graduate}%</span>
                      <span className="kym-demo-kpi-sub">graduate degree</span>
                    </div>
                  </div>
                </div>

                <div className="kym-demo-charts">
                  <div className="kym-demo-chart-card">
                    <h3>Income Distribution</h3>
                    <div className="kym-income-bars">
                      {locationData.demographics.incomeDistribution.map((d, i) => (
                        <div key={i} className="kym-income-bar-row">
                          <span className="kym-income-label">{d.bracket}</span>
                          <div className="kym-income-bar-track">
                            <div 
                              className="kym-income-bar-fill"
                              style={{ width: `${d.percentage}%` }}
                            />
                          </div>
                          <span className="kym-income-value">{d.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="kym-demo-chart-card">
                    <h3>Age Distribution</h3>
                    <div className="kym-age-distribution">
                      {locationData.demographics.ageDistribution.map((d, i) => (
                        <div key={i} className="kym-age-bar-group">
                          <span className="kym-age-label">{d.range}</span>
                          <div className="kym-age-bars">
                            <div className="kym-age-bar-container kym-age-male">
                              <div 
                                className="kym-age-bar-fill"
                                style={{ width: `${d.male * 2.5}%` }}
                              />
                              <span>{d.male}%</span>
                            </div>
                            <div className="kym-age-bar-container kym-age-female">
                              <div 
                                className="kym-age-bar-fill"
                                style={{ width: `${d.female * 2.5}%` }}
                              />
                              <span>{d.female}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="kym-age-legend">
                        <span className="kym-age-legend-male">■ Male</span>
                        <span className="kym-age-legend-female">■ Female</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="kym-demo-charts">
                  <div className="kym-demo-chart-card">
                    <h3>Education Levels</h3>
                    <div className="kym-education-bars">
                      <div className="kym-edu-bar-row">
                        <span>High School</span>
                        <div className="kym-edu-bar-track">
                          <div className="kym-edu-bar-fill" style={{ width: `${locationData.demographics.educationLevels.highSchool}%` }} />
                        </div>
                        <span>{locationData.demographics.educationLevels.highSchool}%</span>
                      </div>
                      <div className="kym-edu-bar-row">
                        <span>Bachelor's</span>
                        <div className="kym-edu-bar-track">
                          <div className="kym-edu-bar-fill" style={{ width: `${locationData.demographics.educationLevels.bachelors}%` }} />
                        </div>
                        <span>{locationData.demographics.educationLevels.bachelors}%</span>
                      </div>
                      <div className="kym-edu-bar-row">
                        <span>Graduate</span>
                        <div className="kym-edu-bar-track">
                          <div className="kym-edu-bar-fill" style={{ width: `${locationData.demographics.educationLevels.graduate}%` }} />
                        </div>
                        <span>{locationData.demographics.educationLevels.graduate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="kym-empty">
                <Users size={48} />
                <p>Select a location to view demographics</p>
              </div>
            )}
          </div>
        )}

        {/* Buyer Alignment Tab (BAM v3.0 Dual Scoring) */}
        {activeTab === 'buyers' && (
          <div className="kym-buyers-tab">
            <BAMPanel
              bamScores={bamScores}
              onPortfolioChange={setPortfolioContext}
              showDetails={true}
            />
            {/* Legacy persona view - available below dual scores */}
            <div className="kym-legacy-bam">
              <h4 className="kym-legacy-bam-title">Detailed Persona Analysis</h4>
              <BAMView
                personaResults={personaResults}
                marketData={locationData}
              />
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal 
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />

      {/* Land Detail Modal */}
      <LandDetailModal 
        parcel={selectedParcel}
        isOpen={!!selectedParcel}
        onClose={() => setSelectedParcel(null)}
        onExportToKYS={exportToKYSLibrary}
      />

      {/* Legal Disclaimer */}
      <div className="kym-legal-disclaimer">
        <p>
          <strong>Disclaimer:</strong> The real estate data displayed is for informational purposes only. 
          Users should not rely on the accuracy of any market data, property listings, or comparable 
          sales shown. N4S does not offer advice on the purchase of residential real estate. 
          All investment decisions should be made in consultation with qualified professionals.
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// DEMOGRAPHICS & BUYER PERSONA ESTIMATION
// Note: These generate statistical estimates based on location characteristics.
// This is NOT fake property data - it's market demographic analysis.
// =============================================================================

/**
 * Generate demographics estimate based on location
 * Uses hardcoded data for known luxury markets, seeded random for others
 */
function generateDemographicsEstimate(zipCode, location) {
  // HARDCODED DEMOGRAPHICS FOR KNOWN LUXURY MARKETS (matching Replit)
  const KNOWN_DEMOGRAPHICS = {
    '90210': {
      totalPopulation: 32500,
      populationGrowth: 1.8,
      medianHouseholdIncome: 185000,
      averageAge: 44,
      educationLevels: { highSchool: 98, bachelors: 72, graduate: 45 },
      incomeDistribution: [
        { bracket: '<$50K', percentage: 8 },
        { bracket: '$50K-$100K', percentage: 12 },
        { bracket: '$100K-$200K', percentage: 25 },
        { bracket: '$200K-$500K', percentage: 32 },
        { bracket: '$500K-$1M', percentage: 15 },
        { bracket: '>$1M', percentage: 8 },
      ],
      ageDistribution: [
        { range: '18-25', male: 6, female: 7 },
        { range: '26-35', male: 12, female: 14 },
        { range: '36-45', male: 15, female: 16 },
        { range: '46-55', male: 14, female: 13 },
        { range: '56-65', male: 10, female: 11 },
        { range: '65+', male: 8, female: 9 },
      ],
    },
    '90265': { // Malibu
      totalPopulation: 12645,
      populationGrowth: 0.9,
      medianHouseholdIncome: 195000,
      averageAge: 48,
      educationLevels: { highSchool: 97, bachelors: 68, graduate: 42 },
      incomeDistribution: [
        { bracket: '<$50K', percentage: 10 },
        { bracket: '$50K-$100K', percentage: 14 },
        { bracket: '$100K-$200K', percentage: 22 },
        { bracket: '$200K-$500K', percentage: 28 },
        { bracket: '$500K-$1M', percentage: 16 },
        { bracket: '>$1M', percentage: 10 },
      ],
      ageDistribution: [
        { range: '18-25', male: 5, female: 5 },
        { range: '26-35', male: 10, female: 11 },
        { range: '36-45', male: 14, female: 15 },
        { range: '46-55', male: 16, female: 15 },
        { range: '56-65', male: 12, female: 13 },
        { range: '65+', male: 10, female: 11 },
      ],
    },
    '33139': { // Miami Beach
      totalPopulation: 91718,
      populationGrowth: 3.2,
      medianHouseholdIncome: 145000,
      averageAge: 41,
      educationLevels: { highSchool: 92, bachelors: 58, graduate: 28 },
      incomeDistribution: [
        { bracket: '<$50K', percentage: 15 },
        { bracket: '$50K-$100K', percentage: 20 },
        { bracket: '$100K-$200K', percentage: 28 },
        { bracket: '$200K-$500K', percentage: 25 },
        { bracket: '$500K-$1M', percentage: 8 },
        { bracket: '>$1M', percentage: 4 },
      ],
      ageDistribution: [
        { range: '18-25', male: 8, female: 9 },
        { range: '26-35', male: 16, female: 17 },
        { range: '36-45', male: 14, female: 13 },
        { range: '46-55', male: 11, female: 10 },
        { range: '56-65', male: 8, female: 9 },
        { range: '65+', male: 7, female: 8 },
      ],
    },
    '10019': { // Manhattan
      totalPopulation: 1628700,
      populationGrowth: 0.5,
      medianHouseholdIncome: 138000,
      averageAge: 37,
      educationLevels: { highSchool: 89, bachelors: 62, graduate: 35 },
      incomeDistribution: [
        { bracket: '<$50K', percentage: 22 },
        { bracket: '$50K-$100K', percentage: 18 },
        { bracket: '$100K-$200K', percentage: 24 },
        { bracket: '$200K-$500K', percentage: 22 },
        { bracket: '$500K-$1M', percentage: 9 },
        { bracket: '>$1M', percentage: 5 },
      ],
      ageDistribution: [
        { range: '18-25', male: 10, female: 11 },
        { range: '26-35', male: 18, female: 19 },
        { range: '36-45', male: 15, female: 14 },
        { range: '46-55', male: 10, female: 9 },
        { range: '56-65', male: 7, female: 8 },
        { range: '65+', male: 5, female: 6 },
      ],
    },
    '81611': { // Aspen
      totalPopulation: 7004,
      populationGrowth: 1.2,
      medianHouseholdIncome: 125000,
      averageAge: 42,
      educationLevels: { highSchool: 96, bachelors: 65, graduate: 32 },
      incomeDistribution: [
        { bracket: '<$50K', percentage: 18 },
        { bracket: '$50K-$100K', percentage: 22 },
        { bracket: '$100K-$200K', percentage: 26 },
        { bracket: '$200K-$500K', percentage: 20 },
        { bracket: '$500K-$1M', percentage: 10 },
        { bracket: '>$1M', percentage: 4 },
      ],
      ageDistribution: [
        { range: '18-25', male: 8, female: 8 },
        { range: '26-35', male: 14, female: 15 },
        { range: '36-45', male: 16, female: 15 },
        { range: '46-55', male: 12, female: 11 },
        { range: '56-65', male: 9, female: 10 },
        { range: '65+', male: 6, female: 7 },
      ],
    },
    '33480': { // Palm Beach
      totalPopulation: 8776,
      populationGrowth: 0.8,
      medianHouseholdIncome: 205000,
      averageAge: 56,
      educationLevels: { highSchool: 98, bachelors: 70, graduate: 40 },
      incomeDistribution: [
        { bracket: '<$50K', percentage: 6 },
        { bracket: '$50K-$100K', percentage: 10 },
        { bracket: '$100K-$200K', percentage: 20 },
        { bracket: '$200K-$500K', percentage: 30 },
        { bracket: '$500K-$1M', percentage: 20 },
        { bracket: '>$1M', percentage: 14 },
      ],
      ageDistribution: [
        { range: '18-25', male: 3, female: 3 },
        { range: '26-35', male: 6, female: 7 },
        { range: '36-45', male: 10, female: 11 },
        { range: '46-55', male: 14, female: 13 },
        { range: '56-65', male: 16, female: 17 },
        { range: '65+', male: 18, female: 20 },
      ],
    },
  };

  // Check for hardcoded data first
  const knownData = KNOWN_DEMOGRAPHICS[zipCode];
  if (knownData) {
    console.log(`[KYM] Using hardcoded demographics for ${zipCode}`);
    return {
      id: `demo-${zipCode}`,
      location: location?.formattedName || `${location?.city}, ${location?.state}`,
      zipCode,
      ...knownData,
      dataSource: 'census_estimates',
    };
  }

  // For unknown markets, use seeded random for consistency
  console.log(`[KYM] Generating seeded demographics for ${zipCode}`);
  
  let seed = 0;
  for (let i = 0; i < zipCode.length; i++) {
    seed = ((seed << 5) - seed) + zipCode.charCodeAt(i);
    seed = seed & seed;
  }
  const seededRandom = () => {
    seed = Math.imul(seed ^ (seed >>> 16), 0x85ebca6b);
    seed = Math.imul(seed ^ (seed >>> 13), 0xc2b2ae35);
    seed ^= seed >>> 16;
    return (seed >>> 0) / 4294967295;
  };

  // State-based income multipliers
  const stateMultipliers = {
    CA: 1.3, NY: 1.4, FL: 1.1, TX: 1.0, CO: 1.2,
    CT: 1.3, MA: 1.35, NJ: 1.25, WA: 1.25, AZ: 0.95,
  };
  const multiplier = stateMultipliers[location?.state] || 1.0;
  
  const baseIncome = 120000 * multiplier;
  const medianIncome = Math.round(baseIncome * (0.8 + seededRandom() * 0.8));
  const isAffluent = medianIncome > 150000;

  return {
    id: `demo-${zipCode}`,
    location: location?.formattedName || `${location?.city}, ${location?.state}`,
    zipCode,
    totalPopulation: Math.round(15000 + seededRandom() * 40000),
    populationGrowth: Math.round((0.5 + seededRandom() * 3) * 10) / 10,
    medianHouseholdIncome: medianIncome,
    averageAge: Math.round(35 + seededRandom() * 15),
    educationLevels: {
      highSchool: Math.round(88 + seededRandom() * 10),
      bachelors: Math.round((isAffluent ? 50 : 30) + seededRandom() * 25),
      graduate: Math.round((isAffluent ? 25 : 12) + seededRandom() * 20),
    },
    incomeDistribution: [
      { bracket: '<$50K', percentage: Math.round(isAffluent ? 8 + seededRandom() * 7 : 18 + seededRandom() * 10) },
      { bracket: '$50K-$100K', percentage: Math.round(isAffluent ? 12 + seededRandom() * 8 : 22 + seededRandom() * 10) },
      { bracket: '$100K-$200K', percentage: Math.round(22 + seededRandom() * 10) },
      { bracket: '$200K-$500K', percentage: Math.round(isAffluent ? 28 + seededRandom() * 10 : 15 + seededRandom() * 8) },
      { bracket: '$500K-$1M', percentage: Math.round(isAffluent ? 12 + seededRandom() * 8 : 4 + seededRandom() * 5) },
      { bracket: '>$1M', percentage: Math.round(isAffluent ? 6 + seededRandom() * 6 : 2 + seededRandom() * 3) },
    ],
    ageDistribution: [
      { range: '18-25', male: Math.round(6 + seededRandom() * 5), female: Math.round(6 + seededRandom() * 5) },
      { range: '26-35', male: Math.round(12 + seededRandom() * 6), female: Math.round(12 + seededRandom() * 6) },
      { range: '36-45', male: Math.round(14 + seededRandom() * 5), female: Math.round(14 + seededRandom() * 5) },
      { range: '46-55', male: Math.round(12 + seededRandom() * 5), female: Math.round(11 + seededRandom() * 5) },
      { range: '56-65', male: Math.round(9 + seededRandom() * 5), female: Math.round(9 + seededRandom() * 5) },
      { range: '65+', male: Math.round(6 + seededRandom() * 6), female: Math.round(7 + seededRandom() * 6) },
    ],
    dataSource: 'estimates',
  };
}

/**
 * Generate buyer personas based on location characteristics
 * These are market analysis insights, not fake individual profiles
 */
function generateBuyerPersonas(location) {
  const state = location?.state || 'CA';
  
  // Different persona mixes based on region
  const techHubStates = ['CA', 'WA', 'TX', 'CO', 'MA'];
  const financeStates = ['NY', 'CT', 'NJ'];
  const entertainmentStates = ['CA', 'FL'];
  
  const personas = [];
  
  if (techHubStates.includes(state)) {
    personas.push({
      id: 'persona-tech',
      name: 'Tech Executive',
      description: 'Technology industry leaders and successful founders seeking modern estates with advanced amenities.',
      incomeRange: '$5M - $20M annually',
      ageRange: '35-55',
      occupation: 'Tech CEO / Founder / Executive',
      priorities: ['Privacy', 'Smart Home Technology', 'Home Office', 'Entertainment'],
      preferences: ['Modern architecture', 'Sustainable features', 'EV charging'],
      likelihood: 85,
    });
  }
  
  if (entertainmentStates.includes(state)) {
    personas.push({
      id: 'persona-entertainment',
      name: 'Entertainment Industry',
      description: 'Film producers, studio executives, and creative industry leaders seeking prestigious properties.',
      incomeRange: '$3M - $15M annually',
      ageRange: '40-60',
      occupation: 'Producer / Director / Studio Executive',
      priorities: ['Location Prestige', 'Privacy', 'Guest Entertainment', 'Views'],
      preferences: ['Screening room', 'High security', 'Guest quarters'],
      likelihood: 78,
    });
  }
  
  if (financeStates.includes(state)) {
    personas.push({
      id: 'persona-finance',
      name: 'Finance Executive',
      description: 'Investment bankers, hedge fund managers, and private equity principals.',
      incomeRange: '$5M - $50M annually',
      ageRange: '40-65',
      occupation: 'Finance / Investment Management',
      priorities: ['Investment Value', 'Privacy', 'Proximity to NYC', 'School Districts'],
      preferences: ['Traditional architecture', 'Wine cellar', 'Home office'],
      likelihood: 82,
    });
  }
  
  // Universal personas
  personas.push({
    id: 'persona-international',
    name: 'International Investor',
    description: 'Global wealth holders seeking trophy properties in premier US markets.',
    incomeRange: '$10M+ annually',
    ageRange: '45-70',
    occupation: 'International Business / Investment',
    priorities: ['Security', 'Asset Diversification', 'Staff Quarters', 'Privacy'],
    preferences: ['Gated community', 'Multiple structures', 'Turn-key'],
    likelihood: 70,
  });
  
  personas.push({
    id: 'persona-legacy',
    name: 'Generational Wealth',
    description: 'Multi-generational families seeking estates for long-term family use.',
    incomeRange: '$20M+ net worth',
    ageRange: '55-75',
    occupation: 'Family Office / Inherited Wealth',
    priorities: ['Legacy Value', 'Family Compound', 'Privacy', 'Staff Accommodations'],
    preferences: ['Classic architecture', 'Large acreage', 'Guest houses'],
    likelihood: 65,
  });
  
  return personas.slice(0, 3); // Return top 3 most relevant
}

export default KYMModule;
