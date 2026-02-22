# Module: MVP (Mansion Validation Program)

> **Status**: ✅ Live | **Header**: #AFBDB0 | **Last Updated**: 2026-02-22

## Purpose
Space planning validation engine. Converts luxury residential methodology into scoring system evaluating floor plans against N4S standards using graph-based adjacency logic.

## Key Files
- `src/components/MVP/MVPModule.jsx` — Module root
- `src/mansion-program/` — Scoring engine (rules processor)
- `docs/MVP-NAVIGATION.md` — Navigation spec
- `docs/BAM-METHODOLOGY.md` — Full BAM scoring methodology (53K)
- `docs/BAM-SPECIFICATION.md` — Technical BAM spec

## Architecture
- **Graph-based rules processor** on minimal plan graphs (rooms + edges + tags)
- **A/N/B/S adjacency logic**: Adjacent / Near / Buffered / Separate
- **8-module scoring** with 80+ threshold for gate passage
- **4-phase workflow**: A (Kickoff) → B (Concept, Gate 1) → C (Schematic, Gate 2) → D (DD, Gate 3)

## 5 Critical Red Flags (Plan FAILS if any exist)
1. Guest circulation crosses primary suite threshold
2. Deliveries/refuse routes pass through FOH rooms
3. Zone 3 functions share walls/ceilings with Zone 0 bedrooms
4. No principal-level show kitchen
5. Guest route to dining/terrace crosses kitchen work aisle

## 5 Required Bridges
Butler Pantry, Guest Autonomy Node, Sound Lock Vestibule, Wet-Feet Intercept, Ops Core

## Acoustic Zone Classification
- Zone 0: Silent (bedrooms)
- Zone 1: Quiet (living, library)
- Zone 2: Active (kitchen, family)
- Zone 3: High-noise (media, gym, wellness)

## Data Flow
- Spaces/SF sourced from FYI via `transformFYIToMVPProgram()` (GOLDEN RULE)
- Preset data used ONLY for adjacency benchmarks
