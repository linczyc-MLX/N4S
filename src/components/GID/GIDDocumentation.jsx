/**
 * GIDDocumentation.jsx
 *
 * In-app documentation for the GID (Get It Done) module.
 * Updated for Phase 5: Full 5-tab structure with RFQ Pipeline & Synergy Sandbox.
 *
 * REFORMATTED to match N4S standard documentation pattern (KYC, FYI, KYM style).
 *
 * Tabs:
 * - Overview: What GID does, disciplines, data flow, architecture
 * - Workflow: Step-by-step from registry to team synergy
 * - Gates: Prerequisite gates for matching
 * - Reference: Scoring engine details, RFQ pipeline, terminology
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
        <p className="doc-paragraph">
          The module operates across <strong>5 tabs</strong> that form a complete pipeline from
          sourcing through team chemistry validation.
        </p>
      </div>

      <ExpandableSection title="Five-Tab Structure" defaultOpen={true}>
        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">1</span>
            <div className="doc-substep-content">
              <strong>Registry</strong>
              <p>Consultant database — full CRUD for firms across all four disciplines.
              Portfolio projects, service areas, specialties, and verification status.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">2</span>
            <div className="doc-substep-content">
              <strong>Discovery</strong>
              <p>AI-assisted sourcing — discovers candidates from permits, publications,
              award lists, and directories. Queue management for review and import.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3</span>
            <div className="doc-substep-content">
              <strong>Shortlist</strong>
              <p>Curation layer — rank candidates, view alignment badges, send RFQ
              questionnaire invitations via the external portal (rfq.not-4.sale).
              Auto-polls for response status every 30 seconds.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">4</span>
            <div className="doc-substep-content">
              <strong>Matchmaking</strong>
              <p>Deep scoring engine — computes quantitative + qualitative match scores
              from RFQ responses. Dimension breakdowns across 10 scoring axes.
              Pipeline management from shortlisted through contracted.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">5</span>
            <div className="doc-substep-content">
              <strong>Synergy Sandbox</strong>
              <p>Team chemistry simulation — tests 4-person team combinations across disciplines.
              Conflict node detection, collaboration scoring, and team config persistence.</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

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

      <ExpandableSection title="Architecture — Dual Backend">
        <p className="doc-paragraph">
          GID spans two backends. The main N4S app on IONOS handles the consultant registry
          and engagement pipeline. The RFQ scoring engine runs on a dedicated VPS with PostgreSQL.
        </p>

        <div className="doc-context-table">
          <div className="doc-context-row doc-context-row--header">
            <span>Component</span>
            <span>Location</span>
            <span>Purpose</span>
          </div>
          <div className="doc-context-row">
            <span><strong>N4S Main App</strong></span>
            <span>IONOS (React + PHP)</span>
            <span>Registry, Discovery, Shortlist UI, Engagement pipeline</span>
          </div>
          <div className="doc-context-row">
            <span><strong>RFQ API</strong></span>
            <span>VPS (Node.js + PostgreSQL)</span>
            <span>Invitation management, scoring engine, synergy simulation</span>
          </div>
          <div className="doc-context-row">
            <span><strong>RFQ Portal</strong></span>
            <span>VPS (Vite React)</span>
            <span>Consultant-facing questionnaire (rfq.not-4.sale)</span>
          </div>
        </div>

        <div className="doc-formula">
          <strong>Data Flow</strong>
          <code>Registry (IONOS) → Shortlist → Send RFQ (VPS) → Consultant Portal → Score (VPS) → Matchmaking (merged view)</code>
        </div>

        <div className="doc-warning">
          <AlertTriangle size={16} />
          <span>
            IONOS cannot make outbound HTTPS calls from PHP. All VPS communication happens
            client-side via <code>rfqApi.js</code> fetch calls, bypassing the server restriction.
          </span>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Data Flow">
        <p className="doc-paragraph">
          GID reads from <strong>KYC</strong> (location, budget, style preferences), <strong>FYI</strong> (program
          complexity, features), and <strong>MVP</strong> (design brief) to match consultants.
        </p>
        <p className="doc-paragraph">
          Results feed downstream to <strong>LCD Portal</strong> ("Meet Your Team")
          and inform the <strong>Synergy Sandbox</strong> chemistry simulations.
        </p>

        <div className="doc-formula">
          <strong>Data Path Summary</strong>
          <code>KYC → Location + Budget + Style → GID Shortlist → Send RFQ → Score Response → Matchmaking → Synergy → LCD Portal</code>
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
          The GID module has <strong>5 tabs</strong>: Registry (consultant database),
          Discovery (AI-assisted search), Shortlist (curation + RFQ dispatch),
          Matchmaking (scoring + pipeline), and Synergy Sandbox (team chemistry).
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

      <ExpandableSection title="Step 2: AI Discovery">
        <ol className="doc-steps">
          <li>AI-assisted search discovers candidates from permits, publications, award lists, and directories</li>
          <li>Candidates appear in the Discovery queue with confidence scores</li>
          <li>Review and approve to import into the Registry</li>
          <li>Source attribution is automatically tracked</li>
        </ol>
      </ExpandableSection>

      <ExpandableSection title="Step 3: Shortlist & Send RFQ" defaultOpen={true}>
        <div className="doc-step-intro">
          <Info size={16} />
          <span>The Shortlist tab is where curation meets action. After ranking candidates,
          you dispatch RFQ questionnaires via the external portal.</span>
        </div>

        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">3.1</span>
            <div className="doc-substep-content">
              <strong>Select a discipline</strong>
              <p>Choose Architect, Interior Designer, PM, or GC.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.2</span>
            <div className="doc-substep-content">
              <strong>Review & rank candidates</strong>
              <p>View alignment badges (Style, Budget, Geographic, Scale).
              Drag to reorder priority. Pass on weak candidates.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.3</span>
            <div className="doc-substep-content">
              <strong>Send RFQ</strong>
              <p>Click "Send RFQ" on a shortlisted candidate. This creates a secure invitation
              on the VPS with a unique link and password. The invitation syncs the current
              project data (name, features from FYI) to the RFQ backend.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.4</span>
            <div className="doc-substep-content">
              <strong>Email credentials</strong>
              <p>Copy the portal link and password. Use the "Open Email Draft" button
              to send via your email client. The password is shown only once.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3.5</span>
            <div className="doc-substep-content">
              <strong>Monitor responses</strong>
              <p>Shortlist auto-polls every 30 seconds. When a consultant submits their
              questionnaire, the badge updates from "RFQ Sent" to "Response Received"
              and the IONOS engagement record is auto-synced.</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Step 4: Matchmaking & Scoring" defaultOpen={true}>
        <div className="doc-step-intro">
          <Info size={16} />
          <span>The Matchmaking tab pulls scores from the VPS scoring engine and merges them
          with the IONOS engagement pipeline for a unified view.</span>
        </div>

        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">4.1</span>
            <div className="doc-substep-content">
              <strong>Compute scores</strong>
              <p>Click "Score All" to run the VPS scoring engine across all candidates with
              submitted RFQ responses. Scoring is two-pass: quantitative (algorithmic)
              and qualitative (AI-parsed from questionnaire text).</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">4.2</span>
            <div className="doc-substep-content">
              <strong>Review dimension breakdowns</strong>
              <p>Expand any candidate to see their score across 10 dimensions:
              Scale Match, Financial Resilience, Geographic Alignment, Capability Coverage,
              Portfolio Relevance, Tech Compatibility, Credentials, Philosophy Alignment,
              Methodology Fit, and Collaboration Maturity.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">4.3</span>
            <div className="doc-substep-content">
              <strong>Advance pipeline</strong>
              <p>Move candidates through stages: Under Review → Proposal → Engaged → Contracted.
              Add team notes, client feedback, and chemistry scores (1-10).</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Step 5: Synergy Sandbox">
        <ol className="doc-steps">
          <li>Select one candidate per discipline to form a 4-person team</li>
          <li>Run synergy simulation to compute team chemistry scores</li>
          <li>Review conflict nodes (where team members may clash)</li>
          <li>Save and compare multiple team configurations</li>
          <li>Final assembled team exports to the LCD Portal ("Meet Your Team")</li>
        </ol>
        <p className="doc-note">
          Synergy scoring factors: communication style compatibility, work methodology overlap,
          geographic proximity, past collaboration history, and design philosophy alignment.
        </p>
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
          GID operates across multiple systems. Different features require different prerequisites.
        </p>
      </div>

      <ExpandableSection title="Shortlist & Alignment Prerequisites" defaultOpen={true}>
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
            <span>Geographic alignment badges and scoring</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Total Project Budget</strong></span>
            <span>KYC</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>Budget alignment badges and scoring</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Taste Axes</strong></span>
            <span>KYC</span>
            <span>Optional</span>
            <span>Style compatibility scoring via taste-to-specialty mapping</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Style Tags</strong></span>
            <span>KYC</span>
            <span>Optional</span>
            <span>Direct matching of architecture/interior tags</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>FYI Space Selections</strong></span>
            <span>FYI</span>
            <span>Optional</span>
            <span>Feature specialization and scale assessment</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Target SF</strong></span>
            <span>FYI</span>
            <span>Optional</span>
            <span>Scale assessment for project complexity matching</span>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="RFQ Pipeline Prerequisites" defaultOpen={true}>
        <div className="doc-gates-table">
          <div className="doc-gates-row doc-gates-row--header">
            <span>Gate</span>
            <span>Source</span>
            <span>Status</span>
            <span>Impact</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>RFQ API Available</strong></span>
            <span>VPS</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>rfq.not-4.sale must be reachable. Health-checked on mount.</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Admin API Key</strong></span>
            <span>rfqApi.js</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>Hardcoded in rfqApi.js. Required for all admin endpoints.</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Active Project ID</strong></span>
            <span>AppContext</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>Project must be selected. RFQ invitations are project-scoped.</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Consultant Shortlisted</strong></span>
            <span>Engagement</span>
            <span><StatusBadge status="REQUIRED" /></span>
            <span>Must have engagement record before RFQ can be dispatched.</span>
          </div>
        </div>

        <div className="doc-warning">
          <AlertTriangle size={16} />
          <span><strong>RFQ scoring requires submitted responses.</strong> The "Compute Score" button
          only appears for candidates at <code>questionnaire_received</code> status or beyond.</span>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Registry Rules">
        <dl className="doc-glossary">
          <dt>Source Attribution</dt>
          <dd>Every consultant must have at least one discovery source documented (Tier 1–5).</dd>

          <dt>No Hard Deletes</dt>
          <dd>Consultants are archived (soft-deleted), never permanently removed.</dd>

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
          Scoring engine architecture, RFQ pipeline details, and terminology for
          the GID system spanning IONOS and VPS backends.
        </p>
      </div>

      <ExpandableSection title="VPS Scoring Dimensions (10-axis)" defaultOpen={true}>
        <p className="doc-paragraph">
          Scores are computed on the VPS from submitted RFQ questionnaire responses.
          Two-pass system: quantitative (algorithmic from structured data) and
          qualitative (AI-parsed from text responses).
        </p>

        <div className="doc-gates-table">
          <div className="doc-gates-row doc-gates-row--header">
            <span>Dimension</span>
            <span>Weight</span>
            <span>Source</span>
            <span>Logic</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Scale Match</strong></span>
            <span>15%</span>
            <span>RFQ §1 + FYI</span>
            <span>Comparable project sizes vs. client target SF</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Financial Resilience</strong></span>
            <span>10%</span>
            <span>RFQ §1</span>
            <span>Annual revenue, insurance, financial stability signals</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Geographic Alignment</strong></span>
            <span>10%</span>
            <span>RFQ §1 + KYC</span>
            <span>Office proximity to project site, service area coverage</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Capability Coverage</strong></span>
            <span>20%</span>
            <span>RFQ §2</span>
            <span>Discipline-specific capabilities vs. project requirements</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Portfolio Relevance</strong></span>
            <span>15%</span>
            <span>RFQ §3</span>
            <span>Similar completed projects, luxury experience depth</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Tech Compatibility</strong></span>
            <span>5%</span>
            <span>RFQ §2</span>
            <span>Software tools, BIM capability, delivery platforms</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Credentials</strong></span>
            <span>5%</span>
            <span>RFQ §1</span>
            <span>Licenses, certifications, professional memberships</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Philosophy Alignment</strong></span>
            <span>10%</span>
            <span>RFQ §4</span>
            <span>Design philosophy, client communication approach</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Methodology Fit</strong></span>
            <span>5%</span>
            <span>RFQ §4</span>
            <span>Project management approach, timeline methodology</span>
          </div>
          <div className="doc-gates-row">
            <span><strong>Collaboration Maturity</strong></span>
            <span>5%</span>
            <span>RFQ §4</span>
            <span>Team integration, conflict resolution, communication style</span>
          </div>
        </div>

        <div className="doc-formula">
          <strong>Overall Score</strong>
          <code>Overall = Σ(dimension_score × weight) → normalized 0–100</code>
          <p className="doc-example">
            Quantitative and Qualitative sub-scores are also returned for transparency.
          </p>
        </div>
      </ExpandableSection>

      <ExpandableSection title="RFQ Questionnaire Structure" defaultOpen={true}>
        <p className="doc-paragraph">
          55 question templates seeded across 4 disciplines × 5 sections. Each discipline
          receives a tailored questionnaire with discipline-specific questions in Section 2.
        </p>

        <div className="doc-context-table">
          <div className="doc-context-row doc-context-row--header">
            <span>Section</span>
            <span>Title</span>
            <span>Purpose</span>
          </div>
          <div className="doc-context-row">
            <span><strong>§1</strong></span>
            <span>Firm Baseline & Financials</span>
            <span>Revenue, team size, insurance, years in business</span>
          </div>
          <div className="doc-context-row">
            <span><strong>§2</strong></span>
            <span>Discipline-Specific</span>
            <span>Capabilities tailored to Architect / ID / PM / GC</span>
          </div>
          <div className="doc-context-row">
            <span><strong>§3</strong></span>
            <span>Portfolio Evidence</span>
            <span>3–5 comparable projects with budget, SF, features</span>
          </div>
          <div className="doc-context-row">
            <span><strong>§4</strong></span>
            <span>Team Synergy & Style</span>
            <span>Working style, communication, conflict resolution</span>
          </div>
          <div className="doc-context-row">
            <span><strong>§5</strong></span>
            <span>Project-Specific</span>
            <span>Custom questions based on project features from FYI</span>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Engagement Pipeline">
        <div className="doc-substeps">
          <div className="doc-substep">
            <span className="doc-substep-num">1</span>
            <div className="doc-substep-content">
              <strong>Shortlisted</strong>
              <p>Consultant added to project shortlist from Shortlist tab.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">2</span>
            <div className="doc-substep-content">
              <strong>Contacted</strong>
              <p>Initial contact made by advisory team.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">3</span>
            <div className="doc-substep-content">
              <strong>Questionnaire Sent</strong>
              <p>RFQ invitation dispatched via rfq.not-4.sale. Consultant receives secure link + password.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">4</span>
            <div className="doc-substep-content">
              <strong>Response Received</strong>
              <p>Consultant has submitted their questionnaire. Auto-detected by 30-second polling.
              Candidate is now eligible for VPS scoring.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">5</span>
            <div className="doc-substep-content">
              <strong>Under Review</strong>
              <p>Advisory team reviewing scores and RFQ responses. May schedule meetings.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">6</span>
            <div className="doc-substep-content">
              <strong>Proposal</strong>
              <p>Formal proposal or scope of work submitted by consultant.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">7</span>
            <div className="doc-substep-content">
              <strong>Engaged</strong>
              <p>Client has selected this consultant; terms being finalized.</p>
            </div>
          </div>
          <div className="doc-substep">
            <span className="doc-substep-num">8</span>
            <div className="doc-substep-content">
              <strong>Contracted</strong>
              <p>Agreement signed. Consultant is part of the project team.</p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Synergy Sandbox">
        <p className="doc-paragraph">
          The Synergy Sandbox (Tab 5) tests team chemistry by simulating how 4-person teams
          would work together across disciplines. It calls the VPS synergy engine.
        </p>
        <dl className="doc-glossary">
          <dt>Team Configuration</dt>
          <dd>One candidate per discipline slot. Saved configs can be compared side-by-side.</dd>

          <dt>Synergy Score</dt>
          <dd>Overall team chemistry rating (0–100) computed from pairwise compatibility.</dd>

          <dt>Conflict Nodes</dt>
          <dd>Detected potential friction points between team members (e.g., competing
          design philosophies, overlapping territorial claims).</dd>

          <dt>Collaboration Score</dt>
          <dd>How well the team communicates, based on working style overlap from RFQ §4.</dd>
        </dl>
      </ExpandableSection>

      <ExpandableSection title="GID Terminology">
        <dl className="doc-glossary">
          <dt>RFQ</dt>
          <dd>Request for Qualifications — a structured questionnaire sent to shortlisted
          consultants via the external portal (rfq.not-4.sale).</dd>

          <dt>Invitation</dt>
          <dd>A secure access record created by the Shortlist tab. Contains access token,
          hashed password, expiry date, and project scope.</dd>

          <dt>Quantitative Score</dt>
          <dd>Algorithmic score computed from structured RFQ data (numbers, selections, ranges).</dd>

          <dt>Qualitative Score</dt>
          <dd>AI-parsed score from text responses in the questionnaire (philosophy, approach descriptions).</dd>

          <dt>Overall Score</dt>
          <dd>Weighted combination of all 10 scoring dimensions, normalized to 0–100.</dd>

          <dt>Match Tier</dt>
          <dd>Classification: Top Match (80+), Good Fit (60–79), Consider (40–59), Below Threshold (&lt;40).</dd>

          <dt>Engagement</dt>
          <dd>IONOS record linking a consultant to a project with pipeline tracking.</dd>

          <dt>Team Config</dt>
          <dd>A saved Synergy Sandbox configuration with one candidate per discipline slot.</dd>

          <dt>Conflict Node</dt>
          <dd>A detected potential friction point between two team members in the synergy simulation.</dd>
        </dl>
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

.doc-status--pass { background: rgba(46, 125, 50, 0.15); color: ${COLORS.success}; }
.doc-status--caution { background: rgba(245, 124, 0, 0.15); color: ${COLORS.warning}; }
.doc-status--fail { background: rgba(211, 47, 47, 0.15); color: ${COLORS.error}; }
.doc-status--required { background: rgba(211, 47, 47, 0.15); color: ${COLORS.error}; }

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

.doc-score-question {
  font-style: italic;
  color: ${COLORS.textMuted};
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
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
  grid-template-columns: 120px 180px 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  align-items: center;
}

.doc-context-row:last-child { border-bottom: none; }

.doc-context-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
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

.doc-gates-row:last-child { border-bottom: none; }

.doc-gates-row--header {
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

.doc-threshold-row:last-child { border-bottom: none; }

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
.doc-glossary { margin: 0; }

.doc-glossary dt {
  font-weight: 600;
  color: ${COLORS.text};
  margin-top: 1rem;
}

.doc-glossary dt:first-child { margin-top: 0; }

.doc-glossary dd {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  line-height: 1.5;
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
  .doc-dual-score { grid-template-columns: 1fr; }
  .doc-threshold-row,
  .doc-context-row,
  .doc-gates-row { grid-template-columns: 1fr; gap: 0.25rem; }
  .doc-tabs { flex-wrap: wrap; }
  .doc-tab { flex: 1; min-width: 80px; text-align: center; }
}

/* Print Mode */
.doc-print-mode { padding: 0 2rem; }
.doc-print-mode .doc-content { padding: 1rem 0; }
.doc-print-header { padding: 2rem 0 1.5rem; border-bottom: 2px solid #1e3a5f; margin-bottom: 1rem; }
.doc-print-header__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem; font-weight: 700; color: #1e3a5f; margin: 0;
}
.doc-print-header__subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; color: #6b6b6b; margin: 0.5rem 0 0;
}
.doc-print-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem; font-weight: 600; color: #1e3a5f;
  border-bottom: 1px solid #e5e5e0; padding: 1.5rem 0 0.5rem;
  margin: 2rem 0 1rem; page-break-after: avoid;
}
.doc-print-section-title:first-of-type { margin-top: 0; }
.doc-print-mode .doc-card { break-inside: avoid; page-break-inside: avoid; overflow: hidden; }
.doc-print-mode .doc-expandable { break-inside: avoid; page-break-inside: avoid; }
`;
