// ============================================
// N4S TASTE EXPLORATION - COMPLETE QUAD METADATA
// 110 Quads across 10 Categories (440 Images)
// Includes full image prompts and all metadata
// ============================================

import { TasteQuad } from '../types/tasteTypes';

// Category type for this file
interface TasteCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
}

// Categories in correct display order
export const categories: Record<string, TasteCategory> = {
  living_spaces: {
    id: 'living_spaces',
    name: 'Living Spaces',
    code: 'LS',
    description: 'Great rooms, formal living, and salons',
    icon: '🛋️'
  },
  exterior_architecture: {
    id: 'exterior_architecture',
    name: 'Exterior Architecture',
    code: 'EA',
    description: 'Facades, entries, and architectural style',
    icon: '🏛️'
  },
  dining_spaces: {
    id: 'dining_spaces',
    name: 'Dining Spaces',
    code: 'DS',
    description: 'Formal dining, casual dining, and breakfast rooms',
    icon: '🍽️'
  },
  kitchens: {
    id: 'kitchens',
    name: 'Kitchens',
    code: 'KT',
    description: 'Chef kitchens, open plans, and catering',
    icon: '👨‍🍳'
  },
  family_areas: {
    id: 'family_areas',
    name: 'Family Areas',
    code: 'FA',
    description: 'Family rooms, media rooms, and game rooms',
    icon: '🎮'
  },
  primary_bedrooms: {
    id: 'primary_bedrooms',
    name: 'Primary Bedrooms',
    code: 'PB',
    description: 'Master suites and sleeping sanctuaries',
    icon: '🛏️'
  },
  primary_bathrooms: {
    id: 'primary_bathrooms',
    name: 'Primary Bathrooms',
    code: 'PBT',
    description: 'Spa bathrooms and private retreats',
    icon: '🛁'
  },
  guest_bedrooms: {
    id: 'guest_bedrooms',
    name: 'Guest Bedrooms',
    code: 'GB',
    description: 'Guest suites and hospitality spaces',
    icon: '🛎️'
  },
  exterior_landscape: {
    id: 'exterior_landscape',
    name: 'Exterior Landscape',
    code: 'EL',
    description: 'Gardens, pools, and outdoor environments',
    icon: '🌿'
  },
  outdoor_living: {
    id: 'outdoor_living',
    name: 'Outdoor Living',
    code: 'OL',
    description: 'Terraces, loggias, and entertaining spaces',
    icon: '☀️'
  }
};

// Category order for iteration
export const categoryOrder = [
  'living_spaces',
  'exterior_architecture', 
  'dining_spaces',
  'kitchens',
  'family_areas',
  'primary_bedrooms',
  'primary_bathrooms',
  'guest_bedrooms',
  'exterior_landscape',
  'outdoor_living'
];

// ============================================
// QUAD METADATA WITH FULL ATTRIBUTES & PROMPTS
// ============================================

export const quads: Record<string, TasteQuad> = {
  // ============================================
  // LIVING SPACES (LS-001 to LS-012) - 12 Quads
  // ============================================
  'LS-001': {
    quadId: 'LS-001',
    category: 'living_spaces',
    enabled: true,
    title: 'Contemporary Warm Minimal',
    subtitle: 'Great Room',
    imageCount: 4,
    description: 'Ultra-luxury contemporary great room interior, warm minimal aesthetic, 14-foot ceilings, wide-plank white oak floors, lime wash plaster walls, floor-to-ceiling windows with garden view, low-profile linen sofas, bronze coffee table, single large-scale abstract art, fireplace with limestone surround, abundant natural light, professional interior photography',
    metadata: { ct: 2, ml: 2, wc: 3, region: 'california_modern', materials: ['white_oak', 'plaster', 'limestone'], complexity: 3 }
  },
  'LS-002': {
    quadId: 'LS-002',
    category: 'living_spaces',
    enabled: true,
    title: 'Contemporary Warm Minimal',
    subtitle: 'Formal Living',
    imageCount: 4,
    description: 'Sophisticated contemporary living room, warm minimal, double-height ceiling with clerestory windows, travertine fireplace wall floor to ceiling, camel leather Barcelona chairs, cream bouclé sofa, walnut credenza, single bronze sculpture, neutral warm palette, afternoon light streaming in',
    metadata: { ct: 2, ml: 3, wc: 3, region: 'california_modern', materials: ['travertine', 'leather', 'walnut'], complexity: 4 }
  },
  'LS-003': {
    quadId: 'LS-003',
    category: 'living_spaces',
    enabled: true,
    title: 'Contemporary Warm Minimal',
    subtitle: 'Salon',
    imageCount: 4,
    description: 'Intimate luxury salon, contemporary warm minimal, 10-foot ceilings, venetian plaster walls in warm cream, herringbone oak floors, pair of curved sofas in oatmeal linen, brass reading lamps, built-in oak bookshelves, fireplace with simple marble surround, soft afternoon light',
    metadata: { ct: 2, ml: 3, wc: 3, region: 'international_modern', materials: ['oak', 'plaster', 'marble'], complexity: 4 }
  },
  'LS-004': {
    quadId: 'LS-004',
    category: 'living_spaces',
    enabled: true,
    title: 'Contemporary Cool Minimal',
    subtitle: 'Great Room',
    imageCount: 4,
    description: 'Ultra-modern living space, cool minimal aesthetic, polished concrete floors, white plaster walls, floor-to-ceiling glass walls, low charcoal gray modular sofa, single Noguchi coffee table, monumental abstract art in black and white, 16-foot ceilings, views to sculpture garden, diffused daylight',
    metadata: { ct: 2, ml: 2, wc: 7, region: 'international_modern', materials: ['concrete', 'glass', 'steel'], complexity: 3 }
  },
  'LS-005': {
    quadId: 'LS-005',
    category: 'living_spaces',
    enabled: true,
    title: 'Contemporary Cool Minimal',
    subtitle: 'Formal Living',
    imageCount: 4,
    description: 'Minimalist luxury living room, cool palette, white oak floors, gray flannel walls, streamlined white leather seating, chrome and glass coffee table, single large photograph, floor-to-ceiling sheer curtains, indirect cove lighting, museum-like atmosphere',
    metadata: { ct: 2, ml: 2, wc: 7, region: 'scandinavian', materials: ['white_oak', 'glass', 'chrome'], complexity: 3 }
  },
  'LS-006': {
    quadId: 'LS-006',
    category: 'living_spaces',
    enabled: true,
    title: 'Contemporary Cool Minimal',
    subtitle: 'Salon',
    imageCount: 4,
    description: 'Cool contemporary reading room, minimal aesthetic, built-in gray lacquer bookshelves, single Eames lounge chair in black leather, polished concrete floor, steel-framed glass wall to garden, single floor lamp, curated book collection, north-facing natural light',
    metadata: { ct: 2, ml: 2, wc: 7, region: 'international_modern', materials: ['concrete', 'steel', 'lacquer'], complexity: 3 }
  },
  'LS-007': {
    quadId: 'LS-007',
    category: 'living_spaces',
    enabled: true,
    title: 'Traditional Layered',
    subtitle: 'Great Room',
    imageCount: 4,
    description: 'Grand traditional living room, English country house style, rich layered aesthetic, 12-foot coffered ceiling, antique Persian rug on dark oak floors, velvet sofas in deep burgundy, mahogany bookcases filled with leather-bound books, roaring fireplace with carved marble mantel, oil paintings in gilt frames, brass lamps, afternoon light through mullioned windows',
    metadata: { ct: 8, ml: 8, wc: 3, region: 'english_traditional', materials: ['mahogany', 'velvet', 'marble'], complexity: 8 }
  },
  'LS-008': {
    quadId: 'LS-008',
    category: 'living_spaces',
    enabled: true,
    title: 'Traditional Layered',
    subtitle: 'Formal Living',
    imageCount: 4,
    description: 'Elegant traditional drawing room, refined layered aesthetic, silk damask walls in pale blue, antique French furniture, crystal chandelier, marble fireplace with ornate mirror above, pair of bergère chairs, aubusson rug, family portraits, fresh flowers, soft diffused light',
    metadata: { ct: 8, ml: 7, wc: 4, region: 'french_contemporary', materials: ['silk', 'marble', 'crystal'], complexity: 7 }
  },
  'LS-009': {
    quadId: 'LS-009',
    category: 'living_spaces',
    enabled: true,
    title: 'Traditional Layered',
    subtitle: 'Salon',
    imageCount: 4,
    description: 'Intimate traditional library salon, dark wood paneled walls in walnut, tufted leather Chesterfield sofa, antique globe, brass library lamp, roaring fire in stone fireplace, Persian rug, stacked leather-bound books, single malt and crystal decanter on side table, warm incandescent glow',
    metadata: { ct: 8, ml: 8, wc: 3, region: 'english_traditional', materials: ['walnut', 'leather', 'stone'], complexity: 8 }
  },
  'LS-010': {
    quadId: 'LS-010',
    category: 'living_spaces',
    enabled: true,
    title: 'Organic Modern',
    subtitle: 'Great Room',
    imageCount: 4,
    description: 'Organic modern living space, natural materials, live-edge walnut coffee table, cream bouclé sofas, rammed earth accent wall, polished concrete floor with area rug in natural fibers, floor-to-ceiling windows to forest, indoor olive tree, Japanese ceramic vessels, warm afternoon light filtering through trees',
    metadata: { ct: 3, ml: 4, wc: 4, region: 'japanese', materials: ['walnut', 'concrete', 'earth'], complexity: 5 }
  },
  'LS-011': {
    quadId: 'LS-011',
    category: 'living_spaces',
    enabled: true,
    title: 'Organic Modern',
    subtitle: 'Formal Living',
    imageCount: 4,
    description: 'Refined organic living room, wabi-sabi aesthetic, lime wash walls in warm putty, reclaimed oak floors, low Japanese-inspired seating in natural linen, single stone sculpture, shoji screen room divider, single ikebana arrangement, view to zen garden, soft diffused light',
    metadata: { ct: 3, ml: 3, wc: 4, region: 'japanese', materials: ['reclaimed_oak', 'plaster', 'stone'], complexity: 4 }
  },
  'LS-012': {
    quadId: 'LS-012',
    category: 'living_spaces',
    enabled: true,
    title: 'Organic Modern',
    subtitle: 'Salon',
    imageCount: 4,
    description: 'Organic modern reading nook, curved plaster walls, built-in concrete bench with linen cushions, single statement floor lamp, view through picture window to meadow, stack of art books, ceramic tea set, natural wool throw, late afternoon golden light',
    metadata: { ct: 3, ml: 3, wc: 4, region: 'international_modern', materials: ['plaster', 'concrete', 'linen'], complexity: 4 }
  },

  // ============================================
  // EXTERIOR ARCHITECTURE (EA-001 to EA-012) - 12 Quads
  // ============================================
  'EA-001': {
    quadId: 'EA-001',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Contemporary Warm Minimal',
    subtitle: 'Facade',
    imageCount: 4,
    description: 'Ultra-luxury contemporary residence exterior, warm minimal aesthetic, clean horizontal lines, natural wood siding and floor-to-ceiling glass, flat roof with deep overhangs, limestone base, mature olive trees in foreground, golden hour lighting, Santa Barbara California style, wide establishing shot, professional architectural photography, no people',
    metadata: { ct: 2, ml: 2, wc: 4, region: 'california_modern', materials: ['wood_siding', 'glass', 'limestone'] }
  },
  'EA-002': {
    quadId: 'EA-002',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Contemporary Warm Minimal',
    subtitle: 'Entry',
    imageCount: 4,
    description: 'Ultra-luxury home entry and front door, contemporary warm minimal, 12-foot pivot door in natural white oak, limestone surrounds, integrated bronze hardware, subtle landscape lighting, covered entry portico, specimen olive tree, twilight shot with warm interior glow, professional architectural photography',
    metadata: { ct: 2, ml: 2, wc: 4, region: 'california_modern', materials: ['white_oak', 'limestone', 'bronze'] }
  },
  'EA-003': {
    quadId: 'EA-003',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Contemporary Warm Minimal',
    subtitle: 'Aerial',
    imageCount: 4,
    description: 'Aerial view of ultra-luxury contemporary estate, warm minimal architecture, series of connected pavilions with flat roofs, natural wood and glass, infinity pool, manicured lawns, mature trees providing privacy, coastal setting, late afternoon light, drone photography perspective',
    metadata: { ct: 2, ml: 2, wc: 4, region: 'california_modern', materials: ['wood', 'glass', 'concrete'] }
  },
  'EA-004': {
    quadId: 'EA-004',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Contemporary Cool Minimal',
    subtitle: 'Facade',
    imageCount: 4,
    description: 'Ultra-modern minimalist residence exterior, cool palette, white rendered walls with floor-to-ceiling glass, steel frame details, geometric massing, reflecting pool in foreground, sculptural landscaping, overcast sky for even lighting, international modern style, professional architectural photography',
    metadata: { ct: 1, ml: 1, wc: 7, region: 'international_modern', materials: ['glass', 'steel', 'concrete'] }
  },
  'EA-005': {
    quadId: 'EA-005',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Contemporary Cool Minimal',
    subtitle: 'Entry',
    imageCount: 4,
    description: 'Minimalist luxury home entrance, cool contemporary, frameless glass pivot door, polished concrete path, architectural steel canopy, black pebble garden, single Japanese maple, crisp shadows, professional architectural photography',
    metadata: { ct: 1, ml: 1, wc: 7, region: 'international_modern', materials: ['glass', 'steel', 'concrete'] }
  },
  'EA-006': {
    quadId: 'EA-006',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Contemporary Cool Minimal',
    subtitle: 'Dusk',
    imageCount: 4,
    description: 'Ultra-modern residence at blue hour, cool minimal aesthetic, glowing interior volumes visible through extensive glazing, dramatic cantilever, illuminated pathway, reflection in water feature, stars beginning to appear, professional twilight photography',
    metadata: { ct: 1, ml: 1, wc: 7, region: 'international_modern', materials: ['glass', 'steel', 'concrete'] }
  },
  'EA-007': {
    quadId: 'EA-007',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Traditional English',
    subtitle: 'Facade',
    imageCount: 4,
    description: 'Grand English country estate exterior, Cotswold stone construction, honey-colored limestone, mullioned windows, slate roof with copper gutters, formal symmetry, manicured boxwood hedges, gravel motor court, late afternoon English light, professional architectural photography',
    metadata: { ct: 8, ml: 6, wc: 4, region: 'english_country', materials: ['limestone', 'slate', 'copper'] }
  },
  'EA-008': {
    quadId: 'EA-008',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Traditional English',
    subtitle: 'Entry',
    imageCount: 4,
    description: 'Grand English manor house entrance, limestone portico with classical columns, solid oak double doors with brass hardware, lantern lighting, topiary flanking entry, herringbone brick path, wisteria on facade, soft overcast light, professional photography',
    metadata: { ct: 8, ml: 6, wc: 4, region: 'english_country', materials: ['limestone', 'oak', 'brass'] }
  },
  'EA-009': {
    quadId: 'EA-009',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Mediterranean Villa',
    subtitle: 'Facade',
    imageCount: 4,
    description: 'Luxurious Mediterranean villa exterior, warm stucco walls in cream, terracotta barrel tile roof, arched windows and doorways, wrought iron balconies, bougainvillea climbing walls, cypress trees, cobblestone courtyard, golden hour Tuscan light',
    metadata: { ct: 7, ml: 5, wc: 3, region: 'mediterranean', materials: ['stucco', 'terracotta', 'iron'] }
  },
  'EA-010': {
    quadId: 'EA-010',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Mediterranean Villa',
    subtitle: 'Entry',
    imageCount: 4,
    description: 'Mediterranean luxury home entrance, stone archway with carved details, massive antique wooden doors with iron studs, terracotta pot with olive tree, climbing jasmine, lantern sconces, courtyard beyond visible, warm afternoon light',
    metadata: { ct: 7, ml: 5, wc: 3, region: 'mediterranean', materials: ['stone', 'wood', 'iron'] }
  },
  'EA-011': {
    quadId: 'EA-011',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Transitional Hamptons',
    subtitle: 'Facade',
    imageCount: 4,
    description: 'Elegant Hamptons estate exterior, transitional style, cedar shingle siding weathered to silver gray, white trim, black metal roof, large windows with divided lights, wraparound porch, hydrangea garden, privet hedges, soft summer light',
    metadata: { ct: 5, ml: 4, wc: 5, region: 'hamptons', materials: ['cedar', 'glass', 'metal'] }
  },
  'EA-012': {
    quadId: 'EA-012',
    category: 'exterior_architecture',
    enabled: true,
    title: 'Transitional Hamptons',
    subtitle: 'Aerial',
    imageCount: 4,
    description: 'Aerial view of Hamptons waterfront estate, transitional architecture, main house with guest cottage, tennis court, infinity pool overlooking bay, manicured lawns, dock with boat house, late afternoon summer light, drone perspective',
    metadata: { ct: 5, ml: 4, wc: 5, region: 'hamptons', materials: ['cedar', 'stone', 'glass'] }
  },

  // ============================================
  // DINING SPACES (DS-001 to DS-009) - 9 Quads
  // ============================================
  'DS-001': {
    quadId: 'DS-001',
    category: 'dining_spaces',
    enabled: true,
    title: 'Contemporary Warm',
    subtitle: 'Formal Dining',
    imageCount: 4,
    description: 'Elegant contemporary dining room, warm minimal aesthetic, 10-foot ceilings, live-edge walnut dining table for 12, cream leather dining chairs, statement brass chandelier, floor-to-ceiling windows with sheer curtains, single large abstract painting, herringbone oak floors, evening dinner party lighting',
    metadata: { ct: 2, ml: 3, wc: 4, region: 'california_modern', materials: ['walnut', 'leather', 'brass'] }
  },
  'DS-002': {
    quadId: 'DS-002',
    category: 'dining_spaces',
    enabled: true,
    title: 'Contemporary Warm',
    subtitle: 'Casual Dining',
    imageCount: 4,
    description: 'Casual contemporary dining area, warm aesthetic, round oak dining table for 6, woven rattan chairs, pendant lighting in woven fiber, windows to terrace, built-in banquette in natural linen, potted fiddle leaf fig, morning breakfast light',
    metadata: { ct: 2, ml: 4, wc: 3, region: 'california_modern', materials: ['oak', 'rattan', 'linen'] }
  },
  'DS-003': {
    quadId: 'DS-003',
    category: 'dining_spaces',
    enabled: true,
    title: 'Contemporary Warm',
    subtitle: 'Breakfast Room',
    imageCount: 4,
    description: 'Sun-filled breakfast room, contemporary warm style, curved banquette in terracotta velvet, round marble pedestal table, brass pendant light, bay window with garden view, fresh flowers in ceramic vase, morning light streaming in',
    metadata: { ct: 3, ml: 4, wc: 3, region: 'california_modern', materials: ['marble', 'velvet', 'brass'] }
  },
  'DS-004': {
    quadId: 'DS-004',
    category: 'dining_spaces',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Formal Dining',
    imageCount: 4,
    description: 'Grand traditional dining room, formal entertaining space, mahogany dining table for 16, upholstered chairs in silk damask, crystal chandelier, dark wood paneled walls, oil paintings, silver candelabras, marble fireplace, set for formal dinner with fine china and crystal',
    metadata: { ct: 8, ml: 7, wc: 3, region: 'english_traditional', materials: ['mahogany', 'silk', 'crystal'] }
  },
  'DS-005': {
    quadId: 'DS-005',
    category: 'dining_spaces',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Casual Dining',
    imageCount: 4,
    description: 'Traditional breakfast room, relaxed elegance, round pedestal table in cherry wood, windsor chairs painted cream, built-in china cabinet, botanical prints, blue and white porcelain, window seat with cushions, morning light through french doors to garden',
    metadata: { ct: 7, ml: 6, wc: 4, region: 'english_country', materials: ['cherry', 'porcelain', 'cotton'] }
  },
  'DS-006': {
    quadId: 'DS-006',
    category: 'dining_spaces',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Breakfast Room',
    imageCount: 4,
    description: 'Cozy traditional morning room, octagonal breakfast table, upholstered chairs in chintz, bay window with garden view, antique sideboard with silver coffee service, fresh flowers, family photos in silver frames, warm morning sunlight',
    metadata: { ct: 7, ml: 6, wc: 3, region: 'english_country', materials: ['wood', 'chintz', 'silver'] }
  },
  'DS-007': {
    quadId: 'DS-007',
    category: 'dining_spaces',
    enabled: true,
    title: 'Mediterranean',
    subtitle: 'Formal Dining',
    imageCount: 4,
    description: 'Mediterranean villa dining room, rustic elegance, long antique farm table, wrought iron chandelier with candles, terracotta tile floors, whitewashed walls, arched windows with shutters, blue and white ceramic plates displayed, olive branches in terracotta urn',
    metadata: { ct: 6, ml: 6, wc: 3, region: 'mediterranean', materials: ['wood', 'iron', 'terracotta'] }
  },
  'DS-008': {
    quadId: 'DS-008',
    category: 'dining_spaces',
    enabled: true,
    title: 'Mediterranean',
    subtitle: 'Casual Dining',
    imageCount: 4,
    description: 'Casual Mediterranean dining space, indoor-outdoor flow, stone-topped dining table, rush-seated chairs, ceiling fan, arched opening to terrace, climbing bougainvillea visible, terracotta floor, afternoon Tuscan light',
    metadata: { ct: 6, ml: 5, wc: 3, region: 'mediterranean', materials: ['stone', 'rush', 'terracotta'] }
  },
  'DS-009': {
    quadId: 'DS-009',
    category: 'dining_spaces',
    enabled: true,
    title: 'Mediterranean',
    subtitle: 'Loggia Dining',
    imageCount: 4,
    description: 'Outdoor dining loggia, Mediterranean villa, long table under stone archway, wrought iron chairs with cushions, hanging lanterns, vineyard view beyond, climbing roses on columns, set for lunch with linen and ceramics, dappled afternoon light',
    metadata: { ct: 6, ml: 6, wc: 3, region: 'mediterranean', materials: ['stone', 'iron', 'linen'] }
  },

  // ============================================
  // KITCHENS (KT-001 to KT-009) - 9 Quads
  // ============================================
  'KT-001': {
    quadId: 'KT-001',
    category: 'kitchens',
    enabled: true,
    title: 'Contemporary Warm',
    subtitle: 'Chef Kitchen',
    imageCount: 4,
    description: 'Ultra-luxury chef kitchen, contemporary warm aesthetic, 12-foot island in white oak with waterfall marble countertop, integrated Wolf range and La Cornue, brass hardware, floor-to-ceiling windows, open shelving with curated ceramics, herringbone wood floors, professional yet inviting, morning light',
    metadata: { ct: 2, ml: 3, wc: 4, region: 'california_modern', materials: ['white_oak', 'marble', 'brass'] }
  },
  'KT-002': {
    quadId: 'KT-002',
    category: 'kitchens',
    enabled: true,
    title: 'Contemporary Warm',
    subtitle: 'Open Plan',
    imageCount: 4,
    description: 'Open-plan contemporary kitchen, warm minimal, white oak cabinetry with leather pulls, Calacatta marble island, integrated appliances, view to living area, brass pendant lights, single statement orchid, warm afternoon light',
    metadata: { ct: 2, ml: 2, wc: 4, region: 'california_modern', materials: ['white_oak', 'marble', 'leather'] }
  },
  'KT-003': {
    quadId: 'KT-003',
    category: 'kitchens',
    enabled: true,
    title: 'Contemporary Warm',
    subtitle: 'Catering Kitchen',
    imageCount: 4,
    description: 'Professional catering kitchen adjacent to main kitchen, stainless steel and white oak, commercial-grade equipment, abundant counter space, walk-in storage visible, highly functional yet beautifully designed, bright even lighting',
    metadata: { ct: 2, ml: 2, wc: 5, region: 'international_modern', materials: ['stainless_steel', 'white_oak', 'quartz'] }
  },
  'KT-004': {
    quadId: 'KT-004',
    category: 'kitchens',
    enabled: true,
    title: 'Contemporary Cool',
    subtitle: 'Chef Kitchen',
    imageCount: 4,
    description: 'Ultra-modern minimalist kitchen, cool palette, handleless white lacquer cabinets, Nero Marquina marble island, chrome and glass pendant lights, integrated appliances seamlessly hidden, polished concrete floor, single architectural plant, gallery-like atmosphere',
    metadata: { ct: 2, ml: 2, wc: 7, region: 'international_modern', materials: ['lacquer', 'marble', 'chrome'] }
  },
  'KT-005': {
    quadId: 'KT-005',
    category: 'kitchens',
    enabled: true,
    title: 'Contemporary Cool',
    subtitle: 'Open Plan',
    imageCount: 4,
    description: 'Cool contemporary open kitchen, sleek white cabinetry, book-matched marble backsplash, waterfall island, chrome fixtures, view to dining area through glass partition, minimalist styling, north-facing diffused light',
    metadata: { ct: 2, ml: 2, wc: 7, region: 'scandinavian', materials: ['marble', 'chrome', 'glass'] }
  },
  'KT-006': {
    quadId: 'KT-006',
    category: 'kitchens',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Chef Kitchen',
    imageCount: 4,
    description: 'Grand traditional kitchen, rich and layered, custom painted cabinetry in sage green, marble countertops with ornate edge, La Cornue range in cream, brass pot filler and hardware, butler\'s pantry visible, ceiling-mounted pot rack, antique oak island, copper pots displayed',
    metadata: { ct: 8, ml: 7, wc: 3, region: 'english_country', materials: ['painted_wood', 'marble', 'brass'] }
  },
  'KT-007': {
    quadId: 'KT-007',
    category: 'kitchens',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Open Plan',
    imageCount: 4,
    description: 'Traditional kitchen open to breakfast area, cream-colored shaker cabinetry, farmhouse sink, honed marble counters, brass bridge faucet, built-in banquette seating, pendant lanterns, window herb garden, morning light',
    metadata: { ct: 7, ml: 5, wc: 4, region: 'english_country', materials: ['painted_wood', 'marble', 'brass'] }
  },
  'KT-008': {
    quadId: 'KT-008',
    category: 'kitchens',
    enabled: true,
    title: 'Transitional',
    subtitle: 'Chef Kitchen',
    imageCount: 4,
    description: 'Transitional luxury kitchen, balanced aesthetic, rift-cut white oak cabinetry, quartz waterfall island, brushed nickel hardware, statement hood in plaster, herringbone tile backsplash, mix of open and closed storage, professional range, inviting and functional',
    metadata: { ct: 5, ml: 4, wc: 5, region: 'hamptons', materials: ['white_oak', 'quartz', 'nickel'] }
  },
  'KT-009': {
    quadId: 'KT-009',
    category: 'kitchens',
    enabled: true,
    title: 'Transitional',
    subtitle: 'Open Plan',
    imageCount: 4,
    description: 'Transitional open kitchen and family room, white painted cabinets with walnut island, quartzite countertops, comfortable seating area visible beyond, large windows, balanced traditional and modern elements, warm afternoon light',
    metadata: { ct: 5, ml: 4, wc: 5, region: 'hamptons', materials: ['painted_wood', 'walnut', 'quartzite'] }
  },

  // ============================================
  // FAMILY AREAS (FA-001 to FA-012) - 12 Quads
  // ============================================
  'FA-001': {
    quadId: 'FA-001',
    category: 'family_areas',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Family Room',
    imageCount: 4,
    description: 'Contemporary luxury family room, casual elegance, deep sectional sofa in camel leather, walnut built-in media wall with hidden TV, fireplace with bronze surround, soft wool rug, floor-to-ceiling windows to garden, afternoon light, lived-in yet refined',
    metadata: { ct: 2, ml: 4, wc: 3, region: 'california_modern', materials: ['leather', 'walnut', 'bronze'], hominess: 8 }
  },
  'FA-002': {
    quadId: 'FA-002',
    category: 'family_areas',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Media Room',
    imageCount: 4,
    description: 'Luxury home theater, contemporary design, tiered seating in charcoal velvet, acoustic wall panels in walnut, 150-inch screen recessed into wall, starlight ceiling, hidden speakers, ambient rope lighting, sophisticated cinema experience',
    metadata: { ct: 2, ml: 4, wc: 5, region: 'international_modern', materials: ['velvet', 'walnut', 'fabric'], hominess: 6 }
  },
  'FA-003': {
    quadId: 'FA-003',
    category: 'family_areas',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Game Room',
    imageCount: 4,
    description: 'Sophisticated game room, contemporary aesthetic, professional pool table with burgundy felt, leather club chairs, brass bar cart, built-in bar with backlit shelving, dartboard in walnut cabinet, card table, warm ambient lighting, masculine refinement',
    metadata: { ct: 3, ml: 5, wc: 4, region: 'international_modern', materials: ['leather', 'walnut', 'brass'], hominess: 7 }
  },
  'FA-004': {
    quadId: 'FA-004',
    category: 'family_areas',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Family Room',
    imageCount: 4,
    description: 'Traditional family room, layered comfort, tufted leather Chesterfield sofa, built-in bookcases in mahogany, fireplace with carved stone mantel, Persian rug, brass reading lamps, family photos, plaid throw pillows, roaring fire, ultimate cozy refuge',
    metadata: { ct: 7, ml: 7, wc: 3, region: 'english_country', materials: ['leather', 'mahogany', 'stone'], hominess: 9 }
  },
  'FA-005': {
    quadId: 'FA-005',
    category: 'family_areas',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Media Room',
    imageCount: 4,
    description: 'Traditional screening room, club-like atmosphere, deep leather recliners, mahogany paneled walls, coffered ceiling with concealed lighting, velvet drapes, hidden screen and speakers, brass sconces, bowl of popcorn on ottoman, sophisticated comfort',
    metadata: { ct: 7, ml: 6, wc: 3, region: 'english_traditional', materials: ['leather', 'mahogany', 'velvet'], hominess: 8 }
  },
  'FA-006': {
    quadId: 'FA-006',
    category: 'family_areas',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Home Bar',
    imageCount: 4,
    description: 'Traditional home bar and billiards room, mahogany bar with brass rail and leather stools, mirrored back bar with crystal decanters, antique billiard table, Tiffany-style pendant lights, hunting prints, worn leather armchairs, whiskey atmosphere, warm incandescent glow',
    metadata: { ct: 8, ml: 7, wc: 3, region: 'english_traditional', materials: ['mahogany', 'brass', 'leather'], hominess: 7 }
  },
  'FA-007': {
    quadId: 'FA-007',
    category: 'family_areas',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Family Room',
    imageCount: 4,
    description: 'Ultra-luxury transitional family room in a high-end residence, light and airy atmosphere, soaring ceilings with abundant natural light streaming through large windows, soft cream and warm white palette with touches of soft gray and natural linen, comfortable deep-seated modern sofa in performance fabric, light oak or white oak floors, subtle texture through boucle and soft wool, contemporary art in muted tones, organic modern coffee table, fresh greenery, relaxed California-meets-Hamptons aesthetic, family-friendly but sophisticated, cashmere throws, floor lamp with linen shade, view to manicured garden, interior design photography, Architectural Digest style, soft natural lighting',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['performance_fabric', 'white_oak', 'linen'], hominess: 8 }
  },
  'FA-008': {
    quadId: 'FA-008',
    category: 'family_areas',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Family Room',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist family room designed for young affluent family, bright and optimistic atmosphere, double-height space with dramatic contemporary art as focal point, bold accent color moment against crisp white walls, sculptural designer furniture mixing iconic pieces with comfortable modular seating, polished concrete or light terrazzo floors with plush area rug, statement lighting fixture with playful geometry, built-in media wall with hidden technology, indoor tree or oversized botanical, mix of materials including warm brass and soft leather, books and collected objects reflecting travel and culture, game or entertainment element subtly integrated, joyful yet refined energy, aspirational millennial luxury aesthetic, interior design photography, Architectural Digest style, bright natural daylight',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'international_modern', materials: ['leather', 'brass', 'terrazzo'], hominess: 7 }
  },
  'FA-009': {
    quadId: 'FA-009',
    category: 'family_areas',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Media Room',
    imageCount: 4,
    description: 'Ultra-luxury transitional media room in a high-end residence, light and inviting screening environment, soft cream walls with warm white millwork and coffered ceiling with subtle cove lighting, oversized sectional in performance linen with deep comfortable cushions, light oak built-in cabinetry concealing screen and equipment, soft wool area rug in warm neutral tones, cashmere throws and linen pillows, elegant sconces providing ambient glow, subtle blackout drapery in natural linen, curated art visible on side walls, small bar area with marble top, sophisticated but relaxed family viewing atmosphere, warm without being dark, California-meets-Hamptons aesthetic, interior design photography, Architectural Digest style, soft warm ambient lighting',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['performance_linen', 'white_oak', 'marble'], hominess: 8 }
  },
  'FA-010': {
    quadId: 'FA-010',
    category: 'family_areas',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Media Room',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist media room for young affluent family, bright optimistic approach to home cinema, crisp white walls with one bold accent color moment, low-profile modular seating in premium leather with clean lines, polished concrete or light terrazzo floor with plush shag rug, geometric acoustic panels doubling as art installation, concealed screen with architectural reveal detail, statement floor lamp with sculptural form, floating credenza with warm brass details, indoor plant adding life, popcorn machine or bar cart as playful luxury element, LED ambient lighting in warm tone, technology seamlessly integrated, joyful cinema experience without traditional dark cave aesthetic, aspirational millennial luxury, interior design photography, Architectural Digest style, dramatic but bright lighting',
    metadata: { ct: 2, ml: 3, wc: 6, region: 'international_modern', materials: ['leather', 'brass', 'terrazzo'], hominess: 6 }
  },
  'FA-011': {
    quadId: 'FA-011',
    category: 'family_areas',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Game Room',
    imageCount: 4,
    description: 'Ultra-luxury transitional game room in a high-end residence, light and airy entertainment space, soft cream and warm white palette with natural linen accents, custom billiard table with light oak or white oak frame and neutral felt, comfortable seating area with performance fabric sofas, light oak paneling or shiplap walls, large windows with garden view, elegant pendant lighting over game table, built-in bar with marble counter and open shelving displaying glassware, board game storage in beautiful cabinetry, relaxed sophistication for family entertaining, card table with upholstered chairs in corner, fresh greenery throughout, California-meets-Hamptons aesthetic, family-friendly but refined, interior design photography, Architectural Digest style, bright natural daylight',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['white_oak', 'performance_fabric', 'marble'], hominess: 8 }
  },
  'FA-012': {
    quadId: 'FA-012',
    category: 'family_areas',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Game Room',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist game room for young affluent family, bright and energetic entertainment space, crisp white walls with bold accent color on custom billiard table felt or feature wall, sculptural contemporary pool table as art piece, iconic designer seating in bold color or premium leather, polished concrete floor with graphic area rug, ping pong table or shuffleboard with modern aesthetic, statement pendant lighting with playful geometry, floating bar with integrated LED and brass details, vinyl record corner with designer audio equipment, contemporary art reflecting pop culture, arcade element reimagined as sculpture, collected objects from travel, joyful entertaining atmosphere, aspirational millennial luxury aesthetic, interior design photography, Architectural Digest style, bright dramatic daylight',
    metadata: { ct: 2, ml: 3, wc: 6, region: 'international_modern', materials: ['leather', 'brass', 'corten'], hominess: 7 }
  },

  // ============================================
  // PRIMARY BEDROOMS (PB-001 to PB-012) - 12 Quads
  // ============================================
  'PB-001': {
    quadId: 'PB-001',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Canopy + Silk',
    imageCount: 4,
    description: 'Ultra-luxury traditional primary bedroom in a grand estate, elegant four-poster or canopy bed with fine linens and silk drapery, rich color palette with deep jewel tones or warm neutrals, antique nightstands with marble tops, crystal or brass chandelier, silk wallcovering or elegant millwork, fireplace with ornate mantel, upholstered bench at foot of bed, layered window treatments with silk drapes and sheers, oriental rug over hardwood floors, collected art in gilded frames, fresh flowers on vanity, timeless European elegance, interior design photography, Architectural Digest style, soft morning light',
    metadata: { ct: 8, ml: 7, wc: 3, region: 'european_traditional', materials: ['silk', 'mahogany', 'marble'] }
  },
  'PB-002': {
    quadId: 'PB-002',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'English Country + Chintz',
    imageCount: 4,
    description: 'Ultra-luxury English country primary bedroom, romantic four-poster bed with elegant floral linens, soft chintz or botanical fabric on upholstered headboard and chairs, warm cream and rose palette with touches of sage, antique chest of drawers, brass reading lamps, fireplace with painted mantel, window seat with garden view, layered curtains with valance, needlepoint pillows, silver-framed family photos, fresh garden roses, collected porcelain, romantic but refined atmosphere, interior design photography, Architectural Digest style, soft diffused daylight',
    metadata: { ct: 7, ml: 6, wc: 3, region: 'english_country', materials: ['chintz', 'brass', 'painted_wood'] }
  },
  'PB-003': {
    quadId: 'PB-003',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'French Chateau + Toile',
    imageCount: 4,
    description: 'Ultra-luxury French chateau primary bedroom, elegant upholstered bed with carved frame, toile de Jouy fabric on walls or bed hangings, soft blue and cream or red and cream palette, Bergère chairs, crystal chandelier, marble fireplace with trumeau mirror above, French doors to balcony, parquet floors with Aubusson rug, gilded accents, antique writing desk, romantic drapery with passementerie trim, fresh peonies, refined Parisian elegance, interior design photography, Architectural Digest style, romantic morning light',
    metadata: { ct: 8, ml: 7, wc: 4, region: 'french_traditional', materials: ['toile', 'crystal', 'marble'] }
  },
  'PB-004': {
    quadId: 'PB-004',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Platform + Minimal',
    imageCount: 4,
    description: 'Ultra-luxury contemporary primary bedroom in modern residence, low platform bed with premium upholstery and fine linens, clean minimal aesthetic with warm neutrals and subtle texture, floor-to-ceiling windows with view, floating nightstands, architectural lighting integrated into design, statement art above bed, natural materials including stone and warm wood, plush area rug, reading chair in corner, hidden technology, serene spa-like atmosphere, sophisticated restraint, interior design photography, Architectural Digest style, soft natural daylight',
    metadata: { ct: 2, ml: 2, wc: 4, region: 'international_modern', materials: ['stone', 'wood', 'linen'] }
  },
  'PB-005': {
    quadId: 'PB-005',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Penthouse + City View',
    imageCount: 4,
    description: 'Ultra-luxury contemporary penthouse primary bedroom, dramatic floor-to-ceiling windows with city skyline view, elegant upholstered bed with luxurious bedding, sophisticated neutral palette with bronze or brass accents, sculptural pendant lighting, built-in millwork with integrated storage, marble or stone accent wall, contemporary fireplace, plush seating area, premium materials throughout, motorized sheer curtains, seamless indoor-outdoor connection to terrace, urban sophistication, interior design photography, Architectural Digest style, dramatic city light',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'international_modern', materials: ['marble', 'bronze', 'glass'] }
  },
  'PB-006': {
    quadId: 'PB-006',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Resort + Indoor-Outdoor',
    imageCount: 4,
    description: 'Ultra-luxury contemporary resort-style bathroom interior, seamless indoor-outdoor architecture with sliding glass walls to private tropical courtyard, natural material palette featuring travertine stone floors and teak wood accents, oversized rainfall showerhead with lush garden backdrop, organic textures throughout, mature tropical plants and palm fronds visible through glass, sheer linen drapery panels, floating double vanity with stone vessel basins, empty pristine space, interior architecture photography, Architectural Digest luxury villa, warm golden tropical daylight',
    metadata: { ct: 3, ml: 3, wc: 4, region: 'tropical_modern', materials: ['travertine', 'teak', 'linen'] }
  },
  'PB-007': {
    quadId: 'PB-007',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Soft Sanctuary',
    imageCount: 4,
    description: 'Ultra-luxury transitional primary bedroom, light and serene sanctuary, soft cream and warm white palette with touches of soft blush or pale blue, elegant upholstered bed in performance linen with beautiful bedding, light oak or white oak floors, comfortable reading nook by window, soft wool area rug, subtle texture through bouclé and cashmere, contemporary art in soft tones, brass or champagne metal accents, fresh white flowers, abundant natural light, relaxed California-meets-Hamptons elegance, family-friendly sophistication, interior design photography, Architectural Digest style, soft morning light',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['performance_linen', 'white_oak', 'cashmere'] }
  },
  'PB-008': {
    quadId: 'PB-008',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Garden View + Linen',
    imageCount: 4,
    description: 'Ultra-luxury transitional primary bedroom with garden connection, light airy atmosphere with French doors to private garden, soft neutral palette with natural linen and warm whites, elegant bed with simple upholstered headboard, light wood nightstands, soft wool rug, linen drapery filtering gentle light, comfortable chaise by window, subtle botanical prints, brass reading lamps, potted orchids, serene and inviting retreat, relaxed sophistication without being overly designed, interior design photography, Architectural Digest style, soft diffused daylight',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'california_hamptons', materials: ['linen', 'light_wood', 'brass'] }
  },
  'PB-009': {
    quadId: 'PB-009',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Coastal Calm',
    imageCount: 4,
    description: 'Ultra-luxury transitional coastal primary bedroom, light and breezy atmosphere, soft white and warm sand palette with touches of soft blue, elegant bed with slipcovered headboard in performance linen, whitewashed oak floors, natural fiber rug, ocean view through large windows, soft flowing curtains, comfortable seating area, collected shells and coral as subtle accents, contemporary coastal art, brass or nickel hardware, serene beach house elegance, interior design photography, Architectural Digest style, bright coastal light',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'coastal', materials: ['performance_linen', 'whitewashed_oak', 'nickel'] }
  },
  'PB-010': {
    quadId: 'PB-010',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Sculptural + Bold',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist primary bedroom for young affluent couple, bright optimistic atmosphere, crisp white walls with one bold accent moment in art or textiles, sculptural bed frame as design statement, premium bedding with graphic pattern or bold color accent, polished concrete or light terrazzo floors with plush rug, statement pendant lighting with geometric form, floating nightstands with brass details, large-scale contemporary art, hidden technology throughout, curated objects reflecting travel, joyful yet refined energy, aspirational millennial luxury, interior design photography, Architectural Digest style, bright natural daylight',
    metadata: { ct: 2, ml: 2, wc: 6, region: 'international_modern', materials: ['terrazzo', 'brass', 'leather'] }
  },
  'PB-011': {
    quadId: 'PB-011',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Loft + Industrial Chic',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist loft primary bedroom, bright converted warehouse aesthetic, exposed brick painted white or natural, steel frame windows with city view, sculptural platform bed with premium linens, bold accent color in art or upholstery, concrete floors with luxurious area rug, iconic designer chair, industrial pendant lighting reimagined as art, vinyl records and books as decor, indoor tree or large botanical, mix of warm brass and matte black, creative young collector energy, interior design photography, Architectural Digest style, dramatic industrial daylight',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'urban_loft', materials: ['brick', 'steel', 'concrete'] }
  },
  'PB-012': {
    quadId: 'PB-012',
    category: 'primary_bedrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Glass Pavilion',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist primary bedroom interior in glass pavilion architecture, floor-to-ceiling windows on multiple sides framing forest or meadow panorama, low platform bed with crisp white linens as architectural centerpiece, pure white palette with warm oak wood ceiling plane, minimal iconic furniture pieces with maximum negative space, seamless indoor-outdoor threshold to landscape, integrated cove lighting within architecture, premium materials with flawless execution, bold contemporary artwork on feature wall, empty pristine space, interior architecture photography, Architectural Digest luxury residence, bright panoramic natural daylight',
    metadata: { ct: 1, ml: 1, wc: 5, region: 'international_modern', materials: ['glass', 'white_oak', 'concrete'] }
  },

  // ============================================
  // PRIMARY BATHROOMS (PBT-001 to PBT-012) - 12 Quads
  // ============================================
  'PBT-001': {
    quadId: 'PBT-001',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Marble + Chandelier',
    imageCount: 4,
    description: 'Ultra-luxury traditional primary bathroom in grand estate, floor-to-ceiling marble with elegant veining, freestanding soaking tub as centerpiece, crystal chandelier, polished nickel or brass fixtures, furniture-style vanity with marble top, ornate framed mirrors, chair rail and wainscoting details, heated marble floors, elegant drapery at windows, fresh flowers in silver vase, natural light from tall windows, timeless European spa elegance, interior design photography, Architectural Digest style, soft luminous light',
    metadata: { ct: 8, ml: 7, wc: 4, region: 'european_traditional', materials: ['marble', 'crystal', 'nickel'] }
  },
  'PBT-002': {
    quadId: 'PBT-002',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'English + Freestanding Tub',
    imageCount: 4,
    description: 'Ultra-luxury English traditional primary bathroom, elegant clawfoot or pedestal tub, painted wood paneling in soft cream or sage, polished nickel fixtures, furniture vanity with marble top, framed botanical prints, sash windows with garden view, heated limestone or marble floors, wall sconces with silk shades, monogrammed towels, silver accessories, vintage-inspired elegance with modern comfort, fresh roses in crystal vase, interior design photography, Architectural Digest style, soft morning light',
    metadata: { ct: 7, ml: 6, wc: 4, region: 'english_country', materials: ['painted_wood', 'marble', 'nickel'] }
  },
  'PBT-003': {
    quadId: 'PBT-003',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'French + Gilded',
    imageCount: 4,
    description: 'Ultra-luxury French traditional primary bathroom, elegant freestanding tub with floor-mounted faucet, soft gray and white marble with gilded accents, ornate mirror with carved frame, crystal sconces, furniture-style vanity with carved legs, silk drapery, parquet or marble floors with area rug, French chair for dressing, fresh peonies, refined Parisian elegance, interior design photography, Architectural Digest style, romantic filtered light',
    metadata: { ct: 8, ml: 7, wc: 4, region: 'french_traditional', materials: ['marble', 'crystal', 'gilt'] }
  },
  'PBT-004': {
    quadId: 'PBT-004',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Spa + Floating Vanity',
    imageCount: 4,
    description: 'Ultra-luxury contemporary spa bathroom, clean minimal design with premium materials, floating double vanity with integrated sinks, floor-to-ceiling porcelain or natural stone, freestanding sculptural tub, frameless glass shower with rainfall head, warm wood accents, hidden storage, soft indirect lighting, heated floors, view to private garden or courtyard, serene neutral palette, orchid as accent, seamless sophisticated sanctuary, interior design photography, Architectural Digest style, soft natural light',
    metadata: { ct: 2, ml: 2, wc: 5, region: 'international_modern', materials: ['porcelain', 'wood', 'glass'] }
  },
  'PBT-005': {
    quadId: 'PBT-005',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Penthouse + View',
    imageCount: 4,
    description: 'Ultra-luxury contemporary penthouse bathroom interior, dramatic cityscape or ocean panorama through floor-to-ceiling glass walls, sculptural freestanding soaking tub as architectural centerpiece, floating double vanity with backlit mirror panel, large format Calacatta porcelain wall surfaces, frameless glass-enclosed shower with rainfall head, warm brushed bronze fixtures throughout, sophisticated taupe and cream palette, recessed cove lighting and pendant fixtures, minimalist styling with stone accessories, empty pristine space, interior architecture photography, Architectural Digest luxury real estate, dramatic natural light',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'international_modern', materials: ['calacatta_porcelain', 'bronze', 'glass'] }
  },
  'PBT-006': {
    quadId: 'PBT-006',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Resort + Natural',
    imageCount: 4,
    description: 'Ultra-luxury contemporary resort-style bathroom, indoor-outdoor connection with private garden shower or soaking tub on terrace, natural material palette with warm stone and wood, rain shower with nature view, organic textures, tropical plants integrated into design, soft flowing curtains, double vanity with vessel sinks, spa-like serenity, warm and inviting atmosphere, interior design photography, Architectural Digest style, golden tropical light',
    metadata: { ct: 3, ml: 3, wc: 4, region: 'tropical_modern', materials: ['stone', 'wood', 'glass'] }
  },
  'PBT-007': {
    quadId: 'PBT-007',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Soft Spa',
    imageCount: 4,
    description: 'Ultra-luxury transitional primary bathroom, light and airy spa atmosphere, soft cream and warm white palette, elegant freestanding tub, light oak or white oak vanity, soft marble with subtle veining, champagne or soft brass fixtures, abundant natural light through large windows, soft linen Roman shades, plush white towels, fresh white flowers, subtle texture in tiles and textiles, serene family-friendly elegance, interior design photography, Architectural Digest style, bright soft daylight',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'california_hamptons', materials: ['marble', 'white_oak', 'brass'] }
  },
  'PBT-008': {
    quadId: 'PBT-008',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Garden + Light Oak',
    imageCount: 4,
    description: 'Ultra-luxury transitional primary bathroom with garden connection, light and inviting atmosphere, French doors or large window to private garden, soft neutral palette with warm whites, light oak double vanity, soft veined marble, freestanding tub with garden view, polished nickel fixtures, soft Roman shades in linen, potted orchids, heated limestone floors, relaxed sophisticated spa, interior design photography, Architectural Digest style, soft natural daylight',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'california_hamptons', materials: ['marble', 'light_oak', 'nickel'] }
  },
  'PBT-009': {
    quadId: 'PBT-009',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Coastal Spa',
    imageCount: 4,
    description: 'Ultra-luxury transitional coastal primary bathroom, light and breezy spa atmosphere, soft white and sand palette with touches of pale blue, elegant freestanding tub with ocean view, whitewashed oak vanity, subtle marble or limestone, polished nickel fixtures, soft flowing curtains, natural textures in baskets and accessories, fresh feel without being overly themed, serene beach house elegance, interior design photography, Architectural Digest style, bright coastal light',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'coastal', materials: ['limestone', 'whitewashed_oak', 'nickel'] }
  },
  'PBT-010': {
    quadId: 'PBT-010',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Sculptural + Bold',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist primary bathroom for young affluent couple, bright and optimistic atmosphere, sculptural freestanding tub as art piece, bold accent color in tile or art against crisp white, floating vanity with integrated lighting, large format porcelain with dramatic veining, statement mirror with geometric form, brass or matte black fixtures, terrazzo or polished concrete floor detail, hidden technology, graphic pattern moment, playful yet sophisticated, interior design photography, Architectural Digest style, bright dramatic light',
    metadata: { ct: 2, ml: 2, wc: 6, region: 'international_modern', materials: ['porcelain', 'brass', 'terrazzo'] }
  },
  'PBT-011': {
    quadId: 'PBT-011',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Industrial Loft',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist loft bathroom, bright converted warehouse aesthetic, crittall-style shower enclosure, sculptural vessel tub, exposed brick painted white, concrete vanity with integrated sink, bold contemporary art, industrial fixtures reimagined in brass, large pivot mirror, graphic black and white floor tile, iconic design accessories, creative young collector energy, interior design photography, Architectural Digest style, dramatic industrial light',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'urban_loft', materials: ['concrete', 'brass', 'crittall'] }
  },
  'PBT-012': {
    quadId: 'PBT-012',
    category: 'primary_bathrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Glass + Nature',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist master suite interior within glass pavilion architecture, floor-to-ceiling glazing on three sides framing serene forest landscape, low upholstered platform with white linen layers as room centerpiece, pure white walls with warm oak timber ceiling, sparse iconic furniture arrangement with expansive negative space, frameless glass walls opening to nature, architectural cove lighting integrated into ceiling detail, polished concrete or white oak flooring, single large-scale abstract canvas on solid wall, unoccupied architectural interior, real estate photography, Architectural Digest modern residence feature, bright diffused natural daylight',
    metadata: { ct: 1, ml: 1, wc: 5, region: 'international_modern', materials: ['glass', 'white_oak', 'concrete'] }
  },

  // ============================================
  // GUEST BEDROOMS (GB-001 to GB-008) - 8 Quads
  // ============================================
  'GB-001': {
    quadId: 'GB-001',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'Four-Poster + Classic',
    imageCount: 4,
    description: 'Ultra-luxury traditional guest bedroom in estate home, elegant four-poster or canopy bed with fine linens, welcoming warm color palette, antique furniture pieces, reading chair with ottoman, brass table lamps, collected art and objects, fresh flowers, fireplace if space allows, thoughtful guest amenities, sense of being in a boutique hotel, timeless elegance with personal touches, interior design photography, Architectural Digest style, soft welcoming light',
    metadata: { ct: 8, ml: 6, wc: 3, region: 'european_traditional', materials: ['wood', 'linen', 'brass'] }
  },
  'GB-002': {
    quadId: 'GB-002',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Traditional',
    subtitle: 'English Garden + Twin Beds',
    imageCount: 4,
    description: 'Ultra-luxury English traditional guest bedroom, elegant twin beds with upholstered headboards and beautiful linens, soft floral or botanical fabrics, warm cream and sage or blue palette, antique chest between beds, reading lamps, comfortable armchair, garden view through sash windows, framed botanicals on walls, fresh garden flowers, welcoming country house elegance, interior design photography, Architectural Digest style, soft morning light',
    metadata: { ct: 7, ml: 5, wc: 4, region: 'english_country', materials: ['painted_wood', 'botanical_fabric', 'brass'] }
  },
  'GB-003': {
    quadId: 'GB-003',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'Boutique Hotel + Streamlined',
    imageCount: 4,
    description: 'Ultra-luxury contemporary guest bedroom, boutique hotel-inspired design, elegant upholstered bed with premium linens, sophisticated neutral palette with subtle accent, streamlined furniture with warm wood, built-in nightstands with integrated lighting, desk area for working guests, comfortable reading chair, contemporary art, thoughtful amenities, floor-to-ceiling windows, serene and stylish, interior design photography, Architectural Digest style, soft natural light',
    metadata: { ct: 3, ml: 3, wc: 5, region: 'international_modern', materials: ['wood', 'linen', 'brass'] }
  },
  'GB-004': {
    quadId: 'GB-004',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Contemporary',
    subtitle: 'View + Minimal',
    imageCount: 4,
    description: 'Ultra-luxury contemporary guest bedroom with dramatic view, floor-to-ceiling windows as focal point, elegant platform bed with fine linens, minimal furniture letting view dominate, warm neutral palette with texture, floating nightstands, subtle lighting design, comfortable seating, sense of retreat and escape, sophisticated simplicity, interior design photography, Architectural Digest style, dramatic natural light',
    metadata: { ct: 2, ml: 2, wc: 5, region: 'international_modern', materials: ['wood', 'linen', 'glass'] }
  },
  'GB-005': {
    quadId: 'GB-005',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Welcoming + Soft',
    imageCount: 4,
    description: 'Ultra-luxury transitional guest bedroom, light and welcoming atmosphere, soft cream and warm white palette with blush or blue accent, elegant upholstered bed with beautiful bedding, light oak furniture, comfortable reading chair, soft wool rug, abundant natural light, fresh flowers, thoughtful guest amenities, relaxed sophistication, California-meets-Hamptons elegance, interior design photography, Architectural Digest style, soft inviting daylight',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['light_oak', 'linen', 'brass'] }
  },
  'GB-006': {
    quadId: 'GB-006',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Transitional Light',
    subtitle: 'Garden Suite + Linen',
    imageCount: 4,
    description: 'Ultra-luxury transitional guest suite with garden access, light and airy atmosphere, French doors to private patio, soft neutral palette with natural linen, comfortable bed with slipcovered headboard, writing desk by window, light wood floors, soft flowing curtains, potted plants, sense of private retreat within the home, welcoming relaxed elegance, interior design photography, Architectural Digest style, bright garden light',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'california_hamptons', materials: ['light_wood', 'linen', 'brass'] }
  },
  'GB-007': {
    quadId: 'GB-007',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Bold Art + Fun',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist guest bedroom for creative home, bright and optimistic atmosphere, crisp white walls with bold contemporary art as focal point, sculptural bed with graphic bedding, fun accent color moment, iconic designer chair, floating desk with brass details, books and objects reflecting host\'s interests, sense of staying in a collector\'s home, playful yet refined, aspirational young luxury, interior design photography, Architectural Digest style, bright dramatic daylight',
    metadata: { ct: 2, ml: 3, wc: 6, region: 'international_modern', materials: ['wood', 'brass', 'leather'] }
  },
  'GB-008': {
    quadId: 'GB-008',
    category: 'guest_bedrooms',
    enabled: true,
    title: 'Modern Minimalist',
    subtitle: 'Loft + Urban',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist loft guest bedroom, bright urban aesthetic, large steel windows with city view, platform bed with premium linens, exposed architectural elements painted white, bold art or photography, warm brass and black accents, comfortable seating, vinyl records or books as decor, sense of staying in creative friend\'s stylish loft, young collector energy, interior design photography, Architectural Digest style, industrial daylight',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'urban_loft', materials: ['steel', 'brick', 'brass'] }
  },

  // ============================================
  // EXTERIOR LANDSCAPE (EL-001 to EL-016) - 16 Quads
  // ============================================
  'EL-001': {
    quadId: 'EL-001',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Traditional Landscape',
    subtitle: 'Formal Garden + Parterre',
    imageCount: 4,
    description: 'Ultra-luxury traditional formal garden in grand estate, classic parterre design with clipped boxwood hedges, gravel pathways, central fountain or sculpture, symmetrical layout, manicured lawn panels, stone balustrade, mature trees framing view, rose garden visible, classic urns with seasonal plantings, European estate elegance, interior design photography, Architectural Digest style, soft golden hour light',
    metadata: { ct: 8, ml: 6, wc: 4, region: 'european_estate', materials: ['boxwood', 'gravel', 'stone'] }
  },
  'EL-002': {
    quadId: 'EL-002',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Traditional Landscape',
    subtitle: 'English Country + Perennial Border',
    imageCount: 4,
    description: 'Ultra-luxury English country garden, romantic perennial borders with layered plantings, winding stone pathways, ancient trees providing dappled shade, clipped hedges creating garden rooms, climbing roses on stone walls, wooden garden bench, ornamental pond or fountain, cutting garden visible, wildflower meadow in distance, timeless romantic elegance, interior design photography, Architectural Digest style, soft afternoon light',
    metadata: { ct: 7, ml: 6, wc: 3, region: 'english_country', materials: ['stone', 'perennials', 'hedging'] }
  },
  'EL-003': {
    quadId: 'EL-003',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Traditional Landscape',
    subtitle: 'Mediterranean + Cypress',
    imageCount: 4,
    description: 'Ultra-luxury Mediterranean formal garden, Italian cypress avenue or allée, gravel courtyard with central fountain, terracotta pots with citrus and lavender, stone walls with aged patina, olive trees, formal hedging in geometric patterns, pergola with climbing bougainvillea, views to rolling hills or sea, Tuscan or Provençal elegance, interior design photography, Architectural Digest style, warm golden light',
    metadata: { ct: 7, ml: 5, wc: 3, region: 'mediterranean', materials: ['gravel', 'terracotta', 'cypress'] }
  },
  'EL-004': {
    quadId: 'EL-004',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Traditional Landscape',
    subtitle: 'Estate Entry + Allee',
    imageCount: 4,
    description: 'Ultra-luxury traditional estate entry drive, formal allée of mature trees lining approach, manicured lawns, stone or brick pillars at entry, glimpse of grand house in distance, seasonal color in borders, classic estate fencing, sense of arrival and anticipation, timeless American or European estate elegance, interior design photography, Architectural Digest style, dappled afternoon light',
    metadata: { ct: 7, ml: 5, wc: 4, region: 'american_estate', materials: ['stone', 'brick', 'mature_trees'] }
  },
  'EL-005': {
    quadId: 'EL-005',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Contemporary Landscape',
    subtitle: 'Infinity Edge + View',
    imageCount: 4,
    description: 'Ultra-luxury contemporary landscape with infinity pool, seamless edge merging with ocean or valley view, clean architectural lines, large format stone or concrete paving, sculptural plantings in geometric beds, mature olive trees or ornamental grasses, fire feature, outdoor sculpture, minimal palette with maximum impact, sophisticated modern living, interior design photography, Architectural Digest style, dramatic golden hour light',
    metadata: { ct: 2, ml: 2, wc: 5, region: 'california_modern', materials: ['concrete', 'stone', 'ornamental_grasses'] }
  },
  'EL-006': {
    quadId: 'EL-006',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Contemporary Landscape',
    subtitle: 'Desert Modern + Sculpture',
    imageCount: 4,
    description: 'Ultra-luxury contemporary desert landscape, native plantings including agave, cacti, and desert grasses, sculptural boulders, gravel and decomposed granite, infinity pool with mountain view, modern fire pit, architectural concrete walls, mature palo verde or mesquite trees, outdoor sculpture as focal point, sophisticated desert modernism, interior design photography, Architectural Digest style, warm desert light',
    metadata: { ct: 2, ml: 2, wc: 4, region: 'desert_modern', materials: ['decomposed_granite', 'corten', 'native_plants'] }
  },
  'EL-007': {
    quadId: 'EL-007',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Contemporary Landscape',
    subtitle: 'Minimalist + Reflecting Pool',
    imageCount: 4,
    description: 'Ultra-luxury contemporary minimalist landscape, formal reflecting pool as centerpiece, clean lines and geometric forms, large format paving, clipped hedges as living architecture, single specimen tree as sculpture, subtle lighting integrated into design, restrained plant palette with maximum impact, sophisticated architectural garden, interior design photography, Architectural Digest style, soft even light',
    metadata: { ct: 1, ml: 1, wc: 5, region: 'international_modern', materials: ['concrete', 'water', 'specimen_tree'] }
  },
  'EL-008': {
    quadId: 'EL-008',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Contemporary Landscape',
    subtitle: 'Tropical Modern + Privacy',
    imageCount: 4,
    description: 'Ultra-luxury contemporary tropical landscape, lush layered plantings creating privacy, modern pool with clean edges, mature palms and tropical trees, architectural plants including bird of paradise and philodendron, stone or timber deck, outdoor shower, resort-like atmosphere with residential intimacy, sophisticated tropical modernism, interior design photography, Architectural Digest style, dappled tropical light',
    metadata: { ct: 3, ml: 4, wc: 4, region: 'tropical_modern', materials: ['stone', 'timber', 'tropical_plants'] }
  },
  'EL-009': {
    quadId: 'EL-009',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Transitional Light Landscape',
    subtitle: 'California + Olive Grove',
    imageCount: 4,
    description: 'Ultra-luxury transitional California landscape, light and airy atmosphere, mature olive trees in gravel garden, soft ornamental grasses, lavender borders, pale stone paving, pool with subtle edge detail, comfortable outdoor seating areas, rose garden, relaxed Mediterranean-California elegance, family-friendly sophistication, interior design photography, Architectural Digest style, bright soft daylight',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_mediterranean', materials: ['gravel', 'olive', 'lavender'] }
  },
  'EL-010': {
    quadId: 'EL-010',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Transitional Light Landscape',
    subtitle: 'Hamptons + Lawn',
    imageCount: 4,
    description: 'Ultra-luxury transitional Hamptons landscape, light and welcoming atmosphere, pristine manicured lawn, white hydrangea borders, privet hedging for privacy, classic pool with bluestone coping, mature shade trees, cutting garden, gravel pathways, comfortable outdoor dining area visible, relaxed East Coast elegance, interior design photography, Architectural Digest style, soft summer light',
    metadata: { ct: 5, ml: 4, wc: 4, region: 'hamptons', materials: ['bluestone', 'hydrangea', 'privet'] }
  },
  'EL-011': {
    quadId: 'EL-011',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Transitional Light Landscape',
    subtitle: 'Coastal + Native',
    imageCount: 4,
    description: 'Ultra-luxury transitional coastal landscape, light and natural atmosphere, native coastal plantings, ornamental grasses moving in breeze, dune-inspired design, boardwalk pathways, pool integrated into landscape, ocean glimpses, weathered wood elements, relaxed beach elegance without being overly themed, interior design photography, Architectural Digest style, bright coastal light',
    metadata: { ct: 4, ml: 3, wc: 4, region: 'coastal', materials: ['boardwalk', 'native_grasses', 'dune_plants'] }
  },
  'EL-012': {
    quadId: 'EL-012',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Transitional Light Landscape',
    subtitle: 'Garden Room + Entertaining',
    imageCount: 4,
    description: 'Ultra-luxury transitional garden designed for entertaining, light welcoming atmosphere, series of outdoor rooms defined by hedging and plantings, dining terrace, lounge area around fire pit, pool and pool house, cutting garden, herb garden near outdoor kitchen, specimen trees for shade, family-friendly flow, relaxed sophisticated elegance, interior design photography, Architectural Digest style, soft golden hour light',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['stone', 'hedging', 'specimen_trees'] }
  },
  'EL-013': {
    quadId: 'EL-013',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Modern Minimalist Landscape',
    subtitle: 'Rooftop + Urban',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist rooftop garden, bright urban oasis, clean planters with architectural grasses and bamboo, city skyline views, sleek decking, built-in seating with bold cushions, fire feature, lap pool or hot tub, outdoor bar area, integrated lighting for night use, contemporary sculpture, playful yet sophisticated, aspirational urban living, interior design photography, Architectural Digest style, bright dramatic daylight',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'urban_modern', materials: ['decking', 'planters', 'grasses'] }
  },
  'EL-014': {
    quadId: 'EL-014',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Modern Minimalist Landscape',
    subtitle: 'Geometric + Pool',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist landscape, bright and graphic atmosphere, geometric pool with bold tile or color accent, large format concrete paving, ornamental grasses in Corten steel planters, mature multi-trunk tree as sculpture, outdoor daybed with bold fabric, fire pit with clean lines, contemporary art integrated into garden, playful modern elegance, interior design photography, Architectural Digest style, bright dramatic light',
    metadata: { ct: 2, ml: 2, wc: 5, region: 'international_modern', materials: ['concrete', 'corten', 'ornamental_grasses'] }
  },
  'EL-015': {
    quadId: 'EL-015',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Modern Minimalist Landscape',
    subtitle: 'Indoor-Outdoor + Courtyard',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist courtyard garden, bright and optimistic atmosphere, seamless indoor-outdoor connection, architectural water feature, single specimen tree in gravel, large format paving, built-in planters with sculptural succulents, glass walls of house visible, outdoor dining for entertaining, clean lines with warm materials, aspirational modern living, interior design photography, Architectural Digest style, bright courtyard light',
    metadata: { ct: 2, ml: 2, wc: 5, region: 'international_modern', materials: ['concrete', 'glass', 'specimen_tree'] }
  },
  'EL-016': {
    quadId: 'EL-016',
    category: 'exterior_landscape',
    enabled: true,
    title: 'Modern Minimalist Landscape',
    subtitle: 'Party + Entertainment',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist entertainment landscape for young affluent family, bright and energetic atmosphere, pool with integrated spa and sun shelf, outdoor kitchen and bar with bold accent, fire pit lounge, lawn for games, DJ booth or outdoor sound system integrated, string lights or modern festoon lighting, bold outdoor furniture, sense of sophisticated fun, aspirational millennial luxury, interior design photography, Architectural Digest style, golden hour party light',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'california_modern', materials: ['concrete', 'fire', 'string_lights'] }
  },

  // ============================================
  // OUTDOOR LIVING (OL-001 to OL-008) - 8 Quads
  // ============================================
  'OL-001': {
    quadId: 'OL-001',
    category: 'outdoor_living',
    enabled: true,
    title: 'Traditional Outdoor Living',
    subtitle: 'Covered Loggia + Fireplace',
    imageCount: 4,
    description: 'Ultra-luxury traditional covered loggia, elegant outdoor living room with stone fireplace, comfortable upholstered seating with outdoor fabrics, antique or classic furniture pieces, coffered ceiling with chandelier or lanterns, stone floors with outdoor rugs, view to formal garden, potted plants and fresh flowers, sense of European villa elegance, interior design photography, Architectural Digest style, soft ambient light',
    metadata: { ct: 8, ml: 6, wc: 3, region: 'european_villa', materials: ['stone', 'outdoor_fabric', 'iron'] }
  },
  'OL-002': {
    quadId: 'OL-002',
    category: 'outdoor_living',
    enabled: true,
    title: 'Traditional Outdoor Living',
    subtitle: 'Garden Terrace + Dining',
    imageCount: 4,
    description: 'Ultra-luxury traditional garden terrace for outdoor dining, elegant stone terrace with balustrade, formal dining table set for entertaining, lantern chandelier above, comfortable seating area adjacent, view to parterre garden, climbing roses on pergola, classic urns with plantings, candles and silver ready for evening, timeless elegance, interior design photography, Architectural Digest style, golden hour light',
    metadata: { ct: 7, ml: 6, wc: 3, region: 'european_villa', materials: ['stone', 'iron', 'linen'] }
  },
  'OL-003': {
    quadId: 'OL-003',
    category: 'outdoor_living',
    enabled: true,
    title: 'Contemporary Outdoor Living',
    subtitle: 'Pavilion + Lounge',
    imageCount: 4,
    description: 'Ultra-luxury contemporary outdoor pavilion, architectural roof structure providing shade, comfortable modular seating, fire feature as focal point, view to infinity pool and beyond, clean lines with warm materials, integrated lighting, outdoor kitchen or bar adjacent, seamless indoor-outdoor living, sophisticated modern entertaining, interior design photography, Architectural Digest style, dramatic golden hour light',
    metadata: { ct: 2, ml: 3, wc: 4, region: 'california_modern', materials: ['concrete', 'wood', 'outdoor_fabric'] }
  },
  'OL-004': {
    quadId: 'OL-004',
    category: 'outdoor_living',
    enabled: true,
    title: 'Contemporary Outdoor Living',
    subtitle: 'Rooftop + City',
    imageCount: 4,
    description: 'Ultra-luxury contemporary rooftop outdoor living space, dramatic city skyline as backdrop, comfortable seating arranged for conversation, fire table, integrated planters with grasses, built-in bar or kitchen, retractable shade structure, dramatic pendant lighting, sophisticated urban entertaining, interior design photography, Architectural Digest style, dramatic dusk light with city lights',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'urban_modern', materials: ['steel', 'glass', 'outdoor_fabric'] }
  },
  'OL-005': {
    quadId: 'OL-005',
    category: 'outdoor_living',
    enabled: true,
    title: 'Transitional Light Outdoor Living',
    subtitle: 'Covered Porch + Comfort',
    imageCount: 4,
    description: 'Ultra-luxury transitional covered porch, light and welcoming outdoor living room, soft neutral palette with natural performance fabrics, comfortable deep seating, light wood ceiling with fans, stone fireplace or fire table, soft outdoor rug, garden view, potted plants and fresh flowers, relaxed California-meets-Hamptons elegance, family-friendly sophistication, interior design photography, Architectural Digest style, soft diffused daylight',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'california_hamptons', materials: ['wood', 'stone', 'performance_fabric'] }
  },
  'OL-006': {
    quadId: 'OL-006',
    category: 'outdoor_living',
    enabled: true,
    title: 'Transitional Light Outdoor Living',
    subtitle: 'Pool House + Entertaining',
    imageCount: 4,
    description: 'Ultra-luxury transitional pool house and terrace, light airy atmosphere, covered outdoor kitchen and dining, comfortable lounge seating, pool adjacent, soft neutral palette with blue accents, light oak or teak furniture, linen cushions, lantern lighting, bar for entertaining, relaxed sophisticated atmosphere for family and guests, interior design photography, Architectural Digest style, bright summer light',
    metadata: { ct: 4, ml: 4, wc: 4, region: 'hamptons', materials: ['shingle', 'teak', 'linen'] }
  },
  'OL-007': {
    quadId: 'OL-007',
    category: 'outdoor_living',
    enabled: true,
    title: 'Modern Minimalist Outdoor Living',
    subtitle: 'Bold + Party',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist outdoor living for entertaining, bright and energetic atmosphere, bold accent color in cushions or umbrellas, sculptural furniture, fire pit lounge, outdoor bar with integrated sound, pool visible, string lights creating festive atmosphere, contemporary outdoor art, sense of sophisticated fun, playful millennial luxury, interior design photography, Architectural Digest style, golden hour party light',
    metadata: { ct: 2, ml: 3, wc: 5, region: 'california_modern', materials: ['concrete', 'fabric', 'fire'] }
  },
  'OL-008': {
    quadId: 'OL-008',
    category: 'outdoor_living',
    enabled: true,
    title: 'Modern Minimalist Outdoor Living',
    subtitle: 'Daybed + Resort',
    imageCount: 4,
    description: 'Ultra-luxury modern minimalist outdoor living with resort atmosphere, bright optimistic design, oversized daybed or outdoor bed as focal point, bold graphic textiles, sculptural shade structure, plunge pool adjacent, tropical plants, outdoor shower, curated objects and books, sense of permanent vacation, aspirational young luxury lifestyle, interior design photography, Architectural Digest style, bright tropical light',
    metadata: { ct: 3, ml: 3, wc: 4, region: 'tropical_modern', materials: ['teak', 'linen', 'tropical_plants'] }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getQuadsByCategory = (categoryId: string): TasteQuad[] => {
  return Object.values(quads)
    .filter(q => q.category === categoryId)
    .sort((a, b) => a.quadId.localeCompare(b.quadId));
};

export const getEnabledQuads = (visibility?: Record<string, boolean>): TasteQuad[] => {
  const orderedQuads: TasteQuad[] = [];
  categoryOrder.forEach(categoryId => {
    const categoryQuads = Object.values(quads)
      .filter(q => q.category === categoryId)
      .filter(q => visibility ? visibility[q.quadId] !== false : q.enabled)
      .sort((a, b) => a.quadId.localeCompare(b.quadId));
    orderedQuads.push(...categoryQuads);
  });
  return orderedQuads;
};

export const getCategoryForQuad = (quadId: string): TasteCategory | undefined => {
  const quad = quads[quadId];
  return quad ? categories[quad.category] : undefined;
};

export const getOrderedCategories = (): TasteCategory[] => {
  return categoryOrder.map(id => categories[id]);
};

export const getLibraryStats = () => {
  const allQuads = Object.values(quads);
  return {
    totalCategories: categoryOrder.length,
    totalQuads: allQuads.length,
    totalImages: allQuads.reduce((sum, q) => sum + q.imageCount, 0),
    byCategory: categoryOrder.map(catId => ({
      category: categories[catId],
      quadCount: allQuads.filter(q => q.category === catId).length,
      imageCount: allQuads.filter(q => q.category === catId).reduce((sum, q) => sum + q.imageCount, 0)
    }))
  };
};

// Search quads by description keywords
export const searchQuads = (searchTerms: string[]): TasteQuad[] => {
  const lowerTerms = searchTerms.map(t => t.toLowerCase());
  return Object.values(quads).filter(quad => {
    const searchText = `${quad.title} ${quad.subtitle} ${quad.description || ''} ${quad.metadata.materials?.join(' ') || ''} ${quad.metadata.region || ''}`.toLowerCase();
    return lowerTerms.some(term => searchText.includes(term));
  });
};

// Get quads by style characteristics
export const getQuadsByStyle = (options: {
  ctMin?: number;
  ctMax?: number;
  wcMin?: number;
  wcMax?: number;
  region?: string;
  material?: string;
}): TasteQuad[] => {
  return Object.values(quads).filter(quad => {
    const { ct, wc, region, materials } = quad.metadata;
    if (options.ctMin !== undefined && ct < options.ctMin) return false;
    if (options.ctMax !== undefined && ct > options.ctMax) return false;
    if (options.wcMin !== undefined && wc < options.wcMin) return false;
    if (options.wcMax !== undefined && wc > options.wcMax) return false;
    if (options.region && region !== options.region) return false;
    if (options.material && materials && !materials.includes(options.material)) return false;
    return true;
  });
};

export default { categories, categoryOrder, quads };
