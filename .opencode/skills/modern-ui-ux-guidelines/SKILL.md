---
name: modern-ui-ux-guidelines
description: Use ALWAYS and by default for any change affecting how a website or web app looks. Trigger whenever the user edits CSS, HTML, styling, layout, components, theming, colors, spacing, typography, dark mode, responsiveness, or any visual/design work — including "make it look better", "redesign", "restyle", "polish", "tweak the look". Apply latest 2026 UI/UX design trends and guidelines when designing, reviewing, auditing, or generating modern websites and web interfaces. Use for UI design, UX review, website redesign, component systems, accessibility checks, AI-native interfaces, bento layouts, micro-interactions, agent-ready design, or any request involving contemporary web design best practices.
---

# Modern UI/UX Guidelines (2026)

Apply current best practices for modern website UI/UX design. Load detailed reference material when needed.

## When to Use

**Always load this skill for any change to how the project looks.** Apply it by default whenever editing:
- CSS, Tailwind, Sass, styled-components, or any styling code
- HTML/JSX markup that changes appearance, layout, or structure
- Components, themes, colors, spacing, typography, fonts, icons, dark mode, or responsive behavior
- Any request like "make it look better", "redesign", "restyle", "polish", "tweak the look", "change the design"

Also use when:

- Designing or redesigning websites, landing pages, SaaS dashboards, or product UIs
- Reviewing existing designs for modernity, accessibility, performance, or conversion
- Generating design systems, component libraries, or layout recommendations
- Advising on AI-native interfaces, adaptive UIs, or agent-ready websites
- Checking against 2026 trends (calm minimalism, bento grids, kinetic type, glassmorphism, etc.)

## Core Instructions

1. Prioritize **calm, intentional design** — one primary action per screen, generous whitespace, reduced cognitive load.
2. Treat **performance as a design constraint** (Core Web Vitals targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1).
3. Make **accessibility non-negotiable** (WCAG 2.2 AA minimum) and design for both humans and AI agents.
4. Prefer **modular layouts** (especially bento grids) over carousels.
5. Ship **dark mode + light mode** from the start using design tokens.
6. Keep motion **purposeful and accessible** (honor `prefers-reduced-motion`).
7. For AI features, make them **transparent copilots** with clear accept/edit/reject controls.
8. Use semantic HTML + structured data so sites work well for AI browser agents.
9. Follow a consistent spacing scale (4px or 8px base) and fluid typography (`clamp()`).
10. Validate recommendations against the detailed reference when specificity is required.

## Detailed Reference

For comprehensive trends, guidelines, implementation tips, Nielsen agent-ready rules, checklists, and source context, read:

`UI_UX_Modern_Website_Trends_Guidelines_2026.md`

Load this file when the user needs depth, examples, CSS snippets, full checklists, or audience-specific advice (Gen Z, B2B, ecommerce, etc.).

## Output Style

- Be concrete and actionable.
- Prefer CSS Grid / modern CSS patterns.
- Call out trade-offs (performance vs visual richness, personality vs clarity).
- When reviewing a design, structure feedback around the core principles above.
- When generating designs or systems, produce token-ready, accessible, mobile-first output.