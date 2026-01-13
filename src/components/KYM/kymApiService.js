/**
 * kymApiService.js
 * 
 * Service for fetching live market data from Realtor.com via RapidAPI
 * and location validation via Zippopotam.us
 * 
 * APIs:
 * - Realty in US (by API Dojo): https://rapidapi.com/apidojo/api/realty-in-us
 * - Zippopotam.us (free): https://api.zippopotam.us
 * 
 * Architecture matches Replit Market-Intel:
 * - Hardcoded market data for known luxury markets
 * - Seeded random for consistent data on unknown markets
 * - Fallback property generation when API returns empty
 */

const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'realty-in-us.p.rapidapi.com';
const ZIPPOPOTAM_BASE_URL = 'https://api.zippopotam.us/us';

// Cache for API responses
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for property data
const LOCATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for location data

// ============================================================================
// HARDCODED LUXURY MARKET DATA (Matching Replit)
// ============================================================================

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

// Hardcoded market stats for known luxury markets (NOT random)
const KNOWN_MARKET_DATA = {
  '90210': {
    growthRate: 8.5,
    medianPricePerSqFt: 1850,
    avgListingDuration: 42,
    demandIndex: 8.2,
  },
  '90265': {
    growthRate: 11.2,
    medianPricePerSqFt: 2250,
    avgListingDuration: 52,
    demandIndex: 8.7,
  },
  '33139': {
    growthRate: 12.3,
    medianPricePerSqFt: 1250,
    avgListingDuration: 35,
    demandIndex: 9.1,
  },
  '10019': {
    growthRate: 5.2,
    medianPricePerSqFt: 2100,
    avgListingDuration: 55,
    demandIndex: 7.5,
  },
  '81611': {
    growthRate: 15.8,
    medianPricePerSqFt: 2400,
    avgListingDuration: 68,
    demandIndex: 6.8,
  },
  '33480': {
    growthRate: 9.7,
    medianPricePerSqFt: 1650,
    avgListingDuration: 48,
    demandIndex: 7.9,
  },
  '94027': {
    growthRate: 7.3,
    medianPricePerSqFt: 2800,
    avgListingDuration: 75,
    demandIndex: 6.5,
  },
  '06830': {
    growthRate: 6.8,
    medianPricePerSqFt: 1450,
    avgListingDuration: 62,
    demandIndex: 7.2,
  },
};

// State-based price multipliers for unknown markets
const STATE_BASE_PRICES = {
  CA: { basePricePerSqFt: 1200, incomeMultiplier: 1.3 },
  NY: { basePricePerSqFt: 1500, incomeMultiplier: 1.4 },
  FL: { basePricePerSqFt: 800, incomeMultiplier: 1.1 },
  TX: { basePricePerSqFt: 600, incomeMultiplier: 1.0 },
  CO: { basePricePerSqFt: 900, incomeMultiplier: 1.2 },
  WA: { basePricePerSqFt: 1000, incomeMultiplier: 1.25 },
  MA: { basePricePerSqFt: 1100, incomeMultiplier: 1.35 },
  IL: { basePricePerSqFt: 700, incomeMultiplier: 1.05 },
  AZ: { basePricePerSqFt: 550, incomeMultiplier: 1.0 },
  NV: { basePricePerSqFt: 650, incomeMultiplier: 1.05 },
  CT: { basePricePerSqFt: 1000, incomeMultiplier: 1.3 },
  NJ: { basePricePerSqFt: 900, incomeMultiplier: 1.2 },
};

// Luxury features for generated properties
const LUXURY_FEATURES = [
  'Private Pool', 'Wine Cellar', 'Home Theater', 'Smart Home', 'Guest House',
  'Tennis Court', 'Gym', 'Spa', "Chef's Kitchen", 'Ocean View', 'Mountain View',
  'Golf Course Access', 'Private Beach', 'Helipad', 'Car Gallery',
];

// Placeholder images for generated properties
const LUXURY_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
];

// ============================================================================
// SEEDED RANDOM (Consistent per ZIP code - matches Replit)
// ============================================================================

function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967295;
  };
}

// ============================================================================
// API KEY CHECK
// ============================================================================

export const hasApiKey = () => {
  // Check if key exists and is not a placeholder
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY.length < 10) return false;
  
  // Common placeholder patterns to reject
  const placeholders = [
    'your_api_key',
    'your_rapidapi_key',
    'your-api-key',
    'api_key_here',
    'insert_key',
    'placeholder',
    'xxxxxxxx',
  ];
  
  const keyLower = RAPIDAPI_KEY.toLowerCase();
  return !placeholders.some(p => keyLower.includes(p));
};

// ============================================================================
// LOCATION LOOKUP (Zippopotam.us - Free, No API Key Required)
// ============================================================================

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
        return null;
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

export const searchLocations = async (query) => {
  const cleanQuery = query.replace(/\D/g, '').slice(0, 5);
  
  if (cleanQuery.length < 5) {
    return [];
  }

  const location = await lookupZipCode(cleanQuery);
  return location ? [location] : [];
};

// ============================================================================
// CACHE HELPERS
// ============================================================================

const getCachedData = (key, ttl = CACHE_TTL) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`[KYM API] Cache hit for ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ============================================================================
// PROPERTY DATA (Realtor.com via RapidAPI)
// ============================================================================

/**
 * Fetch properties from Realtor.com API
 * Only fetches for_sale status (like Replit) for accurate data
 */
export const fetchProperties = async (zipCode, options = {}) => {
  const { limit = 50 } = options;

  if (!hasApiKey()) {
    console.log('[KYM API] No API key configured - will use generated fallback');
    return [];
  }

  const cacheKey = `properties-${zipCode}-${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  console.log(`[KYM API] Fetching properties for ${zipCode}...`);

  try {
    // Match Replit: only fetch for_sale, sorted by price desc
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
        status: ['for_sale'], // Only active listings like Replit
        sort: {
          direction: 'desc',
          field: 'list_price',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KYM API] Error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    const results = data.data?.home_search?.results || [];
    
    console.log(`[KYM API] API returned ${results.length} properties`);
    
    const properties = transformProperties(results);
    
    if (properties.length > 0) {
      setCachedData(cacheKey, properties);
    }
    
    console.log(`[KYM API] Transformed ${properties.length} valid properties`);
    return properties;
  } catch (error) {
    console.error('[KYM API] Fetch error:', error);
    return [];
  }
};

/**
 * Transform Realtor.com API response to our property format
 */
const transformProperties = (apiResults) => {
  return apiResults
    .filter(item => {
      const address = item.location?.address?.line;
      return address && address !== 'Address unavailable';
    })
    .map((item) => {
      const property = item;
      const location = property.location || {};
      const address = location.address || {};
      const description = property.description || {};
      
      // Handle missing sqft - default to reasonable estimate
      const sqft = description.sqft || 0;
      const listPrice = property.list_price || 0;
      const pricePerSqFt = sqft > 0 ? Math.round(listPrice / sqft) : 0;

      const features = mapFeatures(property.tags || [], property.flags || {});

      // Calculate days on market
      const listDate = property.list_date ? new Date(property.list_date) : null;
      const daysOnMarket = listDate 
        ? Math.max(1, Math.floor((Date.now() - listDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 30; // Default to 30 if no list date

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
        status: 'active', // We only fetch for_sale now
        daysOnMarket,
        propertyType,
        propertyTypeDisplay: formatPropertyType(propertyType),
        isLand,
        imageUrl: upgradeImageUrl(property.primary_photo?.href || (property.photos?.[0]?.href)),
        listingUrl: property.href || null,
        dataSource: 'realtor',
      };
    })
    .filter(p => p.id && p.askingPrice > 0);
};

/**
 * Upgrade thumbnail URLs to large resolution
 */
const upgradeImageUrl = (url) => {
  if (!url) return null;

  return url
    .replace(/-s\.jpg/gi, '-l.jpg')
    .replace(/-t\.jpg/gi, '-l.jpg')
    .replace(/-m\.jpg/gi, '-l.jpg')
    .replace(/s\.jpg$/i, 'l.jpg')
    .replace(/t\.jpg$/i, 'l.jpg')
    .replace(/m\.jpg$/i, 'l.jpg')
    .replace(/_s\.jpg/gi, '_l.jpg')
    .replace(/_t\.jpg/gi, '_l.jpg')
    .replace(/_m\.jpg/gi, '_l.jpg')
    .replace(/\/s\//g, '/l/')
    .replace(/\/t\//g, '/l/')
    .replace(/\/m\//g, '/l/');
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
 * Map property tags to features
 */
const mapFeatures = (tags = [], flags = {}) => {
  const featureMapping = {
    'pool': 'Private Pool',
    'swimming': 'Private Pool',
    'waterfront': 'Waterfront',
    'view': 'Views',
    'golf': 'Golf Course Access',
    'gated': 'Gated Community',
    'smart_home': 'Smart Home',
    'wine_cellar': 'Wine Cellar',
    'wine': 'Wine Cellar',
    'theater': 'Home Theater',
    'theatre': 'Home Theater',
    'screening': 'Home Theater',
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
  
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    for (const [key, value] of Object.entries(featureMapping)) {
      if (tagLower.includes(key)) {
        if (!features.includes(value)) features.push(value);
      }
    }
  });

  if (flags.is_new_construction) features.push('New Construction');
  
  return features.slice(0, 8);
};

// ============================================================================
// MARKET DATA (Hardcoded for known markets, seeded random for others)
// ============================================================================

/**
 * Generate historical data with seeded random for consistency
 */
const generateHistoricalData = (rand, basePrice, growthRate) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyGrowth = growthRate / 12 / 100;
  
  return months.map((month, i) => {
    // Calculate price trending upward
    const monthsBack = 11 - i;
    const price = basePrice / Math.pow(1 + monthlyGrowth, monthsBack);
    
    return {
      month,
      medianPrice: Math.round(price + (rand() - 0.5) * 500000),
      salesVolume: Math.round(8 + rand() * 15),
      daysOnMarket: Math.round(35 + rand() * 30),
    };
  });
};

/**
 * Get market data for a ZIP code
 * Uses hardcoded data for known luxury markets, seeded random for others
 */
export const getMarketData = (zipCode, location) => {
  // Check for hardcoded luxury market data first
  const knownData = KNOWN_MARKET_DATA[zipCode];
  
  if (knownData) {
    console.log(`[KYM API] Using hardcoded market data for ${zipCode}`);
    const rand = seededRandom(zipCode);
    const basePrice = knownData.medianPricePerSqFt * 12000;
    
    return {
      id: `market-${zipCode}`,
      location: `${location.city}, ${location.state}`,
      zipCode,
      growthRate: knownData.growthRate,
      medianPricePerSqFt: knownData.medianPricePerSqFt,
      avgListingDuration: knownData.avgListingDuration,
      demandIndex: knownData.demandIndex,
      historicalData: generateHistoricalData(rand, basePrice, knownData.growthRate),
      dataSource: 'known_market',
    };
  }

  // For unknown markets, use seeded random based on ZIP
  console.log(`[KYM API] Generating seeded market data for ${zipCode}`);
  const rand = seededRandom(zipCode);
  const stateData = STATE_BASE_PRICES[location.state] || { basePricePerSqFt: 700, incomeMultiplier: 1.0 };
  
  const priceVariance = 0.7 + rand() * 0.6;
  const medianPricePerSqFt = Math.round(stateData.basePricePerSqFt * priceVariance);
  const basePrice = medianPricePerSqFt * 12000;
  const growthRate = Math.round((3 + rand() * 15) * 10) / 10;
  
  return {
    id: `market-${zipCode}`,
    location: `${location.city}, ${location.state}`,
    zipCode,
    growthRate,
    medianPricePerSqFt,
    avgListingDuration: Math.round(30 + rand() * 60),
    demandIndex: Math.round((5 + rand() * 5) * 10) / 10,
    historicalData: generateHistoricalData(rand, basePrice, growthRate),
    dataSource: 'estimates',
  };
};

// ============================================================================
// FALLBACK PROPERTY GENERATION (When API returns empty)
// ============================================================================

/**
 * Generate fallback properties with seeded random for consistency
 */
export const generateFallbackProperties = (zipCode, location) => {
  console.log(`[KYM API] Generating fallback properties for ${zipCode}`);
  
  const rand = seededRandom(zipCode);
  const stateData = STATE_BASE_PRICES[location.state] || { basePricePerSqFt: 700, incomeMultiplier: 1.0 };
  const properties = [];
  
  const streetNames = [
    'Main Street', 'Oak Avenue', 'Park Boulevard', 'Lake Drive', 'Hill Road',
    'Valley Way', 'Forest Lane', 'Sunset Drive', 'River Road', 'Mountain View',
    'Estate Lane', 'Royal Palm Drive', 'Canyon Road', 'Harbor View', 'Vista Circle',
  ];
  
  const numProperties = 8 + Math.floor(rand() * 12);
  
  for (let i = 0; i < numProperties; i++) {
    const sqft = 10000 + Math.floor(rand() * 10000);
    const priceVariance = 0.7 + rand() * 0.6;
    const pricePerSqFt = Math.round(stateData.basePricePerSqFt * priceVariance);
    const askingPrice = sqft * pricePerSqFt;
    
    const statuses = ['active', 'active', 'active', 'pending', 'sold'];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const soldPrice = status === 'sold' ? askingPrice * (0.92 + rand() * 0.1) : null;
    
    const numFeatures = 3 + Math.floor(rand() * 5);
    const shuffled = [...LUXURY_FEATURES].sort(() => 0.5 - rand());
    const features = shuffled.slice(0, numFeatures);

    properties.push({
      id: `${zipCode}-gen-${i}`,
      address: `${100 + i * 50} ${streetNames[i % streetNames.length]}`,
      city: location.city,
      state: location.state,
      zipCode,
      askingPrice: Math.round(askingPrice),
      soldPrice: soldPrice ? Math.round(soldPrice) : null,
      pricePerSqFt,
      sqft,
      beds: 5 + Math.floor(rand() * 4),
      baths: 6 + Math.floor(rand() * 6),
      acreage: 0.5 + rand() * 3,
      yearBuilt: 2010 + Math.floor(rand() * 14),
      features,
      status,
      daysOnMarket: Math.floor(rand() * 120),
      imageUrl: LUXURY_PROPERTY_IMAGES[i % LUXURY_PROPERTY_IMAGES.length],
      dataSource: 'generated',
    });
  }

  return properties;
};

// ============================================================================
// MAIN FETCH FUNCTION
// ============================================================================

/**
 * Fetch all location data (market + properties + demographics)
 */
export const fetchLocationData = async (zipCode) => {
  // Validate ZIP code first
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

  // Get market data (hardcoded or seeded)
  const marketData = getMarketData(zipCode, locationInfo);

  // Try to fetch real properties from API
  let properties = await fetchProperties(zipCode);
  let dataSource = 'realtor';
  
  // If API returns empty, generate fallback properties
  if (properties.length === 0) {
    properties = generateFallbackProperties(zipCode, locationInfo);
    dataSource = hasApiKey() ? 'generated' : 'generated';
    console.log(`[KYM API] Using ${properties.length} generated fallback properties`);
  } else {
    console.log(`[KYM API] Using ${properties.length} real properties from Realtor.com`);
  }

  return {
    location: locationInfo,
    marketData,
    properties,
    propertyCount: properties.length,
    dataSource,
    apiKeyConfigured: hasApiKey(),
  };
};

// ============================================================================
// LAND SEARCH (Lot/Land Parcels)
// ============================================================================

// Land feature mapping from API tags
const LAND_FEATURE_MAPPING = {
  'waterfront': 'Waterfront',
  'water front': 'Waterfront',
  'ocean': 'Ocean View',
  'ocean_view': 'Ocean View',
  'lake': 'Lake View',
  'lake_view': 'Lake View',
  'river': 'River View',
  'river_view': 'River View',
  'mountain': 'Hill/Mtn View',
  'hill': 'Hill/Mtn View',
  'city_view': 'City View',
  'city view': 'City View',
  'golf': 'Golf Course',
  'golf_course': 'Golf Course',
  'corner': 'Corner Lot',
  'corner_lot': 'Corner Lot',
  'cul-de-sac': 'Cul-de-sac',
  'culdesac': 'Cul-de-sac',
  'cul_de_sac': 'Cul-de-sac',
  'gated': 'Gated Community',
  'private': 'Private Road',
  'wooded': 'Wooded',
  'cleared': 'Cleared',
  'flat': 'Flat Terrain',
  'sloped': 'Sloped',
  'utilities': 'Utilities Available',
};

/**
 * Map land tags to display features
 */
const mapLandFeatures = (tags = []) => {
  const features = [];
  
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    for (const [key, value] of Object.entries(LAND_FEATURE_MAPPING)) {
      if (tagLower.includes(key)) {
        if (!features.includes(value)) features.push(value);
      }
    }
  });
  
  return features;
};

/**
 * Fetch land/lot listings from Realtor.com API
 */
export const fetchLandListings = async (zipCode, options = {}) => {
  const { 
    limit = 50,
    minAcreage = 0.25,
    maxAcreage = 100,
    minPrice = 100000,
    maxPrice = 50000000,
  } = options;

  if (!hasApiKey()) {
    console.log('[KYM API] No API key configured for land search');
    return [];
  }

  const cacheKey = `land-${zipCode}-${minAcreage}-${maxAcreage}-${minPrice}-${maxPrice}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  console.log(`[KYM API] Fetching land listings for ${zipCode}...`);

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
        status: ['for_sale'],
        type: ['land'], // Only land/lots
        sort: {
          direction: 'desc',
          field: 'list_price',
        },
        lot_sqft: {
          min: Math.round(minAcreage * 43560),
          max: Math.round(maxAcreage * 43560),
        },
        list_price: {
          min: minPrice,
          max: maxPrice,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KYM API] Land search error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    const results = data.data?.home_search?.results || [];
    
    console.log(`[KYM API] Land API returned ${results.length} parcels`);
    
    const landParcels = transformLandListings(results);
    
    if (landParcels.length > 0) {
      setCachedData(cacheKey, landParcels);
    }
    
    return landParcels;
  } catch (error) {
    console.error('[KYM API] Land fetch error:', error);
    return [];
  }
};

/**
 * Transform Realtor.com API response to land parcel format
 */
const transformLandListings = (apiResults) => {
  return apiResults
    .filter(item => {
      const address = item.location?.address?.line;
      return address && address !== 'Address unavailable';
    })
    .map((item) => {
      const property = item;
      const location = property.location || {};
      const address = location.address || {};
      const description = property.description || {};
      
      const lotSqft = description.lot_sqft || 0;
      const acreage = lotSqft > 0 ? lotSqft / 43560 : 0;
      const listPrice = property.list_price || 0;
      const pricePerAcre = acreage > 0 ? Math.round(listPrice / acreage) : 0;

      const features = mapLandFeatures(property.tags || []);

      // Calculate days on market
      const listDate = property.list_date ? new Date(property.list_date) : null;
      const daysOnMarket = listDate 
        ? Math.max(1, Math.floor((Date.now() - listDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 30;

      return {
        id: property.property_id,
        address: address.line,
        city: address.city || '',
        state: address.state_code || address.state || '',
        zipCode: address.postal_code || '',
        askingPrice: listPrice,
        pricePerAcre,
        acreage: Math.round(acreage * 100) / 100,
        lotSqft,
        features,
        status: 'active',
        daysOnMarket,
        zoning: description.zoning || 'Residential',
        imageUrl: upgradeImageUrl(property.primary_photo?.href || (property.photos?.[0]?.href)),
        listingUrl: property.href || null,
        dataSource: 'realtor',
        latitude: location.coordinate?.lat || null,
        longitude: location.coordinate?.lon || null,
      };
    })
    .filter(p => p.id && p.askingPrice > 0 && p.acreage > 0);
};

/**
 * Generate fallback land parcels when API returns empty
 */
export const generateFallbackLandParcels = (zipCode, location) => {
  console.log(`[KYM API] Generating fallback land parcels for ${zipCode}`);
  
  const rand = seededRandom(zipCode + '-land');
  const stateData = STATE_BASE_PRICES[location.state] || { basePricePerSqFt: 700, incomeMultiplier: 1.0 };
  const parcels = [];
  
  const streetNames = [
    'Ranch Road', 'Mountain View Drive', 'Valley Lane', 'Hilltop Circle', 
    'Sunset Boulevard', 'Oak Ridge Road', 'River Road', 'Meadow Lane',
    'Estate Drive', 'Vista Court', 'Canyon Road', 'Ridgeline Way',
  ];
  
  const possibleFeatures = [
    'Waterfront', 'Ocean View', 'Lake View', 'Hill/Mtn View', 'City View',
    'Golf Course', 'Corner Lot', 'Cul-de-sac', 'Gated Community', 'Wooded',
    'Cleared', 'Flat Terrain', 'Utilities Available',
  ];
  
  const numParcels = 6 + Math.floor(rand() * 8);
  
  for (let i = 0; i < numParcels; i++) {
    const acreage = Math.round((0.5 + rand() * 10) * 100) / 100;
    const basePricePerAcre = stateData.basePricePerSqFt * 43560 * 0.05 * (0.5 + rand() * 1);
    const askingPrice = Math.round(acreage * basePricePerAcre);
    
    const numFeatures = 2 + Math.floor(rand() * 4);
    const shuffled = [...possibleFeatures].sort(() => 0.5 - rand());
    const features = shuffled.slice(0, numFeatures);

    parcels.push({
      id: `${zipCode}-land-${i}`,
      address: `${1000 + i * 100} ${streetNames[i % streetNames.length]}`,
      city: location.city,
      state: location.state,
      zipCode,
      askingPrice,
      pricePerAcre: Math.round(basePricePerAcre),
      acreage,
      lotSqft: Math.round(acreage * 43560),
      features,
      status: 'active',
      daysOnMarket: Math.floor(30 + rand() * 180),
      zoning: 'Residential',
      imageUrl: LUXURY_PROPERTY_IMAGES[i % LUXURY_PROPERTY_IMAGES.length],
      dataSource: 'generated',
      latitude: null,
      longitude: null,
    });
  }

  return parcels;
};

/**
 * Fetch land data for a location
 */
export const fetchLandData = async (zipCode, options = {}) => {
  // Validate ZIP code first
  let locationInfo = await lookupZipCode(zipCode);
  
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
    } else {
      return {
        error: 'Invalid ZIP code',
        location: null,
        parcels: [],
        dataSource: null,
        apiKeyConfigured: hasApiKey(),
      };
    }
  }

  // Try to fetch real land listings from API
  let parcels = await fetchLandListings(zipCode, options);
  let dataSource = 'realtor';
  
  // If API returns empty, generate fallback parcels
  if (parcels.length === 0) {
    parcels = generateFallbackLandParcels(zipCode, locationInfo);
    dataSource = 'generated';
    console.log(`[KYM API] Using ${parcels.length} generated fallback land parcels`);
  } else {
    console.log(`[KYM API] Using ${parcels.length} real land parcels from Realtor.com`);
  }

  return {
    location: locationInfo,
    parcels,
    parcelCount: parcels.length,
    dataSource,
    apiKeyConfigured: hasApiKey(),
  };
};

// ============================================================================
// FETCH PROPERTY BY ID (from pasted URL)
// ============================================================================

/**
 * Parse address info from Realtor.com URL
 * URL format: /1818-Franklin-Canyon-Dr_Beverly-Hills_CA_90210_M90172-52608
 */
const parseAddressFromUrl = (url) => {
  try {
    // Extract the path part after /realestateandhomes-detail/
    const pathMatch = url.match(/realestateandhomes-detail\/([^?]+)/);
    if (!pathMatch) return null;
    
    const path = pathMatch[1];
    // Split by underscore: ADDRESS_CITY_STATE_ZIP_ID
    const parts = path.split('_');
    
    if (parts.length < 4) return null;
    
    // Last part is the property ID (M12345-67890)
    // Second to last is ZIP
    // Third to last is State
    // Everything before that is address and city
    
    const propertyIdPart = parts[parts.length - 1]; // M90172-52608
    const zipCode = parts[parts.length - 2]; // 90210
    const state = parts[parts.length - 3]; // CA
    
    // City is the part before state (may have hyphens)
    const city = parts[parts.length - 4].replace(/-/g, ' '); // Beverly-Hills → Beverly Hills
    
    // Address is everything before city
    const addressParts = parts.slice(0, parts.length - 4);
    const address = addressParts.join(' ').replace(/-/g, ' '); // 1818-Franklin-Canyon-Dr → 1818 Franklin Canyon Dr
    
    return {
      address: address || 'Unknown Address',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      propertyId: propertyIdPart,
    };
  } catch (e) {
    console.error('[KYM API] Error parsing URL:', e);
    return null;
  }
};

/**
 * Fetch property by URL using the list API (which works!)
 * Searches by ZIP code and looks for matching property ID
 */
export const fetchPropertyByUrl = async (originalUrl) => {
  // Parse address from URL first
  const urlParsed = parseAddressFromUrl(originalUrl);
  
  if (!urlParsed || !urlParsed.zipCode) {
    console.log('[KYM API] Could not parse ZIP from URL');
    return createBaseParsedParcel(urlParsed, originalUrl);
  }
  
  const propertyId = urlParsed.propertyId;
  console.log(`[KYM API] Searching for property ${propertyId} in ZIP ${urlParsed.zipCode}...`);

  if (!hasApiKey()) {
    console.log('[KYM API] No API key - using URL-parsed data');
    return createBaseParsedParcel(urlParsed, originalUrl);
  }

  try {
    // Helper function to search API
    const searchProperties = async (searchParams) => {
      const response = await fetch('https://realty-in-us.p.rapidapi.com/properties/v3/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        console.error('[KYM API] List search error:', response.status);
        return [];
      }

      const data = await response.json();
      return data.data?.home_search?.results || [];
    };

    // FIRST: Try general search (all property types)
    console.log(`[KYM API] Searching for ${propertyId} in ZIP ${urlParsed.zipCode}...`);
    let results = await searchProperties({
      limit: 200,
      offset: 0,
      postal_code: urlParsed.zipCode,
      status: ['for_sale', 'ready_to_build', 'pending'],
      sort: { direction: 'desc', field: 'list_date' },
    });

    console.log(`[KYM API] General search returned ${results.length} properties`);
    let property = results.find(p => p.property_id === propertyId);

    // SECOND: If not found, try land-specific search
    if (!property) {
      console.log('[KYM API] Not in general results, trying land-specific search...');
      results = await searchProperties({
        limit: 100,
        offset: 0,
        postal_code: urlParsed.zipCode,
        status: ['for_sale'],
        type: ['land'],
        sort: { direction: 'desc', field: 'list_price' },
      });

      console.log(`[KYM API] Land search returned ${results.length} parcels`);
      property = results.find(p => p.property_id === propertyId);
    }

    if (!property) {
      console.log('[KYM API] Property not found in any search results, using URL-parsed data');
      return createBaseParsedParcel(urlParsed, originalUrl);
    }

    console.log('[KYM API] Found property!', property);
    
    // Transform to our format (same as transformLandListings)
    const location = property.location || {};
    const address = location.address || {};
    const description = property.description || {};
    
    const lotSqft = description.lot_sqft || 0;
    const acreage = lotSqft > 0 ? lotSqft / 43560 : 0;
    const listPrice = property.list_price || 0;
    const pricePerAcre = acreage > 0 ? Math.round(listPrice / acreage) : 0;

    // Calculate days on market
    const listDate = property.list_date ? new Date(property.list_date) : null;
    const daysOnMarket = listDate 
      ? Math.max(1, Math.floor((Date.now() - listDate.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      id: propertyId,
      address: address.line || urlParsed.address,
      city: address.city || urlParsed.city,
      state: address.state_code || address.state || urlParsed.state,
      zipCode: address.postal_code || urlParsed.zipCode,
      askingPrice: listPrice,
      pricePerAcre,
      acreage: Math.round(acreage * 100) / 100,
      lotSqft,
      sqft: description.sqft || 0,
      beds: description.beds || 0,
      baths: description.baths || 0,
      features: [],
      status: property.status || 'active',
      daysOnMarket,
      zoning: description.zoning || 'Residential',
      yearBuilt: description.year_built || null,
      imageUrl: upgradeImageUrl(property.primary_photo?.href || (property.photos?.[0]?.href)),
      listingUrl: originalUrl || property.href || null,
      dataSource: 'realtor',
      latitude: location.coordinate?.lat || null,
      longitude: location.coordinate?.lon || null,
    };
  } catch (error) {
    console.error('[KYM API] Property search error:', error);
    return createBaseParsedParcel(urlParsed, originalUrl);
  }
};

/**
 * Helper to create a basic parcel from URL-parsed data
 */
const createBaseParsedParcel = (urlParsed, originalUrl) => {
  return {
    id: urlParsed?.propertyId || `url-${Date.now()}`,
    address: urlParsed?.address || 'Property Details',
    city: urlParsed?.city || '',
    state: urlParsed?.state || '',
    zipCode: urlParsed?.zipCode || '',
    askingPrice: 0,
    pricePerAcre: 0,
    acreage: 0,
    lotSqft: 0,
    features: [],
    status: 'active',
    daysOnMarket: null,
    zoning: 'Residential',
    imageUrl: null,
    listingUrl: originalUrl,
    dataSource: 'url_parsed',
  };
};

export default {
  hasApiKey,
  lookupZipCode,
  searchLocations,
  fetchProperties,
  fetchLocationData,
  getMarketData,
  generateFallbackProperties,
  fetchLandListings,
  fetchLandData,
  generateFallbackLandParcels,
  fetchPropertyByUrl,
};
