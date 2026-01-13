# KYM (Know Your Market) Module Specification

**Last Updated:** January 13, 2026  
**Version:** 2.0

---

## Overview

The KYM module provides comprehensive market intelligence for luxury residential development. It enables N4S advisors to analyze local markets, compare properties, evaluate land acquisition opportunities, understand demographics, and identify target buyer personas.

---

## Module Architecture

```
src/components/KYM/
├── KYMModule.jsx          # Main module (~2,400 lines)
├── KYMModule.css          # N4S-branded styles (~1,500 lines)
├── KYMDocumentation.jsx   # 4-tab documentation component
├── kymApiService.js       # Realtor.com API integration (~1,100 lines)
├── BAMScoring.js          # Buyer Alignment Model scoring engine
├── BAMComponents.jsx      # BAM visualization components
├── KYMReportGenerator.js  # PDF report generation
└── index.js               # Module exports
```

---

## Tab Structure

KYM has **5 main tabs**:

| Tab | Purpose |
|-----|---------|
| **Market Analysis** | KPIs, trends, market outlook |
| **Comparable Properties** | Active listings for sale |
| **Land Acquisition** | Land parcels, URL paste feature |
| **Demographics** | Population, income, education data |
| **Buyer Alignment** | BAM persona matching & scoring |

---

## Tab 1: Market Analysis

### Features
- **Location Selector**: ZIP code search with auto-complete
- **4 Key Performance Indicators (KPIs)**:
  - Growth Rate (% year-over-year)
  - Median Price per Sq Ft
  - Average Listing Duration (days)
  - Demand Index (1-10 scale)
- **12-Month Trend Chart**: Visual bar chart of price trends
- **Market Outlook**: AI-generated summary based on demand index

### Data Sources
- Known luxury markets (hardcoded: Beverly Hills, Malibu, Aspen, etc.)
- Seeded random generation for unknown markets (consistent per ZIP)

---

## Tab 2: Comparable Properties

### Features
- **Property Grid**: Cards displaying active listings
- **Property Cards Show**:
  - Photo (from Realtor.com or gradient placeholder)
  - Address, City, State, ZIP
  - Price with $/SF calculation
  - Beds, Baths, Sq Ft, Acreage
  - Status badge (Active/Pending/Sold)
  - Days on Market
  - "View Listing" link → opens Realtor.com
- **Filters**:
  - Search by address
  - Filter toggle button
- **Property Detail Modal**: Click card for expanded view

### Data Flow
```
ZIP Code → kymApi.fetchProperties() 
         → /properties/v3/list API
         → transformProperties()
         → Display in grid
```

---

## Tab 3: Land Acquisition

### Features

#### 3.1 Land Search
- **Location**: Uses same ZIP as Market Analysis
- **Filters Sidebar**:
  - **Price Range**: Min/Max with manual input + dropdown suggestions
    - Supports formats: `$500K`, `$2.5M`, `$10M`
  - **Lot Size**: Dropdown (¼ acre → 100+ acres)
- **Search Button**: Fetches land parcels from API

#### 3.2 Land Cards
Each land parcel card displays:
- Photo or "Land Parcel" placeholder
- Price badge (e.g., "$6.50M")
- Address, City, State, ZIP
- Acreage and Price per Acre
- Days on Market
- **"View Listing"** link → opens Realtor.com
- **"Add to KYS Library"** button → exports to KYS module

#### 3.3 Land Detail Modal
Click any card to open modal with:
- Full-size photo
- Complete address info
- Asking Price / Price per Acre
- Specs: Acres, Sq Ft, Zoning, Days on Market
- **View Listing** button
- **Add to KYS** button

#### 3.4 Paste Realtor.com URL Feature
- **Input Field**: "Or paste Realtor.com URL"
- **URL Format**: `https://www.realtor.com/realestateandhomes-detail/ADDRESS_CITY_STATE_ZIP_PROPERTYID`
- **Behavior**:
  1. Checks if property exists in cached `landData.parcels`
  2. Checks if property exists in cached `locationData.properties`
  3. If not found, searches API by ZIP code
  4. Opens modal with full property data

**Technical Note**: Uses `useRef` pattern to avoid React stale closure issues.

### Data Flow
```
ZIP Code → kymApi.fetchLandData()
         → fetchLandListings() → /properties/v3/list (type: land)
         → transformLandListings()
         → setLandData({ parcels: [...] })

URL Paste → parseAddressFromUrl()
          → Check cache (landDataRef, locationDataRef)
          → Or fetchPropertyByUrl() → API search
          → setSelectedParcel() → Modal
```

---

## Tab 4: Demographics

### Features
- **Population Statistics**:
  - Total Population
  - Population Growth Rate
- **Income Data**:
  - Median Household Income
  - Income Distribution (visual bars)
- **Age Distribution**: Chart showing age brackets
- **Education Levels**:
  - High School
  - Bachelor's Degree
  - Graduate Degree

### Data Source
- Hardcoded data for known luxury markets
- Seeded random for consistency on unknown ZIPs

---

## Tab 5: Buyer Alignment (BAM)

### Overview
The Buyer Alignment Model (BAM) analyzes client design decisions to predict which buyer personas would be attracted to the property.

### 14 Buyer Personas
| Persona | Description |
|---------|-------------|
| Tech Titan | Tech executives seeking smart home integration |
| Entertainment Elite | Entertainment industry professionals |
| Global Financier | International finance professionals |
| Heritage Collector | Old money, multi-generational wealth |
| Sports Dynasty | Professional athletes and team owners |
| Wellness Pioneer | Health-focused entrepreneurs |
| Creative Visionary | Artists, designers, architects |
| Political Power | Government officials, diplomats |
| Philanthropy First | Major donors, foundation leaders |
| Quiet Wealth | Privacy-focused UHNW individuals |
| Dynasty Builder | Family office principals |
| Innovation Investor | VC partners, angel investors |
| Cultural Ambassador | Museum trustees, art collectors |
| Legacy Steward | Estate planners, trust managers |

### Scoring Algorithm
BAM calculates match scores (0-100%) based on:
1. **KYC Data**: Client profile, lifestyle preferences
2. **FYI Data**: Space allocations, feature selections
3. **MVP Data**: Adjacency decisions, room configurations
4. **Location**: Market characteristics

### Display
- Persona cards with match percentage
- Radar chart visualization
- Detailed breakdown of scoring factors

---

## API Integration

### Realtor.com API (via RapidAPI)

**Endpoints Used**:
| Endpoint | Purpose |
|----------|---------|
| `/properties/v3/list` | Search properties/land by ZIP |

**Configuration**:
```javascript
// Environment variable
REACT_APP_RAPIDAPI_KEY=your_key_here

// API Host
realty-in-us.p.rapidapi.com
```

### API Key Detection
The `hasApiKey()` function rejects placeholder values:
- `your_api_key`, `your_rapidapi_key`, `placeholder`, etc.

### Fallback Behavior
When no valid API key:
- Properties: Generated sample data (seeded random)
- Land: Generated sample parcels
- URL Paste: Parses address from URL structure

---

## KYS Integration

### Export to Site Library
Land parcels can be exported to the KYS (Know Your Site) module:

```javascript
// Data structure saved to localStorage
{
  id: 'site-{timestamp}',
  name: parcel.address,
  address, city, state, zipCode,
  acreage, askingPrice, pricePerAcre,
  features: [],
  zoning,
  coordinates: { lat, lng },
  sourceUrl: parcel.listingUrl,
  imageUrl,
  addedDate,
  notes: ''
}
```

**Storage**: `localStorage.getItem('n4s-kys-site-library')`

---

## Report Generation

### Export Report Button
- Generates PDF with market analysis
- Includes: KPIs, trends, comparable properties, demographics
- Uses N4S branding (Navy #1e3a5f, Gold #c9a227)

---

## State Management

### Key State Variables
```javascript
// Location
selectedZipCode, locationData, isLoading

// Properties (Comparables)
selectedProperty (for modal)

// Land Acquisition
landData, isLoadingLand, landError
landPriceRange: [min, max]
acreageRange: [min, max]
selectedParcel (for modal)
pastedListingUrl, isFetchingListing, fetchListingError

// Refs (for URL paste - avoid stale closures)
landDataRef, locationDataRef
```

---

## CSS Theming

### N4S Brand Colors
| Element | Color |
|---------|-------|
| Headers | Navy #1e3a5f |
| Accents | Gold #c9a227 |
| Success | Green #16a34a |
| Error | Red #dc2626 |
| Background | #f8f9fa |

### Module Header
- Background: `#8CA8BE` (KYM soft pillow color)
- Dynamic text color for contrast

---

## File Size Reference

| File | Size | Lines |
|------|------|-------|
| KYMModule.jsx | 95KB | ~2,400 |
| KYMModule.css | 56KB | ~1,500 |
| kymApiService.js | 36KB | ~1,100 |
| BAMScoring.js | 23KB | ~600 |
| KYMReportGenerator.js | 31KB | ~800 |
| BAMComponents.jsx | 14KB | ~400 |
| KYMDocumentation.jsx | 28KB | ~700 |

---

## Testing Checklist

- [ ] Search ZIP code (e.g., 90210)
- [ ] View Market Analysis KPIs
- [ ] Browse Comparable Properties
- [ ] Click property card → modal opens
- [ ] Switch to Land Acquisition tab
- [ ] Filter by price and acreage
- [ ] Click land card → modal with full data
- [ ] Use "View Listing" → opens Realtor.com
- [ ] Use "Add to KYS Library" → confirm alert
- [ ] Paste Realtor.com URL → modal shows data
- [ ] View Demographics tab
- [ ] View Buyer Alignment (BAM) scores
- [ ] Export Report (if implemented)

---

## Recent Changes (January 2026)

### Land Acquisition Tab (New)
- Added between Comparables and Demographics
- Price/Acreage filters with manual input
- Land parcel cards with View Listing links
- Export to KYS Library workflow

### URL Paste Feature (New)
- Paste Realtor.com listing URLs directly
- Parses property ID from URL
- Searches cache first, then API
- Fixed stale closure bug with useRef pattern

### API Improvements
- Robust hasApiKey() detection
- fetchPropertyByUrl() with dual search strategy
- Better error handling and fallbacks

---

## Known Limitations

1. **API Rate Limits**: RapidAPI has request limits
2. **Data Freshness**: Cached data may be stale
3. **Photo Availability**: Some listings lack photos
4. **Price from URL**: Cannot extract price from URL alone (needs API)

---

*End of KYM Specification*
