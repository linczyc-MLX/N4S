# GID RFQ Portal & Synergy Sandbox — Technical Specification
**Date:** 2026-02-20
**Author:** Claude (for Michael Linczyc, MLX Consulting)
**Status:** DRAFT — Awaiting review before implementation
**Supersedes:** Phase 2-4 sections of GID-RESTRUCTURE-HANDOVER.md

---

## 1. SYSTEM OVERVIEW

### Tab Structure (Final)
```
Tab 1: Registry        — Consultant database (unchanged)
Tab 2: Discovery       — AI-powered sourcing (unchanged)
Tab 3: Shortlist       — Curation + RFQ dispatch (Phase 1 done + Phase 2B additions)
Tab 4: Matchmaking     — Deep scoring from RFQ responses (Phase 3)
Tab 5: Synergy Sandbox — Team combination testing + conflict mapping (Phase 4)
```

### Three Deployable Components
1. **N4S Main App** (existing) — Tabs 1-5 in the GID module
2. **RFQ Portal** (new standalone app) — Consultant-facing questionnaire hosted on VPS
3. **RFQ API** (new Express backend) — Auth, save/submit, project isolation, library archive

---

## 2. HOSTING ARCHITECTURE — RECOMMENDATION

### Why VPS over IONOS FTP

| Concern | IONOS FTP | VPS (74.208.250.22) |
|---------|-----------|---------------------|
| Outbound HTTPS | Blocked | Unrestricted |
| Auth system | PHP sessions only | Express + JWT + bcrypt |
| Database | MySQL (shared) | Dedicated PostgreSQL |
| Real-time updates | Polling only | WebSocket capable |
| Data integrity | Shared DB, no transactions | Isolated DB with ACID |
| Project segregation | Manual query filtering | Schema-level or row-level isolation |
| Proven pattern | — | LuXeBrief already running |

**Decision: VPS at 74.208.250.22**

### Deployment Architecture
```
VPS (74.208.250.22)
├── /var/www/luxebrief        — Existing LuXeBrief (PM2: luxebrief)
├── /var/www/n4s-rfq          — NEW: RFQ Portal frontend (React/Vite)
│   └── dist/                 — Static build served by Nginx
├── /var/www/n4s-rfq-api      — NEW: RFQ API backend (Express)
│   └── PM2: n4s-rfq-api      — Port 3002 (proxied by Nginx)
└── PostgreSQL                — rfq_db database (project-segregated)
```

### DNS
- `rfq.not-4.sale` → VPS Nginx → serves React app + proxies /api to Express

### Data Flow
```
Consultant → rfq.not-4.sale (React) → /api (Express on VPS) → PostgreSQL (rfq_db)
                                                                     ↑
N4S Main App → client-side fetch to rfq.not-4.sale/api → reads RFQ responses
```

The N4S main app (running on IONOS) calls the RFQ API via client-side JavaScript (not PHP), bypassing the IONOS outbound block. CORS configured to allow `*.not-4.sale` and `*.ionos.space` origins.

### Deployment Workflow
Same as LuXeBrief: `ssh root@VPS "cd /var/www/n4s-rfq && git pull && npm run build"` + `"cd /var/www/n4s-rfq-api && git pull && npm install && pm2 restart n4s-rfq-api"`. Manual SSH deploy — push to GitHub does NOTHING until SSH.

---

## 3. PROJECT SEGREGATION & LIBRARY ARCHIVE

### Database Design Principle
Every RFQ response is tagged with both `project_id` and `consultant_id`. This enables:
- **Project view**: "Show me all RFQ responses for Thornwood Estate" → filters by project_id
- **Library view**: "Show me all RFQ responses from Studio XYZ across all projects" → filters by consultant_id
- **Archive reuse**: When starting a new project, admin can pull a consultant's most recent RFQ from any prior project as a baseline

### Schema: Project Isolation
```sql
-- Projects table mirrors N4S project registry
CREATE TABLE rfq_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  n4s_project_id VARCHAR(100) NOT NULL UNIQUE,  -- Links to N4S main app
  project_name VARCHAR(255) NOT NULL,
  project_state VARCHAR(50),
  project_budget_range VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Each RFQ invitation is project-scoped
CREATE TABLE rfq_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rfq_projects(id),
  consultant_id VARCHAR(36) NOT NULL,           -- Links to gid_consultants on IONOS
  discipline VARCHAR(50) NOT NULL,
  access_token VARCHAR(64) NOT NULL UNIQUE,     -- URL token for consultant access
  access_password_hash VARCHAR(255) NOT NULL,   -- bcrypt hash of GID-managed password
  status VARCHAR(30) DEFAULT 'invited',         -- invited|in_progress|submitted|expired
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  invited_by VARCHAR(100) DEFAULT 'lra_team',
  cover_letter_variant VARCHAR(50) DEFAULT 'standard'
);

-- Responses stored per-invitation, per-section
CREATE TABLE rfq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES rfq_invitations(id),
  section_key VARCHAR(50) NOT NULL,             -- 'baseline' | 'discipline' | 'synergy' | 'capabilities'
  question_key VARCHAR(100) NOT NULL,
  response_type VARCHAR(20) NOT NULL,           -- 'text' | 'number' | 'select' | 'multiselect' | 'narrative'
  response_value TEXT,                          -- Raw value (JSON for structured, text for narratives)
  ai_parsed_score DECIMAL,                      -- AI scoring result (null until scored)
  ai_parsed_notes TEXT,                         -- AI parsing rationale
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invitation_id, question_key)
);

-- Portfolio projects submitted in RFQ (structured data)
CREATE TABLE rfq_portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES rfq_invitations(id),
  project_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  budget_usd BIGINT,
  square_footage INT,
  completion_year INT,
  style_description TEXT,
  key_features TEXT,                            -- JSON array
  publications TEXT,                            -- JSON array
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library archive: admin-only cross-project consultant profiles
CREATE VIEW rfq_library AS
SELECT
  i.consultant_id,
  i.discipline,
  p.project_name,
  p.n4s_project_id,
  i.status,
  i.submitted_at,
  r.section_key,
  r.question_key,
  r.response_type,
  r.response_value,
  r.ai_parsed_score
FROM rfq_invitations i
JOIN rfq_projects p ON i.project_id = p.id
LEFT JOIN rfq_responses r ON r.invitation_id = i.id
WHERE i.status = 'submitted';
```

### Access Control
- **Admin (Michael/LRA team)**: Full access to all projects, library archive, scoring, RFQ management. Authenticated via N4S session.
- **Consultant**: Access ONLY to their own invitation via token + password. Cannot see other consultants, other projects, or any N4S data. The RFQ portal is a completely isolated experience.

---

## 4. RFQ QUESTION ARCHITECTURE

### Design Principles
1. **Qualitative vs Quantitative split** — Every question is typed. Quantitative responses score algorithmically. Qualitative narratives are AI-parsed against the client profile.
2. **Progressive disclosure** — Sections presented one at a time (like Taste Exploration). Consultant can save progress and return.
3. **Discipline branching** — Universal sections shown to all; discipline-specific sections shown only to the relevant discipline.
4. **Project-contextual** — Tier 4 questions dynamically generated from FYI data.

### Section Structure

```
Section 1: FIRM BASELINE (Universal, Quantitative)
Section 2: DISCIPLINE PROFILE (Discipline-specific, Mix)
Section 3: PORTFOLIO EVIDENCE (Discipline-specific, Structured)
Section 4: WORKING STYLE & SYNERGY (Universal, Mix)
Section 5: PROJECT CAPABILITIES (Project-specific, Mix)
```

---

## 5. THE COMPLETE QUESTION SET

### SECTION 1: FIRM BASELINE (All Disciplines — Quantitative)

| # | Question | Input Type | Scoring |
|---|----------|-----------|---------|
| 1.1 | Legal firm name | Text | Identity |
| 1.2 | Principal/lead contact name | Text | Identity |
| 1.3 | Primary office location (city, state) | Text | Geographic alignment |
| 1.4 | Additional office locations | Multi-text | Geographic reach |
| 1.5 | Year firm established | Number | Experience calc |
| 1.6 | Total firm headcount | Dropdown: 1-5 / 6-15 / 16-30 / 31-50 / 50+ | Scale alignment |
| 1.7 | Staff dedicated to luxury residential ($10M+) | Dropdown: 1-3 / 4-8 / 9-15 / 15+ | Capacity signal |
| 1.8 | Luxury residential projects completed (last 5 years) | Dropdown: 1-3 / 4-8 / 9-15 / 15+ | Track record |
| 1.9 | Active projects currently in progress | Dropdown: 1-2 / 3-5 / 6-10 / 10+ | Availability signal |
| 1.10 | Average project budget range | Dropdown: $5-10M / $10-20M / $20-50M / $50M+ | Scale match |
| 1.11 | Annual fee revenue band | Dropdown: $1-5M / $5-10M / $10M+ | Financial resilience |
| 1.12 | Active professional licenses (states) | Multi-select checklist | Deal-breaker gate |
| 1.13 | Professional liability insurance limit | Dropdown: $1-2M / $2-5M / $5-10M / $10M+ | Risk gate |
| 1.14 | Claims history (last 10 years) | Dropdown: None / 1-2 resolved / 3+ or pending | Risk flag |
| 1.15 | Fee structure basis | Dropdown: % of construction / Fixed fee / Hourly / Hybrid | Commercial fit |
| 1.16 | Professional memberships | Multi-select: AIA / ASID / CMAA / NAHB / ULI / AGC / Other | Credentialing |

### SECTION 2: DISCIPLINE PROFILE

#### 2A: ARCHITECT

| # | Question | Input Type | Scoring |
|---|----------|-----------|---------|
| 2A.1 | Describe your design philosophy and how you approach luxury residential projects. | Narrative (500 word min) | AI: philosophy alignment with client taste |
| 2A.2 | How would you characterize your firm's aesthetic position on the traditional-to-contemporary spectrum? How do you adapt when a client's taste differs from your signature? | Narrative | AI: style flexibility + AS position derivation |
| 2A.3 | Describe your typical design process from programming through construction administration. What are your key milestones and deliverables at each phase? | Narrative | AI: methodology fit with client working prefs |
| 2A.4 | Who would be the lead designer and day-to-day project contact? Describe the proposed team structure for a project of this scale. | Narrative | AI: team depth + principal involvement |
| 2A.5 | BIM maturity level | Dropdown: 2D CAD only / BIM Level 1 / BIM Level 2 / Full BIM + Digital Twin | Quantitative: tech compatibility |
| 2A.6 | Primary design software | Multi-select: Revit / ArchiCAD / Rhino / SketchUp / AutoCAD / Other | Quantitative: tech stack |
| 2A.7 | Design awards or publications (list up to 5) | Structured repeater | Credentialing signal |

#### 2B: INTERIOR DESIGNER

| # | Question | Input Type | Scoring |
|---|----------|-----------|---------|
| 2B.1 | Describe your approach to interior design for luxury residences. What distinguishes your firm's work? | Narrative (500 word min) | AI: philosophy alignment |
| 2B.2 | How do you approach material selection, custom fabrication, and FF&E budgeting at the ultra-luxury tier? | Narrative | AI: process sophistication + budget awareness |
| 2B.3 | Describe your ideal collaboration model with the project architect. How do you manage the architecture-interiors boundary? | Narrative | AI: collaboration style (feeds Synergy Sandbox) |
| 2B.4 | How do you integrate wellness design, home automation, and technology into your interiors? | Narrative | AI: proptech/wellness alignment with FYI features |
| 2B.5 | FF&E procurement model | Dropdown: Open-book with markup / Net pricing to client / Inclusive in design fee / Hybrid | Commercial fit |
| 2B.6 | Key vendor and artisan relationships (describe specialties) | Narrative | AI: supply chain depth |
| 2B.7 | Design awards or publications (list up to 5) | Structured repeater | Credentialing signal |

#### 2C: PROJECT MANAGER / OWNER'S REP

| # | Question | Input Type | Scoring |
|---|----------|-----------|---------|
| 2C.1 | Describe your approach to owner representation on luxury residential projects. How do you define the boundaries of your role? | Narrative (500 word min) | AI: philosophy alignment |
| 2C.2 | How do you identify, track, and mitigate project risks? Describe a specific example. | Narrative | AI: risk management sophistication |
| 2C.3 | What systems and tools do you use for budget tracking, schedule management, and client reporting? | Narrative | AI: methodology depth + tech stack |
| 2C.4 | Describe your experience with permitting, inspections, and regulatory processes in the relevant jurisdiction. | Narrative | AI: jurisdictional knowledge |
| 2C.5 | Reporting cadence to client | Dropdown: Weekly / Bi-weekly / Monthly / Milestone-based | Quantitative: client engagement model |
| 2C.6 | Primary PM software | Multi-select: Procore / Newforma / MS Project / Primavera / Buildertrend / Other | Tech compatibility |
| 2C.7 | CMAA certification or equivalent | Dropdown: Yes / In progress / No | Credentialing |

#### 2D: GENERAL CONTRACTOR

| # | Question | Input Type | Scoring |
|---|----------|-----------|---------|
| 2D.1 | Describe your approach to luxury residential construction. What distinguishes your firm from high-end custom builders? | Narrative (500 word min) | AI: philosophy alignment |
| 2D.2 | How do you manage quality control? Describe your inspection processes and first-time-fix approach. | Narrative | AI: quality management sophistication |
| 2D.3 | Describe your cost estimation methodology and approach to budget management. Open-book, stipulated sum, or hybrid? How do you handle change orders? | Narrative | AI: commercial transparency + process |
| 2D.4 | Describe your subcontractor network for specialty trades (list key subs for: foundation/structural, MEP, millwork, stone/tile, AV/low-voltage, pool/spa). | Narrative | AI: trade network depth |
| 2D.5 | Bonding capacity | Dropdown: Up to $5M / $5-15M / $15-30M / $30M+ / Not applicable | Risk gate |
| 2D.6 | Construction scheduling methodology | Dropdown: CPM / Lean / Pull planning / Hybrid | Quantitative: methodology |
| 2D.7 | Primary construction management software | Multi-select: Procore / Buildertrend / CoConstruct / PlanGrid / Sage / Other | Tech compatibility |

### SECTION 3: PORTFOLIO EVIDENCE (All Disciplines — Structured)

Repeater block (minimum 3, maximum 5):

| Field | Input Type | Notes |
|-------|-----------|-------|
| Project name | Text | Required |
| Location (city, state) | Text | Required |
| Construction budget | Dropdown: $5-10M / $10-20M / $20-50M / $50-100M / $100M+ | Required |
| Square footage | Number | Required |
| Completion year | Number | Required |
| Architectural style | Text | "Contemporary Mediterranean", etc. |
| Your role/scope | Narrative (brief) | What specifically did your firm do? |
| Key luxury features | Multi-select checklist (generated from common features) | Wine cellar, theater, pool, etc. |
| Publications/awards | Text | Optional |
| Client reference available | Yes/No | Required |

### SECTION 4: WORKING STYLE & SYNERGY (All Disciplines — Mix)

These responses feed the Synergy Sandbox algorithm:

| # | Question | Input Type | Scoring |
|---|----------|-----------|---------|
| 4.1 | Preferred communication cadence with project team | Dropdown: Real-time (Slack/text) / Daily check-in / Weekly structured / Milestone-based | Synergy: cadence compatibility |
| 4.2 | Preferred meeting format | Dropdown: In-person / Video / Hybrid / Written updates | Synergy: meeting compatibility |
| 4.3 | When project conflicts arise between disciplines, your default approach is: | Dropdown: Collaborative problem-solving / Seek compromise / Defer to hierarchy / Direct negotiation | Synergy: conflict style matrix |
| 4.4 | Decision-making speed preference | Dropdown: Fast iteration (decide, adjust) / Methodical deliberation / Consensus-driven | Synergy: pace compatibility |
| 4.5 | How do you prefer to collaborate with [Architect / ID / PM / GC]? (discipline-adaptive, asks about the OTHER three) | 3× Narrative (one per other discipline) | AI: cross-discipline compatibility |
| 4.6 | Describe a challenging cross-discipline dynamic you navigated on a past project and how you resolved it. | Narrative | AI: conflict maturity signal |
| 4.7 | What is your firm's approach to technology interoperability? How do you share models, documents, and data with other project team members? | Narrative | AI: tech integration readiness |
| 4.8 | Client accessibility: How do you typically keep the homeowner informed and involved? | Narrative | AI: client engagement model fit |

### SECTION 5: PROJECT CAPABILITIES (Project-Specific — Dynamic)

Generated from the active project's FYI space registry:

| Component | Source | Input Type |
|-----------|--------|-----------|
| Feature checklist | FYI spaces for this project | Multi-select: "Which of the following have you designed/built/managed?" |
| Per-feature experience | Each checked feature | Brief narrative: "Describe a relevant example" |
| Site typology experience | Project site type | "Have you worked on [coastal/alpine/urban/etc.] sites? Describe." |
| Jurisdictional experience | Project state | "Describe your experience working in [state]. Include permitting, local trade relationships." |

---

## 6. RFQ PORTAL UX FLOW

### Consultant Experience

```
1. Receives email with unique link: rfq.not-4.sale/respond?token=abc123
2. Cover letter page (adapted from reference material — professional, establishes context)
3. Login: enters password provided by LRA team
4. Welcome screen: project overview (name, general location, general scale — no client identity)
5. Progress bar: 5 sections, save & continue at any point
6. Section 1: Firm Baseline → dropdowns, numbers, checklists
7. Section 2: Discipline Profile → narratives + structured fields
8. Section 3: Portfolio Evidence → repeater blocks for 3-5 projects
9. Section 4: Working Style → dropdowns + narratives
10. Section 5: Project Capabilities → dynamic checklist from FYI
11. Review & Submit → read-only summary, confirm submission
12. Thank you screen
```

### Key UX Decisions
- **No project brief or client identity disclosed** — This is an RFQ (qualifications), not an RFP (proposal). Consultants describe THEIR capabilities. Project specifics are limited to: general location (state), general scale (budget range), and the features checklist.
- **Save progress** — Every field auto-saves on blur. Consultant can close browser and return via same link + password.
- **Section-based navigation** — Sidebar or top tabs showing completion status per section. Can navigate freely between sections.
- **Mobile-responsive** — Consultants may complete this on tablet/phone.
- **Timer/deadline** — Optional expiry date shown on invitation. After expiry, form becomes read-only.

---

## 7. PROFESSIONAL INTRODUCTORY LETTER (COVER PAGE)

Adapted from reference material, tied to Not4Sale and LRA:

---

**Subject:** Invitation to Respond: Not4Sale Luxury Residential Advisory — Request for Qualifications

Dear [Consultant Name / Firm Principal],

The landscape of ultra-luxury residential development is evolving. Today's high-net-worth clients demand more than exceptional design and construction — they expect seamless project delivery, where every member of the professional team operates in alignment.

The Not4Sale Luxury Residential Advisory (LRA) team has identified **[Firm Name]** as a leader in the luxury residential space based on [your published portfolio / industry recognition / our research / referral from ___]. We are formally inviting you to respond to this Request for Qualifications for an active engagement.

**About This Engagement:**
We are assembling a team of [Architect / Interior Designer / Project Manager / General Contractor] professionals for a luxury residential project in [State]. The project scope is in the [budget range] range.

**Why This Process:**
Rather than relying solely on network-based referrals, our advisory practice uses a structured qualification and compatibility analysis to match the right professionals with the right projects — and critically, with each other. Our goal is to eliminate the inter-discipline friction that undermines even the most talented teams.

**What We're Asking:**
The enclosed questionnaire captures both quantitative baseline data and qualitative insights about your firm's philosophy, process, and working style. This is not a proposal or fee negotiation — it is an opportunity to present your firm's qualifications and approach.

**Logistics:**
- Access the questionnaire at the link below using the provided credentials
- You may save your progress and return at any time
- Deadline for submission: [Date]
- Estimated completion time: 45-60 minutes

[Link] | Password: [provided separately]

We look forward to learning more about your firm and the possibility of working together on this landmark project.

Respectfully,

**The Luxury Residential Advisory Team**
Not4Sale LLC
[Contact Information]

---

## 8. SCORING ARCHITECTURE

### Phase 3: Matchmaking — Two-Pass Scoring

**Pass 1: Quantitative (Algorithmic — Direct)**

| Dimension | Source | Weight | Logic |
|-----------|--------|--------|-------|
| Deal-breaker gates | S1: licenses, insurance, claims | Binary | Any fail = disqualified |
| Scale match | S1: avg budget range, headcount | 15% | Budget band overlap with project |
| Financial resilience | S1: annual fee revenue, years established | 10% | Revenue band + longevity |
| Geographic alignment | S1: office locations vs project state | 10% | Same state = full, same region = partial |
| Capability coverage | S5: feature checklist vs FYI spaces | 20% | % of client's features covered |
| Portfolio relevance | S3: project budgets, SF, style | 15% | How closely submitted projects match this project |
| Tech compatibility | S2: software, BIM level | 5% | Platform overlap score |
| Credentials | S1: memberships, S2: awards | 5% | Weighted credential count |

**Pass 2: Qualitative (AI-Parsed)**

| Dimension | Source | Weight | AI Prompt Strategy |
|-----------|--------|--------|-------------------|
| Design philosophy alignment | S2 narratives | 10% | Compare against client taste profile (KYC + Taste Exploration) |
| Methodology fit | S2 process narratives | 5% | Compare against client working preferences (KYC P1.A.7) |
| Collaboration maturity | S4 narratives | 5% | Parse for conflict sophistication, adaptability signals |

**Combined Score:**
Quantitative (80%) + Qualitative (20%) = Individual Match Score (0-100)

The qualitative weight is intentionally lower because AI parsing has higher variance. As our confidence in parsing improves, weights can shift.

### Phase 4: Synergy Sandbox — Team Chemistry Scoring

Operates on Section 4 (Working Style) data across the 4-person team:

| Dimension | Data Points | Scoring Method |
|-----------|-------------|---------------|
| Communication cadence compatibility | 4.1 across team | Identical=10, adjacent=7, mismatched=3 |
| Meeting format compatibility | 4.2 across team | Matrix scoring |
| Conflict style matrix | 4.3 across team | Compatible pairs get +, conflicting pairs get - |
| Decision pace alignment | 4.4 across team | Standard deviation penalty (diverse paces = friction) |
| Cross-discipline narrative signals | 4.5 across team | AI: does Architect's view of GC collaboration match GC's view of Architect collaboration? |
| Tech interoperability | 4.7 + S2 software | Platform overlap across all 4 members |
| Feature coverage map | S5 checklists across team | Union of all 4 members' checked features vs FYI total |

**Output:**
- Team Synergy Score (0-100)
- Conflict Risk Nodes: specific pairs flagged with risk level + description
- Complementary Signals: positive alignment highlights
- Feature Coverage: % of FYI features covered by combined team experience

---

## 9. SYNERGY SANDBOX UI (Tab 5)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  SYNERGY SANDBOX                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ ARCHITECT │ │ INT DES  │ │  PM/OR   │ │    GC    │      │
│  │          │ │          │ │          │ │          │      │
│  │ [drag    │ │ [drag    │ │ [drag    │ │ [drag    │      │
│  │  slot]   │ │  slot]   │ │  slot]   │ │  slot]   │      │
│  │          │ │          │ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  TEAM SYNERGY: ███████████░░░  78/100                      │
│                                                             │
│  ⚠ CONFLICT NODES                    ✓ COMPLEMENTARY       │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ Arch ↔ GC: Comm        │  │ Arch ↔ ID: Style       │    │
│  │ cadence mismatch       │  │ alignment strong        │    │
│  │ Risk: Moderate         │  │                         │    │
│  └────────────────────────┘  └────────────────────────┘    │
│                                                             │
│  FYI COVERAGE: 14/17 features (82%)                        │
│  Missing: Wine vault (no team member has built one)         │
│           Motor court (GC has, Architect hasn't)            │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │ SAVED CONFIGURATIONS                              │      │
│  │ Team A: Smith + Rivera + CPM + Hensley  → 78/100 │      │
│  │ Team B: Smith + Chen + CPM + Monarch    → 84/100 │      │
│  │ [Compare Teams] [Generate Report]                 │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  CANDIDATE POOL (drag from here into slots above)          │
│  ┌─────────────────────────────────────────────────┐       │
│  │ 🏛 Architects    │ 🎨 Int Designers  │ ...       │       │
│  │ Smith Arch (82)  │ Rivera ID (76)    │           │       │
│  │ Jones Arch (71)  │ Chen Design (80)  │           │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Key Interactions
- **Drag candidates** from pool into discipline slots
- **Synergy score recalculates** in real-time on every swap
- **Save configuration** — stores team combo with score for comparison
- **Compare teams** — side-by-side view of 2-3 saved configurations
- **Generate report** — PDF output of selected team with full analysis

---

## 10. LIBRARY ARCHIVE

### Admin-Only View (accessible from GID Settings or separate admin route)

Provides cross-project access to all submitted RFQs:

- **Search by consultant**: Find any firm's RFQ responses across all projects
- **Search by discipline**: Browse all architect RFQs, all GC RFQs, etc.
- **Re-invite**: For a new project, pull a consultant's profile from a prior RFQ and send them an updated RFQ (pre-populated with their baseline data, only project-specific section needs updating)
- **Scoring history**: See how a consultant was scored on prior projects
- **Export**: Download consultant's RFQ as PDF for offline reference

This is NOT visible to consultants. It is the LRA team's intelligence database.

---

## 11. IMPLEMENTATION PHASES

### Phase 2A: RFQ Portal Foundation (Largest)
1. Set up VPS infrastructure: Nginx config, DNS, PostgreSQL database
2. Express API: auth system (token + password), CORS, project routes
3. Database schema creation (all tables from Section 3)
4. React portal app: section-based questionnaire UI
5. Cover letter/welcome page
6. Save progress + auto-save
7. Submit flow with confirmation
8. Question templates for all 4 disciplines (from Section 5)
9. Section 5 dynamic generation (fetch FYI data from N4S)

### Phase 2B: Shortlist Integration
10. "Send RFQ" button in Shortlist tab (generates invitation, copies link)
11. Password management UI in GID
12. Pipeline status sync (Shortlist reads from RFQ API)
13. Batch RFQ dispatch

### Phase 3: Matchmaking Deep Scoring
14. Quantitative scoring engine (Pass 1 from Section 8)
15. AI qualitative parsing integration (Pass 2)
16. Individual match score display with dimension breakdown
17. Replace current Matchmaking tab content with RFQ-based scoring

### Phase 4: Synergy Sandbox
18. Tab 5 UI with drag-and-drop slots
19. Team synergy scoring engine
20. Conflict node detection + complementary signals
21. FYI feature coverage map
22. Save/compare team configurations
23. Team comparison view
24. PDF report generation

### Phase 5: Polish
25. Library Archive admin view
26. Re-invite workflow
27. Professional introductory letter customization
28. Documentation tabs for Shortlist, Matchmaking, and Synergy Sandbox
29. LuXeBrief integration (client view of selected team)

---

## 12. NEW REPOS NEEDED

| Repo | Purpose | Deploy |
|------|---------|--------|
| `linczyc-MLX/N4S-RFQ` | RFQ Portal frontend (React/Vite) | Manual SSH to VPS |
| `linczyc-MLX/N4S-RFQ-API` | RFQ API backend (Express) | Manual SSH to VPS |

Main N4S repo continues as-is with GID module updates.

---

## 13. KEY DECISIONS RECORD

| Decision | Rationale |
|----------|-----------|
| VPS over IONOS FTP | Need real auth, outbound HTTPS, PostgreSQL, project isolation |
| Standalone app (not embedded) | Consultants must NOT see N4S internals. Clean, professional experience. |
| Token + password auth | Lightweight but secure. Password managed by GID, not consultant-chosen. |
| RFQ not RFP | We're assessing qualifications, not soliciting proposals. No project brief disclosed. |
| AI for qualitative, algorithm for quantitative | Play to each engine's strength. AI parses narrative nuance. Algorithm scores structured data. |
| 5 tabs with Synergy Sandbox | Team chemistry is the unique N4S value prop. Deserves its own dedicated space. |
| Library Archive admin-only | Cross-project consultant intelligence database. Huge efficiency for repeat engagements. |
| Annual fee revenue banding | Non-invasive financial signal. Ranges ($1-5M, $5-10M, $10M+) are acceptable to firms at this tier. |
