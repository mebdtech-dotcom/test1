# Doc-5I — Monetization / Billing (M7 `billing`) API Realization — Structure v1.0 FROZEN

| Field | Value |
|---|---|
| Document | Doc-5I — Monetization / Billing (Module 7) — API Realization — Structure |
| Status | **FROZEN** — 2026-06-26 |
| Supersedes | `Doc-5I_Structure_Proposal_v0.1.md` (effective v0.2); authoring history retained in Proposal v0.2 + `Doc-5I_Structure_Independent_Hard_Review_v1.0.md` + `Doc-5I_Structure_Patch_v1.0.md` |
| Freeze Evidence | `Doc-5I_Structure_Freeze_Audit_v1.0.md` — 6 audit dimensions PASS; 0 open findings |
| Module | Module 7 — Monetization / Billing (`billing` schema; `billing_` namespace) |
| Realizes | `Doc-4I v1.0` (FROZEN — **32 contracts**, PassB BC-BILL-1…6 per-Contract-ID blocks) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B` (M0) out-of-wire boundary (R1); `Doc-5C` (M1) cross-cutting context/non-disclosure wire model; `Doc-5D` (M2) per-read disclosure-scope + per-command actor-side (§3 origin); `Doc-5F` (M4) two-sided actor + state-machine authority; `Doc-5H` (M6) inbound-gateway-callback fence (R8 precedent) |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN — Platform Core consumed), Doc-4C v1.0 (FROZEN — Identity consumed), Doc-4I v1.0 (FROZEN), Doc-4M v1.0 (FROZEN — cross-module state-map index; billing edges defined in Doc-2 §5.7/§3.8/§10.8 + Doc-4I), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (with §-pointer column), ratified realization decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5I content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape this document:

1. **Realize, never re-decide.** Doc-4I fixed *what* M7's 32 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Doc-5I realizes Doc-4I's caller-facing surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4I / corpus by pointer.
2. **Conformance is an obligation.** Doc-5I passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, POLICY key, or event.

---

## Decisions ratified at structure freeze

- **R1 — Out-of-wire boundary.** Doc-5I realizes only the caller-facing HTTP surface. The following **6 contracts have no caller wire** and are documented as the out-of-wire boundary (§10): `billing.renew_subscription.v1` and `billing.expire_subscription.v1` (System period-end jobs — BC-BILL-2), `billing.record_usage.v1` (System metering — BC-BILL-3), `billing.enforce_quota.v1` (entitlement-bounded quota check; internal service authority — BC-BILL-3), `billing.resolve_entitlements.v1` (entitlement-resolution authority; consumed cross-module via service call — BC-BILL-2), and `billing.record_payment.v1` (**payment-gateway callback — inbound infrastructure, explicitly NOT a Doc-2 §8 domain event** — BC-BILL-5). **Flag-and-halt if a caller wire is proposed for any of them.** No provisional classification gate required — `resolve_entitlements` and `enforce_quota` are definitively out-of-wire (confirmed: both internal-service authorities with no tenant HTTP caller, per `Doc-4I_FROZEN_v1.0` purpose declarations). (Authority `Doc-5A §1.3/§5/§11`; Doc-5B/5C/5F/5H R1 precedent.)

- **R2 — Multi-actor: User + Admin + System; no public.** **User** (`can_view_billing` / `can_manage_billing` from Doc-2 §7 — the only two frozen `billing`-domain slugs) acting inside a server-validated active org (`Iv-Active-Organization`, never client-trusted — `Doc-4A §5.3`; `Doc-5A §7`); **Admin** (platform-staff, `[ESC-BILL-SLUG]` for catalog-governance actions — no catalog-management slug frozen in Doc-2 §7) for BC-BILL-1 catalog commands; **System** (period-end, metering, gateway callback) for out-of-wire contracts (R1). **No public/anonymous surface.** Actor-branched contracts (F4I-PA-M1 resolution) have one contract-ID serving multiple actors — the **User actor leg has the caller-facing HTTP wire**; the System actor leg is in-process (background job or event-triggered). Counted once as caller-facing; per-command actor-side declared per §3.

- **R3 — `billing` route prefix = `billing.` Contract-ID token (no split).** Unlike M6's `communication`/`comm.` deliberate split, M7 uses **`billing` for both** — `Doc-5A Appendix B.1` registers the M7 route namespace `billing` (identical to the Contract-ID token prefix `billing.`; `Doc-2 §0.3`; `Doc-4I` namespace). **Path grammar (§5.3) derives from the route prefix `billing`.** The `billing` namespace is immutable after structure freeze. Coins neither.

- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs (`can_view_billing`, `can_manage_billing`), §9 audit actions, and the §8 event catalog; carried gaps are bound by pointer and **escalated, never invented**: `[ESC-BILL-SLUG]` (Doc-2 §7 — no catalog-management slug for Admin BC-BILL-1 operations; frozen slugs are `can_view_billing`/`can_manage_billing` only), `[ESC-BILL-AUDIT]` (Doc-2 §9 — subscription expiry, plan/entitlement catalog, and usage-recording actions not separately enumerated; `[ESC-BILL-AUDIT]` carried per frozen Doc-4I), `[ESC-BILL-POLICY]` (Doc-3 §12.2 — no `billing` POLICY namespace key registered), `[ESC-BILL-EVENT]` (Doc-2 §8 — lead-access and advertising/microsite metering signals have no §8 emission event today; `[ESC-BILL-EVENT]` carried per frozen Doc-4I) — `CHK-5A-121` (anti-invention) · `CHK-5A-154` (namespace token) · `Doc-4A §6.4/§18.2`.

- **R5 — Billing firewall (governance-signal protection; DG-7).** **No plan, subscription, quota, lead credit, invoice, reward, or referral action influences matching / routing / ranking / supplier-selection / award / procurement-eligibility.** No BC computes, owns, or modifies any Trust / Performance / Verification / Governance score. Billing meters and charges; it never decides procurement and never gates trust/verification/eligibility/routing/matching. Realized as §3 wire constraints, never a gating header or param.

- **R6 — Platform invoice ≠ trade invoice (FIXED from Doc-4I).** BC-BILL-5 owns **platform-fee invoices only** — no trade invoice, no escrow, no wallet, no fund custody, no buyer↔vendor settlement. `billing.platform_invoices` and `operations.trade_invoices` are disjoint. Content must not conflate them or allow cross-write.

- **R7 — Subscription + Plans state machine authority (Doc-2 §5.7/§3.8; Doc-4M = cross-module state-map index).** **Subscription machine (BC-BILL-2):** `billing.purchase_subscription.v1` → creates subscription at `pending_payment`; `billing.record_payment.v1` gateway callback → `pending_payment → active` (in-process; R8/§10); period-end `billing.renew_subscription.v1` job → `active` (stays active; emits `SubscriptionRenewed`); `billing.cancel_subscription.v1` → sets `auto_renew=false`, runs to period end (no Doc-2 §8 event); period-end `billing.expire_subscription.v1` job → `active → expired` (emits `SubscriptionExpired`); repurchase on `expired` → `pending_payment`. All subscription edges: `Doc-2 §5.7`; `Doc-4M` = cross-module state-map index, not the edge definer; `Doc-4A §13`. **Plans machine (BC-BILL-1):** `draft → active → retired` (`retired` terminal); `billing.retire_plan.v1` drives `active/draft → retired`; edges `Doc-2 §3.8`; `Doc-4M` = index. **No edge added or modified.** Illegal transition → `STATE` → `409`; lost race → `CONFLICT` → `409`.

- **R8 — record_payment = payment-gateway callback (inbound infrastructure, NOT Doc-2 §8 event).** `billing.record_payment.v1` is driven by an **inbound payment-gateway callback — a gateway infra signal**, explicitly NOT a Doc-2 §8 domain event (analogous to `comm.update_delivery_status.v1` in M6/R8). It mutates only M7-owned Platform Invoice state (`platform_payments`). The gateway ingress is infrastructure, not a caller/tenant wire; the contract is out-of-wire (§10). **Flag-and-halt if a caller/tenant wire is proposed for it.**

- **R9 — M7 emits exactly 3 Doc-2 §8 events (BC-BILL-2 only).** Per-contract attribution: `billing.purchase_subscription.v1` (§5 caller-facing) → `SubscriptionPurchased`; `billing.renew_subscription.v1` (§10 System job) → `SubscriptionRenewed`; `billing.expire_subscription.v1` (§10 System job) → `SubscriptionExpired`. Single-authorship, BC-BILL-2 producer; consumed by Communication for fan-out (DF-BILL-6). `billing.cancel_subscription.v1` emits **no** Doc-2 §8 event. BC-BILL-1/3/4/5/6 emit **no** Doc-2 §8 event. Lead-access and advertising/microsite metering signals are carried as `[ESC-BILL-EVENT]` (no §8 emission event today). `QuotationSubmitted` is RFQ-owned / Billing-consumed (DF-BILL-3). No event coined.

- **R10 — resolve_entitlements + enforce_quota are entitlement-service authority (out-of-wire; no HTTP wire).** `billing.resolve_entitlements.v1` is the **entitlement-resolution authority** — consumed intra-module by BC-BILL-3 and cross-module by Marketplace (DD-5), RFQ (quota check), and others. `billing.enforce_quota.v1` is the **quota enforcement check** — consumed at gate-points by other modules. Both are internal service calls; **no REST endpoint, no SSE, no WebSocket, no Webhook, no GraphQL.** Flag-and-halt if a caller wire is proposed.

- **R11 — Actor-branched contracts (F4I-PA-M1 resolution).** One contract-ID, two actor types (User / System). The **User actor leg has the caller-facing HTTP wire**; the System actor invocation is in-process (period-end, event-triggered, or gateway callback). Applies to: `billing.credit_lead_account.v1`, `billing.debit_lead_account.v1`, `billing.issue_platform_invoice.v1`, `billing.update_invoice_status.v1`, `billing.credit_reward.v1`, `billing.track_referral.v1`, `billing.advance_referral.v1`. **Each counted once as caller-facing** in the partition. **Per-command actor-side declaration in §3 must distinguish User vs System legs** (§3 binding rule — ambiguity = content blocker).

---

## M7 surface partition (the structural spine)

> **32 Doc-4I contracts** (PassB BC-BILL-1…6 per-Contract-ID blocks) — **26 caller-facing**, **6 out-of-wire**. Each row carries an explicit **Doc-5I §** owner; every contract is assigned to exactly one section. §3 is a cross-cutting wire-model section and **owns no endpoint**.
>
> **Route/token split:** none — M7 uses `billing` for both route prefix and Contract-ID token prefix (R3).
>
> **Internal-service leg count declaration:** `billing.resolve_entitlements.v1` and `billing.enforce_quota.v1` are definitively out-of-wire (R10); any cross-module consumption of them is via the service layer, not a separately-counted HTTP contract. The count is exactly **26 caller + 6 out = 32**.

| Doc-4I contracts | Nature | **Doc-5I §** |
|---|---|---|
| BC-BILL-1: `create_plan`, `update_plan`, `retire_plan`, `bundle_plan_entitlement`, `create_entitlement`, `update_entitlement` | Admin command (21.6 catalog governance; plans `draft→active→retired` R7; entitlement catalog) | **§4** `POST` |
| BC-BILL-1: `get_plan`, `list_plans` | User / Admin query (21.3; plan + entitlement bundle reads) | **§4** `GET` |
| BC-BILL-2: `purchase_subscription`, `cancel_subscription` | User command (21.4; subscription machine R7; `SubscriptionPurchased` event R9) | **§5** `POST` |
| BC-BILL-2: `get_subscription`, `list_subscription_events` | User query (21.3; own-org subscription reads) | **§5** `GET` |
| BC-BILL-3: `get_usage` | User query (21.3; own-org usage ledger read) | **§6** `GET` |
| BC-BILL-4: `credit_lead_account`, `debit_lead_account` | User / System command (21.4/21.5; actor-branched F4I-PA-M1 — R11) | **§7** `POST` |
| BC-BILL-4: `get_lead_balance`, `list_lead_transactions` | User query (21.3; own-org lead credit reads) | **§7** `GET` |
| BC-BILL-5: `issue_platform_invoice`, `update_invoice_status` | User / System command (21.4/21.5; actor-branched R11; `billing.platform_invoices ≠ operations.trade_invoices` R6) | **§8** `POST` |
| BC-BILL-5: `get_platform_invoice`, `list_platform_invoices` | User query (21.3; own-org invoice reads) | **§8** `GET` |
| BC-BILL-6: `credit_reward`, `track_referral`, `advance_referral` | User / System command (21.4/21.5; actor-branched R11; reward/referral ledger) | **§9** `POST` |
| BC-BILL-6: `get_reward_balance`, `list_referrals` | User query (21.3; own-org reward reads) | **§9** `GET` |
| BC-BILL-2: `renew_subscription`, `expire_subscription` | System period-end jobs (21.5; R7; emit `SubscriptionRenewed`/`SubscriptionExpired` R9) | **§10** out-of-wire |
| BC-BILL-3: `record_usage` | System metering (21.5) | **§10** out-of-wire |
| BC-BILL-3: `enforce_quota` | Internal entitlement-bounded quota check (21.3 User/System; **internal-service authority; R10 — no HTTP caller wire**; consumed by other modules at gate-points via service call; never a routing/procurement decision — R5) | **§10** out-of-wire |
| BC-BILL-2: `resolve_entitlements` | Entitlement-resolution authority (21.3 User/System; **internal-service authority; R10 — no HTTP caller wire**; consumed cross-module by Marketplace/RFQ/BC-BILL-3 via service call) | **§10** out-of-wire |
| BC-BILL-5: `record_payment` | Payment-gateway callback (21.5 System; inbound infra — NOT Doc-2 §8 event; R8) | **§10** out-of-wire |

### Section-level count reconciliation

| Doc-5I § | BC | Caller-facing | Routed to §10 (out-of-wire)¹ | Total |
|---|---|---|---|---|
| §4 | BC-BILL-1 Plans & Entitlements | 8 | 0 | 8 |
| §5 | BC-BILL-2 Subscriptions | 4 | 3 | 7 |
| §6 | BC-BILL-3 Usage & Quota | 1 | 2 | 3 |
| §7 | BC-BILL-4 Lead Credits | 4 | 0 | 4 |
| §8 | BC-BILL-5 Platform Invoicing | 4 | 1 | 5 |
| §9 | BC-BILL-6 Rewards & Referrals | 5 | 0 | 5 |
| **Total** | | **26** | **6** | **32** |

> ¹ "Routed to §10" counts contracts from this BC assigned to §10, **not** owned by the row's §-section. Counted for BC-completeness verification only; the partition table is authoritative.

---

## §0 — Document Control, Precedence & Conformance Obligation

- **Purpose:** Doc-5I's precedence (… → Doc-4A → Doc-4I → Doc-5A → **Doc-5I** → Code); the obligation to conform to Doc-5A in full and pass Appendix A; realize-never-redecide; flag-and-halt.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

---

## §1 — Scope, Audience & M7 Surface Partition

- **Purpose:** what Doc-5I governs (the M7 caller-facing HTTP surface — User + Admin + actor-branched User/System) and does not; carry the surface-partition + count-reconciliation tables; the **§1.x dependency boundary** (M7 realizes only M7 surfaces; cross-module → owning module's Doc-5x — Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Operations → Doc-5F, Communication → Doc-5H; **M7 is consumed by those modules' entitlement/quota checks via service call — Doc-5I does not realize those consuming modules' surfaces**); register carried dependencies **DF-BILL-1…DF-BILL-8** + `[ESC-BILL-AUDIT]` / `[ESC-BILL-POLICY]` / `[ESC-BILL-SLUG]` / `[ESC-BILL-EVENT]` by pointer (resolved only via their Doc-4I channels; none resolved here).
- **Dependencies:** `Doc-5A §1`; `Doc-4I §H0`/PassA §A0. **Detail:** scope + partition + carried-dependency table.

---

## §2 — Realized Endpoint Inventory

- **Purpose:** the `billing`-route HTTP surface — one row per **caller-facing** endpoint (the 26 User/Admin/actor-branched commands and queries): method (§5.2), path grammar (§5.3, prefix `billing`), actor + active-org applicability (§7), success status (§5.5). Command tokens = the exact `billing.<operation>` operation names **verbatim from the Doc-4I PassB per-Contract-ID blocks** (`billing.<operation>.v1`; `Doc-4A §21` / `Doc-5A §5`). **Inventory ordering within each section is non-authoritative and informational only; section ownership (the partition table) is authoritative — on any conflict, the partition table wins; inventory order never implies lifecycle order.** Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`billing`); `Doc-4I` PassB (32-contract inventory). **Detail:** inventory table (paths in content pass).

---

## §3 — Cross-Cutting Actor, Billing Firewall & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*

- **Purpose:** the defining Doc-5I cross-cutting section — realize, on the wire, the mechanism §4–§9 endpoints all depend on (it instantiates no endpoint body): the **User / Admin / System** actor model — **explicitly NO public/anonymous actor** (stated once here, not split across sections); `Authorization` bearer = authentication only; **`Iv-Active-Organization` server-validated, never client-trusted** (R2); **`check_permission` is the sole authorization authority consumed by M7 surfaces; no parallel or shadow authorization path is permitted (`Doc-4A §5.3`, `Doc-4A §6`)**; the **billing firewall** constraints (R5 — billing state never gates trust/verification/eligibility/routing/matching) as wire constraints; the **platform-invoice-≠-trade-invoice boundary** (R6) as a wire fence; the **subscription state machine authority** (R7 — BC-BILL-2 owns the lifecycle; Doc-4M = cross-module state-map index, not the edge definer; edges in `Doc-2 §5.7`); the **plans state machine authority** (BC-BILL-1 — `draft → active → retired`; `retired` terminal; `billing.retire_plan.v1` drives the terminal transition; edges `Doc-2 §3.8`; `Doc-4M` = index; R7); **Controlling Organization (DF-BILL-1):** Identity-resolved billing entity (`Doc-4C §C8`; `Doc-4I §H.3`) — anchors all ownership fields on `subscriptions`, `usage_ledger`, `platform_invoices`, `lead_credit_transactions`, `reward_transactions`; equals the server-validated active org for User calls; resolved independently for System metering (BC-BILL-3); the **non-disclosure firewall** (`NOT_FOUND` collapse on own-org / tenant reads); **actor-branched rule** (R11 — one contract-ID, User leg = caller HTTP wire, System leg = in-process; declared per command). **Per-read disclosure-scope rule (binding):** every read in §4–§9 declares its scope — **Own-Org** (User reads only their own org's billing data; Admin reads any org; plan catalog is platform-public) — ambiguity = content blocker. **Per-command actor-side rule (binding):** every command declares its actor side — User / Admin / System / actor-branched (User+System) — ambiguity = content blocker. No endpoint is instantiated here.
- **Dependencies:** `Doc-5A §6.3/§7/§10`; `Doc-4A §5/§5.3/§6/§7/§7.5`; `Doc-4C §C3/§C8` (consumed authorization root); `Doc-4I §H0/§H.3/§H.9` (actor model, Controlling Org, ownership); `Doc-2 §3.8/§5.7/§10.8` (state machine edges). **Detail:** cross-cutting wire-model declaration; bound, not redefined; no endpoint instantiation.

---

## §4 — Plans & Entitlements Surface Realization (BC-BILL-1, 8 caller-facing)

- **Purpose:** the BC-BILL-1 plans+entitlement surface — Admin catalog commands (`create_plan` → `draft`, `update_plan`, `retire_plan` [`draft/active → retired` terminal], `bundle_plan_entitlement`, `create_entitlement`, `update_entitlement`) and User/Admin reads (`get_plan`, `list_plans`); plan machine `draft → active → retired` (`Doc-2 §3.8`; `Doc-4M` = index; R7); idempotency/concurrency (§9); error mapping (§6); `[ESC-BILL-SLUG]` on Admin catalog commands (no Doc-2 §7 catalog slug); `[ESC-BILL-AUDIT]` on mutations; append-friendly plan catalog (definition only; confers no entitlement until bundled).
- Per-read disclosure scope: `get_plan`/`list_plans` → **Platform-Public** (catalog is platform-owned; any authenticated User reads). Per-command actor side: all catalog commands → **Admin** (platform-staff; `[ESC-BILL-SLUG]`).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4I §HB-1.1/§HB-1.2/§HB-1.3/§HB-1.4`; `Doc-4M`; `Doc-2 §3.8/§10.8`. **Detail:** Admin-command + catalog-read realization.

---

## §5 — Subscriptions Surface Realization (BC-BILL-2, 4 caller-facing)

- **Purpose:** the BC-BILL-2 subscription surface — User commands (`purchase_subscription` [→ `pending_payment`; `record_payment` callback drives `pending_payment → active` R7/R8/§10], `cancel_subscription` [sets `auto_renew=false`]) and User reads (`get_subscription`, `list_subscription_events`); subscription machine `pending_payment → active → expired` (`Doc-2 §5.7`; `Doc-4M` = index; R7); **BC-BILL-2 = sole subscription lifecycle authority and entitlement-resolution authority** (R7; `resolve_entitlements` is out-of-wire §10); `purchase_subscription` emits `SubscriptionPurchased` (R9; outbox via Doc-4B — the only §8 event emitted from a §5 caller-facing contract); `cancel_subscription` sets `auto_renew=false` — **no `Doc-2 §8` event emitted** (R9/`Doc-4I §H.7`); `SubscriptionRenewed` and `SubscriptionExpired` are emitted by the §10 System jobs (R9/§10 — not by any §5 surface); idempotency/concurrency; error mapping; `[ESC-BILL-AUDIT]` on mutations; `renew_subscription` / `expire_subscription` are out-of-wire System jobs (§10/R1).
- Per-read disclosure scope: `get_subscription`/`list_subscription_events` → **Own-Org** (User reads own active org's subscription data). Per-command actor side: `purchase_subscription`/`cancel_subscription` → **User** (`can_manage_billing`).
- **Dependencies:** `Doc-5A §5/§6/§9/§11`; `Doc-4I §HB-2.1/§HB-2.2/§HB-2.3/§HB-2.4/§HB-2.5`; `Doc-4M`; `Doc-2 §5.7/§8`. **Detail:** subscription command + read realization; event outbox binding.

---

## §6 — Usage & Quota Surface Realization (BC-BILL-3, 1 caller-facing)

- **Purpose:** the BC-BILL-3 usage-ledger surface — **1 caller-facing read** (`get_usage` — User, own-org usage-ledger inquiry); quota enforcement (`enforce_quota`) and metering (`record_usage`) are out-of-wire (§10/R1/R10); `enforce_quota` is the quota-enforcement-authority (entitlement check — **never a routing/eligibility/procurement decision**; billing firewall R5); **usage ledger is append-only** (no state machine; `Doc-2 §10.8`); no mutation surface exposed to callers; reads not audited (`Doc-5A §17.1`).
- Per-read disclosure scope: `get_usage` → **Own-Org** (User reads own org's usage ledger).
- **Dependencies:** `Doc-5A §5/§6`; `Doc-4I §HB-3.1/§HB-3.2/§HB-3.3`; `Doc-2 §10.8`. **Detail:** usage-read realization + out-of-wire declare (§10 handles record_usage/enforce_quota).

---

## §7 — Lead Credits Surface Realization (BC-BILL-4, 4 caller-facing)

- **Purpose:** the BC-BILL-4 lead-credit surface — User/System actor-branched commands (`credit_lead_account`, `debit_lead_account` — R11; User purchases/applies credits; System auto-debits on lead access) and User reads (`get_lead_balance`, `list_lead_transactions`); **lead credit account is a promotional/commercial balance — never procurement standing** (billing firewall R5); `[ESC-BILL-AUDIT]` on mutations; `[ESC-BILL-EVENT]` for lead-access signals (no §8 emission today); idempotency/concurrency on commands; append-only ledger (`lead_credit_transactions`; `Doc-2 §10.8`).
- Per-read disclosure scope: `get_lead_balance`/`list_lead_transactions` → **Own-Org**. Per-command actor side: `credit_lead_account`/`debit_lead_account` → **actor-branched** (User + System; R11).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4I §HB-4.1/§HB-4.2`; `Doc-2 §10.8`; DF-BILL-4. **Detail:** lead-credit command + read realization; actor-branched actor-side declaration.

---

## §8 — Platform Invoicing & Payments Surface Realization (BC-BILL-5, 4 caller-facing)

- **Purpose:** the BC-BILL-5 platform invoicing surface — User/System actor-branched commands (`issue_platform_invoice`, `update_invoice_status` — R11) and User reads (`get_platform_invoice`, `list_platform_invoices`); **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED — R6)**; `record_payment` (gateway callback) is out-of-wire (§10/R1/R8); `[ESC-BILL-AUDIT]` on mutations (Doc-2 §9 Financial enumerates "platform invoice created, payment status change"); idempotency/concurrency on commands; platform invoice machine (states per `Doc-4I §HB-5.1/§HB-5.2`; `Doc-2 §10.8`); reads not audited.
- Per-read disclosure scope: `get_platform_invoice`/`list_platform_invoices` → **Own-Org**. Per-command actor side: `issue_platform_invoice`/`update_invoice_status` → **actor-branched** (User + System; R11).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4I §HB-5.1/§HB-5.2/§HB-5.3/§HB-5.4`; `Doc-2 §10.8`; DF-BILL-5/DF-BILL-8. **Detail:** invoice command + read realization; R6 fence; R8 gateway-fence.

---

## §9 — Rewards & Referrals Surface Realization (BC-BILL-6, 5 caller-facing)

- **Purpose:** the BC-BILL-6 reward/referral surface — User/System actor-branched commands (`credit_reward`, `track_referral`, `advance_referral` — R11) and User reads (`get_reward_balance`, `list_referrals`); **reward/referral account is a promotional/commercial balance — never procurement standing** (billing firewall R5); referral state machine (edges `Doc-2 §10.8` / `Doc-4I §HB-6.2`; `Doc-4M` = index); `[ESC-BILL-AUDIT]` on mutations; idempotency/concurrency on commands; append-only ledger (`reward_transactions`, `referrals`; `Doc-2 §10.8`).
- Per-read disclosure scope: `get_reward_balance`/`list_referrals` → **Own-Org**. Per-command actor side: `credit_reward`/`track_referral`/`advance_referral` → **actor-branched** (User + System; R11).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4I §HB-6.1/§HB-6.2/§HB-6.3`; `Doc-2 §10.8`; DF-BILL-6. **Detail:** reward/referral command + read realization.

---

## §10 — Out-of-Wire Boundary

- **Purpose:** declare that the 6 out-of-wire contracts have **no HTTP wire** — `billing.renew_subscription.v1` (System period-end renew job) and `billing.expire_subscription.v1` (System period-end expire job) are background period-end workers; `billing.record_usage.v1` (System metering) is a background metering recorder; `billing.enforce_quota.v1` (internal quota check) is a service-layer gate consumed by other modules (never a routing/procurement authority — R5/R10); `billing.resolve_entitlements.v1` (entitlement-resolution authority) is a service-layer read consumed cross-module and intra-module via service call (R10); `billing.record_payment.v1` (payment-gateway callback) is inbound gateway infrastructure, explicitly NOT a Doc-2 §8 domain event (R8). **Out-of-wire contracts have no caller wire in any protocol: no REST endpoint, no SSE stream, no WebSocket, no Webhook, no GraphQL.** **Flag-and-halt if any wire surface in any protocol is proposed** (an architecture change). `renew_subscription`/`expire_subscription` emit `SubscriptionRenewed`/`SubscriptionExpired` (R9 — outbox via Doc-4B); this emission is in-process, not a wire. Implementation is code / Doc-6.
- **Dependencies:** `Doc-4I §HB-2.3/§HB-2.4/§HB-3.1/§HB-3.2/§HB-5.3`; `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

---

## §11 — Conformance & Carried Items

- **Purpose:** Doc-5I's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DF-BILL-1…DF-BILL-8 + `[ESC-BILL-AUDIT]` / `[ESC-BILL-POLICY]` / `[ESC-BILL-SLUG]` / `[ESC-BILL-EVENT]`) by pointer with each named resolution channel; statement that Doc-5I coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4I PassA §A8/§A10`. **Detail:** attestation + carried-item register.

---

## Appendix A — Doc-5I Conformance Attestation

- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M7 surface; the freeze evidence. Includes dedicated bands for the M7-unique risks not covered by a single `CHK-5A-xxx`: a **billing-firewall band** (*no billing state gates trust/verification/eligibility/routing/matching; no BC computes/owns/modifies a governance score*); a **platform-invoice-≠-trade-invoice band** (*BC-BILL-5 owns platform-fee invoices only; `billing.platform_invoices ≠ operations.trade_invoices`*); a **gateway-callback band** (*`record_payment` is inbound infra, not a Doc-2 §8 event; mutates only M7-owned state*); and an **entitlement-service-authority band** (*`resolve_entitlements` + `enforce_quota` are service-layer authorities with no HTTP wire; `enforce_quota` is never a routing/eligibility/procurement decision*).
- **Dependencies:** `Doc-5A Appendix A`; §3 (disclosure-scope + actor-side rules); R5/R6/R8/R10. **Detail:** attestation table (content pass).

---

## Carried Items (Doc-4I PassA §A8/§A10 — resolved only via named channels, never here)

| ID | Item | Doc-5I handling | Freeze gate? |
|---|---|---|---|
| **DF-BILL-1** | Identity — `check_permission` / org / active-org / Controlling Organization resolution, consumed | Authorization resolved server-side via Identity (`Doc-4C §C3/§C8`); Controlling Org anchored to server-validated active org; no shadow authz (§3); no Identity surface realized | **No** |
| **DF-BILL-2** | Marketplace — consume `billing.resolve_entitlements.v1` / `billing.enforce_quota.v1` for ad/microsite entitlement check (DD-5) | Entitlement consumed by Marketplace via service call (R10/§10); `billing.resolve_entitlements.v1` is the cross-module service authority; no Marketplace surface realized | **No** |
| **DF-BILL-3** | RFQ — consume `QuotationSubmitted` (RFQ-owned event); `billing.enforce_quota.v1` consumed for quota check | `QuotationSubmitted` consumed by BC-BILL-3 (`source=rfq_response`); `enforce_quota` consumed via service (R10/§10); no RFQ surface realized | **No** |
| **DF-BILL-4** | Lead Credits — Operations/Marketplace trigger lead-access debit signals; `[ESC-BILL-EVENT]` for lead-access signals | Lead-access metering signal = `[ESC-BILL-EVENT]` (no §8 emission event today); debit triggered via `billing.debit_lead_account.v1` System actor (R11); no Operations surface realized | **No** |
| **DF-BILL-5** | Operations — boundary guard: `billing.platform_invoices` (M7-owned, platform-fee invoices only) and `operations.trade_invoices` (M4-owned, buyer↔vendor commercial invoices) are disjoint aggregates in separate schemas; M7 realizes no trade-invoice surface, accesses no M4 tables, and exposes no Operations-owned entity on the M7 wire (One Module, One Owner; R6/FIXED; DF-6 in Doc-5F) | R6 FIXED fence + §8 wire constraint; disjoint ownership stated; no Operations surface realized | **No** |
| **DF-BILL-6** | Communication — consume `SubscriptionPurchased` / `SubscriptionRenewed` / `SubscriptionExpired` (fan-out to notification) | Events produced by BC-BILL-2 outbox (R9); Communication consumes for fan-out (DF-COMM in Doc-5H); no Communication surface realized | **No** |
| **DF-BILL-7** | Admin — catalog governance (BC-BILL-1 Admin commands governed by platform-staff; `[ESC-BILL-SLUG]` for catalog slug) | Admin actor bound by pointer; `[ESC-BILL-SLUG]` carried; no Admin surface realized | **No** |
| **DF-BILL-8** | Platform Core — audit-write / outbox / UUIDv7+human-ref / POLICY / flags, consumed | Consumed via Doc-4B mechanisms by pointer (H.6/H.8 in Doc-4I); never re-implemented | **No** |
| `[ESC-BILL-AUDIT]` | Doc-2 §9 — subscription expiry, plan/entitlement catalog, usage recording not separately enumerated | Bound to nearest Doc-2 §9 action by pointer (Financial / Organization) per frozen Doc-4I H.6; **interim, not finalized**; channel: Doc-2 §9 additive | **No** |
| `[ESC-BILL-POLICY]` | No `billing` POLICY namespace key (dedup / period-transition / retry / rate / page) | Referenced by platform-default key name by pointer; channel: Doc-3 §12.2 additive; **`[ESC-BILL-POLICY]`-keyed contracts not finalized until registered** | **Tracked** — per-contract finalization; not a structural gate |
| `[ESC-BILL-SLUG]` | No catalog-management slug in Doc-2 §7 (frozen slugs: `can_view_billing` / `can_manage_billing` only) | Admin catalog authority interim by pointer; `[ESC-BILL-SLUG]` carried; channel: Doc-2 §7 additive; no slug invented | **No** |
| `[ESC-BILL-EVENT]` | Lead-access and advertising/microsite metering signals have no Doc-2 §8 emission event today | §11 N/A for these signals; carried per frozen Doc-4I; channel: Doc-2 §8 additive if later required; **never coin an event in Doc-5I** | **No** |

---

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DF-BILL-1…DF-BILL-8 / `[ESC-BILL-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving any of the 6 out-of-wire contracts a wire in any protocol · trade invoices, escrow, wallet, fund custody, buyer↔vendor settlement · coining any endpoint/status/header/error-class/slug/POLICY-key/event · letting billing state gate trust/verification/eligibility/routing/matching (R5/firewall) · conflating `billing.platform_invoices` with `operations.trade_invoices` (R6/FIXED) · authoring any entitlement or quota logic as routing/procurement-eligibility authority (moat).

---

*FROZEN 2026-06-26. On any conflict with a frozen Doc-4x or Doc-5A, the frozen corpus wins and this document is patched to match — flag-and-halt. Do not edit. Carry-forward: `[ESC-BILL-POLICY]` (TRACKED — per-contract; not a structural gate). Next: content passes begin (Pass-1: §0–§3 + inventory `billing.*` tokens).*
