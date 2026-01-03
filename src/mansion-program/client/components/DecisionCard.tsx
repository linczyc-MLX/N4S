/**
 * DecisionCard Component
 * 
 * Displays a single adjacency decision with selectable options.
 * Shows recommendation badge, warnings, and SF impact.
 */

import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
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

export interface DecisionCardProps {
  decision: AdjacencyDecision;
  selectedOptionId: string;
  recommendedOptionId: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  onSelect: (optionId: string) => void;
  onExpand: () => void;
  compact?: boolean;
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

export function DecisionCard({
  decision,
  selectedOptionId,
  recommendedOptionId,
  confidence,
  reasoning,
  onSelect,
  onExpand,
  compact = false
}: DecisionCardProps) {
  const selectedOption = decision.options.find(o => o.id === selectedOptionId);
  const isRecommended = selectedOptionId === recommendedOptionId;
  const hasWarnings = selectedOption?.warnings && selectedOption.warnings.length > 0;
  
  const IconComponent = ICON_MAP[decision.icon] || Briefcase;
  
  if (compact) {
    return (
      <div 
        className={`decision-card compact ${hasWarnings ? 'has-warnings' : ''}`}
        onClick={onExpand}
      >
        <div className="card-icon">
          <IconComponent className="icon" />
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{decision.title}</h3>
          <p className="card-selection">
            {selectedOption?.label || 'Not selected'}
          </p>
        </div>
        
        <div className="card-status">
          {isRecommended ? (
            <span className="status-badge recommended">
              <CheckCircle className="badge-icon" />
              Recommended
            </span>
          ) : hasWarnings ? (
            <span className="status-badge warning">
              <AlertTriangle className="badge-icon" />
              {selectedOption?.warnings.length} warning{selectedOption?.warnings.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="status-badge custom">
              Custom
            </span>
          )}
          <ChevronRight className="chevron" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`decision-card expanded ${hasWarnings ? 'has-warnings' : ''}`}>
      <div className="card-header">
        <div className="header-icon">
          <IconComponent className="icon" />
        </div>
        <div className="header-content">
          <h3 className="card-title">{decision.title}</h3>
          <p className="card-question">{decision.question}</p>
        </div>
        {confidence && (
          <div className={`confidence-badge ${confidence}`}>
            {confidence} confidence
          </div>
        )}
      </div>
      
      <p className="card-context">{decision.context}</p>
      
      {reasoning && (
        <div className="recommendation-reasoning">
          <strong>Why we recommend:</strong> {reasoning}
        </div>
      )}
      
      <div className="options-list">
        {decision.options.map(option => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={option.id === selectedOptionId}
            isRecommended={option.id === recommendedOptionId}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
      
      {hasWarnings && selectedOption && (
        <div className="warnings-panel">
          <h4>
            <AlertTriangle className="warning-icon" />
            Considerations
          </h4>
          <ul>
            {selectedOption.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface OptionItemProps {
  option: DecisionOption;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

function OptionItem({ option, isSelected, isRecommended, onSelect }: OptionItemProps) {
  return (
    <div 
      className={`option-item ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
      onClick={onSelect}
    >
      <div className="option-radio">
        <div className={`radio-circle ${isSelected ? 'checked' : ''}`}>
          {isSelected && <div className="radio-dot" />}
        </div>
      </div>
      
      <div className="option-content">
        <div className="option-header">
          <span className="option-label">{option.label}</span>
          {isRecommended && (
            <span className="recommended-tag">Recommended</span>
          )}
          {option.sfImpact && option.sfImpact > 0 && (
            <span className="sf-impact">+{option.sfImpact} SF</span>
          )}
        </div>
        <p className="option-description">{option.description}</p>
        {option.warnings.length > 0 && !isSelected && (
          <span className="option-warning-hint">
            <AlertTriangle className="hint-icon" />
            {option.warnings.length} consideration{option.warnings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default DecisionCard;
