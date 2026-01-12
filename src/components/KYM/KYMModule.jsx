/**
 * KYMModule.jsx - Know Your Market
 * 
 * Market intelligence module that provides:
 * 1. Market Analysis - Local market trends and KPIs
 * 2. Comparable Properties - Live property data via API
 * 3. Demographics - Population analysis and buyer personas
 * 
 * Uses client's project location from KYC data when available.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, DollarSign, Clock, Activity, RefreshCw,
  Home, Users, MapPin, Search, Filter, LayoutGrid, BarChart2,
  Bed, Bath, Maximize, Trees, Calendar, ExternalLink,
  GraduationCap, ChevronDown, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import KYMDocumentation from './KYMDocumentation';
import * as kymApi from './kymApiService';
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

const LocationSelector = ({ selectedZipCode, onSelect, clientLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // For now, filter from LUXURY_MARKETS. In production, this would call the API
      const filtered = LUXURY_MARKETS.filter(m => 
        m.zipCode.includes(query) || 
        m.city.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectedMarket = LUXURY_MARKETS.find(m => m.zipCode === selectedZipCode) || 
    { zipCode: selectedZipCode, city: 'Unknown', state: '' };

  return (
    <div className="kym-location-selector">
      <button 
        className="kym-location-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={16} />
        <span>{selectedMarket.city}, {selectedMarket.state} ({selectedMarket.zipCode})</span>
        <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
      </button>
      
      {isOpen && (
        <div className="kym-location-dropdown">
          <div className="kym-location-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by ZIP or city..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          {clientLocation && (
            <div className="kym-location-section">
              <div className="kym-location-section-title">From Your Project</div>
              <button 
                className="kym-location-option kym-location-option--highlight"
                onClick={() => { onSelect(clientLocation.zipCode || '90210'); setIsOpen(false); }}
              >
                <MapPin size={14} />
                {clientLocation.city}, {clientLocation.country}
              </button>
            </div>
          )}
          
          <div className="kym-location-section">
            <div className="kym-location-section-title">Luxury Markets</div>
            {LUXURY_MARKETS.map(market => (
              <button
                key={market.zipCode}
                className={`kym-location-option ${market.zipCode === selectedZipCode ? 'kym-location-option--active' : ''}`}
                onClick={() => { onSelect(market.zipCode); setIsOpen(false); }}
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
  const { kycData } = useAppContext();
  const [activeTab, setActiveTab] = useState('market');
  const [selectedZipCode, setSelectedZipCode] = useState('90210');
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('generated');
  
  // Filters for comparable properties
  const [priceRange, setPriceRange] = useState([5000000, 25000000]);
  const [sqftRange, setSqftRange] = useState([10000, 20000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // Get client location from KYC if available
  const clientLocation = kycData?.principal?.projectParameters?.projectCity ? {
    city: kycData.principal.projectParameters.projectCity,
    country: kycData.principal.projectParameters.projectCountry,
    zipCode: null // Would need to be looked up
  } : null;

  // Fetch location data - tries live API first, falls back to mock
  const fetchLocationData = useCallback(async (zipCode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if API key is configured
      if (kymApi.hasApiKey()) {
        console.log('[KYM] Attempting live API fetch...');
        try {
          const liveData = await kymApi.fetchLocationData(zipCode);
          
          // Merge with demographics (API doesn't provide this)
          const mockData = generateMockLocationData(zipCode);
          const fullData = {
            ...liveData,
            demographics: mockData.demographics,
            buyerPersonas: mockData.buyerPersonas,
          };
          
          setLocationData(fullData);
          setDataSource('realtor');
          console.log('[KYM] Live data loaded successfully');
          return;
        } catch (apiError) {
          console.warn('[KYM] Live API failed, falling back to mock:', apiError.message);
        }
      } else {
        console.log('[KYM] No API key configured, using sample data');
      }
      
      // Fallback to mock data
      const mockData = generateMockLocationData(zipCode);
      setLocationData(mockData);
      setDataSource('generated');
    } catch (err) {
      setError(err.message || 'Failed to fetch location data');
      setLocationData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocationData(selectedZipCode);
  }, [selectedZipCode, fetchLocationData]);

  const handleLocationChange = (zipCode) => {
    setSelectedZipCode(zipCode);
  };

  // Filter properties
  const filteredProperties = (locationData?.properties || []).filter(property => {
    const matchesPrice = property.askingPrice >= priceRange[0] && property.askingPrice <= priceRange[1];
    const matchesSqft = property.sqft >= sqftRange[0] && property.sqft <= sqftRange[1];
    const matchesSearch = !searchQuery || 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPrice && matchesSqft && matchesSearch;
  });

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
          />
          <button 
            className="kym-refresh-btn"
            onClick={() => fetchLocationData(selectedZipCode)}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="kym-data-source">
        <span className={`kym-data-badge kym-data-badge--${dataSource}`}>
          {dataSource === 'realtor' ? (
            <><CheckCircle2 size={14} /> Live Data</>
          ) : (
            <><AlertCircle size={14} /> Sample Data</>
          )}
        </span>
        {dataSource === 'generated' && (
          <span className="kym-data-note">
            Configure RAPIDAPI_KEY for live property data
          </span>
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
          className={`kym-tab ${activeTab === 'demographics' ? 'kym-tab--active' : ''}`}
          onClick={() => setActiveTab('demographics')}
        >
          <Users size={16} />
          Demographics
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
                    <button onClick={() => {
                      setPriceRange([5000000, 25000000]);
                      setSqftRange([10000, 20000]);
                      setSearchQuery('');
                    }}>Clear All</button>
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
                    <div className="kym-status-badges">
                      <span className="kym-status-badge kym-status-badge--active">Active</span>
                      <span className="kym-status-badge kym-status-badge--pending">Pending</span>
                      <span className="kym-status-badge kym-status-badge--sold">Sold</span>
                    </div>
                  </div>

                  <div className="kym-filter-group">
                    <label>Features</label>
                    <div className="kym-feature-badges">
                      <span className="kym-feature-badge">Pool</span>
                      <span className="kym-feature-badge">Wine Cellar</span>
                      <span className="kym-feature-badge">Theater</span>
                      <span className="kym-feature-badge">Guest House</span>
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
                ) : filteredProperties.length > 0 ? (
                  <div className="kym-property-grid">
                    {filteredProperties.map(property => (
                      <PropertyCard 
                        key={property.id} 
                        property={property}
                        onClick={() => {/* Open detail modal */}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="kym-empty">
                    <Search size={48} />
                    <h3>No properties found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                  </div>
                )}
              </div>
            </div>
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

                {/* Buyer Personas Section */}
                <div className="kym-personas-section">
                  <h2>Target Buyer Personas</h2>
                  <p className="kym-personas-subtitle">
                    Identified demographic groups most likely to invest in luxury residences
                  </p>
                  
                  {locationData.buyerPersonas && locationData.buyerPersonas.length > 0 ? (
                    <div className="kym-personas-grid">
                      {locationData.buyerPersonas.map(persona => (
                        <BuyerPersonaCard key={persona.id} persona={persona} />
                      ))}
                    </div>
                  ) : (
                    <div className="kym-empty">
                      <Users size={48} />
                      <p>No buyer personas available for this location</p>
                    </div>
                  )}

                  {/* Feature Priority Matrix */}
                  <div className="kym-feature-priorities">
                    <h3>Must-Have Features by Priority</h3>
                    <div className="kym-priority-grid">
                      {[
                        { feature: 'Gourmet Kitchen', priority: 95 },
                        { feature: 'Private Pool & Spa', priority: 92 },
                        { feature: 'Security System', priority: 90 },
                        { feature: 'Smart Home Technology', priority: 88 },
                        { feature: 'Home Theater', priority: 85 },
                        { feature: 'Eco-Friendly Features', priority: 80 },
                        { feature: 'Wine Cellar', priority: 78 },
                        { feature: 'Guest House', priority: 72 },
                        { feature: 'Tennis Court', priority: 65 },
                      ].map((item, i) => (
                        <div key={i} className="kym-priority-item">
                          <div className="kym-priority-header">
                            <span>{item.feature}</span>
                            <span className="kym-priority-badge">{item.priority}%</span>
                          </div>
                          <div className="kym-priority-bar">
                            <div 
                              className="kym-priority-fill"
                              style={{ width: `${item.priority}%` }}
                            />
                          </div>
                        </div>
                      ))}
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
      </div>
    </div>
  );
};

// =============================================================================
// MOCK DATA GENERATOR (Replace with real API calls)
// =============================================================================

function generateMockLocationData(zipCode) {
  const market = LUXURY_MARKETS.find(m => m.zipCode === zipCode) || 
    { zipCode, city: 'Unknown', state: 'XX' };
  
  const location = `${market.city}, ${market.state}`;
  
  // Generate historical data for 12 months
  const historicalData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    historicalData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      medianPrice: 12000000 + Math.random() * 4000000,
      salesVolume: Math.floor(5 + Math.random() * 15),
      daysOnMarket: Math.floor(30 + Math.random() * 60),
    });
  }

  // Generate mock properties
  const properties = [];
  const addresses = [
    '123 Sunset Boulevard', '456 Canyon Drive', '789 Palm Avenue',
    '321 Ocean View Lane', '654 Mountain Ridge Road', '987 Estate Circle',
    '147 Luxury Lane', '258 Prestige Place', '369 Grand Avenue',
    '741 Elite Estates', '852 Premier Way', '963 Mansion Mile'
  ];
  
  const features = [
    'Private Pool', 'Wine Cellar', 'Home Theater', 'Smart Home',
    'Guest House', 'Tennis Court', 'Gym', 'Spa', 'Chef\'s Kitchen',
    'Ocean View', 'Mountain View', 'Golf Course Access'
  ];

  for (let i = 0; i < 12; i++) {
    const sqft = 10000 + Math.floor(Math.random() * 10000);
    const pricePerSqFt = 1200 + Math.floor(Math.random() * 800);
    const askingPrice = sqft * pricePerSqFt;
    const selectedFeatures = features
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 4));
    
    properties.push({
      id: `prop-${zipCode}-${i}`,
      address: addresses[i % addresses.length],
      city: market.city,
      state: market.state,
      zipCode: market.zipCode,
      askingPrice,
      soldPrice: Math.random() > 0.7 ? askingPrice * (0.95 + Math.random() * 0.1) : null,
      pricePerSqFt,
      sqft,
      beds: 5 + Math.floor(Math.random() * 4),
      baths: 6 + Math.floor(Math.random() * 5),
      acreage: 0.5 + Math.random() * 3,
      yearBuilt: 2010 + Math.floor(Math.random() * 14),
      features: selectedFeatures,
      status: ['active', 'active', 'active', 'pending', 'sold'][Math.floor(Math.random() * 5)],
      daysOnMarket: Math.floor(Math.random() * 120),
      imageUrl: null,
      listingUrl: null,
      dataSource: 'generated',
    });
  }

  // Generate buyer personas
  const buyerPersonas = [
    {
      id: 'persona-1',
      name: 'Tech Entrepreneur',
      description: 'Successful startup founders and tech executives seeking private, high-tech estates with modern amenities.',
      incomeRange: '$5M - $20M annually',
      ageRange: '35-50',
      occupation: 'Tech CEO / Founder',
      priorities: ['Privacy', 'Smart Home', 'Home Office', 'Entertainment'],
      preferences: ['Modern architecture', 'Sustainable features'],
      likelihood: 85,
    },
    {
      id: 'persona-2',
      name: 'Entertainment Executive',
      description: 'Film producers, studio executives, and entertainment industry leaders seeking prestigious addresses.',
      incomeRange: '$3M - $15M annually',
      ageRange: '40-60',
      occupation: 'Entertainment Industry',
      priorities: ['Location', 'Privacy', 'Guest Entertaining', 'Views'],
      preferences: ['Traditional luxury', 'Screening room'],
      likelihood: 78,
    },
    {
      id: 'persona-3',
      name: 'International Investor',
      description: 'Global wealth holders seeking trophy properties in prestigious US markets.',
      incomeRange: '$10M+ annually',
      ageRange: '45-65',
      occupation: 'Investment / Finance',
      priorities: ['Security', 'Investment Value', 'Staff Quarters', 'Privacy'],
      preferences: ['Gated community', 'Multiple structures'],
      likelihood: 72,
    },
  ];

  return {
    location: {
      zipCode: market.zipCode,
      city: market.city,
      state: market.state,
      stateFull: market.state,
      formattedName: location,
      latitude: 34.0736,
      longitude: -118.4004,
    },
    marketData: {
      id: `market-${zipCode}`,
      location,
      zipCode: market.zipCode,
      growthRate: 5 + Math.random() * 8,
      medianPricePerSqFt: 1400 + Math.floor(Math.random() * 600),
      avgListingDuration: 45 + Math.floor(Math.random() * 45),
      demandIndex: 6 + Math.random() * 3,
      historicalData,
    },
    demographics: {
      id: `demo-${zipCode}`,
      location,
      zipCode: market.zipCode,
      totalPopulation: 30000 + Math.floor(Math.random() * 20000),
      populationGrowth: 1.5 + Math.random() * 2,
      medianHouseholdIncome: 150000 + Math.floor(Math.random() * 150000),
      averageAge: 38 + Math.floor(Math.random() * 10),
      educationLevels: {
        highSchool: 95 + Math.floor(Math.random() * 5),
        bachelors: 55 + Math.floor(Math.random() * 25),
        graduate: 25 + Math.floor(Math.random() * 25),
      },
      incomeDistribution: [
        { bracket: '$200K+', percentage: 35 + Math.floor(Math.random() * 20) },
        { bracket: '$150K-$200K', percentage: 15 + Math.floor(Math.random() * 10) },
        { bracket: '$100K-$150K', percentage: 15 + Math.floor(Math.random() * 10) },
        { bracket: '$75K-$100K', percentage: 10 + Math.floor(Math.random() * 10) },
        { bracket: 'Under $75K', percentage: 10 + Math.floor(Math.random() * 10) },
      ],
      ageDistribution: [
        { range: '0-17', male: 8, female: 7 },
        { range: '18-34', male: 12, female: 11 },
        { range: '35-54', male: 18, female: 17 },
        { range: '55-74', male: 14, female: 15 },
        { range: '75+', male: 4, female: 5 },
      ],
    },
    properties,
    buyerPersonas,
    dataSource: 'generated',
  };
}

export default KYMModule;
