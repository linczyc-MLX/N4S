/**
 * N4S KYC (Know Your Client) Schema
 * 
 * Defines the intake questionnaire structure for luxury residential clients.
 * Responses map directly to OperatingModel and LifestylePriorities for validation.
 * 
 * @module kyc-schema
 */

import { z } from "zod";

// ============================================================================
// KYC RESPONSE ENUMS
// ============================================================================

export const ResidenceType = z.enum([
  "primary",           // Main home, year-round
  "secondary",         // Weekend/seasonal use
  "vacation",          // Resort/vacation property
  "winter",            // Ski/cold-weather seasonal
  "investment"         // Rental/income property
]);

export const HouseholdComposition = z.enum([
  "couple_no_children",
  "couple_young_children",
  "couple_teenagers",
  "couple_adult_children",
  "multi_generational",
  "single_occupant",
  "blended_family"
]);

export const EntertainingFrequency = z.enum([
  "rarely",            // Few times per year
  "occasionally",      // Quarterly
  "regularly",         // Monthly
  "frequently"         // Weekly or more
]);

export const EntertainingScale = z.enum([
  "intimate",          // 2-8 guests
  "moderate",          // 10-20 guests
  "large",             // 25-50 guests
  "grand"              // 50+ guests
]);

export const StaffingPreference = z.enum([
  "self_sufficient",   // No regular staff
  "occasional",        // Cleaning, occasional help
  "regular",           // Part-time housekeeper, etc.
  "full_service",      // Full-time staff
  "estate"             // Live-in staff, estate manager
]);

export const PrivacyPreference = z.enum([
  "welcoming",         // Open to visitors, casual
  "selective",         // Balanced approach
  "formal",            // Structured visiting
  "sanctuary"          // Maximum privacy
]);

export const CookingStyle = z.enum([
  "minimal",           // Rarely cook
  "casual",            // Simple meals
  "enthusiast",        // Regular cooking, enjoys it
  "serious",           // Advanced home chef
  "professional"       // Chef-grade requirements
]);

export const WellnessInterest = z.enum([
  "none",              // No wellness facilities
  "basic",             // Simple gym
  "active",            // Gym + pool
  "dedicated",         // Full wellness suite
  "resort"             // Spa-grade facilities
]);

export const WorkFromHomeLevel = z.enum([
  "never",             // No home office needed
  "occasional",        // Sometimes work from home
  "regular",           // Frequent WFH
  "primary",           // Main work location
  "executive"          // Client meetings, video calls
]);

export const MediaUsage = z.enum([
  "casual",            // Regular TV viewing
  "enthusiast",        // Movie nights, quality audio
  "dedicated",         // Theater-quality desired
  "professional"       // Recording studio / screening room
]);

// ============================================================================
// KYC QUESTION SECTIONS
// ============================================================================

/**
 * Section 1: Property Context
 */
export const propertyContextSchema = z.object({
  residenceType: ResidenceType,
  estimatedSF: z.number().min(5000).max(50000),
  siteLotSize: z.string().optional(),  // e.g., "2 acres"
  hasBasement: z.boolean().default(false),
  numberOfLevels: z.number().min(1).max(5).default(2),
  climateZone: z.string().optional(),  // For HVAC/wellness considerations
  existingStructure: z.boolean().default(false),  // Renovation vs new build
  targetCompletionDate: z.string().optional()
});

/**
 * Section 2: Household Profile
 */
export const householdProfileSchema = z.object({
  composition: HouseholdComposition,
  primaryResidents: z.number().min(1).max(10),
  childrenAges: z.array(z.number()).default([]),
  elderlyResidents: z.boolean().default(false),
  mobilityConsiderations: z.boolean().default(false),
  pets: z.array(z.object({
    type: z.string(),  // dog, cat, etc.
    size: z.enum(["small", "medium", "large"]).optional(),
    count: z.number().default(1),
    specialNeeds: z.string().optional()  // e.g., "dog wash needed"
  })).default([])
});

/**
 * Section 3: Entertaining Profile
 */
export const entertainingProfileSchema = z.object({
  frequency: EntertainingFrequency,
  typicalScale: EntertainingScale,
  maxEventScale: EntertainingScale,
  formalDiningImportance: z.number().min(1).max(5),  // 1=not important, 5=essential
  outdoorEntertainingImportance: z.number().min(1).max(5),
  cateringSupport: z.boolean().default(false),  // Do they use caterers?
  wineCollection: z.boolean().default(false),
  wineBottleCount: z.number().optional(),  // If collection exists
  barEntertainingImportance: z.number().min(1).max(5)
});

/**
 * Section 4: Staffing & Service
 */
export const staffingProfileSchema = z.object({
  preference: StaffingPreference,
  currentStaff: z.array(z.object({
    role: z.string(),  // housekeeper, chef, driver, etc.
    liveIn: z.boolean().default(false),
    fullTime: z.boolean().default(false)
  })).default([]),
  plannedStaff: z.array(z.string()).default([]),  // Roles planning to add
  securityRequirements: z.enum(["minimal", "moderate", "enhanced", "comprehensive"]).default("minimal"),
  packageDeliveryVolume: z.enum(["light", "moderate", "heavy"]).default("moderate")
});

/**
 * Section 5: Privacy & Lifestyle
 */
export const privacyProfileSchema = z.object({
  preference: PrivacyPreference,
  guestStayFrequency: z.enum(["rarely", "occasionally", "regularly", "frequently"]),
  typicalGuestStayDuration: z.enum(["overnight", "weekend", "week", "extended"]),
  multiGenerationalHosting: z.boolean().default(false),
  separateGuestAccess: z.boolean().default(false),  // Want independent guest entry?
  workFromHome: WorkFromHomeLevel,
  clientMeetingsAtHome: z.boolean().default(false),
  mediaRoom: z.boolean().default(false),
  lateNightMediaUse: z.boolean().default(false)
});

/**
 * Section 6: Kitchen & Dining
 */
export const kitchenProfileSchema = z.object({
  cookingStyle: CookingStyle,
  primaryCook: z.enum(["self", "spouse", "both", "staff", "mixed"]),
  breakfastStyle: z.enum(["quick", "casual", "formal"]),
  dailyMealsAtHome: z.number().min(0).max(3),  // How many meals eaten at home daily
  showKitchenImportance: z.number().min(1).max(5),  // Island cooking, open to guests
  professionalAppliances: z.boolean().default(false),
  multipleOvens: z.boolean().default(false),
  wineStorage: z.boolean().default(false),
  separateCateringKitchen: z.boolean().default(false)
});

/**
 * Section 7: Wellness & Recreation
 */
export const wellnessProfileSchema = z.object({
  interest: WellnessInterest,
  fitnessRoutine: z.enum(["none", "light", "regular", "intensive"]),
  poolDesired: z.boolean().default(false),
  poolType: z.enum(["lap", "recreational", "infinity", "indoor"]).optional(),
  spaFeatures: z.array(z.enum([
    "sauna", "steam", "hot_tub", "cold_plunge", "massage_room", "meditation"
  ])).default([]),
  outdoorActivities: z.array(z.string()).default([]),  // tennis, putting green, etc.
  garageBays: z.number().min(1).max(10).default(2),
  carCollection: z.boolean().default(false)
});

/**
 * Section 8: Special Requirements
 */
export const specialRequirementsSchema = z.object({
  accessibility: z.array(z.string()).default([]),  // wheelchair, elevator, etc.
  medicalEquipment: z.boolean().default(false),
  artCollection: z.boolean().default(false),
  artClimateControl: z.boolean().default(false),
  musicRoom: z.boolean().default(false),
  recordingStudio: z.boolean().default(false),
  workshop: z.boolean().default(false),
  wineRoom: z.boolean().default(false),
  safe_room: z.boolean().default(false),
  customSpaces: z.array(z.object({
    name: z.string(),
    description: z.string(),
    estimatedSF: z.number().optional(),
    adjacencyNeeds: z.string().optional()
  })).default([])
});

/**
 * Section 9: Budget & Timeline
 */
export const budgetProfileSchema = z.object({
  constructionBudgetRange: z.enum([
    "under_5m", "5m_10m", "10m_20m", "20m_50m", "over_50m"
  ]).optional(),
  ffeBudgetRange: z.enum([
    "under_500k", "500k_1m", "1m_2m", "2m_5m", "over_5m"
  ]).optional(),
  prioritizeQuality: z.boolean().default(true),  // Quality over budget
  phaseConstruction: z.boolean().default(false)  // Build in phases?
});

// ============================================================================
// COMPLETE KYC RESPONSE
// ============================================================================

export const kycResponseSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  projectId: z.string().optional(),
  completedAt: z.string().optional(),
  
  // All sections
  propertyContext: propertyContextSchema,
  householdProfile: householdProfileSchema,
  entertainingProfile: entertainingProfileSchema,
  staffingProfile: staffingProfileSchema,
  privacyProfile: privacyProfileSchema,
  kitchenProfile: kitchenProfileSchema,
  wellnessProfile: wellnessProfileSchema,
  specialRequirements: specialRequirementsSchema,
  budgetProfile: budgetProfileSchema.optional(),
  
  // Free-form notes from intake conversation
  additionalNotes: z.string().optional(),
  
  // Metadata
  createdAt: z.string(),
  updatedAt: z.string()
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/* eslint-disable @typescript-eslint/no-redeclare */
export type ResidenceType = z.infer<typeof ResidenceType>;
export type HouseholdComposition = z.infer<typeof HouseholdComposition>;
export type EntertainingFrequency = z.infer<typeof EntertainingFrequency>;
export type EntertainingScale = z.infer<typeof EntertainingScale>;
export type StaffingPreference = z.infer<typeof StaffingPreference>;
export type PrivacyPreference = z.infer<typeof PrivacyPreference>;
export type CookingStyle = z.infer<typeof CookingStyle>;
export type WellnessInterest = z.infer<typeof WellnessInterest>;
export type WorkFromHomeLevel = z.infer<typeof WorkFromHomeLevel>;
export type MediaUsage = z.infer<typeof MediaUsage>;
/* eslint-enable @typescript-eslint/no-redeclare */

export type PropertyContext = z.infer<typeof propertyContextSchema>;
export type HouseholdProfile = z.infer<typeof householdProfileSchema>;
export type EntertainingProfile = z.infer<typeof entertainingProfileSchema>;
export type StaffingProfile = z.infer<typeof staffingProfileSchema>;
export type PrivacyProfile = z.infer<typeof privacyProfileSchema>;
export type KitchenProfile = z.infer<typeof kitchenProfileSchema>;
export type WellnessProfile = z.infer<typeof wellnessProfileSchema>;
export type SpecialRequirements = z.infer<typeof specialRequirementsSchema>;
export type BudgetProfile = z.infer<typeof budgetProfileSchema>;
export type KYCResponse = z.infer<typeof kycResponseSchema>;
