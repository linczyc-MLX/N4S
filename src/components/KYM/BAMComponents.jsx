/**
 * BAMComponents.jsx
 *
 * Buyer Alignment Module - v3.0 UI Components
 *
 * Components:
 * - BAMDualScoreCard: Main dual score display with gauges
 * - BAMPortfolioSlider: Forever Home ↔ Spec Build slider
 * - BAMCategoryBreakdown: Client satisfaction breakdown
 * - BAMArchetypeCard: Individual buyer archetype display
 * - BAMArchetypeGrid: Grid of archetypes in market
 * - BAMGapsList: Missing features and recommendations
 * - BAMFeatureQuadrant: Essential/Differentiating/Personal/Risky grid
 * - BAMPathTo80: Recommendations to reach 80%
 *
 * Legacy Components (backward compatible):
 * - PersonaCard, PersonaDetailSidebar, BAMView
 */

import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Film,
  Landmark,
  Globe,
  Trophy,
  Castle,
  HeartPulse,
  Building2,
  Palette,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Home,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

// Icon mapping for archetypes
const ARCHETYPE_ICONS = {
  techExecutive: Cpu,
  entertainment: Film,
  finance: Landmark,
  international: Globe,
  sports: Trophy,
  generational: Castle,
  medical: HeartPulse,
  developer: Building2,
  creative: Palette,
  familyOffice: ShieldCheck,
};

// Alias for backward compatibility
const PERSONA_ICONS = ARCHETYPE_ICONS;

// =============================================================================
// SCORE GAUGE COMPONENT
// =============================================================================

export const ScoreGauge = ({ score, label, status, size = 'medium', showStatus = true }) => {
  const sizes = {
    small: { width: 80, strokeWidth: 6, fontSize: 16, labelSize: 10 },
    medium: { width: 120, strokeWidth: 8, fontSize: 24, labelSize: 12 },
    large: { width: 160, strokeWidth: 10, fontSize: 32, labelSize: 14 },
  };

  const { width, strokeWidth, fontSize, labelSize } = sizes[size] || sizes.medium;
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const statusColors = {
    PASS: '#2e7d32',
    CAUTION: '#f57c00',
    FAIL: '#d32f2f',
  };

  const color = statusColors[status] || '#1e3a5f';

  return (
    <div className="bam-score-gauge" style={{ width, textAlign: 'center' }}>
      <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${width / 2} ${width / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Score text */}
        <text
          x={width / 2}
          y={width / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="600"
          fill="#1a1a1a"
        >
          {score}
        </text>
      </svg>
      {label && (
        <div style={{ fontSize: labelSize, color: '#6b6b6b', marginTop: 4 }}>
          {label}
        </div>
      )}
      {showStatus && status && (
        <div
          className={`bam-status-badge bam-status-${status.toLowerCase()}`}
          style={{
            marginTop: 4,
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            backgroundColor: color,
            color: 'white',
            display: 'inline-block',
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// DUAL SCORE CARD
// =============================================================================

export const BAMDualScoreCard = ({ bamScores, onPortfolioChange }) => {
  if (!bamScores) return null;

  const { clientSatisfaction, marketAppeal, combined, portfolioContext } = bamScores;

  return (
    <div className="bam-dual-score-card">
      <div className="bam-dual-score-header">
        <h3>Buyer Alignment Score</h3>
        <p className="bam-subtitle">
          How well does this design align with client needs and market expectations?
        </p>
      </div>

      <div className="bam-dual-score-gauges">
        <div className="bam-score-column">
          <ScoreGauge
            score={clientSatisfaction.percentage}
            label="Client Satisfaction"
            status={clientSatisfaction.status}
            size="medium"
          />
          <p className="bam-score-description">
            Does the design serve the client's needs?
          </p>
        </div>

        <div className="bam-combined-score">
          <ScoreGauge
            score={combined.score}
            label="Combined Score"
            status={combined.status}
            size="large"
          />
          <div className="bam-combined-breakdown">
            <span>Client: {combined.clientContribution}%</span>
            <span>Market: {combined.marketContribution}%</span>
          </div>
        </div>

        <div className="bam-score-column">
          <ScoreGauge
            score={marketAppeal.percentage}
            label="Market Appeal"
            status={marketAppeal.status}
            size="medium"
          />
          <p className="bam-score-description">
            Will buyers in this market want this home?
          </p>
        </div>
      </div>

      <div className="bam-portfolio-context">
        <BAMPortfolioSlider
          value={portfolioContext}
          onChange={onPortfolioChange}
        />
      </div>
    </div>
  );
};

// =============================================================================
// PORTFOLIO SLIDER
// =============================================================================

export const BAMPortfolioSlider = ({ value, onChange }) => {
  const contexts = [
    { id: 'forever-home', label: 'Forever Home', desc: '15+ years' },
    { id: 'primary-residence', label: 'Primary', desc: '10-15 yrs' },
    { id: 'medium-term', label: 'Medium Term', desc: '5-10 yrs' },
    { id: 'investment', label: 'Investment', desc: '<5 years' },
    { id: 'spec-build', label: 'Spec Build', desc: 'Build to sell' },
  ];

  const currentIndex = contexts.findIndex(c => c.id === value);
  const position = ((currentIndex >= 0 ? currentIndex : 1) / (contexts.length - 1)) * 100;

  return (
    <div className="bam-portfolio-slider">
      <div className="bam-slider-label">Portfolio Context</div>
      <div className="bam-slider-track">
        <div
          className="bam-slider-fill"
          style={{ width: `${position}%` }}
        />
        <div
          className="bam-slider-thumb"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="bam-slider-labels">
        {contexts.map((ctx, idx) => (
          <button
            key={ctx.id}
            className={`bam-slider-option ${value === ctx.id ? 'active' : ''}`}
            onClick={() => onChange && onChange(ctx.id)}
            title={ctx.desc}
          >
            {ctx.label}
          </button>
        ))}
      </div>
      <div className="bam-slider-endpoints">
        <span>Client-Focused</span>
        <span>Market-Focused</span>
      </div>
    </div>
  );
};

// =============================================================================
// CATEGORY BREAKDOWN
// =============================================================================

export const BAMCategoryBreakdown = ({ clientSatisfaction }) => {
  if (!clientSatisfaction) return null;

  const { breakdown, categories, details } = clientSatisfaction;

  const categoryOrder = ['spatial', 'lifestyle', 'design', 'location', 'futureProofing'];

  return (
    <div className="bam-category-breakdown">
      <h4>Client Satisfaction Breakdown</h4>
      <div className="bam-category-list">
        {categoryOrder.map(key => {
          const cat = categories[key];
          if (!cat) return null;
          const score = breakdown[key] || 0;
          const percentage = Math.round((score / cat.max) * 100);
          const categoryDetails = details?.filter(d => d.category === key) || [];

          return (
            <BAMCategoryRow
              key={key}
              label={cat.label}
              score={score}
              max={cat.max}
              percentage={percentage}
              details={categoryDetails}
            />
          );
        })}
      </div>
    </div>
  );
};

const BAMCategoryRow = ({ label, score, max, percentage, details }) => {
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    percentage >= 80 ? '#2e7d32' :
    percentage >= 60 ? '#f57c00' :
    '#d32f2f';

  return (
    <div className="bam-category-row">
      <div
        className="bam-category-header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="bam-category-info">
          <span className="bam-category-label">{label}</span>
          <span className="bam-category-score">{score}/{max}</span>
        </div>
        <div className="bam-category-bar">
          <div
            className="bam-category-fill"
            style={{ width: `${percentage}%`, backgroundColor: statusColor }}
          />
        </div>
        <button className="bam-expand-btn">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && details && details.length > 0 && (
        <div className="bam-category-details">
          {details.map((item, idx) => (
            <div key={idx} className="bam-detail-item">
              <span className={`bam-detail-status bam-detail-${item.status}`}>
                {item.status === 'full' ? <Check size={12} /> :
                 item.status === 'partial' ? <AlertCircle size={12} /> :
                 <X size={12} />}
              </span>
              <span className="bam-detail-label">{item.item}</span>
              <span className="bam-detail-points">{item.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ARCHETYPE CARD (v3.0)
// =============================================================================

export const BAMArchetypeCard = ({ archetype, expanded = false, onToggle }) => {
  const Icon = ARCHETYPE_ICONS[archetype.id] || Users;
  const { score, share } = archetype;

  const statusColor =
    score?.status === 'PASS' ? '#2e7d32' :
    score?.status === 'CAUTION' ? '#f57c00' :
    '#d32f2f';

  return (
    <div className={`bam-archetype-card ${expanded ? 'expanded' : ''}`}>
      <div
        className="bam-archetype-header"
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <div className="bam-archetype-icon">
          <Icon size={24} />
        </div>
        <div className="bam-archetype-info">
          <h5>{archetype.name}</h5>
          <span className="bam-archetype-share">{Math.round((share || 0) * 100)}% of market</span>
        </div>
        <div className="bam-archetype-score" style={{ color: statusColor }}>
          {score?.percentage || 0}%
        </div>
        <button className="bam-expand-btn">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && score && (
        <div className="bam-archetype-details">
          <p className="bam-archetype-desc">{archetype.shortDesc}</p>

          <div className="bam-archetype-scoring">
            <div className="bam-scoring-section">
              <h6>Must Haves ({score.breakdown?.mustHaves?.earned || 0}/{score.breakdown?.mustHaves?.max || 50})</h6>
              <div className="bam-scoring-items">
                {score.breakdown?.mustHaves?.items?.map((item, idx) => (
                  <div key={idx} className={`bam-scoring-item ${item.match}`}>
                    <span className="bam-item-status">
                      {item.match === 'full' ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <span className="bam-item-label">{item.label}</span>
                    <span className="bam-item-points">{item.pointsEarned}/{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bam-scoring-section">
              <h6>Nice to Haves ({score.breakdown?.niceToHaves?.earned || 0}/{score.breakdown?.niceToHaves?.max || 35})</h6>
              <div className="bam-scoring-items">
                {score.breakdown?.niceToHaves?.items?.map((item, idx) => (
                  <div key={idx} className={`bam-scoring-item ${item.match}`}>
                    <span className="bam-item-status">
                      {item.match === 'full' ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <span className="bam-item-label">{item.label}</span>
                    <span className="bam-item-points">{item.pointsEarned}/{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {score.breakdown?.avoids?.items?.some(i => i.triggered) && (
              <div className="bam-scoring-section bam-avoids">
                <h6>Penalties (-{score.breakdown?.avoids?.penalty || 0})</h6>
                <div className="bam-scoring-items">
                  {score.breakdown?.avoids?.items?.filter(i => i.triggered).map((item, idx) => (
                    <div key={idx} className="bam-scoring-item avoid">
                      <span className="bam-item-status"><AlertCircle size={14} /></span>
                      <span className="bam-item-label">{item.label}</span>
                      <span className="bam-item-points">-{item.penalty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ARCHETYPE GRID
// =============================================================================

export const BAMArchetypeGrid = ({ marketAppeal }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!marketAppeal) return null;

  return (
    <div className="bam-archetype-grid">
      <div className="bam-archetype-header-row">
        <h4>Market Buyer Pool: {marketAppeal.market?.name}</h4>
        <div className="bam-market-info">
          <span>{marketAppeal.market?.priceRange}</span>
          <span>{marketAppeal.market?.typicalSize}</span>
        </div>
      </div>

      <div className="bam-archetype-list">
        {marketAppeal.archetypes?.map(arch => (
          <BAMArchetypeCard
            key={arch.id}
            archetype={arch}
            expanded={expandedId === arch.id}
            onToggle={() => setExpandedId(expandedId === arch.id ? null : arch.id)}
          />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// GAPS LIST
// =============================================================================

export const BAMGapsList = ({ gaps, title = 'Alignment Gaps' }) => {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="bam-gaps-empty">
        <Check size={20} />
        <span>No significant gaps identified</span>
      </div>
    );
  }

  return (
    <div className="bam-gaps-list">
      <h4>{title}</h4>
      <div className="bam-gaps-items">
        {gaps.slice(0, 5).map((gap, idx) => (
          <div key={idx} className={`bam-gap-item priority-${gap.priority?.toLowerCase()}`}>
            <div className="bam-gap-header">
              <span className={`bam-gap-category ${gap.category?.toLowerCase().replace(' ', '-')}`}>
                {gap.category}
              </span>
              <span className="bam-gap-item-label">{gap.item}</span>
              {gap.pointsAvailable && (
                <span className="bam-gap-points">+{gap.pointsAvailable} pts</span>
              )}
              {gap.penaltyApplied && (
                <span className="bam-gap-penalty">-{gap.penaltyApplied} penalty</span>
              )}
            </div>
            {gap.suggestion && (
              <p className="bam-gap-suggestion">{gap.suggestion}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// PATH TO 80
// =============================================================================

export const BAMPathTo80 = ({ pathTo80, archetypeName }) => {
  if (!pathTo80) return null;

  if (pathTo80.achieved) {
    return (
      <div className="bam-path-achieved">
        <Check size={24} />
        <div>
          <h5>80% Threshold Achieved</h5>
          <p>This design meets the target score for {archetypeName || 'this archetype'}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bam-path-to-80">
      <div className="bam-path-header">
        <TrendingUp size={20} />
        <h5>Path to 80%</h5>
        <span className="bam-points-needed">{pathTo80.pointsNeeded} points needed</span>
      </div>

      <div className="bam-recommendations">
        {pathTo80.recommendations?.slice(0, 3).map((rec, idx) => (
          <div key={idx} className={`bam-recommendation ${rec.isEasiest ? 'easiest' : ''}`}>
            {rec.isEasiest && <span className="bam-easiest-badge">Easiest Win</span>}
            <div className="bam-rec-content">
              <p>{rec.action}</p>
              <div className="bam-rec-meta">
                <span className="bam-rec-points">+{rec.points} pts</span>
                <span className={`bam-rec-difficulty ${rec.difficulty?.toLowerCase()}`}>
                  {rec.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// FEATURE QUADRANT
// =============================================================================

export const BAMFeatureQuadrant = ({ classification }) => {
  if (!classification) return null;

  const quadrants = [
    { key: 'essential', label: 'Essential', icon: Target, color: '#2e7d32',
      desc: 'Must include - high value across buyer types' },
    { key: 'differentiating', label: 'Differentiating', icon: TrendingUp, color: '#1976d2',
      desc: 'Premium value - appeals to top buyers' },
    { key: 'personal', label: 'Personal', icon: Home, color: '#6b6b6b',
      desc: 'Client preference - limited market impact' },
    { key: 'risky', label: 'Risky', icon: AlertCircle, color: '#d32f2f',
      desc: 'Reconsider - may limit buyer appeal' },
  ];

  return (
    <div className="bam-feature-quadrant">
      <h4>Feature Classification</h4>
      <div className="bam-quadrant-grid">
        {quadrants.map(q => {
          const Icon = q.icon;
          const features = classification[q.key] || [];

          return (
            <div key={q.key} className={`bam-quadrant bam-quadrant-${q.key}`}>
              <div className="bam-quadrant-header" style={{ borderColor: q.color }}>
                <Icon size={16} style={{ color: q.color }} />
                <span>{q.label}</span>
              </div>
              <p className="bam-quadrant-desc">{q.desc}</p>
              <div className="bam-quadrant-features">
                {features.length > 0 ? (
                  features.map((f, idx) => (
                    <div key={idx} className="bam-feature-chip">
                      {f.label}
                    </div>
                  ))
                ) : (
                  <span className="bam-no-features">No features</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN BAM PANEL (v3.0)
// =============================================================================

export const BAMPanel = ({
  bamScores,
  onPortfolioChange,
  showDetails = true,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!bamScores) {
    return (
      <div className="bam-panel bam-panel-empty">
        <Info size={24} />
        <p>Complete KYC, FYI, and MVP modules to see buyer alignment analysis.</p>
      </div>
    );
  }

  return (
    <div className="bam-panel">
      <BAMDualScoreCard
        bamScores={bamScores}
        onPortfolioChange={onPortfolioChange}
      />

      {showDetails && (
        <>
          <div className="bam-panel-tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'archetypes' ? 'active' : ''}
              onClick={() => setActiveTab('archetypes')}
            >
              Buyer Pool
            </button>
            <button
              className={activeTab === 'features' ? 'active' : ''}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
          </div>

          <div className="bam-panel-content">
            {activeTab === 'overview' && (
              <BAMCategoryBreakdown
                clientSatisfaction={bamScores.clientSatisfaction}
              />
            )}

            {activeTab === 'archetypes' && (
              <BAMArchetypeGrid
                marketAppeal={bamScores.marketAppeal}
              />
            )}

            {activeTab === 'features' && (
              <BAMFeatureQuadrant
                classification={bamScores.featureClassification}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// =============================================================================
// LEGACY COMPONENTS (Backward Compatibility)
// =============================================================================

/**
 * PersonaCard - Legacy component for v2.0 compatibility
 */
export const PersonaCard = ({ persona, scoring, rank, isTop, onClick }) => {
  const Icon = PERSONA_ICONS[persona.id] || Users;

  const getMatchColor = (level) => {
    switch (level) {
      case 'Strong': return '#16a34a';
      case 'Moderate': return '#ca8a04';
      default: return '#6b7280';
    }
  };

  const matchColor = getMatchColor(scoring?.matchLevel);
  const topFactors = scoring?.positiveFactors?.slice(0, 3) || [];

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
              width: `${scoring?.score || 0}%`,
              backgroundColor: matchColor,
            }}
          />
        </div>
        <div className="bam-score-details">
          <span className="bam-score-value">{scoring?.score || 0}%</span>
          <span
            className="bam-match-level"
            style={{ color: matchColor }}
          >
            {scoring?.matchLevel || 'Unknown'} Match
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

/**
 * PersonaDetailSidebar - Legacy component for v2.0 compatibility
 */
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

  const matchColor = getMatchColor(scoring?.matchLevel);

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
              {scoring?.score || 0}% - {scoring?.matchLevel || 'Unknown'} Match
            </span>
          </div>
          <button className="bam-sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="bam-sidebar-content">
          <div className="bam-sidebar-section">
            <p className="bam-persona-description">{persona.fullDesc}</p>
          </div>

          <div className="bam-sidebar-section">
            <h4>Typical Demographics</h4>
            <div className="bam-demo-grid">
              <div className="bam-demo-item">
                <span className="bam-demo-label">Age Range</span>
                <span className="bam-demo-value">{persona.demographics?.ageRange}</span>
              </div>
              <div className="bam-demo-item">
                <span className="bam-demo-label">Net Worth</span>
                <span className="bam-demo-value">{persona.demographics?.netWorth}</span>
              </div>
              <div className="bam-demo-item bam-demo-item--full">
                <span className="bam-demo-label">Occupation</span>
                <span className="bam-demo-value">{persona.demographics?.occupation}</span>
              </div>
            </div>
          </div>

          {scoring?.positiveFactors?.length > 0 && (
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

          {scoring?.negativeFactors?.length > 0 && (
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
                  The alignment score evaluates your design against this buyer archetype's
                  Must Haves (50 pts), Nice to Haves (35 pts), and Avoids (penalties).
                </p>
                <div className="bam-confidence-note">
                  Confidence: <strong>{scoring?.confidence || 'Medium'}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * BAMView - Legacy component for v2.0 compatibility
 */
export const BAMView = ({ personaResults, marketData, onSelectPersona }) => {
  const [selectedPersona, setSelectedPersona] = useState(null);

  const topPersonas = personaResults?.slice(0, 3) || [];
  const otherPersonas = personaResults?.slice(3) || [];

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
            <span className="bam-stat-value">{topPersonas[0]?.scoring?.score || 0}%</span>
            <span className="bam-stat-label">Top Match</span>
          </div>
        </div>
      </div>

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

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // v3.0 Components
  ScoreGauge,
  BAMDualScoreCard,
  BAMPortfolioSlider,
  BAMCategoryBreakdown,
  BAMArchetypeCard,
  BAMArchetypeGrid,
  BAMGapsList,
  BAMPathTo80,
  BAMFeatureQuadrant,
  BAMPanel,
  // Legacy Components
  PersonaCard,
  PersonaDetailSidebar,
  BAMView,
};
