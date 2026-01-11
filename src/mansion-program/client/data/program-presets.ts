import type { BriefSpace, AdjacencyRequirement, CirculationNode, CrossLink, BridgeConfig } from "../../shared/schema";

export interface ProgramPreset {
  id: string;
  name: string;
  targetSF: number;
  description: string;
  available: boolean;
  spaces: BriefSpace[];
  adjacencyMatrix: AdjacencyRequirement[];
  nodes: CirculationNode[];
  crossLinks: CrossLink[];
  bridgeConfig: BridgeConfig;
  bubbleDiagramCode: string;
  twoNodeDescription: string;
}

// ============================================================================
// 5,000 SF PRESET (Compact Luxury)
// ============================================================================

const adjacencyMatrix5k: AdjacencyRequirement[] = [
  // FOY relationships - Entry control point
  { fromSpaceCode: "FOY", toSpaceCode: "OFF", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "GR", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "DR", relationship: "N" },
  { fromSpaceCode: "FOY", toSpaceCode: "FR", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "KIT", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "SCUL", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MUD", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MEDIA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "TERR", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GYM", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "POOL", relationship: "S" },
  // OFF relationships - Near entry for professional separation
  { fromSpaceCode: "OFF", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "OFF", toSpaceCode: "GR", relationship: "S" },
  { fromSpaceCode: "OFF", toSpaceCode: "DR", relationship: "S" },
  // GR relationships - Formal showcase
  { fromSpaceCode: "GR", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "GR", toSpaceCode: "TERR", relationship: "N" },
  { fromSpaceCode: "GR", toSpaceCode: "DR", relationship: "N" },
  // DR relationships - Formal dining
  { fromSpaceCode: "DR", toSpaceCode: "FOY", relationship: "N" },
  { fromSpaceCode: "DR", toSpaceCode: "GR", relationship: "N" },
  { fromSpaceCode: "DR", toSpaceCode: "KIT", relationship: "B" },
  { fromSpaceCode: "DR", toSpaceCode: "SCUL", relationship: "N" },
  // FR relationships - Family hub
  { fromSpaceCode: "FR", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "MEDIA", relationship: "N" },
  { fromSpaceCode: "FR", toSpaceCode: "TERR", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "GYM", relationship: "N" },
  // KIT relationships - Open to family, service to back
  { fromSpaceCode: "KIT", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "KIT", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "BKF", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "DR", relationship: "B" },
  { fromSpaceCode: "KIT", toSpaceCode: "MUD", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "TERR", relationship: "N" },
  // SCUL relationships - Service spine
  { fromSpaceCode: "SCUL", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "MUD", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "DR", relationship: "N" },
  // MUD relationships - Entry buffer
  { fromSpaceCode: "MUD", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "MUD", toSpaceCode: "KIT", relationship: "N" },
  { fromSpaceCode: "MUD", toSpaceCode: "GAR", relationship: "A" },
  // MEDIA relationships - Acoustic control
  { fromSpaceCode: "MEDIA", toSpaceCode: "FR", relationship: "N" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GST1", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GST2", relationship: "S" },
  // GYM relationships - Connected to family zone
  { fromSpaceCode: "GYM", toSpaceCode: "FR", relationship: "N" },
  { fromSpaceCode: "GYM", toSpaceCode: "POOLSUP", relationship: "A" },
  // TERR relationships - Outdoor living
  { fromSpaceCode: "TERR", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "GR", relationship: "N" },
  { fromSpaceCode: "TERR", toSpaceCode: "KIT", relationship: "N" },
  // Primary Suite - Isolated from main living
  { fromSpaceCode: "PRI", toSpaceCode: "PRIBATH", relationship: "A" },
  { fromSpaceCode: "PRI", toSpaceCode: "PRICL_HIS", relationship: "A" },
  { fromSpaceCode: "PRI", toSpaceCode: "PRICL_HER", relationship: "A" },
  { fromSpaceCode: "PRI", toSpaceCode: "GST1", relationship: "B" },
  { fromSpaceCode: "PRI", toSpaceCode: "MEDIA", relationship: "S" },
  // Guest Suites - Clustered
  { fromSpaceCode: "GST1", toSpaceCode: "GST2", relationship: "N" },
  { fromSpaceCode: "GST2", toSpaceCode: "GST3", relationship: "N" },
  { fromSpaceCode: "GST1", toSpaceCode: "PRI", relationship: "B" }
];

const nodes5k: CirculationNode[] = [
  {
    id: "node-1",
    name: "Node 1: Entry + Formal",
    description: "Arrival, formal entertaining, and office",
    spaceCodes: ["FOY", "OFF", "GR", "DR", "PWD"]
  },
  {
    id: "node-2",
    name: "Node 2: Family Hub + Service",
    description: "Daily living, kitchen, media, and service",
    spaceCodes: ["FR", "KIT", "BKF", "SCUL", "MUD", "MEDIA", "TERR", "GYM", "POOLSUP"]
  }
];

const crossLinks5k: CrossLink[] = [
  { id: "cl-1", number: 1, name: "Formal View Axis", description: "Great Room to Terrace", fromSpaceCode: "GR", toSpaceCode: "TERR", purpose: "Near connection for formal view" },
  { id: "cl-2", number: 2, name: "Daily Connector", description: "Foyer to Family", fromSpaceCode: "FOY", toSpaceCode: "FR", purpose: "Buffered daily connector" },
  { id: "cl-3", number: 3, name: "Service Link", description: "Dining to Scullery", fromSpaceCode: "DR", toSpaceCode: "SCUL", purpose: "Near service connection" }
];

const preset5kSpaces: BriefSpace[] = [
  // Level 1: Entry + Formal (~775 SF)
  { id: "s1", code: "FOY", name: "Foyer / Gallery", targetSF: 200, zone: "Entry + Formal", level: 1, rationale: "Efficient arrival with coat storage" },
  { id: "s2", code: "PWD", name: "Powder Room", targetSF: 45, zone: "Entry + Formal", level: 1, rationale: "Guest half-bath near entry" },
  { id: "s3", code: "OFF", name: "Home Office", targetSF: 120, zone: "Entry + Formal", level: 1, rationale: "Work from home with professional separation" },
  { id: "s4", code: "GR", name: "Great Room", targetSF: 350, zone: "Entry + Formal", level: 1, rationale: "Formal living and entertaining" },
  { id: "s5", code: "DR", name: "Dining Room", targetSF: 180, zone: "Entry + Formal", level: 1, rationale: "Seats 6-8 with proper circulation" },
  // Level 1: Family Hub (~910 SF)
  { id: "s6", code: "FR", name: "Family Room", targetSF: 300, zone: "Family Hub", level: 1, rationale: "Casual daily living; open to kitchen" },
  { id: "s7", code: "KIT", name: "Kitchen", targetSF: 250, zone: "Family Hub", level: 1, rationale: "Efficient layout with island" },
  { id: "s8", code: "BKF", name: "Breakfast Nook", targetSF: 80, zone: "Family Hub", level: 1, rationale: "Casual daily dining" },
  { id: "s9", code: "SCUL", name: "Scullery", targetSF: 100, zone: "Family Hub", level: 1, rationale: "Cleanup, pantry, service staging" },
  { id: "s10", code: "MEDIA", name: "Media Room", targetSF: 180, zone: "Family Hub", level: 1, rationale: "TV viewing; acoustically considered" },
  // Level 1: Service (~580 SF)
  { id: "s11", code: "MUD", name: "Mudroom", targetSF: 100, zone: "Service", level: 1, rationale: "Daily entry from garage" },
  { id: "s12", code: "LND", name: "Laundry", targetSF: 100, zone: "Service", level: 1, rationale: "Main floor laundry for convenience" },
  { id: "s13", code: "MEP", name: "Mechanical", targetSF: 180, zone: "Service", level: 1, rationale: "HVAC, water heater, panels" },
  { id: "s14", code: "STR", name: "Storage", targetSF: 120, zone: "Service", level: 1, rationale: "General household storage" },
  { id: "s15", code: "GAR", name: "Garage (2-car)", targetSF: 450, zone: "Service", level: 1, rationale: "Attached two-car garage" },
  // Level 1: Wellness (~210 SF)
  { id: "s16", code: "GYM", name: "Gym / Exercise", targetSF: 150, zone: "Wellness", level: 1, rationale: "Home fitness area" },
  { id: "s17", code: "POOLSUP", name: "Pool Support", targetSF: 60, zone: "Wellness", level: 1, rationale: "Pool equipment and storage" },
  // Level 1: Outdoor (not counted)
  { id: "s18", code: "TERR", name: "Terrace", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  { id: "s19", code: "POOL", name: "Pool", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  // Level 2: Primary Wing (~620 SF)
  { id: "s20", code: "PRI", name: "Primary Bedroom", targetSF: 280, zone: "Primary Wing", level: 2, rationale: "Comfortable scale with seating area" },
  { id: "s21", code: "PRIBATH", name: "Primary Bath", targetSF: 180, zone: "Primary Wing", level: 2, rationale: "Double vanity, shower, tub" },
  { id: "s22", code: "PRICL_HIS", name: "His Closet", targetSF: 80, zone: "Primary Wing", level: 2, rationale: "Walk-in closet" },
  { id: "s23", code: "PRICL_HER", name: "Her Closet", targetSF: 80, zone: "Primary Wing", level: 2, rationale: "Walk-in closet" },
  // Level 2: Guest Suites (~860 SF)
  { id: "s24", code: "GST1", name: "Guest Suite 1", targetSF: 300, zone: "Guest Wing", level: 2, rationale: "First guest bedroom with en-suite" },
  { id: "s25", code: "GST2", name: "Guest Suite 2", targetSF: 280, zone: "Guest Wing", level: 2, rationale: "Second guest bedroom" },
  { id: "s26", code: "GST3", name: "Guest Suite 3", targetSF: 280, zone: "Guest Wing", level: 2, rationale: "Third guest bedroom or flex" },
  // Level 2: Circulation (~350 SF estimated)
  { id: "s27", code: "CIRC2", name: "L2 Circulation", targetSF: 350, zone: "Circulation", level: 2, rationale: "Landing, hallways, stair" }
];

const bubbleDiagram5k = `flowchart TB
  subgraph ENTRY["Entry + Formal"]
    FOY["FOY: Foyer"]
    OFF["OFF: Office"]
    GR["GR: Great Room"]
    DR["DR: Dining"]
  end

  subgraph FAMILY["Family Hub"]
    FR["FR: Family Room"]
    KIT["KIT: Kitchen"]
    BKF["BKF: Breakfast"]
    MEDIA["MEDIA: Media"]
  end

  subgraph SERVICE["Service Core"]
    SCUL["SCUL: Scullery"]
    MUD["MUD: Mudroom"]
    LND["LND: Laundry"]
  end

  subgraph WELLNESS["Wellness"]
    GYM["GYM: Gym"]
    POOLSUP["POOLSUP: Pool Support"]
  end

  subgraph OUTDOOR["Outdoor"]
    TERR["TERR: Terrace"]
    POOL["POOL: Pool"]
  end

  subgraph PRIMARY["Primary Suite (L2)"]
    PRI["PRI: Primary Bed"]
    PRIBATH["PRIBATH: Bath"]
    PRICL["PRICL: Closets"]
  end

  subgraph GUEST["Guest Wing (L2)"]
    GST1["GST1: Guest 1"]
    GST2["GST2: Guest 2"]
    GST3["GST3: Guest 3"]
  end

  FOY === OFF
  FOY === GR
  FOY --- DR
  FOY -.- FR

  GR --- TERR
  DR -.- KIT

  FR === KIT
  FR --- MEDIA
  FR === TERR
  KIT === BKF
  KIT === SCUL
  KIT --- MUD

  SCUL === MUD
  MUD === GAR

  FR --- GYM
  GYM === POOLSUP
  TERR === POOL

  MEDIA x--x PRI

  PRI === PRIBATH
  PRI === PRICL
  PRI -.- GST1
  GST1 --- GST2
  GST2 --- GST3`;

const twoNodeDescription5k = `Two-Node Circulation Strategy (5,000 SF - Compact Luxury)

Node 1: Entry + Formal
- Arrival and formal presentation zone
- Contains: Foyer, Office, Great Room, Dining Room, Powder
- Character: Welcoming, professional, guest-ready
- Office adjacent to entry for work-from-home with separation

Node 2: Family Hub + Service
- Daily living and service zone
- Contains: Family Room, Kitchen, Breakfast, Scullery, Mudroom, Media, Terrace, Gym
- Character: Casual, functional, family-oriented
- Open kitchen-family connection with service spine to back

Single Kitchen Strategy (5K):
- One efficient kitchen open to family room
- Scullery provides cleanup/staging buffer
- Direct dining connection for smaller-scale entertaining

Level 2 Organization:
- Primary Wing: Isolated with full bath and dual closets
- Guest Suites: Three bedrooms clustered together
- Shared bath option for two guest suites

Cross-Links (Controlled Connections):
1. Great Room to Terrace: Near connection (N) for indoor-outdoor flow
2. Foyer to Family: Buffered (B) daily connector
3. Dining to Scullery: Near (N) service connection

Key 5K Optimizations:
- No wine room, library, or chef's kitchen (not at tier)
- Gym replaces full spa program
- Pool support for basic wellness
- Three guest suites maximum
- Single-level main living preferred`;

// ============================================================================
// 10,000 SF PRESET
// ============================================================================

const adjacencyMatrix10k: AdjacencyRequirement[] = [
  // FOY relationships
  { fromSpaceCode: "FOY", toSpaceCode: "OFF", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "GR", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "DR", relationship: "N" },
  { fromSpaceCode: "FOY", toSpaceCode: "WINE", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "FR", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "KIT", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "CHEF", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SCUL", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MUD", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "LIB", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MEDIA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "TERR", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GYM", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SPA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "POOL", relationship: "S" },
  // OFF relationships
  { fromSpaceCode: "OFF", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "OFF", toSpaceCode: "GR", relationship: "S" },
  { fromSpaceCode: "OFF", toSpaceCode: "DR", relationship: "S" },
  // GR relationships
  { fromSpaceCode: "GR", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "GR", toSpaceCode: "TERR", relationship: "N" },
  // DR relationships
  { fromSpaceCode: "DR", toSpaceCode: "FOY", relationship: "N" },
  { fromSpaceCode: "DR", toSpaceCode: "WINE", relationship: "A" },
  { fromSpaceCode: "DR", toSpaceCode: "CHEF", relationship: "B" },
  // CHEF relationships (Chef's Kitchen - service kitchen for formal dining)
  { fromSpaceCode: "CHEF", toSpaceCode: "DR", relationship: "B" },
  { fromSpaceCode: "CHEF", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "CHEF", toSpaceCode: "KIT", relationship: "N" },
  { fromSpaceCode: "CHEF", toSpaceCode: "FOY", relationship: "S" },
  // WINE relationships
  { fromSpaceCode: "WINE", toSpaceCode: "DR", relationship: "A" },
  { fromSpaceCode: "WINE", toSpaceCode: "SCUL", relationship: "B" },
  // FR relationships
  { fromSpaceCode: "FR", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "LIB", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "MEDIA", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "TERR", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "GYM", relationship: "A" },
  // KIT relationships
  { fromSpaceCode: "KIT", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "KIT", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "BKF", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "CHEF", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "MUD", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "TERR", relationship: "N" },
  // SCUL relationships
  { fromSpaceCode: "SCUL", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "CHEF", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "MUD", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "WINE", relationship: "B" },
  // MUD relationships
  { fromSpaceCode: "MUD", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "MUD", toSpaceCode: "KIT", relationship: "N" },
  // GYM relationships
  { fromSpaceCode: "GYM", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "GYM", toSpaceCode: "SPA", relationship: "A" },
  // SPA relationships
  { fromSpaceCode: "SPA", toSpaceCode: "GYM", relationship: "A" },
  { fromSpaceCode: "SPA", toSpaceCode: "POOL", relationship: "A" },
  // TERR relationships
  { fromSpaceCode: "TERR", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "GR", relationship: "N" },
  { fromSpaceCode: "TERR", toSpaceCode: "KIT", relationship: "N" },
  // Acoustic separations
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST1", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST2", relationship: "S" }
];

const nodes10k: CirculationNode[] = [
  {
    id: "node-1",
    name: "Node 1: Front Gallery + Formal",
    description: "Arrival, formal entertaining, and office",
    spaceCodes: ["FOY", "OFF", "GR", "DR", "WINE"]
  },
  {
    id: "node-2",
    name: "Node 2: Family Hub + Service + Wellness",
    description: "Daily living, dual-kitchen service, wellness, and outdoor",
    spaceCodes: ["FR", "KIT", "BKF", "CHEF", "SCUL", "MUD", "LIB", "MEDIA", "TERR", "GYM", "SPA", "POOL"]
  }
];

const crossLinks10k: CrossLink[] = [
  { id: "cl-1", number: 1, name: "Formal View Axis", description: "Great Room to Terrace", fromSpaceCode: "GR", toSpaceCode: "TERR", purpose: "Near connection for formal view" },
  { id: "cl-2", number: 2, name: "Wine Service Link", description: "Wine to Scullery", fromSpaceCode: "WINE", toSpaceCode: "SCUL", purpose: "Buffered service connection" },
  { id: "cl-3", number: 3, name: "Daily Connector", description: "Foyer to Family", fromSpaceCode: "FOY", toSpaceCode: "FR", purpose: "Buffered daily connector" }
];

const preset10kSpaces: BriefSpace[] = [
  // Level 1: Arrival + Formal (1,590 SF)
  { id: "s1", code: "FOY", name: "Foyer / Gallery + coat + powder", targetSF: 420, zone: "Arrival + Formal", level: 1, rationale: "Sets luxury arrival and art wall; controls privacy" },
  { id: "s2", code: "OFF", name: "Private Office", targetSF: 220, zone: "Arrival + Formal", level: 1, rationale: "Quiet spur for meetings without entering family areas" },
  { id: "s3", code: "GR", name: "Great Room (formal)", targetSF: 520, zone: "Arrival + Formal", level: 1, rationale: "Primary showcase room; accommodates large seating group" },
  { id: "s4", code: "DR", name: "Formal Dining", targetSF: 320, zone: "Arrival + Formal", level: 1, rationale: "Seats 10-12 with proper circulation and service access" },
  { id: "s5", code: "WINE", name: "Wine Storage", targetSF: 110, zone: "Arrival + Formal", level: 1, rationale: "Adjacent to dining; temperature control and presentation" },
  // Level 1: Family Hub (2,020 SF)
  { id: "s6", code: "FR", name: "Family Room (hub)", targetSF: 520, zone: "Family Hub", level: 1, rationale: "Daily distributor; adjacency to library and buffered media" },
  { id: "s7", code: "KIT", name: "Kitchen", targetSF: 380, zone: "Family Hub", level: 1, rationale: "High-function chef kitchen with island and tall glazing" },
  { id: "s8", code: "BKF", name: "Breakfast Nook", targetSF: 150, zone: "Family Hub", level: 1, rationale: "Morning light; daily meals without formal dining" },
  { id: "s9", code: "SCUL", name: "Scullery / Prep + pantry", targetSF: 220, zone: "Family Hub", level: 1, rationale: "Catering support, cleanup, overflow appliances" },
  { id: "s9b", code: "CHEF", name: "Chef's Kitchen (service)", targetSF: 180, zone: "Service Core", level: 1, rationale: "Discrete service kitchen for formal dining; buffered from dining room to control noise and smells" },
  { id: "s10", code: "LIB", name: "Library", targetSF: 220, zone: "Family Hub", level: 1, rationale: "Soft-use room; can close for quiet work/reading" },
  { id: "s11", code: "MEDIA", name: "Media / Theater (buffered)", targetSF: 280, zone: "Family Hub", level: 1, rationale: "High-use; close to family but acoustically controlled" },
  { id: "s12", code: "MUD", name: "Mudroom / Daily Entry", targetSF: 180, zone: "Service Core", level: 1, rationale: "Controls clutter; connects to scullery" },
  // Level 1: Wellness (600 SF)
  { id: "s13", code: "GYM", name: "Gym (daylight + views)", targetSF: 260, zone: "Wellness", level: 1, rationale: "Premium wellness requires daylight and outlook" },
  { id: "s14", code: "SPA", name: "Spa / Wellness", targetSF: 220, zone: "Wellness", level: 1, rationale: "Steam/sauna + massage nook; visual connection to pool" },
  { id: "s15", code: "POOLSUP", name: "Pool Support", targetSF: 120, zone: "Wellness", level: 1, rationale: "Keeps wet traffic out of main house" },
  // Level 1: Hospitality (460 SF)
  { id: "s16", code: "GSL1", name: "Guest Suite (Level 1)", targetSF: 460, zone: "Hospitality", level: 1, rationale: "Ground-floor option for visitors/aging-in-place" },
  // Level 1: Service (640 SF)
  { id: "s17", code: "LAUN1", name: "Laundry (L1)", targetSF: 140, zone: "Service Core", level: 1, rationale: "Primary household laundry + utility sink" },
  { id: "s18", code: "MEP", name: "Mechanical / Storage / AV / IT", targetSF: 320, zone: "Service Core", level: 1, rationale: "No-basement requires robust above-grade support" },
  // Level 1: Circulation (940 SF)
  { id: "s19", code: "CIRC1", name: "Circulation + stair/lift allowance", targetSF: 940, zone: "Circulation", level: 1, rationale: "Comfortable galleries and non-linear connectors" },
  // Level 1: Outdoor
  { id: "s20", code: "TERR", name: "Main Terrace / Outdoor Dining", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  { id: "s21", code: "POOL", name: "Lap Pool + Deck", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  // Level 2: Primary Wing (1,060 SF)
  { id: "s22", code: "PRI", name: "Primary Bedroom", targetSF: 360, zone: "Primary Wing", level: 2, rationale: "Luxury scale without excess; room for seating area" },
  { id: "s23", code: "PRIBATH", name: "Primary Bath", targetSF: 260, zone: "Primary Wing", level: 2, rationale: "Double vanity, wet room, daylight; correct fixture spacing" },
  { id: "s24", code: "PRICL", name: "Primary Closets (his/hers)", targetSF: 260, zone: "Primary Wing", level: 2, rationale: "Proper dressing corridors + island storage" },
  { id: "s25", code: "PRILNG", name: "Primary Lounge", targetSF: 180, zone: "Primary Wing", level: 2, rationale: "Private decompression away from family hub" },
  // Level 2: Guest Wing Node (1,200 SF)
  { id: "s26", code: "LAND", name: "Landing (daylit)", targetSF: 520, zone: "Guest Wing Node", level: 2, rationale: "Compact node; avoids long hall" },
  { id: "s27", code: "GUEST1", name: "Guest Suite (L2) #1", targetSF: 340, zone: "Guest Wing Node", level: 2, rationale: "True suite proportions; accommodates queen/king" },
  { id: "s28", code: "GUEST2", name: "Guest Suite (L2) #2", targetSF: 340, zone: "Guest Wing Node", level: 2, rationale: "Consistent comfort for long stays" },
  // Level 2: Support (260 SF)
  { id: "s29", code: "LAUN2", name: "Laundry + linen (L2)", targetSF: 140, zone: "Support", level: 2, rationale: "Reduces vertical laundry traffic; supports suites" },
  { id: "s30", code: "MEP2", name: "Storage / IT (L2)", targetSF: 120, zone: "Support", level: 2, rationale: "No-basement systems and seasonal storage" },
  // Level 2: Circulation (1,480 SF)
  { id: "s31", code: "CIRC2", name: "Corridors (generous)", targetSF: 1040, zone: "Circulation", level: 2, rationale: "Short connectors; no long corridors" },
  { id: "s32", code: "CORE2", name: "Stair / lift distribution", targetSF: 440, zone: "Circulation", level: 2, rationale: "Vertical core allowance within Level 2 target" }
];

const bubbleDiagram10k = `graph LR
  EXT["Exterior Arrival / Entry"]
  FOY["Foyer / Gallery"]
  CORE["Main Stair / Lift Core"]

  OFF["Private Office (visitor entry)"]
  GR["Great Room (formal)"]
  DR["Formal Dining"]
  WINE["Wine Storage"]

  FR["Family Room (hub)"]
  KIT["Show Kitchen (family)"]
  BKF["Breakfast Nook"]
  CHEF["Chef's Kitchen (service)"]
  SCUL["Scullery / Prep"]
  MUD["Mudroom / Daily Entry"]
  LIB["Library"]
  MEDIA["Media / Theater (buffered)"]

  TERR["Main Terrace / Outdoor Dining"]
  GYM["Gym (daylight + views)"]
  SPA["Spa / Wellness"]
  POOL["Lap Pool + Deck"]

  PRI["Primary Suite (L2)"]
  LAND["Landing (daylit)"]
  G1["Guest Suite (L2) #1"]
  G2["Guest Suite (L2) #2"]

  EXT --> FOY --> CORE

  subgraph N1[Node 1: Front Gallery + Formal]
    FOY
    OFF
    GR
    DR
    WINE
  end

  subgraph N2[Node 2: Family Hub + Service + Wellness]
    FR
    KIT
    BKF
    CHEF
    SCUL
    MUD
    LIB
    MEDIA
    TERR
    GYM
    SPA
    POOL
  end

  subgraph L2A[Level 2: Primary Wing]
    PRI
  end

  subgraph L2B[Level 2: Guest Wing Node]
    LAND
    G1
    G2
  end

  FOY --> OFF
  FOY --> GR
  FOY --> DR --> WINE
  FOY -->|B| KIT
  FOY -->|B| FR

  FR --> KIT --> BKF
  KIT --> SCUL
  KIT -->|N| CHEF
  CHEF --> SCUL
  DR -->|B| CHEF
  MUD --> SCUL
  FR --> LIB
  FR --> MEDIA
  FR --> TERR
  KIT -->|N| TERR

  FR --> GYM --> SPA --> POOL
  TERR --> POOL

  GR -->|N| TERR
  WINE -->|Service| SCUL

  CORE --> PRI
  CORE --> LAND
  LAND --> G1
  LAND --> G2`;

const twoNodeDescription10k = `Two-Node Circulation Strategy (10,000 SF)

Node 1: Front Gallery + Formal
- Primary arrival and formal presentation zone
- Contains: Foyer/Gallery, Private Office, Great Room, Formal Dining, Wine Storage
- Character: Formal, curated, impressive first impression
- Private Office has exterior visitor door for meetings without entering family areas

Node 2: Family Hub + Service + Wellness
- Daily living, dual-kitchen service, and wellness zone
- Contains: Family Room, Show Kitchen, Breakfast, Chef's Kitchen, Scullery, Mudroom, Library, Media, Gym, Spa, Pool, Terrace
- Character: Casual, functional, activity-based
- Media/Theater is buffered acoustically from family areas

Dual-Kitchen Strategy:
- Show Kitchen (KIT): Family "performer" kitchen open to living spaces; island-centric, guest-friendly
- Chef's Kitchen (CHEF): Discrete service kitchen for formal dining events; buffered from Dining Room to control noise/smells; adjacent to Scullery

Level 2 Organization:
- Primary Wing: Separated for privacy with lounge for decompression
- Guest Wing Node: Landing serves as compact node avoiding long corridors
- Two guest suites with consistent comfort standards

Cross-Links (Controlled Connections):
1. Great Room to Terrace: Near connection for formal view axis
2. Wine to Scullery: Buffered service connection
3. Foyer to Family: Buffered daily connector
4. Dining to Chef's Kitchen: Buffered service connection

Key Design Principles:
- No basement: robust above-grade mechanical/storage
- Wellness spaces require daylight and pool connection
- Library and Media adjacent to Family but with acoustic control
- Dual-kitchen system separates family daily use from formal service`;

// ============================================================================
// 15,000 SF PRESET
// ============================================================================

const adjacencyMatrix15k: AdjacencyRequirement[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 1: ARRIVAL + FORMAL (FOY, OFF, GR, DR, WINE)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // FOY (Foyer) - Entry control point
  { fromSpaceCode: "FOY", toSpaceCode: "OFF", relationship: "A" },   // Office near entry for professional separation
  { fromSpaceCode: "FOY", toSpaceCode: "GR", relationship: "A" },    // Direct formal access
  { fromSpaceCode: "FOY", toSpaceCode: "DR", relationship: "N" },    // Near but not direct to dining
  { fromSpaceCode: "FOY", toSpaceCode: "WINE", relationship: "S" },  // Wine hidden from entry
  { fromSpaceCode: "FOY", toSpaceCode: "FR", relationship: "B" },    // Buffered from family zone
  { fromSpaceCode: "FOY", toSpaceCode: "KIT", relationship: "B" },   // RED FLAG: Buffered, not adjacent
  { fromSpaceCode: "FOY", toSpaceCode: "CHEF", relationship: "S" },  // Service kitchen separate
  { fromSpaceCode: "FOY", toSpaceCode: "SCUL", relationship: "S" },  // Service separate
  { fromSpaceCode: "FOY", toSpaceCode: "MUD", relationship: "S" },   // Service entry separate
  { fromSpaceCode: "FOY", toSpaceCode: "LIB", relationship: "S" },   // Library in family zone
  { fromSpaceCode: "FOY", toSpaceCode: "MEDIA", relationship: "S" }, // Media in family zone
  { fromSpaceCode: "FOY", toSpaceCode: "WLINK", relationship: "S" }, // Wellness separate
  { fromSpaceCode: "FOY", toSpaceCode: "GYM", relationship: "S" },   // Wellness separate
  { fromSpaceCode: "FOY", toSpaceCode: "SPA", relationship: "S" },   // Wellness separate
  { fromSpaceCode: "FOY", toSpaceCode: "TERR", relationship: "S" },  // Outdoor separate from formal entry
  { fromSpaceCode: "FOY", toSpaceCode: "POOL", relationship: "S" },  // Pool separate
  { fromSpaceCode: "FOY", toSpaceCode: "PRI", relationship: "S" },   // RED FLAG #1: Primary suite isolated
  { fromSpaceCode: "FOY", toSpaceCode: "GUEST1", relationship: "B" },// Guest access buffered from entry
  
  // OFF (Office) - Professional separation
  { fromSpaceCode: "OFF", toSpaceCode: "FOY", relationship: "A" },   // Adjacent to entry
  { fromSpaceCode: "OFF", toSpaceCode: "GR", relationship: "S" },    // Separate from formal living
  { fromSpaceCode: "OFF", toSpaceCode: "DR", relationship: "S" },    // Separate from dining
  { fromSpaceCode: "OFF", toSpaceCode: "PRI", relationship: "S" },   // Separate from primary
  
  // GR (Great Room) - Formal showcase
  { fromSpaceCode: "GR", toSpaceCode: "FOY", relationship: "A" },    // Direct from entry
  { fromSpaceCode: "GR", toSpaceCode: "DR", relationship: "N" },     // Near dining for entertaining flow
  { fromSpaceCode: "GR", toSpaceCode: "TERR", relationship: "N" },   // View axis to terrace
  { fromSpaceCode: "GR", toSpaceCode: "FR", relationship: "B" },     // Buffered from casual
  
  // DR (Dining Room) - Formal dining
  { fromSpaceCode: "DR", toSpaceCode: "FOY", relationship: "N" },    // Near entry
  { fromSpaceCode: "DR", toSpaceCode: "GR", relationship: "N" },     // Near great room
  { fromSpaceCode: "DR", toSpaceCode: "WINE", relationship: "A" },   // Wine adjacent for service
  { fromSpaceCode: "DR", toSpaceCode: "CHEF", relationship: "B" },   // BRIDGE: Butler pantry connection
  { fromSpaceCode: "DR", toSpaceCode: "KIT", relationship: "B" },    // Not directly to show kitchen
  
  // WINE (Wine Storage)
  { fromSpaceCode: "WINE", toSpaceCode: "DR", relationship: "A" },   // Adjacent to dining
  { fromSpaceCode: "WINE", toSpaceCode: "SCUL", relationship: "B" }, // Service access buffered
  { fromSpaceCode: "WINE", toSpaceCode: "CHEF", relationship: "N" }, // Near service kitchen
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 2: FAMILY HUB (FR, KIT, BKF, LIB, MEDIA)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // FR (Family Room) - Daily living hub
  { fromSpaceCode: "FR", toSpaceCode: "FOY", relationship: "B" },    // Buffered from formal entry
  { fromSpaceCode: "FR", toSpaceCode: "GR", relationship: "B" },     // Buffered from formal
  { fromSpaceCode: "FR", toSpaceCode: "KIT", relationship: "A" },    // Open to kitchen
  { fromSpaceCode: "FR", toSpaceCode: "BKF", relationship: "A" },    // Adjacent to breakfast
  { fromSpaceCode: "FR", toSpaceCode: "LIB", relationship: "A" },    // Adjacent to library
  { fromSpaceCode: "FR", toSpaceCode: "MEDIA", relationship: "B" },  // Buffered for acoustics
  { fromSpaceCode: "FR", toSpaceCode: "WLINK", relationship: "A" },  // BRIDGE: Wellness link access
  { fromSpaceCode: "FR", toSpaceCode: "TERR", relationship: "A" },   // Direct outdoor access
  { fromSpaceCode: "FR", toSpaceCode: "POOL", relationship: "N" },   // Near pool
  
  // KIT (Show Kitchen) - Family kitchen
  { fromSpaceCode: "KIT", toSpaceCode: "FOY", relationship: "B" },   // RED FLAG: Buffered from entry
  { fromSpaceCode: "KIT", toSpaceCode: "FR", relationship: "A" },    // Open to family room
  { fromSpaceCode: "KIT", toSpaceCode: "BKF", relationship: "A" },   // Adjacent to breakfast
  { fromSpaceCode: "KIT", toSpaceCode: "SCUL", relationship: "A" },  // Adjacent to scullery
  { fromSpaceCode: "KIT", toSpaceCode: "CHEF", relationship: "N" },  // Near chef's kitchen
  { fromSpaceCode: "KIT", toSpaceCode: "MUD", relationship: "N" },   // Near mudroom
  { fromSpaceCode: "KIT", toSpaceCode: "TERR", relationship: "N" },  // Near terrace
  { fromSpaceCode: "KIT", toSpaceCode: "GUEST1", relationship: "S" },// RED FLAG #5: Guest not through kitchen
  { fromSpaceCode: "KIT", toSpaceCode: "DR", relationship: "B" },    // Buffered from formal dining
  
  // BKF (Breakfast)
  { fromSpaceCode: "BKF", toSpaceCode: "KIT", relationship: "A" },   // Adjacent to kitchen
  { fromSpaceCode: "BKF", toSpaceCode: "FR", relationship: "A" },    // Adjacent to family
  { fromSpaceCode: "BKF", toSpaceCode: "TERR", relationship: "N" },  // Near outdoor
  
  // LIB (Library)
  { fromSpaceCode: "LIB", toSpaceCode: "FR", relationship: "A" },    // Adjacent to family
  { fromSpaceCode: "LIB", toSpaceCode: "OFF", relationship: "B" },   // Buffered from office
  
  // MEDIA (Media Room)
  { fromSpaceCode: "MEDIA", toSpaceCode: "FR", relationship: "B" },  // BRIDGE: Sound lock
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" }, // RED FLAG #3: Acoustic separation
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST1", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST2", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST3", relationship: "S" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 7: SERVICE CORE (CHEF, SCUL, MUD, GAR, LND, MEP)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // CHEF (Chef's Kitchen) - Service kitchen for formal dining
  { fromSpaceCode: "CHEF", toSpaceCode: "DR", relationship: "B" },   // Buffered from dining
  { fromSpaceCode: "CHEF", toSpaceCode: "SCUL", relationship: "A" }, // Adjacent to scullery
  { fromSpaceCode: "CHEF", toSpaceCode: "KIT", relationship: "N" },  // Near show kitchen
  { fromSpaceCode: "CHEF", toSpaceCode: "FOY", relationship: "S" },  // Separate from entry
  { fromSpaceCode: "CHEF", toSpaceCode: "WINE", relationship: "N" }, // Near wine
  
  // SCUL (Scullery) - Service hub
  { fromSpaceCode: "SCUL", toSpaceCode: "KIT", relationship: "A" },  // Adjacent to kitchen
  { fromSpaceCode: "SCUL", toSpaceCode: "CHEF", relationship: "A" }, // Adjacent to chef's
  { fromSpaceCode: "SCUL", toSpaceCode: "MUD", relationship: "A" },  // BRIDGE: Ops core
  { fromSpaceCode: "SCUL", toSpaceCode: "WINE", relationship: "B" }, // Buffered wine access
  { fromSpaceCode: "SCUL", toSpaceCode: "LND", relationship: "N" },  // Near laundry
  
  // MUD (Mudroom) - Daily entry
  { fromSpaceCode: "MUD", toSpaceCode: "SCUL", relationship: "A" },  // BRIDGE: Ops core connection
  { fromSpaceCode: "MUD", toSpaceCode: "KIT", relationship: "N" },   // Near kitchen
  { fromSpaceCode: "MUD", toSpaceCode: "GAR", relationship: "A" },   // Adjacent to garage
  { fromSpaceCode: "MUD", toSpaceCode: "LND", relationship: "N" },   // Near laundry
  
  // GAR (Garage)
  { fromSpaceCode: "GAR", toSpaceCode: "MUD", relationship: "A" },   // Adjacent to mudroom
  { fromSpaceCode: "GAR", toSpaceCode: "FOY", relationship: "S" },   // RED FLAG #2: Not through FOH
  { fromSpaceCode: "GAR", toSpaceCode: "GR", relationship: "S" },    // RED FLAG #2: Not through FOH
  { fromSpaceCode: "GAR", toSpaceCode: "DR", relationship: "S" },    // RED FLAG #2: Not through FOH
  
  // LND (Laundry)
  { fromSpaceCode: "LND", toSpaceCode: "MUD", relationship: "N" },   // Near mudroom
  { fromSpaceCode: "LND", toSpaceCode: "SCUL", relationship: "N" },  // Near scullery
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 4: WELLNESS (WLINK, GYM, SPA, POOL, POOLSUP)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // WLINK (Wellness Link) - Transition zone
  { fromSpaceCode: "WLINK", toSpaceCode: "FR", relationship: "A" },  // Adjacent to family
  { fromSpaceCode: "WLINK", toSpaceCode: "GYM", relationship: "A" }, // Adjacent to gym
  { fromSpaceCode: "WLINK", toSpaceCode: "SPA", relationship: "A" }, // Adjacent to spa
  { fromSpaceCode: "WLINK", toSpaceCode: "POOLSUP", relationship: "A" }, // BRIDGE: Wet-feet intercept
  
  // GYM (Gym)
  { fromSpaceCode: "GYM", toSpaceCode: "WLINK", relationship: "A" }, // Adjacent to link
  { fromSpaceCode: "GYM", toSpaceCode: "SPA", relationship: "N" },   // Near spa
  { fromSpaceCode: "GYM", toSpaceCode: "TERR", relationship: "N" },  // Near outdoor
  
  // SPA (Spa)
  { fromSpaceCode: "SPA", toSpaceCode: "WLINK", relationship: "A" }, // Adjacent to link
  { fromSpaceCode: "SPA", toSpaceCode: "GYM", relationship: "N" },   // Near gym
  { fromSpaceCode: "SPA", toSpaceCode: "POOL", relationship: "A" },  // Adjacent to pool
  { fromSpaceCode: "SPA", toSpaceCode: "POOLSUP", relationship: "A" },// Adjacent to pool support
  
  // POOLSUP (Pool Support) - Wet-feet intercept
  { fromSpaceCode: "POOLSUP", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "POOLSUP", toSpaceCode: "SPA", relationship: "A" },
  { fromSpaceCode: "POOLSUP", toSpaceCode: "WLINK", relationship: "A" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 8: OUTDOOR (TERR, POOL)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // TERR (Terrace)
  { fromSpaceCode: "TERR", toSpaceCode: "FR", relationship: "A" },   // Adjacent to family
  { fromSpaceCode: "TERR", toSpaceCode: "POOL", relationship: "A" }, // Adjacent to pool
  { fromSpaceCode: "TERR", toSpaceCode: "GR", relationship: "N" },   // Near great room
  { fromSpaceCode: "TERR", toSpaceCode: "KIT", relationship: "N" },  // Near kitchen
  { fromSpaceCode: "TERR", toSpaceCode: "BKF", relationship: "N" },  // Near breakfast
  { fromSpaceCode: "TERR", toSpaceCode: "GYM", relationship: "N" },  // Near gym
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 5: PRIMARY SUITE (PRI, PRIBATH, PRICL, PRILOUNGE)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // PRI (Primary Bedroom) - Isolated sanctuary
  { fromSpaceCode: "PRI", toSpaceCode: "PRIBATH", relationship: "A" },
  { fromSpaceCode: "PRI", toSpaceCode: "PRICL", relationship: "A" },
  { fromSpaceCode: "PRI", toSpaceCode: "PRILOUNGE", relationship: "A" },
  { fromSpaceCode: "PRI", toSpaceCode: "FOY", relationship: "S" },   // RED FLAG #1: Isolated from entry
  { fromSpaceCode: "PRI", toSpaceCode: "GUEST1", relationship: "B" },// RED FLAG #1: Buffered from guests
  { fromSpaceCode: "PRI", toSpaceCode: "GUEST2", relationship: "B" },
  { fromSpaceCode: "PRI", toSpaceCode: "MEDIA", relationship: "S" }, // Acoustic separation
  
  // PRIBATH (Primary Bath)
  { fromSpaceCode: "PRIBATH", toSpaceCode: "PRI", relationship: "A" },
  { fromSpaceCode: "PRIBATH", toSpaceCode: "PRICL", relationship: "N" },
  
  // PRICL (Primary Closet)
  { fromSpaceCode: "PRICL", toSpaceCode: "PRI", relationship: "A" },
  { fromSpaceCode: "PRICL", toSpaceCode: "PRIBATH", relationship: "N" },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 6: GUEST SUITES (GUEST1, GUEST2, GUEST3)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // GUEST1 (Guest Suite 1) - Can be Jr. Primary
  { fromSpaceCode: "GUEST1", toSpaceCode: "GUEST2", relationship: "N" },// Near other guests
  { fromSpaceCode: "GUEST1", toSpaceCode: "PRI", relationship: "B" },  // Buffered from primary
  { fromSpaceCode: "GUEST1", toSpaceCode: "FOY", relationship: "B" },  // Buffered from entry
  { fromSpaceCode: "GUEST1", toSpaceCode: "KIT", relationship: "S" },  // RED FLAG #5: Not through kitchen
  { fromSpaceCode: "GUEST1", toSpaceCode: "MEDIA", relationship: "S" },// Acoustic separation
  
  // GUEST2 (Guest Suite 2)
  { fromSpaceCode: "GUEST2", toSpaceCode: "GUEST1", relationship: "N" },
  { fromSpaceCode: "GUEST2", toSpaceCode: "GUEST3", relationship: "N" },
  { fromSpaceCode: "GUEST2", toSpaceCode: "PRI", relationship: "B" },
  { fromSpaceCode: "GUEST2", toSpaceCode: "MEDIA", relationship: "S" },
  
  // GUEST3 (Guest Suite 3)
  { fromSpaceCode: "GUEST3", toSpaceCode: "GUEST2", relationship: "N" },
  { fromSpaceCode: "GUEST3", toSpaceCode: "PRI", relationship: "B" },
  { fromSpaceCode: "GUEST3", toSpaceCode: "MEDIA", relationship: "S" }
];

const nodes15k: CirculationNode[] = [
  {
    id: "node-1",
    name: "Node 1: Front Gallery + Formal",
    description: "Arrival, formal entertaining, and office",
    spaceCodes: ["FOY", "OFF", "GR", "DR", "WINE"]
  },
  {
    id: "node-2",
    name: "Node 2: Family Hub + Service + Wellness",
    description: "Daily living, dual-kitchen service, wellness, and outdoor",
    spaceCodes: ["FR", "KIT", "BKF", "CHEF", "SCUL", "MUD", "LIB", "MEDIA", "WLINK", "GYM", "SPA", "TERR", "POOL"]
  }
];

const crossLinks15k: CrossLink[] = [
  { id: "cl-1", number: 1, name: "Formal View Axis", description: "Great Room to Terrace", fromSpaceCode: "GR", toSpaceCode: "TERR", purpose: "Near connection for formal view" },
  { id: "cl-2", number: 2, name: "Wine Service Link", description: "Wine to Scullery", fromSpaceCode: "WINE", toSpaceCode: "SCUL", purpose: "Buffered service connection" },
  { id: "cl-3", number: 3, name: "Daily Connector", description: "Foyer to Family", fromSpaceCode: "FOY", toSpaceCode: "FR", purpose: "Buffered daily connector" }
];

const preset15kSpaces: BriefSpace[] = [
  // Level 1: Arrival + Formal (2,020 SF)
  { id: "s1", code: "FOY", name: "Foyer / Gallery + coat + powder", targetSF: 520, zone: "Arrival + Formal", level: 1, rationale: "Arrival sequence and art wall; controls privacy" },
  { id: "s2", code: "OFF", name: "Private Office", targetSF: 260, zone: "Arrival + Formal", level: 1, rationale: "Visitor-ready without entering family zones" },
  { id: "s3", code: "GR", name: "Great Room (formal)", targetSF: 680, zone: "Arrival + Formal", level: 1, rationale: "Showcase volume; formal entertaining anchor" },
  { id: "s4", code: "DR", name: "Formal Dining", targetSF: 380, zone: "Arrival + Formal", level: 1, rationale: "Seats 12 with proper service clearances" },
  { id: "s5", code: "WINE", name: "Wine Storage / Tasting", targetSF: 180, zone: "Arrival + Formal", level: 1, rationale: "Adjacent to DR; tasting table and display" },
  // Level 1: Family Hub (2,620 SF)
  { id: "s6", code: "FR", name: "Family Room (hub)", targetSF: 640, zone: "Family Hub", level: 1, rationale: "Daily distributor adjacent to LIB and buffered MEDIA" },
  { id: "s7", code: "KIT", name: "Kitchen", targetSF: 460, zone: "Family Hub", level: 1, rationale: "Chef-grade kitchen; island and appliance wall" },
  { id: "s8", code: "BKF", name: "Breakfast Nook", targetSF: 180, zone: "Family Hub", level: 1, rationale: "Daily meals with light and terrace proximity" },
  { id: "s9", code: "SCUL", name: "Scullery / Prep + pantry", targetSF: 300, zone: "Family Hub", level: 1, rationale: "Catering support, cleanup, overflow appliances" },
  { id: "s9b", code: "CHEF", name: "Chef's Kitchen (service)", targetSF: 220, zone: "Service Core", level: 1, rationale: "Discrete service kitchen for formal dining; buffered from dining room to control noise and smells" },
  { id: "s10", code: "MUD", name: "Mudroom / Daily Entry", targetSF: 220, zone: "Family Hub", level: 1, rationale: "Daily entry; direct to SCUL" },
  { id: "s11", code: "LIB", name: "Library", targetSF: 260, zone: "Family Hub", level: 1, rationale: "High-use quiet room at the hub edge" },
  { id: "s12", code: "MEDIA", name: "Media / Theater (buffered)", targetSF: 360, zone: "Family Hub", level: 1, rationale: "Adjacent for usage but acoustically controlled" },
  // Level 1: Wellness (940 SF)
  { id: "s13", code: "WLINK", name: "Wellness Link (room)", targetSF: 160, zone: "Wellness", level: 1, rationale: "A room-like connector; avoids corridor feel and buffers noise" },
  { id: "s14", code: "GYM", name: "Gym (daylight + views)", targetSF: 320, zone: "Wellness", level: 1, rationale: "View-facing fitness space" },
  { id: "s15", code: "SPA", name: "Spa / Wellness (daylight + views)", targetSF: 300, zone: "Wellness", level: 1, rationale: "Steam/sauna + treatment; visual connection to pool" },
  { id: "s16", code: "POOLSUP", name: "Pool Support", targetSF: 160, zone: "Wellness", level: 1, rationale: "Wet support keeps interiors dry" },
  // Level 1: Hospitality (520 SF)
  { id: "s17", code: "GSL1", name: "Guest Suite (Level 1)", targetSF: 520, zone: "Hospitality", level: 1, rationale: "Main-level guest accommodation / accessibility" },
  // Level 1: Service (580 SF)
  { id: "s18", code: "LAUN1", name: "Laundry (L1)", targetSF: 160, zone: "Service Core", level: 1, rationale: "Primary laundry and utility sink" },
  { id: "s19", code: "MEP", name: "Mechanical / Storage / AV / IT", targetSF: 420, zone: "Service Core", level: 1, rationale: "No-basement systems and storage" },
  // Level 1: Circulation (2,520 SF)
  { id: "s20", code: "CIRC1", name: "Circulation + stair/lift allowance", targetSF: 2520, zone: "Circulation", level: 1, rationale: "Generous galleries and node-based connectors" },
  // Level 1: Outdoor
  { id: "s21", code: "TERR", name: "Main Terrace / Outdoor Living", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  { id: "s22", code: "POOL", name: "Lap Pool + Deck", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  // Level 2: Primary Wing (1,440 SF)
  { id: "s23", code: "PRI", name: "Primary Bedroom", targetSF: 440, zone: "Primary Wing", level: 2, rationale: "Sleeping + seating zone with outlook; quiet separation" },
  { id: "s24", code: "PRIBATH", name: "Primary Bath", targetSF: 340, zone: "Primary Wing", level: 2, rationale: "Wet room + tub; daylight" },
  { id: "s25", code: "PRICL", name: "Primary Closets (his/hers)", targetSF: 420, zone: "Primary Wing", level: 2, rationale: "Dressing experience with islands and storage" },
  { id: "s26", code: "PRILNG", name: "Primary Lounge", targetSF: 240, zone: "Primary Wing", level: 2, rationale: "Private decompression/reading" },
  // Level 2: Guest Suites (2,020 SF)
  { id: "s27", code: "LAND", name: "Landing (daylit)", targetSF: 760, zone: "Guest Suites", level: 2, rationale: "Compact node; avoids long corridors" },
  { id: "s28", code: "GUEST1", name: "Guest Suite (L2) #1", targetSF: 420, zone: "Guest Suites", level: 2, rationale: "True suite proportions; long-stay comfort" },
  { id: "s29", code: "GUEST2", name: "Guest Suite (L2) #2", targetSF: 420, zone: "Guest Suites", level: 2, rationale: "Consistent luxury standard" },
  { id: "s30", code: "GUEST3", name: "Guest Suite (L2) #3", targetSF: 420, zone: "Guest Suites", level: 2, rationale: "Consistent luxury standard" },
  // Level 2: Support (380 SF)
  { id: "s31", code: "LAUN2", name: "Laundry + linen (L2)", targetSF: 200, zone: "Support", level: 2, rationale: "Reduces vertical traffic; supports suites" },
  { id: "s32", code: "MEP2", name: "Storage / IT (L2)", targetSF: 180, zone: "Support", level: 2, rationale: "No-basement systems and seasonal storage" },
  // Level 2: Circulation (2,160 SF)
  { id: "s33", code: "CORE2", name: "Stair/lift distribution + corridors", targetSF: 2160, zone: "Circulation", level: 2, rationale: "Generous landing and short connectors" }
];

const bubbleDiagram15k = `graph LR
  EXT["Exterior Arrival / Entry"]
  FOY["Foyer / Gallery"]
  CORE["Main Stair / Lift Core"]

  OFF["Private Office (visitor entry)"]
  GR["Great Room (formal)"]
  DR["Formal Dining"]
  WINE["Wine Storage / Tasting"]

  FR["Family Room (hub)"]
  KIT["Show Kitchen (family)"]
  BKF["Breakfast Nook"]
  CHEF["Chef's Kitchen (service)"]
  SCUL["Scullery / Prep"]
  MUD["Mudroom / Daily Entry"]
  LIB["Library"]
  MEDIA["Media / Theater (buffered)"]

  WLINK["Wellness Link (room)"]
  GYM["Gym (daylight + views)"]
  SPA["Spa / Wellness (daylight + views)"]
  TERR["Main Terrace / Outdoor Living"]
  POOL["Lap Pool + Deck"]

  PRI["Primary Suite (L2)"]
  LAND["Landing (daylit)"]
  G1["Guest Suite (L2) #1"]
  G2["Guest Suite (L2) #2"]
  G3["Guest Suite (L2) #3"]

  EXT --> FOY --> CORE

  subgraph N1[Node 1: Front Gallery + Formal]
    FOY
    OFF
    GR
    DR
    WINE
  end

  subgraph N2[Node 2: Family Hub + Service + Wellness]
    FR
    KIT
    BKF
    CHEF
    SCUL
    MUD
    LIB
    MEDIA
    WLINK
    GYM
    SPA
    TERR
    POOL
  end

  subgraph L2[Level 2: Sleeping Level]
    PRI
    LAND
    G1
    G2
    G3
  end

  FOY --> OFF
  FOY --> GR
  FOY --> DR --> WINE
  FOY -->|B| KIT
  FOY -->|B| FR

  FR --> KIT --> BKF
  KIT --> SCUL
  KIT -->|N| CHEF
  CHEF --> SCUL
  DR -->|B| CHEF
  MUD --> SCUL
  FR --> LIB
  FR --> MEDIA
  FR --> TERR
  KIT -->|N| TERR

  FR --> WLINK
  WLINK --> GYM
  WLINK --> SPA --> POOL
  TERR --> POOL

  GR -->|N| TERR
  WINE -->|Service| SCUL

  CORE --> PRI
  CORE --> LAND
  LAND --> G1
  LAND --> G2
  LAND --> G3`;

const twoNodeDescription15k = `Two-Node Circulation Strategy (15,000 SF)

Node 1: Front Gallery + Formal
- Primary arrival and formal presentation zone
- Contains: Foyer/Gallery, Private Office, Great Room, Formal Dining, Wine Storage/Tasting
- Character: Formal, curated, impressive first impression
- Private Office has exterior visitor door

Node 2: Family Hub + Service + Wellness
- Daily living, dual-kitchen service, and wellness zone
- Contains: Family Room, Show Kitchen, Breakfast, Chef's Kitchen, Scullery, Mudroom, Library, Media, Wellness Link, Gym, Spa, Pool, Terrace
- Character: Casual, functional, activity-based
- WLINK is a room (not corridor) that connects to Gym and Spa only

Dual-Kitchen Strategy:
- Show Kitchen (KIT): Family "performer" kitchen open to living spaces; island-centric, guest-friendly
- Chef's Kitchen (CHEF): Discrete service kitchen for formal dining events; buffered from Dining Room to control noise/smells; adjacent to Scullery

Level 2 Organization:
- Primary Wing: Full suite with lounge for private decompression
- Guest Suites: Three suites accessed from daylit landing node
- Compact circulation avoids long corridors

Cross-Links (Controlled Connections):
1. Great Room to Terrace: Near connection (N) for formal view axis
2. Wine to Scullery: Buffered (B) service connection
3. Foyer to Family: Buffered (B) daily connector
4. Dining to Chef's Kitchen: Buffered (B) service connection

Key Corrections Applied:
- Terrace relationships: GR and KIT are Near (N) to TERR
- WLINK connects only to SPA/GYM (not bedrooms)
- All S (Separate) pairs are in different nodes
- Dual-kitchen system separates family daily use from formal service`;

// ============================================================================
// 20,000 SF PRESET
// ============================================================================

const adjacencyMatrix20k: AdjacencyRequirement[] = [
  // FOY relationships
  { fromSpaceCode: "FOY", toSpaceCode: "OFF", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "GR", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "SAL", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "DR", relationship: "N" },
  { fromSpaceCode: "FOY", toSpaceCode: "WINE", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "FR", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "KIT", relationship: "B" },
  { fromSpaceCode: "FOY", toSpaceCode: "CHEF", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SCUL", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MUD", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "LIB", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "MEDIA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "BAR", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GAME", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "TERR", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GYM", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SPA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "POOL", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GSL1A", relationship: "A" },
  { fromSpaceCode: "FOY", toSpaceCode: "GSL1B", relationship: "A" },
  // OFF relationships
  { fromSpaceCode: "OFF", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "OFF", toSpaceCode: "GR", relationship: "S" },
  { fromSpaceCode: "OFF", toSpaceCode: "SAL", relationship: "S" },
  // GR relationships
  { fromSpaceCode: "GR", toSpaceCode: "FOY", relationship: "A" },
  { fromSpaceCode: "GR", toSpaceCode: "TERR", relationship: "N" },
  // SAL relationships
  { fromSpaceCode: "SAL", toSpaceCode: "FOY", relationship: "A" },
  // DR relationships
  { fromSpaceCode: "DR", toSpaceCode: "FOY", relationship: "N" },
  { fromSpaceCode: "DR", toSpaceCode: "WINE", relationship: "A" },
  { fromSpaceCode: "DR", toSpaceCode: "CHEF", relationship: "B" },
  // CHEF relationships (Chef's Kitchen - service kitchen for formal dining)
  { fromSpaceCode: "CHEF", toSpaceCode: "DR", relationship: "B" },
  { fromSpaceCode: "CHEF", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "CHEF", toSpaceCode: "KIT", relationship: "N" },
  { fromSpaceCode: "CHEF", toSpaceCode: "FOY", relationship: "S" },
  // WINE relationships
  { fromSpaceCode: "WINE", toSpaceCode: "DR", relationship: "A" },
  { fromSpaceCode: "WINE", toSpaceCode: "SCUL", relationship: "B" },
  // FR relationships
  { fromSpaceCode: "FR", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "LIB", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "MEDIA", relationship: "B" },
  { fromSpaceCode: "FR", toSpaceCode: "BAR", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "TERR", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "GYM", relationship: "A" },
  // KIT relationships
  { fromSpaceCode: "KIT", toSpaceCode: "FOY", relationship: "B" },
  { fromSpaceCode: "KIT", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "BKF", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "KIT", toSpaceCode: "CHEF", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "MUD", relationship: "N" },
  { fromSpaceCode: "KIT", toSpaceCode: "TERR", relationship: "N" },
  // SCUL relationships
  { fromSpaceCode: "SCUL", toSpaceCode: "KIT", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "CHEF", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "MUD", relationship: "A" },
  { fromSpaceCode: "SCUL", toSpaceCode: "WINE", relationship: "B" },
  // MUD relationships
  { fromSpaceCode: "MUD", toSpaceCode: "SCUL", relationship: "A" },
  { fromSpaceCode: "MUD", toSpaceCode: "KIT", relationship: "N" },
  // BAR relationships
  { fromSpaceCode: "BAR", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "BAR", toSpaceCode: "GAME", relationship: "A" },
  { fromSpaceCode: "BAR", toSpaceCode: "TERR", relationship: "A" },
  // GAME relationships
  { fromSpaceCode: "GAME", toSpaceCode: "BAR", relationship: "A" },
  // GYM relationships
  { fromSpaceCode: "GYM", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "GYM", toSpaceCode: "SPA", relationship: "A" },
  // SPA relationships
  { fromSpaceCode: "SPA", toSpaceCode: "GYM", relationship: "A" },
  { fromSpaceCode: "SPA", toSpaceCode: "POOL", relationship: "A" },
  // TERR relationships
  { fromSpaceCode: "TERR", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "BAR", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "GR", relationship: "N" },
  { fromSpaceCode: "TERR", toSpaceCode: "KIT", relationship: "N" },
  // Acoustic separations
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST1", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST2", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST3", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST4", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "KIDS", relationship: "S" }
];

const nodes20k: CirculationNode[] = [
  {
    id: "node-1",
    name: "Node 1: Front Gallery + Formal",
    description: "Arrival, formal entertaining, office, and main-level guest suites",
    spaceCodes: ["FOY", "OFF", "GR", "SAL", "DR", "WINE", "GSL1A", "GSL1B"]
  },
  {
    id: "node-2",
    name: "Node 2: Family Hub + Entertainment + Service",
    description: "Daily living, dual-kitchen service, bar, game room, wellness, and outdoor",
    spaceCodes: ["FR", "KIT", "BKF", "CHEF", "SCUL", "MUD", "LIB", "MEDIA", "BAR", "GAME", "TERR", "GYM", "SPA", "POOL"]
  }
];

const crossLinks20k: CrossLink[] = [
  { id: "cl-1", number: 1, name: "Formal View Axis", description: "Great Room to Terrace", fromSpaceCode: "GR", toSpaceCode: "TERR", purpose: "Near connection for formal view" },
  { id: "cl-2", number: 2, name: "Wine Service Link", description: "Wine to Scullery", fromSpaceCode: "WINE", toSpaceCode: "SCUL", purpose: "Buffered service connection" },
  { id: "cl-3", number: 3, name: "Daily Connector", description: "Foyer to Family", fromSpaceCode: "FOY", toSpaceCode: "FR", purpose: "Buffered daily connector" },
  { id: "cl-4", number: 4, name: "Entertainment Link", description: "Bar to Terrace", fromSpaceCode: "BAR", toSpaceCode: "TERR", purpose: "Adjacent outdoor entertaining" }
];

const preset20kSpaces: BriefSpace[] = [
  // Level 1: Arrival + Formal (2,890 SF)
  { id: "s1", code: "FOY", name: "Foyer / Gallery + coat + powder", targetSF: 650, zone: "Arrival + Formal", level: 1, rationale: "Grand but controlled arrival; art wall and sightlines" },
  { id: "s2", code: "OFF", name: "Private Office", targetSF: 280, zone: "Arrival + Formal", level: 1, rationale: "Meetings without entering family zones" },
  { id: "s3", code: "GR", name: "Great Room (formal)", targetSF: 800, zone: "Arrival + Formal", level: 1, rationale: "Showcase volume; supports larger entertaining" },
  { id: "s4", code: "SAL", name: "Formal Lounge / Salon", targetSF: 520, zone: "Arrival + Formal", level: 1, rationale: "Secondary formal sitting; spreads entertaining load" },
  { id: "s5", code: "DR", name: "Formal Dining", targetSF: 420, zone: "Arrival + Formal", level: 1, rationale: "Seats 12-14; correct service clearances" },
  { id: "s6", code: "WINE", name: "Wine Storage / Tasting", targetSF: 220, zone: "Arrival + Formal", level: 1, rationale: "Tasting table + display; adjacent to DR" },
  // Level 1: Family Hub (3,550 SF)
  { id: "s7", code: "FR", name: "Family Room (hub)", targetSF: 760, zone: "Family Hub", level: 1, rationale: "High-use distributor adjacent to LIB/MEDIA/BAR" },
  { id: "s8", code: "KIT", name: "Kitchen", targetSF: 520, zone: "Family Hub", level: 1, rationale: "Chef-grade kitchen; larger island and appliance wall" },
  { id: "s9", code: "BKF", name: "Breakfast Nook", targetSF: 190, zone: "Family Hub", level: 1, rationale: "Daily meals; terrace proximity" },
  { id: "s10", code: "SCUL", name: "Scullery / Catering Prep", targetSF: 360, zone: "Family Hub", level: 1, rationale: "Secondary kitchen functions for events" },
  { id: "s10b", code: "CHEF", name: "Chef's Kitchen (service)", targetSF: 280, zone: "Service Core", level: 1, rationale: "Discrete service kitchen for formal dining; buffered from dining room to control noise and smells" },
  { id: "s11", code: "MUD", name: "Mudroom / Daily Entry", targetSF: 260, zone: "Family Hub", level: 1, rationale: "Direct adjacency to service spine (SCUL)" },
  { id: "s12", code: "LIB", name: "Library", targetSF: 320, zone: "Family Hub", level: 1, rationale: "Quiet edge to hub" },
  { id: "s13", code: "MEDIA", name: "Media / Theater (buffered)", targetSF: 420, zone: "Family Hub", level: 1, rationale: "High performance A/V; sound lock" },
  { id: "s14", code: "BAR", name: "Bar / Lounge", targetSF: 280, zone: "Family Hub", level: 1, rationale: "Social node; supports outdoor living" },
  { id: "s15", code: "GAME", name: "Game / Recreation", targetSF: 420, zone: "Family Hub", level: 1, rationale: "Dedicated activity room" },
  // Level 1: Wellness (920 SF)
  { id: "s16", code: "GYM", name: "Gym (daylight + views)", targetSF: 380, zone: "Wellness", level: 1, rationale: "Premium fitness space with glazing" },
  { id: "s17", code: "SPA", name: "Spa / Wellness (daylight + views)", targetSF: 360, zone: "Wellness", level: 1, rationale: "Steam/sauna + treatment; adjacency to pool" },
  { id: "s18", code: "POOLSUP", name: "Pool Support", targetSF: 180, zone: "Wellness", level: 1, rationale: "Wet support to keep interiors dry" },
  // Level 1: Hospitality (1,040 SF)
  { id: "s19", code: "GSL1A", name: "Guest Suite 1 (L1)", targetSF: 520, zone: "Hospitality", level: 1, rationale: "Main-level guest accommodation" },
  { id: "s20", code: "GSL1B", name: "Guest Suite 2 (L1)", targetSF: 520, zone: "Hospitality", level: 1, rationale: "Second suite enables simultaneous hosting" },
  // Level 1: Service (700 SF)
  { id: "s21", code: "LAUN1", name: "Laundry (L1)", targetSF: 180, zone: "Service Core", level: 1, rationale: "Primary laundry; utility sink + folding" },
  { id: "s22", code: "MEP", name: "Mechanical / Storage / AV / IT", targetSF: 520, zone: "Service Core", level: 1, rationale: "No-basement requires robust above-grade support" },
  // Level 1: Circulation (2,920 SF)
  { id: "s23", code: "CIRC1", name: "Circulation + stair/lift allowance", targetSF: 2920, zone: "Circulation", level: 1, rationale: "Generous galleries; node-based plan" },
  // Level 1: Outdoor
  { id: "s24", code: "TERR", name: "Main Terrace / Outdoor Living", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  { id: "s25", code: "POOL", name: "Lap Pool + Deck", targetSF: 0, zone: "Outdoor", level: 1, rationale: "Exterior - not counted in SF" },
  // Level 2: Primary Wing (1,740 SF)
  { id: "s26", code: "PRI", name: "Primary Bedroom", targetSF: 520, zone: "Primary Wing", level: 2, rationale: "Outlook and privacy; separated from kids/guest circulation" },
  { id: "s27", code: "PRIBATH", name: "Primary Bath", targetSF: 420, zone: "Primary Wing", level: 2, rationale: "Wet room + tub; daylight" },
  { id: "s28", code: "PRICL", name: "Primary Closets (his/hers)", targetSF: 520, zone: "Primary Wing", level: 2, rationale: "Dressing experience" },
  { id: "s29", code: "PRILNG", name: "Primary Lounge", targetSF: 280, zone: "Primary Wing", level: 2, rationale: "Private decompression" },
  // Level 2: Guest Suites (2,420 SF)
  { id: "s30", code: "LAND", name: "Landing (daylit)", targetSF: 980, zone: "Guest Suites", level: 2, rationale: "Node distribution; avoids long corridors" },
  { id: "s31", code: "GUEST1", name: "Guest Suite (L2) #1", targetSF: 360, zone: "Guest Suites", level: 2, rationale: "Long-stay comfort" },
  { id: "s32", code: "GUEST2", name: "Guest Suite (L2) #2", targetSF: 360, zone: "Guest Suites", level: 2, rationale: "Long-stay comfort" },
  { id: "s33", code: "GUEST3", name: "Guest Suite (L2) #3", targetSF: 360, zone: "Guest Suites", level: 2, rationale: "Long-stay comfort" },
  { id: "s34", code: "GUEST4", name: "Guest Suite (L2) #4", targetSF: 360, zone: "Guest Suites", level: 2, rationale: "Long-stay comfort" },
  // Level 2: Kids Zone (840 SF)
  { id: "s35", code: "PLAY", name: "Kids Playroom (L2)", targetSF: 320, zone: "Kids Zone", level: 2, rationale: "Buffer between landing and kids sleeping" },
  { id: "s36", code: "KIDS", name: "Kids Room / Bunk Room (L2)", targetSF: 300, zone: "Kids Zone", level: 2, rationale: "Bunks + lounge; close to playroom for supervision" },
  { id: "s37", code: "HW", name: "Homework / Loft Perch (L2)", targetSF: 220, zone: "Kids Zone", level: 2, rationale: "After-school use; reduces clutter" },
  // Level 2: Support (420 SF)
  { id: "s38", code: "LAUN2", name: "Laundry + linen (L2)", targetSF: 220, zone: "Support", level: 2, rationale: "Supports guest suites; reduces vertical traffic" },
  { id: "s39", code: "MEP2", name: "Storage / IT (L2)", targetSF: 200, zone: "Support", level: 2, rationale: "No-basement systems" },
  // Level 2: Circulation (2,580 SF)
  { id: "s40", code: "CORE2", name: "Stair/lift distribution + corridors", targetSF: 2580, zone: "Circulation", level: 2, rationale: "Generous landing and short connectors" }
];

const bubbleDiagram20k = `graph LR
  EXT["Exterior Arrival / Entry"]
  FOY["Foyer / Gallery"]
  CORE["Main Stair / Lift Core"]

  OFF["Private Office (visitor entry)"]
  GR["Great Room (formal)"]
  SAL["Formal Lounge / Salon"]
  DR["Formal Dining"]
  WINE["Wine Storage / Tasting"]
  GS1["Guest Suite (L1) #1"]
  GS2["Guest Suite (L1) #2"]

  FR["Family Room (hub)"]
  KIT["Show Kitchen (family)"]
  BKF["Breakfast Nook"]
  CHEF["Chef's Kitchen (service)"]
  SCUL["Scullery / Catering Prep"]
  MUD["Mudroom / Daily Entry"]
  LIB["Library"]
  MEDIA["Media / Theater (buffered)"]
  BAR["Bar / Lounge"]
  GAME["Game / Recreation"]

  TERR["Main Terrace / Outdoor Living"]
  GYM["Gym (daylight + views)"]
  SPA["Spa / Wellness (daylight + views)"]
  POOL["Lap Pool + Deck"]

  PRI["Primary Suite (L2)"]
  LAND["Landing (daylit)"]
  G1["Guest Suite (L2) #1"]
  G2["Guest Suite (L2) #2"]
  G3["Guest Suite (L2) #3"]
  G4["Guest Suite (L2) #4"]
  PLAY["Kids Playroom (L2)"]
  KIDS["Kids Room / Bunk (L2)"]
  HW["Homework / Loft (L2)"]

  EXT --> FOY --> CORE

  subgraph N1[Node 1: Front Gallery + Formal]
    FOY
    OFF
    GR
    SAL
    DR
    WINE
    GS1
    GS2
  end

  subgraph N2[Node 2: Family Hub + Entertainment + Service]
    FR
    KIT
    BKF
    CHEF
    SCUL
    MUD
    LIB
    MEDIA
    BAR
    GAME
    TERR
    GYM
    SPA
    POOL
  end

  subgraph L2[Level 2: Sleeping + Kids]
    PRI
    LAND
    G1
    G2
    G3
    G4
    PLAY
    KIDS
    HW
  end

  FOY --> OFF
  FOY --> GR
  FOY --> SAL
  FOY --> DR --> WINE
  FOY --> GS1
  FOY --> GS2
  FOY -->|B| KIT
  FOY -->|B| FR

  FR --> KIT --> BKF
  KIT --> SCUL
  KIT -->|N| CHEF
  CHEF --> SCUL
  DR -->|B| CHEF
  MUD --> SCUL
  FR --> LIB
  FR --> MEDIA
  FR --> BAR --> GAME
  FR --> TERR
  KIT -->|N| TERR
  BAR --> TERR

  FR --> GYM --> SPA --> POOL
  TERR --> POOL

  GR -->|N| TERR
  WINE -->|Service| SCUL

  CORE --> PRI
  CORE --> LAND
  LAND --> G1
  LAND --> G2
  LAND --> G3
  LAND --> G4
  LAND --> PLAY --> KIDS
  LAND --> HW`;

const twoNodeDescription20k = `Two-Node Circulation Strategy (20,000 SF)

Node 1: Front Gallery + Formal
- Primary arrival and formal presentation zone
- Contains: Foyer/Gallery, Private Office, Great Room, Salon, Formal Dining, Wine Storage, 2 Main-Level Guest Suites
- Character: Grand, formal, visitor-ready
- Salon provides secondary formal sitting to spread entertaining load
- Two L1 guest suites enable simultaneous hosting

Node 2: Family Hub + Entertainment + Service
- Daily living, dual-kitchen service, entertainment, and wellness zone
- Contains: Family Room, Show Kitchen, Breakfast, Chef's Kitchen, Scullery, Mudroom, Library, Media, Bar, Game Room, Terrace, Gym, Spa, Pool
- Character: Casual, activity-based, family-oriented
- Bar/Game Room form entertainment wing with terrace access
- Mudroom is Adjacent to Scullery (service spine requirement)

Dual-Kitchen Strategy:
- Show Kitchen (KIT): Family "performer" kitchen open to living spaces; island-centric, guest-friendly
- Chef's Kitchen (CHEF): Discrete service kitchen for formal dining events; buffered from Dining Room to control noise/smells; adjacent to Scullery

Level 2 Organization:
- Primary Wing: Isolated from kids/guest circulation with full lounge
- Guest Suites: Four suites accessed from daylit landing node
- Kids Zone: Playroom, Bunk Room, and Homework loft with supervision proximity

Cross-Links (Controlled Connections):
1. Great Room to Terrace: Near connection (N) for formal view axis
2. Wine to Scullery: Buffered (B) service connection
3. Foyer to Family: Buffered (B) daily connector
4. Bar to Terrace: Adjacent (A) for outdoor entertaining
5. Dining to Chef's Kitchen: Buffered (B) service connection

Key Corrections Applied:
- FOY to KIT is Buffered (B)
- MUD is Adjacent (A) to SCUL (service spine)
- GR and KIT are Near (N) to TERR
- Primary suite isolated from entertainment wing
- Dual-kitchen system separates family daily use from formal service`;

// ============================================================================
// EXPORT PRESETS
// ============================================================================

export const programPresets: ProgramPreset[] = [
  {
    id: "5k",
    name: "5,000 SF",
    targetSF: 5000,
    description: "Compact luxury | 4 bedrooms | single-level living | pool",
    available: true,
    spaces: preset5kSpaces,
    adjacencyMatrix: adjacencyMatrix5k,
    nodes: nodes5k,
    crossLinks: crossLinks5k,
    bridgeConfig: {
      butlerPantry: false,    // No butler pantry at this tier
      guestAutonomy: false,   // Guest suites clustered, no autonomy zone
      soundLock: false,       // Media room separated but no dedicated sound lock
      wetFeetIntercept: true, // Pool support zone included
      opsCore: true           // Mudroom + laundry for operations
    },
    bubbleDiagramCode: bubbleDiagram5k,
    twoNodeDescription: twoNodeDescription5k
  },
  {
    id: "10k",
    name: "10,000 SF",
    targetSF: 10000,
    description: "2-level | 4 bedrooms | no basement | lap pool scenario",
    available: true,
    spaces: preset10kSpaces,
    adjacencyMatrix: adjacencyMatrix10k,
    nodes: nodes10k,
    crossLinks: crossLinks10k,
    bridgeConfig: {
      butlerPantry: true,     // Scullery acts as service staging
      guestAutonomy: true,    // Multiple guest suites with autonomy
      soundLock: true,        // Media room buffered for acoustic control
      wetFeetIntercept: true, // Pool support + spa zone included
      opsCore: true           // Mudroom + laundry for operations
    },
    bubbleDiagramCode: bubbleDiagram10k,
    twoNodeDescription: twoNodeDescription10k
  },
  {
    id: "15k",
    name: "15,000 SF",
    targetSF: 15000,
    description: "2-level | 5 bedrooms | no basement | lap pool + acreage",
    available: true,
    spaces: preset15kSpaces,
    adjacencyMatrix: adjacencyMatrix15k,
    nodes: nodes15k,
    crossLinks: crossLinks15k,
    bridgeConfig: {
      butlerPantry: true,     // Scullery + butler staging included
      guestAutonomy: true,    // Guest wing with independence
      soundLock: true,        // Media/theater with acoustic separation
      wetFeetIntercept: true, // Pool deck + spa support zone
      opsCore: true           // Full service core with staff areas
    },
    bubbleDiagramCode: bubbleDiagram15k,
    twoNodeDescription: twoNodeDescription15k
  },
  {
    id: "20k",
    name: "20,000 SF",
    targetSF: 20000,
    description: "2-level | 8 bedrooms | expanded amenities | no basement",
    available: true,
    spaces: preset20kSpaces,
    adjacencyMatrix: adjacencyMatrix20k,
    nodes: nodes20k,
    crossLinks: crossLinks20k,
    bridgeConfig: {
      butlerPantry: true,     // Full butler pantry + catering kitchen
      guestAutonomy: true,    // Multiple guest suites with full autonomy
      soundLock: true,        // Theater with dedicated sound lock
      wetFeetIntercept: true, // Complete wellness link zone
      opsCore: true           // Full staff quarters + ops hub
    },
    bubbleDiagramCode: bubbleDiagram20k,
    twoNodeDescription: twoNodeDescription20k
  },
  {
    id: "custom",
    name: "Custom",
    targetSF: 0,
    description: "Define your own program with basement options",
    available: true,
    spaces: [],
    adjacencyMatrix: [],
    nodes: [],
    crossLinks: [],
    bridgeConfig: {
      butlerPantry: false,
      guestAutonomy: false,
      soundLock: false,
      wetFeetIntercept: false,
      opsCore: false
    },
    bubbleDiagramCode: "",
    twoNodeDescription: "Custom program allows full flexibility including basement allocation"
  }
];

export function getPreset(id: string): ProgramPreset | undefined {
  return programPresets.find(p => p.id === id);
}
