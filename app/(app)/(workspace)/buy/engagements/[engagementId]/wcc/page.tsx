// P-BUY-25 Buyer WCC route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the `(app)/(buyer)` group
// (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. A WCC is a versioned child
// document of a Procurement Engagement (Doc-4F §F5.4 `work_completion_certificates`), reached CONTEXTUALLY
// from its parent engagement. The dynamic segment is the OPAQUE engagement id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.get_engagement_document.v1` (Doc-4F §F5.8) for
// the active WCC revision, which is NOT wired today (PARKED — Wave 4). A realistic mock stands in over the
// frozen-projected fields (document_id / doc_kind="wcc" / human_ref / version_no / is_active_revision /
// storage_ref). The WCC body (`content_jsonb`) is NOT projected → not fabricated. page_inventory's
// `get_wcc` is a LABEL — the real read is `get_engagement_document` (doc_kind=wcc).
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent WCC AND a non-party engagement both resolve to
// the SAME `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page.

import { notFound } from "next/navigation";
import { WccView } from "./wcc-view";
import type { WccData } from "../../../_components/wcc-view-models";

export const metadata = {
  title: "Work completion certificate",
};

// Realistic industrial-procurement MOCK keyed on opaque engagement id — exactly the fields
// `get_engagement_document` projects for a WCC (document_id / doc_kind="wcc" / human_ref / version_no /
// is_active_revision / storage_ref). No WCC body / scope-of-work is fabricated.
const MOCK_WCCS: Record<string, WccData> = {
  eng_04: {
    engagementId: "eng_04",
    engagementRef: "ENG-2026-000112",
    id: "wcc_01",
    docKind: "wcc",
    humanRef: "DOC-2026-000133",
    versionNo: 1,
    isActiveRevision: true,
    storageRef: "ops/wcc/wcc_01/v1.pdf",
  },
  eng_02: {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    id: "wcc_02",
    docKind: "wcc",
    humanRef: "DOC-2026-000129",
    versionNo: 2,
    isActiveRevision: true,
    storageRef: "ops/wcc/wcc_02/v2.pdf",
  },
};

export default async function BuyerWccPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_WCCS[engagementId];
  // Unknown/absent OR non-party ⇒ identical collapse (H.9). notFound() → byte-identical not-found.tsx.
  if (!data) {
    notFound();
  }
  return <WccView data={data} />;
}
