// N4S Type Definitions

export type ClientPath = 'B1' | 'B2' | 'B3';
export type PortfolioContext = 'forever' | '5-year' | '10-year' | 'investment';
export type Phase = 1 | 2 | 3;
export type JourneyStatus = 'active' | 'paused' | 'completed';

export interface Client {
  id: string;
  name: string;
  path: ClientPath;
  portfolioContext: PortfolioContext;
  phase: Phase;
  stage: number;
  status: JourneyStatus;
  createdAt: string;
  updatedAt: string;
  
  // Investment tracking
  landValue: number;
  landProjected: number;
  buildingCost: number;
  
  // Scoring
  n4sScore?: number;
  n4sGrade?: string;
  
  // Project details
  location?: string;
  timeline?: string;
}

export interface ClientProfileData {
  // Basic Information
  primaryResidence?: string;
  projectLocation?: string;
  projectType?: string;
  estimatedBudget?: number;
  desiredTimeline?: string;
  
  // Family Structure
  familyMembers?: FamilyMember[];
  pets?: Pet[];
  
  // Visual Preferences
  architecturalStyle?: string[];
  interiorStyle?: string[];
  colorPreferences?: string;
  materialPreferences?: string;
  
  // Lifestyle & Entertainment
  dailyRoutines?: string;
  hobbies?: string;
  entertainingFrequency?: string;
  entertainingStyle?: 'formal' | 'casual' | 'mixed';
  
  // Space Requirements
  currentSpaceIssues?: string;
  mustHaveSpaces?: string[];
  niceToHaveSpaces?: string[];
  
  // Privacy & Acoustics
  privacyRequirements?: string;
  noiseSensitivity?: 'low' | 'medium' | 'high';
  
  // Special Requirements
  accessibilityNeeds?: string;
  technologyRequirements?: string;
  sustainabilityPriorities?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  role: string;
  specialNeeds?: string;
}

export interface Pet {
  id: string;
  type: string;
  name: string;
  specialNeeds?: string;
}

export interface WorkstreamProgress {
  clientId: string;
  workstreamId: string;
  completed: boolean;
  completedAt?: string;
  data?: any;
}

export interface N4SScore {
  overall: number;
  grade: string;
  categories: {
    sitePositioning: number;
    architecturalIdentity: number;
    layoutFunctionality: number;
    scaleVolume: number;
    finishesCraftsmanship: number;
    amenitiesFeatures: number;
    investmentOptimization: number;
  };
}
