import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';

const ProjectParametersSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].projectParameters;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'projectParameters', { [field]: value });
  };

  const propertyTypeOptions = [
    { value: 'new-build', label: 'New Build (Ground Up)' },
    { value: 'renovation', label: 'Major Renovation' },
    { value: 'addition', label: 'Addition to Existing' },
    { value: 'interior-only', label: 'Interior Renovation Only' },
  ];

  const timelineOptions = [
    { value: 'urgent', label: 'Urgent (< 12 months)' },
    { value: '12-18mo', label: '12-18 Months' },
    { value: '18-24mo', label: '18-24 Months' },
    { value: '24plus', label: '24+ Months' },
  ];

  const complexityOptions = [
    { value: 'historic', label: 'Historic Preservation' },
    { value: 'regulatory', label: 'Complex Regulatory Environment' },
    { value: 'phased', label: 'Phased Construction' },
    { value: 'remote', label: 'Remote/Difficult Access Site' },
    { value: 'coastal', label: 'Coastal/Flood Zone' },
    { value: 'hillside', label: 'Steep Hillside' },
  ];

  const architecturalIntegrationOptions = [
    { value: 'id-only', label: 'Interior Design Only (Architect Separate)' },
    { value: 'shell-coord', label: 'Shell & Core Coordination' },
    { value: 'full-arch', label: 'Full Architectural Services Needed' },
  ];

  const localKnowledgeOptions = [
    { value: 'critical', label: 'Critical - Complex Permitting/Design Review' },
    { value: 'standard', label: 'Standard - Some Local Expertise Needed' },
    { value: 'not-needed', label: 'Not Critical - Straightforward Jurisdiction' },
  ];

  const siteTypologyOptions = [
    { value: 'hillside', label: 'Hillside' },
    { value: 'waterfront', label: 'Waterfront' },
    { value: 'urban', label: 'Urban' },
    { value: 'suburban', label: 'Suburban' },
    { value: 'rural', label: 'Rural' },
    { value: 'desert', label: 'Desert' },
  ];

  const toggleComplexityFactor = (factor) => {
    const current = data.complexityFactors || [];
    const updated = current.includes(factor)
      ? current.filter(f => f !== factor)
      : [...current, factor];
    handleChange('complexityFactors', updated);
  };

  return (
    <div className="kyc-section">
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Project Identification</h3>

        <FormField
          label="Project Name"
          value={data.projectName}
          onChange={(v) => handleChange('projectName', v)}
          placeholder="e.g., Smith Residence, Villa Azure, The Thornwood Estate"
          required
        />
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Location</h3>

        <div className="form-grid form-grid--2col">
          <FormField
            label="City"
            value={data.projectCity}
            onChange={(v) => handleChange('projectCity', v)}
            placeholder="e.g., Dubai, Los Angeles, London"
            required
          />
          <FormField
            label="Country"
            value={data.projectCountry}
            onChange={(v) => handleChange('projectCountry', v)}
            placeholder="e.g., UAE, USA, UK"
            required
          />
        </div>

        {tier !== 'mvp' && (
          <>
            <FormField
              label="Specific Address / Site"
              value={data.specificAddress}
              onChange={(v) => handleChange('specificAddress', v)}
              placeholder="If known - street address or development name"
            />
            <SelectField
              label="Site Typology"
              value={data.siteTypology}
              onChange={(v) => handleChange('siteTypology', v)}
              options={siteTypologyOptions}
              placeholder="Select site type..."
              helpText="Affects architect matching and design approach"
            />
          </>
        )}
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Project Scope</h3>
        
        <SelectField
          label="Property Type"
          value={data.propertyType}
          onChange={(v) => handleChange('propertyType', v)}
          options={propertyTypeOptions}
          placeholder="Select project type..."
          required
        />

        <div className="form-grid form-grid--3col">
          <FormField
            label="Target Gross SF"
            type="number"
            value={data.targetGSF}
            onChange={(v) => handleChange('targetGSF', parseInt(v) || null)}
            placeholder="Total square feet"
            min={0}
            required
          />
          <FormField
            label="Bedrooms"
            type="number"
            value={data.bedroomCount}
            onChange={(v) => handleChange('bedroomCount', parseInt(v) || null)}
            placeholder="Count"
            min={0}
            required
          />
          <FormField
            label="Bathrooms"
            type="number"
            value={data.bathroomCount}
            onChange={(v) => handleChange('bathroomCount', parseInt(v) || null)}
            placeholder="Count"
            min={0}
          />
        </div>

        <div className="form-grid form-grid--2col">
          <div className="form-field">
            <label className="form-field__label">Include Basement Level?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              Basement spaces have different adjacency rules (acoustic separation)
            </p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${data.hasBasement ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('hasBasement', true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${!data.hasBasement ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('hasBasement', false)}
              >
                No
              </button>
            </div>
          </div>
          <FormField
            label="SF Budget Cap (Optional)"
            type="number"
            value={data.sfCapConstraint}
            onChange={(v) => handleChange('sfCapConstraint', parseInt(v) || null)}
            placeholder="Leave blank for Discovery Mode"
            min={0}
            helpText="Set a maximum SF constraint, or leave blank to explore"
          />
        </div>

        {tier !== 'mvp' && (
          <FormField
            label="Floors / Levels"
            type="number"
            value={data.floors}
            onChange={(v) => handleChange('floors', parseInt(v) || null)}
            placeholder="Number of floors"
            min={1}
          />
        )}
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Timeline & Complexity</h3>
        
        <SelectField
          label="Target Timeline"
          value={data.timeline}
          onChange={(v) => handleChange('timeline', v)}
          options={timelineOptions}
          placeholder="Select timeline..."
          required
        />

        {tier !== 'mvp' && (
          <>
            <div className="form-field">
              <label className="form-field__label">Complexity Factors</label>
              <p className="form-field__help" style={{ marginBottom: '12px' }}>
                Select all that apply - these affect team selection and timeline
              </p>
              <div className="chip-select">
                {complexityOptions.map(option => (
                  <button
                    key={option.value}
                    className={`chip ${(data.complexityFactors || []).includes(option.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleComplexityFactor(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <SelectField
              label="Architectural Integration Level"
              value={data.architecturalIntegration}
              onChange={(v) => handleChange('architecturalIntegration', v)}
              options={architecturalIntegrationOptions}
              placeholder="Select integration level..."
              helpText="Do you need a full architect, or just interior design?"
            />

            <SelectField
              label="Local Knowledge Criticality"
              value={data.localKnowledgeCritical}
              onChange={(v) => handleChange('localKnowledgeCritical', v)}
              options={localKnowledgeOptions}
              placeholder="How important is local expertise?"
              helpText="Affects geographic requirements for architect/designer"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectParametersSection;
