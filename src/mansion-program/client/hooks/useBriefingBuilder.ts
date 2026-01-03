/**
 * useBriefingBuilder Hook
 *
 * React hook for managing Briefing Builder state and operations.
 * Provides state management, validation preview, and export functionality.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { BridgeConfig } from '../../shared/schema';
import type { ValidationContext, UniqueRequirement } from '../../server/kyc-integration';
import {
  type BriefingBuilderState,
  type AppliedChange,
  type AdjacencyRelation,
  type SpaceDefinition,
  loadPreset,
  applyUniqueRequirements,
  applyBridgeConfig,
  updateSpace,
  addCustomSpace,
  removeSpace,
  updateAdjacency,
  exportToPlanBrief,
  initializeFromKYC
} from '../utils/briefing-builder-utils';

export interface ValidationPreview {
  gateStatus: 'pass' | 'warning' | 'fail';
  overallScore: number;
  redFlagCount: number;
  missingBridgeCount: number;
  messages: string[];
}

export interface UseBriefingBuilderOptions {
  initialPreset?: '10k' | '15k' | '20k';
  kycContext?: ValidationContext;
  onStateChange?: (state: BriefingBuilderState) => void;
  autoSave?: boolean;
}

export interface UseBriefingBuilderReturn {
  // State
  state: BriefingBuilderState;
  isLoading: boolean;
  validationPreview: ValidationPreview | null;
  isValidating: boolean;

  // Space operations
  handleUpdateSpace: (spaceCode: string, updates: Partial<SpaceDefinition>) => void;
  handleAddSpace: (space: Omit<SpaceDefinition, 'isCustom'>) => void;
  handleRemoveSpace: (spaceCode: string) => void;

  // Adjacency operations
  handleUpdateAdjacency: (from: string, to: string, relation: AdjacencyRelation) => void;

  // Bridge operations
  handleToggleBridge: (bridge: keyof BridgeConfig) => void;

  // Preset operations
  handleLoadPreset: (preset: '10k' | '15k' | '20k') => void;
  handleApplyKYC: (context: ValidationContext) => void;

  // Validation
  runValidationPreview: () => Promise<void>;

  // Export
  handleExport: () => ReturnType<typeof exportToPlanBrief>;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;

  // Reset
  handleReset: () => void;
}

const MAX_HISTORY = 50;

export function useBriefingBuilder(options: UseBriefingBuilderOptions = {}): UseBriefingBuilderReturn {
  const {
    initialPreset = '15k',
    kycContext,
    onStateChange,
    autoSave = false
  } = options;

  // Initialize state
  const [state, setState] = useState<BriefingBuilderState>(() => {
    if (kycContext) {
      return initializeFromKYC(kycContext);
    }
    return loadPreset(initialPreset);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationPreview, setValidationPreview] = useState<ValidationPreview | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<BriefingBuilderState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && state.isDirty) {
      localStorage.setItem('briefing-builder-state', JSON.stringify(state));
    }
  }, [state, autoSave]);

  // Push state to history
  const pushToHistory = useCallback((newState: BriefingBuilderState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Update state with history tracking
  const updateState = useCallback((newState: BriefingBuilderState) => {
    pushToHistory(state);
    setState(newState);
  }, [state, pushToHistory]);

  // Space operations
  const handleUpdateSpace = useCallback((spaceCode: string, updates: Partial<SpaceDefinition>) => {
    const newState = updateSpace(state, spaceCode, updates);
    updateState(newState);
  }, [state, updateState]);

  const handleAddSpace = useCallback((space: Omit<SpaceDefinition, 'isCustom'>) => {
    const newState = addCustomSpace(state, space);
    updateState(newState);
  }, [state, updateState]);

  const handleRemoveSpace = useCallback((spaceCode: string) => {
    const newState = removeSpace(state, spaceCode);
    updateState(newState);
  }, [state, updateState]);

  // Adjacency operations
  const handleUpdateAdjacency = useCallback((from: string, to: string, relation: AdjacencyRelation) => {
    const newState = updateAdjacency(state, from, to, relation);
    updateState(newState);
  }, [state, updateState]);

  // Bridge operations
  const handleToggleBridge = useCallback((bridge: keyof BridgeConfig) => {
    const newBridgeConfig: BridgeConfig = {
      ...state.bridgeConfig,
      [bridge]: !state.bridgeConfig[bridge]
    };
    const newState = applyBridgeConfig(state, newBridgeConfig);
    updateState(newState);
  }, [state, updateState]);

  // Preset operations
  const handleLoadPreset = useCallback((preset: '10k' | '15k' | '20k') => {
    setIsLoading(true);
    try {
      const newState = loadPreset(preset);
      updateState(newState);
      setValidationPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateState]);

  const handleApplyKYC = useCallback((context: ValidationContext) => {
    setIsLoading(true);
    try {
      const newState = initializeFromKYC(context);
      updateState(newState);
      setValidationPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateState]);

  // Validation preview
  const runValidationPreview = useCallback(async () => {
    setIsValidating(true);
    try {
      // Simulate validation call - in production this would call the validation engine
      await new Promise(resolve => setTimeout(resolve, 500));

      const messages: string[] = [];
      let redFlagCount = 0;
      let missingBridgeCount = 0;

      // Check for critical issues
      const hasKitchen = state.spaces.some(s => s.code === 'KIT' || s.code === 'SHOWKIT');
      if (!hasKitchen) {
        messages.push('[CRITICAL] No kitchen space defined');
        redFlagCount++;
      }

      const hasPrimarySuite = state.spaces.some(s => s.code === 'PRIM' || s.code.startsWith('PRI'));
      if (!hasPrimarySuite) {
        messages.push('[CRITICAL] No primary suite defined');
        redFlagCount++;
      }

      // Check SF allocation
      const totalAllocated = state.spaces.reduce((sum, s) => sum + s.sf, 0);
      if (Math.abs(totalAllocated - state.totalSF) > 100) {
        messages.push(`[WARNING] SF mismatch: allocated ${totalAllocated.toLocaleString()} vs target ${state.totalSF.toLocaleString()}`);
      }

      // Check bridges
      const bridgeChecks = [
        { key: 'butlerPantry', name: 'Butler Pantry' },
        { key: 'guestAutonomy', name: 'Guest Autonomy' },
        { key: 'soundLock', name: 'Sound Lock' },
        { key: 'wetFeetIntercept', name: 'Wet-Feet Intercept' },
        { key: 'opsCore', name: 'Operations Core' }
      ] as const;

      for (const bridge of bridgeChecks) {
        if (!state.bridgeConfig[bridge.key]) {
          messages.push(`[MISSING] ${bridge.name} bridge not configured`);
          missingBridgeCount++;
        }
      }

      // Check adjacency conflicts
      const adjacencyConflicts = state.adjacencyMatrix.filter(
        adj => adj.relation === 'N' && adj.required
      );
      for (const conflict of adjacencyConflicts) {
        messages.push(`[WARNING] Required adjacency ${conflict.from} → ${conflict.to} set to Never`);
      }

      // Calculate score
      let score = 100;
      score -= redFlagCount * 20;
      score -= missingBridgeCount * 5;
      score -= adjacencyConflicts.length * 3;
      score = Math.max(0, Math.min(100, score));

      // Determine gate status
      let gateStatus: ValidationPreview['gateStatus'] = 'pass';
      if (redFlagCount > 0) {
        gateStatus = 'fail';
      } else if (missingBridgeCount > 2 || score < 80) {
        gateStatus = 'warning';
      }

      setValidationPreview({
        gateStatus,
        overallScore: score,
        redFlagCount,
        missingBridgeCount,
        messages
      });
    } finally {
      setIsValidating(false);
    }
  }, [state]);

  // Export
  const handleExport = useCallback(() => {
    return exportToPlanBrief(state);
  }, [state]);

  // Undo/Redo
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const previousState = history[historyIndex];
      setHistoryIndex(prev => prev - 1);
      setState(previousState);
    }
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      setState(nextState);
    }
  }, [canRedo, history, historyIndex]);

  // Reset
  const handleReset = useCallback(() => {
    const freshState = kycContext ? initializeFromKYC(kycContext) : loadPreset(initialPreset);
    setHistory([]);
    setHistoryIndex(-1);
    setState(freshState);
    setValidationPreview(null);
  }, [initialPreset, kycContext]);

  return {
    // State
    state,
    isLoading,
    validationPreview,
    isValidating,

    // Space operations
    handleUpdateSpace,
    handleAddSpace,
    handleRemoveSpace,

    // Adjacency operations
    handleUpdateAdjacency,

    // Bridge operations
    handleToggleBridge,

    // Preset operations
    handleLoadPreset,
    handleApplyKYC,

    // Validation
    runValidationPreview,

    // Export
    handleExport,

    // Undo/Redo
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,

    // Reset
    handleReset
  };
}

export default useBriefingBuilder;
