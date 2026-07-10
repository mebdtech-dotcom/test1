// App-layer COMPOSITION for `identity.switch_active_organization.v1` (W2-IDN-6.6; Doc-5C §6.1 row 29 —
// `POST /identity/active_context/switch_active_organization` · `200`). The active-org CONTEXT SELECTOR:
// validates the caller may adopt the body `organization_id` as active context (server-side; NEVER trusts
// the client id — Invariant #5 / Doc-5C §3.3) and echoes the validated id for the client to carry in the
// `Iv-Active-Organization` header thereafter.
//
// SIDE-EFFECT-FREE (Doc-4C §C8): no state write, no audit (PassB:539 "Audit: no"), no event ([DC-1]), and
// NO §B.6 dedup STORE — the switch is idempotent BY NATURE (PassB:538 "replay → same context, no side
// effect"), so §14.3 holds with nothing to store. The `Idempotency-Key` header is nonetheless MANDATORY
// (the contract declares `Idempotency: required`; Doc-5C §6.4 / CHK-5A-080) — enforced here as a SYNTAX
// presence check, then unused (no replay cache exists to key).
//
// Composition: session → 401 · SYNTAX (mandatory Idempotency-Key; `organization_id` uuid) → 400 · provision
// · resolveSelfUser (the principal — never a client actor) · switch command (reads only) · wire map. The
// switch's BUSINESS check ("org not suspended", §C8) is the SOLE live enforcement point of org-not-suspended
// (`organizationParticipatesInAccessFormula` over the live org row); `resolveActiveOrg` is membership-only
// (Doc-5C §3.3) and does NOT gate org_status — the open `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` (RV-0150 OBS-B1).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser } from "@/server/context";
import {
  contextInvalidInput,
  mapSwitchActiveOrganization,
  switchActiveOrganization,
  type SwitchActiveOrganizationResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface SwitchActiveOrganizationHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The parsed `Idempotency-Key` (route-extracted). `null` (absent/empty/over-bound) = the mandatory-
   *  header SYNTAX failure — the switch declares `Idempotency: required` (Doc-4C §C8 PassB:538). */
  idempotencyKey: string | null;
}

/** The RAW wire body (route-extracted, unvalidated — this composition owns SYNTAX). */
export interface SwitchActiveOrganizationWireInput {
  organizationId?: unknown;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The HTTP face for `POST /identity/active_context/switch_active_organization`. Returns `200` (§5.6
 * envelope — `{ organizationId }`) · `401` auth-boundary · `400` (missing Idempotency-Key / malformed
 * `organization_id`) · `404` collapse (not an active member / no principal) · `422` BUSINESS (member of a
 * suspended org — the frozen "org not suspended", RV-0150 OBS-B1).
 */
export async function handleSwitchActiveOrganization(
  input: SwitchActiveOrganizationWireInput,
  deps: SwitchActiveOrganizationHandlerDeps,
): Promise<WireResponse<SwitchActiveOrganizationResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX (Doc-4A §11.2 category 1) — mandatory Idempotency-Key presence, then the target uuid.
  if (deps.idempotencyKey === null) {
    return contextInvalidInput("Idempotency-Key header is required.");
  }
  if (typeof input.organizationId !== "string" || !UUID_RE.test(input.organizationId)) {
    return contextInvalidInput("organization_id must be a uuid.");
  }

  await deps.ensureProvisioned(session);

  const user = await resolveSelfUser(session);
  if (user === null) {
    // No resolvable principal ⇒ the §6.6 non-disclosure collapse (byte-identical to not-a-member).
    return mapSwitchActiveOrganization(null);
  }

  const outcome = await switchActiveOrganization(
    { organizationId: input.organizationId },
    { userId: user.userId },
  );
  return mapSwitchActiveOrganization(outcome);
}
