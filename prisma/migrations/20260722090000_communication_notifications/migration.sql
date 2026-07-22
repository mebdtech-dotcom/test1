-- Doc-6H — M6 Communication (`communication`) Schema Realization — `communication_notifications`
-- (forward-only; Doc-6A §11). W3-COMM-2 [Wave-3 M6 notifications slice] — the BC-COMM-2 Notification
-- aggregate: `communication.notifications` (recipient-tenant; M0-event source; in_app). Realizes
-- Doc-6H §3.2 VERBATIM (columns Doc-2 §10.7; `notification_channel` single-value set verbatim —
-- Doc-2 §10.7 declares only `in_app`; no value coined).
--
-- SELF-CONTAINED (Doc-6A §5.2): M6 refs identity/core by BARE UUID only (`recipient_user_id`,
-- `recipient_organization_id` → M1; `source_event_id` → M0 `core.outbox_events` — the consumed-event
-- trigger, CM-CR7). NO cross-schema FK. NO `human_ref` (Doc-2 §10.7 declares none).
--
-- Lifecycle realization (Doc-2 §3.7 `unread → read → archived`, Doc-6H §3.2): state is COLUMN-DERIVED —
-- `read_at IS NULL` = unread · `read_at` set = read · `deleted_at` set = archived (SD = archive; R12 —
-- archive advances inbox state, it never deletes the row). No status column exists to invent.
--
-- Order (Doc-6H §7 forward-only): CREATE SCHEMA guard → enum → table → index → RLS. The 2
-- `communication.*` POLICY keys are ALREADY seeded (`communication_support_tickets` migration; Doc-3
-- v1.5) — reused, not re-seeded.

CREATE SCHEMA IF NOT EXISTS "communication";

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum — notification channel (Doc-2 §10.7 `channel(in_app)`): the single declared value.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE communication.notification_channel AS ENUM ('in_app');  -- [Doc-2 §10.7 binding] only value

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Table (Doc-6H §3.2 verbatim; columns Doc-2 §10.7; physical specifics [§2.5]).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE communication.notifications (
  id uuid NOT NULL,
  recipient_user_id uuid,                                    -- [Doc-2 §10.7] bare UUID → M1 (NULL = org-wide recipient)
  recipient_organization_id uuid NOT NULL,                   -- [Doc-2 §10.7] bare UUID → M1 (org = RLS tenant)
  source_event_id uuid,                                      -- [Doc-2 §10.7] bare UUID → M0 core.outbox_events (the trigger; CM-CR7)
  channel communication.notification_channel NOT NULL DEFAULT 'in_app',  -- [Doc-2 §10.7]
  title text,                                                -- [Doc-2 §10.7]
  body text,                                                 -- [Doc-2 §10.7]
  payload_jsonb jsonb,                                       -- [Doc-2 §10.7] structured refs by UUID; owns no producer entity
  read_at timestamptz,                                       -- [Doc-2 §10.7] recipient-mutable read state
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.7] SD = archive
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE INDEX notifications_recipient_idx ON communication.notifications (recipient_organization_id, read_at) WHERE deleted_at IS NULL;  -- [§2.5] inbox feed
-- [§2.5 choice] the H.8 event-consumer idempotency probe (`source_event_id` + recipient) — exactly-once
-- effect over at-least-once delivery (Doc-4A §16; Doc-4H §HB-2.1 item 10):
CREATE INDEX notifications_source_event_idx ON communication.notifications (source_event_id, recipient_organization_id, recipient_user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6H §3.x Pass-2 verbatim) — recipient-tenant + platform-staff backstop. App-layer authz
--     is PRIMARY (recipient scope enforced in the repository predicates); RLS is the row-visibility
--     backstop (Doc-6A §4.5). GUCs server-set; unset → NULL → fail-closed.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE communication.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_recipient ON communication.notifications FOR ALL
  USING (recipient_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (recipient_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
