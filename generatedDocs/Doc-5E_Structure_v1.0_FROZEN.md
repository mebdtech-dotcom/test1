# Doc-5E — RFQ Procurement Engine (M3 `rfq`) API Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents for Doc-5E |
| Freeze Date | 2026-06-24 |
| Supersedes | `Doc-5E_Structure_Proposal_v0.1.md` (v0.2 — Independent Hard Review applied; 3 MAJOR + 6 MINOR + 4 NITPICK resolved; authoring history + review disposition retained there) |
| Module | Module 3 — RFQ Procurement Engine (`rfq` schema) — **the procurement moat** |
| Realizes | `Doc-4E` (M3 contracts, FROZEN — 38 contracts, PassB Part1–5) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B`/`Doc-5C` (FROZEN); **`Doc-5C §3` is the frozen precedent for a mechanism-only cross-cutting section**; force derives from `Doc-5A §1.3/§5/§7/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0 (FROZEN — M3 contracts), Doc-4M v1.0 (FROZEN — state machines), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (section-pointer column), ratified decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5E content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-4E fixed *what* M3's 38 contracts declare; Doc-3 owns the procurement logic (gates, pipeline order, fairness, capacity, distribution, scoring, quotation, evaluation, economics — by pointer, never re-derived); Doc-5A fixed *how* a contract becomes HTTP. Doc-5E realizes Doc-4E's **caller-facing** surface and re-decides nothing.
2. **Conformance is an obligation.** Doc-5E passes the Doc-5A **Appendix A** checklist before freeze. It coins no endpoint, status, header, error class, permission slug, POLICY key, or event.

## Decisions ratified at structure freeze

- **R1 — Out-of-wire boundary** (Doc-5B/5C precedent; authority `Doc-5A §1.3/§5/§11`). Doc-5E realizes only the caller-facing HTTP surface. **The entire matching/routing/selection/comparison engine is out-of-wire** — the 8 System (21.5, `Response: none`) workers (`run_matching_pipeline`, `rematch_incremental`, `regenerate_matching_results`, `assemble_and_route_wave`, `replenish_wave`, `drain_deferred_queue`, `expire_rfq`, `generate_comparison_statement`), the internal-service read legs, the **DE-1…DE-8** cross-module integrations, and the **emitted domain events** (via the Doc-4B outbox) have **no caller wire** (§8). *Highest-stakes R1: the moat's compute is deliberately not a caller surface.* Caller-visible async operations realize per `Doc-5A §10` (accepted-then-processing; status via reads), never a synchronous facade over the engine.
- **R2 — Dual User actor + Admin + System.** **Buyer User** (authoring/evaluation, buyer controlling-org context) and **Vendor User** (quotation/invitation-response, vendor controlling-org context) carry the server-validated `Iv-Active-Organization` (`Doc-5A §7.3`); **vendor representative action** resolves via a **§6B delegation grant** server-side (`check_permission`, out-of-wire — R1; no delegation wire input). **Admin** (moderation, human-assisted routing, routing-rule control plane) carries **no** org context (`Doc-5A §7.3`/§5.6). **System** is out-of-wire (R1).
- **R3 — `rfq` route prefix** (`Doc-5A Appendix B.1`; `Doc-2 §0.3`).
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs; carried gaps (`[ESC-RFQ-SLUG]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-AUDIT]`) bound by pointer and **escalated, never invented** (`CHK-5A-121/154`; `Doc-4A §6.4`/§18.2).
- **R5 — Non-disclosure is a first-class wire invariant (Doc-3 FIXED).** Blacklist exclusion, capacity **deferral**, and any eligibility-gate failure are **indistinguishable from non-match** on every wire surface — no read, count, list, error, or routing-log field exposes a protected fact (`Doc-3 §2.1/§4.2`; `Doc-2 §10.11`; `Doc-4A §7.5`; `Doc-5A §6.3`). **There is no public RFQ board** — RFQs are *distributed, never published*; **no "discover/list-all open RFQs" endpoint exists** (`Doc-3 §5.1` FIXED). Loss feedback is **banded, never exact** (`Doc-3 §9.5`).
- **R6 — No auto-decision (decision-support boundary, Doc-3 FIXED).** The platform **never auto-recommends or auto-selects a winner**. The comparison statement is read-only decision support; **award is an explicit buyer command** (`award_rfq`); no auto-award, auto-rank-to-winner, or recommendation endpoint (`Doc-3 §9.1` FIXED).
- **R7 — Firewall + three-instrument quota (Doc-3 FIXED; `Doc-4A §4B`).** No plan/payment/entitlement value is ever a wire input to matching/routing/selection; **payment never influences eligibility, scores, confidence, or the fairness ceiling**. Billing quota is **read** as a delivery ceiling / consumed at submission per the **three-instrument accounting identity** (entitlement ≠ delivery ≠ quotation-quota; `Doc-3 §4.1.1`); RFQ owns no monetization ledger (DE-7).

## M3 surface partition (the structural spine)

> **38 Doc-4E contracts** — **30 caller-facing**, **8 out-of-wire** System engine workers. Each row carries an explicit **Doc-5E §** owner; every contract lands in exactly one section. **Section ownership (the § column) is authoritative; within-section grouping is informational.** §3 is the cross-cutting wire model and owns no endpoint.

| Doc-4E contracts | Actor / kind | **Doc-5E §** |
|---|---|---|
| `create_rfq`, `update_rfq`, `submit_rfq`, `approve_rfq`, `reject_internal_rfq`, `cancel_rfq`, `reissue_rfq` | Buyer User command (21.4; §5.4 machine) | **§4** |
| `moderate_rfq` | Admin (21.6, no org context — DE-5) | **§4** |
| `get_rfq`, `list_rfqs`, `get_rfq_version` (caller leg) | Buyer User Query (21.3) — int-svc leg → §8 | **§4** |
| `submit_quotation`, `revise_quotation`, `withdraw_quotation`, `request_late_extension` | Vendor User command (21.4; §5.5 machine; §6B delegation) | **§5** |
| `respond_to_invitation` | Vendor User command (21.4; invitation accept/decline) | **§5** |
| `get_quotation`, `list_quotations_for_rfq` | Vendor/Buyer Query (21.3; `quotation_visibility`-gated) | **§5** |
| `shortlist_quotation`, `manage_clarification`, `invoke_best_and_final`, `award_rfq`, `close_lost_rfq` | Buyer User command (21.4; §5.4 closure) | **§6** |
| `get_comparison_statement` | Buyer User Query (21.3) | **§6** |
| `assist_routing`, `manage_routing_rule` | Admin (21.6, no org context; BC-7 control plane) | **§7** |
| `get_matching_results` (Admin leg), `get_routing_log`, `get_invitation`, `list_invitations` (caller legs) | Admin / Buyer / Vendor Query (21.3) — int-svc legs → §8 | **§7** |
| `run_matching_pipeline`, `rematch_incremental`, `regenerate_matching_results`, `assemble_and_route_wave`, `replenish_wave`, `drain_deferred_queue`, `expire_rfq`, `generate_comparison_statement` | System (21.5, `Response: none`) — the engine | **§8** out-of-wire |
| internal-service read legs of `get_rfq`/`list_rfqs`/`get_rfq_version`/`get_matching_results`/`get_routing_log`/`get_invitation`/`list_invitations` · DE-1…DE-8 integrations · emitted events (outbox) | internal-service / Integration | **§8** out-of-wire |

**Dual-path rule (structural, applies throughout):** where a Doc-4E contract has **both** a caller-facing path and an internal-service path, **§4–§7 realize the caller-facing leg only; the internal-service consumption is §8 out-of-wire** (in-process module composition via `rfq/contracts/`, never HTTP — frozen Doc-5C precedent). Contract count (38) is unchanged — these are legs of existing contracts, not new contracts.

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5E's precedence (… → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-5A → **Doc-5E** → Code); conform to Doc-5A in full + pass Appendix A; realize-never-redecide; flag-and-halt; **Doc-3 operational rules bound by pointer, never re-derived**.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M3 Surface Partition
- **Purpose:** what Doc-5E governs (the M3 caller-facing HTTP surface) and does not; carry the partition table + the **dual-path rule**; the **§1.x dependency boundary** (M3 owns realization only for M3 surfaces; cross-module → owning module's Doc-5x); register carried **DE-1…DE-8** + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]` by pointer.
- **Dependencies:** `Doc-5A §1`; `Doc-4E §E0/§E2`, Appendix C. **Detail:** scope + partition + carried-dependency table. *Section ownership authoritative; within-section grouping informational.*

## §2 — Realized Endpoint Inventory
- **Purpose:** the `rfq`-namespace HTTP surface — one row per **caller-facing** endpoint (the 30): method (§5.2), path grammar (§5.3), actor (buyer/vendor User · Admin) + active-org applicability, async classification (`202` where the engine runs behind a command — §10), success status (§5.5). Command tokens = exact `rfq.<operation>` operation names **verbatim from the Doc-4E PassB Contract-ID** (`rfq.<operation>.v1`).
- **Dependencies:** `Doc-5A §5/§10`, App B.1 (`rfq`); `Doc-4E` PassB Part1–5. **Detail:** inventory table. *Inventory row ordering is non-authoritative.*

## §3 — Cross-Cutting Authorization, Context & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*
- **Section-form authority:** the **frozen `Doc-5C §3` precedent**, grounded in `Doc-5A §7`. Its use here is a **[realization convention]** — M3's four surface sections (§4–§7) all depend on the same dual-actor / active-org / delegation / non-disclosure model; factoring it into §3 prevents a four-way restatement (which would itself violate realize-never-restate). Contradicts nothing upstream.
- **Purpose:** the cross-cutting mechanism §4–§7 depend on: `Authorization` bearer (auth only); **`Iv-Active-Organization` server-validated** for buyer-org and vendor-controlling-org context (R2); vendor representative action via §6B grant — **delegation grants resolved only via Identity `check_permission` (out-of-wire, DE-1); no direct grant inspection; no delegation wire input**; **Admin no-org context**; three-layer authorization server-side (slugs only); and the **R5 non-disclosure invariant** on the wire (blacklist/deferral/gate-fail indistinguishable from non-match; no public board; banded loss). **R7 firewall:** no plan/entitlement value is a wire input to matching/routing.
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §5/§6/§6B/§7.5/§9.7/§4B`; `Doc-4E §E11/§E13`; `Doc-4C §C3/§C9`; `Doc-5C §3` (mechanism-only precedent). **Detail:** cross-cutting wire-model declaration; no endpoint instantiation.

## §4 — RFQ Authoring & Lifecycle Surface Realization
- **Purpose:** BC-1 buyer commands (`create_rfq`; `update_rfq` versioned edit; `submit_rfq`/`approve_rfq`/`reject_internal_rfq`/`cancel_rfq`/`reissue_rfq`) + `moderate_rfq` (Admin, DE-5) + RFQ reads (caller leg); the **§5.4 RFQ state machine** (incl. patched `under_review → draft`, `matching → expired`) as legal transitions only (`Doc-4M`; `Doc-4A §13`); idempotency/concurrency (§9); error mapping (§6); top-level `reference_id`. Submission entering the async engine realizes per §10 (engine itself is §8). **No public board** — `list_rfqs` is buyer-org-scoped only (R5).
- **Dependencies:** `Doc-5A §5/§6/§9/§10`; `Doc-4E §E4`; `Doc-4M`; `Doc-3 §1`. **Detail:** command + read realization.

## §5 — Quotation & Invitation-Response Surface Realization
- **Purpose:** BC-4 vendor quotation commands (`submit_quotation`; `revise_quotation` versioned edit; `withdraw_quotation`; `request_late_extension`) + `respond_to_invitation` + quotation reads (`quotation_visibility`-gated); the **§5.5 Quotation machine** + invitation lifecycle (`Doc-4M`); **§6B representative action** (§3); the **three-instrument quota identity** at submission (R7; DE-7); one-active-quotation-per-vendor-per-RFQ. Vendor-house quotation conflicts surfaced inside the vendor org, **never to the buyer** (R5).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4E §E6 (respond)/§E7`; `Doc-4M`; `Doc-3 §8/§4.1.1`; `Doc-4C §C9`, Billing quota read (DE-7). **Detail:** command + read realization.

## §6 — Buyer Evaluation, Comparison & Closure Surface Realization
- **Purpose:** BC-5/6 buyer decision-**support** commands (`shortlist_quotation`, `manage_clarification`, `invoke_best_and_final`, `award_rfq` → `closed_won`, `close_lost_rfq` → `closed_lost`) + `get_comparison_statement` read; **R6 no-auto-decision** (comparison read-only; award explicit; no auto-winner endpoint); award → engagement hand-off Operations-owned (DE-4, out-of-wire); loss notification + clarification thread Communication-owned (DE-6, emitted event only); closure machine (`Doc-4M`).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4E §E8`; `Doc-4M`; `Doc-3 §9`; DE-4/DE-6 (out-of-wire). **Detail:** command + read realization.

## §7 — Routing Governance & Engine/Routing Reads Surface Realization
- **Purpose:** Admin control-plane commands (`assist_routing` Stage-gated human-assist; `manage_routing_rule` control plane) + observability reads (`get_matching_results` Admin leg, `get_routing_log`, `get_invitation`, `list_invitations` — caller legs); Admin no-org context (R2); `[ESC-RFQ-SLUG]` admin slugs by pointer; **routing-log/matching reads must not expose a protected fact** (R5 — explainability is non-disclosing). The engine these reads observe is §8.
- **Dependencies:** `Doc-5A §5/§6/§7/§8`; `Doc-4E §E5/§E6 (BC-7)`; `Doc-3 §3.6/§12`; `Doc-4A §18/§18B`. **Detail:** Admin command + read realization.

## §8 — Out-of-Wire Boundary (the engine · internal reads · integration · events)
- **Purpose:** declare that the **8 System engine workers**, the **internal-service read legs** (dual-path rule, §1), the **DE-1…DE-8 cross-module integrations**, and the **emitted domain events** (via the Doc-4B outbox) have **no HTTP wire** — async workers / in-process services / outbox emission consumed within other modules' transactions. **RFQ authors no consumer or notification contract** (DE-6 single-authorship; no webhook — subsumed by R1). Caller-visible async results observed via §4–§7 reads (`Doc-5A §10` status pattern), never a synchronous engine facade.
- **Explicit protocol exclusion:** for every §8 mechanism — **no REST endpoint, no SSE/WebSocket stream, no webhook** is defined or may be added. **Comparison generation (`generate_comparison_statement`) is engine computation: no caller-facing endpoint exists or may be added; the buyer reads the *result* via `get_comparison_statement` (§6), not the generation.**
- **Flag-and-halt** if any wire surface (any protocol) is proposed for the engine, the internal reads, or the integrations (architecture change).
- **Dependencies:** `Doc-4E §E5/§E6/§E9/§E10`; `Doc-2 §8`; `Doc-5A §1.3/§10/§11`; `Doc-4B` outbox. **Detail:** boundary statement only — no realization.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-5E's attestation against Doc-5A **Appendix A** (freeze gate); the carried register (DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]`) by pointer with each named channel; statement that Doc-5E coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4E §E0/§E12`, Appendix C. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5E Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M3 surface; the freeze evidence. **Includes a dedicated attestation item for the R5 non-disclosure invariant** (highest-risk M3 audit area), attested against `CHK-5A-050…053` + `Doc-4A §7.5`.
- **Dependencies:** `Doc-5A Appendix A`. **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4E Appendix C — resolved only via named channels, never here)

| ID | Item | Doc-5E handling | Freeze gate? |
|---|---|---|---|
| **DE-1** | Identity (org/membership/`check_permission`/delegation) | Consumed by pointer (Doc-4C); out-of-wire (§8) | **No** |
| **DE-2** | Marketplace vendor data / `vendor_matching_attributes` (moat seam) | **Read** via Marketplace service in the engine (§8); never re-modeled | **No** |
| **DE-3** | Trust signals — firewall | Consumed as gate/scoring inputs in the engine (§8); never mutated (R7) | **No** |
| **DE-4** | Operations CRM + post-award engagement | Buyer CRM read under non-disclosure (§3/R5); engagements by Operations on emitted events (§8) | **No** |
| **DE-5** | Admin moderation + ban | `moderate_rfq` (§4) reflects the Admin decision; ban reflected in the engine (§8) | **No** |
| **DE-6** | Communication (notification + clarification thread) | RFQ emits events only (§8); authors no notification/thread contract; no webhook | **No** |
| **DE-7** | Billing entitlement/quota — firewall | Quota read/consumed per three-instrument identity (R7, §5); no ledger; payment never influences matching | **No** |
| **DE-8** | Platform Core (`core.*`) | Consumed by pointer; events via outbox (§8); audit via `core.append_audit_record` | **No** |
| `[ESC-RFQ-AUDIT]` | Audit actions not separately enumerated in Doc-2 §9 | Bound to nearest §9 action; channel Doc-2 §9 additive; never invented | **No** |
| `[ESC-RFQ-POLICY]` | `rfq.*` POLICY keys | Referenced by exact Doc-3 §12.2 name | **Conditional** — No if all referenced keys exist in Doc-3 §12.2; **blocks** if a content pass references an unregistered key (`CHK-5A-121`; Doc-3 §12.2 additive first) |
| `[ESC-RFQ-SLUG]` | Human-assist / routing-rule admin slugs | Interim `staff_*`; least-privilege slug = future Doc-2 §7 patch; escalate, never invent | **No** |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · re-deriving any Doc-3 operational rule (bound by pointer) · resolving DE-1…DE-8 / `[ESC-RFQ-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving the engine / internal reads / integrations a wire (any protocol) · a public RFQ board or any protected-fact-exposing surface (R5) · an auto-winner/recommendation surface (R6) · any plan/payment input to matching (R7) · coining any endpoint/status/header/error-class/slug/POLICY key/event.

---

*End of Doc-5E Canonical Structure v1.0 (FROZEN) — structure only. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt; Doc-3 operational rules bound by pointer, never re-derived. Authoring history + Hard Review disposition retained in `Doc-5E_Structure_Proposal_v0.1.md` (v0.2). Next: content passes — Pass-1 (§0–§3), Pass-2 (§4–§7), Pass-3 (§8–§9 + Appendix A) — each conforming to this structure.*
