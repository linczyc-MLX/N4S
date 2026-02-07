# N4S Claude Code Session Startup Guide

> **CRITICAL**: Read this ENTIRE document before making ANY changes to the codebase.
> Last Updated: 2026-02-07

## ⚡ NEXT TASK (as of Feb 7, 2026)

**Relationship Diagram Enhancement** — Transform the Mermaid.js adjacency diagram from a simple layout questions result into a first-class MVP visualization tool.

Scope:
- Relocate from PersonalizationResult screen to AdjacencyComparisonGrid (matrix screen)
- Implement Desired vs Proposed dual-mode (matching matrix toggle)
- Highlight deviations between desired and proposed adjacencies
- Improve spatial layout (group by zone, meaningful positioning)
- Integrate with validation red flags (overlay conflicts)

See: `docs/SESSION-LOG.md` → "Session: February 7, 2026" → "Next Task" for full details and key files.

---

## 1. ARCHITECTURE OVERVIEW

### Repository
- **GitHub**: https://github.com/linczyc-MLX/N4S.git
- **Clone command**: `git clone https://github.com/linczyc-MLX/N4S.git ~/N4S-clone`

### Deployment (AUTO-DEPLOY)
```
Push to main → GitHub Actions → Build → IONOS Deploy
```
- **Live site**: https://website.not-4.sale
- **IONOS space**: ionos.space (same deployment)
- **NEVER manually upload zip files** - always use git push

### Database
- **Host**: db5019349376.hosting-data.io
- **Database**: dbs15149159
- **Type**: MariaDB
- **Tables**: `projects`, `project_data`, `app_state`

---

## 2. CRITICAL DATA PATHS

### KYC Data Structure
```
kycData
├── principal                          ← Active respondent wrapper
│   ├── portfolioContext               ← CLIENT NAMES HERE
│   │   ├── principalFirstName         ← "John"
│   │   ├── principalLastName          ← "Smith"
│   │   ├── secondaryFirstName         ← "Jane" (for couples)
│   │   └── secondaryLastName          ← "Smith"
│   ├── projectParameters
│   │   ├── projectName                ← "Thornwood Estate"
│   │   ├── projectCity                ← "Beverly Hills"
│   │   └── projectState               ← "CA"
│   ├── designIdentity                 ← FOR TASTE EXPLORATION ONLY
│   │   ├── principalName              ← First name only (Taste UI)
│   │   ├── clientBaseName             ← Shared last name (Taste UI)
│   │   └── principalTasteResults      ← Taste quiz results
│   ├── familyHousehold
│   ├── budgetFramework
│   ├── lifestyleLiving
│   ├── spaceRequirements
│   ├── culturalContext
│   └── workingPreferences
├── secondary                          ← Same structure for partner
└── advisor                            ← Same structure for advisor
```

### WRONG vs RIGHT Examples
```javascript
// WRONG - designIdentity is for Taste Exploration UI only
kycData?.principal?.designIdentity?.principalName

// RIGHT - portfolioContext has actual client contact info
kycData?.principal?.portfolioContext?.principalFirstName
kycData?.principal?.portfolioContext?.principalLastName

// WRONG - no principal wrapper for project params
kycData?.projectParameters?.projectCity

// RIGHT - must include principal wrapper
kycData?.principal?.projectParameters?.projectCity
```

---

## 3. KEY FILE LOCATIONS

```
src/
├── contexts/
│   └── AppContext.jsx              ← Global state, save logic, data structure
├── components/
│   ├── KYC/
│   │   └── sections/
│   │       ├── PortfolioContextSection.jsx  ← Client name fields
│   │       ├── ProjectParametersSection.jsx ← Project location
│   │       └── DesignIdentitySection.jsx    ← Taste Exploration
│   ├── KYM/
│   │   ├── KYMModule.jsx           ← Market Intelligence module
│   │   └── KYMReportGenerator.js   ← PDF report generation
│   ├── FYI/                        ← Space program module
│   └── MVP/                        ← Mansion Validation module
├── data/                           ← Static data files
└── utils/
    └── TasteReportGenerator.js     ← Taste profile PDF

api/
├── config.php                      ← Database connection
├── projects.php                    ← CRUD operations
├── state.php                       ← App state
└── web.config                      ← IIS config for API

public/
├── index.html
└── web.config                      ← IIS config for SPA (KEEP SIMPLE!)
```

---

## 4. BEFORE ANY CODE CHANGES

### Pre-Change Checklist
- [ ] Pull latest: `git pull origin main`
- [ ] Check current deployment status: `gh run list --limit 3`
- [ ] Understand the data flow for what you're changing
- [ ] Identify ALL files that might be affected
- [ ] Check AppContext.jsx for data structure if unsure

### Never Do These Things
1. **NEVER** add IIS URL Rewrite rules to web.config (module not installed on IONOS)
2. **NEVER** change database schema without explicit approval
3. **NEVER** delete or truncate database tables
4. **NEVER** use `designIdentity` for actual client names
5. **NEVER** push untested code that affects data persistence

---

## 5. BEFORE EVERY COMMIT

### Pre-Commit Checklist
- [ ] Verify data paths match AppContext.jsx structure
- [ ] Test locally if possible: `npm start`
- [ ] Review diff carefully: `git diff`
- [ ] Check for console.log statements that should be removed
- [ ] Ensure no hardcoded test data

### Commit Message Format
```
[Module] Brief description

- Specific change 1
- Specific change 2
- Data path: kycData.principal.xxx (if relevant)
```

---

## 6. AFTER EVERY PUSH

### Post-Push Verification
1. Check GitHub Actions: `gh run list --limit 3`
2. Wait for deployment (usually 2-3 minutes)
3. Hard refresh website.not-4.sale (Cmd+Shift+R)
4. Verify the change works
5. Check browser console for errors (F12)

### If Deployment Fails
1. Check GitHub Actions log: `gh run view [run-id]`
2. Common issues:
   - Build error: Check for syntax errors
   - Deploy error: Check IONOS status
3. **DO NOT** keep pushing hoping it fixes itself

---

## 7. EMERGENCY RECOVERY

### If Website Shows 500 Error
1. Check `public/web.config` - remove any rewrite rules
2. Check `api/web.config` - ensure it's minimal
3. Push fix and wait for deploy

### If Data Is Missing
1. **DON'T PANIC** - IONOS has 14-day backups
2. Go to IONOS Control Panel → Databases → Database: dbs15149159
3. Select "Database backups"
4. Download backup from before the issue
5. In phpMyAdmin:
   - Click database name `dbs15149159` in left sidebar FIRST
   - Then click Import
   - Select the .sql.gz file
   - Click Go

### If Site Won't Load At All
1. Check IONOS status page
2. Try ionos.space instead of website.not-4.sale
3. Check GitHub Actions for failed deployments

---

## 8. N4S BRAND STANDARDS (Reports)

### Colors
```
Navy:       #1e3a5f  (headers, primary)
Gold:       #c9a227  (accents, CTAs)
Background: #fafaf8  (page background)
Border:     #e5e5e0  (table borders)
Text:       #1a1a1a  (body text)
Text Muted: #6b6b6b  (secondary text)
```

### Module Colors (Soft Pillow Palette)
```
Dashboard:  #1e3a5f (Navy)
KYC:        #315098 (Deep Blue)
FYI:        #8CA8BE (Steel Blue)
MVP:        #AFBDB0 (Sage Green)
KYM:        #E4C0BE (Dusty Rose)
VMX:        #FBD0E0 (Light Pink)
```

### PDF Report Rules
- Tables: Column widths must accommodate longest values
- Sliders: Label ABOVE, endpoints BELOW, NO tick marks
- No drop shadows, no gradients
- Always read `/docs/N4S-BRAND-GUIDE.md` before report changes

---

## 9. TESTING REQUIREMENTS

### For UI Changes
1. Test in browser with DevTools open
2. Check Network tab for failed API calls
3. Verify data saves (click SAVE, refresh, check data persists)

### For Report Changes
1. Generate a test report
2. Check ALL pages for formatting issues
3. Verify data populates correctly (not showing fallback values)

### For Data Flow Changes
1. Trace the data from source to destination
2. Console.log intermediate values
3. Verify in browser DevTools → Application → check state

---

## 10. COMMON MISTAKES TO AVOID

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| Wrong KYC path | Shows "Client" instead of name | Check AppContext.jsx |
| web.config rewrite rules | 500 error | Keep web.config minimal |
| Not pulling before changes | Merge conflicts | Always `git pull` first |
| Pushing without testing | Broken production | Test locally first |
| Changing DB schema | Data loss | Never without approval |

---

## 11. QUICK REFERENCE COMMANDS

```bash
# Start session
cd ~/N4S-clone
git pull origin main

# Check deployment status
gh run list --limit 3

# View specific run
gh run view [run-id]

# Standard commit flow
git add [files]
git commit -m "Message"
git push origin main

# Check what's different from remote
git diff origin/main

# Undo uncommitted changes
git checkout -- [file]

# View recent commits
git log --oneline -10
```

---

## 12. CONTACTS & RESOURCES

- **IONOS Control Panel**: For database access, backups
- **GitHub Actions**: For deployment logs
- **phpMyAdmin**: For direct database queries
- **N4S Brand Guide**: `/docs/N4S-BRAND-GUIDE.md`
- **Architecture Doc**: `/docs/N4S-ARCHITECTURE.md`

---

## REMEMBER

1. **Data integrity is paramount** - months of client work depends on it
2. **Test before push** - production is not a testing environment  
3. **When in doubt, ask** - don't guess at data paths
4. **Read the docs** - especially N4S-BRAND-GUIDE.md for any UI work
5. **Backups exist** - but prevention is better than recovery

---

*This document should be reviewed at the start of every Claude Code session.*
