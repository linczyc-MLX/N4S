import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';
import SliderField from '../../shared/SliderField';

const BudgetFrameworkSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].budgetFramework;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'budgetFramework', { [field]: value });
  };

  const budgetFlexibilityOptions = [
    { value: 'fixed', label: 'Fixed Ceiling - Cannot Exceed' },
    { value: 'flexible', label: 'Flexible - Some Room for Quality' },
    { value: 'investment', label: 'Investment-Appropriate - Value Matters More Than Cost' },
  ];

  const feeStructureOptions = [
    { value: 'fixed', label: 'Fixed Fee' },
    { value: 'percentage', label: 'Percentage of Project Cost' },
    { value: 'hourly', label: 'Hourly Billing' },
    { value: 'hybrid', label: 'Hybrid (Fixed + Percentage)' },
    { value: 'no-preference', label: 'No Strong Preference' },
  ];

  // Calculate per-SF if we have total budget and GSF
  const projectParams = kycData[respondent].projectParameters;
  const calculatedPerSF = data.interiorBudget && projectParams.targetGSF
    ? Math.round(data.interiorBudget / projectParams.targetGSF)
    : null;

  return (
    <div className="kyc-section">
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Project Budget</h3>
        <p className="kyc-section__group-description">
          Understanding your budget parameters helps us match you with appropriately calibrated professionals.
        </p>
        
        <div className="form-grid form-grid--2col">
          <FormField
            label="Total Project Budget"
            type="number"
            value={data.totalProjectBudget}
            onChange={(v) => handleChange('totalProjectBudget', parseInt(v) || null)}
            placeholder="All-in including contingency"
            helpText="USD - Total construction + soft costs"
            min={0}
            required
          />
          <FormField
            label="Interior Budget (ID + FF&E)"
            type="number"
            value={data.interiorBudget}
            onChange={(v) => handleChange('interiorBudget', parseInt(v) || null)}
            placeholder="Interior design + furnishings"
            helpText="Subset of total budget"
            min={0}
            required
          />
        </div>

        {calculatedPerSF && (
          <div className="budget-insight">
            <span className="budget-insight__label">Calculated Interior Budget per SF:</span>
            <span className="budget-insight__value">${calculatedPerSF}/SF</span>
            <span className="budget-insight__context">
              {calculatedPerSF < 300 && '(Entry Luxury)'}
              {calculatedPerSF >= 300 && calculatedPerSF < 500 && '(Mid Luxury)'}
              {calculatedPerSF >= 500 && calculatedPerSF < 800 && '(High Luxury)'}
              {calculatedPerSF >= 800 && calculatedPerSF < 1200 && '(Ultra Luxury)'}
              {calculatedPerSF >= 1200 && '(Bespoke / Museum Quality)'}
            </span>
          </div>
        )}

        {tier !== 'mvp' && (
          <FormField
            label="Per-SF Expectation (Override)"
            type="number"
            value={data.perSFExpectation}
            onChange={(v) => handleChange('perSFExpectation', parseInt(v) || null)}
            placeholder="If different from calculated"
            helpText="Leave blank to use calculated value"
            min={0}
          />
        )}
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
        />

        {tier !== 'mvp' && (
          <>
            <SelectField
              label="Fee Structure Preference"
              value={data.feeStructurePreference}
              onChange={(v) => handleChange('feeStructurePreference', v)}
              options={feeStructureOptions}
              placeholder="How do you prefer to pay design fees?"
              helpText="For both architect and interior designer"
            />

            <SliderField
              label="Custom vs. Sourced Ratio"
              value={data.customVsSourcedRatio || 3}
              onChange={(v) => handleChange('customVsSourcedRatio', v)}
              min={1}
              max={5}
              leftLabel="All Catalog/Sourced"
              rightLabel="All Bespoke/Custom"
              helpText="1 = Source from catalogs, 5 = Everything custom-made"
            />
          </>
        )}
      </div>

      {tier !== 'mvp' && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Art Budget</h3>
          
          <div className="form-field">
            <label className="form-field__label">Separate Art Budget?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              Some clients allocate art acquisition separately from interior design
            </p>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${data.artBudgetSeparate ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('artBudgetSeparate', true)}
              >
                Yes, Separate
              </button>
              <button
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
            />
          )}
        </div>
      )}

      {/* Budget Caliber Context */}
      {data.interiorBudget && (
        <div className="kyc-section__insight">
          <h4 className="kyc-section__insight-title">Budget Caliber Matching</h4>
          <p className="kyc-section__insight-text">
            Based on your interior budget of ${(data.interiorBudget / 1000000).toFixed(1)}M, 
            we will match you with professionals who typically work at this caliber level.
          </p>
          <div className="caliber-indicator">
            <div className="caliber-indicator__scale">
              <div 
                className="caliber-indicator__marker"
                style={{ 
                  left: `${Math.min(95, Math.max(5, (data.interiorBudget / 20000000) * 100))}%` 
                }}
              />
              <div className="caliber-indicator__labels">
                <span>$1M</span>
                <span>$5M</span>
                <span>$10M</span>
                <span>$20M+</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetFrameworkSection;
