/**
 * FYIDocumentation
 * 
 * Documentation panel for the FYI (For Your Information) module.
 * Follows the N4S documentation template with 4 tabs:
 * - Overview: What FYI produces and how sizing works
 * - Workflow: Zone-by-zone process guide
 * - Gates: Size targets, tier thresholds, and balance requirements
 * - Reference: Zone definitions, space categories, size benchmarks
 * 
 * Client-facing language with progressive technical detail.
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Home,
  Users,
  Dumbbell,
  Briefcase,
  Car,
  TreePine,
  Info,
  Maximize2,
  Minimize2,
  Target
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
 * Expandable Section Component
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
 * Overview Tab Content
 */
function OverviewTab() {
  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">What is FYI?</h2>
        <p className="doc-paragraph">
          For Your Information (FYI) is your space programming module. It translates your lifestyle 
          requirements from KYC into a detailed room-by-room program with specific square footages. 
          This is the quantified foundation that your architect will use to begin schematic design.
        </p>
        <p className="doc-paragraph">
          Think of FYI as your home's bill of materials—except instead of lumber and steel, you're 
          specifying the spaces that will make up your daily life. Every room, closet, and terrace 
          is documented with its size, zone, and level assignment.
        </p>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">What FYI Produces</h3>
        <ul className="doc-list">
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Complete Space Program</strong>
              <p>Every room in your home with specific square footage allocation</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Zone Organization</strong>
              <p>Spaces grouped by function (Arrival, Family, Primary, Guest, etc.)</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Level Distribution</strong>
              <p>Assignment of each space to floors (Basement, Main, Upper)</p>
            </div>
          </li>
          <li>
            <CheckCircle size={16} className="doc-list-icon success" />
            <div>
              <strong>Target Validation</strong>
              <p>Real-time tracking against your target square footage</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="doc-card doc-card--highlight">
        <h3 className="doc-subsection-title">S/M/L Sizing System</h3>
        <p className="doc-paragraph">
          Instead of asking you to guess square footages, FYI uses a simple Small / Medium / Large 
          system. Each size represents a tier-appropriate allocation based on your project scope.
        </p>
        <div className="doc-size-grid">
          <div className="doc-size-card">
            <div className="doc-size-badge doc-size-s">S</div>
            <div className="doc-size-content">
              <strong>Small</strong>
              <p>Efficient allocation. Meets functional needs without excess. Good for supporting spaces.</p>
            </div>
          </div>
          <div className="doc-size-card">
            <div className="doc-size-badge doc-size-m">M</div>
            <div className="doc-size-content">
              <strong>Medium</strong>
              <p>Comfortable standard. Typical for most rooms in homes of your tier. Recommended default.</p>
            </div>
          </div>
          <div className="doc-size-card">
            <div className="doc-size-badge doc-size-l">L</div>
            <div className="doc-size-content">
              <strong>Large</strong>
              <p>Generous allocation. For priority spaces or special requirements. Use selectively.</p>
            </div>
          </div>
        </div>
        <div className="doc-tip">
          <Info size={14} />
          <span>Actual square footages scale with your tier. A "Medium" kitchen in a 15K home is larger 
          than a "Medium" kitchen in a 5K home.</span>
        </div>
      </div>

      <div className="doc-card">
        <h3 className="doc-subsection-title">Tier-Based Templates</h3>
        <p className="doc-paragraph">
          FYI uses your target square footage (from KYC) to select the appropriate program template. 
          Larger tiers include more spaces and larger default sizes.
        </p>
        <div className="doc-tier-table">
          <div className="doc-tier-row doc-tier-row--header">
            <span>Tier</span>
            <span>Target Range</span>
            <span>Typical Spaces</span>
            <span>Character</span>
          </div>
          <div className="doc-tier-row">
            <span className="doc-tier-label">5K</span>
            <span>&lt; 7,500 SF</span>
            <span>25-30 spaces</span>
            <span>Efficient luxury</span>
          </div>
          <div className="doc-tier-row">
            <span className="doc-tier-label">10K</span>
            <span>7,500 - 12,500 SF</span>
            <span>35-40 spaces</span>
            <span>Comfortable estate</span>
          </div>
          <div className="doc-tier-row">
            <span className="doc-tier-label">15K</span>
            <span>12,500 - 17,500 SF</span>
            <span>45-55 spaces</span>
            <span>Full-service mansion</span>
          </div>
          <div className="doc-tier-row">
            <span className="doc-tier-label">20K</span>
            <span>17,500+ SF</span>
            <span>60+ spaces</span>
            <span>Grand estate</span>
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
  const zones = [
    {
      code: 'Z1',
      name: 'Arrival + Public',
      icon: Home,
      color: '#1e3a5f',
      description: 'Entry, formal entertaining, office, and public-facing spaces.',
      typicalSpaces: ['Foyer', 'Gallery', 'Living Room', 'Dining Room', 'Home Office', 'Powder Room'],
      considerations: [
        'First impression zone—consider ceiling heights and natural light',
        'Formal entertaining capacity',
        'Guest bathroom accessibility',
        'Coat and package storage'
      ]
    },
    {
      code: 'Z2',
      name: 'Family + Kitchen',
      icon: Users,
      color: '#2e7d32',
      description: 'Daily living hub, kitchen, breakfast, and casual family spaces.',
      typicalSpaces: ['Kitchen', 'Breakfast Nook', 'Family Room', 'Scullery', 'Butler Pantry', 'Mudroom'],
      considerations: [
        'Heart of daily living—size generously',
        'Kitchen work triangle and prep space',
        'Visual connection to outdoor spaces',
        'Casual dining capacity'
      ]
    },
    {
      code: 'Z3',
      name: 'Entertainment',
      icon: Users,
      color: '#7b1fa2',
      description: 'Game room, theater, bar, billiards, and recreational spaces.',
      typicalSpaces: ['Media Room', 'Game Room', 'Bar', 'Wine Room', 'Billiards', 'Lounge'],
      considerations: [
        'Acoustic isolation requirements',
        'Lighting control and AV infrastructure',
        'Beverage service proximity',
        'Sound lock for bedrooms'
      ]
    },
    {
      code: 'Z4',
      name: 'Wellness',
      icon: Dumbbell,
      color: '#00897b',
      description: 'Gym, spa, pool support, and health-focused spaces.',
      typicalSpaces: ['Gym', 'Spa', 'Steam Room', 'Sauna', 'Massage Room', 'Pool Bath'],
      considerations: [
        'Equipment footprint and ceiling height',
        'Ventilation and dehumidification',
        'Wet-feet transitions from pool',
        'Natural light for exercise areas'
      ]
    },
    {
      code: 'Z5',
      name: 'Primary Suite',
      icon: Home,
      color: '#1565c0',
      description: 'Primary bedroom, bath, closets, and private retreat.',
      typicalSpaces: ['Primary Bedroom', 'Primary Bath', 'His Closet', 'Her Closet', 'Sitting Area', 'Private Terrace'],
      considerations: [
        'Retreat quality and privacy',
        'Bath-to-bed relationship',
        'Closet capacity and organization',
        'Morning routine flow'
      ]
    },
    {
      code: 'Z6',
      name: 'Guest + Secondary',
      icon: Users,
      color: '#f57c00',
      description: 'Jr. Primary, guest suites, kids rooms, staff quarters.',
      typicalSpaces: ['Jr. Primary', 'Guest Suite 1-3', 'Kids Rooms', 'Bunk Room', 'Au Pair Suite'],
      considerations: [
        'Guest autonomy and privacy',
        'Sound separation from primary',
        'Staff quarters accessibility',
        'Future flexibility'
      ]
    },
    {
      code: 'Z7',
      name: 'Service + BOH',
      icon: Briefcase,
      color: '#5d4037',
      description: 'Laundry, mudroom, mechanical, storage, and back-of-house.',
      typicalSpaces: ['Laundry', 'Utility Room', 'Mechanical', 'Storage', 'Garage Entry', 'Staff Break'],
      considerations: [
        'Service circulation routes',
        'Staff efficiency and comfort',
        'Delivery and trash flow',
        'MEP access requirements'
      ]
    },
    {
      code: 'Z8',
      name: 'Outdoor Spaces',
      icon: TreePine,
      color: '#388e3c',
      description: 'Terrace, pool, outdoor kitchen, and exterior living.',
      typicalSpaces: ['Covered Terrace', 'Pool', 'Pool Deck', 'Outdoor Kitchen', 'Fire Pit', 'Lawn'],
      considerations: [
        'Indoor-outdoor transitions',
        'Sun and shade balance',
        'Pool-to-house wet-feet path',
        'Entertainment capacity'
      ]
    }
  ];

  return (
    <div className="doc-tab-content">
      <div className="doc-card">
        <h2 className="doc-section-title">FYI Zone Workflow</h2>
        <p className="doc-paragraph">
          Work through each zone, reviewing pre-selected spaces and adjusting sizes. The system 
          starts with a recommended template based on your KYC inputs—your job is to refine it 
          to match your priorities.
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="doc-workflow-steps">
        <div className="doc-workflow-step">
          <div className="doc-workflow-number">1</div>
          <div className="doc-workflow-content">
            <h4>Review Zone Spaces</h4>
            <p>Each zone shows pre-selected spaces based on your KYC inputs. Spaces are already 
            marked as included or excluded based on your lifestyle profile.</p>
          </div>
        </div>
        <div className="doc-workflow-step">
          <div className="doc-workflow-number">2</div>
          <div className="doc-workflow-content">
            <h4>Toggle Inclusions</h4>
            <p>Add or remove spaces as needed. Want a wine room? Add it. Don't need a formal 
            dining room? Remove it. Changes update the total SF in real time.</p>
          </div>
        </div>
        <div className="doc-workflow-step">
          <div className="doc-workflow-number">3</div>
          <div className="doc-workflow-content">
            <h4>Adjust Sizing</h4>
            <p>For each included space, select S/M/L. Start with Medium for most spaces, then 
            upgrade priorities to Large and downgrade supporting spaces to Small.</p>
          </div>
        </div>
        <div className="doc-workflow-step">
          <div className="doc-workflow-number">4</div>
          <div className="doc-workflow-content">
            <h4>Monitor Totals</h4>
            <p>Watch the totals panel as you work. Stay within ±10% of your target SF. The 
            system will warn you if you're significantly over or under.</p>
          </div>
        </div>
        <div className="doc-workflow-step">
          <div className="doc-workflow-number">5</div>
          <div className="doc-workflow-content">
            <h4>Export Brief</h4>
            <p>When complete, export a PDF space brief for your design team. This becomes the 
            official program document for schematic design.</p>
          </div>
        </div>
      </div>

      {/* Zone Guide */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Zone-by-Zone Guide</h3>
      </div>

      {zones.map((zone) => (
        <div key={zone.code} className="doc-zone-card" style={{ '--zone-color': zone.color }}>
          <div className="doc-zone-header">
            <div className="doc-zone-badge">{zone.code}</div>
            <h4 className="doc-zone-title">
              <zone.icon size={18} />
              {zone.name}
            </h4>
          </div>
          <p className="doc-zone-description">{zone.description}</p>
          
          <div className="doc-zone-details">
            <div className="doc-zone-column">
              <h5>Typical Spaces</h5>
              <div className="doc-zone-spaces">
                {zone.typicalSpaces.map((space, i) => (
                  <span key={i} className="doc-zone-space">{space}</span>
                ))}
              </div>
            </div>
            <div className="doc-zone-column">
              <h5>Key Considerations</h5>
              <ul>
                {zone.considerations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
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
        <h2 className="doc-section-title">Program Balance Gates</h2>
        <p className="doc-paragraph">
          FYI validates your space program against several criteria before passing to MVP. 
          These gates ensure your program is realistic and properly balanced.
        </p>
      </div>

      {/* Target SF Gate */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">
          <Target size={18} style={{ marginRight: '0.5rem' }} />
          Target Square Footage
        </h3>
        <p className="doc-paragraph">
          Your total program should be within ±10% of your target SF from KYC. Significant 
          deviations require either adjusting your program or revising your target.
        </p>
        <div className="doc-variance-scale">
          <div className="doc-variance-bar">
            <div className="doc-variance-zone doc-variance-danger">-20%</div>
            <div className="doc-variance-zone doc-variance-warning">-10%</div>
            <div className="doc-variance-zone doc-variance-good">Target</div>
            <div className="doc-variance-zone doc-variance-warning">+10%</div>
            <div className="doc-variance-zone doc-variance-danger">+20%</div>
          </div>
          <div className="doc-variance-labels">
            <span>Under-programmed</span>
            <span>Optimal Range</span>
            <span>Over-programmed</span>
          </div>
        </div>
        <div className="doc-variance-notes">
          <div className="doc-variance-note">
            <AlertTriangle size={14} color={COLORS.warning} />
            <span><strong>Under by 10%+:</strong> You may have unused budget. Consider adding spaces 
            or upgrading sizes.</span>
          </div>
          <div className="doc-variance-note">
            <AlertTriangle size={14} color={COLORS.error} />
            <span><strong>Over by 10%+:</strong> Either reduce program or increase target SF. 
            Over-programming leads to budget overruns.</span>
          </div>
        </div>
      </div>

      {/* Zone Balance */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Zone Balance Requirements</h3>
        <p className="doc-paragraph">
          Each zone should fall within a reasonable percentage of total SF. Extreme imbalances 
          suggest missing spaces or oversizing.
        </p>
        <div className="doc-balance-table">
          <div className="doc-balance-row doc-balance-row--header">
            <span>Zone</span>
            <span>Typical Range</span>
            <span>Warning If</span>
          </div>
          <div className="doc-balance-row">
            <span>Z1: Arrival + Public</span>
            <span>8-15%</span>
            <span>&gt;20% (oversized formal spaces)</span>
          </div>
          <div className="doc-balance-row">
            <span>Z2: Family + Kitchen</span>
            <span>12-20%</span>
            <span>&lt;10% (undersized heart of home)</span>
          </div>
          <div className="doc-balance-row">
            <span>Z5: Primary Suite</span>
            <span>8-15%</span>
            <span>&gt;20% (may crowd other zones)</span>
          </div>
          <div className="doc-balance-row">
            <span>Z6: Guest + Secondary</span>
            <span>15-25%</span>
            <span>&lt;12% (insufficient bedroom count)</span>
          </div>
          <div className="doc-balance-row">
            <span>Z7: Service + BOH</span>
            <span>8-15%</span>
            <span>&lt;6% (undersized service infrastructure)</span>
          </div>
        </div>
      </div>

      {/* Circulation */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Circulation Allowance</h3>
        <p className="doc-paragraph">
          Your programmed spaces don't account for hallways, stairs, walls, and circulation. 
          FYI adds a circulation factor (typically 15-20%) when calculating buildable area.
        </p>
        <div className="doc-circulation-example">
          <div className="doc-circ-row">
            <span>Programmed Space Total</span>
            <span>12,000 SF</span>
          </div>
          <div className="doc-circ-row">
            <span>Circulation Factor (18%)</span>
            <span>+ 2,160 SF</span>
          </div>
          <div className="doc-circ-row doc-circ-row--total">
            <span>Buildable Area Estimate</span>
            <span>14,160 SF</span>
          </div>
        </div>
        <div className="doc-tip">
          <Info size={14} />
          <span>Multi-story homes need more circulation (stairs, landings). Compact plans can 
          sometimes achieve 15%, while sprawling estates may need 22%.</span>
        </div>
      </div>

      {/* Required Spaces */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Required Spaces by Tier</h3>
        <p className="doc-paragraph">
          Certain spaces are expected in each tier. Missing them will trigger warnings.
        </p>

        <ExpandableSection title="5K Tier Requirements" defaultOpen={true}>
          <ul className="doc-required-list">
            <li><CheckCircle size={14} /> Primary Suite with walk-in closet</li>
            <li><CheckCircle size={14} /> Kitchen (may be combined with family area)</li>
            <li><CheckCircle size={14} /> At least 2 additional bedrooms</li>
            <li><CheckCircle size={14} /> 2-car garage minimum</li>
            <li><CheckCircle size={14} /> Laundry room</li>
          </ul>
        </ExpandableSection>

        <ExpandableSection title="10K Tier Requirements">
          <ul className="doc-required-list">
            <li><CheckCircle size={14} /> Primary Suite with separate bath and closet(s)</li>
            <li><CheckCircle size={14} /> Separate kitchen and family room</li>
            <li><CheckCircle size={14} /> Formal living or dining room</li>
            <li><CheckCircle size={14} /> At least 3 additional bedrooms</li>
            <li><CheckCircle size={14} /> Home office or study</li>
            <li><CheckCircle size={14} /> 3-car garage</li>
            <li><CheckCircle size={14} /> Dedicated laundry room</li>
          </ul>
        </ExpandableSection>

        <ExpandableSection title="15K Tier Requirements">
          <ul className="doc-required-list">
            <li><CheckCircle size={14} /> Primary Suite with his/hers closets</li>
            <li><CheckCircle size={14} /> Separate living and family rooms</li>
            <li><CheckCircle size={14} /> Formal dining room</li>
            <li><CheckCircle size={14} /> Butler pantry or scullery</li>
            <li><CheckCircle size={14} /> At least 4 bedrooms including guest suite</li>
            <li><CheckCircle size={14} /> Media room or theater</li>
            <li><CheckCircle size={14} /> Home gym or wellness space</li>
            <li><CheckCircle size={14} /> 4+ car garage</li>
            <li><CheckCircle size={14} /> Mudroom</li>
          </ul>
        </ExpandableSection>

        <ExpandableSection title="20K Tier Requirements">
          <ul className="doc-required-list">
            <li><CheckCircle size={14} /> Primary Suite with sitting area</li>
            <li><CheckCircle size={14} /> Separate his/hers baths and closets</li>
            <li><CheckCircle size={14} /> Multiple entertaining zones</li>
            <li><CheckCircle size={14} /> Catering kitchen or full scullery</li>
            <li><CheckCircle size={14} /> Wine room and bar</li>
            <li><CheckCircle size={14} /> Full guest wing (2+ suites)</li>
            <li><CheckCircle size={14} /> Theater (not just media room)</li>
            <li><CheckCircle size={14} /> Full wellness suite (gym, spa)</li>
            <li><CheckCircle size={14} /> Staff quarters</li>
            <li><CheckCircle size={14} /> Service entry and ops core</li>
            <li><CheckCircle size={14} /> 6+ car garage with service</li>
          </ul>
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
          Zone definitions, space categories, and sizing benchmarks for FYI programming.
        </p>
      </div>

      {/* Zone Codes */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Zone Code Reference</h3>
        <div className="doc-zone-table">
          <div className="doc-zone-tbl-row doc-zone-tbl-row--header">
            <span>Code</span>
            <span>Zone Name</span>
            <span>Function</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z1_APB</code>
            <span>Arrival + Public</span>
            <span>Entry and formal entertaining</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z2_FAM</code>
            <span>Family + Kitchen</span>
            <span>Daily living hub</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z3_ENT</code>
            <span>Entertainment</span>
            <span>Recreation and media</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z4_WEL</code>
            <span>Wellness</span>
            <span>Gym, spa, and health</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z5_PRI</code>
            <span>Primary Suite</span>
            <span>Primary private retreat</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z6_GST</code>
            <span>Guest + Secondary</span>
            <span>Guest and children's rooms</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z7_SVC</code>
            <span>Service + BOH</span>
            <span>Back-of-house operations</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z8_OUT</code>
            <span>Outdoor Spaces</span>
            <span>Exterior living (unconditioned)</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z9_GH</code>
            <span>Guest House</span>
            <span>Separate guest structure</span>
          </div>
          <div className="doc-zone-tbl-row">
            <code>Z10_PH</code>
            <span>Pool House</span>
            <span>Pool/wellness pavilion</span>
          </div>
        </div>
      </div>

      {/* Size Benchmarks */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Size Benchmarks (Sample Spaces)</h3>
        <p className="doc-paragraph">
          Example S/M/L allocations for common spaces. Actual values scale with your project tier.
        </p>

        <ExpandableSection title="View Size Examples (10K Tier)" defaultOpen={true}>
          <div className="doc-benchmark-table">
            <div className="doc-benchmark-row doc-benchmark-row--header">
              <span>Space</span>
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Primary Bedroom</span>
              <span>350 SF</span>
              <span>450 SF</span>
              <span>600 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Kitchen</span>
              <span>250 SF</span>
              <span>350 SF</span>
              <span>500 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Family Room</span>
              <span>300 SF</span>
              <span>450 SF</span>
              <span>600 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Guest Suite</span>
              <span>200 SF</span>
              <span>280 SF</span>
              <span>350 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Home Office</span>
              <span>120 SF</span>
              <span>180 SF</span>
              <span>250 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Media Room</span>
              <span>300 SF</span>
              <span>450 SF</span>
              <span>650 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Gym</span>
              <span>200 SF</span>
              <span>350 SF</span>
              <span>500 SF</span>
            </div>
            <div className="doc-benchmark-row">
              <span>Garage (per car)</span>
              <span>200 SF</span>
              <span>250 SF</span>
              <span>300 SF</span>
            </div>
          </div>
        </ExpandableSection>
      </div>

      {/* Level Naming */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Level Naming Convention</h3>
        <div className="doc-level-list">
          <div className="doc-level-item">
            <span className="doc-level-code">B1</span>
            <span>Basement Level 1 (if applicable)</span>
          </div>
          <div className="doc-level-item">
            <span className="doc-level-code">L1</span>
            <span>Main Level (entry grade)</span>
          </div>
          <div className="doc-level-item">
            <span className="doc-level-code">L2</span>
            <span>Upper Level 1</span>
          </div>
          <div className="doc-level-item">
            <span className="doc-level-code">L3</span>
            <span>Upper Level 2 (if applicable)</span>
          </div>
        </div>
      </div>

      {/* Bedroom Naming */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Bedroom Naming Convention</h3>
        <p className="doc-paragraph">
          N4S uses a standardized naming convention for bedrooms to avoid confusion.
        </p>
        <div className="doc-naming-table">
          <div className="doc-naming-row">
            <strong>Primary Suite</strong>
            <span>Master bedroom (owners)</span>
          </div>
          <div className="doc-naming-row">
            <strong>Jr. Primary</strong>
            <span>Secondary owner's suite or older child's suite</span>
          </div>
          <div className="doc-naming-row">
            <strong>Guest Suite 1, 2, 3</strong>
            <span>Guest bedrooms with en-suite baths</span>
          </div>
          <div className="doc-naming-row">
            <strong>Kids Room 1, 2</strong>
            <span>Children's bedrooms (may share bath)</span>
          </div>
          <div className="doc-naming-row">
            <strong>Bunk Room</strong>
            <span>Multi-bed room for kids or casual guests</span>
          </div>
          <div className="doc-naming-row">
            <strong>Au Pair / Nanny Suite</strong>
            <span>Caregiver quarters near kids' rooms</span>
          </div>
          <div className="doc-naming-row">
            <strong>Staff Suite</strong>
            <span>Live-in staff quarters, typically near service</span>
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="doc-card">
        <h3 className="doc-subsection-title">Glossary</h3>
        <ExpandableSection title="View Definitions">
          <dl className="doc-glossary">
            <dt>Conditioned Space</dt>
            <dd>Interior space with heating/cooling. Counts toward total SF for permitting and appraisal.</dd>
            
            <dt>Unconditioned Space</dt>
            <dd>Covered outdoor areas like terraces and porches. Not included in conditioned SF but important for program.</dd>
            
            <dt>Circulation</dt>
            <dd>Hallways, stairs, landings, and passage areas. Added as a percentage on top of programmed spaces.</dd>
            
            <dt>Net SF</dt>
            <dd>Programmed space total (rooms only, no circulation or walls).</dd>
            
            <dt>Gross SF</dt>
            <dd>Total buildable area including circulation, walls, and structure. Typically 15-22% larger than net.</dd>
            
            <dt>Program Tier</dt>
            <dd>Internal classification (5K/10K/15K/20K) based on target SF. Determines space template and default sizes.</dd>
            
            <dt>S/M/L</dt>
            <dd>Size selector (Small/Medium/Large). Each represents a tier-appropriate square footage allocation.</dd>
            
            <dt>Included Space</dt>
            <dd>A space marked for inclusion in your program. Contributes to total SF.</dd>
            
            <dt>Would-Like</dt>
            <dd>Space that's commonly included for your tier and profile. Pre-selected but can be removed.</dd>
            
            <dt>Structure</dt>
            <dd>Separate building on the property (Guest House, Pool House). Has its own zone.</dd>
          </dl>
        </ExpandableSection>
      </div>
    </div>
  );
}

/**
 * Main FYIDocumentation Component
 */
export default function FYIDocumentation({ onClose }) {
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
              Back to FYI
            </button>
          )}
        </div>
        <h1 className="doc-title">Documentation</h1>
        <p className="doc-subtitle">N4S FYI — Space Programming Guide</p>
        
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

      <style>{fyiDocumentationStyles}</style>
    </div>
  );
}

// FYI-specific styles
const fyiDocumentationStyles = `
/* Base styles */
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
  display: flex;
  align-items: center;
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

/* Size System */
.doc-size-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.doc-size-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  background-color: ${COLORS.surface};
  border-radius: 6px;
}

.doc-size-badge {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.doc-size-s { background-color: #90a4ae; }
.doc-size-m { background-color: ${COLORS.navy}; }
.doc-size-l { background-color: ${COLORS.gold}; color: ${COLORS.text}; }

.doc-size-content strong {
  display: block;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
}

.doc-size-content p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
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

/* Tier Table */
.doc-tier-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-tier-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
}

.doc-tier-row:last-child {
  border-bottom: none;
}

.doc-tier-row--header {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-tier-label {
  font-weight: 600;
  color: ${COLORS.navy};
}

/* Workflow Steps */
.doc-workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.doc-workflow-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
}

.doc-workflow-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.doc-workflow-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0 0 0.25rem 0;
}

.doc-workflow-content p {
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.5;
}

/* Zone Cards */
.doc-zone-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  border-left: 4px solid var(--zone-color, ${COLORS.navy});
}

.doc-zone-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.doc-zone-badge {
  padding: 0.25rem 0.5rem;
  background-color: var(--zone-color, ${COLORS.navy});
  color: #fff;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.doc-zone-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
}

.doc-zone-description {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0 0 1rem 0;
}

.doc-zone-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.doc-zone-column h5 {
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.doc-zone-spaces {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.doc-zone-space {
  padding: 0.25rem 0.5rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
  font-size: 0.75rem;
  color: ${COLORS.text};
}

.doc-zone-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-zone-column li {
  font-size: 0.8125rem;
  color: ${COLORS.text};
  padding: 0.25rem 0;
  padding-left: 0.75rem;
  position: relative;
}

.doc-zone-column li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--zone-color, ${COLORS.navy});
}

/* Variance Scale */
.doc-variance-scale {
  margin: 1rem 0;
}

.doc-variance-bar {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
}

.doc-variance-zone {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.doc-variance-danger { background-color: #ffcdd2; color: ${COLORS.error}; }
.doc-variance-warning { background-color: #fff3e0; color: ${COLORS.warning}; }
.doc-variance-good { background-color: #c8e6c9; color: ${COLORS.success}; }

.doc-variance-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: ${COLORS.textMuted};
  margin-top: 0.25rem;
}

.doc-variance-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.doc-variance-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

/* Balance Table */
.doc-balance-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-balance-row {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
}

.doc-balance-row:last-child {
  border-bottom: none;
}

.doc-balance-row--header {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Circulation Example */
.doc-circulation-example {
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.doc-circ-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-circ-row:last-child {
  border-bottom: none;
}

.doc-circ-row--total {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.navy};
}

/* Required List */
.doc-required-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.doc-required-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: ${COLORS.text};
}

.doc-required-list li svg {
  color: ${COLORS.success};
  flex-shrink: 0;
}

/* Zone Code Table */
.doc-zone-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-zone-tbl-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
  align-items: center;
}

.doc-zone-tbl-row:last-child {
  border-bottom: none;
}

.doc-zone-tbl-row--header {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.doc-zone-tbl-row code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.75rem;
  color: ${COLORS.navy};
}

/* Benchmark Table */
.doc-benchmark-table {
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  overflow: hidden;
}

.doc-benchmark-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px 80px;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${COLORS.border};
  font-size: 0.875rem;
}

.doc-benchmark-row:last-child {
  border-bottom: none;
}

.doc-benchmark-row--header {
  background-color: ${COLORS.background};
  font-weight: 600;
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Level List */
.doc-level-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doc-level-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: ${COLORS.background};
  border-radius: 4px;
  font-size: 0.875rem;
}

.doc-level-code {
  padding: 0.25rem 0.5rem;
  background-color: ${COLORS.navy};
  color: #fff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

/* Naming Table */
.doc-naming-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doc-naming-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  border-bottom: 1px solid ${COLORS.border};
}

.doc-naming-row:last-child {
  border-bottom: none;
}

.doc-naming-row strong {
  color: ${COLORS.text};
}

.doc-naming-row span {
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

@media (max-width: 768px) {
  .doc-tier-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .doc-zone-details {
    grid-template-columns: 1fr;
  }
  
  .doc-balance-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .doc-required-list {
    grid-template-columns: 1fr;
  }
  
  .doc-benchmark-row {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
`;
