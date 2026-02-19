# GID Phase 3 Handover: Discovery Screen

**Date:** February 19, 2026
**Status:** Ready for implementation
**Prerequisite:** Phase 1 (Registry CRUD) ✅ Phase 2 (Matching Engine) ✅

---

## Summary

Build the **Discovery** screen — an AI-assisted consultant sourcing tool that helps the LRA team find, evaluate, and import new consultants into the GID Registry. Discovery bridges the gap between an empty registry and useful match results by systematically identifying qualified professionals across the 5 data source tiers.

---

## Current State

### What Exists

| Asset | Status | Location |
|-------|--------|----------|
| Discovery tab button | Disabled, wired as `gid-screen-tab--disabled` | `GIDModule.jsx` line ~460 |
| DB: `gid_consultants` | Live, 36 columns incl. `source_of_discovery`, `source_attribution` | `api/gid-setup.php` |
| DB: `gid_portfolio_projects` | Live, full schema with features JSON | `api/gid-setup.php` |
| DB: `gid_sources` | Live but unused — tracks multiple sources per consultant | `api/gid-setup.php` |
| DB: `gid_engagements` | Live, Phase 2 shortlisting | `api/gid-setup.php` |
| API: `gid.php` | Entities: consultants, portfolio, reviews, stats, engagements | `api/gid.php` |
| Matching Algorithm | 6 dimensions, dual scoring, runs client-side | `utils/matchingAlgorithm.js` |
| AddConsultantForm | Full CRUD form for manual entry | `components/AddConsultantForm.jsx` |
| Documentation | Phase 3 referenced in Workflow tab (Step 2) | `GIDDocumentation.jsx` |

### What Doesn't Exist Yet

- `GIDDiscoveryScreen.jsx` — the Discovery screen component
- `api/gid.php?entity=discovery` — search/import API endpoints
- `gid_discovery_candidates` — staging table for unreviewed candidates
- Any AI/LLM integration for web discovery
- Any external API integration (AIA directory, Houzz, permit APIs)

---

## Architecture

### Screen Layout

```
┌─────────────────────────────────────────────────┐
│ [Search Bar] [Discipline ▼] [Source Tier ▼] [🔍] │
├─────────────────────────────────────────────────┤
│ Search Mode Tabs:                                │
│ [ Manual Search | AI Discovery | Import Queue ]  │
├─────────────────────────────────────────────────┤
│                                                   │
│  Results / Candidates list                        │
│  ┌─────────────────────────────────────────┐     │
│  │ Candidate Card                           │     │
│  │ Firm: ___  Location: ___  Source: Tier _ │     │
│  │ [Preview] [Add to Registry] [Dismiss]    │     │
│  └─────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────┐     │
│  │ ...                                      │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
├─────────────────────────────────────────────────┤
│ Import Queue: 3 candidates pending review         │
└─────────────────────────────────────────────────┘
```

### Three Sub-Modes

**1. Manual Search** — Team searches by name/firm/location, results show web data preview. Quick "Add to Registry" pre-fills the AddConsultantForm.

**2. AI Discovery** — Team enters criteria (discipline, geography, budget tier, style). AI returns a ranked list of candidates with source attribution. Team reviews each → approve/dismiss.

**3. Import Queue** — Staging area for candidates discovered but not yet reviewed. Supports batch review and bulk import.

---

## New Database Table

```sql
CREATE TABLE IF NOT EXISTS gid_discovery_candidates (
  id VARCHAR(36) PRIMARY KEY,
  discipline VARCHAR(50) NOT NULL COMMENT 'architect | interior_designer | pm | gc',
  firm_name VARCHAR(200) NOT NULL,
  principal_name VARCHAR(200),
  hq_city VARCHAR(100),
  hq_state VARCHAR(50),
  hq_country VARCHAR(100) DEFAULT 'USA',
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  specialties JSON DEFAULT NULL,
  service_areas JSON DEFAULT NULL,
  estimated_budget_tier VARCHAR(50) COMMENT 'ultra_luxury | luxury | high_end | mid_range',
  years_experience INT DEFAULT NULL,
  notable_projects JSON DEFAULT NULL COMMENT '[{name, location, year}]',
  awards JSON DEFAULT NULL COMMENT '[{name, year}]',
  publications JSON DEFAULT NULL COMMENT '[{publication, year, url}]',
  
  -- Source tracking
  source_tier INT NOT NULL COMMENT '1-5 per GID tier system',
  source_type VARCHAR(100) NOT NULL,
  source_url VARCHAR(500),
  source_name VARCHAR(255),
  discovery_query TEXT COMMENT 'The search query or AI prompt that found this candidate',
  confidence_score INT DEFAULT NULL COMMENT '0-100, AI confidence in relevance',
  
  -- Review workflow
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending | reviewing | approved | dismissed | imported',
  reviewed_by VARCHAR(100),
  review_notes TEXT,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Import tracking
  imported_consultant_id VARCHAR(36) DEFAULT NULL COMMENT 'FK to gid_consultants after import',
  imported_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Metadata
  discovered_by VARCHAR(100),
  project_context VARCHAR(100) COMMENT 'N4S project ID that triggered discovery, if any',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_discipline (discipline),
  INDEX idx_status (status),
  INDEX idx_source_tier (source_tier),
  INDEX idx_state (hq_state),
  INDEX idx_project (project_context),
  FOREIGN KEY (imported_consultant_id) REFERENCES gid_consultants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## New API Endpoints

Add to `api/gid.php` under `entity=discovery`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?entity=discovery` | List candidates (filter: status, discipline, source_tier, state) |
| GET | `?entity=discovery&id=UUID` | Single candidate detail |
| POST | `?entity=discovery` | Create candidate (from AI or manual search) |
| POST | `?entity=discovery&id=UUID&action=review` | Update status (approved/dismissed) + review notes |
| POST | `?entity=discovery&id=UUID&action=import` | Import to gid_consultants, set imported_consultant_id |
| POST | `?entity=discovery&action=ai_search` | Run AI discovery search (see AI Integration below) |
| GET | `?entity=discovery&action=queue_stats` | Count by status for queue badge |

### Import Logic

When `action=import`:
1. Read candidate record from `gid_discovery_candidates`
2. Create new `gid_consultants` row with mapped fields:
   - `firm_name`, `hq_city`, `hq_state`, `hq_country`, `website`, `linkedin_url`
   - `specialties`, `service_areas`, `years_experience`
   - `role` ← `discipline`
   - `verification_status` ← `'pending'`
   - `source_of_discovery` ← source_type
   - `source_attribution` ← JSON with source_tier, source_url, source_name, discovery_query
   - `first_name`, `last_name` ← parsed from `principal_name`
3. Create `gid_sources` row linking consultant to discovery source
4. Update candidate: `status='imported'`, `imported_consultant_id`, `imported_at`
5. Return new consultant ID

---

## New Files

### 1. `src/components/GID/screens/GIDDiscoveryScreen.jsx` (~600 lines)

**Structure:**
```
GIDDiscoveryScreen
├── DiscoveryToolbar (search input, discipline filter, source tier filter)
├── SubModeTabs (Manual Search | AI Discovery | Import Queue)
├── ManualSearchPanel
│   ├── Search results from web (firm name + location lookup)
│   └── "Quick Add" button → pre-fills AddConsultantForm
├── AIDiscoveryPanel
│   ├── Criteria form (discipline, geography, budget tier, style keywords)
│   ├── "Run Discovery" button
│   ├── Results list with CandidateCard components
│   └── Batch actions (approve selected, dismiss selected)
├── ImportQueuePanel
│   ├── Pending candidates list with review controls
│   ├── Candidate detail expand
│   ├── Approve → Import to Registry
│   └── Dismiss with notes
└── QueueBadge (count of pending candidates, shown on Discovery tab)
```

**Props:** None (reads from AppContext for project context)

**State:**
- `subMode`: 'manual' | 'ai' | 'queue'
- `candidates`: array from API
- `searchQuery`: string
- `disciplineFilter`: string
- `sourceTierFilter`: number | null
- `selectedCandidates`: Set of IDs for batch operations
- `aiCriteria`: { discipline, states[], budgetTier, styleKeywords[], limit }
- `aiSearching`: boolean
- `queueStats`: { pending, reviewing, approved, dismissed, imported }

### 2. `src/components/GID/components/CandidateCard.jsx` (~200 lines)

Displays a discovery candidate with:
- Firm name, principal name, location
- Source tier badge (color-coded 1-5)
- Confidence score bar (if AI-discovered)
- Notable projects list (collapsible)
- Awards/publications badges
- Action buttons: Preview | Approve | Dismiss | Import
- Status indicator (pending/reviewing/approved/dismissed/imported)

### 3. `src/components/GID/components/AIDiscoveryForm.jsx` (~250 lines)

Criteria input form for AI discovery:
- Discipline selector (4 buttons matching Phase 2 pattern)
- Geographic scope (state multi-select or "National")
- Budget tier selector (Ultra-Luxury $10M+ | Luxury $5-10M | High-End $2-5M | Mid-Range $1-2M)
- Style keywords (free-text tags or predefined list matching specialties)
- Number of results (5/10/20)
- "Run Discovery" button with loading state
- Previous searches history (last 5, clickable to re-run)

---

## AI Integration

### Option A: Server-Side AI (Recommended)

Create `api/gid-discovery-ai.php`:

```php
// POST /api/gid-discovery-ai.php
// Body: { discipline, states, budgetTier, styleKeywords, limit }
//
// 1. Build structured prompt from criteria
// 2. Call Anthropic API (Claude Sonnet) with system prompt
// 3. Parse structured response (JSON array of candidates)
// 4. Insert candidates into gid_discovery_candidates with status='pending'
// 5. Return candidate list
```

**System Prompt Template:**
```
You are a luxury residential consultant researcher for N4S (Not-4-Sale), 
an advisory platform serving ultra-high-net-worth families.

Find {limit} {discipline} firms matching these criteria:
- Geographic focus: {states}
- Budget tier: {budgetTier}  
- Style specialization: {styleKeywords}

For each firm, provide:
- firm_name (official business name)
- principal_name (lead partner/principal)
- hq_city, hq_state
- website URL
- specialties (array of style tags)
- years_experience (estimated)
- notable_projects (array of {name, location, year})
- awards (array of {name, year})
- publications (array of {publication, year})
- estimated_budget_tier
- confidence_score (0-100, your confidence this firm matches criteria)
- source_rationale (brief explanation of why this firm was identified)

Return ONLY a JSON array. Each entry must be a real, verifiable firm.
Do not fabricate firms. If you cannot find {limit} firms, return fewer.
```

**API Key:** Store Anthropic API key in `api/config.php` as `ANTHROPIC_API_KEY` constant. The PHP endpoint makes the call server-side — never expose the key to the frontend.

### Option B: Client-Side AI (Simpler, uses existing Anthropic API in artifacts)

Use the Anthropic API available in React artifacts to call Claude directly from the frontend. Less secure (API key handling) but faster to implement for MVP.

**Recommendation:** Start with Option A. The PHP endpoint keeps the API key secure and allows caching/rate-limiting.

---

## GIDModule.jsx Changes

1. **Enable Discovery tab:**
```jsx
// Change from:
<button className="gid-screen-tab gid-screen-tab--disabled" disabled title="Phase 3">
// To:
<button
  className={`gid-screen-tab ${viewMode === 'discovery' ? 'gid-screen-tab--active' : ''}`}
  onClick={() => { setViewMode('discovery'); setSelectedConsultant(null); }}
>
  <Search size={16} />
  Discovery
  {queueCount > 0 && <span className="gid-queue-badge">{queueCount}</span>}
</button>
```

2. **Add Discovery screen render:**
```jsx
{viewMode === 'discovery' && (
  <GIDDiscoveryScreen onImportComplete={loadConsultants} />
)}
```

3. **Fetch queue count on mount** for the badge.

---

## CSS Additions to GIDModule.css

- `.gid-discovery-*` prefixed classes
- `.gid-candidate-card` — similar to `.gid-consultant-card` but with source tier badge and confidence bar
- `.gid-source-tier-badge` — color-coded: T1 green, T2 blue, T3 navy, T4 muted, T5 gold
- `.gid-confidence-bar` — thin progress bar (0-100) below candidate card
- `.gid-queue-badge` — small count badge on Discovery tab (red circle, white text)
- `.gid-ai-form` — criteria input form layout
- `.gid-batch-actions` — floating bar when candidates are selected
- `.gid-import-preview` — modal/panel showing data that will be imported

---

## Workflow: Manual Search

1. User types firm name or "architects in Connecticut" in search bar
2. Frontend calls `web_search` equivalent OR a curated directory API
3. Results displayed as cards with firm name, location, website
4. User clicks "Quick Add" → redirected to AddConsultantForm with pre-filled data
5. Standard save flow creates consultant in registry

**Note:** For MVP, manual search can simply be a UI flow that helps the user fill out the AddConsultantForm faster. Full web scraping can come later.

---

## Workflow: AI Discovery

1. User selects criteria in AIDiscoveryForm
2. Clicks "Run Discovery"
3. Frontend POSTs to `/api/gid-discovery-ai.php`
4. PHP calls Claude API with structured prompt
5. Claude returns JSON array of candidates
6. PHP inserts each into `gid_discovery_candidates` with `status='pending'`
7. Returns candidate list to frontend
8. User sees results with confidence scores
9. User reviews each: Approve (→ Import Queue) or Dismiss
10. From Import Queue, user clicks "Import to Registry"
11. PHP creates `gid_consultants` record, links source

---

## Workflow: Import Queue

1. Shows all candidates with `status IN ('pending', 'reviewing', 'approved')`
2. For each candidate:
   - **Review** → Opens detail panel, user adds notes, marks approved/dismissed
   - **Import** → One-click: creates consultant + source records, shows success
   - **Dismiss** → Marks dismissed with notes, hidden from queue
3. Batch operations: select multiple → "Approve All" / "Dismiss All"
4. Queue count badge updates in real-time on Discovery tab

---

## Data Mapping: Candidate → Consultant

| Discovery Candidate Field | → | Consultant Field |
|--------------------------|---|-----------------|
| `discipline` | → | `role` |
| `firm_name` | → | `firm_name` |
| `principal_name` (parsed) | → | `first_name`, `last_name` |
| `hq_city` | → | `hq_city` |
| `hq_state` | → | `hq_state` |
| `hq_country` | → | `hq_country` |
| `website` | → | `website` |
| `linkedin_url` | → | `linkedin_url` |
| `specialties` | → | `specialties` |
| `service_areas` | → | `service_areas` |
| `years_experience` | → | `years_experience` |
| `estimated_budget_tier` | → | `min_budget`, `max_budget` (mapped from tier) |
| — | → | `verification_status = 'pending'` |
| `source_tier` + `source_type` | → | `source_of_discovery` |
| Full source JSON | → | `source_attribution` |
| — | → | `active = 1` |

**Budget tier mapping:**
- Ultra-Luxury: min=$10M, max=$50M+
- Luxury: min=$5M, max=$15M
- High-End: min=$2M, max=$8M
- Mid-Range: min=$1M, max=$3M

---

## Documentation Updates

Update `GIDDocumentation.jsx` Workflow tab:
- **Step 2: Discovery** — remove "(Phase 3)" label, mark as live
- Add detail on Manual Search vs AI Discovery vs Import Queue
- Add expandable section for AI Discovery criteria and source tiers

Update Reference tab:
- Add Discovery Candidate terminology
- Add Import workflow reference
- Add Source Tier color coding

---

## Testing Checklist

- [ ] Discovery tab enables and renders
- [ ] Manual search pre-fills AddConsultantForm
- [ ] AI Discovery form validates criteria before search
- [ ] AI search returns structured candidates
- [ ] Candidates appear in Import Queue
- [ ] Approve/Dismiss updates status correctly
- [ ] Import creates consultant with correct field mapping
- [ ] Import creates gid_sources record
- [ ] Imported candidate shows link to consultant
- [ ] Queue badge count updates on tab
- [ ] Duplicate detection: warn if firm_name + hq_state already exists in registry
- [ ] Error handling: AI timeout, API failure, empty results
- [ ] Build passes (`CI=false npm run build`)

---

## Deployment Notes

- New PHP file `api/gid-discovery-ai.php` needs Anthropic API key in `api/config.php`
- New DB table: run setup endpoint or add to `gid-setup.php`
- No new npm dependencies required (AI calls are server-side PHP + cURL)
- Standard push → GitHub Actions auto-deploy to both domains

---

## Future Enhancements (Not in Phase 3 Scope)

- **Web scraping integration** — Automated permit record lookups
- **Houzz/AIA directory APIs** — Direct data feeds
- **Duplicate detection** — Fuzzy matching on firm name + location
- **Discovery scheduling** — Periodic AI searches for new candidates
- **Source verification** — Automated website/LinkedIn validation
- **Portfolio auto-population** — Scrape project galleries from firm websites
