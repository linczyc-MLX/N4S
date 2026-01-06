/**
 * StructureSelector Component
 * 
 * Toggle between Main Residence, Guest House, and Pool House.
 * Shows SF summary for each structure.
 */

import React from 'react';
import { Home, Building, Waves } from 'lucide-react';

const StructureSelector = ({
  activeStructure,     // 'main' | 'guestHouse' | 'poolHouse'
  onStructureChange,   // Callback when structure selected
  structures,          // Object with structure availability and SF
  // structures = {
  //   main: { enabled: true, totalSF: 14850, spaceCount: 45 },
  //   guestHouse: { enabled: true, totalSF: 1200, spaceCount: 6 },
  //   poolHouse: { enabled: true, totalSF: 800, spaceCount: 5 }
  // }
}) => {
  const structureConfig = [
    { 
      id: 'main', 
      label: 'Main Residence', 
      icon: Home,
      description: 'Primary living spaces'
    },
    { 
      id: 'guestHouse', 
      label: 'Guest House', 
      icon: Building,
      description: 'Separate guest structure'
    },
    { 
      id: 'poolHouse', 
      label: 'Pool House', 
      icon: Waves,
      description: 'Wellness pavilion'
    },
  ];
  
  return (
    <div className="structure-selector">
      <div className="structure-selector__header">
        <span>Structures</span>
      </div>
      
      <div className="structure-selector__options">
        {structureConfig.map(config => {
          const data = structures[config.id];
          const isEnabled = data?.enabled;
          const isActive = activeStructure === config.id;
          const Icon = config.icon;
          
          if (!isEnabled) return null;
          
          return (
            <button
              key={config.id}
              className={`structure-selector__option ${isActive ? 'structure-selector__option--active' : ''}`}
              onClick={() => onStructureChange(config.id)}
            >
              <div className="structure-selector__option-icon">
                <Icon size={20} />
              </div>
              <div className="structure-selector__option-content">
                <div className="structure-selector__option-label">
                  {config.label}
                </div>
                {data?.totalSF > 0 && (
                  <div className="structure-selector__option-stats">
                    {data.totalSF.toLocaleString()} SF
                    {data.spaceCount && (
                      <span className="structure-selector__option-count">
                        {data.spaceCount} spaces
                      </span>
                    )}
                  </div>
                )}
              </div>
              {isActive && (
                <div className="structure-selector__option-indicator" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Grand total across all structures */}
      <div className="structure-selector__grand-total">
        <span>All Structures</span>
        <span>
          {Object.values(structures)
            .filter(s => s.enabled)
            .reduce((sum, s) => sum + (s.totalSF || 0), 0)
            .toLocaleString()} SF
        </span>
      </div>
    </div>
  );
};

export default StructureSelector;
