"use client";

// Tabbed Microsite surface (companion §4: S10–S14 map to (app)/microsite). Thin client wrapper around
// the kit Tabs; the five section contents are server-rendered and passed in as props (no data, no
// logic here). Reuses the kit Tabs primitive (no duplication).
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface MicrositeTabsProps {
  builder: ReactNode;
  branding: ReactNode;
  seo: ReactNode;
  domain: ReactNode;
  preview: ReactNode;
}

export function MicrositeTabs({ builder, branding, seo, domain, preview }: MicrositeTabsProps) {
  return (
    <Tabs defaultValue="builder" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="builder">Builder</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="domain">Custom domain</TabsTrigger>
        <TabsTrigger value="preview">Preview &amp; publish</TabsTrigger>
      </TabsList>
      <TabsContent value="builder" className="mt-4">
        {builder}
      </TabsContent>
      <TabsContent value="branding" className="mt-4">
        {branding}
      </TabsContent>
      <TabsContent value="seo" className="mt-4">
        {seo}
      </TabsContent>
      <TabsContent value="domain" className="mt-4">
        {domain}
      </TabsContent>
      <TabsContent value="preview" className="mt-4">
        {preview}
      </TabsContent>
    </Tabs>
  );
}
