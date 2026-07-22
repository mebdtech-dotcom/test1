// M7 infrastructure (PRIVATE) — the `billing.plans` catalog WRITE repository for the BC-BILL-1 Admin
// lifecycle commands (Doc-4I §HB-1.1 + §HB-1.1a ActivatePlan patch / Doc-6I §3.1.1). M7 mutating its OWN
// schema (allowed — One Module, One Owner); no module outside `billing` imports this file. Read sibling:
// `plan.repository.ts`.
//
// MODEL B (owner ruling 2026-07-11): the plan `status` (draft|active|retired) is DERIVED from
// (`is_active`, `deleted_at`), never a stored column (Doc-6I schema): draft ⟺ is_active=false ∧ live;
// active ⟺ is_active=true ∧ live; retired ⟺ soft-deleted. So the lifecycle mutations are:
//   create   → INSERT is_active=false (draft)
//   activate → SET is_active=true      (draft → active)
//   update   → SET marketing fields    (name/price/currency/billing_cycle — NOT is_active)
//   retire   → SET deleted_at          (→ retired; SD = retire)
//
// OPTIMISTIC CONCURRENCY (Doc-4A §14): each transition CAS-writes with the `expected_status` predicate
// folded into the SQL `WHERE` (the `is_active`/`deleted_at` twin of the expected status). `updateMany`
// returns `{ count }`: `count === 0` on a legal-source row means a concurrent writer won the race →
// the command maps it to `CONFLICT` (Doc-4A §12.4 — distinct from `STATE`, the illegal-source rejection
// the command decides from the loaded row BEFORE the CAS).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";

/** The minimal plan row the write commands load to decide STATE legality + `expected_status` (concurrency). */
export interface PlanWriteRow {
  id: string;
  isActive: boolean;
  deletedAt: Date | null;
}

/** Load a plan's write-relevant state (any status — the command runs under the staff/`plans_admin` GUC,
 *  so a retired/soft-deleted plan is visible). `null` ⇒ absent (→ REFERENCE). */
export async function loadPlanWriteRow(
  planId: string,
  db: DbExecutor,
): Promise<PlanWriteRow | null> {
  const row = await db.plan.findUnique({
    where: { id: planId },
    select: { id: true, isActive: true, deletedAt: true },
  });
  return row;
}

/** Fields a `create_plan` inserts (Doc-4I §HB-1.1 create inputs; Doc-6I §3.1.1 columns). */
export interface InsertPlanInput {
  name: string;
  billingCycle: "monthly" | "annual";
  /** Doc-2 §10.8 `numeric` — carried as a decimal string; Prisma accepts a string for a Decimal column. */
  price: string;
  currency: string;
  actorUserId: string;
}

/** Insert a plan at `draft` (is_active=false, live). Returns the minted `plan_id`. */
export async function insertPlan(
  input: InsertPlanInput,
  db: DbExecutor,
): Promise<{ planId: string }> {
  const planId = uuidv7();
  await db.plan.create({
    data: {
      id: planId,
      name: input.name,
      billingCycle: input.billingCycle,
      price: input.price,
      currency: input.currency,
      isActive: false, // draft (Model B)
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
    },
  });
  return { planId };
}

/**
 * `activate_plan` CAS: `draft → active` (SET is_active=true) only on a live draft. `count === 0` on a
 * confirmed-draft load ⇒ a concurrent writer flipped it (CONFLICT).
 */
export async function activatePlanCas(
  planId: string,
  actorUserId: string,
  db: DbExecutor,
): Promise<number> {
  const { count } = await db.plan.updateMany({
    where: { id: planId, isActive: false, deletedAt: null },
    data: { isActive: true, updatedBy: actorUserId },
  });
  return count;
}

/** Marketing fields `update_plan` may change (Model B: NOT `is_active` — that is the status discriminator). */
export interface UpdatePlanMarketingFields {
  name?: string;
  billingCycle?: "monthly" | "annual";
  price?: string;
  currency?: string;
}

/**
 * `update_plan` CAS: mutate marketing config on a LIVE (non-retired) plan whose current `is_active`
 * equals `expectedActive` (the `expected_status` concurrency predicate). `count === 0` ⇒ raced (CONFLICT).
 */
export async function updatePlanMarketingCas(
  planId: string,
  expectedActive: boolean,
  fields: UpdatePlanMarketingFields,
  actorUserId: string,
  db: DbExecutor,
): Promise<number> {
  const { count } = await db.plan.updateMany({
    where: { id: planId, isActive: expectedActive, deletedAt: null },
    data: {
      ...(fields.name !== undefined ? { name: fields.name } : {}),
      ...(fields.billingCycle !== undefined ? { billingCycle: fields.billingCycle } : {}),
      ...(fields.price !== undefined ? { price: fields.price } : {}),
      ...(fields.currency !== undefined ? { currency: fields.currency } : {}),
      updatedBy: actorUserId,
    },
  });
  return count;
}

/**
 * `retire_plan` CAS: soft-delete (`SD = retire`) a LIVE plan whose current `is_active` equals
 * `expectedActive`. `count === 0` ⇒ raced (CONFLICT). A soft-deleted (retired) plan is terminal — the
 * command rejects it as STATE before reaching here.
 */
export async function retirePlanCas(
  planId: string,
  expectedActive: boolean,
  actorUserId: string,
  deleteReason: string | null,
  db: DbExecutor,
): Promise<number> {
  const { count } = await db.plan.updateMany({
    where: { id: planId, isActive: expectedActive, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: actorUserId,
      ...(deleteReason !== null ? { deleteReason } : {}),
      updatedBy: actorUserId,
    },
  });
  return count;
}
