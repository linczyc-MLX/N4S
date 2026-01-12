/**
 * kymApiService.js
 * 
 * Service for fetching live market data from Realtor.com via RapidAPI
 * 
 * API: Realty in US (by API Dojo)
 * Docs: https://rapidapi.com/apidojo/api/realty-in-us
 */

const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'realty-in-us.p.rapidapi.com';

// Cache for API responses (30 minute TTL)
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Check if we have a valid API key configured
 */
export const hasApiKey = () => {
  return Boolean(RAPIDAPI_KEY && RAPIDAPI_KEY.length > 10);
};

/**
 * Get cached data if valid
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
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
 */
export const fetchProperties = async (zipCode, options = {}) => {
  const {
    limit = 50,
    minPrice = 3000000, // Lower to get more results for filtering
    status = ['for_sale', 'ready_to_build'],
  } = options;

  const cacheKey = `properties-${zipCode}-${limit}-${minPrice}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) {
    throw new Error('API key not configured');
  }

  console.log(`[KYM API] Fetching properties for ${zipCode}...`);

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
      // Note: Removed sqft filter to allow client-side filtering of all property sizes
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[KYM API] Error:', response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Transform API response to our format
  const properties = transformProperties(data.data?.home_search?.results || []);
  
  setCachedData(cacheKey, properties);
  console.log(`[KYM API] Fetched ${properties.length} properties`);
  
  return properties;
};

/**
 * Transform Realtor.com API response to our property format
 */
const transformProperties = (apiResults) => {
  return apiResults.map((item, index) => {
    const property = item;
    const location = property.location || {};
    const address = location.address || {};
    const description = property.description || {};
    
    const sqft = description.sqft || 10000;
    const listPrice = property.list_price || 10000000;
    const pricePerSqFt = sqft > 0 ? Math.round(listPrice / sqft) : 0;

    // Map features from property tags
    const features = mapFeatures(property.tags || [], property.flags || {});

    // Calculate days on market
    const listDate = property.list_date ? new Date(property.list_date) : new Date();
    const daysOnMarket = Math.floor((Date.now() - listDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: property.property_id || `prop-${index}`,
      address: address.line || 'Address unavailable',
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
      daysOnMarket: Math.max(0, daysOnMarket),
      // Try multiple image sources - API returns different structures
      imageUrl: property.primary_photo?.href 
        || (property.photos && property.photos[0]?.href) 
        || null,
      // Listing URL - construct from property_id if href not available
      listingUrl: property.href 
        || (property.property_id ? `https://www.realtor.com/realestateandhomes-detail/${property.property_id}` : null),
      dataSource: 'realtor',
    };
  });
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
    'pool': 'Private Pool',
    'waterfront': 'Waterfront',
    'view': 'Views',
    'golf': 'Golf Course Access',
    'gated': 'Gated Community',
    'smart_home': 'Smart Home',
    'wine_cellar': 'Wine Cellar',
    'theater': 'Home Theater',
    'gym': 'Gym',
    'spa': 'Spa',
    'tennis': 'Tennis Court',
    'guest_house': 'Guest House',
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
 */
export const fetchLocationData = async (zipCode) => {
  // Fetch properties
  const properties = await fetchProperties(zipCode);
  
  // Calculate market data from properties
  const marketData = await fetchMarketData(zipCode, properties);
  
  // Get location info
  const market = LUXURY_MARKETS.find(m => m.zipCode === zipCode) || {
    zipCode,
    city: properties[0]?.city || 'Unknown',
    state: properties[0]?.state || '',
  };

  return {
    location: {
      zipCode: market.zipCode,
      city: market.city,
      state: market.state,
      formattedName: `${market.city}, ${market.state}`,
    },
    marketData,
    properties,
    dataSource: 'realtor',
  };
};

export default {
  hasApiKey,
  fetchProperties,
  fetchMarketData,
  fetchLocationData,
};
