# Doc-8 — Test & Conformance Realization Program — SERIES FROZEN v1.0 (PROGRAM CLOSURE)

| Field | Value |
|---|---|
| Document | Doc-8 Program Freeze Manifest v1.0 — **the Test & Conformance Realization program is COMPLETE/FROZEN** |
| Status | **FROZEN / COMPLETE** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization** — the verification sibling of the Doc-5 (API), Doc-6 (Database), and Doc-7 (Frontend) realization programs. Proves that every implementation conforms to the frozen corpus + the Doc-5/6/7 realization contracts |
| Scope | **7 deliverables, all FROZEN:** the metastandard (Doc-8A), the harness (Doc-8B), and the five discipline suites (Doc-8C…8G) |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §1/§3/§6/§7/§8 (rule 5)`; the frozen architecture corpus governs (Master Architecture · ADR · Doc-2 · Doc-3 · Doc-4A…4M · Doc-5A…5K · Doc-6A…6K · Doc-7A…7H). Doc-8 is the conformance harness, **subordinate to its oracle** (a downward gate over implementations; upward-subordinate to the corpus) |

---

## The 7 frozen deliverables

| Doc-8 | Suite | Manifest | Realizes / Band | Defining role |
|---|---|---|---|---|
| **8A** | Test & Conformance Realization **Metastandard** | `Doc-8A_SERIES_FROZEN_v1.0` | R1–R12; §0–§12 + Appendix A (**39 `CHK-8-001…081`** / 9 bands A–I); gates 8B…8G | Coins nothing; conformance harness subordinate to its oracle |
| **8B** | **Test Foundation & Harness** *(frozen first)* | `Doc-8B_SERIES_FROZEN_v1.0` | §4/§10 + bands H/I; runner, ephemeral DB, fixtures, ≥2-org seeding, seeded clock + deterministic ID, mock boundary + **outbox observer/drainer**, CI merge-gate | `[ESC-8-TOOLING]` RESOLVED: **Vitest + Playwright + TS-native SQL** |
| **8C** | **Contract & API Conformance** | `Doc-8C_SERIES_FROZEN_v1.0` | §5 + bands A/B (`CHK-8-010…015`); table-driven over the frozen Doc-5 surface | Coverage ≡ frozen Doc-5x enumerations |
| **8D** | **Persistence, Migration & RLS Conformance** | `Doc-8D_SERIES_FROZEN_v1.0` | §6 + band C (`CHK-8-020…025`); schema-inventory-driven | **Defines #8 (immutability) + #11 (RLS byte-equivalence)** |
| **8E** | **Domain, Invariant, Firewall & State-Machine Conformance** | `Doc-8E_SERIES_FROZEN_v1.0` | §7 + bands D/E (`CHK-8-030…042`); the governance defining suite | **Defines** the 5-signal firewall (2 shapes) + 12 invariants + moat + Doc-4M |
| **8F** | **Integration & Event-Flow Conformance** | `Doc-8F_SERIES_FROZEN_v1.0` | §8 + band F (`CHK-8-050…053`); catalog-inventory-driven | Atomicity via the 8B outbox observer; composes 8E/8D |
| **8G** | **Frontend & E2E Conformance** | `Doc-8G_SERIES_FROZEN_v1.0` | §9 + band G (`CHK-8-060…065`); surface-inventory-driven | UI non-disclosure attestation; composes 8C/8D/8E |

---

## The conformance fabric (cross-suite allocation — closed)

The Doc-8A cross-cutting **assert-once** allocation is fully realized — each conformance concern is **defined once** and **composed** at every layer it is observable:

- **Immutability (#8)** — **8D defines** (`CHK-8-022`, frozen Doc-6B/6C triggers); **8E references** at the invariant layer.
- **RLS byte-equivalence / non-disclosure (#11)** — **8D defines** the criterion (`CHK-8-024`, row visibility); **8C** composes at the contract surface, **8F** at the event/notification layer (no distinguishing event), **8G** at the rendered UI (Vendor-view byte-equivalence). The data scenario sources from `Doc-6F` (buyer-private).
- **Governance firewall + 12 invariants + Doc-4M state machines** — **8E defines**; **8C/8F/8G compose** where a signal/invariant/transition crosses a contract / event / UI.
- **Optimistic-UI convergence** (`CHK-8-042`) — **8E defines**; **8G executes**.
- **The harness (DR-8-HARNESS)** — **8B provides**; **8C…8G consume** by pointer (the outbox observer/drainer is the 8F Band-F enabler).

No concern is asserted twice divergently; no realization layer is left unverified.

---

## Standing program properties (binding on the eventual Code)

- **Authored-not-run:** every suite's design + coverage are FROZEN now (the oracles — Doc-2/3/4/5/6/7 — are frozen); per-assertion PASS/FAIL is recorded at **execution** once the implementation Code exists. The suites are the spec's executable shadow.
- **Execution-deferred facets (tracked, none dropped):** the buyer-private #11 byte-equivalence data scenario (`Doc-6F`); the M3 grantee-row RLS (`Doc-6E`, since frozen); event emitters/consumers + the import-graph lint (Code); migration/codegen (Code); the whole 8G suite (UI Code). Each authored, pointer-bound, scheduled.
- **The merge gate (8B §8 / `CHK-8-073`):** CI blocks merge on any red conformance suite; a skipped/relaxed/`.only`/deleted conformance test counts as red; **necessary, not sufficient** — AI code also clears AI Coding Supervisor/human review (CLAUDE.md §8).
- **Never weaken; never coin:** a red conformance test = a code defect (fix it) or a corpus defect (`[ESC-8-CORPUS]`, flag-and-halt → Board additive patch at the owning doc). The suite is never weakened, no expected behavior / event / screen / contract is ever coined. Doc-8 coins **nothing** across all 7 deliverables.

---

## Carried items (program-level)

`DR-8-HARNESS` (satisfied — 8B) · `DR-8-CONTRACT` (satisfied — 8C) · `DR-8-STATE` (satisfied — 8E) · `DR-8-RLS` (satisfied — 8D) · `[ESC-8-TOOLING]` (RESOLVED — 8B D1) · `ERR-8A-1` + `CLAR-8D-1` (folded errata/clarifications) · `[ESC-8-CORPUS]`/`[ESC-8-API]`/`[ESC-8-POLICY]`/`[ESC-8-SCOPE]` (per-suite, named-channel only — surface at execution).

## Provenance (reference only)

Each deliverable: Structure Proposal → Independent Hard Review (Board) → Structure Patch + short re-review → Structure Freeze Audit → FROZEN → Content Pass-1…(2/3) → per-pass Hard Review → Patch → short closure check → Content Freeze Audit → SERIES_FROZEN. Every pass closed at 0 open BLOCKER/MAJOR/MINOR; numerous MAJOR/MINOR defects caught and fixed (e.g. firewall non-dominance shape; #11 = buyer-private/Doc-6F; data-layer byte-equivalence scope; kit-components-as-first-class; vendor-view vs buyer-CRM); REJECTED-as-false findings upheld with proof throughout.

---

## Position in the implementation-governance phase

| Program | Status |
|---|---|
| Architecture (Doc-2/3/4) | COMPLETE/FROZEN |
| Doc-5 API realization (M0–M9) | COMPLETE/FROZEN |
| Doc-6 Database realization | in progress (6A…6E FROZEN; 6F…6K pending) |
| Doc-7 Frontend realization | **COMPLETE/FROZEN** (7A…7H) |
| **Doc-8 Test & Conformance realization** | **COMPLETE/FROZEN (this manifest)** |
| Code | NOT STARTED (gated by the Doc-8 conformance fabric) |

---

*The Doc-8 Test & Conformance Realization program is COMPLETE/FROZEN. Seven deliverables — metastandard + harness + five discipline suites — realize the executable conformance fabric that proves every implementation conforms to the frozen corpus. The fabric is authored-not-run: frozen now against the frozen oracles, it executes as the implementation Code lands, gating merge and never weakening. Doc-8 coins nothing. On any conflict, the frozen corpus wins; flag-and-halt — never weaken an assertion, never coin. **Doc-8 closed.***
