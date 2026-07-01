# Deliverable 3 — Reuse Register (component × page)

**Team 3 · DRAFT v0.1 · pre-ADR · no code changed**
**Purpose:** Team 3's primary QA artifact. Guarantee **zero duplicate components** and **no
subset/full divergence** across the 7 pages. Every "featured/subset" placement must be the **same
component driven by an editorial-slice prop** — never a second copy, never a computed ranking
(GI-04, same discipline as `FEATURED_VENDORS`/`FEATURED_PRODUCTS`).

**Reuse Risk** = risk the migration spawns a duplicate copy or a subset-vs-full divergence:
`LOW` (single page, no variation) · `MEDIUM` (placement unresolved) · `HIGH` (same component on
≥2 pages with subset vs full → must be one prop-driven component).

Page columns: **H**ome · **A**bout · **Pr**oducts · **Pj**rojects · **I**ndustries · **R**esources · **C**ontact.
Placement source = plan §2 (provisional pending ADR).

## Foundation / chrome (all pages via `layout.tsx`)

| Component | H | A | Pr | Pj | I | R | C | Reuse Risk | Note |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|---|
| `VendorMicrositeLayout` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | MEDIUM | moves page→`layout.tsx`; single instance, no dup |
| `VendorMicrositeHeader` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | LOW | unchanged content band |
| `VendorMicrositeNavigation` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **HIGH** | substantive refactor: anchors→route links + `usePathname` active state; stays the single client component |
| `VendorMicrositeFooter` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | LOW | unchanged |
| `VendorBreadcrumb` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | MEDIUM | light: append active page segment |
| `VendorVerifiedBadge` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | LOW | binary badge only — no score |
| `VendorSection` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | LOW | generic section wrapper |
| `VendorHero` | ✓ |  |  |  |  |  |  | LOW | Home only |

## Content components

| Component | H | A | Pr | Pj | I | R | C | Reuse Risk | Note |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|---|
| `CompanyOverview` | ✓(subset) | ✓(full) |  |  |  |  |  | **HIGH** | Home = overview block only; About = +facilities. One component, prop-driven slice |
| `ProductShowcase` | ✓(featured) |  | ✓(full) |  |  |  |  | **HIGH** | featured = editorial slice, not a rank (GI-04) |
| `ProjectShowcase` | ✓(featured) |  |  | ✓(full) |  |  |  | **HIGH** | featured = editorial slice, not a rank (GI-04) |
| `IndustryGrid` | ✓(subset) |  |  |  | ✓(full) |  |  | **HIGH** | subset vs full — one component |
| `CapabilitySection` | ✓(plan) | ? |  |  |  |  |  | **MEDIUM** | **T3-P-01** — plan puts it on Home but `/capabilities`→`/about`; placement contradictory |
| `MissionVision` |  | ✓ |  |  |  |  |  | LOW | About only |
| `ManagementMessage` |  | ✓ |  |  |  |  |  | LOW | About only |
| `CompanyTimeline` |  | ✓ |  |  |  |  |  | LOW | About only |
| `CompanyStatistics` |  | ✓ |  |  |  |  |  | LOW | About only |
| `WhyChooseUs` | ✓ |  |  |  |  |  |  | LOW | **T3-P-03** Board rec: Home only, no nav item (Team 1 confirms in ADR) |
| `CertificationGrid` |  |  |  |  |  | ✓ |  | LOW | Resources only |
| `DownloadCenter` |  |  |  |  |  | ✓ |  | LOW | Resources only (downloads disabled — no fabricated file) |
| `CompanyGallery` |  |  |  |  |  | ✓ |  | LOW | Resources only (decorative placeholder) |
| `CompanyContact` |  |  |  |  |  |  | ✓ | LOW | Contact only |
| `CompanyFaq` |  | ✓ |  |  |  |  |  | LOW | **T3-P-03** Board rec: About (link from Contact if needed); no nav item |
| *Videos* |  |  |  |  |  | (new) |  | — | **no component, no frozen field** — genuine-empty placeholder or omit (Board) |

## Team 3 enforcement rules (apply at Phase 3/4 review)

1. **No duplicate component files.** A page that shows a "featured/subset" view imports the
   **same** component and passes a slice prop. Reject any `*-featured.tsx` copy.
2. **Editorial slice, never computed rank.** Featured/subset props are curated lists (GI-04) —
   no sort/score logic introduced.
3. **HIGH-risk pair audit.** For each HIGH row, diff the Home instance vs the dedicated-page
   instance: identical component, props differ only by the documented slice. Any prop the two
   don't share is a divergence finding.
4. **No new primitive.** Migration is composition only — the 23 exported components are the
   whole surface. `Videos` needs a Board decision, not a fabricated embed.
5. **Foundation single-instance.** `layout.tsx` renders the chrome once; pages render `{children}`
   only. Any page re-invoking `VendorMicrositeLayout` is a defect.

## Findings — Board dispositions

- **T3-P-01 (MEDIUM) — ACCEPT:** `CapabilitySection` placement (Home vs About) contradicts the
  `/capabilities`→`/about` redirect. **Team 1 decides in the ADR** — Home teaser + About full, or
  Capabilities as its own page. Resolve before Phase 3.
- **T3-P-03 (MINOR) — ACCEPT:** `WhyChooseUs` → **Home only**; `CompanyFaq` → **About** (link from
  Contact if needed); **no nav item.** Applied above; Team 1 confirms in the ADR.
