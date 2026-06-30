// P-BUY-08 Buyer RFQ detail route (Doc-7F §3.1/§4.2 · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5 / Doc-7F §3.1).
//
// PRESENTATION-ONLY (this milestone): binds the M3 read `get_rfq`, which is NOT wired today (the GI-02
// server data layer is PARKED until the M3 backend lands — Wave 4). So the page renders the not-found ≡
// genuine-absence state (`data={null}`, byte-identical — Inv #11 / GI-12); no RFQ data is fabricated.
//
// WIRING SEAM (later milestone): resolve the RFQ SERVER-SIDE via `get_rfq(params.rfqId)` (own-org RLS),
// stream behind `SK-DETAIL`, derive the GI-10 permitted-action set server-side, and on a non-disclosed
// id collapse to this same not-found state (no existence leak). The browser never calls a Doc-5 contract
// and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { RfqDetailView } from "./rfq-detail-view";

export const metadata = {
  title: "RFQ",
};

export default function BuyerRfqDetailPage() {
  return <RfqDetailView data={null} />;
}
