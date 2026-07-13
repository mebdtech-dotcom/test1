// P-BUY-11 Buyer "RFQ version history" route (Doc-7F · `T-DETAILS`; IA sub-route of the RFQ detail). A
// Next.js SERVER COMPONENT in the `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE
// §8): no business logic. The dynamic segment is the OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY: binds the `rfq.get_rfq_version` read (§E4.8) through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`). The mock adapter resolves the id against the fixture universe —
// an unknown id → `null` → the byte-identical not-found (§7.5 / GI-12); a known RFQ returns its immutable
// revision chain (`rfq_versions` is read-only, append-only — Inv #8). Version selection is native GET nav
// (`?v=`) — no client state. The browser never calls a Doc-5 contract and never sets
// `Iv-Active-Organization` (Inv #5 / Doc-7C SR3). Swap the adapter at Wave 4 — this page does not change.

import { rfqWorkflowData } from "../../../../../_components/rfq-workflow";
import { RfqVersionsView } from "./rfq-versions-view";

export const metadata = {
  title: "RFQ version history",
};

export default async function BuyerRfqVersionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { rfqId } = await params;
  const sp = await searchParams;
  // Accept only a positive integer within the disclosed set; anything else falls back to the current
  // revision inside the view. Never trust the raw query.
  const parsed = Number.parseInt(sp.v ?? "", 10);
  const selectedVersionNo = Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;

  const data = await rfqWorkflowData.buyer.getRfqVersions(rfqId);
  return <RfqVersionsView data={data} selectedVersionNo={selectedVersionNo} />;
}
