// P-BUY-24 Buyer Challan route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the `(app)/(buyer)`
// group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. A challan is a
// versioned child document of a Procurement Engagement (Doc-4F §F5.3 `challans`), reached CONTEXTUALLY
// from its parent engagement. The dynamic segment is the OPAQUE engagement id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.get_engagement_document.v1` (Doc-4F §F5.8) for
// the active challan revision, which is NOT wired today (PARKED — Wave 4). A realistic mock stands in over
// the frozen-projected fields (document_id / doc_kind="challan" / human_ref / version_no / is_active_
// revision / storage_ref). The challan body (`content_jsonb`) is NOT projected by the read → not fabricated.
// page_inventory's `get_challan` is a LABEL — the real read is `get_engagement_document` (doc_kind=challan).
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent challan AND a non-party engagement both resolve
// to the SAME `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page.

import { notFound } from "next/navigation";
import { ChallanView } from "./challan-view";
import type { ChallanData } from "../../../_components/challan-view-models";

export const metadata = {
  title: "Challan",
};

// Realistic industrial-procurement MOCK keyed on opaque engagement id — exactly the fields
// `get_engagement_document` projects for a challan (document_id / doc_kind="challan" / human_ref /
// version_no / is_active_revision / storage_ref). No delivery line items / quantities are fabricated.
const MOCK_CHALLANS: Record<string, ChallanData> = {
  eng_02: {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    id: "chl_01",
    docKind: "challan",
    humanRef: "DOC-2026-000112",
    versionNo: 2,
    isActiveRevision: true,
    storageRef: "ops/challan/chl_01/v2.pdf",
  },
  eng_01: {
    engagementId: "eng_01",
    engagementRef: "ENG-2026-000124",
    id: "chl_02",
    docKind: "challan",
    humanRef: "DOC-2026-000104",
    versionNo: 1,
    isActiveRevision: true,
    storageRef: "ops/challan/chl_02/v1.pdf",
  },
};

export default async function BuyerChallanPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_CHALLANS[engagementId];
  // Unknown/absent OR non-party ⇒ identical collapse (H.9). notFound() → byte-identical not-found.tsx.
  if (!data) {
    notFound();
  }
  return <ChallanView data={data} />;
}
