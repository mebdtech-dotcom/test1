// M1 application (PRIVATE) — `identity.set_organization_status.v1` (Doc-4C §C5 PassB:310–322;
// Doc-5C §4.1 row 10: `POST /identity/organizations/{id}/set_organization_status` · 200). W2-IDN-6.2.
//
// ADMIN PLATFORM GOVERNANCE (21.6): suspend/reinstate an organization — Doc-2 §5.1
// `active ⇄ suspended` via the IDN-5 org state machine (CONSUMED, never rebuilt). NO active-org
// context (Doc-4A §5.6; Doc-5C §4.5): scope derives solely from `staff_*` + declared admin scope
// (DC-3). The composition realizes the SAME two discriminated authorization legs as the 6.1
// `set_user_account_status` house shape (see `set-organization-status.route-handler.ts`, including
// its truthful deny-by-construction discipline — RV-0152 F-B1). Events: none ([DC-1]).
//
// NOT A §5.5-GUARDED COMMAND (verbatim re-read — the packet's four-name candidate list dissolves):
// the frozen §C5 BUSINESS leg is "reason recorded", NOT a Last-Owner/succession consult; org
// suspension disables the ORG, not an Owner's account (§5.5's succession trigger is "an owner
// ACCOUNT becomes disabled, deleted, or suspended") and touches no membership row. Logged judgment
// call + report boundary note. The suspended-org LIVE-PATH enforcement is the 6.6 context surface's
// obligation (RV-0150 OBS-B1) — this command realizes only the frozen transition.
//
// Frozen validation chain (PassB:316): SYNTAX (enum/reason) → CONTEXT (Admin; no org context;
// Admin-Scope §5.6) → AUTHZ (`staff_super_admin`, DC-3) → SCOPE (target resolvable under
// Admin-Scope) → STATE (Doc-2 §5.1 `active ⇄ suspended`) → BUSINESS (reason recorded).
// `updated_at` is a REQUIRED request-BODY field (§C5 declares NO `Concurrency: optimistic` — the
// RV-0153 call-1 discipline); a stale token / losing write is the register's
// `identity_org_status_conflict` (CONFLICT → 409 + `ETag`, Doc-5A §9.4/§9.5).
//
// TRANSACTION & RLS CONTEXT: opens its OWN transaction with `app.user_id` = the ADMIN principal and
// `app.is_platform_staff = 'true'` transaction-local (the 6.1 admin-command shape) — the staff leg
// admits the cross-tenant status write + the ADMIN-attributed audit row. Attribution: Admin — NEVER
// System (caller-driven write).

import { prisma } from "../../../../shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  loadOrganizationRow,
  setOrganizationStatus,
} from "../../infrastructure/data/organization-lifecycle.repository";
import { canTransitionOrganization } from "../../domain/state-machines/organization.state-machine";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import type {
  SetOrganizationStatusInput,
  SetOrganizationStatusOutcome,
} from "../../contracts/types";

/**
 * The Doc-2 §7 platform-staff slug this contract binds (Doc-4C §C5 PassB:312 — "Slug
 * `staff_super_admin` (DC-3 interim)"). A CATALOG token bound by pointer — never invented; a future
 * least-privilege slug lands via a Doc-2 §7 additive + this constant.
 */
export const SET_ORGANIZATION_STATUS_SLUG = "staff_super_admin" as const;

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const FORBIDDEN_CODE = "identity_org_forbidden";
const NOT_FOUND_CODE = "identity_org_not_found";
const STATE_INVALID_CODE = "identity_org_state_invalid";
const STATUS_CONFLICT_CODE = "identity_org_status_conflict";

/** `reason : string : required` — bounded [realization convention] (the 6.1 admin-reason precedent). */
export const ORG_ADMIN_REASON_MAX_LENGTH = 500;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The server-resolved ADMIN request context (from the composition edge — never client input). */
export interface SetOrganizationStatusContext {
  /** The acting platform-staff principal's `identity.users` id (audit attribution). */
  adminUserId: string;
  /** The server-derived platform-staff basis (Doc-5C §3.2 — NEVER client-asserted). MUST be `true`;
   *  the command fail-closes otherwise (defense-in-depth behind the composition-edge gate). */
  isPlatformStaff: boolean;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface SetOrganizationStatusDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/** SYNTAX validation (Doc-4A §11.2 category 1; §C5 field constraints). EXPORTED so the composition
 *  edge honors the fixed category order for NON-staff callers too (SYNTAX → 400 BEFORE the
 *  CONTEXT/AUTHZ deny → 403) without re-deriving; the command re-runs it (idempotent). */
export function validateSetOrganizationStatusInput(
  input: SetOrganizationStatusInput,
): string | null {
  if (
    typeof input.targetOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.targetOrganizationId)
  ) {
    return "id must be a UUID.";
  }
  if (input.targetStatus !== "suspended" && input.targetStatus !== "active") {
    return "target_status must be one of: suspended, active.";
  }
  if (
    typeof input.reason !== "string" ||
    input.reason.trim().length === 0 ||
    input.reason.length > ORG_ADMIN_REASON_MAX_LENGTH
  ) {
    return `reason is required (structured admin reason, 1..${ORG_ADMIN_REASON_MAX_LENGTH} characters).`;
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return "updated_at is required.";
  }
  return null;
}

/**
 * Suspend / reinstate an organization (Doc-4C §C5 — Admin, 21.6; Doc-2 §5.1 platform governance).
 * The status write and the Admin-attributed audit row share ONE transaction (D7).
 */
export async function setOrganizationStatusCommand(
  input: SetOrganizationStatusInput,
  ctx: SetOrganizationStatusContext,
  deps: SetOrganizationStatusDeps,
  db: typeof prisma = prisma,
): Promise<SetOrganizationStatusOutcome> {
  // (1) SYNTAX.
  const invalid = validateSetOrganizationStatusInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) CONTEXT/AUTHZ — fail-closed defense-in-depth (the 6.1 shape): only a server-derived staff
  //     principal proceeds (the composition edge already gated non-staff callers).
  if (ctx.isPlatformStaff !== true) {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: FORBIDDEN_CODE,
        message: "Platform-staff authority required.",
      },
    };
  }

  return db.$transaction(async (tx) => {
    // Staff governance context (transaction-local GUCs; see header). Attribution stays Admin.
    await tx.$executeRaw`SELECT set_config('app.user_id', ${ctx.adminUserId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // (3) SCOPE — resolve the live target under Admin-Scope (absent ⇒ the frozen 404).
    const org = await loadOrganizationRow(
      input.targetOrganizationId,
      { includeSoftDeleted: false },
      tx,
    );
    if (org === null) {
      return errOut("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
    }

    // (4) STATE — the IDN-5 org machine (CONSUMED): `active ⇄ suspended` only. An illegal edge
    //     (same-state replay, or any unlisted pair) is the frozen `identity_org_state_invalid`
    //     (STATE → 409; NO `ETag` — not a stale precondition, the RV-0152 call-13 discipline),
    //     rejected-status-unchanged (the matrix idiom).
    if (!canTransitionOrganization(org.orgStatus, input.targetStatus)) {
      return errOut(
        "STATE",
        STATE_INVALID_CODE,
        "The requested status transition is not legal from the current state.",
      );
    }

    // (5) WRITE — CAS on (source status × updated_at); a stale token or a losing concurrent write ⇒
    //     the register's CONFLICT (`identity_org_status_conflict`) carrying the CURRENT token
    //     (Doc-5A §9.4 "the losing request receives CONFLICT" → §9.5 carriage → wire `ETag`; §9.6).
    const write = await setOrganizationStatus(
      {
        orgId: input.targetOrganizationId,
        from: org.orgStatus,
        to: input.targetStatus,
        expectedUpdatedAt: input.updatedAt,
        actorUserId: ctx.adminUserId,
      },
      tx,
    );
    if (write.outcome === "conflict") {
      return {
        ok: false as const,
        error: {
          errorClass: "CONFLICT" as const,
          errorCode: STATUS_CONFLICT_CODE,
          message: "The organization was modified concurrently; reload and retry.",
          ...(write.currentUpdatedAt !== undefined
            ? { currentUpdatedAt: write.currentUpdatedAt }
            : {}),
        },
      };
    }

    // (6) AUDIT — `[ESC-IDN-AUDIT]`: the §C5-authored Domain Organization + Platform pointer
    //     (PassB:320), atomic (same tx; D7). ADMIN-attributed (never System); the structured
    //     reason recorded (BUSINESS); org anchor = the target org.
    await deps.appendAuditRecord(
      {
        actorId: ctx.adminUserId,
        actorType: "admin",
        organizationId: input.targetOrganizationId,
        entityType: ORGANIZATION_ENTITY_TYPE,
        entityId: input.targetOrganizationId,
        action:
          input.targetStatus === "suspended"
            ? OrganizationAuditAction.SUSPENDED
            : OrganizationAuditAction.REINSTATED,
        oldValue: { org_status: org.orgStatus },
        newValue: { org_status: input.targetStatus, reason: input.reason },
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
      },
      tx,
    );

    return {
      ok: true as const,
      result: {
        organizationId: input.targetOrganizationId,
        orgStatus: input.targetStatus,
        updatedAt: write.updatedAt,
      },
    };
  });
}

function errOut(
  errorClass: "NOT_FOUND" | "STATE",
  errorCode: string,
  message: string,
): SetOrganizationStatusOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
