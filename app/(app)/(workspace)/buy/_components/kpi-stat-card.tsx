// Buyer Workspace — KPI stat card (P-BUY-01 KPI band, Doc-7F §9.1; `T-DASHBOARD` `PT §5.3`).
//
// A BUYER-SCOPED presentation composition of the existing Doc-7B kit `Card` primitive — NOT a new shared
// kit primitive (the frozen kit is not modified; the shared `kpi-stat-card`/`data-table` band remains a
// Doc-7B-owner task). Pure function of props: a Server Component, no hooks, no fetch (Content ≠
// Presentation, Inv #9). Server-render-friendly → minimal JS.
//
// GOVERNANCE: every figure is a WIRED READ supplied by the caller — never client-computed (GI-12 / UX
// §6.2). The surface composes the figure node (a `CurrencyDisplay`, a count, or a `StatusChip`) and
// passes it as `value`. Counts must respect non-disclosure — NO excluded/blacklist figure is ever
// represented (Inv #11). When a figure is not yet available the card renders a neutral "—" placeholder
// rather than a fabricated number.

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { cn } from "@/frontend/lib/cn";

/** Icon-box tint — a PRESENTATION-ONLY accent, keyed on the same tone vocabulary as `StatusChip`
 *  (`src/frontend/components/status-chip.tsx`) so no new color language is invented. Decorative only —
 *  never derived from or implying a governance signal. */
export type KpiStatTone = "brand" | "info" | "success" | "warning" | "neutral";

const TONE_ICON_BOX: Record<KpiStatTone, string> = {
  brand: "bg-iv-navy-50 text-iv-navy-700 dark:bg-iv-navy-900/50 dark:text-iv-navy-200",
  info: "bg-iv-info-subtle text-iv-info-muted dark:text-iv-info-text",
  success: "bg-iv-success-subtle text-iv-success-muted dark:text-iv-success-text",
  warning: "bg-iv-warning-subtle text-iv-warning-muted dark:text-iv-warning-text",
  neutral: "bg-secondary text-secondary-foreground",
};

/**
 * A pre-formatted, caller-supplied trend delta (e.g. "+3 this week", "-4%"). BX-06 UI-layer
 * DECORATION only — unlike `value` (a contract-traced KPI figure), no frozen trend/delta read
 * exists anywhere in the corpus, so a surface that renders this MUST treat it the same way the
 * rest of this dashboard's presentation fixture already does (clearly disclosed illustrative
 * content standing in for a future wired comparison read, not an authoritative figure) — never a
 * silently-fabricated business claim. Direction conveys meaning via icon + signed text, never
 * color alone (GI-06).
 */
export interface KpiTrend {
  label: string;
  direction: "up" | "down";
}

export interface KpiStatCardProps {
  /** KPI label (e.g. "Spend", "Active RFQs"). */
  label: string;
  /**
   * The headline figure node — a `CurrencyDisplay`, a formatted count, or a `StatusChip`, composed by the
   * surface from a contract read. Absent → a neutral "—" placeholder (no fabricated value).
   */
  value?: React.ReactNode;
  /** Optional trend delta chip (see `KpiTrend`) — illustrative decoration, not a contract figure. */
  trend?: KpiTrend;
  /** Optional secondary caption (e.g. context text or a link). Presentation only. */
  caption?: React.ReactNode;
  /** Optional leading icon (lucide), decorative. */
  icon?: React.ReactNode;
  /** Icon-box tint (decorative only). Defaults to "neutral". */
  tone?: KpiStatTone;
  className?: string;
}

export function KpiStatCard({
  label,
  value,
  trend,
  caption,
  icon,
  tone = "neutral",
  className,
}: KpiStatCardProps) {
  return (
    // `min-w-0` — a CSS Grid item's default min-width is `auto` (its content's intrinsic width), so a
    // long unbroken value (e.g. a BDT amount) would overflow a narrow grid track instead of wrapping;
    // this lets the card shrink to its track and the value below wrap/break normally instead.
    <Card className={cn("min-w-0 shadow-iv-xs", className)}>
      {/* Buyer-scoped KPI layout variant: `p-5` (vs the kit Card default `p-6`) for the dense
          auto-fill KPI grid (§9.1). Typography follows the dashboard's rebalanced scale: the metric
          `value` is a `text-2xl` "big number" (the single largest element in the card, matching the
          pipeline-count tier) over a `text-xs` metadata `label`, so the value dominates and the label
          reads as subordinate. Stays on the existing Navy-dominant tone system (`TONE_ICON_BOX` above
          is unchanged). A composition delta only — the Card primitive is unmodified. */}
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {icon ? (
            <span
              aria-hidden
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
                TONE_ICON_BOX[tone],
              )}
            >
              {icon}
            </span>
          ) : null}
        </div>
        <div className="break-words text-2xl font-semibold leading-tight tracking-tight text-foreground tabular-nums">
          {value ?? <span className="text-muted-foreground">—</span>}
        </div>
        {trend || caption ? (
          <div className="flex flex-wrap items-center gap-2">
            {trend ? (
              <Badge
                variant={trend.direction === "up" ? "success" : "danger"}
                className="gap-1 normal-case tracking-normal"
              >
                {trend.direction === "up" ? (
                  <TrendingUp aria-hidden className="size-3" />
                ) : (
                  <TrendingDown aria-hidden className="size-3" />
                )}
                <span className="sr-only">
                  {trend.direction === "up" ? "Increase of " : "Decrease of "}
                </span>
                {trend.label}
              </Badge>
            ) : null}
            {caption ? <span className="text-xs text-muted-foreground">{caption}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
