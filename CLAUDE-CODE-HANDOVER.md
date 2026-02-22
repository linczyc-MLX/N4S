# Claude Code Handover — BYT Library Shortlist Button Fix

## Problem
The "Shortlist" button in BYT Library > Consultant Library view should be **greyed out / disabled** when the consultant is already in the active project's shortlist/pipeline. Currently it stays active (gold) for all 4 consultants even though all 4 are already shortlisted for the active project (proj_thornwood_001).

## Root Cause (suspected)
The Library screen loads engagements from IONOS (`website.not-4.sale/api/gid.php?entity=engagements&project_id=X`) and library consultants from VPS (`rfq.not-4.sale/api/library`). Matching is done on `firm_name + discipline` but either:
1. The engagement fetch fails silently (CORS? wrong URL? empty result?)
2. The firm_name or discipline values don't match between VPS and IONOS data

## Files to investigate
- `src/components/BYT/screens/BYTLibraryScreen.jsx` — the broken screen
- `src/components/BYT/screens/BYTMatchmakingScreen.jsx` — working reference (engagements load correctly here)
- `src/services/rfqApi.js` — VPS library API client
- `api/gid.php` lines 603-637 — IONOS engagement query (JOINs gid_consultants for firm_name)

## Debug steps
1. Open browser console on the Library tab
2. Check network tab: does `gid.php?entity=engagements&project_id=proj_thornwood_001` return data or error?
3. If it returns data, log the engagement firm_names and the library consultant firm_names — do they match?
4. Add `console.log('[Library] Engagements loaded:', engagements.length, engagements.map(e => e.firm_name + '::' + e.discipline))` after setEngagements
5. Add `console.log('[Library] Engagement map keys:', Object.keys(engagementMap))` in the render
6. Add `console.log('[Library] Looking up:', consultant.firm_name, consultant.discipline, '=>', getEngagement(consultant.firm_name, consultant.discipline))` before rendering LibraryConsultantCard

## What the fix should do
- When engagement exists for a consultant (matched by firm_name+discipline), the button should render as:
  - Greyed out (opacity 0.45)
  - Label says "Shortlisted" instead of "Shortlist"
  - disabled=true
- When no engagement exists, gold "Shortlist" button (current behavior, which is correct for NEW consultants)

## Active project
- Project ID: `proj_thornwood_001`
- All 4 consultants (Ehrlich Yanai, Cliff Fong, Premier Development, Mayfair Construction) have engagements with status `questionnaire_received`

## API details
- IONOS engagements: `https://website.not-4.sale/api/gid.php?entity=engagements&project_id=proj_thornwood_001`
- VPS library: `https://rfq.not-4.sale/api/library` (requires x-api-key header)
- The gid.php engagement response includes `firm_name` from a LEFT JOIN on gid_consultants

## Git
- Repo: github.com/linczyc-MLX/N4S
- Branch: main
- After fix, commit and push. GitHub Actions auto-deploys to IONOS.
