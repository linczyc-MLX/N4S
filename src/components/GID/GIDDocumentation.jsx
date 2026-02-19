/**
 * GIDDocumentation.jsx
 *
 * In-app documentation for the GID (Get It Done) module.
 * Updated for Phase 2: Matching Engine with Dual Scoring.
 *
 * REFORMATTED to match N4S standard documentation pattern (KYC, FYI, KYM style).
 *
 * Tabs:
 * - Overview: What GID does, disciplines, data flow
 * - Workflow: Step-by-step from registry to team assembly
 * - Gates: Prerequisite gates for matching
 * - Reference: Matching algorithm details, terminology
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  FileDown,
} from 'lucide-react';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  warmEarth: '#D4A574',
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
 * Expandable Section Component (matches KYC/FYI/KYM pattern)
 */
function ExpandableSection({ title, children, defaultOpen = false }) {
  const printMode = new URLSearchParams(window.location.search).has('printModule');
  const [isOpen, setIsOpen] = useState(defaultOpen || printMode);

  return (
    <div className="doc-expandable">
      <button
        className="doc-expandable-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <span>{title}</span>
      </button>
      {(printMode || isOpen) && (
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
        <h2 className="doc-section-title">What Is GID?</h2>
        <p className="doc-paragraph">
          GID (Get It Done) curates and matches creative, project management, and delivery team consultants
          to support the client's luxury residential project. Instead of "who do we know?", GID asks
          <strong> "who's actually delivering at this level, in this location, right now?"</strong>
        </p>
      </div>

      <ExpandableSection title="Four Disciplines" defaultOpen={true}>
        <div className="doc-dual-score">
          <div className="doc-score-box" style={{ background: 'rgba(49, 80, 152, 0.06)', borderColor: '#315098' }}>
            <h4 style={{ color: '#315098' }}>Architect</h4>
            <p className="doc-score-question">Design visionary</p>
            <p className="doc-paragraph" style={{ fontSize: '0.8125rem', margin: 0 }}>
              Style alignment with client's Taste Exploration profile is the primary filter.
              Geographic relevance and experience tier are secondary.
            </p>
          </div>
          <div className="doc-score-box" style={{ background: 'rgba(140, 168, 190, 0.1)', borderColor: '#8CA8BE' }}>
            <h4 style={{ color: '#5a8aa8' }}>Interior Designer</h4>
            <p className="doc-score-question">Space storyteller</p>
            <p className="doc-paragraph" style={{ fontSize: '0.8125rem', margin: 0 }}>
              Must complement (not compete with) the architect. Feature specialization
              from FYI space program is a key scoring dimension.
            </p>
          </div>
          <div className="doc-score-box" style={{ background: 'rgba(175, 189, 176, 0.12)', borderColor: '#AFBDB0' }}>
            <h4 style={{ color: '#5a7a5e' }}>Project Manager / Owner's Rep</h4>
            <p className="doc-score-question">Client's advocate</p>
            <p className="doc-paragraph" style={{ fontSize: '0.8125rem', margin: 0 }}>
              Budget discipline, schedule management, local expertise.
              Geographic proximity and experience tier are weighted highest.
            </p>
          </div>
          <div className="doc-score-box" style={{ background: 'rgba(196, 164, 132, 0.1)', borderColor: '#C4A484' }}>
            <h4 style={{ color: '#8a6e4e' }}>General Contractor</h4>
            <p className="doc-score-question">The builder</p>
            <p className="doc-paragraph" style={{ fontSize: '0.8125rem', margin: 0 }}>
              Track record on similar-scale luxury projects in the geography.
              Budget alignment and quality signal are primary factors.
            </p>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Data Flow">
        <p className="doc-paragraph">
          GID reads from <strong>KYC</strong> (location, budget, style preferences), <strong>FYI</strong> (program
          complexity, features), and <strong>MVP</strong> (design brief) to match consultants.
        </p>
        <p className="doc-paragraph">
          Results feed downstream to <strong>LCD Portal</strong> ("Meet Your Team")
          and <strong>Parker AI</strong> (client can ask about their team).
        </p>

        <div className="doc-formula">
          <strong>Data Path Summary</strong>
          <code>KYC → Location + Budget + Style → GID Matching → Shortlist → Engagements → LCD Portal</code>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Evidence-Based Curation">
        <p className="doc-paragraph">
          Every consultant in the GID Registry is backed by verifiable data — building permits,
          publication features, award records, professional directories, and real estate reverse-engineering.
          Source attribution is tracked for every entry.
        </p>

        <div className="doc-context-table">
          <div className="doc-context-row doc-context-row--header">
            <span>Tier</span>
            <span>Source Type</span>
            <span>Examples</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Tier 1</strong></span>
            <span>Public Records</span>
            <span>Building permits, planning commissions</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Tier 2</strong></span>
            <span>Publications & Awards</span>
            <span>AD100, ASID, AIA awards</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Tier 3</strong></span>
            <span>Reverse-Engineering</span>
            <span>Luxury real estate listing analysis</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Tier 4</strong></span>
            <span>Professional Directories</span>
            <span>AIA, ASID, NAHB, Houzz Pro</span>
          </div>
          <div className="doc-context-row">
            <span><strong>Tier 5</strong></span>
            <span>AI-Assisted Discovery</span>
            <span>Web discovery with human verification</span>
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
        <h2 className="doc-section-title">GID Workflow</h2>
        <p className="doc-paragraph">
          The GID module has 4 screens: <strong>Registry</strong> (consultant database),
          <strong> Discovery</strong> (AI-assisted search), <strong>Matchmaking</strong> (scoring engine),
          and <strong>Assembly</strong> (team selection & tracking).
        </p>
      </div>

      <ExpandableSection title="Step 1: Build the Registry" defaultOpen={true}>
        <ol className="doc-steps">
          <li>Add firms across all four disciplines (Architect, ID, PM, GC)</li>
          <li>Enter firm details: service areas, specialties, budget range, years of experience</li>
          <li>Add portfolio projects with features, budget, square footage, and style tags</li>
          <li>Set verification status: Pending → Verified → Partner</li>
        </ol>
        <p className="doc-note">
          Each consultant entry must have at least one discovery source documented.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 2: Discovery (Phase 3)">
        <ol className="doc-steps">
          <li>AI-assisted search discovers candidates from permits, publications, award lists, and directories</li>
          <li>Review and approve additions before they enter the registry</li>
          <li>Source attribution is automatically tracked</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 3: Run Matching (Phase 2 — Live)" defaultOpen={true}>
        <div className="doc-step-intro">
          <Info size={16} />
          <span>The matching engine scores every consultant in the registry against the
          current project's KYC and FYI data using a dual scoring system.</span>
        </div>

        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">3.1</span>
            <div className="doc-substep-content">
              <strong>Select a discipline</strong>
              <p>Choose Architect, Interior Designer, PM, or GC to match against.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.2</span>
            <div className="doc-substep-content">
              <strong>Check prerequisite gates</strong>
              <p>Verify that required KYC fields (city, budget) are filled.
              Optional fields improve score accuracy.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.3</span>
            <div className="doc-substep-content">
              <strong>Run the match</strong>
              <p>The algorithm scores all eligible consultants across 6 dimensions,
              producing dual Client Fit and Project Fit scores.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.4</span>
            <div className="doc-substep-content">
              <strong>Review ranked results</strong>
              <p>Consultants are sorted by combined score. Expand any result
              to see the full dimension breakdown.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.5</span>
            <div className="doc-substep-content">
              <strong>Compare side-by-side</strong>
              <p>Select 2–3 consultants for direct comparison across all scoring dimensions.</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Step 4: Shortlisting">
        <ol className="doc-steps">
          <li>Click "Shortlist" on top-ranked consultants</li>
          <li>This creates engagement records that track the outreach pipeline</li>
          <li>Pipeline stages: Shortlisted → Reached Out → Responded → Meeting → Proposal → Engaged → Contracted</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 5: Team Assembly (Phase 4)">
        <ol className="doc-steps">
          <li>Advisory team and client select final team across all four disciplines</li>
          <li>Chemistry notes from client introductions inform the final choice</li>
          <li>Assembled team is exported to the LCD Portal ("Meet Your Team")</li>
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
        <h2 className="doc-section-title">Prerequisite Gates</h2>
        <p className="doc-paragraph">
          Before GID matching can run, specific KYC and FYI fields must be populated.
          Required gates block matching; optional gates improve score quality.
        </p>
      </div>

      <ExpandableSection title="Matching Prerequisites" defaultOpen={true}>
        <div className="doc-gates-table">
          <div className="doc-gates-row doc-gates-row--header">
            <span>Gate</span>
            <span>Source</span>
            <span>Status</span>
            <span>Impact</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Project City</strong></span>
            <span>KYC</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>Geographic scoring uses this as the primary location reference</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Total Project Budget</strong></span>
            <span>KYC</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>Budget alignment scoring compares against consultant ranges</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Taste Axes</strong></span>
            <span>KYC</span>
            <span>Optional</span>
            <span>Enables style compatibility scoring via taste-to-specialty mapping</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Style Tags</strong></span>
            <span>KYC</span>
            <span>Optional</span>
            <span>Direct matching of architecture/interior tags against specialties</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>FYI Space Selections</strong></span>
            <span>FYI</span>
            <span>Optional</span>
            <span>Feature specialization scoring uses included space features</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Target SF</strong></span>
            <span>FYI</span>
            <span>Optional</span>
            <span>Scale assessment for project complexity matching</span>
          </div>
        </div>

        <div className="doc-warning">
          <AlertTriangle size={16} />
          <span><strong>Required gates must be filled</strong> before the "Run Match" button becomes
          active. Optional data improves match quality — the more data available, the more
          accurate the scores.</span>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Registry Rules">
        <dl className="doc-glossary">
          <dt>Source Attribution</dt>
          <dd>Every consultant must have at least one discovery source documented (Tier 1–5).</dd>

          <dt>No Hard Deletes</dt>
          <dd>Consultants are archived (soft-deleted), never permanently removed. Archived
          consultants are hidden from searches but data is preserved.</dd>

          <dt>Verification Tiers</dt>
          <dd>
            <strong>Pending</strong> — Initial entry, data not yet confirmed.{' '}
            <strong>Verified</strong> — Team has confirmed data accuracy.{' '}
            <strong>Partner</strong> — Active N4S relationship, receives geographic scoring bonus.
          </dd>
        </dl>
      </ExpandableSection>

      <ExpandableSection title="Match Tier Thresholds">
        <div className="doc-threshold-table">
          <div className="doc-threshold-row doc-threshold-row--header">
            <span>Tier</span>
            <span>Score Range</span>
            <span>Badge</span>
            <span>Action</span>
          </div>
          <div className="doc-threshold-row">
            <span><strong>Top Match</strong></span>
            <span>80–100</span>
            <span style={{ color: '#c9a227', fontWeight: 600 }}>Gold</span>
            <span>Present to client — high confidence</span>
          </div>
          <div className="doc-threshold-row">
            <span><strong>Good Fit</strong></span>
            <span>60–79</span>
            <span style={{ color: '#1e3a5f', fontWeight: 600 }}>Navy</span>
            <span>Strong candidate with minor gaps</span>
          </div>
          <div className="doc-threshold-row">
            <span><strong>Consider</strong></span>
            <span>40–59</span>
            <span style={{ color: '#6b6b6b', fontWeight: 600 }}>Muted</span>
            <span>Worth discussion, may need compromise</span>
          </div>
          <div className="doc-threshold-row">
            <span><strong>Below Threshold</strong></span>
            <span>&lt;40</span>
            <span style={{ color: '#d32f2f', fontWeight: 600 }}>Red</span>
            <span>Filtered out unless manually overridden</span>
          </div>
        </div>
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
          Matching algorithm details, scoring dimensions, and terminology for the
          GID dual scoring system (mirrors BAM v3.0 pattern).
        </p>
      </div>

      <ExpandableSection title="Scoring Dimensions (110 Raw → 100 Normalized)" defaultOpen={true}>
        <div className="doc-gates-table">
          <div className="doc-gates-row doc-gates-row--header">
            <span>Dimension</span>
            <span>Max Pts</span>
            <span>Source</span>
            <span>Logic</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Geographic Relevance</strong></span>
            <span>20</span>
            <span>KYC + Consultant</span>
            <span>Same state = 20, region = 12, partner = 8</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Budget Alignment</strong></span>
            <span>25</span>
            <span>KYC Budget</span>
            <span>Within range = 25, ±10% = 22, ±25% = 18, ±50% = 12</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Style Compatibility</strong></span>
            <span>20</span>
            <span>KYC Taste + Tags</span>
            <span>Taste axes mapped to specialties + direct tag matching</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Experience Tier</strong></span>
            <span>15</span>
            <span>Consultant</span>
            <span>20+ yrs = 15, 12+ = 12, 8+ = 8, 5+ = 4</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Quality Signal</strong></span>
            <span>20</span>
            <span>Reviews</span>
            <span>avg_rating × 4 (unrated = 10 baseline)</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Feature Specialization</strong></span>
            <span>10</span>
            <span>FYI + Portfolio</span>
            <span>Feature overlap ratio × 10</span>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Dual Scoring (Mirrors BAM v3.0)" defaultOpen={true}>
        <div className="doc-dual-score">
          <div className="doc-score-box doc-score-box--client">
            <h4>Client Fit Score</h4>
            <p className="doc-score-question">
              "Does this consultant match the client's taste and expectations?"
            </p>
            <ul className="doc-score-list">
              <li>Style Compatibility: <strong>×1.5</strong> weight</li>
              <li>Quality Signal: <strong>×1.2</strong> weight</li>
              <li>Geographic, Budget, Experience, Features: ×1.0</li>
            </ul>
            <p className="doc-score-source">
              <strong>Emphasis:</strong> Taste, lifestyle, cultural alignment
            </p>
          </div>
          <div className="doc-score-box doc-score-box--market">
            <h4>Project Fit Score</h4>
            <p className="doc-score-question">
              "Is this consultant practically suited for the project?"
            </p>
            <ul className="doc-score-list">
              <li>Budget Alignment: <strong>×1.5</strong> weight</li>
              <li>Geographic Relevance: <strong>×1.2</strong> weight</li>
              <li>Feature Specialization: <strong>×1.2</strong> weight</li>
              <li>Style, Experience, Quality: varied</li>
            </ul>
            <p className="doc-score-source">
              <strong>Emphasis:</strong> Logistics, budget, geography, scale
            </p>
          </div>
        </div>

        <div className="doc-formula">
          <strong>Combined Score</strong>
          <code>Combined = (Client Fit Score + Project Fit Score) / 2</code>
          <p className="doc-example">
            Example: Client Fit 78 + Project Fit 84 = Combined <strong>81</strong> (Top Match)
          </p>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Style Compatibility Mapping">
        <p className="doc-paragraph">
          KYC taste axes are mapped to consultant specialty tags. Values ≤3 map to one style
          cluster, 4–6 to transitional, and ≥7 to the opposite cluster.
        </p>
        <div className="doc-archetype-table">
          <div className="doc-archetype-row doc-archetype-row--header">
            <span>Taste Axis</span>
            <span>Low (≤3)</span>
            <span>High (≥7)</span>
          </div>
          <div className="doc-archetype-row">
            <span>Contemporary ↔ Traditional</span>
            <span>Contemporary, Modern, Minimalist</span>
            <span>Traditional, Colonial, Georgian</span>
          </div>
          <div className="doc-archetype-row">
            <span>Minimal ↔ Layered</span>
            <span>Minimalist, Scandinavian</span>
            <span>Maximalist, Eclectic, Art Deco</span>
          </div>
          <div className="doc-archetype-row">
            <span>Warm ↔ Cool</span>
            <span>Industrial, Scandinavian</span>
            <span>Mediterranean, Tuscan, Rustic</span>
          </div>
          <div className="doc-archetype-row">
            <span>Arch: Minimal ↔ Ornate</span>
            <span>Modern, Minimalist</span>
            <span>Art Deco, Craftsman, Victorian</span>
          </div>
          <div className="doc-archetype-row">
            <span>Arch: Regional ↔ International</span>
            <span>Coastal, Mountain, Ranch</span>
            <span>International, Contemporary</span>
          </div>
        </div>
        <p className="doc-note">
          Additionally, architectureStyleTags[] and interiorStyleTags[] from KYC are matched
          directly against consultant specialties[].
        </p>
      </ExpandableSection>

      <ExpandableSection title="GID Terminology">
        <dl className="doc-glossary">
          <dt>Client Fit Score</dt>
          <dd>
            A score (0–100) measuring how well a consultant matches the client's taste,
            style preferences, and quality expectations.
          </dd>

          <dt>Project Fit Score</dt>
          <dd>
            A score (0–100) measuring practical alignment: budget range, geographic
            proximity, feature specialization, and project scale.
          </dd>

          <dt>Combined Score</dt>
          <dd>
            The average of Client Fit and Project Fit scores. Determines the match tier.
          </dd>

          <dt>Match Tier</dt>
          <dd>
            Classification based on combined score: Top Match (80+), Good Fit (60–79),
            Consider (40–59), Below Threshold (&lt;40).
          </dd>

          <dt>Engagement</dt>
          <dd>
            A record linking a shortlisted consultant to a project with pipeline tracking
            from shortlist through contracted status.
          </dd>

          <dt>Verification Status</dt>
          <dd>
            Consultant data quality indicator: Pending (unconfirmed), Verified (team-confirmed),
            Partner (active N4S relationship — receives geographic scoring bonus).
          </dd>

          <dt>Service Areas</dt>
          <dd>
            US states or regions where a consultant actively works. Used for geographic scoring.
            "NATIONAL" or 5+ areas indicates nationwide coverage.
          </dd>

          <dt>Specialties</dt>
          <dd>
            Design style tags associated with a consultant (e.g., "Contemporary", "Traditional",
            "Art Deco"). Matched against client taste axes and style tags.
          </dd>
        </dl>
      </ExpandableSection>

      <ExpandableSection title="Engagement Pipeline">
        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">1</span>
            <div className="doc-substep-content">
              <strong>Shortlisted</strong>
              <p>Consultant added to project shortlist from match results.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">2</span>
            <div className="doc-substep-content">
              <strong>Reached Out</strong>
              <p>Initial contact made by advisory team.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3</span>
            <div className="doc-substep-content">
              <strong>Responded</strong>
              <p>Consultant has responded with interest.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">4</span>
            <div className="doc-substep-content">
              <strong>Meeting Scheduled</strong>
              <p>Introduction meeting with client arranged.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">5</span>
            <div className="doc-substep-content">
              <strong>Proposal Received</strong>
              <p>Formal proposal or scope of work submitted.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">6</span>
            <div className="doc-substep-content">
              <strong>Engaged</strong>
              <p>Client has selected this consultant; terms being finalized.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">7</span>
            <div className="doc-substep-content">
              <strong>Contracted</strong>
              <p>Agreement signed. Consultant is part of the project team.</p>
            </div>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}


// =============================================================================
// MAIN DOCUMENTATION COMPONENT
// =============================================================================

export default function GIDDocumentation({ onClose, printAll }) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportPdf = () => {
    const link = document.createElement('a');
    link.href = '/docs/N4S-GID-Documentation.pdf';
    link.download = 'N4S-GID-Documentation.pdf';
    link.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'gates', label: 'Gates' },
    { id: 'reference', label: 'Reference' },
  ];

  return (
    <div className={`doc-container ${printAll ? 'doc-print-mode' : ''}`}>
      {printAll && (
        <div className="doc-print-header">
          <h1 className="doc-print-header__title">GID (Get It Done) — Documentation</h1>
          <p className="doc-print-header__subtitle">N4S — Luxury Residential Advisory Platform</p>
        </div>
      )}
      {!printAll && (
        <div className="doc-header">
          <div className="doc-header-top">
            {onClose && (
              <button className="doc-close-btn" onClick={onClose}>
                <ArrowLeft size={16} />
                Back to GID
              </button>
            )}
            <button className="doc-export-btn" onClick={handleExportPdf}>
              <FileDown size={16} />
              Export PDF
            </button>
          </div>
          <h1 className="doc-title">Documentation</h1>
          <p className="doc-subtitle">N4S GID — Get It Done Guide</p>

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
      )}

      {/* Content */}
      <div className="doc-content">
        {(printAll || activeTab === 'overview') && (
          <>{printAll && <h2 className="doc-print-section-title">1. Overview</h2>}<OverviewTab /></>
        )}
        {(printAll || activeTab === 'workflow') && (
          <>{printAll && <h2 className="doc-print-section-title">2. Workflow</h2>}<WorkflowTab /></>
        )}
        {(printAll || activeTab === 'gates') && (
          <>{printAll && <h2 className="doc-print-section-title">3. Gates & Prerequisites</h2>}<GatesTab /></>
        )}
        {(printAll || activeTab === 'reference') && (
          <>{printAll && <h2 className="doc-print-section-title">4. Reference</h2>}<ReferenceTab /></>
        )}
      </div>

      <style>{gidDocumentationStyles}</style>
    </div>
  );
}


// =============================================================================
// EMBEDDED STYLES (matches KYC/FYI/KYM pattern)
// =============================================================================

const gidDocumentationStyles = `
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.doc-export-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  transition: all 0.15s ease;
}

.doc-export-btn:hover {
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

.doc-status--required {
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
  grid-template-columns: 80px 160px 1fr;
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

/* Threshold Table */
.doc-threshold-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-threshold-row {
  display: grid;
  grid-template-columns: 140px 100px 80px 1fr;
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
  grid-template-columns: 160px 80px 100px 1fr;
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
  background: rgba(245, 124, 0, 0.08);
  border: 1px solid ${COLORS.warning};
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: #8a5500;
}

.doc-warning svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: ${COLORS.warning};
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

/* Archetype/Reference Tables */
.doc-archetype-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
  margin: 1rem 0;
}

.doc-archetype-row {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
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

/* Notes */
.doc-note {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  font-style: italic;
  margin-top: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .doc-dual-score {
    grid-template-columns: 1fr;
  }

  .doc-threshold-row,
  .doc-context-row,
  .doc-gates-row,
  .doc-archetype-row {
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

/* Print Mode */
.doc-print-mode {
  max-width: 100%;
  padding: 0 2rem;
}
.doc-print-mode .doc-content {
  max-width: 100%;
  padding: 1rem 0;
}
.doc-print-header {
  padding: 2rem 0 1.5rem;
  border-bottom: 2px solid #1e3a5f;
  margin-bottom: 1rem;
}
.doc-print-header__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}
.doc-print-header__subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #6b6b6b;
  margin: 0.5rem 0 0;
}
.doc-print-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a5f;
  border-bottom: 1px solid #e5e5e0;
  padding: 1.5rem 0 0.5rem;
  margin: 2rem 0 1rem;
  page-break-after: avoid;
}
.doc-print-section-title:first-of-type {
  margin-top: 0;
}
.doc-print-mode .doc-card {
  break-inside: avoid;
  page-break-inside: avoid;
  overflow: hidden;
}
.doc-print-mode .doc-expandable {
  break-inside: avoid;
  page-break-inside: avoid;
}
`;
