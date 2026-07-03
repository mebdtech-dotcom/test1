import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-stat — generic metric/stat display shell primitive.
 *
 * Pure presentation: it renders a caller-supplied label, value, and optional
 * hint/trend slot. It computes nothing, derives no deltas, and coins no
 * thresholds — the value and any trend indicator are passed in fully formed
 * (e.g. an `iv-money` or a number-as-string for the value).
 */
export interface IvStatProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Optional supporting slot (caller-supplied trend chip, hint text, etc.). */
  hint?: React.ReactNode;
}

function IvStat({ label, value, hint, className, ...props }: IvStatProps) {
  return (
    <div
      data-slot="iv-stat"
      className={cn(
        "iv-stat flex flex-col gap-1 rounded-[var(--radius)] border border-border bg-card p-4",
        className,
      )}
      {...props}
    >
      <span className="iv-stat-label text-sm text-muted-foreground">{label}</span>
      <span className="iv-stat-value text-2xl font-semibold text-card-foreground tabular-nums">
        {value}
      </span>
      {hint ? <span className="iv-stat-hint text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export { IvStat };
