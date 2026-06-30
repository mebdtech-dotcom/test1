// Primitive: Card (Doc-7B BR2). Presentation-only surface container + standard subparts.
// Server-render-friendly; no state.
import * as React from "react";
import { cn } from "../lib/cn";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-iv-sm",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export type CardTitleProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * The rendered element. Card titles ARE section headings, so this defaults to a real heading
   * (`h2`) to give the page a programmatic outline (WCAG 1.3.1 — Platform P-5 fix; the prior plain
   * `<div>` left card-titled sections with no heading semantics). `h2` is skip-safe beneath the shell
   * `PageHeader` `<h1>`; pass `as="h3"` for a sub-section, or `as="div"` only when the title is
   * genuinely NOT a heading. Appearance is unchanged — Tailwind preflight resets heading size/margin
   * and the utility classes below control the look.
   */
  as?: "h2" | "h3" | "h4" | "div";
};

const CardTitle = React.forwardRef<HTMLElement, CardTitleProps>(
  ({ className, as = "h2", ...props }, ref) => {
    const Comp = as as React.ElementType;
    return (
      <Comp
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    );
  },
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
