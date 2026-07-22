-- Doc-6G — M5 Trust (`trust`) Schema Realization — `trust_admin_ratings` (forward-only; Doc-6A §11).
-- W3-TRUST-5b — the BC-TRUST-5 (Part B) Admin Rating aggregate substrate (Doc-6G §3.5.1 / §3.x;
-- Doc-4G PassB Part5 §G8.4/§G8.5/§H as amended by Doc-4G_PassB_Part5_Patch_v1.0). Realizes:
--   • the `admin_ratings` table (columns VERBATIM Doc-2 §10.6 / Doc-6G §3.5.1 — `score numeric` with NO range
--     CHECK; `comment` text; SD tuple; NO business UNIQUE),
--   • the column-scoped immutability trigger (identity facts frozen; rating/note/SD mutable; DELETE blocked),
--   • the RLS: ONLY `admin_ratings_staff FOR ALL` under the platform-staff GUC — the NON-DISCLOSURE crux.
--
-- SEPARATE AUTHORITY (Doc-4G §H.9a): the Admin Rating is a DISTINCT aggregate from the Public Review — "never
-- merged". It is STAFF-INTERNAL: never public, never tenant-visible, never exposed externally (F4G-PB5-M3;
-- Doc-4A §7.5). Its RLS therefore grants ONLY the platform-staff policy — NO public/author/tenant policy
-- (CONTRAST `public_reviews`, which has three). A non-staff caller sees ZERO rows (RLS fail-closed) and the
-- app-layer collapses to NOT_FOUND (never AUTHORIZATION).
--
-- POSTURE (the crux — the WP4c fraud / WP5a public-review precedent, DIFFERENT from the score-class tables):
-- `admin_ratings` admits IN-BAND writes. There is NO SECURITY-DEFINER write function here. Staff create/update
-- go in-band under the platform-staff GUC (`admin_ratings_staff FOR ALL` admits read AND write). The per-vendor
-- SINGLETON is enforced in the app layer via a `pg_advisory_xact_lock` check-then-write (the frozen §3.5.1 DDL
-- has NO `UNIQUE(vendor_profile_id)` — see the M5 admin-rating service). Writes are raw SQL in the M5
-- admin-rating repository with `updated_at` millisecond-TRUNCATED (`date_trunc('milliseconds', …)`) so the
-- optimistic-concurrency token round-trips through Prisma `Date` (a microsecond token would falsely miss and
-- read as CONFLICT; the WP3/WP4c/WP5a precedent).
--
-- NO EVENT: Doc-2 §8 enumerates NO Trust admin-rating event (Doc-4G §H.7) — BC-TRUST-5 emits none; every
-- mutation is state + a §9 audit only. Doc-2 §9 lines 693 (Reviews) + 694 (Admin) enumerate NO admin-rating
-- action → the audit token carries `[ESC-TRUST-AUDIT]` (nearest §9 Trust action by pointer; no action invented).
--
-- IMMUTABILITY REALIZATION CHOICE (Doc-6G §6 = Indexing & Performance; §7 = migration order + "triggers
-- (immutability)" — NEITHER mandates a per-column frozen set for `admin_ratings`; Appendix A CHK-030 "no
-- hard-DELETE", CHK-004 "SD tuple on admin_ratings"). Frozen (identity — the verified-tier precedent): id,
-- vendor_profile_id, created_at, created_by. Mutable (the rating is edited by staff; `rated_by` tracks the last
-- setter): rated_by, score, comment, updated_at, updated_by, deleted_at, deleted_by, delete_reason. DELETE
-- always blocked (SD=YES; there is NO delete contract in scope — a delete op is DEFERRED). The trigger calls the
-- M0-owned shared-kernel `core.raise_immutable_violation` — a FUNCTION call (allowed; core is realized).
--
-- Enum labels/columns are [Doc-2 §10.6 binding]; physical specifics (names) are [§2.5]. `vendor_profile_id`/
-- `rated_by`/`created_by`/`updated_by`/`deleted_by` are bare cross-module UUIDs (Doc-2 §0.3) — no FK. `score`
-- is `numeric` (NO range CHECK — the 1–5 CHECK belongs to `public_reviews`, a DIFFERENT table; do NOT add one).
-- Tables/columns are mirrored in schema.prisma (`AdminRating`); the trigger/RLS are raw SQL here (the house
-- pattern, cf. `trust_public_reviews`). Forward-only, non-destructive (Doc-6A §11.2).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Table (Doc-2 §10.6 columns VERBATIM; physical specifics [§2.5]) — Doc-6G §3.5.1
--     Internal-only staff rating; `score numeric` (NO CHECK), `comment` text; SD tuple; NO business UNIQUE.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."admin_ratings" (
  "id"                uuid        NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7 (app-supplied; no DB default)
  "vendor_profile_id" uuid        NOT NULL,               -- [Doc-2 §10.6] bare UUID → M2 (subject; ref, service-validated deferred)
  "rated_by"          uuid,                               -- [Doc-2 §10.6] bare UUID → M1 (the staff rater)
  "score"             numeric,                            -- [Doc-2 §10.6] the internal staff rating (NO range CHECK in the frozen DDL)
  "comment"           text,                               -- [Doc-2 §10.6] internal note (staff-only)
  "created_at"        timestamptz NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"        timestamptz NOT NULL DEFAULT now(), -- [Doc-6A R5] optimistic-concurrency token (ms-truncated by the writer)
  "created_by"        uuid,                               -- [Doc-2 §0.2] = the staff rater
  "updated_by"        uuid,                               -- [Doc-2 §0.2]
  "deleted_at"        timestamptz,                        -- [Doc-2 §10.6] SD=YES
  "deleted_by"        uuid,                               -- [Doc-2 §10.6] SD
  "delete_reason"     text,                               -- [Doc-2 §10.6] SD
  CONSTRAINT "admin_ratings_pkey" PRIMARY KEY ("id")      -- [§2.5] name
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Index (Doc-6G §6 — "partial `WHERE deleted_at IS NULL` (SD: `admin_ratings`/`public_reviews`)" + the
--     "Cursor sort-key indexes (Band H) for Doc-5G lists"). This single partial index satisfies the §6
--     `WHERE deleted_at IS NULL` requirement AND serves the `getLiveAdminRatingByVendor` (vendor_profile_id +
--     live) singleton lookup AND the `list_admin_ratings` keyset order `(created_at desc, id desc)` (the
--     Band-H cursor sort-key). Predicate matches the SD posture (removed rows excluded); [§2.5] name.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX "admin_ratings_vendor_live_idx"
  ON "trust"."admin_ratings" ("vendor_profile_id", "created_at" DESC, "id" DESC)
  WHERE "deleted_at" IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Immutability trigger (Doc-6G §3.5.1 realization choice; via M0-owned core.raise_immutable_violation)
--     Identity facts frozen (id/vendor_profile_id/created_at/created_by); rated_by/score/comment/SD/updated_at/
--     updated_by mutable by the staff create/update (column-scoped). DELETE blocked (append-only; Invariant #8).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER "admin_ratings_immutable"
  BEFORE UPDATE OR DELETE ON "trust"."admin_ratings" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'vendor_profile_id', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) RLS — STRICTLY platform-staff, FOR ALL (Doc-6G §3.x VERBATIM). The NON-DISCLOSURE crux: ONLY this
--     policy — NO public/author/tenant policy (contrast `public_reviews`). App-layer authz is primary (Doc-4G
--     §H.3 — `staff_can_verify`/`staff_super_admin`); RLS is the fail-closed backstop. current_setting(.,true)
--     → NULL when unset → fail-closed for EVERY non-staff caller (F4G-PB5-M3 / H.9f — non-staff sees zero rows;
--     the app collapses to NOT_FOUND, never AUTHORIZATION). In-band read + write under the staff GUC (NO SD).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "trust"."admin_ratings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_ratings_staff" ON "trust"."admin_ratings" FOR ALL
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
