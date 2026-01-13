# N4S Architecture Reference

> **Purpose**: Persistent technical reference for Claude across all N4S development sessions.  
> **Last Updated**: 2026-01-13  
> **Current Phase**: Module Integration & Market Intelligence

---

## 1. Project Overview

**N4S (Not4Sale)** is a luxury residential advisory platform for ultra-high-net-worth families and family offices. The platform provides:

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 1 | **KYC** | Know Your Client — Client intake questionnaire | ✅ COMPLETE |
| 2 | **FYI** | Find Your Inspiration — Taste Exploration (110 quads) | ✅ COMPLETE |
| 3 | **MVP** | Mansion Validation Program — Space planning | ✅ CORE COMPLETE |
| 4 | **KYM** | Know Your Market — Market intelligence & land acquisition | ✅ COMPLETE |
| 5 | **KYS** | Know Your Site — Site assessment & scoring | ✅ COMPLETE |
| 6 | **VMX** | Vision Matrix — Partner alignment analysis | 🔄 PLANNED |

**Target Properties**: 10,000–20,000 SF luxury residences  
**Deployment**: IONOS (React frontend, PHP backend tier planned, PostgreSQL)

**Documentation**: See individual module specs in `/docs/`:
- `KYC-REVISION-TRACKER.md` — KYC schema and revisions
- `FYI-REVISION-ARCHITECTURE.md` — FYI module architecture
- `KYM-SPECIFICATION.md` — KYM module (market, land, BAM)
- `KYS-SPECIFICATION.md` — KYS site assessment

---

## 2. Mansion Program Validation System

### 2.1 Core Concept

The Mansion Program converts luxury residential planning methodology into a deployable validation engine. It evaluates floor plans against N4S standards using:

- **Graph-based rules processor** operating on minimal plan graphs (rooms + edges + tags)
- **A/N/B/S adjacency logic** (Adjacent, Near, Buffered, Separate)
- **8-module scoring system** with 80+ threshold for gate passage
- **Red flag detection** with critical/warning severity levels

### 2.2 Four-Phase Workflow

| Phase | Name | Gate | Key Activities |
|-------|------|------|----------------|
| A | Kickoff Inputs | — | Capture operating model, lifestyle priorities, set thresholds |
| B | Concept Plan | Gate 1 | Draft 8-zone concept, run Master Adjacency Gate |
| C | Schematic Design | Gate 2 | Run module checklists, confirm circulation overlays |
| D | Design Development | Gate 3 | Dimensioned plans, freeze adjacency logic |

### 2.3 Master Adjacency Gate (Critical Decision Point)

Plan **FAILS** if any of these conditions exist:

**5 Critical Red Flags:**
1. Guest circulation crosses primary suite threshold
2. Deliveries/refuse routes pass through FOH rooms
3. Zone 3 functions share walls/ceilings with Zone 0 bedrooms
4. No principal-level show kitchen
5. Guest route to dining/terrace crosses kitchen work aisle

**Missing Required Bridges:**
- Butler Pantry (service staging between kitchen/dining)
- Guest Autonomy Node (self-contained guest zone)
- Sound Lock Vestibule (acoustic buffer for media room)
- Wet-Feet Intercept (pool/spa transition zone)
- Ops Core (staff operations hub)

**Module Scores Below Threshold** (default 80+)

### 2.4 Acoustic Zone Classification

| Zone | Description | Examples |
|------|-------------|----------|
| Zone 0 | Silent | Bedrooms |
| Zone 1 | Quiet | Living rooms, library |
| Zone 2 | Active | Kitchen, family room |
| Zone 3 | High-noise | Media room, gym, wellness |

### 2.5 Two-Node Circulation Strategy

All plans use a two-node structure to prevent corridor-driven layouts:

**Node 1: Front Gallery + Formal**
- Foyer/Gallery, Office, Great Room, Formal Dining, Wine Storage
- Character: Grand, formal, visitor-ready

**Node 2: Family Hub + Service**
- Family Room, Kitchen, Breakfast, Scullery, Library, Media, Terrace, Wellness
- Character: Casual, activity-based, family-oriented

**Cross-Links** (controlled connections between nodes):
1. Great Room → Terrace (formal view axis)
2. Wine → Scullery (service link)
3. Foyer → Family Hub (daily connector)

---

## 3. Module-Master Prototype Analysis

### 3.1 Status: 60% Production-Ready

**Extracted From**: Replit prototype (January 2026)  
**Codebase Location**: Analyzed, architecture documented below

### 3.2 What Exists (Production-Ready)

| Component | File | Status |
|-----------|------|--------|
| Zod Schemas | `shared/schema.ts` | ✅ Complete |
| Validation Engine | `server/validation-engine.ts` | ✅ Core logic works |
| Baseline Presets | `client/src/data/program-presets.ts` | ✅ 10K/15K/20K complete |
| A/N/B/S Matrix | Schema + presets | ✅ Bidirectional validation |
| Bridge Detection | Validation engine | ✅ All 5 bridges |
| 8-Module Scoring | Validation engine | ✅ Heuristic scoring |
| UI Pages | `client/src/pages/` | ✅ Full CRUD + visualization |

### 3.3 Gaps (Needs Development)

| Gap | Priority | Status |
|-----|----------|--------|
| Path Tracing | HIGH | ✅ COMPLETE — validation-engine-v2.ts |
| Shared-Wall Acoustics | HIGH | ✅ COMPLETE — Zone 3/Zone 0 detection |
| KYC Integration | MEDIUM | ✅ COMPLETE — kyc-integration.ts |
| Briefing Builder | MEDIUM | ❌ Pending |
| Checklist-Based Scoring | LOW | ❌ Pending |

### 3.4 Data Model (from schema.ts)

```typescript
// Core Types
OperatingModel: { typology, entertainingLoad, staffingLevel, privacyPosture, wetProgram }
LifestylePriorities: { chefLedCooking, multiFamilyHosting, lateNightMedia, homeOffice, fitnessRecovery, poolEntertainment }

// Plan Graph
PlanGraph: { rooms[], edges[], namedPaths[], sharedWalls[] }
Room: { id, name, zone, acousticZone (0-3), tags[], moduleId }
Edge: { fromRoomId, toRoomId, type (door|opening|passage) }
NamedPath: { name, type (delivery_route|refuse_route|foh_to_terrace|guest_circulation|service_circulation), roomIds[] }
SharedWall: { room1Id, room2Id, isFloor }

// Plan Brief
PlanBrief: { spaces[], adjacencyMatrix[], nodes[], crossLinks[], bridgeConfig }
AdjacencyRequirement: { fromSpaceCode, toSpaceCode, relationship (A|N|B|S) }
BridgeConfig: { butlerPantry, guestAutonomy, soundLock, wetFeetIntercept, opsCore }

// Validation Output
ValidationResult: { gateStatus (pass|warning|fail), redFlags[], requiredBridges[], moduleScores[], overallScore }
RedFlag: { ruleId, severity (critical|warning), description, affectedRooms[], correctiveAction }
```

### 3.5 Path Tracing Implementation (validation-engine-v2.ts)

The enhanced validation engine traces named paths through the plan graph to detect the 5 Critical Red Flags:

| Red Flag | Rule ID | Detection Method |
|----------|---------|------------------|
| #1 Guest → Primary Suite | critical-001 | Trace `guest_circulation` paths for `PRIMARY_SUITE_ROOMS` |
| #2 Delivery → FOH | critical-002 | Trace `delivery_route` and `refuse_route` for `FOH_ROOMS` |
| #3 Zone 3 / Zone 0 Walls | critical-003 | Check `sharedWalls` for acoustic zone conflicts |
| #4 No Show Kitchen | critical-004 | Scan rooms for `show_kitchen` tag or kitchen names |
| #5 Guest → Kitchen Aisle | critical-005 | Trace `foh_to_terrace` paths for `KITCHEN_WORK_ROOMS` |

**Room Classification Constants:**

```typescript
// Front-of-House (service routes must never cross)
FOH_ROOMS = ['FOY', 'GR', 'DR', 'FR', 'LIB', 'OFF', ...]

// Primary Suite (guest circulation must never cross)
PRIMARY_SUITE_ROOMS = ['PRI', 'PRIBATH', 'PRICL', 'PRILOUNGE', ...]

// Kitchen Work Zone (guest terrace route must never cross)
KITCHEN_WORK_ROOMS = ['KIT', 'CHEF', 'SCUL', ...]
```

**Path Type Mapping:**

| Path Type | Red Flag Checked |
|-----------|------------------|
| `delivery_route` | #2 FOH Crossing |
| `refuse_route` | #2 FOH Crossing |
| `guest_circulation` | #1 Primary Threshold |
| `foh_to_terrace` | #5 Kitchen Aisle |
| `service_circulation` | #2 FOH Crossing |

### 3.5 Baseline Model Structure (10K Example)

**Level 1 (~6,200 SF):**
- Arrival + Formal: FOY (420), OFF (220), GR (520), DR (320), WINE (110)
- Family Hub: FR (520), KIT (380), BKF (150), SCUL (220), CHEF (180), LIB (220), MEDIA (280)
- Service: MUD (180), LAUN1 (140), MEP (320)
- Wellness: GYM (260), SPA (220), POOLSUP (120)
- Guest: GSL1 (460)

**Level 2 (~3,800 SF):**
- Primary Wing: PRI (360), PRIBATH (260), PRICL (260), PRILOUNGE (180)
- Secondary Suites: SEC1-3 (~340 each)
- Service: LAUN2 (100), LINEN (80)

---

## 4. Briefing Document Architecture

### 4.1 Purpose

The Briefing Document serves as:
1. **Human-readable design intent** for architects/clients
2. **Machine-readable validation ruleset** for the engine

### 4.2 Structure

1. Executive Summary
2. Planning Assumptions and Guiding Rules
3. Dimensional Standards (corridor widths, ceiling heights)
4. Space Program (room-by-room allocations with SF targets)
5. **Adjacency Strategy and Matrix** ← THE HEART OF VALIDATION
6. Compact Bubble Diagram
7. Node Diagram with Controlled Cross-Links
8. Mermaid Diagram Code (optional)

### 4.3 Dependency Chain

```
KYC Inputs → Briefing Builder → Project Briefing → Validation Engine
     ↓              ↓                  ↓                  ↓
  Client data   Modify baseline    Validation rules   Pass/Fail + Guidance
```

**Critical**: Without accurate project-specific briefing, validator checks against wrong criteria.

---

## 5. KYC Integration (kyc-integration.ts)

### 5.1 Overview

The KYC (Know Your Client) module captures client requirements through a structured questionnaire and transforms responses into validation engine inputs.

### 5.2 KYC Sections

| Section | Purpose | Key Fields |
|---------|---------|------------|
| Property Context | Site & building basics | residenceType, estimatedSF, numberOfLevels |
| Household Profile | Who lives there | composition, primaryResidents, pets |
| Entertaining Profile | How they host | frequency, scale, cateringSupport |
| Staffing Profile | Service model | preference, currentStaff, security |
| Privacy Profile | Guest & work patterns | preference, guestStayFrequency, workFromHome |
| Kitchen Profile | Cooking style | cookingStyle, primaryCook, showKitchenImportance |
| Wellness Profile | Health & recreation | interest, poolDesired, spaFeatures |
| Special Requirements | Custom spaces | artCollection, safe_room, customSpaces[] |

### 5.3 Output Mapping

```typescript
KYCResponse → mapKYCToValidation() → ValidationContext
                                        ├── OperatingModel
                                        ├── LifestylePriorities  
                                        ├── BridgeConfig
                                        ├── UniqueRequirements[]
                                        ├── recommendedPreset
                                        ├── confidenceScore
                                        └── warnings[]
```

### 5.4 Mapping Rules

**OperatingModel Derivation:**

| KYC Field | → | Validation Field | Mapping |
|-----------|---|------------------|---------|
| residenceType | → | typology | primary→single_family, vacation→vacation |
| entertainingFrequency | → | entertainingLoad | rarely→rare, frequently→weekly |
| staffingPreference | → | staffingLevel | self_sufficient→none, estate→live_in |
| privacyPreference | → | privacyPosture | welcoming→open, sanctuary→private |
| wellnessInterest + poolDesired | → | wetProgram | Combination logic |

**LifestylePriorities Derivation:**

| Priority | Triggered When |
|----------|----------------|
| chefLedCooking | cookingStyle=serious/professional OR separateCateringKitchen |
| multiFamilyHosting | multiGenerationalHosting OR composition=multi_generational |
| lateNightMedia | lateNightMediaUse=true |
| homeOffice | workFromHome=primary/executive |
| fitnessRecovery | fitnessRoutine=regular/intensive OR spaFeatures≥2 |
| poolEntertainment | poolDesired AND outdoorEntertainingImportance≥4 |

### 5.5 Unique Requirements Extraction

The system extracts custom requirements that modify baseline presets:

| Trigger | Extracted Requirement |
|---------|----------------------|
| Large dog in pets[] | Dog wash station (40 SF), dog run access |
| wineBottleCount > 500 | Expanded wine storage (200-500 SF) |
| artCollection=true | Gallery space, climate-controlled storage |
| musicRoom=true | Sound-isolated music room (250 SF) |
| carCollection + garageBays>4 | Expanded garage with display |
| clientMeetingsAtHome=true | Executive office with separate access |
| elderlyResidents=true | Elevator, main-level suite capability |

### 5.6 Conflict Detection

The integration layer warns about incompatible configurations:

- Private posture + multi-family hosting → circulation conflict
- Grand-scale entertaining + no staff → service bottleneck  
- Late-night media + private posture → acoustic warning
- Full wellness + winter residence → humidity control needed
- Art collection without climate control → preservation risk

---

## 6. Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React + TypeScript + Vite | Component-based UI |
| Styling | Tailwind CSS | Utility-first |
| Validation | Zod | Runtime type checking |
| State | React Query (assumed) | Server state management |
| Backend (current) | Express-like server | Replit prototype |
| Backend (planned) | PHP on IONOS | Production deployment |
| Database (planned) | PostgreSQL | Relational data |
| Image Hosting | Cloudinary | Taste Exploration images |

---

## 7. Deployment Configuration

**Platform**: IONOS Deploy Now

**Build Commands**:
```bash
npm install
CI=false npm run build
```

**Output Path**: `build`  
**Workflow**: Do not prefill (manual configuration)  
**Package.json**: Must be at repository root

---

## 8. Development Workflow

### GitHub Integration

1. Claude.ai prepares files and provides exact Claude Code terminal commands
2. User runs `claude` in `~/N4S-clone` before sessions
3. Format: "In Claude Code, say: [exact instruction]"

### File Handling

- Claude prepares complete files for upload
- After user confirmation, Claude provides Claude Code commands to update GitHub
- User executes commands in terminal

---

## 9. Implementation Roadmap

### Phase 1: Path Tracing ✅ COMPLETE
- ✅ Implement named path validation (DELIVERY_ROUTE, REFUSE_ROUTE, etc.)
- ✅ Trace paths through plan graph to detect red flag violations
- ✅ Add shared-wall acoustic zone checking

### Phase 2: KYC Integration ✅ COMPLETE
- ✅ Comprehensive KYC schema (9 sections)
- ✅ Auto-populate operating model from KYC responses
- ✅ Extract unique requirements (dog wash, wine room expansion, etc.)
- ✅ Conflict detection and warnings

### Phase 3: Briefing Builder ❌ NEXT
- UI to modify baseline models with client-specific requirements
- Visual adjacency matrix editor
- Export to validation-ready format
- Apply UniqueRequirements to baseline presets

### Phase 4: Production Deployment
- Migrate to IONOS PHP backend
- PostgreSQL database setup
- Master app + admin controls → client instances

---

## 10. Key Architectural Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-03 | Adopt Module-Master schema as-is | Well-designed Zod types, A/N/B/S logic correct |
| 2026-01-03 | Priority: Path tracing before KYC | Red flags are the core value proposition |
| 2026-01-03 | Two-node circulation is mandatory | Prevents corridor-driven plans |
| 2026-01-03 | 80+ module score threshold | Industry-standard quality gate |
| 2026-01-03 | Path tracing via named paths | NamedPath.roomIds[] allows explicit route definition |
| 2026-01-03 | Room classification by tags + codes + names | Triple-fallback ensures detection regardless of data source |
| 2026-01-03 | Acoustic zones numeric (0-3) | Enables simple conflict comparison (zone1 === 3 && zone2 === 0) |
| 2026-01-03 | KYC schema as separate Zod file | Clean separation of concerns, reusable across modules |
| 2026-01-03 | UniqueRequirements as first-class output | Enables Briefing Builder to modify baseline presets |
| 2026-01-03 | Conflict detection in KYC mapper | Catches incompatible configs before validation runs |
| 2026-01-03 | recommendPreset() based on SF + complexity | Guides clients toward appropriate baseline model |

---

## 11. Open Questions

1. Should Briefing Builder allow basement allocation (not in current presets)?
2. How to handle custom amenities not in baseline (art studio, music room)?
3. Integration point for ArchiPrompt image generation?
4. Multi-project dashboard for family offices with multiple properties?

---

## Appendix A: Space Codes Reference

| Code | Name | Module |
|------|------|--------|
| FOY | Foyer/Gallery | 02-Entertaining |
| OFF | Office | — |
| GR | Great Room | 02-Entertaining |
| DR | Dining Room | 02-Entertaining |
| WINE | Wine Storage | 02-Entertaining |
| FR | Family Room | 02-Entertaining |
| KIT | Kitchen | 01-Kitchen |
| BKF | Breakfast | 01-Kitchen |
| CHEF | Chef's Kitchen | 01-Kitchen |
| SCUL | Scullery | 01-Kitchen |
| LIB | Library | 05-Media |
| MEDIA | Media Room | 05-Media |
| MUD | Mudroom | 06-Service |
| LAUN | Laundry | 06-Service |
| MEP | Mechanical | 06-Service |
| GYM | Gym | 07-Wellness |
| SPA | Spa | 07-Wellness |
| POOL | Pool | 07-Wellness |
| PRI | Primary Bedroom | 03-Primary Suite |
| PRIBATH | Primary Bath | 03-Primary Suite |
| PRICL | Primary Closet | 03-Primary Suite |
| SEC1-4 | Secondary Suites | 04-Guest Wing |
| GSL1 | Guest Suite L1 | 04-Guest Wing |
| STAFF | Staff Quarters | 08-Staff |

---

*This document should be read by Claude at the start of every N4S development session.*
