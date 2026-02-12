/**
 * VMXDocumentation.jsx
 *
 * In-app documentation for the VMX (Vision Matrix) module.
 * Covers both Lite and Pro modes in detail.
 *
 * Follows N4S standard documentation pattern (KYC, FYI, KYM style).
 *
 * Tabs:
 * - Overview: What VMX does, 7-category model, tiers, Lite vs Pro
 * - Workflow: Step-by-step for Lite then Pro
 * - Gates: Guardrails, multipliers, watchouts, delta thresholds
 * - Reference: Glossary, category/tier/location/typology definitions
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
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

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">What is VMX?</h2>
        <p className="doc-paragraph">
          The VMX (Vision Matrix) module is the N4S platform's cost analysis engine.
          It translates your project's spatial program, quality tier, location, and
          site conditions into a structured budget trajectory using a 7-category
          elemental cost model based on ASTM UniFormat II.
        </p>
        <p className="doc-paragraph">
          VMX provides two viewing modes: <strong>Lite</strong> for a streamlined
          client-facing summary, and <strong>Pro</strong> for full matrix control,
          benchmark editing, and detailed cost engineering. Both modes draw from the
          same underlying engine and produce consistent results.
        </p>
      </div>

      <ExpandableSection title="The 7-Category Cost Model" defaultOpen={true}>
        <p className="doc-paragraph">
          VMX breaks construction costs into seven elemental categories. Each category
          has three benchmark bands (Low / Medium / High) expressed in dollars per
          square foot ($/SF). The categories are:
        </p>

        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>#</div>
            <div>Category</div>
            <div>What it Covers</div>
          </div>
          <div className="doc-ref-row">
            <div>1</div>
            <div><strong>Site Prep & Infrastructure</strong></div>
            <div>Demolition, earthworks, utilities, site access, temporary works</div>
          </div>
          <div className="doc-ref-row">
            <div>2</div>
            <div><strong>Substructure</strong></div>
            <div>Foundations, basement construction, retaining walls, waterproofing</div>
          </div>
          <div className="doc-ref-row">
            <div>3</div>
            <div><strong>Shell</strong></div>
            <div>Structural frame, exterior envelope, roofing, windows, exterior doors</div>
          </div>
          <div className="doc-ref-row">
            <div>4</div>
            <div><strong>Interiors</strong></div>
            <div>Interior finishes, millwork, flooring, wall treatments, ceilings, doors</div>
          </div>
          <div className="doc-ref-row">
            <div>5</div>
            <div><strong>Equipment & Furnishings</strong></div>
            <div>FF&E, appliances, built-in equipment, audio/visual, specialty items</div>
          </div>
          <div className="doc-ref-row">
            <div>6</div>
            <div><strong>Services (MEP)</strong></div>
            <div>Mechanical, electrical, plumbing, fire protection, controls, low voltage</div>
          </div>
          <div className="doc-ref-row">
            <div>7</div>
            <div><strong>Exterior Improvements</strong></div>
            <div>Landscaping, pools, hardscape, exterior lighting, fencing, outbuildings</div>
          </div>
        </div>

        <p className="doc-paragraph" style={{ marginTop: '1rem' }}>
          Each category's $/SF value is driven by the selected <strong>quality tier</strong>,
          adjusted by <strong>location</strong> and <strong>site typology</strong> multipliers,
          and optionally influenced by <strong>program bias</strong> from the FYI module's
          zone allocation.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Quality Tiers">
        <p className="doc-paragraph">
          VMX uses four quality tiers that define the benchmark price points for each
          cost category. Tiers are typically set in KYC (P1.A.4 Interior Quality Tier)
          and flow into VMX automatically.
        </p>

        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Tier</div>
            <div>KYC Mapping</div>
            <div>Character</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Select</strong></div>
            <div>Standard</div>
            <div>High-quality residential — well-appointed but cost-conscious</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Reserve</strong></div>
            <div>Premium</div>
            <div>Elevated luxury — curated materials, considered detailing</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Signature</strong></div>
            <div>Luxury</div>
            <div>Bespoke luxury — custom everything, artisan-level finishes</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Legacy</strong></div>
            <div>Ultra</div>
            <div>Generational estate — museum-grade materials, no compromise</div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Lite Mode vs Pro Mode">
        <div className="doc-dual-score">
          <div className="doc-score-box doc-score-box--client">
            <h4>Lite Mode</h4>
            <p className="doc-score-question">
              "Give me the bottom line and the key risks."
            </p>
            <ul className="doc-score-list">
              <li>KPI summary cards (Direct Hard, Contract, Soft, Grand Total)</li>
              <li>Category allocation table</li>
              <li>Key cost drivers (typology + location impact)</li>
              <li>Budget watchouts (over/under allocation risks)</li>
              <li>Compare Mode for side-by-side scenarios</li>
              <li>PDF and Client Pack export</li>
            </ul>
            <p className="doc-score-source">
              <strong>Best for:</strong> Client presentations, stakeholder reviews, early feasibility
            </p>
          </div>

          <div className="doc-score-box doc-score-box--market">
            <h4>Pro Mode</h4>
            <p className="doc-score-question">
              "I need full control over every assumption."
            </p>
            <ul className="doc-score-list">
              <li>Interactive cost matrix (7 categories × 3 bands)</li>
              <li>Interior Tier Override (mix tier levels)</li>
              <li>Delta Heat analysis (B − A comparisons)</li>
              <li>Construction Indirects (GC fee, conditions, contingency)</li>
              <li>Soft Costs & Cashflow (owner-side costs + escalation)</li>
              <li>Benchmark Admin (edit $/SF values per region/tier)</li>
              <li>Guardrails & Provenance configuration</li>
              <li>Key Drivers with baseline controls</li>
              <li>Grand Total Project Cost roll-up</li>
            </ul>
            <p className="doc-score-source">
              <strong>Best for:</strong> Advisors, cost consultants, budget calibration sessions
            </p>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="N4S Integration — Where VMX Gets Its Data">
        <p className="doc-paragraph">
          VMX is deeply integrated with other N4S modules. Several fields are
          auto-populated and locked (marked "from KYC") to maintain data integrity
          across the platform.
        </p>
        <p className="doc-paragraph">
          VMX receives data from KYC and FYI through three mechanisms:
        </p>
        <p className="doc-paragraph">
          <strong>Always Synced (read-only):</strong> Client name, project name, quality tier lock status, and KYC budget constraints update in real-time whenever KYC data changes.
        </p>
        <p className="doc-paragraph">
          <strong>Seed Once:</strong> Scenario values like target area, location preset, and typology are populated from KYC/FYI when VMX first loads for a project. After initial seeding, these values become independently editable by the advisor without being overwritten by KYC changes.
        </p>
        <p className="doc-paragraph">
          <strong>Editable:</strong> All scenario parameters (cost bands, multipliers, overrides) are fully advisor-controlled and never overwritten by upstream modules.
        </p>

        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>VMX Field</div>
            <div>Source Module</div>
            <div>Behavior</div>
          </div>
          <div className="doc-ref-row">
            <div>Client Name</div>
            <div>KYC (Portfolio Context)</div>
            <div>Always Synced — display only</div>
          </div>
          <div className="doc-ref-row">
            <div>Project Name</div>
            <div>KYC (Project Parameters)</div>
            <div>Always Synced — display only</div>
          </div>
          <div className="doc-ref-row">
            <div>Target Area (SF)</div>
            <div>KYC targetGSF → FYI targetSF fallback</div>
            <div>Seed Once — editable after initial load</div>
          </div>
          <div className="doc-ref-row">
            <div>Quality Tier</div>
            <div>KYC (P1.A.4 Interior Quality Tier)</div>
            <div>Always Synced — locked when set in KYC</div>
          </div>
          <div className="doc-ref-row">
            <div>Location Preset</div>
            <div>KYC (Property Location)</div>
            <div>Seed Once — advisor can change after load</div>
          </div>
          <div className="doc-ref-row">
            <div>Site Typology</div>
            <div>KYS (Selected Site)</div>
            <div>Seed Once — advisor can change after load</div>
          </div>
          <div className="doc-ref-row">
            <div>Land Cost</div>
            <div>KYC → KYS fallback</div>
            <div>Always Synced from KYC</div>
          </div>
          <div className="doc-ref-row">
            <div>Program Bias</div>
            <div>FYI (Zone SF totals)</div>
            <div>Always Synced — auto-calculated from FYI zones</div>
          </div>
          <div className="doc-ref-row">
            <div>Budget Framework</div>
            <div>KYC (P1.A.4)</div>
            <div>Always Synced — read-only reference panel</div>
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
        <h2 className="doc-section-title">VMX Workflow</h2>
        <p className="doc-paragraph">
          VMX is organized into two progressive modes. Start with Lite for a quick
          budget trajectory, then switch to Pro when you need full control over
          assumptions and benchmark data.
        </p>
      </div>

      {/* ===== LITE MODE ===== */}
      <div className="doc-card">
        <h2 className="doc-section-title" style={{ color: COLORS.navy }}>
          Lite Mode — Client Dashboard
        </h2>
        <p className="doc-paragraph">
          Lite mode presents a read-friendly summary of the project's cost trajectory.
          All calculations happen automatically based on the project context flowing
          from KYC, FYI, and KYS.
        </p>
      </div>

      <ExpandableSection title="Step 1 — Review Project Context" defaultOpen={true}>
        <p className="doc-paragraph">
          The top card displays the auto-populated project context: Client Name,
          Project Name, Target Area, and Quality Tier. Fields marked "(from KYC)"
          are locked and cannot be edited in VMX — they must be changed at their
          source module.
        </p>
        <p className="doc-paragraph">
          Below the identity fields, set the <strong>Scenario A</strong> parameters:
          Benchmark Set (US or ME), Location (preset or custom multiplier), Site
          Typology, and Land Acquisition Cost. Toggle <strong>Compare Mode</strong> to
          enable a second scenario (Scenario B) with independent parameters.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 2 — KYC Budget Framework Reference">
        <p className="doc-paragraph">
          If KYC has budget data (P1.A.4), a gold-accented reference card appears
          showing the client's stated Total Project Budget, Interior Budget, Budget
          Flexibility, and derived $/SF tier indicator. This is read-only context
          to help advisors calibrate VMX scenarios against client expectations.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 3 — Read the KPI Summary">
        <p className="doc-paragraph">
          Each scenario card displays six key performance indicators:
        </p>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>KPI</div>
            <div>What it Shows</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Direct Hard Costs</strong></div>
            <div>Sum of all 7 categories × area (sticks and bricks)</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Construction Contract</strong></div>
            <div>Direct Hard + Construction Indirects (GC fee, conditions, contingency)</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Owner Soft + Escalation</strong></div>
            <div>Architecture, design, permits, project management + escalation</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Land Acquisition</strong></div>
            <div>Land cost from KYC or KYS</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>All-in Grand Total</strong></div>
            <div>Contract + Soft + Escalation + Land</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>All-in $/SF</strong></div>
            <div>Grand Total ÷ Target Area — the all-in per-square-foot cost</div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Step 4 — Allocation Snapshot">
        <p className="doc-paragraph">
          Below the KPIs, a table breaks down the Direct Hard Costs across all 7
          categories showing absolute cost and percentage of total. This reveals the
          cost distribution — for example, whether Interiors dominate (typical in
          luxury) or whether Site Prep is unusually high (common in hillside sites).
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 5 — Key Cost Drivers">
        <p className="doc-paragraph">
          Two driver analyses compare your scenario against baselines:
        </p>
        <p className="doc-paragraph">
          <strong>Typology Impact</strong> shows how your site type (e.g., Hillside)
          changes costs vs the Suburban baseline. Only categories with ≥ 5% movement
          are shown.
        </p>
        <p className="doc-paragraph">
          <strong>Location Impact</strong> shows how your location multiplier (e.g.,
          Florida at 1.18×) changes costs vs the National Average baseline. High-cost
          locations apply damping to Interiors and FF&E to reflect the fact that
          premium finishes have less geographic variance.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 6 — Budget Watchouts">
        <p className="doc-paragraph">
          Watchouts flag categories where the allocation percentage falls outside
          the target range for the selected tier. For example, if Interiors is
          consuming 42% of costs but the tier norm caps at 38%, a watchout alerts
          the advisor. Up to 3 watchouts are shown, ranked by severity.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 7 — Compare Mode (Optional)">
        <p className="doc-paragraph">
          Toggle Compare Mode to add Scenario B with independent region, location,
          typology, and land cost. In Lite mode, both scenarios appear side-by-side
          as cards. A "Key Differences" table shows category-level deltas (B − A).
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 8 — Export">
        <p className="doc-paragraph">
          <strong>Export PDF Report</strong> generates a print-optimized report
          (via browser print dialog) with a branded header, all scenario data, and
          provenance metadata.
        </p>
        <p className="doc-paragraph">
          <strong>Export Client Pack (.zip)</strong> bundles a CSV of deltas, scenario
          summaries, and metadata into a downloadable archive for offline distribution.
        </p>
      </ExpandableSection>

      {/* ===== PRO MODE ===== */}
      <div className="doc-card" style={{ marginTop: '1.5rem' }}>
        <h2 className="doc-section-title" style={{ color: '#8a7020' }}>
          Pro Mode — Full Matrix Control
        </h2>
        <p className="doc-paragraph">
          Pro mode adds the interactive cost matrix, benchmark editing tools,
          construction indirects, soft costs, and advanced comparison analytics.
          Everything from Lite mode remains visible — Pro adds layers on top.
        </p>
      </div>

      <ExpandableSection title="Step 1 — Pro Controls Card">
        <p className="doc-paragraph">
          The Pro Controls card provides two key settings:
        </p>
        <p className="doc-paragraph">
          <strong>Benchmark Editor Target</strong> — In Compare Mode, choose whether
          the Benchmark Admin below edits Scenario A's or B's benchmark data.
        </p>
        <p className="doc-paragraph">
          <strong>Interiors + FF&E Package (4-Tier Override)</strong> — Override the
          tier used for Categories 4 (Interiors) and 5 (Equipment & Furnishings)
          independently of the overall tier. For example, set the structure to
          Reserve but the interiors to Signature. When set to "Match overall Tier",
          all categories use the same benchmark tier.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 2 — The Cost Matrix">
        <p className="doc-paragraph">
          The matrix displays all 7 categories with their benchmark $/SF values
          across three bands: <strong>Low</strong>, <strong>Medium</strong>, and
          <strong>High</strong>. Click a band cell to select it for each category.
          The selected band determines the $/SF used in the cost calculation.
        </p>
        <p className="doc-paragraph">
          The matrix shows real-time totals: per-category cost, percentage of total,
          and a running grand total at the bottom. Target range indicators highlight
          when a category's allocation percentage falls outside norms.
        </p>
        <p className="doc-paragraph">
          In Compare Mode, two matrices appear side-by-side (Scenario A and B),
          each with independent band selections.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 3 — Delta Heat Analysis (Compare Mode)">
        <p className="doc-paragraph">
          When Compare Mode is active, the <strong>Delta Heat</strong> panel shows
          a detailed comparison of B − A across all categories.
        </p>
        <p className="doc-paragraph">
          Each category row shows: direction (Increase / Decrease / Flat), delta
          cost, delta as percentage of total, impact bar, and heat level
          (Low / Medium / High). Heat thresholds and driver rules are configurable
          in the Guardrails panel.
        </p>
        <p className="doc-paragraph">
          Summary cards at the top show total delta, A total, and B total, plus
          the largest increases and decreases across categories.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 4 — Advisory Readout (Compare Mode)">
        <p className="doc-paragraph">
          Below the Delta Heat, the Advisory Readout provides a narrative summary
          of Scenario A vs B differences, highlighting which categories drive the
          most significant cost deltas and their implications for the project.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 5 — Benchmark Library Admin">
        <p className="doc-paragraph">
          The Benchmark Library Admin allows authorized users to edit the $/SF
          values and target allocation ranges for each category, band, region,
          and tier combination. This is where benchmark calibration happens.
        </p>
        <p className="doc-paragraph">
          Changes to benchmarks are stored in the project data and affect all
          calculations immediately. A "Reset to Demo" button reverts any region/tier
          combination to its factory defaults.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 6 — Guardrails & Provenance">
        <p className="doc-paragraph">
          The Guardrails panel configures:
        </p>
        <p className="doc-paragraph">
          <strong>Dataset Provenance</strong> — Name, last-updated date, and
          assumptions text that appear in reports and exports. Auto-stamp updates
          the date whenever benchmarks change.
        </p>
        <p className="doc-paragraph">
          <strong>Delta Heat Thresholds</strong> — The percentage thresholds that
          define Medium and High heat levels in the delta analysis.
        </p>
        <p className="doc-paragraph">
          <strong>Driver Rules</strong> — Choose between "Top N" (flag the top N
          categories by impact) or "Percentage" (flag categories exceeding a
          threshold percentage).
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 7 — Construction Indirects">
        <p className="doc-paragraph">
          The Construction Indirects panel calculates the gap between Direct Hard
          Costs and the Construction Contract. Four line items are computed as
          percentages of the cost base:
        </p>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Line Item</div>
            <div>Description</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>General Conditions</strong></div>
            <div>Site staff, temporary works, site logistics</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>GL Insurance</strong></div>
            <div>General Contractor's liability insurance (pass-through)</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Construction Contingency</strong></div>
            <div>Hard contingency for unforeseen conditions</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>GC Fee (O&P)</strong></div>
            <div>Contractor overhead & profit — applied to Cost of Work</div>
          </div>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
          Rates default to tier-appropriate values and are adjusted by site typology
          (e.g., Waterfront doubles GL Insurance, Urban increases General Conditions).
          All rates are editable.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 8 — Soft Costs & Cashflow">
        <p className="doc-paragraph">
          Owner-side soft costs are calculated as percentages of the hard cost base.
          Default line items include Architect Fee, Interior Design Fee, Landscape
          Design Fee, Permits & Entitlements, Project Management, Legal & Accounting,
          and Owner's Contingency.
        </p>
        <p className="doc-paragraph">
          <strong>Escalation</strong> is applied based on project duration and an
          annual rate (default 6%). The escalation scope can be set to hard costs
          only or hard + soft.
        </p>
        <p className="doc-paragraph">
          <strong>Cashflow Schedule</strong> distributes the total project cost
          across the construction duration using configurable year-by-year draw
          weights, producing a cumulative spend curve.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 9 — Key Drivers (Location & Typology)">
        <p className="doc-paragraph">
          The Key Drivers panel isolates the cost impact of location and typology
          choices by comparing each scenario against configurable baselines. Both
          a Baseline Location and a Baseline Typology can be set independently.
        </p>
        <p className="doc-paragraph">
          For each scenario, two driver analyses are shown: <strong>Typology Impact</strong>
          (same location, different site type) and <strong>Location Impact</strong>
          (same typology, different location). Only categories with ≥ 5% movement
          are listed.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Step 10 — Grand Total Project Cost">
        <p className="doc-paragraph">
          The Grand Total table rolls up all cost components into a single summary:
        </p>
        <p className="doc-paragraph">
          Direct Hard Costs (7 categories) + Construction Indirects +
          Land Acquisition + Soft Costs + Escalation = <strong>Grand Total
          (All-in Project Cost)</strong>.
        </p>
        <p className="doc-paragraph">
          In Compare Mode, both scenarios appear with a delta column. This is the
          definitive "all-in" number for the project.
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
        <h2 className="doc-section-title">Guardrails & Validation Logic</h2>
        <p className="doc-paragraph">
          VMX uses a layered system of multipliers, guardrails, and validation
          rules to ensure cost estimates remain realistic and internally consistent.
        </p>
      </div>

      <ExpandableSection title="Location Multiplier Logic" defaultOpen={true}>
        <p className="doc-paragraph">
          Location presets apply a global multiplier to all 7 categories. However,
          for high-cost locations (factor &gt; 1.10), VMX applies <strong>damping</strong>
          to Categories 4 (Interiors) and 5 (FF&E).
        </p>
        <p className="doc-paragraph">
          <strong>Damping Formula:</strong> For Interiors and FF&E when the global
          factor exceeds 1.10, the applied factor is:
        </p>
        <div className="doc-formula">
          <code>damped = 1 + ((globalFactor − 1) × 0.5)</code>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
          <strong>Rationale:</strong> Premium interior finishes and furnishings are
          sourced from global markets and have less geographic price variance than
          labor-intensive site work. A $200/SF Italian marble slab costs roughly the
          same in Miami and Denver — the labor to install it varies, but not as
          dramatically as foundation work on a hillside.
        </p>

        <div className="doc-ref-table" style={{ marginTop: '1rem' }}>
          <div className="doc-ref-row doc-ref-row--header">
            <div>Location</div>
            <div>Global Factor</div>
            <div>Cat 4/5 Factor (Damped)</div>
          </div>
          <div className="doc-ref-row">
            <div>National Average</div>
            <div>1.00×</div>
            <div>1.00× (no damping)</div>
          </div>
          <div className="doc-ref-row">
            <div>Florida</div>
            <div>1.18×</div>
            <div>1.09×</div>
          </div>
          <div className="doc-ref-row">
            <div>Colorado (Aspen/Vail)</div>
            <div>1.50×</div>
            <div>1.25×</div>
          </div>
          <div className="doc-ref-row">
            <div>New York (NYC/Hamptons)</div>
            <div>1.42×</div>
            <div>1.21×</div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Typology Category Factors">
        <p className="doc-paragraph">
          Unlike location (which applies broadly), typology modifiers are
          <strong> category-targeted</strong>. Each site type adjusts specific
          categories that are most affected by that site condition.
        </p>

        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Typology</div>
            <div>Categories Affected</div>
            <div>Key Impact</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Suburban</strong></div>
            <div>None (baseline)</div>
            <div>All factors = 1.0×</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Hillside</strong></div>
            <div>Site Prep ×1.30, Substructure ×1.75, Shell ×1.15, Exterior ×1.50</div>
            <div>Deep foundations, retaining walls, difficult access</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Waterfront</strong></div>
            <div>Site Prep ×1.20, Substructure ×1.40, Shell ×1.10, Exterior ×1.25</div>
            <div>Marine conditions, flood protection, corrosion resistance</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Urban</strong></div>
            <div>Site Prep ×1.25, Exterior ×0.50</div>
            <div>Tight site logistics, less exterior scope</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Rural</strong></div>
            <div>Site Prep ×1.75, Exterior ×1.10</div>
            <div>Infrastructure bring-in, long haul distances</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Desert</strong></div>
            <div>Site Prep ×1.10, Shell ×1.10, Services ×1.15, Exterior ×1.20</div>
            <div>Thermal envelope, cooling demand, water management</div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Typology × Construction Indirects">
        <p className="doc-paragraph">
          Site typology also adjusts Construction Indirect rates:
        </p>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Typology</div>
            <div>General Conditions Factor</div>
            <div>GL Insurance Factor</div>
          </div>
          <div className="doc-ref-row">
            <div>Suburban</div>
            <div>1.00×</div>
            <div>1.00×</div>
          </div>
          <div className="doc-ref-row">
            <div>Hillside</div>
            <div>1.20×</div>
            <div>1.00×</div>
          </div>
          <div className="doc-ref-row">
            <div>Waterfront</div>
            <div>1.10×</div>
            <div>2.00× (marine risk)</div>
          </div>
          <div className="doc-ref-row">
            <div>Urban</div>
            <div>1.40×</div>
            <div>1.00×</div>
          </div>
          <div className="doc-ref-row">
            <div>Rural</div>
            <div>1.15×</div>
            <div>1.00×</div>
          </div>
          <div className="doc-ref-row">
            <div>Desert</div>
            <div>1.05×</div>
            <div>1.00×</div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Program Bias (FYI Zone Weighting)">
        <p className="doc-paragraph">
          When FYI has a completed space program, VMX automatically calculates
          program bias to adjust categories that are sensitive to the program mix.
        </p>
        <p className="doc-paragraph">
          <strong>Interiors + FF&E Boost:</strong> When front-of-house zones
          (Arrival/Public + Entertainment) exceed 26% of the total program,
          Categories 4 and 5 are boosted up to +12%. FOH-heavy programs imply
          more guest-facing finish intensity.
        </p>
        <p className="doc-paragraph">
          <strong>Services (MEP) Boost:</strong> When MEP-driver zones
          (Entertainment + Wellness + Outdoor) exceed 18% of the total,
          Category 6 is boosted up to +12%. These zones demand higher
          mechanical/electrical loads.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Budget Watchout Rules">
        <p className="doc-paragraph">
          Each category has a target allocation range (min% to max% of Direct Hard
          Costs) defined in the benchmark data. When a category's actual percentage
          falls outside its range, a watchout is triggered:
        </p>
        <p className="doc-paragraph">
          <strong>Under:</strong> Category allocation is below the minimum target —
          may indicate under-investment in that area.
        </p>
        <p className="doc-paragraph">
          <strong>Over:</strong> Category allocation exceeds the maximum target —
          may indicate cost concentration risk.
        </p>
        <p className="doc-paragraph">
          The top 3 watchouts by severity are shown in Lite mode. Pro mode provides
          range indicators directly in the matrix.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Delta Heat Thresholds">
        <p className="doc-paragraph">
          In Compare Mode, each category's delta is classified by heat level based
          on its absolute cost delta as a fraction of Scenario A's total:
        </p>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Heat Level</div>
            <div>Default Threshold</div>
            <div>Meaning</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Low</strong></div>
            <div>&lt; 1.5%</div>
            <div>Negligible difference — noise level</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>Medium</strong></div>
            <div>≥ 1.5%</div>
            <div>Material difference — worth discussing</div>
          </div>
          <div className="doc-ref-row">
            <div><strong>High</strong></div>
            <div>≥ 3.0%</div>
            <div>Significant driver — requires attention</div>
          </div>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
          Thresholds are configurable in the Guardrails panel. Drivers are
          determined by either "Top N" (default: top 3 by |Δ Cost|) or
          "Percentage" (categories exceeding a configurable threshold).
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
        <h2 className="doc-section-title">VMX Reference</h2>
        <p className="doc-paragraph">
          Quick-reference tables and glossary for VMX terminology, data structures,
          and default configuration values.
        </p>
      </div>

      <ExpandableSection title="Glossary" defaultOpen={true}>
        <dl className="doc-glossary">
          <dt>Direct Hard Costs</dt>
          <dd>The sum of all 7 elemental cost categories — the "sticks and bricks" construction cost before any contractor markups, soft costs, or escalation.</dd>

          <dt>Construction Indirects</dt>
          <dd>Contractor overhead layered on top of Direct Hard Costs: General Conditions, GL Insurance, Construction Contingency, and GC Fee (O&P). Together with Direct Hard Costs, these form the Construction Contract value.</dd>

          <dt>Soft Costs</dt>
          <dd>Owner-side professional fees and expenses: architect, interior designer, landscape architect, permits, project management, legal, and owner's contingency.</dd>

          <dt>Escalation</dt>
          <dd>Cost inflation applied over the construction duration. Default is 6% annually, compounded over the project timeline.</dd>

          <dt>Grand Total</dt>
          <dd>The all-in project cost: Direct Hard + Indirects + Land + Soft Costs + Escalation.</dd>

          <dt>Heat Band (LOW / MEDIUM / HIGH)</dt>
          <dd>The three benchmark tiers for each cost category. LOW represents a conservative/efficient approach, MEDIUM is the recommended baseline, HIGH represents premium scope or difficult conditions.</dd>

          <dt>Target Range</dt>
          <dd>The expected allocation percentage range (min–max) for each category as a proportion of total Direct Hard Costs. Used to flag budget watchouts.</dd>

          <dt>Location Factor</dt>
          <dd>A multiplier applied to benchmark $/SF values to account for geographic cost variation. Preset values range from 1.00× (National Average) to 1.50× (Aspen/Vail).</dd>

          <dt>Damping</dt>
          <dd>The reduced location factor applied to Interiors (Cat 4) and FF&E (Cat 5) in high-cost locations. Reflects the lower geographic variance of premium materials.</dd>

          <dt>Typology</dt>
          <dd>Site condition classification (Suburban, Hillside, Waterfront, Urban, Rural, Desert) that applies category-targeted cost adjustments.</dd>

          <dt>Program Bias</dt>
          <dd>Automatic cost adjustment derived from FYI zone allocations. FOH-heavy programs boost Interiors/FF&E; MEP-driver zones boost Services.</dd>

          <dt>Delta Heat</dt>
          <dd>Compare Mode analysis showing the magnitude of cost differences between Scenario A and B, classified by impact level.</dd>

          <dt>Interior Tier Override</dt>
          <dd>Pro mode feature allowing Interiors (Cat 4) and FF&E (Cat 5) to use a different quality tier than the remaining categories. Useful when the client wants a Reserve structure but Signature finishes.</dd>

          <dt>Benchmark Set</dt>
          <dd>A region-specific collection of $/SF values for all 7 categories × 3 bands × 4 tiers. Currently available: US and ME (Middle East).</dd>

          <dt>Provenance</dt>
          <dd>Metadata describing the benchmark dataset — name, last updated date, and assumptions text. Appears in reports and exports for audit trail purposes.</dd>

          <dt>Snapshot Panel</dt>
          <dd>Pro mode tool to capture and compare point-in-time snapshots of Scenario A results, enabling before/after analysis during calibration sessions.</dd>

          <dt>Cost of Work</dt>
          <dd>In Construction Indirects, this is the subtotal used as the base for GC Fee calculation: Direct Hard + General Conditions + GL Insurance + Contingency.</dd>
        </dl>
      </ExpandableSection>

      <ExpandableSection title="Location Presets">
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Preset ID</div>
            <div>Label</div>
            <div>Factor</div>
          </div>
          <div className="doc-ref-row">
            <div>national</div>
            <div>National Average</div>
            <div>1.00×</div>
          </div>
          <div className="doc-ref-row">
            <div>florida</div>
            <div>Florida (Miami / Palm Beach)</div>
            <div>1.18×</div>
          </div>
          <div className="doc-ref-row">
            <div>co_denver</div>
            <div>Colorado (Denver)</div>
            <div>1.10×</div>
          </div>
          <div className="doc-ref-row">
            <div>co_aspen</div>
            <div>Colorado (Aspen / Vail)</div>
            <div>1.50×</div>
          </div>
          <div className="doc-ref-row">
            <div>ca_la</div>
            <div>California (LA / OC)</div>
            <div>1.30×</div>
          </div>
          <div className="doc-ref-row">
            <div>ny_hamptons</div>
            <div>New York (NYC / Hamptons)</div>
            <div>1.42×</div>
          </div>
          <div className="doc-ref-row">
            <div>custom</div>
            <div>Custom…</div>
            <div>User-defined</div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Default Construction Indirect Rates by Tier">
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Line Item</div>
            <div>Select</div>
            <div>Reserve</div>
            <div>Signature</div>
            <div>Legacy</div>
          </div>
          <div className="doc-ref-row">
            <div>General Conditions</div>
            <div>6%</div>
            <div>8%</div>
            <div>10%</div>
            <div>12%</div>
          </div>
          <div className="doc-ref-row">
            <div>GL Insurance</div>
            <div>1.0%</div>
            <div>1.0%</div>
            <div>1.25%</div>
            <div>1.5%</div>
          </div>
          <div className="doc-ref-row">
            <div>Contingency</div>
            <div>5%</div>
            <div>5%</div>
            <div>8%</div>
            <div>10%</div>
          </div>
          <div className="doc-ref-row">
            <div>GC Fee (O&P)</div>
            <div>10%</div>
            <div>12%</div>
            <div>14%</div>
            <div>16%</div>
          </div>
          <div className="doc-ref-row">
            <div>Fee Base</div>
            <div colSpan="4">Cost of Work (recommended)</div>
          </div>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
          Note: GC Fee is applied to the Cost of Work subtotal (Direct Hard +
          General Conditions + GL Insurance + Contingency), not to Direct Hard
          Costs alone.
        </p>
      </ExpandableSection>

      <ExpandableSection title="Default Soft Cost Line Items">
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Line Item</div>
            <div>Basis</div>
            <div>Default Rate</div>
          </div>
          <div className="doc-ref-row">
            <div>Architect Fee (fee-only)</div>
            <div>Hard Costs</div>
            <div>6%</div>
          </div>
          <div className="doc-ref-row">
            <div>Interior Design Fee (fee-only)</div>
            <div>Hard Costs</div>
            <div>6%</div>
          </div>
          <div className="doc-ref-row">
            <div>Landscape Design Fee</div>
            <div>Hard Costs</div>
            <div>3%</div>
          </div>
          <div className="doc-ref-row">
            <div>Permits & Entitlements</div>
            <div>Hard Costs</div>
            <div>2%</div>
          </div>
          <div className="doc-ref-row">
            <div>Project Management / Owner's Rep</div>
            <div>Hard Costs</div>
            <div>4%</div>
          </div>
          <div className="doc-ref-row">
            <div>Legal & Accounting</div>
            <div>Hard Costs</div>
            <div>1%</div>
          </div>
          <div className="doc-ref-row">
            <div>Owner's Contingency</div>
            <div>Hard Costs</div>
            <div>5%</div>
          </div>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
          Default escalation: 6% annually over a 4-year project duration, applied
          to hard costs only (configurable to hard + soft).
        </p>
      </ExpandableSection>

      <ExpandableSection title="Benchmark Regions">
        <p className="doc-paragraph">
          VMX ships with two benchmark regions. Additional regions can be added
          via the Benchmark Library Admin in Pro mode.
        </p>
        <div className="doc-ref-table">
          <div className="doc-ref-row doc-ref-row--header">
            <div>Region ID</div>
            <div>Name</div>
            <div>Currency</div>
          </div>
          <div className="doc-ref-row">
            <div>us</div>
            <div>United States</div>
            <div>USD</div>
          </div>
          <div className="doc-ref-row">
            <div>me</div>
            <div>Middle East</div>
            <div>USD</div>
          </div>
        </div>
        <p className="doc-paragraph" style={{ marginTop: '0.75rem' }}>
          Middle East projects are auto-detected when the KYC project country is
          UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, or Oman.
        </p>
      </ExpandableSection>

      <ExpandableSection title="VMX Version & Provenance">
        <p className="doc-paragraph">
          The provenance bar at the bottom of the Pro view displays:
        </p>
        <p className="doc-paragraph">
          <strong>VMX Version</strong> — Engine version for tracking behavior changes.
        </p>
        <p className="doc-paragraph">
          <strong>Dataset Name</strong> — Identifies which benchmark dataset is active.
        </p>
        <p className="doc-paragraph">
          <strong>Last Updated</strong> — Timestamp of the last benchmark or guardrail
          change. Can be manually stamped or auto-stamped on benchmark edits.
        </p>
        <p className="doc-paragraph">
          <strong>Assumptions</strong> — Free-text field describing the basis and
          limitations of the dataset (appears in all exports).
        </p>
      </ExpandableSection>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function VMXDocumentation({ onClose, printAll }) {
  const [activeTab, setActiveTab] = useState('overview');

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
          <h1 className="doc-print-header__title">VMX (Vision Matrix) — Documentation</h1>
          <p className="doc-print-header__subtitle">N4S — Luxury Residential Advisory Platform</p>
        </div>
      )}
      {!printAll && (
      <div className="doc-header">
        <div className="doc-header-top">
          {onClose && (
            <button className="doc-close-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              Back to VMX
            </button>
          )}
        </div>
        <h1 className="doc-title">Documentation</h1>
        <p className="doc-subtitle">N4S VMX — Vision Matrix Guide</p>

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
          <>{printAll && <h2 className="doc-print-section-title">3. Gates & Validation</h2>}<GatesTab /></>
        )}
        {(printAll || activeTab === 'reference') && (
          <>{printAll && <h2 className="doc-print-section-title">4. Reference</h2>}<ReferenceTab /></>
        )}
      </div>

      <style>{vmxDocumentationStyles}</style>
    </div>
  );
}

// =============================================================================
// EMBEDDED STYLES (matches KYC/FYI/KYM pattern)
// =============================================================================

const vmxDocumentationStyles = `
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

/* Dual Score Display (Lite vs Pro) */
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

/* Formula Block */
.doc-formula {
  background-color: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  color: ${COLORS.navy};
  text-align: center;
}

/* Reference Tables */
.doc-ref-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-ref-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.8125rem;
  align-items: center;
}

.doc-ref-row:last-child {
  border-bottom: none;
}

.doc-ref-row--header {
  background-color: ${COLORS.navy};
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Tables with varying columns */
.doc-ref-table .doc-ref-row {
  grid-template-columns: auto;
}

/* 2-column tables */
.doc-ref-table:has(.doc-ref-row > :nth-child(2):last-child) .doc-ref-row {
  grid-template-columns: 1fr 1fr;
}

/* 3-column tables (default) */
.doc-ref-table:has(.doc-ref-row > :nth-child(3):last-child) .doc-ref-row {
  grid-template-columns: 80px 1fr 1fr;
}

/* 4-column tables */
.doc-ref-table:has(.doc-ref-row > :nth-child(4):last-child) .doc-ref-row {
  grid-template-columns: 140px repeat(3, 1fr);
}

/* 5-column tables */
.doc-ref-table:has(.doc-ref-row > :nth-child(5):last-child) .doc-ref-row {
  grid-template-columns: 140px repeat(4, 1fr);
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

/* Responsive */
@media (max-width: 768px) {
  .doc-dual-score {
    grid-template-columns: 1fr;
  }

  .doc-ref-row {
    grid-template-columns: 1fr !important;
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
