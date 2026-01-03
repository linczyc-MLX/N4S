import type { ModuleDefinition } from "../shared/schema";

export const modulesData: ModuleDefinition[] = [
  {
    id: "module-01",
    number: 1,
    name: "Kitchen Rules Engine",
    shortName: "Kitchen",
    description: "Show vs BOH kitchen, flow, and bespoke credibility. Defines the relationship between presentation cooking and back-of-house operations.",
    primaryFocus: "Show vs BOH kitchen, flow, bespoke credibility",
    gateDeliverables: [
      "Kitchen ecosystem plan with guest/service arrows",
      "Scullery loop documentation",
      "Storage schedule",
      "Work-aisle red-flag check"
    ],
    checklistItems: [
      { id: "k1", name: "Principal-level show kitchen present", description: "Kitchen not hidden or basement-only" },
      { id: "k2", name: "Guest route avoids work aisle", description: "Guests can reach dining/terrace without crossing work zone" },
      { id: "k3", name: "Scullery/prep kitchen connected", description: "Back-of-house support kitchen adjacent" },
      { id: "k4", name: "Service entry separate", description: "Deliveries don't pass through FOH" },
      { id: "k5", name: "Storage schedule complete", description: "Dry, cold, equipment storage documented" }
    ]
  },
  {
    id: "module-02",
    number: 2,
    name: "Entertaining Spine",
    shortName: "Entertaining",
    description: "Arrival-to-terrace social axis and lane integrity. Manages the processional sequence from entry through social spaces to outdoor entertaining.",
    primaryFocus: "Arrival-to-terrace social axis + lane integrity",
    gateDeliverables: [
      "Procession diagram",
      "Lane overlay",
      "FOH program schedule",
      "Powder room placement logic"
    ],
    checklistItems: [
      { id: "e1", name: "Clear arrival sequence", description: "Entry creates sense of procession" },
      { id: "e2", name: "Great room terrace connection", description: "Seamless indoor-outdoor flow" },
      { id: "e3", name: "Dining positioned correctly", description: "Serves both formal and casual entertaining" },
      { id: "e4", name: "Powder room strategically placed", description: "Accessible but discrete from social zones" },
      { id: "e5", name: "Lane separation maintained", description: "Guest, family, and service lanes distinct" }
    ]
  },
  {
    id: "module-03",
    number: 3,
    name: "Primary Suite Ecosystem",
    shortName: "Primary Suite",
    description: "Privacy gradient and two-person functionality. Ensures the primary suite offers complete privacy with dual-person operation and service access without invasion.",
    primaryFocus: "Privacy gradient + two-person functionality",
    gateDeliverables: [
      "Privacy gradient diagram",
      "Daily loop documentation",
      "Acoustic adjacency check",
      "Service-without-invasion notes"
    ],
    checklistItems: [
      { id: "p1", name: "Privacy threshold defined", description: "Clear boundary between private and semi-private" },
      { id: "p2", name: "Two-person bath operation", description: "Both can prepare simultaneously" },
      { id: "p3", name: "His/hers closet separation", description: "Adequate storage for both" },
      { id: "p4", name: "Morning coffee route exists", description: "Can access kitchen/coffee without full dress" },
      { id: "p5", name: "Service access without suite entry", description: "Housekeeping doesn't cross bedroom" }
    ]
  },
  {
    id: "module-04",
    number: 4,
    name: "Guest Wing Logic",
    shortName: "Guest Wing",
    description: "Hotel-grade guest autonomy and multi-family resilience. Provides guests with independent operation while maintaining separation from family zones.",
    primaryFocus: "Hotel-grade guest autonomy + multi-family resilience",
    gateDeliverables: [
      "Suite mix schedule",
      "Autonomy node plan",
      "Guest/service overlay",
      "Buffer confirmation"
    ],
    checklistItems: [
      { id: "g1", name: "Guest suite mix defined", description: "Number and type of guest accommodations" },
      { id: "g2", name: "Autonomy node present", description: "Guests can operate independently" },
      { id: "g3", name: "Guest doesn't cross primary threshold", description: "Routes don't invade family zone" },
      { id: "g4", name: "Multi-family accommodation", description: "Can host extended family stays" },
      { id: "g5", name: "Buffer zones confirmed", description: "Adequate separation from primary suite" }
    ]
  },
  {
    id: "module-05",
    number: 5,
    name: "Media & Acoustic Control",
    shortName: "Media/Acoustic",
    description: "Zone 3 containment and late-night integrity. Manages high-noise activities like cinema and karaoke without disturbing sleeping zones.",
    primaryFocus: "Zone 3 containment + late-night integrity",
    gateDeliverables: [
      "Acoustic overlay diagram",
      "Sound lock concept",
      "Late-night circulation map",
      "AV/IT service notes"
    ],
    checklistItems: [
      { id: "m1", name: "Zone 3 functions isolated", description: "No shared walls with Zone 0 bedrooms" },
      { id: "m2", name: "Sound lock vestibule present", description: "Acoustic buffer at media room entry" },
      { id: "m3", name: "Late-night route defined", description: "Can use media without disturbing sleepers" },
      { id: "m4", name: "AV equipment access planned", description: "Service can access without crossing living" },
      { id: "m5", name: "Acoustic treatment noted", description: "Wall/ceiling construction requirements flagged" }
    ]
  },
  {
    id: "module-06",
    number: 6,
    name: "Service Spine",
    shortName: "Service",
    description: "Receiving, storage, laundry, refuse, and BOH separation. Creates complete back-of-house operations without contaminating front-of-house spaces.",
    primaryFocus: "Receiving, storage, laundry, refuse; BOH separation",
    gateDeliverables: [
      "Service lane plan",
      "Laundry pipeline documentation",
      "Housekeeping closet map",
      "Refuse egress confirmation"
    ],
    checklistItems: [
      { id: "s1", name: "Receiving dock/area defined", description: "Deliveries have dedicated entry" },
      { id: "s2", name: "Laundry positioned correctly", description: "Near bedrooms, accessible to staff" },
      { id: "s3", name: "Storage hierarchy complete", description: "Bulk, linen, equipment separated" },
      { id: "s4", name: "Refuse route clear", description: "Trash never crosses FOH" },
      { id: "s5", name: "Housekeeping closets distributed", description: "Supplies accessible across zones" }
    ]
  },
  {
    id: "module-07",
    number: 7,
    name: "Wellness Program",
    shortName: "Wellness",
    description: "Training/recovery loop with humidity and vibration control. Manages gym, spa, pool, and recovery facilities with proper environmental controls.",
    primaryFocus: "Training/recovery loop; humidity + vibration control",
    gateDeliverables: [
      "Wellness loop map",
      "Wet-feet intercept documentation",
      "MEP intent notes",
      "Buffer confirmation"
    ],
    checklistItems: [
      { id: "w1", name: "Training loop complete", description: "Gym flows to recovery spaces" },
      { id: "w2", name: "Wet-feet intercept present", description: "Pool/spa users don't track water" },
      { id: "w3", name: "Humidity zones isolated", description: "Steam/sauna don't affect adjacent" },
      { id: "w4", name: "Vibration considerations noted", description: "Gym equipment isolated from living" },
      { id: "w5", name: "Outdoor wellness connection", description: "Access to pool/terrace from wellness" }
    ]
  },
  {
    id: "module-08",
    number: 8,
    name: "Staff Layer",
    shortName: "Staff",
    description: "Staff ops core with security and driver logic. Provides staff operational base with appropriate visibility and event scale-up capability.",
    primaryFocus: "Staff ops core + security/driver logic",
    gateDeliverables: [
      "Staff/vendor overlay",
      "Ops core plan",
      "Security posture diagram",
      "Event scale-up staging (if applicable)"
    ],
    checklistItems: [
      { id: "st1", name: "Ops core location defined", description: "Staff base of operations positioned" },
      { id: "st2", name: "Staff circulation overlay", description: "Staff routes don't cross family zones" },
      { id: "st3", name: "Security sight lines confirmed", description: "Monitoring positions functional" },
      { id: "st4", name: "Vendor access controlled", description: "Service providers have clear routes" },
      { id: "st5", name: "Event staging possible", description: "Can scale up for large gatherings" }
    ]
  }
];

export type AdjacencyRelation = "required" | "recommended" | "allowed" | "discouraged" | "forbidden";

export interface AdjacencyCell {
  relation: AdjacencyRelation;
  note?: string;
}

export interface AdjacencyMatrixData {
  zones: string[];
  matrix: Record<string, Record<string, AdjacencyCell>>;
}

export const adjacencyMatrix: AdjacencyMatrixData = {
  zones: [
    "Foyer",
    "Great Room",
    "Dining",
    "Kitchen (Show)",
    "Kitchen (BOH)",
    "Primary Suite",
    "Primary Bath",
    "Guest Suite",
    "Guest Bath",
    "Media Room",
    "Home Office",
    "Gym/Wellness",
    "Pool/Spa",
    "Service Entry",
    "Laundry",
    "Staff Ops",
    "Garage"
  ],
  matrix: {
    "Foyer": {
      "Foyer": { relation: "allowed" },
      "Great Room": { relation: "required", note: "Direct procession" },
      "Dining": { relation: "recommended" },
      "Kitchen (Show)": { relation: "allowed" },
      "Kitchen (BOH)": { relation: "forbidden", note: "Service contamination" },
      "Primary Suite": { relation: "forbidden", note: "Privacy threshold" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "discouraged" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "allowed" },
      "Home Office": { relation: "recommended" },
      "Gym/Wellness": { relation: "allowed" },
      "Pool/Spa": { relation: "allowed" },
      "Service Entry": { relation: "forbidden", note: "FOH separation" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "allowed" }
    },
    "Great Room": {
      "Foyer": { relation: "required", note: "Direct procession" },
      "Great Room": { relation: "allowed" },
      "Dining": { relation: "required", note: "Entertaining flow" },
      "Kitchen (Show)": { relation: "required", note: "Chef visibility" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "discouraged", note: "Privacy gradient" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "allowed" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "recommended" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "allowed" },
      "Pool/Spa": { relation: "required", note: "Indoor-outdoor connection" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Dining": {
      "Foyer": { relation: "recommended" },
      "Great Room": { relation: "required", note: "Entertaining flow" },
      "Dining": { relation: "allowed" },
      "Kitchen (Show)": { relation: "required", note: "Service connection" },
      "Kitchen (BOH)": { relation: "recommended", note: "Butler pantry bridge" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "allowed" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "allowed" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "discouraged" },
      "Pool/Spa": { relation: "recommended", note: "Outdoor dining" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Kitchen (Show)": {
      "Foyer": { relation: "allowed" },
      "Great Room": { relation: "required", note: "Chef visibility" },
      "Dining": { relation: "required", note: "Service connection" },
      "Kitchen (Show)": { relation: "allowed" },
      "Kitchen (BOH)": { relation: "required", note: "Support connection" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "forbidden" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "discouraged" },
      "Home Office": { relation: "discouraged" },
      "Gym/Wellness": { relation: "forbidden" },
      "Pool/Spa": { relation: "allowed" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "discouraged" },
      "Garage": { relation: "forbidden" }
    },
    "Kitchen (BOH)": {
      "Foyer": { relation: "forbidden", note: "Service contamination" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "recommended", note: "Butler pantry bridge" },
      "Kitchen (Show)": { relation: "required", note: "Support connection" },
      "Kitchen (BOH)": { relation: "allowed" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "forbidden" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "forbidden" },
      "Gym/Wellness": { relation: "forbidden" },
      "Pool/Spa": { relation: "forbidden" },
      "Service Entry": { relation: "required", note: "Delivery access" },
      "Laundry": { relation: "recommended" },
      "Staff Ops": { relation: "recommended" },
      "Garage": { relation: "recommended", note: "Grocery unload" }
    },
    "Primary Suite": {
      "Foyer": { relation: "forbidden", note: "Privacy threshold" },
      "Great Room": { relation: "discouraged", note: "Privacy gradient" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "allowed" },
      "Primary Bath": { relation: "required" },
      "Guest Suite": { relation: "forbidden", note: "Privacy collision" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden", note: "Acoustic Zone 0/3 conflict" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "forbidden", note: "Acoustic/vibration" },
      "Pool/Spa": { relation: "discouraged" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "discouraged", note: "Noise concern" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Primary Bath": {
      "Foyer": { relation: "forbidden" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "required" },
      "Primary Bath": { relation: "allowed" },
      "Guest Suite": { relation: "forbidden" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "forbidden" },
      "Gym/Wellness": { relation: "allowed", note: "Morning routine" },
      "Pool/Spa": { relation: "discouraged" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Guest Suite": {
      "Foyer": { relation: "discouraged" },
      "Great Room": { relation: "allowed" },
      "Dining": { relation: "allowed" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "forbidden", note: "Privacy collision" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "allowed" },
      "Guest Bath": { relation: "required" },
      "Media Room": { relation: "discouraged", note: "Acoustic concern" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "discouraged" },
      "Pool/Spa": { relation: "allowed" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "discouraged" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Guest Bath": {
      "Foyer": { relation: "forbidden" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "required" },
      "Guest Bath": { relation: "allowed" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "forbidden" },
      "Gym/Wellness": { relation: "forbidden" },
      "Pool/Spa": { relation: "allowed" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Media Room": {
      "Foyer": { relation: "allowed" },
      "Great Room": { relation: "recommended" },
      "Dining": { relation: "allowed" },
      "Kitchen (Show)": { relation: "discouraged" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "forbidden", note: "Acoustic Zone 0/3 conflict" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "discouraged", note: "Acoustic concern" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "allowed" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "allowed" },
      "Pool/Spa": { relation: "allowed" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Home Office": {
      "Foyer": { relation: "recommended" },
      "Great Room": { relation: "allowed" },
      "Dining": { relation: "allowed" },
      "Kitchen (Show)": { relation: "discouraged" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "allowed" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "allowed" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "allowed" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "discouraged" },
      "Pool/Spa": { relation: "discouraged" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "allowed" }
    },
    "Gym/Wellness": {
      "Foyer": { relation: "allowed" },
      "Great Room": { relation: "allowed" },
      "Dining": { relation: "discouraged" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "forbidden", note: "Acoustic/vibration" },
      "Primary Bath": { relation: "allowed", note: "Morning routine" },
      "Guest Suite": { relation: "discouraged" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "allowed" },
      "Home Office": { relation: "discouraged" },
      "Gym/Wellness": { relation: "allowed" },
      "Pool/Spa": { relation: "required", note: "Wellness loop" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "allowed" },
      "Staff Ops": { relation: "forbidden" },
      "Garage": { relation: "forbidden" }
    },
    "Pool/Spa": {
      "Foyer": { relation: "allowed" },
      "Great Room": { relation: "required", note: "Indoor-outdoor connection" },
      "Dining": { relation: "recommended", note: "Outdoor dining" },
      "Kitchen (Show)": { relation: "allowed" },
      "Kitchen (BOH)": { relation: "forbidden" },
      "Primary Suite": { relation: "discouraged" },
      "Primary Bath": { relation: "discouraged" },
      "Guest Suite": { relation: "allowed" },
      "Guest Bath": { relation: "allowed" },
      "Media Room": { relation: "allowed" },
      "Home Office": { relation: "discouraged" },
      "Gym/Wellness": { relation: "required", note: "Wellness loop" },
      "Pool/Spa": { relation: "allowed" },
      "Service Entry": { relation: "forbidden" },
      "Laundry": { relation: "forbidden" },
      "Staff Ops": { relation: "discouraged" },
      "Garage": { relation: "forbidden" }
    },
    "Service Entry": {
      "Foyer": { relation: "forbidden", note: "FOH separation" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "required", note: "Delivery access" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "forbidden" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "forbidden" },
      "Gym/Wellness": { relation: "forbidden" },
      "Pool/Spa": { relation: "forbidden" },
      "Service Entry": { relation: "allowed" },
      "Laundry": { relation: "required" },
      "Staff Ops": { relation: "required" },
      "Garage": { relation: "required" }
    },
    "Laundry": {
      "Foyer": { relation: "forbidden" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "recommended" },
      "Primary Suite": { relation: "discouraged", note: "Noise concern" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "discouraged" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "forbidden" },
      "Gym/Wellness": { relation: "allowed" },
      "Pool/Spa": { relation: "forbidden" },
      "Service Entry": { relation: "required" },
      "Laundry": { relation: "allowed" },
      "Staff Ops": { relation: "recommended" },
      "Garage": { relation: "allowed" }
    },
    "Staff Ops": {
      "Foyer": { relation: "forbidden" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "discouraged" },
      "Kitchen (BOH)": { relation: "recommended" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "forbidden" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "forbidden" },
      "Gym/Wellness": { relation: "forbidden" },
      "Pool/Spa": { relation: "discouraged" },
      "Service Entry": { relation: "required" },
      "Laundry": { relation: "recommended" },
      "Staff Ops": { relation: "allowed" },
      "Garage": { relation: "recommended" }
    },
    "Garage": {
      "Foyer": { relation: "allowed" },
      "Great Room": { relation: "forbidden" },
      "Dining": { relation: "forbidden" },
      "Kitchen (Show)": { relation: "forbidden" },
      "Kitchen (BOH)": { relation: "recommended", note: "Grocery unload" },
      "Primary Suite": { relation: "forbidden" },
      "Primary Bath": { relation: "forbidden" },
      "Guest Suite": { relation: "forbidden" },
      "Guest Bath": { relation: "forbidden" },
      "Media Room": { relation: "forbidden" },
      "Home Office": { relation: "allowed" },
      "Gym/Wellness": { relation: "forbidden" },
      "Pool/Spa": { relation: "forbidden" },
      "Service Entry": { relation: "required" },
      "Laundry": { relation: "allowed" },
      "Staff Ops": { relation: "recommended" },
      "Garage": { relation: "allowed" }
    }
  }
};

export const getModuleById = (id: string): ModuleDefinition | undefined => {
  return modulesData.find(m => m.id === id);
};

export const getModuleByNumber = (num: number): ModuleDefinition | undefined => {
  return modulesData.find(m => m.number === num);
};
