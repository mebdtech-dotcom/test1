# Doc-8A — Test & Conformance Realization Metastandard — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8A Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization** (the verification sibling of the Doc-5 API / Doc-6 DB / Doc-7 FE programs). **Doc-8A is the metastandard**; it governs Doc-8B…8G (test-discipline suites) via Appendix A — the test-program analog of Doc-5A/6A/7A |
| Realizes | The full frozen *what*-corpus (Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A…4M + the 12 invariants/5 firewalled signals/moat — the **test oracle**) **and** the realization contracts under test (`Doc-5A…5K` API · `Doc-6A…6K` DB · `Doc-7A…7H` FE) — as deterministic, isolated, CI-gating conformance suites |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §1/§3/§6/§7/§8 (rule 5)`; the frozen architecture corpus governs. **Doc-8 is a downward gate over implementations (Code + the Doc-5/6/7 realizations must pass) and upward-subordinate to its oracle (asserts only corpus-declared behavior, never defines it)**; the gate is necessary, not sufficient — AI code also clears AI Coding Supervisor/human review (CLAUDE.md §8) |
| Freeze evidence | `Doc-8A_Structure_Freeze_Audit_v1.0.md` (PASS) + `Doc-8A_Content_Freeze_Audit_v1.0.md` (APPROVE FOR FREEZE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8A)

| Artifact | Role |
|---|---|
| `Doc-8A_Structure_v1.0_FROZEN.md` | Frozen structure — R-set R1–R12, test-discipline partition (8A + 8B…8G), cross-cutting conformance-concern allocation table, section map §0–§12 + Appendix A skeleton |
| `Doc-8A_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-8A_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§4 — control/precedence/verification obligation · scope/partition · stack/authority · oracle-by-pointer · test-data/tenancy/determinism |
| `Doc-8A_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §5–§9 — contract/API · persistence/migration/RLS · domain/invariant/firewall/state-machine · integration/event-flow · frontend/e2e |
| `Doc-8A_Content_v1.0_Pass3.md` (+ `Pass3_Patch_v1.0.1`) | §10–§12 + Appendix A (bands A–I, **39 `CHK-8-001…081` + `CHK-8-074`**) — isolation/determinism/CI · out-of-test · conformance/carried |
| `Doc-8A_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

**`ERR-8A-1` (folded-in erratum):** `Doc-8A_Structure_v1.0_FROZEN` R11/§4 cite the ID-service determinism anchor as "`Doc-6A §7`"; the correct anchor is **`Doc-6A §3`** (Cross-Cutting Schema Conventions — `id UUIDv7`/`human_ref`) **+ `Doc-4B`** (M0 ID owner), realized in `Doc-6B` (`core.id_sequences`). "Deterministic" is Doc-8's test-harness convention, not a Doc-6A property. Content (`Pass1 §4.3`, `Pass3 §10.2`) uses the corrected anchor; the frozen structure is **not** edited (additive erratum only).

*(No `Doc-2`/`Doc-3`/`Doc-5x` patch was required to freeze Doc-8A — it coins nothing. The only carried additive channels are the per-suite gates below, pre-identified for Doc-8B…8G.)*

---

## What Doc-8A fixes (binding on Doc-8B…8G)

- **R1 program shape** — Doc-8 = Doc-8A metastandard + Doc-8B…8G test-discipline realizations (8B Foundation/Harness *frozen first*; 8C Contract/API · 8D Persistence/Migration/RLS · 8E Domain/Invariant/State-Machine · 8F Integration/Event-Flow · 8G Frontend/E2E), each staged-freeze, gated by Appendix A. Partition by verification discipline, not module (the Doc-7 precedent).
- **R2 realize-never-redecide-never-respecify** — the frozen corpus + the realization contracts are the oracle; every assertion is oracle-by-pointer; no expected behavior coined; gaps → `[ESC-8-*]`.
- **R3 test stack** — TypeScript tooling over the fixed Master-Architecture runtime; concrete frameworks ratified via `[ESC-8-TOOLING]` (Board) — the Doc-6A R3(b) precedent; coins none.
- **R4 conformance, subordinate to oracle** — Doc-8 gates implementations downward but cannot redefine a contract; a red test = code defect (fix) or corpus defect (`[ESC-8-CORPUS]`, flag-and-halt) — **never weaken the assertion**.
- **R5–R12** — test-data/tenancy (through-contracts seeding, ≥2 orgs) · RLS positive/negative/cross-tenant byte-equivalence gate (`Doc-6A R8/§4`, mandatory band) · governance-signal firewall + 12-invariant + moat suites · Doc-4M state-machine conformance · event/outbox integration (transactional write-plus-emit, Doc-4J catalog, Doc-4L flow) · frontend/e2e (a11y, currency, UI non-disclosure) · isolation/determinism/hermeticity/CI merge-gate · out-of-test boundary.
- **Cross-cutting conformance-concern allocation** — each concern asserted once in its defining suite (RLS/non-disclosure → 8D; firewall/invariant/state → 8E), composed (invoked) elsewhere — one criterion, two layer-checks; never a duplicated definition.
- **Appendix A** — 9 bands (A–I) / **39 stable `CHK-8-xxx`** checks: the per-suite freeze gate. R1/R3 are Doc-8A-meta (not per-suite checks).

## Carried items (per-suite gates for Doc-8B…8G — resolved only via named channels)

`DR-8-HARNESS` (Doc-8B frozen first; consumed by pointer) · `DR-8-CONTRACT` (Doc-5/6/7 testability cross-check) · `DR-8-STATE` (Doc-4M drives state suites) · `DR-8-RLS` (mandatory byte-equivalence band) · `[ESC-8-TOOLING]` **(RESOLVED 2026-06-26 — Board-ratified at `Doc-8B_Structure_v1.0_FROZEN` D1: Vitest + Playwright + TS-native transactional SQL, single TypeScript toolchain; pgTAP not selected. The POLICY-patch precedent — resolution recorded here at the owning ledger.)** · `[ESC-8-API]` (additive Doc-5x patch) · `[ESC-8-CORPUS]` (corpus defect — flag-and-halt, never weaken the test) · `[ESC-8-POLICY]` (additive Doc-3 §12.2 patch) · `[ESC-8-SCOPE]` (cross-discipline allocation). **Per-suite oracle-readiness:** 8A/8B/8C/8E oracle-ready now (Doc-5 frozen; Doc-2/3/4M frozen); 8D/8F/8G freeze as Doc-6/7 freeze.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MAJOR + 2 MINOR + 2 NIT + 1 OBS; 1 REJECTED) → Structure Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1 (§0–§4), Pass-2 (§5–§9), Pass-3 (§10–§12 + Appendix A) — each authored → Board Hard Review → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; 3 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8A (Test & Conformance Realization Metastandard) is FROZEN. Realizes the frozen *what*-corpus + the Doc-5/6/7 realization contracts as executable conformance suites; the test-program analog of Doc-5A/6A/7A; governs Doc-8B…8G via Appendix A; the conformance harness yet subordinate to its oracle; coins nothing. On any conflict with the frozen corpus, the corpus wins; flag-and-halt — never weaken an assertion. Next: Doc-8B (Test Foundation & Harness) — first cross-cutting realization, frozen first per DR-8-HARNESS.*
