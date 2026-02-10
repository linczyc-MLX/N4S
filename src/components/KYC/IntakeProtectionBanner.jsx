import React from 'react';
import { Shield, ShieldOff, Clock, User } from 'lucide-react';

/**
 * IntakeProtectionBanner
 * 
 * Displays at the top of KYC sections when intake questionnaire data exists.
 * Shows intake completion status and provides admin override toggle.
 * 
 * When intake is completed:
 *   - Fields are read-only by default (client data is the source of truth)
 *   - Admin can toggle override to edit individual fields
 *   - Overridden fields are tracked in _overrides metadata
 */
const IntakeProtectionBanner = ({ 
  intakeStatus, 
  intakeCompletedAt,
  overrideMode, 
  onToggleOverride,
  sectionLabel = 'this section',
}) => {
  // Only show when intake has been sent or completed
  if (!intakeStatus || intakeStatus === 'not_sent') return null;

  const isCompleted = intakeStatus === 'completed';
  const isInProgress = intakeStatus === 'in_progress' || intakeStatus === 'sent';

  const completedDate = intakeCompletedAt 
    ? new Date(intakeCompletedAt).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      })
    : null;

  return (
    <div style={{
      marginBottom: '16px',
      borderRadius: '8px',
      border: `1px solid ${isCompleted ? (overrideMode ? '#b45309' : '#065f46') : '#1e3a5f'}`,
      background: isCompleted ? (overrideMode ? 'rgba(180, 83, 9, 0.08)' : 'rgba(6, 95, 70, 0.08)') : 'rgba(30, 58, 95, 0.08)',
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isCompleted ? (
            overrideMode ? (
              <ShieldOff size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            ) : (
              <Shield size={18} style={{ color: '#10b981', flexShrink: 0 }} />
            )
          ) : (
            <Clock size={18} style={{ color: '#60a5fa', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: isCompleted ? (overrideMode ? '#f59e0b' : '#6ee7b7') : '#93c5fd',
              letterSpacing: '0.03em',
            }}>
              {isCompleted 
                ? (overrideMode ? 'ADMIN OVERRIDE ACTIVE' : 'CLIENT DATA — READ ONLY')
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
              border: `1px solid ${overrideMode ? '#065f46' : '#b45309'}`,
              background: overrideMode ? 'rgba(6, 95, 70, 0.15)' : 'rgba(180, 83, 9, 0.15)',
              color: overrideMode ? '#6ee7b7' : '#fbbf24',
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
