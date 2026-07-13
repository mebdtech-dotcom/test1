// S2 Invitation Inbox (companion §6.2/§6.7) — read = `rfq.list_invitations` (vendor leg). RECEIVED-ONLY:
// the inbox renders ONLY invitations delivered to this vendor; there is NO browse/discovery of
// un-invited RFQs (DP1/BE-1) — exclusion never reaches the client, so it cannot leak.
//
// BYTE-EQUIVALENCE (Invariant 11 / GR11 / CHK-7-040, load-bearing): the empty state is ONE canonical
// copy derived from the list type alone — byte-identical for a never-matched vendor and a blacklisted
// one. No counts/totals are shown (cursor lists only, §7.5); no "of N", no rank, no competitor count,
// no "why not invited" (ND-2/ND-4). Accept/Decline live on the detail (S3) via `respond_to_invitation`;
// here they are read rows that link to the detail. Presentation-only; RSC-friendly.
//
// FE-VEN-05 delta (information hierarchy / response-window presentation): rows needing a response
// (`invitation_state === "delivered"`) sort ahead of already-responded ones, and within that group the
// most time-sensitive window (`window_urgency`) sorts first — fulfilling the promise already made by
// `QuotationHomeSummary` ("appear at the top of your inbox"). Pure client-side reordering of the given
// rows — no new field, no count, no fabricated total (GI-03); the group labels carry no numbers.
//
// FE-VEN-06 delta (P-VND-17 Quotations — co-located with P-VND-15 on this same S1/S2 page): each row
// now also renders the vendor's OWN quotation state (`QuotationStateChip`, frozen Doc-4M) when one
// exists on that RFQ — visibility-gated, per page_inventory's P-VND-17 binding. Closes the gap where
// "Quotations" is its own left-nav destination but the merged listing showed no quotation-state signal.
// Own-record fact only (ND-2/ND-3) — never another vendor's quotation/state.
//
// Row rendering (state chips + link structure) was PROMOTED to the Doc-7B kit as `RfqCard` (Shared
// Platform Component Registry §4.2 CTO override — 2026-07-03). This module keeps ONLY list composition
// (sort/group by information hierarchy) and adapts each `InboxItemView` to the kit's `RfqCardVM` —
// presentation (the card) and transformation (the mapping) stay in separate files.
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { RfqCard, type RfqCardVM } from "@/frontend/components/rfq";
import type { InboxItemView, WindowUrgency } from "./types";

export interface InvitationInboxProps {
  items?: InboxItemView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

const URGENCY_RANK: Record<WindowUrgency, number> = { imminent: 0, soon: 1, normal: 2 };
const UNRANKED_URGENCY = 3;

function needsResponse(item: InboxItemView): boolean {
  return item.invitation_state === "delivered";
}

/** Stable sort: needs-response first, then most time-sensitive window first within that group. */
function byInformationHierarchy(items: InboxItemView[]): InboxItemView[] {
  return [...items].sort((a, b) => {
    const aNeeds = needsResponse(a) ? 0 : 1;
    const bNeeds = needsResponse(b) ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    if (aNeeds !== 0) return 0;
    const aRank = a.window_urgency ? URGENCY_RANK[a.window_urgency] : UNRANKED_URGENCY;
    const bRank = b.window_urgency ? URGENCY_RANK[b.window_urgency] : UNRANKED_URGENCY;
    return aRank - bRank;
  });
}

/** The only transformation this module owns: `InboxItemView` (this workspace's read shape) → the kit's
 *  `RfqCardVM` (presentation-only). Field names are identical today; kept as an explicit mapping (not a
 *  cast) so the two types are free to diverge without breaking the card. */
function toRfqCardVM(item: InboxItemView): RfqCardVM {
  return {
    rfq_id: item.rfq_id,
    rfq_human_ref: item.rfq_human_ref,
    rfq_summary: item.rfq_summary,
    rfq_state: item.rfq_state,
    window_state: item.window_state,
    window_deadline_label: item.window_deadline_label,
    window_urgency: item.window_urgency,
    invitation_state: item.invitation_state,
    quotation_state: item.quotation_state,
    unread_clarification: item.unread_clarification,
  };
}

function InvitationRow({ item, basePath }: { item: InboxItemView; basePath: string }) {
  return (
    <li>
      <RfqCard item={toRfqCardVM(item)} href={`${basePath}/rfqs/${item.rfq_id}`} />
    </li>
  );
}

export function InvitationInbox({ items, basePath = "/sell" }: InvitationInboxProps) {
  if (!items || items.length === 0) {
    // The single canonical empty copy (fixed per list type — [ESC-7B-EMPTY-LOCK]). It asserts NOTHING
    // about this vendor's matching outcome; it is identical for excluded ≡ never-matched ≡ zero.
    return (
      <EmptyState
        title="No invitations yet"
        description="Invitations appear here when a buyer invites you to an RFQ. You don't browse or request RFQs — they come to you."
      />
    );
  }

  const sorted = byInformationHierarchy(items);
  const needsResponseItems = sorted.filter(needsResponse);
  const otherItems = sorted.filter((item) => !needsResponse(item));
  // Only split into labeled groups when the split is meaningful (a mix of both) — a single-group
  // inbox (all new, or all already-responded) stays a plain list, no label noise.
  const showGroups = needsResponseItems.length > 0 && otherItems.length > 0;

  return (
    <div className="space-y-4">
      {showGroups ? (
        <>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Needs your response
            </p>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {needsResponseItems.map((item) => (
                    <InvitationRow key={item.rfq_id} item={item} basePath={basePath} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Other invitations
            </p>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {otherItems.map((item) => (
                    <InvitationRow key={item.rfq_id} item={item} basePath={basePath} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {sorted.map((item) => (
                <InvitationRow key={item.rfq_id} item={item} basePath={basePath} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
