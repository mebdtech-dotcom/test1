// M7 application (PRIVATE) — `billing.list_plans.v1` read query (Doc-4I §HB-1.4 / Doc-5I §4
// `GET /billing/plans`). Orchestration only; owns NO state. Single read: NO explicit transaction
// (Doc-5A §17.1). Marketplace precedent: `list-vendor-directory.query.ts` (keyset "fetch N+1, trim").
//
// Validation (Doc-4I §HB-1.4 / Doc-5A §8): SYNTAX (allowlisted+in-range filters; `page_size` bound;
// opaque cursor decodability) → non-retired scope. Sort is server-fixed `name` asc / `plan_id` tiebreak
// (total order) — no client `sort` parameter. `status`/`is_active` filters narrow within the non-retired
// (`deleted_at IS NULL`) surface; a `status=retired` filter provably matches nothing here (retired ⟺
// soft-deleted, visible to staff/admin only — resolved `[ESC-BILL-RETIRE-VIS]`, `esc_registry.md`).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import {
  findPlansPage,
  type ListPlansFilterParams,
  type PlanCursorKey,
} from "../../infrastructure/data/plan.repository";
import { derivePlanStatus, isPlanPubliclyVisible } from "../../domain/policies/plan-status.policy";
import type { PlanRowReadModel } from "../../domain/read-models/plan.read-model";
import type {
  ListPlansFilters,
  ListPlansOutcome,
  ListPlansRequest,
  PlanListItem,
} from "../../contracts/types";

// Doc-3 Policy-Key Registration Patch v1.6 (Billing) §Registered keys — `billing.list_page_size_max`
// (integer; over-max → 400 VALIDATION). Doc-5A §8.5 requires the bound to be POLICY-keyed, never a
// literal; no start value is frozen in the v1.6 patch, so this MAXIMUM is realized as the same value the
// M2 sibling registers (`marketplace.list_page_size_max` start 100) — [realization convention, disclosed],
// the omitted-`page_size` default resolving to this SAME registered maximum, never an unregistered literal.
const LIST_PAGE_SIZE_MAX = 100;

interface PlanCursorPayload {
  name: string;
  id: string;
}

/** Opaque keyset cursor [realization convention, disclosed]: base64url of `{ name, id }` — the exact
 *  `(name, plan_id)` keyset position. A client MUST NOT construct/decode one (Doc-5A §8.2). */
function encodeCursor(payload: PlanCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): PlanCursorKey | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.name !== "string" || typeof record.id !== "string") return null;
  if (!UUID_PATTERN.test(record.id)) return null;
  return { name: record.name, id: record.id };
}

type FilterResolution =
  | { kind: "invalid" }
  | { kind: "empty" } // valid, but provably no rows in the non-retired scope
  | { kind: "ok"; repoFilters: ListPlansFilterParams };

/**
 * Validate the declared `filter` allowlist (Doc-4I §HB-1.4 `{ billing_cycle?, is_active?, status? }`) and
 * resolve `status` into its `is_active` implication within the non-retired scope. `status=retired`, or an
 * `is_active`↔`status` contradiction, provably matches nothing here → `empty`.
 */
function resolveFilters(filters: ListPlansFilters): FilterResolution {
  const { billingCycle, isActive, status } = filters;

  if (billingCycle !== undefined && billingCycle !== "monthly" && billingCycle !== "annual") {
    return { kind: "invalid" };
  }
  if (status !== undefined && status !== "draft" && status !== "active" && status !== "retired") {
    return { kind: "invalid" };
  }
  if (isActive !== undefined && typeof isActive !== "boolean") {
    return { kind: "invalid" };
  }

  // retired ⟺ soft-deleted ⇒ not in the public non-retired scope (ESC-BILL-RETIRE-VIS).
  if (status === "retired") {
    return { kind: "empty" };
  }

  let effectiveActive = isActive;
  if (status === "active") {
    if (effectiveActive === false) return { kind: "empty" }; // is_active=false ∧ status=active → ∅
    effectiveActive = true;
  }
  if (status === "draft") {
    if (effectiveActive === true) return { kind: "empty" }; // is_active=true ∧ status=draft → ∅
    effectiveActive = false;
  }

  return {
    kind: "ok",
    repoFilters: {
      ...(billingCycle !== undefined ? { billingCycle } : {}),
      ...(effectiveActive !== undefined ? { isActive: effectiveActive } : {}),
    },
  };
}

function toListItem(row: PlanRowReadModel): PlanListItem {
  return {
    planId: row.id,
    name: row.name,
    billingCycle: row.billingCycle,
    price: row.price,
    currency: row.currency,
    status: derivePlanStatus(row),
  };
}

/**
 * `billing.list_plans.v1` — the paginated non-retired plan catalog read. `name` asc / `plan_id`
 * tiebreak total order; keyset "fetch N+1, trim" so `has_more` is computed from the SAME
 * visibility-scoped set that produces `items` (Doc-5A §8.7).
 */
export async function listPlans(
  request: ListPlansRequest,
  db: DbExecutor = prisma,
): Promise<ListPlansOutcome> {
  const resolution = resolveFilters(request.filters ?? {});
  if (resolution.kind === "invalid") {
    return { invalidInput: true };
  }

  // page_size — bounded by `billing.list_page_size_max`; over-max is a SYNTAX 400, never clamped (Doc-5A §8.5).
  const pageSize = request.pageSize ?? LIST_PAGE_SIZE_MAX;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > LIST_PAGE_SIZE_MAX) {
    return { invalidInput: true };
  }

  // cursor — opaque keyset token (Doc-5A §8.1/§8.2); malformed ⇒ SYNTAX 400 (never guessed/repaired).
  let after: PlanCursorKey | null = null;
  if (request.cursor !== undefined) {
    after = decodeCursor(request.cursor);
    if (after === null) {
      return { invalidInput: true };
    }
  }

  // A provably-empty filter (retired / contradictory) short-circuits AFTER SYNTAX (Doc-4A §11.2 order).
  if (resolution.kind === "empty") {
    return { items: [], pageInfo: { hasMore: false } };
  }

  // Fetch pageSize + 1 (the standard keyset "fetch N+1, trim" trick).
  const rows = await findPlansPage(resolution.repoFilters, after, pageSize + 1, db);

  // Defensive re-gate through the SAME visibility predicate the repository's SQL WHERE encodes (never a
  // second predicate) BEFORE the has_more/trim math so items/has_more/cursor never diverge (Doc-5A §8.7).
  const visibleRows = rows.filter(isPlanPubliclyVisible);

  const hasMore = visibleRows.length > pageSize;
  const page = hasMore ? visibleRows.slice(0, pageSize) : visibleRows;
  const items = page.map(toListItem);

  const last = page[page.length - 1];
  const pageInfo =
    hasMore && last !== undefined
      ? { hasMore: true, nextCursor: encodeCursor({ name: last.name, id: last.id }) }
      : { hasMore: false };

  return { items, pageInfo };
}
