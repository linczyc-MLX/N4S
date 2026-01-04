/**
 * FYITotalsPanel Component
 * 
 * Right sidebar showing project settings, running totals, and export options.
 */

import React, { useState } from 'react';
import { validateFYISelections } from '../utils/fyiBridges';

const FYITotalsPanel = ({
  settings,
  totals,
  selections,
  onSettingsChange,
  onExportPDF,
  onProceedToMVP,
  isExporting
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Validate current state
  const validation = validateFYISelections(selections, settings);
  
  // Handle tier change
  const handleTierChange = (tier) => {
    const tierTargets = {
      '10k': 10000,
      '15k': 15000,
      '20k': 20000
    };
    onSettingsChange({
      programTier: tier,
      targetSF: tierTargets[tier]
    });
  };
  
  // Progress bar percentage
  const progressPct = Math.min(100, Math.max(0, (totals.total / totals.targetSF) * 100));
  const isOverTarget = totals.total > totals.targetSF;
  const isUnderTarget = totals.total < totals.targetSF * 0.9;
  
  return (
    <div className="fyi-totals-panel">
      <h3 className="fyi-totals-panel__title">Project Brief</h3>
      
      {/* Program Tier Selection */}
      <div className="fyi-totals-panel__section">
        <label className="fyi-totals-panel__label">Program Size</label>
        <div className="fyi-totals-panel__tier-selector">
          {['10k', '15k', '20k'].map(tier => (
            <button
              key={tier}
              className={`fyi-totals-panel__tier-btn ${settings.programTier === tier ? 'fyi-totals-panel__tier-btn--active' : ''}`}
              onClick={() => handleTierChange(tier)}
            >
              {tier === '10k' && '10,000 SF'}
              {tier === '15k' && '15,000 SF'}
              {tier === '20k' && '20,000 SF'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Target SF Input */}
      <div className="fyi-totals-panel__section">
        <label className="fyi-totals-panel__label">Target Conditioned SF</label>
        <div className="fyi-totals-panel__input-group">
          <input
            type="number"
            value={settings.targetSF}
            onChange={(e) => onSettingsChange({ targetSF: parseInt(e.target.value) || 0 })}
            className="fyi-totals-panel__input"
            min={5000}
            max={50000}
            step={500}
          />
          <span className="fyi-totals-panel__input-suffix">SF</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="fyi-totals-panel__section">
        <div className="fyi-totals-panel__progress-header">
          <span>Progress to Target</span>
          <span className={`fyi-totals-panel__progress-pct ${
            isOverTarget ? 'fyi-totals-panel__progress-pct--over' : 
            isUnderTarget ? 'fyi-totals-panel__progress-pct--under' : ''
          }`}>
            {progressPct.toFixed(0)}%
          </span>
        </div>
        <div className="fyi-totals-panel__progress-bar">
          <div 
            className={`fyi-totals-panel__progress-fill ${
              isOverTarget ? 'fyi-totals-panel__progress-fill--over' : ''
            }`}
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
          <div className="fyi-totals-panel__progress-target" style={{ left: '100%' }} />
        </div>
      </div>
      
      {/* Totals Breakdown */}
      <div className="fyi-totals-panel__section fyi-totals-panel__breakdown">
        <div className="fyi-totals-panel__row">
          <span>Net Program</span>
          <strong>{totals.net.toLocaleString()} SF</strong>
        </div>
        <div className="fyi-totals-panel__row fyi-totals-panel__row--sub">
          <span>Circulation ({totals.circulationPct}%)</span>
          <span>{totals.circulation.toLocaleString()} SF</span>
        </div>
        <div className="fyi-totals-panel__row fyi-totals-panel__row--total">
          <span>Total Conditioned</span>
          <strong>{totals.total.toLocaleString()} SF</strong>
        </div>
        <div className={`fyi-totals-panel__row fyi-totals-panel__row--delta ${
          totals.deltaFromTarget > 0 ? 'fyi-totals-panel__row--over' :
          totals.deltaFromTarget < 0 ? 'fyi-totals-panel__row--under' : ''
        }`}>
          <span>Delta from Target</span>
          <span>
            {totals.deltaFromTarget > 0 ? '+' : ''}
            {totals.deltaFromTarget.toLocaleString()} SF
          </span>
        </div>
        
        {totals.outdoorTotal > 0 && (
          <div className="fyi-totals-panel__row fyi-totals-panel__row--outdoor">
            <span>Outdoor (not conditioned)</span>
            <span>{totals.outdoorTotal.toLocaleString()} SF</span>
          </div>
        )}
      </div>
      
      {/* Level Breakdown */}
      <div className="fyi-totals-panel__section">
        <label className="fyi-totals-panel__label">By Level</label>
        <div className="fyi-totals-panel__levels">
          {totals.byLevel[2] > 0 && (
            <div className="fyi-totals-panel__level-row">
              <span>Level 2</span>
              <span>{totals.byLevel[2].toLocaleString()} SF</span>
            </div>
          )}
          {totals.byLevel[1] > 0 && (
            <div className="fyi-totals-panel__level-row">
              <span>Level 1</span>
              <span>{totals.byLevel[1].toLocaleString()} SF</span>
            </div>
          )}
          {settings.hasBasement && totals.byLevel[-1] > 0 && (
            <div className="fyi-totals-panel__level-row">
              <span>Level -1</span>
              <span>{totals.byLevel[-1].toLocaleString()} SF</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Settings */}
      <button 
        className="fyi-totals-panel__advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        Advanced Settings
        <svg 
          className={`fyi-totals-panel__chevron ${showAdvanced ? 'fyi-totals-panel__chevron--open' : ''}`}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor"/>
        </svg>
      </button>
      
      {showAdvanced && (
        <div className="fyi-totals-panel__advanced">
          {/* Delta Percentage */}
          <div className="fyi-totals-panel__row">
            <label>Size Delta (S/L)</label>
            <div className="fyi-totals-panel__input-group fyi-totals-panel__input-group--small">
              <input
                type="number"
                value={settings.deltaPct}
                onChange={(e) => onSettingsChange({ deltaPct: parseInt(e.target.value) || 10 })}
                className="fyi-totals-panel__input"
                min={5}
                max={25}
              />
              <span className="fyi-totals-panel__input-suffix">%</span>
            </div>
          </div>
          
          {/* Circulation Mode */}
          <div className="fyi-totals-panel__row">
            <label>Circulation Mode</label>
            <select
              value={settings.lockToTarget ? 'balance' : 'fixed'}
              onChange={(e) => onSettingsChange({ lockToTarget: e.target.value === 'balance' })}
              className="fyi-totals-panel__select"
            >
              <option value="balance">Balance to Target</option>
              <option value="fixed">Fixed Percentage</option>
            </select>
          </div>
          
          {/* Circulation Percentage (when fixed) */}
          {!settings.lockToTarget && (
            <div className="fyi-totals-panel__row">
              <label>Circulation %</label>
              <div className="fyi-totals-panel__input-group fyi-totals-panel__input-group--small">
                <input
                  type="number"
                  value={Math.round(settings.circulationPct * 100)}
                  onChange={(e) => onSettingsChange({ circulationPct: (parseInt(e.target.value) || 13) / 100 })}
                  className="fyi-totals-panel__input"
                  min={10}
                  max={20}
                />
                <span className="fyi-totals-panel__input-suffix">%</span>
              </div>
            </div>
          )}
          
          {/* Basement Toggle */}
          <div className="fyi-totals-panel__row">
            <label>Include Basement</label>
            <label className="fyi-totals-panel__toggle">
              <input
                type="checkbox"
                checked={settings.hasBasement}
                onChange={(e) => onSettingsChange({ hasBasement: e.target.checked })}
              />
              <span className="fyi-totals-panel__toggle-slider" />
            </label>
          </div>
        </div>
      )}
      
      {/* Validation Warnings */}
      {(validation.warnings.length > 0 || validation.errors.length > 0) && (
        <div className="fyi-totals-panel__validation">
          {validation.errors.map((error, i) => (
            <div key={`error-${i}`} className="fyi-totals-panel__validation-error">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error.message}
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={`warning-${i}`} className="fyi-totals-panel__validation-warning">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              {warning.message}
            </div>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="fyi-totals-panel__actions">
        <button
          className="fyi-totals-panel__btn fyi-totals-panel__btn--secondary"
          onClick={onExportPDF}
          disabled={isExporting}
        >
          {isExporting ? 'Generating...' : 'Export PDF'}
        </button>
        
        <button
          className="fyi-totals-panel__btn fyi-totals-panel__btn--primary"
          onClick={onProceedToMVP}
          disabled={!validation.valid}
        >
          Proceed to MVP →
        </button>
      </div>
      
      {!validation.valid && (
        <p className="fyi-totals-panel__hint">
          Resolve errors above to proceed
        </p>
      )}
    </div>
  );
};

export default FYITotalsPanel;
