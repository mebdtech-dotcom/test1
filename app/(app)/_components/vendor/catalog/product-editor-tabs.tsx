"use client";

// Tabbed Product Editor (companion §5: S2 Content · S3 Specifications · S6/S7 Publishing). Thin client
// wrapper around the kit Tabs; the three section contents are server-rendered and passed in as props.
// Reuses the kit Tabs primitive (no duplication).
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface ProductEditorTabsProps {
  content: ReactNode;
  specifications: ReactNode;
  publishing: ReactNode;
}

export function ProductEditorTabs({ content, specifications, publishing }: ProductEditorTabsProps) {
  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="publishing">Publishing</TabsTrigger>
      </TabsList>
      <TabsContent value="content" className="mt-4">
        {content}
      </TabsContent>
      <TabsContent value="specifications" className="mt-4">
        {specifications}
      </TabsContent>
      <TabsContent value="publishing" className="mt-4">
        {publishing}
      </TabsContent>
    </Tabs>
  );
}
