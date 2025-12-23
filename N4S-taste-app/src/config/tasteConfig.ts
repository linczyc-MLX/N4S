// ============================================
// N4S TASTE EXPLORATION - CONFIGURATION
// ============================================

/**
 * IMPORTANT: Image hosting location
 * Images are hosted on IONOS web hosting (separate from Deploy Now)
 * All 440 images stored flat in this directory
 * Pattern: {QUAD_ID}_{INDEX}.png (e.g., EA-001_0.png)
 */
export const TASTE_IMAGE_BASE_URL = 'http://do-great.work/PRESENTATIONS/NFS/LIBRARY/IMAGES';

/**
 * Build full image URL for a quad image
 */
export const getImageUrl = (quadId: string, index: number): string => {
  return `${TASTE_IMAGE_BASE_URL}/${quadId}_${index}.png`;
};

/**
 * Category definitions with display order
 */
export const CATEGORIES = {
  living_spaces: {
    id: 'living_spaces',
    code: 'LS',
    name: 'Living Spaces',
    description: 'Great rooms, formal living, and salons',
    icon: '🛋️',
    order: 1
  },
  exterior_architecture: {
    id: 'exterior_architecture',
    code: 'EA',
    name: 'Exterior Architecture',
    description: 'Facades, entries, and architectural style',
    icon: '🏛️',
    order: 2
  },
  dining_spaces: {
    id: 'dining_spaces',
    code: 'DS',
    name: 'Dining Spaces',
    description: 'Formal dining, casual dining, and breakfast rooms',
    icon: '🍽️',
    order: 3
  },
  kitchens: {
    id: 'kitchens',
    code: 'KT',
    name: 'Kitchens',
    description: 'Chef kitchens, open plans, and catering',
    icon: '👨‍🍳',
    order: 4
  },
  family_areas: {
    id: 'family_areas',
    code: 'FA',
    name: 'Family Areas',
    description: 'Family rooms, media rooms, and game rooms',
    icon: '🎮',
    order: 5
  },
  primary_bedrooms: {
    id: 'primary_bedrooms',
    code: 'PB',
    name: 'Primary Bedrooms',
    description: 'Master suites and sleeping sanctuaries',
    icon: '🛏️',
    order: 6
  },
  primary_bathrooms: {
    id: 'primary_bathrooms',
    code: 'PBT',
    name: 'Primary Bathrooms',
    description: 'Spa bathrooms and private retreats',
    icon: '🛁',
    order: 7
  },
  guest_bedrooms: {
    id: 'guest_bedrooms',
    code: 'GB',
    name: 'Guest Bedrooms',
    description: 'Guest suites and hospitality spaces',
    icon: '🛎️',
    order: 8
  },
  exterior_landscape: {
    id: 'exterior_landscape',
    code: 'EL',
    name: 'Exterior Landscape',
    description: 'Gardens, pools, and outdoor environments',
    icon: '🌿',
    order: 9
  },
  outdoor_living: {
    id: 'outdoor_living',
    code: 'OL',
    name: 'Outdoor Living',
    description: 'Terraces, loggias, and entertaining spaces',
    icon: '☀️',
    order: 10
  }
} as const;

/**
 * Get categories in display order
 */
export const getOrderedCategories = () => {
  return Object.values(CATEGORIES).sort((a, b) => a.order - b.order);
};

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  // Minimum selections required to proceed
  minSelectionsPerCategory: 1,
  // Enable/disable divergence analysis
  showDivergenceAnalysis: true,
  // Auto-save interval (ms)
  autoSaveInterval: 30000,
  // Storage key prefix
  storageKeyPrefix: 'n4s_taste_'
};
