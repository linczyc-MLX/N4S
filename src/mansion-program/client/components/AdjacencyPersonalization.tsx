/**
 * AdjacencyPersonalization Component
 * 
 * Main container for the adjacency personalization workflow.
 * Manages state and navigation between the three screens.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { KYCResponse } from '../../shared/kyc-schema';
import type { AdjacencyRequirement, BridgeConfig } from '../../shared/schema';
import type { PersonalizationChoice } from '../../shared/adjacency-decisions';
import {
  ADJACENCY_DECISIONS
} from '../../shared/adjacency-decisions';
import {
  recommendAdjacencies,
  evaluatePersonalization,
  applyDecisionsToMatrix,
  deriveBridgeConfigFromChoices
} from '../../server/adjacency-recommender';
import RecommendationsSummary from './RecommendationsSummary';
import DecisionDetail from './DecisionDetail';
import PersonalizationResult from './PersonalizationResult';
import './AdjacencyPersonalization.css';

export interface AdjacencyPersonalizationProps {
  kyc: KYCResponse;
  preset: '5k' | '10k' | '15k' | '20k';
  baseSF: number;
  baseMatrix: AdjacencyRequirement[];
  savedDecisions?: Record<string, string>;  // Previously saved decisions to restore
  onDecisionChange?: (decisionId: string, optionId: string) => void;  // Called on each change
  onComplete: (result: PersonalizationOutput) => void;
  onCancel: () => void;
  onViewDiagram?: () => void;
}

export interface PersonalizationOutput {
  choices: PersonalizationChoice[];
  updatedMatrix: AdjacencyRequirement[];
  bridgeConfig: Partial<BridgeConfig>;
  totalSfImpact: number;
  warningCount: number;
}

type Screen = 'summary' | 'detail' | 'result';

export function AdjacencyPersonalization({
  kyc,
  preset,
  baseSF,
  baseMatrix,
  savedDecisions,
  onDecisionChange,
  onComplete,
  onCancel,
  onViewDiagram
}: AdjacencyPersonalizationProps) {
  // Screen state
  const [currentScreen, setCurrentScreen] = useState<Screen>('summary');
  const [detailDecisionId, setDetailDecisionId] = useState<string | null>(null);
  
  // Get recommendations
  const recommendations = useMemo(() => 
    recommendAdjacencies(kyc, preset),
    [kyc, preset]
  );
  
  // Initialize selections from savedDecisions (if available) or recommendations
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const rec of recommendations) {
      // Use saved decision if available, otherwise use recommendation
      initial[rec.decision.id] = savedDecisions?.[rec.decision.id] || rec.recommendedOption.id;
    }
    return initial;
  });
  
  // Build choices array from selections
  const choices = useMemo((): PersonalizationChoice[] => {
    return recommendations.map(rec => ({
      decisionId: rec.decision.id,
      selectedOptionId: selections[rec.decision.id],
      isDefault: selections[rec.decision.id] === rec.recommendedOption.id,
      warnings: []  // Will be populated by evaluatePersonalization
    }));
  }, [recommendations, selections]);
  
  // Evaluate personalization
  const personalizationResult = useMemo(() => 
    evaluatePersonalization([...choices]),
    [choices]
  );
  
  // Get preset name
  const presetName = useMemo(() => {
    const names: Record<string, string> = {
      '5k': '5,000 SF',
      '10k': '10,000 SF',
      '15k': '15,000 SF',
      '20k': '20,000 SF'
    };
    return names[preset] || preset;
  }, [preset]);
  
  // Handlers
  const handleSelectionChange = useCallback((decisionId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [decisionId]: optionId
    }));
    // Notify parent for persistence
    if (onDecisionChange) {
      onDecisionChange(decisionId, optionId);
    }
  }, [onDecisionChange]);
  
  const handleExpandDecision = useCallback((decisionId: string) => {
    setDetailDecisionId(decisionId);
    setCurrentScreen('detail');
  }, []);
  
  const handleAcceptAll = useCallback(() => {
    setCurrentScreen('result');
  }, []);
  
  const handleReviewAll = useCallback(() => {
    // Start with first decision
    if (recommendations.length > 0) {
      setDetailDecisionId(recommendations[0].decision.id);
      setCurrentScreen('detail');
    }
  }, [recommendations]);
  
  const handleBackToSummary = useCallback(() => {
    setCurrentScreen('summary');
    setDetailDecisionId(null);
  }, []);
  
  const handlePreviousDecision = useCallback(() => {
    const currentIndex = recommendations.findIndex(
      r => r.decision.id === detailDecisionId
    );
    if (currentIndex > 0) {
      setDetailDecisionId(recommendations[currentIndex - 1].decision.id);
    }
  }, [recommendations, detailDecisionId]);
  
  const handleNextDecision = useCallback(() => {
    const currentIndex = recommendations.findIndex(
      r => r.decision.id === detailDecisionId
    );
    if (currentIndex < recommendations.length - 1) {
      setDetailDecisionId(recommendations[currentIndex + 1].decision.id);
    } else {
      // At the end, go to result
      setCurrentScreen('result');
    }
  }, [recommendations, detailDecisionId]);
  
  const handleExport = useCallback(() => {
    // Generate JSON summary
    const summary = {
      preset,
      baseSF,
      totalSF: baseSF + personalizationResult.totalSfImpact,
      decisions: personalizationResult.choices.map(choice => {
        const decision = ADJACENCY_DECISIONS.find(d => d.id === choice.decisionId);
        const option = decision?.options.find(o => o.id === choice.selectedOptionId);
        return {
          decision: decision?.title,
          selection: option?.label,
          isRecommended: choice.isDefault,
          warnings: choice.warnings
        };
      }),
      bridges: personalizationResult.requiredBridges,
      warnings: personalizationResult.warningCount
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adjacency-personalization-${preset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [preset, baseSF, personalizationResult]);
  
  const handleComplete = useCallback(() => {
    const updatedMatrix = applyDecisionsToMatrix(baseMatrix, personalizationResult.choices);
    const bridgeConfig = deriveBridgeConfigFromChoices(personalizationResult.choices);
    
    onComplete({
      choices: personalizationResult.choices,
      updatedMatrix,
      bridgeConfig,
      totalSfImpact: personalizationResult.totalSfImpact,
      warningCount: personalizationResult.warningCount
    });
  }, [baseMatrix, personalizationResult, onComplete]);
  
  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'summary':
        return (
          <RecommendationsSummary
            recommendations={recommendations}
            selections={selections}
            presetName={presetName}
            totalSF={baseSF}
            onSelectionChange={handleSelectionChange}
            onExpandDecision={handleExpandDecision}
            onAcceptAll={handleAcceptAll}
            onReviewAll={handleReviewAll}
          />
        );
        
      case 'detail':
        const currentRec = recommendations.find(r => r.decision.id === detailDecisionId);
        const currentIndex = recommendations.findIndex(r => r.decision.id === detailDecisionId);
        
        if (!currentRec) {
          setCurrentScreen('summary');
          return null;
        }
        
        return (
          <DecisionDetail
            decision={currentRec.decision}
            selectedOptionId={selections[currentRec.decision.id]}
            recommendedOptionId={currentRec.recommendedOption.id}
            reasoning={currentRec.reasoning}
            currentIndex={currentIndex}
            totalCount={recommendations.length}
            onSelect={(optionId) => handleSelectionChange(currentRec.decision.id, optionId)}
            onPrevious={handlePreviousDecision}
            onNext={handleNextDecision}
            onBack={handleBackToSummary}
          />
        );
        
      case 'result':
        return (
          <PersonalizationResult
            result={personalizationResult}
            decisions={ADJACENCY_DECISIONS}
            presetName={presetName}
            baseSF={baseSF}
            onBack={handleBackToSummary}
            onViewDiagram={onViewDiagram || (() => {})}
            onExport={handleExport}
            onContinueToBuilder={handleComplete}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="adjacency-personalization">
      <header className="personalization-header">
        <button className="cancel-btn" onClick={onCancel}>
          <ArrowLeft className="btn-icon" />
          Back
        </button>
        <div className="header-title">
          <h1>Personalize Your Layout</h1>
          <span className="preset-badge">{presetName}</span>
        </div>
        <div className="header-spacer" />
      </header>
      
      <main className="personalization-content">
        {renderScreen()}
      </main>
    </div>
  );
}

export default AdjacencyPersonalization;
