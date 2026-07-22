-- Doc-6G — M5 Trust (`trust`) — Performance Scoring substrate (forward-only; Doc-6A §11).
-- W3-TRUST-4a — the BC-TRUST-3 System-computed Performance Score aggregate + its idempotent inputs
-- (Doc-6G §3.3 / §3.x; Doc-4G PassB Part3 §G6/§H). Realizes:
--   • the 3 enums (`score_freeze_state`, `performance_input_type`, `performance_source_type`),
--   • the 3 tables (`performance_scores` head / `performance_score_history` append-only / `performance_inputs`
--     idempotent consumer) — columns + CHECK + UNIQUE VERBATIM Doc-6G §3.3.1/§3.3.2/§3.3.3 (Doc-2 §10.6),
--   • the immutability triggers (head: id/vendor_profile_id/created_at/created_by frozen; history + inputs
--     full append-only) via the M0-owned shared-kernel `core.raise_immutable_violation`,
--   • the `performance_inputs` dedup UNIQUE + the vendor/input/occurred index,
--   • the RLS: admin READ only — NO write policy on any of the three (System-only writes; never hand-edited —
--     Invariant #6 / TR-CR3),
--   • the SECURITY-DEFINER writers the System Performance-scoring service calls (append input / upsert score+history).
--
-- Enum labels/columns are [Doc-2 §10.6 binding]; physical specifics (names, index predicates) are [§2.5].
-- `score_freeze_state` is created HERE (shared with `trust_scores` in a later WP; §3.2 not yet realized).
-- `vendor_profile_id` is a bare cross-module UUID → M2 (no FK; Doc-2 §0.3); `source_entity_id` a bare UUID → M3/M4.
-- Tables/columns are also mirrored in schema.prisma (`PerformanceScore`/`PerformanceScoreHistory`/`PerformanceInput`);
-- enums/indexes/triggers/RLS/functions are raw SQL here (the house pattern, cf. `trust_verified_financial_tiers`).
-- Forward-only, non-destructive (Doc-6A §11.2).
--
-- WHY SECURITY-DEFINER WRITES ([ESC-TRUST-SDWRITE]): the three score-class tables grant NO write policy
-- (§3.x — "no in-band write path" = never hand-edited, Invariant #6). Writes are System-triggered but performed
-- by the owner-role / SECURITY DEFINER functions that BYPASS RLS — the exact mechanism Doc-6G §2.2 sanctions for
-- the score-class tables (TR-CR3). The functions are DUMB: NO authorization inside (the app layer authorizes
-- BEFORE calling — here computation/ingestion are System-actor, no slug, Doc-4G §H.3); they only serialize
-- concurrent same-vendor writes (advisory xact lock), dedup the idempotent input (ON CONFLICT), and change-detect
-- the head under the lock (publish-on-change). Injection-safety mirrors the WP3 precedent: SECURITY DEFINER +
-- a pinned `search_path` + fully-qualified refs + parameterized values (no dynamic SQL).
--
-- [ESC-TRUST-SDWRITE] — the eventual Doc-6G realization patch must BLESS these specific Performance-Score write
-- functions (Doc-6G §2.2 owner-role/SD mechanism; System-triggered, never a hand-edit path).
-- [OBS guard-rail] — the functions TRUST their inputs (no authz / no ownership check inside). The M5
-- Performance-Score write-service is the SOLE vetted caller; do NOT invoke these from an unvetted path.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6G §3.3 — VERBATIM) — declared before the tables that use them
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "trust"."score_freeze_state" AS ENUM ('none', 'frozen');  -- [Doc-2 §10.6 binding] (shared with trust_scores; created here)
CREATE TYPE "trust"."performance_input_type" AS ENUM ('response', 'decline', 'non_response', 'delivery', 'feedback', 'dispute', 'completion');  -- [Doc-2 §10.6 binding]
CREATE TYPE "trust"."performance_source_type" AS ENUM ('invitation', 'quotation', 'engagement', 'wcc');  -- [Doc-2 §10.6 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) trust.performance_scores (§3.3.1 — head; NULLABLE score = Not Rated; min-threshold gate) — VERBATIM
--     Doc-6G §3.3.1 columns/CHECK/UNIQUE; NO SD; System-written.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."performance_scores" (
  "id" uuid NOT NULL, "vendor_profile_id" uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  "score" smallint,                                             -- [Doc-2 §10.6] 0–100 NULLABLE — NULL = Not Rated
  "level" text,                                                 -- [Doc-2 §10.6] (no enum values declared → text [§2.5])
  "components_jsonb" jsonb,                                     -- [Doc-2 §10.6] 6 weighted components (renormalized)
  "performance_formula_version" text NOT NULL,                 -- [Doc-2 §10.6]
  "performance_score_updated_at" timestamptz NOT NULL DEFAULT now(),  -- [Doc-2 §10.6]
  "freeze_state" "trust"."score_freeze_state" NOT NULL DEFAULT 'none',  -- [Doc-2 §10.6]
  "freeze_reason" text, "frozen_at" timestamptz,
  "min_threshold_met" boolean NOT NULL DEFAULT false,          -- [Doc-2 §10.6] 5 responses OR 2 projects (gates score)
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid, "updated_by" uuid,                        -- [Doc-2 §0.2] = System actor
  CONSTRAINT "performance_scores_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "performance_scores_vendor_uq" UNIQUE ("vendor_profile_id"),
  CONSTRAINT "performance_scores_range_chk" CHECK ("score" IS NULL OR "score" BETWEEN 0 AND 100)  -- [Doc-2 §10.6]
);
CREATE TRIGGER "performance_scores_immutable" BEFORE UPDATE OR DELETE ON "trust"."performance_scores" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation('id', 'vendor_profile_id', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) trust.performance_score_history (§3.3.2 — append-only) — VERBATIM Doc-6G §3.3.2
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."performance_score_history" (
  "id" uuid NOT NULL, "performance_score_id" uuid NOT NULL, "vendor_profile_id" uuid NOT NULL,  -- [Doc-2 §10.6]
  "score" smallint, "level" text, "performance_formula_version" text NOT NULL, "snapshot_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz NOT NULL DEFAULT now(), "created_by" uuid,
  CONSTRAINT "performance_score_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "performance_score_history_score_fk" FOREIGN KEY ("performance_score_id") REFERENCES "trust"."performance_scores"("id"),
  CONSTRAINT "performance_score_history_range_chk" CHECK ("score" IS NULL OR "score" BETWEEN 0 AND 100)
);
CREATE TRIGGER "performance_score_history_immutable" BEFORE UPDATE OR DELETE ON "trust"."performance_score_history" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'performance_score_id', 'vendor_profile_id', 'score', 'level', 'performance_formula_version', 'snapshot_at', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) trust.performance_inputs (§3.3.3 — idempotent Operations consumer; append-only) — VERBATIM Doc-6G §3.3.3
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."performance_inputs" (
  "id" uuid NOT NULL, "vendor_profile_id" uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  "source_entity_id" uuid NOT NULL,                            -- [Doc-2 §10.6] polymorphic bare UUID (→ M3/M4)
  "source_type" "trust"."performance_source_type" NOT NULL,    -- [Doc-2 §10.6] discriminator
  "input_type" "trust"."performance_input_type" NOT NULL,      -- [Doc-2 §10.6]
  "occurred_at" timestamptz NOT NULL,                          -- [Doc-2 §10.6]
  "value_jsonb" jsonb,                                         -- [Doc-2 §10.6]
  "created_at" timestamptz NOT NULL DEFAULT now(), "created_by" uuid,  -- [Doc-2 §0.2] (NO SD — append-only; corrections = new rows, audited)
  CONSTRAINT "performance_inputs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "performance_inputs_dedup_uq" UNIQUE ("source_type", "source_entity_id", "input_type")  -- [§2.5] idempotent consumer (one input per source+type)
);
CREATE INDEX "performance_inputs_vendor_idx" ON "trust"."performance_inputs" ("vendor_profile_id", "input_type", "occurred_at");  -- [§2.5]
CREATE TRIGGER "performance_inputs_immutable" BEFORE UPDATE OR DELETE ON "trust"."performance_inputs" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'vendor_profile_id', 'source_entity_id', 'source_type', 'input_type', 'occurred_at', 'value_jsonb', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) RLS (Doc-6G §3.x) — admin READ only; NO write policy on any of the three. The deliberate ABSENCE of a
--     write policy is the RLS realization of "scores auto-calculated under the System actor, never hand-edited"
--     (Invariant #6 / TR-CR3). history + inputs UPDATE/DELETE are ALSO blocked by their immutability triggers.
--     The public performance BADGE is M2's reflection — NO public read here. Fail-closed off the staff GUC.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "trust"."performance_scores" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_scores_read" ON "trust"."performance_scores" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
ALTER TABLE "trust"."performance_score_history" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_score_history_read" ON "trust"."performance_score_history" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
ALTER TABLE "trust"."performance_inputs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_inputs_read" ON "trust"."performance_inputs" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no FOR INSERT/UPDATE/DELETE policy on ANY of the three = no in-band write path; the scores are never hand-edited.)

-- ─────────────────────────────────────────────────────────────────────────────
-- (6) SECURITY-DEFINER write functions (Doc-6G §2.2 owner-role / SD — RLS bypass) — [ESC-TRUST-SDWRITE]
-- ─────────────────────────────────────────────────────────────────────────────

-- (6a) append_performance_input — the SOLE writer of `performance_inputs` (Doc-4G §G6.1, F4G-M2). Idempotent
-- consumer: ON CONFLICT on the dedup UNIQUE (source_type, source_entity_id, input_type) DO NOTHING → a replayed
-- at-least-once event produces NO duplicate row. Returns (id, created): created=false ⇒ the row already existed
-- (the service maps it to an idempotent no-op — no event, no audit). Corrections are NEW rows (never edits).
CREATE FUNCTION "trust".append_performance_input(
  p_id                uuid,
  p_vendor_profile_id uuid,
  p_source_entity_id  uuid,
  p_source_type       "trust"."performance_source_type",
  p_input_type        "trust"."performance_input_type",
  p_occurred_at       timestamptz,
  p_value             jsonb,
  p_actor             uuid
) RETURNS TABLE(id uuid, created boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = trust, pg_temp AS $$
DECLARE v_existing uuid;
BEGIN
  INSERT INTO trust.performance_inputs (
    id, vendor_profile_id, source_entity_id, source_type, input_type, occurred_at, value_jsonb, created_by
  ) VALUES (
    p_id, p_vendor_profile_id, p_source_entity_id, p_source_type, p_input_type, p_occurred_at, p_value, p_actor
  )
  ON CONFLICT (source_type, source_entity_id, input_type) DO NOTHING;

  IF FOUND THEN
    RETURN QUERY SELECT p_id, true;   -- a fresh row was appended
    RETURN;
  END IF;

  -- Dedup hit: the (source_type, source_entity_id, input_type) triple already has a row — return its id.
  SELECT pi.id
    INTO v_existing
    FROM trust.performance_inputs pi
   WHERE pi.source_type = p_source_type
     AND pi.source_entity_id = p_source_entity_id
     AND pi.input_type = p_input_type
   LIMIT 1;
  RETURN QUERY SELECT v_existing, false;
END $$;

-- (6b) upsert_performance_score — the compute writer (Doc-4G §G6.2). Advisory-locks the vendor, reads the
-- current head, and change-detects UNDER THE LOCK on (score, level, performance_formula_version) — publish-on-change
-- (Doc-4G §H.8/§10). On a change (or first compute): upsert the head + append ONE `performance_score_history`
-- snapshot. On no change: no write. NEVER touches freeze_state/freeze_reason/frozen_at (freeze/reactivate is the
-- only freeze_state writer — DEFERRED). Returns (id, changed, formula_changed, freeze_state, updated_at) so the
-- SERVICE emits `PerformanceScoreUpdated` (suppressed while frozen) + appends ONE audit — atomically on the tx.
-- Doing the change-detection + head write + history append inside ONE locked SD call keeps the snapshot race-free
-- (two racing computes never double-snapshot). `p_score` NULL = Not Rated (below min_threshold_met — never 0).
CREATE FUNCTION "trust".upsert_performance_score(
  p_id                uuid,
  p_history_id        uuid,
  p_vendor_profile_id uuid,
  p_score             smallint,
  p_level             text,
  p_components        jsonb,
  p_formula_version   text,
  p_min_threshold_met boolean,
  p_actor             uuid
) RETURNS TABLE(id uuid, changed boolean, formula_changed boolean, freeze_state text, updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = trust, pg_temp AS $$
DECLARE
  v_now         timestamptz := date_trunc('milliseconds', clock_timestamp());
  v_head_id     uuid;
  v_old_score   smallint;
  v_old_level   text;
  v_old_formula text;
  v_old_freeze  "trust"."score_freeze_state";
  v_old_updated timestamptz;
  v_changed     boolean;
  v_formula_chg boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_vendor_profile_id::text, 0));

  SELECT ps.id, ps.score, ps.level, ps.performance_formula_version, ps.freeze_state, ps.updated_at
    INTO v_head_id, v_old_score, v_old_level, v_old_formula, v_old_freeze, v_old_updated
    FROM trust.performance_scores ps
   WHERE ps.vendor_profile_id = p_vendor_profile_id;

  IF NOT FOUND THEN
    -- First compute for this vendor: establish the head (Not Rated if p_score IS NULL — never 0) + one snapshot.
    INSERT INTO trust.performance_scores (
      id, vendor_profile_id, score, level, components_jsonb, performance_formula_version,
      performance_score_updated_at, min_threshold_met, updated_at, created_by, updated_by
    ) VALUES (
      p_id, p_vendor_profile_id, p_score, p_level, p_components, p_formula_version,
      v_now, p_min_threshold_met, v_now, p_actor, p_actor
    );
    INSERT INTO trust.performance_score_history (
      id, performance_score_id, vendor_profile_id, score, level, performance_formula_version, snapshot_at, created_by
    ) VALUES (
      p_history_id, p_id, p_vendor_profile_id, p_score, p_level, p_formula_version, v_now, p_actor
    );
    RETURN QUERY SELECT p_id, true, false, 'none'::text, v_now;
    RETURN;
  END IF;

  -- Existing head: publish-on-change on (score, level, formula_version). IS DISTINCT FROM handles NULLs.
  v_changed := (p_score IS DISTINCT FROM v_old_score)
            OR (p_level IS DISTINCT FROM v_old_level)
            OR (p_formula_version IS DISTINCT FROM v_old_formula);
  v_formula_chg := (p_formula_version IS DISTINCT FROM v_old_formula);

  IF NOT v_changed THEN
    -- Idempotent recompute: same score/level/formula → no head write, no snapshot (the service emits/audits nothing).
    RETURN QUERY SELECT v_head_id, false, false, v_old_freeze::text, v_old_updated;
    RETURN;
  END IF;

  -- Alias the target table so the bare column `id` is NOT ambiguous with the RETURNS TABLE OUT column `id`.
  UPDATE trust.performance_scores AS ps
     SET score                        = p_score,
         level                        = p_level,
         components_jsonb             = p_components,
         performance_formula_version  = p_formula_version,
         min_threshold_met            = p_min_threshold_met,
         performance_score_updated_at = v_now,
         updated_at                   = v_now,
         updated_by                   = p_actor
   WHERE ps.id = v_head_id;

  INSERT INTO trust.performance_score_history (
    id, performance_score_id, vendor_profile_id, score, level, performance_formula_version, snapshot_at, created_by
  ) VALUES (
    p_history_id, v_head_id, p_vendor_profile_id, p_score, p_level, p_formula_version, v_now, p_actor
  );

  RETURN QUERY SELECT v_head_id, true, v_formula_chg, v_old_freeze::text, v_now;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- (7) EXECUTE tightening ([ESC-TRUST-SDWRITE]) — remove the over-broad PUBLIC default on the privileged
--     RLS-bypass functions; the owning application role retains EXECUTE. Grant to a dedicated non-owner app
--     role here when one is provisioned.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION "trust".append_performance_input(
  uuid, uuid, uuid, "trust"."performance_source_type", "trust"."performance_input_type", timestamptz, jsonb, uuid
) FROM PUBLIC;
REVOKE ALL ON FUNCTION "trust".upsert_performance_score(
  uuid, uuid, uuid, smallint, text, jsonb, text, boolean, uuid
) FROM PUBLIC;
