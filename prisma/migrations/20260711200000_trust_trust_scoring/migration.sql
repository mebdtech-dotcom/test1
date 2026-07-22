-- Doc-6G — M5 Trust (`trust`) — Trust Scoring substrate (forward-only; Doc-6A §11).
-- W3-TRUST-4b — the BC-TRUST-2 System-computed Trust Score aggregate (Doc-6G §3.2 / §3.x;
-- Doc-4G PassB Part2 §G5/§H). Realizes:
--   • the 2 tables (`trust_scores` head / `trust_score_history` append-only) — columns + CHECK + UNIQUE
--     VERBATIM Doc-6G §3.2.1/§3.2.2 (Doc-2 §10.6),
--   • the immutability triggers (head: id/vendor_profile_id/created_at/created_by frozen; history full
--     append-only) via the M0-owned shared-kernel `core.raise_immutable_violation`,
--   • the `trust_score_history` vendor/snapshot index,
--   • the RLS: admin READ only — NO write policy on either (System-only writes; never hand-edited —
--     Invariant #6 / TR-CR3),
--   • the ONE SECURITY-DEFINER writer the System Trust-scoring service calls (upsert score + history-iff-changed).
--
-- ⚠ `trust.score_freeze_state` ALREADY EXISTS — it was created in `20260711190000_trust_performance_scoring`
--   (a SHARED enum; Doc-6G §3.2.1 / §3.3.1). It is NOT re-created here (a second `CREATE TYPE` would error on
--   `migrate deploy`). This migration REUSES it for `trust_scores.freeze_state`. In schema.prisma the
--   `ScoreFreezeState` enum is likewise reused (not redeclared).
--
-- Enum labels/columns are [Doc-2 §10.6 binding]; physical specifics (names, index predicates) are [§2.5].
-- `vendor_profile_id` is a bare cross-module UUID → M2 (no FK; Doc-2 §0.3). Tables/columns are also mirrored
-- in schema.prisma (`TrustScore`/`TrustScoreHistory`); the index/triggers/RLS/function are raw SQL here (the
-- house pattern, cf. `trust_performance_scoring`). Forward-only, non-destructive (Doc-6A §11.2).
--
-- TRUST SCORE ≠ PERFORMANCE SCORE (Doc-6G §3.2.1 vs §3.3.1): `trust_scores.score` is `smallint NOT NULL`
-- CHECK (0–100) — there is NO Not-Rated NULL state; the lifecycle is `computed | frozen` only. A no-input
-- vendor still gets a documented NON-ZERO interim baseline (absence-of-history ≠ 0 — Doc-3 §12.1 FIXED); the
-- baseline value is the formula plug's `[ESC-TRUST-POLICY]` concern, not the substrate's.
--
-- FIREWALL (Doc-6G §3.2.1; Invariant #6): `trust_scores` carries NO column computed from Financial Tier /
-- Performance / Buyer-Vendor Status and NO cross-score FK — the score CONSUMES `verification_records` +
-- `performance_scores` + a fraud read-seam (read-only, same-module) and never `verified_financial_tiers`.
--
-- WHY SECURITY-DEFINER WRITE ([ESC-TRUST-SDWRITE]): the score-class tables grant NO write policy (§3.x —
-- "no in-band write path" = never hand-edited, Invariant #6). Writes are System-triggered but performed by the
-- owner-role / SECURITY DEFINER function that BYPASSES RLS — the exact mechanism Doc-6G §2.2 sanctions for the
-- score-class tables (TR-CR3). The function is DUMB: NO authorization inside (the app layer authorizes BEFORE
-- calling — computation is System-actor, no slug, Doc-4G §H.3); it only serializes concurrent same-vendor
-- writes (advisory xact lock) and change-detects the head under the lock (publish-on-change). Injection-safety
-- mirrors the WP3/WP4a precedent: SECURITY DEFINER + a pinned `search_path` + fully-qualified refs +
-- parameterized values (no dynamic SQL). NO ingest writer — Trust Score has NO input table (it READS
-- verification_records + performance_scores).
--
-- [ESC-TRUST-SDWRITE] — the eventual Doc-6G realization patch must BLESS this specific Trust-Score write
-- function (Doc-6G §3.2 "NO SD" annotation extended; System-triggered, never a hand-edit path — the WP3/WP4a
-- precedent).
-- [OBS guard-rail] — the function TRUSTS its inputs (no authz / no ownership check inside). The M5
-- Trust-Score write-service is the SOLE vetted caller; do NOT invoke it from an unvetted path.

-- ─────────────────────────────────────────────────────────────────────────────
-- (0) Enum note — `trust.score_freeze_state` pre-exists (shared; created in `trust_performance_scoring`).
--     NOT re-created here. `trust_scores.freeze_state` references the existing type.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) trust.trust_scores (§3.2.1 — head; score smallint NOT NULL 0–100; lifecycle computed|frozen) — VERBATIM
--     Doc-6G §3.2.1 columns/CHECK/UNIQUE; NO SD; System-written.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."trust_scores" (
  "id" uuid NOT NULL, "vendor_profile_id" uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  "score" smallint NOT NULL,                                   -- [Doc-2 §10.6] 0–100 (NOT NULL — no Not-Rated)
  "band" text NOT NULL,                                        -- [Doc-2 §10.6] (no enum values declared → text [§2.5])
  "trust_formula_version" text NOT NULL,                       -- [Doc-2 §10.6]
  "trust_score_updated_at" timestamptz NOT NULL DEFAULT now(), -- [Doc-2 §10.6]
  "freeze_state" "trust"."score_freeze_state" NOT NULL DEFAULT 'none',  -- [Doc-2 §10.6] (shared enum; pre-existing)
  "freeze_reason" text, "frozen_at" timestamptz,               -- [Doc-2 §10.6]
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid, "updated_by" uuid,                        -- [Doc-2 §0.2] = System actor (TR-CR3)
  CONSTRAINT "trust_scores_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "trust_scores_vendor_uq" UNIQUE ("vendor_profile_id"),  -- [Doc-2 §10.6]
  CONSTRAINT "trust_scores_range_chk" CHECK ("score" BETWEEN 0 AND 100)  -- [Doc-2 §10.6 binding]
);
CREATE TRIGGER "trust_scores_immutable" BEFORE UPDATE OR DELETE ON "trust"."trust_scores" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation('id', 'vendor_profile_id', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) trust.trust_score_history (§3.2.2 — append-only per-update snapshot) — VERBATIM Doc-6G §3.2.2
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."trust_score_history" (
  "id" uuid NOT NULL, "trust_score_id" uuid NOT NULL, "vendor_profile_id" uuid NOT NULL,  -- [Doc-6A §5.2 in-module FK]
  "score" smallint NOT NULL, "band" text NOT NULL, "trust_formula_version" text NOT NULL,  -- [Doc-2 §10.6] snapshot
  "snapshot_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz NOT NULL DEFAULT now(), "created_by" uuid,
  CONSTRAINT "trust_score_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "trust_score_history_score_fk" FOREIGN KEY ("trust_score_id") REFERENCES "trust"."trust_scores"("id"),
  CONSTRAINT "trust_score_history_range_chk" CHECK ("score" BETWEEN 0 AND 100)
);
CREATE INDEX "trust_score_history_vendor_idx" ON "trust"."trust_score_history" ("vendor_profile_id", "snapshot_at");  -- [§2.5]
CREATE TRIGGER "trust_score_history_immutable" BEFORE UPDATE OR DELETE ON "trust"."trust_score_history" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id', 'trust_score_id', 'vendor_profile_id', 'score', 'band', 'trust_formula_version', 'snapshot_at', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS (Doc-6G §3.x) — admin READ only; NO write policy on either. The deliberate ABSENCE of a write
--     policy is the RLS realization of "scores auto-calculated under the System actor, never hand-edited"
--     (Invariant #6 / TR-CR3). history UPDATE/DELETE are ALSO blocked by its immutability trigger. The public
--     trust BAND is M2's reflection (via TrustScoreUpdated) — NO public read here. Fail-closed off the staff GUC.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "trust"."trust_scores" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trust_scores_read" ON "trust"."trust_scores" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
ALTER TABLE "trust"."trust_score_history" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trust_score_history_read" ON "trust"."trust_score_history" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no FOR INSERT/UPDATE/DELETE policy on EITHER = no in-band write path; the scores are never hand-edited.)

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) SECURITY-DEFINER write function (Doc-6G §2.2 owner-role / SD — RLS bypass) — [ESC-TRUST-SDWRITE]
-- ─────────────────────────────────────────────────────────────────────────────

-- upsert_trust_score — the compute writer (Doc-4G §G5.1). Advisory-locks the vendor, reads the current head,
-- and change-detects UNDER THE LOCK on (score, band, trust_formula_version) — publish-on-change (Doc-4G §H.8/§10).
-- On a change (or first compute): upsert the head + append ONE `trust_score_history` snapshot. On no change: no
-- write. NEVER touches freeze_state/freeze_reason/frozen_at (freeze/reactivate is the only freeze_state writer —
-- DEFERRED). Returns (id, changed, formula_changed, freeze_state, updated_at) so the SERVICE emits
-- `TrustScoreUpdated` (suppressed while frozen) + appends ONE audit — atomically on the tx. Doing the
-- change-detection + head write + history append inside ONE locked SD call keeps the snapshot race-free (two
-- racing computes never double-snapshot). `p_score` is ALWAYS 0–100 (Trust Score has no Not-Rated NULL state).
CREATE FUNCTION "trust".upsert_trust_score(
  p_id                uuid,
  p_history_id        uuid,
  p_vendor_profile_id uuid,
  p_score             smallint,
  p_band              text,
  p_formula_version   text,
  p_actor             uuid
) RETURNS TABLE(id uuid, changed boolean, formula_changed boolean, freeze_state text, updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = trust, pg_temp AS $$
DECLARE
  v_now         timestamptz := date_trunc('milliseconds', clock_timestamp());
  v_head_id     uuid;
  v_old_score   smallint;
  v_old_band    text;
  v_old_formula text;
  v_old_freeze  "trust"."score_freeze_state";
  v_old_updated timestamptz;
  v_changed     boolean;
  v_formula_chg boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_vendor_profile_id::text, 0));

  SELECT ts.id, ts.score, ts.band, ts.trust_formula_version, ts.freeze_state, ts.updated_at
    INTO v_head_id, v_old_score, v_old_band, v_old_formula, v_old_freeze, v_old_updated
    FROM trust.trust_scores ts
   WHERE ts.vendor_profile_id = p_vendor_profile_id;

  IF NOT FOUND THEN
    -- First compute for this vendor: establish the head (a 0–100 score, never Not-Rated) + one snapshot.
    INSERT INTO trust.trust_scores (
      id, vendor_profile_id, score, band, trust_formula_version,
      trust_score_updated_at, updated_at, created_by, updated_by
    ) VALUES (
      p_id, p_vendor_profile_id, p_score, p_band, p_formula_version,
      v_now, v_now, p_actor, p_actor
    );
    INSERT INTO trust.trust_score_history (
      id, trust_score_id, vendor_profile_id, score, band, trust_formula_version, snapshot_at, created_by
    ) VALUES (
      p_history_id, p_id, p_vendor_profile_id, p_score, p_band, p_formula_version, v_now, p_actor
    );
    RETURN QUERY SELECT p_id, true, false, 'none'::text, v_now;
    RETURN;
  END IF;

  -- Existing head: publish-on-change on (score, band, formula_version). IS DISTINCT FROM handles NULLs.
  v_changed := (p_score IS DISTINCT FROM v_old_score)
            OR (p_band IS DISTINCT FROM v_old_band)
            OR (p_formula_version IS DISTINCT FROM v_old_formula);
  v_formula_chg := (p_formula_version IS DISTINCT FROM v_old_formula);

  IF NOT v_changed THEN
    -- Idempotent recompute: same score/band/formula → no head write, no snapshot (the service emits/audits nothing).
    RETURN QUERY SELECT v_head_id, false, false, v_old_freeze::text, v_old_updated;
    RETURN;
  END IF;

  -- Alias the target table so the bare column `id` is NOT ambiguous with the RETURNS TABLE OUT column `id`.
  UPDATE trust.trust_scores AS ts
     SET score                  = p_score,
         band                   = p_band,
         trust_formula_version  = p_formula_version,
         trust_score_updated_at = v_now,
         updated_at             = v_now,
         updated_by             = p_actor
   WHERE ts.id = v_head_id;

  INSERT INTO trust.trust_score_history (
    id, trust_score_id, vendor_profile_id, score, band, trust_formula_version, snapshot_at, created_by
  ) VALUES (
    p_history_id, v_head_id, p_vendor_profile_id, p_score, p_band, p_formula_version, v_now, p_actor
  );

  RETURN QUERY SELECT v_head_id, true, v_formula_chg, v_old_freeze::text, v_now;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) EXECUTE tightening ([ESC-TRUST-SDWRITE]) — remove the over-broad PUBLIC default on the privileged
--     RLS-bypass function; the owning application role retains EXECUTE. Grant to a dedicated non-owner app
--     role here when one is provisioned.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION "trust".upsert_trust_score(
  uuid, uuid, uuid, smallint, text, text, uuid
) FROM PUBLIC;
