-- Doc-6G — M5 Trust (`trust`) — `trust_request_verification_write` (forward-only; Doc-6A §11).
-- W3-TRUST-2 — the privileged SECURITY-DEFINER write surface for `trust.request_verification.v1`
-- (Doc-4G §G4.1; the BC-TRUST-1 Verification Case open leg), realized at the APPLICATION layer as
-- `subject_type = organization` only. NO table/column change (schema.prisma is unchanged) — this adds
-- ONE privileged FUNCTION + its grant tightening.
--
-- WHY A SECURITY-DEFINER FUNCTION (owner-directed governance decision). `trust.verification_records`
-- RLS is staff-only FOR ALL (`app.is_platform_staff`; 20260711160000_trust_verification_substrate). A
-- User/Owner requesting verification is NOT platform staff, so an in-band tenant INSERT is RLS-denied.
-- The owner-role / SECURITY DEFINER RLS-bypass is the same MECHANISM Doc-6G §2.2 sanctions — but note the
-- SCOPE difference: Doc-6G §2.2's frozen text blesses that mechanism for *System-actor* writes to the
-- *score-class* tables (`verified_financial_tiers`/`trust_scores`/`performance_scores`; TR-CR3), never
-- hand-edited. This WP EXTENDS the mechanism to a NEW surface: a USER-attributed open leg on
-- `verification_records` (`requested_by`/`created_by` = the submitting user, not the System actor). That
-- is a genuine actor-type + table extension of the sanction, not a use already spelled out in Doc-6G.
-- The function is DUMB: it performs NO authorization (the app layer authorizes `can_submit_verification`
-- + `subject_id === active_org` ownership BEFORE calling it) and only serializes concurrent same-subject
-- requests, applies the stage-8 open-case de-dup, and inserts. Injection-safety is modeled on
-- `core.allocate_human_ref` (core_init): SECURITY DEFINER + a pinned `search_path` + fully-qualified
-- object references + parameterized values (no dynamic SQL).
--
-- [ESC-TRUST-SDWRITE] — the eventual Doc-6G realization patch must BLESS this specific user-initiated
-- privileged-write path AND its User actor-type on `verification_records` (not merely rubber-stamp the
-- function signature): it is an extension beyond the frozen §2.2 System-score-write scope.
-- [OBS-4 guard-rail] — the function TRUSTS its inputs (no authz / no ownership check inside). ANY caller
-- MUST pass server-resolved, ownership-checked values (`subject_id === active_org`, an authorized
-- `can_submit_verification` principal). The M5 command (`request-verification.command.ts`) is the SOLE
-- vetted caller; do NOT invoke this function from an unvetted path.
--
-- The over-broad default EXECUTE-to-PUBLIC is REVOKED (a SECURITY DEFINER function that bypasses RLS must
-- not be callable by every role); the owning role (the application connection in this deployment) retains
-- EXECUTE implicitly. When a distinct non-owner application role is provisioned, GRANT EXECUTE to it here.
--
-- Forward-only, non-destructive (Doc-6A §11.2).

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) The privileged open-case function (Doc-6G §2.2 owner-role / SECURITY DEFINER — RLS bypass)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE FUNCTION "trust".request_verification_open_case(
  p_id                     uuid,
  p_subject_id             uuid,
  p_subject_type           "trust"."verification_subject_type",
  p_verification_type      "trust"."verification_type",
  p_evidence_document_refs uuid[],
  p_requested_by           uuid
) RETURNS TABLE(id uuid, created boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = trust, pg_temp AS $$
DECLARE existing_id uuid;
BEGIN
  -- Serialize concurrent same-subject requests so the check-then-insert stage-8 de-dup has no race
  -- window. The advisory lock is TRANSACTION-scoped (released at commit OR rollback) — no leak.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_subject_id::text || ':' || p_subject_type::text, 0));

  -- Stage-8 BUSINESS de-dup: one OPEN case (state ∈ requested|in_review) per (subject_id, subject_type).
  SELECT vr.id
    INTO existing_id
    FROM trust.verification_records vr
   WHERE vr.subject_id = p_subject_id
     AND vr.subject_type = p_subject_type
     AND vr.state IN ('requested', 'in_review')
   ORDER BY vr.created_at ASC
   LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN QUERY SELECT existing_id, false;   -- an open case exists → INSERT nothing
    RETURN;
  END IF;

  -- No open case → open one. `state` defaults to 'requested' (substrate). requested_by / created_by /
  -- updated_by = the submitting user (the audit is User-attributed, Doc-4G §G4.1 §7).
  INSERT INTO trust.verification_records (
    id, subject_id, subject_type, verification_type, evidence_document_refs,
    requested_by, created_by, updated_by
  ) VALUES (
    p_id, p_subject_id, p_subject_type, p_verification_type,
    COALESCE(p_evidence_document_refs, '{}'::uuid[]),
    p_requested_by, p_requested_by, p_requested_by
  );

  RETURN QUERY SELECT p_id, true;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) EXECUTE tightening ([ESC-TRUST-SDWRITE]) — remove the over-broad PUBLIC default on a privileged
--     RLS-bypass function; the owning application role retains EXECUTE. Grant to a dedicated non-owner
--     app role here when one is provisioned.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION "trust".request_verification_open_case(
  uuid, uuid, "trust"."verification_subject_type", "trust"."verification_type", uuid[], uuid
) FROM PUBLIC;
