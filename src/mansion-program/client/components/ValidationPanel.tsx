/**
 * ValidationPanel Component
 */

import React from 'react';
import type { BriefingBuilderState } from '../utils/briefing-builder-utils';

export interface ValidationPreview {
  gateStatus: 'pass' | 'warning' | 'fail';
  overallScore: number;
  redFlagCount: number;
  missingBridgeCount: number;
  messages: string[];
}

export interface ValidationPanelProps {
  preview: ValidationPreview | null;
  isLoading: boolean;
  onRunValidation: () => void;
  state: BriefingBuilderState;
}

export function ValidationPanel({ preview, isLoading, onRunValidation, state }: ValidationPanelProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pass': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'fail': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'pass': return '✓';
      case 'warning': return '⚠';
      case 'fail': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="validation-panel">
      <header className="panel-header">
        <h2>Validation Preview</h2>
        <p className="panel-description">
          Run the validation engine against your current briefing to check for
          red flags, missing bridges, and module scores before exporting.
        </p>
      </header>

      <div className="brief-stats">
        <h3>Current Brief</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{state.spaces.length}</span>
            <span className="stat-label">Spaces</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{state.totalSF.toLocaleString()}</span>
            <span className="stat-label">Total SF</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{state.adjacencyMatrix.length}</span>
            <span className="stat-label">Adjacencies</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{state.appliedChanges.length}</span>
            <span className="stat-label">Modifications</span>
          </div>
        </div>
      </div>

      <div className="validation-action">
        <button
          className="run-validation-btn"
          onClick={onRunValidation}
          disabled={isLoading}
        >
          {isLoading ? 'Running...' : 'Run Validation Preview'}
        </button>
        {state.isDirty && (
          <span className="dirty-note">Brief has unsaved changes</span>
        )}
      </div>

      {preview && (
        <div className="validation-results">
          <div
            className="gate-status"
            style={{ backgroundColor: getStatusColor(preview.gateStatus) }}
          >
            <span className="status-emoji">{getStatusEmoji(preview.gateStatus)}</span>
            <span className="status-text">
              {preview.gateStatus.toUpperCase()}
            </span>
          </div>

          <div className="score-display">
            <div
              className="score-circle"
              style={{
                borderColor: preview.overallScore >= 80 ? '#4caf50' :
                             preview.overallScore >= 60 ? '#ff9800' : '#f44336'
              }}
            >
              <span className="score-value">{preview.overallScore}</span>
              <span className="score-label">/ 100</span>
            </div>
            <span className="score-threshold">
              Threshold: 80
            </span>
          </div>

          <div className="result-stats">
            <div className={`result-stat ${preview.redFlagCount > 0 ? 'has-issues' : 'clear'}`}>
              <span className="stat-value">{preview.redFlagCount}</span>
              <span className="stat-label">Red Flags</span>
            </div>
            <div className={`result-stat ${preview.missingBridgeCount > 0 ? 'has-issues' : 'clear'}`}>
              <span className="stat-value">{preview.missingBridgeCount}</span>
              <span className="stat-label">Missing Bridges</span>
            </div>
          </div>

          {preview.messages.length > 0 && (
            <div className="validation-messages">
              <h4>Issues & Warnings</h4>
              <ul className="message-list">
                {preview.messages.map((msg, i) => {
                  const isCritical = msg.startsWith('[CRITICAL]');
                  const isWarning = msg.startsWith('[WARNING]');
                  const isMissing = msg.startsWith('[MISSING]');
                  const isScore = msg.startsWith('[SCORE]');

                  let className = 'message-item';
                  if (isCritical) className += ' critical';
                  else if (isWarning) className += ' warning';
                  else if (isMissing) className += ' missing';
                  else if (isScore) className += ' score';

                  return (
                    <li key={i} className={className}>
                      {msg}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {preview.messages.length === 0 && preview.gateStatus === 'pass' && (
            <div className="validation-success">
              <span className="success-emoji">🎉</span>
              <p>All checks passed! Your brief is ready for export.</p>
            </div>
          )}
        </div>
      )}

      {!preview && !isLoading && (
        <div className="no-preview">
          <p>Click "Run Validation Preview" to check your brief against the N4S validation rules.</p>
          <div className="preview-checks">
            <h4>Validation will check:</h4>
            <ul>
              <li>5 Critical Red Flags (circulation, acoustics, kitchen)</li>
              <li>5 Operational Bridges (butler pantry, guest autonomy, etc.)</li>
              <li>8 Module Scores (kitchen, entertaining, primary suite, etc.)</li>
              <li>Adjacency conflicts in your matrix</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationPanel;
