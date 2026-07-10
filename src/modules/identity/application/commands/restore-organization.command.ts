// M1 application (PRIVATE) — `identity.restore_organization.v1` (Doc-4C §C5 PassB:296–308;
// Doc-5C §4.1 row 9: `POST /identity/organizations/{id}/restore_organization` · 200). W2-IDN-6.2.
//
// DUAL-LEG actor (§C5 PassB:298): "self-restore — Membership context + `can_delete_organization`
// (Owner); admin path — `staff_super_admin` (DC-3), no org context (§5.6)". Frozen validation chain
// (PassB:302): SYNTAX (uuid) → CONTEXT (Owner context or Admin §5.6) → AUTHZ
// (`can_delete_organization` or `staff_super_admin`) → SCOPE (target resolvable) → STATE (Doc-2
// §5.1 `soft_deleted → active` — the IDN-5 machine, CONSUMED) → BUSINESS (restore-conflict rule:
// regenerate any reused slug, §5.1).
//
// SELF-RESTORE AUTHORITY (logged judgment call): the target org is `soft_deleted`, so its
// memberships are — by the frozen §5.1 cascade — soft-deleted too; the live-rows-only
// `check_permission` root can therefore NEVER affirm this leg, yet the frozen contract explicitly
// grants it to the Owner. Realized via `findRestoreEligibleMembership` (M1's OWN substrate,
// admitting ONLY rows the org-delete cascade marked) + `resolveGrantedTenantSlugs` over the bound
// role — the SAME org-anchored slug resolution the root uses (the 6.5 lifecycle in-module
// precedent), scoped to this single frozen contract; NOT a parallel authorization model.
//
// TRANSACTION & RLS CONTEXT (the frozen Doc-6C §6.2a mechanism — the `deactivate_own_account`
// precedent): a soft-deleted org has no resolvable active-org context, so the composition owns a
// transaction with `app.user_id` + `app.is_platform_staff = 'true'` TRANSACTION-LOCAL — a
// MECHANISM, not attribution (the audit row stays USER-attributed on the self leg / Admin on the
// admin leg). Cross-module reactivation of dependents is [DC-1] (Doc-5C §7.4 — NOT authored);
// restore reactivates ONLY the org + the cascade-marked in-module membership rows. `updated_at` is
// a REQUIRED request-BODY field; the restore register authors NO CONFLICT code, so a STALE token is
// the in-register VALIDATION 400 (the RV-0153 call-1 ratified posture) while a LOSING concurrent
// restore is the register's `identity_org_state_invalid` (STATE → 409 + `ETag` — the 6.5
// losing-write leg discipline). Events: none (§8 — [DC-1]).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findRestoreEligibleMembership,
  loadOrganizationRow,
  restoreOrganizationWithCascade,
} from "../../infrastructure/data/organization-lifecycle.repository";
import { resolveGrantedTenantSlugs } from "../../infrastructure/data/authz.repository";
import { canTransitionOrganization } from "../../domain/state-machines/organization.state-machine";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import {
  DELETE_ORGANIZATION_SLUG,
  DELETE_REASON_MAX_LENGTH,
} from "./soft-delete-organization.command";
import type { RestoreOrganizationInput, RestoreOrganizationOutcome } from "../../contracts/types";

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const FORBIDDEN_CODE = "identity_org_forbidden";
const NOT_FOUND_CODE = "identity_org_not_found";
const STATE_INVALID_CODE = "identity_org_state_invalid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved request context — EXACTLY ONE leg is populated by the composition edge:
 *  the self leg (`userId`) or the admin leg (`admin`). Never client input. */
export interface RestoreOrganizationContext {
  /** Self leg: the acting `identity.users` id (the Owner of the soft-deleted org). */
  userId?: string;
  /** Admin leg: the server-derived platform-staff principal (Doc-5C §3.2; DC-3 — no org context). */
  admin?: { adminUserId: string; isPlatformStaff: true };
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface RestoreOrganizationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/**
 * Restore a soft-deleted organization (Doc-2 §5.1 `soft_deleted → active`; slug restore-conflict
 * rule) + reverse the in-module membership cascade. The write and the audit share ONE transaction
 * (D7). MUST be invoked INSIDE the composition-owned Doc-6C §6.2a transaction (see header).
 */
export async function restoreOrganizationCommand(
  input: RestoreOrganizationInput,
  ctx: RestoreOrganizationContext,
  deps: RestoreOrganizationDeps,
  db: DbExecutor = prisma,
): Promise<RestoreOrganizationOutcome> {
  // (1) SYNTAX — uuid; optional bounded reason; required body `updated_at`.
  if (
    typeof input.targetOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.targetOrganizationId)
  ) {
    return err("VALIDATION", INVALID_INPUT_CODE, "id must be a UUID.");
  }
  if (
    input.reason !== undefined &&
    (typeof input.reason !== "string" || input.reason.length > DELETE_REASON_MAX_LENGTH)
  ) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      `reason must be at most ${DELETE_REASON_MAX_LENGTH} characters.`,
    );
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return err("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.");
  }

  // (2) CONTEXT — exactly one leg (composition-resolved; defense-in-depth re-check here).
  const isAdmin = ctx.admin?.isPlatformStaff === true;
  const actorUserId = isAdmin ? ctx.admin?.adminUserId : ctx.userId;
  if (actorUserId === undefined) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found."); // no resolvable context — collapse.
  }

  // (3) Resolve the target INCLUDING the soft-deleted state (the restore contract's only legal
  //     source). Absent ⇒ the register's `identity_org_not_found` (404 — under Admin-Scope on the
  //     admin leg; the self leg discloses nothing a non-member could probe, see (4)).
  const org = await loadOrganizationRow(
    input.targetOrganizationId,
    { includeSoftDeleted: true },
    db,
  );
  if (org === null) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (4) AUTHZ — per leg (§C5 PassB:298).
  if (!isAdmin) {
    // Self leg: the caller must hold a restore-eligible membership (active-state; live OR
    // cascade-marked — see header) whose role grants `can_delete_organization` in THIS org.
    // A non-member (no eligible membership) collapses to 404 BEFORE any org fact is disclosed
    // (§7.5 — the org's existence/state is not a non-member's to know).
    const membership = await findRestoreEligibleMembership(actorUserId, org.organizationId, db);
    if (membership === null) {
      return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
    }
    const slugs = await resolveGrantedTenantSlugs(membership.roleId, org.organizationId, db);
    if (!slugs.has(DELETE_ORGANIZATION_SLUG)) {
      // Membership established (the caller's own org) — the permission gap is theirs to know (403).
      return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to restore the organization.");
    }
  }
  // Admin leg: the platform-staff basis was server-derived at the composition edge (DC-3
  // fail-closed resolver); the command trusts ONLY `ctx.admin.isPlatformStaff === true` (checked
  // at (2)) — the same defense-in-depth shape as `set_user_account_status`.

  // (5) STATE — the IDN-5 org machine (CONSUMED): `soft_deleted → active` is the only legal restore
  //     edge; anything else is the frozen `identity_org_state_invalid` (STATE → 409, no `ETag`),
  //     rejected-status-unchanged (the matrix idiom).
  if (!canTransitionOrganization(org.orgStatus, "active") || org.orgStatus !== "soft_deleted") {
    return err("STATE", STATE_INVALID_CODE, "The organization is not soft-deleted.");
  }

  // (6) STALE-VIEW guard — the required body token vs the row (the register authors NO CONFLICT
  //     code ⇒ in-register VALIDATION 400, the RV-0153 call-1 ratified posture).
  if (org.updatedAt.getTime() !== input.updatedAt.getTime()) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      "the organization was modified concurrently; reload and retry.",
    );
  }

  // (7) WRITE — `soft_deleted → active` + slug restore-conflict regeneration + the marker-scoped
  //     membership un-cascade, CAS-guarded. A LOSING concurrent restore ⇒ STATE 409 carrying the
  //     current token (the 6.5 losing-write leg — wire `ETag`, §9.6 re-read-retry).
  const write = await restoreOrganizationWithCascade(
    { orgId: org.organizationId, actorUserId, expectedUpdatedAt: input.updatedAt },
    db,
  );
  if (write.outcome === "lost_race") {
    return {
      ok: false,
      error: {
        errorClass: "STATE",
        errorCode: STATE_INVALID_CODE,
        message: "The organization was already transitioned; reload and retry.",
        ...(write.currentUpdatedAt !== undefined
          ? { currentUpdatedAt: write.currentUpdatedAt }
          : {}),
      },
    };
  }

  // (8) AUDIT — the ENUMERATED §9 "soft delete/restore" action (the restore leg), atomic (same tx;
  //     D7). Attribution per leg: User (self) or Admin (§C5 PassB:306 "attribution standard (or
  //     system/Admin for admin path)"). The restored-membership count + slug outcome disclosed
  //     (ids/values only, Doc-6A §12).
  await deps.appendAuditRecord(
    {
      actorId: actorUserId,
      actorType: isAdmin ? "admin" : "user",
      organizationId: org.organizationId,
      entityType: ORGANIZATION_ENTITY_TYPE,
      entityId: org.organizationId,
      action: OrganizationAuditAction.RESTORED,
      oldValue: { org_status: "soft_deleted" },
      newValue: {
        org_status: "active",
        slug_regenerated: write.slugRegenerated,
        restored_membership_count: write.restoredMembershipCount,
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      organizationId: org.organizationId,
      orgStatus: "active",
      slugRegenerated: write.slugRegenerated,
    },
  };
}

function err(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "STATE",
  errorCode: string,
  message: string,
): RestoreOrganizationOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
