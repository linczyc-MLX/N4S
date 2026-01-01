// Taste Exploration Quad Library
// All images hosted on Cloudinary at:
// https://res.cloudinary.com/drhp5e0kl/image/upload/v1766864130/Taste-Exploration/{folder}/{filename}.png

const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1766864130/Taste-Exploration';
const img = (folder, filename) => `${CLOUDINARY_BASE}/${folder}/${filename}`;

// Category definitions
export const categories = {
  living_spaces: {
    code: 'LS',
    name: 'Living Spaces',
    description: 'Main living rooms, great rooms, salons, and formal sitting areas',
    icon: '🛋️',
    color: '#1A365D'
  },
  dining_spaces: {
    code: 'DS',
    name: 'Dining Spaces',
    description: 'Formal dining, breakfast areas, and casual eating spaces',
    icon: '🍽️',
    color: '#805AD5'
  },
  kitchens: {
    code: 'KT',
    name: 'Kitchens',
    description: 'Chef\'s kitchens, family kitchens, and culinary spaces',
    icon: '👨‍🍳',
    color: '#C9A962'
  },
  primary_bedrooms: {
    code: 'PB',
    name: 'Primary Bedrooms',
    description: 'Master suites and primary sleeping quarters',
    icon: '🛏️',
    color: '#9F7AEA'
  },
  primary_bathrooms: {
    code: 'PBT',
    name: 'Primary Bathrooms',
    description: 'Master baths and spa-like retreats',
    icon: '🛁',
    color: '#38B2AC'
  },
  guest_bedrooms: {
    code: 'GB',
    name: 'Guest Bedrooms',
    description: 'Guest suites and secondary sleeping quarters',
    icon: '🛏️',
    color: '#667EEA'
  },
  family_areas: {
    code: 'FA',
    name: 'Family Areas',
    description: 'Casual family rooms, media rooms, and recreational spaces',
    icon: '👨‍👩‍👧‍👦',
    color: '#ED8936'
  },
  exterior_architecture: {
    code: 'EA',
    name: 'Exterior Architecture',
    description: 'Facades, entries, and overall architectural presence',
    icon: '🏛️',
    color: '#319795'
  },
  outdoor_living: {
    code: 'OL',
    name: 'Outdoor Living',
    description: 'Pools, terraces, gardens, and exterior entertainment',
    icon: '🌳',
    color: '#48BB78'
  }
};

// Category order for the exploration flow
export const categoryOrder = [
  'living_spaces',
  'dining_spaces',
  'kitchens',
  'primary_bedrooms',
  'primary_bathrooms',
  'guest_bedrooms',
  'family_areas',
  'exterior_architecture',
  'outdoor_living'
];

// Attribute values derived from AS (Architectural Style) codes in filenames
// AS1=Avant-Contemporary, AS3=Curated Minimal, AS6=Modern Classic, AS9=Heritage Estate
const getAttributes = (as0, as1, as2, as3) => {
  const AS_MAP = {
    AS1: { warmth: 4, formality: 6, drama: 10, tradition: 1 },
    AS3: { warmth: 7, formality: 7, drama: 4, tradition: 4 },
    AS6: { warmth: 6, formality: 7, drama: 5, tradition: 7 },
    AS9: { warmth: 8, formality: 9, drama: 7, tradition: 10 }
  };
  const styles = [as0, as1, as2, as3].map(as => AS_MAP[as] || AS_MAP.AS6);
  return {
    warmth: styles.map(s => s.warmth),
    formality: styles.map(s => s.formality),
    drama: styles.map(s => s.drama),
    tradition: styles.map(s => s.tradition)
  };
};

// ============================================================
// QUAD DEFINITIONS - All images from Cloudinary
// ============================================================
export const quads = [
  // ============================================================
  // LIVING SPACES (LS) - 4 quads
  // ============================================================
  {
    quadId: 'LS-001',
    category: 'living_spaces',
    images: [
      img('LS', 'LS-001_0_AS1_VD1_MP1.png'),
      img('LS', 'LS-001_1_AS3_VD3_MP1.png'),
      img('LS', 'LS-001_2_AS6_VD6_MP1.png'),
      img('LS', 'LS-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'LS-002',
    category: 'living_spaces',
    images: [
      img('LS', 'LS-002_0_AS3_VD3_MP6.png'),
      img('LS', 'LS-002_1_AS6_VD6_MP6.png'),
      img('LS', 'LS-002_2_AS9_VD9_MP6.png'),
      img('LS', 'LS-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'LS-003',
    category: 'living_spaces',
    images: [
      img('LS', 'LS-003_0_AS9_VD9_MP1.png'),
      img('LS', 'LS-003_1_AS1_VD1_MP3.png'),
      img('LS', 'LS-003_2_AS3_VD3_MP3.png'),
      img('LS', 'LS-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'LS-004',
    category: 'living_spaces',
    images: [
      img('LS', 'LS-004_0_AS1_VD1_MP9.png'),
      img('LS', 'LS-004_1_AS3_VD3_MP9.png'),
      img('LS', 'LS-004_2_AS6_VD6_MP9.png'),
      img('LS', 'LS-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // DINING SPACES (DS) - 4 quads
  // ============================================================
  {
    quadId: 'DS-001',
    category: 'dining_spaces',
    images: [
      img('DS', 'DS-001_0_AS1_VD1_MP1.png'),
      img('DS', 'DS-001_1_AS3_VD3_MP1.png'),
      img('DS', 'DS-001_2_AS6_VD6_MP1.png'),
      img('DS', 'DS-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'DS-002',
    category: 'dining_spaces',
    images: [
      img('DS', 'DS-002_0_AS3_VD3_MP6.png'),
      img('DS', 'DS-002_1_AS6_VD6_MP6.png'),
      img('DS', 'DS-002_2_AS9_VD9_MP6.png'),
      img('DS', 'DS-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'DS-003',
    category: 'dining_spaces',
    images: [
      img('DS', 'DS-003_0_AS9_VD9_MP1.png'),
      img('DS', 'DS-003_1_AS1_VD1_MP3.png'),
      img('DS', 'DS-003_2_AS3_VD3_MP3.png'),
      img('DS', 'DS-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'DS-004',
    category: 'dining_spaces',
    images: [
      img('DS', 'DS-004_0_AS1_VD1_MP9.png'),
      img('DS', 'DS-004_1_AS3_VD3_MP9.png'),
      img('DS', 'DS-004_2_AS6_VD6_MP9.png'),
      img('DS', 'DS-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // KITCHENS (KT) - 4 quads
  // ============================================================
  {
    quadId: 'KT-001',
    category: 'kitchens',
    images: [
      img('KT', 'KT-001_0_AS1_VD1_MP1.png'),
      img('KT', 'KT-001_1_AS3_VD3_MP1.png'),
      img('KT', 'KT-001_2_AS6_VD6_MP1.png'),
      img('KT', 'KT-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'KT-002',
    category: 'kitchens',
    images: [
      img('KT', 'KT-002_0_AS3_VD3_MP6.png'),
      img('KT', 'KT-002_1_AS6_VD6_MP6.png'),
      img('KT', 'KT-002_2_AS9_VD9_MP6.png'),
      img('KT', 'KT-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'KT-003',
    category: 'kitchens',
    images: [
      img('KT', 'KT-003_0_AS9_VD9_MP1.png'),
      img('KT', 'KT-003_1_AS1_VD1_MP3.png'),
      img('KT', 'KT-003_2_AS3_VD3_MP3.png'),
      img('KT', 'KT-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'KT-004',
    category: 'kitchens',
    images: [
      img('KT', 'KT-004_0_AS1_VD1_MP9.png'),
      img('KT', 'KT-004_1_AS3_VD3_MP9.png'),
      img('KT', 'KT-004_2_AS6_VD6_MP9.png'),
      img('KT', 'KT-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // PRIMARY BEDROOMS (PB) - 4 quads
  // ============================================================
  {
    quadId: 'PB-001',
    category: 'primary_bedrooms',
    images: [
      img('PB', 'PB-001_0_AS1_VD1_MP1.png'),
      img('PB', 'PB-001_1_AS3_VD3_MP1.png'),
      img('PB', 'PB-001_2_AS6_VD6_MP1.png'),
      img('PB', 'PB-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'PB-002',
    category: 'primary_bedrooms',
    images: [
      img('PB', 'PB-002_0_AS3_VD3_MP6.png'),
      img('PB', 'PB-002_1_AS6_VD6_MP6.png'),
      img('PB', 'PB-002_2_AS9_VD9_MP6.png'),
      img('PB', 'PB-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'PB-003',
    category: 'primary_bedrooms',
    images: [
      img('PB', 'PB-003_0_AS9_VD9_MP1.png'),
      img('PB', 'PB-003_1_AS1_VD1_MP3.png'),
      img('PB', 'PB-003_2_AS3_VD3_MP3.png'),
      img('PB', 'PB-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'PB-004',
    category: 'primary_bedrooms',
    images: [
      img('PB', 'PB-004_0_AS1_VD1_MP9.png'),
      img('PB', 'PB-004_1_AS3_VD3_MP9.png'),
      img('PB', 'PB-004_2_AS6_VD6_MP9.png'),
      img('PB', 'PB-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // PRIMARY BATHROOMS (PBT) - 4 quads
  // ============================================================
  {
    quadId: 'PBT-001',
    category: 'primary_bathrooms',
    images: [
      img('PBT', 'PBT-001_0_AS1_VD1_MP1.png'),
      img('PBT', 'PBT-001_1_AS3_VD3_MP1.png'),
      img('PBT', 'PBT-001_2_AS6_VD6_MP1.png'),
      img('PBT', 'PBT-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'PBT-002',
    category: 'primary_bathrooms',
    images: [
      img('PBT', 'PBT-002_0_AS3_VD3_MP6.png'),
      img('PBT', 'PBT-002_1_AS6_VD6_MP6.png'),
      img('PBT', 'PBT-002_2_AS9_VD9_MP6.png'),
      img('PBT', 'PBT-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'PBT-003',
    category: 'primary_bathrooms',
    images: [
      img('PBT', 'PBT-003_0_AS9_VD9_MP1.png'),
      img('PBT', 'PBT-003_1_AS1_VD1_MP3.png'),
      img('PBT', 'PBT-003_2_AS3_VD3_MP3.png'),
      img('PBT', 'PBT-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'PBT-004',
    category: 'primary_bathrooms',
    images: [
      img('PBT', 'PBT-004_0_AS1_VD1_MP9.png'),
      img('PBT', 'PBT-004_1_AS3_VD3_MP9.png'),
      img('PBT', 'PBT-004_2_AS6_VD6_MP9.png'),
      img('PBT', 'PBT-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // GUEST BEDROOMS (GB) - 4 quads
  // ============================================================
  {
    quadId: 'GB-001',
    category: 'guest_bedrooms',
    images: [
      img('GB', 'GB-001_0_AS1_VD1_MP1.png'),
      img('GB', 'GB-001_1_AS3_VD3_MP1.png'),
      img('GB', 'GB-001_2_AS6_VD6_MP1.png'),
      img('GB', 'GB-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'GB-002',
    category: 'guest_bedrooms',
    images: [
      img('GB', 'GB-002_0_AS3_VD3_MP6.png'),
      img('GB', 'GB-002_1_AS6_VD6_MP6.png'),
      img('GB', 'GB-002_2_AS9_VD9_MP6.png'),
      img('GB', 'GB-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'GB-003',
    category: 'guest_bedrooms',
    images: [
      img('GB', 'GB-003_0_AS9_VD9_MP1.png'),
      img('GB', 'GB-003_1_AS1_VD1_MP3.png'),
      img('GB', 'GB-003_2_AS3_VD3_MP3.png'),
      img('GB', 'GB-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'GB-004',
    category: 'guest_bedrooms',
    images: [
      img('GB', 'GB-004_0_AS1_VD1_MP9.png'),
      img('GB', 'GB-004_1_AS3_VD3_MP9.png'),
      img('GB', 'GB-004_2_AS6_VD6_MP9.png'),
      img('GB', 'GB-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // FAMILY AREAS (FA) - 4 quads
  // ============================================================
  {
    quadId: 'FA-001',
    category: 'family_areas',
    images: [
      img('FA', 'FA-001_0_AS1_VD1_MP1.png'),
      img('FA', 'FA-001_1_AS3_VD3_MP1.png'),
      img('FA', 'FA-001_2_AS6_VD6_MP1.png'),
      img('FA', 'FA-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'FA-002',
    category: 'family_areas',
    images: [
      img('FA', 'FA-002_0_AS3_VD3_MP6.png'),
      img('FA', 'FA-002_1_AS6_VD6_MP6.png'),
      img('FA', 'FA-002_2_AS9_VD9_MP6.png'),
      img('FA', 'FA-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'FA-003',
    category: 'family_areas',
    images: [
      img('FA', 'FA-003_0_AS9_VD9_MP1.png'),
      img('FA', 'FA-003_1_AS1_VD1_MP3.png'),
      img('FA', 'FA-003_2_AS3_VD3_MP3.png'),
      img('FA', 'FA-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'FA-004',
    category: 'family_areas',
    images: [
      img('FA', 'FA-004_0_AS1_VD1_MP9.png'),
      img('FA', 'FA-004_1_AS3_VD3_MP9.png'),
      img('FA', 'FA-004_2_AS6_VD6_MP9.png'),
      img('FA', 'FA-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // EXTERIOR ARCHITECTURE (EA) - 4 quads
  // ============================================================
  {
    quadId: 'EA-001',
    category: 'exterior_architecture',
    images: [
      img('EA', 'EA-001_0_AS1_VD1_MP1.png'),
      img('EA', 'EA-001_1_AS3_VD3_MP1.png'),
      img('EA', 'EA-001_2_AS6_VD6_MP1.png'),
      img('EA', 'EA-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'EA-002',
    category: 'exterior_architecture',
    images: [
      img('EA', 'EA-002_0_AS3_VD3_MP6.png'),
      img('EA', 'EA-002_1_AS6_VD6_MP6.png'),
      img('EA', 'EA-002_2_AS9_VD9_MP6.png'),
      img('EA', 'EA-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'EA-003',
    category: 'exterior_architecture',
    images: [
      img('EA', 'EA-003_0_AS9_VD9_MP1.png'),
      img('EA', 'EA-003_1_AS1_VD1_MP3.png'),
      img('EA', 'EA-003_2_AS3_VD3_MP3.png'),
      img('EA', 'EA-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'EA-004',
    category: 'exterior_architecture',
    images: [
      img('EA', 'EA-004_0_AS1_VD1_MP9.png'),
      img('EA', 'EA-004_1_AS3_VD3_MP9.png'),
      img('EA', 'EA-004_2_AS6_VD6_MP9.png'),
      img('EA', 'EA-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },

  // ============================================================
  // OUTDOOR LIVING (OL) - 4 quads
  // ============================================================
  {
    quadId: 'OL-001',
    category: 'outdoor_living',
    images: [
      img('OL', 'OL-001_0_AS1_VD1_MP1.png'),
      img('OL', 'OL-001_1_AS3_VD3_MP1.png'),
      img('OL', 'OL-001_2_AS6_VD6_MP1.png'),
      img('OL', 'OL-001_3_AS9_VD9_MP1.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  },
  {
    quadId: 'OL-002',
    category: 'outdoor_living',
    images: [
      img('OL', 'OL-002_0_AS3_VD3_MP6.png'),
      img('OL', 'OL-002_1_AS6_VD6_MP6.png'),
      img('OL', 'OL-002_2_AS9_VD9_MP6.png'),
      img('OL', 'OL-002_3_AS1_VD1_MP9.png')
    ],
    attributes: getAttributes('AS3', 'AS6', 'AS9', 'AS1')
  },
  {
    quadId: 'OL-003',
    category: 'outdoor_living',
    images: [
      img('OL', 'OL-003_0_AS9_VD9_MP1.png'),
      img('OL', 'OL-003_1_AS1_VD1_MP3.png'),
      img('OL', 'OL-003_2_AS3_VD3_MP3.png'),
      img('OL', 'OL-003_3_AS6_VD6_MP3.png')
    ],
    attributes: getAttributes('AS9', 'AS1', 'AS3', 'AS6')
  },
  {
    quadId: 'OL-004',
    category: 'outdoor_living',
    images: [
      img('OL', 'OL-004_0_AS1_VD1_MP9.png'),
      img('OL', 'OL-004_1_AS3_VD3_MP9.png'),
      img('OL', 'OL-004_2_AS6_VD6_MP9.png'),
      img('OL', 'OL-004_3_AS9_VD9_MP9.png')
    ],
    attributes: getAttributes('AS1', 'AS3', 'AS6', 'AS9')
  }
];

// Helper functions
export const getQuadsByCategory = (categoryKey) => {
  return quads.filter(q => q.category === categoryKey);
};

export const getTotalQuadCount = () => quads.length;

export const SELECTION_WEIGHTS = {
  favorite_1: 4.0,
  favorite_2: 2.5,
  least: -2.0,
  neutral: 0
};

export default quads;
