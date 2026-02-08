/**
 * PersonalizationResult Component (Phase 5D Update)
 * 
 * Screen 3: Shows final validation summary with v2 RelationshipDiagram
 * and PDF export capability.
 */

import React, { useState, useMemo } from 'react';
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
  Home,
  GitBranch,
  LayoutGrid
} from 'lucide-react';
import type { PersonalizationResult as PersonalizationResultType } from '../../shared/adjacency-decisions';
import type { AdjacencyDecision } from '../../shared/adjacency-decisions';
import { applyDecisionsToMatrix } from '../../server/adjacency-recommender';
import RelationshipDiagram from '../../../components/MVP/RelationshipDiagram';

export interface PersonalizationResultProps {
  result: PersonalizationResultType;
  decisions: AdjacencyDecision[];
  presetName: string;
  baseSF: number;
  presetSpaces?: any[];
  baseMatrix?: any[];
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
  presetSpaces,
  baseMatrix,
  onBack,
  onViewDiagram,
  onExport,
  onContinueToBuilder
}: PersonalizationResultProps) {
  const totalSF = baseSF + result.totalSfImpact;
  const hasWarnings = result.warningCount > 0;
  const hasRedFlags = result.redFlagCount > 0;
  const status = hasRedFlags ? 'warning' : hasWarnings ? 'advisory' : 'pass';
  
  // v2 Diagram state
  const [displayMode, setDisplayMode] = useState<'diagram' | 'matrix'>('diagram');
  const [view, setView] = useState<'desired' | 'proposed'>('desired');
  
  // Group choices
  const recommendedChoices = result.choices.filter(c => c.isDefault);
  const customChoices = result.choices.filter(c => !c.isDefault);
  const choicesWithWarnings = result.choices.filter(c => c.warnings.length > 0);

  // Compute benchmark matrix as lookup
  const benchmarkMatrix = useMemo(() => {
    if (!baseMatrix) return {};
    const m: Record<string, string> = {};
    baseMatrix.forEach((req: any) => {
      m[`${req.fromSpaceCode}-${req.toSpaceCode}`] = req.relationship;
      m[`${req.toSpaceCode}-${req.fromSpaceCode}`] = req.relationship;
    });
    return m;
  }, [baseMatrix]);

  // Compute proposed matrix from choices
  const proposedMatrix = useMemo(() => {
    if (!baseMatrix) return {};
    const updatedMatrix = applyDecisionsToMatrix(baseMatrix, result.choices);
    const m: Record<string, string> = {};
    updatedMatrix.forEach((req: any) => {
      m[`${req.fromSpaceCode}-${req.toSpaceCode}`] = req.relationship;
      m[`${req.toSpaceCode}-${req.fromSpaceCode}`] = req.relationship;
    });
    return m;
  }, [baseMatrix, result.choices]);

  // Compute deviations
  const deviations = useMemo(() => {
    if (!baseMatrix) return [];
    const devs: any[] = [];
    Object.keys(proposedMatrix).forEach(key => {
      if (proposedMatrix[key] !== benchmarkMatrix[key] && benchmarkMatrix[key]) {
        const [from, to] = key.split('-');
        // Avoid duplicates (A-B and B-A)
        if (from < to) {
          devs.push({
            fromSpace: from,
            toSpace: to,
            desired: benchmarkMatrix[key],
            proposed: proposedMatrix[key]
          });
        }
      }
    });
    return devs;
  }, [baseMatrix, benchmarkMatrix, proposedMatrix]);
  
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
        mermaidCode: null
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
        
        {/* v2 Relationship Diagram + Matrix with Toggle */}
        {presetSpaces && presetSpaces.length > 0 && (
          <section className="diagram-section">
            <div className="section-header">
              <h3>
                <Eye className="section-icon" />
                Adjacency Visualization
              </h3>
              <div className="diagram-controls">
                {/* Display Mode Toggle */}
                <div className="acg-toggle" style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e5e0' }}>
                  <button
                    className="control-btn"
                    onClick={() => setDisplayMode('diagram')}
                    style={{ 
                      backgroundColor: displayMode === 'diagram' ? '#1e3a5f' : '#fff',
                      color: displayMode === 'diagram' ? '#fff' : '#1a1a1a',
                      border: 'none', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <GitBranch size={14} /> Diagram
                  </button>
                  <button
                    className="control-btn"
                    onClick={() => setDisplayMode('matrix')}
                    style={{ 
                      backgroundColor: displayMode === 'matrix' ? '#1e3a5f' : '#fff',
                      color: displayMode === 'matrix' ? '#fff' : '#1a1a1a',
                      border: 'none', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <LayoutGrid size={14} /> Matrix
                  </button>
                </div>
                {/* Desired/Proposed Toggle */}
                <div className="acg-toggle" style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e5e0', marginLeft: '8px' }}>
                  <button
                    className="control-btn"
                    onClick={() => setView('desired')}
                    style={{ 
                      backgroundColor: view === 'desired' ? '#1e3a5f' : '#fff',
                      color: view === 'desired' ? '#fff' : '#1a1a1a',
                      border: 'none', padding: '4px 10px', fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    Desired
                  </button>
                  <button
                    className="control-btn"
                    onClick={() => setView('proposed')}
                    style={{ 
                      backgroundColor: view === 'proposed' ? '#1e3a5f' : '#fff',
                      color: view === 'proposed' ? '#fff' : '#1a1a1a',
                      border: 'none', padding: '4px 10px', fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    Achieved
                  </button>
                </div>
              </div>
            </div>

            {/* Diagram View */}
            {displayMode === 'diagram' && (
              <RelationshipDiagram
                spaces={presetSpaces}
                benchmarkMatrix={benchmarkMatrix}
                proposedMatrix={proposedMatrix}
                deviations={deviations}
                view={view}
              />
            )}

            {/* Matrix View */}
            {displayMode === 'matrix' && (() => {
              const currentMatrix = view === 'desired' ? benchmarkMatrix : proposedMatrix;
              const spaceCodes = presetSpaces.map((s: any) => s.code);
              const REL_COLORS: Record<string, string> = {
                A: '#4caf50', N: '#2196f3', B: '#ff9800', S: '#f44336'
              };
              return (
                <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '11px', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '4px 6px', fontSize: '10px', color: '#6b6b6b' }}></th>
                        {spaceCodes.map((code: string) => (
                          <th key={code} style={{ padding: '4px 2px', fontSize: '9px', color: '#1e3a5f', fontWeight: 600, textAlign: 'center', writingMode: 'vertical-lr', height: '60px' }}>{code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spaceCodes.map((fromCode: string) => (
                        <tr key={fromCode}>
                          <th style={{ padding: '4px 6px', fontSize: '10px', color: '#1e3a5f', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{fromCode}</th>
                          {spaceCodes.map((toCode: string) => {
                            if (fromCode === toCode) {
                              return <td key={`${fromCode}-${toCode}`} style={{ padding: '2px', textAlign: 'center', background: '#f5f5f5', color: '#ccc', fontSize: '10px' }}>-</td>;
                            }
                            const rel = currentMatrix[`${fromCode}-${toCode}`];
                            const isDev = view === 'proposed' && deviations.some((d: any) => 
                              (d.fromSpace === fromCode && d.toSpace === toCode) || (d.fromSpace === toCode && d.toSpace === fromCode)
                            );
                            return (
                              <td key={`${fromCode}-${toCode}`} style={{
                                padding: '2px', textAlign: 'center', fontSize: '10px', fontWeight: 600,
                                backgroundColor: rel ? REL_COLORS[rel] : 'transparent',
                                color: rel ? '#fff' : '#ddd',
                                border: isDev ? '2px solid #f57c00' : '1px solid #eee',
                              }}>
                                {rel || '\u00b7'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: '#6b6b6b' }}>
                    {Object.entries(REL_COLORS).map(([key, color]) => (
                      <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: color, display: 'inline-block' }}></span>
                        {key === 'A' ? 'Adjacent' : key === 'N' ? 'Near' : key === 'B' ? 'Buffered' : 'Separate'}
                      </span>
                    ))}
                  </div>

                  {/* Deviations */}
                  {view === 'proposed' && deviations.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#fff8e1', borderRadius: '6px', border: '1px solid #ffe082' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', color: '#f57c00', marginBottom: '6px' }}>
                        <AlertTriangle size={16} />
                        {deviations.length} Deviation{deviations.length !== 1 ? 's' : ''} from N4S Standard
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#6b6b6b' }}>
                        {deviations.slice(0, 5).map((dev: any, idx: number) => (
                          <li key={idx}>
                            <strong>{dev.fromSpace} → {dev.toSpace}:</strong> Desired {dev.desired}, Proposed {dev.proposed}
                          </li>
                        ))}
                        {deviations.length > 5 && <li>...and {deviations.length - 5} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
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
