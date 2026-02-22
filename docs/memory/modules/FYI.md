# Module: FYI (Find Your Inspiration)

> **Status**: ✅ Live | **Header**: #8CA8BE | **Last Updated**: 2026-02-22

## Purpose
Taste Exploration system — 110 image quads across aesthetic dimensions. Generates design identity profile that feeds MVP space planning and BYT consultant matching.

## Key Files
- `src/components/FYI/FYIModule.jsx` — Module root
- `src/components/FYI/FYIModule.css` — Uses `fyi-module__*` prefix (unique, not shared module-header)
- `src/data/tasteQuads.js` — 110 quad definitions
- `src/data/tasteConfig.js` — Quad configuration
- Full spec: `docs/FYI-REVISION-ARCHITECTURE.md`

## Data Architecture
- **60 Cloudinary images** per quad set
- FYI is **source of truth** for spaces and square footage (GOLDEN RULE)
- Data flows via `transformFYIToMVPProgram()` to MVP
- Zone codes format: `Z1_APB` — always use `s.zoneName || s.zone`
- Space groups: Private, Living & Entertainment, Wellness & Recreation, Support Amenities

## Taste Admin
- Separate app: `tasteexploration.not-4.sale`
- Repo: `N4S-taste-app`, deployed via FTP to `/NFS/TASTE/ADMIN/`
- Image overrides: per-project JSONB + Cloudinary `projects/` subfolder

## Bedroom Naming Convention
Primary Suite → Jr Primary Suite → Guest Suite 1–3 → Kids Bunk Room

## Key Patterns
- Admin panel for custom rooms requires: code, displayName, zone, baseSF, MVP module, acoustic zone
- Preset data is ONLY for adjacency benchmarks — never overrides FYI-sourced data
