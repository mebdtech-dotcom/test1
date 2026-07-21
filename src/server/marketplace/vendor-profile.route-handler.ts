// App-layer COMPOSITION for the M2 vendor-profile write spine (W3-MKT-3 — REPOSITORY_STRUCTURE §5/§8:
// `src/server` wires Supabase Auth ↔ active-org context ↔ module contracts). Mirrors the D7
// `upsert-buyer-profile` composition: ONE composed CORE per operation + a thin HTTP face. This is
// where the CONTRACT CONCRETES are injected into the M2 commands (boundary-legal wiring — M2 depends
// only on the contract TYPES):
//   • M0: `appendAuditRecord` · `allocateHumanReference` · `writeOutboxEvent` · `configValueQuery`
//     (all `@/modules/core/contracts`)
//   • M1: `checkPermission` (`@/modules/identity/contracts`) — the sole authorization root (§6.1)
//
// Composition per operation (Doc-5D rows 1/3/6 via Doc-5A §5.6/§6.1/§6.2/§6.6):
//   1. Resolve the Supabase session (injectable). Unauthenticated → DC-4 auth-boundary `401`.
//   2. `ensureProvisioned(session)` — lazy first-login identity materialization.
//   3. `withActiveOrg(session, (tx, context) => <command/query>)` — the M2 work runs INSIDE the
//      server-validated active-org transaction; write + audit + outbox emit share `tx`. NO
//      client-supplied org id ever (Invariant #5).
//   4. `resolved:false` (no active-org context, fail-closed) → `null` → the `404` non-disclosure
//      collapse (Doc-5A §6.6).
//
// IDEMPOTENCY-KEY (§B.6): DEFERRED program-wide for Wave-3 writes (the M1 retro-fit precedent);
// lands with the `marketplace.command_dedup` store (W3-MKT-3b — see W3-MKT-GAP-ANALYSIS §5).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import {
  allocateHumanReference,
  appendAuditRecord,
  configValueQuery,
  writeOutboxEvent,
} from "@/modules/core/contracts";
import { checkPermission } from "@/modules/identity/contracts";
import {
  createVendorProfile,
  getOwnVendorProfile,
  mapCreateVendorProfile,
  mapGetOwnVendorProfile,
  mapUpdateVendorProfile,
  updateVendorProfile,
  type CreateVendorProfileInput,
  type CreateVendorProfileResult,
  type GetOwnVendorProfileKey,
  type OwnVendorProfileView,
  type UpdateVendorProfileInput,
  type UpdateVendorProfileResult,
} from "@/modules/marketplace/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable for tests). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the vendor-profile compositions. All injectable (defaults bind production wiring). */
export interface VendorProfileHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /marketplace/vendor_profiles` — `marketplace.create_vendor_profile.v1`.
 * `401` unauthenticated · `201` created (the route adds `Location`) · `400`/`403`/`409` per §6.2 ·
 * `404` non-disclosure when no active-org context resolves.
 */
export async function handleCreateVendorProfile(
  input: CreateVendorProfileInput,
  deps: VendorProfileHandlerDeps,
): Promise<WireResponse<CreateVendorProfileResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();
  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    createVendorProfile(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      {
        checkPermission,
        allocateHumanReference,
        appendAuditRecord,
        writeOutboxEvent,
        configValueQuery,
      },
      tx,
    ),
  );

  return mapCreateVendorProfile(ran.resolved ? ran.value : null);
}

/**
 * The HTTP face for `PATCH /marketplace/vendor_profiles/{id}` — `marketplace.update_vendor_profile.v1`.
 * `401` unauthenticated · `200` updated · `400`/`403`/`404`/`409` per §6.2 · `404` non-disclosure
 * when no active-org context resolves.
 */
export async function handleUpdateVendorProfile(
  input: UpdateVendorProfileInput,
  deps: VendorProfileHandlerDeps,
): Promise<WireResponse<UpdateVendorProfileResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();
  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    updateVendorProfile(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { checkPermission, appendAuditRecord },
      tx,
    ),
  );

  return mapUpdateVendorProfile(ran.resolved ? ran.value : null);
}

/**
 * The HTTP face for `GET /marketplace/vendor_profiles/{id}` — the CONTROLLING-ORG leg of
 * `marketplace.get_vendor_profile.v1`. `401` unauthenticated · `200` found · `400` malformed key ·
 * `404` (absent / cross-tenant / no-context — one byte-identical collapse).
 */
export async function handleGetOwnVendorProfile(
  key: GetOwnVendorProfileKey,
  deps: VendorProfileHandlerDeps,
): Promise<WireResponse<OwnVendorProfileView>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();
  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    getOwnVendorProfile(key, context.activeOrgId, tx),
  );

  return mapGetOwnVendorProfile(ran.resolved ? ran.value : null);
}
