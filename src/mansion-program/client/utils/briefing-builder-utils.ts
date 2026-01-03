/**
 * Briefing Builder Utilities
 *
 * Functions for transforming baseline presets with client-specific requirements.
 */

import { v4 as randomUUID } from 'uuid';
import type {
  BriefSpace,
  AdjacencyRequirement,
  CirculationNode,
  CrossLink,
  BridgeConfig,
  PlanBrief
} from '../../shared/schema';
import type { UniqueRequirement, ValidationContext } from '../../server/kyc-integration';
import type { ProgramPreset } from '../data/program-presets';

export interface AppliedChange {
  type: 'added' | 'modified' | 'removed';
  spaceCode: string;
  description: string;
  source: string;
}

export interface BriefingBuilderState {
  projectId: string;
  projectName: string;
  basePreset: '10k' | '15k' | '20k' | 'custom';
  spaces: BriefSpace[];
  adjacencyMatrix: AdjacencyRequirement[];
  nodes: CirculationNode[];
  crossLinks: CrossLink[];
  bridgeConfig: BridgeConfig;
  appliedChanges: AppliedChange[];
  totalSF: number;
  levels: number;
  bedrooms: number;
  hasBasement: boolean;
  isDirty: boolean;
}

export function loadPreset(
  preset: ProgramPreset,
  projectId: string,
  projectName: string
): BriefingBuilderState {
  return {
    projectId,
    projectName,
    basePreset: preset.id as '10k' | '15k' | '20k',
    spaces: [...preset.spaces],
    adjacencyMatrix: [...preset.adjacencyMatrix],
    nodes: [...preset.nodes],
    crossLinks: [...preset.crossLinks],
    bridgeConfig: { ...preset.bridgeConfig },
    appliedChanges: [],
    totalSF: preset.targetSF,
    levels: 2,
    bedrooms: countBedrooms(preset.spaces),
    hasBasement: false,
    isDirty: false
  };
}

function countBedrooms(spaces: BriefSpace[]): number {
  const bedroomCodes = ['PRI', 'SEC1', 'SEC2', 'SEC3', 'SEC4', 'GSL1', 'GSL2', 'GUEST1', 'GUEST2'];
  return spaces.filter(s => bedroomCodes.some(code => s.code.startsWith(code.slice(0, 3)))).length;
}

export function applyUniqueRequirements(
  state: BriefingBuilderState,
  requirements: UniqueRequirement[]
): BriefingBuilderState {
  let newState = { ...state };

  for (const req of requirements) {
    switch (req.type) {
      case 'addition':
        newState = applyAddition(newState, req);
        break;
      case 'modification':
        newState = applyModification(newState, req);
        break;
      case 'deletion':
        newState = applyDeletion(newState, req);
        break;
      case 'adjacency':
        newState = applyAdjacencyChange(newState, req);
        break;
    }
  }

  newState.totalSF = newState.spaces.reduce((sum, s) => sum + s.targetSF, 0);
  newState.isDirty = true;

  return newState;
}

function applyAddition(
  state: BriefingBuilderState,
  req: UniqueRequirement
): BriefingBuilderState {
  if (req.spaceCode && state.spaces.some(s => s.code === req.spaceCode)) {
    return state;
  }

  const newSpace: BriefSpace = {
    id: randomUUID(),
    code: req.spaceCode || generateSpaceCode(req.category),
    name: req.description.split(' ').slice(0, 3).join(' '),
    targetSF: req.estimatedSF || 100,
    zone: mapCategoryToZone(req.category),
    level: 1,
    rationale: `Added from KYC: ${req.sourceQuestion}`
  };

  const newSpaces = [...state.spaces, newSpace];

  let newAdjacency = [...state.adjacencyMatrix];
  if (req.adjacencyNeeds) {
    for (const adjCode of req.adjacencyNeeds) {
      if (state.spaces.some(s => s.code === adjCode)) {
        newAdjacency.push({
          fromSpaceCode: newSpace.code,
          toSpaceCode: adjCode,
          relationship: 'N'
        });
      }
    }
  }

  const change: AppliedChange = {
    type: 'added',
    spaceCode: newSpace.code,
    description: req.description,
    source: req.sourceQuestion
  };

  return {
    ...state,
    spaces: newSpaces,
    adjacencyMatrix: newAdjacency,
    appliedChanges: [...state.appliedChanges, change]
  };
}

function applyModification(
  state: BriefingBuilderState,
  req: UniqueRequirement
): BriefingBuilderState {
  if (!req.spaceCode) return state;

  const spaceIndex = state.spaces.findIndex(s => s.code === req.spaceCode);
  if (spaceIndex === -1) {
    return applyAddition(state, { ...req, type: 'addition' });
  }

  const updatedSpace = {
    ...state.spaces[spaceIndex],
    targetSF: req.estimatedSF || state.spaces[spaceIndex].targetSF,
    rationale: `Modified from KYC: ${req.description}`
  };

  const newSpaces = [...state.spaces];
  newSpaces[spaceIndex] = updatedSpace;

  const change: AppliedChange = {
    type: 'modified',
    spaceCode: req.spaceCode,
    description: req.description,
    source: req.sourceQuestion
  };

  return {
    ...state,
    spaces: newSpaces,
    appliedChanges: [...state.appliedChanges, change]
  };
}

function applyDeletion(
  state: BriefingBuilderState,
  req: UniqueRequirement
): BriefingBuilderState {
  if (!req.spaceCode) return state;

  const newSpaces = state.spaces.filter(s => s.code !== req.spaceCode);
  const newAdjacency = state.adjacencyMatrix.filter(
    a => a.fromSpaceCode !== req.spaceCode && a.toSpaceCode !== req.spaceCode
  );

  const newNodes = state.nodes.map(n => ({
    ...n,
    spaceCodes: n.spaceCodes.filter(c => c !== req.spaceCode)
  }));

  const change: AppliedChange = {
    type: 'removed',
    spaceCode: req.spaceCode,
    description: req.description,
    source: req.sourceQuestion
  };

  return {
    ...state,
    spaces: newSpaces,
    adjacencyMatrix: newAdjacency,
    nodes: newNodes,
    appliedChanges: [...state.appliedChanges, change]
  };
}

function applyAdjacencyChange(
  state: BriefingBuilderState,
  req: UniqueRequirement
): BriefingBuilderState {
  return state;
}

export function applyBridgeConfig(
  state: BriefingBuilderState,
  bridgeConfig: BridgeConfig
): BriefingBuilderState {
  const changes: AppliedChange[] = [];
  let newSpaces = [...state.spaces];
  let newAdjacency = [...state.adjacencyMatrix];

  if (bridgeConfig.butlerPantry && !state.spaces.some(s => s.code === 'BUTLER')) {
    const butlerPantry: BriefSpace = {
      id: randomUUID(),
      code: 'BUTLER',
      name: 'Butler Pantry',
      targetSF: 120,
      zone: 'Service Core',
      level: 1,
      rationale: 'Required bridge: Butler Pantry for entertaining support'
    };
    newSpaces.push(butlerPantry);

    newAdjacency.push(
      { fromSpaceCode: 'BUTLER', toSpaceCode: 'DR', relationship: 'A' },
      { fromSpaceCode: 'BUTLER', toSpaceCode: 'KIT', relationship: 'A' },
      { fromSpaceCode: 'BUTLER', toSpaceCode: 'CHEF', relationship: 'N' }
    );

    changes.push({
      type: 'added',
      spaceCode: 'BUTLER',
      description: 'Butler Pantry bridge for entertaining',
      source: 'bridgeConfig.butlerPantry'
    });
  }

  if (bridgeConfig.soundLock && !state.spaces.some(s => s.code === 'SNDLCK')) {
    const soundLock: BriefSpace = {
      id: randomUUID(),
      code: 'SNDLCK',
      name: 'Sound Lock',
      targetSF: 60,
      zone: 'Entertainment',
      level: 1,
      rationale: 'Required bridge: Acoustic buffer for late-night media'
    };
    newSpaces.push(soundLock);

    newAdjacency.push(
      { fromSpaceCode: 'SNDLCK', toSpaceCode: 'MEDIA', relationship: 'A' },
      { fromSpaceCode: 'SNDLCK', toSpaceCode: 'FR', relationship: 'N' }
    );

    changes.push({
      type: 'added',
      spaceCode: 'SNDLCK',
      description: 'Sound Lock vestibule for media room',
      source: 'bridgeConfig.soundLock'
    });
  }

  if (bridgeConfig.wetFeetIntercept && !state.spaces.some(s => s.code === 'WETFT')) {
    const wetFeet: BriefSpace = {
      id: randomUUID(),
      code: 'WETFT',
      name: 'Pool Vestibule',
      targetSF: 80,
      zone: 'Wellness',
      level: 1,
      rationale: 'Required bridge: Pool-to-house transition zone'
    };
    newSpaces.push(wetFeet);

    newAdjacency.push(
      { fromSpaceCode: 'WETFT', toSpaceCode: 'POOL', relationship: 'A' },
      { fromSpaceCode: 'WETFT', toSpaceCode: 'FR', relationship: 'N' }
    );

    changes.push({
      type: 'added',
      spaceCode: 'WETFT',
      description: 'Wet-feet intercept for pool access',
      source: 'bridgeConfig.wetFeetIntercept'
    });
  }

  if (bridgeConfig.opsCore && !state.spaces.some(s => s.code === 'OPSCORE')) {
    const opsCore: BriefSpace = {
      id: randomUUID(),
      code: 'OPSCORE',
      name: 'Operations Core',
      targetSF: 150,
      zone: 'Service Core',
      level: 1,
      rationale: 'Required bridge: Staff operations and delivery hub'
    };
    newSpaces.push(opsCore);

    newAdjacency.push(
      { fromSpaceCode: 'OPSCORE', toSpaceCode: 'MUD', relationship: 'A' },
      { fromSpaceCode: 'OPSCORE', toSpaceCode: 'GAR', relationship: 'N' },
      { fromSpaceCode: 'OPSCORE', toSpaceCode: 'SCUL', relationship: 'N' }
    );

    changes.push({
      type: 'added',
      spaceCode: 'OPSCORE',
      description: 'Operations Core for staff',
      source: 'bridgeConfig.opsCore'
    });
  }

  if (bridgeConfig.guestAutonomy) {
    const guestSuiteIndex = newSpaces.findIndex(s => s.code === 'GSL1' || s.code === 'GUEST1');
    if (guestSuiteIndex !== -1) {
      newSpaces[guestSuiteIndex] = {
        ...newSpaces[guestSuiteIndex],
        targetSF: Math.max(newSpaces[guestSuiteIndex].targetSF, 600),
        rationale: 'Expanded for guest autonomy: kitchenette + separate entry'
      };

      changes.push({
        type: 'modified',
        spaceCode: newSpaces[guestSuiteIndex].code,
        description: 'Guest suite expanded for autonomy',
        source: 'bridgeConfig.guestAutonomy'
      });
    }
  }

  return {
    ...state,
    spaces: newSpaces,
    adjacencyMatrix: newAdjacency,
    bridgeConfig: { ...bridgeConfig },
    appliedChanges: [...state.appliedChanges, ...changes],
    totalSF: newSpaces.reduce((sum, s) => sum + s.targetSF, 0),
    isDirty: true
  };
}

export function updateSpace(
  state: BriefingBuilderState,
  spaceId: string,
  updates: Partial<BriefSpace>
): BriefingBuilderState {
  const newSpaces = state.spaces.map(s =>
    s.id === spaceId ? { ...s, ...updates } : s
  );

  return {
    ...state,
    spaces: newSpaces,
    totalSF: newSpaces.reduce((sum, s) => sum + s.targetSF, 0),
    isDirty: true
  };
}

export function addCustomSpace(
  state: BriefingBuilderState,
  space: Omit<BriefSpace, 'id'>
): BriefingBuilderState {
  const newSpace: BriefSpace = {
    ...space,
    id: randomUUID()
  };

  return {
    ...state,
    spaces: [...state.spaces, newSpace],
    totalSF: state.totalSF + newSpace.targetSF,
    isDirty: true
  };
}

export function removeSpace(
  state: BriefingBuilderState,
  spaceId: string
): BriefingBuilderState {
  const space = state.spaces.find(s => s.id === spaceId);
  if (!space) return state;

  const newSpaces = state.spaces.filter(s => s.id !== spaceId);
  const newAdjacency = state.adjacencyMatrix.filter(
    a => a.fromSpaceCode !== space.code && a.toSpaceCode !== space.code
  );
  const newNodes = state.nodes.map(n => ({
    ...n,
    spaceCodes: n.spaceCodes.filter(c => c !== space.code)
  }));

  return {
    ...state,
    spaces: newSpaces,
    adjacencyMatrix: newAdjacency,
    nodes: newNodes,
    totalSF: newSpaces.reduce((sum, s) => sum + s.targetSF, 0),
    isDirty: true
  };
}

export function updateAdjacency(
  state: BriefingBuilderState,
  fromCode: string,
  toCode: string,
  relationship: 'A' | 'N' | 'B' | 'S' | null
): BriefingBuilderState {
  let newMatrix = state.adjacencyMatrix.filter(
    a => !(a.fromSpaceCode === fromCode && a.toSpaceCode === toCode)
  );

  if (relationship !== null) {
    newMatrix.push({ fromSpaceCode: fromCode, toSpaceCode: toCode, relationship });
  }

  return {
    ...state,
    adjacencyMatrix: newMatrix,
    isDirty: true
  };
}

export function exportToPlanBrief(state: BriefingBuilderState): PlanBrief {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    projectId: state.projectId,
    name: `${state.projectName} - ${state.basePreset.toUpperCase()} Baseline`,
    totalSF: state.totalSF,
    levels: state.levels,
    hasBasement: state.hasBasement,
    bedrooms: state.bedrooms,
    executiveSummary: generateExecutiveSummary(state),
    spaces: state.spaces,
    adjacencyMatrix: state.adjacencyMatrix,
    nodes: state.nodes,
    crossLinks: state.crossLinks,
    bridgeConfig: state.bridgeConfig,
    createdAt: now,
    updatedAt: now
  };
}

function generateExecutiveSummary(state: BriefingBuilderState): string {
  const bridges = [];
  if (state.bridgeConfig.butlerPantry) bridges.push('Butler Pantry');
  if (state.bridgeConfig.guestAutonomy) bridges.push('Guest Autonomy');
  if (state.bridgeConfig.soundLock) bridges.push('Sound Lock');
  if (state.bridgeConfig.wetFeetIntercept) bridges.push('Wet-Feet Intercept');
  if (state.bridgeConfig.opsCore) bridges.push('Ops Core');

  const changeCount = state.appliedChanges.length;
  const addedCount = state.appliedChanges.filter(c => c.type === 'added').length;
  const modifiedCount = state.appliedChanges.filter(c => c.type === 'modified').length;

  let summary = `${state.totalSF.toLocaleString()} SF program based on ${state.basePreset.toUpperCase()} baseline. `;
  summary += `${state.spaces.length} spaces across ${state.levels} level(s). `;
  summary += `${state.bedrooms} bedroom configuration. `;

  if (bridges.length > 0) {
    summary += `Operational bridges: ${bridges.join(', ')}. `;
  }

  if (changeCount > 0) {
    summary += `${changeCount} client-specific modification(s) applied `;
    summary += `(${addedCount} added, ${modifiedCount} modified).`;
  }

  return summary;
}

function generateSpaceCode(category: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${suffix}`;
}

function mapCategoryToZone(category: string): string {
  const zoneMap: Record<string, string> = {
    'pets': 'Service Core',
    'entertaining': 'Entertainment',
    'special': 'Special Purpose',
    'wellness': 'Wellness',
    'work': 'Private',
    'automotive': 'Service Core',
    'security': 'Service Core',
    'accessibility': 'Circulation',
    'custom': 'Special Purpose'
  };
  return zoneMap[category] || 'Special Purpose';
}

export function initializeFromKYC(
  preset: ProgramPreset,
  context: ValidationContext,
  projectId: string,
  projectName: string
): BriefingBuilderState {
  let state = loadPreset(preset, projectId, projectName);
  state = applyBridgeConfig(state, context.bridgeConfig);
  state = applyUniqueRequirements(state, context.uniqueRequirements);
  state.isDirty = false;

  return state;
}
