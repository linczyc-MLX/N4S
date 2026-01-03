/**
 * SpaceEditor Component
 */

import React, { useState } from 'react';
import type { BriefSpace } from '../../shared/schema';

export interface SpaceEditorProps {
  space: BriefSpace;
  onUpdate: (field: keyof BriefSpace, value: any) => void;
  onDelete: () => void;
}

export function SpaceEditor({ space, onUpdate, onDelete }: SpaceEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const coreSpaces = ['FOY', 'GR', 'DR', 'KIT', 'FR', 'PRI', 'PRIBATH'];
  const isCore = coreSpaces.includes(space.code);

  const getZoneColor = (zone: string): string => {
    const colors: Record<string, string> = {
      'Front gallery + showcase': '#e3f2fd',
      'Family hub + service': '#f3e5f5',
      'Private level 2': '#e8f5e9',
      'Service Core': '#fff3e0',
      'Wellness': '#e0f7fa',
      'Entertainment': '#fce4ec',
      'Special Purpose': '#f5f5f5'
    };

    for (const [key, color] of Object.entries(colors)) {
      if (zone.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
        return color;
      }
    }
    return '#f5f5f5';
  };

  return (
    <div
      className="space-editor"
      style={{ backgroundColor: getZoneColor(space.zone) }}
    >
      <div className="space-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="space-code">{space.code}</div>
        <div className="space-name">{space.name}</div>
        <div className="space-sf">
          <input
            type="number"
            value={space.targetSF}
            onChange={e => onUpdate('targetSF', Number(e.target.value))}
            onClick={e => e.stopPropagation()}
            min={10}
            max={5000}
            step={10}
          />
          <span className="sf-label">SF</span>
        </div>
        <button
          className="expand-btn"
          onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-details">
          <div className="detail-row">
            <label>
              Name:
              <input
                type="text"
                value={space.name}
                onChange={e => onUpdate('name', e.target.value)}
              />
            </label>
          </div>

          <div className="detail-row">
            <label>
              Zone:
              <input
                type="text"
                value={space.zone}
                onChange={e => onUpdate('zone', e.target.value)}
              />
            </label>
          </div>

          <div className="detail-row">
            <label>
              Level:
              <select
                value={space.level}
                onChange={e => onUpdate('level', Number(e.target.value))}
              >
                {[1, 2, 3, 4].map(l => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
            </label>
          </div>

          {space.rationale && (
            <div className="detail-row rationale">
              <em>{space.rationale}</em>
            </div>
          )}

          <div className="detail-actions">
            {!isCore && !confirmDelete && (
              <button
                className="delete-btn"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            )}
            {confirmDelete && (
              <div className="confirm-delete">
                <span>Delete {space.name}?</span>
                <button className="confirm-yes" onClick={onDelete}>Yes</button>
                <button className="confirm-no" onClick={() => setConfirmDelete(false)}>No</button>
              </div>
            )}
            {isCore && (
              <span className="core-badge">Core Space</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpaceEditor;
