# FastHaul Ops – Color Theme & Palette Recommendations

**Dashboard Type:** Trucking / Fleet Management ERP (TMS + Payroll + Dispatch)  
**Current Style:** Full dark mode with yellow/amber accent  
**Compiled:** August 2026  

This document consolidates research-backed color recommendations for the FastHaul Ops dashboard. It prioritizes long-session comfort, operational clarity under pressure, accessibility, and modern 2025–2026 dark-mode best practices for logistics and fleet software.

---

## 1. Design Principles for Trucking ERP Dashboards

| Principle | Recommendation | Why It Matters |
|-----------|----------------|---------------|
| Avoid pure black | Use true dark greys / soft navy (`#0B0F19` – `#12141C`) | Pure `#000` causes eye strain and halation during long shifts |
| Layered elevation | 3–4 surface levels via lightness, not heavy shadows | Creates hierarchy without visual noise |
| Limited saturated accents | 1 primary brand accent + semantic colors only | Prevents visual fatigue on dense data screens |
| Semantic status colors | Strict RAG (Red-Amber-Green) + blue for info | Instant recognition for dispatchers and managers |
| Desaturated chart colors | Slightly muted, higher lightness on dark backgrounds | Better readability and lower eye strain |
| Accessibility first | WCAG AA minimum (4.5:1 text), test for color blindness | ~8% of male users have red-green deficiency |

**Key research consensus (2025–2026):**
- True grey base surfaces outperform pure black for long-session dashboards.
- Semantic colors (success / warning / danger) must remain highly distinguishable.
- Chart palettes should be designed *for* dark mode, not simply inverted from light mode.
- Yellow/amber works exceptionally well as a primary accent in operational systems because it signals urgency without the aggression of pure red.

---

## 2. Recommended Color Systems

### Option A – Refined Current Direction (Recommended)

Keep the existing dark foundation + yellow accent and polish the surfaces and semantic colors. This is the strongest fit for FastHaul Ops.

| Role | Hex | Usage |
|------|-----|-------|
| Background (deepest) | `#0B0F19` or `#0F1219` | Main page background |
| Sidebar / Navigation | `#11151F` | Left navigation |
| Card / Panel surface | `#161B26` – `#1A1F2B` | KPI cards, chart containers |
| Elevated / Hover | `#1E2433` | Active states, modals, dropdowns |
| Primary Accent (Brand) | `#F5A623` or `#F59E0B` | Active nav, primary CTAs, key highlights |
| Primary Text | `#E8EAED` or `#F1F5F9` | Main numbers & headings |
| Secondary Text | `#94A3B8` | Labels, muted information |
| Borders / Dividers | `#2A3142` | Subtle card borders |

**Semantic Status Colors**
- **Success / On-time / Healthy** → `#22C55E` or `#4ADE80`
- **Warning / Attention** → `#F59E0B` / `#FBBF24` (matches current accent)
- **Critical / Offline / Loss** → `#EF4444` or `#F87171`
- **Info / Neutral** → `#60A5FA` or `#38BDF8`

### Option B – Cool Professional (Trust & Reliability Focus)

Shift the primary accent toward cooler tones while retaining amber for urgency.

- Backgrounds: Same as Option A
- Primary Accent: `#3B82F6` → `#60A5FA` (modern blue)
- Secondary Accent: Muted amber `#F59E0B` (warnings and filters only)
- Charts: Blue + Teal + Soft Green + Muted Orange

Best when the product needs a more “enterprise SaaS / high-trust” perception (common with larger carriers).

### Option C – Emerald Ops (Growth & Efficiency Focus)

Strong for financial + utilization focused dashboards.

- Backgrounds: Same dark grey family
- Primary Accent: `#10B981` / `#34D399` (emerald)
- Warning: Amber `#F59E0B`
- Critical: Red `#EF4444`
- Charts lean into emerald + cyan + soft amber

Ideal when profit, cost-per-mile, and utilization are the hero metrics.

---

## 3. Practical Palette – Option A (Copy-Paste Ready)

```css
:root {
  /* Surfaces */
  --bg-deep:        #0B0F19;
  --bg-sidebar:     #11151F;
  --bg-card:        #161B26;
  --bg-elevated:    #1E2433;

  /* Text */
  --text-primary:   #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted:     #64748B;

  /* Brand & Interactive */
  --accent-primary: #F59E0B;     /* Current yellow-orange */
  --accent-hover:   #FBBF24;

  /* Semantic */
  --success:        #22C55E;
  --warning:        #F59E0B;
  --danger:         #EF4444;
  --info:           #38BDF8;

  /* Borders */
  --border:         #2A3142;
}
```

---

## 4. Data Visualization Guidelines

For Income vs Expense bars, donuts, sparklines, and trend lines:

| Data Type | Recommended Colors |
|-----------|--------------------|
| Positive series (Income / Profit) | Soft emerald or teal (`#34D399`, `#2DD4BF`) |
| Negative / Expense | Soft coral or muted red (`#F87171`, `#FB7185`) |
| Neutral / Secondary | Soft blue or slate |
| Category / Donut colors | Limit to 4–5 highly distinguishable hues with different lightness |
| Grid lines | Very subtle (`#2A3142` at 40–60% opacity) |
| Sparkline trends | Match the semantic color of the KPI (green up, red down) |

**Important:** Design chart colors specifically for dark mode. Fully saturated light-mode colors often vibrate or lose clarity on dark surfaces.

---

## 5. Quick Implementation Wins

1. Replace pure black backgrounds with true dark grey (`#0B0F19` family).
2. Slightly desaturate the yellow accent if large areas feel too loud.
3. Enforce strict RAG status colors + icons/text (never rely on color alone).
4. Lighten and desaturate chart series colors for dark backgrounds.
5. Test the full palette with a color-blindness simulator (especially red-green).
6. Maintain consistent surface elevation (background → card → elevated) for clear hierarchy.

---

## 6. Why Yellow/Amber Works Well Here

In trucking and fleet operations, yellow/amber is already an industry-standard signal for caution and attention (HOS warnings, maintenance alerts, delay flags). Using it as the primary brand accent creates strong internal consistency:

- Active navigation and filters feel related to “attention needed” states.
- Financial drops and offline vehicles can share the same family of warm colors.
- It differentiates the product from the many blue-heavy enterprise dashboards.

---

## 7. Accessibility Checklist

- [ ] All text meets WCAG AA (minimum 4.5:1 contrast)
- [ ] Status colors are never the only indicator (pair with icons or labels)
- [ ] Chart series remain distinguishable under deuteranopia / protanopia simulation
- [ ] Focus states have sufficient contrast
- [ ] Dark mode does not rely on pure white text on pure black

---

## 8. Summary Recommendation

**Primary recommendation:** Stay with **Option A (Refined Current Direction)**.

Your existing yellow/amber accent is already well-suited to a trucking operations product. Focus on:
- Softening the darkest surfaces
- Tightening semantic status colors
- Creating a clear 3–4 level surface hierarchy
- Tuning chart colors for dark mode

This approach delivers the best balance of brand continuity, operational clarity, and long-session comfort.

---

*Sources synthesized from 2025–2026 dark-mode dashboard research, logistics UI guidelines, fleet management UX patterns, and accessibility best practices.*
