# Doc-5E — RFQ Procurement Engine (M3 `rfq`) API Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review applied** (3 MAJOR + 6 MINOR + 4 NITPICK dispositioned, §Review Disposition). Freeze-ready; promotable to Structure FROZEN |
| Module | Module 3 — RFQ Procurement Engine (`rfq` schema) — **the procurement moat** |
| Realizes | `Doc-4E` (M3 contracts, FROZEN — 38 contracts, PassB Part1–5) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B`/`Doc-5C` (FROZEN) — out-of-wire boundary (R1); **`Doc-5C §3` is the frozen precedent for a mechanism-only cross-cutting section** + User-primary/active-org surface (R2); force derives from `Doc-5A §1.3/§5/§7/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, **Doc-4E v1.0 (FROZEN — M3 contracts)**, Doc-4M v1.0 (FROZEN — state machines), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (section-pointer column), ratified realization decisions, carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5E content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-4E fixed *what* M3's 38 contracts declare (FROZEN); Doc-3 owns the procurement logic (gates, pipeline order, fairness, capacity, distribution, scoring, quotation, evaluation, economics — by pointer); Doc-5A fixed *how* a contract becomes HTTP. Doc-5E realizes Doc-4E's **caller-facing** surface on the wire and re-decides nothing.
2. **Conformance is an obligation.** Doc-5E passes the Doc-5A **Appendix A** checklist before freeze. It coins no endpoint, status, header, error class, permission slug, or POLICY key.

---

## Decisions ratified at structure freeze (proposed)

- **R1 — Out-of-wire boundary (Doc-5B/5C precedent; authority `Doc-5A §1.3/§5/§11`).** Doc-5E realizes only the caller-facing HTTP surface. **The entire matching/routing/selection/comparison engine is out-of-wire** — the 8 System (21.5, `Response: none`) workers (`run_matching_pipeline`, `rematch_incremental`, `regenerate_matching_results`, `assemble_and_route_wave`, `replenish_wave`, `drain_deferred_queue`, `expire_rfq`, `generate_comparison_statement`), the internal-service read legs, the **DE-1…DE-8** cross-module integrations, and the **emitted domain events** (via the Doc-4B outbox) have **no caller wire** (§8). *This is the highest-stakes R1 yet: the moat's compute is deliberately not a caller surface — buyers/vendors trigger lifecycle transitions; the engine runs asynchronously behind them.* Async caller-visible operations realize per `Doc-5A §10` (accepted-then-processing; status via reads), never a synchronous facade over the engine.
- **R2 — Dual User actor + Admin + System.** **Buyer User** (RFQ authoring/evaluation, buyer controlling-org context) and **Vendor User** (quotation/invitation-response, vendor controlling-org context) both carry the server-validated `Iv-Active-Organization` (`Doc-5A §7.3`); **vendor representative action** resolves via a **§6B delegation grant** server-side (`check_permission`, out-of-wire — R1; no delegation wire input). **Admin** (moderation, human-assisted routing, routing-rule control plane) carries **no** org context (`Doc-5A §7.3`/§5.6). **System** is out-of-wire (R1).
- **R3 — `rfq` route prefix** (`Doc-5A Appendix B.1`; `Doc-2 §0.3`).
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs (`can_create_rfq`, `can_award_rfq`, `can_submit_quote`, `staff_can_moderate_rfq`, …); carried gaps (`[ESC-RFQ-SLUG]` human-assist/routing-rule admin slugs; `[ESC-RFQ-POLICY]` `rfq.*` keys; `[ESC-RFQ-AUDIT]` actions) bound by pointer and **escalated, never invented** (`CHK-5A-121/154`; `Doc-4A §6.4`/§18.2).
- **R5 — Non-disclosure is a first-class wire invariant (Doc-3 FIXED).** Blacklist exclusion, capacity **deferral**, and any eligibility-gate failure are **indistinguishable from non-match** on every wire surface — no read, count, list, error, or routing-log field exposes a protected fact (`Doc-3 §2.1/§4.2`; `Doc-2 §10.11`; `Doc-4A §7.5`; `Doc-5A §6.3`). **There is no public RFQ board** — RFQs are *distributed, never published*; **no "discover/list-all open RFQs" endpoint exists** for vendors (`Doc-3 §5.1` FIXED). Loss feedback is **banded, never exact** (`Doc-3 §9.5`).
- **R6 — No auto-decision (decision-support boundary, Doc-3 FIXED).** The platform **never auto-recommends or auto-selects a winner**. The comparison statement is read-only decision support; **award is an explicit buyer command** (`award_rfq`); there is no auto-award, auto-rank-to-winner, or recommendation endpoint (`Doc-3 §9.1` FIXED).
- **R7 — Firewall + three-instrument quota (Doc-3 FIXED; `Doc-4A §4B`).** No plan/payment/entitlement value is ever a wire input to matching/routing/selection; **payment never influences eligibility, scores, confidence, or the fairness ceiling**. Billing quota (`monthly_rfq_limit`) is **read** as a delivery ceiling / consumed at submission per the **three-instrument accounting identity** (entitlement ≠ delivery ≠ quotation-quota; no single event consumes more than one — `Doc-3 §4.1.1`); RFQ owns no monetization ledger (DE-7).

---

## M3 surface partition (the structural spine)

> **38 Doc-4E contracts** (PassB Part1–5) — **30 caller-facing**, **8 out-of-wire** System engine workers. Each row carries an explicit **Doc-5E §** owner; every contract lands in exactly one section. §3 is the cross-cutting wire model and owns no endpoint.

| Doc-4E contracts | Actor / kind | **Doc-5E §** |
|---|---|---|
| `create_rfq`, `update_rfq`, `submit_rfq`, `approve_rfq`, `reject_internal_rfq`, `cancel_rfq`, `reissue_rfq` | Buyer User command (21.4; §5.4 machine) | **§4** |
| `moderate_rfq` | Admin (21.6, no org context — DE-5) | **§4** |
| `get_rfq`, `list_rfqs`, `get_rfq_version` (caller leg) | Buyer User Query (21.3) — **int-svc leg → §8** | **§4** |
| `submit_quotation`, `revise_quotation`, `withdraw_quotation`, `request_late_extension` | Vendor User command (21.4; §5.5 machine; §6B delegation) | **§5** |
| `respond_to_invitation` | Vendor User command (21.4; invitation accept/decline) | **§5** |
| `get_quotation`, `list_quotations_for_rfq` | Vendor/Buyer Query (21.3; `quotation_visibility`-gated) | **§5** |
| `shortlist_quotation`, `manage_clarification`, `invoke_best_and_final`, `award_rfq`, `close_lost_rfq` | Buyer User command (21.4; §5.4 closure) | **§6** |
| `get_comparison_statement` | Buyer User Query (21.3) | **§6** |
| `assist_routing`, `manage_routing_rule` | Admin (21.6, no org context; BC-7 control plane) | **§7** |
| `get_matching_results` (Admin leg), `get_routing_log`, `get_invitation`, `list_invitations` (caller legs) | Admin / Buyer / Vendor Query (21.3) — **int-svc legs → §8** | **§7** |
| `run_matching_pipeline`, `rematch_incremental`, `regenerate_matching_results`, `assemble_and_route_wave`, `replenish_wave`, `drain_deferred_queue`, `expire_rfq`, `generate_comparison_statement` | System (21.5, `Response: none`) — the engine | **§8** out-of-wire |
| **internal-service read legs** of `get_rfq`/`list_rfqs`/`get_rfq_version`/`get_matching_results`/`get_routing_log`/`get_invitation`/`list_invitations` · DE-1…DE-8 integrations · emitted events (outbox) | internal-service / Integration | **§8** out-of-wire |

**Dual-path rule (structural, applies throughout):** where a Doc-4E contract has **both** a caller-facing path and an internal-service path, **§4–§7 realize the caller-facing leg only; the internal-service consumption is §8 out-of-wire** (in-process module composition via `rfq/contracts/`, never HTTP — frozen Doc-5C precedent). Contract count (38) is unchanged — these are legs of existing contracts, not new contracts. §3 is the cross-cutting wire model and owns no endpoint.

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5E's precedence (… → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-5A → **Doc-5E** → Code); conform to Doc-5A in full + pass Appendix A; realize-never-redecide; flag-and-halt; **Doc-3 operational rules bound by pointer, never re-derived**.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M3 Surface Partition
- **Purpose:** what Doc-5E governs (the M3 caller-facing HTTP surface) and does not; carry the partition table; the **§1.x dependency boundary** (M3 owns realization only for M3 surfaces; cross-module → owning module's Doc-5x — Identity Doc-5C, Marketplace Doc-5D, Trust/Ops/Comms/Billing/Admin their own); register carried **DE-1…DE-8** + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]` by pointer (resolved only via Doc-4E/Doc-2/Doc-3 channels).
- **Dependencies:** `Doc-5A §1`; `Doc-4E §E0/§E2`, Appendix C. **Detail:** scope + partition + carried-dependency table. *Section ownership (the Doc-5E § column) is authoritative; the grouping of contracts within the partition rows is informational.*

## §2 — Realized Endpoint Inventory
- **Purpose:** the `rfq`-namespace HTTP surface — one row per **caller-facing** endpoint (the 30): method (§5.2), path grammar (§5.3), actor (buyer/vendor User · Admin) + active-org applicability, async classification (`202` where the engine runs behind a command — §10), success status (§5.5). Command tokens = exact `rfq.<operation>` operation names **verbatim from the Doc-4E PassB Contract-ID** (`rfq.<operation>.v1`).
- **Dependencies:** `Doc-5A §5/§10`, App B.1 (`rfq`); `Doc-4E` PassB Part1–5. **Detail:** inventory table (paths in content pass). *Inventory row ordering is non-authoritative.*

## §3 — Cross-Cutting Authorization, Context & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*
- **Section-form authority:** a standalone mechanism-only cross-cutting section is the **frozen `Doc-5C §3` precedent**, grounded in `Doc-5A §7` (identity/context/authorization carriage). Its use here is a **[realization convention]**: M3's four surface sections (§4–§7) all depend on the same dual-actor / active-org / delegation / non-disclosure model — factoring it into §3 prevents a four-way restatement (which would itself violate realize-never-restate). It contradicts nothing upstream.
- **Purpose:** the cross-cutting mechanism §4–§7 depend on: `Authorization` bearer (auth only); **`Iv-Active-Organization` server-validated** for buyer-org and vendor-controlling-org context (R2); vendor **representative action via §6B delegation grant** — **delegation grants are resolved only via Identity `check_permission` (out-of-wire, DE-1); Doc-5E performs no direct grant inspection and accepts no delegation wire input**; **Admin no-org context** (moderation/routing governance); the three-layer authorization check server-side (slugs only, never a wire input); and the **R5 non-disclosure invariant on the wire** — blacklist/deferral/gate-fail indistinguishable from non-match across reads/counts/errors/logs, no public RFQ-board discovery, banded loss feedback (`Doc-5A §6.3/§7`; `Doc-3 §2.1/§4.2/§9.5`; `Doc-2 §10.11`; `Doc-4A §7.5`). **R7 firewall:** no plan/entitlement value is ever a wire input to matching/routing.
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §5/§6/§6B/§7.5/§9.7/§4B`; `Doc-4E §E11/§E13`; `Doc-4C §C3/§C9` (check_permission, delegation — consumed); `Doc-5C §3` (mechanism-only precedent). **Detail:** cross-cutting wire-model declaration; no endpoint instantiation.

## §4 — RFQ Authoring & Lifecycle Surface Realization
- **Purpose:** BC-1 buyer commands (`create_rfq` create; `update_rfq` versioned edit; `submit_rfq`/`approve_rfq`/`reject_internal_rfq`/`cancel_rfq`/`reissue_rfq` state commands) + `moderate_rfq` (Admin, DE-5) + RFQ reads; the **§5.4 RFQ state machine** (incl. patched `under_review → draft`, `matching → expired` edges) realized as legal transitions only (`Doc-4M`; `Doc-4A §13`); idempotency/concurrency (§9); error mapping (§6); top-level `reference_id`. Submission emitting `RFQSubmitted` and entering the async engine is realized per §10 (the engine itself is §8). **No public board** — `list_rfqs` is buyer-org-scoped only (R5).
- **Dependencies:** `Doc-5A §5/§6/§9/§10`; `Doc-4E §E4`; `Doc-4M`; `Doc-3 §1`. **Detail:** command + read realization.

## §5 — Quotation & Invitation-Response Surface Realization
- **Purpose:** BC-4 vendor quotation commands (`submit_quotation` create; `revise_quotation` versioned edit; `withdraw_quotation` state command; `request_late_extension`) + `respond_to_invitation` (accept/formal-decline) + quotation reads (`quotation_visibility`-gated); the **§5.5 Quotation machine** + invitation lifecycle (`Doc-4M`); **§6B representative action** (vendor controlling-org owns; representative via delegation — §3); the **three-instrument quota identity** at submission (R7 — quota read/consumed, never a ledger write; DE-7); one-active-quotation-per-vendor-per-RFQ; idempotency/concurrency/error. Vendor-house quotation conflicts surfaced inside the vendor org, **never to the buyer** (non-disclosure, R5).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4E §E6 (respond)/§E7`; `Doc-4M`; `Doc-3 §8/§4.1.1`; `Doc-4C §C9` (delegation), Billing quota read (DE-7). **Detail:** command + read realization.

## §6 — Buyer Evaluation, Comparison & Closure Surface Realization
- **Purpose:** BC-5/6 buyer decision-**support** commands (`shortlist_quotation`, `manage_clarification`, `invoke_best_and_final`, `award_rfq` → `closed_won`, `close_lost_rfq` → `closed_lost`) + `get_comparison_statement` read; **R6 no-auto-decision** (comparison is read-only support; award is an explicit command; no auto-winner endpoint); award → engagement hand-off is **Operations-owned** (DE-4, out-of-wire); loss notification is **Communication-owned** (DE-6, emitted event only); the clarification/best-and-final **thread channel is Communication-owned** (DE-6) — §6 realizes the buyer-evaluation command surface only, binding the thread by pointer; closure state machine (`Doc-4M`); idempotency/concurrency/error.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4E §E8`; `Doc-4M`; `Doc-3 §9`; DE-4/DE-6 (out-of-wire). **Detail:** command + read realization.

## §7 — Routing Governance & Engine/Routing Reads Surface Realization
- **Purpose:** the Admin control-plane commands (`assist_routing` — Stage-gated human-assist within the forbidden-actions wall; `manage_routing_rule` — `routing_rules` control plane) + the observability reads (`get_matching_results` Admin leg, `get_routing_log`, `get_invitation`, `list_invitations`); Admin no-org context (R2); `[ESC-RFQ-SLUG]` admin slugs bound by pointer; **routing-log/matching reads must not expose a protected fact** (R5 — deferral/blacklist/gate-fail invisible; explainability is non-disclosing). The matching/routing **engine** that these reads observe is §8 (out-of-wire).
- **Dependencies:** `Doc-5A §5/§6/§7/§8`; `Doc-4E §E5/§E6 (BC-7)`; `Doc-3 §3.6/§12`; `Doc-4A §18/§18B`. **Detail:** Admin command + read realization.

## §8 — Out-of-Wire Boundary (the engine · internal reads · integration · events)
- **Purpose:** declare that the **8 System engine workers** (matching pipeline, incremental rematch, regenerate, wave assemble/replenish/drain, expire, comparison generation), the **internal-service read legs** (of `get_rfq`/`list_rfqs`/`get_rfq_version`/`get_matching_results`/`get_routing_log`/`get_invitation`/`list_invitations` — the dual-path rule, §1), the **DE-1…DE-8 cross-module integrations** (Identity/Marketplace/Trust/Operations/Admin/Communication/Billing/Core consumption + the emitted-event consumer legs), and the **emitted domain events** (`RFQCreated`/`RFQSubmitted`/`RFQMatched`/`RFQRouted`/`VendorInvited`/`QuotationSubmitted`/`RFQClosedWon`/`RFQClosedLost`/… via the Doc-4B outbox) have **no HTTP wire** — async workers / in-process services / outbox emission consumed within other modules' transactions. **RFQ authors no consumer or notification contract** (DE-6 single-authorship; no webhook — subsumed by R1: integrations have no wire). Caller-visible async results are observed via the §4–§7 reads (`Doc-5A §10` status pattern), never a synchronous engine facade.
- **Explicit protocol exclusion (defense-in-depth):** for every §8 mechanism — engine workers, internal-service reads, and DE-1…DE-8 integrations — **no REST endpoint, no SSE/WebSocket stream, and no webhook** is defined or may be added. **Comparison generation (`generate_comparison_statement`) is engine computation: no caller-facing endpoint exists or may be added; the buyer reads the *result* via `get_comparison_statement` (§6), which is not the generation.**
- **Flag-and-halt** if any wire surface (any protocol) is proposed for the engine, the internal reads, or the integrations — an architecture change.
- **Dependencies:** `Doc-4E §E5/§E6/§E9/§E10`; `Doc-2 §8` (event catalog); `Doc-5A §1.3/§10/§11`; `Doc-4B` outbox. **Detail:** boundary statement only — no realization.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-5E's attestation against Doc-5A **Appendix A** (freeze gate); the carried register (DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]`) by pointer with each named channel; statement that Doc-5E coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4E §E0/§E12`, Appendix C. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5E Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M3 surface; the freeze evidence. **Includes a dedicated attestation item for the R5 non-disclosure invariant** (the highest-risk M3 audit area — blacklist/deferral/gate-fail indistinguishability across every read/count/error/log; no public board; banded loss), attested against `CHK-5A-050…053` + `Doc-4A §7.5`.
- **Dependencies:** `Doc-5A Appendix A`. **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4E Appendix C — resolved only via named channels, never here)

| ID | Item | Doc-5E handling | Freeze gate? |
|---|---|---|---|
| **DE-1** | Identity (org/membership/`check_permission`/delegation) | Consumed by pointer (Doc-4C); out-of-wire resolution (§8); no Identity surface realized | **No** |
| **DE-2** | Marketplace vendor data / `vendor_matching_attributes` read-model (moat seam) | **Read** via Marketplace service in the engine (§8, out-of-wire); RFQ never re-models vendor data | **No** |
| **DE-3** | Trust signals (verification/scores/verified tier) — firewall | Consumed as gate/scoring inputs in the engine (§8); never mutated (R7) | **No** |
| **DE-4** | Operations CRM (buyer status/blacklist) + post-award engagement | Buyer CRM read under non-disclosure (§3/R5); `engagements` created by Operations on emitted events (§8) | **No** |
| **DE-5** | Admin moderation + ban | `moderate_rfq` (§4) reflects the Admin decision; ban reflected as eligibility fail (engine, §8) | **No** |
| **DE-6** | Communication (notification fan-out + clarification thread) | RFQ emits events only (§8); authors no notification/thread contract (single-authorship); no webhook | **No** |
| **DE-7** | Billing entitlement/quota — firewall | Quota read/consumed at submission per three-instrument identity (R7, §5); no ledger owned; payment never influences matching | **No** |
| **DE-8** | Platform Core (`core.*` audit/outbox/id/POLICY/flags) | Consumed by pointer; events via outbox (§8); audit via `core.append_audit_record` | **No** |
| `[ESC-RFQ-AUDIT]` | Audit actions not separately enumerated in Doc-2 §9 (moderation-reject, coverage-exhausted, incremental-rematch, buyer_directed) | Bound to nearest Doc-2 §9 action by pointer; channel Doc-2 §9 additive; never invented | **No** |
| `[ESC-RFQ-POLICY]` | `rfq.*` POLICY keys | Referenced by exact Doc-3 §12.2 name; if a key is absent, carry — never invent (Doc-3 §12.2 additive) | **Conditional** — No if all referenced keys exist in Doc-3 §12.2; **blocks** if a content pass references an unregistered key (`CHK-5A-121`; Doc-3 §12.2 additive registration required first) |
| `[ESC-RFQ-SLUG]` | Human-assist / routing-rule admin slugs | Interim `staff_*` authority; least-privilege slug = future Doc-2 §7 patch; escalate, never invent | **No** |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · re-deriving any Doc-3 operational rule (gates/pipeline/fairness/capacity/distribution/scoring/quotation/evaluation — bound by pointer) · resolving DE-1…DE-8 / `[ESC-RFQ-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving the engine / internal reads / integrations a wire · a public RFQ board or any protected-fact-exposing surface (R5) · an auto-winner/recommendation surface (R6) · any plan/payment input to matching (R7) · coining any endpoint/status/header/error-class/slug/POLICY key/event.

---

## Structure self-audit (for the Hard Review gate)

| Check | Result |
|---|---|
| Every Doc-4E caller-facing contract assigned to exactly one §4–§7 section (partition § column) | ✅ — 30 caller-facing → §4(11)/§5(7)/§6(6)/§7(6) |
| Every System engine worker + internal leg + integration assigned to §8 out-of-wire | ✅ — 8 System + internal/integration/events |
| Total = 38 (matches Doc-4E PassB Part1–5) | ✅ |
| The matching/routing/selection/comparison **engine** is out-of-wire (R1) | ✅ — highest-stakes R1; moat compute not a caller surface |
| Buyer + Vendor User actors + Admin (no-org) + System (out-of-wire) all placed (R2) | ✅ |
| Delegation: vendor representative action via §6B grant, server-side; no wire input (R2/§3) | ✅ |
| Non-disclosure first-class: no public board, deferral/blacklist/gate-fail invisible, banded loss (R5) | ✅ — §3 + §4/§7 |
| No-auto-decision: comparison read-only, award explicit command, no recommendation endpoint (R6) | ✅ — §6 |
| Firewall + three-instrument quota: no payment input to matching; quota read/consumed only (R7) | ✅ — §3/§5 |
| Async engine realized per §10 (no synchronous facade) | ✅ — §2/§4/§8 |
| Carried DE-1…DE-8 + `[ESC-RFQ-*]` by pointer; none resolved here | ✅ |
| Nothing coined; `rfq` prefix + `rfq_` codes bound to registries; no event coined | ✅ — R3/R4 |
| Section count: **10 (§0–§9) + App A**; 30 caller-facing grouped into 4 realization sections (§4–§7) | ✅ — compressed, not per-contract |
| Dual-path rule stated (§1); int-svc legs → §8 (M-03) | ✅ |

---

## Review Disposition (Independent Hard Review v0.1 → v0.2)

| Finding | Sev | Disposition |
|---|---|---|
| **M-01** §8 "R8-in-R1" — R8 undefined | MAJOR | **FIXED** — replaced with "subsumed by R1: integrations have no wire." No R8. |
| **M-02** self-audit count "9 (§0–§8)" | MAJOR | **FIXED** — §9 exists; corrected to "10 (§0–§9) + App A." |
| **M-03** `get_rfq`/`list_rfqs`/`get_rfq_version` int-svc legs absent from §8 | MAJOR | **FIXED** — partition + §8 split the int-svc legs (matching the `get_matching_results` treatment); added the **dual-path structural rule** (§1) covering all dual caller+internal contracts. Contract count unchanged (38). |
| **m-01** `[ESC-RFQ-POLICY]` gate ambiguous | MINOR | **FIXED** — "Conditional — blocks if a content pass references an unregistered key (CHK-5A-121)." |
| **m-02** Conforms-To omits Doc-4E | MINOR | **FIXED** — Doc-4E v1.0 (FROZEN) added. |
| **m-03** §3 section-form authority not cited | MINOR | **FIXED** — cited frozen `Doc-5C §3` precedent + `Doc-5A §7`; marked `[realization convention]` (prevents four-way restatement). |
| **m-04** §3 delegation explicit | MINOR | **FIXED** — "delegation grants resolved only via Identity `check_permission`; no direct grant inspection; no delegation wire input." |
| **m-05** §8 protocol exclusions | MINOR | **FIXED** — explicit "no REST/SSE/WebSocket/webhook" for engine workers + integrations. |
| **m-06** comparison-generation exclusion | MINOR | **FIXED** — §8: generation is engine computation, no caller endpoint; buyer reads the *result* via `get_comparison_statement` (§6). |
| **NP-01** footer "+ inventory" redundant | NIT | **FIXED** — "Pass-1 = §0–§3." |
| **NP-02** inventory ordering | NIT | **FIXED** — §2: "Inventory row ordering is non-authoritative." |
| **NP-03** section ownership authoritative | NIT | **FIXED** — §1: "Section ownership authoritative; within-section grouping informational." |
| **NP-04** non-disclosure attestation item | NIT | **FIXED** — Appendix A dedicated R5 non-disclosure attestation item (CHK-5A-050…053 + Doc-4A §7.5). |

**Proposed gate:** Hard Review v0.1 applied (3 MAJOR + 6 MINOR + 4 NITPICK resolved). Promotable to `Doc-5E_Structure_v1.0_FROZEN` (authoring history retained here).

---

*End of Doc-5E Structure Proposal v0.2 — Hard Review applied. Structure only. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt; Doc-3 operational rules bound by pointer, never re-derived. Next: promote to `Doc-5E_Structure_v1.0_FROZEN`, then compressed content passes (Pass-1 = §0–§3; Pass-2 = §4–§7; Pass-3 = §8–§9 + Appendix A — three passes given the moat's size), each conforming to the frozen structure.*
