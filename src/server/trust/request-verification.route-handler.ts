// App-layer COMPOSITION for `trust.request_verification.v1` (W3-TRUST-2; Doc-4G §G4.1 →
// `POST /trust/verifications` · `201` + `Location`). Open an organization verification case from the
// SERVER-RESOLVED active org (= the submitting org), RESTRICTED to `subject_type = organization`.
//
// This is the CROSS-MODULE WIRING EDGE (REPOSITORY_STRUCTURE §5): the M5 module imports NOTHING of M1/M2
// (One Module, One Owner). ALL cross-module wiring happens HERE:
//   • AUTHZ — `src/server/authz.authorize(...)` delegates to M1 `check_permission` (the single
//     authorization root; NO shadow check). NON-DELEGATED org-context check → NO `deps` (no M2
//     vendor-profile-state reader; this is a pure membership-slug gate). Ownership of an `organization`
//     subject is the pure server context (`subjectId === activeOrgId`, enforced in the M5 command) — no
//     ownership resolver is needed or supplied.
//   • AUDIT — the M0 `appendAuditRecord` concrete is INJECTED into the M5 command (M5 sees only the TYPE).
//
// Composition (the D7 audited-write shape; NO §B.6 store — [ESC-TRUST-POLICY]):
//   1. Resolve session → `401` (DC-4 pre-contract auth boundary) when unauthenticated.
//   2. Idempotency-Key REQUIRED (Doc-4A §14 / Doc-5G §4.6) — absent/over-bound → VALIDATION `400`. The
//      key is MANDATORY at the wire but NOT stored/replayed (the M1 `command_dedup` store is a
//      cross-module dependency the owner forbade, and no `trust` dedup table exists in Doc-6G):
//      exactly-once replay is carried `[ESC-TRUST-POLICY]`; functional de-dup is the M5 stage-8 BUSINESS
//      rule inside the SD function.
//   3. `ensureProvisioned(session)` (house standard).
//   4. `withActiveOrg(session, (tx, context) => …)` — the active org IS the submitting org (Invariant #5;
//      unresolved context → the mapper's §6.6 `404` collapse). INSIDE the one transaction: AUTHZ
//      (`can_submit_verification`) → deny ⇒ the `403` forbidden outcome; else the M5 command
//      (validate → SCOPE → SD write → business → audit, atomic) → wire map. The audit is atomic with the
//      SD-function write (same `tx` — the §14.3 joint rule holds by construction).
//
// Zero §8 events on request (VendorVerified is a decide-time concern — Doc-4G §H.6 / Doc-4L).

import { authChallengeResponse, type WireResponse } from "@/shared/http";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  CAN_SUBMIT_VERIFICATION_SLUG,
  mapRequestVerification,
  requestVerification,
  requestVerificationForbidden,
  requestVerificationInvalidInput,
  requestVerificationSyntaxOutcome,
  validateRequestVerificationInput,
  type RequestVerificationInput,
  type RequestVerificationOutcome,
  type RequestVerificationResult,
} from "@/modules/trust/contracts";
import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { authorize } from "@/server/authz";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable for tests). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the request-verification composition. All injectable (defaults bind production wiring). */
export interface RequestVerificationHandlerDeps {
  /** Resolve the authenticated subject (default: the live Supabase cookie session — see route entry). */
  resolveSession: ResolveSession;
  /** Lazy first-login provisioning (default: the concrete provisioning hook). */
  ensureProvisioned: typeof ensureProvisioned;
  /**
   * The wire `Idempotency-Key` (Doc-5G §4.6 — MANDATORY): `string` = supplied · `null` = absent/over-bound
   * (→ `400`). NOT stored/replayed ([ESC-TRUST-POLICY]); de-dup is the M5 stage-8 BUSINESS rule.
   */
  idempotencyKey: string | null;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /trust/verifications` — `trust.request_verification.v1` (Doc-4G §G4.1). Returns
 * `201` + `Location` (created) · `401` auth-boundary · `400` (validation / missing Idempotency-Key) ·
 * `403` (authz denial) · `404` (SCOPE / no active-org context) · `422` (open case exists).
 */
export async function handleRequestVerification(
  input: RequestVerificationInput,
  deps: RequestVerificationHandlerDeps,
): Promise<WireResponse<RequestVerificationResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // Mandatory-key SYNTAX leg (Doc-5G §4.6) — before any semantic processing. [ESC-TRUST-POLICY]: the key
  // is REQUIRED but NOT stored/replayed (no cross-module dedup store; the SD function's stage-8 rule dedups).
  if (deps.idempotencyKey === null) {
    return requestVerificationInvalidInput("Idempotency-Key header is required.");
  }

  await deps.ensureProvisioned(session);

  // Run AUTHZ + the M5 command INSIDE the server-validated active-org context. `tx` carries the GUCs the
  // audit `WITH CHECK` reads (and under which the SD function runs). The M0 `appendAuditRecord` concrete is
  // injected here (M5 sees only the contract TYPE).
  const ran = await withActiveOrg(
    session,
    async (tx, context): Promise<RequestVerificationOutcome> => {
      // SYNTAX (Doc-4A §11.2 stage 1) BEFORE AUTHZ (stage 3) — the house `runTenantCreate` validate-first
      // order: a double-failing (bad-body + no-slug) caller gets `400` (validation), not `403`. SINGLE
      // SOURCE — the SAME validator the M5 command re-runs; the mapper picks the right code (invalid vs
      // the WP-scope unsupported-subject).
      const badSyntax = requestVerificationSyntaxOutcome(validateRequestVerificationInput(input));
      if (badSyntax !== null) {
        return badSyntax;
      }

      // AUTHZ (Doc-4A §11.2 stage 3) — `can_submit_verification` via the M1 authorization root. NO deps
      // (non-delegated org-context check; no M2 reader). Deny ⇒ the `403` forbidden outcome (mapped below).
      const decision = await authorize(
        {
          userId: context.userId,
          activeOrgId: context.activeOrgId,
          permissionSlug: CAN_SUBMIT_VERIFICATION_SLUG,
        },
        undefined,
        tx,
      );
      if (decision.decision === "deny") {
        return requestVerificationForbidden();
      }

      return requestVerification(
        input,
        {
          userId: context.userId,
          activeOrgId: context.activeOrgId,
          ipAddress: deps.ipAddress ?? null,
          userAgent: deps.userAgent ?? null,
        },
        { appendAuditRecord },
        tx,
      );
    },
  );

  // Unresolved active-org context (no user / no active membership) → the §6.6 `404` non-disclosure collapse.
  return mapRequestVerification(ran.resolved ? ran.value : null);
}
