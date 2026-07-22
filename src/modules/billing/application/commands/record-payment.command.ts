// M7 application (PRIVATE, OUT-OF-WIRE) — `billing.record_payment.v1` (Doc-4I §HB-5.3 / Doc-5I §10/R8).
// A payment-gateway CALLBACK — inbound infra, NOT a tenant wire and NOT a Doc-2 §8 event (R8 fence). System
// actor; no active org context; no slug. Writes/transitions a `platform_payments` row and, on `succeeded`,
// drives the invoice → paid (§HB-5.2 System leg). W3-BILL-10. Consumed in-process by the gateway-callback
// handler (future infra); exposed via contracts for that consumer + tests.
//
// PAYMENT MACHINE (Doc-2 §10.8): `initiated → succeeded|failed|refunded`; `succeeded → refunded`. The FIRST
// callback for a `gateway_ref` CREATES the payment at its outcome status (the `initiated → target` edge
// realized as create-at-target — there is no separate "initiate" contract in the corpus; disclosed).
// IDEMPOTENT on `(invoice_id, gateway_ref, target_status)`: a replay of the same triple is a no-op (no
// duplicate row / audit). Audit = §9 Financial "payment status change" / "refund" (ENUMERATED — no ESC).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN, uuidv7 } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  findPaymentByGatewayRef,
  insertPayment,
  loadInvoiceHead,
  transitionInvoiceStatusCas,
  transitionPaymentStatusCas,
} from "../../infrastructure/data/platform-invoice.repository";
import {
  PLATFORM_INVOICE_ENTITY_TYPE,
  PLATFORM_PAYMENT_ENTITY_TYPE,
  PlatformInvoiceAuditAction,
  PlatformPaymentAuditAction,
} from "../../domain/audit-actions";
import type {
  InvoiceWriteError,
  RecordPaymentInput,
  RecordPaymentOutcome,
} from "../../contracts/types";

const INVALID_INPUT = "billing_payment_invalid_input";
const REFERENCE = "billing_payment_reference";
const ILLEGAL = "billing_payment_illegal_transition"; // STATE

const GATEWAYS = new Set(["sslcommerz", "bkash", "nagad", "bank"]);
const TARGETS = new Set(["succeeded", "failed", "refunded"]);
/** Legal payment edges (Doc-2 §10.8): initiated→{succeeded,failed,refunded}; succeeded→refunded. */
const LEGAL_PAYMENT_EDGES = new Set([
  "initiated|succeeded",
  "initiated|failed",
  "initiated|refunded",
  "succeeded|refunded",
]);

/** Injected M0 services (D7 rule 4) — the audit-write surface (no §8 event — R8). */
export interface RecordPaymentDeps {
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
export function validateRecordPaymentInput(input: RecordPaymentInput): string | null {
  if (typeof input.invoiceId !== "string" || !UUID_PATTERN.test(input.invoiceId)) {
    return "invoice_id must be a valid UUID.";
  }
  if (!GATEWAYS.has(input.gateway)) return "gateway must be a valid payment gateway.";
  if (typeof input.gatewayRef !== "string" || input.gatewayRef.length === 0) {
    return "gateway_ref is required.";
  }
  if (!TARGETS.has(input.targetStatus)) {
    return "target_status must be succeeded, failed, or refunded.";
  }
  return null;
}

/** §9 Financial audit action — "refund" for a refund, else "payment status change". */
function paymentAuditAction(targetStatus: RecordPaymentInput["targetStatus"]): string {
  return targetStatus === "refunded"
    ? PlatformPaymentAuditAction.REFUNDED
    : PlatformPaymentAuditAction.STATUS_CHANGED;
}

/**
 * Record a gateway payment outcome (Doc-4I §HB-5.3). Creates/transitions the `platform_payments` row for
 * `(invoice_id, gateway_ref)`, audits (System), and — on `succeeded` — drives the invoice → paid. Idempotent.
 */
export async function recordPaymentCommand(
  input: RecordPaymentInput,
  deps: RecordPaymentDeps,
  db: DbExecutor = prisma,
): Promise<RecordPaymentOutcome> {
  const invalid = validateRecordPaymentInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // REFERENCE — the invoice must resolve (Doc-4I §HB-5.3 stage-7; System platform scope).
  const invoice = await loadInvoiceHead(input.invoiceId, db);
  if (invoice === null) {
    return err("REFERENCE", REFERENCE, "invoice_id does not resolve.");
  }

  const existing = await findPaymentByGatewayRef(input.invoiceId, input.gatewayRef, db);
  let paymentId: string;
  let priorStatus: string | null;

  if (existing === null) {
    // First callback for this gateway_ref — create the payment at its outcome status (initiated → target).
    paymentId = uuidv7();
    await insertPayment(
      {
        id: paymentId,
        platformInvoiceId: input.invoiceId,
        gateway: input.gateway,
        gatewayRef: input.gatewayRef,
        status: input.targetStatus,
      },
      db,
    );
    priorStatus = null;
  } else {
    // IDEMPOTENT — the same (invoice, gateway_ref, target) callback replayed → no-op (no duplicate audit).
    if (existing.status === input.targetStatus) {
      return { ok: true };
    }
    if (!LEGAL_PAYMENT_EDGES.has(`${existing.status}|${input.targetStatus}`)) {
      return err("STATE", ILLEGAL, "Illegal payment status transition.");
    }
    const affected = await transitionPaymentStatusCas(
      existing.id,
      existing.status as "initiated" | "succeeded" | "failed" | "refunded",
      input.targetStatus,
      db,
    );
    if (affected === 0) {
      // A concurrent callback moved the row. If it reached our target, it is idempotent; else STATE.
      const recheck = await findPaymentByGatewayRef(input.invoiceId, input.gatewayRef, db);
      if (recheck?.status === input.targetStatus) return { ok: true };
      return err("STATE", ILLEGAL, "The payment changed concurrently.");
    }
    paymentId = existing.id;
    priorStatus = existing.status;
  }

  // AUDIT — §9 Financial "payment status change" / "refund" (System; org = the invoice's debtor org).
  await deps.appendAuditRecord(
    {
      actorId: null,
      actorType: "system",
      organizationId: invoice.organizationId,
      entityType: PLATFORM_PAYMENT_ENTITY_TYPE,
      entityId: paymentId,
      action: paymentAuditAction(input.targetStatus),
      oldValue: priorStatus === null ? null : { status: priorStatus },
      newValue: { status: input.targetStatus, gateway: input.gateway },
      ipAddress: null,
      userAgent: null,
    },
    db,
  );

  // On SUCCESS, drive the invoice → paid (§HB-5.2 System paid branch) when it is still issued/overdue.
  // Best-effort: an already-paid/void invoice (idempotent replay / raced) is left as-is (the payment stands).
  if (
    input.targetStatus === "succeeded" &&
    (invoice.status === "issued" || invoice.status === "overdue")
  ) {
    const count = await transitionInvoiceStatusCas(
      {
        invoiceId: input.invoiceId,
        expectedStatus: invoice.status,
        targetStatus: "paid",
        actorUserId: null,
      },
      db,
    );
    if (count === 1) {
      await deps.appendAuditRecord(
        {
          actorId: null,
          actorType: "system",
          organizationId: invoice.organizationId,
          entityType: PLATFORM_INVOICE_ENTITY_TYPE,
          entityId: input.invoiceId,
          action: PlatformInvoiceAuditAction.STATUS_CHANGED,
          oldValue: { status: invoice.status },
          newValue: { status: "paid" },
          ipAddress: null,
          userAgent: null,
        },
        db,
      );
    }
  }

  return { ok: true };
}
