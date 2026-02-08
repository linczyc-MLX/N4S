import React, { useState } from 'react';
import { Plus, X, Info, Send, Clock, CheckCircle, RefreshCw, ClipboardList } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';

const PortfolioContextSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData, clientData, saveNow } = useAppContext();
  const data = kycData[respondent].portfolioContext;

  // KYC Intake integration state
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeError, setIntakeError] = useState(null);
  const [intakeRefreshing, setIntakeRefreshing] = useState(false);

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

  // KYC Intake status (stored in portfolioContext)
  const intakeStatus = data.intakeStatus || 'not_sent'; // not_sent, sent, in_progress, completed
  const intakeSessionId = data.intakeSessionId;
  const intakeSentAt = data.intakeSentAt;
  const intakeCompletedAt = data.intakeCompletedAt;

  // Get stakeholder info for intake send
  const intakePrincipalName = data.principalFirstName
    ? `${data.principalFirstName} ${data.principalLastName || ''}`.trim()
    : null;
  const intakePrincipalEmail = data.principalEmail;
  const intakeProjectName = clientData?.projectName || 'Untitled Project';
  const canSendIntake = intakePrincipalName && intakePrincipalEmail;

  // Generate subdomain slug
  const intakeSlug = data.principalFirstName && data.principalLastName
    ? `${data.principalFirstName.charAt(0).toLowerCase()}${data.principalLastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : 'client';

  // Handle sending KYC Intake invitation
  const handleSendIntake = async () => {
    if (!canSendIntake) return;

    setIntakeLoading(true);
    setIntakeError(null);

    try {
      // Save current data first
      if (saveNow) await saveNow();

      const response = await fetch('https://luxebrief.not-4.sale/api/sessions/from-n4s', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer luxebrief-admin-2024'
        },
        body: JSON.stringify({
          sessionType: 'intake',
          clientName: intakePrincipalName,
          clientEmail: intakePrincipalEmail,
          projectName: intakeProjectName,
          principalType: 'principal',
          subdomain: intakeSlug,
          n4sProjectId: clientData?.id || null,
        })
      });

      const result = await response.json();

      if (response.ok) {
        updateKYCData(respondent, 'portfolioContext', {
          intakeStatus: 'sent',
          intakeSessionId: result.sessionId,
          intakeSentAt: new Date().toISOString(),
          intakeInvitationUrl: result.invitationUrl,
        });
      } else {
        setIntakeError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setIntakeError('Network error — please check your connection');
    } finally {
      setIntakeLoading(false);
    }
  };

  // Handle refreshing intake status
  const handleRefreshIntakeStatus = async () => {
    if (!intakeSessionId) return;

    setIntakeRefreshing(true);
    try {
      const response = await fetch(`https://luxebrief.not-4.sale/api/sessions/${intakeSessionId}`, {
        headers: { 'Authorization': 'Bearer luxebrief-admin-2024' }
      });

      if (response.ok) {
        const session = await response.json();
        const newStatus = session.status === 'completed' ? 'completed' : 'in_progress';

        updateKYCData(respondent, 'portfolioContext', {
          intakeStatus: newStatus,
          intakeCompletedAt: session.completedAt || null,
        });
      }
    } catch (err) {
      console.error('Failed to refresh intake status:', err);
    } finally {
      setIntakeRefreshing(false);
    }
  };

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

      {/* KYC Client Intake Integration Panel */}
      {isPrincipal && (
        <div className="kyc-section__group kyc-section__group--integration">
          <div className="kyc-section__group-header">
            <h3 className="kyc-section__group-title">
              <ClipboardList size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Client Intake Questionnaire
            </h3>
            <span className="kyc-section__badge" style={{
              background: intakeStatus === 'completed' ? '#065f46' :
                         intakeStatus === 'in_progress' ? '#92400e' :
                         intakeStatus === 'sent' ? '#1e3a5f' : '#374151',
              color: intakeStatus === 'completed' ? '#6ee7b7' :
                     intakeStatus === 'in_progress' ? '#fcd34d' :
                     intakeStatus === 'sent' ? '#93c5fd' : '#9ca3af',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              {intakeStatus === 'completed' ? 'Completed' :
               intakeStatus === 'in_progress' ? 'In Progress' :
               intakeStatus === 'sent' ? 'Sent' : 'Not Sent'}
            </span>
          </div>

          <p className="kyc-section__group-description" style={{ marginBottom: '16px' }}>
            Send the KYC sections P1.A.1–A.4 to the client as a guided questionnaire. The client completes
            their portion through the LuXeBrief portal, and responses flow directly back here.
          </p>

          {intakeError && (
            <div className="kyc-section__notice kyc-section__notice--error" style={{ marginBottom: '12px' }}>
              <Info size={16} />
              <span>{intakeError}</span>
            </div>
          )}

          {intakeStatus === 'not_sent' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {canSendIntake ? (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                      <strong>{intakePrincipalName}</strong>
                      <span style={{ color: '#9ca3af', marginLeft: '8px' }}>{intakePrincipalEmail}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn--primary"
                    onClick={handleSendIntake}
                    disabled={intakeLoading}
                    style={{ minWidth: '140px' }}
                  >
                    {intakeLoading ? (
                      <><RefreshCw size={14} className="spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Send Intake</>
                    )}
                  </button>
                </>
              ) : (
                <div className="kyc-section__notice kyc-section__notice--warning">
                  <Info size={16} />
                  <span>
                    Configure the Principal's name and email in <strong>Settings</strong> before sending.
                  </span>
                </div>
              )}
            </div>
          )}

          {(intakeStatus === 'sent' || intakeStatus === 'in_progress') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Clock size={14} style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24' }}>
                    {intakeStatus === 'sent' ? 'Awaiting client response' : 'Client is completing questionnaire'}
                  </span>
                </div>
                {intakeSentAt && (
                  <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', display: 'block' }}>
                    Sent {new Date(intakeSentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
              <button
                className="btn btn--secondary btn--sm"
                onClick={handleRefreshIntakeStatus}
                disabled={intakeRefreshing}
                style={{ minWidth: '120px' }}
              >
                {intakeRefreshing ? (
                  <><RefreshCw size={14} className="spin" /> Checking...</>
                ) : (
                  <><RefreshCw size={14} /> Refresh Status</>
                )}
              </button>
            </div>
          )}

          {intakeStatus === 'completed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <CheckCircle size={16} style={{ color: '#34d399' }} />
              <span style={{ color: '#34d399' }}>
                Client intake completed
                {intakeCompletedAt && (
                  <span style={{ color: '#6b7280', marginLeft: '6px' }}>
                    ({new Date(intakeCompletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                  </span>
                )}
              </span>
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
