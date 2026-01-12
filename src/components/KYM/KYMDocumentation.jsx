/**
 * KYMDocumentation.jsx
 * 
 * 4-tab documentation for Know Your Market module:
 * - Overview: What KYM does, key outcomes
 * - Workflow: Step-by-step process
 * - Gates: Validation requirements
 * - Reference: Terms, data sources
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Home,
  Users,
  Target,
  MapPin,
  BarChart2,
  FileText,
  Clock,
  Lightbulb
} from 'lucide-react';

// N4S Brand Colors
const COLORS = {
  navy: '#1e3a5f',
  gold: '#c9a227',
  dustyRose: '#E4C0BE',
  background: '#fafaf8',
  surface: '#ffffff',
  border: '#e5e5e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  success: '#2e7d32',
  warning: '#f57c00',
};

const CollapsibleSection = ({ title, children, defaultOpen = false, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '8px',
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {Icon && <Icon size={18} color={COLORS.navy} />}
        <span style={{ flex: 1, fontWeight: 600, color: COLORS.text }}>{title}</span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isOpen && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const KYMDocumentation = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'gates', label: 'Gates' },
    { id: 'reference', label: 'Reference' },
  ];

  return (
    <div className="kym-doc-container">
      {/* Header - matches FYI Documentation style */}
      <div className="kym-doc-header">
        <div className="kym-doc-header-top">
          {onClose && (
            <button className="kym-doc-close-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              Back to KYM
            </button>
          )}
        </div>
        <h1 className="kym-doc-title">Documentation</h1>
        <p className="kym-doc-subtitle">N4S KYM — Market Intelligence for Luxury Residential Development</p>
        
        {/* Tabs - matches FYI style */}
        <div className="kym-doc-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`kym-doc-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="kym-doc-content">
        {activeTab === 'overview' && (
          <div className="kym-doc-tab-content">
            <div className="kym-doc-card">
              <h2 className="kym-doc-section-title">What is KYM?</h2>
              
              <p className="kym-doc-paragraph">
                <strong>Know Your Market (KYM)</strong> provides market intelligence to validate your 
                luxury residential development decisions. It analyzes local market trends, comparable 
                properties, and demographic data to ensure your project is appropriately positioned.
              </p>
            </div>

            <div className="kym-doc-feature-grid">
              <div className="kym-doc-feature-card">
                <div className="kym-doc-feature-header">
                  <TrendingUp size={20} color={COLORS.navy} />
                  <h3>Market Analysis</h3>
                </div>
                <p>Growth rates, price trends, listing duration, and demand indices for your target market.</p>
              </div>
              
              <div className="kym-doc-feature-card">
                <div className="kym-doc-feature-header">
                  <Home size={20} color={COLORS.navy} />
                  <h3>Comparable Properties</h3>
                </div>
                <p>Live property data from luxury markets with filtering by price, size, and features.</p>
              </div>
              
              <div className="kym-doc-feature-card">
                <div className="kym-doc-feature-header">
                  <Users size={20} color={COLORS.navy} />
                  <h3>Demographics</h3>
                </div>
                <p>Population, income, education analysis plus target buyer persona identification.</p>
              </div>
            </div>

            <CollapsibleSection title="Key Outcomes" icon={Target} defaultOpen={true}>
              <ul className="kym-doc-list">
                <li><CheckCircle size={16} className="kym-doc-icon success" /> Validate price positioning against comparable properties</li>
                <li><CheckCircle size={16} className="kym-doc-icon success" /> Understand buyer demographics and priorities</li>
                <li><CheckCircle size={16} className="kym-doc-icon success" /> Identify must-have features for target market</li>
                <li><CheckCircle size={16} className="kym-doc-icon success" /> Assess market timing and demand conditions</li>
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Alignment with N4S Workflow" icon={Lightbulb}>
              <p className="kym-doc-paragraph">
                KYM connects your client requirements (KYC), space program (FYI), and validation 
                decisions (MVP) with real market data. This creates a feedback loop:
              </p>
              <ul className="kym-doc-list">
                <li><strong>KYC → KYM:</strong> Client's target location drives market selection</li>
                <li><strong>FYI → KYM:</strong> Space program compared against comparable features</li>
                <li><strong>MVP → KYM:</strong> Adjacency choices validated against market priorities</li>
                <li><strong>KYM → P2:</strong> Market insights inform "Have a Story to Tell"</li>
              </ul>
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="kym-doc-tab-content">
            <div className="kym-doc-card">
              <h2 className="kym-doc-section-title">KYM Workflow</h2>
            </div>

            <CollapsibleSection title="Step 1: Select Location" icon={MapPin} defaultOpen>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: COLORS.dustyRose,
                  borderRadius: '50%',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>1</div>
                <div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem' }}>
                    Choose your target market using the location selector. The system defaults to 
                    your client's project location from KYC if available.
                  </p>
                  <div style={{ 
                    background: COLORS.background, 
                    padding: '0.75rem', 
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                  }}>
                    <strong>Tip:</strong> Enter any US ZIP code or select from pre-configured 
                    luxury markets (Beverly Hills, Malibu, Miami Beach, etc.)
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Step 2: Review Market Analysis" icon={TrendingUp}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: COLORS.dustyRose,
                  borderRadius: '50%',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>2</div>
                <div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem' }}>
                    Analyze market KPIs including growth rate, median price/SF, listing duration, 
                    and demand index. Review 12-month trend data.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: COLORS.textMuted }}>
                    <strong>Time estimate:</strong> 5-10 minutes
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Step 3: Explore Comparable Properties" icon={Home}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: COLORS.dustyRose,
                  borderRadius: '50%',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>3</div>
                <div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem' }}>
                    Filter comparable properties by price range, square footage, and features. 
                    Compare against your FYI space program.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: COLORS.textMuted }}>
                    <strong>Time estimate:</strong> 10-15 minutes
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Step 4: Analyze Demographics" icon={Users}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: COLORS.dustyRose,
                  borderRadius: '50%',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>4</div>
                <div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem' }}>
                    Review buyer personas and feature priorities. Validate that your space 
                    program aligns with target buyer expectations.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: COLORS.textMuted }}>
                    <strong>Time estimate:</strong> 10-15 minutes
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Step 5: Generate Insights Report" icon={FileText}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: COLORS.dustyRose,
                  borderRadius: '50%',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>5</div>
                <div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem' }}>
                    Export a market positioning report to share with stakeholders. 
                    This feeds into the P2 "Have a Story to Tell" phase.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: COLORS.textMuted }}>
                    <strong>Coming Soon:</strong> PDF export with branding options
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'gates' && (
          <div>
            <h2 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.25rem',
              color: COLORS.navy,
              marginBottom: '1rem'
            }}>
              Gates & Validation
            </h2>

            <CollapsibleSection title="Market Positioning Gate" icon={CheckCircle} defaultOpen>
              <p style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>
                Before proceeding to VMX (Vision Matrix), validate market positioning:
              </p>
              
              <div style={{ 
                background: COLORS.background, 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color={COLORS.success} />
                  <strong style={{ fontSize: '0.875rem' }}>Target $/SF Within Market Range</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: COLORS.textMuted }}>
                  Your project's expected price per square foot should fall within the 25th-75th 
                  percentile of comparable properties.
                </p>
              </div>
              
              <div style={{ 
                background: COLORS.background, 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color={COLORS.success} />
                  <strong style={{ fontSize: '0.875rem' }}>Feature Alignment 75%+</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: COLORS.textMuted }}>
                  At least 75% of your FYI space program features match buyer priority features.
                </p>
              </div>
              
              <div style={{ 
                background: COLORS.background, 
                padding: '1rem', 
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color={COLORS.success} />
                  <strong style={{ fontSize: '0.875rem' }}>Demand Index Above 5.0</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', margin: 0, color: COLORS.textMuted }}>
                  Market demand should be healthy (above 5.0) for luxury development timing.
                </p>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Warning Indicators" icon={AlertTriangle}>
              <div style={{ 
                background: '#fef3c7', 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '0.75rem' 
              }}>
                <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  High Listing Duration (90+ days)
                </strong>
                <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0 0', color: '#92400e' }}>
                  Properties taking longer to sell may indicate softening demand.
                </p>
              </div>
              
              <div style={{ 
                background: '#fef3c7', 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '0.75rem' 
              }}>
                <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  Negative Growth Rate
                </strong>
                <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0 0', color: '#92400e' }}>
                  Market contraction suggests timing consideration.
                </p>
              </div>
              
              <div style={{ 
                background: '#fef3c7', 
                padding: '1rem', 
                borderRadius: '8px',
              }}>
                <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  Price Premium 50%+ Above Median
                </strong>
                <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0 0', color: '#92400e' }}>
                  Significant premium positioning requires strong differentiation story.
                </p>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'reference' && (
          <div>
            <h2 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.25rem',
              color: COLORS.navy,
              marginBottom: '1rem'
            }}>
              Reference
            </h2>

            <CollapsibleSection title="Data Sources" icon={BarChart2} defaultOpen>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{ background: COLORS.background }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>Source</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>Data</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>Realtor.com (RapidAPI)</td>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>Property listings</td>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ padding: '0.125rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>MLS Direct</td>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>Property listings</td>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ padding: '0.125rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '0.75rem' }}>
                        Planned
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>ZipSmart.ai</td>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>Demographics</td>
                    <td style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ padding: '0.125rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '0.75rem' }}>
                        Planned
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem' }}>Generated Data</td>
                    <td style={{ padding: '0.75rem' }}>Fallback samples</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.125rem 0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '0.75rem' }}>
                        Default
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CollapsibleSection>

            <CollapsibleSection title="Market KPIs Glossary" icon={BarChart2}>
              <dl style={{ margin: 0 }}>
                <dt style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Growth Rate</dt>
                <dd style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: COLORS.textMuted }}>
                  Year-over-year change in median sale prices. Positive indicates appreciation.
                </dd>
                
                <dt style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Median Price/SF</dt>
                <dd style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: COLORS.textMuted }}>
                  Middle value of price per square foot across all comparables.
                </dd>
                
                <dt style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Listing Duration</dt>
                <dd style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: COLORS.textMuted }}>
                  Average days on market before sale. Lower indicates stronger demand.
                </dd>
                
                <dt style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Demand Index</dt>
                <dd style={{ margin: '0 0 0 0', fontSize: '0.875rem', color: COLORS.textMuted }}>
                  1-10 scale combining buyer activity, inventory levels, and pricing trends. 
                  Above 7 = seller's market, below 5 = buyer's market.
                </dd>
              </dl>
            </CollapsibleSection>

            <CollapsibleSection title="Buyer Persona Categories" icon={Users}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8, fontSize: '0.875rem' }}>
                <li><strong>Tech Entrepreneur:</strong> Startup founders, tech executives (35-50, $5M+)</li>
                <li><strong>Entertainment Executive:</strong> Studio/media industry leaders (40-60, $3M+)</li>
                <li><strong>International Investor:</strong> Global wealth holders seeking US assets (45-65, $10M+)</li>
                <li><strong>Second-Generation Wealth:</strong> Family office beneficiaries (30-45, inherited)</li>
                <li><strong>Professional Athlete:</strong> Active/retired sports professionals (25-45, variable)</li>
                <li><strong>Finance Executive:</strong> Hedge fund, PE, banking leadership (40-60, $5M+)</li>
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Configuration" icon={Clock}>
              <div style={{ 
                background: COLORS.background, 
                padding: '1rem', 
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
              }}>
                <div><strong>Environment Variables:</strong></div>
                <div style={{ marginTop: '0.5rem' }}>
                  RAPIDAPI_KEY - Enables live Realtor.com data<br />
                  MLS_API_KEY - Enables direct MLS access (planned)<br />
                  ZIPSMART_API_KEY - Enables demographic API (planned)
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>

      <style>{kymDocumentationStyles}</style>
    </div>
  );
};

// KYM Documentation styles - matches FYI Documentation styling
const kymDocumentationStyles = `
/* Base container */
.kym-doc-container {
  min-height: 100vh;
  background-color: ${COLORS.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header - matches FYI style */
.kym-doc-header {
  background-color: ${COLORS.surface};
  border-bottom: 1px solid ${COLORS.border};
  padding: 1rem 1.5rem 0;
}

.kym-doc-header-top {
  margin-bottom: 1rem;
}

.kym-doc-close-btn {
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

.kym-doc-close-btn:hover {
  border-color: ${COLORS.navy};
  color: ${COLORS.navy};
}

.kym-doc-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 0.25rem 0;
}

.kym-doc-subtitle {
  font-size: 0.9375rem;
  color: ${COLORS.textMuted};
  margin: 0 0 1.5rem 0;
}

/* Tabs - matches FYI style */
.kym-doc-tabs {
  display: flex;
  gap: 0;
  border: 1px solid ${COLORS.border};
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  background-color: ${COLORS.background};
}

.kym-doc-tab {
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

.kym-doc-tab:last-child {
  border-right: none;
}

.kym-doc-tab:hover {
  background-color: ${COLORS.surface};
}

.kym-doc-tab.active {
  background-color: ${COLORS.surface};
  color: ${COLORS.text};
}

/* Content area */
.kym-doc-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.kym-doc-tab-content {
  max-width: 900px;
}

.kym-doc-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.kym-doc-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

.kym-doc-paragraph {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: ${COLORS.text};
  margin: 0 0 1rem 0;
}

/* Feature grid */
.kym-doc-feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kym-doc-feature-card {
  background-color: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: 1rem;
}

.kym-doc-feature-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.kym-doc-feature-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.text};
}

.kym-doc-feature-card p {
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  margin: 0;
  line-height: 1.5;
}

/* Lists */
.kym-doc-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.kym-doc-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.kym-doc-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.kym-doc-icon.success {
  color: ${COLORS.success};
}

.kym-doc-icon.warning {
  color: ${COLORS.warning};
}
`;

export default KYMDocumentation;
