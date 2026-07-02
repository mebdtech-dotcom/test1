"use client";

// P-BUY-08 RFQ-detail tab chrome (Doc-7F §4.2 — Overview / Quotations / Activity). CLIENT COMPONENT for
// EPHEMERAL UI ONLY (the active-tab state, via the kit Radix `Tabs`). The tab CONTENTS are passed in as
// already-server-rendered nodes, so only this thin chrome hydrates (RSC-first; minimal JS). Holds no
// business state and decides nothing.
//
// SCOPE NOTE: all three tab panels are now realized — Overview (P-BUY-08), Quotations (P-BUY-09), and
// Activity (P-BUY-10). This chrome stays presentation-only: the panels are server-rendered nodes passed in;
// only the active-tab state hydrates. The underlying reads/writes wire at the backend milestone (PARKED).

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
