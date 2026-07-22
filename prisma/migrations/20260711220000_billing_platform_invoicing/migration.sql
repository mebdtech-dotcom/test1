-- Doc-6I §3.5 — M7 Billing Platform Invoicing Schema Realization — `billing_platform_invoicing`
-- (forward-only, Doc-6A §11). W3-BILL-8 — the BC-BILL-5 substrate (Doc-2 §10.8): `platform_invoices`
-- (`INV-P-…`; the platform's OWN revenue) + `platform_payments` (gateway records). Columns + enum sets
-- verbatim Doc-2 §10.8 / Doc-6I §3.5. `CREATE SCHEMA billing` already ran in the Wave-0 baseline.
--
-- FIREWALL (BL-CR2): `billing.platform_invoices` ≠ `operations.trade_invoices` — platform fees owed to
-- iVendorz only; NO FK to `operations.*`. `amount`/`currency` are REAL MONEY (platform revenue; the untouched
-- flow is buyer↔vendor TRADE, M4).
--
-- SCOPE (W3-BILL-8 reads pilot): these tables + the READS `get_platform_invoice` (§HB-5.4) +
-- `list_platform_invoices` (§HB-5.4). The writes (`issue_platform_invoice`/`update_invoice_status` §HB-5.1/2)
-- and the out-of-wire `record_payment` gateway callback (§HB-5.3/R8) land in the next slice.
--
-- UNBLOCKS the DEFERRED FK: `lead_credit_transactions.source_invoice_id` → `platform_invoices` (W3-BILL-7
-- created the nullable column; the FK is added here now that `platform_invoices` exists — Doc-6I §7 ordering).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-2 §10.8 / Doc-6I §3.5)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "billing"."invoice_status" AS ENUM ('issued', 'paid', 'overdue', 'void');
CREATE TYPE "billing"."invoice_purpose" AS ENUM ('subscription', 'lead_package', 'advertising', 'microsite', 'service');
CREATE TYPE "billing"."payment_gateway" AS ENUM ('sslcommerz', 'bkash', 'nagad', 'bank');
CREATE TYPE "billing"."payment_status" AS ENUM ('initiated', 'succeeded', 'failed', 'refunded');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-6I §3.5; columns verbatim Doc-2 §10.8) — NO SD (status-tracked, immutable money).
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.5.1 — billing.platform_invoices — the platform's own revenue invoice (≠ trade invoice).
CREATE TABLE "billing"."platform_invoices" (
  "id"              uuid                          NOT NULL,                          -- [Doc-6A §3.1] PK UUIDv7
  "human_ref"       text                          NOT NULL,                          -- [Doc-2 §10.8] INV-P-… (core.allocate_human_ref at issue)
  "organization_id" uuid                          NOT NULL,                          -- [Doc-2 §10.8] debtor org (tenant + platform)
  "subscription_id" uuid,                                                            -- [Doc-6A §5.2] nullable in-module FK
  "amount"          numeric                       NOT NULL,                          -- [Doc-2 §10.8 / R9] PLATFORM revenue (money)
  "currency"        char(3)                       NOT NULL DEFAULT 'BDT',            -- [Doc-2 §10.8] ISO 4217
  "status"          "billing"."invoice_status"    NOT NULL DEFAULT 'issued',         -- [Doc-2 §10.8]
  "purpose"         "billing"."invoice_purpose"   NOT NULL,                          -- [Doc-2 §10.8]
  "created_at"      timestamptz                   NOT NULL DEFAULT now(),
  "updated_at"      timestamptz                   NOT NULL DEFAULT now(),
  "created_by"      uuid,
  "updated_by"      uuid,
  CONSTRAINT "platform_invoices_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "platform_invoices_human_ref_uq" UNIQUE ("human_ref"),
  CONSTRAINT "platform_invoices_subscription_fk" FOREIGN KEY ("subscription_id") REFERENCES "billing"."subscriptions"("id")
  -- NO FK to operations.* — platform_invoices ≠ operations.trade_invoices (firewall, BL-CR2).
);
CREATE INDEX "platform_invoices_org_status_idx" ON "billing"."platform_invoices" ("organization_id", "status");
-- [Doc-6B §4] money/identity frozen; `status` mutable (update_invoice_status); DELETE blocked.
CREATE TRIGGER "platform_invoices_immutable"
  BEFORE UPDATE OR DELETE ON "billing"."platform_invoices" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'human_ref', 'organization_id', 'subscription_id', 'amount', 'currency', 'purpose', 'created_at', 'created_by');

-- §3.5.2 — billing.platform_payments — gateway payment records (platform-owned; record_payment callback).
CREATE TABLE "billing"."platform_payments" (
  "id"                  uuid                          NOT NULL,                       -- [Doc-6A §3.1] PK UUIDv7
  "platform_invoice_id" uuid                          NOT NULL,                       -- [Doc-6A §5.2] in-module FK
  "gateway"             "billing"."payment_gateway"   NOT NULL,                       -- [Doc-2 §10.8]
  "gateway_ref"         text,                                                         -- [Doc-2 §10.8]
  "status"              "billing"."payment_status"    NOT NULL DEFAULT 'initiated',   -- [Doc-2 §10.8]
  "created_at"          timestamptz                   NOT NULL DEFAULT now(),
  "updated_at"          timestamptz                   NOT NULL DEFAULT now(),
  "created_by"          uuid,
  "updated_by"          uuid,
  CONSTRAINT "platform_payments_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "platform_payments_invoice_fk" FOREIGN KEY ("platform_invoice_id") REFERENCES "billing"."platform_invoices"("id")
);
-- [Doc-6B §4] gateway/identity frozen; `status`/`gateway_ref` mutable (callback); DELETE blocked.
CREATE TRIGGER "platform_payments_immutable"
  BEFORE UPDATE OR DELETE ON "billing"."platform_payments" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'platform_invoice_id', 'gateway', 'created_at', 'created_by');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6I §3.x) — GUCs server-set (§2.1): app.active_org, app.is_platform_staff.
-- ─────────────────────────────────────────────────────────────────────────────

-- platform_invoices: org-tenant (debtor) + platform-staff.
ALTER TABLE "billing"."platform_invoices" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_invoices_tenant" ON "billing"."platform_invoices" FOR ALL
  USING ("organization_id" = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK ("organization_id" = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- platform_payments: the debtor org READS via the parent invoice's org; only platform-staff (the System
-- gateway callback) WRITES. Two policies (Doc-6I §3.x): a SELECT policy (org-read) + an ALL policy (staff).
ALTER TABLE "billing"."platform_payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_payments_read" ON "billing"."platform_payments" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM "billing"."platform_invoices" i
                     WHERE i."id" = "platform_payments"."platform_invoice_id"
                       AND i."organization_id" = current_setting('app.active_org', true)::uuid));
CREATE POLICY "platform_payments_admin" ON "billing"."platform_payments" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) Deferred FK now satisfiable — lead_credit_transactions.source_invoice_id → platform_invoices
--     (W3-BILL-7 [ESC-free build-order]: the nullable column was created ahead of this table).
-- ─────────────────────────────────────────────────────────────────────────────
-- `NOT VALID` — enforces the FK for every NEW/updated row while skipping the one-time validation of
-- PRE-EXISTING rows. On a fresh DB (CI/prod) `lead_credit_transactions` is empty when this runs, so this is
-- identical to a plain FK; `NOT VALID` only tolerates local test-DB cruft (append-only + immutable rows from
-- W3-BILL-7 whose `source_invoice_id` was a fake uuid — they cannot be UPDATE/DELETE-cleaned). New rows are
-- fully FK-checked; the column is now integrity-bound to `platform_invoices` (Doc-6I §3.4).
ALTER TABLE "billing"."lead_credit_transactions"
  ADD CONSTRAINT "lead_credit_transactions_source_invoice_fk"
  FOREIGN KEY ("source_invoice_id") REFERENCES "billing"."platform_invoices"("id") NOT VALID;
