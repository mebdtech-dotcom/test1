-- Doc-6I §3.3 — M7 Billing Usage Ledger Schema Realization — `billing_usage_ledger` (forward-only,
-- Doc-6A §11). W3-BILL-6 — the BC-BILL-3 usage substrate (Doc-2 §10.8): `usage_ledger` (append-only;
-- Controlling-Org attribution; quota metering). Columns + `usage_source` set verbatim Doc-2 §10.8 / Doc-4I
-- H.10 / Doc-6I §3.3. `CREATE SCHEMA billing` already ran in the Wave-0 baseline.
--
-- SCOPE (W3-BILL-6): this table + the READ authorities `enforce_quota` (§HB-3.2, out-of-wire) and
-- `get_usage` (§HB-3.3, wired) — neither writes `entitlement_id`.
-- OUT OF SCOPE — DEFERRED: `record_usage` (§HB-3.1, the sole writer) is Flag-and-Halted on
-- `[ESC-BILL-USAGE-ENTID]` — the `entitlement_id` NOT-NULL FK (mandated here + Doc-2 §10.8 + H.10) has no
-- population path in the frozen `record_usage` contract (no input; Stage-7 "no record-time lookup",
-- F4I-PB1-M1). The table is realized per the frozen schema (NOT NULL FK) pending the owner ruling; a
-- relaxation (Opt C) changes only the one column line (this migration is unpushed).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum (Doc-2 §10.8 / Doc-6I §3.3)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "billing"."usage_source" AS ENUM ('rfq_response', 'lead_access', 'ad_launch');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Table (Doc-6I §3.3; columns verbatim Doc-2 §10.8 / H.10) — append-only (NO SD).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "billing"."usage_ledger" (
  "id"                  uuid                       NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7
  "entitlement_id"      uuid                       NOT NULL,               -- [Doc-2 §10.8 / H.10] in-module FK → entitlements
  "organization_id"     uuid                       NOT NULL,               -- [Doc-2 §10.8] Controlling Org — attribution + RLS anchor
  "acting_user_id"      uuid,                                              -- [Doc-2 §10.8] bare UUID → M1 (acting representative)
  "consuming_entity_id" uuid,                                              -- [Doc-2 §10.8] bare UUID (rfq/lead/ad — polymorphic)
  "quota_key"           text                       NOT NULL,               -- [Doc-2 §10.8] quota units key (free-form at metering — F4I-PB1-M1)
  "amount"              numeric                    NOT NULL,               -- [Doc-2 §10.8] quota units (NOT money)
  "period"              text,                                              -- [Doc-2 §10.8] metering period (YYYY-MM at metering)
  "source"              "billing"."usage_source"   NOT NULL,               -- [Doc-2 §10.8]
  "created_at"          timestamptz                NOT NULL DEFAULT now(), -- [Doc-6A R5] (NO SD — append-only)
  "created_by"          uuid,                                              -- [Doc-2 §0.2] actor
  CONSTRAINT "usage_ledger_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "usage_ledger_entitlement_fk" FOREIGN KEY ("entitlement_id") REFERENCES "billing"."entitlements"("id")
);
-- [§2.5] enforce_quota / get_usage sum key (Doc-6I §6): (org, quota_key, period).
CREATE INDEX "usage_ledger_org_quota_idx" ON "billing"."usage_ledger" ("organization_id", "quota_key", "period");

-- [Doc-6B §4] append-only: block UPDATE/DELETE via the M0-owned column-aware immutability guard (all cols).
CREATE TRIGGER "usage_ledger_immutable"
  BEFORE UPDATE OR DELETE ON "billing"."usage_ledger" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'entitlement_id', 'organization_id', 'acting_user_id', 'consuming_entity_id',
    'quota_key', 'amount', 'period', 'source', 'created_at', 'created_by');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6I §3.x) — org-tenant + admin. GUCs server-set (§2.1): app.active_org, app.is_platform_staff.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "billing"."usage_ledger" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_ledger_tenant" ON "billing"."usage_ledger" FOR ALL
  USING ("organization_id" = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK ("organization_id" = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
