// Received Quotes — summary tiles. SERVER Component (pure function of props; no hooks, no fetch).
//
// GOVERNANCE: every figure is a SERVER-COMPUTED count delivered with the list read (R7 / GI-12). These
// tiles must never be re-derived from the rendered rows — the rows are a filtered, paginated view, so a
// client-side recount would both contradict the contract and leak the size of the withheld set. Each tile
// is a count over the frozen Doc-4M §5.3 state set plus validity arithmetic; none is an invented metric,
// and none ranks, scores or judges a vendor.

import { ClipboardList, ListChecks, Clock, CircleCheck } from "lucide-react";
import { KpiStatCard } from "../../kpi-stat-card";
import type { QuotationStateCounts } from "../org-quotation-view-models";

export function QuotationSummaryTiles({ counts }: { counts: QuotationStateCounts }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiStatCard
        label="Awaiting your review"
        value={counts.awaitingReview}
        caption="Submitted"
        icon={<ClipboardList aria-hidden />}
        tone="info"
      />
      <KpiStatCard
        label="Shortlisted"
        value={counts.shortlisted}
        caption="In comparison & evaluation"
        icon={<ListChecks aria-hidden />}
        tone="brand"
      />
      <KpiStatCard
        label="Validity expiring soon"
        value={counts.expiringSoon}
        caption="Within the notice window"
        icon={<Clock aria-hidden />}
        tone="warning"
      />
      <KpiStatCard
        label="Concluded"
        value={counts.concluded}
        caption="Selected · not selected · withdrawn · expired"
        icon={<CircleCheck aria-hidden />}
        tone="neutral"
      />
    </div>
  );
}
