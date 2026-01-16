# CLAUDE.md - N4S Project Context

## Quick Start
- Run `git config --global http.proxy "$HTTPS_PROXY"` if needed
- Read all docs in `/docs/*.md` BEFORE any work
- PostgreSQL backend, IONOS PHP tier

## Project Overview

**N4S (Not4Sale)** is a luxury residential advisory platform for ultra-high-net-worth families and family offices. It helps plan and validate 10,000–20,000 SF luxury residences through structured workflows.

## Core Modules

| Module | Purpose | Status |
|--------|---------|--------|
| **KYC** | Know Your Client - 9-section client intake questionnaire | Complete |
| **FYI** | Find Your Inspiration - 110-quad taste exploration | Complete |
| **MVP** | Mansion Validation Program - Space planning & validation | Core Complete |
| **KYM** | Know Your Market - Market intelligence & land acquisition | Complete |
| **KYS** | Know Your Site - Site assessment & scoring | Complete |
| **VMX** | Vision Matrix - Partner alignment analysis | Deployed |

## Critical Paths
- Client names: `kycData.principal.portfolioContext` (NOT designIdentity)
- Taste data: `kycData.principal.designIdentity.principalTasteResults`
- FYI: 60 Cloudinary images, S/M/L sizing

## Tech Stack

- **Frontend**: React 18.2 + TypeScript (Create React App)
- **Styling**: Custom CSS with CSS Custom Properties (no framework)
- **Icons**: lucide-react
- **Validation**: Zod
- **PDF Generation**: jspdf + jspdf-autotable
- **Backend**: PHP API (IONOS hosted)
- **Database**: PostgreSQL

## Directory Structure

```
src/
├── App.jsx              # Main app component with routing
├── components/
│   ├── Dashboard.jsx    # Main dashboard
│   ├── FYI/             # Taste exploration module
│   ├── KYC/             # Client intake module
│   ├── KYM/             # Market intelligence module
│   ├── KYS/             # Site assessment module
│   ├── MVP/             # Mansion validation module
│   └── shared/          # Shared UI components
├── contexts/            # React context providers
├── data/                # Static data files
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── services/            # API service layer
├── styles/
│   ├── index.css                    # Main styles
│   ├── design-identity-styles.css   # Brand identity styles
│   └── taste-exploration.css        # FYI module styles
└── utils/               # Helper functions

api/                     # PHP backend
├── config.php           # Database configuration
├── projects.php         # Project CRUD operations
├── state.php            # State management
└── setup.php            # Database setup

docs/                    # Architecture & specification docs
```

## Key Documentation (in /docs/)

- `N4S-ARCHITECTURE.md` - Full technical architecture
- `N4S-BRAND-GUIDE.md` - Visual standards and design patterns (ALWAYS read before UI work)
- `KYM-SPECIFICATION.md` - Market module specs
- `KYS-SPECIFICATION.md` - Site assessment specs
- `BAM-METHODOLOGY.md` - Buy-a-Mansion methodology

## Brand Guide

**Primary Colors:**
- NAVY: `#1e3a5f`
- GOLD: `#c9a227`
- Background: `#fafaf8`
- Text: `#1a1a1a`
- Muted: `#6b6b6b`

**Module Headers (Soft Pillow Colors):**
- Dashboard: `#1e3a5f`
- KYC: `#315098`
- FYI: `#8CA8BE`
- MVP: `#AFBDB0`
- KYM: `#E4C0BE`
- VMX: `#FBD0E0`

**Typography:**
- Headings: Playfair Display
- Body/UI: Inter
- Use sentence case for headings (never all-caps)

## Commands

```bash
# Development
npm start                    # Start dev server

# Production
npm run build               # Build to /build folder

# Data integrity
npm run audit:data          # Run data audit script

# Check deployment status
gh run list --limit 5
```

## Deployment

**Auto-deploy:** Push to `main` triggers GitHub Actions
- Both ionos.space + website.not-4.sale deploy automatically
- NEVER suggest manual zip uploads
- NEVER hardcode absolute URLs - use relative `/api`

**Critical settings:**
1. `DEPLOYMENT_FOLDER` must be `build` (not `public`)
2. `package.json` must have `"homepage": "."`
3. SPA routing via `/public/.htaccess`

## IONOS Safeguards
- web.config must NOT have URL Rewrite rules
- FTP site (website.not-4.sale) has PHP
- IONOS app-ionos.space is static-only

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_RAPIDAPI_KEY` - RapidAPI key for KYM live data

## Code Patterns

1. **Components**: JSX files in `/src/components/`, organized by module
2. **State**: React Context for global state, local state for component-specific
3. **Styling**: CSS Custom Properties defined in `index.css`, component-specific styles inline or in module CSS files
4. **API calls**: Service layer in `/src/services/`

## Mansion Validation System

The MVP module uses:
- **A/N/B/S adjacency logic**: Adjacent, Near, Buffered, Separate
- **Acoustic zones 0-3**: Silent, Quiet, Active, High-noise
- **Two-node circulation**: Front Gallery + Formal / Family Hub + Service
- **80+ threshold** for module scores to pass validation

## Current Status
- KYM/BAM v3.0: Dual scores, Portfolio Context weights
- VMX: Deployed at home-5019398597.app-ionos.space
- Pending: Commit BAMScoring.js, KYMReportGenerator.js, SESSION-LOG.md

## Session End Protocol

When asked to "end session and prepare handover":
1. Update SESSION-LOG.md
2. Prepare handover doc with all changes
3. Propose complete files for review
4. Push only after user confirms

## Important Architectural Notes

1. TypeScript strict mode is OFF (`"strict": false` in tsconfig)
2. No external CSS framework - all custom styles
3. Images hosted on Cloudinary for FYI module (60 images, S/M/L sizing)
4. PHP backend handles state persistence and project data
