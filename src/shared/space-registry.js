/**
 * N4S Space Registry (JavaScript version)
 * 
 * Master definition of all zones, spaces, and codes used across KYC, FYI, MVP, and VMX.
 * This is the single source of truth for the entire N4S platform.
 * 
 * @version 1.1.0 - Added 5K tier support
 * @date 2026-01-10
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
    description: 'Primary bedroom, bath, closets, and private retreat'
  },
  {
    code: 'Z6_GST',
    name: 'Guest + Secondary',
    order: 60,
    description: 'Jr. Primary, guest suites, kids rooms, staff quarters'
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
  },
  {
    code: 'Z9_GH',
    name: 'Guest House',
    order: 90,
    description: 'Separate guest house structure with suites, living, kitchen',
    structure: 'guestHouse'
  },
  {
    code: 'Z10_PH',
    name: 'Pool House',
    order: 100,
    description: 'Separate pool house / wellness pavilion structure',
    structure: 'poolHouse'
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
    baseSF: { '5k': 200, '10k': 350, '15k': 420, '20k': 500 },
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
    baseSF: { '5k': 45, '10k': 60, '15k': 80, '20k': 100 },
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
    baseSF: { '5k': 120, '10k': 200, '15k': 280, '20k': 350 },
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
    baseSF: { '5k': 350, '10k': 500, '15k': 600, '20k': 750 },
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
    baseSF: { '5k': 180, '10k': 300, '15k': 400, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Seats 8-14 depending on tier'
  },
  {
    code: 'WINE',
    name: 'Wine Room',
    abbrev: 'Wine',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': 100, '15k': 150, '20k': 200 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '10k+',
    notes: 'Climate controlled; can move to basement. Not standard at 5K.'
  },
  {
    code: 'LIB',
    name: 'Library',
    abbrev: 'Library',
    zone: 'Z1_APB',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': 200, '15k': 280, '20k': 350 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '10k+',
    notes: 'Can double as quiet office. Not standard at 5K.'
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
    baseSF: { '5k': 300, '10k': 500, '15k': 650, '20k': 800 },
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
    baseSF: { '5k': 250, '10k': 350, '15k': 450, '20k': 550 },
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
    baseSF: { '5k': 80, '10k': 120, '15k': 180, '20k': 220 },
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
    baseSF: { '5k': 100, '10k': 180, '15k': 250, '20k': 320 },
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
    baseSF: { '5k': null, '10k': 150, '15k': 200, '20k': 280 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '10k+',
    notes: 'Service kitchen for formal dining. Not standard at 5K.'
  },
  {
    code: 'MEDIA',
    name: 'Media Room',
    abbrev: 'Media',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '5k': 180, '10k': 250, '15k': 350, '20k': 450 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Casual TV / movies; can move to basement. Optional at 5K.'
  },
  {
    code: 'PWD2',
    name: 'Powder Room 2',
    abbrev: 'Powder 2',
    zone: 'Z2_FAM',
    defaultLevel: 1,
    baseSF: { '5k': 45, '10k': 60, '15k': 60, '20k': 60 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Family zone powder room'
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
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 200 },
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
    baseSF: { '5k': null, '10k': null, '15k': 400, '20k': 550 },
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
    baseSF: { '5k': null, '10k': null, '15k': 400, '20k': 550 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Dedicated cinema; basement ideal for sound'
  },
  {
    code: 'MUS',
    name: 'Music Room',
    abbrev: 'Music',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 250, '20k': 300 },
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
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 300 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    notes: 'Creative workspace; needs natural light'
  },
  {
    code: 'PWD3',
    name: 'Powder Room 3',
    abbrev: 'Powder 3',
    zone: 'Z3_ENT',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 60, '20k': 60 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Entertainment zone powder room'
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
    baseSF: { '5k': 150, '10k': 250, '15k': 350, '20k': 450 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Requires daylight preferred. Small gym at 5K.'
  },
  {
    code: 'SPA',
    name: 'Spa Suite',
    abbrev: 'Spa',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': 180, '15k': 250, '20k': 350 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '10k+',
    notes: 'Sauna, steam, shower. Not standard at 5K.'
  },
  {
    code: 'MAS',
    name: 'Massage Room',
    abbrev: 'Massage',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 180 },
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
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 400 },
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
    baseSF: { '5k': 60, '10k': 100, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Equipment, changing, bath'
  },
  {
    code: 'PWD4',
    name: 'Powder Room 4',
    abbrev: 'Powder 4',
    zone: 'Z4_WEL',
    defaultLevel: 1,
    baseSF: { '5k': 45, '10k': 60, '15k': 60, '20k': 60 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Wellness zone powder room'
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
    baseSF: { '5k': 280, '10k': 350, '15k': 500, '20k': 650 },
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
    baseSF: { '5k': 180, '10k': 250, '15k': 350, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Double vanity, wet room'
  },
  {
    code: 'PRICL_HIS',
    name: 'His Walk-in Closet',
    abbrev: 'His Closet',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '5k': 80, '10k': 100, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Primary suite his dressing room',
    linkedTo: 'PRICL_HER' // Always paired
  },
  {
    code: 'PRICL_HER',
    name: 'Her Walk-in Closet',
    abbrev: 'Her Closet',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '5k': 80, '10k': 100, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Primary suite her dressing room',
    linkedTo: 'PRICL_HIS' // Always paired
  },
  {
    code: 'PRILNG',
    name: 'Primary Lounge',
    abbrev: 'Primary Lounge',
    zone: 'Z5_PRI',
    defaultLevel: 2,
    baseSF: { '5k': null, '10k': null, '15k': 200, '20k': 280 },
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
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 200 },
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
    baseSF: { '5k': 300, '10k': 400, '15k': 450, '20k': 500 },
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
    baseSF: { '5k': 280, '10k': 400, '15k': 450, '20k': 500 },
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
    baseSF: { '5k': 280, '10k': null, '15k': 450, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: 'core',
    notes: 'Available at 5K for high bedroom count, or 15K+'
  },
  {
    code: 'GST4',
    name: 'Guest Suite 4',
    abbrev: 'Guest 4',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+'
  },
  {
    code: 'JRPRI',
    name: 'Jr. Primary Bedroom',
    abbrev: 'Jr. Primary',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '5k': null, '10k': null, '15k': 400, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'First/best guest suite - VIP or adult children'
  },
  {
    code: 'JRPRIBATH',
    name: 'Jr. Primary Bath',
    abbrev: 'Jr. Primary Bath',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'En-suite for Jr. Primary'
  },
  {
    code: 'JRPRICL',
    name: 'Jr. Primary Walk-in',
    abbrev: 'Jr. Primary Closet',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '5k': null, '10k': null, '15k': 80, '20k': 100 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Single large walk-in for Jr. Primary'
  },
  {
    code: 'BNK',
    name: 'Bunk Room',
    abbrev: 'Bunk',
    zone: 'Z6_GST',
    defaultLevel: 2,
    baseSF: { '5k': null, '10k': null, '15k': 350, '20k': 400 },
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
    baseSF: { '5k': null, '10k': null, '15k': 300, '20k': 400 },
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
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 200 },
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
    baseSF: { '5k': null, '10k': null, '15k': 350, '20k': 400 },
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
    baseSF: { '5k': null, '10k': null, '15k': 350, '20k': 400 },
    basementEligible: true,
    outdoorSpace: false,
    tier: '15k+',
    notes: 'Live-in staff. Not standard at 5K.'
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
    baseSF: { '5k': 100, '10k': 150, '15k': 200, '20k': 280 },
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
    baseSF: { '5k': 100, '10k': 140, '15k': 180, '20k': 250 },
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
    baseSF: { '5k': null, '10k': null, '15k': 80, '20k': 120 },
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
    baseSF: { '5k': 180, '10k': 300, '15k': 400, '20k': 550 },
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
    baseSF: { '5k': 120, '10k': 200, '15k': 300, '20k': 400 },
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
    baseSF: { '5k': 450, '10k': 600, '15k': 900, '20k': 1200 },
    basementEligible: true,
    outdoorSpace: false,
    tier: 'core',
    notes: '2/3/4/6 car depending on tier'
  },
  {
    code: 'WRK',
    name: 'Workshop',
    abbrev: 'Workshop',
    zone: 'Z7_SVC',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 250 },
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
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 180 },
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
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 200 },
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
    baseSF: { '5k': 200, '10k': 300, '15k': 400, '20k': 500 },
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
    baseSF: { '5k': 500, '10k': 800, '15k': 1200, '20k': 1800 },
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
    baseSF: { '5k': 1000, '10k': 1500, '15k': 2000, '20k': 2800 },
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
    baseSF: { '5k': 100, '10k': 150, '15k': 250, '20k': 350 },
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
    baseSF: { '5k': 150, '10k': 200, '15k': 300, '20k': 400 },
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
    baseSF: { '5k': 150, '10k': 250, '15k': 350, '20k': 500 },
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
    baseSF: { '5k': null, '10k': null, '15k': 400, '20k': 600 },
    basementEligible: false,
    outdoorSpace: true,
    tier: '15k+',
    notes: 'Interior court; not in conditioned total'
  },
  {
    code: 'POOL_BATH',
    name: 'Pool Bathroom',
    abbrev: 'Pool Bath',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '5k': 60, '10k': 80, '15k': 80, '20k': 100 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Outdoor pool bathroom - separate from main house'
  },
  {
    code: 'DRV',
    name: 'Motor Court',
    abbrev: 'Motor Court',
    zone: 'Z8_OUT',
    defaultLevel: 1,
    baseSF: { '5k': 600, '10k': 1000, '15k': 1500, '20k': 2000 },
    basementEligible: false,
    outdoorSpace: true,
    tier: 'core',
    notes: 'Arrival drive; not in conditioned total'
  },

  // ---------------------------------------------------------------------------
  // Zone 9: Guest House (Z9_GH) - Separate Structure
  // ---------------------------------------------------------------------------
  {
    code: 'GH_GST1',
    name: 'Guest House Suite 1',
    abbrev: 'GH Suite 1',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 450, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'guestHouse',
    notes: 'Guest house bedroom with en-suite'
  },
  {
    code: 'GH_GST2',
    name: 'Guest House Suite 2',
    abbrev: 'GH Suite 2',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 450, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'guestHouse',
    notes: 'Guest house bedroom with en-suite'
  },
  {
    code: 'GH_GST3',
    name: 'Guest House Suite 3',
    abbrev: 'GH Suite 3',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': null, '20k': 500 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '20k+',
    structure: 'guestHouse',
    notes: 'Guest house bedroom with en-suite'
  },
  {
    code: 'GH_PWD',
    name: 'Guest House Powder',
    abbrev: 'GH Powder',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 50, '20k': 60 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'guestHouse',
    notes: 'Guest house powder room'
  },
  {
    code: 'GH_LIV',
    name: 'Guest House Living',
    abbrev: 'GH Living',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 350, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'guestHouse',
    notes: 'Guest house living room'
  },
  {
    code: 'GH_KIT',
    name: 'Guest House Kitchen',
    abbrev: 'GH Kitchen',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 200, '20k': 280 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'guestHouse',
    notes: 'Guest house kitchenette'
  },
  {
    code: 'GH_DIN',
    name: 'Guest House Dining',
    abbrev: 'GH Dining',
    zone: 'Z9_GH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'guestHouse',
    notes: 'Guest house dining area'
  },

  // ---------------------------------------------------------------------------
  // Zone 10: Pool House (Z10_PH) - Separate Structure
  // ---------------------------------------------------------------------------
  {
    code: 'PH_SHW',
    name: 'Pool House Shower',
    abbrev: 'PH Shower',
    zone: 'Z10_PH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 60, '20k': 80 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'poolHouse',
    notes: 'Outdoor shower facility'
  },
  {
    code: 'PH_CHG',
    name: 'Pool House Changing',
    abbrev: 'PH Changing',
    zone: 'Z10_PH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 100, '20k': 150 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'poolHouse',
    notes: 'Changing rooms'
  },
  {
    code: 'PH_BATH',
    name: 'Pool House Bath',
    abbrev: 'PH Bath',
    zone: 'Z10_PH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 60, '20k': 80 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'poolHouse',
    notes: 'Pool house bathroom'
  },
  {
    code: 'PH_ENT',
    name: 'Pool House Entertainment',
    abbrev: 'PH Entertainment',
    zone: 'Z10_PH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 300, '20k': 450 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'poolHouse',
    notes: 'Covered entertaining space'
  },
  {
    code: 'PH_KIT',
    name: 'Pool House Kitchen',
    abbrev: 'PH Kitchen',
    zone: 'Z10_PH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'poolHouse',
    notes: 'Pool house kitchenette'
  },
  {
    code: 'PH_DIN',
    name: 'Pool House Dining',
    abbrev: 'PH Dining',
    zone: 'Z10_PH',
    defaultLevel: 1,
    baseSF: { '5k': null, '10k': null, '15k': 150, '20k': 200 },
    basementEligible: false,
    outdoorSpace: false,
    tier: '15k+',
    structure: 'poolHouse',
    notes: 'Pool house dining area'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a space by its code
 */
export function getSpaceByCode(code) {
  return spaceRegistry.find(s => s.code === code);
}

/**
 * Get all spaces in a zone
 */
export function getSpacesInZone(zoneCode) {
  return spaceRegistry.filter(s => s.zone === zoneCode);
}

/**
 * Get zones in order
 */
export function getZonesInOrder() {
  return [...zones].sort((a, b) => a.order - b.order);
}

/**
 * Get all spaces available for a given tier
 * Updated to support 5K tier
 */
export function getSpacesForTier(tier) {
  return spaceRegistry.filter(s => {
    // Core spaces available at all tiers
    if (s.tier === 'core') return true;
    
    // 10k+ spaces available at 10k, 15k, 20k
    if (s.tier === '10k+' && (tier === '10k' || tier === '15k' || tier === '20k')) return true;
    
    // 15k+ spaces available at 15k and 20k
    if (s.tier === '15k+' && (tier === '15k' || tier === '20k')) return true;
    
    // 20k+ spaces only at 20k
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
 * Build available levels from KYC configuration
 */
export function buildAvailableLevels(levelsAbove = 1, levelsBelow = 0) {
  const levels = [];
  
  // Add levels above arrival (L2, L3, etc.)
  for (let i = levelsAbove; i > 0; i--) {
    const levelNum = i + 1;
    levels.push({
      value: levelNum,
      label: `L${levelNum}`,
      isAboveArrival: true
    });
  }
  
  // Add arrival level (L1)
  levels.push({
    value: 1,
    label: 'L1 (Arrival)',
    isArrival: true
  });
  
  // Add levels below arrival (L-1, L-2, etc.)
  for (let i = 1; i <= levelsBelow; i++) {
    levels.push({
      value: -i,
      label: `L-${i}`,
      isBelowArrival: true
    });
  }
  
  return levels;
}

/**
 * Get zones for a specific structure
 */
export function getZonesForStructure(structure = 'main') {
  if (structure === 'guestHouse') {
    return zones.filter(z => z.code === 'Z9_GH');
  }
  if (structure === 'poolHouse') {
    return zones.filter(z => z.code === 'Z10_PH');
  }
  // Main structure gets all zones except GH and PH
  return zones.filter(z => !z.structure);
}

/**
 * Get spaces for a specific structure
 */
export function getSpacesForStructure(structure = 'main') {
  if (structure === 'guestHouse') {
    return spaceRegistry.filter(s => s.structure === 'guestHouse');
  }
  if (structure === 'poolHouse') {
    return spaceRegistry.filter(s => s.structure === 'poolHouse');
  }
  // Main structure gets spaces without a structure property
  return spaceRegistry.filter(s => !s.structure);
}

/**
 * Get level label
 */
export function getLevelLabel(levelValue) {
  if (levelValue === 1) return 'L1 (Arrival)';
  if (levelValue > 0) return `L${levelValue}`;
  return `L${levelValue}`;
}

/**
 * Check if a space belongs to a separate structure
 */
export function isSecondaryStructureSpace(spaceCode) {
  const space = getSpaceByCode(spaceCode);
  return space?.structure === 'guestHouse' || space?.structure === 'poolHouse';
}

// =============================================================================
// CLOUDINARY IMAGE HELPERS
// =============================================================================

const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload';

/**
 * Cloudinary public ID mapping for uploaded space renders
 * Format: { 'CODE_SIZE': 'public_id' }
 * Cloudinary adds unique suffixes to filenames
 */
const spaceRenderIds = {
  // Zone 1: Arrival + Public (Z1_APB)
  'FOY_M': 'FOY_M_xatei3',
  'PWD_M': 'PWD_M_z1syjl',
  'OFF_M': 'OFF_M_uvx9ci',
  'GR_M': 'GR_M_u47amm',
  'DR_M': 'DR_M_aojuh0',
  'WINE_M': 'WINE_M_btnxlc',
  'LIB_M': 'LIB_M_jmwsay',
  
  // Zone 2: Family + Kitchen (Z2_FAM)
  'FR_M': 'FR_M_jk6ujp',
  'KIT_M': 'KIT_M_bskgph',
  'BKF_M': 'BKF_M_w9udgb',
  'SCUL_M': 'SCUL_M_qpdfeb',
  'CHEF_M': 'CHEF_M_moztip',
  'MEDIA_M': 'MEDIA_M_zhc5vf',
  'PWD2_M': 'PWD_M_z1syjl',  // Use same image as PWD for now

  // Zone 3: Entertainment (Z3_ENT)
  'BAR_M': 'BAR_M_iuexss',
  'GAME_M': 'GAME_M_vzu5lf',
  'THR_M': 'THR_M_bmf1vs',
  'MUS_M': 'MUS_M_a3ih8o',
  'ART_M': 'ART_M_bkopxz',
  'PWD3_M': 'PWD_M_z1syjl',  // Use same image as PWD for now

  // Zone 4: Wellness (Z4_WEL)
  'GYM_M': 'GYM_M_gvxtck',
  'SPA_M': 'SPA_M_xvpdst',
  'MAS_M': 'MAS_M_wehgk5',
  'PLH_M': 'PLH_M_wyyayn',
  'POOLSUP_M': 'POOLSUP_M_ihrxiz',
  'PWD4_M': 'PWD_M_z1syjl',  // Use same image as PWD for now

  // Zone 5: Primary Suite (Z5_PRI)
  'PRI_M': 'PRI_M_ka98yn',
  'PRIBATH_M': 'PRIBATH_M_hmsaqt',
  'PRICL_HIS_M': 'PRICL_M_s0wfmq',  // Reuse existing closet image
  'PRICL_HER_M': 'PRICL_M_s0wfmq',  // Reuse existing closet image
  'PRILNG_M': 'PRILNG_M_gfskim',
  'POF_M': 'POF_M_bgmist',
  
  // Zone 6: Guest + Secondary (Z6_GST)
  'JRPRI_M': 'VIP_M_nr242n',        // Reuse VIP image for Jr. Primary
  'JRPRIBATH_M': 'PRIBATH_M_hmsaqt', // Reuse bath image
  'JRPRICL_M': 'PRICL_M_s0wfmq',    // Reuse closet image
  'GST1_M': 'GST1_M_g7lhny',
  'GST2_M': 'GST2_M_wmagho',
  'GST3_M': 'GST3_M_yvbnl3',
  'GST4_M': 'GST4_M_s2zpd2',
  'BNK_M': 'BNK_M_tjjg7k',
  'PLY_M': 'PLY_M_bmf9kz',
  'HWK_M': 'HWK_M_guyo5i',
  'NNY_M': 'NNY_M_o7vr9y',
  'STF_M': 'STF_M_cjcliy',
  
  // Zone 7: Service + BOH (Z7_SVC)
  'MUD_M': 'MUD_M_ftf7l3',
  'LND_M': 'LND_M_xjlniy',
  'LN2_M': 'LN2_M_xn7rb9',
  'MEP_M': 'MEP_M_mutb57',
  'STR_M': 'STR_M_i22tsu',
  'GAR_M': 'GAR_M_piyvgz',
  'WRK_M': 'WRK_M_xmcshf',
  'SKT_M': 'SKT_M_gien1l',
  'SLG_M': 'SLG_M_znjt0g',
  'COR_M': 'COR_M_tugeyb',
  
  // Zone 8: Outdoor Spaces (Z8_OUT)
  'TERR_M': 'TERR_M_gtjpaj',
  'POOL_M': 'POOL_M_jda5qd',
  'OKT_M': 'OKT_M_mitdyw',
  'FPT_M': 'FPT_M_ilx6g1',
  'ODN_M': 'ODN_M_juflbh',
  'CTY_M': 'CTY_M_pg9ila',
  'POOL_BATH_M': 'PWD_M_z1syjl',  // Placeholder until proper outdoor bath image
  'DRV_M': 'DRV_M_yzmztf',
};

/**
 * Get space render image URL
 * Returns mapped Cloudinary URL if available, otherwise returns null
 */
export function getSpaceRenderUrl(code, size = 'M') {
  const key = `${code}_${size}`;
  const publicId = spaceRenderIds[key];
  
  if (publicId) {
    return `${CLOUDINARY_BASE}/${publicId}.png`;
  }
  
  // Fallback: try M size if S or L requested but not available
  if (size !== 'M') {
    const fallbackId = spaceRenderIds[`${code}_M`];
    if (fallbackId) {
      return `${CLOUDINARY_BASE}/${fallbackId}.png`;
    }
  }
  
  // No image available
  return null;
}

/**
 * Check if a space has a render image available
 */
export function hasSpaceRenderImage(code, size = 'M') {
  return !!spaceRenderIds[`${code}_${size}`] || !!spaceRenderIds[`${code}_M`];
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
  'primary-bedroom-suite': 'PRI',
  'jr-primary-suite': 'JRPRI',
  'secondary-suites': 'GST1',
  'guest-suite': 'GST1',
  'kids-bedrooms': 'BNK',
  'kids-bunk-room': 'BNK',
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
  'art-studio': 'ART',
  'music-room': 'MUS',
  'safe-room': 'STR',
  'theater': 'THR',
  'billiards': 'GAME',
  'bar': 'BAR',
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
  '5k': { min: 0.11, max: 0.14, default: 0.12 },
  '10k': { min: 0.12, max: 0.15, default: 0.13 },
  '15k': { min: 0.13, max: 0.16, default: 0.14 },
  '20k': { min: 0.14, max: 0.18, default: 0.15 }
};

/**
 * Calculate circulation SF
 */
export function calculateCirculation(netSF, targetSF, lockToTarget, circulationPct, tier) {
  // Handle missing tier gracefully
  const tierDefaults = circulationDefaults[tier] || circulationDefaults['10k'];
  
  if (lockToTarget) {
    // Balance to target, clamped
    const targetCirc = targetSF - netSF;
    const minCirc = Math.round(netSF * tierDefaults.min);
    const maxCirc = Math.round(netSF * tierDefaults.max);
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
  'JRPRI',   // Jr. Primary Suite
  'GST1',    // Guest Suite 1
  'GYM',     // Gym
  'TERR'     // Terrace
];

// =============================================================================
// BEDROOM CONFIGURATION HELPERS
// =============================================================================

/**
 * Bedroom types in order of hierarchy
 */
export const bedroomTypes = [
  { code: 'PRI', name: 'Primary Bedroom Suite', closets: ['PRICL_HIS', 'PRICL_HER'], bath: 'PRIBATH' },
  { code: 'JRPRI', name: 'Jr. Primary Suite', closets: ['JRPRICL'], bath: 'JRPRIBATH' },
  { code: 'GST1', name: 'Guest Suite 1', bath: 'GST1_BATH' },
  { code: 'GST2', name: 'Guest Suite 2', bath: 'GST2_BATH' },
  { code: 'GST3', name: 'Guest Suite 3', bath: 'GST3_BATH' },
  { code: 'GST4', name: 'Guest Suite 4', bath: 'GST4_BATH' },
  { code: 'BNK', name: "Kid's Bunk Room", bath: 'BNK_BATH' },
];

/**
 * Get bedroom configuration including closets
 * @param {string} bedroomCode - The bedroom code (PRI, JRPRI, GST1, etc.)
 * @param {string} closetType - 'walk-in' | 'standard' (for guest suites)
 */
export function getBedroomComponents(bedroomCode, closetType = 'walk-in') {
  const config = bedroomTypes.find(b => b.code === bedroomCode);
  if (!config) return null;
  
  const components = [bedroomCode];
  
  // Add bath if defined
  if (config.bath) {
    components.push(config.bath);
  }
  
  // Add closets based on type and bedroom
  if (config.closets) {
    // Primary and Jr. Primary always have walk-in(s)
    components.push(...config.closets);
  } else if (bedroomCode.startsWith('GST')) {
    // Guest suites depend on closetType setting
    if (closetType === 'walk-in') {
      components.push(`${bedroomCode}_WIC`);
    }
    // Standard closets don't add separate SF - built into suite
  }
  
  return components;
}

// =============================================================================
// TIER DETERMINATION (Internal algorithm - not exposed to users)
// =============================================================================

/**
 * Determine internal tier from target SF
 * This is used for algorithm purposes only - users don't see tier labels
 * 
 * @param {number} targetSF - Target square footage
 * @returns {string} - Internal tier identifier ('5k', '10k', '15k', '20k')
 */
export function determineTierFromSF(targetSF) {
  if (targetSF < 7500) return '5k';
  if (targetSF < 12500) return '10k';
  if (targetSF < 17500) return '15k';
  return '20k';
}

/**
 * Get default bedroom count for a tier (as starting point only)
 * Client can adjust freely from this starting point
 * 
 * @param {string} tier - Internal tier identifier
 * @returns {number} - Default bedroom count
 */
export function getDefaultBedroomCount(tier) {
  const defaults = {
    '5k': 4,   // Minimum for UHNW clients
    '10k': 5,
    '15k': 6,
    '20k': 7
  };
  return defaults[tier] || 5;
}
