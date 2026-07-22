-- Doc-6I §3.4 — M7 Billing Lead Credits Schema Realization — `billing_lead_credits` (forward-only,
-- Doc-6A §11). W3-BILL-7 — the BC-BILL-4 substrate (Doc-2 §10.8): `lead_credit_accounts` (balance head;
-- org UNIQUE-partial) + `lead_credit_transactions` (append-only credit/debit ledger). Columns +
-- `lead_credit_txn_type` set verbatim Doc-2 §10.8 / Doc-6I §3.4. `balance`/`amount` = lead CREDITS (units,
-- NOT money — BL-CR7). `CREATE SCHEMA billing` already ran in the Wave-0 baseline.
--
-- SCOPE (W3-BILL-7 reads pilot): this table + the READS `get_lead_balance` (§HB-4.2) +
-- `list_lead_transactions` (§HB-4.2). The credit/debit WRITES (§HB-4.1) land in the next slice.
--
-- DEFERRED FK (build-order): `lead_credit_transactions.source_invoice_id` → `platform_invoices` (BC-BILL-5,
-- §3.5) is realized as a NULLABLE COLUMN WITHOUT the FK here — `platform_invoices` is not yet built (owner
-- sequenced BC-BILL-4 before BC-BILL-5). Doc-6I §7 anticipates the ordering ("platform_invoices migrated
-- first"); the FK is added in the BC-BILL-5 migration via ALTER (forward-only). No row sets it in this pilot.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum (Doc-2 §10.8 / Doc-6I §3.4)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "billing"."lead_credit_txn_type" AS ENUM ('credit', 'debit');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-6I §3.4; columns verbatim Doc-2 §10.8)
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.4.1 — billing.lead_credit_accounts — org balance head; one per org (partial-unique); soft-delete.
CREATE TABLE "billing"."lead_credit_accounts" (
  "id"              uuid          NOT NULL,                          -- [Doc-6A §3.1] PK UUIDv7
  "organization_id" uuid          NOT NULL,                          -- [Doc-2 §10.8] tenant (bare UUID → M1)
  "balance"         numeric       NOT NULL DEFAULT 0,                -- [Doc-2 §10.8] lead credits (units, NOT money)
  "created_at"      timestamptz   NOT NULL DEFAULT now(),            -- [Doc-6A R5]
  "updated_at"      timestamptz   NOT NULL DEFAULT now(),
  "created_by"      uuid,                                            -- [Doc-2 §0.2] actor
  "updated_by"      uuid,
  "deleted_at"      timestamptz,                                     -- [Doc-2 §0.2] soft-delete
  "deleted_by"      uuid,
  "delete_reason"   text,
  CONSTRAINT "lead_credit_accounts_pkey" PRIMARY KEY ("id")
);
-- [Doc-2 §10.8 binding] one live account per org (partial-unique).
CREATE UNIQUE INDEX "lead_credit_accounts_org_uq" ON "billing"."lead_credit_accounts" ("organization_id")
  WHERE "deleted_at" IS NULL;

-- §3.4.2 — billing.lead_credit_transactions — append-only credit/debit ledger (the source of truth).
CREATE TABLE "billing"."lead_credit_transactions" (
  "id"                     uuid                                NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7
  "lead_credit_account_id" uuid                                NOT NULL,               -- [Doc-6A §5.2] in-module FK
  "txn_type"               "billing"."lead_credit_txn_type"    NOT NULL,               -- [Doc-2 §10.8] credit/debit
  "amount"                 numeric                             NOT NULL,               -- [Doc-2 §10.8] credits
  "source_invoice_id"      uuid,                                                       -- [Doc-6A §5.2] FK → platform_invoices DEFERRED (BC-BILL-5)
  "created_at"             timestamptz                         NOT NULL DEFAULT now(), -- [Doc-2 §10.8] (NO SD — append-only)
  "created_by"             uuid,                                                       -- [Doc-2 §0.2] actor
  CONSTRAINT "lead_credit_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_credit_transactions_account_fk" FOREIGN KEY ("lead_credit_account_id")
    REFERENCES "billing"."lead_credit_accounts"("id")
);
-- [Doc-6B §4] append-only: block UPDATE/DELETE via the M0-owned column-aware immutability guard.
CREATE TRIGGER "lead_credit_transactions_immutable"
  BEFORE UPDATE OR DELETE ON "billing"."lead_credit_transactions" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'lead_credit_account_id', 'txn_type', 'amount', 'source_invoice_id', 'created_at', 'created_by');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6I §3.x) — org-tenant + admin. GUCs server-set (§2.1): app.active_org, app.is_platform_staff.
-- ─────────────────────────────────────────────────────────────────────────────

-- lead_credit_accounts: the org owns its account (org-anchored) OR platform-staff.
ALTER TABLE "billing"."lead_credit_accounts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_credit_accounts_tenant" ON "billing"."lead_credit_accounts" FOR ALL
  USING ("organization_id" = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK ("organization_id" = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- lead_credit_transactions: visible/writable via the parent account's org (or platform-staff); the
-- immutability trigger blocks UPDATE/DELETE regardless (append-only). The txn row carries no org column —
-- the anchor is the parent account (the subscription_events pattern).
ALTER TABLE "billing"."lead_credit_transactions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_credit_transactions_tenant" ON "billing"."lead_credit_transactions" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM "billing"."lead_credit_accounts" a
                     WHERE a."id" = "lead_credit_transactions"."lead_credit_account_id"
                       AND a."organization_id" = current_setting('app.active_org', true)::uuid))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
              OR EXISTS (SELECT 1 FROM "billing"."lead_credit_accounts" a
                          WHERE a."id" = "lead_credit_transactions"."lead_credit_account_id"
                            AND a."organization_id" = current_setting('app.active_org', true)::uuid));
