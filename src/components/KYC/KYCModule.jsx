import React, { useState, useCallback } from 'react';
import {
  User, Users, Home, DollarSign, Palette, Heart,
  Globe, Briefcase, ChevronLeft, ChevronRight,
  ChevronDown, Save, FileDown
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import KYCDocumentation from './KYCDocumentation';
import { generateKYCReport } from './KYCReportGenerator';

// Import section components
import PortfolioContextSection from './sections/PortfolioContextSection';
import FamilyHouseholdSection from './sections/FamilyHouseholdSection';
import ProjectParametersSection from './sections/ProjectParametersSection';
import BudgetFrameworkSection from './sections/BudgetFrameworkSection';
import DesignIdentitySection from './sections/DesignIdentitySection';
import LifestyleLivingSection from './sections/LifestyleLivingSection';
import CulturalContextSection from './sections/CulturalContextSection';
import WorkingPreferencesSection from './sections/WorkingPreferencesSection';

const KYCModule = ({ showDocs, onCloseDocs }) => {
  const {
    currentKYCSection,
    setCurrentKYCSection,
    calculateCompleteness,
    getSectionCompletionStatus,
    saveNow,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    kycData,
  } = useAppContext();

  const [saveMessage, setSaveMessage] = useState(null);
  const [showRemainingDropdown, setShowRemainingDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Define sections - all sections always visible (Full Discovery mode only)
  // NOTE: P1.A.7 (Space Requirements) was merged into P1.A.6 (Lifestyle & Living)
  // P1.A.8/P1.A.9 renumbered to P1.A.7/P1.A.8
  const sections = [
    { id: 'portfolioContext', label: 'Portfolio Context', icon: Briefcase, taskCode: 'P1.A.1' },
    { id: 'familyHousehold', label: 'Family & Household', icon: Users, taskCode: 'P1.A.2' },
    { id: 'projectParameters', label: 'Project Parameters', icon: Home, taskCode: 'P1.A.3' },
    { id: 'budgetFramework', label: 'Budget Framework', icon: DollarSign, taskCode: 'P1.A.4' },
    { id: 'designIdentity', label: 'Design Preferences', icon: Palette, taskCode: 'P1.A.5' },
    { id: 'lifestyleLiving', label: 'Lifestyle & Living', icon: Heart, taskCode: 'P1.A.6' },
    { id: 'culturalContext', label: 'Cultural Context', icon: Globe, taskCode: 'P1.A.7' },
    { id: 'workingPreferences', label: 'Working Preferences', icon: Briefcase, taskCode: 'P1.A.8' },
  ];

  // Respondent tabs - Secondary/Partner only completes P1.A.5/6
  const respondentTabs = [
    { id: 'principal', label: 'Principal', color: 'navy', description: 'Primary decision-maker' },
    { id: 'secondary', label: 'Secondary', color: 'teal', description: 'Spouse / Co-decision-maker' },
  ];

  // Sections available to Secondary (Partner) - only P1.A.5 and P1.A.6 (which now includes Space Requirements)
  const secondarySections = ['designIdentity', 'lifestyleLiving'];

  // Check if ALL sections are complete (for Export Report button)
  const areAllSectionsComplete = sections.every(section => {
    // Check Principal completion for all sections
    const principalStatus = getSectionCompletionStatus('principal', section.id);
    if (principalStatus !== 'complete') return false;

    // For P1.A.5, P1.A.6 - also need Secondary to be complete
    if (secondarySections.includes(section.id)) {
      const secondaryStatus = getSectionCompletionStatus('secondary', section.id);
      if (secondaryStatus !== 'complete') return false;
    }

    return true;
  });

  // SAVE HANDLER
  const handleSave = useCallback(async () => {
    const success = await saveNow();
    if (success) {
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage('Save failed');
      setTimeout(() => setSaveMessage(null), 5000);
    }
  }, [saveNow]);

  // EXPORT REPORT HANDLER
  const handleExportReport = useCallback(async () => {
    setIsExporting(true);
    try {
      await generateKYCReport(kycData);
      console.log('[KYC] Report exported successfully');
    } catch (error) {
      console.error('[KYC] Export error:', error);
      setSaveMessage('Export failed');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsExporting(false);
    }
  }, [kycData]);

  // All sections always visible (Principal view only - LRA manages the dashboard)
  const isSectionVisible = (section) => {
    return true;
  };

  const visibleSections = sections.filter(s => isSectionVisible(s));

  const getStatusIcon = (status) => {
    const size = 14;
    const strokeWidth = 1.25;

    switch (status) {
      case 'complete':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--teal)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="status-icon"
          >
            <circle cx="8" cy="8" r="6.5" />
            <path d="M5.2 8.3l1.6 1.6 3.4-3.6" />
          </svg>
        );

      case 'partial':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--gold)"
            strokeWidth={strokeWidth}
            className="status-icon"
          >
            <circle cx="8" cy="8" r="6.5" />
          </svg>
        );

      default:
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--gray-300)"
            strokeWidth={strokeWidth}
            className="status-icon"
          >
            <circle cx="8" cy="8" r="6.5" />
          </svg>
        );
    }
  };

  const renderSection = () => {
    const section = visibleSections[currentKYCSection];
    if (!section) return null;

    const props = {
      respondent: 'principal', // Always Principal view - LRA manages the dashboard
      tier: 'enhanced', // Always Full Discovery mode
    };

    switch (section.id) {
      case 'portfolioContext': return <PortfolioContextSection {...props} />;
      case 'familyHousehold': return <FamilyHouseholdSection {...props} />;
      case 'projectParameters': return <ProjectParametersSection {...props} />;
      case 'budgetFramework': return <BudgetFrameworkSection {...props} />;
      case 'designIdentity': return <DesignIdentitySection {...props} />;
      case 'lifestyleLiving': return <LifestyleLivingSection {...props} />;
      case 'culturalContext': return <CulturalContextSection {...props} />;
      case 'workingPreferences': return <WorkingPreferencesSection {...props} />;
      default: return null;
    }
  };

  // Get incomplete sections for the dropdown
  const incompleteSections = visibleSections.filter(section => {
    const status = getSectionCompletionStatus('principal', section.id);
    return status !== 'complete';
  });

  const completionPercentage = calculateCompleteness('principal');

  // If in docs mode, show documentation
  if (showDocs) {
    return <KYCDocumentation onClose={onCloseDocs} />;
  }

  return (
    <div className="kyc-module">
      {/* Top Action Bar - SAVE & Export on right side */}
      <div className="kyc-module__top-bar">
        <div className="kyc-module__save-area">
          <button
            className={`btn ${hasUnsavedChanges ? 'btn--primary' : 'btn--success'}`}
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
          {/* Export Report only shows on P1.A.1 Portfolio Context - master report for entire module */}
          {visibleSections[currentKYCSection]?.id === 'portfolioContext' && (
            <button
              className={`kyc-export-btn ${!areAllSectionsComplete ? 'kyc-export-btn--disabled' : ''}`}
              onClick={handleExportReport}
              disabled={isExporting || !areAllSectionsComplete}
              title={areAllSectionsComplete ? 'Export KYC Report as PDF' : 'Complete all sections to enable export'}
            >
              <FileDown size={16} className={isExporting ? 'spinning' : ''} />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <span className="kyc-save-time">Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Respondent Status Display (non-clickable) */}
      <div className="kyc-module__respondent-status">
        {respondentTabs.map(tab => (
          <div
            key={tab.id}
            className={`respondent-status respondent-status--${tab.color}`}
          >
            <User size={18} />
            <div className="respondent-status__content">
              <span className="respondent-status__label">{tab.label}</span>
              <span className="respondent-status__description">{tab.description}</span>
            </div>
            <span className="respondent-status__progress">
              {calculateCompleteness(tab.id)}%
            </span>
          </div>
        ))}
      </div>

      <div className="kyc-module__layout">
        {/* Section Navigation */}
        <nav className="kyc-module__nav">
          <div className="kyc-module__nav-header">
            <div>
              <h3 className="kyc-module__nav-title">Module A: KYC</h3>
              <p className="kyc-module__nav-subtitle">Know Your Client</p>
            </div>
          </div>

          {/* Remaining Sections Dropdown */}
          {completionPercentage < 100 && incompleteSections.length > 0 && (
            <div className="remaining-dropdown-wrapper">
              <button
                className={`remaining-trigger ${showRemainingDropdown ? 'active' : ''}`}
                onClick={() => setShowRemainingDropdown(!showRemainingDropdown)}
              >
                <span>{incompleteSections.length} Remaining</span>
                <ChevronDown size={14} className={showRemainingDropdown ? 'rotated' : ''} />
              </button>
              {showRemainingDropdown && (
                <div className="remaining-dropdown">
                  <div className="remaining-dropdown__header">Incomplete Sections</div>
                  <div className="remaining-dropdown__list">
                    {incompleteSections.map((section, idx) => {
                      const status = getSectionCompletionStatus('principal', section.id);
                      const Icon = section.icon;
                      const sectionIndex = visibleSections.findIndex(s => s.id === section.id);
                      return (
                        <button
                          key={section.id}
                          className="remaining-dropdown__item"
                          onClick={() => {
                            setCurrentKYCSection(sectionIndex);
                            setShowRemainingDropdown(false);
                          }}
                        >
                          <Icon size={14} />
                          <span className="remaining-dropdown__code">{section.taskCode}</span>
                          <span className="remaining-dropdown__label">{section.label}</span>
                          {status === 'partial' && (
                            <span className="remaining-dropdown__badge partial">Partial</span>
                          )}
                          {status === 'empty' && (
                            <span className="remaining-dropdown__badge empty">Empty</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <ul className="kyc-module__nav-list">
            {visibleSections.map((section, index) => {
              const Icon = section.icon;
              const status = getSectionCompletionStatus('principal', section.id);
              const isActive = currentKYCSection === index;

              return (
                <li key={section.id}>
                  <button
                    className={`kyc-nav-item ${isActive ? 'kyc-nav-item--active' : ''}`}
                    onClick={() => setCurrentKYCSection(index)}
                  >
                    <span className="kyc-nav-item__code">{section.taskCode}</span>
                    <div className="kyc-nav-item__icon">
                      <Icon size={18} />
                    </div>
                    <span className="kyc-nav-item__label">{section.label}</span>
                    {getStatusIcon(status)}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Section Content */}
        <div className="kyc-module__content">
          <div className="kyc-module__section-header">
            <div className="kyc-module__section-title-group">
              <span className="kyc-module__task-code">{visibleSections[currentKYCSection]?.taskCode}</span>
              <h2 className="kyc-module__section-title">
                {visibleSections[currentKYCSection]?.label}
              </h2>
            </div>
            <span className="kyc-module__section-counter">
              Section {currentKYCSection + 1} of {visibleSections.length}
            </span>
          </div>

          <div className="kyc-module__section-body">
            {renderSection()}
          </div>

          {/* Navigation Buttons */}
          <div className="kyc-module__section-nav">
            <button
              className="btn btn--secondary"
              onClick={() => setCurrentKYCSection(Math.max(0, currentKYCSection - 1))}
              disabled={currentKYCSection === 0}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            
            {currentKYCSection < visibleSections.length - 1 && (
              <button
                className="btn btn--primary"
                onClick={() => setCurrentKYCSection(currentKYCSection + 1)}
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCModule;
