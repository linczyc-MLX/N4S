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
  { fromSpaceCode: "FOY", toSpaceCode: "WLINK", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "GYM", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "SPA", relationship: "S" },
  { fromSpaceCode: "FOY", toSpaceCode: "TERR", relationship: "S" },
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
  { fromSpaceCode: "FR", toSpaceCode: "WLINK", relationship: "A" },
  { fromSpaceCode: "FR", toSpaceCode: "TERR", relationship: "A" },
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
  // WLINK relationships
  { fromSpaceCode: "WLINK", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "WLINK", toSpaceCode: "GYM", relationship: "A" },
  { fromSpaceCode: "WLINK", toSpaceCode: "SPA", relationship: "A" },
  // GYM relationships
  { fromSpaceCode: "GYM", toSpaceCode: "WLINK", relationship: "A" },
  { fromSpaceCode: "GYM", toSpaceCode: "SPA", relationship: "N" },
  // SPA relationships
  { fromSpaceCode: "SPA", toSpaceCode: "WLINK", relationship: "A" },
  { fromSpaceCode: "SPA", toSpaceCode: "GYM", relationship: "N" },
  { fromSpaceCode: "SPA", toSpaceCode: "POOL", relationship: "A" },
  // TERR relationships
  { fromSpaceCode: "TERR", toSpaceCode: "FR", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "POOL", relationship: "A" },
  { fromSpaceCode: "TERR", toSpaceCode: "GR", relationship: "N" },
  { fromSpaceCode: "TERR", toSpaceCode: "KIT", relationship: "N" },
  // Acoustic separations
  { fromSpaceCode: "MEDIA", toSpaceCode: "PRI", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST1", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST2", relationship: "S" },
  { fromSpaceCode: "MEDIA", toSpaceCode: "GUEST3", relationship: "S" }
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
