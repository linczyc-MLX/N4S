# BYT Session Handover — February 22, 2026

## What Was Done

### 1. Config Wiring Complete
Discovery and Matchmaking screens now read ALL configuration from the Admin Panel system instead of hardcoded values. A shared `useBYTConfig()` hook (`src/components/BYT/utils/useBYTConfig.js`) provides config to both screens with 5-minute module-level caching. Changes in Admin → immediately drive AI model selection, discipline guidance, exemplar firms, exclusion lists, confidence thresholds, scoring weights, and tier thresholds.

### 2. Score Display Consistency Fixed
Matchmaking now shows the same AI Confidence score as Shortlist. The PHP engagement query includes a subquery to pull `ai_confidence` from `gid_discovery_candidates`. Score priority chain: VPS overall_score → ai_confidence → legacy match_score. Tier label ("Top Match"/"Good Fit"/"Consider") displays below the score circle, not inside it.

### 3. Shortlist UX: Unshortlist
The green "✓ Shortlisted" button is now clickable — moves candidates back to "To Review". Hovers red to signal removal. Only deletes engagement if status is still `shortlisted` (protects contacted/RFQ-sent candidates).

### 4. Full RFQ Simulation Complete
All 4 candidates have completed questionnaires submitted through the real RFQ Portal API (rfq.not-4.sale):
- **Ehrlich Yanai (Architect)** — 33 responses, 4 portfolio projects
- **Cliff Fong Design (Interior Designer)** — 33 responses, 3 portfolio projects
- **Premier Development Advisors (PM)** — 33 responses, 3 portfolio projects
- **Mayfair Construction (GC)** — 33 responses, 3 portfolio projects

Each follows all 5 questionnaire sections: Firm Baseline, Discipline Profile, Portfolio Evidence (structured), Working Style & Synergy, and Project Capabilities. All IONOS engagements updated to `questionnaire_received`.

## What's Ready to Test

### Matchmaking Scoring
The "Score All" button on the Matchmaking tab should now be able to trigger VPS scoring (`/scoring/compute-all/{project_id}`) against the submitted RFQ data. This is the two-pass scoring system: Pass 1 (quantitative/algorithmic) + Pass 2 (qualitative/AI-parsed).

### Synergy Sandbox
Section 4 responses contain deliberately varied communication/conflict styles:
- Ehrlich: fast decisions, real-time comms, in-person meetings, compromise on conflicts
- Cliff Fong: methodical decisions, weekly cadence, hybrid meetings, collaborative on conflicts
- Premier Dev: methodical decisions, weekly cadence, hybrid meetings, collaborative on conflicts
- Mayfair: fast decisions, daily cadence, in-person meetings, direct negotiation on conflicts

This creates real compatibility signals — Ehrlich↔Mayfair should score high on pace compatibility, while Fong↔Premier should score high on methodological alignment.

## Current State

### Git: `main` at commit `25c1c5de`
All changes pushed. GitHub Actions auto-deploys to IONOS.

### RFQ Portal: All 4 invitations `submitted`
VPS at 74.208.250.22 running, API healthy.

### IONOS Engagements: All 4 at `questionnaire_received`
Ready for scoring pipeline.

## Next Steps (Suggested)
1. **Test Matchmaking Scoring** — trigger "Score All" and verify scores populate
2. **Test Synergy Sandbox** — run team combination analysis with the 4 candidates
3. **Export Brief** — test the "Export Brief" button with scored team data
4. **Edge cases** — test what happens when a scored candidate is unshortlisted and replaced

## Key File Locations
- Config hook: `src/components/BYT/utils/useBYTConfig.js`
- Config resolver: `src/components/BYT/utils/configResolver.js`
- Discovery: `src/components/BYT/screens/BYTDiscoveryScreen.jsx`
- Matchmaking: `src/components/BYT/screens/BYTMatchmakingScreen.jsx`
- Shortlist: `src/components/BYT/screens/BYTShortlistScreen.jsx`
- Synergy Sandbox: `src/components/BYT/screens/BYTSynergySandboxScreen.jsx`
- PHP API: `api/gid.php` (engagement query with ai_confidence at line ~610)
- RFQ API service: `src/services/rfqApi.js`
- RFQ API repo: `github.com/linczyc-MLX/N4S-RFQ-API` (cloned locally at `/home/claude/N4S-RFQ-API`)
