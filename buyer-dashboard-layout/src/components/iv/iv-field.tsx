import type * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * iv-field — generic form-field wrapper primitive.
 *
 * Composes a label, a control (passed as children), an optional description and
 * an optional error message, wiring up `htmlFor` / `aria-describedby` /
 * `aria-invalid` relationships for accessibility. It is purely presentational:
 * it holds no value, performs no validation, and decides nothing — the caller
 * owns the control, its value, and whether an error string is present.
 *
 * The error is conveyed by text (not color alone) and announced via
 * `role="alert"`, satisfying the no-color-only-meaning rule.
 */
export interface IvFieldProps extends React.ComponentProps<"div"> {
  /** id of the control rendered as children; used for label + aria wiring. */
  htmlFor: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Caller-supplied error text. Presence flips the field into the invalid state. */
  error?: React.ReactNode;
  /** Marks the label with a required indicator (caller decides). */
  required?: boolean;
}

function IvField({
  htmlFor,
  label,
  description,
  error,
  required = false,
  className,
  children,
  ...props
}: IvFieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div
      data-slot="iv-field"
      data-invalid={error ? "" : undefined}
      className={cn("iv-field flex flex-col gap-2", className)}
      {...props}
    >
      <Label htmlFor={htmlFor} className="iv-field-label gap-1">
        {label}
        {required ? (
          <span className="iv-field-required text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>

      {description ? (
        <p id={descriptionId} className="iv-field-description text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

      <div
        className="iv-field-control"
        // Surface the wiring to whatever control the caller renders as children.
        data-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
      >
        {children}
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="iv-field-error text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { IvField };
