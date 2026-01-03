/**
 * BridgePanel Component
 */

import React from 'react';
import type { BridgeConfig } from '../../shared/schema';
import type { ValidationContext } from '../../server/kyc-integration';

export interface BridgePanelProps {
  bridgeConfig: BridgeConfig;
  onToggle: (bridge: keyof BridgeConfig) => void;
  kycContext?: ValidationContext;
}

interface BridgeInfo {
  key: keyof BridgeConfig;
  name: string;
  description: string;
  trigger: string;
  spaceAdded: string;
  sfImpact: number;
}

const BRIDGE_INFO: BridgeInfo[] = [
  {
    key: 'butlerPantry',
    name: 'Butler Pantry',
    description: 'Service corridor between kitchen and formal dining that allows staff to plate, garnish, and serve without crossing guest sightlines.',
    trigger: 'Monthly+ entertaining OR Formal privacy posture OR Catering support',
    spaceAdded: 'BUTLER (Butler Pantry)',
    sfImpact: 120
  },
  {
    key: 'guestAutonomy',
    name: 'Guest Autonomy Node',
    description: 'Self-contained guest zone with independent entry, kitchenette, and living area for extended stays.',
    trigger: 'Multi-family hosting OR Vacation/Winter typology OR Extended guest stays',
    spaceAdded: 'GSL1 expansion with kitchenette',
    sfImpact: 150
  },
  {
    key: 'soundLock',
    name: 'Sound Lock Vestibule',
    description: 'Double-door acoustic buffer between media room and bedroom wing for late-night use.',
    trigger: 'Late-night media use enabled OR Recording studio OR Music room',
    spaceAdded: 'SNDLCK (Sound Lock)',
    sfImpact: 60
  },
  {
    key: 'wetFeetIntercept',
    name: 'Wet-Feet Intercept',
    description: 'Transition zone with drainage, towel storage, and outdoor shower between pool area and main house.',
    trigger: 'Any pool/spa program OR Pool entertainment enabled',
    spaceAdded: 'WETFT (Pool Vestibule)',
    sfImpact: 80
  },
  {
    key: 'opsCore',
    name: 'Operations Core',
    description: 'Dedicated hub for staff operations including secure package receipt, deliveries staging, and housekeeping coordination.',
    trigger: 'Any staffing level above none OR Heavy package volume OR Enhanced security',
    spaceAdded: 'OPSCORE (Operations Core)',
    sfImpact: 150
  }
];

export function BridgePanel({ bridgeConfig, onToggle, kycContext }: BridgePanelProps) {
  const totalBridgeSF = BRIDGE_INFO.reduce((sum, bridge) => {
    return bridgeConfig[bridge.key] ? sum + bridge.sfImpact : sum;
  }, 0);

  const activeBridgeCount = Object.values(bridgeConfig).filter(Boolean).length;

  return (
    <div className="bridge-panel">
      <header className="panel-header">
        <h2>Operational Bridges</h2>
        <p className="panel-description">
          Bridges are specialized spaces that connect different zones while maintaining
          separation and functionality. They are triggered by specific lifestyle requirements.
        </p>
      </header>

      <div className="bridge-summary">
        <div className="summary-stat">
          <span className="stat-value">{activeBridgeCount}</span>
          <span className="stat-label">Active Bridges</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{totalBridgeSF.toLocaleString()}</span>
          <span className="stat-label">Bridge SF</span>
        </div>
      </div>

      <div className="bridge-cards">
        {BRIDGE_INFO.map(bridge => {
          const isActive = bridgeConfig[bridge.key];
          const wasTriggeredByKYC = kycContext?.bridgeConfig?.[bridge.key];

          return (
            <div
              key={bridge.key}
              className={`bridge-card ${isActive ? 'active' : 'inactive'}`}
            >
              <div className="bridge-header">
                <h3>{bridge.name}</h3>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onToggle(bridge.key)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <p className="bridge-description">{bridge.description}</p>

              <div className="bridge-meta">
                <div className="meta-item">
                  <strong>Trigger:</strong>
                  <span>{bridge.trigger}</span>
                </div>
                <div className="meta-item">
                  <strong>Adds:</strong>
                  <span>{bridge.spaceAdded}</span>
                </div>
                <div className="meta-item">
                  <strong>SF Impact:</strong>
                  <span>+{bridge.sfImpact} SF</span>
                </div>
              </div>

              {wasTriggeredByKYC && (
                <div className="kyc-triggered">
                  ✓ Triggered by client requirements
                </div>
              )}

              {isActive && !wasTriggeredByKYC && (
                <div className="manually-enabled">
                  ✎ Manually enabled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {kycContext?.warnings && kycContext.warnings.length > 0 && (
        <div className="bridge-warnings">
          <h4>⚠ Configuration Warnings</h4>
          <ul>
            {kycContext.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BridgePanel;
