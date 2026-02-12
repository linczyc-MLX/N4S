/**
 * KYMDocumentation.jsx
 *
 * In-app documentation for the KYM (Know Your Market) module.
 * Updated for BAM v3.0 Dual Scoring System.
 *
 * REFORMATTED to match N4S standard documentation pattern (KYC, FYI style).
 *
 * Tabs:
 * - Overview: BAM explanation, Portfolio Context, Feature Classification
 * - Workflow: Step-by-step guide including Buyer Alignment
 * - Gates: BAM Validation Gates and thresholds
 * - Reference: BAM Terminology definitions
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Target,
  Users,
  TrendingUp,
  Info
} from 'lucide-react';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
  error: '#d32f2f',
};

/**
 * Expandable Section Component (matches KYC/FYI pattern)
 */
function ExpandableSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="doc-expandable">
      <button
        className="doc-expandable-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <span>{title}</span>
      </button>
      {isOpen && (
        <div className="doc-expandable-content">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`doc-status doc-status--${statusClass}`}>
      {status}
    </span>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">What is KYM?</h2>
        <p className="doc-paragraph">
          The KYM (Know Your Market) module provides market intelligence and buyer alignment
          analysis to ensure your design decisions serve both your needs and future resale value.
        </p>
      </div>

      <ExpandableSection title="Buyer Alignment Matrix (BAM)" defaultOpen={true}>
        <p className="doc-paragraph">
          BAM v3.0 provides a <strong>dual-lens analysis</strong> of your property design decisions:
        </p>

        <div className="doc-dual-score">
          <div className="doc-score-box doc-score-box--client">
            <h4>Client Satisfaction Score</h4>
            <p className="doc-score-question">
              "Does this design serve YOUR needs and vision?"
            </p>
            <ul className="doc-score-list">
              <li>Spatial requirements met</li>
              <li>Lifestyle needs fulfilled</li>
              <li>Design aesthetic match</li>
              <li>Location context fit</li>
              <li>Future-proofing provisions</li>
            </ul>
            <p className="doc-score-source">
              <strong>Source:</strong> KYC + FYI + MVP modules
            </p>
          </div>

          <div className="doc-score-box doc-score-box--market">
            <h4>Market Appeal Score</h4>
            <p className="doc-score-question">
              "Will BUYERS want this when you sell?"
            </p>
            <ul className="doc-score-list">
              <li>Buyer archetype alignment</li>
              <li>Must Have / Nice to Have / Avoid matching</li>
              <li>Market-specific preferences</li>
              <li>Resale positioning</li>
              <li>Competitive differentiation</li>
            </ul>
            <p className="doc-score-source">
              <strong>Source:</strong> KYM + Archetype Profiles
            </p>
          </div>
        </div>

        <div className="doc-threshold-section">
          <h5>Pass/Fail Thresholds</h5>
          <div className="doc-threshold-table">
            <div className="doc-threshold-row doc-threshold-row--header">
              <span>Score Type</span>
              <span>≥80%</span>
              <span>65-79%</span>
              <span>&lt;65%</span>
            </div>
            <div className="doc-threshold-row">
              <span>Client Satisfaction</span>
              <span><StatusBadge status="PASS" /> Strong Fit</span>
              <span><StatusBadge status="CAUTION" /> Compromises Exist</span>
              <span><StatusBadge status="FAIL" /> Misaligned</span>
            </div>
            <div className="doc-threshold-row">
              <span>Market Appeal</span>
              <span><StatusBadge status="PASS" /> Strong Appeal</span>
              <span><StatusBadge status="CAUTION" /> Limited Pool</span>
              <span><StatusBadge status="FAIL" /> Hard to Sell</span>
            </div>
            <div className="doc-threshold-row">
              <span>Combined Score</span>
              <span><StatusBadge status="PASS" /> PASS</span>
              <span><StatusBadge status="CAUTION" /> CAUTION</span>
              <span><StatusBadge status="FAIL" /> FAIL</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Portfolio Context">
        <p className="doc-paragraph">
          Not all clients have the same investment horizon. Portfolio Context adjusts
          the weighting between Client Satisfaction and Market Appeal scores based on
          your intended hold period.
        </p>

        <div className="doc-context-table">
          <div className="doc-context-row doc-context-row--header">
            <span>Context</span>
            <span>Client Weight</span>
            <span>Market Weight</span>
            <span>Use Case</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Forever Home</strong></span>
            <span>70%</span>
            <span>30%</span>
            <span>Legacy property, 15+ years</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Primary Residence</strong></span>
            <span>60%</span>
            <span>40%</span>
            <span>Long-term home, 10-15 years</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Medium Term</strong></span>
            <span>50%</span>
            <span>50%</span>
            <span>Balanced hold, 5-10 years</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Investment</strong></span>
            <span>30%</span>
            <span>70%</span>
            <span>Investment property, &lt;5 years</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Spec Build</strong></span>
            <span>10%</span>
            <span>90%</span>
            <span>Build to sell immediately</span>
          </div>
        </div>

        <div className="doc-formula">
          <strong>Combined Score Formula:</strong>
          <code>
            Combined = (Client Score × Client Weight) + (Market Score × Market Weight)
          </code>
          <p className="doc-example">
            Example: 82% Client × 60% + 65% Market × 40% = 49.2 + 26.0 = <strong>75.2%</strong>
          </p>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Feature Classification">
        <p className="doc-paragraph">
          Every design feature is classified into one of four quadrants based on its
          value to you (client) versus its value to future buyers (market).
        </p>

        <div className="doc-quadrants">
          <div className="doc-quadrant doc-quadrant--essential">
            <h5>Essential</h5>
            <p className="doc-quadrant-desc">High Client + High Market</p>
            <p><strong>Action:</strong> Must include</p>
            <ul>
              <li>Quality construction</li>
              <li>Smart home basics</li>
              <li>Modern kitchen</li>
              <li>Primary suite excellence</li>
            </ul>
          </div>

          <div className="doc-quadrant doc-quadrant--differentiating">
            <h5>Differentiating</h5>
            <p className="doc-quadrant-desc">Medium Client + High Market</p>
            <p><strong>Action:</strong> Include if budget allows</p>
            <ul>
              <li>Home theater</li>
              <li>Wine cellar</li>
              <li>Pool house</li>
              <li>Guest house</li>
            </ul>
          </div>

          <div className="doc-quadrant doc-quadrant--personal">
            <h5>Personal</h5>
            <p className="doc-quadrant-desc">High Client + Low Market</p>
            <p><strong>Action:</strong> Include with awareness</p>
            <ul>
              <li>Hobby-specific rooms</li>
              <li>Religious spaces</li>
              <li>Pet facilities</li>
              <li>Collection display</li>
            </ul>
          </div>

          <div className="doc-quadrant doc-quadrant--risky">
            <h5>Risky</h5>
            <p className="doc-quadrant-desc">Low Client + Low Market</p>
            <p><strong>Action:</strong> Avoid or reconsider</p>
            <ul>
              <li>Highly unusual style</li>
              <li>Over-personalization</li>
              <li>Excessive scale</li>
              <li>Dated design choices</li>
            </ul>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}

// =============================================================================
// WORKFLOW TAB
// =============================================================================

function WorkflowTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">KYM Workflow</h2>
        <p className="doc-paragraph">
          The KYM module contains 5 tabs: <strong>Market Analysis</strong>, <strong>Comparable
          Properties</strong>, <strong>Land Acquisition</strong>, <strong>Demographics</strong>,
          and <strong>Buyer Alignment (BAM)</strong>. Follow these steps to complete each section
          and validate buyer alignment.
        </p>
      </div>

      <ExpandableSection title="Step 1: Enter Location" defaultOpen={true}>
        <ol className="doc-steps">
          <li>Enter the project address or ZIP code</li>
          <li>Confirm the market area is correct</li>
          <li>Review initial market data loading</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 2: Review Market Data">
        <ol className="doc-steps">
          <li>Examine comparable property listings</li>
          <li>Review median prices and price/SF metrics</li>
          <li>Note inventory levels and days on market</li>
          <li>Identify market trends</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 3: Land Acquisition Search" defaultOpen={false}>
        <p>Search for available land parcels and lots in your target area using live Realtor.com
        data. Filter by price range, acreage, and property type. Parcels of interest can be added
        to the KYS Site Library for formal site assessment.</p>
        <ol className="doc-steps">
          <li>Enter ZIP code or location for the search area</li>
          <li>Set price range and minimum acreage filters</li>
          <li>Review listings with price, acreage, and location details</li>
          <li>Click "Add to KYS Library" to export parcels for site assessment</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 4: Analyze Comparables">
        <ol className="doc-steps">
          <li>Filter properties by relevant criteria</li>
          <li>Compare features across listings</li>
          <li>Identify market expectations for luxury segment</li>
          <li>Note common amenities and features</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 5: Review Demographics">
        <ol className="doc-steps">
          <li>Examine buyer pool characteristics</li>
          <li>Review income and wealth distributions</li>
          <li>Understand buyer preferences in this market</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 6: Review Buyer Alignment (BAM v3.0)" defaultOpen={true}>
        <div className="doc-step-intro">
          <Info size={16} />
          <span>This critical step validates that your design serves both your needs
          and future resale potential.</span>
        </div>

        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">6.1</span>
            <div className="doc-substep-content">
              <strong>Set Portfolio Context slider</strong>
              <p>
                Select your intended hold period (Forever Home → Spec Build) to
                set appropriate score weighting.
              </p>
            </div>
          </div>

          <div className="doc-substep">
            <span className="doc-substep-num">6.2</span>
            <div className="doc-substep-content">
              <strong>Review dual scores</strong>
              <p>
                Check both Client Satisfaction and Market Appeal scores.
                Both should be ≥80% for PASS status.
              </p>
            </div>
          </div>

          <div className="doc-substep">
            <span className="doc-substep-num">6.3</span>
            <div className="doc-substep-content">
              <strong>Examine Buyer Pool breakdown</strong>
              <p>
                Review the top 3 buyer archetypes for your market. Check Must Have /
                Nice to Have / Avoid tables for each archetype.
              </p>
            </div>
          </div>

          <div className="doc-substep">
            <span className="doc-substep-num">6.4</span>
            <div className="doc-substep-content">
              <strong>Check Feature Classification quadrants</strong>
              <p>
                Verify Essential features are included. Review any Risky features
                that may limit buyer pool.
              </p>
            </div>
          </div>

          <div className="doc-substep">
            <span className="doc-substep-num">6.5</span>
            <div className="doc-substep-content">
              <strong>Follow Path to 80% recommendations</strong>
              <p>
                For any archetype below 80%, review specific recommendations to
                improve alignment and maximize market appeal.
              </p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Step 7: Generate Report">
        <ol className="doc-steps">
          <li>Click "Generate PDF Report"</li>
          <li>Review all sections for accuracy</li>
          <li>Share with stakeholders as needed</li>
        </ol>
      </ExpandableSection>
    </div>
  );
}

// =============================================================================
// GATES TAB
// =============================================================================

function GatesTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">Validation Gates</h2>
        <p className="doc-paragraph">
          Validation gates ensure the design meets minimum thresholds before
          progressing to subsequent phases.
        </p>
      </div>

      <ExpandableSection title="BAM Validation Gates" defaultOpen={true}>
        <p className="doc-paragraph">
          These gates validate buyer alignment before Phase 2 (FYI) progression.
        </p>

        <div className="doc-gates-table">
          <div className="doc-gates-row doc-gates-row--header">
            <span>Gate</span>
            <span>Threshold</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Client Satisfaction</strong></span>
            <span>≥80%</span>
            <span>
              <StatusBadge status="PASS" /> / <StatusBadge status="CAUTION" /> / <StatusBadge status="FAIL" />
            </span>
            <span>Review KYC/FYI alignment</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Market Appeal</strong></span>
            <span>≥80%</span>
            <span>
              <StatusBadge status="PASS" /> / <StatusBadge status="CAUTION" /> / <StatusBadge status="FAIL" />
            </span>
            <span>Follow archetype recommendations</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Combined Score</strong></span>
            <span>≥80%</span>
            <span>
              <StatusBadge status="PASS" /> / <StatusBadge status="CAUTION" /> / <StatusBadge status="FAIL" />
            </span>
            <span>Balance client/market priorities</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Essential Features</strong></span>
            <span>8/10 minimum</span>
            <span>Required</span>
            <span>Add missing essentials</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Risky Features</strong></span>
            <span>0-1 maximum</span>
            <span>Warning</span>
            <span>Review or remove risky items</span>
          </div>
        </div>

        <div className="doc-warning">
          <AlertTriangle size={16} />
          <span><strong>Warning:</strong> A Combined Score below 65% blocks Phase 2
          progression. Address critical gaps before continuing.</span>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Score Status Definitions">
        <div className="doc-status-defs">
          <div className="doc-status-def">
            <StatusBadge status="PASS" />
            <p>Score ≥80% — Design strongly aligned with requirements</p>
          </div>
          <div className="doc-status-def">
            <StatusBadge status="CAUTION" />
            <p>Score 65-79% — Some compromises exist, review recommended</p>
          </div>
          <div className="doc-status-def">
            <StatusBadge status="FAIL" />
            <p>Score &lt;65% — Significant misalignment, action required</p>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Gate Override Policy">
        <p className="doc-paragraph">
          Gates can be overridden by authorized advisors in specific circumstances:
        </p>
        <ul className="doc-list-plain">
          <li>Client explicitly acknowledges trade-offs in writing</li>
          <li>Portfolio Context is "Forever Home" with minimal resale concern</li>
          <li>Market-specific factors justify deviation (documented)</li>
          <li>Senior advisor approval obtained</li>
        </ul>
        <p className="doc-note">
          All overrides are logged and included in the final report.
        </p>
      </ExpandableSection>
    </div>
  );
}

// =============================================================================
// REFERENCE TAB
// =============================================================================

function ReferenceTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">Reference Guide</h2>
        <p className="doc-paragraph">
          Key terminology and definitions used in the BAM v3.0 dual scoring system.
        </p>
      </div>

      <ExpandableSection title="BAM Terminology" defaultOpen={true}>
        <dl className="doc-glossary">
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
      </ExpandableSection>

      <ExpandableSection title="Buyer Archetype Reference">
        <div className="doc-archetype-table">
          <div className="doc-archetype-row doc-archetype-row--header">
            <span>Archetype</span>
            <span>Key Must Haves</span>
            <span>Key Avoids</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Tech Executive</strong></span>
            <span>Smart Home, Office, Contemporary</span>
            <span>Traditional, HOA restrictions</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Entertainment Executive</strong></span>
            <span>Screening Room, Privacy, Chef's Kitchen</span>
            <span>Minimalist, Compact footprint</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Finance Executive</strong></span>
            <span>Library, Traditional, Formal Dining</span>
            <span>Modern/Minimalist, Remote location</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>International Investor</strong></span>
            <span>Security, Staff Quarters, Guest Suites</span>
            <span>Compact size, Limited privacy</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Sports Professional</strong></span>
            <span>Gym 1000+ SF, Recovery Suite, Privacy</span>
            <span>Traditional, Small gym</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Generational Wealth</strong></span>
            <span>Guest House, Estate, 6+ Bedrooms</span>
            <span>Modern, Single structure</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Wellness Pioneer</strong></span>
            <span>Spa Suite, Natural Materials</span>
            <span>Urban location, Artificial materials</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Medical / Biotech</strong></span>
            <span>Home lab space, climate control, privacy</span>
            <span>Ostentatious design, shared access</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Developer</strong></span>
            <span>ROI potential, scalability, flex spaces</span>
            <span>Hyper-personalization, niche features</span>
          </div>
          <div className="doc-archetype-row">
            <span><strong>Creative Entrepreneur</strong></span>
            <span>Studio spaces, showcase areas, unique design</span>
            <span>Cookie-cutter layouts, minimal storage</span>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Market Buyer Pool Reference">
        <div className="doc-market-table">
          <div className="doc-market-row doc-market-row--header">
            <span>Market</span>
            <span>#1 Archetype</span>
            <span>#2 Archetype</span>
            <span>#3 Archetype</span>
          </div>
          <div className="doc-market-row">
            <span>Malibu, CA</span>
            <span>Entertainment (35%)</span>
            <span>Tech (28%)</span>
            <span>Sports (18%)</span>
          </div>
          <div className="doc-market-row">
            <span>Beverly Hills, CA</span>
            <span>Entertainment (30%)</span>
            <span>Tech (25%)</span>
            <span>International (20%)</span>
          </div>
          <div className="doc-market-row">
            <span>Aspen, CO</span>
            <span>Generational (30%)</span>
            <span>Finance (25%)</span>
            <span>Sports (20%)</span>
          </div>
          <div className="doc-market-row">
            <span>Greenwich, CT</span>
            <span>Finance (40%)</span>
            <span>Family Office (25%)</span>
            <span>Generational (20%)</span>
          </div>
          <div className="doc-market-row">
            <span>Palm Beach, FL</span>
            <span>International (35%)</span>
            <span>Finance (30%)</span>
            <span>Generational (25%)</span>
          </div>
          <div className="doc-market-row">
            <span>Hamptons, NY</span>
            <span>Finance (35%)</span>
            <span>Entertainment (25%)</span>
            <span>Tech (20%)</span>
          </div>
        </div>
      </ExpandableSection>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Data Sources</h3>
        <p className="doc-paragraph">
          KYM uses a combination of live API data and statistical estimates depending on market coverage.
        </p>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <span>Data Type</span>
            <span>Source</span>
            <span>Coverage</span>
          </div>
          <div className="doc-ref-row">
            <span>Comparable Properties</span>
            <span>Realtor.com API (via RapidAPI)</span>
            <span>Live data for US markets</span>
          </div>
          <div className="doc-ref-row">
            <span>Land Parcels</span>
            <span>Realtor.com API (via RapidAPI)</span>
            <span>Live data for US markets</span>
          </div>
          <div className="doc-ref-row">
            <span>ZIP Validation</span>
            <span>Zippopotam.us API</span>
            <span>US ZIP codes</span>
          </div>
          <div className="doc-ref-row">
            <span>Luxury Market Benchmarks</span>
            <span>N4S curated dataset</span>
            <span>8 key luxury markets</span>
          </div>
          <div className="doc-ref-row">
            <span>Demographics</span>
            <span>Statistical estimates</span>
            <span>Seeded generation for unknown markets</span>
          </div>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#6b6b6b' }}>
          A data source indicator in the module header shows whether you are viewing live API data
          or statistically estimated data for your selected location.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN DOCUMENTATION COMPONENT
// =============================================================================

export default function KYMDocumentation({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'gates', label: 'Gates' },
    { id: 'reference', label: 'Reference' },
  ];

  return (
    <div className="doc-container">
      {/* Header */}
      <div className="doc-header">
        <div className="doc-header-top">
          {onClose && (
            <button className="doc-close-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              Back to KYM
            </button>
          )}
        </div>
        <h1 className="doc-title">Documentation</h1>
        <p className="doc-subtitle">N4S KYM — Know Your Market Guide</p>

        {/* Tabs */}
        <div className="doc-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`doc-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="doc-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'workflow' && <WorkflowTab />}
        {activeTab === 'gates' && <GatesTab />}
        {activeTab === 'reference' && <ReferenceTab />}
      </div>

      <style>{kymDocumentationStyles}</style>
    </div>
  );
}

// =============================================================================
// EMBEDDED STYLES (matches KYC/FYI pattern)
// =============================================================================

const kymDocumentationStyles = `
/* Base Container */
.doc-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.doc-header {
  background-color: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem 0;
}

.doc-header-top {
  margin-bottom: 1rem;
}

.doc-close-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  transition: all 0.15s ease;
}

.doc-close-btn:hover {
  border-color: ${COLORS.navy};
  color: ${COLORS.navy};
}

.doc-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 0.25rem 0;
}

.doc-subtitle {
  font-size: 0.9375rem;
  color: ${COLORS.textMuted};
  margin: 0 0 1.5rem 0;
}

/* Tabs */
.doc-tabs {
  display: flex;
  gap: 0;
  border: 1px solid ${COLORS.border};
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  background-color: ${COLORS.background};
}

.doc-tab {
  flex: 1;
  padding: 0.875rem 1rem;
  background-color: transparent;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  transition: all 0.15s ease;
  border-right: 1px solid ${COLORS.border};
}

.doc-tab:last-child {
  border-right: none;
}

.doc-tab:hover {
  background-color: ${COLORS.surface};
  color: ${COLORS.text};
}

.doc-tab.active {
  background-color: ${COLORS.surface};
  color: ${COLORS.navy};
  box-shadow: inset 0 -2px 0 ${COLORS.navy};
}

/* Content */
.doc-content {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.doc-tab-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Cards */
.doc-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.doc-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.375rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.doc-paragraph {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.doc-paragraph:last-child {
  margin-bottom: 0;
}

/* Expandable Sections */
.doc-expandable {
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.doc-expandable-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${COLORS.background};
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${COLORS.text};
  cursor: pointer;
  text-align: left;
}

.doc-expandable-header:hover {
  background-color: #f0f0eb;
}

.doc-expandable-content {
  padding: 1rem;
  border-top: 1px solid ${COLORS.border};
}

/* Status Badges */
.doc-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.doc-status--pass {
  background: rgba(46, 125, 50, 0.15);
  color: ${COLORS.success};
}

.doc-status--caution {
  background: rgba(245, 124, 0, 0.15);
  color: ${COLORS.warning};
}

.doc-status--fail {
  background: rgba(211, 47, 47, 0.15);
  color: ${COLORS.error};
}

/* Dual Score Display */
.doc-dual-score {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.doc-score-box {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
}

.doc-score-box h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

.doc-score-box--client {
  background: linear-gradient(135deg, rgba(30, 58, 95, 0.05), rgba(30, 58, 95, 0.1));
  border-color: ${COLORS.navy};
}

.doc-score-box--client h4 {
  color: ${COLORS.navy};
}

.doc-score-box--market {
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.05), rgba(201, 162, 39, 0.15));
  border-color: ${COLORS.gold};
}

.doc-score-box--market h4 {
  color: #8a7020;
}

.doc-score-question {
  font-style: italic;
  color: ${COLORS.textMuted};
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
}

.doc-score-list {
  margin: 0 0 0.75rem;
  padding-left: 1.125rem;
}

.doc-score-list li {
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
}

.doc-score-source {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  margin: 0;
  padding-top: 0.5rem;
  border-top: 1px solid ${COLORS.border};
}

/* Threshold Table */
.doc-threshold-section {
  margin-top: 1.25rem;
}

.doc-threshold-section h5 {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${COLORS.text};
}

.doc-threshold-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-threshold-row {
  display: grid;
  grid-template-columns: 140px 1fr 1fr 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.8125rem;
  align-items: center;
}

.doc-threshold-row:last-child {
  border-bottom: none;
}

.doc-threshold-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Context Table */
.doc-context-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
  margin: 1rem 0;
}

.doc-context-row {
  display: grid;
  grid-template-columns: 140px 100px 100px 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  align-items: center;
}

.doc-context-row:last-child {
  border-bottom: none;
}

.doc-context-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Formula Box */
.doc-formula {
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.doc-formula strong {
  display: block;
  margin-bottom: 0.5rem;
  color: ${COLORS.navy};
  font-size: 0.875rem;
}

.doc-formula code {
  display: block;
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 4px;
  padding: 0.625rem 0.75rem;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

.doc-example {
  margin: 0.75rem 0 0;
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

/* Quadrants */
.doc-quadrants {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 1rem 0;
}

.doc-quadrant {
  padding: 0.875rem;
  border-radius: 8px;
  border: 1px solid;
}

.doc-quadrant h5 {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.doc-quadrant-desc {
  font-size: 0.6875rem;
  color: ${COLORS.textMuted};
  margin: 0 0 0.5rem;
}

.doc-quadrant p {
  font-size: 0.8125rem;
  margin: 0 0 0.5rem;
}

.doc-quadrant ul {
  margin: 0;
  padding-left: 1rem;
}

.doc-quadrant li {
  font-size: 0.75rem;
  margin-bottom: 0.125rem;
}

.doc-quadrant--essential {
  background: rgba(46, 125, 50, 0.08);
  border-color: ${COLORS.success};
}

.doc-quadrant--essential h5 {
  color: ${COLORS.success};
}

.doc-quadrant--differentiating {
  background: rgba(30, 58, 95, 0.08);
  border-color: ${COLORS.navy};
}

.doc-quadrant--differentiating h5 {
  color: ${COLORS.navy};
}

.doc-quadrant--personal {
  background: rgba(245, 124, 0, 0.08);
  border-color: ${COLORS.warning};
}

.doc-quadrant--personal h5 {
  color: ${COLORS.warning};
}

.doc-quadrant--risky {
  background: rgba(211, 47, 47, 0.08);
  border-color: ${COLORS.error};
}

.doc-quadrant--risky h5 {
  color: ${COLORS.error};
}

/* Workflow Steps */
.doc-steps {
  margin: 0;
  padding-left: 1.5rem;
}

.doc-steps li {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.doc-step-intro {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f5f0e8;
  border-radius: 6px;
  border-left: 3px solid ${COLORS.gold};
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin-bottom: 1rem;
}

.doc-step-intro svg {
  flex-shrink: 0;
  color: ${COLORS.gold};
  margin-top: 2px;
}

.doc-substeps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-substep {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.doc-substep-num {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${COLORS.navy};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50%;
}

.doc-substep-content {
  flex: 1;
}

.doc-substep-content strong {
  display: block;
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-substep-content p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.5;
}

/* Gates Table */
.doc-gates-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
  margin: 1rem 0;
}

.doc-gates-row {
  display: grid;
  grid-template-columns: 140px 100px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.8125rem;
  align-items: center;
}

.doc-gates-row:last-child {
  border-bottom: none;
}

.doc-gates-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Warning Box */
.doc-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: rgba(211, 47, 47, 0.1);
  border: 1px solid ${COLORS.error};
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: ${COLORS.error};
}

.doc-warning svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* Status Definitions */
.doc-status-defs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-status-def {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.doc-status-def p {
  margin: 0;
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

/* List Styles */
.doc-list-plain {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
}

.doc-list-plain li {
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
  line-height: 1.5;
}

.doc-note {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  font-style: italic;
  margin-top: 0.75rem;
}

/* Glossary */
.doc-glossary {
  margin: 0;
}

.doc-glossary dt {
  font-weight: 600;
  color: ${COLORS.text};
  margin-top: 1rem;
}

.doc-glossary dt:first-child {
  margin-top: 0;
}

.doc-glossary dd {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  line-height: 1.5;
}

/* Archetype Table */
.doc-archetype-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-archetype-row {
  display: grid;
  grid-template-columns: 160px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.8125rem;
  align-items: center;
}

.doc-archetype-row:last-child {
  border-bottom: none;
}

.doc-archetype-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Market Table */
.doc-market-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-market-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr 1fr;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.75rem;
  align-items: center;
}

.doc-market-row:last-child {
  border-bottom: none;
}

.doc-market-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .doc-dual-score,
  .doc-quadrants {
    grid-template-columns: 1fr;
  }

  .doc-threshold-row,
  .doc-context-row,
  .doc-gates-row,
  .doc-archetype-row,
  .doc-market-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .doc-tabs {
    flex-wrap: wrap;
  }

  .doc-tab {
    flex: 1;
    min-width: 80px;
    text-align: center;
  }
}
`;
