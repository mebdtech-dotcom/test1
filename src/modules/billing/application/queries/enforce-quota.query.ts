// M7 application (PRIVATE, INTERNAL-SERVICE AUTHORITY) — `billing.enforce_quota.v1` (Doc-4I §HB-3.2).
// OUT-OF-WIRE (Doc-5I §10/R1/R10): NO HTTP surface. BC-BILL-3 is the quota-enforcement authority — it
// CONSUMES entitlement truth from BC-BILL-2 (`resolve_entitlements`, intra-module) but does NOT resolve it,
// and sums the org's `usage_ledger` balance. Consumed in-process by the metered-action owner (System) or a
// User self-check. W3-BILL-6.
//
// MOAT/FIREWALL (Doc-4I §HB-3.2 / H.9 / R5): this is an ENTITLEMENT check — a yes/no commercial gate. It is
// **never** a routing / eligibility / supplier-selection / trust decision. `allowed=false` is a quota denial
// ONLY; a consuming module must never feed it into matching (Doc-2 §2 M7 / Invariant #6/#10).
//
// quota_key ↔ entitlement binding [realization convention, disclosed]: the `quota_key` names the NUMERIC
// entitlement that bounds it (`resolve_entitlements(entitlement_slug = quota_key)`). No matching numeric
// entitlement (Basic profile / non-numeric / absent) ⇒ limit `0` ⇒ denied — no grant, no quota. The window
// is the current calendar month (`[ESC-BILL-POLICY]` carried — `usage-period.ts`).
//
// OUTPUT = the frozen §HB-3.2 decision object `{ allowed, quota_key, limit, used, remaining }` (verbatim).
// Per §10 (out-of-wire) the authority RETURNS the decision; the Section-11 `QUOTA` class is how an
// *enforcing wire caller* would surface `allowed=false` — not raised by this internal authority itself.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import { resolveEntitlements } from "./resolve-entitlements.query";
import { sumUsage } from "../../infrastructure/data/usage.repository";
import { currentPeriod } from "../../domain/policies/usage-period";
import type { EnforceQuotaInput, EnforceQuotaOutcome } from "../../contracts/types";

/**
 * Evaluate whether `requested_amount` (default 1) fits within the org's entitlement-bounded quota for
 * `quota_key` in the current period. `organizationId` is a server-resolved Controlling Org (the caller's
 * authz/scope gate is the caller's — there is no wire). Read/decision only; no state change.
 */
export async function enforceQuota(
  input: EnforceQuotaInput,
  db: DbExecutor = prisma,
): Promise<EnforceQuotaOutcome> {
  // SYNTAX (Doc-4A §11.2 category 1).
  if (typeof input.organizationId !== "string" || !UUID_PATTERN.test(input.organizationId)) {
    return { ok: false, errorClass: "VALIDATION" };
  }
  if (typeof input.quotaKey !== "string" || input.quotaKey.length === 0) {
    return { ok: false, errorClass: "VALIDATION" };
  }
  const requested = input.requestedAmount ?? 1;
  if (typeof requested !== "number" || !Number.isFinite(requested) || requested < 0) {
    return { ok: false, errorClass: "VALIDATION" };
  }

  // LIMIT — the entitlement-bounded quota (BC-BILL-2 authority; quota_key ↔ numeric entitlement slug).
  const resolved = await resolveEntitlements(
    { organizationId: input.organizationId, entitlementSlug: input.quotaKey },
    db,
  );
  const entitlement = resolved.entitlements.find(
    (e) => e.slug === input.quotaKey && e.type === "numeric",
  );
  const limit = entitlement !== undefined ? Number(entitlement.value) : 0;

  // USED — the org's recorded usage for this quota_key in the current period.
  const used = await sumUsage(
    input.organizationId,
    { quotaKey: input.quotaKey, period: currentPeriod() },
    db,
  );

  const remaining = Math.max(0, limit - used);
  const allowed = requested <= limit - used;

  return {
    ok: true,
    result: { allowed, quotaKey: input.quotaKey, limit, used, remaining },
  };
}
