# N4S Brand Guide

> **Document Purpose**: Define visual standards, design patterns, and brand consistency rules for all N4S platform interfaces and generated reports.
> **Version**: 1.0
> **Last Updated**: January 6, 2026

---

## 1. Brand Essence

**N4S (Not For Sale)** is a luxury residential advisory platform serving ultra-high-net-worth families and family offices. Every visual element must communicate:

- **Sophistication** — Refined, never flashy
- **Trust** — Professional, established, credible
- **Clarity** — Information presented cleanly without clutter
- **Warmth** — Approachable luxury, not cold minimalism

The visual language should feel like a private banking report or a luxury hotel's guest materials — understated elegance with meticulous attention to detail.

---

## 2. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **N4S Navy** | `#1e3a5f` | 30, 58, 95 | Primary brand color. Headers, primary buttons, key UI elements |
| **N4S Gold** | `#c9a227` | 201, 162, 39 | Accent color. CTAs, highlights, selected states, arrival indicators |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Background** | `#fafaf8` | 250, 250, 248 | Page backgrounds, subtle warmth |
| **Surface** | `#ffffff` | 255, 255, 255 | Cards, panels, content areas |
| **Border** | `#e5e5e0` | 229, 229, 224 | Dividers, card borders, separators |
| **Text** | `#1a1a1a` | 26, 26, 26 | Primary text, headings |
| **Text Muted** | `#6b6b6b` | 107, 107, 107 | Secondary text, labels, hints |
| **Accent Light** | `#f5f0e8` | 245, 240, 232 | Highlighted sections, KYC banners |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#2e7d32` | Positive states, completion, green lights |
| **Warning** | `#f57c00` | Caution states, amber lights |
| **Error** | `#d32f2f` | Error states, red lights, over-budget |
| **Info** | `#1976d2` | Informational highlights |

### Color Usage Rules

1. **Navy is dominant** — Use for headers, navigation, primary actions
2. **Gold is precious** — Use sparingly for emphasis, never for large areas
3. **White space is intentional** — Let content breathe
4. **Warm backgrounds** — Use `#fafaf8` not pure white for page backgrounds
5. **Never use** — Bright saturated colors, gradients, or drop shadows

---

## 3. Typography

### Font Families

| Role | Font | Fallback Stack |
|------|------|----------------|
| **Display / Headings** | Playfair Display | Georgia, serif |
| **Body / UI** | Inter | -apple-system, BlinkMacSystemFont, sans-serif |

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| **H1 - Page Title** | Playfair Display | 1.5rem (24px) | 500 | 1.3 | -0.01em |
| **H2 - Section Title** | Playfair Display | 1.25rem (20px) | 500 | 1.3 | -0.01em |
| **H3 - Card Title** | Inter | 1rem (16px) | 600 | 1.4 | 0 |
| **H4 - Subsection** | Inter | 0.875rem (14px) | 600 | 1.4 | 0 |
| **Body** | Inter | 0.875rem (14px) | 400 | 1.5 | 0 |
| **Body Small** | Inter | 0.8125rem (13px) | 400 | 1.5 | 0 |
| **Caption** | Inter | 0.75rem (12px) | 400 | 1.4 | 0 |
| **Label** | Inter | 0.75rem (12px) | 500 | 1.2 | 0.02em |
| **Overline** | Inter | 0.6875rem (11px) | 600 | 1.2 | 0.05em |

### Typography Rules

1. **Playfair for personality** — Only for main headings, not UI labels
2. **Inter for clarity** — All functional text, buttons, labels, body copy
3. **Never all-caps for headings** — Use sentence case or title case
4. **All-caps only for overlines** — Small labels like "FROM KYC" or "TOTALS"
5. **No bold body text** — Use font-weight 500 (medium) for emphasis, not 700

---

## 4. Spacing System

### Base Unit

All spacing derives from a 4px base unit.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps, icon padding |
| `sm` | 8px | Related elements, compact lists |
| `md` | 16px | Standard gaps, card padding |
| `lg` | 24px | Section separation |
| `xl` | 32px | Major sections |
| `2xl` | 48px | Page margins |

### Spacing Rules

1. **Consistent card padding** — 1rem (16px) on all sides
2. **Section gaps** — 1.5rem (24px) between major sections
3. **Related elements** — 0.5rem (8px) gap
4. **Form fields** — 1rem (16px) gap between fields
5. **Button padding** — 0.5rem 1rem (8px 16px) for standard buttons

---

## 5. Component Patterns

### Buttons

**Primary Button**
```css
background: #1e3a5f;
color: white;
padding: 0.5rem 1.25rem;
border-radius: 6px;
font-size: 0.875rem;
font-weight: 500;
border: none;
```

**Secondary Button**
```css
background: transparent;
color: #1e3a5f;
padding: 0.5rem 1.25rem;
border-radius: 6px;
font-size: 0.875rem;
font-weight: 500;
border: 1px solid #e5e5e0;
```

**Ghost Button**
```css
background: transparent;
color: #6b6b6b;
padding: 0.5rem 1rem;
border: none;
font-size: 0.875rem;
```

**Button States**
- Hover: Slightly darker background or border color change
- Active: Navy background for toggles/selections
- Disabled: 50% opacity, no cursor pointer

### Cards

```css
background: white;
border: 1px solid #e5e5e0;
border-radius: 8px;
padding: 1rem;
```

- No drop shadows
- Subtle border only
- 8px border radius standard

### Form Inputs

```css
background: white;
border: 1px solid #e5e5e0;
border-radius: 4px;
padding: 0.5rem 0.75rem;
font-size: 0.875rem;
```

- Focus state: Navy border, subtle navy box-shadow
- Error state: Red border
- Labels above inputs, not inline

### Toggles / Switches

```css
/* Track */
width: 40px;
height: 22px;
background: #e5e5e0;
border-radius: 11px;

/* Thumb */
width: 18px;
height: 18px;
background: white;
border-radius: 50%;

/* Active state */
background: #1e3a5f; /* Track turns navy */
```

### Progress Bars

```css
/* Track */
height: 8px;
background: #e5e5e0;
border-radius: 4px;

/* Fill */
background: #1e3a5f;
border-radius: 4px;

/* Over-target state */
background: #d32f2f; /* Red when exceeded */
```

### Selection Chips / Tier Buttons

```css
/* Inactive */
background: #fafaf8;
border: 1px solid #e5e5e0;
color: #6b6b6b;

/* Active */
background: #1e3a5f;
border: 1px solid #1e3a5f;
color: white;
```

---

## 6. Layout Patterns

### Three-Column Module Layout

The standard N4S module uses a three-panel layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: Module Title + Subtitle                          [Actions] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌─────────────────────────────────┐  ┌───────────┐  │
│  │          │  │                                 │  │           │  │
│  │   LEFT   │  │          CENTER                 │  │   RIGHT   │  │
│  │  SIDEBAR │  │         CONTENT                 │  │  SIDEBAR  │  │
│  │          │  │                                 │  │           │  │
│  │  240px   │  │          Flexible               │  │   320px   │  │
│  │          │  │                                 │  │           │  │
│  └──────────┘  └─────────────────────────────────┘  └───────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- **Left Sidebar**: Navigation, zone stepper, structure selector
- **Center**: Primary content area, card grids
- **Right Sidebar**: Totals, settings, actions

### Card Grid

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1rem;
```

### Section Hierarchy

```
Module Header
├── Title (H1 - Playfair)
├── Subtitle (Body - Inter muted)
└── Context Banner (if applicable)

Left Sidebar
├── Component 1
├── Component 2
└── Navigation

Center Content
├── Section Header (H2 - Playfair)
├── Section Stats (Caption)
└── Card Grid

Right Sidebar
├── Panel Title (H3 - Inter)
├── Settings
├── Totals
└── Actions
```

---

## 7. Report Standards

### Report Header

Every PDF report includes:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ████████████████████████████████████████████████████████████████████│  ← Navy bar (full width)
│                                                                     │
│  N4S                                           [Report Type]        │
│  Luxury Residential Advisory                   [Date]               │
│                                                                     │
│  Project: [Project Name]                                            │
│  Client: [Client Name]                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Report Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Report Title | Playfair Display | 18pt | Medium |
| Section Header | Inter | 14pt | SemiBold |
| Body Text | Inter | 11pt | Regular |
| Table Headers | Inter | 10pt | SemiBold |
| Table Body | Inter | 10pt | Regular |
| Captions | Inter | 9pt | Regular |
| Footer | Inter | 8pt | Regular |

### Report Footer

```
────────────────────────────────────────────────────────────────────────
(C) 2026 Not4Sale LLC - Luxury Residential Advisory              Page X of Y
```

### Sliders in Reports

**Correct Format:**
```
Label Text
├─────────●───────────┤
Low                High
```

- Label ABOVE the slider track
- Endpoint labels BELOW the slider track
- NO tick marks on the track itself
- Selected position shown as filled circle

**Incorrect:**
- Tick marks cluttering the track ✗
- Labels on the sides ✗
- Numbers along the track ✗

### Tables in Reports

```css
/* Header row */
background: #f5f0e8;
font-weight: 600;
text-align: left;
padding: 8px 12px;

/* Body rows */
border-bottom: 1px solid #e5e5e0;
padding: 8px 12px;

/* Alternating rows - OPTIONAL */
background: #fafaf8; /* Every other row */
```

### Traffic Light System

For status indicators in reports:

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Green | Success green | `#2e7d32` | Aligned, complete, on-track |
| Amber | Warning orange | `#f57c00` | Needs attention, partial |
| Red | Error red | `#d32f2f` | Misaligned, incomplete, over-budget |

Display as:
- Filled circles (●) for current state
- Small squares in tables
- Never use emoji ✅❌

---

## 8. Iconography

### Icon Style

- Use Lucide React icons (or similar line icon set)
- Stroke width: 2px
- Size: 16px (small), 20px (medium), 24px (large)
- Color: Inherit from text color

### Common Icons

| Action | Icon |
|--------|------|
| Add | Plus |
| Remove | Trash2 |
| Edit | Pencil |
| View | Eye |
| Download | Download |
| Export PDF | FileText |
| Settings | Settings |
| Navigate | ChevronRight |
| Expand | ChevronDown |
| Home | Home |
| Building | Building2 |
| Level | Layers |

### Icon Usage Rules

1. **Icons accompany text** — Don't use icon-only buttons without tooltips
2. **Consistent sizing** — 16px for inline, 20px for buttons
3. **Match text color** — Icons inherit color from adjacent text
4. **Sufficient spacing** — 8px gap between icon and text

---

## 9. Motion & Interaction

### Transitions

```css
transition: all 0.15s ease;
```

- Use for hover states, focus states, toggle changes
- Keep transitions fast (150ms or less)
- No bouncy or playful animations

### Hover States

- Buttons: Slight darken or background change
- Cards: Subtle border color change (not lift/shadow)
- Links: Underline or color change

### Focus States

```css
outline: none;
box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.2);
border-color: #1e3a5f;
```

---

## 10. Do's and Don'ts

### DO ✓

- Use the established color palette exactly
- Maintain consistent spacing throughout
- Keep layouts clean with ample white space
- Use Playfair Display only for main headings
- Test reports print correctly (margins, page breaks)
- Reference this guide before creating new components

### DON'T ✗

- Invent new colors or use variations of palette colors
- Add drop shadows to cards or elements
- Use gradients anywhere
- Mix multiple heading fonts
- Add decorative elements (swooshes, patterns)
- Use emoji in professional reports
- Add unnecessary tick marks or visual noise
- Make buttons or interactive elements too small
- Forget hover/focus states on interactive elements

---

## 11. CSS Variables Reference

```css
:root {
  /* Colors */
  --n4s-navy: #1e3a5f;
  --n4s-gold: #c9a227;
  --color-background: #fafaf8;
  --color-surface: #ffffff;
  --color-border: #e5e5e0;
  --color-text: #1a1a1a;
  --color-text-muted: #6b6b6b;
  --color-accent-light: #f5f0e8;
  --color-success: #2e7d32;
  --color-warning: #f57c00;
  --color-error: #d32f2f;
  
  /* Typography */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

---

## 12. Checklist for New Components

Before creating any new UI component or report template, verify:

- [ ] Colors match palette exactly (use CSS variables)
- [ ] Typography follows the type scale
- [ ] Spacing uses the spacing system
- [ ] Interactive elements have hover/focus states
- [ ] Layout follows established patterns
- [ ] No drop shadows, gradients, or decorative elements
- [ ] Reports follow header/footer standards
- [ ] Sliders have label above, endpoints below, no tick marks
- [ ] Consistent with existing similar components
- [ ] Tested at different viewport sizes (if responsive)

---

## 13. Module Color System

Each N4S module has an assigned color that appears in the Task Matrix and module header bars. These colors help users understand where they are in the workflow.

**Palette: Soft Pillow**

| Module | Letter | Color Name | Background | Text |
|--------|--------|------------|------------|------|
| Dashboard | — | Navy | `#1e3a5f` | `#ffffff` |
| KYC | A | Deep Blue | `#315098` | `#ffffff` |
| KYS | — | Copper | `#C4A484` | `#1a1a1a` |
| FYI | C | Steel Blue | `#8CA8BE` | `#1a1a1a` |
| MVP | M | Sage Green | `#AFBDB0` | `#1a1a1a` |
| KYM | B | Dusty Rose | `#E4C0BE` | `#1a1a1a` |
| VMX | D | Light Pink | `#FBD0E0` | `#1a1a1a` |
| Settings | — | Gray | `#374151` | `#ffffff` |

### Module Header Implementation

Each module's top header bar uses a solid background color with appropriate text contrast:

```css
/* Example: FYI Module Header (light background) */
.main-header {
  background: #8CA8BE;
}

.main-header__module {
  color: #1a1a1a;
}

/* Example: KYC Module Header (dark background) */
.main-header {
  background: #315098;
}

.main-header__module {
  color: #ffffff;
}
```

### Task Matrix Cells

Task Matrix cells use the same color mapping:
- Background matches module color
- Text uses contrasting color for readability
- Completed cells show checkmark in module color

---

## 14. Documentation PDF Standards

All module documentation PDFs are generated using **ReportLab** with native text rendering (no html2canvas/screenshots). PDFs are pre-built and served as static files from `public/docs/`.

### Generator Script

- **Location**: `generate_all_docs_pdfs.py` (kept outside repo, run locally to regenerate)
- **Fonts required**: Playfair Display (400/500/600/700), Inter (Regular/Medium/SemiBold/Bold) as `.ttf` files
- **Output**: `public/docs/N4S-{MODULE}-Documentation.pdf` (7 files: Dashboard, KYC, FYI, MVP, KYM, KYS, VMX)

### Page Setup

| Property | Value |
|----------|-------|
| Page size | A4 (595 × 842 pt) |
| Margins | Left 25mm, Right 25mm, Top 30mm, Bottom 20mm |
| Content width | ~145mm (410 pt) |

### Cover Page

Each PDF starts with a branded cover page (no header/footer):
- Gold rule (80pt wide, 1.5pt thick) at top
- Module title in Playfair Display Bold 24pt, navy
- Subtitle in Inter Regular 13pt, muted
- Gold divider
- Metadata: Date, Author "Not4Sale LLC", Document type "Documentation Guide"
- Footer rule with copyright

### Header & Footer (pages 2+)

**Header**: Navy bar (full width, 22pt tall) with:
- Left: "N4S" in Inter Bold 7pt white
- Right: Module subtitle in Inter Regular 7pt white
- Module-specific Soft Pillow accent stripe (3pt tall) below navy bar

**Footer**: Navy bar (14pt tall) at bottom with:
- Left: Copyright `© 2026 Not4Sale LLC — Luxury Residential Advisory`
- Right: `Page X`
- Both in Inter Regular 6.5pt white

### Section Structure

Every documentation PDF follows the 4-tab structure:
1. **Overview** — What the module does and why
2. **Workflow** — Step-by-step process
3. **Gates & Validation** — Quality checkpoints and rules
4. **Reference** — Terminology, codes, glossary

### Custom Flowables

| Flowable | Description |
|----------|-------------|
| `GoldRule(width)` | Gold horizontal line, 1.5pt thick, centered |
| `NavyHeaderBar(text)` | Full-width navy bar with white text, acts as section divider |
| `CardBox(flowables)` | Bordered content box with Soft Pillow accent left border (3pt) and light background |

### Typography in PDFs

| Element | Font | Size | Color |
|---------|------|------|-------|
| Cover title | Playfair Bold | 24pt | Navy |
| Section title (h2) | Playfair SemiBold | 15pt | Navy |
| Subsection (h3) | Playfair Medium | 12pt | Navy |
| Sub-subsection (h4) | Inter SemiBold | 10pt | Navy |
| Body text | Inter Regular | 9.5pt | `#1a1a1a` |
| Muted text | Inter Regular | 9pt | `#6b6b6b` |
| Table header | Inter SemiBold | 8.5pt | Navy on `#f5f0e8` |
| Table body | Inter Regular | 8.5pt | `#1a1a1a` |
| Bullet text | Inter Regular | 9pt | `#1a1a1a` |

### Orphan Protection (Bottom-Quarter Rule)

- **h2 headings**: `CondPageBreak(PAGE_H * 0.25)` — forces new page if less than 25% of page remains
- **h3 headings**: `CondPageBreak(PAGE_H * 0.20)` — forces new page if less than 20% remains
- Prevents orphaned headings at page bottom

### Module Accent Colors in PDFs

Same Soft Pillow palette as UI (see Section 13). Used for:
- Header accent stripe below navy bar
- CardBox left border
- Cover page accent elements

### Table Styling

```python
# Header row: navy text on warm cream background
('BACKGROUND', (0, 0), (-1, 0), HexColor('#f5f0e8'))
('TEXTCOLOR', (0, 0), (-1, 0), NAVY)
('FONTNAME', (0, 0), (-1, 0), 'InterSB')

# Body rows: alternating white/#fafaf8
('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#fafaf8')])

# Grid: light borders
('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e0e0e0'))
```

### Regenerating PDFs

To regenerate after content changes in `*Documentation.jsx` files:
1. Extract updated content from JSX into Python builder functions
2. Run `python3 generate_all_docs_pdfs.py` with fonts in same directory
3. Copy output PDFs to `public/docs/`
4. Commit and push — GitHub Actions auto-deploys

### Export Button Integration

Each `*Documentation.jsx` component has a simple download handler:
```javascript
const handleExportPdf = () => {
  const link = document.createElement('a');
  link.href = '/docs/N4S-{MODULE}-Documentation.pdf';
  link.download = 'N4S-{MODULE}-Documentation.pdf';
  link.click();
};
```

No runtime dependencies (html2canvas, jsPDF) required. The old `docsPdfExport.js` utility is no longer imported by any component.

---

## Appendix A: Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-06 | 1.0 | Initial brand guide created |
| 2026-01-06 | 1.1 | Added Module Color System (Section 13) |
| 2026-01-11 | 1.2 | Updated Module Colors to Soft Pillow palette |
| 2026-01-13 | 1.3 | Added KYS (Know Your Site) module with Copper color |
| 2026-02-14 | 1.4 | Added Documentation PDF Standards (Section 14) — ReportLab generation, typography, flowables, orphan protection |

---

## Appendix B: Quick Reference Card

### Colors (Copy-Paste)
```
Navy:       #1e3a5f
Gold:       #c9a227
Teal:       #319795
Background: #fafaf8
Border:     #e5e5e0
Text:       #1a1a1a
Text Muted: #6b6b6b
```

### Fonts
```
Headings: font-family: 'Playfair Display', Georgia, serif;
Body:     font-family: 'Inter', -apple-system, sans-serif;
```

### Report Sliders
```
[Label Text]
├─────────●───────────┤
Low                High
```
- Label ABOVE track
- Endpoints BELOW track
- NO tick marks

---

*This guide is the source of truth for N4S visual standards. When in doubt, reference this document. When adding new patterns, update this document.*
