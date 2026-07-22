// M5 application (PRIVATE) — the `trust.request_verification.v1` write command (Doc-4G §G4.1; the D7
// audited-write pattern + the SECURITY-DEFINER twist). RESTRICTED to `subject_type = organization`.
//
// ORCHESTRATION ONLY (owns no state): SYNTAX → SCOPE → privileged write (SD function, via the
// repository) → business (open-case de-dup) → append audit — all on the SAME caller-supplied RLS-scoped
// transaction executor. AUTHZ (`can_submit_verification`) is performed at the composition edge BEFORE
// this command runs (Doc-4A §11.2 stage 3); the composition ALSO runs the stage-1 SYNTAX validator below
// (before AUTHZ, per §11.2 fixed order). The command RE-RUNS the SAME validator (single source,
// defense-in-depth) so the in-process contract stays self-guarding. Pattern (Board ruling):
// Command → appendAuditRecord() → Repository → Transaction → Done.
//
// THE TWO INVARIANTS (CTO gate), guaranteed by sharing ONE transaction (`db`, set RLS-scoped by
// `withActiveOrgContext` upstream):
//   • No business write without an audit row — a successful open appends its audit row in the SAME tx;
//     if the append fails, the tx rolls back and the SD-function insert is undone (SECURITY DEFINER
//     changes the ROLE, not the transaction — the insert participates in the caller's tx).
//   • No audit row without a successful write — audit is appended ONLY when the SD function returns
//     `created === true` (a genuine new row); the de-dup path (`created === false`) writes NO audit.
//
// AUDIT ACTION (canonical, ENUMERATED): `verification_requested` — the M5 constant
// (`domain/audit-actions.ts`) realizing the Doc-2 §9 Trust "verification request" action (Doc-4G §G4.1
// §7), User-attributed (`requested_by`). Never a hardcoded literal.

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import { openVerificationCase } from "@/modules/trust/infrastructure/data/verification-record.repository";
import {
  VERIFICATION_RECORD_ENTITY_TYPE,
  VerificationAuditAction,
} from "@/modules/trust/domain/audit-actions";
import {
  VERIFICATION_INVALID_INPUT_CODE,
  VERIFICATION_NOT_FOUND_CODE,
  VERIFICATION_OPEN_CASE_EXISTS_CODE,
  VERIFICATION_UNSUPPORTED_SUBJECT_CODE,
} from "@/modules/trust/domain/request-verification.constants";
import type {
  RequestVerificationContext,
  RequestVerificationDeps,
  RequestVerificationInput,
  RequestVerificationOutcome,
} from "@/modules/trust/contracts/types";

/** The Doc-2 §10.6 `verification_subject_type` fixed set (SYNTAX oracle; enums ∈ frozen set). */
const SUBJECT_TYPES: ReadonlySet<string> = new Set([
  "vendor_profile",
  "organization",
  "capacity",
  "declared_tier",
]);

/** The Doc-2 §10.6 `verification_type` fixed set (SYNTAX oracle; enums ∈ frozen set). */
const VERIFICATION_TYPES: ReadonlySet<string> = new Set([
  "contact",
  "business",
  "factory",
  "organization",
  "tier",
  "capacity",
]);

/**
 * The discriminated stage-1 SYNTAX result. `kind` selects the interim error code:
 *   - `invalid`     → `trust_verification_invalid_input` (VALIDATION — presence/type/enum/uuid failure).
 *   - `unsupported` → `trust_verification_unsupported_subject` (VALIDATION — a VALID-enum but WP-deferred
 *                     subject type; this WP realizes `organization` only).
 */
export type RequestVerificationSyntaxResult =
  | { ok: true }
  | { ok: false; kind: "invalid" | "unsupported"; message: string };

/**
 * Stage-1 body SYNTAX (Doc-4A §11.2 category 1; Doc-4G §G4.1 stage 1) — PURE (no context): presence/type;
 * enums ∈ the fixed Doc-2 §10.6 sets; uuid shapes; and the WP-scope subject_type gate. SINGLE SOURCE —
 * run at the composition edge (before AUTHZ, §11.2 order) AND re-run by the command (self-guard).
 * subject_type is split three ways per the review: missing/non-string → invalid (presence); present but
 * not in the frozen enum → invalid (enum SYNTAX); a valid enum ≠ `organization` → unsupported (WP-scope).
 */
export function validateRequestVerificationInput(
  input: RequestVerificationInput,
): RequestVerificationSyntaxResult {
  // subject_id — presence + uuid shape.
  if (typeof input.subjectId !== "string" || input.subjectId.length === 0) {
    return { ok: false, kind: "invalid", message: "subject_id is required." };
  }
  if (!UUID_PATTERN.test(input.subjectId)) {
    return { ok: false, kind: "invalid", message: "subject_id must be a uuid." };
  }

  // subject_type — (a) presence → invalid; (b) not-in-frozen-enum → invalid; (c) valid enum ≠ organization
  //                → unsupported (WP-scope).
  if (typeof input.subjectType !== "string" || input.subjectType.length === 0) {
    return { ok: false, kind: "invalid", message: "subject_type is required." };
  }
  if (!SUBJECT_TYPES.has(input.subjectType)) {
    return {
      ok: false,
      kind: "invalid",
      message: "subject_type must be one of the fixed Doc-2 §10.6 subject types.",
    };
  }
  if (input.subjectType !== "organization") {
    return {
      ok: false,
      kind: "unsupported",
      message:
        "This endpoint currently supports subject_type=organization only (other subject types are deferred to a later WP; they require M2/M1 ownership resolution).",
    };
  }

  // verification_type — ∈ the fixed Doc-2 §10.6 enum.
  if (!VERIFICATION_TYPES.has(input.verificationType)) {
    return {
      ok: false,
      kind: "invalid",
      message: "verification_type must be one of the fixed Doc-2 §10.6 verification types.",
    };
  }

  // evidence_document_refs — optional uuid[]; each element must be a uuid (else it escapes as a repository
  // `::uuid[]` cast fault — the review's Fix 1).
  if (input.evidenceDocumentRefs !== undefined) {
    if (!Array.isArray(input.evidenceDocumentRefs)) {
      return {
        ok: false,
        kind: "invalid",
        message: "evidence_document_refs must be an array of document ids.",
      };
    }
    if (input.evidenceDocumentRefs.some((r) => typeof r !== "string" || !UUID_PATTERN.test(r))) {
      return {
        ok: false,
        kind: "invalid",
        message: "evidence_document_refs must be an array of uuids.",
      };
    }
  }

  return { ok: true };
}

/**
 * Map a failed stage-1 SYNTAX result to its VALIDATION outcome (the right code — invalid vs the WP-scope
 * unsupported-subject); `null` when SYNTAX passes. SINGLE SOURCE consumed by BOTH the command (below) and
 * the composition edge (`src/server/trust`) — so the mapping lives in exactly one place.
 */
export function requestVerificationSyntaxOutcome(
  result: RequestVerificationSyntaxResult,
): RequestVerificationOutcome | null {
  if (result.ok) return null;
  return {
    ok: false,
    error: {
      errorClass: "VALIDATION",
      errorCode:
        result.kind === "unsupported"
          ? VERIFICATION_UNSUPPORTED_SUBJECT_CODE
          : VERIFICATION_INVALID_INPUT_CODE,
      message: result.message,
    },
  };
}

/**
 * Request an organization verification case (Doc-4G §G4.1), RESTRICTED to `subject_type=organization`.
 * Opens a `verification_records` row in state `requested`, appending the canonical audit action
 * atomically.
 *
 * @param input the request fields (Doc-4G §G4.1 request schema).
 * @param ctx   the server-resolved, ALREADY-AUTHORIZED context (userId/activeOrgId — never client input).
 * @param deps  the injected M0 `appendAuditRecord` contract service.
 * @param db    the RLS-scoped transaction executor (from `withActiveOrgContext`); write + audit share it.
 */
export async function requestVerificationCommand(
  input: RequestVerificationInput,
  ctx: RequestVerificationContext,
  deps: RequestVerificationDeps,
  db: DbExecutor = prisma,
): Promise<RequestVerificationOutcome> {
  // (1) SYNTAX (Doc-4G §G4.1 stage 1) — re-run the shared validator (single source; the composition edge
  //     already ran it BEFORE AUTHZ per §11.2, so a bad-body caller got 400 there — this keeps the
  //     in-process contract self-guarding / defense-in-depth).
  const badSyntax = requestVerificationSyntaxOutcome(validateRequestVerificationInput(input));
  if (badSyntax !== null) return badSyntax;

  // (2) SCOPE (Doc-4G §G4.1 stage 4; §12 "collapse cross-org subject access to NOT_FOUND"). For an
  //     organization subject, ownership IS the pure server context: the submitting org owns itself, so
  //     the subject MUST be the active org. A different subject collapses to NOT_FOUND (non-disclosure).
  if (input.subjectId !== ctx.activeOrgId) {
    return {
      ok: false,
      error: {
        errorClass: "NOT_FOUND",
        errorCode: VERIFICATION_NOT_FOUND_CODE,
        message: "Not found.",
      },
    };
  }

  // (3) WRITE — the privileged SD function (RLS-bypass by owner role, Doc-6G §2.2): advisory-lock +
  //     stage-8 open-case check + conditional insert. The repository owns the SQL; no audit knowledge.
  const write = await openVerificationCase(
    {
      id: uuidv7(),
      subjectId: input.subjectId,
      subjectType: input.subjectType,
      verificationType: input.verificationType,
      evidenceDocumentRefs: input.evidenceDocumentRefs ?? [],
      requestedBy: ctx.userId,
    },
    db,
  );

  // (4) BUSINESS (Doc-4G §G4.1 stage 8) — an OPEN case already exists (the SD function inserted nothing).
  //     NO audit on this path (Invariant 2: no audit row without a real create).
  if (!write.created) {
    return {
      ok: false,
      error: {
        errorClass: "BUSINESS",
        errorCode: VERIFICATION_OPEN_CASE_EXISTS_CODE,
        message: "An open verification case already exists for this subject and verification type.",
      },
    };
  }

  // (5) AUDIT — atomic with the write (SAME tx `db`), via the M0 facade ONLY (Doc-4B §A10/§17.1).
  //     Canonical ENUMERATED action `verification_requested`, User-attributed (`requested_by`). If this
  //     throws, the whole tx (incl. the SD-function insert) rolls back (Invariant 1).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: VERIFICATION_RECORD_ENTITY_TYPE,
      entityId: write.id,
      action: VerificationAuditAction.REQUESTED,
      oldValue: null,
      newValue: {
        subject_id: input.subjectId,
        subject_type: input.subjectType,
        verification_type: input.verificationType,
        state: "requested",
        evidence_document_refs: input.evidenceDocumentRefs ?? [],
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { verificationRecordId: write.id, state: "requested" } };
}
