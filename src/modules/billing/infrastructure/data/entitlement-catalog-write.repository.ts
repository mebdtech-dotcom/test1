// M7 infrastructure (PRIVATE) — the `billing.entitlements` + `billing.plan_entitlements` catalog WRITE
// repository for the BC-BILL-1 Admin entitlement/bundle commands (Doc-4I §HB-1.2 + §HB-1.3 / Doc-6I §3.1.2/3).
// M7 mutating its OWN schema (allowed — One Module, One Owner); no module outside `billing` imports this.
//
// The entitlement `type` column is a Prisma enum whose CLIENT value for DB `'enum'` is `enum_` — writes map
// the wire type through `entitlementTypeToClient` before persisting; reads map back via `entitlementTypeToWire`.

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import {
  entitlementTypeToClient,
  entitlementTypeToWire,
  type EntitlementTypeClient,
} from "../../domain/read-models/plan.read-model";
import type { EntitlementType } from "../../contracts/types";

/** True iff `e` is a Prisma unique-constraint violation (P2002) — the `entitlements_slug_uq` race backstop. */
export function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

/** Insert a new entitlement (Doc-4I §HB-1.3 create). Throws P2002 on a duplicate `slug` (→ BUSINESS). */
export async function insertEntitlement(
  input: { slug: string; type: EntitlementType; defaultValue?: unknown; actorUserId: string },
  db: DbExecutor,
): Promise<{ entitlementId: string }> {
  const entitlementId = uuidv7();
  await db.entitlement.create({
    data: {
      id: entitlementId,
      slug: input.slug,
      type: entitlementTypeToClient(input.type),
      ...(input.defaultValue !== undefined
        ? { defaultValue: input.defaultValue as Prisma.InputJsonValue }
        : {}),
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
    },
  });
  return { entitlementId };
}

/** Load an entitlement's identity (`slug` + client `type`) for REFERENCE + the update output. `null` ⇒ absent. */
export async function loadEntitlementById(
  entitlementId: string,
  db: DbExecutor,
): Promise<{ id: string; slug: string; type: EntitlementTypeClient } | null> {
  const row = await db.entitlement.findUnique({
    where: { id: entitlementId },
    select: { id: true, slug: true, type: true },
  });
  if (row === null) return null;
  return { id: row.id, slug: row.slug, type: row.type as EntitlementTypeClient };
}

/** Update an entitlement's `type`/`default_value` (Doc-4I §HB-1.3 update). Returns the affected-row count. */
export async function updateEntitlementFields(
  input: {
    entitlementId: string;
    type?: EntitlementType;
    defaultValue?: unknown;
    actorUserId: string;
  },
  db: DbExecutor,
): Promise<number> {
  const { count } = await db.entitlement.updateMany({
    where: { id: input.entitlementId },
    data: {
      ...(input.type !== undefined ? { type: entitlementTypeToClient(input.type) } : {}),
      ...(input.defaultValue !== undefined
        ? { defaultValue: input.defaultValue as Prisma.InputJsonValue }
        : {}),
      updatedBy: input.actorUserId,
    },
  });
  return count;
}

/** Does an entitlement row exist (any state)? — the bundle REFERENCE check (Doc-4I §HB-1.2). */
export async function entitlementExists(entitlementId: string, db: DbExecutor): Promise<boolean> {
  const row = await db.entitlement.findUnique({
    where: { id: entitlementId },
    select: { id: true },
  });
  return row !== null;
}

/**
 * Upsert a plan↔entitlement bundle (Doc-4I §HB-1.2). Idempotent on the composite PK — re-bundling the same
 * entitlement updates `value_jsonb` in place, never a new row (Doc-5I §4). No `updated_at` column exists on
 * `plan_entitlements` (append/upsert child), so only `value_jsonb` is refreshed on conflict.
 */
export async function upsertPlanEntitlement(
  input: { planId: string; entitlementId: string; valueJsonb: unknown; actorUserId: string },
  db: DbExecutor,
): Promise<void> {
  await db.planEntitlement.upsert({
    where: {
      planId_entitlementId: { planId: input.planId, entitlementId: input.entitlementId },
    },
    create: {
      planId: input.planId,
      entitlementId: input.entitlementId,
      valueJsonb: input.valueJsonb as Prisma.InputJsonValue,
      createdBy: input.actorUserId,
    },
    update: {
      valueJsonb: input.valueJsonb as Prisma.InputJsonValue,
    },
  });
}

// Re-export the wire mapper so the update command builds its `EntitlementView` output from the loaded row.
export { entitlementTypeToWire };
