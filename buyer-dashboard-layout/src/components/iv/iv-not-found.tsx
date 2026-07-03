import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-not-found — generic absent/not-found state (server component).
 *
 * NON-DISCLOSURE INVARIANT: this view must look identical whether a record is
 * genuinely absent or deliberately hidden. It therefore renders ONLY a generic
 * message and an OPTIONAL caller-supplied `referenceId`. It never accepts or
 * shows internal ids, statuses, reasons, counts, or any signal that would let a
 * viewer distinguish "missing" from "hidden". The defaults below are
 * intentionally neutral; callers must pass the same copy for both cases.
 *
 * The `referenceId` is a support/correlation token the caller chooses to
 * surface (e.g. for a help request) — it is not an internal record identifier.
 */
export interface IvNotFoundProps extends Omit<React.ComponentProps<"div">, "title"> {
  icon?: React.ReactNode;
  /** Generic, identical-for-all-cases heading. */
  title?: React.ReactNode;
  /** Generic, identical-for-all-cases body copy. */
  description?: React.ReactNode;
  /** Optional, caller-supplied correlation/reference token (not an internal id). */
  referenceId?: string;
  /** Optional action slot (e.g. a "go back" button) supplied by the caller. */
  action?: React.ReactNode;
}

function IvNotFound({
  icon,
  title = "Not found",
  description = "We couldn’t find what you were looking for.",
  referenceId,
  action,
  className,
  ...props
}: IvNotFoundProps) {
  return (
    <div
      data-slot="iv-not-found"
      role="status"
      className={cn(
        "iv-not-found flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          className="iv-not-found-icon flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}

      <div className="iv-not-found-text flex flex-col gap-1">
        <p className="iv-not-found-title text-base font-medium text-foreground text-balance">
          {title}
        </p>
        {description ? (
          <p className="iv-not-found-description text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>

      {referenceId ? (
        <p className="iv-not-found-reference text-xs text-muted-foreground">
          Reference: <span className="font-mono text-foreground">{referenceId}</span>
        </p>
      ) : null}

      {action ? <div className="iv-not-found-action mt-1">{action}</div> : null}
    </div>
  );
}

export { IvNotFound };
