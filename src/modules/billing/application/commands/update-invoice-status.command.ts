// M7 application (PRIVATE) — `billing.update_invoice_status.v1` (Doc-4I §HB-5.2 / Doc-5I §8
// `POST /billing/invoices/{invoice_id}/update-invoice-status` · 200). W3-BILL-9. ORG-SCOPED audited write,
// ACTOR-BRANCHED: the USER leg (`void`; org self-serve; `can_manage_billing`; WIRED — R11) and the SYSTEM
// leg (`paid`/`overdue`; payment-success / dunning; no slug; in-process). Transitions `platform_invoices.
// status` under optimistic concurrency (`expected_status`) in the ONE tenant tx the composition supplies.
//
// STATE machine (Doc-2 §5.7/§10.8): `issued → paid|overdue|void`; `overdue → paid|void`; terminal
// `paid`/`void` are settled → STATE. `expected_status` mismatch at the CAS → CONFLICT (lost race). Audit =
// [ESC-BILL-AUDIT] (invoice status change not §9-enumerated; nearest §9 Financial by pointer — §HB-5.2 §9).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  loadInvoiceHead,
  transitionInvoiceStatusCas,
} from "../../infrastructure/data/platform-invoice.repository";
import {
  PLATFORM_INVOICE_ENTITY_TYPE,
  PlatformInvoiceAuditAction,
} from "../../domain/audit-actions";
import type {
  InvoiceWriteError,
  UpdateInvoiceStatusInput,
  UpdateInvoiceStatusOutcome,
} from "../../contracts/types";

const INVALID_INPUT = "billing_invoice_invalid_input";
const FORBIDDEN = "billing_invoice_forbidden";
const NOT_FOUND = "billing_invoice_not_found";
const NOT_TRANSITIONABLE = "billing_invoice_illegal_transition"; // STATE
const LOST_RACE = "billing_invoice_conflict"; // CONFLICT
const REFERENCE = "billing_invoice_reference";

const TARGETS = new Set(["paid", "overdue", "void"]);
const EXPECTEDS = new Set(["issued", "overdue"]);
const TERMINAL = new Set(["paid", "void"]);
/** Legal `expected_status → target_status` edges (Doc-2 §10.8): issued→{paid,overdue,void}; overdue→{paid,void}. */
const LEGAL_EDGES = new Set([
  "issued|paid",
  "issued|overdue",
  "issued|void",
  "overdue|paid",
  "overdue|void",
]);

/** The server-resolved request context (from the composition — never client input). */
export interface UpdateInvoiceStatusContext {
  /** `user` = the `void` wired leg; `system` = the `paid`/`overdue` in-process leg. */
  actorType: "user" | "system";
  userId: string | null;
  /** The active org (User-void branch — the debtor-org scope). System leg: n/a. */
  organizationId?: string;
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface UpdateInvoiceStatusDeps {
  appendAuditRecord: AppendAuditRecord;
}

function err(
  errorClass: InvoiceWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: InvoiceWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). */
export function validateUpdateInvoiceStatusInput(input: UpdateInvoiceStatusInput): string | null {
  if (typeof input.invoiceId !== "string" || !UUID_PATTERN.test(input.invoiceId)) {
    return "invoice_id must be a valid UUID.";
  }
  if (!TARGETS.has(input.targetStatus)) return "target_status must be paid, overdue, or void.";
  if (!EXPECTEDS.has(input.expectedStatus)) return "expected_status must be issued or overdue.";
  return null;
}

/**
 * Transition an invoice's status (Doc-4I §HB-5.2). Loads the head, checks the state machine, then a
 * CAS on `expected_status`; STATE (illegal/terminal) vs CONFLICT (lost race) distinguished; audits.
 */
export async function updateInvoiceStatusCommand(
  input: UpdateInvoiceStatusInput,
  ctx: UpdateInvoiceStatusContext,
  deps: UpdateInvoiceStatusDeps,
  db: DbExecutor = prisma,
): Promise<UpdateInvoiceStatusOutcome> {
  const invalid = validateUpdateInvoiceStatusInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // ACTOR/TARGET branch (Doc-4I §HB-5.2): `void` is the User (org) branch; `paid`/`overdue` the System branch.
  if (ctx.actorType === "user" && input.targetStatus !== "void") {
    return err("AUTHORIZATION", FORBIDDEN, "an organization may only void its own invoice.");
  }
  if (ctx.actorType === "system" && input.targetStatus === "void") {
    return err("AUTHORIZATION", FORBIDDEN, "void is an organization-only transition.");
  }
  // AUTHZ — the User (void) leg requires `can_manage_billing`.
  if (ctx.actorType === "user" && ctx.canManageBilling !== true) {
    return err("AUTHORIZATION", FORBIDDEN, "can_manage_billing is required to void an invoice.");
  }

  // SCOPE / REFERENCE — load the head. User branch: absent/cross-org → NOT_FOUND (protected-fact collapse);
  // System branch: absent → REFERENCE (platform-scope definitive negative).
  const head = await loadInvoiceHead(input.invoiceId, db);
  if (head === null) {
    return ctx.actorType === "user"
      ? err("NOT_FOUND", NOT_FOUND, "No such invoice for this organization.")
      : err("REFERENCE", REFERENCE, "invoice_id does not resolve.");
  }
  if (ctx.actorType === "user" && head.organizationId !== ctx.organizationId) {
    return err("NOT_FOUND", NOT_FOUND, "No such invoice for this organization.");
  }

  // STATE — a settled (terminal) invoice cannot transition; the requested edge must be legal.
  if (TERMINAL.has(head.status)) {
    return err("STATE", NOT_TRANSITIONABLE, "The invoice is already settled (paid/void).");
  }
  if (!LEGAL_EDGES.has(`${input.expectedStatus}|${input.targetStatus}`)) {
    return err("STATE", NOT_TRANSITIONABLE, "Illegal invoice status transition.");
  }

  // CAS — transition only while STILL at `expected_status` (+ debtor-org on the User branch). count===0 ⇒
  // a lost race (the row left `expected_status`, e.g. paid concurrently) → CONFLICT.
  const affected = await transitionInvoiceStatusCas(
    {
      invoiceId: input.invoiceId,
      expectedStatus: input.expectedStatus,
      targetStatus: input.targetStatus,
      ...(ctx.actorType === "user" ? { organizationId: ctx.organizationId } : {}),
      actorUserId: ctx.userId,
    },
    db,
  );
  if (affected === 0) {
    return err("CONFLICT", LOST_RACE, "The invoice changed concurrently; re-read and retry.");
  }

  // AUDIT — [ESC-BILL-AUDIT] invoice status change; actor User/System; org = the invoice's debtor org.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: ctx.actorType,
      organizationId: head.organizationId,
      entityType: PLATFORM_INVOICE_ENTITY_TYPE,
      entityId: input.invoiceId,
      action: PlatformInvoiceAuditAction.STATUS_CHANGED,
      oldValue: { status: input.expectedStatus },
      newValue: { status: input.targetStatus },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { invoiceId: input.invoiceId, status: input.targetStatus } };
}
