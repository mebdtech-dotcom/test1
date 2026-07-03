"use client";

// BuyerWorkspaceTabs — generic tabbed-navigation infrastructure for the Buyer workspace (BX-04 bug
// fix: composition-not-fork pattern, mirroring the vendor track's `_components/vendor/shared/
// workspace-tabs.tsx` byte-for-byte — NOT imported cross-workspace [Review-A convention: zero
// `_components/vendor/*` import under `(buyer)/`], duplicated at the same narrow scope instead).
// INFRASTRUCTURE ONLY: a thin client wrapper around the kit Tabs that renders whatever tabs the
// caller supplies and makes NO feature or workflow decisions. `SettingsTabs` is a thin adapter over
// this.
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface BuyerWorkspaceTab {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface BuyerWorkspaceTabsProps {
  tabs: BuyerWorkspaceTab[];
  defaultValue?: string;
  ariaLabel?: string;
}

export function BuyerWorkspaceTabs({ tabs, defaultValue, ariaLabel }: BuyerWorkspaceTabsProps) {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value} className="w-full">
      <TabsList aria-label={ariaLabel} className="flex h-auto w-full flex-wrap justify-start gap-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
