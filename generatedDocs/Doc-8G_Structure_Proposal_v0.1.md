# Doc-8G — Frontend & E2E Conformance Suite — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-8G artifact; the **final Doc-8 deliverable**. Next: Independent Hard Review (Board) → Structure Patch → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-8G artifact) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8G is the **Frontend & E2E conformance suite** — proves the realized UI conforms to the **frozen Doc-7 surfaces** + the frozen Doc-5 surface (e2e). Consumes the frozen **Doc-8B harness** (Playwright + `@axe-core/playwright` + Playwright snapshots — D1) by pointer. **Closes the Doc-8 program** (7 of 7) |
| Document | **Doc-8G** — realizes `Doc-8A §9` + Appendix A **Band G** (`CHK-8-060…065`) as the executable frontend/e2e conformance suite |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §9` + Band G. **Oracle (the *what*):** the **frozen Doc-7 surfaces** (`Doc-7B` Design System · `Doc-7C` App Shell · `Doc-7D` Public · `Doc-7E` Account/Identity · `Doc-7F` Buyer · `Doc-7G` Vendor · `Doc-7H` Admin — **all FROZEN**) + `Doc-7 R5` (Content≠Presentation) / `R8` (non-disclosure) / `R9` (optimistic-UI) / `R11` (a11y/currency) · `Doc-2 §0.4` (currency) · Invariant #9/#11 · the **frozen Doc-5 surface** (e2e journeys). Consumes `Doc-8B` (Playwright/axe/snapshots) by pointer |
| Authority | `Doc-8A` governs; the **frozen Doc-7 surfaces** + Doc-2 + the frozen Doc-5 surface are the oracle. Doc-8G **coins nothing** — a red test = code defect, or `[ESC-8-CORPUS]`/`[ESC-8-API]` (never weaken) |
| Contains | Structure only — the ratified decisions (G1 surface-inventory-driven; G2 compose-at-UI; G3 execution-readiness), the suite section map §0–§7, carried items. **No test code, no per-surface cases** — those land in the content passes |
| Audience | Architecture Board · UX/Design lead · QA/Test lead · Doc-8G content authors |
| Program note | Doc-8G introduces **no surface, component, route, or expected value**. It asserts the frozen Doc-7 surfaces. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at `Doc-7x`) — never coin a screen/component. |

> **Governing rule:** Doc-8G realizes, never re-decides. The Doc-7 surfaces + Doc-4M (lifecycle UI) + the Doc-5 surface (e2e) are FROZEN; Doc-8G realizes *how the UI is proven conformant*. Every assertion is oracle-by-pointer; no assertion stricter or looser than the frozen Doc-7 surface (Doc-8A §3.3).

---

## Decisions proposed for ratification at structure freeze

- **G1 — Surface-inventory-driven (table-driven over the frozen Doc-7 surfaces — the Doc-8C/8D/8F precedent).** A **surface inventory** is **derived from the frozen `Doc-7B…7H`** — every surface/route-group, its views/screens, the kit components each composes, the lifecycle UIs (Doc-4M-driven), and the e2e journeys it supports (over the frozen Doc-5 surface). Each Band-G check runs over every inventory row. The **completeness check asserts inventory ≡ the frozen Doc-7 surfaces** (every frozen surface/screen covered; **none coined**). Coverage provable against the frozen FE oracle.
- **G2 — Define the UI-specific checks; compose the cross-suite criteria at the UI layer.** Doc-8G **defines**: component conformance (`CHK-8-060`, kit + Content≠Presentation), a11y (`CHK-8-061`), visual-regression (`CHK-8-062`), currency-display (`CHK-8-064`). It **composes** (invokes, never re-defines): **8C** for e2e (`CHK-8-063` journeys invoke only **frozen Doc-5 contracts**), **8E** for `CHK-8-042` (optimistic-UI converges to server-authoritative — 8E defines, 8G executes) + Invariant #9 Content≠Presentation, and **8D's `CHK-8-024`** byte-equivalence criterion for **UI non-disclosure** (`CHK-8-065` — excluded ≡ non-matched at the UI; the Doc-8D §5.4 "8G: UI byte-equivalent" facet, buyer-private/`Doc-6F` source). 8G is the **load-bearing UI non-disclosure attestation** (Doc-7 R8 — the Vendor workspace byte-equivalence).
- **G3 — Execution-readiness: the Doc-7 + Doc-5 oracle is FROZEN now; the UI code is deferred.** The oracle — the frozen Doc-7 surfaces + Doc-5 contracts + Doc-2 §0.4 currency — is **COMPLETE/FROZEN**, so Doc-8G is **authored fully now** (design + coverage, no deferred surfaces). Execution needs the **realized UI code** (NOT STARTED) running under Playwright against a built app → **execution-deferred** (the whole suite, like 8C/8F). Authored-not-run; the **frontend oracle being complete** means Doc-8G has **no oracle-gap** (unlike 8D's #11/Doc-6F or 8F's emitters) — every Band-G check has its full oracle now.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8G's place (below Doc-8A; consumes Doc-8B Playwright/axe/snapshots; composes 8C e2e + 8E convergence/#9 + 8D #11-UI); realize-never-redecide; oracle = the frozen Doc-7 surfaces + Doc-2 §0.4 + the frozen Doc-5 surface; freeze obligation — pass Appendix A **Band G** (+ Band A); never weaken (`[ESC-8-CORPUS]`). **Closes the Doc-8 program.**
- **Dependencies:** `Doc-8A §0/§9/Appendix A`; `Doc-8B` (Playwright/axe); `Doc-7B…7H`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Surface Inventory
- **Purpose:** the **surface inventory** (G1) — every frozen `Doc-7B…7H` surface/route-group with: views/screens, composed kit components (`Doc-7B`), lifecycle UIs (Doc-4M), e2e journeys (over frozen Doc-5), the actor/active-org context (Doc-7C — none for `Doc-7H` Admin). Derived from the frozen Doc-7 surfaces (reference-never-restate); the completeness check asserts inventory ≡ the frozen Doc-7 surfaces (none coined).
- **Dependencies:** `Doc-7B…7H`; `Doc-7A` (surface partition). **Detail:** inventory schema + source-of-truth anchor.

## §2 — Component Conformance *(`CHK-8-060`)*
- **Purpose:** assert components render the **shared kit** (`Doc-7B`) — a surface composes the kit's components, never a re-implemented primitive; the **presentation-component boundary** holds (Content ≠ Presentation, Invariant #9 / Doc-7 R5 — a component owns **no authoritative state**; presentation never mutates/caches-as-authoritative content). **Composes 8E's Invariant-#9** criterion at the UI layer (8E defines #9; 8G asserts it in components). The microsite case (M2 content rendered read-only by Public 7D / managed by Vendor 7G — one owner, two surfaces — Doc-7 R5) asserted.
- **Dependencies:** `Doc-7B` (kit); `Doc-7 R5`; Invariant #9; `Doc-8E` (#9 criterion). **Detail:** component + Content≠Presentation assertion.

## §3 — Accessibility Baseline *(`CHK-8-061`)*
- **Purpose:** assert the **WCAG-AA + keyboard/focus** baseline every surface inherits (`Doc-7 R11`): focus order, keyboard operability, semantic roles/ARIA, contrast — via `@axe-core/playwright` (Doc-8B D1). An a11y regression is a code defect. Applies to every surface inventory row.
- **Dependencies:** `Doc-7 R11`; `Doc-8B` (axe). **Detail:** a11y assertion convention.

## §4 — Visual-Regression *(`CHK-8-062`)*
- **Purpose:** assert presentation stability via **Playwright snapshots** (Doc-8B D1) of the rendered surfaces; a visual diff is **surfaced for review, never auto-accepted** (presentation is disposable over module-owned content — Doc-7 R5). Per surface/key-view.
- **Dependencies:** `Doc-7 R5`; `Doc-8B` (snapshots). **Detail:** visual-regression convention.

## §5 — E2E User-Journey & Currency Conformance *(`CHK-8-063` + `CHK-8-064`)*
- **Purpose:** assert **end-to-end journeys** over the **frozen Doc-5 surface only** (no endpoint invented — **composes Doc-8C**'s contract conformance; the journey invokes only frozen Doc-5x contracts): discovery → RFQ → routing/invitation → quotation comparison → award → post-award (Buyer 7F); invitation → quotation → microsite (Vendor 7G); account/billing (7E); admin console (7H); public discovery (7D). And **currency** (`CHK-8-064`): **per-value-field currency display, default BDT, never assumed** (`Doc-2 §0.4` / Doc-7 R11) — a value rendered without/with-assumed currency is a defect. Active-org context (Doc-7C) carried per journey; lifecycle steps render Doc-4M-permitted transitions (state-machine UI — 8E-composed).
- **Dependencies:** the frozen Doc-5 surface; `Doc-8C` (contract conformance, composed); `Doc-2 §0.4`; `Doc-7 R11`; `Doc-4M`/`Doc-8E` (lifecycle UI). **Detail:** e2e journey + currency assertion.

## §6 — UI Non-Disclosure Byte-Equivalence & Optimistic-UI Convergence *(`CHK-8-065` + composed `CHK-8-042`)*
- **Purpose:** the load-bearing UI privacy + lifecycle attestations:
  - **UI non-disclosure byte-equivalence (`CHK-8-065`; Doc-7 R8; the Vendor-workspace attestation):** a blacklisted/excluded vendor's **UI experience is byte-equivalent** to a non-matched vendor's — no surface/view/count/notification/analytic/error reveals buyer-private exclusion. **Composes Doc-8D's `CHK-8-024` byte-equivalence criterion** at the **UI layer** (the Doc-8D §5.4 "8G" facet; the buyer-private case sourced from M4 — the UI oracle is the frozen Doc-7G/7F surfaces; the data oracle `Doc-6F`). 8G is the **UI-layer attestation** — defines neither the data criterion (8D) nor the contract criterion (8C); composes both at the presentation surface.
  - **Optimistic-UI convergence (composed `CHK-8-042`):** the optimistic UI **reconciles to the server-authoritative state** (8E **defines** the convergence rule — Doc-4M authoritative; 8G **executes** it after an optimistic update — the define-here/execute-in-8G split from Doc-8E §5).
- **Dependencies:** `Doc-7 R8` (non-disclosure); `Doc-8D §5.4` (byte-equivalence criterion); `Doc-8E` (`CHK-8-042` convergence); Invariant #11; `Doc-7F`/`7G` (surfaces). **Detail:** UI non-disclosure + optimistic-convergence composition.

## §7 — Conformance & Carried Items
- **Purpose:** self-check against Appendix A **Bands A + G**; **coverage attestation** (inventory ≡ frozen Doc-7 surfaces; every applicable Band-G check per surface; **no oracle-gap** — the FE oracle is complete, G3); the carried register (`DR-8-HARNESS` consumed — Playwright/axe; composes 8C/8D/8E; `[ESC-8-CORPUS]` for a coined-screen/Doc-7 defect — never weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing. **Names the Doc-8 program closure** (7 of 7 suites; the conformance fabric complete).
- **Dependencies:** `Doc-8A Appendix A` (A/G); `Doc-7B…7H`. **Detail:** attestation + coverage + program-closure note.

---

## Open Carried Items

| ID | Item | Doc-8G handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8G consumes the Doc-8B harness (Playwright + axe + snapshots) | By pointer; re-authors nothing | **Consumed** |
| **G3 execution-deferred (whole suite)** | The realized UI code is NOT STARTED; Playwright runs against a built app | Authored now (oracle = the **complete** frozen Doc-7 + Doc-5 surface — **no oracle-gap**); execution awaits UI code; no silent omission | **No (tracked)** |
| `[ESC-8-CORPUS]` | A test reveals a coined screen / a genuine Doc-7 surface defect | Flag-and-halt → Board additive patch at `Doc-7x`; test never weakened; never coin a screen | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | A journey needs a contract/key not in the frozen surface | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C [8G composes for e2e]; persistence/RLS = 8D [8G composes #11 at UI]; domain/invariant/state = 8E [8G composes #9 + `CHK-8-042`]; integration/event = 8F) · coining any surface/component/route/expected value · changing any frozen Doc-7/Doc-5/Doc-2 declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · re-ranking governed M3 matching in the UI (Doc-7 R5 — display is presentation; 8E §4 moat owns the no-re-rank) · the implementation Code/UI under test (downstream; G3 deferred).

---

## Provenance & next steps

- **Provenance:** first Doc-8G artifact; the final Doc-8 deliverable. Realizes `Doc-8A §9 + Band G`; consumes `Doc-8B`; oracle = the **complete frozen Doc-7 surfaces** (`7B…7H`) + Doc-2 §0.4 + the frozen Doc-5 surface. No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. G1 (surface-inventory-driven), G2 (define-UI/compose-cross-suite), G3 (execution-readiness, no oracle-gap); section map §0–§7; carried items registered.
- **Next in the lifecycle (Board loop):** Independent Hard Review → Structure Patch → short re-review → Structure Freeze Audit → `Doc-8G_Structure_v1.0_FROZEN` → Doc-8G content passes → Content Freeze Audit → SERIES_FROZEN → **Doc-8 program closure** (7 of 7).

*End of Doc-8G Canonical Structure **Proposal v0.1** — structure only. On any conflict, the frozen Doc-7 surfaces + the frozen Doc-5 surface + Doc-8A win; flag-and-halt — never weaken an assertion, never coin a screen. Doc-8G realizes a surface-inventory-driven frontend/e2e conformance suite over the complete frozen Doc-7 oracle; composes 8C/8D/8E at the UI layer; coins nothing. The final Doc-8 deliverable. Next: Independent Hard Review.*
