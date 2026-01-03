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
  onSave?: (brief: ReturnType<ReturnType<typeof useBriefingBuilder>['exportBrief']>) => void;
  onCancel?: () => void;
}

type TabId = 'spaces' | 'adjacency' | 'bridges' | 'validation' | 'changes';

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
    projectId,
    projectName,
    kycContext,
    initialPreset
  });

  const {
    state,
    isLoading,
    validationPreview,
    loadPresetById,
    availablePresets,
    updateSpaceField,
    addSpace,
    deleteSpace,
    setAdjacency,
    getAdjacency,
    toggleBridge,
    runValidationPreview,
    exportBrief,
    getSpacesByLevel,
    getZones,
    undoLastChange,
    canUndo
  } = builder;

  const spacesByLevel = useMemo(() => {
    const levels = [...new Set(state.spaces.map(s => s.level))].sort();
    return levels.map(level => ({
      level,
      spaces: getSpacesByLevel(level),
      totalSF: getSpacesByLevel(level).reduce((sum, s) => sum + s.targetSF, 0)
    }));
  }, [state.spaces, getSpacesByLevel]);

  const handleSave = () => {
    const brief = exportBrief();
    onSave?.(brief);
  };

  const renderSpacesTab = () => (
    <div className="spaces-tab">
      <div className="preset-selector">
        <label>Baseline Preset:</label>
        <div className="preset-buttons">
          {availablePresets.map(preset => (
            <button
              key={preset.id}
              className={`preset-btn ${state.basePreset === preset.id ? 'active' : ''}`}
              onClick={() => loadPresetById(preset.id as '10k' | '15k' | '20k')}
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
          <span className="stat-value">{state.bedrooms}</span>
          <span className="stat-label">Bedrooms</span>
        </div>
        <div className="stat">
          <span className="stat-value">{state.levels}</span>
          <span className="stat-label">Levels</span>
        </div>
      </div>

      {spacesByLevel.map(({ level, spaces, totalSF }) => (
        <div key={level} className="level-section">
          <h3 className="level-header">
            Level {level}
            <span className="level-sf">{totalSF.toLocaleString()} SF</span>
          </h3>

          <div className="spaces-grid">
            {spaces.map(space => (
              <SpaceEditor
                key={space.id}
                space={space}
                onUpdate={(field, value) => updateSpaceField(space.id, field, value)}
                onDelete={() => deleteSpace(space.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        className="add-space-btn"
        onClick={() => setShowAddSpace(true)}
      >
        + Add Custom Space
      </button>

      {showAddSpace && (
        <AddSpaceModal
          zones={getZones()}
          levels={spacesByLevel.map(l => l.level)}
          onAdd={(space) => {
            addSpace(space);
            setShowAddSpace(false);
          }}
          onClose={() => setShowAddSpace(false)}
        />
      )}
    </div>
  );

  return (
    <div className="briefing-builder">
      <header className="builder-header">
        <div className="header-left">
          <h1>{projectName}</h1>
          <span className="project-id">{projectId}</span>
        </div>
        <div className="header-right">
          {canUndo && (
            <button className="undo-btn" onClick={undoLastChange}>
              ↶ Undo
            </button>
          )}
          {state.isDirty && <span className="dirty-indicator">Unsaved changes</span>}
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Brief
          </button>
        </div>
      </header>

      {kycContext && (
        <div className="kyc-summary">
          <div className="kyc-item">
            <strong>Recommended:</strong> {kycContext.recommendedPreset.toUpperCase()}
          </div>
          <div className="kyc-item">
            <strong>Confidence:</strong> {kycContext.confidenceScore}%
          </div>
          <div className="kyc-item">
            <strong>Custom Requirements:</strong> {kycContext.uniqueRequirements.length}
          </div>
          {kycContext.warnings.length > 0 && (
            <div className="kyc-warnings">
              <strong>⚠ {kycContext.warnings.length} warning(s)</strong>
            </div>
          )}
        </div>
      )}

      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'spaces' ? 'active' : ''}`}
          onClick={() => setActiveTab('spaces')}
        >
          Spaces ({state.spaces.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'adjacency' ? 'active' : ''}`}
          onClick={() => setActiveTab('adjacency')}
        >
          Adjacency
        </button>
        <button
          className={`tab-btn ${activeTab === 'bridges' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridges')}
        >
          Bridges
        </button>
        <button
          className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
          {validationPreview && (
            <span className={`validation-badge ${validationPreview.gateStatus}`}>
              {validationPreview.gateStatus}
            </span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'changes' ? 'active' : ''}`}
          onClick={() => setActiveTab('changes')}
        >
          Changes ({state.appliedChanges.length})
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'spaces' && renderSpacesTab()}
        {activeTab === 'adjacency' && (
          <AdjacencyMatrix
            spaces={state.spaces}
            adjacencyMatrix={state.adjacencyMatrix}
            onUpdate={setAdjacency}
            getAdjacency={getAdjacency}
          />
        )}
        {activeTab === 'bridges' && (
          <BridgePanel
            bridgeConfig={state.bridgeConfig}
            onToggle={toggleBridge}
            kycContext={kycContext}
          />
        )}
        {activeTab === 'validation' && (
          <ValidationPanel
            preview={validationPreview}
            isLoading={isLoading}
            onRunValidation={runValidationPreview}
            state={state}
          />
        )}
        {activeTab === 'changes' && (
          <ChangesLog changes={state.appliedChanges} />
        )}
      </main>
    </div>
  );
}

interface AddSpaceModalProps {
  zones: string[];
  levels: number[];
  onAdd: (space: Omit<import('../../shared/schema').BriefSpace, 'id'>) => void;
  onClose: () => void;
}

function AddSpaceModal({ zones, levels, onAdd, onClose }: AddSpaceModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [targetSF, setTargetSF] = useState(100);
  const [zone, setZone] = useState(zones[0] || 'Special Purpose');
  const [level, setLevel] = useState(levels[0] || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    onAdd({
      code: code.toUpperCase(),
      name,
      targetSF,
      zone,
      level,
      rationale: 'Added manually'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add Custom Space</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Code:
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g., ARTSTU"
                maxLength={8}
                required
              />
            </label>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Art Studio"
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Target SF:
              <input
                type="number"
                value={targetSF}
                onChange={e => setTargetSF(Number(e.target.value))}
                min={10}
                max={5000}
              />
            </label>
            <label>
              Level:
              <select value={level} onChange={e => setLevel(Number(e.target.value))}>
                {levels.map(l => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
                <option value={Math.max(...levels) + 1}>
                  Level {Math.max(...levels) + 1} (New)
                </option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Zone:
              <select value={zone} onChange={e => setZone(e.target.value)}>
                {zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
                <option value="Special Purpose">Special Purpose</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Add Space</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BriefingBuilder;
