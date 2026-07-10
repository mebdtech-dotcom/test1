// Vendor SHARED — native form-control chrome, consolidated from per-feature copies (W2 maintainability
// refactor 1B; DRY-only, byte-identical output preserved). These mirror the kit Input chrome for the
// controls the FROZEN kit does not yet ship (native <select>/<textarea>, [ESC-7B-*] pending). VENDOR-
// scoped — never a cross-workspace abstraction: the buyer `form-controls.tsx` and any admin equivalent
// stay independent by design. PRESENTATION-ONLY — pure strings + one pure helper (no hooks/state, so
// Server-render-friendly). Single-purpose: form-control class chrome only.

/** Native <select> chrome shared by the vendor company/microsite feature selects. */
export const VENDOR_SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The <textarea> chrome tail (everything after the per-site min-height). Kept private; compose via
 *  `vendorTextareaClass` so every call site emits the exact string it declared inline before. */
const VENDOR_TEXTAREA_TAIL =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Native <textarea> chrome. `minHeight` is a Tailwind min-h utility (the only per-site variance);
 * `disabled: true` appends the shared disabled affordance. Composes byte-for-byte the class string
 * each vendor feature previously declared inline.
 */
export function vendorTextareaClass(minHeight: string, options?: { disabled?: boolean }): string {
  return `${minHeight} ${VENDOR_TEXTAREA_TAIL}${
    options?.disabled ? " disabled:cursor-not-allowed disabled:opacity-60" : ""
  }`;
}
