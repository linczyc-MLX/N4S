# BAM Implementation - Claude Code Session

**Date:** January 13, 2026  
**Priority:** Full BAM v3.0 Implementation  
**Specification:** `/docs/BAM-METHODOLOGY.md`

---

## Session Setup

```bash
git config --global http.proxy "$HTTPS_PROXY"
git -c http.proxyAuthMethod=basic clone https://[PAT]@github.com/linczyc-MLX/N4S.git
cd N4S
```

> **Note:** Use the PAT token from your memory/userMemories for the clone command.

**Read these docs first:**
- `/docs/BAM-METHODOLOGY.md` — Complete specification
- `/docs/N4S-BRAND-GUIDE.md` — Colors and styling
- `/docs/KYM-SPECIFICATION.md` — Current KYM structure

---

## Implementation Overview

BAM v3.0 requires implementing a **dual scoring system**:

1. **Client Satisfaction Score** (0-100) — Does design serve the client?
2. **Market Appeal Score** (0-100) — Will design appeal to buyers?
3. **Combined Score** — Weighted by Portfolio Context

---

## Files to Modify/Create

### 1. Update `BAMScoring.js`

**Location:** `/src/components/KYM/BAMScoring.js`

**Changes Required:**

```javascript
// ADD: Portfolio weight constants
export const PORTFOLIO_WEIGHTS = {
  'forever-home': { client: 0.70, market: 0.30 },
  'primary-residence': { client: 0.60, market: 0.40 },
  'medium-term': { client: 0.50, market: 0.50 },
  'investment': { client: 0.30, market: 0.70 },
  'spec-build': { client: 0.10, market: 0.90 },
};

// ADD: Market buyer pools
export const MARKET_BUYER_POOLS = {
  'malibu': {
    name: 'Malibu, CA',
    archetypes: [
      { id: 'entertainment', name: 'Entertainment Executive', share: 0.35 },
      { id: 'techExecutive', name: 'Tech Executive', share: 0.28 },
      { id: 'sportsPro', name: 'Sports Professional', share: 0.18 },
      { id: 'other', name: 'Other', share: 0.19 },
    ],
  },
  // Add other markets from spec...
};

// ADD: Client Satisfaction calculation
export function calculateClientSatisfaction(clientData) {
  const scores = {
    spatial: 0,      // 25 points max
    lifestyle: 0,    // 25 points max
    design: 0,       // 20 points max
    location: 0,     // 15 points max
    futureProofing: 0, // 15 points max
  };
  const details = [];

  // Spatial Requirements (25 points)
  // - Room count match (0-5)
  // - Square footage match (0-5)
  // - Flow/adjacencies (0-5)
  // - Indoor-outdoor (0-5)
  // - Storage (0-5)

  // Lifestyle Alignment (25 points)
  // - Entertainment spaces (0-5)
  // - Work-from-home (0-5)
  // - Hobbies (0-5)
  // - Privacy/acoustics (0-5)
  // - Wellness (0-5)

  // Design Aesthetic (20 points)
  // - Architectural style match (0-5)
  // - Interior design (0-5)
  // - Material quality (0-5)
  // - Light/views (0-5)

  // Location Context (15 points)
  // - Commute (0-5)
  // - Schools/amenities (0-5)
  // - Neighborhood (0-5)

  // Future-Proofing (15 points)
  // - Adaptability (0-5)
  // - Technology (0-5)
  // - Sustainability (0-5)

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  
  return {
    percentage: total,
    status: total >= 80 ? 'PASS' : total >= 65 ? 'CAUTION' : 'FAIL',
    breakdown: scores,
    details,
  };
}

// UPDATE: Each persona needs Must Have / Nice to Have / Avoid structure
export const PERSONAS = {
  techExecutive: {
    id: 'techExecutive',
    name: 'Tech Executive',
    shortDesc: 'Technology leaders seeking modern, connected estates',
    icon: 'cpu',
    
    // NEW STRUCTURE:
    mustHaves: [
      { id: 'smart-home', label: 'Smart Home Infrastructure', points: 10, 
        matchCriteria: 'spaces.includes("smartHome") || features.homeAutomation' },
      { id: 'home-office', label: 'Dedicated Home Office', points: 10,
        matchCriteria: 'spaces.includes("homeOffice")' },
      { id: 'contemporary', label: 'Contemporary/Modern Design', points: 10,
        matchCriteria: 'tasteStyle in ["Modern", "Contemporary", "Minimalist"]' },
      { id: 'privacy', label: 'Privacy from Neighbors', points: 10,
        matchCriteria: 'privacy >= "High" || gated' },
      { id: 'ev-charging', label: 'EV Charging + Tech Garage', points: 10,
        matchCriteria: 'spaces.includes("evGarage") || features.evCharging' },
    ],
    
    niceToHaves: [
      { id: 'wellness', label: 'Wellness Suite', points: 7,
        matchCriteria: 'spaces.includes("gym") && spaces.includes("spa")' },
      { id: 'indoor-outdoor', label: 'Indoor-Outdoor Living', points: 7,
        matchCriteria: 'adjacencies.livingToTerrace' },
      { id: 'guest-autonomy', label: 'Guest Autonomy', points: 7,
        matchCriteria: 'features.guestAutonomy === "Full"' },
      { id: 'theater', label: 'Home Theater', points: 7,
        matchCriteria: 'spaces.includes("theater")' },
      { id: 'wine', label: 'Wine Storage', points: 7,
        matchCriteria: 'spaces.includes("wineCellar")' },
    ],
    
    avoids: [
      { id: 'traditional', label: 'Traditional/Ornate Styling', penalty: -15,
        matchCriteria: 'tasteStyle in ["Traditional", "Colonial", "Mediterranean"]' },
      { id: 'high-maintenance', label: 'High-Maintenance Grounds', penalty: -10,
        matchCriteria: 'acreage > 2 && !staffQuarters' },
      { id: 'visible', label: 'Visible from Street', penalty: -10,
        matchCriteria: 'visibility === "High"' },
      { id: 'hoa', label: 'HOA Restrictions', penalty: -10,
        matchCriteria: 'hoa && hoaRestrictive' },
    ],
    
    marketShare: {
      'malibu': 0.28,
      'beverly-hills': 0.25,
      'scottsdale': 0.25,
      'hamptons': 0.20,
      'aspen': 0.10,
      'greenwich': 0.10,
    },
  },
  // ... other personas with same structure
};

// ADD: Calculate archetype score with Must Have/Nice to Have/Avoid
export function calculateArchetypeScore(archetype, clientData) {
  const results = {
    mustHaves: { earned: 0, max: 50, items: [] },
    niceToHaves: { earned: 0, max: 35, items: [] },
    avoids: { penalty: 0, items: [] },
  };

  // Score Must Haves
  archetype.mustHaves.forEach(req => {
    const match = evaluateMatch(clientData, req.matchCriteria);
    const points = match === 'full' ? req.points 
                 : match === 'partial' ? req.points * 0.5 
                 : 0;
    results.mustHaves.earned += points;
    results.mustHaves.items.push({ ...req, match, pointsEarned: points });
  });

  // Score Nice to Haves
  archetype.niceToHaves.forEach(feature => {
    const match = evaluateMatch(clientData, feature.matchCriteria);
    const points = match === 'full' ? feature.points 
                 : match === 'partial' ? feature.points * 0.5 
                 : 0;
    results.niceToHaves.earned += points;
    results.niceToHaves.items.push({ ...feature, match, pointsEarned: points });
  });

  // Apply Avoid Penalties
  archetype.avoids.forEach(avoid => {
    const triggered = evaluateAvoid(clientData, avoid.matchCriteria);
    if (triggered) {
      results.avoids.penalty += Math.abs(avoid.penalty);
      results.avoids.items.push({ ...avoid, triggered: true });
    }
  });

  const earned = results.mustHaves.earned + results.niceToHaves.earned;
  const penalty = results.avoids.penalty;
  const max = results.mustHaves.max + results.niceToHaves.max;
  
  const rawScore = earned - penalty;
  const percentage = Math.max(0, Math.min(100, Math.round((rawScore / max) * 100)));

  return {
    percentage,
    status: percentage >= 80 ? 'PASS' : percentage >= 65 ? 'CAUTION' : 'FAIL',
    breakdown: results,
    gaps: identifyGaps(results),
    pathTo80: calculatePathTo80(percentage, results),
  };
}

// ADD: Main BAM calculation
export function calculateBAMScores(clientData, marketLocation, portfolioContext) {
  // 1. Client Satisfaction
  const clientScore = calculateClientSatisfaction(clientData);
  
  // 2. Get buyer pool for market
  const buyerPool = MARKET_BUYER_POOLS[marketLocation] || MARKET_BUYER_POOLS['malibu'];
  
  // 3. Score each archetype
  const archetypeScores = buyerPool.archetypes.map(arch => {
    const persona = PERSONAS[arch.id];
    if (!persona) return { ...arch, score: { percentage: 50 } };
    
    const score = calculateArchetypeScore(persona, clientData);
    return {
      ...arch,
      ...persona,
      score,
      weightedContribution: score.percentage * arch.share,
    };
  });
  
  // 4. Market Appeal = weighted average
  const marketPercentage = Math.round(
    archetypeScores.reduce((sum, a) => sum + a.weightedContribution, 0)
  );
  
  // 5. Combined score
  const weights = PORTFOLIO_WEIGHTS[portfolioContext] || PORTFOLIO_WEIGHTS['primary-residence'];
  const combinedScore = Math.round(
    (clientScore.percentage * weights.client) + (marketPercentage * weights.market)
  );
  
  // 6. Feature classification
  const featureClassification = classifyFeatures(clientData, archetypeScores);
  
  return {
    clientSatisfaction: clientScore,
    marketAppeal: {
      percentage: marketPercentage,
      status: marketPercentage >= 80 ? 'PASS' : marketPercentage >= 65 ? 'CAUTION' : 'FAIL',
      archetypes: archetypeScores.sort((a, b) => b.score.percentage - a.score.percentage),
    },
    combined: {
      score: combinedScore,
      status: combinedScore >= 80 ? 'PASS' : combinedScore >= 65 ? 'CAUTION' : 'FAIL',
      clientContribution: Math.round(clientScore.percentage * weights.client),
      marketContribution: Math.round(marketPercentage * weights.market),
      weights,
    },
    portfolioContext,
    featureClassification,
  };
}
```

---

### 2. Update `BAMComponents.jsx`

**Location:** `/src/components/KYM/BAMComponents.jsx`

**New Components Needed:**

```jsx
// 1. Dual Score Summary
export const BAMSummary = ({ clientScore, marketScore, combined, portfolioContext }) => {
  return (
    <div className="bam-summary">
      <div className="bam-dual-scores">
        <ScoreGauge 
          label="Client Satisfaction"
          score={clientScore.percentage}
          status={clientScore.status}
          subtitle="Does this serve YOUR needs?"
        />
        <ScoreGauge 
          label="Market Appeal"
          score={marketScore.percentage}
          status={marketScore.status}
          subtitle="Will buyers want this?"
        />
      </div>
      
      <PortfolioContextDisplay context={portfolioContext} weights={combined.weights} />
      
      <CombinedScoreBar 
        score={combined.score}
        status={combined.status}
        clientContribution={combined.clientContribution}
        marketContribution={combined.marketContribution}
      />
    </div>
  );
};

// 2. Portfolio Context Selector
export const PortfolioContextSelector = ({ value, onChange }) => {
  const options = [
    { id: 'forever-home', label: 'Forever Home', desc: '15+ year hold' },
    { id: 'primary-residence', label: 'Primary Residence', desc: '10-15 years' },
    { id: 'medium-term', label: 'Medium Term', desc: '5-10 years' },
    { id: 'investment', label: 'Investment', desc: '<5 years' },
    { id: 'spec-build', label: 'Spec Build', desc: 'Build to sell' },
  ];
  
  return (
    <div className="portfolio-context-selector">
      <label>Portfolio Context</label>
      <div className="context-slider">
        {options.map(opt => (
          <button 
            key={opt.id}
            className={value === opt.id ? 'active' : ''}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. Archetype Score Card with Must Have/Nice to Have/Avoid
export const ArchetypeScoreCard = ({ archetype, expanded, onToggle }) => {
  const { score } = archetype;
  
  return (
    <div className="archetype-card">
      <div className="archetype-header" onClick={onToggle}>
        <div className="archetype-name">{archetype.name}</div>
        <div className="archetype-score">
          <span className={`score-badge ${score.status.toLowerCase()}`}>
            {score.percentage}%
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="archetype-detail">
          {/* Must Haves Table */}
          <div className="score-section">
            <h4>Must Haves ({score.breakdown.mustHaves.earned}/{score.breakdown.mustHaves.max})</h4>
            <table>
              <thead>
                <tr><th>Requirement</th><th>Status</th><th>Points</th></tr>
              </thead>
              <tbody>
                {score.breakdown.mustHaves.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.label}</td>
                    <td><MatchIcon match={item.match} /></td>
                    <td>{item.pointsEarned}/{item.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Nice to Haves Table */}
          <div className="score-section">
            <h4>Nice to Haves ({score.breakdown.niceToHaves.earned}/{score.breakdown.niceToHaves.max})</h4>
            {/* Similar table */}
          </div>
          
          {/* Avoids */}
          {score.breakdown.avoids.items.length > 0 && (
            <div className="score-section avoids">
              <h4>Avoids (Penalty: -{score.breakdown.avoids.penalty})</h4>
              {/* Triggered avoids list */}
            </div>
          )}
          
          {/* Path to 80% */}
          <PathTo80 recommendations={score.pathTo80} currentScore={score.percentage} />
        </div>
      )}
    </div>
  );
};

// 4. Feature Classification Panel
export const FeatureClassificationPanel = ({ classification }) => {
  return (
    <div className="feature-classification">
      <div className="category essential">
        <h4>Essential (Must Include)</h4>
        {classification.essential.map(f => <FeatureChip key={f.id} feature={f} />)}
      </div>
      <div className="category differentiating">
        <h4>Differentiating (Premium Value)</h4>
        {classification.differentiating.map(f => <FeatureChip key={f.id} feature={f} />)}
      </div>
      <div className="category personal">
        <h4>Personal (Limited Market)</h4>
        {classification.personal.map(f => <FeatureChip key={f.id} feature={f} />)}
      </div>
      <div className="category risky">
        <h4>Risky (Reconsider)</h4>
        {classification.risky.map(f => <FeatureChip key={f.id} feature={f} />)}
      </div>
    </div>
  );
};

// 5. Path to 80% Recommendations
export const PathTo80 = ({ recommendations, currentScore }) => {
  if (currentScore >= 80) {
    return <div className="path-to-80 achieved">✓ Score meets 80% threshold</div>;
  }
  
  const gap = 80 - currentScore;
  
  return (
    <div className="path-to-80">
      <h4>Path to 80% (Gap: {gap} points)</h4>
      <ol>
        {recommendations.map((rec, i) => (
          <li key={i}>
            <span className="action">{rec.action}</span>
            <span className="impact">+{rec.points} pts</span>
            {rec.difficulty === 'Easy' && <span className="tag easy">★ Easiest</span>}
          </li>
        ))}
      </ol>
    </div>
  );
};
```

---

### 3. Update `KYMModule.jsx` BAM Tab

**Location:** `/src/components/KYM/KYMModule.jsx`

Find the BAM tab section and update to use new components:

```jsx
// In the BAM tab render section:

const [portfolioContext, setPortfolioContext] = useState('primary-residence');
const [expandedArchetype, setExpandedArchetype] = useState(null);

// Calculate BAM scores
const bamResults = useMemo(() => {
  if (!kycData || !locationData) return null;
  
  const clientData = extractClientData(kycData, fyiData, mvpData);
  const market = normalizeMarketName(locationData.location);
  
  return calculateBAMScores(clientData, market, portfolioContext);
}, [kycData, fyiData, mvpData, locationData, portfolioContext]);

// Render
{activeTab === 'bam' && (
  <div className="kym-bam-tab">
    {!bamResults ? (
      <EmptyState message="Complete KYC, FYI, and MVP modules to see alignment analysis" />
    ) : (
      <>
        {/* Dual Score Summary */}
        <BAMSummary 
          clientScore={bamResults.clientSatisfaction}
          marketScore={bamResults.marketAppeal}
          combined={bamResults.combined}
          portfolioContext={portfolioContext}
        />
        
        {/* Portfolio Context Selector */}
        <PortfolioContextSelector 
          value={portfolioContext}
          onChange={setPortfolioContext}
        />
        
        {/* Market Buyer Pool */}
        <div className="market-buyer-pool">
          <h3>Market Buyer Pool — {locationData.location}</h3>
          <BuyerPoolChart archetypes={bamResults.marketAppeal.archetypes} />
        </div>
        
        {/* Top Archetypes */}
        <div className="archetype-cards">
          {bamResults.marketAppeal.archetypes.slice(0, 3).map(arch => (
            <ArchetypeScoreCard 
              key={arch.id}
              archetype={arch}
              expanded={expandedArchetype === arch.id}
              onToggle={() => setExpandedArchetype(
                expandedArchetype === arch.id ? null : arch.id
              )}
            />
          ))}
        </div>
        
        {/* Feature Classification */}
        <FeatureClassificationPanel 
          classification={bamResults.featureClassification}
        />
      </>
    )}
  </div>
)}
```

---

### 4. Add CSS Styles

**Location:** `/src/components/KYM/KYMModule.css`

Add these styles for BAM components:

```css
/* BAM Summary */
.bam-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.bam-dual-scores {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.score-gauge {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.score-gauge .score-value {
  font-size: 48px;
  font-weight: 700;
}

.score-gauge.pass .score-value { color: #059669; }
.score-gauge.caution .score-value { color: #d97706; }
.score-gauge.fail .score-value { color: #dc2626; }

/* Portfolio Context */
.portfolio-context-selector {
  margin: 20px 0;
}

.context-slider {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.context-slider button {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.context-slider button.active {
  border-color: #1e3a5f;
  background: #1e3a5f;
  color: white;
}

/* Archetype Cards */
.archetype-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.archetype-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: #f8f9fa;
}

.score-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
}

.score-badge.pass { background: #d1fae5; color: #059669; }
.score-badge.caution { background: #fef3c7; color: #d97706; }
.score-badge.fail { background: #fee2e2; color: #dc2626; }

.archetype-detail {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.score-section {
  margin-bottom: 20px;
}

.score-section table {
  width: 100%;
  border-collapse: collapse;
}

.score-section th, .score-section td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

/* Match Icons */
.match-icon.full { color: #059669; }
.match-icon.partial { color: #d97706; }
.match-icon.none { color: #9ca3af; }

/* Path to 80% */
.path-to-80 {
  background: #eff6ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.path-to-80 ol {
  margin: 12px 0 0 0;
  padding-left: 20px;
}

.path-to-80 li {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.path-to-80 .impact {
  font-weight: 600;
  color: #059669;
}

.path-to-80 .tag.easy {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Feature Classification */
.feature-classification {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.feature-classification .category {
  padding: 16px;
  border-radius: 8px;
}

.category.essential { background: #d1fae5; }
.category.differentiating { background: #dbeafe; }
.category.personal { background: #fef3c7; }
.category.risky { background: #fee2e2; }
```

---

### 5. Update Report Generator

**Location:** `/src/components/KYM/KYMReportGenerator.js`

Add BAM section to PDF report with dual scores and archetype details.

---

## Data Flow Reference

### Client Data Extraction

```javascript
function extractClientData(kycData, fyiData, mvpData) {
  return {
    // From KYC
    budget: kycData?.principal?.portfolioContext?.budget,
    familyComposition: kycData?.principal?.portfolioContext?.familyComposition,
    staffCount: kycData?.principal?.operatingModel?.staffCount,
    privacy: kycData?.principal?.siteRequirements?.privacy,
    qualityTier: kycData?.principal?.portfolioContext?.qualityTier,
    planningHorizon: kycData?.principal?.portfolioContext?.planningHorizon,
    entertainingStyle: kycData?.principal?.lifestyle?.entertainingStyle,
    workStyle: kycData?.principal?.lifestyle?.workStyle,
    
    // From FYI
    tasteStyle: kycData?.principal?.designIdentity?.tasteResults?.dominant ||
                fyiData?.styleProfile?.dominant,
    spaces: fyiData?.spaces || [],
    totalSqFt: fyiData?.totalSquareFootage,
    bedroomCount: fyiData?.rooms?.bedrooms?.count,
    
    // From MVP
    adjacencies: mvpData?.adjacencies || [],
    rooms: mvpData?.rooms || [],
    guestAutonomy: mvpData?.features?.guestAutonomy,
    indoorOutdoorFlow: mvpData?.adjacencies?.some(a => a.outdoor),
    
    // Derived
    hasStaffQuarters: fyiData?.spaces?.some(s => s.name?.includes('Staff')),
    hasTheater: fyiData?.spaces?.some(s => s.name?.includes('Theater')),
    hasWineCellar: fyiData?.spaces?.some(s => s.name?.includes('Wine')),
    hasGym: fyiData?.spaces?.some(s => s.name?.includes('Gym')),
    hasSpa: fyiData?.spaces?.some(s => s.name?.includes('Spa') || s.name?.includes('Steam')),
    hasPool: fyiData?.spaces?.some(s => s.name?.includes('Pool')),
  };
}
```

---

## Testing Checklist

- [ ] Client Satisfaction score calculates correctly (0-100)
- [ ] Market Appeal score weights archetypes by market share
- [ ] Portfolio Context slider updates combined score
- [ ] Archetype cards show Must Have / Nice to Have / Avoid breakdown
- [ ] Path to 80% generates actionable recommendations
- [ ] Feature Classification assigns features to quadrants
- [ ] PDF report includes full BAM section
- [ ] All status indicators (PASS/CAUTION/FAIL) display correctly

---

## Brand Colors (from N4S-BRAND-GUIDE.md)

```css
--navy: #1e3a5f;
--gold: #c9a227;
--success: #059669;
--warning: #d97706;
--error: #dc2626;
--kym-header: #E4C0BE;
```

---

## Commit Message Template

```
[KYM] Implement BAM v3.0 dual scoring system

- Add Client Satisfaction Score (5 categories, 100 points)
- Add Market Appeal Score (archetype weighting)
- Add Portfolio Context selector with weighting
- Add Must Have / Nice to Have / Avoid scoring
- Add Feature Classification (Essential/Differentiating/Personal/Risky)
- Add Path to 80% recommendations
- Update BAM UI components
- Add BAM section to PDF report
```

---

## Questions for User

1. Where should Portfolio Context be captured? (KYC module or BAM tab?)
2. Should we add a Trade-off Matrix visualization in Phase 1 or Phase 2?

---

*End of Implementation Brief*
