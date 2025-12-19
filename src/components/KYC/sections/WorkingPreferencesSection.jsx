import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';
import SliderField from '../../shared/SliderField';

const WorkingPreferencesSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].workingPreferences;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'workingPreferences', { [field]: value });
  };

  const communicationStyleOptions = [
    { value: 'direct', label: 'Direct - Get to the point' },
    { value: 'relational', label: 'Relational - Build rapport first' },
    { value: 'visual', label: 'Visual - Show me, don\'t tell me' },
  ];

  const decisionCadenceOptions = [
    { value: 'weekly', label: 'Weekly Check-ins' },
    { value: 'milestone', label: 'Milestone-Based' },
    { value: 'hands-off', label: 'Hands-Off (Trust the Team)' },
  ];

  const collaborationStyleOptions = [
    { value: 'directive', label: 'Directive - I know what I want' },
    { value: 'consultative', label: 'Consultative - Guide me through options' },
    { value: 'delegative', label: 'Delegative - Surprise me' },
  ];

  const principalInvolvementOptions = [
    { value: 'must-have', label: 'Must Have - Principal involved in my project' },
    { value: 'nice-to-have', label: 'Nice to Have - Some principal access' },
    { value: 'not-important', label: 'Not Important - Trust the team' },
  ];

  const presentationFormatOptions = [
    { value: 'in-person', label: 'In-Person Only' },
    { value: 'virtual', label: 'Virtual/Remote' },
    { value: 'hybrid', label: 'Hybrid (Both)' },
  ];

  const caOptions = [
    { value: 'full', label: 'Full CA - Architect on site regularly' },
    { value: 'limited', label: 'Limited CA - Key milestones only' },
    { value: 'none', label: 'None - Contractor handles' },
  ];

  const contractorRelationshipOptions = [
    { value: 'design-bid-build', label: 'Design-Bid-Build (Traditional)' },
    { value: 'design-build', label: 'Design-Build (Single Source)' },
    { value: 'cm-at-risk', label: 'CM at Risk' },
  ];

  return (
    <div className="kyc-section">
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Communication & Collaboration Style</h3>
        <p className="kyc-section__group-description">
          How do you prefer to work with your design team? This helps us match you with compatible professionals.
        </p>
        
        <SelectField
          label="Communication Style"
          value={data.communicationStyle}
          onChange={(v) => handleChange('communicationStyle', v)}
          options={communicationStyleOptions}
          placeholder="How do you prefer to communicate?"
          required
        />

        <div className="form-grid form-grid--2col">
          <SelectField
            label="Decision Cadence"
            value={data.decisionCadence}
            onChange={(v) => handleChange('decisionCadence', v)}
            options={decisionCadenceOptions}
            placeholder="How often do you want updates?"
          />
          <SelectField
            label="Collaboration Style"
            value={data.collaborationStyle}
            onChange={(v) => handleChange('collaborationStyle', v)}
            options={collaborationStyleOptions}
            placeholder="How involved do you want to be?"
          />
        </div>
      </div>

      {tier !== 'mvp' && (
        <>
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Principal Involvement & Format</h3>
            
            <SelectField
              label="Principal Involvement Required"
              value={data.principalInvolvementRequired}
              onChange={(v) => handleChange('principalInvolvementRequired', v)}
              options={principalInvolvementOptions}
              placeholder="How important is the firm principal's involvement?"
              helpText="Some clients want the 'name' designer personally involved"
            />

            <SelectField
              label="Presentation Format"
              value={data.presentationFormat}
              onChange={(v) => handleChange('presentationFormat', v)}
              options={presentationFormatOptions}
              placeholder="In-person or virtual meetings?"
            />
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Previous Experience</h3>
            
            <FormField
              label="Previous Designer Experience"
              type="textarea"
              value={data.previousDesignerExperience}
              onChange={(v) => handleChange('previousDesignerExperience', v)}
              placeholder="Have you worked with architects or interior designers before? What worked well? What didn't?"
              rows={3}
            />

            <FormField
              label="Red Flags to Avoid"
              type="textarea"
              value={data.redFlagsToAvoid}
              onChange={(v) => handleChange('redFlagsToAvoid', v)}
              placeholder="Past frustrations or behaviors you want to avoid in your design team..."
              rows={2}
            />

            <FormField
              label="Existing Industry Connections"
              value={data.existingIndustryConnections}
              onChange={(v) => handleChange('existingIndustryConnections', v)}
              placeholder="Designers you know or have been referred to..."
            />
          </div>
        </>
      )}

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Designer Profile Preferences</h3>
        
        <SliderField
          label="Celebrity vs. Quiet Professional"
          value={data.celebrityVsQuietProfessional || 3}
          onChange={(v) => handleChange('celebrityVsQuietProfessional', v)}
          min={1}
          max={5}
          leftLabel="Celebrity/Starchitect"
          rightLabel="Quiet Professional"
          helpText="1 = Want the big name, 5 = Prefer discretion"
        />

        {tier !== 'mvp' && (
          <SliderField
            label="Architect Celebrity Preference"
            value={data.starchitectPreference || 3}
            onChange={(v) => handleChange('starchitectPreference', v)}
            min={1}
            max={5}
            leftLabel="Want the Starchitect"
            rightLabel="Prefer Low-Profile"
          />
        )}
      </div>

      {tier !== 'mvp' && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Construction Administration</h3>
          
          <SelectField
            label="CA Requirement"
            value={data.caRequirement}
            onChange={(v) => handleChange('caRequirement', v)}
            options={caOptions}
            placeholder="How much architect involvement during construction?"
          />

          <SelectField
            label="Contractor Relationship Preference"
            value={data.contractorRelationshipPreference}
            onChange={(v) => handleChange('contractorRelationshipPreference', v)}
            options={contractorRelationshipOptions}
            placeholder="How should the contractor be engaged?"
          />
        </div>
      )}
    </div>
  );
};

export default WorkingPreferencesSection;
