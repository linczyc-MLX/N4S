/**
 * LevelDiagram Component
 * 
 * Visual representation of building levels showing SF distribution.
 * Shows all available levels based on KYC configuration.
 * Click to filter space cards by level.
 */

import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';

const LevelDiagram = ({
  levels,           // Array of { value, label } from buildAvailableLevels()
  sfByLevel,        // Object { 'L2': 4000, 'L1': 8000, 'L-1': 2850 }
  totalSF,          // Total SF across all levels
  targetSF,         // Target SF from settings
  selectedLevel,    // Currently selected level filter (null = all)
  onLevelSelect,    // Callback when level clicked
  structure,        // Current structure: 'main' | 'guestHouse' | 'poolHouse'
}) => {
  // Calculate max SF for scaling bars
  const maxLevelSF = Math.max(...Object.values(sfByLevel), 1);
  
  // Calculate percentage fill for each level
  const getLevelFill = (levelValue) => {
    const key = levelValue === 1 ? 'L1' : `L${levelValue}`;
    const sf = sfByLevel[key] || 0;
    return (sf / maxLevelSF) * 100;
  };
  
  // Get SF for a level
  const getLevelSF = (levelValue) => {
    const key = levelValue === 1 ? 'L1' : `L${levelValue}`;
    return sfByLevel[key] || 0;
  };
  
  // Get percentage of total for a level
  const getLevelPercent = (levelValue) => {
    if (totalSF === 0) return 0;
    return Math.round((getLevelSF(levelValue) / totalSF) * 100);
  };
  
  // Find arrival level index for arrow positioning
  const arrivalIndex = levels.findIndex(l => l.value === 1);
  
  return (
    <div className="level-diagram">
      <div className="level-diagram__header">
        <Building2 size={18} />
        <span>{structure === 'main' ? 'Main Residence' : 
               structure === 'guestHouse' ? 'Guest House' : 'Pool House'}</span>
      </div>
      
      <div className="level-diagram__stack">
        {levels.map((level, index) => {
          const isArrival = level.value === 1;
          const isSelected = selectedLevel === level.value;
          const sf = getLevelSF(level.value);
          const fill = getLevelFill(level.value);
          const percent = getLevelPercent(level.value);
          
          return (
            <div 
              key={level.value}
              className={`level-diagram__level ${isArrival ? 'level-diagram__level--arrival' : ''} ${isSelected ? 'level-diagram__level--selected' : ''}`}
              onClick={() => onLevelSelect(isSelected ? null : level.value)}
            >
              {/* Arrival indicator */}
              {isArrival && (
                <div className="level-diagram__arrival-indicator">
                  <ArrowRight size={14} />
                </div>
              )}
              
              {/* Level label */}
              <div className="level-diagram__label">
                {level.value > 0 ? `L${level.value}` : `L${level.value}`}
              </div>
              
              {/* SF bar */}
              <div className="level-diagram__bar-container">
                <div 
                  className="level-diagram__bar"
                  style={{ width: `${fill}%` }}
                />
              </div>
              
              {/* SF value */}
              <div className="level-diagram__sf">
                {sf > 0 ? sf.toLocaleString() : '—'}
              </div>
              
              {/* Percentage */}
              {sf > 0 && (
                <div className="level-diagram__percent">
                  {percent}%
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Totals */}
      <div className="level-diagram__totals">
        <div className="level-diagram__total-row">
          <span>Net Program</span>
          <span>{totalSF.toLocaleString()} SF</span>
        </div>
        <div className="level-diagram__total-row level-diagram__total-row--target">
          <span>Target</span>
          <span>{targetSF.toLocaleString()} SF</span>
        </div>
        <div className={`level-diagram__total-row level-diagram__total-row--delta ${totalSF > targetSF ? 'level-diagram__total-row--over' : totalSF < targetSF ? 'level-diagram__total-row--under' : ''}`}>
          <span>Delta</span>
          <span>{totalSF > targetSF ? '+' : ''}{(totalSF - targetSF).toLocaleString()} SF</span>
        </div>
      </div>
      
      {/* Filter hint */}
      {selectedLevel && (
        <div className="level-diagram__filter-hint">
          Showing {levels.find(l => l.value === selectedLevel)?.label} only
          <button onClick={() => onLevelSelect(null)}>Show all</button>
        </div>
      )}
    </div>
  );
};

export default LevelDiagram;
