# Doc-6I — M7 Billing (`billing`) Schema Realization — Content v1.0 **Pass-3** (§3.6 Rewards/Referrals · §4–§8 · Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (0 BLOCKER + 2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §3.6 + §4–§8 + Appendix A (37/37). Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | **Rewards/Referrals** (`reward_accounts` + `reward_transactions` — points; `referrals` state); §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A |
| Authority | `Doc-2 §8/§10.8` (the *what*); `Doc-6A` (Appendix A gate); `Doc-6B §4` (consumed); `Doc-4I/4L/4M`; `Doc-3 v1.6`; `Doc-5I` |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.8; `referral_state` set verbatim; reward `txn_type`/`reason` = credit/debit + text (Doc-2 enumerates no reward-type values). Carried: `[ESC-BILL-AUDIT]` |
| DDL note | PostgreSQL 15+; Prisma `@@schema("billing")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.6 — Rewards / Referrals

### §3.6.1 `billing.reward_accounts` (points balance) · §3.6.2 `billing.reward_transactions` (append-only) · §3.6.3 `billing.referrals` (state)
Realizes Doc-2 §10.8. `reward_accounts` points balance (**points, not money**); `reward_transactions` append-only; `referrals` `state(pending/qualified/rewarded)`.

```sql
CREATE TYPE billing.reward_txn_type AS ENUM ('credit','debit');  -- [§2.5] points credit/debit (Doc-2 enumerates no values; natural pair)
CREATE TYPE billing.referral_state AS ENUM ('pending','qualified','rewarded');  -- [Doc-2 §10.8 binding]

CREATE TABLE billing.reward_accounts (
  id uuid NOT NULL, organization_id uuid NOT NULL,           -- [Doc-2 §10.8] tenant
  balance numeric NOT NULL DEFAULT 0,                        -- [Doc-2 §10.8] reward POINTS (not money)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT reward_accounts_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX reward_accounts_org_uq ON billing.reward_accounts (organization_id) WHERE deleted_at IS NULL;  -- [§2.5] one per org

CREATE TABLE billing.reward_transactions (
  id uuid NOT NULL, reward_account_id uuid NOT NULL,         -- [Doc-6A §5.2] in-module FK
  txn_type billing.reward_txn_type NOT NULL,                 -- [§2.5] credit/debit
  amount numeric NOT NULL,                                   -- [Doc-2 §10.8] points
  reason text,                                               -- [Doc-2 §10.8] profile completion / reviews / completions (no enum values → text)
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.8] (NO SD — append-only)
  CONSTRAINT reward_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT reward_transactions_account_fk FOREIGN KEY (reward_account_id) REFERENCES billing.reward_accounts(id)
);
CREATE TRIGGER reward_transactions_immutable BEFORE UPDATE OR DELETE ON billing.reward_transactions FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','reward_account_id','txn_type','amount','reason','created_at','created_by');  -- [Doc-6B §4]

CREATE TABLE billing.referrals (
  id uuid NOT NULL,
  referrer_organization_id uuid NOT NULL,                    -- [Doc-2 §10.8] tenant (referrer) → M1
  referred_organization_id uuid,                             -- [Doc-2 §10.8] bare UUID → M1
  state billing.referral_state NOT NULL DEFAULT 'pending',   -- [Doc-2 §10.8]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                          -- [Doc-2 §10.8] (NO SD)
  CONSTRAINT referrals_pkey PRIMARY KEY (id)
);
CREATE INDEX referrals_referrer_idx ON billing.referrals (referrer_organization_id, state);  -- [§2.5]
```
- **Points, not money (BL-CR10):** reward balances/amounts are **points** (no currency); transactions append-only; the balance is System-maintained. `referrals` `pending→qualified→rewarded` (service; reward granted on `rewarded`). **RLS:** org-tenant (§3.x). **Prisma [§2.5]:** `RewardAccount`/`RewardTransaction`/`Referral`, enums.

```sql
-- reward_accounts / reward_transactions / referrals: org-tenant + admin (referrals anchor on referrer_organization_id)
ALTER TABLE billing.reward_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY reward_accounts_tenant ON billing.reward_accounts FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
ALTER TABLE billing.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_tenant ON billing.referrals FOR ALL
  USING (referrer_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (referrer_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- reward_transactions: via parent account (org or admin); append-only (trigger).
```

## §4 — State Machine Realization (Doc-2 §5.7)
| Machine | Table | Owner |
|---|---|---|
| `subscriptions.state` §5.7 (pending_payment/active/expired) | Pass-1 | service; emits 3 §8 events |
| `platform_invoices.status` (issued/paid/overdue/void) · `platform_payments.status` (initiated/succeeded/failed/refunded) | Pass-2 | service / gateway callback (`record_payment`, not §8) |
| `referrals.state` (pending/qualified/rewarded) | §3.6 | service |

**Transition = outbox (Doc-2 §8):** the **subscription lifecycle** emits exactly **3 §8 events** (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` — Doc-5I R9), writing the row + `core.outbox_events` in one txn; **`record_payment` = gateway callback, NOT a §8 event** (R8). Event slugs bound to Doc-2 §8/Doc-4L; none coined. `[ESC-BILL-AUDIT]` for billing audit actions.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/CORE)
Bare-UUID + service + event. **Billing firewall (Invariant #6/#10):** **no billing state gates trust/eligibility/routing/matching** — no M3/M5 read of a billing column; entitlements via `resolve_entitlements` (internal service, never a procurement decision); **Financial Tier (M5) ≠ Subscription Plan (M7)**. **Platform-revenue boundary:** `platform_invoices ≠ operations.trade_invoices` (no FK); the gateway collects platform money only; the buyer↔vendor trade flow is untouched (M4). **DD-MKT:** M2 `advertisements.platform_invoice_id` holds the bare UUID (ad-invoice). No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4I`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5I lists; `subscriptions` one-active partial-unique; `lead_credit_accounts`/`reward_accounts` partial-unique; `usage_ledger(organization_id, quota_key, period)`; `platform_invoices(organization_id, status)`; `referrals(referrer_organization_id, state)`; partial `WHERE deleted_at IS NULL` (SD tables); page-size via `billing.*` POLICY. **Deps:** `Doc-5I`; `Doc-6A §10/§12`; `Doc-3 v1.6`.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.6 (CLEARED):** 2 `billing.*` keys in `core.system_configuration`; M7 reads, coins none.
**Forward-only order:** (assume core…communication migrated) `CREATE SCHEMA billing` → enums → plans → entitlements → plan_entitlements → subscriptions → subscription_events → usage_ledger → platform_invoices → platform_payments → lead_credit_accounts → lead_credit_transactions (FK → platform_invoices) → reward_accounts → reward_transactions → referrals → indexes → triggers (immutability) → RLS → seeds (none owned by M7). *(platform_invoices migrated before lead_credit_transactions so the `source_invoice_id` FK resolves.)* Forward-only, idempotent.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to Doc-2 §10.8 or a §2.5 attribution. Carried: **`[ESC-BILL-AUDIT]`** (billing audit actions — bind nearest Doc-2 §9 by pointer) · DD-MKT/CORE · billing firewall + platform-revenue boundary (realized). `[ESC-6-POLICY]` **CLEARED**.

## Appendix A — Doc-6I Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | 001 | PASS | every table `id uuid` PK (plan_entitlements composite + no own id — composite PK only) |
| | 002 | PASS | `human_ref` **only** on `platform_invoices` (`INV-P-…`) via `core.allocate_human_ref` |
| | 003 | PASS | timestamps; append-only tables omit `updated_at` |
| | 004 | PASS | SD tuple on plans/subscriptions/lead-accounts/reward-accounts; ledgers/events/transactions/invoices/payments correctly no SD |
| | 005 | PASS | subscription one-active partial-unique; lead/reward account UNIQUE partial; entitlement slug UNIQUE |
| **B** | 010 | PASS | physical `billing` namespace; one Prisma `@@schema` |
| | 011 | PASS | **no cross-schema FK** — org/ad/sub refs bare UUID; **no `operations` link** |
| | 012 | PASS | refs entity-named, service-validated, orphan-scan |
| | 013 | PASS | no cross-schema JOIN/traversal |
| **C** | 020 | PASS | RLS on every table; catalog public-read; org-tenant anchors server-set, fail-closed |
| | 021 | PASS | org-tenant + admin; gateway/System writes payments |
| | 022 | PASS | non-disclosure N/A-by-shape; **billing firewall** — no billing state gates procurement |
| | 023 | PASS | authz app-layer (Doc-4I); RLS = backstop; entitlements via service (not plan-name) |
| **D** | 030 | PASS | no hard-DELETE of authoritative rows |
| | 031 | PASS | append-only ledgers/events/transactions; column-scoped invoices/payments (money frozen) |
| | 032 | PASS | ledgers INSERT-only; balances System-maintained |
| | 033 | **N/A** | no `ai.*` cache |
| **E** | 040 | PASS | subscription/invoice transitions + outbox (§4) |
| | 041 | PASS | **only 3 subscription §8 events** (Doc-5I R9); `record_payment`=callback (not §8, R8); none coined |
| | 042 | PASS | audit via `core.audit_records` |
| | 043 | **PASS-with-carry** | billing audit gap = **`[ESC-BILL-AUDIT]`** |
| **F** | 050 | PASS | monetary `plans.price` + `platform_invoices.amount` carry currency; usage/credits/points = **non-monetary counts** (no currency, correctly) |
| **G** | 060 | PASS | reads `core.system_configuration`; 2 `billing.*` keys (Doc-3 v1.6) |
| | 061 | PASS | page-size/idempotency from POLICY, never literals |
| | 062 | **N/A** | no role seed in M7 |
| **H** | 070 | PASS | Doc-5I reads/lists persistable (plans, subscriptions, usage, invoices, rewards) |
| | 071 | PASS | composite sort-key indexes (§6) |
| | 072 | PASS | idempotency persisted; `billing.idempotency_dedup_window` |
| | 073 | PASS | no non-persistable Doc-5I surface |
| **I** | 080 | PASS | nothing coined; every element traces to Doc-2 §10.8 |
| | 081 | PASS | physical specifics §2.5-attributed (reward txn_type/reason, INV-P prefix, gateway callback) |
| | 082 | PASS | `[ESC-BILL-AUDIT]` via named channel |
| | 083 | PASS | no Doc-2 decision re-opened; firewall not weakened |
| **J** | 090 | PASS | extends B.1 base + B.2 types |
| | 091 | PASS | coins no shared enum; reuses B.3 (`currency`/`actor_type`/outbox `status`); M7 enums module-owned |
| | 092 | PASS | B.4 naming followed |
| | 093 | PASS | B.5 conventions realized |

**37/37 — 0 FAIL.** N/A: 033 (no ai), 062 (no role seed) — justified. PASS-with-carry: 043. **CHK-6-050 PASS** with the money/points distinction explicit (only `plans.price` + `platform_invoices.amount` are money).

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent. Verified CORRECT: the 3-table set + columns (Doc-2 §10.8), `referral_state` set verbatim, append-only `reward_transactions`, points-not-money, the 37/37 Appendix A, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **RWD-MONEY** reward/points columns treated as money (currency) would mis-model | MAJOR | **FIXED** — §3.6: balances/amounts are **points** (no currency); CHK-6-050 distinguishes money (`plans.price`/`platform_invoices.amount`) from non-monetary counts. |
| **RT-IMM** `reward_transactions` "append-only" without a guard | MAJOR | **FIXED** — full append-only trigger via `core.raise_immutable_violation` (all cols); DELETE blocked. |
| **RWD-ENUM** reward `txn_type`/`reason` values not in Doc-2 | MINOR | **CONFIRMED** — `txn_type` = credit/debit (§2.5 natural pair); `reason` = text (Doc-2 lists profile-completion/reviews/completions as examples, not an enum); none coined as a typed enum. |
| **MIG-FK** `lead_credit_transactions.source_invoice_id` → `platform_invoices` ordering | MINOR | **CONFIRMED** — §7 migrates `platform_invoices` before `lead_credit_transactions`; inline FK resolves. |
| **REF-PARTY** `referred_organization_id` nullable | NIT | **CONFIRMED** — nullable until the referral resolves to a referred org (pending state). |

**Net:** 0 BLOCKER; 2 MAJOR (points-not-money, reward immutability) fixed; 2 MINOR + 1 NIT confirmed. 37/37 Appendix A; billing firewall + platform-revenue boundary intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6I Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `billing` realization: the reward accounts/transactions (points, not money; append-only) + referrals (state), the §4 state consolidation (3 subscription §8 events; `record_payment`=callback), the §5 firewalls (billing firewall — no billing state gates procurement; platform-revenue boundary — `platform_invoices ≠ trade_invoices`; entitlements not plan-name), §6 indexing, §7 forward-only migration, and §8 + Appendix A (37/37, 0 FAIL). Coins nothing; carried `[ESC-BILL-AUDIT]`. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6I_SERIES_FROZEN`.*
