# Doc-6I — M7 Billing (`billing`) Schema Realization — **Content Hard Review v1.0** (cross-pass, full §0–§8 + Appendix A)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** — independent of the pass authors |
| Target | `Doc-6I_Content_v1.0_Pass1/2/3.md` (13 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the integration-seam gate (the billing firewall + platform-revenue boundary end-to-end, immutability vs the *actual* Doc-6B §4 body, the cross-aggregate FK + migration order, money-vs-points) |
| Basis | `Doc-2 v1.0.3 §10.8/§5.7`; `Doc-6A` (Appendix A); **`Doc-6B §4`**; Doc-6D/6F (immutability lessons); Doc-5I (R5/R8/R9); Doc-3 v1.6 |
| Verdict | **0 BLOCKER + 0 MAJOR; 1 MINOR + 1 OBSERVATION confirmed.** Billing firewall + platform-revenue boundary verified end-to-end. **Ready for Content Freeze Audit.** |

> **Method note.** Verified (a) the **billing firewall** (no billing state gates procurement; no M3/M5 read; entitlements-not-plan) end-to-end, (b) the **platform-revenue boundary** (`platform_invoices` has no `operations` link; money frozen), (c) every immutability attachment vs the actual Doc-6B §4 body, and (d) the cross-aggregate FK + migration order. The passes proactively applied the accumulated lessons — no BLOCKER recurred.

---

## 1 — Coverage (13/13)
| Pass | Tables | n |
|---|---|---|
| Pass-1 | plans · entitlements · plan_entitlements · subscriptions · subscription_events | 5 |
| Pass-2 | usage_ledger · lead_credit_accounts · lead_credit_transactions · platform_invoices · platform_payments | 5 |
| Pass-3 | reward_accounts · reward_transactions · referrals | 3 |
| **Total** | = **Doc-2 §10.8 exactly** (reward acc/tx = 2) | **13** |

No 14th; none missing. **PASS.**

---

## 2 — Headline verifications

### Billing firewall (Invariant #6/#10) + entitlements-not-plan
**No `billing` column is read by M3/M5; no billing state gates trust/eligibility/routing/matching.** Entitlements resolve from `plan_entitlements.value_jsonb` / `entitlements.default_value` (typed boolean/numeric/enum) via `resolve_entitlements` — **never** a plan-name check. **Financial Tier (M5) ≠ Subscription Plan (M7).** **PASS.**

### Platform-revenue boundary (`platform_invoices ≠ operations.trade_invoices`)
`platform_invoices` has **no FK to `operations`** — the platform's own revenue (subscription/lead-package/advertising/microsite/service), collected via `platform_payments` (gateway = platform money). The buyer↔vendor **trade** flow (M4) is untouched. **`record_payment` = gateway callback (R8), not a §8 event**; only the 3 subscription §8 events (R9). **PASS.**

---

## 3 — Cross-pass integration checks (PASS)

| Seam | Result |
|---|---|
| **Immutability vs Doc-6B §4** | `subscription_events`/`usage_ledger`/`lead_credit_transactions`/`reward_transactions` full append-only (all cols); `platform_invoices`/`platform_payments` column-scoped (money/gateway frozen, status mutable) — all pass protected-col `TG_ARGV`; no PERFORM-of-trigger-fn; no empty-args UPDATE-open | PASS |
| **Cross-aggregate FK** | `lead_credit_transactions.source_invoice_id → platform_invoices` (intra-schema, cross-grouping) | PASS |
| **Enum singletons** | each `CREATE TYPE billing.*` once; §7 enums-first | PASS |
| **Money vs points** | only `plans.price` + `platform_invoices.amount` carry currency; usage/lead-credits/reward-points are non-monetary counts (no currency) — CHK-6-050 distinction explicit | PASS |
| **human_ref** | `INV-P-…` on `platform_invoices` only (CHK-6-002) | PASS |
| **§8 events** | exactly 3 subscription events (R9); `record_payment`=callback (R8); none coined | PASS |
| **Coin-nothing** | nothing coined; reward `txn_type`/`reason` §2.5; `[ESC-BILL-AUDIT]` carried | PASS |
| **Appendix A** | 37/37 (Pass-3); N/A 033/062 justified; 043 PASS-with-carry | PASS |

---

## 4 — Findings

### MINOR HR-I1 — migration order: `platform_invoices` must precede `lead_credit_transactions`
**Where:** structure §7 (indicative) listed `lead_credit_*` **before** `platform_invoices`; Pass-2 realized `lead_credit_transactions.source_invoice_id → platform_invoices` as an **inline** FK.
**Disposition: RESOLVED in content §7.** The Pass-3 §7 migration order places `platform_invoices` **before** `lead_credit_transactions`, so the inline FK resolves. The content §7 order is the binding realization (the structure §7 order was indicative — §2.5). No runtime gap. *(Alternative: a deferred `ALTER` — not needed given the corrected order.)*

### OBSERVATION HR-I2 — `platform_payments` creation is service-mediated
`platform_payments` grants org **read** + admin FOR ALL; no org INSERT policy → a payment is created by the checkout **service** (System/owner-role) and advanced by the gateway callback. **Confirmed correct** — payment creation/advance is service/System, not a direct org write. No change.

---

## 5 — Decision

**0 BLOCKER, 0 MAJOR; 1 MINOR resolved-in-content + 1 OBSERVATION by-design.** The passes proactively applied the accumulated lessons (immutability args, money column-scoped, firewall discipline). The gate verified the two load-bearing properties — the billing firewall (no billing state gates procurement; entitlements-not-plan) and the platform-revenue boundary (`platform_invoices ≠ trade_invoices`; money frozen) — end-to-end, and reconciled the migration-order/FK seam. Coverage 13/13; immutability correct vs Doc-6B §4.

**Authorized next step:** **Content Freeze Audit** → `Doc-6I_SERIES_FROZEN_v1.0` → fold corpus. **Carried:** `[ESC-BILL-AUDIT]`.

---

*End of Doc-6I Content Hard Review v1.0 (cross-pass). 0 BLOCKER/MAJOR; billing firewall + platform-revenue boundary verified end-to-end; immutability matches Doc-6B §4; migration-order/FK reconciled (HR-I1); coverage 13/13. On any conflict, Doc-2 and Doc-6A win; flag-and-halt. Next: Content Freeze Audit → `Doc-6I_SERIES_FROZEN`.*
