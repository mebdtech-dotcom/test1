// P-BUY-08 Buyer RFQ detail route (Doc-7F §3.1/§4.2 · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5 / Doc-7F §3.1).
//
// PRESENTATION-ONLY: binds the M3 read `get_rfq` through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`). The mock adapter resolves the id against the full-lifecycle
// fixture universe; an unknown id resolves to `null` → the byte-identical not-found ≡ genuine-absence
// state (Inv #11 / GI-12) — exactly how the wired read collapses a non-disclosed id (§7.5). The
// `permittedActions` set arrives FROM the adapter (the stand-in for the server-derived GI-10 set).
// The journey strip above the view is ORIENTATION/NAVIGATION only — lifecycle truth stays the state
// chip inside the view (navigation-not-state).
//
// WIRING SEAM (Wave 4): swap the adapter export to the GI-02 server data layer — this page does not
// change. The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 /
// Doc-7C SR3).

import { rfqWorkflowData, RfqJourneyStrip } from "../../../../_components/rfq-workflow";
import { RfqDetailView } from "./rfq-detail-view";

export const metadata = {
  title: "RFQ",
};

export default async function BuyerRfqDetailPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const data = await rfqWorkflowData.buyer.getRfq(rfqId);
  return (
    <RfqDetailView
      data={data}
      journey={data ? <RfqJourneyStrip state={data.state} rfqId={data.id} /> : undefined}
    />
  );
}
