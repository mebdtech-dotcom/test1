-- Doc-6G — M5 Trust (`trust`) Schema Realization — `trust_fraud_signals` (forward-only; Doc-6A §11).
-- W3-TRUST-4c — the BC-TRUST-4 Fraud & Risk Signal aggregate substrate (Doc-6G §3.4 / §3.x;
-- Doc-4G PassB Part4 §G7.1/§G7.2/§H). Realizes:
--   • the `trust.fraud_signal_state` enum + the `fraud_signals` table (columns VERBATIM Doc-2 §10.6 /
--     Doc-6G §3.4 — polymorphic subject; NO CHECK, NO business UNIQUE, NO detection_ref/triage_note column),
--   • the 2 indexes (subject lookup + the partial `open/reviewed` work-queue — NOT unique),
--   • the column-scoped immutability trigger (identity + creation facts frozen; state/updated_at/updated_by
--     mutable by the triage transitions; DELETE blocked),
--   • the RLS: `fraud_signals_admin FOR ALL` under the platform-staff GUC — admin/System in-band read+write;
--     fail-closed for non-staff (the non-disclosure backstop; Doc-4G §H.9f).
--
-- POSTURE (the crux — DIFFERENT from the score-class tables): Doc-6G §3.4 marks fraud_signals "NO SD".
-- There is NO SECURITY-DEFINER write function here. Writes go IN-BAND under the staff GUC
-- (`app.is_platform_staff = true` — natural for Admin AND System); the `fraud_signals_admin FOR ALL` policy
-- ADMITS the in-band INSERT/UPDATE (unlike verified_financial_tiers / the scores, which grant no write
-- policy and force an owner-role/SD write). The create-dedup uses a plain `pg_advisory_xact_lock` inside the
-- caller's staff tx (the M5 fraud-signal repository) — no SD function is needed or added.
--
-- NO EVENT: Doc-2 §8 enumerates NO Trust fraud event (Doc-4G §H.7) — BC-TRUST-4 emits none; every mutation
-- is state + a §9 audit only. This migration adds NO outbox/emit machinery.
--
-- Enum labels/columns are [Doc-2 §10.6 binding]; physical specifics (names, index predicates) are [§2.5].
-- `subject_id` / `reported_by` / `created_by` / `updated_by` are bare cross-module UUIDs (Doc-2 §0.3) — no FK.
-- `subject_type` / `signal_type` / `severity` are TEXT (Doc-2 declares no value set → [§2.5] text; validated
-- non-empty in the app layer, membership `[ESC]`-deferred — no fixed enum coined). The immutability trigger
-- calls the M0-owned shared-kernel `core.raise_immutable_violation` — a FUNCTION call (allowed; core is
-- realized), NOT cross-schema table access. Tables/columns are mirrored in schema.prisma (`FraudSignal`);
-- the enum/indexes/trigger/RLS are raw SQL here (the house pattern, cf. `trust_verification_substrate`).
-- Forward-only, non-destructive (Doc-6A §11.2).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum (Doc-6G §3.4) — declared before the table that uses it
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "trust"."fraud_signal_state" AS ENUM ('open', 'reviewed', 'actioned', 'dismissed');  -- [Doc-2 §10.6 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Table (Doc-2 §10.6 columns VERBATIM; physical specifics [§2.5]) — Doc-6G §3.4
--     Polymorphic subject (subject_id + subject_type discriminator, bare UUID, no FK). NO CHECK, NO business
--     UNIQUE, NO detection_ref/triage_note column (Doc-4G §H.10 — Pass-B introduces no column). NO soft-delete.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."fraud_signals" (
  "id"           uuid                          NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7 (app-supplied; no DB default)
  "subject_id"   uuid                          NOT NULL,               -- [Doc-2 §10.6] polymorphic — bare UUID (the suspected entity); NO FK
  "subject_type" text                          NOT NULL,               -- [Doc-2 §10.6] discriminator — TEXT (no enumerated set → [§2.5])
  "reported_by"  uuid,                                                 -- [Doc-2 §10.6] bare UUID → M1 (staff reporter); NULL for System-detected
  "signal_type"  text                          NOT NULL,               -- [Doc-2 §10.6] TEXT (no values declared → [§2.5])
  "severity"     text                          NOT NULL,               -- [Doc-2 §10.6] TEXT (no values declared → [§2.5])
  "state"        "trust"."fraud_signal_state"  NOT NULL DEFAULT 'open',-- [Doc-2 §10.6] entry `open`
  "created_at"   timestamptz                   NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"   timestamptz                   NOT NULL DEFAULT now(), -- [Doc-6A R5] optimistic-concurrency token (ms-truncated by the writer)
  "created_by"   uuid,                                                 -- [Doc-2 §0.2] = System (NULL) / Admin staff actor
  "updated_by"   uuid,                                                 -- [Doc-2 §0.2]
  CONSTRAINT "fraud_signals_pkey" PRIMARY KEY ("id")                   -- [§2.5] name
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Indexes (Doc-6G §3.4; [§2.5] names/predicates)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX "fraud_signals_subject_idx" ON "trust"."fraud_signals" ("subject_type", "subject_id");  -- [§2.5]
-- partial work-queue index over the non-terminal states — NOT unique (the dedup is an app-layer
-- advisory-lock check-then-insert, not a DB constraint; Doc-4G §H.8 / §G7.1 §10). [§2.5]
CREATE INDEX "fraud_signals_open_idx" ON "trust"."fraud_signals" ("state") WHERE "state" IN ('open', 'reviewed');

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) Immutability trigger (Doc-6G §3.4; via M0-owned core.raise_immutable_violation)
--     Identity + creation facts frozen (id/subject_id/subject_type/signal_type/severity/reported_by/
--     created_at/created_by); only state/updated_at/updated_by change (the triage transitions —
--     column-scoped). DELETE blocked (append-only; Invariant #8).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER "fraud_signals_immutable"
  BEFORE UPDATE OR DELETE ON "trust"."fraud_signals" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'subject_id', 'subject_type', 'signal_type', 'severity', 'reported_by', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) RLS — admin/System only, FOR ALL (Doc-6G §3.x). App-layer authz is primary (Doc-4G §H.3 —
--     `staff_can_ban`); RLS is the fail-closed backstop. UNLIKE the score-class tables, fraud_signals grants
--     a FOR ALL policy (read + write) under the staff GUC — writes are in-band (NO SD). current_setting(.,true)
--     → NULL when unset → fail-closed for every non-staff caller (the non-disclosure posture; Doc-4G §H.9f).
--     No public / vendor / tenant read here — the entire fraud surface is staff-internal.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "trust"."fraud_signals" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fraud_signals_admin" ON "trust"."fraud_signals" FOR ALL
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
