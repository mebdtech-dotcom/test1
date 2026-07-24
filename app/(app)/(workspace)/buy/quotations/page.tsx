// Buyer sidebar IA (BX-04) — "Received Quotes" (Quotations group). A Next.js SERVER COMPONENT: App Router
// composition only, no business logic (REPOSITORY_STRUCTURE §8).
//
// ────────────────────────────────────────────────────────────────────────────────────────────────
// CONTRACT STATUS — READ BEFORE WIRING
// ────────────────────────────────────────────────────────────────────────────────────────────────
// The frozen corpus has NO cross-RFQ quotation list read: quotations exist only per-RFQ
// (`list_quotations_for_rfq`, P-BUY-09) or per-document (`get_quotation`, P-BUY-14). The buyer-org-wide
// aggregate is the OPEN escalation `ESC-BUY-QUOTES-LIST` (esc_registry.md; additive Doc-5E patch, human
// Board — BOARD-PACKET-BUYER-FE-CONTRACT-GAPS_v1.0 row 1, still unruled).
//
// This page therefore binds an EXPLICIT SEAM (`rfqWorkflowData.buyer.listOrgQuotations`) and mints
// nothing. Today the seam resolves through the mock adapter, exactly as every other RFQ-workflow page
// does. When the Board rules and the read is minted, the seam swaps in `adapters/index.ts` and this page
// does not change. If the seam has no authoritative integration it returns `null` and the surface renders
// a visible, recoverable error — it never fabricates rows.
//
// The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3):
// the read runs here, in a Server Component, under the server-validated active organization.
//
// URL STATE: `?search=` · `?state=` · `?rfq=` are parsed and VALIDATED here against the server-supplied
// facet set, then the rows are filtered server-side. A hand-edited or stale URL degrades to "no filter"
// rather than to a misleading empty list, and can never widen scope.

import { rfqWorkflowData } from "../../../_components/rfq-workflow";
import { ReceivedQuotesView } from "../_components/quotations/received/received-quotes-view";
import { ReceivedQuotesError } from "../_components/quotations/received/received-quotes-states";
import {
  parseReceivedQuotesQuery,
  filterReceivedQuotes,
} from "../_components/quotations/query-state";

export const metadata = {
  title: "Received Quotes",
};

export default async function ReceivedQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string | string[];
    state?: string | string[];
    rfq?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const data = await rfqWorkflowData.buyer.listOrgQuotations();

  // `null` = the read failed / no authoritative integration. This is NOT emptiness: an empty org scope is
  // `items: []`, which the view renders as the first-run "awaiting responses" state.
  if (!data) return <ReceivedQuotesError />;

  const query = parseReceivedQuotesQuery(
    params,
    data.rfqFacets.map((facet) => facet.rfqId),
  );
  const rows = filterReceivedQuotes(data.items, query);

  return <ReceivedQuotesView data={data} query={query} rows={rows} />;
}
