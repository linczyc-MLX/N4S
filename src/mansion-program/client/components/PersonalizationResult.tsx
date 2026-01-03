/**
 * PersonalizationResult Component
 * 
 * Screen 3: Shows final validation summary before export.
 * Displays all choices, warnings, and SF impact.
 */

import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Briefcase,
  ChefHat,
  Tv,
  Users,
  BedDouble,
  Wine,
  Dumbbell,
  Home
} from 'lucide-react';
import type { PersonalizationChoice, PersonalizationResult as PersonalizationResultType } from '../../shared/adjacency-decisions';
import type { AdjacencyDecision } from '../../shared/adjacency-decisions';

export interface PersonalizationResultProps {
  result: PersonalizationResultType;
  decisions: AdjacencyDecision[];
  presetName: string;
  baseSF: number;
  onBack: () => void;
  onViewDiagram: () => void;
  onExport: () => void;
  onContinueToBuilder: () => void;
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

export function PersonalizationResult({
  result,
  decisions,
  presetName,
  baseSF,
  onBack,
  onViewDiagram,
  onExport,
  onContinueToBuilder
}: PersonalizationResultProps) {
  const totalSF = baseSF + result.totalSfImpact;
  const hasWarnings = result.warningCount > 0;
  const hasRedFlags = result.redFlagCount > 0;
  const status = hasRedFlags ? 'warning' : hasWarnings ? 'advisory' : 'pass';
  
  // Group choices by type
  const recommendedChoices = result.choices.filter(c => c.isDefault);
  const customChoices = result.choices.filter(c => !c.isDefault);
  const choicesWithWarnings = result.choices.filter(c => c.warnings.length > 0);
  
  return (
    <div className="personalization-result">
      <header className="result-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="btn-icon" />
          Back to Decisions
        </button>
      </header>
      
      <div className="result-content">
        <div className={`status-banner ${status}`}>
          {status === 'pass' && (
            <>
              <CheckCircle className="status-icon" />
              <div className="status-text">
                <h2>Your Layout is Optimized</h2>
                <p>All recommendations accepted with no concerns</p>
              </div>
            </>
          )}
          {status === 'advisory' && (
            <>
              <AlertTriangle className="status-icon" />
              <div className="status-text">
                <h2>Ready with Advisories</h2>
                <p>{result.warningCount} consideration{result.warningCount !== 1 ? 's' : ''} to review</p>
              </div>
            </>
          )}
          {status === 'warning' && (
            <>
              <AlertTriangle className="status-icon" />
              <div className="status-text">
                <h2>Review Recommended</h2>
                <p>{result.redFlagCount} potential issue{result.redFlagCount !== 1 ? 's' : ''} detected</p>
              </div>
            </>
          )}
        </div>
        
        <div className="summary-cards">
          <div className="summary-card">
            <span className="card-label">Total Program</span>
            <span className="card-value">{totalSF.toLocaleString()} SF</span>
            <span className="card-detail">
              {presetName} baseline
              {result.totalSfImpact > 0 && ` + ${result.totalSfImpact} SF`}
            </span>
          </div>
          
          <div className="summary-card">
            <span className="card-label">Decisions Made</span>
            <span className="card-value">{result.choices.length}</span>
            <span className="card-detail">
              {recommendedChoices.length} recommended, {customChoices.length} custom
            </span>
          </div>
          
          <div className={`summary-card ${hasWarnings ? 'has-warnings' : ''}`}>
            <span className="card-label">Considerations</span>
            <span className="card-value">{result.warningCount}</span>
            <span className="card-detail">
              {result.warningCount === 0 ? 'None' : 'Review below'}
            </span>
          </div>
          
          <div className="summary-card">
            <span className="card-label">Bridges Added</span>
            <span className="card-value">{result.requiredBridges.length}</span>
            <span className="card-detail">
              {result.requiredBridges.length === 0 
                ? 'None required' 
                : result.requiredBridges.map(b => 
                    b.replace(/([A-Z])/g, ' $1').trim()
                  ).join(', ')
              }
            </span>
          </div>
        </div>
        
        <section className="choices-section">
          <h3>Your Selections</h3>
          
          <div className="choices-list">
            {result.choices.map(choice => {
              const decision = decisions.find(d => d.id === choice.decisionId);
              if (!decision) return null;
              
              const option = decision.options.find(o => o.id === choice.selectedOptionId);
              if (!option) return null;
              
              const IconComponent = ICON_MAP[decision.icon] || Briefcase;
              
              return (
                <div 
                  key={choice.decisionId} 
                  className={`choice-item ${choice.warnings.length > 0 ? 'has-warnings' : ''}`}
                >
                  <div className="choice-icon">
                    <IconComponent className="icon" />
                  </div>
                  <div className="choice-content">
                    <div className="choice-header">
                      <span className="choice-title">{decision.title}</span>
                      {choice.isDefault ? (
                        <span className="choice-badge recommended">
                          <CheckCircle className="badge-icon" />
                          Recommended
                        </span>
                      ) : (
                        <span className="choice-badge custom">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="choice-selection">{option.label}</span>
                    {choice.warnings.length > 0 && (
                      <div className="choice-warnings">
                        {choice.warnings.map((warning, i) => (
                          <span key={i} className="warning-tag">
                            <AlertTriangle className="warning-icon" />
                            {warning}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {result.requiredBridges.length > 0 && (
          <section className="bridges-section">
            <h3>Required Bridge Spaces</h3>
            <p className="section-description">
              These spaces will be added to support your layout choices:
            </p>
            <div className="bridges-list">
              {result.requiredBridges.map(bridge => (
                <div key={bridge} className="bridge-item">
                  <CheckCircle className="bridge-icon" />
                  <div className="bridge-content">
                    <span className="bridge-name">
                      {bridge.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="bridge-description">
                      {getBridgeDescription(bridge)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {choicesWithWarnings.length > 0 && (
          <section className="warnings-section">
            <h3>
              <AlertTriangle className="section-icon" />
              Considerations Summary
            </h3>
            <p className="section-description">
              These aren't problems — just factors to keep in mind when discussing 
              your home with your architect.
            </p>
            <ul className="warnings-detail-list">
              {choicesWithWarnings.flatMap(choice => {
                const decision = decisions.find(d => d.id === choice.decisionId);
                return choice.warnings.map((warning, i) => (
                  <li key={`${choice.decisionId}-${i}`} className="warning-detail-item">
                    <span className="warning-context">{decision?.title}:</span>
                    <span className="warning-text">{warning}</span>
                  </li>
                ));
              })}
            </ul>
          </section>
        )}
      </div>
      
      <footer className="result-footer">
        <button className="btn-secondary" onClick={onViewDiagram}>
          <Eye className="btn-icon" />
          View Diagram
        </button>
        <button className="btn-secondary" onClick={onExport}>
          <Download className="btn-icon" />
          Export Summary
        </button>
        <button className="btn-primary" onClick={onContinueToBuilder}>
          <FileText className="btn-icon" />
          Continue to Full Brief
        </button>
      </footer>
    </div>
  );
}

function getBridgeDescription(bridge: string): string {
  const descriptions: Record<string, string> = {
    'butlerPantry': 'Service corridor between kitchen and dining for discreet service',
    'soundLock': 'Acoustic vestibule to isolate media room from sleeping areas',
    'guestAutonomy': 'Independent guest suite with kitchenette and separate entry option',
    'wetFeetIntercept': 'Pool-to-house transition zone with drainage and towel storage',
    'opsCore': 'Staff operations hub for deliveries, packages, and housekeeping'
  };
  return descriptions[bridge] || 'Supporting space for your layout';
}

export default PersonalizationResult;
