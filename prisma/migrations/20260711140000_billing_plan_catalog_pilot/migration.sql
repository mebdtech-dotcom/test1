-- Doc-6I — M7 Billing / Monetization (`billing`) Schema Realization — `billing_plan_catalog_pilot`
-- (forward-only; Doc-6A §11). W3-BILL-1 [Wave-3 M7 pilot slice] — the two authenticated
-- Platform-Public catalog reads `billing.get_plan.v1` (Doc-4I §HB-1.4 / Doc-5I §4 `GET /billing/plans/{plan_id}`)
-- and `billing.list_plans.v1` (Doc-4I §HB-1.4 / Doc-5I §4 `GET /billing/plans`).
--
-- Realizes the Plans & Entitlements grouping (Doc-6I §3.1, columns verbatim Doc-2 §10.8):
--   billing.plans (§3.1.1) + billing.entitlements (§3.1.2) + billing.plan_entitlements (§3.1.3),
-- plus their consolidated RLS (Doc-6I §3.x — catalog public-read + admin-write). Because all three
-- tables are created in THIS migration, the `plan_entitlements` FKs to plans/entitlements are INLINE.
--
-- The logical plan `status` (draft|active|retired — Doc-2 §3.8) is DERIVED, never a stored column
-- (Doc-2 §10.8: `plans` carries no `status` — only `is_active` + soft-delete, where "SD = retire"):
-- retired ⟺ deleted_at IS NOT NULL; active ⟺ is_active AND deleted_at IS NULL; draft otherwise.
--
-- OUT OF SCOPE (land with their own M7 slices): subscriptions (+events), usage_ledger, lead_credit_*,
-- platform_invoices (+payments), reward_* / referrals — Doc-6I §3.2–§3.6.
--
-- Tables/columns are realized by Prisma (schema.prisma); enums / FKs / composite-PK / RLS are raw SQL
-- here. `CREATE SCHEMA billing` already ran in the Wave-0 baseline (00000000000000_init_schemas).
--
-- NOTE: `[Doc-2 §10.8 binding]` = column/type/constraint verbatim from Doc-2 §10.8 / Doc-6I §3.1;
--       `[§2.5 choice]` = physical realization (names, defaults) per Doc-6I §2.5.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6I §3.1.1 / §3.1.2) — declared before the tables that use them
-- ─────────────────────────────────────────────────────────────────────────────

-- [Doc-2 §10.8 binding] plan billing cycle
CREATE TYPE "billing"."billing_cycle" AS ENUM ('monthly', 'annual');
-- [Doc-2 §10.8 binding] entitlement value type
CREATE TYPE "billing"."entitlement_type" AS ENUM ('boolean', 'numeric', 'enum');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-2 §10.8 columns verbatim; physical specifics [§2.5]) — FK-valid order:
--     plans (no deps) → entitlements (no deps) → plan_entitlements (needs both).
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.1.1 — billing.plans — platform-owned marketing catalog. NO trust/procurement state (billing
-- firewall — Doc-6I §1/§2). `status` is derived (see header); soft-delete = retire.
CREATE TABLE "billing"."plans" (
  "id"            uuid                    NOT NULL,                          -- [Doc-6A §3.1] PK UUIDv7
  "name"          text                    NOT NULL,                          -- [Doc-2 §10.8]
  "billing_cycle" "billing"."billing_cycle" NOT NULL,                        -- [Doc-2 §10.8]
  "price"         numeric                 NOT NULL,                          -- [Doc-2 §10.8] money (currency-scoped)
  "currency"      char(3)                 NOT NULL DEFAULT 'BDT',            -- [Doc-2 §10.8 / Doc-6I R9] ISO 4217
  "is_active"     boolean                 NOT NULL DEFAULT false,            -- [Doc-2 §10.8] marketing-visibility flag
  "created_at"    timestamptz             NOT NULL DEFAULT now(),            -- [Doc-6A R5]
  "updated_at"    timestamptz             NOT NULL DEFAULT now(),
  "created_by"    uuid,                                                      -- [Doc-2 §0.2] actor
  "updated_by"    uuid,
  "deleted_at"    timestamptz,                                               -- [Doc-2 §10.8] SD = retire
  "deleted_by"    uuid,
  "delete_reason" text,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- §3.1.2 — billing.entitlements — typed catalog; `slug` UNIQUE. NO soft-delete (Doc-2 §10.8 — a
-- catalog definition; retirement is a plan concern, not an entitlement one).
CREATE TABLE "billing"."entitlements" (
  "id"            uuid                       NOT NULL,                       -- [Doc-6A §3.1] PK UUIDv7
  "slug"          text                       NOT NULL,                       -- [Doc-2 §10.8] UNIQUE
  "type"          "billing"."entitlement_type" NOT NULL,                     -- [Doc-2 §10.8]
  "default_value" jsonb,                                                     -- [Doc-2 §10.8] boolean/numeric/enum default ([§2.5] jsonb)
  "created_at"    timestamptz                NOT NULL DEFAULT now(),         -- [Doc-6A R5]
  "updated_at"    timestamptz                NOT NULL DEFAULT now(),
  "created_by"    uuid,                                                      -- [Doc-2 §0.2] actor (NO SD)
  "updated_by"    uuid,
  CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "entitlements_slug_uq" UNIQUE ("slug")                         -- [Doc-2 §10.8 binding]
);

-- §3.1.3 — billing.plan_entitlements — the per-plan entitlement VALUE (BL-CR4: the gate is the
-- entitlement value, never the plan name). Composite PK; append/upsert (no soft-delete, no updated_at).
CREATE TABLE "billing"."plan_entitlements" (
  "plan_id"        uuid        NOT NULL,                                     -- [Doc-2 §10.8] composite PK; INLINE FK (plans exists here)
  "entitlement_id" uuid        NOT NULL,                                     -- [Doc-2 §10.8] composite PK; INLINE FK (entitlements exists here)
  "value_jsonb"    jsonb       NOT NULL,                                     -- [Doc-2 §10.8] per-plan value
  "created_at"     timestamptz NOT NULL DEFAULT now(),                       -- [Doc-6A R5]
  "created_by"     uuid,                                                     -- [Doc-2 §0.2] actor
  CONSTRAINT "plan_entitlements_pkey" PRIMARY KEY ("plan_id", "entitlement_id"),
  CONSTRAINT "plan_entitlements_plan_fk"        FOREIGN KEY ("plan_id")        REFERENCES "billing"."plans"("id"),
  CONSTRAINT "plan_entitlements_entitlement_fk" FOREIGN KEY ("entitlement_id") REFERENCES "billing"."entitlements"("id")
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS — Doc-6I §3.x consolidated (Pass-1): catalog public-read + admin-write. App-layer authz is
--     PRIMARY (the auth-gated composition + the query's non-retired scope); RLS is the row-visibility
--     backstop (Doc-6A §4.5). GUC `app.is_platform_staff` is server-set (§2.1); unset →
--     current_setting(.,true) NULL → ::boolean NULL → `IS TRUE` false → fail-closed (non-staff).
-- ─────────────────────────────────────────────────────────────────────────────

-- plans: public read of NON-retired rows (deleted_at IS NULL) + admin-all. A retired (soft-deleted)
-- plan is therefore NOT visible to a non-staff reader — the query layer scopes to the SAME set.
ALTER TABLE "billing"."plans" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON "billing"."plans" FOR SELECT
  USING ("deleted_at" IS NULL);
CREATE POLICY "plans_admin" ON "billing"."plans" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- entitlements: public-read catalog + admin-write (Doc-6I §3.x). NO soft-delete column ⇒ public read
-- is unconditional (USING true) — the definition catalog is fully public.
ALTER TABLE "billing"."entitlements" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entitlements_public_read" ON "billing"."entitlements" FOR SELECT
  USING (true);
CREATE POLICY "entitlements_admin" ON "billing"."entitlements" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- plan_entitlements: public-read catalog + admin-write (Doc-6I §3.x — "same" as entitlements). NO
-- soft-delete column ⇒ public read is unconditional (USING true).
ALTER TABLE "billing"."plan_entitlements" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_entitlements_public_read" ON "billing"."plan_entitlements" FOR SELECT
  USING (true);
CREATE POLICY "plan_entitlements_admin" ON "billing"."plan_entitlements" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
