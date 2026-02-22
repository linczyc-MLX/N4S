# Module: BYT (Build Your Team) — formerly GID

> **Status**: 🔄 Active Development | **Header**: #D4A574 | **Last Updated**: 2026-02-22

## Purpose
Consultant matching and team assembly system. AI-powered discovery, qualification via RFQ, scoring, and synergy analysis across 4 disciplines: Architect, Interior Designer, PM/Owner's Rep, General Contractor.

## Tab Structure (6 tabs)
1. **Registry** — Consultant database (manual entry + imports)
2. **Discovery** — AI-powered sourcing with configurable guidance
3. **Shortlist** — Curation, RFQ dispatch, pipeline management
4. **Matchmaking** — Deep scoring from RFQ responses (two-pass: quantitative + qualitative)
5. **Synergy Sandbox** — Team combination testing + conflict mapping
6. **Admin** — Global + project-level configuration

## Key Files

### Screens (src/components/BYT/screens/)
| File | Tab | Notes |
|------|-----|-------|
| `BYTRegistryScreen.jsx` | Registry | CRUD, import, search |
| `BYTDiscoveryScreen.jsx` | Discovery | AI prompts, config-driven |
| `BYTShortlistScreen.jsx` | Shortlist | Drag-rank, RFQ dispatch |
| `BYTMatchmakingScreen.jsx` | Matchmaking | Score display, tier labels |
| `BYTSynergySandboxScreen.jsx` | Synergy | Team combination analysis |
| `BYTAdminScreen.jsx` | Admin | Global + project config |

### Utils (src/components/BYT/utils/)
| File | Purpose |
|------|---------|
| `useBYTConfig.js` | Shared config hook — reads Admin Panel config with 5-min cache |
| `configResolver.js` | Merges global + project config, resolves effective values |
| `matchingAlgorithm.js` | Discovery scoring, AS spectrum, style derivation |

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `api/gid.php` | Main BYT API: consultants, engagements, discovery CRUD |
| `api/gid-ai-config.php` | Admin Panel AI model config |
| `api/gid-discovery-ai.php` | AI discovery proxy |
| `api/gid-ai-proxy.php` | Server-side AI proxy (for future hosting upgrade) |

### RFQ Portal (separate apps on VPS)
| Component | Repo | URL |
|-----------|------|-----|
| Frontend | `N4S-RFQ` | rfq.not-4.sale |
| API | `N4S-RFQ-API` | rfq.not-4.sale/api |

## Database Tables (IONOS MySQL)
- `gid_consultants` — Registry
- `gid_discovery_candidates` — AI-sourced candidates per project
- `gid_engagements` — Pipeline: shortlisted → contacted → questionnaire_sent → questionnaire_received → scored
- `gid_project_consultants` — Junction table (utf8mb4_unicode_ci!)
- `byt_global_config` — Admin global settings
- `byt_project_config` — Admin project overrides

## Database Tables (VPS PostgreSQL — rfq_db)
- `rfq_projects` — Mirror of N4S projects
- `rfq_invitations` — Token-based consultant access, status tracking
- `rfq_responses` — Per-question answers (5 sections, ~33 questions per discipline)
- `rfq_portfolio_projects` — Structured portfolio evidence (min 3, max 5)
- `rfq_question_templates` — Question definitions with scoring weights

## Config System
- **useBYTConfig hook** provides merged config to Discovery + Matchmaking
- Module-level cache (5-min TTL) avoids refetch on tab switches
- Config flows: Admin Panel → byt_global_config/byt_project_config → useBYTConfig → screens
- Configurable: AI model, discipline guidance, exemplar firms, exclusion lists, confidence thresholds, scoring weights, tier thresholds

## Score Display
- Priority chain: VPS overall_score → ai_confidence → legacy match_score
- ai_confidence from subquery: `SELECT MAX(d.confidence_score) FROM gid_discovery_candidates d WHERE d.imported_consultant_id = e.consultant_id`
- Tier labels: "Top Match" (≥80) / "Good Fit" (≥60) / "Consider" (<60)
- Labels display BELOW score circle, not inside

## RFQ Questionnaire Sections
1. **Firm Baseline** (16 questions, universal) — identity, scale, insurance, fees
2. **Discipline Profile** (7 questions, discipline-specific) — narratives + structured
3. **Portfolio Evidence** (3-5 projects, structured) — repeater blocks
4. **Working Style & Synergy** (10 questions, universal) — feeds Synergy Sandbox
5. **Project Capabilities** (dynamic from FYI) — feature checklist

## Current State (as of 2026-02-22)
- All 4 candidates have submitted RFQs (33 responses + 3-4 portfolio each)
- Engagement statuses: all `questionnaire_received`
- Ready for: Matchmaking scoring ("Score All") and Synergy Sandbox testing
- Synergy data has deliberately varied styles for meaningful compatibility signals

## Project Scoping
- `gid_project_consultants` junction table (must be utf8mb4_unicode_ci)
- Discovery has `project_id` column
- Guard queries: `$hasJunctionTable` / `$hasDiscProjectCol`
- Migration: `api/migrate-project-scope.php`
- Diagnostics: `api/diag-junction.php`
