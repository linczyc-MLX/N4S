# N4S Development Handover - January 17, 2026

## Project Overview
**N4S (Not-4-Sale)** is a luxury residential advisory platform with multiple modules:
- **KYC** - Know Your Client (questionnaire/profile)
- **FYI** - Find Your Inspiration (space planning)
- **MVP** - Mansion Validation Program
- **KYM** - Know Your Market (live property data via RapidAPI)
- **KYS** - Know Your Site
- **VMX** - Vision Matrix (cost estimation tool)

## Deployment URLs
- **IONOS Space**: https://home-5019406629.app-ionos.space/
- **FTP Site**: https://website.not-4.sale/
- **VMX Standalone**: https://home-5019398597.app-ionos.space/

## GitHub Repository
- **N4S**: https://github.com/linczyc-MLX/N4S
- **N4S-VisualMatrix (standalone)**: https://github.com/linczyc-MLX/N4S-VisualMatrix

---

## Session Summary (January 17, 2026)

### Issues Fixed

#### 1. VMX CSS Corruption (CRITICAL - RESOLVED)
**Problem**: VMX CSS had global selectors (`:root`, `body`, `*`, `.card`, `.label`, `h1`, `button`) that overwrote N4S global styles, breaking KYC and other modules.

**Solution**: Rewrote all VMX CSS to be scoped under `.vmx-scope`:
- `/src/components/VMX/vmx-index.css` - All 440+ lines scoped
- `/src/components/VMX/vmx-ui-overrides.css` - All 167 lines scoped
- `/src/components/VMX/VMXApp.tsx` - Added `<div className="vmx-scope">` wrapper

**Commit**: `218ef25`

#### 2. KYM API Key Missing in IONOS Build (RESOLVED)
**Problem**: KYM module showed "Add REACT_APP_RAPIDAPI_KEY for live property listings" because the IONOS build workflow was missing the environment variable.

**Solution**: Added `REACT_APP_RAPIDAPI_KEY: ${{ secrets.REACT_APP_RAPIDAPI_KEY }}` to `.github/workflows/N4S-build.yaml` line 39.

**Commit**: `1851f28`

#### 3. VMX Data Handoff Issues (RESOLVED)
**Problem**: Data from N4S modules (KYC, FYI, KYS) wasn't properly populating VMX.

**Solution**: Fixed `VMXModule.jsx`:
- `version: '1'` → `version: 1` (number not string)
- `compareModeEnabled` → `compareMode`
- `typologyId` → `typology`
- Tier values mapped to lowercase (`select`, `reserve`, `signature`, `legacy`)

**Commit**: `93c162b`

#### 4. VMX Save Button (ADDED)
**Feature**: Added teal SAVE button to VMX header matching N4S styling pattern.

**Location**: `/src/components/VMX/VMXApp.tsx` lines 1691-1708

**Commit**: `8865ce6`

---

## Key Technical Details

### VMX Integration Architecture
```
window.__N4S_VMX_CONTEXT__ = {
  version: 1,                    // number, not string
  projectId: string,
  clientName: string,
  projectName: string,
  compareMode: boolean,          // not 'compareModeEnabled'
  scenarioA: {
    areaSqft: number,
    tier: 'select'|'reserve'|'signature'|'legacy',  // lowercase
    typology: 'suburban'|'hillside'|'waterfront'|'urban'|'rural'|'desert',
    landCost: number,
    regionId: string,
  }
}
```

### Tier Mapping (N4S → VMX)
| N4S Quality Tier | VMX Tier |
|-----------------|----------|
| standard | select |
| premium | reserve |
| luxury | signature |
| ultra | legacy |

### CSS Scoping Pattern
All VMX styles must be under `.vmx-scope`:
```css
/* CORRECT */
.vmx-scope .card { ... }
.vmx-scope button { ... }

/* WRONG - will corrupt N4S */
.card { ... }
button { ... }
```

---

## Files Modified This Session

| File | Changes |
|------|---------|
| `src/components/VMX/vmx-index.css` | Full CSS scoping + topBar/save button styles |
| `src/components/VMX/vmx-ui-overrides.css` | Full CSS scoping |
| `src/components/VMX/VMXApp.tsx` | vmx-scope wrapper + save button |
| `src/components/VMX/VMXModule.jsx` | Data handoff fixes |
| `.github/workflows/N4S-build.yaml` | Added REACT_APP_RAPIDAPI_KEY |

---

## Pending / Known Issues

1. **Sidebar styling** - User reported sidebar looked different; may be browser cache issue. Should be resolved with latest deployment.

2. **Data persistence** - VMX auto-saves to localStorage. Consider adding backend sync for N4S database persistence.

3. **KYC Lite/Full toggle** - User mentioned P1.A.8/9 sections were missing. May need investigation if issue persists after CSS fix.

---

## GitHub Secrets Required
- `REACT_APP_RAPIDAPI_KEY` - For KYM live property data
- `DB_PASSWORD` - Database password
- `FTP_PASSWORD` - FTP deployment
- `IONOS_API_KEY` - IONOS deployment
- `IONOS_SSH_KEY` - IONOS SSH access

---

## Commit History (Recent)
```
8865ce6 Add SAVE button to VMX module header
1851f28 Fix IONOS build: Add REACT_APP_RAPIDAPI_KEY to build environment
218ef25 URGENT: Scope all VMX CSS to prevent N4S module corruption
93c162b Fix N4S → VMX data handoff and remove redundant view toggle
d2e2827 Update VMX module to latest version matching standalone VMX
1f31c1f Add VMX (Vision Matrix) module integration
```

---

## Starting Next Session

To continue work on N4S, reference this file and the `CLAUDE.md` in the repo root which contains project-wide context.

Key commands:
```bash
cd /path/to/N4S-clone
npm install
npm start        # Development server
npm run build    # Production build
```

---

*Last updated: January 17, 2026*
