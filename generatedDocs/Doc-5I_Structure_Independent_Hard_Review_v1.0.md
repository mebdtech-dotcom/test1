# Doc-5I — Monetization / Billing (M7 `billing`) — Structure Proposal v0.1 — Independent Hard Review v1.0

| Field | Value |
|---|---|
| Document | Doc-5I Structure Proposal v0.1 — Independent Hard Review |
| Reviews | `Doc-5I_Structure_Proposal_v0.1.md` |
| Verdict | **CONDITIONAL APPROVE — patch required before structure freeze** |
| Findings | **0 BLOCKER · 2 MAJOR · 3 MINOR · 3 NITPICK** |
| Blocking freeze? | **Yes — M-01 and M-02 must be resolved in a patch before structure freeze** |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §5`; `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-5I_Structure_Proposal_v0.1` |
| Board | Architecture Board · API Governance Board |

---

## Review Scope

The review checks the structure proposal against: the frozen corpus (Doc-4I, Doc-5A, Doc-2, Doc-3); the R-list for correctness and completeness; the surface partition for count integrity and correct § assignment; the §3 cross-cutting wire model for binding-rule coverage; the carried-items register for correctness; and the structural invariants from the Doc-5D/5F/5H precedent chain (per-read disclosure-scope rule, per-command actor-side rule, state-machine-authority form, gateway-callback fence, out-of-wire boundary).

---

## MAJOR Findings

### M-01 — §3 state-machine authority declaration incomplete: plans machine absent

**Severity:** MAJOR  
**Location:** §3 Purpose; R7

**Problem.** §3 declares "the subscription state machine authority (R7 — BC-BILL-2 owns the lifecycle; Doc-4M = cross-module state-map index; edges in `Doc-2 §5.7`)" but makes **no mention of the plans state machine** (`draft → active → retired`; BC-BILL-1; `Doc-2 §3.8`). R7 itself covers both machines (subscriptions §5.7 + plans §3.8), but §3 — the cross-cutting section that all content passes depend on — only anchors subscriptions.

**Why it matters.** §3 is the binding anchor for every content-pass author. Any state-machine edge must bind to a §3-declared authority (Doc-5F precedent: "m-01 form — edges defined in Doc-2 §X; Doc-4M = index, not the edge definer"). A content author authoring §4 (`retire_plan` — the only terminal state command on BC-BILL-1) will look to §3 for the machine authority. With only subscriptions declared there, the plans machine edges have no §3 home, making §4 a potential content blocker.

**Additionally,** the `platform_invoices` state machine (BC-BILL-5) and the `referrals` machine (BC-BILL-6) are not in §3 either. Those are BC-specific and can live in their sections — but the **Plans machine is cross-BC in the sense that entitlement bundles are only valid while the plan is `active`**, making the `draft → active → retired` transition relevant to cross-BC correctness.

**Fix.** Add to §3 Purpose:
> "**Plans state machine authority (BC-BILL-1):** `draft → active → retired` (`retired` terminal); `retire_plan` drives `active/draft → retired`; edges sourced from `Doc-2 §3.8`; `Doc-4M` = cross-module state-map index, not the edge definer. Illegal transition → `STATE` → `409`; lost race → `CONFLICT` → `409`."

Also add `Doc-2 §3.8` to §3's Dependencies binding.

---

### M-02 — R7 misattributes `pending_payment → active` transition to `purchase_subscription`

**Severity:** MAJOR  
**Location:** R7; §5 Purpose

**Problem.** R7 states: "purchase → `pending_payment → active`". This notation reads as if `billing.purchase_subscription.v1` drives **both** the creation into `pending_payment` **and** the transition to `active`. In fact, per `Doc-4I §HB-2.1` + `Doc-4I §HB-5.3`:
- `purchase_subscription` creates the subscription **at `pending_payment`** (it does not drive `pending_payment → active`).
- The `pending_payment → active` transition is triggered by **`billing.record_payment.v1`** — the payment-gateway callback (R8; out-of-wire §10) — when the gateway confirms successful payment.

**Why it matters.** Incorrect edge attribution is a content blocker. A content author for §5 reading R7 may implement `purchase_subscription` as directly yielding an `active` subscription, skipping the `pending_payment` phase and the gateway confirmation step entirely. This would be architecturally wrong and inconsistent with the out-of-wire boundary (which correctly classifies `record_payment` as the gateway-callback contract). The state-machine authority (`Doc-2 §5.7`) owns the edges; Doc-5I must realize them correctly.

**Fix.** Rewrite R7 subscription machine text to:
> "`billing.purchase_subscription.v1` → creates subscription at `pending_payment`; `billing.record_payment.v1` gateway callback → `pending_payment → active` (in-process; R8/§10); period-end `renew_subscription` job → `active` (renews; stays active; emits `SubscriptionRenewed`); `cancel_subscription` → sets `auto_renew=false`, runs to period end; period-end `expire_subscription` job → `active → expired` (emits `SubscriptionExpired`); repurchase on `expired` → `pending_payment`. All edges: `Doc-2 §5.7`; `Doc-4M` = cross-module state-map index, not the edge definer."

Also update §5 Purpose to attribute `SubscriptionPurchased` emission to `purchase_subscription` specifically, not to the section as a whole (see m-03).

---

## MINOR Findings

### m-01 — Partition table `enforce_quota` row — "21.3 Query / User/System" label ambiguous for an out-of-wire contract

**Severity:** MINOR  
**Location:** Surface partition table; §10 Purpose

**Problem.** The partition table row for `billing.enforce_quota.v1` describes it as "21.3 Query / User/System" (a Query operation with a User actor) but then assigns it to §10 (out-of-wire). A reader comparing the partition table to the caller-facing inventory will reasonably ask: why is a `User/System Query` out-of-wire? `billing.get_usage.v1` is also "21.3 Query / User" and is caller-facing (§6). The distinction is the *internal-service-authority* nature of `enforce_quota` (R10), not the actor label. Without a distinguishing note in the partition table, future authors applying the partition-wins rule may reassign `enforce_quota` to §6 as a peer of `get_usage`.

**Fix.** Add "(internal-service authority; R10 — no HTTP caller wire; consumed by other modules via service call)" to the partition table row's Nature cell for both `billing.enforce_quota.v1` and `billing.resolve_entitlements.v1`. Both need this annotation since both are "User/System" labeled but out-of-wire.

---

### m-02 — DF-BILL-5 carried-item description frames a fence rule, not a dependency

**Severity:** MINOR  
**Location:** Open Carried Items table, DF-BILL-5 row

**Problem.** DF-BILL-5 is described as "Operations — `billing.platform_invoices ≠ operations.trade_invoices` (FIXED; DF-6 in Doc-5F); Operations never accesses Billing tables; Billing never accesses Operations trade invoices." This describes the **fence** (the FIXED invariant) but not the **dependency** — what M7 actually depends on from M4, or what M4 depends on from M7. A carried-item entry should describe the cross-module seam: what M7 consumes from or interacts with in M4, and why the boundary must be preserved.

Looking at `Doc-4I` DF-BILL-5 context: Billing depends on knowing that `operations.trade_invoices` exist (they are referenced in M4's domain) so that Billing can be sure NOT to realize any trade-invoice surface. The dependency is a **boundary constraint, not a data seam** — M7 holds no dependency on M4's data, only on M4's ownership boundary being intact.

**Fix.** Restate DF-BILL-5 Item as: "Operations — boundary guard: `billing.platform_invoices` (M7-owned, platform-fee invoices only) and `operations.trade_invoices` (M4-owned, buyer↔vendor commercial invoices) are disjoint; M7 realizes no trade-invoice surface and accesses no M4 tables (One Module, One Owner); Billing's caller-facing surface must never expose or reference `operations.trade_invoices`". Keep the Doc-5I-handling column as is (R6 fence).

---

### m-03 — §5 event attribution: SubscriptionRenewed/Expired incorrectly attributed to caller-facing §5

**Severity:** MINOR  
**Location:** §5 Purpose

**Problem.** §5 Purpose states "emits SubscriptionPurchased / SubscriptionRenewed / SubscriptionExpired (R9; the 3 Doc-2 §8 events M7 emits; outbox via Doc-4B)." This lumps all 3 events into §5, but `SubscriptionRenewed` and `SubscriptionExpired` are emitted by `billing.renew_subscription.v1` and `billing.expire_subscription.v1` respectively — **both out-of-wire §10 System jobs** (R1). They are not emitted by any §5 caller-facing contract.

Of the 3 BC-BILL-2 events:
- `SubscriptionPurchased` — emitted by `purchase_subscription.v1` (§5 caller-facing ✓)
- `SubscriptionRenewed` — emitted by `renew_subscription.v1` (§10 System job ✗ from §5's perspective)
- `SubscriptionExpired` — emitted by `expire_subscription.v1` (§10 System job ✗ from §5's perspective)

A content author for §5 reading this will search for an event-emission obligation on `cancel_subscription` or `get_subscription` and not find it, producing a flag-and-halt. Or worse, they may invent an event on a §5 contract.

**Fix.** Replace the §5 event attribution with: "`purchase_subscription` emits `SubscriptionPurchased` (R9 — the only §8 event emitted from a §5 caller-facing contract; outbox via Doc-4B); `cancel_subscription` sets `auto_renew=false` — **no `Doc-2 §8` event emitted** (cancel is not an event-producing operation in the frozen Doc-4I H.7); `SubscriptionRenewed` and `SubscriptionExpired` are emitted by the §10 System jobs (R9/§10)."

---

## NITPICK Findings

### NP-01 — R9 event attribution in R-list mirrors m-03 ambiguity

**Severity:** NITPICK  
**Location:** R9

R9 states "BC-BILL-2 producer" — correct, all 3 events are BC-BILL-2's. But it does not distinguish which *contract* in BC-BILL-2 emits which event. After the M-02 patch to R7 clarifies per-contract edge attribution, R9 should similarly clarify: "`purchase_subscription.v1` → `SubscriptionPurchased`; `renew_subscription.v1` (§10) → `SubscriptionRenewed`; `expire_subscription.v1` (§10) → `SubscriptionExpired`." Not a structure-freeze blocker but prevents content-pass confusion.

---

### NP-02 — §9 referral machine edges cite only `Doc-4I §HB-6.2`, missing `Doc-2 §10.8`

**Severity:** NITPICK  
**Location:** §9 Purpose

§9 Purpose states "referral state machine (edges `Doc-4I §HB-6.2`; `Doc-4M` = index)". The edge authority for all Doc-5x state machines must cite a Doc-2 source (precedent: Doc-5H §7.2 cites `Doc-2 §3.7 / Doc-4H §H13`; Doc-5F cites `Doc-2 §3.5`). The `referrals` aggregate lives in `Doc-2 §10.8` (Billing). Citation should be "edges `Doc-2 §10.8` / `Doc-4I §HB-6.2`; `Doc-4M` = index" to conform to the cross-module state-map authority pattern.

---

### NP-03 — §3 should declare "Controlling Organization" concept (DF-BILL-1 anchor)

**Severity:** NITPICK  
**Location:** §3 Purpose; DF-BILL-1

§3 covers `Iv-Active-Organization` server-validation but does not mention the **Controlling Organization** — the Identity-resolved billing entity (DF-BILL-1; `Doc-4I §H.3`) that anchors subscription, usage, invoice, lead, and reward ownership. In billing, `Iv-Active-Organization` and the Controlling Organization are typically the same, but the concept is load-bearing for BC-BILL-3 metering (the `usage_ledger.organization_id` is the Controlling Org, not just the active session org). Without a §3 anchor, content authors for §6 and §7 lack a cross-cutting home for this concept. Suggested addition to §3: "**Controlling Organization (DF-BILL-1):** Identity-resolved billing entity (`Doc-4C §C8`; `Doc-4I §H.3`) — anchors all ownership fields on `subscriptions`, `usage_ledger`, `platform_invoices`, `lead_credit_transactions`, `reward_transactions`; equals the server-validated active org for User calls; resolved independently for System metering."

---

## Summary of Required Actions

**Patch required (freeze blocked until applied):**

| Finding | Action |
|---|---|
| **M-01** | Add plans machine (`draft → active → retired`; `Doc-2 §3.8`; `Doc-4M` = index) to §3 Purpose + §3 Dependencies |
| **M-02** | Rewrite R7 to correctly attribute: `purchase_subscription` → `pending_payment`; `record_payment` callback → `pending_payment → active`; update §5 event attribution per m-03 fix |

**Recommended for patch (not freeze-blocking but should be resolved in the same pass):**

| Finding | Action |
|---|---|
| **m-01** | Add "(internal-service authority; R10 — no HTTP caller wire)" to partition table for `enforce_quota` and `resolve_entitlements` rows |
| **m-02** | Restate DF-BILL-5 as boundary-guard dependency, not fence rule |
| **m-03** | Attribute events per-contract in §5 (purchase → `SubscriptionPurchased`; cancel → no event; renew/expire → §10) |
| NP-01 | Clarify per-contract event attribution in R9 |
| NP-02 | Add `Doc-2 §10.8` citation to §9 referral machine edges |
| NP-03 | Add Controlling Organization anchor to §3 |

---

## Passed Checks (no finding)

| Check | Status |
|---|---|
| 32-contract count: 26 caller + 6 out = 32 | **PASS** |
| Every contract assigned exactly once with correct § owner | **PASS** |
| Route/token = `billing` (no split); R3 correct | **PASS** |
| `resolve_entitlements` + `enforce_quota` classified out-of-wire (R10) | **PASS** |
| `record_payment` fenced as gateway callback R8; NOT Doc-2 §8 event | **PASS** |
| Actor-branched R11: one contract-ID; User leg = wire; System = in-process; counted once | **PASS** |
| Billing firewall R5 stated as §3 wire constraint | **PASS** |
| R6 FIXED fence (`billing.platform_invoices ≠ operations.trade_invoices`) | **PASS** |
| R9 events: exactly 3, BC-BILL-2 only, correct producer | **PASS** |
| 4 M7-unique Appendix A bands declared | **PASS** |
| DF-BILL-1…8 all registered; ESC-BILL-AUDIT/POLICY/SLUG/EVENT all carried | **PASS** |
| `[ESC-BILL-POLICY]` = TRACKED (per-contract; not structural freeze gate) | **PASS** |
| Anti-invention: nothing coined (CHK-5A-121/154) | **PASS** |
| §3 as mechanism section (no endpoint) | **PASS** |
| Flag-and-halt noted: R1 (out-of-wire wire), R8 (gateway-caller wire), R10 (entitlement-service wire) | **PASS** |
| No cross-module surface realized | **PASS** |
| Structure Self-Audit table complete | **PASS** |
| Doc-4M declared as index only (not edge definer) | **PASS** |

---

*End of Doc-5I Structure Independent Hard Review v1.0. Verdict: CONDITIONAL APPROVE. Patch M-01 + M-02 required before structure freeze. m-01/m-02/m-03 recommended in same patch pass. NP-01/NP-02/NP-03 deferrable to patch or content pass.*
