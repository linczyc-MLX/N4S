# BYT (Build Your Team) — Admin Panel & Standalone Architecture Spec

**Date:** 2026-02-21 (Revised)
**Author:** Claude (for Michael Linczyc, MLX Consulting)
**Status:** DRAFT — Awaiting review before implementation
**Addresses:** ITR-7 (BYOK API Marketplace), ITR-8 (Discovery Data Quality), Standalone Extraction

---

## 1. STRATEGIC CONTEXT

BYT is the most self-contained module in N4S. Its data model (consultants, engagements, discovery queue, RFQ responses, scoring) already lives in its own PHP endpoints and VPS database. Its only dependencies on the broader N4S platform are:

1. **Project context** — location, budget, style preferences (from KYC + FYI)
2. **API keys** — Anthropic (for AI discovery), RFQ admin key (hardcoded)
3. **User identity / permissions** — from N4S session

To support standalone deployment, all admin configuration must live **within BYT itself** — not in the N4S Settings module. This spec defines the BYT Admin Panel as an internal configuration surface that makes the module fully self-governing.

---

## 2. CONFIGURATION INHERITANCE MODEL

### The Core Principle

Every configurable setting in BYT exists at two levels:

| Level | Scope | Persistence | Who Sets It |
|-------|-------|-------------|-------------|
| **Global Defaults** | All projects, all clients | `byt_global_config` table | Platform admin (Michael / LRA team) |
| **Project Overrides** | Current project only | `bytData.adminConfig` in project_data JSONB | Advisor working on specific engagement |

**Inheritance rule:** Project-level settings inherit from global defaults. An override at project level takes precedence. Clearing a project override reverts to the global default.

### Visual Pattern in Admin Panel

The Admin tab uses **two sub-tabs** at the top:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙ Admin                                                    │
│                                                              │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │  Global Defaults  │ │  This Project    │                  │
│  └──────────────────┘ └──────────────────┘                  │
│                                                              │
│  ...cards below change based on which sub-tab is active...   │
└─────────────────────────────────────────────────────────────┘
```

**Global Defaults sub-tab:** Shows all settings with their global values. Changes here propagate to every project that hasn't overridden that setting.

**This Project sub-tab:** Shows settings with inheritance indicators:
- **Inherited** (grey text, dotted border) — Using the global default. Hover shows "Using global default: [value]"
- **Overridden** (active text, solid border, blue dot indicator) — Project-specific value. Shows "Reset to Default" link.
- **Project-only** (normal styling) — Settings that only exist at project level (e.g., Project Brief)

```
Example: Scoring Weights — Project sub-tab

  Capability Coverage   ████████████████████  20%  ← Inherited
  Scale Match           ███████████████       15%  ← Inherited
  Geographic Alignment  ██████████████        13%  ● Overridden [Reset to Default]
  ...
```

### Classification of Every Setting

| Setting | Global | Project | Notes |
|---------|--------|---------|-------|
| **API CONNECTIONS** | | | |
| Anthropic API key | ✓ | — | Account-level, one key for all projects |
| Anthropic model | ✓ | ✓ | Global default, project can use different model |
| RFQ admin API key | ✓ | — | Account-level |
| RFQ API endpoint | ✓ | — | Infrastructure-level |
| Dodge API key | ✓ | — | Account-level subscription |
| Building Radar API key | ✓ | — | Account-level subscription |
| Permit API endpoints | ✓ | — | Account-level |
| **DISCOVERY** | | | |
| Discipline guidance (Architect) | ✓ | ✓ | Global methodology, project can tune |
| Discipline guidance (Interior Designer) | ✓ | ✓ | Same |
| Discipline guidance (PM/Owner's Rep) | ✓ | ✓ | Same |
| Discipline guidance (General Contractor) | ✓ | ✓ | Same |
| Exemplar firms per discipline | ✓ | ✓ | Global anchors + project-specific regional firms |
| Exclusion list | ✓ | ✓ | Global exclusions + project-specific conflicts |
| Confidence threshold | ✓ | ✓ | Global default, thin markets may lower |
| Results per search | ✓ | ✓ | — |
| Auto-import behavior | ✓ | ✓ | — |
| Source attribution required | ✓ | — | Methodology-level, always enforced |
| Max discovery queue size | ✓ | — | Platform capacity setting |
| **SCORING** | | | |
| Dimension weights (10 dimensions) | ✓ | ✓ | Global methodology, project can emphasize differently |
| Match tier thresholds | ✓ | ✓ | Thin market = lower thresholds |
| Per-discipline weight overrides | ✓ | ✓ | — |
| Quantitative/Qualitative split | ✓ | ✓ | Default 80/20, adjustable |
| **RFQ** | | | |
| Default deadline (days) | ✓ | ✓ | Global default, urgent project can shorten |
| Cover letter variant | ✓ | ✓ | Global standard, project can personalize |
| Reminder settings | ✓ | ✓ | — |
| Auto-expire invitations | ✓ | ✓ | — |
| Portal branding (logo, accent) | ✓ | ✓ | Client-specific branding per project |
| Minimum portfolio projects | ✓ | ✓ | — |
| **PIPELINE** | | | |
| Stage labels | ✓ | ✓ | Global terminology, project can customize |
| Optional stages | ✓ | ✓ | — |
| **PROJECT-ONLY** | | | |
| Project Brief | — | ✓ | Only exists at project level |
| Data Management actions | — | ✓ | Per-project archive/export |

### Merge Behavior for List Settings

Exclusion lists and exemplar firm lists use an **additive merge** pattern:

```
Effective exclusion list = Global exclusions ∪ Project exclusions
Effective exemplar firms = Global exemplars ∪ Project exemplars
```

The project sub-tab shows the merged list with provenance indicators:
- `Turner Construction` (Global) — cannot be removed at project level
- `Smith & Associates` (This Project) — can be removed at project level

If an advisor needs to UN-exclude a globally excluded firm for a specific project, there is a project-level "Allow despite global exclusion" override list. This should be rare.

---

## 3. BYT MODULE TAB STRUCTURE (REVISED)

```
Tab 1: Registry          — Consultant database (unchanged)
Tab 2: Discovery         — AI-powered sourcing (unchanged)
Tab 3: Shortlist         — Curation + RFQ dispatch (unchanged)
Tab 4: Matchmaking       — Deep scoring from RFQ responses (unchanged)
Tab 5: Synergy Sandbox   — Team combination testing (unchanged)
Tab 6: Admin ⚙           — Configuration, API keys, scoring weights, data management
```

The Admin tab uses the gear icon (Settings2 from lucide-react). Access is role-gated: only admin users see this tab. In standalone mode, all users with login access see it.

---

## 4. ADMIN PANEL — SECTION BREAKDOWN

### 4.1 PROJECT BRIEF (Project-Only)

**Current state:** BYT reads project context from `kycData` and `fyiData` via AppContext:
- `kycData.principal.projectParameters.projectCity` → geographic alignment scoring
- `kycData.principal.portfolioContext.estimatedBudget` → alignment badges
- `kycData.principal.budgetFramework.totalProjectBudget` → budget tier, scale matching
- `kycData.principal.designIdentity` → taste axes, style keywords (Discovery prompt enrichment)
- `kycData.principal.lifestyleLiving` → lifestyle context
- `fyiData.selections` → included spaces list (Discovery + RFQ Section 5)
- `fyiData.settings.targetSF` → target square footage
- `fyiData.budgetRange.constructionBudget` → alignment badges

**This card only appears on the "This Project" sub-tab.** It has no global equivalent — project context is inherently per-project.

**N4S mode:** Card displays read-only values pulled from KYC/FYI with a badge: "Auto-populated from KYC/FYI". Each field shows its source module.

**Standalone mode:** Fields become editable inputs. This is the only data entry needed to run BYT independently.

| Field | Type | Source (N4S mode) | Required |
|-------|------|-------------------|----------|
| Project Name | Text | projectData.projectName | Yes |
| Project City | Text | kycData...projectCity | Yes (scoring) |
| Project State | Text | Derived from projectCity | Yes (scoring) |
| Total Project Budget | Currency | kycData...totalProjectBudget | Yes (scoring) |
| Construction Budget | Currency | fyiData.budgetRange.constructionBudget | No |
| Target SF | Number | fyiData.settings.targetSF | No |
| Property Type | Select | kycData...propertyType | No |
| Style Keywords | Tags | Derived from designIdentity taste axes | No |
| Included Spaces | Checklist | fyiData.selections (included=true) | No |

**Architecture:** All BYT screens read project context through a single abstraction:

```js
// New: src/components/BYT/utils/projectContext.js
export function getProjectContext(appContext) {
  // If BYT Admin has manual overrides, use those
  const overrides = appContext.bytData?.projectBrief || {};
  // Otherwise derive from KYC/FYI
  return {
    projectName: overrides.projectName || appContext.projectData?.projectName || '',
    projectCity: overrides.projectCity || appContext.kycData?.principal?.projectParameters?.projectCity || '',
    totalBudget: overrides.totalBudget || Number(appContext.kycData?.principal?.budgetFramework?.totalProjectBudget) || 0,
    constructionBudget: overrides.constructionBudget || Number(appContext.fyiData?.budgetRange?.constructionBudget) || 0,
    targetSF: overrides.targetSF || appContext.fyiData?.settings?.targetSF || null,
    propertyType: overrides.propertyType || appContext.kycData?.principal?.projectParameters?.propertyType || '',
    styleKeywords: overrides.styleKeywords || deriveStyleKeywords(appContext.kycData?.principal?.designIdentity),
    includedSpaces: overrides.includedSpaces || deriveIncludedSpaces(appContext.fyiData),
    source: Object.keys(overrides).length > 0 ? 'manual' : 'n4s',
  };
}
```

All Discovery, Match, Shortlist, and Matchmaking screens import `getProjectContext()` instead of reading kycData/fyiData directly. This is the single extraction point for standalone mode.

---

### 4.2 API CONNECTIONS (Global-Only — ITR-7: BYOK API Marketplace)

**This card only appears on the "Global Defaults" sub-tab.** API keys are account-level resources shared across all projects.

**Current state:**

| Service | Key Location | Problem |
|---------|-------------|---------|
| Anthropic (AI Discovery) | `byt-ai-config.php` on FTP server | Server-side, secure, but not user-configurable |
| RFQ Admin API | Hardcoded in `rfqApi.js` | Exposed in client-side source |
| Dodge Construction | Not integrated | — |
| Building Radar | Not integrated | — |
| Permit APIs | Not integrated | — |
| LinkedIn Sales Nav | Not integrated | — |

**Admin Panel UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  API CONNECTIONS                                 Global      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ AI Discovery (Anthropic Claude)                         │
│  ┌──────────────────────────────────────────────┐           │
│  │ API Key: sk-ant-••••••••••••••••4a2f  [Test] │           │
│  │ Default Model: claude-sonnet-4-20250514       │           │
│  │ Status: Connected ✓  Last used: 2 hours ago   │           │
│  │ Usage this month: 847 calls / ~$12.40         │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ✅ RFQ Scoring Engine                                      │
│  ┌──────────────────────────────────────────────┐           │
│  │ API Key: ••••••••••••••••••••3424a    [Test] │           │
│  │ Endpoint: https://rfq.not-4.sale/api          │           │
│  │ Status: Connected ✓  Last ping: 30s ago       │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ○ Dodge Construction Network           [Configure →]       │
│  ○ Building Radar                       [Configure →]       │
│  ○ Public Permit APIs                   [Configure →]       │
│  ○ LinkedIn Sales Navigator             [Configure →]       │
│                                                              │
│  + Add Custom Data Source                                    │
└─────────────────────────────────────────────────────────────┘
```

**Key management architecture:**

1. **In N4S mode (IONOS):** Keys stored server-side in PHP config. Admin Panel reads key status (masked) via `gid.php?entity=admin_config&action=status`. Updates via `gid.php?entity=admin_config&action=update`. PHP encrypts keys in database (AES-256) with server-side secret.

2. **In standalone mode:** Keys stored in PostgreSQL on VPS with column-level encryption. Admin UI writes directly to BYT API backend.

3. **Key validation flow:** On save, the Admin Panel calls a test endpoint which makes a minimal API call to verify the key works.

**Tiered access model (future SaaS):**

| Tier | AI Discovery | RFQ Portal | Scoring Engine | External APIs |
|------|-------------|------------|----------------|---------------|
| Starter | Platform key (shared) | ✓ | ✓ | — |
| Professional | BYOK or platform | ✓ | ✓ | Dodge, Permits |
| Enterprise | BYOK required | ✓ | ✓ | All + LinkedIn |

**Implementation sequence:**
1. Move Anthropic key from byt-ai-config.php to Admin Panel with encrypted DB storage
2. Move RFQ admin key from hardcoded to Admin Panel
3. Later: Add Dodge/Building Radar connectors
4. Later: Add permit API connectors (city-specific, Socrata-based)
5. Future: LinkedIn Sales Navigator (requires OAuth flow)

---

### 4.3 DISCOVERY SETTINGS (Global + Project Override — ITR-8)

**Current state:** Discipline-specific guidance is hardcoded in `BYTDiscoveryScreen.jsx` (function `getDisciplineGuidance()`). Exemplar firms are embedded in prompt text. No admin-editable exclusion lists.

#### Global Defaults sub-tab

Sets the methodology baseline that applies to every project:

```
┌─────────────────────────────────────────────────────────────┐
│  DISCOVERY SETTINGS                              Global      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DEFAULT AI MODEL: [claude-sonnet-4-20250514 ▾]             │
│  Default results per search: [8 ▾]                           │
│  Default confidence threshold: [50 ▾]                        │
│  Source attribution required: [Yes ▾]  (enforced globally)   │
│  Max discovery queue size: [100 ▾]                           │
│  Auto-import behavior: [Require Review ▾]                    │
│                                                              │
│  ▼ Architect Guidance (Default)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Search for licensed architecture firms (AIA members   │   │
│  │ preferred) with a demonstrated luxury residential     │   │
│  │ portfolio...                                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  [Reset to Factory Default]                                  │
│                                                              │
│  ▶ Interior Designer Guidance (Default)                     │
│  ▶ PM / Owner's Rep Guidance (Default)                      │
│  ▶ General Contractor Guidance (Default)                    │
│                                                              │
│  GLOBAL EXEMPLAR FIRMS (calibration anchors for AI)         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PM: Plus Development, CPM Link Enterprises            │ ✎ │
│  │ GC: (none configured)                                 │ ✎ │
│  │ Arch: (none configured)                               │ ✎ │
│  │ ID: (none configured)                                 │ ✎ │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  GLOBAL EXCLUSION LIST (never suggest on any project)       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Turner Construction, Skanska, Toll Brothers, Lennar   │ ✎ │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### This Project sub-tab

Shows inherited values with override capability:

```
┌─────────────────────────────────────────────────────────────┐
│  DISCOVERY SETTINGS                          This Project    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  AI Model: claude-sonnet-4-20250514         ← Inherited     │
│            [Override for this project ▾]                      │
│  Results per search: 8                       ← Inherited     │
│  Confidence threshold: 40  ● Overridden     [Reset]         │
│  (Thin market in this region — lowered from global 50)       │
│                                                              │
│  ▼ Architect Guidance                                       │
│  Status: ← Using Global Default                              │
│  [Customize for this project]                                │
│                                                              │
│  ▼ PM / Owner's Rep Guidance                                │
│  Status: ● Project Override Active          [Reset]         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Global guidance text]                                │   │
│  │ + PROJECT ADDITION: Focus on firms with Florida       │   │
│  │ coastal construction experience and hurricane-rated   │   │
│  │ structural expertise...                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ADDITIONAL EXEMPLAR FIRMS (project-specific)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ GC: Onshore Construction (Palm Beach specialist)      │ ✎ │
│  └──────────────────────────────────────────────────────┘   │
│  Global exemplars also included:                             │
│  PM: Plus Development, CPM Link Enterprises  (Global)        │
│                                                              │
│  ADDITIONAL EXCLUSIONS (project-specific)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Smith & Associates (conflict of interest)             │ ✎ │
│  └──────────────────────────────────────────────────────┘   │
│  Global exclusions also enforced:                            │
│  Turner, Skanska, Toll Brothers, Lennar  (Global)            │
│                                                              │
│  ALLOW DESPITE GLOBAL EXCLUSION (rare)                      │
│  (empty — no overrides)                                      │
└─────────────────────────────────────────────────────────────┘
```

**Merge logic for Discovery execution:**

```js
function getEffectiveDiscoveryConfig(globalConfig, projectConfig) {
  return {
    model: projectConfig?.model || globalConfig.model,
    confidenceThreshold: projectConfig?.confidenceThreshold ?? globalConfig.confidenceThreshold,
    resultsPerSearch: projectConfig?.resultsPerSearch ?? globalConfig.resultsPerSearch,

    // Guidance: project override replaces global if set
    disciplineGuidance: {
      architect: projectConfig?.disciplineGuidance?.architect || globalConfig.disciplineGuidance.architect,
      interior_designer: projectConfig?.disciplineGuidance?.interior_designer || globalConfig.disciplineGuidance.interior_designer,
      pm: projectConfig?.disciplineGuidance?.pm || globalConfig.disciplineGuidance.pm,
      gc: projectConfig?.disciplineGuidance?.gc || globalConfig.disciplineGuidance.gc,
    },

    // Lists: additive merge
    exemplarFirms: mergeLists(globalConfig.exemplarFirms, projectConfig?.exemplarFirms),
    exclusionList: mergeExclusions(globalConfig.exclusionList, projectConfig?.exclusionList, projectConfig?.allowDespiteGlobal),
  };
}
```

---

### 4.4 SCORING CONFIGURATION (Global + Project Override)

**Current state:** 10 scoring dimensions with hardcoded weights in `BYTMatchmakingScreen.jsx`.

#### Global Defaults sub-tab

```
┌─────────────────────────────────────────────────────────────┐
│  SCORING CONFIGURATION                           Global      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DEFAULT DIMENSION WEIGHTS (must total 100%)  Total: 100%   │
│                                                              │
│  Capability Coverage   ████████████████████  20%    [─●──]  │
│  Scale Match           ███████████████       15%    [──●─]  │
│  Portfolio Relevance   ███████████████       15%    [──●─]  │
│  Geographic Alignment  ██████████            10%    [─●──]  │
│  Financial Resilience  ██████████            10%    [─●──]  │
│  Philosophy Alignment  ██████████            10%    [─●──]  │
│  Tech Compatibility    █████                  5%    [●───]  │
│  Credentials           █████                  5%    [●───]  │
│  Methodology Fit       █████                  5%    [●───]  │
│  Collaboration Maturity █████                 5%    [●───]  │
│                                                              │
│  [Reset to Factory Defaults]                                 │
│                                                              │
│  DEFAULT MATCH TIER THRESHOLDS                               │
│  Top Match:         [80] and above                           │
│  Good Fit:          [60] to 79                               │
│  Consider:          [40] to 59                               │
│  Below Threshold:   below 40                                 │
│                                                              │
│  QUANTITATIVE / QUALITATIVE SPLIT                            │
│  Quantitative: [80]%    Qualitative: [20]%                   │
│                                                              │
│  ☐ Enable per-discipline weight profiles (default off)      │
└─────────────────────────────────────────────────────────────┘
```

#### This Project sub-tab

```
┌─────────────────────────────────────────────────────────────┐
│  SCORING CONFIGURATION                       This Project    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DIMENSION WEIGHTS              Total: 100%                  │
│  ☐ Override weights for this project                        │
│                                                              │
│  Capability Coverage   ████████████████████  20%  ← Inherited│
│  Scale Match           ███████████████       15%  ← Inherited│
│  Geographic Alignment  ██████████████        13%  ● Override │
│  ...                                                         │
│  (Checking the override box enables the sliders)             │
│                                                              │
│  MATCH TIER THRESHOLDS                                       │
│  ☐ Override thresholds for this project                     │
│  Using global: Top Match 80+ / Good Fit 60+ / Consider 40+  │
│                                                              │
│  Rationale (optional note):                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Coastal FL market has fewer UHNW-caliber PMs —       │   │
│  │ lowered geographic weight, raised capability weight   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

The rationale field is optional but valuable — it documents why an advisor deviated from the global methodology for this engagement. This appears in reports and handover documents.

---

### 4.5 RFQ CONFIGURATION (Global + Project Override)

#### Global Defaults sub-tab

| Setting | Type | Default |
|---------|------|---------|
| Default response deadline | Days from dispatch | 14 days |
| Cover letter variant | Select: Standard / Personal / Formal | Standard |
| Reminder email | Toggle + days before deadline | On, 3 days |
| Auto-expire invitations | Toggle | Off |
| Portal branding — Logo | URL | N4S logo |
| Portal branding — Accent color | Color picker | N4S navy |
| Minimum portfolio projects | Number | 3 |

#### This Project sub-tab

Same fields with inheritance indicators. Common project-level overrides:
- **Shorter deadline** (urgent engagement)
- **Custom branding** (client-branded portal for white-label advisory)
- **Cover letter variant** (personalized for high-profile consultants)

---

### 4.6 PIPELINE CONFIGURATION (Global + Project Override)

**Current state:** 8 fixed stages hardcoded in `PIPELINE_STAGES` array:
```
shortlisted → contacted → questionnaire_sent → questionnaire_received →
under_review → proposal → engaged → contracted
```

#### Global Defaults sub-tab

- Default stage labels (rename "Contracted" → "Letter of Intent" globally)
- Default optional stages (e.g., "Proposal" can be globally marked as skippable)

#### This Project sub-tab

- Override labels for this project
- Toggle stages on/off for this project's workflow (simpler engagement might skip "Proposal")

**Note:** Pipeline stage **keys** remain fixed for data integrity. Only display labels are customizable. Existing engagement records are never affected.

---

### 4.7 DATA MANAGEMENT (Project-Only)

**This card only appears on the "This Project" sub-tab.** Data operations are always project-scoped.

```
┌─────────────────────────────────────────────────────────────┐
│  DATA MANAGEMENT                             This Project    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  REGISTRY                                                    │
│  Total consultants: 47   Verified: 12   Pending: 35         │
│  [Export CSV]  [Export JSON]  [Import Consultants]            │
│                                                              │
│  ENGAGEMENTS                                                 │
│  Active: 8   Archived: 0                                     │
│  [Archive completed engagements]                             │
│                                                              │
│  DISCOVERY QUEUE                                             │
│  Pending review: 23   Imported: 15   Rejected: 42           │
│  [Clear rejected]  [Export queue]                            │
│                                                              │
│  RFQ RESPONSES                                               │
│  Invitations sent: 4   Submitted: 1   Scored: 1             │
│  [View RFQ Library]                                          │
│                                                              │
│  DANGER ZONE                                                 │
│  [Reset all engagements for this project]                    │
│  [Purge discovery queue]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Note on Registry scope:** The consultant Registry is currently shared across all projects (one database of firms). The Data Management card here shows counts filtered to consultants with engagements on the current project. A future "Global Data" section could show the full cross-project registry with export/import capabilities.

---

## 5. STANDALONE EXTRACTION ARCHITECTURE

### 5.1 What BYT Needs to Run Independently

| Dependency | N4S Mode | Standalone Mode |
|-----------|----------|-----------------|
| Project context | KYC + FYI via AppContext | Admin Panel → Project Brief |
| Global config | `byt_global_config` table (PHP/MySQL) | `byt_global_config` table (Express/PostgreSQL) |
| Project config | `bytData.adminConfig` in project_data JSONB | Same structure in standalone DB |
| Consultant DB | gid.php → MySQL on IONOS | Own Express API → PostgreSQL on VPS |
| Engagement pipeline | gid.php → MySQL on IONOS | Own Express API → PostgreSQL on VPS |
| Discovery queue | gid.php → MySQL on IONOS | Own Express API → PostgreSQL on VPS |
| RFQ system | rfq.not-4.sale (already VPS) | Same (no change) |
| Scoring engine | rfq.not-4.sale (already VPS) | Same (no change) |
| AI keys | Admin Panel → encrypted DB | Same |
| Authentication | N4S PHP session | Own auth (JWT, like RFQ Portal) |
| App shell | N4S App.jsx, nav, module headers | Own Vite app with BYT-specific shell |

### 5.2 Extraction Steps (When Ready)

**Phase A — Decouple Data Layer:**
1. Create `src/components/BYT/utils/projectContext.js` — single abstraction for all project data
2. Create `src/components/BYT/utils/bytApi.js` — wraps all gid.php calls with configurable base URL
3. Create `src/components/BYT/utils/configResolver.js` — merges global + project config with inheritance
4. Replace all direct `kycData` / `fyiData` reads in BYT screens with `getProjectContext()`
5. Replace all direct `${API_BASE}/gid.php` calls with `bytApi.*` methods
6. All config reads go through `configResolver` which handles the inheritance merge

**Phase B — Standalone API (VPS):**
1. New Express API on VPS: `/var/www/byt-api` (mirrors gid.php functionality)
2. PostgreSQL tables: `byt_consultants`, `byt_engagements`, `byt_discovery`, `byt_global_config`, `byt_project_config`
3. Migrate existing MySQL data → PostgreSQL migration script
4. Auth: JWT-based (admin login, not N4S session)

**Phase C — Standalone App Shell:**
1. New Vite React app: `linczyc-MLX/BYT-App`
2. Import all BYT components as-is (they're already self-contained)
3. Provide `AppContext`-compatible wrapper that supplies `bytData`, `activeProjectId`, `projectData`
4. Own routing, own header, own auth screens
5. Deploy to `byt.not-4.sale` or client-branded domain

### 5.3 Shared vs Forked Code

The goal is to maintain a **single source of truth** for BYT components as long as possible:

```
N4S repo (linczyc-MLX/N4S)
  └── src/components/BYT/     ← BYT module (components, screens, utils)

BYT-App repo (linczyc-MLX/BYT-App)   [future]
  └── src/shell/               ← App shell, auth, routing
  └── src/components/BYT/     ← Git subtree or symlink from N4S repo
```

Using Git subtree keeps components in sync. When BYT is mature enough to diverge, fork the subtree into an independent codebase.

---

## 6. ITR-8 ENHANCEMENTS — DISCOVERY DATA QUALITY

### 6.1 Current Status (Already Implemented)

- Discipline-specific prompt guidance with UHNW vocabulary
- Source attribution tracking (5-tier)
- Confidence scoring per candidate

### 6.2 Near-Term Enhancements (Admin Panel Enables)

| Enhancement | How Admin Panel Helps | Level |
|------------|----------------------|-------|
| Editable exemplar firms | Discovery Settings → per-discipline exemplar list | Global + Project |
| Editable exclusion list | Discovery Settings → exclusion list | Global + Project |
| Prompt tuning without code deploys | Discovery Settings → edit guidance text | Global + Project |
| Confidence threshold control | Discovery Settings → hide results below X | Global + Project |
| Model selection | Discovery Settings → sonnet vs haiku | Global + Project |
| Regional specialization | Project override → add local market vocabulary | Project only |

### 6.3 Future Data Source Integration (ITR-7 Enables)

| Data Source | Discipline | What It Provides | API Type |
|------------|-----------|------------------|----------|
| Dodge Construction Network | All | Verified firm profiles, project history | REST (paid) |
| Building Radar | GC, PM | Active projects, permit-linked firms | REST (paid) |
| NYC DOB NOW (Socrata) | All (NYC) | Permits → identify firms on $10M+ projects | REST (free) |
| LA LADBS | All (LA) | Permits → identify luxury residential builders | REST (free) |
| CMAA Directory | PM | Certified Construction Managers | Scrape/API |
| NAHB Custom Builder Council | GC | Certified luxury custom builders | Directory |
| AIA Member Directory | Architect | Licensed architects by state | Directory |
| ASID / IIDA | Interior Designer | Certified interior designers | Directory |

**Cross-reference pattern:**

```
AI Discovery generates candidates
  → Cross-reference against Dodge (verified profile?)
  → Cross-reference against permit data ($10M+ permits?)
  → Cross-reference against professional directories (member?)
  → Confidence score boosted for verified matches
  → Source attribution: "AI-Discovered, Dodge-Verified"
```

---

## 7. DATA MODEL

### 7.1 Global Config Storage

**New MySQL table on IONOS (N4S mode):**

```sql
CREATE TABLE byt_global_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(100)
);
```

Example rows:
```
('discovery.disciplineGuidance.architect', '"Search for licensed..."')
('discovery.exclusionList', '["Turner Construction","Skanska","Toll Brothers","Lennar"]')
('scoring.weights', '{"scale_match":15,"financial_resilience":10,...}')
('scoring.tiers', '{"topMatch":80,"goodFit":60,"consider":40}')
('rfq.defaultDeadlineDays', '14')
('pipeline.stageLabels', 'null')  -- null = use code defaults
```

### 7.2 Project Config Storage

**In existing project_data JSONB (bytData.adminConfig):**

```js
bytData: {
  // Existing fields
  consultants: [],
  engagements: [],
  currentMatches: {},
  lastMatchRun: null,

  // New — Project-level admin config (only overridden values stored)
  adminConfig: {
    // Only keys that differ from global are present
    // Absent keys = inherit from global
    discoveryOverrides: {
      confidenceThreshold: 40,  // overridden from global 50
      disciplineGuidance: {
        pm: "...custom PM guidance for this Florida coastal project...",
        // architect, id, gc: absent = inherit global
      },
      additionalExemplars: {
        gc: ['Onshore Construction'],
      },
      additionalExclusions: ['Smith & Associates'],
      allowDespiteGlobal: [],  // firms to un-exclude for this project
    },
    scoringOverrides: {
      weights: {
        geographic_alignment: 13,  // raised from global 10
        capability_coverage: 22,   // raised from global 20
        // all others: absent = inherit global
        // NOTE: when any weight is overridden, all 10 must be provided
        //       (UI enforces total=100% before save)
      },
      rationale: "Coastal FL market has fewer UHNW-caliber PMs...",
    },
    rfqOverrides: {
      deadlineDays: 10,  // shorter than global 14
    },
    // pipelineOverrides, etc.
  },

  // Project Brief (standalone mode, or manual override)
  projectBrief: null,  // null = read from KYC/FYI
}
```

### 7.3 Config Resolution Function

```js
// src/components/BYT/utils/configResolver.js

export function resolveConfig(globalConfig, projectOverrides) {
  return {
    discovery: {
      model: projectOverrides?.discoveryOverrides?.model ?? globalConfig.discovery.model,
      confidenceThreshold: projectOverrides?.discoveryOverrides?.confidenceThreshold
        ?? globalConfig.discovery.confidenceThreshold,
      resultsPerSearch: projectOverrides?.discoveryOverrides?.resultsPerSearch
        ?? globalConfig.discovery.resultsPerSearch,
      disciplineGuidance: {
        architect: projectOverrides?.discoveryOverrides?.disciplineGuidance?.architect
          ?? globalConfig.discovery.disciplineGuidance.architect,
        interior_designer: projectOverrides?.discoveryOverrides?.disciplineGuidance?.interior_designer
          ?? globalConfig.discovery.disciplineGuidance.interior_designer,
        pm: projectOverrides?.discoveryOverrides?.disciplineGuidance?.pm
          ?? globalConfig.discovery.disciplineGuidance.pm,
        gc: projectOverrides?.discoveryOverrides?.disciplineGuidance?.gc
          ?? globalConfig.discovery.disciplineGuidance.gc,
      },
      // Additive merge for lists
      exemplarFirms: mergeDisciplineLists(
        globalConfig.discovery.exemplarFirms,
        projectOverrides?.discoveryOverrides?.additionalExemplars
      ),
      exclusionList: mergeExclusions(
        globalConfig.discovery.exclusionList,
        projectOverrides?.discoveryOverrides?.additionalExclusions,
        projectOverrides?.discoveryOverrides?.allowDespiteGlobal
      ),
    },
    scoring: {
      weights: projectOverrides?.scoringOverrides?.weights
        ?? globalConfig.scoring.weights,
      tiers: projectOverrides?.scoringOverrides?.tiers
        ?? globalConfig.scoring.tiers,
      rationale: projectOverrides?.scoringOverrides?.rationale ?? null,
    },
    rfq: {
      deadlineDays: projectOverrides?.rfqOverrides?.deadlineDays
        ?? globalConfig.rfq.deadlineDays,
      coverLetterVariant: projectOverrides?.rfqOverrides?.coverLetterVariant
        ?? globalConfig.rfq.coverLetterVariant,
      // ...etc
    },
    pipeline: {
      stageLabels: projectOverrides?.pipelineOverrides?.stageLabels
        ?? globalConfig.pipeline.stageLabels,
      optionalStages: projectOverrides?.pipelineOverrides?.optionalStages
        ?? globalConfig.pipeline.optionalStages,
    },
  };
}

function mergeDisciplineLists(globalLists, projectAdditions) {
  if (!projectAdditions) return globalLists;
  const merged = {};
  for (const discipline of ['architect', 'interior_designer', 'pm', 'gc']) {
    merged[discipline] = [
      ...(globalLists[discipline] || []).map(f => ({ name: f, source: 'global' })),
      ...(projectAdditions[discipline] || []).map(f => ({ name: f, source: 'project' })),
    ];
  }
  return merged;
}

function mergeExclusions(globalList, projectAdditions, projectAllowList) {
  const effective = new Set(globalList || []);
  (projectAdditions || []).forEach(f => effective.add(f));
  (projectAllowList || []).forEach(f => effective.delete(f));
  return [...effective];
}
```

### 7.4 New PHP endpoint additions (gid.php)

```
GET  gid.php?entity=admin_config&scope=global               → Read all global config
GET  gid.php?entity=admin_config&scope=global&key=<key>      → Read single global config value
POST gid.php?entity=admin_config&scope=global&action=update   → Update global config value
POST gid.php?entity=admin_config&action=test_api&provider=X   → Test API connection
GET  gid.php?entity=admin_config&action=stats&project_id=X    → Registry/engagement/queue counts
POST gid.php?entity=admin_config&action=export&type=csv        → Export registry CSV
```

Project-level config is stored in the existing project_data JSONB via the normal `updateBYTData()` flow — no new endpoints needed.

---

## 8. IMPLEMENTATION PHASES

### Phase 1: Admin Panel Foundation + ITR-7/8 Core
1. Add Admin tab (Tab 6) to BYTModule.jsx with Global/Project sub-tabs
2. Build `BYTAdminScreen.jsx` with card-based layout and sub-tab routing
3. Build `configResolver.js` — global + project merge logic
4. Build PHP `byt_global_config` table + CRUD in gid.php
5. **API Connections card** (Global) — Anthropic + RFQ key management
6. **Discovery Settings card** (Global + Project) — Guidance, exemplars, exclusions
7. **Scoring Configuration card** (Global + Project) — Weights, tiers, rationale
8. Wire Discovery screen to read from `configResolver` instead of hardcoded values
9. Wire Matchmaking screen to read weights/tiers from `configResolver`

### Phase 2: Project Context + Data Management
10. **Project Brief card** (Project-only) — Read-only in N4S mode
11. Create `projectContext.js` abstraction layer
12. Refactor BYT screens to use `getProjectContext()`
13. **Data Management card** (Project-only) — Stats, export, archive
14. **RFQ Settings card** (Global + Project) — Deadlines, cover letter, branding
15. **Pipeline Settings card** (Global + Project) — Labels, optional stages

### Phase 3: External Data Sources (Future)
16. Dodge Construction connector
17. Public permit API connectors (NYC, LA, Miami-Dade)
18. Professional directory connectors
19. Cross-reference engine

### Phase 4: Standalone Extraction (Future)
20. `bytApi.js` abstraction over gid.php
21. Standalone Express API on VPS
22. Database migration script (MySQL → PostgreSQL)
23. Standalone app shell + auth
24. Deployment pipeline

---

## 9. KEY DECISIONS

| Decision | Rationale |
|----------|-----------|
| Two-level config: Global + Project | Methodology defaults set once, per-engagement tuning without affecting other projects |
| Sub-tabs (Global Defaults / This Project) | Clear visual separation; advisor always knows which scope they're editing |
| Additive merge for lists | Project adds to global exclusions/exemplars, never subtracts (with rare allow-override) |
| Override replaces for scalars | Weights, thresholds, deadlines — project value fully replaces global |
| Rationale field on overrides | Documents advisor reasoning for per-project deviations; appears in reports |
| API keys global-only | Keys are account resources, not project-scoped; prevents key sprawl |
| Project Brief project-only | Project context is inherently per-engagement |
| Data Management project-only | Export/archive actions are always project-scoped |
| Pipeline keys immutable | Display labels customizable but keys fixed for data integrity |
| Admin tab inside BYT | Standalone extraction requires self-contained configuration |
| Config stored in JSONB (project) + table (global) | Reuses existing persistence for project data; global config gets its own table |
