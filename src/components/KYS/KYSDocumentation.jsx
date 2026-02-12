/**
 * KYSDocumentation.jsx - Know Your Site Documentation
 * 
 * Documentation panel following N4S standard format with 4 tabs:
 * - Overview: What KYS is and what it delivers
 * - Workflow: Step-by-step process and where it fits in the project
 * - Gates: Deal-breakers and traffic light thresholds
 * - Reference: Categories, factors, and scoring guide
 * 
 * Client-facing language with progressive technical detail.
 */

import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle, XCircle, FileDown } from 'lucide-react';
import { exportDocumentationPdf } from '../../utils/docsPdfExport';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  copper: '#C4A484',
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
 * Overview Tab Content
 */
function OverviewTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">What is KYS?</h2>
        <p className="doc-paragraph">
          KYS (Know Your Site) is a gateway assessment module that evaluates whether a potential 
          site can accommodate your validated program before capital is committed. It answers the 
          critical question: can THIS site deliver what we need for THIS mansion?
        </p>
        <p className="doc-paragraph">
          Site selection is one of the most consequential decisions in luxury residential development. 
          The wrong site can create constraints that compromise your vision, limit resale potential, 
          or result in years of unsold inventory. KYS provides an objective framework to evaluate 
          sites against your specific program requirements.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">The Palazzo Problem</h3>
        <p className="doc-paragraph">
          A successful client wanted to build an authentic Italian Palazzo in Palm Beach. He bought 
          a site that appeared adequate but had critical misalignments:
        </p>
        <ul className="doc-list">
          <li>
            <XCircle size={16} className="doc-list-icon error" />
            <div>
              <strong>Too Long and Narrow</strong>
              <p>Only the master bedroom got ocean views — other principal rooms faced neighbors</p>
            </div>
          </li>
          <li>
            <XCircle size={16} className="doc-list-icon error" />
            <div>
              <strong>Adjacent to Hotel</strong>
              <p>Privacy and context issues that couldn't be mitigated through design</p>
            </div>
          </li>
          <li>
            <XCircle size={16} className="doc-list-icon error" />
            <div>
              <strong>Wrong Neighborhood Values</strong>
              <p>Surrounding homes were $15-25M, creating a price ceiling below his $60M+ target</p>
            </div>
          </li>
          <li>
            <XCircle size={16} className="doc-list-icon error" />
            <div>
              <strong>No Market for Style</strong>
              <p>Ornate Palazzo style had no buyer demand in that micro-market</p>
            </div>
          </li>
        </ul>
        <p className="doc-paragraph">
          He built a magnificent house that hasn't sold in over 4 years. <strong>KYS prevents this outcome</strong> by 
          identifying these misalignments before acquisition.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Primary Outcomes</h3>
        <ul className="doc-list">
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>GO/NO-GO Recommendation</strong>
              <p>Clear traffic light assessment with supporting rationale</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Deal-Breaker Detection</strong>
              <p>Early identification of fatal site issues that cannot be mitigated</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Multi-Site Comparison</strong>
              <p>Objective ranking when evaluating multiple candidate sites</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>KYM Handoff</strong>
              <p>Site context and market insights flow forward to inform positioning</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">What's Included</h3>
        <div className="doc-grid-2">
          <div className="doc-feature">
            <div className="doc-feature-number">7</div>
            <div className="doc-feature-text">
              <strong>Assessment Categories</strong>
              <p>Comprehensive evaluation framework covering all site dimensions</p>
            </div>
          </div>
          <div className="doc-feature">
            <div className="doc-feature-number">31</div>
            <div className="doc-feature-text">
              <strong>Scoring Factors</strong>
              <p>Detailed sub-factors with scoring guides for consistent evaluation</p>
            </div>
          </div>
          <div className="doc-feature">
            <div className="doc-feature-number">10</div>
            <div className="doc-feature-text">
              <strong>Deal-Breakers</strong>
              <p>Automatic RED flags for conditions that cannot be mitigated</p>
            </div>
          </div>
          <div className="doc-feature">
            <div className="doc-feature-number">4</div>
            <div className="doc-feature-text">
              <strong>Site Comparison</strong>
              <p>Evaluate and rank up to four candidate sites side-by-side</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Workflow Tab Content
 */
function WorkflowTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">KYS Assessment Workflow</h2>
        <p className="doc-paragraph">
          Complete these steps to evaluate a potential site against your validated program. 
          The goal is to make an informed GO/NO-GO decision before committing capital.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Position in N4S Journey</h3>
        <p className="doc-paragraph">
          KYS comes after KYM because site assessment needs both the validated program (from MVP) 
          AND market context (from KYM). A client might start thinking 10,000 SF but after FYI 
          and MVP validation, realize they need 15,000 SF. KYM then establishes what the market 
          will bear for that program. Only then can we properly assess if a specific site works.
        </p>
        <div className="doc-workflow-phases">
          <div className="doc-phase">
            <div className="doc-phase-badge">1</div>
            <div className="doc-phase-content">
              <h4>KYC — Know Your Client</h4>
              <p>Define vision, lifestyle, and flexibility index</p>
            </div>
          </div>
          <div className="doc-phase">
            <div className="doc-phase-badge">2</div>
            <div className="doc-phase-content">
              <h4>FYI — Find Your Inspiration</h4>
              <p>Build space program with rooms and square footages</p>
            </div>
          </div>
          <div className="doc-phase">
            <div className="doc-phase-badge">3</div>
            <div className="doc-phase-content">
              <h4>MVP — Master Validation</h4>
              <p>Validate adjacencies and lock final program tier</p>
            </div>
          </div>
          <div className="doc-phase">
            <div className="doc-phase-badge">4</div>
            <div className="doc-phase-content">
              <h4>KYM — Know Your Market</h4>
              <p>Establish market context, comps, and price positioning</p>
            </div>
          </div>
          <div className="doc-phase doc-phase--active">
            <div className="doc-phase-badge">5</div>
            <div className="doc-phase-content">
              <h4>KYS — Know Your Site</h4>
              <p>Evaluate if candidate sites can accommodate validated program in market context</p>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Assessment Steps</h3>
        <div className="doc-steps">
          <div className="doc-step">
            <div className="doc-step-number">1</div>
            <div className="doc-step-content">
              <h4>Add Site</h4>
              <p>Create a new site assessment with basic property information: address, asking price, lot dimensions, and zoning.</p>
            </div>
          </div>
          <div className="doc-step">
            <div className="doc-step-number">2</div>
            <div className="doc-step-content">
              <h4>Score Categories</h4>
              <p>Work through each of the 7 categories, scoring factors from 1-5 based on site investigation findings.</p>
            </div>
          </div>
          <div className="doc-step">
            <div className="doc-step-number">3</div>
            <div className="doc-step-content">
              <h4>Review Deal-Breakers</h4>
              <p>The system automatically checks for deal-breaker conditions based on your scores and flags any triggered.</p>
            </div>
          </div>
          <div className="doc-step">
            <div className="doc-step-number">4</div>
            <div className="doc-step-content">
              <h4>Compare Sites</h4>
              <p>If evaluating multiple sites, use the comparison view to rank them objectively.</p>
            </div>
          </div>
          <div className="doc-step">
            <div className="doc-step-number">5</div>
            <div className="doc-step-content">
              <h4>Document Handoff</h4>
              <p>Record site constraints and market insights that flow to KYM module.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Data Flow</h3>
        <div className="doc-data-flow">
          <div className="doc-flow-section">
            <h4>Inputs from Prior Modules</h4>
            <ul>
              <li><strong>From KYC:</strong> Client flexibility index, vision description, budget parameters</li>
              <li><strong>From FYI:</strong> Target SF, footprint requirements, number of levels, guest house needs</li>
              <li><strong>From MVP:</strong> Validated tier (5K/10K/15K/20K), final adjacency requirements</li>
              <li><strong>From KYM:</strong> Market comparables, price positioning, buyer demographics, neighborhood context</li>
            </ul>
            <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
              Sites from KYM's Land Acquisition search are manually added to the KYS Site Library by the advisor. This is not an automatic import — the advisor selects which parcels to evaluate.
            </p>
          </div>
          <div className="doc-flow-section">
            <h4>Outputs (Site Selection Report)</h4>
            <ul>
              <li><strong>Site Assessment:</strong> GO/NO-GO recommendation with supporting rationale</li>
              <li><strong>Constraint Documentation:</strong> Site-specific constraints for design team</li>
              <li><strong>Deal-Breaker Log:</strong> Any waived deal-breakers with client acknowledgment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Gates Tab Content
 */
function GatesTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">Traffic Light System</h2>
        <p className="doc-paragraph">
          KYS uses a traffic light system to provide clear GO/CAUTION/NO-GO recommendations. 
          Scores are calculated from the weighted average of category scores, with override 
          rules for deal-breakers and multiple category failures.
        </p>
        
        <div className="doc-gates">
          <div className="doc-gate doc-gate--green">
            <div className="doc-gate-header">
              <span className="doc-gate-light"></span>
              <span className="doc-gate-label">GREEN</span>
            </div>
            <div className="doc-gate-content">
              <div className="doc-gate-range">Score: 4.0 - 5.0</div>
              <p>Strong alignment between site and program. Proceed with acquisition.</p>
            </div>
          </div>
          
          <div className="doc-gate doc-gate--amber">
            <div className="doc-gate-header">
              <span className="doc-gate-light"></span>
              <span className="doc-gate-label">AMBER</span>
            </div>
            <div className="doc-gate-content">
              <div className="doc-gate-range">Score: 2.5 - 3.9</div>
              <p>Concerns exist. Proceed only with documented mitigation strategy.</p>
            </div>
          </div>
          
          <div className="doc-gate doc-gate--red">
            <div className="doc-gate-header">
              <span className="doc-gate-light"></span>
              <span className="doc-gate-label">RED</span>
            </div>
            <div className="doc-gate-content">
              <div className="doc-gate-range">Score: 0.0 - 2.4</div>
              <p>Fundamental misalignment. Do not acquire this site for this program.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Override Rules</h3>
        <p className="doc-paragraph">
          Even if the overall score is above 2.5, the assessment overrides to RED if:
        </p>
        <ul className="doc-list-simple">
          <li>Any Deal-Breaker is triggered</li>
          <li>Two or more categories score RED</li>
        </ul>
        <p className="doc-paragraph">
          The assessment caps at AMBER (cannot be GREEN) if three or more categories score AMBER.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">10 Deal-Breakers</h3>
        <p className="doc-paragraph">
          These conditions automatically trigger a RED assessment regardless of overall score:
        </p>
        <div className="doc-dealbreakers">
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB1</span>
            <div className="doc-db-content">
              <strong>Lot geometry incompatible with vision massing</strong>
              <p>Triggered when Factor 1.1 ≤ 1</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB2</span>
            <div className="doc-db-content">
              <strong>Primary views cannot be achieved for principal rooms</strong>
              <p>Triggered when Factor 2.2 ≤ 1 (The Palazzo Problem)</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB3</span>
            <div className="doc-db-content">
              <strong>Adjacent commercial/institutional creates context mismatch</strong>
              <p>Triggered when Factor 4.3 ≤ 1</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB4</span>
            <div className="doc-db-content">
              <strong>Neighboring values create price ceiling below target</strong>
              <p>Triggered when Factor 4.1 ≤ 1.5</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB5</span>
            <div className="doc-db-content">
              <strong>Style vision has no absorption history in market</strong>
              <p>Triggered when Factor 5.3 ≤ 1</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB6</span>
            <div className="doc-db-content">
              <strong>Fixed vision client with site requiring major compromises</strong>
              <p>Triggered when Factor 6.3 ≤ 2 AND Factor 6.2 ≤ 2</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB7</span>
            <div className="doc-db-content">
              <strong>Zoning prohibits intended use or scale</strong>
              <p>Triggered when Factor 7.1 ≤ 1</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB8</span>
            <div className="doc-db-content">
              <strong>Historic/design review would block key design elements</strong>
              <p>Triggered when Factor 7.3 ≤ 1</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB9</span>
            <div className="doc-db-content">
              <strong>Geotechnical conditions make construction infeasible</strong>
              <p>Triggered when Factor 1.5 ≤ 1</p>
            </div>
          </div>
          <div className="doc-dealbreaker">
            <span className="doc-db-id">DB10</span>
            <div className="doc-db-content">
              <strong>HOA covenants prohibit intended style or features</strong>
              <p>Triggered when Factor 7.5 ≤ 1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Waiving Deal-Breakers</h3>
        <p className="doc-paragraph">
          If a client chooses to proceed despite a RED assessment, this can be documented as a 
          "Waived Deal-Breaker" in the handoff notes. This creates accountability documentation 
          and ensures the risk is acknowledged in writing before capital is committed.
        </p>
      </div>
    </div>
  );
}

/**
 * Reference Tab Content
 */
function ReferenceTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">Category Weights</h2>
        <p className="doc-paragraph">
          The overall score is calculated as a weighted average of category scores. Views & Aspect 
          receives the highest weight because view distribution is often the most difficult 
          constraint to overcome through design.
        </p>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Weight</th>
              <th>Factors</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Views & Aspect</td>
              <td>18%</td>
              <td>4</td>
            </tr>
            <tr>
              <td>Physical Site Capacity</td>
              <td>15%</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Privacy & Boundaries</td>
              <td>15%</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Adjacencies & Context</td>
              <td>15%</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Market & Demographic Alignment</td>
              <td>15%</td>
              <td>4</td>
            </tr>
            <tr>
              <td>Vision Compatibility</td>
              <td>12%</td>
              <td>3</td>
            </tr>
            <tr>
              <td>Regulatory & Practical</td>
              <td>10%</td>
              <td>5</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Scoring Scale</h3>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Score</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>5</strong></td>
              <td>Excellent — Ideal conditions, no concerns</td>
            </tr>
            <tr>
              <td><strong>4</strong></td>
              <td>Good — Minor issues, easily addressed</td>
            </tr>
            <tr>
              <td><strong>3</strong></td>
              <td>Acceptable — Some concerns, workable with design</td>
            </tr>
            <tr>
              <td><strong>2</strong></td>
              <td>Concerning — Significant issues, requires mitigation</td>
            </tr>
            <tr>
              <td><strong>1</strong></td>
              <td>Critical — Fundamental problem, may be deal-breaker</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">All Assessment Factors</h3>
        
        <div className="doc-category-ref">
          <h4>1. Physical Site Capacity (15%)</h4>
          <ul className="doc-factors">
            <li><span>1.1</span> Lot dimensions & geometry</li>
            <li><span>1.2</span> Buildable area vs total</li>
            <li><span>1.3</span> Topography and grade</li>
            <li><span>1.4</span> Orientation flexibility</li>
            <li><span>1.5</span> Geotechnical conditions</li>
          </ul>
        </div>

        <div className="doc-category-ref">
          <h4>2. Views & Aspect (18%)</h4>
          <ul className="doc-factors">
            <li><span>2.1</span> Primary view quality & permanence</li>
            <li><span>2.2</span> View breadth (% of principal rooms with views)</li>
            <li><span>2.3</span> Solar orientation</li>
            <li><span>2.4</span> Exposure to elements</li>
          </ul>
        </div>

        <div className="doc-category-ref">
          <h4>3. Privacy & Boundaries (15%)</h4>
          <ul className="doc-factors">
            <li><span>3.1</span> Setbacks from boundaries</li>
            <li><span>3.2</span> Visual screening potential</li>
            <li><span>3.3</span> Acoustic separation</li>
            <li><span>3.4</span> Elevation relative to neighbors</li>
            <li><span>3.5</span> Entry sequence potential</li>
          </ul>
        </div>

        <div className="doc-category-ref">
          <h4>4. Adjacencies & Context (15%)</h4>
          <ul className="doc-factors">
            <li><span>4.1</span> Neighboring property values</li>
            <li><span>4.2</span> Stylistic harmony</li>
            <li><span>4.3</span> Commercial/institutional proximity</li>
            <li><span>4.4</span> Road noise & traffic</li>
            <li><span>4.5</span> Future development risk</li>
          </ul>
        </div>

        <div className="doc-category-ref">
          <h4>5. Market & Demographic Alignment (15%)</h4>
          <ul className="doc-factors">
            <li><span>5.1</span> Style resonance with buyers</li>
            <li><span>5.2</span> Price positioning vs comps</li>
            <li><span>5.3</span> Absorption history</li>
            <li><span>5.4</span> Buyer demographic match</li>
          </ul>
        </div>

        <div className="doc-category-ref">
          <h4>6. Vision Compatibility (12%)</h4>
          <ul className="doc-factors">
            <li><span>6.1</span> Vision manifestation potential</li>
            <li><span>6.2</span> Required compromises</li>
            <li><span>6.3</span> Client flexibility index</li>
          </ul>
        </div>

        <div className="doc-category-ref">
          <h4>7. Regulatory & Practical (10%)</h4>
          <ul className="doc-factors">
            <li><span>7.1</span> Zoning & FAR constraints</li>
            <li><span>7.2</span> Height & envelope restrictions</li>
            <li><span>7.3</span> Historic/design review</li>
            <li><span>7.4</span> Permitting complexity</li>
            <li><span>7.5</span> HOA/community covenants</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Documentation Component
 */
export default function KYSDocumentation({ onClose, printAll }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef(null);
  
  const handleExportPdf = () => {
    exportDocumentationPdf({
      contentRef,
      setActiveTab,
      tabIds: ['overview', 'workflow', 'gates', 'reference'],
      moduleName: 'KYS',
      moduleSubtitle: 'Site-Vision Compatibility Assessment Guide',
      currentTab: activeTab,
      onStart: () => setIsExporting(true),
      onComplete: () => setIsExporting(false),
    });
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
          <h1 className="doc-print-header__title">KYS (Know Your Site) — Documentation</h1>
          <p className="doc-print-header__subtitle">N4S — Luxury Residential Advisory Platform</p>
        </div>
      )}
      {!printAll && (
      <div className="doc-header">
        <div className="doc-header-top">
          {onClose && (
            <button className="doc-close-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              Back to KYS
            </button>
          )}
          <button className="doc-export-btn" onClick={handleExportPdf} disabled={isExporting}>
            <FileDown size={16} className={isExporting ? 'spinning' : ''} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
        <h1 className="doc-title">Documentation</h1>
        <p className="doc-subtitle">N4S KYS — Site-Vision Compatibility Assessment Guide</p>

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
      <div className="doc-content" ref={contentRef}>
        {(printAll || activeTab === 'overview') && (
          <>{printAll && <h2 className="doc-print-section-title">1. Overview</h2>}<OverviewTab /></>
        )}
        {(printAll || activeTab === 'workflow') && (
          <>{printAll && <h2 className="doc-print-section-title">2. Workflow</h2>}<WorkflowTab /></>
        )}
        {(printAll || activeTab === 'gates') && (
          <>{printAll && <h2 className="doc-print-section-title">3. Gates & Validation</h2>}<GatesTab /></>
        )}
        {(printAll || activeTab === 'reference') && (
          <>{printAll && <h2 className="doc-print-section-title">4. Reference</h2>}<ReferenceTab /></>
        )}
      </div>

      <style>{documentationStyles}</style>
    </div>
  );
}

// Comprehensive CSS matching MVP Documentation style
const documentationStyles = `
.doc-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

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

.doc-tabs {
  display: flex;
  gap: 0;
  border-bottom: none;
}

.doc-tab {
  padding: 0.875rem 1.5rem;
  background-color: transparent;
  border: 1px solid ${COLORS.border};
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
  cursor: pointer;
  transition: all 0.15s ease;
  margin-right: -1px;
}

.doc-tab:hover {
  background-color: ${COLORS.background};
}

.doc-tab.active {
  background-color: ${COLORS.background};
  color: ${COLORS.text};
  border-color: ${COLORS.border};
  border-bottom: 1px solid ${COLORS.background};
  position: relative;
  z-index: 1;
}

.doc-content {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.doc-tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.doc-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
}

.doc-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.375rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.doc-subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.doc-paragraph {
  font-size: 0.9375rem;
  color: ${COLORS.textMuted};
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.doc-paragraph:last-child {
  margin-bottom: 0;
}

.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-list li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.doc-list-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.doc-list-icon.success {
  color: ${COLORS.success};
}

.doc-list-icon.error {
  color: ${COLORS.error};
}

.doc-list li div strong {
  display: block;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-list li div p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.5;
}

.doc-list-simple {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.doc-list-simple li {
  font-size: 0.9375rem;
  color: ${COLORS.textMuted};
  margin-bottom: 0.25rem;
}

.doc-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-feature {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-feature-number {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.navy};
  color: white;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.doc-feature-text strong {
  display: block;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-feature-text p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.4;
}

/* Workflow phases */
.doc-workflow-phases {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.doc-phase {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-phase--active {
  background-color: rgba(196, 164, 132, 0.2);
  border: 1px solid ${COLORS.copper};
}

.doc-phase-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.textMuted};
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.doc-phase--active .doc-phase-badge {
  background-color: ${COLORS.copper};
}

.doc-phase-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
}

.doc-phase-content p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Steps */
.doc-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doc-step {
  display: flex;
  gap: 1rem;
}

.doc-step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.navy};
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.doc-step-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.25rem 0;
}

.doc-step-content p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.5;
}

/* Data flow */
.doc-data-flow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.doc-flow-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
}

.doc-flow-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-flow-section li {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Gates */
.doc-gates {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.doc-gate {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid;
}

.doc-gate--green {
  background-color: rgba(46, 125, 50, 0.08);
  border-color: ${COLORS.success};
}

.doc-gate--amber {
  background-color: rgba(245, 124, 0, 0.08);
  border-color: ${COLORS.warning};
}

.doc-gate--red {
  background-color: rgba(211, 47, 47, 0.08);
  border-color: ${COLORS.error};
}

.doc-gate-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
}

.doc-gate-light {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.doc-gate--green .doc-gate-light { background-color: ${COLORS.success}; }
.doc-gate--amber .doc-gate-light { background-color: ${COLORS.warning}; }
.doc-gate--red .doc-gate-light { background-color: ${COLORS.error}; }

.doc-gate-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-gate--green .doc-gate-label { color: ${COLORS.success}; }
.doc-gate--amber .doc-gate-label { color: ${COLORS.warning}; }
.doc-gate--red .doc-gate-label { color: ${COLORS.error}; }

.doc-gate-content {
  flex: 1;
}

.doc-gate-range {
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-gate-content p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Deal-breakers */
.doc-dealbreakers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.doc-dealbreaker {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-db-id {
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${COLORS.error};
  background-color: rgba(211, 47, 47, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  flex-shrink: 0;
  height: fit-content;
}

.doc-db-content strong {
  display: block;
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-db-content p {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Tables */
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.doc-table th,
.doc-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-table th {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.text};
}

.doc-table td {
  color: ${COLORS.textMuted};
}

/* Category reference */
.doc-category-ref {
  margin-bottom: 1.5rem;
}

.doc-category-ref:last-child {
  margin-bottom: 0;
}

.doc-category-ref h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-factors {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 1rem;
}

.doc-factors li {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  display: flex;
  gap: 0.5rem;
}

.doc-factors li span {
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.navy};
  background-color: rgba(30, 58, 95, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .doc-grid-2 {
    grid-template-columns: 1fr;
  }
  
  .doc-data-flow {
    grid-template-columns: 1fr;
  }
  
  .doc-factors {
    grid-template-columns: 1fr;
  }
}

/* ---- Print / PDF Mode ---- */
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
  page-break-before: always;
}
.doc-print-section-title:first-of-type {
  page-break-before: avoid;
  margin-top: 0;
}
.doc-print-mode .doc-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
.doc-print-mode .doc-expandable {
  break-inside: avoid;
  page-break-inside: avoid;
}
`;
