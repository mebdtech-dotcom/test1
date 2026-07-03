// Documents shared home — RecentlyOpenedStrip (FE-DOC, owner finding NIT-4). A small strip of
// links to recently-opened documents. PRESENTATION-ONLY + HONEST: recents are EPHEMERAL UI STATE
// (not a domain field — nothing is coined); this build renders a SEEDED sample, visibly labelled,
// and a real recency source (client-local history) wires later — WP fe-doc-01 carries the note.
// Icons resolve only via the shared `document-icon-map` (NIT-03).

import Link from "next/link";
import { History } from "lucide-react";
import { documentIcon } from "./document-icon-map";
import { cn } from "@/frontend/lib/cn";

export interface RecentlyOpenedItem {
  id: string;
  /** Display label (human ref). */
  label: string;
  href: string;
  /** Icon key for the shared document-icon-map. */
  kindKey: string;
}

export interface RecentlyOpenedStripProps {
  items: RecentlyOpenedItem[];
  className?: string;
}

export function RecentlyOpenedStrip({ items, className }: RecentlyOpenedStripProps) {
  if (items.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <History aria-hidden className="size-3.5" />
        Recently opened
        <span className="font-normal">(sample — history wires with the backend)</span>
      </span>
      {items.map((item) => {
        const Icon = documentIcon(item.kindKey);
        return (
          <Link
            key={item.id}
            href={item.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
          >
            <Icon aria-hidden className="size-3.5 text-muted-foreground" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
