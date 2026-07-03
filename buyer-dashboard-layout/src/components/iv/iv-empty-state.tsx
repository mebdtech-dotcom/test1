import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-empty-state — generic empty/placeholder shell primitive.
 *
 * The building block that the governed `not-found` and empty-result views
 * compose from. By design it renders ONLY caller-supplied, generic content:
 * an optional icon, a title, a description, and an optional action slot.
 *
 * Non-disclosure: this primitive carries no ids, counts, reasons, or
 * exclusion/blacklist hints. A genuine "empty result" and a "not found" must be
 * byte-identical when rendered through it — so the caller must pass the same
 * neutral copy for both and never inject protected detail here.
 */
export interface IvEmptyStateProps extends Omit<React.ComponentProps<"div">, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional action slot (e.g. a button) supplied by the caller. */
  action?: React.ReactNode;
}

function IvEmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: IvEmptyStateProps) {
  return (
    <div
      data-slot="iv-empty-state"
      className={cn(
        "iv-empty-state flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          className="iv-empty-state-icon flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}

      <div className="iv-empty-state-text flex flex-col gap-1">
        <p className="iv-empty-state-title text-base font-medium text-foreground text-balance">
          {title}
        </p>
        {description ? (
          <p className="iv-empty-state-description text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="iv-empty-state-action mt-1">{action}</div> : null}
    </div>
  );
}

export { IvEmptyState };
