// ============================================
// N4S TASTE EXPLORATION - TYPE DEFINITIONS
// ============================================

/**
 * Metadata for a single quad
 */
export interface QuadMetadata {
  ct: number;           // Contemporary-Traditional scale (1-9)
  ml: number;           // Material Layer complexity (1-9)
  wc: number;           // Warm-Cool palette (1-9)
  region: string;       // Design origin/influence
  materials: string[];  // Primary materials used
  complexity?: number;  // Visual complexity (1-9)
  hominess?: number;    // Comfort/lived-in feel (1-9)
}

/**
 * A quad is a set of 4 related images
 */
export interface TasteQuad {
  quadId: string;           // e.g., "LS-001"
  category: string;         // e.g., "living_spaces"
  enabled: boolean;         // Whether to show in exploration
  title: string;            // Style descriptor
  subtitle: string;         // Space type
  imageCount: number;       // Always 4
  description: string;      // Full Midjourney prompt
  metadata: QuadMetadata;
}

/**
 * User's selection within a quad
 */
export interface QuadSelection {
  quadId: string;
  selectedIndex: number;    // 0-3, or -1 if skipped
  timestamp: number;
  timeSpent?: number;       // ms spent on this quad
}

/**
 * Category progress tracking
 */
export interface CategoryProgress {
  categoryId: string;
  totalQuads: number;
  completedQuads: number;
  selections: QuadSelection[];
}

/**
 * Complete exploration session
 */
export interface TasteSession {
  sessionId: string;
  clientId?: string;
  startedAt: number;
  lastUpdatedAt: number;
  completedAt?: number;
  progress: Record<string, CategoryProgress>;
  currentCategory?: string;
  currentQuadIndex?: number;
}

/**
 * Aggregated style metrics from selections
 */
export interface StyleMetrics {
  avgCT: number;
  avgML: number;
  avgWC: number;
  regionPreferences: Record<string, number>;
  materialPreferences: Record<string, number>;
  styleLabel: string;
}

/**
 * Analysis of partner divergence
 */
export interface DivergenceAnalysis {
  overallAlignment: number;     // 0-100 percentage
  categoryAlignment: Record<string, number>;
  significantDifferences: {
    category: string;
    quadId: string;
    partner1Choice: number;
    partner2Choice: number;
    description: string;
  }[];
}

/**
 * Complete taste analysis result
 */
export interface TasteAnalysis {
  sessionId: string;
  completedAt: number;
  totalSelections: number;
  categoriesCompleted: number;
  styleMetrics: StyleMetrics;
  topChoices: {
    quadId: string;
    imageIndex: number;
    category: string;
    title: string;
  }[];
  divergenceAnalysis?: DivergenceAnalysis;
}

/**
 * App view states
 */
export type AppView = 'welcome' | 'exploration' | 'category-complete' | 'analysis' | 'admin';

/**
 * Category definition
 */
export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}
