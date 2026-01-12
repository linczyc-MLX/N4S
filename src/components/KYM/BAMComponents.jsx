/**
 * BAMComponents.jsx
 * 
 * Buyer Alignment Module - UI Components
 */

import React, { useState, useMemo } from 'react';
import {
  Cpu, Film, Landmark, Globe, Castle, Trophy, HeartPulse,
  Building2, Palette, ShieldCheck, ChevronRight, X,
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle,
  Info, ChevronDown, ChevronUp, Users
} from 'lucide-react';

// Icon mapping for personas
const PERSONA_ICONS = {
  techExecutive: Cpu,
  entertainment: Film,
  finance: Landmark,
  international: Globe,
  generational: Castle,
  sports: Trophy,
  medical: HeartPulse,
  developer: Building2,
  creative: Palette,
  familyOffice: ShieldCheck,
};

// =============================================================================
// PERSONA CARD (Main Grid View)
// =============================================================================

export const PersonaCard = ({ persona, scoring, rank, isTop, onClick }) => {
  const Icon = PERSONA_ICONS[persona.id] || Users;
  
  const getMatchColor = (level) => {
    switch (level) {
      case 'Strong': return '#16a34a';
      case 'Moderate': return '#ca8a04';
      default: return '#6b7280';
    }
  };

  const matchColor = getMatchColor(scoring.matchLevel);
  const topFactors = scoring.positiveFactors.slice(0, 3);

  return (
    <div 
      className={`bam-persona-card ${isTop ? 'bam-persona-card--top' : ''}`}
      onClick={onClick}
    >
      {rank && (
        <div className="bam-persona-rank">#{rank}</div>
      )}
      
      <div className="bam-persona-header">
        <div className="bam-persona-icon" style={{ backgroundColor: `${matchColor}15` }}>
          <Icon size={24} style={{ color: matchColor }} />
        </div>
        <div className="bam-persona-title">
          <h4>{persona.name}</h4>
          <p>{persona.shortDesc}</p>
        </div>
      </div>

      <div className="bam-score-section">
        <div className="bam-score-bar-container">
          <div 
            className="bam-score-bar" 
            style={{ 
              width: `${scoring.score}%`,
              backgroundColor: matchColor,
            }}
          />
        </div>
        <div className="bam-score-details">
          <span className="bam-score-value">{scoring.score}%</span>
          <span 
            className="bam-match-level"
            style={{ color: matchColor }}
          >
            {scoring.matchLevel} Match
          </span>
        </div>
      </div>

      {topFactors.length > 0 && (
        <div className="bam-top-factors">
          {topFactors.map((factor, idx) => (
            <div key={idx} className="bam-factor-chip bam-factor-chip--positive">
              <CheckCircle2 size={12} />
              {factor.factor}
            </div>
          ))}
        </div>
      )}

      <button className="bam-view-details">
        View Details <ChevronRight size={16} />
      </button>
    </div>
  );
};

// =============================================================================
// PERSONA DETAIL SIDEBAR
// =============================================================================

export const PersonaDetailSidebar = ({ persona, scoring, onClose, marketData }) => {
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const Icon = PERSONA_ICONS[persona.id] || Users;

  const getMatchColor = (level) => {
    switch (level) {
      case 'Strong': return '#16a34a';
      case 'Moderate': return '#ca8a04';
      default: return '#6b7280';
    }
  };

  const matchColor = getMatchColor(scoring.matchLevel);

  return (
    <div className="bam-sidebar-overlay" onClick={onClose}>
      <div className="bam-sidebar" onClick={e => e.stopPropagation()}>
        <div className="bam-sidebar-header">
          <div className="bam-sidebar-icon" style={{ backgroundColor: `${matchColor}15` }}>
            <Icon size={32} style={{ color: matchColor }} />
          </div>
          <div>
            <h3>{persona.name}</h3>
            <span 
              className="bam-sidebar-match"
              style={{ backgroundColor: `${matchColor}15`, color: matchColor }}
            >
              {scoring.score}% • {scoring.matchLevel} Match
            </span>
          </div>
          <button className="bam-sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="bam-sidebar-content">
          {/* Description */}
          <div className="bam-sidebar-section">
            <p className="bam-persona-description">{persona.fullDesc}</p>
          </div>

          {/* Demographics */}
          <div className="bam-sidebar-section">
            <h4>Typical Demographics</h4>
            <div className="bam-demo-grid">
              <div className="bam-demo-item">
                <span className="bam-demo-label">Age Range</span>
                <span className="bam-demo-value">{persona.demographics.ageRange}</span>
              </div>
              <div className="bam-demo-item">
                <span className="bam-demo-label">Net Worth</span>
                <span className="bam-demo-value">{persona.demographics.netWorth}</span>
              </div>
              <div className="bam-demo-item bam-demo-item--full">
                <span className="bam-demo-label">Occupation</span>
                <span className="bam-demo-value">{persona.demographics.occupation}</span>
              </div>
            </div>
          </div>

          {/* Positive Factors */}
          {scoring.positiveFactors.length > 0 && (
            <div className="bam-sidebar-section">
              <h4>
                <TrendingUp size={16} style={{ color: '#16a34a' }} />
                Alignment Factors
              </h4>
              <div className="bam-factors-list">
                {scoring.positiveFactors.map((factor, idx) => (
                  <div key={idx} className="bam-factor-item bam-factor-item--positive">
                    <div className="bam-factor-header">
                      <CheckCircle2 size={16} />
                      <span className="bam-factor-name">{factor.factor}</span>
                      <span className="bam-factor-impact">+{factor.impact}</span>
                    </div>
                    <p className="bam-factor-desc">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Negative Factors */}
          {scoring.negativeFactors.length > 0 && (
            <div className="bam-sidebar-section">
              <h4>
                <TrendingDown size={16} style={{ color: '#ca8a04' }} />
                Potential Misalignments
              </h4>
              <div className="bam-factors-list">
                {scoring.negativeFactors.map((factor, idx) => (
                  <div key={idx} className="bam-factor-item bam-factor-item--negative">
                    <div className="bam-factor-header">
                      <AlertTriangle size={16} />
                      <span className="bam-factor-name">{factor.factor}</span>
                      <span className="bam-factor-impact">{factor.impact}</span>
                    </div>
                    <p className="bam-factor-desc">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Alignment (if KYM data available) */}
          {marketData && marketData.properties?.length > 0 && (
            <div className="bam-sidebar-section">
              <h4>
                <Landmark size={16} />
                Market Validation
              </h4>
              <div className="bam-market-insight">
                <Info size={14} />
                <p>
                  Based on {marketData.properties.length} active listings in {marketData.location?.city}, 
                  this market shows {scoring.matchLevel.toLowerCase()} alignment with {persona.name} preferences.
                </p>
              </div>
            </div>
          )}

          {/* Algorithm Explanation (Collapsible) */}
          <div className="bam-sidebar-section bam-algorithm-section">
            <button 
              className="bam-algorithm-toggle"
              onClick={() => setShowAlgorithm(!showAlgorithm)}
            >
              <Info size={16} />
              How This Score Was Calculated
              {showAlgorithm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showAlgorithm && (
              <div className="bam-algorithm-content">
                <p>
                  The alignment score starts at a base of <strong>50 points</strong> and 
                  adjusts based on your design decisions across six categories:
                </p>
                <ul>
                  <li><strong>Space Selections</strong> - From FYI module selections</li>
                  <li><strong>Design Style</strong> - From KYC taste preferences</li>
                  <li><strong>Property Size</strong> - From MVP square footage</li>
                  <li><strong>Location</strong> - From KYM market selection</li>
                  <li><strong>Family Profile</strong> - From KYC household data</li>
                  <li><strong>Bedroom Count</strong> - From FYI room selections</li>
                </ul>
                <p>
                  Each category can add or subtract points based on how well your 
                  choices align with typical {persona.name} preferences.
                </p>
                <div className="bam-score-breakdown">
                  <div className="bam-breakdown-row">
                    <span>Base Score</span>
                    <span>50</span>
                  </div>
                  {scoring.allFactors.map((f, i) => (
                    <div key={i} className="bam-breakdown-row">
                      <span>{f.category}: {f.factor}</span>
                      <span className={f.impact > 0 ? 'positive' : 'negative'}>
                        {f.impact > 0 ? '+' : ''}{f.impact}
                      </span>
                    </div>
                  ))}
                  <div className="bam-breakdown-row bam-breakdown-total">
                    <span>Final Score</span>
                    <span>{scoring.score}%</span>
                  </div>
                </div>
                <p className="bam-confidence-note">
                  Confidence: <strong>{scoring.confidence}</strong> 
                  ({scoring.allFactors.length} of 6 categories scored)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// BAM MAIN VIEW
// =============================================================================

export const BAMView = ({ personaResults, marketData, onSelectPersona }) => {
  const [selectedPersona, setSelectedPersona] = useState(null);

  const topPersonas = personaResults.slice(0, 3);
  const otherPersonas = personaResults.slice(3);

  const handleSelectPersona = (persona) => {
    setSelectedPersona(persona);
    if (onSelectPersona) onSelectPersona(persona);
  };

  if (!personaResults || personaResults.length === 0) {
    return (
      <div className="bam-empty">
        <Users size={48} />
        <h3>Complete Your Design Selections</h3>
        <p>
          Buyer alignment analysis requires data from KYC, FYI, and MVP modules.
          Complete your design selections to see which buyer personas best match your project.
        </p>
      </div>
    );
  }

  return (
    <div className="bam-container">
      {/* Header */}
      <div className="bam-header">
        <div className="bam-header-text">
          <h2>Buyer Alignment Analysis</h2>
          <p>
            Based on your design decisions, here are the buyer personas most likely 
            to be interested in this property.
          </p>
        </div>
        <div className="bam-header-stats">
          <div className="bam-stat">
            <span className="bam-stat-value">{personaResults.length}</span>
            <span className="bam-stat-label">Personas Analyzed</span>
          </div>
          <div className="bam-stat">
            <span className="bam-stat-value">{topPersonas[0]?.scoring.score}%</span>
            <span className="bam-stat-label">Top Match</span>
          </div>
        </div>
      </div>

      {/* Top 3 Matches */}
      <div className="bam-section">
        <h3 className="bam-section-title">Top Matches</h3>
        <div className="bam-top-grid">
          {topPersonas.map((persona, idx) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              scoring={persona.scoring}
              rank={idx + 1}
              isTop={true}
              onClick={() => handleSelectPersona(persona)}
            />
          ))}
        </div>
      </div>

      {/* Other Personas */}
      {otherPersonas.length > 0 && (
        <div className="bam-section">
          <h3 className="bam-section-title">Other Personas</h3>
          <div className="bam-other-grid">
            {otherPersonas.map((persona, idx) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                scoring={persona.scoring}
                rank={idx + 4}
                isTop={false}
                onClick={() => handleSelectPersona(persona)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail Sidebar */}
      {selectedPersona && (
        <PersonaDetailSidebar
          persona={selectedPersona}
          scoring={selectedPersona.scoring}
          marketData={marketData}
          onClose={() => setSelectedPersona(null)}
        />
      )}
    </div>
  );
};

export default BAMView;
