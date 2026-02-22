# Module: VMX (Visual Matrix)

> **Status**: ✅ Live (separate app) | **Header**: #FBD0E0 | **Last Updated**: 2026-02-22

## Purpose
Partner alignment analysis — visual matrix comparing design preferences and compatibility across project stakeholders.

## Key Files
- `src/components/VMX/` — Wrapper components in main N4S app (4 files)
- **Separate repo**: `github.com/linczyc-MLX/N4S-VisualMatriX`
- Deployed: `home-5019398597.app-ionos.space`

## Architecture
- **Vite app** (outputs to `dist/` folder, NOT `build/`)
- Embedded in N4S via iframe or direct integration
- CSS fully scoped under `.vmx-module` class to prevent style bleed
- N4S-hosted CSS uses `.vmx-module` scoping

## Deployment
- Separate GitHub Actions workflow → IONOS static hosting
- Independent from main N4S deploy cycle
