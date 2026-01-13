# Buyer Alignment Matrix (BAM) - Complete Methodology

**Version:** 2.0  
**Date:** January 13, 2026  
**Status:** Specification Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Methodology Overview](#2-methodology-overview)
3. [Buyer Archetype Profiles](#3-buyer-archetype-profiles)
4. [Client Avatar Extraction](#4-client-avatar-extraction)
5. [Scoring Algorithm](#5-scoring-algorithm)
6. [Gap Analysis & Recommendations](#6-gap-analysis--recommendations)
7. [Report Design](#7-report-design)
8. [Data Structures](#8-data-structures)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Executive Summary

### Purpose

The Buyer Alignment Matrix (BAM) predicts which buyer archetypes would be most attracted to a property based on the client's design decisions. This enables N4S advisors to:

1. **Validate marketability** — Will the property appeal to buyers in this market?
2. **Identify gaps** — What changes would broaden buyer appeal?
3. **Guide decisions** — Inform design choices that maintain/improve alignment
4. **Support exit strategy** — Understand future resale positioning

### Core Principle

> "You make your money on the buy, but you keep it on the sell."

BAM ensures that design decisions align with the buyer pool most likely to purchase in the target market, protecting the client's investment.

### Pass/Fail Threshold

| Score | Status | Meaning |
|-------|--------|---------|
| ≥80% | **PASS** | Strong alignment with buyer archetype |
| 65-79% | **CAUTION** | Moderate alignment, consider improvements |
| <65% | **FAIL** | Poor alignment, significant changes needed |

---

## 2. Methodology Overview

### 2.1 Three-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  STEP 1: IDENTIFY MARKET BUYER POOL                            │
│  ─────────────────────────────────────                          │
│  From KYM location data, identify the dominant buyer           │
│  archetypes for this specific market (e.g., Malibu, Aspen)     │
│                                                                 │
│                           ↓                                     │
│                                                                 │
│  STEP 2: BUILD CLIENT AVATAR                                    │
│  ─────────────────────────────                                  │
│  Extract design decisions from KYC, FYI, and MVP modules       │
│  to create a complete picture of what the client is building   │
│                                                                 │
│                           ↓                                     │
│                                                                 │
│  STEP 3: CALCULATE ALIGNMENT                                    │
│  ────────────────────────────                                   │
│  Compare Client Avatar against each buyer archetype's          │
│  Must Have / Nice to Have / Avoid preferences                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Scoring Categories

| Category | Weight | Source |
|----------|--------|--------|
| **Must Haves** | 50% | Dealbreakers if missing |
| **Nice to Haves** | 35% | Add value, not essential |
| **Avoids** | 15% | Penalties for misalignments |

### 2.3 Market-Specific Buyer Pools

Each luxury market has a different distribution of buyer archetypes:

| Market | #1 Archetype | #2 Archetype | #3 Archetype |
|--------|--------------|--------------|--------------|
| **Malibu, CA** | Entertainment (35%) | Tech Executive (28%) | Sports Pro (18%) |
| **Aspen, CO** | Generational (30%) | Finance (25%) | Sports Pro (20%) |
| **Greenwich, CT** | Finance (40%) | Family Office (25%) | Generational (20%) |
| **Palm Beach, FL** | International (35%) | Finance (30%) | Generational (25%) |
| **Beverly Hills, CA** | Entertainment (30%) | Tech Executive (25%) | International (20%) |
| **Hamptons, NY** | Finance (35%) | Entertainment (25%) | Tech Executive (20%) |
| **Miami Beach, FL** | International (40%) | Entertainment (25%) | Sports Pro (20%) |
| **Scottsdale, AZ** | Sports Pro (30%) | Tech Executive (25%) | Wellness (20%) |

---

## 3. Buyer Archetype Profiles

### 3.1 Tech Executive

**Profile:**
- **Description:** Successful technology industry leaders, startup founders, and C-suite executives who value innovation, privacy, and modern design.
- **Age Range:** 35-55
- **Net Worth:** $20M - $200M
- **Occupation:** Tech CEO / Founder / CTO / VP Engineering

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Smart Home Infrastructure | 10 | `fyi.spaces` includes home automation OR `mvp.features.smartHome` |
| Dedicated Home Office | 10 | `fyi.spaces` includes office with video conferencing capability |
| Contemporary/Modern Aesthetic | 10 | `fyi.tasteResults.dominant` in ['Contemporary', 'Modern', 'Minimalist'] |
| Privacy from Neighbors | 10 | `kyc.siteRequirements.privacy` ≥ 'High' OR gated/setback property |
| EV Charging + Tech Garage | 10 | `fyi.spaces` includes EV garage OR car gallery with EV provisions |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Wellness Suite | 7 | `fyi.spaces` includes gym + spa/steam/sauna |
| Indoor-Outdoor Living | 7 | `mvp.adjacencies` shows living → terrace connection |
| Guest Autonomy | 7 | `mvp.rooms` includes guest suite with private entry |
| Home Theater | 7 | `fyi.spaces` includes dedicated theater/media room |
| Wine Storage | 7 | `fyi.spaces` includes wine cellar/room |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Traditional/Ornate Styling | -15 | `fyi.tasteResults.dominant` in ['Traditional', 'Colonial', 'Mediterranean'] |
| High-Maintenance Grounds | -10 | `kyc.site.acreage` > 2 AND no estate staff |
| Visible from Street | -10 | `kyc.siteRequirements.visibility` = 'High' |
| HOA Restrictions | -10 | `kyc.site.hoa` = true with modification limits |

---

### 3.2 Entertainment Executive

**Profile:**
- **Description:** Film producers, studio executives, talent agents, and content creators who require prestigious addresses and exceptional privacy.
- **Age Range:** 40-65
- **Net Worth:** $30M - $500M
- **Occupation:** Producer / Studio Executive / Talent Agent

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Screening Room/Theater | 10 | `fyi.spaces` includes theater ≥400 SF |
| Exceptional Privacy | 10 | `kyc.siteRequirements.privacy` = 'Maximum' OR gated compound |
| Chef's Kitchen | 10 | `fyi.spaces.kitchen.tier` = 'Show Kitchen' with catering prep |
| Prestigious Address | 10 | Location in recognized luxury enclave |
| Entertainment Terrace | 10 | `fyi.spaces` includes covered terrace ≥800 SF |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Multiple Guest Suites | 7 | `fyi.rooms.guestSuites` ≥ 3 |
| Wine Cellar | 7 | `fyi.spaces` includes wine cellar ≥500 bottles |
| Pool + Pool House | 7 | `kyc.site.hasPool` AND `hasPoolHouse` |
| Staff Quarters | 7 | `fyi.spaces` includes staff suite |
| Car Gallery | 7 | `fyi.spaces` includes car gallery ≥4 vehicles |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Minimalist/Industrial | -15 | `fyi.tasteResults.dominant` in ['Minimalist', 'Industrial'] |
| Compact Footprint | -10 | `fyi.totalSqFt` < 10,000 |
| Limited Parking | -10 | `kyc.site.garageCapacity` < 4 |
| Street-Visible Entry | -10 | No gated/private approach |

---

### 3.3 Finance Executive

**Profile:**
- **Description:** Investment bankers, hedge fund managers, and private equity principals who appreciate traditional elegance and quality construction.
- **Age Range:** 45-65
- **Net Worth:** $50M - $500M
- **Occupation:** Managing Director / Partner / Fund Manager

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Traditional/Transitional Design | 10 | `fyi.tasteResults.dominant` in ['Traditional', 'Georgian', 'Colonial', 'Transitional'] |
| Library/Study | 10 | `fyi.spaces` includes library OR formal study |
| Formal Dining | 10 | `fyi.spaces` includes formal dining room ≥ 16 seats |
| Quality Construction | 10 | `kyc.qualityTier` = 'Exceptional' or 'Ultra-Premium' |
| Proximity to Financial Center | 10 | Location within 90min of NYC, Boston, Chicago, SF |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Wine Cellar | 7 | `fyi.spaces` includes wine cellar ≥1000 bottles |
| Home Office Suite | 7 | `fyi.spaces` includes office with conference capability |
| Pool | 7 | `kyc.site.hasPool` |
| Tennis Court | 7 | `kyc.site.hasTennis` |
| Guest Wing | 7 | `fyi.rooms.guestSuites` ≥ 2 with separate access |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Modern/Contemporary | -15 | `fyi.tasteResults.dominant` in ['Modern', 'Minimalist', 'Industrial'] |
| Tech-Forward Aesthetic | -10 | Exposed smart home infrastructure |
| Overly Casual Design | -10 | No formal living/dining spaces |
| Remote Location | -10 | >2 hours from financial center |

---

### 3.4 International Investor

**Profile:**
- **Description:** International UHNW individuals seeking trophy properties for investment diversification and family use.
- **Age Range:** 45-70
- **Net Worth:** $100M+
- **Occupation:** International Business / Investment / Family Office

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Security Infrastructure | 10 | `fyi.spaces` includes security room + perimeter systems |
| Staff Quarters | 10 | `fyi.spaces` includes staff suite with separate entry |
| Turnkey Condition | 10 | FF&E included, move-in ready |
| Multiple Guest Suites | 10 | `fyi.rooms.guestSuites` ≥ 4 |
| Prestigious Location | 10 | Recognized international luxury market |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Spa/Wellness | 7 | `fyi.spaces` includes spa, sauna, steam |
| Wine Cellar | 7 | `fyi.spaces` includes wine cellar |
| Car Gallery | 7 | `fyi.spaces` includes car gallery ≥6 vehicles |
| Pool + Pool House | 7 | `kyc.site.hasPool` AND `hasPoolHouse` |
| Home Theater | 7 | `fyi.spaces` includes theater |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Compact Size | -15 | `fyi.totalSqFt` < 12,000 |
| Remote Location | -10 | Not in primary international market |
| Limited Privacy | -10 | `kyc.siteRequirements.privacy` < 'High' |
| High Maintenance Required | -10 | Extensive grounds without staff provisions |

---

### 3.5 Sports Professional

**Profile:**
- **Description:** Professional athletes, team owners, and sports executives who prioritize fitness facilities and entertainment spaces.
- **Age Range:** 30-55
- **Net Worth:** $20M - $300M
- **Occupation:** Professional Athlete / Team Owner / Sports Executive

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Professional Gym | 10 | `fyi.spaces` includes gym ≥1,000 SF |
| Recovery Suite | 10 | `fyi.spaces` includes spa/steam/sauna/cold plunge |
| Privacy | 10 | `kyc.siteRequirements.privacy` ≥ 'High' |
| Entertainment Space | 10 | `fyi.spaces` includes game room/sports bar |
| Large Property | 10 | `kyc.site.acreage` ≥ 1 OR sports court |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Basketball Court | 7 | `kyc.site.hasSportsCourt` (basketball) |
| Pool (Lap) | 7 | `kyc.site.hasPool` with lap capability |
| Home Theater | 7 | `fyi.spaces` includes theater |
| Car Gallery | 7 | `fyi.spaces` includes car gallery ≥4 |
| Guest Suites | 7 | `fyi.rooms.guestSuites` ≥ 3 |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Small Gym | -15 | Gym < 500 SF or no gym |
| Traditional/Formal | -10 | `fyi.tasteResults.dominant` in ['Traditional', 'Georgian', 'Colonial'] |
| High-Maintenance Design | -10 | Materials requiring special care |
| Limited Parking | -10 | `kyc.site.garageCapacity` < 4 |

---

### 3.6 Generational Wealth / Legacy

**Profile:**
- **Description:** Multi-generational families seeking compound-style estates for extended family use across generations.
- **Age Range:** 55-75
- **Net Worth:** $200M+
- **Occupation:** Family Office / Inherited Wealth / Trust Beneficiary

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Guest House | 10 | `kyc.hasGuestHouse` = true |
| Multiple Bedrooms | 10 | `fyi.rooms.totalBedrooms` ≥ 6 |
| Staff Quarters | 10 | `fyi.spaces` includes staff suite |
| Traditional/Timeless Design | 10 | `fyi.tasteResults.dominant` in ['Traditional', 'Georgian', 'Transitional'] |
| Estate Property | 10 | `kyc.site.acreage` ≥ 2 |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Pool House | 7 | `kyc.hasPoolHouse` = true |
| Tennis Court | 7 | `kyc.site.hasTennis` = true |
| Wine Cellar | 7 | `fyi.spaces` includes wine cellar ≥1000 bottles |
| Kids' Spaces | 7 | `fyi.spaces` includes bunk room/playroom |
| Library | 7 | `fyi.spaces` includes library |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Modern/Minimalist | -15 | `fyi.tasteResults.dominant` in ['Modern', 'Minimalist', 'Industrial'] |
| Compact Property | -10 | `kyc.site.acreage` < 1 |
| Single Structure | -10 | No guest house or secondary structures |
| Limited Bedrooms | -10 | `fyi.rooms.totalBedrooms` < 5 |

---

### 3.7 Wellness Pioneer

**Profile:**
- **Description:** Health-focused entrepreneurs and executives who prioritize wellness facilities and natural living.
- **Age Range:** 40-60
- **Net Worth:** $30M - $200M
- **Occupation:** Wellness Industry / Health Tech / Biohacking Advocate

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Wellness Suite | 10 | `fyi.spaces` includes gym + spa + sauna + steam |
| Natural Materials | 10 | `fyi.tasteResults` emphasizes organic/natural materials |
| Indoor-Outdoor Connection | 10 | `mvp.adjacencies` shows strong indoor-outdoor flow |
| Clean Air/Water Systems | 10 | `fyi.features` includes air filtration + water purification |
| Privacy for Retreat | 10 | `kyc.siteRequirements.privacy` ≥ 'High' |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Lap Pool | 7 | Pool suitable for exercise swimming |
| Meditation Space | 7 | `fyi.spaces` includes meditation room/yoga studio |
| Chef's Kitchen | 7 | Kitchen designed for healthy food preparation |
| Guest Suite | 7 | For wellness retreat guests |
| Gardens | 7 | `kyc.site` includes kitchen garden/grounds |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Urban Location | -15 | Dense urban environment |
| Limited Outdoor Space | -10 | `kyc.site.acreage` < 0.5 |
| Traditional Heavy Design | -10 | `fyi.tasteResults.dominant` in ['Colonial', 'Georgian'] |
| Artificial Materials | -10 | Emphasis on synthetic/industrial materials |

---

### 3.8 Real Estate Developer

**Profile:**
- **Description:** Successful commercial and residential developers seeking personal residences that showcase design innovation.
- **Age Range:** 45-65
- **Net Worth:** $50M - $300M
- **Occupation:** Developer / Builder / Real Estate Investor

#### Must Haves (50 points max)

| Requirement | Points | Match Criteria |
|-------------|--------|----------------|
| Quality Construction | 10 | `kyc.qualityTier` = 'Exceptional' or higher |
| Innovative Design | 10 | Unique architectural features or notable architect |
| Resale Positioning | 10 | Design decisions support future marketability |
| Efficient Layout | 10 | `mvp.scores.circulation` ≥ 80 |
| Prime Location | 10 | Established luxury market with appreciation history |

#### Nice to Haves (35 points max)

| Feature | Points | Match Criteria |
|---------|--------|----------------|
| Smart Home Tech | 7 | Modern infrastructure for future buyers |
| Flexible Spaces | 7 | Rooms that can serve multiple purposes |
| Outdoor Living | 7 | Strong indoor-outdoor connection |
| Guest Accommodations | 7 | At least 2 guest suites |
| Pool | 7 | Pool is expected in luxury markets |

#### Avoids (Penalties)

| Anti-Pattern | Penalty | Match Criteria |
|--------------|---------|----------------|
| Over-Personalization | -15 | Unusual design choices that limit buyer pool |
| Poor Flow | -10 | `mvp.scores.circulation` < 70 |
| Dated Design | -10 | Style trending out of favor |
| Over-Improved | -10 | Cost significantly exceeds market ceiling |

---

## 4. Client Avatar Extraction

### 4.1 Data Sources

The Client Avatar is built from data captured across three modules:

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT AVATAR                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FROM KYC (Know Your Client)                                   │
│  ─────────────────────────────                                  │
│  • Budget range                                                 │
│  • Location/market                                              │
│  • Family composition                                           │
│  • Staff requirements                                           │
│  • Site characteristics                                         │
│  • Privacy requirements                                         │
│  • Quality tier                                                 │
│                                                                 │
│  FROM FYI (Find Your Inspiration)                              │
│  ─────────────────────────────────                              │
│  • Design style (from Taste Exploration)                       │
│  • Space selections and SF allocations                         │
│  • Feature selections                                          │
│  • Room counts                                                  │
│  • Total square footage                                         │
│                                                                 │
│  FROM MVP (Mansion Validation Program)                         │
│  ─────────────────────────────────────                          │
│  • Adjacency decisions                                         │
│  • Room configurations                                          │
│  • Zone assignments                                            │
│  • Red flags / bridges                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Field Mapping Reference

#### KYC Fields

| KYC Field | Path | BAM Use |
|-----------|------|---------|
| Budget | `kycData.principal.portfolioContext.budget` | Market positioning |
| Location | `kycData.principal.portfolioContext.location` | Buyer pool selection |
| Family Type | `kycData.principal.portfolioContext.familyComposition` | Bedroom/space needs |
| Staff Count | `kycData.principal.operatingModel.staffCount` | Staff quarters need |
| Privacy Level | `kycData.principal.siteRequirements.privacy` | Privacy matching |
| Quality Tier | `kycData.principal.portfolioContext.qualityTier` | Construction quality |
| Acreage | `kycData.principal.siteRequirements.acreage` | Property size |
| Has Guest House | `kycData.principal.siteRequirements.hasGuestHouse` | Structure count |
| Has Pool | `kycData.principal.siteRequirements.hasPool` | Amenity matching |

#### FYI Fields

| FYI Field | Path | BAM Use |
|-----------|------|---------|
| Taste Results | `kycData.principal.designIdentity.tasteResults` | Style matching |
| Dominant Style | `fyiData.styleProfile.dominant` | Primary style |
| Spaces Selected | `fyiData.spaces[]` | Space matching |
| Total SF | `fyiData.totalSquareFootage` | Size tier |
| Bedroom Count | `fyiData.rooms.bedrooms.count` | Bedroom matching |
| Has Theater | `fyiData.spaces.includes('theater')` | Feature matching |
| Has Wine Cellar | `fyiData.spaces.includes('wineCellar')` | Feature matching |
| Has Gym | `fyiData.spaces.includes('gym')` | Wellness matching |

#### MVP Fields

| MVP Field | Path | BAM Use |
|-----------|------|---------|
| Adjacency Decisions | `mvpData.adjacencies[]` | Flow analysis |
| Room List | `mvpData.rooms[]` | Space verification |
| Red Flags | `mvpData.validation.redFlags` | Quality concerns |
| Module Scores | `mvpData.validation.moduleScores` | Layout quality |
| Guest Autonomy | `mvpData.features.guestAutonomy` | Independence |
| Indoor-Outdoor | `mvpData.adjacencies.filter(a => a.outdoor)` | Connection quality |

### 4.3 Client Avatar Structure

```javascript
const ClientAvatar = {
  // Identity
  market: 'Malibu, CA',
  budget: '$25M - $35M',
  
  // Design
  dominantStyle: 'Contemporary',
  secondaryStyles: ['Modern', 'Coastal'],
  totalSqFt: 14500,
  
  // Spaces (with SF)
  spaces: [
    { name: 'Home Office', sqft: 450, priority: 'Must' },
    { name: 'Home Theater', sqft: 650, priority: 'Want' },
    { name: 'Gym', sqft: 800, priority: 'Must' },
    { name: 'Wine Cellar', sqft: 300, priority: 'Want' },
    { name: 'Pool House', sqft: 900, priority: 'Want' },
  ],
  
  // Rooms
  bedrooms: 5,
  guestSuites: 2,
  hasGuestHouse: false,
  
  // Site
  acreage: 1.2,
  hasPool: true,
  hasTennis: false,
  privacy: 'High',
  gated: true,
  
  // Features
  smartHome: true,
  evCharging: true,
  staffQuarters: false,
  securityRoom: false,
  
  // Quality
  qualityTier: 'Ultra-Premium',
  
  // MVP Indicators
  guestAutonomy: 'Partial', // None, Partial, Full
  indoorOutdoorFlow: 'Strong', // Weak, Moderate, Strong
  circulationScore: 85,
};
```

---

## 5. Scoring Algorithm

### 5.1 Score Calculation

```javascript
function calculateBAMScore(clientAvatar, buyerArchetype) {
  const results = {
    mustHaves: { earned: 0, max: 50, items: [] },
    niceToHaves: { earned: 0, max: 35, items: [] },
    avoids: { penalty: 0, items: [] },
  };
  
  // 1. Score Must Haves (50 points max)
  buyerArchetype.mustHaves.forEach(requirement => {
    const match = evaluateMatch(clientAvatar, requirement.matchCriteria);
    const points = match === 'full' ? requirement.points 
                 : match === 'partial' ? requirement.points * 0.5 
                 : 0;
    
    results.mustHaves.earned += points;
    results.mustHaves.items.push({
      ...requirement,
      match,
      pointsEarned: points,
    });
  });
  
  // 2. Score Nice to Haves (35 points max)
  buyerArchetype.niceToHaves.forEach(feature => {
    const match = evaluateMatch(clientAvatar, feature.matchCriteria);
    const points = match === 'full' ? feature.points 
                 : match === 'partial' ? feature.points * 0.5 
                 : 0;
    
    results.niceToHaves.earned += points;
    results.niceToHaves.items.push({
      ...feature,
      match,
      pointsEarned: points,
    });
  });
  
  // 3. Apply Avoid Penalties
  buyerArchetype.avoids.forEach(antiPattern => {
    const hasAntiPattern = evaluateAntiPattern(clientAvatar, antiPattern.matchCriteria);
    if (hasAntiPattern) {
      results.avoids.penalty += antiPattern.penalty;
      results.avoids.items.push({
        ...antiPattern,
        triggered: true,
      });
    }
  });
  
  // 4. Calculate Final Score
  const totalEarned = results.mustHaves.earned + results.niceToHaves.earned;
  const totalPenalty = results.avoids.penalty;
  const totalMax = results.mustHaves.max + results.niceToHaves.max;
  
  const rawScore = totalEarned - totalPenalty;
  const percentage = Math.max(0, Math.min(100, Math.round((rawScore / totalMax) * 100)));
  
  return {
    archetype: buyerArchetype.name,
    percentage,
    status: percentage >= 80 ? 'PASS' : percentage >= 65 ? 'CAUTION' : 'FAIL',
    breakdown: results,
    gaps: identifyGaps(results),
    recommendations: generateRecommendations(results, clientAvatar),
  };
}
```

### 5.2 Match Evaluation

```javascript
function evaluateMatch(clientAvatar, criteria) {
  // Example criteria: "fyi.spaces includes gym >= 800 SF"
  
  // Parse the criteria
  const { field, operator, value, threshold } = parseCriteria(criteria);
  
  // Get the client's value
  const clientValue = getNestedValue(clientAvatar, field);
  
  // Evaluate
  switch (operator) {
    case 'includes':
      if (!clientValue) return 'none';
      if (threshold && clientValue.sqft < threshold) return 'partial';
      return 'full';
      
    case 'equals':
      return clientValue === value ? 'full' : 'none';
      
    case 'in':
      return value.includes(clientValue) ? 'full' : 'none';
      
    case '>=':
      if (clientValue >= value) return 'full';
      if (clientValue >= value * 0.7) return 'partial';
      return 'none';
      
    default:
      return 'none';
  }
}
```

### 5.3 Gap Identification

```javascript
function identifyGaps(results) {
  const gaps = [];
  
  // Find missing Must Haves
  results.mustHaves.items
    .filter(item => item.match !== 'full')
    .forEach(item => {
      gaps.push({
        category: 'Must Have',
        item: item.label,
        currentStatus: item.match,
        pointsAvailable: item.points - item.pointsEarned,
        priority: 'High',
        suggestion: item.suggestion,
      });
    });
  
  // Find missing Nice to Haves
  results.niceToHaves.items
    .filter(item => item.match !== 'full')
    .forEach(item => {
      gaps.push({
        category: 'Nice to Have',
        item: item.label,
        currentStatus: item.match,
        pointsAvailable: item.points - item.pointsEarned,
        priority: 'Medium',
        suggestion: item.suggestion,
      });
    });
  
  // Add triggered Avoids
  results.avoids.items
    .filter(item => item.triggered)
    .forEach(item => {
      gaps.push({
        category: 'Avoid',
        item: item.label,
        penaltyApplied: item.penalty,
        priority: 'High',
        suggestion: item.remediation,
      });
    });
  
  // Sort by potential point impact
  return gaps.sort((a, b) => 
    (b.pointsAvailable || b.penaltyApplied || 0) - 
    (a.pointsAvailable || a.penaltyApplied || 0)
  );
}
```

---

## 6. Gap Analysis & Recommendations

### 6.1 Recommendation Generation

For each gap, generate a specific, actionable recommendation:

```javascript
const RECOMMENDATION_TEMPLATES = {
  // Must Haves
  'Smart Home Infrastructure': {
    none: 'Add whole-home automation system with centralized control',
    partial: 'Expand smart home to include lighting, HVAC, and security integration',
  },
  'Dedicated Home Office': {
    none: 'Include dedicated home office with video conferencing capability (min 350 SF)',
    partial: 'Upgrade office with better acoustics and professional backdrop',
  },
  'Privacy from Neighbors': {
    none: 'Consider gated entry, perimeter landscaping, or setback adjustments',
    partial: 'Enhance screening with mature plantings or privacy structures',
  },
  
  // Avoids
  'Traditional/Ornate Styling': {
    remediation: 'Consider transitional design that bridges traditional and contemporary elements',
  },
  'High-Maintenance Grounds': {
    remediation: 'Include estate manager quarters or reduce landscape complexity',
  },
};
```

### 6.2 Path to 80%

Always show the user exactly what changes would achieve a passing score:

```javascript
function calculatePathTo80(score, gaps) {
  const pointsNeeded = 80 - score.percentage;
  
  if (pointsNeeded <= 0) {
    return { achieved: true, message: 'Score meets threshold' };
  }
  
  // Find the minimum changes to reach 80%
  const recommendations = [];
  let pointsAccumulated = 0;
  
  // Prioritize: Avoids (remove penalties), then Must Haves, then Nice to Haves
  const sortedGaps = [...gaps].sort((a, b) => {
    if (a.category === 'Avoid' && b.category !== 'Avoid') return -1;
    if (a.category !== 'Avoid' && b.category === 'Avoid') return 1;
    if (a.category === 'Must Have' && b.category === 'Nice to Have') return -1;
    if (a.category === 'Nice to Have' && b.category === 'Must Have') return 1;
    return (b.pointsAvailable || 0) - (a.pointsAvailable || 0);
  });
  
  for (const gap of sortedGaps) {
    if (pointsAccumulated >= pointsNeeded) break;
    
    const points = gap.pointsAvailable || gap.penaltyApplied || 0;
    recommendations.push({
      action: gap.suggestion,
      impact: `+${points} pts`,
      difficulty: gap.difficulty || 'Moderate',
    });
    pointsAccumulated += points;
  }
  
  return {
    achieved: false,
    pointsNeeded,
    recommendations,
    message: `Add ${recommendations.length} changes to reach 80%`,
  };
}
```

---

## 7. Report Design

### 7.1 BAM Report Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  N4S ADVISORY                           Assessment Date: January 15, 2026   │
│  BUYER ALIGNMENT ANALYSIS                      Market: Malibu, CA           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLIENT: [Confidential] — Thornwood Estate                                  │
│  ASSESSOR: N4S Advisory                                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    MARKET BUYER POOL - MALIBU                               │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │  Entertainment (35%)  Tech Executive (28%)  Sports Pro (18%)   │     │
│    │  ████████████████████  ███████████████       █████████          │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│                    TOP 3 BUYER ARCHETYPE ALIGNMENTS                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. TECH EXECUTIVE                                                  │   │
│  │                                                                     │   │
│  │  SCORE: 65%           STATUS: ⚠️ CAUTION          TARGET: 80%      │   │
│  │  ███████████████████████████░░░░░░░░░░░░                           │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ MUST HAVES (35/50)                              70%         │   │   │
│  │  ├─────────────────────┬────────┬────────┬─────────────────────┤   │   │
│  │  │ Requirement         │ Status │ Points │ Notes               │   │   │
│  │  ├─────────────────────┼────────┼────────┼─────────────────────┤   │   │
│  │  │ Smart Home          │   ✓    │ +10    │ Full automation     │   │   │
│  │  │ Home Office         │   ✓    │ +10    │ Video ready         │   │   │
│  │  │ Contemporary Style  │   ◐    │ +5     │ Mixed signals       │   │   │
│  │  │ Privacy             │   ✓    │ +10    │ Gated, setback      │   │   │
│  │  │ EV/Tech Garage      │   ✗    │ +0     │ NOT SPECIFIED       │   │   │
│  │  └─────────────────────┴────────┴────────┴─────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ NICE TO HAVES (24/35)                           69%         │   │   │
│  │  ├─────────────────────┬────────┬────────┬─────────────────────┤   │   │
│  │  │ Feature             │ Status │ Points │ Notes               │   │   │
│  │  ├─────────────────────┼────────┼────────┼─────────────────────┤   │   │
│  │  │ Wellness Suite      │   ✓    │ +7     │ Gym + spa           │   │   │
│  │  │ Indoor-Outdoor      │   ✓    │ +7     │ Great room flow     │   │   │
│  │  │ Guest Autonomy      │   ✗    │ +0     │ Shared entry        │   │   │
│  │  │ Home Theater        │   ✓    │ +7     │ Dedicated room      │   │   │
│  │  │ Wine Storage        │   ◐    │ +3     │ Small cellar        │   │   │
│  │  └─────────────────────┴────────┴────────┴─────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ AVOIDS (Penalty: -5)                                        │   │   │
│  │  ├─────────────────────┬────────┬────────┬─────────────────────┤   │   │
│  │  │ Anti-Pattern        │ Status │ Penalty│ Notes               │   │   │
│  │  ├─────────────────────┼────────┼────────┼─────────────────────┤   │   │
│  │  │ Traditional Style   │   ✗    │ +0     │ OK - Contemporary   │   │   │
│  │  │ High-Maint Grounds  │   !    │ -5     │ 2-acre grounds      │   │   │
│  │  │ Street Visible      │   ✗    │ +0     │ OK - Setback        │   │   │
│  │  │ HOA Restrictions    │   ✗    │ +0     │ OK - None           │   │   │
│  │  └─────────────────────┴────────┴────────┴─────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  PATH TO 80%                                   Gap: 15 pts  │   │   │
│  │  │                                                             │   │   │
│  │  │  1. Add EV charging provision        +10 pts   ★ Easiest   │   │   │
│  │  │  2. Create guest autonomy node        +7 pts               │   │   │
│  │  │  3. Resolve style consistency         +5 pts               │   │   │
│  │  │  4. Add landscape maintenance plan    +5 pts (removes -5)  │   │   │
│  │  │                                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  2. ENTERTAINMENT EXECUTIVE                                         │   │
│  │                                                                     │   │
│  │  SCORE: 72%           STATUS: ⚠️ CAUTION          TARGET: 80%      │   │
│  │  █████████████████████████████████░░░░░░░░                         │   │
│  │                                                                     │   │
│  │  [Collapsed detail - click to expand]                              │   │
│  │                                                                     │   │
│  │  PATH TO 80%: Add screening room (+10), Expand guest wing (+7)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  3. SPORTS PROFESSIONAL                                             │   │
│  │                                                                     │   │
│  │  SCORE: 60%           STATUS: ❌ FAIL              TARGET: 80%      │   │
│  │  ████████████████████████░░░░░░░░░░░░░░░░                          │   │
│  │                                                                     │   │
│  │  [Collapsed detail - click to expand]                              │   │
│  │                                                                     │   │
│  │  PATH TO 80%: Add professional gym (+10), Recovery suite (+10)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SUMMARY & RECOMMENDATIONS                                                  │
│                                                                             │
│  Current design achieves MODERATE alignment with the Malibu buyer pool.    │
│  Primary alignment is with Tech Executives (65%) and Entertainment         │
│  buyers (72%), which represent 63% of likely purchasers.                   │
│                                                                             │
│  Key opportunities to improve marketability:                               │
│                                                                             │
│  1. EV INFRASTRUCTURE — Strong signal for Tech buyers, expected by all    │
│  2. GUEST AUTONOMY — Benefits both Tech and Entertainment profiles        │
│  3. SCREENING ROOM — High value for Entertainment, differentiator         │
│  4. GROUNDS MANAGEMENT — Staff quarters or simplified landscape           │
│                                                                             │
│  OVERALL MARKET ALIGNMENT: 66% (Weighted by buyer pool share)              │
│                                                                             │
│  ██████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░       │
│  0%                           66%                                    100%  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  © 2026 N4S Luxury Residential Advisory                             Page 5 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Visual Elements

#### Score Bar

```
PASS (≥80%):    ████████████████████████████████████████████████  85%
                [Green bar]

CAUTION (65-79): ███████████████████████████████░░░░░░░░░░░░░░░░░  65%
                 [Amber bar]

FAIL (<65%):    ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░  55%
                [Red bar]
```

#### Status Icons

| Status | Icon | Color |
|--------|------|-------|
| Full Match | ✓ | Green |
| Partial Match | ◐ | Amber |
| No Match | ✗ | Gray |
| Triggered Penalty | ! | Red |

#### Market Pool Visualization

```
Malibu Buyer Pool
┌────────────────────────────────────────────────────────────────┐
│ Entertainment ████████████████████ 35%                         │
│ Tech Executive ██████████████ 28%                              │
│ Sports Pro ██████████ 18%                                      │
│ Other ██████████ 19%                                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Data Structures

### 8.1 Buyer Archetype Definition

```typescript
interface BuyerArchetype {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  
  demographics: {
    ageRange: string;
    netWorth: string;
    occupation: string;
  };
  
  icon: string; // Lucide icon name
  
  // Market distribution (percentage of buyers in each market)
  marketShare: {
    [market: string]: number; // e.g., { 'malibu': 0.35, 'aspen': 0.15 }
  };
  
  mustHaves: Requirement[];
  niceToHaves: Feature[];
  avoids: AntiPattern[];
}

interface Requirement {
  id: string;
  label: string;
  points: number; // Max 10 each, total 50
  matchCriteria: string; // Evaluation expression
  suggestion: string; // What to add if missing
}

interface Feature {
  id: string;
  label: string;
  points: number; // Max 7 each, total 35
  matchCriteria: string;
  suggestion: string;
}

interface AntiPattern {
  id: string;
  label: string;
  penalty: number; // Negative value
  matchCriteria: string;
  remediation: string; // How to address
}
```

### 8.2 BAM Score Result

```typescript
interface BAMScoreResult {
  archetype: string;
  archetypeId: string;
  
  percentage: number;
  status: 'PASS' | 'CAUTION' | 'FAIL';
  
  breakdown: {
    mustHaves: {
      earned: number;
      max: number;
      percentage: number;
      items: ScoredItem[];
    };
    niceToHaves: {
      earned: number;
      max: number;
      percentage: number;
      items: ScoredItem[];
    };
    avoids: {
      penalty: number;
      items: TriggeredAntiPattern[];
    };
  };
  
  gaps: Gap[];
  
  pathTo80: {
    pointsNeeded: number;
    recommendations: Recommendation[];
  };
}

interface ScoredItem {
  id: string;
  label: string;
  match: 'full' | 'partial' | 'none';
  pointsAvailable: number;
  pointsEarned: number;
  notes: string;
}

interface Gap {
  category: 'Must Have' | 'Nice to Have' | 'Avoid';
  item: string;
  pointsAvailable: number;
  priority: 'High' | 'Medium' | 'Low';
  suggestion: string;
}

interface Recommendation {
  action: string;
  impact: string;
  difficulty: 'Easy' | 'Moderate' | 'Significant';
}
```

### 8.3 Market Configuration

```typescript
const MARKET_BUYER_POOLS: Record<string, BuyerPoolConfig> = {
  'malibu': {
    name: 'Malibu, CA',
    state: 'CA',
    archetypes: [
      { id: 'entertainment', share: 0.35 },
      { id: 'techExecutive', share: 0.28 },
      { id: 'sportsPro', share: 0.18 },
      { id: 'international', share: 0.12 },
      { id: 'other', share: 0.07 },
    ],
    priceRange: '$8M - $80M',
    typicalSize: '8,000 - 18,000 SF',
  },
  'greenwich': {
    name: 'Greenwich, CT',
    state: 'CT',
    archetypes: [
      { id: 'finance', share: 0.40 },
      { id: 'familyOffice', share: 0.25 },
      { id: 'generational', share: 0.20 },
      { id: 'techExecutive', share: 0.10 },
      { id: 'other', share: 0.05 },
    ],
    priceRange: '$5M - $50M',
    typicalSize: '8,000 - 20,000 SF',
  },
  // ... other markets
};
```

---

## 9. Implementation Guide

### 9.1 File Changes Required

| File | Changes |
|------|---------|
| `BAMScoring.js` | Replace with new Must Have/Nice to Have/Avoid structure |
| `BAMComponents.jsx` | Update to show gap analysis report format |
| `KYMModule.jsx` | Update BAM tab to use new scoring and display |
| `KYMReportGenerator.js` | Add BAM report page generation |

### 9.2 Implementation Steps

1. **Update Archetype Definitions**
   - Convert current point-based scoring to Must Have/Nice to Have/Avoid
   - Add market share data for each archetype
   - Define all match criteria expressions

2. **Implement New Scoring Engine**
   - Create `evaluateMatch()` function
   - Create `identifyGaps()` function
   - Create `generatePathTo80()` function

3. **Build Client Avatar Extractor**
   - Map all KYC fields
   - Map all FYI fields
   - Map all MVP fields

4. **Design Report Components**
   - `BAMScoreCard` — Individual archetype score display
   - `BAMGapTable` — Must Have/Nice to Have/Avoid breakdown
   - `BAMPathTo80` — Recommendations panel
   - `BAMMarketPool` — Buyer distribution chart
   - `BAMSummary` — Overall market alignment

5. **Update PDF Report**
   - Add BAM page to report generator
   - Match KYS report visual style
   - Include gap analysis tables

### 9.3 Testing Checklist

- [ ] Score calculation matches expected results
- [ ] Gap identification finds all missing items
- [ ] Path to 80% shows minimum changes needed
- [ ] Market-specific buyer pools load correctly
- [ ] Report displays all archetypes ranked by alignment
- [ ] PDF export includes full BAM analysis
- [ ] UI collapses/expands archetype details
- [ ] Status icons render correctly

---

## Appendix A: Complete Archetype Reference

| Archetype | Key Must Haves | Key Avoids |
|-----------|----------------|------------|
| Tech Executive | Smart Home, Office, Contemporary | Traditional, HOA Limits |
| Entertainment | Screening Room, Privacy, Chef's Kitchen | Minimalist, Small |
| Finance | Library, Traditional, Formal Dining | Modern, Remote |
| International | Security, Staff, Guest Suites | Compact, Remote |
| Sports Pro | Gym, Recovery, Entertainment | Traditional, Small Gym |
| Generational | Guest House, Estate, Multi-Bedroom | Modern, Compact |
| Wellness | Spa Suite, Natural Materials, Privacy | Urban, Artificial |
| Developer | Quality Construction, Resale Position | Over-Personalization |

---

## Appendix B: Market Pool Quick Reference

| Market | #1 | #2 | #3 |
|--------|----|----|----| 
| Malibu | Entertainment 35% | Tech 28% | Sports 18% |
| Aspen | Generational 30% | Finance 25% | Sports 20% |
| Greenwich | Finance 40% | Family Office 25% | Generational 20% |
| Palm Beach | International 35% | Finance 30% | Generational 25% |
| Beverly Hills | Entertainment 30% | Tech 25% | International 20% |
| Hamptons | Finance 35% | Entertainment 25% | Tech 20% |
| Miami Beach | International 40% | Entertainment 25% | Sports 20% |
| Scottsdale | Sports 30% | Tech 25% | Wellness 20% |

---

*End of BAM Methodology Specification*
