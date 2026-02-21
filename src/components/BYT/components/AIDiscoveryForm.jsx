/**
 * AIDiscoveryForm.jsx — AI Discovery Criteria Form
 *
 * Phase 4: Added "Use Client Profile" toggle that auto-fills search criteria
 * from the active client's KYC/FYI data (design identity, budget, geography,
 * space program) and enriches the AI discovery prompt.
 *
 * Collects search criteria for AI-powered consultant discovery:
 * discipline, geographic scope, budget tier, style keywords, result count.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Search, Zap, Clock, MapPin, DollarSign, Palette, Hash, X, Users, ToggleLeft, ToggleRight, Info,
} from 'lucide-react';
import {
  extractState,
  deriveStyleKeywords,
  deriveBudgetTier,
  deriveArchitecturalStyles,
  checkMatchPrerequisites,
} from '../utils/matchingAlgorithm';

const DISCIPLINES = [
  { key: 'architect', label: 'Architect', color: '#315098', icon: '🏛' },
  { key: 'interior_designer', label: 'Interior Designer', color: '#8CA8BE', icon: '🎨' },
  { key: 'pm', label: 'Project Manager', color: '#AFBDB0', icon: '📋' },
  { key: 'gc', label: 'General Contractor', color: '#C4A484', icon: '🔨' },
];

const BUDGET_TIERS = [
  { key: 'ultra_luxury', label: 'Ultra-Luxury', range: '$10M+', color: '#c9a227' },
  { key: 'luxury', label: 'Luxury', range: '$5M–$15M', color: '#1e3a5f' },
  { key: 'high_end', label: 'High-End', range: '$2M–$8M', color: '#315098' },
  { key: 'mid_range', label: 'Mid-Range', range: '$1M–$3M', color: '#6b6b6b' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const STYLE_SUGGESTIONS = [
  'Contemporary', 'Traditional', 'Transitional', 'Modern', 'Mediterranean',
  'Colonial', 'Coastal', 'Farmhouse', 'Minimalist', 'Art Deco',
  'Mid-Century Modern', 'Craftsman', 'Industrial', 'Rustic', 'Neoclassical',
  'Sustainable', 'Smart Home', 'Wellness-Focused', 'Resort-Style',
];

const RESULT_COUNTS = [5, 10, 15, 20];

const AIDiscoveryForm = ({ onSearch, isSearching, recentSearches = [], kycData, fyiData }) => {
  const [discipline, setDiscipline] = useState('architect');
  const [selectedStates, setSelectedStates] = useState([]);
  const [budgetTier, setBudgetTier] = useState('luxury');
  const [styleKeywords, setStyleKeywords] = useState([]);
  const [styleInput, setStyleInput] = useState('');
  const [resultCount, setResultCount] = useState(10);
  const [showStatePicker, setShowStatePicker] = useState(false);

  // Phase 4: Client profile toggle
  const [useClientProfile, setUseClientProfile] = useState(false);

  // Check prerequisites for profile toggle
  const profilePrereqs = useMemo(() => {
    return checkMatchPrerequisites(kycData, fyiData);
  }, [kycData, fyiData]);

  // Derive profile data when toggle is available
  const profileData = useMemo(() => {
    if (!kycData?.principal) return null;

    const principal = kycData.principal;
    const projectParams = principal.projectParameters || {};
    const budgetFw = principal.budgetFramework || {};
    const designId = principal.designIdentity || {};
    const lifestyle = principal.lifestyleLiving || {};
    const portfolioCtx = principal.portfolioContext || {};

    // Client name
    const clientName = [portfolioCtx.principalFirstName, portfolioCtx.principalLastName]
      .filter(Boolean).join(' ') || 'Client';

    // Extract state
    const state = extractState(projectParams.projectCity, projectParams.projectCountry);

    // Budget tier
    const tier = deriveBudgetTier(budgetFw.totalProjectBudget);

    // Style keywords from taste axes + tags
    const styles = deriveStyleKeywords(designId);

    // Architectural Style Spectrum (AS1–AS9) — 3 closest styles
    const archStyles = deriveArchitecturalStyles(designId);

    // FYI included spaces
    const includedSpaces = [];
    if (fyiData?.selections) {
      Object.entries(fyiData.selections).forEach(([code, space]) => {
        if (space?.included) {
          includedSpaces.push(space.displayName || space.name || code);
        }
      });
    }

    // Budget formatted
    const budgetNum = Number(budgetFw.totalProjectBudget) || 0;
    const budgetFormatted = budgetNum >= 1000000
      ? '$' + (budgetNum / 1000000).toFixed(1) + 'M'
      : budgetNum > 0
        ? '$' + budgetNum.toLocaleString()
        : null;

    return {
      clientName,
      projectCity: projectParams.projectCity || '',
      projectCountry: projectParams.projectCountry || '',
      propertyType: projectParams.propertyType || '',
      targetGSF: projectParams.targetGSF || fyiData?.settings?.targetSF || null,
      state,
      budgetTier: tier,
      budgetFormatted,
      totalBudget: budgetNum,
      styleKeywords: styles,
      architecturalStyles: archStyles,
      includedSpaces,
      designIdentity: designId,
      lifestyle,
    };
  }, [kycData, fyiData]);

  // Auto-fill when toggle is turned ON
  useEffect(() => {
    if (!useClientProfile || !profileData) return;

    // Auto-select state
    if (profileData.state) {
      setSelectedStates(prev => {
        if (prev.includes(profileData.state)) return prev;
        return [profileData.state];
      });
    }

    // Auto-select budget tier
    if (profileData.budgetTier) {
      setBudgetTier(profileData.budgetTier);
    }

    // Auto-populate style keywords
    if (profileData.styleKeywords.length > 0) {
      setStyleKeywords(profileData.styleKeywords);
    }
  }, [useClientProfile, profileData]);

  // Clear auto-filled values when toggle is turned OFF
  const handleToggleProfile = useCallback(() => {
    if (useClientProfile) {
      // Turning OFF — clear auto-filled values
      setSelectedStates([]);
      setBudgetTier('luxury');
      setStyleKeywords([]);
      setUseClientProfile(false);
    } else {
      // Turning ON
      setUseClientProfile(true);
    }
  }, [useClientProfile]);

  const toggleState = useCallback((st) => {
    setSelectedStates(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  }, []);

  const addStyleKeyword = useCallback((keyword) => {
    const trimmed = keyword.trim();
    if (trimmed && !styleKeywords.includes(trimmed)) {
      setStyleKeywords(prev => [...prev, trimmed]);
    }
    setStyleInput('');
  }, [styleKeywords]);

  const removeStyleKeyword = useCallback((keyword) => {
    setStyleKeywords(prev => prev.filter(k => k !== keyword));
  }, []);

  const handleStyleInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addStyleKeyword(styleInput);
    }
  }, [styleInput, addStyleKeyword]);

  const handleSubmit = useCallback(() => {
    if (isSearching) return;
    onSearch({
      discipline,
      states: selectedStates,
      budgetTier,
      styleKeywords,
      limit: resultCount,
      useClientProfile,
      profileData: useClientProfile ? profileData : null,
    });
  }, [discipline, selectedStates, budgetTier, styleKeywords, resultCount, onSearch, isSearching, useClientProfile, profileData]);

  const loadPreviousSearch = useCallback((search) => {
    if (search.discipline) setDiscipline(search.discipline);
    if (search.states) setSelectedStates(search.states);
    if (search.budgetTier) setBudgetTier(search.budgetTier);
    if (search.styleKeywords) setStyleKeywords(search.styleKeywords);
    if (search.limit) setResultCount(search.limit);
    // Don't restore profile toggle — user should re-enable explicitly
    setUseClientProfile(false);
  }, []);

  const profileToggleDisabled = !profilePrereqs.ready;

  return (
    <div className="byt-ai-form">
      {/* Phase 4: Client Profile Toggle */}
      <div className={`byt-profile-toggle ${useClientProfile ? 'byt-profile-toggle--active' : ''} ${profileToggleDisabled ? 'byt-profile-toggle--disabled' : ''}`}>
        <div className="byt-profile-toggle__header">
          <div className="byt-profile-toggle__label-row">
            <Users size={16} />
            <span className="byt-profile-toggle__label">Use Client Profile</span>
          </div>
          <button
            className="byt-profile-toggle__switch"
            onClick={handleToggleProfile}
            disabled={profileToggleDisabled}
            aria-label={useClientProfile ? 'Disable client profile' : 'Enable client profile'}
          >
            {useClientProfile
              ? <ToggleRight size={28} className="byt-profile-toggle__icon byt-profile-toggle__icon--on" />
              : <ToggleLeft size={28} className="byt-profile-toggle__icon byt-profile-toggle__icon--off" />
            }
          </button>
        </div>

        <p className="byt-profile-toggle__subtitle">
          {profileToggleDisabled
            ? 'Complete KYC Project City and Budget to enable profile-based search'
            : useClientProfile
              ? 'Search criteria derived from ' + (profileData?.clientName || 'client') + '\u2019s KYC & FYI data'
              : 'Manual search \u2014 select your own criteria'
          }
        </p>

        {/* Profile Summary Box */}
        {useClientProfile && profileData && (
          <div className="byt-profile-toggle__info">
            <div className="byt-profile-toggle__info-header">
              <Info size={14} />
              <span>Profile Data Applied</span>
            </div>
            <div className="byt-profile-toggle__info-details">
              <span>
                {profileData.projectCity && profileData.projectCity}
                {profileData.state && ', ' + profileData.state}
                {profileData.budgetFormatted && ' \u00b7 Budget: ' + profileData.budgetFormatted}
              </span>
              {profileData.architecturalStyles && (
                <span className="byt-profile-toggle__info-arch">
                  Architectural Style: {profileData.architecturalStyles.styles.map(s =>
                    s.isPrimary ? s.name : s.name
                  ).join(' \u2022 ')}
                  {' '}(AS{profileData.architecturalStyles.asPosition.toFixed(1)})
                </span>
              )}
              <span>
                {profileData.styleKeywords.length} style signal{profileData.styleKeywords.length !== 1 ? 's' : ''} detected
              </span>
              {profileData.includedSpaces.length > 0 && (
                <span className="byt-profile-toggle__info-spaces">
                  Spaces: {profileData.includedSpaces.slice(0, 8).join(', ')}
                  {profileData.includedSpaces.length > 8 && ' +' + (profileData.includedSpaces.length - 8) + ' more'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Discipline selector */}
      <div className="byt-ai-form__section">
        <label className="byt-ai-form__label">Discipline</label>
        <div className="byt-ai-form__discipline-grid">
          {DISCIPLINES.map(d => (
            <button
              key={d.key}
              className={`byt-ai-form__discipline-btn ${discipline === d.key ? 'byt-ai-form__discipline-btn--active' : ''}`}
              style={discipline === d.key ? { borderColor: d.color, background: d.color + '12' } : {}}
              onClick={() => setDiscipline(d.key)}
            >
              <span className="byt-ai-form__discipline-icon">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Geographic scope */}
      <div className="byt-ai-form__section">
        <label className="byt-ai-form__label">
          <MapPin size={14} />
          Geographic Focus
          {useClientProfile && profileData?.state && (
            <span className="byt-profile-badge">From KYC</span>
          )}
        </label>
        <div className="byt-ai-form__state-controls">
          <button
            className="byt-ai-form__state-toggle"
            onClick={() => setShowStatePicker(!showStatePicker)}
          >
            {selectedStates.length === 0
              ? 'National (all states)'
              : selectedStates.length + ' state' + (selectedStates.length !== 1 ? 's' : '') + ' selected'
            }
          </button>
          {selectedStates.length > 0 && (
            <button className="byt-btn byt-btn--ghost" onClick={() => setSelectedStates([])}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {selectedStates.length > 0 && (
          <div className="byt-ai-form__selected-states">
            {selectedStates.map(st => (
              <span key={st} className="byt-ai-form__state-tag">
                {st}
                <button onClick={() => toggleState(st)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {showStatePicker && (
          <div className="byt-ai-form__state-picker">
            {US_STATES.map(st => (
              <button
                key={st}
                className={`byt-ai-form__state-chip ${selectedStates.includes(st) ? 'byt-ai-form__state-chip--active' : ''}`}
                onClick={() => toggleState(st)}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Budget tier */}
      <div className="byt-ai-form__section">
        <label className="byt-ai-form__label">
          <DollarSign size={14} />
          Budget Tier
          {useClientProfile && profileData?.budgetTier && (
            <span className="byt-profile-badge">From KYC</span>
          )}
        </label>
        <div className="byt-ai-form__budget-grid">
          {BUDGET_TIERS.map(bt => (
            <button
              key={bt.key}
              className={`byt-ai-form__budget-btn ${budgetTier === bt.key ? 'byt-ai-form__budget-btn--active' : ''}`}
              style={budgetTier === bt.key ? { borderColor: bt.color } : {}}
              onClick={() => setBudgetTier(bt.key)}
            >
              <span className="byt-ai-form__budget-label">{bt.label}</span>
              <span className="byt-ai-form__budget-range">{bt.range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style keywords */}
      <div className="byt-ai-form__section">
        <label className="byt-ai-form__label">
          <Palette size={14} />
          Style Keywords
          {useClientProfile && profileData?.styleKeywords.length > 0 && (
            <span className="byt-profile-badge">From KYC</span>
          )}
        </label>
        <div className="byt-ai-form__style-input-row">
          <input
            type="text"
            value={styleInput}
            onChange={(e) => setStyleInput(e.target.value)}
            onKeyDown={handleStyleInputKeyDown}
            placeholder="Type and press Enter, or pick below..."
            className="byt-ai-form__style-input"
          />
          {styleInput && (
            <button className="byt-btn byt-btn--ghost" onClick={() => addStyleKeyword(styleInput)}>
              Add
            </button>
          )}
        </div>

        {styleKeywords.length > 0 && (
          <div className="byt-ai-form__style-tags">
            {styleKeywords.map(kw => (
              <span key={kw} className="byt-ai-form__style-tag">
                {kw}
                <button onClick={() => removeStyleKeyword(kw)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="byt-ai-form__style-suggestions">
          {STYLE_SUGGESTIONS.filter(s => !styleKeywords.includes(s)).slice(0, 12).map(s => (
            <button
              key={s}
              className="byt-ai-form__suggestion-chip"
              onClick={() => addStyleKeyword(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="byt-ai-form__section">
        <label className="byt-ai-form__label">
          <Hash size={14} />
          Number of Results
        </label>
        <div className="byt-ai-form__count-btns">
          {RESULT_COUNTS.map(n => (
            <button
              key={n}
              className={`byt-ai-form__count-btn ${resultCount === n ? 'byt-ai-form__count-btn--active' : ''}`}
              onClick={() => setResultCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="byt-ai-form__submit">
        <button
          className="byt-btn byt-btn--primary byt-btn--lg"
          onClick={handleSubmit}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Zap size={16} className="spinning" />
              Discovering consultants...
            </>
          ) : (
            <>
              <Zap size={16} />
              {useClientProfile ? 'Run Profile-Aware Discovery' : 'Run AI Discovery'}
            </>
          )}
        </button>
        <p className="byt-ai-form__hint">
          {useClientProfile
            ? 'AI will search for ' + (DISCIPLINES.find(d => d.key === discipline)?.label.toLowerCase() || 'consultant') + ' firms aligned with ' + (profileData?.clientName || 'client') + '\u2019s full design identity and project parameters.'
            : 'AI will search for real, verifiable ' + (DISCIPLINES.find(d => d.key === discipline)?.label.toLowerCase() || 'consultant') + ' firms matching your criteria.'
          }
        </p>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="byt-ai-form__recent">
          <label className="byt-ai-form__label">
            <Clock size={14} />
            Recent Searches
          </label>
          <div className="byt-ai-form__recent-list">
            {recentSearches.map((search, i) => (
              <button
                key={i}
                className="byt-ai-form__recent-item"
                onClick={() => loadPreviousSearch(search)}
              >
                <span className="byt-ai-form__recent-query">{search.query || 'Previous search'}</span>
                <span className="byt-ai-form__recent-meta">
                  {search.resultCount || 0} results
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDiscoveryForm;
