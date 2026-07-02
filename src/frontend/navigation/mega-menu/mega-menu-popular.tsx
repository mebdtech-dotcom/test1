"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuPopular (Approval Addendum, owner delta).
// "Popular Searches" chips — industrial users search by item, not category. Terms are APP-
// SUPPLIED (the public instance reuses the curated, seed-verified discovery terms — RV-0121
// provenance); the kit never invents terms. Chips navigate to the real search surface.
// Collapses entirely when no terms (GI-03 discipline). Max 8 (R2-NITPICK-05).

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "../../lib/cn";
import { useMenuInstance } from "./menu-context";
import type { PopularSearchTerm } from "../model/types";

export interface MegaMenuPopularProps {
  terms?: PopularSearchTerm[];
  title?: string;
  max?: number;
  className?: string;
  onTermSelect?(term: PopularSearchTerm): void;
}

export function MegaMenuPopular({
  terms,
  title = "Popular searches",
  max = 8,
  className,
  onTermSelect,
}: MegaMenuPopularProps) {
  const { emit } = useMenuInstance();
  const chips = (terms ?? []).slice(0, max);
  if (chips.length === 0) return null;

  return (
    <section
      aria-label={title}
      className={cn("flex flex-wrap items-center gap-1.5 px-3 py-2", className)}
    >
      <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      {chips.map((term) => (
        <Link
          key={term}
          href={`/search?q=${encodeURIComponent(term)}`}
          className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            emit({ type: "quick_action_clicked", action: `popular_search:${term}` });
            onTermSelect?.(term);
          }}
        >
          <Search aria-hidden className="size-3" />
          {term}
        </Link>
      ))}
    </section>
  );
}
