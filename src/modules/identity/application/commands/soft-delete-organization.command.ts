// M1 application (PRIVATE) — `identity.soft_delete_organization.v1` (Doc-4C §C5 PassB:281–294;
// Doc-5C §4.1 row 8: `DELETE /identity/organizations/{id}` · 200 — the ADR-012 soft-delete method,
// Doc-5C §4.6(a)). W2-IDN-6.2.
//
// Frozen validation chain (§C5 PassB:287): SYNTAX (confirmation true; reason) → CONTEXT (active-org
// — upstream) → AUTHZ (`can_delete_organization`, Owner — via the wired `check_permission` root;
// Delegation NOT eligible) → SCOPE (caller owns target) → STATE (Doc-2 §5.1 `active|suspended →
// soft_deleted` — the IDN-5 org machine, CONSUMED, never rebuilt) → BUSINESS (cascade preconditions).
//
// NOT A §5.5-GUARDED COMMAND (verbatim re-read — the packet's four-name candidate list dissolves):
// the frozen §C5 BUSINESS leg is "cascade preconditions", NOT a Last-Owner/succession consult; the
// §5.1 cascade ITSELF soft-deletes every membership (including Owners) by frozen mandate, so the
// ≥1-active-Owner guard reads on LIVE orgs, not on the org's own termination. Concurrency vs the
// guarded commands is still safe by construction: the cascade UPDATEs the very membership rows the
// RV-0150 resolvers lock FOR UPDATE, so a soft-delete racing a transfer/recovery serializes on
// those row locks, and the org-row CAS (status × updated_at) rejects the loser (logged judgment
// call + report boundary note).
//
// CASCADE (§C5 State Effects PassB:289): IN-MODULE ONLY — "memberships → soft-deleted" (the
// cascade-marker tuple; state untouched). "Cross-module legs (BLOCKED — [DC-1]): vendor profile →
// suspended (M2); RFQs → archived (M3); quotations preserved" — NOT authored: no identity event,
// no cross-module write, no M2/M3 call (Doc-5C §7.4; the frozen out-of-wire boundary). `updated_at`
// is a REQUIRED request-BODY field (no `Concurrency: optimistic` declaration — RV-0153 call-1);
// stale/losing → the register's `identity_org_update_conflict` (CONFLICT → 409 + `ETag`).
// Events: none (§8 — [DC-1]).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  loadOrganizationRow,
  softDeleteOrganizationWithCascade,
} from "../../infrastructure/data/organization-lifecycle.repository";
import { canTransitionOrganization } from "../../domain/state-machines/organization.state-machine";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import { checkPermission } from "../queries/check-permission.query";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  SoftDeleteOrganizationInput,
  SoftDeleteOrganizationOutcome,
} from "../../contracts/types";

/** The Doc-2 §7 slug this contract binds (Doc-4C §C5 PassB:283 — "Slug `can_delete_organization`
 *  (Doc-2 §7, Owner-only)"). A CATALOG token bound by pointer — never invented. */
export const DELETE_ORGANIZATION_SLUG = "can_delete_organization" as const;

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const FORBIDDEN_CODE = "identity_org_forbidden";
const NOT_FOUND_CODE = "identity_org_not_found";
const STATE_INVALID_CODE = "identity_org_state_invalid";
const UPDATE_CONFLICT_CODE = "identity_org_update_conflict";

/** `reason : string : required` — bounded [realization convention] (the house precedent). */
export const DELETE_REASON_MAX_LENGTH = 500;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved request context (from the composition edge — never client input). */
export interface SoftDeleteOrganizationContext {
  /** The acting `identity.users` id (Invariant #5). */
  userId: string;
  /** The SERVER-RESOLVED active org — must own the path `{id}`. */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` defaults to the M1 `check_permission` root. */
export interface SoftDeleteOrganizationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

/**
 * Soft-delete the active organization (Doc-2 §5.1 `active|suspended → soft_deleted`) with the
 * in-module membership cascade. The org write, the cascade, and the audit row share ONE transaction
 * (D7). MUST be invoked INSIDE `withActiveOrgContext`.
 */
export async function softDeleteOrganizationCommand(
  input: SoftDeleteOrganizationInput,
  ctx: SoftDeleteOrganizationContext,
  deps: SoftDeleteOrganizationDeps,
  db: DbExecutor = prisma,
): Promise<SoftDeleteOrganizationOutcome> {
  // (1) SYNTAX — confirmation literally true; reason present/bounded; required body `updated_at`.
  if (
    typeof input.targetOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.targetOrganizationId)
  ) {
    return err("VALIDATION", INVALID_INPUT_CODE, "id must be a UUID.");
  }
  if (input.confirmation !== true) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      "confirmation must be explicitly true to soft-delete the organization.",
    );
  }
  if (
    typeof input.reason !== "string" ||
    input.reason.trim().length === 0 ||
    input.reason.length > DELETE_REASON_MAX_LENGTH
  ) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      `reason is required (1..${DELETE_REASON_MAX_LENGTH} characters).`,
    );
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return err("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.");
  }

  // (2) AUTHZ — `can_delete_organization` via the wired root (the frozen §11.2 order — AUTHZ
  //     category 3 precedes SCOPE category 4); membership path only (not delegable).
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    {
      userId: ctx.userId,
      organizationId: ctx.activeOrgId,
      permissionSlug: DELETE_ORGANIZATION_SLUG,
    },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to delete the organization.");
  }

  // (3) SCOPE — the caller's ACTIVE org must own the target; a foreign `{id}` collapses (§6.6).
  if (input.targetOrganizationId !== ctx.activeOrgId) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (4) STATE — the IDN-5 org machine (CONSUMED): `active|suspended → soft_deleted` only. An
  //     illegal edge is the frozen `identity_org_state_invalid` (STATE → 409; NO `ETag` — a
  //     machine-legality rejection is not a stale precondition, the RV-0152 call-13 discipline),
  //     rejected-status-unchanged (the matrix idiom).
  const org = await loadOrganizationRow(ctx.activeOrgId, { includeSoftDeleted: false }, db);
  if (org === null) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }
  if (!canTransitionOrganization(org.orgStatus, "soft_deleted")) {
    return err(
      "STATE",
      STATE_INVALID_CODE,
      "The organization state does not permit soft-deletion.",
    );
  }

  // (5) WRITE — CAS on (source status × updated_at) + the IN-MODULE membership cascade (marker
  //     tuple; cross-module legs [DC-1]-blocked — nothing authored). Stale token / losing write ⇒
  //     CONFLICT carrying the current token (Doc-5A §9.4/§9.5 → wire `ETag`; §9.6 re-read-retry).
  const write = await softDeleteOrganizationWithCascade(
    {
      orgId: ctx.activeOrgId,
      actorUserId: ctx.userId,
      from: org.orgStatus,
      expectedUpdatedAt: input.updatedAt,
      reason: input.reason,
    },
    db,
  );
  if (write.outcome === "conflict") {
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: UPDATE_CONFLICT_CODE,
        message: "The organization was modified concurrently; reload and retry.",
        ...(write.currentUpdatedAt !== undefined
          ? { currentUpdatedAt: write.currentUpdatedAt }
          : {}),
      },
    };
  }

  // (6) AUDIT — the ENUMERATED §9 "soft delete/restore" action (the soft-delete leg), ONE org-level
  //     record, atomic (same tx; D7). Mutation-Scope `identity.organizations` + in-module
  //     `identity.memberships` — the cascade is disclosed as a COUNT (ids/values only, Doc-6A §12;
  //     the cascade rows are marker-identified in the schema itself). The membership rows take no
  //     per-row audit: the cascade is the org action's own State Effect, not a §5.2 transition
  //     (Doc-2 §5.2 defines no soft-deleted membership state — logged judgment call).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: ORGANIZATION_ENTITY_TYPE,
      entityId: ctx.activeOrgId,
      action: OrganizationAuditAction.SOFT_DELETED,
      oldValue: { org_status: org.orgStatus },
      newValue: {
        org_status: "soft_deleted",
        reason: input.reason,
        cascaded_membership_count: write.cascadedMembershipCount,
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { organizationId: ctx.activeOrgId, orgStatus: "soft_deleted" },
  };
}

function err(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "STATE",
  errorCode: string,
  message: string,
): SoftDeleteOrganizationOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
