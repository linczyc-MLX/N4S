// Taste Exploration Quad Library
// Each quad contains 4 images for comparative ranking
// Images hosted on Cloudinary: https://console.cloudinary.com/app/c-6264ce03b55817497874b3f0b13966/assets/media_library/folders/cdaba4fca9095a6a4294f03525402c7ee2

// Cloudinary base URL for Taste Exploration images
const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1766864130/Taste-Exploration';

// Helper to build image URL
// Filename pattern: {Category}-{QuadNum}_{Position}_{StyleCode}_{VariationCode}_{MaterialCode}.png
const buildImageUrl = (folder, filename) => `${CLOUDINARY_BASE}/${folder}/${filename}`;

// Category definitions with metadata
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

// Quad definitions with Cloudinary image URLs
// Each quad has 4 images (positions 0, 1, 2, 3) representing variations on a theme
// Filename format: DS-001_0_AS1_VD1_MP1.png
export const quads = [
  // ============================================================
  // DINING SPACES (DS) - Based on actual Cloudinary folder content
  // ============================================================
  {
    quadId: 'DS-001',
    category: 'dining_spaces',
    title: 'Formal Dining',
    variation: 'Chandelier & Art Expression',
    images: [
      buildImageUrl('DS', 'DS-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('DS', 'DS-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('DS', 'DS-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('DS', 'DS-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Contemporary Bold', 'Minimal Warm', 'Transitional', 'Traditional'],
    attributes: {
      warmth: [5, 7, 6, 8],
      formality: [7, 6, 8, 9],
      drama: [8, 5, 6, 7],
      material_focus: ['metal_glass', 'wood_plaster', 'mixed', 'wood']
    }
  },
  {
    quadId: 'DS-002',
    category: 'dining_spaces',
    title: 'Casual Dining',
    variation: 'Material & Light Treatment',
    images: [
      buildImageUrl('DS', 'DS-002_0_AS3_VD3_MP6.png'),
      buildImageUrl('DS', 'DS-002_1_AS6_VD6_MP6.png'),
      buildImageUrl('DS', 'DS-002_2_AS9_VD9_MP6.png'),
      buildImageUrl('DS', 'DS-002_3_AS1_VD1_MP9.png')
    ],
    labels: ['Light Modern', 'Warm Transitional', 'Classic', 'Urban Edge'],
    attributes: {
      warmth: [6, 8, 7, 5],
      formality: [5, 6, 8, 4],
      drama: [5, 5, 6, 7],
      material_focus: ['plaster', 'wood', 'stone', 'metal']
    }
  },
  {
    quadId: 'DS-003',
    category: 'dining_spaces',
    title: 'Breakfast Nook',
    variation: 'Intimacy & View Relationship',
    images: [
      buildImageUrl('DS', 'DS-003_0_AS9_VD9_MP1.png'),
      buildImageUrl('DS', 'DS-003_1_AS1_VD1_MP3.png'),
      buildImageUrl('DS', 'DS-003_2_AS3_VD3_MP3.png'),
      buildImageUrl('DS', 'DS-003_3_AS6_VD6_MP3.png')
    ],
    labels: ['Traditional Cozy', 'Modern Open', 'Soft Contemporary', 'Classic View'],
    attributes: {
      warmth: [8, 5, 7, 6],
      formality: [6, 4, 5, 7],
      enclosure: [8, 4, 6, 7],
      material_focus: ['wood', 'glass', 'fabric', 'stone']
    }
  },
  {
    quadId: 'DS-004',
    category: 'dining_spaces',
    title: 'Grand Dining',
    variation: 'Scale & Formality',
    images: [
      buildImageUrl('DS', 'DS-004_0_AS1_VD1_MP9.png'),
      buildImageUrl('DS', 'DS-004_1_AS3_VD3_MP9.png'),
      buildImageUrl('DS', 'DS-004_2_AS6_VD6_MP9.png'),
      buildImageUrl('DS', 'DS-004_3_AS9_VD9_MP9.png')
    ],
    labels: ['Avant-Garde', 'Refined Modern', 'Elegant Transitional', 'Estate Classic'],
    attributes: {
      warmth: [4, 6, 7, 8],
      formality: [8, 7, 8, 10],
      drama: [10, 6, 7, 8],
      material_focus: ['metal', 'plaster', 'marble', 'wood']
    }
  },

  // ============================================================
  // LIVING SPACES (LS) - Placeholder structure
  // Update filenames once actual files are uploaded
  // ============================================================
  {
    quadId: 'LS-001',
    category: 'living_spaces',
    title: 'Great Room',
    variation: 'Fireplace & Ceiling Treatment',
    images: [
      buildImageUrl('LS', 'LS-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('LS', 'LS-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('LS', 'LS-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('LS', 'LS-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Contemporary Open', 'Minimal Warm', 'Transitional', 'Traditional'],
    attributes: {
      warmth: [5, 7, 7, 8],
      formality: [5, 5, 7, 8],
      drama: [7, 4, 6, 6],
      material_focus: ['concrete', 'plaster', 'stone', 'wood']
    }
  },
  {
    quadId: 'LS-002',
    category: 'living_spaces',
    title: 'Formal Living',
    variation: 'Art & Furniture Arrangement',
    images: [
      buildImageUrl('LS', 'LS-002_0_AS3_VD3_MP3.png'),
      buildImageUrl('LS', 'LS-002_1_AS6_VD6_MP3.png'),
      buildImageUrl('LS', 'LS-002_2_AS9_VD9_MP3.png'),
      buildImageUrl('LS', 'LS-002_3_AS1_VD1_MP6.png')
    ],
    labels: ['Gallery Modern', 'Classic Elegant', 'Heritage', 'Urban Loft'],
    attributes: {
      warmth: [5, 7, 8, 5],
      formality: [8, 9, 9, 6],
      art_focus: [9, 7, 6, 8],
      material_focus: ['plaster', 'silk', 'velvet', 'leather']
    }
  },

  // ============================================================
  // EXTERIOR ARCHITECTURE (EA) - Using existing Arch-Style images
  // ============================================================
  {
    quadId: 'EA-001',
    category: 'exterior_architecture',
    title: 'Contemporary Expressions',
    variation: 'Material & Massing',
    images: [
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS1_tpnuxa.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS2_ty6rnh.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS3_vwoca5.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS4_kdptrm.png'
    ],
    labels: ['Avant-Contemporary', 'Architectural Modern', 'Curated Minimal', 'Nordic Contemporary'],
    attributes: {
      warmth: [4, 5, 7, 8],
      drama: [10, 6, 4, 5],
      formality: [6, 8, 7, 5],
      tradition: [1, 3, 4, 4],
      material_focus: ['metal_glass', 'concrete', 'stone_plaster', 'timber']
    }
  },
  {
    quadId: 'EA-002',
    category: 'exterior_architecture',
    title: 'Classical to Traditional',
    variation: 'Historical Reference Level',
    images: [
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045989/AS5_b5xgik.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045988/AS6_kdudr2.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045987/AS7_csfm3r.png',
      'https://res.cloudinary.com/drhp5e0kl/image/upload/v1767045990/AS8_emtr7x.png'
    ],
    labels: ['Mid-Century Refined', 'Modern Classic', 'Classical Contemporary', 'Formal Classical'],
    attributes: {
      warmth: [7, 6, 6, 5],
      tradition: [6, 7, 8, 10],
      formality: [5, 7, 8, 10],
      drama: [5, 5, 6, 8],
      material_focus: ['wood_glass', 'stone', 'stone_brick', 'carved_stone']
    }
  },

  // ============================================================
  // KITCHENS (KT) - Placeholder structure
  // ============================================================
  {
    quadId: 'KT-001',
    category: 'kitchens',
    title: 'Chef\'s Kitchen',
    variation: 'Cabinet Style & Island Scale',
    images: [
      buildImageUrl('KT', 'KT-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('KT', 'KT-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('KT', 'KT-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('KT', 'KT-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Ultra Modern', 'Warm Contemporary', 'Transitional', 'Classic'],
    attributes: {
      warmth: [4, 7, 7, 8],
      formality: [6, 5, 7, 8],
      professionalism: [9, 7, 6, 5],
      material_focus: ['stainless', 'wood', 'marble', 'painted']
    }
  },

  // ============================================================
  // PRIMARY BEDROOMS (PB) - Placeholder structure
  // ============================================================
  {
    quadId: 'PB-001',
    category: 'primary_bedrooms',
    title: 'Primary Suite',
    variation: 'Bed Wall & Ceiling Treatment',
    images: [
      buildImageUrl('PB', 'PB-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('PB', 'PB-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('PB', 'PB-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('PB', 'PB-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Modern Drama', 'Soft Contemporary', 'Elegant Traditional', 'Classic Luxury'],
    attributes: {
      warmth: [5, 7, 7, 8],
      cozy: [5, 8, 7, 7],
      drama: [8, 5, 6, 7],
      material_focus: ['leather', 'linen', 'silk', 'velvet']
    }
  },

  // ============================================================
  // PRIMARY BATHROOMS (PBT) - Placeholder structure
  // ============================================================
  {
    quadId: 'PBT-001',
    category: 'primary_bathrooms',
    title: 'Primary Bath',
    variation: 'Tub Focal & Material Palette',
    images: [
      buildImageUrl('PBT', 'PBT-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('PBT', 'PBT-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('PBT', 'PBT-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('PBT', 'PBT-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Minimal Spa', 'Warm Wood', 'Marble Classic', 'Traditional'],
    attributes: {
      warmth: [4, 8, 6, 7],
      spa_feel: [8, 7, 8, 6],
      drama: [6, 5, 8, 7],
      material_focus: ['glass', 'teak', 'marble', 'stone']
    }
  },

  // ============================================================
  // OUTDOOR LIVING (OL) - Placeholder structure
  // ============================================================
  {
    quadId: 'OL-001',
    category: 'outdoor_living',
    title: 'Pool & Terrace',
    variation: 'Pool Style & Furniture',
    images: [
      buildImageUrl('OL', 'OL-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('OL', 'OL-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('OL', 'OL-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('OL', 'OL-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Infinity Modern', 'Resort Casual', 'Classic Formal', 'Natural'],
    attributes: {
      warmth: [4, 7, 6, 8],
      formality: [7, 4, 8, 3],
      drama: [9, 5, 6, 5],
      material_focus: ['concrete', 'teak', 'stone', 'natural']
    }
  },

  // ============================================================
  // GUEST BEDROOMS (GB) - Placeholder structure
  // ============================================================
  {
    quadId: 'GB-001',
    category: 'guest_bedrooms',
    title: 'Guest Suite',
    variation: 'Warmth & Personality',
    images: [
      buildImageUrl('GB', 'GB-001_0_AS1_VD1_MP1.png'),
      buildImageUrl('GB', 'GB-001_1_AS3_VD3_MP1.png'),
      buildImageUrl('GB', 'GB-001_2_AS6_VD6_MP1.png'),
      buildImageUrl('GB', 'GB-001_3_AS9_VD9_MP1.png')
    ],
    labels: ['Modern Clean', 'Boutique Hotel', 'Classic Comfort', 'Heritage'],
    attributes: {
      warmth: [5, 7, 7, 8],
      personality: [6, 8, 7, 7],
      formality: [5, 6, 7, 8],
      material_focus: ['linen', 'velvet', 'cotton', 'silk']
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
