"use client";

// P-BUY-08 RFQ-detail tab chrome (Doc-7F §4.2 — Overview / Quotations / Activity). CLIENT COMPONENT for
// EPHEMERAL UI ONLY (the active-tab state, via the kit Radix `Tabs`). The tab CONTENTS are passed in as
// already-server-rendered nodes, so only this thin chrome hydrates (RSC-first; minimal JS). Holds no
// business state and decides nothing.
//
// SCOPE NOTE: only the **Overview** content is realized in this milestone (P-BUY-08). The **Quotations**
// (P-BUY-09) and **Activity** (P-BUY-10) tabs are authorized later — their panels render a labelled
// "later milestone" placeholder here, never fabricated data.

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/frontend/primitives/tabs";

export interface RfqDetailTabsProps {
  overview: React.ReactNode;
  quotations: React.ReactNode;
  activity: React.ReactNode;
}

export function RfqDetailTabs({ overview, quotations, activity }: RfqDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="mt-2">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="quotations">Quotations</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="quotations">{quotations}</TabsContent>
      <TabsContent value="activity">{activity}</TabsContent>
    </Tabs>
  );
}
