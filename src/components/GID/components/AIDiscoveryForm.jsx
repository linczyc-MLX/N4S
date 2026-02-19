/**
 * AIDiscoveryForm.jsx — AI Discovery Criteria Form
 * 
 * Collects search criteria for AI-powered consultant discovery:
 * discipline, geographic scope, budget tier, style keywords, result count.
 */

import React, { useState, useCallback } from 'react';
import {
  Search, Zap, Clock, MapPin, DollarSign, Palette, Hash, X,
} from 'lucide-react';

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

const AIDiscoveryForm = ({ onSearch, isSearching, recentSearches = [] }) => {
  const [discipline, setDiscipline] = useState('architect');
  const [selectedStates, setSelectedStates] = useState([]);
  const [budgetTier, setBudgetTier] = useState('luxury');
  const [styleKeywords, setStyleKeywords] = useState([]);
  const [styleInput, setStyleInput] = useState('');
  const [resultCount, setResultCount] = useState(10);
  const [showStatePicker, setShowStatePicker] = useState(false);

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
    });
  }, [discipline, selectedStates, budgetTier, styleKeywords, resultCount, onSearch, isSearching]);

  const loadPreviousSearch = useCallback((search) => {
    if (search.discipline) setDiscipline(search.discipline);
    if (search.states) setSelectedStates(search.states);
    if (search.budgetTier) setBudgetTier(search.budgetTier);
    if (search.styleKeywords) setStyleKeywords(search.styleKeywords);
    if (search.limit) setResultCount(search.limit);
  }, []);

  return (
    <div className="gid-ai-form">
      {/* Discipline selector */}
      <div className="gid-ai-form__section">
        <label className="gid-ai-form__label">Discipline</label>
        <div className="gid-ai-form__discipline-grid">
          {DISCIPLINES.map(d => (
            <button
              key={d.key}
              className={`gid-ai-form__discipline-btn ${discipline === d.key ? 'gid-ai-form__discipline-btn--active' : ''}`}
              style={discipline === d.key ? { borderColor: d.color, background: d.color + '12' } : {}}
              onClick={() => setDiscipline(d.key)}
            >
              <span className="gid-ai-form__discipline-icon">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Geographic scope */}
      <div className="gid-ai-form__section">
        <label className="gid-ai-form__label">
          <MapPin size={14} />
          Geographic Focus
        </label>
        <div className="gid-ai-form__state-controls">
          <button
            className="gid-ai-form__state-toggle"
            onClick={() => setShowStatePicker(!showStatePicker)}
          >
            {selectedStates.length === 0
              ? 'National (all states)'
              : `${selectedStates.length} state${selectedStates.length !== 1 ? 's' : ''} selected`
            }
          </button>
          {selectedStates.length > 0 && (
            <button className="gid-btn gid-btn--ghost" onClick={() => setSelectedStates([])}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {selectedStates.length > 0 && (
          <div className="gid-ai-form__selected-states">
            {selectedStates.map(st => (
              <span key={st} className="gid-ai-form__state-tag">
                {st}
                <button onClick={() => toggleState(st)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {showStatePicker && (
          <div className="gid-ai-form__state-picker">
            {US_STATES.map(st => (
              <button
                key={st}
                className={`gid-ai-form__state-chip ${selectedStates.includes(st) ? 'gid-ai-form__state-chip--active' : ''}`}
                onClick={() => toggleState(st)}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Budget tier */}
      <div className="gid-ai-form__section">
        <label className="gid-ai-form__label">
          <DollarSign size={14} />
          Budget Tier
        </label>
        <div className="gid-ai-form__budget-grid">
          {BUDGET_TIERS.map(bt => (
            <button
              key={bt.key}
              className={`gid-ai-form__budget-btn ${budgetTier === bt.key ? 'gid-ai-form__budget-btn--active' : ''}`}
              style={budgetTier === bt.key ? { borderColor: bt.color } : {}}
              onClick={() => setBudgetTier(bt.key)}
            >
              <span className="gid-ai-form__budget-label">{bt.label}</span>
              <span className="gid-ai-form__budget-range">{bt.range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style keywords */}
      <div className="gid-ai-form__section">
        <label className="gid-ai-form__label">
          <Palette size={14} />
          Style Keywords
        </label>
        <div className="gid-ai-form__style-input-row">
          <input
            type="text"
            value={styleInput}
            onChange={(e) => setStyleInput(e.target.value)}
            onKeyDown={handleStyleInputKeyDown}
            placeholder="Type and press Enter, or pick below..."
            className="gid-ai-form__style-input"
          />
          {styleInput && (
            <button className="gid-btn gid-btn--ghost" onClick={() => addStyleKeyword(styleInput)}>
              Add
            </button>
          )}
        </div>

        {styleKeywords.length > 0 && (
          <div className="gid-ai-form__style-tags">
            {styleKeywords.map(kw => (
              <span key={kw} className="gid-ai-form__style-tag">
                {kw}
                <button onClick={() => removeStyleKeyword(kw)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="gid-ai-form__style-suggestions">
          {STYLE_SUGGESTIONS.filter(s => !styleKeywords.includes(s)).slice(0, 12).map(s => (
            <button
              key={s}
              className="gid-ai-form__suggestion-chip"
              onClick={() => addStyleKeyword(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="gid-ai-form__section">
        <label className="gid-ai-form__label">
          <Hash size={14} />
          Number of Results
        </label>
        <div className="gid-ai-form__count-btns">
          {RESULT_COUNTS.map(n => (
            <button
              key={n}
              className={`gid-ai-form__count-btn ${resultCount === n ? 'gid-ai-form__count-btn--active' : ''}`}
              onClick={() => setResultCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="gid-ai-form__submit">
        <button
          className="gid-btn gid-btn--primary gid-btn--lg"
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
              Run AI Discovery
            </>
          )}
        </button>
        <p className="gid-ai-form__hint">
          AI will search for real, verifiable {DISCIPLINES.find(d => d.key === discipline)?.label.toLowerCase() || 'consultant'} firms matching your criteria.
        </p>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="gid-ai-form__recent">
          <label className="gid-ai-form__label">
            <Clock size={14} />
            Recent Searches
          </label>
          <div className="gid-ai-form__recent-list">
            {recentSearches.map((search, i) => (
              <button
                key={i}
                className="gid-ai-form__recent-item"
                onClick={() => loadPreviousSearch(search)}
              >
                <span className="gid-ai-form__recent-query">{search.query || 'Previous search'}</span>
                <span className="gid-ai-form__recent-meta">
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
