/**
 * BriefingBuilder Component
 *
 * Main UI for creating and editing project briefings.
 */

import React, { useState, useMemo } from 'react';
import type { ValidationContext } from '../../server/kyc-integration';
import { useBriefingBuilder } from '../hooks/useBriefingBuilder';
import SpaceEditor from './SpaceEditor';
import AdjacencyMatrix from './AdjacencyMatrix';
import BridgePanel from './BridgePanel';
import ValidationPanel from './ValidationPanel';
import ChangesLog from './ChangesLog';
import './BriefingBuilder.css';

export interface BriefingBuilderProps {
  projectId: string;
  projectName: string;
  kycContext?: ValidationContext;
  initialPreset?: '10k' | '15k' | '20k';
  onSave?: (brief: ReturnType<typeof import('../utils/briefing-builder-utils').exportToPlanBrief>) => void;
  onCancel?: () => void;
}

type TabId = 'spaces' | 'adjacency' | 'bridges' | 'validation' | 'changes';

const PRESET_OPTIONS = [
  { id: '10k' as const, name: '10K Signature', targetSF: 10000 },
  { id: '15k' as const, name: '15K Grand', targetSF: 15000 },
  { id: '20k' as const, name: '20K Estate', targetSF: 20000 }
];

export function BriefingBuilder({
  projectId,
  projectName,
  kycContext,
  initialPreset,
  onSave,
  onCancel
}: BriefingBuilderProps) {
  const [activeTab, setActiveTab] = useState<TabId>('spaces');
  const [showAddSpace, setShowAddSpace] = useState(false);

  const builder = useBriefingBuilder({
    initialPreset,
    kycContext
  });

  const {
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
    handleUndo,
    handleReset
  } = builder;

  // Group spaces by level
  const spacesByLevel = useMemo(() => {
    const levels = [...new Set(state.spaces.map(s => s.level))].sort();
    return levels.map(level => ({
      level,
      spaces: state.spaces.filter(s => s.level === level),
      totalSF: state.spaces.filter(s => s.level === level).reduce((sum, s) => sum + (s.targetSF || 0), 0)
    }));
  }, [state.spaces]);

  const handleSave = () => {
    const brief = handleExport();
    onSave?.(brief);
  };

  const renderSpacesTab = () => (
    <div className="spaces-tab">
      <div className="preset-selector">
        <label>Baseline Preset:</label>
        <div className="preset-buttons">
          {PRESET_OPTIONS.map(preset => (
            <button
              key={preset.id}
              className={`preset-btn ${state.basePreset === preset.id ? 'active' : ''}`}
              onClick={() => handleLoadPreset(preset.id)}
            >
              {preset.name}
              <span className="preset-sf">{preset.targetSF.toLocaleString()} SF</span>
            </button>
          ))}
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat">
          <span className="stat-value">{state.spaces.length}</span>
          <span className="stat-label">Spaces</span>
        </div>
        <div className="stat">
          <span className="stat-value">{state.totalSF.toLocaleString()}</span>
          <span className="stat-label">Total SF</span>
        </div>
        <div className="stat">
          <span className="stat-value">{state.appliedChanges.length}</span>
          <span className="stat-label">Changes</span>
        </div>
      </div>

      <div className="spaces-by-level">
        {spacesByLevel.map(({ level, spaces, totalSF }) => (
          <div key={level} className="level-group">
            <div className="level-header">
              <h3>Level {level}</h3>
              <span className="level-sf">{totalSF.toLocaleString()} SF</span>
            </div>
            <div className="spaces-grid">
              {spaces.map(space => (
                <SpaceEditor
                  key={space.code}
                  space={space}
                  onUpdate={(updates) => handleUpdateSpace(space.code, updates)}
                  onDelete={() => handleRemoveSpace(space.code)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="add-space-btn"
        onClick={() => setShowAddSpace(true)}
      >
        + Add Custom Space
      </button>

      {showAddSpace && (
        <AddSpaceModal
          onAdd={(space) => {
            handleAddSpace(space);
            setShowAddSpace(false);
          }}
          onClose={() => setShowAddSpace(false)}
          existingCodes={state.spaces.map(s => s.code)}
        />
      )}
    </div>
  );

  const renderAdjacencyTab = () => (
    <AdjacencyMatrix
      spaces={state.spaces}
      adjacencyMatrix={state.adjacencyMatrix}
      onUpdate={handleUpdateAdjacency}
    />
  );

  const renderBridgesTab = () => (
    <BridgePanel
      bridgeConfig={state.bridgeConfig}
      onToggle={handleToggleBridge}
      kycContext={kycContext}
    />
  );

  const renderValidationTab = () => (
    <ValidationPanel
      preview={validationPreview}
      isLoading={isValidating}
      onRunValidation={runValidationPreview}
      state={state}
    />
  );

  const renderChangesTab = () => (
    <ChangesLog changes={state.appliedChanges} />
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'spaces', label: 'Spaces', count: state.spaces.length },
    { id: 'adjacency', label: 'Adjacency', count: state.adjacencyMatrix.length },
    { id: 'bridges', label: 'Bridges' },
    { id: 'validation', label: 'Validation' },
    { id: 'changes', label: 'Changes', count: state.appliedChanges.length }
  ];

  return (
    <div className="briefing-builder">
      <header className="builder-header">
        <div className="header-left">
          <h1>{projectName || 'Briefing Builder'}</h1>
          <span className="project-id">{projectId}</span>
        </div>
        <div className="header-right">
          {canUndo && (
            <button className="undo-btn" onClick={handleUndo}>
              ↶ Undo
            </button>
          )}
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
          {onCancel && (
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="save-btn" onClick={handleSave}>
            Save Brief
          </button>
        </div>
      </header>

      <nav className="builder-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="builder-content">
        {isLoading && <div className="loading-overlay">Loading...</div>}

        {activeTab === 'spaces' && renderSpacesTab()}
        {activeTab === 'adjacency' && renderAdjacencyTab()}
        {activeTab === 'bridges' && renderBridgesTab()}
        {activeTab === 'validation' && renderValidationTab()}
        {activeTab === 'changes' && renderChangesTab()}
      </main>

      {state.isDirty && (
        <div className="dirty-indicator">
          Unsaved changes
        </div>
      )}
    </div>
  );
}

// Add Space Modal Component
interface AddSpaceModalProps {
  onAdd: (space: {
    code: string;
    name: string;
    zone: string;
    level: number;
    sf: number;
  }) => void;
  onClose: () => void;
  existingCodes: string[];
}

function AddSpaceModal({ onAdd, onClose, existingCodes }: AddSpaceModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [zone, setZone] = useState('living');
  const [level, setLevel] = useState(1);
  const [sf, setSf] = useState(200);

  const isValid = code.length >= 2 &&
    name.length >= 2 &&
    !existingCodes.includes(code.toUpperCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onAdd({
        code: code.toUpperCase(),
        name,
        zone,
        level,
        sf
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Custom Space</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Code:
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., YOGA"
                maxLength={8}
              />
            </label>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Yoga Studio"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Zone:
              <select value={zone} onChange={e => setZone(e.target.value)}>
                <option value="living">Living</option>
                <option value="sleeping">Sleeping</option>
                <option value="service">Service</option>
                <option value="wellness">Wellness</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </label>
            <label>
              Level:
              <input
                type="number"
                value={level}
                onChange={e => setLevel(parseInt(e.target.value) || 1)}
                min={0}
                max={3}
              />
            </label>
            <label>
              SF:
              <input
                type="number"
                value={sf}
                onChange={e => setSf(parseInt(e.target.value) || 0)}
                min={50}
                max={2000}
                step={50}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!isValid}>Add Space</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BriefingBuilder;
