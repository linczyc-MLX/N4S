/**
 * RecommendationsSummary Component
 * 
 * Screen 1: Shows all recommendations at a glance.
 * Client can accept all or review individual decisions.
 */

import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  Settings
} from 'lucide-react';
import type { RecommendedDecision } from '../../server/adjacency-recommender';
import DecisionCard from './DecisionCard';

export interface RecommendationsSummaryProps {
  recommendations: RecommendedDecision[];
  selections: Record<string, string>;  // decisionId -> optionId
  presetName: string;
  totalSF: number;
  onSelectionChange: (decisionId: string, optionId: string) => void;
  onExpandDecision: (decisionId: string) => void;
  onAcceptAll: () => void;
  onReviewAll: () => void;
}

export function RecommendationsSummary({
  recommendations,
  selections,
  presetName,
  totalSF,
  onSelectionChange,
  onExpandDecision,
  onAcceptAll,
  onReviewAll
}: RecommendationsSummaryProps) {
  // Calculate stats
  const totalDecisions = recommendations.length;
  const customSelections = recommendations.filter(
    r => selections[r.decision.id] !== r.recommendedOption.id
  ).length;
  const warningCount = recommendations.reduce((count, r) => {
    const selectedId = selections[r.decision.id];
    const option = r.decision.options.find(o => o.id === selectedId);
    return count + (option?.warnings?.length || 0);
  }, 0);
  const sfImpact = recommendations.reduce((total, r) => {
    const selectedId = selections[r.decision.id];
    const option = r.decision.options.find(o => o.id === selectedId);
    return total + (option?.sfImpact || 0);
  }, 0);
  
  // Group by confidence
  const highConfidence = recommendations.filter(r => r.confidence === 'high');
  const mediumConfidence = recommendations.filter(r => r.confidence === 'medium');
  const lowConfidence = recommendations.filter(r => r.confidence === 'low');
  
  return (
    <div className="recommendations-summary">
      <header className="summary-header">
        <div className="header-icon">
          <Sparkles className="icon" />
        </div>
        <div className="header-content">
          <h2>Your Personalized Layout</h2>
          <p>
            Based on your lifestyle, we recommend these key relationships 
            for your {presetName} home.
          </p>
        </div>
      </header>
      
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-value">{totalDecisions}</span>
          <span className="stat-label">Decisions</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalDecisions - customSelections}</span>
          <span className="stat-label">Recommended</span>
        </div>
        <div className={`stat ${warningCount > 0 ? 'has-warnings' : ''}`}>
          <span className="stat-value">{warningCount}</span>
          <span className="stat-label">Warnings</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {sfImpact > 0 ? `+${sfImpact.toLocaleString()}` : '0'}
          </span>
          <span className="stat-label">SF Impact</span>
        </div>
      </div>
      
      {highConfidence.length > 0 && (
        <section className="confidence-section high">
          <h3 className="section-title">
            <CheckCircle className="section-icon" />
            Strong Recommendations
          </h3>
          <p className="section-description">
            Based on clear signals from your lifestyle profile
          </p>
          <div className="decisions-list">
            {highConfidence.map(rec => (
              <DecisionCard
                key={rec.decision.id}
                decision={rec.decision}
                selectedOptionId={selections[rec.decision.id]}
                recommendedOptionId={rec.recommendedOption.id}
                confidence={rec.confidence}
                reasoning={rec.reasoning}
                onSelect={(optionId) => onSelectionChange(rec.decision.id, optionId)}
                onExpand={() => onExpandDecision(rec.decision.id)}
                compact
              />
            ))}
          </div>
        </section>
      )}
      
      {mediumConfidence.length > 0 && (
        <section className="confidence-section medium">
          <h3 className="section-title">
            <Settings className="section-icon" />
            Suggested Defaults
          </h3>
          <p className="section-description">
            Reasonable defaults you may want to customize
          </p>
          <div className="decisions-list">
            {mediumConfidence.map(rec => (
              <DecisionCard
                key={rec.decision.id}
                decision={rec.decision}
                selectedOptionId={selections[rec.decision.id]}
                recommendedOptionId={rec.recommendedOption.id}
                confidence={rec.confidence}
                reasoning={rec.reasoning}
                onSelect={(optionId) => onSelectionChange(rec.decision.id, optionId)}
                onExpand={() => onExpandDecision(rec.decision.id)}
                compact
              />
            ))}
          </div>
        </section>
      )}
      
      {lowConfidence.length > 0 && (
        <section className="confidence-section low">
          <h3 className="section-title">
            <AlertTriangle className="section-icon" />
            Needs Your Input
          </h3>
          <p className="section-description">
            We need more information to recommend these
          </p>
          <div className="decisions-list">
            {lowConfidence.map(rec => (
              <DecisionCard
                key={rec.decision.id}
                decision={rec.decision}
                selectedOptionId={selections[rec.decision.id]}
                recommendedOptionId={rec.recommendedOption.id}
                confidence={rec.confidence}
                reasoning={rec.reasoning}
                onSelect={(optionId) => onSelectionChange(rec.decision.id, optionId)}
                onExpand={() => onExpandDecision(rec.decision.id)}
                compact
              />
            ))}
          </div>
        </section>
      )}
      
      <div className="summary-actions">
        <button className="btn-secondary" onClick={onReviewAll}>
          Review Each Decision
          <ChevronRight className="btn-icon" />
        </button>
        <button className="btn-primary" onClick={onAcceptAll}>
          <CheckCircle className="btn-icon" />
          Accept All & Continue
        </button>
      </div>
      
      {customSelections > 0 && (
        <div className="custom-notice">
          <AlertTriangle className="notice-icon" />
          <span>
            You've customized {customSelections} decision{customSelections !== 1 ? 's' : ''} 
            from recommendations.
          </span>
        </div>
      )}
    </div>
  );
}

export default RecommendationsSummary;
