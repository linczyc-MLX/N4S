/**
 * FYI Module - Find Your Inspiration
 * 
 * Luxury residence interior area brief application.
 * Position in N4S workflow: KYC → FYI → MVP → VMX
 */

export { default } from './FYIModule';
export { default as FYIModule } from './FYIModule';

// Components
export * from './components';

// Hooks
export { default as useFYIState } from './hooks/useFYIState';

// Utils
export { 
  generateFYIFromKYC, 
  generateMVPFromFYI, 
  validateFYISelections 
} from './utils/fyiBridges';
