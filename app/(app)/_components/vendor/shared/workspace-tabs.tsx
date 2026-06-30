"use client";

// WorkspaceTabs — generic tabbed/stepped-navigation infrastructure for the Vendor workspace (Milestone
// 8 — Shared Extraction Pass). INFRASTRUCTURE ONLY: a thin client wrapper around the kit Tabs that
// renders whatever tabs the caller supplies and makes NO feature or workflow decisions. The feature tab
// wrappers (CompanyProfileTabs, MicrositeTabs, ProductEditorTabs, the quotation step rail, the
// engagement document set) are thin adapters over this. Tabs are directly clickable in any order;
// server-rendered tab content streams through this client boundary.
//
// The defaults reproduce the established workspace tab markup EXACTLY (byte-identical to the pre-
// extraction wrappers): Tabs root `w-full`, TabsList `flex h-auto w-full flex-wrap justify-start gap-1`,
// each TabsContent `mt-4`. The className props exist only so a caller with a pre-existing bespoke layout
// can preserve it — they are not used by the standard adapters.
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface WorkspaceTab {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface WorkspaceTabsProps {
  tabs: WorkspaceTab[];
  defaultValue?: string;
  ariaLabel?: string;
  /** Tabs root className (default "w-full"). */
  className?: string;
  /** TabsList className (default the standard wrap pattern). */
  listClassName?: string;
  /** Each TabsContent className (default "mt-4"). */
  contentClassName?: string;
}

const DEFAULT_LIST = "flex h-auto w-full flex-wrap justify-start gap-1";

export function WorkspaceTabs({
  tabs,
  defaultValue,
  ariaLabel,
  className = "w-full",
  listClassName = DEFAULT_LIST,
  contentClassName = "mt-4",
}: WorkspaceTabsProps) {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value} className={className}>
      <TabsList aria-label={ariaLabel} className={listClassName}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className={contentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
