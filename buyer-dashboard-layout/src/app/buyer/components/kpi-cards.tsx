import type * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { IvChip } from "@/components/iv/iv-chip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * KpiCards — page-level dashboard section composed only from existing registry
 * primitives (Card, IvChip) plus lucide icons. Pure presentation: every value,
 * description, and trend is supplied by the caller. It derives no deltas, coins
 * no thresholds, and performs no data access.
 *
 * Accessibility: trend direction is conveyed by an icon + signed text and a
 * screen-reader-only phrase, never by color alone.
 */
export interface KpiTrend {
  /** Pre-formatted delta as supplied by the caller, e.g. "+3", "+6.4%". */
  label: string;
  direction: "up" | "down";
}

export interface KpiCardItem {
  id: string;
  label: string;
  /** Pre-formatted large value (string or node, e.g. an IvMoney element). */
  value: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  trend: KpiTrend;
}

export interface KpiCardsProps extends React.ComponentProps<"section"> {
  items: KpiCardItem[];
}

export function KpiCards({ items, className, ...props }: KpiCardsProps) {
  return (
    <section
      aria-label="Key procurement metrics"
      className={cn("iv-kpi-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      {...props}
    >
      {items.map((item) => {
        const TrendIcon = item.trend.direction === "up" ? TrendingUp : TrendingDown;
        const trendTone = item.trend.direction === "up" ? "success" : "destructive";
        const directionText = item.trend.direction === "up" ? "Increase of" : "Decrease of";

        return (
          <Card key={item.id} className="iv-kpi-card gap-0 py-0">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="iv-kpi-card-label text-sm font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className="iv-kpi-card-icon flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary [&_svg]:size-5"
                >
                  {item.icon}
                </span>
              </div>

              <div className="iv-kpi-card-value text-3xl font-semibold leading-none text-card-foreground tabular-nums">
                {item.value}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <IvChip tone={trendTone}>
                  <TrendIcon aria-hidden="true" />
                  <span className="sr-only">{`${directionText} `}</span>
                  {item.trend.label}
                </IvChip>
                <span className="iv-kpi-card-description text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
