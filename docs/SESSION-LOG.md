# N4S Session Log

## Session: February 19, 2026 - GID Phase 3: Discovery Screen Implementation

### Changes Made

**Backend — Database**
- `api/gid-setup.php` — Added `gid_discovery_candidates` table (Table 6) with full schema: discipline, firm info, source tracking, review workflow, import tracking, 7 indexes

**Backend — API Endpoints**
- `api/gid.php` — Added `entity=discovery` with 7 endpoints:
  - GET list/single candidates with filters (status, discipline, source_tier, state)
  - GET queue_stats (counts by status)
  - POST create candidate (with duplicate detection against both discovery table and registry)
  - POST review candidate (approve/dismiss with notes)
  - POST import candidate (full field mapping to gid_consultants + gid_sources creation)
  - POST batch_review (approve/dismiss multiple)
- `api/gid-discovery-ai.php` — NEW file. Server-side AI discovery endpoint using Claude Sonnet via Anthropic API. Builds structured prompt from criteria, calls API, parses JSON response, inserts candidates with duplicate detection, returns results.

**Frontend — New Components**
- `src/components/GID/screens/GIDDiscoveryScreen.jsx` — Main Discovery screen with 3 sub-modes:
  - Manual Search — Quick firm lookup + redirect to AddConsultantForm
  - AI Discovery — Criteria form + results display with approve/dismiss/import actions
  - Import Queue — Filterable candidate list with batch operations
- `src/components/GID/components/CandidateCard.jsx` — Discovery candidate card with source tier badge (T1-T5 color-coded), confidence bar, expandable notable projects/awards, status indicators, action buttons
- `src/components/GID/components/AIDiscoveryForm.jsx` — AI search criteria form: 4-discipline selector, US state multi-picker, 4 budget tiers, style keyword tagging with suggestions, result count selector, recent search history

**Frontend — Modified**
- `src/components/GID/GIDModule.jsx` — Enabled Discovery tab (removed disabled state), added queue badge counter, wired GIDDiscoveryScreen with onImportComplete and onQuickAdd callbacks
- `src/components/GID/GIDModule.css` — Added ~925 lines of Discovery CSS: candidate cards, source tier badges, confidence bars, AI form layout, state picker, batch actions bar, queue filters, responsive breakpoints

### Build Status
- ✅ `CI=false npm run build` passes cleanly

### Deployment Notes
- New PHP file `api/gid-discovery-ai.php` needs `ANTHROPIC_API_KEY` environment variable set on server
- New DB table: hit `api/gid-setup.php` endpoint to create `gid_discovery_candidates` table
- Standard push → GitHub Actions auto-deploy

---

## Session: February 7, 2026 - MVP ITR Batch Implementation

### User Request
Collect and implement a batch of MVP refinement items (Items to Resolve). User wanted all issues identified first, then implemented in a single batch rather than iteratively.

### Implementation — 7 ITR Items + Follow-up Tweaks

#### ITR #1 — Tier Badge Enhancement (MVPModule.jsx)
- Added "Benchmark Tier" label above tier display
- Made badge clickable → opens dropdown panel with all 4 tiers (5K/10K/15K/20K)
- Active tier highlighted, click outside to close

#### ITR #2 — Header Cleanup (MVPModule.jsx)
- Removed LIVE spinner indicator
- Moved Save button right, adjacent to Tier badge
- Matches layout pattern of other modules

#### ITR #3 — FYI Space Program Collapsible (MVPModule.jsx)
- Converted to collapsible roll-up panel, collapsed by default
- Shows summary line: total SF, bedrooms, structure count
- Expanded shows full breakdown with structures, grand total, zones

#### ITR #4 — Module Library Review Workflow (ModuleLibraryView.jsx, AppContext.jsx)
- Added "Review Complete" button per module card
- Tracks completion in fyiData.mvpModuleReviewStatus
- Feeds Gate C logic: all 8 reviewed = Gate C complete
- Overview shows "X of 8 Modules Reviewed" with progress bar

#### ITR #5 — Documentation Split-Screen (MVPModule.jsx, MVPDocumentation.jsx)
- BUG FIX: Docs were opening on main page regardless of current screen
- SOLUTION: Slide-in right panel (~40% width), main content compresses left
- Context-aware: auto-selects relevant docs tab based on active screen

#### ITR #6 — Remove Debug Button (MVPModule.jsx)
- Removed "Show Raw Data" toggle from overview

#### ITR #7 — Relocate Workflow Buttons (MVPModule.jsx)
- Moved from bottom of page to directly below Deployment Workflow
- Renamed from "MVP P1-M Workflow" to "MVP Workflow"

### Follow-up Tweaks (same session)

1. **Checklist progress removed** — "X of 40 checklist items" bar removed from Module Library (review tracker sufficient)
2. **Reviewed badge positioning** — Moved from cramped header meta to centered row below header using flex column + margin-top:auto for consistent placement
3. **Abbreviation index on Relationship Diagram** — Compact legend below mermaid diagram showing codes used (PersonalizationResult.tsx, AdjacencyPersonalization.css)
4. **MVP Workflow checkmarks** — Each button shows green ✓ when corresponding gate is complete
5. **Answer Layout Questions button** — Changed from primary (navy) to secondary to match all other buttons
6. **Gate D detection fix** — Now checks `questionnaireCompletedAt` timestamp, not just `decisionCount >= 10`
7. **Abbreviation index on Adjacency Matrix** — Same legend pattern added to AdjacencyComparisonGrid.jsx using presetData.spaces for name lookup

### Files Changed
- `src/components/MVP/MVPModule.jsx` — Major restructure (header, gates, workflow, docs layout)
- `src/components/MVP/ModuleLibraryView.jsx` — Review complete buttons, badge positioning
- `src/components/MVP/MVPDocumentation.jsx` — onClose prop for split-screen
- `src/components/MVP/AdjacencyComparisonGrid.jsx` — Abbreviation legend
- `src/mansion-program/client/components/PersonalizationResult.tsx` — Diagram abbreviation legend
- `src/mansion-program/client/components/AdjacencyPersonalization.css` — Legend CSS
- `src/contexts/AppContext.jsx` — updateMVPModuleReviewStatus function
- `src/styles/index.css` — Tier dropdown, collapsible, workflow, reviewed badge CSS

### Commits
- `8d72239` — MVP ITR batch: 7 items implemented
- `b8ce2b7` — Module Library tweaks: remove checklist progress, fix Reviewed badge overlap
- `517cacd` — Three UI tweaks: reviewed badge fix, diagram legend, workflow checkmarks
- `56b5861` — Fix workflow buttons: uniform styling + Gate D completion detection
- `773450f` — Add abbreviation index to adjacency comparison grid

### Next Task: Relationship Diagram Enhancement
**STATUS: READY TO START IN NEW CHAT**

The Relationship Diagram (Mermaid.js flowchart in PersonalizationResult.tsx) needs to become a first-class visual tool in MVP:

1. **Relocate** — Currently appears at bottom of Layout Questions results screen. Should move to the Adjacency Validation Matrix screen where it serves as a companion visualization.

2. **Dual-mode visualization** — Show both Desired (benchmark) and Proposed (after decisions) diagrams side by side or with toggle, mirroring the matrix toggle.

3. **Deviation highlighting** — When viewing Proposed, highlight edges that deviate from Desired (different line style, color, or annotation). Makes spatial conflicts immediately visible.

4. **Improved layout** — Current Mermaid flowchart is a simple linear layout with disconnected clusters. Needs proper spatial grouping by zone with meaningful node positioning.

5. **Integration with validation** — Red flags from validation could be overlaid on the diagram (highlight conflicting adjacencies in red).

Key files:
- `src/mansion-program/client/components/PersonalizationResult.tsx` (current diagram)
- `src/mansion-program/client/utils/mermaid-generator.ts` (code generation)
- `src/components/MVP/AdjacencyComparisonGrid.jsx` (target location)
- `src/components/MVP/ValidationResultsPanel.jsx` (red flags data)
- `src/mansion-program/client/data/program-presets.ts` (space definitions)
- `src/mansion-program/shared/adjacency-decisions.ts` (decision definitions)

---


### User Request
Complete KYM/BAM v3.0 implementation - finish report generation and add missing features.

### Issue Identified
The BAM v3.0 dual scoring system was implemented but missing:
1. **Gap Analysis aggregation** - `bamResults.gapAnalysis` referenced in report but not computed
2. **Recommendations path mismatch** - Report expected `archetype.recommendations` but data was at `archetype.score.pathTo80.recommendations`
3. **Trade-off Analysis** - No analysis of client vs market tensions

### Implementation

#### 1. BAMScoring.js - Enhanced calculateBAMScores

**Added to archetype results:**
```javascript
// Expose recommendations at archetype level for easier report access
recommendations: score.pathTo80?.recommendations || [],
```

**Added Gap Analysis aggregation (new function `aggregateGapAnalysis`):**
- Collects recommendations from top 3 archetypes
- Categorizes into: Quick Wins, Strategic Enhancements, Risk Mitigation
- Quick Wins: Easy difficulty or Nice to Have features
- Strategic: Must Have features requiring significant investment
- Risk Mitigation: Avoids and risky features to address
- Calculates projected score if all recommendations implemented

**Added Trade-off Analysis (new function `analyzeTradeOffs`):**
- Identifies tensions between client preferences and market appeal
- Highlights strong alignments (Essential features included)
- Flags style mismatches from triggered avoids
- Generates summary statement for report

**Return structure now includes:**
```javascript
return {
  clientSatisfaction,
  marketAppeal,
  combined,
  portfolioContext,
  featureClassification,
  gapAnalysis,        // NEW
  tradeOffAnalysis,   // NEW
};
```

#### 2. KYMReportGenerator.js - Trade-off Analysis Section

**Added new section after Feature Classification:**
- "Client vs Market Trade-offs" heading
- Summary statement (italic)
- AREAS OF TENSION list (warning color)
- STRONG ALIGNMENTS list (success color)

### Data Flow

```
calculateBAMScores()
    ↓
archetypeScores.map() → adds recommendations at top level
    ↓
aggregateGapAnalysis() → collects and categorizes across archetypes
    ↓
analyzeTradeOffs() → identifies client vs market tensions
    ↓
bamResults = { ..., gapAnalysis, tradeOffAnalysis }
    ↓
KYMReportGenerator receives complete data structure
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/KYM/BAMScoring.js` | Added gapAnalysis, tradeOffAnalysis, exposed recommendations |
| `src/components/KYM/KYMReportGenerator.js` | Added Trade-off Analysis section |
| `docs/SESSION-LOG.md` | This entry |

### Testing Checklist

- [x] Build passes (CI=false npm run build)
- [x] BAM scores still compute correctly
- [x] Gap Analysis generates Quick Wins, Strategic, Risk Mitigation
- [x] Archetype recommendations accessible at `archetype.recommendations`
- [x] Trade-off Analysis generates tensions and alignments
- [x] Report generator can access all new data fields

### Build Status
✅ Build successful - all files compile correctly

---

## Session: January 11, 2026 - Program Summary + MVP Cleanup

### User Request
Add read-only view of imported program (spaces, zones, areas) within MVP.
Remove Briefing Builder since all space editing should happen in FYI.

### Implementation

#### 1. ProgramSummaryView - NEW COMPONENT

**Features:**
- Read-only display of mansion program from FYI
- Zone cards with icons and colors
- Space rows: code, name, level, SF
- Summary stats: total spaces, SF, levels, zones
- Target vs Actual variance display
- Level distribution with progress bars
- "Edit in FYI" link

**Zone Configuration:**
| Zone | Icon | Color |
|------|------|-------|
| Arrival/Zone 1 | Home | Navy |
| Living/Zone 2 | Users | Green |
| Primary/Zone 5 | Home | Purple |
| Guest/Zone 6 | Users | Blue |
| Wellness/Zone 4 | Dumbbell | Teal |
| Service/Zone 7 | Briefcase | Brown |
| Garage/Zone 8 | Car | Gray |
| Outdoor | Home | Green |

#### 2. Removed from MVP

- **Briefing Builder** button removed from navigation
- Manual space editing not available in MVP
- All space/size changes must be made in FYI module

#### 3. Updated MVP Navigation

```
1. Module Library (secondary)
2. Answer Layout Questions (PRIMARY)
3. View Adjacency Matrix (secondary)
4. Run Validation (secondary)
5. Program Summary (secondary) ← NEW
6. Tier Data Admin (ghost)
```

### Files Changed
- `src/components/MVP/ProgramSummaryView.jsx` - NEW
- `src/components/MVP/MVPModule.jsx` - Updated navigation
- `docs/MVP-NAVIGATION.md` - Updated structure

---

## Session: January 11, 2026 - Data Flow & Navigation Fixes

### Issues Identified (from client review)
1. **Bridges all showing "Present"** - Not derived from user's actual decisions
2. **Red Flags were mocked** - Not computed from adjacency matrix
3. **No warning when no decisions** - User needs to know to complete Layout Questions
4. **Navigation inconsistent** - Back buttons had different text/behavior

### Root Cause Analysis

**Bridge Issue:**
- 15K preset has `bridgeConfig: { butlerPantry: true, guestAutonomy: true, ... }` as defaults
- ValidationResultsPanel was showing preset defaults as "Present"
- Should show: `Required` = preset benchmark, `Present` = user's decision selections

**Red Flag Issue:**
- Red flags were hardcoded as `triggered: false`
- Should actually check adjacency matrix relationships

### Fixes Implemented

#### 1. ValidationResultsPanel - Complete Rewrite

**Bridges now derived from decisions:**
```javascript
// Check each saved decision for bridgeRequired
Object.entries(savedDecisions).forEach(([decisionId, optionId]) => {
  const decision = ADJACENCY_DECISIONS.find(d => d.id === decisionId);
  if (decision) {
    const option = decision.options.find(o => o.id === optionId);
    if (option?.bridgeRequired) {
      enabledBridges.add(option.bridgeRequired);
    }
  }
});
```

**Red flags computed from matrix:**
```javascript
// Example: Guest → Primary Suite check
const rel = matrix['GUEST1-PRI'] || matrix['PRI-GUEST1'];
triggered: rel === 'A' || rel === 'N';  // Should be B or S
```

**5 Red Flag Checks:**
| Red Flag | Check | Violation |
|----------|-------|-----------|
| RF1: Guest→Primary | GUEST1-PRI | A or N |
| RF2: Delivery→FOH | GAR-FOY, GAR-GR | A or N |
| RF3: Media→Bedroom | MEDIA-PRI, MEDIA-GUEST1 | A or N |
| RF4: Kitchen at Entry | KIT-FOY | A |
| RF5: Guest Through Kitchen | GUEST1-KIT | A or N |

**No-decisions warning:**
- Shows alert when `savedDecisions` is empty
- Links to "Answer Layout Questions"

#### 2. Navigation Consistency

**Standard back button:**
- Text: "Back to MVP Overview"
- Position: Top-left, below header
- Style: Ghost button with ArrowLeft icon

**Updated components:**
- AdjacencyComparisonGrid
- TierDataAdmin
- ValidationResultsPanel (already correct)

#### 3. Navigation Structure Document

Created `docs/MVP-NAVIGATION.md`:
- Screen hierarchy map
- Back button rules
- Cross-screen navigation patterns

### Data Flow Clarification

```
User answers Layout Questions
       ↓
Saved to fyiData.mvpAdjacencyConfig.decisionAnswers
       ↓
ValidationResultsPanel reads decisions
       ↓
Derives bridges from bridgeRequired field
       ↓
Shows: Required (benchmark) vs Present (user selections)
```

### Files Changed
- `src/components/MVP/ValidationResultsPanel.jsx` - Complete rewrite
- `src/components/MVP/AdjacencyComparisonGrid.jsx` - Back button
- `src/components/MVP/TierDataAdmin.jsx` - Back button
- `docs/MVP-NAVIGATION.md` - NEW

---

## Session: January 11, 2026 - N4S Brand Guide Compliance Fixes

### Objective
Fix MVP components to follow N4S Brand Guide styling. Address formatting issues raised by client review.

### Issues Identified (from client screenshots)
1. Pink buttons and odd text formatting
2. Strange tick marks not conforming to standards
3. Adjacency matrix format not matching approved BriefingBuilder design
4. Toggle button style incorrect (should match Desired/Achieved slider)
5. Validation results showing empty green circle with no score
6. No admin panel to view tier data sets
7. No tier indicator showing which benchmark (5K/10K/15K/20K) is being used

### Changes Implemented

#### 1. AdjacencyComparisonGrid - Complete Rewrite

**Before:** Pink buttons, misformatted cells, wrong toggle style
**After:** Follows N4S Brand Guide exactly

- Colored cells matching BriefingBuilder (green A, blue N, orange B, red S)
- Toggle switch style: `[Desired] [Achieved]` with navy active state
- N4S Navy (#1e3a5f) for primary actions
- Playfair Display for title, Inter for body
- Tier badge: `15K TIER` in navy
- Deviation highlighting with amber outline
- Proper legend with colored badges

#### 2. ValidationResultsPanel - Complete Rewrite (Matching Image 5)

**Before:** Empty green circle, no score displayed
**After:** Full validation results display

- Circular score indicator showing `87 / 100`
- Pass/Warning badge in appropriate color
- "All gates passed" status with timestamp
- Three tabs: `Red Flags (0) | Bridges (5) | Module Scores`
- Module cards with:
  - Checkmark icon
  - Module name
  - Score: `90 / 100`
  - Progress bar (navy fill, gray track)
  - Checklist counter
- Action buttons: View Adjacency Matrix, Edit Decisions

#### 3. TierDataAdmin - NEW COMPONENT

**Purpose:** View and verify tier-specific adjacency data

**Features:**
- Current Tier Detection panel:
  - Target SF: `15,000 SF`
  - Detected Tier: `15K` (highlighted)
  - Threshold rules displayed
- Tier cards (5K, 10K, 15K, 20K) showing:
  - Relationship count per tier
  - Bridge count
  - A/N/B/S breakdown
  - "CURRENT" badge on active tier
- Matrix Preview:
  - Grouped by fromSpaceCode
  - All relationships listed with colors
  - Bridge configuration status

#### 4. MVPModule Navigation

- Added `Database` icon import
- Added `admin` to viewMode type
- Added TierDataAdmin component import
- Added view handler for admin mode
- Added "Tier Data Admin" button (ghost style)

### Files Changed
- `src/components/MVP/AdjacencyComparisonGrid.jsx` - Complete rewrite
- `src/components/MVP/ValidationResultsPanel.jsx` - Complete rewrite
- `src/components/MVP/TierDataAdmin.jsx` - NEW
- `src/components/MVP/MVPModule.jsx` - Navigation updates

### Brand Guide Compliance Checklist
- [x] Colors match palette exactly (Navy #1e3a5f, Gold #c9a227)
- [x] Typography follows type scale (Playfair headings, Inter body)
- [x] Spacing uses 4px base system
- [x] Buttons have proper states (primary, secondary, ghost)
- [x] Cards: 8px border radius, 1px border, no shadows
- [x] Progress bars: 8px height, navy fill
- [x] Toggle: rounded pill style with navy active

---

## Session: January 11, 2026 - 15K Matrix Enhancement + P1-M Testing

### Objective
Enhance 15K adjacency matrix for complete Red Flag and Bridge coverage. Test with Thornwood Estate.

### Changes Implemented

#### 1. 15K Adjacency Matrix Enhancement (`program-presets.ts`)

**Expanded from 57 → 125 relationships**

**Red Flag Coverage:**
| Red Flag | Relationship | Status |
|----------|--------------|--------|
| #1 Guest→Primary Suite | PRI→FOY: S, PRI→GUEST: B | ✅ |
| #2 Delivery→FOH | GAR→FOY/GR/DR: S | ✅ |
| #3 Zone3 Wall→Zone0 | MEDIA→PRI/GUEST: S | ✅ |
| #4 No Show Kitchen | KIT→FOY: B | ✅ |
| #5 Guest→Kitchen Aisle | GUEST→KIT: S | ✅ |

**Bridge Coverage:**
| Bridge | Relationship | Status |
|--------|--------------|--------|
| Butler Pantry | DR→CHEF: B | ✅ |
| Guest Autonomy | GUEST1→FOY: B | ✅ |
| Sound Lock | FR→MEDIA: B | ✅ |
| Wet-Feet Intercept | WLINK→POOLSUP: A | ✅ |
| Ops Core | MUD→SCUL: A | ✅ |

**Zone Organization:**
- Z1: Arrival + Formal (FOY, OFF, GR, DR, WINE) - 18 relationships
- Z2: Family Hub (FR, KIT, BKF, LIB, MEDIA) - 25 relationships
- Z4: Wellness (WLINK, GYM, SPA, POOL, POOLSUP) - 15 relationships
- Z5: Primary Suite (PRI, PRIBATH, PRICL, PRILOUNGE) - 12 relationships
- Z6: Guest Suites (GUEST1, GUEST2, GUEST3) - 12 relationships
- Z7: Service Core (CHEF, SCUL, MUD, GAR, LND) - 23 relationships
- Z8: Outdoor (TERR, POOL) - 6 relationships

#### 2. P1-M Workflow Test Suite

**scripts/test-p1m.js** - Node.js test runner
- Tier detection verification
- Benchmark matrix loading
- Module scoring algorithm
- Deviation impact calculation

**Test Results:**
```
Thornwood Estate @ 15K SF
├── Tier Detection: ✓ 15K
├── Benchmark: 125 relationships
├── Baseline Score: 100/100
├── With 1 Deviation: 98/100 (-2 points)
└── All 8 Modules: ✓ Pass (80% threshold)
```

### Files Changed
- `src/mansion-program/client/data/program-presets.ts` - 15K matrix (57→125 relationships)
- `scripts/test-p1m.js` - Node.js test runner (new)
- `src/mansion-program/test/p1m-workflow-test.ts` - TypeScript test (new)

---

## Session: January 11, 2026 - MVP P1-M Workflow (Phase 2: Views & Navigation)

### Objective
Wire new MVP components and establish complete P1-M workflow navigation.

### Changes Implemented

#### 1. MVP Module Navigation (`src/components/MVP/MVPModule.jsx`)

**New View Modes Added:**
```javascript
viewMode: 'overview' | 'modules' | 'personalization' | 'comparison' | 'validation' | 'builder'
```

**P1-M Workflow Buttons:**
- "Answer Layout Questions" → Personalization questionnaire
- "View Adjacency Matrix" → Read-only comparison grid
- "Run Validation" → Validation results panel
- "Briefing Builder" → Brief generation

**Component Imports:**
- AdjacencyComparisonGrid (new)
- ValidationResultsPanel (new)

#### 2. Adjacency Comparison Grid (`src/components/MVP/AdjacencyComparisonGrid.jsx`)

**Features:**
- Read-only grid (no cell editing)
- Desired/Proposed toggle switch
- Deviation highlighting (amber background)
- Zone and Level filters
- Deviation summary at bottom
- "Run Validation" action button

**Props:**
```javascript
{ onBack, onRunValidation }
```

#### 3. Validation Results Panel (`src/components/MVP/ValidationResultsPanel.jsx`)

**Features:**
- Overall score circle (e.g., 87/100)
- Pass/Warning/Fail status badge
- Three tabs: Red Flags | Bridges | Module Scores
- 8 module cards with progress bars and 80% threshold
- 5 bridges with required/present status

**Props:**
```javascript
{ onBack, onViewMatrix, onEditDecisions }
```

### Files Changed
- `src/components/MVP/MVPModule.jsx` - New views + navigation
- `src/components/MVP/AdjacencyComparisonGrid.jsx` - Added onRunValidation prop
- `src/components/MVP/ValidationResultsPanel.jsx` - Added navigation props
- `src/contexts/AppContext.jsx` - Fixed duplicate context entries

### P1-M Workflow Complete
```
FYI Brief → Tier Detection → Answer Layout Questions
                                    ↓
                          View Adjacency Matrix
                          (Desired vs Proposed)
                                    ↓
                            Run Validation
                          (Score against 80% gate)
                                    ↓
                           Generate Brief
```

### Next Steps
1. Test validation scoring algorithm
2. Wire Mermaid diagram generation with bridges
3. Add PDF export of validation results

---

## Session: January 11, 2026 - MVP Adjacency Phase 1 (5K Preset + Context Wiring)

### Objective
Implement P1-M workflow foundation: 5K adjacency preset and wire decision persistence to IONOS backend.

### Changes Implemented

#### 1. 5K Adjacency Preset (`src/mansion-program/client/data/program-presets.ts`)

**New 5K Preset Added (Compact Luxury):**
- Target: 5,000 SF | 4 bedrooms | single-level living | pool
- 34 spaces (matching FYI 5K tier)
- Simplified adjacency matrix (no wine room, library, chef's kitchen)
- Two-node circulation strategy
- Bridge config: wetFeetIntercept + opsCore only

**Key 5K Relationships:**
```typescript
adjacencyMatrix5k: AdjacencyRequirement[] = [
  // Entry control - Office near entry for professional separation
  { fromSpaceCode: "FOY", toSpaceCode: "OFF", relationship: "A" },
  // Open kitchen-family connection
  { fromSpaceCode: "KIT", toSpaceCode: "FR", relationship: "A" },
  // Service spine
  { fromSpaceCode: "SCUL", toSpaceCode: "MUD", relationship: "A" },
  // Media acoustic separation from bedrooms
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" },
  // ... 60+ total relationships
]
```

#### 2. Adjacency Decisions Updated (`src/mansion-program/shared/adjacency-decisions.ts`)

**5K Tier Support:**
- Type definition: `applicablePresets: ('5k' | '10k' | '15k' | '20k')[]`
- Most decisions now include 5K
- Excluded from 5K: `wine-access` (no wine room at tier)
- `getDecisionsForPreset()` accepts '5k'

#### 3. MVP Data Persistence (`src/contexts/AppContext.jsx`)

**New Data Structure in fyiData:**
```javascript
mvpAdjacencyConfig: {
  tier: null,                    // '5k' | '10k' | '15k' | '20k'
  decisionAnswers: {},           // { [decisionId]: optionId }
  questionnaireCompletedAt: null,
  validationRunAt: null,
  validationResults: null,       // Cached validation results
}
```

**New Context Functions:**
- `updateMVPAdjacencyConfig(updates)` - Update full config
- `updateMVPDecisionAnswer(decisionId, optionId)` - Save single decision

#### 4. AdjacencyPersonalizationView Updated

**New Props Flow:**
- Loads `savedDecisions` from `fyiData.mvpAdjacencyConfig.decisionAnswers`
- Calls `onDecisionChange` on each selection (immediate persistence)
- Saves completion timestamp on finish

**Data Flow:**
```
fyiData.mvpAdjacencyConfig.decisionAnswers → AdjacencyPersonalization
                 ↓ (on change)
updateMVPDecisionAnswer → fyiData → IONOS backend
```

#### 5. AdjacencyPersonalization.tsx Updated

**New Props:**
```typescript
interface AdjacencyPersonalizationProps {
  preset: '5k' | '10k' | '15k' | '20k';  // Added 5k
  savedDecisions?: Record<string, string>;  // NEW: restore previous
  onDecisionChange?: (decisionId: string, optionId: string) => void;  // NEW
  // ... existing props
}
```

**State Initialization:**
```typescript
const [selections, setSelections] = useState(() => {
  // Use saved decision if available, otherwise use recommendation
  initial[rec.decision.id] = savedDecisions?.[rec.decision.id] 
    || rec.recommendedOption.id;
});
```

### Files Changed
- `src/mansion-program/client/data/program-presets.ts` - Added 5K preset
- `src/mansion-program/shared/adjacency-decisions.ts` - Added 5K support
- `src/mansion-program/client/components/AdjacencyPersonalization.tsx` - New props
- `src/mansion-program/server/adjacency-recommender.ts` - 5K type support
- `src/contexts/AppContext.jsx` - New mvpAdjacencyConfig structure
- `src/components/MVP/AdjacencyPersonalizationView.jsx` - Context integration

### Next Steps (Phase 2)
1. Build read-only Adjacency Comparison Grid (Desired vs Proposed toggle)
2. Build Validation Results Panel (matching mockup)
3. Build Deviation Warnings Summary
4. Wire to MVP module navigation

---

## Session: January 10, 2026 - 5K Tier Implementation & FYI Display Simplification

### Objective
Implement 5K tier support and simplify FYI display by removing tier selector (tiers become internal algorithm only).

### Changes Implemented

#### 1. Space Registry (`src/shared/space-registry.js`)

**5K Tier Support Added:**
- All 75 spaces now have 5K baseSF values (or null for tier-restricted spaces)
- 34 spaces available at 5K tier
- Tier-restricted spaces (WINE, LIB, CHEF, THR, SPA, STF, etc.) set to null at 5K

**New Functions:**
```javascript
export function determineTierFromSF(targetSF) {
  if (targetSF < 7500) return '5k';
  if (targetSF < 12500) return '10k';
  if (targetSF < 17500) return '15k';
  return '20k';
}
```

**Circulation Defaults:**
```javascript
'5k': { min: 0.11, max: 0.14, default: 0.12 }
```

**Space Availability by Tier:**
| Space Type | 5K | 10K | 15K | 20K |
|------------|:--:|:---:|:---:|:---:|
| Core (FOY, GR, KIT, etc.) | ✓ | ✓ | ✓ | ✓ |
| GST1, GST2 | ✓ | ✓ | ✓ | ✓ |
| GST3 | ✓ | - | ✓ | ✓ |
| GST4 | - | - | - | ✓ |
| JRPRI | - | - | ✓ | ✓ |
| WINE, LIB, CHEF, SPA | - | ✓ | ✓ | ✓ |
| THR, STF, MAS | - | - | ✓ | ✓ |

#### 2. FYI Bridges (`src/components/FYI/utils/fyiBridges.js`)

**Updated `determineTier()`** to support 5K threshold.

**Would-Likes Pre-Selection:**
```javascript
// Would-likes now PRE-SELECTED (included by default)
niceToHaveSpaces.forEach(legacyValue => {
  const code = legacyToCode(legacyValue);
  if (code && selections[code]) {
    selections[code].included = true;  // PRE-SELECTED
    selections[code].kycSource = 'niceToHave';
  }
});
```

**Enhanced Bedroom Logic:**
- Primary always included
- GST1/2/3 based on bedroom count
- GST3 available at 5K for high bedroom counts
- Jr. Primary at 15K+ with ≥3 guest bedrooms

#### 3. FYI Totals Panel (`src/components/FYI/components/FYITotalsPanel.jsx`)

**Removed:** Tier selector buttons (10K/15K/20K)

**New Display:**
```
Target SF: 12,000 SF (from KYC)
Current Program: 13,450 SF

┌─────────────────────────────┐
│   Delta from Target         │
│      +1,450 SF (+12%)       │
└─────────────────────────────┘
```

**Delta Box Styling:**
- Balanced (±5%): Green
- Over target: Orange
- Under target: Blue

#### 4. FYI Module CSS (`src/components/FYI/FYIModule.css`)

**Added Styles:**
- `.fyi-totals-panel__target-display` - Target SF display
- `.fyi-totals-panel__current-display` - Current program display
- `.fyi-totals-panel__delta-box` - Prominent delta display
- `.fyi-totals-panel__delta-box--balanced/over/under` - State colors
- Hidden tier selector: `display: none`

#### 5. FYI State Hook (`src/components/FYI/hooks/useFYIState.js`)

**Updated circulation defaults** to include 5K tier.

#### 6. FYI Module (`src/components/FYI/FYIModule.jsx`)

**Updated initialization** with 5K tier logic and circulation defaults.

### Verification Tests Passed

| Test Category | Result |
|---------------|--------|
| Tier determination (all boundaries) | ✓ PASS |
| Space availability per tier | ✓ PASS |
| Circulation defaults all tiers | ✓ PASS |
| S/M/L size calculations | ✓ PASS |
| 5K tier exclusions correct | ✓ PASS |
| Legacy tier compatibility | ✓ PASS |
| Data structure compatibility | ✓ PASS |
| Build compilation | ✓ PASS |

### Architecture Decisions

**Tiers are INTERNAL only:**
- Client never sees "5K", "10K", "15K", "20K" labels
- Tier determines: available spaces, default sizes, adjacency matrix
- Client sees: Target SF, Current SF, Delta

**Template Philosophy:**
- Start with tier-appropriate spaces included
- Apply bedroom count logic
- Include must-haves
- Pre-select would-likes (client can remove)
- Client has full flexibility

### Files Modified

| File | Lines Changed |
|------|---------------|
| `src/shared/space-registry.js` | +85 (5K baseSF values, function) |
| `src/components/FYI/utils/fyiBridges.js` | +25 (tier logic, would-likes) |
| `src/components/FYI/hooks/useFYIState.js` | +8 (5K defaults) |
| `src/components/FYI/components/FYITotalsPanel.jsx` | +60 (delta display) |
| `src/components/FYI/FYIModule.jsx` | +15 (initialization) |
| `src/components/FYI/FYIModule.css` | +104 (delta styles) |

### Build Status
✅ `CI=false npm run build` - Compiled successfully (no warnings)

### Commit Message
```
feat(fyi): add 5K tier support, simplify display to Target/Current/Delta

FEATURES:
- 5K tier for compact luxury (< 7,500 SF)
- 34 spaces available at 5K tier
- Would-likes now pre-selected by default
- Delta box with color-coded status

UI CHANGES:
- Removed tier selector (tiers internal only)
- New display: Target SF, Current SF, Delta
- Color-coded delta: green/orange/blue

BACKWARDS COMPATIBLE:
- Existing 10K/15K/20K projects unaffected
- All legacy functions still work
```

---

## Session: January 9, 2026 - Module Library & MVP Workflow Integration

### Part 2: Module Library Implementation

**Objective**: Add Module Library view with 8 expandable module cards and deployment workflow.

**Why This Matters**: 
- Previously, Adjacency Personalization screen was disconnected from KYC
- Users didn't understand WHY certain fields were required
- Module rules explain the "why" behind adjacency decisions

### MVP Deployment Workflow

```
A ────► B ────► C ────► D ────► E
Profile  Space   Module   Adjacency Brief
Complete Program Validation Lock    Ready
(KYC)    (FYI)   (Rules)   (Decisions) (Output)
```

### Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/components/MVP/ModuleLibraryView.jsx` | NEW | 8 module cards with expand/collapse, deployment workflow |
| `src/components/MVP/MVPModule.jsx` | UPDATED | Added 'modules' viewMode, gate status calculation |
| `src/styles/index.css` | APPENDED | Module library CSS (cards, workflow, checklist) |

### ModuleLibraryView Features

1. **8 Module Cards** (click to expand):
   - Overview section
   - Gate Deliverables (numbered list)
   - Checklist Items (interactive checkboxes)

2. **Deployment Workflow Bar**:
   - 5 gates: A (Profile) → B (Space) → C (Modules) → D (Adjacency) → E (Brief)
   - Visual status indicators (complete/current/locked)

3. **Progress Tracking**:
   - Overall checklist completion percentage
   - Per-module item count

### Navigation Flow Updated

```
MVP Overview
├── "Review Module Library" → ModuleLibraryView
│   └── "Run Validation" → AdjacencyPersonalizationView
├── "Personalize Adjacencies" → AdjacencyPersonalizationView
└── "Open Briefing Builder" → BriefingBuilderView
```

### Build Status
✅ `CI=false npm run build` - Compiled successfully

---

## Session: January 9, 2026 - FYI → MVP LIVE Data Integration

### Part 1: Live Data Flow & Circulation Fix

### Objective
Implement LIVE reactive data flow from FYI to MVP module. Data integrity is NUMBER ONE focus. Edits in FYI must appear INSTANTLY in MVP with no manual refresh.

### Architecture Decision
**Core Principle**: AppContext is SINGLE SOURCE OF TRUTH. Both FYI and MVP read from same context. Live reactivity achieved through React's native re-render mechanism.

**Data Flow**:
```
FYI edits → updateFYISelection() → AppContext.setProjectData() → 
React re-renders all consumers → MVP useMemo recomputes → UI updates
```

**Update Latency**: One React render cycle (~16ms) - NO polling, NO manual refresh

### BUG FIX: Circulation Calculation Mismatch

**Problem**: Initial implementation calculated circulation on ALL structures combined, but FYI only calculates circulation on Main Residence. Guest House and Pool House are net SF only.

**Root Cause Analysis**:
```
WRONG (initial):
- totalNetSF = Main + GH + PH net
- circulation = totalNetSF * 14%
- Result: 17,411 SF (overcounted)

CORRECT (FYI's actual logic):
- Main: net + calculateCirculation(mainNet, target, lockToTarget, pct, tier)
- GH: net only (no circulation)
- PH: net only (no circulation)  
- Result: 17,099 SF (matches FYI)
```

**Fix Applied**:
1. Use `calculateCirculation()` from space-registry (respects lockToTarget clamping)
2. Only apply circulation to Main Residence
3. Report Guest House and Pool House as net-only totals
4. Updated FYISpaceProgramCard to show structure breakdown like FYI sidebar

### Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/mvp-bridge.js` | REWRITTEN | Fixed circulation calculation, structure-aware totals |
| `src/components/MVP/MVPModule.jsx` | UPDATED | Structure breakdown display matching FYI sidebar |
| `src/styles/index.css` | APPENDED | Structure breakdown CSS, grand total box styles |

### Key Changes in mvp-bridge.js

```javascript
// CRITICAL: Calculate circulation ONLY for Main Residence
const mainCirculationSF = calculateCirculation(
  byStructure.main.netSF,
  targetSF,
  lockToTarget,
  circulationPct,
  programTier
);

// Guest House and Pool House: net only, NO circulation
byStructure.guestHouse.totalSF = byStructure.guestHouse.netSF;
byStructure.poolHouse.totalSF = byStructure.poolHouse.netSF;

// Grand totals match FYI exactly
const totalConditionedSF = byStructure.main.totalSF + 
                           byStructure.guestHouse.totalSF + 
                           byStructure.poolHouse.totalSF;
```

### Data Integrity Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| Numbers match FYI | Uses same `calculateCirculation()` with lockToTarget |
| Structure breakdown | Main Residence with circulation, GH/PH net-only |
| LIVE updates | `fyiData` dependency in useMemo |
| No stale data | No copies, no snapshots |

### Build Status
✅ `CI=false npm run build` - Compiled successfully

### Suggested Commit Message
```
fix(mvp): correct FYI circulation calculation to match FYI exactly

- Only apply circulation to Main Residence (not GH/PH)
- Use calculateCirculation() with lockToTarget clamping
- Add structure breakdown display matching FYI sidebar
- Grand total now matches FYI: Main+circ + GH(net) + PH(net)
```

---

## Session: January 6, 2026 - FYI Module Comprehensive Revision

### Strategic Changes
- Renamed purpose from "Interior Area Brief" to "Lifestyle Requirements Refinement"
- Added multi-structure support: Main Residence, Guest House, Pool House
- Updated level naming: L1 = Arrival Level, L2/L3 above, L-1/L-2/L-3 below
- Removed "basement" terminology in favor of "below arrival"
- All adjacency decisions deferred to MVP module

### Bedroom/Closet Standards
| Suite Type | Closet Configuration |
|------------|---------------------|
| Primary Bedroom Suite | His + Hers separate walk-in closets (PRICL_HIS, PRICL_HER) |
| Jr. Primary Suite | Single large walk-in (JRPRICL) - renamed from VIP Suite |
| Guest Suites (Ultra-luxury) | Walk-in closet |
| Guest Suites (Luxury) | Standard closets |
| Kid's Bunk Room | Optional fun space |

### Space Registry Updates (`src/shared/space-registry.js`)
- Added Zone 9: Guest House (Z9_GH) with GH_GST1-3, GH_PWD, GH_LIV, GH_KIT, GH_DIN
- Added Zone 10: Pool House (Z10_PH) with PH_SHW, PH_CHG, PH_BATH, PH_ENT, PH_KIT, PH_DIN
- Split PRICL into PRICL_HIS and PRICL_HER
- Replaced VIP with JRPRI, JRPRIBATH, JRPRICL
- Added helper functions: buildAvailableLevels(), getZonesForStructure(), getSpacesForStructure()
- Added bedroomTypes configuration and getBedroomComponents() helper

### New FYI Components
- `LevelDiagram.jsx` - Visual building section showing SF per level with click-to-filter
- `StructureSelector.jsx` - Toggle between Main/Guest House/Pool House with SF summary

### FYI Module Updates
- Multi-structure state management
- Level filtering by clicking on level diagram
- Consolidated KYC merge (Principal + Secondary additive selections)
- Available levels built from KYC configuration
- Structure-aware zone navigation

### KYC Changes Tracked (Not Yet Implemented)
| # | Section | Change |
|---|---------|--------|
| 1 | P1.A.3 | Level Configuration (totalLevels, levelsAboveArrival, levelsBelowArrival) |
| 2 | P1.A.3 | Guest House section |
| 3 | P1.A.3 | Pool House section |
| 4 | P1.A.3 | Visual Level Diagram |
| 5 | P1.A.7 | Guest Suite closet type (walk-in vs standard) |

### Documentation Created
- `docs/FYI-REVISION-ARCHITECTURE.md` - Complete technical specification
- `docs/KYC-REVISION-TRACKER.md` - Pending KYC changes

---

## Session: January 4, 2026 - FYI Module Complete Implementation

### Commits Made This Session
- `ea399e5` — FYI module rebuild (13 files, +4,841/-712 lines)
- `31f44f6` — AppContext FYI data structure fix

### Work Completed

#### 1. Space Registry MVP Alignment
Aligned space codes with existing MVP adjacency matrices:

| Changed From | Changed To | Space |
|--------------|------------|-------|
| GRT | GR | Great Room |
| DIN | DR | Formal Dining |
| FAM | FR | Family Room |
| MDA | MEDIA | Media Room |
| TER | TERR | Terrace |
| POL | POOL | Pool |
| SCL | SCUL | Scullery |
| CHF | CHEF | Chef's Kitchen |
| GAM | GAME | Game Room |
| PBD | PRI | Primary Bedroom |
| PBT | PRIBATH | Primary Bath |
| PCL | PRICL | Primary Closets |
| PLG | PRILNG | Primary Lounge |
| WIN | WINE | Wine Room |
| PSP | POOLSUP | Pool Support |

#### 2. Dashboard Updates
- Updated FYI module card description
- Changed progress calculation to use new FYI data structure
- Updated stats to show: Spaces Selected, Target SF, Program Tier

#### 3. Cloudinary Setup Guide
Created `docs/CLOUDINARY-SETUP.md` with:
- Folder structure: `N4S/space-renders/`, `N4S/floor-plans/`, `N4S/zone-covers/`
- Naming convention: `{CODE}_{SIZE}.jpg`
- 10 priority spaces for initial upload

#### 4. PDF Export Utility
Created `src/components/FYI/utils/fyi-pdf-export.js`:
- Client-side PDF generation using jsPDF or printable HTML
- Professional formatting with zone breakdowns
- Project/client name support

#### 5. TypeScript Cleanup
- Removed `space-registry.ts` (keeping only `.js` version)
- All FYI imports now use `.js` file

### Files Ready for Commit

| File | Status | Description |
|------|--------|-------------|
| `src/shared/space-registry.js` | MODIFIED | MVP-aligned codes |
| `src/components/FYI/FYIModule.jsx` | MODIFIED | PDF export integration |
| `src/components/FYI/hooks/useFYIState.js` | MODIFIED | Import path |
| `src/components/FYI/utils/fyiBridges.js` | MODIFIED | MVP-aligned codes |
| `src/components/FYI/utils/fyi-pdf-export.js` | NEW | PDF generation |
| `src/components/FYI/components/FYISpaceCard.jsx` | MODIFIED | Import path |
| `src/components/Dashboard.jsx` | MODIFIED | FYI stats/progress |
| `docs/CLOUDINARY-SETUP.md` | NEW | Image setup guide |
| `docs/CODE-ALIGNMENT.md` | NEW | Code mapping reference |

### Suggested Commit Message
```
feat(fyi): MVP code alignment + PDF export + dashboard updates

- Align space codes with MVP adjacency matrices (GRT→GR, DIN→DR, etc.)
- Add client-side PDF export utility with jsPDF/HTML fallback
- Update Dashboard with new FYI progress/stats
- Add Cloudinary setup guide
- Remove TypeScript version of space-registry
```

### Next Steps
1. Deploy to IONOS and test
2. Upload 10 priority space images to Cloudinary
3. Test PDF export functionality
4. Verify FYI → MVP data flow

---

## Session: January 10, 2026 - Data Integrity Audit & Fixes

### Critical Bugs Found & Fixed

#### Bug 1: PDF Report Had HARDCODED Values
**Location**: `src/utils/TasteReportGenerator.js` lines 835-842

**Before (WRONG)**:
```javascript
const dnaMetrics = [
  { label: 'Tradition', value: this.overallMetrics.styleEra },
  { label: 'Formality', value: 2.8 },   // HARDCODED!
  { label: 'Warmth', value: 3.5 },      // HARDCODED!
  { label: 'Drama', value: 2.2 },       // HARDCODED!
  { label: 'Openness', value: 3.8 },    // HARDCODED!
  { label: 'Art Focus', value: 3.0 }    // HARDCODED!
];
```

**After (FIXED)**:
- Now reads actual scores from `profile.session.profile.scores`
- Scale conversion handled correctly (1-10 scale)

#### Bug 2: MVP Checklist Not Persisting
**Location**: `src/components/MVP/MVPModule.jsx`

**Before (WRONG)**:
```javascript
const [moduleChecklistState, setModuleChecklistState] = useState({});
// Data lost on navigation - never saved!
```

**After (FIXED)**:
- Added `mvpData` to project structure in AppContext
- Added `updateMVPChecklistItem()` function
- MVPModule now uses context instead of local state
- Added Save button to MVP header

### Data Audit Protocol Created

**New Files**:
| File | Purpose |
|------|---------|
| `docs/DATA-AUDIT-PROTOCOL.md` | Complete data flow documentation |
| `scripts/audit-data-integrity.sh` | Automated audit script |

**Usage**:
```bash
npm run audit:data
# or
bash scripts/audit-data-integrity.sh
```

### Audit Script Checks

1. useState persistence (local state that should sync)
2. Hardcoded values in display code
3. Update function coverage per module
4. Scale conversions (1-5 vs 1-10)
5. localStorage usage (should sync to backend)
6. markChanged() coverage
7. Taste data paths (correct location)
8. Project data structure completeness

### Files Modified

| File | Change |
|------|--------|
| `src/contexts/AppContext.jsx` | Added mvpData, updateMVPData, updateMVPChecklistItem |
| `src/components/MVP/MVPModule.jsx` | Uses context, added Save button |
| `src/utils/TasteReportGenerator.js` | Fixed hardcoded values, reads actual scores |
| `package.json` | Added audit:data script |

### Commit Message
```
feat: data audit protocol + critical data fixes

BUGS FIXED:
- PDF report hardcoded Formality/Warmth/Drama values
- MVP checklist not persisting to backend

NEW:
- docs/DATA-AUDIT-PROTOCOL.md - complete data flow documentation
- scripts/audit-data-integrity.sh - automated pre-deployment audit
- npm run audit:data command

CHANGES:
- mvpData added to project structure
- updateMVPChecklistItem() for checklist persistence
- TasteReportGenerator reads actual profile.scores
```

---

## Session: January 11, 2026 - Documentation System & Module Colors

### User Request
1. Add Documentation button to top header bar (not inside module)
2. Fix transparent header bar (should be solid)
3. Add Dashboard documentation with full journey overview
4. Fix KYC documentation not rendering
5. Apply distinct module colors from Soft Pillow palette

### Implementation

#### 1. Documentation System Architecture

**Props flow:**
```
App.jsx (manages showDocs state)
    ↓
Module components receive: showDocs, onCloseDocs
    ↓
Each module renders [Module]Documentation.jsx when showDocs=true
```

**Documentation button moved to main header bar** (`App.jsx`):
- Appears next to Settings gear icon
- Only shows for modules with docs (dashboard, kyc, fyi, mvp)
- Controlled by `modulesWithDocs` array

**Files with Documentation:**
| Module | Component | Lines |
|--------|-----------|-------|
| Dashboard | DashboardDocumentation.jsx | ~1,700 |
| KYC | KYCDocumentation.jsx | ~1,720 |
| FYI | FYIDocumentation.jsx | ~1,641 |
| MVP | MVPDocumentation.jsx | ~1,970 |

#### 2. Dashboard Documentation (NEW)

Created comprehensive `DashboardDocumentation.jsx` with 4 tabs:

**Overview Tab:**
- What is N4S (luxury residential advisory platform)
- Value proposition (4 key benefits)
- Journey preview: KYC → FYI → MVP → KYM → VMX
- User types (Families, Advisors, Architects)

**Workflow Tab:**
- Complete module breakdown with timing estimates
- KYC: 2-4 hours, 7 key sections
- FYI: 1-2 hours, zone-based organization  
- MVP: 30-60 min, validation and scoring
- KYM: Placeholder (Coming Soon) - market benchmarking
- VMX: Placeholder (Coming Soon) - visual adjacency diagrams
- Typical 3-week timeline

**Gates Tab:**
- Gate 0: KYC Complete (unlocks FYI)
- Gate 1: Program Complete (unlocks MVP)
- Gate 2: Adjacency Validated (ready for design team)
- Future gates for KYM and VMX
- Cost-to-change curve visualization

**Reference Tab:**
- Module quick reference table
- Tier definitions (5K/10K/15K/20K)
- Respondent types (Principal/Secondary)
- Data flow diagram
- Glossary of terms

#### 3. Header Bar Fixes

**CSS changes (`index.css`):**
```css
.main-header {
  background: var(--navy);  /* Solid, not transparent */
  z-index: 100;             /* Above content when scrolling */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

**Button styling:**
- Documentation button: white text/border on dark backgrounds
- Settings button: matches Documentation button style
- Both adapt to light/dark backgrounds automatically

#### 4. Module Colors - Soft Pillow Palette

**Final approved colors (App.jsx):**
| Module | Background | Text | Color Name |
|--------|------------|------|------------|
| Dashboard | #1e3a5f | white | Navy (kept) |
| KYC | #315098 | white | Deep Blue |
| FYI | #8CA8BE | dark | Steel Blue |
| MVP | #AFBDB0 | dark | Sage Green |
| KYM | #E4C0BE | dark | Dusty Rose |
| VMX | #FBD0E0 | dark | Light Pink |
| Settings | #374151 | white | Gray (kept) |

**Dynamic text/button colors:**
- Light backgrounds (#8CA8BE, #AFBDB0, #E4C0BE, #FBD0E0) use dark text (#1a1a1a)
- Dark backgrounds (#1e3a5f, #315098, #374151) use white text (#ffffff)
- Header buttons adapt automatically based on background

#### 5. React Hooks Fixes

Fixed React Hooks violations in KYC and FYI modules:
- Hooks must be called in same order every render
- Moved docs return after all hook declarations
- Consolidated duplicate useState declarations

### Files Changed

| File | Change |
|------|--------|
| `src/App.jsx` | Module colors, header docs button, showDocs state |
| `src/components/Dashboard.jsx` | Accept showDocs/onCloseDocs props |
| `src/components/DashboardDocumentation.jsx` | NEW - Full 4-tab docs |
| `src/components/KYC/KYCModule.jsx` | Hooks fixes, props handling |
| `src/components/FYI/FYIModule.jsx` | Hooks fixes, props handling |
| `src/components/MVP/MVPModule.jsx` | Remove internal docs button, use props |
| `src/styles/index.css` | Header bar solid styling |
| `docs/N4S-BRAND-GUIDE.md` | Updated Section 13 with Soft Pillow palette |

### Commits Made

1. `e7f6550` - Move Documentation button to main header bar + Dashboard docs
2. `4a00e2b` - Fix React Hooks violations in KYC and FYI modules
3. `c306d9e` - Apply standard N4S brand formatting to Dashboard Documentation
4. `eaf395b` - Revert to approved Brand Guide module header colors (solid)
5. `a4092a2` - Apply Soft Pillow palette to module header colors

### Brand Guide Updates

Updated Section 13 with Soft Pillow palette:
- Version: 1.2
- Date: January 11, 2026
- Change: Updated Module Colors to Soft Pillow palette

---

## Session: January 11, 2026 (Part 2) - KYM Module Implementation

### Overview

Built the KYM (Know Your Market) module based on the Market-Intel Replit prototype. The module provides market intelligence for luxury residential development including market analysis, comparable properties with live API integration, and demographics with buyer personas.

### Source Analysis

**Replit Prototype Components Analyzed:**
- `server/services/property-service.ts` - Live API integration with Realtor.com via RapidAPI
- `server/routes.ts` - API endpoints for location data, properties, demographics
- `client/src/pages/` - Market Analysis, Comparable Properties, Demographics, Report pages
- `client/src/context/location-context.tsx` - Location state management
- `shared/schema.ts` - Data types and validation schemas

### KYM Module Structure

```
src/components/KYM/
├── KYMModule.jsx         # Main module with tabs
├── KYMModule.css         # N4S-branded styles
├── KYMDocumentation.jsx  # 4-tab documentation
└── index.js              # Module exports
```

### Features Implemented

#### 1. Market Analysis Tab
- Market KPIs: Growth Rate, Median $/SF, Listing Duration, Demand Index
- 12-month trend visualization
- Market summary with outlook text

#### 2. Comparable Properties Tab
- Property grid with filtering
- Price range and SF range filters
- Property cards with specs, features, status badges
- Search by address
- Support for live API data (via RAPIDAPI_KEY env var)
- Fallback to generated sample data

#### 3. Demographics Tab
- Population, income, education stats
- Income distribution visualization
- Target buyer personas
- Feature priority matrix (9 features ranked by importance)

### Integration Points

**App.jsx Changes:**
- Added Map icon import from lucide-react
- Added KYMModule import
- Added 'kym' to modules array (between MVP and Settings)
- Added 'kym' to modulesWithDocs array
- Added KYM case in renderModule()

**Dashboard.jsx Changes:**
- Enabled KYM module (removed comingSoon flag)
- Updated description to match actual functionality
- KYM now navigable from dashboard

### API Integration Notes

**Live Data (when RAPIDAPI_KEY configured):**
- Fetches real property listings from Realtor.com API
- Caches results for 30 minutes
- Falls back to generated data on API failure

**Current Status:**
- Module uses generated mock data by default
- Ready for live API integration when keys provided
- API endpoints match Market-Intel prototype structure

### Alignment Model Concept

Proposed framework for P2 "Have a Story to Tell":

**Data Sources to Correlate:**
1. KYC: Budget, location, lifestyle, family needs
2. FYI: Spaces, features, SF allocation, tier
3. MVP: Adjacency decisions, red flags, bridges
4. KYM: Market $/SF, buyer personas, feature priorities

**Proposed Scores:**
1. Price Positioning Score (client $/SF vs market median)
2. Feature Alignment Score (FYI features vs buyer priorities)
3. Buyer Persona Match Score (client profile vs personas)
4. Market Timing Score (demand index + growth rate)

**Story Elements:**
- Investment positioning statement
- Target buyer profile match
- Feature differentiation analysis
- Market timing validation

### Files Created

| File | Lines | Description |
|------|-------|-------------|
| `KYMModule.jsx` | ~900 | Main module with all three tabs |
| `KYMModule.css` | ~700 | Full styling following N4S brand |
| `KYMDocumentation.jsx` | ~450 | 4-tab documentation |
| `index.js` | 2 | Module exports |

### Files Modified

| File | Change |
|------|--------|
| `src/App.jsx` | Added KYM import, navigation, routing |
| `src/components/Dashboard.jsx` | Enabled KYM module |

### Build Status

✅ Build successful - all files compile correctly
✅ KYM module accessible via sidebar navigation
✅ Documentation accessible via header button
✅ Dusty Rose (#E4C0BE) header color applied

---

## Session: February 8, 2026 — MVP Data Integrity Enforcement

### Summary
Fixed critical data integrity issues across all MVP module components and PDF reports. Established and enforced the "Golden Rule": FYI live data is the single source of truth for spaces and square footage throughout N4S. Preset benchmark data is used ONLY for adjacency relationships and as fallback when FYI is empty.

### Issues Fixed

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| White screen on MVP load | `pets.trim()` on non-string data | Type guard in mvp-bridge.js + FamilyHouseholdSection.jsx |
| Empty adjacency diagram/matrix | Used `req.from`/`req.to` instead of `req.fromSpaceCode`/`req.toSpaceCode` | Fixed property names in PersonalizationResult.tsx |
| MVP Program Summary showed 15,220 SF (wrong) | ProgramSummaryView read from preset benchmark, not FYI | Rewired to use transformFYIToMVPProgram |
| PDF Report showed 15,220 SF (wrong) | MVPReportGenerator.js used `presetData.spaces` | Now uses fyiProgram.spaces with FYI totals |
| Validation Report same issue | MVPValidationReport.js same pattern | Same fix |
| Adjacency diagram used preset spaces | AdjacencyComparisonGrid passed presetData.spaces | Now uses liveSpaces from FYI |
| Questionnaire view used preset spaces | AdjacencyPersonalizationView same | Same fix |
| Zone names incompatible | FYI uses codes (Z1_APB), presets use names | Added zoneName fallback + FYI zones to ZONE_POS maps |

### Golden Rule Pattern (6 files)
```
const spaces = (fyiProgram?.spaces?.length > 0) ? fyiProgram.spaces : (presetData?.spaces || []);
```

### Files Modified
- `src/components/MVP/MVPModule.jsx` — passes fyiProgram to report generators
- `src/components/MVP/MVPReportGenerator.js` — FYI-first spaces, zone name compat, circulation zone entry
- `src/components/MVP/MVPValidationReport.js` — FYI-first spaces, zone name compat
- `src/components/MVP/ProgramSummaryView.jsx` — FYI-first data sourcing
- `src/components/MVP/AdjacencyComparisonGrid.jsx` — liveSpaces for diagram + legend
- `src/components/MVP/AdjacencyPersonalizationView.jsx` — liveSpaces for PersonalizationResult
- `src/components/MVP/ValidationResultsPanel.jsx` — derives fyiProgram, passes to report
- `src/components/KYC/sections/FamilyHouseholdSection.jsx` — pets type guard
- `src/lib/mvp-bridge.js` — pets type guard
- `src/mansion-program/client/components/PersonalizationResult.tsx` — fromSpaceCode/toSpaceCode fix

### Documentation Created
- `docs/DATA-INTEGRITY-SF-AUDIT.md` — Full data flow audit with ITR items

### Commits
- `5acf8fc` — pets.trim TypeError fix
- `8d3b5d2` — PersonalizationResult fromSpaceCode/toSpaceCode fix
- `052dbf6` — ProgramSummaryView FYI data + audit doc
- `dca315c` — Golden Rule enforcement across all 6 MVP consumers

### ITR Items Logged (docs/DATA-INTEGRITY-SF-AUDIT.md)
- ITR-1: FYI dual delta labels (net vs total) — Low
- ITR-2: VMX manual SF entry not connected to FYI — Medium
- ITR-3/4: Diagram preset spaces — DONE (fixed in dca315c)
- ITR-5: Circulation calculation alignment verification — Low
- ITR-6: Structure breakdown display in MVP Program Summary — Low

---

## Session: February 14, 2026 - KYS PDF Report Generator

### User Request
Create a PDF report generator for the KYS (Know Your Site) module. No existing PDF export existed for KYS. Used Thornwood Estate as test model.

### Implementation

#### KYSReportGenerator.js (NEW FILE — 620 lines)
Full N4S-branded PDF report following established patterns from KYMReportGenerator.js:

- **Cover Page**: N4S branding, client name (from kycData.principal.portfolioContext), project name, site name/location, validated program summary (SF + tier), quote
- **Executive Summary**: Large traffic light verdict (GO/NO-GO/CAUTION), overall score with /5.0, completion percentage, deal-breaker alert banner when triggered
- **Site Information**: autoTable with address, price, lot size, dimensions, zoning, MLS#, notes
- **Category Summary Table**: 7 categories with weights, scores, color-coded status (GREEN/AMBER/RED)
- **Detailed Category Breakdown**: Each of 7 categories with sub-heading, traffic dot, weight/description, then factor detail table (32 sub-factors with scores and notes)
- **Deal-Breaker Analysis**: Triggered flags in red table, clear flags in green table
- **Recommendation Box**: Verdict label + full recommendation text
- **Handoff Notes**: Site constraints + KYM insights (when present)
- **Multi-Site Comparison**: Ranking table + category-by-category matrix (when >1 site)

Uses jsPDF + jspdf-autotable, same header/footer pattern, same N4S brand colors.

#### KYSModule.jsx (MODIFIED — 3 changes)
1. Added `FileDown` icon import + `generateKYSReport` import
2. Added `fyiData`, `mvpData` to AppContext destructuring + `isExporting` state
3. Added Export Report button in module header (same `kyc-export-btn` class as KYM)
4. Smart context: exports selected site when in assessment view, all sites from list view

### Follow-up Tweaks
1. Removed "— Arvin" attribution from cover page quote (quote itself retained)
2. Added extra padding (3→5mm) between category heading line (with colored dot) and weight/description text below

### Files Changed
- `src/components/KYS/KYSReportGenerator.js` — NEW
- `src/components/KYS/KYSModule.jsx` — MODIFIED (imports + export button + handler)

### Commits
- c25b4f6: Add KYS Site Assessment PDF report generator
- 20298f8: KYS Report: remove Arvin attribution, add padding below category headings

### Other Notes
- GitHub PAT token updated (old one expired). New fine-grained PAT provided during session.
- Also created a consolidated N4S startup prompt document for future sessions.
- Build verified clean before each push.

---

## Next Session Start Prompt

```
Continue N4S development. Session context:

LAST SESSION (Feb 14, 2026): Created KYS PDF Report Generator.

COMPLETED:
1. New KYSReportGenerator.js — full N4S-branded PDF with cover page, executive summary,
   site info, 7-category scoring, deal-breaker analysis, recommendation, handoff notes,
   multi-site comparison
2. Export Report button added to KYS module header (smart: selected site or all sites)
3. Minor tweaks: removed Arvin attribution, added padding below category headings

CURRENT STATE:
- N4S Dashboard: ✅ Working at website.not-4.sale (Thornwood Estate loaded)
- LuXeBrief Portal: ✅ Working at thornwood-estate.luxebrief.not-4.sale (password: Kittyhawk90)
- All 4 KYC PDFs: ✅ Working
- KYS PDF Export: ✅ Working (deployed Feb 14)

ARCHITECTURE REMINDERS:
- N4S = Auto-deploy from GitHub (IONOS Deploy Now) to website.not-4.sale
- LuXeBrief = MANUAL deploy via SSH to VPS (74.208.250.22)
- PHP API = website.not-4.sale/api (NOT the Deploy Now URL)
- Pushing to LuXeBrief GitHub does NOTHING until SSH deploy

REMAINING ITR ITEMS (see docs/DATA-INTEGRITY-SF-AUDIT.md):
- ITR-1: FYI shows two different deltas — Low priority
- ITR-2: VMX manual SF entry not connected to FYI — Medium
- ITR-5: Circulation calculation alignment — Low
- ITR-6: Structure breakdown not shown in MVP Program Summary — Low
- n4sDatabase.ts footer still has old "Confidential" text
- Other 6 modules need data-pdf-card tagging for docs PDF system

LATEST COMMITS: 20298f8, c25b4f6

Start by: git clone repo, read docs/*.md, verify deploy status, then address new requests.
```
