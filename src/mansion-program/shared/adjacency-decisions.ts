/**
 * Adjacency Decisions Library
 * 
 * Defines key relationship decisions that clients personalize.
 * Each decision represents a meaningful choice about how spaces connect.
 * 
 * @module adjacency-decisions
 */

import type { AdjacencyType } from './schema';

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  targetSpace: string;
  relationship: AdjacencyType;
  isDefault: boolean;           // Default in baseline preset
  warnings: string[];           // Red flags if this option chosen
  sfImpact?: number;            // Additional SF required
  bridgeRequired?: string;      // Bridge that must be enabled
  triggerConditions: string[];  // KYC conditions that suggest this option
}

export interface AdjacencyDecision {
  id: string;
  title: string;
  question: string;
  context: string;              // Why this decision matters
  primarySpace: string;         // The space being positioned
  icon: string;                 // Lucide icon name
  options: DecisionOption[];
  applicablePresets: ('5k' | '10k' | '15k' | '20k')[];
  kycFields: string[];          // Which KYC fields influence this
  priority: number;             // Display order (1 = highest)
}

export interface PersonalizationChoice {
  decisionId: string;
  selectedOptionId: string;
  isDefault: boolean;
  warnings: string[];
}

export interface PersonalizationResult {
  choices: PersonalizationChoice[];
  totalSfImpact: number;
  requiredBridges: string[];
  warningCount: number;
  redFlagCount: number;
}

// ============================================================================
// DECISION DEFINITIONS
// ============================================================================

export const ADJACENCY_DECISIONS: AdjacencyDecision[] = [
  
  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 1: Home Office Location
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'office-location',
    title: 'Home Office Location',
    question: 'Where should your home office connect?',
    context: 'Office placement affects both your productivity and your household\'s daily flow. Consider who visits and when you work.',
    primarySpace: 'OFF',
    icon: 'Briefcase',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['workFromHome', 'clientMeetingsAtHome', 'childrenCount'],
    priority: 1,
    options: [
      {
        id: 'off-entry',
        label: 'Near Entry (Front of House)',
        description: 'Professional separation. Clients enter without seeing private areas. Best for executive home offices.',
        targetSpace: 'FOY',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'clientMeetingsAtHome === true',
          'workFromHome === "executive"',
          'workFromHome === "primary"'
        ]
      },
      {
        id: 'off-family',
        label: 'Near Family Room',
        description: 'Stay connected to household activities. Supervise children while working. Casual work style.',
        targetSpace: 'FR',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Acoustic conflict: Family room noise may disrupt video calls',
          'Privacy concern: Work visible to household members'
        ],
        triggerConditions: [
          'childrenCount > 0',
          'workFromHome === "occasional"'
        ]
      },
      {
        id: 'off-primary',
        label: 'Near Primary Suite',
        description: 'Maximum privacy and quiet. Early morning or late night work without disturbing household.',
        targetSpace: 'PRIHALL',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Circulation conflict: Clients would need to enter private zone',
          'Separation concern: May feel isolated from family'
        ],
        triggerConditions: [
          'clientMeetingsAtHome === false',
          'privacyPreference === "sanctuary"'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 2: Kitchen-Family Connection
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'kitchen-family',
    title: 'Kitchen & Family Room Connection',
    question: 'How should your kitchen relate to family living spaces?',
    context: 'This defines the heart of your home. Open plans maximize togetherness; separation allows focused cooking and reduces noise.',
    primarySpace: 'KIT',
    icon: 'ChefHat',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['cookingStyle', 'primaryCook', 'staffingPreference', 'entertainingFrequency'],
    priority: 2,
    options: [
      {
        id: 'kit-open',
        label: 'Open to Family Room',
        description: 'Modern open plan. Cook while engaging with family. Clear sightlines throughout.',
        targetSpace: 'FR',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'cookingStyle === "enthusiast"',
          'cookingStyle === "casual"',
          'primaryCook === "family"'
        ]
      },
      {
        id: 'kit-semi',
        label: 'Connected but Defined',
        description: 'Visual connection with partial separation. Island or half-wall defines spaces while maintaining openness.',
        targetSpace: 'FR',
        relationship: 'N',
        isDefault: false,
        warnings: [],
        triggerConditions: [
          'privacyPreference === "selective"',
          'entertainingFrequency === "frequently"'
        ]
      },
      {
        id: 'kit-separate',
        label: 'Separate Kitchen',
        description: 'Traditional separation. Staff can work unseen. Formal entertaining without kitchen visibility.',
        targetSpace: 'FR',
        relationship: 'B',
        isDefault: false,
        warnings: [
          'Lifestyle impact: May feel disconnected from family activities',
          'Supervision concern: Cannot see children from kitchen'
        ],
        bridgeRequired: 'butlerPantry',
        triggerConditions: [
          'staffingPreference === "full_service"',
          'staffingPreference === "estate"',
          'primaryCook === "staff"'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 3: Media Room Acoustics
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'media-acoustics',
    title: 'Media Room Placement',
    question: 'How should your media room relate to sleeping areas?',
    context: 'Late-night movie watching requires acoustic separation from bedrooms. Consider who uses the media room and when.',
    primarySpace: 'MEDIA',
    icon: 'Tv',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['lateNightMediaUse', 'childrenCount', 'entertainingFrequency'],
    priority: 3,
    options: [
      {
        id: 'media-family-zone',
        label: 'Part of Family Zone',
        description: 'Easy access from family room. Shared use by all household members. No late-night use expected.',
        targetSpace: 'FR',
        relationship: 'N',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'lateNightMediaUse === false',
          'childrenCount > 0'
        ]
      },
      {
        id: 'media-isolated',
        label: 'Acoustically Isolated',
        description: 'Sound lock vestibule between media and sleeping areas. Full theater experience without disturbing others.',
        targetSpace: 'PRI',
        relationship: 'S',
        isDefault: false,
        warnings: [],
        sfImpact: 60,
        bridgeRequired: 'soundLock',
        triggerConditions: [
          'lateNightMediaUse === true'
        ]
      },
      {
        id: 'media-basement',
        label: 'Basement Location',
        description: 'Natural sound isolation. Dedicated entertainment level. Premium theater experience.',
        targetSpace: 'STAIR',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Accessibility: Requires stairs for every use',
          'Integration: Separated from main living flow'
        ],
        triggerConditions: [
          'hasBasement === true'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 4: Guest Suite Independence
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'guest-independence',
    title: 'Guest Suite Relationship',
    question: 'How independent should your guest suite be?',
    context: 'Extended family visits benefit from independence. Occasional guests may prefer connection to family life.',
    primarySpace: 'GSL1',
    icon: 'Users',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['guestStayFrequency', 'typicalGuestStayDuration', 'multiGenerationalHosting', 'elderlyResidents'],
    priority: 4,
    options: [
      {
        id: 'guest-independent',
        label: 'Fully Independent',
        description: 'Separate entry option. Own kitchenette. Complete autonomy for extended stays.',
        targetSpace: 'FOY',
        relationship: 'S',
        isDefault: false,
        warnings: [],
        sfImpact: 150,
        bridgeRequired: 'guestAutonomy',
        triggerConditions: [
          'guestStayFrequency === "frequently"',
          'typicalGuestStayDuration === "extended"',
          'typicalGuestStayDuration === "week"',
          'multiGenerationalHosting === true'
        ]
      },
      {
        id: 'guest-connected',
        label: 'Connected to Family Areas',
        description: 'Part of main house flow. Shared amenities. Guests feel included in family life.',
        targetSpace: 'FR',
        relationship: 'N',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'guestStayFrequency === "occasionally"',
          'guestStayFrequency === "rarely"'
        ]
      },
      {
        id: 'guest-near-primary',
        label: 'Near Primary Suite',
        description: 'Close proximity for elderly parents or young guests needing attention.',
        targetSpace: 'PRIHALL',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Privacy impact: Guest activity within private zone',
          'Noise concern: Less separation from your sleeping area'
        ],
        triggerConditions: [
          'elderlyResidents === true'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 5: Primary Suite Privacy
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'primary-privacy',
    title: 'Primary Suite Privacy',
    question: 'How separated should your primary suite be from household activity?',
    context: 'Your private retreat. Balance accessibility with sanctuary.',
    primarySpace: 'PRI',
    icon: 'BedDouble',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['privacyPreference', 'childrenCount', 'numberOfLevels'],
    priority: 5,
    options: [
      {
        id: 'pri-separate-level',
        label: 'Separate Level',
        description: 'Primary suite on its own floor. Maximum privacy and acoustic separation.',
        targetSpace: 'STAIR',
        relationship: 'N',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'numberOfLevels >= 2',
          'privacyPreference === "sanctuary"',
          'privacyPreference === "formal"'
        ]
      },
      {
        id: 'pri-wing',
        label: 'Dedicated Wing',
        description: 'Same level but separate wing. Good privacy with single-floor living option.',
        targetSpace: 'FR',
        relationship: 'B',
        isDefault: false,
        warnings: [],
        triggerConditions: [
          'numberOfLevels === 1',
          'mobilityConsiderations === true'
        ]
      },
      {
        id: 'pri-connected',
        label: 'Connected to Family',
        description: 'Close to children\'s rooms. Easy nighttime access for young families.',
        targetSpace: 'FR',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Privacy reduced: More household traffic near suite',
          'Acoustic impact: Less buffer from family activities'
        ],
        triggerConditions: [
          'childrenCount > 0',
          'childrenAges includes young children'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 6: Dining Formality
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'dining-formality',
    title: 'Dining Room Relationship',
    question: 'How formal should your dining experience be?',
    context: 'Formal entertaining benefits from separation. Casual families prefer open connection.',
    primarySpace: 'DR',
    icon: 'Wine',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['formalDiningImportance', 'entertainingFrequency', 'typicalScale', 'staffingPreference'],
    priority: 6,
    options: [
      {
        id: 'dr-formal',
        label: 'Formal Separation',
        description: 'Dedicated dining room near entry. Impressive arrival sequence for guests. Butler pantry service.',
        targetSpace: 'FOY',
        relationship: 'N',
        isDefault: false,
        warnings: [],
        bridgeRequired: 'butlerPantry',
        triggerConditions: [
          'formalDiningImportance >= 4',
          'entertainingFrequency === "frequently"',
          'typicalScale === "grand"'
        ]
      },
      {
        id: 'dr-great-room',
        label: 'Part of Great Room',
        description: 'Open to living areas. Flexible space for various occasions. Modern casual elegance.',
        targetSpace: 'GR',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'formalDiningImportance <= 3',
          'entertainingFrequency === "occasionally"'
        ]
      },
      {
        id: 'dr-kitchen',
        label: 'Kitchen Adjacent',
        description: 'Direct kitchen connection. Easy serving. Chef\'s table experience.',
        targetSpace: 'KIT',
        relationship: 'A',
        isDefault: false,
        warnings: [
          'Formality reduced: Kitchen activities visible during meals',
          'Noise: Cooking sounds during dinner'
        ],
        triggerConditions: [
          'cookingStyle === "professional"',
          'cookingStyle === "serious"'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 7: Wellness Zone Placement
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'wellness-placement',
    title: 'Wellness Zone Placement',
    question: 'Where should your gym and spa facilities connect?',
    context: 'Morning workout routines benefit from primary suite proximity. Pool entertainment benefits from family room connection.',
    primarySpace: 'GYM',
    icon: 'Dumbbell',
    applicablePresets: ['15k', '20k'],
    kycFields: ['fitnessRoutine', 'wellnessInterest', 'poolDesired', 'spaFeatures'],
    priority: 7,
    options: [
      {
        id: 'wellness-primary',
        label: 'Near Primary Suite',
        description: 'Morning workout without traversing house. Direct access from suite.',
        targetSpace: 'PRIHALL',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Separation: Wellness traffic in private zone'
        ],
        triggerConditions: [
          'fitnessRoutine === "intensive"',
          'fitnessRoutine === "regular"'
        ]
      },
      {
        id: 'wellness-pool',
        label: 'Pool-Integrated Zone',
        description: 'Gym, spa, and pool as unified wellness destination. Resort-style experience.',
        targetSpace: 'POOL',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        bridgeRequired: 'wetFeetIntercept',
        triggerConditions: [
          'poolDesired === true',
          'wellnessInterest === "resort"',
          'wellnessInterest === "dedicated"'
        ]
      },
      {
        id: 'wellness-family',
        label: 'Family Zone Adjacent',
        description: 'Easy access for all family members. Supervision of children during workouts.',
        targetSpace: 'FR',
        relationship: 'N',
        isDefault: false,
        warnings: [],
        triggerConditions: [
          'childrenCount > 0',
          'wellnessInterest === "casual"'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 8: Mudroom & Service Entry
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'mudroom-flow',
    title: 'Mudroom & Service Entry',
    question: 'How should your service entry connect to the house?',
    context: 'The mudroom handles daily chaos: groceries, packages, pets, kids. Good flow prevents bottlenecks.',
    primarySpace: 'MUD',
    icon: 'Home',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['pets', 'childrenCount', 'staffingPreference', 'packageDeliveryVolume'],
    priority: 8,
    options: [
      {
        id: 'mud-kitchen',
        label: 'Direct to Kitchen',
        description: 'Groceries straight to kitchen. Efficient daily flow. May track through food prep area.',
        targetSpace: 'KIT',
        relationship: 'A',
        isDefault: false,
        warnings: [
          'Cleanliness: Outdoor elements enter near food prep'
        ],
        triggerConditions: [
          'staffingPreference === "self_sufficient"'
        ]
      },
      {
        id: 'mud-scullery',
        label: 'Through Scullery',
        description: 'Buffer zone between garage and kitchen. Drop packages, clean up, then enter kitchen clean.',
        targetSpace: 'SCUL',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'pets.length > 0',
          'childrenCount > 0'
        ]
      },
      {
        id: 'mud-ops',
        label: 'Operations Core Hub',
        description: 'Dedicated service zone for staff. Package staging. Deliveries processed before entering house.',
        targetSpace: 'OPSCORE',
        relationship: 'A',
        isDefault: false,
        warnings: [],
        sfImpact: 150,
        bridgeRequired: 'opsCore',
        triggerConditions: [
          'staffingPreference === "full_service"',
          'staffingPreference === "estate"',
          'packageDeliveryVolume === "heavy"'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 9: Wine Storage Access
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'wine-access',
    title: 'Wine Storage Access',
    question: 'How should your wine storage be accessed?',
    context: 'Wine service style: formal butler presentation, casual kitchen grab, or dedicated tasting experience.',
    primarySpace: 'WINE',
    icon: 'Wine',
    applicablePresets: ['10k', '15k', '20k'],
    kycFields: ['wineCollection', 'wineBottleCount', 'formalDiningImportance', 'entertainingFrequency'],
    priority: 9,
    options: [
      {
        id: 'wine-dining',
        label: 'Near Dining Room',
        description: 'Formal wine service. Display cellar visible from dining. Impressive presentation.',
        targetSpace: 'DR',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'formalDiningImportance >= 4',
          'wineBottleCount >= 200'
        ]
      },
      {
        id: 'wine-kitchen',
        label: 'Kitchen Adjacent',
        description: 'Casual access while cooking. Wine as cooking ingredient. Everyday convenience.',
        targetSpace: 'KIT',
        relationship: 'N',
        isDefault: false,
        warnings: [
          'Temperature: Kitchen heat may affect wine storage'
        ],
        triggerConditions: [
          'cookingStyle === "serious"',
          'cookingStyle === "professional"'
        ]
      },
      {
        id: 'wine-scullery',
        label: 'Service Access',
        description: 'Staff retrieves wine unseen. Back-of-house staging. Professional service model.',
        targetSpace: 'SCUL',
        relationship: 'A',
        isDefault: false,
        warnings: [],
        triggerConditions: [
          'staffingPreference === "full_service"',
          'staffingPreference === "estate"'
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DECISION 10: Secondary Bedroom Clustering
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'secondary-clustering',
    title: 'Secondary Bedroom Arrangement',
    question: 'How should secondary bedrooms be organized?',
    context: 'Children benefit from clustering. Adult children or guests may prefer separation for privacy.',
    primarySpace: 'SEC1',
    icon: 'BedDouble',
    applicablePresets: ['5k', '10k', '15k', '20k'],
    kycFields: ['childrenCount', 'childrenAges', 'composition', 'guestStayFrequency'],
    priority: 10,
    options: [
      {
        id: 'sec-clustered',
        label: 'Clustered Together',
        description: 'All secondary bedrooms in one wing. Shared bathroom options. Easy supervision.',
        targetSpace: 'SEC2',
        relationship: 'A',
        isDefault: true,
        warnings: [],
        triggerConditions: [
          'childrenCount >= 2',
          'composition === "family_with_children"'
        ]
      },
      {
        id: 'sec-distributed',
        label: 'Distributed for Privacy',
        description: 'Bedrooms separated. Each feels like private suite. Adult children or frequent guests.',
        targetSpace: 'SEC2',
        relationship: 'B',
        isDefault: false,
        warnings: [
          'Supervision: Harder to monitor young children',
          'Circulation: More hallway required'
        ],
        triggerConditions: [
          'composition === "multi_generational"',
          'composition === "blended_family"'
        ]
      },
      {
        id: 'sec-split-level',
        label: 'Split by Level',
        description: 'Some secondary rooms on different floor. Separation by generation or use.',
        targetSpace: 'STAIR',
        relationship: 'N',
        isDefault: false,
        warnings: [],
        triggerConditions: [
          'numberOfLevels >= 2',
          'guestStayFrequency === "frequently"'
        ]
      }
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a decision by ID
 */
export function getDecisionById(id: string): AdjacencyDecision | undefined {
  return ADJACENCY_DECISIONS.find(d => d.id === id);
}

/**
 * Get decisions applicable to a preset size
 */
export function getDecisionsForPreset(preset: '5k' | '10k' | '15k' | '20k'): AdjacencyDecision[] {
  return ADJACENCY_DECISIONS
    .filter(d => d.applicablePresets.includes(preset))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get the default option for a decision
 */
export function getDefaultOption(decision: AdjacencyDecision): DecisionOption {
  return decision.options.find(o => o.isDefault) || decision.options[0];
}

/**
 * Get an option by ID within a decision
 */
export function getOptionById(decision: AdjacencyDecision, optionId: string): DecisionOption | undefined {
  return decision.options.find(o => o.id === optionId);
}
