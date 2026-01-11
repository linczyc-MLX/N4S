# MVP Navigation Structure

## Screen Map

```
MVP Overview (Home)
├── Module Library
│   └── Back → Overview
├── Answer Layout Questions (Personalization)
│   ├── Summary Screen
│   │   └── Back → Overview
│   ├── Detail Screen (per decision)
│   │   └── Back → Summary Screen
│   └── Result Screen
│       └── Back → Summary Screen
├── View Adjacency Matrix
│   └── Back → Overview
├── Run Validation
│   └── Back → Overview
│   ├── Edit Decisions → Personalization
│   └── View Matrix → Adjacency Matrix
├── Briefing Builder
│   └── Back → Overview
└── Tier Data Admin
    └── Back → Overview
```

## Navigation Rules

### 1. Primary Navigation (Top Level)
All MVP sub-screens have a consistent back button that returns to MVP Overview:
- Back button: "Back to MVP Overview"
- Position: Top-left corner, below any module header
- Style: Ghost button with ArrowLeft icon

### 2. Secondary Navigation (Within Screens)
Some screens have internal navigation:

**Layout Questions (Personalization)**
- Summary → Detail: Click on decision card
- Detail → Summary: "All Decisions" back button
- Detail → Detail: Previous/Next buttons
- Summary → Result: "Finalize" button
- Result → Summary: "Edit Decisions" button

**Module Library**
- Expanded → Collapsed: "Back to Module Library" button
- Collapsed → Overview: "Back to Overview" button

### 3. Cross-Screen Navigation
From Validation Results:
- "Edit Decisions" → Goes to Personalization (preserves scroll position)
- "View Adjacency Matrix" → Goes to Comparison Grid

From Comparison Grid:
- "Run Validation" → Goes to Validation Results

### 4. Back Button Standard Implementation

```jsx
<button className="n4s-back-btn" onClick={onBack}>
  <ArrowLeft size={16} />
  Back to MVP Overview
</button>
```

CSS:
```css
.n4s-back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid #e5e5e0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b6b6b;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.15s ease;
}

.n4s-back-btn:hover {
  border-color: #1e3a5f;
  color: #1e3a5f;
}
```

## Components to Update

| Component | Current Back Behavior | Correct Behavior |
|-----------|----------------------|------------------|
| ModuleLibraryView | ✓ Works | ✓ OK |
| AdjacencyPersonalizationView | ✓ "Back to Overview" | ✓ OK |
| AdjacencyComparisonGrid | ✓ "Back" | Update to "Back to MVP Overview" |
| ValidationResultsPanel | ✓ "Back to MVP Overview" | ✓ OK |
| TierDataAdmin | ✓ "Back" | Update to "Back to MVP Overview" |
| BriefingBuilderView | ✓ "Back to Overview" | ✓ OK |

## Implementation Status

- [ ] ModuleLibraryView - OK
- [ ] AdjacencyPersonalizationView - OK  
- [ ] AdjacencyComparisonGrid - Update text
- [ ] ValidationResultsPanel - OK
- [ ] TierDataAdmin - Update text
- [ ] BriefingBuilderView - OK
