// Cluster #1 merge (Team-1 build order F2 · closure record §2.2/§2.4) — the top-level Inbox ⇄ Pipeline
// switch on `/sell/rfqs`. The Leadboard's board view was folded into this surface; this toggle chooses
// which lens is foregrounded. URL-DRIVEN (navigation, not state): each option is a plain Link that sets
// (or defaults) the allowlisted `?view=` param — no client state, no hooks (RSC-friendly), the same
// idiom as the inbox's `?state=` chips (`inbox-state-filter.tsx`) and the documents hub's ViewChips.
//
// The retired "Leadboard"/"Board" surface label is de-collided to "Pipeline" (F4); the internal token
// stays `board` so no external link/redirect target has to change. Precedence lives in the page: on the
// Pipeline (`view=board`) lens the `?state=` quotation filter is ignored (F2) — quotation-state is
// meaningless on the lead board.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";

/** Allowlisted `?view=` values — anything else ⇒ the default `inbox` (the documents-hub URL-param
 *  convention; nothing coined — these are presentation lenses, not lifecycle tokens). */
export const RFQ_VIEWS = ["inbox", "board"] as const;

export type RfqView = (typeof RFQ_VIEWS)[number];

/** Resolve a raw `?view=` search-param value against the allowlist (anything else ⇒ `inbox`). */
export function parseRfqView(value: string | undefined): RfqView {
  return RFQ_VIEWS.includes(value as RfqView) ? (value as RfqView) : "inbox";
}

/** Display labels — the retired "Leadboard"/"RFQ Leads" registers are gone; the board lens reads
 *  "Pipeline" (F4). Display copy only; the URL TOKEN stays the allowlisted value. */
const RFQ_VIEW_LABELS: Record<RfqView, string> = {
  inbox: "Inbox",
  board: "Pipeline",
};

export interface RfqViewToggleProps {
  active: RfqView;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function RfqViewToggle({ active, basePath = "/sell" }: RfqViewToggleProps) {
  const chips: { key: RfqView; label: string; href: string }[] = [
    // `inbox` is the default — its link carries no query so a clean `/sell/rfqs` lands on the inbox.
    { key: "inbox", label: RFQ_VIEW_LABELS.inbox, href: `${basePath}/rfqs` },
    { key: "board", label: RFQ_VIEW_LABELS.board, href: `${basePath}/rfqs?view=board` },
  ];
  return (
    <nav
      aria-label="Switch between the invitation inbox and the pipeline board"
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => {
        const isActive = chip.key === active;
        return (
          <Button
            key={chip.key}
            asChild
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={chip.href}>{chip.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
