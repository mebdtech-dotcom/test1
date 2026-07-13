// P-BUY-21 Buyer Purchase order route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// PO is a versioned child document of a Procurement Engagement (Doc-4F §F5.4 `purchase_orders`), so it is
// reached CONTEXTUALLY from its parent engagement. Both segments are OPAQUE ids (Inv #5).
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.get_engagement_document.v1` (Doc-4F §F5.8) for
// the active PO revision, which is NOT wired today (the GI-02 server data layer is PARKED until the M4
// backend lands — Wave 4). A realistic mock stands in for the wired projection (only the frozen-projected
// fields: document_id / doc_kind / human_ref / version_no / is_active_revision / storage_ref). The PO body
// (`content_jsonb`) and any monetary total are NOT projected by the read → none are fabricated.
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent PO AND a non-party engagement both resolve to
// the SAME `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page.
// There is no copy/layout/timing tell distinguishing "hidden because not your party" from "never existed".
//
// NOTE (`ESC-7G-ENG-03`): no `list_engagement_documents` read exists, so an engagement's PO is reachable
// only by its own `document_id`. This route keys the mock on the engagement id for the presentation slice;
// at wiring the page resolves the active PO document for the engagement via the frozen single-doc read.

import { notFound } from "next/navigation";
import { PurchaseOrderView } from "./purchase-order-view";
import type { PurchaseOrderData } from "../../../_components/purchase-order-view-models";

export const metadata = {
  title: "Purchase order",
};

// Realistic industrial-procurement MOCK keyed by opaque engagement id — exactly the fields
// `get_engagement_document` projects for a PO (document_id / doc_kind="po" / human_ref / version_no /
// is_active_revision / storage_ref). `canApprovePo` mirrors the DISTINCT `can_approve_po` slug (Doc-4F
// §F5.4); the server enforces at wiring. No PO body, no amount, no counterparty name are fabricated.
const MOCK_PURCHASE_ORDERS: Record<string, PurchaseOrderData> = {
  eng_01: {
    engagementId: "eng_01",
    engagementRef: "ENG-2026-000124",
    id: "po_01",
    docKind: "po",
    humanRef: "DOC-2026-000091",
    versionNo: 1,
    isActiveRevision: true,
    storageRef: "ops/po/po_01/v1.pdf",
    canApprovePo: true,
  },
  eng_02: {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    id: "po_02",
    docKind: "po",
    humanRef: "DOC-2026-000078",
    versionNo: 2,
    isActiveRevision: true,
    storageRef: "ops/po/po_02/v2.pdf",
    // Viewer without the distinct PO-approval slug — the approval affordance is withheld, not collapsed.
    canApprovePo: false,
  },
};

export default async function BuyerPurchaseOrderPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_PURCHASE_ORDERS[engagementId];
  // Unknown/absent PO OR non-party engagement ⇒ identical collapse (H.9). notFound() → byte-identical
  // not-found.tsx.
  if (!data) {
    notFound();
  }
  return <PurchaseOrderView data={data} />;
}
