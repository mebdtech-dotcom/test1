# Doc-8G — Frontend & E2E Conformance Suite — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8G Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26. **The final Doc-8 deliverable (7 of 7).** |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8G = the **Frontend & E2E conformance suite**; consumes the frozen **Doc-8B harness** (Playwright + axe + snapshots — D1) by pointer |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §9` + Appendix A bands **A** + **G** (`CHK-8-060…065`). **Oracle:** the **complete frozen Doc-7 surfaces** (`Doc-7B…7H`) + `Doc-7 R5/R8/R9/R11` · `Doc-2 §0.4` (currency) · Invariant #9/#11 · the frozen Doc-5 surface (e2e). Consumes `Doc-8B` (Playwright/axe/snapshots) by pointer |
| Authority | `Doc-8A` governs; the frozen Doc-7 surfaces + Doc-2 + the frozen Doc-5 surface are the oracle. Doc-8G **coins nothing** — a red test = code defect, or `[ESC-8-CORPUS]`/`[ESC-8-API]` (never weaken) |
| Freeze evidence | `Doc-8G_Structure_Freeze_Audit_v1.0.md` (PASS) + `Doc-8G_Content_Freeze_Audit_v1.0.md` (APPROVE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8G)

| Artifact | Role |
|---|---|
| `Doc-8G_Structure_v1.0_FROZEN.md` | Frozen structure — G1 (surface-inventory-driven) + G2 (define-UI/compose-cross-suite) + G3 (execution-readiness, no surface oracle-gap), §0–§7 |
| `Doc-8G_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-8G_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§3 — control · surface inventory (full Doc-7 set) · component (kit + surface) · a11y |
| `Doc-8G_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §4–§7 — visual-regression · e2e/currency · UI non-disclosure/convergence · conformance |
| `Doc-8G_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

*(No `Doc-7`/`Doc-2` patch was required to freeze Doc-8G — it coins nothing, coins no screen.)*

---

## What Doc-8G fixes (the frontend/e2e conformance suite)

- **G1 surface-inventory-driven** — inventory **derived from the full frozen Doc-7 set** (`Doc-7B` kit components + `Doc-7C` shell + `Doc-7D…7H` surfaces); **completeness ≡ the frozen Doc-7 set** (none coined). Embedded components (M5/M6/M7/M9) referenced at their single defining doc (no orphan/duplicate).
- **Band G checks** (at the kit-component + surface levels per the two-level model): **component conformance** (`CHK-8-060`: kit composition + Content≠Presentation/#9 — composes 8E; microsite one-owner-two-surfaces) · **a11y** (`CHK-8-061`: WCAG-AA + keyboard/focus via axe) · **visual-regression** (`CHK-8-062`: kit-variant + surface snapshots; diff never auto-accepted) · **e2e** (`CHK-8-063`: journeys invoke only frozen Doc-5 contracts — 8C's shared oracle, **not re-run**; 8G asserts the flow works) · **currency** (`CHK-8-064`: per-value-field, default BDT, cross-cutting) · **UI non-disclosure** (`CHK-8-065`).
- **The load-bearing privacy attestation (`CHK-8-065`, `Doc-7 R8`):** **(a) Vendor-view byte-equivalence (7G)** — a blacklisted vendor cannot detect exclusion (excluded vendor's Vendor workspace ≡ non-matched vendor's; the observer's rendered view; composes Doc-8D §5.4 criterion; data: `Doc-6F`); **(b) Buyer-private CRM confinement (7F)** — the buyer-private CRM renders to the buyer and **never leaks to any vendor-facing surface**. Distinct assertions; 7F ≠ a byte-equivalence surface.
- **Composed (not Band G):** `CHK-8-042` optimistic-UI convergence (8E defines / 8G executes — Band E); Invariant #9 (8E); the e2e Doc-5 oracle (8C verifies, not re-run); the byte-equivalence criterion (8D §5.4).
- **G3 execution-readiness:** the **UI surface oracle is complete** (Doc-7 frozen) — **no surface oracle-gap**; authored-not-run (UI code deferred); `CHK-8-065` has a residual data-oracle dependency (`Doc-6F`).

## Carried items

`DR-8-HARNESS` **consumed** (Doc-8B Playwright/axe/snapshots) · composes `Doc-8C`/`Doc-8D §5.4`/`Doc-8E` · `[ESC-8-CORPUS]` (coined screen / Doc-7 defect — flag-and-halt, **never weaken, never coin a screen**) · `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MINOR + 1 NIT; 1 REJECTED) → Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1 (§0–§3), Pass-2 (§4–§7) — each authored → Board Hard Review (1 MAJOR each) → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; 2 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8G (Frontend & E2E Conformance Suite) is FROZEN — the final Doc-8 deliverable. A surface-inventory-driven frontend/e2e conformance suite over the complete frozen Doc-7 oracle; composes 8C (e2e) / 8D §5.4 (UI byte-equivalence) / 8E (#9, convergence) at the UI layer; coins nothing, coins no screen. On any conflict with the frozen corpus, the corpus wins; flag-and-halt — never weaken an assertion. **Its freeze closes the Doc-8 program (7 of 7) — see `Doc-8_SERIES_FROZEN_v1.0`.***
