// P-BUY-16 — clarification THREAD REGION (placeholder). This is the SLOT where the M6-single-owned
// `conversation-thread` embedded component (Doc-7B §5 · Doc-5H) will mount once it is built. Per the Board
// ruling (2026-07-01) and the sibling `vendor/rfq/clarifications-section.tsx` precedent, this milestone does
// NOT hand-build the thread node: it renders ONLY a read-only, non-disclosure-safe placeholder. No messages,
// no request/response bubbles, no attachments are rendered (that is M6's contract, not coined here).
// PRESENTATION-ONLY; RSC-friendly. Reuses the kit `Card` + `EmptyState`.
//
// GOVERNANCE:
//  • READ-ONLY — there is NO composer / send / edit affordance (Board scope: "no sending, no editing").
//  • NON-DISCLOSURE (Inv #11 / GI-12 / ND-4 / CHK-7-040) — the copy never reveals participants, exclusion,
//    or a "not matched" signal; a clarification thread is participant-scoped (buyer ↔ the vendor in it) and
//    a non-participant collapses to NOT_FOUND server-side (the host renders the byte-identical not-found).

import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";

// No card title here — the page `PageHeader` already owns the single "Clarifications" `<h1>`; a second
// "Clarifications" heading in the card would be a redundant heading. The message icon moves into the
// EmptyState so the placeholder stays recognizable without a duplicate heading.
export function ClarificationsThread() {
  return (
    <Card>
      <CardContent className="p-4">
        <EmptyState
          icon={<MessageSquare aria-hidden />}
          title="No clarification messages yet"
          description="Clarification messages about this RFQ appear here once a thread begins. Only the participants in a thread can see it."
          className="py-10"
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          The clarification thread is delivered by the messaging module and connects in the
          integration phase.
        </p>
      </CardContent>
    </Card>
  );
}
