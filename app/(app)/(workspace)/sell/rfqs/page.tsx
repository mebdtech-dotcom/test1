// S1 Quotation Home + S2 Invitation Inbox (companion §6.2 → (app)/rfqs), NOW ALSO the merged Pipeline
// board (Cluster #1 · Team-1 build order F1–F7 · closure record §2). RECEIVED-ONLY throughout: every
// lens renders only invitations delivered to this vendor (inbox read = rfq.list_invitations vendor leg;
// pipeline read = ops.list_leads.v1 — the SAME received invitations under a private-CRM lens); there is
// no browse/discovery of un-invited RFQs (DP1/BE-1).
//
// TWO LENSES, ONE SURFACE (Cluster #1 merge). The former standalone "Leadboard" (`/sell/leads`) folded
// into this page as an Inbox ⇄ Pipeline view toggle; `/sell/leads` now 308-redirects here
// (`next.config.ts`). The lens is URL-DRIVEN via the allowlisted `?view=inbox|board` param (default
// inbox) — navigation, not state (`RfqViewToggle`, mirroring the `?state=` chips):
//   • INBOX (`view=inbox` / absent) — the "RFQ Workspace" reference: a header, the vendor pipeline STAT
//     CARDS, and a single framed panel (filter → invitation list → quota footer). Own-quotation-state
//     `?state=` filter applies here only.
//   • PIPELINE (`view=board`) — the private-CRM stage board (List/Board sub-views via `LeadPipeline`).
//     `?state=` is IGNORED here (quotation-state is meaningless on the lead board — F2). NO stat band
//     and NO QuotaMeter decorate this lens (F6: no lead-derived aggregate enters the shared header; the
//     board keeps only its non-numeric column links). Its empties are the views' own byte-locked copies
//     (F5 — the toggle DELEGATES; it coins no destination-level empty).
//
// PRESENTATION-ONLY: inbox data arrives through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`); the journey-bucket counts + quota are adapter-supplied (own
// facts only — never client-computed, R7). At wiring the seam swaps to the GI-02 server data layer and
// this page does not change. Uses the platform shell PageHeader.
//
// URL PARAMS (allowlisted, the documents-hub convention — anything else ⇒ default):
//  • `?view=` — inbox | board (default inbox). `RfqViewToggle` / `parseRfqView`.
//  • `?state=` — own-quotation-state filter (draft | submitted; frozen Doc-4M tokens), INBOX LENS ONLY.
//    The vendor sidebar's "Make Offer" / "Saved Offers" entries and the documents-hub "Offers" link
//    deep-link here; the URL is the single source of truth (the chips are plain Links — no client
//    filter state). Filters the vendor's OWN quotation state only (ND-2/ND-3 safe). The filtered-empty
//    copy below is derived from the FILTER alone (never from a matching outcome), so the inbox's
//    canonical unfiltered empty state stays byte-identical ([ESC-7B-EMPTY-LOCK]).
import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/frontend/components/empty-state";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { PageHeader } from "../../../_components/shell";
import { rfqWorkflowData } from "../../../_components/rfq-workflow";
import { LeadBoard, LeadList, LeadPipeline } from "../../../_components/vendor/leads";
import {
  InboxStateFilter,
  InvitationInbox,
  QuotaMeter,
  RfqInboxTable,
  RfqStatCards,
  RfqViewToggle,
  parseInboxStateFilter,
  parseRfqView,
  INBOX_STATE_FILTER_LABELS,
} from "../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "RFQs & Quotations" };

const INBOX_DESCRIPTION =
  "Invitations buyers have sent you, and the quotations you author in response.";
const PIPELINE_DESCRIPTION =
  "Your private pipeline of received RFQ invitations, on a stage board. Leads appear automatically — you don't create them.";

export default async function RfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const view = parseRfqView(sp.view);
  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQs"
        description={view === "board" ? PIPELINE_DESCRIPTION : INBOX_DESCRIPTION}
        actions={
          // Design's "Match preferences" affordance — configures which categories route
          // invitations here. Presentation-only until the M2/M3 preference read is wired.
          <Button variant="outline" disabled>
            <SlidersHorizontal aria-hidden className="size-4" />
            Match preferences
          </Button>
        }
      />
      <RfqViewToggle active={view} />
      {view === "board" ? (
        // PIPELINE lens — reuses the leads presentation set under the toggle (F3). No stat band, no
        // QuotaMeter (F6). `LeadPipeline` owns the List/Board sub-views and their byte-locked empties (F5).
        <LeadPipeline list={<LeadList />} board={<LeadBoard />} defaultView="board" />
      ) : (
        // INBOX lens — the received-only invitation workspace. `?state=` applies only here.
        <InboxView state={sp.state} />
      )}
    </div>
  );
}

/** The received-only invitation inbox (the S1/S2 workspace). Fetches only when the inbox lens is
 *  active, so the pipeline lens never pulls (or renders) an inbox aggregate. */
async function InboxView({ state }: { state?: string }) {
  const activeState = parseInboxStateFilter(state);
  const [items, quota, buckets] = await Promise.all([
    rfqWorkflowData.vendor.listInbox(),
    rfqWorkflowData.vendor.getQuota(),
    rfqWorkflowData.vendor.getPipelineSummary(),
  ]);
  const visible = activeState
    ? items.filter((item) => item.quotation_state === activeState)
    : items;
  return (
    <>
      <RfqStatCards buckets={buckets} />
      <Card className="overflow-hidden">
        {/* Toolbar — the vendor's own-quotation-state filter (URL-driven; navigation, not state). */}
        <div className="border-b border-border px-4 py-3">
          <InboxStateFilter active={activeState} />
        </div>
        {/* Body — the received-only invitation list. Populated ⇒ the reference table; filtered-empty ⇒
            the filter-derived copy; unfiltered-empty ⇒ the byte-locked canonical empty ([ESC-7B-EMPTY-LOCK],
            owned by InvitationInbox so the one copy never drifts). */}
        {activeState && visible.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={`No ${INBOX_STATE_FILTER_LABELS[activeState].toLowerCase()}`}
              description={
                activeState === "draft"
                  ? "Offers you are still drafting appear here. Clear the filter to see every invitation."
                  : "Offers you have submitted appear here. Clear the filter to see every invitation."
              }
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-4">
            <InvitationInbox items={visible} unframed />
          </div>
        ) : (
          <RfqInboxTable items={visible} />
        )}
        {/* Footer — the numeric submission quota (Doc-5I entitlement; never a plan name — Inv #10).
            INBOX LENS ONLY (F6): the quota is a quotation-submission entitlement, not a pipeline figure. */}
        <div className="border-t border-border px-4 py-3">
          <QuotaMeter quota={quota} />
        </div>
      </Card>
    </>
  );
}
