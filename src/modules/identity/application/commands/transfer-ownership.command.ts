// M1 application (PRIVATE) — `identity.transfer_ownership.v1` (Doc-4C §C5 PassB:267–279;
// Doc-5C §4.1 row 7: `POST /identity/organizations/{id}/transfer_ownership` · 200). W2-IDN-6.2.
//
// THE §5.5 SUCCESSION COMMAND (Master Architecture §5.5; Doc-2 §5.1 guards) — a GUARDED command
// under the RV-0150 T6-F1 SERIALIZATION CONTRACT: the §5.5 facts are resolved via
// `resolveOwnerRemovalFacts` (which takes the SET-LEVEL `FOR UPDATE` lock on the org's active-Owner
// membership rows) INSIDE THIS COMMAND'S OWN TRANSACTION (the composition's `withActiveOrg` tx,
// passed straight through as `db`), and the guarded writes apply in that SAME transaction — a
// concurrent Owner-disabling mutation (deactivate/remove/suspend/another transfer/recovery)
// serializes on the same lock set and re-reads committed facts; a check-then-act can never race the
// org to ownerless (the `deactivate-own-account` house precedent).
//
// Frozen validation chain (§C5 PassB:273): SYNTAX (uuids; reason present) → CONTEXT (active-org —
// upstream) → AUTHZ (`can_transfer_ownership`, Owner — via the wired `check_permission` root;
// Delegation NOT eligible: ownership-class actions are never delegable, Doc-2 §5.10 — the granting
// path must be `membership`) → SCOPE (org owns both memberships) → REFERENCE (`new_owner_user_id`
// has active membership) → BUSINESS (Last Owner Protection — org retains ≥1 active Owner;
// succession runs before any Owner removal, §5.5 — decided by the PURE
// `evaluateOwnershipSuccession` policy over the locked facts).
//
// STATE EFFECTS (§C5 PassB:275): "no `organizations` §5.1 transition; reassigns the Owner role on
// `memberships` (§5.2 context) in-transaction." Realized as: nominee's membership → the seeded
// Owner system bundle; the acting membership — when itself Owner-bound — takes the nominee's former
// role (the Owner role MOVES — the least-coining "reassigns" reading; logged judgment call); the
// ORG ROW's concurrency token is CAS-advanced (ownership is an org-aggregate fact; the frozen
// response's `updated_at : always` is this token and the CAS realizes the register's
// `identity_org_update_conflict` losing-write leg). `updated_at` is a REQUIRED request-BODY field
// (§C5 declares NO `Concurrency: optimistic` — the RV-0153 call-1 discipline; no If-Match here).
// Events: none (§8 — [DC-1]). Succession-reminder cadence (`identity.ownership_succession_
// reminder_cadence`) is a System-timer concern with NO §C5 wire leg — not realized here.

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findOwnerSystemBundleRole,
  resolveOwnerRemovalFacts,
} from "../../infrastructure/data/membership-lifecycle.repository";
import {
  applyOwnershipTransfer,
  findLiveActiveMembershipById,
  loadOrganizationRow,
} from "../../infrastructure/data/organization-lifecycle.repository";
import { findActiveMembership } from "../../infrastructure/data/authz.repository";
import { evaluateOwnershipSuccession } from "../../domain/policies/last-owner-protection.policy";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import { checkPermission } from "../queries/check-permission.query";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  TransferOwnershipInput,
  TransferOwnershipOutcome,
} from "../../contracts/types";

/** The Doc-2 §7 slug this contract binds (Doc-4C §C5 PassB:269 — "Slug `can_transfer_ownership`
 *  (Doc-2 §7, Owner-only)"). A CATALOG token bound by pointer — never invented. */
export const TRANSFER_OWNERSHIP_SLUG = "can_transfer_ownership" as const;

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const FORBIDDEN_CODE = "identity_org_forbidden";
const NOT_FOUND_CODE = "identity_org_not_found";
const MEMBERSHIP_NOT_FOUND_CODE = "identity_membership_not_found";
const LAST_OWNER_BLOCK_CODE = "identity_org_last_owner_block";
const UPDATE_CONFLICT_CODE = "identity_org_update_conflict";

/** `reason_code : string : required : structured succession reason (Architecture §5.5)` — bounded
 *  [realization convention] (the `ADMIN_REASON_MAX_LENGTH` precedent). */
export const SUCCESSION_REASON_MAX_LENGTH = 500;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved request context (from the composition edge — never client input). */
export interface TransferOwnershipContext {
  /** The acting `identity.users` id (the transferring Owner — Invariant #5). */
  userId: string;
  /** The SERVER-RESOLVED active org — must own the path `{id}`. */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is
 *  the M1 `check_permission` root itself (same-module application query — never a shadow check). */
export interface TransferOwnershipDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

/**
 * Transfer organization ownership (Doc-4C §C5 / Master Architecture §5.5). MUST be invoked INSIDE
 * `withActiveOrgContext` — `db` is the command's OWN transaction, and the RV-0150 resolver locks +
 * guarded writes all ride it (facts and writes are never split across transactions).
 */
export async function transferOwnershipCommand(
  input: TransferOwnershipInput,
  ctx: TransferOwnershipContext,
  deps: TransferOwnershipDeps,
  db: DbExecutor = prisma,
): Promise<TransferOwnershipOutcome> {
  // (1) SYNTAX — uuids; reason present (§C5); the required body `updated_at`.
  if (
    typeof input.targetOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.targetOrganizationId)
  ) {
    return err("VALIDATION", INVALID_INPUT_CODE, "id must be a UUID.");
  }
  if (typeof input.newOwnerUserId !== "string" || !UUID_PATTERN.test(input.newOwnerUserId)) {
    return err("VALIDATION", INVALID_INPUT_CODE, "new_owner_user_id must be a UUID.");
  }
  if (
    typeof input.reasonCode !== "string" ||
    input.reasonCode.trim().length === 0 ||
    input.reasonCode.length > SUCCESSION_REASON_MAX_LENGTH
  ) {
    return err(
      "VALIDATION",
      INVALID_INPUT_CODE,
      `reason_code is required (structured succession reason, 1..${SUCCESSION_REASON_MAX_LENGTH} characters).`,
    );
  }
  if (
    input.approverMembershipId !== undefined &&
    (typeof input.approverMembershipId !== "string" ||
      !UUID_PATTERN.test(input.approverMembershipId))
  ) {
    return err("VALIDATION", INVALID_INPUT_CODE, "approver_membership_id must be a UUID.");
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return err("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.");
  }

  // (2) AUTHZ — `can_transfer_ownership` via the wired authorization root (never a shadow check;
  //     the frozen §11.2 order — AUTHZ category 3 precedes SCOPE category 4). Ownership-class
  //     actions are NEVER delegable (Doc-2 §5.10 / §C5) — only the `membership` granting path is
  //     accepted; a delegation-satisfied allow is rejected fail-closed.
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    {
      userId: ctx.userId,
      organizationId: ctx.activeOrgId,
      permissionSlug: TRANSFER_OWNERSHIP_SLUG,
    },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to transfer ownership.");
  }

  // (3) SCOPE — the caller's ACTIVE org must own the target; a foreign `{id}` collapses (§6.6).
  if (input.targetOrganizationId !== ctx.activeOrgId) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (4) Load the live org (the aggregate root; supplies the CAS base for the losing-write leg).
  const org = await loadOrganizationRow(ctx.activeOrgId, { includeSoftDeleted: false }, db);
  if (org === null) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (5) SCOPE — the ACTOR's active membership (its id keys the exclusion in the owner-facts
  //     resolver). A caller with no standing collapses fail-closed (§6.6).
  const actorPreLock = await findActiveMembership(ctx.userId, ctx.activeOrgId, db);
  if (actorPreLock === null) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }

  // (6) THE RV-0150 LOCK — `resolveOwnerRemovalFacts` takes the set-level FOR-UPDATE lock on the
  //     org's active-Owner rows ON THIS TRANSACTION. EVERY fact consumed below is (re)resolved
  //     AFTER this point: while this command blocked on a concurrent Owner-mutation's lock, any
  //     pre-lock read may have gone stale — deciding on it would reopen exactly the check-then-act
  //     race the contract closes (e.g. a departing nominee: its membership row is NOT in the
  //     locked set, but the DEPARTURE command takes this same lock before writing, so a post-lock
  //     re-read here is serialized with it). Post-lock facts + same-tx writes = the contract.
  const ownerRole = await findOwnerSystemBundleRole(db);
  const facts = await resolveOwnerRemovalFacts(ctx.activeOrgId, actorPreLock.membershipId, db);

  // SCOPE/REFERENCE (post-lock) — org owns both memberships (§B.4): the actor's (re-read; a
  // concurrently-disabled actor fails closed) and the nominee's (`new_owner_user_id` must hold an
  // ACTIVE membership — REFERENCE, §B.9); the optional approver resolves inside the org (§5.5).
  const actorMembership = await findActiveMembership(ctx.userId, ctx.activeOrgId, db);
  if (actorMembership === null) {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }
  const nomineeMembership = await findActiveMembership(input.newOwnerUserId, ctx.activeOrgId, db);
  if (nomineeMembership === null) {
    return err(
      "REFERENCE",
      MEMBERSHIP_NOT_FOUND_CODE,
      "new_owner_user_id does not hold an active membership in this organization.",
    );
  }
  let approverMembershipId: string | null = null;
  if (input.approverMembershipId !== undefined) {
    const approver = await findLiveActiveMembershipById(
      input.approverMembershipId,
      ctx.activeOrgId,
      db,
    );
    if (approver === null) {
      return err(
        "REFERENCE",
        MEMBERSHIP_NOT_FOUND_CODE,
        "approver_membership_id does not resolve to an active membership in this organization.",
      );
    }
    approverMembershipId = approver.membershipId;
  }

  // (7) BUSINESS — the §5.5 succession decision over the LOCKED facts (the PURE policy decides).
  const nomineeIsAlreadyOwner = nomineeMembership.roleId === ownerRole.id;
  // Resulting active-Owner count after the reassignment: the nominee (1) + every other active Owner
  // beyond the actor (excluding the nominee if already counted among them).
  const resultingActiveOwnerCount =
    1 + Math.max(0, facts.otherActiveOwnerCount - (nomineeIsAlreadyOwner ? 1 : 0));
  const succession = evaluateOwnershipSuccession({
    newOwnerHasActiveMembership: true, // established at (5) inside this same locking tx
    resultingActiveOwnerCount,
  });
  if (!succession.permitted) {
    return err(
      "BUSINESS",
      LAST_OWNER_BLOCK_CODE,
      "The transfer would leave the organization without an active Owner (Last Owner Protection).",
    );
  }

  // (8) WRITE — the in-transaction reassignment (see header). The org-row CAS on `updated_at`
  //     realizes the register's losing-write CONFLICT leg (Doc-5A §9.4) with the current token
  //     carried for the wire `ETag` (§9.5/§9.6).
  const write = await applyOwnershipTransfer(
    {
      orgId: ctx.activeOrgId,
      actorUserId: ctx.userId,
      actorMembershipId: actorMembership.membershipId,
      actorRoleId: actorMembership.roleId,
      nomineeMembershipId: nomineeMembership.membershipId,
      nomineeRoleId: nomineeMembership.roleId,
      ownerRoleId: ownerRole.id,
      expectedUpdatedAt: input.updatedAt,
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

  // (9) AUDIT — the ENUMERATED §9 "ownership change/succession" action, atomic (same tx; D7).
  //     §5.5: "Every recovery action requires an audit record, a reason code, and an approver
  //     identity" — reason_code + approver recorded; Mutation-Scope `identity.organizations` +
  //     `identity.memberships` (ids/values only, Doc-6A §12).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: ORGANIZATION_ENTITY_TYPE,
      entityId: ctx.activeOrgId,
      action: OrganizationAuditAction.OWNERSHIP_TRANSFERRED,
      oldValue: {
        owner_membership_id: actorMembership.membershipId,
        new_owner_prior_role_id: nomineeMembership.roleId,
      },
      newValue: {
        new_owner_membership_id: nomineeMembership.membershipId,
        new_owner_user_id: input.newOwnerUserId,
        reason_code: input.reasonCode,
        approver_membership_id: approverMembershipId,
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      organizationId: ctx.activeOrgId,
      newOwnerMembershipId: nomineeMembership.membershipId,
      updatedAt: write.updatedAt,
    },
  };
}

function err(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "REFERENCE" | "BUSINESS",
  errorCode: string,
  message: string,
): TransferOwnershipOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
