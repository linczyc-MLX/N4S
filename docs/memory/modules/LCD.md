# Module: LCD (LuXeBrief Client Dashboard)

> **Status**: ✅ Live (separate app) | **Last Updated**: 2026-02-22

## Purpose
Client-facing portal providing read-only visibility into project progress. Each client gets a branded subdomain with password access to view their project status across all N4S modules.

## Key Files (in N4S main)
- `src/components/LCD/` — 2 wrapper files in main N4S app
- `api/portal.php` — Portal data API

## Separate Application
- **Repo**: `linczyc-MLX/LuXeBrief`
- **Tech**: React + Express on VPS
- **URL pattern**: `{slug}.luxebrief.not-4.sale`
- **Hosting**: VPS 74.208.250.22, PM2 process `luxebrief`

## Deployment (Manual SSH only)
```bash
ssh root@74.208.250.22
cd /var/www/luxebrief && git pull && npm run build && pm2 restart luxebrief
```
⚠️ Push to GitHub does NOTHING until SSH deploy is executed.

## Active Portals
- `thornwood-estate` (password: Kittyhawk90)
- `demonstration` (password: Rawhide23)

## Key Patterns
- Progress = 20% per completed module
- `portalSlug` comes from `lcdData.portalSlug` (NOT auto-generated)
- KYC Profile Report PDF is live
- Footer text still shows old "Confidential" (ITR item)
