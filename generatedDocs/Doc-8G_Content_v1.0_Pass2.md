# Doc-8G — Frontend & E2E Conformance Suite — Content v1.0 **Pass-2 (§4–§7)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §4–§7 of `Doc-8G_Structure_v1.0_FROZEN`. Final Doc-8G content pass; its freeze closes the Doc-8 program. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8G_Structure_v1.0_FROZEN` §4–§7: visual-regression · e2e/currency · UI non-disclosure/convergence · conformance |
| Authority | `Doc-8A §9` + bands A/G; oracle = the frozen Doc-7 surfaces + Doc-2 §0.4 + the frozen Doc-5 surface; consumes `Doc-8B` (Playwright/snapshots) by pointer |
| Coins | **Nothing.** Assertions oracle-by-pointer; snippets illustrative |
| Binding vs choice | Convention = **[binding]**; physical specific = **[Doc-8G choice]**. |

> **Scope of this pass:** visual-regression (§4, `CHK-8-062`), e2e user-journey & currency (§5, `CHK-8-063`/`CHK-8-064`), UI non-disclosure byte-equivalence + optimistic-UI convergence (§6, `CHK-8-065` + composed Band-E `CHK-8-042`), and Doc-8G's conformance attestation (§7). With Pass-1 (§0–§3) this completes Doc-8G content — and the Doc-8 program.

---

## §4 — Visual-Regression *(`CHK-8-062`)*

**[binding `Doc-7 R5` / `Doc-8B` snapshots]** Assert presentation stability via **Playwright snapshots** (Doc-8B D1), at **both levels** (Pass-1 §2 MAJOR-1):

- **Kit-component level:** snapshot each `Doc-7B` component across its **state/variant matrix** (default/disabled/loading/error/sizes) — a visual diff in any variant is surfaced.
- **Surface/key-view level:** snapshot each `Doc-7D…7H` surface's key views.

A visual diff is **surfaced for review, never auto-accepted** (presentation is disposable over module-owned content — `Doc-7 R5`; the test flags the diff, a human ratifies the new baseline). Execution-deferred (UI code); the snapshot baselines are established at first execution.

```ts
// illustrative; convention [Doc-7 R5 / Doc-8B binding]; snapshot kit variants + surface key-views; diff != auto-accept
for (const variant of kitComponent.variants) expectVisualSnapshot(kitComponent, variant)  // 7B variant matrix
for (const view of surface.keyViews)         expectVisualSnapshot(view)                    // 7D–7H surfaces
// a diff fails the run and is surfaced for human baseline ratification — never silently re-baselined
```

## §5 — E2E User-Journey & Currency Conformance *(`CHK-8-063` + `CHK-8-064`)*

**[binding the frozen Doc-5 surface / `Doc-2 §0.4` / `Doc-7 R11`]**

- **E2E journeys (`CHK-8-063`):** assert **end-to-end user journeys** over the **frozen Doc-5 surface** — the journey **invokes only frozen Doc-5x contracts** (the surface **8C independently verifies**; **8G asserts the journey works end-to-end**, not per-contract conformance — shared oracle, distinct assertions; 8G does **not** re-run 8C's Band B). Journeys: **Buyer (7F)** discovery→RFQ author→routing/invitation→quotation comparison→award→post-award; **Vendor (7G)** invitation inbox→quotation author/version→microsite manage; **Account (7E)** auth→org-switch→membership/role→subscription/invoice; **Admin (7H)** moderation/verification/ban/approval (no active-org); **Public (7D)** anonymous discovery→microsite→public profile. Lifecycle steps render **Doc-4M-permitted transitions** (state-machine UI — **8E-composed**, `CHK-8-042` convergence in §6); active-org context (Doc-7C) carried per journey; the client org ID is never trusted (CLAUDE.md §5 — server-resolved).
- **Currency (`CHK-8-064`):** assert **per-value-field currency display, default BDT, never assumed** (`Doc-2 §0.4` / `Doc-7 R11`) — every monetary value renders **with its currency**; a value rendered without/with-assumed currency is a defect (the multi-currency-ready discipline at the UI).

Execution-deferred (UI code + a built app under Playwright); the frozen Doc-5 surface + the journey set + the currency rule are the oracle now.

```ts
// illustrative; convention [frozen Doc-5 + Doc-2 §0.4 binding]; journey invokes only frozen contracts; currency per field
await runJourney(BUYER_RFQ_TO_AWARD, { onlyFrozenDoc5Contracts: true })   // 8G asserts the flow works (not 8C's per-contract)
expectEveryMonetaryValueRendersCurrency(view, { default: 'BDT', neverAssumed: true })  // Doc-2 §0.4
```

## §6 — UI Non-Disclosure Byte-Equivalence & Optimistic-UI Convergence *(`CHK-8-065` + composed Band-E `CHK-8-042`)*

**[binding `Doc-7 R8` / `Doc-8D §5.4` / `Doc-8E`]**

- **UI non-disclosure byte-equivalence (`CHK-8-065`; the load-bearing Vendor-workspace attestation, `Doc-7 R8`):** a **blacklisted/excluded** vendor's **UI experience is byte-equivalent** to a **non-matched** vendor's — **no surface, view, count, notification, analytic, or error** reveals buyer-private exclusion. **Composes Doc-8D's `CHK-8-024`** byte-equivalence criterion at the **UI layer** (the Doc-8D §5.4 "8G" facet): render the excluded-vendor case and the non-matched-vendor case in the vendor-facing surfaces (7G/7F) and assert the **rendered UI is byte-identical** (the observer's view — the buyer cannot distinguish blacklisted from never-matched). **Data dependency (G3):** constructing the excluded case needs `buyer_vendor_statuses` (M4/`Doc-6F`); the **UI observable oracle (Doc-7G/7F) is frozen**. 8G is the **UI-layer attestation**; the criterion is 8D's (data) — 8G defines neither, composes at the presentation surface.
- **Optimistic-UI convergence (composed Band-E `CHK-8-042`):** after an optimistic UI update, the UI **reconciles to the server-authoritative state** — **8E defines** the convergence rule (Doc-4M authoritative); **8G executes** it (the Doc-8E §5 define-here/execute-in-8G split). A divergent or non-converging optimistic state is a defect.

```ts
// illustrative; convention [Doc-7 R8 / Doc-8D §5.4 / Doc-8E binding]; UI byte-equivalence (observer view) + convergence
expectUIByteEquivalent(renderVendorFacing(excludedVendor), renderVendorFacing(nonMatchedVendor))  // CHK-8-065 (8D criterion at UI; data: Doc-6F)
await applyOptimisticUpdate(view); expectReconcilesToServerAuthoritative(view)                    // CHK-8-042 (8E defines, 8G executes)
```

## §7 — Conformance & Carried Items

**Doc-8G conformance attestation:**

| Band | Disposition |
|---|---|
| **A** — oracle-by-pointer | **realizes by design** — every assertion binds the frozen Doc-7 surfaces / Doc-2 §0.4 / the frozen Doc-5 surface by pointer; none stricter/looser; no screen coined; red = code or `[ESC-8-CORPUS]`, never weakened |
| **G** — frontend/e2e (`CHK-8-060…065`) | **realizes by design** — component (§2, kit + surface levels) · a11y (§3) · visual-regression (§4) · e2e (§5) · currency (§5) · UI non-disclosure (§6) |
| **composed (not Band G)** | `CHK-8-042` optimistic convergence — **Band E**, 8E defines / 8G executes (§6); Invariant #9 Content≠Presentation — 8E-composed (§2); e2e uses the Doc-5 oracle 8C verifies (not re-run); UI byte-equivalence criterion is 8D's (§6) |
| **B/C/D/E/F/H/I** | **N/A** — contract (8C) · persistence/RLS (8D) · domain/invariant/state (8E) · integration/event (8F) · harness (8B) |

**Coverage attestation [G1]:** inventory ≡ the **full frozen Doc-7 set** (7B kit components + 7C shell + 7D–7H surfaces; every applicable Band-G check at its level; **no surface oracle-gap** — the FE oracle is complete); **`CHK-8-065`** has a residual **data-oracle dependency** (`Doc-6F buyer_vendor_statuses`); none silently dropped. **Authored-not-run**: design + coverage frozen now (oracle = the complete frozen Doc-7 + Doc-5 surface); per-assertion PASS/FAIL at execution once the UI code exists.

**Carried register [by pointer]:** `DR-8-HARNESS` **consumed** (Doc-8B Playwright/axe/snapshots); composes `Doc-8C` (e2e oracle) / `Doc-8D §5.4` (UI byte-equivalence) / `Doc-8E` (#9, `CHK-8-042`); `[ESC-8-CORPUS]` (coined screen / Doc-7 defect — flag-and-halt, **never weaken, never coin a screen**); `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel). Doc-8G coins nothing.

**Doc-8 program closure:** Doc-8G is the **7th of 7** Doc-8 deliverables. With its freeze, the conformance fabric is complete — metastandard (8A), harness (8B), and the six discipline suites (8C contract · 8D persistence/RLS · 8E domain/invariant/firewall/state · 8F integration/event · 8G frontend/e2e), with every cross-suite allocation closed (8D defines #8/#11 → 8E references → 8F/8G compose). See the **`Doc-8_SERIES_FROZEN_v1.0`** program-closure manifest.

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** the frozen Doc-7 surfaces + `Doc-7 R5/R8/R11`; `Doc-2 §0.4` (currency); the frozen Doc-5 surface (e2e); `Doc-8C` (shared oracle) · `Doc-8D §5.4` (byte-equivalence) · `Doc-8E` (#9/`CHK-8-042`); `Doc-8B` (snapshots); CLAUDE.md §5 (active org); Invariant #9/#11. **Nothing invented; no screen coined.**
- **Pass-1 fixes consumed:** §4 visual at both levels (kit variant matrix + surface); the inventory is the full Doc-7 set.
- **Composition correct:** §5 e2e uses Doc-5 (not 8C re-run); §6 #11 UI = 8D criterion, `CHK-8-042` = 8E-executed; §7 labels composed checks separately from Band G.
- **Authored-not-run honesty:** §7 "realizes by design"; no-surface-oracle-gap; `CHK-8-065` data-dep `Doc-6F` flagged.
- **Coins nothing:** 0 new surface/component/route/expected value.
- **Open for review:** confirm the e2e journey set matches the frozen Doc-7F/7G/7E/7H/7D surface journeys; confirm `CHK-8-065`'s UI byte-equivalence is asserted on the **observer's rendered view** (not vendor identities — the Doc-8D §5.4 framing).

*End of Content Pass-2 (§4–§7) — DRAFT. Realizes `Doc-8G_Structure_v1.0_FROZEN` §4–§7. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN → Doc-8 program closure.*
