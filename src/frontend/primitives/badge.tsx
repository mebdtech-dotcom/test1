// Primitive: Badge (Doc-7B BR2). Presentation-only chip. The `variant` is a PRESENTATION
// choice the caller passes — the badge invents no status/label and maps no domain value
// (Doc-7B BR3/BR12). Status text uses the DARK `*-muted` ink on the light theme and the LIGHT
// `*-text` ink on dark, both over the `*-subtle` tint, so the small (text-2xs) chip text clears
// WCAG-AA 4.5:1 on BOTH themes (Platform P-4 fix — the prior `*-base` ink failed AA at 2xs for
// warning/success on light and for info on dark; re-validated across all tones/themes).
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-2xs font-semibold uppercase leading-none tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-border bg-secondary text-secondary-foreground",
        brand: "border-iv-navy-100 bg-iv-navy-50 text-iv-navy-700",
        amber: "border-iv-amber-100 bg-iv-amber-50 text-iv-amber-700",
        success:
          "border-transparent bg-iv-success-subtle text-iv-success-muted dark:text-iv-success-text",
        warning:
          "border-transparent bg-iv-warning-subtle text-iv-warning-muted dark:text-iv-warning-text",
        danger:
          "border-transparent bg-iv-danger-subtle text-iv-danger-muted dark:text-iv-danger-text",
        info: "border-transparent bg-iv-info-subtle text-iv-info-muted dark:text-iv-info-text",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
