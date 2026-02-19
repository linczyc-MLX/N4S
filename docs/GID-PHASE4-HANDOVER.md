# GID Phase 4 — Client-Profile-Aware Discovery

## Overview

Phase 3 shipped the Discovery screen with AI-powered consultant sourcing (Manual Search, AI Discovery, Import Queue). The AI prompt currently uses **only the criteria selected manually in the Discovery form** (discipline, states, budget tier, style keywords). It has zero awareness of the client's actual profile data from KYC, FYI, or Taste Exploration.

Phase 4 adds a **"Use Client Profile"** toggle to the AI Discovery form. When enabled, the form auto-populates from the active client's KYC/FYI data and the AI prompt is enriched with the full design identity, budget, geographic, lifestyle, and space program context. When disabled, the form works exactly as it does today — pure manual selection for exploratory/unexpected matches.

The existing `matchingAlgorithm.js` already scores consultants against the full client profile (6 dimensions, dual Client Fit / Project Fit scoring). Phase 4 brings that same intelligence into the Discovery search prompt.

---

## Architecture

### Current State (Phase 3)

```
AIDiscoveryForm (manual selections)
    → GIDDiscoveryScreen.runAISearch(criteria)
        → Anthropic API (generic prompt)
            → Save candidates to gid_discovery_candidates
```

### Target State (Phase 4)

```
AIDiscoveryForm
    ├── [Toggle OFF] Manual selections → generic AI prompt (unchanged)
    └── [Toggle ON]  Auto-fill from AppContext → enriched AI prompt
            │
            ├── KYC: projectCity/State, totalProjectBudget, designIdentity (7 taste axes),
            │        architectureStyleTags, interiorStyleTags, materialAffinities,
            │        entertainingStyle, wellnessPriorities, privacyLevel
            │
            ├── FYI: included spaces, target SF, specialty features
            │
            └── Taste: principalTasteResults (if completed)
                       → derived style keywords via TASTE_STYLE_MAP
```

---

## Data Sources — What to Pull from Client Profile

### From `kycData.principal`

| Field Path | Use in Discovery | Maps To |
|---|---|---|
| `projectParameters.projectCity` | Extract state → Geographic Focus | Auto-select states |
| `projectParameters.projectCountry` | Context for international | AI prompt context |
| `projectParameters.propertyType` | Filter context | AI prompt: "luxury estate" vs "penthouse" |
| `projectParameters.targetGSF` | Scale indicator | AI prompt: project scale |
| `budgetFramework.totalProjectBudget` | Budget tier derivation | Auto-select budget tier |
| `designIdentity.axisContemporaryTraditional` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.axisMinimalLayered` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.axisWarmCool` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.axisOrganicGeometric` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.axisRefinedEclectic` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.axisArchMinimalOrnate` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.axisArchRegionalInternational` | Style keyword derivation | Via TASTE_STYLE_MAP |
| `designIdentity.architectureStyleTags` | Direct style keywords | Merge into style keywords |
| `designIdentity.interiorStyleTags` | Direct style keywords | Merge into style keywords |
| `designIdentity.materialAffinities` | Material context | AI prompt enrichment |
| `designIdentity.materialAversions` | Negative signal | AI prompt: "avoid firms known for..." |
| `designIdentity.massingPreference` | Architectural context | AI prompt enrichment |
| `designIdentity.roofFormPreference` | Architectural context | AI prompt enrichment |
| `designIdentity.structuralAmbition` | Complexity signal | AI prompt enrichment |
| `lifestyleLiving.entertainingFrequency` | Lifestyle context | AI prompt: "large-scale entertaining" |
| `lifestyleLiving.wellnessPriorities` | Specialty signal | AI prompt: "wellness-focused design" |
| `lifestyleLiving.indoorOutdoorLiving` | Design approach | AI prompt enrichment |

### From `fyiData`

| Field Path | Use in Discovery | Maps To |
|---|---|---|
| `fyiData.selections` (included spaces) | Feature specialization context | AI prompt: "experience with home theaters, wine cellars, etc." |
| `fyiData.settings.targetSF` | Scale context | AI prompt: "projects in the X SF range" |

### From Taste Exploration

| Field Path | Use in Discovery | Maps To |
|---|---|---|
| `designIdentity.principalTasteResults` | Refined taste profile | Override axis values if present |

---

## Budget Tier Derivation Logic

```javascript
function deriveBudgetTier(totalProjectBudget) {
  const budget = Number(totalProjectBudget) || 0;
  if (budget >= 10000000) return 'ultra_luxury';  // $10M+
  if (budget >= 5000000)  return 'luxury';         // $5M–$15M
  if (budget >= 2000000)  return 'high_end';       // $2M–$8M
  if (budget >= 1000000)  return 'mid_range';      // $1M–$3M
  return null; // Don't auto-select if below $1M
}
```

---

## Style Keyword Derivation Logic

Reuse the existing `TASTE_STYLE_MAP` from `matchingAlgorithm.js`:

```javascript
import { TASTE_STYLE_MAP } from '../utils/matchingAlgorithm'; // Export this

function deriveStyleKeywords(designIdentity) {
  const keywords = new Set();

  // From taste axes
  Object.entries(TASTE_STYLE_MAP).forEach(([axisKey, mapping]) => {
    const value = designIdentity?.[axisKey];
    if (value == null) return;
    let styles;
    if (value <= 3)       styles = mapping.low;
    else if (value >= 7)  styles = mapping.high;
    else                  styles = mapping.mid;
    styles.forEach(s => keywords.add(s));
  });

  // From direct style tags
  (designIdentity?.architectureStyleTags || []).forEach(t => keywords.add(t));
  (designIdentity?.interiorStyleTags || []).forEach(t => keywords.add(t));

  return Array.from(keywords);
}
```

---

## State Extraction Logic

Reuse the existing `extractState()` function from `matchingAlgorithm.js` (currently internal — needs to be exported):

```javascript
// Already exists in matchingAlgorithm.js lines 514-547
// Contains UHNW market city mappings (Greenwich→CT, Palm Beach→FL, etc.)
export function extractState(cityStr, country) { ... }
```

---

## Component Changes

### 1. AIDiscoveryForm.jsx — Add "Use Client Profile" Toggle

**New props:**
```javascript
// AIDiscoveryForm receives:
{
  kycData,          // from AppContext
  fyiData,          // from AppContext
  onSearchSubmit,   // existing
  searching,        // existing
  recentSearches,   // existing
}
```

**New state:**
```javascript
const [useClientProfile, setUseClientProfile] = useState(false);
const [profileLoaded, setProfileLoaded] = useState(false);
```

**Toggle UI spec:**
- Position: Top of the AI Discovery form, above the DISCIPLINE section
- Design: A horizontal bar with a toggle switch
- Label: "Use Client Profile" with a Users icon
- Subtitle when ON: "Search criteria derived from [Client Name]'s KYC & FYI data"
- Subtitle when OFF: "Manual search — select your own criteria"
- Visual: When ON, show a navy-bordered info box listing what data was pulled (project city, budget, N style keywords derived)
- Behavior: When toggled ON, auto-fill the form fields. When toggled OFF, clear auto-filled values and revert to manual defaults.

**Auto-fill behavior when toggled ON:**
1. Extract state from `projectParameters.projectCity` → auto-select in Geographic Focus
2. Derive budget tier from `budgetFramework.totalProjectBudget` → auto-select Budget Tier
3. Derive style keywords from taste axes + style tags → populate Style Keywords
4. Show a "Profile Summary" info box:
   - "Project: [city], [state] | Budget: $[X]M | [N] style signals detected"
   - "Spaces: [list of included FYI spaces]"
5. All auto-filled fields remain editable (user can add/remove states, keywords, etc.)

**Prerequisite check:**
- If `checkMatchPrerequisites(kycData, fyiData).ready === false`, show the toggle as disabled with tooltip: "Complete KYC Project City and Budget to enable profile-based search"

### 2. GIDDiscoveryScreen.jsx — Enriched AI Prompt

When `useClientProfile` is true, the `runAISearch` function builds an enriched system prompt that includes:

```
ENRICHED CLIENT CONTEXT (when "Use Client Profile" is active):
─────────────────────────────────────────────────────────────
Project Location: Greenwich, CT
Property Type: Estate
Target Size: 18,500 SF
Total Project Budget: $12,000,000
Budget Tier: Ultra-Luxury

Design Identity (Taste Axes — scale 1-10):
  Contemporary ←→ Traditional: 7 (leans traditional)
  Minimal ←→ Layered: 4 (leans minimal)
  Warm ←→ Cool: 8 (warm)
  Organic ←→ Geometric: 3 (organic/natural)
  Refined ←→ Eclectic: 4 (refined)
  Arch Minimal ←→ Ornate: 6 (moderate ornament)
  Regional ←→ International: 3 (regional/contextual)

Architecture Style Tags: [Colonial, Shingle Style, Georgian]
Interior Style Tags: [Traditional, Transitional, Warm]
Material Affinities: [Natural stone, Reclaimed wood, Bronze hardware]
Material Aversions: [High-gloss lacquer, Polished chrome]
Massing Preference: Compound/estate
Roof Form: Pitched/gabled
Structural Ambition: Moderate

Lifestyle Signals:
  Entertaining: Frequent, 20+ guests
  Wellness: Pool, gym, spa bathroom
  Indoor-Outdoor: High priority (8/10)
  Privacy: High (8/10)

Space Program (from FYI):
  Included: Primary Suite, 3 Guest Suites, Chef's Kitchen, Butler's Pantry,
  Great Room, Library, Home Theater, Wine Cellar, Pool House, 4-Car Garage
  Target SF: 18,500

MATCHING PRIORITY:
Find firms whose portfolio demonstrates ALIGNMENT with this specific client's
design identity — not just the style keywords, but the full sensibility
(warmth level, material language, massing approach, lifestyle integration).
Prioritize firms with verified luxury residential experience at $10M+ scale
in the Northeast corridor.
```

### 3. matchingAlgorithm.js — Exports

Add exports for reuse in Discovery:
- `export { TASTE_STYLE_MAP }` (currently just a const)
- `export function extractState(...)` (currently internal)
- `export function deriveStyleKeywords(designIdentity)` (new helper)
- `export function deriveBudgetTier(totalBudget)` (new helper)

### 4. GIDDiscoveryScreen.jsx — Props Threading

```jsx
// In GIDDiscoveryScreen component:
const { kycData, fyiData } = useAppContext();

// Pass to AIDiscoveryForm:
<AIDiscoveryForm
  kycData={kycData}
  fyiData={fyiData}
  onSearchSubmit={handleAISearch}
  searching={aiSearching}
  recentSearches={recentSearches}
/>
```

---

## CSS Changes

### New styles needed in GIDModule.css:

- `.gid-profile-toggle` — Horizontal toggle bar (navy border when active, muted when inactive)
- `.gid-profile-toggle__switch` — Toggle switch component
- `.gid-profile-toggle__info` — Info box showing derived data summary
- `.gid-profile-toggle--disabled` — Grayed out state when prerequisites not met
- `.gid-profile-badge` — Small badge on auto-filled form fields ("From KYC" / "From FYI")
- Responsive: toggle stacks vertically on mobile

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/GID/components/AIDiscoveryForm.jsx` | Add toggle, auto-fill logic, profile summary box |
| `src/components/GID/screens/GIDDiscoveryScreen.jsx` | Pass kycData/fyiData, enrich AI prompt when profile active |
| `src/components/GID/utils/matchingAlgorithm.js` | Export TASTE_STYLE_MAP, extractState, add helper functions |
| `src/components/GID/GIDModule.css` | Profile toggle styles, auto-fill badge styles |

No backend changes required — all logic is client-side.

---

## Implementation Order

1. **matchingAlgorithm.js** — Add exports and new helper functions (deriveStyleKeywords, deriveBudgetTier)
2. **AIDiscoveryForm.jsx** — Add toggle UI, auto-fill logic, profile summary, prerequisite check
3. **GIDDiscoveryScreen.jsx** — Thread kycData/fyiData props, build enriched AI prompt builder
4. **GIDModule.css** — Toggle and badge styles
5. **Test** — Verify toggle ON auto-fills correctly, toggle OFF clears, enriched prompt produces better results

---

## Testing Checklist

- [ ] Toggle disabled when KYC project city or budget not set
- [ ] Toggle ON auto-fills state from project city
- [ ] Toggle ON derives correct budget tier from total budget
- [ ] Toggle ON generates style keywords from all 7 taste axes
- [ ] Toggle ON includes architecture/interior style tags
- [ ] Auto-filled fields remain editable
- [ ] Toggle OFF clears all auto-filled values
- [ ] Profile summary box shows correct data
- [ ] Enriched AI prompt includes full client context
- [ ] AI results with profile ON are more targeted than without
- [ ] Manual mode (toggle OFF) works unchanged from Phase 3
- [ ] Build passes: CI=false npm run build

---

## Key File References

- **Matching Algorithm**: `src/components/GID/utils/matchingAlgorithm.js` — TASTE_STYLE_MAP (lines 80-116), checkMatchPrerequisites (lines 127-188), extractState (lines 514-547)
- **AppContext data**: `src/contexts/AppContext.jsx` — designIdentity (line 48), budgetFramework (line 43), projectParameters (line 36), fyiData (line 346)
- **AI Discovery Form**: `src/components/GID/components/AIDiscoveryForm.jsx` (302 lines)
- **Discovery Screen**: `src/components/GID/screens/GIDDiscoveryScreen.jsx` (699 lines) — runAISearch starts at line ~87
- **Discovery CSS**: `src/components/GID/GIDModule.css` — Discovery styles start after `.gid-registry` section
- **AI Config Endpoint**: `api/gid-ai-config.php` — returns API key from config-secrets.php
- **Brand Guide**: `docs/N4S-BRAND-GUIDE.md` — always read before creating UI

---

## Session Setup

```bash
git config --global http.proxy "$HTTPS_PROXY"
git -c http.proxyAuthMethod=basic clone https://github.com/linczyc-MLX/N4S.git
cd N4S
npm install
cat docs/N4S-BRAND-GUIDE.md
cat docs/GID-PHASE4-HANDOVER.md
```

---

## Notes

- The `anthropic-dangerous-direct-browser-access` header is required for client-side Anthropic API calls
- API key is served from `api/gid-ai-config.php` → reads `api/config-secrets.php` (FTP only, gitignored)
- IONOS shared hosting blocks outbound cURL from PHP — that's why AI calls are client-side
- The Discovery table `gid_discovery_candidates` is already live with all needed fields
- Phase 3 duplicate detection works against both discovery table AND registry — no changes needed
