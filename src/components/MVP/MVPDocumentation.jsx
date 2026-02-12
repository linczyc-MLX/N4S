/**
 * MVPDocumentation
 * 
 * Documentation panel for the MVP (Master Validation Program) module.
 * Follows the N4S documentation template with 4 tabs:
 * - Overview: What MVP is and what it delivers
 * - Workflow: Step-by-step process and where it fits in the project
 * - Gates: Red flags, bridges, and module score thresholds
 * - Reference: Technical definitions and prerequisites
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
  XCircle,
  Info,
  Layers,
  Home,
  Users,
  Volume2,
  Utensils,
  Car,
  Dumbbell,
  Briefcase,
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
        <h2 className="doc-section-title">What is MVP?</h2>
        <p className="doc-paragraph">
          The Master Validation Program (MVP) is your adjacency validation tool. It ensures the spatial 
          relationships in your home design protect what matters most: family privacy, acoustic comfort, 
          and seamless operations. MVP uses your lifestyle inputs from KYC and space requirements from 
          FYI to validate your custom mansion program before expensive design decisions are made.
        </p>
        <p className="doc-paragraph">
          Think of MVP as a pre-flight checklist for your home. Just as pilots verify critical systems 
          before takeoff, MVP verifies that your room relationships won't create conflicts that are 
          costly to fix later—like discovering your guest suite shares a wall with your home theater, 
          or that delivery drivers will walk through your formal dining room.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Primary Outcomes</h3>
        <ul className="doc-list">
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Validated Adjacency Matrix</strong>
              <p>A verified map of room relationships that protects family privacy and operational flow</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Red Flag Detection</strong>
              <p>Early identification of critical conflicts before they become expensive redesigns</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Bridge Recommendations</strong>
              <p>Suggested transition spaces that solve common circulation and acoustic challenges</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Module Scores</strong>
              <p>Quantified performance metrics showing how well each area of your home functions</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">What's Included</h3>
        <div className="doc-grid-2">
          <div className="doc-feature">
            <div className="doc-feature-number">8</div>
            <div className="doc-feature-text">
              <strong>Validation Modules</strong>
              <p>Each contributes to the overall validation score, covering all mansion program areas</p>
            </div>
          </div>
          <div className="doc-feature">
            <div className="doc-feature-number">10</div>
            <div className="doc-feature-text">
              <strong>Layout Questions</strong>
              <p>Personalization decisions that shape your unique adjacency requirements</p>
            </div>
          </div>
          <div className="doc-feature">
            <div className="doc-feature-number">5</div>
            <div className="doc-feature-text">
              <strong>Critical Red Flags</strong>
              <p>Must-resolve violations that would compromise your home's function</p>
            </div>
          </div>
          <div className="doc-feature">
            <div className="doc-feature-number">5</div>
            <div className="doc-feature-text">
              <strong>Operational Bridges</strong>
              <p>Recommended transition spaces for circulation optimization</p>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card doc-card--highlight">
        <h3 className="doc-subsection-title">Tiered Benchmarks</h3>
        <p className="doc-paragraph">
          MVP automatically detects your project tier based on target square footage and applies 
          the appropriate benchmark relationships. Larger homes require more sophisticated 
          adjacency logic to maintain privacy and operational efficiency at scale.
        </p>
        <div className="doc-tiers">
          <div className="doc-tier">
            <span className="doc-tier-label">5K</span>
            <span className="doc-tier-range">&lt; 7,500 SF</span>
          </div>
          <div className="doc-tier">
            <span className="doc-tier-label">10K</span>
            <span className="doc-tier-range">7,500 - 12,500 SF</span>
          </div>
          <div className="doc-tier">
            <span className="doc-tier-label">15K</span>
            <span className="doc-tier-range">12,500 - 17,500 SF</span>
          </div>
          <div className="doc-tier">
            <span className="doc-tier-label">20K</span>
            <span className="doc-tier-range">17,500+ SF</span>
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
        <h2 className="doc-section-title">MVP Validation Workflow</h2>
        <p className="doc-paragraph">
          Complete these steps to validate your mansion program. The goal is to lock your adjacency 
          logic early—before schematic design—so you can refine dimensions, detailing, and materiality 
          without re-breaking the spatial relationships that protect privacy and operations.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="doc-card doc-card--warning">
        <h3 className="doc-subsection-title">Before You Begin</h3>
        <p className="doc-paragraph">
          MVP requires inputs from earlier modules. Confirm these are complete:
        </p>
        <div className="doc-prereq-list">
          <div className="doc-prereq">
            <span className="doc-prereq-module">KYC</span>
            <span className="doc-prereq-items">Operating model, privacy posture, staffing level, entertaining frequency</span>
          </div>
          <div className="doc-prereq">
            <span className="doc-prereq-module">FYI</span>
            <span className="doc-prereq-items">Space program with zones, S/M/L sizing selections, lifestyle requirements</span>
          </div>
        </div>
      </div>

      {/* Phase 1 */}
      <div className="doc-phase">
        <div className="doc-phase-badge">Step 1</div>
        <h3 className="doc-phase-title">Review Your Program</h3>
        <div className="doc-phase-content">
          <p>Start by confirming your imported program is correct:</p>
          <ul className="doc-checklist">
            <li>View <strong>Program Summary</strong> to see all imported spaces</li>
            <li>Confirm your tier detection matches your target SF</li>
            <li>Browse the <strong>Module Library</strong> to understand what each validation module covers</li>
          </ul>
          <div className="doc-tip">
            <Info size={14} />
            <span>If spaces are missing or incorrect, return to the FYI module to make changes.</span>
          </div>
        </div>
      </div>

      {/* Phase 2 */}
      <div className="doc-phase">
        <div className="doc-phase-badge">Step 2</div>
        <h3 className="doc-phase-title">Answer Layout Questions</h3>
        <div className="doc-phase-content">
          <p>The heart of MVP: 10 personalization decisions that shape your adjacency requirements.</p>
          <ul className="doc-checklist">
            <li>Each question addresses a specific lifestyle trade-off</li>
            <li>Your answers determine which rooms should be adjacent, near, buffered, or separated</li>
            <li>Some choices enable <strong>operational bridges</strong> (transition spaces)</li>
            <li>Selections save automatically—you can return and change them anytime</li>
          </ul>
          <div className="doc-example">
            <strong>Example:</strong> "How should your kitchen relate to family activities?"
            <p>Choosing "Open Connection" creates an Adjacent relationship between Kitchen and Great Room. 
            Choosing "Formal Separation" adds a Butler Pantry bridge and creates a Buffered relationship.</p>
          </div>
        </div>
      </div>

      {/* Phase 3 */}
      <div className="doc-phase">
        <div className="doc-phase-badge">Step 3</div>
        <h3 className="doc-phase-title">Review Adjacency Matrix</h3>
        <div className="doc-phase-content">
          <p>Compare your personalized adjacencies against the benchmark:</p>
          <ul className="doc-checklist">
            <li>Toggle between <strong>Desired</strong> (benchmark) and <strong>Achieved</strong> (your selections)</li>
            <li>Deviations are highlighted—these aren't necessarily wrong, just different from typical</li>
            <li>Understand the relationship types: A (Adjacent), N (Near), B (Buffered), S (Separated)</li>
          </ul>
        </div>
      </div>

      {/* Phase 4 */}
      <div className="doc-phase">
        <div className="doc-phase-badge">Step 4</div>
        <h3 className="doc-phase-title">Run Validation</h3>
        <div className="doc-phase-content">
          <p>Execute the validation engine to check your program against the N4S ruleset:</p>
          <div className="doc-validation-checks">
            <div className="doc-check">
              <XCircle size={16} className="doc-check-icon error" />
              <div>
                <strong>Red Flags</strong>
                <p>Critical violations that must be resolved (target: 0)</p>
              </div>
            </div>
            <div className="doc-check">
              <AlertTriangle size={16} className="doc-check-icon warning" />
              <div>
                <strong>Bridges</strong>
                <p>Recommended transition spaces (target: all required bridges enabled)</p>
              </div>
            </div>
            <div className="doc-check">
              <CheckCircle size={16} className="doc-check-icon success" />
              <div>
                <strong>Module Scores</strong>
                <p>Each module contributes to the overall validation score (target: 80+ overall)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 5 */}
      <div className="doc-phase">
        <div className="doc-phase-badge">Step 5</div>
        <h3 className="doc-phase-title">Iterate or Proceed</h3>
        <div className="doc-phase-content">
          <p>Based on validation results:</p>
          <div className="doc-outcomes">
            <div className="doc-outcome">
              <span className="doc-outcome-if">If red flags triggered:</span>
              <span className="doc-outcome-then">Edit decisions to resolve the specific conflicts</span>
            </div>
            <div className="doc-outcome">
              <span className="doc-outcome-if">If bridges missing:</span>
              <span className="doc-outcome-then">Review which layout questions enable them</span>
            </div>
            <div className="doc-outcome">
              <span className="doc-outcome-if">If overall score below 80:</span>
              <span className="doc-outcome-then">Check which modules are underperforming and which adjacencies are causing deviations</span>
            </div>
            <div className="doc-outcome doc-outcome--success">
              <span className="doc-outcome-if">If all gates pass:</span>
              <span className="doc-outcome-then">Proceed to Concept Plan with confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">PDF Report Export</h3>
        <p className="doc-paragraph">
          MVP includes a comprehensive PDF report generator that exports the full validation results
          including adjacency matrix, red flag report, bridge recommendations, and module scores.
          Access the export via the report button in the module header.
        </p>
      </div>

      {/* Project Context */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Where MVP Fits in Your Project</h3>
        <div className="doc-timeline">
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Stage A</div>
            <div className="doc-timeline-content">
              <strong>Profile Complete</strong>
              <p>KYC data validated — operating model, privacy posture, staffing, and entertaining inputs confirmed</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Stage B</div>
            <div className="doc-timeline-content">
              <strong>Space Program</strong>
              <p>FYI allocations confirmed — zones assigned, S/M/L sizing selected, tier detection verified</p>
            </div>
          </div>
          <div className="doc-timeline-item doc-timeline-item--active">
            <div className="doc-timeline-badge">Stage C</div>
            <div className="doc-timeline-content">
              <strong>Module Validation</strong>
              <p>8 validation modules scored — adjacency choices evaluated against tier benchmarks</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Stage D</div>
            <div className="doc-timeline-content">
              <strong>Adjacency Lock</strong>
              <p>Adjacency decisions finalized — red flags resolved, bridges enabled, matrix confirmed</p>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-badge">Stage E</div>
            <div className="doc-timeline-content">
              <strong>Brief Ready</strong>
              <p>The final validation gate. Once adjacency decisions are locked and the overall score meets the threshold, the system generates a validated brief package that can be exported as a PDF for design team handoff.</p>
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
        <h2 className="doc-section-title">Master Adjacency Gate</h2>
        <p className="doc-paragraph">
          The MVP validation gate is a pre-design decision gate. Your program passes if it contains
          zero critical red flags, has all required bridges enabled, and achieves an overall validation
          score of 80 or above. Passing this gate means your adjacency logic is sound and you can
          proceed to adjacency review with confidence.
        </p>
        <div className="doc-gate-criteria">
          <div className="doc-criterion">
            <XCircle size={20} color={COLORS.error} />
            <span>Zero red flags triggered</span>
          </div>
          <div className="doc-criterion">
            <AlertTriangle size={20} color={COLORS.warning} />
            <span>All required bridges enabled</span>
          </div>
          <div className="doc-criterion">
            <CheckCircle size={20} color={COLORS.success} />
            <span>Overall validation score ≥ 80</span>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      <div className="doc-card">
        <h3 className="doc-subsection-title doc-subsection-title--error">
          Critical Red Flags (Must Resolve)
        </h3>
        <p className="doc-paragraph">
          These five violations represent fundamental failures in mansion programming. Each would 
          compromise your family's privacy, acoustic comfort, or operational efficiency in ways 
          that are costly and disruptive to fix once construction begins.
        </p>

        <div className="doc-redflag">
          <div className="doc-redflag-number">1</div>
          <div className="doc-redflag-content">
            <h4>Guest → Primary Suite Collision</h4>
            <p className="doc-redflag-what">
              <strong>What it checks:</strong> Guest circulation shouldn't pass through or be directly 
              adjacent to your primary suite.
            </p>
            <p className="doc-redflag-why">
              <strong>Why it matters:</strong> Your primary suite is your retreat. Guests—even family—shouldn't 
              see into your bedroom, hear your conversations, or feel your presence when you're trying to rest. 
              This is about fundamental privacy.
            </p>
            <p className="doc-redflag-how">
              <strong>How to resolve:</strong> Ensure guest zones have a Buffered (B) or Separated (S) 
              relationship with your primary suite. Never Adjacent (A) or Near (N).
            </p>
          </div>
        </div>

        <div className="doc-redflag">
          <div className="doc-redflag-number">2</div>
          <div className="doc-redflag-content">
            <h4>Delivery → Front of House</h4>
            <p className="doc-redflag-what">
              <strong>What it checks:</strong> Service and delivery routes shouldn't pass through 
              formal entertaining spaces.
            </p>
            <p className="doc-redflag-why">
              <strong>Why it matters:</strong> Package deliveries, grocery runs, and staff movement 
              shouldn't interrupt your dinner party or family breakfast. Operations should be invisible 
              to guests.
            </p>
            <p className="doc-redflag-how">
              <strong>How to resolve:</strong> Create a service spine with Separated (S) relationship 
              from foyer, great room, and formal dining. Consider adding an Ops Core bridge.
            </p>
          </div>
        </div>

        <div className="doc-redflag">
          <div className="doc-redflag-number">3</div>
          <div className="doc-redflag-content">
            <h4>Media → Bedroom Acoustic Bleed</h4>
            <p className="doc-redflag-what">
              <strong>What it checks:</strong> Media rooms shouldn't share walls with sleeping areas.
            </p>
            <p className="doc-redflag-why">
              <strong>Why it matters:</strong> Late-night movies, sports games, or music shouldn't 
              disturb family members who've gone to bed. Acoustic isolation enables 24/7 use without 
              household conflict.
            </p>
            <p className="doc-redflag-how">
              <strong>How to resolve:</strong> Add a Sound Lock bridge between media and bedroom zones, 
              or ensure a Separated (S) relationship with Zone 0 (sleeping areas).
            </p>
          </div>
        </div>

        <div className="doc-redflag">
          <div className="doc-redflag-number">4</div>
          <div className="doc-redflag-content">
            <h4>Kitchen Exposed at Entry</h4>
            <p className="doc-redflag-what">
              <strong>What it checks:</strong> Kitchen shouldn't be the first thing visible from the foyer.
            </p>
            <p className="doc-redflag-why">
              <strong>Why it matters:</strong> A working kitchen—with dishes in the sink, prep underway, 
              or last night's takeout containers—shouldn't greet your guests. First impressions matter, 
              especially in a luxury residence.
            </p>
            <p className="doc-redflag-how">
              <strong>How to resolve:</strong> Create a Buffered (B) relationship between kitchen and 
              foyer, typically via a butler pantry or strategic sightline blocking.
            </p>
          </div>
        </div>

        <div className="doc-redflag">
          <div className="doc-redflag-number">5</div>
          <div className="doc-redflag-content">
            <h4>Guest Route Through Kitchen</h4>
            <p className="doc-redflag-what">
              <strong>What it checks:</strong> Guest circulation to dining or terrace shouldn't cross 
              through the kitchen work zone.
            </p>
            <p className="doc-redflag-why">
              <strong>Why it matters:</strong> Catering staff prepping appetizers, your spouse cooking 
              dinner, or your housekeeper unloading groceries shouldn't conflict with guests moving 
              between entertaining spaces.
            </p>
            <p className="doc-redflag-how">
              <strong>How to resolve:</strong> Create alternate guest routes via the great room or 
              butler pantry. Ensure kitchen has a Separated (S) relationship from guest circulation paths.
            </p>
          </div>
        </div>
      </div>

      {/* Bridges */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Operational Bridges (Recommended)</h3>
        <p className="doc-paragraph">
          Bridges are specialized transition spaces that solve common conflicts between zones. 
          They're enabled by your Layout Question answers—certain lifestyle choices trigger 
          the need for these spaces.
        </p>

        <ExpandableSection title="Butler Pantry" defaultOpen={true}>
          <div className="doc-bridge">
            <div className="doc-bridge-meta">
              <span className="doc-bridge-trigger">
                <strong>Triggered by:</strong> Formal entertaining OR staffed service OR catering support
              </span>
              <span className="doc-bridge-impact">+120 SF</span>
            </div>
            <p>
              A service corridor between kitchen and formal dining that allows staff to plate, 
              garnish, and serve without crossing guest sightlines. Think of it as backstage 
              for your dinner parties.
            </p>
            <p className="doc-bridge-benefit">
              <strong>Enables:</strong> Hidden plating, dirty dish staging, wine service prep, 
              catering coordination—all invisible to guests.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Guest Autonomy Node">
          <div className="doc-bridge">
            <div className="doc-bridge-meta">
              <span className="doc-bridge-trigger">
                <strong>Triggered by:</strong> Extended family visits OR multi-generational living OR vacation home typology
              </span>
              <span className="doc-bridge-impact">+150 SF</span>
            </div>
            <p>
              A self-contained guest zone with independent entry, kitchenette access, and 
              living area for extended stays. Guests can come and go, make coffee, and live 
              independently without crossing through your private spaces.
            </p>
            <p className="doc-bridge-benefit">
              <strong>Enables:</strong> Week-long visits without friction, in-law accommodations, 
              rental potential, staff quarters flexibility.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Sound Lock Vestibule">
          <div className="doc-bridge">
            <div className="doc-bridge-meta">
              <span className="doc-bridge-trigger">
                <strong>Triggered by:</strong> Late-night media use OR home theater OR music room OR recording studio
              </span>
              <span className="doc-bridge-impact">+60 SF</span>
            </div>
            <p>
              A double-door acoustic buffer between high-noise spaces (media room, theater) 
              and quiet zones (bedrooms). Creates an airlock that prevents sound transmission 
              even with doors opening.
            </p>
            <p className="doc-bridge-benefit">
              <strong>Enables:</strong> 2 AM movie marathons, Sunday football at full volume, 
              band practice—without disturbing those sleeping.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Wet-Feet Intercept">
          <div className="doc-bridge">
            <div className="doc-bridge-meta">
              <span className="doc-bridge-trigger">
                <strong>Triggered by:</strong> Pool/spa program OR pool entertainment enabled
              </span>
              <span className="doc-bridge-impact">+80 SF</span>
            </div>
            <p>
              A transition zone with drainage, towel storage, and outdoor shower between 
              pool area and main house. Prevents wet feet, chlorine drips, and sand from 
              tracking through your home.
            </p>
            <p className="doc-bridge-benefit">
              <strong>Enables:</strong> Seamless indoor-outdoor flow, pool party hosting, 
              spa access without damaging interior finishes.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Ops Core">
          <div className="doc-bridge">
            <div className="doc-bridge-meta">
              <span className="doc-bridge-trigger">
                <strong>Triggered by:</strong> Full-time staff OR heavy package volume OR enhanced security
              </span>
              <span className="doc-bridge-impact">+150 SF</span>
            </div>
            <p>
              A dedicated hub for staff operations including secure package receipt, 
              delivery staging, housekeeping coordination, and staff break area. 
              Centralizes the "invisible" operations that keep a mansion running.
            </p>
            <p className="doc-bridge-benefit">
              <strong>Enables:</strong> Package deliveries without interruption, staff coordination, 
              vendor access control, housekeeping efficiency.
            </p>
          </div>
        </ExpandableSection>
      </div>

      {/* Module Scores */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Module Score Thresholds</h3>
        <p className="doc-paragraph">
          MVP calculates an overall validation score. A score of 80 or above indicates the program
          passes validation and is ready for adjacency review. Each module evaluates a specific
          functional area of your home and contributes to the overall validation score.
        </p>

        <div className="doc-module-scores">
          <div className="doc-module-row">
            <Utensils size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Kitchen Rules Engine</strong>
              <p>Cooking flow, prep zones, service circulation, sightline management</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Users size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Entertaining Spine</strong>
              <p>Guest arrival sequence, formal circulation, dining-to-living flow</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Home size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Primary Suite Ecosystem</strong>
              <p>Privacy protection, bath-closet relationships, retreat quality</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Users size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Guest Wing Logic</strong>
              <p>Independence, acoustic separation, autonomous access</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Volume2 size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Media & Acoustic Control</strong>
              <p>Sound isolation, zone separation, 24/7 usability</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Car size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Service Spine</strong>
              <p>Delivery routes, back-of-house circulation, MEP access</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Dumbbell size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Wellness Program</strong>
              <p>Pool-spa relationships, gym access, indoor-outdoor transitions</p>
            </div>
          </div>
          <div className="doc-module-row">
            <Briefcase size={18} className="doc-module-icon" />
            <div className="doc-module-info">
              <strong>Staff Layer</strong>
              <p>Operations hub, staff quarters, service support functions</p>
            </div>
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
          Technical definitions, zone classifications, and prerequisites for the MVP validation system.
        </p>
      </div>

      {/* Adjacency Types */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Adjacency Relationship Types</h3>
        <p className="doc-paragraph">
          Four relationship types define how spaces connect. Understanding these is key to 
          interpreting your adjacency matrix and validation results.
        </p>

        <div className="doc-relationship">
          <div className="doc-relationship-badge doc-rel-a">A</div>
          <div className="doc-relationship-content">
            <h4>Adjacent</h4>
            <p>Direct connection with shared doorway or open flow. Rooms are immediately accessible.</p>
            <div className="doc-relationship-examples">
              <div className="doc-use-for">
                <strong>Use for:</strong> Primary suite to bath, kitchen to breakfast nook, 
                closet to dressing area
              </div>
              <div className="doc-avoid-for">
                <strong>Avoid for:</strong> Service to formal spaces, bedrooms to media, 
                guest to primary
              </div>
            </div>
          </div>
        </div>

        <div className="doc-relationship">
          <div className="doc-relationship-badge doc-rel-n">N</div>
          <div className="doc-relationship-content">
            <h4>Near</h4>
            <p>Close proximity with short walk. May share sightlines but not direct access.</p>
            <div className="doc-relationship-examples">
              <div className="doc-use-for">
                <strong>Use for:</strong> Dining to kitchen (with buffer), gym to pool, 
                home office to library
              </div>
              <div className="doc-avoid-for">
                <strong>Avoid for:</strong> Guest to primary suite, garage to foyer, 
                media to bedrooms
              </div>
            </div>
          </div>
        </div>

        <div className="doc-relationship">
          <div className="doc-relationship-badge doc-rel-b">B</div>
          <div className="doc-relationship-content">
            <h4>Buffered</h4>
            <p>Intentional separation with transition space. Enables bridges and acoustic control.</p>
            <div className="doc-relationship-examples">
              <div className="doc-use-for">
                <strong>Use for:</strong> Kitchen to formal dining (butler pantry), 
                media to bedrooms (sound lock), pool to house (wet-feet intercept)
              </div>
              <div className="doc-avoid-for">
                <strong>Avoid for:</strong> Spaces requiring immediate access like 
                primary suite to bath
              </div>
            </div>
          </div>
        </div>

        <div className="doc-relationship">
          <div className="doc-relationship-badge doc-rel-s">S</div>
          <div className="doc-relationship-content">
            <h4>Separated</h4>
            <p>Different zone with no direct connection. Maximum privacy and acoustic isolation.</p>
            <div className="doc-relationship-examples">
              <div className="doc-use-for">
                <strong>Use for:</strong> Service to formal areas, guest to primary suite, 
                garage to living spaces
              </div>
              <div className="doc-avoid-for">
                <strong>Avoid for:</strong> Spaces requiring convenient access like 
                kitchen to dining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acoustic Zones */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Acoustic Zones</h3>
        <p className="doc-paragraph">
          Spaces are classified by noise level. Red flags trigger when incompatible zones share 
          walls or have adjacent relationships.
        </p>

        <div className="doc-acoustic-grid">
          <div className="doc-acoustic-zone">
            <div className="doc-acoustic-badge zone-0">Zone 0</div>
            <div className="doc-acoustic-content">
              <strong>Quiet Sleeping</strong>
              <p>Primary suite, guest bedrooms, nursery</p>
              <p className="doc-acoustic-rule">No shared walls with Zone 3. Sound lock required if adjacent to media.</p>
            </div>
          </div>
          <div className="doc-acoustic-zone">
            <div className="doc-acoustic-badge zone-1">Zone 1</div>
            <div className="doc-acoustic-content">
              <strong>Conversation Level</strong>
              <p>Living room, dining room, library, home office</p>
              <p className="doc-acoustic-rule">Normal residential construction. Buffered from Zone 0 and 3.</p>
            </div>
          </div>
          <div className="doc-acoustic-zone">
            <div className="doc-acoustic-badge zone-2">Zone 2</div>
            <div className="doc-acoustic-content">
              <strong>Active Moderate</strong>
              <p>Kitchen, family room, gym, kids playroom</p>
              <p className="doc-acoustic-rule">Working noise acceptable. Separated from Zone 0.</p>
            </div>
          </div>
          <div className="doc-acoustic-zone">
            <div className="doc-acoustic-badge zone-3">Zone 3</div>
            <div className="doc-acoustic-content">
              <strong>High Noise</strong>
              <p>Media room, home theater, pool equipment, music room</p>
              <p className="doc-acoustic-rule">Enhanced acoustic construction. Must be Separated (S) from Zone 0.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Space Codes */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Space Codes Reference</h3>
        <ExpandableSection title="View All Space Codes">
          <div className="doc-codes-grid">
            <div className="doc-code-section">
              <h5>Arrival & Circulation</h5>
              <div className="doc-code-list">
                <span><code>FOY</code> Foyer</span>
                <span><code>GAL</code> Gallery</span>
                <span><code>MUD</code> Mudroom</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Living & Entertaining</h5>
              <div className="doc-code-list">
                <span><code>GR</code> Great Room</span>
                <span><code>LR</code> Living Room</span>
                <span><code>FR</code> Family Room</span>
                <span><code>DR</code> Dining Room</span>
                <span><code>WINE</code> Wine Room</span>
                <span><code>BAR</code> Bar</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Kitchen & Service</h5>
              <div className="doc-code-list">
                <span><code>KIT</code> Kitchen</span>
                <span><code>CHEF</code> Chef's Kitchen</span>
                <span><code>BKF</code> Breakfast Nook</span>
                <span><code>SCUL</code> Scullery</span>
                <span><code>BUTLER</code> Butler Pantry</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Primary Suite</h5>
              <div className="doc-code-list">
                <span><code>PRI</code> Primary Bedroom</span>
                <span><code>PRIBATH</code> Primary Bath</span>
                <span><code>PRICL</code> Primary Closet</span>
                <span><code>PRILOUNGE</code> Primary Lounge</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Guest & Secondary</h5>
              <div className="doc-code-list">
                <span><code>GUEST1-3</code> Guest Suites</span>
                <span><code>JRPRI</code> Junior Primary</span>
                <span><code>KIDS</code> Kids Room</span>
                <span><code>BUNK</code> Bunk Room</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Media & Recreation</h5>
              <div className="doc-code-list">
                <span><code>MEDIA</code> Media Room</span>
                <span><code>THR</code> Theater</span>
                <span><code>GAME</code> Game Room</span>
                <span><code>SNDLCK</code> Sound Lock</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Wellness</h5>
              <div className="doc-code-list">
                <span><code>GYM</code> Gym</span>
                <span><code>SPA</code> Spa</span>
                <span><code>POOL</code> Pool</span>
                <span><code>WETFT</code> Wet-Feet Intercept</span>
              </div>
            </div>
            <div className="doc-code-section">
              <h5>Service & Operations</h5>
              <div className="doc-code-list">
                <span><code>GAR</code> Garage</span>
                <span><code>LND</code> Laundry</span>
                <span><code>MEP</code> Mechanical</span>
                <span><code>STF</code> Staff</span>
                <span><code>OPSCORE</code> Ops Core</span>
              </div>
            </div>
          </div>
        </ExpandableSection>
      </div>

      {/* Prerequisites */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Prerequisites Checklist</h3>
        <p className="doc-paragraph">
          Before starting MVP validation, confirm these items are complete:
        </p>
        <div className="doc-checklist-detailed">
          <div className="doc-prereq-item">
            <input type="checkbox" disabled />
            <div>
              <strong>KYC Module Complete</strong>
              <p>Operating model defined, privacy posture selected, staffing level set, entertaining frequency captured</p>
            </div>
          </div>
          <div className="doc-prereq-item">
            <input type="checkbox" disabled />
            <div>
              <strong>FYI Module Complete</strong>
              <p>Space program finalized, zones assigned, S/M/L sizing selected for each space</p>
            </div>
          </div>
          <div className="doc-prereq-item">
            <input type="checkbox" disabled />
            <div>
              <strong>Tier Detection Verified</strong>
              <p>System shows correct benchmark tier (5K/10K/15K/20K) matching your target SF</p>
            </div>
          </div>
          <div className="doc-prereq-item">
            <input type="checkbox" disabled />
            <div>
              <strong>Target SF Confirmed</strong>
              <p>Program total aligns with your project scope and budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Glossary</h3>
        <ExpandableSection title="View Definitions">
          <dl className="doc-glossary">
            <dt>Adjacency Matrix</dt>
            <dd>A table showing the required relationship (A/N/B/S) between every pair of spaces in your program.</dd>
            
            <dt>Benchmark</dt>
            <dd>The recommended adjacency configuration for a home of your tier, based on typical luxury residence best practices.</dd>
            
            <dt>Bridge</dt>
            <dd>A specialized transition space that enables buffered relationships between zones while maintaining functionality.</dd>
            
            <dt>Deviation</dt>
            <dd>Any place where your selected relationship differs from the benchmark. Deviations aren't necessarily wrong—they reflect your personalization.</dd>
            
            <dt>Gate</dt>
            <dd>A validation checkpoint that must be passed before proceeding to the next project phase.</dd>
            
            <dt>Module</dt>
            <dd>A functional grouping of related spaces evaluated together (e.g., Kitchen Rules Engine covers KIT, CHEF, SCUL, BKF, DR).</dd>
            
            <dt>Red Flag</dt>
            <dd>A critical violation that represents a fundamental failure in mansion programming and must be resolved.</dd>
            
            <dt>Tier</dt>
            <dd>Your project's size category (5K, 10K, 15K, 20K) which determines which benchmark relationships apply.</dd>
          </dl>
        </ExpandableSection>
      </div>
    </div>
  );
}

/**
 * Main MVPDocumentation Component
 */
export default function MVPDocumentation({ onClose, initialTab = 'overview', printAll }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef(null);
  
  const handleExportPdf = () => {
    exportDocumentationPdf({
      contentRef,
      setActiveTab,
      tabIds: ['overview', 'workflow', 'gates', 'reference'],
      moduleName: 'MVP',
      moduleSubtitle: 'Master Validation Program Guide',
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
          <h1 className="doc-print-header__title">MVP (Mansion Validation Program) — Documentation</h1>
          <p className="doc-print-header__subtitle">N4S — Luxury Residential Advisory Platform</p>
        </div>
      )}
      {!printAll && (
      <div className="doc-header">
        <div className="doc-header-top">
          {onClose && (
            <button className="doc-close-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              Back to MVP
            </button>
          )}
          <button className="doc-export-btn" onClick={handleExportPdf} disabled={isExporting}>
            <FileDown size={16} className={isExporting ? 'spinning' : ''} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
        <h1 className="doc-title">Documentation</h1>
        <p className="doc-subtitle">N4S MVP — Master Validation Program Guide</p>

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

// Comprehensive CSS
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

.doc-subsection-title--error {
  color: ${COLORS.error};
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

.doc-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-feature {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-feature-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: ${COLORS.navy};
  line-height: 1;
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
}

.doc-tiers {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.doc-tier {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  background-color: ${COLORS.surface};
  border-radius: 6px;
}

.doc-tier-label {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${COLORS.navy};
}

.doc-tier-range {
  display: block;
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
}

/* Workflow Phase Cards */
.doc-phase {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 5rem;
}

.doc-phase-badge {
  position: absolute;
  left: 1rem;
  top: 1.25rem;
  padding: 0.25rem 0.5rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.doc-phase-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
}

.doc-phase-content {
  font-size: 0.9375rem;
  color: ${COLORS.text};
}

.doc-phase-content p {
  margin: 0 0 0.75rem 0;
}

.doc-checklist {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem 0;
}

.doc-checklist li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${COLORS.text};
}

.doc-checklist li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: ${COLORS.navy};
}

.doc-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 0.8125rem;
  color: #1565c0;
}

.doc-example {
  padding: 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
  font-size: 0.875rem;
}

.doc-example strong {
  color: ${COLORS.navy};
}

.doc-example p {
  margin: 0.5rem 0 0 0;
  color: ${COLORS.textMuted};
}

.doc-prereq-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doc-prereq {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.doc-prereq-module {
  padding: 0.25rem 0.5rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.doc-prereq-items {
  font-size: 0.875rem;
  color: ${COLORS.text};
}

.doc-validation-checks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.doc-check {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-check-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.doc-check-icon.success { color: ${COLORS.success}; }
.doc-check-icon.warning { color: ${COLORS.warning}; }
.doc-check-icon.error { color: ${COLORS.error}; }

.doc-check strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.125rem;
}

.doc-check p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

.doc-outcomes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doc-outcome {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
  font-size: 0.875rem;
}

.doc-outcome--success {
  background-color: #e8f5e9;
}

.doc-outcome-if {
  color: ${COLORS.textMuted};
  min-width: 160px;
}

.doc-outcome-then {
  color: ${COLORS.text};
}

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
  background-color: ${COLORS.border};
  border: 2px solid ${COLORS.surface};
}

.doc-timeline-item--active::before {
  background-color: ${COLORS.navy};
}

.doc-timeline-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${COLORS.textMuted};
  margin-bottom: 0.25rem;
}

.doc-timeline-item--active .doc-timeline-badge {
  background-color: ${COLORS.navy};
  color: #fff;
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

/* Gates Tab */
.doc-gate-criteria {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-criterion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text};
}

.doc-redflag {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-redflag:last-child {
  border-bottom: none;
}

.doc-redflag-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.error};
  color: #fff;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.doc-redflag-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.75rem 0;
}

.doc-redflag-what,
.doc-redflag-why,
.doc-redflag-how {
  font-size: 0.875rem;
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.doc-redflag-what strong,
.doc-redflag-why strong,
.doc-redflag-how strong {
  color: ${COLORS.textMuted};
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

.doc-bridge {
  font-size: 0.9375rem;
}

.doc-bridge-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.doc-bridge-trigger {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
}

.doc-bridge-impact {
  padding: 0.125rem 0.5rem;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.doc-bridge p {
  margin: 0 0 0.75rem 0;
  color: ${COLORS.text};
  line-height: 1.5;
}

.doc-bridge-benefit {
  padding: 0.75rem;
  background-color: #e8f5e9;
  border-radius: 4px;
  font-size: 0.8125rem;
  margin-bottom: 0;
}

.doc-module-scores {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doc-module-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-module-icon {
  color: ${COLORS.navy};
  flex-shrink: 0;
}

.doc-module-info {
  flex: 1;
}

.doc-module-info strong {
  display: block;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin-bottom: 0.125rem;
}

.doc-module-info p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

.doc-module-target {
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.success};
}

/* Reference Tab */
.doc-relationship {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-relationship:last-child {
  border-bottom: none;
}

.doc-relationship-badge {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.doc-rel-a { background-color: #4caf50; }
.doc-rel-n { background-color: #2196f3; }
.doc-rel-b { background-color: #ff9800; }
.doc-rel-s { background-color: #f44336; }

.doc-relationship-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.25rem 0;
}

.doc-relationship-content > p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0 0 0.75rem 0;
}

.doc-relationship-examples {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doc-use-for,
.doc-avoid-for {
  font-size: 0.8125rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.doc-use-for {
  background-color: #e8f5e9;
  color: ${COLORS.success};
}

.doc-avoid-for {
  background-color: #ffebee;
  color: ${COLORS.error};
}

.doc-acoustic-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-acoustic-zone {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-acoustic-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #fff;
  height: fit-content;
}

.zone-0 { background-color: #1e3a5f; }
.zone-1 { background-color: #2e7d32; }
.zone-2 { background-color: #f57c00; }
.zone-3 { background-color: #d32f2f; }

.doc-acoustic-content strong {
  display: block;
  font-size: 0.9375rem;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-acoustic-content p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0 0 0.5rem 0;
}

.doc-acoustic-rule {
  font-size: 0.75rem;
  color: ${COLORS.navy};
  font-weight: 500;
}

.doc-codes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.doc-code-section h5 {
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.doc-code-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.doc-code-list span {
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

.doc-code-list code {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  background-color: ${COLORS.background};
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: ${COLORS.navy};
  margin-right: 0.5rem;
}

.doc-checklist-detailed {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.doc-prereq-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 6px;
}

.doc-prereq-item input[type="checkbox"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.doc-prereq-item strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-prereq-item p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
}

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

@media (max-width: 768px) {
  .doc-grid-2 {
    grid-template-columns: 1fr;
  }
  
  .doc-tiers {
    flex-wrap: wrap;
  }
  
  .doc-tier {
    flex: 1 1 45%;
  }
  
  .doc-gate-criteria {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .doc-acoustic-grid {
    grid-template-columns: 1fr;
  }
  
  .doc-codes-grid {
    grid-template-columns: 1fr;
  }
  
  .doc-phase {
    padding-left: 1.5rem;
  }
  
  .doc-phase-badge {
    position: static;
    display: inline-block;
    margin-bottom: 0.5rem;
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
