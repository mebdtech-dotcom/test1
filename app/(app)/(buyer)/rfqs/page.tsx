// P-BUY-06 Buyer RFQ list route (Doc-7F §3.1 · `T-LISTING`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): binds the M3 read `list_rfqs`, which is NOT wired today (the GI-02
// server data layer is PARKED until the M3 backend lands — Wave 4). So the page renders the contract-empty
// state (`data={null}` → first-RFQ "Create RFQ" CTA, §II.6); no RFQ data is fabricated.
//
// WIRING SEAM (later milestone): resolve the list SERVER-SIDE via the wired `list_rfqs` (own-org,
// cursor-paginated — GI-03), stream behind `SK-LIST`, and branch errors on `error_class` (GI-05). The
// browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { RfqListView } from "./rfq-list-view";

export const metadata = {
  title: "RFQs",
};

export default function BuyerRfqListPage() {
  return <RfqListView data={null} />;
}
