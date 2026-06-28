import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/shared/ui/lib/cn";
import { Button } from "@/shared/ui/button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short error headline. */
  title?: string;
  /** Supporting detail describing what went wrong. */
  description?: string;
  /** Optional retry handler — renders a retry button when provided. */
  onRetry?: () => void;
  /** Label for the retry button. */
  retryLabel?: string;
}

/**
 * ErrorState — standardized inline error surface for failed data loads.
 * Structural only; the parent owns the retry behavior.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  retryLabel = "Retry",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground text-balance">{title}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw data-icon="inline-start" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
