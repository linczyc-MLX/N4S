/**
 * ModuleLibraryView - 8 Deployable Modules for Mansion Program Validation
 * 
 * Shows all modules with click-to-expand functionality.
 * Each module displays: Overview, Gate Deliverables, Checklist Items
 * 
 * Part of MVP Deployment Workflow:
 * A (Profile) → B (Space Program) → C (Module Validation) → D (Adjacency) → E (Brief)
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  FileText,
  CheckCircle,
  Circle,
  Play,
  ShieldCheck
} from 'lucide-react';

// Import modules data
import { modulesData } from '../../mansion-program/server/modules-data';

// ============================================
// MODULE CARD COMPONENT
// ============================================

const ModuleCard = ({ module, isExpanded, onToggle, checklistState, onChecklistChange, reviewStatus, onReviewComplete }) => {
  const completedCount = checklistState 
    ? module.checklistItems.filter(item => checklistState[item.id]).length 
    : 0;
  const totalCount = module.checklistItems.length;
  const isComplete = completedCount === totalCount;
  const isReviewed = reviewStatus?.reviewed;

  return (
    <div className={`module-card ${isExpanded ? 'module-card--expanded' : ''} ${isReviewed ? 'module-card--reviewed' : ''}`}>
      {/* Card Header - Always Visible */}
      <div className="module-card__header" onClick={onToggle}>
        <div className="module-card__number">{String(module.number).padStart(2, '0')}</div>
        <div className="module-card__info">
          <h4 className="module-card__name">{module.name}</h4>
          <p className="module-card__focus">{module.primaryFocus}</p>
        </div>
        <div className="module-card__meta">
          {isReviewed && (
            <span className="module-card__reviewed-badge">
              <ShieldCheck size={14} /> Reviewed
            </span>
          )}
          <span className={`module-card__progress ${isComplete ? 'module-card__progress--complete' : ''}`}>
            {completedCount}/{totalCount} items
          </span>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="module-card__body">
          {/* Overview Section */}
          <div className="module-section">
            <h5 className="module-section__title">Overview</h5>
            <p className="module-section__text">{module.description}</p>
            <div className="module-section__focus">
              <span className="module-section__label">Primary Focus</span>
              <span className="module-section__value">{module.primaryFocus}</span>
            </div>
          </div>

          {/* Gate Deliverables Section */}
          <div className="module-section">
            <h5 className="module-section__title">
              <FileText size={16} />
              Gate Deliverables
            </h5>
            <p className="module-section__subtitle">Minimum required deliverables for gate approval:</p>
            <ol className="module-deliverables">
              {module.gateDeliverables.map((deliverable, index) => (
                <li key={index} className="module-deliverable">
                  {deliverable}
                </li>
              ))}
            </ol>
          </div>

          {/* Checklist Items Section */}
          <div className="module-section">
            <h5 className="module-section__title">
              <CheckSquare size={16} />
              Checklist Items
            </h5>
            <p className="module-section__subtitle">Review these items during validation:</p>
            <div className="module-checklist">
              {module.checklistItems.map((item) => (
                <label key={item.id} className="module-checklist-item">
                  <input
                    type="checkbox"
                    checked={checklistState?.[item.id] || false}
                    onChange={(e) => onChecklistChange(item.id, e.target.checked)}
                    className="module-checklist-item__input"
                  />
                  <div className="module-checklist-item__box">
                    {checklistState?.[item.id] ? (
                      <CheckCircle size={18} className="module-checklist-item__icon--checked" />
                    ) : (
                      <Circle size={18} className="module-checklist-item__icon" />
                    )}
                  </div>
                  <div className="module-checklist-item__content">
                    <span className="module-checklist-item__name">{item.name}</span>
                    <span className="module-checklist-item__desc">{item.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Review Complete Button */}
          <div className="module-review-action">
            {isReviewed ? (
              <button className="n4s-btn n4s-btn--success module-review-btn module-review-btn--done" disabled>
                <ShieldCheck size={16} />
                Review Complete
              </button>
            ) : (
              <button
                className="n4s-btn n4s-btn--primary module-review-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReviewComplete(module.id, true);
                }}
              >
                <ShieldCheck size={16} />
                Mark Review Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN MODULE LIBRARY VIEW
// ============================================

const ModuleLibraryView = ({ 
  onBack, 
  onProceedToValidation,
  gateStatus = {},
  checklistState = {},
  onChecklistChange,
  moduleReviewStatus = {},
  onModuleReviewComplete,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave
}) => {
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    let completed = 0;
    let total = 0;
    modulesData.forEach(module => {
      module.checklistItems.forEach(item => {
        total++;
        if (checklistState[item.id]) completed++;
      });
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [checklistState]);

  const handleToggleModule = (moduleId) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

  const handleChecklistItemChange = (itemId, checked) => {
    if (onChecklistChange) {
      onChecklistChange(itemId, checked);
    }
  };

  // Handle back button - collapse module first, then go to overview
  const handleBack = () => {
    if (expandedModuleId) {
      setExpandedModuleId(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="module-library">
      {/* Header */}
      <div className="module-library__header">
        <button className="n4s-btn n4s-btn--ghost" onClick={handleBack}>
          <ArrowLeft size={16} />
          {expandedModuleId ? 'Back to Module Library' : 'Back to Overview'}
        </button>
        
        {/* Save Button */}
        {onSave && (
          <button 
            className={`n4s-btn ${hasUnsavedChanges ? 'n4s-btn--primary' : 'n4s-btn--secondary'}`}
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
        )}
      </div>

      {/* Title Section */}
      <div className="module-library__title-section">
        <h2 className="module-library__title">Module Library</h2>
        <p className="module-library__subtitle">
          8 deployable modules for mansion program validation
        </p>
        
        {/* Review Progress */}
        {(() => {
          const reviewedCount = Object.values(moduleReviewStatus).filter(s => s?.reviewed).length;
          return (
            <div className="module-library__review-progress">
              <span className="module-library__review-text">
                {reviewedCount} of 8 modules reviewed
              </span>
              <div className="module-library__progress-bar">
                <div 
                  className="module-library__progress-fill module-library__progress-fill--review"
                  style={{ width: `${(reviewedCount / 8) * 100}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Checklist Progress */}
        <div className="module-library__progress">
          <div className="module-library__progress-bar">
            <div 
              className="module-library__progress-fill"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
          <span className="module-library__progress-text">
            {overallProgress.completed} of {overallProgress.total} checklist items complete ({overallProgress.percentage}%)
          </span>
        </div>
      </div>

      {/* Module Grid */}
      <div className="module-library__grid">
        {modulesData.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            isExpanded={expandedModuleId === module.id}
            onToggle={() => handleToggleModule(module.id)}
            checklistState={checklistState}
            onChecklistChange={handleChecklistItemChange}
            reviewStatus={moduleReviewStatus[module.id]}
            onReviewComplete={onModuleReviewComplete}
          />
        ))}
      </div>

      {/* Action Button */}
      <div className="module-library__actions">
        <button 
          className="n4s-btn n4s-btn--primary"
          onClick={onProceedToValidation}
        >
          <Play size={16} />
          Run Validation
        </button>
      </div>
    </div>
  );
};

export default ModuleLibraryView;
