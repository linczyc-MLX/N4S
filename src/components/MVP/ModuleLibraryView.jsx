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
  Play
} from 'lucide-react';

// Import modules data
import { modulesData } from '../../mansion-program/server/modules-data';

// ============================================
// DEPLOYMENT WORKFLOW COMPONENT
// ============================================

const DeploymentWorkflow = ({ currentGate, gateStatus }) => {
  const gates = [
    {
      id: 'A',
      name: 'Profile Complete',
      description: 'KYC sections filled',
      shortDesc: 'Capture operating model, lifestyle priorities, and target thresholds'
    },
    {
      id: 'B',
      name: 'Space Program',
      description: 'FYI selections done',
      shortDesc: 'Draft 8-zone concept zoning and run Master Adjacency Gate'
    },
    {
      id: 'C',
      name: 'Module Validation',
      description: 'Rules reviewed',
      shortDesc: 'Run module-level checklists and confirm circulation overlays'
    },
    {
      id: 'D',
      name: 'Adjacency Lock',
      description: 'Decisions made',
      shortDesc: 'Translate intent into dimensioned plans, freeze adjacency logic'
    },
    {
      id: 'E',
      name: 'Brief Ready',
      description: 'Export available',
      shortDesc: 'Final validation complete, ready for architect handoff'
    }
  ];

  const getGateStatus = (gateId) => {
    if (gateStatus[gateId] === 'complete') return 'complete';
    if (gateStatus[gateId] === 'current') return 'current';
    if (gateStatus[gateId] === 'warning') return 'warning';
    return 'locked';
  };

  return (
    <div className="module-workflow">
      <h3 className="module-workflow__title">Deployment Workflow</h3>
      <p className="module-workflow__subtitle">
        Deploy the modules as a staged validation process. Lock zoning, adjacencies, and operating loops early, then refine dimensions, detailing, and materiality.
      </p>

      <div className="module-workflow__gates">
        {gates.map((gate, index) => {
          const status = getGateStatus(gate.id);
          return (
            <div key={gate.id} className={`module-gate module-gate--${status}`}>
              <div className="module-gate__badge">{gate.id}</div>
              <div className="module-gate__content">
                <div className="module-gate__name">{gate.name}</div>
                <div className="module-gate__desc">{gate.shortDesc}</div>
              </div>
              {index < gates.length - 1 && (
                <div className="module-gate__arrow">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// MODULE CARD COMPONENT
// ============================================

const ModuleCard = ({ module, isExpanded, onToggle, checklistState, onChecklistChange }) => {
  const completedCount = checklistState
    ? module.checklistItems.filter(item => checklistState[item.id]).length
    : 0;
  const totalCount = module.checklistItems.length;
  const isComplete = completedCount === totalCount;

  return (
    <div className={`module-card ${isExpanded ? 'module-card--expanded' : ''}`}>
      {/* Card Header - Always Visible */}
      <div className="module-card__header" onClick={onToggle}>
        <div className="module-card__number">{String(module.number).padStart(2, '0')}</div>
        <div className="module-card__info">
          <h4 className="module-card__name">{module.name}</h4>
          <p className="module-card__focus">{module.primaryFocus}</p>
        </div>
        <div className="module-card__meta">
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
  onChecklistChange
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

  return (
    <div className="module-library">
      {/* Header */}
      <div className="module-library__header">
        <button className="n4s-btn n4s-btn--ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Overview
        </button>
      </div>

      {/* Title Section */}
      <div className="module-library__title-section">
        <h2 className="module-library__title">Module Library</h2>
        <p className="module-library__subtitle">
          8 deployable modules for mansion program validation
        </p>

        {/* Progress Bar */}
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
          />
        ))}
      </div>

      {/* Deployment Workflow */}
      <DeploymentWorkflow
        currentGate="C"
        gateStatus={gateStatus}
      />

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
