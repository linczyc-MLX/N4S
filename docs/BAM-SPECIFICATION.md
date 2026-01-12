# BAM - Buyer Alignment Module Specification

## Overview

The Buyer Alignment Module (BAM) analyzes a client's design decisions across KYC, FYI, and MVP modules to identify which buyer personas are most likely to purchase the resulting property. Unlike generic persona descriptions, BAM provides **data-driven scoring** with transparent reasoning.

## Core Principle

**"Given what you're building, where you're building it, and the choices you've made - who is most likely to buy this property, and why?"**

---

## Data Sources

| Module | Data Points Used |
|--------|-----------------|
| **KYC** | Design identity (taste style), family composition, project location, budget tier |
| **FYI** | Selected spaces, room counts, lifestyle priorities, bedroom configuration |
| **MVP** | Total square footage, tier classification, adjacency decisions, zone allocations |
| **KYM** | Market location, property comparables (when available), price per SF benchmarks |

---

## Persona Archetypes (10)

### 1. Tech Executive
- **Profile**: Technology industry leaders, startup founders, C-suite executives
- **Typical Age**: 35-55
- **Net Worth**: $20M-$200M
- **Key Priorities**: Smart home integration, home office, privacy, modern aesthetics
- **Location Affinity**: CA (Bay Area, LA), WA, TX (Austin), CO
- **Size Preference**: 8,000-15,000 SF (functional, not ostentatious)

### 2. Entertainment Industry
- **Profile**: Film producers, studio executives, talent, content creators
- **Typical Age**: 40-65
- **Net Worth**: $30M-$500M
- **Key Priorities**: Screening room, guest entertainment, prestige address, privacy
- **Location Affinity**: CA (Beverly Hills, Malibu, Bel Air), NY (Manhattan)
- **Size Preference**: 12,000-20,000 SF

### 3. Finance Executive
- **Profile**: Investment bankers, hedge fund managers, private equity principals
- **Typical Age**: 45-65
- **Net Worth**: $50M-$500M
- **Key Priorities**: Traditional elegance, wine cellar, home office, proximity to city
- **Location Affinity**: NY, CT (Greenwich), NJ (Alpine), FL (Palm Beach)
- **Size Preference**: 10,000-18,000 SF

### 4. International Investor
- **Profile**: Global wealth holders seeking US trophy properties
- **Typical Age**: 45-70
- **Net Worth**: $100M+
- **Key Priorities**: Security, staff quarters, investment value, turnkey condition
- **Location Affinity**: FL (Miami, Palm Beach), NY, CA (Beverly Hills)
- **Size Preference**: 15,000-30,000 SF

### 5. Generational Wealth
- **Profile**: Multi-generational families, family office principals, legacy wealth
- **Typical Age**: 55-75
- **Net Worth**: $200M+
- **Key Priorities**: Family compound, guest houses, staff quarters, legacy value
- **Location Affinity**: CT, MA (Cape Cod), FL (Palm Beach), CA (Montecito)
- **Size Preference**: 18,000-35,000+ SF

### 6. Sports/Athletics Professional
- **Profile**: Professional athletes, team owners, sports executives
- **Typical Age**: 30-55
- **Net Worth**: $20M-$300M
- **Key Priorities**: Fitness facilities, indoor sports, recovery/spa, large gatherings
- **Location Affinity**: FL, TX, CA, AZ (Scottsdale)
- **Size Preference**: 12,000-25,000 SF

### 7. Medical/Biotech Executive
- **Profile**: Healthcare executives, biotech founders, medical professionals
- **Typical Age**: 45-65
- **Net Worth**: $30M-$150M
- **Key Priorities**: Wellness facilities, clean design, home office, privacy
- **Location Affinity**: MA (Boston), CA (San Diego, Bay Area), NJ, NC (Research Triangle)
- **Size Preference**: 8,000-14,000 SF

### 8. Real Estate Developer
- **Profile**: Commercial/residential developers seeking personal residence
- **Typical Age**: 45-65
- **Net Worth**: $50M-$300M
- **Key Priorities**: Quality construction, design innovation, resale value, staff quarters
- **Location Affinity**: Any major luxury market
- **Size Preference**: 12,000-20,000 SF

### 9. Creative Entrepreneur
- **Profile**: Fashion designers, artists, creative directors, brand founders
- **Typical Age**: 35-55
- **Net Worth**: $15M-$100M
- **Key Priorities**: Unique architecture, studio space, entertaining, views
- **Location Affinity**: NY, CA (LA, Malibu), FL (Miami)
- **Size Preference**: 6,000-12,000 SF

### 10. Family Office Principal
- **Profile**: Professional wealth managers, family office leaders
- **Typical Age**: 50-70
- **Net Worth**: $100M+
- **Key Priorities**: Security, privacy, multi-generational accommodation, conservative design
- **Location Affinity**: Any established luxury market
- **Size Preference**: 15,000-25,000 SF

---

## Scoring Algorithm

### Base Score: 50 points

### Scoring Categories

#### 1. Space Selection Scoring (from FYI)
Each persona has affinity scores for specific spaces:

```javascript
techExecutive: {
  "Home Office": +20,
  "Smart Home Integration": +25,
  "EV Garage/Car Gallery": +15,
  "Home Theater": +12,
  "Gym": +10,
  "Wine Cellar": +5,
  "Staff Quarters": -10,
  "Kids Bunk Room": -5,
  "Pool House": +8,
  "Guest Suites (3+)": -8,
}
```

#### 2. Design Identity Scoring (from KYC)
```javascript
techExecutive: {
  "Modern": +20,
  "Contemporary": +15,
  "Minimalist": +18,
  "Industrial": +10,
  "Traditional": -15,
  "Mediterranean": -10,
  "Coastal": +5,
}
```

#### 3. Size Tier Scoring (from MVP)
```javascript
techExecutive: {
  "6000-8000": +10,
  "8000-12000": +20,
  "12000-15000": +15,
  "15000-18000": +5,
  "18000-25000": -10,
  "25000+": -20,
}
```

#### 4. Location Scoring (from KYM/KYC)
```javascript
techExecutive: {
  "CA": +15,
  "WA": +20,
  "TX": +12,
  "CO": +15,
  "NY": +5,
  "FL": 0,
  "CT": -5,
}
```

#### 5. Family Composition Scoring (from KYC)
```javascript
techExecutive: {
  "Single/Couple, No Children": +15,
  "Young Family (children <12)": +5,
  "Established Family (children 12-18)": 0,
  "Empty Nesters": +10,
  "Multi-Generational": -15,
}
```

#### 6. Bedroom Configuration Scoring (from FYI)
```javascript
techExecutive: {
  "Primary + Jr Primary only": +15,
  "3-4 bedrooms total": +10,
  "5-6 bedrooms total": 0,
  "7+ bedrooms": -15,
}
```

### Score Calculation

```javascript
function calculatePersonaScore(persona, clientData) {
  let score = 50;
  const factors = [];
  
  // Apply each scoring category
  // Track positive and negative factors
  // Cap final score at 5-95
  
  return {
    score: Math.min(95, Math.max(5, score)),
    matchLevel: score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : 'Weak',
    positiveFactors: factors.filter(f => f.impact > 0),
    negativeFactors: factors.filter(f => f.impact < 0),
    confidence: calculateConfidence(factors),
  };
}
```

---

## UI Components

### Main View: Persona Cards (3 columns)
- Top 3 matches prominently displayed
- Score bar with percentage
- Key matching factors (top 3 positive)
- "View Details" to open sidebar

### Secondary View: All Personas (scrollable)
- Remaining 7 personas in smaller cards
- Sorted by score descending
- Quick view of score + match level

### Detail Sidebar (slides in from right)
- Full persona description
- Complete factor breakdown
- Positive factors (green checkmarks)
- Negative factors (amber warnings)
- Market alignment (if KYM data available)
- "How this score was calculated" expandable section

---

## Market Alignment (KYM Integration)

When live property data is available, enhance scoring with:

### Sold Property Analysis
- What features appear in sold listings?
- What size homes are selling?
- Average days on market by profile

### Validation Messages
- "72% of sold properties in Beverly Hills include Home Theater - aligns with Entertainment Industry persona"
- "Your 22,000 SF program exceeds typical Tech Executive preferences (8,000-15,000 SF)"

---

## Implementation Notes

### Data Access
```javascript
// Requires useAppContext for cross-module data
const { kycData, fyiData, mvpData } = useAppContext();

// KYM data passed as prop or from context
const { locationData, properties } = kymData;
```

### State Management
- Scores calculated on data change (useMemo)
- Selected persona for detail view (useState)
- Sidebar open/closed state

### Performance
- Memoize score calculations
- Only recalculate when relevant data changes
- Lazy load detail sidebar content

---

## File Structure

```
src/components/KYM/
  ├── KYMModule.jsx          # Main module (add BAM tab)
  ├── KYMModule.css          # Styles (add BAM section)
  ├── kymApiService.js       # API service
  ├── BAMScoring.js          # Scoring algorithm + persona data
  └── BAMComponents.jsx      # PersonaCard, PersonaDetail, ScoringSidebar
```

---

## Success Criteria

1. **Differentiated Results**: Different client configurations produce meaningfully different persona rankings
2. **Transparent Reasoning**: Every score can be explained with specific factors
3. **Actionable Insights**: Advisors can use results to guide design discussions
4. **Data-Driven**: When market data available, validates against real sales patterns

---

## Future Enhancements

1. **Historical Analysis**: Track which personas actually bought similar properties
2. **Confidence Intervals**: Statistical confidence based on data completeness
3. **Recommendation Engine**: "To better align with Tech Executive, consider adding..."
4. **Export to Report**: Include BAM analysis in N4S Advisory reports
