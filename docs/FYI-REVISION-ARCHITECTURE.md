# FYI Module Revision Architecture

> **Document Purpose**: Define the comprehensive restructure of the FYI module
> **Date**: January 6, 2026
> **Status**: Planning → Implementation

---

## 1. Strategic Position

**Module Flow**: `KYC → FYI → MVP → KYM → VMX`

**FYI Purpose**: Lifestyle Requirements Refinement
- Client confirms ALL spaces and amenities they want
- Assigns each space to a level (L2, L1, L-1, etc.)
- Tracks SF against budget in real-time
- Handles multiple structures (Main, Guest House, Pool House)
- Consolidates Principal + Secondary selections
- Outputs confirmed program to MVP for adjacency validation

**FYI Does NOT**:
- Validate adjacencies (that's MVP)
- Match architects/designers (removed)
- Set budgets (that's KYC/VMX)

---

## 2. Level Configuration

### 2.1 Naming Convention

| Level | Name | Description |
|-------|------|-------------|
| L3 | Level 3 | Two above Arrival |
| L2 | Level 2 | One above Arrival |
| **L1** | **Level 1 (Arrival Level)** | Main entrance / arrival |
| L-1 | Level -1 | One below Arrival |
| L-2 | Level -2 | Two below Arrival |
| L-3 | Level -3 | Three below Arrival |

**Rules**:
- L1 is ALWAYS the Arrival Level
- No "Ground Floor", "Entry Level", or "Basement" terminology
- No zero level — goes from L1 directly to L-1
- "Below Arrival" does NOT mean underground

### 2.2 KYC Inputs (from P1.A.3 Project Parameters)

| Field | Type | Description |
|-------|------|-------------|
| `totalLevels` | number | Total levels in main house |
| `levelsAboveArrival` | number | How many levels above L1 |
| `levelsBelowArrival` | number | How many levels below L1 |

**Example**: 4-level hillside home
- `totalLevels`: 4
- `levelsAboveArrival`: 1 (L2)
- `levelsBelowArrival`: 2 (L-1, L-2)
- Results in: L2, L1, L-1, L-2

---

## 3. Structure Types

### 3.1 Main Residence
The primary home with all living spaces. Always present.

### 3.2 Guest House (Optional)
Adjacent structure for guest accommodation.

**KYC Trigger**: `hasGuestHouse: true`

**Spaces**:
| Space | Code | Required/Optional |
|-------|------|-------------------|
| Guest Suite(s) | GH_GST1, GH_GST2... | Required (count from KYC) |
| Guest Bath(s) | GH_BATH | Auto (en-suite assumed) |
| Powder Room | GH_PWD | Auto (1 assumed) |
| Family/Living Area | GH_LIV | Optional |
| Kitchen | GH_KIT | Optional |
| Dining | GH_DIN | Optional |

### 3.3 Pool House / Wellness Pavilion (Optional)
Adjacent structure for wellness and recreation.

**KYC Trigger**: `hasPoolHouse: true` or `wellnessLocation: 'separate'`

**Spaces**:
| Space | Code | Required/Optional |
|-------|------|-------------------|
| Showers | PH_SHW | Required |
| Changing Room | PH_CHG | Required |
| Bathroom | PH_BATH | Required |
| Entertainment/Gaming | PH_ENT | Optional |
| Kitchen/Bar | PH_KIT | Optional |
| Dining | PH_DIN | Optional |

---

## 4. Bedroom & Closet Configuration

### 4.1 Bedroom Types

| Type | Code | Description |
|------|------|-------------|
| Primary Bedroom Suite | PRI | Master suite |
| Jr. Primary Suite | JRPRI | First/best guest (VIP) |
| Guest Suite 1, 2, 3... | GST1, GST2... | Standard guest suites |
| Kid's Bunk Room | BNK | Fun kids space |

### 4.2 Closet Configuration

| Suite Type | Closet Code | Configuration |
|------------|-------------|---------------|
| Primary Bedroom Suite | PRICL_HIS, PRICL_HER | His + Hers separate walk-ins |
| Jr. Primary Suite | JRPRICL | Single large walk-in |
| Guest Suite (Ultra-luxury) | GSTn_WIC | Walk-in closet |
| Guest Suite (Luxury) | GSTn_CL | Standard closets |

**KYC Input**: `guestSuiteClosetType: 'walk-in' | 'standard'`

### 4.3 Space Registry Updates Needed

```javascript
// Primary Suite - split closets
{ code: 'PRICL_HIS', name: 'His Walk-in Closet', zone: 'Z5_PRI', baseSF: {...} }
{ code: 'PRICL_HER', name: 'Her Walk-in Closet', zone: 'Z5_PRI', baseSF: {...} }

// Jr. Primary Suite (rename from VIP)
{ code: 'JRPRI', name: 'Jr. Primary Bedroom', zone: 'Z6_GST', baseSF: {...} }
{ code: 'JRPRIBATH', name: 'Jr. Primary Bath', zone: 'Z6_GST', baseSF: {...} }
{ code: 'JRPRICL', name: 'Jr. Primary Walk-in', zone: 'Z6_GST', baseSF: {...} }

// Guest Suites with closet variants
{ code: 'GST1_WIC', name: 'Guest 1 Walk-in', zone: 'Z6_GST', baseSF: {...} }
{ code: 'GST1_CL', name: 'Guest 1 Closets', zone: 'Z6_GST', baseSF: {...} }
```

---

## 5. FYI User Interface

### 5.1 Overall Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER: FYI - Find Your Inspiration                                     │
│ Project: [Name] | Target SF: 15,000 | Current: 14,850 | Delta: -150    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌────────────────────────────────┐  ┌─────────────┐ │
│  │              │  │                                │  │             │ │
│  │    LEVEL     │  │         SPACE CARDS            │  │   TOTALS    │ │
│  │   DIAGRAM    │  │                                │  │    PANEL    │ │
│  │              │  │  [Zone tabs across top]        │  │             │ │
│  │   L2  ████   │  │                                │  │ By Level:   │ │
│  │   L1  ████   │  │  ┌─────┐ ┌─────┐ ┌─────┐      │  │  L2: 4,000  │ │
│  │   L-1 ████   │  │  │Space│ │Space│ │Space│      │  │  L1: 8,000  │ │
│  │   L-2 ████   │  │  │Card │ │Card │ │Card │      │  │  L-1: 2,850 │ │
│  │              │  │  └─────┘ └─────┘ └─────┘      │  │             │ │
│  │ [Structure]  │  │                                │  │ Circ: 2,100 │ │
│  │ ○ Main       │  │  ┌─────┐ ┌─────┐              │  │             │ │
│  │ ○ Guest Hse  │  │  │Space│ │Space│              │  │ Total:      │ │
│  │ ○ Pool Hse   │  │  │Card │ │Card │              │  │   14,850    │ │
│  │              │  │  └─────┘ └─────┘              │  │             │ │
│  └──────────────┘  └────────────────────────────────┘  └─────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ FOOTER: [Export PDF] [Proceed to MVP]                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Level Diagram (Left Panel)

Visual representation showing:
- All available levels based on KYC configuration
- SF allocated per level (bar fill)
- Click to filter space cards by level
- Structure selector (Main / Guest House / Pool House)

```
┌─────────────────────────┐
│ MAIN RESIDENCE          │
├─────────────────────────┤
│                         │
│  L2   ████████░░  4,000 │  ← Primary Suite
│       ──────────────────│
│  L1   ████████████ 8,000│  ← Arrival (Living)
│       ──────────────────│
│  L-1  ██████░░░░  2,850 │  ← Wellness
│                         │
│  Total: 14,850 SF       │
│                         │
├─────────────────────────┤
│ [●] Main Residence      │
│ [ ] Guest House         │
│ [ ] Pool House          │
└─────────────────────────┘
```

### 5.3 Space Card (Enhanced)

Each space card shows:
- Space image (Cloudinary)
- Space name
- Include/Exclude toggle
- S/M/L size selector with SF
- **Level assignment dropdown** (prominent)
- Notes field

```
┌────────────────────────────────┐
│ [IMAGE]                        │
│                                │
│ Primary Bedroom    [● Include] │
│                                │
│  S: 450   [M: 500]   L: 550   │
│                                │
│  Level: [ L2        ▾]        │  ← Prominent level selector
│                                │
│  500 SF                        │
│  [More Options ▾]              │
└────────────────────────────────┘
```

### 5.4 Zone Navigation

Horizontal tabs across space cards area:

```
[Arrival + Public] [Family + Kitchen] [Entertainment] [Wellness] 
[Primary Suite] [Guest + Secondary] [Service + BOH] [Outdoor]
```

When Guest House or Pool House selected in structure picker, zones change to:

**Guest House Zones**:
```
[Guest Suites] [Living] [Kitchen + Dining]
```

**Pool House Zones**:
```
[Changing + Bath] [Entertainment] [Kitchen + Dining]
```

### 5.5 Totals Panel (Right)

```
┌─────────────────────────┐
│ PROGRAM SUMMARY         │
├─────────────────────────┤
│                         │
│ Main Residence          │
│ ────────────────────    │
│ Net Program:  12,750 SF │
│ Circulation:   2,100 SF │
│ Total:        14,850 SF │
│                         │
│ By Level:               │
│   L2:   4,000 SF  27%   │
│   L1:   8,000 SF  54%   │
│   L-1:  2,850 SF  19%   │
│                         │
├─────────────────────────┤
│ Guest House             │
│ ────────────────────    │
│ Total:         1,200 SF │
│                         │
├─────────────────────────┤
│ Pool House              │
│ ────────────────────    │
│ Total:           800 SF │
│                         │
├─────────────────────────┤
│ ALL STRUCTURES          │
│ ════════════════════    │
│ Grand Total:  16,850 SF │
│ Target:       15,000 SF │
│ Delta:        +1,850 SF │
│ [██████████░░░] 112%    │
│                         │
├─────────────────────────┤
│                         │
│ [📄 Export PDF]         │
│ [→ Proceed to MVP]      │
│                         │
└─────────────────────────┘
```

---

## 6. Data Flow

### 6.1 KYC → FYI Bridge

**Inputs from KYC**:
```javascript
{
  // From P1.A.3 Project Parameters
  targetGSF: 15000,
  totalLevels: 4,
  levelsAboveArrival: 1,
  levelsBelowArrival: 2,
  bedroomCount: 5,
  bathroomCount: 7,
  hasGuestHouse: true,
  guestHouseBedrooms: 2,
  guestHouseKitchen: true,
  guestHouseLiving: true,
  hasPoolHouse: true,
  poolHouseEntertainment: true,
  guestSuiteClosetType: 'walk-in',
  
  // From P1.A.7 Space Requirements (Principal)
  mustHaveSpaces: ['wine-cellar', 'gym', 'media-room'],
  niceToHaveSpaces: ['art-gallery', 'music-room'],
  
  // From P1.A.7 Space Requirements (Secondary - ADDITIVE)
  secondaryMustHave: ['home-office', 'art-studio'],
  secondaryNiceToHave: ['yoga-room'],
}
```

**FYI Initialization**:
1. Build level picker from `levelsAboveArrival` + `levelsBelowArrival`
2. Determine program tier from `targetGSF`
3. Pre-include spaces from `mustHaveSpaces` (Principal + Secondary merged)
4. Mark `niceToHaveSpaces` for easy access
5. Configure closets based on `guestSuiteClosetType`
6. Create Guest House section if `hasGuestHouse`
7. Create Pool House section if `hasPoolHouse`

### 6.2 FYI → MVP Bridge

**Output to MVP**:
```javascript
{
  programTier: '15k',
  targetSF: 15000,
  confirmedTotalSF: 16850,
  
  structures: {
    main: {
      totalSF: 14850,
      levels: {
        'L2': { sf: 4000, spaces: ['PRI', 'PRICL_HIS', 'PRICL_HER', 'PRIBATH', ...] },
        'L1': { sf: 8000, spaces: ['FOY', 'GR', 'DR', 'KIT', 'FR', ...] },
        'L-1': { sf: 2850, spaces: ['GYM', 'SPA', 'MEDIA', ...] }
      }
    },
    guestHouse: {
      totalSF: 1200,
      spaces: ['GH_GST1', 'GH_GST2', 'GH_LIV', 'GH_KIT', ...]
    },
    poolHouse: {
      totalSF: 800,
      spaces: ['PH_SHW', 'PH_CHG', 'PH_BATH', 'PH_ENT', ...]
    }
  },
  
  spaces: [
    { code: 'PRI', name: 'Primary Bedroom', level: 'L2', sf: 500, size: 'M' },
    { code: 'FOY', name: 'Foyer / Gallery', level: 'L1', sf: 420, size: 'M' },
    // ...all confirmed spaces
  ],
  
  closetType: 'walk-in',  // For guest suites
  
  completedAt: '2026-01-06T...'
}
```

MVP uses this to:
- Validate adjacencies within each level
- Check cross-level relationships
- Apply 5 red flags and 5 bridges rules

---

## 7. Report Structure

### FYI Phase Report (PDF)

**Page 1: Program Overview**
- Project name, client name, date
- Total SF summary (Main + Guest House + Pool House)
- Level distribution diagram
- Target vs. Confirmed variance

**Page 2-3: Main Residence Program**
- Spaces organized by Zone
- Each space: Name, Level, Size, SF
- Zone subtotals
- Circulation allowance

**Page 4: Guest House Program** (if applicable)
- All guest house spaces
- Total SF

**Page 5: Pool House Program** (if applicable)
- All pool house spaces
- Total SF

**Page 6: Level Distribution**
- Visual diagram per level
- List of spaces per level
- SF per level

**Footer**: © 2026 N4S Luxury Residential Advisory

---

## 8. Implementation Plan

### Phase 1: Space Registry Updates
- [ ] Rename VIP → Jr. Primary Suite
- [ ] Split Primary Closets → His + Hers
- [ ] Add closet variants for Guest Suites
- [ ] Add Guest House space codes
- [ ] Add Pool House space codes

### Phase 2: FYI State Management
- [ ] Update useFYIState hook for multi-structure
- [ ] Add level configuration from KYC
- [ ] Add structure selection state
- [ ] Update totals calculation for per-level

### Phase 3: UI Components
- [ ] Create LevelDiagram component
- [ ] Update FYISpaceCard with prominent level selector
- [ ] Create StructureSelector component
- [ ] Update FYITotalsPanel for multi-structure
- [ ] Update zone navigation for structure context

### Phase 4: Bridges
- [ ] Update generateFYIFromKYC for new fields
- [ ] Update generateMVPFromFYI for multi-structure output
- [ ] Consolidate Principal + Secondary selections

### Phase 5: Report Generation
- [ ] Create FYI PDF report template
- [ ] Include multi-structure sections
- [ ] Add level distribution visualization

---

## 9. KYC Changes Required (Tracked Separately)

See KYC-REVISION-TRACKER.md for full list:
1. Level Configuration fields
2. Guest House section
3. Pool House section
4. Guest Suite closet type
5. Bedroom naming alignment
6. Staff accommodation clarity
7. Visual level diagram

---

*This document should be referenced during FYI implementation.*
