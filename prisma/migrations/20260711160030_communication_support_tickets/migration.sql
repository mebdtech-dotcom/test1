-- Doc-6H — M6 Communication (`communication`) Schema Realization — `communication_support_tickets`
-- (forward-only; Doc-6A §11). W3-COMM-1 [Wave-3 M6 pilot slice] — the BC-COMM-4 Support
-- Communications aggregate: `communication.support_tickets` (org + staff; status) +
-- `communication.ticket_messages` (append-only). Realizes Doc-6H §3.4 VERBATIM (columns Doc-2 §10.7;
-- `support_ticket_status` set verbatim; `priority` = text — Doc-2 enumerates no values).
--
-- SELF-CONTAINED (Doc-6A §5.2): M6 refs identity/core by BARE UUID only (`organization_id`,
-- `opened_by`, `author_id` → M1; no cross-schema FK). The ONLY FK is in-module
-- `ticket_messages → support_tickets`. NO `human_ref` (Doc-2 §10.7 declares none — CHK-6-002 N/A).
--
-- Tables/columns are realized by Prisma (schema.prisma); the enum, the in-module FK, the immutability
-- trigger, and RLS are raw SQL here. `CREATE SCHEMA communication` already ran in the Wave-0 baseline
-- (00000000000000_init_schemas); the guard below keeps this migration self-standing.
--
-- Order (Doc-6H §7 forward-only): CREATE SCHEMA → enum → tables → index → immutability trigger → RLS →
-- POLICY seed (the 2 `communication.*` keys — Doc-3 v1.5 CLEARED).
--
-- NOTE: `[Doc-2 §10.7 binding]` = column/type/constraint verbatim; `[§2.5 choice]` = physical realization.

CREATE SCHEMA IF NOT EXISTS "communication";

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum — Support Ticket status machine (Doc-2 §3.7/§10.7): open → in_progress → resolved → closed.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE communication.support_ticket_status AS ENUM ('open','in_progress','resolved','closed');  -- [Doc-2 §10.7 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-2 §10.7 columns verbatim; physical specifics [§2.5]) — support_tickets → ticket_messages.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE communication.support_tickets (
  id uuid NOT NULL, organization_id uuid NOT NULL,            -- [Doc-2 §10.7] tenant
  opened_by uuid,                                            -- [Doc-2 §10.7] bare UUID → M1
  status communication.support_ticket_status NOT NULL DEFAULT 'open',  -- [Doc-2 §10.7]
  subject text NOT NULL,                                     -- [Doc-2 §10.7]
  priority text,                                             -- [Doc-2 §10.7] (no values declared → text [§2.5])
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id)
);
CREATE INDEX support_tickets_org_status_idx ON communication.support_tickets (organization_id, status) WHERE deleted_at IS NULL;  -- [§2.5]

CREATE TABLE communication.ticket_messages (
  id uuid NOT NULL, support_ticket_id uuid NOT NULL,         -- [Doc-6A §5.2] in-module FK
  author_id uuid,                                            -- [Doc-2 §10.7] bare UUID → M1 (user OR staff)
  body text NOT NULL,                                        -- [Doc-2 §10.7]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.7] (NO SD — append-only)
  CONSTRAINT ticket_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_messages_ticket_fk FOREIGN KEY (support_ticket_id) REFERENCES communication.support_tickets(id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Immutability trigger — ticket_messages append-only (Doc-6B §4.1; CR4′). UPDATE/DELETE blocked
--     (any change to a protected column raises; DELETE always forbidden). Reuses the M0-owned function.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER ticket_messages_immutable BEFORE UPDATE OR DELETE ON communication.ticket_messages FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','support_ticket_id','author_id','body','created_at','created_by');  -- [Doc-6B §4] append-only

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) RLS (Doc-6H §3.4) — support_tickets: org tenant + staff; ticket_messages: via parent ticket
--     (org or staff), append-only (UPDATE/DELETE blocked by the trigger). App-layer authz is PRIMARY;
--     RLS is the row-visibility backstop (Doc-6A §4.5). GUC `app.is_platform_staff` server-set (§2.1);
--     unset → current_setting(.,true) NULL → ::boolean NULL → `IS TRUE` false → fail-closed (non-staff).
-- ─────────────────────────────────────────────────────────────────────────────

-- support_tickets: org tenant + staff
ALTER TABLE communication.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_tickets_party ON communication.support_tickets FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ticket_messages: via parent ticket (org or staff); append-only
ALTER TABLE communication.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY ticket_messages_party ON communication.ticket_messages FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.support_tickets t WHERE t.id = ticket_messages.support_ticket_id
                      AND t.organization_id = current_setting('app.active_org', true)::uuid))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.support_tickets t WHERE t.id = ticket_messages.support_ticket_id
                      AND t.organization_id = current_setting('app.active_org', true)::uuid));
-- (UPDATE/DELETE blocked by the immutability trigger.)

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) POLICY seed — the 2 registered `communication.*` keys (Doc-3 POLICY-Key Registration Patch v1.5
--     §3 — CLEARED). value_jsonb + value_type VERBATIM from the v1.5 registration (start values
--     bracketed there: idempotency_dedup_window 24h · list_page_size_max 100); none coined. Seeded into
--     the M0-owned `core.system_configuration` (Doc-6B §3.4 store; the identity_policy_key_seed pattern —
--     a data seed in the persistence layer, not cross-module application access). Read live via
--     `core.config_value_query.v1`, NEVER a literal (Doc-4A §18.2).
--
-- SEED-PK CONVENTION (Board ESC-SEED-PK-UUID Option A) — deterministic, pre-authored format-v4 UUID
-- constants (NEVER runtime-random). Idempotent: ON CONFLICT (key) DO UPDATE (re-run safe — Doc-6A §9.5).
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "core"."system_configuration" ("id", "key", "value_jsonb", "value_type") VALUES
  ('c0116a17-0155-4000-8000-000000000001', 'communication.idempotency_dedup_window', '"24h"'::jsonb, 'duration'),
  ('c0116a17-0155-4000-8000-000000000002', 'communication.list_page_size_max',       '100'::jsonb,   'integer')
ON CONFLICT ("key") DO UPDATE
   SET "value_jsonb" = EXCLUDED."value_jsonb",
       "value_type"  = EXCLUDED."value_type",
       "updated_at"  = now();
