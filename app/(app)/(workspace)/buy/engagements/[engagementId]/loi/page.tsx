// P-BUY-21 Buyer Letter of intent route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// LOI is a versioned child document of a Procurement Engagement — the same `engagement_documents` family
// as the PO (Doc-4F §F5.4) — so it is reached CONTEXTUALLY from its parent engagement. Both segments are
// OPAQUE ids (Inv #5). Sibling of `../po` (WP-1, buyer_journey_v1.0.md — owner-approved 2026-07-06).
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.get_engagement_document.v1` (Doc-4F §F5.8) for
// the active LOI revision, which is NOT wired today (the GI-02 server data layer is PARKED until the M4
// backend lands — Wave 4). A realistic mock stands in for the wired projection (only the frozen-projected
// fields: document_id / doc_kind / human_ref / version_no / is_active_revision / storage_ref). The LOI body
// (`content_jsonb`) is NOT projected by the read → none is fabricated.
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent LOI AND a non-party engagement both resolve to
// the SAME `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page.
// There is no copy/layout/timing tell distinguishing "hidden because not your party" from "never existed".
//
// NOTE (`ESC-7G-ENG-03`): no `list_engagement_documents` read exists, so an engagement's LOI is reachable
// only by its own `document_id`. This route keys the mock on the engagement id for the presentation slice;
// at wiring the page resolves the active LOI document for the engagement via the frozen single-doc read.

import { notFound } from "next/navigation";
import { LetterOfIntentView } from "./loi-view";
import type { LetterOfIntentData } from "../../../_components/loi-view-models";

export const metadata = {
  title: "Letter of intent",
};

// Realistic industrial-procurement MOCK keyed by opaque engagement id — exactly the fields
// `get_engagement_document` projects for an LOI (document_id / doc_kind="loi" / human_ref / version_no /
// is_active_revision / storage_ref). An LOI is typically issued BEFORE the PO, so its DOC- sequence sits
// below the sibling PO mock's. No LOI body, no amount, no counterparty name are fabricated.
const MOCK_LETTERS_OF_INTENT: Record<string, LetterOfIntentData> = {
  eng_01: {
    engagementId: "eng_01",
    engagementRef: "ENG-2026-000124",
    id: "loi_01",
    docKind: "loi",
    humanRef: "DOC-2026-000066",
    versionNo: 1,
    isActiveRevision: true,
    storageRef: "ops/loi/loi_01/v1.pdf",
  },
  eng_02: {
    engagementId: "eng_02",
    engagementRef: "ENG-2026-000121",
    id: "loi_02",
    docKind: "loi",
    humanRef: "DOC-2026-000059",
    // Revised once (Inv #8): issue = v1, a revise appended v2 with a mandatory `revision_reason`;
    // v1 is retained as a superseded revision — this read models the ACTIVE one.
    versionNo: 2,
    isActiveRevision: true,
    storageRef: "ops/loi/loi_02/v2.pdf",
  },
};

export default async function BuyerLetterOfIntentPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_LETTERS_OF_INTENT[engagementId];
  // Unknown/absent LOI OR non-party engagement ⇒ identical collapse (H.9). notFound() → byte-identical
  // not-found.tsx.
  if (!data) {
    notFound();
  }
  return <LetterOfIntentView data={data} />;
}
