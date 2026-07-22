-- Doc-6I §3.2 — M7 Billing Subscriptions Schema Realization — `billing_subscriptions` (forward-only,
-- Doc-6A §11). W3-BILL-4 — the BC-BILL-2 subscription substrate (Doc-2 §10.8 + §5.7): `subscriptions`
-- (§5.7 machine; one-active partial-unique) + `subscription_events` (append-only). Columns verbatim
-- Doc-2 §10.8; state set verbatim Doc-2 §5.7. `CREATE SCHEMA billing` already ran in the Wave-0 baseline.
--
-- OUT OF SCOPE (later M7 slices): the `pending_payment → active` activation (via the out-of-wire
-- `record_payment` — Doc-5I §10), `renew`/`expire` period-end System jobs, `cancel_subscription`,
-- `resolve_entitlements` (out-of-wire), `list_subscription_events`; usage/lead/invoice/reward groupings.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-2 §5.7 / §10.8)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "billing"."subscription_state" AS ENUM ('pending_payment', 'active', 'expired');
CREATE TYPE "billing"."subscription_event_type" AS ENUM ('purchase', 'renew', 'expire', 'cancel');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-6I §3.2.1/§3.2.2; columns verbatim Doc-2 §10.8)
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.2.1 — billing.subscriptions — org-tenant subscription head; §5.7 machine; one active per org.
CREATE TABLE "billing"."subscriptions" (
  "id"              uuid                              NOT NULL,                          -- [Doc-6A §3.1] PK UUIDv7
  "organization_id" uuid                              NOT NULL,                          -- [Doc-2 §10.8] tenant (bare UUID → M1)
  "plan_id"         uuid                              NOT NULL,                          -- [Doc-6A §5.2] in-module FK
  "state"           "billing"."subscription_state"    NOT NULL DEFAULT 'pending_payment', -- [Doc-2 §5.7]
  "period_start"    timestamptz,                                                          -- [Doc-2 §10.8]
  "period_end"      timestamptz,                                                          -- [Doc-2 §10.8]
  "auto_renew"      boolean                           NOT NULL DEFAULT true,             -- [Doc-2 §10.8]
  "created_at"      timestamptz                       NOT NULL DEFAULT now(),            -- [Doc-6A R5]
  "updated_at"      timestamptz                       NOT NULL DEFAULT now(),
  "created_by"      uuid,                                                                 -- [Doc-2 §0.2] actor
  "updated_by"      uuid,
  "deleted_at"      timestamptz,                                                          -- [Doc-2 §0.2] soft-delete
  "deleted_by"      uuid,
  "delete_reason"   text,
  CONSTRAINT "subscriptions_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "subscriptions_plan_fk" FOREIGN KEY ("plan_id") REFERENCES "billing"."plans"("id")
);
-- [Doc-2 §10.8 binding] one ACTIVE subscription per org (partial-unique).
CREATE UNIQUE INDEX "subscriptions_active_uq" ON "billing"."subscriptions" ("organization_id")
  WHERE "state" = 'active' AND "deleted_at" IS NULL;

-- §3.2.2 — billing.subscription_events — append-only lifecycle log (purchase/renew/expire/cancel).
CREATE TABLE "billing"."subscription_events" (
  "id"              uuid                                   NOT NULL,                     -- [Doc-6A §3.1] PK UUIDv7
  "subscription_id" uuid                                   NOT NULL,                     -- [Doc-6A §5.2] in-module FK
  "event_type"      "billing"."subscription_event_type"    NOT NULL,                     -- [Doc-2 §10.8]
  "occurred_at"     timestamptz                            NOT NULL DEFAULT now(),       -- [Doc-2 §10.8]
  "payload_jsonb"   jsonb,                                                                -- [Doc-2 §10.8] ([§2.5])
  "created_at"      timestamptz                            NOT NULL DEFAULT now(),       -- [Doc-6A R5] (NO SD — append-only)
  "created_by"      uuid,                                                                 -- [Doc-2 §0.2] actor
  CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscription_events_subscription_fk" FOREIGN KEY ("subscription_id") REFERENCES "billing"."subscriptions"("id")
);
-- [Doc-6B §4] append-only: block UPDATE/DELETE via the M0-owned column-aware immutability guard.
CREATE TRIGGER "subscription_events_immutable"
  BEFORE UPDATE OR DELETE ON "billing"."subscription_events" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'subscription_id', 'event_type', 'occurred_at', 'payload_jsonb', 'created_at', 'created_by');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6I §3.x) — org-tenant + admin. GUCs server-set (§2.1): app.active_org, app.is_platform_staff.
-- ─────────────────────────────────────────────────────────────────────────────

-- subscriptions: the org owns its subscription (org-anchored) OR platform-staff.
ALTER TABLE "billing"."subscriptions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_tenant" ON "billing"."subscriptions" FOR ALL
  USING ("organization_id" = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK ("organization_id" = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- subscription_events: visible/writable via the parent subscription's org (or platform-staff); the
-- immutability trigger blocks UPDATE/DELETE regardless (append-only).
ALTER TABLE "billing"."subscription_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_events_tenant" ON "billing"."subscription_events" FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM "billing"."subscriptions" s
                     WHERE s."id" = "subscription_events"."subscription_id"
                       AND s."organization_id" = current_setting('app.active_org', true)::uuid))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
              OR EXISTS (SELECT 1 FROM "billing"."subscriptions" s
                          WHERE s."id" = "subscription_events"."subscription_id"
                            AND s."organization_id" = current_setting('app.active_org', true)::uuid));
