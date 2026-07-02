"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuColumn + MegaMenuColumns (MEGA_MENU_COMPONENT_SPEC.md).
// Column count = drilled depth (data-bounded, max 4 by the frozen level CHECK — never a code
// bound). Hover drill is intent-delayed (~80ms via provider tokens) and pending activation is
// CANCELLED when the pointer is already inside a deeper column — the pragmatic safe-triangle:
// moving diagonally into the child column never flips the active parent (UX doc §1.3; real-
// device tuning is a Phase 4 exit). Keyboard map per UX doc §4 (roving focus across columns,
// Home/End, a–z typeahead); hover paths are gated to fine pointers (R2-NITPICK-02).

import * as React from "react";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";
import { MegaMenuCategory } from "./mega-menu-category";
import type { CategoryNodeVM } from "../model/types";

export interface MegaMenuColumnProps {
  level: number;
  parentId: string | null;
  emptyHint?: React.ReactNode;
  className?: string;
}

export function MegaMenuColumn({ level, parentId, emptyHint, className }: MegaMenuColumnProps) {
  const { roots, byId, pathTo } = useTaxonomy();
  const { activePath, setActiveAt, hoverIntentDelay } = useMenuState();
  const { emit } = useMenuInstance();
  const pending = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const parent = parentId ? byId.get(parentId) : undefined;
  const siblings = parentId ? (parent?.children ?? []) : roots;
  const activeId = activePath[level];
  const rootSlug = parentId ? pathTo(parentId)[0]?.slug : undefined;

  React.useEffect(() => {
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, []);

  const scheduleActivate = (node: CategoryNodeVM) => {
    if (node.id === activeId) return;
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      setActiveAt(level, node.id);
      if (node.children.length > 0) emit({ type: "node_drill" }, node);
    }, hoverIntentDelay.in);
  };

  if (siblings.length === 0) {
    return (
      <div className={cn("w-64 shrink-0 p-3 text-sm text-muted-foreground", className)}>
        {emptyHint ?? "No categories here yet."}
      </div>
    );
  }

  // Optional visual grouping (MegaMenuSection idiom): overlay `sectionLabel` groups adjacent
  // rows under a heading — purely presentational, hierarchy untouched.
  const groups: { label?: string; nodes: CategoryNodeVM[] }[] = [];
  for (const node of siblings) {
    const last = groups[groups.length - 1];
    if (last && last.label === node.sectionLabel) last.nodes.push(node);
    else groups.push({ label: node.sectionLabel, nodes: [node] });
  }

  return (
    <div
      role="group"
      aria-label={parent?.name ?? "All categories"}
      data-menu-column={level}
      // Column-local scroll past ~14 rows with a fade cue; the panel itself never scrolls.
      className={cn(
        "max-h-[min(60vh,672px)] w-64 shrink-0 overflow-y-auto border-r border-border p-1.5 last:border-r-0 [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)]",
        className,
      )}
      onPointerLeave={() => {
        // Leaving the column cancels a pending switch — entering the child column keeps the
        // current parent active (grace behavior, UX doc §1.3).
        if (pending.current) clearTimeout(pending.current);
      }}
    >
      {groups.map((group, gi) => (
        <div key={group.label ?? `g${gi}`} role="list">
          {group.label ? (
            <div className="px-2.5 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </div>
          ) : null}
          {group.nodes.map((node) => (
            <MegaMenuCategory
              key={node.id}
              node={node}
              active={node.id === activeId}
              rootSlug={rootSlug ?? node.slug}
              showIcon={level === 0}
              onActivate={scheduleActivate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Renders Column × (drilled depth + 1). Wrap in the keyboard-nav container. */
export function MegaMenuColumns({ className }: { className?: string }) {
  const { activePath } = useMenuState();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Keyboard map (UX doc §4 + SPEC addendum table). Roving DOM focus over [data-menu-row]
  // links, column-scoped; ArrowRight enters the next column (the row's focus already set the
  // active path), ArrowLeft returns to the active parent.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const target = e.target as HTMLElement;
    if (e.key === "/") {
      const search = document.querySelector<HTMLInputElement>("[data-mega-menu-search]");
      if (search) {
        e.preventDefault();
        search.focus();
      }
      return;
    }
    const column = target.closest<HTMLElement>("[data-menu-column]");
    if (!column) return;
    const rows = Array.from(
      column.querySelectorAll<HTMLElement>("[data-menu-row]:not([aria-disabled])"),
    );
    const idx = rows.indexOf(target.closest<HTMLElement>("[data-menu-row]") as HTMLElement);

    const focusRow = (list: HTMLElement[], i: number) => list[i]?.focus();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusRow(rows, (idx + 1) % rows.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusRow(rows, (idx - 1 + rows.length) % rows.length);
        break;
      case "Home":
        e.preventDefault();
        focusRow(rows, 0);
        break;
      case "End":
        e.preventDefault();
        focusRow(rows, rows.length - 1);
        break;
      case "ArrowRight": {
        e.preventDefault();
        const level = Number(column.dataset.menuColumn);
        const next = container.querySelector<HTMLElement>(`[data-menu-column="${level + 1}"]`);
        next?.querySelector<HTMLElement>("[data-menu-row]:not([aria-disabled])")?.focus();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const level = Number(column.dataset.menuColumn);
        if (level === 0) break;
        const prev = container.querySelector<HTMLElement>(`[data-menu-column="${level - 1}"]`);
        const activeRow = prev?.querySelector<HTMLElement>('[data-menu-row][aria-current="true"]');
        (activeRow ?? prev?.querySelector<HTMLElement>("[data-menu-row]"))?.focus();
        break;
      }
      default: {
        // a–z typeahead within the column.
        if (
          e.key.length === 1 &&
          /[a-z0-9]/i.test(e.key) &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          const letter = e.key.toLowerCase();
          const after = rows.slice(idx + 1).concat(rows.slice(0, idx + 1));
          const hit = after.find((r) => r.textContent?.trim().toLowerCase().startsWith(letter));
          hit?.focus();
        }
      }
    }
  };

  return (
    // Container-scoped key handling over focusable link rows (roving DOM focus, no focus trap —
    // TAB order stays natural per UX doc §4).

    <div ref={containerRef} className={cn("flex min-w-0", className)} onKeyDown={onKeyDown}>
      <MegaMenuColumn level={0} parentId={null} />
      {activePath.map((id, i) => (
        <MegaMenuColumn key={id} level={i + 1} parentId={id} />
      ))}
    </div>
  );
}
