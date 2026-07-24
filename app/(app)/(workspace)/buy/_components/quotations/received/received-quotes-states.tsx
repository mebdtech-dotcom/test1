// Received Quotes — the non-populated states. SERVER Components (the retry control is the one client leaf).
//
// The two empty states are DELIBERATELY DISTINCT and must stay that way:
//
//   • First-run empty  — the org has genuinely received no quotations. It must read as "awaiting vendor
//     responses". It must NEVER imply that a vendor was excluded, deferred or blacklisted (Inv #11 /
//     GI-12), and it must never be shown for a read failure.
//   • Filtered no-match — the buyer's own filters excluded every row. The recovery is to clear the
//     filters, so this state says so and offers exactly that.
//
// Collapsing the two would tell a buyer with active filters that they have no quotations at all — a false
// statement about their own data, and the single most likely defect on a filtered list.
//
// The error state is a READ FAILURE (`null` from the reader), never an empty result. It offers a real
// retry and states plainly that nothing was lost.

import Link from "next/link";
import { FileText, TriangleAlert, SlidersHorizontal } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { RetryButton } from "./retry-button";

/** Genuine emptiness — no quotations have been received across the org yet. */
export function ReceivedQuotesFirstRun() {
  return (
    <EmptyState
      icon={<FileText aria-hidden />}
      title="No quotations received yet"
      description="When vendors respond to your RFQs, their quotations appear here — across every RFQ, in one place."
      action={
        <Button asChild variant="secondary" size="sm">
          <Link href="/buy/rfqs">View your RFQs</Link>
        </Button>
      }
      className="py-16"
    />
  );
}

/** The buyer's own filters matched nothing — distinct from having received nothing. */
export function ReceivedQuotesNoMatches() {
  return (
    <EmptyState
      icon={<SlidersHorizontal aria-hidden />}
      title="No quotations match these filters"
      description="Clear the search or state filters to see all received quotations."
      action={
        <Button asChild variant="secondary" size="sm">
          <Link href="/buy/quotations">Clear filters</Link>
        </Button>
      }
      className="py-12"
    />
  );
}

/**
 * Read failure — the list could not be resolved. Recoverable: the retry re-runs the server read.
 * This is also the honest production state when no authoritative integration is wired
 * (`ESC-BUY-QUOTES-LIST` is still open) — the surface fails visibly rather than fabricating rows.
 */
export function ReceivedQuotesError() {
  return (
    <EmptyState
      icon={<TriangleAlert aria-hidden />}
      title="Couldn't load your quotations"
      description="Something went wrong fetching this list. Nothing has been lost — try again in a moment."
      action={<RetryButton />}
      className="py-16"
    />
  );
}
