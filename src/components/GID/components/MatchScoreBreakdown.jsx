/**
 * MatchScoreBreakdown.jsx — GID Match Score Visualization
 *
 * Two display modes:
 *  - inline: Compact score badges for ConsultantCard in match results
 *  - expanded: Full bar chart breakdown in detail/comparison view
 *
 * Mirrors BAM v3.0 dual score pattern (Client Satisfaction + Market Appeal)
 * mapped to GID's Client Fit + Project Fit.
 */

import React from 'react';
import {
  MapPin, DollarSign, Palette, Award, Star, Layers,
  User, Briefcase, ChevronDown, ChevronUp,
} from 'lucide-react';

// Icon mapping for dimensions
const DIMENSION_ICONS = {
  geographic: MapPin,
  budget: DollarSign,
  style: Palette,
  experience: Award,
  quality: Star,
  features: Layers,
};

// =============================================================================
// SCORE GAUGE (circular, mirrors BAMComponents.jsx ScoreGauge)
// =============================================================================

const ScoreGauge = ({ score, label, size = 'medium' }) => {
  const sizes = {
    small:  { width: 56,  strokeWidth: 5, fontSize: 14, labelSize: 9 },
    medium: { width: 80,  strokeWidth: 6, fontSize: 18, labelSize: 10 },
    large:  { width: 110, strokeWidth: 7, fontSize: 24, labelSize: 11 },
  };

  const { width, strokeWidth, fontSize, labelSize } = sizes[size] || sizes.medium;
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(score, 100) / 100) * circumference;

  // Color based on score
  let color;
  if (score >= 80) color = '#c9a227'; // Gold — Top Match
  else if (score >= 60) color = '#1e3a5f'; // Navy — Good Fit
  else if (score >= 40) color = '#6b6b6b'; // Muted — Consider
  else color = '#d32f2f'; // Red — Below

  return (
    <div className="gid-score-gauge" style={{ width, textAlign: 'center' }}>
      <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
        <circle
          cx={width / 2} cy={width / 2} r={radius}
          fill="none" stroke="#e5e5e0" strokeWidth={strokeWidth}
        />
        <circle
          cx={width / 2} cy={width / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${width / 2} ${width / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x={width / 2} y={width / 2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={fontSize} fontWeight="600" fill="#1a1a1a"
        >
          {score}
        </text>
      </svg>
      {label && (
        <div style={{ fontSize: labelSize, color: '#6b6b6b', marginTop: 2, lineHeight: 1.2 }}>
          {label}
        </div>
      )}
    </div>
  );
};


// =============================================================================
// INLINE MODE — Compact dual score for match result cards
// =============================================================================

export const MatchScoreInline = ({ matchResult }) => {
  if (!matchResult) return null;

  const { clientFitScore, projectFitScore, combinedScore, tier, tierColor, tierBgColor } = matchResult;

  return (
    <div className="gid-match-score-inline">
      <div className="gid-match-score-inline__gauges">
        <ScoreGauge score={clientFitScore} label="Client Fit" size="small" />
        <ScoreGauge score={projectFitScore} label="Project Fit" size="small" />
      </div>
      <div className="gid-match-score-inline__combined">
        <span className="gid-match-score-inline__value">{combinedScore}</span>
        <span
          className="gid-match-tier-badge"
          style={{ backgroundColor: tierBgColor, color: tierColor }}
        >
          {tier}
        </span>
      </div>
    </div>
  );
};


// =============================================================================
// EXPANDED MODE — Full breakdown with dimension bars
// =============================================================================

export const MatchScoreExpanded = ({ matchResult, showWeights = false }) => {
  if (!matchResult) return null;

  const { clientFitScore, projectFitScore, combinedScore, tier, tierColor, tierBgColor, breakdown } = matchResult;

  return (
    <div className="gid-match-score-expanded">
      {/* Dual gauges header */}
      <div className="gid-match-score-expanded__header">
        <ScoreGauge score={clientFitScore} label="Client Fit" size="medium" />
        <div className="gid-match-score-expanded__combined">
          <ScoreGauge score={combinedScore} label="Combined" size="large" />
          <span
            className="gid-match-tier-badge gid-match-tier-badge--lg"
            style={{ backgroundColor: tierBgColor, color: tierColor }}
          >
            {tier}
          </span>
        </div>
        <ScoreGauge score={projectFitScore} label="Project Fit" size="medium" />
      </div>

      {/* Dimension bars */}
      <div className="gid-match-score-expanded__dimensions">
        {(breakdown || []).map((dim) => {
          const Icon = DIMENSION_ICONS[dim.dimension] || Layers;
          const barColor = dim.normalized >= 80 ? '#c9a227'
            : dim.normalized >= 60 ? '#1e3a5f'
            : dim.normalized >= 40 ? '#8CA8BE'
            : '#d32f2f';

          return (
            <div key={dim.dimension} className="gid-dimension-row">
              <div className="gid-dimension-row__label">
                <Icon size={14} />
                <span>{dim.label}</span>
              </div>
              <div className="gid-dimension-row__bar-container">
                <div
                  className="gid-dimension-row__bar"
                  style={{ width: `${dim.normalized}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="gid-dimension-row__score">
                <span className="gid-dimension-row__value">{dim.raw}</span>
                <span className="gid-dimension-row__max">/{dim.maxRaw}</span>
              </div>
              {showWeights && (
                <div className="gid-dimension-row__weights">
                  <span title="Client weight">C: ×{dim.clientWeight}</span>
                  <span title="Project weight">P: ×{dim.projectWeight}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// =============================================================================
// COMPARISON TABLE — Side-by-side for 2-3 consultants
// =============================================================================

export const MatchComparisonTable = ({ matchResults, consultants }) => {
  if (!matchResults || matchResults.length < 2) return null;

  // Build a lookup for consultant details
  const consultantMap = {};
  (consultants || []).forEach(c => { consultantMap[c.id] = c; });

  const dimensionKeys = matchResults[0]?.breakdown?.map(b => b.dimension) || [];

  return (
    <div className="gid-match-comparison">
      <table className="gid-match-comparison__table">
        <thead>
          <tr>
            <th className="gid-match-comparison__dimension-header">Dimension</th>
            {matchResults.map(result => {
              const c = consultantMap[result.consultantId];
              return (
                <th key={result.consultantId} className="gid-match-comparison__consultant-header">
                  <div className="gid-match-comparison__firm">{c?.firm_name || result.consultantName}</div>
                  <span
                    className="gid-match-tier-badge"
                    style={{ backgroundColor: result.tierBgColor, color: result.tierColor }}
                  >
                    {result.tier}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Overall scores row */}
          <tr className="gid-match-comparison__totals-row">
            <td>Combined Score</td>
            {matchResults.map(r => (
              <td key={r.consultantId} className="gid-match-comparison__score-cell">
                <strong>{r.combinedScore}</strong>
              </td>
            ))}
          </tr>
          <tr>
            <td>Client Fit</td>
            {matchResults.map(r => (
              <td key={r.consultantId} className="gid-match-comparison__score-cell">{r.clientFitScore}</td>
            ))}
          </tr>
          <tr>
            <td>Project Fit</td>
            {matchResults.map(r => (
              <td key={r.consultantId} className="gid-match-comparison__score-cell">{r.projectFitScore}</td>
            ))}
          </tr>

          {/* Dimension rows */}
          {dimensionKeys.map(dimKey => {
            const dimLabel = matchResults[0].breakdown.find(b => b.dimension === dimKey)?.label || dimKey;
            const Icon = DIMENSION_ICONS[dimKey] || Layers;

            return (
              <tr key={dimKey}>
                <td className="gid-match-comparison__dim-label">
                  <Icon size={12} />
                  {dimLabel}
                </td>
                {matchResults.map(r => {
                  const dim = r.breakdown.find(b => b.dimension === dimKey);
                  const normalized = dim?.normalized || 0;
                  const barColor = normalized >= 80 ? '#c9a227'
                    : normalized >= 60 ? '#1e3a5f'
                    : normalized >= 40 ? '#8CA8BE'
                    : '#d32f2f';

                  return (
                    <td key={r.consultantId} className="gid-match-comparison__bar-cell">
                      <div className="gid-comparison-bar-container">
                        <div
                          className="gid-comparison-bar"
                          style={{ width: `${normalized}%`, backgroundColor: barColor }}
                        />
                      </div>
                      <span className="gid-comparison-bar-label">{dim?.raw}/{dim?.maxRaw}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


// =============================================================================
// DEFAULT EXPORT
// =============================================================================

const MatchScoreBreakdown = {
  Inline: MatchScoreInline,
  Expanded: MatchScoreExpanded,
  Comparison: MatchComparisonTable,
  Gauge: ScoreGauge,
};

export default MatchScoreBreakdown;
