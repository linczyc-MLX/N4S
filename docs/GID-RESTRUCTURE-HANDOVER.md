# GID Module Restructure — Handover Document
**Date:** 2026-02-20
**Author:** Claude (for Michael Linczyc, MLX Consulting)
**Status:** APPROVED — Ready for implementation

---

## 1. CONTEXT & PROBLEM

### What Happened
The GID matching algorithm was rebuilt twice (v2.0 → v2.1) with 8 dimensions, discipline-specific weight matrices, position-based style scoring, and confidence-weighted quality signals. Despite this, all candidates still scored in the 30-48% range and were tagged "Consider" — even when Discovery had correctly identified them as excellent matches.

### Root Cause (Architectural, Not Algorithmic)
Discovery uses rich AI context (full client profile, conversational reasoning, confidence scoring) to find great candidates. The Matchmaking algorithm then tries to independently re-score those same candidates using sparse structured fields from the consultant registry — and inevitably undervalues them. **The intelligence regresses at each step instead of compounding.**

The data available for algorithmic scoring is fundamentally insufficient:
- Portfolio Evidence: 0/20 for all (no portfolio projects loaded from AI Discovery)
- Credentials: 0/15 for most (AI imports don't populate certifications field)
- Quality Signal: 0-4/10 (no reviews, no verification for imports)
- Budget/Geographic: 15/15 for all (pre-filtered by Discovery, cannot differentiate)

**Conclusion:** No amount of algorithm tuning can differentiate candidates when 5 of 8 scoring dimensions have no data. The solution is architectural — change WHEN deep scoring happens (after we have real data from candidates).

---

## 2. APPROVED RESTRUCTURE

### Current Flow (Broken)
```
Registry → Discovery (AI, rich context) → Matchmaking (algorithm, sparse data) → Assembly (not built)
```

### New Flow (Approved)
```
Registry → Discovery (AI finds candidates) → SHORTLIST (curate + send questionnaires) → MATCHMAKING (deep scoring from responses + team chemistry)
```

### Tab Renaming
| Position | Old Name | New Name | Purpose |
|----------|----------|----------|---------|
| Tab 1 | Registry | Registry | Consultant database (unchanged) |
| Tab 2 | Discovery | Discovery | AI-powered sourcing (unchanged) |
| Tab 3 | Matchmaking | **Shortlist** | Curation, outreach, questionnaires |
| Tab 4 | Assembly | **Matchmaking** | Deep scoring, team chemistry, assembly |

---

## 3. TAB 3: SHORTLIST (Was Matchmaking)

### Philosophy
Trust Discovery's intelligence. Don't re-score — curate. The AI already evaluated these candidates with deep context. Shortlist's job is to present Discovery's reasoning, let Michael make quick decisions, and initiate professional outreach.

### UI Design
**Display per candidate:**
- Discovery confidence score + AI rationale (already captured in source_attribution)
- Notable projects, awards, publications found by Discovery
- Alignment badges (not percentages): "Style Aligned" / "Budget Aligned" / "Geographic Aligned" / "Scale Aligned"
- Specialties tags from Discovery import

**Alignment Badge Logic:**
- Style Aligned: consultant's derived AS position within ±2.0 of client's AS position
- Budget Aligned: consultant's budget range encompasses project budget (±25%)
- Geographic Aligned: same state or region
- Scale Aligned: years_experience ≥ 15 AND budget tier matches

**Quick Actions per candidate:**
- ✅ Shortlist → moves to questionnaire queue
- ❌ Pass → archived with reason
- 📋 Request More Info → flags for manual research
- Drag-to-rank within shortlisted candidates

**Questionnaire Generation:**
- Button: "Send Questionnaire" (per candidate or batch)
- Generates discipline-specific questionnaire (see Section 5)
- Tracks outreach pipeline: Draft → Sent → Received → Under Review

### Data Model Changes
The existing `gid_engagements` table design from GID-ASSEMBLY-HANDOVER.md maps directly:
```
pipeline_status: 'shortlisted' → 'contacted' → 'questionnaire_sent' → 'questionnaire_received' → 'under_review'
```
Add fields:
- `questionnaire_sent_at` (timestamp)
- `questionnaire_received_at` (timestamp)
- `questionnaire_responses` (JSONB — stores all answers)
- `shortlist_rank` (integer — drag-to-rank position)
- `shortlist_notes` (text — Michael's notes on why shortlisted/passed)

---

## 4. TAB 4: MATCHMAKING (Was Assembly)

### Philosophy
Score candidates AFTER you have substance — questionnaire responses, proposed approach, actual portfolio details, references. This is where 70-85% scores become meaningful because you're evaluating real content.

### Operates Only On
Candidates whose `pipeline_status = 'questionnaire_received'` — they've responded and provided real data.

### Scoring Dimensions (Questionnaire-Based)
1. **Design Philosophy Alignment** — Does their stated approach match client's taste profile?
2. **Portfolio Relevance** — Do their submitted projects match this project's scale, style, and complexity?
3. **Team & Capacity** — Is their proposed team structure appropriate for this scope?
4. **Methodology Fit** — Does their process align with client's working preferences (from KYC)?
5. **Commercial Alignment** — Fee basis, timeline, and budget expectations vs. project parameters
6. **References & Track Record** — Quality of submitted references, verified completions
7. **Team Chemistry** — Cross-candidate compatibility (architect + ID aesthetic alignment, GC experience executing architect's style)

### Team Chemistry Analysis
This is the unique value — evaluating candidates not just individually but as a team:
- Architect + Interior Designer: Do their aesthetic philosophies complement or conflict?
- Architect + GC: Has the GC built projects at the complexity level this architect designs?
- PM + All: Does the PM's methodology accommodate the creative team's process?
- Compare AS positions across the proposed team — flag conflicts

### Assembly Workflow (within this tab)
1. Review individual match scores from questionnaire analysis
2. Build candidate teams (drag architects, IDs, PMs, GCs into team slots)
3. Run team chemistry analysis
4. Generate comparison reports
5. Schedule interviews / presentations
6. Final team selection → engagement

---

## 5. QUESTIONNAIRE TEMPLATES

### Architect Questionnaire
1. **Design Philosophy** — In 2-3 paragraphs, describe your design philosophy and how you approach luxury residential projects.
2. **Relevant Projects** — Provide details on 3 completed projects most relevant to this engagement (budget, SF, style, completion year, key features, publications/awards).
3. **Style Approach** — How would you describe your firm's position on the contemporary-to-traditional spectrum? How do you adapt to client aesthetic preferences?
4. **Team Structure** — Who would be the lead designer and day-to-day contact? What is the proposed team structure for a project of this scale?
5. **Process & Timeline** — Describe your typical design process phases and preliminary timeline expectations for a project of this scope.
6. **Fee Structure** — Describe your fee basis (% of construction, fixed, hourly) and what is included.
7. **Specialty Capabilities** — Which of the following have you designed: [checklist of client's FYI luxury features — wine cellar, theater, pool house, etc.]
8. **References** — Provide 2-3 client references from comparable projects.

### Interior Designer Questionnaire
1. **Design Philosophy** — Describe your approach to interior design for luxury residences.
2. **Relevant Projects** — 3 most relevant completed projects with budget, style, and scope details.
3. **Material & FF&E Philosophy** — How do you approach material selection, custom fabrication, and FF&E budgeting?
4. **Collaboration Approach** — How do you typically work with the project architect? Describe your ideal collaboration model.
5. **Team Structure** — Lead designer assignment and team for this project scale.
6. **Fee Structure** — Fee basis, FF&E procurement markup methodology, and what is included.
7. **Vendor Relationships** — Key vendor and artisan relationships relevant to this project.
8. **References** — 2-3 client references.

### Project Manager / Owner's Rep Questionnaire
1. **Management Philosophy** — Describe your approach to owner representation on luxury residential projects.
2. **Relevant Projects** — 3 comparable projects with budget, duration, and outcome details.
3. **Local Experience** — Describe your experience with permitting, inspections, and regulatory requirements in [project state/municipality].
4. **Project Controls** — What systems and tools do you use for budget tracking, schedule management, and reporting?
5. **Team Structure** — Who would be the day-to-day project manager? Reporting cadence and methodology.
6. **Risk Management** — How do you identify, track, and mitigate project risks?
7. **Fee Structure** — Fee basis and what is included/excluded.
8. **References** — 2-3 client references from comparable engagements.

### General Contractor Questionnaire
1. **Construction Philosophy** — Describe your approach to luxury residential construction.
2. **Relevant Projects** — 3 comparable completed builds with budget, SF, duration, and key features.
3. **Specialty Trade Network** — For each of the client's luxury features [from FYI], identify your proposed subcontractor or in-house capability.
4. **Local Presence** — Office location, active projects in the area, local trade relationships.
5. **Schedule Methodology** — Preliminary construction timeline expectations and scheduling approach.
6. **Budget & Procurement** — Cost estimation methodology, procurement approach (open book vs. stipulated sum), and change order process.
7. **Bond & Insurance** — Bonding capacity and insurance coverage levels.
8. **References** — 2-3 client references from comparable builds.

---

## 6. CURRENT FILE STATE

### Files That Exist (from v2.1 algorithm work — still deployed)
- `src/components/GID/utils/matchingAlgorithm.js` — v2.1 with 8 dimensions, position-based style, discipline weights (1,194 lines). Will be **repurposed** for Shortlist alignment badges + later for deep questionnaire scoring.
- `src/components/GID/components/MatchScoreBreakdown.jsx` — Score visualization. Will be **heavily modified** for Shortlist badge display + new Matchmaking questionnaire scoring.
- `src/components/GID/screens/GIDMatchScreen.jsx` — Current matchmaking screen. Will be **renamed/refactored** to GIDShortlistScreen.jsx.
- `src/components/GID/screens/GIDAssemblyScreen.jsx` — Placeholder. Will be **renamed/refactored** to GIDMatchmakingScreen.jsx.

### Files That Need Creation
- `src/components/GID/screens/GIDShortlistScreen.jsx` — New curation + outreach UI
- `src/components/GID/screens/GIDMatchmakingScreen.jsx` — New deep scoring + team assembly
- `src/components/GID/components/QuestionnaireGenerator.jsx` — Discipline-specific questionnaire builder
- `src/components/GID/components/QuestionnaireViewer.jsx` — Response review + scoring
- `src/components/GID/components/TeamChemistry.jsx` — Cross-candidate compatibility analysis
- `src/components/GID/components/AlignmentBadges.jsx` — Shortlist badge display
- `src/components/GID/utils/questionnaireScoring.js` — Deep scoring engine for questionnaire responses
- `api/gid_questionnaires.php` — Backend for questionnaire CRUD + responses

### Database Changes Needed
```sql
-- Add to gid_engagements (or create if not exists)
ALTER TABLE gid_engagements ADD COLUMN IF NOT EXISTS questionnaire_sent_at TIMESTAMP;
ALTER TABLE gid_engagements ADD COLUMN IF NOT EXISTS questionnaire_received_at TIMESTAMP;
ALTER TABLE gid_engagements ADD COLUMN IF NOT EXISTS questionnaire_responses JSONB DEFAULT '{}';
ALTER TABLE gid_engagements ADD COLUMN IF NOT EXISTS shortlist_rank INTEGER;
ALTER TABLE gid_engagements ADD COLUMN IF NOT EXISTS shortlist_notes TEXT;
ALTER TABLE gid_engagements ADD COLUMN IF NOT EXISTS alignment_badges JSONB DEFAULT '[]';

-- Questionnaire templates table
CREATE TABLE IF NOT EXISTS gid_questionnaire_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  discipline VARCHAR(50) NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Navigation Changes
In `GIDScreen.jsx` (or wherever tabs are defined):
```
tabs: [
  { key: 'registry', label: 'Registry' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'shortlist', label: 'Shortlist' },      // was 'matchmaking'
  { key: 'matchmaking', label: 'Matchmaking' },   // was 'assembly'
]
```

---

## 7. IMPLEMENTATION PHASES

### Phase 1: Rename + Shortlist MVP
1. Rename tabs (Matchmaking → Shortlist, Assembly → Matchmaking)
2. Build Shortlist screen: candidate cards with Discovery data, alignment badges, Shortlist/Pass actions
3. Implement drag-to-rank within shortlisted candidates
4. Create engagement pipeline tracking (shortlisted → contacted → etc.)

### Phase 2: Questionnaire Engine
5. Build discipline-specific questionnaire templates
6. Questionnaire generation UI (per candidate or batch)
7. Export questionnaire as PDF (for email) or generate shareable link
8. Questionnaire response intake (manual entry or file upload)

### Phase 3: Deep Matchmaking
9. Build questionnaire-based scoring engine
10. Individual candidate scoring from responses
11. Team chemistry analysis (cross-candidate compatibility)
12. Team builder UI with comparison and assembly

### Phase 4: Polish
13. Questionnaire tracking dashboard
14. PDF report generation for shortlist + matchmaking results
15. LuXeBrief portal integration (client can view shortlisted candidates)
16. Documentation tabs for Shortlist and Matchmaking modules

---

## 8. KEY DECISIONS RECORD

| Decision | Rationale |
|----------|-----------|
| Don't re-score Discovery candidates algorithmically | Sparse data makes scores meaningless; Discovery's AI reasoning is the intelligence |
| Use alignment badges instead of percentages | Honest representation — binary aligned/not-aligned vs fake-precision 46% |
| Deep scoring only after questionnaire response | Score against real data, not inferred tags |
| Team chemistry as a scoring dimension | Unique N4S value — candidates evaluated as a team, not just individually |
| Questionnaires are discipline-specific | Architect questions ≠ GC questions; each discipline has different evaluation criteria |
| Tier thresholds will be higher in new Matchmaking | 70-85% scores become achievable because data is rich |

---

## 9. SESSION NOTES

- `matchingAlgorithm.js` v2.1 is deployed with position-based style scoring. It can be repurposed for alignment badge calculation in Shortlist and as the foundation for the new questionnaire scoring engine.
- `config-secrets.php` remains gitignored on FTP only. IONOS blocks outbound PHP HTTPS — all external API calls must be client-side.
- The `gid_engagements` table design from GID-ASSEMBLY-HANDOVER.md is still valid and maps to the new pipeline.
- Start next session by reading this doc + `docs/GID-ASSEMBLY-HANDOVER.md` + `docs/MATCHMAKING-ALGORITHM-PROPOSAL.md` for full context.
