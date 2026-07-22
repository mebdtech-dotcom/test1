// App-layer COMPOSITION for the BC-BILL-5 invoice reads (Doc-5I §8 — `GET /billing/invoices/{invoice_id}` ·
// 200, `GET /billing/invoices` · 200). ORG-SELF reads (Own-Org debtor, User-only — Doc-5I §3.6): resolve
// session → provision → run inside `withActiveOrg` (RLS-scoped tenant tx), authorize `can_view_billing` via
// `hasPermission` (M1 `check_permission`) ON the tenant tx. Org = server-validated active org — NO caller
// `org_id` (Doc-5I §8 / Invariant #5). The issue/update writes + record_payment land in the next slice.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import { allocateHumanReference, appendAuditRecord } from "@/modules/core/contracts";
import {
  getPlatformInvoice,
  invoiceViewForbidden,
  invoiceWriteForbidden,
  invoiceWriteInvalidInput,
  issuePlatformInvoice,
  listPlatformInvoices,
  mapGetPlatformInvoice,
  mapIssuePlatformInvoice,
  mapListPlatformInvoices,
  mapUpdateInvoiceStatus,
  updateInvoiceStatus,
  validateIssuePlatformInvoiceInput,
  validateUpdateInvoiceStatusInput,
  type IssuePlatformInvoiceInput,
  type IssuePlatformInvoiceResult,
  type ListPlatformInvoicesRequest,
  type ListPlatformInvoicesResult,
  type PlatformInvoiceView,
  type UpdateInvoiceStatusInput,
  type UpdateInvoiceStatusResult,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the invoice compositions. All injectable (defaults bind production wiring). */
export interface PlatformInvoiceHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** The Doc-2 §7 slugs — reads authorize `can_view_billing`; the org-scoped writes `can_manage_billing`. */
const CAN_VIEW_BILLING = "can_view_billing";
const CAN_MANAGE_BILLING = "can_manage_billing";

/**
 * `GET /billing/invoices/{invoice_id}` — `billing.get_platform_invoice.v1`. `200` (§5.6, incl. payments) ·
 * `401` · `400` (SYNTAX) · `403` (no active org / `can_view_billing` denied) · `404` (absent/cross-org).
 */
export async function handleGetPlatformInvoice(
  invoiceId: string,
  deps: PlatformInvoiceHandlerDeps,
): Promise<WireResponse<PlatformInvoiceView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };
    return {
      denied: false as const,
      outcome: await getPlatformInvoice(invoiceId, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return invoiceViewForbidden();
  }
  return mapGetPlatformInvoice(ran.value.outcome);
}

/**
 * `GET /billing/invoices` — `billing.list_platform_invoices.v1`. `200` (§5.6 list) · `401` · `400` (SYNTAX:
 * filter / cursor / page_size) · `403` (no active org / `can_view_billing` denied).
 */
export async function handleListPlatformInvoices(
  request: ListPlatformInvoicesRequest,
  deps: PlatformInvoiceHandlerDeps,
): Promise<WireResponse<ListPlatformInvoicesResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };
    return {
      denied: false as const,
      outcome: await listPlatformInvoices(request, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return invoiceViewForbidden();
  }
  return mapListPlatformInvoices(ran.value.outcome);
}

/**
 * `POST /billing/invoices` — `billing.issue_platform_invoice.v1` (the WIRED User self-serve leg). `201`
 * (§5.6 + Location) · `401` · `400` (SYNTAX) · `403` (no active org / `can_manage_billing` denied) · `422`
 * REFERENCE (subscription_id). The debtor org is the actor's active org (no caller org_id — Invariant #5).
 */
export async function handleIssuePlatformInvoice(
  input: IssuePlatformInvoiceInput,
  deps: PlatformInvoiceHandlerDeps,
): Promise<WireResponse<IssuePlatformInvoiceResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (§11.2 order) — 400 before the org/permission gate.
  const syntaxFailure = validateIssuePlatformInvoiceInput(input);
  if (syntaxFailure !== null) {
    return invoiceWriteInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return issuePlatformInvoice(
      input,
      {
        actorType: "user",
        userId: context.userId,
        organizationId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord, allocateHumanReference },
      tx,
    );
  });

  if (!ran.resolved) {
    return invoiceWriteForbidden();
  }
  return mapIssuePlatformInvoice(ran.value);
}

/**
 * `POST /billing/invoices/{invoice_id}/update-invoice-status` — `billing.update_invoice_status.v1` (the
 * WIRED User `void` leg). `200` · `401` · `400` (SYNTAX) · `403` (no active org / `can_manage_billing`
 * denied, or a non-`void` target) · `404` (absent/cross-org) · `409` STATE/CONFLICT.
 */
export async function handleUpdateInvoiceStatus(
  input: UpdateInvoiceStatusInput,
  deps: PlatformInvoiceHandlerDeps,
): Promise<WireResponse<UpdateInvoiceStatusResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  const syntaxFailure = validateUpdateInvoiceStatusInput(input);
  if (syntaxFailure !== null) {
    return invoiceWriteInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canManageBilling = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_BILLING,
      },
      undefined,
      tx,
    );
    return updateInvoiceStatus(
      input,
      {
        actorType: "user",
        userId: context.userId,
        organizationId: context.activeOrgId,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
  });

  if (!ran.resolved) {
    return invoiceWriteForbidden();
  }
  return mapUpdateInvoiceStatus(ran.value);
}
