// M1 application (PRIVATE) — `identity.admin_recover_ownership.v1` (Doc-4C §C5 PassB:324–336;
// Doc-5C §4.1 row 11: `POST /identity/organizations/{id}/admin_recover_ownership` · 200). W2-IDN-6.2.
//
// THE §5.5 ORPHANED-OWNERSHIP RECOVERY (Master Architecture §5.5: "If an owner account becomes
// disabled, deleted, or suspended, ownership must be reassigned via manual transfer, admin
// recovery, or a legal recovery process") — a GUARDED command under the RV-0150 T6-F1 SERIALIZATION
// CONTRACT: the recovery facts are resolved via `resolveOwnershipRecoveryFacts` (the SAME set-level
// `FOR UPDATE` lock on the org's active-Owner rows as `resolveOwnerRemovalFacts`) INSIDE THIS
// COMMAND'S OWN TRANSACTION, and the (re)assignment applies in that SAME transaction — two racing
// recoveries (or a recovery racing a transfer/deactivate) serialize on the same lock set; the loser
// re-reads committed facts and fails the "no active Owner can act" precondition cleanly.
//
// Frozen validation chain (PassB:330): SYNTAX (uuids; reason) → CONTEXT (Admin; §5.6 — no org
// context) → AUTHZ (`staff_super_admin`, DC-3) → SCOPE (org resolvable under Admin-Scope) →
// REFERENCE (`new_owner_user_id` exists; membership creatable/active) → BUSINESS (recovery only
// where no active Owner can act, §5.5; result satisfies Last Owner Protection).
//
// NOMINEE LEGS (logged judgment calls — the frozen "membership creatable/active" REFERENCE leg):
//   • nominee user missing/soft-deleted → `identity_user_not_found` (REFERENCE).
//   • nominee user NOT active (suspended) → `identity_org_recovery_invalid` (BUSINESS — an owner
//     who cannot act cannot satisfy §5.5's "result satisfies Last Owner Protection" in substance).
//   • nominee holds an ACTIVE membership → role reassigned to the Owner bundle ("active").
//   • nominee holds NO live membership → an ACTIVE Owner membership is CREATED ("creatable" — the
//     WP-1.3 founding-membership class; §5.5 "a new owner assigned … via admin recovery").
//   • nominee holds a NON-active membership (invited/pending/suspended/removed) → neither creatable
//     nor active → `identity_org_recovery_invalid` (BUSINESS, fail-closed).
// The recovery decision flows through the PURE `evaluateOwnershipSuccession` policy (its
// `resultingActiveOwnerCount` inherits the RV-0150 lock class — resolver docstring).
//
// `updated_at` is a REQUIRED request-BODY field; the recovery register authors NO CONFLICT/STATE
// code, so a stale token is the in-register VALIDATION 400 (the RV-0153 call-1 posture). "recovery
// path is for orphaned-ownership only (not a routine transfer — use `transfer_ownership`)" (§C5
// AI-notes) — enforced by the acting-owner precondition. Events: none (§8 — [DC-1]).

import { prisma } from "../../../../shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import { resolveOwnershipRecoveryFacts } from "../../infrastructure/data/membership-lifecycle.repository";
import {
  applyOwnershipRecovery,
  loadOrganizationRow,
} from "../../infrastructure/data/organization-lifecycle.repository";
import { evaluateOwnershipSuccession } from "../../domain/policies/last-owner-protection.policy";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import { SUCCESSION_REASON_MAX_LENGTH } from "./transfer-ownership.command";
import type {
  AdminRecoverOwnershipInput,
  AdminRecoverOwnershipOutcome,
} from "../../contracts/types";

/** The Doc-2 §7 platform-staff slug this contract binds (Doc-4C §C5 PassB:326 — DC-3 interim;
 *  never invented). */
export const ADMIN_RECOVER_OWNERSHIP_SLUG = "staff_super_admin" as const;

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const FORBIDDEN_CODE = "identity_org_forbidden";
const ORG_NOT_FOUND_CODE = "identity_org_not_found";
const USER_NOT_FOUND_CODE = "identity_user_not_found";
const RECOVERY_INVALID_CODE = "identity_org_recovery_invalid";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved ADMIN request context (from the composition edge — never client input). */
export interface AdminRecoverOwnershipContext {
  /** The acting platform-staff principal's `identity.users` id (audit attribution — the §5.5
   *  "approver identity" of the recovery). */
  adminUserId: string;
  /** The server-derived platform-staff basis (Doc-5C §3.2 — NEVER client-asserted). */
  isPlatformStaff: boolean;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface AdminRecoverOwnershipDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/** SYNTAX validation (Doc-4A §11.2 category 1; §C5 field constraints). EXPORTED so the composition
 *  edge honors the fixed category order for NON-staff callers too (SYNTAX 400 before the deny 403). */
export function validateAdminRecoverOwnershipInput(
  input: AdminRecoverOwnershipInput,
): string | null {
  if (
    typeof input.targetOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.targetOrganizationId)
  ) {
    return "id must be a UUID.";
  }
  if (typeof input.newOwnerUserId !== "string" || !UUID_PATTERN.test(input.newOwnerUserId)) {
    return "new_owner_user_id must be a UUID.";
  }
  if (
    typeof input.reasonCode !== "string" ||
    input.reasonCode.trim().length === 0 ||
    input.reasonCode.length > SUCCESSION_REASON_MAX_LENGTH
  ) {
    return `reason_code is required (recovery justification, 1..${SUCCESSION_REASON_MAX_LENGTH} characters).`;
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return "updated_at is required.";
  }
  return null;
}

/**
 * Recover orphaned organization ownership (Doc-4C §C5 — Admin, 21.6; Master Architecture §5.5).
 * Opens its OWN transaction (staff GUCs; the RV-0150 lock + facts + (re)assignment + audit all ride
 * it). The audit row is ADMIN-attributed and records the reason code + the approver identity (§5.5).
 */
export async function adminRecoverOwnershipCommand(
  input: AdminRecoverOwnershipInput,
  ctx: AdminRecoverOwnershipContext,
  deps: AdminRecoverOwnershipDeps,
  db: typeof prisma = prisma,
): Promise<AdminRecoverOwnershipOutcome> {
  // (1) SYNTAX.
  const invalid = validateAdminRecoverOwnershipInput(input);
  if (invalid !== null) {
    return errOut("VALIDATION", INVALID_INPUT_CODE, invalid);
  }

  // (2) CONTEXT/AUTHZ — fail-closed defense-in-depth (the 6.1 admin shape).
  if (ctx.isPlatformStaff !== true) {
    return errOut("AUTHORIZATION", FORBIDDEN_CODE, "Platform-staff authority required.");
  }

  return db.$transaction(async (tx) => {
    // Staff governance context (transaction-local GUCs). Attribution stays Admin.
    await tx.$executeRaw`SELECT set_config('app.user_id', ${ctx.adminUserId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // (3) SCOPE — resolve the live target org under Admin-Scope (absent ⇒ the frozen 404).
    const org = await loadOrganizationRow(
      input.targetOrganizationId,
      { includeSoftDeleted: false },
      tx,
    );
    if (org === null) {
      return errOut("NOT_FOUND", ORG_NOT_FOUND_CODE, "Not found.");
    }

    // (4) STALE-VIEW guard — the required body token vs the org row (the recovery register authors
    //     NO CONFLICT code ⇒ in-register VALIDATION 400, the RV-0153 call-1 posture).
    if (org.updatedAt.getTime() !== input.updatedAt.getTime()) {
      return errOut(
        "VALIDATION",
        INVALID_INPUT_CODE,
        "the organization was modified concurrently; reload and retry.",
      );
    }

    // (5) REFERENCE + BUSINESS — the §5.5 facts UNDER THE RV-0150 LOCK (see header). The resolver
    //     locks the org's active-Owner rows FOR UPDATE on THIS transaction; every check below reads
    //     facts a concurrent Owner-mutation can no longer race.
    const facts = await resolveOwnershipRecoveryFacts(
      input.targetOrganizationId,
      input.newOwnerUserId,
      tx,
    );

    // REFERENCE — `new_owner_user_id` exists (§B.9).
    if (facts.nomineeUserStatus === null) {
      return errOut("REFERENCE", USER_NOT_FOUND_CODE, "new_owner_user_id does not resolve.");
    }

    // BUSINESS — "recovery only where no active Owner can act" (§5.5): an org with an ACTING active
    // Owner uses `transfer_ownership`, never this path (orphaned-ownership only).
    if (facts.actingActiveOwnerCount > 0) {
      return errOut(
        "BUSINESS",
        RECOVERY_INVALID_CODE,
        "The organization has an active Owner who can act; recovery does not apply.",
      );
    }

    // BUSINESS — nominee eligibility (the frozen "membership creatable/active" leg — see header):
    // the nominee must be an ACTIVE user AND either hold an ACTIVE membership (reassign) or hold NO
    // live membership (create). Every other shape fails closed. The decision flows through the PURE
    // §5.5 succession policy (resulting count = the recovered Owner).
    const nomineeEligible =
      facts.nomineeUserStatus === "active" &&
      (facts.nomineeMembership === null || facts.nomineeMembership.state === "active");
    const succession = evaluateOwnershipSuccession({
      newOwnerHasActiveMembership: nomineeEligible,
      resultingActiveOwnerCount: nomineeEligible ? 1 : 0,
    });
    if (!succession.permitted) {
      return errOut(
        "BUSINESS",
        RECOVERY_INVALID_CODE,
        "new_owner_user_id cannot satisfy Last Owner Protection (the nominee must be an active user with an active or creatable membership).",
      );
    }

    // (6) WRITE — the Owner (re)assignment in this SAME locking transaction (§C5 State Effects:
    //     "membership Owner (re)assignment (§5.2); no `organizations` §5.1 transition").
    const write = await applyOwnershipRecovery(
      {
        orgId: input.targetOrganizationId,
        adminUserId: ctx.adminUserId,
        newOwnerUserId: input.newOwnerUserId,
        ownerRoleId: facts.ownerRoleId,
        existingMembershipId: facts.nomineeMembership?.membershipId ?? null,
      },
      tx,
    );

    // (7) AUDIT — the ENUMERATED §9 "ownership change/succession" action (the recovery leg),
    //     atomic (same tx; D7). §5.5: audit record + reason code + approver identity — the approver
    //     IS the acting Admin (`actor_id`), and is recorded in the payload explicitly.
    await deps.appendAuditRecord(
      {
        actorId: ctx.adminUserId,
        actorType: "admin",
        organizationId: input.targetOrganizationId,
        entityType: ORGANIZATION_ENTITY_TYPE,
        entityId: input.targetOrganizationId,
        action: OrganizationAuditAction.OWNERSHIP_RECOVERED,
        oldValue: { acting_active_owner_count: 0 },
        newValue: {
          new_owner_membership_id: write.newOwnerMembershipId,
          new_owner_user_id: input.newOwnerUserId,
          reason_code: input.reasonCode,
          approver_user_id: ctx.adminUserId,
          membership_created: facts.nomineeMembership === null,
        },
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
      },
      tx,
    );

    return {
      ok: true as const,
      result: {
        organizationId: input.targetOrganizationId,
        newOwnerMembershipId: write.newOwnerMembershipId,
      },
    };
  });
}

function errOut(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "REFERENCE" | "BUSINESS",
  errorCode: string,
  message: string,
): AdminRecoverOwnershipOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
