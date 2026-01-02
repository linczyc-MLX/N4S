// ============================================
// N4S TASTE CONFIGURATION
// Shared configuration for Taste Exploration reporting
// ============================================

// Cloudinary base URL for taste images
export const TASTE_IMAGE_BASE_URL = 'https://res.cloudinary.com/drhp5e0kl/image/upload/v1/Taste-Exploration';

// Category definitions (9 categories)
export const CATEGORIES = {
  exterior_architecture: { code: 'EA', name: 'Exterior Architecture', order: 1 },
  living_spaces: { code: 'LS', name: 'Living Spaces', order: 2 },
  dining_spaces: { code: 'DS', name: 'Dining Spaces', order: 3 },
  kitchens: { code: 'KT', name: 'Kitchens', order: 4 },
  family_areas: { code: 'FA', name: 'Family Areas', order: 5 },
  primary_bedrooms: { code: 'PB', name: 'Primary Bedrooms', order: 6 },
  primary_bathrooms: { code: 'PBT', name: 'Primary Bathrooms', order: 7 },
  guest_bedrooms: { code: 'GB', name: 'Guest Bedrooms', order: 8 },
  outdoor_living: { code: 'OL', name: 'Outdoor Living', order: 9 }
};

// Architectural Style labels (AS1-AS9 spectrum)
export const AS_LABELS = {
  'AS1': 'Avant-Contemporary',
  'AS2': 'Architectural Modern',
  'AS3': 'Curated Minimalism',
  'AS4': 'Nordic Contemporary',
  'AS5': 'Mid-Century Refined',
  'AS6': 'Modern Classic',
  'AS7': 'Classical Contemporary',
  'AS8': 'Formal Classical',
  'AS9': 'Heritage Estate'
};

// Visual Density labels (VD1-VD5 spectrum)
export const VD_LABELS = {
  'VD1': 'Minimal',
  'VD2': 'Clean',
  'VD3': 'Balanced',
  'VD4': 'Layered',
  'VD5': 'Rich'
};

// Mood Palette labels (MP1-MP5 spectrum)
export const MP_LABELS = {
  'MP1': 'Cool/Neutral',
  'MP2': 'Soft/Light',
  'MP3': 'Warm/Natural',
  'MP4': 'Rich/Deep',
  'MP5': 'Bold/Saturated'
};

// Style order for reporting
export const AS_ORDER = ['AS1', 'AS2', 'AS3', 'AS4', 'AS5', 'AS6', 'AS7', 'AS8', 'AS9'];

// Category display order
export const CATEGORY_ORDER = [
  'exterior_architecture',
  'living_spaces', 
  'dining_spaces',
  'kitchens',
  'family_areas',
  'primary_bedrooms',
  'primary_bathrooms',
  'guest_bedrooms',
  'outdoor_living'
];

// ============================================
// QUAD MATRIX
// Maps quadId -> position (0-3) -> {AS, VD, MP} codes
// This is the core data structure for decoding selections
// ============================================

export const QUAD_MATRIX = {
  // ===============================
  // Exterior Architecture (EA) - 12 quads
  // ===============================
  'EA-001': [
    { style: 'AS1', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'EA-002': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'EA-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP1' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'EA-004': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP5' }
  ],
  'EA-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'EA-006': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP4' }
  ],
  'EA-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'EA-008': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP5' }
  ],
  'EA-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'EA-010': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'EA-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP4' }
  ],
  'EA-012': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Living Spaces (LS) - 12 quads
  // ===============================
  'LS-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'LS-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'LS-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'LS-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'LS-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'LS-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'LS-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'LS-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'LS-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'LS-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'LS-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'LS-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Dining Spaces (DS) - 12 quads
  // ===============================
  'DS-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'DS-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'DS-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'DS-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'DS-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'DS-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'DS-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'DS-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'DS-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'DS-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'DS-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'DS-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Kitchens (KT) - 12 quads
  // ===============================
  'KT-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'KT-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'KT-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'KT-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'KT-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'KT-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'KT-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'KT-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'KT-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'KT-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'KT-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'KT-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Family Areas (FA) - 12 quads
  // ===============================
  'FA-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'FA-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'FA-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'FA-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'FA-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'FA-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'FA-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'FA-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'FA-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'FA-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'FA-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'FA-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Primary Bedrooms (PB) - 12 quads
  // ===============================
  'PB-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PB-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'PB-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'PB-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PB-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'PB-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'PB-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'PB-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PB-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'PB-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'PB-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'PB-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Primary Bathrooms (PBT) - 14 quads
  // ===============================
  'PBT-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'PBT-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'PBT-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'PBT-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'PBT-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'PBT-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-013': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'PBT-014': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],

  // ===============================
  // Guest Bedrooms (GB) - 12 quads
  // ===============================
  'GB-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'GB-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'GB-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'GB-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'GB-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'GB-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'GB-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'GB-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'GB-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'GB-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'GB-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'GB-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],

  // ===============================
  // Outdoor Living (OL) - 12 quads
  // ===============================
  'OL-001': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'OL-002': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'OL-003': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP5' }
  ],
  'OL-004': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'OL-005': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'OL-006': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'OL-007': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ],
  'OL-008': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS8', vd: 'VD4', mp: 'MP4' }
  ],
  'OL-009': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS5', vd: 'VD3', mp: 'MP3' },
    { style: 'AS7', vd: 'VD4', mp: 'MP4' }
  ],
  'OL-010': [
    { style: 'AS2', vd: 'VD2', mp: 'MP1' },
    { style: 'AS3', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD5', mp: 'MP4' }
  ],
  'OL-011': [
    { style: 'AS1', vd: 'VD1', mp: 'MP1' },
    { style: 'AS4', vd: 'VD2', mp: 'MP2' },
    { style: 'AS7', vd: 'VD4', mp: 'MP3' },
    { style: 'AS8', vd: 'VD5', mp: 'MP5' }
  ],
  'OL-012': [
    { style: 'AS2', vd: 'VD1', mp: 'MP1' },
    { style: 'AS5', vd: 'VD2', mp: 'MP2' },
    { style: 'AS6', vd: 'VD3', mp: 'MP3' },
    { style: 'AS9', vd: 'VD4', mp: 'MP4' }
  ]
};

// Helper function to get image URL for a quad position
export const getImageUrl = (quadId, position) => {
  return `${TASTE_IMAGE_BASE_URL}/${quadId}-${position + 1}`;
};

// Get code values for calculations
export const getCodeValue = (code) => {
  const num = parseInt(code.replace(/[A-Z]+/, ''), 10);
  return isNaN(num) ? 0 : num;
};

// Get quad position data
export const getQuadPosition = (quadId, position) => {
  const quad = QUAD_MATRIX[quadId];
  if (quad && position >= 0 && position <= 3) {
    return quad[position];
  }
  return null;
};
