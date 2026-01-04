# N4S Cloudinary Image Setup Guide

## Current Configuration

**Account**: `drhp5e0kl`
**Base URL**: `https://res.cloudinary.com/drhp5e0kl/image/upload`

## Actual Folder Structure (as uploaded)

```
N4S/
├── Space_Renders/          # Room visualization images (PNG)
│   ├── FOY_M_xatei3.png
│   ├── GR_M_u47amm.png
│   ├── DR_M_aojuh0.png
│   ├── FR_M_jk6ujp.png
│   ├── KIT_M_bskgph.png
│   ├── PRI_M_ka98yn.png
│   ├── PRIBATH_M_hmsaqt.png
│   ├── GST1_M_g7lhny.png
│   ├── GYM_M_gvxtck.png
│   └── TERR_M_gtjpaj.png
│
├── floor-plans/           # SVG floor plan diagrams (future)
│   └── ...
│
└── zone-covers/           # Zone header images (future)
    └── ...
```

## Important: Cloudinary Behavior

Cloudinary automatically:
1. Adds unique suffixes to filenames (e.g., `_ka98yn`)
2. Preserves the file format you upload (PNG in this case)
3. Uses the folder path exactly as created

The `space-registry.js` now includes a mapping of these actual public IDs.

## Priority Spaces Uploaded ✓

All 10 priority spaces now have images:

| Code | Space | Public ID |
|------|-------|-----------|
| FOY | Foyer | `N4S/Space_Renders/FOY_M_xatei3` |
| GR | Great Room | `N4S/Space_Renders/GR_M_u47amm` |
| DR | Formal Dining | `N4S/Space_Renders/DR_M_aojuh0` |
| FR | Family Room | `N4S/Space_Renders/FR_M_jk6ujp` |
| KIT | Kitchen | `N4S/Space_Renders/KIT_M_bskgph` |
| PRI | Primary Bedroom | `N4S/Space_Renders/PRI_M_ka98yn` |
| PRIBATH | Primary Bath | `N4S/Space_Renders/PRIBATH_M_hmsaqt` |
| GST1 | Guest Suite 1 | `N4S/Space_Renders/GST1_M_g7lhny` |
| GYM | Gym | `N4S/Space_Renders/GYM_M_gvxtck` |
| TERR | Terrace | `N4S/Space_Renders/TERR_M_gtjpaj` |

## Adding New Images

When uploading new space renders:

1. Upload to `N4S/Space_Renders/` folder in Cloudinary
2. Name the file `{CODE}_{SIZE}` (e.g., `BAR_M`)
3. After upload, note the full public ID with suffix (e.g., `BAR_M_abc123`)
4. Add the mapping to `src/shared/space-registry.js`:

```javascript
const spaceRenderIds = {
  // ... existing entries
  'BAR_M': 'N4S/Space_Renders/BAR_M_abc123',
};
```

## URL Pattern

```javascript
// Generated URL format:
https://res.cloudinary.com/drhp5e0kl/image/upload/N4S/Space_Renders/PRI_M_ka98yn.png
```

## Fallback Behavior

When an image is not in the mapping:
1. `getSpaceRenderUrl()` returns `null`
2. FYI card shows placeholder with "Add Image" prompt
3. User can upload their own inspiration image
4. User uploads stored in localStorage (base64)

## Image Specifications

### Current Uploads
- **Dimensions**: 1456×816px
- **Format**: PNG
- **Size**: ~1.5-2MB each
- **Style**: Luxury residential interior renders

### For Future Uploads
Consider optimizing:
- Use JPG for smaller file sizes (~200-400KB)
- Resize to 1600×1000px max
- Use Cloudinary transformations for responsive delivery:
  ```
  /c_fill,w_800,h_500,q_auto,f_auto/
  ```

## Zone Covers (Future)

When ready to add zone cover images:

1. Create `N4S/zone-covers/` folder
2. Upload 8 images named `{ZONE_CODE}_cover` (e.g., `Z1_APB_cover`)
3. Add mapping to space-registry.js if Cloudinary adds suffixes

| Zone Code | Zone Name |
|-----------|-----------|
| Z1_APB | Arrival + Public |
| Z2_FAM | Family + Kitchen |
| Z3_ENT | Entertainment |
| Z4_WEL | Wellness |
| Z5_PRI | Primary Suite |
| Z6_GST | Guest + Secondary |
| Z7_SVC | Service + BOH |
| Z8_OUT | Outdoor Spaces |
