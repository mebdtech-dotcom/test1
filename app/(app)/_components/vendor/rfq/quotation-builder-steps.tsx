"use client";

// Stepped-navigation wrapper for the staged quotation builder (companion §13.1). INFRASTRUCTURE ONLY:
// this is a thin client wrapper around the kit Tabs that renders whatever steps the caller supplies and
// makes NO workflow decisions — it knows nothing about Price/Delivery/Submit or any quotation concept.
// The caller defines the steps (value/label/content), so future steps (e.g. an AI-review or commercial
// step) can be added with zero change here. Steps are directly clickable in ANY order [M-Q1]. The
// desktop rail is Tabs; the mobile [ESC-7B-SEGMENTED] stepper is a pending kit addition. RSC content
// streams through this client boundary.
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface WorkspaceStep {
  value: string;
  label: string;
  content: ReactNode;
}

export interface QuotationBuilderStepsProps {
  steps: WorkspaceStep[];
  defaultValue?: string;
  ariaLabel?: string;
}

export function QuotationBuilderSteps({
  steps,
  defaultValue,
  ariaLabel,
}: QuotationBuilderStepsProps) {
  return (
    <Tabs defaultValue={defaultValue ?? steps[0]?.value} className="w-full">
      <TabsList aria-label={ariaLabel} className="flex h-auto w-full flex-wrap justify-start gap-1">
        {steps.map((step) => (
          <TabsTrigger key={step.value} value={step.value}>
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {steps.map((step) => (
        <TabsContent key={step.value} value={step.value} className="mt-4">
          {step.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
