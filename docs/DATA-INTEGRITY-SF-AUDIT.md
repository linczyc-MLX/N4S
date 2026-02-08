# Data Integrity Audit: Square Footage Across Modules

> **Date**: February 8, 2026
> **Trigger**: FYI shows 16,795 SF but MVP Program Summary showed 15,220 SF
> **Status**: Partially Fixed — ProgramSummaryView corrected, remaining items tracked below

---

## Data Flow: FYI → MVP → Reports

```
FYI Module (useFYIState.js)
  ↓ selections + settings stored in fyiData (AppContext)
  ↓
mvp-bridge.js: transformFYIToMVPProgram(fyiData)
  ↓ Computes: spaces[], totals (net, circulation, by structure), zones
  ↓
MVP Module (MVPModule.jsx)
  ↓ fyiProgram + fyiSummary used for overview display
  ↓
  ├── ProgramSummaryView ← FIXED: now uses FYI data
  ├── AdjacencyComparisonGrid ← Uses preset spaces (see ITR-3)
  ├── PersonalizationResult ← Uses preset spaces (see ITR-3)
  └── MVPReportGenerator (PDF) ← Uses preset spaces for diagram (see ITR-4)
```

---

## FIXED (Feb 8, 2026)

### FIX-1: ProgramSummaryView used benchmark preset instead of FYI data
- **Symptom**: MVP "Program Summary" showed 15,220 SF (tier benchmark) vs FYI's 16,795 SF
- **Root cause**: `const spaces = presetData?.spaces || []` — read from tier preset, not FYI
- **Fix**: Import `transformFYIToMVPProgram` + `getFYIProgramSummary`, use FYI spaces/totals when available, fall back to preset only when FYI is empty
- **Commit**: Included in this session

### FIX-2: PersonalizationResult matrix keys used wrong property names
- **Symptom**: Diagram rendered with zones/bubbles but no edges; matrix had no colored cells
- **Root cause**: Used `req.from`/`req.to` instead of `req.fromSpaceCode`/`req.toSpaceCode`
- **Fix**: Changed to correct property names
- **Commit**: 8d3b5d2

### FIX-3: TypeError: pets.trim — non-string pets data
- **Symptom**: White screen on MVP module load
- **Root cause**: `pets` field stored as boolean/object but `.trim()` called on it
- **Fix**: Type-guard before `.trim()` in mvp-bridge.js and FamilyHouseholdSection.jsx
- **Commit**: 5acf8fc

---

## ITR Items (Future Review)

### ITR-1: FYI internal delta display inconsistency
- **Location**: FYI Module — Level Diagram (left) vs Program Summary panel (right)
- **Issue**: Left panel shows `Net Program vs Target` delta (+36 SF), right panel shows `Total (with circulation) vs Target` delta (+1,795 SF). Both are technically correct but showing different comparisons can confuse users.
- **Recommendation**: Clarify labels — e.g., "Net Delta" vs "Conditioned Delta (incl. circulation)"
- **Priority**: Low

### ITR-2: VMX manual SF data entry
- **Location**: VMX module (N4S-VisualMatriX)
- **Issue**: VMX has manual data entry for square footage, not connected to FYI program data
- **Recommendation**: When VMX integrates into N4S as final module, it should read space SF from FYI via the same `transformFYIToMVPProgram` bridge, or directly from `fyiData.selections`
- **Priority**: Medium (address during VMX integration)

### ITR-3: AdjacencyComparisonGrid + PersonalizationResult use preset spaces for diagram
- **Location**: `AdjacencyComparisonGrid.jsx` line 254, `PersonalizationResult.tsx` line ~327
- **Issue**: `spaces={presetData.spaces}` — bubble diagram uses benchmark tier space definitions (including SF values) rather than FYI-customized sizes. This means bubble sizes in the diagram reflect benchmark expectations, not the client's actual program.
- **Current behavior**: Spaces shown are those defined in the tier preset. If FYI adds/removes spaces, the diagram won't reflect that.
- **Impact**: Visual only — adjacency RELATIONSHIPS are correctly sourced (benchmark for "desired", decision-applied for "achieved"). The space list and bubble sizes are the discrepancy.
- **Recommendation**: Pass FYI spaces to the diagram when available. Map FYI space codes to preset adjacency relationships. Handle FYI spaces that don't exist in the preset (no adjacency data — show as isolated nodes).
- **Priority**: Medium

### ITR-4: MVPReportGenerator PDF uses preset spaces for diagram
- **Location**: `MVPReportGenerator.js` line 443
- **Issue**: Same as ITR-3 but for PDF export. `const spaces = presetData?.spaces || []`
- **Recommendation**: Accept FYI spaces as optional parameter, use for node layout when available
- **Priority**: Medium (fix alongside ITR-3)

### ITR-5: Circulation calculation — FYI vs mvp-bridge alignment
- **Location**: `useFYIState.js` calculateCirculation vs `mvp-bridge.js` calculateCirculation
- **Issue**: Both call the same `calculateCirculation()` function but with potentially different inputs if FYI state changes between saves. The mvp-bridge re-derives from saved fyiData, which should be identical, but worth verifying edge cases (e.g., mid-edit states).
- **Current status**: Believed to be aligned — both use `calculateCirculation(mainNetSF, targetSF, lockToTarget, circulationPct, programTier)`
- **Priority**: Low (verify if discrepancies reported)

### ITR-6: Structure breakdown not shown in MVP Program Summary
- **Location**: ProgramSummaryView
- **Issue**: FYI shows Main Residence / Guest House / Pool House breakdown with individual SFs. MVP ProgramSummaryView now uses FYI totals but doesn't display the structure breakdown visually.
- **Recommendation**: Add collapsible structure cards matching FYI sidebar format (Main: net + circulation, GH: net, PH: net)
- **Priority**: Low (cosmetic)

---

## SF Value Reference (Current Test Data)

| Module | Value | Source |
|--------|-------|--------|
| FYI Current Program | 16,795 SF | useFYIState.totals.total (net + circulation, all structures) |
| FYI Net Program | 15,036 SF | useFYIState.totals.net (all structures, no circulation) |
| FYI Main Residence | 14,325 SF | structureTotals.main.total (net 12,566 + circ 1,759) |
| FYI Guest House | 1,650 SF | structureTotals.guestHouse.total |
| FYI Pool House | 820 SF | structureTotals.poolHouse.total |
| FYI Target (from KYC) | 15,000 SF | settings.targetSF |
| MVP Program Summary (FIXED) | 16,795 SF | Now from transformFYIToMVPProgram totals |
| MVP Program Summary (OLD) | 15,220 SF | Was from preset benchmark spaces — INCORRECT |
| Tier 15K Preset Total | 15,220 SF | Sum of presetData.spaces[].targetSF |
