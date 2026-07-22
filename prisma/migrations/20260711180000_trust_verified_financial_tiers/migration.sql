-- Doc-6G — M5 Trust (`trust`) — `trust_verified_financial_tiers` (forward-only; Doc-6A §11).
-- W3-TRUST-3 (Part B) — the BC-TRUST-1 System-written verified-tier aggregate (Doc-6G §3.1.3 / §3.x;
-- Doc-4G §G4.6-§G4.7). Realizes:
--   • the 2 enums + the `verified_financial_tiers` table (columns VERBATIM Doc-2 §10.6 / Doc-6G §3.1.3),
--   • the FULL unique index on `vendor_profile_id` (one row per vendor; absence-of-row = `Declared`-only),
--   • the partial 24-month review-sweep index (WHERE status='verified'),
--   • the column-scoped immutability trigger (id/vendor_profile_id/created_at/created_by frozen; DELETE blocked),
--   • the RLS: admin READ only — NO write policy (System-only writes; never hand-edited — Invariant #6),
--   • the SECURITY-DEFINER write functions (establish / transition) the System verification service calls.
--
-- Enum labels/columns are [Doc-2 §10.6 binding]; physical specifics (names, index predicates) are [§2.5].
-- `tier` uses the MODULE-OWNED `trust.financial_tier` — NOT a cross-schema ref to marketplace.financial_tier
-- (Doc-6G §3.1.3 TIER-ENUM). `vendor_profile_id` is a bare cross-module UUID → M2 (no FK; Doc-2 §0.3). The
-- immutability trigger calls the M0-owned shared-kernel `core.raise_immutable_violation` — a FUNCTION call
-- (allowed; core is realized), NOT cross-schema table access. Tables/columns are also mirrored in
-- schema.prisma (`VerifiedFinancialTier`); enums/indexes/trigger/RLS/functions are raw SQL here (the house
-- pattern, cf. `trust_verification_substrate`). Forward-only, non-destructive (Doc-6A §11.2).
--
-- WHY SECURITY-DEFINER WRITES ([ESC-TRUST-SDWRITE]): `verified_financial_tiers` RLS grants NO write policy
-- (§3.x — "no in-band write path" = never hand-edited, Invariant #6). Writes are System/Admin-triggered but
-- performed by the owner-role / SECURITY DEFINER functions that BYPASS RLS — the exact mechanism Doc-6G §2.2
-- sanctions for the score-class tables (TR-CR3). The functions are DUMB: NO authorization inside (the app
-- layer authorizes `staff_can_verify` BEFORE calling); they only serialize concurrent same-vendor writes
-- (advisory xact lock), guard the UNIQUE (establish) / the optimistic precondition + source-status
-- (transition), and write. Injection-safety mirrors the WP2 precedent (`request_verification_open_case`):
-- SECURITY DEFINER + a pinned `search_path` + fully-qualified refs + parameterized values (no dynamic SQL).
--
-- [ESC-TRUST-SDWRITE] — the eventual Doc-6G realization patch must BLESS these specific verified-tier
-- write functions (Doc-6G §2.2 owner-role/SD mechanism; here the writes are Admin/System-triggered, still
-- owner-role/SD — never a hand-edit path).
-- [OBS guard-rail] — the functions TRUST their inputs (no authz / no ownership check inside). The M5
-- verified-tier write-service is the SOLE vetted caller; do NOT invoke these from an unvetted path.
--
-- `updated_at` is the OPTIMISTIC-CONCURRENCY token (Doc-4A §10.2 realized against `updated_at`, since the
-- frozen `expected_revision` has no dedicated numeric column). It is written millisecond-TRUNCATED
-- (`date_trunc('milliseconds', …)`) so a value read back through Prisma (JS `Date`, ms precision) round-trips
-- to an EXACT match on the next transition's WHERE (a microsecond token would falsely miss and read as CONFLICT).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6G §3.1.3) — declared before the table that uses them
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "trust"."financial_tier"        AS ENUM ('A', 'B', 'C', 'D', 'E');  -- [Doc-2 §10.6 `tier(A–E)` binding] module-owned (NOT marketplace.financial_tier)
CREATE TYPE "trust"."verified_tier_status"  AS ENUM ('pending_verification', 'verified', 'suspended', 'expired');  -- [Doc-2 §10.6 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Table (Doc-2 §10.6 columns verbatim; physical specifics [§2.5])
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE "trust"."verified_financial_tiers" (
  "id"                uuid                         NOT NULL,                                  -- [Doc-6A §3.1] PK UUIDv7 (app-supplied)
  "vendor_profile_id" uuid                         NOT NULL,                                  -- [Doc-2 §10.6] bare UUID → M2 (no FK)
  "tier"              "trust"."financial_tier"     NOT NULL,                                  -- [Doc-2 §10.6]
  "status"            "trust"."verified_tier_status" NOT NULL DEFAULT 'pending_verification', -- [Doc-2 §10.6]
  "verified_at"       timestamptz,                                                            -- [Doc-2 §10.6]
  "next_review_at"    timestamptz,                                                            -- [Doc-2 §10.6] +24 months
  "basis_jsonb"       jsonb,                                                                  -- [Doc-2 §10.6]
  "created_at"        timestamptz                  NOT NULL DEFAULT now(),                    -- [Doc-6A R5]
  "updated_at"        timestamptz                  NOT NULL DEFAULT now(),                    -- [Doc-6A R5] optimistic-concurrency token
  "created_by"        uuid,                                                                   -- [Doc-2 §0.2] = System/Admin actor (TR-CR3)
  "updated_by"        uuid,                                                                   -- [Doc-2 §0.2]
  CONSTRAINT "verified_financial_tiers_pkey" PRIMARY KEY ("id")                              -- [§2.5] name
);

-- One authoritative verified-tier row per vendor (FULL unique — the DDL has NO partial predicate; "partial"
-- in Doc-2 is descriptive of "absence = Declared-only", not a WHERE clause). [Doc-2 §10.6]
CREATE UNIQUE INDEX "verified_financial_tiers_vendor_uq" ON "trust"."verified_financial_tiers" ("vendor_profile_id");
-- 24-month review sweep (partial). [§2.5]
CREATE INDEX "verified_financial_tiers_review_idx" ON "trust"."verified_financial_tiers" ("next_review_at") WHERE "status" = 'verified';

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Immutability trigger (Doc-6G §3.1.3; via M0-owned core.raise_immutable_violation)
--     identity frozen (id/vendor_profile_id/created_at/created_by); status/tier/verified_at/next_review_at/
--     basis_jsonb/updated_at/updated_by mutable by the System writer (column-scoped — HR-G1); DELETE blocked.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER "verified_financial_tiers_immutable"
  BEFORE UPDATE OR DELETE ON "trust"."verified_financial_tiers" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation('id', 'vendor_profile_id', 'created_at', 'created_by');  -- [Doc-6B §4]

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) RLS (Doc-6G §3.x) — admin READ only; NO write policy. The deliberate ABSENCE of a write policy is
--     the RLS realization of "scores auto-calculated under the System actor, never hand-edited" (Invariant
--     #6). The public band is M2's reflection — NO public read here. Fail-closed off the staff GUC.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "trust"."verified_financial_tiers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verified_financial_tiers_read" ON "trust"."verified_financial_tiers" FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no FOR INSERT/UPDATE/DELETE policy = no in-band write path; the verified tier is never hand-edited.)

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) SECURITY-DEFINER write functions (Doc-6G §2.2 owner-role / SD — RLS bypass) — [ESC-TRUST-SDWRITE]
-- ─────────────────────────────────────────────────────────────────────────────

-- (5a) establish_verified_tier — the `set` transition (absence-of-row → verified). Advisory-locks the vendor,
-- guards the UNIQUE(vendor_profile_id): if a row already exists → return (existing_id, created=false) so the
-- service maps it to BUSINESS; else INSERT status='verified' and return (new_id, true).
CREATE FUNCTION "trust".establish_verified_tier(
  p_id                uuid,
  p_vendor_profile_id uuid,
  p_tier              "trust"."financial_tier",
  p_verified_at       timestamptz,
  p_next_review_at    timestamptz,
  p_basis             jsonb,
  p_actor             uuid
) RETURNS TABLE(id uuid, created boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = trust, pg_temp AS $$
DECLARE existing_id uuid;
BEGIN
  -- Serialize concurrent same-vendor establishes so the check-then-insert UNIQUE guard has no race window.
  -- The advisory lock is TRANSACTION-scoped (released at commit OR rollback) — no leak.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_vendor_profile_id::text, 0));

  SELECT vft.id
    INTO existing_id
    FROM trust.verified_financial_tiers vft
   WHERE vft.vendor_profile_id = p_vendor_profile_id
   LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN QUERY SELECT existing_id, false;   -- a verified-tier row already exists → INSERT nothing
    RETURN;
  END IF;

  -- No row → establish one. status='verified'; created_by/updated_by = the acting System/Admin actor.
  -- updated_at is written ms-truncated (the optimistic-concurrency token; see the header note).
  INSERT INTO trust.verified_financial_tiers (
    id, vendor_profile_id, tier, status, verified_at, next_review_at, basis_jsonb,
    updated_at, created_by, updated_by
  ) VALUES (
    p_id, p_vendor_profile_id, p_tier, 'verified', p_verified_at, p_next_review_at, p_basis,
    date_trunc('milliseconds', now()), p_actor, p_actor
  );

  RETURN QUERY SELECT p_id, true;
END $$;

-- (5b) transition_verified_tier — the confirm/downgrade/suspend/expire transitions (source must be
-- `verified`). Optimistic on `updated_at = p_expected_updated_at`; the source-status guard (`= 'verified'`)
-- is defense-in-depth (the service also checks the domain state machine BEFORE calling). A NULL p_new_tier /
-- p_verified_at / p_next_review_at KEEPS the current column value (COALESCE). Returns (matched, new_updated_at)
-- so the service maps 0-rows to CONFLICT (stale token or a concurrent status change) and rides the new token.
CREATE FUNCTION "trust".transition_verified_tier(
  p_vendor_profile_id   uuid,
  p_expected_updated_at timestamptz,
  p_new_status          "trust"."verified_tier_status",
  p_new_tier            "trust"."financial_tier",
  p_verified_at         timestamptz,
  p_next_review_at      timestamptz,
  p_actor               uuid
) RETURNS TABLE(matched integer, new_updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = trust, pg_temp AS $$
DECLARE
  v_matched integer;
  v_new_ts  timestamptz := date_trunc('milliseconds', clock_timestamp());
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_vendor_profile_id::text, 0));

  UPDATE trust.verified_financial_tiers
     SET status         = p_new_status,
         tier           = COALESCE(p_new_tier, tier),
         verified_at    = COALESCE(p_verified_at, verified_at),
         next_review_at = COALESCE(p_next_review_at, next_review_at),
         updated_at     = v_new_ts,
         updated_by     = p_actor
   WHERE vendor_profile_id = p_vendor_profile_id
     AND updated_at        = p_expected_updated_at
     AND status            = 'verified';

  GET DIAGNOSTICS v_matched = ROW_COUNT;
  RETURN QUERY SELECT v_matched, CASE WHEN v_matched > 0 THEN v_new_ts ELSE NULL::timestamptz END;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- (6) EXECUTE tightening ([ESC-TRUST-SDWRITE]) — remove the over-broad PUBLIC default on privileged
--     RLS-bypass functions; the owning application role retains EXECUTE. Grant to a dedicated non-owner
--     app role here when one is provisioned.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION "trust".establish_verified_tier(
  uuid, uuid, "trust"."financial_tier", timestamptz, timestamptz, jsonb, uuid
) FROM PUBLIC;
REVOKE ALL ON FUNCTION "trust".transition_verified_tier(
  uuid, timestamptz, "trust"."verified_tier_status", "trust"."financial_tier", timestamptz, timestamptz, uuid
) FROM PUBLIC;
