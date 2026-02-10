import React from 'react';
import { Shield, ShieldOff, Clock } from 'lucide-react';

/**
 * IntakeProtectionBanner
 * 
 * Shows at the top of KYC sections when intake questionnaire data exists.
 * Fields lock to read-only when intake is completed. Admin can override.
 * 
 * Brand colours: Navy #1e3a5f, Gold #c9a227
 */
const IntakeProtectionBanner = ({ 
  intakeStatus, 
  intakeCompletedAt,
  overrideMode, 
  onToggleOverride,
  sectionLabel = 'this section',
}) => {
  if (!intakeStatus || intakeStatus === 'not_sent') return null;

  const isCompleted = intakeStatus === 'completed';

  const completedDate = intakeCompletedAt 
    ? new Date(intakeCompletedAt).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      })
    : null;

  return (
    <div style={{
      marginBottom: '16px',
      borderRadius: '8px',
      border: `1px solid ${isCompleted ? (overrideMode ? '#c9a227' : '#1e3a5f') : '#1e3a5f'}`,
      background: isCompleted ? (overrideMode ? 'rgba(201, 162, 39, 0.08)' : 'rgba(30, 58, 95, 0.08)') : 'rgba(30, 58, 95, 0.08)',
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isCompleted ? (
            overrideMode ? (
              <ShieldOff size={18} style={{ color: '#c9a227', flexShrink: 0 }} />
            ) : (
              <Shield size={18} style={{ color: '#93c5fd', flexShrink: 0 }} />
            )
          ) : (
            <Clock size={18} style={{ color: '#93c5fd', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: isCompleted ? (overrideMode ? '#c9a227' : '#93c5fd') : '#93c5fd',
              letterSpacing: '0.03em',
            }}>
              {isCompleted 
                ? (overrideMode ? 'ADMIN OVERRIDE ACTIVE' : 'CLIENT DATA \u2014 READ ONLY')
                : 'INTAKE IN PROGRESS'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              {isCompleted 
                ? (overrideMode 
                    ? `Editing ${sectionLabel}. Changes will be flagged as admin overrides.`
                    : `Completed by client${completedDate ? ` on ${completedDate}` : ''}. Data is protected.`)
                : 'Client is currently completing the questionnaire. Fields will lock on completion.'}
            </div>
          </div>
        </div>
        
        {isCompleted && (
          <button
            onClick={onToggleOverride}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${overrideMode ? '#1e3a5f' : '#c9a227'}`,
              background: overrideMode ? 'rgba(30, 58, 95, 0.15)' : 'rgba(201, 162, 39, 0.15)',
              color: overrideMode ? '#93c5fd' : '#c9a227',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.03em',
            }}
          >
            {overrideMode ? (
              <>
                <Shield size={13} />
                Lock Fields
              </>
            ) : (
              <>
                <ShieldOff size={13} />
                Admin Override
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default IntakeProtectionBanner;
