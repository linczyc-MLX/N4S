/**
 * useBriefingBuilder Hook
 *
 * React hook for managing Briefing Builder state and operations.
 */

import { useState, useCallback, useEffect } from 'react';
import type { BridgeConfig, BriefSpace, AdjacencyRequirement } from '../../shared/schema';
import type { ValidationContext } from '../../server/kyc-integration';
import {
  type BriefingBuilderState,
  type AppliedChange,
  loadPreset,
  applyBridgeConfig,
  updateSpace,
  addCustomSpace,
  removeSpace,
  updateAdjacency,
  exportToPlanBrief,
  initializeFromKYC
} from '../utils/briefing-builder-utils';
import { programPresets, getPreset } from '../data/program-presets';

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
}

export interface UseBriefingBuilderReturn {
  state: BriefingBuilderState;
  isLoading: boolean;
  isValidating: boolean;
  validationPreview: ValidationPreview | null;

  handleUpdateSpace: (spaceCode: string, updates: Partial<BriefSpace>) => void;
  handleAddSpace: (space: Omit<BriefSpace, 'id'>) => void;
  handleRemoveSpace: (spaceCode: string) => void;
  handleUpdateAdjacency: (from: string, to: string, relation: AdjacencyRequirement['relationship']) => void;
  handleToggleBridge: (bridge: keyof BridgeConfig) => void;
  handleLoadPreset: (preset: '10k' | '15k' | '20k') => void;
  runValidationPreview: () => Promise<void>;
  handleExport: () => ReturnType<typeof exportToPlanBrief>;

  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
  handleReset: () => void;
}

const MAX_HISTORY = 50;

export function useBriefingBuilder(options: UseBriefingBuilderOptions = {}): UseBriefingBuilderReturn {
  const {
    initialPreset = '15k',
    kycContext,
    onStateChange
  } = options;

  const [state, setState] = useState<BriefingBuilderState>(() => {
    const preset = getPreset(initialPreset);
    if (kycContext && preset) {
      return initializeFromKYC(preset, kycContext, 'project-001', 'New Project');
    }
    if (preset) {
      return loadPreset(preset, 'project-001', 'New Project');
    }
    // Fallback empty state
    return {
      projectId: 'project-001',
      projectName: 'New Project',
      basePreset: initialPreset,
      spaces: [],
      adjacencyMatrix: [],
      nodes: [],
      crossLinks: [],
      bridgeConfig: {
        butlerPantry: false,
        guestAutonomy: false,
        soundLock: false,
        wetFeetIntercept: false,
        opsCore: false
      },
      appliedChanges: [],
      totalSF: 0,
      levels: 2,
      bedrooms: 0,
      hasBasement: false,
      isDirty: false
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationPreview, setValidationPreview] = useState<ValidationPreview | null>(null);

  const [history, setHistory] = useState<BriefingBuilderState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const pushToHistory = useCallback((currentState: BriefingBuilderState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const updateState = useCallback((newState: BriefingBuilderState) => {
    pushToHistory(state);
    setState(newState);
  }, [state, pushToHistory]);

  const handleUpdateSpace = useCallback((spaceCode: string, updates: Partial<BriefSpace>) => {
    const space = state.spaces.find(s => s.code === spaceCode);
    if (space?.id) {
      const newState = updateSpace(state, space.id, updates);
      updateState(newState);
    }
  }, [state, updateState]);

  const handleAddSpace = useCallback((space: Omit<BriefSpace, 'id'>) => {
    const newState = addCustomSpace(state, space);
    updateState(newState);
  }, [state, updateState]);

  const handleRemoveSpace = useCallback((spaceCode: string) => {
    const space = state.spaces.find(s => s.code === spaceCode);
    if (space?.id) {
      const newState = removeSpace(state, space.id);
      updateState(newState);
    }
  }, [state, updateState]);

  const handleUpdateAdjacency = useCallback((from: string, to: string, relation: AdjacencyRequirement['relationship']) => {
    const newState = updateAdjacency(state, from, to, relation);
    updateState(newState);
  }, [state, updateState]);

  const handleToggleBridge = useCallback((bridge: keyof BridgeConfig) => {
    const newBridgeConfig: BridgeConfig = {
      ...state.bridgeConfig,
      [bridge]: !state.bridgeConfig[bridge]
    };
    const newState = applyBridgeConfig(state, newBridgeConfig);
    updateState(newState);
  }, [state, updateState]);

  const handleLoadPreset = useCallback((presetId: '10k' | '15k' | '20k') => {
    setIsLoading(true);
    try {
      const preset = getPreset(presetId);
      if (preset) {
        const newState = loadPreset(preset, state.projectId, state.projectName);
        updateState(newState);
      }
      setValidationPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [state.projectId, state.projectName, updateState]);

  const runValidationPreview = useCallback(async () => {
    setIsValidating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const messages: string[] = [];
      let redFlagCount = 0;
      let missingBridgeCount = 0;

      const hasKitchen = state.spaces.some(s => s.code === 'KIT' || s.code === 'SHOWKIT');
      if (!hasKitchen) {
        messages.push('[CRITICAL] No kitchen space defined');
        redFlagCount++;
      }

      const hasPrimarySuite = state.spaces.some(s => s.code === 'PRI' || s.code?.startsWith('PRI'));
      if (!hasPrimarySuite) {
        messages.push('[CRITICAL] No primary suite defined');
        redFlagCount++;
      }

      const totalAllocated = state.spaces.reduce((sum, s) => sum + (s.targetSF || 0), 0);
      if (Math.abs(totalAllocated - state.totalSF) > 100) {
        messages.push(`[WARNING] SF mismatch: allocated ${totalAllocated.toLocaleString()} vs target ${state.totalSF.toLocaleString()}`);
      }

      const bridgeChecks = [
        { key: 'butlerPantry' as const, name: 'Butler Pantry' },
        { key: 'guestAutonomy' as const, name: 'Guest Autonomy' },
        { key: 'soundLock' as const, name: 'Sound Lock' },
        { key: 'wetFeetIntercept' as const, name: 'Wet-Feet Intercept' },
        { key: 'opsCore' as const, name: 'Operations Core' }
      ];

      for (const bridge of bridgeChecks) {
        if (!state.bridgeConfig[bridge.key]) {
          messages.push(`[MISSING] ${bridge.name} bridge not configured`);
          missingBridgeCount++;
        }
      }

      let score = 100;
      score -= redFlagCount * 20;
      score -= missingBridgeCount * 5;
      score = Math.max(0, Math.min(100, score));

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

  const handleExport = useCallback(() => {
    return exportToPlanBrief(state);
  }, [state]);

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

  const handleReset = useCallback(() => {
    const preset = getPreset(initialPreset);
    let freshState: BriefingBuilderState;
    if (kycContext && preset) {
      freshState = initializeFromKYC(preset, kycContext, 'project-001', 'New Project');
    } else if (preset) {
      freshState = loadPreset(preset, 'project-001', 'New Project');
    } else {
      return;
    }
    setHistory([]);
    setHistoryIndex(-1);
    setState(freshState);
    setValidationPreview(null);
  }, [initialPreset, kycContext]);

  return {
    state,
    isLoading,
    isValidating,
    validationPreview,

    handleUpdateSpace,
    handleAddSpace,
    handleRemoveSpace,
    handleUpdateAdjacency,
    handleToggleBridge,
    handleLoadPreset,
    runValidationPreview,
    handleExport,

    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleReset
  };
}

export default useBriefingBuilder;
