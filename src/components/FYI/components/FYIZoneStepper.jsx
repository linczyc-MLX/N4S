/**
 * FYIZoneStepper Component
 * 
 * Left sidebar navigation showing all 8 zones with space counts and SF totals.
 */

import React from 'react';

const FYIZoneStepper = ({ 
  zones, 
  activeZone, 
  onZoneChange,
  totals 
}) => {
  return (
    <div className="fyi-zone-stepper">
      <h3 className="fyi-zone-stepper__title">Program Zones</h3>
      
      <div className="fyi-zone-stepper__list">
        {zones.map((zone) => {
          const isActive = zone.code === activeZone;
          const isOutdoor = zone.code === 'Z8_OUT';
          
          return (
            <button
              key={zone.code}
              className={`fyi-zone-stepper__item ${isActive ? 'fyi-zone-stepper__item--active' : ''}`}
              onClick={() => onZoneChange(zone.code)}
            >
              <div className="fyi-zone-stepper__item-header">
                <span className="fyi-zone-stepper__item-name">{zone.name}</span>
                <span className="fyi-zone-stepper__item-count">
                  {zone.includedCount}/{zone.spaceCount}
                </span>
              </div>
              
              <div className="fyi-zone-stepper__item-sf">
                {zone.totalSF > 0 ? (
                  <>
                    <span className="fyi-zone-stepper__sf-value">
                      {zone.totalSF.toLocaleString()}
                    </span>
                    <span className="fyi-zone-stepper__sf-label">
                      {isOutdoor ? 'SF (exterior)' : 'SF'}
                    </span>
                  </>
                ) : (
                  <span className="fyi-zone-stepper__sf-empty">—</span>
                )}
              </div>
              
              {isActive && (
                <div className="fyi-zone-stepper__item-indicator" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Summary at bottom */}
      <div className="fyi-zone-stepper__summary">
        <div className="fyi-zone-stepper__summary-row">
          <span>Net Conditioned</span>
          <strong>{totals.net.toLocaleString()} SF</strong>
        </div>
        <div className="fyi-zone-stepper__summary-row">
          <span>Circulation ({totals.circulationPct}%)</span>
          <span>{totals.circulation.toLocaleString()} SF</span>
        </div>
        <div className="fyi-zone-stepper__summary-row fyi-zone-stepper__summary-row--total">
          <span>Total</span>
          <strong>{totals.total.toLocaleString()} SF</strong>
        </div>
        <div className={`fyi-zone-stepper__summary-row fyi-zone-stepper__summary-row--delta ${
          totals.deltaFromTarget > 0 ? 'fyi-zone-stepper__summary-row--over' : 
          totals.deltaFromTarget < 0 ? 'fyi-zone-stepper__summary-row--under' : ''
        }`}>
          <span>vs Target</span>
          <span>
            {totals.deltaFromTarget > 0 ? '+' : ''}
            {totals.deltaFromTarget.toLocaleString()} SF
          </span>
        </div>
      </div>
    </div>
  );
};

export default FYIZoneStepper;
