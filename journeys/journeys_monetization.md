# Journeys — Monetization (M7)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File G — Monetization
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M7 Monetization (`billing` · Doc-4I)
**Journeys:** J-SUB · J-PINV · J-CRED
**Legend/notation:** atlas §2 · **Actor journeys composed:** `J-BUY` §3 / `J-VND` §5 (billing
legs), `J-ADM` §7 (plan ops) — marketplace_ux.md

> **Authority stance.** Non-authoritative companion. States resolve to **Doc-2 §5.7 + §3**
> (`subscriptions`, `platform_invoices`, `platform_payments`, lead-credit ledgers); contracts to
> **Doc-4I** (BC-BILL-1 Plans & Entitlements … BC-BILL-4 lead credits; + `billing.activate_plan`
> additive patch). Escalation marker carried verbatim: **`ASSUMPTION A-06`** (Subscription
> minimal machine — architecture defines ownership and events, not states). Binding rails:
> the **billing firewall** — no billing state gates trust, eligibility, routing, or matching
> (Doc-3 §11.8); gating everywhere uses **entitlements** (boolean/numeric/enum), never plan-name
> checks; Financial Tier (capability) ≠ Subscription Plan (commercial) (Invariant #10). This is
> the **platform's own revenue** — the only money the platform touches (money boundary). On any
> conflict the frozen corpus wins and this file is patched.

---

## G1. Subscription Lifecycle — `J-SUB`

**Breadcrumb:** Atlas ▸ Monetization ▸ Subscription Lifecycle

| Ownership | |
|---|---|
| Owner Module | M7 Billing (`subscriptions` AR; **ASSUMPTION A-06**) |
| Participating Modules | M1 (entitlement cache refresh, seam M6-6); M8 (plan catalog ops, `J-ADM-06`) |
| Authoritative Documents | Doc-2 §5.7, §3 (`subscriptions`: partial `UNIQUE(organization_id) WHERE state='active'`); Doc-4I (+ `billing.activate_plan.v1` patch — plan activation, Doc-2 §3.8 `draft → active`) |
| Read-only References | Doc-7E (plans & billing surface) |

**Actors:** Primary — org Owner (purchase; **cancel is Owner-only**). ⚙ System — period-end
renewal/expiry.

**Intent arc:** Choose → Pay → Enjoy → Renew.
**Goal:** the commercial relationship between an organization and the platform — expressed
entirely through entitlements.

**Entry:** org `[active]`; a plan `[active]` in the catalog (`billing.activate_plan.v1`,
`J-ADM-06`).
**Exit:** none while commercial life continues — `[expired]` with a repurchase path.

```
[pending_payment] → payment confirmed → [active] (auto_renew = true)
[active] → cancel [Owner only] → [active] (auto_renew = false; runs to period end)
[active] → period end (auto_renew + payment ok) → [active] (SubscriptionRenewed)
[active] → period end (no renew / payment failure) → [expired] (SubscriptionExpired)
[expired] → repurchase → [pending_payment]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.7) | Outcome / governance |
|---|---|---|---|---|
| J-SUB-01 | Choose & purchase | `purchase_subscription` (plan from catalog) | `[pending_payment]` | Invoice raised → J-PINV (`purpose subscription`) |
| J-SUB-02 | Activate | payment confirmed | `→ [active]` (`auto_renew = true`) | `(SubscriptionPurchased)` → seam M6-6 entitlement refresh; one `[active]` per org (partial unique) |
| J-SUB-03 | Cancel | Owner-only cancel | `[active]` (**`auto_renew = false` — a flag mutation, not a state change**) | Runs to period end; **never draw a `cancelled` state** |
| J-SUB-04 | Renew | ⚙ period end, renew + payment ok | `[active] → [active]` | `(SubscriptionRenewed)` — an event on an unchanged state |
| J-SUB-05 | Expire | ⚙ period end otherwise | `→ [expired]` | `(SubscriptionExpired)` → M6-6; **Basic entitlement profile applies** (A-11) unless org suspended/banned |
| J-SUB-06 | Resubscribe | repurchase | `[expired] → [pending_payment]` | Fresh cycle; history retained |

**Governance rails (firewall — binding):** entitlements resolve **only** from an `[active]`
subscription; no plan/payment state ever gates matching, award, trust, or routing; upgrades and
plan changes ride purchase/renewal contracts — never a bespoke state; every gate in any journey
reads an entitlement key, never a plan name.
**Success:** ✔ machine walked exactly as A-06 defines (carried, not hardened); ✔ entitlement
cache refreshed per event; ✔ zero procurement influence.

**Related:** invoice J-PINV · credits J-CRED · plan catalog `J-ADM-06` · composed by `J-BUY-06`;
entitlement effects surface in J-SITE/J-ADV/J-QUO quotas by pointer.

---

## G2. Platform Invoice Lifecycle — `J-PINV`

**Breadcrumb:** Atlas ▸ Monetization ▸ Platform Invoice Lifecycle

| Ownership | |
|---|---|
| Owner Module | M7 Billing (`platform_invoices` AR + `platform_payments`) |
| Participating Modules | none — **explicitly not M4** (`billing.platform_invoices` ≠ `operations.trade_invoices`) |
| Authoritative Documents | Doc-2 §3 (`platform_invoices`: `human_ref INV-P-…`, `{amount, currency}`, `status issued/paid/overdue/void`, `purpose subscription/lead_package/advertising/microsite/service`; `platform_payments`: `gateway sslcommerz/bkash/nagad/bank`, `status initiated/succeeded/failed/refunded`); Doc-4I |
| Read-only References | Doc-7E (billing history) |

**Actors:** Primary — debtor-org User (pays). ⚙ System — gateway callbacks, overdue sweep.

**Intent arc:** Owe → Pay → Settle.
**Goal:** fees owed **to iVendorz** — the one money flow the platform actually settles, through
real gateways.

**Entry:** a billable purpose exists (`subscription/lead_package/advertising/microsite/service`).
**Exit:** `[paid]` — or `[void]`.

```
[issued] → gateway payment ([initiated] → [succeeded]) → [paid]
[issued] → due date passes → [overdue] → [paid] / [void]
payment legs: [initiated] → [succeeded] / [failed] / [refunded]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-PINV-01 | Issue | invoice raised for a purpose (`INV-P-…`) | `[issued]` | **No draft state exists — never draw one**; `{amount, currency}` per field |
| J-PINV-02 | Pay | gateway payment (`sslcommerz/bkash/nagad/bank`) | payment `[initiated] → [succeeded]`; invoice `→ [paid]` | Real settlement — platform revenue only |
| J-PINV-03 | Lapse | ⚙ due date passes | `[issued] → [overdue]` | Dunning is communication (J-NTF), not a state |
| J-PINV-04 | Recover / void | late payment · administrative void | `[overdue] → [paid]` / `[void]` | Void retains the record (Invariant #8) |
| J-PINV-05 | Refund leg | gateway refund | payment `→ [refunded]` | Payment-side status; invoice disposition per Doc-4I |

**Governance rails (money boundary — the positive side):** this journey is the **only** place
the platform moves money, and the counterparty is always the platform itself; buyer↔vendor money
stays in J-FIN as records; non-payment consequences are commercial (entitlements, J-SUB-05) —
never procurement standing.
**Success:** ✔ every invoice purpose-tagged; ✔ gateway trail complete; ✔ zero coupling to
procurement outcomes.

**Related:** raised by J-SUB-01, J-ADV (ad purchase), J-CRED (package purchase), microsite/service
fees (J-SITE) · composed by `J-BUY-06`, `J-VND-06`.

---

## G3. Lead Credit Metering Journey — `J-CRED`

**Breadcrumb:** Atlas ▸ Monetization ▸ Lead Credit Metering Journey

| Ownership | |
|---|---|
| Owner Module | M7 Billing (BC-BILL-4: `lead_credit_accounts` + `lead_credit_transactions`, usage ledger) |
| Participating Modules | M4 (owns the lead-access **action**; Billing owns the usage/credit **effect** — `usage_ledger.source=lead_access`) |
| Authoritative Documents | Doc-4I BC-BILL-4 §HB-4.1 (`credit_lead_account` / `debit_lead_account`); Doc-3 §11 (`leads.credit_value` shortfall credit — Marketplace Economics) |
| Read-only References | Doc-7G (credit balance view) |

**Actors:** ⚙ System (metering, shortfall credits). Primary — vendor org (purchases packages).

**Intent arc:** Package → Balance → Consumption → Top-up.
**Goal:** meter and monetize lead access as a **commercial balance — never procurement
standing**.

**Entry:** vendor org with lead activity (J-LEAD) or a purchased lead package (J-PINV
`purpose lead_package`).
**Exit:** none — a running ledger.

```
purchase package (J-PINV) → credit_lead_account → balance
lead access (J-LEAD) → ⚙ usage_ledger (source=lead_access) → debit_lead_account
shortfall (Doc-3 §11 leads.credit_value) → ⚙ credit_lead_account (compensating credit)
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-CRED-01 | Purchase | lead package → J-PINV (`purpose lead_package`) | Commercial transaction only |
| J-CRED-02 | Credit | `credit_lead_account` (purchase or Doc-3 §11 shortfall credit) | Append to `lead_credit_transactions` — ledger, never rewritten |
| J-CRED-03 | Meter | ⚙ usage ledger on lead access (`source=lead_access`) | **M4 owns the action; M7 owns the effect** (Doc-4I §DF-BILL-4) |
| J-CRED-04 | Debit | `debit_lead_account` (lead consumption) | Balance accounting only |
| J-CRED-05 | Review | balance + transaction reads | Vendor-facing transparency of the commercial ledger |

**Governance rails (moat — binding):** credits **never gate lead delivery or visibility** — leads
are created by seam M6-2 independent of any balance; credits never influence matching, routing,
or eligibility (Doc-4I §31, Doc-4G H.9d); lead credits are "commercial balance, never procurement
standing" (§HB-4.1, quoted stance).
**Success:** ✔ ledger append-only and reconcilable; ✔ zero gating of leads; ✔ shortfall credits
compensate commercially, never operationally.

**Related:** meters J-LEAD activity · purchases via J-PINV · entitlement context J-SUB ·
composed by `J-SUP-06` (pipeline leg), `J-VND` billing legs.

---

## Not Covered (File G ledger)

| Item | Why | Pointer |
|---|---|---|
| Plan catalog authoring lifecycle | Plan `draft → active` is realized by `billing.activate_plan.v1` and operated by Admin — narrated as `J-ADM-06`, not a separate journey | Doc-4I patch; File H |
| Upgrade/downgrade proration mechanics | Doc-4I contract detail — no journey-level states; rides purchase/renewal | Doc-4I |
| Dunning sequences | Communication effects (J-NTF), not billing states | Doc-4H |
| Marketplace commission / transaction fees | Do not exist — the platform never takes buyer↔vendor transaction money | CLAUDE.md §1 |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §3 (`J-BUY-06`), §5
(`J-VND-06`) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-G.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*
