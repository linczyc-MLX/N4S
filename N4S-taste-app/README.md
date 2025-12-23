# N4S Taste Exploration

A standalone visual preference discovery application for luxury residential design clients.

## Overview

This application guides clients through a curated visual journey across 10 design categories, helping identify their aesthetic preferences through image selection. The results generate a comprehensive design profile used in subsequent advisory phases.

## Image Hosting

**Images are hosted separately from the application.**

```
Image Base URL: http://do-great.work/PRESENTATIONS/NFS/LIBRARY/IMAGES/
Pattern: {QUAD_ID}_{INDEX}.png
Example: http://do-great.work/PRESENTATIONS/NFS/LIBRARY/IMAGES/EA-001_0.png
```

The 440 images (110 quads × 4 images each) are stored on IONOS web hosting and referenced by URL.

## Categories

| Category | Code | Quads | Images |
|----------|------|-------|--------|
| Living Spaces | LS | 12 | 48 |
| Exterior Architecture | EA | 12 | 48 |
| Dining Spaces | DS | 9 | 36 |
| Kitchens | KT | 9 | 36 |
| Family Areas | FA | 12 | 48 |
| Primary Bedrooms | PB | 12 | 48 |
| Primary Bathrooms | PBT | 12 | 48 |
| Guest Bedrooms | GB | 8 | 32 |
| Exterior Landscape | EL | 16 | 64 |
| Outdoor Living | OL | 8 | 32 |
| **Total** | | **110** | **440** |

## Deployment to IONOS Deploy Now

### Prerequisites
- GitHub account
- IONOS Deploy Now account (you have 3 slots)

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository: `n4s-taste-exploration`
2. Clone it locally or use GitHub web upload

### Step 2: Upload Application Files

Upload all files from this package to your repository:
```
n4s-taste-app/
├── package.json
├── tsconfig.json
├── public/
│   └── index.html
└── src/
    ├── index.tsx
    ├── index.css
    ├── App.tsx
    ├── App.css
    ├── config/
    │   └── tasteConfig.ts
    ├── data/
    │   └── quadMetadata.ts
    └── types/
        └── tasteTypes.ts
```

### Step 3: Connect to IONOS Deploy Now

1. Log in to IONOS Deploy Now
2. Click "Add New Project"
3. Select your GitHub repository: `n4s-taste-exploration`
4. Configure build settings:

```
Framework: Create React App (should auto-detect)
Build Command: npm install && CI=false npm run build
Output Directory: build
```

**Important:** Use `CI=false` before `npm run build` to prevent warnings from failing the build.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Access your app at the provided URL (ending in ...633 based on your setup)

## Configuration

### Changing Image Source

If you move images to a different location, update `src/config/tasteConfig.ts`:

```typescript
export const TASTE_IMAGE_BASE_URL = 'http://your-new-url.com/path/to/images';
```

### Enabling/Disabling Quads

Edit `src/data/quadMetadata.ts` and set `enabled: false` for any quad you want to hide:

```typescript
'LS-001': {
  quadId: 'LS-001',
  enabled: false,  // This quad won't appear
  // ...
}
```

## Features

- **Session Persistence**: Progress auto-saves to localStorage
- **Resume Capability**: Return and continue where you left off
- **Skip Option**: Users can skip quads they feel neutral about
- **Style Analysis**: Generates CT/ML/WC profile and preferences
- **Export Results**: Download JSON with complete session data

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## File Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # Application styles
├── index.tsx            # Entry point
├── index.css            # Base styles
├── config/
│   └── tasteConfig.ts   # Image URLs, categories, settings
├── data/
│   └── quadMetadata.ts  # All 110 quads with metadata
└── types/
    └── tasteTypes.ts    # TypeScript definitions
```

## Integration with N4S Workflow

This application is **Phase 2** in the design preference discovery:

```
Phase 1: P1.A.5 Design Preferences (KYC Dashboard)
         ↓ Broad direction (contemporary/traditional, etc.)
         
Phase 2: Taste Exploration (This App)
         ↓ Visual refinement through image selection
         
Phase 3: Mood Board Generation
         ↓ Compiled visual summary
         
Phase 4: FYI Module Integration
         → Ongoing reference for advisory
```

## Support

For image hosting questions, images are served from:
- FTP: home148422849.1and1-data.host
- Web: http://do-great.work/PRESENTATIONS/NFS/LIBRARY/IMAGES/

---

*Part of the N4S (Not4Sale) Platform by MLX Consulting*
