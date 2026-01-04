# N4S Space Code Standardization Proposal

> **Purpose**: Establish unified room names, codes, zones, and naming conventions across all N4S modules
> **Date**: January 4, 2026
> **Status**: DRAFT - Awaiting Michael's Approval Before Implementation

---

## 1. Zone Structure (8 Standard Zones)

All modules (KYC, FYI, MVP, VMX) will use these 8 zones consistently:

| Zone ID | Zone Code | Zone Name | Order | Description |
|---------|-----------|-----------|-------|-------------|
| 1 | `Z1_APB` | Arrival + Public | 10 | Entry, formal entertaining, office |
| 2 | `Z2_FAM` | Family + Kitchen | 20 | Daily living hub, kitchen, breakfast |
| 3 | `Z3_ENT` | Entertainment | 30 | Game room, theater, bar, billiards |
| 4 | `Z4_WEL` | Wellness | 40 | Gym, spa, pool support |
| 5 | `Z5_PRI` | Primary Suite | 50 | Master bedroom, bath, closets |
| 6 | `Z6_GST` | Guest + Secondary | 60 | Guest suites, kids rooms, staff |
| 7 | `Z7_SVC` | Service + BOH | 70 | Laundry, mudroom, mechanical |
| 8 | `Z8_OUT` | Outdoor Spaces | 80 | Terrace, pool, outdoor kitchen |

**Note**: Zone order numbers (10, 20, 30...) allow for future insertion if needed.

---

## 2. Space Code Naming Convention

### 2.1 Code Structure

```
[ZONE_PREFIX][SPACE_ID]
```

- **Zone Prefix**: Single digit (1-8) or omitted for clarity
- **Space ID**: 2-4 uppercase letters, mnemonic

### 2.2 Code Rules

1. **Maximum 4 characters** for space codes (readability in adjacency matrices)
2. **No numbers in base codes** (numbers reserved for multiples: GST1, GST2)
3. **Unique across entire system** (no duplicate codes even across zones)
4. **Mnemonic preferred** (FOY = Foyer, not "F01")

---

## 3. Complete Space Registry

### Zone 1: Arrival + Public (Z1_APB)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `FOY` | Foyer / Gallery | Foyer | 1 | 350 | 420 | 500 | Includes coat closet allowance |
| `PWD` | Powder Room | Powder | 1 | 60 | 80 | 100 | Public restroom |
| `OFF` | Private Office | Office | 1 | 200 | 280 | 350 | Home office / study |
| `GRT` | Great Room | Great Room | 1 | 500 | 600 | 750 | Formal living / showcase |
| `DIN` | Formal Dining | Dining | 1 | 300 | 400 | 500 | Seats 10-14 |
| `WIN` | Wine Room | Wine | 1 | 100 | 150 | 200 | Climate controlled storage |
| `SAL` | Salon | Salon | 1 | — | 350 | 450 | Secondary formal sitting (15K+) |
| `LIB` | Library | Library | 1 | 200 | 280 | 350 | Can double as quiet office |

### Zone 2: Family + Kitchen (Z2_FAM)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `FAM` | Family Room | Family | 1 | 500 | 650 | 800 | Daily living hub |
| `KIT` | Kitchen (Show) | Kitchen | 1 | 350 | 450 | 550 | Island-centric, open |
| `BKF` | Breakfast Nook | Breakfast | 1 | 120 | 180 | 220 | Casual daily meals |
| `SCL` | Scullery / Pantry | Scullery | 1 | 180 | 250 | 320 | Prep, cleanup, storage |
| `CHF` | Chef's Kitchen | Chef's | 1 | 150 | 200 | 280 | Service kitchen for formal |
| `MDA` | Media Room | Media | 1 | 250 | 350 | 450 | Casual TV / movies |
| `NKF` | Nook / Flex | Nook | 1 | — | 150 | 200 | Homework, reading (15K+) |

### Zone 3: Entertainment (Z3_ENT)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `BAR` | Bar | Bar | 1 | — | 150 | 200 | Built-in bar (15K+) |
| `GAM` | Game Room | Game | 1 | — | 400 | 550 | Cards, games, lounge |
| `THR` | Theater | Theater | 1/B | — | 400 | 550 | Dedicated cinema (15K+) |
| `BIL` | Billiards | Billiards | 1/B | — | 280 | 350 | Pool table room |
| `MUS` | Music Room | Music | 1 | — | 250 | 300 | Piano, instruments |
| `ART` | Art Studio | Art | 1 | — | — | 300 | Creative workspace (20K+) |

### Zone 4: Wellness (Z4_WEL)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `GYM` | Fitness / Gym | Gym | 1 | 250 | 350 | 450 | Requires daylight |
| `SPA` | Spa Suite | Spa | 1 | 180 | 250 | 350 | Sauna, steam, shower |
| `MAS` | Massage Room | Massage | 1 | — | 150 | 180 | Treatment room (15K+) |
| `PLH` | Pool House | Pool House | 1 | — | — | 400 | Separate structure (20K+) |
| `PSP` | Pool Support | Pool Sup | 1 | 100 | 150 | 200 | Equipment, changing |

### Zone 5: Primary Suite (Z5_PRI)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `PBD` | Primary Bedroom | Primary Bed | 2 | 350 | 500 | 650 | Master bedroom |
| `PBT` | Primary Bath | Primary Bath | 2 | 250 | 350 | 450 | Double vanity, wet room |
| `PCL` | Primary Closets | Primary Closet | 2 | 200 | 300 | 400 | His/hers dressing |
| `PLG` | Primary Lounge | Primary Lounge | 2 | — | 200 | 280 | Sitting room (15K+) |
| `POF` | Primary Office | Primary Office | 2 | — | — | 200 | Private study (20K+) |

### Zone 6: Guest + Secondary (Z6_GST)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `GS1` | Guest Suite 1 | Guest 1 | 1 | 400 | 450 | 500 | Ground floor option |
| `GS2` | Guest Suite 2 | Guest 2 | 2 | 400 | 450 | 500 | — |
| `GS3` | Guest Suite 3 | Guest 3 | 2 | — | 450 | 500 | 15K+ |
| `GS4` | Guest Suite 4 | Guest 4 | 2 | — | — | 500 | 20K+ |
| `VIP` | VIP Suite | VIP | 2 | — | 600 | 700 | Enhanced guest (15K+) |
| `KD1` | Kids Bedroom 1 | Kids 1 | 2 | 350 | 400 | 450 | Children's room |
| `KD2` | Kids Bedroom 2 | Kids 2 | 2 | 350 | 400 | 450 | Children's room |
| `BNK` | Bunk Room | Bunk | 2 | — | 350 | 400 | Sleeps 4-6 (15K+) |
| `PLY` | Playroom | Playroom | 2 | — | 300 | 400 | Kids activity (15K+) |
| `HWK` | Homework Loft | Homework | 2 | — | — | 200 | Study area (20K+) |
| `NNY` | Nanny Suite | Nanny | 2 | — | 350 | 400 | Childcare staff (15K+) |
| `STF` | Staff Suite | Staff | 1/B | — | 350 | 400 | Live-in staff (15K+) |

### Zone 7: Service + BOH (Z7_SVC)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `MUD` | Mudroom | Mudroom | 1 | 150 | 200 | 280 | Daily entry, dog wash |
| `LND` | Laundry | Laundry | 1 | 140 | 180 | 250 | Primary laundry |
| `LN2` | Laundry 2 | Laundry 2 | 2 | — | 80 | 120 | Upper floor (15K+) |
| `MEP` | Mechanical | Mechanical | 1/B | 300 | 400 | 550 | HVAC, electrical, IT |
| `STR` | Storage | Storage | 1/B | 200 | 300 | 400 | General storage |
| `GAR` | Garage | Garage | 1 | 600 | 900 | 1200 | 3/4/6 car |
| `WRK` | Workshop | Workshop | 1/B | — | 150 | 250 | Hobby/tools (15K+) |
| `SKT` | Staff Kitchen | Staff Kitchen | 1 | — | — | 180 | Staff break (20K+) |
| `SLG` | Staff Lounge | Staff Lounge | 1 | — | — | 200 | Staff rest (20K+) |
| `COR` | Stair/Elevator | Core | 1-2 | 300 | 400 | 500 | Vertical circulation |

### Zone 8: Outdoor Spaces (Z8_OUT)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `TER` | Main Terrace | Terrace | 1 | 800 | 1200 | 1800 | Outdoor living |
| `POL` | Pool + Deck | Pool | 1 | 1500 | 2000 | 2800 | Lap pool + surround |
| `OKT` | Outdoor Kitchen | Out Kitchen | 1 | 150 | 250 | 350 | Summer kitchen |
| `FPT` | Fire Pit | Fire Pit | 1 | 200 | 300 | 400 | Gathering area |
| `ODN` | Outdoor Dining | Out Dining | 1 | 250 | 350 | 500 | Al fresco dining |
| `CTY` | Courtyard | Courtyard | 1 | — | 400 | 600 | Interior court (15K+) |
| `DRV` | Motor Court | Motor Court | 1 | 1000 | 1500 | 2000 | Arrival drive |

### Basement Spaces (Conditional - when hasBasement = true)

| Code | Full Name | Abbrev Display | Level | 10K SF | 15K SF | 20K SF | Notes |
|------|-----------|----------------|-------|--------|--------|--------|-------|
| `BWN` | Wine Cellar | Cellar | B | — | 300 | 500 | Climate controlled |
| `BTH` | Basement Theater | B Theater | B | — | 500 | 700 | Dedicated cinema |
| `BGA` | Basement Game | B Game | B | — | 500 | 700 | Recreation |
| `BGR` | Basement Gym | B Gym | B | — | 400 | 550 | Fitness |
| `BSP` | Basement Spa | B Spa | B | — | 350 | 500 | Wellness |
| `BST` | Basement Storage | B Storage | B | 400 | 600 | 800 | Bulk storage |
| `BME` | Basement Mech | B Mechanical | B | 400 | 600 | 800 | Systems |

---

## 4. Cloudinary Naming Convention

### 4.1 Folder Structure

```
N4S/
├── space-renders/
│   ├── {SPACE_CODE}_{SIZE}.jpg
│   └── Examples:
│       ├── KIT_S.jpg
│       ├── KIT_M.jpg
│       ├── KIT_L.jpg
│       ├── PBD_M.jpg
│       └── FAM_L.jpg
│
├── floor-plans/
│   ├── {SPACE_CODE}_plan.svg
│   └── Examples:
│       ├── KIT_plan.svg
│       ├── PBD_plan.svg
│       └── FAM_plan.svg
│
├── zone-covers/
│   ├── {ZONE_CODE}_cover.jpg
│   └── Examples:
│       ├── Z1_APB_cover.jpg
│       ├── Z2_FAM_cover.jpg
│       └── Z5_PRI_cover.jpg
│
└── taste-exploration/
    ├── LS/    # Living Spaces
    ├── DS/    # Dining Spaces
    ├── KT/    # Kitchens
    └── ...    # (existing structure)
```

### 4.2 File Naming Rules

| Type | Pattern | Example |
|------|---------|---------|
| Space Render (sized) | `{CODE}_{SIZE}.jpg` | `KIT_M.jpg` |
| Space Render (default) | `{CODE}.jpg` | `KIT.jpg` |
| Floor Plan | `{CODE}_plan.svg` | `KIT_plan.svg` |
| Zone Cover | `{ZONE}_cover.jpg` | `Z2_FAM_cover.jpg` |
| Multiple instances | `{CODE}{N}_{SIZE}.jpg` | `GS1_M.jpg`, `GS2_M.jpg` |

### 4.3 URL Pattern

```javascript
const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload';

const getSpaceRenderUrl = (code, size = 'M') => 
  `${CLOUDINARY_BASE}/N4S/space-renders/${code}_${size}.jpg`;

const getFloorPlanUrl = (code) => 
  `${CLOUDINARY_BASE}/N4S/floor-plans/${code}_plan.svg`;

const getZoneCoverUrl = (zoneCode) => 
  `${CLOUDINARY_BASE}/N4S/zone-covers/${zoneCode}_cover.jpg`;
```

---

## 5. Level Assignments

### 5.1 Standard Level Rules

| Level | Code | Description |
|-------|------|-------------|
| 1 | `L1` | Ground floor / Main level |
| 2 | `L2` | Upper floor |
| B | `LB` | Basement (conditional) |
| M | `LM` | Mezzanine (rare) |

### 5.2 Space-Level Defaults

Most spaces have a default level but can be overridden:

- **Always L1**: Foyer, Kitchen, Family, Mudroom, Garage
- **Always L2**: Primary Suite, Kids Rooms
- **Flexible**: Guest Suites (GS1 often L1 for accessibility)
- **Basement-eligible**: Theater, Game, Wine, Gym, Storage, Mechanical

---

## 6. Circulation Allocation

### 6.1 Circulation Percentage by Tier

| Tier | Target SF | Circulation % | Circulation SF |
|------|-----------|---------------|----------------|
| 10K | 10,000 | 12-15% | 1,200-1,500 |
| 15K | 15,000 | 13-16% | 1,950-2,400 |
| 20K | 20,000 | 14-18% | 2,800-3,600 |

### 6.2 Circulation Components

Circulation allocation includes:
- **Corridors**: Hallways, galleries, landings
- **Stair/Elevator Cores**: Vertical circulation (captured in `COR`)
- **Transition Zones**: Vestibules, airlocks, sound locks
- **Buffer Zones**: Acoustic separation (unless a dedicated room)

**MVP Bridges** come out of circulation unless they create a new programmed space.

---

## 7. Data Structure (TypeScript)

```typescript
// shared/space-registry.ts

export interface SpaceDefinition {
  code: string;           // e.g., "KIT"
  name: string;           // e.g., "Kitchen (Show)"
  abbrev: string;         // e.g., "Kitchen"
  zone: ZoneCode;         // e.g., "Z2_FAM"
  defaultLevel: Level;    // e.g., 1
  baseSF: {
    '10k': number | null;
    '15k': number | null;
    '20k': number | null;
  };
  basementEligible: boolean;
  tier: 'core' | '15k+' | '20k+';
  notes?: string;
}

export type ZoneCode = 
  | 'Z1_APB' | 'Z2_FAM' | 'Z3_ENT' | 'Z4_WEL'
  | 'Z5_PRI' | 'Z6_GST' | 'Z7_SVC' | 'Z8_OUT';

export type Level = 1 | 2 | 'B' | 'M';

export type SizeOption = 'S' | 'M' | 'L';

export interface SpaceSelection {
  code: string;
  size: SizeOption;
  level: Level;
  customSF?: number;      // Override calculated SF
  included: boolean;      // Is this space in the program?
  notes?: string;
}
```

---

## 8. Migration Plan

### 8.1 Files to Update

| Module | File | Changes Required |
|--------|------|------------------|
| **Shared** | `src/shared/space-registry.ts` | NEW - Master space definitions |
| **Shared** | `src/shared/zones.ts` | NEW - Zone definitions |
| **KYC** | `SpaceRequirementsSection.jsx` | Update chip options to use codes |
| **FYI** | `program.json` | Replace with dynamic from registry |
| **MVP** | `program-presets.ts` | Align codes with registry |
| **MVP** | Adjacency matrices | Update to 8 zones |

### 8.2 Backward Compatibility

- Existing KYC data uses string values like `'wine-cellar'`
- Need mapping function: `legacyToCode('wine-cellar') → 'WIN'`

---

## 9. Approved Decisions (January 4, 2026)

| Question | Decision |
|----------|----------|
| Code Length | **3-letter codes** (e.g., `CHF` not `CHEF`) |
| Guest Numbering | **GST1, GST2, GST3, GST4** |
| Kids Rooms | **KID1, KID2** |
| Outdoor SF | **Excluded from conditioned total** (tracked separately for budgeting) |
| Basement Levels | **L-1, L-2** (negative numbers: Level 1 = ground, Level -1 = basement) |
| Image Priority | **10 priority spaces**: FOY, GRT, DIN, FAM, KIT, PBD, PBT, GST1, GYM, TER |

---

## 10. Approval Checklist

- [x] 8-zone structure approved
- [x] Space code format approved (3-letter codes)
- [x] Space registry reviewed and approved
- [x] Cloudinary naming convention approved
- [x] Circulation % ranges approved
- [x] Basement handling approach approved (L-1, L-2)
- [x] Ready for implementation

---

## 11. Implementation Status

**Completed**:
- `src/shared/space-registry.ts` — Master registry created with all zones, spaces, and helper functions

**Next Steps**:
1. Build FYI module using new registry
2. Update MVP to import from shared registry
3. Update KYC chip options to use standardized codes
4. Migrate Cloudinary folder structure
