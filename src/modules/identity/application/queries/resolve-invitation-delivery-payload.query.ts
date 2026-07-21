// M1 application (PRIVATE) — `identity.resolve_invitation_delivery_payload.v1` (Doc-4C v1.0.3
// §C13 · 21.3-with-response). P1 Growth Hub M1 core slice.
//
// AUDIENCE — INTERNAL-SERVICE, M6 SOLE CALLER (binding; the frozen §C3 `get_membership` fence
// precedent): NO wire row exists or may be added (Doc-5C v1.0.1 §4 — out-of-wire set 7 → 8;
// packet §B6 "System-internal, no public REST row"); consumption is in-process/service-lane only,
// by the M6 `InvitationIssued` consumer. Never user-invocable, never public.
//
// GI-3 EXCEPTION (the ONLY one — when honored in full): this contract is the SOLE path sanctioned
// to surface `recipient_identifier` + a token-bearing URL to M6, transiently, delivery-only
// (Doc-6C v1.0.4 §5, the second sanctioned cross-tenant read path). It runs in its own
// transaction under the transaction-local staff-GUC service context (the resolve-token idiom);
// the app-layer column allow-list is the binding.
//
// P1 REALIZATION STATE (strict-conformance ruling): the P1 delivery-ref store holds ONLY the
// reference→invitation mapping — NO token material ("raw token is never stored", Doc-2 v1.0.10
// §1 / Doc-6C v1.0.4 §2, holds ABSOLUTELY in P1). The token-material + one-time nonce +
// `identity.growth_invite_delivery_url_ttl` TTL legs are DEFERRED to the ruled secure-store
// design landing with the M6 consumer (P2) — a Board-recorded carry (the `[ESC-6-API]` flag
// covers the store's PHYSICAL SHAPE only; the folded Doc-4C v1.0.3 §C13 + Doc-3 v1.14 pin the
// signed-URL semantics, which P1 does NOT fake). So AFTER the definitive checks pass, this query
// returns the TRANSIENT `identity_growth_invite_delivery_unavailable` (DEPENDENCY, retryable) —
// see the resolution tail.
//
// ERROR SPLIT (the Doc-4H F-1/F-2 seam reconciliation, §B.5 REFERENCE ≠ DEPENDENCY): unknown or
// malformed `delivery_reference_id`, or an invitation that is not live (`revoked`/`expired`) or
// not targeted → the DEFINITIVE `identity_growth_invite_delivery_not_resolvable` (REFERENCE,
// retryable:false — M6 classifies permanent failure and NEVER re-queues). The transient
// `identity_growth_invite_delivery_unavailable` (DEPENDENCY, retryable:true) marks a resolvable
// reference the service cannot currently serve.

import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../commands/_validation";
import type {
  ResolveInvitationDeliveryPayloadInput,
  ResolveInvitationDeliveryPayloadOutcome,
} from "../../contracts/types";

// Doc-4C v1.0.3 §C13 delivery register (frozen codes — bound by pointer, never coined).
const NOT_RESOLVABLE_CODE = "identity_growth_invite_delivery_not_resolvable";
const UNAVAILABLE_CODE = "identity_growth_invite_delivery_unavailable";

/** The definitive not-resolvable outcome (REFERENCE, retryable:false — M6 never re-queues). */
function notResolvable(): ResolveInvitationDeliveryPayloadOutcome {
  return {
    ok: false,
    error: {
      errorClass: "REFERENCE",
      errorCode: NOT_RESOLVABLE_CODE,
      message: "The delivery reference does not resolve to a deliverable invitation.",
    },
  };
}

/**
 * Resolve a `delivery_reference_id` (from the `InvitationIssued` event) toward the transient
 * delivery payload (Doc-4C v1.0.3 §C13). In P1 the definitive liveness checks are REAL; the
 * payload leg is the deferred P2 secure-store carry (see header).
 */
export async function resolveInvitationDeliveryPayload(
  input: ResolveInvitationDeliveryPayloadInput,
  db: typeof prisma = prisma,
): Promise<ResolveInvitationDeliveryPayloadOutcome> {
  // Malformed/non-UUID ref → the in-register DEFINITIVE not-resolvable (L2-MINOR-1 ruling): a
  // garbage reference is definitively unresolvable — M6 must never re-queue it. (Reusing the
  // create-register `invalid_input` here would need a Doc-4C seam fold that doesn't exist.)
  if (
    typeof input.deliveryReferenceId !== "string" ||
    !UUID_PATTERN.test(input.deliveryReferenceId)
  ) {
    return notResolvable();
  }

  return db.$transaction(async (tx) => {
    // Service-lane context — transaction-local ONLY (never leaks past this read tx).
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // The §10.3-class store row + the invitation's liveness columns (the allow-list: recipient
    // type/identifier + state/expires_at — nothing broader; Doc-6C v1.0.4 §5).
    const ref = await tx.invitationDeliveryRef.findUnique({
      where: { deliveryReferenceId: input.deliveryReferenceId },
      select: {
        growthInvitation: {
          select: {
            state: true,
            expiresAt: true,
            recipientType: true,
            recipientIdentifier: true,
            deletedAt: true,
          },
        },
      },
    });

    const invitation = ref?.growthInvitation ?? null;
    const live =
      invitation !== null &&
      invitation.deletedAt === null &&
      invitation.state === "issued" &&
      invitation.expiresAt.getTime() > Date.now();

    // DEFINITIVE checks: unknown ref, non-live, or not targeted → not-resolvable (never re-queue).
    if (ref === null || !live || invitation.recipientIdentifier === null) {
      return notResolvable();
    }

    // TRANSIENT (P1): the reference IS resolvable, but the token-material/nonce/TTL store is not
    // yet realized (the P2 secure-store carry with the M6 consumer; Board-recorded — see header).
    // No URL is ever minted and NO recipient facts are disclosed on this path (GI-3-conservative:
    // the full 3-field response is returned only when the WHOLE contract can be honored). M6 may
    // retry under its frozen budget (DEPENDENCY, retryable:true).
    return {
      ok: false,
      error: {
        errorClass: "DEPENDENCY" as const,
        errorCode: UNAVAILABLE_CODE,
        message: "The delivery payload service is not currently able to serve this reference.",
      },
    };
  });
}
