import type * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * iv-form-field — label + input + optional hint + optional error, self-contained.
 *
 * All content arrives via props. It performs NO validation and does NO fetching:
 * it merely displays the `error` string the caller passes in, and flips the
 * input into its invalid state while that string is present.
 *
 * Accessibility: the label is tied to the input via `htmlFor`/`id`; the hint and
 * error are linked through `aria-describedby`, and `aria-invalid` is set when an
 * error is present. The error is conveyed by text (not color alone) and
 * announced via `role="alert"`.
 */
export interface IvFormFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  "id" | "aria-invalid"
> {
  /** Required: ties the label to the input and seeds describedby ids. */
  id: string;
  label: React.ReactNode;
  /** Optional help text rendered below the input. */
  hint?: React.ReactNode;
  /** Caller-supplied error text. Presence flips the field into the invalid state. */
  error?: React.ReactNode;
  /** Marks the label with a required indicator (caller decides). */
  required?: boolean;
  /** Class for the outer wrapper (input className still flows through `className`). */
  containerClassName?: string;
}

function IvFormField({
  id,
  label,
  hint,
  error,
  required = false,
  containerClassName,
  className,
  ...inputProps
}: IvFormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      data-slot="iv-form-field"
      data-invalid={error ? "" : undefined}
      className={cn("iv-form-field flex flex-col gap-2", containerClassName)}
    >
      <Label htmlFor={id} className="iv-form-field-label gap-1">
        {label}
        {required ? (
          <span className="iv-form-field-required text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>

      <Input
        id={id}
        className={cn("iv-form-field-input", className)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        {...inputProps}
      />

      {hint ? (
        <p id={hintId} className="iv-form-field-hint text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="iv-form-field-error text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { IvFormField };
