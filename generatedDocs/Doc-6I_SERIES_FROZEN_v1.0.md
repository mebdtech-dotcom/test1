# Doc-6I — M7 Monetization / Billing (`billing`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6I Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M7 — Monetization / Billing** (`billing` schema) — the **platform's OWN revenue** (`platform_invoices ≠ operations.trade_invoices`); the **billing firewall** (no billing state gates procurement); **entitlements, never plan-name** (Financial Tier ≠ Subscription Plan) |
| Realizes | **Doc-2 §10.8** — **13 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with Doc-5I; consumes Doc-6B (`core`) + Doc-6C/6D (UUID); Doc-4I (+ ActivatePlan patch) |
| Freeze evidence | `Doc-6I_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 phases PASS. Cross-pass `Doc-6I_Content_Hard_Review_v1.0.md` — 0 BLOCKER/MAJOR; firewall + platform-revenue boundary verified; HR-I1 migration-order reconciled |

---

## Effective set (the authoritative Doc-6I)

| Artifact | Role |
|---|---|
| `Doc-6I_Structure_v1.0_FROZEN.md` | Frozen structure — BL-CR1–CR12, 13-table partition, entitlement model, billing firewall, platform-revenue boundary, §5.7 machine, Appendix-A map |
| `Doc-6I_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6I_Content_v1.0_Pass1.md` | §0–§2 firewall model · Plans & Entitlements (resolve-by-value, not plan-name) · Subscriptions (§5.7; one-active; 3 §8 events) |
| `Doc-6I_Content_v1.0_Pass2.md` | Usage (append-only; controlling-org) · Lead Credits · Platform Invoicing (`INV-P-…`; `≠ trade_invoices`; gateway; `record_payment`=callback) |
| `Doc-6I_Content_v1.0_Pass3.md` | Rewards/Referrals (points; state) · §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6I_Content_Hard_Review_v1.0.md` | Cross-pass review — 0 BLOCKER/MAJOR; firewall + platform-revenue boundary verified end-to-end; HR-I1 migration-order/FK reconciled |
| `Doc-6I_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6I realizes (the `billing` schema)

- **13 tables / 6 groupings** (Doc-2 §10.8), columns verbatim: Plans & Entitlements, Subscriptions (+events), Usage, Lead Credits (+transactions), Platform Invoicing (+payments), Rewards/Referrals.
- **The platform's OWN revenue** — `platform_invoices` (`INV-P-…`; `purpose` subscription/lead-package/advertising/microsite/service) collected via `platform_payments` (gateway sslcommerz/bkash/nagad/bank). **`platform_invoices ≠ operations.trade_invoices`** (no `operations` FK; firewalled). The buyer↔vendor **trade** money (M4) is untouched; M7's gateway is **platform money**. **`record_payment` = gateway callback (Doc-5I R8), not a §8 event.**
- **The billing firewall** (Invariant #6/#10) — **no billing state gates trust/eligibility/routing/matching**; no M3/M5 read of a billing column. **Entitlements (boolean/numeric/enum), never plan-name** (`resolve_entitlements` over `plan_entitlements.value_jsonb`/`default_value`); **Financial Tier (M5) ≠ Subscription Plan (M7)**.
- **Subscription §5.7** (`pending_payment/active/expired`) + **one-active partial-unique**; entitlements resolve only from `active` (else Basic — A-11); **exactly 3 §8 events** (`SubscriptionPurchased`/`Renewed`/`Expired` — Doc-5I R9).
- **Append-only** usage ledger (controlling-org attribution; `enforce_quota`), lead-credit + reward transactions, subscription events; **column-scoped** invoices/payments (money/gateway frozen, status mutable) — via `core.raise_immutable_violation` (Doc-6B §4).
- **Money vs points** — only `plans.price` + `platform_invoices.amount` are money (currency); usage/lead-credits/reward-points are non-monetary counts (CHK-6-050 distinction explicit).
- **`human_ref`** = `platform_invoices` (`INV-P-…`) only; cross-module = bare UUID (incl. M2 `advertisements.platform_invoice_id` — DD-MKT); coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (machines) · `DR-6-API` (Doc-5I Band H) · DD-MKT (ad invoice) / DD-CORE (subscription events) · **Billing firewall** (realized — no billing state gates procurement; entitlements not plan-name) · **Platform-revenue boundary** (realized — `platform_invoices ≠ trade_invoices`) · **`[ESC-BILL-AUDIT]`** (billing audit actions vs Doc-2 §9 — bind nearest by pointer) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.6). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + billing-firewall negative test + the `record_payment`-callback path (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MAJOR — platform-revenue boundary + billing firewall) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (plan-name gate, one-active unique, event immutability, invoice firewall-link, money immutability, ledger immutability, points-not-money, reward immutability) · **cross-pass Content Hard Review** (0 BLOCKER/MAJOR — firewall + platform-revenue boundary verified end-to-end; **HR-I1** migration-order/FK reconciled) · Content Freeze Audit (PASS).

---

*Doc-6I (M7 `billing` schema) is FROZEN. Realizes Doc-2 §10.8's 13 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — the platform's own revenue (`platform_invoices ≠ operations.trade_invoices`; gateway = platform money, the trade flow untouched); the billing firewall (no billing state gates procurement); entitlements never plan-name (Financial Tier ≠ Subscription Plan); 3 subscription §8 events; `record_payment`=callback; coins nothing. Carried: billing firewall + platform-revenue boundary (realized) + `[ESC-BILL-AUDIT]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6J (M8 `admin`) — the authoritative event catalog; Admin decides, owning module owns.*
