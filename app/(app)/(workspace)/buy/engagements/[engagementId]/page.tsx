// P-BUY-20 Buyer Engagement detail route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE engagement id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): binds the M4 read `ops.get_engagement.v1` (Doc-4F §F5.8), which is
// NOT wired today (the GI-02 server data layer is PARKED until the M4 backend lands — Wave 4). A realistic
// mock stands in for the wired projection (only the frozen-projected fields).
//
// NON-DISCLOSURE (Inv #11 / GI-12 · H.9): an unknown/absent id AND a non-party id both resolve to the SAME
// `notFound()` → the co-located `not-found.tsx` renders a byte-identical "not available" page. There is no
// copy/layout/timing tell that would distinguish "hidden because not your party" from "never existed".

import { notFound } from "next/navigation";
import { EngagementDetailView } from "./engagement-detail-view";
import type { EngagementDetailData } from "../../_components/engagement-detail-view-models";

export const metadata = {
  title: "Engagement",
};

// Realistic industrial-procurement MOCK keyed by opaque id — exactly the fields `get_engagement` projects
// and surfaces (id / human_ref / status / award_value_snapshot + currency / vendor_profile_id ref). No
// vendor name, no rfq_id, no document list are fabricated (not projected). Currency is carried per value.
const MOCK_ENGAGEMENTS: Record<string, EngagementDetailData> = {
  eng_01: {
    id: "eng_01",
    humanRef: "ENG-2026-000124",
    state: "open",
    awardValue: { amount: 1792000, currency: "BDT" },
    vendorProfileRef: "vp_8f2a1c",
  },
  eng_02: {
    id: "eng_02",
    humanRef: "ENG-2026-000121",
    state: "in_delivery",
    awardValue: { amount: 3450000, currency: "BDT" },
    vendorProfileRef: "vp_3b90d7",
  },
  eng_04: {
    id: "eng_04",
    humanRef: "ENG-2026-000112",
    state: "completed",
    awardValue: { amount: 985000, currency: "BDT" },
    vendorProfileRef: "vp_c14e55",
  },
};

export default async function BuyerEngagementDetailPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const data = MOCK_ENGAGEMENTS[engagementId];
  // Unknown/absent OR non-party ⇒ identical collapse (H.9). notFound() → byte-identical not-found.tsx.
  if (!data) {
    notFound();
  }
  return <EngagementDetailView data={data} />;
}
