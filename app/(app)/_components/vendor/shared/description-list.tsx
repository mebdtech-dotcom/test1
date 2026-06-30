// DescriptionList — shared vendor atom (Milestone 8 — Shared Extraction Pass; promoted from
// vendor/company). Read-only label/value list reused across the workspace (Company profile, Microsite
// custom domain, RFQ snapshot, Engagement overview). Renders a uniform genuine-empty state ("Not
// provided yet") when a value is absent — honest for the presentation phase / first-run, and
// byte-equivalent across vendors. Render is unchanged from the pre-extraction component. RSC-friendly.
import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/cn";

export interface DescriptionItem {
  label: string;
  value?: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  className?: string;
}

export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-sm text-foreground">
            {item.value != null && item.value !== "" ? (
              item.value
            ) : (
              <span className="text-muted-foreground">Not provided yet</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
