# N4S Cloudinary Image Setup Guide

## Current Configuration

**Account**: `drhp5e0kl`
**Base URL**: `https://res.cloudinary.com/drhp5e0kl/image/upload`

## Required Folder Structure

Create these folders in your Cloudinary Media Library:

```
N4S/
├── space-renders/          # Room visualization images
│   ├── FOY_S.jpg          # Foyer - Small
│   ├── FOY_M.jpg          # Foyer - Medium
│   ├── FOY_L.jpg          # Foyer - Large
│   ├── KIT_M.jpg          # Kitchen - Medium (priority)
│   ├── PBD_M.jpg          # Primary Bedroom - Medium (priority)
│   └── ...
│
├── floor-plans/           # SVG floor plan diagrams
│   ├── FOY_plan.svg
│   ├── KIT_plan.svg
│   └── ...
│
└── zone-covers/           # Zone header images
    ├── Z1_APB_cover.jpg   # Arrival + Public
    ├── Z2_FAM_cover.jpg   # Family + Kitchen
    ├── Z3_ENT_cover.jpg   # Entertainment
    ├── Z4_WEL_cover.jpg   # Wellness
    ├── Z5_PRI_cover.jpg   # Primary Suite
    ├── Z6_GST_cover.jpg   # Guest + Secondary
    ├── Z7_SVC_cover.jpg   # Service + BOH
    └── Z8_OUT_cover.jpg   # Outdoor Spaces
```

## Naming Convention

### Space Renders
```
{SPACE_CODE}_{SIZE}.jpg
```
- SPACE_CODE: 3-4 letter code (FOY, KIT, PBD, GST1)
- SIZE: S (Small), M (Medium), L (Large)
- Examples: `KIT_M.jpg`, `PBD_L.jpg`, `GST1_M.jpg`

### Floor Plans
```
{SPACE_CODE}_plan.svg
```
- Prefer SVG for scalability
- Examples: `KIT_plan.svg`, `FAM_plan.svg`

### Zone Covers
```
{ZONE_CODE}_cover.jpg
```
- 8 zones total
- Examples: `Z1_APB_cover.jpg`, `Z2_FAM_cover.jpg`

## Priority Images (Phase 1)

Upload these 10 spaces first (M size only):

| Code | Space Name | Filename |
|------|-----------|----------|
| FOY | Foyer / Gallery | `FOY_M.jpg` |
| GRT | Great Room | `GRT_M.jpg` |
| DIN | Formal Dining | `DIN_M.jpg` |
| FAM | Family Room | `FAM_M.jpg` |
| KIT | Kitchen | `KIT_M.jpg` |
| PBD | Primary Bedroom | `PBD_M.jpg` |
| PBT | Primary Bath | `PBT_M.jpg` |
| GST1 | Guest Suite 1 | `GST1_M.jpg` |
| GYM | Fitness / Gym | `GYM_M.jpg` |
| TER | Main Terrace | `TER_M.jpg` |

## Image Specifications

### Space Renders
- **Dimensions**: 1600×1000px (16:10 aspect ratio)
- **Format**: JPEG, optimized
- **Quality**: 80-85%
- **Style**: Luxury residential interior photography
- **Note**: Can use ArchiPrompt-generated images from Midjourney

### Floor Plans
- **Format**: SVG (preferred) or PNG with transparency
- **Style**: Clean architectural diagram
- **Colors**: Monochrome or subtle palette

### Zone Covers
- **Dimensions**: 1200×400px (3:1 aspect ratio)
- **Format**: JPEG
- **Style**: Atmospheric, evocative of zone purpose

## URL Patterns in Code

The space-registry.js uses these URL generators:

```javascript
// Space render
const url = `https://res.cloudinary.com/drhp5e0kl/image/upload/N4S/space-renders/KIT_M.jpg`;

// Floor plan
const url = `https://res.cloudinary.com/drhp5e0kl/image/upload/N4S/floor-plans/KIT_plan.svg`;

// Zone cover
const url = `https://res.cloudinary.com/drhp5e0kl/image/upload/N4S/zone-covers/Z2_FAM_cover.jpg`;
```

## Migration from Current Structure

Your current "Floor Plans" folder contains:
```
Primary_Bedroom_satyyp.jpg
```

**Rename to**:
```
PBD_M.jpg
```

And move to `N4S/space-renders/` folder.

## Batch Upload Script

If you have images locally, use Cloudinary's upload API:

```bash
# Using Cloudinary CLI
cloudinary uploader upload my_foyer.jpg \
  public_id="N4S/space-renders/FOY_M" \
  folder="N4S/space-renders"
```

Or use the Cloudinary console's Upload widget with folder selection.

## Fallback Behavior

When an image is not found in Cloudinary, the FYI module:
1. Shows a placeholder icon
2. Displays "Add Image" prompt
3. Allows user to upload their own inspiration image
4. Stores user uploads in localStorage (base64)

## Next Steps

1. [ ] Create `N4S` folder in Cloudinary
2. [ ] Create `space-renders`, `floor-plans`, `zone-covers` subfolders
3. [ ] Upload 10 priority space images (M size)
4. [ ] Test URLs in browser
5. [ ] Upload remaining spaces as available
