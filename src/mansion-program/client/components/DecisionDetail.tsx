/**
 * DecisionDetail Component
 * 
 * Screen 2: Expanded view of a single decision with full context.
 * Allows detailed exploration of options and warnings.
 */

import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle, 
  AlertTriangle,
  Info,
  Briefcase,
  ChefHat,
  Tv,
  Users,
  BedDouble,
  Wine,
  Dumbbell,
  Home
} from 'lucide-react';
import type { AdjacencyDecision, DecisionOption } from '../../shared/adjacency-decisions';

export interface DecisionDetailProps {
  decision: AdjacencyDecision;
  selectedOptionId: string;
  recommendedOptionId: string;
  reasoning: string;
  currentIndex: number;
  totalCount: number;
  onSelect: (optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Briefcase': Briefcase,
  'ChefHat': ChefHat,
  'Tv': Tv,
  'Users': Users,
  'BedDouble': BedDouble,
  'Wine': Wine,
  'Dumbbell': Dumbbell,
  'Home': Home
};

export function DecisionDetail({
  decision,
  selectedOptionId,
  recommendedOptionId,
  reasoning,
  currentIndex,
  totalCount,
  onSelect,
  onPrevious,
  onNext,
  onBack
}: DecisionDetailProps) {
  const selectedOption = decision.options.find(o => o.id === selectedOptionId);
  const IconComponent = ICON_MAP[decision.icon] || Briefcase;
  
  return (
    <div className="decision-detail">
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="btn-icon" />
          All Decisions
        </button>
        <div className="progress-indicator">
          {currentIndex + 1} of {totalCount}
        </div>
      </header>
      
      <div className="detail-content">
        <div className="decision-header">
          <div className="header-icon large">
            <IconComponent className="icon" />
          </div>
          <div className="header-text">
            <h2>{decision.title}</h2>
            <p className="question">{decision.question}</p>
          </div>
        </div>
        
        <div className="context-panel">
          <Info className="context-icon" />
          <p>{decision.context}</p>
        </div>
        
        {reasoning && (
          <div className="recommendation-panel">
            <div className="panel-header">
              <CheckCircle className="panel-icon" />
              <strong>Our Recommendation</strong>
            </div>
            <p>{reasoning}</p>
          </div>
        )}
        
        <div className="options-section">
          <h3>Choose Your Preference</h3>
          
          <div className="options-grid">
            {decision.options.map(option => (
              <DetailOptionCard
                key={option.id}
                option={option}
                isSelected={option.id === selectedOptionId}
                isRecommended={option.id === recommendedOptionId}
                onSelect={() => onSelect(option.id)}
              />
            ))}
          </div>
        </div>
        
        {selectedOption && selectedOption.warnings.length > 0 && (
          <div className="warnings-section">
            <h3>
              <AlertTriangle className="section-icon warning" />
              Things to Consider
            </h3>
            <ul className="warnings-list">
              {selectedOption.warnings.map((warning, i) => (
                <li key={i} className="warning-item">
                  <AlertTriangle className="warning-icon" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
            <p className="warning-note">
              These aren't dealbreakers — just factors to keep in mind as you 
              plan your home. You can proceed with this choice if it fits your priorities.
            </p>
          </div>
        )}
        
        {selectedOption?.bridgeRequired && (
          <div className="bridge-notice">
            <Info className="notice-icon" />
            <div className="notice-content">
              <strong>This choice adds a bridge space</strong>
              <p>
                A {selectedOption.bridgeRequired.replace(/([A-Z])/g, ' $1').trim()} 
                will be added to support this layout choice.
                {selectedOption.sfImpact && ` (+${selectedOption.sfImpact} SF)`}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <footer className="detail-footer">
        <button 
          className="nav-btn prev"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="btn-icon" />
          Previous
        </button>
        
        <div className="selection-summary">
          <span className="summary-label">Selected:</span>
          <span className="summary-value">{selectedOption?.label}</span>
          {selectedOption?.id === recommendedOptionId && (
            <span className="recommended-badge">
              <CheckCircle className="badge-icon" />
              Recommended
            </span>
          )}
        </div>
        
        <button 
          className="nav-btn next"
          onClick={onNext}
          disabled={currentIndex === totalCount - 1}
        >
          Next
          <ArrowRight className="btn-icon" />
        </button>
      </footer>
    </div>
  );
}

interface DetailOptionCardProps {
  option: DecisionOption;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

function DetailOptionCard({ 
  option, 
  isSelected, 
  isRecommended, 
  onSelect 
}: DetailOptionCardProps) {
  return (
    <div 
      className={`detail-option-card ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
      onClick={onSelect}
    >
      <div className="option-header">
        <div className="option-radio">
          <div className={`radio-circle ${isSelected ? 'checked' : ''}`}>
            {isSelected && <div className="radio-dot" />}
          </div>
        </div>
        <h4 className="option-title">{option.label}</h4>
        {isRecommended && (
          <span className="recommended-tag">
            <CheckCircle className="tag-icon" />
            Recommended
          </span>
        )}
      </div>
      
      <p className="option-description">{option.description}</p>
      
      <div className="option-meta">
        {option.sfImpact && option.sfImpact > 0 && (
          <span className="meta-item sf">
            +{option.sfImpact} SF
          </span>
        )}
        {option.bridgeRequired && (
          <span className="meta-item bridge">
            Adds {option.bridgeRequired.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        )}
        {option.warnings.length > 0 && (
          <span className="meta-item warnings">
            <AlertTriangle className="meta-icon" />
            {option.warnings.length} consideration{option.warnings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="option-relationship">
        <span className="relationship-label">Creates:</span>
        <span className="relationship-value">
          {option.relationship === 'A' && 'Adjacent connection'}
          {option.relationship === 'N' && 'Near placement'}
          {option.relationship === 'B' && 'Buffered separation'}
          {option.relationship === 'S' && 'Full separation'}
        </span>
      </div>
    </div>
  );
}

export default DecisionDetail;
