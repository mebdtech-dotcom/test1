// Comparative Statement (CS) route — TEMPORARY (WP-2; freeze COMPARE_SHEET_UX_FREEZE header v1.0
// §3/§4.2 MAJOR-1). This route exists only for the mock-era implementation and will migrate to
// the canonical Comparative Statement document route after ESC-CS-DOCKIND approval. The CS is a
// generated procurement document derived from the buyer's Workspace selection — not an RFQ
// sub-view and not an independent business entity until that Board ruling.
//
// A Next.js SERVER COMPONENT in the `(app)/(buyer)` group (routing & composition only). The
// dynamic segment is the OPAQUE RFQ id (Inv #5). PRESENTATION-ONLY: the document projects the
// SAME M3 read the Workspace binds (`rfq.get_comparison_statement.v1`, Doc-4E §E8.6) through the
// RFQ WORKFLOW ADAPTER SEAM — mock line items until the ESC-CS-LINEITEMS dev-doc schema lands.
// `?sel=` carries the ephemeral W-1 selection (2–5 quotation ids) via native GET navigation;
// absent/invalid → the full disclosed set. Unknown/undisclosed id → `null` → the byte-identical
// not-found (Inv #11 / GI-12).
//
// GOVERNANCE: "Draft Reference" only — no CS- series until ESC-CS-REF (MAJOR-2/MINOR-1);
// evaluative sections are buyer-authored with visible provenance (R6, freeze §4.1); Excel export
// is a gated stub (ESC-CS-EXPORT); printing is the browser's own print-to-PDF (user-agent).

import { rfqWorkflowData } from "../../../../../_components/rfq-workflow";
import { ComparativeStatementView } from "../../../_components/comparative-statement";
import "../../../_components/comparative-statement/comparative-statement.css";

export const metadata = {
  title: "Comparative Statement",
};

export default async function BuyerComparativeStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ sel?: string | string[] }>;
}) {
  const { rfqId } = await params;
  const { sel } = await searchParams;
  const selection = sel === undefined ? undefined : Array.isArray(sel) ? sel : [sel];
  const data = await rfqWorkflowData.buyer.getComparativeStatement(rfqId, selection);
  return <ComparativeStatementView data={data} />;
}
