// Taste Exploration Quad Library
// Images hosted on Cloudinary
// Filename convention: {Category}-{QuadNum}_{Position}_{AS}_{VD}_{MP}.png
// The embedded metadata in filenames encodes style/variation/material preferences

// Cloudinary base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1766864130/Taste-Exploration';

// Build image URL helper
const img = (folder, filename) => `${CLOUDINARY_BASE}/${folder}/${filename}`;

// Category definitions
export const categories = {
  dining_spaces: {
    code: 'DS',
    name: 'Dining Spaces',
    description: 'Formal dining, breakfast areas, and casual eating spaces',
    icon: '🍽️',
    color: '#805AD5',
    folder: 'DS'
  },
  living_spaces: {
    code: 'LS',
    name: 'Living Spaces',
    description: 'Main living rooms, great rooms, salons, and formal sitting areas',
    icon: '🛋️',
    color: '#1A365D',
    folder: 'LS'
  },
  exterior_architecture: {
    code: 'EA',
    name: 'Exterior Architecture',
    description: 'Facades, entries, and overall architectural presence',
    icon: '🏛️',
    color: '#319795',
    folder: 'EA'
  },
  kitchens: {
    code: 'KT',
    name: 'Kitchens',
    description: 'Chef\'s kitchens, family kitchens, and culinary spaces',
    icon: '👨‍🍳',
    color: '#C9A962',
    folder: 'KT'
  },
  primary_bedrooms: {
    code: 'PB',
    name: 'Primary Bedrooms',
    description: 'Master suites and primary sleeping quarters',
    icon: '🛏️',
    color: '#9F7AEA',
    folder: 'PB'
  },
  primary_bathrooms: {
    code: 'PBT',
    name: 'Primary Bathrooms',
    description: 'Master baths and spa-like retreats',
    icon: '🛁',
    color: '#38B2AC',
    folder: 'PBT'
  },
  outdoor_living: {
    code: 'OL',
    name: 'Outdoor Living',
    description: 'Pools, terraces, gardens, and exterior entertainment',
    icon: '🌳',
    color: '#48BB78',
    folder: 'OL'
  },
  guest_bedrooms: {
    code: 'GB',
    name: 'Guest Bedrooms',
    description: 'Guest suites and secondary sleeping quarters',
    icon: '🛏️',
    color: '#667EEA',
    folder: 'GB'
  }
};

// Category order for the exploration flow
export const categoryOrder = [
  'dining_spaces',
  'living_spaces',
  'exterior_architecture', 
  'kitchens',
  'primary_bedrooms',
  'primary_bathrooms',
  'outdoor_living',
  'guest_bedrooms'
];

// Architectural Style codes (embedded in filename AS field)
// AS1 = Avant-Contemporary, AS3 = Curated Minimalism, AS6 = Modern Classic, AS9 = Heritage Estate
const AS_ATTRIBUTES = {
  AS1: { warmth: 4, formality: 6, drama: 10, tradition: 1 },
  AS2: { warmth: 5, formality: 8, drama: 6, tradition: 3 },
  AS3: { warmth: 7, formality: 7, drama: 4, tradition: 4 },
  AS4: { warmth: 8, formality: 5, drama: 5, tradition: 4 },
  AS5: { warmth: 7, formality: 5, drama: 5, tradition: 6 },
  AS6: { warmth: 6, formality: 7, drama: 5, tradition: 7 },
  AS7: { warmth: 6, formality: 8, drama: 6, tradition: 8 },
  AS8: { warmth: 5, formality: 10, drama: 8, tradition: 10 },
  AS9: { warmth: 8, formality: 9, drama: 7, tradition: 10 }
};

// Extract AS code from filename and get attributes
const getAttributesFromFilename = (filename) => {
  const match = filename.match(/_AS(\d)_/);
  if (match) {
    const asCode = `AS${match[1]}`;
    return AS_ATTRIBUTES[asCode] || {};
  }
  return {};
};

// Quad definitions with actual Cloudinary filenames
// Based on actual files in Taste-Exploration folder
export const quads = [
  // ============================================================
  // DINING SPACES (DS) - 4 quads from Cloudinary
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
    // Attributes derived from AS codes in filenames
    attributes: {
      warmth: [4, 7, 6, 8],      // AS1, AS3, AS6, AS9
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
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
    attributes: {
      warmth: [7, 6, 8, 4],      // AS3, AS6, AS9, AS1
      formality: [7, 7, 9, 6],
      drama: [4, 5, 7, 10],
      tradition: [4, 7, 10, 1]
    }
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
    attributes: {
      warmth: [8, 4, 7, 6],      // AS9, AS1, AS3, AS6
      formality: [9, 6, 7, 7],
      drama: [7, 10, 4, 5],
      tradition: [10, 1, 4, 7]
    }
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  },

  // ============================================================
  // LIVING SPACES (LS) - Placeholder until images uploaded
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  },

  // ============================================================
  // EXTERIOR ARCHITECTURE (EA) - Using existing Arch-Style images
  // ============================================================
  {
    quadId: 'EA-001',
    category: 'exterior_architecture',
    images: [
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS1_tpnuxa.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS2_ty6rnh.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS3_vwoca5.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS4_kdptrm.png'
    ],
    attributes: {
      warmth: [4, 5, 7, 8],
      formality: [6, 8, 7, 5],
      drama: [10, 6, 4, 5],
      tradition: [1, 3, 4, 4]
    }
  },
  {
    quadId: 'EA-002',
    category: 'exterior_architecture',
    images: [
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS5_b5xgik.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS6_kdudr2.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045987/AS7_csfm3r.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS8_emtr7x.png'
    ],
    attributes: {
      warmth: [7, 6, 6, 5],
      formality: [5, 7, 8, 10],
      drama: [5, 5, 6, 8],
      tradition: [6, 7, 8, 10]
    }
  },

  // ============================================================
  // KITCHENS (KT) - Placeholder
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  },

  // ============================================================
  // PRIMARY BEDROOMS (PB) - Placeholder
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  },

  // ============================================================
  // PRIMARY BATHROOMS (PBT) - Placeholder
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  },

  // ============================================================
  // OUTDOOR LIVING (OL) - Placeholder
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  },

  // ============================================================
  // GUEST BEDROOMS (GB) - Placeholder
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
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [6, 7, 7, 9],
      drama: [10, 4, 5, 7],
      tradition: [1, 4, 7, 10]
    }
  }
];

// Helper to get quads by category
export const getQuadsByCategory = (categoryKey) => {
  return quads.filter(q => q.category === categoryKey);
};

// Get total quad count
export const getTotalQuadCount = () => quads.length;

// Weight algorithm for selection positions (Option E)
export const SELECTION_WEIGHTS = {
  favorite_1: 4.0,   // 1st favorite - strong positive
  favorite_2: 2.5,   // 2nd favorite - positive
  least: -2.0,       // Least favorite - negative signal
  neutral: 0         // Unselected 4th image - neutral
};

export default quads;
