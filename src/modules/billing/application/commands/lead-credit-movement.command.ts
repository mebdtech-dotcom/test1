// M7 application (PRIVATE) — `billing.credit_lead_account.v1` / `billing.debit_lead_account.v1`
// (Doc-4I §HB-4.1 / Doc-5I §7 `POST /billing/lead-account/credit-lead-account` · `…/debit-lead-account` ·
// 200). W3-BILL-13. ORG-SCOPED audited write, ACTOR-BRANCHED (Doc-4I F4I-PA-M1): the USER leg (org
// purchase-credit / org-initiated debit; `can_manage_billing`; WIRED — R11) and the SYSTEM leg (shortfall
// credit / lead-consumption debit; no slug; in-process). `direction` is fixed by the contract slug (one
// §HB-4.1 record covers both). Appends a `lead_credit_transactions` row and updates the `lead_credit_accounts`
// balance head atomically, in the ONE tenant tx the composition supplies.
//
// amount/balance = lead CREDITS (units, NOT money — BL-CR7). Audit = [ESC-BILL-AUDIT] (lead-credit movement
// not §9-enumerated; nearest by pointer). A credit may link a BC-BILL-5 `source_invoice_id` (REFERENCE if it
// does not resolve for the org). A debit within available balance only — no overdraft → BUSINESS.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  createLeadCreditAccount,
  creditLeadBalance,
  debitLeadBalance,
  findLiveLeadCreditAccount,
  insertLeadCreditTransaction,
} from "../../infrastructure/data/lead-credit.repository";
import { loadInvoiceHead } from "../../infrastructure/data/platform-invoice.repository";
import {
  LEAD_CREDIT_TRANSACTION_ENTITY_TYPE,
  LeadCreditAuditAction,
} from "../../domain/audit-actions";
import type {
  LeadCreditDirection,
  LeadCreditMovementInput,
  LeadCreditMovementOutcome,
  LeadCreditWriteError,
} from "../../contracts/types";

const INVALID_INPUT = "billing_lead_write_invalid_input";
const FORBIDDEN = "billing_lead_write_forbidden";
const REFERENCE = "billing_lead_reference";
const INSUFFICIENT = "billing_lead_insufficient"; // BUSINESS

/** The server-resolved request context (from the composition — never client input). */
export interface LeadCreditMovementContext {
  actorType: "user" | "system";
  userId: string | null;
  organizationId: string;
  /** Fixed by the contract slug (`credit_lead_account` → credit; `debit_lead_account` → debit). */
  direction: LeadCreditDirection;
  /** Resolved by the composition via `hasPermission(can_manage_billing)` (User leg). System: n/a. */
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface LeadCreditMovementDeps {
  appendAuditRecord: AppendAuditRecord;
}

function err(
  errorClass: LeadCreditWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: LeadCreditWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). `amount > 0`; `source_invoice_id` uuid where present. */
export function validateLeadCreditMovementInput(input: LeadCreditMovementInput): string | null {
  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) {
    return "amount must be greater than 0.";
  }
  if (input.sourceInvoiceId !== undefined && !UUID_PATTERN.test(input.sourceInvoiceId)) {
    return "source_invoice_id must be a valid UUID.";
  }
  return null;
}

/**
 * Move lead credits (Doc-4I §HB-4.1). Finds/creates the account head, applies the movement (credit
 * increments; debit conditionally decrements — insufficient → BUSINESS), appends the transaction, and
 * audits — all in the ONE tenant transaction the composition supplies (`db`).
 */
export async function leadCreditMovementCommand(
  input: LeadCreditMovementInput,
  ctx: LeadCreditMovementContext,
  deps: LeadCreditMovementDeps,
  db: DbExecutor = prisma,
): Promise<LeadCreditMovementOutcome> {
  const invalid = validateLeadCreditMovementInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — the User leg requires `can_manage_billing`; the System leg carries no slug.
  if (ctx.actorType === "user" && ctx.canManageBilling !== true) {
    return err(
      "AUTHORIZATION",
      FORBIDDEN,
      "can_manage_billing is required for a lead-credit movement.",
    );
  }

  // REFERENCE — a linked `source_invoice_id` (credit only) must resolve to the org's BC-BILL-5 invoice.
  if (ctx.direction === "credit" && input.sourceInvoiceId !== undefined) {
    const invoice = await loadInvoiceHead(input.sourceInvoiceId, db);
    if (invoice === null || invoice.organizationId !== ctx.organizationId) {
      return err(
        "REFERENCE",
        REFERENCE,
        "source_invoice_id does not resolve for this organization.",
      );
    }
  }

  // Find or create the org's lead-credit account head (created on first movement — Doc-4I §HB-4.1).
  const existing = await findLiveLeadCreditAccount(ctx.organizationId, db);
  const accountId =
    existing?.id ?? (await createLeadCreditAccount(ctx.organizationId, ctx.userId, db));

  // Apply the balance movement atomically. debit within available balance (no overdraft → BUSINESS).
  let balance: number;
  if (ctx.direction === "credit") {
    balance = await creditLeadBalance(accountId, input.amount, ctx.userId, db);
  } else {
    const newBalance = await debitLeadBalance(accountId, input.amount, ctx.userId, db);
    if (newBalance === null) {
      return err("BUSINESS", INSUFFICIENT, "Insufficient lead credits to debit.");
    }
    balance = newBalance;
  }

  // Append the ledger transaction (credit direction → credit txn; debit → debit txn; credit may link invoice).
  const transactionId = await insertLeadCreditTransaction(
    {
      accountId,
      txnType: ctx.direction,
      amount: input.amount,
      ...(ctx.direction === "credit" && input.sourceInvoiceId !== undefined
        ? { sourceInvoiceId: input.sourceInvoiceId }
        : {}),
      actorUserId: ctx.userId,
    },
    db,
  );

  // AUDIT — [ESC-BILL-AUDIT] lead-credit movement; actor User/System; org-scoped.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: ctx.organizationId,
      entityType: LEAD_CREDIT_TRANSACTION_ENTITY_TYPE,
      entityId: transactionId,
      action: LeadCreditAuditAction.MOVED,
      oldValue: null,
      newValue: { direction: ctx.direction, amount: input.amount, balance },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      transactionId,
      organizationId: ctx.organizationId,
      direction: ctx.direction,
      amount: input.amount,
      balance,
    },
  };
}
