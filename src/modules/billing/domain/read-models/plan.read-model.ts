// M7 domain (PRIVATE) — the `billing.plans` (+ bundled `plan_entitlements`/`entitlements`) read model
// for `billing.get_plan.v1` / `billing.list_plans.v1` (Doc-4I §HB-1.4 / Doc-6I §3.1). A read projection
// of the authoritative `billing.plans` row — NOT a source of truth (the table is). Marketplace precedent:
// `src/modules/marketplace/domain/read-models/vendor-profile.read-model.ts`.
//
// `price` is carried as the Prisma `Decimal`'s canonical STRING (money-safe — the repository converts;
// JSON has no exact decimal). `type` is carried as the Prisma-client enum VALUE (`enum_` for DB `'enum'`
// — see `entitlementTypeToWire`); `deletedAt` is the visibility/status-derivation input (Doc-2 §10.8).

import type { EntitlementType } from "../../contracts/types";

/** The Prisma-client value of `billing.entitlement_type` — note `enum_` is the client value for DB `'enum'`
 *  (the `enum` keyword is remapped in `schema.prisma`). */
export type EntitlementTypeClient = "boolean" | "numeric" | "enum_";

/** Map the Prisma-client entitlement type to the Doc-4I §HB-1.4 wire value (`enum_` → `enum`). */
export function entitlementTypeToWire(type: EntitlementTypeClient): EntitlementType {
  return type === "enum_" ? "enum" : type;
}

/** One bundled entitlement as read for `get_plan` (the `plan_entitlements` ⋈ `entitlements` join row). */
export interface PlanEntitlementRowReadModel {
  /** PK (UUIDv7) of the `entitlements` row. */
  entitlementId: string;
  /** The entitlement's unique slug (`entitlements.slug`). */
  slug: string;
  /** Prisma-client type value (`enum_` = DB `'enum'`). */
  type: EntitlementTypeClient;
  /** The per-plan value (`plan_entitlements.value_jsonb`) — an arbitrary JSON value. */
  value: unknown;
}

/** One `billing.plans` row as read for the catalog reads, plus its status/visibility inputs. */
export interface PlanRowReadModel {
  /** PK (UUIDv7). */
  id: string;
  /** Plan display name — also the primary keyset-pagination sort key (`name` asc, `id` tiebreak). */
  name: string;
  billingCycle: "monthly" | "annual";
  /** Doc-2 §10.8 `numeric`, carried as its precision-preserving decimal string. */
  price: string;
  currency: string;
  /** Marketing-visibility flag (Doc-2 §10.8) — the `active` vs `draft` status discriminator. */
  isActive: boolean;
  /** Soft-delete marker (Doc-2 §10.8; `SD = retire`) — the `retired` status + visibility input. */
  deletedAt: Date | null;
  /** Bundled entitlements (`get_plan` only; empty for list rows). */
  entitlements: PlanEntitlementRowReadModel[];
}
