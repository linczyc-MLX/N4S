import React, { useState } from 'react';
import {
  User, Users, Home, DollarSign, Palette, Heart,
  Layout, Globe, Briefcase, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, AlertTriangle, ChevronDown
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

// Import section components
import PortfolioContextSection from './sections/PortfolioContextSection';
import FamilyHouseholdSection from './sections/FamilyHouseholdSection';
import ProjectParametersSection from './sections/ProjectParametersSection';
import BudgetFrameworkSection from './sections/BudgetFrameworkSection';
import DesignIdentitySection from './sections/DesignIdentitySection';
import LifestyleLivingSection from './sections/LifestyleLivingSection';
import SpaceRequirementsSection from './sections/SpaceRequirementsSection';
import CulturalContextSection from './sections/CulturalContextSection';
import WorkingPreferencesSection from './sections/WorkingPreferencesSection';

const KYCModule = () => {
  const {
    kycData,
    activeRespondent,
    setActiveRespondent,
    currentKYCSection,
    setCurrentKYCSection,
    disclosureTier,
    setDisclosureTier,
    calculateCompleteness,
    getSectionCompletionStatus
  } = useAppContext();

  const sections = [
    { id: 'portfolioContext', label: 'Portfolio Context', icon: Briefcase, tier: 'mvp', taskCode: 'P1.A.1' },
    { id: 'familyHousehold', label: 'Family & Household', icon: Users, tier: 'mvp', taskCode: 'P1.A.2' },
    { id: 'projectParameters', label: 'Project Parameters', icon: Home, tier: 'mvp', taskCode: 'P1.A.3' },
    { id: 'budgetFramework', label: 'Budget Framework', icon: DollarSign, tier: 'mvp', taskCode: 'P1.A.4' },
    { id: 'designIdentity', label: 'Design Preferences', icon: Palette, tier: 'mvp', taskCode: 'P1.A.5' },
    { id: 'lifestyleLiving', label: 'Lifestyle & Living', icon: Heart, tier: 'enhanced', taskCode: 'P1.A.6' },
    { id: 'spaceRequirements', label: 'Space Requirements', icon: Layout, tier: 'mvp', taskCode: 'P1.A.7' },
    { id: 'culturalContext', label: 'Cultural Context', icon: Globe, tier: 'enhanced', taskCode: 'P1.A.8' },
    { id: 'workingPreferences', label: 'Working Preferences', icon: Briefcase, tier: 'enhanced', taskCode: 'P1.A.9' },
  ];

  // REMOVED: advisor tab - Secondary/Partner only completes P1.A.5/6/7
  const respondentTabs = [
    { id: 'principal', label: 'Principal', color: 'navy', description: 'Primary decision-maker' },
    { id: 'secondary', label: 'Secondary', color: 'teal', description: 'Spouse / Co-decision-maker' },
  ];

  // REMOVED: fyi-extended option
  const tierOptions = [
    { id: 'mvp', label: 'Quick Capture', description: '15-20 min' },
    { id: 'enhanced', label: 'Full Discovery', description: '45-60 min' },
  ];

  // Sections available to Secondary (Partner) - only P1.A.5, P1.A.6, P1.A.7
  const secondarySections = ['designIdentity', 'lifestyleLiving', 'spaceRequirements'];

  // Filter sections based on respondent
  const getAvailableSections = () => {
    if (activeRespondent === 'secondary') {
      return sections.filter(s => secondarySections.includes(s.id));
    }
    return sections;
  };

  const availableSections = getAvailableSections();

  const renderSection = () => {
    // For secondary, only allow P1.A.5/6/7
    if (activeRespondent === 'secondary' && !secondarySections.includes(currentKYCSection)) {
      setCurrentKYCSection('designIdentity'); // Default to P1.A.5
      return null;
    }

    const sectionProps = { respondent: activeRespondent, tier: disclosureTier };

    switch (currentKYCSection) {
      case 'portfolioContext':
        return <PortfolioContextSection {...sectionProps} />;
      case 'familyHousehold':
        return <FamilyHouseholdSection {...sectionProps} />;
      case 'projectParameters':
        return <ProjectParametersSection {...sectionProps} />;
      case 'budgetFramework':
        return <BudgetFrameworkSection {...sectionProps} />;
      case 'designIdentity':
        return <DesignIdentitySection {...sectionProps} />;
      case 'lifestyleLiving':
        return <LifestyleLivingSection {...sectionProps} />;
      case 'spaceRequirements':
        return <SpaceRequirementsSection {...sectionProps} />;
      case 'culturalContext':
        // Not available for secondary
        if (activeRespondent === 'secondary') return null;
        return <CulturalContextSection {...sectionProps} />;
      case 'workingPreferences':
        // Not available for secondary
        if (activeRespondent === 'secondary') return null;
        return <WorkingPreferencesSection {...sectionProps} />;
      default:
        return <PortfolioContextSection {...sectionProps} />;
    }
  };

  const currentSectionIndex = availableSections.findIndex(s => s.id === currentKYCSection);
  const canGoBack = currentSectionIndex > 0;
  const canGoForward = currentSectionIndex < availableSections.length - 1;

  const goToSection = (direction) => {
    const newIndex = direction === 'next' ? currentSectionIndex + 1 : currentSectionIndex - 1;
    if (newIndex >= 0 && newIndex < availableSections.length) {
      setCurrentKYCSection(availableSections[newIndex].id);
    }
  };

  const completionPercentage = calculateCompleteness(activeRespondent);

  // State for remaining sections dropdown
  const [showRemainingDropdown, setShowRemainingDropdown] = useState(false);

  // Get incomplete sections for the dropdown
  const incompleteSections = availableSections.filter(section => {
    const status = getSectionCompletionStatus(activeRespondent, section.id);
    return status !== 'complete';
  });

  return (
    <div className="kyc-module">
      {/* Header with respondent tabs */}
      <div className="kyc-header">
        <div className="respondent-tabs">
          {respondentTabs.map(tab => (
            <button
              key={tab.id}
              className={`respondent-tab ${activeRespondent === tab.id ? 'active' : ''} ${tab.color}`}
              onClick={() => {
                setActiveRespondent(tab.id);
                // When switching to secondary, default to P1.A.5
                if (tab.id === 'secondary' && !secondarySections.includes(currentKYCSection)) {
                  setCurrentKYCSection('designIdentity');
                }
              }}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </button>
          ))}
        </div>

        <div className="tier-selector">
          {tierOptions.map(tier => (
            <button
              key={tier.id}
              className={`tier-option ${disclosureTier === tier.id ? 'active' : ''}`}
              onClick={() => setDisclosureTier(tier.id)}
            >
              <span className="tier-label">{tier.label}</span>
              <span className="tier-time">{tier.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="kyc-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-text">{completionPercentage}% Complete</span>
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
                    {incompleteSections.map(section => {
                      const status = getSectionCompletionStatus(activeRespondent, section.id);
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          className="remaining-dropdown__item"
                          onClick={() => {
                            setCurrentKYCSection(section.id);
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
        </div>
      </div>

      {/* Main content area */}
      <div className="kyc-content">
        {/* Section navigation */}
        <div className="section-nav">
          <div className="section-list">
            {availableSections.map((section, index) => {
              const status = getSectionCompletionStatus(activeRespondent, section.id);
              const Icon = section.icon;
              const isActive = currentKYCSection === section.id;
              
              return (
                <button
                  key={section.id}
                  className={`section-item ${isActive ? 'active' : ''} ${status}`}
                  onClick={() => setCurrentKYCSection(section.id)}
                >
                  <div className="section-icon">
                    <Icon size={18} />
                  </div>
                  <div className="section-info">
                    <span className="section-code">{section.taskCode}</span>
                    <span className="section-label">{section.label}</span>
                  </div>
                  <div className="section-status">
                    {status === 'complete' && <CheckCircle2 size={14} className="status-icon status-icon--complete" />}
                    {status === 'partial' && <AlertTriangle size={14} className="status-icon status-icon--partial" />}
                    {status === 'empty' && <Circle size={14} className="status-icon status-icon--empty" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section content */}
        <div className="section-content">
          {renderSection()}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="kyc-navigation">
        <button
          className="nav-btn prev"
          onClick={() => goToSection('prev')}
          disabled={!canGoBack}
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <button
          className="nav-btn next"
          onClick={() => goToSection('next')}
          disabled={!canGoForward}
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default KYCModule;
