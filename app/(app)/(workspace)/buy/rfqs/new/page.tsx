// P-BUY-RFQ Buyer RFQ-create route (Doc-7F · `T-WIZARD`, P-BUY-07). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): the page seeds a BLANK draft. The audit-backed `rfq.create_rfq.v1` /
// `rfq.submit_rfq.v1` writes (Doc-4E §E4.1/§E4.3) are NOT wired today (the GI-02 server data layer + the
// write-wiring milestone are PARKED — Wave 4); spec-document upload is capped by `[ESC-7-API/upload]`. A
// client form surface wires field values + the audit-backed submit at integration; the browser never calls
// a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { RfqCreateView } from "../../_components/rfq-create";

export const metadata = {
  title: "Create RFQ",
};

export default function BuyerRfqCreatePage() {
  return <RfqCreateView data={{ form: {}, activeStep: 0, submission: "idle" }} />;
}
