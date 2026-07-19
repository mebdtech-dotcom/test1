<!--
Status:     Freeze Candidate (v0.9-rc)
Coverage:   Complete - all EA Hard Review findings (B1-4, M5-10, MIN11-15) + the missing-intermediate-layer observation.
Freeze:     BLOCKER = 0 (all three platform/authority BLOCKERs RESOLVED). [ESC-7G-A7] ruled
            2026-07-12 (see governanceReviews/BOARD-PACKET-A7-HYBRID-COMOUNT-REALIZATION_v0.1.md);
            [ESC-7G-SCORE-DISPLAY] and [ESC-7B-TRUSTSCORE] RESOLVED 2026-07-03 (see
            governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md). Promotion to FROZEN v1.0
            requires a separate explicit Board/owner freeze action; the §10.1 MAJOR/MINOR
            contract-gap items are tracked non-freeze-blocking per this doc's own §12.2 tally.
Reason:     (superseded — see Freeze line above).
Authority:  NON-AUTHORITATIVE design companion - realizes the UX of FROZEN Doc-7G.
            Coins no mechanism/contract/ownership/invariant. On any conflict the frozen
            generatedDocs/ corpus wins (CLAUDE.md section 7). NOT part of the frozen corpus -
            must not live in generatedDocs/. Sibling of buyer_planning_and_design.md.
Produced:   2026-06-30 (multi-agent workflow; Board-adjudicated synthesis).
Track-2:    Applied 2026-06-30 - 18/18 contract escalations dispositioned (see Sec.12 Track-2 Disposition Log).
            MAJOR conformance defects = 0; 2 genuine contract gaps routed to the API Governance Board ([ESC-7-API] x2);
            3 BLOCKERs remain with the human Board. Gate: still WITHHELD.
Track-3:    Applied 2026-06-30 - Sec.13 addendum folded in (Leads 13.2, Engagements 13.3, quote-builder 13.1); the Sec.10.3 completeness gap is FILLED, MAJOR-10 discharged.
            +9 new [ESC-...] contract questions raised to the API Governance Board / corpus reconciliation (Sec.13.4); NO new BLOCKER. Gate: still WITHHELD.
Track-4:    Applied 2026-07-19 (ADDITIVE, Team-1 build order F7) - Cluster #1 nav re-home recorded: PL-1's
            standalone "Leads / Pipeline" destination ((app)/leads) is SUPERSEDED by an Inbox ⇄ Pipeline
            `?view=` toggle on the RFQ workspace (/sell/rfqs); /sell/leads 308-redirects there; the
            per-lead detail route is kept. Also Cluster #2 C4: the vendor "Buyer CRM" surface renders the
            USER-FACING label "Buyer Relationships" (internal domain term unchanged). See §2.2 note.
            Additive only - no frozen doc touched; companion conforms upward (CLAUDE.md §7). NO new BLOCKER.
-->

# iVendorz Vendor Workspace — Planning & Design (Track 3)

> **Status:** NON-AUTHORITATIVE design companion. This document realizes the **UX** of the FROZEN **Doc-7G Vendor Workspace** on top of the FROZEN **Doc-7A** (Frontend Realization Metastandard), **Doc-7B** (Design System & Component Kit), and **Doc-7C** (App Shell & Data Layer). It coins **no** mechanism, contract, ownership boundary, or invariant. It binds frozen entities, contracts, states, and invariants **by pointer** (reference-never-restate). On any conflict with a frozen document it does **Flag-and-Halt** (cite both sides, raise `[ESC-…]`, escalate) and never resolves locally. Vendor FE realization is **roadmap-gated** (Wave 3 per the program build phase); this is planning ahead of that gate.
>
> **Authority order honored (CLAUDE.md §7):** Frozen Architecture Corpus ≻ ADRs ≻ … On any divergence the frozen `generatedDocs/` document wins and this companion is patched to match.

---

## 0. Front Matter

### 0.1 What this is
One cohesive design for the entire vendor surface: Dashboard, Company Profile (Content), Microsite (Presentation), Product/Catalog, the Quotation Workflow (the moat), and the cross-cutting UX system (states, status taxonomy, forms, responsive, a11y, i18n). It is the synthesis of five independently-authored area designs and their independent conformance + ux-quality reviews. As presiding author I have applied the **Validate-Findings gate** (Valid? Applicable? Best for the product? Consistent with the frozen corpus?) to every finding; every valid BLOCKER/MAJOR/MINOR is implemented into the design below, and every rejected finding is recorded with a one-line disposition in §10.

### 0.2 Scope
- **In scope:** screens, flows, IA, visual + interaction patterns, component composition (kit by name), per-screen conformance tables, the non-disclosure/byte-equivalence playbook, the cross-cutting state/forms/a11y/i18n system, and proposed additive kit components.
- **Out of scope (by pointer only):** any change to a frozen mechanism/contract/state machine; the buyer workspace (Doc-7F); admin surfaces (Doc-7H); the matching engine and all out-of-wire contracts.

### 0.3 Authority pointers (all FROZEN; bound, never restated)
| Concern | Pointer |
|---|---|
| Frontend realization rules | Doc-7A **R1–R12**; conformance checks **CHK-7-xxx** (Appendix A) |
| Design kit / tokens | Doc-7B (semantic tokens; primitives/components/embedded; non-disclosure primitives) |
| App shell / data layer / routing | Doc-7C (route groups; server-resolved active org; org switcher; notification center; server-only typed client; `file_ref` only) |
| Vendor workspace | Doc-7G (**GR12 = "nothing coined / never invokes the engine"**; **embedded-component mandate = Doc-7G §11.1 / `CHK-7-005`**; **byte-equivalence carrier = `CHK-7-040`**) |
| State machines | **Doc-4M** (RFQ Invitation + Quotation machines are authoritative) |
| Owning modules | Doc-4C (M1 Identity), Doc-4D (M2 Marketplace), Doc-4E (M3 RFQ), Doc-4F (M4 Operations), Doc-4G (M5 Trust), Doc-4I (M7 Billing) |
| Vendor-leg contracts | Doc-5D (M2 vendor), Doc-5E (M3 vendor), Doc-5F (M4 vendor), Doc-5G (M5 reads) |

> **Doc-7G GR# → §# mapping (corpus-anchored; cite the rule by section, not as a free-floating name).** Per `Doc-7G_Content_v1.0_Pass2.md:7`, the GR rules map to structure sections: **GR6 = §6** (invitation inbox/response), **GR7 = §7** (quotation authoring/versioning), **GR8 = §8** (lead pipeline), **GR9 = §9** (post-award vendor-leg), **GR10/GR11 = §10** (state-machine & byte-equivalence — **GR11 is the byte-equivalence rule**, line 20/46), **GR12 = §11** (composition/data/conformance; the binding "**never invokes the engine; nothing coined**" rule, line 108). The **four embedded components** (own trust badge, billing/quota indicator, AI advisory panel, M6 clarification thread) are mandated by **§11.1 and gated by `CHK-7-005`** (lines 82, 97) — **not** by GR12. Throughout this document the embedded-component obligation is bound to **Doc-7G §11.1 / CHK-7-005**, the byte-equivalence rule to **GR11 / §10 / CHK-7-040**, and **GR12 is reserved for "coins nothing."** (An earlier synthesis mis-cited "GR12 embedded-component mandate" in §0.3/§3/§6; corrected here.)

> **Anchor correction (adjudicated against the frozen corpus — BLOCKER/​MAJOR in two area reviews).** The load-bearing byte-equivalence attestation for the **frontend** is **`CHK-7-040`** (`Doc-7G_SERIES_FROZEN_v1.0.md:35`: "`CHK-7-040` is the load-bearing byte-equivalence carrier"). **`CHK-6-022`** is the **DB-layer** (Doc-6E) realization of the same invariant — it is real but belongs to the database tier, not the frontend. Throughout this document the frontend attestation is bound to **CHK-7-040 (Invariant 11 / the Doc-7G byte-equivalence attestation, GR11/§10)**, with CHK-6-022 cited only as its DB counterpart. The company-profile and quotation/cross-cutting area drafts that cited CHK-6-022 as *the* frontend anchor are corrected here.

### 0.4 How to read
1. **§1 Design Principles** and **§2 IA** are foundational — read first.
2. **§3–§6** are the four primary surfaces. Each carries screen inventory, ASCII wireframes, numbered flows + state transitions, kit composition by name, and a per-screen conformance table.
3. **§7 Cross-Cutting UX System** is the shared substrate every surface composes (status taxonomy, the four state patterns, forms, responsive, a11y, i18n). Surfaces cite **§7.10 (the Cross-Cutting Checklist)** rather than re-deriving.
4. **§8 Non-disclosure & byte-equivalence playbook** is the consolidated "must-never-render" law.
5. **§9 Component & token plan** lists kit reuse and proposed additions.
6. **§10 Open questions & escalations** consolidates every `[ESC-…]` plus rejected-finding dispositions.
7. **§11 Build sequencing** (design-only, roadmap-gated).

### 0.5 Terminology (one voice across this doc)
- **Surface / area** = a top-level section of the vendor workspace (Dashboard, Company, Microsite, Catalog, Procurement…).
- **Band** = a qualitative governance signal label (never a raw 0–100). **Tier** = Financial Tier A–E (capability size). **Plan** = Subscription Plan (commercial). These three are never co-located.
- **Window** = the quotation response window (orthogonal axis to RFQ state — Invariant 4).
- **Received-only** = derived strictly from invitations the vendor received and quotations the vendor submitted (the only attestation-safe denominators).

---

## 1. Design Principles for the Vendor Surface

Derived from the 12 invariants and the byte-equivalence attestation; listed in priority order. Where two principles tension, the higher number defers to the lower.

| # | Principle | Binds |
|---|---|---|
| **DP1** | **Byte-equivalence is an architectural property of the data sources, not a feature flag.** A blacklisted vendor and a never-matched vendor render byte-identically — same DOM, same counts, same empty states, same skeleton timings, same not-found. The cleanest guarantee is structural: exclusion never reaches the vendor leg on the wire, so the UI cannot leak what it never receives. | Invariant 11; Doc-7G **GR11 / CHK-7-040** |
| **DP2** | **Non-disclosure by construction.** Error/not-found components carry no discriminating prop; the UI cannot branch on "forbidden vs absent." Protected/private resources resolve to **not-found**, never `error-state(AUTHORIZATION)`. | Doc-7A error/not-found rules; Doc-7B non-disclosure primitives |
| **DP3** | **The contract decides state; the kit decides presentation.** `status-chip` invents no label — the surface derives a localized label + tone from the **Doc-4M** state token. Every state chip's underlying token must be a Doc-4M value. | Doc-7B; Doc-4M |
| **DP4** | **Four firewalled signals, read-only, never composite, never cross-mutating.** `[ESC-7G-SCORE-DISPLAY]` **RESOLVED 2026-07-03**: Trust Score (band + numeric 0–100 + verification badges + "Last updated" + high-level contributing factors) MAY render on any public-facing surface (not self-view-only); internal weightings/formula/matching/fraud-risk/ranking/confidence/percentile are NEVER wire fields, never rendered anywhere. Performance Score stays band-only (not covered by this ruling). No "Edit Trust Score" affordance can ever exist (System-actor-only computation, unchanged). | Invariant 6; Doc-7G; Doc-4G/Doc-5G; Board ruling 2026-07-03 |
| **DP5** | **Content ≠ Presentation, structurally.** Matching-relevant content (capability/capacity/tier/category/products) and presentation (microsite/branding/SEO/domain/ads) live in **different nav groups, different routes, different forms** — never two tabs of one form. Note: product **images** are M2 *content* (per Doc-4D `create_product.images: list<ref>`), not microsite presentation. | Invariant 9 |
| **DP6** | **Financial Tier ≠ Subscription Plan.** Tier (capability size A–E; declared vs verified) and Plan (commercial) are physically separated sections; gates use **entitlements** (boolean/numeric), never plan-name checks. | Invariants 6, 10 |
| **DP7** | **Capability is a four-flag matrix, never a label.** `can_supply` / `can_service` / `can_fabricate` / `can_consult` are four independent toggles; the vendor-type preset only *seeds* them; matching uses the flags. | Invariant 1 |
| **DP8** | **Two role dimensions stay separate.** Platform Participation (Buyer/Vendor/Hybrid/Staff) and Org Role (Owner/Director/Manager/Officer) are shown distinctly, never merged. Authorization gates use **permission slugs** (e.g. `can_manage_products`), resolved server-side, not Org-Role strings. | Invariant 2; Doc-2 §7 |
| **DP9** | **Users act; Organizations own.** Active-org context is server-resolved and shown everywhere; a client-supplied org id is never trusted; every business record is attributed to the org. | Invariant 5; Doc-7C |
| **DP10** | **One module, one owner — per action.** No screen mutates across modules in one action. Cross-module work (e.g. award → engagement) is a **navigation**, never a single cross-module write. | Invariant 7 |
| **DP11** | **Nothing authoritative is overwritten or hard-deleted.** Quotation revisions and spec versions append immutable versions with a visible superseded chain; products unpublish/soft-delete (no "Delete"); histories are append-only; `updated_at`/version shown. | Invariant 8 |
| **DP12** | **AI suggests; modules decide.** Any AI output is labeled "AI Suggestion," advisory; the vendor accepts/declines; AI never auto-submits/auto-modifies/auto-awards; AI panels render only when a wired advisory read returns data. | Invariant 12 |
| **DP13** | **Legitimate growth is a first-class job — fed only by owned data.** Because matchability cannot be shown (DP1), the design helps a good vendor improve using **only the vendor's own data** (profile completeness, missing categories, unverified flags, quota). No guidance may ever reference matching causality. | Invariant 11 + product goal |
| **DP14** | **Mobile-aware, low-bandwidth-aware, bilingual.** Skeleton-first, `file_ref`-only media, nav-paints-before-counts, Bn/En parity with localized numerals/dates/currency (BDT default), draft autosave for field use. *(True offline is **not** mandated — out of scope / future; see §7.6 and the (e5) note.)* | Doc-7C; grounding |

---

## 2. Information Architecture & Navigation

### 2.1 Shell integration (what is given vs. what this area adds)
The vendor workspace mounts inside the **`(app)`** route group. The Doc-7C shell **already provides**, and this design never rebuilds: the header with active-org indicator, the **org switcher** (the only org-switch affordance), the **notification center**, and the user menu. The vendor workspace adds **only** its own primary navigation (a left rail on desktop; a `sheet` drawer + bottom quick-bar on mobile) and a breadcrumb slot. **It introduces no notification taxonomy** — all notification surfacing defers to the Doc-7C notification center; the only vendor-area indicators are **own-record facts** (e.g. an unread clarification on a received RFQ — §6.6).

> **Hybrid-org composition — RESOLVED via Flag-and-Halt (was a BLOCKER in the IA review).** The IA draft introduced a Participation **segmented control** that *re-routed* to a separate `(buyer)` segment and stated the two nav sets are "never merged." The conformance review correctly flagged this as a **direct conflict with the FROZEN shell**: Doc-7A R6 and Doc-7C SR3 mandate that for a **Hybrid** org the shell **mounts the Buyer AND Vendor navigable surfaces together** (composition is owned by the Doc-7C shell, not the vendor area). I do **not** ship the re-routing toggle. The realization below adopts the frozen **"mount both"** model: for a Hybrid org both surface sets are co-mounted, and the two role dimensions are kept distinct by **visual grouping** (Invariant 2), not by mutually-exclusive re-routing. The precise IA of "mount both" — and the design-introduced `(vendor)` nested segment name (see §2.3) — is escalated as **`[ESC-7G-A7]` (BLOCKER, §10)** for Board ratification; until ruled, this companion does not assert a final Hybrid layout beyond "co-mounted, grouped, Trust never folded into an editable group."

### 2.2 IA map (five functional groups)
Group headers are nav dividers (`separator` + muted label), not routes; they make ownership and the Content≠Presentation split legible.

```
iVendorz Vendor Workspace  (app)/  — org-scoped, server-resolved active org
│
├─ ● Dashboard ........................... (app)/dashboard            [M2 read: discrete frozen vendor-leg reads]
│
├─ ── COMPANY (Content) ──────────────────  ← matching-relevant; owner M2 (marketplace.*)
│   ├─ ◆ Company Profile ................. (app)/company  (overview · capability matrix · capacity · declared tier · geography)
│   ├─ ◆ Products / Catalog ............. (app)/company/products  →  /[productId]
│   └─ ◆ Categories ..................... (app)/company/categories   (propose → Admin approves)
│
├─ ── PRESENTATION ───────────────────────  ← never affects matching; owner M2 (presentation BC)
│   ├─ ◇ Microsite & Branding .......... (app)/microsite  (sections · branding · SEO · domain[gated])
│   └─ ◇ Advertising ................... (app)/microsite/ads  →  /[adId]
│
├─ ── PROCUREMENT (the moat) ─────────────  ← owner M3 (rfq.*) + M4 (operations.*)
│   ├─ ▣ RFQs & Quotations ............. (app)/rfqs  →  /[rfqId]  →  /[rfqId]/quotation
│   │       (invitation inbox · RFQ detail · respond · quote authoring · versions · withdraw · late-extension · M6 thread · AI advisory)
│   ├─ ▣ Leads / Pipeline ............. (app)/leads            (received-only)
│   └─ ▣ Engagements (Post-award) ..... (app)/engagements  →  /[engagementId]   (M4 vendor-leg)
│
└─ ── STANDING & ACCOUNT ─────────────────
    ├─ ★ Trust & Verification ......... (app)/trust            [M5 read-only · four independent bands]
    ├─ $ Billing & Plan ............... (app)/billing          [M7 · entitlements + quota]
    ├─ ⚇ Team & Organization .......... (app)/organization     [M1 · participation ≠ org role]
    └─ ⚙ Settings ..................... (app)/settings          (incl. Bn/En — see §2.6)
```

**Why Trust & Verification sits in "Standing & Account," not "Company":** the four bands are M5-owned, read-only, firewalled from the editable M2 content. Keeping it out of the editable group structurally prevents any implication that the vendor edits these signals (DP4). **Billing and Trust are deliberately separate top-level nodes** (DP6 — Financial Tier ≠ Plan).

> **ADDITIVE PATCH — Cluster #1 nav re-home (2026-07-19, Team-1 build order F7 · closure record
> `governanceReviews/Cluster_1_2_Governance_Closure_and_Team1_Handoff_v1.0.md` §2).** The standalone
> **"Leads / Pipeline" `(app)/leads`** destination shown in the map above is **superseded**: the
> Leadboard board view folds into the **RFQ workspace** (`(app)/rfqs`, i.e. `/sell/rfqs`) as an
> **Inbox ⇄ Pipeline** lens chosen by the allowlisted `?view=inbox|board` param (URL-driven,
> navigation-not-state). `/sell/leads` **308-redirects** to `/sell/rfqs?view=board`; the **per-lead
> detail** route (`(app)/leads/[leadId]`) is **kept**. Rationale (Review-A/B, closure record §2.3):
> both surfaces present the SAME received RFQ invitations through two lenses (M3 inbox read + M4
> `ops.list_leads` CRM read), and Doc-7G fixes the view inventory + bindings while **deferring
> routes/nav to implementation** — so composing them on one surface is conformant, not a redesign.
> The aggregate-free guard binds the shared stat band (no lead-derived count enters it; the board keeps
> non-numeric column links; the quota meter is inbox-scoped — closure record F6). *Also (Cluster #2,
> C4):* the Selling **"Buyer CRM"** surface (`/sell/buyer-crm`) renders the user-facing label **"Buyer
> Relationships"**; the internal domain term stays **"Buyer CRM"** (no `BuyerRelationship` concept
> minted). This note is **additive**; it records the re-home without rewriting the historical map, and
> resolves the companion's own `(app)/leads` reference upward to the frozen Doc-7G (no frozen doc
> touched).

### 2.3 Route tree under `(app)` (no org id ever in URL — DP9)
```
app/(app)/(vendor)/
├─ layout.tsx        # primary nav region + breadcrumb slot + participation/role gating (server-resolved)
├─ loading.tsx error.tsx not-found.tsx   # segment suspense; error_class mapping (no enrichment); byte-identical absence
├─ dashboard/page.tsx                     # S1 / first-run S2 are conditional states of one route
├─ company/{page, products/[productId], categories}   # CONTENT (M2)
├─ microsite/{page, sections, branding, seo, domain[gated], ads/[adId]}   # PRESENTATION (M2)
├─ rfqs/{page, [rfqId]/page, [rfqId]/quotation}        # PROCUREMENT (M3)
├─ leads/page.tsx  engagements/{page,[engagementId]}   # M4
└─ trust/page  billing/page  organization/page  settings/page
```
**`(app)` is the correct authenticated route group** (`Doc-7C_SERIES_FROZEN_v1.0.md:28`); everything mounts under it — there is no free-standing `/vendor` tree. **`(vendor)` is a design-introduced nested route group** (a Next.js layout-grouping device for the vendor surface set), **not a frozen segment** — Doc-7C names "Hybrid mounts Buyer+Vendor" as a *surface-set* (`:32`), not a `(vendor)` sub-group. Nested groups are a permitted layout choice and not a conformance violation, but the `(vendor)` segment name is flagged as design-introduced and is folded into **`[ESC-7G-A7]`** for ratification alongside the Hybrid "mount both" IA.

**Active-org resolution & switching:** the Doc-7C `(app)/layout` server-resolves the active org; the `(vendor)/layout` consumes that resolved context (never URL/query/client). The shell org switcher is the only switch affordance; on switch the entire `(vendor)` subtree re-renders server-side and nav re-derives. In-flight drafts are server-persisted per org (see §7.4 autosave) and are not merged across a switch; the switcher and any participation control must respect an **unsaved-changes guard** (the kit `dialog` composes the confirm; surfaces declare dirty state to the shell).

### 2.4 Shell + vendor nav wireframe (desktop)
```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Doc-7C HEADER]  iVendorz   ▸ Org: ⌂ Padma Steel Ltd ▾(switcher)        🔔(3)   ◔ You ▾ │  ← shell-given
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ VENDOR PRIMARY NAV     │  Workspace › Dashboard                                          │
│  ● Dashboard           │  ┌ Action needed (own-data worklist) ─────────────────────────┐ │
│  COMPANY (Content)     │  │ • 2 invitations close < 24h   • 1 draft quote unsubmitted   │ │
│   ◆ Company Profile    │  │ • Profile 82% — add 2 products • 1 buyer clarification reply │ │
│   ◆ Products           │  └─────────────────────────────────────────────────────────────┘ │
│   ◆ Categories         │  ┌ Standing (read-only · 4 independent bands · no composite) ──┐ │
│  PRESENTATION          │  │ Trust:[High]  Performance:[Not Rated]  Verified Tier:[B]     │ │
│   ◇ Microsite          │  │ Verification:●Verified   ⓘ Four independent signals, not a   │ │
│   ◇ Advertising        │  │                            combined score · not editable     │ │
│  PROCUREMENT           │  └─────────────────────────────────────────────────────────────┘ │
│   ▣ RFQs & Quotations  │  Quota 7/10 used · Invitations received 12 · Quotations 7        │
│   ▣ Leads / Pipeline   │  [ Open invitations … cursor ► ]                                 │
│   ▣ Engagements        │                                                                  │
│  STANDING & ACCOUNT    │  (Hybrid orgs: Buyer surfaces co-mounted per Doc-7C SR3;          │
│   ★ Trust & Verif.     │   role dimensions grouped, never merged — [ESC-7G-A7])           │
│   $ Billing & Plan     │                                                                  │
│   ⚇ Team & Org  ⚙ Set. │                                                                  │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

### 2.5 Responsive nav model
| Breakpoint | Nav form | Kit (by name) |
|---|---|---|
| Desktop ≥1024 | Persistent sticky left rail, grouped with `separator` + muted labels; breadcrumb under header | `separator`, `button` (ghost nav items), `tooltip`, `badge`, `status-chip` |
| Tablet 768–1023 | Collapsible icon-rail (expand on hover/focus/pin); group labels → tooltips when collapsed | `tooltip`, `button`, `separator` |
| Mobile <768 | Nav in a `sheet` drawer behind ☰ + a 4-item bottom quick-bar (Home / RFQs / Company / Trust) for thumb reach | `sheet`, `button`, `badge` |

**Deep-linking:** every section/record is addressable by segment path; a deep link to a record outside the active org resolves to the **byte-identical not-found** boundary (DP2), never "access denied." **Low-bandwidth:** nav paints first, counts/badges stream after (Doc-7C segment loading); nav is text+icon, no imagery; `skeleton` for the loading nav.

**Global search / quick-jump (own-scope, FTS):** a header search that resolves human refs (`RFQ-2026-000482`) and names **within the active org only**, returning byte-identical not-found for anything outside scope. **Search-strategy forward note (Board-mandated, e4):** per CLAUDE.md §2 the platform uses **Postgres FTS now; Meilisearch is a future migration** — this vendor search is **scoped to own-org Postgres FTS** and must not over-scope to a cross-org or platform-wide index; any future Meilisearch backing must preserve the same own-org scope and byte-equivalent not-found. Needs a command/combobox primitive — see `[ESC-7B-SEARCH]`.

### 2.6 Participation- and role-awareness
- **Platform Participation** determines which workspace(s) exist. Vendor-only → only vendor nav. **Hybrid → Buyer + Vendor co-mounted (Doc-7C SR3), grouped not merged** (see §2.1 / `[ESC-7G-A7]`). Staff/admin out of scope.
- **Org Role** gates nav item enablement and per-action permission. **Authorization is resolved server-side from permission slugs** (e.g. `can_manage_products`, delegation-eligible per Doc-2 §6B), carried into the Server Component; `check_permission` is **out-of-wire** (never a browser call). The UI renders affordances from server-attached capability flags and never computes permission from a plan name or Org-Role string. The Org-Role→action mapping is an M1/Doc-4C concern — see `[ESC-7G-A2]`; the UI binds to server flags rather than hard-coding a table.
- **Capability matrix → nav (DP7):** the four flags do **not** add/remove nav nodes; they may section/foreground content *within* Products/Capacity. Nav never renders capability as a dropdown/label.

### 2.7 Bn/En in nav
The Bn/En toggle is surfaced in the **shell user-menu and the mobile drawer header** (quick, always reachable), with the canonical setting in Settings — bound to Doc-7C if the shell owns locale (`[ESC-7C-LOCALE]`). Nav labels are i18n keys; rail width is validated against the longest expected Bangla labels, with stable icons so the collapsed/icon-only state remains usable when Bangla labels are long.

---

## 3. Vendor Dashboard (Home / Overview)

A **read-only command center** assembled entirely from positive facts. The dashboard mutates nothing; every write originates from a destination screen reached via a quick action.

### 3.1 Screen inventory
| # | Screen | Route | Purpose |
|---|---|---|---|
| D-0 | Dashboard (claimed + verified) | `(app)/dashboard` | Action-needed worklist, governance bands, pipeline snapshot, quota/usage, profile health, activity, AI advisory |
| D-0a | First-run / unclaimed | same route, claim-state-driven | Claim journey + own-data readiness; pipeline widgets render in genuine-empty form |
| D-0b | Hybrid-org dashboard | same route | Vendor leg only; Buyer leg co-mounted per Doc-7C (§2.1) |
| D-0L / D-0E | Loading / Error | streaming / error boundary | Byte-identical skeleton; non-disclosure error |

### 3.2 Desktop wireframe (steady state)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Vendor workspace — Padma Steel Ltd.                                                       │
│                                                                                          │
│ ┌ ACTION NEEDED (own-record worklist; deep-links to exact surface) ───────────────────┐  │
│ │ ⏳ RFQ-2026-000482 invitation closes in 6h        → [ Quote now ]                     │  │
│ │ ✎ Draft quote on RFQ-2026-000471 not submitted    → [ Resume ]                       │  │
│ │ 💬 Buyer clarification awaiting your reply (RFQ-…) → [ Open thread ]                  │  │
│ │ 📋 Profile 82% — add 2 products, verify 1 flag     → [ Strengthen profile ]           │  │
│ └──────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│ ┌ GOVERNANCE SIGNALS (read-only · four independent · bands only · no composite) ──────┐  │
│ │ ┌ TRUST ───┐ ┌ PERFORMANCE ─┐ ┌ FINANCIAL TIER ─┐ ┌ VERIFICATION ──┐                 │  │
│ │ │ 🛡 High  │ │  Not Rated   │ │ Verified: B     │ │ ✓ Verified     │                 │  │
│ │ │ (band)   │ │ (rated=false)│ │ Declared: A     │ │ (status badge) │                 │  │
│ │ └──────────┘ └──────────────┘ └─────────────────┘ └────────────────┘                 │  │
│ │  ⓘ Independent platform signals. Not vendor-editable.  (frozen-suppressed if frozen) │  │
│ └──────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│ ┌ PIPELINE (own activity only) ─┐  ┌ QUOTA & USAGE (entitlements) ─┐  ┌ PROFILE HEALTH ─┐ │
│ │ New 4 → Submitted 7 →          │  │ Quotations 7 / 10 used         │  │ Claim ●─●─●─○    │ │
│ │ Shortlisted 1 → Selected 3     │  │ Resets 2026-07-01              │  │ Completeness 82%│ │
│ │  (counts pending wired count   │  │ Lead credits: 12               │  │ Next: add 2     │ │
│ │   read — [ESC-7G-PIPE])        │  │ Plan: Growth (display only)    │  │ products        │ │
│ └────────────────────────────────┘  │  ⓘ Plan ≠ Financial Tier       │  └─────────────────┘ │
│                                      └─────────────────────────────────┘                   │
│ ┌ RECENT ACTIVITY (own events; cursor) ─┐  ┌ AI SUGGESTION (advisory; only if wired read  │
│ │ • QTE-…412 submitted                   │  │  returns data — else absent) ────────────┐  │
│ │ • Invitation RFQ-…931 received         │  │ ⚡ AI Suggestion · advisory               │  │
│ └────────────────────────────────────────┘  │ [Review] [Dismiss]  ⓘ You decide.        │  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Frozen score-display states — RESOLVED (Board ruling 2026-07-03)
The dashboard draft rendered Trust/Performance as a single band ("High"/"Strong") and silently dropped any numeric — resolving a frozen tension locally. The conformance review was **valid**: **Doc-5G §5.3** (verified, `Doc-5G_Content_v1.0_Pass2.md:67–68`) states `get_trust_score`/`get_performance_score` (**Public-Badge** disclosure scope) return **"band + display score"**, the score is **null/suppressed while `freeze_state=frozen`** (Doc-2 §3.6), and a **sub-threshold performance score reports `Not Rated` (`rated=false`), never `0`**.

- **`[ESC-7G-SCORE-DISPLAY]` — RESOLVED 2026-07-03:** the Board ruled Trust Score display is permitted broader than this companion's original own-profile framing — **any public-facing surface** may render band + numeric score + verification badges + "Last updated" + high-level contributing factors, not just the vendor's own dashboard. Invariant 6 is confirmed **display-silent** (a cross-mutation firewall, not a display mandate) — no corpus patch required. **Never display anywhere:** internal weightings/formula, matching score, fraud-risk score, vendor ranking score, confidence coefficients, hidden penalties, competitor-relative percentile. **Performance Score is NOT covered by this ruling** — it stays band-only pending a separate ruling (Board table: "vendor-only, or optionally public"). Full record: `governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`.
- **Doc-5G actor / disclosure-scope note (MINOR, accepted, unchanged):** Doc-5G §5.3 classifies `get_trust_score`/`get_performance_score` as **Public-Badge** (band/status, "no internal basis", `Doc-5G_Content_v1.0_Pass2.md:43`) — history/inputs/version chain remain Staff-Internal per §5.3, unaffected by the display ruling above.
- **Frozen-mandated states the screen must handle (unchanged, non-deferrable):**
  - **Frozen-suppressed tile state** — when `freeze_state=frozen`, render the band/score as *suppressed/unavailable*, never fabricated.
  - **`Not Rated` Performance state** — explicit, distinct from any zero/empty (Performance tile shows "Not Rated", never "0" / "—-as-zero").

### 3.4 First-run / own-data readiness (D-0a)
When `claim_state ∈ {seeded, invited, claimed}` (not yet `verified`), the dashboard re-prioritizes to a claim journey (`seeded → invited → claimed → verified`, surfaced honestly per Invariant 3) plus an **own-data readiness panel** (DP13): "Your profile is 82% complete — add product categories, verify capability flags." Pipeline/quota render in genuine-empty form, **byte-identical** to an active vendor with zero activity (DP1). Crucially, readiness copy is keyed **only** on the vendor's own claim/verification lifecycle and own fields — **never** on matching ("do X to get matched" is forbidden, ND-4).

### 3.5 Component composition (kit by name)
- Bands strip: `card` + `embedded/trust-badge` (**Trust: `score` prop now permitted, per the §3.3 ruling — Performance: still WITHOUT `score`, band-only**) + `status-chip` + domain tokens `--iv-trust-*`, `--iv-tier-*`.
- Quota / completeness meters: see kit additions `[ESC-7B-METER]`; claim stepper `[ESC-7B-STEPPER]`; recurring count tile `[ESC-7B-STAT-TILE]`.
- Activity: `card` + `pagination-control` (cursor) + `empty-state`. AI panel: `card` + `badge("AI Suggestion")` + `button` (advisory only). Loading `skeleton`; error `error-state`; profile-absent `not-found`.
- **Embedded-component homes (Doc-7G §11.1 / CHK-7-005):** the own trust badge and billing/quota indicator are two of the four §11.1-mandated embedded components and live here on the Dashboard (the other two — AI advisory panel and M6 clarification thread — are homed in §6.6).

### 3.6 AI advisory — corrected from the draft (MAJOR)
The draft showed a **fully-populated** AI suggestion in the primary wireframe while admitting M9 is a stub with no wired read — implying a non-existent contract. **Corrected:** the AI panel renders **conditionally, only when a wired M9 advisory read returns data**; the empty/absent case is the default depicted state. Suggestion text is constrained by contract to **received-only** invitations (never "RFQs you weren't invited to"). The AI advisory panel is one of the four embedded components mandated by **Doc-7G §11.1 / CHK-7-005** (not GR12). Tracked as `[ESC-7G-AI]`.

### 3.7 Pipeline counts — corrected from the draft (MAJOR)
The draft presented hard count-by-stage tiles as settled, but cursor pagination yields **no reliable client-side total** (`pagination-control` provides no total unless the contract does) and no `*.count.*` contract is confirmed. **Corrected:** pipeline numeric tiles are **held behind `[ESC-7G-PIPE-CONTRACT]`** — depicted as pending a wired received-only count read, or rendered as non-numeric "view" links until confirmed. No client-derived totals from cursor lists are presented as authoritative. The Dashboard read is reworded from "M2 read aggregate" to "**composes discrete frozen vendor-leg reads**" (no invented aggregate).

### 3.8 Per-screen conformance table (D-0)
| Aspect | Detail |
|---|---|
| Read contracts (out-of-mutation; by pointer) | Discrete Doc-5D vendor reads; `rfq.list_*` received-only reads; M5 **Public-Badge** reads `trust.get_trust_score.v1` / `trust.get_performance_score.v1` (own-profile projection; band; score suppressed/Not-Rated per §3.3); M7 entitlement + subscription reads. |
| Write contracts (mutations) | **None on this screen** — every write originates from a destination surface reached via a quick action. |
| Out-of-wire (server-side, never frontend writes) | entitlement resolution; `check_permission`; matching engine — observed only via reads, never browser-called. |
| Invariants guarded | 2,3,4,5,6,7,8,9,10,11,12 |
| States | verified / claimed-not-verified / first-run / hybrid / loading / error / profile-not-found / **frozen-suppressed** / **Not-Rated** / genuine-empty per widget |
| Entitlement / role gates | Quota reads `monthly_rfq_limit`; "New quote" CTA visible, submission entitlement-gated downstream (out-of-wire, server-enforced) |
| Non-disclosure | counts/denominators = invitations-received / quotations-submitted only; no win-rate by default (raw counts; if a rate, denominator = submitted, labeled); not-found byte-identical; error carries no enrichment; no fraud/risk anywhere |

---

## 4. Company Profile (Content) & Microsite (Presentation)

Owner: **M2 Marketplace** (M5 reads, M7 entitlement reads, M1 for ownership transfer). The hardest thing here is **Invariant 9** — Content and Presentation are two physical destinations with a per-page **context banner** ("Editing affects matching" vs "Presentation only — never affects matching or eligibility").

### 4.1 Screen inventory
**Content:** S1 Profile Overview `(app)/company` · S2 Identity & Geography · S3 **Capabilities & Capacity** (the four-flag matrix) · S4 Financial Tier (declared vs verified + append-only history) · S5 Categories (propose → Admin approves) · S6 Products list · S7 Product editor · S8 Verification · S9 Ownership & Org.
**Presentation:** S10 Microsite Builder · S11 Branding · S12 SEO · S13 Custom Domain (entitlement-gated lifecycle pending/verified/active/released; **external domains only** — the universal Platform-issued Vendor Subdomain is not managed here, ADR-024) · S14 Preview & Publish.

### 4.2 Wireframe — S3 Capabilities & Capacity (the crown-jewel for Invariant 1)
```
┌─ Company Profile › Capabilities & Capacity ──────────────────────────────────┐
│  [info] Editing affects matching.                          Last saved · v34   │
│  Vendor type preset: [ Manufacturer ▾ ]  ⓘ Preset only SEEDS the flags below. │
│                                            Each flag is independently editable. │
│  CAPABILITY MATRIX (four independent capabilities — not one label)            │
│   can_supply     [● ON ]   Sell / supply goods           (--iv-cap-supply)    │
│   can_service    [○ OFF]   Provide services              (--iv-cap-service)   │
│   can_fabricate  [● ON ]   Custom fabrication            (--iv-cap-fabricate) │
│   can_consult    [○ OFF]   Consulting / advisory         (--iv-cap-consult)   │
│  ⓘ Matching uses these flags, not the preset label.                          │
│  ── Capacity profile (declared) ────────────────────────────────────────────  │
│   Monthly output [ 5,000 MT ]  ✔ Verified by Trust (read-only marker)         │
│   Workforce      [ 240 ]       — declared (not verified)                      │
│  ⓘ Editing a verified field may require re-verification. (advisory only)       │
└───────────────────────────────────────────────────────────────────────────────┘
```
Changing the preset opens a **confirm dialog** to re-seed defaults (never silent overwrite); the four flags remain individually editable afterward. Verified markers are read-only annotations (Trust-owned). The kit has no canonical on/off control — `[ESC-7B-SWITCH]`.

### 4.3 Wireframe — S4 Financial Tier (DP6 made visible)
```
┌─ Company Profile › Financial Tier ───────────────────────────────────────────┐
│ ┌ Declared (you set) ──────────┐   ┌ Verified (set by Trust) ────────────┐    │
│ │ Tier: [ C ▾ ] (A–E)          │   │ Verified tier: B  (read-only)       │    │
│ │ [ Update declared ]          │   │ [trust-badge: tier band B, no score]│    │
│ └──────────────────────────────┘   └─────────────────────────────────────┘    │
│ ⚠ Financial Tier is your capability size (A–E). It is NOT your subscription    │
│   plan. Manage your plan in Billing.            → [ Go to Billing & Plan ]     │
│ ── Tier history (append-only) ──  2026-06-30 Verified→B (Trust) · 2026-05-12   │
│    Declared→C (you) …  [pagination-control · cursor]                           │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Key flows
- **Onboarding spine:** claim (`seeded→invited→claimed→verified`, Invariant 3) → edit content (S2→S3→S4→S5 propose→S6/S7 products) → submit verification (S8) → Trust decides (out-of-wire; notified via Doc-7C center) → verified markers appear (S3/S4); categories approved by Admin in parallel (S5: `proposed→active|removed`).
- **Microsite (presentation-isolated):** edit sections/branding/SEO → draft (server-persisted per Save, idempotent) → Preview & Publish → publish/unpublish. Copy reinforces: content/profile remain intact and matchable when the microsite is unpublished. Public canonical host per **ADR-024** / `ESC-MKT-CANONICAL-URL` (ruled 2026-07-03): CHR — Doc-2 v1.0.5 D2-04.3, by pointer; `seo.canonical` advisory.

### 4.5 Contract-binding corrections (MAJOR/MINOR — adjudicated against frozen Doc-4D/Doc-4G)
The draft's contract grounding had real defects; the following are **implemented**:
- **Verified tier / verified-claim reads:** `marketplace.sync_verified_financial_tier.v1` and `marketplace.reflect_verified_claim_status.v1` are **System event-consumers (Actor: System), not vendor-callable**. S4 reads the **reflected verified-tier field on `marketplace.get_vendor_profile.v1`** (or the public `trust.get_verified_tier.v1` badge projection); S8 reads verified-claim status via the vendor profile / a vendor-scoped verification read — **never** the System consumer.
- **Verification read actor:** `trust.get_verification.v1` is an **Admin/staff case-detail** read (Doc-4G §G4.8 / Doc-5G §4.5 Staff-Internal) and must **not** be bound to the vendor surface. The vendor sees its **own** status/badge via the public projection (`trust.get_verified_tier.v1`) + the claim/verification status reflected on the vendor profile. If a vendor-actor read of the vendor's own verification case is required and absent → `[ESC-7G-04]`.
- **Trust/Performance band reads exist (withdraw false escalation):** `trust.get_trust_score.v1` and `trust.get_performance_score.v1` are frozen (Public-Badge); S1 binds them directly as the **own-profile Public-Badge projection** (band only; score per §3.3). The draft's `[ESC-7G-01]` "band reads not confirmed" is **withdrawn**.
- **Per-slug grounding caveat (MINOR, accepted).** Several specific marketplace slugs cited in §4.3/§4.6 tables — `marketplace.get_declared_financial_tier.v1`, `marketplace.set_declared_financial_tier.v1`, `marketplace.get_financial_tier_history.v1`, `marketplace.get/upsert_vendor_capacity_profile.v1`, and the custom-domain lifecycle `marketplace.create/confirm/activate/release_custom_domain.v1` / `set_microsite_domain.v1` — are **plausible but not yet per-slug confirmed against Doc-5D PassB**. Per the reference-never-restate rule, these are bound provisionally; each must be **confirmed against Doc-5D PassB by exact versioned slug before build, or down-graded to an `[ESC-…]`** if absent. Tracked at **`[ESC-7G-SLUG-MKT]` (MINOR, §10)**. (Catalog/spec/category slugs in §5.5 are separately confirmed frozen — see §5.3.)
- **Catalog/spec/category slugs are frozen and versioned** (see §5.5) — bind by exact versioned slug, not bare names.
- **trust-badge `score` — RESOLVED 2026-07-03 (`[ESC-7B-TRUSTSCORE]`, Option 3):** the vendor workspace MAY now pass `score` to `trust-badge` for **Trust** (any public-facing surface, per `[ESC-7G-SCORE-DISPLAY]`'s ruling); **Performance** still passes band/tier props only, never `score` (Performance is not covered by the ruling). No kit change — the prop ships as-is (`src/frontend/embedded/trust-badge.tsx:18,55–59`). Lint/test discipline retained, re-scoped to forbid `score` only in genuinely internal/governance-only contexts (staff tooling, matching/ranking/fraud surfaces).

### 4.6 Per-screen conformance (representative)
| Screen | Read contracts (by pointer) | Write contracts (mutations) | Out-of-wire | Invariants | States | Gates | Non-disclosure |
|---|---|---|---|---|---|---|---|
| S1 Overview | `marketplace.get_vendor_profile.v1`; M5 Public-Badge own-profile band reads; `marketplace.get_declared_financial_tier.v1`†; verified tier via profile/`trust.get_verified_tier.v1` | — (read-only) | entitlement resolution; `check_permission` | 3,5,6,10 | claim; visibility; bands; verification | view: any; edit jump-offs gated by `can_*` slug | no matched/lead/reach metric; no fraud/risk |
| S3 Capabilities | `marketplace.get_vendor_profile.v1` (flags); `marketplace.get_vendor_capacity_profile.v1`†; verified markers via verification reflection | `marketplace.update_vendor_profile.v1` (flags); `marketplace.upsert_vendor_capacity_profile.v1`† | `check_permission` | 1,6,8 | flag on/off; declared vs verified; re-seed; concurrency (`updated_at`) | edit: profile-write slug | verified markers reveal no matching outcome |
| S4 Financial Tier | `marketplace.get_declared_financial_tier.v1`†, `marketplace.get_financial_tier_history.v1`†; verified read via profile/`trust.get_verified_tier.v1` | `marketplace.set_declared_financial_tier.v1`† | `check_permission` | 6,8,10 | declared A–E; verified band/none; history paging | declared edit: profile-write slug | verified band only; no raw 0–100; no fraud/risk |
| S7 Product editor | `marketplace.get_product.v1` (`updated_at` carriage) | `create_product.v1`, `update_product.v1`, `set_product_status.v1`, `add_spec_document.v1`/`supersede_spec_document.v1`, `link/unlink_product_spec.v1` | publish entitlement resolution; `check_permission` | 8,9,10 | draft↔published↔unpublished; spec current/superseded; conflict | publish entitlement-gated; edit: `can_manage_products` | error no enrichment; product **images are M2 content** (DP5) |
| S8 Verification | read via profile/public projection | submit via vendor-scoped path (`[ESC-7G-04]`) | Trust decision (Admin/System) | 3,6,7,8 | none/pending/verified/rejected | submit: profile-write slug | rejection copy contract-only; no fraud/risk; read failure → no enrichment |
| S13 Custom domain | `marketplace.get_vendor_profile.v1` (domain field) | `marketplace.create/confirm/activate/release_custom_domain.v1`†, `set_microsite_domain.v1`† | entitlement resolution | 9,10 | pending/verified/active/released | **entitlement: custom_domain (boolean)**; Director+ | external domains only; `*.ivendorz.com` rejected (Doc-4D v1.0.2); while `active` the domain is the canonical host, reverting on release (CHR — ADR-024) |

† Slug pending per-slug confirmation against Doc-5D PassB — see `[ESC-7G-SLUG-MKT]` (§4.5/§10).

---

## 5. Product / Catalog Management

Owner **M2** (Doc-4D / Doc-5D). Products are matchable **content** (DP5). No hard delete (DP11). Publishing is entitlement-gated.

### 5.1 Screen inventory
S1 Catalog List `(app)/company/products` · S2 Product Editor — Content `…/[productId]` · S3 Editor — Specifications (tab) · S4 Spec Library · S5 Category Assignment · S6 Publish dialog · S7 Unpublish dialog.

### 5.2 Wireframe — S1 Catalog List
```
┌─ Vendor Workspace › Catalog ─────────────────────────────────────────────────┐
│ Products  ·  Published: 12 / 50 this period (own-data; entitlement)  [+ New]  │
│ [ 🔍 Search name/description ]  (All|Draft|Published|Unpublished|Needs-attn)   │
│ Category: [ Active categories ▾  PENDING ESC-7B-SELECT ]   Sort: [ Updated ▾ ] │
│ ☐ MS Pipe Sch-40 6"        Pipes & Fitt.  [●Published]  2d ago   ⋯           │
│ ☐ Gate Valve DN150 PN16    Valves         [◐Draft]      5h ago   ⋯           │
│ ☐ Industrial Boiler Svc    (none)         [◐Draft]      3d ago   ⋯           │
│ [ ☑ 2 selected ] [Publish] [Unpublish] [Reassign category]  (bulk → §5.3)    │
│ Total: 14 products (your own)        [ ‹ Newer ]  [ Older › ]  (cursor)       │
└───────────────────────────────────────────────────────────────────────────────┘
```
Status via `status-chip` (Draft/Published/Unpublished — **no `deleted` chip**). Total count of the vendor's **own** products is shown (byte-equivalence-safe — own data). The category control is marked **PENDING `[ESC-7B-SELECT]`** (`dropdown-menu` is a menu, not a value-bound form select).

### 5.3 Flows & corrections implemented
- **Lifecycle:** `(none)→draft` (create, idempotency key); `draft→published` (server-gated by entitlement + **active** category); `published↔unpublished` (reversible, framed "still saved"). **No Delete anywhere.**
- **Constrained category picker:** populated from `get_category_assignments.v1` filtered to **`active`**. No active category → picker disabled with guidance to S5 (propose → Admin approves). First-run sequencing surfaces the category prerequisite **up front** so Admin-approval latency runs in parallel with adding products (fixes the publish-time dead-end).
- **Bulk partial-failure UX (MAJOR):** bulk publish/unpublish returns **per-item outcomes**; render "3 published, 2 not published" with each failed row inline-tagged ("allowance reached" / "category not active yet") and kept selected for re-action.
- **Spec versioning:** "Add new version" → `add_spec_document.v1` then `supersede_spec_document.v1` (immutable N+1; prior superseded, visible). **Low-bandwidth upload UX (MAJOR):** per-file progress + cancel; client-side size/type guardrail before upload; two-phase "upload succeeded, finalizing version…" so a failure between `add` and `supersede` is recoverable and never shows a half-created version; interrupted uploads create no version (Invariant 8 clean).
- **Concurrency token correction (MAJOR):** the frozen token is **`updated_at`** (carried from `get_product`), not "expected_version_no"; conflict branches on **`marketplace_product_update_conflict` (CONFLICT)**. Conflict recovery **preserves the vendor's unsaved edits** (show server's current values for comparison; never force re-typing). `[ESC-7G-CONC-01]` is **withdrawn** (resolved by the frozen contract).
- **Save model (MINOR):** explicit manual save with a dirty-state indicator + navigation guard; "Last saved" wording only after a successful save (no autosave ambiguity).
- **Quota vs publish-entitlement (MINOR):** do **not** reuse the rfq "X/Y used this period" quota phrasing for publishing. Publishing is an M2/M7 **catalog publishing allowance** (distinct instrument from rfq submission quota — Doc-3 4.1.1). Surface remaining publish allowance **proactively** on S1, in allowance language, never plan names (`[ESC-7G-ENT-02]` for numeric vs boolean shape).
- **Contract-naming correction (BLOCKER):** all BC-MKT-3/2 commands are **frozen, versioned slugs** in Doc-4D PassB CatalogProductSpec — bind by exact slug: `marketplace.create_product.v1`, `update_product.v1`, **`set_product_status.v1`** (single command, `target_status` enum `published|unpublished`), `link_product_spec.v1`, `unlink_product_spec.v1`, `create_spec_library_entry.v1`, `update_spec_library_entry.v1`, `add_spec_document.v1`, `supersede_spec_document.v1`, `assign_category.v1`, `update_category_assignment.v1`, `remove_category_assignment.v1`, `list_categories.v1`, `get_category_assignments.v1`, `get_product.v1`, `list_products.v1`. The draft's "bind-or-ESC / will not bind versioned names" stance is removed; `[ESC-7G-CAT-01]` is **withdrawn**.
- **Audit carry-forward (MINOR):** product create/edit/publish/unpublish audit actions are Doc-2 §9-unenumerated; the history/`updated_at` UX depends on the additive resolution — carry **`[ESC-MKT-AUDIT]`** (existing frozen channel, not new).
- **Invariant-9 boundary correction (MAJOR):** product **images** (`create_product.images: list<ref>`) are M2 **content** — rendered in the Content editor via `file-link`/`file_ref`; the mobile "no thumbnails on the list" choice is justified as a **perf/low-bandwidth deferral**, not a content/presentation boundary. The microsite owns layout/placement/branding/SEO only.

### 5.4 UX additions accepted (efficiency for an industrial catalog)
- **Catalog→moat bridge (MAJOR):** a small, non-disclosing **publish-readiness checklist** on S2 (name set, active category, ≥1 spec) and a factual line that published products in active categories are discoverable by buyers — stated as **positive prerequisites the vendor controls**, never match-likelihood (ND-4-safe). A breadcrumb-level pointer to Open Invitations / Quota connects catalog work to revenue.
- **Bn/En (MAJOR):** cross-script search; table tolerates longer localized strings (wrap/truncate-with-tooltip); lifecycle chip labels localized.
- **Version-history collapse (MINOR):** show current version + "Show N earlier versions" (progressive disclosure) in the proposed `version-history` component.
- **"Needs attention" filter** (drafts blocked on non-active category / missing fields) — client-side; **"Duplicate as draft"** row action — both noted (NIT/OBS).
- **"Archive" overload (NIT):** use the single verb **Unpublish** (S7 dialog already reassures "still saved").

### 5.5 Per-screen conformance (representative)
| Screen | Read contracts | Write contracts (mutations) | Out-of-wire | Invariants | States | Gates | Non-disclosure |
|---|---|---|---|---|---|---|---|
| S1 List | `list_products.v1`, `get_category_assignments.v1` | `set_product_status.v1` (bulk, per-item re-gated), `assign/update_category_assignment.v1` | publish entitlement resolution; `check_permission` | 5,6,8,9 | draft/published/unpublished; empty; loading; error | publish: entitlement; edit: `can_manage_products` | own counts only; no matched-universe; not-found = absence; total = own data |
| S5 Categories | `list_categories.v1`, `get_category_assignments.v1` | `assign_category.v1`, `update/remove_category_assignment.v1` | Admin approval (out-of-wire) | 7 | proposed/active/removed | propose: org role per slug; **approval Admin-only** | rejection reason only as Admin provides; no inference |
| S6 Publish | — | `set_product_status.v1(target_status=published)` | entitlement resolution | 8,10 | granted vs gated | **entitlement** (allowance language, not plan name) | gated copy reveals only own allowance |

---

## 6. Quotation Workflow (Invitation → Quote → Outcome) — THE MOAT

Owner **M3** (Doc-4E / Doc-5E). The most non-disclosure-sensitive surface in the platform. The non-disclosure firewall (§8) governs every state, count, and empty state here.

### 6.1 Structural guarantee (the cleanest byte-equivalence move)
There is **no "browse available RFQs" / discovery list** for vendors. The inbox is **received-only**: exclusion never reaches the client (DP1/BE-1), so it cannot leak. Every empty/zero/closed state collapses to a single rendering.

### 6.2 Screen inventory
S1 Quotation Home `(app)/rfqs` (self-only counters + quota + needs-response) · S2 Invitation Inbox · S3 RFQ Detail (specs, granted docs, **respond**, M6 thread, AI advisory) · S4 Quote Authoring (bound to fixed `rfq_version_id`; SUBMIT consumes one quota unit) · S5 Quotation Detail + immutable version history · S6 Revision Editor (`expected_version_no` concurrency; no quota) · S7 Late-Extension (two-phase) · S8 Clarification Thread (M6) · S9 Outcome / Award hand-off (→ M4 engagement).

### 6.3 Wireframe — S3 RFQ Detail (with corrected states)
```
┌─ RFQ-2026-000481 · Boiler feed pumps ────────────────────────────────────────┐
│ [RFQ state: Open — respond]   [Window: OPEN — closes 02 Jul 18:00 BST (6h)]   │  ← two chips (Inv 4)
├──────────────────────────────────┬────────────────────────────────────────────┤
│ SPECS & REQUIREMENTS              │  YOUR INVITATION                            │
│ • Qty 4 · API 610 BB2             │  Delivered: 28 Jun 2026  [chip: delivered] │  ← Doc-4M token
│ • Delivery: Chattogram EZ         │  [ Accept invitation ]  [ Decline ]        │
│ • Est. value: BDT 12,00,000       │  ── Quotation window: open through          │
│ GRANTED DOCUMENTS                  │     shortlisting ──                         │
│  file-link Spec_API610.pdf (tap)  │  [ Start quotation → ]  (quota 7/10)        │
│  (lazy / tap-to-download; low-bw)  │  ⓘ One quota unit used only at SUBMIT.     │
├──────────────────────────────────┴────────────────────────────────────────────┤
│ 💬 Clarifications (M6 thread, S8) · ⚡ AI Suggestion (advisory; only if wired)  │  ← §11.1/CHK-7-005 embedded
└───────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 State-machine corrections — RESOLVED via Flag-and-Halt (two BLOCKERs + a MAJOR)
Adjudicated against **Doc-4M_FROZEN_v1.0** (verified, lines 120, 219–233). The draft coined states that do not exist; chips must be Doc-4M-driven (DP3). Implemented:
- **Invitation chip `invited` → `delivered` (BLOCKER, valid).** Doc-4M Invitation set = `draft / selected / deferred / delivered / accepted / declined / expired`. There is **no `invited` state**; the vendor-leg entry state is **`delivered`**. Flow A is `delivered → {accepted | declined}` via `respond_to_invitation`. A friendlier display label may be passed to `status-chip`, but the underlying token is a Doc-4M value.
- **`revised` is not a quotation state (BLOCKER, valid).** Doc-4M Quotation machine = `draft → submitted`; `submitted → {withdrawn | shortlisted | expired}`; `shortlisted → {selected | not_selected}`. Revisions are **immutable versions within `submitted`** (only the version number increments; current/superseded). "awarded"/"closed" quotation labels are replaced with **`selected`/`not_selected`**.
- **Quotation-level `shortlisted` must be surfaced (MAJOR, valid).** `selected`/`not_selected` are reachable **only from quotation `shortlisted`**. S5 and the outcome flow now render the vendor's **own** quotation `shortlisted` chip as the legal predecessor. This is firewall-safe (own standing only; no rank, no competitor existence — ND-2/ND-3 hold).
- **status-chip mischaracterization (MINOR):** `status-chip` takes a surface-supplied `{label, tone}` and auto-maps **nothing**; therefore deriving Doc-4M-correct labels/tones is **this design's** responsibility (reinforcing the above). The window-state axis is a separate sibling/variant — `[ESC-7B-WINDOW-CHIP]`.
- **Late-extension Phase-2 (OBS):** render "request sent / awaiting buyer decision" as a **non-state UI flag**, not a `status-chip` backed by a coined token (Doc-4M has no such vendor-visible state; the two-phase mechanism lives in the Doc-4E control plane) — `[ESC-7G-Q-07]`. Approval reopens the window for **all un-responded invitees** (generic copy, no counts/identities — ND-2).
- **S3 RFQ-detail read (MAJOR):** the vendor-leg RFQ-detail read is **not** a confirmed `get_rfq`; do not ship S3 against a fabricated name. Bind to `get_invitation.v1` if it carries the RFQ snapshot the vendor is entitled to see, else `[ESC-7G-Q-01]` gates S3.

### 6.5 Key flows
- **Respond (A):** `delivered → {accepted | declined}`. Decline dialog states it is permanent for this invitation, that the vendor can still be invited to other RFQs (true, non-leaking), and carries no score penalty (if accurate).
- **Author → Submit (B):** S4 bound to fixed `rfq_version_id`; `[Save draft]` (no quota, **server-persisted autosave** with "Saved" indicator for field use); `[Submit]` → `rfq.submit_quotation.v1` (**required idempotency key**, one per attempt) → `draft → submitted`, quota consumed once. **QUOTA error** (`error_class=QUOTA`, `retryable:false`): draft retained, no retry button; surfaced **proactively** before authoring (disable/pre-warn `[Start quotation]` when exhausted, low-quota warning at last unit).
- **Revise (C):** `rfq.revise_quotation.v1` with `expected_version_no` (optimistic concurrency), **no quota**, emits no event → new immutable version; prior superseded (visible). CONFLICT → reconcile **preserving the vendor's edits** (never silent overwrite).
- **Withdraw (E):** `submitted → withdrawn` (terminal, pre-award); frees a routing slot; chain remains readable.
- **Late-extension (D):** two-phase, per §6.4.
- **Outcome (F):** banners per Doc-4M, no rank/comparison pre-close (ND-3/ND-6). **Won (`selected`):** enriched hand-off — concrete next step + any buyer-set acceptance deadline surfaced read-only from M4, primary unmissable CTA, banner persists until acted on; navigation into M4 engagement (no cross-module mutation — DP10). **`not_selected`:** firewall-correct zero-reason, plus a **generic, non-RFQ-specific** "Strengthen your profile" CTA decoupled from this RFQ (byte-equivalence-safe).

### 6.6 Embedded components — allocated (Doc-7G §11.1 / CHK-7-005) (MAJOR across IA + dashboard reviews)
Doc-7G **§11.1 (gated by `CHK-7-005`)** mandates the workspace compose four embedded components (this is the §11.1 mandate, **not** GR12 — GR12 is the "coins nothing / never invokes the engine" rule). All four now have IA homes: **own trust badge** (Dashboard + Trust node, §3), **billing/quota indicator** (bound to **Doc-5I** — not an improvised meter — on Dashboard/Billing and contextually at quote-authoring), **AI advisory panel** (S3/S4, labeled advisory, accept/decline, render-only-if-wired — §3.6), **M6 clarification thread** (S8, within RFQ/quotation surfaces, **delivery-only and distinct from** the Doc-7C notification center). Notifications deep-link into the thread, and an "unread clarification" indicator on RFQ rows is an **own-record fact** only (no exclusion/"not matched" event is ever proposed — §8/ND-4). M6 thread scope must be buyer↔this-vendor only — `[ESC-7G-Q-05]` if broadcast.

### 6.7 Per-screen conformance (representative)
| Screen | Read contracts (by pointer) | Write contracts (mutations) | Out-of-wire | Invariants | States | Gates | Non-disclosure |
|---|---|---|---|---|---|---|---|
| S2 Inbox | `rfq.list_invitations` (vendor leg), `get_invitation` | — | matching engine (never browser) | 4,5,11 | RFQ states; window OPEN/OPEN·late/CLOSED; empty; error | invitee | ND-2,4; BE-2,4,5; one empty state |
| S3 Detail | `get_invitation` (RFQ snapshot; `[ESC-7G-Q-01]`) | `respond_to_invitation` | `check_permission` (server) | 4,5,7,11 | invitation `delivered/accepted/declined`; RFQ state; window; not-found | invitee (server) | ND-1,2,3,4,6; BE-4 |
| S4 Author | `get_invitation` / draft read | `rfq.submit_quotation.v1` (idempotency key) | **`monthly_rfq_limit` entitlement (server-enforced at SUBMIT)** | 4,5,7,8,9,12 | draft→submitted; QUOTA; STATE/window-closed; idempotency replay | entitlement at SUBMIT | ND-1,2,3; BE-5 |
| S5 Detail+History | `rfq.get_quotation` | `rfq.withdraw_quotation` (pre-award) | — | 6,8,11 | submitted/**shortlisted**/withdrawn/selected/not_selected/expired; current/superseded | owner org; withdraw pre-award only | ND-1,2,3,6,7 |
| S6 Revise | `rfq.get_quotation` (`expected_version_no` carriage) | `rfq.revise_quotation.v1` (no quota; no event) | — | 7,8 | new version; CONFLICT reconcile | no quota; owner | ND-1; BE-5 |
| S9 Outcome | read quotation state (Doc-4M); read M4 engagement detail | — (link to M4 engagement; no cross-module write) | award decision (M3, out-of-wire) | 6,7,11 | selected/not_selected/expired/cancelled | award → M4-owned engagement | ND-2,3,6 |

> **trust-badge is intentionally absent from quotation screens** (outcome is M3; scores are M5) — placing a band on an outcome would imply a score-driven award (firewall, Invariant 6).

---

## 7. Cross-Cutting UX System

The shared substrate every surface composes. Surfaces cite **§7.10** rather than re-deriving.

### 7.1 Status taxonomy (single mapping; tokens from Doc-4M)
`status-chip` takes `{label, tone}`, `tone ∈ {neutral, info, success, warning, danger, brand}`. **The surface derives the localized `label` and `tone` from the Doc-4M state token; the kit invents nothing.** Selected mappings (token → tone → label intent):

- **Claim (Inv 3):** `seeded`→neutral·"Unclaimed" · `invited`→info·"Invitation sent" · `claimed`→info·"Claimed" · `verified`→success·"Verified".
- **Product (Inv 8):** `draft`→neutral · `published`→success · `unpublished`→warning. **No `deleted`.**
- **Quotation (Doc-4M — complete set, aligned to §6.4/§6.7):** `draft`→neutral · `submitted`→info · `shortlisted`→brand · `withdrawn`→neutral · `selected`→success · `not_selected`→warning ("no why") · `expired`→neutral. *(revision = version within `submitted`: "v{n} · current/superseded".)*
- **RFQ Invitation (Doc-4M, vendor-visible):** entry `delivered`→info·"New invitation"; `accepted`→success · `declined`→neutral · `expired`→neutral.
- **Vendor-visible RFQ:** `vendors_notified`→info·"Open — respond" · `quotations_received`→info · `buyer_reviewing`→info · `shortlisted`→brand · `closed_won`→success·"Awarded — you won" · `closed_lost`→warning·"Closed" (neutral tone; no comparison) · `expired`/`cancelled`→neutral.
- **Window sub-state (Inv 4):** a **second independent chip** — OPEN / OPEN·late / CLOSED; with **urgency tiers** (warning <24h, danger <2h) and an explicit timezone label (Asia/Dhaka / BST).
- **Verification (M5 read):** `verified`/`pending`/`rejected` ("Verification not granted" — **no fraud/risk detail**).
- **Tier (Inv 6/10):** Declared (M2, editable) and Verified (M5, read-only) as **two independent chips**, A–E only, never a number, never merged; **Plan is a separate section**.
- **Subscription/entitlement (M7):** plan name **display-only**; **all gates use entitlements**; quota within-limit "X/Y used" / exhausted → `QUOTA`, `retryable:false`.
- **Ad (M2):** states are **PENDING contract confirmation** — do not implement until bound to the Doc-4D/Doc-4M ad machine (`[ESC-7G-AD-01]`, severity MINOR — it blocks a section from being build-ready).

> **Slug-style labels must never reach the UI.** Wireframe tokens like `quotations_received` are illustrative; the displayed string is the localized human label ("Buyer collecting quotes").

### 7.2 The four state patterns (byte-equivalence-bound)
1. **Loading — `skeleton`** (skeleton-first on every RSC fetch; state-agnostic; mirrors final layout; identical timing for all vendors — BE-6).
2. **Empty — `empty-state`** — **exactly one canonical copy per list type**, identical for excluded vs not-matched. **Enforcement (MAJOR):** the kit's `empty-state`/`not-found` accept free-text `title/description/icon/action`, so byte-equivalence currently rests on surface discipline. This design **mandates a fixed i18n key per list type** that all code paths pass, derived from list-type **alone** (never from any match/exclusion-derived input), plus a conformance test asserting byte-identical render across the absent vs excluded paths (the CHK-7-040 evidence). Any empty-state CTA is gated only on the vendor's own owned data (DP13), never on a match/exclusion signal. Kit-hardening candidate: make this copy non-overridable in vendor-workspace usage — `[ESC-7B-EMPTY-LOCK]`.
3. **Error — `error-state`** — branch on `error.error_class` (`VALIDATION · AUTHORIZATION · QUOTA · RATE_LIMITED · CONFLICT · STATE · REFERENCE · BUSINESS · DEPENDENCY · INTERNAL`), **never HTTP status**; message verbatim; `reference_id` surfaced; **no protected enrichment**. **Standard recovery action per class (MINOR):** retryable (DEPENDENCY/RATE_LIMITED/INTERNAL-on-read) → "Try again"; QUOTA → "View plan"; AUTHORIZATION/REFERENCE on protected resources → not-found. Error headlines must be i18n-keyed (`[ESC-7B-I18N-HEADLINE]`).
4. **Not-found — `not-found`** — no discriminating prop; byte-identical whether genuinely absent or invisible to this caller. **Protected/private → not-found, never `error-state(AUTHORIZATION)`** (cite the precise Doc-7A non-disclosure clause that distinguishes "authz denial on a known-to-caller resource" from "existence must not be disclosed").

**Byte-equivalence state matrix:** not-matched ≡ blacklisted → same `empty-state`, same string, same `0`; never-existed ≡ excluded-RFQ → same `not-found`. **Denominator law (CHK-7-040):** every count/ratio/denominator uses **only** invitations-received and quotations-submitted.

**Offline (e5 — explicit scope note):** true offline operation is **not** mandated and is out of scope (future/OBS). This system mandates only skeleton-first loading, low-bandwidth awareness, draft autosave, and tap-to-download — not an offline-capable PWA/state layer.

### 7.3 Forms
`form-field` renders one `field_errors` entry per field (verbatim, Doc-5A; auto-wires `aria-*`). Validation: on-submit authoritative; on-blur format hints only (never business rules); no inline async validation against out-of-wire contracts. Currency via `currency-display` (BDT default; **active locale must be threaded in** — `en-BD` does not render Bangla digits; `bn-BD` required for Bangla numerals).

### 7.4 Idempotency & concurrency UX
**Idempotency:** stable key per submission attempt; the button does **not** re-enable into a fresh key on transient failure (avoids double quota consume). **Transient-failure UX (MAJOR):** never leave a silently-frozen button — keep the **same** key and offer a bounded "Retrying… / Check submission status" control that re-sends the same key, with clear resolved/unconfirmed copy at each stage. **Concurrency (`expected_version_no` for rfq; `updated_at` for marketplace):** CONFLICT never silently overwrites and **preserves the vendor's edits**; revisions/specs append immutable versions (DP11).

### 7.5 Data / lists
`pagination-control` only — cursor-driven, **no page numbers/offset/grand totals**. The only permitted label is the count of rows actually returned to this caller (or none) — **never** "of N", match counts, or any value derived from anything but the returned page (tightens the latent leak vector). Sort/filter operate on owned, returned data only.

### 7.6 Responsive
Desktop two-pane where useful + persistent rail; mobile single-column, nav in `sheet`, sticky primary action, tables → stacked `card`s, touch targets ≥44px. **Mobile chip density (MINOR):** a primary chip always visible; secondary chips (window sub-state, bands) collapse into a single tappable summary or a defined second line with explicit wrap behavior; worked Bangla-width example for the densest row. **Low-bandwidth:** skeleton-first; files via `file-link` (`file_ref` only) + Supabase Storage direct (never blobs through the API); **S3/S5 documents are tap-to-download, not auto-fetched**; lazy-render version timelines. **No true-offline requirement** (see §7.2 offline note).

### 7.7 Accessibility (WCAG 2.1 AA)
Contrast ≥4.5:1 (3:1 large) on light tokens; **status never by color alone** (chips carry text); keyboard reachable/operable; `dialog`/`sheet` trap + restore focus; `error-state` `role="alert"`; live-region announcements for submit/conflict; skeletons `aria-busy`/decorative; band semantics always via localized text label.

### 7.8 i18n (Bangla + English)
No hardcoded strings (status labels included); numbers/dates/currency localized (lakh/crore grouping; Asia/Dhaka tz on deadlines); ICU placeholders (no concatenation); chips/buttons sized for ~1.4× Bangla width; at least one worked Bangla example for the longest status labels (e.g. "Closed — not awarded to you") with shortened Bangla variants where needed. Buyer-authored content (RFQ title/specs) passes through; platform copy is bilingual.

### 7.9 Locked-item / first-run byte-equivalence guard
Nav lock/unlock state is a **pure function of the vendor's own claim/verification lifecycle** (Invariant 3) and is **identical for any two vendors in the same claim_state** regardless of matching outcome; no nav lock, marker, or tooltip is ever keyed on matching/invitation outcomes; "!" markers derive only from received-invitation / own-record counts. Locked-item reasons are **tap-reachable** (inline panel/helper line), not tooltip-only (touch-friendly).

### 7.10 Cross-Cutting Checklist (every vendor screen MUST satisfy)
1. ☐ Active-org shown; reads/writes org-scoped; client org id never trusted.
2. ☐ Loading=`skeleton`; empty=`empty-state` (fixed key); error=`error-state`; missing/private=`not-found`.
3. ☐ Private/protected → `not-found`, never `error-state(AUTHORIZATION)`.
4. ☐ Empty/zero copy single canonical string, identical excluded vs not-matched.
5. ☐ Denominators = invitations-received / quotations-submitted only.
6. ☐ Errors branch on `error_class`; `reference_id` surfaced; no enrichment; standard recovery per class.
7. ☐ Submissions carry a stable idempotency key; no re-enable into a fresh key on transient failure; visible "check status" path.
8. ☐ Concurrency → CONFLICT UX preserving edits; revisions/specs append immutable versions.
9. ☐ Governance signals: four independent bands, read-only, no composite, no edit affordance; **`trust-badge` rendered without `score`** (lint/test enforced); frozen-suppressed + Not-Rated states handled.
10. ☐ Declared vs verified tier distinct; Financial Tier ≠ Subscription Plan; gates use entitlements, not plan names.
11. ☐ Capability = four independent flags, never one label/dropdown.
12. ☐ Lists = cursor only; no leaking totals/labels.
13. ☐ Money via `currency-display` (BDT default, locale threaded); files via `file-link` (`file_ref` only).
14. ☐ A11y: keyboard, focus, ≥4.5:1, color-not-alone, ARIA wired.
15. ☐ i18n: Bn+En, localized numbers/dates/currency, no hardcoded strings, Bangla width validated.
16. ☐ AI output labeled "AI Suggestion," advisory, accept/decline; render only if a wired advisory read returns data.
17. ☐ State chips: Doc-4M token underneath; surface supplies localized label+tone.

---

## 8. Non-Disclosure & Byte-Equivalence Playbook

The hardest constraint, consolidated. Binds to **Doc-7G GR11 / §10 / CHK-7-040 / Invariant 11** (frontend) — the DB counterpart is CHK-6-022 (Doc-6E).

### 8.1 MUST-NEVER-RENDER (ND list — in DOM, tooltip, any browser-visible response, analytics, or derived count)
| ID | Forbidden datum |
|---|---|
| ND-1 | Any other vendor's quotation, price, terms, attachment, or thread message |
| ND-2 | Count/existence/identity of competing invitees or quotes ("3 vendors quoting", "you're 1 of N") |
| ND-3 | Matching score, rank, confidence, routing reason ("you matched because…") |
| ND-4 | "Why not matched" / "why not invited" / any signal that an RFQ exists but the vendor wasn't invited (incl. any notification/indicator implying exclusion) |
| ND-5 | Buyer CRM notes, buyer's private vendor status, blacklist/Approved/Blocked status |
| ND-6 | The comparison statement / award rationale **before** close |
| ND-7 | Fraud/risk/suspicion signals (Admin-only) |
| ND-8 | Any analytics denominator other than invitations-received and quotations-submitted |

### 8.2 Byte-equivalence rule set (the attestation)
- **BE-1 — No exclusion-derived state in the client.** Exclusion never reaches the vendor leg on the wire; there is no flag/branch keyed on it. **Structural choice:** no "browse all RFQs" surface exists (§6.1).
- **BE-2 — One empty state, not two** (fixed i18n key; §7.2).
- **BE-3 — Zero is zero** (every counter from own received/submitted only; same numerals, copy, skeleton timing).
- **BE-4 — not-found ≡ absence** (no 403/forbidden/restricted variant; no "exists elsewhere" hint; deep-link outside active org → not-found, no org-switch suggestion).
- **BE-5 — Error non-disclosure** (branch on `error_class`; no message distinguishing excluded vs not-found).
- **BE-6 — No timing/skeleton tell** (no fast-path for excluded; automatic given BE-1).
- **BE-7 — Notification byte-equivalence (Board-mandated, e1).** Notification surfacing (deferred to the Doc-7C center) and any vendor-area indicator derives **only from own-record facts** (invitation received, clarification on a received RFQ, own quotation outcome). No notification or indicator is ever emitted from a "not matched"/exclusion event; the notification stream of an excluded vendor is byte-equivalent to a never-matched vendor's.

### 8.3 Surface-specific guards
- **Nav (§2):** badges derive only from invitations-received / quotations-submitted; no nav item/tooltip/state ever indicates exclusion; org switch reveals no cross-org comparison.
- **Dashboard (§3):** raw counts (no win-rate by default; if a rate, denominator = submitted, labeled); standing strip clarified "four independent signals, not a combined score"; first-run readiness from own data only.
- **Catalog/Profile (§4–§5):** own counts only; product total = own data (safe); guardrail — **no profile-reach/matched/visitor-vs-eligible-buyer metric may ever appear**; any future microsite analytics use own visitor counts only.
- **Quotation (§6):** own quotation `shortlisted` (own standing, safe) but never "not shortlisted"/rank/depth; invitation timestamp = vendor-leg delivery time, no cross-RFQ timing aggregation; M6 thread own-leg only.
- **Notifications (§2.1/§6.6):** delivery-only via the Doc-7C center; vendor-area indicators are own-record facts only (BE-7); no exclusion-implying event proposed.
- **Trust & Verification (§3/§7):** the vendor's own four bands only (own-profile Public-Badge projection); fraud/risk has **no UI presence at all**.

---

## 9. Component & Token Plan

### 9.1 Existing kit reused (by name; extend, never duplicate)
- **primitives/:** button, input, dialog, tabs, avatar, badge, card, dropdown-menu, separator, sheet, skeleton, tooltip.
- **components/:** currency-display, empty-state, error-state, file-link, form-field, not-found, pagination-control, status-chip.
- **embedded/:** trust-badge (band/tier only — **never the `score` prop**).
- **tokens:** semantic CSS vars (light default); domain `--iv-trust-*`, `--iv-tier-*`, `--iv-cap-*`, `--iv-brand-*`, semantic success/warning/danger/info.

### 9.2 Proposed additive kit components (each an `[ESC-7B-…]`; none duplicate a primitive)
| ID | Sev | Component | Why |
|---|---|---|---|
| `[ESC-7B-TRUSTSCORE]` | ✅ RESOLVED 2026-07-03 | `score` sanctioned wherever Trust display is authorized (Option 3); lint re-scoped to governance-only contexts | `score?:number` renders `· {score}` — now sanctioned for Trust per the `[ESC-7G-SCORE-DISPLAY]` ruling; Performance stays band-only |
| `[ESC-7B-EMPTY-LOCK]` | MAJOR | non-overridable copy for `empty-state`/`not-found` in vendor workspace | byte-equivalence currently rests on surface discipline |
| `[ESC-7B-I18N-HEADLINE]` | MAJOR | i18n-keyed `error-state` headlines | English literals block Bn parity |
| `[ESC-7B-SELECT]` | MAJOR | `select`/combobox form primitive (or `category-picker`) | `dropdown-menu` is a menu, not a value-bound select |
| `[ESC-7B-TIER-CHIP]` | MAJOR | tier chip (declared + read-only verified) `--iv-tier-*` | surfaces must not hand-roll colored badges |
| `[ESC-7B-PERF-BAND]` | MAJOR | performance-band component + token (or confirm semantic tones) | no `--iv-perf-*` today |
| `[ESC-7B-BREADCRUMB]` | MINOR | breadcrumb (non-disclosing; authorized ancestors only) | none in kit |
| `[ESC-7B-SEGMENTED]` | MINOR | segmented-control/toggle-group | participation/role grouping — `tabs` is wrong semantics |
| `[ESC-7B-METER]` | MINOR | usage/progress meter | quota "7/10", completeness "82%" |
| `[ESC-7B-STAT-TILE]` | MINOR | stat/count tile | recurs (governance/pipeline/quota); single place to enforce "positive-fact only" |
| `[ESC-7B-STEPPER]` | MINOR | claim stepper (`seeded→…→verified`) | none in kit |
| `[ESC-7B-SWITCH]` | MINOR | canonical on/off control | capability matrix flags |
| `[ESC-7B-TEXTAREA]` | MINOR | multi-line text primitive | product description / spec notes |
| `[ESC-7B-VERSION-LIST]` | MINOR | `version-history` (collapsible; current + "show N earlier") | specs + quotation revisions (Inv 8) |
| `[ESC-7B-WINDOW-CHIP]` | MINOR | window-state chip/variant | orthogonal to Doc-4M state chip |
| `[ESC-7B-BULK-BAR]` | NIT | bulk-action bar | catalog (and other lists) |
| `[ESC-7B-SEARCH]` | NIT→MINOR | command/combobox for global own-scope FTS search (own-org Postgres FTS now; Meilisearch future) | quick-jump by human ref |

> The brief's pre-existing kit-extension intuitions (`price-breakdown-editor`, `quota-meter`, `sortable-list`, `area-banner`) fold into the above (`version-list`/`stat-tile`/`meter`/`segmented`) or remain optional compositions; they are not separately escalated to avoid kit sprawl.

---

## 10. Open Questions & Escalations

### 10.1 Governance / contract escalations (Flag-and-Halt — do not resolve locally)
| ID | Sev | Summary | Disposition needed |
|---|---|---|---|
| **[ESC-7G-A7]** | ✅ RESOLVED 2026-07-12 | Hybrid "mount both" (Doc-7A R6 / Doc-7C SR3) vs the draft's re-routing toggle; **also** the design-introduced `(vendor)` nested segment name (not frozen in Doc-7C). Re-routing toggle **not shipped**; co-mounted-grouped adopted. | **Ruling:** all 5 sub-decisions approved as recommended — co-mounted grouped-not-merged, Trust terminal; `(vendor)` ratified as a non-routing layout group under `(app)` (Option 1, no corpus patch). Full record: `BOARD-PACKET-A7-HYBRID-COMOUNT-REALIZATION_v0.1.md`. |
| **[ESC-7G-SCORE-DISPLAY]** | ✅ RESOLVED 2026-07-03 | Doc-5G §5.3 "band + display score" vs Invariant-6 "bands only" — ruled: Invariant 6 is display-silent. | Board ruling: Trust Score (band + numeric + badges + factors) permitted on any public-facing surface; no corpus patch. Performance stays band-only. |
| **[ESC-7B-TRUSTSCORE]** | ✅ RESOLVED 2026-07-03 | `trust-badge.score` renders raw 0–100 — now sanctioned for Trust. | Option 3 ratified: prop ships as-is; lint re-scoped to governance-only contexts. |
| **[ESC-7G-A2]** | MAJOR | Org-Role→action gradations are an M1/Doc-4C concern; UI must consume server permission slugs, not a hard-coded table. | Doc-4C enumerate; UI binds to server flags. |
| **[ESC-7G-PIPE-CONTRACT]** | MAJOR | Dashboard count-by-stage needs a wired received-only count read; cursor lists yield no client total. | Confirm a frozen count read or render non-numeric; raise `[ESC-7-API]` if absent. |
| **[ESC-7G-FEED]** | MAJOR | Recent-activity needs an own-org positive-facts events read. | Confirm wired contract; guarantee no "not-invited" event enters the feed. |
| **[ESC-7G-04]** | MAJOR | Vendor-scoped read of the vendor's own verification case (status + own docs, not staff internals) may not exist; `trust.get_verification.v1` is Staff-Internal (Doc-5G §4.5). | Confirm a vendor-actor verification read or bind to public projection + profile reflection. |
| **[ESC-7G-Q-01]** | MAJOR | Vendor-leg RFQ-detail read name unconfirmed; gates S3. | Confirm in Doc-5E/Doc-4E; bind to `get_invitation` if it carries the snapshot. |
| **[ESC-7G-Q-03]** | MAJOR | Idempotency-key generation/scope. | Confirm Doc-7A rule; recommend server-minted key tied to draft + attempt. |
| **[ESC-7G-SLUG-MKT]** | MINOR | Several marketplace slugs (declared-tier get/set, tier history, capacity get/upsert, custom-domain lifecycle) cited as frozen but not per-slug confirmed against Doc-5D PassB. | Confirm each by exact versioned slug in Doc-5D PassB, or down-grade unconfirmed ones to `[ESC-…]`. |
| **[ESC-7G-Q-05]** | MINOR | M6 thread scope (buyer↔this-vendor vs broadcast). | Confirm Doc-4H scoping; filter to own-leg or Flag-and-Halt. |
| **[ESC-7G-Q-07]** | OBS→MINOR | Late-extension Phase-2 state — render as non-state UI flag unless Doc-4E/4M defines a vendor-visible state. | Map to Doc-4E/4M. |
| **[ESC-7G-AI]** | MINOR | M9 advisory read is a stub; panel renders only when a wired read returns data, scoped received-only. | Confirm wired advisory read. |
| **[ESC-7G-ENT-01/02]** | MAJOR/MINOR | Publish-entitlement must arrive on the RSC payload (out-of-wire resolution); numeric vs boolean shape. | Doc-4I/M7 confirm; render numeric/boolean only, allowance language. |
| **[ESC-7G-AD-01]** | MINOR | Ad state set + controlling contract unconfirmed. | Bind to Doc-4D/4M ad machine before building §7.1 ad rows. |
| **[ESC-7G-A1]** | MINOR | Participation lens persistence (now subsumed by `[ESC-7G-A7]`). | Confirm lens is not an authz boundary. |
| **[ESC-7G-05]** | MINOR | M1 read for Participation + Org Role display. | Bind by pointer to Doc-4C; confirm slug. |
| **[ESC-7G-06]** | MINOR | Microsite publish: `publish_microsite.v1` vs `publish_profile.v1`. | Confirm vendor-wired action in Doc-7G/Doc-4D. |
| **[ESC-7C-LOCALE]** | MINOR | Whether locale toggle belongs to the Doc-7C shell user-menu. | Confirm; bind by pointer, don't rebuild. |
| **[ESC-MKT-AUDIT]** | MINOR | Product create/edit/publish/unpublish audit actions unenumerated (Doc-2 §9); history UX depends on additive resolution. | Carry-forward existing channel; invent no audit action. |
| **[ESC-7A-CONF-01]** | OBS | Idempotency-key lifetime wording (one-per-attempt vs one-per-logical-submission). | Verify Doc-7A R-idempotency. |
| **[ESC-7G-A6]** | OBS | Org-switch abandons in-flight drafts. | Resolved via server-persisted autosave + unsaved-changes guard. |

### 10.2 Rejected / down-ranked findings (Validate-Findings dispositions)
- **`[ESC-7G-01]` (band reads "not confirmed", MAJOR) — REJECTED (not Valid).** `trust.get_trust_score.v1` / `trust.get_performance_score.v1` are frozen (Doc-4G PassB / Doc-5G §5.3, Public-Badge). Withdrawn; bound directly.
- **`[ESC-7G-CAT-01]` ("BC-MKT slugs open / set_product_status maybe split", MAJOR) — REJECTED (not Valid).** Catalog/spec/category slugs are frozen + versioned; `set_product_status.v1` is a single command with `target_status` enum. Withdrawn. *(Note: this withdrawal covers the catalog/spec/category slugs only; the separate `[ESC-7G-SLUG-MKT]` carries the still-unconfirmed declared-tier/capacity/custom-domain slugs.)*
- **`[ESC-7G-CONC-01]` ("no concurrency token", MINOR) — REJECTED (not Valid).** Frozen token is `updated_at` with `marketplace_product_update_conflict`. Withdrawn; UX implemented.
- **`[ESC-7G-Q-02]` (revised/awarded states, raised MAJOR) — ACCEPTED and RE-RANKED to BLOCKER**, then resolved by binding strictly to Doc-4M (§6.4). Carried as a state-machine conformance gate, not an open question.
- **`[ESC-7G-Q-06]` (own-submission win-rate) — ACCEPTED as conformant**, dispositioned: own-submission denominator is permitted (Doc-7G §10.3); default to raw counts; if a rate, numerator = own quotations in Doc-4M `selected`.
- **`CHK-6-022` as the frontend anchor — REJECTED (not Consistent with corpus).** Replaced with **CHK-7-040** (frontend, GR11/§10), CHK-6-022 retained only as the DB counterpart.
- **"GR12 embedded-component mandate" citation (MAJOR, this review) — ACCEPTED and CORRECTED.** GR12 = "coins nothing / never invokes the engine" (`Doc-7G_Content_v1.0_Pass2.md:108`); the four embedded components are mandated by **§11.1 / CHK-7-005** (lines 82, 97). Rebound throughout (§0.3, §3.5/§3.6, §6.6); GR12 reserved for the "coins nothing" rule; a GR#→§# mapping note added to §0.3.
- **ux-quality "test"/"t: d" finding (company-profile area) — REJECTED (not a substantive finding; placeholder).**

### 10.3 Known completeness gaps (design-ahead-of-gate; not conformance defects)
- **Post-award Engagements (M4) + Leads (MINOR, accepted as a gap-flag).** §2.2 mounts `(app)/engagements` and `(app)/leads`, and §6.5(F) hands off to M4, but these surfaces have **no screen inventory, wireframe, or conformance table yet** (the M4 post-award doc set — LOI/PO/challan/invoice/payment/WCC — and the received-only lead pipeline). Acceptable as Wave-3 design ahead of the gate; **must be filled before build (§11 step 8)** and is recorded here as a known completeness gap, not a blocker on the surfaces this companion does cover. **[FILLED 2026-06-30 by the Sec.13 Track-3 Addendum: Leads 13.2, Engagements 13.3, quote-builder 13.1; 9 new contract questions consolidated in 13.4.]**

---

## 11. Suggested Build Sequencing (design-only; roadmap-gated)

Vendor FE realization is **Wave-3-gated**; this is planning ahead of that gate and must not be built out of roadmap sequence. When the gate opens, a dependency-ordered sequence:

1. **Resolve the remaining BLOCKER** (`[ESC-7G-A7]` — `[ESC-7G-SCORE-DISPLAY]`/`[ESC-7B-TRUSTSCORE]` RESOLVED 2026-07-03) and the MAJOR contract escalations that gate screens (`[ESC-7G-PIPE-CONTRACT]`, `[ESC-7G-Q-01]`, `[ESC-7G-04]`, `[ESC-7G-A2]`, `[ESC-7G-ENT-01]`), plus per-slug confirmation of `[ESC-7G-SLUG-MKT]`. No vendor screen ships against an unconfirmed contract.
2. **Cross-cutting substrate (§7) + the byte-equivalence enforcement (§8 / `[ESC-7B-EMPTY-LOCK]`)** — these are prerequisites for every surface; land the conformance test that proves absent ≡ excluded (the CHK-7-040 evidence) and the notification byte-equivalence guard (BE-7).
3. **Kit additions (§9.2)** in dependency order: form primitives (`select`, `textarea`, `switch`), state primitives (`stat-tile`, `meter`, `version-list`, `window-chip`, `tier-chip`/`perf-band`), then nav helpers (`breadcrumb`, `segmented`, `search`).
4. **IA + shell integration (§2)** once Hybrid composition is ratified.
5. **Company Profile (Content) + Catalog (§4–§5)** — the matching substrate vendors must complete before quoting; includes the catalog→moat bridge and own-data readiness.
6. **Quotation Workflow (§6)** — the moat; depends on Doc-4M state mapping, the §11.1/CHK-7-005 embedded components (quota indicator/Doc-5I, M6 thread, AI advisory), idempotency, and autosave.
7. **Dashboard (§3)** last among primaries (it composes reads from all of the above; needs the count/feed/AI contracts resolved).
8. **Microsite/Presentation, Leads, Engagements, Billing, Trust, Settings** — the remaining nodes, each behind its confirmed reads and entitlement gates; **fill the M4 Engagements + Leads design gap (§10.3) here** before building those surfaces.

---

## 12. Track-2 Disposition Log (applied 2026-06-30)

> Records the outcome of **Track 2** — corpus verification of every machine-verifiable escalation in §10.1 — and **supersedes the OPEN statuses in §10.1** for the items below, **and the per-area workflow's premature "MAJOR = 0 / all clear" tally**. Each item was adjudicated against the frozen corpus on disk (Doc-2/3, Doc-4/5/7 series). Raise ≠ Accept: §10.1 remains the raise-record; this is the disposition record. The three architecture/authority BLOCKERs (§10.1: `[ESC-7G-SCORE-DISPLAY]`, `[ESC-7B-TRUSTSCORE]`, `[ESC-7G-A7]`) were **excluded** from Track 2 — human Board only.

**Outcome — 18/18 dispositioned:** CONFIRMED_BOUND = 14 (+ `ESC-7G-05` Org-Role leg) · CARRY_FORWARD = 2 · GENUINELY_MISSING = 2 (→ 2× `[ESC-7-API]`). MAJOR conformance defects = **0**; no new NEEDS_HUMAN.

**2026-07-03 (post-log ruling, pointer only):** `ESC-MKT-CANONICAL-URL` **ruled** (owner Board — see `esc_registry.md` + `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`; decision **ADR-024**): every approved vendor gets a universal **Platform-issued Vendor Subdomain**; canonical host = CHR (Doc-2 v1.0.5); S13's custom-domain lifecycle is unchanged and remains **external domains only**. New open handle: `ESC-MKT-SUBDOMAIN-MIGRATE` (no migration wire contract). No S13 screen change.

| ID | Sev | Verdict | Binding / routing (by pointer; bind exact versioned slug at build) |
|---|---|---|---|
| ESC-7G-A2 | MAJOR | CONFIRMED_BOUND | `identity.get_active_context.v1` → `effective_permission_summary`; catalog `identity.list_permissions.v1`; Doc-7A §4.3; `check_permission` out-of-wire. |
| ESC-7G-Q-01 | MAJOR | CONFIRMED_BOUND | bind `rfq.get_rfq.v1` (grant-scoped via `rfq_invitation_grantees`) — **not** `get_invitation` (which carries no RFQ snapshot). |
| ESC-7G-04 | MAJOR | CONFIRMED_BOUND | vendor own-status via `trust.get_verified_tier.v1` (Public-Badge); case detail is Admin/Staff-Internal only — do not coin a self-read. |
| ESC-7G-Q-03 | MAJOR | CONFIRMED_BOUND | Doc-4A §14.2 (Key-Scope `organization`) + App G.2 + POLICY `rfq.idempotency_dedup_window`; FE per Doc-7A §5.6. |
| ESC-7G-ENT-01 | MAJOR | CONFIRMED_BOUND | resolution authority = `billing.resolve_entitlements.v1` (BC-BILL-2; **out-of-wire**, Doc-5I §10 / Doc-7A §3.7 — **never frontend-callable**). RSC receives `{slug,type,value}` **server-side via the wired** `billing.get_subscription.v1`/`get_plan` reads over the Doc-7C server data seam (Doc-7E precedent). |
| **ESC-7G-PIPE-CONTRACT** | MAJOR | **GENUINELY_MISSING → `[ESC-7-API]` #1** | No frozen vendor count read exists (BC-OPS-3 = update/add/get/list; RFQ vendor-leg = get/list invitations; M6 = get/list notifications — all cursor, no aggregates). **Pipeline tiles render NON-NUMERIC "view" links** into existing `list_leads`/`list_invitations` filtered views — never client-derived totals (Inv 11; CHK-7-040; CHK-5A-073). A received-only count read is raised to the **API Governance Board**. |
| ESC-7G-FEED | MAJOR | CONFIRMED_BOUND | BC-COMM-2 `list_notifications`/`get_notification` via the Doc-7C SR6 center + per-aggregate positive-fact reads (Doc-5E §5, Doc-5F BC-OPS-3); "no not-invited event" corpus-guaranteed (Inv 11 / Doc-5H R10). |
| ESC-7G-SLUG-MKT | MINOR | CONFIRMED_BOUND | all six M2 slugs frozen in Doc-5D (declared-tier get/set, tier history, capacity get/upsert, custom-domain create/activate/release/get, `set_microsite_domain`). |
| ESC-7G-Q-05 | MINOR | CONFIRMED_BOUND | Doc-4H BC-COMM-1 thread/message/participant contracts (participant-scoped; non-participants → NOT_FOUND; no broadcast). |
| ESC-7G-Q-07 | MINOR | CONFIRMED_BOUND | `rfq.request_late_extension.v1` response `window_state` rendered as a non-state operational flag (Doc-4E §E7.4). |
| ESC-7G-AI | MINOR | CONFIRMED_BOUND | Doc-5K `ai.get_*`/`ai.list_*` reads (Subject-Org tenancy); gate via `check_permission` (existing `[ESC-AI-SLUG]`). **Not** a stub. |
| ESC-7G-AD-01 | MINOR | CONFIRMED_BOUND | Doc-2 §5.8 ad state set + Doc-4D Pass-B ad contracts (slug `can_manage_ads`); M2 owns ad rows. |
| ESC-7G-06 | MINOR | CONFIRMED_BOUND | two distinct frozen contracts: `marketplace.publish_microsite.v1` (microsite) and `marketplace.publish_profile.v1` (profile experience). |
| ESC-7C-LOCALE | MINOR | CONFIRMED_BOUND | locale = i18n mechanism baseline, **not** Doc-7C shell chrome. |
| ESC-7A-CONF-01 | OBS | CONFIRMED_BOUND | idempotency-key lifetime = one key per logical submission (Doc-7A §5.6 eff. Pass2_Patch C-4; CHK-7-003). |
| **ESC-7G-05** | MINOR | **SPLIT** | Org-Role display **CONFIRMED** (`identity.get_active_context.v1` + `identity.list_roles.v1`). **Platform-Participation display GENUINELY_MISSING** on wire (derived flags only on out-of-wire `identity.get_organization.v1`) → **`[ESC-7-API]` #2**. |
| ESC-7G-ENT-02 | MINOR | CARRY_FORWARD | `billing.resolve_entitlements.v1` shape `{slug,type,value}`; boolean-vs-numeric decision owned by existing **`[ESC-BILL-SLUG]`**. |
| ESC-MKT-AUDIT | MINOR | CARRY_FORWARD | product audit `action` bound by pointer to nearest Doc-2 §9 (free-text) or additive §9 row; existing **`[ESC-MKT-AUDIT]`** channel. |

### 12.1 New API-Governance-Board items (genuine contract gaps — §7 rank 5; owner-assigned; do not invent slugs)
- **`[ESC-7-API]` #1 — received-only pipeline count read** (from `ESC-7G-PIPE-CONTRACT`). Owner: M3 RFQ / M4 Operations. Must count received invitations / submitted quotations / own-org `vendor_leads`-by-stage only, inheriting CHK-7-040 / CHK-5A-073 byte-equivalence. Until authored, the dashboard renders non-numeric "view" links.
- **`[ESC-7-API]` #2 — caller-facing M1 participation read** (from `ESC-7G-05`). Owner: M1 Identity. Additive wire read exposing the active org's derived Platform Participation (Buyer/Vendor/Hybrid) from `has_buyer_profile`/`has_vendor_profile` — currently only on out-of-wire `identity.get_organization.v1`.

### 12.2 Corrected post-Track-2 gate tally (authoritative; supersedes §10 and the workflow report)
- **BLOCKER = 0** — `[ESC-7G-A7]` **RESOLVED 2026-07-12** (Board ruling — see `governanceReviews/BOARD-PACKET-A7-HYBRID-COMOUNT-REALIZATION_v0.1.md`). `[ESC-7G-SCORE-DISPLAY]` and `[ESC-7B-TRUSTSCORE]` **RESOLVED 2026-07-03** (Board ruling — see `governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`). All three platform/authority BLOCKERs now resolved; promotion to FROZEN v1.0 is a separate explicit Board/owner action.
- **MAJOR conformance defects = 0** — all five adjudicated; where a contract is absent the design degrades gracefully (non-numeric links).
- **Open contract gaps → API Governance Board = 2** — the two `[ESC-7-API]` items above (one MAJOR-origin, one MINOR-origin).
- **Carried on existing channels = 2** — `[ESC-BILL-SLUG]`, `[ESC-MKT-AUDIT]`.
- **Gate verdict: BLOCKER dimension cleared 2026-07-12** (all three human-Board BLOCKERs resolved). Remaining open items are non-freeze-blocking contract gaps routed to the API Governance Board (×2) and two carried channels. **Formal promotion to FROZEN v1.0 is a separate, explicit Board/owner action** — not self-declared here.

---

## 13. Track-3 Design Addendum — Leads, Engagements & the Quote-Builder

> **Status:** NON-AUTHORITATIVE design companion (Track-3 addendum, appended to `vendor_planning_and_design.md` after §12). Realizes the UX of FROZEN **Doc-7G §8–§9** on the FROZEN Doc-7A (R1–R12) / Doc-7B kit / Doc-7C shell foundation. **Coins nothing; reference-never-restate** — every state, contract, slug, audit action, and POLICY key binds the frozen corpus by pointer. On any conflict the frozen `generatedDocs/` corpus wins (CLAUDE.md §7); divergences are **Flag-and-Halt** (`[ESC-…]`), never resolved locally. **NO CODE.** Vendor FE realization is **Wave-3-gated** (§11) — this is design ahead of the gate.
>
> **What this fills.** This addendum closes the companion's **§10.3 completeness gap** in full — both halves: **Engagements (M4 post-award, §13.3)** and **Leads (M4 received-only pipeline, §13.2)** — and discharges the **MAJOR-10 enrichment** by wireframing the **quote-builder (S4, §13.1)** whose conformance row sits unrealized in the companion (S4 row, §6.7). It binds the same authority and house style as the companion and reuses its existing `[ESC-7B-*]` kit register (§9.2) and Track-2 dispositions (§12) — coining no new kit primitive.
>
> **Adjudication method.** Every per-area review finding was run through the §13 Validate-Findings gate (Valid? · Applicable? · Best for the product? · Consistent with the frozen corpus?). Every **valid** BLOCKER/MAJOR/MINOR is **implemented** in the wireframes/flows/tables below; rejected findings carry a one-line disposition in the relevant subsection's **Disposition log**. Where a valid finding exposed a conflict with a frozen document, it is **Flag-and-Halted** as a new `[ESC-…]` consolidated in **§13.4** — these do **not** silently resolve.
>
> **Verification note (load-bearing anchors confirmed on disk).** `rfq.submit_quotation.v1` Error Register carries `REFERENCE` (stale `rfq_version_id`, `retryable:false`) **and** `CONFLICT` (second active quotation, `retryable:false`) — `Doc-4E_PassB_Part4_v1.0_FROZEN.md:71–74,92–93,98`; the request schema marks `warranty_terms` **required=no/nullable=yes**, the attachments field is **`attachments_refs : uuid[]`**, and **`invitation_id` + `rfq_id` are both required=yes inputs** — `:50–51,55,57`; the response `human_ref` is **`QTN-…`** (never `QUO-…`) — `:59`; there is **no draft-write contract** (the quotation is created by submit) — `:70,98`. `[ESC-7G-Q-01]` is **CLOSED → `rfq.get_rfq.v1`** (grant-scoped via `rfq_invitation_grantees`), not `get_invitation` — companion `:660`. `ops.get_engagement.v1` projects exactly `{engagement_id, human_ref, status, buyer_organization_id, vendor_profile_id, vendor_controlling_org_id, award_value_snapshot, currency}` and **does not return `rfq_id`** — `Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md:462`. Lead machine `received → quoted → negotiation → won | lost → follow_up`, no event, NOT_FOUND collapse, `won/lost` ≠ governance signal — `Doc-5F_Content_v1.0_Pass3.md:29–36,41`.

---

### 13.1 Quote-Builder (S4 / S4-rev) — realizes the MAJOR-10 enrichment

Single staged builder bound to a **fixed `rfq_version_id`** snapshot. Two server-resolved modes on one surface: **compose** (authors a `draft`, Submit consumes one quota unit) and **revise** (authors a new immutable version of a `submitted` quotation; no quota). Mode is resolved server-side from the quotation's existence + Doc-4M state (Invariant 5) — never a client flag.

**Required-input note (contract completeness).** Beyond the vendor-entered quote fields (`price_breakdown`, `delivery_terms`, `warranty_terms` (optional), `spec_compliance_declaration`, `attachments_refs`, `rfq_version_id`), the FROZEN request schema also marks **`invitation_id` (required, Stage 7 REFERENCE) and `rfq_id` (required)** — `Doc-4E_PassB_Part4_v1.0_FROZEN.md:50–51,71`. These are **server-derived-from-grant inputs**, resolved from `rfq_invitation_grantees` at S4 entry (Inv 5; same grant resolution that locks `rfq_version_id`), never vendor-typed. The Submit composition therefore carries all eight frozen request fields; the builder surfaces only the six vendor-authored ones.

**Validate-Findings adjudications applied here (conformance review):**
- **B-1 (BLOCKER) — VALID & IMPLEMENTED.** The snapshot read binds **`rfq.get_rfq.v1`** (grant-scoped via `rfq_invitation_grantees`), the companion's CLOSED `[ESC-7G-Q-01]` resolution (`:660`). The prior `get_invitation` binding and "does not re-resolve `get_rfq`" reasoning are removed; `[ESC-7G-Q-01]` is **not** a gating item here.
- **B-2 (BLOCKER) — VALID; Flag-and-Halt.** No frozen draft-write/draft-read contract exists (`Doc-4E_PassB_Part4_v1.0_FROZEN.md:70,98`). The companion's prior §10.1 `[ESC-7G-A6]` "resolved via server-persisted autosave" and §11 step-6 "autosave" assumption **conflict with the frozen corpus**. Per CLAUDE.md §11 this is not resolved locally → **`[ESC-7G-Q-DRAFT]`** (§13.4). Until ruled, the builder's **default is client-local autosave** (relabel "Saved" → **"Saved on this device"**); no server-persisted draft write/read is asserted as bound.
- **M-1 (MAJOR) — VALID & IMPLEMENTED.** `REFERENCE` (stale-version) Submit branch added (Flow B step 9b).
- **M-2 (MAJOR) — VALID & IMPLEMENTED.** `CONFLICT` (second-active-quotation) Submit branch added (Flow B step 9c).
- **M-3 (MAJOR) — VALID & IMPLEMENTED (escalation removed).** `[ESC-7G-Q-IDEMP]` is **deleted**; idempotency carriage binds the already-CONFIRMED `ESC-7G-Q-03` (`:662`) + `ESC-7A-CONF-01` (`:673`), with the dedup window owned by the existing `[ESC-RFQ-POLICY]` (`Doc-4E_PassB_Part4_v1.0_FROZEN.md:98`). Stated as already-bound, not a new question.
- **m-1 (MINOR) — VALID & IMPLEMENTED.** Submit also drives the server-internal RFQ edge `vendors_notified → quotations_received`; noted as a server consequence **not surfaced** to the vendor (no "first to quote" signal — ND/Invariant 11).
- **m-2 (MINOR) — VALID & IMPLEMENTED.** Attachments field bound by frozen name **`attachments_refs : uuid[]`**.
- **m-3 (MINOR) — VALID & IMPLEMENTED.** `warranty_terms` is **optional**; removed from the Submit gate; gate only on frozen-required `price_breakdown`, `delivery_terms`, `spec_compliance_declaration`, `rfq_version_id`.
- **m-4 (MINOR) — VALID & IMPLEMENTED.** Submit composition documented as carrying the frozen-required **`invitation_id` + `rfq_id`** (server-derived-from-grant, resolved from `rfq_invitation_grantees` at S4 entry — `:50–51,71`), making the wireframe's Submit contract-complete against the request schema.
- **n-1, n-2 (NIT) — ACCEPTED.** Quota value reads server-side via `[ESC-7G-ENT-01]` (`:663`); "v1/v2" labelled as display derived from `version_no`.

**Quality-review adjudications applied here:**
- **M-Q1 (MAJOR) — VALID & IMPLEMENTED.** Step rail tabs are **directly clickable in any order**; Preview is **skippable**; Submit reachable from any section once completeness met.
- **M-Q2 (MAJOR) — PARTIALLY VALID.** Draft-resume entry **applies but depends on `[ESC-7G-Q-DRAFT]`** — if drafts are server-persisted, S3's CTA becomes `[ Resume quotation → ]` (one draft per grant); if client-local, resume is device-scoped. Recorded against `[ESC-7G-Q-DRAFT]`, not asserted as bound.
- **M-Q3 (MAJOR) — VALID & IMPLEMENTED.** Tax/VAT is an explicit computed row (`Subtotal → +VAT@x% → TOTAL`, live recompute) with an inclusive/exclusive toggle and a stated BDT rounding rule (internal `price_breakdown` jsonb shape; no contract impact).
- **M-Q4 (MAJOR) — VALID & IMPLEMENTED.** A **completeness/error summary** on the Submit step lists each blocking field with a deep-link; each `!` badge is tap-through; Submit's disabled state shows a visible reason.
- **N-Q1, N-Q3 (MINOR) — VALID & IMPLEMENTED.** Live window countdown with escalating tone under a threshold; **Submit gated on `attachments_refs` being committed** (no submit with queued/unsent files).
- **N-Q2 (MINOR) — VALID & IMPLEMENTED.** QUOTA / low-quota copy carries a firewall-safe "Manage plan" CTA into the own-account billing surface.
- **N-Q4, N-Q5, NIT-Q1..Q3 — ACCEPTED.** Numeric-keypad inputs that auto-group lakh BDT on blur; first-run hint on Section 4 (deviation concept); bilingual chrome/validation + Bangla free-text; "Saved on this device / will sync" offline distinction; per-line Preview edit deep-links.
- **OBS-Q1..Q3 — NOTED, no action.** Single-surface compose/revise pattern and idempotency "Check status" praised; "duplicate from previous quote" is out of scope (would need its own cross-RFQ firewall check).

#### Screen inventory

| ID | Route | Mode | Purpose | Entry |
|---|---|---|---|---|
| **S4** | `(app)/rfqs/[rfqId]/quotation` | compose | Staged builder over a fixed `rfq_version_id`; authors a `draft`; **Submit** consumes one quota unit (`rfq.submit_quotation.v1`). | S3 `[ Start / Resume quotation → ]` |
| **S4-rev** | same route (revision mode) | revise | Same builder, re-entered to author a new immutable version of a `submitted`/`shortlisted` quotation (`rfq.revise_quotation.v1`; no quota; `expected_version_no`). | S5 `[ Revise ]` (pre-award only) |

#### Wireframe — staged builder (compose; desktop)

```
┌─ (app) ─ Org: ACME Pumps Ltd ▾ ───────────────────────────────── ⓘ  👤 ─┐  ← shell: server-resolved active org (Inv 5)
├──────────────────────────────────────────────────────────────────────────┤
│ ‹ Back to RFQ-2026-000481 · Boiler feed pumps              [ESC-7B-BREADCRUMB]│
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ Quoting RFQ-2026-000481 · version locked: rfq_v3 (28 Jun)           │   │ ← read = rfq.get_rfq.v1 (grant-scoped) [B-1]
│ │ [window-chip: OPEN — closes 02 Jul 18:00 BST · ⏳ 5h 58m]  [Saved on │   │ ← live countdown [N-Q1]; device-save badge [B-2]
│ │  this device 12:04]   Quota ▓▓▓▓▓▓▓░░░ 7/10  ⓘ 1 unit @ SUBMIT       │   │ ← Doc-5I quota via [ESC-7G-ENT-01]
│ │  ⓘ invitation_id + rfq_id resolved from your grant (not shown) [m-4] │   │ ← server-derived-from-grant submit inputs
│ └────────────────────────────────────────────────────────────────────┘   │
├──────────────────────┬─────────────────────────────────────────────────────┤
│ STEPS (clickable —   │  SECTION 1 · PRICE BREAKDOWN (price_breakdown · jsonb)│
│  any order) [M-Q1]   │  ┌─#─┬─Description──────┬─Qty─┬─Unit (BDT)─┬───Amt───┐ │
│ ● 1 Price       ✓    │  │ 1 │ API 610 BB2 pump │  4  │ 2,40,000   │ 9,60,000 │ │ ← numeric keypad, lakh-group on blur [N-Q4]
│ ○ 2 Delivery    ✓    │  │ 2 │ Commissioning    │  1  │   80,000   │   80,000 │ │
│ ○ 3 Warranty  (opt)  │  │ [+ Add line]                                      │ │ ← Warranty optional [m-3]
│ ○ 4 Compliance  !    │  ├───────────────────────────────────────────────────┤ │
│ ○ 5 Attachments ✓    │  │ Subtotal                            10,40,000 BDT │ │
│ ○ 6 Preview   (skip) │  │ VAT  [ 7.5 %]  ( ) inclusive  (•) exclusive       │ │ ← computed tax row + toggle [M-Q3]
│ ○ 7 Submit      —    │  │ TOTAL                               11,18,000 BDT │ │ ← live recompute; BDT round half-up
│ Legend ✓ done · !    │  └───────────────────────────────────────────────────┘ │
│  required · ⋯ partial│  form-field errors render per field (Doc-5A)            │
│ ─────────────────    │  ⚡ AI Suggestion (advisory; if wired) [accept][decline]│  ← Invariant 12; never auto-fills binding field
│ Tap a `!` to jump → │  [ ‹ Prev ]        [ Save draft ]      [ Next: Delivery ›]│ ← Save = local; tabs clickable [M-Q1]
└──────────────────────┴─────────────────────────────────────────────────────┘
```

Sections 2–5 (delivery `delivery_terms`, warranty `warranty_terms` **optional**, compliance `spec_compliance_declaration` per attached spec revision, attachments `attachments_refs : uuid[]` file_ref-only) compose `[ESC-7B-SELECT]` / `[ESC-7B-TEXTAREA]` / `[ESC-7B-SWITCH]` / `[ESC-7B-SEGMENTED]` + **file-link** exactly as the companion §6.4/§11.3 enumerate. Section 5 uploads resumably offline; **Submit is gated on every `attachments_refs` upload being committed** [N-Q3].

**Section 7 · Submit (the only quota-consuming action) + completeness summary [M-Q4]:**
```
│ SECTION 7 · SUBMIT                                                           │
│ ⚠ 1 item blocks submit:                                                      │
│   • Compliance — R2 needs a declaration   → [ Go to Compliance ]            │ ← deep-link per blocker [M-Q4]
│ Submitting consumes ONE quota unit (7/10 → 8/10). Sealed at version v1.      │
│ (Submit carries invitation_id + rfq_id from your grant — server-derived [m-4])│
│ Then you may REVISE (new version, no quota) or WITHDRAW (pre-award).         │
│ Window OPEN — ⏳ 5h 21m.                                                     │
│           [ Submit quotation ]  ← enabled iff state==draft ∧ required ✓      │
│                                  ∧ quota>0 ∧ window OPEN ∧ attachments done  │
└─────────────────────────────────────────────────────────────────────────────┘
```

Mobile collapses the rail to a `[ESC-7B-SEGMENTED]` stepper + sticky bottom action bar; one section per viewport; the only network action that must succeed online is **Submit**.

#### Numbered flows + state transitions

**Flow B — Author → (skippable) Preview → Submit (compose).**
1. Enter from S3. Server resolves the grant via `rfq_invitation_grantees` (Inv 5), **locks `rfq_version_id`** via `rfq.get_rfq.v1` [B-1], and derives the frozen-required **`invitation_id` + `rfq_id`** from the same grant for the eventual Submit composition [m-4]. If quota is exhausted, S3 pre-warned/disabled entry (companion §6.5 B).
2. Quotation is **`draft`** (Doc-4M). Sections fill in **any order** [M-Q1]; autosave persists **locally on this device** [B-2] → "Saved on this device HH:MM".
3. Section 4 gate: every requirement carries compliant/deviation (deviation ⇒ note). Section completeness drives the legend; Warranty is **optional** [m-3].
4. Preview (Section 6) is **skippable**; read-only, own-data only (no competitor count/identity/rank — ND-2/3).
5. **Submit (Section 7):** enabled iff `state==draft` ∧ frozen-required sections ✓ ∧ quota>0 ∧ window OPEN ∧ `attachments_refs` committed [N-Q3]. On press → `rfq.submit_quotation.v1` carrying all eight frozen request fields (the six vendor-authored fields + server-derived `invitation_id` + `rfq_id` [m-4]) with a **required idempotency key** (one per logical submission, reused across retries — `ESC-7G-Q-03`/`ESC-7A-CONF-01`).
6. **Success:** Doc-4M `draft → submitted`; the sealed quotation carries `human_ref` **`QTN-…`** (`:59`); **one quota unit consumed** (server-reflected, never client-decremented). Server-internally Submit also drives the RFQ edge `vendors_notified → quotations_received` on first quote — **not surfaced** to the vendor (no "first to quote" — Inv 11) [m-1]. Navigate to S5 (sealed v1).
7. **QUOTA** (`error_class=QUOTA`, `retryable:false`): draft retained; **no retry button**; generic non-disclosing copy + firewall-safe **"Manage plan"** CTA [N-Q2].
8. **Transient / idempotency-replay:** "Submission status uncertain" + **[ Check status ]** re-sends the **same key** → original result; unit never double-consumed.
9. Required error branches (Doc-7A error-branching-on-`error_class`):
   - **9a STATE / window-closed:** Submit rejected; builder goes read-only "window closed"; draft preserved; action bar → `[ Back to RFQ ]`. No reason beyond "closed" (ND).
   - **9b REFERENCE (stale `rfq_version_id`, `retryable:false`) [M-1]:** non-disclosing "The RFQ was updated — review the new version and re-confirm"; re-resolves `rfq.get_rfq.v1` to the new `rfq_version_id`, **preserves entered fields** (preservation is **client-local** — a device-memory promise, not a contract guarantee, until `[ESC-7G-Q-DRAFT]` rules [OBS]), requires explicit re-confirm before Submit re-enables.
   - **9c CONFLICT (second active quotation, `retryable:false`) [M-2]:** route to the existing active quotation with **replace / revise / withdraw** — own-org only, **no buyer-visible signal** (Doc-3 §2.8).

**State summary (Flow B):** `draft` →(submit, +1 quota, idempotency key)→ `submitted`. Server-internal RFQ edge `vendors_notified → quotations_received` is a consequence, not vendor-surfaced.

**Flow C — Revise (S4-rev; same builder, new immutable version).** Enter from S5 `[ Revise ]` (pre-award only: `submitted`/`shortlisted`). Loads current version + carries `expected_version_no`. Header band: "Revising v1 → drafting v2 · supersedes v1" with the superseded chain (`[ESC-7B-VERSION-LIST]`, Invariant 8). Submit → `rfq.revise_quotation.v1` (**no quota, no event**, `expected_version_no`). Quotation **stays `submitted`** (Doc-4M has no `revised` state — companion §6.4); `vN → vN+1`, prior superseded (visible, never hard-deleted). **CONFLICT** (`expected_version_no` mismatch, `retryable:true`) → reconcile view that **preserves the vendor's in-progress edits** (client-local until `[ESC-7G-Q-DRAFT]` [OBS]), re-applies onto the advanced version with per-section merge confirm.

**Flow E — Withdraw (cross-ref).** Initiated from S5, `rfq.withdraw_quotation.v1`: `submitted → withdrawn` (terminal, pre-award). The builder offers no withdraw control. Outcome states `selected`/`not_selected` (only from `shortlisted`) and `expired` (from `submitted`) render in S5/S9, never as a builder action; no "why not selected"/rank/competitor count (ND-2/3).

#### Component composition (kit by name)

Shell + org switcher (Doc-7C); **card**+**separator** header band; **status-chip** (window via `[ESC-7B-WINDOW-CHIP]`; quotation/version via Doc-4M token); **billing/quota embedded component** (Doc-5I, CHK-7-005 — not a raw `meter`); **tabs** (desktop rail) · `[ESC-7B-SEGMENTED]` (mobile stepper); **input** + **form-field** + `[ESC-7B-SELECT]`/`[ESC-7B-TEXTAREA]`/`[ESC-7B-SWITCH]`; **currency-display** (BDT, locale-threaded); **file-link** (`attachments_refs` file_ref-only); **card** Preview; AI advisory embedded panel (render-only-if-wired); **button** (Submit primary, Save secondary); **error-state** (QUOTA/STATE/REFERENCE — non-disclosing); **dialog** ("Submission status uncertain" → Check status; CONFLICT reconcile); `[ESC-7B-VERSION-LIST]` (revise chain); `[ESC-7B-BREADCRUMB]`; **not-found** (absent grant ≡ absence, Inv 11). All `[ESC-7B-*]` reuse the companion §11.3 register — **no new kit primitive coined**.

#### Per-screen conformance table

| Screen | Read | Write | Out-of-wire | Invariants | States | Gates | Non-disclosure |
|---|---|---|---|---|---|---|---|
| **S4 (compose)** | `rfq.get_rfq.v1` (grant-scoped via `rfq_invitation_grantees`) [B-1]; Doc-5I quota via `billing.get_subscription.v1`/`resolve_entitlements` server-side (`[ESC-7G-ENT-01]`); **no draft read** (`[ESC-7G-Q-DRAFT]`) | `rfq.submit_quotation.v1` (carries 8 frozen request fields incl. server-derived `invitation_id`+`rfq_id` [m-4]; required idempotency key, org-scoped, one-per-submission reused on retry — `ESC-7G-Q-03`/`ESC-7A-CONF-01`); autosave = **local-on-device** until ruled [B-2] | matching/routing engine; award decision (M3); `monthly_rfq_limit` enforced server-side at SUBMIT; server-internal RFQ edge `vendors_notified→quotations_received` [m-1] | 4,5,7,8,9,12 | `draft→submitted` (sealed `QTN-…` [m-4/`:59`]); QUOTA (`retryable:false`); STATE/window-closed; **REFERENCE** (stale version) [M-1]; **CONFLICT** (2nd active quote) [M-2]; idempotency-replay (Check status) | `monthly_rfq_limit` at SUBMIT; window OPEN; `state==draft`; frozen-required sections ✓ (**not** warranty) [m-3]; `attachments_refs` committed [N-Q3] | ND-1/2/3; BE-5 — no competitor count/identity/rank; QUOTA copy generic (+Manage-plan, own-account); preview own-data only; no "first to quote"; **never** a pay/settle/escrow affordance |
| **S4-rev (revise)** | `rfq.get_quotation.v1` (current version + `expected_version_no`; superseded chain) | `rfq.revise_quotation.v1` (**no quota, no event**, `expected_version_no`) | — | 7,8 | quotation stays `submitted`; `vN→vN+1` (immutable, superseded visible); **CONFLICT** (`retryable:true`) → reconcile preserving vendor edits (client-local [OBS]) | pre-award only (`submitted`/`shortlisted`); owner org; no quota | ND-1; BE-5 — chain shows own versions only |

---

### 13.2 Leads / Pipeline (M4, received-only) — fills §10.3 (leads)

The vendor's private CRM of received RFQ invitations at `(app)/leads` (M4, BC-OPS-3). Leads are created **out-of-wire** by `ops.create_lead_on_invitation` (← `VendorInvited`, only at invitation `delivered`); **the vendor never self-creates a lead — no create affordance exists.** The vendor advances stage, logs activity, and reads its own leads. Lead carries `rfq_id`/`invitation_id`/`vendor_profile_id` as **bare UUIDs** (not a window into RFQ data — DF-3); `won`/`lost` is **private CRM, never the RFQ award, never a governance signal** (R6 firewall — `Doc-5F_Content_v1.0_Pass3.md:30`).

**Validate-Findings adjudications applied here (conformance review — PASS with 2 MINOR):**
- **MINOR-1 — VALID & IMPLEMENTED.** Wording narrowed: this surface forbids any **lead-stage** win-rate/conversion metric (a denominator over received leads risks the matched-but-excluded universe — ND-8); the **own-submission quotation win-rate permitted under `[ESC-7G-Q-06]`** (`:626`) is a separate Quotation-surface metric, not a Leads metric.
- **MINOR-2 — VALID & IMPLEMENTED + Flag-and-Halt.** Board columns are **lazy/cursor-bounded**; no client aggregation across columns is performed or cached (the anti-derivation stance applies uniformly). The `list_leads` **`stage` filter input is not confirmed** in the frozen signature → **`[ESC-7G-LEAD-FILTER]`** (§13.4); until confirmed, the board falls back to the single list view filtered client-side **without** any cross-column tally.
- **NIT-1 — VALID & IMPLEMENTED.** `won` chip tone changed from `success` to **neutral/brand** so an affirmative award reading isn't system-voiced (label retains "(your CRM)").
- **NIT-2 — VALID & IMPLEMENTED.** `[ESC-OPS-AUDIT]` reworded from "channel" to "audit-action mapping pending `[ESC-OPS-AUDIT]`".
- **NIT-3 — VALID & IMPLEMENTED.** `LD-…` lead human-ref is **not coined**; the wireframe labels it illustrative and the actual lead human-ref scheme is deferred → consolidated under **`[ESC-7G-LEAD-REF]`** (§13.4).
- **OBS-1..4 — NOTED.** This addendum fills the leads half (engagements half = §13.3); money boundary clean; `[ESC-7G-LEAD-MACHINE]` (OBS) and `[ESC-7G-LEAD-NOTE]` (MINOR) correctly raised, not resolved.

**Quality-review adjudications applied here:**
- **M-1 (MAJOR) — VALID & IMPLEMENTED.** `next_action_at` carries a **relative, non-numeric urgency pill** (overdue / due today) driven purely by the row's own date (own CRM data; no aggregate); a non-numeric **"Due first"** option added to the existing Sort.
- **M-2 (MAJOR) — VALID & IMPLEMENTED.** PL-2 surfaces **Mark won / Mark lost** as first-class secondary buttons (still routing through the same `update_lead_stage` confirm + optimistic-concurrency reconcile); entering `won`/`lost` prompts to clear/set `next_action_at` in the same confirm step.
- **M-3 (MAJOR) — VALID & IMPLEMENTED.** **List is the default and the low-bandwidth recommendation**; board is a desktop convenience with **lazy per-column loading** (idle column costs nothing); on mutation timeout the row/chip shows a **pending tone + Retry that reuses the same Idempotency-Key**.
- **m-4 (MINOR) — VALID & IMPLEMENTED.** The single canonical empty copy **is** the first-run guidance: "Leads appear here automatically when a buyer invites you to an RFQ. You don't create them." — byte-identical across excluded/never-matched/zero (asserts nothing about *this* vendor).
- **m-5 (MINOR) — VALID & IMPLEMENTED.** `value_estimate` editor = `currency-display`-paired input, explicit currency token (BDT default, locale-threaded lakh grouping), Bangla digits accepted.
- **m-6 (MINOR) — VALID & IMPLEMENTED.** Fixed bilingual quick-activity chips (Called / Emailed / Met / Quoted-followup / Note) pre-fill the `activity_jsonb` type — client convenience over the unchanged `add_lead_activity`.
- **m-7 (MINOR) — VALID & IMPLEMENTED.** CONFLICT recovery points to the latest activity/stage entry's server-captured `actor_user_id` ("already advanced to {S'} by {actor}").
- **m-8 (MINOR) — PARTIALLY IMPLEMENTED.** Row keyboard focus + Enter-to-open + real-anchor RFQ link (new-tab capable) added; **bulk stage writes stay out of scope** (each is its own M4 write/optimistic-concurrency) — stated explicitly.
- **n-9..n-12, o-13..o-15 — ACCEPTED/NOTED.** "No date" neutral token; `lost`/empty column uses the **same canonical empty token** (drops "(none in view)"); stage hint line phrased "typical flow" (true adjacency deferred to the server-derived legal set); `LD-…` illustrative-only [→ `[ESC-7G-LEAD-REF]`]; own-pipeline win-rate genuinely parked behind `[ESC-7-API]` #1; note/activity scannability consequence of the `[ESC-7G-LEAD-NOTE]` fallback noted.

#### Screen inventory

| ID | Screen | Route | Purpose |
|---|---|---|---|
| **PL-1** | Pipeline (list default · board toggle) | `(app)/leads` | Own received leads. List is default/low-bw [M-3]; board columns are stage views with **non-numeric `[ view → ]`** (no counts; `[ESC-7-API]` #1), lazy per-column. Cursor pagination, no totals. |
| **PL-2** | Lead Detail | `(app)/leads/[leadId]` | One lead: entitled RFQ/buyer context, stage advance + Mark won/lost, append-only activity, private notes. Links out to the originating RFQ (M3) / own quotation. |
| **PL-0** | Genuine-empty | conditional on PL-1 | One canonical `empty-state` (fixed key) carrying first-run guidance [m-4]; byte-identical for excluded ≡ never-matched ≡ zero (BE-1/2/3). |
| **PL-2NF** | Not-found | PL-2 boundary | `not-found` byte-identical to absence for any non-owned `leadId` (NOT_FOUND collapse — `Doc-5F_Content_v1.0_Pass3.md:35`; BE-4). |
| **PL-1L/2L · PL-1E/2E** | Loading · Error | boundaries | Byte-identical skeleton (BE-6); `error-state` branched on `error_class`, no enrichment (BE-5). |

#### Wireframe — PL-1 Pipeline (desktop, list view = default)

```
┌─ Vendor Workspace › Leads / Pipeline ───────────────────────────  Org: ⌂ Padma Steel Ltd ─┐
│ Your leads · received from RFQ invitations · private to your organization                    │
│ View: [ ▤ List ]·[ ▦ Board ]   Stage: [ All ▾ ]   Sort: [ Due first ▾ ]  🔍 Search (ref/title)│ ← Due-first [M-1]; own-scope FTS
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE         LEAD (received RFQ)                EST. VALUE     NEXT ACTION          UPDATED    │
│ [received]    Boiler feed pumps · RFQ-2026-000481  BDT 12,00,000  ⏺ No date         2h ago   ⋯ │ ← "No date" neutral [n-9]
│ [quoted]      Gate valves DN150 · RFQ-2026-000471  BDT 4,80,000  🔴 Overdue 02 Jul  1d ago   ⋯ │ ← non-numeric urgency pill [M-1]
│ [negotiation] MS pipe Sch-40 · RFQ-2026-000455     BDT 22,00,000 🟡 Due today        3d ago   ⋯ │
│ [won (CRM)]   Pump spares pkg · RFQ-2026-000402    BDT 1,90,000   —                  6d ago   ⋯ │ ← neutral/brand tone, "(CRM)" [NIT-1]
│ [follow_up]   Annual valve AMC · RFQ-2026-000390   BDT 9,50,000   Re-engage Q4       12d ago  ⋯ │
│ [ ‹ Newer ]                                                                  [ Older › ] (cursor)│ ← no "of N"; only rows-on-page
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

PL-1 **board view** renders six stage columns, headers carry the stage label + **non-numeric `[ view → ]`** (never a count), **each column lazy-loaded on scroll-into-view** [M-3], each its own cursor-paged read **subject to `[ESC-7G-LEAD-FILTER]`**; no client cross-column tally [MINOR-2]; a zero-row `lost` column uses the **same canonical empty token** [n-10]. Board is **not offered on mobile** (stage dropdown replaces columns; rows stack as cards). RFQ ref = navigation to the M3 surface (`rfq.get_rfq.v1`, grant-scoped); grant loss → M3 byte-identical not-found (BE-4), never "you lost access."

#### Wireframe — PL-2 Lead Detail (desktop, condensed)

```
┌─ Leads › Boiler feed pumps ────────────────────────────  Lead ref: (illustrative) [ESC-7G-LEAD-REF]┐
│ [stage: received]   Lead created 28 Jun (from your invitation)                                     │
├──────────────────────────────────────────────┬─────────────────────────────────────────────────────┤
│ RFQ CONTEXT (what you're entitled to see)     │ YOUR PIPELINE                                        │
│  RFQ-2026-000481 · Boiler feed pumps          │ Current: [received]                                  │
│  → [ Open RFQ detail ] (M3 · grant-scoped)    │ Advance to: [ quoted ▾ ]  [ Update stage ]           │
│  → [ Open your quotation ] (if submitted)     │ [ Mark won ]  [ Mark lost ]   ← first-class [M-2]     │
│  ⓘ RFQ data owned by M3; lead shows only your  │ Typical flow: received→quoted→negotiation→won|lost→  │ ← "typical" [n-11]
│    grant.                                     │  follow_up (legal targets server-derived)            │
│                                               │ Est. value: [ BDT 12,00,000 ] (currency input) [m-5] │
│                                               │ Next action at: [ 02 Jul ▾ ]                         │
├──────────────────────────────────────────────┴─────────────────────────────────────────────────────┤
│ ACTIVITY (append-only · your log · cursor)   [Called][Emailed][Met][Quoted-followup][Note] [+ Log]   │ ← quick chips [m-6]
│  • 28 Jun · Lead received from invitation (system)   • 29 Jun · Called buyer (you)                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PRIVATE NOTES (yours only — realized as `note`-typed activity until [ESC-7G-LEAD-NOTE] ruled)  [Save]│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The "Open your quotation" link, when present, routes to the vendor's own submitted quotation (sealed `human_ref` **`QTN-…`** per `Doc-4E:59`) via `rfq.get_quotation.v1` (own-scope) — never a coined prefix.

#### Numbered flows + state transitions

**Lead machine (FROZEN — `Doc-5F_Content_v1.0_Pass3.md:29`):** `received → quoted → negotiation → won | lost → follow_up` — legal transitions only; STATE→409 on illegal source (legality checked first); `expected_stage` mismatch → CONFLICT→409; **no event emitted**; the "Advance to" list is **server-derived**, never hard-coded; exact adjacency/terminality deferred to Doc-2 §3.5 / Doc-4F §F6.2 (bound by pointer).

1. **Land (read).** RSC resolves active org server-side (Inv 5); `ops.list_leads.v1` (cursor, no offset, no total) RLS-scoped → skeleton → rows / **PL-0** (canonical empty). Paging shows only rows-on-page.
2. **Open (read).** `ops.get_lead.v1`; non-owned/absent → **PL-2NF** byte-identical (BE-4); no org-switch hint.
3. **Advance stage (the only state write), incl. Mark won/lost [M-2].** `ops.update_lead_stage.v1` `{expected_stage:S, target_stage:S', value_estimate?, next_action_at?}` + required `Idempotency-Key`. Outcomes: **OK** (chip flips, optimistic); **STATE 409** ("no longer in {S}", refresh, no enrichment); **CONFLICT 409** (preserve vendor edits, show server stage + **actor** from latest entry [m-7], re-offer); **VALIDATION 400** (field_errors verbatim); **AUTHORIZATION** → collapses to not-found. **No domain event** — UI promises no downstream fan-out (audit only; mapping pending **`[ESC-OPS-AUDIT]`** [NIT-2]). On timeout: pending tone + **Retry reusing the same key** [M-3].
4. **Log activity (append-only).** `ops.add_lead_activity.v1` (`activity_jsonb`, server-captured `actor_user_id`, idempotency required) → 201, any stage; quick chips pre-fill type [m-6]; past entries immutable (Inv 8).
5. **Navigate to RFQ/quotation (cross-module READ only — DP10/Inv 7).** Routes to the M3 surface (`rfq.get_rfq.v1`, grant-scoped) or the own quotation (`rfq.get_quotation.v1`, `QTN-…`); grant absent → M3 byte-identical not-found. **No "convert lead → engagement" write here** — award is an M3 decision; lead `won` is independent private CRM.

#### Component composition (kit by name)

PL-1: **card**/table rows (stacked cards on mobile) · **status-chip** (Doc-5F token, surface-supplied label+tone; `won`/`lost` neutral/brand + "(CRM)" qualifier [NIT-1]) · non-numeric urgency pill (own date) · **currency-display** · **pagination-control** (cursor, no totals) · **dropdown-menu** (row ⋯, no Delete — Inv 8) · view toggle = `[ESC-7B-SEGMENTED]` · **empty-state** (PL-0) · **skeleton** · **error-state**. PL-2: **card** blocks · **status-chip** · stage-advance `[ESC-7B-SELECT]` (legal targets) · **button** (Update / Mark won / Mark lost) · confirm **dialog** (stage change + optimistic reconcile) · **form-field** (value/date/note) · `[ESC-7B-TEXTAREA]` composer · activity timeline (**card** + **pagination-control** + **empty-state**) · **not-found**. **`trust-badge` intentionally absent** (a lead stage is not a governance signal — R6). **No new kit component coined.**

#### Per-screen conformance table

| Screen | Read | Write | Out-of-wire | Invariants | States | Gates | Non-disclosure |
|---|---|---|---|---|---|---|---|
| **PL-1 (list/board)** | `ops.list_leads.v1` (cursor; no offset/total; own vendor-controlling-org RLS); **`stage` filter unconfirmed → `[ESC-7G-LEAD-FILTER]`** | — | `ops.create_lead_on_invitation` (System ← `VendorInvited`); matching/routing | 5,7,8,11 | rows / **PL-0 canonical empty (with first-run copy [m-4])** / loading / error | `can_manage_leads` (read) | excluded ≡ not-matched ≡ zero; **no counts/totals; no *lead-stage* win-rate** (own-submission quotation win-rate is a separate Quotation metric — `[ESC-7G-Q-06]`) [MINOR-1]; board cols non-numeric+lazy, no cross-col tally [MINOR-2]; not-found ≡ absence; no "leads you didn't get" |
| **PL-2 Lead Detail** | `ops.get_lead.v1` (bare UUIDs + own CRM fields); activity via lead read | `ops.update_lead_stage.v1` (`expected_stage`/`target_stage`/`value_estimate?`/`next_action_at?`; idempotency); `ops.add_lead_activity.v1` (`activity_jsonb`; idempotency; 201) | RFQ data (read only on M3 surface via `rfq.get_rfq.v1`); `check_permission` | 5,7,8,11 | 6 stages incl. Mark won/lost [M-2]; STATE/CONFLICT(+actor [m-7])/VALIDATION; not-found; activity empty | `can_manage_leads`; §6B delegation eligible | non-owned → NOT_FOUND collapse; no routing/competitor/rank/deferral leak; `won/lost` = own CRM, **not** award/score (R6); no other vendor's data |
| **Nav → RFQ / quotation** | `rfq.get_rfq.v1` (grant-scoped); `rfq.get_quotation.v1` (own, `QTN-…`) | — (no cross-module write — DP10) | award (M3 `closed_won`/`RFQClosedWon`); engagement creation (out-of-wire) | 7,11 | grant → RFQ detail; no grant → not-found | invitee grant | grant loss → byte-identical not-found; no "you were excluded" anywhere |

---

### 13.3 Engagements / Post-Award (M4 vendor-leg) — fills §10.3 (engagements)

Vendor-leg post-award surfaces under `(app)/engagements` (M4, BC-OPS-2 + BC-OPS-4). Engagements are created **out-of-wire** by `ops.create_engagement_on_award.v1` (System ← `RFQClosedWon`) — **no engagement screen ever creates one** (DP10/Inv 7); award→engagement is **navigation, never a cross-module write**. The platform **never holds, transfers, or settles funds** — the only payment affordances are **Record** and **Confirm** of off-platform payment *records*.

**Validate-Findings adjudications applied here (conformance review — 2 MAJOR / 4 MINOR, gating):**
- **MAJOR-C1 — VALID & IMPLEMENTED.** Confirmed on disk: `ops.get_engagement.v1` projects `{engagement_id, human_ref, status, buyer_organization_id, vendor_profile_id, vendor_controlling_org_id, award_value_snapshot, currency}` and **does not return `rfq_id`** or any RFQ/quotation human-ref (`Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md:462`). The E2 wireframe **no longer renders `RFQ-2026-000341`/`QTN-…` as wired fields**; the awarded-RFQ linkage is marked **`[ESC-7G-ENG-01: pending projection]`** and `[ESC-7G-ENG-01]` is rewritten (§13.4) to state the reference is **absent from the read projection** (confirm additive extension to project the existing Doc-2 §10.5 `rfq_id` column, or show no RFQ linkage).
- **MAJOR-C2 — VALID & IMPLEMENTED.** `ops.list_generated_documents.v1` (BC-OPS-4 — rendered *artifacts*) is **removed from E3's live Read column**; it may only retrieve a rendered artifact for a document the vendor already has an id for. E3's per-kind document-set enumeration is **explicitly blocked behind `[ESC-7G-ENG-03]`** (no `list_engagement_documents` contract exists); the populated E3 wireframe is shown **escalation-gated**, not buildable.
- **MINOR-C3 — VALID & IMPLEMENTED.** `ops.list_engagements.v1` projects only `{engagement_id, human_ref, status}` — E1 rows now show **only `human_ref` + status-chip**; award value and buyer name move to E2 detail (value from `get_engagement`; buyer name subject to `[ESC-7G-ENG-02]`).
- **MINOR-C4 / m-5 (MINOR) — VALID & IMPLEMENTED.** The user-facing `role` filter is **dropped on the pure-vendor mount** (server pins `role=vendor`); if a Hybrid mount needs both legs it is surfaced only there (own-party-only either way) — tied to `[ESC-7G-A7]` Hybrid-mount.
- **MINOR-C5 — VALID & IMPLEMENTED.** `expected_engagement_status` is annotated as the **engagement's current server-read status (any non-`closed` state)** — a concurrency echo, never a hardcoded literal — across the challan/PO/invoice/payment sheets.
- **MINOR-C6 — VALID & IMPLEMENTED.** Flow F-C1 step 1 references the M3 outcome **by pointer** (companion §6.5 F) without asserting a specific screen-id/state-token; the load-bearing DP10 assertion (navigation `<Link>`, never a cross-module write) is kept verbatim.
- **NIT-C7..C9 — ACCEPTED.** Revoke-share reworded "confirm intentional visibility change" (not destructive); money-boundary banner extended to the Trade Invoice tab; E4 Revise note states it opens the E5 sheet with a **mandatory `revision_reason`**.
- **OBS-C10..C12 — NOTED.** Byte-equivalence/money-boundary handling verified exemplary; `[ESC-7G-ENG-04]` (IR-02/IR-03 emit cardinality) and `[ESC-OPS-SLUG]` correctly carried.

**Quality-review adjudications applied here:**
- **M-1 (MAJOR) — VALID & IMPLEMENTED.** Read-only **reconciliation summary** ("Invoiced · Recorded · Confirmed · Outstanding") composed client-side from already-wired document reads, explicitly labelled **"derived, off-platform records"** — a display composition, not a count contract; no Invariant 11 implication.
- **M-2 (MAJOR) — VALID & IMPLEMENTED.** `record_delivery` (challan) gets a dedicated **mobile/field** treatment: single-column stacked fields, large targets, **"Connection lost — your delivery record is saved and will submit when you reconnect"** keyed to the mandatory idempotency key; photo/file upload resumes on reconnect.
- **M-3 (MAJOR) — VALID & IMPLEMENTED.** `ASYNC_PENDING` made explicit: the **document record is usable the instant issue succeeds** ("Document issued (v1) · rendered PDF generating…"); bounded-wait + **"Check again"**; a DEPENDENCY/timeout copy ("you can leave; the PDF will appear here") — the rendered artifact never gates the record's operational fact.
- **m-1 (MINOR) — VALID & IMPLEMENTED.** First-open engagement helper ("Issue documents as your delivery progresses. Nothing here moves money — these are your records.") + per-empty-tab microcopy.
- **m-2 (MINOR) — VALID & IMPLEMENTED.** The `in_delivery → completed` edge gets a confirmation ("This marks the engagement complete. It cannot be reopened.") — a one-way, Trust-input transition deserves the dialog more than revoke does.
- **m-3 (MINOR) — VALID & IMPLEMENTED.** Trade-invoice `due_date` + a derived **overdue** visual surfaced on the invoice card (own party data; no firewall concern).
- **m-4 (MINOR) — VALID & IMPLEMENTED.** E1 references the companion's `[ESC-7B-SEARCH]` for own-scope human-ref lookup; any sort stays within the §F5.8 allowlisted filter fields (no client total/ranking).
- **n-1..n-4 — ACCEPTED/NOTED.** Payment-record human-ref **not coined** (`PAY-…` dropped; BC-OPS-2 §H.2 enumerates only `DOC-…`/`INV-…` — whether payment records have a human-ref deferred to `[ESC-7G-ENG-01]`'s projection question); "Buyer" used on the vendor screen (reserve "counterparty" for the share-grant control); Bangla parity hook = `[ESC-7B-I18N-HEADLINE]`; E3 should prefer the single-call enumeration path the Board rules under `[ESC-7G-ENG-03]` to keep field load light.

#### Screen inventory

| ID | Route | Purpose | Primary contract(s) |
|---|---|---|---|
| **E1** | `(app)/engagements` | Engagement index — own-party only; rows show **`human_ref` + status-chip only** [MINOR-C3]; status filter (role pinned `vendor` [MINOR-C4]); `[ESC-7B-SEARCH]` own-ref lookup [m-4]; cursor, no total. | `ops.list_engagements.v1` |
| **E2** | `(app)/engagements/[engagementId]` | Overview — value (from `get_engagement`), buyer context, status, lifecycle actions, document set tabs. Awarded-RFQ ref **pending** `[ESC-7G-ENG-01]`. | `ops.get_engagement.v1` |
| **E3** | E2 → Documents tab | Post-award document set by kind (LOI/PO/challan/trade-invoice/payment/WCC) + reconciliation summary [M-1]. **Enumeration escalation-gated** `[ESC-7G-ENG-03]` [MAJOR-C2]. | `ops.get_engagement_document.v1` (single); enumeration pending |
| **E4** | `(app)/engagements/[engagementId]/documents/[documentId]` | Document detail — active revision + immutable superseded chain, rendered artifact `file-link`, share-grant. | `ops.get_engagement_document.v1`, `ops.get_generated_document.v1`, grant/revoke |
| **E5** | sheet over E2/E3 | Issue / revise / record sheets (challan · LOI/PO/WCC · trade-invoice · payment record+confirm). | §F5.3–§F5.6 write slugs |

#### Wireframes (key surfaces)

**E1 — index (desktop), corrected to the frozen list projection [MINOR-C3]:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Acme Steel Works ▾ (server-resolved active org — Inv 5)               [user] │
│ Engagements · post-award relationships awarded to your organization          │
│ [ Status: All ▾ ]   🔍 Find by ref (ENG-…) [ESC-7B-SEARCH]   (role pinned vendor)│ ← role dropped [MINOR-C4]
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ ENG-2026-000571    ● in_delivery                          [ View → ]  │   │ ← human_ref + status only [MINOR-C3]
│ │ ENG-2026-000540    ● completed                            [ View → ]  │   │   (value/buyer live on E2)
│ │ ENG-2026-000512    ● closed                               [ View → ]  │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                              [ ‹ Newer ]  [ Older › ] (cursor)│ ← no "Page X of Y"
└────────────────────────────────────────────────────────────────────────────┘
Canonical empty (byte-identical across zero/excluded/empty):
  "No engagements yet. Engagements appear here after a buyer awards one of your
   quotations."   [ View open RFQs → ] (advisory, generic)
```

**E2/E3 — overview + Documents tab (desktop):**
```
┌─ Engagements › ENG-2026-000571 ──────────────────────  [ESC-7B-BREADCRUMB] ─┐
│ ENG-2026-000571              ● in_delivery   ← status-chip (Doc-4M token)     │
│ ┌─ Overview ───────────────────────────────────────────────────────────┐   │
│ │ Awarded from RFQ: [ESC-7G-ENG-01: pending projection]                 │   │ ← NOT a wired field [MAJOR-C1]
│ │ Buyer:        Padma Textiles Ltd   ([ESC-7G-ENG-02] name resolution)   │   │
│ │ Award value:  BDT 4,820,000  (from get_engagement)  ← currency-display │   │
│ │ Lifecycle:    [ Mark delivered → completed ]  ⚠ one-way, cannot reopen │   │ ← confirm dialog [m-2]
│ └───────────────────────────────────────────────────────────────────────┘   │
│ ┌─ Documents (per-kind enumeration ESC-GATED [ESC-7G-ENG-03]) ──────────┐   │
│ │ [LOI][PO][Challan][Trade Invoice][Payment][WCC]                        │   │
│ │ Reconciliation (derived, off-platform records) [M-1]:                  │   │
│ │   Invoiced 4,820,000 · Recorded 2,000,000 · Confirmed 0 · Outstanding 2,820,000│
│ │ Trade Invoice  INV-2026-000233  ● partially_paid  due 10 Jul 🔴overdue │   │ ← due_date + overdue [m-3]
│ │ Payment  ● recorded  BDT 2,000,000  "bank transfer ref 88x" [ Open → ] │   │ ← no PAY- ref coined [n-1]
│ │ ⓘ Payment & invoice records document off-platform payments. iVendorz   │   │ ← money banner on BOTH tabs [NIT-C8]
│ │   never holds, transfers, or settles funds. No Pay/Settle/Escrow/Wallet.│   │
│ └───────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**E4 — version chain** renders the active revision + immutable superseded chain via `[ESC-7B-VERSION-LIST]` (Inv 8 — nothing overwritten/deleted), rendered artifact via **file-link** (`storage_ref`, file_ref-only), **Share with buyer** = `grant`/`revoke` (the only sharing channel; "confirm intentional visibility change" [NIT-C7]); **[ Revise ]** opens the E5 sheet with a **mandatory `revision_reason`** [NIT-C9].

**E5 — Issue PO sheet** annotates `expected_engagement_status = engagement's current server-read status (any non-closed)` [MINOR-C5], idempotency key one-per-submission; **record_delivery** has a dedicated mobile/field variant [M-2].

#### Numbered flows + state transitions

**Engagement machine (FROZEN):** `open → in_delivery → completed → closed`; only the **single next legal edge** is shown; `closed` reached only via `ops.close_engagement.v1` on `completed → closed`; `open→closed`/`in_delivery→closed` not offered; `closed` terminal.

**Flow F-C1 — Award → engagement → document.** (1) The M3 quote-outcome surface (companion §6.5 F) navigates (`<Link>`) into `(app)/engagements/[engagementId]` — **never a cross-module write** [MINOR-C6]; the engagement was System-created out-of-wire. (2) E2 via `ops.get_engagement.v1`; non-party → NOT_FOUND byte-identical (Inv 11). (3) Lifecycle progression shows only the next legal edge; `in_delivery → completed` carries the irreversibility confirm [m-2]. (4) E5 authoring asserts the current `expected_engagement_status` [MINOR-C5] + required idempotency key. (5) Issue **enqueues** the BC-OPS-4 async render — the **record is usable immediately**; UI shows "issued (v1) · PDF generating…", polls `ops.get_generated_document.v1`, bounded-wait + "Check again" [M-3]; the screen **never calls `generate_document`**.

**Flow F-C2 — Version / supersede (Inv 8).** E4 shows active + immutable chain; `ops.revise_engagement_document.v1` creates `version_no+1` (mandatory `revision_reason` → VALIDATION if absent); optimistic concurrency → CONFLICT ("changed; reload and retry"); no hard delete/overwrite (server BUSINESS, never offered).

**Flow F-C3 — Trade invoice (records-only).** `issue_trade_invoice` → `issued`; `update_trade_invoice_status` along `issued → partially_paid → paid | disputed | cancelled` (`expected_status`); `→ disputed` emits `DisputeRecorded` (a Trust performance input — Operations emits, never scores); `paid` means parties recorded off-platform payment, **not** settlement. `due_date`/overdue surfaced [m-3].

**Flow F-C4 — Payment record + confirm (records-only).** `record_payment` → `recorded` (`can_record_payments`); `confirm_payment` → `confirmed` (additionally `can_approve_payment`; affordance hidden/disabled with tooltip if absent). Persistent money-boundary banner on the Payment **and** Trade Invoice tabs [NIT-C8]; reconciliation summary client-derived [M-1].

**Flow F-C5 — Share generated document (grant channel).** `grant_generated_document` / `revoke_generated_document_grant` to the **engagement counterparty only** (fixed by the engagement; no free-text picker); grant is the only sharing channel — never a copy/tenancy change.

#### Component composition (kit by name)

E1: **card**/rows · **status-chip** · **pagination-control** (cursor) · `[ESC-7B-SEARCH]` · **empty-state**/**error-state**/**not-found**; filters `dropdown-menu` (desktop) / `sheet` (mobile). E2: **card**+**separator** · **status-chip** · **currency-display** · `[ESC-7B-BREADCRUMB]` · confirm **dialog** (completion). E3: **tabs** (per `doc_kind`) · **card** · **status-chip** · **file-link** · reconciliation line (text composition, **no `stat-tile`/count** — Inv 11). E4: **card** · `[ESC-7B-VERSION-LIST]` · **file-link** · **dialog** (visibility change). E5: **sheet** · **form-field** · `[ESC-7B-SELECT]`/`[ESC-7B-TEXTAREA]` · **button**. Money-boundary banner = **card** + text (no new component). All `[ESC-7B-*]` reuse companion §9.2 — **no kit primitive duplicated; no `stat-tile` on any engagement surface.**

#### Per-screen conformance table

| Screen | Read | Write | Out-of-wire | Invariants | States | Gates | Non-disclosure |
|---|---|---|---|---|---|---|---|
| **E1 index** | `ops.list_engagements.v1` (cursor; allowlisted filter; **projects `{engagement_id, human_ref, status}` only** [MINOR-C3]; role pinned vendor [MINOR-C4]) | — | `ops.create_engagement_on_award.v1` (System); any count/total; M3/Billing | 5,7,8,11 | skeleton · populated · canonical-empty · error | `can_manage_engagements` (`[ESC-OPS-SLUG]` carried) | own-party only; one canonical empty; short pages never imply excluded universe; no count |
| **E2 overview** | `ops.get_engagement.v1` (**no `rfq_id`** [MAJOR-C1]; awarded-RFQ ref pending `[ESC-7G-ENG-01]`; buyer name `[ESC-7G-ENG-02]`) | `ops.update_engagement_status.v1`, `ops.close_engagement.v1` | `record_buyer_feedback` (buyer-side); M3 award; Billing | 5,7,8,11 | loaded · not-found (≡absence) · CONFLICT (`expected_status`) · STATE (illegal edge never shown); completion confirm [m-2] | `can_manage_engagements` | non-party → NOT_FOUND; only party context Doc-4F shares; nothing about other vendors/buyer's private evaluation |
| **E3 document set** | `ops.get_engagement_document.v1` (single); **per-kind enumeration ESC-GATED `[ESC-7G-ENG-03]`** [MAJOR-C2]; `list_generated_documents` = artifact retrieval only, **not** the record set | (via E5) `record_delivery`, `issue_engagement_document`, `issue_trade_invoice`, `record_payment` | `generate_document` (System async — enqueued, polled); any Pay/Settle/Escrow/Wallet | 7,8,10,11 | per-kind empty (canonical) · populated · ASYNC_PENDING ("issued · PDF generating", Check again [M-3]) · error | `can_create_documents`; `can_approve_po` (PO); `can_record_payments` (invoice/payment) | docs shared by parties only; storage_ref via file-link (no blob); reconciliation = derived own-party records, no count contract [M-1]; **no money affordance** |
| **E4 document detail** | `ops.get_engagement_document.v1`, `ops.get_generated_document.v1` | `revise_engagement_document` (mandatory `revision_reason`); `grant`/`revoke_generated_document_grant` | hard delete (never exists); overwrite (server BUSINESS); share beyond counterparty | 8,11 | loaded · CONFLICT (stale revise) · ASYNC_PENDING · not-found · VALIDATION | `can_create_documents` (+`can_approve_po` for PO revise) | generated doc visible to owning org + granted counterparty only; revoke removes visibility; non-owned/non-granted → NOT_FOUND |
| **E5 sheets** | (parent E2/E3) `ops.get_engagement.v1` | `record_delivery` · `issue/revise_engagement_document` · `issue_trade_invoice` · `update_trade_invoice_status` · `record_payment` · `confirm_payment` | `generate_document`; any settlement/escrow/wallet/pay | 5,7,8,10,11 | idle · submitting · success · VALIDATION (`field_errors`/`revision_reason`) · CONFLICT (`expected_*_status` = current server-read [MINOR-C5]) · STATE (terminal `closed`) · AUTHORIZATION (missing slug → hidden) | per-write slug; idempotency required (one-per-submission, reused on retry; field-resilient [M-2]) | party-scope writes; non-party → NOT_FOUND; error-state reveals no protected enrichment |

---

### 13.4 Addendum escalations

New escalations raised by this addendum (Flag-and-Halt; **not resolved locally**). These update the companion's **§10.1 raise-record** and **§12 disposition log** as additive items. **The gate tally (§12.2) is unchanged** — the one cross-corpus conflict (`[ESC-7G-Q-DRAFT]`) is routed to the API Governance Board as a **contract-gap** with a conformant graceful degrade (client-local autosave), so it raises **no new BLOCKER**; all others are MAJOR-or-below contract-confirmations or carried items.

| ID | Sev | Origin (finding) | Summary | Disposition / routing |
|---|---|---|---|---|
| **[ESC-7G-Q-DRAFT]** | MAJOR | B-2 (S4) | No frozen draft-write/draft-read contract exists; the quotation is created by `submit_quotation` itself (`Doc-4E_PassB_Part4_v1.0_FROZEN.md:70,98`). This **conflicts** with the companion's prior `[ESC-7G-A6]`/§11-step-6 "server-persisted autosave" assumption. | API Governance Board (M3). Confirm whether server-side draft persistence is in scope (additive contract) or drafts are client-local. **Until ruled, default = client-local autosave** ("Saved on this device"); draft-resume (M-Q2) is device-scoped; REFERENCE/CONFLICT field-preservation (Flow B 9b / Flow C) is a **client-local device-memory promise**, not a contract guarantee [OBS]. Supersedes the companion's `[ESC-7G-A6]` "resolved" status — reopened as a contract question. |
| **[ESC-7G-ENG-01]** | MAJOR | MAJOR-C1 (E2) | **Corrected:** `ops.get_engagement.v1` projects neither `rfq_id` nor any RFQ/quotation human-ref — only the eight frozen fields (`:462`). The awarded-RFQ reference is **absent from the read projection**. | API Governance Board (M4). Confirm whether §F5.8 is additively extended to project the existing Doc-2 §10.5 `rfq_id` column, or E2 shows no RFQ linkage. Until then E2 shows `[pending projection]`, not a live ref. (Subsumes the payment-record human-ref question, n-1.) |
| **[ESC-7G-ENG-02]** | MINOR | (E2 buyer name) | `get_engagement` returns `buyer_organization_id` (UUID) only; no buyer display name. Showing "Padma Textiles Ltd" needs an M1 name resolution by pointer. | API Governance Board (M1/M4). Confirm a wired counterparty-org display-name read within engagement scope, else show a neutral label. Non-disclosure-safe (buyer is a known party). |
| **[ESC-7G-ENG-03]** | MAJOR | MAJOR-C2 (E3) | No `list_engagement_documents` contract enumerates an engagement's LOI/PO/challan/invoice/payment/WCC children; `list_generated_documents` (BC-OPS-4) enumerates **rendered artifacts**, not the BC-OPS-2 record set. | API Governance Board (M4). Confirm whether `get_engagement` is additively extended to return child document refs, or a `list_engagement_documents` contract is added. **E3 per-kind enumeration is build-blocked until ruled.** Prefer the single-call path to keep field load light (n-4). |
| **[ESC-7G-ENG-04]** | OBS | OBS-C12 (carried) | IR-02 (`DeliveryRecorded` cardinality on versioned challans) / IR-03 (`WorkCompletionIssued` cardinality on versioned WCC) open in Doc-2 §8. | Carried by pointer, unchanged; UI assumes one event per record/issue — revisit feedback copy if cardinality changes. |
| **[ESC-7G-LEAD-FILTER]** | MINOR | MINOR-2 (PL-1 board) | `ops.list_leads.v1` `stage` filter input is not confirmed in the frozen signature. | API Governance Board (M4). Confirm a `stage` filter on `list_leads`; until then the board falls back to the single list view filtered client-side **with no cross-column tally**. |
| **[ESC-7G-LEAD-NOTE]** | MINOR | (PL-2 notes) | `add_private_vendor_note` is BC-OPS-1 buyer-side (`Doc-5F …:151`); no vendor-owned private-note-on-lead slug confirmed. | API Governance Board (M4). Confirm a vendor-leg lead-note contract, or accept the fallback: realize private notes as **`note`-typed `ops.add_lead_activity.v1`** entries (frozen, vendor-owned). **Do not invent `add_lead_note`.** Until ruled, fallback applies. |
| **[ESC-7G-LEAD-REF]** | MINOR | NIT-3 / n-12 (PL-2) | No `LD-…` lead human-ref format confirmed in Doc-5F/Doc-2; the wireframe token is illustrative only. | API Governance Board (M4). Bind the actual lead human-ref scheme by pointer, or render no lead human-ref. **Coin no prefix.** |
| **[ESC-7G-LEAD-MACHINE]** | OBS | (Doc-4M vs Doc-5F) | Doc-4M matrix "Vendor Lead" label (`new→contacted→qualified→converted\|disqualified`, `:245-248`) vs the Doc-5F vendor-side realization (`received→quoted→negotiation→won\|lost→follow_up`, `:29`). This addendum binds **Doc-5F** per its per-module authority + Doc-4M's "Reference Source wins / do not infer a lifecycle from a §3 enum" disclaimer (`:140,:142`). | Reconcile the Doc-4M matrix label with Doc-5F §6.2 at the corpus's convenience; **does not gate this design** (status-chip tokens here are Doc-5F/Doc-4F values only). |

**Removed escalation:** **`[ESC-7G-Q-IDEMP]` is deleted** (M-3) — idempotency carriage for `rfq.submit_quotation.v1` is already CONFIRMED_BOUND via `ESC-7G-Q-03` (`:662`) + `ESC-7A-CONF-01` (`:673`), dedup window owned by `[ESC-RFQ-POLICY]` (`Doc-4E_PassB_Part4_v1.0_FROZEN.md:98`).

**Rejected/no-change dispositions (Validate-Findings gate):**
- **OBS (Flow B 9b / Flow C "preserves entered fields")** — VALID, no fix to the affordance required; the field-preservation is internally consistent (client-local device memory). Implemented as a **one-line clarifying note** here and in `[ESC-7G-Q-DRAFT]` that preservation is a device-local promise, not a contract behavior, until the draft contract is ruled. No wireframe/flow change beyond the clarifying parenthetical.

**Items consumed by pointer (raised elsewhere; not re-raised):** `[ESC-7G-Q-01]` (CLOSED → `rfq.get_rfq.v1`, `:660`), `[ESC-7G-ENT-01]` (`:663`), `[ESC-7-API]` #1 (non-numeric pipeline counts, `:679`), `[ESC-OPS-AUDIT]`, `[ESC-OPS-SLUG]`, `[ESC-7G-A7]` (Hybrid mount, BLOCKER — human Board), `[ESC-RFQ-POLICY]`, and the companion §11.3 kit register (`[ESC-7B-SELECT/TEXTAREA/SWITCH/SEGMENTED/WINDOW-CHIP/VERSION-LIST/BREADCRUMB/SEARCH/I18N-HEADLINE]`).

#### Addendum gate self-attestation

This addendum coins no module, contract, ownership boundary, invariant, kit primitive, slug, audit action, or human-ref. Every valid BLOCKER/MAJOR/MINOR across all three areas' conformance and quality reviews is implemented above (B-1, B-2→ESC, M-1, M-2, M-3, m-1, m-2, m-3, m-4, M-Q1/Q3/Q4, N-Q1/Q2/Q3 for S4; MINOR-1, MINOR-2→ESC, M-1/M-2/M-3, m-4..m-8 for Leads; MAJOR-C1, MAJOR-C2→ESC, MINOR-C3..C6, M-1/M-2/M-3, m-1..m-5 for Engagements); the two new MINOR conformance findings — **wrong `QUO-…` prefix corrected to the frozen `QTN-…`** (`Doc-4E:59`) and the **`submit_quotation` `invitation_id`/`rfq_id` required-input completeness note** (`:50–51,71`, [m-4]) — are implemented; the OBS (client-local field-preservation phrasing) carries a one-line disposition above. Rejected/redundant findings carry one-line dispositions (notably the deleted `[ESC-7G-Q-IDEMP]`). The byte-equivalence attestation (Invariant 11 / CHK-7-040), the money boundary (no pay/settle/escrow/wallet anywhere; Record/Confirm of off-platform records only), Invariant 8 immutability (visible superseded chains, no hard delete), and DP10/Invariant 7 (award→engagement is navigation, one module per action) hold across all nine screens. The companion's **§12.2 gate verdict (BLOCKER=3 human-Board, MAJOR conformance=0, gate WITHHELD) is unchanged** by this addendum: the §10.3 gap is now filled, the MAJOR-10 S4 enrichment discharged, and the nine new `[ESC-…]` items above are routed to the API Governance Board / corpus reconciliation (eight) and carried (one OBS) — none raises a new BLOCKER.

---

**Files (absolute):** Append target — `e:\Projects\iVendorz\vendor_planning_and_design.md` (after §12; fills §10.3, discharges the §6.7 S4 row / MAJOR-10). Frozen anchors verified on disk: `e:\Projects\iVendorz\generatedDocs\Doc-4E_PassB_Part4_v1.0_FROZEN.md` (submit/revise quotation request schema lines 50–51/55/57, response `QTN-…` line 59, error registers/Validation Matrix lines 70–74/78/92–93/98), `e:\Projects\iVendorz\generatedDocs\Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md` (engagement reads/writes, §F5.8 projection line 462; §F5.2–§F5.6), `e:\Projects\iVendorz\generatedDocs\Doc-5F_Content_v1.0_Pass3.md` (lead machine/disclosure/idempotency, lines 29–42), and `e:\Projects\iVendorz\vendor_planning_and_design.md` (§10.3 gap; §12 dispositions). No code written; no frozen document edited.

---

### Self-attestation
This companion adds no module, contract, ownership boundary, or invariant. It binds frozen entities by pointer (Doc-7A R1–R12, Doc-7B kit, Doc-7C shell, **Doc-7G §11.1/CHK-7-005 embedded-component mandate + GR11/§10/CHK-7-040 byte-equivalence + GR12 "coins nothing"**, Doc-4M states, Doc-5D/5E/5F/5G vendor-leg, Doc-4C/4D/4G/4I ownership, the 12 invariants). It enforces Content≠Presentation structurally, the firewalled four-bands read-only (own-profile Public-Badge projection, with frozen-suppressed and Not-Rated states surfaced), Financial Tier ≠ Plan, the capability matrix, two-dimension role separation, the notification byte-equivalence guard (BE-7), and the byte-equivalence attestation across every nav badge, count, empty state, error, and not-found. Three BLOCKERs and the gating MAJOR contract questions are **raised, not resolved locally** (Flag-and-Halt); every other valid BLOCKER/MAJOR/MINOR finding is implemented; rejected findings carry one-line dispositions (§10.2).

**Verification note:** the load-bearing adjudications in this synthesis were confirmed against the frozen corpus on disk — CHK-7-040 as the Doc-7G frontend byte-equivalence carrier (`Doc-7G_SERIES_FROZEN_v1.0.md:35`); **GR12 = "nothing coined / never invokes the engine" and the four embedded components gated by §11.1/CHK-7-005** (`Doc-7G_Content_v1.0_Pass2.md:7,82,97,108`); the Doc-4M Invitation set incl. `delivered` and the Quotation machine `submitted→shortlisted→{selected|not_selected}` with no `revised` state (`Doc-4M_FROZEN_v1.0.md:120,228–233`); the Doc-5G **Public-Badge** "band + display score" / frozen-suppressed / Not-Rated read semantics and disclosure scope (`Doc-5G_Content_v1.0_Pass2.md:43,67–68`); and the live `trust-badge.score` prop (`src/frontend/embedded/trust-badge.tsx:18,55–59`).