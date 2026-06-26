# Doc-8G — Frontend & E2E Conformance Suite — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-8G_Structure_Proposal_v0.1` + `Doc-8G_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR). **The final Doc-8 deliverable** |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8G = the **Frontend & E2E conformance suite**; consumes the frozen **Doc-8B harness** (Playwright + axe + snapshots — D1) by pointer. **Closes the Doc-8 program (7 of 7)** |
| Document | **Doc-8G** — realizes `Doc-8A §9` + Appendix A **Band G** (`CHK-8-060…065`) as the frontend/e2e conformance suite |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §9` + Band G. **Oracle:** the **complete frozen Doc-7 surfaces** (`Doc-7B…7H`) + `Doc-7 R5/R8/R9/R11` · `Doc-2 §0.4` (currency) · Invariant #9/#11 · the frozen Doc-5 surface (e2e). Consumes `Doc-8B` (Playwright/axe/snapshots) by pointer |
| Authority | `Doc-8A` governs; the frozen Doc-7 surfaces + Doc-2 + the frozen Doc-5 surface are the oracle. Doc-8G **coins nothing** — a red test = code defect, or `[ESC-8-CORPUS]`/`[ESC-8-API]` (never weaken) |
| Contains | Structure only — G1 (surface-inventory-driven) + G2 (define-UI/compose-cross-suite) + G3 (execution-readiness, no surface oracle-gap), §0–§7, carried items. **No test code** — content passes realize the conventions |
| Program note | Doc-8G introduces **no surface, component, route, or expected value**. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at `Doc-7x`) — never coin a screen/component. |

> **Governing rule:** realize, never re-decide. The Doc-7 surfaces + Doc-4M (lifecycle UI) + the Doc-5 surface (e2e) are FROZEN; Doc-8G realizes *how the UI is proven conformant*. Every assertion is oracle-by-pointer; no assertion stricter or looser than the frozen Doc-7 surface (Doc-8A §3.3).

---

## Ratified decisions

- **G1 — Surface-inventory-driven (table-driven; the Doc-8C/8D/8F precedent).** A **surface inventory** is **derived from the frozen `Doc-7B…7H`** — every surface/route-group, its views/screens, the kit components composed (`Doc-7B`), lifecycle UIs (Doc-4M), e2e journeys (over the frozen Doc-5 surface), actor/active-org context (Doc-7C; none for `Doc-7H` Admin). Each Band-G check runs over every row; the **completeness check asserts inventory ≡ the frozen Doc-7 surfaces** (none coined).
- **G2 — Define the UI-specific checks; compose the cross-suite criteria at the UI layer.** Doc-8G **defines**: component conformance (`CHK-8-060`, kit + Content≠Presentation), a11y (`CHK-8-061`), visual-regression (`CHK-8-062`), currency-display (`CHK-8-064`). It **composes** (invokes, never re-defines): for **e2e** (`CHK-8-063`) the journey **invokes only frozen Doc-5x contracts** — the surface **8C independently verifies** (per-contract); **8G asserts the journey works end-to-end**, not per-contract conformance (shared Doc-5 oracle, distinct assertions; 8G does not re-run 8C's Band B). For **Invariant #9** (Content≠Presentation) + **`CHK-8-042`** (optimistic-UI converges) it invokes **8E** (8E defines; 8G executes — Band E composed, not a Band-G deliverable). For **UI non-disclosure** (`CHK-8-065`) it invokes **8D's `CHK-8-024`** byte-equivalence criterion at the UI layer (the Doc-8D §5.4 "8G" facet). 8G is the **load-bearing UI non-disclosure attestation** (Doc-7 R8 — the Vendor-workspace byte-equivalence).
- **G3 — Execution-readiness: the Doc-7 + Doc-5 oracle is FROZEN now; UI code deferred.** The **UI surface oracle is complete** (`Doc-7B…7H` frozen) for **all** Band-G checks — so Doc-8G is **authored fully now** with **no surface oracle-gap**. Execution needs the **realized UI code** (NOT STARTED) under Playwright → **execution-deferred** (whole suite, like 8C/8F). **One residual data-oracle dependency:** `CHK-8-065` (UI byte-equivalence) needs the buyer-private exclusion **data** (`buyer_vendor_statuses`, M4/`Doc-6F`) to construct the excluded scenario — the criterion is 8D's, sourced from `Doc-6F`; the UI observable (Doc-7G) is frozen. All authored now; none dropped. Authored-not-run.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8G's place (below Doc-8A; consumes Doc-8B Playwright/axe/snapshots; composes 8C e2e + 8E #9/`CHK-8-042` + 8D #11-UI); realize-never-redecide; oracle = the frozen Doc-7 surfaces + Doc-2 §0.4 + the frozen Doc-5 surface; freeze obligation — pass Appendix A **Band G** (+ Band A); never weaken (`[ESC-8-CORPUS]`). **Closes the Doc-8 program.**
- **Dependencies:** `Doc-8A §0/§9/Appendix A`; `Doc-8B`; `Doc-7B…7H`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Surface Inventory
- **Purpose:** the **surface inventory** (G1) — every frozen `Doc-7B…7H` surface with views/screens, composed kit components (`Doc-7B`), lifecycle UIs (Doc-4M), e2e journeys (over frozen Doc-5), actor/active-org context (Doc-7C). Derived from the frozen Doc-7; completeness ≡ frozen Doc-7 surfaces (none coined).
- **Dependencies:** `Doc-7B…7H`; `Doc-7A` (partition). **Detail:** inventory schema + source-of-truth anchor.

## §2 — Component Conformance *(`CHK-8-060`)*
- **Purpose:** assert components render the **shared kit** (`Doc-7B`) — never a re-implemented primitive; the **presentation-component boundary** (Content ≠ Presentation, Invariant #9 / Doc-7 R5 — a component owns no authoritative state; presentation never mutates/caches-as-authoritative). **Composes 8E's #9** criterion at the UI layer. The microsite case (M2 content rendered read-only by Public 7D / managed by Vendor 7G — one owner, two surfaces — Doc-7 R5) asserted.
- **Dependencies:** `Doc-7B`; `Doc-7 R5`; Invariant #9; `Doc-8E` (#9). **Detail:** component + Content≠Presentation assertion.

## §3 — Accessibility Baseline *(`CHK-8-061`)*
- **Purpose:** assert **WCAG-AA + keyboard/focus** (`Doc-7 R11`): focus order, keyboard operability, semantic roles/ARIA, contrast — via `@axe-core/playwright` (Doc-8B D1). An a11y regression is a code defect. Per surface.
- **Dependencies:** `Doc-7 R11`; `Doc-8B` (axe). **Detail:** a11y assertion convention.

## §4 — Visual-Regression *(`CHK-8-062`)*
- **Purpose:** assert presentation stability via **Playwright snapshots** (Doc-8B D1); a visual diff is **surfaced for review, never auto-accepted** (presentation disposable over module-owned content — Doc-7 R5). Per surface/key-view.
- **Dependencies:** `Doc-7 R5`; `Doc-8B` (snapshots). **Detail:** visual-regression convention.

## §5 — E2E User-Journey & Currency Conformance *(`CHK-8-063` + `CHK-8-064`)*
- **Purpose:** assert **end-to-end journeys** over the **frozen Doc-5 surface only** — the journey **invokes only frozen Doc-5x contracts** (the surface 8C independently verifies); **8G asserts the journey works end-to-end**, not per-contract conformance (shared Doc-5 oracle, distinct assertions; 8G does not re-run 8C). Journeys: discovery→RFQ→routing/invitation→quotation comparison→award→post-award (Buyer 7F); invitation→quotation→microsite (Vendor 7G); account/billing (7E); admin (7H); public discovery (7D). **Currency (`CHK-8-064`):** per-value-field currency display, default BDT, never assumed (`Doc-2 §0.4` / Doc-7 R11). Lifecycle steps render Doc-4M-permitted transitions (8E-composed); active-org context (Doc-7C) per journey.
- **Dependencies:** the frozen Doc-5 surface; `Doc-2 §0.4`; `Doc-7 R11`; `Doc-4M`/`Doc-8E`; `Doc-8C` (shared oracle, not re-run). **Detail:** e2e journey + currency assertion.

## §6 — UI Non-Disclosure Byte-Equivalence & Optimistic-UI Convergence *(`CHK-8-065` + composed Band-E `CHK-8-042`)*
- **Purpose:**
  - **UI non-disclosure byte-equivalence (`CHK-8-065`; Doc-7 R8; the Vendor-workspace attestation):** a blacklisted/excluded vendor's **UI experience is byte-equivalent** to a non-matched vendor's — no surface/view/count/notification/analytic/error reveals buyer-private exclusion. **Composes Doc-8D's `CHK-8-024`** byte-equivalence criterion at the **UI layer** (the Doc-8D §5.4 "8G" facet). **The UI observable oracle (Doc-7G/7F) is frozen; the excluded-scenario data needs `Doc-6F` (`buyer_vendor_statuses`)** — flagged (G3). 8G defines neither the data criterion (8D) nor the contract criterion (8C); composes both at the presentation surface.
  - **Optimistic-UI convergence (composed Band-E `CHK-8-042`):** the optimistic UI **reconciles to the server-authoritative state** — **8E defines** the convergence rule (Doc-4M authoritative); **8G executes** it after an optimistic update (the Doc-8E §5 define-here/execute-in-8G split). Band-E composed, **not** a Band-G deliverable.
- **Dependencies:** `Doc-7 R8`; `Doc-8D §5.4` (criterion; `Doc-6F` data); `Doc-8E` (`CHK-8-042`); Invariant #11; `Doc-7F`/`7G`. **Detail:** UI non-disclosure + optimistic-convergence composition.

## §7 — Conformance & Carried Items
- **Purpose:** self-check against Appendix A **Bands A + G**; **coverage attestation** (inventory ≡ frozen Doc-7 surfaces; every applicable Band-G check per surface; **no surface oracle-gap** (G3); `CHK-8-065` data-dep on `Doc-6F`; `CHK-8-042` executed-as-composed from 8E — Band E, listed separately, not a Band-G deliverable); carried register (`DR-8-HARNESS` consumed — Playwright/axe; composes 8C/8D/8E; `[ESC-8-CORPUS]` never-weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing. **Names the Doc-8 program closure** (7 of 7 suites; the conformance fabric complete).
- **Dependencies:** `Doc-8A Appendix A` (A/G); `Doc-7B…7H`. **Detail:** attestation + coverage + program-closure note.

---

## Open Carried Items

| ID | Item | Doc-8G handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8G consumes the Doc-8B harness (Playwright + axe + snapshots) | By pointer; re-authors nothing | **Consumed** |
| **G3 execution-deferred (whole suite)** | The realized UI code is NOT STARTED; Playwright runs against a built app | Authored now (UI surface oracle **complete** — no surface gap); `CHK-8-065` data-scenario needs `Doc-6F`; execution awaits UI code; none dropped | **No (tracked)** |
| `[ESC-8-CORPUS]` | A test reveals a coined screen / a genuine Doc-7 defect | Flag-and-halt → Board additive patch at `Doc-7x`; never coin a screen | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | A journey needs a contract/key not in the frozen surface | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C [shared oracle, not re-run]; persistence/RLS = 8D [8G composes #11-UI]; domain/invariant/state = 8E [8G composes #9 + `CHK-8-042`]; integration/event = 8F) · coining any surface/component/route/expected value · changing any frozen Doc-7/Doc-5/Doc-2 declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · re-ranking governed M3 matching in the UI (Doc-7 R5; the no-re-rank is 8E §4) · the implementation Code/UI under test (downstream; G3 deferred).

---

## Provenance & status

- **Provenance:** first Doc-8G artifact, structure-frozen; the final Doc-8 deliverable. Realizes `Doc-8A §9 + Band G`; consumes `Doc-8B`; oracle = the complete frozen Doc-7 surfaces + Doc-2 §0.4 + the frozen Doc-5 surface. Independent Hard Review (2 MINOR + 1 NIT; 1 REJECTED) + Structure Patch + short re-review + Structure Freeze Audit PASS. No frozen document edited; nothing coined.
- **Status:** **FROZEN v1.0** — structure only. G1 (surface-inventory-driven), G2 (define-UI/compose-cross-suite), G3 (execution-readiness, no surface oracle-gap; CHK-8-065 data-dep on Doc-6F); section map §0–§7.
- **Next:** Doc-8G content passes → Content Freeze Audit → SERIES_FROZEN → **Doc-8 program closure** (7 of 7).

*End of Doc-8G Canonical Structure **v1.0 FROZEN**. On any conflict, the frozen Doc-7 surfaces + the frozen Doc-5 surface + Doc-8A win; flag-and-halt — never weaken an assertion, never coin a screen. Doc-8G realizes a surface-inventory-driven frontend/e2e conformance suite over the complete frozen Doc-7 oracle; composes 8C/8D/8E at the UI layer; coins nothing. The final Doc-8 deliverable.*
