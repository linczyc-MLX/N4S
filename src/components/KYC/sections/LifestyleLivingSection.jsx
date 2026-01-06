import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';
import SliderField from '../../shared/SliderField';

const LifestyleLivingSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].lifestyleLiving;

  // Get principal's WFH data for Secondary confirmation
  const principalLifestyle = kycData.principal?.lifestyleLiving || {};
  const principalWfhCount = principalLifestyle.wfhPeopleCount || 0;
  const principalFirstName = kycData.principal?.portfolioContext?.principalFirstName || 'Principal';
  const showWfhConfirmation = respondent === 'secondary' && principalWfhCount >= 2;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'lifestyleLiving', { [field]: value });
  };

  const wfhOptions = [
    { value: 'never', label: 'Never' },
    { value: 'sometimes', label: 'Sometimes (1-2 days/week)' },
    { value: 'often', label: 'Often (3-4 days/week)' },
    { value: 'always', label: 'Always (Full Remote)' },
  ];

  const entertainingOptions = [
    { value: 'rarely', label: 'Rarely (Few times/year)' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily/Constantly' },
  ];

  const entertainingStyleOptions = [
    { value: 'formal', label: 'Formal (Seated dinners)' },
    { value: 'casual', label: 'Casual (Relaxed gatherings)' },
    { value: 'both', label: 'Both Formal & Casual' },
  ];

  const hobbyOptions = [
    { value: 'art', label: 'Art/Painting' },
    { value: 'music', label: 'Music/Instruments' },
    { value: 'fitness', label: 'Fitness/Home Gym' },
    { value: 'yoga', label: 'Yoga/Meditation' },
    { value: 'cooking', label: 'Cooking/Culinary' },
    { value: 'wine', label: 'Wine Collection' },
    { value: 'cars', label: 'Car Collection' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'reading', label: 'Reading/Library' },
    { value: 'gaming', label: 'Gaming/Media' },
    { value: 'spa', label: 'Spa/Wellness' },
    { value: 'crafts', label: 'Crafts/Making' },
  ];

  const wellnessOptions = [
    { value: 'gym', label: 'Home Gym' },
    { value: 'pool', label: 'Pool' },
    { value: 'spa', label: 'Spa/Sauna' },
    { value: 'yoga', label: 'Yoga Studio' },
    { value: 'massage', label: 'Massage Room' },
    { value: 'meditation', label: 'Meditation Space' },
    { value: 'cold-plunge', label: 'Cold Plunge' },
  ];

  const toggleOption = (field, option) => {
    const current = data[field] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    handleChange(field, updated);
  };

  return (
    <div className="kyc-section">
      {/* WFH Confirmation for Secondary when Principal indicated 2+ offices */}
      {showWfhConfirmation && (
        <div className="kyc-section__group">
          <div className={`wfh-confirmation ${data.wfhConfirmation === false ? 'wfh-confirmation--discuss' : ''}`}>
            <div className="wfh-confirmation__message">
              <strong>{principalFirstName}</strong> has indicated requirement for <strong>{principalWfhCount} dedicated Home Offices</strong>.
            </div>
            <div className="wfh-confirmation__actions">
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${data.wfhConfirmation === true ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('wfhConfirmation', true)}
                >
                  ✓ Confirm
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${data.wfhConfirmation === false ? 'toggle-btn--active toggle-btn--warning' : ''}`}
                  onClick={() => handleChange('wfhConfirmation', false)}
                >
                  ⚠ Discuss
                </button>
              </div>
            </div>
            {data.wfhConfirmation === false && (
              <div className="wfh-confirmation__flag">
                <AlertTriangle size={16} />
                <span>Flagged for discussion - WFH requirements need alignment</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Work From Home</h3>

        <SelectField
          label="Work From Home Frequency"
          value={data.workFromHome}
          onChange={(v) => handleChange('workFromHome', v)}
          options={wfhOptions}
          placeholder="How often do you work from home?"
        />

        {data.workFromHome && data.workFromHome !== 'never' && (
          <>
            <FormField
              label="Number of People WFH"
              type="number"
              value={data.wfhPeopleCount}
              onChange={(v) => handleChange('wfhPeopleCount', parseInt(v) || null)}
              placeholder="How many people need home office space?"
              min={1}
              helpText="Include anyone who regularly works from home"
            />

            {/* Second Office Question - appears when 2+ people WFH */}
            {(data.wfhPeopleCount >= 2) && (
              <div className="form-field">
                <label className="form-field__label">Separate Offices Required?</label>
                <p className="form-field__help" style={{ marginBottom: '8px' }}>
                  Do you need separate, private office spaces for each person working from home?
                </p>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${data.separateOfficesRequired === true ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('separateOfficesRequired', true)}
                  >
                    Yes, separate offices
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${data.separateOfficesRequired === false ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('separateOfficesRequired', false)}
                  >
                    No, can share space
                  </button>
                </div>
                {data.separateOfficesRequired && (
                  <p className="form-field__note" style={{ marginTop: '8px', color: 'var(--teal)' }}>
                    ✓ Program will include {data.wfhPeopleCount} separate home offices
                  </p>
                )}
              </div>
            )}

            {/* Office needs details */}
            <FormField
              label="Office Requirements"
              type="textarea"
              value={data.officeRequirements}
              onChange={(v) => handleChange('officeRequirements', v)}
              placeholder="Any specific requirements? Video calls, client meetings, specialized equipment..."
              rows={2}
            />
          </>
        )}
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Hobbies & Activities</h3>
        
        <div className="form-field">
          <label className="form-field__label">Space-Requiring Hobbies</label>
          <p className="form-field__help" style={{ marginBottom: '12px' }}>
            Select hobbies that need dedicated space in your home
          </p>
          <div className="chip-select">
            {hobbyOptions.map(hobby => (
              <button
                key={hobby.value}
                className={`chip ${(data.hobbies || []).includes(hobby.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('hobbies', hobby.value)}
              >
                {hobby.label}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Hobby Details"
          type="textarea"
          value={data.hobbyDetails}
          onChange={(v) => handleChange('hobbyDetails', v)}
          placeholder="Specific equipment needs, space requirements, or details about your hobbies..."
          rows={2}
        />

        <div className="form-field">
          <label className="form-field__label">Late Night Media Use?</label>
          <p className="form-field__help" style={{ marginBottom: '8px' }}>
            Do you watch movies or game late at night when others are sleeping? (Affects acoustic planning)
          </p>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${data.lateNightMediaUse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('lateNightMediaUse', true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${!data.lateNightMediaUse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('lateNightMediaUse', false)}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Entertaining</h3>
        
        <div className="form-grid form-grid--2col">
          <SelectField
            label="Entertaining Frequency"
            value={data.entertainingFrequency}
            onChange={(v) => handleChange('entertainingFrequency', v)}
            options={entertainingOptions}
            placeholder="How often do you entertain?"
          />
          <SelectField
            label="Entertaining Style"
            value={data.entertainingStyle}
            onChange={(v) => handleChange('entertainingStyle', v)}
            options={entertainingStyleOptions}
            placeholder="What type of entertaining?"
          />
        </div>

        <FormField
          label="Typical Guest Count"
          value={data.typicalGuestCount}
          onChange={(v) => handleChange('typicalGuestCount', v)}
          placeholder="e.g., 8-12 for dinners, 50-100 for parties"
        />
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Wellness</h3>
        
        <div className="form-field">
          <label className="form-field__label">Wellness Priorities</label>
          <div className="chip-select">
            {wellnessOptions.map(wellness => (
              <button
                key={wellness.value}
                className={`chip ${(data.wellnessPriorities || []).includes(wellness.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('wellnessPriorities', wellness.value)}
              >
                {wellness.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Privacy & Environment</h3>
        
        <SliderField
          label="Privacy Level Required"
          value={data.privacyLevelRequired || 3}
          onChange={(v) => handleChange('privacyLevelRequired', v)}
          min={1}
          max={5}
          leftLabel="Open/Social"
          rightLabel="Maximum Privacy"
        />

        <SliderField
          label="Noise Sensitivity"
          value={data.noiseSensitivity || 3}
          onChange={(v) => handleChange('noiseSensitivity', v)}
          min={1}
          max={5}
          leftLabel="Tolerant"
          rightLabel="Very Sensitive"
        />

        <SliderField
          label="Indoor-Outdoor Living"
          value={data.indoorOutdoorLiving || 3}
          onChange={(v) => handleChange('indoorOutdoorLiving', v)}
          min={1}
          max={5}
          leftLabel="Indoor Focused"
          rightLabel="Seamless Integration"
        />
      </div>

      <FormField
        label="Daily Routines Summary"
        type="textarea"
        value={data.dailyRoutinesSummary}
        onChange={(v) => handleChange('dailyRoutinesSummary', v)}
        placeholder="Describe a typical day - morning routines, how you use spaces, evening patterns..."
        rows={3}
      />
    </div>
  );
};

export default LifestyleLivingSection;
