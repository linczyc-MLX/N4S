/**
 * kymApiService.js
 * 
 * Service for fetching live market data from Realtor.com via RapidAPI
 * and location validation via Zippopotam.us
 * 
 * APIs:
 * - Realty in US (by API Dojo): https://rapidapi.com/apidojo/api/realty-in-us
 * - Zippopotam.us (free): https://api.zippopotam.us
 */

const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'realty-in-us.p.rapidapi.com';
const ZIPPOPOTAM_BASE_URL = 'https://api.zippopotam.us/us';

// Cache for API responses
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for property data
const LOCATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for location data

/**
 * Check if we have a valid API key configured
 */
export const hasApiKey = () => {
  return Boolean(RAPIDAPI_KEY && RAPIDAPI_KEY.length > 10);
};

// ============================================================================
// LOCATION LOOKUP (Zippopotam.us - Free, No API Key Required)
// ============================================================================

/**
 * Search for a location by ZIP code using Zippopotam.us
 * Returns location info if valid ZIP, null if invalid
 */
export const lookupZipCode = async (zipCode) => {
  const cleanZip = zipCode.replace(/\D/g, '').slice(0, 5);
  
  if (cleanZip.length !== 5) {
    return null;
  }

  const cacheKey = `location-${cleanZip}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < LOCATION_CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`${ZIPPOPOTAM_BASE_URL}/${cleanZip}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Invalid ZIP code
      }
      throw new Error(`Zippopotam API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      return null;
    }

    const place = data.places[0];
    const locationData = {
      zipCode: data['post code'],
      city: place['place name'],
      state: place['state abbreviation'],
      stateFull: place.state,
      formattedName: `${place['place name']}, ${place['state abbreviation']} ${data['post code']}`,
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
    };

    cache.set(cacheKey, { data: locationData, timestamp: Date.now() });
    return locationData;
  } catch (error) {
    console.error('[KYM API] Location lookup error:', error);
    return null;
  }
};

/**
 * Search locations by partial ZIP code (for autocomplete)
 * Note: Zippopotam only does exact matches, so we validate if it's a complete ZIP
 */
export const searchLocations = async (query) => {
  const cleanQuery = query.replace(/\D/g, '').slice(0, 5);
  
  if (cleanQuery.length < 5) {
    return []; // Need complete 5-digit ZIP for Zippopotam
  }

  const location = await lookupZipCode(cleanQuery);
  return location ? [location] : [];
};

// ============================================================================
// PROPERTY DATA (Realtor.com via RapidAPI - Requires API Key)
// ============================================================================

/**
 * Get cached data if valid
 */
const getCachedData = (key, ttl = CACHE_TTL) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`[KYM API] Cache hit for ${key}`);
    return cached.data;
  }
  return null;
};

/**
 * Store data in cache
 */
const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Fetch properties from Realtor.com API
 * Returns real property listings with real URLs, or empty array if no API key/no results
 */
export const fetchProperties = async (zipCode, options = {}) => {
  const {
    limit = 50,
    minPrice = 1000000, // Lowered from $3M to capture more luxury listings
    status = ['for_sale', 'ready_to_build', 'pending', 'sold'],
  } = options;

  // No API key = no properties (we don't generate fake ones)
  if (!hasApiKey()) {
    console.log('[KYM API] No API key configured - cannot fetch properties');
    return [];
  }

  const cacheKey = `properties-${zipCode}-${limit}-${minPrice}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  console.log(`[KYM API] Fetching properties for ${zipCode}...`);

  try {
    const response = await fetch('https://realty-in-us.p.rapidapi.com/properties/v3/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      body: JSON.stringify({
        limit,
        offset: 0,
        postal_code: zipCode,
        status,
        sort: {
          direction: 'desc',
          field: 'list_price',
        },
        list_price: {
          min: minPrice,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KYM API] Error:', response.status, errorText);
      return []; // Return empty, not fake data
    }

    const data = await response.json();
    
    // Transform API response - only real properties with real URLs
    const properties = transformProperties(data.data?.home_search?.results || []);
    
    setCachedData(cacheKey, properties);
    console.log(`[KYM API] Fetched ${properties.length} real properties`);
    
    return properties;
  } catch (error) {
    console.error('[KYM API] Fetch error:', error);
    return []; // Return empty on error, never fake data
  }
};

/**
 * Upgrade thumbnail image URLs to large resolution
 */
const upgradeImageUrl = (url) => {
  if (!url) return null;
  return url
    .replace(/-s\.jpg/gi, '-l.jpg')   // small → large
    .replace(/-t\.jpg/gi, '-l.jpg')   // thumb → large
    .replace(/-m\.jpg/gi, '-l.jpg');  // medium → large
};

/**
 * Format property type for display
 */
const formatPropertyType = (type) => {
  if (!type) return 'Single Family';
  const typeMap = {
    'single_family': 'Single Family',
    'condo': 'Condo',
    'townhouse': 'Townhouse',
    'multi_family': 'Multi Family',
    'land': 'Land',
    'farm': 'Farm/Ranch',
    'mobile': 'Mobile',
    'apartment': 'Apartment',
  };
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Transform Realtor.com API response to our property format
 * IMPORTANT: Only includes real data from API - no fabricated URLs or addresses
 */
const transformProperties = (apiResults) => {
  return apiResults
    .filter(item => {
      // Only include properties with real addresses
      const address = item.location?.address?.line;
      return address && address !== 'Address unavailable';
    })
    .map((item) => {
      const property = item;
      const location = property.location || {};
      const address = location.address || {};
      const description = property.description || {};
      
      const sqft = description.sqft || 0;
      const listPrice = property.list_price || 0;
      const pricePerSqFt = sqft > 0 ? Math.round(listPrice / sqft) : 0;

      // Map features from property tags
      const features = mapFeatures(property.tags || [], property.flags || {});

      // Calculate days on market
      const listDate = property.list_date ? new Date(property.list_date) : null;
      const daysOnMarket = listDate 
        ? Math.max(0, Math.floor((Date.now() - listDate.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      // Get property type
      const propertyType = description.type || 'single_family';
      const isLand = ['land', 'farm'].includes(propertyType);

      return {
        id: property.property_id,
        address: address.line,
        city: address.city || '',
        state: address.state_code || address.state || '',
        zipCode: address.postal_code || '',
        askingPrice: listPrice,
        soldPrice: property.sold_price || null,
        pricePerSqFt,
        sqft,
        beds: description.beds || 0,
        baths: description.baths || description.baths_full || 0,
        acreage: description.lot_sqft ? description.lot_sqft / 43560 : 0,
        yearBuilt: description.year_built || null,
        features,
        status: mapStatus(property.status),
        daysOnMarket,
        // Property type fields
        propertyType,
        propertyTypeDisplay: formatPropertyType(propertyType),
        isLand,
        // REAL image URL from API - upgraded to large resolution
        imageUrl: upgradeImageUrl(property.primary_photo?.href || (property.photos?.[0]?.href)),
        // REAL listing URL from API - this is the actual Realtor.com link
        listingUrl: property.href || null,
        dataSource: 'realtor',
      };
    })
    .filter(p => p.id && p.askingPrice > 0); // Fixed: was listPrice, now askingPrice
};

/**
 * Map API status to our status format
 */
const mapStatus = (apiStatus) => {
  const statusMap = {
    'for_sale': 'active',
    'ready_to_build': 'active',
    'pending': 'pending',
    'sold': 'sold',
    'off_market': 'sold',
  };
  return statusMap[apiStatus] || 'active';
};

/**
 * Map property tags to our feature list
 */
const mapFeatures = (tags = [], flags = {}) => {
  const featureMapping = {
    'pool': 'Swimming Pool',
    'swimming': 'Swimming Pool',
    'waterfront': 'Waterfront',
    'view': 'Views',
    'golf': 'Golf Course Access',
    'gated': 'Gated Community',
    'smart_home': 'Smart Home',
    'wine_cellar': 'Wine Cellar',
    'wine': 'Wine Cellar',
    'theater': 'Theater',
    'theatre': 'Theater',
    'screening': 'Theater',
    'gym': 'Gym',
    'spa': 'Spa',
    'tennis': 'Tennis Court',
    'guest_house': 'Guest House',
    'guest house': 'Guest House',
    'casita': 'Guest House',
    'elevator': 'Elevator',
    'lift': 'Elevator',
    'office': 'Den or Office',
    'den': 'Den or Office',
    'study': 'Den or Office',
    'library': 'Den or Office',
  };

  const features = [];
  
  // Map from tags
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    for (const [key, value] of Object.entries(featureMapping)) {
      if (tagLower.includes(key)) {
        if (!features.includes(value)) features.push(value);
      }
    }
  });

  // Add from flags
  if (flags.is_new_construction) features.push('New Construction');
  if (flags.is_senior_community) features.push('Senior Community');
  
  return features;
};

/**
 * Fetch location/market data
 * Note: The free tier doesn't include detailed market statistics.
 * We generate estimates based on property data.
 */
export const fetchMarketData = async (zipCode, properties = []) => {
  if (properties.length === 0) {
    return null;
  }

  // Calculate market statistics from property data
  const prices = properties.map(p => p.askingPrice).sort((a, b) => a - b);
  const pricesPerSqFt = properties.map(p => p.pricePerSqFt).filter(p => p > 0).sort((a, b) => a - b);
  const daysOnMarket = properties.map(p => p.daysOnMarket).sort((a, b) => a - b);

  const medianPrice = prices[Math.floor(prices.length / 2)] || 0;
  const medianPricePerSqFt = pricesPerSqFt[Math.floor(pricesPerSqFt.length / 2)] || 0;
  const avgListingDuration = daysOnMarket.length > 0 
    ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length)
    : 60;

  // Estimate growth rate and demand index based on listing duration
  const growthRate = avgListingDuration < 30 ? 12 + Math.random() * 5 
    : avgListingDuration < 60 ? 8 + Math.random() * 4 
    : 3 + Math.random() * 5;
  
  const demandIndex = avgListingDuration < 30 ? 8 + Math.random() * 2
    : avgListingDuration < 60 ? 6 + Math.random() * 2
    : 4 + Math.random() * 2;

  // Generate historical data (estimated trend)
  const historicalData = generateHistoricalData(medianPrice, growthRate);

  const market = LUXURY_MARKETS.find(m => m.zipCode === zipCode) || 
    { city: properties[0]?.city || 'Unknown', state: properties[0]?.state || '' };

  return {
    id: `market-${zipCode}`,
    location: `${market.city}, ${market.state}`,
    zipCode,
    medianPrice,
    medianPricePerSqFt,
    avgListingDuration,
    growthRate: parseFloat(growthRate.toFixed(1)),
    demandIndex: parseFloat(demandIndex.toFixed(1)),
    historicalData,
    propertyCount: properties.length,
    dataSource: 'realtor',
  };
};

/**
 * Generate estimated historical data based on current median and growth rate
 */
const generateHistoricalData = (currentMedian, annualGrowth) => {
  const monthlyGrowth = annualGrowth / 12 / 100;
  const data = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Work backwards from current price
    const monthsBack = 11 - i;
    const price = currentMedian / Math.pow(1 + monthlyGrowth, monthsBack);
    
    // Estimate sales volume (inverse relationship with price)
    const baseVolume = 15;
    const volumeVariation = Math.random() * 10 - 5;
    const salesVolume = Math.max(5, Math.round(baseVolume + volumeVariation));
    
    data.push({
      month: date.toLocaleString('default', { month: 'short' }),
      medianPrice: Math.round(price),
      salesVolume,
      daysOnMarket: Math.round(30 + Math.random() * 40),
    });
  }
  
  return data;
};

/**
 * Known luxury markets for reference
 */
const LUXURY_MARKETS = [
  { zipCode: '90210', city: 'Beverly Hills', state: 'CA' },
  { zipCode: '90265', city: 'Malibu', state: 'CA' },
  { zipCode: '33139', city: 'Miami Beach', state: 'FL' },
  { zipCode: '10019', city: 'Manhattan', state: 'NY' },
  { zipCode: '81611', city: 'Aspen', state: 'CO' },
  { zipCode: '33480', city: 'Palm Beach', state: 'FL' },
  { zipCode: '94027', city: 'Atherton', state: 'CA' },
  { zipCode: '94301', city: 'Palo Alto', state: 'CA' },
  { zipCode: '06830', city: 'Greenwich', state: 'CT' },
];

/**
 * Main function to fetch all location data
 * Uses Zippopotam.us for location validation (free)
 * Uses Realtor.com for property data (requires API key)
 */
export const fetchLocationData = async (zipCode) => {
  // First, try to validate the ZIP code using Zippopotam
  let locationInfo = await lookupZipCode(zipCode);
  
  // Fallback to known markets if Zippopotam fails
  if (!locationInfo) {
    const knownMarket = LUXURY_MARKETS.find(m => m.zipCode === zipCode);
    if (knownMarket) {
      locationInfo = {
        zipCode: knownMarket.zipCode,
        city: knownMarket.city,
        state: knownMarket.state,
        stateFull: knownMarket.state,
        formattedName: `${knownMarket.city}, ${knownMarket.state} ${knownMarket.zipCode}`,
        latitude: 0,
        longitude: 0,
      };
      console.log('[KYM API] Using known market fallback for', zipCode);
    } else {
      return {
        error: 'Invalid ZIP code',
        location: null,
        marketData: null,
        properties: [],
        dataSource: null,
        apiKeyConfigured: hasApiKey(),
      };
    }
  }

  // Fetch real properties from Realtor.com (requires API key)
  // This returns [] if no API key configured - we do NOT generate fake properties
  const properties = await fetchProperties(zipCode);
  
  // Generate market data - from real properties if available, otherwise estimates
  let marketData;
  if (properties.length > 0) {
    // Calculate from real data
    marketData = await fetchMarketData(zipCode, properties);
  } else {
    // Generate market estimates based on location (not fake listings!)
    marketData = generateMarketEstimates(zipCode, locationInfo);
  }

  return {
    location: locationInfo,
    marketData,
    properties,
    propertyCount: properties.length,
    dataSource: properties.length > 0 ? 'realtor' : 'estimates',
    apiKeyConfigured: hasApiKey(),
  };
};

/**
 * Generate market estimates when no live property data available
 * This is statistical estimation, not fake listings
 */
const generateMarketEstimates = (zipCode, location) => {
  // Seeded random for consistency
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

  // State-based price multipliers
  const stateMultipliers = {
    CA: 1.8, NY: 2.0, FL: 1.3, TX: 0.9, CO: 1.4,
    CT: 1.6, MA: 1.5, NJ: 1.4, WA: 1.3, AZ: 0.85,
  };
  const multiplier = stateMultipliers[location?.state] || 1.0;
  
  const basePricePerSqFt = 800 * multiplier;
  const medianPricePerSqFt = Math.round(basePricePerSqFt * (0.8 + seededRandom() * 0.4));
  const medianPrice = medianPricePerSqFt * 12000; // Typical luxury home size

  // Generate historical trend
  const historicalData = [];
  const monthlyGrowth = (0.05 + seededRandom() * 0.08) / 12;
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthsBack = 11 - i;
    const price = medianPrice / Math.pow(1 + monthlyGrowth, monthsBack);
    
    historicalData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      medianPrice: Math.round(price),
      salesVolume: Math.round(8 + seededRandom() * 12),
      daysOnMarket: Math.round(35 + seededRandom() * 45),
    });
  }

  return {
    id: `market-${zipCode}`,
    location: location?.formattedName || `${location?.city}, ${location?.state}`,
    zipCode,
    medianPrice,
    medianPricePerSqFt,
    avgListingDuration: Math.round(40 + seededRandom() * 40),
    growthRate: parseFloat((5 + seededRandom() * 10).toFixed(1)),
    demandIndex: parseFloat((5 + seededRandom() * 4).toFixed(1)),
    historicalData,
    dataSource: 'estimates',
    dataNote: 'Market estimates based on regional characteristics. Configure API key for live data.',
  };
};

export default {
  hasApiKey,
  lookupZipCode,
  searchLocations,
  fetchProperties,
  fetchMarketData,
  fetchLocationData,
};
