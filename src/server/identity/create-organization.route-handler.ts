// App-layer COMPOSITION for `identity.create_organization.v1` (W2-IDN-6.2; Doc-5C §4.1 row 5 —
// `POST /identity/organizations` · `201` + `Location`; User, BOOTSTRAP — no active-org context,
// Doc-5C §2.2 row 5).
//
// Composition (the D7 audited-write shape + the §B.6 replay wrap with the CREATE CLAIM — the
// RV-0153 F2 pattern; a create has no CAS/machine leg, so the pre-execution claim is the single-
// execution guard):
//   1. Resolve session → `401` (DC-4 pre-contract boundary).
//   2. SYNTAX FIRST (Doc-4A §11.2 category 1 — the exported validator; a syntactically invalid
//      request is `400` before any context work), then the mandatory Idempotency-Key leg
//      (Doc-5C §4.3) riding the same category-1 position.
//   3. `ensureProvisioned(session)` + `resolveSelfUser` (the acting subject; fail-closed collapse).
//   4. ONE composition-owned transaction realizing the FROZEN Doc-6C §6.2a/§2.1 BOOTSTRAP context
//      (the WP-1.3 provisioning mechanism): `app.user_id` = the caller and
//      `app.is_platform_staff = 'true'` TRANSACTION-LOCAL — required because the NEW org row cannot
//      satisfy any tenant `WITH CHECK` before it exists; a MECHANISM, not attribution (the audit
//      row stays USER-attributed). INSIDE it: §B.6 replay lookup → the §14.3 PRE-EXECUTION CLAIM
//      (a lost claim returns the concurrent winner's stored payload WITHOUT executing) → the M1
//      command (validate → guard → human_ref → org + founding Owner membership → audit, atomic) →
//      wire mapping → §B.6 persist of a SUCCESSFUL response / claim release on an error outcome
//      (same tx — the §14.3 joint rule holds by construction, under all timing conditions).
//
// Dedup scope: (contract, actor, org = null, key) — bootstrap carries NO org context (the
// set_user_account_status org-less-scope precedent). Window POLICY:
// `identity.command_dedup_window` (unseeded until W2-IDN-7 — real read, never a literal).
// Zero §8 events ([DC-1]).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser } from "@/server/context";
import { allocateHumanReference, appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  createOrganization,
  mapCreateOrganization,
  orgInvalidInput,
  orgNotFoundCollapse,
  validateCreateOrganizationInput,
  type CreateOrganizationDeferredFields,
  type CreateOrganizationInput,
  type CreateOrganizationResult,
} from "@/modules/identity/contracts";
import { prisma } from "@/shared/db";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  claimStoredReplay,
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  releaseStoredClaim,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

const CONTRACT_ID = "identity.create_organization.v1" as const;

/** Dependencies for the create-organization composition (defaults bind production wiring). */
export interface CreateOrganizationHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey: WireIdempotencyKey;
  /** Deferred-field presence flags from the wire body (fail-closed in the command — see the §C5
   *  `org_type`/`address`/`contact_info` carry). */
  deferredFields?: CreateOrganizationDeferredFields;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/organizations`. Returns `201` + `Location` (§5.6 envelope) ·
 * `401` auth-boundary · `400`/`409` (§C5 register) · the §9.3 stored replay on a within-window
 * same-key re-submission.
 */
export async function handleCreateOrganization(
  input: CreateOrganizationInput,
  deps: CreateOrganizationHandlerDeps,
): Promise<WireResponse<CreateOrganizationResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (Doc-4A §11.2 fixed order — the command re-runs the same exported validator;
  // single source, no re-derivation), then the §B.6 mandatory-key leg on the same category-1 slot.
  const syntaxFailure = validateCreateOrganizationInput(input);
  if (syntaxFailure !== null) {
    return orgInvalidInput(syntaxFailure);
  }
  if (deps.idempotencyKey === null) {
    return orgInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const self = await resolveSelfUser(session);
  if (self === null) {
    // No resolvable subject — fail-closed §6.6 collapse (never an existence-leaking error).
    return orgNotFoundCollapse();
  }

  return prisma.$transaction(async (tx) => {
    // ── The frozen Doc-6C §6.2a BOOTSTRAP context (see header). Transaction-local — never leaks. ──
    await tx.$executeRaw`SELECT set_config('app.user_id', ${self.userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const scope = key !== undefined ? dedupScope(CONTRACT_ID, self.userId, null, key) : undefined;

    if (scope !== undefined) {
      // §B.6 replay lookup (within-window same-key → the stored response; NO re-execution).
      const replay = await findStoredReplay<CreateOrganizationResult>(
        scope,
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }

      // Doc-4A §14.3 IN-FLIGHT protection (RV-0153 F2): CLAIM the key BEFORE the command — the
      // create has no CAS/machine leg, so the claim is the single-execution guard; a concurrent
      // same-key contender blocks on this transaction's uncommitted claim, LOSES once it commits,
      // and returns the stored winner below.
      const claim = await claimStoredReplay(scope, COMMAND_DEDUP_WINDOW_KEY, tx);
      if (claim === "lost") {
        const winner = await findStoredReplay<CreateOrganizationResult>(
          scope,
          COMMAND_DEDUP_WINDOW_KEY,
          tx,
        );
        if (winner !== null) {
          return winner; // the §9.3 stored payload — this caller's business logic never began.
        }
        // Unreachable by construction (pending rows never commit — claim/complete/release share
        // one tx). Fail CLOSED rather than risk a second execution under one key (§14.3).
        throw new Error(
          "command-dedup: claim lost but no stored record resolved (unreachable; failing closed per Doc-4A §14.3).",
        );
      }
    }

    const outcome = await createOrganization(
      input,
      {
        userId: self.userId,
        ...(deps.deferredFields !== undefined ? { deferredFields: deps.deferredFields } : {}),
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord, allocateHumanReference },
      tx,
    );
    const wire = mapCreateOrganization(outcome);

    if (scope !== undefined) {
      if (outcome.ok) {
        // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
        await persistWireReplay(scope, wire, tx);
      } else {
        // Error OUTCOME (the tx will commit): release the claim — errors are never cached and the
        // key never wedges (§9.6 retry stays live). A THROWN failure rolls the claim back.
        await releaseStoredClaim(scope, tx);
      }
    }
    return wire;
  });
}
