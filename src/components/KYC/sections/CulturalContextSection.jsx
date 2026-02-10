import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import IntakeProtectionBanner from '../IntakeProtectionBanner';

const CulturalContextSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].culturalContext;
  const [overrideMode, setOverrideMode] = useState(false);

  // Intake protection
  const portfolioContext = kycData[respondent].portfolioContext || {};
  const intakeStatus = portfolioContext.intakeStatus || 'not_sent';
  const intakeCompletedAt = portfolioContext.intakeCompletedAt;
  const isLocked = intakeStatus === 'completed' && !overrideMode;

  const handleChange = (field, value) => {
    if (isLocked) return;
    updateKYCData(respondent, 'culturalContext', { [field]: value });
  };

  const regionalOptions = [
    { value: 'middle-east', label: 'Middle Eastern' },
    { value: 'south-asian', label: 'South Asian' },
    { value: 'east-asian', label: 'East Asian' },
    { value: 'european', label: 'European' },
    { value: 'latin', label: 'Latin American' },
    { value: 'american', label: 'North American' },
    { value: 'african', label: 'African' },
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'hindi', label: 'Hindi' },
  ];

  const toggleOption = (field, option) => {
    if (isLocked) return;
    const current = data[field] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    handleChange(field, updated);
  };

  return (
    <div className="kyc-section">
      <IntakeProtectionBanner
        intakeStatus={intakeStatus}
        intakeCompletedAt={intakeCompletedAt}
        overrideMode={overrideMode}
        onToggleOverride={() => setOverrideMode(!overrideMode)}
        sectionLabel="Cultural Context"
      />
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Cultural Background</h3>
        <p className="kyc-section__group-description">
          Understanding your cultural context helps us match you with designers who appreciate your heritage and can integrate appropriate elements.
        </p>
        
        <FormField
          label="Cultural Heritage / Background"
          value={data.culturalBackground}
          onChange={(v) => handleChange('culturalBackground', v)}
          placeholder="e.g., Saudi Arabian, Indian-American, French-Moroccan..."
          readOnly={isLocked}
        />

        <div className="form-field">
          <label className="form-field__label" style={isLocked ? { opacity: 0.7 } : {}}>Regional Sensibilities</label>
          {isLocked ? (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              color: (data.regionalSensibilities || []).length > 0 ? '#e5e7eb' : '#6b7280',
              fontSize: '13px',
              fontStyle: (data.regionalSensibilities || []).length > 0 ? 'normal' : 'italic',
            }}>
              {(data.regionalSensibilities || []).length > 0
                ? (data.regionalSensibilities || []).map(v => regionalOptions.find(r => r.value === v)?.label || v).join(', ')
                : '—'}
            </div>
          ) : (
            <>
              <p className="form-field__help" style={{ marginBottom: '12px' }}>
                Select regional design influences that resonate with you
              </p>
              <div className="chip-select">
                {regionalOptions.map(region => (
                  <button
                    key={region.value}
                    className={`chip ${(data.regionalSensibilities || []).includes(region.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('regionalSensibilities', region.value)}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Religious & Cultural Observances</h3>
        
        <FormField
          label="Religious Observances"
          type="textarea"
          value={data.religiousObservances}
          onChange={(v) => handleChange('religiousObservances', v)}
          placeholder="Any spatial requirements? e.g., Prayer room facing Mecca, kosher kitchen, separate entertaining spaces..."
          rows={2}
          readOnly={isLocked}
        />

        <FormField
          label="Entertaining Cultural Norms"
          value={data.entertainingCulturalNorms}
          onChange={(v) => handleChange('entertainingCulturalNorms', v)}
          placeholder="e.g., Formal service with staff, family-style dining, gender-separated entertaining..."
          readOnly={isLocked}
        />
      </div>

      {tier === 'fyi-extended' && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Cross-Cultural & Communication</h3>
          
          <FormField
            label="Cross-Cultural Requirements"
            type="textarea"
            value={data.crossCulturalRequirements}
            onChange={(v) => handleChange('crossCulturalRequirements', v)}
            placeholder="If blending multiple cultural influences, describe how..."
            rows={2}
            readOnly={isLocked}
          />

          <div className="form-field">
            <label className="form-field__label">Preferred Languages for Design Team</label>
            <div className="chip-select">
              {languageOptions.map(lang => (
                <button
                  key={lang.value}
                  className={`chip ${(data.languagesPreferred || []).includes(lang.value) ? 'chip--selected' : ''}`}
                  onClick={() => toggleOption('languagesPreferred', lang.value)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalContextSection;
