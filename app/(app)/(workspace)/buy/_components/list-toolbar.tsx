// Buyer Workspace — ListToolbar: a BUYER-SCOPED presentational toolbar for `T-LISTING` screens
// (P-BUY-06; reusable by other buyer listings). Composes the kit `Input` + `Button`. Presentation only
// — search/filter are PLACEHOLDER affordances; the actual cursor-paginated query + filter binding is the
// server data layer's job (GI-02 / GI-03), wired later (PARKED). It owns no state and decides nothing.
//
// A11y: the search input is labelled; the filter control is a button with an accessible name.

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";

export interface ListToolbarProps {
  /** Accessible label + placeholder for the search field (e.g. "Search RFQs"). */
  searchLabel: string;
  /** Optional right-aligned actions slot (e.g. a primary "New" button supplied by the surface). */
  actions?: React.ReactNode;
}

export function ListToolbar({ searchLabel, actions }: ListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        {/* Presentation placeholder — filtering binds at the server data layer (GI-03), wired later. */}
        <Input type="search" aria-label={searchLabel} placeholder={searchLabel} className="pl-8" />
      </div>
      <Button variant="secondary" size="sm" className="gap-1.5">
        <SlidersHorizontal aria-hidden />
        Filters
      </Button>
      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
