# Items To Resolve (ITR) — Master

> **Last Updated**: 2026-02-22
> **Convention**: `ITR-{number}` | Resolved items get ~~strikethrough~~ + date

---

## Open Items

### ITR-1: FYI — Internal delta display inconsistency
**Module**: FYI | **Severity**: Low | **Added**: 2026-01
When a space has been modified, the internal FYI delta display shows incorrect baseline values in some edge cases. Does not affect data integrity — display-only issue.

### ITR-2: VMX — Manual SF data entry
**Module**: VMX | **Severity**: Medium | **Added**: 2026-01
VMX module requires manual square footage entry rather than pulling from FYI source of truth. Should auto-populate from FYI data when available.

### ITR-5: MVP — Circulation calculation FYI vs mvp-bridge alignment
**Module**: MVP | **Severity**: Medium | **Added**: 2026-01
Circulation percentage calculation may differ between FYI-sourced data and the mvp-bridge transformation. Needs audit to confirm values are consistent.

### ITR-6: MVP — Structure breakdown not shown in Program Summary
**Module**: MVP | **Severity**: Low | **Added**: 2026-01
The MVP Program Summary view doesn't display the structural breakdown (walls, circulation, mechanical) that feeds into the total SF calculation.

### ITR-7: BYT — BYOK API Marketplace for SaaS/3rd-Party Use
**Module**: BYT | **Severity**: Enhancement | **Added**: 2026-02
Future consideration: allow third-party deployment of the BYT/GID discovery engine with bring-your-own-key (BYOK) API model for AI services.

### ITR-8: BYT — PM/Owner's Rep Discovery Data Quality
**Module**: BYT | **Severity**: Medium | **Added**: 2026-02
PM/Owner's Rep candidates from AI discovery have lower data quality than Architect/ID/GC candidates. Public information about PM firms is sparser, leading to less confident scoring.

### ITR-9: LCD — Footer "Confidential" text
**Module**: LCD | **Severity**: Low | **Added**: 2026-02
LuXeBrief `n4sDatabase.ts` footer still shows old "Confidential" text that should be updated.

### ITR-10: BYT — Synergy Sandbox + Matchmaking scoring pipeline
**Module**: BYT | **Severity**: High | **Added**: 2026-02-22
RFQ data is submitted for all 4 candidates. Need to test: (a) "Score All" triggers VPS scoring endpoint, (b) scores flow back to Matchmaking display, (c) Synergy Sandbox reads Section 4 responses for compatibility analysis.

---

## Resolved Items

### ~~ITR-3: MVP — AdjacencyComparisonGrid + PersonalizationResult use preset spaces~~ ✅ FIXED
**Module**: MVP | **Resolved**: 2026-01
Now correctly uses FYI-sourced spaces instead of preset data.

### ~~ITR-4: MVP — MVPReportGenerator PDF uses preset spaces~~ ✅ FIXED
**Module**: MVP | **Resolved**: 2026-01
PDF report now uses FYI-sourced spaces for diagram generation.
