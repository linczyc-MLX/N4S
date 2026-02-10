import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';
import IntakeProtectionBanner from '../IntakeProtectionBanner';

const BudgetFrameworkSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].budgetFramework;
  const portfolioContext = kycData[respondent].portfolioContext || {};

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'budgetFramework', { [field]: value });
  };

  const handlePortfolioContextChange = (field, value) => {
    updateKYCData(respondent, 'portfolioContext', { [field]: value });
  };

  // Calculate Grand Total (All-in Project Cost)
  const landAcquisitionCost = portfolioContext.landAcquisitionCost || 0;
  const grandTotal = landAcquisitionCost + (data.totalProjectBudget || 0);

  const budgetFlexibilityOptions = [
    { value: 'fixed', label: 'Fixed Ceiling - Cannot Exceed' },
    { value: 'flexible', label: 'Flexible - Some Room for Quality' },
    { value: 'investment', label: 'Investment-Appropriate - Value Matters More Than Cost' },
  ];

  const architectFeeOptions = [
    { value: 'fixed', label: 'Fixed Fee' },
    { value: 'percentage', label: 'Percentage of Construction Cost' },
    { value: 'hourly', label: 'Hourly Billing' },
    { value: 'hybrid', label: 'Hybrid (Fixed + Percentage)' },
    { value: 'no-preference', label: 'No Strong Preference' },
  ];

  const interiorDesignerFeeOptions = [
    { value: 'fixed', label: 'Fixed Fee' },
    { value: 'percentage', label: 'Percentage of Project Cost' },
    { value: 'hourly', label: 'Hourly Billing' },
    { value: 'cost-plus', label: 'Cost-Plus (Markup on Purchases)' },
    { value: 'hybrid', label: 'Hybrid (Fixed + Cost-Plus)' },
    { value: 'no-preference', label: 'No Strong Preference' },
  ];

  const interiorQualityTiers = [
    { 
      value: 'select', 
      label: 'Select',
      subtitle: 'The Curated Standard',
      description: 'Every material and finish selected for aesthetic harmony and durability. A sophisticated, complete experience for those who value refined design without extensive customization.'
    },
    { 
      value: 'reserve', 
      label: 'Reserve',
      subtitle: 'Exceptional Materials',
      description: 'Features finishes sourced from specialized production—hand-selected stone and artisanal millwork chosen for unique qualities. For clients who desire a distinctly personal home.'
    },
    { 
      value: 'signature', 
      label: 'Signature',
      subtitle: 'Bespoke Design',
      description: 'Custom-engineered solutions and unique design elements tailored to a specific lifestyle. Each space features hallmarks of world-class craftsmanship.'
    },
    { 
      value: 'legacy', 
      label: 'Legacy',
      subtitle: 'Enduring Heritage',
      description: 'The pinnacle of the program. High-quality sustainable materials and advanced technologies. Designed to endure as a generational asset maintaining prestige for the future.'
    },
  ];

  // Calculate per-SF if we have total budget and GSF
  const projectParams = kycData[respondent].projectParameters;
  const calculatedPerSF = data.interiorBudget && projectParams.targetGSF
    ? Math.round(data.interiorBudget / projectParams.targetGSF)
    : null;

  // Get quality tier label and color
  const getQualityTierInfo = (perSF) => {
    if (!perSF) return null;
    if (perSF < 300) return { label: 'Entry Luxury', color: '#6b6b6b' };
    if (perSF < 500) return { label: 'Mid Luxury', color: '#2e7d32' };
    if (perSF < 800) return { label: 'High Luxury', color: '#1e3a5f' };
    if (perSF < 1200) return { label: 'Ultra Luxury', color: '#c9a227' };
    return { label: 'Bespoke / Museum Quality', color: '#c9a227' };
  };

  const qualityTierInfo = getQualityTierInfo(calculatedPerSF);

  // Intake protection — fields lock when client completes intake questionnaire
  const [overrideMode, setOverrideMode] = useState(false);
  const portfolioCtx = kycData[respondent].portfolioContext || {};
  const intakeStatus = portfolioCtx.intakeStatus || 'not_sent';
  const intakeCompletedAt = portfolioCtx.intakeCompletedAt;
  const isLocked = intakeStatus === 'completed' && !overrideMode;


  return (
    <div className="kyc-section">
      <IntakeProtectionBanner
        intakeStatus={intakeStatus}
        intakeCompletedAt={intakeCompletedAt}
        overrideMode={overrideMode}
        onToggleOverride={() => setOverrideMode(!overrideMode)}
        sectionLabel="Budget Framework"
      />
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Project Budget</h3>
        <p className="kyc-section__group-description">
          Understanding your budget parameters helps us match you with appropriately calibrated professionals.
        </p>

        {/* ROW 1: Land Acquisition Cost | Total Project Budget */}
        <div className="form-grid form-grid--2col">
          <FormField
            label="Land Acquisition Cost"
            type="number"
            value={portfolioContext.landAcquisitionCost}
            onChange={(v) => handlePortfolioContextChange('landAcquisitionCost', parseInt(v) || null)}
            placeholder="Enter amount"
            helpText="USD - Cost of land/lot"
            min={0}
          readOnly={isLocked}
          />
          <FormField
            label="Total Project Budget"
            type="number"
            value={data.totalProjectBudget}
            onChange={(v) => handleChange('totalProjectBudget', parseInt(v) || null)}
            placeholder="Enter amount"
            helpText="USD - Total construction + soft costs"
            min={0}
            required
          readOnly={isLocked}
          />
        </div>

        {/* ROW 2: Interior Budget | Grand Total (display) */}
        <div className="form-grid form-grid--2col">
          <FormField
            label="Interior Budget (ID + FF&E)"
            type="number"
            value={data.interiorBudget}
            onChange={(v) => handleChange('interiorBudget', parseInt(v) || null)}
            placeholder="Enter amount"
            helpText="Subset of total budget"
            min={0}
            required
          readOnly={isLocked}
          />
          <div className="budget-grand-total">
            <span className="budget-grand-total__label">Grand Total (Total Project Budget)</span>
            <span className="budget-grand-total__value">
              ${grandTotal.toLocaleString()}
            </span>
            <span className="budget-grand-total__help">Land + Total Project Budget</span>
          </div>
        </div>

        {/* ROW 3: Calculated per-SF with quality tier badge (full width) */}
        <div className="budget-insight-box">
          <div className="budget-insight-box__content">
            <span className="budget-insight-box__label">Calculated Interior Budget per SF:</span>
            <span className="budget-insight-box__value">
              {calculatedPerSF ? `$${calculatedPerSF}/SF` : '—'}
            </span>
            {qualityTierInfo && (
              <span
                className="budget-insight-box__badge"
                style={{
                  backgroundColor: qualityTierInfo.color,
                  color: qualityTierInfo.color === '#c9a227' ? '#1a1a1a' : '#ffffff'
                }}
              >
                {qualityTierInfo.label}
              </span>
            )}
          </div>
          {!calculatedPerSF && (
            <span className="budget-insight-box__hint">
              Enter Interior Budget and Target SF to calculate
            </span>
          )}
        </div>

        {/* ROW 4: Per-SF Override */}
        <FormField
          label="Per-SF Expectation (Override)"
          type="number"
          value={data.perSFExpectation}
          onChange={(v) => handleChange('perSFExpectation', parseInt(v) || null)}
          placeholder="Optional override"
          helpText="Leave blank to use calculated value"
          min={0}
        readOnly={isLocked}
        />
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Budget Philosophy</h3>
        
        <SelectField
          label="Budget Flexibility"
          value={data.budgetFlexibility}
          onChange={(v) => handleChange('budgetFlexibility', v)}
          options={budgetFlexibilityOptions}
          placeholder="Select your approach..."
          required
          helpText="This affects how aggressively we optimize for value vs. cost"
        readOnly={isLocked}
        />
      </div>

      {tier !== 'mvp' && (
        <>
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Fee Structure Preferences</h3>
            <p className="kyc-section__group-description">
              Different fee structures suit different project types and client preferences.
            </p>
            
            <div className="form-grid form-grid--2col">
              <SelectField
                label="Architect Fee Structure"
                value={data.architectFeeStructure}
                onChange={(v) => handleChange('architectFeeStructure', v)}
                options={architectFeeOptions}
                placeholder="How do you prefer to pay the architect?"
              readOnly={isLocked}
              />
              <SelectField
                label="Interior Designer Fee Structure"
                value={data.interiorDesignerFeeStructure}
                onChange={(v) => handleChange('interiorDesignerFeeStructure', v)}
                options={interiorDesignerFeeOptions}
                placeholder="How do you prefer to pay the ID?"
              readOnly={isLocked}
              />
            </div>
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Interior Quality Tier</h3>
            <p className="kyc-section__group-description">
              Select the quality tier that best represents your expectations for materials and craftsmanship.
            </p>
            
            <div className="quality-tier-cards">
              {interiorQualityTiers.map((tierOption) => (
                <div 
                  key={tierOption.value}
                  className={`quality-tier-card ${data.interiorQualityTier === tierOption.value ? 'quality-tier-card--selected' : ''}`}
                  onClick={() => handleChange('interiorQualityTier', tierOption.value)}
                >
                  <div className="quality-tier-card__header">
                    <span className="quality-tier-card__number">
                      {tierOption.value === 'select' ? 'I' : tierOption.value === 'reserve' ? 'II' : tierOption.value === 'signature' ? 'III' : 'IV'}
                    </span>
                    <span className="quality-tier-card__label">{tierOption.label}</span>
                  </div>
                  <span className="quality-tier-card__subtitle">{tierOption.subtitle}</span>
                  <p className="quality-tier-card__description">{tierOption.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Art Budget</h3>
            
            <div className="form-field">
              <label className="form-field__label">Separate Art Budget?</label>
              <p className="form-field__help" style={{ marginBottom: '8px' }}>
                Some clients allocate art acquisition separately from interior design
              </p>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${data.artBudgetSeparate ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('artBudgetSeparate', true)}
                >
                  Yes, Separate
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${!data.artBudgetSeparate ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('artBudgetSeparate', false)}
                >
                  No, Included
                </button>
              </div>
            </div>

            {data.artBudgetSeparate && (
              <FormField
                label="Art Budget Amount"
                type="number"
                value={data.artBudgetAmount}
                onChange={(v) => handleChange('artBudgetAmount', parseInt(v) || null)}
                placeholder="Separate art acquisition budget"
                min={0}
              readOnly={isLocked}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetFrameworkSection;
