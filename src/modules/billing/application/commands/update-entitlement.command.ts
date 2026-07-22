// M7 application (PRIVATE) — `billing.update_entitlement.v1` (Doc-4I §HB-1.3 / Doc-5I §4
// `POST /billing/entitlements/{entitlement_id}/update-entitlement` · 200). W3-BILL-3. Admin audited write.
//
// Mutates `type`/`default_value` only (the `slug` is the catalog IDENTITY — immutable here). Both fields
// optional (omitted = unchanged); ≥1 required (an empty update is rejected, not a no-op audit). REFERENCE
// 422 if the id does not resolve. CONCURRENCY: the frozen wire (Doc-5I §4) carries NO expected/If-Match
// token, so the declared `CONFLICT` (Doc-4I §HB-1.3 stage-6 lost-race) has no trigger and is not produced
// here — inventing an If-Match would coin an input (no token added).

import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  entitlementTypeToWire,
  loadEntitlementById,
  updateEntitlementFields,
} from "../../infrastructure/data/entitlement-catalog-write.repository";
import { ENTITLEMENT_ENTITY_TYPE, EntitlementCatalogAuditAction } from "../../domain/audit-actions";
import {
  buildCatalogAuditInput,
  catalogErr,
  isValidEntitlementType,
  pinStaffContext,
  requireStaff,
  ENTITLEMENT_WRITE_INVALID_INPUT,
  ENTITLEMENT_WRITE_REFERENCE,
  type AdminCatalogContext,
  type AdminCatalogDeps,
} from "./_catalog-write";
import type {
  EntitlementType,
  UpdateEntitlementInput,
  UpdateEntitlementOutcome,
} from "../../contracts/types";

/** SYNTAX validation — `entitlement_id` uuid; `type` (if present) ∈ enum; ≥1 field. */
export function validateUpdateEntitlementInput(input: UpdateEntitlementInput): string | null {
  if (typeof input.entitlementId !== "string" || !UUID_PATTERN.test(input.entitlementId)) {
    return "entitlement_id must be a valid UUID.";
  }
  if (input.type !== undefined && !isValidEntitlementType(input.type)) {
    return "type must be one of: boolean, numeric, enum.";
  }
  if (input.type === undefined && input.defaultValue === undefined) {
    return "at least one of type or default_value is required.";
  }
  return null;
}

/** Update an entitlement's type/default_value (Doc-4I §HB-1.3). Update + Admin audit share ONE staff-GUC tx. */
export async function updateEntitlementCommand(
  input: UpdateEntitlementInput,
  ctx: AdminCatalogContext,
  deps: AdminCatalogDeps,
  db: typeof prisma = prisma,
): Promise<UpdateEntitlementOutcome> {
  const invalid = validateUpdateEntitlementInput(input);
  if (invalid !== null) return catalogErr("VALIDATION", ENTITLEMENT_WRITE_INVALID_INPUT, invalid);

  const denied = requireStaff(ctx);
  if (denied !== null) return denied;

  return db.$transaction(async (tx) => {
    await pinStaffContext(tx, ctx.adminUserId);

    const row = await loadEntitlementById(input.entitlementId, tx);
    if (row === null) {
      return catalogErr("REFERENCE", ENTITLEMENT_WRITE_REFERENCE, "Entitlement not found.");
    }

    await updateEntitlementFields(
      {
        entitlementId: input.entitlementId,
        type: input.type,
        defaultValue: input.defaultValue,
        actorUserId: ctx.adminUserId,
      },
      tx,
    );

    const oldType = entitlementTypeToWire(row.type);
    const newType: EntitlementType = input.type ?? oldType;

    await deps.appendAuditRecord(
      buildCatalogAuditInput(ctx, {
        entityType: ENTITLEMENT_ENTITY_TYPE,
        entityId: input.entitlementId,
        action: EntitlementCatalogAuditAction.UPDATED,
        oldValue: { type: oldType },
        newValue: { type: newType },
      }),
      tx,
    );

    return {
      ok: true as const,
      result: { entitlementId: input.entitlementId, slug: row.slug, type: newType },
    };
  });
}
