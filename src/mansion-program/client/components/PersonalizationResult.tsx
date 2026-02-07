/**
 * PersonalizationResult Component (Phase 5D Update)
 * 
 * Screen 3: Shows final validation summary with Mermaid diagram preview
 * and PDF export capability.
 * 
 * REPLACES: src/mansion-program/client/components/PersonalizationResult.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  FileText,
  Download,
  Eye,
  EyeOff,
  Briefcase,
  ChefHat,
  Tv,
  Users,
  BedDouble,
  Wine,
  Dumbbell,
  Home,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { PersonalizationResult as PersonalizationResultType } from '../../shared/adjacency-decisions';
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
  
  // Diagram state
  const [showDiagram, setShowDiagram] = useState(true);
  const [diagramExpanded, setDiagramExpanded] = useState(false);
  const [diagramReady, setDiagramReady] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  
  // Group choices
  const recommendedChoices = result.choices.filter(c => c.isDefault);
  const customChoices = result.choices.filter(c => !c.isDefault);
  const choicesWithWarnings = result.choices.filter(c => c.warnings.length > 0);
  
  // Generate Mermaid diagram
  const mermaidCode = React.useMemo(() => {
    try {
      // Build simple flowchart from choices
      const lines = ['flowchart LR'];
      const addedNodes = new Set<string>();

      result.choices.forEach(choice => {
        const decision = decisions.find(d => d.id === choice.decisionId);
        const option = decision?.options.find(o => o.id === choice.selectedOptionId);
        if (!decision || !option) return;

        const from = decision.primarySpace;
        const to = option.targetSpace;

        // Add node definitions
        if (!addedNodes.has(from)) {
          lines.push(`  ${from}[${from}]`);
          addedNodes.add(from);
        }
        if (!addedNodes.has(to)) {
          lines.push(`  ${to}[${to}]`);
          addedNodes.add(to);
        }

        // Add edge based on relationship
        const rel = option.relationship;
        if (rel === 'A') {
          lines.push(`  ${from} === ${to}`);
        } else if (rel === 'B') {
          lines.push(`  ${from} --- ${to}`);
        } else if (rel === 'S') {
          lines.push(`  ${from} -.- ${to}`);
        }
      });

      return lines.join('\n');
    } catch (e) {
      console.error('Failed to generate diagram:', e);
      return null;
    }
  }, [result.choices, decisions]);
  
  // Render Mermaid diagram
  useEffect(() => {
    if (!mermaidCode || !diagramRef.current || !showDiagram) return;
    
    const renderDiagram = async () => {
      try {
        // Check if mermaid is available
        const mermaid = (window as any).mermaid;
        if (!mermaid) {
          console.warn('Mermaid not loaded');
          return;
        }
        
        // Clear previous
        diagramRef.current!.innerHTML = '';
        
        // Create container
        const container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = mermaidCode;
        diagramRef.current!.appendChild(container);
        
        // Render
        await mermaid.init(undefined, container);
        setDiagramReady(true);
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
    };
    
    renderDiagram();
  }, [mermaidCode, showDiagram]);
  
  // PDF Export
  const handleExportPDF = async () => {
    try {
      const { generatePersonalizationPDF } = await import('../utils/pdf-export');
      await generatePersonalizationPDF({
        result,
        decisions,
        presetName,
        baseSF,
        totalSF,
        mermaidCode
      });
    } catch (e) {
      console.error('PDF export failed:', e);
      // Fallback to JSON export
      handleExportJSON();
    }
  };
  
  // JSON Export (fallback)
  const handleExportJSON = () => {
    const summary = {
      exportDate: new Date().toISOString(),
      preset: presetName,
      baseSF,
      totalSF,
      sfImpact: result.totalSfImpact,
      decisions: result.choices.map(choice => {
        const decision = decisions.find(d => d.id === choice.decisionId);
        const option = decision?.options.find(o => o.id === choice.selectedOptionId);
        return {
          decision: decision?.title,
          selection: option?.label,
          relationship: option?.relationship,
          targetSpace: option?.targetSpace,
          isRecommended: choice.isDefault,
          warnings: choice.warnings,
          sfImpact: option?.sfImpact || 0
        };
      }),
      bridges: result.requiredBridges,
      totalWarnings: result.warningCount,
      status
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adjacency-personalization-${presetName.replace(/[^a-z0-9]/gi, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
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
        
        {/* Mermaid Diagram Section */}
        {mermaidCode && (
          <section className="diagram-section">
            <div className="section-header">
              <h3>
                <Eye className="section-icon" />
                Relationship Diagram
              </h3>
              <div className="diagram-controls">
                <button 
                  className="control-btn"
                  onClick={() => setShowDiagram(!showDiagram)}
                >
                  {showDiagram ? <EyeOff className="btn-icon" /> : <Eye className="btn-icon" />}
                  {showDiagram ? 'Hide' : 'Show'}
                </button>
                {showDiagram && (
                  <button 
                    className="control-btn"
                    onClick={() => setDiagramExpanded(!diagramExpanded)}
                  >
                    {diagramExpanded ? <Minimize2 className="btn-icon" /> : <Maximize2 className="btn-icon" />}
                    {diagramExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
              </div>
            </div>
            
            {showDiagram && (
              <div className={`diagram-container ${diagramExpanded ? 'expanded' : ''}`}>
                <div ref={diagramRef} className="mermaid-diagram" />
                {!diagramReady && (
                  <div className="diagram-loading">
                    Loading diagram...
                  </div>
                )}
              </div>
            )}

            {/* Abbreviation Index */}
            {showDiagram && diagramReady && (
              <div className="diagram-legend">
                <p className="diagram-legend__title">Abbreviation Index</p>
                <div className="diagram-legend__grid">
                  {(() => {
                    // Build unique abbreviation map from the diagram nodes
                    const ABBREV_MAP: Record<string, string> = {
                      OFF: 'Home Office', FOY: 'Foyer / Gallery', KIT: 'Kitchen',
                      FR: 'Family Room', DR: 'Dining Room', GR: 'Great Room',
                      MEDIA: 'Media Room', PRI: 'Primary Bedroom', GSL1: 'Guest Suite L1',
                      GYM: 'Gym / Exercise', MUD: 'Mudroom', WINE: 'Wine Storage',
                      SEC1: 'Secondary Bed 1', SEC2: 'Secondary Bed 2',
                      OPSCORE: 'Operations Core', SCUL: 'Scullery',
                      POOL: 'Pool', SPA: 'Spa', BAR: 'Bar',
                      LIB: 'Library', TERR: 'Terrace', GAR: 'Garage',
                      STAIR: 'Staircase', PRIHALL: 'Primary Hall',
                      PRIBATH: 'Primary Bath', PRICL: 'Primary Closets',
                      PRILNG: 'Primary Lounge'
                    };
                    // Only show abbreviations that appear in the current diagram
                    const usedCodes = new Set<string>();
                    result.choices.forEach(choice => {
                      const decision = decisions.find(d => d.id === choice.decisionId);
                      const option = decision?.options.find(o => o.id === choice.selectedOptionId);
                      if (decision) usedCodes.add(decision.primarySpace);
                      if (option) usedCodes.add(option.targetSpace);
                    });
                    return Array.from(usedCodes)
                      .filter(code => ABBREV_MAP[code])
                      .sort()
                      .map(code => (
                        <span key={code} className="diagram-legend__item">
                          <strong>{code}</strong> {ABBREV_MAP[code]}
                        </span>
                      ));
                  })()}
                </div>
              </div>
            )}
          </section>
        )}
        
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
                    <span className="choice-relationship">
                      {decision.primarySpace} → {option.targetSpace} ({option.relationship})
                    </span>
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
          Full Diagram View
        </button>
        <button className="btn-secondary" onClick={handleExportPDF}>
          <Download className="btn-icon" />
          Export PDF
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
