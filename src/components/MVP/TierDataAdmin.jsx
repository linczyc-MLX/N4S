/**
 * TierDataAdmin
 * 
 * Admin panel for viewing and verifying tier-specific adjacency data.
 * Shows which tier is currently detected and allows viewing the
 * benchmark adjacency matrix for each tier (5K, 10K, 15K, 20K).
 * 
 * Follows N4S Brand Guide styling.
 */

import React, { useState, useMemo, useContext } from 'react';
import { ArrowLeft, Database, CheckCircle, AlertCircle } from 'lucide-react';
import AppContext from '../../contexts/AppContext';
import { useKYCData } from '../../hooks/useKYCData';
import { getPreset, programPresets } from '../../mansion-program';

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
};

// Relationship colors
const RELATIONSHIP_COLORS = {
  A: '#4caf50',
  N: '#2196f3',
  B: '#ff9800',
  S: '#f44336',
};

/**
 * Tier Card Component
 */
function TierCard({ tier, isActive, onClick }) {
  const presetData = useMemo(() => {
    try {
      return getPreset(tier.id);
    } catch (e) {
      return null;
    }
  }, [tier.id]);

  const relationshipCounts = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return { A: 0, N: 0, B: 0, S: 0 };
    const counts = { A: 0, N: 0, B: 0, S: 0 };
    presetData.adjacencyMatrix.forEach(adj => {
      if (adj.relationship && counts[adj.relationship] !== undefined) {
        counts[adj.relationship]++;
      }
    });
    return counts;
  }, [presetData]);

  const bridgeCount = useMemo(() => {
    if (!presetData?.bridgeConfig) return 0;
    return Object.values(presetData.bridgeConfig).filter(v => v).length;
  }, [presetData]);

  return (
    <div 
      className={`tda-tier-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="tda-tier-header">
        <span className="tda-tier-name">{tier.name}</span>
        {isActive && (
          <span className="tda-active-badge">
            <CheckCircle size={14} />
            CURRENT
          </span>
        )}
      </div>
      <div className="tda-tier-desc">{tier.description}</div>
      <div className="tda-tier-stats">
        <div className="tda-stat">
          <span className="tda-stat-value">{presetData?.adjacencyMatrix?.length || 0}</span>
          <span className="tda-stat-label">Relationships</span>
        </div>
        <div className="tda-stat">
          <span className="tda-stat-value">{bridgeCount}</span>
          <span className="tda-stat-label">Bridges</span>
        </div>
      </div>
      <div className="tda-relationship-counts">
        {Object.entries(relationshipCounts).map(([key, count]) => (
          <span 
            key={key} 
            className="tda-rel-badge"
            style={{ backgroundColor: RELATIONSHIP_COLORS[key] }}
          >
            {key}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Matrix Preview Component
 */
function MatrixPreview({ tierId }) {
  const presetData = useMemo(() => {
    try {
      return getPreset(tierId);
    } catch (e) {
      return null;
    }
  }, [tierId]);

  // Group relationships by fromSpaceCode (moved before early return to avoid conditional hook)
  const groupedRelationships = useMemo(() => {
    if (!presetData?.adjacencyMatrix) return {};
    const groups = {};
    presetData.adjacencyMatrix.forEach(adj => {
      if (!groups[adj.fromSpaceCode]) {
        groups[adj.fromSpaceCode] = [];
      }
      groups[adj.fromSpaceCode].push(adj);
    });
    return groups;
  }, [presetData]);

  if (!presetData) {
    return <div className="tda-no-data">No data available for this tier.</div>;
  }

  return (
    <div className="tda-matrix-preview">
      <h4 className="tda-section-title">
        Adjacency Matrix - {presetData.name}
        <span className="tda-count">({presetData.adjacencyMatrix.length} relationships)</span>
      </h4>
      
      <div className="tda-matrix-grid">
        {Object.entries(groupedRelationships).sort(([a], [b]) => a.localeCompare(b)).map(([spaceCode, relationships]) => (
          <div key={spaceCode} className="tda-space-group">
            <div className="tda-space-header">{spaceCode}</div>
            <div className="tda-space-relationships">
              {relationships.map((adj, idx) => (
                <span 
                  key={idx}
                  className="tda-rel-item"
                  style={{ backgroundColor: RELATIONSHIP_COLORS[adj.relationship] }}
                  title={`${adj.fromSpaceCode} → ${adj.toSpaceCode}: ${adj.relationship}`}
                >
                  → {adj.toSpaceCode}: {adj.relationship}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h4 className="tda-section-title" style={{ marginTop: '1.5rem' }}>Bridge Configuration</h4>
      <div className="tda-bridges">
        {Object.entries(presetData.bridgeConfig || {}).map(([bridge, enabled]) => (
          <div key={bridge} className={`tda-bridge-item ${enabled ? 'enabled' : 'disabled'}`}>
            {enabled ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span>{bridge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main TierDataAdmin component
 */
export default function TierDataAdmin({ onBack }) {
  const { fyiData } = useContext(AppContext);
  const { preset: detectedTier, baseSF } = useKYCData();
  const [selectedTier, setSelectedTier] = useState(detectedTier || '15k');

  // Get all available tiers
  const tiers = useMemo(() => {
    return programPresets.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      targetSF: p.targetSF,
    }));
  }, []);

  return (
    <div className="tda-container">
      {/* Header */}
      <div className="tda-header">
        <button className="tda-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="tda-title-row">
          <Database size={24} color={COLORS.navy} />
          <h1 className="tda-title">Tier Data Administration</h1>
        </div>
        <p className="tda-subtitle">
          View and verify adjacency matrices for each tier benchmark
        </p>
      </div>

      <div className="tda-content">
        {/* Current Detection Info */}
        <div className="tda-detection-card">
          <h3 className="tda-card-title">Current Tier Detection</h3>
          <div className="tda-detection-info">
            <div className="tda-detection-item">
              <span className="tda-detection-label">Target SF:</span>
              <span className="tda-detection-value">{baseSF?.toLocaleString() || 'Not set'} SF</span>
            </div>
            <div className="tda-detection-item">
              <span className="tda-detection-label">Detected Tier:</span>
              <span className="tda-detection-value tda-tier-highlight">
                {detectedTier?.toUpperCase() || 'Unknown'}
              </span>
            </div>
            <div className="tda-detection-item">
              <span className="tda-detection-label">Tier Thresholds:</span>
              <span className="tda-detection-value">
                &lt;7,500 SF = 5K | &lt;12,500 SF = 10K | &lt;17,500 SF = 15K | ≥17,500 SF = 20K
              </span>
            </div>
          </div>
        </div>

        {/* Tier Selection */}
        <div className="tda-tiers-section">
          <h3 className="tda-card-title">Available Tier Benchmarks</h3>
          <p className="tda-hint">Click a tier to view its adjacency matrix data</p>
          <div className="tda-tiers-grid">
            {tiers.map(tier => (
              <TierCard 
                key={tier.id}
                tier={tier}
                isActive={tier.id === detectedTier}
                onClick={() => setSelectedTier(tier.id)}
              />
            ))}
          </div>
        </div>

        {/* Matrix Preview */}
        <div className="tda-preview-section">
          <MatrixPreview tierId={selectedTier} />
        </div>
      </div>
      <style>{componentStyles}</style>
    </div>
  );
}

// CSS
const componentStyles = `
.tda-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tda-header {
  background-color: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem;
}

.tda-back-btn {
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

.tda-back-btn:hover {
  border-color: ${COLORS.navy};
  color: ${COLORS.navy};
}

.tda-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tda-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0;
}

.tda-subtitle {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin-top: 0.25rem;
}

.tda-content {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tda-detection-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.tda-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.tda-detection-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tda-detection-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.tda-detection-label {
  color: ${COLORS.textMuted};
  min-width: 120px;
}

.tda-detection-value {
  color: ${COLORS.text};
  font-weight: 500;
}

.tda-tier-highlight {
  background-color: ${COLORS.navy};
  color: #ffffff;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.tda-tiers-section {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.tda-hint {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin-bottom: 1rem;
}

.tda-tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tda-tier-card {
  background-color: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.15s ease;
}

.tda-tier-card:hover {
  border-color: ${COLORS.navy};
}

.tda-tier-card.active {
  border-color: ${COLORS.success};
  background-color: #f1f8e9;
}

.tda-tier-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.tda-tier-name {
  font-weight: 600;
  color: ${COLORS.text};
}

.tda-active-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${COLORS.success};
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tda-tier-desc {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin-bottom: 0.75rem;
}

.tda-tier-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.tda-stat {
  display: flex;
  flex-direction: column;
}

.tda-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: ${COLORS.navy};
}

.tda-stat-label {
  font-size: 0.6875rem;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
}

.tda-relationship-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tda-rel-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #ffffff;
}

.tda-preview-section {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
}

.tda-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tda-count {
  font-weight: 400;
  color: ${COLORS.textMuted};
}

.tda-matrix-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.tda-space-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
}

.tda-space-header {
  min-width: 60px;
  font-weight: 600;
  font-size: 0.8125rem;
  color: ${COLORS.navy};
}

.tda-space-relationships {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tda-rel-item {
  padding: 0.125rem 0.375rem;
  border-radius: 2px;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #ffffff;
}

.tda-bridges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tda-bridge-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8125rem;
}

.tda-bridge-item.enabled {
  background-color: #e8f5e9;
  color: ${COLORS.success};
}

.tda-bridge-item.disabled {
  background-color: #f5f5f5;
  color: ${COLORS.textMuted};
}

.tda-no-data {
  padding: 2rem;
  text-align: center;
  color: ${COLORS.textMuted};
}
`;
