/**
 * GIDDocumentation.jsx — 4-tab documentation panel for GID module
 * Follows the standard N4S documentation pattern.
 */

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

const TABS = ['Overview', 'Workflow', 'Gates', 'Reference'];

const GIDDocumentation = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleExportPdf = () => {
    const link = document.createElement('a');
    link.href = '/docs/N4S-GID-Documentation.pdf';
    link.download = 'N4S-GID-Documentation.pdf';
    link.click();
  };

  return (
    <div className="n4s-docs-panel">
      <div className="n4s-docs-panel__header">
        <h2>GID Documentation</h2>
        <div className="n4s-docs-panel__header-actions">
          <button className="n4s-docs-panel__export-btn" onClick={handleExportPdf} title="Export PDF">
            <Download size={14} /> PDF
          </button>
          <button className="n4s-docs-panel__close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="n4s-docs-panel__tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`n4s-docs-panel__tab ${activeTab === i ? 'n4s-docs-panel__tab--active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="n4s-docs-panel__content">
        {activeTab === 0 && (
          <div className="n4s-docs-content">
            <h3>What Is GID?</h3>
            <p>
              GID (Get It Done) curates and matches creative, project management, and delivery team consultants 
              to support the client's luxury residential project. Instead of "who do we know?", GID asks 
              <strong> "who's actually delivering at this level, in this location, right now?"</strong>
            </p>

            <h3>Four Disciplines</h3>
            <p><strong>Architect</strong> — Design visionary. Style alignment with client's Taste Exploration profile is the primary filter.</p>
            <p><strong>Interior Designer</strong> — Space storyteller. Must complement (not compete with) the architect.</p>
            <p><strong>Project Manager / Owner's Rep</strong> — Client's advocate. Budget discipline, schedule management, local expertise.</p>
            <p><strong>General Contractor</strong> — The builder. Track record on similar-scale luxury projects in the geography.</p>

            <h3>Data Flow</h3>
            <p>
              GID reads from KYC (location, budget, style preferences), FYI (program complexity, features), 
              and MVP (design brief) to match consultants. Results feed downstream to LCD Portal ("Meet Your Team") 
              and Parker AI (client can ask about their team).
            </p>

            <h3>Evidence-Based Curation</h3>
            <p>
              Every consultant in the GID Registry is backed by verifiable data — building permits, publication features, 
              award records, professional directories, and real estate reverse-engineering. Source attribution is tracked 
              for every entry.
            </p>
          </div>
        )}

        {activeTab === 1 && (
          <div className="n4s-docs-content">
            <h3>Workflow Steps</h3>

            <h4>Step 1: Build the Registry</h4>
            <p>
              The LRA team populates the consultant database by adding firms across all four disciplines. 
              Each entry includes firm details, service areas, specialties, budget range, and portfolio projects 
              with verified features.
            </p>

            <h4>Step 2: Discovery (Phase 3)</h4>
            <p>
              AI-assisted search discovers new consultant candidates from permit records, publications, award lists, 
              and professional directories. The team reviews and approves additions before they enter the registry.
            </p>

            <h4>Step 3: Matching (Phase 2)</h4>
            <p>
              For a given project, GID runs the dual scoring algorithm (Client Fit + Project Fit) across the registry. 
              Geographic proximity, budget alignment, style compatibility, experience, quality signals, and feature 
              specialization are all weighted and scored.
            </p>

            <h4>Step 4: Shortlisting</h4>
            <p>
              Top matches are shortlisted, creating engagement records that track the outreach pipeline from 
              initial contact through meeting and proposal to contracted status.
            </p>

            <h4>Step 5: Team Assembly (Phase 4)</h4>
            <p>
              The advisory team and client select their final team across all four disciplines. Chemistry notes 
              from client introductions inform the final choice. The assembled team is exported to the LCD Portal.
            </p>
          </div>
        )}

        {activeTab === 2 && (
          <div className="n4s-docs-content">
            <h3>Prerequisites</h3>
            <p>Before GID matching can run, these must be complete:</p>

            <h4>Gate 1: KYC Minimum</h4>
            <p>
              Client location (city, state, country) and total project budget must be entered. 
              These are the minimum inputs for geographic and budget filtering.
            </p>

            <h4>Gate 2: FYI Program</h4>
            <p>
              At least a basic space program should exist (total SF, zone breakdown) to enable 
              feature matching and scale assessment.
            </p>

            <h4>Gate 3: Taste Exploration (Optional)</h4>
            <p>
              If the principal has completed Taste Exploration (P1.A.5), style compatibility scoring 
              becomes available. Without it, style matching uses 0 as the base score.
            </p>

            <h3>Registry Rules</h3>
            <p><strong>Source Attribution:</strong> Every consultant must have at least one discovery source documented.</p>
            <p><strong>No Hard Deletes:</strong> Consultants are archived (soft-deleted), never permanently removed.</p>
            <p><strong>Verification Tiers:</strong> Pending → Verified (team has confirmed data) → Partner (active N4S relationship).</p>
          </div>
        )}

        {activeTab === 3 && (
          <div className="n4s-docs-content">
            <h3>Matching Algorithm (Live — Phase 2)</h3>
            <table className="n4s-docs-table">
              <thead>
                <tr><th>Dimension</th><th>Max</th><th>Source</th></tr>
              </thead>
              <tbody>
                <tr><td>Geographic Relevance</td><td>20</td><td>KYC location vs service areas &amp; HQ state</td></tr>
                <tr><td>Budget Alignment</td><td>25</td><td>KYC total budget vs consultant min/max range</td></tr>
                <tr><td>Style Compatibility</td><td>20</td><td>Taste axes &amp; style tags vs consultant specialties</td></tr>
                <tr><td>Experience Tier</td><td>15</td><td>Years of experience (20+/12+/8+/5+)</td></tr>
                <tr><td>Quality Signal</td><td>20</td><td>Average rating × 4 (unrated = 10 baseline)</td></tr>
                <tr><td>Feature Specialization</td><td>10</td><td>FYI included space features vs portfolio features</td></tr>
              </tbody>
            </table>
            <p>Total: 110 raw points, normalized to 100 per score.</p>

            <h3>Dual Scoring (Mirrors BAM v3.0)</h3>
            <p><strong>Client Fit Score:</strong> Weighted toward Style (×1.5), Quality (×1.2). Measures how well the consultant matches the client's taste, lifestyle, and quality expectations.</p>
            <p><strong>Project Fit Score:</strong> Weighted toward Budget (×1.5), Geography (×1.2), Features (×1.2). Measures practical alignment with project requirements and logistics.</p>
            <p><strong>Combined Score:</strong> Average of Client Fit and Project Fit.</p>

            <h3>Match Tiers</h3>
            <p><strong>Top Match (80–100):</strong> High confidence — present to client. Gold badge.</p>
            <p><strong>Good Fit (60–79):</strong> Strong candidate with minor gaps. Navy badge.</p>
            <p><strong>Consider (40–59):</strong> Worth discussion, may need compromise. Muted badge.</p>
            <p><strong>Below Threshold (&lt;40):</strong> Filtered out unless manually overridden.</p>

            <h3>Prerequisite Gates</h3>
            <p><strong>Required:</strong> Project City (KYC), Total Project Budget (KYC).</p>
            <p><strong>Recommended:</strong> Taste axes, style tags, FYI space selections, target SF. Matching runs with available data — more data yields better scores.</p>

            <h3>Data Source Tiers</h3>
            <p><strong>Tier 1:</strong> Public records (building permits, planning commissions)</p>
            <p><strong>Tier 2:</strong> Publications & awards (AD100, ASID, AIA)</p>
            <p><strong>Tier 3:</strong> Luxury real estate reverse-engineering</p>
            <p><strong>Tier 4:</strong> Professional directories (AIA, ASID, NAHB, Houzz)</p>
            <p><strong>Tier 5:</strong> AI-assisted web discovery</p>

            <h3>Engagement Pipeline</h3>
            <p>Shortlisted → Reached Out → Responded → Meeting Scheduled → Proposal Received → Engaged → Contracted</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GIDDocumentation;
