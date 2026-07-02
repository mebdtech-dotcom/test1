// P-BUY-22 Buyer Payments route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the `(app)/(buyer)`
// group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. Payment records are
// children of a Procurement Engagement (Doc-4F §F5.6 `payment_records`), reached CONTEXTUALLY from the
// parent engagement. The dynamic segment is the OPAQUE engagement id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): the writes `ops.record_payment.v1` / `ops.confirm_payment.v1`
// (Doc-4F §F5.6) are NOT wired (PARKED — Wave 4), and no `list_payment_records` read is frozen (the ENG-03
// enumeration-gap class). A realistic mock stands in over the frozen `payment_records` field shape; at
// wiring the records resolve via the engagement's child read, never a coined list contract.
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent OR non-party engagement resolves to the SAME
// `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page.

import { notFound } from "next/navigation";
import { PaymentsView } from "./payments-view";
import type { PaymentsData } from "../../../_components/payment-view-models";

export const metadata = {
  title: "Payments",
};

// Realistic industrial-procurement MOCK keyed on opaque engagement id — only the frozen `payment_records`
// fields (amount+currency / paid_at / method_note / status). `canRecordPayments` and `canApprovePayment`
// mirror the DISTINCT Doc-2 §7 slugs; the server enforces at wiring. No funds are moved anywhere (DF-6).
const MOCK_PAYMENTS: Record<string, PaymentsData> = {
  eng_02: {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    canRecordPayments: true,
    canApprovePayment: true,
    items: [
      {
        id: "pay_01",
        amount: { amount: 1200000, currency: "BDT" },
        paidAt: "2026-06-18",
        methodNote: "Bank transfer — City Bank, ref TT-88213",
        status: "confirmed",
      },
      {
        id: "pay_02",
        amount: { amount: 800000, currency: "BDT" },
        paidAt: "2026-06-29",
        methodNote: "Bank transfer — BRAC Bank, ref TT-90114",
        status: "recorded",
      },
    ],
  },
  eng_01: {
    engagementId: "eng_01",
    engagementRef: "ENG-2026-000124",
    // Recorder without the DISTINCT confirm slug — the per-row Confirm affordance is withheld, not collapsed.
    canRecordPayments: true,
    canApprovePayment: false,
    items: [
      {
        id: "pay_03",
        amount: { amount: 500000, currency: "BDT" },
        paidAt: "2026-06-30",
        methodNote: "Advance — cheque #004521",
        status: "recorded",
      },
    ],
  },
  eng_04: {
    engagementId: "eng_04",
    engagementRef: "ENG-2026-000112",
    canRecordPayments: true,
    canApprovePayment: true,
    items: [],
  },
};

export default async function BuyerPaymentsPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_PAYMENTS[engagementId];
  // Unknown/absent OR non-party ⇒ identical collapse (H.9). notFound() → byte-identical not-found.tsx.
  if (!data) {
    notFound();
  }
  return <PaymentsView data={data} />;
}
