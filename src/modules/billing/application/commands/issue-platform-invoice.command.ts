// M7 application (PRIVATE) — `billing.issue_platform_invoice.v1` (Doc-4I §HB-5.1 / Doc-5I §8
// `POST /billing/invoices` · 201). W3-BILL-9. ORG-SCOPED audited write, ACTOR-BRANCHED (Doc-4I F4I-PA-M1):
// the USER leg (org self-serve; `can_manage_billing`; the WIRED leg — R11) and the SYSTEM leg
// (subscription/ad/microsite-driven; no slug; in-process). Inserts a `platform_invoices` row at `issued`
// with an M0-allocated `INV-P-…` human_ref, in the ONE tenant transaction the composition supplies (`db`).
//
// FIREWALL (BL-CR2): a PLATFORM invoice (fees owed to iVendorz) — never a trade invoice
// (`≠ operations.trade_invoices`); no procurement decision (moat). Audit = §9 Financial "platform invoice
// created" (ENUMERATED — no [ESC-BILL-AUDIT]).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN, uuidv7 } from "../../../../shared/ids";
import type { AllocateHumanReference, AppendAuditRecord } from "@/modules/core/contracts";
import { insertInvoice } from "../../infrastructure/data/platform-invoice.repository";
import { loadSubscriptionScoped } from "../../infrastructure/data/subscription.repository";
import {
  PLATFORM_INVOICE_ENTITY_TYPE,
  PlatformInvoiceAuditAction,
} from "../../domain/audit-actions";
import type {
  InvoiceWriteError,
  IssuePlatformInvoiceInput,
  IssuePlatformInvoiceOutcome,
  PlatformInvoicePurpose,
} from "../../contracts/types";

const INVALID_INPUT = "billing_invoice_invalid_input";
const FORBIDDEN = "billing_invoice_forbidden";
const REFERENCE = "billing_invoice_reference";

/** The M0 human-reference entity type for a platform invoice — `INV-P-<year>-NNNNNN` (Doc-2 §10.8). */
const INVOICE_HUMAN_REF_ENTITY_TYPE = "INV-P";

const PURPOSES = new Set<PlatformInvoicePurpose>([
  "subscription",
  "lead_package",
  "advertising",
  "microsite",
  "service",
]);

/** The server-resolved request context (from the composition — never client input). */
export interface IssuePlatformInvoiceContext {
  /** `user` = the org self-serve wired leg; `system` = the subscription/ad-driven in-process leg. */
  actorType: "user" | "system";
  /** The acting user (User leg) or `null` (System leg). */
  userId: string | null;
  /** The debtor org (Controlling Org; = the actor's active org on the User leg). */
  organizationId: string;
  /** Resolved by the composition via `hasPermission(can_manage_billing)` (User leg). System leg: n/a. */
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Injected M0 services (D7 rule 4) — the audit write + the human-reference allocator. */
export interface IssuePlatformInvoiceDeps {
  appendAuditRecord: AppendAuditRecord;
  allocateHumanReference: AllocateHumanReference;
}

function err(
  errorClass: InvoiceWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: InvoiceWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). `amount` is a positive money string; `currency` ISO 4217. */
export function validateIssuePlatformInvoiceInput(input: IssuePlatformInvoiceInput): string | null {
  if (!PURPOSES.has(input.purpose)) return "purpose must be a valid invoice purpose.";
  if (
    typeof input.amount !== "string" ||
    !/^\d+(\.\d+)?$/.test(input.amount) ||
    Number(input.amount) <= 0
  ) {
    return "amount must be a positive decimal.";
  }
  if (typeof input.currency !== "string" || !/^[A-Z]{3}$/.test(input.currency)) {
    return "currency must be an ISO 4217 code.";
  }
  if (input.subscriptionId !== undefined && !UUID_PATTERN.test(input.subscriptionId)) {
    return "subscription_id must be a valid UUID.";
  }
  return null;
}

/**
 * Issue a platform invoice at `issued` (Doc-4I §HB-5.1). Allocates the `INV-P-…` human_ref, inserts the
 * invoice, and audits — all in the ONE tenant transaction the composition supplies (`db`).
 */
export async function issuePlatformInvoiceCommand(
  input: IssuePlatformInvoiceInput,
  ctx: IssuePlatformInvoiceContext,
  deps: IssuePlatformInvoiceDeps,
  db: DbExecutor = prisma,
): Promise<IssuePlatformInvoiceOutcome> {
  const invalid = validateIssuePlatformInvoiceInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — the User leg requires `can_manage_billing` (Owner); the System leg carries no slug.
  if (ctx.actorType === "user" && ctx.canManageBilling !== true) {
    return err("AUTHORIZATION", FORBIDDEN, "can_manage_billing is required to issue an invoice.");
  }

  // REFERENCE — a linked `subscription_id` must resolve within the debtor org (Doc-4I §HB-5.1 stage-7).
  if (input.subscriptionId !== undefined) {
    const sub = await loadSubscriptionScoped(input.subscriptionId, ctx.organizationId, db);
    if (sub === null) {
      return err("REFERENCE", REFERENCE, "subscription_id does not resolve for this organization.");
    }
  }

  // WRITE — allocate the human_ref (M0; atomic on this tx), then insert at `issued`.
  const year = new Date().getUTCFullYear(); // server-clock UTC year (Doc-2 §0.1)
  const { humanRef } = await deps.allocateHumanReference(
    { entityType: INVOICE_HUMAN_REF_ENTITY_TYPE, year },
    db,
  );
  const invoiceId = uuidv7();
  await insertInvoice(
    {
      id: invoiceId,
      humanRef,
      organizationId: ctx.organizationId,
      purpose: input.purpose,
      amount: input.amount,
      currency: input.currency,
      ...(input.subscriptionId !== undefined ? { subscriptionId: input.subscriptionId } : {}),
      actorUserId: ctx.userId,
    },
    db,
  );

  // AUDIT — §9 Financial "platform invoice created" (ENUMERATED — no [ESC-BILL-AUDIT]); actor User/System.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: ctx.organizationId,
      entityType: PLATFORM_INVOICE_ENTITY_TYPE,
      entityId: invoiceId,
      action: PlatformInvoiceAuditAction.CREATED,
      oldValue: null,
      newValue: {
        human_ref: humanRef,
        purpose: input.purpose,
        amount: input.amount,
        status: "issued",
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      invoiceId,
      humanRef,
      status: "issued",
      amount: input.amount,
      currency: input.currency,
    },
  };
}
