# Framingham Heart Study — Design Specifications

## 1. Concept & Aesthetic Direction

**Tone:** Clinical-editorial. Think a high-end medical journal crossed with a data newsroom — precise, authoritative, and quietly beautiful. Not cold or sterile, but serious. The kind of tool a cardiologist or epidemiologist would trust.

**Aesthetic keywords:** Off-white paper ground, ink-black type, deep arterial red as the sole accent color, generous whitespace, monospaced numerals, fine hairline rules.

**The unforgettable thing:** The interface feels like an annotated research paper that became interactive. Typography does the heavy lifting — data is presented with the same rigor and restraint as a published study.

---

## 2. Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Application title | DM Serif Display | 28px | 400 |
| Section headings | DM Serif Display | 20px | 400 |
| Chart titles | DM Sans | 14px | 500 |
| Body / labels | DM Sans | 13–14px | 400 |
| Numeric data / stats | DM Mono | 13–24px | 400 |
| Axis tick labels | DM Mono | 11px | 400 |
| Filter control labels | DM Sans | 12px | 400 |

All numerals are rendered in monospaced font so columns align optically. Tracking on the title is slightly loosened (+0.02em). No bold heavier than 500. Serif display is used *only* for headings — never for data or UI controls.

---

## 3. Color System

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#F7F5F0` | Page ground — warm off-white |
| `--bg-surface` | `#FFFFFF` | Card / panel surfaces |
| `--bg-muted` | `#EEECE7` | Alternate row fills, inactive states |
| `--text-primary` | `#1A1916` | Headlines, values |
| `--text-secondary` | `#6B6861` | Labels, axis text, captions |
| `--text-tertiary` | `#A8A59E` | Placeholder, hint text |
| `--accent` | `#B83232` | The only chromatic color — arterial red |
| `--accent-light` | `#F5E4E4` | Accent fills, selected state backgrounds |
| `--accent-muted` | `#D97070` | Secondary data series, hover states |
| `--border` | `rgba(26,25,22,0.12)` | All dividers and card edges |
| `--border-strong` | `rgba(26,25,22,0.25)` | Axis lines, active filter outlines |

### Chart Color Palette (multi-series)

| Series | Hex |
|---|---|
| Primary | `#B83232` |
| 2 | `#3A6B8A` (slate blue) |
| 3 | `#6B8A3A` (olive) |
| 4 | `#8A6B3A` (amber brown) |
| 5 | `#6B3A8A` (plum) |

Never display more than 5 series simultaneously.

---

## 4. Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  MASTHEAD  (title + dataset summary strip)          │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  FILTER  │         MAIN CONTENT AREA                │
│  PANEL   │                                          │
│  (220px) │   [TAB BAR: Overview | Distributions |   │
│          │    Correlations | Risk Analysis]         │
│  sticky  │                                          │
│          │   [CHART REGION — responsive]            │
│          │                                          │
│          │   [STATS STRIP — metric cards]           │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

The filter panel is sticky on scroll. The main content area is the living, reactive part. Tabs switch the active analysis view without losing filter state.

---

## 5. Component Specifications

### Masthead

- Height: 72px
- Left: `DM Serif Display` title "Framingham Heart Study" + subtitle "Longitudinal cardiovascular cohort · 4,240 participants · 1948–present" in `--text-secondary` at 12px DM Mono
- Right: live "n = X" participant count that updates reactively with filters, in `--accent` DM Mono 16px
- Bottom border: 1px `--border-strong`

### Filter Panel

- Width: 220px fixed, full viewport height, sticky
- Background: `--bg-surface`, right border `0.5px --border`
- Sections separated by hairline rules with 12px DM Sans uppercase tracked labels (`letter-spacing: 0.08em`) in `--text-tertiary`

**Filter controls:**

| Control | Type |
|---|---|
| Age range | Dual-handle range slider, `--accent` track fill |
| Sex | Segmented toggle — All / Male / Female |
| Smoker status | Segmented toggle |
| BP medication | Segmented toggle |
| Prevalent hypertension | Toggle |
| CHD outcome | Toggle — Yes / No / All |
| Total cholesterol | Range slider |
| Systolic BP | Range slider |
| BMI | Range slider |

Each slider shows its current range values in DM Mono 11px below the track. A "Reset filters" text link sits at the bottom of the panel in `--accent` at 12px.

### Tab Bar

- 4 tabs: Overview, Distributions, Correlations, Risk Analysis
- Active tab: bottom border `2px --accent`, text `--text-primary` weight 500
- Inactive: `--text-secondary` weight 400
- No background fills on tabs — purely typographic

### Metric Cards (Stats Strip)

- 4-column grid below charts
- Each card: white surface, `0.5px --border`, `border-radius: 8px`, padding `16px`
- Structure: muted 11px DM Mono label → 24px DM Mono value → small delta badge if applicable

| Card | Metric |
|---|---|
| 1 | Mean Age |
| 2 | % with CHD |
| 3 | Mean Systolic BP |
| 4 | Mean Total Cholesterol |

---

## 6. Chart Specifications

### Overview Tab — 2×2 Grid

| Position | Chart | Type |
|---|---|---|
| Top left | CHD prevalence by age group | Grouped bar chart |
| Top right | Systolic BP distribution by sex | Overlapping area chart, 40% opacity fills |
| Bottom left | Smoking status breakdown | Horizontal bar, sorted descending |
| Bottom right | BMI vs. 10-year CHD risk | Scatter plot, colored by sex |

### Distributions Tab

- Variable selector dropdown (14 continuous variables)
- Histogram with KDE overlay (red dashed line)
- Summary stats sidebar: mean, median, std dev, min, max, skewness — all in DM Mono

### Correlations Tab

- Full 12×12 correlation matrix heatmap
- Color scale: `--accent` for positive correlation → white → `#3A6B8A` for negative
- Hover tooltip showing variable pair name + r-value + p-value
- Below heatmap: scatter plot builder — X axis selector, Y axis selector, color-by selector

### Risk Analysis Tab

- Logistic risk factor contribution chart — horizontal bars showing odds ratios with 95% CI whiskers
- Below: interactive "patient profile" — set individual variable values, get predicted 10-year CHD risk percentage displayed as a large circular gauge

---

## 7. Chart Styling Rules

| Property | Value |
|---|---|
| Grid lines | `rgba(26,25,22,0.06)` — horizontal only |
| Axis lines | `--border-strong` on x-axis baseline only; no y-axis line |
| Tick labels | DM Mono 11px, `--text-secondary` |
| Chart background | `--bg-surface` (white) |
| Chart container border-radius | 8px |
| Chart container padding | 20px |
| Scatter point size | 4px radius, 60% opacity, `1px --bg-surface` stroke |

**Tooltips:** white surface, `0.5px --border-strong`, `border-radius: 6px`, DM Mono values, DM Sans labels, no shadow.

**Legend:** custom HTML above chart, 10px colored squares, DM Sans 12px labels. Include value or percentage in each label for categorical charts (pie, donut, single-series bar).

---

## 8. Interaction Model

- All filter changes trigger instant reactive re-render of all visible charts (debounced 80ms)
- Hover on any chart element shows a tooltip with exact values
- Click on a scatter point in Overview sets that point as the "selected subject" — a drawer slides in from the right showing all variables for that participant
- Correlation heatmap cell click populates the scatter builder with those two variables
- Tab transitions: 150ms opacity fade, no slide
- Filter panel sections are collapsible (chevron toggle) to reduce visual noise

---

## 9. Responsive Behavior

| Breakpoint | Change |
|---|---|
| < 768px | Filter panel collapses to a drawer triggered by a hamburger icon in the masthead |
| < 1024px | 2×2 chart grid becomes single column |
| ≥ 1280px | Filter panel expands to 240px; charts gain extra padding |

---

## 10. Data Architecture

### Dataset Fields

`age`, `education`, `sex`, `is_smoking`, `cigs_per_day`, `bp_meds`, `prevalent_stroke`, `prevalent_hyp`, `diabetes`, `tot_chol`, `sys_bp`, `dia_bp`, `bmi`, `heart_rate`, `glucose`, `ten_year_chd`

### Application State Shape

```js
{
  filters: {
    ageMin, ageMax,
    sex,            // 'all' | 'male' | 'female'
    smoker,         // 'all' | 'yes' | 'no'
    bpMeds,         // 'all' | 'yes' | 'no'
    prevalentHyp,   // 'all' | 'yes' | 'no'
    chdOutcome,     // 'all' | 'yes' | 'no'
    cholMin, cholMax,
    sysBpMin, sysBpMax,
    bmiMin, bmiMax
  },
  activeTab: 'overview' | 'distributions' | 'correlations' | 'risk',
  distributionVar: string,
  scatterX: string,
  scatterY: string,
  scatterColor: string,
  selectedSubject: object | null,
  riskProfile: object
}
```

Derived filtered dataset is computed via `useMemo` on filter state. All charts receive the filtered array as their data source. The stats strip recomputes simultaneously.

---

## 11. Motion & Microinteractions

| Trigger | Animation |
|---|---|
| Page load | Masthead fades in (0ms) → filter panel slides in from left (100ms delay) → content area fades up (200ms delay) — CSS only |
| Filter change | Charts animate to new values — Chart.js `animation.duration: 300` |
| Tab switch | Active tab indicator slides horizontally; content fades at 150ms |
| Metric card update | Values count up from previous to new value (JS counter, 300ms) |
| Scatter point hover | Point scales to 1.5× with `transition: r 150ms` |
| Filter reset | Brief `--accent-light` flash on the filter panel before values snap back |
