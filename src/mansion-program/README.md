# N4S Mansion Program Validation

> Core validation engine for luxury residential floor plans (10,000–20,000 SF).

## Overview

This module evaluates floor plans against N4S luxury methodology using:

- **Graph-based rules processor** — rooms, edges, paths, shared walls
- **A/N/B/S adjacency validation** — Adjacent, Near, Buffered, Separate
- **8-module scoring system** — 80+ threshold for gate passage
- **Red flag detection** — critical and warning severity levels

## File Structure

```
mansion-program/
├── index.ts                         # Module exports
├── README.md                        # This file
├── shared/
│   └── schema.ts                    # Zod schemas & TypeScript types
├── server/
│   ├── validation-engine.ts         # Original validation logic (legacy)
│   ├── validation-engine-v2.ts      # Enhanced with path tracing ⭐
│   └── modules-data.ts              # 8 module definitions + adjacency
├── client/
│   └── data/
│       └── program-presets.ts       # 10K/15K/20K baseline models
├── test/
│   └── validation-test.ts           # Test cases with sample plans
└── docs/
    ├── N4S-ARCHITECTURE.md          # Complete technical reference
    └── SESSION-LOG.md               # Development session log
```

## Quick Start

```typescript
import { 
  runValidation, 
  getPreset, 
  type OperatingModel, 
  type LifestylePriorities 
} from './mansion-program';

// Load baseline model
const preset = getPreset('10k');

// Define project inputs
const operatingModel: OperatingModel = {
  typology: 'single_family',
  entertainingLoad: 'monthly',
  staffingLevel: 'part_time',
  privacyPosture: 'balanced',
  wetProgram: 'pool_spa'
};

const lifestylePriorities: LifestylePriorities = {
  chefLedCooking: true,
  multiFamilyHosting: false,
  lateNightMedia: true,
  homeOffice: true,
  fitnessRecovery: true,
  poolEntertainment: true
};

// Run validation
const result = runValidation({
  operatingModel,
  lifestylePriorities,
  planBrief: preset // Optional: loads adjacency matrix from preset
});

console.log(result.gateStatus);      // 'pass' | 'warning' | 'fail'
console.log(result.redFlags);        // Critical violations
console.log(result.requiredBridges); // Missing operational bridges
console.log(result.moduleScores);    // 8-module scoring breakdown
console.log(result.overallScore);    // Weighted average (0-100)
```

## Core Concepts

### Master Adjacency Gate

Plan **FAILS** if any Critical Red Flag is triggered:

1. Guest circulation crosses primary suite threshold
2. Deliveries/refuse routes pass through FOH rooms
3. Zone 3 functions share walls with Zone 0 bedrooms
4. No principal-level show kitchen
5. Guest route to dining/terrace crosses kitchen work aisle

### Required Bridges

Operational connectors validated based on operating model:

| Bridge | Trigger |
|--------|---------|
| Butler Pantry | Weekly+ entertaining OR full-time staff |
| Guest Autonomy Node | Multi-family hosting OR vacation typology |
| Sound Lock Vestibule | Late-night media enabled |
| Wet-Feet Intercept | Pool/spa OR pool entertainment |
| Ops Core | Any staffing level above none |

### Acoustic Zones

| Zone | Level | Examples |
|------|-------|----------|
| Zone 0 | Silent | Bedrooms |
| Zone 1 | Quiet | Living rooms, library |
| Zone 2 | Active | Kitchen, family room |
| Zone 3 | High-noise | Media, gym, wellness |

### Adjacency Types (A/N/B/S)

| Code | Meaning | Validation |
|------|---------|------------|
| A | Adjacent | Direct connection required |
| N | Near | Close proximity needed |
| B | Buffered | Buffer zone required |
| S | Separate | Isolation required |

## Baseline Presets

Three pre-configured models establish normative programs:

| Preset | Total SF | Bedrooms | Levels | Key Features |
|--------|----------|----------|--------|--------------|
| 10K | 10,000 | 4 | 2 | Lap pool, no basement |
| 15K | 15,000 | 5 | 2 | Pool + acreage |
| 20K | 20,000 | 8 | 2 | Expanded amenities, dual kitchens |

## 8 Validation Modules

1. **Kitchen Rules Engine** — Show vs BOH, flow, bespoke credibility
2. **Entertaining Spine** — Arrival-to-terrace axis, lane integrity
3. **Primary Suite Ecosystem** — Privacy gradient, two-person functionality
4. **Guest Wing Logic** — Hotel-grade autonomy, multi-family resilience
5. **Media & Acoustic Control** — Zone 3 containment, late-night integrity
6. **Service Spine** — Receiving, storage, laundry, BOH separation
7. **Wellness Program** — Training/recovery loop, humidity control
8. **Staff Layer** — Ops core, security, event scale-up

## Development Status

**Production-Ready (75%):**
- ✅ Zod schemas and type definitions
- ✅ Validation engine core logic
- ✅ A/N/B/S adjacency validation
- ✅ 10K/15K/20K baseline presets
- ✅ Bridge detection
- ✅ 8-module heuristic scoring
- ✅ **Path tracing for 5 Critical Red Flags**
- ✅ **Acoustic zone violation detection**

**Pending Implementation:**
- ❌ KYC integration
- ❌ Briefing Builder UI
- ❌ Checklist-based scoring (vs heuristic)

## Path Tracing

The validation engine traces named paths through the plan graph to detect critical violations:

| Red Flag | Rule ID | Path Type Checked |
|----------|---------|-------------------|
| Guest → Primary Suite | critical-001 | `guest_circulation` |
| Delivery → FOH | critical-002 | `delivery_route`, `refuse_route` |
| Zone 3 / Zone 0 Walls | critical-003 | `sharedWalls` |
| No Show Kitchen | critical-004 | Room scan |
| Guest → Kitchen Aisle | critical-005 | `foh_to_terrace` |

### Testing Path Tracing

```typescript
import { 
  detectPathTracingRedFlags, 
  detectAcousticZoneViolations,
  passingPlanGraph,
  failingPlanGraph 
} from './mansion-program';

// Test against passing plan (no violations)
const goodFlags = detectPathTracingRedFlags(passingPlanGraph);
console.log(goodFlags.length); // 0

// Test against failing plan (multiple violations)
const badFlags = detectPathTracingRedFlags(failingPlanGraph);
console.log(badFlags.length); // 3+ violations detected
```

## Documentation

- **N4S-ARCHITECTURE.md** — Complete technical reference (read at session start)
- **SESSION-LOG.md** — Chronological development decisions

---

*Part of the N4S (Not4Sale) luxury residential advisory platform.*
