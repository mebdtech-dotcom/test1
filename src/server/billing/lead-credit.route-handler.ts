// App-layer COMPOSITION for the BC-BILL-4 lead-credit reads (Doc-5I §7 — `GET /billing/lead-account` · 200,
// `GET /billing/lead-account/transactions` · 200). ORG-SELF reads (Own-Org, User-only — Doc-5I §3.6):
// resolve session → provision → run inside `withActiveOrg` (RLS-scoped tenant tx), authorize
// `can_view_billing` via `hasPermission` (M1 `check_permission`) ON the tenant tx. Org = server-validated
// active org — NO caller `org_id` (Doc-5I §7 / Invariant #5). The credit/debit writes land in the next slice.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  getLeadBalance,
  leadCreditMovement,
  leadViewForbidden,
  leadWriteForbidden,
  leadWriteInvalidInput,
  listLeadTransactions,
  mapGetLeadBalance,
  mapLeadCreditMovement,
  mapListLeadTransactions,
  validateLeadCreditMovementInput,
  type LeadBalanceView,
  type LeadCreditMovementInput,
  type LeadCreditMovementResult,
  type ListLeadTransactionsRequest,
  type ListLeadTransactionsResult,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the lead-credit compositions. All injectable (defaults bind production wiring). */
export interface LeadCreditHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** The Doc-2 §7 slugs — reads authorize `can_view_billing`; the org-scoped writes `can_manage_billing`. */
const CAN_VIEW_BILLING = "can_view_billing";
const CAN_MANAGE_BILLING = "can_manage_billing";

/** Shared composition for the two lead-credit movement legs (credit / debit fixed by the route). */
async function runLeadCreditMovement(
  input: LeadCreditMovementInput,
  direction: "credit" | "debit",
  deps: LeadCreditHandlerDeps,
): Promise<WireResponse<LeadCreditMovementResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (§11.2 order) — 400 before the org/permission gate.
  const syntaxFailure = validateLeadCreditMovementInput(input);
  if (syntaxFailure !== null) {
    return leadWriteInvalidInput(syntaxFailure);
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
    return leadCreditMovement(
      input,
      {
        actorType: "user",
        userId: context.userId,
        organizationId: context.activeOrgId,
        direction,
        canManageBilling,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
  });

  if (!ran.resolved) {
    return leadWriteForbidden();
  }
  return mapLeadCreditMovement(ran.value);
}

/** `POST /billing/lead-account/credit-lead-account` — `billing.credit_lead_account.v1` (User purchase leg). */
export async function handleCreditLeadAccount(
  input: LeadCreditMovementInput,
  deps: LeadCreditHandlerDeps,
): Promise<WireResponse<LeadCreditMovementResult>> {
  return runLeadCreditMovement(input, "credit", deps);
}

/** `POST /billing/lead-account/debit-lead-account` — `billing.debit_lead_account.v1` (User debit leg). */
export async function handleDebitLeadAccount(
  input: LeadCreditMovementInput,
  deps: LeadCreditHandlerDeps,
): Promise<WireResponse<LeadCreditMovementResult>> {
  return runLeadCreditMovement(input, "debit", deps);
}

/**
 * `GET /billing/lead-account` — `billing.get_lead_balance.v1`. `200` (§5.6; balance 0 when no account) ·
 * `401` · `403` (no active org / `can_view_billing` denied).
 */
export async function handleGetLeadBalance(
  deps: LeadCreditHandlerDeps,
): Promise<WireResponse<LeadBalanceView>> {
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
    return { denied: false as const, view: await getLeadBalance(context.activeOrgId, tx) };
  });

  if (!ran.resolved || ran.value.denied) {
    return leadViewForbidden();
  }
  return mapGetLeadBalance(ran.value.view);
}

/**
 * `GET /billing/lead-account/transactions` — `billing.list_lead_transactions.v1`. `200` (§5.6 list) ·
 * `401` · `400` (SYNTAX: cursor / page_size) · `403` (no active org / `can_view_billing` denied).
 */
export async function handleListLeadTransactions(
  request: ListLeadTransactionsRequest,
  deps: LeadCreditHandlerDeps,
): Promise<WireResponse<ListLeadTransactionsResult>> {
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
      outcome: await listLeadTransactions(request, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return leadViewForbidden();
  }
  return mapListLeadTransactions(ran.value.outcome);
}
