# N4S Master Architecture

> **Last Updated**: 2026-02-22
> **Current Phase**: BYT (Build Your Team) — RFQ scoring + Synergy Sandbox

---

## 1. Platform Overview

**N4S (Not4Sale)** — Luxury residential advisory platform for UHNW families and family offices.
**Operator**: MLX Consulting / Luxury Residential Advisory (LRA) team.
**Target**: Custom homes 10,000–20,000+ SF, budgets $10M–$100M+.

### Modules (10)

| # | Code | Name | Status | Header Color |
|---|------|------|--------|-------------|
| 0 | DASH | Dashboard | ✅ Live | #1e3a5f |
| 1 | KYC | Know Your Client | ✅ Live | #315098 |
| 2 | FYI | Find Your Inspiration | ✅ Live | #8CA8BE |
| 3 | MVP | Mansion Validation Program | ✅ Live | #AFBDB0 |
| 4 | KYM | Know Your Market | ✅ Live | #E4C0BE |
| 5 | KYS | Know Your Site | ✅ Live | #374151 |
| 6 | VMX | Visual Matrix | ✅ Live (separate app) | #FBD0E0 |
| 7 | BYT | Build Your Team (GID) | 🔄 Active Dev | #D4A574 |
| 8 | SET | Settings | ✅ Live | #374151 |
| 9 | LCD | LuXeBrief Client Dashboard | ✅ Live (separate app) | — |

---

## 2. Technology Stack

### Frontend
- **React 18** (Create React App) — `src/`
- **No UI framework** — custom CSS per module (`{Module}Module.css`)
- **Fonts**: Playfair Display (headings), Inter (body)
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDFs**: ReportLab (Python, run locally for static docs), PDFKit/jsPDF for dynamic

### Backend
- **PHP** (website.not-4.sale) — REST API at `/api/*.php`
- **MySQL** (IONOS shared hosting) — primary database
- **PostgreSQL** (VPS) — RFQ Portal database (`rfq_db`)
- **Express/Node** (VPS) — RFQ API + LuXeBrief

### Hosting

| Component | Host | URL | Deploy |
|-----------|------|-----|--------|
| N4S Frontend | IONOS static | home-*.app-ionos.space | GitHub Actions auto-deploy on push to main |
| N4S PHP API | IONOS FTP | website.not-4.sale/api/ | GitHub Actions (same deploy) |
| RFQ Portal | VPS 74.208.250.22 | rfq.not-4.sale | Manual SSH: `deploy/redeploy.sh` |
| RFQ API | VPS 74.208.250.22 | rfq.not-4.sale/api | Manual SSH: PM2 `n4s-rfq-api` |
| LuXeBrief | VPS 74.208.250.22 | *.luxebrief.not-4.sale | Manual SSH: PM2 `luxebrief` |
| VMX | IONOS static | home-*.app-ionos.space | Separate repo, GitHub Actions |
| Taste Admin | IONOS FTP | tasteexploration.not-4.sale | FTP to /NFS/TASTE/ADMIN/ |

---

## 3. File Tree (Key Paths)

```
N4S/
├── api/                          # PHP backend (deployed to IONOS FTP)
│   ├── config.php                # DB connection (imports config-secrets.php)
│   ├── config-secrets.php        # ⚠️ FTP ONLY — gitignored, never in repo
│   ├── auth.php                  # Session auth
│   ├── state.php                 # Project state CRUD (project_data JSONB)
│   ├── projects.php              # Project management
│   ├── users.php                 # User management
│   ├── gid.php                   # BYT/GID: consultants, engagements, discovery
│   ├── gid-ai-config.php         # BYT AI model config endpoint
│   ├── gid-discovery-ai.php      # BYT AI discovery proxy
│   ├── taste.php                 # Taste Exploration API
│   └── portal.php                # LuXeBrief portal data
│
├── src/
│   ├── App.jsx                   # Root — routing, module switching, docs overlay
│   ├── index.js                  # Entry point
│   ├── contexts/
│   │   ├── AppContext.jsx         # ⚠️ MASTER CONTEXT — all module data, load/save
│   │   └── AuthContext.jsx        # Auth state
│   ├── services/
│   │   ├── api.js                # IONOS API helpers (relative /api paths!)
│   │   └── rfqApi.js             # VPS RFQ API helpers (rfq.not-4.sale)
│   ├── hooks/
│   │   └── useKYCData.js         # KYC data extraction hook
│   ├── data/
│   │   ├── tasteConfig.js        # Taste quad configuration
│   │   └── tasteQuads.js         # 110 taste exploration quads
│   ├── components/
│   │   ├── BYT/                  # Build Your Team (21 files)
│   │   │   ├── BYTModule.jsx     # Module root
│   │   │   ├── BYTModule.css     # Module styles
│   │   │   ├── screens/          # 6 tab screens
│   │   │   └── utils/            # useBYTConfig, configResolver, matchingAlgorithm
│   │   ├── KYC/                  # Know Your Client (13 files)
│   │   ├── FYI/                  # Find Your Inspiration (13 files)
│   │   ├── MVP/                  # Mansion Validation Program (12 files)
│   │   ├── KYM/                  # Know Your Market (8 files)
│   │   ├── KYS/                  # Know Your Site (6 files)
│   │   ├── VMX/                  # Visual Matrix wrapper (4 files, main app separate)
│   │   ├── LCD/                  # LuXeBrief Client Dashboard (2 files)
│   │   ├── Settings/             # Settings (6 files)
│   │   ├── TasteExploration/     # Taste admin (1 file)
│   │   └── shared/               # Shared components (3 files)
│   ├── mansion-program/          # MVP scoring engine
│   ├── styles/                   # Global styles
│   └── utils/                    # Shared utilities
│
├── docs/                         # All documentation
│   ├── memory/                   # ⭐ CLAUDE MEMORY SYSTEM (this structure)
│   ├── SESSION-LOG.md            # Running session log
│   ├── N4S-BRAND-GUIDE.md        # Visual identity standards
│   └── *.md                      # Module specs, handovers, audits
│
├── public/
│   └── docs/                     # Static PDF reports (generated by ReportLab)
│
└── .github/workflows/            # GitHub Actions CI/CD
```

---

## 4. Data Architecture

### IONOS MySQL (website.not-4.sale)
| Table | Purpose |
|-------|---------|
| `project_data` | Master project state — JSONB blob per project |
| `users` | User accounts |
| `gid_consultants` | BYT consultant registry |
| `gid_discovery_candidates` | AI-discovered candidates per project |
| `gid_engagements` | Pipeline tracking (shortlist → RFQ → scoring) |
| `gid_project_consultants` | Junction table for project-scoped consultants |
| `byt_global_config` | BYT Admin Panel global configuration |
| `byt_project_config` | BYT Admin Panel per-project overrides |

### VPS PostgreSQL (rfq_db)
| Table | Purpose |
|-------|---------|
| `rfq_projects` | Mirror of N4S projects |
| `rfq_invitations` | RFQ invitation tracking (token, status, expiry) |
| `rfq_responses` | Questionnaire answers (per invitation, per question) |
| `rfq_portfolio_projects` | Section 3 structured portfolio evidence |
| `rfq_question_templates` | Question definitions with scoring config |

### Data Flow Rules
1. **GOLDEN RULE**: FYI is source of truth for spaces/SF. Flows via `transformFYIToMVPProgram()`.
2. **API paths**: ALWAYS relative `/api` from frontend. Never absolute URLs to IONOS.
3. **IONOS limitation**: No outbound HTTPS from PHP (cURL + file_get_contents both blocked).
4. **RFQ data**: Client-side fetch from browser to `rfq.not-4.sale/api` bypasses IONOS block.
5. **project_data**: Single JSONB column stores all module state per project.
6. **Client names**: In `kycData.principal.portfolioContext` (NOT designIdentity).
7. **config-secrets.php**: Lives on FTP only, gitignored. Every deploy must NOT overwrite it.

---

## 5. Deployment

### N4S Main (auto-deploy)
```
Push to main → GitHub Actions → CI=false npm run build → output "build/" → deploy to IONOS
```
- Build failure blocks ALL deploys
- Static site at `app-ionos.space`, PHP API at `website.not-4.sale`
- Never suggest manual zip uploads

### RFQ Portal (manual SSH)
```bash
ssh root@74.208.250.22
cd /var/www/n4s-rfq && git pull && npm run build
cd /var/www/n4s-rfq-api && git pull && npm install && pm2 restart n4s-rfq-api
# Or use: deploy/redeploy.sh [api|frontend|both]
```

### LuXeBrief (manual SSH)
```bash
ssh root@74.208.250.22
cd /var/www/luxebrief && git pull && npm run build && pm2 restart luxebrief
```

---

## 6. Brand Standards (Quick Reference)

- **Navy**: #1e3a5f | **Gold**: #c9a227 | **Content BG**: #f7fafc
- **Fonts**: Playfair Display (headings), Inter (body)
- **Module headers**: Soft Pillow palette (see table in §1), white bg, NO icon
- **Reports**: Navy header bar, gold accents. Template: `N4SReportTemplate.js/.py`
- **Full spec**: `docs/N4S-BRAND-GUIDE.md` — ALWAYS read before creating any UI

---

## 7. External Repos

| Repo | Purpose | Deploy |
|------|---------|--------|
| `linczyc-MLX/N4S` | Main platform | GitHub Actions → IONOS |
| `linczyc-MLX/N4S-RFQ` | RFQ Portal frontend | Manual SSH → VPS |
| `linczyc-MLX/N4S-RFQ-API` | RFQ Portal backend | Manual SSH → VPS |
| `linczyc-MLX/N4S-VisualMatriX` | VMX app | GitHub Actions → IONOS |
| `linczyc-MLX/N4S-taste-app` | Taste Admin | FTP upload |
| `linczyc-MLX/LuXeBrief` | Client portal | Manual SSH → VPS |
| `linczyc-MLX/bestrentnj` | BestRentNJ (Ricky) | Railway |
