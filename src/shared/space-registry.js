/**
 * N4S Space Registry (JavaScript version)
 * 
 * Master definition of all zones, spaces, and codes used across KYC, FYI, MVP, and VMX.
 * This is the single source of truth for the entire N4S platform.
 * 
 * @version 1.0.0
 * @date 2026-01-04
 */

// =============================================================================
// ZONE DEFINITIONS
// =============================================================================

export const zones = [
  {
    code: 'Z1_APB',
    name: 'Arrival + Public',
    order: 10,
    description: 'Entry, formal entertaining, office, and public-facing spaces'
  },
  {
    code: 'Z2_FAM',
    name: 'Family + Kitchen',
    order: 20,
    description: 'Daily living hub, kitchen, breakfast, and casual family spaces'
  },
  {
    code: 'Z3_ENT',
    name: 'Entertainment',
    order: 30,
    description: 'Game room, theater, bar, billiards, and recreational spaces'
  },
  {
    code: 'Z4_WEL',
    name: 'Wellness',
    order: 40,
    description: 'Gym, spa, pool support, and health-focused spaces'
  },
  {
    code: 'Z5_PRI',
    name: 'Primary Suite',
    order: 50,
    description: 'Master bedroom, bath, closets, and private retreat'
  },
  {
    code: 'Z6_GST',
    name: 'Guest + Secondary',
    order: 60,
    description: 'Guest suites, kids rooms, staff quarters, and secondary bedrooms'
  },
  {
    code: 'Z7_SVC',
    name: 'Service + BOH',
    order: 70,
    description: 'Laundry, mudroom, mechanical, storage, and back-of-house'
  },
  {
    code: 'Z8_OUT',
    name: 'Outdoor Spaces',
    order: 80,
    description: 'Terrace, pool, outdoor kitchen, and exterior living (not conditioned)'
  }
];

// =============================================================================
// SPACE DEFINITIONS
// =============================================================================

export const spaceRegistry = [
  // ---------------------------------------------------------------------------
  // Zone 1: Arrival + Public (Z1_APB)
  // ---------------------------------------------------------------------------
  {
    code: 'FOY',
    name: 'Foyer / Gallery',
    abbrev: 'Foyer',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 350, '15k': 420, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Includes coat closet allowance'
  },
  {
    code: 'PWD',
    name: 'Powder Room',
    abbrev: 'Powder',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 60, '15k': 80, '20k': 100 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core'
  },
  {
    code: 'OFF',
    name: 'Private Office',
    abbrev: 'Office',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 200, '15k': 280, '20k': 350 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Home office / study'
  },
  {
    code: 'GR',
    name: 'Great Room',
    abbrev: 'Great Room',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 500, '15k': 600, '20k': 750 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Formal living / showcase room'
  },
  {
    code: 'DR',
    name: 'Formal Dining',
    abbrev: 'Dining',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 300, '15k': 400, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Seats 10-14'
  },
  {
    code: 'WINE',
    name: 'Wine Room',
    abbrev: 'Wine',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 100, '15k': 150, '20k': 200 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Climate controlled; can move to basement'
  },
  {
    code: 'SAL',
    name: 'Salon',
    abbrev: 'Salon',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 350, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Secondary formal sitting room'
  },
  {
    code: 'LIB',
    name: 'Library',
    abbrev: 'Library',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '10k': 200, '15k': 280, '20k': 350 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Can double as quiet office'
  },

  // ---------------------------------------------------------------------------
  // Zone 2: Family + Kitchen (Z2_FAM)
  // ---------------------------------------------------------------------------
  {
    code: 'FR',
    name: 'Family Room',
    abbrev: 'Family',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': 500, '15k': 650, '20k': 800 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Daily living hub'
  },
  {
    code: 'KIT',
    name: 'Kitchen (Show)',
    abbrev: 'Kitchen',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': 350, '15k': 450, '20k': 550 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Island-centric, open to family'
  },
  {
    code: 'BKF',
    name: 'Breakfast Nook',
    abbrev: 'Breakfast',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': 120, '15k': 180, '20k': 220 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Casual daily meals'
  },
  {
    code: 'SCUL',
    name: 'Scullery / Pantry',
    abbrev: 'Scullery',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': 180, '15k': 250, '20k': 320 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Prep, cleanup, storage'
  },
  {
    code: 'CHEF',
    name: "Chef's Kitchen",
    abbrev: "Chef's",
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': 150, '15k': 200, '20k': 280 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Service kitchen for formal dining'
  },
  {
    code: 'MEDIA',
    name: 'Media Room',
    abbrev: 'Media',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': 250, '15k': 350, '20k': 450 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Casual TV / movies; can move to basement'
  },
  {
    code: 'NKF',
    name: 'Nook / Flex',
    abbrev: 'Nook',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Homework, reading area'
  },

  // ---------------------------------------------------------------------------
  // Zone 3: Entertainment (Z3_ENT)
  // ---------------------------------------------------------------------------
  {
    code: 'BAR',
    name: 'Bar',
    abbrev: 'Bar',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 150, '20k': 200 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Built-in bar'
  },
  {
    code: 'GAME',
    name: 'Game Room',
    abbrev: 'Game',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 400, '20k': 550 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Cards, games, lounge'
  },
  {
    code: 'THR',
    name: 'Theater',
    abbrev: 'Theater',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 400, '20k': 550 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Dedicated cinema; basement ideal for sound'
  },
  {
    code: 'BIL',
    name: 'Billiards',
    abbrev: 'Billiards',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 280, '20k': 350 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Pool table room'
  },
  {
    code: 'MUS',
    name: 'Music Room',
    abbrev: 'Music',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 250, '20k': 300 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Piano, instruments'
  },
  {
    code: 'ART',
    name: 'Art Studio',
    abbrev: 'Art',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': null, '20k': 300 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Creative workspace; needs natural light'
  },

  // ---------------------------------------------------------------------------
  // Zone 4: Wellness (Z4_WEL)
  // ---------------------------------------------------------------------------
  {
    code: 'GYM',
    name: 'Fitness / Gym',
    abbrev: 'Gym',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '10k': 250, '15k': 350, '20k': 450 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Requires daylight preferred'
  },
  {
    code: 'SPA',
    name: 'Spa Suite',
    abbrev: 'Spa',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '10k': 180, '15k': 250, '20k': 350 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Sauna, steam, shower'
  },
  {
    code: 'MAS',
    name: 'Massage Room',
    abbrev: 'Massage',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 150, '20k': 180 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Treatment room'
  },
  {
    code: 'PLH',
    name: 'Pool House',
    abbrev: 'Pool House',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': null, '20k': 400 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Separate structure'
  },
  {
    code: 'POOLSUP',
    name: 'Pool Support',
    abbrev: 'Pool Sup',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '10k': 100, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Equipment, changing, bath'
  },

  // ---------------------------------------------------------------------------
  // Zone 5: Primary Suite (Z5_PRI)
  // ---------------------------------------------------------------------------
  {
    code: 'PRI',
    name: 'Primary Bedroom',
    abbrev: 'Primary Bed',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '10k': 350, '15k': 500, '20k': 650 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Master bedroom'
  },
  {
    code: 'PRIBATH',
    name: 'Primary Bath',
    abbrev: 'Primary Bath',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '10k': 250, '15k': 350, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Double vanity, wet room'
  },
  {
    code: 'PRICL',
    name: 'Primary Closets',
    abbrev: 'Primary Closet',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '10k': 200, '15k': 300, '20k': 400 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'His/hers dressing'
  },
  {
    code: 'PRILNG',
    name: 'Primary Lounge',
    abbrev: 'Primary Lounge',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 200, '20k': 280 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Sitting room'
  },
  {
    code: 'POF',
    name: 'Primary Office',
    abbrev: 'Primary Office',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': null, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Private study within suite'
  },

  // ---------------------------------------------------------------------------
  // Zone 6: Guest + Secondary (Z6_GST)
  // ---------------------------------------------------------------------------
  {
    code: 'GST1',
    name: 'Guest Suite 1',
    abbrev: 'Guest 1',
    zone: 'Z6_GST',
    defaultLevel: 1,
    baseSF: { '10k': 400, '15k': 450, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Ground floor for accessibility'
  },
  {
    code: 'GST2',
    name: 'Guest Suite 2',
    abbrev: 'Guest 2',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': 400, '15k': 450, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core'
  },
  {
    code: 'GST3',
    name: 'Guest Suite 3',
    abbrev: 'Guest 3',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 450, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+'
  },
  {
    code: 'GST4',
    name: 'Guest Suite 4',
    abbrev: 'Guest 4',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': null, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+'
  },
  {
    code: 'VIP',
    name: 'VIP Suite',
    abbrev: 'VIP',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 600, '20k': 700 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Enhanced guest suite'
  },
  {
    code: 'KID1',
    name: 'Kids Bedroom 1',
    abbrev: 'Kids 1',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': 350, '15k': 400, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: "Children's room"
  },
  {
    code: 'KID2',
    name: 'Kids Bedroom 2',
    abbrev: 'Kids 2',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': 350, '15k': 400, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: "Children's room"
  },
  {
    code: 'BNK',
    name: 'Bunk Room',
    abbrev: 'Bunk',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 350, '20k': 400 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Sleeps 4-6'
  },
  {
    code: 'PLY',
    name: 'Playroom',
    abbrev: 'Playroom',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 300, '20k': 400 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Kids activity room'
  },
  {
    code: 'HWK',
    name: 'Homework Loft',
    abbrev: 'Homework',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': null, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Study area'
  },
  {
    code: 'NNY',
    name: 'Nanny Suite',
    abbrev: 'Nanny',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 350, '20k': 400 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Childcare staff'
  },
  {
    code: 'STF',
    name: 'Staff Suite',
    abbrev: 'Staff',
    zone: 'Z6_GST',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 350, '20k': 400 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Live-in staff'
  },

  // ---------------------------------------------------------------------------
  // Zone 7: Service + BOH (Z7_SVC)
  // ---------------------------------------------------------------------------
  {
    code: 'MUD',
    name: 'Mudroom',
    abbrev: 'Mudroom',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': 150, '15k': 200, '20k': 280 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Daily entry, dog wash'
  },
  {
    code: 'LND',
    name: 'Laundry',
    abbrev: 'Laundry',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': 140, '15k': 180, '20k': 250 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Primary laundry'
  },
  {
    code: 'LN2',
    name: 'Laundry 2',
    abbrev: 'Laundry 2',
    zone: 'Z7_SVC',
    defaultLevel: 2,
    baseSF: { '10k': null, '15k': 80, '20k': 120 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Upper floor laundry'
  },
  {
    code: 'MEP',
    name: 'Mechanical / IT',
    abbrev: 'Mechanical',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': 300, '15k': 400, '20k': 550 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'HVAC, electrical, IT closet'
  },
  {
    code: 'STR',
    name: 'Storage',
    abbrev: 'Storage',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': 200, '15k': 300, '20k': 400 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'General storage'
  },
  {
    code: 'GAR',
    name: 'Garage',
    abbrev: 'Garage',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': 600, '15k': 900, '20k': 1200 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: '3/4/6 car'
  },
  {
    code: 'WRK',
    name: 'Workshop',
    abbrev: 'Workshop',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 150, '20k': 250 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Hobby/tools'
  },
  {
    code: 'SKT',
    name: 'Staff Kitchen',
    abbrev: 'Staff Kitchen',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': null, '20k': 180 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Staff break area'
  },
  {
    code: 'SLG',
    name: 'Staff Lounge',
    abbrev: 'Staff Lounge',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': null, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Staff rest area'
  },
  {
    code: 'COR',
    name: 'Stair / Elevator Core',
    abbrev: 'Core',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '10k': 300, '15k': 400, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Vertical circulation; spans all levels'
  },

  // ---------------------------------------------------------------------------
  // Zone 8: Outdoor Spaces (Z8_OUT) - NOT included in conditioned SF
  // ---------------------------------------------------------------------------
  {
    code: 'TERR',
    name: 'Main Terrace',
    abbrev: 'Terrace',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': 800, '15k': 1200, '20k': 1800 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Outdoor living; not in conditioned total'
  },
  {
    code: 'POOL',
    name: 'Pool + Deck',
    abbrev: 'Pool',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': 1500, '15k': 2000, '20k': 2800 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Lap pool + surround; not in conditioned total'
  },
  {
    code: 'OKT',
    name: 'Outdoor Kitchen',
    abbrev: 'Out Kitchen',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': 150, '15k': 250, '20k': 350 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Summer kitchen; not in conditioned total'
  },
  {
    code: 'FPT',
    name: 'Fire Pit Area',
    abbrev: 'Fire Pit',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': 200, '15k': 300, '20k': 400 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Gathering area; not in conditioned total'
  },
  {
    code: 'ODN',
    name: 'Outdoor Dining',
    abbrev: 'Out Dining',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': 250, '15k': 350, '20k': 500 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Al fresco dining; not in conditioned total'
  },
  {
    code: 'CTY',
    name: 'Courtyard',
    abbrev: 'Courtyard',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': null, '15k': 400, '20k': 600 },
    basementEligible: false,
    outdoorSpace: true,
    tier: '15k+',
    notes: 'Interior court; not in conditioned total'
  },
  {
    code: 'DRV',
    name: 'Motor Court',
    abbrev: 'Motor Court',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '10k': 1000, '15k': 1500, '20k': 2000 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Arrival drive; not in conditioned total'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a space definition by code
 */
export function getSpaceByCode(code) {
  return spaceRegistry.find(s => s.code === code);
}

/**
 * Get all spaces for a specific zone
 */
export function getSpacesByZone(zoneCode) {
  return spaceRegistry.filter(s => s.zone === zoneCode);
}

/**
 * Get all spaces available for a given tier
 */
export function getSpacesForTier(tier) {
  return spaceRegistry.filter(s => {
    if (s.tier === 'core') return true;
    if (s.tier === '15k+' && (tier === '15k' || tier === '20k')) return true;
    if (s.tier === '20k+' && tier === '20k') return true;
    return false;
  });
}

/**
 * Get conditioned spaces only (excludes outdoor)
 */
export function getConditionedSpaces() {
  return spaceRegistry.filter(s => !s.outdoorSpace);
}

/**
 * Get basement-eligible spaces
 */
export function getBasementEligibleSpaces() {
  return spaceRegistry.filter(s => s.basementEligible);
}

/**
 * Calculate area for a space based on size selection
 */
export function calculateSpaceArea(space, tier, size, deltaPct = 10) {
  const baseArea = space.baseSF[tier];
  if (baseArea === null) return 0;
  
  const delta = deltaPct / 100;
  switch (size) {
    case 'S': return Math.round(baseArea * (1 - delta));
    case 'L': return Math.round(baseArea * (1 + delta));
    default: return baseArea;
  }
}

/**
 * Get zone by code
 */
export function getZoneByCode(code) {
  return zones.find(z => z.code === code);
}

/**
 * Get zones in order
 */
export function getZonesInOrder() {
  return [...zones].sort((a, b) => a.order - b.order);
}

// =============================================================================
// CLOUDINARY IMAGE HELPERS
// =============================================================================

const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload';

/**
 * Get space render image URL
 */
export function getSpaceRenderUrl(code, size = 'M') {
  return `${CLOUDINARY_BASE}/N4S/space-renders/${code}_${size}.jpg`;
}

/**
 * Get floor plan SVG URL
 */
export function getFloorPlanUrl(code) {
  return `${CLOUDINARY_BASE}/N4S/floor-plans/${code}_plan.svg`;
}

/**
 * Get zone cover image URL
 */
export function getZoneCoverUrl(zoneCode) {
  return `${CLOUDINARY_BASE}/N4S/zone-covers/${zoneCode}_cover.jpg`;
}

// =============================================================================
// LEGACY MAPPING (for KYC chip value migration)
// =============================================================================

export const legacyToCodeMap = {
  // Interior spaces from KYC SpaceRequirementsSection
  'primary-suite': 'PRI',
  'secondary-suites': 'GST1',
  'kids-bedrooms': 'KID1',
  'great-room': 'GR',
  'formal-living': 'GR',
  'family-room': 'FR',
  'formal-dining': 'DR',
  'casual-dining': 'BKF',
  'chef-kitchen': 'KIT',
  'catering-kitchen': 'CHEF',
  'home-office': 'OFF',
  'library': 'LIB',
  'media-room': 'MEDIA',
  'game-room': 'GAME',
  'wine-cellar': 'WINE',
  'gym': 'GYM',
  'spa-wellness': 'SPA',
  'pool-indoor': 'POOLSUP',
  'sauna': 'SPA',
  'steam-room': 'SPA',
  'staff-quarters': 'STF',
  'mudroom': 'MUD',
  'laundry': 'LND',
  'art-gallery': 'FOY',
  'music-room': 'MUS',
  'safe-room': 'STR',
};

/**
 * Convert legacy KYC chip value to space code
 */
export function legacyToCode(legacyValue) {
  return legacyToCodeMap[legacyValue];
}

// =============================================================================
// CIRCULATION DEFAULTS
// =============================================================================

export const circulationDefaults = {
  '10k': { min: 0.12, max: 0.15, default: 0.13 },
  '15k': { min: 0.13, max: 0.16, default: 0.14 },
  '20k': { min: 0.14, max: 0.18, default: 0.15 }
};

/**
 * Calculate circulation SF
 */
export function calculateCirculation(netSF, targetSF, lockToTarget, circulationPct, tier) {
  if (lockToTarget) {
    // Balance to target, clamped
    const targetCirc = targetSF - netSF;
    const minCirc = Math.round(netSF * circulationDefaults[tier].min);
    const maxCirc = Math.round(netSF * circulationDefaults[tier].max);
    return Math.max(minCirc, Math.min(maxCirc, targetCirc));
  } else {
    // Fixed percentage
    return Math.round(netSF * circulationPct);
  }
}

// =============================================================================
// PRIORITY SPACES FOR IMAGES
// =============================================================================

export const prioritySpacesForImages = [
  'FOY',     // Foyer
  'GR',      // Great Room
  'DR',      // Formal Dining
  'FR',      // Family Room
  'KIT',     // Kitchen
  'PRI',     // Primary Bedroom
  'PRIBATH', // Primary Bath
  'GST1',    // Guest Suite 1
  'GYM',     // Gym
  'TERR'     // Terrace
];
