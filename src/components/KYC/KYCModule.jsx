import React, { useState } from 'react';
import {
  User, Users, Home, DollarSign, Palette, Heart,
  Layout, Globe, Briefcase, ChevronLeft, ChevronRight,
  CheckCircle, Circle, AlertTriangle, ChevronDown
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

  // Calculate section completeness - use context function
  const getSectionStatus = (sectionId) => {
    return getSectionCompletionStatus(activeRespondent, sectionId);
  };

  // Check if section is visible based on tier and respondent
  const isSectionVisible = (section) => {
    // Secondary can only see P1.A.5/6/7
    if (activeRespondent === 'secondary' && !secondarySections.includes(section.id)) {
      return false;
    }
    // Tier filtering
    if (disclosureTier === 'enhanced') return true;
    return section.tier === 'mvp';
  };

  const visibleSections = sections.filter(s => isSectionVisible(s));

  const renderSection = () => {
    const section = visibleSections[currentKYCSection];
    if (!section) return null;

    const props = {
      respondent: activeRespondent,
      tier: disclosureTier,
    };

    switch (section.id) {
      case 'portfolioContext': return <PortfolioContextSection {...props} />;
      case 'familyHousehold': return <FamilyHouseholdSection {...props} />;
      case 'projectParameters': return <ProjectParametersSection {...props} />;
      case 'budgetFramework': return <BudgetFrameworkSection {...props} />;
      case 'designIdentity': return <DesignIdentitySection {...props} />;
      case 'lifestyleLiving': return <LifestyleLivingSection {...props} />;
      case 'spaceRequirements': return <SpaceRequirementsSection {...props} />;
      case 'culturalContext': return <CulturalContextSection {...props} />;
      case 'workingPreferences': return <WorkingPreferencesSection {...props} />;
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle size={14} className="status-icon status-icon--complete" />;
      case 'partial': return <Circle size={14} className="status-icon status-icon--partial" />;
      default: return <Circle size={14} className="status-icon status-icon--empty" />;
    }
  };

  // State for remaining sections dropdown
  const [showRemainingDropdown, setShowRemainingDropdown] = useState(false);

  // Get incomplete sections for the dropdown
  const incompleteSections = visibleSections.filter(section => {
    const status = getSectionCompletionStatus(activeRespondent, section.id);
    return status !== 'complete';
  });

  const completionPercentage = calculateCompleteness(activeRespondent);

  return (
    <div className="kyc-module">
      {/* Tier Selector */}
      <div className="kyc-module__tier-selector">
        <span className="kyc-module__tier-label">Disclosure Level:</span>
        <div className="tier-tabs">
          {tierOptions.map(tier => (
            <button
              key={tier.id}
              className={`tier-tab ${disclosureTier === tier.id ? 'tier-tab--active' : ''}`}
              onClick={() => setDisclosureTier(tier.id)}
            >
              <span className="tier-tab__label">{tier.label}</span>
              <span className="tier-tab__duration">{tier.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Respondent Tabs */}
      <div className="kyc-module__respondent-tabs">
        {respondentTabs.map(tab => (
          <button
            key={tab.id}
            className={`respondent-tab respondent-tab--${tab.color} ${
              activeRespondent === tab.id ? 'respondent-tab--active' : ''
            }`}
            onClick={() => {
              setActiveRespondent(tab.id);
              // When switching to secondary, reset to first visible section (P1.A.5)
              if (tab.id === 'secondary') {
                setCurrentKYCSection(0);
              }
            }}
          >
            <User size={18} />
            <div className="respondent-tab__content">
              <span className="respondent-tab__label">{tab.label}</span>
              <span className="respondent-tab__description">{tab.description}</span>
            </div>
            <span className="respondent-tab__progress">
              {calculateCompleteness(tab.id)}%
            </span>
          </button>
        ))}
      </div>

      <div className="kyc-module__layout">
        {/* Section Navigation */}
        <nav className="kyc-module__nav">
          <h3 className="kyc-module__nav-title">Module A: KYC</h3>
          <p className="kyc-module__nav-subtitle">Know Your Client</p>

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
                      const status = getSectionCompletionStatus(activeRespondent, section.id);
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
              const status = getSectionStatus(section.id);
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
