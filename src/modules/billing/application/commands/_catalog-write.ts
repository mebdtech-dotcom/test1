// M7 application (PRIVATE) — shared helpers for the BC-BILL-1 Admin plan-catalog write commands
// (create/activate/update/retire — Doc-4I §HB-1.1 + §HB-1.1a). Module-PRIVATE: imported solely by sibling
// `application/commands/*.command.ts`; never re-exported through `contracts/`. The set-user-account-status
// (Doc-4C §C4) precedent: platform-staff, own-tx staff-GUC context, Admin-attributed audit, no org scope.

import type { AppendAuditRecord, AppendAuditRecordInput } from "@/modules/core/contracts";
import type { PlanWriteError, PlanWriteErrorClass } from "../../contracts/types";

// Doc-4A §12 error codes for BC-BILL-1 catalog writes — the `billing_<domain>_<code>` FORM (Doc-4A §H.4);
// the code STRING is the realization slot (Doc-5I §3.8 fixes the class→status map). Bound, not coined loosely.
export const PLAN_WRITE_INVALID_INPUT = "billing_plan_invalid_input";
export const PLAN_WRITE_FORBIDDEN = "billing_plan_forbidden";
export const PLAN_WRITE_ILLEGAL_STATE = "billing_plan_illegal_state";
export const PLAN_WRITE_CONFLICT = "billing_plan_conflict";
export const PLAN_WRITE_REFERENCE = "billing_plan_reference";

// W3-BILL-3 — entitlement-catalog + plan→entitlement-bundle write codes (same `billing_<domain>_<code>` form).
export const ENTITLEMENT_WRITE_INVALID_INPUT = "billing_entitlement_invalid_input";
export const ENTITLEMENT_WRITE_FORBIDDEN = "billing_entitlement_forbidden";
export const ENTITLEMENT_WRITE_SLUG_CONFLICT = "billing_entitlement_slug_conflict"; // BUSINESS (dup slug)
export const ENTITLEMENT_WRITE_CONFLICT = "billing_entitlement_conflict";
export const ENTITLEMENT_WRITE_REFERENCE = "billing_entitlement_reference";
export const BUNDLE_WRITE_INVALID_INPUT = "billing_bundle_invalid_input";
export const BUNDLE_WRITE_FORBIDDEN = "billing_bundle_forbidden";
export const BUNDLE_WRITE_REFERENCE = "billing_bundle_reference";

/** Realization ceilings [disclosed] — the frozen fields declare no numeric bound; an unbounded write is a
 *  storage/DoS hazard (the M1 `ADMIN_REASON_MAX_LENGTH` / `ROLE_NAME_MAX_LENGTH` precedent). */
export const PLAN_NAME_MAX_LENGTH = 200;

const BILLING_CYCLES = new Set(["monthly", "annual"]);
const PRICE_PATTERN = /^\d+(\.\d+)?$/; // non-negative decimal string (Doc-4I: price ≥ 0)
const CURRENCY_PATTERN = /^[A-Z]{3}$/; // ISO 4217 (Doc-6I `char(3)`)

/**
 * The server-resolved ADMIN (platform-staff) context for a BC-BILL-1 catalog write — from the composition
 * edge (`resolveStaffContext`), NEVER client input. `isPlatformStaff` MUST be `true`; each command
 * fail-closes otherwise (defense-in-depth behind the composition-edge gate).
 */
export interface AdminCatalogContext {
  /** The acting platform-staff principal's `identity.users` id (audit attribution). */
  adminUserId: string;
  /** The server-derived platform-staff basis (Doc-5C §3.2 — never client-asserted). */
  isPlatformStaff: boolean;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected M0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface AdminCatalogDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/** A minimal transaction surface for pinning the staff-governance GUCs (transaction-local). */
export interface StaffGucTx {
  $executeRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<number>;
}

/**
 * Pin the STAFF governance RLS context transaction-local (the set-user-account-status precedent): `app.user_id`
 * = the Admin principal + `app.is_platform_staff = 'true'`; NO `app.active_org` (platform scope). This admits
 * BOTH the `plans_admin` catalog write AND the ADR-021 audit staff-leg (`actor_type='admin'`). Discarded at
 * commit/rollback (never session-global — no context bleed).
 */
export async function pinStaffContext(tx: StaffGucTx, adminUserId: string): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.user_id', ${adminUserId}::text, true)`;
  await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
}

/** Assemble the Admin-attributed audit input for a platform-owned catalog write (`organization_id` null —
 *  no org context, §5.6). Generic across BC-BILL-1 catalog entities (plans / entitlements / plan_entitlements).
 *  The COMMAND chooses the action/entity/diff (D7 — never defaulted here). */
export function buildCatalogAuditInput(
  ctx: AdminCatalogContext,
  facts: {
    entityType: string;
    entityId: string;
    action: string;
    oldValue: unknown;
    newValue: unknown;
  },
): AppendAuditRecordInput {
  return {
    actorId: ctx.adminUserId,
    actorType: "admin",
    organizationId: null,
    entityType: facts.entityType,
    entityId: facts.entityId,
    action: facts.action,
    oldValue: facts.oldValue,
    newValue: facts.newValue,
    ipAddress: ctx.ipAddress ?? null,
    userAgent: ctx.userAgent ?? null,
  };
}

/** Back-compat alias — the plan-lifecycle commands (W3-BILL-2) import this name; identical function. */
export const buildPlanAuditInput = buildCatalogAuditInput;

/** Build a failure outcome (the in-process shape; the wire handler maps class → §6.2 status). */
export function catalogErr(
  errorClass: PlanWriteErrorClass,
  errorCode: string,
  message: string,
): { ok: false; error: PlanWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** The staff fail-closed re-check every catalog command runs (defense-in-depth behind the edge gate). */
export function requireStaff(
  ctx: AdminCatalogContext,
): { ok: false; error: PlanWriteError } | null {
  if (ctx.isPlatformStaff !== true) {
    return catalogErr("AUTHORIZATION", PLAN_WRITE_FORBIDDEN, "Platform-staff authority required.");
  }
  return null;
}

// ── SYNTAX validators (Doc-4A §11.2 category 1). Return a message, or `null` when valid. ──

export function validatePlanName(name: unknown): string | null {
  if (typeof name !== "string" || name.trim().length === 0 || name.length > PLAN_NAME_MAX_LENGTH) {
    return `name is required (1..${PLAN_NAME_MAX_LENGTH} characters).`;
  }
  return null;
}
export function isValidBillingCycle(v: unknown): v is "monthly" | "annual" {
  return typeof v === "string" && BILLING_CYCLES.has(v);
}
export function isValidPrice(v: unknown): v is string {
  return typeof v === "string" && PRICE_PATTERN.test(v);
}
export function isValidCurrency(v: unknown): v is string {
  return typeof v === "string" && CURRENCY_PATTERN.test(v);
}

// ── Entitlement-catalog validators (W3-BILL-3; Doc-4I §HB-1.3 / Doc-6I §3.1.2) ──
const ENTITLEMENT_TYPES = new Set(["boolean", "numeric", "enum"]);
const SLUG_PATTERN = /^[a-z][a-z0-9_]*$/; // lower_snake_case (the M1 permission-slug convention)
export const ENTITLEMENT_SLUG_MAX_LENGTH = 200;

export function isValidEntitlementType(v: unknown): v is "boolean" | "numeric" | "enum" {
  return typeof v === "string" && ENTITLEMENT_TYPES.has(v);
}
export function validateEntitlementSlug(slug: unknown): string | null {
  if (
    typeof slug !== "string" ||
    slug.length === 0 ||
    slug.length > ENTITLEMENT_SLUG_MAX_LENGTH ||
    !SLUG_PATTERN.test(slug)
  ) {
    return "slug is required (a lower_snake_case identifier).";
  }
  return null;
}
