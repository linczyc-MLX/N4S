/**
 * KYCDocumentation
 * 
 * Documentation panel for the KYC (Know Your Client) module.
 * Follows the N4S documentation template with 4 tabs:
 * - Overview: What KYC captures and why it matters
 * - Workflow: Section-by-section process guide
 * - Gates: Data quality requirements and downstream impacts
 * - Reference: Operating models, privacy postures, definitions
 * 
 * Client-facing language with progressive technical detail.
 */

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Users,
  Home,
  DollarSign,
  Palette,
  Heart,
  Globe,
  Briefcase,
  Info,
  Lock,
  Eye,
  Shield,
  FileDown,
} from 'lucide-react';
import { exportDocumentationPdf } from '../../utils/docsPdfExport';

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
  teal: '#0d9488',
};

/**
 * Expandable Section Component
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
 * Overview Tab Content
 */
function OverviewTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">What is KYC?</h2>
        <p className="doc-paragraph">
          Know Your Client (KYC) is the foundation of your N4S mansion program. This module captures 
          everything about how you live, what you value, and what you need from your home. Every 
          question serves a purpose—your answers directly shape the space recommendations, adjacency 
          requirements, and design guidelines that follow.
        </p>
        <p className="doc-paragraph">
          Think of KYC as your architectural interview. Just as a bespoke tailor measures more than 
          your waist size, we capture the nuances of your lifestyle that make the difference between 
          a house and your home.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">What Your Answers Determine</h3>
        <ul className="doc-list">
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Space Program</strong>
              <p>Which rooms your home needs, their sizes, and how many of each</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Adjacency Requirements</strong>
              <p>Which spaces should be close, which should be separated, and why</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Operational Needs</strong>
              <p>Staffing support, service routes, and back-of-house infrastructure</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Design Direction</strong>
              <p>Style preferences, material affinities, and visual language for your team</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Respondent Types</h3>
        <p className="doc-paragraph">
          KYC captures perspectives from multiple decision-makers to ensure the home works for everyone.
        </p>
        <div className="doc-respondent-grid">
          <div className="doc-respondent doc-respondent--navy">
            <div className="doc-respondent-header">
              <Users size={20} />
              <h4>Principal</h4>
            </div>
            <p>Primary decision-maker who completes all sections. Captures core project parameters,
            budget framework, and household composition.</p>
            <div className="doc-respondent-sections">
              <span>All 8 sections</span>
            </div>
          </div>
          <div className="doc-respondent doc-respondent--teal">
            <div className="doc-respondent-header">
              <Users size={20} />
              <h4>Secondary</h4>
            </div>
            <p>Spouse or co-decision-maker who provides their own perspective on taste and lifestyle
            preferences. Selections are additive, not deviations.</p>
            <div className="doc-respondent-sections">
              <span>2 sections: Design, Lifestyle & Living</span>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card doc-card--highlight">
        <h3 className="doc-subsection-title">Completion Time</h3>
        <p className="doc-paragraph">
          The KYC module captures comprehensive client information across 8 sections. Principal
          respondents complete all sections while Secondary respondents complete only the taste
          and lifestyle sections relevant to design alignment.
        </p>
        <div className="doc-capture-options">
          <div className="doc-capture-option">
            <div className="doc-capture-badge doc-capture-badge--full">Principal</div>
            <div className="doc-capture-time">45-60 min</div>
            <p>All 8 sections covering portfolio context, household composition, project parameters,
            budget framework, design preferences, lifestyle, cultural context, and working preferences.</p>
          </div>
          <div className="doc-capture-option">
            <div className="doc-capture-badge">Secondary</div>
            <div className="doc-capture-time">15-20 min</div>
            <p>Design Identity and Lifestyle & Living sections only. Captures independent perspective
            on taste and lifestyle to inform design alignment.</p>
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
  const sections = [
    {
      code: 'P1.A.1',
      title: 'Portfolio Context',
      icon: Briefcase,
      secondary: false,
      description: 'Your real estate portfolio and this project\'s role within it.',
      captures: [
        'Primary residence vs. vacation home vs. investment',
        'Other properties in your portfolio',
        'Intended use frequency and duration',
        'Long-term ownership intentions'
      ],
      impacts: [
        'Infrastructure redundancy requirements',
        'Staff accommodation needs',
        'Smart home / remote monitoring scope'
      ]
    },
    {
      code: 'P1.A.2',
      title: 'Family & Household',
      icon: Users,
      secondary: false,
      description: 'Who lives in or regularly visits your home.',
      captures: [
        'Permanent residents and ages',
        'Regular visitors (parents, adult children)',
        'Staff requirements (live-in vs. day staff)',
        'Pet accommodations'
      ],
      impacts: [
        'Bedroom count and configuration',
        'Guest suite autonomy level',
        'Staff quarters scope',
        'Accessibility considerations'
      ]
    },
    {
      code: 'P1.A.3',
      title: 'Project Parameters',
      icon: Home,
      secondary: false,
      description: 'Physical scope and site constraints.',
      captures: [
        'Target square footage',
        'Number of levels (including basement)',
        'Site conditions and buildable area',
        'Timeline expectations'
      ],
      impacts: [
        'Program tier selection (5K/10K/15K/20K)',
        'Vertical circulation requirements',
        'MEP complexity level'
      ]
    },
    {
      code: 'P1.A.4',
      title: 'Budget Framework',
      icon: DollarSign,
      secondary: false,
      description: 'Investment parameters and value priorities.',
      captures: [
        'Construction budget range',
        'FF&E and landscape budgets',
        'Value engineering tolerance',
        'Investment horizon'
      ],
      impacts: [
        'Finish level recommendations',
        'MEP system complexity',
        'Phasing opportunities'
      ]
    },
    {
      code: 'P1.A.5',
      title: 'Design Identity',
      icon: Palette,
      secondary: true,
      description: 'Visual and stylistic preferences for your home.',
      captures: [
        'Architectural style preferences (9 style categories)',
        'Material affinities',
        'Color palette preferences',
        'Reference projects or designers'
      ],
      impacts: [
        'Design DNA profile for your team',
        'Finish specifications direction',
        'Consultant selection criteria'
      ]
    },
    {
      code: 'P1.A.6',
      title: 'Lifestyle & Living',
      icon: Heart,
      secondary: true,
      description: 'How you actually live day-to-day plus space requirements. Includes LuXeBrief Lifestyle (voice-guided), LuXeBrief Living (form-based questionnaire), and Manual Entry panel for space program.',
      captures: [
        'Entertaining frequency and scale',
        'Morning and evening routines',
        'Work-from-home requirements',
        'Hobbies and collections',
        'Must-have and nice-to-have interior/exterior spaces',
        'LuXeBrief Lifestyle: Voice-guided lifestyle interview',
        'LuXeBrief Living: Form-based space program questionnaire'
      ],
      impacts: [
        'Kitchen and dining sizing',
        'Privacy posture requirements',
        'Specialty room recommendations',
        'FYI space program generation',
        'Direct sync to FYI space selections'
      ]
    },
    {
      code: 'P1.A.7',
      title: 'Cultural Context',
      icon: Globe,
      secondary: false,
      description: 'Cultural and regional considerations.',
      captures: [
        'Cultural background and traditions',
        'Religious observances',
        'Regional climate expectations',
        'Local customs and entertaining norms'
      ],
      impacts: [
        'Specialty space requirements',
        'Kitchen equipment needs',
        'Orientation and layout preferences'
      ]
    },
    {
      code: 'P1.A.8',
      title: 'Working Preferences',
      icon: Briefcase,
      secondary: false,
      description: 'How you prefer to work with your design team.',
      captures: [
        'Decision-making style',
        'Communication preferences',
        'Review meeting frequency',
        'Change tolerance'
      ],
      impacts: [
        'Project management approach',
        'Presentation format recommendations',
        'Approval workflow structure'
      ]
    }
  ];

  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">KYC Section Guide</h2>
        <p className="doc-paragraph">
          Complete each section to build your personalized mansion program. Sections marked with
          "Secondary" are also completed by the Secondary respondent for design alignment.
        </p>
      </div>

      {/* Section Cards */}
      {sections.map((section, index) => (
        <div key={section.code} className="doc-section-card">
          <div className="doc-section-card__header">
            <div className="doc-section-card__code">{section.code}</div>
            <div className="doc-section-card__title-group">
              <h3 className="doc-section-card__title">
                <section.icon size={18} />
                {section.title}
              </h3>
              <div className="doc-section-card__badges">
                {section.secondary && (
                  <span className="doc-section-badge doc-section-badge--secondary">Secondary</span>
                )}
              </div>
            </div>
          </div>
          <p className="doc-section-card__description">{section.description}</p>
          
          <div className="doc-section-card__details">
            <div className="doc-section-card__column">
              <h4>What We Capture</h4>
              <ul>
                {section.captures.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="doc-section-card__column">
              <h4>What It Impacts</h4>
              <ul>
                {section.impacts.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* LuXeBrief Integration */}
      <div className="doc-card doc-card--highlight">
        <h3 className="doc-subsection-title">LuXeBrief Integration</h3>
        <p className="doc-paragraph">
          P1.A.6 Lifestyle & Living can be completed via LuXeBrief—N4S's external questionnaire platform
          that offers two modes for capturing lifestyle and space requirements.
        </p>
        <div className="doc-luxebrief-grid">
          <div className="doc-luxebrief-card">
            <div className="doc-luxebrief-header">
              <div className="doc-luxebrief-badge doc-luxebrief-badge--lifestyle">LuXeBrief Lifestyle</div>
            </div>
            <p><strong>Voice-Guided Interview</strong></p>
            <p>AI-powered conversational questionnaire that captures lifestyle nuances through natural dialogue.
            Responses are transcribed, analyzed, and summarized into a comprehensive lifestyle brief.</p>
            <ul>
              <li>10-15 minute audio interview</li>
              <li>AI-generated lifestyle summary</li>
              <li>PDF executive summary report</li>
            </ul>
          </div>
          <div className="doc-luxebrief-card">
            <div className="doc-luxebrief-header">
              <div className="doc-luxebrief-badge doc-luxebrief-badge--living">LuXeBrief Living</div>
            </div>
            <p><strong>Form-Based Questionnaire</strong></p>
            <p>Structured 7-step questionnaire that directly captures space requirements with must-have and
            nice-to-have selections for interior and exterior amenities.</p>
            <ul>
              <li>7 comprehensive sections</li>
              <li>Direct sync to KYC Space Requirements</li>
              <li>Auto-populates FYI space selections</li>
            </ul>
          </div>
        </div>
        <div className="doc-luxebrief-flow">
          <h4>Data Flow</h4>
          <div className="doc-flow-diagram">
            <span className="doc-flow-step">LuXeBrief Living</span>
            <span className="doc-flow-arrow">→</span>
            <span className="doc-flow-step">KYC Lifestyle & Living</span>
            <span className="doc-flow-arrow">→</span>
            <span className="doc-flow-step">FYI Module</span>
          </div>
          <p>When a LuXeBrief Living questionnaire is completed, responses automatically sync to KYC's
          Lifestyle & Living section (P1.A.6), which then pre-populates the FYI space program.
          Clients can review and adjust selections in FYI before proceeding to MVP.</p>
        </div>
      </div>

      {/* Completion Guide */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Completion Tips</h3>
        <div className="doc-tips-grid">
          <div className="doc-tip-card">
            <Info size={18} className="doc-tip-icon" />
            <div>
              <strong>Answer for how you actually live</strong>
              <p>Not how you think you should live. Authenticity leads to better design.</p>
            </div>
          </div>
          <div className="doc-tip-card">
            <Info size={18} className="doc-tip-icon" />
            <div>
              <strong>Think 10 years ahead</strong>
              <p>Consider aging parents, growing children, and lifestyle changes.</p>
            </div>
          </div>
          <div className="doc-tip-card">
            <Info size={18} className="doc-tip-icon" />
            <div>
              <strong>Both respondents should complete independently</strong>
              <p>Don't compare answers until both are finished. Differences are valuable data.</p>
            </div>
          </div>
          <div className="doc-tip-card">
            <Info size={18} className="doc-tip-icon" />
            <div>
              <strong>You can return and edit</strong>
              <p>Answers save automatically. Come back anytime to refine your responses.</p>
            </div>
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
        <h2 className="doc-section-title">Data Quality Gates</h2>
        <p className="doc-paragraph">
          KYC data flows downstream to FYI and MVP modules. Incomplete or inconsistent data will 
          cause issues later. These gates ensure data quality before proceeding.
        </p>
      </div>

      {/* Completeness Gate */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Completeness Requirements</h3>
        <div className="doc-gate-table">
          <div className="doc-gate-row doc-gate-row--header">
            <span>Gate</span>
            <span>Requirement</span>
            <span>Impact if Missing</span>
          </div>
          <div className="doc-gate-row">
            <span className="doc-gate-label">Target SF</span>
            <span>Must be specified in Project Parameters</span>
            <span className="doc-gate-impact">Cannot determine tier or generate FYI program</span>
          </div>
          <div className="doc-gate-row">
            <span className="doc-gate-label">Bedroom Count</span>
            <span>Must specify number of bedrooms needed</span>
            <span className="doc-gate-impact">Cannot size guest wing or generate suite program</span>
          </div>
          <div className="doc-gate-row">
            <span className="doc-gate-label">Household Composition</span>
            <span>At least one family member defined</span>
            <span className="doc-gate-impact">Cannot recommend accessibility or kids' spaces</span>
          </div>
          <div className="doc-gate-row">
            <span className="doc-gate-label">Entertaining Profile</span>
            <span>Frequency and scale indicators set</span>
            <span className="doc-gate-impact">Cannot size formal zones or recommend bridges</span>
          </div>
        </div>
      </div>

      {/* Downstream Dependencies */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Downstream Module Dependencies</h3>
        <p className="doc-paragraph">
          Your KYC answers directly control what appears in subsequent modules.
        </p>

        <div className="doc-dependency">
          <div className="doc-dependency-arrow">
            <span className="doc-dependency-from">KYC</span>
            <span className="doc-dependency-to">FYI</span>
          </div>
          <div className="doc-dependency-content">
            <h4>Space Program Generation</h4>
            <ul>
              <li>Target SF → Tier selection (5K/10K/15K/20K) → Base template</li>
              <li>Bedroom count → Guest suite quantity</li>
              <li>Staff level → Staff quarters and service zones</li>
              <li>Entertaining frequency → Formal space sizing</li>
              <li>Hobbies/collections → Specialty room recommendations</li>
            </ul>
          </div>
        </div>

        <div className="doc-dependency">
          <div className="doc-dependency-arrow">
            <span className="doc-dependency-from">KYC</span>
            <span className="doc-dependency-to">MVP</span>
          </div>
          <div className="doc-dependency-content">
            <h4>Adjacency Requirements</h4>
            <ul>
              <li>Privacy posture → Red flag thresholds</li>
              <li>Staffing level → Service spine requirements</li>
              <li>Entertaining style → Bridge recommendations</li>
              <li>Operating model → Ops Core need</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Client Intake Protection */}
      <div className="doc-card doc-card--warning">
        <h3 className="doc-subsection-title">Client Intake Protection</h3>
        <p className="doc-paragraph">
          When a client completes the Portal Intake Wizard (P1.A.3 Project Parameters and P1.A.4
          Budget Framework), those fields become protected in the advisor's KYC view. A banner
          displays indicating that client-submitted data is locked to preserve the client's original
          inputs. The advisor can still view and export the data but cannot edit fields that were
          submitted through the portal intake.
        </p>
        <p className="doc-paragraph">
          This protection ensures that the client's stated requirements form the trusted baseline
          for all downstream modules (FYI, MVP, VMX).
        </p>
      </div>

      {/* Privacy Postures */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Privacy Postures</h3>
        <div style={{ padding: '0.5rem 0.75rem', background: '#fff3e0', borderRadius: '4px', fontSize: '0.8125rem', color: '#f57c00', marginBottom: '0.75rem' }}>
          <strong>Planned Feature:</strong> Privacy posture selection will be added in a future update.
          Currently, MVP uses standard thresholds for all projects.
        </div>
        <p className="doc-paragraph">
          Your privacy posture selection in KYC determines how strictly MVP enforces separation 
          between zones. Higher privacy = more red flags for adjacency violations.
        </p>

        <div className="doc-privacy-grid">
          <div className="doc-privacy-level">
            <div className="doc-privacy-badge doc-privacy--casual">
              <Eye size={16} />
              Casual
            </div>
            <p>Open floor plan friendly. Guests can see into most spaces. Minimal zone separation.</p>
            <span className="doc-privacy-tolerance">High tolerance for adjacencies</span>
          </div>
          <div className="doc-privacy-level">
            <div className="doc-privacy-badge doc-privacy--balanced">
              <Shield size={16} />
              Balanced
            </div>
            <p>Standard luxury home. Formal and private zones separated. Recommended for most clients.</p>
            <span className="doc-privacy-tolerance">Standard red flag thresholds</span>
          </div>
          <div className="doc-privacy-level">
            <div className="doc-privacy-badge doc-privacy--private">
              <Lock size={16} />
              Private
            </div>
            <p>Maximum zone separation. Service completely invisible. Primary suite isolated.</p>
            <span className="doc-privacy-tolerance">Strict red flag enforcement</span>
          </div>
        </div>
      </div>

      {/* Operating Models */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Operating Models</h3>
        <p className="doc-paragraph">
          Your operating model determines the service infrastructure your home requires.
        </p>

        <ExpandableSection title="Self-Operated" defaultOpen={true}>
          <div className="doc-operating-model">
            <p>Family manages all household operations. No live-in staff.</p>
            <div className="doc-model-impacts">
              <strong>Infrastructure Impact:</strong>
              <ul>
                <li>Minimal service zones</li>
                <li>No staff quarters required</li>
                <li>Simplified delivery routes</li>
                <li>Package room at entry may suffice</li>
              </ul>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Day Staff">
          <div className="doc-operating-model">
            <p>Regular housekeeping and/or cooking staff who don't live on-site.</p>
            <div className="doc-model-impacts">
              <strong>Infrastructure Impact:</strong>
              <ul>
                <li>Service entry and staff break area</li>
                <li>Enhanced laundry facilities</li>
                <li>Catering support kitchen consideration</li>
                <li>Dedicated service circulation preferred</li>
              </ul>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Full Staff">
          <div className="doc-operating-model">
            <p>Live-in staff including house manager, chef, housekeeping, and/or security.</p>
            <div className="doc-model-impacts">
              <strong>Infrastructure Impact:</strong>
              <ul>
                <li>Staff quarters with private entry</li>
                <li>Ops Core hub required</li>
                <li>Full service spine separation</li>
                <li>Staff dining/break facilities</li>
                <li>Multiple service elevators may be needed</li>
              </ul>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Estate Management">
          <div className="doc-operating-model">
            <p>Professional estate manager with full support team. Often for 20K+ properties.</p>
            <div className="doc-model-impacts">
              <strong>Infrastructure Impact:</strong>
              <ul>
                <li>Estate office suite</li>
                <li>Security command center</li>
                <li>Multiple staff housing units</li>
                <li>Commercial-grade kitchen</li>
                <li>Vehicle fleet facilities</li>
              </ul>
            </div>
          </div>
        </ExpandableSection>
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
        <h2 className="doc-section-title">Reference Guide</h2>
        <p className="doc-paragraph">
          Definitions and reference information for KYC terminology and concepts.
        </p>
      </div>

      {/* Section Codes */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Section Code Reference</h3>
        <div className="doc-code-table">
          <div className="doc-code-row doc-code-row--header">
            <span>Code</span>
            <span>Section</span>
            <span>Principal</span>
            <span>Secondary</span>
          </div>
          <div className="doc-code-row">
            <code>P1.A.1</code>
            <span>Portfolio Context</span>
            <span>✓</span>
            <span>—</span>
          </div>
          <div className="doc-code-row">
            <code>P1.A.2</code>
            <span>Family & Household</span>
            <span>✓</span>
            <span>—</span>
          </div>
          <div className="doc-code-row">
            <code>P1.A.3</code>
            <span>Project Parameters</span>
            <span>✓</span>
            <span>—</span>
          </div>
          <div className="doc-code-row">
            <code>P1.A.4</code>
            <span>Budget Framework</span>
            <span>✓</span>
            <span>—</span>
          </div>
          <div className="doc-code-row doc-code-row--secondary">
            <code>P1.A.5</code>
            <span>Design Identity</span>
            <span>✓</span>
            <span>✓</span>
          </div>
          <div className="doc-code-row doc-code-row--secondary">
            <code>P1.A.6</code>
            <span>Lifestyle & Living (incl. Space Requirements)</span>
            <span>✓</span>
            <span>✓</span>
          </div>
          <div className="doc-code-row">
            <code>P1.A.7</code>
            <span>Cultural Context</span>
            <span>✓</span>
            <span>—</span>
          </div>
          <div className="doc-code-row">
            <code>P1.A.8</code>
            <span>Working Preferences</span>
            <span>✓</span>
            <span>—</span>
          </div>
        </div>
      </div>

      {/* Taste Exploration */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Design Identity Categories</h3>
        <p className="doc-paragraph">
          The Design Identity section captures architectural style preferences across 9 categories
          (AS1-AS9), delivered via the external LuXeBrief taste exploration platform. Each category
          presents curated architectural imagery for selection.
        </p>
        <ExpandableSection title="View Categories">
          <div className="doc-taste-categories">
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS1</span>
              <div><strong>Architectural Period</strong><p>Historical era preferences and stylistic anchors</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS2</span>
              <div><strong>Material Language</strong><p>Natural vs. manufactured, raw vs. refined</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS3</span>
              <div><strong>Color Temperature</strong><p>Warm vs. cool palettes, neutral vs. saturated</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS4</span>
              <div><strong>Spatial Volume</strong><p>Intimate vs. grand, horizontal vs. vertical emphasis</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS5</span>
              <div><strong>Light Quality</strong><p>Diffused vs. dramatic, natural vs. artificial</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS6</span>
              <div><strong>Formal Expression</strong><p>Traditional vs. contemporary, ornate vs. minimal</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS7</span>
              <div><strong>Indoor-Outdoor</strong><p>Connection to landscape, threshold preferences</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS8</span>
              <div><strong>Detail & Craft</strong><p>Finish expectations, joinery level, bespoke vs. production</p></div>
            </div>
            <div className="doc-taste-category">
              <span className="doc-taste-number">AS9</span>
              <div><strong>Contextual Response</strong><p>Site integration, vernacular sensitivity, statement vs. stealth</p></div>
            </div>
          </div>
        </ExpandableSection>
      </div>

      {/* Entertaining Profiles */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Entertaining Profiles</h3>
        <ExpandableSection title="View Definitions">
          <dl className="doc-glossary">
            <dt>Rarely Entertain</dt>
            <dd>Less than once per month. Formal dining optional. Focus on family-scale spaces.</dd>
            
            <dt>Occasional</dt>
            <dd>Monthly gatherings of 8-12 guests. Dining room for 10. Basic bar/wine storage.</dd>
            
            <dt>Regular</dt>
            <dd>Weekly entertaining, varied scale. Flexible dining (8-20). Butler pantry recommended.</dd>
            
            <dt>Frequent Large-Scale</dt>
            <dd>Multiple events per week, often 30+ guests. Catering kitchen. Event lawn/terrace.</dd>
            
            <dt>Professional</dt>
            <dd>Charity events, business entertaining. Commercial-grade facilities. Valet staging.</dd>
          </dl>
        </ExpandableSection>
      </div>

      {/* Glossary */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Glossary</h3>
        <ExpandableSection title="View Definitions">
          <dl className="doc-glossary">
            <dt>Principal Respondent</dt>
            <dd>Primary decision-maker who completes all KYC sections. Typically the individual 
            who initiated the project.</dd>
            
            <dt>Secondary Respondent</dt>
            <dd>Spouse or co-decision-maker who provides independent perspective on taste and
            lifestyle preferences. Completes P1.A.5 (Design Identity) and P1.A.6 (Lifestyle & Living).</dd>

            <dt>Privacy Posture</dt>
            <dd>Client preference for separation between public, private, and service zones. 
            Affects MVP red flag thresholds.</dd>
            
            <dt>Operating Model</dt>
            <dd>How the household is managed—from self-operated to full estate management. 
            Determines service infrastructure requirements.</dd>
            
            <dt>Taste Exploration</dt>
            <dd>Visual preference assessment using image quads. Produces Design DNA profile 
            for the design team.</dd>
            
            <dt>Design DNA</dt>
            <dd>Consolidated taste profile derived from taste exploration results. Guides 
            design direction and consultant selection.</dd>
          </dl>
        </ExpandableSection>
      </div>
    </div>
  );
}

/**
 * Main KYCDocumentation Component
 */
export default function KYCDocumentation({ onClose, printAll }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef(null);
  
  const handleExportPdf = () => {
    exportDocumentationPdf({
      contentRef,
      setActiveTab,
      tabIds: ['overview', 'workflow', 'gates', 'reference'],
      moduleName: 'KYC',
      moduleSubtitle: 'Know Your Client Guide',
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
          <h1 className="doc-print-header__title">KYC (Know Your Client) — Documentation</h1>
          <p className="doc-print-header__subtitle">N4S — Luxury Residential Advisory Platform</p>
        </div>
      )}
      {!printAll && (
        <div className="doc-header">
          <div className="doc-header-top">
            {onClose && (
              <button className="doc-close-btn" onClick={onClose}>
                <ArrowLeft size={16} />
                Back to KYC
              </button>
            )}
            <button className="doc-export-btn" onClick={handleExportPdf} disabled={isExporting}>
              <FileDown size={16} className={isExporting ? 'spinning' : ''} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
          <h1 className="doc-title">Documentation</h1>
          <p className="doc-subtitle">N4S KYC — Know Your Client Guide</p>

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

      <style>{kycDocumentationStyles}</style>
    </div>
  );
}

// KYC-specific styles (extends base documentation styles)
const kycDocumentationStyles = `
/* Base styles inherited from MVPDocumentation */
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

.doc-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.doc-card--highlight {
  background-color: #f8f6f1;
  border-color: ${COLORS.gold};
}

.doc-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.375rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.doc-subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
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

.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-list li {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-list li:last-child {
  border-bottom: none;
}

.doc-list-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.doc-list-icon.success { color: ${COLORS.success}; }

.doc-list li strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-list li p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Respondent Grid */
.doc-respondent-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-respondent {
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid;
}

.doc-respondent--navy {
  background-color: rgba(30, 58, 95, 0.05);
  border-color: ${COLORS.navy};
}

.doc-respondent--teal {
  background-color: rgba(13, 148, 136, 0.05);
  border-color: ${COLORS.teal};
}

.doc-respondent-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.doc-respondent--navy .doc-respondent-header { color: ${COLORS.navy}; }
.doc-respondent--teal .doc-respondent-header { color: ${COLORS.teal}; }

.doc-respondent-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.doc-respondent p {
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.doc-respondent-sections {
  font-size: 0.75rem;
  font-weight: 500;
  color: ${COLORS.textMuted};
}

/* Capture Options */
.doc-capture-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-capture-option {
  padding: 1rem;
  background-color: ${COLORS.surface};
  border-radius: 6px;
}

.doc-capture-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.doc-capture-badge--full {
  background-color: ${COLORS.gold};
  color: ${COLORS.text};
}

.doc-capture-time {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin-bottom: 0.5rem;
}

.doc-capture-option p {
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin: 0;
  line-height: 1.5;
}

/* Section Cards */
.doc-section-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
}

.doc-section-card__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.doc-section-card__code {
  padding: 0.25rem 0.5rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
  flex-shrink: 0;
}

.doc-section-card__title-group {
  flex: 1;
}

.doc-section-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
}

.doc-section-card__badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.doc-section-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 500;
}

.doc-section-badge--full {
  background-color: #fff3e0;
  color: ${COLORS.warning};
}

.doc-section-badge--secondary {
  background-color: rgba(13, 148, 136, 0.1);
  color: ${COLORS.teal};
}

.doc-section-card__description {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0 0 1rem 0;
}

.doc-section-card__details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-section-card__column h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.doc-section-card__column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-section-card__column li {
  font-size: 0.8125rem;
  color: ${COLORS.text};
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.doc-section-card__column li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: ${COLORS.navy};
}

/* Tips Grid */
.doc-tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-tip-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-tip-icon {
  color: ${COLORS.navy};
  flex-shrink: 0;
}

.doc-tip-card strong {
  display: block;
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-tip-card p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Gate Table */
.doc-gate-table {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-gate-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
}

.doc-gate-row:last-child {
  border-bottom: none;
}

.doc-gate-row--header {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-gate-label {
  font-weight: 500;
  color: ${COLORS.navy};
}

.doc-gate-impact {
  color: ${COLORS.error};
  font-size: 0.8125rem;
}

/* Dependencies */
.doc-dependency {
  padding: 1rem 0;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-dependency:last-child {
  border-bottom: none;
}

.doc-dependency-arrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.doc-dependency-from,
.doc-dependency-to {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.doc-dependency-from {
  background-color: ${COLORS.navy};
  color: #fff;
}

.doc-dependency-to {
  background-color: ${COLORS.gold};
  color: ${COLORS.text};
}

.doc-dependency-arrow::after {
  content: '→';
  color: ${COLORS.textMuted};
  font-size: 1rem;
  position: relative;
  left: -0.25rem;
}

.doc-dependency-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
}

.doc-dependency-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-dependency-content li {
  font-size: 0.8125rem;
  color: ${COLORS.text};
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.doc-dependency-content li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: ${COLORS.gold};
}

/* Privacy Grid */
.doc-privacy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.doc-privacy-level {
  padding: 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-privacy-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.doc-privacy--casual {
  background-color: #e8f5e9;
  color: ${COLORS.success};
}

.doc-privacy--balanced {
  background-color: #e3f2fd;
  color: #1565c0;
}

.doc-privacy--private {
  background-color: #fce4ec;
  color: #c2185b;
}

.doc-privacy-level p {
  font-size: 0.8125rem;
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.doc-privacy-tolerance {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  font-style: italic;
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

/* Operating Model */
.doc-operating-model p {
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
}

.doc-model-impacts {
  padding: 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
}

.doc-model-impacts strong {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.doc-model-impacts ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.doc-model-impacts li {
  font-size: 0.8125rem;
  color: ${COLORS.text};
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.doc-model-impacts li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: ${COLORS.navy};
}

/* Code Table */
.doc-code-table {
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-code-row {
  display: grid;
  grid-template-columns: 80px 1fr 80px 80px;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  align-items: center;
}

.doc-code-row:last-child {
  border-bottom: none;
}

.doc-code-row--header {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-code-row--secondary {
  background-color: rgba(13, 148, 136, 0.03);
}

.doc-code-row code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: ${COLORS.navy};
}

/* Taste Categories */
.doc-taste-categories {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-taste-category {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.doc-taste-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.doc-taste-category strong {
  display: block;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin-bottom: 0.125rem;
}

.doc-taste-category p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
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

/* LuXeBrief Integration Styles */
.doc-luxebrief-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.doc-luxebrief-card {
  padding: 1.25rem;
  background-color: ${COLORS.surface};
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
}

.doc-luxebrief-header {
  margin-bottom: 0.75rem;
}

.doc-luxebrief-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.doc-luxebrief-badge--lifestyle {
  background-color: ${COLORS.navy};
  color: #fff;
}

.doc-luxebrief-badge--living {
  background-color: ${COLORS.teal};
  color: #fff;
}

.doc-luxebrief-card p {
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.doc-luxebrief-card p strong {
  color: ${COLORS.navy};
}

.doc-luxebrief-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-luxebrief-card li {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
}

.doc-luxebrief-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: ${COLORS.success};
}

.doc-luxebrief-flow {
  padding: 1rem;
  background-color: ${COLORS.surface};
  border-radius: 8px;
}

.doc-luxebrief-flow h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.doc-flow-diagram {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.doc-flow-step {
  padding: 0.5rem 1rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.doc-flow-arrow {
  color: ${COLORS.gold};
  font-size: 1.25rem;
  font-weight: bold;
}

.doc-luxebrief-flow p {
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .doc-respondent-grid,
  .doc-capture-options,
  .doc-tips-grid,
  .doc-luxebrief-grid {
    grid-template-columns: 1fr;
  }

  .doc-privacy-grid {
    grid-template-columns: 1fr;
  }

  .doc-section-card__details {
    grid-template-columns: 1fr;
  }

  .doc-gate-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .doc-code-row {
    grid-template-columns: 1fr 1fr;
  }

  .doc-flow-diagram {
    flex-direction: column;
    align-items: flex-start;
  }

  .doc-flow-arrow {
    transform: rotate(90deg);
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
