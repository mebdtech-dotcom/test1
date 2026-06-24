# Doc-5E — RFQ Procurement Engine (M3 `rfq`) API Realization — Content v1.0, Pass 1 (§0–§3)

| Field | Value |
|---|---|
| Document | Doc-5E — RFQ Procurement Engine (Module 3) — API Realization |
| Pass | 1 of 3 — §0, §1, §2 (inventory) and §3 (cross-cutting wire model) |
| Status | ACTIVE — Content Pass 1 of 3; §0–§3 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5E_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Module | Module 3 — RFQ Procurement Engine (`rfq` schema) — **the procurement moat** |
| Realizes | `Doc-4E` (M3 contracts, FROZEN — 38 contracts, PassB Part1–5) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4M v1.0, Doc-5A v1.0 (all FROZEN) |
| Contains | Document control + scope/surface-partition + the **30-endpoint** caller-facing inventory + the §3 cross-cutting authorization/context/non-disclosure **wire model** (mechanism only). No §5.7 template instantiations (Pass-2), no out-of-wire realization detail (Pass-3), no schemas, no Doc-3 rule restated |
| Audience | Architecture / API Governance Boards · Doc-5E content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4E fixed *what* each M3 contract declares (FROZEN); Doc-3 owns the procurement logic (bound by pointer, never re-derived); Doc-5A fixed *how* a contract becomes HTTP. Pass-1 fixes Doc-5E's precedence/scope, the **caller-facing endpoint inventory** (method, path, actor, active-org, success) for the **30** caller-facing M3 endpoints, and the **§3 cross-cutting wire model** §4–§7 depend on. It instantiates no full endpoint template (§4–§7), realizes no out-of-wire mechanism (§8), and coins no endpoint/status/header/error-class/slug/POLICY key/event. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5/§6.3/§7/§10` · `Doc-4E §E0–§E2/§E11/§E13` · Appendix B.1 (`rfq`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
- Doc-5E sits one realization level below Doc-5A (`Doc-5A §0.1`):
  ```
  Master → ADR → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-5A → Doc-5E → Code
  ```
- Doc-5E **MUST NOT** override, reinterpret, or weaken any higher document; on conflict the higher prevails and Doc-5E is patched (flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`.

### 0.2 Scope of Authority
- Doc-5E governs **how the FROZEN Doc-4E contracts of Module 3 are realized as concrete HTTP APIs** — the wire layer only.
- It does **not** govern: *what* a contract declares (Doc-4E/Doc-4A); **the procurement logic** (gates/pipeline/fairness/capacity/distribution/scoring/quotation/evaluation/economics — **owned by Doc-3, bound by pointer, never re-derived**); the state machines (Doc-4M); persistence (Doc-6); framework/transport; or the M3 in-process/async mechanisms with no wire (§8).
- **Binds:** `Doc-5A §0.2`; Doc-4E §E0.

### 0.3 Conformance Obligation
- Before freeze, Doc-5E **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) in full. It coins **no** endpoint, status, header, error class, slug, POLICY key, or event (`CHK-5A-121/154`; `Doc-4A §6.4/§16.4`).
- **Binds:** `Doc-5A §0.5`, Appendix A.

### 0.4 Realize-Never-Redecide
- Each realized point binds its Doc-4E / Doc-5A / Doc-3 / corpus owner by pointer; no copy, paraphrase-with-change, or re-decide. Transport-level silence → a `[realization convention]` contradicting nothing upstream. Missing authority ⇒ flag-and-halt (`Doc-5A §0.3`).
- **Binds:** `Doc-5A §0.3`.

---

## §1 — Scope, Audience & M3 Surface Partition

### 1.1 What Doc-5E Governs
- Doc-5E is the **HTTP realization of Module 3's caller-facing contracts** — buyer RFQ authoring/lifecycle/evaluation, vendor quotation/invitation-response, and Admin moderation/routing-governance. No other module's surface.
- Actors (R2): **Buyer User** + **Vendor User** (both server-validated active-org context); **Admin** (no org context — moderation, human-assist, routing-rule control plane); **System** (the engine — out-of-wire, §8).
- **Binds:** `Doc-5A §1`, §7; Doc-4E §E11/§E13.

### 1.2 M3 Surface Partition
The 38 Doc-4E contracts partition by wire-realizability (structure R1) — **30 caller-facing**, **8 out-of-wire** System engine workers (+ internal-service read legs + DE-1…DE-8 + emitted events):

| Doc-4E contracts | Doc-5E treatment |
|---|---|
| §E4 buyer RFQ commands + `moderate_rfq` (Admin) + RFQ reads (caller leg) · §E6/§E7 vendor quotation/invitation commands + reads · §E8 buyer evaluation/closure + comparison read · §E5/§E6 Admin routing governance + observability reads (caller legs) | **Caller-facing HTTP** — realized here (inventory §2; full template §4–§7) |
| §E5/§E6/§E8 **8 System engine workers** (matching/rematch/regenerate/wave-assemble/replenish/drain/expire/comparison-generate) · internal-service read legs · DE-1…DE-8 integrations · emitted events (outbox) | **Out-of-wire** — no HTTP surface (§8); code / Doc-6 |

- **Dual-path rule:** where a contract has both a caller and an internal-service path, §2/§4–§7 realize the **caller leg only**; the internal-service consumption is §8 out-of-wire (in-process via `rfq/contracts/`, never HTTP — frozen Doc-5C precedent). Contract count (38) unchanged.
- **Binds:** `Doc-5E_Structure_v1.0_FROZEN` (partition + dual-path rule); Doc-4E PassB; `Doc-5A §1.3`.

### 1.3 Dependency Boundary
- **M3 owns realization only for M3 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (Identity → Doc-5C; Marketplace → Doc-5D; Trust/Operations/Communication/Billing/Admin → their own). Doc-5E references other modules **by ID / public contract only**; the engine reads them **in-process** (out-of-wire, §8), never as an M3 HTTP endpoint.
- **Binds:** `Doc-5A §1`; structure §1.x.

### 1.4 Audience & Carried Items
- **Audience:** Architecture / API Governance Boards; Doc-5E authors (human + AI); AI Coding Supervisor; backend, QA.
- **Carried (Doc-4E Appendix C — by pointer; resolved only via named channels):** **DE-1** Identity · **DE-2** Marketplace vendor data (moat seam) · **DE-3** Trust signals (firewall) · **DE-4** Operations CRM/engagement · **DE-5** Admin moderation/ban · **DE-6** Communication (no notification/thread contract authored) · **DE-7** Billing entitlement/quota (firewall) · **DE-8** Platform Core · `[ESC-RFQ-AUDIT]` (nearest Doc-2 §9 action) · `[ESC-RFQ-POLICY]` (**conditional gate** — blocks if a content pass references an `rfq.*` key absent from Doc-3 §12.2) · `[ESC-RFQ-SLUG]` (human-assist/routing-rule admin slugs).
- **Binds:** Doc-4E §E0, Appendix C; Doc-2 §7; Doc-3 §12.2.

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace & Path Grammar
- All M3 caller-facing endpoints live under the reserved **`rfq`** route prefix (Appendix B.1; `Doc-2 §0.3`) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. Resource segments are the owning entity tables (`rfqs`, `quotations`, `rfq_invitations`, `routing_rules`), plural **[realization convention]**.
- Command tokens are the **exact `rfq.<operation>` operation names verbatim from the Doc-4E PassB Contract-ID** (`Doc-5A §5.3`) — no shortening, substitution, or invention.
- **Async (R1/§10):** **no caller endpoint returns `202`.** Each command commits its own state transition synchronously (`200`/`201`); the matching/routing/comparison **engine runs as downstream System workers (§8)** and its progress is observed via the §4/§7 **reads** (the RFQ state on `get_rfq`; `get_matching_results`; `get_invitation`; `get_comparison_statement`) — the `Doc-5A §10` status-resource pattern, satisfied by reads, never a synchronous facade over the engine.
- **Binds:** `Doc-5A §5.2/§5.3/§10`, Appendix B.1; Doc-2 §0.3.

### 2.2 Inventory — §4 RFQ Authoring & Lifecycle (11)

| # | Doc-4E Contract-ID | Actor | Method · Path | Active-Org | Success |
|---|---|---|---|---|---|
| 1 | `rfq.create_rfq.v1` | Buyer User | `POST /rfq/rfqs` | Y | `201` |
| 2 | `rfq.update_rfq.v1` | Buyer User | `PATCH /rfq/rfqs/{id}` | Y | `200` |
| 3 | `rfq.submit_rfq.v1` | Buyer User | `POST /rfq/rfqs/{id}/submit_rfq` | Y | `200` |
| 4 | `rfq.approve_rfq.v1` | Buyer User (approver) | `POST /rfq/rfqs/{id}/approve_rfq` | Y | `200` |
| 5 | `rfq.reject_internal_rfq.v1` | Buyer User (approver) | `POST /rfq/rfqs/{id}/reject_internal_rfq` | Y | `200` |
| 6 | `rfq.moderate_rfq.v1` | Admin | `POST /rfq/rfqs/{id}/moderate_rfq` | N (admin) | `200` |
| 7 | `rfq.cancel_rfq.v1` | Buyer User | `POST /rfq/rfqs/{id}/cancel_rfq` | Y | `200` |
| 8 | `rfq.reissue_rfq.v1` | Buyer User | `POST /rfq/rfqs/{id}/reissue_rfq` *(named command on source → new RFQ; §2.5 flag)* | Y | `201` |
| 9 | `rfq.get_rfq.v1` | Buyer User | `GET /rfq/rfqs/{id}` | Y | `200` |
| 10 | `rfq.list_rfqs.v1` | Buyer User | `GET /rfq/rfqs` *(buyer-org-scoped — no public board, R5)* | Y | `200` |
| 11 | `rfq.get_rfq_version.v1` | Buyer User | `GET /rfq/rfqs/{id}/versions/{version_id}` *(nested read — §2.5 flag)* | Y | `200` |

### 2.3 Inventory — §5 Quotation & Invitation-Response (7)

| # | Doc-4E Contract-ID | Actor | Method · Path | Active-Org | Success |
|---|---|---|---|---|---|
| 12 | `rfq.submit_quotation.v1` | Vendor User (or representative §6B) | `POST /rfq/quotations` | Y | `201` |
| 13 | `rfq.revise_quotation.v1` | Vendor User | `PATCH /rfq/quotations/{id}` | Y | `200` |
| 14 | `rfq.withdraw_quotation.v1` | Vendor User | `POST /rfq/quotations/{id}/withdraw_quotation` | Y | `200` |
| 15 | `rfq.request_late_extension.v1` | Vendor User → Buyer approve | `POST /rfq/rfqs/{id}/request_late_extension` | Y | `200` |
| 16 | `rfq.respond_to_invitation.v1` | Vendor User (or representative §6B) | `POST /rfq/rfq_invitations/{id}/respond_to_invitation` | Y | `200` |
| 17 | `rfq.get_quotation.v1` | Vendor / Buyer (visibility-gated) | `GET /rfq/quotations/{id}` | Y | `200` |
| 18 | `rfq.list_quotations_for_rfq.v1` | Buyer / Vendor (visibility-gated) | `GET /rfq/rfqs/{id}/quotations` *(nested — §2.5 flag)* | Y | `200` |

### 2.4 Inventory — §6 Evaluation/Closure (6) & §7 Routing Governance / Reads (6)

| # | Doc-4E Contract-ID | Actor | Method · Path | Active-Org | Success | § |
|---|---|---|---|---|---|---|
| 19 | `rfq.shortlist_quotation.v1` | Buyer User | `POST /rfq/rfqs/{id}/shortlist_quotation` | Y | `200` | §6 |
| 20 | `rfq.manage_clarification.v1` | Buyer User | `POST /rfq/rfqs/{id}/manage_clarification` | Y | `200` | §6 |
| 21 | `rfq.invoke_best_and_final.v1` | Buyer User | `POST /rfq/rfqs/{id}/invoke_best_and_final` | Y | `200` | §6 |
| 22 | `rfq.award_rfq.v1` | Buyer User | `POST /rfq/rfqs/{id}/award_rfq` | Y | `200` | §6 |
| 23 | `rfq.close_lost_rfq.v1` | Buyer User | `POST /rfq/rfqs/{id}/close_lost_rfq` | Y | `200` | §6 |
| 24 | `rfq.get_comparison_statement.v1` | Buyer User | `GET /rfq/rfqs/{id}/comparison_statement` *(nested singleton — §2.5 flag)* | Y | `200` | §6 |
| 25 | `rfq.assist_routing.v1` | Admin | `POST /rfq/rfqs/{id}/assist_routing` | N (admin) | `200` | §7 |
| 26 | `rfq.manage_routing_rule.v1` | Admin | `POST /rfq/routing_rules/{id}/manage_routing_rule` *(create variant → `POST /rfq/routing_rules` `201`; §2.5 flag)* | N (admin) | `200` | §7 |
| 27 | `rfq.get_matching_results.v1` | Admin *(caller leg; int-svc leg → §8)* | `GET /rfq/rfqs/{id}/matching_results` | N (admin) | `200` | §7 |
| 28 | `rfq.get_routing_log.v1` | Admin / Buyer | `GET /rfq/rfqs/{id}/routing_log` | Y / N | `200` | §7 |
| 29 | `rfq.get_invitation.v1` | Vendor / Buyer / Admin | `GET /rfq/rfq_invitations/{id}` | Y / N | `200` | §7 |
| 30 | `rfq.list_invitations.v1` | Vendor / Buyer / Admin | `GET /rfq/rfqs/{id}/invitations` *(nested — §2.5 flag)* | Y / N | `200` | §7 |

### 2.5 Inventory Notes
- **Methods (§5.2):** create → `POST` collection (`201` + `Location`); partial non-state edit (`update_rfq`, `revise_quotation`) → `PATCH` item; state-transition / domain command → `POST` named sub-resource; read → `GET`. No `PUT`; no soft-delete `DELETE` on this surface (RFQ/quotation terminal states are reached by named state commands — `cancel_rfq`, `withdraw_quotation` — not row deletes; Doc-3 §1.6 terminal-no-reopen).
- **Success (§5.5):** creates (`create_rfq`, `submit_quotation`) + `reissue_rfq` (new RFQ) → `201`; all other commands + reads → `200`. **No `202`** (§2.1 — engine is downstream/out-of-wire, observed via reads).
- **Active-Org:** buyer/vendor ops carry the server-validated `Iv-Active-Organization` (§3.3); **Admin** ops (`moderate_rfq`, `assist_routing`, `manage_routing_rule`, `get_matching_results`) carry **none** (§7.3). Mixed Y/N reads (`get_routing_log`/`get_invitation`/`list_invitations`) carry org context on the buyer/vendor leg, none on the Admin leg.
- **⚠ Nested / source-addressing [realization convention] — flagged for Hard Review:** child reads and the reissue command address a child or derived resource under the RFQ aggregate — `get_rfq_version` (`…/rfqs/{id}/versions/{version_id}`), `list_quotations_for_rfq` (`…/rfqs/{id}/quotations`), `get_comparison_statement` (`…/rfqs/{id}/comparison_statement` singleton), `list_invitations` (`…/rfqs/{id}/invitations`), `reissue_rfq` (named command on the source RFQ producing a new aggregate, `201`), `manage_routing_rule` (named command + create variant). Realized as nested reads / named commands under the owning aggregate; *alternative: flat collections with an `{rfq_id}` filter*. Surfaced, not silently fixed.
- The full §5.7 template instantiation is authored in **§4–§7** (Pass-2) — not here.
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7`, §7.3, §10; Doc-4E PassB Part1–5.

---

## §3 — Cross-Cutting Authorization, Context & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*

> §3 realizes the **mechanism** every §4–§7 endpoint depends on; it binds `Doc-5A §7.1–§7.6` + §6.3 by pointer and states the M3-specific application. **Instantiates no endpoint.** Section-form authority = the frozen `Doc-5C §3` precedent ([realization convention] — prevents four-way restatement across §4–§7).

### 3.1 Authentication Carriage (§7.1)
- Authenticated principal in the **`Authorization`** bearer — **authentication only** (`Doc-5A §7.1`); credential/session mechanics out of scope (Identity/Supabase Auth — DE-1).
- **Binds:** `Doc-5A §7.1`; `Doc-4A §5.1`.

### 3.2 Actor-Type Determination (§7.2)
- M3 actor types — **Buyer User**, **Vendor User**, **Admin** (`staff_*`), **System** (out-of-wire) — are **server-determined**; no field/header asserts actor type (`Doc-5A §7.2`; `Doc-4A §9.7`). Buyer vs vendor is the **role of the active org relative to the RFQ** (controlling buyer org vs invited vendor org), resolved server-side.
- **Binds:** `Doc-5A §7.2`; `Doc-4A §5.2`; Doc-4E §E11.

### 3.3 Active-Organization Context (§7.3) — R2
- A buyer/vendor operation executes within a **server-validated active organization** carried in **`Iv-Active-Organization`** (org `UUIDv7`) — a **context selector, never a trusted assertion**: the server validates the principal's active membership before any business processing (CONTEXT category, §3.6; `Doc-5A §7.3`; `Doc-4A §5.3`). Buyer contracts scope to the **buyer controlling org**; vendor contracts to the **vendor controlling org** (records owned by the active org — `Master Architecture` Invariant 5). **Admin** governance carries **no** org context (`Doc-5A §7.3`/§5.6).
- **Binds:** `Doc-5A §7.3`; `Doc-4A §5.3/§5.6/§9.7`; Doc-4E §E11.

### 3.4 Delegation Context (§7.4) — R2/R5
- Vendor **representative action** (a controlling org acting for a vendor profile via a §6B delegation grant) is **resolved server-side inside Identity `check_permission` (out-of-wire, DE-1)** — **no grant id, `permission_set`, scope, or attribution is ever a wire input; Doc-5E performs no direct grant inspection** (`Doc-5A §7.4`; `Doc-4A §6B/§9.7`). One vendor = one active quotation regardless of representative count; representative conflicts surface **inside the vendor's own house, never to the buyer** (non-disclosure, R5; Doc-3 §2.8).
- **Binds:** `Doc-5A §7.4`; `Doc-4A §6B`; `Doc-4C §C9` (consumed); Doc-3 §2.8.

### 3.5 Authorization Realization (§7.5)
- Authorization is **server-side** — three-layer check (active Membership + Permission Slug + Resource Scope) **OR** an active delegation grant — from the §3.1–§3.4 context (`Doc-5A §7.5`; `Doc-4A §6.1`). Slugs (`can_create_rfq`, `can_award_rfq`, `can_submit_quote`, `staff_can_moderate_rfq`, …) are **never** wire inputs (`Doc-4A §6.2`); resolution is consumed from Identity (no shadow authorization). `[ESC-RFQ-SLUG]` admin slugs bound by pointer (R4).
- **Binds:** `Doc-5A §7.5`; `Doc-4A §6.1/§6.2/§9.7`; Doc-2 §7; Doc-4E §E11.

### 3.6 Non-Disclosure on the Wire (§6.3) — R5 (first-class M3 invariant)
- The Doc-3 FIXED non-disclosure invariant is realized as a **wire indistinguishability requirement** (`Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §10.11`): blacklist exclusion, capacity **deferral**, and any eligibility-gate failure are **indistinguishable from non-match** — **no read, count, list, error, or routing-log field exposes a protected fact**; a record outside the caller's entitlement returns a `404` identical in status, body, and timing to genuinely-absent.
- **No public RFQ board** — RFQs are *distributed, never published*; **no discover/list-all-open-RFQs endpoint exists** for vendors; `list_rfqs` is buyer-org-scoped only (`Doc-3 §5.1` FIXED). Loss feedback is **banded, never exact** (`Doc-3 §9.5`). Routing/matching reads (§7) expose explainability that is **non-disclosing** (no gated-out vendor, no deferral reason that identifies a protected fact).
- **R7 firewall (§4B):** no plan/payment/entitlement value is ever a wire input to matching/routing/selection; payment never influences eligibility, scores, confidence, or fairness.
- **Binds:** `Doc-5A §6.3`; `Doc-4A §7.5/§4B`; `Doc-2 §10.11`; `Doc-3 §2.1/§4.2/§5.1/§9.5`.

### 3.7 Context Validation Position (§7.6)
- Carried context validated in the fixed **CONTEXT category** of the universal order (`Doc-5A §7.6`; `Doc-4A §11.2`, position 2) — before AUTHZ/SCOPE/DELEGATION/STATE/REF/BUSINESS and any semantic processing; Doc-5E maps the resulting failure to its §6 status and **MUST NOT** reorder/merge/short-circuit (disclosure control).
- **Binds:** `Doc-5A §7.6`; `Doc-4A §11.2`.

---

*End of Doc-5E Content v1.0, Pass 1 (§0–§3). Document control, scope/surface-partition, the 30-entry caller-facing inventory, and the §3 cross-cutting authorization/context/non-disclosure wire model (mechanism only) — no §5.7 template instantiation, no out-of-wire realization (§8), no schemas, no Doc-3 rule restated; engine async observed via reads (no caller `202`); nested/source addressing flagged; nothing coined. §4 (RFQ lifecycle), §5 (quotation/invitation), §6 (evaluation/closure), §7 (routing governance/reads) follow in Pass-2; §8 (out-of-wire) + §9 (conformance) + Appendix A in Pass-3, each conforming to `Doc-5E_Structure_v1.0_FROZEN.md`.*
