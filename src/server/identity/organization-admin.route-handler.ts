// App-layer COMPOSITIONS for the two §C5 ADMIN organization commands (W2-IDN-6.2; Doc-5C §4.1 —
// Admin 21.6, NO org context, §5.6):
//   `identity.set_organization_status.v1`   — `POST /identity/organizations/{id}/set_organization_status` · 200
//   `identity.admin_recover_ownership.v1`   — `POST /identity/organizations/{id}/admin_recover_ownership` · 200
//
// TWO DISCRIMINATED AUTHORIZATION LEGS (the 6.1 `set_user_account_status` house composition,
// RV-0147 B8 lineage — staff-space NEVER via org roles):
//   • AFFIRMATIVE: the server-derived platform-staff basis via the injectable
//     `resolveStaffContext` port (Doc-5C §3.2 actor-type determination). The PRODUCTION default is
//     the DC-3 fail-closed resolver (no staff roster exists in Wave 2 — no principal ever
//     resolves); tests inject a staff context to exercise the allow leg.
//   • NEGATIVE (every non-staff caller): an UNCONDITIONAL 403 DENY-BY-CONSTRUCTION — no resolution
//     result is branched on. The `authorize(...)` call below runs the caller's org context + the
//     frozen `staff_super_admin` slug through the authorization root and its decision is
//     INTENTIONALLY UNUSED (RV-0152 F-B1): the deny holds regardless of what it returns, which is
//     strictly fail-closed (an unconditional deny ≥ branching on a resolver output). The
//     staff-space firewall ("a forged `role_permissions` row grants nothing") is check_permission's
//     OWN contract-level guarantee — discriminated at the query level in its suites — not something
//     this composition re-derives or depends on. Any non-staff caller — org context or none — maps
//     to the FROZEN §C5 `identity_org_forbidden` (403). No target fact is disclosed (the target is
//     resolved only AFTER the staff gate).
//   ⚠ DC-3 WP MAINTAINER WARNING: when the real staff channel lands, replace ONLY the
//     `resolveStaffContext` production resolver. Do NOT convert the discarded `authorize(...)`
//     result into a branch — the staff basis is actor-type determination (§3.2), never an
//     org-context permission resolution; branching here would introduce FAIL-OPEN risk.
//
// §B.6 dedup (the 6.1 admin shape): replay lookup PRE-command / persist POST-command in a
// `withUserSelfContext` actor-GUC transaction, scoped to the ADMIN principal (org-less — 21.6
// carries no org context). Duplicate-safe post-commit persist: a lost cache write re-executes into
// the machine/precondition guard (set-status → same-state STATE 409; recovery → an acting Owner now
// exists → 422 recovery_invalid) — never a second side effect (the 6.1 logged-judgment-call class).
// The recovery command opens its OWN transaction (the RV-0150 lock + facts + write ride it).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import {
  resolveActiveOrg,
  resolveStaffContext,
  withUserSelfContext,
  type ResolveStaffContext,
} from "@/server/context";
import { authorize } from "@/server/authz";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  ADMIN_RECOVER_OWNERSHIP_SLUG,
  adminRecoverOwnership,
  COMMAND_DEDUP_WINDOW_KEY,
  forbiddenOrgAdmin,
  mapAdminRecoverOwnership,
  mapSetOrganizationStatus,
  orgInvalidInput,
  SET_ORGANIZATION_STATUS_SLUG,
  setOrganizationStatusService,
  validateAdminRecoverOwnershipInput,
  validateSetOrganizationStatusInput,
  type AdminRecoverOwnershipInput,
  type AdminRecoverOwnershipResult,
  type SetOrganizationStatusInput,
  type SetOrganizationStatusResult,
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

/** Dependencies for a §C5 Admin composition (defaults bind production wiring). */
export interface OrganizationAdminHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The server-side staff-principal resolution port (default: the DC-3 FAIL-CLOSED resolver). */
  resolveStaffContext?: ResolveStaffContext;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey?: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** The shared §C5 Admin composition (see header): SYNTAX first → mandatory key → provision →
 *  affirmative staff leg (dedup-wrapped command) → the unconditional non-staff deny. */
async function handleOrgAdminCommand<TResult>(
  contractId: string,
  validate: () => string | null,
  slug: string,
  run: (staff: { userId: string; isPlatformStaff: true }) => Promise<{
    ok: boolean;
    wire: WireResponse<TResult>;
  }>,
  deps: OrganizationAdminHandlerDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (Doc-4A §11.2 fixed order — category 1 decides before CONTEXT/AUTHZ): a
  // syntactically invalid request is `400` for EVERY caller, staff or not (the command re-runs the
  // same exported validator — single source, no re-derivation).
  const syntaxFailure = validate();
  if (syntaxFailure !== null) {
    return orgInvalidInput(syntaxFailure);
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — the same category-1 position.
  if (deps.idempotencyKey === null) {
    return orgInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  // ── AFFIRMATIVE leg: the server-derived platform-staff basis (never client-asserted). ──
  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  if (staff !== null) {
    // §B.6 replay lookup — PRE-command (the command owns its own staff-GUC tx); scoped to the
    // ADMIN principal (org-less — 21.6 carries no org context). Actor-GUC tx = the RLS backstop.
    if (key !== undefined) {
      const replay = await withUserSelfContext(staff.userId, (tx) =>
        findStoredReplay<TResult>(
          dedupScope(contractId, staff.userId, null, key),
          COMMAND_DEDUP_WINDOW_KEY,
          tx,
        ),
      );
      if (replay !== null) {
        return replay;
      }
    }

    const { ok, wire } = await run({ userId: staff.userId, isPlatformStaff: true });

    // §B.6 persist — SUCCESS-ONLY, post-commit (own-tx command; duplicate-safe — see header).
    if (ok && key !== undefined) {
      await withUserSelfContext(staff.userId, (tx) =>
        persistWireReplay(dedupScope(contractId, staff.userId, null, key), wire, tx),
      );
    }
    return wire;
  }

  // ── NEGATIVE leg: UNCONDITIONAL 403 deny-by-construction (RV-0152 F-B1 — see header). The
  //    `authorize(...)` decision below is INTENTIONALLY UNUSED: it exercises the authorization
  //    root for observability/consistency, but the deny does NOT depend on it — every non-staff
  //    caller falls through to the same uniform 403 whatever the resolution returns (fail-closed
  //    by construction; §7.5 — the wire never discloses why beyond the caller's own lack of
  //    authority; nothing about the target is disclosed either way).
  //    ⚠ Do NOT branch on this result (fail-open risk — see the header's DC-3 maintainer warning). ──
  const orgContext = await resolveActiveOrg(session);
  if (orgContext.resolved) {
    await authorize({
      userId: orgContext.context.userId,
      activeOrgId: orgContext.context.activeOrgId,
      permissionSlug: slug,
    });
  }
  return forbiddenOrgAdmin();
}

/**
 * The HTTP face for `POST /identity/organizations/{id}/set_organization_status`. Returns `200`
 * (§5.6 envelope) · `401` auth-boundary · `403` `identity_org_forbidden` (non-staff — the frozen
 * §C5 AUTHORIZATION leg) · `400`/`404`/`409` (§C5 register, staff path only).
 */
export async function handleSetOrganizationStatus(
  input: SetOrganizationStatusInput,
  deps: OrganizationAdminHandlerDeps,
): Promise<WireResponse<SetOrganizationStatusResult>> {
  return handleOrgAdminCommand(
    "identity.set_organization_status.v1",
    () => validateSetOrganizationStatusInput(input),
    SET_ORGANIZATION_STATUS_SLUG,
    async (staff) => {
      const outcome = await setOrganizationStatusService(
        input,
        {
          adminUserId: staff.userId,
          isPlatformStaff: staff.isPlatformStaff,
          ipAddress: deps.ipAddress ?? null,
          userAgent: deps.userAgent ?? null,
        },
        { appendAuditRecord },
      );
      return { ok: outcome.ok, wire: mapSetOrganizationStatus(outcome) };
    },
    deps,
  );
}

/**
 * The HTTP face for `POST /identity/organizations/{id}/admin_recover_ownership`. Returns `200`
 * (§5.6 envelope) · `401` auth-boundary · `403` `identity_org_forbidden` (non-staff) ·
 * `400`/`404`/`422` (§C5 register, staff path only). The command's own transaction carries the
 * RV-0150 FOR-UPDATE lock (facts + (re)assignment + audit — never split).
 */
export async function handleAdminRecoverOwnership(
  input: AdminRecoverOwnershipInput,
  deps: OrganizationAdminHandlerDeps,
): Promise<WireResponse<AdminRecoverOwnershipResult>> {
  return handleOrgAdminCommand(
    "identity.admin_recover_ownership.v1",
    () => validateAdminRecoverOwnershipInput(input),
    ADMIN_RECOVER_OWNERSHIP_SLUG,
    async (staff) => {
      const outcome = await adminRecoverOwnership(
        input,
        {
          adminUserId: staff.userId,
          isPlatformStaff: staff.isPlatformStaff,
          ipAddress: deps.ipAddress ?? null,
          userAgent: deps.userAgent ?? null,
        },
        { appendAuditRecord },
      );
      return { ok: outcome.ok, wire: mapAdminRecoverOwnership(outcome) };
    },
    deps,
  );
}
