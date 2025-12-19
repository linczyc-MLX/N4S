# N4S v2 - Not4Sale Luxury Residential Advisory Platform

Ultra-luxury residential advisory workflow system featuring:
- **KYC Module**: 9-section client profiling with multi-stakeholder governance
- **FYI Module**: Three-dimensional Architect ↔ Client ↔ Interior Designer matching

## Local Development

```bash
npm install
npm start
```

## Building for Production

```bash
npm run build
```

Creates optimized build in `/build` folder.

## IONOS Deploy Now - Critical Settings

### Workflow Configuration (`.github/workflows/N4S-build.yaml`)

**CRITICAL**: The `DEPLOYMENT_FOLDER` environment variable MUST be set to `build`:

```yaml
env:
  DEPLOYMENT_FOLDER: build  # NOT 'public'
```

### package.json Requirements

The `homepage` field MUST be set to relative path:

```json
{
  "homepage": "."
}
```

### SPA Routing

The `/public/.htaccess` file enables React Router to work correctly:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Deployment Troubleshooting

### Blank White Page
1. Check browser console for errors
2. Verify `DEPLOYMENT_FOLDER: build` in workflow file
3. Confirm `"homepage": "."` in package.json

### 404 on Refresh
- Ensure `.htaccess` file is in `/public` folder
- Verify it gets copied to build during `npm run build`

### Build Succeeds but No Files Deployed
- The workflow MUST specify `build` not `public` as the deployment folder
- Create React App outputs to `build/` not `public/`

## Tech Stack

- React 18.2
- lucide-react for icons
- CSS Custom Properties for theming
- No external CSS framework (custom styles)

## Version History

- v2.0.0: Complete rebuild with KYC v2 governance and FYI matching
- v1.0.0: Initial workflow documentation system
