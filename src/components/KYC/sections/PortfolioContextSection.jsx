import React, { useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';

const PortfolioContextSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].portfolioContext;
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [pendingAuthorityLevel, setPendingAuthorityLevel] = useState(null);

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'portfolioContext', { [field]: value });
  };

  // Handle authority level selection with confirmation for Level 3+
  const handleAuthorityLevelChange = (value) => {
    const level = parseInt(value);
    if (level >= 3) {
      setPendingAuthorityLevel(level);
      setShowAuthorityModal(true);
    } else {
      handleChange('familyOfficeAuthorityLevel', level);
      handleChange('authorityLevelConfirmed', false);
    }
  };

  const confirmAuthorityLevel = () => {
    handleChange('familyOfficeAuthorityLevel', pendingAuthorityLevel);
    handleChange('authorityLevelConfirmed', true);
    setShowAuthorityModal(false);
    setPendingAuthorityLevel(null);
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

  const familyOfficeAuthorityOptions = [
    { value: 1, label: 'Level 1: Advisory Only' },
    { value: 2, label: 'Level 2: Veto Power on Budget/Timeline' },
    { value: 3, label: 'Level 3: Co-Signatory on Stage Gates' },
    { value: 4, label: 'Level 4: Full Authority Delegated' },
  ];

  // Only show governance fields for Principal
  const isPrincipal = respondent === 'principal';

  // Show multiple residence inputs when count > 1
  const propertyCount = parseInt(data.currentPropertyCount) || 0;

  return (
    <div className="kyc-section">
      {/* Authority Level Confirmation Modal */}
      {showAuthorityModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <AlertTriangle size={24} className="modal__icon modal__icon--warning" />
              <h3>Confirm Authority Level</h3>
            </div>
            <div className="modal__body">
              <p>
                You are granting <strong>
                  {pendingAuthorityLevel === 3 ? 'Level 3: Co-Signatory on Stage Gates' : 'Level 4: Full Authority Delegated'}
                </strong> to your Family Office/Advisor.
              </p>
              <p className="modal__warning">
                This means they will {pendingAuthorityLevel === 3 
                  ? 'need to co-sign all stage gate approvals' 
                  : 'have full authority to make decisions on your behalf'}.
              </p>
              <p>Are you sure you want to proceed?</p>
            </div>
            <div className="modal__actions">
              <button 
                className="btn btn--secondary"
                onClick={() => {
                  setShowAuthorityModal(false);
                  setPendingAuthorityLevel(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn--primary"
                onClick={confirmAuthorityLevel}
              >
                Confirm Authority Level
              </button>
            </div>
          </div>
        </div>
      )}

      {isPrincipal && (
        <>
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Principal Designation</h3>
            <p className="kyc-section__group-description">
              The Principal is the contractual decision-maker who signs all agreements and has final authority on Hard Stop decisions.
            </p>
            
            <div className="form-grid form-grid--2col">
              <FormField
                label="First Name"
                value={data.principalFirstName}
                onChange={(v) => handleChange('principalFirstName', v)}
                placeholder="First name"
                required
              />
              <FormField
                label="Last Name"
                value={data.principalLastName}
                onChange={(v) => handleChange('principalLastName', v)}
                placeholder="Last name"
                required
              />
            </div>
            
            <div className="form-grid form-grid--2col">
              <FormField
                label="Email"
                type="email"
                value={data.principalEmail}
                onChange={(v) => handleChange('principalEmail', v)}
                placeholder="email@example.com"
                required
              />
              <FormField
                label="Phone"
                type="tel"
                value={data.principalPhone}
                onChange={(v) => handleChange('principalPhone', v)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Secondary Stakeholder</h3>
            <p className="kyc-section__group-description">
              Spouse or co-decision-maker (if applicable)
            </p>
            <div className="form-grid form-grid--2col">
              <FormField
                label="First Name"
                value={data.secondaryFirstName}
                onChange={(v) => handleChange('secondaryFirstName', v)}
                placeholder="First name"
              />
              <FormField
                label="Last Name"
                value={data.secondaryLastName}
                onChange={(v) => handleChange('secondaryLastName', v)}
                placeholder="Last name"
              />
            </div>
            <FormField
              label="Email"
              type="email"
              value={data.secondaryEmail}
              onChange={(v) => handleChange('secondaryEmail', v)}
              placeholder="email@example.com"
            />
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Family Office / Advisor</h3>
            <div className="form-grid form-grid--2col">
              <FormField
                label="Family Office Contact"
                value={data.familyOfficeContact}
                onChange={(v) => handleChange('familyOfficeContact', v)}
                placeholder="Name and firm (if applicable)"
              />
              <SelectField
                label="Authority Level"
                value={data.familyOfficeAuthorityLevel}
                onChange={handleAuthorityLevelChange}
                options={familyOfficeAuthorityOptions}
                placeholder="Select authority level..."
                helpText="Principal must formally designate this"
              />
            </div>
            
            {data.familyOfficeAuthorityLevel >= 3 && data.authorityLevelConfirmed && (
              <div className="kyc-section__notice kyc-section__notice--info">
                <AlertTriangle size={16} />
                <span>
                  Authority Level {data.familyOfficeAuthorityLevel} confirmed. 
                  Stage gates will require {data.familyOfficeAuthorityLevel === 3 ? 'co-signature' : 'advisor approval'}.
                </span>
              </div>
            )}
            
            {tier !== 'mvp' && (
              <FormField
                label="Domain Delegation Notes"
                type="textarea"
                value={data.domainDelegationNotes}
                onChange={(v) => handleChange('domainDelegationNotes', v)}
                placeholder="Document any specific authority delegations (e.g., 'Secondary has authority over children's spaces and her closet')"
                rows={3}
              />
            )}
          </div>
        </>
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
