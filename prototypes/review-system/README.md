# Review System — High-Fidelity Clickable Prototype

**Status:** NON-PRODUCTION · quarantined under `prototypes/` (RS v1.1 P-4, excluded from root
build gates) · non-authoritative · coins no route, contract, token, page ID, score, or workflow
state. On any conflict the **frozen corpus wins** (CLAUDE.md §7, §11).

**Visual approval:** ✅ **GRANTED (owner, 2026-07-08)** — the UX/visual direction for Surfaces 1–5
is signed off. This is a **design** approval only; it authorizes no production build. The backend
stays roadmap-gated (M5 = Wave 3 · M8 moderation = Wave 5; current = Wave 2) and FE page-IDs /
milestones remain **Board-only** to mint. Open item folded next: Surface 2 card layout — Option A
(testimonial) vs Option B (compact feed).

**Purpose:** a mockup-first **Visual Approval** artifact for stakeholder review **before any
production code** — the same gate used for the Comparative Statement and Single Product Page
surfaces. It validates information architecture, visual hierarchy, state coverage, lane
separation, and responsive behaviour for **all five review surfaces** defined in
[`docs/product/requirements/review_system_planning_and_design.md`](../../docs/product/requirements/review_system_planning_and_design.md).

**What it is not:** no backend, no API, no database, no Prisma, no server actions, no
persistence, no moderation workflow, no state transitions, no permissions, no audit, no
contracts. 100% mock data in one self-contained HTML file. Every button fires a toast
explaining the concept; **nothing transitions or persists** (Phase-P guardrails). Opening
[`index.html`](./index.html) in any browser (from `file://` or a host) is the whole experience.

---

## How to review it

Open [`index.html`](./index.html). A dark **prototype toolbar** sits at the top — it is the
review harness, *not* part of the product. It gives you:

- **Surface switcher** — the five surfaces, each tagged with its lane colour dot
  (● navy = Lane PUB · ● violet = Lane ADM · ● gold = Lane CRM).
- **State switcher** — rebuilds per surface; click through every state (empty / filled /
  success / loading / error / view-only / …).
- **Device switcher** — Desktop (1280) · Mobile (390). The frame reflows through the *same
  markup* via CSS container queries and scales to fit the stage.
- **Annotations toggle** — overlays a governance flag on every grounded/proposed/gap region
  with a hover/click note citing what is grounded and what is not.

**Deep links** (share a specific view): `index.html?surface=s3&state=approved&device=mobile`.
`surface` = `s1…s5`; `state` = the surface's state slug; `device` = `mobile`.

---

## Round 2 refinements (2026-07-08)

A refinement pass (no implementation) addressing the Round-1 review notes:

- **Surface 2 — two public-review card layouts to compare** (State switcher → *Cards · Option A*
  vs *Option B*):
  - **Option A — testimonial:** spacious card, neutral medallion + stars + "Verified engagement"
    on one row, mono date top-right, prominent body.
  - **Option B — compact feed:** fixed left rail (medallion / stars / date), body with a navy
    accent — higher density, more reviews per screen.
  - **Avatar treatment (governance-critical):** both use a **neutral verified-engagement
    medallion** — *provenance, not identity*. The frozen public read shape carries **no author**
    (name/org/photo), so no identifying avatar is possible without a new contract field; the
    medallion only means "from a real, completed engagement." Flagged on-screen.
  - **Long-review example** included in both layouts and in the Surface 3 case detail to test
    wrapping/spacing. **Timestamps** are monospace absolute dates. **Scrolling** uses a
    grounded *Load more* pagination affordance — **no total count** is shown (a listing count is
    the open §9(a) question).
- **Surface 3 — high-density moderation queue:** 9 rows, compact cells, sticky header, an **Age**
  column, fixed column widths with truncation; long review in the case detail.
- **Surface 1 — polish:** more generous, spring-eased star spacing; a confirmation "pop"; a
  "Back to engagement" action on the success state.
- **Surface 4 — quieter privacy signal:** the loud amber banner is replaced by a small
  "Private to your org" lock **pill** at the data plus a calm, neutral footer note (gold CRM
  stars retained for lane identity).
- **Surface 5 — reads as an internal staff tool:** a hatched monospace "INTERNAL · Staff Trust
  console" strip and a utilitarian mono metadata panel (opaque vendor ref, staff id, ISO
  timestamp).
- **Animation polish:** subtle state-in fade, card hover-lift, star spring, confirmation pop —
  all disabled under `prefers-reduced-motion`.
- **Accessibility pass:** star input is a keyboard `radiogroup`; queue header sticky with an
  `sr-only` caption; status by chip text + colour; reduced-motion honoured; focus-visible rings.

---

## The five surfaces

| # | Surface | Lane | Context | States |
|---|---|---|---|---|
| 1 | Buyer review submission | PUB | Buyer workspace, from a completed engagement | Empty · Filled · Success · Not eligible · Already reviewed (view-only) |
| 2 | Public reviews | PUB | Anonymous vendor public microsite | Cards · Option A (testimonial) · Cards · Option B (compact feed) · Empty · Loading (desktop + mobile) |
| 3 | Admin moderation | PUB (staff) | Admin console | Submitted → moderate · Reject (note required) · Approved → publish/remove · Empty queue |
| 4 | Private CRM rating | CRM | Buyer workspace CRM record | Saved ratings · Add/edit · Empty |
| 5 | Admin ratings | ADM (staff) | Admin console | With history · Update · Empty |

---

## Governance annotation layer (the review's spine)

Toggle **Annotations** in the toolbar. Every governed region carries a flag:

| Flag | Meaning |
|---|---|
| **GROUNDED** (green) | The frozen corpus permits this today (contract / journey / display rule bound by pointer). |
| **PROPOSED** (violet) | A presentation-owned decision that needs sign-off (not yet used — the surfaces stay within grounded behaviour). |
| **GAP** (red) | A genuine gap surfaced by the planning package — shown so it is not silently built. |

Annotation colours are **prototype-chrome only**, deliberately outside the product palette, so
they can never be mistaken for product status colours. The two flags actually used:

- **Surface 1 · Success → GAP (§9(e)):** the `submitted` status shows from the `submit_review`
  response as a one-time confirmation. There is **no frozen author-scoped read** to re-fetch
  later moderation status — a "my reviews" tracker has no backing contract.
- **Everything else → GROUNDED**, bound by pointer to `Doc-4G_PassB_Part5_BC-TRUST-5`
  (public reviews + admin ratings), `Doc-4F_PassB_Part1_BC-OPS-1` (private CRM ratings), the
  `J-REV` journey, and `Doc-7D` (public display).

### Governance guarantees demonstrated (and self-audited in the build)

- **No derived review statistics anywhere** — no average, no star-average, no review
  count-as-score, no recommendation %. Surface 2 makes this an explicit on-page guarantee
  ("No overall score, average, or recommendation percentage is shown"). *(A build-time check
  greps the rendered copy for these phrases and fails on a leak.)*
- **Only `published` reviews are public**, rendered via the Marketplace projection — the public
  card shows exactly `rating`, `body`, published date, and a "Verified engagement" marker;
  **no author identity** (the frozen public read shape carries none).
- **Three lanes kept visually + structurally separate:** Public reviews use **navy** stars;
  private CRM ratings use **gold** stars + numeric score; admin ratings use **violet**. No
  surface co-locates them.
- **No vendor replies. No new workflow states.** The only statuses shown are the five frozen
  ones (`submitted / approved / published / rejected / removed`).
- **Staff / private lanes are firewalled in the copy:** admin ratings are "never shown to the
  vendor, to buyers, or on any public surface"; CRM ratings are "private to your organization
  … never affects any platform score or public review."

---

## Component inventory

Hand-built to the frozen kit's conventions (**not** the real React kit). Tokens copied
**verbatim** from `app/globals.css` (light theme = primary). Product primitives use plain kit
classes; all review-harness chrome uses a `pc-` prefix and off-palette colours.

**Chrome (`pc-`)**
- Prototype toolbar (surface / state / device switchers + annotations toggle + legend),
  device frame (container-query rig + scale-to-fit), annotation chips + shared tooltip,
  toast rack (`aria-live`).

**Kit-convention primitives**
- `.btn` variants: `primary` (navy gradient), `outline`, `ghost`, `success`, `danger`; sizes `sm`/`lg`/`block`.
- `.badge` variants: `success`, `warning`, `info`, `danger`, `neutral`, `navy` — the review
  **status vocabulary** (submitted → warning, approved → info, published → success, rejected →
  danger, removed → neutral), matching the app's moderation-seed tone convention.
- `.card`, `.chip`, `.field-input` / `.field-textarea` / `.field-label`, `.empty-state`
  (dashed border, mirrors the real `EmptyState`), `.sk` skeleton loaders.

**Review-specific components**
- **`RatingStars`** — display + input modes; navy (public), gold (`[data-gold]`, CRM), violet
  (`[data-violet]`, admin). Input mode is a keyboard-operable `radiogroup`.
- **`ReviewCard`** — one published review (stars + body + date + "Verified engagement"); no author.
- **Engagement banner** (Surface 1 entry), **AdminQueueTable + case-detail split** (Surface 3,
  mirrors the shared `admin-queue-table.tsx`), **CRM ratings card** (Surface 4, activates the
  parked `crm-detail-view.tsx` card), **admin rating + history timeline** (Surface 5).

**App-shell chrome (three distinct lane contexts)**
- Buyer/admin **workspace shell** (navy rail + topbar + breadcrumb) and public **site shell**
  (white header + footer). Lane tags in the topbar: `Lane PUB` / `Lane CRM` / `Lane ADM`.

**Icons:** ~26 inline lucide-convention `<symbol>`s, stroke 1.75 — zero external icon library.

---

## Interaction notes

| Interaction | Behaviour |
|---|---|
| Surface switch | Shows one surface, rebuilds the state switcher from that surface's states, resets scroll, refits. |
| State switch | Toggles the active state block; in-surface buttons (Reject, Add rating, Update…) jump between states via `data-goto-state`. |
| Star rating (input) | `radiogroup` — click a star to set the value; label updates ("4 / 5"); a gated Submit enables only once a rating is chosen. |
| Reject (Surface 3) | Opens a required moderation-note field; the Reject button stays disabled (`aria-disabled`) — mirrors the frozen "note required on reject" BUSINESS rule. |
| Publish (Surface 3) | Toast explains the frozen two-step: publish + audit atomic, Buyer-Feedback ingestion retried separately. |
| Any action button | Fires a mock toast naming the contract and stating nothing persists. No state machine is emulated (Phase-P). |
| Annotations | Toggle overlays per-region flags + dashed outlines (zero layout shift); hover/click a chip for the grounding note. |
| Device switch | Sets the frame width; page reflows via `@container`; JS scales the frame to fit the stage. |
| Toasts | Single rack, `aria-live="polite"`, capped at 3, auto-dismiss ~3.6 s. |

---

## Responsive notes

Container-query driven (`@container page`) on the device frame — one breakpoint band at
**≤ 720px**; the *same markup* adapts (no separate mobile page). Key transforms:

- **Workspace / admin shells:** the navy rail collapses (hidden) at mobile; content goes full-width.
- **Admin moderation:** the queue + detail split (`1.35fr / 1fr`) stacks to a single column; the
  detail panel un-sticks. The queue table scrolls horizontally inside its own container.
- **Public microsite header:** avatar + name stay inline; the section tabs drop to a full-width
  scrollable row.
- **Forms / cards / review cards:** re-flow to single column; action buttons stretch to fill.
- **No horizontal page scroll at any width** (wide content scrolls inside its own container).

---

## Accessibility notes

- Skip link to the prototype; visible focus ring (`:focus-visible`, 2px indigo `--iv-brand-500`).
- Landmarks (`header` / `nav` / `main` / `aside` / `footer`); sections `aria-label`led.
- Star input is a `radiogroup` with `aria-checked` per option; display stars use
  `role="img"` + `aria-label` ("Rated 4 out of 5").
- Queue table has an `sr-only` caption; status conveyed by chip **text**, not colour alone.
- Toasts are `aria-live="polite"`; the loading state is `aria-hidden`.
- Contrast pairs use the frozen light-theme inks (dark text on tinted status chips; navy on
  white; muted `#5f6f86` tuned for AA on gray surfaces).
- `prefers-reduced-motion` is respected by keeping motion to short, non-essential transitions.

---

## Design assumptions

1. **Anchor vendor** = "Padma Valve & Fittings Ltd." (Verified); engagement `ENG-2026-000418`.
   All review prose is plausible mock content authored for realism.
2. **"Inter" / "JetBrains Mono" render via the system fallback stack** (no CDN fonts under a
   strict CSP). Pixel-accurate where the fonts are installed; nearest system face otherwise.
3. **The workspace/admin rail uses the navy treatment** (`--iv-navy-800`), per the ratified
   navy-sidebar direction, to maximise lane separation for review. The currently-built app shell
   token `--iv-nav-bg` is a light industrial-gray — a known, deliberate presentation choice for
   this prototype, flagged here for the reviewer.
4. **Status → tone mapping** (submitted→warning, approved→info, published→success,
   rejected→danger, removed→neutral) is presentation-owned, following the app's moderation-seed
   convention. The five status *slugs* are frozen; the tones are not.
5. **Review ordering** on Surface 2 is newest-published-first — a presentation default (the
   corpus freezes no sort; `list_reviews` allowlists sort fields).
6. **No analytics, cookies, or storage** — the prototype is stateless; nothing persists.

---

## Relationship to the codebase

- This prototype realises **Surfaces 1–5** of the planning package
  (`docs/product/requirements/review_system_planning_and_design.md`), which itself is bound by
  pointer to the frozen `Doc-4G_PassB_Part5_BC-TRUST-5`, `Doc-4F_PassB_Part1_BC-OPS-1`,
  `Doc-5G`, `J-REV`, and `Doc-7D`.
- **Approving this prototype does not authorise building anything.** Production work stays
  wave-gated (M5 backend = Wave 3; M8 moderation leg = Wave 5; current = Wave 2) and the FE
  page-IDs / milestones remain **Board-only** to mint. The GAP flag (author review-status read,
  §9(e)) and the open design questions (§9 of the planning package) must be adjudicated before
  the surfaces they touch are built.
