/**
 * KYSDocumentation.jsx - Know Your Site Documentation
 * 
 * 4-tab documentation following N4S pattern:
 * 1. Overview - Purpose and value proposition
 * 2. Workflow - How to use the assessment
 * 3. Gates - Deal-breakers and traffic lights
 * 4. Reference - Categories and scoring guide
 */

import React, { useState } from 'react';
import { X, BookOpen, GitBranch, Flag, FileText } from 'lucide-react';

const KYSDocumentation = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'gates', label: 'Gates', icon: Flag },
    { id: 'reference', label: 'Reference', icon: FileText },
  ];

  return (
    <div className="kys-docs">
      <div className="kys-docs__header">
        <h2>KYS Documentation</h2>
        <p>Know Your Site — Site-Vision Compatibility Assessment</p>
        <button className="kys-docs__close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="kys-docs__tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`kys-docs__tab ${activeTab === tab.id ? 'kys-docs__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="kys-docs__content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'workflow' && <WorkflowTab />}
        {activeTab === 'gates' && <GatesTab />}
        {activeTab === 'reference' && <ReferenceTab />}
      </div>

      <style>{`
        .kys-docs {
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e5e0;
          max-width: 900px;
          margin: 0 auto;
          max-height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
        }

        .kys-docs__header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e5e0;
          position: relative;
        }

        .kys-docs__header h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0;
        }

        .kys-docs__header p {
          color: #6b6b6b;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }

        .kys-docs__close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: #6b6b6b;
          cursor: pointer;
          padding: 0.5rem;
        }

        .kys-docs__close:hover {
          color: #1a1a1a;
        }

        .kys-docs__tabs {
          display: flex;
          border-bottom: 1px solid #e5e5e0;
          padding: 0 1.5rem;
        }

        .kys-docs__tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b6b6b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .kys-docs__tab:hover {
          color: #1a1a1a;
        }

        .kys-docs__tab--active {
          color: #1e3a5f;
          border-bottom-color: #1e3a5f;
        }

        .kys-docs__content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .kys-docs__section {
          margin-bottom: 2rem;
        }

        .kys-docs__section:last-child {
          margin-bottom: 0;
        }

        .kys-docs__section h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.125rem;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0 0 0.75rem 0;
        }

        .kys-docs__section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 1rem 0 0.5rem 0;
        }

        .kys-docs__section p {
          font-size: 0.875rem;
          color: #6b6b6b;
          line-height: 1.6;
          margin: 0 0 0.75rem 0;
        }

        .kys-docs__section ul {
          margin: 0 0 0.75rem 0;
          padding-left: 1.25rem;
        }

        .kys-docs__section li {
          font-size: 0.875rem;
          color: #6b6b6b;
          line-height: 1.6;
          margin-bottom: 0.25rem;
        }

        .kys-docs__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
          margin: 0.75rem 0;
        }

        .kys-docs__table th,
        .kys-docs__table td {
          padding: 0.5rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e5e0;
        }

        .kys-docs__table th {
          background: #f5f0e8;
          font-weight: 600;
          color: #1a1a1a;
        }

        .kys-docs__table td {
          color: #6b6b6b;
        }

        .kys-docs__callout {
          padding: 1rem;
          background: #f5f0e8;
          border-radius: 6px;
          border-left: 3px solid #c9a227;
          margin: 1rem 0;
        }

        .kys-docs__callout p {
          margin: 0;
          font-style: italic;
        }

        .kys-docs__light {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 0.5rem;
          vertical-align: middle;
        }

        .kys-docs__light--green { background: #2e7d32; }
        .kys-docs__light--amber { background: #f57c00; }
        .kys-docs__light--red { background: #d32f2f; }
      `}</style>
    </div>
  );
};

// =============================================================================
// TAB CONTENT
// =============================================================================

const OverviewTab = () => (
  <>
    <div className="kys-docs__section">
      <h3>What is KYS?</h3>
      <p>
        KYS (Know Your Site) is a gateway assessment module that evaluates whether a potential 
        site is compatible with your client's vision <strong>before capital is committed</strong>.
      </p>
      <div className="kys-docs__callout">
        <p>"You make your money on the buy." — Arvin</p>
      </div>
    </div>

    <div className="kys-docs__section">
      <h3>The Palazzo Problem</h3>
      <p>
        A successful client wanted to build an authentic Italian Palazzo in Palm Beach. 
        He bought a site that was:
      </p>
      <ul>
        <li>Too long and narrow — only the master bedroom got ocean views</li>
        <li>Too close to a hotel — privacy and context issues</li>
        <li>In the wrong neighborhood — surrounding homes were $15-25M, not $60M+</li>
        <li>Wrong market for the style — ornate Palazzo had no buyer demand</li>
      </ul>
      <p>
        He built a magnificent house that hasn't sold in over 4 years. 
        <strong> KYS prevents this outcome.</strong>
      </p>
    </div>

    <div className="kys-docs__section">
      <h3>N4S Differentiator</h3>
      <p>
        A broker's success is measured by closed transactions. N4S success is measured by 
        outcomes — often years after acquisition. We are incentivized to tell you when a 
        site won't serve your vision, even when others won't.
      </p>
    </div>

    <div className="kys-docs__section">
      <h3>Key Features</h3>
      <ul>
        <li><strong>7 Assessment Categories</strong> — Comprehensive evaluation framework</li>
        <li><strong>10 Deal-Breakers</strong> — Automatic RED flags for fatal issues</li>
        <li><strong>Multi-Site Comparison</strong> — Evaluate up to 4 sites side-by-side</li>
        <li><strong>Traffic Light System</strong> — Clear GO/CAUTION/NO-GO recommendations</li>
        <li><strong>FYI & KYM Handoff</strong> — Findings flow forward to inform design</li>
      </ul>
    </div>
  </>
);

const WorkflowTab = () => (
  <>
    <div className="kys-docs__section">
      <h3>Position in N4S Journey</h3>
      <table className="kys-docs__table">
        <thead>
          <tr>
            <th>Phase</th>
            <th>Module</th>
            <th>Question Answered</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>KYC</td>
            <td>Who is the client and what is their vision?</td>
          </tr>
          <tr>
            <td>2</td>
            <td>FYI</td>
            <td>What spaces and sizes does the program need?</td>
          </tr>
          <tr>
            <td>3</td>
            <td>MVP</td>
            <td>Does the layout pass validation gates?</td>
          </tr>
          <tr>
            <td style={{ background: '#f5f0e8', fontWeight: 600 }}>4</td>
            <td style={{ background: '#f5f0e8', fontWeight: 600 }}>KYS ← YOU ARE HERE</td>
            <td style={{ background: '#f5f0e8', fontWeight: 600 }}>Can THIS site accommodate the validated program?</td>
          </tr>
          <tr>
            <td>5</td>
            <td>KYM</td>
            <td>How does this position in the market?</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="kys-docs__section">
      <h3>Why KYS Comes After MVP</h3>
      <p>
        Site assessment requires knowing the <strong>validated program</strong> — what you're actually 
        trying to fit on the site. A client might start thinking 10,000 SF but after FYI and MVP 
        validation, realize they need 15,000 SF. This changes everything about site requirements:
      </p>
      <ul>
        <li>Larger footprint needs more buildable area</li>
        <li>Guest house may require additional setbacks</li>
        <li>More principal rooms means more view distribution needed</li>
        <li>Higher tier may shift market positioning</li>
      </ul>
      <p>
        KYS is still a <strong>gateway before capital commitment</strong> — it just comes after the 
        program is locked, not before.
      </p>
    </div>

    <div className="kys-docs__section">
      <h3>Assessment Workflow</h3>
      <h4>Step 1: Add Site</h4>
      <p>Create a new site assessment with basic property information.</p>

      <h4>Step 2: Score Categories</h4>
      <p>Work through each of the 7 categories, scoring factors from 1-5:</p>
      <ul>
        <li>Physical Site Capacity</li>
        <li>Views & Aspect</li>
        <li>Privacy & Boundaries</li>
        <li>Adjacencies & Context</li>
        <li>Market & Demographic Alignment</li>
        <li>Vision Compatibility</li>
        <li>Regulatory & Practical</li>
      </ul>

      <h4>Step 3: Review Deal-Breakers</h4>
      <p>The system automatically checks for deal-breaker conditions based on your scores.</p>

      <h4>Step 4: Compare Sites (Optional)</h4>
      <p>If evaluating multiple sites, use the comparison view to rank them.</p>

      <h4>Step 5: Document Handoff Notes</h4>
      <p>Record constraints and insights that flow to KYM module.</p>
    </div>

    <div className="kys-docs__section">
      <h3>Data Flow</h3>
      <p><strong>FROM prior modules (inputs to KYS):</strong></p>
      <ul>
        <li><strong>From KYC:</strong> Client flexibility index, vision description, budget</li>
        <li><strong>From FYI:</strong> Target SF, footprint, levels, guest house, principal rooms</li>
        <li><strong>From MVP:</strong> Validated tier, adjacency requirements, final program</li>
      </ul>
      <p><strong>TO subsequent modules (outputs from KYS):</strong></p>
      <ul>
        <li><strong>To KYM:</strong> Market positioning insights, site context for comparables</li>
      </ul>
    </div>
  </>
);

const GatesTab = () => (
  <>
    <div className="kys-docs__section">
      <h3>Traffic Light System</h3>
      <table className="kys-docs__table">
        <thead>
          <tr>
            <th>Light</th>
            <th>Score Range</th>
            <th>Meaning</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="kys-docs__light kys-docs__light--green"></span>GREEN</td>
            <td>4.0 - 5.0</td>
            <td>Strong alignment</td>
            <td>Proceed with acquisition</td>
          </tr>
          <tr>
            <td><span className="kys-docs__light kys-docs__light--amber"></span>AMBER</td>
            <td>2.5 - 3.9</td>
            <td>Concerns exist</td>
            <td>Proceed only with mitigation strategy</td>
          </tr>
          <tr>
            <td><span className="kys-docs__light kys-docs__light--red"></span>RED</td>
            <td>0.0 - 2.4</td>
            <td>Fundamental misalignment</td>
            <td>Do not proceed</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="kys-docs__section">
      <h3>Override Rules</h3>
      <p>Even if the overall score is above 2.5, the assessment overrides to RED if:</p>
      <ul>
        <li>Any Deal-Breaker is triggered</li>
        <li>Two or more categories score RED</li>
      </ul>
      <p>The assessment caps at AMBER if:</p>
      <ul>
        <li>Three or more categories score AMBER</li>
      </ul>
    </div>

    <div className="kys-docs__section">
      <h3>10 Deal-Breakers</h3>
      <p>These conditions automatically trigger a RED assessment:</p>
      <table className="kys-docs__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Deal-Breaker</th>
            <th>Trigger</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>DB1</td><td>Lot geometry incompatible with vision massing</td><td>Factor 1.1 ≤ 1</td></tr>
          <tr><td>DB2</td><td>Primary views cannot be achieved (Palazzo Problem)</td><td>Factor 2.2 ≤ 1</td></tr>
          <tr><td>DB3</td><td>Adjacent commercial/institutional mismatch</td><td>Factor 4.3 ≤ 1</td></tr>
          <tr><td>DB4</td><td>Neighboring values create price ceiling</td><td>Factor 4.1 ≤ 1.5</td></tr>
          <tr><td>DB5</td><td>Style has no absorption history</td><td>Factor 5.3 ≤ 1</td></tr>
          <tr><td>DB6</td><td>Fixed vision + major compromises needed</td><td>6.3 ≤ 2 AND 6.2 ≤ 2</td></tr>
          <tr><td>DB7</td><td>Zoning prohibits intended use/scale</td><td>Factor 7.1 ≤ 1</td></tr>
          <tr><td>DB8</td><td>Design review would block key elements</td><td>Factor 7.3 ≤ 1</td></tr>
          <tr><td>DB9</td><td>Geotechnical conditions infeasible</td><td>Factor 1.5 ≤ 1</td></tr>
          <tr><td>DB10</td><td>HOA prohibits intended style/features</td><td>Factor 7.5 ≤ 1</td></tr>
        </tbody>
      </table>
    </div>

    <div className="kys-docs__section">
      <h3>Waiving Deal-Breakers</h3>
      <p>
        If a client chooses to proceed despite a RED assessment, this can be documented 
        as a "Waived Deal-Breaker" in the handoff notes. This creates accountability 
        documentation and ensures the risk is acknowledged in writing.
      </p>
    </div>
  </>
);

const ReferenceTab = () => (
  <>
    <div className="kys-docs__section">
      <h3>Category Weights</h3>
      <table className="kys-docs__table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Weight</th>
            <th>Factors</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Views & Aspect</td><td>18%</td><td>4</td></tr>
          <tr><td>Physical Site Capacity</td><td>15%</td><td>5</td></tr>
          <tr><td>Privacy & Boundaries</td><td>15%</td><td>5</td></tr>
          <tr><td>Adjacencies & Context</td><td>15%</td><td>5</td></tr>
          <tr><td>Market & Demographic Alignment</td><td>15%</td><td>4</td></tr>
          <tr><td>Vision Compatibility</td><td>12%</td><td>3</td></tr>
          <tr><td>Regulatory & Practical</td><td>10%</td><td>5</td></tr>
        </tbody>
      </table>
    </div>

    <div className="kys-docs__section">
      <h3>Scoring Scale</h3>
      <table className="kys-docs__table">
        <thead>
          <tr>
            <th>Score</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>5</td><td>Excellent — Ideal conditions, no concerns</td></tr>
          <tr><td>4</td><td>Good — Minor issues, easily addressed</td></tr>
          <tr><td>3</td><td>Acceptable — Some concerns, workable with design</td></tr>
          <tr><td>2</td><td>Concerning — Significant issues, requires mitigation</td></tr>
          <tr><td>1</td><td>Critical — Fundamental problem, may be deal-breaker</td></tr>
        </tbody>
      </table>
    </div>

    <div className="kys-docs__section">
      <h3>Quick Reference: All Factors</h3>
      <h4>1. Physical Site Capacity (15%)</h4>
      <ul>
        <li>1.1 Lot dimensions & geometry</li>
        <li>1.2 Buildable area vs total</li>
        <li>1.3 Topography and grade</li>
        <li>1.4 Orientation flexibility</li>
        <li>1.5 Geotechnical conditions</li>
      </ul>

      <h4>2. Views & Aspect (18%)</h4>
      <ul>
        <li>2.1 Primary view quality & permanence</li>
        <li>2.2 View breadth (% of rooms with views)</li>
        <li>2.3 Solar orientation</li>
        <li>2.4 Exposure to elements</li>
      </ul>

      <h4>3. Privacy & Boundaries (15%)</h4>
      <ul>
        <li>3.1 Setbacks from boundaries</li>
        <li>3.2 Visual screening potential</li>
        <li>3.3 Acoustic separation</li>
        <li>3.4 Elevation relative to neighbors</li>
        <li>3.5 Entry sequence potential</li>
      </ul>

      <h4>4. Adjacencies & Context (15%)</h4>
      <ul>
        <li>4.1 Neighboring property values</li>
        <li>4.2 Stylistic harmony</li>
        <li>4.3 Commercial/institutional proximity</li>
        <li>4.4 Road noise & traffic</li>
        <li>4.5 Future development risk</li>
      </ul>

      <h4>5. Market & Demographic Alignment (15%)</h4>
      <ul>
        <li>5.1 Style resonance with buyers</li>
        <li>5.2 Price positioning vs comps</li>
        <li>5.3 Absorption history</li>
        <li>5.4 Buyer demographic match</li>
      </ul>

      <h4>6. Vision Compatibility (12%)</h4>
      <ul>
        <li>6.1 Vision manifestation potential</li>
        <li>6.2 Required compromises</li>
        <li>6.3 Client flexibility index</li>
      </ul>

      <h4>7. Regulatory & Practical (10%)</h4>
      <ul>
        <li>7.1 Zoning & FAR constraints</li>
        <li>7.2 Height & envelope restrictions</li>
        <li>7.3 Historic/design review</li>
        <li>7.4 Permitting complexity</li>
        <li>7.5 HOA/community covenants</li>
      </ul>
    </div>
  </>
);

export default KYSDocumentation;
