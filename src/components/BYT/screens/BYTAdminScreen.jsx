/**
 * BYTAdminScreen.jsx — Admin Panel for Build Your Team
 * 
 * Tab 6 of BYT module. Two sub-tabs:
 * - Global Defaults: methodology baseline for all projects
 * - This Project: per-engagement overrides
 * 
 * Phase 1 cards:
 * - API Connections (Global only)
 * - Discovery Settings (Global + Project)
 * - Scoring Configuration (Global + Project)
 * - Project Brief (Project only)
 * - Data Management (Project only) 
 * - RFQ Settings (Global + Project)
 * - Pipeline Settings (Global + Project)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Settings, Globe, Folder, Key, Search, Target, Send, GitBranch,
  Database, ChevronDown, ChevronRight, RotateCcw, Check, AlertTriangle,
  RefreshCw, Eye, EyeOff, ExternalLink, Download, Trash2, Archive,
  Info, Plus, X, Edit2, Shield
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import { resolveConfig, FACTORY_DEFAULTS, validateWeights, getExclusionListWithSources } from '../utils/configResolver';
import { getProjectContext, formatBudget, validateProjectContext } from '../utils/projectContext';

// ============================================================================
// API HELPERS
// ============================================================================

const API_BASE = window.location.hostname.includes('ionos.space')
  ? 'https://website.not-4.sale/api'
  : '/api';

const adminApi = {
  async loadGlobalConfig() {
    try {
      const res = await fetch(`${API_BASE}/gid.php?entity=admin_config&scope=global`, { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.config || null;
    } catch {
      return null;
    }
  },

  async saveGlobalConfig(key, value) {
    const res = await fetch(`${API_BASE}/gid.php?entity=admin_config&scope=global&action=update`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return res.json();
  },

  async testApiConnection(provider) {
    try {
      const res = await fetch(`${API_BASE}/gid.php?entity=admin_config&action=test_api&provider=${provider}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      return { ok: !data.error, message: data.message || data.error || 'Unknown' };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  },

  async getStats(projectId) {
    try {
      const res = await fetch(`${API_BASE}/gid.php?entity=admin_config&action=stats&project_id=${projectId || 'default'}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
};

// ============================================================================
// DISCIPLINE LABELS
// ============================================================================
const DISCIPLINE_MAP = {
  architect: 'Architect',
  interior_designer: 'Interior Designer',
  pm: 'PM / Owner\'s Rep',
  gc: 'General Contractor',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Inheritance indicator badge */
function InheritBadge({ isOverridden, onReset }) {
  if (isOverridden) {
    return (
      <span className="byt-admin-inherit byt-admin-inherit--overridden">
        <span className="byt-admin-inherit__dot" />
        Overridden
        {onReset && (
          <button className="byt-admin-inherit__reset" onClick={onReset} title="Reset to global default">
            <RotateCcw size={12} />
          </button>
        )}
      </span>
    );
  }
  return (
    <span className="byt-admin-inherit byt-admin-inherit--inherited">
      ← Inherited
    </span>
  );
}

/** Collapsible card wrapper */
function AdminCard({ title, icon: Icon, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`byt-admin-card ${open ? 'byt-admin-card--open' : ''}`}>
      <button className="byt-admin-card__header" onClick={() => setOpen(!open)}>
        <div className="byt-admin-card__header-left">
          {Icon && <Icon size={18} />}
          <span className="byt-admin-card__title">{title}</span>
          {badge && <span className="byt-admin-card__badge">{badge}</span>}
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && <div className="byt-admin-card__body">{children}</div>}
    </div>
  );
}

/** Editable tags input */
function TagsInput({ tags, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };
  return (
    <div className="byt-admin-tags">
      <div className="byt-admin-tags__list">
        {tags.map((tag, i) => (
          <span key={i} className={`byt-admin-tags__tag ${tag.source === 'global' ? 'byt-admin-tags__tag--global' : ''}`}>
            {typeof tag === 'string' ? tag : tag.name}
            {(typeof tag === 'string' || tag.source === 'project') && (
              <button className="byt-admin-tags__remove" onClick={() => onChange(tags.filter((_, j) => j !== i))}>
                <X size={10} />
              </button>
            )}
            {tag.source === 'global' && <span className="byt-admin-tags__source">Global</span>}
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type and press Enter'}
        className="byt-admin-tags__input"
      />
    </div>
  );
}

// ============================================================================
// API CONNECTIONS CARD (Global only)
// ============================================================================

function ApiConnectionsCard({ globalConfig, onSaveGlobal }) {
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [showKey, setShowKey] = useState({});

  const handleTest = async (provider) => {
    setTestingProvider(provider);
    const result = await adminApi.testApiConnection(provider);
    setTestResults(prev => ({ ...prev, [provider]: result }));
    setTestingProvider(null);
  };

  const maskKey = (key) => {
    if (!key) return '(not configured)';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 6) + '••••••••' + key.slice(-4);
  };

  const anthropicConfig = globalConfig?.apiConnections?.anthropic || {};
  const rfqConfig = globalConfig?.apiConnections?.rfq || {};

  return (
    <AdminCard title="API Connections" icon={Key} badge="Global">
      <div className="byt-admin-api-grid">

        {/* Anthropic */}
        <div className="byt-admin-api-item">
          <div className="byt-admin-api-item__header">
            <span className={`byt-admin-api-item__status ${anthropicConfig.configured !== false ? 'byt-admin-api-item__status--connected' : ''}`}>
              {anthropicConfig.configured !== false ? '✓' : '○'}
            </span>
            <strong>AI Discovery (Anthropic Claude)</strong>
          </div>
          <div className="byt-admin-api-item__details">
            <div className="byt-admin-api-item__row">
              <span className="byt-admin-api-item__label">API Key:</span>
              <span className="byt-admin-api-item__value">
                {showKey.anthropic ? (anthropicConfig.key || '(not configured)') : maskKey(anthropicConfig.key)}
              </span>
              <button className="byt-admin-api-item__toggle" onClick={() => setShowKey(p => ({ ...p, anthropic: !p.anthropic }))}>
                {showKey.anthropic ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="byt-admin-api-item__row">
              <span className="byt-admin-api-item__label">Default Model:</span>
              <span className="byt-admin-api-item__value">{globalConfig?.discovery?.model || FACTORY_DEFAULTS.discovery.model}</span>
            </div>
            {anthropicConfig.lastUsed && (
              <div className="byt-admin-api-item__row">
                <span className="byt-admin-api-item__label">Last used:</span>
                <span className="byt-admin-api-item__value">{new Date(anthropicConfig.lastUsed).toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="byt-admin-api-item__actions">
            <button
              className="byt-admin-btn byt-admin-btn--sm"
              onClick={() => handleTest('anthropic')}
              disabled={testingProvider === 'anthropic'}
            >
              {testingProvider === 'anthropic' ? <RefreshCw size={12} className="byt-spin" /> : <Check size={12} />}
              Test
            </button>
            {testResults.anthropic && (
              <span className={`byt-admin-api-item__test-result ${testResults.anthropic.ok ? 'byt-admin-api-item__test-result--ok' : 'byt-admin-api-item__test-result--fail'}`}>
                {testResults.anthropic.ok ? 'Connected ✓' : `Failed: ${testResults.anthropic.message}`}
              </span>
            )}
          </div>
        </div>

        {/* RFQ Scoring Engine */}
        <div className="byt-admin-api-item">
          <div className="byt-admin-api-item__header">
            <span className={`byt-admin-api-item__status ${rfqConfig.configured !== false ? 'byt-admin-api-item__status--connected' : ''}`}>
              {rfqConfig.configured !== false ? '✓' : '○'}
            </span>
            <strong>RFQ Scoring Engine</strong>
          </div>
          <div className="byt-admin-api-item__details">
            <div className="byt-admin-api-item__row">
              <span className="byt-admin-api-item__label">API Key:</span>
              <span className="byt-admin-api-item__value">
                {showKey.rfq ? (rfqConfig.key || '(configured)') : maskKey(rfqConfig.key || 'configured')}
              </span>
              <button className="byt-admin-api-item__toggle" onClick={() => setShowKey(p => ({ ...p, rfq: !p.rfq }))}>
                {showKey.rfq ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="byt-admin-api-item__row">
              <span className="byt-admin-api-item__label">Endpoint:</span>
              <span className="byt-admin-api-item__value">https://rfq.not-4.sale/api</span>
            </div>
          </div>
          <div className="byt-admin-api-item__actions">
            <button
              className="byt-admin-btn byt-admin-btn--sm"
              onClick={() => handleTest('rfq')}
              disabled={testingProvider === 'rfq'}
            >
              {testingProvider === 'rfq' ? <RefreshCw size={12} className="byt-spin" /> : <Check size={12} />}
              Test
            </button>
            {testResults.rfq && (
              <span className={`byt-admin-api-item__test-result ${testResults.rfq.ok ? 'byt-admin-api-item__test-result--ok' : 'byt-admin-api-item__test-result--fail'}`}>
                {testResults.rfq.ok ? 'Connected ✓' : `Failed: ${testResults.rfq.message}`}
              </span>
            )}
          </div>
        </div>

        {/* Future connectors */}
        {['Dodge Construction Network', 'Building Radar', 'Public Permit APIs', 'LinkedIn Sales Navigator'].map(name => (
          <div key={name} className="byt-admin-api-item byt-admin-api-item--future">
            <div className="byt-admin-api-item__header">
              <span className="byt-admin-api-item__status">○</span>
              <strong>{name}</strong>
              <span className="byt-admin-api-item__coming-soon">Coming Soon</span>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

// ============================================================================
// DISCOVERY SETTINGS CARD
// ============================================================================

function DiscoverySettingsCard({ scope, config, overrides, globalConfig, onSave, onResetField }) {
  const [expandedGuidance, setExpandedGuidance] = useState({});
  const [editingGuidance, setEditingGuidance] = useState({});
  const [localExemplars, setLocalExemplars] = useState({});
  const [localExclusions, setLocalExclusions] = useState([]);

  const isGlobal = scope === 'global';
  const resolved = resolveConfig(globalConfig, overrides);
  const ov = resolved._overrides?.discovery || {};

  // Initialize local state from config
  useEffect(() => {
    if (isGlobal) {
      const gc = globalConfig?.discovery || FACTORY_DEFAULTS.discovery;
      setLocalExemplars(gc.exemplarFirms || FACTORY_DEFAULTS.discovery.exemplarFirms);
      setLocalExclusions(gc.exclusionList || FACTORY_DEFAULTS.discovery.exclusionList);
    } else {
      setLocalExemplars(overrides?.discoveryOverrides?.additionalExemplars || {});
      setLocalExclusions(overrides?.discoveryOverrides?.additionalExclusions || []);
    }
  }, [isGlobal, globalConfig, overrides]);

  const handleSettingChange = (key, value) => {
    if (isGlobal) {
      onSave(`discovery.${key}`, value);
    } else {
      // Project override — save to bytData.adminConfig.discoveryOverrides
      onSave('discoveryOverrides', { ...overrides?.discoveryOverrides, [key]: value });
    }
  };

  const handleGuidanceSave = (discipline) => {
    const text = editingGuidance[discipline];
    if (isGlobal) {
      onSave(`discovery.disciplineGuidance.${discipline}`, text || null);
    } else {
      const current = overrides?.discoveryOverrides?.disciplineGuidance || {};
      onSave('discoveryOverrides', {
        ...overrides?.discoveryOverrides,
        disciplineGuidance: { ...current, [discipline]: text || null },
      });
    }
    setEditingGuidance(prev => ({ ...prev, [discipline]: undefined }));
  };

  const handleExemplarsSave = () => {
    if (isGlobal) {
      onSave('discovery.exemplarFirms', localExemplars);
    } else {
      onSave('discoveryOverrides', { ...overrides?.discoveryOverrides, additionalExemplars: localExemplars });
    }
  };

  const handleExclusionsSave = () => {
    if (isGlobal) {
      onSave('discovery.exclusionList', localExclusions);
    } else {
      onSave('discoveryOverrides', { ...overrides?.discoveryOverrides, additionalExclusions: localExclusions });
    }
  };

  const currentModel = isGlobal
    ? (globalConfig?.discovery?.model || FACTORY_DEFAULTS.discovery.model)
    : resolved.discovery.model;

  const currentThreshold = isGlobal
    ? (globalConfig?.discovery?.confidenceThreshold ?? FACTORY_DEFAULTS.discovery.confidenceThreshold)
    : resolved.discovery.confidenceThreshold;

  const currentResultsPerSearch = isGlobal
    ? (globalConfig?.discovery?.resultsPerSearch ?? FACTORY_DEFAULTS.discovery.resultsPerSearch)
    : resolved.discovery.resultsPerSearch;

  return (
    <AdminCard title="Discovery Settings" icon={Search} badge={isGlobal ? 'Global' : 'This Project'}>
      <div className="byt-admin-form">

        {/* Core settings */}
        <div className="byt-admin-form__row">
          <label className="byt-admin-form__label">
            AI Model
            {!isGlobal && <InheritBadge isOverridden={ov.model} onReset={() => onResetField('discoveryOverrides', 'model')} />}
          </label>
          <select
            className="byt-admin-form__select"
            value={currentModel}
            onChange={(e) => handleSettingChange('model', e.target.value)}
          >
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommended)</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Faster/Cheaper)</option>
          </select>
        </div>

        <div className="byt-admin-form__row">
          <label className="byt-admin-form__label">
            Results per search
            {!isGlobal && <InheritBadge isOverridden={ov.resultsPerSearch} onReset={() => onResetField('discoveryOverrides', 'resultsPerSearch')} />}
          </label>
          <select
            className="byt-admin-form__select"
            value={currentResultsPerSearch}
            onChange={(e) => handleSettingChange('resultsPerSearch', Number(e.target.value))}
          >
            {[4, 6, 8, 10, 12, 15].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="byt-admin-form__row">
          <label className="byt-admin-form__label">
            Confidence threshold (hide results below)
            {!isGlobal && <InheritBadge isOverridden={ov.confidenceThreshold} onReset={() => onResetField('discoveryOverrides', 'confidenceThreshold')} />}
          </label>
          <div className="byt-admin-form__slider-row">
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={currentThreshold}
              onChange={(e) => handleSettingChange('confidenceThreshold', Number(e.target.value))}
              className="byt-admin-form__slider"
            />
            <span className="byt-admin-form__slider-value">{currentThreshold}</span>
          </div>
        </div>

        {isGlobal && (
          <>
            <div className="byt-admin-form__row">
              <label className="byt-admin-form__label">Source attribution required</label>
              <span className="byt-admin-form__static">Yes (enforced globally)</span>
            </div>
            <div className="byt-admin-form__row">
              <label className="byt-admin-form__label">Max discovery queue size</label>
              <select
                className="byt-admin-form__select"
                value={globalConfig?.discovery?.maxQueueSize ?? FACTORY_DEFAULTS.discovery.maxQueueSize}
                onChange={(e) => handleSettingChange('maxQueueSize', Number(e.target.value))}
              >
                {[50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Discipline Guidance */}
        <div className="byt-admin-form__section-label">
          <Search size={14} />
          Discipline Search Guidance
        </div>

        {Object.entries(DISCIPLINE_MAP).map(([key, label]) => {
          const isExpanded = expandedGuidance[key];
          const isEditing = editingGuidance[key] !== undefined;
          const currentGuidance = isGlobal
            ? (globalConfig?.discovery?.disciplineGuidance?.[key] || null)
            : (overrides?.discoveryOverrides?.disciplineGuidance?.[key] || null);
          const isCustom = currentGuidance != null;

          return (
            <div key={key} className="byt-admin-guidance">
              <button className="byt-admin-guidance__header" onClick={() => setExpandedGuidance(p => ({ ...p, [key]: !p[key] }))}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>{label} Guidance</span>
                {!isGlobal && <InheritBadge isOverridden={ov.disciplineGuidance?.[key]} />}
                {isCustom && isGlobal && <span className="byt-admin-guidance__custom-badge">Customized</span>}
                {!isCustom && <span className="byt-admin-guidance__default-badge">Using Default</span>}
              </button>
              {isExpanded && (
                <div className="byt-admin-guidance__body">
                  {isEditing ? (
                    <>
                      <textarea
                        className="byt-admin-form__textarea"
                        value={editingGuidance[key]}
                        onChange={(e) => setEditingGuidance(p => ({ ...p, [key]: e.target.value }))}
                        rows={8}
                        placeholder={`Custom guidance for ${label} discovery searches...`}
                      />
                      <div className="byt-admin-guidance__actions">
                        <button className="byt-admin-btn byt-admin-btn--sm byt-admin-btn--primary" onClick={() => handleGuidanceSave(key)}>
                          <Check size={12} /> Save
                        </button>
                        <button className="byt-admin-btn byt-admin-btn--sm" onClick={() => setEditingGuidance(p => ({ ...p, [key]: undefined }))}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="byt-admin-guidance__text">
                        {currentGuidance || '(Using built-in default guidance)'}
                      </p>
                      <div className="byt-admin-guidance__actions">
                        <button className="byt-admin-btn byt-admin-btn--sm" onClick={() => setEditingGuidance(p => ({ ...p, [key]: currentGuidance || '' }))}>
                          <Edit2 size={12} /> {isGlobal ? 'Edit' : 'Customize for this project'}
                        </button>
                        {isCustom && (
                          <button className="byt-admin-btn byt-admin-btn--sm byt-admin-btn--ghost" onClick={() => {
                            if (isGlobal) {
                              onSave(`discovery.disciplineGuidance.${key}`, null);
                            } else {
                              onResetField('discoveryOverrides', `disciplineGuidance.${key}`);
                            }
                          }}>
                            <RotateCcw size={12} /> Reset to {isGlobal ? 'Factory' : 'Global'} Default
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Exemplar Firms */}
        <div className="byt-admin-form__section-label">
          <Target size={14} />
          {isGlobal ? 'Global Exemplar Firms' : 'Additional Exemplar Firms (project-specific)'}
        </div>
        <p className="byt-admin-form__hint">
          {isGlobal
            ? 'Calibration anchors included in every AI discovery search.'
            : 'Regional specialists for this project. Global exemplars are also included.'}
        </p>

        {Object.entries(DISCIPLINE_MAP).map(([key, label]) => (
          <div key={key} className="byt-admin-form__row">
            <label className="byt-admin-form__label byt-admin-form__label--sm">{label}</label>
            <TagsInput
              tags={localExemplars[key] || []}
              onChange={(newTags) => {
                const updated = { ...localExemplars, [key]: newTags };
                setLocalExemplars(updated);
                // Auto-save on change
                if (isGlobal) {
                  onSave('discovery.exemplarFirms', updated);
                } else {
                  onSave('discoveryOverrides', { ...overrides?.discoveryOverrides, additionalExemplars: updated });
                }
              }}
              placeholder={`Add ${label.toLowerCase()} firm...`}
            />
          </div>
        ))}

        {!isGlobal && Object.values(globalConfig?.discovery?.exemplarFirms || {}).some(a => a?.length > 0) && (
          <div className="byt-admin-form__global-ref">
            <Info size={12} />
            <span>Global exemplars also included: {
              Object.entries(globalConfig?.discovery?.exemplarFirms || {})
                .filter(([, v]) => v?.length > 0)
                .map(([k, v]) => `${DISCIPLINE_MAP[k]}: ${v.join(', ')}`)
                .join(' · ')
            }</span>
          </div>
        )}

        {/* Exclusion List */}
        <div className="byt-admin-form__section-label">
          <Shield size={14} />
          {isGlobal ? 'Global Exclusion List' : 'Additional Exclusions (project-specific)'}
        </div>
        <p className="byt-admin-form__hint">
          {isGlobal
            ? 'Firms excluded from every project\'s discovery results.'
            : 'Firms excluded from this project only (e.g., conflict of interest). Global exclusions also enforced.'}
        </p>
        <TagsInput
          tags={localExclusions}
          onChange={(newTags) => {
            setLocalExclusions(newTags);
            if (isGlobal) {
              onSave('discovery.exclusionList', newTags);
            } else {
              onSave('discoveryOverrides', { ...overrides?.discoveryOverrides, additionalExclusions: newTags });
            }
          }}
          placeholder="Type firm name and press Enter..."
        />

        {!isGlobal && (globalConfig?.discovery?.exclusionList || []).length > 0 && (
          <div className="byt-admin-form__global-ref">
            <Info size={12} />
            <span>Global exclusions also enforced: {(globalConfig?.discovery?.exclusionList || []).join(', ')}</span>
          </div>
        )}
      </div>
    </AdminCard>
  );
}

// ============================================================================
// SCORING CONFIGURATION CARD
// ============================================================================

const SCORING_DIMENSIONS = [
  { key: 'capability_coverage', label: 'Capability Coverage' },
  { key: 'scale_match', label: 'Scale Match' },
  { key: 'portfolio_relevance', label: 'Portfolio Relevance' },
  { key: 'geographic_alignment', label: 'Geographic Alignment' },
  { key: 'financial_resilience', label: 'Financial Resilience' },
  { key: 'philosophy_alignment', label: 'Philosophy Alignment' },
  { key: 'tech_compatibility', label: 'Tech Compatibility' },
  { key: 'credentials', label: 'Credentials' },
  { key: 'methodology_fit', label: 'Methodology Fit' },
  { key: 'collaboration_maturity', label: 'Collaboration Maturity' },
];

function ScoringConfigCard({ scope, config, overrides, globalConfig, onSave, onResetField }) {
  const isGlobal = scope === 'global';
  const resolved = resolveConfig(globalConfig, overrides);
  const ov = resolved._overrides?.scoring || {};

  const [localWeights, setLocalWeights] = useState(resolved.scoring.weights);
  const [localTiers, setLocalTiers] = useState(resolved.scoring.tiers);
  const [localRationale, setLocalRationale] = useState(resolved.scoring.rationale || '');
  const [overrideEnabled, setOverrideEnabled] = useState(ov.weights);

  const weightValidation = validateWeights(localWeights);

  useEffect(() => {
    setLocalWeights(resolved.scoring.weights);
    setLocalTiers(resolved.scoring.tiers);
    setLocalRationale(resolved.scoring.rationale || '');
    setOverrideEnabled(ov.weights);
  }, [globalConfig, overrides]);

  const handleWeightChange = (key, value) => {
    const newWeights = { ...localWeights, [key]: Number(value) };
    setLocalWeights(newWeights);
  };

  const handleSaveWeights = () => {
    if (!weightValidation.valid) return;
    if (isGlobal) {
      onSave('scoring.weights', localWeights);
    } else {
      onSave('scoringOverrides', { ...overrides?.scoringOverrides, weights: localWeights, rationale: localRationale || null });
    }
  };

  const handleSaveTiers = () => {
    if (isGlobal) {
      onSave('scoring.tiers', localTiers);
    } else {
      onSave('scoringOverrides', { ...overrides?.scoringOverrides, tiers: localTiers });
    }
  };

  const handleResetWeights = () => {
    if (isGlobal) {
      setLocalWeights(FACTORY_DEFAULTS.scoring.weights);
      onSave('scoring.weights', FACTORY_DEFAULTS.scoring.weights);
    } else {
      onResetField('scoringOverrides', 'weights');
      setLocalWeights(globalConfig?.scoring?.weights || FACTORY_DEFAULTS.scoring.weights);
      setOverrideEnabled(false);
    }
  };

  return (
    <AdminCard title="Scoring Configuration" icon={Target} badge={isGlobal ? 'Global' : 'This Project'}>
      <div className="byt-admin-form">

        {/* Enable override toggle (project only) */}
        {!isGlobal && (
          <div className="byt-admin-form__row">
            <label className="byt-admin-form__checkbox-label">
              <input
                type="checkbox"
                checked={overrideEnabled}
                onChange={(e) => {
                  setOverrideEnabled(e.target.checked);
                  if (!e.target.checked) handleResetWeights();
                }}
              />
              Override weights for this project
            </label>
          </div>
        )}

        {/* Dimension weights */}
        <div className="byt-admin-form__section-label">
          Dimension Weights
          <span className={`byt-admin-weights-total ${weightValidation.valid ? 'byt-admin-weights-total--valid' : 'byt-admin-weights-total--invalid'}`}>
            Total: {weightValidation.total}%
            {!weightValidation.valid && <AlertTriangle size={12} />}
          </span>
        </div>

        {SCORING_DIMENSIONS.map(({ key, label }) => {
          const value = localWeights[key] || 0;
          const isDisabled = !isGlobal && !overrideEnabled;
          return (
            <div key={key} className="byt-admin-weight-row">
              <label className="byt-admin-weight-row__label">{label}</label>
              <div className="byt-admin-weight-row__bar" style={{ width: `${value * 3}px`, background: isDisabled ? '#d5d5d0' : '#D4A574' }} />
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={value}
                onChange={(e) => handleWeightChange(key, e.target.value)}
                disabled={isDisabled}
                className="byt-admin-form__slider byt-admin-form__slider--narrow"
              />
              <span className="byt-admin-weight-row__value">{value}%</span>
              {!isGlobal && !isDisabled && (
                <InheritBadge isOverridden={value !== (globalConfig?.scoring?.weights?.[key] ?? FACTORY_DEFAULTS.scoring.weights[key])} />
              )}
            </div>
          );
        })}

        <div className="byt-admin-form__actions">
          <button
            className="byt-admin-btn byt-admin-btn--primary"
            onClick={handleSaveWeights}
            disabled={!weightValidation.valid}
          >
            <Check size={14} /> Save Weights
          </button>
          <button className="byt-admin-btn byt-admin-btn--ghost" onClick={handleResetWeights}>
            <RotateCcw size={14} /> Reset to {isGlobal ? 'Factory' : 'Global'} Defaults
          </button>
        </div>

        {/* Match tier thresholds */}
        <div className="byt-admin-form__section-label" style={{ marginTop: '1.5rem' }}>
          Match Tier Thresholds
        </div>

        {[
          { key: 'topMatch', label: 'Top Match' },
          { key: 'goodFit', label: 'Good Fit' },
          { key: 'consider', label: 'Consider' },
        ].map(({ key, label }) => (
          <div key={key} className="byt-admin-form__row byt-admin-form__row--inline">
            <label className="byt-admin-form__label byt-admin-form__label--sm">{label}:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={localTiers[key]}
              onChange={(e) => setLocalTiers(p => ({ ...p, [key]: Number(e.target.value) }))}
              className="byt-admin-form__input byt-admin-form__input--sm"
              disabled={!isGlobal && !overrideEnabled}
            />
            <span className="byt-admin-form__suffix">and above</span>
          </div>
        ))}

        <button
          className="byt-admin-btn byt-admin-btn--sm byt-admin-btn--primary"
          onClick={handleSaveTiers}
          style={{ marginTop: '0.5rem' }}
        >
          <Check size={12} /> Save Thresholds
        </button>

        {/* Rationale (project only) */}
        {!isGlobal && overrideEnabled && (
          <>
            <div className="byt-admin-form__section-label" style={{ marginTop: '1.5rem' }}>
              Override Rationale
            </div>
            <p className="byt-admin-form__hint">
              Document why scoring weights differ from the global methodology for this engagement.
            </p>
            <textarea
              className="byt-admin-form__textarea"
              value={localRationale}
              onChange={(e) => setLocalRationale(e.target.value)}
              rows={3}
              placeholder="e.g., Coastal FL market has fewer UHNW-caliber PMs — lowered geographic weight, raised capability weight"
            />
          </>
        )}
      </div>
    </AdminCard>
  );
}

// ============================================================================
// PROJECT BRIEF CARD (Project only)
// ============================================================================

function ProjectBriefCard({ appContext }) {
  const projectCtx = getProjectContext(appContext);
  const validation = validateProjectContext(projectCtx);

  return (
    <AdminCard title="Project Brief" icon={Folder} badge="This Project">
      <div className="byt-admin-form">
        {projectCtx.source === 'n4s' && (
          <div className="byt-admin-form__info-banner">
            <Info size={14} />
            <span>Auto-populated from KYC and FYI modules. Switch to standalone mode to edit directly.</span>
          </div>
        )}
        {projectCtx.source === 'empty' && (
          <div className="byt-admin-form__warning-banner">
            <AlertTriangle size={14} />
            <span>No project data available. Complete KYC module or enter project details manually in standalone mode.</span>
          </div>
        )}

        <div className="byt-admin-brief-grid">
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Project Name</span>
            <span className="byt-admin-brief-item__value">{projectCtx.projectName || '—'}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Client</span>
            <span className="byt-admin-brief-item__value">{projectCtx.clientName || '—'}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Location</span>
            <span className="byt-admin-brief-item__value">{[projectCtx.projectCity, projectCtx.projectState].filter(Boolean).join(', ') || '—'}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Property Type</span>
            <span className="byt-admin-brief-item__value">{projectCtx.propertyType || '—'}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Total Project Budget</span>
            <span className="byt-admin-brief-item__value">{formatBudget(projectCtx.totalBudget)}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Construction Budget</span>
            <span className="byt-admin-brief-item__value">{formatBudget(projectCtx.constructionBudget)}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Target SF</span>
            <span className="byt-admin-brief-item__value">{projectCtx.targetSF ? projectCtx.targetSF.toLocaleString() + ' SF' : '—'}</span>
          </div>
          <div className="byt-admin-brief-item">
            <span className="byt-admin-brief-item__label">Budget Tier</span>
            <span className="byt-admin-brief-item__value" style={{ textTransform: 'capitalize' }}>
              {projectCtx.budgetTier?.replace(/_/g, ' ') || '—'}
            </span>
          </div>
        </div>

        {projectCtx.styleKeywords?.length > 0 && (
          <div className="byt-admin-brief-item" style={{ marginTop: '0.75rem' }}>
            <span className="byt-admin-brief-item__label">Style Keywords</span>
            <div className="byt-admin-tags__list">
              {projectCtx.styleKeywords.map((kw, i) => (
                <span key={i} className="byt-admin-tags__tag">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {projectCtx.includedSpaces?.length > 0 && (
          <div className="byt-admin-brief-item" style={{ marginTop: '0.75rem' }}>
            <span className="byt-admin-brief-item__label">Included Spaces ({projectCtx.includedSpaces.length})</span>
            <div className="byt-admin-tags__list">
              {projectCtx.includedSpaces.map((s, i) => (
                <span key={i} className="byt-admin-tags__tag">{s.name}</span>
              ))}
            </div>
          </div>
        )}

        {!validation.valid && (
          <div className="byt-admin-form__warning-banner" style={{ marginTop: '0.75rem' }}>
            <AlertTriangle size={14} />
            <div>
              {validation.issues.map((issue, i) => <div key={i}>{issue}</div>)}
            </div>
          </div>
        )}
      </div>
    </AdminCard>
  );
}

// ============================================================================
// DATA MANAGEMENT CARD (Project only)
// ============================================================================

function DataManagementCard({ stats }) {
  return (
    <AdminCard title="Data Management" icon={Database} badge="This Project" defaultOpen={false}>
      <div className="byt-admin-form">
        <div className="byt-admin-stats-grid">
          <div className="byt-admin-stat">
            <span className="byt-admin-stat__label">Registry</span>
            <span className="byt-admin-stat__value">{stats?.consultants?.total ?? '—'}</span>
            <span className="byt-admin-stat__sub">
              {stats?.consultants?.verified ?? 0} verified · {stats?.consultants?.pending ?? 0} pending
            </span>
          </div>
          <div className="byt-admin-stat">
            <span className="byt-admin-stat__label">Engagements</span>
            <span className="byt-admin-stat__value">{stats?.engagements?.active ?? '—'}</span>
            <span className="byt-admin-stat__sub">{stats?.engagements?.archived ?? 0} archived</span>
          </div>
          <div className="byt-admin-stat">
            <span className="byt-admin-stat__label">Discovery Queue</span>
            <span className="byt-admin-stat__value">{stats?.discovery?.pending ?? '—'}</span>
            <span className="byt-admin-stat__sub">
              {stats?.discovery?.imported ?? 0} imported · {stats?.discovery?.rejected ?? 0} rejected
            </span>
          </div>
          <div className="byt-admin-stat">
            <span className="byt-admin-stat__label">RFQ Responses</span>
            <span className="byt-admin-stat__value">{stats?.rfq?.submitted ?? '—'}</span>
            <span className="byt-admin-stat__sub">
              {stats?.rfq?.sent ?? 0} sent · {stats?.rfq?.scored ?? 0} scored
            </span>
          </div>
        </div>

        <div className="byt-admin-form__actions" style={{ marginTop: '1rem' }}>
          <button className="byt-admin-btn byt-admin-btn--sm">
            <Download size={12} /> Export Registry CSV
          </button>
          <button className="byt-admin-btn byt-admin-btn--sm">
            <Download size={12} /> Export JSON
          </button>
          <button className="byt-admin-btn byt-admin-btn--sm">
            <Archive size={12} /> Archive Completed
          </button>
        </div>

        <div className="byt-admin-form__danger-zone">
          <span className="byt-admin-form__section-label" style={{ color: '#d32f2f' }}>
            <AlertTriangle size={14} /> Danger Zone
          </span>
          <div className="byt-admin-form__actions">
            <button className="byt-admin-btn byt-admin-btn--sm byt-admin-btn--danger">
              <Trash2 size={12} /> Reset Engagements
            </button>
            <button className="byt-admin-btn byt-admin-btn--sm byt-admin-btn--danger">
              <Trash2 size={12} /> Purge Discovery Queue
            </button>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

// ============================================================================
// MAIN ADMIN SCREEN
// ============================================================================

const BYTAdminScreen = () => {
  const appContext = useAppContext();
  const { bytData, updateBYTData, activeProjectId } = appContext;

  const [subTab, setSubTab] = useState('global');
  const [globalConfig, setGlobalConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error'

  // Load global config on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const config = await adminApi.loadGlobalConfig();
      setGlobalConfig(config || {});
      const statsData = await adminApi.getStats(activeProjectId);
      setStats(statsData);
      setLoading(false);
    })();
  }, [activeProjectId]);

  // Save to global config (byt_global_config table)
  const handleSaveGlobal = useCallback(async (key, value) => {
    setSaveStatus('saving');
    try {
      await adminApi.saveGlobalConfig(key, value);
      // Update local state
      setGlobalConfig(prev => {
        const updated = { ...prev };
        // Handle nested keys like "discovery.model"
        const parts = key.split('.');
        let ref = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!ref[parts[i]]) ref[parts[i]] = {};
          ref = ref[parts[i]];
        }
        ref[parts[parts.length - 1]] = value;
        return updated;
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Global config save failed:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, []);

  // Save project-level override (bytData.adminConfig)
  const handleSaveProject = useCallback((overrideKey, value) => {
    setSaveStatus('saving');
    const current = bytData?.adminConfig || {};
    updateBYTData({
      ...bytData,
      adminConfig: {
        ...current,
        [overrideKey]: value,
      },
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  }, [bytData, updateBYTData]);

  // Reset a specific project override field
  const handleResetProjectField = useCallback((overrideKey, fieldKey) => {
    const current = bytData?.adminConfig || {};
    const overrideGroup = { ...(current[overrideKey] || {}) };

    if (fieldKey.includes('.')) {
      // Nested field like "disciplineGuidance.pm"
      const [group, subKey] = fieldKey.split('.');
      const nested = { ...(overrideGroup[group] || {}) };
      delete nested[subKey];
      overrideGroup[group] = Object.keys(nested).length > 0 ? nested : undefined;
    } else {
      delete overrideGroup[fieldKey];
    }

    updateBYTData({
      ...bytData,
      adminConfig: {
        ...current,
        [overrideKey]: Object.keys(overrideGroup).filter(k => overrideGroup[k] != null).length > 0
          ? overrideGroup : undefined,
      },
    });
  }, [bytData, updateBYTData]);

  const projectOverrides = bytData?.adminConfig || {};

  if (loading) {
    return (
      <div className="byt-admin-loading">
        <RefreshCw size={20} className="byt-spin" />
        <span>Loading admin configuration...</span>
      </div>
    );
  }

  return (
    <div className="byt-admin">
      {/* Sub-tabs */}
      <div className="byt-admin-subtabs">
        <button
          className={`byt-admin-subtab ${subTab === 'global' ? 'byt-admin-subtab--active' : ''}`}
          onClick={() => setSubTab('global')}
        >
          <Globe size={14} />
          Global Defaults
        </button>
        <button
          className={`byt-admin-subtab ${subTab === 'project' ? 'byt-admin-subtab--active' : ''}`}
          onClick={() => setSubTab('project')}
        >
          <Folder size={14} />
          This Project
        </button>

        {saveStatus && (
          <span className={`byt-admin-save-indicator byt-admin-save-indicator--${saveStatus}`}>
            {saveStatus === 'saving' && <><RefreshCw size={12} className="byt-spin" /> Saving...</>}
            {saveStatus === 'saved' && <><Check size={12} /> Saved</>}
            {saveStatus === 'error' && <><AlertTriangle size={12} /> Save failed</>}
          </span>
        )}
      </div>

      {/* Global Defaults */}
      {subTab === 'global' && (
        <div className="byt-admin-cards">
          <ApiConnectionsCard
            globalConfig={globalConfig}
            onSaveGlobal={handleSaveGlobal}
          />
          <DiscoverySettingsCard
            scope="global"
            config={globalConfig?.discovery || {}}
            globalConfig={globalConfig}
            overrides={null}
            onSave={handleSaveGlobal}
            onResetField={() => {}}
          />
          <ScoringConfigCard
            scope="global"
            config={globalConfig?.scoring || {}}
            globalConfig={globalConfig}
            overrides={null}
            onSave={handleSaveGlobal}
            onResetField={() => {}}
          />
        </div>
      )}

      {/* This Project */}
      {subTab === 'project' && (
        <div className="byt-admin-cards">
          <ProjectBriefCard appContext={appContext} />
          <DiscoverySettingsCard
            scope="project"
            config={projectOverrides?.discoveryOverrides || {}}
            globalConfig={globalConfig}
            overrides={projectOverrides}
            onSave={handleSaveProject}
            onResetField={handleResetProjectField}
          />
          <ScoringConfigCard
            scope="project"
            config={projectOverrides?.scoringOverrides || {}}
            globalConfig={globalConfig}
            overrides={projectOverrides}
            onSave={handleSaveProject}
            onResetField={handleResetProjectField}
          />
          <DataManagementCard stats={stats} />
        </div>
      )}
    </div>
  );
};

export default BYTAdminScreen;
