# GID Assembly — Handoff Document

> **Date**: February 19, 2026  
> **Previous Session**: GID Phase 4 — Client-Profile-Aware Discovery + Architectural Style Spectrum  
> **Next Session**: GID Assembly Screen Implementation  
> **Repository**: `linczyc-MLX/N4S` (branch: `main`)

---

## 1. Current GID State — What's Built

GID (Get It Done) has 4 tabs. Three are complete, one is disabled:

| Tab | Status | What It Does |
|-----|--------|-------------|
| **Registry** | ✅ LIVE | Master consultant database — CRUD, portfolio, reviews. 5 DB tables. |
| **Discovery** | ✅ LIVE | AI-powered consultant sourcing. Manual search, AI Discovery (Anthropic API), Import Queue. 4 discipline types: Architect, Interior Designer, PM/Owner's Rep, General Contractor. |
| **Matchmaking** | ✅ LIVE | Runs matching algorithm against active client profile. 6-dimension scoring (Client Fit + Project Fit). Shortlist action creates `gid_engagements` records. |
| **Assembly** | 🔒 DISABLED | Placeholder button in `GIDModule.jsx` line ~494. Icon: `Briefcase`. This is what needs to be built. |

### Key Technical Facts
- **API Architecture**: Client-side calls to Anthropic API (IONOS blocks ALL outbound PHP HTTPS — cURL and file_get_contents both fail)
- **API Key**: Served from `config-secrets.php` on FTP (gitignored as of Feb 19, 2026 — deploys no longer overwrite it)
- **Discipline-Specific Prompts**: `getDisciplineGuidance()` in `GIDDiscoveryScreen.jsx` provides 40-80 lines of domain-specific calibration per discipline
- **Architectural Style Spectrum**: `deriveArchitecturalStyles()` in `matchingAlgorithm.js` maps taste data to AS1-AS9 categories (always 3 adjacent styles)
- **Style Signal Extraction**: `deriveStyleKeywords()` reads from `principalTasteResults.profile.scores` (Taste Exploration) with fallback to KYC axis sliders

---

## 2. The `gid_engagements` Table — Already Exists

The database table powering Assembly is already created (`api/gid-setup.php`):

```sql
gid_engagements (
  id VARCHAR(36) PRIMARY KEY,
  n4s_project_id VARCHAR(100) NOT NULL,
  consultant_id VARCHAR(36) NOT NULL,          -- FK → gid_consultants
  discipline VARCHAR(50) NOT NULL,
  match_score INT,                             -- 0-100 composite
  client_fit_score INT,
  project_fit_score INT,
  match_breakdown JSON,                        -- Per-dimension scores
  recommended_by VARCHAR(50) DEFAULT 'team_curation',
  
  -- ENGAGEMENT PIPELINE (status + date milestones)
  contact_status VARCHAR(50) DEFAULT 'shortlisted',
  date_shortlisted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_contacted TIMESTAMP NULL,
  date_responded TIMESTAMP NULL,
  date_meeting TIMESTAMP NULL,
  date_proposal TIMESTAMP NULL,
  date_engaged TIMESTAMP NULL,
  date_contracted TIMESTAMP NULL,
  
  -- FEEDBACK
  team_notes TEXT,
  client_feedback TEXT,
  chemistry_score INT,                         -- Post-meeting score
  project_outcome VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Pipeline statuses**: `shortlisted → contacted → responded → meeting → proposal → engaged → contracted`

Records are already created by the Matchmaking screen's "Shortlist" action. Assembly picks up from there.

---

## 3. Existing GID API Layer

All GID API calls go through `api/gid.php` with entity-based routing:

```
GET    /api/gid.php?entity=engagements              → List all engagements
GET    /api/gid.php?entity=engagements&id={id}       → Get single engagement
POST   /api/gid.php?entity=engagements               → Create engagement
PUT    /api/gid.php?entity=engagements&id={id}        → Update engagement
DELETE /api/gid.php?entity=engagements&id={id}        → Delete engagement
```

Additional entities: `consultants`, `discovery`, `portfolio`, `reviews`, `sources`

---

## 4. File Structure

```
src/components/GID/
├── GIDModule.jsx              — Main module with 4-tab nav (Assembly tab disabled)
├── GIDModule.css              — All GID styles
├── GIDDocumentation.jsx       — 4-tab docs (Overview/Workflow/Gates/Reference)
├── index.js
├── components/
│   ├── AddConsultantForm.jsx   — Registry CRUD form
│   ├── AIDiscoveryForm.jsx     — AI Discovery form with Profile toggle
│   ├── CandidateCard.jsx       — Discovery candidate display
│   ├── ConsultantDetailModal.jsx — Full consultant detail view
│   └── MatchScoreBreakdown.jsx — 6-dimension score visualization
├── screens/
│   ├── GIDDiscoveryScreen.jsx  — Discovery tab (Manual/AI/Import)
│   └── GIDMatchScreen.jsx      — Matchmaking tab (algorithm + shortlist)
└── utils/
    └── matchingAlgorithm.js    — Scoring engine, style derivation, AS spectrum
```

**New files needed for Assembly**:
- `src/components/GID/screens/GIDAssemblyScreen.jsx`
- Potentially: `src/components/GID/components/EngagementCard.jsx`
- Potentially: `src/components/GID/components/EngagementPipeline.jsx`

---

## 5. Data Flow Context

```
KYC (client profile) ──────────────────────┐
FYI (space program) ───────────────────────┤
Taste Exploration (design DNA) ────────────┤
                                           ▼
                              ┌─── GID Registry ◄── Manual Add / Import
                              │
                              ├─── GID Discovery ◄── AI Search (Anthropic API)
                              │         │
                              │         ▼ (approve candidates → registry)
                              │
                              ├─── GID Matchmaking
                              │         │ (run algorithm → score → shortlist)
                              │         ▼
                              │    gid_engagements (status: 'shortlisted')
                              │
                              └─── GID Assembly ◄── THIS IS WHAT TO BUILD
                                        │
                                        ▼
                              Engagement pipeline management
                              Team composition view
                              Per-discipline slot tracking
```

---

## 6. Module Header Convention

Assembly lives within GID, so it uses GID's existing header color:

| Property | Value |
|----------|-------|
| Header BG | `#D4A574` (Warm Earth) |
| Header font | Playfair Display |
| Content BG | `#f7fafc` |
| Module CSS class | `.gid-screen-tab` for tab, standard `gid-*` prefixed classes |

---

## 7. Recent Session Changes (Feb 19, 2026)

### Committed & Deployed
1. **GID Phase 4**: Client-Profile-Aware Discovery — "Use Client Profile" toggle, auto-fill from KYC/FYI
2. **GID Phase 4.1**: Architectural Style Spectrum — `deriveArchitecturalStyles()`, AS1-AS9 mapping, 3-style selection
3. **GID Phase 4.1 also**: Fixed `deriveStyleKeywords()` to read from `principalTasteResults` (was returning 0 signals)
4. **GID Phase 4.2**: Discipline-specific prompt enrichment — `getDisciplineGuidance()` for PM/Owner's Rep and GC
5. **GID Phase 4.2b**: Reverted server-side proxy (IONOS blocks outbound PHP HTTPS), restored client-side API
6. **Security Fix** (Claude Code): Removed `config-secrets.php` from git tracking, added to `.gitignore`

### ITR Items Added
- **ITR-7**: BYOK API Marketplace for SaaS/3rd-party deployment
- **ITR-8**: PM/Owner's Rep Discovery data quality

### Documentation Saved
- `docs/Luxury-Construction-Data-Search.md` — Research on PM/GC data sources

---

## 8. Critical Patterns to Follow

### Session Start
```bash
git config --global http.proxy "$HTTPS_PROXY"
git -c http.proxyAuthMethod=basic clone https://github.com/linczyc-MLX/N4S.git
cd N4S && npm install --ignore-scripts
```
Read `docs/N4S-BRAND-GUIDE.md` and `docs/N4S-ARCHITECTURE.md` BEFORE any work.

### Build & Deploy
```bash
CI=false npm run build   # output: build/
git push origin main     # → GitHub Actions auto-deploy to IONOS
```

### API Calls
- ALWAYS relative `/api` paths from frontend
- FTP site `website.not-4.sale` has PHP + MySQL
- `app-ionos.space` is static-only (serves React build)
- `config-secrets.php` lives on FTP only — NOT in git

### File Delivery
- Never ask Michael to edit/paste code into files
- Provide complete files for upload
- After confirmation, edit GitHub repository directly
- Results-focused, no iterative debugging loops

---

## 9. Other Active Projects (Context Only)

| Project | Status | Notes |
|---------|--------|-------|
| **LuXeBrief** | Active | Client portal at `*.luxebrief.not-4.sale`. VPS 74.208.250.22. Manual SSH deploy. |
| **Taste App** | Active | `tasteexploration.not-4.sale`. Separate repo `N4S-taste-app`. FTP deploy. |
| **VMX** | Deployed | Separate Vite app at `home-5019398597.app-ionos.space`. Repo: `N4S-VisualMatriX`. |
| **BestRentNJ** | Maintenance | Railway hosting. OpenAI story gen. Known infinite loop fix applied. |

---

## 10. Memory Archive Location

Full conversation transcripts and handover documents: `Dropbox/MY Files/Claude/`
