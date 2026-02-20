/**
 * GIDSynergySandboxScreen.jsx — Tab 5: Synergy Sandbox
 * 
 * Team combination testing with real-time chemistry scoring.
 * Drag candidates into 4 discipline slots, see synergy score,
 * conflict nodes, complementary signals, and feature coverage.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import {
  Users, Zap, AlertTriangle, CheckCircle2, Target, Save, Copy,
  Trash2, BarChart3, ChevronDown, ChevronRight, RefreshCw, Shield
} from 'lucide-react';
import {
  rfqListInvitations, rfqSimulateSynergy, rfqSaveTeamConfig,
  rfqListTeamConfigs, rfqDeleteTeamConfig, rfqGetScores
} from '../../../services/rfqApi';

const DISCIPLINE_META = {
  architect: { label: 'Architect', color: '#315098', abbrev: 'ARCH' },
  interior_designer: { label: 'Interior Designer', color: '#8CA8BE', abbrev: 'ID' },
  pm: { label: 'PM / Owner\'s Rep', color: '#AFBDB0', abbrev: 'PM' },
  gc: { label: 'General Contractor', color: '#C4A484', abbrev: 'GC' }
};

export default function GIDSynergySandboxScreen() {
  const { projectData } = useAppContext();
  const projectId = projectData?.project_id;

  // State
  const [candidates, setCandidates] = useState({ architect: [], interior_designer: [], pm: [], gc: [] });
  const [teamSlots, setTeamSlots] = useState({ architect: null, interior_designer: null, pm: null, gc: null });
  const [synergyResult, setSynergyResult] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [configName, setConfigName] = useState('');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(true);
  const [expandedSignals, setExpandedSignals] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareConfigs, setCompareConfigs] = useState([]);

  // Load submitted candidates and saved configs
  useEffect(() => {
    if (!projectId) return;
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get all submitted invitations with scores
      const [invResult, configResult, scoreResult] = await Promise.all([
        rfqListInvitations({ project_id: projectId, status: 'submitted' }).catch(() => ({ invitations: [] })),
        rfqListTeamConfigs(projectId).catch(() => ({ configurations: [] })),
        rfqGetScores(projectId).catch(() => ({ scores: [] }))
      ]);

      // Group candidates by discipline, attach scores
      const grouped = { architect: [], interior_designer: [], pm: [], gc: [] };
      const scoreMap = {};
      for (const s of (scoreResult.scores || [])) {
        scoreMap[s.invitation_id] = s;
      }

      for (const inv of (invResult.invitations || [])) {
        const disc = inv.discipline;
        if (grouped[disc]) {
          grouped[disc].push({
            ...inv,
            score: scoreMap[inv.id]?.overall_score || null,
            match_tier: scoreMap[inv.id]?.match_tier || null
          });
        }
      }

      // Sort by score descending
      for (const disc of Object.keys(grouped)) {
        grouped[disc].sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      setCandidates(grouped);
      setSavedConfigs(configResult.configurations || []);
    } catch (err) {
      console.error('Synergy load error:', err);
      setError('Failed to load data. Ensure the RFQ API is configured.');
    } finally {
      setLoading(false);
    }
  };

  // Assign candidate to slot
  const handleAssign = useCallback((discipline, candidate) => {
    setTeamSlots(prev => ({ ...prev, [discipline]: candidate }));
    setSynergyResult(null); // Clear previous result
  }, []);

  // Clear slot
  const handleClearSlot = useCallback((discipline) => {
    setTeamSlots(prev => ({ ...prev, [discipline]: null }));
    setSynergyResult(null);
  }, []);

  // Simulate synergy
  const handleSimulate = async () => {
    const filledSlots = Object.values(teamSlots).filter(Boolean);
    if (filledSlots.length < 2) {
      setError('Select at least 2 team members to simulate synergy.');
      return;
    }

    setSimulating(true);
    setError('');
    try {
      const result = await rfqSimulateSynergy({
        n4s_project_id: projectId,
        architect_invitation_id: teamSlots.architect?.id || null,
        interior_designer_invitation_id: teamSlots.interior_designer?.id || null,
        pm_invitation_id: teamSlots.pm?.id || null,
        gc_invitation_id: teamSlots.gc?.id || null
      });
      setSynergyResult(result.synergy);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  // Save configuration
  const handleSaveConfig = async () => {
    if (!synergyResult) return;
    const name = configName.trim() || `Team ${savedConfigs.length + 1}`;
    try {
      await rfqSaveTeamConfig({
        n4s_project_id: projectId,
        config_name: name,
        architect_invitation_id: teamSlots.architect?.id || null,
        interior_designer_invitation_id: teamSlots.interior_designer?.id || null,
        pm_invitation_id: teamSlots.pm?.id || null,
        gc_invitation_id: teamSlots.gc?.id || null,
        synergy_data: synergyResult
      });
      setConfigName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete config
  const handleDeleteConfig = async (configId) => {
    try {
      await rfqDeleteTeamConfig(configId);
      setSavedConfigs(prev => prev.filter(c => c.id !== configId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Score tier color
  const tierColor = (score) => {
    if (score >= 75) return '#2e7d32';
    if (score >= 50) return '#f57c00';
    return '#d32f2f';
  };

  const riskColor = (level) => {
    if (level === 'high') return '#d32f2f';
    if (level === 'moderate') return '#f57c00';
    return '#2e7d32';
  };

  if (!projectId) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b6b6b' }}>
        <Shield size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p>Select a project to access the Synergy Sandbox.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b6b6b' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading team candidates...</p>
      </div>
    );
  }

  const totalCandidates = Object.values(candidates).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="gid-synergy">
      {/* Header */}
      <div className="gid-synergy__header">
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1e3a5f', margin: 0 }}>
            Synergy Sandbox
          </h3>
          <p style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4 }}>
            Test team combinations to find optimal chemistry. {totalCandidates} submitted candidates available.
          </p>
        </div>
        <button
          className="gid-btn gid-btn--primary"
          onClick={handleSimulate}
          disabled={simulating || Object.values(teamSlots).filter(Boolean).length < 2}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Zap size={16} />
          {simulating ? 'Analyzing...' : 'Analyze Team'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#d32f2f', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Team Slots */}
      <div className="gid-synergy__slots">
        {Object.entries(DISCIPLINE_META).map(([disc, meta]) => {
          const assigned = teamSlots[disc];
          const pool = candidates[disc] || [];

          return (
            <div key={disc} className="gid-synergy__slot" style={{ borderTopColor: meta.color }}>
              <div className="gid-synergy__slot-label" style={{ color: meta.color }}>
                {meta.abbrev}
              </div>
              <div className="gid-synergy__slot-title">{meta.label}</div>

              {assigned ? (
                <div className="gid-synergy__assigned">
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{assigned.consultant_name}</div>
                  <div style={{ fontSize: 12, color: '#6b6b6b' }}>{assigned.firm_name}</div>
                  {assigned.score && (
                    <div style={{ fontSize: 11, color: tierColor(assigned.score), fontWeight: 600, marginTop: 4 }}>
                      Match Score: {Math.round(assigned.score)}
                    </div>
                  )}
                  <button
                    onClick={() => handleClearSlot(disc)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 2 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="gid-synergy__empty">
                  {pool.length > 0 ? (
                    <select
                      className="gid-synergy__select"
                      value=""
                      onChange={(e) => {
                        const cand = pool.find(c => c.id === e.target.value);
                        if (cand) handleAssign(disc, cand);
                      }}
                    >
                      <option value="">Select {meta.label}...</option>
                      {pool.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.consultant_name} ({c.firm_name}){c.score ? ` — ${Math.round(c.score)}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: 12, color: '#999' }}>No submitted candidates</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Synergy Results */}
      {synergyResult && (
        <div className="gid-synergy__results">
          {/* Overall Score */}
          <div className="gid-synergy__score-card">
            <div className="gid-synergy__score-label">Team Synergy Score</div>
            <div className="gid-synergy__score-value" style={{ color: tierColor(synergyResult.overall_score) }}>
              {synergyResult.overall_score}
              <span style={{ fontSize: 16, color: '#999' }}>/100</span>
            </div>

            {/* Dimension breakdown */}
            <div className="gid-synergy__dimensions">
              {[
                { key: 'cadence_compatibility', label: 'Communication' },
                { key: 'meeting_compatibility', label: 'Meeting Format' },
                { key: 'conflict_style_score', label: 'Conflict Style' },
                { key: 'decision_pace_score', label: 'Decision Pace' },
                { key: 'tech_interoperability', label: 'Tech Overlap' },
                { key: 'feature_coverage_pct', label: 'Feature Coverage' }
              ].map(dim => {
                const val = synergyResult.dimensions?.[dim.key] || 0;
                return (
                  <div key={dim.key} className="gid-synergy__dim">
                    <div className="gid-synergy__dim-label">{dim.label}</div>
                    <div className="gid-synergy__dim-bar">
                      <div
                        className="gid-synergy__dim-fill"
                        style={{ width: `${val}%`, background: tierColor(val) }}
                      />
                    </div>
                    <div className="gid-synergy__dim-value">{Math.round(val)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict Nodes */}
          {synergyResult.conflict_nodes?.length > 0 && (
            <div className="gid-synergy__panel">
              <div
                className="gid-synergy__panel-header"
                onClick={() => setExpandedNodes(!expandedNodes)}
                style={{ cursor: 'pointer' }}
              >
                <AlertTriangle size={16} style={{ color: '#f57c00' }} />
                <span>Conflict Risk Nodes ({synergyResult.conflict_nodes.length})</span>
                {expandedNodes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedNodes && (
                <div className="gid-synergy__panel-body">
                  {synergyResult.conflict_nodes.map((node, i) => (
                    <div key={i} className="gid-synergy__node">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 13 }}>{node.pair}</strong>
                        <span style={{ fontSize: 11, color: riskColor(node.risk_level), fontWeight: 600, textTransform: 'uppercase' }}>
                          {node.risk_level}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{node.description}</div>
                      {node.mitigation && (
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
                          Mitigation: {node.mitigation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Complementary Signals */}
          {synergyResult.complementary_signals?.length > 0 && (
            <div className="gid-synergy__panel">
              <div
                className="gid-synergy__panel-header"
                onClick={() => setExpandedSignals(!expandedSignals)}
                style={{ cursor: 'pointer' }}
              >
                <CheckCircle2 size={16} style={{ color: '#2e7d32' }} />
                <span>Complementary Signals ({synergyResult.complementary_signals.length})</span>
                {expandedSignals ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSignals && (
                <div className="gid-synergy__panel-body">
                  {synergyResult.complementary_signals.map((signal, i) => (
                    <div key={i} className="gid-synergy__signal">
                      <strong style={{ fontSize: 13 }}>{signal.pair}</strong>
                      <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{signal.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feature Coverage */}
          {synergyResult.feature_coverage && (
            <div className="gid-synergy__panel">
              <div className="gid-synergy__panel-header">
                <Target size={16} style={{ color: '#1e3a5f' }} />
                <span>
                  FYI Feature Coverage: {synergyResult.feature_coverage.coverage_pct}%
                  ({synergyResult.feature_coverage.covered?.length || 0}/{(synergyResult.feature_coverage.covered?.length || 0) + (synergyResult.feature_coverage.gaps?.length || 0)})
                </span>
              </div>
              {synergyResult.feature_coverage.gaps?.length > 0 && (
                <div className="gid-synergy__panel-body">
                  <div style={{ fontSize: 12, color: '#d32f2f', fontWeight: 500, marginBottom: 4 }}>
                    Missing coverage:
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {synergyResult.feature_coverage.gaps.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save Configuration */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Team name (e.g., Team Alpha)"
              style={{
                flex: 1, padding: '8px 12px', border: '1px solid #e5e5e0',
                borderRadius: 6, fontSize: 13, fontFamily: 'Inter, sans-serif'
              }}
            />
            <button className="gid-btn gid-btn--secondary" onClick={handleSaveConfig} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={14} /> Save Team
            </button>
          </div>
        </div>
      )}

      {/* Saved Configurations */}
      {savedConfigs.length > 0 && (
        <div className="gid-synergy__saved">
          <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#1e3a5f', marginBottom: 12 }}>
            Saved Configurations
          </h4>
          <div className="gid-synergy__config-list">
            {savedConfigs.map(config => (
              <div key={config.id} className="gid-synergy__config-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{config.config_name}</strong>
                    <div style={{ fontSize: 20, fontWeight: 700, color: tierColor(config.synergy_score), marginTop: 4 }}>
                      {Math.round(config.synergy_score)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                  {config.architect_name && `Arch: ${config.architect_name}`}
                  {config.id_name && ` • ID: ${config.id_name}`}
                  {config.pm_name && ` • PM: ${config.pm_name}`}
                  {config.gc_name && ` • GC: ${config.gc_name}`}
                </div>
                {config.conflict_nodes && JSON.parse(config.conflict_nodes || '[]').length > 0 && (
                  <div style={{ fontSize: 11, color: '#f57c00', marginTop: 4 }}>
                    ⚠ {JSON.parse(config.conflict_nodes).length} conflict node(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
