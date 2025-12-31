// Taste Exploration Quad Library
// Each quad contains 4 images for comparative ranking
// Images hosted on Cloudinary

// Cloudinary base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/drhp5e0kl/image/upload';

// Category definitions with metadata
export const categories = {
  living_spaces: {
    code: 'LS',
    name: 'Living Spaces',
    description: 'Main living rooms, great rooms, salons, and formal sitting areas',
    icon: '🛋️',
    color: '#1A365D'
  },
  exterior_architecture: {
    code: 'EA',
    name: 'Exterior Architecture',
    description: 'Facades, entries, and overall architectural presence',
    icon: '🏛️',
    color: '#319795'
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
    code: 'BA',
    name: 'Primary Bathrooms',
    description: 'Master baths and spa-like retreats',
    icon: '🛁',
    color: '#38B2AC'
  },
  exterior_landscape: {
    code: 'EL',
    name: 'Exterior & Landscape',
    description: 'Gardens, pools, outdoor living, and grounds',
    icon: '🌳',
    color: '#48BB78'
  }
};

// Category order for the exploration flow
export const categoryOrder = [
  'living_spaces',
  'exterior_architecture', 
  'dining_spaces',
  'kitchens',
  'primary_bedrooms',
  'primary_bathrooms',
  'exterior_landscape'
];

// Quad definitions with Cloudinary image URLs
// Each quad has 4 images (A, B, C, D) representing variations on a theme
export const quads = [
  // ============================================================
  // LIVING SPACES (LS)
  // ============================================================
  {
    quadId: 'LS-001',
    category: 'living_spaces',
    title: 'Contemporary Great Room',
    variation: 'Fireplace treatment & scale',
    images: [
      `${CLOUDINARY_BASE}/v1734799200/LS-001_0_cxqbvd.png`,
      `${CLOUDINARY_BASE}/v1734799200/LS-001_1_sdfoqw.png`,
      `${CLOUDINARY_BASE}/v1734799200/LS-001_2_tywlms.png`,
      `${CLOUDINARY_BASE}/v1734799200/LS-001_3_vbnkrt.png`
    ],
    labels: ['Warm Plaster', 'Steel Linear', 'Stone Mass', 'Floating Hearth'],
    attributes: {
      warmth: [8, 5, 7, 6],
      formality: [6, 7, 6, 8],
      scale: [8, 7, 9, 7],
      material_focus: ['plaster', 'steel', 'stone', 'concrete']
    }
  },
  {
    quadId: 'LS-002',
    category: 'living_spaces',
    title: 'Formal Living / Travertine',
    variation: 'Stone warmth & art curation',
    images: [
      `${CLOUDINARY_BASE}/v1734799201/LS-002_0_abcdef.png`,
      `${CLOUDINARY_BASE}/v1734799201/LS-002_1_ghijkl.png`,
      `${CLOUDINARY_BASE}/v1734799201/LS-002_2_mnopqr.png`,
      `${CLOUDINARY_BASE}/v1734799201/LS-002_3_stuvwx.png`
    ],
    labels: ['Cream Gallery', 'Honey Collected', 'Gray Modern', 'Walnut Warm'],
    attributes: {
      warmth: [6, 8, 5, 8],
      formality: [8, 7, 8, 6],
      art_focus: [9, 7, 8, 5],
      material_focus: ['travertine', 'limestone', 'marble', 'wood']
    }
  },
  {
    quadId: 'LS-003',
    category: 'living_spaces',
    title: 'Library / Reading Room',
    variation: 'Enclosure & collected character',
    images: [
      `${CLOUDINARY_BASE}/v1734799202/LS-003_0_qwerty.png`,
      `${CLOUDINARY_BASE}/v1734799202/LS-003_1_asdfgh.png`,
      `${CLOUDINARY_BASE}/v1734799202/LS-003_2_zxcvbn.png`,
      `${CLOUDINARY_BASE}/v1734799202/LS-003_3_poiuyt.png`
    ],
    labels: ['English Paneled', 'Modern Minimal', 'Warm Eclectic', 'Light Scandi'],
    attributes: {
      warmth: [8, 4, 9, 6],
      enclosure: [9, 5, 7, 4],
      collected: [9, 3, 8, 5],
      material_focus: ['walnut', 'oak', 'mixed', 'birch']
    }
  },
  {
    quadId: 'LS-004',
    category: 'living_spaces',
    title: 'Contemporary Gallery Living',
    variation: 'Art integration & temperature',
    images: [
      `${CLOUDINARY_BASE}/v1734799203/LS-004_0_lkjhgf.png`,
      `${CLOUDINARY_BASE}/v1734799203/LS-004_1_mnbvcx.png`,
      `${CLOUDINARY_BASE}/v1734799203/LS-004_2_qazwsx.png`,
      `${CLOUDINARY_BASE}/v1734799203/LS-004_3_edcrfv.png`
    ],
    labels: ['Cool White', 'Warm Ochre', 'Gray Neutral', 'Cream Soft'],
    attributes: {
      warmth: [3, 8, 5, 7],
      art_prominence: [9, 8, 7, 6],
      minimalism: [8, 5, 7, 6],
      material_focus: ['concrete', 'plaster', 'stone', 'linen']
    }
  },

  // ============================================================
  // EXTERIOR ARCHITECTURE (EA)
  // ============================================================
  {
    quadId: 'EA-001',
    category: 'exterior_architecture',
    title: 'Contemporary Warm Facade',
    variation: 'Material expression & mass',
    images: [
      `${CLOUDINARY_BASE}/v1767045989/AS1_tpnuxa.png`,
      `${CLOUDINARY_BASE}/v1767045988/AS2_ty6rnh.png`,
      `${CLOUDINARY_BASE}/v1767045989/AS3_vwoca5.png`,
      `${CLOUDINARY_BASE}/v1767045988/AS4_kdptrm.png`
    ],
    labels: ['Avant-Contemporary', 'Architectural Modern', 'Curated Minimal', 'Nordic Contemporary'],
    attributes: {
      warmth: [4, 5, 7, 8],
      drama: [10, 6, 4, 5],
      formality: [6, 8, 7, 5],
      material_focus: ['metal_glass', 'concrete', 'stone_plaster', 'timber']
    }
  },
  {
    quadId: 'EA-002',
    category: 'exterior_architecture',
    title: 'Classical to Traditional',
    variation: 'Historical reference level',
    images: [
      `${CLOUDINARY_BASE}/v1767045989/AS5_b5xgik.png`,
      `${CLOUDINARY_BASE}/v1767045988/AS6_kdudr2.png`,
      `${CLOUDINARY_BASE}/v1767045987/AS7_csfm3r.png`,
      `${CLOUDINARY_BASE}/v1767045990/AS8_emtr7x.png`
    ],
    labels: ['Mid-Century Refined', 'Modern Classic', 'Classical Contemporary', 'Formal Classical'],
    attributes: {
      warmth: [7, 6, 6, 5],
      tradition: [6, 7, 8, 10],
      formality: [5, 7, 8, 10],
      material_focus: ['wood_glass', 'stone', 'stone_brick', 'carved_stone']
    }
  },
  {
    quadId: 'EA-003',
    category: 'exterior_architecture',
    title: 'Estate Character',
    variation: 'Presence & legacy',
    images: [
      `${CLOUDINARY_BASE}/v1767045990/AS9_s3btos.png`,
      `${CLOUDINARY_BASE}/v1767045988/AS4_kdptrm.png`,
      `${CLOUDINARY_BASE}/v1767045988/AS6_kdudr2.png`,
      `${CLOUDINARY_BASE}/v1767045989/AS3_vwoca5.png`
    ],
    labels: ['Heritage Estate', 'Nordic Warm', 'Modern Classic', 'Curated Minimal'],
    attributes: {
      warmth: [7, 8, 6, 7],
      gravitas: [10, 5, 7, 4],
      legacy: [10, 6, 7, 5],
      material_focus: ['stone_slate', 'timber', 'limestone', 'plaster']
    }
  },

  // ============================================================
  // DINING SPACES (DS)
  // ============================================================
  {
    quadId: 'DS-001',
    category: 'dining_spaces',
    title: 'Urban Formal Dining',
    variation: 'Chandelier drama & art scale',
    images: [
      `${CLOUDINARY_BASE}/v1734799210/DS-001_0_dining1.png`,
      `${CLOUDINARY_BASE}/v1734799210/DS-001_1_dining2.png`,
      `${CLOUDINARY_BASE}/v1734799210/DS-001_2_dining3.png`,
      `${CLOUDINARY_BASE}/v1734799210/DS-001_3_dining4.png`
    ],
    labels: ['Cloud Drama', 'Gold Contemporary', 'Garden View', 'Urban Refined'],
    attributes: {
      warmth: [7, 8, 7, 6],
      formality: [8, 7, 8, 7],
      art_drama: [10, 8, 7, 6],
      material_focus: ['wood_bronze', 'gold_glass', 'brass', 'steel']
    }
  },
  {
    quadId: 'DS-002',
    category: 'dining_spaces',
    title: 'Casual Breakfast Area',
    variation: 'Architectural character & light',
    images: [
      `${CLOUDINARY_BASE}/v1734799211/DS-002_0_breakfast1.png`,
      `${CLOUDINARY_BASE}/v1734799211/DS-002_1_breakfast2.png`,
      `${CLOUDINARY_BASE}/v1734799211/DS-002_2_breakfast3.png`,
      `${CLOUDINARY_BASE}/v1734799211/DS-002_3_breakfast4.png`
    ],
    labels: ['Coastal Corner', 'Beamed Arched', 'Hillside Stone', 'Garden Light'],
    attributes: {
      warmth: [8, 8, 7, 7],
      formality: [4, 5, 5, 4],
      indoor_outdoor: [7, 8, 9, 8],
      material_focus: ['rattan', 'wood_plaster', 'stone', 'painted']
    }
  },

  // ============================================================
  // KITCHENS (KT)
  // ============================================================
  {
    quadId: 'KT-001',
    category: 'kitchens',
    title: 'Chef\'s Kitchen',
    variation: 'Cabinet finish & island scale',
    images: [
      `${CLOUDINARY_BASE}/v1734799220/KT-001_0_kitchen1.png`,
      `${CLOUDINARY_BASE}/v1734799220/KT-001_1_kitchen2.png`,
      `${CLOUDINARY_BASE}/v1734799220/KT-001_2_kitchen3.png`,
      `${CLOUDINARY_BASE}/v1734799220/KT-001_3_kitchen4.png`
    ],
    labels: ['White Marble', 'Warm Wood', 'Gray Modern', 'Mixed Traditional'],
    attributes: {
      warmth: [5, 9, 4, 7],
      professionalism: [8, 6, 9, 7],
      cabinet_style: ['shaker', 'slab', 'flat', 'raised_panel'],
      material_focus: ['marble', 'walnut', 'quartzite', 'mixed']
    }
  },
  {
    quadId: 'KT-002',
    category: 'kitchens',
    title: 'Family Kitchen',
    variation: 'Openness & gathering space',
    images: [
      `${CLOUDINARY_BASE}/v1734799221/KT-002_0_familykitchen1.png`,
      `${CLOUDINARY_BASE}/v1734799221/KT-002_1_familykitchen2.png`,
      `${CLOUDINARY_BASE}/v1734799221/KT-002_2_familykitchen3.png`,
      `${CLOUDINARY_BASE}/v1734799221/KT-002_3_familykitchen4.png`
    ],
    labels: ['Open Flow', 'Cozy Contained', 'Grand Island', 'View Focused'],
    attributes: {
      warmth: [7, 9, 6, 7],
      openness: [9, 5, 8, 8],
      family_friendly: [9, 8, 7, 7],
      material_focus: ['quartz', 'butcher_block', 'granite', 'marble']
    }
  },

  // ============================================================
  // PRIMARY BEDROOMS (PB)
  // ============================================================
  {
    quadId: 'PB-001',
    category: 'primary_bedrooms',
    title: 'Primary Suite',
    variation: 'Bed backdrop & ceiling treatment',
    images: [
      `${CLOUDINARY_BASE}/v1734799230/PB-001_0_bedroom1.png`,
      `${CLOUDINARY_BASE}/v1734799230/PB-001_1_bedroom2.png`,
      `${CLOUDINARY_BASE}/v1734799230/PB-001_2_bedroom3.png`,
      `${CLOUDINARY_BASE}/v1734799230/PB-001_3_bedroom4.png`
    ],
    labels: ['Upholstered Wall', 'Wood Paneled', 'Minimal White', 'Dramatic Canopy'],
    attributes: {
      warmth: [8, 8, 5, 7],
      cozy: [8, 7, 4, 6],
      drama: [6, 5, 4, 9],
      material_focus: ['fabric', 'walnut', 'plaster', 'velvet']
    }
  },
  {
    quadId: 'PB-002',
    category: 'primary_bedrooms',
    title: 'Bedroom View Relationship',
    variation: 'Indoor-outdoor connection',
    images: [
      `${CLOUDINARY_BASE}/v1734799231/PB-002_0_bedroomview1.png`,
      `${CLOUDINARY_BASE}/v1734799231/PB-002_1_bedroomview2.png`,
      `${CLOUDINARY_BASE}/v1734799231/PB-002_2_bedroomview3.png`,
      `${CLOUDINARY_BASE}/v1734799231/PB-002_3_bedroomview4.png`
    ],
    labels: ['Ocean Panorama', 'Garden Intimate', 'Mountain Drama', 'City Skyline'],
    attributes: {
      warmth: [6, 8, 7, 5],
      view_prominence: [10, 6, 9, 9],
      privacy: [5, 9, 6, 4],
      material_focus: ['glass', 'linen', 'stone', 'steel']
    }
  },

  // ============================================================
  // PRIMARY BATHROOMS (BA)
  // ============================================================
  {
    quadId: 'BA-001',
    category: 'primary_bathrooms',
    title: 'Primary Bath',
    variation: 'Tub focal & material palette',
    images: [
      `${CLOUDINARY_BASE}/v1734799240/BA-001_0_bath1.png`,
      `${CLOUDINARY_BASE}/v1734799240/BA-001_1_bath2.png`,
      `${CLOUDINARY_BASE}/v1734799240/BA-001_2_bath3.png`,
      `${CLOUDINARY_BASE}/v1734799240/BA-001_3_bath4.png`
    ],
    labels: ['Marble Spa', 'Warm Wood', 'Cool Modern', 'Stone Cave'],
    attributes: {
      warmth: [6, 9, 4, 7],
      spa_feel: [9, 7, 6, 8],
      drama: [7, 5, 6, 9],
      material_focus: ['marble', 'teak', 'glass', 'stone']
    }
  },
  {
    quadId: 'BA-002',
    category: 'primary_bathrooms',
    title: 'Shower Experience',
    variation: 'Enclosure & wellness focus',
    images: [
      `${CLOUDINARY_BASE}/v1734799241/BA-002_0_shower1.png`,
      `${CLOUDINARY_BASE}/v1734799241/BA-002_1_shower2.png`,
      `${CLOUDINARY_BASE}/v1734799241/BA-002_2_shower3.png`,
      `${CLOUDINARY_BASE}/v1734799241/BA-002_3_shower4.png`
    ],
    labels: ['Rain Room', 'Glass Minimal', 'Steam Spa', 'Outdoor Connection'],
    attributes: {
      warmth: [6, 5, 8, 7],
      wellness: [9, 6, 10, 8],
      openness: [7, 9, 6, 10],
      material_focus: ['stone', 'glass', 'tile', 'natural']
    }
  },

  // ============================================================
  // EXTERIOR & LANDSCAPE (EL)
  // ============================================================
  {
    quadId: 'EL-001',
    category: 'exterior_landscape',
    title: 'Pool & Terrace',
    variation: 'Pool edge treatment & furniture',
    images: [
      `${CLOUDINARY_BASE}/v1734799250/EL-001_0_pool1.png`,
      `${CLOUDINARY_BASE}/v1734799250/EL-001_1_pool2.png`,
      `${CLOUDINARY_BASE}/v1734799250/EL-001_2_pool3.png`,
      `${CLOUDINARY_BASE}/v1734799250/EL-001_3_pool4.png`
    ],
    labels: ['Infinity Modern', 'Resort Tropical', 'Geometric Classic', 'Natural Edge'],
    attributes: {
      warmth: [5, 8, 6, 8],
      formality: [7, 4, 8, 3],
      drama: [9, 6, 7, 6],
      material_focus: ['concrete', 'stone', 'tile', 'natural_stone']
    }
  },
  {
    quadId: 'EL-002',
    category: 'exterior_landscape',
    title: 'Garden Character',
    variation: 'Planting style & structure',
    images: [
      `${CLOUDINARY_BASE}/v1734799251/EL-002_0_garden1.png`,
      `${CLOUDINARY_BASE}/v1734799251/EL-002_1_garden2.png`,
      `${CLOUDINARY_BASE}/v1734799251/EL-002_2_garden3.png`,
      `${CLOUDINARY_BASE}/v1734799251/EL-002_3_garden4.png`
    ],
    labels: ['Formal Parterre', 'English Romantic', 'Desert Modern', 'Tropical Lush'],
    attributes: {
      warmth: [5, 8, 6, 9],
      formality: [10, 5, 7, 3],
      maintenance: [9, 7, 4, 6],
      material_focus: ['boxwood', 'perennial', 'succulent', 'palm']
    }
  }
];

// Helper to get quads by category
export const getQuadsByCategory = (categoryKey) => {
  return quads.filter(q => q.category === categoryKey);
};

// Get total quad count
export const getTotalQuadCount = () => quads.length;

// Weight algorithm for ranking positions
export const RANK_WEIGHTS = {
  1: 4.0,   // 1st choice - strong positive signal
  2: 2.5,   // 2nd choice - positive signal
  3: 1.0,   // 3rd choice - neutral
  4: 0.25   // 4th choice - slight negative signal
};

export const SKIP_WEIGHT = -3.0; // "Not My Style" rejection

export default quads;
