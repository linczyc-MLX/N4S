# KYS Module Specification
## Know Your Site - Site-Vision Compatibility Assessment

> **Purpose**: Evaluate potential sites against client's VALIDATED program BEFORE capital commitment
> **Arvin's Rule**: "You make your money on the buy"
> **Version**: 1.1
> **Created**: January 13, 2026

---

## 1. Module Overview

KYS is a gateway decision module that answers: **"Can THIS site accommodate the validated program?"**

Unlike KYM (ongoing market intelligence), KYS produces a **GO/NO-GO recommendation** with traffic lights.

### Key Differentiators
- Prevents the "Palazzo Problem" — building the wrong thing on the wrong site
- Multi-site comparison (up to 4 sites)
- Deal-breaker detection with automatic RED flags
- Findings flow forward to KYM

### Workflow Position
```
KYC → FYI → MVP → KYS → KYM → VMX
                   ↑
               GATEWAY
```

**Why after MVP (not after KYC):**
- FYI defines the space program (what we're trying to fit)
- MVP validates and may adjust the program (10K → 15K scenario)
- KYS evaluates if candidate sites can accommodate the **validated** program
- KYM then positions the selected site in the market

### Data Dependencies (Inputs from Prior Modules)
| From Module | Data Needed |
|-------------|-------------|
| KYC | Client flexibility index, vision description, budget |
| FYI | Target SF, footprint, number of levels, guest house, principal rooms |
| MVP | Validated tier (5K/10K/15K/20K), final adjacency requirements |

---

## 2. The 7 Assessment Categories

### Category 1: Physical Site Capacity (Weight: 15%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 1.1 | Lot dimensions & geometry (width-to-depth ratio) | 5=Ideal proportions, 1=Severely constrained |
| 1.2 | Buildable area vs total area | 5=≥80% buildable, 1=<50% buildable |
| 1.3 | Topography and grade | 5=Level/gently sloped, 1=Severe grade issues |
| 1.4 | Orientation flexibility | 5=Multiple optimal orientations, 1=Single forced orientation |
| 1.5 | Geotechnical conditions | 5=Standard foundation, 1=Major engineering required |

### Category 2: Views & Aspect (Weight: 18%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 2.1 | Primary view quality & permanence | 5=Premium protected views, 1=No significant views |
| 2.2 | View breadth (% of principal rooms with views) | 5=≥80% rooms, 1=<30% rooms |
| 2.3 | Solar orientation for key living spaces | 5=Optimal for lifestyle, 1=Poor orientation |
| 2.4 | Exposure to elements (wind, weather) | 5=Naturally protected, 1=Severe exposure |

### Category 3: Privacy & Boundaries (Weight: 15%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 3.1 | Setbacks from all boundaries | 5=Generous setbacks, 1=Minimal setbacks |
| 3.2 | Visual screening potential | 5=Natural screening exists, 1=Fully exposed |
| 3.3 | Acoustic separation | 5=Quiet/isolated, 1=Noise concerns |
| 3.4 | Elevation relative to neighbors | 5=Commanding position, 1=Overlooked |
| 3.5 | Entry sequence & gating potential | 5=Long private drive possible, 1=Street-facing entry |

### Category 4: Adjacencies & Context (Weight: 15%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 4.1 | Neighboring property values & quality | 5=Comparable $50M+, 1=Value mismatch >50% |
| 4.2 | Stylistic harmony with surroundings | 5=Compatible context, 1=Severe clash |
| 4.3 | Commercial/institutional proximity | 5=None visible, 1=Adjacent commercial |
| 4.4 | Road noise & traffic exposure | 5=Private/quiet road, 1=Major traffic |
| 4.5 | Future development risk on adjacent parcels | 5=Protected/unlikely, 1=High development risk |

### Category 5: Market & Demographic Alignment (Weight: 15%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 5.1 | Style resonance with micro-market buyers | 5=Strong demand for style, 1=No market for style |
| 5.2 | Price positioning vs comparables | 5=In-line with market, 1=>50% above comps |
| 5.3 | Absorption history for similar product | 5=Quick sales history, 1=No comparable sales |
| 5.4 | Buyer demographic expectations | 5=Matches buyer profile, 1=Misaligned |

### Category 6: Vision Compatibility (Weight: 12%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 6.1 | Can vision physically manifest on site? | 5=Fully achievable, 1=Impossible |
| 6.2 | Required compromises & severity | 5=Minor/none, 1=Vision-breaking compromises |
| 6.3 | Client flexibility index (from KYC) | 5=Highly adaptable, 1=Fixed vision |

### Category 7: Regulatory & Practical (Weight: 10%)
| # | Sub-Factor | Score Guide |
|---|------------|-------------|
| 7.1 | Zoning & FAR constraints | 5=Favorable for vision, 1=Prohibitive |
| 7.2 | Height & envelope restrictions | 5=Accommodates vision, 1=Blocks key elements |
| 7.3 | Historic/design review requirements | 5=None/favorable, 1=Restrictive review |
| 7.4 | Permitting complexity & timeline | 5=Standard process, 1=>24 month risk |
| 7.5 | HOA or community covenants | 5=None/favorable, 1=Prohibits vision |

---

## 3. Deal-Breaker Flags (Automatic RED)

Any of these automatically triggers a RED overall assessment:

| # | Deal-Breaker | Detection |
|---|--------------|-----------|
| DB1 | Lot geometry incompatible with vision massing | 1.1 ≤ 1 |
| DB2 | Primary views cannot be achieved for principal rooms | 2.2 ≤ 1 |
| DB3 | Adjacent commercial/institutional creates context mismatch | 4.3 ≤ 1 |
| DB4 | Neighboring values create price ceiling below target | 4.1 ≤ 1.5 |
| DB5 | Style vision has no absorption history in market | 5.3 ≤ 1 |
| DB6 | Client vision is FIXED AND site requires major compromises | 6.3 ≤ 2 AND 6.2 ≤ 2 |
| DB7 | Zoning prohibits intended use or scale | 7.1 ≤ 1 |
| DB8 | Historic/design review would block key design elements | 7.3 ≤ 1 |
| DB9 | Geotechnical conditions make construction infeasible | 1.5 ≤ 1 |
| DB10 | HOA covenants prohibit intended style or features | 7.5 ≤ 1 |

---

## 4. Traffic Light Scoring

### Category Score → Traffic Light
| Score Range | Traffic Light | Meaning |
|-------------|---------------|---------|
| 4.0 - 5.0 | 🟢 GREEN | Proceed with confidence |
| 2.5 - 3.9 | 🟡 AMBER | Concerns exist - mitigation required |
| 0.0 - 2.4 | 🔴 RED | Do not proceed - fundamental misalignment |

### Overall Score Calculation
```
Overall = Σ (Category Score × Category Weight)

With adjustments:
- Any Deal-Breaker present → Override to RED
- ≥2 RED categories → Override to RED
- ≥3 AMBER categories → Cap at AMBER
```

### Recommendation Outputs
| Overall Light | Recommendation |
|---------------|----------------|
| 🟢 GREEN | "Proceed with acquisition" |
| 🟡 AMBER | "Proceed only with documented mitigation strategy" |
| 🔴 RED | "Do not acquire this site for this vision" |

---

## 5. Data Structure (AppContext)

```javascript
const initialKYSData = {
  sites: [], // Array of site assessments
  selectedSiteId: null, // Currently selected site
  comparisonEnabled: false, // Multi-site comparison mode
};

// Single site structure
const siteAssessment = {
  id: 'site_xxx',
  createdAt: null,
  updatedAt: null,
  
  // Basic Info
  basicInfo: {
    name: '', // "Ocean Drive Parcel"
    address: '',
    city: '',
    state: '',
    zipCode: '',
    askingPrice: null,
    lotSizeSF: null,
    lotSizeAcres: null,
    lotWidth: null,
    lotDepth: null,
    zoning: '',
    mlsNumber: '',
    notes: '',
  },
  
  // Scores: { [factorId]: { score: 1-5, notes: '' } }
  scores: {
    '1.1': { score: null, notes: '' },
    '1.2': { score: null, notes: '' },
    // ... all 32 factors
  },
  
  // Deal-breakers: { [dbId]: { triggered: boolean, notes: '' } }
  dealBreakers: {
    'DB1': { triggered: false, notes: '' },
    // ... all 10
  },
  
  // Calculated (derived from scores)
  categoryScores: {
    'physicalCapacity': null,
    'viewsAspect': null,
    'privacyBoundaries': null,
    'adjacenciesContext': null,
    'marketAlignment': null,
    'visionCompatibility': null,
    'regulatoryPractical': null,
  },
  
  overallScore: null,
  trafficLight: null, // 'green' | 'amber' | 'red'
  recommendation: '',
  
  // Handoff data (flows to KYM)
  handoffNotes: {
    insightsForKYM: '', // "Market expects contemporary, not traditional"
    siteConstraints: '', // "Max footprint 8,000 SF due to setbacks"
    waivedDealBreakers: [], // If client proceeds despite RED
  },
};
```

---

## 6. UI Structure

### Main Views
1. **Site List** - Dashboard of all evaluated sites
2. **Site Assessment** - Scoring interface for single site
3. **Comparison View** - Side-by-side (up to 4 sites)
4. **Report View** - PDF preview/export

### Site Assessment Flow
```
Site Info → Physical → Views → Privacy → Adjacencies → Market → Vision → Regulatory → Summary
    ↓
 7 category tabs or stepper
```

### Comparison Features
- Side-by-side traffic lights per category
- Overall score ranking
- Deal-breaker comparison
- "Best for this category" highlights

---

## 7. Integration Points

### From KYC (Input)
- Client vision description
- Client flexibility index (Factor 6.3)
- Target budget (for price ceiling calculation)
- Project location preferences

### From FYI (Input)
- Target SF and program tier
- Building footprint requirements
- Number of levels needed
- Guest house / pool house requirements
- List of principal rooms requiring views

### From MVP (Input)
- Validated tier (5K/10K/15K/20K)
- Final adjacency requirements
- Confirmed program (may have changed from initial FYI)

### To KYM (Output)
- Market positioning insights
- Site context for comparable search
- Buyer demographic notes
- Constraints documentation

---

## 8. Module Color

**Soft Pillow Palette Addition:**
| Module | Color Name | Background | Text |
|--------|------------|------------|------|
| KYS | Copper | `#C4A484` | `#1a1a1a` |

---

## 9. Files to Create

```
src/components/KYS/
├── KYSModule.jsx         # Main module (tabs, routing)
├── KYSModule.css         # Styling
├── KYSDocumentation.jsx  # 4-tab docs
├── KYSReportGenerator.js # PDF export
├── KYSScoringEngine.js   # Score calculations
├── components/
│   ├── SiteList.jsx      # Site dashboard
│   ├── SiteAssessment.jsx # Scoring interface
│   ├── SiteComparison.jsx # Multi-site view
│   └── CategoryScoring.jsx # Reusable category scorer
└── index.js
```

---

## 10. Example: The Palazzo Assessment

Using Arvin's case study:

| Category | Score | Light | Notes |
|----------|-------|-------|-------|
| Physical Site Capacity | 2.3 | 🔴 | Lot too narrow for palazzo massing |
| Views & Aspect | 1.8 | 🔴 | Only master gets ocean view |
| Privacy & Boundaries | 2.5 | 🟡 | Hotel adjacency concerns |
| Adjacencies & Context | 2.0 | 🔴 | No comparable $60M+ neighbors |
| Market Alignment | 1.5 | 🔴 | Ornate style wrong for market |
| Vision Compatibility | 1.2 | 🔴 | Fixed vision, incompatible site |
| Regulatory & Practical | 3.2 | 🟡 | Standard permitting |

**Overall: 2.1 → RED**

**Deal-Breakers Triggered:**
- DB1: Lot geometry incompatible ✓
- DB4: Neighboring values create ceiling ✓
- DB5: No absorption history for style ✓
- DB6: Fixed vision + major compromises ✓

**Recommendation:** "Do not acquire this site for this vision. Seek alternative site with minimum 150' frontage in established $50M+ enclave."

---

*This specification should be reviewed before implementation begins.*
