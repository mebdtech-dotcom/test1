// M2 application (PRIVATE) — `marketplace.update_vendor_profile.v1` (Doc-4D PassB §D4; Doc-5D Pass-1
// row 3 / Pass-2 §4). ORCHESTRATION ONLY: validate → authorize (M1 `check_permission`, consumed) →
// partial write with optimistic concurrency (repository) → append audit — one transaction (the D7
// canonical audited-write pattern).
//
// NO EVENT (Doc-4D §D4 `update_vendor_profile` Events row: "none — a capability/geography change
// triggers an internal `vendor_matching_attributes` rebuild (Part E); not a domain event"). The
// rebuild consumer is W3-MKT-11; nothing is emitted here (coining a name would violate §16.4).
//
// DELEGATION (Doc-4D §D4: "Delegation eligible — §6B"): resolved EXCLUSIVELY through M1
// `check_permission` (Doc-4A §6B/§9.7 — M2 performs no grant inspection). This slice authorizes the
// CONTROLLING-ORG leg (org-level `check_permission` allow + the repository's controlling-org row
// filter). The representative-org (delegated) leg requires the §6B resource-scoped evaluation, which
// `check_permission` fails closed on in this wave (RV-0148 disposition) — the delegated path is
// therefore deferred WITH the platform's §6B evaluator, not re-derived locally (disclosed:
// W3-MKT-GAP-ANALYSIS §5).
//
// IDEMPOTENCY: §B.6 replay store deferred (W3-MKT-3b — the program-wide Wave-3 deferral); optimistic
// concurrency (`updated_at` / `If-Match`) is realized NOW (Doc-5D §4.5).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import type { CheckPermission } from "@/modules/identity/contracts";
import { updateVendorProfileById } from "../../infrastructure/data/vendor-profile-write.repository";
import { VENDOR_PROFILE_ENTITY_TYPE, VendorProfileAuditAction } from "../../domain/audit-actions";
import type { UpdateVendorProfileInput, UpdateVendorProfileOutcome } from "../../contracts/types";

/** Server-resolved request context (never client input; Invariant #5). */
export interface UpdateVendorProfileContext {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Injected contract services (TYPES only — concretes bound at the `src/server` composition edge). */
export interface UpdateVendorProfileDeps {
  /** M1 `identity.check_permission.v1` — the SOLE authorization root (Doc-4A §6.1). */
  checkPermission: CheckPermission;
  /** M0 `core.append_audit_record.v1` — the ONLY audit-write surface. */
  appendAuditRecord: AppendAuditRecord;
}

// Doc-4D §D4 frozen error register — bound by pointer, never coined.
const INVALID_INPUT_CODE = "marketplace_vendor_invalid_input";
const FORBIDDEN_CODE = "marketplace_vendor_forbidden";
const NOT_FOUND_CODE = "marketplace_vendor_not_found";
const UPDATE_CONFLICT_CODE = "marketplace_vendor_update_conflict";

const CAN_MANAGE_VENDOR_PROFILE_SLUG = "can_manage_vendor_profile";
const NAME_MAX_LENGTH = 200;

/** SYNTAX validation (Doc-4D §B.4 — types; `updated_at` required as the concurrency token). */
function validateInput(input: UpdateVendorProfileInput): string | null {
  if (typeof input.vendorProfileId !== "string" || !UUID_PATTERN.test(input.vendorProfileId)) {
    return "vendor_profile_id must be a UUID.";
  }
  if (
    !(input.expectedUpdatedAt instanceof Date) ||
    Number.isNaN(input.expectedUpdatedAt.getTime())
  ) {
    return "updated_at (concurrency token) is required.";
  }
  if (input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim().length === 0)
      return "name must be a non-empty string.";
    if (input.name.length > NAME_MAX_LENGTH)
      return `name must be at most ${NAME_MAX_LENGTH} characters.`;
  }
  if (input.capabilityFlags !== undefined) {
    if (typeof input.capabilityFlags !== "object" || input.capabilityFlags === null) {
      return "capability_flags must be an object.";
    }
    for (const value of Object.values(input.capabilityFlags)) {
      if (value !== undefined && typeof value !== "boolean")
        return "capability_flags values must be booleans.";
    }
  }
  if (input.geography !== undefined) {
    if (typeof input.geography !== "object" || input.geography === null) {
      return "geography must be an object.";
    }
    for (const value of Object.values(input.geography)) {
      if (value !== undefined && value !== null && typeof value !== "string") {
        return "geography fields must be strings or null.";
      }
    }
  }
  if (
    input.vendorTypePreset !== undefined &&
    input.vendorTypePreset !== null &&
    typeof input.vendorTypePreset !== "string"
  ) {
    return "vendor_type_preset must be a string.";
  }
  return null;
}

/**
 * Partial-update the active org's vendor profile (attribute edit — no §5.3 transition, no event),
 * appending the canonical `vendor_profile_updated` audit atomically with the write.
 */
export async function updateVendorProfileCommand(
  input: UpdateVendorProfileInput,
  ctx: UpdateVendorProfileContext,
  deps: UpdateVendorProfileDeps,
  db: DbExecutor = prisma,
): Promise<UpdateVendorProfileOutcome> {
  // (1) SYNTAX.
  const invalid = validateInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) AUTHZ — M1 `check_permission` (org-level; controlling-org resource binding is enforced by
  //     the repository's explicit org filter + RLS on the same executor).
  const decision = await deps.checkPermission(
    {
      userId: ctx.userId,
      organizationId: ctx.activeOrgId,
      permissionSlug: CAN_MANAGE_VENDOR_PROFILE_SLUG,
    },
    undefined,
    db,
  );
  if (decision.decision !== "allow") {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: FORBIDDEN_CODE,
        message: "Not permitted to manage the vendor profile.",
      },
    };
  }

  // (3) WRITE — controlling-org scoped; cross-tenant/absent collapse to NOT_FOUND (§3.6/R9);
  //     stale `updated_at` → CONFLICT (Doc-5D §4.5).
  const write = await updateVendorProfileById(
    input.vendorProfileId,
    ctx.activeOrgId,
    ctx.userId,
    {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.capabilityFlags !== undefined ? { capabilityFlags: input.capabilityFlags } : {}),
      ...(input.geography !== undefined ? { geography: input.geography } : {}),
      ...(input.vendorTypePreset !== undefined ? { vendorTypePreset: input.vendorTypePreset } : {}),
      expectedUpdatedAt: input.expectedUpdatedAt,
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
        message: "The vendor profile was modified concurrently; reload and retry.",
      },
    };
  }

  // (4) AUDIT — atomic with the write (SAME tx). Canonical action `vendor_profile_updated`
  //     (Doc-2 §9 Vendor-profile "capability/override change" — bound by pointer). Throw ⇒ rollback.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: VENDOR_PROFILE_ENTITY_TYPE,
      entityId: write.id,
      action: VendorProfileAuditAction.UPDATED,
      oldValue: write.oldValue,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { vendorProfileId: write.id, updatedAt: write.updatedAt } };
}
