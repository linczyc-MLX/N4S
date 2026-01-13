# Buyer Alignment Matrix (BAM) - Complete Methodology

**Version:** 3.0  
**Date:** January 13, 2026  
**Status:** Enhanced Specification with Dual Scoring

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Dual Score Framework](#2-dual-score-framework)
3. [Client Satisfaction Score](#3-client-satisfaction-score)
4. [Market Appeal Score](#4-market-appeal-score)
5. [Portfolio Context](#5-portfolio-context)
6. [Feature Classification](#6-feature-classification)
7. [Trade-off Analysis](#7-trade-off-analysis)
8. [Buyer Archetype Profiles](#8-buyer-archetype-profiles)
9. [Data Mapping Reference](#9-data-mapping-reference)
10. [Scoring Algorithm](#10-scoring-algorithm)
11. [Report Design](#11-report-design)
12. [Data Structures](#12-data-structures)
13. [Implementation Guide](#13-implementation-guide)

---

## 1. Executive Summary

### Purpose

The Buyer Alignment Matrix (BAM) provides a **dual-lens analysis** of property design decisions:

1. **Client Satisfaction Score** — Does this design serve the CLIENT's needs and vision?
2. **Market Appeal Score** — Will this design appeal to BUYERS when it's time to sell?

This dual approach ensures N4S advisors can:
- Validate that the design fulfills the client's lifestyle requirements
- Confirm the design will appeal to the buyer pool in the target market
- Identify trade-offs between personal satisfaction and market value
- Guide decisions that optimize both dimensions appropriately

### Core Principles

> "You make your money on the buy, but you keep it on the sell."

> "A home that doesn't serve you isn't worth building. A home that won't sell isn't a sound investment."

BAM balances these truths by measuring BOTH dimensions and weighting them according to the client's portfolio context.

### Pass/Fail Thresholds

| Score Type | ≥80% | 65-79% | <65% |
|------------|------|--------|------|
| **Client Satisfaction** | ✅ Strong Fit | ⚠️ Compromises Exist | ❌ Misaligned |
| **Market Appeal** | ✅ Strong Appeal | ⚠️ Limited Pool | ❌ Hard to Sell |
| **Combined** | ✅ PASS | ⚠️ CAUTION | ❌ FAIL |

---

## 2. Dual Score Framework

### 2.1 The Two Dimensions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        BAM DUAL SCORE FRAMEWORK                             │
│                                                                             │
├─────────────────────────────────┬───────────────────────────────────────────┤
│                                 │                                           │
│   CLIENT SATISFACTION SCORE     │      MARKET APPEAL SCORE                  │
│   ─────────────────────────     │      ────────────────────                 │
│                                 │                                           │
│   "Does this design serve       │      "Will buyers want this               │
│    YOUR needs and vision?"      │       when you sell?"                     │
│                                 │                                           │
│   Measures:                     │      Measures:                            │
│   • Spatial requirements met    │      • Buyer archetype alignment          │
│   • Lifestyle needs fulfilled   │      • Must Have / Nice to Have / Avoid   │
│   • Design aesthetic match      │      • Market-specific preferences        │
│   • Location context fit        │      • Resale positioning                 │
│   • Future-proofing             │      • Competitive differentiation        │
│                                 │                                           │
│   Source: KYC + FYI + MVP       │      Source: KYM + Archetype Profiles     │
│                                 │                                           │
└─────────────────────────────────┴───────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │      COMBINED SCORE         │
                    │   (Weighted by Portfolio    │
                    │        Context)             │
                    └─────────────────────────────┘
```

### 2.2 Why Both Scores Matter

| Scenario | Client Score | Market Score | Implication |
|----------|--------------|--------------|-------------|
| **Ideal** | 85% | 82% | Design serves client AND sells well |
| **Personal Focus** | 90% | 55% | Client happy, but limited buyer pool |
| **Market Driven** | 60% | 88% | Will sell easily, but client compromised |
| **Problematic** | 55% | 50% | Neither client nor market well served |

### 2.3 Visual Summary Display

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  THORNWOOD ESTATE — MALIBU, CA                                              │
│  BAM ALIGNMENT SUMMARY                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     CLIENT SATISFACTION              MARKET APPEAL                          │
│     ───────────────────              ─────────────                          │
│                                                                             │
│           82%                             65%                               │
│     ████████████░░░░               █████████░░░░░░░                        │
│       ✅ PASS                        ⚠️ CAUTION                             │
│                                                                             │
│     Your design strongly           Tech Executive buyers                    │
│     reflects your vision           are 65% aligned                          │
│     and lifestyle needs.           (need 80% for PASS)                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     PORTFOLIO CONTEXT: Primary Residence, 10+ Year Hold                     │
│     ───────────────────────────────────────────────────                     │
│                                                                             │
│     Forever Home ◄────────●─────────────► Investment Property               │
│                                                                             │
│     Weighting: 60% Client / 40% Market                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     COMBINED SCORE: 75%  ⚠️ CAUTION                                         │
│     ██████████████████████████████░░░░░░░░░░                               │
│                                                                             │
│     (82% × 0.60) + (65% × 0.40) = 49.2 + 26.0 = 75.2%                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Client Satisfaction Score

### 3.1 Overview

The Client Satisfaction Score measures how well the planned property serves the client's stated needs, preferences, and lifestyle requirements. This score answers: **"Will YOU be happy living here?"**

### 3.2 Scoring Categories (100 Points Total)

```
CLIENT SATISFACTION SCORE (0-100)
│
├── SPATIAL REQUIREMENTS (25 points)
│   ├── Room count matches family composition (0-5)
│   ├── Square footage meets lifestyle needs (0-5)
│   ├── Flow and adjacencies support daily routines (0-5)
│   ├── Indoor-outdoor connection as desired (0-5)
│   └── Storage and organization adequate (0-5)
│
├── LIFESTYLE ALIGNMENT (25 points)
│   ├── Entertainment spaces for hosting style (0-5)
│   ├── Work-from-home functionality (0-5)
│   ├── Hobby and interest spaces included (0-5)
│   ├── Privacy and acoustics appropriate (0-5)
│   └── Wellness and fitness provisions (0-5)
│
├── DESIGN AESTHETIC (20 points)
│   ├── Architectural style matches taste (0-5)
│   ├── Interior design aesthetic aligned (0-5)
│   ├── Material and finish quality as desired (0-5)
│   └── Natural light and views prioritized (0-5)
│
├── LOCATION CONTEXT (15 points)
│   ├── Commute and accessibility acceptable (0-5)
│   ├── School/amenity proximity (if applicable) (0-5)
│   └── Neighborhood character fit (0-5)
│
└── FUTURE-PROOFING (15 points)
    ├── Adaptability for life changes (0-5)
    ├── Technology infrastructure (0-5)
    └── Sustainability features (0-5)
```

### 3.3 Data Sources for Client Satisfaction

| Category | KYC Source | FYI Source | MVP Source |
|----------|------------|------------|------------|
| Spatial | familyComposition, staff | totalSqFt, roomCounts | adjacencies, roomList |
| Lifestyle | entertainingStyle, workStyle | spaces selected | zone assignments |
| Design | tasteResults, stylePreferences | Taste Exploration scores | — |
| Location | locationPreferences, commute | — | — |
| Future | planningHorizon, flexibility | techRequirements | — |

### 3.4 Client Satisfaction Evaluation Criteria

#### Spatial Requirements

| Factor | 5 Points | 3 Points | 1 Point | 0 Points |
|--------|----------|----------|---------|----------|
| Room Count | Exact match | ±1 room | ±2 rooms | ±3+ rooms |
| Square Footage | Within 10% | Within 20% | Within 30% | >30% variance |
| Flow/Adjacencies | All priorities met | Most met | Some met | Few met |
| Indoor-Outdoor | Matches preference exactly | Good connection | Limited | Poor/none |
| Storage | Exceeds needs | Meets needs | Adequate | Insufficient |

#### Lifestyle Alignment

| Factor | 5 Points | 3 Points | 1 Point | 0 Points |
|--------|----------|----------|---------|----------|
| Entertainment | Dedicated spaces match style | Adequate | Limited | Incompatible |
| Work-from-Home | Professional-grade office | Good office | Basic space | No provision |
| Hobbies | Dedicated spaces included | Some accommodation | Limited | None |
| Privacy/Acoustics | Exceeds requirements | Meets requirements | Adequate | Problematic |
| Wellness | Full suite as desired | Partial | Basic | Missing |

#### Design Aesthetic

| Factor | 5 Points | 3 Points | 1 Point | 0 Points |
|--------|----------|----------|---------|----------|
| Architectural Style | Strong match (>80% taste) | Good match (60-80%) | Moderate (40-60%) | Poor (<40%) |
| Interior Design | Cohesive, aligned | Mostly aligned | Mixed signals | Conflicting |
| Material Quality | Matches tier expectation | Close | Below expectation | Far below |
| Light/Views | Exceptional | Good | Adequate | Poor |

---

## 4. Market Appeal Score

### 4.1 Overview

The Market Appeal Score measures how well the planned property will appeal to likely buyers in the target market. This score answers: **"Will this SELL when the time comes?"**

### 4.2 Methodology

```
MARKET APPEAL SCORE (0-100)
│
├── STEP 1: Identify Market Buyer Pool
│   └── Top 3 archetypes for location (e.g., Malibu: Entertainment, Tech, Sports)
│
├── STEP 2: Score Against Each Archetype
│   ├── Must Haves (50 points per archetype)
│   ├── Nice to Haves (35 points per archetype)
│   └── Avoid Penalties (up to -15 points per archetype)
│
├── STEP 3: Weight by Market Share
│   └── Archetype score × market share percentage
│
└── FINAL: Weighted Average = Market Appeal Score
```

### 4.3 Market-Specific Buyer Pools

| Market | #1 Archetype | #2 Archetype | #3 Archetype | Other |
|--------|--------------|--------------|--------------|-------|
| **Malibu, CA** | Entertainment (35%) | Tech Executive (28%) | Sports Pro (18%) | 19% |
| **Aspen, CO** | Generational (30%) | Finance (25%) | Sports Pro (20%) | 25% |
| **Greenwich, CT** | Finance (40%) | Family Office (25%) | Generational (20%) | 15% |
| **Palm Beach, FL** | International (35%) | Finance (30%) | Generational (25%) | 10% |
| **Beverly Hills, CA** | Entertainment (30%) | Tech Executive (25%) | International (20%) | 25% |
| **Hamptons, NY** | Finance (35%) | Entertainment (25%) | Tech Executive (20%) | 20% |
| **Miami Beach, FL** | International (40%) | Entertainment (25%) | Sports Pro (20%) | 15% |
| **Scottsdale, AZ** | Sports Pro (30%) | Tech Executive (25%) | Wellness (20%) | 25% |

### 4.4 Weighted Calculation Example

```
MALIBU MARKET APPEAL CALCULATION

Archetype Scores:
├── Entertainment Executive: 72% × 35% weight = 25.2
├── Tech Executive: 65% × 28% weight = 18.2
├── Sports Professional: 60% × 18% weight = 10.8
└── Other: (avg 55%) × 19% weight = 10.5

MARKET APPEAL SCORE = 25.2 + 18.2 + 10.8 + 10.5 = 64.7% ≈ 65%
```

### 4.5 Archetype Scoring Structure

Each archetype is scored using the Must Have / Nice to Have / Avoid framework:

```
ARCHETYPE SCORE (0-100 per archetype)
│
├── MUST HAVES (50 points max, 50% weight)
│   └── 5 requirements × 10 points each
│   └── Full match = 10, Partial = 5, None = 0
│
├── NICE TO HAVES (35 points max, 35% weight)
│   └── 5 features × 7 points each
│   └── Full match = 7, Partial = 3.5, None = 0
│
└── AVOIDS (Penalties, 15% weight)
    └── Each triggered avoid = -5 to -15 points
    └── Applied AFTER calculating earned points
```

---

## 5. Portfolio Context

### 5.1 Overview

Not all clients have the same investment horizon or priorities. A "forever home" buyer should prioritize personal satisfaction, while a "5-year flip" buyer should prioritize market appeal. Portfolio Context adjusts the weighting between the two scores.

### 5.2 Portfolio Types

| Type | Definition | Client Weight | Market Weight |
|------|------------|---------------|---------------|
| **Forever Home** | 15+ year hold, legacy property | 70% | 30% |
| **Primary Residence** | 10-15 year hold | 60% | 40% |
| **Medium-Term** | 5-10 year hold | 50% | 50% |
| **Investment** | <5 year hold or rental | 30% | 70% |
| **Spec Development** | Build to sell | 10% | 90% |

### 5.3 UI: Portfolio Context Slider

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PORTFOLIO CONTEXT                                                          │
│                                                                             │
│  How long do you plan to own this property?                                 │
│                                                                             │
│  Forever     Primary      Medium       Investment    Spec                   │
│  Home        Residence    Term         Property      Build                  │
│    │            │           │             │            │                    │
│    ▼            ▼           ▼             ▼            ▼                    │
│  ──●────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  Current Selection: PRIMARY RESIDENCE (10-15 year hold)                     │
│                                                                             │
│  Score Weighting:                                                           │
│  ├── Client Satisfaction: 60%                                               │
│  └── Market Appeal: 40%                                                     │
│                                                                             │
│  This means your COMBINED SCORE prioritizes personal satisfaction           │
│  while still ensuring reasonable resale appeal.                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Combined Score Calculation

```javascript
function calculateCombinedScore(clientScore, marketScore, portfolioContext) {
  const weights = {
    'forever-home': { client: 0.70, market: 0.30 },
    'primary-residence': { client: 0.60, market: 0.40 },
    'medium-term': { client: 0.50, market: 0.50 },
    'investment': { client: 0.30, market: 0.70 },
    'spec-build': { client: 0.10, market: 0.90 },
  };

  const w = weights[portfolioContext];
  const combined = (clientScore * w.client) + (marketScore * w.market);

  return {
    score: Math.round(combined),
    clientContribution: Math.round(clientScore * w.client),
    marketContribution: Math.round(marketScore * w.market),
    status: combined >= 80 ? 'PASS' : combined >= 65 ? 'CAUTION' : 'FAIL',
  };
}

// Example:
// Client Score: 82%, Market Score: 65%, Context: Primary Residence
// Combined = (82 × 0.60) + (65 × 0.40) = 49.2 + 26.0 = 75.2% → CAUTION
```

---

## 6. Feature Classification

### 6.1 Overview

Every design feature falls into one of four categories based on its value to the client versus its value to the market. This classification helps advisors guide trade-off discussions.

### 6.2 The Four Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    FEATURE CLASSIFICATION MATRIX                            │
│                                                                             │
│                          HIGH MARKET VALUE                                  │
│                                 │                                           │
│         ESSENTIAL               │           DIFFERENTIATING                 │
│    ─────────────────────        │      ─────────────────────                │
│    Required by most buyers      │      Premium features that                │
│    AND serves client well       │      command higher prices                │
│                                 │                                           │
│    Action: MUST INCLUDE         │      Action: INCLUDE IF BUDGET            │
│                                 │               ALLOWS                       │
│                                 │                                           │
│    Examples:                    │      Examples:                            │
│    • Quality construction       │      • Home theater                       │
│    • Smart home basics          │      • Wine cellar                        │
│    • Modern kitchen             │      • Pool house                         │
│    • Primary suite quality      │      • Guest house                        │
│                                 │                                           │
│  ───────────────────────────────┼───────────────────────────────────────── │
│                                 │                                           │
│         PERSONAL                │              RISKY                        │
│    ─────────────────────        │      ─────────────────────                │
│    High value to client,        │      Low value to both OR                 │
│    limited market appeal        │      actively limits buyers               │
│                                 │                                           │
│    Action: INCLUDE WITH         │      Action: AVOID OR                     │
│            AWARENESS            │              RECONSIDER                   │
│                                 │                                           │
│    Examples:                    │      Examples:                            │
│    • Hobby-specific rooms       │      • Highly unusual style               │
│    • Religious spaces           │      • Over-personalization               │
│    • Pet facilities             │      • Excessive scale                    │
│    • Collection display         │      • Dated design choices               │
│                                 │                                           │
│             LOW MARKET VALUE                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Classification Criteria

| Category | Client Value | Market Value | Recommendation |
|----------|--------------|--------------|----------------|
| **Essential** | High | High | Must include — validates both scores |
| **Differentiating** | Medium-High | High | Include if budget allows — commands premium |
| **Personal** | High | Low | Include with awareness — may limit buyers |
| **Risky** | Low-Medium | Low-Negative | Avoid or reconsider — hurts resale |

### 6.4 Feature Classification Report Section

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FEATURE CLASSIFICATION ANALYSIS                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ESSENTIAL (Must Include — High Value Both)                         ✓ 8/10 │
│  ─────────────────────────────────────────                                  │
│  ✓ Smart Home Infrastructure          ✓ Contemporary Design                │
│  ✓ Quality Construction               ✓ Privacy/Gating                     │
│  ✓ Modern Kitchen                     ✓ Indoor-Outdoor Flow                │
│  ✓ Primary Suite Excellence           ✓ Natural Light Optimization         │
│  ✗ EV Charging Provisions             ✗ Guest Autonomy Node                │
│                                                                             │
│  Gap: Add EV charging (+5 pts) and guest autonomy (+7 pts)                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DIFFERENTIATING (Premium Value-Add)                                ◐ 3/5  │
│  ─────────────────────────────────────                                      │
│  ✓ Home Theater                       ✓ Wellness Suite                     │
│  ✓ Pool + Outdoor Kitchen                                                  │
│  ◐ Wine Cellar (undersized)           ✗ Screening Room                     │
│                                                                             │
│  Opportunity: Expand wine cellar or add dedicated screening                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PERSONAL (Client Value, Limited Market)                            ! 2    │
│  ─────────────────────────────────────────                                  │
│  ! 2-acre grounds (high maintenance — limits buyer pool)                   │
│  ! Extensive art display walls (specific taste)                            │
│                                                                             │
│  Advisory: These features serve you well but may require marketing         │
│  to a narrower buyer pool. Consider grounds maintenance plan.              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RISKY (Reconsider — May Hurt Resale)                               ⚠ 1    │
│  ──────────────────────────────────────                                     │
│  ⚠ Mixed style signals (Contemporary + Mediterranean elements)             │
│                                                                             │
│  Warning: Design inconsistency confuses buyers. Recommend                  │
│  committing to a cohesive contemporary aesthetic throughout.               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Trade-off Analysis

### 7.1 Overview

The Trade-off Analysis visualizes the tension between personal satisfaction and market appeal, helping clients make informed decisions about design choices.

### 7.2 Trade-off Matrix Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FEATURE TRADE-OFF MATRIX                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HIGH                                                                       │
│  MARKET     │                                                               │
│  VALUE      │    ★ Smart Home        ★ Privacy                              │
│             │              ★ Quality Construction                           │
│     80 ─────┼───────────────────────────────────                            │
│             │         ★ Contemporary                                        │
│             │              Design          ★ EV Charging                    │
│             │                                                               │
│     60 ─────┼──────────────────◆─Home Theater                               │
│             │                  ◆ Wellness Suite                             │
│             │                                                               │
│             │                                                               │
│     40 ─────┼───────────────────────────────▲ Wine Focus                    │
│             │                                                               │
│             │     ⚠ Mixed                    ▲ 2-Acre Grounds               │
│             │       Style                                                   │
│     20 ─────┼─────────────────────────────────────────────                  │
│             │                                                               │
│  LOW        │                                                               │
│             └────────┬─────────┬─────────┬─────────┬──────► HIGH            │
│                     20        40        60        80     PERSONAL           │
│                                                           VALUE             │
│                                                                             │
│  Legend:                                                                    │
│  ★ = Essential (keep)                                                       │
│  ◆ = Differentiating (enhance)                                              │
│  ▲ = Personal (aware of trade-off)                                          │
│  ⚠ = Risky (reconsider)                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Trade-off Recommendations

Based on the matrix position, generate specific recommendations:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRADE-OFF RECOMMENDATIONS                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OPTIMIZE (High Market, Lower Personal)                                     │
│  ──────────────────────────────────────                                     │
│  → EV Charging: You rated this low, but 82% of Tech Executive buyers        │
│    expect it. Consider adding for +10 market points at minimal cost.        │
│                                                                             │
│  PRESERVE (High Personal, Lower Market)                                     │
│  ──────────────────────────────────────                                     │
│  → 2-Acre Grounds: This serves your lifestyle well but adds maintenance     │
│    concerns for buyers. Recommendation: Include staff quarters OR           │
│    create low-maintenance landscape zones. Impact: Removes -5 penalty.      │
│                                                                             │
│  RESOLVE (Low Both)                                                         │
│  ──────────────────                                                         │
│  → Mixed Style Signals: Current design mixes Contemporary and               │
│    Mediterranean elements. This confuses both you and buyers.               │
│    Recommendation: Commit to cohesive Contemporary throughout.              │
│    Impact: +5 client satisfaction, +5 market appeal.                        │
│                                                                             │
│  ENHANCE (Medium Both)                                                      │
│  ─────────────────────                                                      │
│  → Wine Cellar: Currently 300 SF / 500 bottles. Expanding to 600+           │
│    bottles would move this to "Differentiating" quadrant.                   │
│    Impact: +4 client, +5 market. Cost: ~$45K.                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Buyer Archetype Profiles

### 8.1 Archetype Summary Table

| ID | Name | Key Must Haves | Key Avoids |
|----|------|----------------|------------|
| `tech-executive` | Tech Executive | Smart Home, Office, Contemporary | Traditional, HOA |
| `entertainment` | Entertainment Executive | Screening Room, Privacy, Chef's Kitchen | Minimalist, Small |
| `finance` | Finance Executive | Library, Traditional, Formal Dining | Modern, Remote |
| `international` | International Investor | Security, Staff, Guest Suites | Compact, Limited Privacy |
| `sports-pro` | Sports Professional | Gym 1000+ SF, Recovery Suite | Traditional, Small Gym |
| `generational` | Generational Wealth | Guest House, Estate, 6+ Bedrooms | Modern, Single Structure |
| `wellness` | Wellness Pioneer | Spa Suite, Natural Materials | Urban, Artificial |
| `developer` | Real Estate Developer | Quality Construction, Resale Position | Over-Personalization |

### 8.2 Complete Archetype Profile: Tech Executive

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TECH EXECUTIVE                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Profile:                                                                   │
│  Successful technology industry leaders, startup founders, and C-suite      │
│  executives who value innovation, privacy, and modern design. They          │
│  prioritize smart home integration and functional spaces over traditional   │
│  opulence.                                                                  │
│                                                                             │
│  Demographics:                                                              │
│  • Age Range: 35-55                                                         │
│  • Net Worth: $20M - $200M                                                  │
│  • Occupation: Tech CEO / Founder / CTO / VP Engineering                    │
│                                                                             │
│  Market Share:                                                              │
│  • Malibu: 28%    • Beverly Hills: 25%    • Hamptons: 20%                  │
│  • Scottsdale: 25%    • Aspen: 10%    • Greenwich: 10%                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MUST HAVES (50 points)                                                     │
│                                                                             │
│  │ Requirement                  │ Points │ Match Criteria                  │
│  ├─────────────────────────────┼────────┼─────────────────────────────────┤
│  │ Smart Home Infrastructure    │ 10     │ Whole-home automation system   │
│  │ Dedicated Home Office        │ 10     │ Office with video conferencing │
│  │ Contemporary/Modern Design   │ 10     │ Taste results in modern family │
│  │ Privacy from Neighbors       │ 10     │ Gated/setback/screened        │
│  │ EV Charging + Tech Garage    │ 10     │ EV provisions + tech storage   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NICE TO HAVES (35 points)                                                  │
│                                                                             │
│  │ Feature                      │ Points │ Match Criteria                  │
│  ├─────────────────────────────┼────────┼─────────────────────────────────┤
│  │ Wellness Suite               │ 7      │ Gym + spa/steam/sauna          │
│  │ Indoor-Outdoor Living        │ 7      │ Living → terrace adjacency     │
│  │ Guest Autonomy               │ 7      │ Guest suite with private entry │
│  │ Home Theater                 │ 7      │ Dedicated theater room         │
│  │ Wine Storage                 │ 7      │ Wine cellar/room               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AVOIDS (Penalties)                                                         │
│                                                                             │
│  │ Anti-Pattern                 │ Penalty │ Trigger Criteria               │
│  ├─────────────────────────────┼─────────┼────────────────────────────────┤
│  │ Traditional/Ornate Styling   │ -15     │ Taste results in traditional  │
│  │ High-Maintenance Grounds     │ -10     │ >2 acres without staff        │
│  │ Visible from Street          │ -10     │ High street visibility         │
│  │ HOA Restrictions             │ -10     │ HOA limits modifications       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Additional Archetype Profiles (Summary)

#### Entertainment Executive
- **Must Haves:** Screening Room (≥400 SF), Exceptional Privacy, Chef's Kitchen with Catering, Prestigious Address, Entertainment Terrace (≥800 SF)
- **Nice to Haves:** Multiple Guest Suites (≥3), Wine Cellar (≥500 bottles), Pool + Pool House, Staff Quarters, Car Gallery (≥4)
- **Avoids:** Minimalist/Industrial Design (-15), Compact Footprint <10K SF (-10), Limited Parking (-10)

#### Finance Executive
- **Must Haves:** Traditional/Transitional Design, Library/Study, Formal Dining (≥16 seats), Quality Construction, Proximity to Financial Center
- **Nice to Haves:** Wine Cellar (≥1000 bottles), Home Office with Conference, Pool, Tennis Court, Guest Wing
- **Avoids:** Modern/Minimalist Design (-15), Tech-Forward Aesthetic (-10), Remote Location (-10)

#### International Investor
- **Must Haves:** Security Infrastructure, Staff Quarters (separate entry), Turnkey Condition, Multiple Guest Suites (≥4), Prestigious International Market
- **Nice to Haves:** Spa/Wellness Suite, Wine Cellar, Car Gallery (≥6), Pool + Pool House, Home Theater
- **Avoids:** Compact Size <12K SF (-15), Non-Primary Market (-10), Limited Privacy (-10)

#### Sports Professional
- **Must Haves:** Professional Gym (≥1,000 SF), Recovery Suite (spa/steam/plunge), Privacy, Entertainment/Game Room, Large Property (≥1 acre or court)
- **Nice to Haves:** Basketball/Sport Court, Lap Pool, Home Theater, Car Gallery (≥4), Guest Suites (≥3)
- **Avoids:** Small/No Gym <500 SF (-15), Traditional/Formal Design (-10), High-Maintenance Materials (-10)

#### Generational Wealth
- **Must Haves:** Guest House, Multiple Bedrooms (≥6), Staff Quarters, Traditional/Timeless Design, Estate Property (≥2 acres)
- **Nice to Haves:** Pool House, Tennis Court, Wine Cellar (≥1000 bottles), Kids' Spaces, Library
- **Avoids:** Modern/Minimalist Design (-15), Compact Property <1 acre (-10), Single Structure Only (-10)

#### Wellness Pioneer
- **Must Haves:** Wellness Suite (gym+spa+sauna+steam), Natural/Organic Materials, Indoor-Outdoor Connection, Clean Air/Water Systems, Privacy for Retreat
- **Nice to Haves:** Lap Pool, Meditation/Yoga Space, Chef's Kitchen (healthy prep), Guest Suite, Gardens
- **Avoids:** Urban/Dense Location (-15), Limited Outdoor Space <0.5 acre (-10), Artificial Materials (-10)

#### Real Estate Developer
- **Must Haves:** Quality Construction, Innovative/Notable Design, Resale Positioning, Efficient Layout, Prime Appreciation Location
- **Nice to Haves:** Smart Home Technology, Flexible/Multi-Purpose Spaces, Strong Indoor-Outdoor, Guest Accommodations (≥2), Pool
- **Avoids:** Over-Personalization (-15), Poor Circulation score <70 (-10), Dated/Trending-Out Design (-10)

---

## 9. Data Mapping Reference

### 9.1 KYC → BAM Field Mapping

| KYC Field | Path | BAM Use |
|-----------|------|---------|
| Budget | `kycData.principal.portfolioContext.budget` | Market positioning |
| Location | `kycData.principal.portfolioContext.location` | Buyer pool selection |
| Family Type | `kycData.principal.portfolioContext.familyComposition` | Client satisfaction |
| Staff Count | `kycData.principal.operatingModel.staffCount` | Staff quarters need |
| Privacy Level | `kycData.principal.siteRequirements.privacy` | Privacy matching |
| Quality Tier | `kycData.principal.portfolioContext.qualityTier` | Construction quality |
| Planning Horizon | `kycData.principal.portfolioContext.planningHorizon` | Portfolio context |
| Entertaining Style | `kycData.principal.lifestyle.entertainingStyle` | Lifestyle alignment |
| Work Style | `kycData.principal.lifestyle.workStyle` | Office requirements |

### 9.2 FYI → BAM Field Mapping

| FYI Field | Path | BAM Use |
|-----------|------|---------|
| Taste Results | `kycData.principal.designIdentity.tasteResults` | Style matching |
| Dominant Style | `fyiData.styleProfile.dominant` | Primary aesthetic |
| Spaces Selected | `fyiData.spaces[]` | Space matching |
| Total SF | `fyiData.totalSquareFootage` | Size alignment |
| Bedroom Count | `fyiData.rooms.bedrooms.count` | Room matching |
| Features | `fyiData.features[]` | Feature classification |

### 9.3 MVP → BAM Field Mapping

| MVP Field | Path | BAM Use |
|-----------|------|---------|
| Adjacency Decisions | `mvpData.adjacencies[]` | Flow analysis |
| Room List | `mvpData.rooms[]` | Space verification |
| Module Scores | `mvpData.validation.moduleScores` | Layout quality |
| Guest Autonomy | `mvpData.features.guestAutonomy` | Independence |
| Indoor-Outdoor | `mvpData.adjacencies.filter(a => a.outdoor)` | Connection quality |

---

## 10. Scoring Algorithm

### 10.1 Complete BAM Calculation

```javascript
function calculateBAMScores(clientData, marketLocation, portfolioContext) {
  
  // 1. Calculate Client Satisfaction Score
  const clientScore = calculateClientSatisfaction(clientData);
  
  // 2. Get market buyer pool
  const buyerPool = MARKET_BUYER_POOLS[marketLocation];
  
  // 3. Calculate score for each archetype
  const archetypeScores = buyerPool.archetypes.map(archetype => {
    const score = calculateArchetypeScore(archetype, clientData);
    return {
      ...archetype,
      score,
      weightedContribution: score.percentage * archetype.share,
    };
  });
  
  // 4. Calculate weighted Market Appeal Score
  const marketScore = {
    percentage: Math.round(archetypeScores.reduce(
      (sum, a) => sum + a.weightedContribution, 0
    )),
    archetypeBreakdown: archetypeScores,
  };
  
  // 5. Calculate Combined Score
  const weights = PORTFOLIO_WEIGHTS[portfolioContext];
  const combinedScore = Math.round(
    (clientScore.percentage * weights.client) +
    (marketScore.percentage * weights.market)
  );
  
  // 6. Classify features
  const featureClassification = classifyAllFeatures(clientData, archetypeScores);
  
  // 7. Generate trade-off analysis
  const tradeOffAnalysis = generateTradeOffAnalysis(
    featureClassification, clientScore, marketScore
  );
  
  // 8. Generate gap analysis
  const gapAnalysis = generateGapAnalysis(archetypeScores);
  
  return {
    clientSatisfaction: {
      score: clientScore.percentage,
      status: getStatus(clientScore.percentage),
      breakdown: clientScore.breakdown,
    },
    marketAppeal: {
      score: marketScore.percentage,
      status: getStatus(marketScore.percentage),
      archetypes: archetypeScores,
    },
    combined: {
      score: combinedScore,
      status: getStatus(combinedScore),
      weights,
    },
    portfolioContext,
    featureClassification,
    tradeOffAnalysis,
    gapAnalysis,
  };
}
```

---

## 11. Report Design

### 11.1 Full BAM Report Structure

**Page 1: Alignment Summary**
- Dual score gauges (Client Satisfaction + Market Appeal)
- Portfolio context and weighting
- Combined score with status

**Page 2: Top Archetype Analysis**
- Archetype #1 detailed breakdown
- Must Have / Nice to Have / Avoid tables
- Path to 80% recommendations

**Page 3: Feature Classification**
- Essential / Differentiating / Personal / Risky categories
- Feature-by-feature status
- Gap identification

**Page 4: Trade-off Matrix**
- Visual quadrant chart
- Optimization recommendations
- Action items prioritized

**Page 5: Summary & Recommendations**
- Key findings
- Priority actions
- Combined score projection after changes

---

## 12. Data Structures

### 12.1 Portfolio Weight Configuration

```typescript
const PORTFOLIO_WEIGHTS = {
  'forever-home': { client: 0.70, market: 0.30 },
  'primary-residence': { client: 0.60, market: 0.40 },
  'medium-term': { client: 0.50, market: 0.50 },
  'investment': { client: 0.30, market: 0.70 },
  'spec-build': { client: 0.10, market: 0.90 },
};
```

---

## 13. Implementation Guide

### 13.1 Implementation Phases

**Phase 1: Core Scoring**
- [ ] Implement `calculateClientSatisfactionScore()`
- [ ] Implement `calculateMarketAppealScore()` with archetype weighting
- [ ] Implement `calculateCombinedScore()` with portfolio weights
- [ ] Add Portfolio Context selector to KYC module

**Phase 2: Feature Analysis**
- [ ] Implement `classifyFeature()` for all design features
- [ ] Build Feature Classification report section
- [ ] Create Trade-off Matrix visualization

**Phase 3: Report Generation**
- [ ] Design BAM Summary panel
- [ ] Create Archetype Detail cards
- [ ] Build Path to 80% recommendations
- [ ] Add BAM pages to PDF report

**Phase 4: UI Polish**
- [ ] Dual score gauge visualization
- [ ] Portfolio context slider
- [ ] Interactive trade-off matrix
- [ ] Collapsible archetype details

---

## Appendix: Market Buyer Pool Reference

| Market | Archetype 1 | Archetype 2 | Archetype 3 | Other |
|--------|-------------|-------------|-------------|-------|
| Malibu, CA | Entertainment 35% | Tech 28% | Sports 18% | 19% |
| Beverly Hills, CA | Entertainment 30% | Tech 25% | International 20% | 25% |
| Aspen, CO | Generational 30% | Finance 25% | Sports 20% | 25% |
| Greenwich, CT | Finance 40% | Family Office 25% | Generational 20% | 15% |
| Palm Beach, FL | International 35% | Finance 30% | Generational 25% | 10% |
| Miami Beach, FL | International 40% | Entertainment 25% | Sports 20% | 15% |
| Hamptons, NY | Finance 35% | Entertainment 25% | Tech 20% | 20% |
| Scottsdale, AZ | Sports 30% | Tech 25% | Wellness 20% | 25% |
| Montecito, CA | Entertainment 30% | Generational 25% | Wellness 20% | 25% |
| Jackson Hole, WY | Generational 35% | Tech 25% | Wellness 20% | 20% |

---

*End of BAM Methodology Specification v3.0*
