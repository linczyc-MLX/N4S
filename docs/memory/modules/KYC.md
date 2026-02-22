# Module: KYC (Know Your Client)

> **Status**: ✅ Live | **Header**: #315098 | **Last Updated**: 2026-02-22

## Purpose
Client intake questionnaire capturing lifestyle, taste preferences, working style, and portfolio context. Two principals supported (Primary + Secondary/Partner).

## Key Files
- `src/components/KYC/KYCModule.jsx` — Module root, section navigation
- `src/components/KYC/KYCModule.css` — Module styles
- `src/hooks/useKYCData.js` — KYC data extraction hook
- Full spec: `docs/KYC-REVISION-TRACKER.md`

## Data Structure
- Data stored in `kycData` within AppContext project state
- **Client names**: `kycData.principal.portfolioContext` (NOT designIdentity)
- **designIdentity**: Used for Taste Exploration data only
- Principal sections: P1.A (Lifestyle/Space/Taste), P1.B (Cultural Context), P1.C (Working Preferences)

## Secondary/Partner Scope
- Only P1.A.5/6/7 (Taste, Lifestyle, Space)
- Selections are ADDITIVE, not deviations from primary
- No Cultural Context or Working Preferences screens for Secondary

## Key Patterns
- Section-based navigation with completion tracking
- Auto-save on field blur
- KYC Profile Report PDF available in public/docs/
