-- Doc-6G — M5 Trust (`trust`) Schema Realization — `trust_verification_substrate`
-- (forward-only; Doc-6A §11). W3-TRUST-1 — the BC-TRUST-1 Verification grouping substrate:
-- the 2 Verification tables (Doc-6G §3.1.1 / §3.1.2) + their 4 enums, indexes, the in-module FK,
-- the column-scoped / append-only immutability triggers, and the platform-internal RLS.
--
-- Realizes: verification_records (§3.1.1 — polymorphic subject; column-scoped immutability;
-- state/expires_at/evidence mutable) + verification_decisions (§3.1.2 — append-only; Admin
-- decides / Trust owns; in-module FK). Columns/enum labels are [Doc-2 binding] (verbatim Doc-2
-- §10.6 / Doc-6G §3.1); physical specifics are [§2.5] (names, index predicates) per Doc-6G §2.5.
--
-- Deferred (NOT this WP): the System-written verified_financial_tiers (§3.1.3) + the Trust /
-- Performance scores (Doc-6G Pass-2/3). No endpoint / contract / command lands here — substrate only.
--
-- The `trust` schema namespace already exists (00000000000000_init_schemas); this adds objects
-- inside it. Forward-only, non-destructive (Doc-6A §11.2). Tables/columns are realized by Prisma
-- (schema.prisma); enums / indexes / triggers / RLS are raw SQL here (the house pattern, cf.
-- `core_init`, `identity_authz`). The immutability triggers call the M0-owned shared-kernel
-- `core.raise_immutable_violation` — a FUNCTION call (allowed; core is realized), NOT cross-schema
-- table access. No cross-schema FK: subject_id / requested_by / verification_task_id /
-- created_by / updated_by are bare UUIDs (Doc-2 §0.3); the only FK is intra-schema (decisions → records).
--
-- NOTE: `[Doc-2 binding]` = column/type/constraint verbatim Doc-2 §10.6 / Doc-6G §3.1;
--       `[§2.5]` = physical realization (names, index predicates) per Doc-6G §2.5.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6G §3.1.1 / §3.1.2) — declared before the tables that use them
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE "trust"."verification_subject_type" AS ENUM ('vendor_profile', 'organization', 'capacity', 'declared_tier');  -- [Doc-2 §10.6 binding]
CREATE TYPE "trust"."verification_type"         AS ENUM ('contact', 'business', 'factory', 'organization', 'tier', 'capacity');  -- [Doc-2 §10.6 binding]
CREATE TYPE "trust"."verification_state"        AS ENUM ('requested', 'in_review', 'approved', 'rejected', 'expired', 'revoked');  -- [Doc-2 §5.6 binding]
CREATE TYPE "trust"."verification_decision"     AS ENUM ('approve', 'reject', 'confirm', 'downgrade', 'request_info');  -- [Doc-2 §10.6 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-2 §10.6 columns verbatim; physical specifics [§2.5]) — FK-valid order
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.1.1 — trust.verification_records — polymorphic subject (subject_id + subject_type discriminator,
-- bare UUID, no FK); evidence_document_refs[] bare-UUID array (no FK); NO soft-delete.
CREATE TABLE "trust"."verification_records" (
  "id"                     uuid                                NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7 (app-supplied; no DB default)
  "subject_id"             uuid                                NOT NULL,               -- [Doc-2 §10.6] polymorphic — bare UUID (vendor_profile→M2 / organization→M1 / capacity→M2 / declared_tier→M2); NO FK
  "subject_type"           "trust"."verification_subject_type" NOT NULL,               -- [Doc-2 §10.6] discriminator
  "verification_type"      "trust"."verification_type"         NOT NULL,               -- [Doc-2 §10.6]
  "state"                  "trust"."verification_state"        NOT NULL DEFAULT 'requested',  -- [Doc-2 §5.6]
  "evidence_document_refs" uuid[]                              NOT NULL DEFAULT '{}',  -- [Doc-2 §10.6] bare-UUID array → storage/M2 (no FK)
  "requested_by"           uuid,                                                       -- [Doc-2 §10.6] bare UUID → M1
  "expires_at"             timestamptz,                                                -- [Doc-2 §10.6] periodic review / document expiry
  "created_at"             timestamptz                         NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"             timestamptz                         NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "created_by"             uuid,                                                       -- [Doc-2 §0.2] (NO SD)
  "updated_by"             uuid,                                                       -- [Doc-2 §0.2]
  CONSTRAINT "verification_records_pkey" PRIMARY KEY ("id")                            -- [§2.5] name
);

-- §3.1.2 — trust.verification_decisions — append-only; in-module FK → verification_records;
-- decided_by → M1 (bare UUID); verification_task_id → M8 (bare UUID, NO FK); NO soft-delete.
CREATE TABLE "trust"."verification_decisions" (
  "id"                     uuid                            NOT NULL,                   -- [Doc-6A §3.1] PK UUIDv7
  "verification_record_id" uuid                            NOT NULL,                   -- [Doc-6A §5.2] in-module FK → verification_records
  "decided_by"             uuid,                                                       -- [Doc-2 §10.6] bare UUID → M1 (staff user)
  "verification_task_id"   uuid,                                                       -- [Doc-2 §10.6] bare UUID → M8 (admin.verification_tasks — the decision origin); NO FK
  "decision"               "trust"."verification_decision" NOT NULL,                   -- [Doc-2 §10.6]
  "reason"                 text,                                                       -- [Doc-2 §10.6]
  "decided_at"             timestamptz                     NOT NULL DEFAULT now(),     -- [Doc-2 §10.6]
  "created_at"             timestamptz                     NOT NULL DEFAULT now(),     -- [Doc-6A R5]
  "created_by"             uuid,                                                       -- [Doc-2 §0.2]
  CONSTRAINT "verification_decisions_pkey" PRIMARY KEY ("id"),                         -- [§2.5] name
  CONSTRAINT "verification_decisions_record_fk" FOREIGN KEY ("verification_record_id") REFERENCES "trust"."verification_records"("id")  -- [Doc-6A §5.2] intra-schema
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Indexes (Doc-6G §3.1.1; [§2.5] names/predicates)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX "verification_records_subject_idx" ON "trust"."verification_records" ("subject_type", "subject_id");  -- [§2.5]
CREATE INDEX "verification_records_state_idx"   ON "trust"."verification_records" ("state") WHERE "state" IN ('requested', 'in_review');  -- [§2.5] work queue (partial)

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) Immutability triggers (Doc-6G §3.1.1 / §3.1.2; via M0-owned core.raise_immutable_violation)
-- ─────────────────────────────────────────────────────────────────────────────

-- verification_records — subject/type/requested_by/id/created_at/created_by frozen; only
-- state / expires_at / evidence_document_refs / updated_at / updated_by change (column-scoped); DELETE blocked.
CREATE TRIGGER "verification_records_immutable"
  BEFORE UPDATE OR DELETE ON "trust"."verification_records" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'subject_id', 'subject_type', 'verification_type', 'requested_by', 'created_at', 'created_by');  -- [Doc-6B §4]

-- verification_decisions — full append-only: every column immutable; DELETE blocked (Admin decides / Trust owns).
CREATE TRIGGER "verification_decisions_immutable"
  BEFORE UPDATE OR DELETE ON "trust"."verification_decisions" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'verification_record_id', 'decided_by', 'verification_task_id', 'decision', 'reason', 'decided_at', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) RLS — platform-internal (admin / System) on both tables (Doc-6G §3.x). App-layer authz is
--     primary (Doc-4G); RLS is the row-visibility backstop. current_setting(.,true) → NULL when
--     unset → fail-closed. No public / vendor / tenant read here — the public band is M2's reflection.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "trust"."verification_records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verification_records_admin" ON "trust"."verification_records" FOR ALL
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

ALTER TABLE "trust"."verification_decisions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verification_decisions_admin" ON "trust"."verification_decisions" FOR ALL
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
