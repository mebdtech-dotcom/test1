# ivendorz-fe-design Skill

**Invoke:** `/ivendorz-fe-design`

## Purpose
Encodes frozen design decisions (palette, typography, kit, patterns) to keep new UI consistent with the platform foundation. Speeds up page/component design by anchoring to existing system instead of reaching for defaults.

## When to Use
- Designing new pages or major UI surfaces
- Building components that should match platform aesthetic
- Reviewing new UI for consistency with frozen kit/tokens
- Deciding "which existing pattern fits this?"

---

## Reference-Design Fidelity — OWNER DIRECTIVE (2026-07-16) · binding on ALL FE teams & agents

> **The reference defines the visual design only — not the implementation.**
> The reference screens were designed deliberately, screen by screen. Match them.

**The rule, in the owner's terms:**

1. **Match the reference exactly.** The final UI must be **visually identical** to the reference
   screen. Do not re-interpret, re-compose, "improve", or partially apply it. A visual difference
   is a defect unless it is on the approved-divergence list for that surface.
2. **Never copy the reference's code, logic, or functionality.** Its markup, inline styles, CSS
   classes, scripts, state handling, routes and data are all **prototype artifacts** — not inputs.
   Read it as a picture of the intended UI, nothing more.
3. **Implement with our own architecture and standards** — the frozen kit primitives, our design
   tokens, our component boundaries, our coding standards, our a11y baseline. Every rule in
   this file, `fe-design-apply`, the Motion Standard, and `REPOSITORY_STRUCTURE.md` still applies
   in full.
4. **No shortcuts. No deviations. No redesigns — unless explicitly approved.**
5. **The implementation must strictly follow all project rules, architecture, governance, design
   system, accessibility and coding standards.** Fidelity never buys an exemption from any of them.

**How (3)+(4)+(5) resolve when they collide — the operative procedure.**
"Visually identical" and "strictly follow governance" conflict on real screens (a reference may
show a rank-0-forbidden affordance, an unbacked metric, or placeholder copy). The directive
answers this itself: you may **neither** silently deviate from the reference **nor** silently ship
a governance violation. So:

- **Do not auto-substitute.** Quietly swapping a reference widget for a "semantically equivalent,
  data-backed" one is a **deviation** and now requires explicit approval first. (This *tightens*
  the earlier VX-02 standing ruling, which had allowed that substitution as a unilateral call.)
- **Do not ship the violation either.** Governance is not overridden by fidelity — this directive
  says to follow it strictly, and rank-0/frozen text can only change via a human-approved additive
  patch (CLAUDE.md §7/§11). A reference is an input, never an authority
  (`visual_reference_implementation.md` §0).
- **Escalate and let the owner rule.** Present: the exact reference element · the specific rule it
  collides with (cited) · the conformant options · a recommendation. Then build what is ruled.
  Flag-and-Halt (§11) — never resolve locally.

**Recurring collision classes** (expect these; escalate, don't decide):

| Reference shows | Collides with | Never do |
|---|---|---|
| Invented platform metrics ("3,800+ verified vendors", "৳4.2B sourced") | R7 / no backing read; on public pages these are **factual claims to real users** | Ship the number |
| `Lorem ipsum` / placeholder prose | Not shippable copy | Ship it; silently write your own marketing claims either |
| A one-click decision affordance (e.g. `Award`) | R6 / Invariant #12 — the UI never pre-selects/ranks-to-winner | Ship it |
| Its own nav/auth/routing targets | Doc-7E auth entry; real IA | Re-point our routes to match a prototype's loose links |
| Its brand lockup, palette, or chrome | Official `BrandLogo` SSoT; ratified Navy palette; frozen shell | Substitute the reference's |

**Relationship to `visual_reference_implementation.md`** (repo-root standard, FINAL v1.0): that doc's
§2 MAY/MUST-NOT split still governs *what a reference may influence*, and its "copy the composition;
implement the platform" rule is unchanged. This directive **raises the fidelity bar** inside the MAY
column — composition, grid, hierarchy, spacing rhythm and density are to be matched **exactly**, not
approximately — and **removes the reviewer's discretion to deviate quietly** in the MUST-NOT column.
On any conflict the frozen corpus still wins and the divergence is escalated, not resolved locally.

**Every approved divergence is recorded** in the surface's file header: the reference element, the
cited rule, and who ruled it. That header is the audit trail a reviewer reads first.

---

## Data & Copy Fidelity — OWNER DIRECTIVE (2026-07-16) · binding on ALL FE teams & agents

> **Use only real backend data. Never take the reference's demo data or lorem blocks.**

**1. Never display a fact that isn't from a real read.**
A number, metric, count, money figure, date or factual claim renders **only** when a real backend
read supplies it. The reference's demo data is a **prototype artifact** — never a source. This is
the same R7 firewall the workspace already enforces ("every figure is a wired read, never
client-computed"), stated for the reference era: an invented figure is not a placeholder, it is a
false statement.

**2. No read yet ⇒ no figure. Ever.**
Where the read does not exist, **omit the slot** or render an honest pending state
("— " · "Totals calculate at integration"). **Never** substitute a plausible-looking number to fill
the layout. "It's only a mockup value" is exactly how a fabricated figure ships.

**3. Fixtures may carry SHAPE, never a claim.** (owner-ruled scope, 2026-07-16)
The presentation-only program still runs on disclosed SEED fixtures, and that posture stands until
wiring lands — a fixture may supply the **shape** of a surface (row layouts, KPI slots, column
anatomy) so the page can be designed and reviewed. It may **never** supply a fact presented as
true. Two hard lines:
- **Every fixture is disclosed** in its file header as a presentation fixture, and every field it
  fills must map to a REAL frozen field on a REAL read's row shape. A fixture supplies values,
  never new concepts.
- **On anonymous PUBLIC surfaces a figure is a factual claim to a real visitor** — not an internal
  placeholder behind auth. **Public/anonymous surfaces may display only statistics that are backed
  by authoritative production data. Otherwise, omit the metric or replace it with truthful
  non-numeric content.** A fixture value is never "backed" for this purpose — SEED, demo and
  mockup values are not production data. This is the sharp edge of the rule; when unsure whether a
  slot is "shape" or "claim", it is a claim.

**4. No lorem. Ever.** — and the copy call is yours (owner-granted, 2026-07-16)
`Lorem ipsum` and placeholder prose never ship. Replace a lorem block with **real copy you write**,
grounded in already-approved source: CLAUDE.md §1 (what the product is), the frozen corpus, or
existing approved page copy (e.g. the About page's positioning line). Writing that copy is an
explicitly granted decision — but it is not a licence to invent: **new business claims, statistics,
customer counts, testimonials, endorsements and dates are not "copy"** and are governed by rules
1–3. Describe what the product *is*; never assert traction it does not have.

**Worked example — the reference's About stats band** (`12,543 Active RFQs` · `3,800+ Verified
vendors` · `৳4.2B Sourced in 2025` · `64 Districts served`). No read backs any of them, and on a
public page they are claims to real visitors, so rules 1–3 forbid all four.
**OWNER RULING (2026-07-16): keep the band's 4-up footprint; fill it with true, non-numeric
content** (e.g. the four product surfaces of the CLAUDE.md §1 blend). Record it in the file header
as an approved divergence. This is the canonical pattern for the whole class: **keep the
reference's visual rhythm, drop the fabricated payload.**

---

## Frozen Foundation Reference

### Brand Palette

> **`app/globals.css` is the canonical implementation** (with `tailwind.config.ts` exposing the
> utility names). This section mirrors it — on any drift, globals.css wins and this doc is corrected.
> Corrected 2026-07-16: it previously named `--iv-error-*` and `--iv-slate-*`, neither of which has
> ever existed. Those were pre-migration names left over from before the 2026-06-30 navy migration;
> anyone following them wrote dead classes silently. **Retired names are not re-added to the
> codebase** — the doc is aligned to the code, never the reverse.

- **Navy (dominant)**: `--iv-navy-50…950` (sidebar, main nav, primary fills)
- **Indigo (interactive)**: `--iv-brand-50…950` (focus ring, links, selected-nav, brand chips)
- **Gold (premium)**: `--iv-amber-50…900` (award, premium, verified tiers, featured — name kept, values are gold)
- **Semantic status**: `--iv-success-*` · `--iv-warning-*` · `--iv-danger-*` · `--iv-info-*` · `--iv-neutral-*`
  — each a 5-step ramp: `-subtle` (tint bg) · `-muted` (text on subtle) · `-base` (solid fill) ·
  `-bright` · `-text` (dark-mode text). **It is `danger`, never `error`.**
- **Text / ink**: `--iv-fg` · `-strong` · `-secondary` · `-muted` · `-heading` · `-heading-strong`
- **Surfaces**: `--iv-surface-*` (dark) · `--iv-light-*` (light) · `--iv-nav-*` (sidebar) · `--iv-chart-1…6`

**⚠️ Ink gotcha — the CSS var and the utility name differ.** The variables are `--iv-fg-*`, but the
Tailwind family is **`iv-ink-*`**: write `text-iv-ink-heading`, `text-iv-ink-secondary`,
`text-iv-ink-heading-strong` — there is no `text-iv-fg-*` class. Every other family keeps its name
(`--iv-navy-700` → `bg-iv-navy-700`).

**There is no generic hue family.** No `--iv-green/yellow/red/blue/slate-*` exists, by design — the
2026-06-30 migration replaced hue-named tokens with the semantic ramps above so colour is chosen by
*meaning*, not by hue. Reaching for a hue name is the tell that you want a semantic token.

**Token pattern:** Named tokens only, no hand-picked hex codes. Use `--primary`, `--secondary`, `--accent` mapped to the palette above.

### Typography
Source: **Doc-7B (Kit Foundation)** — never deviate without architecture approval.
- **Display face:** [check kit for serif/sans choice]
- **Body face:** [check kit for system font]
- **Type scale:** [8-step scale defined in Tailwind config]
- **Font weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold) — no intermediate weights

**Rule:** Use only `text-xs | sm | base | lg | xl | 2xl | 3xl | 4xl` size classes. Never `text-[14px]` (bypasses type scale).

### Layout Patterns

**Sidebar + Content:**
- Navy sidebar (width: 256px or responsive collapse)
- Content area with max-width container
- Stack order: logo/branding → primary nav → secondary → footer

**Card Grid:**
- 12-column grid, 24px gap
- Responsive: 1 col mobile → 2 col tablet → 3–4 col desktop
- Card padding: 16px (small) or 24px (large)
- Border radius: 8px (default, no 4px or 16px without reason)

**Tabs & Sections:**
- Use `WorkspaceTabs` from `src/frontend/shared/` (frozen component)
- Tab content: lazy-loaded where possible
- Always show active state + hover state

**Forms:**
- Use kit primitives: `Input`, `Button`, `Select`, `Textarea` from `src/frontend/`
- No raw `<input>` or `<button>` (duplication = A-lane MINOR)
- Labels above fields, 8px spacing
- Required indicator: red `*` after label text

### Component Inventory (Never Duplicate)

From `src/frontend/`:
- **Brand:** `BrandLogo`, `BrandMark`
- **Navigation:** `SideBar`, `TopBar`, `MegaMenu`, `WorkspaceTabs`
- **Forms:** `Input`, `Button`, `Select`, `Textarea`, `Checkbox`, `Radio`, `DatePicker`
- **Data:** `Table`, `DataGrid`, `Card`, `Badge`, `Avatar`
- **Feedback:** `Toast`, `Alert`, `Modal`, `Tooltip`, `Popover`
- **Layout:** `Container`, `Stack`, `Grid`, `Flex`

**Rule:** Before building a component, check `src/frontend/` — if kit primitive exists, use it. If you need a variant, extend the kit primitive, never rebuild.

---

## Design Decision Flow

1. **Anchor to subject:** What's the page's single job? (e.g., "Buyer approves POs")
2. **Pick a layout pattern:** Sidebar+content? Card grid? Tabs? (reuse from above)
3. **Select palette:** Navy primary + Indigo interactive + Amber accent? (match frozen choices)
4. **Identify components:** Which kit primitives needed? (Input, Button, Card, etc.)
5. **Review against frozen:** Does this match the kit foundation? Any invented patterns?

**When to ask for override:** If you need a pattern NOT in the frozen kit, escalate before building.

---

## Common Pitfalls (Don't Do This)

- ❌ Hand-pick hex colors (use tokens only)
- ❌ Import `MegaMenu` into vendor workspace (wrong context, use `WorkspaceTabs` instead)
- ❌ Build a `<select>` instead of using kit `Select`
- ❌ Use `text-[14px]` instead of `text-sm`
- ❌ Create custom tab component (use frozen `WorkspaceTabs`)
- ❌ Invent new border radius (use 8px standard)
- ❌ Add a 4th color to palette (Navy, Indigo, Gold only + semantics)

---

## Reference

- **Doc-7B:** Kit Foundation (TypeScript, components, tokens)
- **Doc-7C:** Public Shell (layout, typography, theme)
- **Doc-7D–7G:** Buyer, Vendor, Admin, AI UI specs (page-level use of frozen kit)
- **Memory:** `frontend-foundation-frozen.md` (kit is shared platform, extend don't duplicate)
- **Memory:** `brand-palette-migration.md` (Navy dominant, Indigo interactive, Gold premium)
- **Memory:** `official-brand-logo.md` (use `BrandLogo`/`BrandMark` from kit)
- **Token reference:** `src/frontend/theme/tokens.ts` (authoritative palette)
- **Component inventory:** `src/frontend/index.ts` (all exportable primitives)

---

## Checklist Before Submitting

**Reference fidelity (when a reference screen exists for this surface):**

- [ ] Compared the built page against the reference screen side by side — not from memory
- [ ] Composition, grid, hierarchy, spacing rhythm and density match **exactly**
- [ ] No reference markup/CSS/script/logic/data was copied — implementation is ours end to end
- [ ] Every visual difference is either (a) on the approved-divergence list, or (b) escalated and
      ruled — none is an unreviewed judgment call
- [ ] Each approved divergence is recorded in the file header with its cited rule + who ruled it
- [ ] Reference's nav/auth/routing targets were NOT adopted; our real routes are intact

**Data & copy (see §Data & Copy Fidelity):**

- [ ] Every figure on the page traces to a real read — grep the diff for numbers you cannot name the
      read for
- [ ] Zero values imported from the reference's demo data
- [ ] Slots with no read are OMITTED or honestly pending — no plausible-looking filler number
- [ ] Any fixture is disclosed in the file header, supplies SHAPE only, and every field maps to a
      real frozen field
- [ ] **Public/anonymous surfaces display a statistic ONLY if authoritative production data backs it**
      — otherwise the metric is omitted or replaced with truthful non-numeric content (a SEED/demo/
      mockup value is never "backed")
- [ ] Zero `lorem`/placeholder prose (`grep -ri "lorem ipsum"` on the diff)
- [ ] Replacement copy is grounded in approved source (CLAUDE.md §1, frozen corpus, existing
      approved copy) and asserts no traction, statistic, testimonial or date the product lacks

**Foundation:**

- [ ] All colors use token names (`--iv-navy-700`), not hex codes
- [ ] All text sizes use Tailwind scale (`text-sm`, `text-lg`), not pixels
- [ ] No raw `<input>`, `<button>`, `<select>` — used kit primitives
- [ ] Layout matches a frozen pattern (sidebar+content, card grid, tabs)
- [ ] Used `WorkspaceTabs` where tabs needed (not custom tab component)
- [ ] Responsive breakpoints: mobile (base) → tablet (md:) → desktop (lg:)
- [ ] No unnecessary border radius or spacing (use 8px standard, 24px gaps)
- [ ] Palette: Navy primary, Indigo secondary, Gold accent only
