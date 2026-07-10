// M1 application (PRIVATE) — `identity.update_organization_profile.v1` (Doc-4C §C5 PassB:253–265;
// Doc-5C §4.1 row 6: `PATCH /identity/organizations/{id}` · 200). W2-IDN-6.2.
//
// Attribute edit only — "this contract never transitions the §5.1 machine" (§C5 AI-notes); no state
// effects. Frozen validation chain (§C5 PassB:259): SYNTAX (field types/bounds) → CONTEXT
// (active-org server-validated — upstream) → AUTHZ (org-administration authority — `[ESC-IDN-SLUG]`
// interim) → SCOPE (caller's active org owns the target) → BUSINESS (attribute edit only).
//
// AUTHZ — `[ESC-IDN-SLUG]` INTERIM (frozen §C5 PassB:255: "Doc-2 §7's minimal set names no
// `can_manage_organization`; interim Owner/Director authority"): realized EXACTLY as the D7
// buyer-profile precedent (`upsert-buyer-profile.command.ts` — the ratified interim shape): the
// caller's confirmed ACTIVE membership must be bound to the Owner or Director system bundle. A
// future Doc-2 §7 additive ratifies a dedicated slug; this is the documented interim, not an
// invented slug. NEVER mutate `verification_level` here (DC-2 — §C5 AI-notes).
//
// CONCURRENCY — the ONE §C5 contract declaring `Concurrency: optimistic` (PassB:262 "optimistic on
// `updated_at`"): the token rides the `If-Match` header (Doc-5C §4.3); a stale token is the frozen
// `identity_org_update_conflict` (CONFLICT → 409) carrying the CURRENT token (Doc-5A §9.5 → wire
// `ETag`; §9.6 re-read-retry).
//
// DEFERRED FIELDS — FAIL-CLOSED (the `approval_settings`/`ESC-IDN-PREF-KEYS` posture): `address`,
// `contact_info`, `brand_assets_ref` have NO realized Doc-2 §10.2 / Doc-6C §3.2 organizations
// column (verified against the frozen schema — adding one needs a migration, which this WP must NOT
// author). A SUPPLIED value is VALIDATION-rejected (escalate-never-widen; silently dropping a
// client's data would fabricate success). Carried in the Completion Report. Events: none ([DC-1]).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import { updateOrganizationProfileFields } from "../../infrastructure/data/organization-lifecycle.repository";
import { findActiveMembershipRoleName } from "../../infrastructure/data/buyer-profile.repository";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import { ORG_NAME_MAX_LENGTH } from "./create-organization.command";
import type {
  UpdateOrganizationProfileInput,
  UpdateOrganizationProfileOutcome,
} from "../../contracts/types";

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const FORBIDDEN_CODE = "identity_org_forbidden";
const NOT_FOUND_CODE = "identity_org_not_found";
const UPDATE_CONFLICT_CODE = "identity_org_update_conflict";

// [ESC-IDN-SLUG] INTERIM — Owner/Director authority (see header; the D7 buyer-profile precedent).
const ORG_PROFILE_ADMIN_ROLE_NAMES: ReadonlySet<string> = new Set(["Owner", "Director"]);

/** RFC-4122 UUID shape for the path `{id}` (Doc-5A §5.4 — a malformed segment is SYNTAX, cat 1). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The wire body's deferred §C5 fields (fail-closed — see header). Carried on the input seam as an
 *  opaque presence check so the reject is uniform wherever the composition maps the body. */
export interface UpdateOrganizationProfileDeferredFields {
  addressSupplied?: boolean;
  contactInfoSupplied?: boolean;
  brandAssetsRefSupplied?: boolean;
}

/** The server-resolved request context (from the composition edge — never client input). */
export interface UpdateOrganizationProfileContext {
  /** The acting `identity.users` id (Invariant #5). */
  userId: string;
  /** The SERVER-RESOLVED active org (never client input) — must own the path `{id}`. */
  activeOrgId: string;
  /** Deferred-field presence flags from the wire seam (fail-closed VALIDATION when any is true). */
  deferredFields?: UpdateOrganizationProfileDeferredFields;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface UpdateOrganizationProfileDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/**
 * Update the organization profile (Doc-4C §C5 — `name` today; deferred fields fail closed). The
 * write and its `[ESC-IDN-AUDIT]` audit row share ONE transaction (D7). MUST be invoked INSIDE
 * `withActiveOrgContext` (the RLS-scoped executor).
 */
export async function updateOrganizationProfileCommand(
  input: UpdateOrganizationProfileInput,
  ctx: UpdateOrganizationProfileContext,
  deps: UpdateOrganizationProfileDeps,
  db: DbExecutor = prisma,
): Promise<UpdateOrganizationProfileOutcome> {
  // (1) SYNTAX — path `{id}`; bounded name; the required If-Match token; deferred-field fail-close.
  if (
    typeof input.targetOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.targetOrganizationId)
  ) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "id must be a UUID.",
      },
    };
  }
  const deferred = ctx.deferredFields ?? {};
  if (deferred.addressSupplied || deferred.contactInfoSupplied || deferred.brandAssetsRefSupplied) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message:
          "address, contact_info and brand_assets_ref are not realizable yet (no frozen organizations column — deferred; see the W2-IDN-6.2 report carry). Remove them and retry.",
      },
    };
  }
  if (
    input.name !== undefined &&
    (typeof input.name !== "string" ||
      input.name.trim().length === 0 ||
      input.name.length > ORG_NAME_MAX_LENGTH)
  ) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: `name must be 1..${ORG_NAME_MAX_LENGTH} characters.`,
      },
    };
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "updated_at is required (If-Match) and must be a timestamp.",
      },
    };
  }
  if (input.name === undefined) {
    // No realizable field supplied — an empty PATCH writes nothing (Doc-4A §9.2 absence semantics
    // give it no meaning); reject rather than fabricate a token-only touch.
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "At least one updatable field (name) is required.",
      },
    };
  }

  // (2) AUTHZ — [ESC-IDN-SLUG] interim Owner/Director authority (the D7 precedent; see header),
  //     evaluated against the caller's OWN active org (the frozen §11.2 order: AUTHZ category 3
  //     precedes SCOPE category 4). The 403 discloses only the caller's own permission gap
  //     (Doc-5A §6.3 boundary — nothing about any target).
  const roleName = await findActiveMembershipRoleName(ctx.userId, ctx.activeOrgId, db);
  if (roleName === null || !ORG_PROFILE_ADMIN_ROLE_NAMES.has(roleName)) {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: FORBIDDEN_CODE,
        message: "Not permitted to update the organization profile.",
      },
    };
  }

  // (3) SCOPE — the caller's ACTIVE org must own the target (§B.4 SCOPE). A foreign `{id}` collapses
  //     to the §6.6 non-disclosure NOT_FOUND (another org's existence is never the caller's to know).
  if (input.targetOrganizationId !== ctx.activeOrgId) {
    return {
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
    };
  }

  // (4) WRITE — CAS on `updated_at` (the §C5 optimistic token). Stale → CONFLICT + current token.
  const write = await updateOrganizationProfileFields(
    {
      orgId: ctx.activeOrgId,
      actorUserId: ctx.userId,
      expectedUpdatedAt: input.updatedAt,
      patch: { name: input.name },
    },
    db,
  );
  if (write.outcome === "not_found") {
    return {
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
    };
  }
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

  // (5) AUDIT — `[ESC-IDN-AUDIT]` org-profile-change pointer (§C5 PassB:263), atomic (same tx; D7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: ORGANIZATION_ENTITY_TYPE,
      entityId: ctx.activeOrgId,
      action: OrganizationAuditAction.PROFILE_UPDATED,
      oldValue: write.oldValue,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { organizationId: ctx.activeOrgId, updatedAt: write.updatedAt },
  };
}
