// M7 domain — canonical audit-action constants for the BC-BILL-1 plan-catalog write commands (the
// realized serialization tokens). Imported as NAMED CONSTANTS — never hardcoded string literals (Board
// ruling 2026-06-30; the M1 `RoleAuditAction` / M0 `OutboxAuditAction` precedent).
//
// [ESC-BILL-AUDIT] — plan create/activate/update/retire are NOT separately enumerated in Doc-2 §9 (the
// Financial family is "invoice/payment/refund/subscription…"; the Organization family is "subscription
// change"). Per Doc-4I §H.6 / §HB-1.1 §9, the audit binds to the NEAREST enumerated §9 action BY POINTER
// — no action invented, no Doc-2 §9 patch: the Doc-2 §9 **Platform** family "service-role sensitive
// operations" (line 695) — platform-staff mutating platform-owned catalog config. This is the SAME
// enumerated family + bind-by-pointer discipline the M0 outbox workers use (`core/domain/audit-actions.ts`
// — "the family is already enumerated, so these tokens bind BY POINTER to it"). The BUSINESS meaning is
// owned by rank-0 Doc-2 §9; the SERIALIZATION (these tokens + `entity_type`) is a realization detail — a
// future token rename never reopens Doc-2. Attribution is **Admin** (`actor_type: "admin"` — platform
// governance, §5.6), NEVER System (caller-driven catalog write); `organization_id` is null (platform scope).

/** The audit `entity_type` for a `billing.plans` catalog mutation (Doc-4I §HB-1.1 §9 `entity_type=plans`). */
export const PLAN_ENTITY_TYPE = "plans" as const;

/**
 * Canonical plan-catalog audit actions — each bound BY POINTER to the ENUMERATED Doc-2 §9 Platform family
 * "service-role sensitive operations" ([ESC-BILL-AUDIT] — nearest by pointer; no action invented). Distinct
 * tokens per lifecycle transition so the immutable ledger distinguishes create/activate/update/retire.
 */
export const PlanCatalogAuditAction = {
  /** §9 Platform "service-role sensitive operations" — a plan created at `draft` (§HB-1.1). */
  CREATED: "plan_created",
  /** §9 Platform "service-role sensitive operations" — a plan published `draft → active` (§HB-1.1a). */
  ACTIVATED: "plan_activated",
  /** §9 Platform "service-role sensitive operations" — a plan's marketing config updated (§HB-1.1). */
  UPDATED: "plan_updated",
  /** §9 Platform "service-role sensitive operations" — a plan retired `active|draft → retired` (§HB-1.1). */
  RETIRED: "plan_retired",
} as const;

export type PlanCatalogAuditActionToken =
  (typeof PlanCatalogAuditAction)[keyof typeof PlanCatalogAuditAction];
