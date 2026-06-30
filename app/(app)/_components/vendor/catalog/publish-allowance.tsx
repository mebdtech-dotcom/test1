// Catalog publishing-allowance indicator (S6/S7). Shows NUMERIC entitlement values only — the
// allowance comes from billing.resolve_entitlements (Doc-5I); it is NEVER a plan name (Invariant 10 /
// DP6). Distinct from the RFQ quota. Presentation-only; renders a neutral note when no value is set.
import { cn } from "@/frontend/lib/cn";
import type { PublishAllowanceView } from "./types";

export interface PublishAllowanceIndicatorProps {
  allowance?: PublishAllowanceView;
  className?: string;
}

export function PublishAllowanceIndicator({
  allowance,
  className,
}: PublishAllowanceIndicatorProps) {
  const hasData = typeof allowance?.used === "number" && typeof allowance?.limit === "number";

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <span className="font-medium text-foreground">Published</span>{" "}
      {hasData ? (
        <span>
          {allowance!.used} of {allowance!.limit}
        </span>
      ) : (
        <span>allowance loads with your plan</span>
      )}
    </p>
  );
}
