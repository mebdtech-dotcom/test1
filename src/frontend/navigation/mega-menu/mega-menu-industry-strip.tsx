"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuIndustryStrip (Approval Addendum MINOR-04).
// Overlay-curated industry entry chips — many buyers start from industry, not category.
// Data is overlay-authored (INDUSTRY_SHORTCUTS_V1), links point ONLY at live routes (never a
// dead route). Collapses when empty. Max 6 (R2-NITPICK-05).

import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { useMenuInstance } from "./menu-context";
import type { IndustryShortcut } from "../model/types";

export interface MegaMenuIndustryStripProps {
  shortcuts?: IndustryShortcut[];
  title?: string;
  max?: number;
  className?: string;
}

export function MegaMenuIndustryStrip({
  shortcuts,
  title = "By industry",
  max = 6,
  className,
}: MegaMenuIndustryStripProps) {
  const { emit } = useMenuInstance();
  const chips = (shortcuts ?? []).slice(0, max);
  if (chips.length === 0) return null;

  return (
    <section
      aria-label={title}
      className={cn("flex flex-wrap items-center gap-1.5 px-3 py-2", className)}
    >
      <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="inline-flex min-h-[28px] items-center rounded-full border border-iv-navy-100 bg-iv-navy-50 px-2.5 py-0.5 text-xs font-medium text-iv-navy-700 transition-colors hover:bg-iv-navy-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => emit({ type: "quick_action_clicked", action: `industry:${chip.label}` })}
        >
          {chip.label}
        </Link>
      ))}
    </section>
  );
}
