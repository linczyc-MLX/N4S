import React, { useState } from 'react';
import { 
  User, Users, Home, DollarSign, Palette, Heart, 
  Layout, Globe, Briefcase, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, AlertTriangle
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
    calculateCompleteness
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

  const respondentTabs = [
    { id: 'principal', label: 'Principal', color: 'navy', description: 'Primary decision-maker' },
    { id: 'secondary', label: 'Secondary', color: 'teal', description: 'Spouse / Co-decision-maker' },
    { id: 'advisor', label: 'Advisor', color: 'gold', description: 'Family Office / Wealth Manager' },
  ];

  const tierOptions = [
    { id: 'mvp', label: 'Quick Capture', description: '15-20 min' },
    { id: 'enhanced', label: 'Full Discovery', description: '45-60 min' },
    { id: 'fyi-extended', label: 'FYI Extended', description: '+15-20 min' },
  ];

  // Calculate section completeness
  const getSectionStatus = (sectionId) => {
    const data = kycData[activeRespondent][sectionId];
    if (!data) return 'empty';
    
    const values = Object.values(data);
    const filledCount = values.filter(v => 
      v !== '' && v !== null && v !== undefined && 
      !(Array.isArray(v) && v.length === 0)
    ).length;
    
    if (filledCount === 0) return 'empty';
    if (filledCount === values.length) return 'complete';
    return 'partial';
  };

  // Check if section is visible based on tier
  const isSectionVisible = (sectionTier) => {
    if (disclosureTier === 'fyi-extended') return true;
    if (disclosureTier === 'enhanced') return sectionTier !== 'fyi-extended';
    return sectionTier === 'mvp';
  };

  const visibleSections = sections.filter(s => isSectionVisible(s.tier));

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
      case 'complete': return <CheckCircle2 size={16} className="status-icon status-icon--complete" />;
      case 'partial': return <AlertTriangle size={16} className="status-icon status-icon--partial" />;
      default: return <Circle size={16} className="status-icon status-icon--empty" />;
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

      {/* Respondent Tabs */}
      <div className="kyc-module__respondent-tabs">
        {respondentTabs.map(tab => (
          <button
            key={tab.id}
            className={`respondent-tab respondent-tab--${tab.color} ${
              activeRespondent === tab.id ? 'respondent-tab--active' : ''
            }`}
            onClick={() => setActiveRespondent(tab.id)}
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
            
            <button
              className="btn btn--primary"
              onClick={() => setCurrentKYCSection(Math.min(visibleSections.length - 1, currentKYCSection + 1))}
              disabled={currentKYCSection === visibleSections.length - 1}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCModule;
