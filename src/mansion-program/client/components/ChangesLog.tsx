/**
 * ChangesLog Component
 */

import React from 'react';
import type { AppliedChange } from '../utils/briefing-builder-utils';

export interface ChangesLogProps {
  changes: AppliedChange[];
}

export function ChangesLog({ changes }: ChangesLogProps) {
  const addedChanges = changes.filter(c => c.type === 'added');
  const modifiedChanges = changes.filter(c => c.type === 'modified');
  const removedChanges = changes.filter(c => c.type === 'removed');

  const sources = [...new Set(changes.map(c => c.source))];
  const kycSources = sources.filter(s => s.includes('.') || s.includes('bridgeConfig'));
  const manualSources = sources.filter(s => s === 'manual' || s === 'Added manually');

  const getChangeIcon = (type: AppliedChange['type']): string => {
    switch (type) {
      case 'added': return '+';
      case 'modified': return '✎';
      case 'removed': return '−';
      default: return '•';
    }
  };

  const getChangeColor = (type: AppliedChange['type']): string => {
    switch (type) {
      case 'added': return '#4caf50';
      case 'modified': return '#2196f3';
      case 'removed': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatSource = (source: string): string => {
    if (source.startsWith('bridgeConfig.')) {
      return `Bridge: ${source.replace('bridgeConfig.', '')}`;
    }
    if (source.includes('.')) {
      const [section, field] = source.split('.');
      return `KYC: ${section} → ${field}`;
    }
    return source;
  };

  return (
    <div className="changes-log">
      <header className="panel-header">
        <h2>Applied Changes</h2>
        <p className="panel-description">
          This log shows all modifications made to the baseline preset,
          including automatic changes from KYC requirements and manual edits.
        </p>
      </header>

      <div className="changes-summary">
        <div className="summary-stat added">
          <span className="stat-value">{addedChanges.length}</span>
          <span className="stat-label">Added</span>
        </div>
        <div className="summary-stat modified">
          <span className="stat-value">{modifiedChanges.length}</span>
          <span className="stat-label">Modified</span>
        </div>
        <div className="summary-stat removed">
          <span className="stat-value">{removedChanges.length}</span>
          <span className="stat-label">Removed</span>
        </div>
      </div>

      <div className="source-breakdown">
        <span className="source-item kyc">
          <strong>{kycSources.length}</strong> from KYC
        </span>
        <span className="source-item manual">
          <strong>{manualSources.length}</strong> manual
        </span>
      </div>

      {changes.length > 0 ? (
        <div className="changes-list">
          {changes.map((change, index) => (
            <div
              key={index}
              className={`change-item ${change.type}`}
            >
              <div
                className="change-icon"
                style={{ backgroundColor: getChangeColor(change.type) }}
              >
                {getChangeIcon(change.type)}
              </div>

              <div className="change-content">
                <div className="change-header">
                  <span className="space-code">{change.spaceCode}</span>
                  <span className="change-type">{change.type}</span>
                </div>
                <div className="change-description">
                  {change.description}
                </div>
                <div className="change-source">
                  {formatSource(change.source)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-changes">
          <p>No changes have been applied to the baseline preset yet.</p>
          <p className="hint">
            Changes will appear here when you modify spaces, adjust SF allocations,
            or apply requirements from KYC.
          </p>
        </div>
      )}

      {changes.length > 0 && (
        <div className="export-info">
          <h4>Export Note</h4>
          <p>
            When you export this brief, these {changes.length} change(s) will be
            documented in the Executive Summary for architect reference.
          </p>
        </div>
      )}
    </div>
  );
}

export default ChangesLog;
