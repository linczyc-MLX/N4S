# KYM Documentation & Report Update Specification

**Date:** January 13, 2026  
**Purpose:** Update KYM in-app documentation and PDF report to reflect BAM v3.0 dual scoring system

---

## Part 1: In-App Documentation Updates

### File: `src/components/KYM/KYMDocumentation.jsx`

The current documentation covers basic KYM functionality but needs updates for BAM v3.0. Add these sections:

---

### Overview Tab Additions

Add after "Key Outcomes" section:

```jsx
<CollapsibleSection title="Buyer Alignment Matrix (BAM)" icon={Target} defaultOpen>
  <p className="kym-doc-paragraph">
    BAM provides a <strong>dual-lens analysis</strong> of your design decisions:
  </p>
  
  <div className="kym-doc-dual-score">
    <div className="kym-doc-score-box">
      <h4>Client Satisfaction Score</h4>
      <p>"Does this design serve YOUR needs?"</p>
      <ul>
        <li>Spatial Requirements (25 pts)</li>
        <li>Lifestyle Alignment (25 pts)</li>
        <li>Design Aesthetic (20 pts)</li>
        <li>Location Context (15 pts)</li>
        <li>Future-Proofing (15 pts)</li>
      </ul>
    </div>
    
    <div className="kym-doc-score-box">
      <h4>Market Appeal Score</h4>
      <p>"Will buyers want this when you sell?"</p>
      <ul>
        <li>Weighted by buyer archetype market share</li>
        <li>Must Haves (50 pts per archetype)</li>
        <li>Nice to Haves (35 pts per archetype)</li>
        <li>Avoids (penalty deductions)</li>
      </ul>
    </div>
  </div>
  
  <p className="kym-doc-paragraph">
    The <strong>Combined Score</strong> weights these based on your Portfolio Context—a "Forever Home" 
    prioritizes client satisfaction (70/30), while a "Spec Build" prioritizes market appeal (10/90).
  </p>
</CollapsibleSection>

<CollapsibleSection title="Portfolio Context" icon={Clock}>
  <p className="kym-doc-paragraph">
    Your investment horizon affects how scores are weighted:
  </p>
  
  <table className="kym-doc-table">
    <thead>
      <tr><th>Context</th><th>Client Weight</th><th>Market Weight</th><th>Typical Use</th></tr>
    </thead>
    <tbody>
      <tr><td>Forever Home</td><td>70%</td><td>30%</td><td>Legacy property, 15+ years</td></tr>
      <tr><td>Primary Residence</td><td>60%</td><td>40%</td><td>Long-term home, 10-15 years</td></tr>
      <tr><td>Medium Term</td><td>50%</td><td>50%</td><td>5-10 year hold</td></tr>
      <tr><td>Investment</td><td>30%</td><td>70%</td><td>Rental or &lt;5 year flip</td></tr>
      <tr><td>Spec Build</td><td>10%</td><td>90%</td><td>Build to sell immediately</td></tr>
    </tbody>
  </table>
</CollapsibleSection>

<CollapsibleSection title="Feature Classification" icon={Lightbulb}>
  <p className="kym-doc-paragraph">
    Each design feature is classified into one of four quadrants:
  </p>
  
  <div className="kym-doc-quadrant-grid">
    <div className="kym-doc-quadrant essential">
      <h4>Essential</h4>
      <p>High value to both client AND market. <strong>Must include.</strong></p>
      <em>Examples: Quality construction, smart home, modern kitchen</em>
    </div>
    
    <div className="kym-doc-quadrant differentiating">
      <h4>Differentiating</h4>
      <p>Premium features that command higher prices.</p>
      <em>Examples: Home theater, wine cellar, pool house</em>
    </div>
    
    <div className="kym-doc-quadrant personal">
      <h4>Personal</h4>
      <p>High client value but limited market appeal. <strong>Include with awareness.</strong></p>
      <em>Examples: Hobby rooms, religious spaces, pet facilities</em>
    </div>
    
    <div className="kym-doc-quadrant risky">
      <h4>Risky</h4>
      <p>May limit buyer pool. <strong>Reconsider or mitigate.</strong></p>
      <em>Examples: Over-personalization, dated design, excessive scale</em>
    </div>
  </div>
</CollapsibleSection>
```

---

### Workflow Tab Additions

Add new step after "Step 3: Explore Comparable Properties":

```jsx
<CollapsibleSection title="Step 5: Review Buyer Alignment" icon={Target}>
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
    <div className="kym-doc-step-number">5</div>
    <div>
      <p>Analyze how your design decisions align with likely buyers:</p>
      
      <ol className="kym-doc-substeps">
        <li>
          <strong>Set Portfolio Context</strong> — Adjust the slider to match your 
          investment horizon (Forever Home → Spec Build)
        </li>
        <li>
          <strong>Review Dual Scores</strong> — Check both Client Satisfaction and 
          Market Appeal scores
        </li>
        <li>
          <strong>Examine Buyer Pool</strong> — See which archetypes match your design 
          and why (Must Have / Nice to Have / Avoid breakdown)
        </li>
        <li>
          <strong>Check Feature Classification</strong> — Identify Essential features 
          you may be missing and Risky features to reconsider
        </li>
        <li>
          <strong>Follow Path to 80%</strong> — Implement recommended changes to 
          achieve passing scores
        </li>
      </ol>
      
      <div className="kym-doc-tip">
        <strong>Target:</strong> 80%+ on both scores indicates strong alignment. 
        65-79% requires attention. Below 65% needs significant changes.
      </div>
    </div>
  </div>
</CollapsibleSection>
```

---

### Gates Tab Additions

Add BAM validation gates:

```jsx
<CollapsibleSection title="BAM Validation Gates" icon={Target}>
  <table className="kym-doc-table">
    <thead>
      <tr><th>Gate</th><th>Threshold</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Client Satisfaction Score</td>
        <td>≥80%</td>
        <td>PASS = Design serves client well</td>
      </tr>
      <tr>
        <td>Market Appeal Score</td>
        <td>≥80%</td>
        <td>PASS = Strong buyer pool appeal</td>
      </tr>
      <tr>
        <td>Combined Score</td>
        <td>≥80%</td>
        <td>PASS = Ready for development</td>
      </tr>
      <tr>
        <td>Essential Features</td>
        <td>8/10 minimum</td>
        <td>All must-have features included</td>
      </tr>
      <tr>
        <td>Risky Features</td>
        <td>0-1 maximum</td>
        <td>No unmitigated risks</td>
      </tr>
    </tbody>
  </table>
  
  <div className="kym-doc-warning">
    <AlertTriangle size={16} />
    <span>
      Projects with Combined Score below 65% should not proceed to Phase 2 
      without design revisions.
    </span>
  </div>
</CollapsibleSection>
```

---

### Reference Tab Additions

Add BAM terminology:

```jsx
<CollapsibleSection title="BAM Terminology" icon={FileText}>
  <dl className="kym-doc-definitions">
    <dt>Client Satisfaction Score</dt>
    <dd>Measures how well the design serves the client's stated needs, lifestyle, 
    and aesthetic preferences. Range 0-100.</dd>
    
    <dt>Market Appeal Score</dt>
    <dd>Predicts how well the property will appeal to likely buyers based on 
    archetype preferences. Range 0-100.</dd>
    
    <dt>Combined Score</dt>
    <dd>Weighted average of Client and Market scores based on Portfolio Context.</dd>
    
    <dt>Portfolio Context</dt>
    <dd>The client's investment horizon and priorities (Forever Home to Spec Build).</dd>
    
    <dt>Buyer Archetype</dt>
    <dd>A profile representing a category of luxury home buyers (e.g., Tech Executive, 
    Entertainment Industry, Generational Wealth).</dd>
    
    <dt>Must Haves</dt>
    <dd>Features essential to a buyer archetype—dealbreakers if missing. Worth 10 points each.</dd>
    
    <dt>Nice to Haves</dt>
    <dd>Features that add value but aren't dealbreakers. Worth 7 points each.</dd>
    
    <dt>Avoids</dt>
    <dd>Features or characteristics that negatively impact archetype appeal. Penalty of 5-15 points.</dd>
    
    <dt>Path to 80%</dt>
    <dd>Ranked list of changes that would bring a score to passing threshold.</dd>
    
    <dt>Feature Classification</dt>
    <dd>Categorization of design features as Essential, Differentiating, Personal, or Risky.</dd>
  </dl>
</CollapsibleSection>
```

---

## Part 2: PDF Report Complete Redesign

### File: `src/components/KYM/KYMReportGenerator.js`

The current report uses the OLD persona format. Rewrite the BAM section entirely.

---

### New Report Structure

```
PAGE 1: COVER PAGE (existing - keep as is)

PAGE 2: EXECUTIVE SUMMARY
  - Market Overview (existing - keep)
  - Key Market Metrics (existing - keep)
  - ADD: BAM Summary Box (new)
    ┌─────────────────────────────────────────┐
    │ BUYER ALIGNMENT SUMMARY                 │
    │                                         │
    │ Client Satisfaction    Market Appeal    │
    │       82%                  65%          │
    │     ✅ PASS            ⚠️ CAUTION       │
    │                                         │
    │ Portfolio: Primary Residence (60/40)   │
    │ Combined Score: 75% ⚠️                 │
    └─────────────────────────────────────────┘

PAGE 3: BUYER ALIGNMENT ANALYSIS (COMPLETE REWRITE)
  - Section Title: "Buyer Alignment Analysis"
  - Dual Score Display (gauges or bars)
  - Portfolio Context indicator
  - Combined Score calculation breakdown

PAGE 4: CLIENT SATISFACTION BREAKDOWN
  - Section Title: "Client Satisfaction Score"
  - Score: XX/100
  - 5 Category bars:
    • Spatial Requirements: XX/25
    • Lifestyle Alignment: XX/25
    • Design Aesthetic: XX/20
    • Location Context: XX/15
    • Future-Proofing: XX/15
  - Key gaps identified

PAGE 5: MARKET APPEAL - TOP ARCHETYPES
  - Section Title: "Market Buyer Pool Analysis"
  - Market: [Location] — Price Range — Size Range
  
  For each of top 3 archetypes:
  ┌─────────────────────────────────────────┐
  │ #1 ENTERTAINMENT EXECUTIVE        12%  │
  │ 30% of market                          │
  │                                         │
  │ MUST HAVES (10/50)                     │
  │ ✗ Screening Room/Theater         0/10  │
  │ ✗ Exceptional Privacy            0/10  │
  │ ✓ Prestigious Address           10/10  │
  │ ...                                     │
  │                                         │
  │ NICE TO HAVES (0/35)                   │
  │ ✗ Wine Cellar                    0/7   │
  │ ...                                     │
  │                                         │
  │ AVOIDS TRIGGERED: 0                    │
  │                                         │
  │ PATH TO 80%:                           │
  │ 1. Add Theater               +10 pts   │
  │ 2. Improve Privacy           +10 pts   │
  └─────────────────────────────────────────┘

PAGE 6: FEATURE CLASSIFICATION
  - Section Title: "Feature Classification Analysis"
  
  ESSENTIAL (High Client + High Market)     ✓ 8/10
  ─────────────────────────────────────────────────
  ✓ Smart Home      ✓ Contemporary      ✓ Quality
  ✓ Privacy         ✓ Kitchen           ✓ Indoor-Outdoor
  ✓ Primary Suite   ✓ Natural Light
  ✗ EV Charging     ✗ Guest Autonomy
  
  DIFFERENTIATING (Premium Value)           ◐ 3/5
  ─────────────────────────────────────────────────
  ✓ Theater         ✓ Wellness          ✓ Pool
  ◐ Wine Cellar (undersized)
  ✗ Screening Room
  
  PERSONAL (Client Value, Limited Market)   ! 2
  ─────────────────────────────────────────────────
  ! 2-acre grounds (high maintenance)
  ! Art display walls (specific taste)
  
  RISKY (Reconsider)                        ⚠ 1
  ─────────────────────────────────────────────────
  ⚠ Mixed style signals

PAGE 7: RECOMMENDATIONS & ACTION ITEMS
  - Section Title: "Recommendations"
  
  PRIORITY 1: QUICK WINS
  □ Add EV charging                     +10 market pts
  □ Commit to cohesive style            +5 client, +5 market
  
  PRIORITY 2: STRATEGIC ENHANCEMENTS
  □ Create guest autonomy node          +7 market pts
  □ Expand wine cellar                  +4 market pts
  
  PRIORITY 3: RISK MITIGATION
  □ Include grounds maintenance plan    Removes -5 penalty

PAGE 8: COMPARABLE PROPERTIES (existing - keep)

PAGE 9: MARKET TRENDS (existing - keep)

PAGE 10: APPENDIX (if needed)
```

---

### Key Code Changes

#### 1. Add BAM data extraction to report function

```javascript
export const generateKYMReport = async (data) => {
  const {
    kycData,
    locationData,
    marketData,
    properties,
    demographics,
    personaResults,
    fyiData,
    mvpData,
    // ADD THESE:
    bamResults,        // Full BAM calculation results
    portfolioContext,  // 'forever-home', 'primary-residence', etc.
  } = data;
  
  // ...
```

#### 2. Add BAM Summary to Executive Summary

```javascript
// After Key Market Metrics table

// BAM Summary Box
if (bamResults) {
  currentY = checkPageBreak(50);
  
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(margin, currentY, contentWidth, 45, 3, 3, 'F');
  
  currentY += 8;
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text('BUYER ALIGNMENT SUMMARY', margin + 8, currentY);
  
  currentY += 10;
  
  // Client Score
  const clientX = margin + 30;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...getStatusColor(bamResults.clientSatisfaction.status));
  doc.text(`${bamResults.clientSatisfaction.score}%`, clientX, currentY, { align: 'center' });
  
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Client Satisfaction', clientX, currentY + 5, { align: 'center' });
  doc.text(bamResults.clientSatisfaction.status, clientX, currentY + 9, { align: 'center' });
  
  // Market Score
  const marketX = pageWidth - margin - 30;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...getStatusColor(bamResults.marketAppeal.status));
  doc.text(`${bamResults.marketAppeal.score}%`, marketX, currentY, { align: 'center' });
  
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Market Appeal', marketX, currentY + 5, { align: 'center' });
  doc.text(bamResults.marketAppeal.status, marketX, currentY + 9, { align: 'center' });
  
  // Combined Score
  const combinedX = pageWidth / 2;
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...getStatusColor(bamResults.combined.status));
  doc.text(`${bamResults.combined.score}%`, combinedX, currentY, { align: 'center' });
  
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Combined Score', combinedX, currentY + 5, { align: 'center' });
  
  currentY += 20;
  
  // Portfolio Context
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  const contextLabel = getPortfolioContextLabel(portfolioContext);
  doc.text(`Portfolio Context: ${contextLabel}`, margin + 8, currentY);
  
  currentY += 10;
}
```

#### 3. Complete BAM Section Rewrite

```javascript
// ==========================================================================
// BUYER ALIGNMENT ANALYSIS (BAM v3.0)
// ==========================================================================

if (bamResults) {
  currentY = addNewPage();
  
  // Section Header
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.navy);
  doc.text('Buyer Alignment Analysis', margin, currentY);
  currentY += 5;
  
  // Methodology note
  doc.setFont(FONTS.body, 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('BAM v3.0 dual scoring based on KYC, FYI, and MVP module data.', margin, currentY);
  currentY += 12;
  
  // Dual Score Display
  // ... (implementation as shown above)
  
  // Client Satisfaction Breakdown
  currentY = addNewPage();
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text('Client Satisfaction Score', margin, currentY);
  currentY += 3;
  
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...getStatusColor(bamResults.clientSatisfaction.status));
  doc.text(`${bamResults.clientSatisfaction.score}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 10;
  
  // Category bars
  const categories = [
    { name: 'Spatial Requirements', score: bamResults.clientSatisfaction.breakdown.spatial, max: 25 },
    { name: 'Lifestyle Alignment', score: bamResults.clientSatisfaction.breakdown.lifestyle, max: 25 },
    { name: 'Design Aesthetic', score: bamResults.clientSatisfaction.breakdown.design, max: 20 },
    { name: 'Location Context', score: bamResults.clientSatisfaction.breakdown.location, max: 15 },
    { name: 'Future-Proofing', score: bamResults.clientSatisfaction.breakdown.futureProofing, max: 15 },
  ];
  
  categories.forEach(cat => {
    drawScoreBar(doc, margin, currentY, contentWidth * 0.7, cat.name, cat.score, cat.max);
    currentY += 15;
  });
  
  // ... continue with Market Appeal, Feature Classification, Recommendations
}
```

#### 4. Helper Functions

```javascript
function getStatusColor(status) {
  switch (status) {
    case 'PASS': return COLORS.success;
    case 'CAUTION': return COLORS.warning;
    case 'FAIL': return COLORS.error;
    default: return COLORS.textMuted;
  }
}

function getPortfolioContextLabel(context) {
  const labels = {
    'forever-home': 'Forever Home (70% Client / 30% Market)',
    'primary-residence': 'Primary Residence (60% Client / 40% Market)',
    'medium-term': 'Medium Term (50% / 50%)',
    'investment': 'Investment (30% Client / 70% Market)',
    'spec-build': 'Spec Build (10% Client / 90% Market)',
  };
  return labels[context] || 'Primary Residence';
}

function drawScoreBar(doc, x, y, width, label, score, max) {
  const percentage = (score / max) * 100;
  const barHeight = 8;
  
  // Label
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(label, x, y);
  
  // Score text
  doc.setFont(FONTS.body, 'bold');
  doc.text(`${score}/${max}`, x + width + 5, y);
  
  // Background bar
  doc.setFillColor(...COLORS.border);
  doc.roundedRect(x, y + 2, width, barHeight, 2, 2, 'F');
  
  // Filled bar
  const fillWidth = (percentage / 100) * width;
  const fillColor = percentage >= 80 ? COLORS.success 
                  : percentage >= 65 ? COLORS.warning 
                  : COLORS.error;
  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y + 2, fillWidth, barHeight, 2, 2, 'F');
}
```

---

## Part 3: Data Flow Fix

The report generator needs to receive BAM results from KYMModule. Update the export function:

### In KYMModule.jsx

```jsx
const handleExportReport = async () => {
  setIsExporting(true);
  
  // Calculate BAM results
  const bamResults = calculateBAMScores(
    extractClientData(kycData, fyiData, mvpData),
    normalizeMarketName(locationData?.location),
    portfolioContext
  );
  
  try {
    await generateKYMReport({
      kycData,
      locationData,
      marketData,
      properties,
      demographics,
      personaResults,
      fyiData,
      mvpData,
      // ADD THESE:
      bamResults,
      portfolioContext,
    });
  } catch (error) {
    console.error('Report generation failed:', error);
  } finally {
    setIsExporting(false);
  }
};
```

---

## Summary of Changes Needed

| File | Changes |
|------|---------|
| `KYMDocumentation.jsx` | Add BAM v3.0 sections to all 4 tabs |
| `KYMReportGenerator.js` | Complete rewrite of BAM section with dual scores |
| `KYMModule.jsx` | Pass bamResults and portfolioContext to report generator |
| `BAMScoring.js` | Fix extractClientData() (separate task) |

---

## Testing Checklist

- [ ] Documentation: BAM sections render in all 4 tabs
- [ ] Documentation: Portfolio Context table displays correctly
- [ ] Documentation: Feature Classification quadrants styled properly
- [ ] Report: BAM Summary box appears on Executive Summary page
- [ ] Report: Client Satisfaction breakdown with 5 category bars
- [ ] Report: Top 3 archetypes with Must Have/Nice to Have/Avoid tables
- [ ] Report: Feature Classification section with quadrants
- [ ] Report: Recommendations section with prioritized actions
- [ ] Report: Path to 80% shown for each archetype below threshold
- [ ] Report: Colors match N4S Brand Guide exactly
- [ ] Report: Page breaks occur at appropriate points

---

*End of KYM Documentation & Report Update Specification*
