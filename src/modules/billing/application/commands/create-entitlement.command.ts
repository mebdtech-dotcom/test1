// M7 application (PRIVATE) — `billing.create_entitlement.v1` (Doc-4I §HB-1.3 / Doc-5I §4
// `POST /billing/entitlements` · 201 + Location). W3-BILL-3. Admin audited write; NO org; NO §8 event.
//
// Validation (Doc-4I §HB-1.3): SYNTAX (slug lower_snake_case; type enum) → AUTHZ (staff) → BUSINESS
// (slug UNIQUE — duplicate → BUSINESS 422, NOT 409). The unique constraint IS the check: a P2002 propagates
// OUT of the tx (clean rollback) and is caught here → BUSINESS (no pre-check race window). Insert + audit
// share ONE staff-GUC transaction (D7).

import { prisma } from "../../../../shared/db";
import {
  insertEntitlement,
  isUniqueViolation,
} from "../../infrastructure/data/entitlement-catalog-write.repository";
import { ENTITLEMENT_ENTITY_TYPE, EntitlementCatalogAuditAction } from "../../domain/audit-actions";
import {
  buildCatalogAuditInput,
  catalogErr,
  isValidEntitlementType,
  pinStaffContext,
  requireStaff,
  validateEntitlementSlug,
  ENTITLEMENT_WRITE_INVALID_INPUT,
  ENTITLEMENT_WRITE_SLUG_CONFLICT,
  type AdminCatalogContext,
  type AdminCatalogDeps,
} from "./_catalog-write";
import type { CreateEntitlementInput, CreateEntitlementOutcome } from "../../contracts/types";

/** SYNTAX validation (Doc-4A §11.2 category 1). Exported so the composition edge runs it FIRST. */
export function validateCreateEntitlementInput(input: CreateEntitlementInput): string | null {
  const slugFail = validateEntitlementSlug(input.slug);
  if (slugFail !== null) return slugFail;
  if (!isValidEntitlementType(input.type)) return "type must be one of: boolean, numeric, enum.";
  return null;
}

/** Define an entitlement (Doc-4I §HB-1.3). Insert + Admin audit share ONE staff-GUC tx (D7). */
export async function createEntitlementCommand(
  input: CreateEntitlementInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<CreateEntitlementOutcome> {
  const invalid = validateCreateEntitlementInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", ENTITLEMENT_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  try {
    return await db.$transaction(async (tx) => {
      await pinStaffContext(tx, ctx.adminUserId);

      const { entitlementId } = await insertEntitlement(
        {
          slug: input.slug,
          type: input.type,
          defaultValue: input.defaultValue,
          actorUserId: ctx.adminUserId,
        },
        tx,
      );

      await deps.appendAuditRecord(
        buildCatalogAuditInput(ctx, {
          entityType: ENTITLEMENT_ENTITY_TYPE,
          entityId: entitlementId,
          action: EntitlementCatalogAuditAction.CREATED,
          oldValue: null,
          newValue: { slug: input.slug, type: input.type },
        }),
        tx,
      );

      return {
        ok: true as const,
        result: { entitlementId, slug: input.slug, type: input.type },
      };
    });
  } catch (e) {
    // BUSINESS — duplicate `slug` (the `entitlements_slug_uq` constraint; §HB-1.3 stage-8). The P2002 threw
    // out of the tx, so it rolled back cleanly (no partial write, no audit).
    if (isUniqueViolation(e)) {
      return catalogErr(
        "BUSINESS",
        ENTITLEMENT_WRITE_SLUG_CONFLICT,
        "An entitlement with this slug already exists.",
      );
    }
    throw e;
  }
}
