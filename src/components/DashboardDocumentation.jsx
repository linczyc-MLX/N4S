/**
 * DashboardDocumentation
 * 
 * Documentation panel for the N4S Dashboard / Overview.
 * Provides comprehensive overview of the N4S journey with 4 tabs:
 * - Overview: What N4S is and the value proposition
 * - Workflow: The complete journey through all modules
 * - Gates: Key milestones and decision points
 * - Reference: Module summaries, timeline, glossary
 * 
 * Includes placeholders for KYM (Know Your Market) and VMX (Visual Matrix)
 */

import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  ClipboardCheck,
  TrendingUp,
  LayoutGrid,
  Home,
  Target,
  ArrowRight,
  Clock,
  FileText,
  Layers,
  FileDown,
} from 'lucide-react';
import { exportDocumentationPdf } from '../utils/docsPdfExport';

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
  purple: '#805ad5',
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
 * Module Status Badge
 */
function ModuleStatusBadge({ status }) {
  const statusConfig = {
    active: { label: 'Active', color: COLORS.success, bg: '#e8f5e9' },
    coming: { label: 'Coming Soon', color: COLORS.warning, bg: '#fff3e0' },
    placeholder: { label: 'Planned', color: COLORS.textMuted, bg: '#f5f5f5' },
  };
  const config = statusConfig[status] || statusConfig.placeholder;
  
  return (
    <span 
      className="doc-module-status"
      style={{ 
        color: config.color, 
        backgroundColor: config.bg,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {config.label}
    </span>
  );
}

/**
 * Overview Tab Content
 */
function OverviewTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">Welcome to N4S</h2>
        <p className="doc-paragraph">
          N4S (Not-for-Sale) is a comprehensive luxury residential advisory platform designed for 
          ultra-high-net-worth families developing custom homes. Unlike traditional real estate 
          tools focused on transactions, N4S captures and validates the unique requirements 
          of bespoke mansions—homes that will never hit the market because they're built 
          specifically for one family's lifestyle.
        </p>
        <p className="doc-paragraph">
          Think of N4S as your pre-design concierge. We ensure that when you engage architects, 
          designers, and builders, everyone starts with a validated brief that reflects how you 
          actually live—not assumptions based on square footage and bedroom count.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">The N4S Value Proposition</h3>
        <ul className="doc-list">
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Capture Lifestyle, Not Just Requirements</strong>
              <p>Move beyond room lists to understand how your family actually lives, entertains, 
              and operates day-to-day</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Validate Before You Design</strong>
              <p>Catch conflicts between spaces before they become expensive redesigns—like discovering 
              your guest suite shares a wall with your home theater</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Benchmark Against Best Practices</strong>
              <p>Compare your program against tier-appropriate benchmarks from luxury residences 
              worldwide</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Brief Your Team Consistently</strong>
              <p>Generate validated briefs that give every consultant—architect, designer, landscape—the 
              same foundation</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="doc-card doc-card--highlight">
        <h3 className="doc-subsection-title">The N4S Journey</h3>
        <p className="doc-paragraph">
          N4S guides you through six interconnected modules, each building on the previous to
          create a comprehensive, validated mansion program. The journey typically takes 3-5 weeks
          of client engagement, but the insights shape years of design and construction.
        </p>
        <div className="doc-journey-preview">
          <div className="doc-journey-step">
            <div className="doc-journey-badge" style={{ background: COLORS.navy }}>1</div>
            <span>KYC</span>
          </div>
          <ArrowRight size={16} className="doc-journey-arrow" />
          <div className="doc-journey-step">
            <div className="doc-journey-badge" style={{ background: COLORS.teal }}>2</div>
            <span>FYI</span>
          </div>
          <ArrowRight size={16} className="doc-journey-arrow" />
          <div className="doc-journey-step">
            <div className="doc-journey-badge" style={{ background: COLORS.success }}>3</div>
            <span>MVP</span>
          </div>
          <ArrowRight size={16} className="doc-journey-arrow" />
          <div className="doc-journey-step">
            <div className="doc-journey-badge" style={{ background: COLORS.purple }}>4</div>
            <span>KYM</span>
          </div>
          <ArrowRight size={16} className="doc-journey-arrow" />
          <div className="doc-journey-step">
            <div className="doc-journey-badge" style={{ background: '#805ad5' }}>5</div>
            <span>KYS</span>
          </div>
          <ArrowRight size={16} className="doc-journey-arrow" />
          <div className="doc-journey-step">
            <div className="doc-journey-badge" style={{ background: COLORS.gold }}>6</div>
            <span>VMX</span>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Who Uses N4S?</h3>
        <div className="doc-user-grid">
          <div className="doc-user-type">
            <strong>Families</strong>
            <p>Capture your lifestyle requirements and design preferences in a structured format 
            that architects and designers can actually use.</p>
          </div>
          <div className="doc-user-type">
            <strong>Advisors</strong>
            <p>Guide your UHNW clients through the pre-design process with professional tools 
            that demonstrate value beyond traditional real estate services.</p>
          </div>
          <div className="doc-user-type">
            <strong>Architects</strong>
            <p>Receive validated briefs with adjacency requirements, space programs, and design 
            preferences—not vague wish lists.</p>
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
        <h2 className="doc-section-title">The Complete N4S Journey</h2>
        <p className="doc-paragraph">
          Each module in N4S builds on the previous, creating a comprehensive foundation for 
          your mansion program. Complete them in order for best results—later modules depend 
          on earlier inputs.
        </p>
      </div>

      {/* Module 1: KYC */}
      <div className="doc-module-card">
        <div className="doc-module-header">
          <div className="doc-module-badge" style={{ background: COLORS.navy }}>
            <Users size={18} />
          </div>
          <div className="doc-module-title-area">
            <h3>Module 1: KYC – Know Your Client</h3>
            <ModuleStatusBadge status="active" />
          </div>
          <div className="doc-module-timing">
            <Clock size={14} />
            <span>2-4 hours</span>
          </div>
        </div>
        <div className="doc-module-body">
          <p>
            The foundation of your N4S journey. KYC captures everything about how you live, 
            what you value, and what you need from your home. Every subsequent module draws 
            from this rich profile.
          </p>
          <div className="doc-module-sections">
            <strong>Key Sections:</strong>
            <div className="doc-section-tags">
              <span>Portfolio Context</span>
              <span>Family & Household</span>
              <span>Project Parameters</span>
              <span>Budget Framework</span>
              <span>Design Preferences</span>
              <span>Lifestyle & Living</span>
              <span>Space Requirements</span>
            </div>
          </div>
          <div className="doc-module-outputs">
            <strong>Produces:</strong>
            <ul>
              <li>Lifestyle profile for the household</li>
              <li>Design DNA (taste preferences)</li>
              <li>Initial space requirements</li>
              <li>Target square footage and tier</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Module 2: FYI */}
      <div className="doc-module-card">
        <div className="doc-module-header">
          <div className="doc-module-badge" style={{ background: COLORS.teal }}>
            <Search size={18} />
          </div>
          <div className="doc-module-title-area">
            <h3>Module 2: FYI – Find Your Inspiration</h3>
            <ModuleStatusBadge status="active" />
          </div>
          <div className="doc-module-timing">
            <Clock size={14} />
            <span>1-2 hours</span>
          </div>
        </div>
        <div className="doc-module-body">
          <p>
            Transform lifestyle requirements into a quantified space program. Select sizes 
            for each room, organize by zone, and see your total program take shape.
          </p>
          <div className="doc-module-sections">
            <strong>Key Features:</strong>
            <div className="doc-section-tags">
              <span>Zone-Based Organization</span>
              <span>S/M/L Sizing</span>
              <span>Level Assignment</span>
              <span>Structure Support</span>
              <span>PDF Export</span>
            </div>
          </div>
          <div className="doc-module-outputs">
            <strong>Produces:</strong>
            <ul>
              <li>Complete space program with SF allocations</li>
              <li>Zone breakdown (Private, Living, Wellness, Support)</li>
              <li>Level distribution</li>
              <li>Program brief for MVP validation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Module 3: MVP */}
      <div className="doc-module-card">
        <div className="doc-module-header">
          <div className="doc-module-badge" style={{ background: COLORS.success }}>
            <ClipboardCheck size={18} />
          </div>
          <div className="doc-module-title-area">
            <h3>Module 3: MVP – Mansion Validation Program</h3>
            <ModuleStatusBadge status="active" />
          </div>
          <div className="doc-module-timing">
            <Clock size={14} />
            <span>30-60 min</span>
          </div>
        </div>
        <div className="doc-module-body">
          <p>
            Validate your adjacency logic before design begins. Answer layout questions, 
            compare against benchmarks, and catch red flags that would be costly to fix later.
          </p>
          <div className="doc-module-sections">
            <strong>Key Features:</strong>
            <div className="doc-section-tags">
              <span>10 Layout Questions</span>
              <span>Adjacency Matrix</span>
              <span>Red Flag Detection</span>
              <span>Bridge Recommendations</span>
              <span>Module Scoring</span>
            </div>
          </div>
          <div className="doc-module-outputs">
            <strong>Produces:</strong>
            <ul>
              <li>Validated adjacency matrix</li>
              <li>Red flag report (must-resolve conflicts)</li>
              <li>Bridge recommendations (operational transitions)</li>
              <li>Module scores (80+ target for each)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Module 4: KYM */}
      <div className="doc-module-card">
        <div className="doc-module-header">
          <div className="doc-module-badge" style={{ background: COLORS.purple }}>
            <TrendingUp size={18} />
          </div>
          <div className="doc-module-title-area">
            <h3>Module 4: KYM – Know Your Market</h3>
            <ModuleStatusBadge status="active" />
          </div>
          <div className="doc-module-timing">
            <Clock size={14} />
            <span>1-2 hours</span>
          </div>
        </div>
        <div className="doc-module-body">
          <p>
            Benchmark your project against real market data. KYM provides comparable property analysis,
            demographic intelligence, land acquisition search, and a Buyer Alignment Matrix (BAM) that
            scores how well your program matches your target market.
          </p>
          <div className="doc-module-sections">
            <strong>Key Features:</strong>
            <div className="doc-section-tags">
              <span>Market Analysis</span>
              <span>Comparable Properties</span>
              <span>Land Acquisition Search</span>
              <span>Demographics</span>
              <span>Buyer Alignment (BAM)</span>
            </div>
          </div>
          <div className="doc-module-outputs">
            <strong>Produces:</strong>
            <ul>
              <li>BAM alignment score (Client + Market)</li>
              <li>Comparable property analysis</li>
              <li>Land parcel search results</li>
              <li>Demographic buyer personas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Module 5: KYS */}
      <div className="doc-module-card">
        <div className="doc-module-header">
          <div className="doc-module-badge" style={{ background: '#805ad5' }}>
            <Target size={18} />
          </div>
          <div className="doc-module-title-area">
            <h3>Module 5: KYS – Know Your Site</h3>
            <ModuleStatusBadge status="active" />
          </div>
          <div className="doc-module-timing">
            <Clock size={14} />
            <span>30-60 min per site</span>
          </div>
        </div>
        <div className="doc-module-body">
          <p>
            Evaluate potential building sites with a structured 31-factor scoring system across
            7 categories. Each site receives a traffic-light recommendation (GO/AMBER/NO-GO) with
            10 deal-breaker checks that can override the score.
          </p>
          <div className="doc-module-sections">
            <strong>Key Features:</strong>
            <div className="doc-section-tags">
              <span>7 Assessment Categories</span>
              <span>31 Scoring Factors</span>
              <span>10 Deal-Breakers</span>
              <span>Traffic Light Scoring</span>
              <span>Multi-Site Comparison</span>
            </div>
          </div>
          <div className="doc-module-outputs">
            <strong>Produces:</strong>
            <ul>
              <li>GO / AMBER / NO-GO recommendation</li>
              <li>Site constraint register</li>
              <li>Deal-breaker report</li>
              <li>Site comparison matrix</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Module 6: VMX */}
      <div className="doc-module-card">
        <div className="doc-module-header">
          <div className="doc-module-badge" style={{ background: COLORS.gold }}>
            <LayoutGrid size={18} />
          </div>
          <div className="doc-module-title-area">
            <h3>Module 6: VMX – Vision Matrix</h3>
            <ModuleStatusBadge status="active" />
          </div>
          <div className="doc-module-timing">
            <Clock size={14} />
            <span>30-60 min</span>
          </div>
        </div>
        <div className="doc-module-body">
          <p>
            The cost analysis engine. VMX translates your spatial program, quality tier, location, and
            site conditions into a structured budget trajectory using a 7-category elemental cost model
            based on ASTM UniFormat II. Compare scenarios and stress-test your budget.
          </p>
          <div className="doc-module-sections">
            <strong>Key Features:</strong>
            <div className="doc-section-tags">
              <span>7-Category Cost Model</span>
              <span>Scenario Comparison</span>
              <span>Location Multipliers</span>
              <span>Typology Adjustments</span>
              <span>Lite + Pro Modes</span>
            </div>
          </div>
          <div className="doc-module-outputs">
            <strong>Produces:</strong>
            <ul>
              <li>Cost trajectory per category</li>
              <li>Budget scenario comparison (A vs B)</li>
              <li>Key cost drivers analysis</li>
              <li>Client pack PDF export</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Typical Timeline</h3>
        <div className="doc-timeline">
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Week 1</div>
            <div className="doc-timeline-content">
              <strong>Discovery</strong>
              <p>Complete KYC module. Principal and Secondary respondents capture lifestyle, 
              preferences, and requirements.</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Week 2</div>
            <div className="doc-timeline-content">
              <strong>Programming</strong>
              <p>Complete FYI module. Translate requirements into quantified space program 
              with zone assignments and sizing.</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Week 3</div>
            <div className="doc-timeline-content">
              <strong>Validation</strong>
              <p>Complete MVP module. Validate adjacencies, resolve red flags, and generate
              validated brief for design team.</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Week 4</div>
            <div className="doc-timeline-content">
              <strong>Market & Site</strong>
              <p>Complete KYM module for market benchmarking and BAM scoring.
              Complete KYS for site evaluation with GO/NO-GO recommendation.</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Week 5</div>
            <div className="doc-timeline-content">
              <strong>Budget & Handoff</strong>
              <p>Complete VMX cost analysis. Generate client pack with validated brief,
              cost trajectory, and all module outputs for design team handoff.</p>
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
        <h2 className="doc-section-title">Key Milestones & Gates</h2>
        <p className="doc-paragraph">
          The N4S journey includes several decision gates—moments where you validate progress 
          before moving forward. These gates ensure quality and prevent costly rework later 
          in the design process.
        </p>
      </div>

      {/* Gate 0: KYC Complete */}
      <div className="doc-gate-card">
        <div className="doc-gate-header">
          <div className="doc-gate-number">Gate 0</div>
          <h3>KYC Complete</h3>
        </div>
        <div className="doc-gate-content">
          <p>
            <strong>When:</strong> After completing all required KYC sections for Principal 
            (and Secondary if applicable)
          </p>
          <div className="doc-gate-criteria">
            <h4>Pass Criteria:</h4>
            <ul>
              <li>Target square footage defined</li>
              <li>Family composition captured</li>
              <li>Operating model selected</li>
              <li>Design preferences completed (taste exploration)</li>
              <li>Budget framework established</li>
            </ul>
          </div>
          <div className="doc-gate-unlocks">
            <h4>Unlocks:</h4>
            <span>FYI module access with pre-populated space recommendations</span>
          </div>
        </div>
      </div>

      {/* Gate 1: Program Complete */}
      <div className="doc-gate-card">
        <div className="doc-gate-header">
          <div className="doc-gate-number">Gate 1</div>
          <h3>Program Complete</h3>
        </div>
        <div className="doc-gate-content">
          <p>
            <strong>When:</strong> After completing FYI space program with all zones configured
          </p>
          <div className="doc-gate-criteria">
            <h4>Pass Criteria:</h4>
            <ul>
              <li>All required spaces included</li>
              <li>Sizes selected (S/M/L) for each space</li>
              <li>Levels assigned</li>
              <li>Total SF within ±10% of target</li>
              <li>Zone balance reasonable</li>
            </ul>
          </div>
          <div className="doc-gate-unlocks">
            <h4>Unlocks:</h4>
            <span>MVP module access with program data loaded</span>
          </div>
        </div>
      </div>

      {/* Gate 2: Adjacency Validated */}
      <div className="doc-gate-card doc-gate-card--critical">
        <div className="doc-gate-header">
          <div className="doc-gate-number">Gate 2</div>
          <h3>Adjacency Validated</h3>
        </div>
        <div className="doc-gate-content">
          <p>
            <strong>When:</strong> After MVP validation passes all checks
          </p>
          <div className="doc-gate-criteria">
            <h4>Pass Criteria:</h4>
            <ul>
              <li>Zero critical red flags</li>
              <li>All required bridges enabled</li>
              <li>Module scores ≥ 80 for all 8 modules</li>
              <li>Layout questions completed</li>
            </ul>
          </div>
          <div className="doc-gate-unlocks">
            <h4>Unlocks:</h4>
            <span>Validated brief generation, ready for design team handoff</span>
          </div>
        </div>
      </div>

      {/* Gate 3: Market Positioned */}
      <div className="doc-gate-card">
        <div className="doc-gate-header">
          <div className="doc-gate-number">Gate 3</div>
          <h3>Market Positioned</h3>
        </div>
        <div className="doc-gate-content">
          <p>
            <strong>When:</strong> After KYM Buyer Alignment Matrix scoring completes
          </p>
          <div className="doc-gate-criteria">
            <h4>Pass Criteria:</h4>
            <ul>
              <li>BAM combined score ≥ 80%</li>
              <li>Client satisfaction score ≥ 80%</li>
              <li>Market appeal score ≥ 80%</li>
              <li>Comparable analysis reviewed</li>
            </ul>
          </div>
          <div className="doc-gate-unlocks">
            <h4>Unlocks:</h4>
            <span>Site evaluation with market context, land acquisition search</span>
          </div>
        </div>
      </div>

      {/* Gate 4: Site Validated */}
      <div className="doc-gate-card">
        <div className="doc-gate-header">
          <div className="doc-gate-number">Gate 4</div>
          <h3>Site Validated</h3>
        </div>
        <div className="doc-gate-content">
          <p>
            <strong>When:</strong> After KYS site assessment produces GO recommendation
          </p>
          <div className="doc-gate-criteria">
            <h4>Pass Criteria:</h4>
            <ul>
              <li>Traffic light: GREEN (score 4.0-5.0)</li>
              <li>Zero triggered deal-breakers</li>
              <li>No more than 2 RED categories</li>
              <li>No more than 3 AMBER categories</li>
            </ul>
          </div>
          <div className="doc-gate-unlocks">
            <h4>Unlocks:</h4>
            <span>VMX cost analysis with site-specific typology and land cost inputs</span>
          </div>
        </div>
      </div>

      {/* Gate 5: Budget Validated */}
      <div className="doc-gate-card doc-gate-card--critical">
        <div className="doc-gate-header">
          <div className="doc-gate-number">Gate 5</div>
          <h3>Budget Validated</h3>
        </div>
        <div className="doc-gate-content">
          <p>
            <strong>When:</strong> After VMX cost trajectory falls within KYC budget constraints
          </p>
          <div className="doc-gate-criteria">
            <h4>Pass Criteria:</h4>
            <ul>
              <li>Grand total within KYC budget framework</li>
              <li>No category exceeds guardrail limits</li>
              <li>Budget watchouts reviewed and acknowledged</li>
              <li>Client pack generated for design team</li>
            </ul>
          </div>
          <div className="doc-gate-unlocks">
            <h4>Unlocks:</h4>
            <span>Complete validated brief package ready for architect and design team handoff</span>
          </div>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Gate Philosophy</h3>
        <p className="doc-paragraph">
          N4S gates are designed to catch problems early when they're cheap to fix. A red flag 
          caught in MVP costs nothing to resolve—just change a setting. The same conflict 
          discovered during construction could cost hundreds of thousands of dollars and 
          months of delay.
        </p>
        <div className="doc-cost-curve">
          <div className="doc-cost-item">
            <strong>KYC/FYI</strong>
            <span className="doc-cost-low">Free to change</span>
          </div>
          <div className="doc-cost-item">
            <strong>MVP</strong>
            <span className="doc-cost-low">Free to change</span>
          </div>
          <div className="doc-cost-item">
            <strong>Schematic Design</strong>
            <span className="doc-cost-medium">$10K-50K to change</span>
          </div>
          <div className="doc-cost-item">
            <strong>Construction</strong>
            <span className="doc-cost-high">$100K+ to change</span>
          </div>
        </div>
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
          Quick reference for N4S terminology, module summaries, and key concepts.
        </p>
      </div>

      {/* Module Quick Reference */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Module Quick Reference</h3>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <span>Module</span>
            <span>Full Name</span>
            <span>Primary Output</span>
            <span>Status</span>
          </div>
          <div className="doc-ref-row">
            <span className="doc-ref-code">KYC</span>
            <span>Know Your Client</span>
            <span>Lifestyle profile, Design DNA</span>
            <span><ModuleStatusBadge status="active" /></span>
          </div>
          <div className="doc-ref-row">
            <span className="doc-ref-code">FYI</span>
            <span>Find Your Inspiration</span>
            <span>Space program with SF allocations</span>
            <span><ModuleStatusBadge status="active" /></span>
          </div>
          <div className="doc-ref-row">
            <span className="doc-ref-code">MVP</span>
            <span>Mansion Validation Program</span>
            <span>Validated adjacency brief</span>
            <span><ModuleStatusBadge status="active" /></span>
          </div>
          <div className="doc-ref-row">
            <span className="doc-ref-code">KYM</span>
            <span>Know Your Market</span>
            <span>BAM score, market analysis, land search</span>
            <span><ModuleStatusBadge status="active" /></span>
          </div>
          <div className="doc-ref-row">
            <span className="doc-ref-code">KYS</span>
            <span>Know Your Site</span>
            <span>GO/AMBER/NO-GO recommendation</span>
            <span><ModuleStatusBadge status="active" /></span>
          </div>
          <div className="doc-ref-row">
            <span className="doc-ref-code">VMX</span>
            <span>Vision Matrix</span>
            <span>Cost trajectory, budget scenarios</span>
            <span><ModuleStatusBadge status="active" /></span>
          </div>
        </div>
      </div>

      {/* Tier Definitions */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Program Tiers</h3>
        <p className="doc-paragraph">
          N4S uses tiers to apply appropriate benchmarks based on your target square footage. 
          Larger homes require more sophisticated adjacency logic.
        </p>
        <div className="doc-tier-grid">
          <div className="doc-tier-item">
            <div className="doc-tier-badge">5K</div>
            <div className="doc-tier-info">
              <strong>&lt; 7,500 SF</strong>
              <p>Efficient luxury. Core program with essential staff support.</p>
            </div>
          </div>
          <div className="doc-tier-item">
            <div className="doc-tier-badge">10K</div>
            <div className="doc-tier-info">
              <strong>7,500 - 12,500 SF</strong>
              <p>Expanded program. Dedicated guest wing, enhanced wellness.</p>
            </div>
          </div>
          <div className="doc-tier-item">
            <div className="doc-tier-badge">15K</div>
            <div className="doc-tier-info">
              <strong>12,500 - 17,500 SF</strong>
              <p>Full program. Multiple zones, comprehensive back-of-house.</p>
            </div>
          </div>
          <div className="doc-tier-item">
            <div className="doc-tier-badge">20K</div>
            <div className="doc-tier-info">
              <strong>17,500+ SF</strong>
              <p>Estate scale. Complex operations, multiple structures.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Respondent Types */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Respondent Types</h3>
        <div className="doc-respondent-ref">
          <div className="doc-respondent-item">
            <div className="doc-respondent-badge doc-respondent-badge--navy">Principal</div>
            <div>
              <p>Primary decision-maker who completes all sections. Captures core project 
              parameters, budget, and household composition.</p>
              <span className="doc-respondent-scope">Scope: All 9 KYC sections</span>
            </div>
          </div>
          <div className="doc-respondent-item">
            <div className="doc-respondent-badge doc-respondent-badge--teal">Secondary</div>
            <div>
              <p>Spouse or co-decision-maker who provides their own perspective. Selections 
              are additive to the Principal's choices.</p>
              <span className="doc-respondent-scope">Scope: Design, Lifestyle, Space (P1.A.5/6/7)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Glossary</h3>
        <ExpandableSection title="View All Terms" defaultOpen={false}>
          <dl className="doc-glossary">
            <dt>Adjacency</dt>
            <dd>The spatial relationship between two rooms (Adjacent, Near, Buffered, or Separated).</dd>
            
            <dt>Benchmark</dt>
            <dd>The recommended configuration for homes of a specific tier, based on luxury residence best practices.</dd>
            
            <dt>Bridge</dt>
            <dd>A specialized transition space that enables buffered relationships while maintaining functionality (e.g., Butler Pantry, Sound Lock).</dd>
            
            <dt>Design DNA</dt>
            <dd>Your visual preference profile generated from the KYC taste exploration, showing affinities across 10 design categories.</dd>
            
            <dt>Gate</dt>
            <dd>A validation checkpoint that must pass before proceeding to the next phase.</dd>
            
            <dt>Operating Model</dt>
            <dd>How your household runs day-to-day—casual vs. formal, self-sufficient vs. fully staffed.</dd>
            
            <dt>Privacy Posture</dt>
            <dd>Your tolerance for visibility between zones—from open-plan living to strict acoustic separation.</dd>
            
            <dt>Red Flag</dt>
            <dd>A critical violation in MVP that represents a fundamental failure in mansion programming.</dd>
            
            <dt>Space Program</dt>
            <dd>The complete list of rooms in your home with square footage allocations and zone assignments.</dd>
            
            <dt>Tier</dt>
            <dd>Your project's size category (5K, 10K, 15K, 20K) which determines which benchmarks apply.</dd>
            
            <dt>Zone</dt>
            <dd>A functional grouping of related spaces (Private, Living & Entertainment, Wellness & Recreation, Support Amenities).</dd>
          </dl>
        </ExpandableSection>
      </div>

      {/* Data Flow */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Data Flow</h3>
        <p className="doc-paragraph">
          N4S modules share data through a centralized context. Changes in earlier modules 
          automatically flow to later modules.
        </p>
        <div className="doc-dataflow">
          <div className="doc-dataflow-item">
            <span className="doc-dataflow-source">KYC</span>
            <span className="doc-dataflow-arrow">→</span>
            <span className="doc-dataflow-target">FYI</span>
            <span className="doc-dataflow-data">Target SF, family size, lifestyle inputs, LuXeBrief living responses</span>
          </div>
          <div className="doc-dataflow-item">
            <span className="doc-dataflow-source">FYI</span>
            <span className="doc-dataflow-arrow">→</span>
            <span className="doc-dataflow-target">MVP</span>
            <span className="doc-dataflow-data">Space program, zones, level assignments, tier detection</span>
          </div>
          <div className="doc-dataflow-item">
            <span className="doc-dataflow-source">KYC + FYI</span>
            <span className="doc-dataflow-arrow">→</span>
            <span className="doc-dataflow-target">KYM</span>
            <span className="doc-dataflow-data">Location, target SF, budget tier for market benchmarking</span>
          </div>
          <div className="doc-dataflow-item">
            <span className="doc-dataflow-source">KYM</span>
            <span className="doc-dataflow-arrow">→</span>
            <span className="doc-dataflow-target">KYS</span>
            <span className="doc-dataflow-data">Land parcels from acquisition search → site library</span>
          </div>
          <div className="doc-dataflow-item">
            <span className="doc-dataflow-source">KYC + FYI + KYS</span>
            <span className="doc-dataflow-arrow">→</span>
            <span className="doc-dataflow-target">VMX</span>
            <span className="doc-dataflow-data">Target SF, quality tier, location, typology, land cost, program bias</span>
          </div>
          <div className="doc-dataflow-item">
            <span className="doc-dataflow-source">All Modules</span>
            <span className="doc-dataflow-arrow">→</span>
            <span className="doc-dataflow-target">Brief</span>
            <span className="doc-dataflow-data">Validated program + market + site + budget for design team</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main DashboardDocumentation Component
 */
export default function DashboardDocumentation({ onClose, printAll }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef(null);
  
  const handleExportPdf = () => {
    exportDocumentationPdf({
      contentRef,
      setActiveTab,
      tabIds: ['overview', 'workflow', 'gates', 'reference'],
      moduleName: 'Dashboard',
      moduleSubtitle: 'Luxury Residential Advisory Platform Guide',
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
          <h1 className="doc-print-header__title">N4S Dashboard — Documentation</h1>
          <p className="doc-print-header__subtitle">N4S — Luxury Residential Advisory Platform</p>
        </div>
      )}
      {!printAll && (
        <div className="doc-header">
          <div className="doc-header-top">
            {onClose && (
              <button className="doc-close-btn" onClick={onClose}>
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            )}
            <button className="doc-export-btn" onClick={handleExportPdf} disabled={isExporting}>
              <FileDown size={16} className={isExporting ? 'spinning' : ''} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
          <h1 className="doc-title">Documentation</h1>
          <p className="doc-subtitle">N4S — Luxury Residential Advisory Platform Guide</p>

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

      <style>{dashboardDocStyles}</style>
    </div>
  );
}

// Complete documentation styles (base + dashboard-specific)
const dashboardDocStyles = `
/* ============================================
   BASE DOCUMENTATION STYLES (N4S Brand Guide)
   ============================================ */

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

.doc-card--warning {
  background-color: #fffbf0;
  border-color: ${COLORS.warning};
}

.doc-card--muted {
  background: ${COLORS.background};
  opacity: 0.9;
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
.doc-list-icon.warning { color: ${COLORS.warning}; }
.doc-list-icon.error { color: ${COLORS.error}; }

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

/* Timeline */
.doc-timeline {
  position: relative;
  padding-left: 2rem;
}

.doc-timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  background-color: ${COLORS.border};
}

.doc-timeline-item {
  position: relative;
  padding: 0.75rem 0;
}

.doc-timeline-item::before {
  content: '';
  position: absolute;
  left: -1.625rem;
  top: 1rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${COLORS.navy};
  border: 2px solid ${COLORS.surface};
}

.doc-timeline-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.doc-timeline-content strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-timeline-content p {
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

/* ============================================
   DASHBOARD-SPECIFIC STYLES
   ============================================ */

/* Journey Preview */
.doc-journey-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: ${COLORS.surface};
  border-radius: 8px;
}

.doc-journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.doc-journey-badge {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.doc-journey-step span {
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${COLORS.text};
}

.doc-journey-arrow {
  color: ${COLORS.textMuted};
  margin: 0 0.25rem;
}

/* User Grid */
.doc-user-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.doc-user-type {
  padding: 1rem;
  background: ${COLORS.background};
  border-radius: 6px;
}

.doc-user-type strong {
  display: block;
  color: ${COLORS.navy};
  margin-bottom: 0.5rem;
}

.doc-user-type p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.5;
}

/* Module Cards */
.doc-module-card {
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.doc-module-card--placeholder {
  opacity: 0.8;
  background: ${COLORS.background};
}

.doc-module-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.border};
}

.doc-module-badge {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
}

.doc-module-title-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.doc-module-title-area h3 {
  font-size: 1.0625rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
}

.doc-module-timing {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.doc-module-body {
  padding: 1.5rem;
}

.doc-module-body > p {
  font-size: 0.9375rem;
  color: ${COLORS.text};
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.doc-module-sections,
.doc-module-outputs {
  margin-top: 1rem;
}

.doc-module-sections strong,
.doc-module-outputs strong {
  display: block;
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.doc-section-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.doc-section-tags span {
  padding: 0.25rem 0.75rem;
  background: ${COLORS.background};
  border-radius: 4px;
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

.doc-module-card--placeholder .doc-section-tags span {
  background: ${COLORS.surface};
}

.doc-module-outputs ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.doc-module-outputs li {
  font-size: 0.875rem;
  color: ${COLORS.text};
  padding-left: 1rem;
  position: relative;
}

.doc-module-outputs li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: ${COLORS.gold};
}

/* Gate Cards */
.doc-gate-card {
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.doc-gate-card--critical {
  border-color: ${COLORS.gold};
}

.doc-gate-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.border};
}

.doc-gate-number {
  width: 60px;
  padding: 0.375rem 0.75rem;
  background: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.doc-gate-number--future {
  background: ${COLORS.textMuted};
}

.doc-gate-header h3 {
  font-size: 1.0625rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
}

.doc-gate-content {
  padding: 1.5rem;
}

.doc-gate-content > p {
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.doc-gate-criteria,
.doc-gate-unlocks {
  margin-top: 1rem;
}

.doc-gate-criteria h4,
.doc-gate-unlocks h4 {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.doc-gate-criteria ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-gate-criteria li {
  font-size: 0.875rem;
  color: ${COLORS.text};
  padding: 0.25rem 0 0.25rem 1.25rem;
  position: relative;
}

.doc-gate-criteria li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: ${COLORS.success};
  font-weight: bold;
}

.doc-gate-unlocks span {
  font-size: 0.875rem;
  color: ${COLORS.navy};
  font-weight: 500;
}

/* Future Gates */
.doc-future-gates {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doc-future-gate {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: ${COLORS.surface};
  border-radius: 6px;
}

.doc-future-gate strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-future-gate p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Cost Curve */
.doc-cost-curve {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.doc-cost-item {
  text-align: center;
  padding: 1rem 0.5rem;
  background: ${COLORS.background};
  border-radius: 6px;
}

.doc-cost-item strong {
  display: block;
  font-size: 0.8125rem;
  color: ${COLORS.text};
  margin-bottom: 0.375rem;
}

.doc-cost-low {
  font-size: 0.75rem;
  color: ${COLORS.success};
  font-weight: 500;
}

.doc-cost-medium {
  font-size: 0.75rem;
  color: ${COLORS.warning};
  font-weight: 500;
}

.doc-cost-high {
  font-size: 0.75rem;
  color: ${COLORS.error};
  font-weight: 500;
}

/* Reference Table */
.doc-ref-table {
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-ref-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 100px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  align-items: center;
}

.doc-ref-row:last-child {
  border-bottom: none;
}

.doc-ref-row--header {
  background: ${COLORS.background};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-ref-code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${COLORS.navy};
}

/* Tier Grid */
.doc-tier-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-tier-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${COLORS.background};
  border-radius: 6px;
}

.doc-tier-badge {
  padding: 0.5rem 0.75rem;
  background: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  height: fit-content;
}

.doc-tier-info strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-tier-info p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

/* Respondent Reference */
.doc-respondent-ref {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doc-respondent-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${COLORS.background};
  border-radius: 6px;
}

.doc-respondent-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  height: fit-content;
}

.doc-respondent-badge--navy {
  background: ${COLORS.navy};
}

.doc-respondent-badge--teal {
  background: ${COLORS.teal};
}

.doc-respondent-item p {
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.doc-respondent-scope {
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
}

/* Data Flow */
.doc-dataflow {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-dataflow-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${COLORS.background};
  border-radius: 6px;
}

.doc-dataflow-source,
.doc-dataflow-target {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.doc-dataflow-source {
  background: ${COLORS.navy};
  color: #fff;
}

.doc-dataflow-target {
  background: ${COLORS.gold};
  color: ${COLORS.text};
}

.doc-dataflow-arrow {
  color: ${COLORS.textMuted};
}

.doc-dataflow-data {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

/* ============================================
   RESPONSIVE STYLES
   ============================================ */

@media (max-width: 768px) {
  .doc-user-grid {
    grid-template-columns: 1fr;
  }
  
  .doc-module-outputs ul {
    grid-template-columns: 1fr;
  }
  
  .doc-ref-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .doc-tier-grid {
    grid-template-columns: 1fr;
  }
  
  .doc-cost-curve {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .doc-journey-preview {
    flex-wrap: wrap;
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
