// P-BUY-13 Buyer "Routing log / invitations" route (Doc-7F · `T-LISTING`; IA sub-route of the RFQ detail).
// A Next.js SERVER COMPONENT in the `(app)/(buyer)` group (App Router composition only —
// REPOSITORY_STRUCTURE §8): no business logic. The dynamic segment is the OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY: binds the §E6.7 reads (`get_routing_log` + `list_invitations`) through the RFQ
// WORKFLOW ADAPTER SEAM (`_components/rfq-workflow/adapters`). The mock adapter resolves the id against
// the fixture universe — unknown id → `null` → byte-identical not-found (§7.5); a known RFQ that routing
// has not reached returns HONEST EMPTY logs (never fabricated waves).
//
// NON-DISCLOSURE: rows mirror the frozen projections exactly — routing rows carry only
// {routing_mode, executed_at}; invitations carry only {state, delivered_at, responded_at} (NO vendor).
// Only delivered-onward invitation states appear (deferral invisible to the buyer, Doc-3 §4.2). The
// browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { rfqWorkflowData } from "../../../../../_components/rfq-workflow";
import { RoutingInvitationsView } from "./routing-view";

export const metadata = {
  title: "RFQ routing & invitations",
};

export default async function BuyerRfqRoutingPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const data = await rfqWorkflowData.buyer.getRoutingInvitations(rfqId);
  return <RoutingInvitationsView data={data} />;
}
