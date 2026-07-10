// App-layer COMPOSITIONS for the three §C5 TENANT organization commands (W2-IDN-6.2; Doc-5C §4.1):
//   `identity.update_organization_profile.v1` — `PATCH /identity/organizations/{id}` · 200
//   `identity.transfer_ownership.v1`          — `POST …/{id}/transfer_ownership` · 200
//   `identity.soft_delete_organization.v1`    — `DELETE /identity/organizations/{id}` · 200 (ADR-012)
//
// All three share ONE composition shape (the 6.5 delegation-lifecycle house shape — the commands
// own the frozen §C5 validation order + the D7 audited write):
//   session → 401 · Idempotency-Key REQUIRED (Doc-5C §4.3) → 400 · provision · `withActiveOrg`
//   (the server-resolved active org must own the path `{id}` — checked in the command; unresolved
//   context → the §6.6 404 collapse) → §B.6 replay lookup → command → wire map → §B.6 persist
//   (success-only, same tx — the §14.3 joint rule).
//
// SERIALIZATION (RV-0150 T6-F1): the `withActiveOrg` transaction IS each command's OWN transaction —
// `transfer_ownership` passes it straight to the FOR-UPDATE fact resolver and applies the guarded
// writes on it (facts and writes never split). No claim leg here: these commands are CAS/machine-
// covered (the 6.1/6.5 ratified posture — the claim is create-only, RV-0153 F2).
// Zero §8 events ([DC-1]); the soft-delete cross-module cascade stays out-of-wire (Doc-5C §7.4).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  mapSoftDeleteOrganization,
  mapTransferOwnership,
  mapUpdateOrganizationProfile,
  orgInvalidInput,
  softDeleteOrganization,
  transferOwnership,
  updateOrganizationProfile,
  type SoftDeleteOrganizationInput,
  type SoftDeleteOrganizationResult,
  type TransferOwnershipInput,
  type TransferOwnershipResult,
  type UpdateOrganizationProfileDeferredFields,
  type UpdateOrganizationProfileInput,
  type UpdateOrganizationProfileResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for a tenant organization composition (uniform across the three commands). */
export interface OrganizationTenantHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

type TenantContext = {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type TenantTx = Parameters<Parameters<typeof withActiveOrg>[1]>[0];

/** The one shared tenant composition (see header). `run` binds the contract's command + context;
 *  `mapper` fixes its wire face (`null` = the §6.6 unresolved-context collapse). */
async function handleTenantOrgCommand<TOutcome, TResult>(
  contractId: string,
  run: (ctx: TenantContext, tx: TenantTx) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  deps: OrganizationTenantHandlerDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return orgInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    if (key !== undefined) {
      const replay = await findStoredReplay<TResult>(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await run(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      tx,
    );
    const wire = mapper(outcome);

    if (isOk(outcome) && key !== undefined) {
      // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
      await persistWireReplay(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        wire,
        tx,
      );
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapper(null); // §6.6 collapse (no user / no active membership).
  }
  return ran.value;
}

/** The HTTP face for `PATCH /identity/organizations/{id}` (`200`). `deferredFields` carries the
 *  wire-body presence of the fail-closed §C5 fields (address/contact_info/brand_assets_ref). */
export async function handleUpdateOrganizationProfile(
  input: UpdateOrganizationProfileInput,
  deps: OrganizationTenantHandlerDeps & {
    deferredFields?: UpdateOrganizationProfileDeferredFields;
  },
): Promise<WireResponse<UpdateOrganizationProfileResult>> {
  return handleTenantOrgCommand(
    "identity.update_organization_profile.v1",
    (ctx, tx) =>
      updateOrganizationProfile(
        input,
        {
          ...ctx,
          ...(deps.deferredFields !== undefined ? { deferredFields: deps.deferredFields } : {}),
        },
        { appendAuditRecord },
        tx,
      ),
    mapUpdateOrganizationProfile,
    (o) => o.ok,
    deps,
  );
}

/** The HTTP face for `POST /identity/organizations/{id}/transfer_ownership` (`200`) — the
 *  §5.5-guarded succession command (RV-0150: the `withActiveOrg` tx is the lock tx). */
export async function handleTransferOwnership(
  input: TransferOwnershipInput,
  deps: OrganizationTenantHandlerDeps,
): Promise<WireResponse<TransferOwnershipResult>> {
  return handleTenantOrgCommand(
    "identity.transfer_ownership.v1",
    (ctx, tx) => transferOwnership(input, ctx, { appendAuditRecord }, tx),
    mapTransferOwnership,
    (o) => o.ok,
    deps,
  );
}

/** The HTTP face for `DELETE /identity/organizations/{id}` (`200`; ADR-012 soft-delete — the
 *  in-module cascade only, cross-module legs [DC-1]-blocked). */
export async function handleSoftDeleteOrganization(
  input: SoftDeleteOrganizationInput,
  deps: OrganizationTenantHandlerDeps,
): Promise<WireResponse<SoftDeleteOrganizationResult>> {
  return handleTenantOrgCommand(
    "identity.soft_delete_organization.v1",
    (ctx, tx) => softDeleteOrganization(input, ctx, { appendAuditRecord }, tx),
    mapSoftDeleteOrganization,
    (o) => o.ok,
    deps,
  );
}
