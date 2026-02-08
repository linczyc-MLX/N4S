/**
 * ProgramSummaryView
 * 
 * Read-only display of the imported mansion program.
 * Shows spaces, zones, and areas as imported from FYI module.
 * 
 * NO EDITING - all changes must be made in FYI module.
 * This is reference only so users can verify what's being validated.
 * 
 * Follows N4S Brand Guide styling.
 */

import React, { useMemo, useContext } from 'react';
import { 
  ArrowLeft, 
  Home, 
  Users, 
  Dumbbell, 
  Briefcase,
  Car,
  Layers,
  Info,
  ExternalLink
} from 'lucide-react';
import AppContext from '../../contexts/AppContext';
import { useKYCData } from '../../hooks/useKYCData';
import { getPreset } from '../../mansion-program';
import { transformFYIToMVPProgram, getFYIProgramSummary } from '../../lib/mvp-bridge';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
  accentLight: '#f5f0e8',
};

// Zone definitions with icons and colors
const ZONE_CONFIG = {
  'Arrival': { icon: Home, color: '#1e3a5f', order: 1 },
  'Zone 1': { icon: Home, color: '#1e3a5f', order: 1 },
  'Living': { icon: Users, color: '#2e7d32', order: 2 },
  'Zone 2': { icon: Users, color: '#2e7d32', order: 2 },
  'Family': { icon: Users, color: '#2e7d32', order: 2 },
  'Primary': { icon: Home, color: '#7b1fa2', order: 3 },
  'Zone 5': { icon: Home, color: '#7b1fa2', order: 3 },
  'Guest': { icon: Users, color: '#1976d2', order: 4 },
  'Zone 6': { icon: Users, color: '#1976d2', order: 4 },
  'Wellness': { icon: Dumbbell, color: '#00897b', order: 5 },
  'Zone 4': { icon: Dumbbell, color: '#00897b', order: 5 },
  'Service': { icon: Briefcase, color: '#5d4037', order: 6 },
  'Zone 7': { icon: Briefcase, color: '#5d4037', order: 6 },
  'Garage': { icon: Car, color: '#455a64', order: 7 },
  'Zone 8': { icon: Car, color: '#455a64', order: 7 },
  'Outdoor': { icon: Home, color: '#388e3c', order: 8 },
};

/**
 * Get zone config with fallback
 */
function getZoneConfig(zoneName) {
  // Try exact match
  if (ZONE_CONFIG[zoneName]) return ZONE_CONFIG[zoneName];
  
  // Try partial match
  for (const [key, config] of Object.entries(ZONE_CONFIG)) {
    if (zoneName?.toLowerCase().includes(key.toLowerCase())) {
      return config;
    }
  }
  
  // Default
  return { icon: Layers, color: COLORS.textMuted, order: 99 };
}

/**
 * Zone Card Component
 */
function ZoneCard({ zoneName, spaces, totalSF }) {
  const config = getZoneConfig(zoneName);
  const IconComponent = config.icon;
  
  return (
    <div className="psv-zone-card">
      <div className="psv-zone-header" style={{ borderLeftColor: config.color }}>
        <div className="psv-zone-icon" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
          <IconComponent size={18} />
        </div>
        <div className="psv-zone-info">
          <h3 className="psv-zone-name">{zoneName}</h3>
          <span className="psv-zone-meta">
            {spaces.length} space{spaces.length !== 1 ? 's' : ''} • {totalSF.toLocaleString()} SF
          </span>
        </div>
      </div>
      <div className="psv-space-list">
        {spaces.map((space, idx) => (
          <div key={space.code || idx} className="psv-space-row">
            <div className="psv-space-code">{space.code}</div>
            <div className="psv-space-name">{space.name || space.displayName}</div>
            <div className="psv-space-level">L{space.level}</div>
            <div className="psv-space-sf">{(space.targetSF || space.baseSF || 0).toLocaleString()} SF</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Summary Stats Component
 */
function SummaryStats({ totalSpaces, totalSF, levels, zones }) {
  return (
    <div className="psv-stats-grid">
      <div className="psv-stat-card">
        <div className="psv-stat-value">{totalSpaces}</div>
        <div className="psv-stat-label">Spaces</div>
      </div>
      <div className="psv-stat-card">
        <div className="psv-stat-value">{totalSF.toLocaleString()}</div>
        <div className="psv-stat-label">Total SF</div>
      </div>
      <div className="psv-stat-card">
        <div className="psv-stat-value">{levels}</div>
        <div className="psv-stat-label">Levels</div>
      </div>
      <div className="psv-stat-card">
        <div className="psv-stat-value">{zones}</div>
        <div className="psv-stat-label">Zones</div>
      </div>
    </div>
  );
}

/**
 * Main ProgramSummaryView component
 */
export default function ProgramSummaryView({ onBack, onGoToFYI }) {
  // Context
  const { fyiData } = useContext(AppContext);
  const { preset, baseSF } = useKYCData();
  
  // Get preset data (fallback when no FYI)
  const presetData = useMemo(() => {
    try {
      return preset ? getPreset(preset) : null;
    } catch (e) {
      console.error('Failed to get preset:', e);
      return null;
    }
  }, [preset]);

  // FYI data — source of truth when available
  const fyiProgram = useMemo(() => {
    return transformFYIToMVPProgram(fyiData);
  }, [fyiData]);

  const fyiSummary = useMemo(() => {
    return getFYIProgramSummary(fyiProgram);
  }, [fyiProgram]);

  const hasFYIData = !!fyiProgram;

  // Get spaces: prefer FYI, fall back to preset benchmark
  const spaces = hasFYIData ? fyiProgram.spaces : (presetData?.spaces || []);
  
  // Group spaces by zone
  const spacesByZone = useMemo(() => {
    if (hasFYIData && fyiProgram.spacesByZone) {
      // Use FYI's zone grouping (preserves zone names and order)
      return Object.values(fyiProgram.spacesByZone).sort((a, b) => {
        const configA = getZoneConfig(a.name);
        const configB = getZoneConfig(b.name);
        return configA.order - configB.order;
      });
    }

    // Fallback: group preset spaces by zone
    const groups = {};
    spaces.forEach(space => {
      const zone = space.zone || 'Unassigned';
      if (!groups[zone]) {
        groups[zone] = [];
      }
      groups[zone].push(space);
    });
    
    const sortedZones = Object.keys(groups).sort((a, b) => {
      const configA = getZoneConfig(a);
      const configB = getZoneConfig(b);
      return configA.order - configB.order;
    });
    
    return sortedZones.map(zone => ({
      name: zone,
      spaces: groups[zone],
      totalSF: groups[zone].reduce((sum, s) => sum + (s.targetSF || s.baseSF || 0), 0)
    }));
  }, [spaces, hasFYIData, fyiProgram]);

  // Calculate totals — use FYI totals when available (includes circulation)
  const totalSF = hasFYIData ? fyiSummary.totals.totalSF : spaces.reduce((sum, s) => sum + (s.targetSF || s.baseSF || 0), 0);
  const targetSF = hasFYIData ? fyiSummary.targetSF : baseSF;
  const uniqueLevels = hasFYIData 
    ? (fyiSummary.levels?.length || [...new Set(spaces.map(s => s.level))].length)
    : [...new Set(spaces.map(s => s.level))].length;
  const uniqueZones = spacesByZone.length;

  // No data state
  if ((!hasFYIData && !presetData) || spaces.length === 0) {
    return (
      <div className="psv-container">
        <div className="psv-header">
          <button className="psv-back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to MVP Overview
          </button>
          <h1 className="psv-title">Program Summary</h1>
        </div>
        <div className="psv-content">
          <div className="psv-empty-card">
            <Info size={48} color={COLORS.textMuted} />
            <h2>No Program Data</h2>
            <p>Complete the FYI module to define your space program.</p>
            {onGoToFYI && (
              <button className="psv-primary-btn" onClick={onGoToFYI}>
                Go to FYI Module
              </button>
            )}
          </div>
        </div>
        <style>{componentStyles}</style>
      </div>
    );
  }

  return (
    <div className="psv-container">
      {/* Header */}
      <div className="psv-header">
        <button className="psv-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to MVP Overview
        </button>
        <div className="psv-title-row">
          <h1 className="psv-title">Program Summary</h1>
          {preset && <span className="psv-tier-badge">{preset.toUpperCase()} TIER</span>}
        </div>
        <p className="psv-subtitle">
          Imported from FYI module • Read-only reference
        </p>
      </div>

      <div className="psv-content">
        {/* Read-only notice */}
        <div className="psv-notice">
          <Info size={16} />
          <span>
            This view is read-only. To modify spaces or sizes, edit the FYI module.
          </span>
          {onGoToFYI && (
            <button className="psv-link-btn" onClick={onGoToFYI}>
              Edit in FYI <ExternalLink size={12} />
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <SummaryStats 
          totalSpaces={spaces.length}
          totalSF={totalSF}
          levels={uniqueLevels}
          zones={uniqueZones}
        />

        {/* Target vs Actual */}
        {targetSF && (
          <div className="psv-target-card">
            <div className="psv-target-row">
              <span className="psv-target-label">Target SF (from KYC):</span>
              <span className="psv-target-value">{targetSF.toLocaleString()} SF</span>
            </div>
            <div className="psv-target-row">
              <span className="psv-target-label">Program Total:</span>
              <span className="psv-target-value">{totalSF.toLocaleString()} SF</span>
            </div>
            <div className="psv-target-row">
              <span className="psv-target-label">Variance:</span>
              <span className={`psv-target-value ${totalSF > targetSF ? 'over' : 'under'}`}>
                {totalSF > targetSF ? '+' : ''}{(totalSF - targetSF).toLocaleString()} SF
                ({((totalSF - targetSF) / targetSF * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        )}

        {/* Zones Grid */}
        <div className="psv-zones-section">
          <h2 className="psv-section-title">Spaces by Zone</h2>
          <div className="psv-zones-grid">
            {spacesByZone.map(zone => (
              <ZoneCard 
                key={zone.name}
                zoneName={zone.name}
                spaces={zone.spaces}
                totalSF={zone.totalSF}
              />
            ))}
          </div>
        </div>

        {/* Level Distribution */}
        <div className="psv-levels-section">
          <h2 className="psv-section-title">Distribution by Level</h2>
          <div className="psv-levels-grid">
            {[...new Set(spaces.map(s => s.level))].sort().map(level => {
              const levelSpaces = spaces.filter(s => s.level === level);
              const levelSF = levelSpaces.reduce((sum, s) => sum + (s.targetSF || s.baseSF || 0), 0);
              return (
                <div key={level} className="psv-level-card">
                  <div className="psv-level-header">
                    <span className="psv-level-name">Level {level}</span>
                    <span className="psv-level-sf">{levelSF.toLocaleString()} SF</span>
                  </div>
                  <div className="psv-level-bar">
                    <div 
                      className="psv-level-fill" 
                      style={{ width: `${(levelSF / totalSF) * 100}%` }}
                    />
                  </div>
                  <div className="psv-level-meta">
                    {levelSpaces.length} spaces • {((levelSF / totalSF) * 100).toFixed(0)}% of program
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{componentStyles}</style>
    </div>
  );
}

// CSS following N4S Brand Guide
const componentStyles = `
.psv-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.psv-header {
  background-color: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem;
}

.psv-back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.15s ease;
}

.psv-back-btn:hover {
  border-color: ${COLORS.navy};
  color: ${COLORS.navy};
}

.psv-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.psv-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0;
}

.psv-tier-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: ${COLORS.navy};
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.psv-subtitle {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin-top: 0.25rem;
}

.psv-content {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.psv-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: ${COLORS.accentLight};
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: ${COLORS.text};
}

.psv-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: ${COLORS.navy};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: auto;
}

.psv-link-btn:hover {
  text-decoration: underline;
}

.psv-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.psv-stat-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.psv-stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: ${COLORS.navy};
}

.psv-stat-label {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

.psv-target-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.psv-target-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${COLORS.border};
}

.psv-target-row:last-child {
  border-bottom: none;
}

.psv-target-label {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
}

.psv-target-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text};
}

.psv-target-value.over {
  color: ${COLORS.warning};
}

.psv-target-value.under {
  color: ${COLORS.success};
}

.psv-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.psv-zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.psv-zone-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  overflow: hidden;
}

.psv-zone-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-left: 4px solid;
  background-color: ${COLORS.background};
}

.psv-zone-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.psv-zone-name {
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
}

.psv-zone-meta {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.psv-space-list {
  padding: 0.5rem 0;
}

.psv-space-row {
  display: grid;
  grid-template-columns: 60px 1fr 40px 80px;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid ${COLORS.border};
}

.psv-space-row:last-child {
  border-bottom: none;
}

.psv-space-code {
  font-weight: 600;
  color: ${COLORS.navy};
}

.psv-space-name {
  color: ${COLORS.text};
}

.psv-space-level {
  color: ${COLORS.textMuted};
  text-align: center;
}

.psv-space-sf {
  color: ${COLORS.text};
  text-align: right;
  font-weight: 500;
}

.psv-levels-section {
  margin-top: 1.5rem;
}

.psv-levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.psv-level-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1rem;
}

.psv-level-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.psv-level-name {
  font-weight: 600;
  color: ${COLORS.text};
}

.psv-level-sf {
  font-weight: 600;
  color: ${COLORS.navy};
}

.psv-level-bar {
  height: 8px;
  background-color: ${COLORS.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.psv-level-fill {
  height: 100%;
  background-color: ${COLORS.navy};
  border-radius: 4px;
  transition: width 0.3s ease;
}

.psv-level-meta {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
}

.psv-empty-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
}

.psv-empty-card h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  color: ${COLORS.text};
  margin: 1rem 0 0.5rem;
}

.psv-empty-card p {
  color: ${COLORS.textMuted};
  margin-bottom: 1.5rem;
}

.psv-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background-color: ${COLORS.navy};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.psv-primary-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .psv-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .psv-zones-grid {
    grid-template-columns: 1fr;
  }
  
  .psv-space-row {
    grid-template-columns: 50px 1fr 60px;
  }
  
  .psv-space-level {
    display: none;
  }
}
`;
