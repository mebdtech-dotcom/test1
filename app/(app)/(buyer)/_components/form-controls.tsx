// Buyer Workspace — form controls (Tier-2): `Textarea` + `Select`. These mirror the FROZEN kit `Input`
// chrome (src/frontend/primitives/input.tsx) exactly, for the controls the kit does not yet ship (the
// kit has `input` but no `textarea`/`select` — both are Doc-7B-deferred). They compose into the kit
// `FormField` as `children` (FormField injects id/aria/required). Server-render-friendly (no state; a
// client form surface wires value/onChange at integration). PRESENTATION-ONLY.
//
// PROMOTION CANDIDATES: a kit `Textarea` is overdue — 4 vendor files hand-roll the same textarea chrome
// (platform audit) and this is the buyer consumer (≥2 workspaces). Registered for §4.2 promotion; until
// then it lives buyer-scoped (the DataListTable/DescriptionList precedent: realize a kit gap at the
// narrowest scope, never fork the frozen kit).

import * as React from "react";
import { cn } from "@/frontend/lib/cn";

// The shared kit Input chrome (verbatim from input.tsx), minus the fixed height so textarea can grow.
const CONTROL_BASE =
  "w-full rounded-md border border-input bg-background px-3 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(CONTROL_BASE, "min-h-20 py-2", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  options: SelectOption[];
  /** Optional leading placeholder option (disabled, value=""). */
  placeholder?: string;
}

export interface CheckboxRowProps {
  id: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
  /** Controlled mode (e.g. a client surface that reveals a dependent block on toggle). Omit for the
   *  default uncontrolled `defaultChecked` usage. */
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Disabled + checked encodes an always-on choice (e.g. Platform messages as system of record). */
  disabled?: boolean;
}

/** A native checkbox + label row (the kit ships no `checkbox` primitive yet — Doc-7B-deferred control).
 *  Buyer Tier-2; promotion candidate the moment a 2nd workspace needs a styled checkbox. */
export function CheckboxRow({
  id,
  label,
  defaultChecked,
  checked,
  onChange,
  disabled,
}: CheckboxRowProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-2 text-sm text-foreground aria-disabled:opacity-70"
      aria-disabled={disabled || undefined}
    >
      <input
        type="checkbox"
        id={id}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 size-4 shrink-0 rounded border-input text-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
      />
      <span>{label}</span>
    </label>
  );
}

// FZ-04 (freeze remediation): the shared radio-input chrome — exported so a caller that needs its OWN
// wrapping element (e.g. a whole card is the label, not just a text row — award-view.tsx's candidate
// cards) can apply the identical style without nesting a second <label> inside one it already owns.
export const RADIO_INPUT_CLASS =
  "size-4 shrink-0 border-input text-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed";

export interface RadioRowProps {
  id: string;
  name: string;
  value: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
  disabled?: boolean;
}

/** A native radio + label row (the kit ships no `radio` primitive yet — Doc-7B-deferred control). Mirrors
 *  `CheckboxRow` exactly. Buyer Tier-2; promotion candidate the moment a 2nd workspace needs a styled
 *  radio. For a caller whose OWN element is already the label (e.g. a selectable card), use
 *  `RADIO_INPUT_CLASS` directly on a bare `<input>` instead — nesting this component's `<label>` inside
 *  another `<label>` would be invalid HTML. */
export function RadioRow({ id, name, value, label, defaultChecked, disabled }: RadioRowProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-1.5 text-sm text-foreground aria-disabled:opacity-70"
      aria-disabled={disabled || undefined}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className={RADIO_INPUT_CLASS}
      />
      {label}
    </label>
  );
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, defaultValue, value, ...props }, ref) => (
    <select
      ref={ref}
      defaultValue={value === undefined ? (defaultValue ?? "") : undefined}
      value={value}
      className={cn(CONTROL_BASE, "h-9 py-1", className)}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = "Select";
