# DS-W2A — Vendor-Profile Template Artifact Audit & Manifest

**Status:** **v0.2 — AUDIT COMPLETE · reference artifacts REMOVED** · NON-AUTHORITATIVE ·
presentation metadata + design direction only (never a second source of truth for M2 content) ·
**coins nothing** · Raise ≠ Accept.
**Date:** 2026-07-20
**Scope:** four **temporary research inputs** (static reference kits, formerly at repo-root
`iVendorz Kit/`), audited by four independent readers. **Owner decision 2026-07-20: the source
artifacts were deleted from the working tree after this audit extracted the useful presentation
patterns.** They were never committed. Citations below name kit files as they existed **at audit
time**; those files no longer exist and are not required.
**Retained output:** this manifest (§1 what they were · §2 findings · §3 keep/discard/synthesize ·
**§3B the normalized design direction**) plus
`docs/product/requirements/digital_showcase_planning_and_design.md`. **No kit HTML, CSS,
JavaScript, component, token, manifest, or demo asset is retained, required, or reusable.**
**Implementation rule:** DS-P2 builds the five canonical templates from §3B + the approved prototype
(`prototypes/vendor-profile-templates/`) on the frozen `--iv-*` token system and production
components — **never from kit source**.
**Gates at issue:** the A–E mapping is **🛑 BLOCKED (G3), not merely unminted** — updated 2026-07-21:
the G3 mint proposal was **REJECTED FOR FOLD** because `Master_System_Architecture_v1.0_FINAL.md:569`
(rank 0) and `ADR_Compendium_v1.md:1008` (rank 1, ADR-020) already bind **A Directory Style ·
B Engineering Company · C Manufacturer · D Service Company · E Corporate Microsite**, unamended. The
proposed mapping is a **REMAP requiring an atomic Master §8.4 + ADR-020 amendment packet**
(`governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md`). Route semantics
undecided (G4 open). **DS-W2A-B1 survives as an implementation guardrail** — no fabricated trust
panel may be recreated.

---

> ## ✅ RESOLVED — Owner ruling 2026-07-20: **hybrid model (Option 3)**
>
> The canonical template axis remains **visual layout style** (01 Corporate Classic · 02 Modern
> Industrial · 03 Product Catalogue · 04 Portfolio & Projects · 05 Business Landing). **The four
> kits do not supersede this system and must never be treated automatically as Templates 01–04** —
> they are **reference content arrangements only** (kit-01 manufacturer/fabricator · kit-02
> engineering-service · kit-03 catalogue/retailer · kit-04 hybrid supply-and-service). Business
> type, capability, and available content determine **section emphasis only**; they must not create
> separate template identities and must not lock a vendor into a template.
>
> Consequences for this document: §0's three options are settled (Option 3); §1's "guessed approved
> analogue" column is **STRUCK — do not use** (there is no kit↔template correspondence to mint, by
> ruling); neutral IDs kit-01…kit-04 are **permanent**; the §4 exit item blocked on canonicality is
> now **cleared**. **DS-W2A-B1 (trust panel) remains a production BLOCKER.** ~~Proposed G3 mint:
> A→Corporate Classic · B→Modern Industrial · C→Product Catalogue · D→Portfolio & Projects ·
> E→Business Landing (corpus verified conflict-free; note frozen `DEFAULT 'A'`).~~
> **🛑 STRUCK 2026-07-21 — "corpus verified conflict-free" was FALSE** (the sweep searched the
> identifier `layout_template` and the five *proposed* names; ranks 0/1 bind the letters in prose).
> The mapping is **OWNER-PROPOSED and BLOCKED pending an architecture amendment** — see the §0
> gates note above.

## 0. The headline finding (read first) — *superseded by the ruling above; retained as the record of why the question was raised*

**The kits are organized by a different axis than the approved Template System v1.0.** The approved
system (owner 2026-07-08, `prototypes/vendor-profile-templates/`) names five templates by **visual
layout style**: 01 Corporate Classic · 02 Modern Industrial · 03 Product Catalogue · 04 Portfolio &
Projects · 05 Business Landing. The four supplied kits are instead differentiated by **vendor
business type**: manufacturer · engineering-service firm · hardware retailer · engineering trader.

These are **two different taxonomies.** "4 kits = approved Templates 01–04, fifth missing" is a
plausible-looking but **unverified and possibly wrong** assumption — a manufacturer template is not
self-evidently "Corporate Classic," and a retailer catalogue template is not self-evidently
"Product Catalogue." **This is the F8 finding, sharpened: the owner must first decide which template
set is canonical** before any name↔artifact↔letter binding (G3) is meaningful:

- **Option 1 — kits reinterpret the approved five:** bind each kit to an approved template name +
  letter (needs the owner to confirm the correspondence and re-approve any visual divergence).
- **Option 2 — kits supersede the approved five:** the business-type set becomes the canonical
  template axis; the approved layout-style set is retired/renamed (a larger design decision — the
  v1.0 visual approval does **not** transfer automatically).
- **Option 3 — hybrid:** layout style and business type are orthogonal (a vendor picks a *layout*
  and the *sections shown* follow content availability) — in which case the kits are four **content
  arrangements of one layout family**, not four templates.

Until the owner rules, production uses neutral internal references (kit-01…kit-04) and binds nothing.

---

## 1. Template manifest (presentation metadata)

Neutral IDs only — **no A–E assignment** (G3). "Approved-template correspondence" is the reader's
best *guess*, explicitly unconfirmed (see §0).

| Neutral ID (permanent) | Source folder | Reference arrangement (mock vendor) | Pages | Nav (verbatim, in order) | Primary emphasis | ~~Guessed approved analogue~~ |
|---|---|---|---|---|---|---|
| kit-01 | `vendor/` | Manufacturer / fabricator-oriented (*Meghna Steel & Fabrication*) | 5 · multi-page | Home · About · Products · Projects · Contact | Trust panel + capabilities + product catalog + project case studies | ~~STRUCK by ruling~~ |
| kit-02 | `vendor2/` | Engineering-service-oriented (*Axis Engineering Services*) | 5 · multi-page | Home · About · **Services** · Projects · Contact | Service disciplines + delivery process + projects | ~~STRUCK by ruling~~ |
| kit-03 | `vendor3/` | Catalogue/retailer-oriented (*Hatiyar Hardware & Tools*) | 5 · multi-page | Home · **Shop** · **Departments** · About · Contact | Department merchandising + faceted product catalogue | ~~STRUCK by ruling~~ |
| kit-04 | `vendor4/` | Hybrid supply-and-service (*Orion Engineering & Trading*) | 5 · multi-page | Home · Products · **Services** · About · Contact | Dual supply + service proposition | ~~STRUCK by ruling~~ |

Separately (not a kit row): canonical **Template 05 Business Landing** (single-page Starter) has
**no supplied implementation artifact** — **G3A** open, locate or commission.

Shared substrate observed at audit time (all four): real cross-page `.html` links (nav was the *only*
JS data model); JS-injected header/footer chrome with a platform back-link, a **cosmetic**
(non-functional) EN⇄বাং language toggle, a persisted dark/light theme toggle, and a "Request a
Quote/Proposal" CTA; every image was an inline-SVG placeholder (no real image assets shipped); and a
kit-local token layer **separate from the frozen `--iv-*` system**. *Recorded as observation only —
none of it is retained or reusable; see §3B for what production rebuilds instead.*

---

## 2. Governance findings (ranked; Raise ≠ Accept)

### DS-W2A-B1 · BLOCKER — fabricated trust panels breach the trust-display firewall
**Every** kit leads its home hero with a "trust card" that renders exactly what the frozen rules
forbid on a public surface. Public vendor microsite = **binary Verified badge ONLY** (Doc-7D §4 /
M2.5 ruling / Trust Score display ruling); a numeric score, a star rating, performance percentages,
and completed-job counts are firewall breaches and are also fabricated.

| Kit | Numeric trust score | Star rating | Count claim | Performance bars (fabricated %) |
|---|---|---|---|---|
| kit-01 | 4.8 | 5★ | "184 completed RFQs" | on-time 97 · responsiveness 94 · quality 99 · repeat 82 |
| kit-02 | 4.7 | 5★ | "210 completed engagements" | 95 · 96 · 98 · 88 |
| kit-03 | 4.9 | 5★ | "1,240 verified orders" | 98 · 96 · 99 · 91 |
| kit-04 | 4.8 | 5★ | "430 completed supply & service jobs" | 96 · 95 · 97 · 89 |

Plus "iVendorz Verified" badges and "Verified on iVendorz" footers on all four. **Disposition
(proposed):** normalization strips the entire panel to the single binary Verified badge (DS-P1 owns
the badge projection from the M5 public signal); the score/stars/percentages/counts must never reach
production. This is a hard gate on DS-P2, not a nitpick.

### DS-W2A-M1 · MAJOR — "Services" and "Departments" are presentation, not data (F7 CONFIRMED)
No kit has a services, departments, disciplines, or products **data model** — the only JS data
structure in every kit is the nav `VENDOR.pages` array; all business content is hand-written HTML
(`site.js`/`vendor.js` confirmed in all four). **So no kit pressures the frozen M2 model toward a
new aggregate** — F7's core worry is disproven at the code level. *However*, the presentation IA
diverges: kit-02/kit-04 expose a **Services** nav route and kit-03 a **Departments** nav route, none
of which exists in the canonical-seven public IA (Doc-7D §10). kit-03's "departments" is
additionally **hard-coded three inconsistent ways** (8 home cards vs 6 product-filter facets vs 8
contact-form options, mixing a service — "Trade counter" — into the category set), with no source of
truth. **Disposition (proposed):** services/departments render as presentation over
`profile_sections` or map onto admin-governed **categories** (departments ≈ product categories);
they never become routes or aggregates. Reinforces G2 (re-affirm the canonical seven).

### DS-W2A-M2 · MAJOR — every kit's nav diverges from the canonical seven, and each differently
Canonical seven (Doc-7D §10, approved): Home · About · Products · Projects · Industries · Resources ·
Contact. Actual kit navs: kit-01 `Home/About/Products/Projects/Contact`; kit-02
`Home/About/Services/Projects/Contact`; kit-03 `Home/Shop/Departments/About/Contact`; kit-04
`Home/Products/Services/About/Contact`. **None matches; all four differ from each other.** This is
the F2 amendment-divergence made concrete. **Disposition (proposed):** normalization maps every kit
nav onto the canonical seven (Products=Shop; Services/Departments → sections, not routes; add
Industries/Resources where content exists) — or the Board rules per-template visible-nav composition
under G2. No kit nav ships as-is.

### DS-W2A-M3 · MAJOR — kit token layer must not enter production · **CLOSED by artifact removal**
Each kit shipped its own token layer and primitive components; production already has the frozen
Doc-7B kit and `--iv-*` system. **Disposition:** the risk is now structurally eliminated — the kit
CSS, tokens, and primitives were **deleted** and cannot be imported. DS-P2 rebuilds the §3B.1 visual
character on frozen tokens (note the reference amber ran brighter than the frozen premium gold —
use the frozen gold).

### DS-W2A-N1 · MINOR — accessibility gaps consistent across all four
No programmatic label association (labels lack `for`/`id`), decorative SVGs unlabeled (no
`aria-hidden`), no skip-link, hamburger lacks `aria-expanded`, active nav uses a CSS class not
`aria-current`, language toggle is cosmetic. **Disposition (proposed):** DS-P1 shared-runtime
accessibility layer supplies all of this; kits set the bar visually, not for a11y.

### DS-W2A-N2 · MINOR — pervasive fabricated demo content (expected, but must not survive wiring)
Fabricated vendor names, statistics (turnover/throughput/counts/years), certifications (ISO/ASME/
BSTI/CE), client logos, named staff, contact details, stock/availability states, product/project/
service names. Images are placeholders (no real `<img>` — nothing to strip there). **Disposition
(proposed):** reference-fidelity directive already binds this — copy visual patterns, never the
data; wired reads replace all of it; genuine-empty where a field is unwired. DS-P3 proof #9 verifies
no demo content survives.

### DS-W2A-O1 · OBS — kits are multi-page with real routing (aligns with "Templates 01–04 = multi-page")
All four are genuine multi-page sites with cross-page links — consistent with the approved system's
"Layouts 01–04 = multi-page, 05 = single-page Starter." The *cardinality* fits; the *identity* does
not (see §0). Neutral observation feeding the G3/G3A decision.

---

## 3. Normalization rules — keep / discard / synthesize

**Kept — as documented design direction in §3B, not as code:** the navy-forward industrial visual
character · section rhythm and layout composition · multi-page structure · catalogue and faceted-
filtering presentation patterns · project/case-study presentation patterns · the four business-shaped
content arrangements · responsive composition behavior.

**Discarded — never ported, and now physically absent from the tree:** the fabricated trust panel
(B1) · the kit token layer and primitive components (M3) · the Services/Departments/Shop **routes**
(M1/M2 → sections) · all fabricated demo data (N2) · the cosmetic language toggle · the kit's own
chrome wiring (the production shell owns chrome) · every line of kit HTML/CSS/JS.

**Synthesized in production:** one shared public runtime (DS-P1) owning routing, published-only
loading, 404 byte-equivalence, the binary Verified badge projection, and the §3B.7 accessibility
floor; over it, five per-template compositions (DS-P2) built from §3B + the approved prototype on
frozen tokens and production components, all consuming the one M2 projection.

---

## 3B. Normalized design direction — **THE RETAINED OUTPUT** (source artifacts removed)

> This section is the durable replacement for the deleted kits. It records the **design direction**
> extracted by the audit — patterns, rhythm, and composition — in implementation-neutral prose.
> It is **not** a code specification and contains no kit markup, CSS, tokens, or data.
> **DS-P2 implements the five canonical templates from this section + the approved prototype
> (`prototypes/vendor-profile-templates/`), never from kit source code** (which no longer exists in
> the tree). Everything below must be rebuilt on the frozen `--iv-*` token system and the Doc-7B
> production kit.

### 3B.1 Visual character
Navy-forward industrial: a deep navy primary with a slightly lighter navy for gradient depth, used
for headings, primary fills, and hero scrims; a restrained gold/amber accent for premium or
highlight moments only; success-green reserved for status. Light theme is the primary experience,
with a full dark counterpart driven by semantic-token reassignment (never per-component overrides).
Surfaces are near-white on a cool off-white page; borders are low-contrast; elevation is expressed
through soft, wide, low-opacity shadows rather than heavy outlines. Type pairs a humanist sans for
UI/prose with a monospace face for figures and technical labels. **Mapping rule:** the reference
navy corresponds to the frozen heading/gradient navy already in the `--iv-*` system; the reference
amber is *brighter* than the frozen premium gold — **use the frozen gold**, do not reintroduce the
reference value. No new color is coined by this document.

### 3B.2 Chrome
Sticky translucent header with backdrop blur over a hairline bottom border: brand mark + vendor name
+ a small locality/established tagline on the left; primary nav centered/left-adjacent; a right-side
utility cluster (theme toggle, plus a platform back-link and a primary CTA button). Footer: brand
block with a short blurb, three link columns, a bottom bar with copyright, and a social row.
**Constraint:** in production the platform shell owns chrome — the vendor-branded header/footer are
*content bands within* the shell, never a chrome replacement; the reference's own back-link, language
toggle (which was cosmetic and non-functional), and CTA wiring are **not** ported.

### 3B.3 Section rhythm (the reusable composition vocabulary)
The reference set converges on a consistent page grammar — this is the most valuable extracted asset:

- **Home:** hero (headline · supporting line · credential chips · dual CTA · side panel) → quick-stats
  band (4 figures) → primary grid of 6–8 icon cards (capabilities *or* services *or* departments) →
  split feature (media + 4-item checklist) → client/principal logo row (5) → closing CTA band.
- **About:** page hero with breadcrumb → story split (media + narrative) → stats band → milestone
  timeline (5 entries) → credentials/certifications grid (4) → CTA band.
- **Catalogue:** page hero with breadcrumb → catalog body = persistent left filter sidebar (grouped
  facets with counts + "clear all") beside a responsive card grid, with a result-count toolbar above.
- **Projects / case studies:** page hero with breadcrumb → sector filter chips (All + 4) →
  case-study card grid (6), each card carrying a three-metric triplet → CTA band.
- **Services / disciplines:** page hero → numbered deep-dive splits (01/02/03, each with a
  capability list) → supporting-services grid (3) → numbered process steps (4) → CTA band.
- **Contact:** page hero → two-column: enquiry form beside an info column (location card, hours/
  contact card, team card).

**Card patterns:** *product* — media slot, title, spec chips, availability state, quote CTA;
*case study* — media slot, title, sector chip, three labeled metrics; *capability/service/department*
— icon, title, short description, tag chips. **Quote-driven, never price-driven:** the reference set
shows no prices anywhere; every commercial CTA is "request a quote."

### 3B.4 Catalogue & filtering presentation
Faceted filtering presented as grouped checkbox lists with per-facet counts, a clear-all affordance,
and a live result count; filters sit in a left rail on desktop and stack above the grid on mobile.
Sector/category filtering on case studies uses a horizontal chip row instead of a rail. **Constraint:**
in production, sort/filter must re-query the governed contract with contract parameters — never a
client-side reorder of a paged result set, and never any re-ranking on the public surface.

### 3B.5 Content arrangements (presentation guidance only — §3A.0)
Four business-shaped **arrangements**, retained as guidance for *which sections to emphasize*, never
as template identities and never vendor-locking:
- **Manufacturer / fabricator:** capabilities grid + product catalogue + project case studies;
  proof through facility/throughput figures; certifications prominent.
- **Engineering service:** discipline deep-dives + delivery-process steps + projects; no catalogue.
- **Retailer / catalogue:** department/category grid + heavily faceted catalogue; breadth-of-range
  and availability emphasis. *(Departments must map to admin-governed categories — never a new grouping.)*
- **Hybrid supply-and-service:** a "two sides of one partnership" split giving equal weight to supply
  and service, with parallel product and service sections plus a principals/brands row.

Realization: emphasis is expressed through `profile_sections` order/visibility over **any** chosen
layout template — this is the mechanism the hybrid ruling relies on.

### 3B.6 Responsive behavior
Mobile-first collapse with two meaningful breakpoints: a hamburger-driven nav below the smaller
breakpoint, and progressive hiding of secondary nav items at the intermediate width. Multi-column
grids step 4→2→1; the catalogue rail stacks above its grid; split sections stack media-over-content;
stats bands wrap rather than scroll.

### 3B.7 Accessibility floor (the reference set did NOT meet this — production must)
Programmatically associated form labels; `aria-expanded` on the nav toggle; `aria-current` for the
active nav item; decorative icons hidden from assistive tech; meaningful alternatives for
non-decorative imagery; a skip link; visible focus states; honored reduced-motion; and any live
result count announced. The references demonstrated none of these — they set the visual bar only.

### 3B.8 Binding constraints carried into implementation
Trust firewall (§2 B1 — binary Verified badge only; never a score, star rating, performance
percentage, or completed-job count) · canonical seven public routes (no Services/Departments/Shop
routes) · frozen `--iv-*` tokens and Doc-7B primitives only · the accessibility floor above ·
**no demo data** (wired reads or genuine-empty; never fabricated names, figures, certifications,
clients, people, contact details, or availability states).

## 4. Exit checklist (DS-W2A) — status

- [x] All supplied templates audited (4 of the intended 5).
- [x] Missing fifth (Business Landing / single-page Starter) identified — **G3A: locate or commission.**
- [x] No A–E mapping asserted (G3 open); no route semantics asserted (G4 open).
- [x] **Duplicate/contradictory identity resolved** — ✅ cleared by the owner's hybrid ruling
      (2026-07-20): layout style is the canonical axis; kits are reference arrangements with
      permanent neutral IDs, so no competing template identity exists.
- [x] Per-feature F7 disposition recorded (M1).
- [x] **Provenance/licensing — historical note + disposition.** *At intake* the kit's origin was a
      v0/SPA export and its licensing was **unrecorded**; the artifacts were quarantined and never
      committed. **Disposition (owner, 2026-07-20): source artifacts removed from the working tree ·
      no code, token, asset, or markup reuse · no continuing licensing dependency.** Only
      implementation-neutral design direction (§3B) was retained, so **G3B is retired** — licensing
      no longer gates implementation.

**Feeds:** G3 (name↔letter mint — **READY**, axis ruled, corpus conflict-free) · G3A (missing
Business Landing artifact) · ~~G3B~~ (**RETIRED** — no retained kit source ⇒ no licensing dependency)
· G2 (nav → canonical seven, M2) · DS-P1/P2/P3 (§3 rules + §3B design direction) · plan F7
(confirmed) / F8 (resolved by ruling; licensing leg closed by artifact removal). Rulings of record:
`digital_showcase_planning_and_design.md` v0.6 §3A.0 (hybrid model) and §3A.1 (artifact removal).
