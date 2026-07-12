-- Doc-6I §3.6 — M7 Billing Rewards & Referrals Schema Realization — `billing_rewards` (forward-only,
-- Doc-6A §11). W3-BILL-11 — the BC-BILL-6 substrate (Doc-2 §10.8): `reward_accounts` (points balance head;
-- org UNIQUE-partial; SD) + `reward_transactions` (append-only credit/debit points ledger) + `referrals`
-- (`pending→qualified→rewarded`). Columns + enum sets verbatim Doc-2 §10.8 / Doc-6I §3.6. `balance`/`amount`
-- = reward POINTS (units, NOT money — BL-CR10). `CREATE SCHEMA billing` already ran in the Wave-0 baseline.
--
-- SCOPE (W3-BILL-11 reads pilot): these tables + the READS `get_reward_balance` (§HB-6.3) +
-- `list_referrals` (§HB-6.3). The writes — `credit_reward` (§HB-6.1), `track_referral`/`advance_referral`
-- (§HB-6.2) — land in the next slice.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-2 §10.8 / Doc-6I §3.6)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "billing"."reward_txn_type" AS ENUM ('credit', 'debit');
CREATE TYPE "billing"."referral_state" AS ENUM ('pending', 'qualified', 'rewarded');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-6I §3.6; columns verbatim Doc-2 §10.8)
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.6.1 — billing.reward_accounts — org reward-points balance head; one live per org; soft-delete.
CREATE TABLE "billing"."reward_accounts" (
  "id"              uuid          NOT NULL,                          -- [Doc-6A §3.1] PK UUIDv7
  "organization_id" uuid          NOT NULL,                          -- [Doc-2 §10.8] tenant (bare UUID → M1)
  "balance"         numeric       NOT NULL DEFAULT 0,                -- [Doc-2 §10.8] reward POINTS (units, NOT money)
  "created_at"      timestamptz   NOT NULL DEFAULT now(),
  "updated_at"      timestamptz   NOT NULL DEFAULT now(),
  "created_by"      uuid,
  "updated_by"      uuid,
  "deleted_at"      timestamptz,                                     -- [Doc-2 §0.2] soft-delete
  "deleted_by"      uuid,
  "delete_reason"   text,
  CONSTRAINT "reward_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "reward_accounts_org_uq" ON "billing"."reward_accounts" ("organization_id")
  WHERE "deleted_at" IS NULL;

-- §3.6.2 — billing.reward_transactions — append-only points credit/debit ledger (the source of truth).
CREATE TABLE "billing"."reward_transactions" (
  "id"                uuid                              NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7
  "reward_account_id" uuid                              NOT NULL,               -- [Doc-6A §5.2] in-module FK
  "txn_type"          "billing"."reward_txn_type"       NOT NULL,               -- [Doc-2 §10.8] credit/debit
  "amount"            numeric                           NOT NULL,               -- [Doc-2 §10.8] points
  "reason"            text,                                                     -- [Doc-2 §10.8] profile completion / reviews / completions
  "created_at"        timestamptz                       NOT NULL DEFAULT now(), -- [Doc-2 §10.8] (NO SD — append-only)
  "created_by"        uuid,
  CONSTRAINT "reward_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reward_transactions_account_fk" FOREIGN KEY ("reward_account_id")
    REFERENCES "billing"."reward_accounts"("id")
);
CREATE TRIGGER "reward_transactions_immutable"
  BEFORE UPDATE OR DELETE ON "billing"."reward_transactions" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'reward_account_id', 'txn_type', 'amount', 'reason', 'created_at', 'created_by');

-- §3.6.3 — billing.referrals — referral tracking; state machine pending→qualified→rewarded; NO SD.
CREATE TABLE "billing"."referrals" (
  "id"                       uuid                            NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7
  "referrer_organization_id" uuid                            NOT NULL,               -- [Doc-2 §10.8] referrer (tenant anchor)
  "referred_organization_id" uuid,                                                   -- [Doc-2 §10.8] referred (bare UUID → M1)
  "state"                    "billing"."referral_state"      NOT NULL DEFAULT 'pending', -- [Doc-2 §10.8]
  "created_at"               timestamptz                     NOT NULL DEFAULT now(),
  "updated_at"               timestamptz                     NOT NULL DEFAULT now(),
  "created_by"               uuid,
  "updated_by"               uuid,
  CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "referrals_referrer_idx" ON "billing"."referrals" ("referrer_organization_id", "state");

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6I §3.x) — org-tenant + admin. GUCs server-set (§2.1): app.active_org, app.is_platform_staff.
-- ─────────────────────────────────────────────────────────────────────────────

-- reward_accounts: the org owns its account (org-anchored) OR platform-staff.
ALTER TABLE "billing"."reward_accounts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reward_accounts_tenant" ON "billing"."reward_accounts" FOR ALL
  USING ("organization_id" = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK ("organization_id" = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- referrals: anchored on the REFERRER org (a referrer reads/writes its own referrals) OR platform-staff.
ALTER TABLE "billing"."referrals" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_tenant" ON "billing"."referrals" FOR ALL
  USING ("referrer_organization_id" = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK ("referrer_organization_id" = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- reward_transactions: visible/writable via the parent account's org (or platform-staff); the immutability
-- trigger blocks UPDATE/DELETE regardless (append-only). The txn row carries no org column (parent anchor).
ALTER TABLE "billing"."reward_transactions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reward_transactions_tenant" ON "billing"."reward_transactions" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM "billing"."reward_accounts" a
                     WHERE a."id" = "reward_transactions"."reward_account_id"
                       AND a."organization_id" = current_setting('app.active_org', true)::uuid))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
              OR EXISTS (SELECT 1 FROM "billing"."reward_accounts" a
                          WHERE a."id" = "reward_transactions"."reward_account_id"
                            AND a."organization_id" = current_setting('app.active_org', true)::uuid));
