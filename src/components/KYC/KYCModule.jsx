import React, { useState, useMemo } from 'react';
import {
  User, Users, Home, DollarSign, Palette, Heart,
  Layout, Globe, Briefcase, ChevronLeft, ChevronRight,
  ChevronDown
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

  // All sections with their configuration
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

  // Respondent tabs - Principal and Secondary only
  const respondentTabs = [
    { id: 'principal', label: 'Principal', color: 'navy', description: 'Primary decision-maker' },
    { id: 'secondary', label: 'Secondary', color: 'teal', description: 'Spouse / Co-decision-maker' },
  ];

  // Disclosure tier options
  const tierOptions = [
    { id: 'mvp', label: 'Quick Capture', description: '15-20 min' },
    { id: 'enhanced', label: 'Full Discovery', description: '45-60 min' },
  ];

  // Sections available to Secondary (Partner) - only P1.A.5, P1.A.6, P1.A.7
  const secondarySections = ['designIdentity', 'lifestyleLiving', 'spaceRequirements'];

  // Check if section is visible based on tier and respondent
  const isSectionVisible = (section, respondent = activeRespondent) => {
    // Secondary can only see P1.A.5/6/7
    if (respondent === 'secondary' && !secondarySections.includes(section.id)) {
      return false;
    }
    // Tier filtering
    if (disclosureTier === 'enhanced') return true;
    return section.tier === 'mvp';
  };

  // Get visible sections for current respondent
  const visibleSections = useMemo(() => {
    return sections.filter(s => isSectionVisible(s, activeRespondent));
  }, [activeRespondent, disclosureTier]);

  // Get visible sections for a specific respondent (used when switching)
  const getVisibleSectionsFor = (respondent) => {
    return sections.filter(s => isSectionVisible(s, respondent));
  };

  // State for remaining sections dropdown
  const [showRemainingDropdown, setShowRemainingDropdown] = useState(false);

  // Get incomplete sections for the dropdown
  const incompleteSections = visibleSections.filter(section => {
    const status = getSectionCompletionStatus(activeRespondent, section.id);
    return status !== 'complete';
  });

  const completionPercentage = calculateCompleteness(activeRespondent);

  // Status icon renderer
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

  // Handle respondent tab click - STAY ON SAME SECTION when possible
  const handleRespondentSwitch = (newRespondent) => {
    // Get the ID of the current section
    const currentSectionId = visibleSections[currentKYCSection]?.id;
    
    // Switch respondent
    setActiveRespondent(newRespondent);
    
    // Get visible sections for the new respondent
    const targetSections = getVisibleSectionsFor(newRespondent);
    
    // Find the same section in the new respondent's visible sections
    const newIndex = targetSections.findIndex(s => s.id === currentSectionId);
    
    if (newIndex >= 0) {
      // Same section exists - stay on it
      setCurrentKYCSection(newIndex);
    } else {
      // Section doesn't exist for this respondent - go to first section
      // This only happens when switching from Principal to Secondary while on a non-shared section
      setCurrentKYCSection(0);
    }
  };

  // Render the current section
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

      {/* Respondent Tabs - FIXED: Stay on same section when switching */}
      <div className="kyc-module__respondent-tabs">
        {respondentTabs.map(tab => (
          <button
            key={tab.id}
            className={`respondent-tab respondent-tab--${tab.color} ${
              activeRespondent === tab.id ? 'respondent-tab--active' : ''
            }`}
            onClick={() => handleRespondentSwitch(tab.id)}
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

          {/* Section List */}
          <ul className="kyc-module__nav-list">
            {visibleSections.map((section, idx) => {
              const Icon = section.icon;
              const status = getSectionCompletionStatus(activeRespondent, section.id);
              return (
                <li key={section.id}>
                  <button
                    className={`kyc-module__nav-item ${currentKYCSection === idx ? 'kyc-module__nav-item--active' : ''}`}
                    onClick={() => setCurrentKYCSection(idx)}
                  >
                    <div className="kyc-module__nav-item-icon">
                      <Icon size={16} />
                    </div>
                    <div className="kyc-module__nav-item-content">
                      <span className="kyc-module__nav-item-code">{section.taskCode}</span>
                      <span className="kyc-module__nav-item-label">{section.label}</span>
                    </div>
                    {getStatusIcon(status)}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Completion Bar */}
          <div className="kyc-module__completion">
            <div className="kyc-module__completion-bar">
              <div 
                className="kyc-module__completion-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="kyc-module__completion-text">{completionPercentage}% Complete</span>
          </div>
        </nav>

        {/* Section Content */}
        <div className="kyc-module__content">
          <div className="kyc-module__section-header">
            <span className="kyc-module__section-code">
              {visibleSections[currentKYCSection]?.taskCode}
            </span>
            <h2 className="kyc-module__section-title">
              {visibleSections[currentKYCSection]?.label}
            </h2>
          </div>
          
          <div className="kyc-module__section-body">
            {renderSection()}
          </div>

          {/* Navigation Buttons */}
          <div className="kyc-module__nav-buttons">
            <button
              className="kyc-module__nav-btn kyc-module__nav-btn--prev"
              onClick={() => setCurrentKYCSection(Math.max(0, currentKYCSection - 1))}
              disabled={currentKYCSection === 0}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              className="kyc-module__nav-btn kyc-module__nav-btn--next"
              onClick={() => setCurrentKYCSection(Math.min(visibleSections.length - 1, currentKYCSection + 1))}
              disabled={currentKYCSection === visibleSections.length - 1}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCModule;
