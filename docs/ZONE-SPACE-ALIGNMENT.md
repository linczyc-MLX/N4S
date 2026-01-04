# N4S Zone & Space Alignment Analysis

> **Purpose**: Establish a unified zone/space terminology across KYC, FYI, MVP, and VMX modules
> **Date**: January 4, 2026
> **Status**: DRAFT - Pending Michael's Review

---

## Current State: Inconsistencies Identified

### Zone Terminology Comparison

| MVP Zones | FYI Replit Zones | Notes |
|-----------|------------------|-------|
| Arrival + Formal | Arrival + Public | Similar intent, different names |
| Family Hub | Kitchen + Family | MVP separates Kitchen into Family Hub |
| Service Core | Service + Back-of-House | Similar |
| Wellness | Wellness | ✓ Aligned |
| Hospitality | Guest + Secondary Suites | Different names |
| Primary Wing | Primary Suite | Similar |
| Kids Zone (20k only) | — | Missing in FYI |
| — | Entertainment | MVP bundles into Family Hub |
| Circulation | — | MVP explicit, FYI calculated |
| Outdoor | — | MVP explicit, FYI exterior separate |

### Space Code Inconsistencies

| Space | MVP Code | FYI Name | KYC Option Value |
|-------|----------|----------|------------------|
| Foyer | FOY | Entry Gallery | — |
| Great Room | GR | Formal Living Room | great-room |
| Family Room | FR | Family Room | family-room |
| Formal Dining | DR | Dining Room | formal-dining |
| Kitchen | KIT | Kitchen | chef-kitchen |
| Chef's Kitchen | CHEF | — | catering-kitchen |
| Scullery | SCUL | Pantry | — |
| Wine | WINE | Wine Room | wine-cellar |
| Library | LIB | Library / Office | library |
| Media | MEDIA | Media Lounge | media-room |
| Gym | GYM | Fitness | gym |
| Spa | SPA | Spa (Sauna/Steam) | spa-wellness |
| Primary Bedroom | PRI | Primary Bedroom | primary-suite |
| Guest Suite | GSL1/GUEST1 | Guest Suite 1/2/3 | secondary-suites |

---

## Proposed Unified Zone Structure

### 7 Standard Zones (All Tiers)

| Zone ID | Zone Name | Description | MVP Mapping |
|---------|-----------|-------------|-------------|
| `Z1_ARRIVAL` | Arrival + Formal | Entry, formal entertaining, office | Arrival + Formal |
| `Z2_LIVING` | Living + Dining | Great room, formal dining, wine | Part of Arrival + Formal |
| `Z3_FAMILY` | Family + Kitchen | Daily hub, kitchen, breakfast, media | Family Hub |
| `Z4_PRIMARY` | Primary Suite | Master bedroom, bath, closets | Primary Wing |
| `Z5_GUEST` | Guest + Secondary | Guest suites, VIP suite | Hospitality |
| `Z6_WELLNESS` | Wellness | Gym, spa, pool support | Wellness |
| `Z7_SERVICE` | Service + BOH | Laundry, mudroom, mechanical, staff | Service Core |

### Optional Zones (15K+ or 20K+)

| Zone ID | Zone Name | Tier | Description |
|---------|-----------|------|-------------|
| `Z8_ENTERTAINMENT` | Entertainment | 15K+ | Game room, theater, billiards, bar |
| `Z9_KIDS` | Kids Zone | 20K+ | Playroom, bunk room, homework |
| `Z10_STAFF` | Staff Quarters | 20K+ | Staff suite, staff kitchen, lounge |

---

## Proposed Unified Space List (15K Baseline)

### Zone 1: Arrival + Formal
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| FOY | Foyer / Gallery | 350 | 315/350/385 |
| PWD | Powder Room | 80 | 72/80/88 |
| OFF | Private Office | 280 | 252/280/308 |
| COAT | Coat Closet | 60 | 54/60/66 |

### Zone 2: Living + Dining
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| GR | Great Room | 600 | 540/600/660 |
| DR | Formal Dining | 400 | 360/400/440 |
| WINE | Wine Storage | 150 | 135/150/165 |
| SAL | Salon (15K+) | 350 | 315/350/385 |

### Zone 3: Family + Kitchen
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| FR | Family Room | 650 | 585/650/715 |
| KIT | Kitchen (Show) | 450 | 405/450/495 |
| BKF | Breakfast Nook | 200 | 180/200/220 |
| SCUL | Scullery / Pantry | 220 | 198/220/242 |
| CHEF | Chef's Kitchen | 180 | 162/180/198 |
| LIB | Library | 250 | 225/250/275 |
| MEDIA | Media Room | 350 | 315/350/385 |
| BAR | Bar (15K+) | 150 | 135/150/165 |

### Zone 4: Primary Suite
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| PRI | Primary Bedroom | 550 | 495/550/605 |
| PRIBATH | Primary Bath | 350 | 315/350/385 |
| PRICL | Primary Closets | 300 | 270/300/330 |
| PRILOUNGE | Primary Lounge (15K+) | 200 | 180/200/220 |

### Zone 5: Guest + Secondary
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| GST1 | Guest Suite 1 | 450 | 405/450/495 |
| GST2 | Guest Suite 2 | 450 | 405/450/495 |
| GST3 | Guest Suite 3 | 450 | 405/450/495 |
| VIP | VIP Suite (15K+) | 600 | 540/600/660 |
| STAFF | Staff Suite | 350 | 315/350/385 |

### Zone 6: Wellness
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| GYM | Fitness / Gym | 350 | 315/350/385 |
| SPA | Spa (Sauna/Steam) | 200 | 180/200/220 |
| MASS | Massage Room | 150 | 135/150/165 |
| POOLSUP | Pool Support | 150 | 135/150/165 |

### Zone 7: Service + BOH
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| MUD | Mudroom | 200 | 180/200/220 |
| LAUN | Laundry | 180 | 162/180/198 |
| MEP | Mechanical / IT | 350 | 315/350/385 |
| STOR | Storage | 300 | 270/300/330 |
| CORE | Stair / Elevator | 350 | 315/350/385 |

### Zone 8: Entertainment (15K+)
| Code | Name | Base SF | S/M/L |
|------|------|---------|-------|
| GAME | Game Room | 500 | 450/500/550 |
| THTR | Theater | 450 | 405/450/495 |
| BILL | Billiards | 300 | 270/300/330 |
| MUSIC | Music Room | 250 | 225/250/275 |

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              KYC                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Captures:                                                     │   │
│  │ • targetSF (from budget)                                     │   │
│  │ • bedroomCount                                               │   │
│  │ • mustHaveSpaces[] (chip selections)                         │   │
│  │ • niceToHaveSpaces[] (chip selections)                       │   │
│  │ • lifestyle flags (staffing, pets, entertaining, etc.)       │   │
│  │ • Taste Exploration profile (6 axes + materials)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                 │
│                                    ▼                                 │
│                          KYC → FYI Bridge                           │
│                    (generateFYIDefaults())                          │
└─────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              FYI                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Receives:                                                     │   │
│  │ • Pre-populated spaces based on KYC selections               │   │
│  │ • Recommended sizes (S/M/L) based on targetSF                │   │
│  │                                                               │   │
│  │ User Actions:                                                 │   │
│  │ • Adjust S/M/L for each space                                │   │
│  │ • Add/remove spaces (override KYC)                           │   │
│  │ • View running totals + circulation                          │   │
│  │ • Attach inspiration images per space                        │   │
│  │                                                               │   │
│  │ Outputs:                                                      │   │
│  │ • FYIBrief: { spaces[], settings, totals }                   │   │
│  │ • PDF download for client                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                 │
│                                    ▼                                 │
│                          FYI → MVP Bridge                           │
│                    (generateMVPBriefInputs())                       │
└─────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              MVP                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Receives:                                                     │   │
│  │ • BriefSpace[] with locked SF values                         │   │
│  │ • Adjacency matrix (from preset or custom)                   │   │
│  │ • Bridge configurations                                      │   │
│  │                                                               │   │
│  │ Validates:                                                    │   │
│  │ • Red flags (5 critical violations)                          │   │
│  │ • Adjacency conflicts                                        │   │
│  │ • Zone separation requirements                               │   │
│  │                                                               │   │
│  │ Outputs:                                                      │   │
│  │ • Validation score (pass/fail gates)                         │   │
│  │ • Mermaid adjacency diagram                                  │   │
│  │ • Personalization recommendations                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              VMX                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Receives:                                                     │   │
│  │ • Validated program from MVP                                 │   │
│  │ • Target budget from KYC                                     │   │
│  │                                                               │   │
│  │ Calculates:                                                   │   │
│  │ • Cost per SF by zone                                        │   │
│  │ • Budget allocation heat map                                 │   │
│  │ • Value engineering opportunities                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Cloudinary Image Structure

### Current State
- Taste Exploration: `Taste-Exploration/{category}/{filename}`
- Floor Plans: `Floor Plans/{filename}` (spaces in name, no ID linkage)

### Proposed Structure
```
N4S/
├── taste-exploration/
│   ├── LS/              # Living Spaces
│   ├── DS/              # Dining Spaces
│   └── ...
├── space-renders/
│   ├── FOY_M.jpg        # Foyer - Medium
│   ├── KIT_M.jpg        # Kitchen - Medium
│   ├── PRI_M.jpg        # Primary Bedroom - Medium
│   └── ...
└── floor-plans/
    ├── FOY_plan.svg     # Foyer floor plan
    ├── KIT_plan.svg     # Kitchen floor plan
    └── ...
```

### Image URL Pattern
```javascript
const getSpaceImageUrl = (spaceCode, size = 'M') => {
  return `https://res.cloudinary.com/drhp5e0kl/image/upload/N4S/space-renders/${spaceCode}_${size}.jpg`;
};
```

---

## Questions for Michael

1. **Zone Count**: Are 7 standard + 3 optional zones the right granularity, or should we consolidate further?

2. **Space Codes**: Should we use 3-4 letter codes (FOY, KIT, PRI) or longer names? Codes are better for adjacency matrices but less readable.

3. **S/M/L Delta**: FYI uses ±10% from base. Should this be configurable per project, or is 10% the standard?

4. **Circulation Calculation**: MVP uses explicit circulation allowances. FYI calculates dynamically. Which approach for the unified system?

5. **Image Priority**: For FYI, which spaces need render images first? All 35+ or a priority subset?

---

## Next Steps

1. [ ] Michael reviews and approves zone/space structure
2. [ ] Create unified `program-schema.ts` shared across all modules
3. [ ] Build KYC → FYI bridge function
4. [ ] Migrate FYI Replit to N4S architecture
5. [ ] Build FYI → MVP bridge function
6. [ ] Update Cloudinary folder structure
7. [ ] Test end-to-end data flow
