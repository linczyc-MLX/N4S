/**
 * FYITotalsPanel Component
 * 
 * Right sidebar showing project settings, running totals, and export options.
 * Supports multi-structure display (Main, Guest House, Pool House).
 */

import React, { useState } from 'react';
import { validateFYISelections } from '../utils/fyiBridges';
import { getLevelLabel } from '../../../shared/space-registry';

const FYITotalsPanel = ({
  settings,
  totals,
  selections,
  structureTotals,   // { main: {...}, guestHouse: {...}, poolHouse: {...} }
  availableLevels,   // Array from buildAvailableLevels()
  onSettingsChange,
  onExportPDF,
  onProceedToMVP,
  isExporting
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedStructures, setExpandedStructures] = useState({ main: true });
  
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
  
  // Calculate grand total across all structures
  const grandTotal = Object.values(structureTotals || {})
    .filter(s => s?.enabled)
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Progress bar percentage (using grand total)
  const progressPct = Math.min(120, Math.max(0, (grandTotal / settings.targetSF) * 100));
  const isOverTarget = grandTotal > settings.targetSF;
  const isUnderTarget = grandTotal < settings.targetSF * 0.9;
  
  // Toggle structure expansion
  const toggleStructure = (structureId) => {
    setExpandedStructures(prev => ({
      ...prev,
      [structureId]: !prev[structureId]
    }));
  };
  
  // Render level breakdown for a structure
  const renderLevelBreakdown = (byLevel) => {
    if (!byLevel || !availableLevels) return null;
    
    return availableLevels.map(level => {
      const levelKey = level.value === 1 ? 1 : level.value;
      const sf = byLevel[levelKey] || 0;
      if (sf === 0) return null;
      
      return (
        <div key={level.value} className="fyi-totals-panel__level-row">
          <span>{getLevelLabel(level.value)}</span>
          <span>{sf.toLocaleString()} SF</span>
        </div>
      );
    });
  };
  
  return (
    <div className="fyi-totals-panel">
      <h3 className="fyi-totals-panel__title">Program Summary</h3>
      
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
              {tier === '10k' && '10K'}
              {tier === '15k' && '15K'}
              {tier === '20k' && '20K'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Target SF Input */}
      <div className="fyi-totals-panel__section">
        <label className="fyi-totals-panel__label">Target SF (All Structures)</label>
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
          <div className="fyi-totals-panel__progress-target" />
        </div>
      </div>
      
      {/* Structure-by-Structure Breakdown */}
      <div className="fyi-totals-panel__structures">
        {/* Main Residence */}
        {structureTotals?.main?.enabled && (
          <div className="fyi-totals-panel__structure">
            <button 
              className="fyi-totals-panel__structure-header"
              onClick={() => toggleStructure('main')}
            >
              <span>Main Residence</span>
              <span>{structureTotals.main.total?.toLocaleString() || 0} SF</span>
              <svg className={`fyi-totals-panel__chevron ${expandedStructures.main ? 'fyi-totals-panel__chevron--open' : ''}`} viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor"/>
              </svg>
            </button>
            {expandedStructures.main && (
              <div className="fyi-totals-panel__structure-details">
                <div className="fyi-totals-panel__row">
                  <span>Net Program</span>
                  <span>{structureTotals.main.net?.toLocaleString() || 0} SF</span>
                </div>
                <div className="fyi-totals-panel__row fyi-totals-panel__row--sub">
                  <span>Circulation ({structureTotals.main.circulationPct || 0}%)</span>
                  <span>{structureTotals.main.circulation?.toLocaleString() || 0} SF</span>
                </div>
                <div className="fyi-totals-panel__levels">
                  <label className="fyi-totals-panel__label fyi-totals-panel__label--small">By Level</label>
                  {renderLevelBreakdown(structureTotals.main.byLevel)}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Guest House */}
        {structureTotals?.guestHouse?.enabled && (
          <div className="fyi-totals-panel__structure">
            <button 
              className="fyi-totals-panel__structure-header"
              onClick={() => toggleStructure('guestHouse')}
            >
              <span>Guest House</span>
              <span>{structureTotals.guestHouse.total?.toLocaleString() || 0} SF</span>
              <svg className={`fyi-totals-panel__chevron ${expandedStructures.guestHouse ? 'fyi-totals-panel__chevron--open' : ''}`} viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor"/>
              </svg>
            </button>
            {expandedStructures.guestHouse && (
              <div className="fyi-totals-panel__structure-details">
                <div className="fyi-totals-panel__row">
                  <span>Spaces</span>
                  <span>{structureTotals.guestHouse.spaceCount || 0}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pool House */}
        {structureTotals?.poolHouse?.enabled && (
          <div className="fyi-totals-panel__structure">
            <button 
              className="fyi-totals-panel__structure-header"
              onClick={() => toggleStructure('poolHouse')}
            >
              <span>Pool House</span>
              <span>{structureTotals.poolHouse.total?.toLocaleString() || 0} SF</span>
              <svg className={`fyi-totals-panel__chevron ${expandedStructures.poolHouse ? 'fyi-totals-panel__chevron--open' : ''}`} viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor"/>
              </svg>
            </button>
            {expandedStructures.poolHouse && (
              <div className="fyi-totals-panel__structure-details">
                <div className="fyi-totals-panel__row">
                  <span>Spaces</span>
                  <span>{structureTotals.poolHouse.spaceCount || 0}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Grand Total */}
      <div className="fyi-totals-panel__section fyi-totals-panel__grand-total">
        <div className="fyi-totals-panel__row fyi-totals-panel__row--total">
          <span>Grand Total</span>
          <strong>{grandTotal.toLocaleString()} SF</strong>
        </div>
        <div className={`fyi-totals-panel__row fyi-totals-panel__row--delta ${
          grandTotal > settings.targetSF ? 'fyi-totals-panel__row--over' :
          grandTotal < settings.targetSF ? 'fyi-totals-panel__row--under' : ''
        }`}>
          <span>Delta from Target</span>
          <span>
            {grandTotal > settings.targetSF ? '+' : ''}
            {(grandTotal - settings.targetSF).toLocaleString()} SF
          </span>
        </div>
        
        {totals.outdoorTotal > 0 && (
          <div className="fyi-totals-panel__row fyi-totals-panel__row--outdoor">
            <span>Outdoor (not conditioned)</span>
            <span>{totals.outdoorTotal.toLocaleString()} SF</span>
          </div>
        )}
      </div>
      
      {/* Advanced Settings */}
      <button 
        className="fyi-totals-panel__advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        Settings
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
            <label>Circulation</label>
            <select
              value={settings.lockToTarget ? 'balance' : 'fixed'}
              onChange={(e) => onSettingsChange({ lockToTarget: e.target.value === 'balance' })}
              className="fyi-totals-panel__select"
            >
              <option value="balance">Balance to Target</option>
              <option value="fixed">Fixed %</option>
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
        </div>
      )}
      
      {/* Validation Warnings */}
      {(validation.warnings.length > 0 || validation.errors.length > 0) && (
        <div className="fyi-totals-panel__validation">
          {validation.errors.map((error, i) => (
            <div key={`error-${i}`} className="fyi-totals-panel__validation-error">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error.message}
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={`warning-${i}`} className="fyi-totals-panel__validation-warning">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
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
