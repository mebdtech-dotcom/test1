// Quotation-submission quota meter (companion §6.6 / §13.1; Doc-5I). Shows the NUMERIC entitlement
// (`monthly_rfq_limit`) resolved server-side — NEVER a plan name (Invariant 10 / DP6). One unit is
// consumed at SUBMIT only. This is the billing/quota embedded component (CHK-7-005), rendered here as
// a feature-local meter ([ESC-7B-METER], pending kit addition). Renders a neutral placeholder when no
// value is set (genuine-empty). Presentation-only; RSC-friendly.
import { cn } from "@/frontend/lib/cn";
import type { QuotaView } from "./types";

export interface QuotaMeterProps {
  quota?: QuotaView;
  className?: string;
}

export function QuotaMeter({ quota, className }: QuotaMeterProps) {
  const hasData = typeof quota?.used === "number" && typeof quota?.limit === "number";

  return (
    <div className={cn("text-sm", className)}>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Quota</span>{" "}
        {hasData ? (
          <span>
            {quota!.used} of {quota!.limit} used this period
          </span>
        ) : (
          <span>loads with your plan</span>
        )}
      </p>
      {hasData && quota?.resets_label ? (
        // The label arrives server-formatted WITH its "Resets …" prefix (QuotaView contract) —
        // render it verbatim, never re-prefix.
        <p className="text-xs text-muted-foreground">{quota.resets_label}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        One unit is used only when you submit a quotation.
      </p>
    </div>
  );
}
