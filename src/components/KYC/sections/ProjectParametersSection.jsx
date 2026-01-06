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

  const guestHouseBedroomOptions = [
    { value: 1, label: '1 Bedroom' },
    { value: 2, label: '2 Bedrooms' },
    { value: 3, label: '3 Bedrooms' },
  ];

  const poolHouseLocationOptions = [
    { value: 'attached', label: 'Attached to Main Residence' },
    { value: 'detached', label: 'Separate Structure' },
  ];

  const toggleComplexityFactor = (factor) => {
    const current = data.complexityFactors || [];
    const updated = current.includes(factor)
      ? current.filter(f => f !== factor)
      : [...current, factor];
    handleChange('complexityFactors', updated);
  };

  // Calculate total levels for display
  const totalLevels = 1 + (data.levelsAboveArrival || 0) + (data.levelsBelowArrival || 0);

  // Build level labels for visual diagram
  const getLevelLabels = () => {
    const labels = [];
    for (let i = (data.levelsAboveArrival || 0); i >= 1; i--) {
      labels.push(`L${i + 1}`);
    }
    labels.push('L1 (Arrival)');
    for (let i = 1; i <= (data.levelsBelowArrival || 0); i++) {
      labels.push(`L-${i}`);
    }
    return labels;
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

      {/* Level Configuration */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Level Configuration</h3>
        <p className="kyc-section__group-description">
          Configure the vertical stacking of your residence. L1 is always the Arrival Level.
        </p>

        <div className="form-grid form-grid--2col">
          <FormField
            label="Levels Above Arrival (L2, L3...)"
            type="number"
            value={data.levelsAboveArrival}
            onChange={(v) => handleChange('levelsAboveArrival', Math.min(3, Math.max(0, parseInt(v) || 0)))}
            placeholder="0-3"
            min={0}
            max={3}
            helpText="How many floors above the entry level?"
          />
          <FormField
            label="Levels Below Arrival (L-1, L-2...)"
            type="number"
            value={data.levelsBelowArrival}
            onChange={(v) => handleChange('levelsBelowArrival', Math.min(3, Math.max(0, parseInt(v) || 0)))}
            placeholder="0-3"
            min={0}
            max={3}
            helpText="Below-grade or down-slope levels"
          />
        </div>

        {/* Visual Level Diagram */}
        {totalLevels > 0 && (
          <div className="level-config-preview">
            <div className="level-config-preview__label">Building Section Preview</div>
            <div className="level-config-preview__stack">
              {getLevelLabels().map((label, idx) => (
                <div 
                  key={label}
                  className={`level-config-preview__level ${label.includes('Arrival') ? 'level-config-preview__level--arrival' : ''}`}
                >
                  <span className="level-config-preview__level-label">{label}</span>
                  {label.includes('Arrival') && (
                    <span className="level-config-preview__arrival-badge">← Entry</span>
                  )}
                </div>
              ))}
            </div>
            <div className="level-config-preview__total">
              Total: {totalLevels} level{totalLevels !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Additional Structures */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Additional Structures</h3>
        <p className="kyc-section__group-description">
          Beyond the main residence, will there be separate structures on the property?
        </p>

        {/* Guest House */}
        <div className="form-field">
          <label className="form-field__label">Include Guest House?</label>
          <p className="form-field__help" style={{ marginBottom: '8px' }}>
            A separate structure for guest accommodation
          </p>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${data.hasGuestHouse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('hasGuestHouse', true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${!data.hasGuestHouse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('hasGuestHouse', false)}
            >
              No
            </button>
          </div>
        </div>

        {data.hasGuestHouse && (
          <div className="form-subsection">
            <SelectField
              label="Guest House Bedrooms"
              value={data.guestHouseBedrooms}
              onChange={(v) => handleChange('guestHouseBedrooms', parseInt(v))}
              options={guestHouseBedroomOptions}
              placeholder="Select bedroom count..."
            />
            <div className="form-grid form-grid--3col">
              <div className="form-field">
                <label className="form-field__label">Include Living Area?</label>
                <div className="toggle-group toggle-group--small">
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${data.guestHouseIncludesLiving ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('guestHouseIncludesLiving', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${!data.guestHouseIncludesLiving ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('guestHouseIncludesLiving', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label className="form-field__label">Include Kitchen?</label>
                <div className="toggle-group toggle-group--small">
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${data.guestHouseIncludesKitchen ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('guestHouseIncludesKitchen', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${!data.guestHouseIncludesKitchen ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('guestHouseIncludesKitchen', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label className="form-field__label">Include Dining?</label>
                <div className="toggle-group toggle-group--small">
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${data.guestHouseIncludesDining ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('guestHouseIncludesDining', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${!data.guestHouseIncludesDining ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('guestHouseIncludesDining', false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pool House / Wellness Pavilion */}
        <div className="form-field" style={{ marginTop: '1.5rem' }}>
          <label className="form-field__label">Include Pool House / Wellness Pavilion?</label>
          <p className="form-field__help" style={{ marginBottom: '8px' }}>
            Changing rooms, showers, and optional entertainment/kitchen
          </p>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${data.hasPoolHouse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('hasPoolHouse', true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${!data.hasPoolHouse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('hasPoolHouse', false)}
            >
              No
            </button>
          </div>
        </div>

        {data.hasPoolHouse && (
          <div className="form-subsection">
            <SelectField
              label="Pool House Location"
              value={data.poolHouseLocation}
              onChange={(v) => handleChange('poolHouseLocation', v)}
              options={poolHouseLocationOptions}
              placeholder="Select location..."
            />
            <div className="form-grid form-grid--2col">
              <div className="form-field">
                <label className="form-field__label">Include Entertainment Area?</label>
                <div className="toggle-group toggle-group--small">
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${data.poolHouseIncludesEntertainment ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('poolHouseIncludesEntertainment', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${!data.poolHouseIncludesEntertainment ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('poolHouseIncludesEntertainment', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label className="form-field__label">Include Outdoor Kitchen?</label>
                <div className="toggle-group toggle-group--small">
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${data.poolHouseIncludesKitchen ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('poolHouseIncludesKitchen', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn toggle-btn--small ${!data.poolHouseIncludesKitchen ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('poolHouseIncludesKitchen', false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
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
