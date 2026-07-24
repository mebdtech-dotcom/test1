// Compare Quotes — the non-populated states. SERVER Components (the retry control is the one client leaf).
//
// Each state names its actual CAUSE. The distinctions matter:
//   • nothing comparable yet        — no RFQ has received a quotation. Reads as "awaiting responses";
//                                     never implies a vendor was excluded (Inv #11 / GI-12).
//   • no RFQ selected               — the picker is waiting on the buyer. Not an error, not empty.
//   • not enough quotations         — the chosen RFQ has fewer than the minimum. The reason is the
//                                     SERVER's, rendered verbatim.
//   • comparison unavailable        — the comparison read did not resolve for this RFQ. Recoverable.
//   • read failure                  — the RFQ option set itself could not be loaded. Recoverable.

import Link from "next/link";
import { Scale, TriangleAlert, FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { RetryButton } from "../received/retry-button";
import { MIN_COMPARE } from "../../comparison-workspace/selection";

/** No RFQ anywhere has disclosed quotations yet. */
export function CompareNothingComparable() {
  return (
    <EmptyState
      icon={<FileText aria-hidden />}
      title="Nothing to compare yet"
      description="Once vendors respond to your RFQs, the RFQs with quotations appear here and you can compare them side by side."
      action={
        <Button asChild variant="secondary" size="sm">
          <Link href="/buy/rfqs">View your RFQs</Link>
        </Button>
      }
      className="py-12"
    />
  );
}

/** The picker is shown above; this simply invites a choice. */
export function CompareNoRfqSelected() {
  return (
    <EmptyState
      icon={<Scale aria-hidden />}
      title="Choose an RFQ to compare"
      description="Comparison is always within a single RFQ — quotations answering different requests aren't comparable."
      className="py-12"
    />
  );
}

/** The chosen RFQ cannot support a comparison. `reason` is the server's own wording. */
export function CompareNotEligible({ reason }: { reason?: string }) {
  return (
    <EmptyState
      icon={<Scale aria-hidden />}
      title="Not enough quotations to compare"
      description={
        reason ?? `At least ${MIN_COMPARE} disclosed quotations are needed to open a comparison.`
      }
      className="py-12"
    />
  );
}

/**
 * The comparison read did not resolve for this RFQ. Distinct from "not enough quotations": the RFQ is
 * eligible, but its comparison could not be produced. Recoverable — never a fabricated comparison.
 */
export function CompareUnavailable() {
  return (
    <EmptyState
      icon={<TriangleAlert aria-hidden />}
      title="Comparison unavailable"
      description="This RFQ's comparison couldn't be loaded right now. Nothing has been lost — try again in a moment."
      action={<RetryButton />}
      className="py-12"
    />
  );
}

/** The RFQ option set itself failed to load — the page has nothing to offer until it recovers. */
export function CompareQuotesError() {
  return (
    <EmptyState
      icon={<TriangleAlert aria-hidden />}
      title="Couldn't load comparable RFQs"
      description="Something went wrong fetching this page. Nothing has been lost — try again in a moment."
      action={<RetryButton />}
      className="py-16"
    />
  );
}
