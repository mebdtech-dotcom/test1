"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuRecent (Approval Addendum MINOR-01/02 · R2-MINOR-01).
// RESERVED, data-gated authenticated slots: Recently Viewed · Frequently Used Categories
// (repeat-buy procurement behavior) · ⭐ pinned categories (favorites are M2-owned; pin
// enforcement stays app-side). The kit stores NOTHING (no localStorage, no fabricated
// history) — every list renders ONLY when the app supplies it, so the public anonymous
// instances render nothing at all. Wiring arrives with an authed milestone.
//
// The reserved-disabled M9 AI slots (Recommended For You / Trending / Seasonal — ARCH §9.7)
// are intentionally NOT components: no code ships until recommendation services exist and an
// M9 gate rules ("AI suggests; modules decide").

import * as React from "react";
import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import { cn } from "../../lib/cn";
import { useMenuInstance } from "./menu-context";
import type { CategoryNodeVM } from "../model/types";

interface RecentGroupProps {
  title: string;
  nodes: CategoryNodeVM[];
  max: number;
  pinnable?: boolean;
  pinnedIds?: ReadonlySet<string>;
  onPinToggle?(node: CategoryNodeVM): void;
}

function RecentGroup({ title, nodes, max, pinnable, pinnedIds, onPinToggle }: RecentGroupProps) {
  const { hrefFor, emit } = useMenuInstance();
  if (nodes.length === 0) return null;
  return (
    <section aria-label={title} className="space-y-0.5 p-3">
      <h3 className="px-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul>
        {nodes.slice(0, max).map((node) => (
          <li key={node.id} className="flex items-center gap-1">
            <Link
              href={hrefFor(node)}
              prefetch={false}
              className="flex min-h-[36px] min-w-0 flex-1 items-center rounded-md px-2 py-1 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => emit({ type: "node_navigate" }, node)}
            >
              <span className="truncate">{node.name}</span>
            </Link>
            {pinnable && onPinToggle ? (
              <button
                type="button"
                aria-label={`${pinnedIds?.has(node.id) ? "Unpin" : "Pin"} ${node.name}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onPinToggle(node)}
              >
                {pinnedIds?.has(node.id) ? (
                  <PinOff aria-hidden className="size-3.5" />
                ) : (
                  <Pin aria-hidden className="size-3.5" />
                )}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface MegaMenuRecentProps {
  /** Recently viewed categories — app-supplied (authed), never kit-derived. */
  recent?: CategoryNodeVM[];
  /** Frequently used categories — analytics-driven, app-supplied. */
  frequent?: CategoryNodeVM[];
  /** ⭐ pinned categories — favorites state is app/M2-owned; the kit only renders it. */
  pinned?: CategoryNodeVM[];
  onPinToggle?(node: CategoryNodeVM): void;
  max?: number;
  className?: string;
}

export function MegaMenuRecent({
  recent,
  frequent,
  pinned,
  onPinToggle,
  max = 5,
  className,
}: MegaMenuRecentProps) {
  const pinnedIds = React.useMemo(() => new Set((pinned ?? []).map((n) => n.id)), [pinned]);
  const hasAny =
    (recent?.length ?? 0) > 0 || (frequent?.length ?? 0) > 0 || (pinned?.length ?? 0) > 0;
  if (!hasAny) return null;

  return (
    <div className={cn("border-t border-border", className)}>
      <RecentGroup
        title="Favourite categories"
        nodes={pinned ?? []}
        max={max}
        pinnable
        pinnedIds={pinnedIds}
        onPinToggle={onPinToggle}
      />
      <RecentGroup title="Frequently used" nodes={frequent ?? []} max={max} />
      <RecentGroup title="Recently viewed" nodes={recent ?? []} max={max} />
    </div>
  );
}
