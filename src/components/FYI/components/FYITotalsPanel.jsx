/**
 * FYITotalsPanel Component
 * 
 * Right sidebar showing project settings, running totals, and export options.
 * Supports multi-structure display (Main, Guest House, Pool House).
 * 
 * UPDATED: Removed tier selector - tiers are internal algorithm logic.
 * Display focuses on: Target SF, Current SF, Delta
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
  
  // Calculate grand total across all structures
  const grandTotal = Object.values(structureTotals || {})
    .filter(s => s?.enabled)
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Delta calculation
  const delta = grandTotal - settings.targetSF;
  const isOverTarget = delta > 0;
  const isUnderTarget = delta < 0;
  const deltaPercent = settings.targetSF > 0 
    ? ((delta / settings.targetSF) * 100).toFixed(0) 
    : 0;
  
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
      
      {/* Target SF Display (from KYC) */}
      <div className="fyi-totals-panel__section">
        <label className="fyi-totals-panel__label">Target SF</label>
        <div className="fyi-totals-panel__target-display">
          <span className="fyi-totals-panel__target-value">
            {settings.targetSF?.toLocaleString() || 0} SF
          </span>
          <span className="fyi-totals-panel__target-source">from KYC</span>
        </div>
      </div>
      
      {/* Current SF Display */}
      <div className="fyi-totals-panel__section">
        <label className="fyi-totals-panel__label">Current Program</label>
        <div className="fyi-totals-panel__current-display">
          <span className="fyi-totals-panel__current-value">
            {grandTotal.toLocaleString()} SF
          </span>
        </div>
      </div>
      
      {/* Delta Display - Prominent */}
      <div className={`fyi-totals-panel__delta-box ${
        isOverTarget ? 'fyi-totals-panel__delta-box--over' : 
        isUnderTarget ? 'fyi-totals-panel__delta-box--under' : 
        'fyi-totals-panel__delta-box--balanced'
      }`}>
        <label className="fyi-totals-panel__label">Delta from Target</label>
        <div className="fyi-totals-panel__delta-value">
          {delta > 0 ? '+' : ''}{delta.toLocaleString()} SF
        </div>
        <div className="fyi-totals-panel__delta-percent">
          ({delta > 0 ? '+' : ''}{deltaPercent}%)
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
      
      {/* Outdoor Total (if any) */}
      {totals.outdoorTotal > 0 && (
        <div className="fyi-totals-panel__section fyi-totals-panel__outdoor">
          <div className="fyi-totals-panel__row">
            <span>Outdoor (not conditioned)</span>
            <span>{totals.outdoorTotal.toLocaleString()} SF</span>
          </div>
        </div>
      )}
      
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
          {/* Target SF Override */}
          <div className="fyi-totals-panel__row">
            <label>Target SF</label>
            <div className="fyi-totals-panel__input-group fyi-totals-panel__input-group--small">
              <input
                type="number"
                value={settings.targetSF}
                onChange={(e) => onSettingsChange({ targetSF: parseInt(e.target.value) || 0 })}
                className="fyi-totals-panel__input"
                min={3000}
                max={50000}
                step={500}
              />
              <span className="fyi-totals-panel__input-suffix">SF</span>
            </div>
          </div>
          
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
        <div className="fyi-totals-panel__export-group">
          <span className="fyi-totals-panel__export-label">Export PDF:</span>
          <div className="fyi-totals-panel__export-buttons">
            <button
              className="fyi-totals-panel__btn fyi-totals-panel__btn--secondary fyi-totals-panel__btn--small"
              onClick={() => onExportPDF('zone')}
              disabled={isExporting}
              title="Group spaces by zone (APB, FAM, ENT, etc.)"
            >
              {isExporting ? '...' : 'By Zone'}
            </button>
            <button
              className="fyi-totals-panel__btn fyi-totals-panel__btn--secondary fyi-totals-panel__btn--small"
              onClick={() => onExportPDF('level')}
              disabled={isExporting}
              title="Group spaces by level (L2, L1, Basement)"
            >
              {isExporting ? '...' : 'By Level'}
            </button>
          </div>
        </div>

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
