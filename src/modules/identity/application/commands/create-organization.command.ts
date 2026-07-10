// M1 application (PRIVATE) — `identity.create_organization.v1` (Doc-4C §C5 PassB:235–251;
// Doc-5C §4.1 row 5: `POST /identity/organizations` · 201 + Location). W2-IDN-6.2.
//
// BOOTSTRAP create (Doc-5C §2.2 row 5 — "N (bootstrap)"): an authenticated, provisioned user creates
// a NEW organization and becomes its founding Owner — no prior org context exists for the new org.
// Frozen validation chain (§C5 PassB:245): SYNTAX (`name` present/bounded; enums) → CONTEXT
// (authenticated user — upstream) → BUSINESS (Solo Trader invariant — user ends with ≥1 org;
// duplicate-personal-org guard) → POLICY (per-user org-count cap IF CONFIGURED — no such POLICY key
// is registered, Doc-3 v1.9 §5 "No per-user org-count cap key … not coined here", so the frozen
// conditional resolves to ABSENT and `identity_org_quota_exceeded` is unreachable until a follow-up
// additive registers the key; report-carried).
//
// TRANSACTION & RLS CONTEXT (frozen mechanism — Doc-6C §6.2a / §2.1; the WP-1.3 provisioning
// precedent): the org INSERT cannot satisfy the tenant `WITH CHECK (org = active_org …)` — the org
// does not exist yet — so this command runs inside the COMPOSITION-OWNED transaction whose
// `app.user_id` + `app.is_platform_staff = 'true'` GUCs realize the frozen provisioning/bootstrap
// leg (transaction-local; a MECHANISM, not attribution — the audit row is attributed to the acting
// USER). Once the org id is minted, `app.active_org` is set so the founding-membership INSERT and
// the audit `WITH CHECK` are met by their PRIMARY tenant legs.
//
// ATOMIC (§C5 §B.6): the `ORG-…` human-ref allocation (M0 contract service, INJECTED by type),
// the org row, the founding Owner membership, and the audit row all share the ONE transaction —
// "human-ref allocation participates in the single transaction (no second ref on replay)".
//
// `is_personal_org` is NOT CLIENT-TRUSTED (§C5: "server-set on Solo Trader auto-create … not
// client-trusted"): a client-asserted `true` maps to the frozen duplicate-personal-org guard
// (`identity_org_personal_exists`, CONFLICT) when the caller's live personal org exists, and is
// VALIDATION-rejected otherwise — the wire NEVER mints a personal org (logged judgment call).
// Events: none (§8 — [DC-1]).

import type { AllocateHumanReference, AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findLivePersonalOrgForUser,
  insertOrganizationWithFoundingOwner,
} from "../../infrastructure/data/organization-lifecycle.repository";
import { findOwnerSystemBundleRole } from "../../infrastructure/data/membership-lifecycle.repository";
import { ORGANIZATION_ENTITY_TYPE, OrganizationAuditAction } from "../../domain/audit-actions";
import type { CreateOrganizationInput, CreateOrganizationOutcome } from "../../contracts/types";

// Doc-4C §C5 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_org_invalid_input";
const PERSONAL_EXISTS_CODE = "identity_org_personal_exists";

/** `name : string : required : … length-bounded` — bounded [realization convention] (no corpus
 *  bound / POLICY key exists; the `ADMIN_REASON_MAX_LENGTH` precedent, Doc-5C §0.4). Face-exported
 *  so compositions and tests bind the SAME value (RV-0152 NIT-B3 symmetry). */
export const ORG_NAME_MAX_LENGTH = 200;

/** Entity-type prefix for the org human_ref sequence (Doc-2 §0.1 registry; Doc-4C §C5 — `ORG-…`).
 *  Owned by Module 0 / Doc-2 §0.1; bound by pointer, never invented (the WP-1.3 constant). */
const ORG_HUMAN_REF_ENTITY_TYPE = "ORG" as const;

/** The wire body's deferred §C5 create fields — `org_type` (no Doc-2 §10.2 organizations
 *  column/enum), `address`/`contact_info` (VOs with no realized column). FAIL-CLOSED presence
 *  flags from the wire seam (the update-profile `deferredFields` shape; report-carried). */
export interface CreateOrganizationDeferredFields {
  orgTypeSupplied?: boolean;
  addressSupplied?: boolean;
  contactInfoSupplied?: boolean;
}

/** The server-resolved request context (from the composition edge — never client input). */
export interface CreateOrganizationContext {
  /** The acting (= founding-Owner) `identity.users` id — the session subject (Invariant #5). */
  userId: string;
  /** Deferred-field presence flags from the wire seam (fail-closed VALIDATION when any is true). */
  deferredFields?: CreateOrganizationDeferredFields;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract services (D7 rule 4 — by contract TYPE, never a value import). */
export interface CreateOrganizationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10). */
  appendAuditRecord: AppendAuditRecord;
  /** `core.allocate_human_reference.v1` (Doc-4B §A7) — bound into THIS transaction. */
  allocateHumanReference: AllocateHumanReference;
}

/** SYNTAX validation (Doc-4A §11.2 category 1; §C5 field constraints). EXPORTED so the composition
 *  edge honors the fixed category order (SYNTAX 400 before any context work) without re-deriving. */
export function validateCreateOrganizationInput(input: CreateOrganizationInput): string | null {
  if (
    typeof input.name !== "string" ||
    input.name.trim().length === 0 ||
    input.name.length > ORG_NAME_MAX_LENGTH
  ) {
    return `name is required (1..${ORG_NAME_MAX_LENGTH} characters).`;
  }
  if (input.isPersonalOrg !== undefined && typeof input.isPersonalOrg !== "boolean") {
    return "is_personal_org must be a boolean.";
  }
  return null;
}

/**
 * Create an organization + its founding Owner membership (Doc-4C §C5). MUST be invoked INSIDE the
 * composition-owned bootstrap transaction (see header) — the human-ref allocation, org row,
 * founding membership, and audit row are atomic on that executor (D7 rule 5).
 *
 * @param input the §C5 fields (`name`, untrusted `is_personal_org`).
 * @param ctx   the server-resolved context (`userId` = the founding Owner).
 * @param deps  the injected M0 contract services.
 * @param db    the bootstrap-context transaction executor (composition-owned).
 */
export async function createOrganizationCommand(
  input: CreateOrganizationInput,
  ctx: CreateOrganizationContext,
  deps: CreateOrganizationDeps,
  db: DbExecutor = prisma,
): Promise<CreateOrganizationOutcome> {
  // (1) SYNTAX — incl. the FAIL-CLOSED deferred fields (`org_type`/`address`/`contact_info` have
  //     NO realized organizations column — Doc-2 §10.2 / Doc-6C §3.2; realizing them needs an
  //     additive patch + migration, which this WP must NOT author. A supplied value is rejected —
  //     never silently dropped: a dropped VO would fabricate success. Report-carried).
  const invalid = validateCreateOrganizationInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }
  const deferred = ctx.deferredFields ?? {};
  if (deferred.orgTypeSupplied || deferred.addressSupplied || deferred.contactInfoSupplied) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message:
          "org_type, address and contact_info are not realizable yet (no frozen organizations column — deferred; see the W2-IDN-6.2 report carry). Remove them and retry.",
      },
    };
  }

  // (2) BUSINESS — the duplicate-personal-org guard + the not-client-trusted rule (§C5). A
  //     client-asserted `is_personal_org: true` is NEVER honored (personal orgs are minted ONLY by
  //     the Solo Trader auto-create at provisioning — Architecture §5.2): when the caller's live
  //     personal org exists the request is the frozen duplicate guard (CONFLICT); otherwise it is
  //     a VALIDATION reject (the wire cannot assert a server-set fact). Logged judgment call.
  if (input.isPersonalOrg === true) {
    const personal = await findLivePersonalOrgForUser(ctx.userId, db);
    if (personal !== null) {
      return {
        ok: false,
        error: {
          errorClass: "CONFLICT",
          errorCode: PERSONAL_EXISTS_CODE,
          message: "A personal organization already exists for this user.",
        },
      };
    }
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message:
          "is_personal_org is server-set on Solo Trader auto-create and cannot be client-asserted.",
      },
    };
  }

  // (3) POLICY — per-user org-count cap "if configured" (§C5). NO `identity.*` org-count POLICY key
  //     is registered (Doc-3 v1.9 §5 — explicitly deferred, not coined); the frozen conditional
  //     therefore resolves to ABSENT: no cap is enforced and `identity_org_quota_exceeded` is
  //     unreachable until a follow-up additive registers the key. Never a literal cap here.

  // (4) WRITE — human_ref via the M0 contract service (atomic on THIS executor; never local), then
  //     the org row + founding Owner membership in the same transaction (§C5 — "never split").
  const year = new Date().getUTCFullYear(); // server-clock UTC year (Doc-2 §0.1)
  const { humanRef } = await deps.allocateHumanReference(
    { entityType: ORG_HUMAN_REF_ENTITY_TYPE, year },
    db,
  );
  const ownerRole = await findOwnerSystemBundleRole(db); // fail-closed if the seed is corrupt.
  const created = await insertOrganizationWithFoundingOwner(
    {
      creatorUserId: ctx.userId,
      ownerRoleId: ownerRole.id,
      humanRef,
      name: input.name,
      isPersonalOrg: false, // server-set (§C5) — the wire path never mints a personal org.
    },
    db,
  );

  // (5) AUDIT — the ENUMERATED §9 Organization "create" action, atomic (same tx; D7). Attribution:
  //     the acting USER; org anchor = the NEW org (Doc-2 §9 CR2). Mutation-Scope
  //     `identity.organizations` (+ founding membership) — the founding membership is disclosed in
  //     `new_value` (ids/values only, Doc-6A §12).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: created.organizationId,
      entityType: ORGANIZATION_ENTITY_TYPE,
      entityId: created.organizationId,
      action: OrganizationAuditAction.CREATED,
      oldValue: null,
      newValue: {
        name: input.name,
        human_ref: humanRef,
        org_status: "active",
        is_personal_org: false,
        owner_membership_id: created.ownerMembershipId,
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      organizationId: created.organizationId,
      humanRef,
      orgStatus: "active",
      ownerMembershipId: created.ownerMembershipId,
    },
  };
}
