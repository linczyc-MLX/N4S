/**
 * KYMDocumentation.jsx
 *
 * In-app documentation for the KYM (Know Your Market) module.
 * Updated for BAM v3.0 Dual Scoring System.
 *
 * Tabs:
 * - Overview: BAM explanation, Portfolio Context, Feature Classification
 * - Workflow: Step-by-step guide including Buyer Alignment
 * - Gates: BAM Validation Gates and thresholds
 * - Reference: BAM Terminology definitions
 */

import React, { useState } from 'react';
import './KYMDocumentation.css';

// =============================================================================
// COLLAPSIBLE SECTION COMPONENT
// =============================================================================

const CollapsibleSection = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`kym-doc-collapsible ${isOpen ? 'kym-doc-collapsible--open' : ''}`}>
      <button
        className="kym-doc-collapsible__header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="kym-doc-collapsible__title">{title}</span>
        <span className="kym-doc-collapsible__icon">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="kym-doc-collapsible__content">
          {children}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

const StatusBadge = ({ status }) => {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`kym-doc-status kym-doc-status--${statusClass}`}>
      {status}
    </span>
  );
};

// =============================================================================
// OVERVIEW TAB
// =============================================================================

const OverviewTab = () => (
  <div className="kym-doc-tab-content">
    <p className="kym-doc-intro">
      The KYM (Know Your Market) module provides market intelligence and buyer alignment
      analysis to ensure your design decisions serve both your needs and future resale value.
    </p>

    <CollapsibleSection title="Buyer Alignment Matrix (BAM)" defaultOpen={true}>
      <p>
        BAM v3.0 provides a <strong>dual-lens analysis</strong> of your property design decisions:
      </p>

      <div className="kym-doc-dual-score">
        <div className="kym-doc-score-box kym-doc-score-box--client">
          <h4>Client Satisfaction Score</h4>
          <p className="kym-doc-score-question">
            "Does this design serve YOUR needs and vision?"
          </p>
          <ul>
            <li>Spatial requirements met</li>
            <li>Lifestyle needs fulfilled</li>
            <li>Design aesthetic match</li>
            <li>Location context fit</li>
            <li>Future-proofing provisions</li>
          </ul>
          <p className="kym-doc-score-source">
            <strong>Source:</strong> KYC + FYI + MVP modules
          </p>
        </div>

        <div className="kym-doc-score-box kym-doc-score-box--market">
          <h4>Market Appeal Score</h4>
          <p className="kym-doc-score-question">
            "Will BUYERS want this when you sell?"
          </p>
          <ul>
            <li>Buyer archetype alignment</li>
            <li>Must Have / Nice to Have / Avoid matching</li>
            <li>Market-specific preferences</li>
            <li>Resale positioning</li>
            <li>Competitive differentiation</li>
          </ul>
          <p className="kym-doc-score-source">
            <strong>Source:</strong> KYM + Archetype Profiles
          </p>
        </div>
      </div>

      <div className="kym-doc-threshold-table">
        <h5>Pass/Fail Thresholds</h5>
        <table>
          <thead>
            <tr>
              <th>Score Type</th>
              <th>≥80%</th>
              <th>65-79%</th>
              <th>&lt;65%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Client Satisfaction</td>
              <td><StatusBadge status="PASS" /> Strong Fit</td>
              <td><StatusBadge status="CAUTION" /> Compromises Exist</td>
              <td><StatusBadge status="FAIL" /> Misaligned</td>
            </tr>
            <tr>
              <td>Market Appeal</td>
              <td><StatusBadge status="PASS" /> Strong Appeal</td>
              <td><StatusBadge status="CAUTION" /> Limited Pool</td>
              <td><StatusBadge status="FAIL" /> Hard to Sell</td>
            </tr>
            <tr>
              <td>Combined Score</td>
              <td><StatusBadge status="PASS" /> PASS</td>
              <td><StatusBadge status="CAUTION" /> CAUTION</td>
              <td><StatusBadge status="FAIL" /> FAIL</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Portfolio Context">
      <p>
        Not all clients have the same investment horizon. Portfolio Context adjusts
        the weighting between Client Satisfaction and Market Appeal scores based on
        your intended hold period.
      </p>

      <table className="kym-doc-table">
        <thead>
          <tr>
            <th>Context</th>
            <th>Client Weight</th>
            <th>Market Weight</th>
            <th>Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Forever Home</strong></td>
            <td>70%</td>
            <td>30%</td>
            <td>Legacy property, 15+ years</td>
          </tr>
          <tr>
            <td><strong>Primary Residence</strong></td>
            <td>60%</td>
            <td>40%</td>
            <td>Long-term home, 10-15 years</td>
          </tr>
          <tr>
            <td><strong>Medium Term</strong></td>
            <td>50%</td>
            <td>50%</td>
            <td>Balanced hold, 5-10 years</td>
          </tr>
          <tr>
            <td><strong>Investment</strong></td>
            <td>30%</td>
            <td>70%</td>
            <td>Investment property, &lt;5 years</td>
          </tr>
          <tr>
            <td><strong>Spec Build</strong></td>
            <td>10%</td>
            <td>90%</td>
            <td>Build to sell immediately</td>
          </tr>
        </tbody>
      </table>

      <div className="kym-doc-formula">
        <strong>Combined Score Formula:</strong>
        <code>
          Combined = (Client Score × Client Weight) + (Market Score × Market Weight)
        </code>
        <p className="kym-doc-example">
          Example: 82% Client × 60% + 65% Market × 40% = 49.2 + 26.0 = <strong>75.2%</strong>
        </p>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Feature Classification">
      <p>
        Every design feature is classified into one of four quadrants based on its
        value to you (client) versus its value to future buyers (market).
      </p>

      <div className="kym-doc-quadrants">
        <div className="kym-doc-quadrant kym-doc-quadrant--essential">
          <h5>Essential</h5>
          <p className="kym-doc-quadrant-desc">High Client + High Market</p>
          <p><strong>Action:</strong> Must include</p>
          <ul>
            <li>Quality construction</li>
            <li>Smart home basics</li>
            <li>Modern kitchen</li>
            <li>Primary suite excellence</li>
          </ul>
        </div>

        <div className="kym-doc-quadrant kym-doc-quadrant--differentiating">
          <h5>Differentiating</h5>
          <p className="kym-doc-quadrant-desc">Medium Client + High Market</p>
          <p><strong>Action:</strong> Include if budget allows</p>
          <ul>
            <li>Home theater</li>
            <li>Wine cellar</li>
            <li>Pool house</li>
            <li>Guest house</li>
          </ul>
        </div>

        <div className="kym-doc-quadrant kym-doc-quadrant--personal">
          <h5>Personal</h5>
          <p className="kym-doc-quadrant-desc">High Client + Low Market</p>
          <p><strong>Action:</strong> Include with awareness</p>
          <ul>
            <li>Hobby-specific rooms</li>
            <li>Religious spaces</li>
            <li>Pet facilities</li>
            <li>Collection display</li>
          </ul>
        </div>

        <div className="kym-doc-quadrant kym-doc-quadrant--risky">
          <h5>Risky</h5>
          <p className="kym-doc-quadrant-desc">Low Client + Low Market</p>
          <p><strong>Action:</strong> Avoid or reconsider</p>
          <ul>
            <li>Highly unusual style</li>
            <li>Over-personalization</li>
            <li>Excessive scale</li>
            <li>Dated design choices</li>
          </ul>
        </div>
      </div>
    </CollapsibleSection>
  </div>
);

// =============================================================================
// WORKFLOW TAB
// =============================================================================

const WorkflowTab = () => (
  <div className="kym-doc-tab-content">
    <p className="kym-doc-intro">
      Follow these steps to complete the KYM module and validate buyer alignment.
    </p>

    <CollapsibleSection title="Step 1: Enter Location" defaultOpen={true}>
      <ol className="kym-doc-steps">
        <li>Enter the project address or ZIP code</li>
        <li>Confirm the market area is correct</li>
        <li>Review initial market data loading</li>
      </ol>
    </CollapsibleSection>

    <CollapsibleSection title="Step 2: Review Market Data">
      <ol className="kym-doc-steps">
        <li>Examine comparable property listings</li>
        <li>Review median prices and price/SF metrics</li>
        <li>Note inventory levels and days on market</li>
        <li>Identify market trends</li>
      </ol>
    </CollapsibleSection>

    <CollapsibleSection title="Step 3: Analyze Comparables">
      <ol className="kym-doc-steps">
        <li>Filter properties by relevant criteria</li>
        <li>Compare features across listings</li>
        <li>Identify market expectations for luxury segment</li>
        <li>Note common amenities and features</li>
      </ol>
    </CollapsibleSection>

    <CollapsibleSection title="Step 4: Review Demographics">
      <ol className="kym-doc-steps">
        <li>Examine buyer pool characteristics</li>
        <li>Review income and wealth distributions</li>
        <li>Understand buyer preferences in this market</li>
      </ol>
    </CollapsibleSection>

    <CollapsibleSection title="Step 5: Review Buyer Alignment (BAM v3.0)" defaultOpen={true}>
      <p className="kym-doc-step-intro">
        This critical step validates that your design serves both your needs
        and future resale potential.
      </p>

      <div className="kym-doc-substeps">
        <div className="kym-doc-substep">
          <span className="kym-doc-substep-num">5.1</span>
          <div className="kym-doc-substep-content">
            <strong>Set Portfolio Context slider</strong>
            <p>
              Select your intended hold period (Forever Home → Spec Build) to
              set appropriate score weighting.
            </p>
          </div>
        </div>

        <div className="kym-doc-substep">
          <span className="kym-doc-substep-num">5.2</span>
          <div className="kym-doc-substep-content">
            <strong>Review dual scores</strong>
            <p>
              Check both Client Satisfaction and Market Appeal scores.
              Both should be ≥80% for PASS status.
            </p>
          </div>
        </div>

        <div className="kym-doc-substep">
          <span className="kym-doc-substep-num">5.3</span>
          <div className="kym-doc-substep-content">
            <strong>Examine Buyer Pool breakdown</strong>
            <p>
              Review the top 3 buyer archetypes for your market. Check Must Have /
              Nice to Have / Avoid tables for each archetype.
            </p>
          </div>
        </div>

        <div className="kym-doc-substep">
          <span className="kym-doc-substep-num">5.4</span>
          <div className="kym-doc-substep-content">
            <strong>Check Feature Classification quadrants</strong>
            <p>
              Verify Essential features are included. Review any Risky features
              that may limit buyer pool.
            </p>
          </div>
        </div>

        <div className="kym-doc-substep">
          <span className="kym-doc-substep-num">5.5</span>
          <div className="kym-doc-substep-content">
            <strong>Follow Path to 80% recommendations</strong>
            <p>
              For any archetype below 80%, review specific recommendations to
              improve alignment and maximize market appeal.
            </p>
          </div>
        </div>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Step 6: Generate Report">
      <ol className="kym-doc-steps">
        <li>Click "Generate PDF Report"</li>
        <li>Review all sections for accuracy</li>
        <li>Share with stakeholders as needed</li>
      </ol>
    </CollapsibleSection>
  </div>
);

// =============================================================================
// GATES TAB
// =============================================================================

const GatesTab = () => (
  <div className="kym-doc-tab-content">
    <p className="kym-doc-intro">
      Validation gates ensure the design meets minimum thresholds before
      progressing to subsequent phases.
    </p>

    <CollapsibleSection title="BAM Validation Gates" defaultOpen={true}>
      <p>
        These gates validate buyer alignment before Phase 2 (FYI) progression.
      </p>

      <table className="kym-doc-table kym-doc-table--gates">
        <thead>
          <tr>
            <th>Gate</th>
            <th>Threshold</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Client Satisfaction</strong></td>
            <td>≥80%</td>
            <td>
              <StatusBadge status="PASS" /> / <StatusBadge status="CAUTION" /> / <StatusBadge status="FAIL" />
            </td>
            <td>Review KYC/FYI alignment</td>
          </tr>
          <tr>
            <td><strong>Market Appeal</strong></td>
            <td>≥80%</td>
            <td>
              <StatusBadge status="PASS" /> / <StatusBadge status="CAUTION" /> / <StatusBadge status="FAIL" />
            </td>
            <td>Follow archetype recommendations</td>
          </tr>
          <tr>
            <td><strong>Combined Score</strong></td>
            <td>≥80%</td>
            <td>
              <StatusBadge status="PASS" /> / <StatusBadge status="CAUTION" /> / <StatusBadge status="FAIL" />
            </td>
            <td>Balance client/market priorities</td>
          </tr>
          <tr>
            <td><strong>Essential Features</strong></td>
            <td>8/10 minimum</td>
            <td>Required</td>
            <td>Add missing essentials</td>
          </tr>
          <tr>
            <td><strong>Risky Features</strong></td>
            <td>0-1 maximum</td>
            <td>Warning</td>
            <td>Review or remove risky items</td>
          </tr>
        </tbody>
      </table>

      <div className="kym-doc-warning">
        <strong>Warning:</strong> A Combined Score below 65% blocks Phase 2
        progression. Address critical gaps before continuing.
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Score Status Definitions">
      <div className="kym-doc-status-defs">
        <div className="kym-doc-status-def">
          <StatusBadge status="PASS" />
          <p>Score ≥80% — Design strongly aligned with requirements</p>
        </div>
        <div className="kym-doc-status-def">
          <StatusBadge status="CAUTION" />
          <p>Score 65-79% — Some compromises exist, review recommended</p>
        </div>
        <div className="kym-doc-status-def">
          <StatusBadge status="FAIL" />
          <p>Score &lt;65% — Significant misalignment, action required</p>
        </div>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Gate Override Policy">
      <p>
        Gates can be overridden by authorized advisors in specific circumstances:
      </p>
      <ul className="kym-doc-list">
        <li>Client explicitly acknowledges trade-offs in writing</li>
        <li>Portfolio Context is "Forever Home" with minimal resale concern</li>
        <li>Market-specific factors justify deviation (documented)</li>
        <li>Senior advisor approval obtained</li>
      </ul>
      <p className="kym-doc-note">
        All overrides are logged and included in the final report.
      </p>
    </CollapsibleSection>
  </div>
);

// =============================================================================
// REFERENCE TAB
// =============================================================================

const ReferenceTab = () => (
  <div className="kym-doc-tab-content">
    <p className="kym-doc-intro">
      Key terminology and definitions used in the BAM v3.0 dual scoring system.
    </p>

    <CollapsibleSection title="BAM Terminology" defaultOpen={true}>
      <dl className="kym-doc-definitions">
        <dt>Client Satisfaction Score</dt>
        <dd>
          A score (0-100) measuring how well the planned design serves the client's
          stated needs, preferences, and lifestyle requirements. Answers: "Will YOU
          be happy living here?"
        </dd>

        <dt>Market Appeal Score</dt>
        <dd>
          A score (0-100) measuring how well the planned design will appeal to likely
          buyers in the target market. Answers: "Will this SELL when the time comes?"
        </dd>

        <dt>Combined Score</dt>
        <dd>
          The weighted average of Client Satisfaction and Market Appeal scores,
          calculated based on Portfolio Context. Formula: (Client × Client Weight) +
          (Market × Market Weight).
        </dd>

        <dt>Portfolio Context</dt>
        <dd>
          The client's intended hold period and investment strategy, which determines
          the weighting between Client Satisfaction and Market Appeal in the Combined Score.
        </dd>

        <dt>Buyer Archetype</dt>
        <dd>
          A profile representing a typical buyer segment in the luxury market
          (e.g., Tech Executive, Entertainment Executive, Finance Executive).
          Each archetype has specific Must Haves, Nice to Haves, and Avoids.
        </dd>

        <dt>Must Haves (50 points)</dt>
        <dd>
          Required features for each buyer archetype. 5 requirements × 10 points each.
          Full match = 10 pts, Partial = 5 pts, None = 0 pts.
        </dd>

        <dt>Nice to Haves (35 points)</dt>
        <dd>
          Desirable but not required features. 5 features × 7 points each.
          Full match = 7 pts, Partial = 3.5 pts, None = 0 pts.
        </dd>

        <dt>Avoids (Penalties)</dt>
        <dd>
          Features or characteristics that negatively impact appeal to an archetype.
          Each triggered avoid applies a penalty of -5 to -15 points.
        </dd>

        <dt>Path to 80%</dt>
        <dd>
          Specific recommendations to improve an archetype score from current level
          to the 80% PASS threshold. Shows required point gains and suggested actions.
        </dd>

        <dt>Feature Classification</dt>
        <dd>
          A system categorizing design features into four quadrants based on client
          value vs. market value: Essential, Differentiating, Personal, and Risky.
        </dd>
      </dl>
    </CollapsibleSection>

    <CollapsibleSection title="Buyer Archetype Reference">
      <table className="kym-doc-table">
        <thead>
          <tr>
            <th>Archetype</th>
            <th>Key Must Haves</th>
            <th>Key Avoids</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Tech Executive</strong></td>
            <td>Smart Home, Office, Contemporary</td>
            <td>Traditional, HOA restrictions</td>
          </tr>
          <tr>
            <td><strong>Entertainment Executive</strong></td>
            <td>Screening Room, Privacy, Chef's Kitchen</td>
            <td>Minimalist, Compact footprint</td>
          </tr>
          <tr>
            <td><strong>Finance Executive</strong></td>
            <td>Library, Traditional, Formal Dining</td>
            <td>Modern/Minimalist, Remote location</td>
          </tr>
          <tr>
            <td><strong>International Investor</strong></td>
            <td>Security, Staff Quarters, Guest Suites</td>
            <td>Compact size, Limited privacy</td>
          </tr>
          <tr>
            <td><strong>Sports Professional</strong></td>
            <td>Gym 1000+ SF, Recovery Suite, Privacy</td>
            <td>Traditional, Small gym</td>
          </tr>
          <tr>
            <td><strong>Generational Wealth</strong></td>
            <td>Guest House, Estate, 6+ Bedrooms</td>
            <td>Modern, Single structure</td>
          </tr>
          <tr>
            <td><strong>Wellness Pioneer</strong></td>
            <td>Spa Suite, Natural Materials</td>
            <td>Urban location, Artificial materials</td>
          </tr>
        </tbody>
      </table>
    </CollapsibleSection>

    <CollapsibleSection title="Market Buyer Pool Reference">
      <table className="kym-doc-table kym-doc-table--compact">
        <thead>
          <tr>
            <th>Market</th>
            <th>#1 Archetype</th>
            <th>#2 Archetype</th>
            <th>#3 Archetype</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Malibu, CA</td>
            <td>Entertainment (35%)</td>
            <td>Tech (28%)</td>
            <td>Sports (18%)</td>
          </tr>
          <tr>
            <td>Beverly Hills, CA</td>
            <td>Entertainment (30%)</td>
            <td>Tech (25%)</td>
            <td>International (20%)</td>
          </tr>
          <tr>
            <td>Aspen, CO</td>
            <td>Generational (30%)</td>
            <td>Finance (25%)</td>
            <td>Sports (20%)</td>
          </tr>
          <tr>
            <td>Greenwich, CT</td>
            <td>Finance (40%)</td>
            <td>Family Office (25%)</td>
            <td>Generational (20%)</td>
          </tr>
          <tr>
            <td>Palm Beach, FL</td>
            <td>International (35%)</td>
            <td>Finance (30%)</td>
            <td>Generational (25%)</td>
          </tr>
          <tr>
            <td>Hamptons, NY</td>
            <td>Finance (35%)</td>
            <td>Entertainment (25%)</td>
            <td>Tech (20%)</td>
          </tr>
        </tbody>
      </table>
    </CollapsibleSection>
  </div>
);

// =============================================================================
// MAIN DOCUMENTATION COMPONENT
// =============================================================================

const KYMDocumentation = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'gates', label: 'Gates' },
    { id: 'reference', label: 'Reference' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'workflow':
        return <WorkflowTab />;
      case 'gates':
        return <GatesTab />;
      case 'reference':
        return <ReferenceTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="kym-doc-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="kym-doc-panel">
        <div className="kym-doc-header">
          <div className="kym-doc-header__title">
            <h2>KYM Documentation</h2>
            <span className="kym-doc-header__subtitle">
              Know Your Market — BAM v3.0 Dual Scoring
            </span>
          </div>
          {onClose && (
            <button className="kym-doc-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </div>

        <div className="kym-doc-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`kym-doc-tab ${activeTab === tab.id ? 'kym-doc-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="kym-doc-body">
          {renderTabContent()}
        </div>

        <div className="kym-doc-footer">
          <span className="kym-doc-version">BAM v3.0 — January 2026</span>
        </div>
      </div>
    </div>
  );
};

export default KYMDocumentation;
