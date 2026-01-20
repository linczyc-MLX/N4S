import React from 'react';
import { Plus, X, Info } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';

const PortfolioContextSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].portfolioContext;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'portfolioContext', { [field]: value });
  };

  // Handle multiple primary residences
  const addPrimaryResidence = () => {
    const residences = data.primaryResidences || [];
    handleChange('primaryResidences', [...residences, { country: '', city: '' }]);
  };

  const updatePrimaryResidence = (index, field, value) => {
    const residences = [...(data.primaryResidences || [])];
    residences[index] = { ...residences[index], [field]: value };
    handleChange('primaryResidences', residences);
  };

  const removePrimaryResidence = (index) => {
    const residences = (data.primaryResidences || []).filter((_, i) => i !== index);
    handleChange('primaryResidences', residences);
  };

  const propertyRoleOptions = [
    { value: 'primary', label: 'Primary Residence' },
    { value: 'secondary', label: 'Secondary/Vacation Home' },
    { value: 'vacation', label: 'Vacation Property' },
    { value: 'investment', label: 'Investment Property' },
    { value: 'legacy', label: 'Legacy/Generational Asset' },
  ];

  const investmentHorizonOptions = [
    { value: 'forever', label: 'Forever Home' },
    { value: '10yr', label: '10+ Years' },
    { value: '5yr', label: '5-10 Years' },
    { value: 'generational', label: 'Generational (Multi-decade)' },
  ];

  const exitStrategyOptions = [
    { value: 'personal', label: 'Personal Use Only' },
    { value: 'rental', label: 'Potential Rental Income' },
    { value: 'sale', label: 'Future Sale/Flip' },
    { value: 'inheritance', label: 'Family Inheritance' },
  ];

  const lifeStageOptions = [
    { value: 'building', label: 'Building Family (Young Children)' },
    { value: 'established', label: 'Established Family (Teen/Adult Children)' },
    { value: 'empty-nest', label: 'Empty Nest' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'multi-gen', label: 'Multi-Generational Household' },
  ];

  const decisionTimelineOptions = [
    { value: 'urgent', label: 'Urgent (< 6 months)' },
    { value: 'standard', label: 'Standard (6-12 months)' },
    { value: 'flexible', label: 'Flexible (12+ months)' },
  ];

  // Only show governance fields for Principal
  const isPrincipal = respondent === 'principal';

  // Show multiple residence inputs when count > 1
  const propertyCount = parseInt(data.currentPropertyCount) || 0;

  // Get stakeholder info for display
  const principalName = data.principalFirstName
    ? `${data.principalFirstName} ${data.principalLastName || ''}`.trim()
    : null;
  const secondaryName = data.secondaryFirstName
    ? `${data.secondaryFirstName} ${data.secondaryLastName || ''}`.trim()
    : null;
  const hasAdvisor = data.familyOfficeContact;

  return (
    <div className="kyc-section">
      {/* Stakeholder Summary - Read Only (configured in Settings) */}
      {isPrincipal && (
        <div className="kyc-section__group kyc-section__group--info">
          <div className="kyc-section__group-header">
            <h3 className="kyc-section__group-title">Project Stakeholders</h3>
            <span className="kyc-section__settings-link">
              <Info size={14} />
              Configured in Settings
            </span>
          </div>

          {!principalName ? (
            <div className="kyc-section__notice kyc-section__notice--warning">
              <Info size={16} />
              <span>
                No stakeholders configured. Please go to <strong>Settings</strong> to set up the Principal and any additional stakeholders before continuing.
              </span>
            </div>
          ) : (
            <div className="stakeholder-summary-display">
              <div className="stakeholder-summary-display__item">
                <span className="stakeholder-summary-display__label">Principal:</span>
                <span className="stakeholder-summary-display__value">{principalName}</span>
                {data.principalEmail && (
                  <span className="stakeholder-summary-display__email">{data.principalEmail}</span>
                )}
              </div>
              {secondaryName && (
                <div className="stakeholder-summary-display__item">
                  <span className="stakeholder-summary-display__label">Secondary:</span>
                  <span className="stakeholder-summary-display__value">{secondaryName}</span>
                  {data.secondaryEmail && (
                    <span className="stakeholder-summary-display__email">{data.secondaryEmail}</span>
                  )}
                </div>
              )}
              {hasAdvisor && (
                <div className="stakeholder-summary-display__item">
                  <span className="stakeholder-summary-display__label">Advisor:</span>
                  <span className="stakeholder-summary-display__value">{data.familyOfficeContact}</span>
                  {data.familyOfficeAuthorityLevel && (
                    <span className="stakeholder-summary-display__authority">
                      Level {data.familyOfficeAuthorityLevel}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Portfolio Context</h3>
        <p className="kyc-section__group-description">
          Understanding the role this property plays in your overall portfolio helps us weight your preferences appropriately.
        </p>
        
        <FormField
          label="Current Property Count"
          type="number"
          value={data.currentPropertyCount}
          onChange={(v) => handleChange('currentPropertyCount', parseInt(v) || null)}
          placeholder="Total properties owned"
          min={0}
        />

        {/* Multiple Primary Residences */}
        {propertyCount > 0 && (
          <div className="kyc-section__subgroup">
            <label className="form-field__label">Primary Residence Location(s)</label>
            <p className="form-field__help" style={{ marginBottom: '12px' }}>
              Enter the locations of your existing properties
            </p>
            
            {(data.primaryResidences || []).map((residence, index) => (
              <div key={index} className="residence-row">
                <div className="form-grid form-grid--2col">
                  <FormField
                    label={`Property ${index + 1} - City`}
                    value={residence.city}
                    onChange={(v) => updatePrimaryResidence(index, 'city', v)}
                    placeholder="City"
                  />
                  <FormField
                    label="Country"
                    value={residence.country}
                    onChange={(v) => updatePrimaryResidence(index, 'country', v)}
                    placeholder="Country"
                  />
                </div>
                {(data.primaryResidences || []).length > 1 && (
                  <button 
                    className="btn btn--ghost btn--sm residence-row__remove"
                    onClick={() => removePrimaryResidence(index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            
            {(data.primaryResidences || []).length < propertyCount && (
              <button 
                className="btn btn--secondary btn--sm"
                onClick={addPrimaryResidence}
              >
                <Plus size={16} /> Add Property Location
              </button>
            )}
          </div>
        )}

        <SelectField
          label="This Property's Role"
          value={data.thisPropertyRole}
          onChange={(v) => handleChange('thisPropertyRole', v)}
          options={propertyRoleOptions}
          placeholder="Select the role this property will serve..."
          required
          helpText="This fundamentally affects how we weight your preferences vs. market considerations"
        />

        <div className="form-grid form-grid--2col">
          <SelectField
            label="Investment Horizon"
            value={data.investmentHorizon}
            onChange={(v) => handleChange('investmentHorizon', v)}
            options={investmentHorizonOptions}
            placeholder="How long do you plan to hold?"
            required
          />
          
          {tier !== 'mvp' && (
            <SelectField
              label="Exit Strategy"
              value={data.exitStrategy}
              onChange={(v) => handleChange('exitStrategy', v)}
              options={exitStrategyOptions}
              placeholder="Long-term plan for the property..."
            />
          )}
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Life Stage & Timeline</h3>
        
        <div className="form-grid form-grid--2col">
          <SelectField
            label="Life Stage"
            value={data.lifeStage}
            onChange={(v) => handleChange('lifeStage', v)}
            options={lifeStageOptions}
            placeholder="Current household life stage..."
            required
          />
          <SelectField
            label="Decision Timeline"
            value={data.decisionTimeline}
            onChange={(v) => handleChange('decisionTimeline', v)}
            options={decisionTimelineOptions}
            placeholder="How quickly do you need to move?"
            required
          />
        </div>
      </div>

      {/* KYC-KYM Weighting Indicator */}
      {data.thisPropertyRole && data.investmentHorizon && (
        <div className="kyc-section__insight">
          <h4 className="kyc-section__insight-title">KYC-KYM Weighting Preview</h4>
          <p className="kyc-section__insight-text">
            Based on your selections, we will weight your assessment:
          </p>
          <div className="weighting-indicator">
            <div className="weighting-indicator__bar">
              <div 
                className="weighting-indicator__kyc"
                style={{ 
                  width: data.thisPropertyRole === 'primary' && data.investmentHorizon === 'forever' 
                    ? '70%' 
                    : data.thisPropertyRole === 'investment' 
                      ? '30%' 
                      : '50%' 
                }}
              >
                KYC (Your Preferences)
              </div>
              <div className="weighting-indicator__kym">
                KYM (Market Realities)
              </div>
            </div>
            <p className="weighting-indicator__explanation">
              {data.thisPropertyRole === 'primary' && data.investmentHorizon === 'forever'
                ? 'Forever home: Your personal preferences take priority over resale considerations.'
                : data.thisPropertyRole === 'investment'
                  ? 'Investment property: Market realities and resale value take priority.'
                  : 'Balanced approach: Both your preferences and market considerations are weighted equally.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioContextSection;
