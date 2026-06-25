# Doc-5I — Monetization / Billing (M7 `billing`) API Realization — Content v1.0 Pass-1

| Field | Value |
|---|---|
| Document | Doc-5I — Monetization / Billing (M7 `billing`) — API Realization — Content v1.0 Pass-1 |
| Status | **CONTENT IN PROGRESS — Pass-1 patched (Hard Review 0 BLOCKER · 0 MAJOR · 4 MINOR · 3 NITPICK resolved; ready for Pass-2)** |
| Pass-1 scope | §0 Document Control · §1 Scope & Partition · §2 Inventory (26 endpoints) · §3 Cross-Cutting Wire Model |
| Structure anchor | `Doc-5I_Structure_v1.0_FROZEN.md` (FROZEN 2026-06-26) — **partition table governs; any inventory conflict → partition wins** |
| Authority | `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4I_FROZEN_v1.0`; `Doc-5I_Structure_v1.0_FROZEN.md` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`; `ADR_Compendium_v1`; Doc-2 v1.0.3; Doc-3 v1.0.2; Doc-4A v1.0; Doc-4I v1.0; Doc-5A v1.0 |
| Pass-2 will cover | §4 BC-BILL-1 Plans & Entitlements · §5 BC-BILL-2 Subscriptions · §6 BC-BILL-3 Usage & Quota |
| Pass-3 will cover | §7 BC-BILL-4 Lead Credits · §8 BC-BILL-5 Platform Invoicing · §9 BC-BILL-6 Rewards & Referrals · §10 Out-of-Wire · §11 Conformance · Appendix A |

---

## §0 — Document Control, Precedence & Conformance Obligation

### §0.1 Precedence Chain

All conflicts are resolved in this order (higher rank wins; no lower rank may override a higher):

```
Master_System_Architecture_v1.0_FINAL
  → ADR_Compendium_v1
    → Doc-2 v1.0.3  (platform canonical data model + events + state machines)
    → Doc-3 v1.0.2  (POLICY keys + non-functional rules)
    → Doc-4A v1.0   (API metastandard — HTTP conventions for all modules)
    → Doc-4I v1.0   (M7 domain model — FROZEN; what the 32 contracts do)
    → Doc-5A v1.0   (API realization standard — how contracts become HTTP endpoints)
    → Doc-5I v1.0   (this document — realizes M7 on the wire)
      → Code
```

Doc-5I may not modify, extend, or contradict any document above it in this chain. On any conflict: **Flag-and-Halt** — cite both sources, escalate to Architecture Board; never resolve locally.

### §0.2 Realize-Never-Redecide

Doc-4I (FROZEN) decided *what* M7's 32 contracts declare. Doc-5A (FROZEN) decided *how* a contract becomes a concrete HTTP endpoint. Doc-5I **realizes** the caller-facing 26 contracts on the wire — it does not redecide actors, aggregates, invariants, state-machine edges, permission slugs, domain events, or POLICY keys. Every statement in Doc-5I binds to a frozen anchor; any uncarried gap is escalated, never filled locally.

### §0.3 Conformance Obligation

Doc-5I must pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before content freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). The Appendix A attestation table (§11 + Appendix A) is the formal freeze gate. Doc-5I **coins nothing** — no endpoint path not derivable from Doc-5A §5.3, no HTTP status code, no response header, no error class, no permission slug, no POLICY key, no Doc-2 §8 event.

### §0.4 Flag-and-Halt Triggers

Stop immediately and escalate to Architecture Board if any change would:
- Add a caller wire to any of the 6 out-of-wire contracts (R1/§10)
- Add a caller/tenant wire to `billing.record_payment.v1` (R8)
- Add a caller HTTP wire to `billing.resolve_entitlements.v1` or `billing.enforce_quota.v1` (R10)
- Use any billing state to gate trust/verification/eligibility/routing/matching (R5)
- Conflate `billing.platform_invoices` with `operations.trade_invoices` (R6)
- Modify a state-machine edge defined in `Doc-2 §5.7` or `Doc-2 §3.8` (R7)
- Coin any permission slug, audit action, POLICY key, or Doc-2 §8 event
- Introduce cross-module table access
- Route the System leg of any R11 actor-branched contract through the User-leg HTTP endpoint as a server-to-server caller — System legs are always in-process, never HTTP callers (`R11`)

---

## §1 — Scope, Audience & M7 Surface Partition

### §1.1 What Doc-5I Governs

Doc-5I governs the M7 **caller-facing HTTP surface** — the 26 endpoints across BC-BILL-1 (Plans & Entitlements), BC-BILL-2 (Subscriptions), BC-BILL-3 (Usage & Quota), BC-BILL-4 (Lead Credits), BC-BILL-5 (Platform Invoicing & Payments), and BC-BILL-6 (Rewards & Referrals). Actors on the wire: **User**, **Admin** (BC-BILL-1 catalog governance), **actor-branched User/System** (BC-BILL-4/5/6 commands; R11). No public/anonymous surface.

Surface counts: **26 caller-facing + 6 out-of-wire = 32** (matches `Doc-4I_FROZEN_v1.0` total; partition table in `Doc-5I_Structure_v1.0_FROZEN.md` is authoritative).

### §1.2 What Doc-5I Does Not Govern

| Out-of-scope | Authority |
|---|---|
| The 6 out-of-wire contracts (`renew_subscription`, `expire_subscription`, `record_usage`, `enforce_quota`, `resolve_entitlements`, `record_payment`) | `Doc-5I §10` (boundary declaration only) |
| DB schema, Prisma models, Inngest job implementation | Doc-6; implementation code |
| The consuming-module surfaces (M2 entitlement checks, M3 quota checks) | `Doc-5D`, `Doc-5E` (owning Doc-5x) |
| Any other module's HTTP surface | Owning module's Doc-5x |
| Platform Core infra (audit write, outbox, UUIDv7, POLICY) | `Doc-4B`; DF-BILL-8 |
| Resolving `DF-BILL-1…8`, `[ESC-BILL-*]` carried items | Named channels only (Doc-4I PassA §A8) |

### §1.3 Module Dependency Boundary

M7 realizes only M7 surfaces. Cross-module interactions are by service call or event, never by shared table or foreign key.

| Dependency | Direction | Channel | Doc-5I handling |
|---|---|---|---|
| **M1 Identity** — `check_permission`, org resolution, `Iv-Active-Organization` | M7 consumes | Service call (`Doc-4C §C3/§C8`) | Authorization via `check_permission`; no M1 surface realized (§3.2) |
| **M2 Marketplace** — consumes `billing.resolve_entitlements.v1` for ad/microsite gate | M2 consumes M7 | Service call (R10/§10) | `resolve_entitlements` = service authority; no M2 surface realized here |
| **M3 RFQ** — consumes `billing.enforce_quota.v1` for quota gate | M3 consumes M7 | Service call (R10/§10) | `enforce_quota` = service authority; no M3 surface realized here |
| **M4 Operations** — disjoint invoice boundary | Boundary guard only | R6/FIXED; DF-BILL-5 | `billing.platform_invoices ≠ operations.trade_invoices`; no M4 surface realized |
| **M6 Communication** — consumes `SubscriptionPurchased`/`Renewed`/`Expired` | M6 consumes M7 event | Outbox → Inngest (R9; Doc-4B) | Events emitted via outbox by BC-BILL-2; no M6 surface realized |
| **M8 Admin** — governs BC-BILL-1 catalog commands (platform-staff actor) | M8 governs | `[ESC-BILL-SLUG]` (DF-BILL-7) | No M8 surface realized; Admin actor interim by pointer |

### §1.4 Carried Dependencies Register

Resolved only via named channels — **never in Doc-5I content**. Presence here acknowledges the open seam; nothing is finalized or invented.

| ID | Seam | Channel | Gate? |
|---|---|---|---|
| **DF-BILL-1** | Identity — `check_permission` / active-org / Controlling Organization | `Doc-4C §C3/§C8`; service call | No |
| **DF-BILL-2** | Marketplace — `resolve_entitlements` consumption (DD-5) | R10/§10; service call | No |
| **DF-BILL-3** | RFQ — `enforce_quota` consumption; `QuotationSubmitted` event (source = `rfq_response`) | R10/§10; RFQ-owned event | No |
| **DF-BILL-4** | Lead access debit signals from Marketplace/RFQ | `[ESC-BILL-EVENT]`; System actor R11 | No |
| **DF-BILL-5** | Operations invoice boundary — disjoint aggregate guard (R6/FIXED; Doc-5F DF-6) | R6 fence; §8 wire constraint | No |
| **DF-BILL-6** | Communication — `SubscriptionPurchased`/`Renewed`/`Expired` fan-out | Outbox R9; Doc-5H DF-COMM | No |
| **DF-BILL-7** | Admin catalog governance — BC-BILL-1 Admin actor slug | `[ESC-BILL-SLUG]`; Doc-2 §7 additive | No |
| **DF-BILL-8** | Platform Core — audit write, outbox, UUIDv7, POLICY flags | `Doc-4B`; in-process; not re-implemented | No |
| `[ESC-BILL-AUDIT]` | Doc-2 §9 — subscription expiry, catalog, usage recording not enumerated | Doc-2 §9 additive; nearest action by pointer | No |
| `[ESC-BILL-POLICY]` | Doc-3 §12.2 — no `billing` POLICY namespace key registered | Doc-3 §12.2 additive | **Tracked** |
| `[ESC-BILL-SLUG]` | Doc-2 §7 — no catalog-management slug for Admin BC-BILL-1 | Doc-2 §7 additive | No |
| `[ESC-BILL-EVENT]` | Doc-2 §8 — lead-access and ad/microsite metering signals have no §8 event | Doc-2 §8 additive if required | No |

---

## §2 — Realized Endpoint Inventory

**Ordering is non-authoritative and informational only. Section ownership (partition table in `Doc-5I_Structure_v1.0_FROZEN.md`) is authoritative — on any conflict, the partition table wins. Inventory order never implies lifecycle order.**

All 26 endpoints instantiate the `Doc-5A §5.7` contract template. Paths use **hyphen-case** per URL convention; contract tokens use **underscore** per `Doc-4A §21` convention. Version is the `Iv-Api-Version` header (`Doc-5A §12`) — **never a path segment**. All endpoints require authentication (`Authorization: Bearer <token>`) and `Iv-Active-Organization` (server-validated, never client-trusted).

| # | Contract token | Method | Path | Actor | Success |
|---|---|---|---|---|---|
| **BC-BILL-1 — Plans & Entitlements (§4)** |||||
| 1 | `billing.create_plan.v1` | `POST` | `/billing/plans` | Admin | `201` |
| 2 | `billing.update_plan.v1` | `POST` | `/billing/plans/{plan_id}/update-plan` | Admin | `200` |
| 3 | `billing.retire_plan.v1` | `POST` | `/billing/plans/{plan_id}/retire-plan` | Admin | `200` |
| 4 | `billing.bundle_plan_entitlement.v1` | `POST` | `/billing/plans/{plan_id}/bundle-plan-entitlement` | Admin | `200` |
| 5 | `billing.create_entitlement.v1` | `POST` | `/billing/entitlements` | Admin | `201` |
| 6 | `billing.update_entitlement.v1` | `POST` | `/billing/entitlements/{entitlement_id}/update-entitlement` | Admin | `200` |
| 7 | `billing.get_plan.v1` | `GET` | `/billing/plans/{plan_id}` | User / Admin | `200` |
| 8 | `billing.list_plans.v1` | `GET` | `/billing/plans` | User / Admin | `200` |
| **BC-BILL-2 — Subscriptions (§5)** |||||
| 9 | `billing.purchase_subscription.v1` | `POST` | `/billing/subscriptions` | User | `201` |
| 10 | `billing.cancel_subscription.v1` | `POST` | `/billing/subscriptions/{subscription_id}/cancel-subscription` | User | `200` |
| 11 | `billing.get_subscription.v1` | `GET` | `/billing/subscriptions/{subscription_id}` | User | `200` |
| 12 | `billing.list_subscription_events.v1` | `GET` | `/billing/subscriptions/{subscription_id}/events` | User | `200` |
| **BC-BILL-3 — Usage & Quota (§6)** |||||
| 13 | `billing.get_usage.v1` | `GET` | `/billing/usage` | User | `200` |
| **BC-BILL-4 — Lead Credits (§7)** |||||
| 14 | `billing.credit_lead_account.v1` | `POST` | `/billing/lead-account/credit-lead-account` | User / System† | `200` |
| 15 | `billing.debit_lead_account.v1` | `POST` | `/billing/lead-account/debit-lead-account` | User / System† | `200` |
| 16 | `billing.get_lead_balance.v1` | `GET` | `/billing/lead-account` | User | `200` |
| 17 | `billing.list_lead_transactions.v1` | `GET` | `/billing/lead-account/transactions` | User | `200` |
| **BC-BILL-5 — Platform Invoicing & Payments (§8)** |||||
| 18 | `billing.issue_platform_invoice.v1` | `POST` | `/billing/invoices` | User / System† | `201` |
| 19 | `billing.update_invoice_status.v1` | `POST` | `/billing/invoices/{invoice_id}/update-invoice-status` | User / System† | `200` |
| 20 | `billing.get_platform_invoice.v1` | `GET` | `/billing/invoices/{invoice_id}` | User | `200` |
| 21 | `billing.list_platform_invoices.v1` | `GET` | `/billing/invoices` | User | `200` |
| **BC-BILL-6 — Rewards & Referrals (§9)** |||||
| 22 | `billing.credit_reward.v1` | `POST` | `/billing/reward-account/credit-reward` | User / System† | `200` |
| 23 | `billing.track_referral.v1` | `POST` | `/billing/referrals` | User / System† | `201` |
| 24 | `billing.advance_referral.v1` | `POST` | `/billing/referrals/{referral_id}/advance-referral` | User / System† | `200` |
| 25 | `billing.get_reward_balance.v1` | `GET` | `/billing/reward-account` | User | `200` |
| 26 | `billing.list_referrals.v1` | `GET` | `/billing/referrals` | User | `200` |

> † **Actor-branched (R11):** "User / System†" = one contract-ID; **User leg** = this HTTP endpoint (caller wire); **System leg** = in-process call (no HTTP wire). The System leg is the background/event-triggered invocation; the User leg is the caller-facing endpoint listed here. Counted once in the partition.

**Inventory count verification:** 8 (BC-BILL-1) + 4 (BC-BILL-2) + 1 (BC-BILL-3) + 4 (BC-BILL-4) + 4 (BC-BILL-5) + 5 (BC-BILL-6) = **26 caller-facing** ✓

---

## §3 — Cross-Cutting Actor, Billing Firewall & Non-Disclosure Wire Model

> **This section is a mechanism section — it owns no endpoint. Every rule stated here is binding on all content in §4–§9. Content pass authors MUST NOT redeclare these rules per-section; they bind by reference to this section.**

---

### §3.1 Actor & Active-Org Declaration

**Binding for all M7 endpoints. Stated once here; not restated per-section.**

| Actor | Identity source | Scope | Applicable endpoints |
|---|---|---|---|
| **User** | `Authorization: Bearer <token>` → Identity `sub`; `Iv-Active-Organization` header → server-validated `org_id` (never client-trusted; `Doc-4A §5.3`) | Authenticated org member; own-org billing data | All User-actor endpoints (§4 reads, §5, §6, §7, §8, §9) |
| **Admin** | Same bearer; platform-staff flag resolved by `check_permission` against `[ESC-BILL-SLUG]` (DF-BILL-7) | Platform-wide catalog governance; can read any org | BC-BILL-1 Admin catalog commands (§4); `get_plan`/`list_plans` (§4 reads) |
| **System (in-process)** | No HTTP bearer; actor-branched System leg invoked in-process by background job or event handler | Internal context only; never a tenant HTTP caller | Actor-branched commands — System leg only; out-of-wire contracts (§10) |
| **Public / Anonymous** | **FORBIDDEN.** No M7 endpoint is publicly accessible. | — | — |

**`Iv-Active-Organization` server-validation rule (binding):**
The `org_id` on every billing record is resolved server-side from the bearer token's Identity session + the `Iv-Active-Organization` header verified against the session. A client-supplied `org_id` in the request body is **never trusted as the billing entity owner**; the server-resolved org_id is authoritative for all ownership checks, audit, and metering. Violation = architecture defect; Flag-and-Halt.

---

### §3.2 Authorization Wire Model

**`check_permission` is the sole authorization authority for all M7 caller-facing surfaces. No parallel, shadow, role-check bypass, or caller-supplied authorization path is permitted (`Doc-4A §5.3`, `Doc-4A §6`).**

Authorization pattern (applies to every M7 endpoint):

```
check_permission({
  actor_id:  <resolved from bearer token — Identity sub>
  org_id:    <server-validated Iv-Active-Organization>
  resource:  'billing'
  action:    <slug — see §3.6 per-read disclosure-scope register (reads) and §3.7 per-command actor-side register (commands)>
}) → { permitted: boolean }
```

If `permitted = false` → `403 FORBIDDEN` (never `404`; billing access denial is not a privacy concern).

**Slug availability by actor:**

| Actor | Slug | Status |
|---|---|---|
| User — reads | `can_view_billing` | Frozen in `Doc-2 §7` |
| User — commands | `can_manage_billing` | Frozen in `Doc-2 §7` |
| User — catalog reads (`get_plan`, `list_plans`) | Authentication only (Platform-Public catalog; no billing slug required; any authenticated User may read the plan catalog) | `Doc-4I §HB-1.2` |
| Admin — catalog commands | `[ESC-BILL-SLUG]` — no catalog-governance slug frozen in `Doc-2 §7` today; interim: platform-admin gate resolved via `check_permission` against the platform-staff predicate pending Doc-2 §7 additive | `[ESC-BILL-SLUG]` carried |

No slug may be invented. If `[ESC-BILL-SLUG]` resolves before content freeze, the affected §4 contracts bind the registered slug. If not resolved at content freeze: `[ESC-BILL-SLUG]` remains TRACKED; this does not block content freeze.

---

### §3.3 Billing Firewall Wire Constraints (R5 — binding; `DG-7`)

**These are wire-level constraints. No content section may introduce a surface that violates them. Each is a Flag-and-Halt trigger.**

| Constraint ID | Wire rule | Authority |
|---|---|---|
| **BF-1** | No `billing.*` state (subscription status, plan tier, quota consumed, invoice status, lead balance, reward balance) appears in any request or response header used for routing, matching, ranking, or supplier selection outside M7 | R5; `DG-7`; `Doc-4I` module invariant |
| **BF-2** | `billing.enforce_quota.v1` is a quota-enforcement gate only — it is **never** a routing, eligibility, ranking, or procurement-award factor; consuming modules check it as a yes/no gate at specific submit points, not as a procurement signal | R5/R10; `Doc-4I §HB-3.2` |
| **BF-3** | No M7 BC computes, stores, or re-publishes any Trust Score, Performance Score, Verification Record, or Governance Signal; no `trust.*` or `operations.*` aggregate is referenced in any M7 response | R5; `Master_System_Architecture §5` (governance firewall) |
| **BF-4** | BC-BILL-1/3/4/5/6 emit **no** `Doc-2 §8` event; the only M7 `Doc-2 §8` events are from BC-BILL-2 (`SubscriptionPurchased`/`Renewed`/`Expired`) | R9; `Doc-4I` module invariant |
| **BF-5** | `billing.platform_invoices` surfaces (`billing.issue_platform_invoice.v1`, `billing.get_platform_invoice.v1`, `billing.list_platform_invoices.v1`) expose **platform-fee invoices only** — no trade invoice field, no buyer↔vendor settlement amount, no escrow reference | R6/FIXED; `Doc-4I §H.2` |

---

### §3.4 State Machine Authorities & Controlling Organization

**Edges are sourced from the frozen Doc-2 corpus. Doc-4M is the cross-module state-map index — it points to the edge authority, it does not define the edges. No edge may be added or modified in Doc-5I. Illegal transition → `409 STATE`; lost race → `409 CONFLICT`.**

#### Subscription State Machine (BC-BILL-2; `Doc-2 §5.7`)

```
State transitions — edges from Doc-2 §5.7; Doc-4M = index only:

  [new]           ──[purchase_subscription  §5 / User]──► pending_payment
  pending_payment ──[record_payment         §10/ R8  ]──► active
  active          ──[renew_subscription     §10/ Sys  ]──► active    (period-end renew; emits SubscriptionRenewed)
  active          ──[expire_subscription    §10/ Sys  ]──► expired   (period-end; emits SubscriptionExpired)
  expired         ──[purchase_subscription  §5 / User ]──► pending_payment   [repurchase]

  cancel_subscription (§5 / User): FLAG SET ONLY — NOT a state transition.
    Sets auto_renew = false on the active subscription; state STAYS active.
    The subscription runs to its current period end.
    expire_subscription (System job, §10) fires INDEPENDENTLY at period end
    and drives active → expired regardless of whether cancel was called.
    cancel_subscription has NO arc on the state machine.
```

Per-edge attribution table:

| Edge | Contract | Trigger | Wire? |
|---|---|---|---|
| new → `pending_payment` | `billing.purchase_subscription.v1` | User HTTP call (§5) | **Yes — caller wire** |
| `pending_payment` → `active` | `billing.record_payment.v1` | Payment-gateway callback (§10/R8) | **No — gateway infra** |
| `active` → `active` (renew) | `billing.renew_subscription.v1` | System period-end job (§10) | **No — in-process** |
| `active`: sets `auto_renew=false` | `billing.cancel_subscription.v1` | User HTTP call (§5) | **Yes — caller wire** |
| `active` → `expired` | `billing.expire_subscription.v1` | System period-end job (§10) | **No — in-process** |
| `expired` → `pending_payment` (repurchase) | `billing.purchase_subscription.v1` | User HTTP call (§5) | **Yes — caller wire** |

#### Plans State Machine (BC-BILL-1; `Doc-2 §3.8`)

```
  create_plan (Admin, §4)
  ──────────────► draft ──── update_plan (Admin, §4; activate) ──► active
                    │                                                   │
                    └──── retire_plan (Admin, §4) ──────────────────► retired (terminal)
                                        ▲
                                        │
                                   (from active)
```

Per-edge attribution table:

| Edge | Contract | Trigger | Note |
|---|---|---|---|
| new → `draft` | `billing.create_plan.v1` | Admin HTTP call (§4) | Initial state |
| `draft` → `active` | `billing.update_plan.v1` | Admin HTTP call (§4) | Publish/activate mutation |
| `active`/`draft` → `retired` | `billing.retire_plan.v1` | Admin HTTP call (§4) | Terminal; irreversible |

#### Controlling Organization (DF-BILL-1; `Doc-4I §H.3`)

The **Controlling Organization** is the Identity-resolved billing entity — the `org_id` that owns all billing aggregates. It is always the **server-validated active org** for User-initiated calls (`Iv-Active-Organization`). For System metering calls (BC-BILL-3 `record_usage`), it is resolved independently from the usage event context.

Ownership anchors: `subscriptions.organization_id`, `usage_ledger.organization_id`, `platform_invoices.organization_id`, `lead_credit_transactions.organization_id`, `reward_transactions.organization_id`.

**Rule:** Any write to a billing aggregate that does not match the Controlling Organization resolved from the server-validated session is rejected → `403 FORBIDDEN` (authorization rejection — **not** `404 NOT_FOUND`, **not** `422 VALIDATION`; the `404` convention is reserved for the non-disclosure pattern on reads per §3.5). The `org_id` is never accepted from the caller's request body as an ownership claim — it is always server-derived.

---

### §3.5 Non-Disclosure Wire Model

**Source:** `Doc-5A §6.3/§7`; `Doc-4A §7.5`.

For **Own-Org** scoped reads: if the requested resource exists but belongs to a **different org** (cross-tenant), the response **MUST** be `404 NOT_FOUND` — **not** `403 FORBIDDEN`. This is the non-disclosure convention: a tenant must not be able to confirm the existence of another tenant's billing data.

| Scenario | Response |
|---|---|
| Resource exists, belongs to active org | `200 OK` with body |
| Resource does not exist | `404 NOT_FOUND` |
| Resource exists, belongs to a **different org** | `404 NOT_FOUND` (NOT `403`) |
| Requesting user lacks `can_view_billing` | `403 FORBIDDEN` |
| Admin reading any org's data | `200 OK` (Admin scope is platform-wide; non-disclosure does not apply to Admin) |

**Platform-Public catalog reads** (`get_plan`, `list_plans`): non-disclosure does not apply — plans are platform-owned, not org-owned. Any authenticated User may read them.

---

### §3.6 Per-Read Disclosure-Scope Register (binding)

**Every read in §4–§9 declares exactly one disclosure scope. Ambiguity = content blocker (`Doc-5I_Structure_v1.0_FROZEN.md §3`).**

| Contract token | Disclosure scope | Scope note |
|---|---|---|
| `billing.get_plan.v1` | **Platform-Public** | Any authenticated User reads; Admin unrestricted; `NOT_FOUND` only if `plan_id` does not exist |
| `billing.list_plans.v1` | **Platform-Public** | Any authenticated User reads active plans; Admin platform-wide; filtered states (e.g. retired) declared in §4 per `Doc-4I §HB-1.2` |
| `billing.get_subscription.v1` | **Own-Org** | User reads own active org's subscription; cross-org → `NOT_FOUND`; Admin reads any org (§3 cross-cutting grant) |
| `billing.list_subscription_events.v1` | **Own-Org** | Parent subscription must belong to active org; cross-org → `NOT_FOUND`; Admin reads any org (§3 cross-cutting grant) |
| `billing.get_usage.v1` | **Own-Org** | User reads own org's usage ledger; cross-org → `NOT_FOUND`; Admin reads any org (§3 cross-cutting grant) |
| `billing.get_lead_balance.v1` | **Own-Org** | User reads own org's lead credit account (singleton per org); Admin reads any org (§3 cross-cutting grant) |
| `billing.list_lead_transactions.v1` | **Own-Org** | User reads own org's lead credit transaction history; Admin reads any org (§3 cross-cutting grant) |
| `billing.get_platform_invoice.v1` | **Own-Org** | User reads own org's platform invoices; cross-org → `NOT_FOUND`; Admin reads any org (§3 cross-cutting grant) |
| `billing.list_platform_invoices.v1` | **Own-Org** | User reads own org's platform invoice list; Admin reads any org (§3 cross-cutting grant) |
| `billing.get_reward_balance.v1` | **Own-Org** | User reads own org's reward account balance (singleton per org); Admin reads any org (§3 cross-cutting grant) |
| `billing.list_referrals.v1` | **Own-Org** | User reads own org's referral records; Admin reads any org (§3 cross-cutting grant) |

---

### §3.7 Per-Command Actor-Side Register (binding)

**Every command in §4–§9 declares exactly one actor side. Ambiguity = content blocker (`Doc-5I_Structure_v1.0_FROZEN.md §3`). Actor-branched commands (†) have one contract-ID, two actor types — the User leg is the caller HTTP wire; the System leg is in-process.**

| Contract token | Actor side | Slug (User leg) | Note |
|---|---|---|---|
| `billing.create_plan.v1` | **Admin** | `[ESC-BILL-SLUG]` (platform-staff predicate per `Doc-4A §5.3`; no frozen Doc-2 §7 catalog slug) | Plan creates at `draft`; idempotency key on Admin create |
| `billing.update_plan.v1` | **Admin** | `[ESC-BILL-SLUG]` | Metadata + activation mutation; plans machine edge (draft→active on publish) |
| `billing.retire_plan.v1` | **Admin** | `[ESC-BILL-SLUG]` | Terminal state command (`active`/`draft` → `retired`); irreversible |
| `billing.bundle_plan_entitlement.v1` | **Admin** | `[ESC-BILL-SLUG]` | Associates entitlement definition to plan; idempotent |
| `billing.create_entitlement.v1` | **Admin** | `[ESC-BILL-SLUG]` | Entitlement catalog creation |
| `billing.update_entitlement.v1` | **Admin** | `[ESC-BILL-SLUG]` | Entitlement catalog mutation |
| `billing.purchase_subscription.v1` | **User** | `can_manage_billing` | Creates subscription at `pending_payment`; emits `SubscriptionPurchased` on payment confirm (R9); idempotency key required |
| `billing.cancel_subscription.v1` | **User** | `can_manage_billing` | Sets `auto_renew=false`; subscription runs to period end; no Doc-2 §8 event (R9) |
| `billing.credit_lead_account.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | User: admin top-up; System: auto-credit on qualifying action; append-only ledger |
| `billing.debit_lead_account.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | User: manual debit; System: auto-debit on lead access (`[ESC-BILL-EVENT]`); append-only ledger |
| `billing.issue_platform_invoice.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | Creates `billing.platform_invoices` record only — never `operations.trade_invoices` (R6/FIXED) |
| `billing.update_invoice_status.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | Invoice state transition (per `Doc-4I §HB-5.2`); `record_payment` drives `pending → paid` (§10/R8) |
| `billing.credit_reward.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | Reward credit; append-only `reward_transactions` |
| `billing.track_referral.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | Creates referral record; referral machine initial state |
| `billing.advance_referral.v1` | **actor-branched† (User / System)** | `can_manage_billing` (User leg); in-process (System leg) | Referral state advance (edges `Doc-2 §10.8` / `Doc-4I §HB-6.2`) |

**Actor-side count verification:** 6 Admin + 2 User + 7 actor-branched = **15 commands** ✓

---

*Pass-1 patched (Hard Review resolved: m-01 Admin cross-cutting uniform; m-02 write-rejection 403; m-03 list_plans behavioral claim removed; m-04 cancel diagram corrected; NP-01/02/03 applied). §0–§3 + §2 inventory (26 endpoints) complete. §3 binding registers locked: 11 read scopes + 15 command actor-sides. Pass-2 covers §4 (BC-BILL-1), §5 (BC-BILL-2), §6 (BC-BILL-3).*
