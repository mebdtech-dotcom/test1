# Vendor Profile Template System — High-Fidelity Clickable Prototype

> 🛑 **TEMPLATE NAMES: `OWNER-PROPOSED — architecture amendment required`.** The names
> *Corporate Classic · Modern Industrial · Product Catalogue · Portfolio & Projects · Business Landing*
> appear in this prototype under that label ONLY. They are **not** production semantics and **not**
> corpus-authoritative: the G3 mint proposal was **REJECTED FOR FOLD** (owner/Board 2026-07-21) because
> `Master_System_Architecture_v1.0_FINAL.md:569` (rank 0) and `ADR_Compendium_v1.md:1008` (rank 1,
> ADR-020) already bind **A Directory Style · B Engineering Company · C Manufacturer · D Service
> Company · E Corporate Microsite**. Production renders neutral `Template A`…`Template E` until an
> atomic **Master §8.4 + ADR-020** amendment packet is Board-approved
> (`governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md`).


**Visual Approval:** ✅ **APPROVED — Vendor Profile Template System v1.0** (owner, 2026-07-08). The
Visual Approval Gate is passed; this prototype is the **visual reference for production
implementation**. Locked: Layouts 01–04 as canonical **multi-page** vendor microsites, Layout 05 as
the canonical **single-page** Starter profile, the **7-page** navigation structure (Home · About ·
Products · Projects · Industries · Resources · Contact), Home-as-curated-landing vs dedicated content
pages, and the template selection hub + comparison matrix. Approving the design authorizes production
*refactoring against this UX*; it introduces **no** architecture or business-capability change and no
new routing conventions. Implementation must preserve the shared data model (Content ≠ Presentation),
configurable section visibility/order, existing module boundaries, and the frozen design tokens — any
required visual deviation stops for review first.

**Amendment — pending re-approval (2026-07-08):** owner-directed changes on top of the approved v1.0,
awaiting sign-off: (1) **Industries page removed**; (2) **Resources merged into About** (certifications
+ gallery + downloads now live on About); (3) **Clients** rendered as a slow auto-slide carousel of
logo + text on About; (4) **inter-section spacing tightened**. The multi-page nav is now **five** items
(Home · About · Products · Projects · Contact). ⚠️ **Governance flag:** this five-item nav **diverges
from frozen Doc-7D §10.2** (the canonical seven, "no additions without Board approval"). The prototype
is non-authoritative and coins nothing, but **production implementation of this nav requires a Doc-7D
additive patch + Board sign-off** — recorded here so it is not silently built (§11 Flag-and-Halt).

**Status:** NON-PRODUCTION · quarantined under `prototypes/` (RS v1.1 P-4, excluded from root build
gates) · non-authoritative · coins no route, contract, token, page ID, score, or workflow state. On
any conflict the **frozen corpus wins** (CLAUDE.md §7, §11).

**Purpose:** a mockup-first **Visual Approval** artifact — the same gate used for the Comparative
Statement, Single Product Page and Review System surfaces. It lets stakeholders **compare all five
vendor-profile templates side by side, select a preferred one, and approve the design before any
production code**. Approving it authorizes **no build**: the vendor microsite (P-PUB-13, Doc-7D §10)
stays wave-gated and FE page-IDs / milestones remain Board-only to mint.

**What it is not:** no backend, no API, no database, no Prisma, no server actions, no persistence, no
routing, no auth. **100% mock data.** Every button fires a toast that names the concept; **nothing
transitions or persists** (Phase-P guardrails).

---

## How to review it

Open **[`index.html`](./index.html)** — the hub. Either:

1. **Double-click** it (renders from `file://`), **or**
2. **Serve it** (recommended, so the live side-by-side iframes load cleanly). Use **Node** on this box:
   ```
   npx serve prototypes/vendor-profile-templates
   ```
   then open the printed URL.

The hub has three tabs:

- **Select template** — the **onboarding selection screen**: five selectable template cards (wireframe
  thumbnail · target users · characteristics · focus), a live **Preview** per card, and a sticky
  "Use this template" bar. This is what a vendor sees when choosing their profile during onboarding.
- **Compare** — the **template comparison matrix**: 12 rows (best-for, recommended package, layout
  style, hero, navigation, product/project emphasis, density, length, mobile, "pick if…") × 5 columns.
- **Live preview** — all five templates rendered **for real** as scaled iframes, **Desktop / Mobile**
  toggle. Confirms every template renders the *same data* differently.

### Multi-page vs single-page

Layouts **01–04 are true multi-page microsites** mirroring the frozen canonical seven
(Doc-7D §10.2): **Home · About · Products · Projects · Industries · Resources · Contact** — where
*Resources* is the umbrella for certifications / gallery / downloads (not separate top-level routes).
Clicking a nav item is a real **page navigation**: the page body swaps, the active tab updates, the
view scrolls to top, and the URL gets a `?page=` deep-link. **Home is a curated landing** that links
out via "View all →" into the dedicated pages — exactly like the frozen microsite home.

**Layout 05 is single-page by design** — the Starter package brief calls for a lightweight, mobile-first
single-page profile with *no complex navigation*, so it is intentionally not multi-page.

On mobile the desktop tab bar folds into a sticky, horizontally-scrollable section nav.

Each template page carries a dark **prototype toolbar** (the review harness, not the product):

- **Device** — Desktop · Tablet · Mobile. The *same markup* reflows via CSS **container queries** on
  the device frame (no separate mobile page).
- **Theme** — flips the product between **Light** (primary) and **Dark**, binding to the frozen,
  first-class `.dark` theme (semantic tokens copied verbatim from `app/globals.css`).
- **Sections** — the **section configuration** panel: enable / disable any section live. Demonstrates
  that sections are configurable per vendor **without changing the template**.

**Deep links:** `layout-02-modern-industrial.html?device=mobile&theme=dark`.

---

## The five templates

| # | Template | Structure | Target users | Signature |
|---|---|---|---|---|
| 01 | **Corporate Classic** | Multi-page (7) | Manufacturers · engineering · suppliers | Balanced corporate, curated home, trust up front |
| 02 | **Modern Industrial** | Multi-page (7) | Premium vendors · large orgs · national brands | Full-bleed cinematic hero, bold statistics, leadership team |
| 03 | **Product Catalogue** | Multi-page (7) | Importers · distributors · equipment suppliers | Products-led; Products page has a sticky filter rail + facets |
| 04 | **Portfolio & Projects** | Multi-page (7) | EPC · contractors · fabricators · service providers | Project-led home (case study), full Projects page + timeline |
| 05 | **Business Landing** | **Single-page** | Starter package | Lightweight, mobile-first, no complex nav |

---

## The core principle it proves — Content ≠ Presentation

There is **one** data model — [`assets/data.js`](./assets/data.js) (`IV_VENDOR`) — and **all five
templates read it** through the shared component builders in [`assets/render.js`](./assets/render.js)
(`C.*`). A template only decides **which** sections, in **what** order, with **what** emphasis. Edit
the vendor data once and every template updates. This is Invariant #9 / Golden Rule #4 made visible.

The **shared data model** covers every field in the brief: logo · cover banner · name · verification
badges · trust indicators · business summary · about · core products · categories · services ·
industries · featured projects · gallery · certifications · clients · factory info · team (optional) ·
business info · contact · location map · inquiry/RFQ CTA · social links · download profile · related
vendors. Sections carry an **enable / disable / reorder** registry (`IV_SECTIONS`), surfaced in the
toolbar's **Sections** panel.

---

## File map

```
vendor-profile-templates/
├─ index.html                          # HUB — selection · comparison · live side-by-side
├─ layout-01-corporate-classic.html    # Layout 01
├─ layout-02-modern-industrial.html    # Layout 02
├─ layout-03-product-catalogue.html    # Layout 03 (bespoke catalogue body)
├─ layout-04-portfolio-projects.html   # Layout 04 (featured case study)
├─ layout-05-business-landing.html     # Layout 05 (single-page, by design)
└─ assets/
   ├─ tokens.css     # iVendorz design tokens — copied VERBATIM from app/globals.css (light + .dark)
   ├─ kit.css        # shared component kit (product) + harness chrome (`pc-`) + responsive (container-query)
   ├─ data.js        # THE shared vendor data model + section registry (single source, 100% mock)
   ├─ render.js      # shared component builders `C.*` + page builders (home/about/products/…) — every layout composes these
   ├─ router.js      # client-side multi-page router (data-page nav · ?page= deep-link · scroll-to-top)
   ├─ icons.js       # inline lucide-convention SVG sprite (67 icons, zero external requests)
   └─ prototype.js   # harness: toolbar (device/theme/sections), mock-CTA toasts, gallery lightbox
```

---

## Governance honored (baked into the data + components)

- **Verified = binary.** `verified: true` renders a single "Verified Vendor" badge — no fabricated
  sub-scores (M2.5 microsite convention).
- **Trust indicators = band + numeric (0–100) only** — display-permitted (Board 2026-07-03). The
  prototype **never** shows a formula, weighting, matching, fraud signal, ranking, percentile, or
  "top-N of vendors". Performance-style disclosures are absent.
- **Capability = 4-flag matrix** (`can_supply` / `can_service` / `can_fabricate` / `can_consult`),
  never a single label (Invariant #1).
- **"Featured" products & projects = editorial slice, never a computed ranking** (GI-04). The curated
  order in the data is explicitly not a score sort.
- **No money on-platform.** No price, cart, checkout, escrow or wallet. Every CTA (Request quote /
  Inquire) routes to sign-in and the M3 RFQ engine — "you'll be asked to sign in."
- **Anonymous, read-only** presentation surface — mirrors the frozen public microsite (P-PUB-13).

A build-time sweep (`node` render of all five layouts) confirms **zero** governance leaks — no rating
average, recommendation %, percentile/ranking, on-platform money, or explicit price string anywhere.

---

## Design system

Tokens are copied **verbatim** from `app/globals.css` — **Deep Industrial Navy** dominant, **Electric
Indigo** for interactive states, **Premium Gold** for verified/premium accents, Inter + JetBrains
Mono, the 4px spacing grid, the kit radius/shadow/motion scales. The look targets a premium industrial
SaaS register (Siemens / ABB / Schneider), not a WordPress or consumer-ecommerce theme. Both **light**
(primary) and **dark** themes are first-class and tuned per component (never a naive invert).

**Icons:** ~67 inline lucide-convention `<symbol>`s, stroke 1.75 — zero external icon library.
**Images:** inline SVG placeholder tiles (labelled, gradient, hatched) — zero external requests; the
whole prototype renders under a strict CSP and from `file://`.

---

## Responsive

Container-query driven off the device frame (`.pc-stage`) — the same markup reflows at
Desktop / Tablet / Mobile. Grids collapse (4→2→1), tab nav folds, the catalogue filter rail hides on
narrow widths and a sticky mobile CTA bar appears. No horizontal page scroll at any width (wide content
scrolls inside its own container).

---

## Design assumptions

1. **Anchor vendor** = *Meghna Industrial Valves & Fittings Ltd.* (Narayanganj) — a plausible mock
   Bangladeshi valve/flange manufacturer & fabricator, chosen because it exercises all four capability
   flags and every section (products, projects, services, factory).
2. **"Inter" / "JetBrains Mono"** render via the system fallback stack (no CDN fonts under CSP).
3. **Section defaults** differ per template by *emphasis*, not by available data — every template can
   show every section; the registry toggles them.
4. **No analytics, cookies, or storage** — stateless; nothing persists.

---

## Relationship to the codebase

This prototype presents **one shared model five ways** for the vendor microsite family (P-PUB-13,
Doc-7D §10). **Approving it does not authorise building anything** — production work stays wave-gated
and template selection, section config, and any new page IDs remain Board-only to mint.
