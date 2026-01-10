# N4S Data Audit Protocol

> **Purpose:** Define data flows, validate integrity, and catch bugs BEFORE deployment.  
> **Version:** 1.0  
> **Last Updated:** January 10, 2026  
> **Run Before:** Every deployment to production

---

## 1. Project Data Structure

All persistent data lives in `projectData` (AppContext.jsx):

```
projectData
├── id                          # Project UUID
├── clientData                  # Project metadata
│   ├── projectName
│   ├── projectCode
│   ├── createdAt
│   └── lastUpdated
│
├── kycData                     # Know Your Client data
│   ├── principal               # Primary respondent
│   │   ├── portfolioContext
│   │   ├── familyHousehold
│   │   ├── projectParameters
│   │   ├── budgetFramework
│   │   ├── designIdentity      # Includes taste results
│   │   │   ├── principalTasteResults   # P's taste data
│   │   │   ├── secondaryTasteResults   # S's taste data (stored here!)
│   │   │   ├── clientType
│   │   │   ├── clientBaseName
│   │   │   ├── principalName
│   │   │   └── secondaryName
│   │   ├── lifestyleLiving
│   │   ├── spaceRequirements
│   │   ├── culturalContext
│   │   ├── workingPreferences
│   │   └── advisorAssessed
│   ├── secondary               # Secondary respondent (subset)
│   └── advisor                 # Advisor-assessed data
│
├── fyiData                     # Find Your Inspiration data
│   ├── brief                   # Generated brief text
│   ├── completedAt
│   ├── settings
│   │   ├── targetSF
│   │   ├── deltaPct
│   │   ├── circulationPct
│   │   ├── lockToTarget
│   │   ├── programTier
│   │   └── hasBasement
│   └── selections              # { spaceCode: { included, size, level, customSF, imageUrl, notes } }
│
├── mvpData                     # Mansion Validation Program data
│   ├── moduleChecklistState    # { checklistItemId: boolean }
│   ├── adjacencyDecisions      # { decisionKey: value }
│   ├── briefGenerated          # Timestamp
│   ├── validationResults       # Cached results
│   └── completedAt
│
└── activeRespondent            # 'principal' | 'secondary' | 'advisor'
```

---

## 2. Data Flow Per Module

### KYC Module

| Data Field | Read From | Write To | Update Function |
|------------|-----------|----------|-----------------|
| All KYC sections | `kycData[respondent][section]` | `kycData[respondent][section]` | `updateKYCData(respondent, section, data)` |
| Taste Results | `kycData.principal.designIdentity.principalTasteResults` | Same | `updateKYCData('principal', 'designIdentity', {...})` |
| Client Config | `kycData[respondent].designIdentity.{clientType, etc}` | Same | `updateKYCData(respondent, 'designIdentity', {...})` |

**Critical Note:** Both `principalTasteResults` AND `secondaryTasteResults` are stored in `kycData.principal.designIdentity`, NOT in their respective respondent sections.

### FYI Module

| Data Field | Read From | Write To | Update Function |
|------------|-----------|----------|-----------------|
| Settings | `fyiData.settings` | `fyiData.settings` | `updateFYISettings(settings)` |
| Space Selections | `fyiData.selections[spaceCode]` | Same | `updateFYISelection(spaceCode, data)` |
| Brief | `fyiData.brief` | `fyiData.brief` | `updateFYIData({ brief: ... })` |

### MVP Module

| Data Field | Read From | Write To | Update Function |
|------------|-----------|----------|-----------------|
| Checklist State | `mvpData.moduleChecklistState` | Same | `updateMVPChecklistItem(itemId, checked)` |
| Adjacency Decisions | `mvpData.adjacencyDecisions` | Same | `updateMVPData({ adjacencyDecisions: {...} })` |
| Taste Display | `kycData.principal.designIdentity.principalTasteResults.profile.scores` | N/A (read-only) | N/A |

---

## 3. Scale Reference

| Data Type | Scale | Source | Used In |
|-----------|-------|--------|---------|
| AS/VD/MP Codes | 1-9 | Image filename (e.g., `AS3_VD5_MP2`) | Report styleEra calculation |
| StyleEra (normalized) | 1-5 | `normalize9to5(AS)` | Report sliders |
| Profile Scores | 1-10 | `calculateProfileFromSelections()` | MVP Design DNA display |
| KYC Axis Sliders | 1-10 | User input | KYC Design Identity |

### Scale Conversion Functions

```javascript
// 1-9 → 1-5 (for AS/VD/MP codes)
function normalize9to5(value) {
  return ((value - 1) / 8) * 4 + 1;
}

// 1-10 → percentage (for display)
const percentage = ((value - 1) / 9) * 100;

// 1-5 → percentage (for display)  
const percentage = ((value - 1) / 4) * 100;
```

---

## 4. localStorage Usage

localStorage is used ONLY as a cache, with backend as source of truth:

| Key Pattern | Purpose | Sync Behavior |
|-------------|---------|---------------|
| `n4s_active_module` | Remember last active tab | UI state only, no backend sync |
| `n4s_taste_profile_{clientId}` | Cache taste profiles | Backend checked FIRST, localStorage fallback |

**Rule:** Any data in localStorage MUST also exist in `projectData` and sync to backend.

---

## 5. Save Mechanism

```
User Action → Update Function → setProjectData() → markChanged() → hasUnsavedChanges = true
                                                                           ↓
                                                              User clicks "Save" or auto-save
                                                                           ↓
                                                              saveNow() → api.updateProject()
                                                                           ↓
                                                              Backend database updated
```

**Critical:** If `markChanged()` is not called, data will NOT be saved!

---

## 6. Audit Checklist

Run before every deployment:

### A. State Persistence Check
- [ ] All `useState` with user data has corresponding context update
- [ ] No orphaned local state that should persist

### B. Data Flow Check
- [ ] Every displayed value traces back to `projectData`
- [ ] Every input writes to `projectData` via update function
- [ ] `markChanged()` is called after every update

### C. Scale Consistency Check
- [ ] All sliders use correct scale (1-5 vs 1-10)
- [ ] PDF and UI show same values for same data

### D. Hardcoded Value Check
- [ ] No placeholder values in display code
- [ ] All defaults are documented and intentional

### E. Cross-Module Data Check
- [ ] MVP can read KYC taste data
- [ ] MVP can read FYI selections
- [ ] Changes in one module reflect in others

---

## 7. Common Bugs & Prevention

| Bug | Symptom | Prevention |
|-----|---------|------------|
| Local state not persisted | Data lost on navigation | Always use context update functions |
| Hardcoded display values | Wrong numbers shown | Run hardcoded value audit |
| Scale mismatch | Values look wrong | Verify scale in source AND display |
| Missing markChanged() | Save button never activates | Check all update functions |
| Wrong respondent path | Secondary data overwrites principal | Verify path: `kycData.principal` vs `kycData.secondary` |

---

## 8. Testing Protocol

After each fix, test:

1. **Persistence Test**
   - Make change → Save → Navigate away → Return → Verify data
   - Make change → Save → Refresh browser → Verify data

2. **Cross-Module Test**
   - Change in KYC → Verify appears in MVP
   - Change in FYI → Verify appears in MVP

3. **Scale Test**
   - Note value in UI → Generate PDF → Compare values

---

## 9. Automated Audit Script

Run: `npm run audit:data` or `bash scripts/audit-data-integrity.sh`

See `/scripts/audit-data-integrity.sh` for implementation.

---

## Appendix A: Update Function Reference

| Function | Location | Purpose |
|----------|----------|---------|
| `updateClientData(updates)` | AppContext | Update project metadata |
| `updateKYCData(respondent, section, data)` | AppContext | Update KYC section |
| `updateFYIData(updates)` | AppContext | Update FYI data |
| `updateFYISelection(spaceCode, data)` | AppContext | Update single space |
| `updateFYISettings(settings)` | AppContext | Update FYI settings |
| `initializeFYISelections(selections)` | AppContext | Bulk initialize spaces |
| `updateMVPData(updates)` | AppContext | Update MVP data |
| `updateMVPChecklistItem(itemId, checked)` | AppContext | Toggle checklist item |
| `markChanged()` | AppContext | Flag unsaved changes |
| `saveNow()` | AppContext | Trigger immediate save |

---

## Appendix B: Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-10 | 1.0 | Initial protocol created |
