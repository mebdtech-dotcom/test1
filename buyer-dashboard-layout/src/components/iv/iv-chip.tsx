import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-chip — generic, prop-driven chip primitive.
 *
 * Pure presentation: the caller decides the `tone` and provides all content.
 * It coins no statuses, tiers, or domain enums. `status-chip` (governed,
 * contract-keyed) composes from this primitive — this primitive itself maps a
 * tone to tokens and nothing more.
 *
 * Accessibility: tone is never the only signal — render an icon and/or text
 * inside the chip so meaning is not conveyed by color alone.
 */
const ivChipVariants = cva(
  "iv-chip inline-flex items-center gap-1.5 rounded-[var(--radius)] border px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-foreground",
        primary: "border-transparent bg-primary/10 text-primary",
        success: "border-transparent bg-iv-success/15 text-iv-success",
        warning: "border-transparent bg-iv-warning/15 text-iv-warning",
        info: "border-transparent bg-iv-info/15 text-iv-info",
        amber: "border-transparent bg-iv-amber/15 text-iv-amber",
        destructive: "border-transparent bg-iv-danger/15 text-iv-danger",
      },
      variant: {
        soft: "",
        solid: "",
        outline: "bg-transparent",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        tone: "neutral",
        className: "bg-foreground text-background border-transparent",
      },
      {
        variant: "solid",
        tone: "primary",
        className: "bg-primary text-primary-foreground",
      },
      {
        variant: "solid",
        tone: "success",
        className: "bg-iv-success text-iv-success-foreground",
      },
      {
        variant: "solid",
        tone: "warning",
        className: "bg-iv-warning text-iv-warning-foreground",
      },
      {
        variant: "solid",
        tone: "info",
        className: "bg-iv-info text-iv-info-foreground",
      },
      {
        variant: "solid",
        tone: "amber",
        className: "bg-iv-amber text-iv-amber-foreground",
      },
      {
        variant: "solid",
        tone: "destructive",
        className: "bg-destructive text-destructive-foreground",
      },
      { variant: "outline", tone: "primary", className: "border-primary text-primary" },
      { variant: "outline", tone: "success", className: "border-iv-success text-iv-success" },
      { variant: "outline", tone: "warning", className: "border-iv-warning text-iv-warning" },
      { variant: "outline", tone: "info", className: "border-iv-info text-iv-info" },
      { variant: "outline", tone: "amber", className: "border-iv-amber text-iv-amber" },
      { variant: "outline", tone: "destructive", className: "border-iv-danger text-iv-danger" },
    ],
    defaultVariants: {
      tone: "neutral",
      variant: "soft",
    },
  },
);

function IvChip({
  className,
  tone,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof ivChipVariants>) {
  return (
    <span
      data-slot="iv-chip"
      className={cn(ivChipVariants({ tone, variant, className }))}
      {...props}
    />
  );
}

export { IvChip, ivChipVariants };
