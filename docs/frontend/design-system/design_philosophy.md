# iVendorz — Design Philosophy & Design Tokens

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **FINAL v1.1** — Foundational Design System (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29 · v1.1 additive amendment 2026-07-10 (§2.6 motion precedence — WP-MOTION-1, RV-0154 F1)
**Supersedes:** DRAFT v0.1 (incorporates the Principal-Designer review: MAJOR-02…05, MINOR-01…10, and the missing-section set)

---

## 0. Precedence & Authority (read first)

This document is a **non-authoritative companion**. It describes design *intent* and proposes
design-token *values*; it **coins no architecture, contract, permission, state, event, or domain
element**. It sits **below** the frozen Doc-7 program in the authority order and must conform upward.

```
Master Architecture → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → Doc-7B…7H → Code
                                                                              ▲
                                                       this document conforms to everything above
```

- **Doc-7A** (Frontend Realization Metastandard) and **Doc-7B** (Design System & Component Kit) own
  the authoritative token *architecture*, component kit, and a11y/i18n/currency/responsive baseline.
  Doc-7B deliberately **defers token values to implementation** — so the concrete values below are
  legitimate proposals, not a re-decision of Doc-7B.
- **Doc-7C** owns the app shell, route topology, and notification center. **Doc-7D…7H** own the actual
  surfaces (Public, Account, Buyer, Vendor, Admin).
- **On any conflict, the frozen corpus wins and this document is corrected** (CLAUDE.md §7, §11).
  Frozen facts are bound **by pointer**, never restated or invented.

> **Implementation note (divergence flag):** This document sets **Light** as the primary theme
> (§3.1). The currently-shipped `app/globals.css` and `tailwind.config.ts` default to **dark**.
> Reconciling the code to a light-default semantic-token model is a **separate, out-of-scope task**
> tracked outside this document.

---

## 1. Design Philosophy

### 1.1 Core Principle: "Industrial Precision, Human Clarity"

iVendorz operates in a world of factories, engineers, and procurement officers — people who live in
spreadsheets and legacy ERP systems. Our design must feel **immediately trustworthy, data-dense
without feeling overwhelming, and decisively efficient.**

We are **not** building a consumer marketplace (no Airbnb-style card grids). We are building a
**professional operating system** — think Bloomberg Terminal meets Stripe Dashboard, tuned for
industrial Bangladesh.

### 1.2 The Five Design Pillars

| Pillar | Description | Application |
|--------|-------------|-------------|
| **Precision** | Data is always the hero. Numbers, statuses, and signals must be instantly scannable. | Tight typography, clear data hierarchy, structured layouts, tabular numerals |
| **Trust at First Glance** | Vendors earn trust through signals. UI must surface verification badges, scores, and tier indicators without noise. | Prominent trust chips, score rings, capacity bars |
| **Decisive Efficiency** | Procurement people are time-pressured. Every flow must be completable in minimum clicks. | Smart defaults, progressive disclosure, inline actions |
| **Professional Gravitas** | We compete with Thomasnet, MFG.com, and Xometry. We must feel enterprise-grade from day one. | Structured grids, restrained palette, no playful gradients; authority through density and rigor — **not** through a particular theme |
| **Bangladesh-Aware** | BDT currency, Bengali language support (future), local industrial category norms. | Number formatting (lac/crore), BDT ৳ symbol where the field's currency is BDT, RTL-ready spacing |

> *Note:* Gravitas is delivered by **rigor and density**, not by darkness. The default surface is
> **light** (§3.1); a first-class dark mode remains available as a user preference.

### 1.3 What We Are NOT

- ❌ Not a consumer marketplace (no playful gradients, no mascots, no emoji-heavy UI)
- ❌ Not a minimal SaaS (no blank-canvas emptiness — data density is a feature)
- ❌ Not a legacy enterprise tool (no grey tables, no system fonts, no 2005-era form UX)
- ❌ Not Alibaba/Daraz (no red/orange commerce palette, no auction-style urgency tricks)

> We are **not illustration-free** — see the **Illustration Guideline (§4.5)**. We forbid *decorative*
> illustration inside dense data surfaces, but use restrained *technical* line-art deliberately for
> onboarding, empty states, marketing, and error pages.

### 1.4 Visual Language

**Mood:** Precise. Authoritative. Subtle depth. **Light-anchored by default, with a first-class
optional dark mode.**

The brand system is a **deep navy + electric indigo** — the color of engineering blueprints,
conveying technical authority. In the **light** (primary) theme these brand hues are the *ink and
accent* (interactive elements, links, focus, charts); in the **dark** (optional) theme deep navy also
carries the *surface*. Accents of **amber/gold** signal procurement value (LOI, PO, awards). Status
uses a strictly controlled semantic color system — never decorative.

**Inspiration palette:**
- Xometry / MFG.com: structured, data-forward, professional
- Linear: smooth surfaces, micro-animation mastery (in both light and dark)
- Stripe: trust-building through density and precision (light-first)
- Notion: clarity in information hierarchy

---

## 2. Design Tokens

> Realized as the two token tiers Doc-7B mandates — **primitive** (raw scales) and **semantic**
> (purpose-named aliases) — via CSS custom properties in `globals.css` + Tailwind `theme.extend` in
> `tailwind.config.ts`. All tokens use the `--iv-` namespace to avoid collision with shadcn/ui tokens.
> **No token encodes a domain value** (Doc-7B Pass-1 §3.2).

### 2.1 Color

#### 2.1.1 Primitive — Brand (Deep Navy + Electric Indigo)

```css
--iv-brand-50:  #EEF2FF;
--iv-brand-100: #E0E7FF;
--iv-brand-200: #C7D2FE;
--iv-brand-300: #A5B4FC;
--iv-brand-400: #818CF8;
--iv-brand-500: #6366F1;   /* primary interactive — buttons, links */
--iv-brand-600: #4F46E5;   /* primary hover */
--iv-brand-700: #4338CA;   /* pressed/active */
--iv-brand-800: #3730A3;
--iv-brand-900: #312E81;
--iv-brand-950: #1E1B4B;   /* deep navy — dark-mode surface anchor */
```

#### 2.1.2 Primitive — Procurement Amber (Award & High-Value Signals)

```css
--iv-amber-50:  #FFFBEB;
--iv-amber-100: #FEF3C7;
--iv-amber-200: #FDE68A;
--iv-amber-300: #FCD34D;
--iv-amber-400: #FBBF24;   /* primary amber accent */
--iv-amber-500: #F59E0B;   /* award badge, PO icon */
--iv-amber-600: #D97706;   /* hover */
--iv-amber-700: #B45309;
--iv-amber-800: #92400E;
--iv-amber-900: #78350F;
```

#### 2.1.3 Primitive — Surface Ramps (Light = Primary, Dark = Optional)

```css
/* Light Mode — PRIMARY experience (page, cards, panels) */
--iv-light-base:      #F8FAFC;  /* page background */
--iv-light-raised:    #FFFFFF;  /* cards, panels */
--iv-light-overlay:   #FFFFFF;  /* modals, dropdowns */
--iv-light-muted:     #F1F5F9;  /* subtle section fills */
--iv-light-border:    #E2E8F0;  /* borders, dividers */
--iv-light-hover:     #F1F5F9;  /* row/card hover (refined for contrast vs base) */
--iv-light-selected:  #E0E7FF;  /* selected row/card — brand-100 tint */

/* Dark Mode — OPTIONAL experience (user preference) */
--iv-surface-base:    #0A0E1A;  /* page background — deepest */
--iv-surface-raised:  #0F1424;  /* cards, panels — level 1 */
--iv-surface-overlay: #151B2E;  /* modals, dropdowns — level 2 */
--iv-surface-muted:   #1C2340;  /* subtle section fills — level 3 */
--iv-surface-border:  #252D47;  /* borders, dividers */
--iv-surface-hover:   #1E2540;  /* row/card hover state */
--iv-surface-selected:#202745;  /* selected row/card */
```

#### 2.1.4 Semantic — Theme-Aware Aliases (the layer components consume)

Components reference **semantic** tokens; the theme layer swaps which primitive each resolves to.
Light is the default; `.dark` (or `[data-theme="dark"]`) overrides. This is the presentation-only
theme swap Doc-7B §3.4 describes.

```css
:root {                    /* LIGHT — default */
  --iv-bg:          var(--iv-light-base);
  --iv-surface:     var(--iv-light-raised);
  --iv-surface-2:   var(--iv-light-muted);
  --iv-overlay:     var(--iv-light-overlay);
  --iv-border:      var(--iv-light-border);
  --iv-hover:       var(--iv-light-hover);
  --iv-selected:    var(--iv-light-selected);
  --iv-fg:          #0F172A;   /* primary text — slate-900 */
  --iv-fg-secondary:#334155;   /* secondary text — slate-700 */
  --iv-fg-muted:    #64748B;   /* meta/disabled text — slate-500 */
  --iv-fg-inverse:  #FFFFFF;   /* text on brand/dark fills */
}

.dark {                    /* DARK — optional */
  --iv-bg:          var(--iv-surface-base);
  --iv-surface:     var(--iv-surface-raised);
  --iv-surface-2:   var(--iv-surface-muted);
  --iv-overlay:     var(--iv-surface-overlay);
  --iv-border:      var(--iv-surface-border);
  --iv-hover:       var(--iv-surface-hover);
  --iv-selected:    var(--iv-surface-selected);
  --iv-fg:          #FFFFFF;
  --iv-fg-secondary:var(--iv-neutral-text);
  --iv-fg-muted:    var(--iv-neutral-bright);
  --iv-fg-inverse:  #0A0E1A;
}
```

#### 2.1.5 Semantic — Status Colors

Each status carries a `subtle / muted / base / bright / text` ramp so it reads on both themes
(subtle = tinted fill; base/bright = solid; text = the on-surface label color).

```css
/* Success — Verified, Active, Won */
--iv-success-subtle:  #052E16;  /* dark fill */   --iv-success-base:   #16A34A;
--iv-success-muted:   #14532D;                     --iv-success-bright: #22C55E;
--iv-success-text:    #4ADE80;

/* Warning — Pending, Under Review, Expiring */
--iv-warning-subtle:  #1C1407;  --iv-warning-muted: #713F12;  --iv-warning-base: #CA8A04;
--iv-warning-bright:  #EAB308;  --iv-warning-text:  #FDE047;

/* Danger — Rejected, Overdue (blacklist signals are NEVER rendered — Invariant #11) */
--iv-danger-subtle:   #1C0505;  --iv-danger-muted:  #7F1D1D;  --iv-danger-base:  #DC2626;
--iv-danger-bright:   #EF4444;  --iv-danger-text:   #FCA5A5;

/* Info — New, Submitted, Invited */
--iv-info-subtle:     #071830;  --iv-info-muted:    #1E3A5F;  --iv-info-base:    #2563EB;
--iv-info-bright:     #3B82F6;  --iv-info-text:     #93C5FD;

/* Neutral — Draft, Closed, Inactive */
--iv-neutral-subtle:  #0F1015;  --iv-neutral-muted: #374151;  --iv-neutral-base: #6B7280;
--iv-neutral-bright:  #9CA3AF;  --iv-neutral-text:  #D1D5DB;
```

> **Light-mode chips:** on light surfaces, status chips use a low-alpha tint of `*-base` (e.g.
> `rgba(22,163,74,0.10)`) with `*-base`/`*-muted` as the on-chip text — mirroring the shipped
> `.iv-badge-*` pattern but inverted for light backgrounds. The shipped subtle tints
> (`rgba(...,0.08)`) already work on both themes.

#### 2.1.6 Domain-Specific — Trust, Tier, Capability

```css
/* Trust Score Ring — 0–100 */
--iv-trust-low:    #EF4444;   /* 0–39  — Red */
--iv-trust-medium: #F59E0B;   /* 40–69 — Amber */
--iv-trust-high:   #22C55E;   /* 70–89 — Green */
--iv-trust-elite:  #6366F1;   /* 90–100 — Brand Indigo (elite tier) */

/* Financial Tier Badges (A smallest … E largest) */
--iv-tier-a: #94A3B8;   /* Steel   */
--iv-tier-b: #34D399;   /* Emerald */
--iv-tier-c: #60A5FA;   /* Blue    */
--iv-tier-d: #FBBF24;   /* Gold    */
--iv-tier-e: #A78BFA;   /* Violet  */

/* Vendor Capability Flags */
--iv-cap-supply:    #3B82F6;  /* can_supply    — Blue    */
--iv-cap-service:   #818CF8;  /* can_service   — Indigo  */
--iv-cap-fabricate: #FBBF24;  /* can_fabricate — Amber   */
--iv-cap-consult:   #22C55E;  /* can_consult   — Emerald */
```

> Trust, tier, and capability colors are **read-only presentation** of M5/M2 contract data. The UI
> **displays** these signals; it never computes or mutates them (Trust is owned by M5; M2 reads it).

---

### 2.2 Typography

**Font Strategy:**
- **Display / Headings / Body / UI:** `Inter` — authoritative, highly legible, one family to reduce cognitive load
- **Monospace (IDs, refs, codes, financial figures):** `JetBrains Mono` — for refs like `RFQ-2026-000123`, UUIDs, amounts

```css
--iv-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--iv-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

/* Type Scale — 1rem = 16px */
--iv-text-2xs:  0.625rem;   /* 10px — badges, micro labels */
--iv-text-xs:   0.75rem;    /* 12px — captions, meta, form labels */
--iv-text-sm:   0.875rem;   /* 14px — secondary body, dense UI */
--iv-text-base: 1rem;       /* 16px — primary body */
--iv-text-lg:   1.125rem;   /* 18px — section intros */
--iv-text-xl:   1.25rem;    /* 20px — card titles */
--iv-text-2xl:  1.5rem;     /* 24px — page section headers */
--iv-text-3xl:  1.875rem;   /* 30px — page titles */
--iv-text-4xl:  2.25rem;    /* 36px — hero headings */
--iv-text-5xl:  3rem;       /* 48px — landing hero */
--iv-text-6xl:  3.75rem;    /* 60px — marketing hero */

/* Weights */
--iv-weight-regular: 400;  --iv-weight-medium: 500;  --iv-weight-semibold: 600;
--iv-weight-bold: 700;     --iv-weight-extrabold: 800;

/* Line Heights */
--iv-leading-tight: 1.25;  --iv-leading-snug: 1.375;  --iv-leading-normal: 1.5;  --iv-leading-relaxed: 1.625;

/* Letter Spacing */
--iv-tracking-tight: -0.02em;  --iv-tracking-normal: 0em;  --iv-tracking-wide: 0.025em;  --iv-tracking-widest: 0.1em;
```

> Financial and tabular numerals use `font-variant-numeric: tabular-nums` — wired via the shipped
> `[data-numeric]` and `[data-type="amount"]` hooks in `globals.css`.

---

### 2.3 Spacing

> 4px base grid. All spacing is a multiple of 4.

```css
--iv-space-0: 0px;   --iv-space-1: 4px;   --iv-space-2: 8px;   --iv-space-3: 12px;  --iv-space-4: 16px;
--iv-space-5: 20px;  --iv-space-6: 24px;  --iv-space-7: 28px;  --iv-space-8: 32px;  --iv-space-10: 40px;
--iv-space-12: 48px; --iv-space-16: 64px; --iv-space-20: 80px; --iv-space-24: 96px; --iv-space-32: 128px;
```

---

### 2.4 Border Radius

```css
--iv-radius-none: 0px;
--iv-radius-sm:   4px;    /* tight — badges, chips, inputs */
--iv-radius-md:   8px;    /* default — cards, buttons */
--iv-radius-lg:   12px;   /* modals, large cards */
--iv-radius-xl:   16px;   /* hero cards, feature panels */
--iv-radius-2xl:  24px;   /* marketing cards */
--iv-radius-full: 9999px; /* pills, avatar rings */
```

---

### 2.5 Shadows & Elevation

**Shadow ≠ elevation.** A *shadow* is a raw visual primitive. *Elevation* is a **semantic level** —
the meaning of how far a surface sits above the page. Elevation is conveyed by **shadow + a surface
companion**: in light mode mainly by shadow + subtle border; in dark mode mainly by surface
*lightening* (base → raised → overlay → muted), with shadow as reinforcement.

#### 2.5.1 Raw shadow ramp (dark-tuned; soften alpha for light)

```css
--iv-shadow-xs:  0 1px 2px rgba(0,0,0,0.5);
--iv-shadow-sm:  0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
--iv-shadow-md:  0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4);
--iv-shadow-lg:  0 8px 24px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.4);
--iv-shadow-xl:  0 16px 40px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.5);
--iv-shadow-2xl: 0 24px 64px rgba(0,0,0,0.8);

/* Light-mode shadows use slate-tinted low alpha, e.g.:
   --iv-shadow-sm: 0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.10); */

/* Glow — interactive emphasis (used sparingly) */
--iv-glow-brand:   0 0 0 1px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.15);
--iv-glow-success: 0 0 0 1px rgba(34,197,94,0.3),  0 0 20px rgba(34,197,94,0.12);
--iv-glow-amber:   0 0 0 1px rgba(251,191,36,0.3), 0 0 20px rgba(251,191,36,0.12);
```

#### 2.5.2 Semantic elevation levels (0–4)

| Level | Token | Usage | Light surface + shadow | Dark surface |
|-------|-------|-------|------------------------|--------------|
| **0** | `--iv-elevation-0` | Page background, flush blocks | `--iv-bg`, no shadow | `--iv-surface-base` |
| **1** | `--iv-elevation-1` | Cards, panels, table container | `--iv-surface` + `--iv-shadow-sm` + border | `--iv-surface-raised` |
| **2** | `--iv-elevation-2` | Dropdowns, popovers, sticky header | `--iv-overlay` + `--iv-shadow-md` | `--iv-surface-overlay` |
| **3** | `--iv-elevation-3` | Modals, dialogs, drawers, sheets | `--iv-overlay` + `--iv-shadow-lg` | `--iv-surface-overlay` |
| **4** | `--iv-elevation-4` | Toasts, command palette (top layer) | `--iv-overlay` + `--iv-shadow-xl` | `--iv-surface-overlay` |

> Elevation levels align with the **Z-Index scale (§2.7)**: higher elevation ⇒ higher stacking layer.

---

### 2.6 Motion & Animation

> **AMENDMENT v1.1 (2026-07-10, owner-directed WP-MOTION-1 · RV-0154 F1 — Board-ratified
> 2026-07-10):**
> [`motion_standard.md`](motion_standard.md) is now the **single source of truth for motion
> timing, easing, and animated-property rules**; on any conflict with this section, the Motion
> Standard wins. Superseded rows/values below (kept for the record — do **not** apply to new
> work): hover/focus at 200ms `ease-in-out` (now 150ms `ease-out`) · toast `ease-spring`
> (spring/bounce retired for new work) · score/progress counters at 800ms (a data-display
> animation now requires a Motion Standard exception ruling) · drawer 250–300ms (now capped at
> 250ms) · the interactive ceiling of 500ms (now 300ms hard ceiling, 150–250ms working band) ·
> page/route transition "fade 200ms" (now fade + 6px rise, client navigations only). The token
> *names* and easing *values* in the CSS block below remain accurate as printed.

```css
/* Duration */
--iv-duration-instant: 50ms;  --iv-duration-fast: 100ms;   --iv-duration-normal: 200ms;
--iv-duration-slow:   300ms;  --iv-duration-slower: 500ms; --iv-duration-slowest: 800ms;

/* Easing */
--iv-ease-linear:     linear;
--iv-ease-in:         cubic-bezier(0.4, 0, 1, 1);
--iv-ease-out:        cubic-bezier(0, 0, 0.2, 1);    /* default for exits */
--iv-ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);  /* default for transitions */
--iv-ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy — sparingly */
--iv-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);    /* entering elements */
--iv-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);    /* exiting elements */
```

**Allowed properties (GPU/cheap):** `opacity`, `transform` (translate/scale), `color`,
`background-color`, `border-color`, `box-shadow`.

**Forbidden:** animating layout properties that reflow (`width`, `height`, `top/left`, `margin`);
parallax; looping decorative motion on data surfaces; spring easing on dense tables/forms; any
interactive animation **> 500ms**.

**Pattern rules** (reuse the keyframes already defined in `tailwind.config.ts`):

| Pattern | Spec | Token / keyframe |
|---------|------|------------------|
| Hover/focus transitions | `normal` (200ms) + `ease-in-out` | `--iv-duration-normal` |
| Page / route transition | fade 200ms `ease-out` | `iv-fade-in` |
| Table / list loading | skeleton shimmer | `iv-shimmer` (`.iv-skeleton`) |
| Toast / notification | slide + fade 300ms `ease-spring` | `iv-slide-down` |
| Modal / dialog | scale-in 200ms + overlay fade | `iv-scale-in` |
| Drawer / sheet | slide 250–300ms `ease-decelerate` | `iv-slide-up` |
| Score / progress counters | 800ms `ease-out` | `--iv-duration-slowest` |

**Reduced motion (mandatory):** under `@media (prefers-reduced-motion: reduce)`, disable non-essential
motion — no shimmer (use a static placeholder), no slide/scale (opacity-only or instant), no pulse/glow
loops. Functional feedback (focus ring, state color) is always retained.

---

### 2.7 Z-Index Scale

```css
--iv-z-base: 0;       --iv-z-raised: 10;    /* sticky/table headers */
--iv-z-dropdown: 100; --iv-z-sticky: 200;   /* sticky nav, sidebar */
--iv-z-overlay: 300;  --iv-z-modal: 400;    /* modals, dialogs */
--iv-z-toast: 500;    --iv-z-tooltip: 600;  /* always on top */
```

---

### 2.8 Breakpoints

> **Mobile-first** implementation (Doc-7B §8.1). Desktop (`xl`) is the primary *usage* target for
> dashboard surfaces, but every component reflows correctly from `xs` upward — see §3.2.

```css
--iv-bp-xs:  480px;    /* small mobile */
--iv-bp-sm:  640px;    /* large mobile */
--iv-bp-md:  768px;    /* tablet */
--iv-bp-lg:  1024px;   /* small laptop */
--iv-bp-xl:  1280px;   /* desktop — primary dashboard usage target */
--iv-bp-2xl: 1536px;   /* large monitor */
--iv-bp-3xl: 1920px;   /* ultrawide */
```

*(Values mirror the `screens` map already in `tailwind.config.ts`.)*

---

### 2.9 Layout Tokens

> Enterprise products need fixed, named layout dimensions so every page composes identically.

```css
/* Container / content widths */
--iv-container-sm:   640px;
--iv-container-md:   768px;
--iv-container-lg:   1024px;
--iv-container-xl:   1280px;
--iv-content-max:    1440px;  /* max content width inside the app shell */
--iv-page-max:       1600px;  /* ultrawide cap — content never exceeds this */

/* App shell */
--iv-sidebar-width:     264px;  /* expanded left nav */
--iv-sidebar-collapsed: 64px;   /* icon-only rail */
--iv-topbar-height:     56px;   /* top nav / page header bar */

/* Content widths */
--iv-form-max:    560px;  /* single-column form */
--iv-form-wide:   880px;  /* two-column form / settings */
--iv-table-min:   720px;  /* min table width before horizontal scroll */
--iv-card-min:    280px;  /* min card width in auto-fill grids */
--iv-reading-max: 720px;  /* long-form / doc reading width */
```

> The app shell, route topology, and exact surface widths are **owned by Doc-7C**; these tokens are
> the proposed presentation values that realize within that shell.

---

### 2.10 Grid System

```css
--iv-grid-cols-12: 12;   /* default page grid */
--iv-grid-cols-8:  8;    /* forms, settings, narrow content */
--iv-grid-cols-24: 24;   /* dense dashboards, comparison matrices */

--iv-gutter:        24px; /* default column gutter (desktop) */
--iv-gutter-tight:  16px; /* tablet / mobile gutter */
--iv-col-gap:       24px;
--iv-row-gap:       24px;
```

**Usage:**
- **12-col** — the default for application pages (listing + detail panes, dashboards).
- **8-col** — forms, settings, and reading surfaces (narrower measure, fewer alignment points).
- **24-col** — high-density dashboards and quotation/vendor comparison matrices needing fine columns.

**Dashboard card grid recipe:** CSS grid, `repeat(auto-fill, minmax(var(--iv-card-min), 1fr))`,
`gap: var(--iv-gutter)`. Gutter collapses to `--iv-gutter-tight` below `md`.

---

### 2.11 Icon Tokens

- **Library:** **Lucide** (the shadcn/ui convention) — consistent geometric line icons.
- **Sizes** (square): `16` (inline / dense tables), `20` (default UI / buttons), `24` (nav / section
  headers), `32` (feature / empty-state).
- **Stroke:** `1.5` default; `2` for small sizes or emphasis. Keep stroke consistent within a context.

```css
--iv-icon-xs: 16px;  --iv-icon-sm: 20px;  --iv-icon-md: 24px;  --iv-icon-lg: 32px;
--iv-icon-stroke: 1.5;  --iv-icon-stroke-bold: 2;
```

> See **§10 Iconography & Industrial Icon Language** for the domain glyph map.

---

### 2.12 Data Visualization Tokens *(forward-looking — Analytics surfaces are later waves)*

```css
/* Categorical (distinct series — colorblind-aware ordering) */
--iv-chart-1: #6366F1;  /* brand    */
--iv-chart-2: #F59E0B;  /* amber    */
--iv-chart-3: #22C55E;  /* success  */
--iv-chart-4: #3B82F6;  /* info     */
--iv-chart-5: #A78BFA;  /* violet   */
--iv-chart-6: #34D399;  /* emerald  */
--iv-chart-7: #FB7185;  /* rose     */
--iv-chart-8: #94A3B8;  /* steel    */

/* Sequential (single metric, low→high) = brand ramp 100 → 900 */
/* Diverging (negative ↔ neutral ↔ positive) = danger ↔ neutral ↔ success */

--iv-progress-track: var(--iv-surface-2);
--iv-progress-fill:  var(--iv-brand-500);
/* Trust/score gauges reuse the trust ramp (§2.1.6); sparklines use a single hue (brand-400), no axis chrome. */
```

**Rules:** never encode meaning by color alone (pair with label/value/pattern); keep axis numerals
`tabular-nums`; respect the same WCAG contrast floor as text (§11).

---

### 2.13 Domain-Specific Token Patterns

#### RFQ Status Color Map

| Status | Token | Hex |
|--------|-------|-----|
| `draft` | `--iv-neutral-base` | `#6B7280` |
| `submitted` | `--iv-info-base` | `#2563EB` |
| `under_review` | `--iv-warning-base` | `#CA8A04` |
| `matching` | `--iv-brand-500` | `#6366F1` |
| `vendors_notified` | `--iv-info-bright` | `#3B82F6` |
| `quotations_received` | `--iv-brand-400` | `#818CF8` |
| `buyer_reviewing` | `--iv-warning-bright` | `#EAB308` |
| `shortlisted` | `--iv-amber-500` | `#F59E0B` |
| `closed_won` | `--iv-success-base` | `#16A34A` |
| `closed_lost` | `--iv-neutral-muted` | `#374151` |
| `cancelled` | `--iv-danger-base` | `#DC2626` |

> The **authoritative** RFQ state machine and its states are owned by **Doc-4M**. This table is a
> presentation color *map*, not a state definition; if a state name here ever diverges from Doc-4M,
> Doc-4M wins.

#### Vendor Capability Flag Chips

| Flag | Color |
|------|-------|
| `can_supply` | Blue — `--iv-cap-supply` |
| `can_service` | Indigo — `--iv-cap-service` |
| `can_fabricate` | Amber — `--iv-cap-fabricate` |
| `can_consult` | Emerald — `--iv-cap-consult` |

> Capability is a **4-flag matrix**, never a single label (Invariant #1).

---

## 3. Layout, Theming & Responsive System

### 3.1 Theming Strategy

| Surface | Default theme | Notes |
|---------|---------------|-------|
| **Marketing / Public** | **Light** | SEO-first, broad audience, trust-building |
| **Dashboard / App (Buyer/Vendor)** | **Light** | Procurement/SCM users on screens 8–10 hrs/day — light is the default |
| **Admin Console** | **Light** | Consistent with the app |
| **Dark mode** | **Optional** | Available everywhere as a **user preference**, persisted per user |

**Why light is primary:** the core users — Procurement Managers, factory engineers, SCM, Purchase,
and Accounts staff — work full shifts in spreadsheets and ERPs. A light default matches that context
and reduces switching friction. Dark remains a first-class, fully-supported option.

**Mechanism:** theming is a **presentation-only swap of semantic tokens** (§2.1.4; Doc-7B §3.4) —
toggling `.dark` / `[data-theme]` reassigns the semantic aliases. No component reads a primitive
surface color directly; all consume semantic tokens, so both themes come "for free."

> **Divergence flag (repeat):** the shipped `globals.css`/`tailwind.config.ts` currently default to
> dark and bind components to the dark `--iv-surface-*` primitives directly. Migrating to the
> light-default semantic-alias model above is a separate code task, out of scope for this document.

### 3.2 Responsive Rules

**Mobile-first** (Doc-7B §8.1): author base styles for the smallest viewport, then layer breakpoint
overrides upward. **Desktop (`xl`) is the primary *usage* target** for dashboards, but no surface may
break below it.

| Tier | Range | Behavior |
|------|-------|----------|
| **Mobile** | `< sm` (640px) | Single column; sidebar → drawer; tables → stacked cards or horizontal scroll; primary action pinned |
| **Large mobile** | `sm`–`md` | Single/two column; condensed top nav |
| **Tablet** | `md`–`lg` | Two-pane where useful; collapsible sidebar (icon rail) |
| **Laptop** | `lg`–`xl` | Full sidebar; multi-column dashboards |
| **Desktop** | `xl`–`2xl` | **Primary dashboard target** — full density, side panels, comparison views |
| **Ultrawide** | `≥ 3xl` (1920px) | Content capped at `--iv-page-max`; extra space becomes margin, never over-stretched rows |

Touch and pointer targets meet the a11y baseline (§11) at every tier.

### 3.3 Component Density

Three densities, selectable on data-heavy surfaces (RFQ list, quotation comparison, vendor directory,
admin tables), applied via a `data-density` attribute on the container:

| Density | Row height | Cell padding | Use |
|---------|-----------|--------------|-----|
| `compact` | 32px | `--iv-space-2` | Power users, large datasets, comparison matrices |
| `default` | 40px | `--iv-space-3` | Standard tables and lists |
| `comfortable` | 48px | `--iv-space-4` | Detail views, low-volume tables, touch |

```css
--iv-density-compact-row: 32px;  --iv-density-default-row: 40px;  --iv-density-comfortable-row: 48px;
```

---

## 4. Component Design Principles

### 4.1 Data Display Hierarchy

1. **Primary Signal** — Trust Score, status badge (top-right, always visible)
2. **Identity** — Vendor name, category, location (dominant text)
3. **Capability Signals** — Financial tier, capability flags, capacity
4. **Engagement Data** — RFQ count, win rate, response rate
5. **Action** — Primary CTA (invite, view, contact)

### 4.2 Interaction States

All interactive elements implement: `default → hover → active → focused → disabled`.
- **Focus ring:** `2px solid var(--iv-brand-500)` + `2px` offset — always visible (the shipped
  `:focus-visible` rule). Mandatory for a11y.
- **No layout-shifting hover** — only color, shadow, or opacity may change on hover (never size).

### 4.3 Typography Hierarchy in Cards

```
Vendor Name          → text-xl / font-semibold / --iv-fg
Category             → text-sm / font-medium / --iv-brand (light) · --iv-brand-300 (dark)
Location + Tier      → text-xs / font-normal / --iv-fg-muted
Meta (date, count)   → text-xs / font-normal / --iv-fg-muted / tabular-nums
```

### 4.4 State Primitives (Empty / Loading / Error / Not-Found)

These are the four status primitives Doc-7B §6 owns; the kit provides them and every surface reuses
them. Design intent:

- **Loading** — skeletons that mirror final layout (`.iv-skeleton`); never spinners for full pages.
- **Empty** — see §4.6 illustration policy; icon + concise headline + single CTA + subtext.
- **Error** — renders from `error.error_class` / `error.message` only. **No protected enrichment**
  (Doc-7A §5.4): never surface protected field/metadata/header facts. Offer a safe retry/back action.
- **Not-found** — neutral, with a route back to a known surface.

### 4.5 Illustration Guideline *(revises the old "no illustrations" absolute)*

| Context | Illustration? | Style |
|---------|---------------|-------|
| Dense data surfaces (tables, dashboards, comparison) | ❌ No | Icons only — illustration is noise here |
| Empty states | ✅ Restrained | Single technical line-icon or minimal line-art, monochrome/brand-tinted |
| Onboarding | ✅ Yes | Light technical line-art; no mascots, no characters |
| Marketing / Landing | ✅ Yes | Blueprint/technical line-art, isometric industrial motifs |
| 404 / 500 / maintenance | ✅ Yes | Minimal, on-brand, never playful |

**Constraints:** geometric line-art aligned to Lucide's stroke language (1.5–2px); brand/neutral
palette; no photorealism, no 3D blobs, no mascots, no emoji. Illustration is decoration — it never
encodes data.

### 4.6 Empty States (specifics)

Never show a blank page. Every empty state has: an **icon** (not a heavy illustration on dense
surfaces), a concise **headline**, a single **action CTA**, and context-appropriate **subtext**.

---

## 5. Component Inventory

> This inventory **maps to and defers to** the authoritative catalog in **Doc-7B** (shadcn primitives,
> app components, single-owned embedded components, status primitives). It is presentation vocabulary,
> not an ownership claim. Where this list and Doc-7B differ, **Doc-7B wins**.

**Primitives (shadcn/ui, vendored — per Doc-7B Appendix):** button · input · select · checkbox ·
radio · switch · dialog · popover · dropdown-menu · tabs · tooltip · toast · badge · card · table ·
skeleton · avatar · separator · sheet. *(Several already exist as `.iv-*` utilities in `globals.css`:
`.iv-btn`, `.iv-input`, `.iv-label`, `.iv-badge`, `.iv-skeleton`, `.iv-surface`, `.iv-divider`.)*

**App components (compositions — Doc-7B):** data-table · form-field · status-chip · **currency-display**
· pagination-control · file-link · empty-state · error-state · not-found.

**Shared embedded components (single-owned — Doc-7B §5):** trust-badge · billing-indicator ·
ai-advisory-panel · conversation-thread. **Notification center is owned by Doc-7C**, not here. This
document must not re-author these.

**Stat / display:** stat-card · score-ring · capacity-bar · timeline · stepper · command-palette ·
search · filter. *(presentation compositions over the primitives above.)*

### 5.1 Table Specification

The most important component on the platform. Built on Doc-7B's `data-table`.

| Aspect | Spec |
|--------|------|
| Header height | 40px default / 36px compact; uppercase `text-2xs` labels; **sticky** (`--iv-z-raised`) |
| Row height | per density (§3.3); hover `--iv-hover`; selected `--iv-selected`; borders over zebra |
| **Sorting** | A kit sort toggle is **presentation over the contract-provided result set** — it **never re-ranks governed M3 matching** (Doc-7A §6 / Doc-7B Pass-1 §4.3). For governed lists, the contract order is authoritative; the UI displays, never re-scores. |
| **Filtering** | Re-query per contract; not a client re-rank of governed results |
| Selection | Left checkbox column + select-all in header + selection summary |
| Bulk actions | Contextual action bar appears when ≥1 row selected |
| **Pagination** | **Cursor-based** (load-more / next-cursor) — **no offset / page-number** (Doc-7B). `page_size` bounds come from the POLICY key (`*.list_page_size_max`, Doc-3 §12) — **never a UI literal** |
| Column resize | Optional; persisted per user (a presentation preference) |
| Density | `compact / default / comfortable` (§3.3) |
| Empty / loading | Skeleton rows on load; `empty-state` when no rows |

### 5.2 Form Specification

Built on Doc-7B's `form-field` + the shipped `.iv-input` / `.iv-label` primitives.

| Element | Spec |
|---------|------|
| Label | Above input, `text-xs` medium, `--iv-fg-muted` |
| Required | Asterisk + `aria-required`; never color-only |
| Helper text | Below input, `text-xs`, `--iv-fg-muted` |
| Validation | Inline on blur + on submit; never blocks typing |
| **Error** | `.iv-input-error` border + message from `error_class` / `field_errors`; **no protected enrichment** (Doc-7A §5.4) — never surface protected facts |
| Warning | Amber, non-blocking advisory |
| Readonly | Muted, copyable, no border emphasis |
| Disabled | `opacity: 0.4`, `not-allowed`, `aria-disabled` |

### 5.3 Navigation Standard

Left sidebar · top nav · breadcrumb · tabs · secondary nav · page header.

| Element | Intent |
|---------|--------|
| Left sidebar | Primary nav; `--iv-sidebar-width` / `--iv-sidebar-collapsed`; grouped sections; active state |
| Top nav | Org switcher · search / command palette · notifications · user menu |
| Breadcrumb | Hierarchical context on detail pages |
| Tabs | In-page section switching (presentation) |
| Secondary nav | Contextual sub-nav within a section |
| Page header | Title + ref (mono) + status chip + primary actions; height `--iv-topbar-height` |

> The **app shell, route topology, and notification center are owned by Doc-7C**. This is presentation
> guidance that realizes inside that shell — defer authoritative structure to Doc-7C.

---

## 6. Page Templates

> Inventory only — actual page realization is owned by the surface docs **Doc-7D…7H**.

| Template | Shape | Surface owner |
|----------|-------|---------------|
| **Dashboard** | Stat cards + activity + queues (12/24-col grid) | Doc-7F/7G/7H |
| **Listing** | Filter rail + data-table + cursor pagination | Doc-7F/7G/7H |
| **Details** | Header + tabbed panels + side metadata | per surface |
| **Wizard** | Stepper-driven multi-step (e.g. RFQ creation) | Doc-7F |
| **Settings** | 8-col form sections + save bar | Doc-7E |
| **Analytics** | Charts + KPI cards (forward-looking) | per surface |
| **Management** | Admin tables + moderation queues + bulk actions | Doc-7H |
| **Landing** | Marketing hero + sections (light, SEO-first) | Doc-7D |
| **Authentication** | Centered card, minimal chrome | Doc-7E |

---

## 7. Interaction Patterns

> Inventory of repeatable flows; each binds to the frozen corpus by pointer.

| Pattern | Notes / binding |
|---------|-----------------|
| **CRUD** | Create/edit via form-field; soft-delete only (Invariant #8) |
| **Search** | Postgres FTS now (Meilisearch future); results are contract-ordered |
| **Bulk action** | Selection → contextual action bar; confirm destructive ops |
| **Approval** | Admin (M8) **decides**; Trust (M5) **owns** the signal — never blended in UI |
| **Upload** | Supabase Storage; show progress + validation |
| **Import** | M8, **async via Inngest** (M0 outbox) — show job status, not a blocking spinner |
| **Export** | Respect tenancy + visibility scope; never export private-exclusion data |
| **RFQ flow** | A **state machine** (Doc-4M) — UI reflects states, never invents transitions |
| **Quotation flow** | Submit → compare → shortlist; comparison sort is presentation, never re-ranks M3 |
| **Award flow** | Post-award docs (LOI/PO/challan/invoice/WCC) — owned by **M4**; versioned, never overwritten |

---

## 8. Domain Components

> iVendorz-specific **presentation compositions over module contracts**. They render contract data
> by reference (Content ≠ Presentation, Golden Rule #4); they own no authoritative data.

| Component | Renders | Governance constraint |
|-----------|---------|-----------------------|
| **Vendor Card** | Name, category, location, trust chip, tier, capability matrix, capacity | Trust/tier **read-only** (M5); **blacklist / private exclusion never rendered** (Invariant #11) |
| **RFQ Card** | Ref (mono), status chip, lifecycle state | State from Doc-4M; never re-derived in UI |
| **Quotation Card** | Vendor, amount (currency per field), validity | Currency per §9; BDT default, never hardcoded |
| **Trust Widget** | Score ring (trust ramp), score | **Read-only** M5 display — M2 reads, never computes |
| **Verification Badge** | M5 verification record | Admin decides, Trust owns — UI only displays |
| **Capability Matrix** | 4 flags: supply/service/fabricate/consult | A matrix, never a single label (Invariant #1) |
| **Factory Card** | Vendor facility / capacity presentation | Presentation over M2 content; owns no data |
| **Supplier Match Card** | M3 match result | Order is **contract-authoritative**; UI never re-ranks |
| **Comparison Table** | Side-by-side quotations | Column sort is presentation; never re-ranks M3 |
| **Award Timeline** | Post-award doc lifecycle | M4-owned; versioned, immutable history |

---

## 9. Number, Currency & Unit Formatting

> Industrial procurement is unit- and currency-dense. Formatting is **presentation over
> contract-provided values** — the UI never invents a value or a currency.

### 9.1 Currency

- Every monetary value is a `{ amount, currency }` pair **carried by the field**. The
  `currency-display` component **reads the currency from the contract; default `BDT`; never assumed or
  hardcoded** (Doc-7B §7.3 / Doc-2 §0.4).
- The `৳` symbol is shown **only when the field's currency is BDT**; other currencies render their own
  symbol/code from the contract. Never infer a symbol.
- Amounts use `tabular-nums` (the `[data-type="amount"]` hook).

### 9.2 BDT lac/crore notation

- South-Asian grouping (2-2-3): `৳ 12,50,000`.
- Abbreviated where space-constrained: `৳ 12.5 Lac`, `৳ 1.2 Cr`. Full precision available on hover/detail.

### 9.3 Other formats

| Type | Convention | Example |
|------|-----------|---------|
| USD | `$` + thousands grouping | `$ 1,250.00` |
| Percentage | `%`, ≤1 decimal unless precision needed | `87.5%` |
| Mass | `kg`, `ton`/`MT` (metric ton) | `2,500 kg` · `2.5 MT` |
| Length | `mm`, `cm`, `m` | `150 mm` |
| Pressure | `bar`, `psi` | `10 bar` · `145 psi` |
| Power | `kW`, `HP` | `75 kW` |
| Flow | `m³/hr`, `L/min` | `120 m³/hr` |

**Rules:** thin space between number and unit; `tabular-nums` for aligned columns; units are
**presentation labels** for contract values — the UI never converts or recomputes a value.

---

## 10. Iconography & Industrial Icon Language

Built on **Lucide** (§2.11). Map domain concepts to Lucide glyphs; where Lucide lacks an industrial
glyph, use a **curated custom set** matching Lucide's geometry (1.5–2px stroke, 24px grid).

| Concept | Lucide / custom |
|---------|-----------------|
| Factory / Plant | `Factory` |
| Gearbox / Mechanical | `Cog` / `Settings2` |
| Chemical | `FlaskConical` / `Beaker` |
| Electrical | `Zap` / `Plug` |
| Steel / Materials | `Layers` / `Boxes` |
| PPE / Safety | `HardHat` |
| RFQ | `ClipboardList` / `FileText` |
| Quotation | `FileSpreadsheet` / `ReceiptText` |
| PO (Purchase Order) | `FileCheck` / `ScrollText` |
| Invoice | `Receipt` |
| **Valve · Pump · Motor** | **Custom** (Lucide has no faithful glyph — curated line-icons) |

> Icons are **presentation**. The category taxonomy itself is owned by **M2/M8** — icons label
> categories, they never define them.

---

## 11. Accessibility Standards

- **WCAG 2.1 AA** is the realized baseline in the kit (Doc-7B §7.1): semantic markup, full keyboard
  operability, visible focus order, ARIA where a primitive requires it, color-contrast compliance.
  **AAA** remains an aspiration for critical flows (RFQ creation, award).
- Minimum contrast: **4.5:1** body text, **3:1** large text / UI components.
- All interactive elements keyboard-navigable; visible `:focus-visible` ring on every control.
- **No color-only information** — always pair color with an icon or text label.
- The accessibility **test** is owned by **Doc-8** — this document states intent, not the conformance gate.

> **Light-mode re-verification:** the shipped contrast values were tuned for dark surfaces. With Light
> as primary, all semantic/status/trust colors must be re-checked against light backgrounds before any
> surface freezes.

---

## 12. Naming Conventions (CSS / Tailwind)

```
--iv-[category]-[variant]     CSS custom properties (primitive + semantic)
iv-[component]-[element]      CSS class names (e.g. .iv-btn-primary)
data-[state]                  State attributes (data-active, data-disabled, data-density)
```

---

## 13. Governance Alignment & Precedence

This document conforms upward (§0). The constraints below are **bound by pointer** and honored
throughout — not restated or re-decided:

| Constraint | Source | Where honored |
|-----------|--------|---------------|
| Currency `{amount, currency}` per field, default BDT, never hardcoded | Doc-7B §7.3 / Doc-2 §0.4 | §2.13, §8, §9.1 |
| List sort/filter is presentation; **never re-ranks M3 matching** | Doc-7A §6 / Doc-7B Pass-1 §4.3 | §5.1, §7, §8 |
| Tables cursor-paginated; `page_size` from POLICY key | Doc-7B / Doc-3 §12 | §5.1 |
| WCAG-AA realized baseline; a11y test = Doc-8 | Doc-7B §7.1 / Doc-8 | §11 |
| Forms render `field_errors`, **no protected enrichment** | Doc-7A §5.4 | §4.4, §5.2 |
| Mobile-first responsive | Doc-7B §8.1 | §2.8, §3.2 |
| Embedded components single-owned; notification center = Doc-7C | Doc-7B §5 / Doc-7C | §5 |
| Content ≠ Presentation (props-in; never re-shape/re-rank) | Golden Rule #4 / Doc-7A | §8 |
| Private exclusion / blacklist **never rendered** | Invariant #11 | §2.1.5, §8 |
| Trust read-only in M2; Trust owned by M5; Admin decides | §4 Governance Signals | §2.1.6, §8 |
| Theme = presentation-only semantic-token swap | Doc-7B §3.4 | §2.1.4, §3.1 |
| No token encodes a domain value | Doc-7B Pass-1 §3.2 | §2 |

**Open divergence (tracked outside this doc):** Light is set as the primary theme here; the shipped
`app/globals.css` / `tailwind.config.ts` default to dark and bind components to dark surface
primitives directly. Migrating the code to the light-default semantic-alias model (§2.1.4, §3.1) is a
separate task.

---

*This document is non-authoritative. It describes the design system intent and proposes token values.
It operates under the frozen corpus authority order (CLAUDE.md §7) and the Doc-7 precedence chain
(§0); it introduces no architecture change. On any conflict, the frozen document wins and this file is
patched to match.*
