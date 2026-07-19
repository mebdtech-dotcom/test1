"use client";

// PL-1 Pipeline surface (companion §13.2). Composes the disabled filter/sort/search controls + the
// List/Board view toggle (the kit Tabs is the interim for [ESC-7B-SEGMENTED]); List is the default and
// the low-bandwidth recommendation. The `list` and `board` views are server-rendered and passed in as
// props (RSC streams through this client boundary). The `stage` filter is frozen-confirmed
// (`ops.list_leads.v1` filter{stage?, has_next_action?}, Doc-4F §F6.4) but rendered disabled here.
// Search is own-scope FTS ([ESC-7B-SEARCH], pending). Cursor pagination only — no totals. All controls
// are disabled in the presentation phase.
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface LeadPipelineProps {
  list: ReactNode;
  board: ReactNode;
  /** Which view opens first. Defaults to "list" (the low-bandwidth recommendation); the merged RFQ
   *  workspace's Pipeline lens (`/sell/rfqs?view=board` — Cluster #1 merge) passes "board" so the
   *  kanban shows immediately (VX-03, owner directive 2026-07-17). */
  defaultView?: "list" | "board";
}

export function LeadPipeline({ list, board, defaultView = "list" }: LeadPipelineProps) {
  return (
    <Tabs defaultValue={defaultView} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <TabsList className="gap-1">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>
        <Button type="button" variant="outline" size="sm" disabled>
          All stages
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Due first
        </Button>
        <div className="relative ml-auto w-full sm:w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search by reference or title"
            aria-label="Search leads"
            className="pl-8"
            disabled
          />
        </div>
      </div>

      <TabsContent value="list">{list}</TabsContent>
      <TabsContent value="board">{board}</TabsContent>
    </Tabs>
  );
}
