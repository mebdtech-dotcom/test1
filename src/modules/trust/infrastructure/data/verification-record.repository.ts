// M5 infrastructure (PRIVATE) — the `trust.verification_records` open-case WRITE, over the privileged
// SECURITY-DEFINER function `trust.request_verification_open_case(...)`
// (prisma/migrations/20260711170000_trust_request_verification_write). This is M5 writing its OWN
// schema (allowed); other modules reach it only via M5 contracts, never by importing infrastructure.
//
// WHY THE FUNCTION (not a Prisma `create`): `trust.verification_records` RLS is staff-only FOR ALL
// (`app.is_platform_staff`; the substrate migration). A User/Owner is NOT platform staff, so an in-band
// tenant INSERT is RLS-denied. The Doc-6G §2.2-sanctioned owner-role / SECURITY DEFINER function bypasses
// RLS by ownership and performs the serialized stage-8-deduped insert. The function is DUMB — NO
// authorization inside; the app layer authorizes BEFORE this call. This repository OWNS the SQL and knows
// NOTHING of audit policy — it returns `{ id, created }` so the COMMAND decides the audit.

import { Prisma, prisma, type DbExecutor } from "@/shared/db";

/** The open-case write arguments — the (already-validated) frozen Doc-4G §G4.1 request fields + the
 *  app-minted UUIDv7 id + the `requested_by` actor (all server-resolved). */
export interface OpenVerificationCaseInput {
  /** App-minted UUIDv7 for the new row (M0 id generator; never a raw DB default). */
  id: string;
  /** The subject being verified (Doc-4G §G4.1 `subject_id`). */
  subjectId: string;
  /** The subject discriminator (Doc-2 §10.6 `verification_subject_type`). */
  subjectType: string;
  /** The verification type (Doc-2 §10.6 `verification_type`). */
  verificationType: string;
  /** Evidence document refs (Doc-4G §G4.1 `evidence_document_refs[]`); empty ⇒ `{}`. */
  evidenceDocumentRefs: string[];
  /** The submitting user (`requested_by` / `created_by` / `updated_by`). */
  requestedBy: string;
}

/** Outcome of the SD-function open-case write. `created:false` ⇒ an OPEN case already existed for
 *  (subject_id, subject_type) — the stage-8 BUSINESS de-dup path; `id` is that existing case. */
export interface OpenVerificationCaseResult {
  id: string;
  created: boolean;
}

/**
 * Open (or de-dup to an existing) verification case via `trust.request_verification_open_case(...)`,
 * run on the caller's transaction executor `db` (the same `withActiveOrgContext` tx as the audit — so
 * the write + audit are atomic). The function takes an advisory xact lock on (subject_id, subject_type),
 * performs the stage-8 open-case check, and INSERTs only when no open case exists. RLS is bypassed by the
 * function's owner role (Doc-6G §2.2) — the non-staff caller's write succeeds through this single
 * privileged surface.
 *
 * @param input the server-resolved, already-authorized/validated open-case arguments.
 * @param db    the RLS-scoped transaction executor (from `withActiveOrgContext`); write + audit share it.
 */
export async function openVerificationCase(
  input: OpenVerificationCaseInput,
  db: DbExecutor = prisma,
): Promise<OpenVerificationCaseResult> {
  // Bind an empty ref set as NULL (the function COALESCEs to `{}`), sidestepping empty-array element-type
  // inference; a non-empty set binds as a uuid[] parameter (Doc-6A §12 — IDs only, no blobs).
  const refs = input.evidenceDocumentRefs.length > 0 ? input.evidenceDocumentRefs : null;

  const rows = await db.$queryRaw<Array<{ id: string; created: boolean }>>(Prisma.sql`
    SELECT "id", "created"
      FROM "trust".request_verification_open_case(
        ${input.id}::uuid,
        ${input.subjectId}::uuid,
        ${input.subjectType}::"trust"."verification_subject_type",
        ${input.verificationType}::"trust"."verification_type",
        ${refs}::uuid[],
        ${input.requestedBy}::uuid
      )
  `);

  const row = rows[0];
  if (row === undefined) {
    // The SET-returning function always yields exactly one row; a miss is a substrate fault.
    throw new Error("trust.request_verification_open_case returned no row (unreachable).");
  }
  return { id: row.id, created: row.created };
}
