# KYC Revision Tracker

> **Document Purpose**: Track all KYC changes identified during FYI module revision
> **Date**: January 6, 2026
> **Status**: Pending (implement after FYI complete)

---

## Summary

These changes are required to support the revised FYI module with proper level configuration, multiple structures, and bedroom/closet standards.

---

## P1.A.3 Project Parameters

### 1. Level Configuration (Replace existing floors/basement)

**Remove**:
- `floors` (number)
- `hasBasement` (boolean)

**Add**:
```javascript
// Level configuration
totalLevels: null,           // Total levels in main house (1-6)
levelsAboveArrival: null,    // Levels above L1 (0-3)
levelsBelowArrival: null,    // Levels below L1 (0-3)
```

**UI**: Replace current "Floors / Levels" number input with visual level configurator showing L2, L1, L-1 etc.

**Validation**:
- `totalLevels` = `levelsAboveArrival` + 1 + `levelsBelowArrival`
- Minimum 1 level (just L1)
- Maximum 6 levels typical for ultra-luxury

---

### 2. Guest House Section (New)

**Add**:
```javascript
// Guest House
hasGuestHouse: false,
guestHouseBedrooms: null,      // Number of guest bedrooms
guestHouseHasLiving: false,    // Family/living area
guestHouseHasKitchen: false,   // Full kitchen
guestHouseHasDining: false,    // Dining room/area
// Powder room and en-suite baths assumed
```

**UI**: 
```
Do you anticipate an adjacent guest house? [Yes] [No]

If Yes:
- Number of bedrooms: [ 2 ]
- Include family/living area? [●] Yes [ ] No
- Include kitchen? [●] Yes [ ] No  
- Include dining? [●] Yes [ ] No

ℹ️ Powder room and en-suite bathrooms are assumed.
```

---

### 3. Pool House / Wellness Pavilion (New)

**Add**:
```javascript
// Pool House / Wellness Pavilion
hasPoolHouse: false,
poolHouseLocation: '',         // 'poolside' | 'garden' | 'viewpoint'
poolHouseHasEntertainment: false,  // Entertainment/gaming area
poolHouseHasKitchen: false,    // Kitchen/bar
poolHouseHasDining: false,     // Dining area
// Showers, changing room, bathroom assumed
```

**UI**:
```
Will wellness/spa/fitness be within the main residence or in an adjacent structure?

[ ] Within main residence
[●] Separate pool house / wellness pavilion

If Separate:
- Location: [ Poolside ▾]
- Include entertainment/gaming area? [ ] Yes [●] No
- Include kitchen/bar? [●] Yes [ ] No
- Include dining? [ ] Yes [●] No

ℹ️ Showers, changing room, and bathroom are assumed.
```

---

### 4. Visual Level Diagram (New)

**Add**: Interactive visual component in Project Scope section

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  How many levels above the Arrival Level (L1)?             │
│  [ 0 ]  [ 1 ]  [●2 ]  [ 3 ]                               │
│                                                            │
│  How many levels below the Arrival Level (L1)?             │
│  [ 0 ]  [●1 ]  [ 2 ]  [ 3 ]                               │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │         ┌───────────┐  L3                            │ │
│  │         │           │                                │ │
│  │         ├───────────┤  L2                            │ │
│  │         │           │                                │ │
│  │    ───► │  ARRIVAL  │  L1  ◄─── Main Entry          │ │
│  │         │           │                                │ │
│  │         ├───────────┤  L-1                           │ │
│  │         │           │                                │ │
│  │         └───────────┘                                │ │
│  │                                                       │ │
│  │         4 levels total                                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## P1.A.2 Family & Household

### 5. Staff Accommodation Clarity

**Current**: `staffingLevel`, `liveInStaff`, `staffAccommodationRequired`

**Clarification needed**: Ensure when `staffingLevel === 'live_in'` OR `staffAccommodationRequired === true`:
- Staff Suite is auto-included in FYI
- Staff Bathroom is auto-included
- Staff Lounge/Communal area is offered (15k+ tier)

**No separate building** — Staff quarters always within main residence.

---

## P1.A.7 Space Requirements

### 6. Bedroom Naming Alignment

**Update chip selections to match**:

| Current | Updated |
|---------|---------|
| "primary-suite" | "Primary Bedroom Suite" |
| (none) | "Jr. Primary Suite" |
| "secondary-suites" | "Guest Suite" |
| (none) | "Kid's Bunk Room" |

**Note**: Count of Guest Suites comes from `bedroomCount` minus Primary minus Jr. Primary minus Kids rooms.

---

### 7. Guest Suite Closet Type (New)

**Add**:
```javascript
guestSuiteClosetType: '',  // 'walk-in' | 'standard'
```

**UI**:
```
For guest suites, which closet configuration do you prefer?

[●] Walk-in closets (Ultra-luxury standard)
[ ] Standard built-in closets (Luxury standard)

ℹ️ Primary Suite always includes His + Hers walk-in closets.
   Jr. Primary Suite always includes a single large walk-in.
```

---

## P1.A.4 Budget Framework

### 8. Interior Quality Tier Alignment (Existing - Confirm)

Ensure `interiorQualityTier` options are:
- `select` — Select
- `reserve` — Reserve
- `signature` — Signature
- `legacy` — Legacy

This tier can influence the closet type default in FYI:
- Signature/Legacy → default to walk-in closets
- Select/Reserve → default to standard closets (can override)

---

## Implementation Priority

| # | Change | Priority | Dependencies |
|---|--------|----------|--------------|
| 1 | Level Configuration | HIGH | FYI level picker |
| 2 | Guest House Section | HIGH | FYI multi-structure |
| 3 | Pool House Section | HIGH | FYI multi-structure |
| 4 | Visual Level Diagram | MEDIUM | Level Configuration |
| 5 | Staff Accommodation | MEDIUM | Space registry |
| 6 | Bedroom Naming | MEDIUM | Space registry |
| 7 | Closet Type | MEDIUM | Space registry |
| 8 | Quality Tier | LOW | Existing field |

---

## Data Migration Notes

For existing projects:
- `floors` → Calculate `totalLevels`, `levelsAboveArrival`, `levelsBelowArrival`
- `hasBasement: true` → `levelsBelowArrival: 1` (default single level below)
- Default `guestSuiteClosetType` based on `interiorQualityTier`

---

*Implement these changes after FYI module revision is complete.*
