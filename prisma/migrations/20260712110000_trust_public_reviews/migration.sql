-- Doc-6G — M5 Trust (`trust`) Schema Realization — `trust_public_reviews` (forward-only; Doc-6A §11).
-- W3-TRUST-5a — the BC-TRUST-5 (Part A) Public Review aggregate substrate (Doc-6G §3.5.2 / §3.x;
-- Doc-4G PassB Part5 §G8.1/§G8.2/§G8.3/§H as amended by Doc-4G_PassB_Part5_Patch_v1.0). Realizes:
--   • the `trust.public_review_status` enum + the `public_reviews` table (columns VERBATIM Doc-2 §10.6 /
--     Doc-6G §3.5.2 — vendor/author/engagement bare UUIDs; `rating 1–5` CHECK; SD tuple, removed=hidden),
--   • the `UNIQUE(engagement_id, author_organization_id)` business key (one review per engagement per author),
--   • the partial published index (M2 service read — `WHERE status='published' AND deleted_at IS NULL`),
--   • the column-scoped immutability trigger (authored/identity facts frozen; status/moderation/SD mutable;
--     DELETE blocked),
--   • the RLS: author write (`app.active_org`) | public read when `published` | staff moderate
--     (`app.is_platform_staff`) — the three policies VERBATIM Doc-6G §3.x.
--
-- POSTURE (the crux — the WP4c fraud precedent, DIFFERENT from the score-class tables): `public_reviews`
-- admits IN-BAND writes. There is NO SECURITY-DEFINER write function here. The buyer's submit goes in-band
-- under the author's active-org GUC (`public_reviews_author FOR ALL`); staff moderate/publish/remove go
-- in-band under the platform-staff GUC (`public_reviews_staff FOR ALL`). Writes are raw SQL in the M5
-- public-review repository with `updated_at` millisecond-TRUNCATED (`date_trunc('milliseconds', …)`) so the
-- optimistic-concurrency token round-trips through Prisma `Date` (a microsecond token would falsely miss and
-- read as CONFLICT; the WP3 verified-tier / WP4c fraud precedent).
--
-- NO EVENT: Doc-2 §8 enumerates NO Trust review event (Doc-4G §H.7) — BC-TRUST-5 emits none; every mutation
-- is state + a §9 audit only (Doc-2 §9 line 693 Reviews — submit/moderation/publish/remove, all enumerated).
-- On PUBLISH the Buyer-Feedback contribution (Path B, F4G-M2/M3) is delivered by INVOKING the BC-TRUST-3
-- ingestion service in-module (never a direct `performance_inputs` write) — an in-module service call, NOT an
-- event. This migration adds NO outbox/emit machinery and NO admin_ratings table (WP5b).
--
-- IMMUTABILITY REALIZATION CHOICE (Doc-6G §6 is silent on a per-column frozen set for `public_reviews`; §7
-- only lists "triggers (immutability)"). Frozen (authorship integrity — Invariant #8; no edit-review contract
-- exists, so a moderator may never silently alter the buyer's words): id, vendor_profile_id,
-- author_organization_id, engagement_id, rating, body, created_at, created_by. Mutable (moderation + SD):
-- status, moderated_by, moderated_at, updated_at, updated_by, deleted_at, deleted_by, delete_reason. DELETE
-- always blocked (removal is soft; SD=YES). The trigger calls the M0-owned shared-kernel
-- `core.raise_immutable_violation` — a FUNCTION call (allowed; core is realized), NOT cross-schema table access.
--
-- Enum labels/columns are [Doc-2 §10.6 binding]; physical specifics (names, index predicates) are [§2.5].
-- `vendor_profile_id`/`author_organization_id`/`engagement_id`/`created_by`/`updated_by`/`moderated_by`/
-- `deleted_by` are bare cross-module UUIDs (Doc-2 §0.3) — no FK. Tables/columns are mirrored in schema.prisma
-- (`PublicReview`); the enum/index/trigger/RLS are raw SQL here (the house pattern, cf. `trust_fraud_signals`).
-- Forward-only, non-destructive (Doc-6A §11.2).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum (Doc-6G §3.5.2) — declared before the table that uses it
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "trust"."public_review_status" AS ENUM ('submitted', 'approved', 'published', 'rejected', 'removed');  -- [Doc-2 §10.6 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Table (Doc-2 §10.6 columns VERBATIM; physical specifics [§2.5]) — Doc-6G §3.5.2
--     Post-award only (engagement_id required, service-validated); rating 1–5 CHECK; SD tuple, removed=hidden;
--     UNIQUE(engagement_id, author_organization_id) = one review per engagement per author.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."public_reviews" (
  "id"                     uuid                            NOT NULL,               -- [Doc-6A §3.1] PK UUIDv7 (app-supplied; no DB default)
  "vendor_profile_id"      uuid                            NOT NULL,               -- [Doc-2 §10.6] bare UUID → M2 (subject; ref, service-validated deferred)
  "author_organization_id" uuid                            NOT NULL,               -- [Doc-2 §10.6] bare UUID → M1 (buyer author; RLS write anchor)
  "engagement_id"          uuid                            NOT NULL,               -- [Doc-2 §10.6] bare UUID → M4 (post-award gate; service-validated deferred)
  "rating"                 smallint                        NOT NULL,               -- [Doc-2 §10.6] 1–5
  "body"                   text,                                                   -- [Doc-2 §10.6]
  "status"                 "trust"."public_review_status"  NOT NULL DEFAULT 'submitted',  -- [Doc-2 §10.6] entry `submitted`
  "moderated_by"           uuid,                                                   -- [Doc-2 §10.6] bare UUID → M1 (staff moderator)
  "moderated_at"           timestamptz,                                            -- [Doc-2 §10.6]
  "created_at"             timestamptz                     NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"             timestamptz                     NOT NULL DEFAULT now(), -- [Doc-6A R5] optimistic-concurrency token (ms-truncated by the writer)
  "created_by"             uuid,                                                   -- [Doc-2 §0.2] = the buyer author
  "updated_by"             uuid,                                                   -- [Doc-2 §0.2]
  "deleted_at"             timestamptz,                                            -- [Doc-2 §10.6] SD (removed = hidden)
  "deleted_by"             uuid,                                                   -- [Doc-2 §10.6] SD
  "delete_reason"          text,                                                   -- [Doc-2 §10.6] SD (removal reason)
  CONSTRAINT "public_reviews_pkey" PRIMARY KEY ("id"),                             -- [§2.5] name
  CONSTRAINT "public_reviews_rating_chk" CHECK ("rating" BETWEEN 1 AND 5),         -- [Doc-2 §10.6]
  CONSTRAINT "public_reviews_engagement_uq" UNIQUE ("engagement_id", "author_organization_id")  -- [§2.5] one review per engagement per author
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Index (Doc-6G §3.5.2; [§2.5]) — the M2 service-read partial (published, not soft-deleted)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX "public_reviews_vendor_published_idx" ON "trust"."public_reviews" ("vendor_profile_id")
  WHERE "status" = 'published' AND "deleted_at" IS NULL;  -- [§2.5] M2 service read

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) Immutability trigger (Doc-6G §3.5.2 realization choice; via M0-owned core.raise_immutable_violation)
--     Authored/identity facts frozen (id/vendor_profile_id/author_organization_id/engagement_id/rating/body/
--     created_at/created_by); status/moderation (moderated_by/at)/SD (deleted_at/by, delete_reason)/updated_at/
--     updated_by mutable by the moderate/publish/remove transitions (column-scoped). DELETE blocked (removal is
--     soft; append-only, Invariant #8).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER "public_reviews_immutable"
  BEFORE UPDATE OR DELETE ON "trust"."public_reviews" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'vendor_profile_id', 'author_organization_id', 'engagement_id', 'rating', 'body', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) RLS — author write | public read when published | staff moderate (Doc-6G §3.x VERBATIM). App-layer
--     authz is primary (Doc-4G §H.3 — `can_submit_review` buyer; `staff_can_verify`/`staff_super_admin`
--     staff); RLS is the fail-closed backstop. UNLIKE the score-class tables, `public_reviews` grants in-band
--     write policies (author + staff FOR ALL) — writes are in-band (NO SD). current_setting(.,true) → NULL
--     when unset → fail-closed. Non-published states never leave M5 on the public read.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "trust"."public_reviews" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_reviews_public_read" ON "trust"."public_reviews" FOR SELECT
  USING ("status" = 'published' AND "deleted_at" IS NULL);
CREATE POLICY "public_reviews_author" ON "trust"."public_reviews" FOR ALL
  USING ("author_organization_id" = current_setting('app.active_org', true)::uuid)
  WITH CHECK ("author_organization_id" = current_setting('app.active_org', true)::uuid);
CREATE POLICY "public_reviews_staff" ON "trust"."public_reviews" FOR ALL          -- moderation (status/moderated_by)
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
