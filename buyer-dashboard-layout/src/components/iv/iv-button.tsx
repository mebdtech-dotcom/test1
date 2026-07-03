import { Slot as SlotPrimitive } from "radix-ui";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-button — pure presentation button primitive (shadcn-style).
 *
 * Tokens only (bg-primary / text-primary-foreground / border / ring / radius),
 * server-component compatible (no client JS — `loading`/`disabled` are pure
 * markup state), and WCAG-AA focusable via a visible focus-visible ring.
 *
 * It decides nothing: variant, size, disabled and loading are all caller-driven.
 * `loading` only reflects a UI state the caller owns; the component performs no
 * async work and holds no state of its own.
 */
const ivButtonVariants = cva(
  [
    "iv-button inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius)] text-sm font-medium transition-colors",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // WCAG-AA visible focus ring, token-driven.
    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    // Disabled (also applied while loading via aria-disabled styling hook).
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/40",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 px-6 has-[>svg]:px-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface IvButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof ivButtonVariants> {
  asChild?: boolean;
  /** Ephemeral UI flag owned by the caller; disables interaction and shows a spinner. */
  loading?: boolean;
}

function IvButton({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: IvButtonProps) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";
  const isDisabled = disabled || loading;

  // When asChild is used, Slot requires a single child, so we don't inject the
  // spinner element — we still reflect the busy/disabled state via attributes.
  if (asChild) {
    return (
      <Comp
        data-slot="iv-button"
        data-loading={loading ? "" : undefined}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(ivButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <button
      data-slot="iv-button"
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(ivButtonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <Loader2
          className="iv-button-spinner size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}

export { IvButton, ivButtonVariants };
