"use client";

import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { VENDOR_NAV, type VendorNavEntry, type VendorNavGroup } from "./nav";

export interface NavListProps {
  /** Id of the currently active nav slot (decided by the caller). */
  activeId?: string;
  /** Optional per-nav badge labels, keyed by nav id. */
  badges?: Record<string, string>;
}

/** Shared link/row styles for top-level links and group children. */
function rowClass(isActive: boolean) {
  return cn(
    "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50",
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );
}

/** Numeric/count badge (caller-supplied, keyed by nav id). */
function CountBadge({ value, isActive }: { value: string; isActive: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs tabular-nums",
        isActive
          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
          : "bg-muted text-foreground",
      )}
    >
      {value}
    </span>
  );
}

/** Static feature tag (e.g. "New"); structural, not domain data. */
function FeatureTag({ label, isActive }: { label: string; isActive: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide",
        isActive
          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
          : "bg-primary/10 text-primary",
      )}
    >
      {label}
    </span>
  );
}

function GroupItem({
  group,
  activeId,
  badges,
}: {
  group: VendorNavGroup;
  activeId?: string;
  badges: Record<string, string>;
}) {
  const Icon = group.icon;
  const hasActiveChild = group.children.some((c) => c.id === activeId);

  return (
    <Collapsible defaultOpen={hasActiveChild} className="flex flex-col gap-1">
      <CollapsibleTrigger
        className={cn(rowClass(false), "group/trigger w-full")}
        aria-label={group.label}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className="size-4 shrink-0 text-sidebar-foreground/60 transition-transform group-data-[state=open]/trigger:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <ul className="ml-4 flex flex-col gap-1 border-l border-sidebar-border pl-2">
          {group.children.map((child) => {
            const ChildIcon = child.icon;
            const isActive = child.id === activeId;
            const badge = badges[child.id];
            return (
              <li key={child.id}>
                <a
                  href={child.href}
                  aria-current={isActive ? "page" : undefined}
                  className={rowClass(isActive)}
                >
                  <ChildIcon className="size-4 shrink-0" />
                  <span className="flex-1">{child.label}</span>
                  {child.tag ? <FeatureTag label={child.tag} isActive={isActive} /> : null}
                  {badge ? <CountBadge value={badge} isActive={isActive} /> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Shared primary-navigation list. Pure presentation: it renders the structural
 * nav slots (links and collapsible groups) and reflects the caller-supplied
 * `activeId` and `badges`. It holds only ephemeral group open/close UI state
 * and derives no active route, counts, or domain values.
 */
export function NavList({ activeId, badges = {} }: NavListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {VENDOR_NAV.map((entry: VendorNavEntry) => {
        if (entry.kind === "group") {
          return (
            <li key={entry.id}>
              <GroupItem group={entry} activeId={activeId} badges={badges} />
            </li>
          );
        }

        const Icon = entry.icon;
        const isActive = entry.id === activeId;
        const badge = badges[entry.id];
        return (
          <li key={entry.id}>
            <a
              href={entry.href}
              aria-current={isActive ? "page" : undefined}
              className={rowClass(isActive)}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{entry.label}</span>
              {entry.tag ? <FeatureTag label={entry.tag} isActive={isActive} /> : null}
              {badge ? <CountBadge value={badge} isActive={isActive} /> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
